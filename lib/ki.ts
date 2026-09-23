// Schlanke Anbindung an die OpenAI-Responses-API (Text + Websuche) mit Kostenerfassung.
export const MODELLE = {
  drehbuch: process.env.MODELL_DREHBUCH || 'gpt-5.4',
  werkzeug: process.env.MODELL_WERKZEUG || 'gpt-5.4-mini',
  suche: process.env.MODELL_SUCHE || 'gpt-5.4-mini',
}
// USD je 1 Mio. Tokens (Eingabe, Ausgabe) — offizielle Preise laut developers.openai.com/api/docs/pricing, Stand 23.09.2026.
const PREISE: Record<string, [number, number]> = { 'gpt-5.4': [2.5, 15], 'gpt-5.4-mini': [0.75, 4.5], 'gpt-5.5': [5, 30] }

export interface KiErgebnis<T> { daten: T; kosten_usd: number }

function kosten(modell: string, u?: { input_tokens?: number; output_tokens?: number }) {
  const [e, a] = PREISE[modell] ?? [2.5, 15]
  return ((u?.input_tokens ?? 0) * e + (u?.output_tokens ?? 0) * a) / 1e6
}

async function responses(body: object, versuche = 3): Promise<{ output_text?: string; output?: unknown[]; usage?: { input_tokens?: number; output_tokens?: number } }> {
  let letzter: unknown
  for (let v = 1; v <= versuche; v++) {
    try {
      const r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(240_000),
      })
      const d = await r.json()
      if (r.ok) return d
      letzter = new Error(`OpenAI ${r.status}: ${JSON.stringify(d).slice(0, 300)}`)
      if (r.status < 500 && r.status !== 429) break
    } catch (e) { letzter = e }
    await new Promise(res => setTimeout(res, 1500 * v))
  }
  throw letzter
}

function text(d: { output_text?: string; output?: unknown[] }) {
  if (d.output_text) return d.output_text
  for (const o of (d.output ?? []) as { type: string; content?: { type: string; text?: string }[] }[])
    if (o.type === 'message') for (const c of o.content ?? []) if (c.type === 'output_text' && c.text) return c.text
  return ''
}

/** Strukturierte Ausgabe per JSON-Schema (strict). */
export async function kiJson<T>(a: { modell?: string; system: string; eingabe: string; schema: object; name: string; aufwand?: 'none' | 'low' | 'medium' | 'high' }): Promise<KiErgebnis<T>> {
  const modell = a.modell ?? MODELLE.werkzeug
  const d = await responses({
    model: modell, reasoning: { effort: a.aufwand ?? 'low' },
    input: [{ role: 'system', content: a.system }, { role: 'user', content: a.eingabe }],
    text: { format: { type: 'json_schema', name: a.name, strict: true, schema: a.schema } },
  })
  return { daten: JSON.parse(text(d)) as T, kosten_usd: kosten(modell, d.usage) }
}

/** Websuche über OpenAI: liefert Artikel-URLs. */
export async function openaiSuche(anfrage: string, anzahl: number): Promise<KiErgebnis<{ titel: string; url: string; datum: string }[]>> {
  const d = await responses({
    model: MODELLE.suche, reasoning: { effort: 'low' }, tools: [{ type: 'web_search' }],
    input: `Finde bis zu ${anzahl} aktuelle, frei zugängliche Artikel (keine Bezahlschranke) zu: ${anfrage}\nAntworte NUR mit JSON: {"artikel":[{"titel":"…","url":"https://…","datum":"JJJJ-MM-TT oder leer"}]}`,
  })
  const t = text(d), m = t.match(/\{[\s\S]*\}/)
  let artikel: { titel: string; url: string; datum: string }[] = []
  try { artikel = JSON.parse(m?.[0] ?? '{}').artikel ?? [] } catch { /* leer */ }
  return { daten: artikel.filter(x => /^https?:\/\//.test(x.url)), kosten_usd: kosten(MODELLE.suche, d.usage) + 0.01 }   // + 10 $ je 1.000 Suchaufrufe
}

/** Zweite Suchquelle: Kimi mit eingebauter Websuche. Modell einstellbar (kimi-k3 meldete am 23.09.2026 „tokenization failed"). */
export async function kimiSuche(anfrage: string, anzahl: number): Promise<KiErgebnis<{ titel: string; url: string; datum: string }[]>> {
  const key = process.env.KIMI_API_KEY
  if (!key) return { daten: [], kosten_usd: 0 }
  const modell = process.env.KIMI_SUCHMODELL || 'kimi-k2.6'
  const messages: object[] = [{ role: 'user', content: `Suche im Web nach bis zu ${anzahl} aktuellen, frei zugänglichen Artikeln zu: ${anfrage}\nAntworte NUR mit JSON: {"artikel":[{"titel":"…","url":"https://…","datum":"JJJJ-MM-TT oder leer"}]}` }]
  for (let runde = 0; runde < 5; runde++) {
    const r = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: modell, messages, tools: [{ type: 'builtin_function', function: { name: '$web_search' } }], ...(modell === 'kimi-k3' ? { reasoning_effort: 'low' } : {}) }),
      signal: AbortSignal.timeout(180_000),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(`Kimi ${r.status}: ${JSON.stringify(d).slice(0, 200)}`)
    const c = d.choices[0]
    messages.push(c.message)
    if (c.finish_reason === 'tool_calls') {
      for (const tc of c.message.tool_calls) messages.push({ role: 'tool', tool_call_id: tc.id, name: tc.function.name, content: tc.function.arguments })
      continue
    }
    const m = String(c.message.content || '').match(/\{[\s\S]*\}/)
    try { return { daten: (JSON.parse(m?.[0] ?? '{}').artikel ?? []).filter((x: { url: string }) => /^https?:\/\//.test(x.url)), kosten_usd: 0.02 } } catch { return { daten: [], kosten_usd: 0.02 } }
  }
  return { daten: [], kosten_usd: 0.02 }
}
