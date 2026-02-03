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
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="main">
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Check your email
            </h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              We’ve sent a confirmation link to <strong>{email}</strong>.
              Please click the link to verify your account.
            </p>
            <Link href="/login" className="btn btn-primary">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
        <div className="card">
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
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

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p
                className={`text-sm mt-1 ${
                  password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {password.length}/8 characters minimum
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              color: '#64748b',
              fontSize: '0.875rem'
            }}
          >
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
