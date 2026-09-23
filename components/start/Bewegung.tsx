'use client'
// Gemeinsame Bausteine für Scroll-Einblendungen und Abschnitts-Köpfe der Startseite.
import { motion, MotionConfig, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/** Respektiert „Bewegung reduzieren" des Betriebssystems für alle Animationen darunter. */
export function BewegungsRahmen({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export const auftauchen: Variants = {
  aus: { opacity: 0, y: 24 },
  an: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const gestaffelt: Variants = {
  aus: {},
  an: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

/** Blendet den Inhalt beim Hineinscrollen ein. */
export function Einblenden({ children, className, verzoegerung = 0 }: { children: ReactNode; className?: string; verzoegerung?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.65, delay: verzoegerung, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Container, dessen Kinder (mit variants={auftauchen}) nacheinander erscheinen. */
export function Staffel({ children, className, als = 'div' }: { children: ReactNode; className?: string; als?: 'div' | 'ul' | 'ol' }) {
  const K = als === 'ul' ? motion.ul : als === 'ol' ? motion.ol : motion.div
  return (
    <K className={className} variants={gestaffelt} initial="aus" whileInView="an" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
      {children}
    </K>
  )
}

/** Kopf eines Abschnitts im Stil von voice.klarframe.com: Kicker, große Überschrift mit Verlauf, Einleitung. */
export function AbschnittKopf({ id, kicker, titel, titelBunt, text, mittig = true }: { id: string; kicker: string; titel: string; titelBunt?: string; text?: string; mittig?: boolean }) {
  return (
    <Einblenden className={mittig ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-text">{kicker}</p>
      <h2 id={id} className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-[-.04em] text-text sm:text-5xl lg:text-6xl">
        {titel}
        {titelBunt && <span className="verlauf-text block pb-1">{titelBunt}</span>}
      </h2>
      {text && <p className="mt-6 text-lg leading-8 text-leise">{text}</p>}
    </Einblenden>
  )
}
