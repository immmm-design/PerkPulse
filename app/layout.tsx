import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'PerkPulse AI — Credit Card Benefit Tracker',
  description: 'Track your credit card benefits, get reminders, and maximize your monthly perks without entering sensitive data.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'PerkPulse',
  },
  icons: {
    icon:  '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  themeColor:          '#0f172a',
}

import PWARegister from '@/components/PWARegister'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
