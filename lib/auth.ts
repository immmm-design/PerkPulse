import { getSupabase } from './supabase'
import type { AuthUser } from './types'

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabase()
  if (!supabase) return { error: null }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return { id: data.user.id, email: data.user.email ?? '' }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  const supabase = getSupabase()
  if (!supabase) {
    callback(null)
    return () => {}
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email ?? '' })
    } else {
      callback(null)
    }
  })
  return () => subscription.unsubscribe()
}
