import nodemailer from 'nodemailer';
import { env } from './env';
import { AppError } from '../utils/AppError';
import { logger } from './logger';

export const SMTP_USER: string = env.SMTP_USER || '';
export const SMTP_PASS: string = env.SMTP_PASS || '';
export const SMTP_FROM: string =
  env.SMTP_FROM || `TrailWear <${env.SMTP_USER || 'no-reply@trailwear.com'}>`;

let transporter: nodemailer.Transporter | null = null;

export function isConfigured(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

const getTransporter = () => {
  if (!isConfigured()) {
    throw new AppError(500, 'Email service is not configured');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  await getTransporter().sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
    text,
  });

  logger.info('Email sent', { to, subject });
};
