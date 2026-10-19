/* agent-browser admission and the existing pm_cdp driver API, with direct CDP transport.
 * Avoids the legacy NUL-pipe parser's repeated copies of ~40 MB DOMSnapshot responses. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync } from 'node:fs';
import { CdpWebSocket } from './cdp-websocket.mjs';
import { gotoRemoteDocument } from './pm7_parity_remote.mjs';

const command = promisify(execFile), live = new Set();
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
  await Promise.allSettled([...live].map(browser => browser.close())); process.exit(signal === 'SIGINT' ? 130 : 143);
});
export async function launch({ width = 1600, height = 900, scale = 1, host, remoteCdp = 'ssh' } = {}) {
  if (host && !['windows', 'mac'].includes(host)) throw Error('Remote host must be windows or mac');
  if (!['ssh', 'lan'].includes(remoteCdp) || (!host && remoteCdp !== 'ssh')) throw Error('Remote CDP transport requires --host and ssh or lan');
  const cli = host ? 'gpu-browser' : 'agent-browser';
  const invoke = args => command(cli, args, { maxBuffer: 2 ** 20, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  const { stdout } = await invoke(['start', ...(host ? ['--host', host] : []), '--url', 'about:blank']);
  const session = JSON.parse(stdout), pending = new Map(), listeners = new Set();
  let socket, serial = 0, closing, keepalive, keepalivePending;
  const rejectAll = error => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error); } pending.clear(); };
  const browser = { chrome: { pid: host ? session.backend?.chrome_pid : session.pid }, session, host,
    transport: host ? remoteCdp : 'local', lifecycle: { keepaliveErrors: [] },
    close() {
      if (closing) return closing;
      closing = (async () => {
        clearInterval(keepalive);
        try { socket?.close(); rejectAll(Error('Browser closed')); }
        finally {
          await keepalivePending;
          const stoppedOutput = await invoke(['stop', session.id]);
          if (host) {
            const stopped = JSON.parse(stoppedOutput.stdout);
            browser.lifecycle.stopped = stopped.status;
            if (!['complete', 'stopped'].includes(stopped.status)) throw Error('Remote browser did not stop: ' + stopped.status);
            browser.lifecycle.purged = JSON.parse((await invoke(['purge', session.id])).stdout).purged;
            if (!browser.lifecycle.purged) throw Error('Remote session was not purged: ' + session.id);
          } else browser.lifecycle.stopped = true;
          live.delete(browser);
        }
      })();
      return closing;
    }
  };
  live.add(browser);
  try {
    if (host && session.host !== host) throw Error('Remote browser started on unexpected host: ' + session.host);
    const endpoint = host ? JSON.parse((await invoke(['connect', session.id, ...(remoteCdp === 'lan' ? ['--lan'] : [])])).stdout).cdp_endpoint : session.cdp_endpoint;
    const socketUrl = endpoint.startsWith('ws:') ? endpoint : (await (await fetch(endpoint + '/json/version')).json()).webSocketDebuggerUrl;
    socket = new CdpWebSocket(socketUrl, { allowRemote: !!host && remoteCdp === 'lan' });
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
    async function attachPage(targetId) {
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (method, params) => send(method, params || {}, sessionId);
    const errors = [], ownedListeners = [];
    const listen = (method, fn) => { const off = on(method, fn, sessionId); ownedListeners.push(off); return off; };
    listen('Runtime.exceptionThrown', p => errors.push('EXC: ' + (p.exceptionDetails.exception?.description || p.exceptionDetails.text).slice(0, 400)));
    listen('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push('console.error: ' + p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300)); });
    const page = {
      send: s, errors, on: listen, disposeListeners: () => ownedListeners.splice(0).forEach(off => off()),
      async goto(url, { timeout = 90000 } = {}) {
        if (host) return gotoRemoteDocument(s, listen, url, timeout);
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
    if (host) await s('Page.setLifecycleEventsEnabled', { enabled: true });
    await page.setViewport(width, height);
    return page;
    }
    browser.page = await attachPage(session.target_id);
    browser.resetContext = async () => {
      browser.page.disposeListeners();
      if (browser.contextId) await send('Target.disposeBrowserContext', { browserContextId: browser.contextId });
      else await send('Target.closeTarget', { targetId: session.target_id });
      const { browserContextId } = await send('Target.createBrowserContext', { disposeOnDetach: true });
      browser.contextId = browserContextId;
      const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId, newWindow: true });
      browser.page = await attachPage(targetId);
      return browser.page;
    };
    if (host) keepalive = setInterval(() => {
      if (!keepalivePending) keepalivePending = invoke(['keepalive', session.id])
        .catch(error => browser.lifecycle.keepaliveErrors.push(String(error)))
        .finally(() => { keepalivePending = null; });
    }, 60_000).unref();
    return browser;
  } catch (error) {
    try { await browser.close(); } catch (cleanup) { throw new AggregateError([error, cleanup], 'Browser startup and cleanup failed'); }
    throw error;
  }
}
