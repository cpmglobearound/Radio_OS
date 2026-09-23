# 03 — Datenmodell

Vollständiger Entwurf als Prisma-Schema. Namen auf Deutsch in Kleinbuchstaben
mit Unterstrich, wie im Voice OS. **Jede Tabelle mit Kundendaten trägt
`mandant_id`** — Abfragen ohne Mandantenfilter sind ein Fehler (siehe 04, §5).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────── Konten und Mandanten ───────────────────────────

model Mandant {
  id                 String   @id @default(cuid())
  name               String                    // Firmen- oder Sendername
  art                String   @default("firma") // firma | sender | agentur
  eltern_id          String?                   // Agentur → Unter-Mandant
  land               String?                   // ISO 3166-1 alpha-2, z. B. "ES"
  zeitzone           String   @default("Europe/Berlin") // IANA; Standard aus Land bei Registrierung
  sprache_oberflaeche String  @default("de")   // de | en | es
  rechnungs_name     String?
  rechnungs_adresse  Json?                     // { strasse, plz, ort, land }
  ust_id             String?
  stripe_kunde_id    String?  @unique
  tarif_id           String?
  bestellt_am        DateTime?                 // null = Probe; gesetzt = bestellt (Downloads/Feeds/Konnektoren offen)
  bestellter_preis_eur Float?                  // Obergrenze (Regel 5)
  sonderpreis_eur    Float?
  sonderpreis_notiz  String?
  gesperrt_grund     String?                   // z. B. zahlung_offen; null = aktiv
  geloescht_am       DateTime?                 // weiche Löschung, endgültig nach Frist (04 §6)
  erstellt_am        DateTime @default(now())
  aktualisiert_am    DateTime @updatedAt

  nutzer         Mitgliedschaft[]
  sendungen      Sendung[]
  beitraege      Beitrag[]
  quellen        Quelle[]
  stimm_favoriten StimmFavorit[]
  ziele          AuslieferungsZiel[]
  buchungen      Buchung[]
  api_schluessel ApiSchluessel[]
  @@index([eltern_id])
}

model Nutzer {
  id                String   @id @default(cuid())
  email             String   @unique           // klein geschrieben gespeichert
  email_bestaetigt_am DateTime?
  passwort_hash     String?                    // bcrypt, Kosten 12; null bei reinem Magic-Link/SSO
  name              String
  sprache           String   @default("de")
  sitzung_version   Int      @default(1)       // hochzählen = alle Sitzungen ungültig
  zwei_faktor_geheim String?                   // verschlüsselt (TOTP), optional
  ist_klarframe_admin Boolean @default(false)
  letzte_anmeldung  DateTime?
  fehlversuche      Int      @default(0)
  gesperrt_bis      DateTime?
  geloescht_am      DateTime?
  erstellt_am       DateTime @default(now())
  mitgliedschaften  Mitgliedschaft[]
}

model Mitgliedschaft {
  id         String  @id @default(cuid())
  mandant_id String
  nutzer_id  String
  rolle      String  // inhaber | admin | redaktion | hoeren
  eingeladen_von String?
  erstellt_am DateTime @default(now())
  mandant Mandant @relation(fields: [mandant_id], references: [id])
  nutzer  Nutzer  @relation(fields: [nutzer_id], references: [id])
  @@unique([mandant_id, nutzer_id])
}

model Einladung {
  id          String   @id @default(cuid())
  mandant_id  String
  email       String
  rolle       String
  token_hash  String   @unique   // nur Hash speichern
  gueltig_bis DateTime
  angenommen_am DateTime?
}

model EinmalToken {           // E-Mail bestätigen, Passwort zurücksetzen, Magic-Link, Löschbestätigung
  id         String   @id @default(cuid())
  nutzer_id  String
  zweck      String   // email_bestaetigen | passwort | anmelden | konto_loeschen | email_aendern
  token_hash String   @unique
  daten      Json?    // z. B. neue E-Mail
  gueltig_bis DateTime
  benutzt_am DateTime?
}

model ApiSchluessel {
  id          String   @id @default(cuid())
  mandant_id  String
  name        String
  praefix     String   // erste 8 Zeichen, zum Wiedererkennen (rk_live_ab12cd34…)
  hash        String   @unique
  rechte      String[] // beitraege:lesen, beitraege:erzeugen, sendungen:schreiben …
  zuletzt_benutzt DateTime?
  widerrufen_am DateTime?
  erstellt_am DateTime @default(now())
  mandant Mandant @relation(fields: [mandant_id], references: [id])
}

model Protokoll {             // Audit: wer hat was wann getan
  id          String   @id @default(cuid())
  mandant_id  String?
  nutzer_id   String?
  aktion      String   // z. B. sendung.geaendert, beitrag.heruntergeladen, konto.geloescht
  ziel_typ    String?
  ziel_id     String?
  daten       Json?
  ip_hash     String?
  zeit        DateTime @default(now())
  @@index([mandant_id, zeit])
}

// ─────────────────────────── Sendungen und Beiträge ───────────────────────────

model Sendung {
  id            String   @id @default(cuid())
  mandant_id    String
  name          String
  format        String   // Kennung aus lib/formate.ts
  sprache       String   // BCP-47 mit Region, z. B. de-DE, de-AT, es-ES, es-MX, en-GB (siehe 07)
  ziel_laenge_s Int      // gewünschte Länge
  stimmen       Json     // [{ rolle: "moderation_a", stimm_id, name_im_programm: "Lena", persoenlichkeit: "…" }]
  tonalitaet    Json     // Regler, siehe 06 §3
  themen        Json     // { gebiete: [...], stichworte: [...], ausschliessen: [...] }
  region        Json     // { land: "ES", orte: [{ name, lat, lon, radius_km }], sprachraum?: ... }
  quellen_regel Json     // { nur_eigene: bool, quellen_ids: [...], sperrliste: [...], max_alter_h: 48 }
  aufbau        Json?    // Vorlage: Anmoderation, Blöcke, Abmoderation, Jingles, Kennung
  freigabe_noetig Boolean @default(false) // Drehbuch vor Vertonung freigeben
  zeitplan      Json?    // { art: "cron", ausdruck: "0 7 * * 1-5" } | null = nur manuell
  zeitzone      String?  // null = Mandant
  ausliefern_an String[] // AuslieferungsZiel-IDs
  aktiv         Boolean  @default(true)
  naechster_lauf DateTime?
  erstellt_am   DateTime @default(now())
  aktualisiert_am DateTime @updatedAt
  stand         Int      @default(1)  // Speicherkonflikt erkennen (zwei Tabs, siehe 11)
  mandant  Mandant   @relation(fields: [mandant_id], references: [id])
  beitraege Beitrag[]
  @@index([aktiv, naechster_lauf])
}

model Beitrag {
  id            String   @id @default(cuid())
  mandant_id    String
  sendung_id    String?  // null = Einzelauftrag
  titel         String
  einstellungen Json     // eingefrorene Kopie aller Einstellungen zum Startzeitpunkt
  status        String   // wartet | recherche | redaktion | freigabe | vertonung | schnitt | fertig | fehlgeschlagen | gesperrt
  fortschritt   Json?    // { stufe, prozent, meldung }
  fehler        String?  // für den Kunden verständlich
  fehler_technisch String? // nur Admin
  ist_probe     Boolean  @default(false)
  reserviert_s  Int      @default(0)
  laenge_s      Float?
  abgerechnet_s Int?
  stimmklassen_faktor Float @default(1)
  audio_master  String?  // Speicherschlüssel WAV
  audio_mp3     String?
  kapitel       Json?    // [{ start_s, titel, block_id }]
  shownotes     String?  // Text mit Quellen (für Feeds/Podcasts)
  kosten        Json?    // { recherche_eur, text_eur, stimme_eur, nachhoeren_eur } — nur Admin
  erstellt_am   DateTime @default(now())
  fertig_am     DateTime?
  mandant  Mandant  @relation(fields: [mandant_id], references: [id])
  sendung  Sendung? @relation(fields: [sendung_id], references: [id])
  bloecke  Themenblock[]
  zeilen   Zeile[]
  fakten   Fakt[]
  zustellungen Zustellung[]
  @@index([mandant_id, erstellt_am])
  @@index([status])
}

model Themenblock {
  id         String @id @default(cuid())
  beitrag_id String
  reihenfolge Int
  thema      String
  blickwinkel String?
  zusammenfassung String?
  beitrag Beitrag @relation(fields: [beitrag_id], references: [id], onDelete: Cascade)
}

model Zeile {
  id          String  @id @default(cuid())
  beitrag_id  String
  block_id    String?
  nr          Int
  rolle       String   // moderation_a | moderation_b | sprecher …
  text        String
  regie       String?
  luecke_ms   Int      @default(280)  // Pause davor; negativ = Überlappung
  fakt_ids    String[] // welche Fakten diese Zeile trägt
  audio       String?  // Speicherschlüssel
  dauer_s     Float?
  gehoert     String?  // was die Spracherkennung verstand
  wortgenauigkeit Float?
  versuche    Int      @default(0)
  warnung     String?
  beitrag Beitrag @relation(fields: [beitrag_id], references: [id], onDelete: Cascade)
  @@unique([beitrag_id, nr])
}

// ─────────────────────────── Recherche ───────────────────────────

model Quelle {              // vom Mandanten oder global gepflegte Quellen
  id          String  @id @default(cuid())
  mandant_id  String?  // null = globale Quelle (von Klarframe gepflegt)
  art         String   // rss | webseite | sitemap | api | eigene_texte | kalender
  adresse     String
  name        String
  sprache     String?
  land        String?
  orte        String[]
  themen      String[]
  vertrauen   Int     @default(3)   // 1–5
  erlaubt     Boolean @default(true) // robots.txt / Nutzungsbedingungen geprüft
  pruef_notiz String?
  letzter_abruf DateTime?
  letzter_fehler String?
  mandant Mandant? @relation(fields: [mandant_id], references: [id])
}

model Dokument {            // ein abgerufener Artikel / eine Seite
  id          String   @id @default(cuid())
  url         String
  url_hash    String   @unique
  quelle_id   String?
  titel       String?
  sprache     String?
  veroeffentlicht_am DateTime?
  abgerufen_am DateTime @default(now())
  text        String   // extrahierter Klartext (nur intern, nie ausgeliefert)
  text_hash   String
  land        String?
  orte        String[]
  themen      String[]
  @@index([abgerufen_am])
}

model Fakt {                // eine prüfbare Aussage mit Herkunft
  id          String  @id @default(cuid())
  beitrag_id  String
  aussage     String   // in eigenen Worten, neutral
  zahl        String?  // wenn eine Zahl drinsteckt, genau so wie in der Quelle
  dokument_id String
  zitat       String   // wörtlicher Beleg aus dem Dokument (kurz, nur intern)
  quelle_name String
  url         String
  datum       DateTime?
  gewicht     Int      @default(1)
  beitrag Beitrag @relation(fields: [beitrag_id], references: [id], onDelete: Cascade)
}

// ─────────────────────────── Stimmen ───────────────────────────

model StimmAnbieter {
  id          String  @id           // openai-audio | openai-live | elevenlabs | cartesia | fish | google | azure …
  name        String
  aktiv       Boolean @default(true)
  klassen_faktor Float @default(1)   // Minutenverbrauch
  faehigkeiten Json    // { lachen, regie_text, mehrsprecher, ssml, aussprache_lexikon, max_zeichen, sprachen: [...] }
  kosten      Json    // { art: "zeichen"|"audio_token"|"sekunde", preis_usd_pro_einheit }
}

model Stimme {
  id           String  @id           // "<anbieter>:<anbieter_stimm_id>", z. B. "openai-live:gleam"
  anbieter_id  String
  anbieter_stimm_id String
  name         String
  geschlecht   String?  // weiblich | maennlich | neutral | null
  alter        String?  // jung | mittel | reif
  sprachen     Json     // [{ code: "de-DE", muttersprachlich: true, geprueft: true, probe_url }]
  stil         String[] // warm, seriös, jugendlich, tief, …
  kann_lachen  Boolean  @default(false)
  hoerprobe    Json     // { "de-DE": "speicher/…", "es-ES": "…" } je Sprache eine ECHTE Probe
  geprueft_am  DateTime?  // null = gefunden, aber NICHT anbietbar (Regel 7)
  geprueft_von String?
  sichtbar     Boolean  @default(false)
  klon_von_person Boolean @default(false) // nur mit Einwilligung, siehe 14
  einwilligung_dokument String?
  sortierung   Int      @default(0)
  @@index([anbieter_id, sichtbar])
}

model StimmFavorit {
  mandant_id String
  stimme_id  String
  notiz      String?
  mandant Mandant @relation(fields: [mandant_id], references: [id])
  @@id([mandant_id, stimme_id])
}

model Aussprache {          // Lexikon: wie wird ein Wort gesprochen (je Sprache, optional je Mandant)
  id         String  @id @default(cuid())
  mandant_id String?
  sprache    String
  wort       String
  sprich_als String   // Umschrift, z. B. "Klarfräim" oder IPA
  @@unique([mandant_id, sprache, wort])
}

// ─────────────────────────── Auslieferung ───────────────────────────

model AuslieferungsZiel {
  id          String  @id @default(cuid())
  mandant_id  String
  art         String   // download | feed | stream | webhook | sftp | s3 | playout_<system> | individuell
  name        String
  einstellungen Json   // je Art, Geheimnisse VERSCHLÜSSELT (siehe 14)
  dateiformat Json     // { codec: mp3|wav|aac, bitrate, abtastrate, kanaele, loudness_lufs, dateiname_muster }
  aktiv       Boolean @default(true)
  zuletzt_ok  DateTime?
  zuletzt_fehler String?
  mandant Mandant @relation(fields: [mandant_id], references: [id])
}

model Zustellung {
  id          String  @id @default(cuid())
  beitrag_id  String
  ziel_id     String
  status      String   // wartet | laeuft | ok | fehlgeschlagen
  versuche    Int      @default(0)
  nachweis    Json?    // z. B. { entfernte_datei, groesse, pruefsumme, http_status }
  fehler      String?
  zeit        DateTime @default(now())
  beitrag Beitrag @relation(fields: [beitrag_id], references: [id], onDelete: Cascade)
}

model StreamProgramm {      // für Firmen-Streams (Liquidsoap)
  id          String  @id @default(cuid())
  mandant_id  String
  name        String
  mount       String   @unique  // /m/<zufall>
  plan        Json     // Rotation: Sendungen, Anteile, Klangbetten, Kennungen
  zugang      String   // oeffentlich | token
  aktiv       Boolean  @default(false)
}

// ─────────────────────────── Abrechnung ───────────────────────────

model Tarif {
  id            String  @id           // start | pro | sender | individuell
  name          String
  preis_eur     Float
  minuten_inkl  Int
  max_sendungen Int?
  max_nutzer    Int?
  auslieferung  String[]
  stripe_preis_id String?
  aktiv         Boolean @default(true)
}

model Buchung {             // Kontobuch der Minuten — Guthaben = Summe, nie ein zweiter Zähler (Lehre CALL4ME)
  id          String   @id @default(cuid())
  mandant_id  String
  art         String   // monat_gutschrift | nachkauf | probe | reservierung | freigabe | verbrauch | korrektur | verfall
  sekunden    Int      // + Gutschrift, − Verbrauch/Reservierung
  beitrag_id  String?
  gueltig_bis DateTime?
  notiz       String?
  stripe_ref  String?
  zeit        DateTime @default(now())
  mandant Mandant @relation(fields: [mandant_id], references: [id])
  @@index([mandant_id, zeit])
}
```

## Begründungen, die man nicht aus dem Schema sieht

- **`Beitrag.einstellungen` friert alles ein.** Ändert jemand die Sendung,
  während ein Beitrag läuft, gilt für diesen Beitrag der Stand beim Start.
- **Guthaben nur als Kontobuch (`Buchung`).** CALL4ME hatte einen Zähler und
  ein Kontobuch; beide liefen still auseinander (3 von 6 Mandanten, bis 16:53
  Minuten). Hier gibt es nur das Buch; der Kontostand wird summiert (mit Index
  und ggf. Monats-Zwischensumme).
- **`Stimme.geprueft_am` null = nicht anbietbar.** Der Abgleich mit den
  Anbietern legt neue Stimmen an, sichtbar werden sie erst nach Prüfung.
- **`Dokument.text` wird nie ausgeliefert.** Er dient Faktenprüfung und
  Belegen. Nach 90 Tagen wird er gelöscht; `Fakt.zitat` bleibt (kurz) als Beleg.
- **`Sendung.stand`** verhindert stilles Überschreiben aus zwei offenen Tabs
  (Lehre Voice OS 16.09.2026): Speichern mit veraltetem Stand → `409`, die
  Oberfläche fragt.
