import { PgBoss } from 'pg-boss'

// Stufen als eigene Aufträge (02 §4). Fällt ein Schritt aus, wird nur dieser wiederholt.
export const STUFEN = {
  recherche: { name: 'recherche', retryLimit: 2, expireInSeconds: 3600 },
  redaktion: { name: 'redaktion', retryLimit: 2, expireInSeconds: 5400 },
  vertonung: { name: 'vertonung', retryLimit: 1, expireInSeconds: 7200 },
  schnitt: { name: 'schnitt', retryLimit: 1, expireInSeconds: 3600 },
} as const
export type Stufe = keyof typeof STUFEN

let boss: PgBoss | null = null
let start: Promise<PgBoss> | null = null

export function warteschlange() {
  start ??= (async () => {
    boss = new PgBoss({ connectionString: process.env.DATABASE_URL!, schema: 'warteschlange' })
    boss.on('error', e => console.error('pg-boss', e))
    await boss.start()
    for (const s of Object.values(STUFEN)) {
      const opt = { retryLimit: s.retryLimit, retryDelay: 20, retryBackoff: true, expireInSeconds: s.expireInSeconds, heartbeatSeconds: 60 }   // stirbt ein Arbeiter, wird der Auftrag nach ~1 min neu vergeben
      await boss.createQueue(s.name, opt).catch(() => {})
      await boss.updateQueue(s.name, opt).catch(e => console.error('updateQueue', s.name, e))   // bestehende Warteschlangen auf aktuelle Grenzen bringen
    }
    return boss
  })()
  return start
}

/** Auftrag einstellen; singletonKey verhindert doppelte gleichzeitige Aufträge je Beitrag+Stufe (idempotent). Einzelaufträge haben Vorrang. */
export async function einreihen(stufe: Stufe, daten: { beitrag_id: string; [k: string]: unknown }, vorrang = 10) {
  const b = await warteschlange()
  return b.send(STUFEN[stufe].name, daten, { singletonKey: `${daten.beitrag_id}:${stufe}`, priority: vorrang })
}
