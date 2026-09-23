// Startwert fürs Sprechtempo je Stimme × Sprache aus den Hörproben (bekannter Text, gemessene Dauer).
// Überschreibt nie Werte aus echten Produktionen — nur Lücken füllen, damit keine Stimme „blind" startet (06 §5).
import { execFileSync } from 'node:child_process'
import { prisma } from '@/lib/db'
import { PROBETEXTE } from '@/lib/stimmen/probetexte'
import { speicherPfad } from '@/lib/speicher'
import { woerter } from '@/lib/produktion/hoeren'

function dauer(datei: string) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', datei]).toString().trim())
}
async function main() {
  let neu = 0
  for (const s of await prisma.stimme.findMany()) {
    const proben = s.hoerprobe as Record<string, string>, rate = { ...((s.wortrate as Record<string, number> | null) ?? {}) }
    let geaendert = false
    for (const [sprache, key] of Object.entries(proben)) {
      if (rate[sprache] || !PROBETEXTE[sprache]) continue
      try {
        const sek = dauer(speicherPfad(key)) - 0.3   // kurzer Nachlauf der Probe
        const wpm = Math.round((woerter(PROBETEXTE[sprache].satz).length / sek) * 60)
        if (wpm > 80 && wpm < 260) { rate[sprache] = wpm; geaendert = true; neu++ }
      } catch { /* Probe fehlt */ }
    }
    if (geaendert) await prisma.stimme.update({ where: { id: s.id }, data: { wortrate: rate } })
  }
  console.log(`${neu} Startwerte gesetzt`)
  for (const s of await prisma.stimme.findMany({ where: { anbieter_id: 'openai-live', anbieter_stimm_id: { in: ['gleam', 'vesper', 'stone', 'cedar'] } } })) console.log(s.id, JSON.stringify(s.wortrate))
}
main().finally(() => prisma.$disconnect())
