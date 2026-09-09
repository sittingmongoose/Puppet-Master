// cdp.mjs — dependency-free Chrome DevTools driver over --remote-debugging-pipe.
// Node 22, no playwright needed. Messages are NUL-delimited JSON on fd 3 (write) / fd 4 (read).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const CHROME = process.env.CHROME || '/usr/bin/google-chrome';

export async function launch({ width = 1600, height = 1000, scale = 1, profile, args = [] } = {}) {
  profile = profile || `${process.env.PM_CDP_PROFILE_DIR || tmpdir()}/pm-cdp-profile-${process.pid}`;
  mkdirSync(profile, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new', '--remote-debugging-pipe', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--allow-file-access-from-files', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-features=TranslateUI', '--mute-audio',
    `--user-data-dir=${profile}`, `--window-size=${width},${height}`, ...args, 'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'] });
  const wr = chrome.stdio[3], rd = chrome.stdio[4];
  let buf = '', id = 0;
  const pending = new Map();
  const listeners = [];
  chrome.stderr.on('data', () => {});
  rd.on('data', chunk => {
    buf += chunk.toString('utf8');
    let i;
    while ((i = buf.indexOf('\0')) >= 0) {
      const raw = buf.slice(0, i); buf = buf.slice(i + 1);
      let msg; try { msg = JSON.parse(raw); } catch { continue; }
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
        if (msg.error) rej(new Error(`${msg.error.message} (${msg.error.data || ''})`)); else res(msg.result);
      } else if (msg.method) {
        for (const l of listeners) if ((!l.session || l.session === msg.sessionId) && (l.method === msg.method || l.method === '*')) l.fn(msg.params, msg);
      }
    }
  });
  const send = (method, params = {}, sessionId) => {
    const m = { id: ++id, method, params }; if (sessionId) m.sessionId = sessionId;
    wr.write(JSON.stringify(m) + '\0');
    return new Promise((res, rej) => pending.set(m.id, { res, rej }));
  };
  const on = (method, fn, session) => { const l = { method, fn, session }; listeners.push(l); return () => { const k = listeners.indexOf(l); if (k >= 0) listeners.splice(k, 1); }; };
  const once = (method, session, pred = () => true, timeout = 30000) => new Promise((res, rej) => {
    const t = setTimeout(() => { off(); rej(new Error('timeout waiting ' + method)); }, timeout);
    const off = on(method, (p, m) => { if (pred(p, m)) { clearTimeout(t); off(); res(p); } }, session);
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (method, params) => send(method, params, sessionId);
  await s('Page.enable'); await s('Runtime.enable'); await s('DOM.enable');
  await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  const errors = [];
  on('Runtime.exceptionThrown', p => errors.push('EXC: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text).slice(0, 400)), sessionId);
  on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push('console.error: ' + p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300)); }, sessionId);

  const page = {
    sessionId, send: s, on: (m, fn) => on(m, fn, sessionId), once: (m, pred, t) => once(m, sessionId, pred, t), errors,
    async goto(url, { timeout = 90000 } = {}) {
      const loaded = once('Page.loadEventFired', sessionId, () => true, timeout);
      await s('Page.navigate', { url }); await loaded;
    },
    async evaluate(fnOrExpr, ...argsIn) {
      const expression = typeof fnOrExpr === 'function' ? `(${fnOrExpr.toString()})(${argsIn.map(a => JSON.stringify(a)).join(',')})` : fnOrExpr;
      const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
      if (r.exceptionDetails) throw new Error('evaluate: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    },
    async screenshot(path, { clip, format = 'png', quality } = {}) {
      const params = { format, captureBeyondViewport: false }; if (quality) params.quality = quality; if (clip) params.clip = { ...clip, scale: 1 };
      const { data } = await s('Page.captureScreenshot', params);
      const bytes = Buffer.from(data, 'base64'); if (path) writeFileSync(path, bytes); return bytes;
    },
    async click(selector, { index = 0 } = {}) {
      const box = await page.evaluate((sel, i) => { const els = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length); const el = els[i]; if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, selector, index);
      if (!box) throw new Error('click: no visible ' + selector);
      await page.mouse(box.x, box.y); return box;
    },
    async mouse(x, y, { down = true, up = true, move = true } = {}) {
      if (move) await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      if (down) await s('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      if (up) await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    },
    async key(key, { text } = {}) { await s('Input.dispatchKeyEvent', { type: 'keyDown', key, text }); await s('Input.dispatchKeyEvent', { type: 'keyUp', key }); },
    async type(text) { for (const ch of text) await s('Input.insertText', { text: ch }); },
    async waitFor(fn, { timeout = 15000, poll = 60, ...rest } = {}) {
      const start = Date.now();
      for (;;) { const v = await page.evaluate(fn, ...(rest.args || [])); if (v) return v; if (Date.now() - start > timeout) throw new Error('waitFor timeout: ' + fn.toString().slice(0, 120)); await sleep(poll); }
    },
    async bringToFront() { await s('Page.bringToFront'); },
    async addInitScript(fnOrSource) { const source = typeof fnOrSource === 'function' ? `(${fnOrSource.toString()})();` : String(fnOrSource); await s('Page.addScriptToEvaluateOnNewDocument', { source }); },
    async setViewport(w, h) { await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile: false }); },
    async close() { try { await send('Browser.close'); } catch {} chrome.kill('SIGKILL'); }
  };
  return { chrome, page, send, on, once, close: page.close };
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
