'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { user, updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // IMPORTANT:
  // Do NOT redirect if user is null.
  // Supabase recovery session counts as authenticated.
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await updatePassword(password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <main className="main">
      <div className="container" style={{ maxWidth: 400, marginTop: '4rem' }}>
        <div className="card">
          <h1
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            Set a new password
          </h1>

          {success ? (
            <>
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--success)',
                  marginBottom: '1.5rem'
                }}
              >
                Password updated successfully.
              </p>
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}
              >
                Redirecting to sign in…
              </p>
            </>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '0.75rem',
                    borderRadius: 8,
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Minimum 8 characters
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>

              <p
                style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Link href="/login" style={{ color: 'var(--primary)' }}>
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
