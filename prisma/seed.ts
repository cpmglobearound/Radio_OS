// Katalog-Startwerte = Vorschläge aus 16/17. Änderbar in der DB (Admin), nie fest im Code.
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const einzel: [number, number, number | null][] = [[5, 8.9, null], [10, 14.9, null], [15, 21.9, null], [20, 27.9, null], [30, 39.9, null], [45, 58.9, null], [60, 78.9, 1.29]]
  for (const [bis, preis, weitere] of einzel) await p.einzelpreis.upsert({ where: { bis_minuten: bis }, create: { bis_minuten: bis, preis_eur: preis, je_weitere_minute_eur: weitere }, update: {} })
  const tarife = [
    { id: 'start', name: 'Start', preis_eur: 69, minuten_inkl: 60, max_sendungen: 1, max_nutzer: 2, auslieferung: ['download', 'feed'] },
    { id: 'pro', name: 'Pro', preis_eur: 269, minuten_inkl: 240, max_sendungen: 5, max_nutzer: 5, auslieferung: ['download', 'feed', 'stream', 'webhook', 'sftp', 's3'] },
    { id: 'sender', name: 'Sender', preis_eur: 999, minuten_inkl: 900, max_sendungen: 25, max_nutzer: 15, auslieferung: ['download', 'feed', 'stream', 'webhook', 'sftp', 's3', 'playout'] },
    { id: 'sender_xl', name: 'Sender XL', preis_eur: 2690, minuten_inkl: 2400, max_sendungen: null, max_nutzer: 40, auslieferung: ['download', 'feed', 'stream', 'webhook', 'sftp', 's3', 'playout'] },
  ]
  for (const t of tarife) await p.tarif.upsert({ where: { id: t.id }, create: t, update: {} })
  for (const [id, min, preis] of [['n30', 30, 35], ['n120', 120, 139], ['n500', 500, 559]] as const) await p.nachkaufpaket.upsert({ where: { id }, create: { id, minuten: min, preis_eur: preis }, update: {} })
  const einst: [string, unknown][] = [['probe_sekunden', 600], ['premium_faktor', 1.5], ['stimmproben_pro_tag', 20]]
  for (const [k, w] of einst) await p.einstellung.upsert({ where: { schluessel: k }, create: { schluessel: k, wert: w as object }, update: {} })
}
main().then(() => p.$disconnect())
