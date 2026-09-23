#!/bin/bash
# Portal + API (Next.js) — Geheimnisse aus /etc/klarframe-radio/radio.env (13 §5)
set -a; . /etc/klarframe-radio/radio.env; set +a
# IPv6-Routen zu manchen Anbietern (Cloudflare) sind von diesem Server aus gestört → IPv4 zuerst.
export NODE_OPTIONS="--dns-result-order=ipv4first"
cd /root/Radio_OS && exec node_modules/.bin/next start -p 3040 -H 127.0.0.1
