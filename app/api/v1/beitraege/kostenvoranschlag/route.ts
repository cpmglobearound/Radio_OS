import { NextResponse } from 'next/server'
import { mitSitzung, koerper } from '@/lib/api'
import { AuftragSchema, auftragPruefen } from '@/lib/beitrag/erstellen'

/** Vor dem Start: Stufe, Preis, reservierte Minuten, Guthaben danach (10 §1). */
export const POST = mitSitzung('redaktion', async ({ req, s }) => {
  const a = await koerper(req, AuftragSchema)
  const p = await auftragPruefen(a, s)
  return NextResponse.json({ stufe: p.preis.stufe, preis_eur: p.preis.preis_eur, reservierte_sekunden: p.preis.reservierte_sekunden, guthaben: p.guthaben, guthaben_danach: p.guthaben_danach, reicht: p.reicht, stimmklassen_faktor: p.faktor, begruendung: p.preis.begruendung, ist_probe: p.einstellungen.ist_probe })
})
