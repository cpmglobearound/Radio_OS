import type { StimmAnbieter } from './typ'
import { openaiAudio } from './openai-audio'
import { openaiTts } from './openai-tts'
import { openaiLive } from './openai-live'

// EINE Liste der Anbieter. Neuer Anbieter = eine Datei + ein Eintrag hier.
export const ANBIETER: Record<string, StimmAnbieter> = { [openaiAudio.id]: openaiAudio, [openaiLive.id]: openaiLive, [openaiTts.id]: openaiTts }

/** Stimm-ID "<anbieter>:<stimme>" auflösen. */
export function anbieterFuer(stimmId: string) {
  const [anbieterId, ...rest] = stimmId.split(':')
  const a = ANBIETER[anbieterId]
  if (!a) throw new Error(`Unbekannter Stimmanbieter ${anbieterId}`)
  return { anbieter: a, stimme: rest.join(':') }
}
