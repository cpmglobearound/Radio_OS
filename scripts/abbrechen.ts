// Beiträge abbrechen (Reservierung zurück). Aufruf: npx tsx scripts/abbrechen.ts <id> [<id> …]
import { abbrechen } from '@/lib/produktion/strecke'
async function main() { for (const id of process.argv.slice(2)) console.log(id, (await abbrechen(id)) ? 'abgebrochen' : 'nicht (mehr) laufend') }
main().then(() => process.exit(0))
