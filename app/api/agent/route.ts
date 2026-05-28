import { NextResponse } from 'next/server'
import { analyzeCode } from '../../../lib/copilotClient'
import supabaseAdmin from '../../../lib/supabaseAdmin'

// Simple in-memory rate limiter (per-user). In production use Redis.
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10
const rateMap: Map<string, number[]> = new Map()

function isRateLimited(key: string) {
  const now = Date.now()
  const arr = rateMap.get(key) || []
  const filtered = arr.filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
  filtered.push(now)
  rateMap.set(key, filtered)
  return filtered.length > MAX_REQUESTS_PER_WINDOW
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, language } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing `code` in request body' }, { status: 400 })
    }

    // Basic input size limit
    const maxChars = Number(process.env.MAX_CODE_CHARS || 20000)
    if (code.length > maxChars) {
      return NextResponse.json({ ok: false, error: `Code too large (>${maxChars} chars)` }, { status: 413 })
    }

    // Auth: require Authorization: Bearer <access_token>
    const auth = req.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.split(' ')[1]
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: 'Invalid auth token' }, { status: 401 })
    }
    const userId = userData.user.id

    // Rate limit per user id
    if (isRateLimited(userId)) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Sanitize? For now, avoid executing any uploaded code — only analyze as text.
    const safeCode = code.replace(/\u0000/g, '')

    const result = await analyzeCode(safeCode, language || 'solidity')

    return NextResponse.json({ ok: true, analysis: result.text })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
