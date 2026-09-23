# Klarframe Radio OS — Bauplan

**radio.klarframe.com** · Stand 23.09.2026 · Auftraggeber: Oliver Condurache (Klarframe)

Radio OS ist eine mandantenfähige SaaS-Plattform, die **fertige Radio- und
Podcast-Beiträge herstellt**: Sie recherchiert Themen im Netz, schreibt daraus
eigene Geschichten, lässt sie von einer oder zwei KI-Stimmen **muttersprachlich**
sprechen — mit Humor, Lachen, Empathie oder ganz seriös —, schneidet sie
sendefertig und liefert sie aus: zum **Herunterladen**, als **Stream**, als
**Podcast-Feed** oder über **individuelle Konnektoren** direkt in die
Sendesoftware eines Radiosenders.

Kunden sind **Radiosender** (liefern wir Wortbeiträge ins Programm) und
**Firmen** (Ladenfunk, Hotelradio, Firmen-Podcast, interne Nachrichten).

> **An die KI, die das baut:** Lies zuerst `docs/00-auftrag-und-grundsaetze.md`.
> Dort stehen die Regeln, die in diesem Unternehmen aus echten Fehlern
> entstanden sind. Sie sind nicht verhandelbar. Danach baust du in der
> Reihenfolge von `docs/15-phasenplan-und-abnahme.md` — jede Phase hat
> Abnahmekriterien, die **echt** geprüft werden, nicht nur „kompiliert".

## Inhalt

| Datei | Worum es geht |
|---|---|
| [00 Auftrag und Grundsätze](docs/00-auftrag-und-grundsaetze.md) | Ziel, Zielgruppen, feste Regeln, gelernte Lektionen |
| [01 Produkt und Pakete](docs/01-produkt-und-pakete.md) | Was der Kunde kauft: Minuten, Themenblöcke, Formate, Konnektoren |
| [02 Architektur](docs/02-architektur.md) | Server, Dienste, Warteschlange, Speicher, Technikwahl |
| [03 Datenmodell](docs/03-datenmodell.md) | Vollständiges Prisma-Schema mit Begründungen |
| [04 Konten, Mandanten, Rechte](docs/04-konten-mandanten-rechte.md) | Registrierung, Anmeldung, Profil, Team, Löschen |
| [05 Recherche und Quellen](docs/05-recherche-und-quellen.md) | Scraper, Suche, Feeds, Land/Ort/Thema, Faktenablage |
| [06 Redaktion und Drehbuch](docs/06-redaktion-und-drehbuch.md) | Themenfindung, Tonalität (Humor, Lachen, Seriös …), Faktenprüfung |
| [07 Stimmen und Sprachen](docs/07-stimmen-und-sprachen.md) | Alle Anbieter, alle Stimmen (auch GPT-Live „Gleam"), Muttersprache |
| [08 Produktion und Schnitt](docs/08-produktion-und-schnitt.md) | Vertonung, Nachhören, Schnitt, Lautheit, Jingles |
| [09 Auslieferung](docs/09-auslieferung-download-stream-konnektoren.md) | Download, Stream, Podcast-Feed, Playout-Konnektoren, Webhooks |
| [10 Abrechnung und Kontingente](docs/10-abrechnung-und-kontingente.md) | Minuten vorher wählen, Guthaben, Stripe, Sperre statt Nachberechnung |
| [11 Oberfläche](docs/11-oberflaeche-seiten.md) | Jede Seite, jeder Knopf, Texte in DE/EN/ES |
| [12 API](docs/12-api.md) | Alle Endpunkte mit Anfrage/Antwort |
| [13 Admin und Betrieb](docs/13-admin-und-betrieb.md) | Klarframe-Admin, Überwachung, Alarm, Sicherung, Ausrollen |
| [14 Sicherheit, Recht, DSGVO](docs/14-sicherheit-recht-dsgvo.md) | Urheberrecht, KI-Kennzeichnung, Stimmrechte, Datenschutz |
| [15 Phasenplan und Abnahme](docs/15-phasenplan-und-abnahme.md) | Reihenfolge, Prüfskripte, Abnahme je Phase |
| [16 Offene Entscheidungen](docs/16-offene-entscheidungen.md) | Was Oliver noch festlegen muss |
| [17 Preise](docs/17-preise.md) | Einzelbeiträge 5/10/…/60+ min, Abos, Nachkauf, Zusätze, Kostenbasis |
| [18 Ein, zwei, drei Sprecher](docs/18-sprecher-1-2-3.md) | Formate, Rollen, Regeln und Schnitt je Sprecherzahl |
| [referenz/demo-mallorca](referenz/demo-mallorca/) | Die funktionierende Demo vom 23.09.2026 (Drehbuch, Produktionsskript, Prüfprotokoll) |

## Die Demo, die es schon gibt

Am 23.09.2026 entstand „Inselfunk — Mieten auf Mallorca": zwei KI-Stimmen,
3:13 Minuten, echte Fakten mit Quellen, Humor und Ernst, Lachen. Oliver:
„Wirklich klasse … Wow, ich bin beeindruckt." Das Produktionsskript in
`referenz/demo-mallorca/produzieren.mjs` ist der **Kern der Plattform im
Kleinen**: Drehbuch → Stimme je Zeile mit Regie → Nachhören und Wortprüfung
→ Neu sprechen bei Abweichung → Schnitt mit Lücken → Lautheitsnorm → MP3.
Die Plattform macht daraus einen Dienst für viele Kunden.

## Fremdsystem-Zugänge

Kein einziger Schlüssel gehört in dieses Repository. Alle Zugänge liegen auf dem
Server in `/etc/klarframe-radio/radio.env` (Rechte 640, Gruppe des Dienstes).
Siehe `docs/13-admin-und-betrieb.md`.
