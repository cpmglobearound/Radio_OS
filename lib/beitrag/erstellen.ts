import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ApiFehler } from '@/lib/api'
import { FORMATE, formatVon } from '@/lib/formate'
import { AUSGABESPRACHEN, ausgabespracheVon } from '@/lib/sprachen'
import { REGLER, VORLAGEN, type Tonalitaet } from '@/lib/tonalitaet'
import { anbietbareStimmen } from '@/lib/stimmen/katalog'
import { preisFuer } from '@/lib/abrechnung/preis'
import { guthaben, reservieren } from '@/lib/abrechnung/kontobuch'
import { einreihen } from '@/lib/warteschlange'
import { protokoll } from '@/lib/protokoll'
import type { BeitragEinstellungen } from '@/lib/redaktion/typen'
import type { Sitzung } from '@/lib/konto/sitzung'

// Alle Wahlmöglichkeiten kommen aus den Katalogen — neue Formate/Sprachen/Regler wirken hier ohne Codeänderung.
const TonalitaetSchema = z.object({
  humor: z.number().int().min(0).max(4), lachen: z.enum(REGLER.lachen), haltung: z.enum(REGLER.haltung), waerme: z.enum(REGLER.waerme),
  energie: z.enum(REGLER.energie), tempo: z.enum(REGLER.tempo), niveau: z.enum(REGLER.niveau), zielgruppe: z.enum(REGLER.zielgruppe), anrede: z.string().max(20).optional(),
})
export const AuftragSchema = z.object({
  quelle: z.enum(['text', 'webseiten', 'recherche']),
  themen: z.array(z.object({
    titel: z.string().trim().min(2).max(200),
    text: z.string().max(30000).optional(),
    urls: z.array(z.string().url().max(2000)).max(10).optional(),
  })).min(1).max(8),
  format: z.enum(FORMATE.map(f => f.id) as [string, ...string[]]),
  sprache: z.enum(AUSGABESPRACHEN.filter(s => s.aktiv).map(s => s.code) as [string, ...string[]]),
  laenge_min: z.number().min(0.25).max(120),
  sprecher: z.array(z.object({ stimme: z.string().max(100), name: z.string().trim().min(1).max(40), persoenlichkeit: z.string().trim().max(300).default('') })).min(1).max(3),
  tonalitaet: z.union([z.enum(Object.keys(VORLAGEN) as [string, ...string[]]), TonalitaetSchema]),
  anweisung: z.string().max(2000).optional(),
  freigabe_noetig: z.boolean().default(false),
  region: z.object({ land: z.string().regex(/^[A-Z]{2}$/).optional(), orte: z.array(z.string().max(80)).max(10).optional() }).optional(),
  aktualitaet_h: z.number().int().min(6).max(8760).optional(),
  sendungsname: z.string().trim().max(120).optional(),
  kennung_position: z.enum(['anfang', 'ende']).default('anfang'),
})
export type Auftrag = z.infer<typeof AuftragSchema>
/** Nur für interne Prüf-/Beispiel-Produktionen (scripts/): auch noch nicht freigegebene Ausgabesprachen. */
export const AuftragSchemaIntern = AuftragSchema.extend({ sprache: z.enum(AUSGABESPRACHEN.map(s => s.code) as [string, ...string[]]) })

/** Prüft einen Auftrag vollständig und liefert die eingefrorenen Einstellungen + Preis. Wirft verständliche Fehlercodes. */
export async function auftragPruefen(a: Auftrag, s: Sitzung, opt: { intern?: boolean } = {}) {
  const f = formatVon(a.format)!
  const n = a.sprecher.length
  if (n < f.sprecher_min || n > f.sprecher_max) throw new ApiFehler(400, 'sprecherzahl', `sprecherzahl:${f.sprecher_min}-${f.sprecher_max}`)
  for (const t of a.themen) {
    if (a.quelle === 'text' && (t.text ?? '').trim().length < 80) throw new ApiFehler(400, 'text_zu_kurz', 'text_zu_kurz')
    if (a.quelle === 'webseiten' && !(t.urls ?? []).length) throw new ApiFehler(400, 'urls_fehlen', 'urls_fehlen')
  }
  // Intern (Prüf-Mandant): jede sichtbare Stimme, auch ohne Freigabe für diese Sprache. Kunden: nur freigegebene (Regel 7).
  const erlaubt = await anbietbareStimmen(opt.intern ? undefined : a.sprache)
  const stimmen = a.sprecher.map(x => erlaubt.find(v => v.id === x.stimme))
  if (stimmen.some(v => !v)) throw new ApiFehler(400, 'stimme_nicht_frei', 'stimme_nicht_frei')
  if (new Set(a.sprecher.map(x => x.stimme)).size < n && n > 1) throw new ApiFehler(400, 'stimmen_gleich', 'stimmen_gleich')
  const anbieter = await prisma.stimmAnbieter.findMany({ where: { id: { in: stimmen.map(v => v!.anbieter_id) } } })
  const faktor = Math.max(1, ...anbieter.map(x => x.klassen_faktor))
  const rollen = f.rollen[n - 1] ?? f.rollen[0]
  let ton: Tonalitaet = typeof a.tonalitaet === 'string' ? VORLAGEN[a.tonalitaet] : (a.tonalitaet as Tonalitaet)
  if (!f.humor_erlaubt) ton = { ...ton, humor: 0, lachen: 'nie' }
  // Lachen nur mit Stimmen, die es können (06 §3).
  if (stimmen.every(v => !v!.kann_lachen)) ton = { ...ton, lachen: 'nie' }
  const mandant = s.mandant!
  const einstellungen: BeitragEinstellungen & { erstellt_von: string } = {
    format: a.format, sprache: a.sprache, ziel_laenge_s: Math.round(a.laenge_min * 60),
    sprecher: a.sprecher.map((x, i) => ({ rolle: `sprecher_${i + 1}`, stimme: x.stimme, name: x.name, persoenlichkeit: x.persoenlichkeit || stimmen[i]!.stil.join(', '), funktion: rollen[i] ?? 'sprecher' })),
    tonalitaet: ton, sendungsname: a.sendungsname || mandant.name, region: a.region ?? { land: mandant.land ?? undefined },
    quelle: a.quelle, themen: a.themen, anweisung: a.anweisung, freigabe_noetig: a.freigabe_noetig, aktualitaet_h: a.aktualitaet_h ?? 24 * 14,
    kennung_position: a.kennung_position, lautheit_lufs: mandant.art === 'sender' ? -23 : -16, ist_probe: !mandant.bestellt_am, erstellt_von: s.nutzer.id,
  }
  // Gemessenes Sprechtempo der gewählten Stimmen in dieser Sprache (Mittelwert), sonst Tabelle.
  const raten = stimmen.map(v => (v!.wortrate as Record<string, number> | null)?.[a.sprache]).filter((x): x is number => typeof x === 'number')
  if (raten.length) einstellungen.wortrate = Math.round(raten.reduce((x, y) => x + y, 0) / raten.length)
  const preis = await preisFuer({ laenge_min: a.laenge_min, stimmklasse_faktor: faktor, mandant })
  const g = await guthaben(mandant.id)
  return { einstellungen, faktor, preis, guthaben: g, guthaben_danach: g - preis.reservierte_sekunden, reicht: g >= preis.reservierte_sekunden, sprache_info: ausgabespracheVon(a.sprache) }
}

export async function beitragErzeugen(a: Auftrag, s: Sitzung, opt: { intern?: boolean } = {}) {
  if (!s.nutzer.bestaetigt) throw new ApiFehler(403, 'email_unbestaetigt', 'email_unbestaetigt')
  if (s.mandant!.gesperrt_grund) throw new ApiFehler(403, 'gesperrt', 'gesperrt')
  const p = await auftragPruefen(a, s, opt)
  if (!p.reicht) throw new ApiFehler(402, 'guthaben', 'guthaben')
  const titel = a.themen.map(t => t.titel).join(' · ').slice(0, 200)
  const b = await prisma.beitrag.create({ data: {
    mandant_id: s.mandant!.id, titel, einstellungen: JSON.parse(JSON.stringify(p.einstellungen)), status: 'wartet', ist_probe: p.einstellungen.ist_probe,
    stimmklassen_faktor: p.faktor, eingaben: { quelle: a.quelle, themen: a.themen }, fortschritt: { stufe: 'wartet', prozent: 1, meldung: 'in_warteschlange' },
  } })
  const r = await reservieren(s.mandant!.id, b.id, p.preis.reservierte_sekunden)
  if (!r.ok) { await prisma.beitrag.delete({ where: { id: b.id } }); throw new ApiFehler(402, 'guthaben', 'guthaben') }
  await einreihen('recherche', { beitrag_id: b.id }, 20)
  await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'beitrag.erzeugt', ziel_typ: 'beitrag', ziel_id: b.id })
  return b
}
