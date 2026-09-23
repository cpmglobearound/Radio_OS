# 08 — Produktion und Schnitt

Referenz: `referenz/demo-mallorca/produzieren.mjs` — genau diese Logik, als
Dienst mit Warteschlange, Speicher und Protokoll.

## 1. Zeile sprechen (`produktion.zeile`, parallel)

Für jede Zeile:
1. Text durch den **Sprach-Normalisierer** (Ziffern → Wörter, Abkürzungen,
   Aussprache-Ersetzungen nur für die Vertonung).
2. Anbieter-Aufruf `sprechen()` mit Regie, Persönlichkeit, Kontext (vorige Zeile).
3. **Stille abschneiden** vorn und hinten (ffmpeg `silenceremove`, −45 dB,
   Rest 50/80 ms). Die Pausen setzt der Schnitt.
4. **Nachhören:** Spracherkennung in der Zielsprache mit Hilfen:
   - Eigennamen-Liste (Sendung, Orte, Firmen, Aussprache-Lexikon),
   - „Zahlen als Wörter ausschreiben",
   - „Lachen, Seufzen, Atmen in Klammern notieren" → vor dem Vergleich entfernt.
5. **Prüfen:**
   - Wortgenauigkeit (Levenshtein auf Wortebene, nach Normalisierung) ≥ 0,90
     (≥ 0,95 für Format `nachrichten`; jede Zahl und jeder Eigenname muss exakt
     erkannt werden — sonst durchgefallen, egal wie hoch der Wert).
   - Dauer ≤ Wörter × 0,62 s + 2,2 s (Lachen darf nicht ausufern) und ≥ Wörter × 0,22 s (nichts verschluckt).
   - Erkannte Sprache = Zielsprache.
   - Kein Übersteuern (True Peak), keine Aussetzer (Stille > 1,2 s mitten in der Zeile).
6. Durchgefallen → neu sprechen (bis 4 Versuche, ab Versuch 2 strengere
   Anweisung). Nach 4 Versuchen: beste Fassung (höchste Wortgenauigkeit,
   Abzug für Überlänge) + Warnung an der Zeile. Bei Format `nachrichten`
   stattdessen Wechsel auf die Ersatzstimme der Rolle (falls eingestellt) oder
   Beitrag hält an → Redaktion entscheidet.
7. Speichern: Audio, Dauer, gehörter Text, Wortgenauigkeit, Versuche, Kosten.

Belege aus der Demo (29 Zeilen): 9 Zeilen fielen beim ersten Versuch durch,
alle bestanden nach höchstens 4 Versuchen bzw. nach schärferer Regie. Typische
Fehler: verschluckter Anfang („Achtzig"), falsches Wort in der Pointe
(„Näherblick"), Wort im Lachen verschluckt („behaltet").

## 2. Schnitt (`produktion.schnitt`)

1. **Zeitleiste:** Start = Ende der vorigen Zeile + `luecke_ms` (negativ =
   Überlappung). Überlappungen nur, wenn die Rollen verschieden sind.
2. **Klänge:** Eröffnungs-Kennung, Übergänge zwischen Blöcken, Abschluss —
   aus der Klangbibliothek des Mandanten oder die Standardklänge (selbst
   erzeugt, keine fremden Rechte; die Demo nutzt einen synthetischen Dreiklang).
   Optional **Klangbett** unter der Sprache (−22 dB unter Sprache, Ducking per
   `sidechaincompress`).
3. **Mischen** (ffmpeg `adelay` + `amix normalize=0`).
4. **Lautheit** nach Ziel des Ausgabeformats: Standard EBU R128 −23 LUFS für
   Sender (Rundfunknorm), −16 LUFS für Podcasts/Streams, True Peak −1,5 dBTP
   (Demo: −16,7 LUFS, −1,7 dBTP). Zweistufiges `loudnorm` (messen, dann setzen).
5. **Ausgaben:** Master WAV 48 kHz/24 bit, MP3 (192 kbit/s, 44,1 kHz),
   weitere je Ziel (AAC, Mono für Durchsagen, 16 bit WAV für Playouts).
6. **Metadaten:** ID3/BWF: Titel, Sendung, Sprache, „KI-generierte Stimmen",
   Erzeugungsdatum, Beitrags-ID; Kapitelmarken je Block (ID3 CHAP / Podcast).
7. **Probe-Kennung:** Bei `ist_probe` wird am Ende „Eine Hörprobe von Klarframe
   Radio" in der Zielsprache angehängt.

## 3. Endabnahme (`produktion.abnahme`)

- Länge in Toleranz (06 §5).
- Lautheit/True Peak im Ziel.
- Keine Stille > 1,5 s (außer bewusst gesetzt).
- **Ganzes Stück nachhören** (eine Erkennung über den fertigen Beitrag) und
  gegen das Drehbuch vergleichen — fängt Schnittfehler (vertauschte/fehlende
  Zeilen).
- Ergebnis im Beitrag gespeichert; bei Abweichung: Beitrag „mit Hinweisen fertig"
  (gelb) statt still grün.

## 4. Nachbessern nach der Fertigstellung

In der Beitragsansicht:
- Zeile anhören, **neu sprechen** (gleiche Stimme, optional neue Regie) oder
  **Text ändern und neu sprechen** → nur diese Zeile wird neu erzeugt, dann
  Schnitt + Abnahme neu (Sekunden, nicht Minuten).
- Kosten: die Sekunden der neu gesprochenen Zeile(n).
- Versionen: Jede Änderung ergibt eine neue Version des Beitrags; die vorige
  bleibt 30 Tage abrufbar. Ausgelieferte Versionen sind markiert.

## 5. Leistung und Grenzen

- Parallel je Beitrag bis 6 Zeilen gleichzeitig, je Anbieterschlüssel global
  begrenzt (Einstellung). Warteschlange mit Vorrang: Einzelaufträge
  (Mensch wartet) vor Zeitplan-Läufen, Zeitplan-Läufe nach Fälligkeit.
- Zielzeit: 3-Minuten-Beitrag mit zwei Stimmen in unter 3 Minuten fertig.
- Zeitplan-Läufe starten so früh, dass der Beitrag **vor** der Sendezeit
  ausgeliefert ist (Vorlauf je Format, Standard 20 min; Nachrichten 8 min,
  damit sie aktuell sind).
