import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/supabaseServer'
import { getUserSubscription, isUserPremium, getTrialDaysRemaining } from '@/lib/subscription'

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [sub, premium, trialDays] = await Promise.all([
    getUserSubscription(user.id),
    isUserPremium(user.id),
    getTrialDaysRemaining(user.id),
  ])

  return NextResponse.json({
    subscription: sub,
    isPremium:    premium,
    trialDays,
  })
}
