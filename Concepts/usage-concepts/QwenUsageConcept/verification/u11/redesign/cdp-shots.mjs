/* One-off headless-Chrome CDP screenshot harness for the U11 redesign audit.
   Usage: node cdp-shots.mjs  (server must be running on :8741) */
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9223;
const BASE = 'http://localhost:8741/u11-prism.html';
mkdirSync(HERE, { recursive: true });

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + PORT, '--hide-scrollbars', 'about:blank'
], { stdio: 'ignore' });

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json');
      const list = await r.json();
      const page = list.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('chrome did not start');
}

const ws = new WebSocket(await getWsUrl());
let id = 0;
const pending = new Map();
ws.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
await new Promise(res => ws.addEventListener('open', res, { once: true }));
const send = (method, params = {}) => new Promise(res => {
  const i = ++id; pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function shot(name) {
  const { result } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(HERE, name + '.png'), Buffer.from(result.data, 'base64'));
  console.log('shot', name);
}
const js = expr => send('Runtime.evaluate', { expression: expr, awaitPromise: true });
async function open() { await send('Page.navigate', { url: BASE }); await sleep(2800); }

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

await open(); await sleep(1400); await shot('31-overview-dark');

for (const [tab, name] of [['accounts', '32-accounts'], ['free', '33-free'], ['analytics', '34-analytics']]) {
  await js(`document.querySelector('.u11-item[data-tab="${tab}"]').click()`);
  await sleep(2300); await shot(name);
}
await js(`document.querySelector('[data-more-toggle]').click()`); await sleep(400);
for (const [tab, name] of [['attention', '35-attention'], ['cache', '36-cache'], ['tools', '37-tools'], ['authority', '38-authority']]) {
  await js(`document.querySelector('.u11-item[data-tab="${tab}"]').click()`);
  await sleep(2300); await shot(name);
}
await js(`document.querySelector('.u11-item[data-tab="overview"]').click()`); await sleep(800);
await js(`document.querySelector('#u11Disc [data-disc="advanced"]').click()`); await sleep(2300);
await shot('39-advanced');

await js(`localStorage.setItem('pm.theme','friendly-light')`);
await open(); await sleep(1400); await shot('40-light');
await js(`localStorage.setItem('pm.theme','glass-dark')`);
await open(); await sleep(1400); await shot('41-glass');

chrome.kill();
console.log('done');
process.exit(0);
