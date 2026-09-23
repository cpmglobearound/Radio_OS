// Zustand des Assistenten „Neuer Beitrag": Form, Startwerte, Speichern in sessionStorage, Prüfung je Schritt
// (gleiche Grenzen wie AuftragSchema in lib/beitrag/erstellen.ts) und Umbau in den Auftrag für die API.
import { formatVon, type Format } from '@/lib/formate'
import { AUSGABESPRACHEN, ausgabespracheVon, type UiSprache } from '@/lib/sprachen'
import { REGLER, VORLAGEN, type Tonalitaet } from '@/lib/tonalitaet'
import type { AssistentTexte } from '@/lib/i18n/texte/assistent'
import { fuellen } from '@/components/gemeinsam/format'

export type Quelle = 'text' | 'webseiten' | 'recherche'
export interface Thema { id: string; titel: string; text: string; urls: string[] }
export interface Sprecher { stimme: string; name: string; persoenlichkeit: string }
export type VorlageId = keyof typeof VORLAGEN

export interface Entwurf {
  v: 1
  schritt: number
  /** Höchster erreichter Schritt (alle bis hier sind anklickbar). */
  erreicht: number
  quelle: Quelle | null
  themen: Thema[]
  land: string
  orte: string[]
  aktualitaet_h: number
  format: string
  laenge_min: number
  eigeneLaenge: boolean
  sprache: string
  sprecherzahl: number
  /** Immer drei Plätze; genutzt werden die ersten `sprecherzahl`. */
  sprecher: Sprecher[]
  vorlage: VorlageId | null
  angepasst: boolean
  ton: Tonalitaet
  anweisung: string
  freigabe_noetig: boolean
  sendungsname: string
  kennung_position: 'anfang' | 'ende'
  /** Titel des Beitrags, aus dem übernommen wurde (Hinweis oben). */
  uebernommen: string | null
}

export interface Stimme {
  id: string; name: string; anbieter: string
  geschlecht: 'weiblich' | 'maennlich' | 'neutral' | null
  alter: 'jung' | 'mittel' | 'reif' | null
  stil: string[]; kann_lachen: boolean; klassen_faktor: number; sprachen: string[]; hoerprobe_url: string | null
}

export const SCHLUESSEL = 'radio-assistent-v1'
export const SCHRITTE = ['inhalt', 'format', 'sprache', 'stimmen', 'ton', 'uebersicht'] as const
export const MAX_THEMEN = 8
export const MAX_URLS = 10
export const MAX_ORTE = 10
export const TEXT_MIN = 80
export const TEXT_MAX = 30000
export const LAENGEN_MIN = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60]
export const AKTUALITAET = [
  { h: 24, k: 'h24' }, { h: 72, k: 'd3' }, { h: 168, k: 'w1' }, { h: 336, k: 'w2' }, { h: 720, k: 'm1' }, { h: 8760, k: 'j1' },
] as const
export const AKTUALITAET_STANDARD = 336

export const istLive = (id: string) => id.startsWith('openai-live:')
export const aktiveSprachen = () => AUSGABESPRACHEN.filter(s => s.aktiv)

let zaehler = 0
/** Kurze Kennung für Themen (nur in Ereignissen/Callbacks aufrufen). */
export function neueId() {
  zaehler += 1
  return `t${Date.now().toString(36)}${zaehler}`
}

export const leererSprecher = (): Sprecher => ({ stimme: '', name: '', persoenlichkeit: '' })

function spracheFuer(ui: UiSprache) {
  return aktiveSprachen().find(s => s.basis === ui)?.code ?? aktiveSprachen()[0].code
}

export function startEntwurf(ui: UiSprache): Entwurf {
  const sprache = spracheFuer(ui)
  return {
    v: 1, schritt: 0, erreicht: 0, quelle: null,
    themen: [{ id: 'start', titel: '', text: '', urls: [''] }],
    land: '', orte: [], aktualitaet_h: AKTUALITAET_STANDARD,
    format: '', laenge_min: 3, eigeneLaenge: false,
    sprache, sprecherzahl: 1, sprecher: [leererSprecher(), leererSprecher(), leererSprecher()],
    vorlage: 'ernst_mit_humor', angepasst: false,
    ton: { ...VORLAGEN.ernst_mit_humor, anrede: ausgabespracheVon(sprache)?.anrede_standard },
    anweisung: '', freigabe_noetig: false, sendungsname: '', kennung_position: 'anfang', uebernommen: null,
  }
}

/** Gespeicherten Entwurf lesen und behutsam prüfen (alte/kaputte Daten → Neustart). */
export function entwurfLaden(ui: UiSprache): Entwurf {
  const start = startEntwurf(ui)
  try {
    const roh = sessionStorage.getItem(SCHLUESSEL)
    if (!roh) return start
    const e = JSON.parse(roh) as Partial<Entwurf>
    if (e?.v !== 1 || !Array.isArray(e.themen) || !e.themen.length || !Array.isArray(e.sprecher)) return start
    const m = { ...start, ...e } as Entwurf
    while (m.sprecher.length < 3) m.sprecher.push(leererSprecher())
    m.schritt = Math.min(Math.max(0, m.schritt | 0), SCHRITTE.length - 1)
    m.erreicht = Math.max(m.schritt, Math.min(m.erreicht | 0, SCHRITTE.length - 1))
    if (!aktiveSprachen().some(s => s.code === m.sprache)) m.sprache = start.sprache
    if (m.format && !formatVon(m.format)) m.format = ''
    return m
  } catch {
    return start
  }
}

export function entwurfSpeichern(e: Entwurf) {
  try { sessionStorage.setItem(SCHLUESSEL, JSON.stringify(e)) } catch { /* voll oder gesperrt: dann eben nicht */ }
}
export function entwurfLoeschen() {
  try { sessionStorage.removeItem(SCHLUESSEL) } catch { /* egal */ }
}

/** Welche Vorlage passt genau zu diesen Reglern (ohne Anrede)? */
export function passendeVorlage(t: Tonalitaet): VorlageId | null {
  for (const [k, v] of Object.entries(VORLAGEN)) {
    if ((Object.keys(REGLER) as (keyof typeof REGLER)[]).every(r => v[r] === t[r])) return k
  }
  return null
}

/** Einstellungen eines früheren Beitrags übernehmen (GET /api/v1/beitraege/{id}). */
export interface FruehereEinstellungen {
  format?: string; sprache?: string; ziel_laenge_s?: number
  sprecher?: { stimme?: string; name?: string; persoenlichkeit?: string }[]
  tonalitaet?: Partial<Tonalitaet>; anweisung?: string; freigabe_noetig?: boolean
  region?: { land?: string; orte?: string[] }; aktualitaet_h?: number; sendungsname?: string
  kennung_position?: 'anfang' | 'ende'; quelle?: Quelle; themen?: { titel?: string; text?: string; urls?: string[] }[]
}

export function ausFruehererEinstellung(ui: UiSprache, titel: string, e: FruehereEinstellungen, eingaben?: { quelle?: Quelle; themen?: FruehereEinstellungen['themen'] }): Entwurf {
  const s = startEntwurf(ui)
  const format = e.format && formatVon(e.format) ? e.format : ''
  const f = format ? formatVon(format) : undefined
  const sprache = aktiveSprachen().some(x => x.code === e.sprache) ? e.sprache! : s.sprache
  const quelle = eingaben?.quelle ?? e.quelle ?? null
  const themenRoh = (eingaben?.themen?.length ? eingaben.themen : e.themen) ?? []
  const themen: Thema[] = themenRoh.slice(0, MAX_THEMEN).map(t => ({
    id: neueId(), titel: t.titel ?? '', text: t.text ?? '', urls: t.urls?.length ? t.urls.slice(0, MAX_URLS) : [''],
  }))
  const sprecher = (e.sprecher ?? []).slice(0, 3).map(x => ({ stimme: x.stimme ?? '', name: (x.name ?? '').slice(0, 40), persoenlichkeit: (x.persoenlichkeit ?? '').slice(0, 300) }))
  const zahl = sprecher.length || f?.sprecher_standard || 1
  while (sprecher.length < 3) sprecher.push(leererSprecher())
  const anrede = ausgabespracheVon(sprache)
  const tonRoh = { ...VORLAGEN.ernst_mit_humor, ...e.tonalitaet } as Tonalitaet
  const ton: Tonalitaet = { ...tonRoh, anrede: anrede?.anrede.includes(tonRoh.anrede ?? '') ? tonRoh.anrede : anrede?.anrede_standard }
  const vorlage = passendeVorlage(ton)
  const laenge = e.ziel_laenge_s ? Math.round(e.ziel_laenge_s / 15) / 4 : f ? f.laenge_standard_s / 60 : s.laenge_min
  return {
    ...s,
    schritt: 0, erreicht: SCHRITTE.length - 1,
    quelle: quelle === 'text' || quelle === 'webseiten' || quelle === 'recherche' ? quelle : null,
    themen: themen.length ? themen : s.themen,
    land: e.region?.land && /^[A-Z]{2}$/.test(e.region.land) ? e.region.land : '',
    orte: (e.region?.orte ?? []).slice(0, MAX_ORTE),
    aktualitaet_h: e.aktualitaet_h && AKTUALITAET.some(a => a.h === e.aktualitaet_h) ? e.aktualitaet_h : AKTUALITAET_STANDARD,
    format, laenge_min: laenge, eigeneLaenge: !LAENGEN_MIN.includes(laenge) && (!f || laenge * 60 !== f.laenge_standard_s),
    sprache, sprecherzahl: f ? Math.min(Math.max(zahl, f.sprecher_min), f.sprecher_max) : zahl, sprecher,
    vorlage: vorlage ?? null, angepasst: !vorlage, ton,
    anweisung: (e.anweisung ?? '').slice(0, 2000), freigabe_noetig: !!e.freigabe_noetig,
    sendungsname: (e.sendungsname ?? '').slice(0, 120), kennung_position: e.kennung_position === 'ende' ? 'ende' : 'anfang',
    uebernommen: titel,
  }
}

// ---------- Anzeige-Helfer ----------

/** Sekunden → „45 s", „3 min", „1:30 min". */
export function dauerText(s: number, t: AssistentTexte['format']) {
  const r = Math.round(s)
  if (r < 60) return fuellen(t.sekunden, { n: r })
  if (r % 60 === 0) return fuellen(t.minuten, { n: r / 60 })
  return fuellen(t.minuten, { n: `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}` })
}

export function laengenStufen(f: Format) {
  const set = new Set(LAENGEN_MIN.map(m => m * 60).filter(s => s >= f.laenge_min_s && s <= f.laenge_max_s))
  set.add(f.laenge_standard_s)
  return [...set].sort((a, b) => a - b)
}

export function laengeErlaubt(min: number, f: Format | undefined) {
  if (!Number.isFinite(min) || min < 0.25 || min > 120) return false
  if (!f) return true
  const s = Math.round(min * 60)
  return s >= f.laenge_min_s && s <= f.laenge_max_s
}

// ---------- Prüfen je Schritt ----------

export type Fehler = Record<string, string>

function urlGueltig(u: string) {
  try {
    const x = new URL(u)
    return (x.protocol === 'http:' || x.protocol === 'https:') && !!x.hostname.includes('.') && u.length <= 2000
  } catch { return false }
}

/** Feld-Kennungen = DOM-ids, damit der Fokus direkt aufs erste Problem springen kann. */
export const feldId = {
  quelle: 'a-quelle',
  titel: (id: string) => `a-thema-${id}-titel`,
  text: (id: string) => `a-thema-${id}-text`,
  url: (id: string, i: number) => `a-thema-${id}-url-${i}`,
  format: 'a-format',
  laenge: 'a-laenge',
  sprache: 'a-sprache',
  stimme: (i: number) => `a-sprecher-${i}-stimme`,
  name: (i: number) => `a-sprecher-${i}-name`,
  persoenlichkeit: (i: number) => `a-sprecher-${i}-persoenlichkeit`,
  anweisung: 'a-anweisung',
  sendungsname: 'a-sendungsname',
}

export function pruefen(schritt: number, e: Entwurf, f: AssistentTexte['fehler'], ft: AssistentTexte['format'], stimmen: Stimme[] | null): Fehler {
  const x: Fehler = {}
  if (schritt === 0) {
    if (!e.quelle) { x[feldId.quelle] = f.quelle; return x }
    for (const t of e.themen) {
      const ti = t.titel.trim()
      if (ti.length < 2) x[feldId.titel(t.id)] = f.titelKurz
      else if (ti.length > 200) x[feldId.titel(t.id)] = f.titelLang
      if (e.quelle === 'text') {
        const l = t.text.trim().length
        if (l < TEXT_MIN) x[feldId.text(t.id)] = f.textKurz
        else if (t.text.length > TEXT_MAX) x[feldId.text(t.id)] = f.textLang
      }
      if (e.quelle === 'webseiten') {
        const belegt = t.urls.map((u, i) => [u.trim(), i] as const).filter(([u]) => u)
        if (!belegt.length) x[feldId.url(t.id, 0)] = f.urlFehlt
        for (const [u, i] of belegt) if (!urlGueltig(u)) x[feldId.url(t.id, i)] = f.urlFalsch
      }
    }
  }
  if (schritt === 1) {
    const fo = formatVon(e.format)
    if (!fo) x[feldId.format] = f.format
    else if (!laengeErlaubt(e.laenge_min, fo)) x[feldId.laenge] = fuellen(f.laenge, { a: dauerText(fo.laenge_min_s, ft), b: dauerText(fo.laenge_max_s, ft) })
  }
  if (schritt === 2) {
    if (!aktiveSprachen().some(s => s.code === e.sprache)) x[feldId.sprache] = f.sprache
  }
  if (schritt === 3) {
    for (let i = 0; i < e.sprecherzahl; i++) {
      const s = e.sprecher[i]
      if (!s.stimme) x[feldId.stimme(i)] = f.stimme
      else if (!stimmen) x[feldId.stimme(i)] = f.stimmenLaden
      else if (!stimmen.some(v => v.id === s.stimme)) x[feldId.stimme(i)] = f.stimme
      else if (e.sprecher.slice(0, i).some(a => a.stimme === s.stimme)) x[feldId.stimme(i)] = f.gleicheStimme
      const n = s.name.trim()
      if (!n || n.length > 40) x[feldId.name(i)] = f.name
      if (s.persoenlichkeit.trim().length > 300) x[feldId.persoenlichkeit(i)] = f.persoenlichkeit
    }
  }
  if (schritt === 4) {
    if (e.anweisung.length > 2000) x[feldId.anweisung] = f.anweisung
    if (e.sendungsname.trim().length > 120) x[feldId.sendungsname] = f.sendungsname
  }
  return x
}

/** Dieselbe Stimme zweimal? (blockiert „Weiter") */
export function doppelteStimme(e: Entwurf) {
  const genutzt = e.sprecher.slice(0, e.sprecherzahl).map(s => s.stimme).filter(Boolean)
  return new Set(genutzt).size < genutzt.length
}

// ---------- Auftrag für die API ----------

export function alsAuftrag(e: Entwurf) {
  const q = e.quelle ?? 'recherche'
  const recherche = q === 'recherche'
  return {
    quelle: q,
    themen: e.themen.map(t => {
      const titel = t.titel.trim()
      if (q === 'text') return { titel, text: t.text }
      if (q === 'webseiten') return { titel, urls: t.urls.map(u => u.trim()).filter(Boolean) }
      return { titel }
    }),
    format: e.format,
    sprache: e.sprache,
    laenge_min: e.laenge_min,
    sprecher: e.sprecher.slice(0, e.sprecherzahl).map(s => ({ stimme: s.stimme, name: s.name.trim(), persoenlichkeit: s.persoenlichkeit.trim() })),
    tonalitaet: e.ton,
    anweisung: e.anweisung.trim() || undefined,
    freigabe_noetig: e.freigabe_noetig,
    region: recherche && (e.land || e.orte.length) ? { land: e.land || undefined, orte: e.orte.length ? e.orte : undefined } : undefined,
    aktualitaet_h: recherche ? e.aktualitaet_h : undefined,
    sendungsname: e.sendungsname.trim() || undefined,
    kennung_position: e.kennung_position,
  }
}

/** Formatwechsel: Länge und Sprecherzahl in die Grenzen des neuen Formats holen. */
export function mitFormat(e: Entwurf, id: string): Entwurf {
  const f = formatVon(id)
  if (!f) return e
  const laengeOk = laengeErlaubt(e.laenge_min, f) && e.format !== ''
  const zahlOk = e.sprecherzahl >= f.sprecher_min && e.sprecherzahl <= f.sprecher_max && e.format !== ''
  return {
    ...e, format: id,
    laenge_min: laengeOk ? e.laenge_min : f.laenge_standard_s / 60,
    eigeneLaenge: laengeOk ? e.eigeneLaenge : false,
    sprecherzahl: zahlOk ? e.sprecherzahl : f.sprecher_standard,
  }
}


/** Was jeder Schritt bekommt. */
export interface SchrittProps {
  e: Entwurf
  setE: (f: (e: Entwurf) => Entwurf) => void
  fehler: Fehler
  t: AssistentTexte
}
