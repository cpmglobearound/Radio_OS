'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { OBERFLAECHE, type UiSprache } from '@/lib/sprachen'

/**
 * DE · EN · ES. Öffentlich (ziel="cookie"): POST /api/sprache. Im Portal (ziel="konto"): PATCH /api/konto,
 * damit auch Mails in der gewählten Sprache kommen. Danach lädt die Seite ihre Texte neu.
 */
export default function SprachUmschalter({ sprache, namen, label, ziel = 'cookie' }: {
  sprache: UiSprache; namen: Record<UiSprache, string>; label: string; ziel?: 'cookie' | 'konto'
}) {
  const router = useRouter()
  const [wartet, starte] = useTransition()
  const [gewaehlt, setGewaehlt] = useState(sprache)

  async function wechseln(s: UiSprache) {
    if (s === gewaehlt) return
    setGewaehlt(s)
    const res = await fetch(ziel === 'konto' ? '/api/konto' : '/api/sprache', {
      method: ziel === 'konto' ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprache: s }),
    }).catch(() => null)
    if (!res?.ok) { setGewaehlt(sprache); return }
    starte(() => router.refresh())
  }

  return (
    <div role="group" aria-label={label} className={`relative flex shrink-0 items-center rounded-full border border-linie bg-karte/80 p-0.5 text-[12px] font-semibold ${wartet ? 'opacity-60' : ''}`}>
      {OBERFLAECHE.map(s => (
        <button
          key={s}
          type="button"
          lang={s}
          aria-pressed={gewaehlt === s}
          aria-label={namen[s]}
          onClick={() => wechseln(s)}
          className={`relative rounded-full px-2 py-1.5 uppercase transition-colors sm:px-2.5 ${gewaehlt === s ? 'text-white' : 'text-leise hover:text-text'}`}
        >
          {gewaehlt === s && <motion.span layoutId={`sprache-aktiv-${ziel}`} className="absolute inset-0 rounded-full bg-text" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className="relative">{s}</span>
        </button>
      ))}
    </div>
  )
}
