'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserOrganization(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserOrganization(session.user.id)
        } else {
          setOrganization(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
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

  async function createOrganization(name, slug) {
    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name, slug }])
      .select()
      .single()

    if (orgError) return { error: orgError }

    // Link user to organization
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
