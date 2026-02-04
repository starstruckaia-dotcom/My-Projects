'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Session error:', error.message)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserOrganization(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserOrganization(session.user.id)
        } else {
          setOrganization(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserOrganization(userId) {
    const { data, error } = await supabase
      .from('user_organizations')
      .select('organization_id, organizations(id, name, slug)')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (error || !data) {
      setOrganization(null)
    } else {
      setOrganization(data.organizations)
    }
    setLoading(false)
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setOrganization(null)
    }
    return { error }
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    return { data, error }
  }

  async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }

  async function createOrganization(name, slug) {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name, slug }])
      .select()
      .single()

    if (orgError) return { error: orgError }

    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert([{
        user_id: user.id,
        organization_id: org.id,
        role: 'owner'
      }])

    if (linkError) return { error: linkError }

    setOrganization(org)
    return { data: org, error: null }
  }

  const value = {
    user,
    organization,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    createOrganization,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
