// Einrichtung/Abgleich: Katalog-Startwerte + Stimmenkatalog (legt neue Stimmen UNSICHTBAR an, Regel 7).
import { execSync } from 'node:child_process'
import { katalogAbgleichen } from '@/lib/stimmen/katalog'
import { prisma } from '@/lib/db'

execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
katalogAbgleichen().then(async r => { console.log('Stimmen:', r); await prisma.$disconnect() })
