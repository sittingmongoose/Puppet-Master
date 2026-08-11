#!/usr/bin/env python3
"""Threaded, no-cache dev server for the bakeoff, with an identity endpoint.

    python3 tools/serve.py [port]

Why the identity endpoint: several unrelated efforts may be running local
servers on this machine at the same time. If one of them happens to occupy the
port this harness expects, a measurement run would silently read SOMEONE ELSE'S
files and report the numbers as ours -- a correctness failure that looks exactly
like a successful run. Before trusting any sweep, fetch /__whoami and confirm
the reported root and the _pm-data.js byte count match this checkout.

Threaded on purpose: the single-threaded SimpleHTTPServer drops parallel script
loads under this page's 17 concurrent requests, which silently omits whole
version files from a sweep with no error anywhere.
"""
import http.server, socketserver, os, sys, json, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 47821


class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path.split('?')[0] == '/__whoami':
            data = open(os.path.join(ROOT, '_pm-data.js'), 'rb').read()
            body = json.dumps({
                'harness': 'puppet-master-panel-bakeoff',
                'root': ROOT,
                'dataBytes': len(data),
                'dataSha1': hashlib.sha1(data).hexdigest()[:12],
                'versions': sorted(f for f in os.listdir(os.path.join(ROOT, 'versions'))
                                   if f.endswith('.js')),
            }, indent=1).encode()
            self.send_response(200)
            self.send_header('content-type', 'application/json')
            self.send_header('content-length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()


class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    os.chdir(ROOT)
    print('serving %s on http://127.0.0.1:%d  (identity at /__whoami)' % (ROOT, PORT))
    S(('127.0.0.1', PORT), H).serve_forever()
