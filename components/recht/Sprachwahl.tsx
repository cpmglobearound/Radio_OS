'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { OBERFLAECHE, type UiSprache } from '@/lib/sprachen'

/** Sprachumschalter der Rechtsseiten: setzt das Sprach-Cookie über /api/sprache und lädt die Seite serverseitig neu. */
export default function Sprachwahl({ sprache, beschriftung, namen }: { sprache: UiSprache; beschriftung: string; namen: Record<UiSprache, string> }) {
  const router = useRouter()
  const [wartet, starte] = useTransition()
  const [gewaehlt, setGewaehlt] = useState(sprache)

  async function wechseln(s: UiSprache) {
    if (s === gewaehlt) return
    setGewaehlt(s)
    const res = await fetch('/api/sprache', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sprache: s }) }).catch(() => null)
    if (!res?.ok) { setGewaehlt(sprache); return }
    starte(() => router.refresh())
  }

  return (
    <div role="group" aria-label={beschriftung} className={`flex items-center rounded-full border border-linie bg-karte p-0.5 text-[12px] font-semibold ${wartet ? 'opacity-60' : ''}`}>
      {OBERFLAECHE.map(s => (
        <button
          key={s}
          type="button"
          lang={s}
          aria-pressed={gewaehlt === s}
          aria-label={namen[s]}
          onClick={() => wechseln(s)}
          className={`rounded-full px-2.5 py-1.5 uppercase transition-colors ${gewaehlt === s ? 'bg-text text-white' : 'text-leise hover:text-text'}`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
