'use client'

import { useState } from 'react'
import type { UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { format } from 'date-fns'

interface MyCardsProps {
  userCards: UserCard[]
  onUpdate:  (cards: UserCard[]) => void
}

// ── Issuer color map ────────────────────────────────────────────────────────
function cardGradient(issuer: string): string {
  const i = issuer.toLowerCase()
  if (i.includes('american express'))  return 'from-zinc-700 to-zinc-900'
  if (i.includes('capital one'))       return 'from-red-800 to-red-950'
  if (i.includes('bank of america'))   return 'from-red-900 to-slate-900'
  if (i.includes('chase'))             return 'from-blue-800 to-blue-950'
  if (i.includes('discover'))          return 'from-orange-600 to-amber-700'
  return 'from-slate-700 to-slate-900'
}

function CardVisual({ card, nickname }: { card: (typeof CARDS)[number]; nickname?: string }) {
  return (
    <div className={`relative rounded-xl p-5 h-36 overflow-hidden bg-gradient-to-br ${cardGradient(card.issuer)} text-white shadow-wallet`}>
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

      {/* EMV chip */}
      <div className="relative w-9 h-7 rounded mb-3">
        <div className="absolute inset-0 rounded bg-amber-300/80 border border-amber-200/40" />
        <div className="absolute inset-[3px] border border-amber-100/30 rounded-[2px]" />
        <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px bg-amber-200/40" />
        <div className="absolute top-0 bottom-0 left-[32%] w-px bg-amber-200/40" />
        <div className="absolute top-0 bottom-0 right-[32%] w-px bg-amber-200/40" />
      </div>

      <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-0.5">{card.issuer}</div>
      <div className="text-sm font-bold text-white leading-tight truncate">
        {nickname?.trim() || card.card_name}
      </div>

      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
        <div className="text-[10px] text-white/40 num">
          {card.annual_fee > 0 ? `$${card.annual_fee}/yr` : 'No annual fee'}
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
          {card.issuer.split(' ')[0].substring(0, 6)}
        </div>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function MyCards({ userCards, onUpdate }: MyCardsProps) {
  const [selectedCardId, setSelectedCardId] = useState('')
  const [nickname,       setNickname]       = useState('')

  const addedCardIds   = userCards.map(uc => uc.card_id)
  const availableCards = CARDS.filter(c => !addedCardIds.includes(c.card_id))

  function handleAdd() {
    if (!selectedCardId) return
    const card = CARDS.find(c => c.card_id === selectedCardId)
    if (!card) return
    onUpdate([...userCards, {
      user_card_id: `uc_${selectedCardId}_${Date.now()}`,
      card_id:      selectedCardId,
      nickname:     nickname.trim() || undefined,
      active:       true,
      added_at:     format(new Date(), 'yyyy-MM-dd'),
    }])
    setSelectedCardId('')
    setNickname('')
  }

  function handleRemove(user_card_id: string) {
    onUpdate(userCards.filter(uc => uc.user_card_id !== user_card_id))
  }

  function handleNicknameChange(user_card_id: string, value: string) {
    onUpdate(userCards.map(uc =>
      uc.user_card_id === user_card_id ? { ...uc, nickname: value || undefined } : uc
    ))
  }

  function handleToggleActive(user_card_id: string) {
    onUpdate(userCards.map(uc =>
      uc.user_card_id === user_card_id ? { ...uc, active: !uc.active } : uc
    ))
  }

  return (
    <div className="space-y-6">

      {/* ── Privacy notice ──────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">No card numbers ever required</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            We only track card names and benefit usage — never account numbers or sensitive information.
          </p>
        </div>
      </div>

      {/* ── Add a card ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">Add a Card</h2>

        {availableCards.length === 0 ? (
          <p className="text-sm text-slate-500">All supported cards are already in your wallet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Select Card
              </label>
              <select
                value={selectedCardId}
                onChange={e => setSelectedCardId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Choose a card —</option>
                {availableCards.map(card => (
                  <option key={card.card_id} value={card.card_id}>
                    {card.card_name}{card.annual_fee > 0 ? ` · $${card.annual_fee}/yr` : ' · No fee'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Nickname <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. My Gold Card"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                onClick={handleAdd}
                disabled={!selectedCardId}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add to Wallet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── My Wallet ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Wallet</h2>
          <span className="text-xs text-slate-400">
            {userCards.length} card{userCards.length !== 1 ? 's' : ''}
          </span>
        </div>

        {userCards.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="3"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <p className="text-sm text-slate-500">No cards yet — use the form above to add your first card.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {userCards.map(uc => {
              const card = CARDS.find(c => c.card_id === uc.card_id)
              if (!card) return null
              return (
                <div key={uc.user_card_id} className={`p-5 ${!uc.active ? 'opacity-60' : ''}`}>
                  <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-start">

                    {/* Card visual */}
                    <CardVisual card={card} nickname={uc.nickname} />

                    {/* Details */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">{card.card_name}</span>
                          {!uc.active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">Inactive</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{card.issuer}</div>
                        <div className="text-xs text-slate-400 mt-1 num">
                          {card.annual_fee > 0 ? `$${card.annual_fee}/yr fee` : 'No annual fee'}
                          <span className="mx-1">·</span>Added {uc.added_at}
                        </div>
                      </div>

                      {/* Nickname input */}
                      <input
                        type="text"
                        value={uc.nickname ?? ''}
                        onChange={e => handleNicknameChange(uc.user_card_id, e.target.value)}
                        placeholder="Add a nickname…"
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white"
                      />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(uc.user_card_id)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border text-center ${
                            uc.active
                              ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {uc.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleRemove(uc.user_card_id)}
                          className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 text-center"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reward notes */}
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{card.reward_notes}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
