'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserCard, CardSettingsMap } from '@/lib/types'
import { getUserCards, addUserCard, updateUserCard, removeUserCard, getCardSettings, upsertCardSetting } from '@/lib/db'
import { getCardSettings as saveSettings } from '@/lib/db'
import { useSubscription } from '@/lib/subscriptionContext'
import MyCards from '@/components/MyCards'
import Link from 'next/link'

export default function CardsPage() {
  const [userCards,    setUserCards]    = useState<UserCard[]>([])
  const [cardSettings, setCardSettings] = useState<CardSettingsMap>({})
  const [mounted,      setMounted]      = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()

  const load = useCallback(async () => {
    const [cards, settings] = await Promise.all([getUserCards(), getCardSettings()])
    setUserCards(cards)
    setCardSettings(settings)
    setMounted(true)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpdate(updatedCards: UserCard[]) {
    const currentIds = userCards.map(c => c.user_card_id)
    const newIds     = updatedCards.map(c => c.user_card_id)

    // Additions
    for (const card of updatedCards) {
      if (!currentIds.includes(card.user_card_id)) {
        await addUserCard(card)
      }
    }
    // Removals
    for (const card of userCards) {
      if (!newIds.includes(card.user_card_id)) {
        await removeUserCard(card.user_card_id)
      }
    }
    // Updates (nickname, active)
    for (const card of updatedCards) {
      if (currentIds.includes(card.user_card_id)) {
        const old = userCards.find(c => c.user_card_id === card.user_card_id)
        if (old && (old.nickname !== card.nickname || old.active !== card.active)) {
          await updateUserCard(card.user_card_id, { nickname: card.nickname, active: card.active })
        }
      }
    }
    setUserCards(updatedCards)
  }

  async function handleSettingsUpdate(settings: CardSettingsMap) {
    // Persist each changed setting
    for (const [card_id, values] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(values)) {
        await upsertCardSetting(card_id, key, value)
      }
    }
    setCardSettings(settings)
  }

  if (!mounted || subLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Free users can add 1 card; premium users unlimited
  const cardLimitReached = !isPremium && userCards.length >= 1

  return (
    <div className="space-y-4">
      {cardLimitReached && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Card limit reached on free trial</p>
            <p className="text-xs text-amber-700 mt-0.5">Upgrade to add unlimited cards.</p>
          </div>
          <Link href="/upgrade" className="shrink-0 text-xs font-semibold text-amber-800 underline hover:no-underline">Upgrade</Link>
        </div>
      )}
      <MyCards
        userCards={userCards}
        cardSettings={cardSettings}
        onUpdate={handleUpdate}
        onSettingsUpdate={handleSettingsUpdate}
        maxCards={isPremium ? undefined : 1}
      />
    </div>
  )
}
