'use client'

import { useState, useEffect } from 'react'
import type { UserCard, UsageEntry, BenefitStatus, CardSettingsMap } from '@/lib/types'
import { BENEFITS } from '@/lib/data'
import { getUserCards, getUsageLog, addUsageEntry, clearUsageForBenefit, getCardSettings } from '@/lib/db'
import { getBenefitStatus, calculateUsedAmount, getPeriodStart, getDeadline } from '@/lib/benefitEngine'
import { useSubscription } from '@/lib/subscriptionContext'
import BenefitsUsage from '@/components/BenefitsUsage'
import UpgradeGate from '@/components/UpgradeGate'

export default function BenefitsPage() {
  const [userCards,    setUserCards]    = useState<UserCard[]>([])
  const [usageLog,     setUsageLog]     = useState<UsageEntry[]>([])
  const [cardSettings, setCardSettings] = useState<CardSettingsMap>({})
  const [mounted,      setMounted]      = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()
  const today = new Date()

  useEffect(() => {
    async function load() {
      const [cards, log, settings] = await Promise.all([getUserCards(), getUsageLog(), getCardSettings()])
      setUserCards(cards)
      setUsageLog(log)
      setCardSettings(settings)
      setMounted(true)
    }
    load()
  }, [])

  const activeCardIds  = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeBenefits = BENEFITS.filter(b => activeCardIds.includes(b.card_id))
  const benefitStatuses: BenefitStatus[] = activeBenefits.map(b => {
    const periodStart = getPeriodStart(b, today)
    const deadline    = getDeadline(b, today)
    const used        = calculateUsedAmount(b.benefit_id, periodStart, deadline, usageLog)
    return getBenefitStatus(b, used, today, usageLog)
  })

  async function handleUpdateUsage(newLog: UsageEntry[]) {
    // Diff and persist
    const added   = newLog.filter(e => !usageLog.find(o => o.usage_id === e.usage_id))
    for (const entry of added) await addUsageEntry(entry)
    setUsageLog(newLog)
  }

  if (!mounted || subLoading) {
    return <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <UpgradeGate feature="Benefits tracker" isPremium={isPremium}>
      <BenefitsUsage
        activeBenefits={activeBenefits}
        benefitStatuses={benefitStatuses}
        userCards={userCards}
        usageLog={usageLog}
        onUpdateUsage={handleUpdateUsage}
        today={today}
      />
    </UpgradeGate>
  )
}
