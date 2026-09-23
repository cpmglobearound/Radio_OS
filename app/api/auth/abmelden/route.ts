import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { aktuelleSitzung, sitzungLoeschen, ursprungOk } from '@/lib/konto/sitzung'

/** { ueberall?: true } beendet alle Sitzungen auf allen Geräten. */
export async function POST(req: Request) {
  if (!(await ursprungOk())) return NextResponse.json({ error: 'ursprung', code: 'ursprung' }, { status: 403 })
  const { ueberall } = await req.json().catch(() => ({}))
  const s = await aktuelleSitzung()
  if (s && ueberall) await prisma.nutzer.update({ where: { id: s.nutzer.id }, data: { sitzung_version: { increment: 1 } } })
  await sitzungLoeschen()
  return NextResponse.json({ ok: true })
}
