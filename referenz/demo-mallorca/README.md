# Referenz: Demo „Inselfunk — Mieten auf Mallorca" (23.09.2026)

- `drehbuch.json` — Drehbuch mit 29 Zeilen, 2 Sprechern (Lena = OpenAI `marin`, Jan = OpenAI `cedar`), Regie je Zeile, Quellen mit Links.
- `produzieren.mjs` — die komplette Strecke in einer Datei: Zeile sprechen (`gpt-audio-1.5`) → Stille schneiden → Nachhören (`gpt-4o-transcribe`) → Wortvergleich + Längenprüfung → bis 4× neu → Schnitt mit Lücken und eigenem Jingle → Lautheit −16 LUFS → MP3.
  Aufruf: `OPENAI_API_KEY=… node produzieren.mjs <ordner-mit-drehbuch.json>` (braucht `bin/ffmpeg`, statisches ffmpeg 7).
- `protokoll.json` — Ergebnis je Zeile: Soll-Text, gehörter Text, Dauer, Wortgenauigkeit, Versuche.

Ergebnis: 3:13 min, −16,7 LUFS, −1,7 dBTP, alle 29 Zeilen wortgetreu (9 davon erst nach Wiederholung oder schärferer Regie).
