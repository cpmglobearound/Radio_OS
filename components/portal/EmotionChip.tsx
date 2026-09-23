import type { PortalTexte } from '@/lib/i18n/texte/portal'
import { emotionFarbe, emotionName } from './anzeige'

/** Farbiger Chip je Emotion (übersetzter Name). */
export default function EmotionChip({ emotion, t, className = '' }: { emotion: string | null | undefined; t: PortalTexte; className?: string }) {
  if (!emotion) return null
  const f = emotionFarbe(emotion)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${f.chip} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${f.punkt}`} />
      {emotionName(emotion, t)}
    </span>
  )
}
