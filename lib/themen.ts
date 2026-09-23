// EINE Stelle für Themengebiete (05 §1).
export const THEMENGEBIETE = [
  'lokales', 'politik', 'wirtschaft', 'immobilien', 'arbeit', 'verkehr', 'wetter', 'umwelt', 'gesundheit', 'bildung',
  'kultur', 'veranstaltungen', 'sport', 'tourismus', 'gastronomie', 'technik', 'wissenschaft', 'kurioses', 'verbraucher', 'recht',
] as const
export type Themengebiet = (typeof THEMENGEBIETE)[number]
