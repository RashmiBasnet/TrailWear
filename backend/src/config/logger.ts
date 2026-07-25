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

if (env.LOG_TO_CONSOLE || env.NODE_ENV !== 'production') {
  const consoleFormat = env.NODE_ENV === 'production' ? structured : readable;
  logger.add(new winston.transports.Console({ format: consoleFormat }));
  auditLogger.add(new winston.transports.Console({ format: consoleFormat }));
}
