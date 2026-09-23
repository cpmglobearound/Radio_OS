import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

type Tx = Prisma.TransactionClient | typeof prisma

/** Guthaben = Summe des Kontobuchs. Es gibt keinen zweiten Zähler (Lehre CALL4ME). */
export async function guthaben(mandantId: string, tx: Tx = prisma) {
  const r = await tx.buchung.aggregate({ where: { mandant_id: mandantId }, _sum: { sekunden: true } })
  return r._sum.sekunden ?? 0
}

export async function gutschriftSumme(mandantId: string) {
  const r = await prisma.buchung.aggregate({ where: { mandant_id: mandantId, sekunden: { gt: 0 }, art: { in: ['monat_gutschrift', 'nachkauf', 'probe', 'einzelkauf', 'korrektur'] } }, _sum: { sekunden: true } })
  return r._sum.sekunden ?? 0
}

/** Reservierung beim Start. Reicht das Guthaben nicht: kein Start (Sperre statt Nachberechnung, Regel 4). */
export async function reservieren(mandantId: string, beitragId: string, sekunden: number) {
  return prisma.$transaction(async tx => {
    // Zeile des Mandanten sperren, damit zwei gleichzeitige Starts nicht dasselbe Guthaben nutzen.
    await tx.$queryRaw`SELECT id FROM "Mandant" WHERE id = ${mandantId} FOR UPDATE`
    const g = await guthaben(mandantId, tx)
    if (g < sekunden) return { ok: false as const, guthaben: g }
    await tx.buchung.create({ data: { mandant_id: mandantId, art: 'reservierung', sekunden: -sekunden, beitrag_id: beitragId } })
    await tx.beitrag.update({ where: { id: beitragId }, data: { reserviert_s: sekunden } })
    return { ok: true as const, guthaben: g - sekunden }
  })
}

/** Abschluss: Reservierung zurück, echter Verbrauch (höchstens Ziel + 15 %) × Faktor. Idempotent über abgerechnet_s. */
export async function abrechnen(beitragId: string, fertig: boolean) {
  return prisma.$transaction(async tx => {
    const b = await tx.beitrag.findUniqueOrThrow({ where: { id: beitragId } })
    if (b.abgerechnet_s !== null) return b.abgerechnet_s
    if (b.reserviert_s > 0) await tx.buchung.create({ data: { mandant_id: b.mandant_id, art: 'freigabe', sekunden: b.reserviert_s, beitrag_id: b.id } })
    let verbrauch = 0
    if (fertig && b.laenge_s) {
      const ziel = Number((b.einstellungen as { ziel_laenge_s?: number }).ziel_laenge_s || b.laenge_s)
      verbrauch = Math.ceil(Math.min(b.laenge_s, ziel * 1.15) * b.stimmklassen_faktor)
      await tx.buchung.create({ data: { mandant_id: b.mandant_id, art: 'verbrauch', sekunden: -verbrauch, beitrag_id: b.id } })
    }
    await tx.beitrag.update({ where: { id: b.id }, data: { abgerechnet_s: verbrauch, reserviert_s: 0 } })
    return verbrauch
  })
}

/** Nachträgliches Neusprechen auf Kundenwunsch kostet die Sekunden der Zeile (17 §2). */
export async function nachbesserungBuchen(mandantId: string, beitragId: string, sekunden: number) {
  if (sekunden <= 0) return
  await prisma.buchung.create({ data: { mandant_id: mandantId, art: 'verbrauch', sekunden: -Math.ceil(sekunden), beitrag_id: beitragId, notiz: 'Nachbesserung' } })
}

export const minSek = (s: number) => { const v = Math.max(0, Math.round(s)); return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}` }

/**
 * Minutenzähler fürs Dashboard — alles aus dem Kontobuch abgeleitet (keine zweite Zählung).
 * Monat = Kalendermonat in der Zeitzone des Mandanten.
 */
export async function minutenZaehler(mandantId: string) {
  const m = await prisma.mandant.findUniqueOrThrow({ where: { id: mandantId }, select: { zeitzone: true } })
  const [r] = await prisma.$queryRaw<{ monatsbeginn: Date }[]>`SELECT (date_trunc('month', now() AT TIME ZONE ${m.zeitzone}) AT TIME ZONE ${m.zeitzone}) AS monatsbeginn`
  const ab = r.monatsbeginn
  const [stand, gutschrift, verbrauch, laufend, beitraege] = await Promise.all([
    guthaben(mandantId),
    gutschriftSumme(mandantId),
    prisma.buchung.aggregate({ where: { mandant_id: mandantId, art: 'verbrauch', zeit: { gte: ab } }, _sum: { sekunden: true } }),
    prisma.beitrag.aggregate({ where: { mandant_id: mandantId, reserviert_s: { gt: 0 } }, _sum: { reserviert_s: true }, _count: true }),
    prisma.beitrag.count({ where: { mandant_id: mandantId, erstellt_am: { gte: ab }, status: { in: ['fertig', 'fertig_mit_hinweisen'] } } }),
  ])
  return {
    sekunden: stand, gutschrift_sekunden: gutschrift,
    verbraucht_monat_s: -(verbrauch._sum.sekunden ?? 0), reserviert_s: laufend._sum.reserviert_s ?? 0, laufend: laufend._count,
    beitraege_monat: beitraege, monatsbeginn: ab.toISOString(),
  }
}
