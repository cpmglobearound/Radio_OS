import { NextResponse } from 'next/server'
import { mitSitzung, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'

/** Eintrag löschen: eigene Einträge (Redaktion+), globale nur Klarframe-Admin. Fremde → 404. */
export const DELETE = mitSitzung<{ params: Promise<{ id: string }> }>('redaktion', async ({ s, ctx }) => {
  const { id } = await ctx.params
  const e = await prisma.aussprache.findUnique({ where: { id } })
  if (!e || (e.mandant_id !== null && e.mandant_id !== s.mandant!.id)) throw new ApiFehler(404, 'nicht_gefunden', 'nicht_gefunden')
  if (e.mandant_id === null && !s.nutzer.ist_admin) throw new ApiFehler(403, 'keine_rechte', 'keine_rechte')
  await prisma.aussprache.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
