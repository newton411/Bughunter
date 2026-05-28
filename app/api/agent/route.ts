import { NextResponse } from 'next/server'
import { analyzeCode } from '../../../lib/copilotClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, language } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing `code` in request body' }, { status: 400 })
    }

    const result = await analyzeCode(code, language || 'solidity')

    return NextResponse.json({ ok: true, analysis: result.text })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
