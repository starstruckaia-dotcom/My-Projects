'use client'

import { useAuth } from '../../lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, organization, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">StockPulse</div>
        {user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {organization && (
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {organization.name}
              </span>
            )}
            <button className="btn btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
