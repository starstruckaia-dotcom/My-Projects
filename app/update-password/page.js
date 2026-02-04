'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/AuthContext'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { updatePassword } = useAuth()
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
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
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <main className="main">
      <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
        <div className="card">
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            Set a new password
          </h1>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </div>
          )}

          {success ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--success)',
                fontSize: '0.875rem'
              }}
            >
              Password updated. Redirecting to sign in…
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
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
                    color: password.length >= 8 ? 'var(--success)' : 'var(--text-muted)'
                  }}
                >
                  {password.length}/8 characters minimum
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
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
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
