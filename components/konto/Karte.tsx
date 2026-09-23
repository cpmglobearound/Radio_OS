'use client'
// Zentrierte weiße Karte der Konto-Seiten mit dezenter Einblendung (respektiert „weniger Bewegung").
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function Karte({ titel, unterzeile, icon, breit = false, children }: {
  titel: string
  unterzeile?: ReactNode
  icon?: ReactNode
  breit?: boolean
  children?: ReactNode
}) {
  const ruhig = useReducedMotion()
  return (
    <motion.section
      initial={ruhig ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`karte w-full min-w-0 ${breit ? 'max-w-xl' : 'max-w-md'} px-5 py-7 sm:px-8 sm:py-9`}
    >
      {icon && <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-cyan-hell text-cyan-tief">{icon}</div>}
      <h1 className="text-3xl font-semibold tracking-[-.03em] break-words sm:text-[2.1rem]">{titel}</h1>
      {unterzeile && <div className="mt-2 text-[15px] leading-7 text-leise">{unterzeile}</div>}
      {children && <div className="mt-6">{children}</div>}
    </motion.section>
  )
}
