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

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const executablePath = fs.existsSync(CHROME) ? CHROME : EDGE;

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

  /* settings sheet + provider deep link toast */
  try {
    await page.click('#u11Settings');
    await page.waitForSelector('#u11SheetSprout:not([hidden])', { timeout: 3000 });
    const r1 = await toastAfter(page, () => page.click('#u11SheetSprout [data-u11link="provider"]'), /Opening settings/);
    record('interaction settings sheet deep link toast', r1.ok, r1.t);
    await page.click('body', { position: { x: 5, y: 5 } });
  } catch (e) { record('interaction settings sheet deep link toast', false, String(e).slice(0, 200)); }

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
    const ok = /back seat driver/i.test(txt) && /silent check/i.test(txt) && /a silent provider call still counts/i.test(txt) &&
      /cache write/i.test(txt) && /not exposed/i.test(txt);
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
    const phases = await page.evaluate(() => {
      const cards = document.querySelectorAll('.u11w-opcard');
      for (const c of cards) { if (/Codex CLI update/.test(c.innerText)) return c.querySelectorAll('.u11w-ophase').length; }
      return -1;
    });
    const ok = /Codex CLI update/.test(txt) && /rolled back/.test(txt) && phases === 5;
    record('new operations widget (CLI update · rolled back · 5 phases)', ok, `phases=${phases}`);
    await page.screenshot({ path: shot('operations-widget') });
  } catch (e) { record('new operations widget (CLI update · rolled back · 5 phases)', false, String(e).slice(0, 200)); }

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
    const dl = await page.evaluate(() => {
      const e = window.U11.cmdLog.filter((c) => c.cmd === 'semantic.deep_link').pop();
      return e && e.payload && e.payload.focus_reason === 'setup_required' && e.payload.continuation === 'cont-8841';
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

  /* capacity envelope line */
  try {
    await goToTab(page, 'overview');
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('.u11w-capenv, .u11w-capline.dim'))
        .some((el) => /sustainable/.test(el.textContent));
    }, { timeout: 5000 });
    record('new capacity envelope line (sustainable)', true);
    await page.screenshot({ path: shot('capacity-envelope') });
  } catch (e) { record('new capacity envelope line (sustainable)', false, String(e).slice(0, 200)); }

  /* forecast refresh button dispatches */
  try {
    const r3 = await toastAfter(page, () => page.click('[data-u11-act="reqforecast"]'), /Forecast refreshed/);
    const has = await page.evaluate(() => window.U11.cmdLog.some((c) => c.cmd === 'cmd.usage.forecast.request'));
    record('new forecast refresh dispatches cmd.usage.forecast.request', has, r3.t);
  } catch (e) { record('new forecast refresh dispatches cmd.usage.forecast.request', false, String(e).slice(0, 200)); }

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
    await page.waitForFunction(() => /Provider data unavailable · PM estimate 63% · medium confidence/.test(document.body.innerText), { timeout: 5000 });
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
    ['8 specialists admitted in waves (run:goal-47)', async () => (await U(() => {
      const r = window.U11.runById['run:goal-47'];
      return r.requested.children === 8 && r.admitted.now === 2 && r.queued.waves >= 3;
    }))],
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
      return o.phases.length === 5 && o.outcome === 'rolled_back' && o.validationEventId === 'ue-609' &&
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
      record('fixture ' + name, !!(await fn()));
    } catch (e) {
      record('fixture ' + name, false, String(e).slice(0, 200));
    }
  }

  /* context details advanced fields (step 7) */
  try {
    await page.evaluate(() => window.U11Context.openDetails('thread:t-88'));
    await page.waitForSelector('.u11ctx-det.on', { timeout: 4000 });
    const txt = await page.evaluate(() => document.querySelector('.u11ctx-det').innerText);
    record('context details show stable prefix / cache epoch / tool schema overhead',
      /Stable prefix/.test(txt) && /Cache epoch/.test(txt) && /Tool schema overhead \(PM-derived\)/.test(txt));
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
  await runFixtureSweep(ctx, port);
} finally {
  await ctx.close();
  server.close();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}

const pass = cases.filter((c) => c.status === 'pass').length;
const fail = cases.filter((c) => c.status === 'fail').length;
const report = {
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
