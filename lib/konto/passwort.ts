import bcrypt from 'bcryptjs'

// Kurze Liste häufiger Passwörter (Rückfalllinie; Länge ≥ 12 ist die Hauptregel).
const HAEUFIG = new Set(['123456789012', 'passwort1234', 'password1234', 'qwertzuiopü', 'qwertyuiop12', '111111111111', 'aaaaaaaaaaaa', 'hallo1234567', 'iloveyou1234', 'contraseña123', 'passwortpasswort', 'passwordpassword', 'klarframe1234', 'radio1234567'])

export function passwortProblem(pw: string): 'zu_kurz' | 'zu_haeufig' | null {
  if (!pw || pw.length < 12) return 'zu_kurz'
  if (HAEUFIG.has(pw.toLowerCase()) || /^(.)\1+$/.test(pw)) return 'zu_haeufig'
  return null
}
export const passwortHash = (pw: string) => bcrypt.hash(pw, 12)
export const passwortPruefen = (pw: string, h: string | null) => (h ? bcrypt.compare(pw, h) : Promise.resolve(false))
