import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Server-only Stripe client. Lazily instantiated so build-time imports
 * without STRIPE_SECRET_KEY don't crash.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
  return _stripe;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  return secret;
}

export function getPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error('Missing STRIPE_PRICE_ID');
  return priceId;
}
