import { mitSitzung, ApiFehler } from '@/lib/api'
import { prisma } from '@/lib/db'
import { beitragVon } from '@/lib/mandant/zugriff'
import { speicherPfad } from '@/lib/speicher'
import { dateiAntwort } from '@/lib/datei-antwort'

type Ctx = { params: Promise<{ id: string; nr: string }> }

/** ▶ je Zeile in der Drehbuch-Ansicht. */
export const GET = mitSitzung<Ctx>('hoeren', async ({ req, s, ctx }) => {
  const { id, nr } = await ctx.params
  await beitragVon(s.mandant!.id, id)
  const z = await prisma.zeile.findFirst({ where: { beitrag_id: id, nr: Number(nr) } })
  if (!z?.audio) throw new ApiFehler(404, 'kein_audio', 'kein_audio')
  return dateiAntwort(req, speicherPfad(z.audio), 'audio/wav')
})
