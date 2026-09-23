// Rückfall-Sätze für die gesprochene KI-Kennung (14 §1), falls das Drehbuch sie nach allen Runden nicht enthält.
export const KENNUNG: Record<string, (n: number) => string> = {
  de: n => (n > 1 ? 'Kurzer Hinweis: Hier sprechen KI-Stimmen.' : 'Kurzer Hinweis: Hier spricht eine KI-Stimme.'),
  es: n => (n > 1 ? 'Un apunte rápido: aquí hablan voces creadas con inteligencia artificial.' : 'Un apunte rápido: esta voz está creada con inteligencia artificial.'),
  en: n => (n > 1 ? 'Quick note: the voices you’re hearing are AI-generated.' : 'Quick note: the voice you’re hearing is AI-generated.'),
  ca: n => (n > 1 ? 'Un apunt ràpid: aquí parlen veus creades amb intel·ligència artificial.' : 'Un apunt ràpid: aquesta veu està creada amb intel·ligència artificial.'),
}
export const PROBE_HINWEIS: Record<string, string> = {
  de: 'Eine Hörprobe von Klarframe Radio.', es: 'Una muestra de Klarframe Radio.', en: 'A sample from Klarframe Radio.', ca: 'Una mostra de Klarframe Radio.',
}
