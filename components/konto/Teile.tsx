'use client'
// Kleine gemeinsame Bausteine der Konto-Seiten: Absende-Knopf, Postfach-Ansicht, Text mit eingesetzten Links.
import { Fragment, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** Knopf in voller Breite; während des Sendens gesperrt mit „… wird gesendet". */
export function SendeKnopf({ laeuft, text, sendet }: { laeuft: boolean; text: string; sendet: string }) {
  return (
    <button type="submit" disabled={laeuft} aria-busy={laeuft || undefined} className="knopf knopf-haupt w-full">
      {laeuft && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {laeuft ? sendet : text}
    </button>
  )
}

/** Weicher Wechsel zwischen Formular und Erfolgsansicht. */
export function Einblenden({ children, schluessel }: { children: ReactNode; schluessel: string }) {
  const ruhig = useReducedMotion()
  return (
    <motion.div key={schluessel} initial={ruhig ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  )
}

/** Satz mit Platzhaltern {name} → Text mit eingesetzten Elementen (z. B. Links). */
export function mitTeilen(text: string, teile: Record<string, ReactNode>) {
  return text.split(/(\{\w+\})/).map((stueck, i) => {
    const k = /^\{(\w+)\}$/.exec(stueck)?.[1]
    return <Fragment key={i}>{k && k in teile ? teile[k] : stueck}</Fragment>
  })
}

/** Hervorgehobene E-Mail-Adresse im Satz (lange Adressen brechen um). */
export function Adresse({ children }: { children: string }) {
  return <strong className="break-all font-semibold text-text">{children}</strong>
}

export const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
