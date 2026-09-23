import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { passwortNeuMitToken } from '@/lib/konto/aktionen'
import { sitzungSetzen, ursprungOk } from '@/lib/konto/sitzung'

export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const d = await koerper(req, z.object({ token: z.string().max(200), passwort: z.string().max(200) }))
    const n = await passwortNeuMitToken(d.token, d.passwort)
    await sitzungSetzen(n.id, n.sitzung_version)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
