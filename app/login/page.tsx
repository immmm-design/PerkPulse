import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginPage from '@/components/LoginPage'

export const metadata: Metadata = { title: 'Sign in — PerkPulse AI' }

export default function LoginRoute() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  )
}
