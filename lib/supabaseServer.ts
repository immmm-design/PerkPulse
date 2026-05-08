import { createClient } from '@supabase/supabase-js'

// Server-only admin client — uses service role key, bypasses RLS
// Never import this in client components
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin env vars not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Server-side user helper — reads authenticated user from cookie session
// Works in Server Components and Route Handlers
export async function getServerUser() {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies }            = await import('next/headers')
    const cookieStore = cookies()

    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) return null

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Headers already sent — ignore
          }
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    return user ?? null
  } catch {
    return null
  }
}
