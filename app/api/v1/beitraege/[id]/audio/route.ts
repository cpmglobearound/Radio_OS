import { mitSitzung, ApiFehler } from '@/lib/api'
import { beitragVon } from '@/lib/mandant/zugriff'
import { speicherPfad } from '@/lib/speicher'
import { dateiAntwort } from '@/lib/datei-antwort'
import { protokoll } from '@/lib/protokoll'
import type { BeitragEinstellungen } from '@/lib/redaktion/typen'

type Ctx = { params: Promise<{ id: string }> }

/** Anhören geht immer; Herunterladen erst nach Bestellung (09: nicht_bestellt). */
export const GET = mitSitzung<Ctx>('hoeren', async ({ req, s, ctx }) => {
  const { id } = await ctx.params
  const b = await beitragVon(s.mandant!.id, id)
  const u = new URL(req.url)
  const format = u.searchParams.get('format') === 'wav' ? 'wav' : 'mp3'
  const download = u.searchParams.get('download') === '1'
  const key = format === 'wav' ? b.audio_master : b.audio_mp3
  if (!key) throw new ApiFehler(404, 'kein_audio', 'kein_audio')
  if ((download || format === 'wav') && !s.mandant!.bestellt_am) throw new ApiFehler(403, 'nicht_bestellt', 'nicht_bestellt')
  const extra: Record<string, string> = {}
  if (download) {
    const e = b.einstellungen as unknown as BeitragEinstellungen
    const name = `${e.sendungsname}_${(b.fertig_am ?? b.erstellt_am).toISOString().slice(0, 16).replace(/[:T]/g, '-')}_${e.sprache}.${format}`.replace(/[^\p{L}\p{N}._-]+/gu, '_')
    extra['content-disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(name)}`
    await protokoll({ mandant_id: s.mandant!.id, nutzer_id: s.nutzer.id, aktion: 'beitrag.heruntergeladen', ziel_typ: 'beitrag', ziel_id: id, daten: { format } })
  }
  return dateiAntwort(req, speicherPfad(key), format === 'wav' ? 'audio/wav' : 'audio/mpeg', extra)
})
