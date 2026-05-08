'use client'

import Link from 'next/link'

interface UpgradeGateProps {
  feature: string
  children: React.ReactNode
  isPremium: boolean
}

export default function UpgradeGate({ feature, children, isPremium }: UpgradeGateProps) {
  if (isPremium) return <>{children}</>

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-50 max-h-48 overflow-hidden">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-900 mb-1">{feature} is a premium feature</p>
        <p className="text-xs text-slate-500 mb-4 max-w-xs">
          Upgrade to PerkPulse AI for $1.99/month to unlock everything.
        </p>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Upgrade — $1.99/mo
        </Link>
      </div>
    </div>
  )
}
