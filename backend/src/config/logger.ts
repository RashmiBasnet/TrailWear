import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from './env';

const LOG_DIR = path.join(__dirname, '../../logs');

const structured = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const readable = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${message}${rest}`;
  })
);

/** General application logger: operational events and errors. */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: structured,
  defaultMeta: { service: 'trailwear-api' },
  transports: [
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  ],
});

/**
 * Audit trail logger, kept separate from application noise: it has its own file
 * and a much longer retention, so admin activity can't be rotated away by a
 * burst of ordinary logs.
 */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: structured,
  defaultMeta: { service: 'trailwear-audit' },
  transports: [
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '365d',
      zippedArchive: true,
    }),
  ],
});

if (env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: readable }));
  auditLogger.add(new winston.transports.Console({ format: readable }));
}
