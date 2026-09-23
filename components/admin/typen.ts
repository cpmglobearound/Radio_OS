// Admin-Stimmen: Form der Daten aus GET /api/admin/stimmen und die Einordnung je Stimme × Sprache.

export interface AdminSprache {
  code: string
  geprueft: boolean
  muttersprachlich: boolean
  auto_wortgenauigkeit?: number
  auto_bestanden?: boolean
  auto_gehoert?: string
  geprueft_von?: string
}

export interface AdminStimme {
  id: string
  anbieter_id: string
  anbieter_stimm_id: string
  name: string
  geschlecht: 'weiblich' | 'maennlich' | 'neutral' | null
  alter: 'jung' | 'mittel' | 'reif' | null
  stil: string[]
  kann_lachen: boolean
  sichtbar: boolean
  geprueft_am: string | null
  geprueft_von: string | null
  sortierung: number
  sprachen: AdminSprache[]
  /** Nur in der Liste (GET); die PATCH-Antwort hat stattdessen `hoerprobe` roh — dann alten Stand behalten. */
  hoerproben: Record<string, string>
}

/** Was PATCH annimmt. */
export interface AdminPatch {
  sprachen?: { code: string; geprueft: boolean; muttersprachlich: boolean }[]
  sichtbar?: boolean
  geschlecht?: 'weiblich' | 'maennlich' | 'neutral'
  alter?: 'jung' | 'mittel' | 'reif'
  stil?: string[]
  kann_lachen?: boolean
  name?: string
}

export const ZUSTAENDE = ['offen', 'automatisch', 'freigegeben', 'abgelehnt'] as const
export type Zustand = (typeof ZUSTAENDE)[number]
export type Filter = Zustand | 'alle'

/**
 * offen = noch niemand hat entschieden; automatisch = vom Prüfskript freigegeben, Mensch fehlt;
 * freigegeben = ein Mensch hat freigegeben; abgelehnt = ein Mensch hat geprüft und nicht freigegeben.
 */
export function zustandVon(sp: AdminSprache): Zustand | null {
  if (!sp.geprueft && !sp.geprueft_von) return 'offen'
  if (sp.geprueft && sp.geprueft_von === 'automatisch') return 'automatisch'
  if (sp.geprueft && sp.geprueft_von) return 'freigegeben'
  if (!sp.geprueft && sp.geprueft_von) return 'abgelehnt'
  return null
}

export const passtZu = (s: AdminStimme, f: Filter) => f === 'alle' || s.sprachen.some(sp => zustandVon(sp) === f)

/** Wie der Server entscheidet, ob Kunden die Stimme in dieser Sprache sehen (lib/stimmen/katalog.ts → anbietbareStimmen). */
export const fuerKunden = (s: AdminStimme, sp: AdminSprache) => s.sichtbar && !!s.geprueft_am && sp.geprueft && sp.muttersprachlich
