import type { StimmAnbieter } from './typ'
import { sprechAnweisung } from '../anweisung'

// gpt-4o-mini-tts: günstig, sehr wortgetreu, Stilanweisungen — lacht nicht echt (Nachrichten, Durchsagen).
export const openaiTts: StimmAnbieter = {
  id: 'openai-tts', name: 'OpenAI Sprachausgabe',
  faehigkeiten: { lachen: false, regieAlsText: true, mehrsprecher: false, maxZeichen: 4000, sprachen: ['de-DE', 'es-ES', 'en-GB'] },
  async sprechen(a) {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: a.stimme, input: a.text, instructions: sprechAnweisung(a).replace(/Nichtsprachliche Laute[^.]*\./, ''), response_format: 'wav' }),
      signal: AbortSignal.timeout(120_000),
    })
    if (!r.ok) throw new Error(`openai-tts ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const wav = Buffer.from(await r.arrayBuffer())
    // Audio-Ausgabe 12 $/1 Mio. Tokens, 1.200 Tokens je Minute (Doku „voice-latency-cost") → rund 0,0144 $/min; WAV = 24 kHz, 16 bit, mono.
    const minuten = Math.max(0, wav.length - 44) / (24000 * 2) / 60
    return { wav, kosten_usd: minuten * 1200 * 12 / 1e6 + (a.text.length / 4) * 0.6 / 1e6 }
  },
}
