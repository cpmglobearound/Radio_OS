import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { anmeldelinkEinloesen, anmeldelinkSenden } from '@/lib/konto/aktionen'
import { ipHash, sitzungSetzen, ursprungOk } from '@/lib/konto/sitzung'
import { rate } from '@/lib/rate'
import { uiSprache } from '@/lib/i18n'

/** Anmelde-Link anfordern — Antwort immer gleich (keine Kontenaufzählung). */
export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    if (!(await rate('anmeldelink', await ipHash(), 5, 900))) return fehler(429, 'zu_viele', 'zu_viele')
    const d = await koerper(req, z.object({ email: z.string().trim().max(200) }))
    await anmeldelinkSenden(d.email, await uiSprache()).catch(console.error)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}

/** Link aus der Mail einlösen → Sitzung → Portal. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const basis = process.env.APP_URL || url.origin
  const n = await anmeldelinkEinloesen(url.searchParams.get('token') || '')
  if (!n) return NextResponse.redirect(`${basis}/anmelden?link=ungueltig`)
  await sitzungSetzen(n.id, n.sitzung_version)
  return NextResponse.redirect(`${basis}/portal`)
}
