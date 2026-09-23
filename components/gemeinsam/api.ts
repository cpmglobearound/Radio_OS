// Ein Weg für alle Anfragen aus dem Browser: JSON rein, { ok, daten } oder { ok:false, code } raus.
// Fehlercodes werden NIE angezeigt — die Oberfläche übersetzt sie mit fehlerText().
import type { GemeinsamTexte } from '@/lib/i18n/texte/gemeinsam'

export type Antwort<T> = { ok: true; daten: T; status: number } | { ok: false; code: string; status: number }

export async function api<T = unknown>(url: string, o: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<Antwort<T>> {
  let res: Response
  try {
    res = await fetch(url, {
      method: o.method ?? (o.body === undefined ? 'GET' : 'POST'),
      headers: o.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: o.body === undefined ? undefined : JSON.stringify(o.body),
      signal: o.signal,
      cache: 'no-store',
    })
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e
    return { ok: false, code: 'netz', status: 0 }
  }
  const j = await res.json().catch(() => null)
  if (res.ok) return { ok: true, daten: j as T, status: res.status }
  const code = typeof j?.code === 'string' ? j.code : res.status >= 500 ? 'intern' : 'unbekannt'
  return { ok: false, code, status: res.status }
}

/** Code → Satz in der Sprache der Oberfläche. Unbekannte Codes bekommen einen allgemeinen, freundlichen Satz. */
export function fehlerText(code: string, f: GemeinsamTexte['fehler']) {
  return (f as Record<string, string>)[code] ?? f.unbekannt
}
