# 12 — API

Basis: `https://radio.klarframe.com/api/v1`. Anmeldung: Kopf
`Authorization: Bearer rk_live_…` (API-Schlüssel mit Rechten, 03) **oder**
Portal-Sitzung (Cookie). JSON, UTF-8, Zeiten ISO 8601 UTC. Fehler:
`{ "error": "Text für Menschen", "code": "maschinen_code" }`.
Ratenbegrenzung je Schlüssel (Standard 120/min), Kopf `Retry-After`.
Versionsregel: bestehende Felder ändern nie Typ oder Bedeutung (Regel 9).
Eine OpenAPI-Beschreibung wird aus den Zod-Schemas erzeugt (`/api/v1/openapi.json`).

## 1. Konten (nur Portal)

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/auth/registrieren` | 04 §1 |
| POST | `/api/auth/anmelden` | E-Mail + Passwort (+ `code` bei 2FA) |
| POST | `/api/auth/anmeldelink` | Magic-Link anfordern |
| POST | `/api/auth/abmelden` | `{ ueberall?: boolean }` |
| POST | `/api/auth/passwort-vergessen` · `/passwort-neu` | |
| POST | `/api/auth/email-bestaetigen` | `{ token }` |
| GET/PATCH | `/api/konto` | Profil lesen/ändern |
| POST | `/api/konto/email` · `/passwort` · `/2fa` · `/2fa/aus` | |
| GET | `/api/konto/sitzungen` · DELETE `/api/konto/sitzungen/{id}` | |
| POST | `/api/konto/export` | Datenauszug anstoßen (Mail mit Link) |
| POST | `/api/konto/loeschen` | `{ passwort, mandant_mitloeschen?: boolean }` |
| POST | `/api/konto/loeschen/widerrufen` | `{ token }` |

## 2. Mandant und Team

| Methode | Pfad | Rolle |
|---|---|---|
| GET/PATCH | `/api/v1/mandant` | admin+ |
| GET | `/api/v1/mandant/protokoll` | admin+ |
| GET | `/api/v1/team` | alle |
| POST | `/api/v1/team/einladen` `{ email, rolle }` | admin+ |
| PATCH/DELETE | `/api/v1/team/{nutzer_id}` | admin+ |
| POST | `/api/v1/mandant/inhaber-uebertragen` `{ nutzer_id }` | inhaber |
| POST | `/api/v1/mandant/loeschen` | inhaber |
| GET/POST/DELETE | `/api/v1/api-schluessel` | admin+ (Schlüssel wird **einmal** im Klartext gezeigt) |

## 3. Katalog

| GET | Pfad | Antwort |
|---|---|---|
| | `/api/v1/formate` | Liste aus `lib/formate.ts` |
| | `/api/v1/sprachen` | Sprachen + Varianten + Anredeformen |
| | `/api/v1/tonalitaet` | Regler, Stufen, Vorlagen |
| | `/api/v1/themen` | Themengebiete |
| | `/api/v1/stimmen?sprache=de-DE&lachen=1&geschlecht=…&anbieter=…` | nur freigegebene; je Stimme `hoerprobe_url` für die angefragte Sprache, `kann_lachen`, `klassen_faktor`, `muttersprachlich` |
| POST | `/api/v1/stimmen/{id}/probe` `{ text, sprache, regie? }` | kurze Hörprobe (Tageslimit) |
| | `/api/v1/preise` | Abos, Einzelstufen, Nachkauf (aus Katalog) |

## 4. Recherche

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/v1/themenvorschlaege` `{ land, orte[], gebiete[], stichworte[], aktualitaet_h, sprache }` | liefert `{ vorschlaege: [{ id, titel, satz, quellen_anzahl, alter_h, orte[], sensibel }] }` |
| GET/POST/PATCH/DELETE | `/api/v1/quellen` | eigene Quellen |
| POST | `/api/v1/quellen/{id}/test` | abrufen + extrahierten Text zeigen |

## 5. Beiträge

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/v1/beitraege/kostenvoranschlag` | `{ format, laenge_min, sprachen[], stimmen[] }` → `{ stufe, preis_eur?, reservierte_sekunden, guthaben_danach, begruendung[] }` |
| POST | `/api/v1/beitraege` | Einzelauftrag erzeugen (Felder wie Sendung + `thema` oder `vorschlag_id`, `freigabe_noetig`) → `202 { id, status }` |
| GET | `/api/v1/beitraege?sendung_id&status&von&bis&cursor` | Liste (seitenweise, `next_cursor`) |
| GET | `/api/v1/beitraege/{id}` | Beitrag inkl. Status, Fortschritt, Länge, Kapitel, Shownotes |
| GET | `/api/v1/beitraege/{id}/ereignisse` | Server-Sent Events (Fortschritt) |
| GET | `/api/v1/beitraege/{id}/drehbuch` | Zeilen mit Belegen und Befunden |
| PATCH | `/api/v1/beitraege/{id}/drehbuch` | Zeilen ändern (nur Status `freigabe` oder `fertig`) |
| POST | `/api/v1/beitraege/{id}/freigeben` | Vertonung starten |
| POST | `/api/v1/beitraege/{id}/zeilen/{nr}/neu` `{ text?, regie? }` | eine Zeile neu sprechen → neue Version |
| POST | `/api/v1/beitraege/{id}/block/{block_id}/neu-schreiben` `{ anweisung? }` | |
| GET | `/api/v1/beitraege/{id}/audio?format=mp3|wav&version=` | `302` auf signierte URL (nur bestellt) |
| GET | `/api/v1/beitraege/{id}/paket` | ZIP (nur bestellt) |
| POST | `/api/v1/beitraege/{id}/ausliefern` `{ ziel_ids[] }` | |
| DELETE | `/api/v1/beitraege/{id}` | |

Status-Werte: `wartet` | `recherche` | `redaktion` | `freigabe` | `vertonung` |
`schnitt` | `fertig` | `fertig_mit_hinweisen` | `fehlgeschlagen` | `gesperrt`.
Neue Werte sind möglich — Clients müssen unbekannte Werte tolerieren.

## 6. Sendungen

| Methode | Pfad | Zweck |
|---|---|---|
| GET/POST | `/api/v1/sendungen` | |
| GET/PATCH/DELETE | `/api/v1/sendungen/{id}` | PATCH mit `stand` → `409 { code: "stand_veraltet" }` bei Konflikt |
| POST | `/api/v1/sendungen/{id}/jetzt` | sofort einen Beitrag erzeugen |
| GET | `/api/v1/sendungen/{id}/zeitplan-vorschau` | nächste 10 Läufe |
| GET | `/api/v1/sendungen/{id}/feed.xml?token=` | Podcast-Feed (öffentlich oder mit Token) |

## 7. Auslieferung, Streams

| Methode | Pfad |
|---|---|
| GET/POST/PATCH/DELETE | `/api/v1/ziele` (Geheimnisse werden nie zurückgegeben, nur `gesetzt: true`) |
| POST | `/api/v1/ziele/{id}/test` |
| GET | `/api/v1/zustellungen?beitrag_id&status` |
| GET/POST/PATCH/DELETE | `/api/v1/streams`, `/api/v1/streams/{id}/durchsagen` |

## 8. Abrechnung

| Methode | Pfad |
|---|---|
| GET | `/api/v1/guthaben` → `{ sekunden, gueltig: [{ sekunden, bis }], warnen }` |
| GET | `/api/v1/buchungen?cursor` |
| POST | `/api/v1/abrechnung/checkout` `{ tarif_id | nachkauf_id | beitrag_id }` → Stripe-URL |
| POST | `/api/v1/abrechnung/kundenportal` → Stripe-URL |
| POST | `/api/webhooks/stripe` (Stripe, signiert) |

## 9. Webhooks an Kunden

Ereignisse: `beitrag.fertig`, `beitrag.fehlgeschlagen`, `zustellung.fehlgeschlagen`,
`guthaben.niedrig`, `sendung.pausiert`. Körper:
```json
{ "ereignis": "beitrag.fertig", "zeit": "2026-09-24T05:02:11Z",
  "beitrag": { "id": "…", "sendung_id": "…", "titel": "…", "sprache": "de-DE", "laenge_s": 193.2,
               "audio_mp3": "https://…signiert…", "gueltig_bis": "…", "shownotes": "…" } }
```
Signatur 09 §4.

## 10. Betrieb

| GET | `/api/health` | öffentlich: `{ ok, version }`; mit Admin-Schlüssel: Warteschlangen, Anbieter-Erreichbarkeit, letzte Produktion, Speicher |
|---|---|---|
| GET | `/api/version` | Version + Stand |
