import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { anmelden } from '@/lib/konto/aktionen'
import { ipHash, sitzungSetzen, ursprungOk } from '@/lib/konto/sitzung'
import { rate } from '@/lib/rate'

const Schema = z.object({ email: z.string().trim().max(200), passwort: z.string().max(200) })

export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const ip = await ipHash()
    if (!(await rate('anmelden', ip, 20, 900))) return fehler(429, 'zu_viele', 'zu_viele')
    const d = await koerper(req, Schema)
    const n = await anmelden(d.email, d.passwort, ip)
    if (n === 'gesperrt') return fehler(429, 'gesperrt', 'gesperrt')
    if (!n) return fehler(401, 'falsch', 'falsch')
    await sitzungSetzen(n.id, n.sitzung_version)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
