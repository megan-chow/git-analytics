'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { theme } from '@/lib/theme'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [url, setUrl] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSubmit = () => {
    const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/)
    if (match) {
      router.push(`/repo/${match[1]}/${match[2]}`)
    } else {
      alert('Please enter a valid GitHub repository URL')
    }
  }

  const login = async (provider: 'github' | 'gitlab' | 'bitbucket') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: provider === 'github' ? 'repo' : undefined,
      }
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      background: theme.bg,
      color: theme.text,
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Git Analytics</h1>

      {user ? (
        <p style={{ color: theme.muted }}>
          Signed in as {user.user_metadata?.user_name ?? user.email}
        </p>
      ) : (
        <p style={{ color: theme.muted }}>
          Enter a public repo, or sign in for private access
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="https://github.com/owner/repo"
          style={{
            width: '360px',
            padding: '8px 16px',
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            color: theme.text,
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 20px',
            background: theme.blue,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          Analyze
        </button>
      </div>

      {user ? (
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: theme.muted,
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          Sign out
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => login('github')}
            style={{
              padding: '8px 20px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '14px',
            }}
          >
            Login with GitHub
          </button>
          {/* <button
            disabled
            style={{
              padding: '8px 20px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.muted,
              fontSize: '14px',
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          >
            Login with GitLab (coming soon)
          </button>
          <button
            disabled
            style={{
              padding: '8px 20px',
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.muted,
              fontSize: '14px',
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          >
            Login with Bitbucket (coming soon)
          </button> */}
        </div>
      )}
    </main>
  )
}