/* AUDIT-ONLY probe 2: replicate the harness's exact state for the three
   assertions whose soundness is in question, plus a full request census to
   characterise the font-CDN console suppression. Writes to audit evidence. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence/probes/replay-assertion-soundness-probe.json';
const req = createRequire(path.join(__dirname, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');
const EXE = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((rq, rs) => {
  let u = decodeURIComponent((rq.url || '/').split('?')[0]);
  if (u === '/') u = '/u11-prism.html';
  const f = path.normalize(path.join(__dirname, u));
  if (!f.startsWith(__dirname) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { rs.writeHead(404); rs.end('nf'); return; }
  rs.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(rs);
});
await new Promise((r) => server.listen(8117, '127.0.0.1', r));
const ORIGIN = 'http://127.0.0.1:8117/';

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'u11-audit-probe2-' + process.pid), {
  headless: true, executablePath: EXE,
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check']
});
const out = { origin: ORIGIN, requests: [], requestfailed: [], console_all: [] };
const page = await ctx.newPage();
await page.setViewportSize({ width: 1700, height: 1000 });
/* exactly what runNewBehavior boots with */
await page.addInitScript((kv) => { try { Object.keys(kv).forEach((k) => localStorage.setItem(k, kv[k])); } catch {} },
  { 'pm.theme': 'friendly-dark', 'u11:disclosure': '"advanced"' });
page.on('request', (r) => out.requests.push({ url: r.url().slice(0, 140), type: r.resourceType() }));
page.on('requestfailed', (r) => out.requestfailed.push({ url: r.url().slice(0, 140), err: (r.failure() && r.failure().errorText) || '' }));
page.on('console', (m) => out.console_all.push({ type: m.type(), text: m.text().slice(0, 300), url: (m.location() && m.location().url) || '' }));
page.on('pageerror', (e) => out.console_all.push({ type: 'pageerror', text: String(e).slice(0, 300), url: '' }));

await page.goto(ORIGIN + 'u11-prism.html', { waitUntil: 'load', timeout: 30000 });
await page.waitForSelector('.us-page.u11', { timeout: 15000 });
await page.waitForTimeout(1200);

out.request_census = {
  total: out.requests.length,
  external: out.requests.filter((r) => !r.url.startsWith(ORIGIN)).map((r) => r.url + ' [' + r.type + ']'),
  failed: out.requestfailed,
  console_count_by_type: out.console_all.reduce((a, m) => (a[m.type] = (a[m.type] || 0) + 1, a), {})
};
out.fonts_loaded = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('link')).map((l) => ({ rel: l.rel, href: l.href.slice(0, 90) }));
  return { links, fontFaceCount: document.fonts ? document.fonts.size : 'n/a' };
});

/* ---- (A) authority rail at advanced: is it actually visible? ---- */
out.advonly_advanced = await page.evaluate(() => {
  const el = document.querySelector('.u11-advonly');
  if (!el) return { present: false };
  const chain = [];
  let n = el;
  while (n && n !== document.documentElement) {
    const cs = getComputedStyle(n);
    chain.push({ tag: n.tagName, cls: (n.className || '').toString().slice(0, 70),
      inlineStyle: (n.getAttribute('style') || '').slice(0, 70),
      display: cs.display, visibility: cs.visibility, height: n.offsetHeight, hiddenAttr: n.hasAttribute('hidden') });
    n = n.parentElement;
  }
  return {
    present: true,
    harness_assertion_inline_style_has_no_display_none: !/display:\s*none/.test(el.getAttribute('style') || ''),
    computedDisplay: getComputedStyle(el).display,
    offsetHeight: el.offsetHeight,
    clientRects: el.getClientRects().length,
    userVisible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    ancestor_chain: chain.slice(0, 6)
  };
});

/* ---- (B) token guard, in the harness's real state (ledger tab) ---- */
await page.click('.u11-rail .u11-item[data-tab="ledger"]');
await page.waitForSelector('.u11-pane[data-pane="ledger"]:not(.pm-hidden)', { timeout: 5000 });
await page.waitForTimeout(600);
out.token_guard_on_ledger = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('.u11w-opcard'));
  return {
    cardCount: cards.length,
    renderedCount: cards.filter((c) => !!(c.offsetWidth || c.offsetHeight)).length,
    innerTextLens: cards.map((c) => (c.innerText || '').length),
    emptyInnerTextCards: cards.filter((c) => !(c.innerText || '').trim()).length,
    codexPhaseCount: (() => { for (const c of cards) if (/Codex CLI update/.test(c.innerText)) return c.querySelectorAll('.u11w-ophase').length; return -1; })(),
    harness_clean_verdict: cards.length > 0 && !cards.some((c) => /\btok\b|tokens|K tokens/i.test(c.innerText))
  };
});

/* ---- (C) unconfigured-provider guard in the harness's real state (free tab) ---- */
await page.click('.u11-rail .u11-item[data-tab="free"]');
await page.waitForSelector('.u11-pane[data-pane="free"]:not(.pm-hidden)', { timeout: 5000 });
await page.waitForTimeout(600);
out.unconfigured_guard_on_free = await page.evaluate(() => {
  const names = ['Mistral', 'Fireworks', 'OpenRouter', 'Cohere'];
  const vis = document.body.innerText;
  const dom = document.documentElement.outerHTML;
  return {
    visibleTextLen: vis.length,
    serializedDomLen: dom.length,
    coverage_ratio: +(vis.length / dom.length).toFixed(4),
    per_name: names.map((n) => ({ n, visible: vis.indexOf(n) >= 0, dom: dom.indexOf(n) >= 0 })),
    harness_absent_verdict: names.every((n) => vis.indexOf(n) === -1),
    dom_level_verdict: names.every((n) => dom.indexOf(n) === -1)
  };
});

await page.close(); await ctx.close(); server.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('REQUESTS total=' + out.request_census.total + ' external=' + JSON.stringify(out.request_census.external));
console.log('FAILED=' + JSON.stringify(out.request_census.failed));
console.log('CONSOLE by type=' + JSON.stringify(out.request_census.console_count_by_type));
console.log('FONT LINKS=' + JSON.stringify(out.fonts_loaded));
console.log('ADVONLY=' + JSON.stringify(out.advonly_advanced, null, 1));
console.log('TOKEN GUARD=' + JSON.stringify(out.token_guard_on_ledger));
console.log('UNCONFIGURED GUARD=' + JSON.stringify(out.unconfigured_guard_on_free, null, 1));
process.exit(0);
