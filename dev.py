#!/usr/bin/env python3
"""Local dev server — mirrors Cloudflare Pages clean URL mapping.

Usage: python3 dev.py [port]   (default 8765)

Cloudflare Pages serves /about from about.html automatically; the stock
`python3 -m http.server` does not, so navigation 404s locally. This wrapper
adds exactly that one rule.
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        if path not in ('', '/') and not path.endswith('/'):
            _, ext = os.path.splitext(path)
            if not ext:
                candidate = path.lstrip('/') + '.html'
                if os.path.isfile(candidate):
                    self.path = '/' + candidate
        return super().do_GET()


def main():
    addr = ('0.0.0.0', PORT)
    with http.server.ThreadingHTTPServer(addr, Handler) as httpd:
        print(f"chazm dev server · listening on 0.0.0.0:{PORT}  (LAN accessible · Ctrl+C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
