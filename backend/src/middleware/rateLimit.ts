import rateLimit from 'express-rate-limit';

const message = (text: string) => ({ success: false, message: text });

/**
 * Broad backstop for the whole API. Sized so ordinary browsing (and a chatty
 * dev frontend) never trips it, while still capping scripted abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many requests. Please try again later.'),
});

/**
 * Brute-force guard for credential endpoints. Successful logins are not
 * counted, so only failed attempts burn the budget and a legitimate user is
 * never locked out by their own normal activity.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many login attempts. Please try again in 15 minutes.'),
});

/** Order placement and payment verification are expensive and side-effectful. */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many order requests. Please slow down and try again.'),
});
