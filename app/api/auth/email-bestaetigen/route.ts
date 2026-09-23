import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { emailBestaetigen } from '@/lib/konto/aktionen'
import { sitzungSetzen } from '@/lib/konto/sitzung'

export async function POST(req: Request) {
  try {
    const d = await koerper(req, z.object({ token: z.string().max(200) }))
    const n = await emailBestaetigen(d.token)
    if (!n) return fehler(400, 'token_ungueltig', 'token_ungueltig')
    await sitzungSetzen(n.id, n.sitzung_version)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
