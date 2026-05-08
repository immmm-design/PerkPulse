import type { Metadata } from 'next'
import LoginPage from '@/components/LoginPage'

export const metadata: Metadata = { title: 'Sign in — PerkPulse AI' }

export default function LoginRoute() {
  return <LoginPage />
}
