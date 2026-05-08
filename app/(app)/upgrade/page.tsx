'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSubscription } from '@/lib/subscriptionContext'
import { useRouter } from 'next/navigation'

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

const FEATURES = [
  'Unlimited card tracking',
  'AI monthly action plan',
  'AI benefit parser',
  'Purchase advisor',
  'Deadline reminders',
  'Full benefit portfolio tracking',
]

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { subscription, isPremium, trialDays } = useSubscription()
  const router = useRouter()

  // If user is already premium, redirect back
  if (isPremium) {
    router.replace('/dashboard')
    return null
  }

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Something went wrong. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {subscription?.subscription_status === 'trialing' && trialDays === 0 ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Your trial has ended</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upgrade to keep tracking your card benefits and using all premium features.
            </p>
          </>
        ) : subscription?.subscription_status === 'past_due' ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment failed</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Update your payment method to restore premium access.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Upgrade to PerkPulse AI</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Unlock everything for $1.99/month. Cancel anytime.
            </p>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-card-md p-6 mb-6">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-slate-900">$1.99</span>
          <span className="text-slate-400">/month</span>
        </div>
        <div className="space-y-2 mb-6">
          {FEATURES.map(f => (
            <div key={f} className="flex items-center gap-2">
              <CheckIcon />
              <span className="text-sm text-slate-700">{f}</span>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-rose-600 font-medium mb-3">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Opening checkout…
            </>
          ) : 'Upgrade — $1.99/month'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          Secure checkout via Stripe. Cancel anytime.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link href="/billing" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Manage billing</Link>
        <span className="text-slate-300">·</span>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Go back</Link>
      </div>
    </div>
  )
}
