'use client'

import { useState } from 'react'
import type { UserCard } from '@/lib/types'
import { CARDS } from '@/lib/data'
import { format } from 'date-fns'

interface MyCardsProps {
  userCards: UserCard[]
  onUpdate: (cards: UserCard[]) => void
}

export default function MyCards({ userCards, onUpdate }: MyCardsProps) {
  const [selectedCardId, setSelectedCardId] = useState('')
  const [nickname, setNickname] = useState('')

  const addedCardIds = userCards.map(uc => uc.card_id)
  const availableCards = CARDS.filter(c => !addedCardIds.includes(c.card_id))

  function handleAdd() {
    if (!selectedCardId) return
    const card = CARDS.find(c => c.card_id === selectedCardId)
    if (!card) return
    const newUserCard: UserCard = {
      user_card_id: `uc_${selectedCardId}_${Date.now()}`,
      card_id: selectedCardId,
      nickname: nickname.trim() || undefined,
      active: true,
      added_at: format(new Date(), 'yyyy-MM-dd'),
    }
    onUpdate([...userCards, newUserCard])
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
      {/* Privacy Note */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="text-2xl">🔒</div>
        <div>
          <p className="text-green-800 font-semibold text-sm">No card numbers ever required</p>
          <p className="text-green-700 text-xs mt-0.5">All data stays in your browser. We only track card names and benefit usage — never account numbers or sensitive info.</p>
        </div>
      </div>

      {/* Add Card Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add a Card</h2>
        {availableCards.length === 0 ? (
          <p className="text-slate-500 text-sm">All available cards have been added to your wallet.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Card</label>
              <select
                value={selectedCardId}
                onChange={e => setSelectedCardId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">— Choose a card —</option>
                {availableCards.map(card => (
                  <option key={card.card_id} value={card.card_id}>
                    {card.card_name} {card.annual_fee > 0 ? `($${card.annual_fee}/yr)` : '(No fee)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nickname (optional)</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="e.g. My Amex Gold"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedCardId}
              className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Card
            </button>
          </div>
        )}
      </div>

      {/* My Cards List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">My Wallet</h2>
          <p className="text-xs text-slate-400 mt-0.5">{userCards.length} card{userCards.length !== 1 ? 's' : ''} tracked</p>
        </div>

        {userCards.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-sm">No cards added yet. Use the form above to add your first card.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {userCards.map(uc => {
              const card = CARDS.find(c => c.card_id === uc.card_id)
              if (!card) return null
              return (
                <div key={uc.user_card_id} className={`p-5 ${!uc.active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{card.card_name}</span>
                        {uc.nickname && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{uc.nickname}</span>
                        )}
                        {!uc.active && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">Inactive</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">{card.issuer}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {card.annual_fee > 0 ? `$${card.annual_fee}/yr annual fee` : 'No annual fee'}
                        {' · '}Added {uc.added_at}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 truncate">{card.reward_notes}</div>

                      {/* Nickname edit */}
                      <div className="mt-3">
                        <input
                          type="text"
                          value={uc.nickname ?? ''}
                          onChange={e => handleNicknameChange(uc.user_card_id, e.target.value)}
                          placeholder="Add nickname..."
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(uc.user_card_id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          uc.active
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {uc.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleRemove(uc.user_card_id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
