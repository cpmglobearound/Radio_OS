import { NextResponse } from 'next/server'
import { mitSitzung, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { einreihen } from '@/lib/warteschlange'
import { guthaben, nachbesserungBuchen } from '@/lib/abrechnung/kontobuch'
import { protokoll } from '@/lib/protokoll'

type Ctx = { params: Promise<{ id: string }> }

/**
 * Status freigabe → Vertonung starten.
 * Status fertig → geänderte Zeilen neu vertonen (Nachbessern auf Kundenwunsch kostet deren Sekunden, 17 §2), dann Schnitt neu.
 */
export const POST = mitSitzung<Ctx>('redaktion', async ({ s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  if (b.status === 'freigabe') {
    await prisma.beitrag.update({ where: { id }, data: { status: 'vertonung', fortschritt: { stufe: 'vertonung', prozent: 55, meldung: 'stimmen_sprechen' } } })
    await einreihen('vertonung', { beitrag_id: id }, 20)
  } else if (['fertig', 'fertig_mit_hinweisen'].includes(b.status)) {
    const offen = await prisma.zeile.findMany({ where: { beitrag_id: id, audio: null } })
    if (!offen.length) throw new ApiFehler(409, 'nichts_geaendert', 'nichts_geaendert')
    const schaetzung = Math.ceil(offen.reduce((a, z) => a + z.text.split(/\s+/).length * 0.45, 0) * b.stimmklassen_faktor)
    if ((await guthaben(s.mandant!.id)) < schaetzung) throw new ApiFehler(402, 'guthaben', 'guthaben')
    await nachbesserungBuchen(s.mandant!.id, id, schaetzung)
    await prisma.beitrag.update({ where: { id }, data: { status: 'vertonung', version: { increment: 1 }, fortschritt: { stufe: 'vertonung', prozent: 55, meldung: 'nachbessern' } } })
    await einreihen('vertonung', { beitrag_id: id }, 20)
  } else throw new ApiFehler(409, 'status', 'status')
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'beitrag.freigegeben', ziel_typ: 'beitrag', ziel_id: id })
  return NextResponse.json({ ok: true })
})
