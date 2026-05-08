'use client'

import { useState } from 'react'
import type { UserCard, CardSettingsMap } from '@/lib/types'
import { CARDS, BANKS, CARD_SETTINGS_DEFINITIONS } from '@/lib/data'
import { format } from 'date-fns'
import CardSettingsPanel from './CardSettingsPanel'

interface MyCardsProps {
  userCards:        UserCard[]
  cardSettings:     CardSettingsMap
  onUpdate:         (cards: UserCard[]) => void
  onSettingsUpdate: (settings: CardSettingsMap) => void
  maxCards?:        number
}

type AddStep = 'browse' | 'bank' | 'settings'

function cardGradient(issuer: string): string {
  const i = issuer.toLowerCase()
  if (i.includes('american express')) return 'from-zinc-700 to-zinc-900'
  if (i.includes('capital one'))      return 'from-red-800 to-red-950'
  if (i.includes('bank of america'))  return 'from-red-900 to-slate-900'
  if (i.includes('chase'))            return 'from-blue-800 to-blue-950'
  if (i.includes('discover'))         return 'from-orange-600 to-amber-700'
  if (i.includes('wells fargo'))      return 'from-red-600 to-red-800'
  if (i.includes('citi'))             return 'from-blue-600 to-blue-800'
  if (i.includes('apple'))            return 'from-slate-600 to-slate-800'
  return 'from-slate-700 to-slate-900'
}

function CardVisual({ card, nickname }: { card: (typeof CARDS)[number]; nickname?: string }) {
  return (
    <div className={`relative rounded-xl p-5 h-36 overflow-hidden bg-gradient-to-br ${cardGradient(card.issuer)} text-white shadow-wallet`}>
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

export default function MyCards({ userCards, cardSettings, onUpdate, onSettingsUpdate, maxCards }: MyCardsProps) {
  const [addStep,      setAddStep]      = useState<AddStep>('browse')
  const [selectedBank, setSelectedBank] = useState('')
  const [pendingCardId, setPendingCardId] = useState('')
  const [nickname,     setNickname]     = useState('')
  const [showSettings, setShowSettings] = useState<string | null>(null)

  const addedCardIds = userCards.map(uc => uc.card_id)

  // ── Bank-first picker helpers ───────────────────────────────────────────
  const bankCards = selectedBank
    ? CARDS.filter(c => {
        const bankObj = BANKS.find(b => b.issuer_key === selectedBank)
        return bankObj && c.issuer.toLowerCase().includes(bankObj.name.split(' ')[0].toLowerCase())
      })
    : []

  function handleSelectBank(issuer_key: string) {
    setSelectedBank(issuer_key)
    setAddStep('bank')
  }

  function handleSelectCard(card_id: string) {
    const card = CARDS.find(c => c.card_id === card_id)
    if (!card) return
    setPendingCardId(card_id)
    if (card.requires_user_settings) {
      setAddStep('settings')
    } else {
      finishAdd(card_id)
    }
  }

  function finishAdd(card_id: string, nick?: string) {
    onUpdate([...userCards, {
      user_card_id: `uc_${card_id}_${Date.now()}`,
      card_id,
      nickname: (nick ?? nickname).trim() || undefined,
      active: true,
      added_at: format(new Date(), 'yyyy-MM-dd'),
    }])
    setAddStep('browse')
    setSelectedBank('')
    setPendingCardId('')
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

  const pendingCard = CARDS.find(c => c.card_id === pendingCardId)

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
          <p className="text-xs text-emerald-700 mt-0.5">We only track card names and benefit usage — never account numbers or sensitive information.</p>
        </div>
      </div>

      {/* ── Add a card ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">

        {/* Step: Browse banks */}
        {addStep === 'browse' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Add a Card</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Select your card issuer to get started.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BANKS.map(bank => {
                const bankCards = CARDS.filter(c => c.issuer.toLowerCase().includes(bank.name.split(' ')[0].toLowerCase()))
                const availableCount = bankCards.filter(c => !addedCardIds.includes(c.card_id)).length
                return (
                  <button
                    key={bank.issuer_key}
                    onClick={() => handleSelectBank(bank.issuer_key)}
                    disabled={availableCount === 0}
                    className={[
                      `relative rounded-xl p-4 bg-gradient-to-br ${bank.gradient} text-white text-left transition-all shadow-sm`,
                      availableCount === 0
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:scale-[1.02] hover:shadow-md active:scale-[0.98] cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
                    <div className="text-xs font-bold leading-tight">{bank.name}</div>
                    <div className="text-[10px] text-white/50 mt-1">{availableCount} card{availableCount !== 1 ? 's' : ''} available</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step: Pick card from bank */}
        {addStep === 'bank' && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setAddStep('browse'); setSelectedBank('') }}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                All banks
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-slate-700">
                {BANKS.find(b => b.issuer_key === selectedBank)?.name}
              </span>
            </div>

            <div className="space-y-3">
              {bankCards.map(card => {
                const alreadyAdded = addedCardIds.includes(card.card_id)
                const hasSettings  = CARD_SETTINGS_DEFINITIONS.some(d => d.card_id === card.card_id)
                return (
                  <div
                    key={card.card_id}
                    className={`p-4 rounded-xl border ${alreadyAdded ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{card.card_name}</span>
                          {hasSettings && !alreadyAdded && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Setup required
                            </span>
                          )}
                          {alreadyAdded && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Already added
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500 num">
                            {card.annual_fee > 0 ? `$${card.annual_fee}/yr` : 'No annual fee'}
                          </span>
                          {card.card_type && (
                            <span className="text-xs text-slate-400 capitalize">&middot; {card.card_type}</span>
                          )}
                        </div>
                        {card.reward_summary && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.reward_summary}</p>
                        )}
                      </div>
                      {!alreadyAdded && (
                        <button
                          onClick={() => handleSelectCard(card.card_id)}
                          disabled={!!maxCards && userCards.length >= maxCards}
                          title={maxCards && userCards.length >= maxCards ? 'Upgrade to add more cards' : undefined}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step: Card settings before adding */}
        {addStep === 'settings' && pendingCard && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setAddStep('bank'); setPendingCardId('') }}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-slate-700">Setup {pendingCard.card_name}</span>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Configure this card&apos;s settings to get accurate recommendations.
            </p>

            <CardSettingsPanel
              card_id={pendingCard.card_id}
              cardSettings={cardSettings}
              onUpdate={onSettingsUpdate}
              compact={false}
            />

            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Nickname <span className="normal-case font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="e.g. My BofA Card"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-56"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => finishAdd(pendingCard.card_id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add to Wallet
              </button>
              <button
                onClick={() => finishAdd(pendingCard.card_id)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── My Wallet ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">My Wallet</h2>
          <span className="text-xs text-slate-400">{userCards.length} card{userCards.length !== 1 ? 's' : ''}</span>
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
              const hasSettingsDef = CARD_SETTINGS_DEFINITIONS.some(d => d.card_id === card.card_id)
              const settingsConfigured = hasSettingsDef && cardSettings[card.card_id] &&
                Object.keys(cardSettings[card.card_id]).length > 0
              const showingSettings = showSettings === uc.user_card_id

              return (
                <div key={uc.user_card_id} className={`p-5 ${!uc.active ? 'opacity-60' : ''}`}>
                  <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-start">
                    <CardVisual card={card} nickname={uc.nickname} />

                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">{card.card_name}</span>
                          {!uc.active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">Inactive</span>
                          )}
                          {hasSettingsDef && !settingsConfigured && uc.active && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Needs setup</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{card.issuer}</div>
                        <div className="text-xs text-slate-400 mt-1 num">
                          {card.annual_fee > 0 ? `$${card.annual_fee}/yr fee` : 'No annual fee'}
                          <span className="mx-1">·</span>Added {uc.added_at}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={uc.nickname ?? ''}
                        onChange={e => handleNicknameChange(uc.user_card_id, e.target.value)}
                        placeholder="Add a nickname…"
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white"
                      />

                      <div className="flex flex-wrap gap-2">
                        {hasSettingsDef && (
                          <button
                            onClick={() => setShowSettings(showingSettings ? null : uc.user_card_id)}
                            className="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-center"
                          >
                            {showingSettings ? 'Hide Settings' : 'Card Settings'}
                          </button>
                        )}
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

                  {/* Inline card settings */}
                  {showingSettings && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Card Settings</div>
                      <CardSettingsPanel
                        card_id={card.card_id}
                        cardSettings={cardSettings}
                        onUpdate={onSettingsUpdate}
                        compact={true}
                      />
                    </div>
                  )}

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
