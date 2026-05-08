'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import SubscriptionCard from '@/components/SubscriptionCard'
import Link from 'next/link'

function BillingContent() {
  const params  = useSearchParams()
  const success = params.get('checkout') === 'success'

  return (
    <div className="max-w-lg mx-auto py-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your PerkPulse AI subscription.</p>
      </div>

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Subscription activated!</p>
            <p className="text-xs text-emerald-700 mt-0.5">Welcome to PerkPulse AI premium. All features are now unlocked.</p>
          </div>
        </div>
      )}

      <SubscriptionCard />

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">About your subscription</h2>
        <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
          <p>Your subscription is managed through Stripe. Use the Manage Billing button to update payment methods, view invoices, or cancel.</p>
          <p>If you cancel, you keep access until the end of your current billing period.</p>
          <p>Payments are processed securely by Stripe. PerkPulse AI never stores your payment details.</p>
        </div>
      </div>

      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to dashboard
      </Link>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <BillingContent />
    </Suspense>
  )
}
