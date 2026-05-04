'use client'

import type { Benefit, BenefitStatus, ActionPlan, UserCard, CardSettingsMap } from '@/lib/types'
import { CARDS } from '@/lib/data'

interface DashboardProps {
  activeBenefits:  Benefit[]
  benefitStatuses: BenefitStatus[]
  userCards:       UserCard[]
  cardSettings:    CardSettingsMap
  actionPlan:      ActionPlan | null
  planLoading:     boolean
  onGeneratePlan:  () => void
  onGoToCards:     () => void
  today:           Date
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function parseValue(v: string): number | null {
  if (v === 'varies' || v === '0') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function statusBadgeClass(status: string) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border'
  switch (status) {
    case 'used':          return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
    case 'partially_used':return `${base} bg-sky-50 text-sky-700 border-sky-200`
    case 'expiring_soon': return `${base} bg-rose-50 text-rose-700 border-rose-200`
    case 'missed':        return `${base} bg-red-50 text-red-700 border-red-200`
    default:              return `${base} bg-slate-50 text-slate-500 border-slate-200`
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'used':          return 'Used'
    case 'partially_used':return 'Partial'
    case 'expiring_soon': return 'Expiring'
    case 'missed':        return 'Missed'
    default:              return 'Unused'
  }
}

function urgencyBadgeClass(urgency: string) {
  switch (urgency) {
    case 'high':   return 'bg-rose-100 text-rose-700 border border-rose-200'
    case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200'
    default:       return 'bg-sky-100 text-sky-700 border border-sky-200'
  }
}

function urgencyLabel(urgency: string) {
  switch (urgency) {
    case 'high':   return 'Urgent'
    case 'medium': return 'Soon'
    default:       return 'Upcoming'
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, borderColor, icon,
}: {
  label: string; value: string; sub: string; borderColor: string; icon: React.ReactNode
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 num tracking-tight">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  )
}

function ProgressBar({ used, total, status }: { used: number; total: number; status: string }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const fill =
    status === 'used'          ? 'bg-emerald-500' :
    status === 'expiring_soon' ? 'bg-rose-500'    :
    status === 'partially_used'? 'bg-sky-500'     :
    'bg-slate-300'
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-400 mb-1 num">
        <span>${used.toFixed(0)} used</span>
        <span>${total.toFixed(0)} total</span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function Dashboard({
  activeBenefits,
  benefitStatuses,
  userCards,
  cardSettings,
  actionPlan,
  planLoading,
  onGeneratePlan,
  onGoToCards,
}: DashboardProps) {

  const totalAvailable = activeBenefits.reduce((s, b) => s + (parseValue(b.value_amount) ?? 0), 0)
  const totalUsed      = benefitStatuses.reduce((s, b) => s + b.used_amount, 0)
  const totalRemaining = benefitStatuses.reduce((s, b) => s + (b.remaining_value ?? 0), 0)
  const totalBenefits  = activeBenefits.length

  const activeCardIds     = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeCardObjects = CARDS.filter(c => activeCardIds.includes(c.card_id))

  const boaNeedsSetup = activeCardIds.includes('boa_customized_cash') &&
    !cardSettings['boa_customized_cash']?.selected_category

  // Hero: find the single most urgent unclaimed benefit
  const urgentStatuses = benefitStatuses
    .filter(s => (s.status === 'expiring_soon' || s.status === 'unused') && s.days_left >= 0 && (s.remaining_value ?? 0) > 0)
    .sort((a, b) => a.days_left - b.days_left)
  const heroStatus  = urgentStatuses[0]
  const heroBenefit = heroStatus ? activeBenefits.find(b => b.benefit_id === heroStatus.benefit_id) : null

  const pctUsed = totalAvailable > 0 ? Math.min(100, (totalUsed / totalAvailable) * 100) : 0

  // Empty state
  if (userCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="3"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">No cards in your wallet</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Go to <strong className="text-slate-700">My Cards</strong> to add your credit cards and start tracking benefits.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── BofA setup warning ────────────────────────────────── */}
      {boaNeedsSetup && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Bank of America 3% category not selected</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Choose your BofA Customized Cash 3% category to make purchase recommendations accurate.
            </p>
          </div>
          <button
            onClick={onGoToCards}
            className="shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
          >
            Set up
          </button>
        </div>
      )}

      {/* ── Next Best Action Hero ─────────────────────────────── */}
      {heroBenefit && heroStatus && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-24 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-2">
                Next Best Action
              </div>
              <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                {heroBenefit.benefit_name}
              </h2>
              <p className="text-sm text-slate-400 mb-4 truncate">
                {CARDS.find(c => c.card_id === heroBenefit.card_id)?.card_name}
                <span className="mx-1.5">·</span>
                {heroBenefit.merchant_restriction}
              </p>

              {/* Overall wallet progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Wallet progress this period</span>
                  <span className="text-xs text-slate-300 num font-medium">{pctUsed.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${pctUsed}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-500 num">${totalUsed.toFixed(0)} used</span>
                  <span className="text-[10px] text-slate-500 num">${totalAvailable.toFixed(0)} available</span>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="shrink-0 text-right">
              <div className={`text-4xl font-bold num ${heroStatus.days_left <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                {heroStatus.days_left}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">days left</div>
              {(heroStatus.remaining_value ?? 0) > 0 && (
                <div className="mt-2 px-3 py-1 bg-white/10 rounded-lg inline-block">
                  <span className="text-sm font-bold text-white num">
                    ${(heroStatus.remaining_value ?? 0).toFixed(0)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">left</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Available"
          value={`$${totalAvailable.toFixed(0)}`}
          sub="this period"
          borderColor="border-l-amber-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              <line x1="12" y1="6" x2="12" y2="8"/>
              <line x1="12" y1="16" x2="12" y2="18"/>
            </svg>
          }
        />
        <MetricCard
          label="Used"
          value={`$${totalUsed.toFixed(0)}`}
          sub="logged so far"
          borderColor="border-l-emerald-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          }
        />
        <MetricCard
          label="Remaining"
          value={`$${totalRemaining.toFixed(0)}`}
          sub="still claimable"
          borderColor="border-l-sky-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <MetricCard
          label="Benefits"
          value={`${totalBenefits}`}
          sub="across your cards"
          borderColor="border-l-violet-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
        />
      </div>

      {/* ── Benefits by Card ──────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Benefits by Card</h2>
          <span className="text-xs text-slate-400">{activeCardObjects.length} card{activeCardObjects.length !== 1 ? 's' : ''} active</span>
        </div>

        {activeCardObjects.map(card => {
          const cardBenefits = activeBenefits.filter(b => b.card_id === card.card_id)
          const cardStatuses = benefitStatuses.filter(s =>
            cardBenefits.some(b => b.benefit_id === s.benefit_id)
          )
          if (cardBenefits.length === 0) return null

          const cardRemaining = cardStatuses.reduce((s, b) => s + (b.remaining_value ?? 0), 0)

          return (
            <div key={card.card_id} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{card.card_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{card.issuer}</div>
                  </div>
                </div>
                <div className="text-right">
                  {cardRemaining > 0 && (
                    <div className="text-sm font-bold text-slate-900 num">${cardRemaining.toFixed(0)}</div>
                  )}
                  {card.annual_fee > 0 && (
                    <div className="text-[11px] text-slate-400 num">${card.annual_fee}/yr fee</div>
                  )}
                </div>
              </div>

              {/* Benefit rows */}
              <div className="divide-y divide-slate-50">
                {cardBenefits.map(benefit => {
                  const st      = cardStatuses.find(s => s.benefit_id === benefit.benefit_id)
                  const valNum  = parseValue(benefit.value_amount)
                  const usedAmt = st?.used_amount ?? 0

                  return (
                    <div key={benefit.benefit_id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-medium text-slate-800 text-sm">{benefit.benefit_name}</span>
                            {st && (
                              <span className={statusBadgeClass(st.status)}>{statusLabel(st.status)}</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{benefit.merchant_restriction}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-slate-900 num">
                            {benefit.value_amount === 'varies'
                              ? 'Varies'
                              : benefit.value_amount === '0'
                              ? '—'
                              : `$${benefit.value_amount}`}
                          </div>
                          {st && (
                            <div className="text-[11px] text-slate-400 num">
                              {st.days_left >= 0 ? `${st.days_left}d` : 'expired'}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Progress bar for numeric benefits */}
                      {valNum !== null && valNum > 0 && st && (
                        <div className="mt-2.5">
                          <ProgressBar used={usedAmt} total={valNum} status={st.status} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── AI Action Plan ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Action Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Personalized recommendations to maximize your benefits</p>
          </div>
          <button
            onClick={onGeneratePlan}
            disabled={planLoading || activeBenefits.length === 0}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {planLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>
                </svg>
                Generate Plan
              </>
            )}
          </button>
        </div>

        {actionPlan ? (
          <div className="p-5 space-y-5">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed">{actionPlan.monthly_summary}</p>
            </div>

            {/* Priority actions */}
            {actionPlan.priority_actions.length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Priority Actions
                </div>
                <div className="space-y-2">
                  {actionPlan.priority_actions.map((action, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${
                        action.urgency === 'high'
                          ? 'border-rose-200 bg-rose-50'
                          : action.urgency === 'medium'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-sky-200 bg-sky-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${urgencyBadgeClass(action.urgency)}`}>
                              {urgencyLabel(action.urgency)}
                            </span>
                            <span className="text-sm font-bold text-slate-900 num">{action.estimated_value}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 leading-snug">{action.action}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missed value warning */}
            {actionPlan.missed_value_warning && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-sm text-rose-700 font-medium">{actionPlan.missed_value_warning}</p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic leading-relaxed">{actionPlan.safe_disclaimer}</p>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              Click <strong className="text-slate-700">Generate Plan</strong> to get personalized benefit recommendations.
            </p>
            {activeBenefits.length === 0 && (
              <p className="text-xs mt-1.5 text-amber-600">Add cards first to generate a plan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
