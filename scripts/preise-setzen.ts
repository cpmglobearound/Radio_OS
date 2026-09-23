// Preise im Katalog setzen — Kalkulation: docs/17 §8 (mind. 75 % Marge im teuersten Fall, Stand 23.09.2026).
import { prisma } from '@/lib/db'

const EINZEL: [number, number, number | null][] = [[5, 8.9, null], [10, 14.9, null], [15, 21.9, null], [20, 27.9, null], [30, 39.9, null], [45, 58.9, null], [60, 78.9, 1.29]]
const TARIFE: [string, number, number][] = [['start', 69, 60], ['pro', 269, 240], ['sender', 999, 900], ['sender_xl', 2690, 2400]]
const NACHKAUF: [string, number, number][] = [['n30', 30, 35], ['n120', 120, 139], ['n500', 500, 559]]

async function main() {
  for (const [bis, preis, weitere] of EINZEL) await prisma.einzelpreis.upsert({ where: { bis_minuten: bis }, create: { bis_minuten: bis, preis_eur: preis, je_weitere_minute_eur: weitere }, update: { preis_eur: preis, je_weitere_minute_eur: weitere } })
  for (const [id, preis, min] of TARIFE) await prisma.tarif.update({ where: { id }, data: { preis_eur: preis, minuten_inkl: min } })
  for (const [id, min, preis] of NACHKAUF) await prisma.nachkaufpaket.upsert({ where: { id }, create: { id, minuten: min, preis_eur: preis }, update: { minuten: min, preis_eur: preis } })
  console.log('Preise gesetzt')
}
main().then(() => process.exit(0))
