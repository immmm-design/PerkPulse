'use client'

import { useState, useEffect } from 'react'
import type { UserCard } from '@/lib/types'
import { BENEFITS } from '@/lib/data'
import { getUserCards } from '@/lib/db'
import { getAllUpcomingReminders } from '@/lib/reminderEngine'
import { useSubscription } from '@/lib/subscriptionContext'
import Reminders from '@/components/Reminders'
import UpgradeGate from '@/components/UpgradeGate'

export default function RemindersPage() {
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [mounted,   setMounted]   = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()
  const today = new Date()

  useEffect(() => {
    getUserCards().then(cards => { setUserCards(cards); setMounted(true) })
  }, [])

  const activeCardIds  = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeBenefits = BENEFITS.filter(b => activeCardIds.includes(b.card_id))
  const reminders      = getAllUpcomingReminders(activeBenefits, today)

  if (!mounted || subLoading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <UpgradeGate feature="Reminders" isPremium={isPremium}>
      <Reminders reminders={reminders} />
    </UpgradeGate>
  )
}
