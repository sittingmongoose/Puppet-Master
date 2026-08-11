#!/usr/bin/env node
/* Headless fit-check runner for the side panel bakeoff.
   =====================================================================
   The in-page "Run fit check" button needs no dependencies and works from a
   double-clicked file. This runner exists for CI and for producing an
   attachable report:

     node tools/fitcheck_headless.mjs [--out fit-report.json] [--port 8741]

   Exits 1 if any R-tier finding survives, 0 otherwise. Also writes a static
   fit-report.html carrying the same matrix, so a review can be attached
   without anyone running anything.

   DEPENDENCY: playwright-core is installed nowhere in this repo (verified).
   The existing pm7-tools/verify scripts assume you install it into a scratch
   dir at run time; do the same:

     npm i --prefix /tmp/pm-fit playwright-core
     node tools/fitcheck_headless.mjs --modules /tmp/pm-fit/node_modules

   WHY NOT EXTEND Concepts/pm7-tools/verify/capture_matrix.mjs:
   those scripts are welded to the PM6-vs-PM7 pixel-parity mission -- a
   hard-coded 35-entry SHOTS array, and waits on window.PM_DEMO, window.PM_PAGES
   and #pm6StatusIndex.pm6-index-done, none of which exist here. They are also
   cited in PMConcept7-NOTES.md as part of the PM7 re-derivation recipe, so
   changing them would invalidate it. Only the determinism preamble is forked.

   A LOCAL SERVER IS REQUIRED even though the page works from file://. Chrome
   gives every file:// document an opaque origin, so a headless run cannot read
   cross-document state reliably. Serving from 127.0.0.1 sidesteps it entirely.
   ===================================================================== */

import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const PORT = parseInt(arg('port', '8741'), 10);
const OUT = resolve(arg('out', join(ROOT, 'fit-report.json')));
const MODULES = arg('modules', null);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
      if (rel.includes('..')) { res.writeHead(403).end('no'); return; }
      const body = await readFile(join(ROOT, rel));
      res.writeHead(200, { 'content-type': MIME[extname(rel)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  return server;
}

async function loadPlaywright() {
  /* playwright-core is CJS. Under Node's ESM interop the named exports are
     usually hoisted, but not always -- depending on the version and on whether
     the specifier resolved through package.json exports or through a direct
     file path, `chromium` can arrive only under `.default`. Returning the raw
     namespace therefore yields `undefined` chromium and a confusing crash far
     from the cause. Normalise both shapes here. */
  const candidates = MODULES
    ? [pathToFileURL(join(resolve(MODULES), 'playwright-core', 'index.js')).href,
       pathToFileURL(join(resolve(MODULES), 'playwright-core')).href,
       'playwright-core']
    : ['playwright-core'];
  let lastErr = null;
  for (const spec of candidates) {
    try {
      const mod = await import(spec);
      const pw = mod.chromium ? mod : (mod.default && mod.default.chromium ? mod.default : null);
      if (pw && pw.chromium) return pw;
      lastErr = new Error('module loaded from ' + spec + ' but exposes no chromium export');
    } catch (e) { lastErr = e; }
  }
  {
    const e = lastErr || new Error('playwright-core not resolvable');
    console.error(
      '\nplaywright-core not found.\n' +
      '  npm i --prefix /tmp/pm-fit playwright-core\n' +
      '  node tools/fitcheck_headless.mjs --modules /tmp/pm-fit/node_modules\n' +
      '\nThe in-page "Run fit check" button needs no dependencies and is the\n' +
      'offline fallback: open index.html and press it.\n'
    );
    throw e;
  }
}

function renderHtmlReport(rep) {
  const cell = (tier) =>
    tier === 'fail' ? '#C93A3A' : tier === 'warn' ? '#B57C12' : tier === 'pass' ? '#12A97B' : '#2A2F35';
  const tierOf = (list) => {
    if (!list || !list.length) return 'pass';
    if (list.some((r) => r.tier === 'fail')) return 'fail';
    if (list.some((r) => r.tier === 'warn')) return 'warn';
    return 'pass';
  };
  const key = (v, p, t, w) => `${v}|${p}|${t}|${w}`;
  let rows = '';
  for (const v of rep.axes.versions) {
    for (const p of rep.axes.panels) {
      rows += `<tr><th>${v}</th><th>${p}</th>`;
      for (const t of rep.axes.themes) {
        for (const w of rep.axes.widths) {
          const list = rep.results[key(v, p, t, w)];
          const n = (list || []).filter((x) => x.tier !== 'suppressed').length;
          rows += `<td title="${v} / ${p} / ${t} / ${w}px - ${n || 'clean'}"><i style="background:${cell(tierOf(list))}"></i></td>`;
        }
      }
      rows += '</tr>';
    }
  }
  let head = '<tr><th></th><th></th>';
  for (const t of rep.axes.themes) head += `<th colspan="${rep.axes.widths.length}" class="rot">${t}</th>`;
  head += '</tr><tr><th>ver</th><th>panel</th>';
  for (const _ of rep.axes.themes) for (const w of rep.axes.widths) head += `<th class="w">${w}</th>`;
  head += '</tr>';

  const worst = Object.entries(rep.results)
    .map(([k, v]) => [k, v.filter((x) => x.tier === 'fail')])
    .filter(([, v]) => v.length)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 25);

  return `<!DOCTYPE html><meta charset="utf-8"><title>Fit report</title>
<style>
body{background:#101215;color:#E6EAEE;font:12px ui-monospace,Menlo,monospace;padding:20px}
h1{font-size:15px;color:#00E5A0;letter-spacing:.1em}
table{border-collapse:collapse;margin:14px 0}
th{font-weight:400;color:#8A939D;padding:2px 4px;text-align:left;white-space:nowrap}
th.rot{writing-mode:vertical-rl;height:80px}th.w{font-size:9px}
td{padding:0}i{display:block;width:15px;height:15px;border:1px solid #101215}
.sum{color:#8A939D;line-height:1.7}.sum b{color:#E6EAEE}
li{margin:3px 0;color:#8A939D}code{color:#FFB020}
</style>
<h1>PUPPET MASTER - SIDE PANEL FIT REPORT</h1>
<p class="sum"><b>${rep.totals.combos}</b> combinations &middot;
<b style="color:#FF5C5C">${rep.totals.fail}</b> R-tier &middot;
<b style="color:#FFB020">${rep.totals.warn}</b> W-tier &middot;
${rep.totals.suppressed} suppressed<br>
Green clean &middot; amber warnings only &middot; red at least one R-tier finding.
<b>v0-baseline is expected to be red</b>: it keeps the real sub-24px hit-target
defect in all 8 themes, which is how the checker proves it detects a
known-true failure.</p>
<table>${head}${rows}</table>
<h1>WORST 25 COMBINATIONS</h1><ul>
${worst.map(([k, v]) => `<li><b>${k}</b> - ${v.length} findings: ${
    [...new Set(v.map((x) => x.rule))].join(', ')
  }<br>&nbsp;&nbsp;e.g. <code>${v[0].rule}</code> ${v[0].el} - ${v[0].detail}</li>`).join('')}
</ul>`;
}

async function main() {
  const server = await serve();
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  /* Determinism preamble, forked from pm7-tools/verify/capture_matrix.mjs:
     fixed viewport, DPR 1, seeded RNG and a frozen clock so nothing in the
     page can vary between runs. */
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference'
  });
  await ctx.addInitScript(() => {
    let s = 0x2f6e2b1;
    Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const FROZEN = 1789000000000;
    const RealDate = Date;
    // eslint-disable-next-line no-global-assign
    Date = class extends RealDate {
      constructor(...a) { super(...(a.length ? a : [FROZEN])); }
      static now() { return FROZEN; }
    };
  });

  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.PM_FIT && window.PM_BAKEOFF, null, { timeout: 15000 });

  const rep = await page.evaluate(async () => {
    const r = await window.PM_FIT.runMatrix({
      registry: window.PM_BAKEOFF.versions(),
      buildStage: window.PM_BAKEOFF.buildStage
    });
    return JSON.parse(JSON.stringify(r));
  });

  await browser.close();
  server.close();

  if (rep.aborted) {
    console.error('ABORTED: ' + rep.abortReason);
    console.error(rep.note || '');
    process.exit(2);
  }

  await writeFile(OUT, JSON.stringify({ report: rep, pageErrors: errors }, null, 2));
  const htmlOut = OUT.replace(/\.json$/, '.html');
  await writeFile(htmlOut, renderHtmlReport(rep));

  console.log(`combinations : ${rep.totals.combos}`);
  console.log(`R-tier       : ${rep.totals.fail}`);
  console.log(`W-tier       : ${rep.totals.warn}`);
  console.log(`suppressed   : ${rep.totals.suppressed}`);
  if (errors.length) console.log(`page errors  : ${errors.length}`);
  console.log(`wrote        : ${OUT}`);
  console.log(`wrote        : ${htmlOut}`);

  /* Per-version R-tier, so a green redesign is visible next to a red baseline. */
  const perVersion = {};
  for (const [k, list] of Object.entries(rep.results)) {
    const v = k.split('|')[0];
    perVersion[v] = (perVersion[v] || 0) + list.filter((x) => x.tier === 'fail').length;
  }
  console.log('\nR-tier by version:');
  for (const [v, n] of Object.entries(perVersion)) {
    console.log(`  ${v.padEnd(4)} ${String(n).padStart(5)}${v === 'v0' ? '   <- expected: the control keeps the real defects' : ''}`);
  }

  const nonBaseline = Object.entries(perVersion).filter(([v]) => v !== 'v0').reduce((a, [, n]) => a + n, 0);
  process.exit(nonBaseline > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(3); });
