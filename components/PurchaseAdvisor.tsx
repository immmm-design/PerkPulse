'use client'

import { useState } from 'react'
import type { UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { detectPurchaseCategory, recommendCard, getCardName } from '@/lib/purchaseAdvisor'

interface PurchaseAdvisorProps {
  userCards: UserCard[]
}

export default function PurchaseAdvisor({ userCards }: PurchaseAdvisorProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<{
    category: string
    primary: { preferred_card_id: string; reason: string; category: string } | null
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleFind()
    }
  }

  return (
    <div className="space-y-5">
      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Purchase Advisor</h2>
        <p className="text-sm text-slate-500 mb-4">Describe what you're buying and find out which card to use.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What are you buying?
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. dinner at a nice restaurant, Netflix subscription, gas station, hotel for a trip..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount (optional)
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
                className="w-full pl-7 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={handleFind}
            disabled={!description.trim() || activeCardIds.length === 0}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Find Best Card
          </button>
          {activeCardIds.length === 0 && (
            <p className="text-xs text-amber-600">Add cards in the My Cards tab first.</p>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Detected Category */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detected Category</span>
              <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 capitalize">
                {result.category}
              </span>
            </div>
            {amount && (
              <p className="text-xs text-slate-400 mt-1">Purchase amount: ${parseFloat(amount).toFixed(2)}</p>
            )}
          </div>

          {/* Primary Recommendation */}
          {result.primary ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">Recommended Card</div>
                  <div className="text-lg font-bold text-green-800 mb-2">
                    {getCardName(result.primary.preferred_card_id)}
                  </div>
                  <p className="text-sm text-green-700">{result.primary.reason}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <div className="text-sm font-semibold text-amber-800 mb-1">No specific recommendation</div>
                  <p className="text-sm text-amber-700">
                    We don't have a specific recommendation for this category with your current cards. Consider using a flat-rate cash back card, or add more cards to get better recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Cards */}
          {result.alternatives.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Alternative Options</div>
              <div className="space-y-2">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium text-slate-700 text-sm">{getCardName(alt.preferred_card_id)}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 italic">
              ⚠️ Category coding may vary by merchant. Some purchases at grocery stores or warehouse clubs may not earn bonus rewards. Always verify with your card issuer. This is informational only.
            </p>
          </div>

          {/* Try another */}
          <button
            onClick={() => { setResult(null); setDescription(''); setAmount('') }}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Try another purchase
          </button>
        </div>
      )}

      {/* Category guide */}
      {!result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recognized Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Dining', 'Groceries', 'Entertainment', 'Streaming', 'Online Shopping', 'Gas', 'Travel', 'General'].map(cat => (
              <div key={cat} className="px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 text-center capitalize">
                {cat}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">The advisor matches keywords from your description to these categories, then recommends the best card from your wallet.</p>
        </div>
      )}
    </div>
  )
}
