"use client"
import React, { useState, useRef } from 'react'

export default function CopilotKitUI() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const send = async (payloadCode?: string) => {
    const codeToSend = payloadCode ?? input
    if (!codeToSend.trim()) return
    const userMsg = { role: 'user', text: codeToSend }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // fetch streaming endpoint and consume incremental chunks
      const supabaseModule = await import('../lib/supabaseClient')
      const session = await supabaseModule.supabase.auth.getSession()
      const token = session?.data?.session?.access_token
      const res = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ code: codeToSend, language: 'auto' })
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Agent stream failed')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream reader available')

      // create assistant message slot
      setMessages((m) => [...m, { role: 'assistant', text: '' }])
      const decoder = new TextDecoder()
      let done = false
      let lastChunk = ''
      while (!done) {
        const { value, done: rDone } = await reader.read()
        done = rDone
        if (value) {
          const chunk = decoder.decode(value)
          lastChunk += chunk
          // Append chunk to last assistant message
          setMessages((prev) => {
            const copy = prev.slice()
            const last = copy.pop() ?? { role: 'assistant', text: '' }
            last.text = (last.text || '') + chunk
            copy.push(last)
            return copy
          })
        }
      }
      // scroll to bottom
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50)
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error: ' + (err.message || String(err)) }])
    } finally {
      setLoading(false)
    }
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setInput(text)
  }

  return (
    <div className="bg-gray-800 p-4 rounded flex flex-col h-96">
      <div ref={listRef} className="flex-1 overflow-auto space-y-3 p-2">
        {messages.length === 0 ? (
          <div className="text-gray-400">Ask EliteBugHunter about a contract or paste code here.</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-green-200' : 'text-gray-200'}>
              <div className="text-xs text-gray-400">{m.role}</div>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste code or ask a question..."
          className="flex-1 bg-gray-900 p-2 rounded text-sm text-green-200 h-24 resize-none"
        />

        <div className="flex flex-col gap-2">
          <input type="file" accept=".sol,.txt,.js,.ts,.py,.rs" onChange={onFile} className="text-sm" />
          <button className="px-3 py-1 bg-green-600 rounded" onClick={() => send()} disabled={loading}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
