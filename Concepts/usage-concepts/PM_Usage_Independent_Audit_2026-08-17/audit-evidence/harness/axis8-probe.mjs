/* AXIS 8 PROBE — maintenance / ops never shown as model tokens/cost.
   READ-ONLY on the concept. file:// only. Writes only to scratchpad. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const CONCEPT = '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept';
const SCRATCH = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const OUT = path.join(SCRATCH, 'axis8-probe-results.json');
const PROFILE = path.join(SCRATCH, 'axis8-profile');
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'file://' + CONCEPT + '/u11-prism.html';
const req = createRequire(path.join(CONCEPT, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');
fs.mkdirSync(PROFILE, { recursive: true });

const ROOMS = ['overview', 'plans', 'costs', 'accounts', 'free', 'context', 'analytics',
  'ledger', 'attention', 'cache', 'tools', 'signals', 'authority'];
const R = {};

function j(o) { return JSON.stringify(o); }

const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME, headless: true,
  args: ['--headless', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=9413'],
  viewport: { width: 1500, height: 1000 }
});
const page = ctx.pages()[0] || await ctx.newPage();
const consoleMsgs = [];
page.on('console', m => consoleMsgs.push({ type: m.type(), text: m.text() }));
page.on('pageerror', e => consoleMsgs.push({ type: 'pageerror', text: String(e) }));
await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
await page.waitForTimeout(1400);

/* helpers in page */
await page.addScriptTag({
  content: `window.__X = {
    room: function(n){ var b=document.querySelector('.u11-rail .u11-item[data-tab="'+n+'"]'); if(!b) return false; b.click(); return true; },
    disc: function(l){ var b=document.querySelector('[data-disc="'+l+'"]'); if(!b) return false; b.click(); return true; },
    pane: function(n){ return document.querySelector('.u11-pane[data-pane="'+n+'"]'); },
    vis: function(el){ if(!el) return false; var r=el.getBoundingClientRect(); var s=getComputedStyle(el);
      return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'; }
  };`
});

async function room(n) { await page.evaluate(x => window.__X.room(x), n); await page.waitForTimeout(700); }
async function disc(l) { await page.evaluate(x => window.__X.disc(x), l); await page.waitForTimeout(900); }

/* ---------- P1: operations widget cards, per disclosure level ---------- */
R.opsCards = {};
for (const lvl of ['essentials', 'standard', 'advanced']) {
  await disc(lvl);
  await room('ledger');
  R.opsCards[lvl] = await page.evaluate(() => {
    const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
    const cards = Array.from(pane.querySelectorAll('.u11w-opcard'));
    const TOKRE = /\b\d[\d,\.]*\s*(k\b|tokens?\b|tok\b)/i;
    const MONEYRE = /\$\s?\d/;
    return {
      opsWidgetPresent: !!Array.from(pane.querySelectorAll('[data-w]')).find(w => (w.getAttribute('data-w') || '') === 'operations'),
      mountedTypes: Array.from(pane.querySelectorAll('[data-w]')).map(w => w.getAttribute('data-w')),
      cardCount: cards.length,
      cards: cards.map(c => {
        const t = c.innerText.replace(/\s+/g, ' ').trim();
        return {
          text: t,
          badge: (c.querySelector('.u11w-kind') || {}).textContent || null,
          badgeClass: (c.querySelector('.u11w-kind') || {}).className || null,
          ctas: Array.from(c.querySelectorAll('button')).map(b => b.textContent.trim()),
          tokenLike: (t.match(new RegExp(TOKRE.source, 'gi')) || []),
          moneyLike: (t.match(new RegExp(MONEYRE.source, 'g')) || []),
          digits: (t.match(/\d[\d,\.]*\s*[a-zA-Z%]*/g) || [])
        };
      }),
      widgetNote: (() => {
        const w = Array.from(pane.querySelectorAll('[data-w]')).find(x => x.getAttribute('data-w') === 'operations');
        if (!w) return null;
        const n = w.querySelector('.u11w-note, .uw-note');
        return n ? n.innerText.replace(/\s+/g, ' ').trim() : null;
      })()
    };
  });
}

/* ---------- P2: whole-document token search for required 04 fields ---------- */
const NEEDLES = ['verify_failed', 'Verify failed', 'Failure class', 'failure class',
  '0.43.1', 'Target version', 'target version', 'Outcome', 'outcome',
  'Affected connection', 'affected connection', 'cont-8841', 'continuation token',
  'Schedule', 'schedule', 'publisher-signed', 'x64', 'setup_required', 'Setup Required',
  'ue-610', 'ue-609', 'validation_only', 'validation only'];
R.docSearch = {};
for (const lvl of ['essentials', 'advanced']) {
  await disc(lvl);
  const hits = {};
  for (const n of NEEDLES) hits[n] = [];
  for (const rm of ROOMS) {
    await room(rm);
    const res = await page.evaluate((args) => {
      const [needles, rmName] = args;
      const pane = document.querySelector('.u11-pane[data-pane="' + rmName + '"]');
      const txt = pane ? pane.innerText : '';
      const html = pane ? pane.outerHTML : '';
      const out = {};
      needles.forEach(n => {
        out[n] = { inText: txt.indexOf(n) >= 0, inHtml: html.indexOf(n) >= 0 };
      });
      return out;
    }, [NEEDLES, rm]);
    for (const n of NEEDLES) {
      if (res[n].inText) hits[n].push(rm + ':text');
      else if (res[n].inHtml) hits[n].push(rm + ':htmlOnly');
    }
  }
  R.docSearch[lvl] = hits;
}

/* ---------- P3: ops-1 verification CTA -> attempt inspector ---------- */
await disc('advanced');
await room('ledger');
R.verificationLink = await page.evaluate(async () => {
  const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
  const btn = Array.from(pane.querySelectorAll('button')).find(b => /View the verification call/i.test(b.textContent));
  if (!btn) return { found: false };
  btn.scrollIntoView({ block: 'center' });
  btn.click();
  await new Promise(r => setTimeout(r, 900));
  const p = document.querySelector('.u11rd');
  return {
    found: true,
    att: btn.getAttribute('data-att'),
    panelPresent: !!p,
    panelVisible: !!p && getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0,
    panelText: p ? p.innerText.replace(/\s+/g, ' ').trim() : null
  };
});

/* close inspector */
await page.evaluate(() => {
  const x = document.querySelector('.u11rd [data-u11rd-close], .u11rd .u11rd-x, .u11rd button');
  if (x) x.click();
});
await page.waitForTimeout(500);

/* ---------- P4: ops-8 setup CTA -> toast + cmdLog ---------- */
R.setupLink = await page.evaluate(async () => {
  const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
  const btn = Array.from(pane.querySelectorAll('button')).find(b => /Open provider setup/i.test(b.textContent));
  if (!btn) return { found: false };
  const before = window.U11.cmdLog.length;
  btn.scrollIntoView({ block: 'center' });
  btn.click();
  await new Promise(r => setTimeout(r, 700));
  const toasts = Array.from(document.querySelectorAll('.rail-toast')).map(t => t.textContent);
  return {
    found: true, toasts,
    newLog: window.U11.cmdLog.slice(before)
  };
});

/* ---------- P5: ledger work-4 card at each level ---------- */
R.work4 = {};
for (const lvl of ['essentials', 'standard', 'advanced']) {
  await disc(lvl);
  await room('ledger');
  R.work4[lvl] = await page.evaluate(() => {
    const pane = document.querySelector('.u11-pane[data-pane="ledger"]');
    const cards = Array.from(pane.querySelectorAll('.u11w-turncard'));
    const c = cards.find(x => /Run integration tests/.test(x.innerText));
    return c ? c.innerText.replace(/\s+/g, ' ').trim() : null;
  });
}

/* ---------- P6: authority room catalog & probes ---------- */
await disc('advanced');
await room('authority');
R.authority = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane[data-pane="authority"]');
  const groups = Array.from(pane.querySelectorAll('.u11w-freegroup')).map(g => g.innerText.replace(/\s+/g, ' ').trim());
  const ops = Array.from(pane.querySelectorAll('.u11w-toolop')).map(g => g.innerText.replace(/\s+/g, ' ').trim());
  return { paneText: pane.innerText.replace(/\s+/g, ' ').trim(), groups, toolops: ops };
});

/* ---------- P7: scope picker footer (does the aggregate include validation?) ---------- */
R.scopeFoot = await page.evaluate(async () => {
  const b = document.querySelector('[data-scope-open]');
  if (!b) return { found: false };
  b.click();
  await new Promise(r => setTimeout(r, 600));
  const f = document.getElementById('u11PopFoot');
  const out = { found: true, foot: f ? f.innerText.replace(/\s+/g, ' ').trim() : null };
  const totalAttempts = window.U11.attempts.length;
  const inScope = window.U11.attempts.filter(a => window.U11.attemptInScope(a, 'scope:all')).length;
  const validationInScope = window.U11.attempts.filter(a => a.bucket === 'validation' && window.U11.attemptInScope(a, 'scope:all')).map(a => a.eventId);
  out.totalAttempts = totalAttempts; out.inScope = inScope; out.validationInScope = validationInScope;
  const x = document.getElementById('u11PopX'); if (x) x.click();
  return out;
});

/* ---------- P8: localOps rendered anywhere? ---------- */
R.localOps = {};
{
  const labels = await page.evaluate(() => window.U11.localOps.map(o => o.label));
  const found = {};
  for (const l of labels) found[l] = [];
  for (const lvl of ['essentials', 'advanced']) {
    await page.evaluate(x => window.__X.disc(x), lvl); await page.waitForTimeout(700);
    for (const rm of ROOMS) {
      await page.evaluate(x => window.__X.room(x), rm); await page.waitForTimeout(450);
      const res = await page.evaluate((args) => {
        const [labels, rmName] = args;
        const pane = document.querySelector('.u11-pane[data-pane="' + rmName + '"]');
        const txt = pane ? pane.innerText : ''; const html = pane ? pane.outerHTML : '';
        const o = {};
        labels.forEach(l => { o[l] = { t: txt.indexOf(l) >= 0, h: html.indexOf(l) >= 0 }; });
        return o;
      }, [labels, rm]);
      for (const l of labels) { if (res[l].t) found[l].push(lvl + '/' + rm + ':text'); else if (res[l].h) found[l].push(lvl + '/' + rm + ':htmlOnly'); }
    }
  }
  R.localOps = { labels, found };
}

/* ---------- P9: catalogEvents rendered fields ---------- */
await page.evaluate(() => window.__X.disc('advanced')); await page.waitForTimeout(700);
await page.evaluate(() => window.__X.room('authority')); await page.waitForTimeout(700);
R.catalogFields = await page.evaluate(() => {
  const pane = document.querySelector('.u11-pane[data-pane="authority"]');
  const txt = pane.innerText;
  const ce = window.U11.catalogEvents;
  return ce.map(c => ({
    id: c.id, source: c.source, status: c.status,
    modelsChangedInDom: c.modelsChanged != null ? txt.indexOf(String(c.modelsChanged)) >= 0 : null,
    modelsChangedLabelInDom: /models changed|modelsChanged|changed/i.test(txt),
    freeStateChangesLabelInDom: /free.?state/i.test(txt),
    backoffUntilInDom: c.failureBackoffUntil ? txt.indexOf(String(c.failureBackoffUntil).slice(11, 16)) >= 0 : null,
    probeJoinField: Object.keys(c).filter(k => /event|probe|attempt/i.test(k))
  }));
});

/* ---------- P10: any op title co-rendered with a token/cost anywhere ---------- */
R.opTitleProximity = await page.evaluate(() => {
  const titles = window.U11.operational.map(o => o.title);
  const out = [];
  document.querySelectorAll('.u11w-opcard').forEach(c => {
    const t = c.innerText;
    const title = titles.find(x => t.indexOf(x) >= 0) || null;
    out.push({ title, hasDollar: /\$/.test(t), hasTokenWord: /token/i.test(t), hasTokWord: /\btok\b/i.test(t) });
  });
  return out;
});

R.console = consoleMsgs;
fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log('wrote', OUT);
await ctx.close();
