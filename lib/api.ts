import { NextResponse } from 'next/server'
import { ZodError, type ZodType } from 'zod'
import { aktuelleSitzung, darf, ursprungOk, type Rolle, type Sitzung } from '@/lib/konto/sitzung'

/** Fehlerform überall gleich (12): { error: Text für Menschen, code: maschinen_code } */
export const fehler = (status: number, code: string, error: string) => NextResponse.json({ error, code }, { status })

export class ApiFehler extends Error {
  constructor(public status: number, public code: string, msg: string) { super(msg) }
}

type Handler<C> = (a: { req: Request; s: Sitzung; ctx: C }) => Promise<Response>

/** Portal-API mit Sitzung, Mandant, Mindestrolle und CSRF-Prüfung. */
export function mitSitzung<C = unknown>(mindestens: Rolle, h: Handler<C>) {
  return async (req: Request, ctx: C) => {
    try {
      if (req.method !== 'GET' && !(await ursprungOk())) return fehler(403, 'ursprung', 'Diese Anfrage kam nicht von unserer Seite.')
      const s = await aktuelleSitzung()
      if (!s) return fehler(401, 'nicht_angemeldet', 'Bitte melden Sie sich an.')
      if (!s.mandant) return fehler(403, 'kein_mandant', 'Ihrem Konto ist noch keine Firma zugeordnet.')
      if (!darf(s.rolle, mindestens)) return fehler(403, 'keine_rechte', 'Dafür fehlen Ihnen die Rechte. Fragen Sie den Inhaber Ihres Kontos.')
      return await h({ req, s, ctx })
    } catch (e) { return fehlerAntwort(e) }
  }
}

export function fehlerAntwort(e: unknown) {
  if (e instanceof ApiFehler) return fehler(e.status, e.code, e.message)
  if (e instanceof ZodError) return fehler(400, 'eingabe', 'Bitte prüfen Sie Ihre Eingaben: ' + e.issues.map(i => i.path.join('.') || i.message).join(', '))
  console.error(e)
  return fehler(500, 'intern', 'Da ist etwas schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.')
}

export async function koerper<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const j = await req.json().catch(() => { throw new ApiFehler(400, 'json', 'Die Anfrage war unvollständig.') })
  return schema.parse(j)
}
