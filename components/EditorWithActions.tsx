"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function EditorWithActions() {
  const [code, setCode] = useState<string>('// Paste Solidity contract here\n')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'solidity' })
      })
      const payload = await res.json()
      if (!payload.ok) throw new Error(payload.error || 'Analysis failed')
      setAnalysis(payload.analysis)
    } catch (err: any) {
      setAnalysis('Error: ' + (err.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  const saveReport = async () => {
    try {
      const title = prompt('Title for report', 'Analysis') || 'Analysis'
      const summary = (analysis || '').slice(0, 1000)
      // For now, require the user to paste their user_id (simpler); in a later step we can pull session.
      const user_id = prompt('Your user_id (from Supabase auth)') || ''
      if (!user_id) return alert('user_id required to save report')
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, title, summary, analysis, severity: 'Informational' })
      })
      const payload = await res.json()
      if (!payload.ok) throw new Error(payload.error || 'Save failed')
      alert('Saved report: ' + (payload.report?.id ?? ''))
    } catch (err: any) {
      alert('Error saving report: ' + (err.message || String(err)))
    }
  }

  return (
    <div className="space-y-2 h-96 flex flex-col">
      <div className="flex-1">
        <Monaco height="100%" defaultLanguage="solidity" defaultValue={code} onChange={(v) => setCode(v || '')} />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-green-600 rounded" onClick={runAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
        <button className="px-3 py-1 bg-blue-600 rounded" onClick={saveReport} disabled={!analysis}>
          Save Report
        </button>
      </div>
      <div className="overflow-auto h-48 bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">{analysis ?? 'No analysis yet.'}</div>
    </div>
  )
}
