'use client'

import { useState } from 'react'
import type { UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { detectPurchaseCategory, recommendCard, getCardName } from '@/lib/purchaseAdvisor'

interface PurchaseAdvisorProps {
  userCards: UserCard[]
}

// ── Category chips ──────────────────────────────────────────────────────────
const CATEGORY_EXAMPLES: { label: string; example: string }[] = [
  { label: 'Dining',           example: 'dinner at a restaurant' },
  { label: 'Groceries',        example: 'groceries at Whole Foods' },
  { label: 'Entertainment',    example: 'concert tickets' },
  { label: 'Streaming',        example: 'Netflix subscription' },
  { label: 'Online Shopping',  example: 'order on Amazon' },
  { label: 'Gas',              example: 'filling up at a gas station' },
  { label: 'Travel',           example: 'hotel booking' },
]

export default function PurchaseAdvisor({ userCards }: PurchaseAdvisorProps) {
  const [description, setDescription] = useState('')
  const [amount,      setAmount]      = useState('')
  const [result, setResult] = useState<{
    category:     string
    primary:      { preferred_card_id: string; reason: string; category: string } | null
    alternatives: Array<{ preferred_card_id: string; reason: string; category: string }>
  } | null>(null)

  const activeCardIds = userCards.filter(uc => uc.active).map(uc => uc.card_id)

  function handleFind() {
    if (!description.trim()) return
    const category = detectPurchaseCategory(description)
    const { primary, alternatives } = recommendCard(category, activeCardIds)
    setResult({ category, primary, alternatives })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFind() }
  }

  function reset() { setResult(null); setDescription(''); setAmount('') }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* ── Input form ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Purchase Advisor</h2>
        <p className="text-sm text-slate-500 mb-5">Describe what you're buying to find the best card to use.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              What are you buying?
            </label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setResult(null) }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. dinner at a nice restaurant, Netflix subscription, gas station, hotel for a trip…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white leading-relaxed"
            />
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-32">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Amount (opt.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-7 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white num"
                />
              </div>
            </div>

            <div className="flex-1 flex items-end pb-0.5">
              <div className="mt-6">
                <button
                  onClick={handleFind}
                  disabled={!description.trim() || activeCardIds.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Find Best Card
                </button>
              </div>
            </div>
          </div>

          {activeCardIds.length === 0 && (
            <p className="text-xs text-amber-600 font-medium">Add cards in the My Cards tab first.</p>
          )}
        </div>

        {/* Category quick-fill chips */}
        {!result && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Quick examples</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_EXAMPLES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => { setDescription(cat.example); setResult(null) }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full transition-colors"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Result ───────────────────────────────────────────── */}
      {result && (
        <div className="space-y-3">
          {/* Detected category */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category detected</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
              {result.category}
            </span>
            {amount && (
              <span className="text-xs text-slate-400 ml-auto num">${parseFloat(amount).toFixed(2)}</span>
            )}
          </div>

          {/* Primary recommendation */}
          {result.primary ? (
            <div className="bg-white rounded-xl border border-emerald-200 shadow-card overflow-hidden">
              <div className="px-5 py-3 bg-emerald-600 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Recommended Card</span>
              </div>
              <div className="p-5">
                <div className="text-lg font-bold text-slate-900 mb-2">
                  {getCardName(result.primary.preferred_card_id)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{result.primary.reason}</p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="text-sm font-semibold text-amber-800 mb-1">No specific recommendation</div>
              <p className="text-sm text-amber-700 leading-relaxed">
                No specific recommendation for this category with your current cards. Consider adding more cards or using a flat-rate cash back card.
              </p>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Also consider</div>
              <div className="space-y-2">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-semibold text-slate-800 text-sm mb-0.5">{getCardName(alt.preferred_card_id)}</div>
                    <p className="text-xs text-slate-500 leading-relaxed">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-slate-500 leading-relaxed">
              Category coding varies by merchant. Warehouse clubs, delivery platforms, and third-party apps may not earn bonus rewards. Always verify with your card issuer.
            </p>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Try another purchase
          </button>
        </div>
      )}
    </div>
  )
}
