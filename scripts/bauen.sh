#!/bin/bash
# Ausrollen ohne Ausfall (13 §4, Regel 10): Typprüfung → Bau in eigenen Ordner (alter Dienst läuft weiter)
# → umschalten → Neustart → Prüfung / /anmelden /api/health → bei Fehler automatisch zurück.
set -euo pipefail
cd /root/Radio_OS
set -a; . /etc/klarframe-radio/radio.env; set +a
URL="${APP_URL:-https://radio.klarframe.com}"

echo "▶ Typprüfung"; npx tsc --noEmit
echo "▶ Datenbank-Migrationen"; npx prisma migrate deploy >/dev/null
echo "▶ Bau in .next-bau"; rm -rf .next-bau
NEXT_DIST_DIR=.next-bau npx next build > /tmp/radio-bau.log 2>&1 || { tail -30 /tmp/radio-bau.log; echo "✗ Bau fehlgeschlagen — nichts geändert, alter Stand läuft weiter."; exit 1; }

echo "▶ Umschalten"; rm -rf .next-alt; [ -d .next ] && mv .next .next-alt; mv .next-bau .next
pm2 restart radio-web --update-env >/dev/null

pruefen() {
  for i in $(seq 1 20); do
    a=$(curl -s -o /dev/null -w "%{http_code}" "$URL/") ; b=$(curl -s -o /dev/null -w "%{http_code}" "$URL/anmelden"); c=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health")
    [ "$a" = 200 ] && [ "$b" = 200 ] && [ "$c" = 200 ] && return 0
    sleep 2
  done
  echo "  / $a · /anmelden $b · /api/health $c"; return 1
}
if pruefen; then
  echo "✓ Web läuft. Arbeiter sanft neu starten (beendet den laufenden Schritt zuerst)."
  pm2 restart radio-arbeiter --update-env >/dev/null
  echo "✓ Fertig."
else
  echo "✗ Prüfung fehlgeschlagen → zurück auf den alten Bau"
  rm -rf .next-kaputt; mv .next .next-kaputt; mv .next-alt .next
  pm2 restart radio-web --update-env >/dev/null
  pruefen && echo "↺ Alter Stand läuft wieder." || echo "‼ Auch der alte Stand antwortet nicht — bitte sofort prüfen."
  exit 1
fi
