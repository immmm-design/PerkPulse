'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { SubscriptionRecord, SubscriptionStatus } from './subscription'

interface SubscriptionContextValue {
  subscription:  SubscriptionRecord | null
  isPremium:     boolean
  trialDays:     number
  loading:       boolean
  refresh:       () => void
}

const Ctx = createContext<SubscriptionContextValue>({
  subscription: null,
  isPremium:    false,
  trialDays:    0,
  loading:      true,
  refresh:      () => {},
})

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [isPremium,    setIsPremium]    = useState(false)
  const [trialDays,    setTrialDays]    = useState(0)
  const [loading,      setLoading]      = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res  = await fetch('/api/subscription')
      if (!res.ok) return
      const data = await res.json()
      setSubscription(data.subscription)
      setIsPremium(data.isPremium)
      setTrialDays(data.trialDays)
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <Ctx.Provider value={{ subscription, isPremium, trialDays, loading, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSubscription() { return useContext(Ctx) }
