import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+\s*[smhd]?$/, "JWT_EXPIRES_IN must look like '30d', '12h' or '900'")
    .default('30d'),
  // Master key for AES-256-GCM encryption of data at rest: TOTP secrets and the
  // identifying parts of a delivery address. One key rather than one per field —
  // rotating it means re-encrypting every affected row, so keep it in one place.
  DATA_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'DATA_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),
  RECAPTCHA_SECRET_KEY: z.string().default('6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:3000/api/auth/google/callback'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_TO_CONSOLE: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default('false'),
  PORT: z.coerce.number().int().positive().default(5000),
  // Paths to a TLS key/cert pair (e.g. from mkcert). When BOTH are set and
  // readable the API is served over HTTPS; otherwise it falls back to HTTP.
  // Whoever calls this API over HTTPS (the Next server) must trust the issuing
  // CA — for mkcert, point that process's NODE_EXTRA_CA_CERTS at its rootCA.pem.
  SSL_KEY_PATH: z.string().optional(),
  SSL_CERT_PATH: z.string().optional(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  ESEWA_SECRET_KEY: z.string().default('8gBm/:&EnhH.1/q'),
  ESEWA_PRODUCT_CODE: z.string().default('EPAYTEST'),
  ESEWA_FORM_URL: z
    .string()
    .url()
    .default('https://rc-epay.esewa.com.np/api/epay/main/v2/form'),
  ESEWA_STATUS_URL: z
    .string()
    .url()
    .default('https://rc.esewa.com.np/api/epay/transaction/status/'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
