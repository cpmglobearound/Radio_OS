// Anzeige-Logik, die mehrere Portal-Seiten teilen: Status, Stufen, Meldungen, Farben für Emotionen und Sprecher.
import { EMOTIONEN, type Emotion } from '@/lib/tonalitaet'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import { fuellen } from '@/components/gemeinsam/format'

export const FINAL = ['fertig', 'fertig_mit_hinweisen', 'fehlgeschlagen', 'abgebrochen', 'gesperrt'] as const
export const istFertig = (status: string) => status === 'fertig' || status === 'fertig_mit_hinweisen'
export const istFinal = (status: string) => (FINAL as readonly string[]).includes(status)
/** Läuft gerade (Polling nötig): nicht final und nicht „wartet auf Freigabe". */
export const laeuft = (status: string) => !istFinal(status) && status !== 'freigabe'

export function statusText(status: string, t: PortalTexte) {
  return (t.status as Record<string, string>)[status] ?? t.status.unbekannt
}

/** Fortschrittsmeldung (Code) → Satz. pruefen_2, korrigieren_1, zeile_4_von_20 werden zerlegt. */
export function meldungText(code: string | null | undefined, t: PortalTexte) {
  const c = code ?? ''
  const m = t.meldung as Record<string, string>
  if (m[c]) return m[c]
  let r = c.match(/^pruefen_(\d+)$/)
  if (r) return fuellen(t.meldung.pruefen, { n: r[1] })
  r = c.match(/^korrigieren_(\d+)$/)
  if (r) return fuellen(t.meldung.korrigieren, { n: r[1] })
  r = c.match(/^(zeile|thema|abschnitt)_(\d+)_von_(\d+)$/)
  if (r) return fuellen(t.meldung[r[1] as 'zeile' | 'thema' | 'abschnitt'], { x: r[2], y: r[3] })
  const f = t.beitragFehler as Record<string, string>
  if (f[c]) return f[c]
  return t.meldung.unbekannt
}

export function beitragFehlerText(code: string | null | undefined, t: PortalTexte) {
  return (t.beitragFehler as Record<string, string>)[code ?? ''] ?? t.beitragFehler.unbekannt
}

export const STUFEN = ['recherche', 'drehbuch', 'pruefung', 'stimmen', 'schnitt'] as const
/** Index der aktuell laufenden Stufe (0–4); 5 = alles erledigt. */
export function stufeIndex(status: string, meldung?: string | null) {
  if (istFertig(status)) return 5
  if (status === 'wartet' || status === 'recherche') return 0
  if (status === 'redaktion') return /^(pruefen|korrigieren)/.test(meldung ?? '') ? 2 : 1
  if (status === 'freigabe') return 3
  if (status === 'vertonung') return 3
  if (status === 'schnitt' || status === 'abnahme') return 4
  return 0
}

/** Farbe des Status-Chips. */
export function statusFarbe(status: string) {
  if (status === 'fertig') return 'bg-gruen-hell text-[#0a6e5f] border-gruen/25'
  if (status === 'fertig_mit_hinweisen') return 'bg-gelb-hell text-[#8a4b05] border-gelb/25'
  if (status === 'fehlgeschlagen' || status === 'gesperrt') return 'bg-rot-hell text-[#a32424] border-rot/25'
  if (status === 'freigabe') return 'bg-[#f3efff] text-[#5b36c4] border-violett/25'
  return 'bg-cyan-hell text-cyan-text border-cyan/30'
}

/** Emotionen: jede hat eine eigene, gut lesbare Farbe (Hintergrund hell, Text dunkel, Punkt kräftig). */
const EMOTION_FARBE: Record<Emotion, { chip: string; punkt: string }> = {
  freudig: { chip: 'bg-[#fff6d8] text-[#7a5200] border-[#f5d36b]', punkt: 'bg-[#f2b705]' },
  begeistert: { chip: 'bg-[#ffe8f3] text-[#9d1a5c] border-[#f7a8cf]', punkt: 'bg-rosa' },
  lustig: { chip: 'bg-[#ffeedd] text-[#9a4300] border-[#fbbf8a]', punkt: 'bg-[#f97316]' },
  verschmitzt: { chip: 'bg-[#f3efff] text-[#5b36c4] border-[#c9b8fb]', punkt: 'bg-violett' },
  ueberrascht: { chip: 'bg-cyan-hell text-cyan-text border-[#8fe3fb]', punkt: 'bg-cyan' },
  warm: { chip: 'bg-[#fff0ea] text-[#9a3412] border-[#fdc3a8]', punkt: 'bg-[#fb7d4f]' },
  mitfuehlend: { chip: 'bg-gruen-hell text-[#0a6e5f] border-[#9ee3d6]', punkt: 'bg-gruen' },
  nachdenklich: { chip: 'bg-[#eef2ff] text-[#3730a3] border-[#c1c9fb]', punkt: 'bg-[#6366f1]' },
  ernst: { chip: 'bg-[#eceef4] text-[#252d4a] border-[#c5cad8]', punkt: 'bg-[#252d4a]' },
  sachlich: { chip: 'bg-[#f3f5f8] text-[#4a5470] border-[#d5dbe5]', punkt: 'bg-[#8a93ab]' },
}
export const istEmotion = (e: string | null | undefined): e is Emotion => !!e && (EMOTIONEN as readonly string[]).includes(e)
export function emotionFarbe(e: string | null | undefined) {
  return istEmotion(e) ? EMOTION_FARBE[e] : { chip: 'bg-grund-2 text-text-2 border-linie', punkt: 'bg-leise' }
}
export function emotionName(e: string | null | undefined, t: PortalTexte) {
  return istEmotion(e) ? t.emotionen[e] : (e ?? '')
}

/** Sprecherfarbe nach Rolle (sprecher_1 … sprecher_3). */
const SPRECHER_FARBE = [
  { rand: 'border-l-cyan', punkt: 'bg-cyan', text: 'text-cyan-text', hell: 'bg-cyan-hell' },
  { rand: 'border-l-violett', punkt: 'bg-violett', text: 'text-[#5b36c4]', hell: 'bg-[#f3efff]' },
  { rand: 'border-l-rosa', punkt: 'bg-rosa', text: 'text-[#9d1a5c]', hell: 'bg-[#ffe8f3]' },
]
export function sprecherFarbe(rolle: string) {
  const n = Number(rolle.match(/(\d+)$/)?.[1] ?? 1)
  return SPRECHER_FARBE[(Math.max(1, n) - 1) % SPRECHER_FARBE.length]
}
