import { prisma } from '@/lib/db'
import { speicherPfad } from '@/lib/speicher'
import { dateiAntwort } from '@/lib/datei-antwort'

/** Echte Hörprobe je Sprache (07 §5), öffentlich, lange zwischenspeicherbar. Admins hören auch ungeprüfte (Freigabe). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sprache = new URL(req.url).searchParams.get('sprache') || ''
  const s = await prisma.stimme.findUnique({ where: { id: decodeURIComponent(id) } })
  const key = (s?.hoerprobe as Record<string, string> | undefined)?.[sprache]
  if (!s || !key) return new Response('nicht gefunden', { status: 404 })
  if (!s.sichtbar) {
    const { aktuelleSitzung } = await import('@/lib/konto/sitzung')
    const sz = await aktuelleSitzung()
    if (!sz?.nutzer.ist_admin) return new Response('nicht gefunden', { status: 404 })
  }
  return dateiAntwort(req, speicherPfad(key), 'audio/mpeg', { 'cache-control': s.sichtbar ? 'public, max-age=86400' : 'private, no-store' })
}
