# 09 — Auslieferung: Download, Feed, Stream, Konnektoren

**Grundregel:** Vor der Bestellung (`Mandant.bestellt_am = null`) ist **nur**
Anhören im Portal möglich. Download, Feed, Stream, Webhook und Konnektoren
öffnen sich erst nach der Bestellung. Die API antwortet vorher mit `403`
und `code: "nicht_bestellt"`.

Jede Auslieferung schreibt eine `Zustellung` mit **Nachweis** (Regel 2):
Dateigröße und Prüfsumme am Ziel, HTTP-Status, Antwort des Empfängers.

## 1. Download

- Knopf „Herunterladen" je Beitrag: MP3, WAV, zusätzlich „Paket" (ZIP mit
  Audio, Drehbuch als Text/PDF, Shownotes mit Quellen, Kapitelmarken).
- Mehrfach-Download: Auswahl in der Beitragsliste → ZIP.
- Links sind **signiert und kurzlebig** (15 min), gebunden an den Mandanten.
- Dateinamen nach Muster je Mandant: `{sendung}_{datum}_{uhrzeit}_{sprache}.mp3`.

## 2. Podcast-Feed (RSS)

- Je Sendung ein Feed (RSS 2.0 + iTunes/Podcasting-2.0-Tags): Titel, Bild,
  Beschreibung, Sprache, Kategorie, Kapitel, Transkript (Drehbuch), Hinweis
  „KI-generierte Stimmen" (Podcasting 2.0 erlaubt Kennzeichnung).
- Öffentlich oder privat (Feed-URL mit geheimem Token, jederzeit neu erzeugbar).
- Einreichung bei Spotify/Apple erfolgt durch den Kunden (Anleitung im Portal).

## 3. Stream (Firmen: Ladenfunk, Hotelradio)

- **Icecast** Mount je `StreamProgramm`, gespeist von **Liquidsoap**.
- Programmplan: Rotation aus Sendungen (neueste Beiträge), Durchsagen mit
  festen Uhrzeiten oder Häufigkeit („alle 20 min"), Kennungen, Klangbetten,
  Ruhezeiten (z. B. nachts aus).
- Wiedergabe: MP3 128 kbit/s und AAC 64 kbit/s, Player-Seite
  `radio.klarframe.com/hoeren/<mount>` (einbettbar), Token-Schutz optional.
- Durchsagen-Pflege (Firmen): Liste mit Text → Vertonung → Rotation;
  Gültigkeit von/bis („Angebot gilt bis Sonntag").
- Hörerzahlen je Stream (Icecast-Statistik) im Portal.

## 4. Webhook

- POST an eine Kunden-URL bei `beitrag.fertig`, `beitrag.fehlgeschlagen`,
  `zustellung.fehlgeschlagen`, `guthaben.niedrig`.
- Inhalt: Beitrags-Metadaten + signierte Download-URLs (24 h).
- Signatur-Kopf `X-Radio-Signatur: t=<zeit>,v1=<HMAC-SHA256>` mit Geheimnis
  je Ziel; Wiederholungen mit wachsendem Abstand (5×), dann Alarm-Mail.

## 5. SFTP / S3 (Standard-Konnektoren, selbst einstellbar)

- **SFTP:** Host, Port, Nutzer, Schlüssel **oder** Passwort (verschlüsselt
  gespeichert), Zielordner, Dateinamenmuster, **Übergabe atomar**: erst als
  `.part` hochladen, dann umbenennen (Playouts greifen sonst halbe Dateien).
  Optional Begleitdatei (XML/JSON) mit Metadaten.
- **S3-kompatibel:** Bucket, Region/Endpunkt, Schlüssel, Präfix.
- Knopf „Verbindung testen" lädt eine 1-Sekunden-Testdatei hoch, prüft sie
  und löscht sie wieder — erst dann ist das Ziel „bereit".

## 6. Playout-Konnektoren (Radiosender)

Radiosender spielen über Sendesoftware (Playout). Wir liefern so, dass der
Beitrag **zur richtigen Zeit am richtigen Platz** im Sendeplan liegt.

| System | Übergabe (Standard) | Metadaten |
|---|---|---|
| mAirList | Überwachter Ordner (SFTP) + `.mld`/XML oder Dateiname mit Sendezeit | Titel, Länge, Einblendpunkte |
| RCS Zetta / GSelector | Ordner-Import (Dateiname-Konvention) | Kategorie, Cart-Nummer |
| WideOrbit | Ordner-Import | Cart-Nummer |
| DAVID / DigaSystem | Ordner-Import + XML | nach Senderspezifikation |
| Radioboss / SAM / Myriad | Ordner + Dateiname oder API, wo vorhanden | je System |
| „Cart-Ersetzen" | Datei mit **fester** Cart-Nummer/-Name wird jede Stunde überschrieben (z. B. `NACHRICHTEN_AKTUELL.wav`) — funktioniert mit fast jedem Playout | — |

- Jeder Standard-Konnektor ist eine Datei in `lib/auslieferung/playout/`
  mit derselben Schnittstelle (`vorbereiten`, `uebertragen`, `pruefen`).
- **Angepasste Konnektoren** (Senderspezifika, Datenbank-Direktschreiben,
  eigene APIs, Sendeablauf-Integration) richtet Klarframe ein
  (`art = "individuell"`, Code je Kunde **in derselben Schnittstelle**, nie als
  Sonderzweig in der Kernlogik). Preis: Einrichtung + Monatsbetrag (siehe 16).
- Pünktlichkeit: Nachrichten sind spätestens X Minuten vor der Sendezeit am
  Ziel (Einstellung je Sendung, Standard 5 min). Verspätung → Alarm an die
  Redaktion des Senders **und** an Klarframe, plus „Ersatzbeitrag" (vorheriger
  Beitrag bleibt liegen, nichts Leeres wird gesendet).

## 7. API (siehe 12)

Alles, was die Oberfläche kann, geht auch über die API mit Schlüssel (`rk_live_…`):
Sendungen verwalten, Beitrag erzeugen, Status abfragen, Audio laden.

## 8. Später (nicht Phase 1–3)

- Einspielung in Smart Speaker (Alexa-Skill/Flash Briefing).
- Direkter DAB+/UKW-Weg über Partner.
- Hörer rufen live an (Anbindung an ein Sprachsystem wie Klarframe Voice OS
  — **als Konnektor über eine API**, nicht als geteilter Code; Regel 12).
