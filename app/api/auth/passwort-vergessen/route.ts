import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fehlerAntwort, fehler, koerper } from '@/lib/api'
import { passwortVergessen } from '@/lib/konto/aktionen'
import { ipHash, ursprungOk } from '@/lib/konto/sitzung'
import { rate } from '@/lib/rate'
import { uiSprache } from '@/lib/i18n'

export async function POST(req: Request) {
  try {
    if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
    if (!(await rate('passwort_vergessen', await ipHash(), 5, 900))) return fehler(429, 'zu_viele', 'zu_viele')
    const d = await koerper(req, z.object({ email: z.string().trim().max(200) }))
    await passwortVergessen(d.email, await uiSprache()).catch(console.error)
    return NextResponse.json({ ok: true })
  } catch (e) { return fehlerAntwort(e) }
}
