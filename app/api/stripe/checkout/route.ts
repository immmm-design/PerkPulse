import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getServerUser } from '@/lib/supabaseServer'
import { ensureStripeCustomer } from '@/lib/subscription'

export async function POST() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!priceId) {
    return NextResponse.json({ error: 'STRIPE_PRICE_ID_MONTHLY is not set' }, { status: 500 })
  }

  const customerId = await ensureStripeCustomer(user.id, user.email ?? '')

  const session = await getStripe().checkout.sessions.create({
    customer:              customerId,
    mode:                  'subscription',
    payment_method_types:  ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url:           `${appUrl}/billing?checkout=success`,
    cancel_url:            `${appUrl}/upgrade?checkout=canceled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  })

  return NextResponse.json({ url: session.url })
}
