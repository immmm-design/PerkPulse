import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from './supabaseServer'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'expired'

export interface SubscriptionRecord {
  user_id:                string
  stripe_customer_id:     string | null
  stripe_subscription_id: string | null
  subscription_status:    SubscriptionStatus
  trial_start:            string
  trial_end:              string
  current_period_start:   string | null
  current_period_end:     string | null
  cancel_at_period_end:   boolean
  created_at:             string
  updated_at:             string
}

export async function getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (data) return data as SubscriptionRecord

  // Auto-create a trial row if missing (defensive — handles users who signed up before the trigger was added)
  const trialStart = new Date()
  const trialEnd   = new Date(trialStart.getTime() + 30 * 86_400_000)
  const { data: created } = await db
    .from('subscriptions')
    .insert({
      user_id:             userId,
      subscription_status: 'trialing',
      trial_start:         trialStart.toISOString(),
      trial_end:           trialEnd.toISOString(),
    })
    .select()
    .single()

  return (created as SubscriptionRecord) ?? null
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  if (!sub) return false

  const now = new Date()

  if (sub.subscription_status === 'trialing') {
    return new Date(sub.trial_end) > now
  }

  if (sub.subscription_status === 'active') return true

  // Canceled but still within paid period
  if (sub.subscription_status === 'canceled' && sub.current_period_end) {
    return new Date(sub.current_period_end) > now
  }

  return false
}

export async function getTrialDaysRemaining(userId: string): Promise<number> {
  const sub = await getUserSubscription(userId)
  if (!sub || sub.subscription_status !== 'trialing') return 0
  const ms = new Date(sub.trial_end).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export async function syncStripeSubscriptionToSupabase(
  stripeCustomerId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stripeSub: any
): Promise<void> {
  const db = getSupabaseAdmin()

  // Find the user by stripe_customer_id
  const { data: existing } = await db
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (!existing) return

  await db
    .from('subscriptions')
    .update({
      stripe_subscription_id: stripeSub.id,
      subscription_status:    stripeSub.status as SubscriptionStatus,
      current_period_start:   new Date(stripeSub.current_period_start * 1000).toISOString(),
      current_period_end:     new Date(stripeSub.current_period_end   * 1000).toISOString(),
      cancel_at_period_end:   stripeSub.cancel_at_period_end ?? false,
      updated_at:             new Date().toISOString(),
    })
    .eq('user_id', existing.user_id)
}

export async function ensureStripeCustomer(userId: string, email: string): Promise<string> {
  const db  = getSupabaseAdmin()
  const sub = await getUserSubscription(userId)

  if (sub?.stripe_customer_id) return sub.stripe_customer_id

  // Create a new Stripe customer
  const { getStripe } = await import('./stripe')
  const stripe = getStripe()
  const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } })

  await db
    .from('subscriptions')
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  return customer.id
}
