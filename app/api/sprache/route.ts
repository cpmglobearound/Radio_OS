import { NextResponse } from 'next/server'
import { alsUiSprache, SPRACH_COOKIE } from '@/lib/i18n'

/** Sprache der Oberfläche umschalten: POST { sprache: "de"|"en"|"es" } */
export async function POST(req: Request) {
  const { sprache } = await req.json().catch(() => ({}))
  const s = alsUiSprache(sprache)
  if (!s) return NextResponse.json({ error: 'Unbekannte Sprache', code: 'sprache_unbekannt' }, { status: 400 })
  const res = NextResponse.json({ ok: true, sprache: s })
  res.cookies.set(SPRACH_COOKIE, s, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return res
}
