import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { nurAdmin } from '@/lib/admin'

/** Alle Bestellungen (Klarframe-Admin), neueste zuerst; ?status=offen|freigeschaltet|storniert */
export const GET = nurAdmin(async ({ req }) => {
  const status = new URL(req.url).searchParams.get('status') || undefined
  const liste = await prisma.bestellung.findMany({ where: status ? { status } : {}, orderBy: { erstellt_am: 'desc' }, take: 200 })
  const mandanten = await prisma.mandant.findMany({ where: { id: { in: [...new Set(liste.map(b => b.mandant_id))] } }, select: { id: true, name: true, art: true, land: true, tarif_id: true } })
  const nutzer = await prisma.nutzer.findMany({ where: { id: { in: [...new Set(liste.map(b => b.nutzer_id))] } }, select: { id: true, name: true, email: true } })
  const m = new Map(mandanten.map(x => [x.id, x])), n = new Map(nutzer.map(x => [x.id, x]))
  return NextResponse.json({ bestellungen: liste.map(b => ({ ...b, mandant: m.get(b.mandant_id), nutzer: n.get(b.nutzer_id) })) })
})
