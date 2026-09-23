// Testkonto mit allem frei: Klarframe-Admin, Inhaber eines bestellten Mandanten (Abo Sender XL), großes Guthaben.
// Aufruf: npx tsx scripts/testkonto-anlegen.ts <email> <passwort>
import { prisma } from '@/lib/db'
import { passwortHash } from '@/lib/konto/passwort'

async function main() {
  const [email, pw] = [process.argv[2].toLowerCase(), process.argv[3]]
  let n = await prisma.nutzer.findUnique({ where: { email } })
  if (!n) n = await prisma.nutzer.create({ data: { email, name: 'Test Klarframe', sprache: 'de', email_bestaetigt_am: new Date(), ist_klarframe_admin: true, passwort_hash: await passwortHash(pw) } })
  else n = await prisma.nutzer.update({ where: { id: n.id }, data: { passwort_hash: await passwortHash(pw), ist_klarframe_admin: true, email_bestaetigt_am: new Date(), gesperrt_bis: null, fehlversuche: 0, geloescht_am: null } })
  let mg = await prisma.mitgliedschaft.findFirst({ where: { nutzer_id: n.id }, include: { mandant: true } })
  if (!mg) {
    const m = await prisma.mandant.create({ data: { name: 'Klarframe Testsender', art: 'sender', land: 'ES', zeitzone: 'Europe/Madrid', bestellt_am: new Date(), tarif_id: 'sender_xl', sonderpreis_eur: 0, sonderpreis_notiz: 'Testkonto Klarframe' } })
    await prisma.mitgliedschaft.create({ data: { mandant_id: m.id, nutzer_id: n.id, rolle: 'inhaber' } })
    await prisma.buchung.create({ data: { mandant_id: m.id, art: 'korrektur', sekunden: 3000 * 60, notiz: 'Testkonto: 3.000 Minuten' } })
    mg = await prisma.mitgliedschaft.findFirst({ where: { nutzer_id: n.id }, include: { mandant: true } })
  }
  console.log('Testkonto bereit:', email, '— Mandant:', mg!.mandant.name)
}
main().finally(() => prisma.$disconnect())
