import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { blockPlan, drehbuchSpeichern } from '@/lib/produktion/strecke'
import { drehbuchUeberarbeiten, drehbuchErstellen } from '@/lib/redaktion/drehbuch'
import { rate } from '@/lib/rate'
import { protokoll } from '@/lib/protokoll'
import type { BeitragEinstellungen, Drehbuch } from '@/lib/redaktion/typen'
import type { Emotion } from '@/lib/tonalitaet'

type Ctx = { params: Promise<{ id: string }> }
export const maxDuration = 300

/** „Per Prompt neu schreiben lassen" (Wunsch Oliver): ganzes Drehbuch, ein Block oder eine Zeile — danach wieder alle Prüfungen. */
export const POST = mitSitzung<Ctx>('redaktion', async ({ req, s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  if (!['freigabe', 'fertig', 'fertig_mit_hinweisen'].includes(b.status)) throw new ApiFehler(409, 'status', 'status')
  if (!(await rate('ueberarbeiten', s.mandant!.id, 60, 86400))) throw new ApiFehler(429, 'zu_viele', 'zu_viele')
  const d = await koerper(req, z.object({ anweisung: z.string().trim().min(3).max(2000), block_id: z.string().optional(), zeile: z.number().int().min(1).optional() }))
  const e = b.einstellungen as unknown as BeitragEinstellungen
  const { plan, blockDbIds, quelltexte } = await blockPlan(id)
  const dbZuPlan = Object.fromEntries(Object.entries(blockDbIds).map(([k, v]) => [v, k]))
  const zeilen = await prisma.zeile.findMany({ where: { beitrag_id: id }, orderBy: { nr: 'asc' } })
  const alt: Drehbuch = {
    titel: b.titel, bloecke: plan.map(p => ({ id: p.id, thema: p.thema, blickwinkel: '' })),
    zeilen: zeilen.map(z => ({ rolle: z.rolle, block: dbZuPlan[z.block_id ?? ''] ?? plan[0]?.id ?? 'b1', text: z.text, regie: z.regie ?? '', emotion: (z.emotion ?? 'warm') as Emotion, luecke_ms: z.luecke_ms, fakten: z.fakt_ids.map(f => f.slice(id.length + 1)) })),
  }
  const u = await drehbuchUeberarbeiten(e, plan, alt, d.anweisung, { block: d.block_id ? dbZuPlan[d.block_id] : undefined, zeile: d.zeile })
  const r = await drehbuchErstellen(e, plan, quelltexte, u.drehbuch)
  // Unveränderte Zeilen behalten ihr Audio (Nachbessern kostet nur neue Zeilen).
  const altAudio = new Map(zeilen.map(z => [`${z.rolle}|${z.text}|${z.regie}|${z.emotion}`, z]))
  await drehbuchSpeichern(id, r.drehbuch, blockDbIds)
  const neu = await prisma.zeile.findMany({ where: { beitrag_id: id }, orderBy: { nr: 'asc' } })
  const geaendert: number[] = []
  for (const z of neu) {
    const a = altAudio.get(`${z.rolle}|${z.text}|${z.regie}|${z.emotion}`)
    if (a?.audio) await prisma.zeile.update({ where: { id: z.id }, data: { audio: a.audio, dauer_s: a.dauer_s, gehoert: a.gehoert, wortgenauigkeit: a.wortgenauigkeit, versuche: a.versuche, warnung: a.warnung } })
    else geaendert.push(z.nr)
  }
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'drehbuch.ueberarbeitet', ziel_typ: 'beitrag', ziel_id: id, daten: { anweisung: d.anweisung.slice(0, 300), geaendert } })
  return NextResponse.json({ ok: true, geaendert, neu_vertonen: b.status !== 'freigabe' && geaendert.length > 0 })
})
