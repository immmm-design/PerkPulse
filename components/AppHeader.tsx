'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSubscription } from '@/lib/subscriptionContext'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview'   },
  { href: '/cards',     label: 'My Cards'   },
  { href: '/benefits',  label: 'Benefits'   },
  { href: '/reminders', label: 'Reminders'  },
  { href: '/advisor',   label: 'Advisor'    },
  { href: '/parser',    label: 'AI Parser'  },
]

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="3"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <line x1="6" y1="15" x2="9" y2="15"/>
        <line x1="12" y1="15" x2="15" y2="15"/>
      </svg>
    </div>
  )
}

interface AppHeaderProps {
  userEmail?: string | null
}

export default function AppHeader({ userEmail }: AppHeaderProps) {
  const pathname = usePathname()
  const { subscription, isPremium, trialDays, loading } = useSubscription()

  return (
    <header className="bg-slate-900 text-white shrink-0">
      {/* Trial / status banner */}
      {!loading && subscription?.subscription_status === 'trialing' && trialDays <= 7 && (
        <div className="bg-amber-500 text-amber-950 text-xs font-semibold text-center py-1.5 px-4">
          {trialDays > 0
            ? `Your free trial ends in ${trialDays} day${trialDays !== 1 ? 's' : ''}. `
            : 'Your free trial has ended. '
          }
          <Link href="/upgrade" className="underline hover:no-underline">Upgrade for $1.99/mo</Link>
        </div>
      )}

      {!loading && !isPremium && subscription?.subscription_status !== 'trialing' && (
        <div className="bg-rose-600 text-white text-xs font-semibold text-center py-1.5 px-4">
          Premium access required.{' '}
          <Link href="/upgrade" className="underline hover:no-underline">Upgrade now</Link>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-base font-bold tracking-tight">PerkPulse</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(link => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden sm:block text-xs text-slate-400 truncate max-w-[140px]">{userEmail}</span>
          )}
          <Link
            href="/account"
            className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Account
          </Link>
        </div>
      </div>
    </header>
  )
}
