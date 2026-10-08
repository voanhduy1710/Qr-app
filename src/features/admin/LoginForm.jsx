import { useState } from 'react'
import { signIn } from './useAdminSession'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      await signIn(String(form.get('username')), String(form.get('password')))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="admin admin-center">
      <form className="admin-login" onSubmit={onSubmit}>
        <svg className="picker-mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 29 3.6 16.6a7.4 7.4 0 0 1 10.5-10.5L16 8l1.9-1.9a7.4 7.4 0 0 1 10.5 10.5Z" />
        </svg>
        <h1 className="script-title">Gift manager</h1>
        <p className="lead">Sign in to edit the gift pages and make QR codes.</p>

        <label className="admin-field">
          <span>Username</span>
          <input name="username" autoComplete="username" required autoCapitalize="none" spellCheck="false" />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>

        <p className="admin-error" role="alert">
          {error}
        </p>
        <button type="submit" className="btn btn-primary admin-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
