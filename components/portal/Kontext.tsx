'use client'
// Was jede Portal-Seite braucht: Sprache, Texte der Hülle, Rolle/Rechte, Guthaben (mit Neu-Laden nach Aktionen).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UiSprache } from '@/lib/sprachen'
import type { PortalTexte } from '@/lib/i18n/texte/portal'
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'
import type { Rolle } from './rechte'
import { api } from '@/components/gemeinsam/api'

export interface Guthaben {
  sekunden: number; gutschrift_sekunden: number; warnen: boolean; bestellt: boolean
  /** Minutenzähler (Dashboard) */
  verbraucht_monat_s?: number; reserviert_s?: number; laufend?: number; beitraege_monat?: number
}

export interface PortalWert {
  sprache: UiSprache
  t: PortalTexte
  g: GemeinsamTexte
  nutzer: { name: string; email: string; bestaetigt: boolean; ist_admin: boolean }
  mandant: { id: string; name: string; bestellt: boolean; gesperrt: boolean }
  mandanten: { id: string; name: string; rolle: string }[]
  rolle: Rolle
  /** Redaktion und höher: erzeugen, bearbeiten, freigeben, löschen. */
  darfBearbeiten: boolean
  guthaben: Guthaben
  guthabenNeuLaden: () => void
}

const K = createContext<PortalWert | null>(null)

export function usePortal() {
  const w = useContext(K)
  if (!w) throw new Error('usePortal außerhalb des Portals')
  return w
}

/** Guthaben-Stufe für Farbe: grün > 20 %, gelb bis 5 %, rot darunter oder leer. */
export function guthabenStufe(g: Guthaben): 'gruen' | 'gelb' | 'rot' {
  if (g.sekunden <= 0) return 'rot'
  if (!g.gutschrift_sekunden) return 'gruen'
  const a = g.sekunden / g.gutschrift_sekunden
  return a > 0.2 ? 'gruen' : a > 0.05 ? 'gelb' : 'rot'
}

export function PortalKontext({ wert, children }: { wert: Omit<PortalWert, 'guthaben' | 'guthabenNeuLaden'> & { guthaben: Guthaben }; children: ReactNode }) {
  const [guthaben, setGuthaben] = useState<Guthaben>(wert.guthaben)

  const guthabenNeuLaden = useCallback(() => {
    api<Guthaben>('/api/v1/guthaben').then(r => {
      if (r.ok) setGuthaben({ sekunden: r.daten.sekunden, gutschrift_sekunden: r.daten.gutschrift_sekunden, warnen: r.daten.warnen, bestellt: r.daten.bestellt, verbraucht_monat_s: r.daten.verbraucht_monat_s, reserviert_s: r.daten.reserviert_s, laufend: r.daten.laufend, beitraege_monat: r.daten.beitraege_monat })
    })
  }, [])

  // Beim Zurückkehren in den Tab aktuell halten.
  useEffect(() => {
    const sichtbar = () => { if (document.visibilityState === 'visible') guthabenNeuLaden() }
    document.addEventListener('visibilitychange', sichtbar)
    return () => document.removeEventListener('visibilitychange', sichtbar)
  }, [guthabenNeuLaden])

  const v = useMemo(() => ({ ...wert, guthaben, guthabenNeuLaden }), [wert, guthaben, guthabenNeuLaden])
  return <K.Provider value={v}>{children}</K.Provider>
}
