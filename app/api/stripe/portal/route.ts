import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getServerUser } from '@/lib/supabaseServer'
import { getUserSubscription } from '@/lib/subscription'

export async function POST() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sub = await getUserSubscription(user.id)
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing record found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await getStripe().billingPortal.sessions.create({
    customer:   sub.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  })

  return NextResponse.json({ url: session.url })
}
