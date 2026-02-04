'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🚀 INIT AUTH FAST
  useEffect(() => {
    let mounted = true

    const init = async () => {
      // 1️⃣ Get session (FAST)
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false) // 👈 STOP BLOCKING UI EARLY

      // 2️⃣ Load org in background (NON-BLOCKING)
      if (session?.user) {
        loadOrganization(session.user.id)
      }
    }

    init()

    // 3️⃣ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadOrganization(session.user.id)
        } else {
          setOrganization(null)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // 🧠 Load org without blocking UI
  const loadOrganization = async (userId) => {
    // ⚡ Instant cache hit
    const cached = localStorage.getItem('organization')
    if (cached) {
      setOrganization(JSON.parse(cached))
    }

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single()

    if (!error && data) {
      setOrganization(data)
      localStorage.setItem('organization', JSON.stringify(data))
    }
  }

  // AUTH ACTIONS
  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    localStorage.removeItem('organization')
    setOrganization(null)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
