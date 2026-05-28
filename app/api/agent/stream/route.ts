import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../../lib/supabaseAdmin'
import ELITE_PROMPT from '../../../../lib/elitePrompt'

// Streaming endpoint: proxies to Copilot SDK gateway or OpenAI stream and relays bytes.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, language } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing `code` in request body' }, { status: 400 })
    }

    // Auth
    const auth = req.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.split(' ')[1]
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: 'Invalid auth token' }, { status: 401 })
    }

    // Rate limiting - reuse same simple in-memory limiter
    const RATE_LIMIT_WINDOW_MS = 60 * 1000
    const MAX_REQUESTS_PER_WINDOW = 10
    // naive store on global (module) is fine for single-instance demos
    ;(global as any)._bughunter_rate = (global as any)._bughunter_rate || new Map()
    const rateMap: Map<string, number[]> = (global as any)._bughunter_rate
    const now = Date.now()
    const arr = rateMap.get(userData.user.id) || []
    const filtered = arr.filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
    filtered.push(now)
    rateMap.set(userData.user.id, filtered)
    if (filtered.length > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    const prompt = `${ELITE_PROMPT}\n\nUser code (language=${language || 'auto'}):\n${code}`

    // Choose provider
    if (process.env.COPILOT_SDK_KEY && process.env.COPILOT_SDK_BASE_URL) {
      const base = process.env.COPILOT_SDK_BASE_URL.replace(/\/$/, '')
      const upstream = await fetch(`${base}/v1/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.COPILOT_SDK_KEY}` },
        body: JSON.stringify({ model: 'elite-bughunter', input: prompt, stream: true })
      })

      if (!upstream.ok) {
        const txt = await upstream.text()
        return NextResponse.json({ ok: false, error: `Upstream error: ${txt}` }, { status: 502 })
      }

      const reader = upstream.body!.getReader()
      const stream = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read()
          if (done) {
            controller.close()
            return
          }
          controller.enqueue(value)
        },
        cancel() {
          reader.cancel()
        }
      })

      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
    }

    // Fallback to OpenAI streaming
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: ELITE_PROMPT }, { role: 'user', content: code }], stream: true })
      })

      if (!res.ok) {
        const txt = await res.text()
        return NextResponse.json({ ok: false, error: `OpenAI error: ${txt}` }, { status: 502 })
      }

      const reader = res.body!.getReader()
      const stream = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read()
          if (done) {
            controller.close()
            return
          }
          controller.enqueue(value)
        },
        cancel() {
          reader.cancel()
        }
      })

      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
    }

    return NextResponse.json({ ok: false, error: 'No streaming LLM configured' }, { status: 500 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
