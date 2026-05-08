'use client'

import { useState, useEffect } from 'react'
import type { UserCard, CardSettingsMap } from '@/lib/types'
import { getUserCards, getCardSettings } from '@/lib/db'
import { useSubscription } from '@/lib/subscriptionContext'
import PurchaseAdvisor from '@/components/PurchaseAdvisor'
import UpgradeGate from '@/components/UpgradeGate'

export default function AdvisorPage() {
  const [userCards,    setUserCards]    = useState<UserCard[]>([])
  const [cardSettings, setCardSettings] = useState<CardSettingsMap>({})
  const [mounted,      setMounted]      = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()

  useEffect(() => {
    async function load() {
      const [cards, settings] = await Promise.all([getUserCards(), getCardSettings()])
      setUserCards(cards)
      setCardSettings(settings)
      setMounted(true)
    }
    load()
  }, [])

  if (!mounted || subLoading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <UpgradeGate feature="Purchase Advisor" isPremium={isPremium}>
      <PurchaseAdvisor userCards={userCards} cardSettings={cardSettings} />
    </UpgradeGate>
  )
}
