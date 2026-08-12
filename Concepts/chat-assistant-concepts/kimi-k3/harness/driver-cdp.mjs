/* Kimi K3 harness — zero-dependency CDP driver.
   Launches system Chrome/Edge headless with an OS-assigned debugging port and
   a unique temp profile; speaks just enough CDP (Target/Page/Runtime/
   Emulation/Log) over Node 22's global WebSocket.

   Interface (shared with driver-playwright.mjs):
     const d = await launch();
     const page = await d.open(url, {width, height, reducedMotion});
     await page.evaluate(exprOrFn, ...);        // returnByValue
     await page.waitFor(fnExpr, {timeout});     // poll until truthy
     page.console  // [{type, text}]
     page.errors   // [text]
     await page.screenshot();                   // -> absolute png path (OS temp)
     await page.close(); await d.close();
*/
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].filter(Boolean);

function findBrowser() {
  for (const p of CANDIDATES) { try { if (existsSync(p)) return p; } catch (e) { /* next */ } }
  throw new Error('no Chrome/Edge binary found');
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map(); // method -> [fn]
    ws.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.id != null) {
        const p = this.pending.get(msg.id);
        if (p) { this.pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); }
      } else if (msg.method) {
        const list = this.handlers.get(msg.method);
        if (list) list.forEach((fn) => { try { fn(msg.params, msg.sessionId); } catch (e) { /* handler */ } });
      }
    });
  }
  send(method, params, sessionId, timeoutMs = 15000) {
    const id = this.nextId++;
    const payload = { id, method, params: params || {} };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, timeoutMs);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
      this.ws.send(JSON.stringify(payload));
    });
  }
  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }
}

export async function launch(opts) {
  const bin = (opts && opts.executablePath) || findBrowser();
  const profile = mkdtempSync(join(tmpdir(), 'k3h-prof-'));
  const proc = spawn(bin, [
    '--headless=new', '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-sync', '--mute-audio', '--force-color-profile=srgb',
    '--disable-features=Translate', '--hide-scrollbars',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const onData = (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) { proc.stderr.off('data', onData); resolve(m[1]); }
    };
    proc.stderr.on('data', onData);
    proc.on('exit', () => reject(new Error('browser exited before DevTools URL')));
    setTimeout(() => reject(new Error('DevTools URL timeout')), 20000);
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  const cdp = new Cdp(ws);
  const driver = {
    proc, cdp, profile,
    async open(url, o) {
      const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
      await cdp.send('Page.enable', {}, sessionId);
      await cdp.send('Runtime.enable', {}, sessionId);
      await cdp.send('Log.enable', {}, sessionId).catch(() => {});
      const page = makePage(cdp, sessionId, targetId);
      if (o && o.width) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: o.width, height: o.height || 800, deviceScaleFactor: o.scale || 1, mobile: false }, sessionId);
      }
      if (o && o.reducedMotion) {
        await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
      }
      if (url) await page.goto(url);
      return page;
    },
    async close() {
      try { await cdp.send('Browser.close'); } catch (e) { /* already gone */ }
      try { proc.kill('SIGKILL'); } catch (e) { /* noop */ }
      try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* locked */ }
    }
  };
  return driver;
}

function makePage(cdp, sessionId, targetId) {
  const consoleLog = [];
  const errors = [];
  cdp.on('Runtime.consoleAPICalled', (p, sid) => {
    if (sid !== sessionId) return;
    const text = (p.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ');
    consoleLog.push({ type: p.type, text });
    if (p.type === 'error') errors.push(text);
  });
  cdp.on('Runtime.exceptionThrown', (p, sid) => {
    if (sid !== sessionId) return;
    const d = p.exceptionDetails || {};
    errors.push('exception: ' + (d.text || '') + ' ' + ((d.exception && d.exception.description) || ''));
  });
  cdp.on('Log.entryAdded', (p, sid) => {
    if (sid !== sessionId) return;
    const e = p.entry || {};
    consoleLog.push({ type: e.level, text: e.text });
    if (e.level === 'error' && !/favicon|fonts\.|net::ERR_INTERNET|net::ERR_NAME|404/.test(e.text || '')) errors.push(e.text);
  });

  async function evaluate(expr, ...args) {
    let expression;
    if (typeof expr === 'function') {
      expression = '(' + expr.toString() + ')(' + args.map((a) => JSON.stringify(a)).join(',') + ')';
    } else {
      expression = String(expr);
    }
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('evaluate failed: ' + (r.exceptionDetails.text || '') + ' ' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || ''));
    return r.result ? r.result.value : undefined;
  }
  const loadWaiters = [];
  cdp.on('Page.loadEventFired', (p, sid) => { if (sid === sessionId) loadWaiters.splice(0).forEach((fn) => fn()); });

  return {
    console: consoleLog,
    errors,
    sessionId, targetId,
    evaluate,
    async goto(url) {
      const loaded = new Promise((res) => loadWaiters.push(res));
      await cdp.send('Page.navigate', { url }, sessionId);
      await Promise.race([loaded, new Promise((res) => setTimeout(res, 15000))]);
    },
    async waitFor(fnExpr, o) {
      const timeout = (o && o.timeout) || 10000;
      const start = Date.now();
      for (;;) {
        const v = await evaluate(fnExpr).catch(() => false);
        if (v) return v;
        if (Date.now() - start > timeout) throw new Error('waitFor timeout: ' + String(fnExpr).slice(0, 120));
        await new Promise((res) => setTimeout(res, 120));
      }
    },
    async setViewport(w, h) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h || 800, deviceScaleFactor: 1, mobile: false }, sessionId);
    },
    async setReducedMotion(on) {
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : 'no-preference' }] }, sessionId);
    },
    async screenshot() {
      const r = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId, 30000);
      const file = join(mkdtempSync(join(tmpdir(), 'k3h-shot-')), 'frame.png');
      writeFileSync(file, Buffer.from(r.data, 'base64'));
      return file;
    },
    async close() {
      await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
    }
  };
}
