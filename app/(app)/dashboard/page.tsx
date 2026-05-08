'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UserCard, UsageEntry, BenefitStatus, ActionPlan, CardSettingsMap } from '@/lib/types'
import { BENEFITS } from '@/lib/data'
import { getUserCards, getUsageLog, getCardSettings } from '@/lib/db'
import { getBenefitStatus, calculateUsedAmount, getPeriodStart, getDeadline } from '@/lib/benefitEngine'
import { useSubscription } from '@/lib/subscriptionContext'
import { format } from 'date-fns'
import Dashboard from '@/components/Dashboard'
import SubscriptionCard from '@/components/SubscriptionCard'
import UpgradeGate from '@/components/UpgradeGate'

export default function DashboardPage() {
  const [userCards,    setUserCards]    = useState<UserCard[]>([])
  const [usageLog,     setUsageLog]     = useState<UsageEntry[]>([])
  const [cardSettings, setCardSettings] = useState<CardSettingsMap>({})
  const [actionPlan,   setActionPlan]   = useState<ActionPlan | null>(null)
  const [planLoading,  setPlanLoading]  = useState(false)
  const [mounted,      setMounted]      = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()
  const router = useRouter()

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

  const fetchActionPlan = async () => {
    if (!isPremium) return
    setPlanLoading(true)
    try {
      const res  = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefits: activeBenefits, statuses: benefitStatuses, today: format(today, 'yyyy-MM-dd') }),
      })
      const data = await res.json()
      if (data.plan) setActionPlan(data.plan)
    } catch { /* silently fail */ }
    finally { setPlanLoading(false) }
  }

  if (!mounted || subLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SubscriptionCard />
      <UpgradeGate feature="Dashboard" isPremium={isPremium}>
        <Dashboard
          activeBenefits={activeBenefits}
          benefitStatuses={benefitStatuses}
          userCards={userCards}
          cardSettings={cardSettings}
          actionPlan={actionPlan}
          planLoading={planLoading}
          onGeneratePlan={fetchActionPlan}
          onGoToCards={() => router.push('/cards')}
          today={today}
        />
      </UpgradeGate>
    </div>
  )
}
