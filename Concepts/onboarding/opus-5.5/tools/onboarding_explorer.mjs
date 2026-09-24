/* Onboarding explorer: the logic audit's crawler. From the first screen it clicks every enabled control, and types a
 * valid sample into every field it knows, from every reachable state, the way a curious person would. The page is
 * reloaded for every click so nothing leaks between paths; a state is restored from its saved session (the same
 * secret-free record resume uses), so no path has to be replayed. It records where every click leads.
 *   node tools/onboarding_explorer.mjs <out-dir> [--scenario fresh] [--max 1200] [--workers 10] [--size 1440x900]
 * Writes graph.json (states, transitions) and report.json, and prints a summary:
 *   - screens reached and never reached, of every screen the onboarding defines
 *   - dead ends: states where the primary is disabled and no control reaches another screen
 *   - no-op controls: an enabled control whose click changed nothing (screen, session and pane all unchanged)
 *   - disabled controls without a reason
 *   - raw copy keys on screen, content spilling past the pane, page errors
 * The rule table in AUDIT.md reads graph.json for its path checks (what is shown or offered after which choices). */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/explore');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const SCENARIO = opt('scenario', 'fresh');
const MAX = Number(opt('max', 1200));
/* at most this many states per screen, so the budget reaches every screen instead of one screen's combinations */
const PER_SCREEN = Number(opt('per-screen', 30));
const perScreen = new Map();
const WORKERS = Number(opt('workers', 10));
const [W, H] = opt('size', '1440x900').split('x').map(Number);
mkdirSync(out, { recursive: true });

/* valid samples for the fields the flow asks for (the acceptance scenarios' own values) */
const SAMPLES = {
  name: ['Book club website'], user: ['jared'], pw: ['correct horse'], phrase: ['river candle orbit maple quiet lantern'],
  repo: ['book-club-site'], proxy: ['https://pm.example.net'], code: ['482 913', 'A7K9-M2Q4'], addr: ['192.168.1.20'],
  address: ['192.168.1.20'], port: ['22'], headscale: ['https://headscale.example.com'], link: ['pm-remote-link:home-nas/7Q2K'],
  custom: ['~/Documents/Clubs'], newName: ['book-club-site-2'], pass: ['passphrase for the test'], simEmail: ['jared@example.com'],
  simUser: ['jared-p'], token: ['not-a-real-token'], word: ['river']
};

/* in-page: what the person can see and do now */
const CAPTURE = `(() => {
  const S = window.O55 && window.O55.S; if (!S || !S.open) return { closed: true, tour: !!(window.O55 && window.O55.tour && window.O55.tour.running) };
  const layer = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');
  const vis = (e) => e.getClientRects().length && e.getBoundingClientRect().width > 0;
  const controls = layer ? [...layer.querySelectorAll('[data-o55-do], .o55-back')].filter(vis).map((e) => ({
    act: e.getAttribute('data-o55-do') || (e.classList.contains('o55-back') ? '__back' : ''), arg: e.getAttribute('data-arg'),
    disabled: e.getAttribute('aria-disabled') === 'true', reason: e.getAttribute('data-disabled-reason') || '',
    primary: e.classList.contains('o55-primary'), label: (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60) })) : [];
  const fields = layer ? [...layer.querySelectorAll('[data-o55-bind]')].filter(vis).map((e) => ({ bind: e.getAttribute('data-o55-bind'), value: e.value || '', invalid: e.getAttribute('aria-invalid') === 'true' })) : [];
  const text = layer ? layer.innerText : '';
  const rawKeys = (text.match(/\\b[a-z][a-zA-Z0-9_]*(?:\\.[a-zA-Z0-9_]+){2,}\\b/g) || []).filter((k) => !/^(www|github|gitlab|pm|app|get)\\./.test(k) && !/\\.(com|net|org|local|io|dev|app)$/.test(k));
  const pane = document.querySelector('#pm-o55-onboarding .o55-pane'), pr = pane ? pane.getBoundingClientRect() : null;
  /* words that run past the pane (decorative art may be clipped on purpose; text never should be) */
  const hasText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const spill = layer && pr ? [...layer.querySelectorAll('*')].filter((e) => !(e instanceof SVGElement) && vis(e) && hasText(e)).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 2 && (r.right > pr.right + 3 || r.left < pr.left - 3); }).slice(0, 3).map((e) => ((e.className || e.tagName) + ': ' + e.textContent.trim()).slice(0, 70)) : [];
  let h = 0; const html = layer ? layer.innerHTML : ''; for (let i = 0; i < html.length; i++) h = (h * 31 + html.charCodeAt(i)) | 0;
  const running = Object.values(S.sess.ops || {}).some((o) => o && o.state === 'running');
  return { screen: S.sess.screen, sess: JSON.stringify(S.sess), controls, fields, rawKeys, spill, html: h, running,
    rail: [...document.querySelectorAll('#pm-o55-onboarding .o55-rail [data-chapter]')].map((e) => e.getAttribute('data-chapter')) };
})()`;

/* the parts of a session that make two states different decisions (visual toggles and clocks left out) */
function keyOf(snap) {
  if (snap.closed) return snap.tour ? 'closed:tour' : 'closed';
  const s = JSON.parse(snap.sess);
  const ui = Object.fromEntries(Object.entries(s.ui || {}).filter(([k]) => !/^(details|detail:|more|onlineAdv|repoQ|treeAt|nameTouched|sheet)/.test(k) && !k.startsWith('d:')));
  const drafts = JSON.parse(JSON.stringify(s.drafts || {}));
  /* the look changes presentation only ("the look blocks nothing"), so it does not make a new decision state */
  for (const d of Object.values(drafts)) { for (const k of Object.keys(d)) if (/revision|_at$|draft_ref|sha256|preflight_result_refs|^theme_/.test(k)) delete d[k]; }
  const ops = Object.fromEntries(Object.entries(s.ops || {}).map(([k, v]) => [k, v && v.state]));
  const pick = { screen: s.screen, active: s.active, drafts, ui, ops, commit: s.commit && s.commit.state, server: s.server, connect: s.connect, nas: s.nas, online: s.online, backup: s.backup, ai: s.ai, restore: s.restore, folder: s.folder, like: s.like, signin: s.signin && s.signin.state };
  return s.screen + ':' + createHash('sha1').update(JSON.stringify(pick)).digest('hex').slice(0, 12);
}

const states = new Map();       /* key -> { key, screen, sess, controls, fields, rawKeys, spill, rail, depth } */
const transitions = [];         /* { from, control, to, screen, changed, errors } */
const queue = [];               /* jobs: { from, control } */
let started = 0, done = 0;
const t0 = Date.now();

function enqueueControls(st) {
  if (st.depth > 60) return;
  for (const c of st.controls) if (!c.disabled && c.act !== 'close') queue.push({ from: st.key, control: { kind: 'click', act: c.act, arg: c.arg, label: c.label } });
  for (const f of st.fields) for (const v of (SAMPLES[f.bind] || [])) if (f.value !== v) queue.push({ from: st.key, control: { kind: 'type', bind: f.bind, value: v } });
}

async function settle(page) {
  const tEnd = Date.now() + 9000; let prev = null;
  while (Date.now() < tEnd) {
    await sleep(250);
    /* settled = the window is not mid-transition, no owner operation is running, and the screen, its operations and
       its pane read the same twice in a row */
    const s = await page.evaluate(`(() => { const S = window.O55 && window.O55.S; if (!S || !S.open) return 'closed'; if (document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-out')) return 'moving'; const ops = S.sess.ops || {}; if (Object.values(ops).some((o) => o && o.state === 'running')) return 'running'; const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); return S.sess.screen + '|' + Object.keys(ops).map((k) => k + '=' + (ops[k] && ops[k].state)).join(',') + '|' + (l ? l.innerHTML.length : 0); })()`);
    if (s === 'closed') return;
    if (s !== 'moving' && s !== 'running' && s === prev) return;
    prev = s;
  }
}

async function load(page, sess) {
  await page.goto(pathToFileURL(PAGE).href + '?o55=off&o55scenario=' + encodeURIComponent(SCENARIO));
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!(window.O55 && window.O55.ui && window.O55.ui.open && window.PM_HOME_WORKSPACE))) break; await sleep(150); }
  await page.evaluate((s) => {
    window.PM_THEME.setFamily('basic', { persist: false }); window.PM_THEME.setMode('dark', { persist: false });
    if (s) { const o = JSON.parse(s); o.status = 'closed'; localStorage.setItem('pm.o55.onboarding.v1', JSON.stringify(o)); window.O55.ui.open({}); }
    else window.O55.ui.open({ fresh: true });
  }, sess || null);
  await sleep(700); await settle(page);
}

async function act(page, control) {
  if (control.kind === 'type') {
    const sel = `#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-bind="${control.bind}"]`;
    const ok = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.focus(); el.select && el.select(); return true; }, sel);
    if (!ok) return false;
    await page.send('Input.insertText', { text: control.value });
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.dispatchEvent(new Event('change', { bubbles: true })); }, sel);
    return true;
  }
  const base = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) ';
  const sel = control.act === '__back' ? base + '.o55-back' : base + `[data-o55-do="${control.act}"]` + (control.arg != null ? `[data-arg="${String(control.arg).replace(/"/g, '\\"')}"]` : ':not([data-arg])');
  const c = await page.evaluate((s) => { const el = [...document.querySelectorAll(s)].find((e) => e.getClientRects().length); if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  if (!c) return false;
  await page.mouse(c.x, c.y);
  return true;
}

async function worker(id) {
  const { page, close } = await launch({ width: W, height: H });
  try {
    while (true) {
      const job = queue.shift();
      if (!job) { if (started === done) break; await sleep(300); continue; }
      if (states.size >= MAX) { if (!queue.length && started === done) break; continue; }
      started++;
      try {
        const from = job.from ? states.get(job.from) : null;
        await load(page, from ? from.sess : null);
        let snap;
        if (!from) snap = await page.evaluate(CAPTURE);
        else {
          const before = await page.evaluate(CAPTURE);
          const errs0 = page.errors.length;
          const ok = await act(page, job.control);
          if (!ok) { transitions.push({ from: job.from, control: job.control, to: null, missing: true }); continue; }
          await sleep(350); await settle(page);
          snap = await page.evaluate(CAPTURE);
          const changed = snap.closed || before.screen !== snap.screen || before.sess !== snap.sess || before.html !== snap.html;
          const key = keyOf(snap);
          transitions.push({ from: job.from, control: job.control, to: key, screen: snap.closed ? (snap.tour ? '(tour)' : '(closed)') : snap.screen, changed, errors: page.errors.slice(errs0) });
          if (states.has(key) || snap.closed) { if (snap.closed && !states.has(key)) states.set(key, { key, screen: key, closed: true, depth: from.depth + 1, controls: [], fields: [] }); continue; }
          snap.depth = from.depth + 1;
        }
        const key = keyOf(snap);
        const nOn = perScreen.get(snap.screen) || 0;
        if (!states.has(key) && states.size < MAX && nOn < PER_SCREEN) {
          const st = Object.assign({ key, depth: snap.depth || 0 }, snap);
          states.set(key, st); perScreen.set(snap.screen, nOn + 1); enqueueControls(st);
        }
      } catch (e) { transitions.push({ from: job.from, control: job.control, to: null, error: String(e.message || e).slice(0, 200) }); }
      finally { done++; if (done % 50 === 0) console.log(`[${Math.round((Date.now() - t0) / 1000)}s] states ${states.size} transitions ${transitions.length} queue ${queue.length}`); }
    }
  } finally { await close(); }
}

const ANALYZE = opt('analyze', '');
if (ANALYZE) {
  /* --analyze graph.json: rebuild the report from an earlier crawl without crawling again */
  const g = JSON.parse(readFileSync(ANALYZE, 'utf8'));
  for (const st of g.states) states.set(st.key, st);
  transitions.push(...g.transitions);
} else {
  queue.push({ from: null, control: null });
  await Promise.all(Array.from({ length: WORKERS }, (_, i) => worker(i)));
}

/* ---------------------------------------------------------------- analysis */
const defined = await (async () => { const { page, close } = await launch({ width: 800, height: 600 }); try { await page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1200); return await page.evaluate(() => Object.keys(window.O55.screens.defs)); } finally { await close(); } })();
const reached = new Set([...states.values()].filter((s) => !s.closed).map((s) => s.screen));
const outs = new Map(); for (const t of transitions) { if (!outs.has(t.from)) outs.set(t.from, []); outs.get(t.from).push(t); }
const deadEnds = [], noops = [], noReason = [], raw = [], spills = [];
for (const st of states.values()) {
  if (st.closed) continue;
  const primary = st.controls.find((c) => c.primary);
  const ts = outs.get(st.key) || [];
  const leaves = ts.some((t) => t.screen && t.screen !== st.screen);
  /* only a state whose every enabled control was tried can be called a dead end */
  const tried = ts.filter((t) => t.control && t.control.kind === 'click').length, enabled = st.controls.filter((c) => !c.disabled && c.act !== 'close').length;
  if (tried >= enabled && primary && primary.disabled && !leaves) deadEnds.push({ state: st.key, screen: st.screen, primary: primary.label, reason: primary.reason });
  if (tried >= enabled && !primary && !leaves && ts.length) deadEnds.push({ state: st.key, screen: st.screen, primary: null });
  for (const c of st.controls) if (c.disabled && !c.reason) noReason.push({ screen: st.screen, control: c.act + (c.arg ? ' ' + c.arg : ''), label: c.label });
  if (st.rawKeys && st.rawKeys.length) raw.push({ screen: st.screen, keys: st.rawKeys });
  if (st.spill && st.spill.length) spills.push({ screen: st.screen, elements: st.spill });
}
for (const t of transitions) if (t.control && t.control.kind === 'click' && t.to && !t.changed) noops.push({ screen: (states.get(t.from) || {}).screen, control: t.control.act + (t.control.arg ? ' ' + t.control.arg : ''), label: t.control.label });
const uniq = (arr, f) => { const seen = new Set(); return arr.filter((x) => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
const report = {
  scenario: SCENARIO, seconds: Math.round((Date.now() - t0) / 1000), states: states.size, transitions: transitions.length, capped: states.size >= MAX,
  defined: defined.length, reached: [...reached].sort(), neverReached: defined.filter((s) => !reached.has(s)).sort(),
  deadEnds: uniq(deadEnds, (d) => d.screen + '|' + d.reason), noops: uniq(noops, (n) => n.screen + '|' + n.control), noReason: uniq(noReason, (n) => n.screen + '|' + n.control),
  rawKeys: uniq(raw, (r) => r.screen + '|' + r.keys.join()), spills: uniq(spills, (s) => s.screen + '|' + s.elements.join()),
  errors: uniq(transitions.flatMap((t) => (t.errors || []).map((e) => ({ screen: (states.get(t.from) || {}).screen, error: String(e).slice(0, 200) }))), (e) => e.error),
  failures: transitions.filter((t) => t.error).slice(0, 20)
};
if (!ANALYZE) writeFileSync(join(out, 'graph.json'), JSON.stringify({ states: [...states.values()].map((s) => ({ key: s.key, screen: s.screen, depth: s.depth, closed: !!s.closed, rail: s.rail, sess: s.sess, controls: s.controls, fields: s.fields, rawKeys: s.rawKeys, spill: s.spill })), transitions }, null, 0));
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ scenario: SCENARIO, seconds: report.seconds, states: report.states, transitions: report.transitions, capped: report.capped, reached: report.reached.length + '/' + report.defined, neverReached: report.neverReached, deadEnds: report.deadEnds.length, noops: report.noops.length, noReason: report.noReason.length, rawKeys: report.rawKeys.length, spills: report.spills.length, errors: report.errors.length, failures: report.failures.length }, null, 1));
