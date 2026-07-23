import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { isUsingTestKeys } from './services/captcha.service';
import { isConfigured as isGoogleConfigured } from './services/google.service';
import { isConfigured as isEmailConfigured } from './config/email';
import { UPLOAD_DIR } from './middleware/upload';
import authRoutes from './routes/auth.routes';
import mfaRoutes from './routes/mfa.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import profileRoutes from './routes/profile.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        imgSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api', apiLimiter);

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/auth/mfa', mfaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

/**
 * Serves over HTTPS when a TLS key/cert pair is configured and readable, and
 * falls back to HTTP otherwise, so a missing cert degrades rather than crashes.
 * A cert that is set but unreadable is treated as a misconfiguration worth
 * shouting about rather than silently downgrading.
 */
function createServer(): { server: http.Server; protocol: 'http' | 'https' } {
  if (env.SSL_KEY_PATH && env.SSL_CERT_PATH) {
    try {
      const key = fs.readFileSync(env.SSL_KEY_PATH);
      const cert = fs.readFileSync(env.SSL_CERT_PATH);
      return { server: https.createServer({ key, cert }, app), protocol: 'https' };
    } catch (err) {
      logger.error('SSL_KEY_PATH/SSL_CERT_PATH are set but could not be read — serving HTTP', {
        reason: err instanceof Error ? err.message : 'unknown',
      });
    }
  }
  return { server: http.createServer(app), protocol: 'http' };
}

const { server, protocol } = createServer();

server.listen(env.PORT, () => {
  logger.info(`TrailWear API listening on ${protocol}://localhost:${env.PORT}`, {
    env: env.NODE_ENV,
  });

  if (isUsingTestKeys()) {
    const message =
      'reCAPTCHA is using Google test keys — every challenge will pass. Set RECAPTCHA_SECRET_KEY for real protection.';
    if (env.NODE_ENV === 'production') {
      logger.error(message);
    } else {
      logger.warn(message);
    }
  }

  if (!isGoogleConfigured()) {
    logger.warn(
      'Google sign-in is disabled — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.'
    );
  }

  if (!isEmailConfigured()) {
    const message =
      'SMTP is not configured — new accounts are auto-verified without proving their email. Set SMTP_USER and SMTP_PASS.';
    if (env.NODE_ENV === 'production') {
      logger.error(message);
    } else {
      logger.warn(message);
    }
  }
});
