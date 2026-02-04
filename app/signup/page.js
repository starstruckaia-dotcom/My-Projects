'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { user, organization, loading: authLoading, signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push(organization ? '/' : '/onboarding')
    }
  }, [user, organization, authLoading, router])

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
    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className="main">
        <div className="container">
          <p>Loading…</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="main">
        <div className="container" style={{ maxWidth: 420 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1 style={{ marginBottom: '1rem' }}>Check your email</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              We sent a confirmation link to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="btn btn-primary">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card">
          <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Create your account
          </h1>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <p
                style={{
                  marginTop: '0.25rem',
                  fontSize: '0.75rem',
                  color:
                    password.length >= 8
                      ? 'var(--success)'
                      : 'var(--text-muted)',
                }}
              >
                {password.length}/8 characters minimum
              </p>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
