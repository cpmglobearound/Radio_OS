# 13 — Klarframe-Admin und Betrieb

## 1. Admin-Bereich (`/admin`, nur `ist_klarframe_admin`, 2FA Pflicht)

| Seite | Inhalt |
|---|---|
| Übersicht | Mandanten (neu, Probe, bestellt), Produktionen heute, Fehlerquote, Warteschlangen, Kosten heute / Monat, Marge |
| Mandanten | Liste, Suche; Detail: Tarif, Sonderpreis (+ Pflicht-Notiz), Kontobuch, Korrekturbuchung (+ Pflicht-Notiz), Sendungen, Beiträge, Zustellungen, sperren/entsperren, „Als Mandant ansehen" (nur lesen, protokolliert) |
| Produktionen | alle laufenden/fehlgeschlagenen mit Stufe, Fehler technisch, „Stufe wiederholen" |
| Stimmen | **Freigabe-Warteschlange** neuer Stimmen je Anbieter (§3), Katalogpflege, Hörproben neu erzeugen |
| Quellen (global) | geprüfte Quellen je Land/Region, Prüfnotiz, Sperrliste, Sperrwünsche von `/bot` |
| Katalog | Tarife, Einzelpreise, Nachkaufpakete, Stimmklassen-Faktoren |
| Kosten | Kosten je fertiger Minute nach Format/Sprache/Anbieter/Mandant |
| Konnektoren | angepasste Konnektoren je Kunde, Zustand |
| Protokoll | alle Admin-Aktionen |

## 2. Überwachung und Alarm (Muster Voice OS)

- `/api/health` + Wächter-Timer alle 5 min prüft: Portal antwortet, Datenbank,
  Warteschlange läuft (ältester wartender Auftrag < 10 min), Arbeiter leben,
  jeder Anbieter erreichbar (leichter Aufruf), Speicherplatz > 15 %,
  Icecast läuft, **letzte erfolgreiche Produktion < 2 h** (wenn Zeitpläne aktiv).
- Alarm per Mail an Klarframe, gleiche Ursache höchstens alle 6 h.
- **Pünktlichkeits-Alarm:** Zeitplan-Beitrag nicht rechtzeitig am Ziel → sofort.
- Täglicher Bericht: Produktionen, Fehler, Kosten, auffällige Mandanten.

## 3. Stimmen freigeben (Regel 7)

1. Täglicher Abgleich legt neue Stimmen an (`geprueft_am = null`, unsichtbar).
2. Admin hört sie in der Warteschlange an: Hörprobe + drei Prüfsätze **je
   Sprache**. Setzt je Sprache „muttersprachlich ja/nein", Stil, Geschlecht,
   Alter, „kann lachen".
3. Abgelehnt, wenn: klingt nach realer bekannter Person, Name/Beschreibung
   deutet auf Klon einer Person, schlechte Qualität, falscher Akzent.
4. Erst dann `sichtbar = true`. Alles protokolliert.

## 4. Ausrollen

- Skript `scripts/bauen.sh` (Muster `portal-bauen.sh`): Typprüfung **vor**
  dem Anhalten, Prisma-Migration, Bau in neuen Ordner, alter Bau als
  Rückfall, Neustart, Prüfung `/`, `/anmelden`, `/api/health`. Bei Fehler:
  automatisch zurück auf den alten Bau.
- Arbeiter werden **sanft** neu gestartet: Sie beenden den laufenden Schritt,
  nehmen keinen neuen, beenden sich; systemd startet sie mit neuem Code.
- **Nach jedem Ausrollen:** `scripts/rauchprobe.ts` erzeugt einen 30-Sekunden-
  Beitrag im internen Prüf-Mandanten mit zwei Stimmen, hört ihn nach und
  prüft Lautheit/Länge. Rot → Alarm.
- Versionsstand + CHANGELOG automatisch (Muster `klarframe-push`); eigenes
  Hochladeskript `radio-push` mit Geheimnis-Suche, **nur** für dieses Repository.

## 5. Geheimnisse

`/etc/klarframe-radio/radio.env`, Rechte **640**, Besitzer root, Gruppe des
Dienstnutzers `radio` (Lehre Voice OS: `600` legte alle Dienste lahm, weil der
Dienstnutzer die Datei nicht mehr lesen konnte — die Gesundheitsprüfung
prüft deshalb die Lesbarkeit). Inhalt (nur Namen): `DATABASE_URL`,
`SITZUNG_GEHEIMNIS`, `DATEN_SCHLUESSEL` (Verschlüsselung von Zugangsdaten der
Kunden), `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `CARTESIA_API_KEY`,
`FISH_AUDIO_API_KEY`, `BRAVE_SEARCH_API_KEY`, `S3_*`, `SMTP_*`, `STRIPE_*`,
`TURNSTILE_*`, `ICECAST_*`.
**Eigene Schlüssel** für Radio OS bei jedem Anbieter (nicht die des Voice OS
teilen — getrennte Kosten, getrennte Sperren, Regel 12).

## 6. Sicherung

- PostgreSQL: täglich vollständig + WAL-Archiv (Wiederherstellung auf die
  Minute), verschlüsselt, außerhalb des Servers, 30 Tage.
- Objektspeicher: Versionierung an, Lebenszyklus (Zwischenstände 30 Tage).
- Wöchentliche **Wiederherstellungsprobe** auf einen Testserver (automatisch,
  Ergebnis per Mail). Eine Sicherung, die nie zurückgespielt wurde, gilt als
  nicht vorhanden (Lehre CALL4ME: Sicherung fiel 108-mal still aus).

## 7. Aufbewahrung (Zeitgeber, nächtlich)

| Daten | Frist |
|---|---|
| Dokumente (Quelltexte) | 90 Tage |
| Zwischenstände (Zeilen-Audio, alte Versionen) | 30 Tage |
| Fertige Beiträge | solange der Mandant besteht (Kunde kann löschen); Probe-Beiträge nach 30 Tagen |
| Protokoll | 1 Jahr, danach anonymisiert |
| Gelöschte Konten/Mandanten | endgültig nach 14 Tagen (04 §6) |
