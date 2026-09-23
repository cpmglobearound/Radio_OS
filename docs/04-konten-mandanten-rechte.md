# 04 — Konten, Mandanten, Rechte

## 1. Registrierung

Seite `/registrieren` (DE/EN/ES, Sprache aus Browser, umschaltbar).

Felder:
| Feld | Pflicht | Prüfung |
|---|---|---|
| Name | ja | 2–80 Zeichen |
| E-Mail | ja | Format; klein geschrieben; noch nicht vergeben (Antwort bei Vergabe **gleich** wie bei Erfolg, siehe §7) |
| Passwort | ja | mind. 12 Zeichen, gegen Liste häufiger Passwörter geprüft, Stärkeanzeige |
| Firma / Sender | ja | wird Mandantenname |
| Art | ja | Firma · Radiosender · Agentur |
| Land | ja | Liste aller Länder (ISO), Vorauswahl aus Browsersprache; bestimmt Standard-Zeitzone, Standard-Ausgabesprache, Steuerlogik |
| AGB + Datenschutz | ja | Häkchen, Version und Zeitpunkt werden gespeichert |
| Werbe-E-Mails | nein | eigenes Häkchen, standardmäßig aus |

Ablauf:
1. Konto und Mandant werden angelegt (`Mitgliedschaft.rolle = inhaber`),
   `bestellt_am = null` (Probe), Buchung `probe` über 600 s (10 min, Wert aus Einstellung).
2. Bestätigungs-E-Mail mit Einmal-Link (24 h gültig). Bis zur Bestätigung:
   Anmelden geht, Erzeugen **nicht** (Hinweisband „Bitte bestätigen Sie Ihre E-Mail").
3. Nach Bestätigung: Einstiegsassistent (§4).
4. Klarframe bekommt eine Benachrichtigung „Neue Registrierung" (Name, Firma, Land, Art).

Schutz: Ratenbegrenzung je IP (5 Registrierungen/Stunde), unsichtbare
Bot-Prüfung (Cloudflare Turnstile oder hCaptcha, austauschbar), Wegwerf-E-Mail-
Domains werden abgewiesen (Liste aus Datei, regelmäßig aktualisiert).

## 2. Anmeldung

- `/anmelden`: E-Mail + Passwort. Alternativ **Anmelde-Link per E-Mail** (15 min).
- Optional **Zwei-Faktor** (TOTP-App) je Nutzer; für Rolle `inhaber` beim
  Tarif „Sender" und „Individuell" empfohlen (Hinweis), vom Mandanten
  erzwingbar (Einstellung „Zwei-Faktor für alle Mitglieder").
- Sitzung: Cookie `radio_session`, `HttpOnly`, `Secure`, `SameSite=Lax`,
  signiert, enthält `nutzer_id`, `sitzung_version`, Ablauf (30 Tage gleitend).
  Jede Anfrage prüft `sitzung_version` gegen die Datenbank → „Überall abmelden"
  und Passwortänderung beenden sofort alle Sitzungen.
- Fehlversuche: nach 5 Fehlversuchen 15 min Sperre für dieses Konto **und**
  Ratenbegrenzung je IP. Meldung immer gleich („E-Mail oder Passwort falsch"),
  nie verraten, ob die E-Mail existiert.
- Passwort vergessen: `/passwort-vergessen` → Einmal-Link (60 min) → neues
  Passwort → alle Sitzungen beendet → Mail „Ihr Passwort wurde geändert".
- Gehört ein Nutzer mehreren Mandanten an (Agentur, Freiberufler): Auswahl
  nach der Anmeldung, Umschalter oben in der Kopfzeile.

## 3. Profil bearbeiten (`/konto`)

| Bereich | Was | Besonderheit |
|---|---|---|
| Persönlich | Name, Sprache der Oberfläche | sofort wirksam |
| E-Mail ändern | neue Adresse | Bestätigungslink an die **neue** Adresse, Hinweis an die **alte**; erst nach Klick gültig |
| Passwort ändern | altes + neues | beendet alle anderen Sitzungen |
| Zwei-Faktor | einrichten (QR), Wiederherstellungscodes (10 Stück, einmal sichtbar), abschalten (mit Code) | |
| Sitzungen | Liste aktiver Geräte (Browser, Ort grob, zuletzt aktiv) | „Überall abmelden" |
| Benachrichtigungen | E-Mail bei: Beitrag fertig, Beitrag fehlgeschlagen, Guthaben < 20 %, Zustellung fehlgeschlagen, Rechnung | je Punkt ein/aus |
| Daten herunterladen | ZIP mit allen personenbezogenen Daten (JSON) + Links zu allen Beiträgen | DSGVO Art. 15/20, asynchron, Link per Mail |
| Konto löschen | siehe §6 | |

## 4. Mandant bearbeiten (`/einstellungen`) — nur `inhaber`/`admin`

- Firmendaten, Rechnungsadresse, USt-ID (EU-Prüfung über VIES), Land, Zeitzone.
- **Standard-Einstellungen für neue Sendungen:** Sprache/Variante, Stimmen,
  Tonalität, Region (Land, Orte), Themengebiete, Ausschlüsse (z. B. „keine
  Unfälle mit Todesopfern", „keine Politik"), eigene Quellen.
- **Markenbausteine:** Sendername, Kennung (gesprochener Satz), Sprecher-Namen
  im Programm („Lena", „Jan"), Aussprachelexikon (Firmenname, Ortsnamen).
- **Team** (§5), **API-Schlüssel**, **Auslieferungsziele**, **Abrechnung**.

Einstiegsassistent nach der ersten Anmeldung (4 Schritte, jederzeit
überspringbar): Wofür nutzen Sie Radio OS? → Land/Orte/Sprache → Stimmen anhören
und zwei Favoriten wählen → erste Hörprobe (1 min) wird erzeugt und abgespielt.

## 5. Team und Rechte

| Rolle | Darf |
|---|---|
| `inhaber` | alles, inkl. Abrechnung, Konto des Mandanten löschen, Inhaber übertragen (genau ein Inhaber) |
| `admin` | alles außer Mandant löschen und Inhaber ändern |
| `redaktion` | Sendungen anlegen/ändern, Beiträge erzeugen/freigeben/nachbessern, herunterladen, ausliefern; **keine** Abrechnung, keine Auslieferungsziele/API-Schlüssel anlegen |
| `hoeren` | Beiträge anhören und herunterladen (wenn bestellt), nichts ändern |
| Klarframe-Admin | Mandanten-übergreifend (siehe 13), jede Aktion protokolliert |

Einladen: E-Mail + Rolle → Einladungslink (7 Tage). Gibt es das Konto schon,
wird es nur verknüpft. Tarifgrenze `max_nutzer` wird beim Einladen geprüft.

**Mandantentrennung technisch erzwingen** (nicht nur in jeder Route daran denken):
- Jede Datenbankabfrage auf Mandantendaten läuft über eine Hilfsschicht
  `mitMandant(sitzung)`, die `mandant_id` erzwingt. Direkte Prisma-Aufrufe auf
  diese Tabellen außerhalb der Schicht bricht ein Prüfskript im Bau ab
  (`scripts/mandantenfilter-pruefen.ts` sucht nach `prisma.<tabelle>.find…`
  ohne die Schicht).
- Zusätzlich **PostgreSQL Row-Level-Security** auf allen Mandantentabellen,
  gesetzt über `SET app.mandant_id` je Anfrage (zweite Wand).
- Speicherschlüssel beginnen mit `m/<mandant_id>/…`; signierte Download-URLs
  prüfen den Mandanten.
- Prüfskript `scripts/mandanten-trennung-pruefen.ts`: legt zwei Mandanten an
  und versucht mit Mandant A **jede** ID von Mandant B über **jede** API-Route
  zu lesen/ändern/löschen. Erwartung: überall `404`.

## 6. Löschen

### Nutzer verlässt einen Mandanten
Mitgliedschaft entfernen; Inhaber kann nicht gehen, ohne vorher zu übertragen.

### Nutzerkonto löschen (`/konto` → „Konto löschen")
1. Passwort (oder 2FA) bestätigen, Grund optional.
2. Ist der Nutzer **einziger Inhaber** eines Mandanten mit weiteren Mitgliedern:
   erst Inhaber übertragen oder Mandant mitlöschen (Auswahl).
3. Sofort: Anmeldung gesperrt, alle Sitzungen beendet, `geloescht_am` gesetzt,
   Bestätigungsmail.
4. Nach **14 Tagen** (Widerruf per Link in der Mail möglich): endgültige
   Löschung — personenbezogene Felder überschrieben bzw. Zeile entfernt,
   Protokolleinträge anonymisiert (`nutzer_id` → null, Aktion bleibt).

### Mandant löschen (nur Inhaber)
1. Abo wird zum Periodenende gekündigt (oder sofort, Auswahl; keine Erstattung
   angebrochener Monate, Hinweis vorher).
2. Sofort: alle Zeitpläne aus, Streams aus, Konnektoren aus, API-Schlüssel
   widerrufen, Mitglieder informiert.
3. Nach 14 Tagen: alle Beiträge, Audiodateien (Objektspeicher **und** Zwischen-
   stände), Quellen, Ziele, Stimm-Favoriten, Aussprachen gelöscht. Rechnungen
   und Buchungen bleiben (gesetzliche Aufbewahrung, 10 Jahre), ohne
   personenbezogene Zusatzdaten.
4. **Prüfskript `scripts/loeschreste-pruefen.ts`** (Muster Voice OS, dort 10
   Schichten): nach der Endlöschung darf in keiner Tabelle, keinem Speicherpfad,
   keinem Stream-Mount, keinem Zeitplan und keiner Warteschlange etwas vom
   Mandanten übrig sein.

## 7. Sicherheitsdetails zu Konten

- Keine Aufzählung von Konten: Registrierung mit vorhandener E-Mail zeigt
  dieselbe Erfolgsseite und schickt an die Adresse eine Mail „Sie haben
  bereits ein Konto — hier anmelden / Passwort vergessen".
- Alle Einmal-Tokens nur als Hash gespeichert, einmal benutzbar.
- CSRF: `SameSite=Lax` + Prüfung des `Origin`-Kopfs bei allen ändernden Anfragen.
- Passwörter bcrypt (Kosten 12) wie Voice OS.
- Alle sicherheitsrelevanten Aktionen landen im `Protokoll` und sind für den
  Inhaber unter `/einstellungen/protokoll` sichtbar.
