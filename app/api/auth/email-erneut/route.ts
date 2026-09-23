import { NextResponse } from 'next/server'
import { fehler } from '@/lib/api'
import { bestaetigungSenden } from '@/lib/konto/aktionen'
import { aktuelleSitzung, ursprungOk } from '@/lib/konto/sitzung'
import { rate } from '@/lib/rate'

export async function POST() {
  if (!(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
  const s = await aktuelleSitzung()
  if (!s) return fehler(401, 'nicht_angemeldet', 'nicht_angemeldet')
  if (!(await rate('email_erneut', s.nutzer.id, 3, 3600))) return fehler(429, 'zu_viele', 'zu_viele')
  await bestaetigungSenden(s.nutzer.id)
  return NextResponse.json({ ok: true })
}
