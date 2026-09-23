import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Sprach-Links (z. B. aus E-Mails): /?sprache=es setzt die Oberflächensprache und leitet auf die saubere Adresse weiter.
const SPRACHEN = ['de', 'en', 'es']

export function proxy(request: NextRequest) {
  const sprache = request.nextUrl.searchParams.get('sprache')
  if (!sprache || !SPRACHEN.includes(sprache)) return NextResponse.next()
  const ziel = request.nextUrl.clone()
  ziel.searchParams.delete('sprache')
  const res = NextResponse.redirect(ziel)
  res.cookies.set('radio_sprache', sprache, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return res
}

export const config = {
  // Nur Seiten, keine API, keine Dateien.
  matcher: ['/((?!api|_next|hoerbeispiele|marke|favicon|apple-icon|.*\\..*).*)'],
}
