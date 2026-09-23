// EINE Stelle für die Tonalitätsregler (06 §3) und Vorlagen.
export interface Tonalitaet {
  humor: 0 | 1 | 2 | 3 | 4
  lachen: 'nie' | 'selten' | 'natuerlich' | 'oft'
  haltung: 'neutral' | 'einordnend' | 'meinungsfreudig'
  waerme: 'sachlich' | 'freundlich' | 'herzlich'
  energie: 'ruhig' | 'normal' | 'lebhaft'
  tempo: 'langsam' | 'normal' | 'zuegig'
  niveau: 'einfach' | 'normal' | 'gehoben'
  zielgruppe: 'allgemein' | 'jung' | 'aelter' | 'fach' | 'familien'
  anrede?: string
}

export const REGLER = {
  humor: [0, 1, 2, 3, 4],
  lachen: ['nie', 'selten', 'natuerlich', 'oft'],
  haltung: ['neutral', 'einordnend', 'meinungsfreudig'],
  waerme: ['sachlich', 'freundlich', 'herzlich'],
  energie: ['ruhig', 'normal', 'lebhaft'],
  tempo: ['langsam', 'normal', 'zuegig'],
  niveau: ['einfach', 'normal', 'gehoben'],
  zielgruppe: ['allgemein', 'jung', 'aelter', 'fach', 'familien'],
} as const

export const VORLAGEN: Record<string, Tonalitaet> = {
  nachrichten_serioes: { humor: 0, lachen: 'nie', haltung: 'neutral', waerme: 'sachlich', energie: 'normal', tempo: 'normal', niveau: 'normal', zielgruppe: 'allgemein' },
  ernst_mit_humor: { humor: 2, lachen: 'natuerlich', haltung: 'einordnend', waerme: 'herzlich', energie: 'normal', tempo: 'normal', niveau: 'normal', zielgruppe: 'allgemein' },
  morgenshow_locker: { humor: 3, lachen: 'oft', haltung: 'einordnend', waerme: 'herzlich', energie: 'lebhaft', tempo: 'zuegig', niveau: 'einfach', zielgruppe: 'allgemein' },
  glosse: { humor: 4, lachen: 'natuerlich', haltung: 'meinungsfreudig', waerme: 'freundlich', energie: 'lebhaft', tempo: 'normal', niveau: 'normal', zielgruppe: 'allgemein' },
  ladenfunk_freundlich: { humor: 1, lachen: 'selten', haltung: 'neutral', waerme: 'herzlich', energie: 'normal', tempo: 'normal', niveau: 'einfach', zielgruppe: 'allgemein' },
}

/** Taktregel (06 §4) — hart, nicht abschaltbar. */
export function mitTaktregel(t: Tonalitaet, sensibel: boolean): Tonalitaet {
  if (!sensibel) return t
  return { ...t, humor: 0, lachen: 'nie', waerme: t.waerme === 'sachlich' ? 'freundlich' : t.waerme }
}

/** EINE Stelle für Emotionen je Zeile (Wunsch Oliver: positiv, lustig, aber auch seriös). */
export const EMOTIONEN = ['freudig', 'begeistert', 'lustig', 'verschmitzt', 'ueberrascht', 'warm', 'mitfuehlend', 'nachdenklich', 'ernst', 'sachlich'] as const
export type Emotion = (typeof EMOTIONEN)[number]
/** Wie die Stimme die Emotion umsetzen soll (Anweisung an das Stimmmodell, deutsch — die Modelle verstehen es sprachunabhängig). */
export const EMOTION_REGIE: Record<Emotion, string> = {
  freudig: 'hörbar gut gelaunt, lächelnd gesprochen',
  begeistert: 'begeistert, energiegeladen, mit Schwung',
  lustig: 'amüsiert, mit Lachen in der Stimme; kurzes echtes Auflachen erlaubt, wenn die Regie es verlangt',
  verschmitzt: 'trocken-verschmitzt, kleines Schmunzeln',
  ueberrascht: 'ehrlich überrascht, ungläubig',
  warm: 'warm, nahbar, freundlich',
  mitfuehlend: 'mitfühlend, leiser, langsamer, respektvoll',
  nachdenklich: 'nachdenklich, ruhig, mit kleinen Pausen',
  ernst: 'ernst, klar, gefasst, kein Lächeln',
  sachlich: 'sachlich-neutral, klar, nachrichtlich',
}
/** Taktregel auf Zeilenebene: in sensiblen Blöcken nie lustig/verschmitzt/begeistert. */
export function emotionMitTakt(e: Emotion, sensibel: boolean): Emotion {
  return sensibel && ['lustig', 'verschmitzt', 'begeistert', 'freudig', 'ueberrascht'].includes(e) ? 'mitfuehlend' : e
}
