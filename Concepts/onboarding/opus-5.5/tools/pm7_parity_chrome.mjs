/* agent-browser admission and the existing pm_cdp driver API, with direct CDP transport.
 * Avoids the legacy NUL-pipe parser's repeated copies of ~40 MB DOMSnapshot responses. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync } from 'node:fs';
import { CdpWebSocket } from './cdp-websocket.mjs';

const command = promisify(execFile), live = new Set();
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
  await Promise.allSettled([...live].map(browser => browser.close())); process.exit(signal === 'SIGINT' ? 130 : 143);
});
export async function launch({ width = 1600, height = 900, scale = 1 } = {}) {
  const { stdout } = await command('agent-browser', ['start', '--url', 'about:blank'], { maxBuffer: 2 ** 20, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  const session = JSON.parse(stdout), pending = new Map(), listeners = new Set();
  let socket, serial = 0, closing;
  const rejectAll = error => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error); } pending.clear(); };
  const browser = { chrome: { pid: session.pid }, session,
    close() {
      if (closing) return closing;
      closing = (async () => {
        try { socket?.close(); rejectAll(Error('Browser closed')); }
        finally { await command('agent-browser', ['stop', session.id], { maxBuffer: 2 ** 20, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } }); live.delete(browser); }
      })();
      return closing;
    }
  };
  live.add(browser);
  try {
    const version = await (await fetch(session.cdp_endpoint + '/json/version')).json();
    socket = new CdpWebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', e => reject(e.error), { once: true }); });
    socket.addEventListener('error', e => rejectAll(e.error || Error(e.message)));
    socket.addEventListener('close', () => rejectAll(Error('CDP socket closed')));
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch (error) { rejectAll(Error('Invalid CDP JSON: ' + error)); return; }
      if (pending.has(message.id)) {
        const p = pending.get(message.id); pending.delete(message.id); clearTimeout(p.timer);
        if (message.error) p.reject(Error(JSON.stringify(message.error))); else p.resolve(message.result);
      } else if (message.method) {
        for (const listener of listeners) if (listener.method === message.method && (!listener.session || listener.session === message.sessionId)) listener.fn(message.params);
      }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, method === 'Runtime.evaluate' ? 1200000 : 90000);
      pending.set(id, { resolve, reject, timer });
      try { socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }
      catch (error) { pending.delete(id); clearTimeout(timer); reject(error); }
    });
    const on = (method, fn, session) => { const listener = { method, fn, session }; listeners.add(listener); return () => listeners.delete(listener); };
    browser.send = send;
    const { sessionId } = await send('Target.attachToTarget', { targetId: session.target_id, flatten: true });
    const s = (method, params) => send(method, params || {}, sessionId);
    const errors = [];
    on('Runtime.exceptionThrown', p => errors.push('EXC: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text).slice(0, 400)), sessionId);
    on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push('console.error: ' + p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300)); }, sessionId);
    const page = browser.page = {
      send: s, errors, on: (method, fn) => on(method, fn, sessionId),
      async goto(url, { timeout = 90000 } = {}) {
        let off, timer;
        const loaded = new Promise((resolve, reject) => {
          off = on('Page.loadEventFired', resolve, sessionId);
          timer = setTimeout(() => reject(Error('Page load timeout')), timeout);
        });
        try { const result = await s('Page.navigate', { url }); if (result.errorText) throw Error(result.errorText); await loaded; }
        finally { off(); clearTimeout(timer); }
      },
      async evaluate(fnOrExpression, ...args) {
        const expression = typeof fnOrExpression === 'function' ? `(${fnOrExpression.toString()})(${args.map(arg => JSON.stringify(arg)).join(',')})` : fnOrExpression;
        const result = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
        if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
        return result.result.value;
      },
      async screenshot(path) { const { data } = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); const bytes = Buffer.from(data, 'base64'); if (path) writeFileSync(path, bytes); return bytes; },
      setViewport: (width, height) => s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false }),
      bringToFront: () => s('Page.bringToFront'),
      async key(key) { await s('Input.dispatchKeyEvent', { type: 'keyDown', key }); await s('Input.dispatchKeyEvent', { type: 'keyUp', key }); },
      async mouse(x, y, { down = true, up = true, move = true } = {}) {
        if (move) await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        if (down) await s('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        if (up) await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      }
    };
    for (const method of ['Page.enable', 'Runtime.enable', 'DOM.enable']) await s(method);
    await page.setViewport(width, height);
    return browser;
  } catch (error) { await browser.close().catch(() => {}); throw error; }
}
