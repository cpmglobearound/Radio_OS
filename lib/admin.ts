import { aktuelleSitzung, ursprungOk } from '@/lib/konto/sitzung'
import { fehler, fehlerAntwort } from '@/lib/api'
import type { Sitzung } from '@/lib/konto/sitzung'

/** Klarframe-Admin (13 §1): nur ist_klarframe_admin; jede Aktion wird protokolliert. */
export function nurAdmin<C>(h: (a: { req: Request; s: Sitzung; ctx: C }) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      if (req.method !== 'GET' && !(await ursprungOk())) return fehler(403, 'ursprung', 'ursprung')
      const s = await aktuelleSitzung()
      if (!s?.nutzer.ist_admin) return fehler(404, 'nicht_gefunden', 'nicht_gefunden')
      return await h({ req, s, ctx })
    } catch (e) { return fehlerAntwort(e) }
  }
}
