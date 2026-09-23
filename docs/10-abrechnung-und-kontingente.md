# 10 — Abrechnung und Kontingente

## 1. Grundsätze

- Einheit: **Sekunden fertigen Audios** (angezeigt als Minuten:Sekunden).
- Guthaben = **Summe des Kontobuchs** `Buchung` (keine zweite Zählung).
- **Minuten vorher wählen:** Vor jedem Start zeigt die Oberfläche die
  Ziellänge, den Stimmklassen-Faktor und die **reservierten** Sekunden
  (= Ziellänge × 1,15 × Faktor). Reicht das Guthaben nicht → Start nicht
  möglich, Knopf „Minuten nachkaufen".
- **Sperre statt Nachberechnung** (Regel 4): Zeitplan-Läufe ohne Guthaben
  starten nicht; Mail an Inhaber/Redaktion; im Portal rotes Band.
- Der bestellte Preis ist Obergrenze (Regel 5).

## 2. Buchungsarten

| Art | Vorzeichen | Wann |
|---|---|---|
| `monat_gutschrift` | + | Beginn jedes Abrechnungsmonats (Stripe `invoice.paid`), `gueltig_bis` Monatsende |
| `nachkauf` | + | Einmalkauf bezahlt, gültig bis Ende des Folgemonats |
| `probe` | + | Registrierung (Standard 600 s) |
| `reservierung` | − | Start eines Beitrags |
| `freigabe` | + | Ende eines Beitrags: Reservierung zurück |
| `verbrauch` | − | Ende eines Beitrags: tatsächliche Sekunden × Faktor (höchstens Ziel + 15 %) |
| `korrektur` | ± | nur Klarframe-Admin, mit Pflicht-Notiz |
| `verfall` | − | Ablauf von Gutschriften (nächtlicher Lauf) |
| `einzelkauf` | + | Einzelbeitrag nach Länge bezahlt (17 §2): Gutschrift in Höhe der Stufe, gebunden an genau diesen Beitrag (`beitrag_id`) |

Verbrauch wird **zuerst** aus der Gutschrift mit dem frühesten Ablauf genommen.
Fehlgeschlagene Beiträge: nur `freigabe`, kein `verbrauch`.

Prüfskript `scripts/kontobuch-pruefen.ts`: Für jeden Mandanten muss gelten:
Summe der Buchungen = angezeigtes Guthaben; jede Reservierung hat eine
Freigabe oder einen laufenden Beitrag; kein Beitrag `fertig` ohne Verbrauch.

## 3. Stripe

- **Produkte/Preise** je Tarif und Nachkaufpaket (IDs im `Tarif`).
- **Checkout** für Bestellung und Nachkauf; **Kundenportal** von Stripe für
  Zahlungsmittel, Rechnungen, Kündigung.
- **Steuer:** Stripe Tax; USt-ID-Prüfung (VIES) für B2B-Reverse-Charge in der EU;
  Rechnungen mit Klarframe-Angaben.
- **Webhooks** (signiert): `checkout.session.completed` → `bestellt_am`,
  `bestellter_preis_eur`; `invoice.paid` → Monatsgutschrift;
  `invoice.payment_failed` → Hinweis, nach 7 Tagen `gesperrt_grund = zahlung_offen`
  (Zeitpläne pausiert, Anhören/Herunterladen bestehender Beiträge bleibt);
  `customer.subscription.deleted` → Ende zum Periodenende.
- Webhooks sind idempotent (Ereignis-ID gespeichert).
- Sonderpreise (`sonderpreis_eur` + Pflicht-Notiz) nur durch Klarframe; 0 € ist
  ein gültiger Sonderpreis (auf `null` prüfen, nicht auf Wahrheit — Lehre Voice OS).

## 4. Anzeigen im Portal

- Kopfzeile: Guthaben „128:40 min übrig" mit Farbe (grün > 20 %, gelb, rot).
- `/abrechnung`: Tarif, nächste Verlängerung, Kontobuch (filterbar), Nachkauf,
  Rechnungen (über Stripe), Verbrauch je Sendung (Diagramm).
- Warnung per Mail bei 80 % und 100 % Verbrauch (einmal je Monat).

## 5. Kosten (nur Admin)

Je Beitrag `kosten` in Euro je Stufe; Admin-Übersicht „Kosten je fertiger
Minute" je Format/Sprache/Anbieter/Mandant und Marge je Mandant. Kunden sehen
das nie.
