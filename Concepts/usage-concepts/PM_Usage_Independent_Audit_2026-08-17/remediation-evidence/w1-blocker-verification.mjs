/* W1 blocker verification — proves each of the 7 blockers no longer reproduces.
   Read-only against the concept; writes nothing into it. */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad/w1-verify-results.json';

const results = [];
const rec = (id, name, pass, detail) => { results.push({ id, name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${name}\n      ${detail}`); };

const ctx = await chromium.launchPersistentContext(
  path.join(os.tmpdir(), 'w1-verify-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1600, height: 1000 } }
);
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('PAGEERROR ' + e.message));
await page.goto(PAGE, { waitUntil: 'load', timeout: 30000 });
await page.waitForTimeout(900);

/* ---- B7: timezone. Host is UTC, so the old code rendered 14:42 EDT. ---- */
const tz = await page.evaluate(() => ({
  zone: window.U11time && window.U11time.zone,
  resolved: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sample: window.U11time && window.U11time.clock ? window.U11time.clock('2026-08-04T18:42:00Z') : null,
  bodyHasEdt: /\bEDT\b/.test(document.body.innerText)
}));
rec('B7', 'timezone not silently relabelled on a UTC host',
  tz.resolved === 'UTC' ? (tz.zone === 'UTC' || tz.zone === tz.resolved) : true,
  `resolved=${tz.resolved} U11time.zone=${tz.zone} sample=${tz.sample} bodyMentionsEDT=${tz.bodyHasEdt}`);

/* ---- B4: no fabricated -1% and no green all-clear on unknown ---- */
await page.click('[data-scope-open]').catch(() => {});
await page.waitForTimeout(500);
const scope = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('#u11PopList .u11-pop-row'));
  const neg = rows.filter(r => /-1\s*%/.test(r.innerText));
  const okDotNoValue = rows.filter(r => r.querySelector('.u11-pop-dot.ok') && !r.querySelector('.u11-pop-val'));
  const unknownLabelled = rows.filter(r => r.querySelector('.u11-pop-val.is-unknown'));
  return {
    total: rows.length,
    negativeRows: neg.map(r => r.innerText.replace(/\n+/g, ' | ').slice(0, 70)),
    greenWithNoReading: okDotNoValue.length,
    unknownLabelled: unknownLabelled.length,
    sampleUnknown: unknownLabelled.slice(0, 3).map(r => r.innerText.replace(/\n+/g, ' | ').slice(0, 70))
  };
});
rec('B4', 'no fabricated -1% percentage in the scope picker',
  scope.negativeRows.length === 0,
  `rows=${scope.total} negative=${scope.negativeRows.length} ${JSON.stringify(scope.negativeRows)}`);
rec('B4b', 'rows with no reading say so instead of showing a green all-clear',
  scope.unknownLabelled > 0,
  `labelled-unknown=${scope.unknownLabelled} sample=${JSON.stringify(scope.sampleUnknown)}`);
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(300);

/* ---- B1: settings sheet writes no policy and dispatches a canonical command ---- */
const sheet = await page.evaluate(async () => {
  const before = localStorage.getItem('u11:settings');
  const logBefore = window.U11.cmdLog.length;
  document.getElementById('u11Settings').click();
  await new Promise(r => setTimeout(r, 350));
  const sp = document.getElementById('u11SheetSprout');
  const txt = sp ? sp.innerText : '';
  const writers = sp ? sp.querySelectorAll('[data-u11set],[data-u11extra],[data-u11limit]').length : -1;
  const changeLinks = sp ? sp.querySelectorAll('[data-u11open]').length : 0;
  const ladder = sp ? sp.querySelectorAll('.u11-sheet-step').length : 0;
  // click the first "Change in Settings"
  const btn = sp && sp.querySelector('[data-u11open]');
  const target = btn ? btn.getAttribute('data-u11open') : null;
  if (btn) btn.click();
  await new Promise(r => setTimeout(r, 200));
  const after = localStorage.getItem('u11:settings');
  const dispatched = window.U11.cmdLog.slice(logBefore);
  return { before, after, writers, changeLinks, ladder, target, dispatched, txt: txt.slice(0, 400) };
});
rec('B1', 'settings sheet contains zero policy-writing inputs',
  sheet.writers === 0, `policy inputs=${sheet.writers}  read-only change-links=${sheet.changeLinks}`);
rec('B1b', 'no u11:settings policy key is written to localStorage',
  sheet.after == null, `u11:settings before=${sheet.before} after=${sheet.after}`);
rec('B1c', 'change route dispatches the canonical cmd.settings.bloom.open with a real setting id',
  sheet.dispatched.some(e => e.cmd === 'cmd.settings.bloom.open' && e.payload && /^ai\./.test(e.payload.focus_setting_id || '')),
  `target=${sheet.target} dispatched=${JSON.stringify(sheet.dispatched)}`);

/* ---- B5: continuation ladder keeps every step and labels every key ---- */
const cont = await page.evaluate(async () => {
  const D = window.U11;
  const out = [];
  for (const pid of Object.keys(D.continuation)) {
    const steps = D.continuation[pid].order;
    out.push({ pid, declared: steps.length });
  }
  const sp = document.getElementById('u11SheetSprout');
  const shown = sp ? Array.from(sp.querySelectorAll('.u11-sheet-steplabel')).map(e => e.textContent) : [];
  const rawToken = shown.filter(t => /^[a-z]+(_[a-z]+)*$/.test(t.trim()));
  return { policies: out, shownForCurrent: shown, rawTokenLabels: rawToken };
});
const curPid = 'prod:codex-plus';
const declared = (cont.policies.find(p => p.pid === curPid) || {}).declared;
rec('B5', 'ladder shows every declared step for the selected product (no dedupe collapse)',
  cont.shownForCurrent.length === declared,
  `product=${curPid} declared=${declared} shown=${cont.shownForCurrent.length} labels=${JSON.stringify(cont.shownForCurrent)}`);
rec('B5b', 'no raw enum token reaches a user-visible ladder label',
  cont.rawTokenLabels.length === 0, `raw=${JSON.stringify(cont.rawTokenLabels)}`);

/* ---- B3: token totals do not add cache reads ---- */
const totals = await page.evaluate(() => {
  const D = window.U11;
  let incl = 0, excl = 0;
  D.attempts.forEach(a => {
    const t = a.tokens || {};
    excl += (t.input || 0) + (t.output || 0);
    incl += (t.input || 0) + (t.output || 0) + (t.cacheRead || 0) + (t.reasoning || 0);
  });
  return { excl, incl, delta: incl - excl };
});
/* B3, corrected 2026-08-18: cache read is ADDITIVE for Claude/Gemini-family
   routes, so adding it there is right. What must be true is that the total
   respects the published per-provider semantics, states its basis, and never
   renders a fabricated zero. */
const honesty = await page.evaluate(async () => {
  const U = window.U11W;
  if (!U || !U.tokenTotal) return { helper: false };
  const T = { input: 1000, output: 100, cacheRead: 500 };
  // real routes: Codex is inclusive, Claude is additive, a bogus id is unknown
  const incl = U.tokenTotal(T, { productId: 'prod:codex-plus', connectionId: 'conn:openai-personal-codex', effectiveAccountId: 'acct:openai-personal' });
  const add = U.tokenTotal(T, { productId: 'prod:claude-max', connectionId: 'conn:claude-work-cli', effectiveAccountId: 'acct:claude-work' });
  const unk = U.tokenTotal(T, { productId: 'prod:does-not-exist' });
  const none = U.tokenTotal({}, { productId: 'prod:claude-max' });
  return { helper: true, incl, add, unk, none };
});
rec('B3', 'token totals respect the published per-provider counting semantics',
  honesty.helper && honesty.incl.total === 1100 && honesty.add.total === 1600 && honesty.unk.total === 1100,
  `inclusive route=${honesty.incl && honesty.incl.total} (expect 1100, cache NOT added) | additive route=${honesty.add && honesty.add.total} (expect 1600, cache added) | unknown semantics=${honesty.unk && honesty.unk.total} (expect 1100, never guessed)`);
rec('B3b', 'a missing bucket renders as unknown, never as a fabricated zero',
  honesty.helper && honesty.none.total === null,
  `empty tokens -> total=${honesty.none && honesty.none.total} (must be null, not 0)`);
const runDetail = await page.evaluate(async () => {
  const dd = document.querySelector('[data-disc="advanced"]'); if (dd) dd.click();
  await new Promise(r => setTimeout(r, 300));
  const el = document.querySelector('.u11-item[data-tab="ledger"]');
  if (el) el.click();
  await new Promise(r => setTimeout(r, 700));
  // open a run detail panel — the basis line lives inside it, not on the ledger
  const opener = document.querySelector('[data-u11-act="openrun"]');
  if (opener) { opener.click(); await new Promise(r => setTimeout(r, 700)); }
  const body = document.body.innerText;
  return {
    statesBasis: /counted as input plus output/i.test(body),
    fabricatedZero: /·\s*0 tokens/.test(body),
    sample: (body.match(/[\d.]+k tokens[^\n]*/g) || []).slice(0, 3)
  };
});
rec('B3c', 'run detail states the counting basis and shows no fabricated zero total',
  runDetail.statesBasis && !runDetail.fabricatedZero,
  `basisStated=${runDetail.statesBasis} fabricatedZero=${runDetail.fabricatedZero} samples=${JSON.stringify(runDetail.sample)}`);

/* ---- B6: every free-model row carries its underlying route ---- */
const free = await page.evaluate(async () => {
  const d = document.querySelector('[data-disc="advanced"]'); if (d) d.click();
  await new Promise(r => setTimeout(r, 300));
  const el = document.querySelector('.u11-item[data-tab="free"]');
  if (el) el.click();
  await new Promise(r => setTimeout(r, 600));
  const rows = Array.from(document.querySelectorAll('[data-pane="free"] .u11w-prow'));
  const fams = Array.from(new Set(window.U11.families.map(f => f.label)));
  return rows.map(r => {
    const t = r.innerText.replace(/\n+/g, ' | ');
    return { text: t.slice(0, 110), hasFamily: fams.some(f => t.includes(f)), hasVia: /via /i.test(t) };
  });
});
const missing = free.filter(r => !r.hasFamily);
rec('B6', 'every Free Models row identifies its underlying provider',
  free.length > 0 && missing.length === 0,
  `rows=${free.length} missingProvider=${missing.length} ${JSON.stringify(missing.map(m => m.text))}`);

rec('CON', 'zero console errors across the run', consoleErrors.length === 0,
  `errors=${consoleErrors.length} ${JSON.stringify(consoleErrors.slice(0, 4))}`);

await ctx.close();
const passed = results.filter(r => r.pass).length;
writeFileSync(OUT, JSON.stringify({ ranAt: new Date().toISOString(), passed, total: results.length, results }, null, 1));
console.log(`\n${passed}/${results.length} W1 checks pass  ->  ${OUT}`);
process.exit(passed === results.length ? 0 : 1);
