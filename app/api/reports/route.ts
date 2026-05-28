import { NextResponse } from 'next/server'
import supabaseAdmin from '../../../lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, summary, analysis, severity } = body

    // Require auth header
    const auth = req.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.split(' ')[1]
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: false, error: 'Invalid auth token' }, { status: 401 })
    }
    const user_id = userData.user.id

    const { data, error } = await supabaseAdmin.from('reports').insert([
      { user_id, title, summary, analysis, severity }
    ])

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, report: data?.[0] })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
