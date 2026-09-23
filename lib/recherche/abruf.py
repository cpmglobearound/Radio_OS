#!/usr/bin/env python3
"""Seitenabruf mit Scrapling (Klarframe Radio). Liest JSON {urls:[...]} von stdin, schreibt JSON-Zeilen.
robots.txt wird befolgt; keine Umgehung von Bezahlschranken/Anmeldungen/Captchas (05 §3)."""
import sys, json, urllib.robotparser, urllib.parse, re, time, socket, ipaddress
from scrapling.fetchers import Fetcher

UA = 'KlarframeRadioBot/1.0 (+https://radio.klarframe.com/bot)'

def adresse_ok(url):
    """SSRF-Schutz (14 §6): nur http/https, Standard-Ports, und JEDE aufgelöste IP muss öffentlich sein — geprüft direkt vor jedem Abruf."""
    try:
        u = urllib.parse.urlparse(url)
        if u.scheme not in ('http', 'https') or not u.hostname: return False
        if u.port not in (None, 80, 443): return False
        for info in socket.getaddrinfo(u.hostname, None):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified or (ip.version == 6 and ip.ipv4_mapped and not ip.ipv4_mapped.is_global): return False
            if not ip.is_global: return False
        return True
    except Exception:
        return False

def holen(url, **kw):
    """Abruf OHNE automatische Weiterleitung: jede Station wird neu geprüft (höchstens 5)."""
    for _ in range(6):
        if not adresse_ok(url): raise ValueError('adresse_gesperrt')
        r = Fetcher.get(url, follow_redirects=False, **kw)
        if r.status in (301, 302, 303, 307, 308):
            ziel = r.headers.get('location') or r.headers.get('Location')
            if not ziel: return r
            url = urllib.parse.urljoin(url, ziel); continue
        return r
    raise ValueError('zu_viele_weiterleitungen')
robots = {}

def erlaubt(url):
    p = urllib.parse.urlparse(url)
    basis = f'{p.scheme}://{p.netloc}'
    if basis not in robots:
        rp = urllib.robotparser.RobotFileParser()
        try:
            r = holen(basis + '/robots.txt', timeout=10, headers={'User-Agent': UA})
            rp.parse(r.body.decode('utf-8', 'ignore').splitlines() if r.status == 200 else [])
        except Exception:
            rp.parse([])
        robots[basis] = rp
    return robots[basis].can_fetch(UA, url)

def text_aus(seite):
    # Hauptinhalt: article/main bevorzugen, sonst Absätze der ganzen Seite.
    for sel in ['article', 'main', '[role=main]', '.article-body', '.entry-content']:
        teile = seite.css(sel)
        if teile:
            absaetze = [t.get_all_text(strip=True) for t in teile[0].css('p, h1, h2, h3, li')]
            txt = '\n'.join(a for a in absaetze if len(a) > 30)
            if len(txt) > 400: return txt
    absaetze = [p.get_all_text(strip=True) for p in seite.css('p')]
    return '\n'.join(a for a in absaetze if len(a) > 40)

def meta(seite, *namen):
    for n in namen:
        for sel in [f'meta[property="{n}"]', f'meta[name="{n}"]']:
            e = seite.css(sel)
            if e and e[0].attrib.get('content'): return e[0].attrib['content']
    return None

def main():
    urls = json.load(sys.stdin).get('urls', [])
    letzte = {}
    for url in urls[:40]:
        erg = {'url': url}
        try:
            if not re.match(r'^https?://', url): raise ValueError('keine Webadresse')
            if not erlaubt(url):
                erg['fehler'] = 'robots'; print(json.dumps(erg), flush=True); continue
            host = urllib.parse.urlparse(url).netloc
            warte = 2 - (time.time() - letzte.get(host, 0))
            if warte > 0: time.sleep(warte)
            letzte[host] = time.time()
            s = holen(url, timeout=20, stealthy_headers=True)
            erg['status'] = s.status
            if s.status >= 400: erg['fehler'] = f'http_{s.status}'
            else:
                t = s.css('title')
                erg['titel'] = meta(s, 'og:title') or (t[0].text if t else None)
                erg['datum'] = meta(s, 'article:published_time', 'date', 'og:updated_time', 'dc.date')
                erg['sprache'] = s.css('html')[0].attrib.get('lang') if s.css('html') else None
                erg['seite'] = meta(s, 'og:site_name') or host
                erg['text'] = text_aus(s)[:40000]
                if len(erg['text']) < 300: erg['fehler'] = 'zu_wenig_text'
        except Exception as e:
            erg['fehler'] = 'abruf: ' + str(e)[:200]
        print(json.dumps(erg, ensure_ascii=False), flush=True)

main()
