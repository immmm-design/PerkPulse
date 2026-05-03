'use client'

import { useState, useEffect } from 'react'
import type { UserCard, UsageEntry, OfferUpdate, BenefitStatus, ActionPlan } from '@/lib/types'
import { BENEFITS } from '@/lib/data'
import { getUserCards, saveUserCards, getUsageLog, saveUsageLog, getOfferUpdates, saveOfferUpdates } from '@/lib/storage'
import { getBenefitStatus, calculateUsedAmount, getPeriodStart, getDeadline } from '@/lib/benefitEngine'
import { getAllUpcomingReminders } from '@/lib/reminderEngine'
import { format } from 'date-fns'

import Dashboard from '@/components/Dashboard'
import MyCards from '@/components/MyCards'
import BenefitsUsage from '@/components/BenefitsUsage'
import Reminders from '@/components/Reminders'
import PurchaseAdvisor from '@/components/PurchaseAdvisor'
import AddBenefit from '@/components/AddBenefit'

const TABS = [
  { label: 'Dashboard', emoji: '📊', id: 'dashboard' },
  { label: 'My Cards', emoji: '💳', id: 'cards' },
  { label: 'Benefits & Usage', emoji: '✅', id: 'benefits' },
  { label: 'Reminders', emoji: '🔔', id: 'reminders' },
  { label: 'Purchase Advisor', emoji: '🛒', id: 'advisor' },
  { label: 'Add Benefit', emoji: '➕', id: 'add' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [usageLog, setUsageLog] = useState<UsageEntry[]>([])
  const [offerUpdates, setOfferUpdates] = useState<OfferUpdate[]>([])
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const today = new Date()

  useEffect(() => {
    setUserCards(getUserCards())
    setUsageLog(getUsageLog())
    setOfferUpdates(getOfferUpdates())
    setMounted(true)
  }, [])

  // Derived state
  const activeCardIds = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeBenefits = BENEFITS.filter(b => activeCardIds.includes(b.card_id))
  const benefitStatuses: BenefitStatus[] = activeBenefits.map(b => {
    const periodStart = getPeriodStart(b, today)
    const deadline = getDeadline(b, today)
    const used = calculateUsedAmount(b.benefit_id, periodStart, deadline, usageLog)
    return getBenefitStatus(b, used, today, usageLog)
  })
  const reminders = getAllUpcomingReminders(activeBenefits, today)
  const highUrgencyBenefitIds = reminders.filter(r => r.urgency === 'high').map(r => r.benefit_id)
  const highUrgencyCount = highUrgencyBenefitIds.filter((id, idx) => highUrgencyBenefitIds.indexOf(id) === idx).length

  // Persist helpers
  const updateUserCards = (cards: UserCard[]) => {
    setUserCards(cards)
    saveUserCards(cards)
  }
  const updateUsageLog = (log: UsageEntry[]) => {
    setUsageLog(log)
    saveUsageLog(log)
  }
  const updateOfferUpdates = (updates: OfferUpdate[]) => {
    setOfferUpdates(updates)
    saveOfferUpdates(updates)
  }

  const fetchActionPlan = async () => {
    setPlanLoading(true)
    try {
      const res = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          benefits: activeBenefits,
          statuses: benefitStatuses,
          today: format(today, 'yyyy-MM-dd'),
        }),
      })
      const data = await res.json()
      setActionPlan(data.plan)
    } catch {
      // silently fail — plan stays null
    } finally {
      setPlanLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading PerkPulse...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💳</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PerkPulse AI</h1>
              <p className="text-purple-200 text-xs">Credit Card Benefit Tracker</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-purple-200 text-xs">{format(today, 'MMMM d, yyyy')}</div>
            {activeBenefits.length > 0 && (
              <div className="text-amber-300 text-xs font-medium mt-0.5">
                {activeBenefits.length} benefit{activeBenefits.length !== 1 ? 's' : ''} tracked
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-hide" role="tablist">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all relative shrink-0 ${
                  activeTab === i
                    ? 'text-purple-700 border-b-2 border-purple-600'
                    : 'text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {/* Urgency badge on Reminders tab */}
                {tab.id === 'reminders' && highUrgencyCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold leading-none">
                    {highUrgencyCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 0 && (
          <Dashboard
            activeBenefits={activeBenefits}
            benefitStatuses={benefitStatuses}
            userCards={userCards}
            actionPlan={actionPlan}
            planLoading={planLoading}
            onGeneratePlan={fetchActionPlan}
            today={today}
          />
        )}
        {activeTab === 1 && (
          <MyCards
            userCards={userCards}
            onUpdate={updateUserCards}
          />
        )}
        {activeTab === 2 && (
          <BenefitsUsage
            activeBenefits={activeBenefits}
            benefitStatuses={benefitStatuses}
            userCards={userCards}
            usageLog={usageLog}
            onUpdateUsage={updateUsageLog}
            today={today}
          />
        )}
        {activeTab === 3 && (
          <Reminders reminders={reminders} />
        )}
        {activeTab === 4 && (
          <PurchaseAdvisor userCards={userCards} />
        )}
        {activeTab === 5 && (
          <AddBenefit />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-slate-400 space-y-1">
        <p>PerkPulse AI — All data stored locally in your browser. No account numbers or sensitive data collected.</p>
        <p>Benefit data is for demonstration purposes. Always verify eligibility in your issuer portal.</p>
        <p className="text-purple-400">
          Built with Next.js 14 · TypeScript · Tailwind CSS
        </p>
      </footer>
    </div>
  )
}
