import React, { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const s = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })
    // initialize
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user ?? null))
    return () => s.data?.subscription?.unsubscribe()
  }, [])

  const signIn = async () => {
    if (!email) return alert('Enter an email for magic link sign-in')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Magic link sent — check your email')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user)
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">{user.email}</div>
        <button className="px-3 py-1 bg-red-600 rounded" onClick={signOut}>
          Sign out
        </button>
      </div>
    )

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-2 py-1 rounded bg-gray-800 text-gray-100"
      />
      <button className="px-3 py-1 bg-green-600 rounded" onClick={signIn}>
        Sign in
      </button>
    </div>
  )
}
