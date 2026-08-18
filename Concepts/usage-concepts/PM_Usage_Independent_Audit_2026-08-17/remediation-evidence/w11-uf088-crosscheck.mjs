/* UF-088 canonical fixture cross-check, re-run post-remediation.
   Method reproduced from CANONICAL_FIXTURE_CROSSCHECK.json:
     dom_corpus  : innerText of all 13 room panes at ADVANCED disclosure, plus
                   the context ring popover, the context-details popover for both
                   threads, and one open run-detail + one open attempt inspector.
     data_corpus : bounded cycle-safe walk of window.U11, depth 9, ~4MB cap,
                   recording key names, scalar values and "key:value" pairs.
     matching    : literal case-insensitive substring; key half and value half of
                   key:value tokens recorded separately.
     equivalence : camelCase(key half) present as a KEY in the data walk.
   Extension declared explicitly: `derived_field` records tokens whose canonical
   field is produced by a U11 accessor (tokenBucketsOf / the dispatched route
   payload) rather than sitting on a static property. */
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const FIX = '/mnt/Cursor/PuppetMaster/tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json';
const SP = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const fixtures = JSON.parse(readFileSync(FIX, 'utf8')).fixtures;

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'uf088-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(PAGE, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(1000);
await p.evaluate(() => document.querySelector('[data-disc="advanced"]').click()); await p.waitForTimeout(800);

const corpora = await p.evaluate(async () => {
  const parts = [];
  const rooms = Array.from(document.querySelectorAll('.u11-item[data-tab]')).map(b => b.dataset.tab);
  for (const r of rooms) {
    document.querySelector(`.u11-item[data-tab="${r}"]`).click();
    await new Promise(x => setTimeout(x, 520));
    document.querySelectorAll('.u11w-more-t').forEach(b => { try { b.click(); } catch (e) { } });
    await new Promise(x => setTimeout(x, 340));
    const el = document.querySelector(`[data-pane="${r}"]`);
    if (el) parts.push(el.innerText);
  }
  /* scope picker */
  const sp = document.querySelector('[data-scope-open]'); if (sp) sp.click();
  await new Promise(x => setTimeout(x, 600));
  const pl = document.querySelector('#u11PopList'); if (pl) parts.push(pl.innerText + '\n' + (document.querySelector('#u11PopFoot') || {}).innerText);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await new Promise(x => setTimeout(x, 300));
  /* settings sheet */
  document.getElementById('u11Settings').click(); await new Promise(x => setTimeout(x, 600));
  const sh = document.getElementById('u11SheetSprout'); if (sh) parts.push(sh.innerText);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await new Promise(x => setTimeout(x, 300));
  /* context ring + details for both threads */
  const rb = document.querySelector('.u11ctx-ringbtn'); if (rb) rb.click();
  await new Promise(x => setTimeout(x, 700));
  const rp = document.querySelector('#u11-ctx-ring-pop'); if (rp) parts.push(rp.innerText);
  document.body.click(); await new Promise(x => setTimeout(x, 300));
  for (const th of ['thread:t-88', 'thread:t-91']) {
    window.U11Context.openDetails(th); await new Promise(x => setTimeout(x, 750));
    document.querySelectorAll('#u11-ctx-detail-pop .u11ctx-more-t').forEach(b => { try { b.click(); } catch (e) { } });
    await new Promise(x => setTimeout(x, 500));
    const dp = document.querySelector('#u11-ctx-detail-pop'); if (dp) parts.push(dp.innerText);
  }
  document.body.click(); await new Promise(x => setTimeout(x, 300));
  /* run detail + attempt inspectors */
  for (const r of ['run:goal-47', 'run:plan-12']) {
    window.U11RunDetail.open(r); await new Promise(x => setTimeout(x, 750));
    const el = document.querySelector('aside.u11rd'); if (el) parts.push(el.innerText);
  }
  for (const a of ['ue-501', 'ue-091', 'ue-520', 'ue-611', 'ue-541', 'ue-606']) {
    window.U11RunDetail.openAttempt(a); await new Promise(x => setTimeout(x, 620));
    const el = document.querySelector('aside.u11rd'); if (el) parts.push(el.innerText);
  }
  const dom = parts.join('\n');

  /* --------- bounded, cycle-safe walk of window.U11 --------- */
  const CAP = 4 * 1024 * 1024;
  const seen = new WeakSet();
  const keys = new Set();
  const lines = [];
  let size = 0;
  const push = s => { if (size < CAP) { lines.push(s); size += s.length + 1; } };
  const walk = (o, depth, parentKey) => {
    if (size >= CAP || o == null || depth > 9) return;
    if (typeof o === 'object') {
      if (seen.has(o)) return; seen.add(o);
      if (Array.isArray(o)) { for (const v of o) { if (v !== null && typeof v !== 'object') push(parentKey + ':' + String(v)); walk(v, depth + 1, parentKey); } return; }
      for (const k of Object.keys(o)) {
        keys.add(k); push(k);
        const v = o[k];
        if (v === null || typeof v !== 'object') { push(k + ':' + String(v)); push(String(v)); }
        else walk(v, depth + 1, k);
      }
      return;
    }
    push(String(o));
  };
  walk(window.U11, 0, 'U11');

  /* declared extension: canonical fields produced by accessors */
  const derived = {};
  try {
    const tb = window.U11.tokenBucketsOf(window.U11.attemptById['ue-501']);
    const flat = o => { const out = []; const go = (x, pre) => { if (x && typeof x === 'object') { for (const k of Object.keys(x)) { out.push(pre + k); go(x[k], ''); } } }; go(o, ''); return out; };
    derived.tokenBucketsOf = flat(tb);
  } catch (e) { derived.tokenBucketsOf = ['ERR ' + e.message]; }
  try {
    window.U11.cmdLog.length = 0;
    window.U11RunDetail.openAttempt('ue-501');
    const e0 = window.U11.cmdLog.find(c => c.cmd === 'cmd.nav.open_usage_subject');
    const out = []; const go = (x, pre) => { if (x && typeof x === 'object') for (const k of Object.keys(x)) { out.push(pre + k); go(x[k], ''); } };
    go(e0 && e0.payload, ''); derived.routePayload = out;
  } catch (e) { derived.routePayload = ['ERR ' + e.message]; }

  return { dom, dataLines: lines.join('\n'), dataKeys: [...keys], derived };
});

const dom = corpora.dom.toLowerCase();
const data = corpora.dataLines.toLowerCase();
const keySet = new Set(corpora.dataKeys.map(k => k.toLowerCase()));
const derivedSet = new Set([].concat(corpora.derived.tokenBucketsOf || [], corpora.derived.routePayload || []).map(s => String(s).toLowerCase()));
const camel = s => s.replace(/[^a-z0-9_]/gi, '').replace(/_([a-z0-9])/g, (m, c) => c.toUpperCase());

const rows = [];
let mustTotal = 0, litDom = 0, litData = 0, equiv = 0, derivedOnly = 0, represented = 0;
let mustNotTotal = 0, mustNotHits = 0;
for (const f of fixtures) {
  const r = { fixture_id: f.fixture_id, title: f.title, must_total: f.must.length, tokens: [] };
  for (const tok of f.must) {
    mustTotal++;
    const t = tok.toLowerCase();
    const keyHalf = tok.includes(':') ? tok.slice(0, tok.indexOf(':')) : tok;
    const valHalf = tok.includes(':') ? tok.slice(tok.indexOf(':') + 1) : null;
    const cc = camel(keyHalf).toLowerCase();
    const e = { token: tok };
    e.literal_in_dom = dom.includes(t);
    e.literal_in_data = data.includes(t);
    e.key_half_in_data = data.includes(keyHalf.toLowerCase());
    e.value_half_in_dom = valHalf ? dom.includes(valHalf.toLowerCase()) : null;
    e.camelcase_equivalent_field = keySet.has(cc) || keySet.has(keyHalf.toLowerCase());
    e.derived_field = !e.camelcase_equivalent_field && (derivedSet.has(cc) || derivedSet.has(keyHalf.toLowerCase()));
    if (e.literal_in_dom) litDom++;
    if (e.literal_in_data) litData++;
    if (e.camelcase_equivalent_field) equiv++;
    if (e.derived_field) derivedOnly++;
    if (e.literal_in_dom || e.literal_in_data || e.camelcase_equivalent_field || e.derived_field) represented++;
    r.tokens.push(e);
  }
  r.must_not_total = f.must_not.length;
  mustNotTotal += f.must_not.length;
  r.must_not_literal_hits = f.must_not.filter(t => dom.includes(t.toLowerCase()));
  mustNotHits += r.must_not_literal_hits.length;
  r.must_literal_in_dom = r.tokens.filter(t => t.literal_in_dom).length;
  r.must_literal_in_data = r.tokens.filter(t => t.literal_in_data).length;
  r.must_with_camelcase_equivalent_field = r.tokens.filter(t => t.camelcase_equivalent_field).map(t => t.token);
  r.must_absent_everywhere = r.tokens.filter(t => !(t.literal_in_dom || t.literal_in_data || t.camelcase_equivalent_field || t.derived_field)).map(t => t.token);
  rows.push(r);
}

const out = {
  ran_at: new Date().toISOString(),
  method_note: 'Re-run of CANONICAL_FIXTURE_CROSSCHECK.json against the post-remediation concept, same corpora definition and same literal/equivalence matching, plus one declared extension (derived_field).',
  corpus_sizes: { dom_chars: corpora.dom.length, data_chars: corpora.dataLines.length, data_distinct_keys: corpora.dataKeys.length },
  headline: {
    fixtures: fixtures.length, must_tokens_total: mustTotal,
    must_tokens_present_literally_in_dom: litDom,
    must_tokens_present_literally_in_data: litData,
    must_tokens_with_a_camelcase_field_in_data: equiv,
    must_tokens_only_in_a_derived_accessor: derivedOnly,
    must_tokens_represented_by_any_measure: represented,
    must_tokens_absent_everywhere: mustTotal - represented,
    must_not_total: mustNotTotal,
    must_not_literal_hits: mustNotHits
  },
  fixtures: rows,
  page_errors: errs
};
writeFileSync(SP + '/uf088-results.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.headline, null, 1));
console.log(JSON.stringify(out.corpus_sizes));
for (const r of rows) console.log(`${r.fixture_id}  must ${r.must_total}  dom ${r.must_literal_in_dom}  data ${r.must_literal_in_data}  equiv ${r.must_with_camelcase_equivalent_field.length}  absent ${r.must_absent_everywhere.length}  mustNotHits ${JSON.stringify(r.must_not_literal_hits)}`);
await ctx.close();
