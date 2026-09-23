import { NextResponse } from 'next/server'
import { mitSitzung } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { abrechnen } from '@/lib/abrechnung/kontobuch'
import { loeschenPraefix } from '@/lib/speicher'
import { protokoll } from '@/lib/protokoll'

type Ctx = { params: Promise<{ id: string }> }

/** Beitrag inkl. Status, Fortschritt, Drehbuch (Zeilen + Belege), Quellen. Kosten sieht der Kunde nie (01 §5). */
export const GET = mitSitzung<Ctx>('hoeren', async ({ s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  const [zeilen, bloecke, fakten] = await Promise.all([
    prisma.zeile.findMany({ where: { beitrag_id: id }, orderBy: { nr: 'asc' } }),
    prisma.themenblock.findMany({ where: { beitrag_id: id }, orderBy: { reihenfolge: 'asc' } }),
    prisma.fakt.findMany({ where: { beitrag_id: id }, select: { id: true, aussage: true, zahl: true, zitat: true, quelle_name: true, url: true, datum: true, themenblock_id: true } }),
  ])
  const { kosten: _k, fehler_technisch: _f, ...rest } = b
  void _k; void _f
  return NextResponse.json({
    beitrag: { ...rest, bestellt: !!s.mandant!.bestellt_am },
    bloecke: bloecke.map(x => ({ id: x.id, thema: x.thema, blickwinkel: x.blickwinkel })),
    zeilen: zeilen.map(z => ({ nr: z.nr, rolle: z.rolle, block_id: z.block_id, text: z.text, regie: z.regie, emotion: z.emotion, luecke_ms: z.luecke_ms, fakt_ids: z.fakt_ids, befunde: z.befunde, hat_audio: !!z.audio, dauer_s: z.dauer_s, wortgenauigkeit: z.wortgenauigkeit, versuche: z.versuche, warnung: z.warnung, gehoert: z.gehoert })),
    fakten: fakten.map(f => ({ ...f, url: f.url.startsWith('eigener-text://') ? null : f.url })),
  })
})

export const DELETE = mitSitzung<Ctx>('redaktion', async ({ s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  if (!['fertig', 'fertig_mit_hinweisen', 'fehlgeschlagen', 'freigabe'].includes(b.status)) return NextResponse.json({ error: 'laeuft', code: 'laeuft' }, { status: 409 })
  if (b.status === 'freigabe') await abrechnen(id, false)   // Reservierung zurück
  await prisma.beitrag.delete({ where: { id } })
  await loeschenPraefix(`m/${s.mandant!.id}/b/${id}`)
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'beitrag.geloescht', ziel_typ: 'beitrag', ziel_id: id })
  return NextResponse.json({ ok: true })
})
