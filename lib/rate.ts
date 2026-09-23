import { prisma } from '@/lib/db'

/** true = erlaubt. Zählt je (aktion, schlüssel) in festen Zeitfenstern. */
export async function rate(aktion: string, schluessel: string, max: number, fensterS: number) {
  const fenster = Math.floor(Date.now() / 1000 / fensterS)
  const id = `${aktion}:${schluessel}:${fenster}`
  const z = await prisma.ratenzaehler.upsert({
    where: { id }, create: { id, anzahl: 1, bis: new Date((fenster + 1) * fensterS * 1000) }, update: { anzahl: { increment: 1 } },
  })
  return z.anzahl <= max
}
