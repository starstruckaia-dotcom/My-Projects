'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/AuthContext'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, organization, loading: authLoading, createOrganization } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else if (organization) {
        router.push('/')
      }
    }
  }, [user, organization, authLoading, router])

  // Auto-generate slug from name
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(generatedSlug)
  }, [name])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Restaurant name is required')
      return
    }

    if (!slug.trim()) {
      setError('URL slug is required')
      return
    }

    setLoading(true)

    const { error } = await createOrganization(name.trim(), slug.trim())

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  if (authLoading || !user) {
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
      <div className="container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>
            Set up your restaurant
          </h1>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>
            Create your restaurant profile to start tracking inventory
          </p>

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
              <label className="form-label">Restaurant Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mario's Italian Kitchen"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                className="form-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="marios-italian-kitchen"
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                This will be used in your unique URL
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Restaurant'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
