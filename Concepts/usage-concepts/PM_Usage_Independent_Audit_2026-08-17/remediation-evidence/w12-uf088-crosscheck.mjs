/* UF-088 canonical fixture cross-check — FINAL VERIFICATION PASS (independent).
   Method held identical to CANONICAL_FIXTURE_CROSSCHECK.json:
     dom_corpus  : rendered innerText of all room panes at ADVANCED disclosure,
                   plus scope popover, settings sheet, context ring popover,
                   context details popovers, run details and attempt inspectors.
     data_corpus : bounded cycle-safe walk of window.U11, depth 9, ~4MB cap.
     matching    : literal case-insensitive substring.
     equivalence : camelCase(key half) present as a KEY in the data walk.
   Extensions, declared:
     derived_field  : canonical field produced by a U11 accessor (as the
                      second-remediation verifier did).
     attr corpora  : data-u11-fields="" values and title="" values captured
                     SEPARATELY from innerText, so the "does a data-attribute
                     count as in-the-DOM" question can be scored both ways.
*/
import { chromium } from '/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/.verify/node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path';
const CHROME = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const PAGE = 'file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html';
const FIX = '/mnt/Cursor/PuppetMaster/tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json';
const SP = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/7e74d8f5-7c2a-4eeb-8947-13056b4b2e5f/scratchpad';
const fixtures = JSON.parse(readFileSync(FIX, 'utf8')).fixtures;

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'uf088f-' + process.pid),
  { executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'], viewport: { width: 1900, height: 1200 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto(PAGE, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(1200);
await p.evaluate(() => { const b = document.querySelector('[data-disc="advanced"]'); if (b) b.click(); });
await p.waitForTimeout(900);

const corpora = await p.evaluate(async () => {
  const diag = { rooms: [], panes: 0, attrFieldsNodes: 0, titleNodes: 0, steps: [] };
  const parts = [];
  const attrFields = [];
  const titles = [];
  const grab = () => {
    document.querySelectorAll('[data-u11-fields]').forEach(n => attrFields.push(n.getAttribute('data-u11-fields')));
    document.querySelectorAll('[title]').forEach(n => titles.push(n.getAttribute('title')));
  };
  const rooms = Array.from(document.querySelectorAll('.u11-item[data-tab]')).map(b => b.dataset.tab);
  diag.rooms = rooms;
  for (const r of rooms) {
    document.querySelector(`.u11-item[data-tab="${r}"]`).click();
    await new Promise(x => setTimeout(x, 560));
    document.querySelectorAll('.u11w-more-t').forEach(b => { try { b.click(); } catch (e) { } });
    await new Promise(x => setTimeout(x, 380));
    const el = document.querySelector(`[data-pane="${r}"]`);
    if (el) { parts.push(el.innerText); diag.panes++; }
    grab();
  }
  const sp = document.querySelector('[data-scope-open]'); if (sp) sp.click();
  await new Promise(x => setTimeout(x, 620));
  const pl = document.querySelector('#u11PopList');
  if (pl) parts.push(pl.innerText + '\n' + ((document.querySelector('#u11PopFoot') || {}).innerText || ''));
  grab();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await new Promise(x => setTimeout(x, 320));
  try { document.getElementById('u11Settings').click(); } catch (e) { diag.steps.push('settings ' + e.message); }
  await new Promise(x => setTimeout(x, 620));
  const sh = document.getElementById('u11SheetSprout'); if (sh) parts.push(sh.innerText);
  grab();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await new Promise(x => setTimeout(x, 320));
  const rb = document.querySelector('.u11ctx-ringbtn'); if (rb) rb.click();
  await new Promise(x => setTimeout(x, 720));
  const rp = document.querySelector('#u11-ctx-ring-pop'); if (rp) parts.push(rp.innerText);
  grab();
  document.body.click(); await new Promise(x => setTimeout(x, 320));
  for (const th of ['thread:t-88', 'thread:t-91']) {
    try { window.U11Context.openDetails(th); } catch (e) { diag.steps.push('ctx ' + th + ' ' + e.message); }
    await new Promise(x => setTimeout(x, 780));
    document.querySelectorAll('#u11-ctx-detail-pop .u11ctx-more-t').forEach(b => { try { b.click(); } catch (e) { } });
    await new Promise(x => setTimeout(x, 520));
    const dp = document.querySelector('#u11-ctx-detail-pop'); if (dp) parts.push(dp.innerText);
    grab();
  }
  document.body.click(); await new Promise(x => setTimeout(x, 320));
  for (const r of ['run:goal-47', 'run:plan-12']) {
    try { window.U11RunDetail.open(r); } catch (e) { diag.steps.push('rd ' + r + ' ' + e.message); }
    await new Promise(x => setTimeout(x, 780));
    const el = document.querySelector('aside.u11rd'); if (el) parts.push(el.innerText);
    grab();
  }
  for (const a of ['ue-501', 'ue-091', 'ue-520', 'ue-611', 'ue-541', 'ue-606']) {
    try { window.U11RunDetail.openAttempt(a); } catch (e) { diag.steps.push('att ' + a + ' ' + e.message); }
    await new Promise(x => setTimeout(x, 640));
    const el = document.querySelector('aside.u11rd'); if (el) parts.push(el.innerText);
    grab();
  }
  diag.attrFieldsNodes = attrFields.length; diag.titleNodes = titles.length;
  const dom = parts.join('\n');

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

  return { dom, attrFields: attrFields.join('\n'), titles: titles.join('\n'), dataLines: lines.join('\n'), dataKeys: [...keys], derived, diag };
});

const domRaw = corpora.dom;
const dom = domRaw.toLowerCase();
const attrs = corpora.attrFields.toLowerCase();
const titles = corpora.titles.toLowerCase();
const data = corpora.dataLines.toLowerCase();
const keySet = new Set(corpora.dataKeys.map(k => k.toLowerCase()));
const derivedSet = new Set([].concat(corpora.derived.tokenBucketsOf || [], corpora.derived.routePayload || []).map(s => String(s).toLowerCase()));
const camel = s => s.replace(/[^a-z0-9_]/gi, '').replace(/_([a-z0-9])/g, (m, c) => c.toUpperCase());

const ctxOf = (hay, needle) => {
  const out = []; let i = 0; const h = hay.toLowerCase(); const n = needle.toLowerCase();
  while (out.length < 4) { const j = h.indexOf(n, i); if (j < 0) break; out.push(hay.slice(Math.max(0, j - 90), j + n.length + 90).replace(/\n/g, ' ⏎ ')); i = j + n.length; }
  return out;
};

const rows = [];
const H = {
  must_total: 0, lit_dom_text: 0, lit_attr_fields: 0, lit_title: 0, lit_data: 0,
  camel_equiv: 0, derived_only: 0,
  represented_strict: 0, represented_with_attr: 0,
  must_not_total: 0, must_not_hits: 0
};
for (const f of fixtures) {
  const r = { fixture_id: f.fixture_id, title: f.title, must_total: f.must.length, tokens: [] };
  for (const tok of f.must) {
    H.must_total++;
    const t = tok.toLowerCase();
    const keyHalf = tok.includes(':') ? tok.slice(0, tok.indexOf(':')) : tok;
    const valHalf = tok.includes(':') ? tok.slice(tok.indexOf(':') + 1) : null;
    const cc = camel(keyHalf).toLowerCase();
    const e = { token: tok };
    e.literal_in_dom_text = dom.includes(t);
    e.literal_in_attr_fields = attrs.includes(t);
    e.literal_in_title = titles.includes(t);
    e.literal_in_data = data.includes(t);
    e.key_half_in_attr_fields = attrs.includes(keyHalf.toLowerCase());
    e.key_half_in_dom_text = dom.includes(keyHalf.toLowerCase());
    e.value_half_in_dom_text = valHalf ? dom.includes(valHalf.toLowerCase()) : null;
    e.camelcase_equivalent_field = keySet.has(cc) || keySet.has(keyHalf.toLowerCase());
    e.derived_field = !e.camelcase_equivalent_field && (derivedSet.has(cc) || derivedSet.has(keyHalf.toLowerCase()));
    e.represented_strict = !!(e.literal_in_dom_text || e.literal_in_data || e.camelcase_equivalent_field || e.derived_field);
    e.represented_with_attr = !!(e.represented_strict || e.literal_in_attr_fields || e.literal_in_title);
    if (e.literal_in_dom_text) H.lit_dom_text++;
    if (e.literal_in_attr_fields) H.lit_attr_fields++;
    if (e.literal_in_title) H.lit_title++;
    if (e.literal_in_data) H.lit_data++;
    if (e.camelcase_equivalent_field) H.camel_equiv++;
    if (e.derived_field) H.derived_only++;
    if (e.represented_strict) H.represented_strict++;
    if (e.represented_with_attr) H.represented_with_attr++;
    r.tokens.push(e);
  }
  r.must_not_total = f.must_not.length;
  H.must_not_total += f.must_not.length;
  r.must_not_literal_hits = f.must_not.filter(t => dom.includes(t.toLowerCase()))
    .map(t => ({ token: t, contexts: ctxOf(domRaw, t) }));
  H.must_not_hits += r.must_not_literal_hits.length;
  r.must_literal_in_dom_text = r.tokens.filter(t => t.literal_in_dom_text).length;
  r.must_literal_in_attr_fields = r.tokens.filter(t => t.literal_in_attr_fields).length;
  r.must_literal_in_title = r.tokens.filter(t => t.literal_in_title).length;
  r.must_literal_in_data = r.tokens.filter(t => t.literal_in_data).length;
  r.must_with_camelcase_equivalent_field = r.tokens.filter(t => t.camelcase_equivalent_field).map(t => t.token);
  r.must_derived_only = r.tokens.filter(t => t.derived_field).map(t => t.token);
  r.represented_strict = r.tokens.filter(t => t.represented_strict).length;
  r.represented_with_attr = r.tokens.filter(t => t.represented_with_attr).length;
  r.absent_strict = r.tokens.filter(t => !t.represented_strict).map(t => t.token);
  r.absent_with_attr = r.tokens.filter(t => !t.represented_with_attr).map(t => t.token);
  rows.push(r);
}

const out = {
  ran_at: new Date().toISOString(),
  page: PAGE,
  method_note: 'Independent re-run of CANONICAL_FIXTURE_CROSSCHECK.json method against the post-second-remediation concept. innerText DOM corpus is scored separately from data-u11-fields / title attribute corpora.',
  corpus_sizes: {
    dom_chars: corpora.dom.length, attr_fields_chars: corpora.attrFields.length,
    title_chars: corpora.titles.length, data_chars: corpora.dataLines.length,
    data_distinct_keys: corpora.dataKeys.length
  },
  capture_diagnostics: corpora.diag,
  headline: H,
  fixtures: rows,
  page_errors: errs
};
writeFileSync(SP + '/uf088-final-results.json', JSON.stringify(out, null, 1));
writeFileSync(SP + '/uf088-final-domcorpus.txt', domRaw);
writeFileSync(SP + '/uf088-final-attrcorpus.txt', corpora.attrFields);
writeFileSync(SP + '/uf088-final-titlecorpus.txt', corpora.titles);
console.log(JSON.stringify(H, null, 1));
console.log(JSON.stringify(out.corpus_sizes));
console.log('rooms=' + corpora.diag.rooms.length + ' panes=' + corpora.diag.panes + ' steps=' + JSON.stringify(corpora.diag.steps));
for (const r of rows) console.log(`${r.fixture_id}  must ${r.must_total}  domtext ${r.must_literal_in_dom_text}  attr ${r.must_literal_in_attr_fields}  title ${r.must_literal_in_title}  data ${r.must_literal_in_data}  equiv ${r.must_with_camelcase_equivalent_field.length}  strict ${r.represented_strict}  withattr ${r.represented_with_attr}  mustNot ${r.must_not_literal_hits.map(h => h.token).join(',')}`);
console.log('pageerrors=' + errs.length);
await ctx.close();
