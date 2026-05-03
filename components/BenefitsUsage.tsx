'use client'

import { useState } from 'react'
import type { Benefit, BenefitStatus, UsageEntry, UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { format } from 'date-fns'

interface BenefitsUsageProps {
  activeBenefits:  Benefit[]
  benefitStatuses: BenefitStatus[]
  userCards:       UserCard[]
  usageLog:        UsageEntry[]
  onUpdateUsage:   (log: UsageEntry[]) => void
  today:           Date
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function statusBadgeClass(status: string) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border'
  switch (status) {
    case 'used':           return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
    case 'partially_used': return `${base} bg-sky-50 text-sky-700 border-sky-200`
    case 'expiring_soon':  return `${base} bg-rose-50 text-rose-700 border-rose-200`
    case 'missed':         return `${base} bg-red-50 text-red-700 border-red-200`
    default:               return `${base} bg-slate-50 text-slate-500 border-slate-200`
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'used':           return 'Used'
    case 'partially_used': return 'Partial'
    case 'expiring_soon':  return 'Expiring'
    case 'missed':         return 'Missed'
    default:               return 'Unused'
  }
}

function statusLeftBorder(status: string) {
  switch (status) {
    case 'used':           return 'border-l-emerald-400'
    case 'partially_used': return 'border-l-sky-400'
    case 'expiring_soon':  return 'border-l-rose-500'
    case 'missed':         return 'border-l-red-600'
    default:               return 'border-l-slate-200'
  }
}

function progressFill(status: string) {
  switch (status) {
    case 'used':           return 'bg-emerald-500'
    case 'expiring_soon':  return 'bg-rose-500'
    case 'partially_used': return 'bg-sky-500'
    default:               return 'bg-slate-300'
  }
}

function frequencyLabel(freq: string) {
  const map: Record<string, string> = {
    monthly: 'Monthly', semiannual: 'Semiannual', annual: 'Annual',
    quarterly: 'Quarterly', offer_based: 'Offer-based', one_time: 'One-time', unknown: 'Unknown',
  }
  return map[freq] ?? freq
}

// ── Main component ──────────────────────────────────────────────────────────

export default function BenefitsUsage({
  activeBenefits,
  benefitStatuses,
  userCards,
  usageLog,
  onUpdateUsage,
  today,
}: BenefitsUsageProps) {
  const [filterCard,       setFilterCard]       = useState('all')
  const [filterStatus,     setFilterStatus]     = useState('all')
  const [expandedBenefit,  setExpandedBenefit]  = useState<string | null>(null)
  const [logAmount,        setLogAmount]        = useState('')
  const [logDate,          setLogDate]          = useState(format(today, 'yyyy-MM-dd'))
  const [logNote,          setLogNote]          = useState('')

  const activeCardIds = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeCards   = CARDS.filter(c => activeCardIds.includes(c.card_id))

  const filteredBenefits = activeBenefits.filter(b => {
    if (filterCard !== 'all' && b.card_id !== filterCard) return false
    if (filterStatus !== 'all') {
      const st = benefitStatuses.find(s => s.benefit_id === b.benefit_id)
      if (!st || st.status !== filterStatus) return false
    }
    return true
  })

  function handleLogUsage(benefit: Benefit) {
    const amount = parseFloat(logAmount)
    if (isNaN(amount) || amount <= 0) return
    onUpdateUsage([...usageLog, {
      usage_id:   `usage_${benefit.benefit_id}_${Date.now()}`,
      benefit_id: benefit.benefit_id,
      card_id:    benefit.card_id,
      usage_date: logDate,
      amount_used: amount,
      user_note:  logNote.trim() || undefined,
    }])
    setLogAmount('')
    setLogNote('')
    setExpandedBenefit(null)
  }

  function handleMarkFullyUsed(benefit: Benefit, status: BenefitStatus) {
    if (status.remaining_value === null || status.remaining_value <= 0) return
    onUpdateUsage([...usageLog, {
      usage_id:    `usage_${benefit.benefit_id}_${Date.now()}`,
      benefit_id:  benefit.benefit_id,
      card_id:     benefit.card_id,
      usage_date:  logDate,
      amount_used: status.remaining_value,
      user_note:   'Marked as fully used',
    }])
  }

  function handleDeleteUsage(usage_id: string) {
    onUpdateUsage(usageLog.filter(e => e.usage_id !== usage_id))
  }

  // Empty state
  if (activeBenefits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500">Add cards in <strong className="text-slate-700">My Cards</strong> to see and track benefits here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card px-4 py-3">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Card</label>
            <select
              value={filterCard}
              onChange={e => setFilterCard(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Cards</option>
              {activeCards.map(c => (
                <option key={c.card_id} value={c.card_id}>{c.card_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="unused">Unused</option>
              <option value="partially_used">Partial</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="used">Used</option>
              <option value="missed">Missed</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-slate-400 self-center pb-0.5">
            {filteredBenefits.length} benefit{filteredBenefits.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Benefits list ───────────────────────────────────── */}
      {filteredBenefits.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-card px-5 py-10 text-center text-sm text-slate-400">
          No benefits match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBenefits.map(benefit => {
            const st     = benefitStatuses.find(s => s.benefit_id === benefit.benefit_id)
            const card   = CARDS.find(c => c.card_id === benefit.card_id)
            const isOpen = expandedBenefit === benefit.benefit_id
            const entries = usageLog.filter(e => e.benefit_id === benefit.benefit_id)
            const valNum  = (benefit.value_amount !== 'varies' && benefit.value_amount !== '0')
              ? parseFloat(benefit.value_amount) : null
            const usedAmt = st?.used_amount ?? 0
            const pct     = valNum && valNum > 0 ? Math.min(100, (usedAmt / valNum) * 100) : 0

            return (
              <div
                key={benefit.benefit_id}
                className={`bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden border-l-4 ${
                  statusLeftBorder(st?.status ?? 'unused')
                }`}
              >
                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-slate-900 text-sm">{benefit.benefit_name}</span>
                        {st && <span className={statusBadgeClass(st.status)}>{statusLabel(st.status)}</span>}
                        {benefit.requires_enrollment && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-violet-50 text-violet-600 border-violet-200">
                            Enrollment req.
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{card?.card_name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {st && st.remaining_value !== null && (
                        <div className="text-lg font-bold text-slate-900 num">${st.remaining_value.toFixed(0)}</div>
                      )}
                      {st && (
                        <div className="text-[11px] text-slate-400 num">
                          {st.days_left >= 0 ? `${st.days_left}d left` : 'expired'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {valNum !== null && valNum > 0 && st && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressFill(st.status)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 num">
                        <span>${usedAmt.toFixed(0)} used</span>
                        <span>${valNum.toFixed(0)} total</span>
                      </div>
                    </div>
                  )}

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-500 mb-3">
                    <div>
                      <span className="font-semibold text-slate-600">Frequency: </span>
                      {frequencyLabel(benefit.frequency)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Where: </span>
                      <span className="truncate">{benefit.merchant_restriction}</span>
                    </div>
                    {st && (
                      <div>
                        <span className="font-semibold text-slate-600">Deadline: </span>
                        <span className="num">{st.deadline}</span>
                      </div>
                    )}
                  </div>

                  {benefit.notes && (
                    <p className="text-xs text-slate-400 italic mb-3 leading-relaxed">{benefit.notes}</p>
                  )}

                  {/* Usage history */}
                  {entries.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Usage history</div>
                      <div className="space-y-1">
                        {entries.map(entry => (
                          <div key={entry.usage_id} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                            <span className="num">
                              {entry.usage_date} — <strong className="text-slate-700">${entry.amount_used.toFixed(2)}</strong>
                              {entry.user_note && ` · ${entry.user_note}`}
                            </span>
                            <button
                              onClick={() => handleDeleteUsage(entry.usage_id)}
                              className="ml-3 text-slate-300 hover:text-rose-500 transition-colors font-bold text-sm leading-none"
                              title="Remove entry"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setExpandedBenefit(isOpen ? null : benefit.benefit_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                    >
                      {isOpen ? 'Cancel' : '+ Log Usage'}
                    </button>
                    {st && st.remaining_value !== null && st.remaining_value > 0 && (
                      <button
                        onClick={() => handleMarkFullyUsed(benefit, st)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors num"
                      >
                        Mark Used (${st.remaining_value.toFixed(0)})
                      </button>
                    )}
                  </div>

                  {/* Expanded log form */}
                  {isOpen && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Log Usage</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Amount ($)</label>
                          <input
                            type="number"
                            value={logAmount}
                            onChange={e => setLogAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white num"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Date</label>
                          <input
                            type="date"
                            value={logDate}
                            onChange={e => setLogDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Note</label>
                          <input
                            type="text"
                            value={logNote}
                            onChange={e => setLogNote(e.target.value)}
                            placeholder="e.g. Uber Eats"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleLogUsage(benefit)}
                        disabled={!logAmount || parseFloat(logAmount) <= 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Save Entry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
