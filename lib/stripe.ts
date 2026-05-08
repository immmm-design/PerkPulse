import Stripe from 'stripe'

// Lazy singleton — only instantiated when actually called at request time
// Never called at module load (build-time safe)
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set — add it to your .env.local or Vercel environment variables')
  _stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
  return _stripe
}
