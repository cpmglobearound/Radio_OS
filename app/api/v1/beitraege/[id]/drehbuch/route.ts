import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { EMOTIONEN } from '@/lib/tonalitaet'
import { protokoll } from '@/lib/protokoll'
import type { BeitragEinstellungen } from '@/lib/redaktion/typen'

type Ctx = { params: Promise<{ id: string }> }

// Redakteur ändert Zeilen direkt (06 §7): Text, Regie, Emotion, Sprecher, Zeile löschen/einfügen.
// Eine vom Menschen eingefügte Zahl ohne Beleg wird markiert, aber nicht verhindert (Verantwortung + Protokoll).
const Schema = z.object({
  zeilen: z.array(z.object({
    nr: z.number().int().optional(),            // vorhandene Zeile; fehlt = neue Zeile
    rolle: z.string().max(40), text: z.string().trim().min(1).max(600), regie: z.string().max(300).default(''),
    emotion: z.enum(EMOTIONEN).default('warm'), luecke_ms: z.number().int().min(-300).max(3000).default(280), block_id: z.string().nullable().optional(),
  })).min(1).max(600),
})

export const PATCH = mitSitzung<Ctx>('redaktion', async ({ req, s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  if (!['freigabe', 'fertig', 'fertig_mit_hinweisen'].includes(b.status)) throw new ApiFehler(409, 'status', 'status')
  const d = await koerper(req, Schema)
  const e = b.einstellungen as unknown as BeitragEinstellungen
  const rollen = new Set(e.sprecher.map(x => x.rolle))
  if (d.zeilen.some(z => !rollen.has(z.rolle))) throw new ApiFehler(400, 'rolle', 'rolle')
  const alt = await prisma.zeile.findMany({ where: { beitrag_id: id } })
  const altNach = new Map(alt.map(z => [z.nr, z]))
  const geaendert: number[] = []
  await prisma.$transaction(async tx => {
    await tx.zeile.deleteMany({ where: { beitrag_id: id } })
    for (const [i, z] of d.zeilen.entries()) {
      const vorher = z.nr ? altNach.get(z.nr) : undefined
      const gleich = vorher && vorher.text === z.text && vorher.rolle === z.rolle && (vorher.regie ?? '') === z.regie && (vorher.emotion ?? '') === z.emotion
      const befunde = /\d/.test(z.text) ? [{ art: 'ziffern', text: 'ziffern', hart: false }] : []
      if (!gleich) geaendert.push(i + 1)
      await tx.zeile.create({ data: {
        beitrag_id: id, nr: i + 1, rolle: z.rolle, text: z.text, regie: z.regie, emotion: z.emotion, luecke_ms: i === 0 ? 0 : z.luecke_ms,
        block_id: z.block_id ?? vorher?.block_id ?? null, namen: vorher && vorher.text === z.text ? (vorher.namen ?? undefined) : undefined, fakt_ids: gleich ? vorher!.fakt_ids : (vorher?.text === z.text ? vorher.fakt_ids : []),
        befunde: gleich ? (vorher!.befunde ?? undefined) : [...befunde, ...(vorher ? [{ art: 'von_hand', text: 'von_hand', hart: false }] : [{ art: 'neu_von_hand', text: 'neu_von_hand', hart: false }])],
        // Audio bleibt nur, wenn die Zeile unverändert ist — sonst wird sie neu gesprochen.
        ...(gleich ? { audio: vorher!.audio, dauer_s: vorher!.dauer_s, gehoert: vorher!.gehoert, wortgenauigkeit: vorher!.wortgenauigkeit, versuche: vorher!.versuche, warnung: vorher!.warnung } : {}),
      } })
    }
  })
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'drehbuch.geaendert', ziel_typ: 'beitrag', ziel_id: id, daten: { geaendert } })
  return NextResponse.json({ ok: true, geaendert, neu_vertonen: b.status !== 'freigabe' && geaendert.length > 0 })
})
