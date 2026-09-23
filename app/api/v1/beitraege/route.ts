import { NextResponse } from 'next/server'
import { mitSitzung, koerper } from '@/lib/api'
import { AuftragSchema, beitragErzeugen } from '@/lib/beitrag/erstellen'
import { beitraegeVon } from '@/lib/mandant/zugriff'

export const GET = mitSitzung('hoeren', async ({ req, s }) => {
  const u = new URL(req.url)
  const liste = await beitraegeVon(s.mandant!.id, { status: u.searchParams.get('status') || undefined, cursor: u.searchParams.get('cursor') || undefined })
  const mehr = liste.length > 30
  const seite = liste.slice(0, 30).map(({ einstellungen, ...b }) => {
    const e = einstellungen as { format?: string; sprache?: string; sprecher?: { name: string }[]; ziel_laenge_s?: number }
    return { ...b, format: e.format, sprache: e.sprache, sprecher: e.sprecher?.map(x => x.name) ?? [], ziel_laenge_s: e.ziel_laenge_s }
  })
  return NextResponse.json({ beitraege: seite, next_cursor: mehr ? seite.at(-1)?.id : null })
})

export const POST = mitSitzung('redaktion', async ({ req, s }) => {
  const a = await koerper(req, AuftragSchema)
  const b = await beitragErzeugen(a, s)
  return NextResponse.json({ id: b.id, status: b.status }, { status: 202 })
})
