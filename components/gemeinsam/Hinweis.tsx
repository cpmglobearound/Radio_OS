// Farbige Hinweisbox: info (cyan), warnung (gelb), fehler (rot), erfolg (grün). Fehler/Erfolg werden vorgelesen.
import type { ReactNode } from 'react'
import { IconHaken, IconInfo, IconWarnung } from './Icons'

const STIL = {
  info: 'border-cyan/30 bg-cyan-hell text-cyan-text',
  warnung: 'border-gelb/30 bg-gelb-hell text-[#8a4b05]',
  fehler: 'border-rot/30 bg-rot-hell text-[#a32424]',
  erfolg: 'border-gruen/30 bg-gruen-hell text-[#0a6e5f]',
}

export default function Hinweis({ art = 'info', children, aktion, className = '' }: { art?: keyof typeof STIL; children: ReactNode; aktion?: ReactNode; className?: string }) {
  const Icon = art === 'erfolg' ? IconHaken : art === 'info' ? IconInfo : IconWarnung
  return (
    <div role={art === 'fehler' ? 'alert' : art === 'erfolg' ? 'status' : undefined} className={`flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2 rounded-2xl border px-4 py-3 text-sm ${STIL[art]} ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1 leading-6">{children}</div>
      {aktion && <div className="flex shrink-0 flex-wrap gap-2">{aktion}</div>}
    </div>
  )
}
