'use client'

import type { Benefit, BenefitStatus, ActionPlan, UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'

interface DashboardProps {
  activeBenefits: Benefit[]
  benefitStatuses: BenefitStatus[]
  userCards: UserCard[]
  actionPlan: ActionPlan | null
  planLoading: boolean
  onGeneratePlan: () => void
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

function urgencyColor(urgency: string) {
  switch (urgency) {
    case 'high': return 'border-l-4 border-red-500 bg-red-50'
    case 'medium': return 'border-l-4 border-amber-500 bg-amber-50'
    default: return 'border-l-4 border-blue-400 bg-blue-50'
  }
}

function urgencyBadge(urgency: string) {
  switch (urgency) {
    case 'high': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">High</span>
    case 'medium': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Medium</span>
    default: return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Low</span>
  }
}

export default function Dashboard({
  activeBenefits,
  benefitStatuses,
  userCards,
  actionPlan,
  planLoading,
  onGeneratePlan,
}: DashboardProps) {
  const totalAvailable = activeBenefits.reduce((sum, b) => {
    if (b.value_amount === 'varies' || b.value_amount === '0') return sum
    const v = parseFloat(b.value_amount)
    return isNaN(v) ? sum : sum + v
  }, 0)

  const totalUsed = benefitStatuses.reduce((sum, s) => sum + s.used_amount, 0)
  const totalRemaining = benefitStatuses.reduce((sum, s) => sum + (s.remaining_value ?? 0), 0)
  const totalBenefits = activeBenefits.length

  const activeCardIds = userCards.filter(uc => uc.active).map(uc => uc.card_id)
  const activeCardObjects = CARDS.filter(c => activeCardIds.includes(c.card_id))

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">Total Available</div>
          <div className="text-3xl font-bold text-amber-500">${totalAvailable.toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-1">this period</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">Used</div>
          <div className="text-3xl font-bold text-green-500">${totalUsed.toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-1">logged so far</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-1">Remaining</div>
          <div className="text-3xl font-bold text-purple-600">${totalRemaining.toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-1">still claimable</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Benefits Tracked</div>
          <div className="text-3xl font-bold text-blue-500">{totalBenefits}</div>
          <div className="text-xs text-slate-400 mt-1">across your cards</div>
        </div>
      </div>

      {/* Card-by-card breakdown */}
      {userCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100 text-center">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No cards added yet</h3>
          <p className="text-slate-500">Go to the <strong>My Cards</strong> tab to add your credit cards and start tracking benefits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Benefits by Card</h2>
          {activeCardObjects.map(card => {
            const cardBenefits = activeBenefits.filter(b => b.card_id === card.card_id)
            const cardStatuses = benefitStatuses.filter(s =>
              cardBenefits.some(b => b.benefit_id === s.benefit_id)
            )
            if (cardBenefits.length === 0) return null
            return (
              <div key={card.card_id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-slate-50 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{card.card_name}</span>
                      <span className="ml-2 text-xs text-slate-400">{card.issuer}</span>
                    </div>
                    {card.annual_fee > 0 && (
                      <span className="text-xs text-slate-500">${card.annual_fee}/yr fee</span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {cardBenefits.map(benefit => {
                    const status = cardStatuses.find(s => s.benefit_id === benefit.benefit_id)
                    return (
                      <div key={benefit.benefit_id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-700 text-sm">{benefit.benefit_name}</div>
                          <div className="text-xs text-slate-400 truncate">{benefit.merchant_restriction}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-slate-700">
                            {benefit.value_amount === 'varies' ? 'Varies' : benefit.value_amount === '0' ? '—' : `$${benefit.value_amount}`}
                          </div>
                          {status && (
                            <div className="text-xs text-slate-400">
                              {status.days_left >= 0 ? `${status.days_left}d left` : 'expired'}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {status ? statusBadge(status.status) : statusBadge('unused')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action Plan Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI Action Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Personalized recommendations to maximize your benefits</p>
          </div>
          <button
            onClick={onGeneratePlan}
            disabled={planLoading || activeBenefits.length === 0}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {planLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>✨ Generate Plan</>
            )}
          </button>
        </div>

        {actionPlan ? (
          <div className="p-5 space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-slate-700 text-sm">{actionPlan.monthly_summary}</p>
            </div>

            {actionPlan.priority_actions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Priority Actions</h3>
                <div className="space-y-2">
                  {actionPlan.priority_actions.map((action, i) => (
                    <div key={i} className={`p-3 rounded-lg ${urgencyColor(action.urgency)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-xs font-bold">#{i + 1}</span>
                            {urgencyBadge(action.urgency)}
                            <span className="text-sm font-semibold text-amber-600">{action.estimated_value}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium">{action.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{action.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actionPlan.missed_value_warning && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-rose-700 text-sm font-medium">⚠️ {actionPlan.missed_value_warning}</p>
              </div>
            )}

            <p className="text-xs text-slate-400 italic">{actionPlan.safe_disclaimer}</p>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm">Click "Generate Plan" to get personalized benefit recommendations.</p>
            {activeBenefits.length === 0 && (
              <p className="text-xs mt-1 text-amber-600">Add cards first to generate a plan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
