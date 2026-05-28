import React, { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user ?? null))
    const fetchReports = async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(10)
      setReports(data ?? [])
    }
    fetchReports().catch(() => {})
  }, [])

  if (!user)
    return (
      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-gray-400">Please sign in to view your reports.</p>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
        <p className="text-gray-400">Upload contracts or paste code to generate reports.</p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <h3 className="font-semibold mb-2">Recent Reports</h3>
        {reports.length === 0 ? (
          <div className="text-gray-400">No reports yet.</div>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="p-2 bg-gray-900 rounded">
                <div className="flex justify-between">
                  <div className="font-medium">{r.title || 'Analysis'}</div>
                  <div className="text-sm text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-300 mt-1 line-clamp-4">{r.summary}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
