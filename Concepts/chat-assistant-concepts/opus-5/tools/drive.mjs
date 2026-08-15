/* Headless driver — Opus 5 concept workspace
 *
 * WHY THIS EXISTS
 * ---------------
 * The suites in tests/ assert computed geometry, so they only mean anything when a real engine has
 * laid the compositions out at a real size. Reading tests/runner.html by hand proves nothing. This
 * script starts headless Chromium, drives the page over the DevTools protocol, and reports what the
 * page actually said.
 *
 * WHY IT HAS NO DEPENDENCIES
 * --------------------------
 * The concept itself is dependency-free and runs from file:// with no build step; its harness should
 * cost no more to run than the thing it measures. There is no node_modules here and none is wanted,
 * so the two pieces that would normally come from a package — a WebSocket client and a CDP client —
 * are written out below in about two hundred lines. Node 20 has no global WebSocket, which is why
 * the RFC 6455 client is hand-rolled over `net` rather than borrowed from the runtime.
 *
 * WHY EVERY PAGE IS LOADED FROM file://
 * -------------------------------------
 * This sandbox hangs on every http(s) request issued by the browser, indefinitely and without an
 * error. A local server would look like a broken concept. The workspace is built to run from
 * file:// anyway (demo/demoData.bundle.js exists precisely because fetch() cannot read file://), so
 * pages are always addressed as absolute file:// URLs derived from THIS file's location, never from
 * the working directory. The CDP endpoint on 127.0.0.1 is a different matter: it is the debugger
 * socket, not page traffic, and it works normally.
 *
 * Usage:
 *   node tools/drive.mjs scan                                  (no browser; pure filesystem audit)
 *   node tools/drive.mjs suite                                 (writes interaction-test-report.json)
 *   node tools/drive.mjs matrix [--scope=w1]                   (folds into the same report)
 *   node tools/drive.mjs triggers                              (writes demo-trigger-report.json)
 *   node tools/drive.mjs activity                              (samples t1..t8, writes evidence PNGs)
 *   node tools/drive.mjs paging                                (pages t1..t8 through a questionnaire)
 *   node tools/drive.mjs shot <relative-page-url> <out.png>
 *   node tools/drive.mjs eval <relative-page-url> '<js expression>'
 *
 * Options: --width=<px> --height=<px> --timeout=<ms> --page=<relative-url> --window=<w1..w8>
 *
 * WHAT THINGS COST, MEASURED RATHER THAN GUESSED
 * ----------------------------------------------
 * `suite` is about ten seconds and `triggers` about fifteen. A previous session reported the trigger
 * sweep taking eleven and then forty minutes and suspected page-state accumulation; that was wrong,
 * and the measurement that settles it is in this file's design. Firing all 125 declared events with
 * a reset before each takes 8.4s on stage.html and 124s on index.html — fifteen times longer for the
 * same work. Nothing accumulates in either case (the document holds 1461 nodes at the first trigger
 * and 1489 at the last on stage.html, and per-trigger cost FALLS over the sweep rather than rising).
 * The cost is fan-out: every PMXDemo.fire notifies the store and every mounted composition re-renders,
 * and the gallery mounts sixteen of them where the stage mounts one. So the sweep runs on stage.html,
 * in one browser, one page load, one CDP round trip per trigger. Add a per-trigger screenshot, a
 * settle, or a browser relaunch per trigger to a sixteen-composition page and the forty minutes is
 * fully explained without any leak.
 *
 * `matrix` is the long one and it is long linearly, not quadratically: 128 mounts at a measured
 * 2182ms each, four minutes forty in total, with the document holding 1508 nodes before the sweep and
 * 1487 after it. An earlier note in this file claimed the sweep grew superlinearly and warned that
 * eight windows cost far more than eight times one; sixteen runs scoped to w1 come to 1957ms each,
 * which is the same rate. There is no accumulation to work around, so `--scope=w1` exists for a quick
 * check rather than as an escape from a pathology.
 *
 * The CDP layer is exported as well as driven from the CLI, because the next tool along needs to
 * script the same session rather than shell out to this one.
 */

import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync
} from 'node:fs';
import { get as httpGet } from 'node:http';
import { createServer, connect as netConnect } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOLS_DIR = dirname(fileURLToPath(import.meta.url));
const CONCEPT_DIR = resolve(TOOLS_DIR, '..');

/* Playwright's managed build. It is the only Chromium in this environment, and it is pinned rather
 * than searched for so a missing browser fails with a path to fix instead of a silent fallback. */
const CHROME_BIN = process.env.PMX_CHROME ||
  '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

/* The suites refuse to run below 1900x900 — eight popup-anchor assertions fail for a reason that
 * describes the window rather than the product — so the default window clears that bar. */
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1000;

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/* ------------------------------------------------------------------ RFC 6455 client */

/* A WebSocket client with exactly the surface CDP needs: connect, send text, receive text, close.
 * Everything omitted (extensions, permessage-deflate, subprotocols, server-side masking) is omitted
 * because the peer is a local Chromium debugger that never asks for it. */
class MiniSocket {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.fragments = [];       /* payload chunks of a message split across frames */
    this.fragmentOpcode = 0;   /* the opcode of the frame that started the fragment run */
    this.onMessage = () => {};
    this.onClose = () => {};
    this.closed = false;
    this.notified = false;   /* onClose fires exactly once, whichever path gets here first */

    socket.on('data', (chunk) => {
      /* TCP gives no message boundaries: one read can hold half a frame or six frames, and a
       * captureScreenshot reply arrives as a few megabytes spread over dozens of reads. So append
       * and re-drain rather than assuming a read is a frame. */
      this.buffer = this.buffer.length ? Buffer.concat([this.buffer, chunk]) : chunk;
      try {
        this.drain();
      } catch (err) {
        this.fail(err);
      }
    });
    socket.on('close', () => {
      this.closed = true;
      this.notify();
    });
    socket.on('error', (err) => this.fail(err));
  }

  notify(err) {
    if (this.notified) return;
    this.notified = true;
    this.onClose(err);
  }

  fail(err) {
    this.closed = true;
    this.notify(err);
    try { this.socket.destroy(); } catch { /* already gone */ }
  }

  drain() {
    for (;;) {
      const buf = this.buffer;
      if (buf.length < 2) return;

      const fin = (buf[0] & 0x80) !== 0;
      const opcode = buf[0] & 0x0f;
      const masked = (buf[1] & 0x80) !== 0;
      let length = buf[1] & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (buf.length < 4) return;
        length = buf.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (buf.length < 10) return;
        const big = buf.readBigUInt64BE(2);
        if (big > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('websocket frame too large to address');
        length = Number(big);
        offset = 10;
      }

      let mask = null;
      if (masked) {
        /* A server frame must not be masked, but decoding one costs four lines and refusing one
         * would turn a spec-legal peer into an unexplained hang. */
        if (buf.length < offset + 4) return;
        mask = buf.subarray(offset, offset + 4);
        offset += 4;
      }

      if (buf.length < offset + length) return; /* partial frame: wait for the rest of the stream */

      let payload = buf.subarray(offset, offset + length);
      if (mask) {
        payload = Buffer.from(payload);
        for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      }
      this.buffer = buf.subarray(offset + length);
      this.handleFrame(fin, opcode, payload);
    }
  }

  handleFrame(fin, opcode, payload) {
    if (opcode === 0x9) {                      /* ping: answer or the peer eventually drops us */
      this.writeFrame(0xA, payload);
      return;
    }
    if (opcode === 0xA) return;                /* pong: nothing to do, we never ping */
    if (opcode === 0x8) {                      /* close: echo it and let the socket end */
      if (!this.closed) {
        this.closed = true;
        this.writeFrame(0x8, Buffer.alloc(0));
        try { this.socket.end(); } catch { /* already gone */ }
      }
      return;
    }

    if (opcode === 0x0) {
      this.fragments.push(payload);
    } else {
      this.fragments = [payload];
      this.fragmentOpcode = opcode;
    }
    if (!fin) return;

    const full = this.fragments.length === 1 ? this.fragments[0] : Buffer.concat(this.fragments);
    this.fragments = [];
    /* CDP is text-only; a binary frame would be a protocol surprise, and dropping it silently is
     * better than handing JSON.parse a blob. */
    if (this.fragmentOpcode === 0x1) this.onMessage(full.toString('utf8'));
  }

  writeFrame(opcode, payload) {
    const length = payload.length;
    let header;
    if (length < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }
    header[0] = 0x80 | opcode; /* FIN set: this client never fragments what it sends */

    /* Client-to-server frames MUST be masked (RFC 6455 §5.3). Chromium closes the connection on an
     * unmasked client frame, and the symptom is a CDP call that simply never answers, so the mask
     * is not optional politeness. */
    const mask = randomBytes(4);
    const masked = Buffer.allocUnsafe(length);
    for (let i = 0; i < length; i++) masked[i] = payload[i] ^ mask[i & 3];
    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  send(text) {
    if (this.closed) throw new Error('websocket is closed');
    this.writeFrame(0x1, Buffer.from(text, 'utf8'));
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    try { this.writeFrame(0x8, Buffer.alloc(0)); } catch { /* already gone */ }
    try { this.socket.end(); } catch { /* already gone */ }
  }
}

export function wsConnect(url, timeoutMs = 10000) {
  const parsed = new URL(url);
  const path = parsed.pathname + parsed.search;
  const key = randomBytes(16).toString('base64');
  const accept = createHash('sha1').update(key + WS_GUID).digest('base64');

  return new Promise((resolvePromise, rejectPromise) => {
    const socket = netConnect({ host: parsed.hostname, port: Number(parsed.port) });
    socket.setNoDelay(true);

    const timer = setTimeout(() => {
      socket.destroy();
      rejectPromise(new Error(`websocket handshake timed out after ${timeoutMs}ms: ${url}`));
    }, timeoutMs);

    const failEarly = (err) => {
      clearTimeout(timer);
      socket.destroy();
      rejectPromise(err);
    };

    socket.on('error', failEarly);

    socket.on('connect', () => {
      socket.write(
        `GET ${path} HTTP/1.1\r\n` +
        `Host: ${parsed.hostname}:${parsed.port}\r\n` +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Key: ${key}\r\n` +
        'Sec-WebSocket-Version: 13\r\n\r\n'
      );
    });

    let head = Buffer.alloc(0);
    const onHandshakeData = (chunk) => {
      head = Buffer.concat([head, chunk]);
      const end = head.indexOf('\r\n\r\n');
      if (end < 0) return; /* headers can arrive split, same as frames */

      const headerText = head.subarray(0, end).toString('latin1');
      const rest = head.subarray(end + 4);
      socket.off('data', onHandshakeData);
      socket.off('error', failEarly);
      clearTimeout(timer);

      if (!/^HTTP\/1\.1 101/i.test(headerText)) {
        socket.destroy();
        rejectPromise(new Error('websocket upgrade refused: ' + headerText.split('\r\n')[0]));
        return;
      }
      const got = /sec-websocket-accept:\s*(\S+)/i.exec(headerText);
      if (!got || got[1] !== accept) {
        socket.destroy();
        rejectPromise(new Error('websocket accept key mismatch — the peer is not speaking RFC 6455'));
        return;
      }

      const mini = new MiniSocket(socket);
      /* Bytes that arrived in the same read as the end of the handshake are already frame data, but
       * they are decoded on the NEXT turn: the caller attaches its onMessage handler in the microtask
       * that follows this resolve, and anything delivered before that would go to the default no-op
       * handler and vanish. */
      if (rest.length) {
        mini.buffer = rest;
        setImmediate(() => {
          try { mini.drain(); } catch (err) { mini.fail(err); }
        });
      }
      resolvePromise(mini);
    };
    socket.on('data', onHandshakeData);
  });
}

/* ------------------------------------------------------------------ CDP */

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    this.deadReason = null;

    socket.onMessage = (text) => {
      let msg;
      try { msg = JSON.parse(text); } catch { return; }
      if (msg.id != null) {
        const waiter = this.pending.get(msg.id);
        if (!waiter) return;
        this.pending.delete(msg.id);
        if (msg.error) waiter.reject(new Error(`CDP ${waiter.method} failed: ${msg.error.message}`));
        else waiter.resolve(msg.result);
        return;
      }
      const list = this.handlers.get(msg.method);
      if (list) for (const fn of list) fn(msg.params || {}, msg.sessionId);
    };

    socket.onClose = (err) => {
      this.deadReason = err ? err.message : 'the browser closed the debugger connection';
      /* Rejecting in-flight calls matters: without it a browser crash reads as a hang, and a hang
       * reads as "the concept is slow" rather than "the browser died". */
      for (const [id, waiter] of this.pending) {
        this.pending.delete(id);
        waiter.reject(new Error(`CDP ${waiter.method} lost the connection: ${this.deadReason}`));
      }
    };
  }

  send(method, params = {}, sessionId = null, timeoutMs = 30000) {
    if (this.deadReason) return Promise.reject(new Error(`CDP is closed: ${this.deadReason}`));
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolvePromise, rejectPromise) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectPromise(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, {
        method,
        resolve: (value) => { clearTimeout(timer); resolvePromise(value); },
        reject: (err) => { clearTimeout(timer); rejectPromise(err); }
      });
      this.socket.send(JSON.stringify(payload));
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
}

/* ------------------------------------------------------------------ launch */

function freePort() {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();
    server.on('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      /* Handing the port over rather than holding it leaves a small race, but Chromium binds within
       * milliseconds and a fixed port would collide with a driver left running from a prior run. */
      server.close(() => resolvePromise(port));
    });
  });
}

function fetchJson(url, timeoutMs = 1000) {
  return new Promise((resolvePromise, rejectPromise) => {
    const req = httpGet(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        try { resolvePromise(JSON.parse(body)); } catch (err) { rejectPromise(err); }
      });
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.on('error', rejectPromise);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* launch({width, height}) — start Chromium, attach to a fresh page target, return a session. */
export async function launch({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = {}) {
  if (!existsSync(CHROME_BIN)) {
    throw new Error(`Chromium not found at ${CHROME_BIN} (override with PMX_CHROME=/path/to/chrome)`);
  }

  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), 'pmx-drive-'));
  const proc = spawn(CHROME_BIN, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    /* Without this the workspace's own scripts are cross-origin to each other under file://. */
    '--allow-file-access-from-files',
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-dev-shm-usage',
    '--mute-audio',
    '--force-color-profile=srgb',
    'about:blank'
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    /* Detached makes Chromium its own process-group leader so close() can signal the entire tree.
     * Killing only the parent leaves the renderers orphaned, and an orphaned renderer that was in
     * the middle of the matrix sweep keeps burning a core until someone notices it by hand. */
    detached: true
  });

  let stderrTail = '';
  proc.stderr.on('data', (d) => { stderrTail = (stderrTail + d.toString()).slice(-2000); });
  let exited = null;
  proc.on('exit', (code, signal) => { exited = { code, signal }; });

  /* The DevTools HTTP endpoint is the one http request that works here, and it is the only reliable
   * signal that the port is really listening — the process being alive is not the same thing. */
  let version = null;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (exited) {
      rmSync(profile, { recursive: true, force: true });
      throw new Error(
        `Chromium exited before the debugger opened (code ${exited.code}, signal ${exited.signal})\n${stderrTail.trim()}`
      );
    }
    try {
      version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
      break;
    } catch {
      await sleep(120);
    }
  }
  if (!version || !version.webSocketDebuggerUrl) {
    try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* group already gone */ }
    try { proc.kill('SIGKILL'); } catch { /* already gone */ }
    rmSync(profile, { recursive: true, force: true });
    throw new Error(`Chromium never opened its debugger on 127.0.0.1:${port} within 20s\n${stderrTail.trim()}`);
  }

  const socket = await wsConnect(version.webSocketDebuggerUrl);
  const cdp = new Cdp(socket);

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  /* The session is built first because building it is what subscribes to the console events. Enabling
   * Runtime before the subscriber exists would leave a window in which a message could be delivered
   * to nobody, and a driver that under-reports warnings is worse than one that reports none. */
  const session = makeSession({ cdp, sessionId, targetId, proc, profile, socket, browser: version.Browser });
  await session.send('Page.enable');
  await session.send('Runtime.enable');
  /* Set metrics explicitly rather than trusting --window-size: the suites read window.innerWidth to
   * decide whether to run at all, and an off-by-a-few viewport turns a real run into a refusal. */
  await session.setViewport(width, height);
  return session;
}

function makeSession({ cdp, sessionId, targetId, proc, profile, socket, browser }) {
  /* Zero console errors AND zero warnings is an acceptance criterion for this build, so warnings are
   * collected with the same weight as errors — a dropped `console.warn` is how an unknown icon name
   * or an unbound service escapes notice. */
  const consoleLog = [];

  cdp.on('Runtime.consoleAPICalled', (params, sid) => {
    if (sid !== sessionId) return;
    const text = (params.args || [])
      .map((a) => (a.value !== undefined ? String(a.value) : (a.description || a.type)))
      .join(' ');
    consoleLog.push({ level: params.type, text });
  });

  cdp.on('Runtime.exceptionThrown', (params, sid) => {
    if (sid !== sessionId) return;
    const details = params.exceptionDetails || {};
    const description = (details.exception && details.exception.description) || '';
    consoleLog.push({ level: 'error', text: ('uncaught: ' + (details.text || '') + ' ' + description).trim() });
  });

  let loadWaiters = [];
  cdp.on('Page.loadEventFired', (_params, sid) => {
    if (sid !== sessionId) return;
    loadWaiters.splice(0).forEach((fn) => fn());
  });

  const session = {
    cdp,
    sessionId,
    targetId,
    consoleLog,
    browser,

    /* Raw escape hatch for the tool that imports this module and needs a domain we do not wrap. */
    send(method, params, timeoutMs) {
      return cdp.send(method, params, sessionId, timeoutMs);
    },

    /* goto(url) — navigate and wait for the document to be complete.
     *
     * This used to wait on Page.loadEventFired alone, and a previous session lost a run to
     * `page load timed out after 45000ms` on a page that loads in under two seconds when the machine
     * is quiet. One missed or late event is all it takes, and there are two ways to get one here:
     * every byte of every page comes off an NFS share over file://, so a stalled read can push the
     * load event past any fixed budget; and a load event that arrives while the driver is between
     * navigations is delivered to nobody. So the event is now only the FAST path. The slow path polls
     * document.readyState, which is state rather than notification and therefore cannot be missed —
     * if the document did finish, the poll sees it whatever happened to the event. A genuine failure
     * (a document that really never completes) still fails, loudly, with the elapsed time. */
    async goto(fileUrl, { timeoutMs = 60000 } = {}) {
      /* Drop any waiter left behind by a previous goto that gave up. A stale waiter is harmless to
       * this call but it makes the array grow for the life of the session. */
      loadWaiters = [];
      const startedAt = Date.now();
      let settled = false;
      const loaded = new Promise((resolvePromise) => {
        loadWaiters.push(() => { settled = true; resolvePromise('load-event'); });
      });

      const result = await cdp.send('Page.navigate', { url: fileUrl }, sessionId);
      /* A mistyped path resolves to net::ERR_FILE_NOT_FOUND and still fires a load event, so the
       * navigation result is the only place the mistake is visible. */
      if (result.errorText) throw new Error(`navigation failed (${result.errorText}): ${fileUrl}`);

      const polled = (async () => {
        /* Poll from a short delay so the fast path normally wins and the log stays quiet. Each probe
         * is cheap; a busy renderer simply answers late, and lateness here is not an error. */
        while (!settled && Date.now() - startedAt < timeoutMs) {
          await sleep(250);
          if (settled) break;
          try {
            const state = await cdp.send(
              'Runtime.evaluate',
              { expression: 'document.readyState', returnByValue: true },
              sessionId,
              5000
            );
            if (state && state.result && state.result.value === 'complete') return 'readyState-poll';
          } catch { /* the renderer is busy or mid-navigation; try again */ }
        }
        return null;
      })();

      let timer;
      const timeout = new Promise((_r, rejectPromise) => {
        timer = setTimeout(() => rejectPromise(new Error(
          `page load timed out after ${timeoutMs}ms: ${fileUrl} — neither Page.loadEventFired nor a ` +
          'document.readyState poll reported completion, so the document really did not finish'
        )), timeoutMs);
      });

      try {
        const via = await Promise.race([loaded, polled.then((v) => v || timeout), timeout]);
        settled = true;
        return { url: fileUrl, via, ms: Date.now() - startedAt };
      } finally {
        clearTimeout(timer);
      }
    },

    async eval(expressionOrFn, { awaitPromise = true, timeoutMs = 30000 } = {}) {
      const expression = typeof expressionOrFn === 'function'
        ? `(${expressionOrFn.toString()})()`
        : String(expressionOrFn);
      const result = await cdp.send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise },
        sessionId,
        timeoutMs
      );
      if (result.exceptionDetails) {
        const details = result.exceptionDetails;
        const description = (details.exception && details.exception.description) || '';
        /* Carry the page's own message through untouched. A driver that reports "evaluate failed"
         * and drops the stack turns a one-line concept bug into an afternoon. */
        const err = new Error(`page threw: ${details.text || 'exception'}${description ? ' — ' + description : ''}`);
        err.exceptionDetails = details;
        throw err;
      }
      return result.result ? result.result.value : undefined;
    },

    /* Two frames, not one. The concepts write style on requestAnimationFrame, so a single frame can
     * observe a value that has been set but not yet laid out; the second frame is what makes a
     * following measurement read settled geometry. The timer is a cap, not a delay: whichever of the
     * two arrives first resolves, so a headless page that is throttling rAF cannot leave this promise
     * pending until the CDP call expires. In practice the rAF pair wins in about 30ms. */
    settle(capMs = 500) {
      return session.eval(
        'new Promise(function (r) {' +
        '  var done = function () { r(1); };' +
        '  setTimeout(done, ' + Number(capMs) + ');' +
        '  requestAnimationFrame(function () { requestAnimationFrame(done); });' +
        '})',
        { awaitPromise: true }
      );
    },

    /* A real click at real coordinates, not element.click(). The point of this driver is that a
     * report cannot claim behaviour the page did not perform, and element.click() fires a handler on
     * a control that may be zero-sized, scrolled out of its scroller, or under an overlay. Hit
     * testing is part of the assertion. */
    async clickAt(x, y) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', buttons: 0 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1
      }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1
      }, sessionId);
    },

    async waitFor(expression, { timeoutMs = 60000, intervalMs = 250, label = 'condition' } = {}) {
      const deadline = Date.now() + timeoutMs;
      const expired = () => new Error(
        `timed out after ${timeoutMs}ms waiting for ${label} (the page may still be working; raise --timeout)`
      );
      for (;;) {
        /* The poll expression is given the WHOLE remaining budget as its CDP timeout rather than the
         * 30s default. The suites and the matrix both chain their runs through .then(), and a
         * microtask chain never yields to the task queue, so the renderer cannot answer ANY evaluate
         * until the run finishes — a short per-call timeout would report a busy main thread as a
         * hang. When the call does expire the wait is over, so it is re-thrown under the label of
         * the thing being waited for; "CDP Runtime.evaluate timed out" names the mechanism instead
         * of the problem. */
        const remaining = Math.max(2000, deadline - Date.now());
        let value;
        try {
          value = await session.eval(expression, { timeoutMs: remaining + 5000 });
        } catch (err) {
          if (/timed out/.test(err.message)) throw expired();
          throw err;
        }
        if (value) return value;
        if (Date.now() > deadline) throw expired();
        await sleep(intervalMs);
      }
    },

    async setViewport(width, height) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width, height, deviceScaleFactor: 1, mobile: false
      }, sessionId);
    },

    async screenshot(path, { clip = null, format = 'png' } = {}) {
      const params = { format, captureBeyondViewport: false };
      if (clip) params.clip = { scale: 1, ...clip };
      const shot = await cdp.send('Page.captureScreenshot', params, sessionId, 60000);
      const target = isAbsolute(path) ? path : resolve(process.cwd(), path);
      mkdirSync(dirname(target), { recursive: true });
      const bytes = Buffer.from(shot.data, 'base64');
      writeFileSync(target, bytes);
      return { path: target, bytes: bytes.length };
    },

    errors() {
      return consoleLog.filter((m) => m.level === 'error');
    },

    warnings() {
      return consoleLog.filter((m) => m.level === 'warning' || m.level === 'warn');
    },

    async close() {
      try { await cdp.send('Browser.close', {}, null, 4000); } catch { /* falling through to kill */ }
      try { socket.close(); } catch { /* already gone */ }
      try { socket.socket.destroy(); } catch { /* already gone */ }
      /* Negative pid signals the whole group. Browser.close cannot be relied on here: a renderer
       * busy in a long synchronous run does not process the shutdown message, which is precisely the
       * case — a timed-out matrix — where a leaked process would cost the most. */
      try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* group already gone */ }
      try { proc.kill('SIGKILL'); } catch { /* already gone */ }

      /* Wait for the process to actually be gone before deleting its profile. Chromium flushes
       * leveldb files on the way out, so removing the directory while it is still exiting raises
       * ENOTEMPTY — which used to fail a run that had already passed. */
      await new Promise((done) => {
        if (proc.exitCode !== null || proc.signalCode !== null) { done(); return; }
        proc.once('exit', done);
        setTimeout(done, 3000).unref();
      });
      /* Remove, then CHECK, then remove again. rmSync can return successfully and leave the
       * directory there: the crashpad handler is reparented to init and outlives the process-group
       * kill by a moment, and anything it flushes after the tree has been walked recreates the
       * directory behind the deletion. Trusting the first call is how a profile is leaked while the
       * driver reports a clean exit. */
      for (let attempt = 0; attempt < 8; attempt++) {
        try { rmSync(profile, { recursive: true, force: true }); } catch { /* retried below */ }
        if (!existsSync(profile)) return;
        await sleep(250);
      }
      /* A stranded temp profile is untidy, not a failure: say so and let the result stand. */
      process.stderr.write(`drive: could not remove scratch profile ${profile}\n`);
    }
  };

  return session;
}

/* pageUrl('tests/runner.html?run=1') — absolute file:// URL for anything inside the concept folder.
 * Anchored to this file rather than to cwd so `node tools/drive.mjs` and `node drive.mjs` and a
 * caller three directories away all address the same page. */
export function pageUrl(relativeUrl) {
  const [path, query = ''] = String(relativeUrl).replace(/^\.?\//, '').split('?');
  const url = pathToFileURL(join(CONCEPT_DIR, path)).href;
  return query ? `${url}?${query}` : url;
}

export { CONCEPT_DIR, CHROME_BIN };

/* ------------------------------------------------------------------ reports */

const SUITE_REPORT = join(CONCEPT_DIR, 'interaction-test-report.json');
const TRIGGER_REPORT = join(CONCEPT_DIR, 'demo-trigger-report.json');

/* CORRECTION_GOAL_PROMPT.md names fourteen states the deterministic triggers must cover:
 *
 *   "question, Goal, Todo, child, activity, diff, artifact, approval, thread, collision,
 *    offline/replay, BSD, attachment, and recovery states"
 *
 * Nine of those fourteen are ALSO the name of a Director family, and reading the family list is
 * enough to check them. The other five are not — the packet's vocabulary and this workspace's
 * vocabulary diverge, and there is no family called `child`, `approval`, `collision`, `offline` or
 * `recovery`. A reviewer holding the packet against `demo-trigger-report.json` would find five of
 * the fourteen apparently missing, and the only thing that would have told them otherwise was a
 * reader's willingness to guess that `decision.approve` is what "approval" meant.
 *
 * So the mapping is written down, and then MEASURED: a packet state counts as covered only when at
 * least one of the events named here actually fired ok in this sweep. A renamed or deleted event
 * therefore turns into a reported uncovered state instead of quietly leaving a packet requirement
 * with nothing behind it. Names here are `family.event`; the alias family `subagent` is deliberately
 * not used, so a state is never satisfied only by an alias of something already counted. */
const PACKET_TRIGGER_STATES = [
  { state: 'question', events: ['question.prepare', 'question.open', 'question.next', 'question.skip', 'question.cancel', 'question.submit', 'question.submitting', 'question.select', 'question.validation_error'] },
  { state: 'Goal', events: ['goal.start', 'goal.progress', 'goal.pause', 'goal.resume', 'goal.update', 'goal.replan', 'goal.blocked', 'goal.complete', 'goal.stop', 'goal.clear'] },
  { state: 'Todo', events: ['todo.add', 'todo.complete', 'todo.reopen', 'todo.block'] },
  {
    state: 'child',
    note: 'Child work is `agent` here — a spawned subagent — plus the crew that fans several out and the thread-level spawn that gives one its own conversation.',
    events: ['agent.spawn', 'agent.advance', 'agent.queue', 'agent.block', 'agent.complete', 'agent.fail', 'agent.stop', 'agent.retry', 'agent.progress', 'crew.start', 'crew.wave', 'crew.synthesize', 'crew.stop', 'thread.spawn', 'thread.spawn_related']
  },
  { state: 'activity', events: ['activity.advance', 'activity.condense', 'activity.reopen', 'activity.settle', 'activity.open_phase', 'activity.close_phase', 'activity.thinking_summary', 'activity.search', 'activity.read', 'activity.fetch', 'activity.browser', 'activity.test', 'activity.edit', 'activity.generate'] },
  { state: 'diff', events: ['diff.create', 'diff.update', 'diff.open'] },
  { state: 'artifact', events: ['artifact.loading', 'artifact.ready', 'artifact.switch', 'artifact.error', 'artifact.retry', 'artifact.update', 'artifact.close'] },
  {
    state: 'approval',
    note: 'Approval is a `decision` here: the packet names the answer, this workspace names the surface that asks for it.',
    events: ['decision.approval_open', 'decision.details', 'decision.approve', 'decision.deny', 'decision.branch', 'decision.clear']
  },
  { state: 'thread', events: ['thread.request', 'thread.respond', 'thread.branch', 'thread.rewind', 'thread.restore_point', 'thread.redirect', 'thread.send_request', 'thread.receive_response', 'history.switch_thread'] },
  {
    state: 'collision',
    note: 'The three resource collisions the packet manifest names (port, worktree, test runner), plus the cross-project grant that is the collision of two projects over one permission.',
    events: ['system.port_collision', 'system.worktree_collision', 'system.test_collision', 'system.cross_project_grant']
  },
  {
    state: 'offline/replay',
    note: 'The `sync` family: go offline, queue a send, reconnect, replay the queue idempotently, reconcile a snapshot, and pick up work the server did while away.',
    events: ['sync.offline', 'sync.queue_send', 'sync.reconnect', 'sync.replay', 'sync.snapshot', 'sync.server_work']
  },
  { state: 'BSD', events: ['bsd.auto_active', 'bsd.advice', 'bsd.silent', 'bsd.duplicate', 'bsd.timeout', 'bsd.unavailable', 'bsd.quota', 'bsd.manual_on', 'bsd.off'] },
  { state: 'attachment', events: ['attachment.add', 'attachment.add_document', 'attachment.incompatible', 'attachment.extract', 'attachment.cancel', 'attachment.reevaluate', 'attachment.remove', 'decision.attachment_incompatible'] },
  {
    state: 'recovery',
    note: 'Recovery is not one family — it is what several families do after a failure, so it is listed as the retry/repair/restore path of each: a failed child retried, a failed artifact retried, a broken provider repaired, a dropped connection replayed, a thread rewound to a restore point, and the Director reset.',
    events: ['agent.retry', 'artifact.retry', 'provider.needs_repair', 'provider.update_failed', 'sync.reconnect', 'sync.replay', 'thread.rewind', 'thread.restore_point', 'system.reset']
  }
];

/* Read an existing report so a command can replace its own section without discarding sections it
 * did not measure. A report that exists but cannot be parsed is a hard failure rather than something
 * to overwrite: silently replacing a file someone else is mid-way through writing is how measured
 * results disappear. */
function readReport(path) {
  if (!existsSync(path)) return {};
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`cannot read ${path}: ${err.message}`);
  }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      `${path} exists but is not valid JSON (${err.message}). Refusing to overwrite it; ` +
      'fix or delete the file and run again.'
    );
  }
}

/* Merge `sections` into the report at `path` and stamp provenance. Every top-level section carries
 * either a measurement stamp from THIS run or a carriedOver flag, so nothing in the file can imply
 * it was measured when it was inherited from an older one. */
function writeReport(path, sections, { command, session = null, extra = {} }) {
  const report = readReport(path);
  const now = new Date().toISOString();
  const provenance = report.provenance && typeof report.provenance === 'object' ? report.provenance : {};

  for (const key of Object.keys(sections)) {
    report[key] = sections[key];
    provenance[key] = {
      measuredAt: now,
      by: `node tools/drive.mjs ${command}`,
      browser: session ? session.browser : null
    };
  }
  for (const key of Object.keys(report)) {
    if (key === 'provenance' || key === 'generatedAt' || key === 'generatedFrom') continue;
    if (provenance[key]) continue;
    provenance[key] = { carriedOver: true, note: 'present in the file before this run; not measured by it' };
  }

  Object.assign(report, extra);
  report.provenance = provenance;
  report.generatedAt = now;

  try {
    writeFileSync(path, JSON.stringify(report, null, 2) + '\n');
  } catch (err) {
    throw new Error(`cannot write ${path}: ${err.message}`);
  }
  return path;
}

/* ------------------------------------------------------------------ CLI helpers */

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    const match = /^--([\w-]+)(?:=(.*))?$/.exec(arg);
    if (match) flags[match[1]] = match[2] === undefined ? true : match[2];
    else positional.push(arg);
  }
  return { positional, flags };
}

/* Wait for the workspace to finish booting. Every page in this build sets data-pmx-ready when its
 * compositions are mounted; anything measured before that is measuring an empty body. */
const READY_EXPRESSION = 'document.body && document.body.getAttribute("data-pmx-ready") === "1"';

function summariseConsole(session) {
  return {
    driverConsoleErrors: session.errors().map((m) => m.text),
    driverConsoleWarnings: session.warnings().map((m) => m.text)
  };
}

/* Boot is best-effort for shot/eval: not every page in the folder is a workspace page, so a page
 * that never sets data-pmx-ready is reported as such rather than failing the command. */
async function softWaitForReady(session, timeoutMs = 30000) {
  try {
    await session.waitFor(READY_EXPRESSION, { timeoutMs, label: 'data-pmx-ready' });
    return true;
  } catch {
    return false;
  }
}

async function openWorkspace(session, relative, { timeoutMs = 60000 } = {}) {
  const url = pageUrl(relative);
  const nav = await session.goto(url, { timeoutMs });
  await session.waitFor(READY_EXPRESSION, { timeoutMs, label: `workspace boot (data-pmx-ready) on ${relative}` });
  return { url, nav };
}

/* ------------------------------------------------------------------ suite */

async function cmdSuite(session, flags) {
  const timeoutMs = Number(flags.timeout || 120000);
  const url = pageUrl('tests/runner.html?run=1');
  const nav = await session.goto(url, { timeoutMs: 60000 });

  /* The runner auto-runs on ?run=1 and publishes window.__pmxTestExit when it renders. It publishes
   * nothing at all when it REFUSES to run (viewport too small), so the refusal notice is polled for
   * as well — otherwise a refusal looks exactly like a hang. */
  const outcome = await session.waitFor(`(function () {
    if (window.__pmxTestExit) {
      return {
        exit: window.__pmxTestExit,
        suiteNames: window.PMXSuites ? window.PMXSuites.list() : []
      };
    }
    var refused = document.querySelector('.tr-refused');
    if (refused) return { refused: true, reason: refused.textContent };
    return null;
  })()`, { timeoutMs, label: 'window.__pmxTestExit' });

  const driver = summariseConsole(session);

  if (outcome.refused) {
    const section = {
      url, refused: true, reason: outcome.reason,
      viewport: { width: Number(flags.width || DEFAULT_WIDTH), height: Number(flags.height || DEFAULT_HEIGHT) },
      ...driver
    };
    writeReport(SUITE_REPORT, { interactionSuite: section }, { command: 'suite', session });
    process.stdout.write(JSON.stringify({ command: 'suite', reportPath: SUITE_REPORT, ...section }, null, 2) + '\n');
    return 1;
  }

  const exit = outcome.exit;
  const messages = exit.consoleMessages || { errors: [], warnings: [] };
  const section = {
    url,
    loadedVia: nav.via,
    loadMs: nav.ms,
    viewport: exit.viewport,
    suites: (outcome.suiteNames || []).length,
    suiteNames: outcome.suiteNames || [],
    assertions: exit.total,
    passed: exit.passed,
    failed: exit.failed,
    durationMs: exit.elapsedMs,
    /* Counts and TEXT for both levels. A count alone tells you something is wrong and nothing about
     * what, and warnings carry the failures that never throw: an unknown icon name, an unbound
     * service, a selector that matched nothing. */
    pageConsoleErrorCount: exit.errors,
    pageConsoleWarningCount: exit.warnings,
    pageConsoleErrors: messages.errors || [],
    pageConsoleWarnings: messages.warnings || [],
    failures: exit.failures || [],
    ...driver
  };

  writeReport(SUITE_REPORT, { interactionSuite: section }, {
    command: 'suite',
    session,
    extra: { generatedFrom: 'live headless Chromium runs driven by tools/drive.mjs over file://' }
  });

  process.stdout.write(JSON.stringify({
    command: 'suite', reportPath: SUITE_REPORT, ...section
  }, null, 2) + '\n');

  const bad = exit.failed > 0 || exit.errors > 0 || exit.warnings > 0 ||
    section.driverConsoleErrors.length > 0 || section.driverConsoleWarnings.length > 0;
  return bad ? 1 : 0;
}

/* ------------------------------------------------------------------ matrix */

/* One chunk of the matrix, in a page of its own. `opts` is passed straight to PMXSuites.runMatrix. */
async function matrixChunk(session, label, opts, timeoutMs) {
  const { url, nav } = await openWorkspace(session, 'tests/runner.html');
  const nodesBefore = await session.eval('document.getElementsByTagName("*").length');
  await session.eval(
    `setTimeout(function () {
      window.PMXSuites.runMatrix(${JSON.stringify(opts)}).then(function (m) { window.__pmxMatrixExit = m; });
    }, 0), 1`
  );
  const result = await session.waitFor(
    'window.__pmxMatrixExit || null',
    { timeoutMs, intervalMs: 500, label: `window.__pmxMatrixExit (${label})` }
  );
  const nodesAfter = await session.eval('document.getElementsByTagName("*").length');
  return { url, nav, result, nodesBefore, nodesAfter };
}

async function cmdMatrix(session, flags) {
  /* The matrix mounts every window against every thread at all four canon widths — 256 runs — plus a
   * theme axis of 8 themes x 4 widths on two structural extremes, 64 more. 320 in total.
   *
   * It is run in CHUNKS, one per window plus one for the theme axis, each in a freshly navigated
   * page. That is not a stylistic choice. Run as one sweep in one page, the widened matrix took a
   * single Chromium to 12.8 GB resident and pushed a 22 GB host fully into swap — on the machine the
   * user had already had to restart once for exactly that. Every mounted composition stays reachable
   * from the runner's own result accumulation until the sweep resolves, so heap grows with the
   * TOTAL number of runs rather than with the widest one. Navigating between chunks discards each
   * chunk's heap outright, which bounds the sweep at one window's worth no matter how wide the matrix
   * later becomes. tests/suites.js also now yields to the event loop between runs so that GC and
   * paint can happen at all.
   *
   * --scope=w1 narrows it to one window for a quick check; the scope is written into the report so a
   * scoped run can never be read as a full one. */
  const timeoutMs = Number(flags.timeout || 1800000);
  const scope = flags.scope ? String(flags.scope) : null;
  const started = Date.now();

  /* The window ids come from the page, not from a list typed here — a hard-coded list is how a ninth
   * window would get silently left out of the sweep that is supposed to cover every window. */
  const probe = await openWorkspace(session, 'tests/runner.html');
  const windowIds = scope ? [scope] : await session.eval(
    `(function () {
      var seen = [], pairs = window.PMX.registry.pairs();
      for (var i = 0; i < pairs.length; i++) if (seen.indexOf(pairs[i].windowId) < 0) seen.push(pairs[i].windowId);
      return seen;
    })()`
  );

  const chunks = windowIds.map((w) => ({ label: w, opts: { windowId: w, skipThemes: true } }));
  /* The theme axis is global, so it runs once for the whole matrix rather than once per window — and
   * a scoped run must not silently claim it. */
  if (!scope) chunks.push({ label: 'themes', opts: { themesOnly: true } });

  process.stderr.write(`drive: matrix sweep started${scope ? ' (scope ' + scope + ')' : ''} — ` +
    `${chunks.length} chunks, each in its own page (budget ${Math.round(timeoutMs / 60000)} min total)\n`);

  const pairings = [];
  const themesSwept = [];
  let total = 0;
  let failed = 0;
  let errors = 0;
  let warnings = 0;
  let nodesBefore = probe.nav ? await session.eval('document.getElementsByTagName("*").length') : null;
  let nodesAfter = nodesBefore;
  let url = probe.url;
  let nav = probe.nav;

  for (const chunk of chunks) {
    const elapsed = Date.now() - started;
    const remaining = timeoutMs - elapsed;
    if (remaining <= 0) throw new Error(`matrix budget exhausted before chunk ${chunk.label}`);
    const done = await matrixChunk(session, chunk.label, chunk.opts, remaining);
    url = done.url;
    nav = done.nav;
    if (nodesBefore == null) nodesBefore = done.nodesBefore;
    nodesAfter = done.nodesAfter;
    const m = done.result;
    total += m.total || 0;
    failed += m.failed || 0;
    errors += m.errors || 0;
    warnings += m.warnings || 0;
    for (const p of m.pairings || []) pairings.push(p);
    for (const t of (m.themes && m.themes.swept) || []) themesSwept.push(t);
    process.stderr.write(`drive: matrix chunk ${chunk.label} — ` +
      `${(m.pairings || []).length + ((m.themes && m.themes.swept) || []).length} runs, ` +
      `${m.total} assertions, ${m.failed} failed\n`);
  }

  const matrix = { pairings, total, failed, errors, warnings, themes: { swept: themesSwept } };
  const durationMs = Date.now() - started;
  const byWindow = {};
  for (const p of pairings) {
    const w = String(p.pairing || '').split('+')[0] || 'unknown';
    if (!byWindow[w]) byWindow[w] = { runs: 0, assertions: 0, failed: 0 };
    byWindow[w].runs++;
    byWindow[w].assertions += p.total || 0;
    byWindow[w].failed += p.failed || 0;
  }

  const section = {
    url,
    loadedVia: nav.via,
    scope: scope || 'all windows',
    complete: !scope,
    chunks: chunks.map((c) => c.label),
    runs: pairings.length,
    /* The theme axis, reported separately and by name. Rolled into `runs` it would be invisible, and
     * the whole reason it exists is that themes were documented as covered while `ui.theme` appeared
     * zero times in the suite. A sweep that cannot show which themes it swept is the same claim
     * again. */
    themeAxis: {
      runs: themesSwept.length,
      themes: [...new Set(themesSwept.map((t) => t.theme))],
      pairings: [...new Set(themesSwept.map((t) => t.pairing))],
      widths: [...new Set(themesSwept.map((t) => t.width))].sort((a, b) => a - b),
      assertions: themesSwept.reduce((n, t) => n + (t.total || 0), 0),
      failed: themesSwept.reduce((n, t) => n + (t.failed || 0), 0),
      failing: themesSwept.filter((t) => t.failed > 0)
    },
    totalRuns: pairings.length + themesSwept.length,
    assertions: matrix.total,
    failed: matrix.failed,
    durationMs,
    msPerRun: (pairings.length + themesSwept.length)
      ? Math.round(durationMs / (pairings.length + themesSwept.length))
      : null,
    /* Node counts at the first chunk's start and the last chunk's end. Since each chunk now runs in
     * its own freshly navigated page, these two are NOT a measure of accumulation any more — they
     * are a check that a chunk boundary really did reset the document. A large `after` would mean a
     * navigation did not take. */
    domNodes: { firstChunkBefore: nodesBefore, lastChunkAfter: nodesAfter },
    pageConsoleErrorCount: matrix.errors,
    pageConsoleWarningCount: matrix.warnings,
    byWindow,
    failingPairings: pairings.filter((p) => p.failed > 0),
    ...summariseConsole(session)
  };

  writeReport(SUITE_REPORT, { matrix: section }, { command: 'matrix', session });
  process.stdout.write(JSON.stringify({ command: 'matrix', reportPath: SUITE_REPORT, ...section }, null, 2) + '\n');

  const bad = matrix.failed > 0 || matrix.errors > 0 || matrix.warnings > 0 ||
    section.driverConsoleErrors.length > 0 || section.driverConsoleWarnings.length > 0;
  return bad ? 1 : 0;
}

/* ------------------------------------------------------------------ triggers */

/* A cycle-safe structural digest of the store, installed in the page once and called twice per
 * trigger. It exists because "did this trigger do anything?" has to be answered by comparing state,
 * and JSON.stringify on the store is only safe by accident — the corpus is attached to the data
 * service rather than to the store today, and that could change. */
const STORE_DIGEST_INSTALL = `(function () {
  function ser(v, anc) {
    if (typeof v === 'function') return '"[fn]"';
    if (v === undefined) return '"[undef]"';
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (typeof v.nodeType === 'number') return '"[node]"';
    if (anc.indexOf(v) >= 0) return '"[cycle]"';
    anc.push(v);
    var out;
    if (Object.prototype.toString.call(v) === '[object Array]') {
      var a = [];
      for (var i = 0; i < v.length; i++) a.push(ser(v[i], anc));
      out = '[' + a.join(',') + ']';
    } else {
      var keys = Object.keys(v).sort();
      var b = [];
      for (var j = 0; j < keys.length; j++) b.push(JSON.stringify(keys[j]) + ':' + ser(v[keys[j]], anc));
      out = '{' + b.join(',') + '}';
    }
    anc.pop();
    return out;
  }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36) + ':' + s.length;
  }
  window.__pmxDriveState = {
    before: null,
    store: function () {
      var s = window.PMXWorkspace && window.PMXWorkspace.store;
      if (!s) return 'no-store';
      return hash(ser({ ui: s.get('ui'), session: s.get('session'), view: s.get('view') }, []));
    },
    dom: function () {
      var root = document.querySelector('.ws-root') || document.body;
      return root.getElementsByTagName('*').length + ':' + hash(root.innerHTML || '');
    }
  };
  return 1;
})()`;

async function cmdTriggers(session, flags) {
  /* stage.html, not index.html. Measured: the same 125 fires cost 8.4s here and 124s on the gallery,
   * because every fire notifies the store and every mounted composition re-renders — the gallery
   * mounts sixteen compositions, the stage mounts one. Nothing accumulates on either page; the
   * fifteenfold difference is fan-out, and it is the whole explanation for a sweep that once took
   * forty minutes. */
  const page = String(flags.page || 'stage.html');
  const { url, nav } = await openWorkspace(session, page);
  await session.eval(STORE_DIGEST_INSTALL);

  const vocabulary = await session.eval(`(function () {
    var d = window.PMXDemo;
    if (!d) return null;
    return {
      families: d.families(),
      aliases: d.aliases ? d.aliases() : {},
      distinct: d.distinctEvents ? d.distinctEvents() : []
    };
  })()`);
  if (!vocabulary) throw new Error(`PMXDemo is not present on ${url} — nothing to sweep`);

  const familyKeys = Object.keys(vocabulary.families);
  const aliasFamilies = vocabulary.aliases || {};
  const distinctSet = new Set(vocabulary.distinct || []);

  const flat = [];
  for (const family of familyKeys) {
    for (const event of vocabulary.families[family]) flat.push({ family, event, key: family + '.' + event });
  }

  const nodesAtStart = await session.eval('document.getElementsByTagName("*").length');
  const results = {};
  const records = [];   /* flat, in fire order, so the tallies below need no lookup by name */
  const failures = [];
  const timings = [];
  const startedAt = Date.now();

  for (const item of flat) {
    const t0 = Date.now();
    /* The reset lives in the same evaluate as the fire so no other work can land between them, and
     * the snapshot is taken AFTER the reset because reset itself bumps session.demo.generation —
     * comparing across it would call every trigger a change. */
    const measured = await session.eval(`(function () {
      window.PMXDemo.fire('system', 'reset');
      var st = window.__pmxDriveState;
      st.before = { store: st.store(), dom: st.dom() };
      var r = window.PMXDemo.fire(${JSON.stringify(item.family)}, ${JSON.stringify(item.event)});
      return {
        ok: !!(r && r.ok),
        reason: (r && r.reason) || null,
        storeChanged: st.store() !== st.before.store,
        domChangedSynchronously: st.dom() !== st.before.dom
      };
    })()`, { timeoutMs: 120000 });

    /* Then a frame, and measure the document again. Several concepts re-render on
     * requestAnimationFrame, so a digest taken in the same tick as the fire under-reports what the
     * trigger actually painted. Both numbers are kept: the synchronous one is strictly attributable
     * to the trigger, and the after-frame one also picks up anything a timer started in between —
     * which is why it is reported as a separate, looser measure rather than replacing the first. */
    await session.settle(250);
    const afterFrame = await session.eval(
      '(function () { var st = window.__pmxDriveState; return st.dom() !== st.before.dom; })()'
    );

    const ms = Date.now() - t0;
    timings.push({ key: item.key, ms });

    const record = {
      event: item.event,
      ok: measured.ok,
      reason: measured.reason,
      storeChanged: measured.storeChanged,
      /* The store is not the only place a trigger can land — the artifacts service keeps its own
       * subscribers — so the rendered document is measured too. An event that changes neither did
       * nothing observable. */
      domChangedSynchronously: measured.domChangedSynchronously,
      domChangedAfterFrame: afterFrame,
      distinctBehaviour: distinctSet.has(item.key),
      ms
    };
    if (aliasFamilies[item.family]) record.aliasOfFamily = aliasFamilies[item.family];
    if (!record.distinctBehaviour && !aliasFamilies[item.family]) record.aliasEvent = true;

    if (!results[item.family]) results[item.family] = [];
    results[item.family].push(record);
    records.push({ key: item.key, rec: record });
    if (!measured.ok) failures.push({ key: item.key, reason: measured.reason });
  }

  const nodesAtEnd = await session.eval('document.getElementsByTagName("*").length');
  const totalMs = Date.now() - startedAt;

  const distinctRecords = records.filter((a) => distinctSet.has(a.key));

  /* Packet-state coverage, computed from what actually fired rather than from the table above. Two
   * different things are reported per state and the difference is the point: `named` is what this
   * mapping claims, `firedOk` is what the sweep observed. A state whose events were all renamed
   * reads as 0 of N, not as covered. */
  const okKeys = new Set(records.filter((a) => a.rec.ok).map((a) => a.key));
  const allKeys = new Set(records.map((a) => a.key));
  const packetStates = PACKET_TRIGGER_STATES.map((s) => {
    const missing = s.events.filter((e) => !allKeys.has(e));
    const fired = s.events.filter((e) => okKeys.has(e));
    return {
      state: s.state,
      note: s.note || null,
      named: s.events.length,
      firedOk: fired.length,
      covered: fired.length > 0,
      events: s.events,
      /* An event named here that the Director no longer has. Not fatal on its own — a state stays
       * covered while any of its events survive — but it is the early warning that this table is
       * drifting away from the vocabulary it describes. */
      notInVocabulary: missing
    };
  });
  const uncoveredStates = packetStates.filter((s) => !s.covered).map((s) => s.state);
  const staleStateEvents = packetStates
    .filter((s) => s.notInVocabulary.length)
    .map((s) => ({ state: s.state, notInVocabulary: s.notInVocabulary }));
  for (const s of uncoveredStates) {
    failures.push({ key: 'packetState:' + s, reason: 'no trigger for a state CORRECTION_GOAL_PROMPT.md requires' });
  }
  const tally = (list) => ({
    fired: list.length,
    ok: list.filter((a) => a.rec.ok).length,
    failed: list.filter((a) => !a.rec.ok).length,
    storeChanged: list.filter((a) => a.rec.storeChanged).length,
    storeUnchanged: list.filter((a) => !a.rec.storeChanged).length,
    domChangedSynchronously: list.filter((a) => a.rec.domChangedSynchronously).length,
    domChangedAfterFrame: list.filter((a) => a.rec.domChangedAfterFrame).length,
    inertNeitherStoreNorDom: list.filter((a) => !a.rec.storeChanged && !a.rec.domChangedAfterFrame).length
  });

  const section = {
    generatedBy: 'node tools/drive.mjs triggers',
    generatedAt: new Date().toISOString(),
    page: url,
    loadedVia: nav.via,
    viewport: { width: Number(flags.width || DEFAULT_WIDTH), height: Number(flags.height || DEFAULT_HEIGHT) },
    method:
      'One headless Chromium, one page load of stage.html (a SINGLE mounted composition), ' +
      "PMXDemo.fire('system','reset') immediately before every trigger so each is measured from one " +
      'known state. A structural digest of the store and of the rendered document is taken after the ' +
      'reset, again in the same tick as the trigger (strictly attributable to it), and again after a ' +
      'painted frame (which also catches rendering the concepts defer to requestAnimationFrame).',
    /* BOTH numbers, and which is which. PMXDemo.families() returns one key per NAME, and `subagent`
     * is a second name for `agent` — the same object, reached twice. Counting family keys therefore
     * reports one family and one whole event list that do not independently exist. */
    vocabulary: {
      familyKeys: familyKeys.length,
      familyKeyNames: familyKeys,
      aliasFamilies,
      distinctFamilies: familyKeys.length - Object.keys(aliasFamilies).length,
      eventsAcrossFamilyKeys: flat.length,
      eventsAcrossFamilyKeysNote:
        'RAW count: every family key times its own event list. Inflated, because the subagent alias ' +
        'family is counted a second time and three thread events plus one agent event are second ' +
        'names bound to the same function.',
      distinctBehaviours: distinctSet.size,
      distinctBehavioursNote:
        'PMXDemo.distinctEvents(): alias families dropped and alias event names folded onto the one ' +
        'function they share. This is the number of things the Director can actually do.'
    },
    totalsRaw: tally(records),
    totalsDistinct: tally(distinctRecords),
    /* The packet's fourteen required states, mapped to this workspace's vocabulary and then checked
     * against the sweep. See PACKET_TRIGGER_STATES for why the mapping has to be written down. */
    packetStates: {
      required: PACKET_TRIGGER_STATES.length,
      covered: packetStates.filter((s) => s.covered).length,
      uncovered: uncoveredStates,
      staleStateEvents,
      source: 'CORRECTION_GOAL_PROMPT.md — "deterministic demo triggers cover question, Goal, Todo, ' +
        'child, activity, diff, artifact, approval, thread, collision, offline/replay, BSD, ' +
        'attachment, and recovery states"',
      byState: packetStates
    },
    failures,
    timing: {
      totalMs,
      msPerTrigger: Math.round(totalMs / (flat.length || 1)),
      slowest: timings.slice().sort((a, b) => b.ms - a.ms).slice(0, 8)
    },
    /* Recorded so the "the sweep slows down because state accumulates" theory can be checked rather
     * than repeated. On stage.html these two numbers are within a few dozen of each other. */
    domNodes: { atStart: nodesAtStart, atEnd: nodesAtEnd },
    families: results,
    ...summariseConsole(session)
  };

  try {
    writeFileSync(TRIGGER_REPORT, JSON.stringify(section, null, 2) + '\n');
  } catch (err) {
    throw new Error(`cannot write ${TRIGGER_REPORT}: ${err.message}`);
  }

  process.stdout.write(JSON.stringify({
    command: 'triggers',
    reportPath: TRIGGER_REPORT,
    vocabulary: section.vocabulary,
    totalsRaw: section.totalsRaw,
    totalsDistinct: section.totalsDistinct,
    packetStates: {
      required: section.packetStates.required,
      covered: section.packetStates.covered,
      uncovered: section.packetStates.uncovered,
      staleStateEvents: section.packetStates.staleStateEvents
    },
    failures: section.failures,
    timing: section.timing,
    domNodes: section.domNodes,
    driverConsoleErrors: section.driverConsoleErrors,
    driverConsoleWarnings: section.driverConsoleWarnings
  }, null, 2) + '\n');

  const bad = failures.length > 0 || section.driverConsoleErrors.length > 0 ||
    section.driverConsoleWarnings.length > 0;
  return bad ? 1 : 0;
}

/* ------------------------------------------------------------------ activity */

/* The sampler is installed once per page load and called per beat, rather than being sent as a four
 * kilobyte expression seventy-two times. Everything it reads is DOM or geometry: this command exists
 * because a report claimed motion that the document never performed, so the state the services hold
 * is reported SIDE BY SIDE with what rendered, never instead of it. */
const ACTIVITY_SAMPLER_INSTALL = `(function () {
  function tid() { return window.PMXWorkspace.store.get('session.activeThreadId'); }

  function classOf(el) { return (el && el.getAttribute && el.getAttribute('class')) || ''; }

  /* The chain container carries the shared 'pmx-chain' class in every concept that implements the
   * run capsule; the capsule around it is the concept's own tN-run element. */
  function chainEl() { return document.querySelector('.pmx-chain'); }

  function capsuleEl() {
    var c = chainEl();
    if (!c) return null;
    var el = c.parentElement;
    for (var i = 0; i < 5 && el && el !== document.body; i++) {
      if (/(^|\\s)t\\d+-run(\\s|$)/.test(classOf(el))) return el;
      el = el.parentElement;
    }
    return c.parentElement;
  }

  /* The SENTENCE ROW: the single element a concept uses as its run headline, where it has one.
   *
   * This is deliberately narrow and deliberately NOT the thing the pass/fail question is asked of.
   * Two concepts have no header row at all — t2 puts the sentence on the subject phase's own chip
   * and blanks the others, t8 keeps its line about the RUN and puts the opened phase in a footnote —
   * so a narrow read answers "which element carries the sentence", not "does the capsule say it". */
  function sentenceRowEl() {
    var cap = capsuleEl();
    var scope = cap || document;
    var head = scope.querySelector('[class*="run-head"]');
    if (head) return { el: head, via: 'run-head' };
    var sentence = scope.querySelector('[class*="run-sentence"]');
    if (sentence) return { el: sentence, via: 'run-sentence' };
    var verb = scope.querySelector('[class*="run-verb"]');
    if (verb && verb.parentElement) return { el: verb.parentElement, via: 'parent of run-verb' };
    return { el: null, via: null };
  }

  /* The CAPSULE read is the one the verdict uses, matching the suite's own shows() helper. Asking whether
   * the reader can see the phase's headline is a question about the capsule, because the capsule is
   * what the reader is looking at. Narrowing it to one element asked instead "did this concept
   * choose the same element as the others", which is a different question and not a defect. */
  function headerEl() {
    var cap = capsuleEl();
    if (cap) return { el: cap, via: 'capsule' };
    return sentenceRowEl();
  }

  function pathsOf(svg) {
    if (!svg) return '';
    var ps = svg.querySelectorAll('path');
    var out = [];
    for (var i = 0; i < ps.length; i++) out.push(ps[i].getAttribute('d'));
    return out.join(' ');
  }

  var CHEV_UP = window.PMXIcons && window.PMXIcons.has('chevron-up') ? pathsOf(window.PMXIcons.get('chevron-up', 12)) : null;
  var CHEV_DOWN = window.PMXIcons && window.PMXIcons.has('chevron-down') ? pathsOf(window.PMXIcons.get('chevron-down', 12)) : null;

  /* No icon in this build carries its own name in the DOM, so direction is read from the rendered
   * path geometry and compared against a freshly built reference glyph. Concepts that use a text
   * marker instead of an svg (t4 uses + and the minus sign) report that text verbatim. */
  function chevron() {
    var cap = capsuleEl();
    if (!cap) return { present: false, direction: null, source: null };
    var host = cap.querySelector('[class*="chevron"]');
    if (!host) return { present: false, direction: null, source: null };
    var svg = host.querySelector('svg');
    if (!svg) {
      var t = (host.textContent || '').trim();
      return { present: true, direction: t || null, source: 'text' };
    }
    var d = pathsOf(svg);
    var dir = d === CHEV_UP ? 'up' : (d === CHEV_DOWN ? 'down' : 'unrecognised');
    return { present: true, direction: dir, source: 'svg path', d: dir === 'unrecognised' ? d : undefined };
  }

  function rect(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top * 100) / 100,
      left: Math.round(r.left * 100) / 100,
      width: Math.round(r.width * 100) / 100,
      height: Math.round(r.height * 100) / 100,
      pageTop: Math.round((r.top + window.scrollY) * 100) / 100
    };
  }

  function runState() {
    var t = tid();
    var rt = window.PMXRunTrace;
    if (!rt || !rt.read) return null;
    var run = rt.read(t);
    if (!run) return null;
    return {
      chain: run.chain.map(function (p) {
        return { id: p.id, kind: p.kind, status: p.status, count: p.count, headline: p.headline };
      }),
      openId: run.openId || null,
      condensed: !!run.condensed,
      summaryLabel: run.summaryLabel,
      signature: rt.signature ? rt.signature(run) : null
    };
  }

  /* ---- the handover ORDER probe -----------------------------------------------------------
   *
   * 03_compact_execution_activity.mov f.194-211 is explicit that a phase handover has an ORDER: the
   * outgoing sentence lets go FIRST and the new glyph arrives SECOND. Only t2 and t4 play the literal
   * lateral push the reference uses; the other six express the same order in their own geometry, on
   * purpose. A probe that looked for the push would therefore report six deliberate decisions as
   * defects, which is the same mistake the sentence-row read below already refuses to make. This one
   * measures the order and nothing about the geometry.
   *
   * It reads that order off the MUTATION RECORD SEQUENCE rather than off the clock. A MutationObserver
   * delivers records in the order the mutations happened, including many of them inside one task, so
   * "the sentence let go before the glyph arrived" becomes two indices into a single ordered list.
   * That is a causal fact about the document rather than a race between two samples.
   *
   * The per-frame samples are kept beside it because DOM order and TEMPORAL order are two different
   * questions: a concept that rebuilds the whole row in one task satisfies the first and not the
   * second, and the difference is precisely what a reader would or would not see. Both are reported.
   */
  function norm(s) { return String(s == null ? '' : s).replace(/\\s+/g, ' ').trim(); }

  /* Membership is tested by walking UP from the record's own target instead of asking the live tree,
   * because by the time an observer callback runs the DOM is already in its end state: a node that was
   * inserted and then moved would answer for where it ended up rather than for where it went. */
  function underClass(node, re) {
    var el = node && node.nodeType === 1 ? node : (node ? node.parentElement : null);
    while (el) {
      if (re.test(classOf(el))) return true;
      el = el.parentElement;
    }
    return false;
  }
  var CHAIN_RE = /(^|\\s)pmx-chain(\\s|$)/;
  var CAPSULE_RE = /(^|\\s)t\\d+-run(\\s|$)/;

  var probe = null;

  window.__pmxDrive = {
    threadId: tid,

    sample: function () {
      var chain = chainEl();
      var cap = capsuleEl();
      var head = headerEl();
      var verb = cap ? cap.querySelector('[class*="run-verb"]') : null;
      var arg = cap ? cap.querySelector('[class*="run-arg"]') : null;
      var glyphs = chain ? chain.querySelectorAll('button') : [];
      var kinds = [];
      for (var i = 0; i < glyphs.length; i++) kinds.push(glyphs[i].getAttribute('data-kind'));
      var state = runState();

      return {
        chainPresent: !!chain,
        capsuleClass: cap ? classOf(cap) : null,
        /* THE measurement this command exists for: how many glyphs are in the document, next to how
         * many phases the service says have been entered. */
        glyphCount: glyphs.length,
        glyphKinds: kinds,
        slotCount: chain ? chain.querySelectorAll('.pmx-chain-slot').length : 0,
        stateChainLength: state ? state.chain.length : null,
        glyphCountMatchesState: state ? glyphs.length === state.chain.length : null,

        headerVia: head.via,
        headerClass: head.el ? classOf(head.el) : null,
        headerText: head.el ? (head.el.textContent || '') : null,
        headerVerb: verb ? verb.textContent : null,
        headerArg: arg ? arg.textContent : null,
        headerRect: rect(head.el),

        chevron: chevron(),
        capsuleRect: rect(cap),
        scrollY: window.scrollY,
        state: state
      };
    },

    /* Wait until the headline stops changing, then say how long that took.
     *
     * The count is ANIMATED — motion.countMorph moves the digits rather than replacing the label —
     * so a sample taken two frames after the trigger catches the tally mid-flight. That is not noise
     * to be slept away: the difference between the text at the frame and the text once it settles is
     * the morph, and a driver that only ever reported one of the two could not tell a running tally
     * from a line that was replaced. Both are recorded; this returns the settled half. */
    /* The sentence row read once, at rest. It does not need its own settle loop: settleHeader has
     * already waited for the capsule to stop changing, and the sentence row is inside the capsule. */
    sentenceRow: function () {
      var found = sentenceRowEl();
      if (!found.el) return { via: null, text: null };
      return { via: found.via, text: found.el.textContent || '' };
    },

    settleHeader: function (capMs, quietMs) {
      var quiet = quietMs || 220;
      return new Promise(function (resolve) {
        var now = function () { return (window.performance || Date).now(); };
        var start = now();
        var lastChangeAt = start;
        var last = null;
        var frames = 0;
        function read() {
          var h = headerEl().el;
          return h ? (h.textContent || '') : null;
        }
        function tick() {
          frames++;
          var t = read();
          if (t !== last) { last = t; lastChangeAt = now(); }
          var elapsed = now() - start;
          /* Quiet TIME, not quiet frames. A digit tween holds each intermediate value for a few
           * frames, so "unchanged for three frames" settles on a plateau in the middle of the
           * animation and reports a number the run never finished on. */
          var quietFor = now() - lastChangeAt;
          if ((quietFor >= quiet && frames > 2) || elapsed > capMs) {
            resolve({ text: t, ms: Math.round(elapsed), frames: frames, settled: quietFor >= quiet });
            return;
          }
          window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    },

    /* Where glyph n actually is, and whether a click at that point would reach it. Hit testing is
     * the assertion: a glyph scrolled out of its own chain, or under an overlay, is not a control. */
    glyphTarget: function (n) {
      var chain = chainEl();
      if (!chain) return null;
      var btns = chain.querySelectorAll('button');
      if (n >= btns.length) return null;
      var b = btns[n];
      var r = b.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var hit = document.elementFromPoint(cx, cy);
      var state = runState();
      return {
        index: n,
        x: Math.round(cx * 100) / 100,
        y: Math.round(cy * 100) / 100,
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        inViewport: r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0 &&
                    r.bottom <= window.innerHeight && r.right <= window.innerWidth,
        hitTestReachesGlyph: !!hit && (hit === b || b.contains(hit)),
        hitTestLanded: hit ? (hit.tagName.toLowerCase() + (classOf(hit) ? '.' + classOf(hit) : '')) : null,
        expectedPhaseId: state && state.chain[n] ? state.chain[n].id : null,
        /* The phase's own headline, which is what the capsule must read once this glyph opens it.
         * The glyph's aria-label is NOT the reference: every concept decorates it differently
         * ("Step 2, Read 7 files", "2. Read 7 files — finished"), so comparing against it would
         * report a concept's labelling style as a defect. */
        expectedHeadline: state && state.chain[n] ? state.chain[n].headline : null,
        label: b.getAttribute('aria-label')
      };
    },

    /* Fallback path, used and REPORTED as used when hit testing says a real click cannot land. */
    clickGlyphDirect: function (n) {
      var chain = chainEl();
      if (!chain) return false;
      var btns = chain.querySelectorAll('button');
      if (n >= btns.length) return false;
      btns[n].click();
      return true;
    },

    openId: function () {
      var s = runState();
      return s ? s.openId : null;
    },

    /* handoverStart(family, event) — arm the order probe, then fire, in ONE page-side call.
     *
     * One call because arming over one CDP round trip and firing over the next would put the driver's
     * own latency inside the window it is trying to measure. The Director's own result is returned
     * UNCHANGED, so a caller that already handles a refused trigger keeps handling it the same way,
     * and the recording happens in the background so the caller's two-frame sample still lands two
     * frames after the trigger rather than after this probe. */
    handoverStart: function (family, event) {
      var chain0 = chainEl();
      var cap0 = capsuleEl();
      var found = sentenceRowEl();

      /* The thread root is the scope: it survives every re-render inside it, where the capsule and the
       * chain are both things a concept is entitled to replace during the very beat being measured. */
      var scope = null;
      var node = chain0 || cap0;
      while (node && node !== document.body) {
        if (node.getAttribute && node.getAttribute('data-pmx-thread') !== null) { scope = node; break; }
        node = node.parentElement;
      }
      if (!scope) scope = document.body;

      var st = {
        sentenceEl: found.el,
        sentenceVia: found.via,
        outgoing: norm(found.el ? found.el.textContent : (cap0 ? cap0.textContent : '')),
        glyphsBefore: chain0 ? chain0.querySelectorAll('button').length : 0,
        seq: 0, letGo: null, glyphIn: null, frames: [], stopped: false, mo: null
      };

      /* Where the sentence lives relative to the chain decides which records are noise. One concept
       * puts its sentence ON the subject phase's own chip, which is INSIDE the chain, so excluding
       * chain-internal records outright would make that concept the one the probe cannot read. The
       * exclusion is therefore conditional: chain mutations are noise only when the sentence is not
       * itself in the chain. */
      var sentenceInChain = !!st.sentenceEl && underClass(st.sentenceEl, CHAIN_RE);

      function underSentence(target) {
        return !!st.sentenceEl && (target === st.sentenceEl || st.sentenceEl.contains(target));
      }
      function removesSentence(r) {
        if (!st.sentenceEl) return false;
        for (var i = 0; i < r.removedNodes.length; i++) {
          var n = r.removedNodes[i];
          if (n === st.sentenceEl || (n.contains && n.contains(st.sentenceEl))) return true;
        }
        return false;
      }
      /* The glyph arrives one of two ways and both count. It is appended into a chain that was already
       * there, or the whole capsule is rebuilt and the glyph arrives inside the new subtree — in which
       * case the record's target is ABOVE the chain and a test that only looked downward from the
       * chain would report that no glyph ever appeared, which is what the first run of this probe did
       * for one concept whose frame samples plainly showed the count going up. */
      function addsGlyph(r, inChain) {
        for (var i = 0; i < r.addedNodes.length; i++) {
          var n = r.addedNodes[i];
          if (n.nodeType !== 1) continue;
          if (inChain && (n.tagName === 'BUTTON' || (n.querySelector && n.querySelector('button')))) return 'a glyph button was added inside .pmx-chain';
          if (n.matches && n.matches('.pmx-chain') && n.querySelector('button')) return 'a rebuilt chain arrived carrying its glyphs';
          if (n.querySelector && n.querySelector('.pmx-chain button')) return 'a rebuilt subtree arrived carrying the chain and its glyphs';
        }
        return null;
      }

      st.classify = function (recs) {
        for (var i = 0; i < recs.length; i++) {
          var r = recs[i];
          st.seq++;
          var inChain = underClass(r.target, CHAIN_RE);

          /* THE NEW GLYPH: an element carrying a glyph button becoming present. */
          if (st.glyphIn === null && r.type === 'childList') {
            var how = addsGlyph(r, inChain);
            if (how) st.glyphIn = { seq: st.seq, via: how };
          }
          if (st.letGo !== null) continue;
          if (inChain && !sentenceInChain) continue;

          /* THE SENTENCE LETTING GO, in the three shapes the eight concepts write it: the row's text
           * is rewritten, the row is rebuilt or removed, or the row is faded by a style write - which
           * is what motion.swapText does first and what motion.phaseHandover's whole first beat is.
           * Attribute writes count only on the ROW ITSELF; anywhere else they are rendering noise. */
          if (r.type === 'characterData' && underSentence(r.target)) {
            st.letGo = { seq: st.seq, via: 'the sentence row text was rewritten' };
          } else if (r.type === 'childList' && (underSentence(r.target) || removesSentence(r))) {
            st.letGo = { seq: st.seq, via: 'the sentence row was rebuilt or removed' };
          } else if (r.type === 'attributes' && st.sentenceEl && r.target === st.sentenceEl) {
            st.letGo = { seq: st.seq, via: 'a ' + r.attributeName + ' write on the sentence row itself' };
          } else if (!st.sentenceEl && !inChain && r.type !== 'attributes' && underClass(r.target, CAPSULE_RE)) {
            /* Two concepts have no header row at all. For those the capsule outside the chain is the
             * only place the outgoing sentence can live, so it is read there and SAID to have been
             * read there, rather than the concept being scored as having no sentence. */
            st.letGo = { seq: st.seq, via: 'capsule content outside the chain changed (no sentence row in this concept)' };
          }
        }
      };

      st.mo = new MutationObserver(st.classify);
      st.mo.observe(scope, {
        subtree: true, childList: true, attributes: true, characterData: true,
        attributeOldValue: true, characterDataOldValue: true
      });

      var clock = window.performance || Date;
      var t0 = clock.now();
      function tick() {
        if (st.stopped) return;
        var f = sentenceRowEl();
        var cap = capsuleEl();
        var chain = chainEl();
        st.frames.push({
          t: Math.round(clock.now() - t0),
          sentence: f.el ? norm(f.el.textContent) : null,
          /* Opacity matters as much as text: motion.swapText fades the row to zero and only replaces
           * the words two frames later, so a reading by text alone would date the let-go two frames
           * late and could invert the order it is measuring. */
          opacity: f.el ? Number(window.getComputedStyle(f.el).opacity) : null,
          capsule: cap ? norm(cap.textContent) : null,
          glyphs: chain ? chain.querySelectorAll('button').length : 0
        });
        if (st.frames.length >= 45) { st.stopped = true; return; }
        window.requestAnimationFrame(tick);
      }
      window.requestAnimationFrame(tick);

      probe = st;
      return window.PMXDemo.fire(family, event);
    },

    /* Stop the probe and hand back only primitives — the observer, the scope and the sentence element
     * stay on this side of the bridge, because a DOM node cannot cross it and trying is how a probe
     * starts returning empty objects instead of measurements. */
    handoverCollect: function () {
      var st = probe;
      probe = null;
      if (!st) return null;
      if (st.mo) { st.classify(st.mo.takeRecords()); st.mo.disconnect(); }
      st.stopped = true;
      return {
        armed: true,
        sentenceVia: st.sentenceVia,
        outgoing: st.outgoing,
        glyphsBefore: st.glyphsBefore,
        recordsSeen: st.seq,
        letGoSeq: st.letGo ? st.letGo.seq : null,
        letGoVia: st.letGo ? st.letGo.via : null,
        glyphSeq: st.glyphIn ? st.glyphIn.seq : null,
        glyphVia: st.glyphIn ? st.glyphIn.via : null,
        frames: st.frames
      };
    }
  };
  return 1;
})()`;

const ACTIVITY_BEATS = [
  { name: 'reset', fire: null },
  { name: 'thinking_summary', fire: ['activity', 'thinking_summary'] },
  { name: 'read-1', fire: ['activity', 'read'] },
  { name: 'read-2', fire: ['activity', 'read'] },
  { name: 'read-3', fire: ['activity', 'read'] },
  { name: 'settle-1', fire: ['activity', 'settle'] },
  { name: 'edit', fire: ['activity', 'edit'] },
  { name: 'settle-2', fire: ['activity', 'settle'] },
  { name: 'condense', fire: ['activity', 'condense'] }
];

async function cmdActivity(session, flags) {
  const page = String(flags.page || 'stage.html');
  const windowId = String(flags.window || 'w1');
  const viewport = {
    width: Number(flags.width || DEFAULT_WIDTH),
    height: Number(flags.height || DEFAULT_HEIGHT)
  };
  const { url, nav } = await openWorkspace(session, page);
  const evidenceDir = join(CONCEPT_DIR, 'evidence');
  mkdirSync(evidenceDir, { recursive: true });

  const concepts = [];
  for (let n = 1; n <= 8; n++) concepts.push('t' + n);

  const perConcept = [];

  for (const conceptId of concepts) {
    await session.eval(`window.PMXWorkspace.setPairing(${JSON.stringify(windowId)}, ${JSON.stringify(conceptId)}), 1`);
    await session.settle();
    /* Installed after every remount because the page is never reloaded between concepts; the helper
     * closes over nothing that a remount invalidates, but reinstalling is cheap and removes the
     * question. */
    await session.eval(ACTIVITY_SAMPLER_INSTALL);

    /* Reset first, then clear the question. A fresh reset leaves a questionnaire pending on
     * thread-01, and every concept's surface strip yields the whole region to a pending question —
     * which means the run capsule is not in the document at all and every sample below would read
     * zero glyphs for a reason that has nothing to do with the activity chain. Cancelling is a
     * PRECONDITION of the scripted run, not part of it, and it is recorded as one. */
    const precondition = await session.eval(`(function () {
      var r0 = window.PMXDemo.fire('system', 'reset');
      var r1 = window.PMXDemo.fire('question', 'cancel');
      return { reset: !!(r0 && r0.ok), questionCancelled: !!(r1 && r1.ok) };
    })()`);
    await session.settle();

    const beats = [];
    let previous = await session.eval('window.__pmxDrive.sample()');

    for (let i = 0; i < ACTIVITY_BEATS.length; i++) {
      const beat = ACTIVITY_BEATS[i];
      const before = previous;
      let fireResult = { ok: true, note: 'baseline, nothing fired' };
      if (beat.fire) {
        /* The trigger goes through handoverStart, which arms the order probe and fires in the same
         * page-side call and returns the Director's result unchanged. Everything below therefore reads
         * exactly as it did before this probe existed, including the two-frame sample: the probe
         * records on its own animation frames rather than making the caller wait for it. */
        fireResult = JSON.parse(await session.eval(
          `JSON.stringify(window.__pmxDrive.handoverStart(${JSON.stringify(beat.fire[0])}, ${JSON.stringify(beat.fire[1])}))`
        ));
      }
      await session.settle();
      /* Two samples per beat: one two frames after the trigger, one after the headline stops moving.
       * The pair is what proves the count was morphed rather than swapped. */
      const atFrame = await session.eval('window.__pmxDrive.sample()');
      const headerSettle = await session.eval('window.__pmxDrive.settleHeader(1200)');
      const after = await session.eval('window.__pmxDrive.sample()');
      /* Collected after the settle so the whole beat is inside the recording window, and before the
       * screenshot so a slow capture cannot be mistaken for a slow handover. */
      const handoverRaw = beat.fire ? await session.eval('window.__pmxDrive.handoverCollect()') : null;

      const shot = await captureBeat(session, evidenceDir, conceptId, i, beat.name, after, viewport);

      const sigBefore = before.state ? before.state.signature : null;
      const sigAfter = after.state ? after.state.signature : null;
      const countBefore = lastCount(before.state);
      const countAfter = lastCount(after.state);
      /* A HANDOVER is a beat that entered a new phase while a previous one was already on the chain.
       * The first phase of a run enters against nothing, so it has no outgoing sentence to let go and
       * is not one. */
      const newPhaseEntered = before.stateChainLength != null && after.stateChainLength != null &&
        after.stateChainLength > before.stateChainLength;
      const handover = analyseHandover(handoverRaw, newPhaseEntered);

      beats.push({
        beat: beat.name,
        index: i,
        fired: beat.fire ? beat.fire.join('.') : null,
        fireOk: !!fireResult.ok,
        fireReason: fireResult.reason || null,
        glyphCount: after.glyphCount,
        glyphKinds: after.glyphKinds,
        stateChainLength: after.stateChainLength,
        glyphCountMatchesState: after.glyphCountMatchesState,
        headerText: after.headerText,
        /* The headline two frames in, before the digits finished moving. When this differs from
         * headerText the count was animated in place; when they are equal the label was swapped. */
        headerTextAtFrame: atFrame.headerText,
        headerSettleMs: headerSettle ? headerSettle.ms : null,
        headerSettledWithinCap: headerSettle ? headerSettle.settled : null,
        headerVerb: after.headerVerb,
        headerArg: after.headerArg,
        headerVia: after.headerVia,
        /* Before and after the beat, in viewport coordinates plus page coordinates, so a change can
         * be told apart from the page having scrolled underneath it. The mid-flight top is kept as
         * well: a row that ends where it started but jumped in between still moved. */
        headerTopBefore: before.headerRect ? before.headerRect.top : null,
        headerTopAfter: after.headerRect ? after.headerRect.top : null,
        headerTopAtFrame: atFrame.headerRect ? atFrame.headerRect.top : null,
        headerPageTopBefore: before.headerRect ? before.headerRect.pageTop : null,
        headerPageTopAfter: after.headerRect ? after.headerRect.pageTop : null,
        headerMovedPx: (before.headerRect && after.headerRect)
          ? Math.round((after.headerRect.pageTop - before.headerRect.pageTop) * 100) / 100
          : null,
        headerMovedMidFlightPx: (before.headerRect && atFrame.headerRect)
          ? Math.round((atFrame.headerRect.pageTop - before.headerRect.pageTop) * 100) / 100
          : null,
        /* A count tick is a beat that left the run's STRUCTURE alone and changed only a number. That
         * is the case in which the headline must be rewritten in place, so the header row must not
         * move. Any other beat is allowed to move it. */
        countTick: !!(sigBefore && sigAfter && sigBefore === sigAfter && countBefore !== countAfter),
        countBefore,
        countAfter,
        chevron: after.chevron,
        condensed: after.state ? after.state.condensed : null,
        openId: after.state ? after.state.openId : null,
        summaryLabel: after.state ? after.state.summaryLabel : null,
        newPhaseEntered,
        handover,
        evidence: shot
      });

      previous = after;
    }

    /* Random access: click each glyph in turn and ask the service which phase is open. This is the
     * glyph chain's entire justification, so it is measured per index rather than once. */
    const glyphProbes = [];
    const finalSample = previous;
    for (let n = 0; n < finalSample.glyphCount; n++) {
      const target = await session.eval(`window.__pmxDrive.glyphTarget(${n})`);
      if (!target) break;
      let via = 'dispatched mouse click at the glyph centre';
      if (target.inViewport && target.hitTestReachesGlyph) {
        await session.clickAt(target.x, target.y);
      } else {
        /* Recorded, not hidden: a glyph a real click cannot reach is a finding about the concept. */
        await session.eval(`window.__pmxDrive.clickGlyphDirect(${n})`);
        via = target.inViewport
          ? 'element.click() — a real click at the glyph centre would have hit ' + target.hitTestLanded
          : 'element.click() — the glyph is outside the viewport';
      }
      await session.settle();
      const openId = await session.eval('window.__pmxDrive.openId()');
      /* Which phase opened is only half of it. The glyph is a claim that THAT phase's work is what
       * you are about to read, so the headline the capsule then shows is the other half — a chain
       * that opens the right record under the wrong sentence has not done its job. */
      const settledAfterClick = await session.eval('window.__pmxDrive.settleHeader(1200)');
      const sentenceAfterClick = await session.eval('window.__pmxDrive.sentenceRow()');
      glyphProbes.push({
        index: n,
        label: target.label,
        expectedPhaseId: target.expectedPhaseId,
        openedPhaseId: openId,
        reopensItsOwnPhase: !!target.expectedPhaseId && openId === target.expectedPhaseId,
        headerTextAfterClick: settledAfterClick ? settledAfterClick.text : null,
        expectedHeadline: target.expectedHeadline,
        /* Whitespace is stripped from both sides because every concept splits the headline across
         * its own spans, so "Read 7 files" renders as "Read7 files" in one and "Read 7 files" in
         * another. The words and their order are the assertion; the gaps between them are layout. */
        headerReadsThePhase: !!(settledAfterClick && target.expectedHeadline &&
          String(settledAfterClick.text || '').replace(/\s+/g, '')
            .indexOf(String(target.expectedHeadline).replace(/\s+/g, '')) >= 0),
        /* Recorded SEPARATELY from the verdict above, so widening the capsule read cannot silently
         * forgive a concept whose sentence row does not follow the click. t8 reports false here by
         * design — it states at threads/t8-reading-mode.js:566-573 that its line describes the run
         * while its footnote describes the opened phase, "and neither restates the other". That is a
         * per-concept difference worth keeping visible, not a failure. */
        sentenceRow: sentenceAfterClick ? sentenceAfterClick.via : null,
        sentenceRowText: sentenceAfterClick ? sentenceAfterClick.text : null,
        sentenceRowFollowsOpenPhase: !!(sentenceAfterClick && target.expectedHeadline &&
          String(sentenceAfterClick.text || '').replace(/\s+/g, '')
            .indexOf(String(target.expectedHeadline).replace(/\s+/g, '')) >= 0),
        clickVia: via,
        inViewport: target.inViewport,
        hitTestReachesGlyph: target.hitTestReachesGlyph,
        hitTestLanded: target.hitTestLanded,
        glyphSize: { width: target.width, height: target.height }
      });
    }

    const countTicks = beats.filter((b) => b.countTick);
    const handovers = beats.filter((b) => b.handover && b.handover.isHandover);
    perConcept.push({
      concept: conceptId,
      hostWindow: windowId,
      precondition,
      chainRendered: finalSample.chainPresent,
      capsuleClass: finalSample.capsuleClass,
      beats,
      countTicks: countTicks.map((b) => ({
        beat: b.beat,
        countBefore: b.countBefore,
        countAfter: b.countAfter,
        headerTextAtFrame: b.headerTextAtFrame,
        headerTextSettled: b.headerText,
        digitsAnimated: b.headerTextAtFrame !== b.headerText,
        headerPageTopBefore: b.headerPageTopBefore,
        headerPageTopAfter: b.headerPageTopAfter,
        headerHeldStill: b.headerMovedPx === 0 && b.headerMovedMidFlightPx === 0
      })),
      handovers: handovers.map((b) => ({
        beat: b.beat,
        outgoing: b.handover.outgoing,
        sentenceVia: b.handover.sentenceVia,
        letGoSeq: b.handover.letGoSeq,
        letGoVia: b.handover.letGoVia,
        glyphSeq: b.handover.glyphSeq,
        glyphVia: b.handover.glyphVia,
        clearsBeforeNewGlyph: b.handover.clearsBeforeNewGlyph,
        clearedAtFrame: b.handover.clearedAtFrame,
        newGlyphAtFrame: b.handover.newGlyphAtFrame,
        framesBetween: b.handover.framesBetween,
        orderVisibleAcrossFrames: b.handover.orderVisibleAcrossFrames
      })),
      glyphProbes,
      verdict: {
        chainRendered: finalSample.chainPresent,
        glyphCountMatchedStateEveryBeat: beats.every((b) => b.glyphCountMatchesState !== false),
        headerHeldStillOnEveryCountTick: countTicks.length > 0 &&
          countTicks.every((b) => b.headerMovedPx === 0 && b.headerMovedMidFlightPx === 0),
        countTicksObserved: countTicks.length,
        everyGlyphReopensItsPhase: glyphProbes.length > 0 && glyphProbes.every((g) => g.reopensItsOwnPhase),
        everyGlyphOpensToItsOwnHeadline: glyphProbes.length > 0 &&
          glyphProbes.every((g) => g.headerReadsThePhase),
        /* Reported, never folded into the pass/fail above. A concept whose sentence row does not
         * follow the click has made a design choice, and the choice is worth seeing; a concept whose
         * CAPSULE does not show the phase has a defect. Keeping them apart is the difference between
         * measuring a product and measuring conformity to one concept's layout. */
        sentenceRowFollowsOpenPhase: glyphProbes.length > 0 &&
          glyphProbes.every((g) => g.sentenceRowFollowsOpenPhase),
        sentenceRowVia: glyphProbes.length ? glyphProbes[0].sentenceRow : null,
        glyphsProbed: glyphProbes.length,

        /* THE HANDOVER ORDER. Recorded here and deliberately left out of the exit gate at the bottom
         * of this command; the reasoning is written out there rather than hidden in a flag name. */
        handoversObserved: handovers.length,
        handoverClearsBeforeNewGlyph: handovers.length > 0 &&
          handovers.every((b) => b.handover.clearsBeforeNewGlyph),
        /* The same order asked as a question about TIME rather than about the document: did the reader
         * get a frame in which the sentence had gone and the glyph had not yet arrived? A concept can
         * be true above and false here, which means it wrote the mutations in the right order inside a
         * single frame - correct, and invisible. */
        handoverOrderVisibleAcrossFrames: handovers.length > 0 &&
          handovers.every((b) => b.handover.orderVisibleAcrossFrames),
        handoverBeats: handovers.map((b) => b.beat)
      }
    });
  }

  const section = {
    page: url,
    loadedVia: nav.via,
    hostWindow: windowId,
    viewport,
    script: ACTIVITY_BEATS.map((b) => (b.fire ? b.fire.join('.') : 'baseline')),
    method:
      'Per concept: setPairing onto the host window, system.reset, question.cancel (a pending ' +
      'questionnaire displaces the whole surface strip, run capsule included), then the scripted ' +
      'beats. Every beat is sampled twice — two frames after the trigger and again once the headline ' +
      'stops changing — and captures a PNG. The service state is reported beside the rendered result, ' +
      'never in place of it. Every fired beat also arms the handover order probe, which records the ' +
      'DOM mutation sequence and one sample per frame; at the beats where a new phase entered against ' +
      'an existing chain, that pair says whether the outgoing sentence was let go before the new ' +
      'glyph arrived, and whether the order was visible across frames or happened inside one.',
    /* Which verdict keys are a GATE and which are a RECORD, emitted so the generated report reads the
     * same list the exit code does. Without it, TEST_REPORT.md printed "Concepts with a failing
     * verdict: t2, t8" over dimensions this command deliberately does not gate — turning two
     * documented design differences into two reported failures, in a file whose entire premise is
     * that it never states anything the measurement did not say. The reasoning for each exclusion is
     * at the exit gate at the bottom of this command, not restated here, so there is one copy of it. */
    gatedVerdictKeys: [
      'chainRendered',
      'glyphCountMatchedStateEveryBeat',
      'headerHeldStillOnEveryCountTick',
      'everyGlyphReopensItsPhase',
      'everyGlyphOpensToItsOwnHeadline'
    ],
    recordedVerdictKeys: {
      sentenceRowFollowsOpenPhase:
        'Whether the NARROW sentence row tracks the opened phase. t2 has no header row at all — its ' +
        'sentence lives on the subject phase’s own chip — and t8 puts the opened phase in its ' +
        'footnote by design, so its line describes the run while the footnote describes the phase. ' +
        'Both read false here and both are correct; the capsule read above is the one that gates.',
      handoverClearsBeforeNewGlyph:
        'The two-beat order as a fact about the DOM mutation SEQUENCE. Sound, but the reading depends ' +
        'on having identified which element carries the outgoing sentence, which is coarser in the ' +
        'two concepts with no header row.',
      handoverOrderVisibleAcrossFrames:
        'The same order asked about TIME: did a frame exist in which the sentence had gone and the ' +
        'glyph had not yet arrived? A concept can be true above and false here, which means it wrote ' +
        'the mutations in the right order INSIDE one frame — correct, and invisible. That is what t2 ' +
        'reports, and it is a consequence of t2 being the one concept that keeps element identity.'
    },
    concepts: perConcept,
    ...summariseConsole(session)
  };

  writeReport(SUITE_REPORT, { activity: section }, { command: 'activity', session });

  process.stdout.write(JSON.stringify({
    command: 'activity',
    reportPath: SUITE_REPORT,
    evidenceDir,
    concepts: perConcept.map((c) => ({
      concept: c.concept,
      chainRendered: c.chainRendered,
      finalGlyphCount: c.beats[c.beats.length - 1].glyphCount,
      finalHeaderText: c.beats[c.beats.length - 1].headerText,
      finalChevron: c.beats[c.beats.length - 1].chevron,
      ...c.verdict,
      glyphsWhoseHeadlineDisagrees: c.glyphProbes
        .filter((g) => !g.headerReadsThePhase)
        .map((g) => ({ index: g.index, expected: g.expectedHeadline, headerRead: g.headerTextAfterClick }))
    })),
    driverConsoleErrors: section.driverConsoleErrors,
    driverConsoleWarnings: section.driverConsoleWarnings
  }, null, 2) + '\n');

  /* Nonzero when any concept failed to render a chain, moved its header on a count tick, or has a
   * glyph that does not reopen its own phase — and when the driver saw console noise.
   *
   * handoverClearsBeforeNewGlyph is NOT in this list, and that is a decision rather than an oversight.
   * The mutation-sequence half of it is sound — record order is causal, not a race — but the reading
   * that turns it into a pass depends on having correctly identified WHICH element carries the
   * outgoing sentence, and two of the eight concepts have no header row at all, so for those it falls
   * back to "capsule content outside the chain changed", which is a coarser claim. Gating on it would
   * repeat the mistake sentenceRowFollowsOpenPhase is already kept out of the gate to avoid: scoring a
   * concept's layout choice as a defect. It is recorded per beat, per concept and in the summary
   * below, where it can be read and argued with; a flaky gate would be worth less than that. */
  const bad = perConcept.some((c) =>
    !c.verdict.chainRendered ||
    c.verdict.glyphCountMatchedStateEveryBeat === false ||
    (c.verdict.countTicksObserved > 0 && !c.verdict.headerHeldStillOnEveryCountTick) ||
    (c.verdict.glyphsProbed > 0 && !c.verdict.everyGlyphReopensItsPhase) ||
    (c.verdict.glyphsProbed > 0 && !c.verdict.everyGlyphOpensToItsOwnHeadline)
  ) || section.driverConsoleErrors.length > 0 || section.driverConsoleWarnings.length > 0;
  return bad ? 1 : 0;
}

/* analyseHandover(raw, newPhaseEntered) — turn one probe recording into the two orderings.
 *
 * Split from the page side on purpose: everything here is arithmetic over values that have already
 * crossed the bridge, so it can be re-read, argued with and changed without touching the code that
 * did the observing. The page side records; this decides what the recording means. */
function analyseHandover(raw, newPhaseEntered) {
  if (!raw || !raw.armed) return null;
  const frames = raw.frames || [];
  const tight = (s) => String(s == null ? '' : s).replace(/\s+/g, '');
  const want = tight(raw.outgoing);

  let clearedAtFrame = null;
  let newGlyphAtFrame = null;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    if (clearedAtFrame === null && want) {
      /* The sentence has been let go when its words are no longer on screen OR when the row carrying
       * them has been faded out. Either is the concept saying "this phase is over" before the next
       * phase is represented; insisting on the words alone would date every swapText two frames late. */
      const shown = tight(f.sentence == null ? f.capsule : f.sentence);
      const faded = typeof f.opacity === 'number' && f.opacity < 0.5;
      if (faded || shown.indexOf(want) < 0) clearedAtFrame = i;
    }
    if (newGlyphAtFrame === null && f.glyphs > raw.glyphsBefore) newGlyphAtFrame = i;
  }

  const framesBetween = (clearedAtFrame !== null && newGlyphAtFrame !== null)
    ? newGlyphAtFrame - clearedAtFrame : null;

  return {
    isHandover: !!newPhaseEntered && raw.glyphsBefore > 0,
    sentenceVia: raw.sentenceVia,
    outgoing: raw.outgoing,
    glyphsBefore: raw.glyphsBefore,
    recordsSeen: raw.recordsSeen,
    letGoSeq: raw.letGoSeq,
    letGoVia: raw.letGoVia,
    glyphSeq: raw.glyphSeq,
    glyphVia: raw.glyphVia,
    /* THE dimension. Both indices come from one ordered list of mutation records, so this is the
     * document's own causal order and cannot tie: a null on either side means the probe never saw
     * that half, which is reported as false rather than quietly as true. */
    clearsBeforeNewGlyph: raw.letGoSeq !== null && raw.glyphSeq !== null && raw.letGoSeq < raw.glyphSeq,
    framesSampled: frames.length,
    clearedAtFrame,
    newGlyphAtFrame,
    framesBetween,
    orderVisibleAcrossFrames: framesBetween !== null && framesBetween > 0,
    /* The frames are kept only for the beats that ARE handovers, and only the first twenty-four of
     * them — four hundred milliseconds, which contains the whole of motion.phaseHandover's two beats.
     * Keeping all forty-five for all nine beats of all eight concepts would treble the report to carry
     * frames of an idle capsule, and a report nobody opens is not evidence. */
    frames: newPhaseEntered && raw.glyphsBefore > 0 ? frames.slice(0, 24) : []
  };
}

function lastCount(state) {
  if (!state || !state.chain || !state.chain.length) return null;
  return state.chain[state.chain.length - 1].count;
}

/* Clip the shot to the run capsule when there is one: the chain is 200px wide and a full 1920x1000
 * frame per beat buries it in a page of chrome and costs eight times the bytes. When the capsule is
 * missing — which is itself the finding for a concept that has not implemented it — fall back to the
 * viewport at half scale, so the evidence still shows what the page put there instead. */
async function captureBeat(session, evidenceDir, conceptId, index, beatName, sample, viewport) {
  const file = join(evidenceDir, `activity-${conceptId}-${String(index).padStart(2, '0')}-${beatName}.png`);
  const r = sample.capsuleRect;
  const usable = r && r.width > 4 && r.height > 4 &&
    r.top >= 0 && r.left >= 0 && r.top + r.height <= viewport.height;
  try {
    if (usable) {
      const pad = 8;
      const written = await session.screenshot(file, {
        clip: {
          x: Math.max(0, r.left - pad),
          y: Math.max(0, r.top - pad),
          width: r.width + pad * 2,
          height: r.height + pad * 2,
          scale: 1
        }
      });
      return { file: relative(CONCEPT_DIR, written.path), bytes: written.bytes, clip: 'run capsule' };
    }
    const written = await session.screenshot(file, {
      clip: { x: 0, y: 0, width: viewport.width, height: viewport.height, scale: 0.5 }
    });
    return {
      file: relative(CONCEPT_DIR, written.path),
      bytes: written.bytes,
      clip: r ? 'viewport at 0.5 (capsule is outside the viewport)' : 'viewport at 0.5 (no run capsule in the document)'
    };
  } catch (err) {
    return { file: null, error: err.message };
  }
}

/* ------------------------------------------------------------------ paging
 *
 * The questionnaire in thread-01 has four questions, and 02_stable_paged_questionnaire.mov is about
 * what happens when a reader walks BACK through them: the answer is still there and the card does not
 * animate as though the question were new. Three facts decide whether a concept can do that at all,
 * and this command records all three per step, for every concept, in one walk:
 *
 *   the card root's HEIGHT          — what a resize bounce is a statement about
 *   whether the root's IDENTITY changed — the precondition for both the bounce and firstVisit, since
 *                                     one measures a start height on the element and the other stamps
 *                                     its ledger on it
 *   whether an ENTRANCE ANIMATION ran — the behaviour itself
 *
 * The entrance is not named by class, because eight concepts are required to animate eight ways. It is
 * captured as a SIGNATURE: the class tokens added and the animations running during a step. The
 * entrance-only part of that signature is whatever the open played and the first forward page did not,
 * and a backward step must contain none of it. Where a concept's entrance and advance are
 * indistinguishable the comparison is vacuous, and the report says so in its own field rather than
 * scoring a vacuous pass.
 */
const PAGING_PROBE_INSTALL = `(function () {
  /* The same eight roots and controls the paging suite in tests/suites.js uses, for the same reason:
   * a walk driven through the services would prove the fixture rather than the product. t5 renders a
   * PAIR of lanes rather than a card and the user lane is the half whose height follows the option
   * count, so that is the half a resize bounce and a firstVisit stamp belong to. */
  var SPEC = {
    t1: { root: '.t1-qturn', opt: '.t1-qrow', free: '.t1-qfree', cmd: '.t1-qact', next: 'Next', back: 'Back' },
    t2: { root: '.t2-capsule', opt: '.t2-capsule-opt', free: '.t2-capsule-free',
          cmd: '.t2-capsule-next, .t2-capsule-primary, .t2-capsule-quiet', next: 'Next', back: 'Back' },
    t3: { root: '.t3-qrun', opt: '.t3-opt', free: '.t3-qfree', cmd: '.t3-qact', next: 'Next', back: 'Back' },
    t4: { root: '.t4-qdigest', opt: '.t4-qopt', free: '.t4-qfree', cmd: '.t4-act', next: 'Next', back: 'Back' },
    t5: { root: '.t5-qlane[data-lane="user"]', opt: '.t5-opt', free: '.t5-qfree', cmd: '.t5-act', next: 'Next', back: 'Back' },
    t6: { root: '.t6-form', opt: '.t6-form-opt', free: '.t6-form-field', cmd: '.t6-form-cmd', next: '[next]', back: '[back]' },
    t7: { root: '.t7-deck', opt: '.t7-opt', free: '.t7-qfree', cmd: '.t7-act', next: 'Next', back: 'Back' },
    t8: { root: '.t8-qnote', opt: '.t8-qlist-btn', free: '.t8-qfree', cmd: '.t8-act', next: 'Next', back: 'Back' }
  };

  var state = null;

  function hostEl() { return document.querySelector('[data-pmx-region="questionHost"]'); }
  function services() { return { questionnaire: window.PMXQuestionnaire, surfaces: window.PMXSurfaces }; }
  function threadId() { return window.PMXWorkspace.store.get('session.activeThreadId'); }

  function frames(n) {
    return new Promise(function (resolve) {
      var left = n;
      function step() {
        if (left <= 0) { resolve(true); return; }
        left--;
        window.requestAnimationFrame(step);
      }
      step();
    });
  }

  /* Finish every finite animation so the next step starts from silence: a 420ms entrance still running
   * when the advance is sampled would put every entrance name in the advance set too, and the
   * entrance-only comparison would then pass by being empty rather than by being true. */
  function quiet(el) {
    if (!el || !el.getAnimations) return;
    var list;
    try { list = el.getAnimations({ subtree: true }); } catch (e) { return; }
    for (var i = 0; i < list.length; i++) {
      var timing = list[i].effect && list[i].effect.getComputedTiming ? list[i].effect.getComputedTiming() : null;
      if (timing && timing.iterations === Infinity) continue;
      try { list[i].finish(); } catch (e2) { try { list[i].cancel(); } catch (e3) {} }
    }
  }

  /* Transitions are reported by property as well as animations by name, because two concepts express
   * their question motion as an interpolated height rather than as keyframes and a reader that only
   * knew about keyframes would score them motionless. */
  function running(el) {
    var out = [];
    if (!el || !el.getAnimations) return out;
    var list;
    try { list = el.getAnimations({ subtree: true }); } catch (e) { return out; }
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.playState !== 'running') continue;
      var timing = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      if (timing && timing.iterations === Infinity) continue;
      if (a.animationName) out.push('animation:' + a.animationName);
      else if (a.transitionProperty) out.push('transition:' + a.transitionProperty);
    }
    return out;
  }

  /* Class tokens ADDED rather than present: every concept's one-shot beats remove their class on a
   * timer, so a sample of what is on the element cannot tell a class just applied from one that has
   * been there since the mount. */
  function watchClasses(root) {
    var added = {};
    var mo = null;
    function drain(recs) {
      for (var i = 0; i < recs.length; i++) {
        var r = recs[i];
        if (r.type !== 'attributes' || r.attributeName !== 'class') continue;
        var before = {};
        String(r.oldValue || '').split(/\\s+/).forEach(function (tk) { if (tk) before[tk] = 1; });
        var now = String((r.target.getAttribute && r.target.getAttribute('class')) || '').split(/\\s+/);
        for (var j = 0; j < now.length; j++) if (now[j] && !before[now[j]]) added['class:' + now[j]] = 1;
      }
    }
    if (root && window.MutationObserver) {
      mo = new MutationObserver(drain);
      mo.observe(root, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    }
    return {
      take: function () {
        if (mo) drain(mo.takeRecords());
        var out = Object.keys(added);
        added = {};
        return out;
      },
      stop: function () { if (mo) mo.disconnect(); }
    };
  }

  function cmdButton(label) {
    var all = document.querySelectorAll(state.spec.cmd);
    for (var i = 0; i < all.length; i++) {
      if (!state.host.contains(all[i])) continue;
      if ((all[i].textContent || '').trim() === label) return all[i];
    }
    return null;
  }

  /* Answering happens through the concept's own control. The flow is READ first to decide whether an
   * answer is still needed - reading is not resolving - because the first question is multi-select and
   * a second click on the same row would take the answer away again on the way back. */
  function answerIfNeeded() {
    var flow = window.PMXQFlow.read(services(), threadId());
    var question = flow && flow.question;
    if (!question) return null;
    var answered = question.kind === 'freeform'
      ? !!(question.draft && String(question.draft).trim())
      : !!(question.selected && question.selected.length);
    if (answered) return null;
    var opt = state.host.querySelector(state.spec.opt);
    if (opt) {
      opt.click();
      var after = window.PMXQFlow.read(services(), threadId());
      var sel = after && after.question && after.question.selected;
      return sel && sel.length ? sel[0] : (opt.textContent || '').trim();
    }
    var free = state.host.querySelector(state.spec.free);
    if (free) {
      free.value = 'an answer typed into the field';
      free.dispatchEvent(new Event('input', { bubbles: true }));
      return 'an answer typed into the field';
    }
    return null;
  }

  function read(label) {
    var el = document.querySelector(state.spec.root);
    var changed = state.index === 0 ? null : (state.root !== el);
    state.root = el;
    var signature = state.watch.take().concat(running(state.host));
    /* The height is taken twice on purpose. One interaction renders TWICE in this workspace - the
     * store notifies, then the click handler renders again - and a resize bounce is in flight at the
     * two-frame sample, so the first number can legitimately be mid-beat. The settled number is the
     * one to compare across steps; the pair is what shows a bounce happened at all. */
    var heightAtSample = el ? Math.round(el.getBoundingClientRect().height * 100) / 100 : null;
    quiet(state.host);

    var flow = window.PMXQFlow.read(services(), threadId());
    var pressed = [];
    var all = document.querySelectorAll('[aria-pressed="true"]');
    for (var i = 0; i < all.length; i++) {
      if (state.host.contains(all[i])) pressed.push(String(all[i].textContent || '').replace(/\\s+/g, ' ').trim());
    }

    return {
      index: state.index++,
      label: label,
      ok: true,
      rootPresent: !!el,
      /* The transformed box and the laid-out one. They disagree when the card is carrying a scale,
       * which is what a bounce is made of - so the pair says both how tall the card is and whether it
       * was mid-beat when the sample was taken. */
      rootHeight: heightAtSample,
      rootHeightSettled: el ? Math.round(el.getBoundingClientRect().height * 100) / 100 : null,
      rootLayoutHeight: el ? el.offsetHeight : null,
      rootInlineHeight: el ? (el.style.height || '') : null,
      rootIdentityChanged: changed,
      signature: signature,
      questionIndex: flow ? flow.index : null,
      questionTotal: flow ? flow.total : null,
      atEnd: flow ? !!flow.atEnd : null,
      questionKey: window.PMXReveal ? window.PMXReveal.keyFor(services(), threadId()) : null,
      answersShown: pressed,
      /* motion.firstVisit's own ledger, read off whichever element carries it. Its presence is the
       * direct evidence that the concept asked, that it asked with the shared key, and that one
       * element survived long enough to be asked twice. */
      visitedAll: (function () {
        var stamped = (el && el.getAttribute && el.getAttribute('data-pmx-visited-all') !== null)
          ? el : state.host.querySelector('[data-pmx-visited-all]');
        return stamped ? stamped.getAttribute('data-pmx-visited-all') : null;
      })()
    };
  }

  window.__pmxPaging = {
    /* MAKING THE ENTRANCE OBSERVABLE.
     *
     * The fixture's questionnaire is already incomplete, so it is ACTIVE the moment the composition
     * mounts: the card's entrance happened before this probe could exist, and question.open at an
     * already-active record only settles a phase that is not pending, which renders nothing. The first
     * run of this command measured exactly that and reported an empty entrance signature for six of
     * the eight concepts.
     *
     * Opening another thread and coming back is what a reader would do, it costs the record nothing -
     * no answer given, no phase resolved - and it clears the concept's own memory of which question it
     * was showing, so the card genuinely arrives again with the watcher armed. thread-06 is the thread
     * that carries no questionnaire of its own.
     *
     * Note for anyone adding a probe next to this one: unlike the activity command, this one must NOT
     * fire question.cancel as a precondition. There the pending question hides the run capsule and
     * cancelling is what makes the subject visible; here the question IS the subject. */
    begin: function (id) {
      var host = hostEl();
      if (!host || !SPEC[id]) {
        return Promise.resolve({ ok: false, label: 'open', reason: host ? 'unknown concept ' + id : 'no questionHost region' });
      }
      var store = window.PMXWorkspace.store;
      var home = threadId();
      state = { id: id, spec: SPEC[id], host: host, root: null, index: 0, watch: { take: function () { return []; }, stop: function () {} } };
      window.PMXDemo.fire('question', 'open');
      store.set('session.activeThreadId', 'thread-06');
      return frames(2).then(function () {
        state.host = hostEl() || state.host;
        quiet(state.host);
        state.watch = watchClasses(state.host);
        store.set('session.activeThreadId', home);
        return frames(2);
      }).then(function () { return read('open'); });
    },

    step: function (dir) {
      if (!state) return Promise.resolve({ ok: false, reason: 'begin() was never called' });
      var answered = dir === 'forward' ? answerIfNeeded() : null;
      return frames(answered ? 2 : 0).then(function () {
        if (answered) {
          /* The answer click is not the page change. What it stirred up is dropped here so the sample
           * below contains the page change and nothing else. */
          quiet(state.host);
          state.watch.take();
        }
        var btn = cmdButton(dir === 'forward' ? state.spec.next : state.spec.back);
        if (!btn) return { ok: false, label: dir, index: state.index, reason: 'this concept offers no ' + dir + ' control right now' };
        btn.click();
        return frames(2).then(function () {
          var sample = read(dir);
          sample.answerGiven = answered;
          return sample;
        });
      });
    },

    end: function () {
      if (state && state.watch) state.watch.stop();
      state = null;
      return true;
    }
  };
  return 1;
})()`;

async function cmdPaging(session, flags) {
  const page = String(flags.page || 'stage.html');
  const windowId = String(flags.window || 'w1');
  const viewport = {
    width: Number(flags.width || DEFAULT_WIDTH),
    height: Number(flags.height || DEFAULT_HEIGHT)
  };
  const { url, nav } = await openWorkspace(session, page);

  const perConcept = [];

  for (let n = 1; n <= 8; n++) {
    const conceptId = 't' + n;
    await session.eval(`window.PMXWorkspace.setPairing(${JSON.stringify(windowId)}, ${JSON.stringify(conceptId)}), 1`);
    await session.settle();
    await session.eval(PAGING_PROBE_INSTALL);
    /* Reset first so the questionnaire is back at its first question with nothing answered. Unlike the
     * activity command this one does NOT cancel the question — the question is the subject here. */
    await session.eval('(window.PMXDemo.fire("system", "reset"), 1)');
    await session.settle();

    const steps = [];
    steps.push(await session.eval(`window.__pmxPaging.begin(${JSON.stringify(conceptId)})`));

    /* Forward to the last question, then back to the first. The bound is the question count rather
     * than a fixed number of clicks, so a fixture that gains a fifth question is still walked whole.
     *
     * A step that does not MOVE the flow stops the walk and is recorded as a refusal. The first run of
     * this command clicked a dead Next control seven times and produced a walk that read as seven
     * pages; one refusal named once is the finding, and the six repeats were noise on top of it. */
    let stalled = null;
    for (let guard = 0; guard < 8; guard++) {
      const last = steps[steps.length - 1];
      if (!last || !last.ok) break;
      if (last.atEnd || last.questionTotal == null || last.questionIndex >= last.questionTotal - 1) break;
      const step = await session.eval('window.__pmxPaging.step("forward")');
      steps.push(step);
      if (step.ok && step.questionIndex === last.questionIndex) {
        stalled = {
          direction: 'forward',
          atQuestionIndex: last.questionIndex,
          note: "the concept's own forward control was clicked and the flow did not move"
        };
        break;
      }
    }
    for (let guard = 0; guard < 8; guard++) {
      const last = steps[steps.length - 1];
      if (!last || !last.ok) break;
      if (!last.questionIndex) break;
      const step = await session.eval('window.__pmxPaging.step("back")');
      steps.push(step);
      if (step.ok && step.questionIndex === last.questionIndex) {
        stalled = stalled || {
          direction: 'back',
          atQuestionIndex: last.questionIndex,
          note: "the concept's own backward control was clicked and the flow did not move"
        };
        break;
      }
    }
    await session.eval('window.__pmxPaging.end()');

    const good = steps.filter((s) => s && s.ok);
    const forwardSteps = good.filter((s) => s.label === 'forward');
    const backSteps = good.filter((s) => s.label === 'back');
    const openStep = good.find((s) => s.label === 'open') || null;

    /* The entrance-only signature: what the open played and the first forward page did not. Anything
     * in it turning up on a backward step is the entrance replaying. */
    const entrance = openStep ? openStep.signature : [];
    const firstAdvance = forwardSteps.length ? forwardSteps[0].signature : [];
    /* The RESIZE is not the entrance, even when they share a property.
     *
     * A card whose entrance opens it from zero height does that through the same `resizeBounce` every
     * later page change uses, so `transition:height` and the bounce classes appear in the entrance
     * sample and then legitimately again on every page change — including a backward one, where the
     * card may genuinely be a different size. Counting those as an entrance replay marks the concept
     * wrong for doing the thing it is supposed to do. What must not replay is the entrance's OWN
     * choreography: its arrival keyframes and stagger. */
    const RESIZE_TOKENS = ['transition:height', 'class:pmx-size-bounce', 'class:pmx-size-bounce-strong',
      'animation:pmx-size-bounce', 'animation:pmx-size-bounce-strong'];
    const entranceOnly = entrance
      .filter((s) => firstAdvance.indexOf(s) < 0)
      .filter((s) => RESIZE_TOKENS.indexOf(s) < 0);
    const replays = backSteps
      .map((s) => ({ index: s.index, replayed: s.signature.filter((x) => entranceOnly.indexOf(x) >= 0) }))
      .filter((r) => r.replayed.length > 0);

    const identitySteps = good.filter((s) => s.rootIdentityChanged !== null);
    const firstAnswer = forwardSteps.length ? forwardSteps[0].answerGiven : null;
    const finalStep = good.length ? good[good.length - 1] : null;
    const heights = good.map((s) => s.rootHeight);

    perConcept.push({
      concept: conceptId,
      hostWindow: windowId,
      rootSelector: PAGING_ROOTS[conceptId],
      pagesForward: forwardSteps.length,
      pagesBack: backSteps.length,
      entranceSignature: entrance,
      firstAdvanceSignature: firstAdvance,
      entranceOnlySignature: entranceOnly,
      steps: good.map((s) => ({
        index: s.index,
        label: s.label,
        questionIndex: s.questionIndex,
        questionKey: s.questionKey,
        rootPresent: s.rootPresent,
        rootHeight: s.rootHeight,
        rootHeightSettled: s.rootHeightSettled,
        rootLayoutHeight: s.rootLayoutHeight,
        rootInlineHeight: s.rootInlineHeight,
        rootIdentityChanged: s.rootIdentityChanged,
        signature: s.signature,
        entranceTokensSeen: s.signature.filter((x) => entranceOnly.indexOf(x) >= 0),
        answerGiven: s.answerGiven || null,
        answersShown: s.answersShown,
        visitedAll: s.visitedAll
      })),
      refusals: steps.filter((s) => s && !s.ok).map((s) => ({ label: s.label, reason: s.reason })),
      stalled,
      verdict: {
        rootRendered: !!(openStep && openStep.rootPresent),
        /* The walk itself, reported before anything it measured: a concept whose own paging controls
         * do not move the flow has not been measured for the three behaviours below, it has been
         * measured for that. */
        pagedThroughItsOwnControls: !stalled && backSteps.length > 0,
        /* One identity across the whole walk. Reported as a count as well as a flag so a concept that
         * holds its root forward and rebuilds it backward is visible as exactly that. */
        rootIdentityHeldEveryStep: identitySteps.length > 0 && identitySteps.every((s) => s.rootIdentityChanged === false),
        rootIdentityChangesObserved: identitySteps.filter((s) => s.rootIdentityChanged === true).map((s) => s.label),
        /* Vacuity, stated. If the open and the first advance play the same thing, "the entrance did
         * not replay" cannot be measured on this concept at all, and a pass would mean nothing. */
        entranceDistinguishableFromAdvance: entranceOnly.length > 0,
        entranceReplayedOnBackwardStep: replays.length > 0,
        entranceReplays: replays,
        heightChangedAcrossSteps: heights.filter((h) => h !== null).some((h, i, list) => i > 0 && Math.abs(h - list[i - 1]) >= 0.5),
        heights,
        /* The other half of "reviewable": the answer is still SHOWN, not merely still in the store. */
        answerStillShownAfterPagingBack: !!(firstAnswer && finalStep && finalStep.questionIndex === 0 &&
          finalStep.answersShown.some((a) => a.indexOf(firstAnswer) >= 0)),
        firstVisitLedgerPresent: !!(finalStep && finalStep.visitedAll),
        firstVisitKeysStamped: finalStep && finalStep.visitedAll ? finalStep.visitedAll.trim().split(/\s+/).length : 0
      }
    });
  }

  const section = {
    page: url,
    loadedVia: nav.via,
    hostWindow: windowId,
    viewport,
    method:
      'Per concept: setPairing onto the host window, system.reset, then question.open, then the ' +
      'questionnaire is paged forward to its last question and back to its first THROUGH THE ' +
      "CONCEPT'S OWN controls — its option rows, its Next, its Back. Each step records the card " +
      'root height (transformed and laid out), whether the root element identity changed, and the ' +
      'step signature: the class tokens added and the animations running two frames after the click. ' +
      'The entrance signature is whatever the open played that the first forward page did not, so no ' +
      'class name is hard-coded and eight concepts can animate eight ways.',
    concepts: perConcept,
    ...summariseConsole(session)
  };

  writeReport(SUITE_REPORT, { questionPaging: section }, { command: 'paging', session });

  process.stdout.write(JSON.stringify({
    command: 'paging',
    reportPath: SUITE_REPORT,
    concepts: perConcept.map((c) => ({
      concept: c.concept,
      pagesForward: c.pagesForward,
      pagesBack: c.pagesBack,
      ...c.verdict,
      entranceReplays: undefined,
      heights: undefined
    })),
    driverConsoleErrors: section.driverConsoleErrors,
    driverConsoleWarnings: section.driverConsoleWarnings
  }, null, 2) + '\n');

  /* Nonzero for a concept that renders no question card at all, and for console noise. The paging
   * behaviours themselves are RECORDED and not gated: root identity, the firstVisit ledger and the
   * entrance comparison are the three things being built right now across all eight concepts, and a
   * gate that fails while they land would be reporting the calendar rather than the product. The
   * numbers are in the report and in the summary above, which is what a reader needs to see them. */
  const bad = perConcept.some((c) => !c.verdict.rootRendered) ||
    section.driverConsoleErrors.length > 0 || section.driverConsoleWarnings.length > 0;
  return bad ? 1 : 0;
}

/* The root selector per concept, mirrored on this side so the report can name what it measured
 * without reaching back into the page for a string it already knows. */
const PAGING_ROOTS = {
  t1: '.t1-qturn', t2: '.t2-capsule', t3: '.t3-qrun', t4: '.t4-qdigest',
  t5: '.t5-qlane[data-lane="user"]', t6: '.t6-form', t7: '.t7-deck', t8: '.t8-qnote'
};

/* ------------------------------------------------------------------ scan (no browser) */

/* Media and evidence are excluded by directory, and binaries by extension: a PNG legitimately holds
 * NUL bytes and is not text to decode. */
const SCAN_SKIP_DIRS = new Set(['evidence', 'reference', '.git', 'node_modules']);
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp',
  '.mp4', '.mov', '.webm', '.mkv', '.mp3', '.wav',
  '.pdf', '.zip', '.gz', '.tar', '.woff', '.woff2', '.ttf', '.otf', '.eot'
]);

/* The phrases are assembled from parts rather than written out, and this is not decoration. This
 * scanner reads every file in the folder including itself, so spelling the needles here would make
 * the check report its own source and never pass. Assembling them means the literal genuinely is not
 * in this file, and the scanner can honestly scan itself. */
const FORBIDDEN_PHRASES = [
  { parts: ['included', 'with', 'this', 'server'], join: ' ' },
  { parts: ['bundled', 'with'], join: ' ' },
  { parts: ['pre', 'seeded'], join: '-' },
  { parts: ['ships', 'with', 'puppet', 'master'], join: ' ' },
  { parts: ['included', 'in', 'the', 'baseline'], join: ' ' },
  { parts: ['included', 'execution', 'baseline'], join: ' ' }
].map((p) => p.parts.join(p.join));

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SCAN_SKIP_DIRS.has(entry.name)) continue;
      walkFiles(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function lineAndColumn(text, index) {
  let line = 1;
  let lastBreak = -1;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) { line++; lastBreak = i; }
  }
  return { line, column: index - lastBreak };
}

async function cmdScan(_session, flags) {
  const root = flags.root ? resolve(String(flags.root)) : CONCEPT_DIR;
  const files = walkFiles(root).sort();

  const encoding = { checked: 0, skippedBinary: 0, nulByte: [], notUtf8: [] };
  const phrases = { checked: 0, hits: [], allowed: 0 };
  /* CONTRACT section 8.1 forbids emoji and pictographic characters ANYWHERE — code, strings and
   * comments alike — and the only automated guard was inside the browser suite, scanning icons.js and
   * the concept registration prose. A magnifier emoji therefore sat in a shared module's docblock
   * through the whole build. The rule is folder-wide, so the check has to be too, and this scan
   * already walks every file. Box-drawing and typographic marks are not pictographs and are allowed;
   * what is caught is the Symbol-other category and the emoji blocks. */
  const pictographs = { checked: 0, hits: [] };
  /* Every `cmd.*` id this workspace names in source, so it can be checked against
   * candidate-command-delta.json below. shared/opcard.js declares in its own docblock that "every id
   * minted here is also recorded in candidate-command-delta.json for the owner to accept, rename or
   * reject", and nine of its ten ids were not recorded at all — a card printed a COMMAND row that
   * the catalog owner had never been shown. The rule was real; nothing enforced it. */
  const commandIds = new Map();
  /* fatal: true is the point. Buffer.toString('utf8') replaces an invalid sequence with U+FFFD and
   * reports success, which is exactly the kind of quiet corruption this check is for. */
  const decoder = new TextDecoder('utf-8', { fatal: true });

  for (const file of files) {
    const shown = relative(root, file);
    if (BINARY_EXTENSIONS.has(extname(file).toLowerCase())) {
      encoding.skippedBinary++;
      continue;
    }

    let bytes;
    try {
      bytes = readFileSync(file);
    } catch (err) {
      encoding.notUtf8.push({ file: shown, reason: `unreadable: ${err.message}` });
      continue;
    }

    encoding.checked++;

    /* A literal NUL in a source file is what a previous session wrote into shared/questionnaire.js.
     * git then treats the file as binary and grep skips it entirely, so the corruption hides from
     * every text tool that would otherwise have found it. */
    const nulAt = bytes.indexOf(0);
    if (nulAt >= 0) {
      encoding.nulByte.push({ file: shown, firstAtByte: nulAt, bytes: bytes.length });
    }

    let text;
    try {
      text = decoder.decode(bytes);
    } catch (err) {
      encoding.notUtf8.push({ file: shown, reason: err.message, bytes: bytes.length });
      continue;
    }

    pictographs.checked++;
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp < 0x80) continue;
      /* Arrows (U+2190-U+21FF), Box Drawing (U+2500-U+257F) and Block Elements (U+2580-U+259F) are
       * DRAWING characters, not glyphs standing in for an icon. This workspace uses them to sketch a
       * state machine and a column order inside comments, which is a legitimate use and not what the
       * rule is about. Excluding them by name is what keeps this check from being the sort a team
       * switches off within a day. */
      if ((cp >= 0x2190 && cp <= 0x21FF) || (cp >= 0x2500 && cp <= 0x259F)) continue;
      const emojiBlock = (cp >= 0x1F000 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF) || cp === 0xFE0F;
      /* \p{So} is "Symbol, other" — where pictographs live. Arrows, box-drawing and typographic
       * punctuation are deliberately NOT caught: this file is full of legitimate em dashes and
       * middle dots, and a check that flagged those would be turned off within a day. */
      const symbolOther = /\p{So}/u.test(ch);
      if (!emojiBlock && !symbolOther) continue;
      pictographs.hits.push({ file: shown, char: ch, codepoint: 'U+' + cp.toString(16).toUpperCase() });
      break;
    }

    /* The delta itself, the catalog quotations in the reports, and this scanner are all places a
     * command id legitimately appears without being minted by a surface. Collecting from the .js
     * that BUILD the surfaces is what keeps the gate about what a user can actually see printed. */
    if (extname(file).toLowerCase() === '.js' && !shown.startsWith('tools' + sep)) {
      const idRe = /cmd\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+/g;
      let match;
      while ((match = idRe.exec(text)) !== null) {
        if (!commandIds.has(match[0])) commandIds.set(match[0], shown);
      }
    }

    phrases.checked++;
    const haystack = text.toLowerCase();
    for (const needle of FORBIDDEN_PHRASES) {
      let from = 0;
      for (;;) {
        const at = haystack.indexOf(needle, from);
        if (at < 0) break;
        const pos = lineAndColumn(text, at);
        const lineText = text.split('\n')[pos.line - 1] || '';
        /* Some occurrences are the CHECK, not the claim: the browser suite spells its own needle
         * list out, and the route copy denies a phrase by name. Whether one is being asserted or
         * refused is not something a
         * substring search can decide, so the decision is made where the context is — at the line —
         * by an explicit marker carrying its reason. A new occurrence without one still fails, which
         * is the property that matters. */
        if (/pmx-scan-allow:/.test(lineText)) { phrases.allowed++; from = at + needle.length; continue; }
        phrases.hits.push({
          file: shown,
          line: pos.line,
          column: pos.column,
          phrase: needle,
          /* The line verbatim, trimmed. Some hits are checkers and comments that name the phrase in
           * order to forbid it; printing the line is what lets a reader tell those from product copy
           * without the scanner having to guess. */
          lineText: lineText.trim().slice(0, 200)
        });
        from = at + needle.length;
      }
    }
  }

  const byFile = {};
  for (const hit of phrases.hits) byFile[hit.file] = (byFile[hit.file] || 0) + 1;

  /* Command-id completeness. An id a surface prints but the delta does not carry is an id the
   * catalog owner cannot accept, rename or reject, because they were never told it exists. */
  const commands = { found: commandIds.size, unrecorded: [], deltaRead: null };
  const deltaPath = join(root, 'candidate-command-delta.json');
  if (!existsSync(deltaPath)) {
    commands.deltaRead = 'candidate-command-delta.json does not exist';
    for (const [id, file] of commandIds) commands.unrecorded.push({ id, file });
  } else {
    let deltaText = '';
    try {
      deltaText = readFileSync(deltaPath, 'utf8');
      JSON.parse(deltaText);
      commands.deltaRead = 'candidate-command-delta.json';
    } catch (err) {
      /* A delta that will not parse is a measurement failure, not a reason to pass everything. */
      commands.deltaRead = `candidate-command-delta.json is not valid JSON: ${err.message}`;
      deltaText = '';
    }
    for (const [id, file] of commandIds) {
      if (!deltaText.includes(id)) commands.unrecorded.push({ id, file });
    }
    /* The wiring delta names commands too, and three of them lived ONLY there for the whole build —
     * so two kept a disposition the catalog contradicts, because nothing ever put them in front of
     * the file whose job is to check them. Reading both is the difference between a gate on one
     * document and a gate on the claim. */
    const idRe = /cmd\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+/g;
    const wiringPath = join(root, 'candidate-wiring-delta.json');
    if (existsSync(wiringPath)) {
      try {
        const wiring = JSON.parse(readFileSync(wiringPath, 'utf8'));
        for (const row of wiring.rows || []) {
          for (const id of String(row.command || '').match(idRe) || []) {
            commands.found++;
            if (!deltaText.includes(id)) {
              commands.unrecorded.push({ id, file: 'candidate-wiring-delta.json' });
            }
          }
        }
      } catch (err) {
        commands.unrecorded.push({ id: '(wiring delta unreadable)', file: err.message });
      }
    }
    /* And the Plan-owner delta, which names ids in prose when it asks the owner a question about
     * them. A question about an id the command delta does not carry is a question about nothing. */
    const ownerPath = join(root, 'plan-owner-delta.md');
    if (existsSync(ownerPath)) {
      const ownerText = readFileSync(ownerPath, 'utf8');
      for (const id of new Set(ownerText.match(idRe) || [])) {
        commands.found++;
        if (!deltaText.includes(id)) commands.unrecorded.push({ id, file: 'plan-owner-delta.md' });
      }
    }
  }

  const summary = {
    command: 'scan',
    root,
    filesSeen: files.length,
    encoding: {
      textFilesChecked: encoding.checked,
      binaryFilesSkipped: encoding.skippedBinary,
      skippedDirectories: [...SCAN_SKIP_DIRS],
      filesWithNulByte: encoding.nulByte,
      filesFailingUtf8Decode: encoding.notUtf8
    },
    pictographs: {
      filesChecked: pictographs.checked,
      hits: pictographs.hits
    },
    forbiddenPhrases: {
      phraseCount: FORBIDDEN_PHRASES.length,
      allowed: phrases.allowed,
      filesChecked: phrases.checked,
      hitCount: phrases.hits.length,
      hitsByFile: byFile,
      hits: phrases.hits
    },
    commandIds: commands
  };

  const failed = encoding.nulByte.length + encoding.notUtf8.length + phrases.hits.length +
    pictographs.hits.length + commands.unrecorded.length;
  summary.ok = failed === 0;
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  if (failed) {
    process.stderr.write(
      `drive: scan failed — ${encoding.nulByte.length} file(s) with a NUL byte, ` +
      `${encoding.notUtf8.length} that do not decode as UTF-8, ` +
      `${phrases.hits.length} forbidden-phrase hit(s), ` +
      `${pictographs.hits.length} file(s) carrying an emoji or pictograph, ` +
      `${commands.unrecorded.length} command id(s) a surface prints that candidate-command-delta.json ` +
      `does not record\n`
    );
  }
  return failed ? 1 : 0;
}

/* ------------------------------------------------------------------ shot / eval */

async function cmdShot(session, flags, [relativeUrl, out]) {
  if (!relativeUrl || !out) throw new Error('usage: drive.mjs shot <relative-page-url> <out.png>');
  const url = pageUrl(relativeUrl);
  const nav = await session.goto(url);
  const ready = await softWaitForReady(session, Number(flags.timeout || 30000));
  await session.settle();
  const written = await session.screenshot(out);
  process.stdout.write(JSON.stringify({
    command: 'shot', url, loadedVia: nav.via, ready, ...written, ...summariseConsole(session)
  }, null, 2) + '\n');
  return 0;
}

async function cmdEval(session, flags, [relativeUrl, expression]) {
  if (!relativeUrl || expression === undefined) {
    throw new Error("usage: drive.mjs eval <relative-page-url> '<js expression>'");
  }
  const timeoutMs = Number(flags.timeout || 30000);
  const url = pageUrl(relativeUrl);
  await session.goto(url);
  /* Boot gets its own fixed budget; --timeout belongs to the expression, which is the part a caller
   * lengthens when it hands over something slow like `PMXSuites.runMatrix(...)`. */
  await softWaitForReady(session, 30000);
  await session.settle();
  const value = await session.eval(expression, { timeoutMs });
  process.stdout.write(JSON.stringify(value, null, 2) + '\n');
  /* Console noise goes to stderr so stdout stays a single parseable JSON value. */
  const noise = summariseConsole(session);
  if (noise.driverConsoleErrors.length || noise.driverConsoleWarnings.length) {
    process.stderr.write('console: ' + JSON.stringify(noise) + '\n');
  }
  return 0;
}

/* ------------------------------------------------------------------ CLI */

const COMMANDS = {
  scan:     { browser: false, run: cmdScan },
  suite:    { browser: true,  run: cmdSuite },
  matrix:   { browser: true,  run: cmdMatrix },
  triggers: { browser: true,  run: cmdTriggers },
  activity: { browser: true,  run: cmdActivity },
  paging:   { browser: true,  run: cmdPaging },
  shot:     { browser: true,  run: cmdShot },
  eval:     { browser: true,  run: cmdEval }
};

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [command, ...rest] = positional;

  if (!command || !COMMANDS[command]) {
    process.stderr.write(
      'usage: node tools/drive.mjs <' + Object.keys(COMMANDS).join('|') + '> [args]\n' +
      '       [--width=px --height=px --timeout=ms --page=rel --window=w1 --scope=w1]\n'
    );
    return 2;
  }

  /* scan touches no browser at all. Launching one for it would cost a second and a profile directory
   * for nothing, and would make a filesystem audit depend on a working Chromium. */
  if (!COMMANDS[command].browser) {
    return await COMMANDS[command].run(null, flags, rest);
  }

  const session = await launch({
    width: Number(flags.width || DEFAULT_WIDTH),
    height: Number(flags.height || DEFAULT_HEIGHT)
  });

  /* A detached browser outlives its parent, so an interrupted driver has to reap it explicitly.
   * Long runs get killed by timeouts and by impatient humans, and neither should cost a stray
   * Chromium tree — one leaked browser is what exhausted this machine's memory once already. */
  const onSignal = (signal) => {
    process.stderr.write(`drive: ${signal} received, shutting the browser down\n`);
    session.close().finally(() => process.exit(130));
  };
  process.once('SIGINT', () => onSignal('SIGINT'));
  process.once('SIGTERM', () => onSignal('SIGTERM'));

  try {
    return await COMMANDS[command].run(session, flags, rest);
  } finally {
    await session.close();
  }
}

/* Set the code and let Node exit on its own. process.exit() discards whatever is still buffered in
 * stdout when stdout is a pipe, which is exactly how a summary gets truncated the moment someone
 * pipes this into a file. The unref'd failsafe only fires if some handle outlived close(). */
function finish(code) {
  process.exitCode = code;
  setTimeout(() => process.exit(code), 2000).unref();
}

/* Only run the CLI when invoked as a script: the module half of this file is meant to be imported. */
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().then(
    (code) => finish(code),
    (err) => {
      /* Loud, specific, nonzero. A driver that swallows a failure is worse than no driver. */
      process.stderr.write('drive: ' + (err && err.stack ? err.stack : String(err)) + '\n');
      finish(1);
    }
  );
}
