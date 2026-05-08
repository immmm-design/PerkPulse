'use client'

import Link from 'next/link'
import { useSubscription } from '@/lib/subscriptionContext'
import { useState } from 'react'

export default function SubscriptionCard() {
  const { subscription, isPremium, trialDays, loading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { /* silently fail */ }
    finally { setPortalLoading(false) }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"/>
        <div className="h-3 bg-slate-100 rounded w-1/2"/>
      </div>
    )
  }

  if (!subscription) return null

  const status = subscription.subscription_status

  function statusBadge() {
    if (status === 'trialing')  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Free trial</span>
    if (status === 'active')    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
    if (status === 'past_due')  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Payment failed</span>
    if (status === 'canceled')  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Canceled</span>
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">{status}</span>
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold text-slate-900">Subscription</h3>
        {statusBadge()}
      </div>

      {status === 'trialing' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Trial ends in</span>
            <span className="font-semibold text-slate-800 num">{trialDays} day{trialDays !== 1 ? 's' : ''}</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{ width: `${Math.max(4, ((30 - trialDays) / 30) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">After your trial, it&apos;s $1.99/month. Cancel anytime.</p>
        </div>
      )}

      {status === 'past_due' && (
        <p className="text-xs text-rose-600 mb-4 leading-relaxed">
          Your last payment failed. Please update your payment method to restore access.
        </p>
      )}

      {status === 'canceled' && subscription.current_period_end && (
        <p className="text-xs text-slate-500 mb-4">
          Access continues until {new Date(subscription.current_period_end).toLocaleDateString()}.
        </p>
      )}

      {status === 'active' && subscription.current_period_end && (
        <p className="text-xs text-slate-500 mb-4 num">
          Renews {new Date(subscription.current_period_end).toLocaleDateString()}
          {subscription.cancel_at_period_end && ' (cancels at end of period)'}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!isPremium && (
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Upgrade — $1.99/mo
          </Link>
        )}
        {subscription.stripe_customer_id && (
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {portalLoading ? 'Opening…' : 'Manage Billing'}
          </button>
        )}
      </div>
    </div>
  )
}
