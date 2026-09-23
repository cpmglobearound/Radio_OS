'use client'
// Zahl offener Bestellungen für das Badge in der Seitenleiste (nur Klarframe-Admins).
// Seitenleiste und Handy-Menü teilen sich eine Anfrage; nach einer Admin-Aktion wird neu gezählt.
import { useEffect, useState } from 'react'
import { api } from '@/components/gemeinsam/api'

export const BESTELLUNGEN_GEAENDERT = 'klarframe:bestellungen-geaendert'

let laufend: Promise<number | null> | null = null
let stand: { zahl: number | null; zeit: number } | null = null
const FRISCH_MS = 30_000

function zaehlen(neu = false): Promise<number | null> {
  if (!neu && stand && Date.now() - stand.zeit < FRISCH_MS) return Promise.resolve(stand.zahl)
  if (!laufend) {
    laufend = api<{ bestellungen: unknown[] }>('/api/admin/bestellungen?status=offen')
      .then(r => (r.ok ? r.daten.bestellungen.length : null))
      .then(zahl => { stand = { zahl, zeit: Date.now() }; return zahl })
      .finally(() => { laufend = null })
  }
  return laufend
}

export function useOffeneBestellungen(aktiv: boolean) {
  const [zahl, setZahl] = useState<number | null>(null)
  useEffect(() => {
    if (!aktiv) return
    let aus = false
    const holen = (neu: boolean) => zaehlen(neu).then(z => { if (!aus) setZahl(z) })
    holen(false)
    const geaendert = () => holen(true)
    window.addEventListener(BESTELLUNGEN_GEAENDERT, geaendert)
    return () => { aus = true; window.removeEventListener(BESTELLUNGEN_GEAENDERT, geaendert) }
  }, [aktiv])
  return aktiv ? zahl : null
}
