// Echte Produktion Ende-zu-Ende im internen Prüf-Mandanten (13 §4 „Rauchprobe", 15 §3 Referenzfälle).
// Aufruf: npx tsx scripts/produktion-pruefen.ts '<json-auftrag>' [--warten]
// Der Arbeiter muss laufen. Ergebnis: Status, Länge, Lautheit, Wortgenauigkeit je Zeile, Kosten, Abrechnung.
import { prisma } from '@/lib/db'
import { beitragErzeugen, AuftragSchema } from '@/lib/beitrag/erstellen'
import { guthaben } from '@/lib/abrechnung/kontobuch'
import type { Sitzung } from '@/lib/konto/sitzung'

const PRUEF_EMAIL = 'pruef-mandant@radio.klarframe.com'

export async function pruefSitzung(): Promise<Sitzung> {
  let n = await prisma.nutzer.findUnique({ where: { email: PRUEF_EMAIL }, include: { mitgliedschaften: { include: { mandant: true } } } })
  if (!n) {
    const m = await prisma.mandant.create({ data: { name: 'Klarframe Prüf-Mandant', art: 'firma', land: 'ES', zeitzone: 'Europe/Madrid', bestellt_am: new Date(), sonderpreis_eur: 0, sonderpreis_notiz: 'interner Prüf-Mandant' } })
    const nu = await prisma.nutzer.create({ data: { email: PRUEF_EMAIL, name: 'Prüfung', email_bestaetigt_am: new Date(), sprache: 'de' } })
    await prisma.mitgliedschaft.create({ data: { mandant_id: m.id, nutzer_id: nu.id, rolle: 'inhaber' } })
    n = await prisma.nutzer.findUniqueOrThrow({ where: { id: nu.id }, include: { mitgliedschaften: { include: { mandant: true } } } })
  }
  const m = n.mitgliedschaften[0].mandant
  if ((await guthaben(m.id)) < 3600) await prisma.buchung.create({ data: { mandant_id: m.id, art: 'korrektur', sekunden: 7200, notiz: 'Prüf-Mandant aufgefüllt' } })
  return { nutzer: { id: n.id, email: n.email, name: n.name, sprache: 'de', bestaetigt: true, ist_admin: false }, mandant: m, rolle: 'inhaber', mandanten: [{ id: m.id, name: m.name, rolle: 'inhaber' }] }
}

async function main() {
  const auftrag = AuftragSchema.parse(JSON.parse(process.argv[2]))
  const s = await pruefSitzung()
  const b = await beitragErzeugen(auftrag, s)
  console.log('Beitrag', b.id)
  if (!process.argv.includes('--warten')) return
  const t0 = Date.now()
  let letzte = ''
  for (;;) {
    const x = await prisma.beitrag.findUniqueOrThrow({ where: { id: b.id } })
    const f = x.fortschritt as { prozent?: number; meldung?: string } | null
    const zeile = `${x.status} ${f?.prozent ?? ''}% ${f?.meldung ?? ''}`
    if (zeile !== letzte) { console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s  ${zeile}`); letzte = zeile }
    if (['fertig', 'fertig_mit_hinweisen', 'fehlgeschlagen', 'freigabe'].includes(x.status)) {
      const zeilen = await prisma.zeile.findMany({ where: { beitrag_id: b.id }, orderBy: { nr: 'asc' } })
      for (const z of zeilen) console.log(`  ${String(z.nr).padStart(2)} ${z.rolle} [${z.emotion}] ${Math.round((z.wortgenauigkeit ?? 0) * 100)}% v${z.versuche} ${z.dauer_s?.toFixed(1)}s ${z.warnung ? '⚠ ' + z.warnung : ''}\n      ${z.text}`)
      console.log(JSON.stringify({ status: x.status, fehler: x.fehler, laenge_s: x.laenge_s, pruefung: x.pruefung, kosten: x.kosten, abgerechnet_s: x.abgerechnet_s, titel: x.titel, mp3: x.audio_mp3 }, null, 1))
      break
    }
    await new Promise(r => setTimeout(r, 3000))
  }
  await prisma.$disconnect()
}
if (process.argv[1]?.includes('produktion-pruefen')) main().then(() => process.exit(0), e => { console.error(e); process.exit(1) })
