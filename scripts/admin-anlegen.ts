// Klarframe-Admin anlegen (ohne Passwort — Anmeldung per Link aus der E-Mail). Aufruf: npx tsx scripts/admin-anlegen.ts <email> "<Name>"
import { prisma } from '@/lib/db'

async function main() {
  const email = (process.argv[2] || '').toLowerCase(), name = process.argv[3] || 'Klarframe'
  if (!email.includes('@')) throw new Error('E-Mail fehlt')
  const vorhanden = await prisma.nutzer.findUnique({ where: { email } })
  if (vorhanden) { await prisma.nutzer.update({ where: { email }, data: { ist_klarframe_admin: true } }); console.log('Admin-Recht gesetzt:', email); return }
  const n = await prisma.nutzer.create({ data: { email, name, sprache: 'de', email_bestaetigt_am: new Date(), ist_klarframe_admin: true } })
  const m = await prisma.mandant.create({ data: { name: 'Klarframe', art: 'firma', land: 'ES', zeitzone: 'Europe/Madrid', bestellt_am: new Date(), sonderpreis_eur: 0, sonderpreis_notiz: 'Klarframe intern' } })
  await prisma.mitgliedschaft.create({ data: { mandant_id: m.id, nutzer_id: n.id, rolle: 'inhaber' } })
  await prisma.buchung.create({ data: { mandant_id: m.id, art: 'korrektur', sekunden: 7200, notiz: 'Klarframe intern: Startguthaben 120 min' } })
  console.log('Admin angelegt:', email)
}
main().finally(() => prisma.$disconnect())
