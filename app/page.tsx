'use client'

import { useState, useEffect } from 'react'
import type { UserCard, UsageEntry, OfferUpdate, BenefitStatus, ActionPlan, AuthUser, CardSettingsMap } from '@/lib/types'
import { BENEFITS } from '@/lib/data'
import { getUserCards, saveUserCards, getUsageLog, saveUsageLog, getOfferUpdates, saveOfferUpdates, getCardSettings, saveCardSettings } from '@/lib/storage'
import { getBenefitStatus, calculateUsedAmount, getPeriodStart, getDeadline } from '@/lib/benefitEngine'
import { getAllUpcomingReminders } from '@/lib/reminderEngine'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getUser, signOut, onAuthStateChange } from '@/lib/auth'
import { format } from 'date-fns'

import Dashboard from '@/components/Dashboard'
import MyCards from '@/components/MyCards'
import BenefitsUsage from '@/components/BenefitsUsage'
import Reminders from '@/components/Reminders'
import PurchaseAdvisor from '@/components/PurchaseAdvisor'
import AddBenefit from '@/components/AddBenefit'
import LoginPage from '@/components/LoginPage'

const TABS = [
  { label: 'Overview',       id: 'dashboard' },
  { label: 'My Cards',       id: 'cards' },
  { label: 'Benefits',       id: 'benefits' },
  { label: 'Reminders',      id: 'reminders' },
  { label: 'Advisor',        id: 'advisor' },
  { label: 'Benefit Parser', id: 'add' },
]

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="3" ry="3"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <line x1="6" y1="15" x2="9" y2="15"/>
        <line x1="12" y1="15" x2="15" y2="15"/>
      </svg>
    </div>
  )
}

export default function Home() {
  const [activeTab,     setActiveTab]     = useState(0)
  const [userCards,     setUserCards]     = useState<UserCard[]>([])
  const [usageLog,      setUsageLog]      = useState<UsageEntry[]>([])
  const [offerUpdates,  setOfferUpdates]  = useState<OfferUpdate[]>([])
  const [cardSettings,  setCardSettings]  = useState<CardSettingsMap>({})
  const [actionPlan,    setActionPlan]    = useState<ActionPlan | null>(null)
  const [planLoading,   setPlanLoading]   = useState(false)
  const [authUser,      setAuthUser]      = useState<AuthUser | null>(null)
  const [authLoading,   setAuthLoading]   = useState(true)
  const [mounted,       setMounted]       = useState(false)

  const today = new Date()
  const supabaseConfigured = isSupabaseConfigured()

  useEffect(() => {
    setUserCards(getUserCards())
    setUsageLog(getUsageLog())
    setOfferUpdates(getOfferUpdates())
    setCardSettings(getCardSettings())
    setMounted(true)

    if (supabaseConfigured) {
      getUser().then(user => {
        setAuthUser(user)
        setAuthLoading(false)
      })
      const unsubscribe = onAuthStateChange(user => {
        setAuthUser(user)
        setAuthLoading(false)
      })
      return unsubscribe
    } else {
      setAuthLoading(false)
    }
  }, [supabaseConfigured])

  const activeCardIds   = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeBenefits  = BENEFITS.filter(b => activeCardIds.includes(b.card_id))
  const benefitStatuses: BenefitStatus[] = activeBenefits.map(b => {
    const periodStart = getPeriodStart(b, today)
    const deadline    = getDeadline(b, today)
    const used        = calculateUsedAmount(b.benefit_id, periodStart, deadline, usageLog)
    return getBenefitStatus(b, used, today, usageLog)
  })
  const reminders        = getAllUpcomingReminders(activeBenefits, today)
  const highUrgencyIds   = reminders.filter(r => r.urgency === 'high').map(r => r.benefit_id)
  const highUrgencyCount = highUrgencyIds.filter((id, i) => highUrgencyIds.indexOf(id) === i).length

  const updateUserCards    = (cards: UserCard[])   => { setUserCards(cards);    saveUserCards(cards) }
  const updateUsageLog     = (log: UsageEntry[])   => { setUsageLog(log);       saveUsageLog(log) }
  const updateOfferUpdates = (u: OfferUpdate[])    => { setOfferUpdates(u);     saveOfferUpdates(u) }
  const updateCardSettings = (s: CardSettingsMap)  => { setCardSettings(s);     saveCardSettings(s) }

  const fetchActionPlan = async () => {
    setPlanLoading(true)
    try {
      const res  = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefits: activeBenefits, statuses: benefitStatuses, today: format(today, 'yyyy-MM-dd') }),
      })
      const data = await res.json()
      setActionPlan(data.plan)
    } catch { /* silently fail */ }
    finally { setPlanLoading(false) }
  }

  async function handleSignOut() {
    await signOut()
    setAuthUser(null)
  }

  // Loading spinner while initializing
  if (!mounted || (supabaseConfigured && authLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Loading your wallet…</p>
        </div>
      </div>
    )
  }

  // Show login if Supabase is configured but no user is authenticated
  if (supabaseConfigured && !authUser) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── App Header ────────────────────────────────────────── */}
      <header className="bg-slate-900 text-white shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <span className="text-base font-bold tracking-tight">PerkPulse</span>
              <span className="hidden sm:inline text-slate-500 text-xs font-medium ml-2">by CardWise Labs</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeBenefits.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>{activeBenefits.length} benefits tracked</span>
              </div>
            )}
            {authUser && (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-xs text-slate-400 truncate max-w-[160px]">{authUser.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
            <div className="text-xs text-slate-500 tabular-nums">{format(today, 'MMM d, yyyy')}</div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex overflow-x-auto scrollbar-hide gap-0.5" role="tablist" aria-label="App sections">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === i}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(i)}
                className={[
                  'relative shrink-0 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                  activeTab === i ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {tab.label}
                {tab.id === 'reminders' && highUrgencyCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[10px] leading-none rounded-full font-bold">
                    {highUrgencyCount}
                  </span>
                )}
                {activeTab === i && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6" id={`panel-${TABS[activeTab].id}`}>
        {activeTab === 0 && (
          <Dashboard
            activeBenefits={activeBenefits}
            benefitStatuses={benefitStatuses}
            userCards={userCards}
            cardSettings={cardSettings}
            actionPlan={actionPlan}
            planLoading={planLoading}
            onGeneratePlan={fetchActionPlan}
            onGoToCards={() => setActiveTab(1)}
            today={today}
          />
        )}
        {activeTab === 1 && (
          <MyCards
            userCards={userCards}
            cardSettings={cardSettings}
            onUpdate={updateUserCards}
            onSettingsUpdate={updateCardSettings}
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
        {activeTab === 3 && <Reminders reminders={reminders} />}
        {activeTab === 4 && <PurchaseAdvisor userCards={userCards} cardSettings={cardSettings} />}
        {activeTab === 5 && <AddBenefit />}
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 mt-2 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          All data stored locally in your browser — no account numbers or sensitive data collected.
          <span className="mx-1.5">·</span>
          Benefit data is for demonstration purposes. Always verify eligibility in your issuer portal.
        </p>
      </footer>
    </div>
  )
}
