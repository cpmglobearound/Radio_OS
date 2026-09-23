#!/bin/bash
# Arbeiter (Warteschlange) — beendet sich bei SIGTERM sanft nach dem laufenden Schritt (13 §4)
set -a; . /etc/klarframe-radio/radio.env; set +a
# IPv6-Routen zu manchen Anbietern (Cloudflare) sind von diesem Server aus gestört → IPv4 zuerst.
export NODE_OPTIONS="--dns-result-order=ipv4first"
cd /root/Radio_OS && exec node_modules/.bin/tsx arbeiter/index.ts
