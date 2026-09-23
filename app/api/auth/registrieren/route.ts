import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { registrieren } from '@/lib/konto/aktionen'
import { ipHash, sitzungSetzen, ursprungOk } from '@/lib/konto/sitzung'
import { rate } from '@/lib/rate'
import { uiSprache } from '@/lib/i18n'

const Schema = z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(200), passwort: z.string().min(1).max(200),
  firma: z.string().trim().min(2).max(120), art: z.enum(['firma', 'sender', 'agentur']), land: z.string().regex(/^[A-Z]{2}$/),
  agb: z.literal(true), werbung: z.boolean().default(false), website: z.string().max(0).optional(),   // website = Honigtopf-Feld für Bots
})

export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    const ip = await ipHash()
    if (!(await rate('registrieren', ip, 5, 3600))) return fehler(429, 'zu_viele', 'zu_viele')
    const d = await koerper(req, Schema)
    const n = await registrieren({ ...d, sprache: await uiSprache(), agb_version: '2026-09-23', ip_hash: ip })
    // Anmelden geht sofort, Erzeugen erst nach Bestätigung (04 §1.2).
    if (n) await sitzungSetzen(n.id, n.sitzung_version)
    return NextResponse.json({ ok: true, angemeldet: !!n })
  } catch (e) { return fehlerAntwort(e) }
}
