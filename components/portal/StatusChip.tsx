import type { PortalTexte } from '@/lib/i18n/texte/portal'
import { laeuft, statusFarbe, statusText } from './anzeige'

export default function StatusChip({ status, t, klein = false }: { status: string; t: PortalTexte; klein?: boolean }) {
  const l = laeuft(status)
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold ${klein ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} ${statusFarbe(status)}`}>
      <span aria-hidden="true" className="relative flex size-2 shrink-0">
        {l && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-50" />}
        <span className="relative size-2 rounded-full bg-current" />
      </span>
      <span className="truncate">{statusText(status, t)}</span>
    </span>
  )
}
