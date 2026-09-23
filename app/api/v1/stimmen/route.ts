import { NextResponse } from 'next/server'
import { anbietbareStimmen } from '@/lib/stimmen/katalog'
import { prisma } from '@/lib/db'

/** Nur freigegebene Stimmen (Regel 7); je Stimme Hörprobe in der angefragten Sprache. */
export async function GET(req: Request) {
  const sprache = new URL(req.url).searchParams.get('sprache') || undefined
  const stimmen = await anbietbareStimmen(sprache)
  const anbieter = Object.fromEntries((await prisma.stimmAnbieter.findMany()).map(a => [a.id, a]))
  return NextResponse.json({ stimmen: stimmen.map(s => ({
    id: s.id, name: s.name, anbieter: anbieter[s.anbieter_id]?.name ?? s.anbieter_id, geschlecht: s.geschlecht, alter: s.alter, stil: s.stil, kann_lachen: s.kann_lachen,
    klassen_faktor: anbieter[s.anbieter_id]?.klassen_faktor ?? 1, sprachen: (s.sprachen as { code: string; geprueft: boolean; muttersprachlich: boolean }[]).filter(x => x.geprueft).map(x => x.code),
    hoerprobe_url: sprache && (s.hoerprobe as Record<string, string>)[sprache] ? `/api/v1/stimmen/${encodeURIComponent(s.id)}/hoerprobe?sprache=${sprache}` : null,
  })) })
}
