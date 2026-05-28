import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, title, summary, analysis, severity } = body

    if (!user_id) return NextResponse.json({ ok: false, error: 'Missing user_id' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('reports').insert([
      { user_id, title, summary, analysis, severity }
    ])

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, report: data?.[0] })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
