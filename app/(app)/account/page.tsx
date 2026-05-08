'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import SubscriptionCard from '@/components/SubscriptionCard'
import Link from 'next/link'

export default function AccountPage() {
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  // Optimistically get email from client session
  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    try {
      const sb = getSupabase()
      // We'll get it from the async call below
      sb?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
      return ''
    } catch { return '' }
  })

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-lg mx-auto py-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Account</h1>
        {email && <p className="text-sm text-slate-500 mt-1">{email}</p>}
      </div>

      <SubscriptionCard />

      <div className="bg-white rounded-xl border border-slate-200 shadow-card divide-y divide-slate-50">
        <Link
          href="/billing"
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Billing &amp; subscription</div>
            <div className="text-xs text-slate-500">Manage your plan and payment method</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        <Link
          href="/privacy"
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="text-sm font-semibold text-slate-900">Privacy Policy</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>

        <Link
          href="/terms"
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="text-sm font-semibold text-slate-900">Terms of Service</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Sign out</h2>
        <p className="text-xs text-slate-500 mb-4">Your data is saved and will be here when you sign back in.</p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-400 leading-relaxed">
          PerkPulse AI does not store card numbers, bank credentials, or sensitive financial data.
          All benefit tracking is informational only. Always verify terms with your card issuer.
        </p>
      </div>
    </div>
  )
}
