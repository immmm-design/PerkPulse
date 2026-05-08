import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerUser } from '@/lib/supabaseServer'
import { isUserPremium } from '@/lib/subscription'
import { SubscriptionProvider } from '@/lib/subscriptionContext'
import AppHeader from '@/components/AppHeader'
import BottomNav from '@/components/BottomNav'

// Pages that expired users CAN access
const ALLOWED_WHEN_EXPIRED = ['/account', '/billing', '/upgrade']

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect('/login')

  // Determine current path from headers (set by middleware/Next.js)
  const headerList = headers()
  const pathname   = headerList.get('x-invoke-path') ?? headerList.get('x-pathname') ?? ''

  // Gate premium-only routes if user is not premium
  const premium = await isUserPremium(user.id)
  if (!premium && pathname && !ALLOWED_WHEN_EXPIRED.some(p => pathname.startsWith(p))) {
    redirect('/upgrade')
  }

  return (
    <SubscriptionProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader userEmail={user.email} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
          {children}
        </main>

        <footer className="hidden md:block max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            PerkPulse AI does not store card numbers or process payments directly.
            All benefit data is for informational purposes — verify terms with your issuer.
            <span className="mx-1.5">·</span>
            <a href="/privacy" className="hover:text-slate-600">Privacy</a>
            <span className="mx-1.5">·</span>
            <a href="/terms"   className="hover:text-slate-600">Terms</a>
          </p>
        </footer>

        <BottomNav />
      </div>
    </SubscriptionProvider>
  )
}
