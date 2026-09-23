// Arbeiter: holt Aufträge aus der Warteschlange und führt die Stufen aus (02 §4).
// Sanfter Neustart (13 §4): bei SIGTERM keine neuen Aufträge, laufende Schritte werden beendet.
import { prisma } from '@/lib/db'
import { warteschlange, STUFEN } from '@/lib/warteschlange'
import { Abgebrochen, KundenFehler, fehlschlagen, stufeRecherche, stufeRedaktion, stufeSchnitt, stufeVertonung } from '@/lib/produktion/strecke'
import type { Job } from 'pg-boss'

type Daten = { beitrag_id: string }

async function ausfuehren(stufe: string, fn: (d: Daten) => Promise<unknown>, jobs: Job<Daten>[]) {
  for (const job of jobs) {
    const id = job.data.beitrag_id
    const t = Date.now()
    try {
      await fn(job.data)
      console.log(`[${stufe}] ${id} ok ${((Date.now() - t) / 1000).toFixed(1)} s`)
    } catch (e) {
      if (e instanceof Abgebrochen) { console.log(`[${stufe}] ${id} abgebrochen`); continue }
      console.error(`[${stufe}] ${id} Fehler:`, e)
      const b = await prisma.beitrag.findUnique({ where: { id }, select: { status: true } })
      if (e instanceof KundenFehler) { await fehlschlagen(id, e.message, String(e.stack)); continue }
      // Letzter Versuch der Stufe: verständlich scheitern statt still hängen.
      const info = job as Job<Daten> & { retryCount?: number; retryLimit?: number }
      const letzter = info.retryCount !== undefined && info.retryLimit !== undefined ? info.retryCount >= info.retryLimit : true
      if (letzter && b && !['fertig', 'fertig_mit_hinweisen', 'fehlgeschlagen'].includes(b.status)) { await fehlschlagen(id, 'technik', String((e as Error)?.stack ?? e)); continue }
      throw e
    }
  }
}

// Letzte Sicherung: nichts Unerwartetes darf den Arbeiter still beenden — protokollieren und weiterarbeiten.
process.on('unhandledRejection', e => console.error('unhandledRejection', e))

async function main() {
  const boss = await warteschlange()
  const opt = (n: number) => ({ localConcurrency: n, batchSize: 1, pollingIntervalSeconds: 1, includeMetadata: true }) as never
  await boss.work<Daten>(STUFEN.recherche.name, opt(3), jobs => ausfuehren('recherche', d => stufeRecherche(d.beitrag_id), jobs))
  await boss.work<Daten>(STUFEN.redaktion.name, opt(3), jobs => ausfuehren('redaktion', d => stufeRedaktion(d.beitrag_id), jobs))
  await boss.work<Daten>(STUFEN.vertonung.name, opt(2), jobs => ausfuehren('vertonung', d => stufeVertonung(d.beitrag_id), jobs))
  await boss.work<Daten>(STUFEN.schnitt.name, opt(2), jobs => ausfuehren('schnitt', d => stufeSchnitt(d.beitrag_id), jobs))
  console.log('Arbeiter bereit')
  const stop = async () => { console.log('Arbeiter beendet sich sanft …'); await boss.stop({ graceful: true, timeout: 600_000 }); await prisma.$disconnect(); process.exit(0) }
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}
main().catch(e => { console.error(e); process.exit(1) })
