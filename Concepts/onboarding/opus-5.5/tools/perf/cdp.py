"""Minimal stdlib-only Chrome DevTools Protocol client (flat sessions) for perf.py and film.py, on Windows or Linux.
Launches Chrome with a private profile and --remote-debugging-port and talks to it over a hand-rolled WebSocket
(no packages needed on the Windows PC). The profile is deleted on close. CHROME overrides the browser path."""
import base64, json, os, shutil, socket, struct, subprocess, threading, time, urllib.request, queue

CHROME = os.environ.get("CHROME") or (r"C:\Program Files\Google\Chrome\Application\chrome.exe" if os.name == "nt" else "/usr/bin/google-chrome")
IS_WIN = os.name == "nt"
HERE = os.path.dirname(os.path.abspath(__file__))


class WS:
    def __init__(self, url):
        assert url.startswith('ws://')
        hostport, path = url[5:].split('/', 1)
        host, port = hostport.split(':')
        self.sock = socket.create_connection((host, int(port)))
        self.sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
               f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.sock.sendall(req.encode())
        buf = b''
        while b'\r\n\r\n' not in buf:
            buf += self.sock.recv(4096)
        head, self.rest = buf.split(b'\r\n\r\n', 1)
        if b' 101 ' not in head.split(b'\r\n')[0]:
            raise RuntimeError('ws handshake failed: ' + head.decode(errors='replace'))
        self.lock = threading.Lock()

    def _recv_exact(self, n):
        out = bytearray()
        if self.rest:
            take = self.rest[:n]; out += take; self.rest = self.rest[len(take):]
        while len(out) < n:
            chunk = self.sock.recv(max(65536, n - len(out)))
            if not chunk:
                raise ConnectionError('ws closed')
            need = n - len(out)
            out += chunk[:need]
            if len(chunk) > need:
                self.rest = chunk[need:] + self.rest
        return bytes(out)

    def send(self, text):
        data = text.encode()
        hdr = bytearray([0x81])
        n = len(data)
        if n < 126: hdr.append(0x80 | n)
        elif n < 65536: hdr.append(0x80 | 126); hdr += struct.pack('>H', n)
        else: hdr.append(0x80 | 127); hdr += struct.pack('>Q', n)
        mask = os.urandom(4); hdr += mask
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data)) if n < 4096 else _mask_fast(data, mask)
        with self.lock:
            self.sock.sendall(bytes(hdr) + masked)

    def recv(self):
        parts = []
        while True:
            b0, b1 = self._recv_exact(2)
            op, n = b0 & 0x0f, b1 & 0x7f
            if n == 126: n = struct.unpack('>H', self._recv_exact(2))[0]
            elif n == 127: n = struct.unpack('>Q', self._recv_exact(8))[0]
            if b1 & 0x80: mask = self._recv_exact(4)
            payload = self._recv_exact(n) if n else b''
            if op == 0x9:  # ping
                continue
            if op == 0x8:
                raise ConnectionError('ws close frame')
            parts.append(payload)
            if b0 & 0x80:
                return b''.join(parts).decode('utf-8', errors='replace')


def _mask_fast(data, mask):
    m = int.from_bytes(mask * ((len(data) + 3) // 4), 'little') if False else None
    n = len(data)
    rep = (mask * (n // 4 + 1))[:n]
    return (int.from_bytes(data, 'little') ^ int.from_bytes(rep, 'little')).to_bytes(n, 'little')


class Browser:
    def __init__(self, port=9333, width=1600, height=1000, extra=(), headless=True):
        self.port = port
        self.profile = os.path.join(HERE if IS_WIN else os.environ.get('PM_PROFILE_DIR', os.path.expanduser('~/pm-scratch')), f'profile-{port}')
        shutil.rmtree(self.profile, ignore_errors=True)
        args = [CHROME, f'--remote-debugging-port={port}', '--remote-allow-origins=*', f'--user-data-dir={self.profile}',
                '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files',
                '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows', f'--window-size={width},{height}', '--mute-audio',
                '--hide-scrollbars'] + ([] if IS_WIN else ['--no-sandbox', '--disable-dev-shm-usage']) + (['--headless=new'] if headless else []) + list(extra) + ['about:blank']
        self.log = open(os.path.join(HERE, f'chrome-{port}.log') if IS_WIN else self.profile + '.log', 'w')
        self.proc = subprocess.Popen(args, stdout=self.log, stderr=subprocess.STDOUT)
        ver = None
        for _ in range(100):
            try:
                ver = json.loads(urllib.request.urlopen(f'http://127.0.0.1:{port}/json/version', timeout=1).read())
                break
            except Exception:
                time.sleep(0.1)
        if not ver:
            raise RuntimeError('no devtools endpoint')
        self.version = ver
        self.ws = WS(ver['webSocketDebuggerUrl'])
        self.id = 0
        self.pending = {}
        self.listeners = []
        self.alive = True
        threading.Thread(target=self._reader, daemon=True).start()

    def _reader(self):
        while self.alive:
            try:
                msg = json.loads(self.ws.recv())
            except Exception:
                self.alive = False
                for q in self.pending.values(): q.put({'error': {'message': 'connection lost'}})
                return
            if 'id' in msg and msg['id'] in self.pending:
                self.pending.pop(msg['id']).put(msg)
            elif 'method' in msg:
                for l in list(self.listeners):
                    if l[0] in (msg['method'], '*') and (l[1] is None or l[1] == msg.get('sessionId')):
                        try: l[2](msg.get('params', {}))
                        except Exception as e: print('listener error', e)

    def send(self, method, params=None, session=None, timeout=120):
        self.id += 1
        mid = self.id
        q = queue.Queue(); self.pending[mid] = q
        m = {'id': mid, 'method': method, 'params': params or {}}
        if session: m['sessionId'] = session
        self.ws.send(json.dumps(m))
        try:
            r = q.get(timeout=timeout)
        except queue.Empty:
            self.pending.pop(mid, None)
            raise TimeoutError(method)
        if 'error' in r:
            raise RuntimeError(f"{method}: {r['error'].get('message')} {r['error'].get('data', '')}")
        return r.get('result', {})

    def on(self, method, fn, session=None):
        l = (method, session, fn); self.listeners.append(l)
        return lambda: self.listeners.remove(l) if l in self.listeners else None

    def new_page(self, width=1600, height=1000):
        t = self.send('Target.createTarget', {'url': 'about:blank'})['targetId']
        s = self.send('Target.attachToTarget', {'targetId': t, 'flatten': True})['sessionId']
        pg = Page(self, s, width, height); pg.target = t
        return pg

    def close(self):
        try: self.send('Browser.close', timeout=5)
        except Exception: pass
        self.alive = False
        try: self.proc.wait(timeout=10)
        except Exception: self.proc.kill()
        time.sleep(1)
        if IS_WIN: subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.proc.pid)], capture_output=True)
        else:
            try: self.proc.kill()
            except Exception: pass
        for _ in range(20):
            try: shutil.rmtree(self.profile); break
            except FileNotFoundError: break
            except Exception: time.sleep(0.5)
        self.log.close()


class Page:
    def __init__(self, b, session, width, height):
        self.b, self.s = b, session
        self.errors = []
        self.send('Page.enable'); self.send('Runtime.enable')
        self.send('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': False})
        b.on('Runtime.exceptionThrown', lambda p: self.errors.append('EXC: ' + str((p['exceptionDetails'].get('exception') or {}).get('description') or p['exceptionDetails'].get('text'))[:300]), session)

    def send(self, method, params=None, timeout=120):
        return self.b.send(method, params, self.s, timeout)

    def on(self, method, fn):
        return self.b.on(method, fn, self.s)

    def close(self):
        try: self.b.send('Target.closeTarget', {'targetId': self.target}, timeout=10)
        except Exception: pass

    def goto(self, url, timeout=90):
        ev = threading.Event()
        off = self.on('Page.loadEventFired', lambda p: ev.set())
        self.send('Page.navigate', {'url': url})
        ev.wait(timeout); off()

    def eval(self, expr, timeout=120):
        r = self.send('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True, 'userGesture': True}, timeout)
        if 'exceptionDetails' in r:
            raise RuntimeError('eval: ' + str((r['exceptionDetails'].get('exception') or {}).get('description') or r['exceptionDetails'].get('text'))[:500])
        return r.get('result', {}).get('value')

    def click_xy(self, x, y):
        self.send('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'x': x, 'y': y})
        self.send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'x': x, 'y': y, 'button': 'left', 'clickCount': 1})
        self.send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'x': x, 'y': y, 'button': 'left', 'clickCount': 1})

    def click(self, selector):
        box = self.eval("(() => { const el = [...document.querySelectorAll(%s)].find(e => e.getClientRects().length); if (!el) return null; const r = el.getBoundingClientRect(); return {x: r.left + r.width/2, y: r.top + r.height/2}; })()" % json.dumps(selector))
        if not box:
            raise RuntimeError('no visible ' + selector)
        self.click_xy(box['x'], box['y'])
        return box

    def screenshot(self, path, clip=None, fmt='jpeg', quality=85):
        p = {'format': fmt, 'captureBeyondViewport': False}
        if fmt == 'jpeg': p['quality'] = quality
        if clip: p['clip'] = dict(clip, scale=1)
        data = base64.b64decode(self.send('Page.captureScreenshot', p)['data'])
        with open(path, 'wb') as f: f.write(data)
