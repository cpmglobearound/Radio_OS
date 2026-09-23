import { NextResponse } from 'next/server'
import { z } from 'zod'
import { mitSitzung, koerper } from '@/lib/api'
import { prisma } from '@/lib/db'
import { preisKatalog } from '@/lib/abrechnung/katalog'
import { bestellen } from '@/lib/abrechnung/bestellung'

/** Bestellbare Pakete (aus dem Katalog) + eigene Bestellungen. */
export const GET = mitSitzung('admin', async ({ s }) => {
  const [k, bestellungen] = await Promise.all([preisKatalog(), prisma.bestellung.findMany({ where: { mandant_id: s.mandant!.id }, orderBy: { erstellt_am: 'desc' }, take: 50 })])
  return NextResponse.json({
    abos: k.tarife.map(t => ({ id: t.id, name: t.name, minuten: t.minuten_inkl, preis_eur: t.preis_eur, max_sendungen: t.max_sendungen, max_nutzer: t.max_nutzer })),
    nachkauf: k.nachkauf.map(n => ({ id: n.id, minuten: n.minuten, preis_eur: n.preis_eur })),
    einzel: k.einzel.map(e => ({ id: e.id, minuten: e.bis_minuten, preis_eur: e.preis_eur })),
    aktuelles_abo: s.mandant!.tarif_id,
    bestellungen: bestellungen.map(({ nutzer_id: _n, erledigt_von: _e, ...b }) => b),
  })
})

/** Bestellen (Inhaber/Admin des Mandanten — Abrechnung, 04 §5). Mail an Klarframe + Bestätigung an den Kunden. */
export const POST = mitSitzung('admin', async ({ req, s }) => {
  const d = await koerper(req, z.object({ art: z.enum(['abo', 'nachkauf', 'einzel']), produkt_id: z.string().max(60), notiz: z.string().max(1000).optional() }))
  const b = await bestellen(s, d.art, d.produkt_id, d.notiz)
  return NextResponse.json({ id: b.id, status: b.status }, { status: 201 })
})
