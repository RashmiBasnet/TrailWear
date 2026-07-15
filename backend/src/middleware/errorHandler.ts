import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const message = err.errors
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Resource already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Related resource does not exist' });
      return;
    }
  }

  // Unexpected failure: log it in full server-side, but never leak internals
  // (stack, driver messages) to the client.
  logger.error('Unhandled error', {
    err,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id,
  });

  res.status(500).json({ success: false, message: 'Internal server error' });
};
