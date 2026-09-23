// „▶ Anhören" im Aussprache-Lexikon: gemeinsame Probe-Funktion mit Regie-Hinweis zur Aussprache.
import { probeHolen, type ProbeErgebnis } from '@/components/stimmen/probe'

const REGIE_MAX = 200   // Grenze der Probe-API

export function ausspracheRegie(wort: string, sprichAls: string) {
  return `Aussprache: ${wort} wie „${sprichAls}"`.slice(0, REGIE_MAX)
}

export function ausspracheProbe(stimmId: string, text: string, sprache: string, regie: string, signal: AbortSignal): Promise<ProbeErgebnis> {
  return probeHolen(stimmId, text, sprache, signal, regie)
}
