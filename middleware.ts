import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Refreshes the Supabase auth session cookie on every request and exposes the pathname to server components
export async function middleware(request: NextRequest) {
  // Forward an x-pathname header so server components can read the current path
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Refresh the session — required for server components to see auth state
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files, image optimization, and the Stripe webhook
    // (Stripe webhook needs the raw body — middleware would interfere)
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json|api/stripe/webhook).*)',
  ],
}
