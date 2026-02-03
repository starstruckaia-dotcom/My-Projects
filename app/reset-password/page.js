'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email)

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
            Reset your password
          </h1>

          {success ? (
            <>
              <p
                style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '1.5rem'
                }}
              >
                If an account exists for <strong>{email}</strong>, we’ve sent you a
                password reset link.
              </p>

              <Link
                href="/login"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Back to Sign In
              </Link>
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
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p
                style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}
              >
                Remembered your password?{' '}
                <Link
                  href="/login"
                  style={{ color: 'var(--primary)', fontWeight: 500 }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
