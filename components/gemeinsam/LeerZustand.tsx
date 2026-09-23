// Leere Liste erklärt sich und bietet den nächsten Schritt an.
import type { ReactNode } from 'react'

export default function LeerZustand({ icon, titel, text, children }: { icon?: ReactNode; titel: string; text: ReactNode; children?: ReactNode }) {
  return (
    <div className="karte flex flex-col items-center px-5 py-10 text-center sm:px-10">
      {icon && <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-cyan-hell text-cyan-tief">{icon}</div>}
      <h2 className="text-xl font-semibold text-text sm:text-2xl">{titel}</h2>
      <div className="mt-2 max-w-xl text-[15px] leading-7 text-leise">{text}</div>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}
