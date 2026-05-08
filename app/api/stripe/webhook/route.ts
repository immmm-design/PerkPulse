import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabaseServer'
import { syncStripeSubscriptionToSupabase as syncSub } from '@/lib/subscription'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')
  const secret    = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
          await syncSub(session.customer as string, sub)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        await syncSub(sub.customer as string, sub)
        break
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        await syncSub(sub.customer as string, { ...sub, status: 'canceled' })
        break
      }

      case 'invoice.payment_failed':
      case 'invoice.payment_succeeded': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        if (invoice.subscription) {
          const sub = await getStripe().subscriptions.retrieve(invoice.subscription as string)
          await syncSub(invoice.customer as string, sub)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
