'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isLogin) {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters")
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')
      }

      const signInRes = await signIn('credentials', {
        username,
        password,
        redirect: false
      })

      if (signInRes?.error) throw new Error('Invalid username or password')

      router.push('/journal')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Logo */}
      <div className="auth-logo">LIFTSCRIPT</div>
      <div className="auth-tagline">Your Iron Journal</div>

      <div className="auth-card animate-fade-in">
        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

        {error && <span className="error-badge">{error}</span>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              required
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || (password.length < 8 && !isLogin)}
          >
            {loading ? 'Working...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="text-center mt-2">
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-muted"
            style={{ fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}
            disabled={loading}
            type="button"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  )
}
