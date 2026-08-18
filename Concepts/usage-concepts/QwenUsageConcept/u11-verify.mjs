/* =====================================================================
   U11 — PRISM II · Playwright verification harness
   Final cumulative packet (2026-08-08) acceptance run.

   Collision-safe by design:
   - own static file server on port 8097 (bumps 8098/8099 if taken);
   - own Chrome via executablePath (never a shared browser);
   - isolated userDataDir under os.tmpdir()/u11-verify-<pid>
     (chromium.launchPersistentContext — the context IS the browser);
   - headless, viewport-driven widths.

   Output:
   - reports/visual-interaction-test-report.json
   - verify-shots/*.png
   ===================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTS = [8097, 8098, 8099];
const WIDTHS = [900, 1280, 1700, 2200, 2500];
const THEMES = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light',
  'retro-dark', 'retro-light', 'basic-dark', 'basic-light'];
const SHOTS = path.join(__dirname, 'verify-shots');
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });

/* The canonical Settings inventory, read from the repo rather than restated
   here: a deep link that names a focus_setting_id canon does not carry is an
   invented destination however plausible the string reads (audit A11-09). */
const SETTINGS_INVENTORY = (() => {
  const candidates = [
    process.env.PM_PLANS && path.join(process.env.PM_PLANS, 'settings_inventory.json'),
    path.resolve(__dirname, '..', '..', '..', 'Plans', 'settings_inventory.json'),
    path.resolve(__dirname, '..', '..', 'Plans', 'settings_inventory.json')
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      const ids = {};
      (j.settings || []).forEach((s) => { if (s && s.id) ids[s.id] = true; });
      return { path: p, ids, count: Object.keys(ids).length, error: null };
    } catch { /* try next */ }
  }
  return { path: candidates[candidates.length - 1], ids: null, count: 0,
    error: 'settings_inventory.json not found; set PM_PLANS to the Plans directory' };
})();

/* ---------- playwright-core resolution (NAS install, then temp fallback) ---------- */
function loadPlaywright() {
  const candidates = [
    path.join(__dirname, '.verify', 'node_modules'),
    path.join(process.env.TEMP || os.tmpdir(), 'u11-verify-deps', 'node_modules'),
    path.join(__dirname, 'node_modules')
  ];
  for (const dir of candidates) {
    try {
      const req = createRequire(path.join(dir, '__probe.js'));
      return req('playwright-core');
    } catch { /* try next */ }
  }
  throw new Error('playwright-core not found. Run: npm install --prefix <concept>/.verify playwright-core');
}
const { chromium } = loadPlaywright();

/* Browser resolution.

   This used to be two Windows paths with no fallback, so the harness could not
   run at all on Linux or macOS — the concept's own acceptance suite was
   unrunnable on the machine the concept was being developed on, and every
   verification pass had to patch this line in a scratch copy first. Resolve
   across platforms, honour an override, and fail with a useful message. */
const CHROME_CANDIDATES = [
  process.env.PM_CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  path.join(os.homedir(), '.cache/ms-playwright/chromium-1234/chrome-linux64/chrome')
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
if (!executablePath) {
  console.error('No Chrome or Edge found. Set PM_CHROME to a browser executable. Looked in:\n  ' +
    CHROME_CANDIDATES.join('\n  '));
  process.exit(2);
}

/* ---------- results ---------- */
const cases = [];
const screenshots = [];
function record(name, ok, detail) {
  cases.push({ name, status: ok ? 'pass' : 'fail', detail: detail || '' });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
}
function shot(name) {
  const p = path.join(SHOTS, name + '.png');
  screenshots.push('verify-shots/' + name + '.png');
  return p;
}

/* ---------- tiny static server rooted at the concept dir ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/u11-prism.html';
    const file = path.normalize(path.join(__dirname, urlPath));
    if (!file.startsWith(__dirname) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    let i = 0;
    const tryListen = () => {
      server.once('error', (e) => {
        if (e.code === 'EADDRINUSE' && i < PORTS.length - 1) { i++; tryListen(); } else reject(e);
      });
      server.listen(PORTS[i], '127.0.0.1', () => resolve({ server, port: PORTS[i] }));
    };
    tryListen();
  });
}

/* ---------- page helpers (persistent context: pages come off the context) ---------- */
function ignoreConsoleError(msg) {
  /* offline boxes fail only on remote fonts; everything else counts */
  const loc = (msg.location() && msg.location().url) || '';
  const txt = msg.text();
  return /fonts\.g(oogleapis|static)\.com/.test(loc) || /fonts\.g(oogleapis|static)\.com/.test(txt);
}
async function bootPage(ctx, port, opts) {
  const o = opts || {};
  const page = await ctx.newPage();
  await page.setViewportSize({ width: o.width || 1700, height: 1000 });
  const initKV = Object.assign({}, o.init || {}, { 'pm.theme': o.theme || 'friendly-dark' });
  /* u11:disclosure / u11:scope are read via JSON.parse — values must already
     be JSON-encoded strings */
  await page.addInitScript((kv) => {
    try { Object.keys(kv).forEach((k) => localStorage.setItem(k, kv[k])); } catch {}
  }, initKV);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !ignoreConsoleError(m)) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/u11-prism.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('.us-page.u11', { timeout: 15000 });
  await page.waitForTimeout(650); /* boot animations + deferred renders */
  return { page, errors };
}
async function visibleText(page) {
  return page.evaluate(() => document.body.innerText);
}
async function underscoreCount(page) {
  return page.evaluate(() => {
    let n = 0;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(t) {
        const p = t.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('[hidden]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) {
      const v = w.currentNode.nodeValue;
      if (v.indexOf('_') >= 0) n += (v.match(/_/g) || []).length;
    }
    return n;
  });
}
async function clearToasts(page) {
  await page.evaluate(() => { document.querySelectorAll('.rail-toast').forEach((t) => t.remove()); });
}
async function toastAfter(page, action, regex) {
  await clearToasts(page);
  await action();
  await page.waitForSelector('.rail-toast', { timeout: 5000 });
  const t = await page.evaluate(() => {
    const el = document.querySelector('.rail-toast');
    return el ? el.textContent : '';
  });
  return { ok: !regex || regex.test(t), t };
}
async function goToTab(page, name) {
  await page.click(`.u11-rail .u11-item[data-tab="${name}"]`);
  await page.waitForSelector(`.u11-pane[data-pane="${name}"]:not(.pm-hidden)`, { timeout: 5000 });
  await page.waitForTimeout(450);
}
async function setDisclosure(page, lvl) {
  await page.click(`#u11Disc button[data-disc="${lvl}"]`);
  await page.waitForTimeout(500); /* canvases remount */
}

/* =====================================================================
   CHECKS
   ===================================================================== */
async function runMatrix(ctx, port) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const name = `matrix ${theme} @ ${width}px`;
      let page = null;
      try {
        const booted = await bootPage(ctx, port, { theme, width });
        page = booted.page;
        const rail = await page.locator('.u11-rail .u11-item').count();
        const us = await page.locator('.us-page.u11').count();
        const underscores = await underscoreCount(page);
        const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        const ok = us >= 1 && rail >= 10 && underscores === 0 && booted.errors.length === 0 && themeAttr === theme;
        record(name, ok,
          `page=${us} rail=${rail} underscores=${underscores} consoleErrors=${booted.errors.length}` +
          (booted.errors.length ? ' :: ' + booted.errors.slice(0, 2).join(' | ') : ''));
        if (width === 1700) await page.screenshot({ path: shot(`theme-${theme}-1700`), fullPage: false });
      } catch (e) {
        record(name, false, String(e).slice(0, 200));
      }
      if (page) await page.close();
    }
  }
}

async function runInteractions(ctx, port) {
  const { page, errors } = await bootPage(ctx, port, {
    theme: 'friendly-dark', width: 1700,
    init: { 'u11:disclosure': '"essentials"', 'u11:scope': '"scope:all"' }
  });

  /* scope picker → fam:openai → chip updates */
  try {
    await page.click('[data-scope-open]');
    await page.waitForSelector('#u11Pop.on', { timeout: 3000 });
    await page.click('#u11PopList [data-scopeid="fam:openai"]');
    await page.waitForFunction(() => {
      const c = document.getElementById('u11ScopeChip');
      return c && c.textContent.trim() === 'OpenAI';
    }, { timeout: 4000 });
    record('interaction scope picker → OpenAI chip', true);
    /* back to all */
    await page.click('[data-scope-open]');
    await page.waitForSelector('#u11Pop.on', { timeout: 3000 });
    await page.click('#u11PopList [data-scopeid="scope:all"]');
    await page.waitForTimeout(400);
  } catch (e) { record('interaction scope picker → OpenAI chip', false, String(e).slice(0, 200)); }

  /* disclosure Std → Adv toggles authority rail visibility */
  try {
    await setDisclosure(page, 'standard');
    const hiddenAtStd = await page.evaluate(() => {
      const el = document.querySelector('.u11-advonly');
      return el ? /display:\s*none/.test(el.getAttribute('style') || '') : true;
    });
    await setDisclosure(page, 'advanced');
    const visibleAtAdv = await page.evaluate(() => {
      const el = document.querySelector('.u11-advonly');
      /* inline display:none is stripped for advanced; the More group may still
         collapse the computed box, so assert the disclosure-driven style */
      return el ? !/display:\s*none/.test(el.getAttribute('style') || '') : false;
    });
    record('interaction disclosure Std→Adv toggles authority rail', hiddenAtStd && visibleAtAdv,
      `hidden@std=${hiddenAtStd} visible@adv=${visibleAtAdv}`);
  } catch (e) { record('interaction disclosure Std→Adv toggles authority rail', false, String(e).slice(0, 200)); }

  /* Settings sheet reports policy and routes to the canonical setting.

     Rewritten 2026-08-18. This case used to assert the toast text produced by an
     invented deep-link payload {surface, manager, section, focus_reason}, so it
     green-lit a vocabulary canon does not define — the harness was certifying the
     defect (audit A11-09). It now asserts the real contract: the sheet writes no
     policy, and the change route dispatches cmd.settings.bloom.open (F3-434)
     carrying a category and a settings row id that exist in canon. */
  try {
    await page.click('#u11Settings');
    await page.waitForSelector('#u11SheetSprout:not([hidden])', { timeout: 3000 });
    const writers = await page.evaluate(() =>
      document.querySelectorAll('#u11SheetSprout [data-u11set],#u11SheetSprout [data-u11extra],#u11SheetSprout [data-u11limit]').length);
    const before = await page.evaluate(() => window.U11.cmdLog.length);
    await page.click('#u11SheetSprout [data-u11open]');
    const dl = await page.evaluate((n) => {
      const e = window.U11.cmdLog.slice(n).filter((c) => c.cmd === 'cmd.settings.bloom.open').pop();
      return e && e.payload ? { cat: e.payload.category, id: e.payload.focus_setting_id } : null;
    }, before);
    const stored = await page.evaluate(() => localStorage.getItem('u11:settings'));
    record('interaction settings sheet routes to canonical Settings and writes no policy',
      writers === 0 && stored == null && !!dl && dl.cat === 'ai' && /^ai\./.test(dl.id || ''),
      `policyInputs=${writers} u11:settings=${stored} dispatch=${JSON.stringify(dl)}`);
    await page.click('body', { position: { x: 5, y: 5 } });
  } catch (e) { record('interaction settings sheet routes to canonical Settings and writes no policy', false, String(e).slice(0, 200)); }

  /* export flow: records → JSONL → cmd.usage.export in cmdLog */
  try {
    await page.click('#u11Export');
    await page.waitForSelector('#u11ExportSprout:not([hidden])', { timeout: 3000 });
    await page.click('#u11ExportSprout [data-u11exp="records"]');
    await page.click('#u11ExportSprout [data-u11fmt="jsonl"]');
    await page.click('#u11ExportSprout [data-u11expgo]');
    const has = await page.evaluate(() => window.U11.cmdLog.some((c) => c.cmd === 'cmd.usage.export'));
    record('interaction export records → JSONL → cmd.usage.export', has);
  } catch (e) { record('interaction export records → JSONL → cmd.usage.export', false, String(e).slice(0, 200)); }

  /* refresh button toasts */
  try {
    const r2 = await toastAfter(page, () => page.click('#u11Refresh'), /refreshed/i);
    record('interaction refresh toasts', r2.ok, r2.t);
  } catch (e) { record('interaction refresh toasts', false, String(e).slice(0, 200)); }

  record('interaction zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

async function runNewBehavior(ctx, port) {
  const { page, errors } = await bootPage(ctx, port, {
    theme: 'friendly-dark', width: 1700, init: { 'u11:disclosure': '"advanced"' }
  });

  /* BSD via ledger → open attempt ue-600 */
  try {
    await goToTab(page, 'ledger');
    await page.waitForSelector('.u11-pane[data-pane="ledger"] [data-att="ue-600"]', { timeout: 5000 });
    await page.click('.u11-pane[data-pane="ledger"] [data-att="ue-600"]');
    await page.waitForSelector('.u11rd.on', { timeout: 4000 });
    const txt = await page.evaluate(() => document.querySelector('.u11rd').innerText);
    /* section heads render uppercase via CSS text-transform */
    /* ue-600 carries no cacheWrite of its own even though its connection does
       expose the field, so the honest statement is attempt-level absence, not
       the route-level "not exposed" this case used to assert. Either way it
       must never be a zero. */
    const ok = /back seat driver/i.test(txt) && /silent check/i.test(txt) && /a silent provider call still counts/i.test(txt) &&
      /cache write/i.test(txt) && /not reported on this attempt/i.test(txt) &&
      !/cache write\s*\n?\s*0\b/i.test(txt);
    record('new BSD section in attempt inspector (ue-600)', ok);
    /* correction: verification call carries installation/acquisition note —
       open ue-609 through the operations widget CTA (its own work group) */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    await page.click('.u11w-opcard [data-att="ue-609"]');
    await page.waitForSelector('.u11rd.on', { timeout: 4000 });
    const acqNote = await page.evaluate(() => {
      const p = document.querySelector('.u11rd');
      return p ? /post-consent only/.test(p.innerText) && /official OpenAI installer/.test(p.innerText) : false;
    });
    record('correction inspector acquisition note on verification call (ue-609)', acqNote);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.screenshot({ path: shot('bsd-inspector') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) { record('new BSD section in attempt inspector (ue-600)', false, String(e).slice(0, 200)); }

  /* operations widget on Ledger tab */
  try {
    await page.waitForSelector('.u11w-opcard', { timeout: 5000 });
    const txt = await visibleText(page);
    const stages = await page.evaluate(() => {
      const cards = document.querySelectorAll('.u11w-opcard');
      for (const c of cards) { if (/Codex CLI update/.test(c.innerText)) return c.querySelectorAll('.u11w-ophase').length; }
      return -1;
    });
    const ok = /Codex CLI update/.test(txt) && /rolled back/.test(txt) && stages === 5;
    record('new operations widget (CLI update · rolled back · 5 stages)', ok, `stages=${stages}`);
    await page.screenshot({ path: shot('operations-widget') });
  } catch (e) { record('new operations widget (CLI update · rolled back · 5 stages)', false, String(e).slice(0, 200)); }

  /* correction: explicit acquisition lineage rendered (adjudication) */
  try {
    const acqOk = await page.evaluate(() => {
      const cards = document.querySelectorAll('.u11w-opcard');
      for (const c of cards) {
        if (/Codex CLI update/.test(c.innerText)) {
          return /Explicit user setup/.test(c.innerText) && /official OpenAI installer/.test(c.innerText) &&
            /post-consent only/.test(c.innerText) && /Studio PC/.test(c.innerText);
        }
      }
      return false;
    });
    record('correction acquisition lineage on cli_update (explicit setup · official source · bound host/env)', acqOk);
  } catch (e) { record('correction acquisition lineage on cli_update (explicit setup · official source · bound host/env)', false, String(e).slice(0, 200)); }

  /* correction: setup_required fixture — deep-link, never silent install */
  try {
    await page.waitForFunction(() => /Provider Setup Required/.test(document.body.innerText), { timeout: 5000 });
    await clearToasts(page);
    await page.click('.u11w-opcard [data-u11-act="setuplink"]');
    /* Asserts the canonical Settings open (F3-434) rather than the invented
       focus_reason token this case used to require (audit A11-09, A10-01). The
       continuation token must still survive, because preserving the originating
       operation is the part of the adjudication this fixture exists to prove. */
    const dl = await page.evaluate(() => {
      const e = window.U11.cmdLog.filter((c) => c.cmd === 'cmd.settings.bloom.open').pop();
      if (!e || !e.payload) return false;
      const okId = e.payload.category === 'ai' && /^ai\./.test(e.payload.focus_setting_id || '');
      const op = window.U11.operational.filter((x) => x.id === 'ops-8')[0];
      const keptContinuation = !!(op && op.setupLink && op.setupLink.continuation === 'cont-8841');
      return okId && keptContinuation;
    });
    const noInstall = await page.evaluate(() => {
      const o = window.U11.operational.filter((x) => x.id === 'ops-8')[0];
      return o.providerUsage === 'none' && !o.validationEventId;
    });
    record('correction setup_required → provider setup deep-link, no silent install', dl && noInstall);
    await page.screenshot({ path: shot('setup-required') });
  } catch (e) { record('correction setup_required → provider setup deep-link, no silent install', false, String(e).slice(0, 200)); }

  /* operations carry no token totals */
  try {
    const clean = await page.evaluate(() => {
      const cards = document.querySelectorAll('.u11w-opcard');
      for (const c of cards) {
        if (/\btok\b|tokens|K tokens/i.test(c.innerText)) return false;
      }
      return cards.length > 0;
    });
    record('guard maintenance entries carry no token totals', clean);
  } catch (e) { record('guard maintenance entries carry no token totals', false, String(e).slice(0, 200)); }

  /* Capacity envelope. Rewritten 2026-08-18 (audit A06-12): this used to wait
     for ANY element whose text contained the substring "sustainable" and then
     record pass, a predicate that cannot detect a missing value, a wrong
     number or a dropped envelope term. Each run's row is located through its
     own run-detail CTA and every ceiling the record carries is checked against
     what that row renders. */
  try {
    await goToTab(page, 'overview');
    await page.waitForSelector('.u11w-capenv', { timeout: 5000 });
    const env = await page.evaluate(() => {
      const d = window.U11;
      const problems = []; let runsChecked = 0, terms = 0;
      d.runs.forEach((run) => {
        const cap = run.capacity;
        if (!cap) return;
        const btn = document.querySelector('[data-u11-act="openrun"][data-run="' + run.id + '"]');
        const row = btn ? btn.closest('.u11w-prow') : null;
        const el = row ? row.querySelector('.u11w-capenv') : null;
        if (!el) { problems.push(run.id + ' renders no capacity envelope'); return; }
        runsChecked++;
        const txt = el.textContent;
        const want = { 'hard max': cap.hardMax, preferred: cap.configuredPreferred,
          advertised: cap.providerAdvertised, sustainable: cap.predictedSustainable };
        if (cap.actualPeak != null) want['actual peak'] = cap.actualPeak;
        Object.keys(want).forEach((term) => {
          if (want[term] == null) { problems.push(run.id + ' record carries no ' + term); return; }
          terms++;
          if (!new RegExp('\\b' + want[term] + '\\s+' + term.replace(' ', '\\s+') + '\\b').test(txt)) {
            problems.push(run.id + ' envelope does not render ' + want[term] + ' ' + term);
          }
        });
      });
      return { runsChecked, terms, problems };
    });
    record('new capacity envelope renders every ceiling the run record carries',
      env.runsChecked > 0 && env.terms > 0 && env.problems.length === 0,
      `runs=${env.runsChecked} ceilings=${env.terms} problems=${env.problems.length}` +
      (env.problems.length ? ' :: ' + env.problems.slice(0, 3).join(' | ') : ''));
    await page.screenshot({ path: shot('capacity-envelope') });
  } catch (e) { record('new capacity envelope renders every ceiling the run record carries', false, String(e).slice(0, 200)); }

  /* Forecast refresh. Renamed and re-scoped 2026-08-18 (audit A06-12): the
     case was called "forecast refresh" and asserted a dispatch, while the
     rendered recommendation, confidence and "generated HH:MM" line are
     byte-identical before and after — nothing about the forecast refreshes.
     Updated 2026-08-18: the refresh now genuinely recomputes from the run's
     own inputs rather than relabelling a frozen projection, so the case asserts
     that the rendered pane actually changed. It was proved to recompute rather
     than relabel by moving an input (queued children 6 to 12) and watching the
     projection follow it. */
  try {
    const before = await page.evaluate(() => document.querySelector('.u11-pane[data-pane="overview"]').innerText);
    const r3 = await toastAfter(page, () => page.click('[data-u11-act="reqforecast"]'), /\(demo\)/);
    const has = await page.evaluate(() => window.U11.cmdLog.some((c) => c.cmd === 'cmd.usage.forecast.request'));
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => document.querySelector('.u11-pane[data-pane="overview"]').innerText);
    record('new forecast refresh dispatches cmd.usage.forecast.request and recomputes the projection',
      has && r3.ok && before !== after, `${r3.t} · renderedForecastChanged=${before !== after}`);
  } catch (e) { record('new forecast refresh dispatches cmd.usage.forecast.request and recomputes the projection', false, String(e).slice(0, 200)); }

  /* account row: Use next */
  try {
    await goToTab(page, 'accounts');
    await page.waitForSelector('.u11-pane[data-pane="accounts"] [data-u11-act="usenext"]', { timeout: 5000 });
    const r4 = await toastAfter(page, () => page.click('.u11-pane[data-pane="accounts"] [data-u11-act="usenext"]'), /Future work will prefer/);
    const has = await page.evaluate(() => window.U11.cmdLog.some((c) => c.cmd === 'cmd.provider.switch_route'));
    const metaTxt = await page.evaluate(() => {
      const row = document.querySelector('.u11-pane[data-pane="accounts"] .u11w-acctmeta');
      return row ? row.textContent : '';
    });
    const lastUsedOk = /last used \d/.test(metaTxt) && /ago/.test(metaTxt) && !/verifying|lands passed/.test(metaTxt);
    record('new account row Use next → switch_route + toast', has && r4.ok && /never moved/.test(r4.t) && lastUsedOk, r4.t + ' | ' + metaTxt);
    await page.screenshot({ path: shot('accounts-usenext') });
  } catch (e) { record('new account row Use next → switch_route + toast', false, String(e).slice(0, 200)); }

  /* plans widget: provider unavailable → PM estimate (fixture 9) */
  try {
    await goToTab(page, 'plans');
    /* the four facts, not the sentence that once carried them: the provider
       figure is unavailable, Puppet Master offers 63% instead, it says how
       sure it is, and it names the history the estimate came from */
    await page.waitForFunction(() => {
      const t = document.body.innerText;
      return /Provider ready · Usage details unavailable/.test(t) &&
        /Puppet Master estimate 63%/.test(t) && /medium confidence/.test(t) && /PM history/.test(t);
    }, { timeout: 5000 });
    record('new plans estimate (unavailable → PM estimate 63%)', true);
    await page.screenshot({ path: shot('plans-estimate') });
  } catch (e) { record('new plans estimate (unavailable → PM estimate 63%)', false, String(e).slice(0, 200)); }

  /* unknown never rendered as zero (kimi pool + zai legacy stay unknown) */
  try {
    const ok = await page.evaluate(() => {
      const U = window.U11;
      return U.meterById['meter:kimi-pool'].vs === 'unknown' && U.meterById['meter:zai-legacy-req'].vs === 'unknown' &&
        U.meterById['meter:oc-go-monthly'].vs === 'unavailable';
    });
    const txt = await visibleText(page);
    record('guard unknown≠zero (kimi pool / zai limit unknown; estimate distinct)', ok && /Limit not exposed|limit unknown/i.test(txt));
  } catch (e) { record('guard unknown≠zero (kimi pool / zai limit unknown; estimate distinct)', false, String(e).slice(0, 200)); }

  /* free room cooldown */
  try {
    await goToTab(page, 'free');
    await page.waitForFunction(() => /Cooldown · back/.test(document.body.innerText), { timeout: 5000 });
    record('new free model cooldown row', true);
    await page.screenshot({ path: shot('free-cooldown') });
  } catch (e) { record('new free model cooldown row', false, String(e).slice(0, 200)); }

  /* unconfigured providers absent everywhere */
  try {
    const txt = await visibleText(page);
    const absent = ['Mistral', 'Fireworks', 'OpenRouter', 'Cohere'].every((n) => txt.indexOf(n) === -1);
    record('guard unconfigured providers absent from DOM', absent);
  } catch (e) { record('guard unconfigured providers absent from DOM', false, String(e).slice(0, 200)); }

  /* cost identity */
  try {
    const ok = await page.evaluate(() => {
      const c = window.U11.costs;
      return c.apiBilledMicro === 61850000 && c.planIncludedMicro === 125570000 &&
        c.spentMonthMicro === 187420000 && c.apiBilledMicro + c.planIncludedMicro === c.spentMonthMicro;
    });
    record('guard cost identity 61.85M + 125.57M = 187.42M', ok);
  } catch (e) { record('guard cost identity 61.85M + 125.57M = 187.42M', false, String(e).slice(0, 200)); }

  record('new-behavior zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

/* =====================================================================
   HARD-FAILURE GUARDS
   The packet names nine hard failures
   (PM_Usage_Concept_Update_Final_Cumulative_2026-08-08/
    05_GUI_CONTEXT_RING_DEMO_AND_TESTS.md:85-95). Four were already
   guarded by the cases above — unknown rendered as zero, maintenance
   counted as model tokens, unconfigured providers absent, and the
   quick-controls sheet deep-linking instead of writing policy. The cases
   here cover the rest.

   Every expected value is DERIVED from window.U11 at run time. Nothing in
   this section hard-codes a count, an id set or a label, so a data change
   moves the assertion with it instead of past it.

   NOT asserted here, deliberately: the "dead controls" half of the ninth
   hard failure. Proving a control does something needs a click sweep with
   a per-control expectation, and the independent audit's own sweep found
   10 of 290 click-tested controls inert — a passing case would be false.
   The clipped-label and misaligned-track halves ARE measurable from
   rendered geometry and are asserted below.
   ===================================================================== */
async function runHardFailureGuards(ctx, port) {
  const { page, errors } = await bootPage(ctx, port, {
    theme: 'friendly-dark', width: 1700, init: { 'u11:disclosure': '"advanced"' }
  });
  const human = (s) => String(s).replace(/_/g, ' ');
  const kvOf = () => page.evaluate(() => {
    const o = {};
    document.querySelectorAll('.u11rd .u11rd-kv').forEach((row) => {
      const k = row.querySelector('span'), v = row.querySelector('b');
      if (k && v) o[k.textContent.trim()] = v.textContent.trim();
    });
    return o;
  });

  /* HARD FAILURE "Free Models without underlying route" (packet 05:89;
     audit A07-01). A free route is a lens over a real account, never an
     identity of its own — so every row, eligible or not, must name the
     provider family, the account/profile and the connection underneath
     it. Read from RENDERED text; the labels to look for come from
     window.U11, never from a literal in this file. */
  try {
    await goToTab(page, 'free');
    const r = await page.evaluate(() => {
      const d = window.U11;
      const rows = Array.from(document.querySelectorAll('.u11-pane[data-pane="free"] .u11w-freegroup .u11w-prow'));
      const gaps = [];
      d.freeModels.forEach((fm) => {
        const conn = fm.connectionId ? d.connectionById[fm.connectionId] : null;
        const acct = conn ? d.accountById[conn.accountId] : null;
        const fam = acct ? d.familyById[acct.familyId] : null;
        const model = d.modelById[fm.modelId];
        const row = rows.filter((el) => {
          const n = el.querySelector('.u11w-aname');
          return n && model && n.textContent.trim() === model.label;
        })[0];
        if (!row) { gaps.push(fm.id + ' has no rendered row'); return; }
        const txt = row.innerText;
        if (!fam || txt.indexOf(fam.label) < 0) gaps.push(fm.id + ' names no provider family');
        if (!acct || txt.indexOf(acct.label) < 0) gaps.push(fm.id + ' names no account');
        if (!conn || txt.indexOf(conn.label) < 0) gaps.push(fm.id + ' names no connection');
      });
      return { rows: rows.length, models: d.freeModels.length, gaps: gaps,
        unidentified: /not identified/.test(document.querySelector('.u11-pane[data-pane="free"]').innerText) };
    });
    record('guard free models every rendered row names family, account and connection',
      r.rows === r.models && r.gaps.length === 0 && !r.unidentified,
      `rows=${r.rows}/${r.models} gaps=${r.gaps.length} unidentifiedFallback=${r.unidentified}` +
      (r.gaps.length ? ' :: ' + r.gaps.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('guard free models every rendered row names family, account and connection', false, String(e).slice(0, 200)); }

  /* the ineligible routes (free access ended, free status unverified) are
     the rows that used to render bare. Same assertion, isolated, so a
     regression there cannot hide behind the eligible rows. */
  try {
    const r = await page.evaluate(() => {
      const d = window.U11;
      const rows = Array.from(document.querySelectorAll('.u11-pane[data-pane="free"] .u11w-freegroup .u11w-prow'));
      const out = d.freeModels.filter((fm) => !fm.eligible).map((fm) => {
        const conn = fm.connectionId ? d.connectionById[fm.connectionId] : null;
        const acct = conn ? d.accountById[conn.accountId] : null;
        const fam = acct ? d.familyById[acct.familyId] : null;
        const model = d.modelById[fm.modelId];
        const row = rows.filter((el) => {
          const n = el.querySelector('.u11w-aname');
          return n && model && n.textContent.trim() === model.label;
        })[0];
        const txt = row ? row.innerText : '';
        return { id: fm.id, ok: !!row && !!fam && !!acct && !!conn &&
          txt.indexOf(fam.label) >= 0 && txt.indexOf(acct.label) >= 0 && txt.indexOf(conn.label) >= 0 };
      });
      return { ids: out.map((o) => o.id), bad: out.filter((o) => !o.ok).map((o) => o.id) };
    });
    record('guard free models ineligible rows keep their underlying route',
      r.ids.length > 0 && r.bad.length === 0,
      `ineligible=${r.ids.length} [${r.ids.join(', ')}] incomplete=${r.bad.length}`);
  } catch (e) { record('guard free models ineligible rows keep their underlying route', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "plan-included work shown as API-billed without
     evidence" (packet 05:88). Opens one ledger attempt per distinct
     billing route present in the data and reads the route-evidence block.
     Two assertions: each route renders its OWN label, so no two routes
     can read as the same thing (which is how plan-included work becomes
     API-billed on screen); and each renders alongside the connection,
     account and product that substantiate it. */
  try {
    await goToTab(page, 'ledger');
    const sample = await page.evaluate(() => {
      const d = window.U11;
      const seen = {};
      Array.from(document.querySelectorAll('.u11-pane[data-pane="ledger"] [data-att]')).forEach((el) => {
        const a = d.attemptById[el.getAttribute('data-att')];
        if (a && !seen[a.billingRoute]) seen[a.billingRoute] = a.eventId;
      });
      return seen;
    });
    const routes = Object.keys(sample);
    const labelOwner = {};
    const problems = [];
    for (const route of routes) {
      await page.click(`.u11-pane[data-pane="ledger"] [data-att="${sample[route]}"]`);
      await page.waitForSelector('.u11rd.on', { timeout: 5000 });
      const kv = await kvOf();
      const label = kv['Billing route'] || '';
      if (!label) problems.push(human(route) + ' renders no billing route');
      else if (labelOwner[label]) problems.push(human(route) + ' and ' + human(labelOwner[label]) + ' render the same label');
      else labelOwner[label] = route;
      ['Connection', 'Account', 'Expected product', 'Settlement'].forEach((k) => {
        if (!kv[k] || /not recorded/i.test(kv[k])) problems.push(human(route) + ' renders no ' + k.toLowerCase());
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(220);
    }
    record('guard every billing route renders its own label plus connection, account and product evidence',
      routes.length > 1 && problems.length === 0,
      `routes=${routes.length} distinctLabels=${Object.keys(labelOwner).length} problems=${problems.length}` +
      (problems.length ? ' :: ' + problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('guard every billing route renders its own label plus connection, account and product evidence', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "helper calls hidden inside main model" (packet 05:90).
     Picks the work carrying the most helper attempts on a model other
     than its main model, then asserts the inspector renders one row per
     attempt of that work and that each helper row shows its OWN model. */
  try {
    const pick = await page.evaluate(() => {
      const d = window.U11;
      const byWork = {};
      d.attempts.forEach((a) => { (byWork[a.workId] = byWork[a.workId] || []).push(a); });
      let best = null;
      Object.keys(byWork).forEach((w) => {
        const list = byWork[w];
        const main = list.filter((a) => a.bucket === 'main')[0];
        if (!main) return;
        const mainModel = (d.modelById[main.effectiveModelId] || {}).label;
        const helpers = list.filter((a) => {
          const m = (d.modelById[a.effectiveModelId] || {}).label;
          return a.bucket !== 'main' && !!m && m !== mainModel;
        });
        if (helpers.length && (!best || helpers.length > best.helpers.length)) {
          best = { workId: w, mainModel: mainModel, all: list.map((a) => a.eventId),
            helpers: helpers.map((h) => ({ id: h.eventId, model: (d.modelById[h.effectiveModelId] || {}).label })) };
        }
      });
      return best;
    });
    const openable = await page.evaluate((ids) => ids.filter((i) =>
      !!document.querySelector('.u11-pane[data-pane="ledger"] [data-att="' + i + '"]')), pick ? pick.all : []);
    await page.click(`.u11-pane[data-pane="ledger"] [data-att="${openable[0]}"]`);
    await page.waitForSelector('.u11rd.on', { timeout: 5000 });
    const seen = await page.evaluate((p) => {
      const rows = Array.from(document.querySelectorAll('.u11rd [data-u11rd-jump]'));
      const ids = rows.map((r) => r.getAttribute('data-u11rd-jump'));
      const folded = p.helpers.filter((h) => {
        const row = rows.filter((r) => r.getAttribute('data-u11rd-jump') === h.id)[0];
        return !row || row.innerText.indexOf(h.model) < 0;
      }).map((h) => h.id);
      return { rendered: ids.length, missing: p.all.filter((i) => ids.indexOf(i) < 0), folded: folded };
    }, pick);
    record('guard helper calls render as their own attempts, never folded into the main model',
      !!pick && seen.missing.length === 0 && seen.folded.length === 0,
      `work=${pick && pick.workId} attempts=${pick && pick.all.length} rendered=${seen.rendered}` +
      ` helpers=${pick && pick.helpers.length} missing=${seen.missing.length} folded=${seen.folded.length}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(220);
  } catch (e) { record('guard helper calls render as their own attempts, never folded into the main model', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "route/settlement history rewritten by current
     aliases/settings" (packet 05:94). The dataset carries attempts on a
     removed account that keep their own preserved connection and product.
     The ledger row must still carry the historical identity, the
     inspector must name the preserved connection and product rather than
     any current one, and two attempts that settled differently must still
     render differently. */
  try {
    const hist = await page.evaluate(() => {
      const d = window.U11;
      return d.attempts.filter((a) => a.historicalIdentity).map((a) => ({
        id: a.eventId, label: a.historicalIdentity.label, settlement: a.settlement,
        conn: (d.connectionById[a.connectionId] || {}).label,
        prod: (d.productById[a.productId] || {}).label
      }));
    });
    const settleLabel = {};
    const problems = [];
    for (const h of hist) {
      const rowOk = await page.evaluate((x) => {
        const b = document.querySelector('.u11-pane[data-pane="ledger"] [data-att="' + x.id + '"]');
        if (!b) return false;
        const row = b.closest('tr') || b.parentElement.parentElement;
        return !!row && row.innerText.indexOf(x.label) >= 0;
      }, h);
      if (!rowOk) problems.push(h.id + ' ledger row drops its historical identity');
      await page.click(`.u11-pane[data-pane="ledger"] [data-att="${h.id}"]`);
      await page.waitForSelector('.u11rd.on', { timeout: 5000 });
      const kv = await kvOf();
      if (kv['Connection'] !== h.conn) problems.push(h.id + ' connection rewritten');
      if (kv['Expected product'] !== h.prod) problems.push(h.id + ' product rewritten');
      settleLabel[h.settlement] = kv['Settlement'] || '';
      await page.keyboard.press('Escape');
      await page.waitForTimeout(220);
    }
    const rendered = Object.keys(settleLabel).map((k) => settleLabel[k]);
    const settleDistinct = rendered.length === new Set(rendered).size && rendered.every((v) => !!v);
    record('guard historical attempts keep their own route and settlement, not the current alias',
      hist.length > 0 && problems.length === 0 && settleDistinct,
      `historical=${hist.length} settlements=${rendered.length} distinct=${settleDistinct} problems=${problems.length}` +
      (problems.length ? ' :: ' + problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('guard historical attempts keep their own route and settlement, not the current alias', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "account rows shown before setup" (packet 05:92). The
     older guard only checks that four provider names are absent from the
     text. This asserts the rendered row set IS the configured, non-removed
     set: same count, no stray name, and nothing from a removed or
     unconfigured account anywhere in the room. */
  try {
    await goToTab(page, 'accounts');
    const r = await page.evaluate(() => {
      const d = window.U11;
      const rows = Array.from(document.querySelectorAll('.u11-pane[data-pane="accounts"] .u11w-acctrow'));
      const names = rows.map((el) => {
        const n = el.querySelector('.u11w-aname');
        return n ? n.textContent.trim() : '';
      });
      const visible = d.visibleAccounts().map((a) => a.label);
      const hidden = d.accounts.filter((a) => !a.configured || a.removed).map((a) => a.label);
      const txt = document.querySelector('.u11-pane[data-pane="accounts"]').innerText;
      return { rows: rows.length, configured: visible.length,
        stray: names.filter((n) => visible.indexOf(n) < 0),
        removedLeak: hidden.filter((h) => txt.indexOf(h) >= 0),
        catalogLeak: d.unconfiguredCatalog.map((u) => u.provider).filter((p) => !!p && txt.indexOf(p) >= 0) };
    });
    record('guard account rows are exactly the configured accounts, none shown before setup',
      r.rows === r.configured && r.stray.length === 0 && r.removedLeak.length === 0 && r.catalogLeak.length === 0,
      `rows=${r.rows} configured=${r.configured} stray=${r.stray.length}` +
      ` removedLeak=${r.removedLeak.length} unconfiguredLeak=${r.catalogLeak.length}`);
  } catch (e) { record('guard account rows are exactly the configured accounts, none shown before setup', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "Usage mutates policy locally instead of deep-linking to
     Settings" (packet 05:93). The settings-sheet case proves the sheet
     itself writes nothing; this sweeps the whole page after real use —
     room changes, both disclosure levels, the scope picker and the sheet.

     Asserted structurally rather than against a name list, so a policy
     blob under a new name is still caught. Every persisted key must be
     the shell theme, or a canvas layout key for a room canvas that exists
     in the document, or a U11 key whose value is either a single view
     token (a JSON string) or an object keyed ONLY by those same room
     canvas ids. The five Settings-owned policies the audit found being
     persisted were an object keyed by policy name, which no canvas id
     matches — so that shape fails here whatever it is called. */
  try {
    await goToTab(page, 'plans');
    await setDisclosure(page, 'standard');
    await setDisclosure(page, 'advanced');
    await page.click('[data-scope-open]');
    await page.waitForSelector('#u11Pop.on', { timeout: 3000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    await page.click('#u11Settings');
    await page.waitForSelector('#u11SheetSprout:not([hidden])', { timeout: 3000 });
    await page.click('body', { position: { x: 5, y: 5 } });
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const pages = Array.from(document.querySelectorAll('.uw-canvas[data-u11-page]'))
        .map((c) => c.getAttribute('data-u11-page'));
      const keys = Object.keys(localStorage).sort();
      const policyish = [];
      keys.forEach((k) => {
        if (k === 'pm.theme') return;
        if (k.indexOf('pmw:') === 0) {
          if (pages.indexOf(k.slice(4)) < 0) policyish.push(k + ' is not a room canvas');
          return;
        }
        if (k.indexOf('u11:') !== 0) { policyish.push(k + ' is outside the Usage namespace'); return; }
        let val = null;
        try { val = JSON.parse(localStorage.getItem(k)); } catch (err) { policyish.push(k + ' is not view state'); return; }
        if (typeof val === 'string') return;                       /* one view token */
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const stray = Object.keys(val).filter((p) => pages.indexOf(p) < 0);
          if (stray.length) policyish.push(k + ' is keyed by ' + stray.slice(0, 2).join(', ') + ', not by a room canvas');
          return;
        }
        policyish.push(k + ' is not view state');
      });
      return { keys: keys, pages: pages.length, policyish: policyish };
    });
    record('guard Usage persists only view and layout state, never a Settings-owned policy',
      r.policyish.length === 0,
      `keys=${r.keys.length} [${r.keys.join(', ')}] roomCanvases=${r.pages} policyShaped=${r.policyish.length}` +
      (r.policyish.length ? ' :: ' + r.policyish.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('guard Usage persists only view and layout state, never a Settings-owned policy', false, String(e).slice(0, 200)); }

  /* HARD FAILURE "clipped labels, misaligned tracks, or dead controls"
     (packet 05:95) — the two halves that rendered geometry can settle.
     Swept across the rooms the rail exposes directly. The widths reach below
     the rail's own reflow breakpoint on purpose: a seven-track ledger row
     collapsed two data columns to 0px at 360-520px and the guard never saw
     it, because 900px was the narrowest width this sweep ever visited. */
  let fit = null;
  try {
    const FIT_ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics', 'ledger'];
    fit = { clipped: 0, silent: 0, zero: 0, tracks: 0, escaped: 0, notes: [] };
    for (const width of [360, 520, 900, 1700]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(700);
      for (const room of FIT_ROOMS) {
        await goToTab(page, room);
        const s = await page.evaluate(() => {
          let clipped = 0, silent = 0, zero = 0, tracks = 0, escaped = 0; const first = [], zfirst = [];
          document.querySelectorAll('.u11-pane:not(.pm-hidden) *').forEach((el) => {
            let hasText = false;
            el.childNodes.forEach((n) => { if (n.nodeType === 3 && n.nodeValue.trim()) hasText = true; });
            if (!hasText) return;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            /* an ancestor may be the one that is display:none — such a cell is
               deliberately absent, not silently collapsed */
            if (el.checkVisibility ? !el.checkVisibility() : !el.getClientRects().length) return;
            /* a leaf that renders at zero width is worse than a truncated one:
               an ellipsis it never gets to draw recovers nothing */
            if (el.getBoundingClientRect().width < 1) {
              zero++;
              if (zfirst.length < 2) zfirst.push((el.textContent || '').trim().slice(0, 40));
              return;
            }
            if (el.scrollWidth - el.clientWidth <= 1) return;
            if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') return;
            clipped++;
            if (cs.textOverflow !== 'ellipsis' && !el.getAttribute('title') && !el.closest('[title]')) {
              silent++;
              if (first.length < 2) first.push((el.textContent || '').trim().slice(0, 40));
            }
          });
          document.querySelectorAll('.u11-pane:not(.pm-hidden) .us-track').forEach((tr) => {
            const f = tr.querySelector('.us-fill');
            if (!f) return;
            const a = tr.getBoundingClientRect(), b = f.getBoundingClientRect();
            if (a.width < 2) return;
            tracks++;
            if (b.left - a.left < -1.5 || (a.left + a.width) - (b.left + b.width) < -1.5) escaped++;
          });
          return { clipped, silent, zero, tracks, escaped, first, zfirst };
        });
        fit.clipped += s.clipped; fit.silent += s.silent; fit.zero += s.zero;
        fit.tracks += s.tracks; fit.escaped += s.escaped;
        if (s.silent && fit.notes.length < 3) fit.notes.push(room + ' at ' + width + ': ' + s.first.join(' / '));
        if (s.zero && fit.notes.length < 3) fit.notes.push(room + ' at ' + width + ' zero-width: ' + s.zfirst.join(' / '));
      }
    }
    await page.setViewportSize({ width: 1700, height: 1000 });
    await page.waitForTimeout(500);
  } catch (e) { fit = { error: String(e).slice(0, 200) }; }
  record('guard no label is cut off without an ellipsis or a title to recover it',
    !!fit && !fit.error && fit.silent === 0 && fit.zero === 0,
    fit && !fit.error ? `clipped=${fit.clipped} withoutAffordance=${fit.silent} zeroWidth=${fit.zero}` +
      (fit.notes.length ? ' :: ' + fit.notes.join(' | ') : '') : (fit && fit.error) || 'sweep did not run');
  record('guard every meter fill stays inside its track',
    !!fit && !fit.error && fit.tracks > 0 && fit.escaped === 0,
    fit && !fit.error ? `tracks=${fit.tracks} escaped=${fit.escaped}` : (fit && fit.error) || 'sweep did not run');

  record('hard-failure guards zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

/* =====================================================================
   CLOSURE GUARDS — the 2026-08-18 residual remediation
   ---------------------------------------------------------------------
   Roughly fifty findings were closed across two remediation passes and
   almost none of them had a test. Twice a closed thing silently broke and
   only a gate noticed: a Ledger column collapsed to 0px at 360-520 and
   lost 98 strings, and a duplicate element id came back. So every closure
   that rendered state can settle gets a case here.

   House rules for this section, learned the hard way:
   - assert the FACT, never a substring of today's copy. Three cases had to
     be rewritten last pass because the wording improved and the assertion
     broke. Where a number has to be located in rendered text, it is
     located STRUCTURALLY (the <b> the renderer wraps it in, a class, a
     data attribute) and compared against window.U11.
   - derive every expected count from window.U11 at run time. The dataset
     is 54 attempts today and will change again; nothing below hard-codes
     54, 52, 2, 12 or any id set.
   - one case per closure, so a regression names itself.
   ===================================================================== */
async function runClosureGuards(ctx, port) {
  const { page, errors } = await bootPage(ctx, port, {
    theme: 'friendly-dark', width: 1700,
    init: { 'u11:disclosure': '"advanced"', 'u11:scope': '"scope:all"' }
  });
  /* rooms come from the rail itself, and some of them live inside the More
     group where a real click is not always hittable — dispatch on the button */
  const rooms = await page.evaluate(() => Array.from(document.querySelectorAll('.u11-rail .u11-item[data-tab]'))
    .map((b) => b.getAttribute('data-tab')));
  async function openRoom(room) {
    await page.evaluate((r) => {
      const b = document.querySelector('.u11-rail .u11-item[data-tab="' + r + '"]');
      if (b) b.click();
    }, room);
    await page.waitForSelector(`.u11-pane[data-pane="${room}"]:not(.pm-hidden)`, { timeout: 8000 });
    await page.waitForTimeout(420);
  }

  /* ---- the turn card describes the work item, not one of its attempts ----
     (audit A04-04/A04-05). The card used to render the first main-bucket
     attempt's tokens under the work item's title, so an interrupted 6.2k
     attempt spoke for a work item that ran 58.3k. Every bucket figure on
     every card is parsed back out of the rendered line and compared with
     U11.workTotals for that work; and at least one work item must exist
     whose total differs from its headline attempt, so a regression to
     headline-only figures cannot pass by coincidence. */
  try {
    await openRoom('ledger');
    const r = await page.evaluate(() => {
      const d = window.U11;
      const KEY = { input: 'input_total', output: 'output_total', reasoning: 'reasoning',
        'cache read': 'cache_read', 'cache write': 'cache_write' };
      function parseFigures(s) {
        const out = {}; const re = /([\d.,]+)(k?)\s+(input|output|reasoning|cache read|cache write)\b/g;
        let m;
        while ((m = re.exec(s))) out[m[3]] = parseFloat(m[1].replace(/,/g, '')) * (m[2] === 'k' ? 1000 : 1);
        return out;
      }
      const problems = [], aggregated = [];
      let cards = 0, figures = 0;
      document.querySelectorAll('.u11-pane[data-pane="ledger"] .u11w-turncard').forEach((c) => {
        const tt = c.querySelector('.u11w-turntt');
        const work = tt ? d.works.filter((w) => w.label === tt.textContent)[0] : null;
        if (!work) { problems.push('a rendered card names no work item'); return; }
        cards++;
        const t = d.workTotals(work.id, 'scope:all');
        const roster = d.workRoster(work.id, 'scope:all');
        const tokEl = c.querySelector('.u11w-turntok');
        const got = parseFigures(tokEl ? tokEl.textContent : '');
        Object.keys(got).forEach((k) => {
          const want = t[KEY[k]];
          /* the renderer rounds to a tenth of a thousand, so 50 is the widest
             honest gap; anything past that is a different number */
          if (want == null || Math.abs(got[k] - want) > 60) {
            problems.push(work.id + ' renders ' + got[k] + ' ' + k + ' against a work total of ' + want);
          } else figures++;
        });
        const head = roster.headline && roster.headline.tokens ? roster.headline.tokens.input : null;
        if (head != null && Math.abs(t.input_total - head) > 60) {
          aggregated.push(work.id);
          if (got.input != null && Math.abs(got.input - head) <= 60) {
            problems.push(work.id + " renders its headline attempt's input, not the work item total");
          }
        }
        const title = tokEl ? (tokEl.getAttribute('title') || '') : '';
        const n = /across (\d+) attempt/.exec(title);
        if (!n || +n[1] !== roster.attempts.length) {
          problems.push(work.id + ' says it totals ' + (n ? n[1] : 'no') + ' attempts, the roster has ' + roster.attempts.length);
        }
      });
      return { cards, figures, aggregated: aggregated.length, problems };
    });
    record('closure turn card figures are the work item total, never the headline attempt',
      r.cards > 0 && r.figures > 0 && r.aggregated > 0 && r.problems.length === 0,
      `cards=${r.cards} bucketFigures=${r.figures} workItemsLargerThanTheirHeadline=${r.aggregated} problems=${r.problems.length}` +
      (r.problems.length ? ' :: ' + r.problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure turn card figures are the work item total, never the headline attempt', false, String(e).slice(0, 200)); }

  /* ---- roles are disjoint and add up, and a user_work primary is never a
     helper (audit A04-04). The card used to count "attempts minus one" as
     helper calls, so a work item with two user_work primaries reported one
     of them as a helper. Read from the rendered roster line. */
  try {
    const r = await page.evaluate(() => {
      const d = window.U11;
      const problems = [];
      let cards = 0, multiPrimary = 0;
      document.querySelectorAll('.u11-pane[data-pane="ledger"] .u11w-turncard').forEach((c) => {
        const tt = c.querySelector('.u11w-turntt');
        const work = tt ? d.works.filter((w) => w.label === tt.textContent)[0] : null;
        if (!work) return;
        cards++;
        const roster = d.workRoster(work.id, 'scope:all');
        const misfiled = roster.helpers.filter((a) => a.purpose === 'user_work').map((a) => a.eventId);
        if (misfiled.length) problems.push(work.id + ' files user_work primaries ' + misfiled.join(', ') + ' as helpers');
        if (roster.counts.primaries > 1) multiPrimary++;
        const cnt = roster.counts;
        if (cnt.primaries + cnt.helpers + cnt.children !== cnt.attempts) {
          problems.push(work.id + ' roles do not add up to its attempts');
        }
        const line = c.querySelector('.u11w-turnroster');
        const txt = line ? line.textContent : '';
        const read = (re) => { const m = re.exec(txt); return m ? +m[1] : 0; };
        if (read(/(\d+) attempts?\b/) !== cnt.attempts) problems.push(work.id + ' renders the wrong attempt count');
        if (read(/(\d+) primary calls?\b/) !== cnt.primaries) problems.push(work.id + ' renders ' + read(/(\d+) primary calls?\b/) + ' primaries against ' + cnt.primaries);
        if (read(/(\d+) helper calls?\b/) !== cnt.helpers) problems.push(work.id + ' renders ' + read(/(\d+) helper calls?\b/) + ' helpers against ' + cnt.helpers);
      });
      return { cards, multiPrimary, problems };
    });
    record('closure user_work primaries are never counted as helper calls',
      r.cards > 0 && r.multiPrimary > 0 && r.problems.length === 0,
      `cards=${r.cards} workItemsWithMoreThanOnePrimary=${r.multiPrimary} problems=${r.problems.length}` +
      (r.problems.length ? ' :: ' + r.problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure user_work primaries are never counted as helper calls', false, String(e).slice(0, 200)); }

  /* ---- a work item that crossed provider families is never collapsed under
     one member's route (audit A04-05). Every family the roster actually ran
     on must be named on the card, and the card must say so in words. */
  try {
    const r = await page.evaluate(() => {
      const d = window.U11;
      const problems = [];
      let multi = 0;
      document.querySelectorAll('.u11-pane[data-pane="ledger"] .u11w-turncard').forEach((c) => {
        const tt = c.querySelector('.u11w-turntt');
        const work = tt ? d.works.filter((w) => w.label === tt.textContent)[0] : null;
        if (!work) return;
        const fams = [];
        d.workRoster(work.id, 'scope:all').attempts.forEach((a) => {
          const acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
          const fam = acct ? d.familyById[acct.familyId] : null;
          if (fam && fams.indexOf(fam.label) < 0) fams.push(fam.label);
        });
        if (fams.length < 2) return;
        multi++;
        const route = c.querySelector('.u11w-turnroute');
        const txt = route ? route.textContent : '';
        const dropped = fams.filter((f) => txt.indexOf(f) < 0);
        if (dropped.length) problems.push(work.id + ' route line drops ' + dropped.join(', '));
        if (!c.querySelector('.u11w-turnnote')) problems.push(work.id + ' spans ' + fams.length + ' families and says nothing about it');
      });
      return { multi, problems };
    });
    record('closure a work item spanning several provider families names every one of them',
      r.multi > 0 && r.problems.length === 0,
      `multiFamilyWorkItems=${r.multi} problems=${r.problems.length}` +
      (r.problems.length ? ' :: ' + r.problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure a work item spanning several provider families names every one of them', false, String(e).slice(0, 200)); }

  /* ---- scope footer honesty (audit A02-01). attemptInScope answers "does
     this event belong to this scope", not "is this current usage", and this
     footer used it as the second while promising the first. The two counts
     are read from the <b> elements the renderer wraps them in — structure,
     not sentence — and the arithmetic has to close: current + removed is the
     whole in-scope set, and at scope:all that is every attempt there is. */
  try {
    async function footerFor(scopeId) {
      await page.evaluate((s) => {
        window.U11W.pageScope = s;
        const t = document.querySelector('[data-scope-open]');
        if (t) t.click();
      }, scopeId);
      await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
      await page.waitForTimeout(300);
      const out = await page.evaluate((s) => {
        const d = window.U11;
        const t = d.scopeEventTotals(s);
        const lines = Array.from(document.querySelectorAll('#u11PopFoot .u11-pop-footline'));
        const cur = lines.filter((l) => !l.classList.contains('hist'))[0];
        const hist = lines.filter((l) => l.classList.contains('hist'))[0];
        const bOf = (el) => { const b = el && el.querySelector('b'); return b ? parseInt(b.textContent.replace(/[^\d]/g, ''), 10) : null; };
        /* recomputed here without attemptIsHistorical, so the footer and the
           helper it uses cannot agree with each other and both be wrong */
        const currentByHand = d.attempts.filter((a) => {
          if (!d.attemptInScope(a, s)) return false;
          if (a.historicalIdentity || a.historical) return false;
          const acct = d.accountById[a.effectiveAccountId || a.requestedAccountId];
          if (acct && acct.removed) return false;
          const w = a.workId ? d.workById[a.workId] : null;
          return !(w && w.historical);
        }).length;
        const inScope = d.attemptsInScope(s, { include: 'all' }).length;
        const facets = t.current.money + t.current.covered + t.current.byok + t.current.unknown;
        return { scope: s, renderedCurrent: bOf(cur), renderedRemoved: hist ? bOf(hist) : 0,
          current: t.current.count, historical: t.historical.count, inScope: inScope,
          currentByHand: currentByHand, facets: facets, attempts: d.attempts.length };
      }, scopeId);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      return out;
    }
    const scopes = await page.evaluate(() => {
      const d = window.U11;
      /* scope:all plus whichever family owns removed history, so the removed
         arm is exercised under a narrowed scope too */
      const withHistory = d.attempts.filter((a) => a.historicalIdentity)
        .map((a) => { const ac = d.accountById[a.effectiveAccountId || a.requestedAccountId]; return ac ? ac.familyId : null; })
        .filter(Boolean);
      return ['scope:all'].concat(withHistory.length ? [withHistory[0]] : []);
    });
    const results = [];
    for (const s of scopes) results.push(await footerFor(s));
    const problems = [];
    results.forEach((r) => {
      if (r.renderedCurrent !== r.current) problems.push(r.scope + ' renders ' + r.renderedCurrent + ' current against ' + r.current);
      if (r.renderedRemoved !== r.historical) problems.push(r.scope + ' renders ' + r.renderedRemoved + ' removed against ' + r.historical);
      if (r.current !== r.currentByHand) problems.push(r.scope + ' current total does not exclude removed accounts (' + r.current + ' vs ' + r.currentByHand + ')');
      if (r.current + r.historical !== r.inScope) problems.push(r.scope + ' current+removed ' + (r.current + r.historical) + ' is not the in-scope set ' + r.inScope);
      if (r.facets !== r.current) problems.push(r.scope + ' cost facets sum to ' + r.facets + ', not ' + r.current);
      if (r.scope === 'scope:all' && r.inScope !== r.attempts) problems.push('scope:all in-scope ' + r.inScope + ' is not every attempt ' + r.attempts);
    });
    const a = results[0];
    record('closure scope footer counts current usage without removed accounts and the arithmetic closes',
      results.length > 0 && problems.length === 0 && a.historical > 0,
      `scopes=${results.map((r) => r.scope + ':' + r.current + '+' + r.historical + '=' + r.inScope).join(' ')} attempts=${a.attempts} problems=${problems.length}` +
      (problems.length ? ' :: ' + problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure scope footer counts current usage without removed accounts and the arithmetic closes', false, String(e).slice(0, 200)); }

  /* ---- the deep link says WHICH provider, account, connection, CLI and
     machine it is about (audit A01-06/A01-07/A08-04/A10-01). The old payload
     was five keys that named none of them, so the identical dispatch would
     have been produced for any provider CLI on any host. Three things are
     asserted: every identity field the record carries survives into the
     dispatch, the continuation token reaches the DOM rather than dying in the
     payload, and focus_setting_id is a row that exists in canon. */
  try {
    await openRoom('ledger');
    await clearToasts(page);
    const dl = await page.evaluate(() => {
      const d = window.U11;
      d.cmdLog.length = 0;
      const btn = document.querySelector('.u11w-opcard [data-u11-act="setuplink"]');
      if (!btn) return { error: 'no provider-setup CTA rendered' };
      const opsId = btn.getAttribute('data-ops');
      const op = d.operational.filter((o) => o.id === opsId)[0];
      btn.click();
      const ev = d.cmdLog.filter((c) => c.cmd === 'cmd.settings.bloom.open').pop();
      const src = (op && op.setupLink) || {};
      const p = (ev && ev.payload) || {};
      /* the identity the RECORD carries is the expectation; nothing here is a
         literal, so adding a field to the fixture tightens the case for free */
      const IDENT = ['provider_family_id', 'account_id', 'connection_id', 'provider_cli',
        'provider_route_kind', 'host_id', 'env_id', 'originating_operation_id', 'continuation'];
      const dropped = IDENT.filter((k) => src[k] != null && p[k] !== src[k]);
      /* the six the adjudication names explicitly must all be there */
      const REQUIRED = ['provider_family_id', 'account_id', 'connection_id', 'provider_cli', 'host_id', 'env_id'];
      const absent = REQUIRED.filter((k) => p[k] == null);
      return { ops: opsId, cmds: d.cmdLog.map((c) => c.cmd), category: p.category,
        focusId: p.focus_setting_id, continuation: p.continuation || null,
        expectedContinuation: src.continuation || null, dropped, absent };
    });
    await page.waitForSelector('.rail-toast', { timeout: 5000 });
    const reached = await page.evaluate((tok) => !!tok && document.body.innerText.indexOf(tok) >= 0, dl.expectedContinuation);
    const inv = SETTINGS_INVENTORY;
    const known = !!(inv.ids && dl.focusId && inv.ids[dl.focusId]);
    record('closure provider-setup deep link carries provider, account, connection, CLI, host, environment and its continuation',
      !dl.error && dl.absent.length === 0 && dl.dropped.length === 0 && !!dl.continuation &&
      dl.continuation === dl.expectedContinuation && reached && known && dl.category === 'ai',
      `ops=${dl.ops} category=${dl.category} focus_setting_id=${dl.focusId} inCanon=${known}` +
      ` continuation=${dl.continuation} reachedDOM=${reached} absentIdentity=${(dl.absent || []).join(',') || 'none'}` +
      ` rewritten=${(dl.dropped || []).join(',') || 'none'} inventory=${inv.ids ? inv.count + ' rows' : 'UNREADABLE ' + inv.error}`);
    await clearToasts(page);
  } catch (e) { record('closure provider-setup deep link carries provider, account, connection, CLI, host, environment and its continuation', false, String(e).slice(0, 200)); }

  /* the quick-controls sheet routes to the same canon, so its row id is held
     to the same standard — an id that is not in the inventory is an invented
     destination however plausible it reads */
  try {
    const id = await page.evaluate(() => {
      window.U11.cmdLog.length = 0;
      document.getElementById('u11Settings').click();
      return null;
    });
    await page.waitForSelector('#u11SheetSprout:not([hidden])', { timeout: 4000 });
    await page.click('#u11SheetSprout [data-u11open]');
    await page.waitForTimeout(300);
    const got = await page.evaluate(() => {
      const e = window.U11.cmdLog.filter((c) => c.cmd === 'cmd.settings.bloom.open').pop();
      return e && e.payload ? { cat: e.payload.category, id: e.payload.focus_setting_id } : null;
    });
    const inv = SETTINGS_INVENTORY;
    const known = !!(inv.ids && got && got.id && inv.ids[got.id]);
    record('closure Settings sheet routes to a settings row that exists in canon',
      !!got && known && got.cat === 'ai',
      `dispatch=${JSON.stringify(got)} inCanon=${known} inventory=${inv.ids ? inv.count + ' rows' : 'UNREADABLE ' + inv.error}`);
    await page.click('body', { position: { x: 5, y: 5 } });
    await page.waitForTimeout(250);
  } catch (e) { record('closure Settings sheet routes to a settings row that exists in canon', false, String(e).slice(0, 200)); }

  /* ---- the model level is navigable (audit A02-10). Models are the fifth
     canonical hierarchy level and resolved nowhere, so a model id fell through
     to "Unknown scope". Three facts: the picker offers model rows, every row
     it offers resolves to a real kind, and picking a model actually narrows
     the event set. */
  try {
    await page.evaluate(() => { window.U11W.pageScope = 'scope:all'; document.querySelector('[data-scope-open]').click(); });
    await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
    const survey = await page.evaluate(() => {
      const d = window.U11;
      const ids = Array.from(document.querySelectorAll('#u11PopList [data-scopeid]')).map((r) => r.getAttribute('data-scopeid'));
      const kinds = {};
      ids.forEach((i) => { const k = d.scopeNode(i).kind; kinds[k] = (kinds[k] || 0) + 1; });
      const models = ids.filter((i) => !!d.modelById[i]);
      const unknown = ids.filter((i) => d.scopeNode(i).kind === 'unknown');
      /* pick a model that actually ran, so "it filters" is falsifiable */
      const pick = models.filter((m) => {
        const n = d.attemptsInScope(m, { include: 'all' }).length;
        return n > 0 && n < d.attempts.length;
      })[0] || models[0];
      return { rows: ids.length, kinds, modelRows: models.length, unknown, pick,
        pickKind: pick ? d.scopeNode(pick).kind : null,
        pickLabel: pick ? d.scopeNode(pick).label : null,
        pickCount: pick ? d.attemptsInScope(pick, { include: 'all' }).length : 0,
        attempts: d.attempts.length };
    });
    await page.evaluate((m) => { const r = document.querySelector('#u11PopList [data-scopeid="' + m + '"]'); if (r) r.click(); }, survey.pick);
    await page.waitForTimeout(700);
    const after = await page.evaluate((m) => {
      const d = window.U11;
      const chip = document.getElementById('u11ScopeChip');
      const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
      const cards = pane ? Array.from(pane.querySelectorAll('.u11w-turncard .u11w-turntt')).map((t) => t.textContent) : [];
      const allowed = {};
      d.works.forEach((w) => {
        if (d.attempts.some((a) => a.workId === w.id && d.attemptInScope(a, m))) allowed[w.label] = 1;
      });
      return { chip: chip ? chip.textContent.trim() : '', scope: window.U11W.pageScope,
        cards: cards.length, outOfScope: cards.filter((c) => !allowed[c]) };
    }, survey.pick);
    record('closure the model level is a navigable scope, not "Unknown scope"',
      survey.modelRows > 0 && survey.unknown.length === 0 && survey.pickKind === 'model' &&
      survey.pickCount > 0 && survey.pickCount < survey.attempts &&
      after.scope === survey.pick && after.chip === survey.pickLabel && after.outOfScope.length === 0,
      `pickerRows=${survey.rows} modelRows=${survey.modelRows} unknownRows=${survey.unknown.length}` +
      ` picked=${survey.pick} kind=${survey.pickKind} narrowsTo=${survey.pickCount}/${survey.attempts}` +
      ` chip="${after.chip}" ledgerCards=${after.cards} outOfScopeCards=${after.outOfScope.length}` +
      ` kinds=${JSON.stringify(survey.kinds)}`);
    /* back to everything for the cases below */
    await page.evaluate(() => { document.querySelector('[data-scope-open]').click(); });
    await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
    await page.click('#u11PopList [data-scopeid="scope:all"]');
    await page.waitForTimeout(600);
  } catch (e) { record('closure the model level is a navigable scope, not "Unknown scope"', false, String(e).slice(0, 200)); }

  /* ---- CBP-027 probe vocabulary (audit A07-07, fixture GUI-CBP-001). The
     whole Antigravity surface was modelled and rendered nowhere, so the two
     fixtures that score on it had nothing to read. Every probe the record
     holds must render, with the record's OWN word for its state, and no probe
     may be marked fabricated. */
  try {
    await openRoom('authority');
    const r = await page.evaluate(() => {
      const d = window.U11;
      const pane = document.querySelector('.u11-pane[data-pane="authority"]');
      const txt = pane.innerText;
      const matrix = d.cliProbeMatrix();
      const wanted = {};
      matrix.forEach((m) => { if (m.copy) wanted[m.copy] = 1; });
      const absent = Object.keys(wanted).filter((c) => txt.indexOf(c) < 0);
      return { installations: pane.querySelectorAll('.u11w-cliinst').length, records: d.cliBridged.length,
        probeRows: pane.querySelectorAll('.u11w-cliprobe').length, probes: matrix.length,
        vocabulary: Object.keys(wanted).length, absent,
        fabricated: matrix.filter((m) => m.fabricated).length };
    });
    record('closure CBP-027 probe states render in the record’s own words for every installation',
      r.installations === r.records && r.probeRows === r.probes && r.absent.length === 0 && r.fabricated === 0,
      `installations=${r.installations}/${r.records} probeRows=${r.probeRows}/${r.probes}` +
      ` vocabulary=${r.vocabulary} unrendered=${r.absent.length}${r.absent.length ? ' :: ' + r.absent.join(' | ') : ''}` +
      ` fabricated=${r.fabricated}`);
  } catch (e) { record('closure CBP-027 probe states render in the record’s own words for every installation', false, String(e).slice(0, 200)); }

  /* ---- CBP-027 MUST_NOT set (fixture GUI-CBP-002). G1 credits are a credit
     and overflow-pool signal: never token usage, never model cost, never a
     quota counter, never a provider total. Asserted three ways — the record
     forbids each of the four, no credit figure appears outside the credit
     row, and no token bucket on a CLI-bridged route is written as a zero. */
  try {
    const r = await page.evaluate(() => {
      const d = window.U11;
      const pane = document.querySelector('.u11-pane[data-pane="authority"]');
      const problems = [];
      const signals = d.creditSignals();
      signals.forEach((c) => {
        ['summableIntoTokens', 'summableIntoCost', 'summableIntoQuota', 'summableIntoProviderTotal'].forEach((k) => {
          if (c[k] !== false) problems.push(c.recordId + ' does not forbid ' + k);
        });
      });
      /* the accessor states the four every time; the RECORD has to state them
         too, or the fixture's own false flags could be quietly deleted and the
         accessor would still read clean */
      const FLAG = { isTokenBucket: 'token_bucket', isCost: 'cost', isQuota: 'quota', isProviderTotal: 'provider_total' };
      d.cliBridged.forEach((rec) => {
        const c = rec.credits || {};
        Object.keys(FLAG).forEach((k) => {
          if (c[k] !== false) problems.push(rec.id + ' credit record does not carry ' + k + ' false');
          if (!(c.neverSummedInto || []).some((x) => x === FLAG[k])) {
            problems.push(rec.id + ' credit record does not forbid summing into ' + FLAG[k]);
          }
        });
      });
      /* a reported credit figure must appear only inside the credit row */
      signals.forEach((c) => {
        if (c.credits_remaining == null) return;
        const needle = String(c.credits_remaining);
        const grouped = c.credits_remaining.toLocaleString('en-US');
        pane.querySelectorAll('.u11w-clibucket, .u11w-clinote, .u11w-cliprobe, .us-track, .u11w-mrow').forEach((el) => {
          const t = el.textContent || '';
          if (t.indexOf(grouped) >= 0 || new RegExp('\\b' + needle + '\\b').test(t)) {
            problems.push(c.recordId + ' credit figure appears in ' + el.className);
          }
        });
        const row = Array.from(pane.querySelectorAll('.u11w-clicredit'))
          .filter((el) => (el.textContent || '').indexOf(grouped) >= 0);
        if (!row.length) problems.push(c.recordId + ' credit figure is not rendered on its own credit row');
      });
      /* every canonical token bucket on a CLI-bridged route is unknown, and
         unknown is never written as 0 */
      let buckets = 0;
      d.cliBridged.forEach((rec) => {
        Object.keys(rec.usage.tokenBuckets).forEach((k) => {
          buckets++;
          if (rec.usage.tokenBuckets[k] !== null) problems.push(rec.id + ' derives a token bucket ' + k + ' from a route that reports none');
        });
      });
      /* a record whose credits are not reported must render no credit number */
      signals.filter((c) => c.credits_status !== 'reported').forEach((c) => {
        const rows = Array.from(pane.querySelectorAll('.u11w-clicredit'))
          .filter((el) => (el.getAttribute('title') || '').indexOf(c.recordId) >= 0 ||
            (el.textContent || '').indexOf(c.copy) >= 0);
        rows.forEach((el) => {
          if (/\d/.test((el.textContent || '').replace(/G1|[^0-9A-Za-z]/g, ''))) {
            problems.push(c.recordId + ' renders a number for ' + c.credits_status + ' credits');
          }
        });
      });
      return { signals: signals.length, buckets, problems };
    });
    record('closure CBP-027 credits never become a token bucket, a cost, a quota or a provider total',
      r.signals > 0 && r.buckets > 0 && r.problems.length === 0,
      `creditRecords=${r.signals} tokenBucketsHeldUnknown=${r.buckets} problems=${r.problems.length}` +
      (r.problems.length ? ' :: ' + r.problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure CBP-027 credits never become a token bucket, a cost, a quota or a provider total', false, String(e).slice(0, 200)); }

  /* ---- time-kind coverage (audit A06-09). The panel used to carry its own
     table keyed on the run row's LABEL, and the moment the record split one
     row into two the summary claimed 8 of 11 while eleven bars were drawn.
     So this asserts on KINDS: the rendered pair equals timeKindCoverage, and
     the reasons rendered are exactly the record's own reasons for the kinds
     it did not measure. Run for every run in the dataset. */
  try {
    const runIds = await page.evaluate(() => window.U11.runs.map((r) => r.id));
    const seen = [];
    const problems = [];
    for (const runId of runIds) {
      await page.evaluate((r) => window.U11RunDetail.open(r), runId);
      await page.waitForSelector('.u11rd.on', { timeout: 6000 });
      await page.waitForTimeout(280);
      const one = await page.evaluate((r) => {
        const cov = window.U11.timeKindCoverage(r);
        /* the summary block is the .u11rd-tkinds that carries a <b>; the other
           one is the "share of partitioned time" note. Structure, not copy. */
        const el = Array.from(document.querySelectorAll('.u11rd .u11rd-tkinds')).filter((n) => n.querySelector('b'))[0];
        if (!el) return { runId: r, missing: 'no coverage block rendered', cov: cov };
        const m = /(\d+)\s+of\s+(\d+)/.exec(el.textContent || '');
        const spans = Array.from(el.querySelectorAll('span')).map((s) => s.textContent || '');
        const unexplained = cov.missing.filter((k) => !spans.some((s) => s.indexOf(k.why) >= 0)).map((k) => k.kind);
        const run = window.U11.runById[r];
        const allWhy = ((run && run.timing && run.timing.notRecorded) || []).map((n) => n.kind + '::' + n.why);
        const covWhy = cov.missing.map((k) => k.kind + '::' + k.why);
        const stale = allWhy.filter((w) => covWhy.indexOf(w) < 0)
          .filter((w) => spans.some((s) => s.indexOf(w.split('::')[1]) >= 0))
          .map((w) => w.split('::')[0]);
        return { runId: r, rendered: m ? [+m[1], +m[2]] : null,
          cov: [cov.recorded, cov.total], missingKinds: cov.missing.map((k) => k.kind),
          unexplained, stale };
      }, runId);
      seen.push(one);
      if (one.missing) problems.push(runId + ': ' + one.missing);
      else {
        if (!one.rendered || one.rendered[0] !== one.cov[0] || one.rendered[1] !== one.cov[1]) {
          problems.push(runId + ' renders ' + JSON.stringify(one.rendered) + ' against coverage ' + JSON.stringify(one.cov));
        }
        if (one.unexplained.length) problems.push(runId + ' says nothing about ' + one.unexplained.join(', '));
        if (one.stale.length) problems.push(runId + ' still explains ' + one.stale.join(', ') + ' as unmeasured');
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(240);
    }
    record('closure the rendered time-kind coverage matches U11.timeKindCoverage for every run',
      runIds.length > 0 && problems.length === 0,
      `runs=${seen.map((s) => s.runId + ' ' + (s.rendered ? s.rendered.join('/') : '?') + (s.missingKinds && s.missingKinds.length ? ' missing:' + s.missingKinds.join('+') : '')).join(' · ')}` +
      ` problems=${problems.length}` + (problems.length ? ' :: ' + problems.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure the rendered time-kind coverage matches U11.timeKindCoverage for every run', false, String(e).slice(0, 200)); }

  /* ---- command contract, half one: a view filter is not a command (audit
     A11-02). Changing the page scope used to be bound to a canonical command
     that declares a domain event; a scope change is local view state and must
     dispatch nothing at all. */
  try {
    await openRoom('ledger');
    const r = await page.evaluate(async () => {
      const d = window.U11;
      const ids = Array.from(document.querySelectorAll('#u11PopList [data-scopeid]')).map((x) => x.getAttribute('data-scopeid'));
      return { ids: ids.length };
    });
    const fired = await (async () => {
      await page.evaluate(() => { window.U11.cmdLog.length = 0; document.querySelector('[data-scope-open]').click(); });
      await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
      const target = await page.evaluate(() => {
        const d = window.U11;
        const rows = Array.from(document.querySelectorAll('#u11PopList [data-scopeid]'))
          .map((x) => x.getAttribute('data-scopeid'))
          .filter((i) => i !== 'scope:all' && d.attemptsInScope(i, { include: 'all' }).length > 0);
        return rows[0];
      });
      await page.evaluate((t) => document.querySelector('#u11PopList [data-scopeid="' + t + '"]').click(), target);
      await page.waitForTimeout(650);
      const out = await page.evaluate((t) => ({ cmds: window.U11.cmdLog.map((c) => c.cmd), scope: window.U11W.pageScope, target: t }), target);
      /* and back */
      await page.evaluate(() => { document.querySelector('[data-scope-open]').click(); });
      await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
      await page.click('#u11PopList [data-scopeid="scope:all"]');
      await page.waitForTimeout(600);
      return out;
    })();
    record('closure changing the page scope dispatches no command',
      fired.cmds.length === 0 && fired.scope === fired.target,
      `target=${fired.target} scopeApplied=${fired.scope === fired.target} dispatched=[${fired.cmds.join(', ')}] pickerRows=${r.ids}`);
  } catch (e) { record('closure changing the page scope dispatches no command', false, String(e).slice(0, 200)); }

  /* ---- command contract, half two (audit A11-05, A11-06). A run is not one
     usage event, so the run inspector travels object-first on
     cmd.nav.open_subject with run_id as the narrowing filter, and the
     usage-event route stays on the attempt inspector, where
     cmd.nav.open_usage_subject resolves identity from usage_event_ref. */
  try {
    await openRoom('overview');
    const run = await page.evaluate(() => {
      window.U11.cmdLog.length = 0;
      const b = document.querySelector('[data-u11-act="openrun"]');
      if (!b) return { error: 'no run CTA' };
      const id = b.getAttribute('data-run');
      b.click();
      const log = window.U11.cmdLog.map((c) => ({ cmd: c.cmd, p: c.payload || {} }));
      return { id, cmds: log.map((l) => l.cmd),
        payload: log.filter((l) => l.cmd === 'cmd.nav.open_subject').map((l) => ({
          kind: l.p.route_target && l.p.route_target.object_kind,
          obj: l.p.route_target && l.p.route_target.object_id, run: l.p.run_id }))[0] || null };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    await openRoom('ledger');
    const att = await page.evaluate(() => {
      window.U11.cmdLog.length = 0;
      const b = document.querySelector('.u11-pane[data-pane="ledger"] [data-u11-act="openattempt"]');
      if (!b) return { error: 'no attempt CTA' };
      const id = b.getAttribute('data-att');
      b.click();
      const log = window.U11.cmdLog.map((c) => ({ cmd: c.cmd, p: c.payload || {} }));
      return { id, cmds: log.map((l) => l.cmd),
        payload: log.filter((l) => l.cmd === 'cmd.nav.open_usage_subject').map((l) => ({
          kind: l.p.route_target && l.p.route_target.object_kind,
          obj: l.p.route_target && l.p.route_target.object_id, ref: l.p.usage_event_ref }))[0] || null };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const runOk = !run.error && run.cmds.length === 1 && run.cmds[0] === 'cmd.nav.open_subject' &&
      !!run.payload && run.payload.kind === 'run' && run.payload.obj === run.id && run.payload.run === run.id;
    const attOk = !att.error && att.cmds.length === 1 && att.cmds[0] === 'cmd.nav.open_usage_subject' &&
      !!att.payload && att.payload.kind === 'usage_event' && att.payload.obj === att.id && att.payload.ref === att.id;
    record('closure the run inspector opens on cmd.nav.open_subject and the attempt inspector on cmd.nav.open_usage_subject',
      runOk && attOk,
      `run=${run.id} [${(run.cmds || []).join(', ')}] ${JSON.stringify(run.payload)} · ` +
      `attempt=${att.id} [${(att.cmds || []).join(', ')}] ${JSON.stringify(att.payload)}`);
  } catch (e) { record('closure the run inspector opens on cmd.nav.open_subject and the attempt inspector on cmd.nav.open_usage_subject', false, String(e).slice(0, 200)); }

  /* ---- A02-09, driven rather than declared. The removed-source history used
     to be dropped whenever a bucket filter was set — including a filter set
     to the very bucket its own rows are in. Two passes recorded the finding
     not-assessed because they could not drive the Ledger widget's config
     sheet; it is driven here, through the real kebab → Configure → select
     path, and the guard is permanent. */
  try {
    await openRoom('ledger');
    const setup = await page.evaluate(() => {
      const d = window.U11;
      const cv = document.querySelector('.u11-pane[data-pane="ledger"] .uw-canvas[data-u11-page]');
      const it = cv && cv._pmw ? cv._pmw.items.filter((i) => i.type === 'ledger')[0] : null;
      const hist = d.attempts.filter((a) => a.historicalIdentity);
      const own = [];
      hist.forEach((a) => { if (own.indexOf(a.bucket) < 0) own.push(a.bucket); });
      const other = Object.keys(d.buckets).filter((b) => own.indexOf(b) < 0)[0];
      return { uid: it ? it.uid : null, ownBuckets: own, otherBucket: other,
        histRows: hist.length,
        histInOwn: own.map((b) => hist.filter((a) => a.bucket === b).length) };
    });
    const readGroup = () => page.evaluate(() => {
      const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
      const cv = pane.querySelector('.uw-canvas[data-u11-page]');
      const it = cv && cv._pmw ? cv._pmw.items.filter((i) => i.type === 'ledger')[0] : null;
      return { bucket: (it && it.cfg && it.cfg.bucket) || 'all',
        rows: pane.querySelectorAll('.u11w-histwork .u11w-prow').length,
        groups: pane.querySelectorAll('.u11w-histwork').length };
    });
    /* open the widget's own config sheet the way a person does */
    await page.click(`.u11-pane[data-pane="ledger"] .uw[data-uid="${setup.uid}"] [data-pmw-kebab]`);
    await page.waitForSelector('.pm-sprout [data-pmw-config]', { timeout: 5000 });
    await page.click('.pm-sprout [data-pmw-config]');
    await page.waitForSelector('.pm-sprout select[data-cfg="bucket"]', { timeout: 5000 });
    const before = await readGroup();
    const observed = [];
    for (const b of setup.ownBuckets) {
      await page.selectOption('.pm-sprout select[data-cfg="bucket"]', b);
      await page.waitForTimeout(600);
      observed.push(Object.assign({ want: b }, await readGroup()));
    }
    await page.selectOption('.pm-sprout select[data-cfg="bucket"]', setup.otherBucket);
    await page.waitForTimeout(600);
    const foreign = await readGroup();
    await page.selectOption('.pm-sprout select[data-cfg="bucket"]', 'all');
    await page.waitForTimeout(600);
    const restored = await readGroup();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const drivable = observed.every((o) => o.bucket === o.want) && foreign.bucket === setup.otherBucket;
    const kept = observed.every((o, i) => o.rows === setup.histInOwn[i] && o.groups > 0);
    const filtered = foreign.rows === 0;
    record('closure removed-source history survives a bucket filter set to its own bucket',
      setup.histRows > 0 && drivable && kept && filtered &&
      before.rows === setup.histRows && restored.rows === setup.histRows,
      `historicalAttempts=${setup.histRows} configSheetDrivable=${drivable}` +
      ` ${observed.map((o) => o.want + '→' + o.rows + ' rows').join(' ')}` +
      ` ${setup.otherBucket}→${foreign.rows} rows · all→${restored.rows} rows`);
  } catch (e) { record('closure removed-source history survives a bucket filter set to its own bucket', false, String(e).slice(0, 200)); }

  /* ---- the guard that caught the Ledger column collapse. Seven tracks in a
     ledger row went to 0px at 360-520 and 98 strings went with them, and the
     sweep never saw it because 900px was the narrowest width it visited. This
     one lives at the two widths that broke, and it visits EVERY room the rail
     exposes rather than the eight the older sweep walks. */
  try {
    const NARROW = [360, 520];
    const per = [];
    let zero = 0, silent = 0, clipped = 0;
    const notes = [];
    for (const width of NARROW) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(700);
      let wz = 0, ws = 0, wc = 0;
      for (const room of rooms) {
        await openRoom(room);
        const s = await page.evaluate(() => {
          let z = 0, si = 0, cl = 0; const zf = [], sf = [];
          document.querySelectorAll('.u11-pane:not(.pm-hidden) *').forEach((el) => {
            let hasText = false;
            el.childNodes.forEach((n) => { if (n.nodeType === 3 && n.nodeValue.trim()) hasText = true; });
            if (!hasText) return;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            if (el.checkVisibility ? !el.checkVisibility() : !el.getClientRects().length) return;
            if (el.getBoundingClientRect().width < 1) { z++; if (zf.length < 2) zf.push((el.textContent || '').trim().slice(0, 40)); return; }
            if (el.scrollWidth - el.clientWidth <= 1) return;
            if (cs.overflowX !== 'hidden' && cs.overflowX !== 'clip') return;
            cl++;
            if (cs.textOverflow !== 'ellipsis' && !el.getAttribute('title') && !el.closest('[title]')) {
              si++; if (sf.length < 2) sf.push((el.textContent || '').trim().slice(0, 40));
            }
          });
          return { z, si, cl, zf, sf };
        });
        wz += s.z; ws += s.si; wc += s.cl;
        if ((s.z || s.si) && notes.length < 4) notes.push(room + '@' + width + ': ' + s.zf.concat(s.sf).join(' / '));
      }
      per.push(`${width}px zeroWidth=${wz} withoutAffordance=${ws}`);
      zero += wz; silent += ws; clipped += wc;
    }
    await page.setViewportSize({ width: 1700, height: 1000 });
    await page.waitForTimeout(500);
    record('closure no leaf collapses to zero width or is cut off without recovery at 360 and 520',
      zero === 0 && silent === 0,
      `rooms=${rooms.length} ${per.join(' · ')} clipped=${clipped}` + (notes.length ? ' :: ' + notes.join(' | ') : ''));
  } catch (e) { record('closure no leaf collapses to zero width or is cut off without recovery at 360 and 520', false, String(e).slice(0, 200)); }

  /* ---- the other guard that caught a real regression: a duplicate element
     id. Swept across every room and with the three overlays open, because a
     duplicate that only exists while a panel is mounted is still a duplicate. */
  try {
    const dupOf = () => page.evaluate(() => {
      const seen = {}, dups = [];
      document.querySelectorAll('[id]').forEach((el) => { if (seen[el.id]) { if (dups.indexOf(el.id) < 0) dups.push(el.id); } else seen[el.id] = 1; });
      return { ids: document.querySelectorAll('[id]').length, dups };
    });
    const found = [];
    let scanned = 0, ids = 0;
    for (const room of rooms) {
      await openRoom(room);
      const d = await dupOf(); scanned++; ids = Math.max(ids, d.ids);
      d.dups.forEach((x) => { if (found.indexOf(room + ':' + x) < 0) found.push(room + ':' + x); });
    }
    /* overlays: attempt inspector, run inspector, scope popover */
    await openRoom('ledger');
    await page.evaluate(() => { const b = document.querySelector('.u11-pane[data-pane="ledger"] [data-u11-act="openattempt"]'); if (b) b.click(); });
    await page.waitForSelector('.u11rd.on', { timeout: 6000 });
    let d1 = await dupOf(); scanned++;
    d1.dups.forEach((x) => found.push('attempt inspector:' + x));
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    await page.evaluate(() => { const r = window.U11.runs[0]; if (r) window.U11RunDetail.open(r.id); });
    await page.waitForSelector('.u11rd.on', { timeout: 6000 });
    d1 = await dupOf(); scanned++;
    d1.dups.forEach((x) => found.push('run inspector:' + x));
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('[data-scope-open]').click());
    await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
    d1 = await dupOf(); scanned++;
    d1.dups.forEach((x) => found.push('scope picker:' + x));
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    record('closure no element id is used twice, in any room or overlay',
      found.length === 0,
      `surfacesScanned=${scanned} idsAtMost=${ids} duplicates=${found.length}` + (found.length ? ' :: ' + found.slice(0, 5).join(' | ') : ''));
  } catch (e) { record('closure no element id is used twice, in any room or overlay', false, String(e).slice(0, 200)); }

  /* ---- tooltip hygiene. The matrix guard counts underscores in TEXT NODES
     only, and a previous pass satisfied it by moving raw enum tokens out of
     the copy and into title attributes — the guard went green while the reader
     still met settlement_pending on hover. A tooltip IS user-visible text, so
     the honest rule is the same rule: no raw enum token in any title or
     aria-label, anywhere, with no carrier exempted. The machine-readable half
     of a diagnostic belongs in a data attribute, which is queryable and never
     rendered; that count is reported here so a green result cannot be reached
     by deleting the diagnostic instead of humanising it. */
  try {
    const scan = () => page.evaluate(() => {
      const out = { total: 0, loose: [], diag: document.querySelectorAll('[data-u11-fields]').length };
      document.querySelectorAll('[title], [aria-label]').forEach((el) => {
        ['title', 'aria-label'].forEach((k) => {
          const v = el.getAttribute(k);
          if (!v || v.indexOf('_') < 0) return;
          out.total++;
          out.loose.push(k + ' on ' + (el.className || el.tagName) + ' :: ' + v.slice(0, 70));
        });
      });
      return out;
    });
    /* every room's canvas is mounted at once, so one scan already sees the
       whole document; the rooms are still walked because a room that has never
       been opened may mount more, and the overlays are scanned too. */
    let peak = 0, diag = 0, scans = 0;
    const loose = [];
    for (const room of rooms) {
      await openRoom(room);
      const s = await scan();
      scans++; peak = Math.max(peak, s.total); diag = Math.max(diag, s.diag);
      s.loose.forEach((x) => loose.push(room + ' · ' + x));
    }
    /* the inspector is where raw enums are most tempting */
    await openRoom('ledger');
    await page.evaluate(() => { const b = document.querySelector('.u11-pane[data-pane="ledger"] [data-u11-act="openattempt"]'); if (b) b.click(); });
    await page.waitForSelector('.u11rd.on', { timeout: 6000 });
    const s2 = await scan();
    scans++; peak = Math.max(peak, s2.total); diag = Math.max(diag, s2.diag);
    s2.loose.forEach((x) => loose.push('attempt inspector · ' + x));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    record('closure no title or aria-label carries a raw enum token',
      peak === 0 && loose.length === 0,
      `scans=${scans} underscoreTooltips=${peak} machineReadableDataAttributes=${diag}` +
      (loose.length ? ' :: ' + loose.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure no title or aria-label carries a raw enum token', false, String(e).slice(0, 200)); }

  /* ---- the hard failure "unknown displayed as zero", asserted where it
     actually broke (audit A03-01, A03-22, A05-17). The existing guard reads
     three window.U11 vs fields and matches one regex over body text; both arms
     passed while the scope picker simultaneously rendered "Shared membership
     pool -1%" and "Legacy plan -1%" — the two meters the guardrail names as
     its proof. This reads every meter row the picker draws: a meter with no
     published figure must render no percentage at all, a meter with one must
     render its own, and no percentage anywhere may be negative. */
  try {
    await page.evaluate(() => { window.U11W.pageScope = 'scope:all'; document.querySelector('[data-scope-open]').click(); });
    await page.waitForSelector('#u11Pop.on', { timeout: 4000 });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const d = window.U11;
      const problems = [];
      let withFigure = 0, withoutFigure = 0;
      Array.from(document.querySelectorAll('#u11PopList [data-scopeid]')).forEach((row) => {
        const meter = d.meterById[row.getAttribute('data-scopeid')];
        if (!meter) return;
        const txt = row.innerText;
        const pcts = (txt.match(/-?\d+(\.\d+)?%/g) || []);
        if (meter.usedPct == null) {
          withoutFigure++;
          if (pcts.length) problems.push(meter.id + ' (' + meter.vs + ') renders ' + pcts.join(', ') + ' with no published figure');
        } else {
          withFigure++;
          if (pcts.indexOf(meter.usedPct + '%') < 0) {
            problems.push(meter.id + ' renders ' + (pcts.join(', ') || 'no percentage') + ' against ' + meter.usedPct + '%');
          }
        }
        pcts.filter((x) => x.charAt(0) === '-').forEach((x) => problems.push(meter.id + ' renders a negative percentage ' + x));
      });
      return { withFigure, withoutFigure, problems };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    /* and nowhere in any room does a negative percentage reach the reader */
    const negatives = [];
    for (const room of rooms) {
      await openRoom(room);
      const n = await page.evaluate(() => {
        const t = document.querySelector('.u11-pane:not(.pm-hidden)').innerText;
        return (t.match(/-\d+(\.\d+)?%/g) || []).slice(0, 3);
      });
      n.forEach((x) => negatives.push(room + ':' + x));
    }
    record('closure a meter with no published figure renders no percentage, and no percentage is negative',
      m.withoutFigure > 0 && m.withFigure > 0 && m.problems.length === 0 && negatives.length === 0,
      `meterRows=${m.withFigure + m.withoutFigure} withFigure=${m.withFigure} unknown=${m.withoutFigure}` +
      ` problems=${m.problems.length} negativePercentagesInRooms=${negatives.length}` +
      (m.problems.length ? ' :: ' + m.problems.slice(0, 3).join(' | ') : '') +
      (negatives.length ? ' :: ' + negatives.slice(0, 3).join(' | ') : ''));
  } catch (e) { record('closure a meter with no published figure renders no percentage, and no percentage is negative', false, String(e).slice(0, 200)); }

  /* GUI-USG-002 and GUI-USG-006. These two could not be asserted until a
     fixture existed for a cache the provider REPORTED as zero, as distinct from
     a cache it does not expose. A zero that was measured and an absence that was
     never readable must never render the same way. */
  try {
    const c = await page.evaluate(async () => {
      /* The cache copy lives in the Prompt cache room, which sits inside the
         collapsed More group and is an Advanced-level surface. Reading body text
         without navigating there measures the wrong document - that mistake made
         this case fail on its first run while the copy was present all along. */
      const dd = document.querySelector('[data-disc="advanced"]'); if (dd) dd.click();
      await new Promise((r) => setTimeout(r, 400));
      const more = document.querySelector('[data-more-toggle]'); if (more) more.click();
      await new Promise((r) => setTimeout(r, 300));
      const tab = document.querySelector('.u11-item[data-tab="cache"]'); if (tab) tab.click();
      await new Promise((r) => setTimeout(r, 800));
      const d = window.U11;
      const rows = (d.cacheStats || []);
      const reportedZero = rows.filter((r) => r.cacheReportingState === 'reported' &&
        (r.hit === 0 || r.read === 0 || r.write === 0));
      const notExposed = rows.filter((r) => r.cacheReportingState === 'not_exposed');
      const txt = document.body.innerText;
      return {
        reportedZero: reportedZero.length, notExposed: notExposed.length,
        saysMeasuredZero: /measured zero/i.test(txt),
        saysNothingToRead: /nothing to read/i.test(txt),
        zeroAsUnknown: /cache hit\s*(—|not reported)[^\n]*measured zero/i.test(txt),
        roomOpen: !!document.querySelector('[data-pane="cache"]:not(.pm-hidden)')
      };
    });
    record('closure a reported cache zero is distinguishable from a cache that is not exposed',
      c.reportedZero > 0 && c.notExposed > 0 && c.saysMeasuredZero && c.saysNothingToRead && !c.zeroAsUnknown,
      `reportedZeroRows=${c.reportedZero} notExposedRows=${c.notExposed}` +
      ` saysMeasuredZero=${c.saysMeasuredZero} saysNothingToRead=${c.saysNothingToRead}` +
      ` zeroShownAsUnknown=${c.zeroAsUnknown} cacheRoomOpen=${c.roomOpen}`);
  } catch (e) { record('closure a reported cache zero is distinguishable from a cache that is not exposed', false, String(e).slice(0, 200)); }

  try {
    const z = await page.evaluate(() => {
      const d = window.U11;
      const reported = (d.cacheStats || []).filter((r) => r.cacheReportingState === 'reported');
      const bad = reported.filter((r) => (r.hit === 0 || r.read === 0) &&
        !/measured zero|reported/i.test(String(r.copy || r.note || '')));
      return { reported: reported.length, bad: bad.length, ids: bad.map((b) => b.connectionId).slice(0, 3) };
    });
    record('closure a provider-reported zero stays a reported zero and is never relabelled unknown',
      z.reported > 0 && z.bad === 0,
      `reportedRows=${z.reported} rowsThatLoseTheirZero=${z.bad}` + (z.ids.length ? ' :: ' + z.ids.join(' | ') : ''));
  } catch (e) { record('closure a provider-reported zero stays a reported zero and is never relabelled unknown', false, String(e).slice(0, 200)); }

  /* Guards for the last five closures (A10-08, A08-04, A03-16, A08-08/A10-11).
     Each asserts the FACT, derives expectations from window.U11 at run time, and
     locates values structurally rather than by matching a sentence. */
  try {
    const dl = await page.evaluate(async () => {
      const rooms = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
        'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];
      const ids = new Set();
      for (const rm of rooms) {
        const b = document.querySelector('.u11-item[data-tab="' + rm + '"]'); if (b) b.click();
        await new Promise((r) => setTimeout(r, 260));
        document.querySelectorAll('[data-u11-act="opensetting"]').forEach((e) => ids.add(e.getAttribute('data-setting')));
      }
      const before = window.U11.cmdLog.length;
      const btn = document.querySelector('[data-u11-act="opensetting"]');
      if (btn) btn.click();
      await new Promise((r) => setTimeout(r, 250));
      const ev = window.U11.cmdLog.slice(before).filter((c) => c.cmd === 'cmd.settings.bloom.open').pop() || null;
      const named = [...ids].every((i) => !!window.U11.settingsRowLabel(i));
      return { targets: [...ids], named, focus: ev && ev.payload && ev.payload.focus_setting_id };
    });
    record('closure each widget deep-links to the Settings row it reports on',
      dl.targets.length >= 8 && dl.named && /^ai\./.test(dl.focus || ''),
      `distinctTargets=${dl.targets.length} allHaveCanonLabel=${dl.named} dispatched=${dl.focus}`);
  } catch (e) { record('closure each widget deep-links to the Settings row it reports on', false, String(e).slice(0, 200)); }

  try {
    const st = await page.evaluate(() => {
      const rec = window.U11.operational.filter((o) => o.continuationState === 'stale')[0] || null;
      const t = document.body.innerText;
      return { present: !!rec, usage: rec && rec.providerUsage, hasTokens: rec ? ('tokens' in rec) : null,
        declinedRendered: /Resume declined/i.test(t), rawEnum: /continuation_stale/.test(t) };
    });
    record('closure a stale continuation is declined, costs nothing, and says so',
      st.present && st.usage === 'none' && st.hasTokens === false && !st.rawEnum,
      `record=${st.present} providerUsage=${st.usage} hasTokenField=${st.hasTokens}` +
      ` rawEnumInText=${st.rawEnum} renderedInThisRoom=${st.declinedRendered}`);
  } catch (e) { record('closure a stale continuation is declined, costs nothing, and says so', false, String(e).slice(0, 200)); }

  /* Reproducible negative controls. A guard never observed failing is not
     evidence, so the two guards below can be driven against a deliberately
     broken page: PM_FAULT=gauge re-points the spending track at the month
     total, PM_FAULT=idprose plants a raw event id inside a sentence. Each must
     turn its own case red and leave the rest of the suite untouched. */
  const FAULT = process.env.PM_FAULT || '';

  /* Rewritten 2026-08-18. The previous version of this guard asserted that
     document.body.innerText contained the string "21%", and FAILED ON CORRECT
     CODE: valHTML puts the number in a <b> and the unit in an <i>, so the laid
     out copy yields "21\n%" and the contiguous substring never exists. It was
     the fifth oracle error of this engagement and the same shape as the other
     four - asserting a string instead of the fact the string stood in for.
     What actually establishes the closure is which quantity drives the track. */
  try {
    const g = await page.evaluate(async (fault) => {
      const b = document.querySelector('.u11-item[data-tab="costs"]'); if (b) b.click();
      await new Promise((r) => setTimeout(r, 2400)); /* the count-up must settle */
      const visible = (el) => {
        if (!el.getClientRects().length) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== 'hidden' && cs.display !== 'none';
      };
      /* This widget renders into three panes - overview, costs, analytics - and
         only one is laid out. querySelector takes a hidden copy whose track has
         zero width; scoping to the visible one is not pedantry, it is how four
         earlier false findings in this bundle were manufactured. */
      const row = Array.from(document.querySelectorAll('.u11w-mrow'))
        .filter((r) => /Spending limit used/.test(r.textContent)).filter(visible)[0];
      if (!row) return { error: 'no visible spending-limit gauge in the costs room' };
      const c = window.U11.costs;
      const billedPct = Math.round(c.apiBilledMicro / c.spendingLimitMicro * 100);
      const totalPct = Math.round(c.spentMonthMicro / c.spendingLimitMicro * 100);
      const fill = row.querySelector('.us-fill'), track = row.querySelector('.us-track');
      if (fault === 'gauge' && fill) { /* the exact revert this guard exists to catch */
        fill.setAttribute('data-fill', String(totalPct));
        fill.style.width = totalPct + '%';
        const v = row.querySelector('.u11w-vval'); if (v) v.textContent = totalPct + '%';
      }
      const fw = fill ? fill.getBoundingClientRect().width : 0;
      const tw = track ? track.getBoundingClientRect().width : 0;
      const vv = row.querySelector('.u11w-vval');
      return { dataFill: fill ? Number(fill.getAttribute('data-fill')) : null,
        geomPct: tw ? +(fw / tw * 100).toFixed(1) : null,
        valueText: vv ? vv.textContent.replace(/\s+/g, '') : null,
        billedPct: billedPct, totalPct: totalPct,
        identity: c.apiBilledMicro + c.planIncludedMicro === c.spentMonthMicro };
    }, FAULT);
    const ok = !g.error && g.dataFill === g.billedPct && g.billedPct !== g.totalPct &&
      g.geomPct !== null && Math.abs(g.geomPct - g.billedPct) <= 1.5 &&
      g.valueText === g.billedPct + '%' && g.identity;
    record('closure the spending limit gauge fills from billed money, not plan-included valuation', ok,
      g.error ? g.error : `dataFill=${g.dataFill} geometry=${g.geomPct}% valueText=${g.valueText}` +
      ` billed=${g.billedPct}% valuation=${g.totalPct}% costIdentity=${g.identity}`);
  } catch (e) { record('closure the spending limit gauge fills from billed money, not plan-included valuation', false, String(e).slice(0, 200)); }

  /* Rewritten 2026-08-18. The previous version was right to fail - it caught a
     real leak - but it was too narrow to be trusted and too thin to diagnose.
     It swept 6 of the 13 rooms, matched only ids preceded by see/ref/event, read
     innerText only, and reported a bare count with no location. It also depended
     on UI state a previous case happened to leave open, which is why its six hits
     were the lineage block rather than the free-room prose that was the actual
     defect. This version sweeps every room, opens its own detail surfaces, checks
     tooltips and aria labels too, and reports where each hit is. */
  try {
    const leak = await page.evaluate(async (fault) => {
      /* Which shapes are internal. rcpt- is deliberately absent: a receipt
         reference is an artefact the user is meant to quote back to a provider,
         unlike an event or work id, which exists only inside Puppet Master. */
      const SRC = '\\b(?:ue|ops|work|cont|dk)-\\d+\\b|\\b(?:run|conn|acct|prod|model|meter|host|env|srcloc|client):[a-z0-9][a-z0-9-]*';
      const REG = new RegExp(SRC, 'g');
      /* An id may be the VALUE of a labelled identity field on a detail surface:
         "This event / ue-615" in the lineage block is the identity of the record
         the reader just opened, and stripping it would leave nothing to quote. It
         may NOT sit inside a sentence, in a tooltip, or as an affordance's only
         visible label. The exemption is structural rather than a string whitelist,
         so it cannot quietly grow to excuse whatever the code happens to do: the
         id must be the entire text of its own element, and a non-empty labelled
         sibling must name it inside a key/value row. */
      const exempt = (el, whole) => {
        /* An element whose ENTIRE text is the id is an identity display, not
           prose: the ledger's id column and the lineage block's "This event"
           value are the record the reader is looking at, and stripping them
           would leave nothing to quote back. */
        if (whole) return true;
        /* A key/value row's value may mix a human phrase with the id it names
           ("Follows · user work · ue-501") because the row's own label supplies
           the context a sentence would not. */
        const kv = el.parentElement;
        if (!kv || !/kv/.test(String(kv.className || ''))) return false;
        const label = el.previousElementSibling;
        return !!(label && label.textContent.trim().length);
      };
      /* Attributes get NO exemption. A title is shown on hover and read aloud,
         so an id there is user-facing text with no label structure to justify
         it - the same conclusion this bundle already reached when 39 raw enum
         pairs moved out of title attributes and into data-u11-fields. */
      const hits = [];
      const sweepText = (where) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) {
          const v = n.nodeValue || ''; REG.lastIndex = 0;
          if (!REG.test(v)) continue;
          const el = n.parentElement; if (!el || !el.getClientRects().length) continue;
          REG.lastIndex = 0; let m;
          while ((m = REG.exec(v))) {
            /* "whole" has to mean the element's entire text IS this identifier.
               The first version compared the element text against the TEXT NODE
               rather than against the match, which made every element with a
               single text node exempt - very nearly all of them, so the guard
               was inert. PM_FAULT=idprose caught it: an injected sentence
               carrying "see ue-610" sailed through a green run. */
            const idIsWholeText = el.textContent.trim() === m[0];
            if (exempt(el, idIsWholeText)) continue;
            hits.push({ surface: 'text', where: where, text: m[0], ctx: v.trim().slice(0, 90) });
          }
        }
      };
      const sweepAttrs = (where) => {
        ['title', 'aria-label'].forEach((a) => {
          Array.from(document.querySelectorAll('[' + a + ']')).forEach((el) => {
            const v = el.getAttribute(a) || ''; REG.lastIndex = 0; let m;
            while ((m = REG.exec(v))) hits.push({ surface: a, where: where, text: m[0], ctx: v.slice(0, 90) });
          });
        });
      };
      const rooms = Array.from(document.querySelectorAll('.u11-item[data-tab]')).map((b) => b.getAttribute('data-tab'));
      for (const rm of rooms) {
        const b = document.querySelector('.u11-item[data-tab="' + rm + '"]'); if (b) b.click();
        await new Promise((r) => setTimeout(r, 260));
        if (fault === 'idprose' && rm === 'overview') {
          const host = document.querySelector('.u11w-sub') || document.body;
          const inj = document.createElement('div');
          inj.textContent = 'Injected control: see ue-610 for the replay.';
          host.appendChild(inj);
        }
        sweepText('room:' + rm); sweepAttrs('room:' + rm);
        /* Open the detail surfaces rather than inheriting whatever a previous case
           left behind, so this guard is order-independent. */
        const acts = Array.from(document.querySelectorAll('[data-u11-act]')).slice(0, 22);
        for (let i = 0; i < acts.length; i++) {
          const el = acts[i]; if (!el || !el.isConnected) continue;
          const act = el.getAttribute('data-u11-act');
          try { el.click(); } catch (e) { continue; }
          await new Promise((r) => setTimeout(r, 90));
          sweepText('room:' + rm + ' after ' + act); sweepAttrs('room:' + rm + ' after ' + act);
        }
      }
      const seen = new Set(); const uniq = [];
      hits.forEach((h) => {
        const k = h.surface + '|' + h.text + '|' + h.ctx.slice(0, 40);
        if (!seen.has(k)) { seen.add(k); uniq.push(h); }
      });
      return uniq;
    }, FAULT);
    /* PM_DUMP_IDS=<path> writes every hit with its location, so a failure is
       diagnosable without re-deriving it. The bare count this guard used to
       print sent the last investigation down a wrong path for an hour. */
    if (process.env.PM_DUMP_IDS) {
      try { fs.writeFileSync(process.env.PM_DUMP_IDS, JSON.stringify(leak, null, 1)); } catch { /* diagnostic only */ }
    }
    record('closure no internal identifier reaches prose, a tooltip, or an affordance label',
      leak.length === 0,
      `occurrences=${leak.length}` + (leak.length
        ? ' :: ' + leak.slice(0, 4).map((h) => h.surface + ' in ' + h.where + ' "' + h.text +
            '" ctx=' + JSON.stringify(h.ctx)).join(' | ')
        : ' (labelled identity fields exempt by structure)'));
  } catch (e) { record('closure no internal identifier reaches prose, a tooltip, or an affordance label', false, String(e).slice(0, 200)); }

  record('closure guards zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

async function runFixtureSweep(ctx, port) {
  const { page } = await bootPage(ctx, port, {
    theme: 'friendly-dark', width: 1700, init: { 'u11:disclosure': '"advanced"' }
  });
  const U = (fn) => page.evaluate(fn);

  const fixtures = [
    ['1 Codex limit → credits continuation', async () => (await U(() => {
      const d = window.U11;
      return d.meterById['meter:codex-biz-5h'].usedPct === 100 &&
        d.continuation['prod:codex-plus'].order.indexOf('prod:codex-credits') >= 0;
    }))],
    ['2 Alibaba Extra Bundle consumption (ue-611 usage_pack)', async () => (await U(() => {
      const a = window.U11.attemptById['ue-611'];
      return !!a && a.productId === 'prod:alibaba-extra-bundle' && a.billingRoute === 'usage_pack';
    }))],
    ['3 Work→Personal fallback (ue-608 requested≠effective)', async () => (await U(() => {
      const a = window.U11.attemptById['ue-608'];
      return !!a && a.requestedAccountId === 'acct:openai-work' && a.effectiveAccountId === 'acct:openai-personal' &&
        window.U11.continuation['prod:codex-business'].order.indexOf('fallback:acct:openai-personal') >= 0;
    }))],
    ['4 separately settled vision helper + attachment transform', async () => (await U(() => {
      const d = window.U11;
      return d.attemptById['ue-551'].billingRoute === 'api_billed' && !!d.attemptById['ue-602'].attachment &&
        d.attemptById['ue-602'].attachment.transform === 'pm_vision_ocr';
    }))],
    ['5 model change replay/cache reset (cm-4 + replay ue-591)', async () => (await U(() => {
      const d = window.U11;
      const cm4 = d.maintenance.filter((m) => m.id === 'cm-4')[0];
      const sw = d.timeline.filter((t) => t.kind === 'switch')[0];
      return !!cm4 && cm4.cacheEffect === 'rebuilt' && sw.replayEventId === 'ue-591';
    }))],
    ['6 free model cooldown rendered', async () => {
      await goToTab(page, 'free');
      return /Cooldown · back/.test(await visibleText(page));
    }],
    ['7 background validation consumes allowance (probe attribution)', async () => (await U(() => {
      const d = window.U11;
      const probe = d.attempts.filter((a) => a.bucket === 'validation' && a.purpose === 'probe' && a.billingRoute === 'free')[0];
      return !!probe;
    }))],
    /* Rewritten 2026-08-18 (audit A06-11, A10-07). This asserted run:goal-47
       with `queued.waves >= 3` — a run that carries 8 requested and 4 waves,
       so the case green-lit the register's misattribution and could not have
       detected it (>= 3 cannot tell three waves from four). The fixture is
       "six required specialists in three two-agent waves", so the run is
       selected BY THAT SHAPE rather than by id, and both surfaces the register
       cites are read from the rendered document. */
    ['8 six required specialists in three two-agent waves, rendered', async () => {
      await goToTab(page, 'overview');
      const pick = await U(() => {
        const r = window.U11.runs.filter((x) => x.requested && x.requested.specialistsRequired === 6 &&
          x.admitted && x.admitted.now === 2 && x.queued && x.queued.waves === 3)[0];
        return r ? { id: r.id, title: r.title, required: r.requested.specialistsRequired,
          now: r.admitted.now, queued: r.queued.children, waves: r.queued.waves } : null;
      });
      if (!pick) return { ok: false, detail: 'no run in the dataset satisfies six required specialists in three two-agent waves' };
      const widget = await page.evaluate((p) => {
        const btn = document.querySelector('[data-u11-act="openrun"][data-run="' + p.id + '"]');
        const row = btn ? btn.closest('.u11w-prow') : null;
        if (!row) return null;
        const t = row.innerText.replace(/\s+/g, ' ');
        return { names: t.indexOf(p.title) >= 0,
          waveplan: new RegExp('\\b' + p.now + '\\s+at a time\\D+' + p.waves + '\\s+waves\\b').test(t),
          requested: new RegExp('Requested\\s+' + p.required + '\\b').test(t) };
      }, pick);
      if (!widget) return { ok: false, detail: pick.id + ' has no rendered capacity row' };
      await page.click(`[data-u11-act="openrun"][data-run="${pick.id}"]`);
      await page.waitForSelector('.u11rd.on', { timeout: 5000 });
      const detail = await page.evaluate((p) => {
        const t = document.querySelector('.u11rd').innerText.replace(/\s+/g, ' ');
        return { required: new RegExp('\\b' + p.required + '\\s+required\\b').test(t),
          admitted: new RegExp('\\b' + p.now + '\\s+admitted\\b').test(t),
          queued: new RegExp('\\b' + p.queued + '\\s+queued\\b').test(t),
          waves: new RegExp('\\b' + p.waves + '\\s+waves\\b').test(t) };
      }, pick);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(220);
      const ok = widget.names && widget.waveplan && widget.requested &&
        detail.required && detail.admitted && detail.queued && detail.waves;
      return { ok, detail: `${pick.id} "${pick.title}" ${pick.required} required / ${pick.now} admitted / ` +
        `${pick.queued} queued / ${pick.waves} waves · capacityRow=${JSON.stringify(widget)} runDetail=${JSON.stringify(detail)}` };
    }],
    ['9 provider unavailable → PM estimate (meter:oc-go-monthly)', async () => (await U(() => {
      const m = window.U11.meterById['meter:oc-go-monthly'];
      return m.vs === 'unavailable' && m.estimate.usedPct === 63 && m.estimate.conf === 'medium';
    }))],
    ['10 requested vs effective model (thread:t-91 switch)', async () => (await U(() => {
      const t = window.U11.threadById['thread:t-91'];
      return t.switched && t.mainModelIds.length === 2;
    }))],
    ['11 BSD silent + advice + duplicate suppressed', async () => (await U(() => {
      const rs = window.U11.bsdEvents.map((b) => b.result);
      return rs.indexOf('silent') >= 0 && rs.indexOf('advice_emitted') >= 0 && rs.indexOf('duplicate_suppressed') >= 0;
    }))],
    ['12 attachment transform event fields (ue-602)', async () => (await U(() => {
      const a = window.U11.attemptById['ue-602'].attachment;
      return a.name === 'receipt.jpg' && a.derivedArtifactIds[0] === 'art-91' && a.consent === 'project_default';
    }))],
    ['13 CLI update idle/verify/rollback (ops-1)', async () => (await U(() => {
      const d = window.U11;
      const o = d.operational.filter((x) => x.id === 'ops-1')[0];
      return o.stages.length === 5 && o.outcome === 'rolled_back' && o.validationEventId === 'ue-609' &&
        d.attemptById['ue-609'].validationFor === 'ops-1';
    }))],
    ['14 offline outbox + reconnect replay (ops-2 + ue-610)', async () => (await U(() => {
      const d = window.U11;
      const o = d.operational.filter((x) => x.id === 'ops-2')[0];
      const a = d.attemptById['ue-610'];
      return o.kind === 'offline_outbox' && a.operationalRef === 'ops-2' && a.replayKind === 'offline_reconnect';
    }))],
    ['15 server work continues offline (ops-3 on TrueNAS)', async () => (await U(() => {
      const d = window.U11;
      const o = d.operational.filter((x) => x.id === 'ops-3')[0];
      return o.hostId === 'host:truenas' && d.hostById['host:truenas'].kind === 'home_server';
    }))],
    ['16 cross-project child (work-12 · Harbor)', async () => (await U(() => {
      const d = window.U11;
      return d.threadById['thread:t-77'].project === 'Harbor' && d.attemptById['ue-652'].crossProject.sourceProject === 'Harbor';
    }))],
    ['17 sound preview + notification test-send (ops-4/ops-5)', async () => (await U(() => {
      const d = window.U11;
      const k = d.operational.map((o) => o.kind);
      return k.indexOf('sound_preview') >= 0 && k.indexOf('notification_test') >= 0;
    }))],
    ['18 unconfigured account absent from normal view', async () => (await U(() => {
      const d = window.U11;
      return d.visibleAccounts().length === 12 && d.unconfiguredCatalog.length === 4 &&
        !d.visibleFamilies().some((f) => /mistral|fireworks|openrouter|cohere/i.test(f.label));
    }))]
  ];

  for (const [name, fn] of fixtures) {
    try {
      const r = await fn();
      if (r && typeof r === 'object') record('fixture ' + name, !!r.ok, r.detail || '');
      else record('fixture ' + name, !!r);
    } catch (e) {
      record('fixture ' + name, false, String(e).slice(0, 200));
    }
  }

  /* context details advanced fields (step 7) */
  try {
    await page.evaluate(() => window.U11Context.openDetails('thread:t-88'));
    await page.waitForSelector('.u11ctx-det.on', { timeout: 4000 });
    const txt = await page.evaluate(() => document.querySelector('.u11ctx-det').innerText);
    /* the row no longer wears "(PM-derived)" as a parenthetical: it states the
       figure and says in words that this is Puppet Master's own measurement
       and not a provider figure. Assert the facts, not the old label. */
    record('context details show stable prefix / cache epoch / tool schema overhead',
      /Stable prefix/.test(txt) && /Cache epoch/.test(txt) && /Tool schema overhead/.test(txt) &&
      /Tool schema overhead is Puppet Master.s own measurement/.test(txt) && /not a provider figure/.test(txt));
    await page.screenshot({ path: shot('context-details') });
  } catch (e) { record('context details show stable prefix / cache epoch / tool schema overhead', false, String(e).slice(0, 200)); }

  await page.close();
}

/* ===================================================================== */
const t0 = Date.now();
const { server, port } = await startServer();
console.log(`u11-verify: static server on http://127.0.0.1:${port}/ (root: ${__dirname})`);
const userDataDir = path.join(os.tmpdir(), 'u11-verify-' + process.pid);
/* the persistent context IS the browser handle: pages come off it via
   newPage(), and its isolated userDataDir keeps 4 concurrent harnesses
   from ever sharing profile state */
const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: true, executablePath, args: ['--disable-gpu', '--no-first-run', '--no-default-browser-check']
});

try {
  await runMatrix(ctx, port);
  await runInteractions(ctx, port);
  await runNewBehavior(ctx, port);
  await runHardFailureGuards(ctx, port);
  await runClosureGuards(ctx, port);
  await runFixtureSweep(ctx, port);
} finally {
  await ctx.close();
  server.close();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}

const pass = cases.filter((c) => c.status === 'pass').length;
const fail = cases.filter((c) => c.status === 'fail').length;
const report = {
  schema_id: 'pm.usage_visual_interaction_test_report.v1',
  harness: 'playwright-core + system Chrome (' + path.basename(executablePath) + ')',
  concept: 'QwenUsageConcept/u11-prism',
  packet: 'PM_Usage_Concept_Update_Final_Cumulative_2026-08-08',
  ran_at: new Date().toISOString(),
  duration_ms: Date.now() - t0,
  cases, pass, fail, screenshots
};
fs.writeFileSync(path.join(__dirname, 'reports', 'visual-interaction-test-report.json'), JSON.stringify(report, null, 2));
console.log(`\n${pass} pass · ${fail} fail · ${cases.length} cases · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(fail ? 1 : 0);
