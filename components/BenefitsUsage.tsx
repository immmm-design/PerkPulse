'use client'

import { useState } from 'react'
import type { Benefit, BenefitStatus, UsageEntry, UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { format } from 'date-fns'

interface BenefitsUsageProps {
  activeBenefits: Benefit[]
  benefitStatuses: BenefitStatus[]
  userCards: UserCard[]
  usageLog: UsageEntry[]
  onUpdateUsage: (log: UsageEntry[]) => void
  today: Date
}

function statusBadge(status: string) {
  switch (status) {
    case 'used':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Used</span>
    case 'partially_used':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Partial</span>
    case 'expiring_soon':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expiring Soon</span>
    case 'missed':
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-900 text-rose-100">Missed</span>
    default:
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Unused</span>
  }
}

function frequencyLabel(freq: string) {
  const labels: Record<string, string> = {
    monthly: 'Monthly',
    semiannual: 'Semiannual',
    annual: 'Annual',
    quarterly: 'Quarterly',
    offer_based: 'Offer-based',
    one_time: 'One-time',
    unknown: 'Unknown',
  }
  return labels[freq] ?? freq
}

export default function BenefitsUsage({
  activeBenefits,
  benefitStatuses,
  userCards,
  usageLog,
  onUpdateUsage,
  today,
}: BenefitsUsageProps) {
  const [filterCard, setFilterCard] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null)
  const [logAmount, setLogAmount] = useState('')
  const [logDate, setLogDate] = useState(format(today, 'yyyy-MM-dd'))
  const [logNote, setLogNote] = useState('')

  const activeCardIds = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeCards = CARDS.filter(c => activeCardIds.includes(c.card_id))

  const filteredBenefits = activeBenefits.filter(b => {
    if (filterCard !== 'all' && b.card_id !== filterCard) return false
    if (filterStatus !== 'all') {
      const status = benefitStatuses.find(s => s.benefit_id === b.benefit_id)
      if (!status || status.status !== filterStatus) return false
    }
    return true
  })

  function handleLogUsage(benefit: Benefit, status: BenefitStatus | undefined) {
    const amount = parseFloat(logAmount)
    if (isNaN(amount) || amount <= 0) return

    const entry: UsageEntry = {
      usage_id: `usage_${benefit.benefit_id}_${Date.now()}`,
      benefit_id: benefit.benefit_id,
      card_id: benefit.card_id,
      usage_date: logDate,
      amount_used: amount,
      user_note: logNote.trim() || undefined,
    }
    onUpdateUsage([...usageLog, entry])
    setLogAmount('')
    setLogNote('')
    setExpandedBenefit(null)
  }

  function handleMarkFullyUsed(benefit: Benefit, status: BenefitStatus | undefined) {
    if (!status || status.remaining_value === null || status.remaining_value <= 0) return

    const entry: UsageEntry = {
      usage_id: `usage_${benefit.benefit_id}_${Date.now()}`,
      benefit_id: benefit.benefit_id,
      card_id: benefit.card_id,
      usage_date: logDate,
      amount_used: status.remaining_value,
      user_note: 'Marked as fully used',
    }
    onUpdateUsage([...usageLog, entry])
  }

  function handleDeleteUsage(usage_id: string) {
    onUpdateUsage(usageLog.filter(e => e.usage_id !== usage_id))
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Card</label>
            <select
              value={filterCard}
              onChange={e => setFilterCard(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">All Cards</option>
              {activeCards.map(c => (
                <option key={c.card_id} value={c.card_id}>{c.card_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="unused">Unused</option>
              <option value="partially_used">Partially Used</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="used">Used</option>
              <option value="missed">Missed</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-slate-400">
            {filteredBenefits.length} benefit{filteredBenefits.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      {filteredBenefits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-400">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm">No benefits match your filters. Add cards in the My Cards tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBenefits.map(benefit => {
            const status = benefitStatuses.find(s => s.benefit_id === benefit.benefit_id)
            const card = CARDS.find(c => c.card_id === benefit.card_id)
            const isExpanded = expandedBenefit === benefit.benefit_id
            const benefitUsageEntries = usageLog.filter(e => e.benefit_id === benefit.benefit_id)

            return (
              <div key={benefit.benefit_id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-800">{benefit.benefit_name}</span>
                        {status && statusBadge(status.status)}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{card?.card_name ?? benefit.card_id}</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-500">
                        <div><span className="font-medium text-slate-600">Value:</span> {benefit.value_amount === 'varies' ? 'Varies' : benefit.value_amount === '0' ? 'N/A' : `$${benefit.value_amount}`}</div>
                        <div><span className="font-medium text-slate-600">Frequency:</span> {frequencyLabel(benefit.frequency)}</div>
                        <div><span className="font-medium text-slate-600">Enrollment:</span> {benefit.requires_enrollment ? 'Required' : 'Not required'}</div>
                        <div className="md:col-span-2"><span className="font-medium text-slate-600">Where:</span> {benefit.merchant_restriction}</div>
                        {status && (
                          <div>
                            <span className="font-medium text-slate-600">Deadline:</span> {status.deadline}
                            {status.days_left >= 0 ? ` (${status.days_left}d)` : ' (expired)'}
                          </div>
                        )}
                      </div>
                      {benefit.notes && (
                        <p className="text-xs text-slate-400 mt-2 italic">{benefit.notes}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {status && status.remaining_value !== null && (
                        <div className="text-xl font-bold text-purple-600">${status.remaining_value.toFixed(0)}</div>
                      )}
                      {status && status.remaining_value !== null && (
                        <div className="text-xs text-slate-400">remaining</div>
                      )}
                    </div>
                  </div>

                  {/* Usage history */}
                  {benefitUsageEntries.length > 0 && (
                    <div className="mt-3 border-t border-slate-50 pt-3">
                      <div className="text-xs font-medium text-slate-500 mb-2">Usage history</div>
                      <div className="space-y-1">
                        {benefitUsageEntries.map(entry => (
                          <div key={entry.usage_id} className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                            <span>{entry.usage_date} — ${entry.amount_used.toFixed(2)}{entry.user_note ? ` (${entry.user_note})` : ''}</span>
                            <button
                              onClick={() => handleDeleteUsage(entry.usage_id)}
                              className="text-red-400 hover:text-red-600 ml-2"
                              title="Delete entry"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setExpandedBenefit(isExpanded ? null : benefit.benefit_id)}
                      className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? 'Cancel' : '+ Log Usage'}
                    </button>
                    {status && status.remaining_value !== null && status.remaining_value > 0 && (
                      <button
                        onClick={() => handleMarkFullyUsed(benefit, status)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        Mark Fully Used (${status.remaining_value.toFixed(0)})
                      </button>
                    )}
                  </div>

                  {/* Expanded log form */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-sm font-medium text-slate-700 mb-3">Log Usage</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            value={logAmount}
                            onChange={e => setLogAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={logDate}
                            onChange={e => setLogDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Note (optional)</label>
                          <input
                            type="text"
                            value={logNote}
                            onChange={e => setLogNote(e.target.value)}
                            placeholder="e.g. Uber Eats order"
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => handleLogUsage(benefit, status)}
                          disabled={!logAmount || parseFloat(logAmount) <= 0}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Log Usage
                        </button>
                      </div>
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
