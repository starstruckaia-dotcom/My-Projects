'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, organization, loading: authLoading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      if (organization) {
        router.push('/')
      } else {
        router.push('/onboarding')
      }
    }
  }, [user, organization, authLoading, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className="main">
        <div className="container">
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>
            Sign in to StockPulse
          </h1>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#2563eb', fontWeight: '500' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
