// Rollen im Browser (Spiegel von lib/konto/sitzung.ts → darf; dort nicht importierbar, weil serverseitig).
import type { Rolle } from '@/lib/konto/sitzung'

const RANG: Record<Rolle, number> = { hoeren: 1, redaktion: 2, admin: 3, inhaber: 4 }
export const darf = (rolle: Rolle, mindestens: Rolle) => RANG[rolle] >= RANG[mindestens]
export type { Rolle }
