// „Mit meinem Text anhören" und „Paar anhören": Ton von der Probe-API holen und abspielen.
// Die Probe-API liefert audio/wav (kein JSON) — deshalb nicht über api(), aber mit denselben Fehlercodes.

export type ProbeErgebnis = { ok: true; blob: Blob } | { ok: false; code: string }

/** POST /api/v1/stimmen/{id}/probe → Blob. Abbruch (signal) wirft AbortError weiter. */
export async function probeHolen(id: string, text: string, sprache: string, signal: AbortSignal): Promise<ProbeErgebnis> {
  let res: Response
  try {
    res = await fetch(`/api/v1/stimmen/${encodeURIComponent(id)}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sprache }),
      signal,
      cache: 'no-store',
    })
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e
    return { ok: false, code: 'netz' }
  }
  if (!res.ok) {
    const j = await res.json().catch(() => null)
    return { ok: false, code: typeof j?.code === 'string' ? j.code : res.status >= 500 ? 'intern' : 'unbekannt' }
  }
  try {
    return { ok: true, blob: await res.blob() }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e
    return { ok: false, code: 'netz' }
  }
}

/**
 * Spielt einen Blob ab. Ergebnis: 'ende' (ganz gehört) oder 'gestoppt' (abgebrochen oder ein anderer Ton hat begonnen).
 * Das Element hängt kurz im Dokument, damit andere ▶-Knöpfe (HoerKnopf) es bemerken und selbst anhalten — nur ein Ton gleichzeitig.
 */
export function blobAbspielen(blob: Blob, signal: AbortSignal): Promise<'ende' | 'gestoppt'> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { resolve('gestoppt'); return }
    const url = URL.createObjectURL(blob)
    const a = new Audio(url)
    let fertig = false
    const aufraeumen = () => {
      fertig = true
      document.removeEventListener('play', anderer, true)
      signal.removeEventListener('abort', stopp)
      a.pause()
      a.remove()
      URL.revokeObjectURL(url)
    }
    const ende = (w: 'ende' | 'gestoppt') => { if (fertig) return; aufraeumen(); resolve(w) }
    const fehler = () => { if (fertig) return; aufraeumen(); reject(new Error('ton')) }
    function anderer(e: Event) { if (e.target !== a) ende('gestoppt') }
    function stopp() { ende('gestoppt') }
    a.addEventListener('ended', () => ende('ende'))
    a.addEventListener('error', fehler)
    document.addEventListener('play', anderer, true)
    signal.addEventListener('abort', stopp)
    document.body.appendChild(a)
    a.play().catch(fehler)
  })
}
