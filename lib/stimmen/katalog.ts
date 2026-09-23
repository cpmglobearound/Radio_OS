import { prisma } from '@/lib/db'

// Startkatalog (07 §1). Der Abgleich LEGT AN — anbietbar wird eine Stimme erst nach menschlicher Freigabe (Regel 7).
type Def = { id: string; name: string; geschlecht: 'weiblich' | 'maennlich' | 'neutral' | null; alter: 'jung' | 'mittel' | 'reif' | null; stil: string[] }
const OPENAI: Def[] = [
  { id: 'marin', name: 'Marin', geschlecht: 'weiblich', alter: 'mittel', stil: ['warm', 'natürlich', 'lebendig'] },
  { id: 'cedar', name: 'Cedar', geschlecht: 'maennlich', alter: 'mittel', stil: ['ruhig', 'trocken', 'seriös'] },
  { id: 'coral', name: 'Coral', geschlecht: 'weiblich', alter: 'jung', stil: ['hell', 'freundlich', 'energisch'] },
  { id: 'ash', name: 'Ash', geschlecht: 'maennlich', alter: 'mittel', stil: ['klar', 'sachlich'] },
  { id: 'sage', name: 'Sage', geschlecht: 'weiblich', alter: 'mittel', stil: ['ruhig', 'weich'] },
  { id: 'verse', name: 'Verse', geschlecht: 'maennlich', alter: 'jung', stil: ['lebhaft', 'ausdrucksstark'] },
  { id: 'ballad', name: 'Ballad', geschlecht: 'maennlich', alter: 'mittel', stil: ['warm', 'erzählend'] },
  { id: 'alloy', name: 'Alloy', geschlecht: 'neutral', alter: 'mittel', stil: ['neutral', 'klar'] },
  { id: 'echo', name: 'Echo', geschlecht: 'maennlich', alter: 'mittel', stil: ['tief', 'ruhig'] },
  { id: 'shimmer', name: 'Shimmer', geschlecht: 'weiblich', alter: 'jung', stil: ['hell', 'sanft'] },
  { id: 'nova', name: 'Nova', geschlecht: 'weiblich', alter: 'jung', stil: ['frisch', 'freundlich'] },
  { id: 'onyx', name: 'Onyx', geschlecht: 'maennlich', alter: 'reif', stil: ['tief', 'seriös'] },
  { id: 'fable', name: 'Fable', geschlecht: 'maennlich', alter: 'mittel', stil: ['erzählend', 'britisch'] },
]
const SPRACHEN = ['de-DE', 'es-ES', 'en-GB']
// GPT-Live-Stimmen (nur über gpt-live-1). Merkmale vorläufig — der Admin setzt sie bei der Freigabe nach dem Anhören.
const LIVE: Def[] = [
  { id: 'gleam', name: 'Gleam', geschlecht: 'weiblich', alter: 'jung', stil: ['strahlend', 'lebendig', 'natürlich'] },
  { id: 'marin', name: 'Marin', geschlecht: 'weiblich', alter: 'mittel', stil: ['warm', 'natürlich'] },
  { id: 'cedar', name: 'Cedar', geschlecht: 'maennlich', alter: 'mittel', stil: ['ruhig', 'trocken'] },
  // Gleiche Stimme wie bei OpenAI Audio → gleiche Merkmale; ganz neue Stimmen bleiben unbeschrieben, bis der Admin sie anhört.
  ...['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'].map(id => ({ ...OPENAI_MERKMALE(id) })),
  ...['quartz', 'ripple', 'vesper', 'willow', 'stone', 'meridian', 'bossa', 'tempo', 'beacon', 'delta', 'cinder']
    .map(id => ({ id, name: id[0].toUpperCase() + id.slice(1), geschlecht: null, alter: null, stil: [] as string[] })),
]
function OPENAI_MERKMALE(id: string): Def { return OPENAI.find(v => v.id === id)! }

export async function katalogAbgleichen() {
  await prisma.stimmAnbieter.upsert({ where: { id: 'openai-audio' }, update: {}, create: { id: 'openai-audio', name: 'OpenAI Audio (gpt-audio-1.5)', klassen_faktor: 1, faehigkeiten: { lachen: true, regie_text: true, mehrsprecher: false, sprachen: SPRACHEN }, kosten: { art: 'audio_token', preis_usd_pro_einheit: 0.000064 } } })
  await prisma.stimmAnbieter.upsert({ where: { id: 'openai-tts' }, update: {}, create: { id: 'openai-tts', name: 'OpenAI Sprachausgabe (gpt-4o-mini-tts)', klassen_faktor: 1, faehigkeiten: { lachen: false, regie_text: true, mehrsprecher: false, sprachen: SPRACHEN }, kosten: { art: 'audio_token', preis_usd_pro_einheit: 0.000012 } } })
  await prisma.stimmAnbieter.upsert({ where: { id: 'openai-live' }, update: {}, create: { id: 'openai-live', name: 'GPT-Live (gpt-live-1)', klassen_faktor: 1, faehigkeiten: { lachen: true, regie_text: true, mehrsprecher: false, sprachen: SPRACHEN }, kosten: { art: 'sekunde', preis_usd_pro_einheit: 0.05 / 60 } } })
  let neu = 0
  for (const [anbieter, liste] of [['openai-live', LIVE], ['openai-audio', OPENAI], ['openai-tts', OPENAI]] as const) {
    for (const [i, v] of liste.entries()) {
      const id = `${anbieter}:${v.id}`
      const da = await prisma.stimme.findUnique({ where: { id } })
      if (da) continue
      neu++
      await prisma.stimme.create({ data: {
        id, anbieter_id: anbieter, anbieter_stimm_id: v.id, name: v.name, geschlecht: v.geschlecht, alter: v.alter, stil: v.stil,
        kann_lachen: anbieter !== 'openai-tts', sprachen: SPRACHEN.map(code => ({ code, muttersprachlich: false, geprueft: false })), hoerprobe: {},
        sortierung: i + (anbieter === 'openai-live' ? 0 : anbieter === 'openai-audio' ? 50 : 100),
      } })
    }
  }
  return { neu, gesamt: await prisma.stimme.count() }
}

export interface StimmSprache { code: string; muttersprachlich: boolean; geprueft: boolean; wortgenauigkeit?: number }

/** Nur freigegebene Stimmen, die für diese Sprache muttersprachlich geprüft sind (07 §4.5). */
export async function anbietbareStimmen(sprache?: string) {
  const alle = await prisma.stimme.findMany({ where: { sichtbar: true, geprueft_am: { not: null } }, orderBy: { sortierung: 'asc' } })
  return alle.filter(s => !sprache || (s.sprachen as unknown as StimmSprache[]).some(x => x.code === sprache && x.geprueft && x.muttersprachlich))
}
