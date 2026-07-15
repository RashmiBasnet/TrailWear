import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from './AppError';

interface BuildFieldsInput {
  totalAmount: string;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

export interface EsewaFormFields {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaCallbackData {
  transaction_code?: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

function sign(message: string): string {
  return crypto.createHmac('sha256', env.ESEWA_SECRET_KEY).update(message).digest('base64');
}

/**
 * Builds the signed form fields to POST to eSewa's hosted payment page.
 */
export function buildPaymentFields(input: BuildFieldsInput): EsewaFormFields {
  const signedFieldNames = 'total_amount,transaction_uuid,product_code';
  const message =
    `total_amount=${input.totalAmount},` +
    `transaction_uuid=${input.transactionUuid},` +
    `product_code=${env.ESEWA_PRODUCT_CODE}`;

  return {
    amount: input.totalAmount,
    tax_amount: '0',
    total_amount: input.totalAmount,
    transaction_uuid: input.transactionUuid,
    product_code: env.ESEWA_PRODUCT_CODE,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: input.successUrl,
    failure_url: input.failureUrl,
    signed_field_names: signedFieldNames,
    signature: sign(message),
  };
}

/**
 * Recomputes the HMAC over the fields eSewa signed and compares it to the
 * signature it returned, proving the callback data was not tampered with.
 */
export function verifyCallbackSignature(data: EsewaCallbackData): boolean {
  const values = data as unknown as Record<string, string>;
  const message = data.signed_field_names
    .split(',')
    .map((field) => `${field}=${values[field] ?? ''}`)
    .join(',');

  const expected = sign(message);

  const a = Buffer.from(expected);
  const b = Buffer.from(data.signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Server-to-server status lookup — the authoritative confirmation that a
 * payment actually completed (cannot be faked by the client).
 */
export async function checkTransactionStatus(
  totalAmount: string,
  transactionUuid: string
): Promise<{ status: string; refId: string | null }> {
  const url =
    `${env.ESEWA_STATUS_URL}?product_code=${encodeURIComponent(env.ESEWA_PRODUCT_CODE)}` +
    `&total_amount=${encodeURIComponent(totalAmount)}` +
    `&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const response = await fetch(url);
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    throw new AppError(502, 'Could not reach eSewa to confirm the payment');
  }

  return {
    status: typeof body.status === 'string' ? body.status : 'UNKNOWN',
    refId: typeof body.ref_id === 'string' ? body.ref_id : null,
  };
}
