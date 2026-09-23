import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { nurAdmin } from '@/lib/admin'

/** Freigabe-Warteschlange: alle Stimmen inkl. ungeprüfter, mit Ergebnis der automatischen Prüfung je Sprache. */
export const GET = nurAdmin(async () => {
  const stimmen = await prisma.stimme.findMany({ orderBy: [{ anbieter_id: 'asc' }, { sortierung: 'asc' }] })
  return NextResponse.json({ stimmen: stimmen.map(s => ({ ...s, hoerproben: Object.fromEntries(Object.keys(s.hoerprobe as object).map(k => [k, `/api/v1/stimmen/${encodeURIComponent(s.id)}/hoerprobe?sprache=${k}`])) })) })
})
