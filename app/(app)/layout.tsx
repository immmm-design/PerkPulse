import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabaseServer'
import { SubscriptionProvider } from '@/lib/subscriptionContext'
import AppHeader from '@/components/AppHeader'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  // Not logged in → send to login
  if (!user) redirect('/login')

  return (
    <SubscriptionProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader userEmail={user.email} />

        {/* Main scrollable area with bottom-nav safe area padding on mobile */}
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
            <a href="/terms" className="hover:text-slate-600">Terms</a>
          </p>
        </footer>

        <BottomNav />
      </div>
    </SubscriptionProvider>
  )
}
