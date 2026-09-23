import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { AUSGABESPRACHEN } from '@/lib/sprachen'
import { protokoll } from '@/lib/protokoll'

// Aussprache-Lexikon (07 §4.6): Einträge des Mandanten + globale Klarframe-Einträge (nur lesen; Admins pflegen global).
export const GET = mitSitzung('redaktion', async ({ req, s }) => {
  const sprache = new URL(req.url).searchParams.get('sprache') || undefined
  const eintraege = await prisma.aussprache.findMany({ where: { ...(sprache ? { sprache } : {}), OR: [{ mandant_id: s.mandant!.id }, { mandant_id: null }] }, orderBy: [{ sprache: 'asc' }, { wort: 'asc' }] })
  return NextResponse.json({ eintraege: eintraege.map(e => ({ id: e.id, sprache: e.sprache, wort: e.wort, sprich_als: e.sprich_als, global: e.mandant_id === null })), darf_global: s.nutzer.ist_admin })
})

const Schema = z.object({
  sprache: z.enum(AUSGABESPRACHEN.map(x => x.code) as [string, ...string[]]),
  wort: z.string().trim().min(1).max(80), sprich_als: z.string().trim().min(1).max(120),
  global: z.boolean().default(false),   // nur Klarframe-Admin
})
export const POST = mitSitzung('redaktion', async ({ req, s }) => {
  const d = await koerper(req, Schema)
  if (d.global && !s.nutzer.ist_admin) throw new ApiFehler(403, 'keine_rechte', 'keine_rechte')
  const mandant_id = d.global ? null : s.mandant!.id
  const vorhanden = await prisma.aussprache.findFirst({ where: { mandant_id, sprache: d.sprache, wort: d.wort } })
  const e = vorhanden
    ? await prisma.aussprache.update({ where: { id: vorhanden.id }, data: { sprich_als: d.sprich_als } })
    : await prisma.aussprache.create({ data: { mandant_id, sprache: d.sprache, wort: d.wort, sprich_als: d.sprich_als } })
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'aussprache.gespeichert', ziel_typ: 'aussprache', ziel_id: e.id, daten: { wort: d.wort, global: d.global } })
  return NextResponse.json({ id: e.id }, { status: 201 })
})
