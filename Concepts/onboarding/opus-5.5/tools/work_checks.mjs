/* work_checks.mjs: the background-activity concept's scripted checks (22, then the reviews' and the completeness audit's), rewritten for the native surfaces (W6; the
 * concept was Concepts/background-activity/opus-5.5, its checks lived in its lab). OWNER: pm7-activity, PM7 build
 * 2026-10-29. Drives an existing GPU browser (an agent-browser or gpu-browser session; this tool never launches one):
 *
 *   node tools/work_checks.mjs <page path or url> --cdp <endpoint> [--look basic-dark] [--width 1920] [--out dir] [--sandbox]
 *
 * --sandbox runs every check inside a sandboxed iframe the way T3's file preview shows the page (scripts allowed, an
 * opaque origin, no storage; QA round 2): the tool writes a wrapper page into <out> and drives the frame.
 * --only 23,47 runs just those checks (each sets up its own state), for a re-check.
 *
 * It reads the page only through its owners: PM_WORK (the work projection and its fixture scenarios), PM7_WORK_UI (the
 * status bar items and the panel, src/js/48-work.js), PM56_DEMO (the hosted chat's own demo API) and real clicks.
 * Exits 1 on any failed check, 2 on bad usage. Results go to <out>/work-checks.json. */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(join(process.env.PM_PLAYWRIGHT_DIR || '/home/sittingmongoose/pmt-dev/pw/', 'noop.js'));
const { chromium } = require('playwright-core');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const page0 = argv[0] && !argv[0].startsWith('--') ? argv[0] : null;
const sandbox = argv.includes('--sandbox');
const only = opt('only') ? new Set(opt('only').split(',').map(Number)) : null;
const cdp = opt('cdp');
if (!page0 || !cdp) { console.error('usage: work_checks.mjs <page path or url> --cdp <endpoint> [--look basic-dark] [--width 1920] [--out dir]'); process.exit(2); }
const url = /^https?:|^file:/.test(page0) ? page0 : pathToFileURL(resolve(page0)).href;
const [fam, mode] = opt('look', 'basic-dark').split('-');
const W = Number(opt('width', '1920')), H = 1000;
const out = resolve(opt('out', '/tmp/o55/work-checks')); mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.connectOverCDP(cdp, { noDefaults: true });
/* a tab in the browser's own context (the session's profile is fresh), not a context of its own: there a second page is
   its own window, so no check could hide the page the way a person hides it by opening another tab (check 50) */
const ctx = browser.contexts()[0] || await browser.newContext();
const page = await ctx.newPage();
await page.setViewportSize({ width: W, height: H });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e && e.message || e).slice(0, 300)));
const results = [];
async function check(n, name, fn) {
  if (only && !only.has(n)) return;
  let ok = false, note = '';
  try { const r = await fn(); ok = r === true || (r && r.ok === true); note = r && r.note ? r.note : (typeof r === 'string' ? r : ''); }
  catch (e) { note = 'threw: ' + String(e.message || e).slice(0, 200); }
  /* the look each check ended in: a check that leaves the requested look would run every later one in another */
  const look = await F.evaluate(() => document.documentElement.getAttribute('data-theme') + (document.documentElement.getAttribute('data-o55-nier') === 'on' ? '+nier' : '')).catch(() => '?');
  results.push({ n, name, ok, note, look });
  console.log((ok ? 'PASS ' : 'FAIL ') + String(n).padStart(2) + ' [' + look + '] ' + name + (note ? ' — ' + note : ''));
}
let F = null;   // the frame the page runs in: the page itself, or the sandboxed iframe (--sandbox)
const ev = (fn, arg) => F.evaluate(fn, arg);
/* the look this run asks for, saved the way the look menu saves it; a check that switches Project (each Project carries
   its own settings) applies it again before it ends */
const applyLook = () => ev(([f, m]) => {
  const fam = f === 'nier' ? 'basic' : f, tome = window.PM7_SETTINGS_TOME;
  if (window.PM_NIER && f !== 'nier') window.PM_NIER.set(false, { sound: false });
  window.PM_THEME.setFamily(fam, { persist: false }); window.PM_THEME.setMode(m, { persist: false });
  if (tome && tome.setChromeThemeFamily) { tome.setChromeThemeFamily(fam); tome.setChromeThemeMode(m); }
  if (window.PM_NIER && f === 'nier') window.PM_NIER.set(true, { sound: false });
}, [fam, mode]);
const scenario = async (name) => { await ev((n) => window.PM_WORK.scenario(n), name); await sleep(500); };
const clickAt = async (sel) => { const r = await ev((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) throw new Error('nothing to click: ' + sel); await page.mouse.click(r.x, r.y); return r; };
const hoverAt = async (sel) => { const r = await ev((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) throw new Error('nothing to hover: ' + sel); await page.mouse.move(r.x, r.y + 60); await sleep(60); await page.mouse.move(r.x, r.y, { steps: 5 }); return r; };
const barText = (k) => ev((k) => { const e = document.querySelector('[data-work-group] [data-status-action="' + k + '"]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, k);
const closeActivity = () => ev(() => { const x = document.querySelector('#pmRoot .activity-panel [data-action="close-activity"]'); if (x) x.click(); });

try {
  const target = url + (url.includes('?') ? '&' : '?') + 'o55=off';
  if (sandbox) {
    const wrap = join(out, 'sandbox.html');
    writeFileSync(wrap, '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%;display:block}</style></head>' +
      '<body><iframe sandbox="allow-scripts allow-popups allow-forms allow-modals allow-downloads" src="' + target + '"></iframe></body></html>');
    await page.goto(pathToFileURL(wrap).href, { waitUntil: 'load', timeout: 120000 });
    for (let i = 0; i < 600 && !F; i++) { F = page.frames().find((f) => f !== page.mainFrame() && f.url().startsWith(url)) || null; if (!F) await sleep(100); }
    if (!F) throw new Error('the sandboxed frame did not load');
  } else {
    await page.goto(target, { waitUntil: 'load', timeout: 120000 });
    F = page.mainFrame();
  }
  await F.waitForFunction(() => !!(window.PM_WORK && window.PM7_WORK_UI && window.PM56_DEMO && window.PM_THEME), null, { timeout: 120000 });
  /* the frame's own uncaught errors (a sandboxed frame's are not the page's) */
  await ev(() => { window.__wkErrors = []; addEventListener('error', (e) => window.__wkErrors.push(String(e.message || e.error).slice(0, 300))); addEventListener('unhandledrejection', (e) => window.__wkErrors.push('rejection: ' + String(e.reason).slice(0, 280))); });
  if (sandbox) console.log('sandboxed frame: origin ' + await ev(() => String(window.origin)) + ', storage ' + await ev(() => { try { localStorage.getItem('x'); return 'open'; } catch (e) { return 'blocked'; } }));
  /* the look is saved the way the look menu and Demo Studio save it (PM7_SETTINGS_TOME), not only previewed: Settings
     re-applies the saved look when it opens (check 25 opens it), and a preview-only look ran every later check in Basic */
  await applyLook();
  await sleep(1500);
  await ev(() => window.PM56_DEMO.selectThread('query'));
  await scenario('busy');

  /* ---------------------------------------------------------------- the chat's Processes domain (D1-D4) */
  await check(1, 'Processes is the Activity bar\'s domain after Subagents, with its running count, while processes run', async () => {
    const r = await ev(() => { const ids = [...document.querySelectorAll('#pmRoot .activity-item[data-action="open-activity"]')].map((e) => e.getAttribute('data-domain')); const p = document.querySelector('#pmRoot .activity-item[data-domain="processes"]'); return { ids, label: p && p.querySelector('.label') ? p.querySelector('.label').textContent : null, count: p && p.querySelector('.count') ? p.querySelector('.count').textContent : null, live: window.PM_WORK.thread('query').counts }; });
    const i = r.ids.indexOf('processes');
    return { ok: i > 0 && r.ids[i - 1] === 'subagents' && r.label === 'Processes' && r.count === '5', note: r.ids.join(',') + ' count ' + r.count };
  });
  await check(2, 'Quiet: nothing runs, so the chat\'s icon is gone and the bar reads No agents and No processes (D4)', async () => {
    /* the chat repaints on the change's next frame; under a loaded VM that frame came 140-250 ms later, so wait for it */
    const gone = await ev(() => new Promise((res) => { const t0 = performance.now(); window.PM_WORK.scenario('quiet');
      const look = () => { const dt = performance.now() - t0; if (!document.querySelector('#pmRoot .activity-item[data-domain="processes"]')) res(Math.round(dt)); else if (dt > 3000) res(null); else setTimeout(look, 10); }; look(); }));
    await sleep(200);
    const r = await ev(() => { const st = window.PM56_DEMO.getState(); return { icon: !!document.querySelector('#pmRoot .activity-item[data-domain="processes"]'), a: document.querySelector('[data-status-action="agents"]').textContent.trim(), p: document.querySelector('[data-status-action="processes"]').textContent.trim(), open: st.activity.open, dom: st.activity.domain, hover: st.hover }; });
    return { ok: !r.icon && /No agents/.test(r.a) && /No processes/.test(r.p), note: JSON.stringify(r) + ' icon gone after ' + gone + ' ms' };
  });
  await check(3, 'The icon stays while its view is open after the last process ends, and goes when it closes (D4)', async () => {
    await scenario('busy'); await sleep(300);
    await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(500);
    await scenario('quiet'); await sleep(400);
    const open = await ev(() => !!document.querySelector('#pmRoot .activity-item[data-domain="processes"]'));
    await closeActivity(); await sleep(500);
    const after = await ev(() => !!document.querySelector('#pmRoot .activity-item[data-domain="processes"]'));
    await scenario('busy');
    return { ok: open && !after, note: 'while open ' + open + ', after close ' + after };
  });
  await check(4, 'Its hover card lists what needs input first and says so in its foot', async () => {
    await hoverAt('#pmRoot .activity-item[data-domain="processes"]'); await sleep(1100);
    const r = await ev(() => { const c = document.querySelector('#pmOverlayRoot .ab-card[data-domain="processes"]'); return c ? { first: (c.querySelector('.ab-row b') || {}).textContent, foot: (c.querySelector('.ab-proc-foot') || {}).textContent } : null; });
    return { ok: !!r && r.first === 'Migration dry run' && /1 needs input/.test(r.foot || ''), note: JSON.stringify(r) };
  });
  await check(5, 'A card row opens Activity Detail at Processes, full size, with that process open', async () => {
    await clickAt('#pmOverlayRoot .ab-card[data-domain="processes"] .ab-row'); await sleep(800);
    const r = await ev(() => { const p = document.querySelector('#pmRoot .activity-panel'); return p ? { layout: p.getAttribute('data-layout'), domain: p.getAttribute('data-domain'), open: (p.querySelector('.pmap-proc.is-open [data-work-detail]') || {}).getAttribute ? p.querySelector('.pmap-proc.is-open [data-work-detail]').getAttribute('data-work-detail') : null } : null; });
    return { ok: !!r && (r.layout === 'dock' || r.layout === 'cover') && r.domain === 'processes' && r.open === 'p-migrate', note: JSON.stringify(r) };
  });
  await check(6, 'The view is By state: Needs input, Running, Scheduled, Finished this session (D3)', async () => {
    const secs = await ev(() => [...document.querySelectorAll('#pmRoot .pmap-proc-sec .pmap-records-head strong')].map((e) => e.textContent));
    return { ok: secs.join('|') === 'Needs input|Running|Scheduled|Finished this session', note: secs.join(' | ') };
  });
  await check(7, 'A yes/no prompt answers inline, the safe answer first, and the count of what needs input drops (D13)', async () => {
    const q = await ev(() => [...document.querySelectorAll('#pmRoot .pmap-proc.is-open [data-work-act="answer"]')].map((b) => b.textContent));
    await clickAt('#pmRoot .pmap-proc.is-open [data-work-act="answer"]'); await sleep(600);
    const r = await ev(() => ({ word: window.PM_WORK.word(window.PM_WORK.item('p-migrate')), needs: window.PM_WORK.counts().needsInput }));
    return { ok: q.join(',') === 'No,Yes' && r.word === 'Running' && r.needs === 0, note: q.join(',') + ' → ' + JSON.stringify(r) };
  });
  await check(8, 'The foot says composer Stop ends the reply, not these processes (D8)', async () => {
    const t = await ev(() => (document.querySelector('#pmRoot .pmap-proc-foot') || {}).textContent || '');
    return { ok: /Stop in the composer ends the reply, not these processes/.test(t), note: t.slice(0, 120) };
  });
  await check(9, 'Stop shows Stopping on the pending mark, then Stopped, and stops what it started (D8, G5)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(500);
    await ev(() => window.PM_WORK.stop({ scope: 'item', id: 'p-dev' })); await sleep(150);
    const a = await ev(() => { const it = window.PM_WORK.item('p-dev'); return { word: window.PM_WORK.word(it), key: window.PM_WORK.key(it) }; });
    await sleep(4200);
    const b = await ev(() => { const it = window.PM_WORK.item('p-dev'); return { word: window.PM_WORK.word(it), state: it.state }; });
    return { ok: a.word === 'Stopping' && a.key === 'pending' && b.word === 'Stopped' && b.state === 'skipped', note: JSON.stringify([a, b]) };
  });
  await check(10, 'Stop all in this thread lists its processes and scheduled runs, no agents, and Cancel stops nothing (D8)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(500);
    await clickAt('#pmRoot [data-action="proc-stop-all"]'); await sleep(500);
    const r = await ev(() => { const d = document.querySelector('.wk-dialog'); return d ? { kinds: [...d.querySelectorAll('input[type=checkbox]')].map((b) => b.getAttribute('data-kind')), title: d.querySelector('h2').textContent } : null; });
    await clickAt('.wk-dialog [data-x="cancel"]'); await sleep(300);
    const live = await ev(() => window.PM_WORK.items({ thread: 'query', kind: 'process' }).filter((x) => window.PM_WORK.isLive(x)).length);
    return { ok: !!r && r.kinds.length === 6 && !r.kinds.includes('agent') && live === 5, note: JSON.stringify(r) + ', still running ' + live };
  });
  await check(11, 'When it ends: Notify me is kept, and a finishing item set so sends one notice (D9)', async () => {
    await scenario('busy');
    await ev(() => window.PM_WORK.setCompletionDelivery('p-bench', 'user'));
    /* a lasting notice shows on the stage first and lands in the inbox after: count it in either place, by its words */
    const seenIt = () => ev(() => { const t = 'Benchmark: tenant read path finished'; const inbox = (window.PM_TITLEBAR_NOTIFY && window.PM_TITLEBAR_NOTIFY.list ? window.PM_TITLEBAR_NOTIFY.list() : []).filter((x) => x.title === t).length; const stage = [...document.querySelectorAll('#rsStage [data-pmn-id]')].filter((c) => c.textContent.includes(t)).length; return inbox + stage; });
    const before = await seenIt();
    await ev(() => { const it = window.PM_WORK.item('p-bench'); it.startedAt = Date.now() - 200000; }); await sleep(2500);
    const after = Object.assign({ n: await seenIt() }, await ev(() => ({ state: window.PM_WORK.item('p-bench').state, delivery: window.PM_WORK.item('p-bench').delivery })));
    return { ok: after.delivery === 'user' && after.state === 'complete' && before === 0 && after.n >= 1, note: 'notices ' + before + ' → ' + after.n + ', ' + after.state };
  });
  await check(12, 'Clear hides finished rows from the thread\'s view only; the platform panel still lists them (G6)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(500);
    await clickAt('#pmRoot [data-action="proc-clear"]'); await sleep(500);
    const r = await ev(() => ({ thread: !![...document.querySelectorAll('#pmRoot .pmap-proc-sec .pmap-records-head strong')].find((e) => e.textContent === 'Finished this session'), platform: window.PM_WORK.items({ view: 'platform' }).filter((x) => x.id === 'p-lint').length }));
    await closeActivity();
    return { ok: !r.thread && r.platform === 1, note: JSON.stringify(r) };
  });

  /* ------------------------------------------------------------------------------------- the status bar (D5) */
  await check(13, 'Two items in their own group between the project folder and source control; Numbers: 16 · 2 and 10 · 1', async () => {
    await scenario('busy'); await ev(() => document.documentElement.setAttribute('data-pm-status-words', 'off')); await sleep(300);
    const r = await ev(() => { const g = document.querySelector('[data-work-group]'); const prev = g.previousElementSibling, next = g.nextElementSibling; return { prev: prev && prev.textContent.includes('Puppet-Master'), next: next && !!next.querySelector('[data-status-action="source"]'), hidden: g.hidden }; });
    const a = await barText('agents'), p = await barText('processes');
    return { ok: r.prev && r.next && !r.hidden && a === '222' && p === '101', note: JSON.stringify(r) + ' ' + a + ' / ' + p };
  });
  await check(14, 'Words: 22 agents · 2 questions and 10 processes · 1 needs input (general.interaction.status-bar-words); Numbers where they do not fit, never overlapping', async () => {
    await ev(() => document.documentElement.setAttribute('data-pm-status-words', 'on')); await sleep(300);
    const a = await barText('agents'), p = await barText('processes');
    const fit = await ev(() => {
      const g = document.querySelector('[data-work-group]'), bar = g.parentElement, next = g.nextElementSibling;
      const last = g.querySelector('[data-status-action="processes"]').getBoundingClientRect().right, start = next.getBoundingClientRect().left;
      return { words: g.getAttribute('data-work-words'), overlap: Math.round(last - start), squeezed: [...bar.querySelectorAll(':scope > *, :scope > * > *')].filter((x) => x.offsetParent !== null && x.scrollWidth > x.clientWidth + 1).length };
    });
    await ev(() => document.documentElement.setAttribute('data-pm-status-words', 'off'));
    const said = fit.words === 'on' ? a === '22 agents2 questions' && p === '10 processes1 needs input' : a === '222' && p === '101';
    return { ok: said && fit.overlap <= 0 && (fit.words === 'off' || fit.squeezed === 0), note: a + ' / ' + p + ' ' + JSON.stringify(fit) };
  });
  await check(15, 'Hover tags say where the agents run and how many wait on you', async () => {
    const t = await ev(() => document.querySelector('[data-status-action="agents"]').getAttribute('data-pm-hover-detail'));
    return { ok: /22 agents running across Puppet Master \(Assistant 12, Orchestrator 4, Planning Wizard 1, PRD Builder 2, Scout 3\)\. 2 questions for you\./.test(t), note: t };
  });
  await check(16, 'The two glyphs beat while work runs; Reduced Motion shows their lit rest pose', async () => {
    const live = await ev(() => { const s = document.querySelector('[data-status-action="agents"] .pmg-beat > svg'); return s ? getComputedStyle(s).animationName : null; });
    await ev(() => document.documentElement.setAttribute('data-motion', 'reduced')); await sleep(200);
    const still = await ev(() => { const s = document.querySelector('[data-status-action="agents"] .pmg-beat > svg'); return s ? getComputedStyle(s).animationName : null; });
    await ev(() => document.documentElement.removeAttribute('data-motion'));
    return { ok: !!live && live !== 'none' && still === 'none', note: live + ' / reduced ' + still };
  });
  await check(17, 'A stale feed adds the stale item and strip; after a restart the panel names what was lost', async () => {
    await scenario('stale');
    const s = await ev(() => { const e = document.querySelector('[data-work-stale]'); return e && !e.hidden ? e.getAttribute('data-pm-hover-label') : null; });
    await ev(() => window.PM7_WORK_UI.open('agents')); await sleep(300);
    const strip1 = await ev(() => !!document.querySelector('#pm7-work .wk-strip'));
    await scenario('restart'); await sleep(300);
    const strip2 = await ev(() => (document.querySelector('#pm7-work .wk-strip') || {}).textContent || '');
    await ev(() => window.PM7_WORK_UI.close()); await scenario('busy');
    return { ok: s === 'Out of date' && strip1 && /2 processes ended while it was closed/.test(strip2), note: s + ' | ' + strip2.slice(0, 80) };
  });

  /* ------------------------------------------------------------------------------- the panel (D6-D12, G4) */
  await check(18, 'An item opens the panel at its tab in the one overlay root; again closes it; Escape closes and returns focus', async () => {
    await clickAt('[data-status-action="processes"]'); await sleep(400);
    const a = await ev(() => { const p = document.getElementById('pm7-work'); return { open: !p.hidden, tab: p.getAttribute('data-tab'), root: p.parentElement.id }; });
    await clickAt('[data-status-action="processes"]'); await sleep(300);
    const shut = await ev(() => document.getElementById('pm7-work').hidden);
    await clickAt('[data-status-action="agents"]'); await sleep(400);
    await page.keyboard.press('Escape'); await sleep(300);
    const b = await ev(() => ({ hidden: document.getElementById('pm7-work').hidden, focus: document.activeElement && document.activeElement.getAttribute('data-status-action') }));
    return { ok: a.open && a.tab === 'processes' && a.root === 'pmw-overlay' && shut && b.hidden && b.focus === 'agents', note: JSON.stringify([a, shut, b]) };
  });
  await check(19, 'Agents: Questions first, each asking agent once; surfaces grouped; a process link jumps to its group', async () => {
    await ev(() => window.PM7_WORK_UI.open('agents')); await sleep(300);
    const r = await ev(() => { const p = document.getElementById('pm7-work'); const first = p.querySelector('.wk-group'); return { first: first && first.getAttribute('data-sec'), qs: [...p.querySelectorAll('[data-sec="questions"] .wk-row')].length, dupes: [...p.querySelectorAll('.wk-row')].filter((r) => r.getAttribute('data-work-row') === 'a-onb').length, surfaces: [...p.querySelectorAll('.wk-group[data-surface]')].map((g) => g.getAttribute('data-surface')) }; });
    await clickAt('#pm7-work [data-work-procs]'); await sleep(400);
    const j = await ev(() => ({ tab: document.getElementById('pm7-work').getAttribute('data-tab'), jump: !!document.querySelector('#pm7-work [data-jump="1"]') }));
    return { ok: r.first === 'questions' && r.qs === 2 && r.dupes === 1 && r.surfaces.join(',') === 'assistant,orchestrator,wizard,prd,scout' && j.tab === 'processes' && j.jump, note: JSON.stringify([r, j]) };
  });
  await check(20, 'Processes: Needs input first, each under its agent; System services read only, never stoppable (D11)', async () => {
    await ev(() => window.PM7_WORK_UI.open('processes')); await sleep(300);
    const r = await ev(() => { const p = document.getElementById('pm7-work'); return { first: p.querySelector('.wk-group').getAttribute('data-sec'), groups: [...p.querySelectorAll('[data-owner-group]')].length, svc: !!p.querySelector('[data-surface="system"]') }; });
    await clickAt('#pm7-work [data-work-g="system"]'); await sleep(300);
    await clickAt('#pm7-work [data-surface="system"] .wk-row-btn'); await sleep(300);
    const stop = await ev(() => !!document.querySelector('#pm7-work [data-surface="system"] [data-work-act="stop"]'));
    return { ok: r.first === 'input' && r.groups >= 4 && r.svc && !stop, note: JSON.stringify(r) + ' stop on a service: ' + stop };
  });
  await check(21, 'Resources: every server and environment, sampled only while the tab is open (G4, D12); CPU sorts', async () => {
    await scenario('servers');
    await ev(() => window.PM7_WORK_UI.open('resources')); await sleep(2400);
    const r = await ev(() => ({ servers: document.querySelectorAll('#pm7-work .wk-server').length, envs: document.querySelectorAll('#pm7-work .wk-env').length, sampling: !!window.PM7_WORK_UI.ui.sampleStop, snap: !!window.PM7_WORK_UI.ui.snap }));
    const s1 = await ev(() => document.querySelector('#pm7-work [data-work-sort="cpu"]').getAttribute('aria-sort'));
    await clickAt('#pm7-work [data-work-sort="cpu"]'); await sleep(200);
    const s2 = await ev(() => document.querySelector('#pm7-work [data-work-sort="cpu"]').getAttribute('aria-sort'));
    await ev(() => window.PM7_WORK_UI.open('agents')); await sleep(200);
    const after = await ev(() => !!window.PM7_WORK_UI.ui.sampleStop);
    await ev(() => window.PM7_WORK_UI.close()); await scenario('busy');
    return { ok: r.servers === 4 && r.envs === 7 && r.sampling && r.snap && s1 === 'descending' && s2 === 'ascending' && !after, note: JSON.stringify(r) + ' sort ' + s1 + '→' + s2 + ' sampling after leaving ' + after };
  });
  await check(22, 'Pop out floats and moves; Stop all chooses processes or agents too; quitting keeps work running by default (D6, D8, D10)', async () => {
    await ev(() => window.PM7_WORK_UI.open('agents')); await sleep(300);
    await clickAt('#pm7-work [data-work-p="float"]'); await sleep(300);
    const f0 = await ev(() => { const p = document.getElementById('pm7-work'); return { floating: p.classList.contains('is-floating'), x: p.offsetLeft }; });
    const h = await ev(() => { const r = document.querySelector('#pm7-work .wk-head strong').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
    await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x + 120, h.y + 40, { steps: 6 }); await page.mouse.up(); await sleep(200);
    const f1 = await ev(() => document.getElementById('pm7-work').offsetLeft);
    /* the waits outlast the hover tags' batched scan, whose disabled bridge once re-enabled boxes the choice had turned off */
    await clickAt('#pm7-work [data-work-p="stopall"]'); await sleep(1500);
    const sa = await ev(() => { const d = document.querySelector('.wk-dialog'); const before = d.querySelectorAll('input:not(:disabled)').length; return { before, agentsOn: d.querySelectorAll('input[data-kind="agent"]:not(:disabled), [data-pm-hover-was-disabled]').length, choices: [...d.querySelectorAll('[data-choice]')].map((b) => b.textContent) }; });
    await clickAt('.wk-dialog [data-choice="all"]'); await sleep(150);
    const sa2 = await ev(() => document.querySelectorAll('.wk-dialog input:not(:disabled)').length);
    await clickAt('.wk-dialog [data-x="cancel"]'); await sleep(200);
    await clickAt('#pm7-work [data-work-p="float"]'); await ev(() => window.PM7_WORK_UI.close());
    await ev(() => window.PM7_WORK_UI.quit()); await sleep(1500);
    const q = await ev(() => { const all = document.querySelectorAll('.wk-dialog'), d = all[all.length - 1]; return { dialogs: all.length, go: d.querySelector('[data-x="go"]').textContent, enabled: d.querySelectorAll('input:not(:disabled), [data-pm-hover-was-disabled]').length, which: [...d.querySelectorAll('input:not(:disabled)')].map((i) => i.getAttribute('data-id') + ':' + i.getAttribute('data-kind')), checked: d.querySelector('[data-choice][aria-checked="true"]').getAttribute('data-choice') }; });
    await clickAt('.wk-dialog [data-choice="stop_selected"]'); await sleep(150);
    const q2 = await ev(() => document.querySelector('.wk-dialog [data-x="go"]').textContent);
    await clickAt('.wk-dialog [data-x="cancel"]');
    return { ok: f0.floating && f1 > f0.x + 60 && sa.choices.length === 2 && sa.agentsOn === 0 && sa2 > sa.before && q.checked === 'keep_running' && q.go === 'Quit' && q.enabled === 0 && /^Quit and stop \d+$/.test(q2),
      note: JSON.stringify({ moved: f1 - f0.x, stopList: [sa.before, sa2], quit: q, quitStop: q2 }) };
  });

  /* ------------------------------------------------- Astra's M2 review (A5-A13) and Jared's G1 B Pin, as checks */
  const openP = async (tab) => { await ev((t) => window.PM7_WORK_UI.open(t), tab); await sleep(450); };
  const expandP = async (id) => { await ev((id) => { const x = document.querySelector('#pm7-work [data-work-x="' + id + '"]'); x.scrollIntoView({ block: 'center' }); if (x.getAttribute('aria-expanded') !== 'true') x.click(); }, id); await sleep(350); };
  const layoutNow = () => ev(() => { const l = window.PMW.state.layout, f = l.view && l.view.focus, p = window.PMW.model.panel(l, f); return { page: window.PM_PAGES.current, active: p ? p.active : null, terminals: Object.keys(l.tabs).filter((t) => l.tabs[t].kind === 'terminal').length, browsers: Object.keys(l.tabs).filter((t) => l.tabs[t].kind === 'browser').map((t) => l.tabs[t].state && l.tabs[t].state.url) }; });
  await check(23, 'Answer in Terminal opens that process\'s terminal with the focus in it; again reveals the same tab; a port opens its Browser tab (A5)', async () => {
    await scenario('busy'); await openP('processes'); await expandP('p-migrate');
    const t0 = await layoutNow();
    await ev(() => document.querySelector('#pm7-work [data-work-detail="p-migrate"] [data-work-act="terminal"]').click()); await sleep(1000);
    const t1 = await layoutNow(), f1 = await ev(() => !!(document.activeElement && document.activeElement.closest('.pmt-host, [class*="pmt"]')) || /pmt/.test(String(document.activeElement && document.activeElement.className)));
    await openP('processes'); await expandP('p-migrate');
    await ev(() => document.querySelector('#pm7-work [data-work-detail="p-migrate"] [data-work-act="terminal"]').click()); await sleep(900);
    const t2 = await layoutNow();
    await openP('processes'); await expandP('p-dev');
    await ev(() => document.querySelector('#pm7-work [data-work-detail="p-dev"] [data-work-act="port"]').click()); await sleep(900);
    const t3 = await layoutNow();
    return { ok: t1.page === 'dashboard' && /^terminal:/.test(t1.active || '') && t1.terminals === t0.terminals + 1 && f1 && t2.terminals === t1.terminals && t2.active === t1.active && t3.browsers.includes('http://localhost:5173'),
      note: JSON.stringify({ t0: t0.terminals, t1: [t1.active, t1.terminals, f1], again: [t2.active, t2.terminals], browsers: t3.browsers }) };
  });
  await check(24, 'A process\'s owner link opens that subagent: the panel\'s Agents tab at its row, the chat\'s Subagents with it selected (A5)', async () => {
    await openP('processes'); await expandP('p-migrate');
    await ev(() => document.querySelector('#pm7-work [data-work-detail="p-migrate"] [data-work-act="owner"]').click()); await sleep(700);
    const p = await ev(() => { const r = document.querySelector('#pm7-work [data-work-x="agent-rollback"]'); return { tab: window.PM7_WORK_UI.tab(), row: !!r, open: r && r.getAttribute('aria-expanded'), focused: document.activeElement === r }; });
    await ev(() => window.PM7_WORK_UI.close()); await sleep(250);
    await ev(() => window.PM56_DEMO.openActivity('processes', 'p-migrate')); await sleep(700);
    await ev(() => document.querySelector('#pmRoot [data-work-detail="p-migrate"] [data-work-act="owner"]').click()); await sleep(700);
    const c = await ev(() => { const a = window.PM56_DEMO.getState().activity; return { domain: a.domain, selected: a.selected && a.selected.id }; });
    await closeActivity(); await sleep(300);
    return { ok: p.tab === 'agents' && p.row && p.open === 'true' && p.focused && c.domain === 'subagents' && c.selected === 'agent-rollback', note: JSON.stringify({ panel: p, chat: c }) };
  });
  await check(25, 'System status: D11\'s link and the status bar item open it with the services; Escape returns focus; a service opens its owner in Settings (A5)', async () => {
    await openP('processes');
    await ev(() => { const g = document.querySelector('#pm7-work [data-work-g="system"]'); if (g && g.getAttribute('aria-expanded') === 'false') g.click(); }); await sleep(250);
    await ev(() => document.querySelector('#pm7-work [data-work-goto="system"]').click()); await sleep(450);
    const a = await ev(() => { const s = document.getElementById('pm7-work-system'); return s && { n: s.querySelectorAll('.wk-sys-list > li').length, links: s.querySelectorAll('[data-sys-open]').length, focus: s.contains(document.activeElement), panel: window.PM7_WORK_UI.isOpen() }; });
    await page.keyboard.press('Escape'); await sleep(250);
    const b = await ev(() => ({ gone: !document.getElementById('pm7-work-system'), focus: document.activeElement && document.activeElement.getAttribute('data-status-action') }));
    await clickAt('[data-status-action="system"]'); await sleep(450);
    await ev(() => document.querySelector('#pm7-work-system [data-sys-open="web.index.enable"]').click()); await sleep(1600);
    const c = await ev(() => { const r = document.querySelector('[data-setting="web.index.enable"]'); const q = r && r.getBoundingClientRect(); return { page: window.PM_PAGES.current, row: !!(q && q.width > 0 && q.top >= 0 && q.bottom <= innerHeight) }; });
    await ev(() => window.PM_PAGES.go('dashboard')); await sleep(700);
    return { ok: !!a && a.n === 4 && a.links === 4 && a.focus && !a.panel && b.gone && b.focus === 'system' && c.page === 'settings' && c.row, note: JSON.stringify({ a, b, c }) };
  });
  await check(26, 'An open panel follows work as it ends: Done, no Stop, moved to Finished, counts down; progress moves meanwhile (A6)', async () => {
    await scenario('busy'); await openP('processes'); await expandP('p-bench');
    const p0 = await ev(() => (document.querySelector('#pm7-work [data-work-row="p-bench"] [data-work-prog]') || {}).textContent);
    await sleep(2200);
    const p1 = await ev(() => (document.querySelector('#pm7-work [data-work-row="p-bench"] [data-work-prog]') || {}).textContent);
    await ev(() => { window.PM_WORK.item('p-bench').startedAt = Date.now() - 1000 * 1000; }); await sleep(2400);
    const r = await ev(() => { const row = document.querySelector('#pm7-work [data-work-row="p-bench"]'); const sec = row && row.closest('[data-sec]'); return { word: row && row.querySelector('.wk-right b').textContent, stop: !!(row && row.querySelector('[data-work-act="stop"]')), open: row && row.querySelector('.wk-row-btn').getAttribute('aria-expanded'), sec: sec && sec.getAttribute('data-sec'), n: document.querySelector('#pm7-work [data-work-tab="processes"] .wk-n').textContent }; });
    await ev(() => window.PM7_WORK_UI.close()); await scenario('busy');
    return { ok: p0 && p1 && p0 !== p1 && r.word === 'Done' && !r.stop && r.open === 'true' && r.sec === 'finished' && r.n === '9', note: JSON.stringify({ p0, p1, r }) };
  });
  await check(27, 'A popped-out panel stays whole on screen when the window shrinks, its controls reachable (A7)', async () => {
    await openP('agents'); await ev(() => document.querySelector('#pm7-work [data-work-p="float"]').click()); await sleep(350);
    await page.setViewportSize({ width: 860, height: 500 }); await sleep(700);
    const r = await ev(() => { const p = document.getElementById('pm7-work'), bt = document.getElementById('pm7GlobalStatusBar').getBoundingClientRect().top; const inside = (el) => { const q = el.getBoundingClientRect(); return q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= bt; }; return { panel: inside(p), close: inside(p.querySelector('[data-work-p="close"]')), dock: inside(p.querySelector('[data-work-p="float"]')), tabs: [...p.querySelectorAll('[data-work-tab]')].every(inside), stopAll: inside(p.querySelector('[data-work-p="stopall"]')) }; });
    await ev(() => { document.querySelector('#pm7-work [data-work-p="float"]').click(); window.PM7_WORK_UI.close(); });
    await page.setViewportSize({ width: W, height: H }); await sleep(700);
    return { ok: r.panel && r.close && r.dock && r.tabs && r.stopAll, note: JSON.stringify(r) };
  });
  await check(28, 'Clear finished is the Processes tab\'s, says what it hid; the Agents tab offers none; an expanded run lists an asking agent once (A8, A10)', async () => {
    await ev(() => { window.__workSaid = []; const N = window.PM_TITLEBAR_NOTIFY, push = N.push.bind(N); if (!N.__wrapped) { N.push = (o) => { (window.__workSaid = window.__workSaid || []).push(o.title); return push(o); }; N.__wrapped = 1; } });
    await scenario('busy'); await openP('agents');
    const ag = await ev(() => ({ clear: !!document.querySelector('#pm7-work [data-work-p="clear"]') }));
    await ev(() => { const s = document.querySelector('#pm7-work [data-work-subs="o-run"]'); if (s && s.getAttribute('aria-expanded') !== 'true') { s.scrollIntoView({ block: 'center' }); s.click(); } }); await sleep(350);
    const omig = await ev(() => document.querySelectorAll('#pm7-work [data-work-row="o-mig"]').length);
    await openP('processes');
    await ev(() => document.querySelector('#pm7-work [data-work-p="clear"]').click()); await sleep(300);
    await ev(() => document.querySelector('#pm7-work [data-work-p="clear"]').click()); await sleep(300);
    const said = await ev(() => window.__workSaid.slice(-2));
    await ev(() => { window.PM_WORK.showFinished('platform'); window.PM7_WORK_UI.close(); }); await sleep(250);
    return { ok: !ag.clear && omig === 1 && /^Hid \d+ finished/.test(said[0] || '') && /^Nothing finished/.test(said[1] || ''), note: JSON.stringify({ agentsClear: ag.clear, omig, said }) };
  });
  await check(29, 'The Processes view stays itself when Clear empties it, and the icon leaves once its card or view closes in a quiet thread (A9, A13)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(500);
    await scenario('quiet'); await sleep(300);
    await ev(() => { const c = document.querySelector('#pmRoot .activity-panel [data-action="proc-clear"]'); if (c) c.click(); }); await sleep(700);
    const v = await ev(() => ({ domain: window.PM56_DEMO.getState().activity.domain, icon: !!document.querySelector('#pmRoot .activity-item[data-domain="processes"]') }));
    await closeActivity(); await sleep(400);
    const gone1 = await ev(() => !document.querySelector('#pmRoot .activity-item[data-domain="processes"]'));
    await scenario('busy'); await sleep(300);
    await hoverAt('#pmRoot .activity-item[data-domain="processes"]'); await sleep(1100);
    const card = await ev(() => !!document.querySelector('#pmOverlayRoot [data-overlay="hover"]'));
    await scenario('quiet'); await page.mouse.move(Math.round(W / 3), 500, { steps: 4 }); await sleep(2300);
    const gone2 = await ev(() => !document.querySelector('#pmRoot .activity-item[data-domain="processes"]') && !document.querySelector('#pmOverlayRoot [data-overlay="hover"]'));
    await scenario('busy');
    return { ok: v.domain === 'processes' && v.icon && gone1 && card && gone2, note: JSON.stringify({ v, gone1, card, gone2 }) };
  });
  await check(30, 'The Subagents category is the robot; Resources\' gauge beats while it samples and rests when it stops (A11, A12)', async () => {
    const nx = await ev(() => { const s = document.querySelector('#pmRoot .activity-item[data-domain="subagents"] svg'); return s && s.getAttribute('data-nx'); });
    await openP('resources'); await sleep(1100);
    const on = await ev(() => { const g = document.querySelector('#pm7-work [data-work-tab="resources"] .wk-g'); return g.classList.contains('pmg-beat') && g.getAttribute('data-tone') === 'working'; });
    await ev(() => document.querySelector('#pm7-work [data-work-tab="agents"]').click()); await sleep(300);
    const off = await ev(() => { const g = document.querySelector('#pm7-work [data-work-tab="resources"] .wk-g'); return !g.classList.contains('pmg-beat'); });
    await ev(() => window.PM7_WORK_UI.close());
    return { ok: nx === 'robot' && on && off, note: JSON.stringify({ nx, on, off }) };
  });
  await check(31, 'Pin (G1 B): pinned, Activity Detail stays open across a thread switch and shows the new thread; unpinned, a switch closes it', async () => {
    await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(400);
    await ev(() => window.PM56_DEMO.openActivity('goal')); await sleep(500);
    await ev(() => window.PM56_DEMO.selectThread('plain')); await sleep(600);
    const un = await ev(() => ({ open: window.PM56_DEMO.getState().activity.open, panel: !!document.querySelector('#pmRoot .activity-panel') }));
    await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(400);
    await ev(() => window.PM56_DEMO.openActivity('goal')); await sleep(400);
    await clickAt('#pmRoot .activity-panel [data-action="toggle-activity-pin"]'); await sleep(400);
    const pin = await ev(() => { const b = document.querySelector('#pmRoot .activity-panel [data-action="toggle-activity-pin"]'); return { pressed: b && b.getAttribute('aria-pressed'), ui: b && b.getAttribute('data-ui-action-id'), bind: b && b.getAttribute('data-binding-id') }; });
    await ev(() => window.PM56_DEMO.selectThread('subagents')); await sleep(600);
    const pinned = await ev(() => { const p = document.querySelector('#pmRoot .activity-panel'); return { thread: window.PM56_DEMO.getState().selectedThread, open: !!p, domain: p && p.getAttribute('data-domain'), domains: [...document.querySelectorAll('#pmRoot .activity-item[data-action="open-activity"]')].map((e) => e.getAttribute('data-domain')).join(',') }; });
    await ev(() => window.PM56_DEMO.pinActivity(false)); await closeActivity(); await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(500);
    return { ok: !un.open && !un.panel && pin.pressed === 'true' && pin.ui === 'ui.activity_detail.pin' && pin.bind === 'chat.activity.pin' && pinned.thread === 'subagents' && pinned.open && pinned.domains.split(',').includes(pinned.domain),
      note: JSON.stringify({ unpinned: un, pin, pinned }) };
  });
  /* ------------------------------------------------------------------------- Muse's lane review (m1-m3) */
  await check(32, 'Counts agree with their own lists: finished work in a thread and platform-wide, finished agents apart (m1)', async () => {
    await scenario('many'); await sleep(300);
    const r = await ev(() => { const W = window.PM_WORK; const t = W.thread('query').counts, all = W.counts(); const done = (f) => W.items(f).filter(W.isDone);
      return { thread: [t.finished, done({ thread: 'query', kind: ['process', 'scheduled'] }).length], platform: [all.finished, done({ kind: ['process', 'scheduled'] }).length], agents: [all.finishedAgents, done({ kind: 'agent' }).length] }; });
    await ev(() => window.PM56_DEMO.openActivity('processes')); await sleep(600);
    const rows = await ev(() => { const sec = [...document.querySelectorAll('#pmRoot .pmap-proc-sec')].find((x) => /Finished/.test(x.textContent.slice(0, 60))); return sec ? sec.querySelectorAll('.pmap-proc-row').length : -1; });
    await closeActivity(); await scenario('busy');
    return { ok: r.thread[0] === r.thread[1] && r.platform[0] === r.platform[1] && r.agents[0] === r.agents[1] && rows === r.thread[0], note: JSON.stringify({ ...r, threadRows: rows }) };
  });
  await check(33, 'Resources: each environment says what it lists, and the CPU column keeps its sorted order across samples (m2, m3)', async () => {
    await scenario('servers'); await page.mouse.move(5, Math.round(H / 2));
    await openP('resources'); await sleep(900);
    const heads = await ev(() => [...document.querySelectorAll('#pm7-work .wk-env')].map((e) => { const s = (e.querySelector('.wk-env-head .wk-gsum') || {}).textContent || ''; const n = (s.match(/\d+/g) || []).reduce((a, b) => a + Number(b), 0); return [n, e.querySelectorAll(':scope > .wk-tr:not(.wk-th)').length, s]; }));
    await sleep(4600);   // two samples
    const orders = await ev(() => [...document.querySelectorAll('#pm7-work .wk-env')].map((e) => [...e.querySelectorAll(':scope > .wk-tr:not(.wk-th) [data-work-cpu]')].map((c) => parseFloat(c.textContent)).filter((v) => !isNaN(v))));
    const sortDir = await ev(() => (document.querySelector('#pm7-work .wk-th [data-work-sort="cpu"]') || {}).getAttribute && document.querySelector('#pm7-work .wk-th [data-work-sort="cpu"]').getAttribute('aria-sort'));
    await ev(() => window.PM7_WORK_UI.close()); await scenario('busy');
    const sorted = orders.every((o) => o.every((v, i) => i === 0 || (sortDir === 'ascending' ? o[i - 1] <= v : o[i - 1] >= v)));
    return { ok: heads.length > 0 && heads.every((h) => h[1] === 0 || h[0] === h[1]) && (sortDir === 'ascending' || sortDir === 'descending') && sorted, note: JSON.stringify({ heads: heads.map((h) => h[2] + ' / ' + h[1] + ' rows'), cpu: sortDir, orders }) };
  });
  /* ------------------------------------------------------------- completeness audit (cycle 1, 2026-10-30) */
  await check(34, 'The rail\'s Agents panel is a filter of PM_WORK: every agent once, Needs you is the projection\'s set, times spelled the rail\'s way and steady, a change repaints (D7, DL-246)', async () => {
    await scenario('busy');
    await clickAt('.icon[data-ab-id="agents"]'); await sleep(900);
    const read = () => ev(() => { const h = document.querySelector('#panel-agents [data-work-rail]'), W = window.PM_WORK, ag = W.items({ kind: 'agent' });
      const ids = h ? [...h.querySelectorAll('.wk-row[data-work-row]')].map((r) => r.getAttribute('data-work-row')) : [];
      const needs = h ? [...h.querySelectorAll('[data-shelf="needs"] .wk-row[data-work-row]')].map((r) => r.getAttribute('data-work-row')).sort().join(',') : '';
      return { list: !!(h && h.classList.contains('wk-list')), rows: ids.length, unique: new Set(ids).size, agents: ag.length, same: ids.every((i) => ag.some((x) => x.id === i)),
        needs, want: ag.filter(W.isQuestion).map((x) => x.id).sort().join(','), status: ((document.querySelector('#panel-agents [data-work-rail-status] .sh-bfull') || {}).textContent || '').trim() }; });
    const busy = await read();
    /* every frame for 2.5 s (two ticks): no rail time ever reads in the short form ("6m 57s"), so the rail's skin never rewrites one */
    const short = await ev(() => new Promise((res) => { let bad = 0, frames = 0; const t0 = performance.now(); const f = () => { frames++;
      document.querySelectorAll('#panel-agents [data-work-time]').forEach((e) => { if (/(^|\s)\d+[smhdw](\s|$)/.test(e.textContent)) bad++; });
      if (performance.now() - t0 < 2500) requestAnimationFrame(f); else res({ bad, frames }); }; requestAnimationFrame(f); }));
    await scenario('quiet'); await sleep(300);
    const quiet = await read();
    await scenario('busy');
    const good = (r) => r.list && r.rows === r.agents && r.unique === r.rows && r.same && r.needs === r.want;
    return { ok: good(busy) && good(quiet) && busy.rows !== quiet.rows && /2 need you/.test(busy.status) && short.bad === 0 && short.frames > 60, note: JSON.stringify({ busy, quiet, short }) };
  });
  await check(35, 'Home\'s Agents board is the same filter with the panel\'s rows: every agent, the same needs-you count, a change repaints (D7, DR-078)', async () => {
    await ev(() => window.PM_HOME.open({ kind: 'dashboard', board: 'agents' })); await sleep(1200);
    const read = () => ev(() => { const L = document.querySelector('.pmw-dash-agents .wk-list'), W = window.PM_WORK, ag = W.items({ kind: 'agent' });
      const ids = L ? [...L.querySelectorAll('.wk-row[data-work-row]')].map((r) => r.getAttribute('data-work-row')) : [];
      return { rows: ids.length, agents: ag.length, same: ids.every((i) => ag.some((x) => x.id === i)), needs: ag.filter(W.needsYou).length, summary: window.PM7_WORK_UI.agentSummary(),
        bar: ((document.querySelector('[data-work-group] [data-status-action="agents"]') || {}).textContent || '').replace(/\s+/g, ' ').trim() }; });
    const busy = await read();
    await scenario('quiet'); await sleep(300);
    const quiet = await read();
    await scenario('busy');
    const need = Number((busy.summary.match(/(\d+) need you/) || [0, 0])[1]);
    return { ok: busy.rows === busy.agents && busy.same && quiet.rows === quiet.agents && busy.rows !== quiet.rows && need === busy.needs, note: JSON.stringify({ busy, quiet }) };
  });
  await check(36, 'The composer dock reads PM_WORK for the thread: needs-you lines with Review, live runs with their time, the next scheduled run; Review opens Processes at the item (CC5, ACD-476)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(800);
    const lines = () => ev(() => [...document.querySelectorAll('#pmRoot .composer .pmx-dock-line')].filter((l) => /^pmx-dock:work:/.test(l.getAttribute('data-key') || '') || l.querySelector('[data-action="work-dock-review"]'))
      .map((l) => ({ tone: l.getAttribute('data-tone'), id: (l.querySelector('[data-action="work-dock-review"]') || {}).dataset && l.querySelector('[data-action="work-dock-review"]').dataset.id, label: ((l.querySelector('[data-action="work-dock-review"]') || {}).textContent || '').trim(), time: ((l.querySelector('[data-work-time]') || {}).textContent || '') })));
    const busy = await lines();
    const want = await ev(() => { const W = window.PM_WORK, mine = W.items({ thread: 'query', kind: ['process', 'agent', 'scheduled'], view: 'thread:query' }); return { needs: mine.filter(W.needsYou).map((x) => x.id).sort().join(','), live: mine.filter((x) => x.kind === 'process' && W.isLive(x) && !W.needsYou(x)).length }; });
    const needLine = busy.find((l) => l.tone === 'needs');
    if (needLine) await clickAt('#pmRoot .composer .pmx-dock-line[data-tone="needs"] [data-action="work-dock-review"]'); await sleep(700);
    const opened = await ev(() => { const a = window.PM56_DEMO.getState().activity; return { open: a.open, domain: a.domain, sel: a.selected }; });
    await closeActivity(); await scenario('quiet'); await sleep(500);
    const quiet = await lines();
    await scenario('busy');
    const needsIds = busy.filter((l) => l.tone === 'needs').map((l) => l.id).sort().join(',');
    /* a running process's line leaves the dock 60 s after it first shows there (Q13, check 46), so only its time is asked of it */
    return { ok: needsIds === want.needs && !!needLine && needLine.label === 'Review' && busy.filter((l) => l.tone === 'live').every((l) => /\d/.test(l.time)) && opened.open && opened.domain === 'processes' && JSON.stringify(opened.sel || '').includes(needLine.id) && quiet.length < busy.length,
      note: JSON.stringify({ busy, want, opened, quiet: quiet.length }) };
  });
  await check(37, 'Dragging the floating Activity panel holds body.pm-resizing and ends it, with PM_DRAGEND, on release (R-10)', async () => {
    await openP('agents');
    await ev(() => { window.__wkDragEnds = 0; window.PM_ON_DRAGEND(() => { window.__wkDragEnds++; }); document.querySelector('#pm7-work [data-work-p="float"]').click(); }); await sleep(400);
    const hd = await ev(() => { const r = document.querySelector('#pm7-work .wk-head strong').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
    await page.mouse.move(hd.x, hd.y); await page.mouse.down(); await page.mouse.move(hd.x + 40, hd.y + 20, { steps: 5 });
    const during = await ev(() => document.body.classList.contains('pm-resizing'));
    await page.mouse.up(); await sleep(150);
    const after = await ev(() => ({ cls: document.body.classList.contains('pm-resizing'), ends: window.__wkDragEnds }));
    await ev(() => { document.querySelector('#pm7-work [data-work-p="float"]').click(); window.PM7_WORK_UI.close(); }); await sleep(300);
    return { ok: during && !after.cls && after.ends === 1, note: JSON.stringify({ during, after }) };
  });
  await check(38, 'Resources has the Time column: a header, each row\'s time, and it sorts by start (W6-24)', async () => {
    await scenario('servers'); await openP('resources'); await sleep(500);
    const head = await ev(() => { const b = document.querySelector('#pm7-work .wk-th [data-work-sort="time"]'); return b ? b.textContent.trim() : null; });
    await ev(() => document.querySelector('#pm7-work .wk-th [data-work-sort="time"]').click()); await sleep(300);
    const r = await ev(() => { const W = window.PM_WORK; return [...document.querySelectorAll('#pm7-work .wk-env')].map((e) => [...e.querySelectorAll(':scope > .wk-tr:not(.wk-th) [data-work-time]')].map((c) => (W.item(c.getAttribute('data-work-time')) || {}).startedAt || 0)); });
    const dir = await ev(() => document.querySelector('#pm7-work .wk-th [data-work-sort="time"]').getAttribute('aria-sort'));
    await ev(() => window.PM7_WORK_UI.close()); await scenario('busy');
    const sorted = r.every((o) => o.every((v, i) => i === 0 || (dir === 'ascending' ? o[i - 1] <= v : o[i - 1] >= v)));
    return { ok: head === 'Time' && r.some((o) => o.length > 1) && sorted, note: JSON.stringify({ head, dir, r }) };
  });
  await check(39, 'Resources samples every 2 s as its copy says (W6-30); servers, databases and watchers default to Notify me, other work to the agent (D9-b)', async () => {
    const n = await ev(() => new Promise((res) => { let k = 0; const stop = window.PM_WORK.sample(() => { k++; }, {}); setTimeout(() => { stop(); res(k); }, 6300); }));
    const d = await ev(() => window.PM_WORK.items({ kind: ['process', 'scheduled'] }).map((x) => [x.id, x.role, x.delivery]));
    await scenario('many'); await sleep(300);
    const m = await ev(() => window.PM_WORK.items({ kind: ['process', 'scheduled'] }).map((x) => [x.id, x.role, x.delivery]));
    await scenario('busy');
    const NOTIFY = { server: 1, db: 1, watcher: 1 };
    const bad = d.concat(m).filter(([, role, del]) => del !== (NOTIFY[role] ? 'user' : 'agent'));
    return { ok: n >= 3 && n <= 4 && bad.length === 0 && d.length > 0, note: JSON.stringify({ samplesIn6s: n, checked: d.length + m.length, bad: bad.slice(0, 5) }) };
  });
  /* --------------------------------------------------------------- final check F3-2 (audit cycle 2) */
  await check(40, 'The chat\'s Subagents is a filter of PM_WORK in every scenario: bar count, rows, words and the Live subagents card agree in Query performance, Architecture review and Investigate a browser issue (F3-2, D7)', async () => {
    const bad = [], seen = [];
    for (const s of ['busy', 'no-asks', 'quiet', 'many', 'stale', 'restart', 'servers']) {
      await scenario(s);
      for (const tid of ['query', 'subagents', 'debug']) {
        await ev((t) => window.PM56_DEMO.selectThread(t), tid); await sleep(450);
        await ev(() => window.PM56_DEMO.openActivity('subagents')); await sleep(550);
        const r = await ev((tid) => {
          const W = window.PM_WORK, want = W.sort(W.items({ thread: tid, kind: 'agent' }).filter((x) => x.role !== 'main'));
          const st = window.PM56_DEMO.getState().activity, root = document.querySelector('#pmRoot');
          const cnt = root.querySelector('.activity-item[data-domain="subagents"] .count');
          const rows = st.open && st.domain === 'subagents' ? [...root.querySelectorAll('.activity-panel .pmap-agent-row[data-id]')] : [];
          const card = root.querySelector('.live-agent-list') ? [...root.querySelectorAll('.live-agent-list .live-agent-row[data-id]')].map((e) => e.getAttribute('data-id')) : null;
          const active = root.querySelector('.system-card .chat-state') ? (root.querySelector('.system-card .chat-state').textContent.match(/(\d+) active/) || [])[1] : null;
          return { want: want.map((x) => x.id), words: want.map((x) => W.word(x)), working: want.filter((x) => x.state === 'working').length,
            domain: st.open ? st.domain : null, count: cnt ? cnt.textContent.trim() : null,
            rows: rows.map((e) => e.getAttribute('data-id')), rowWords: rows.map((e) => ((e.querySelector('.right b') || {}).textContent || '').trim()), card, active };
        }, tid);
        const ok = (r.want.length ? r.count === String(r.want.length) && r.domain === 'subagents' : (r.count === null || r.count === '0'))
          && (r.domain !== 'subagents' || (r.rows.join() === r.want.join() && r.rowWords.join() === r.words.join()))
          && (r.card === null || (r.card.join() === r.want.slice(0, 5).join() && (r.active == null || Number(r.active) === r.working)));
        seen.push(s + '/' + tid + ':' + r.want.length);
        if (!ok) bad.push({ s, tid, ...r });
        await closeActivity(); await sleep(150);
      }
    }
    await scenario('busy'); await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(400);
    return { ok: bad.length === 0 && seen.length === 21, note: bad.length ? JSON.stringify(bad.slice(0, 2)) : seen.join(' ') };
  });
  await check(41, 'Every agent surface names a chat thread as the chat does: PM_WORK\'s places and its main agents\' titles are the chat\'s thread titles in every scenario, and the rail and the chat header agree (F3-2 follow-up)', async () => {
    const bad = [];
    for (const s of ['busy', 'no-asks', 'quiet', 'many', 'stale', 'restart', 'servers']) {
      await scenario(s);
      const r = await ev(() => {
        const W = window.PM_WORK, st = window.PM56_DEMO.getState(), D = window.PM56_DATA;
        const title = (id) => { const t = (st.threads || []).find((x) => x.id === id) || (D.threads || []).find((x) => x.id === id); return t ? t.title : null; };
        return W.items({}).filter((x) => x.thread).map((x) => ({ id: x.id, where: x.where, title: x.role === 'main' ? x.title : null, chat: title(x.thread) }))
          .filter((x) => x.chat == null || x.where !== x.chat || (x.title != null && x.title !== x.chat));
      });
      r.forEach((x) => bad.push(s + ' ' + JSON.stringify(x)));
    }
    await scenario('busy');
    await clickAt('.icon[data-ab-id="agents"]'); await sleep(700);
    const dom = [];
    for (const [tid, aid] of [['query', 'a-qp'], ['questions', 'a-onb'], ['subagents', 'a-rar'], ['debug', 'a-imp']]) {
      await ev((t) => window.PM56_DEMO.selectThread(t), tid); await sleep(500);
      dom.push(await ev(([aid]) => ({ head: ((document.querySelector('#pmRoot .chat-title .pmx-chat-title') || {}).textContent || '').trim(),
        rail: ((document.querySelector('#panel-agents [data-work-row="' + aid + '"] .wk-copy strong') || {}).textContent || '').trim() }), [aid]));
    }
    await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(300);
    const domOk = dom.every((d) => d.head && d.head === d.rail);
    return { ok: bad.length === 0 && domOk, note: (bad.length ? bad.slice(0, 3).join(' | ') + ' ' : '') + JSON.stringify(dom) };
  });
  /* --------------------------------------------------------------- final check F3-4 (audit cycle 2) */
  await check(42, 'The Stop and Quit lists\' boxes show their state in this look: checked is a filled box with a tick, unchecked an empty one, each at least 3:1 against what it sits on; a real click turns one off and on (F3-4)', async () => {
    const res = [];
    for (const which of ['stop', 'quit']) {
      await ev((w) => (w === 'stop' ? window.PM7_WORK_UI.confirmPlatform() : window.PM7_WORK_UI.quit()), which); await sleep(600);
      /* Quit opens on Keep running, every box off; choosing to stop some turns them on */
      if (which === 'quit') { await clickAt('#pm7-work-dialog [data-choice="stop_selected"]'); await sleep(250); }
      const sel = '#pm7-work-dialog .wk-dialog-list li:not(.is-off) input[type=checkbox]';
      const id = await ev((s) => { const x = [...document.querySelectorAll(s)][1]; return x ? x.getAttribute('data-id') : null; }, sel);
      if (!id) { await ev(() => document.querySelector('#pm7-work-dialog [data-x="cancel"]').click()); res.push({ which, none: true }); continue; }
      const box = '#pm7-work-dialog input[data-id="' + id + '"]';
      await clickAt(box); await sleep(250); await page.mouse.move(5, Math.round(H / 2)); await sleep(200);
      const m = await ev(([box, sel]) => {
        const cv = document.createElement('canvas'); cv.width = cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
        const rgb = (c, under) => { g.clearRect(0, 0, 1, 1); if (under) { g.fillStyle = under; g.fillRect(0, 0, 1, 1); } g.fillStyle = c; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
        const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const L = (p) => 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
        const cr = (a, b) => { const x = L(a), y = L(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
        const off = document.querySelector(box), on = [...document.querySelectorAll(sel)].find((x) => x.checked);
        const plate = rgb(getComputedStyle(document.querySelector('#pm7-work-dialog')).backgroundColor, getComputedStyle(document.body).backgroundColor);
        const fill = rgb(getComputedStyle(on).backgroundColor, 'rgb(' + plate + ')'), tick = rgb(getComputedStyle(on, '::after').borderRightColor, 'rgb(' + fill + ')');
        const ring = rgb(getComputedStyle(off).borderTopColor, 'rgb(' + plate + ')'), offFill = rgb(getComputedStyle(off).backgroundColor, 'rgb(' + plate + ')');
        return { offChecked: off.checked, fillPlate: cr(fill, plate), tickFill: cr(tick, fill), ringPlate: cr(ring, plate), offFillPlate: cr(offFill, plate), offTick: getComputedStyle(off, '::after').content };
      }, [box, sel]);
      await clickAt(box); await sleep(250);
      const back = await ev((box) => document.querySelector(box).checked, box);
      await ev(() => document.querySelector('#pm7-work-dialog [data-x="cancel"]').click()); await sleep(300);
      res.push({ which, ...m, back });
    }
    const ok = res.every((r) => r.none || (r.offChecked === false && r.back === true && r.fillPlate >= 3 && r.tickFill >= 3 && r.ringPlate >= 3 && r.offFillPlate < 1.5 && /none|normal/.test(r.offTick)));
    const theme = await ev(() => document.documentElement.getAttribute('data-theme') + (document.documentElement.getAttribute('data-o55-nier') === 'on' ? ' nier' : ''));
    return { ok: ok && res.some((r) => !r.none), note: theme + ' ' + JSON.stringify(res) };
  });
  /* ------------------------------------------------- toast placement (Jared, 2026-10-30, replaces #19's clearance) */
  await check(43, 'A toast starts below the bell where the theme selector\'s menu starts, on Home, Usage and Projects, and on Home with Activity Detail open; it may cover what is there (Jared, 2026-10-30)', async () => {
    const rows = [];
    for (const where of ['dashboard', 'usage', 'projects', 'dashboard+activity']) {
      await ev((p) => window.PM_PAGES.go(p), where.split('+')[0]); await sleep(900);
      if (where.endsWith('+activity')) { await ev(() => window.PM56_DEMO.openActivity('goal')); await sleep(700); }
      await clickAt('#themeSelect'); await sleep(800);
      if (await ev(() => document.getElementById('themeSelect').getAttribute('aria-expanded') !== 'true')) { await clickAt('#themeSelect'); await sleep(800); }
      /* the menu's resting top, free of its opening animation: its offset in its positioned parent */
      const menuTop = await ev(() => { const m = document.getElementById('themeMenu'), op = m.offsetParent; return op ? Math.round((op.getBoundingClientRect().top + op.clientTop + m.offsetTop) * 10) / 10 : null; });
      await page.keyboard.press('Escape'); await sleep(400);
      await ev(() => window.PM_TITLEBAR_NOTIFY.push({ title: 'Placement check', body: 'The first card starts under the bell', kind: 'advisory', severity: 'info', important: true, source: 'agents' }));
      await sleep(1300);
      const cardTop = await ev(() => { const cs = [...document.querySelectorAll('#rsStage .pmn-toast:not(.pmn-leaving)')].map((c) => c.getBoundingClientRect()).filter((r) => r.height); return cs.length ? Math.round(Math.min(...cs.map((r) => r.top)) * 10) / 10 : null; });
      await ev(() => { try { window.PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* none */ } });
      if (where.endsWith('+activity')) await closeActivity();
      await sleep(500);
      rows.push({ where, menuTop, cardTop });
    }
    await ev(() => window.PM_PAGES.go('dashboard')); await sleep(500);
    return { ok: rows.every((r) => r.menuTop != null && r.cardTop != null && Math.abs(r.cardTop - r.menuTop) <= 0.5), note: JSON.stringify(rows) };
  });
  await check(44, 'An entering toast takes no clicks on any page, Usage included: a real click at its first frame reaches the control under it; once shown it takes clicks (F3-5)', async () => {
    const rows = [];
    for (const where of ['dashboard', 'usage', 'projects']) {
      await ev((p) => window.PM_PAGES.go(p), where); await sleep(900);
      await ev(() => { try { window.PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* none */ } }); await sleep(300);
      /* the click's target, read at the window before the page acts on it, and stopped there: this check reads hit
         testing, it does not press the page's controls */
      await ev(() => { window.__wkHit = null; window.addEventListener('click', (e) => { window.__wkHit = e.target.closest('.pmn-toast') ? 'toast' : (e.target.id || e.target.className || e.target.tagName).toString().slice(0, 40); e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true }); });
      const t = 'Entry check ' + where;
      await ev((t) => window.PM_TITLEBAR_NOTIFY.push({ title: t, body: 'A click at its first frame passes through', kind: 'advisory', severity: 'info', important: true, source: 'agents' }), t);
      const p = await ev(() => { const c = [...document.querySelectorAll('#rsStage .pmn-toast:not(.pmn-leaving)')].pop(); if (!c) return null; const r = c.getBoundingClientRect(); return { x: Math.round(r.left + r.width * 0.3), y: Math.round(r.top + r.height / 2), entering: c.classList.contains('pmn-entering'), pe: getComputedStyle(c).pointerEvents }; });
      if (p) await page.mouse.click(p.x, p.y);
      await sleep(150);
      const early = await ev(() => window.__wkHit);
      await sleep(1600);
      const late = await ev(() => { const c = [...document.querySelectorAll('#rsStage .pmn-toast:not(.pmn-leaving)')].pop(); if (!c) return null; const r = c.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width * 0.3, r.top + r.height / 2); return { entering: c.classList.contains('pmn-entering'), pe: getComputedStyle(c).pointerEvents, hitsCard: !!(h && h.closest('.pmn-toast') === c) }; });
      await ev(() => { try { window.PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* none */ } }); await sleep(400);
      rows.push({ where, at: p, early, late });
    }
    await ev(() => window.PM_PAGES.go('dashboard')); await sleep(500);
    return { ok: rows.every((r) => r.at && r.at.entering && r.at.pe === 'none' && r.early && r.early !== 'toast' && r.late && !r.late.entering && r.late.pe !== 'none' && r.late.hitsCard), note: JSON.stringify(rows) };
  });
  await check(45, 'With the inbox open, a toast stages below it, not over it, on the first open and on every reopen (F3-6)', async () => {
    await ev(() => window.PM_PAGES.go('dashboard')); await sleep(700);
    await ev(() => { try { window.PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* none */ } });
    const rows = [];
    for (let n = 1; n <= 3; n++) {
      await clickAt('#pmnStack'); await sleep(1000);
      /* a quick note: a lasting notice goes straight into an open inbox (19-notify.js push), a quick one stages under it */
      await ev((n) => window.PM_TITLEBAR_NOTIFY.push({ title: 'Inbox check ' + n, body: 'Stages under the open inbox', kind: 'advisory', severity: 'info', important: false, source: 'agents' }), n);
      await sleep(1300);
      rows.push(await ev(() => {
        const p = document.getElementById('pmnPanel'), pr = p.getBoundingClientRect(), st = document.getElementById('rsStage');
        const cs = [...document.querySelectorAll('#rsStage .pmn-toast:not(.pmn-leaving)')].map((c) => c.getBoundingClientRect()).filter((r) => r.height);
        return { open: !p.hidden, panelBottom: Math.round(pr.bottom * 10) / 10, panelH: p.offsetHeight, push: st.style.getPropertyValue('--pmn-push'), cardTop: cs.length ? Math.round(Math.min(...cs.map((r) => r.top)) * 10) / 10 : null };
      }));
      await clickAt('#pmnStack'); await sleep(1100);   // closed all the way before the next open
      await ev(() => { try { window.PM_TITLEBAR_NOTIFY.clearAll(); } catch (e) { /* none */ } }); await sleep(300);
    }
    return { ok: rows.length === 3 && rows.every((r) => r.open && r.cardTop != null && r.cardTop >= r.panelBottom && parseFloat(r.push) === r.panelH + 8), note: JSON.stringify(rows) };
  });
  await check(46, 'The composer dock: a running process shows for 60 s from when it first shows, then leaves; a line that needs the person stays (Q13)', async () => {
    await ev(() => window.PM_PAGES.go('dashboard')); await sleep(400);
    await scenario('busy'); await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(800);
    const lines = () => ev(() => [...document.querySelectorAll('#pmRoot .composer .pmx-dock-line')].filter((l) => l.querySelector('[data-action="work-dock-review"]'))
      .map((l) => ({ tone: l.getAttribute('data-tone'), id: l.querySelector('[data-action="work-dock-review"]').dataset.id })));
    const more = () => ev(() => { const m = [...document.querySelectorAll('#pmRoot .composer .pmx-dock *')].find((e) => /more/.test(e.textContent || '') && e.children.length === 0); return m ? m.textContent.trim() : ''; });
    /* a scenario starts its work over (new start times): new to the dock, so its running processes show */
    await scenario('quiet'); await sleep(400); await scenario('busy'); await sleep(900);
    const fresh = await lines(), freshMore = await more();
    await sleep(61500);
    const later = await lines(), laterMore = await more();
    await scenario('busy'); await sleep(400);
    const needs = (l) => l.filter((x) => x.tone === 'needs').map((x) => x.id).join(',');
    return { ok: fresh.some((l) => l.tone === 'live') && !later.some((l) => l.tone === 'live' || l.tone === 'comingup') && needs(later) && needs(later) === needs(fresh),
      note: JSON.stringify({ fresh, freshMore, later, laterMore }) };
  });
  /* ------------------------------------------------------------------------------------------- QA round 2 */
  await check(47, 'Resources has its rows on the first frame the tab shows (first open, reopen, after a scenario switch), and a Project with nothing of its own (another, or one just made) still shows this computer and its services, never an empty tray (Q12)', async () => {
    await scenario('busy'); await ev(() => window.PM7_WORK_UI.close()); await sleep(300);
    const watch = () => ev(() => { window.__wkRes = []; const t0 = performance.now(); const f = () => { const p = document.getElementById('pm7-work');
      window.__wkRes.push([Math.round(performance.now() - t0), p && p.getAttribute('data-tab'), p ? p.querySelectorAll('.wk-tr:not(.wk-th)').length : -1]); if (performance.now() - t0 < 1600) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const read = async () => { await sleep(1800); const r = await ev(() => window.__wkRes); const shown = r.filter((x) => x[1] === 'resources'); return { frames: shown.length, empty: shown.filter((x) => x[2] <= 0).length, first: shown.length ? shown[0][2] : null }; };
    const timings = [];
    for (const how of ['first', 'reopen']) {
      await clickAt('[data-status-action="agents"]'); await sleep(600);
      await watch(); await clickAt('#pm7-work [data-work-tab="resources"]'); timings.push({ how, ...(await read()) });
      await ev(() => window.PM7_WORK_UI.close()); await sleep(500);
    }
    await ev(() => window.PM7_WORK_UI.open('resources')); await sleep(600);
    await watch(); await scenario('servers'); timings.push({ how: 'scenario', ...(await read()) });
    await scenario('busy');
    /* another Project, then one just made the way onboarding makes it (PM_PROJECT_BOX.add, then select), then back */
    const proj = [];
    for (const id of ['harbor', 'p-wk-check-new']) {
      await ev((id) => { const b = window.PM_PROJECT_BOX; if (id.startsWith('p-')) b.add(id, { name: 'Check project' }); b.select(id); }, id); await sleep(700);
      await ev(() => window.PM7_WORK_UI.open('resources')); await sleep(800);
      proj.push(await ev((id) => { const p = document.getElementById('pm7-work'); return { id, rows: p.querySelectorAll('.wk-tr:not(.wk-th)').length, servers: [...p.querySelectorAll('.wk-server .wk-ghead strong')].map((e) => e.textContent), idle: !!p.querySelector('.wk-res-idle'), empty: !!p.querySelector('.wk-empty') }; }, id));
      await ev(() => window.PM7_WORK_UI.close()); await sleep(300);
    }
    await ev(() => window.PM_PROJECT_BOX.select('tastebook')); await sleep(600);
    await applyLook(); await sleep(fam === 'nier' ? 4500 : 1200);
    return { ok: timings.every((t) => t.frames > 0 && t.empty === 0 && t.first > 0) && proj.every((p) => p.rows >= 4 && !p.empty && p.servers.includes('This computer')) && proj[1].idle,
      note: JSON.stringify({ timings, proj }) };
  });
  await check(48, 'The Activity bar, the composer dock\'s lines and every floating surface of the panel are as opaque as the context ring\'s menu in this look (Q14 and its sweep)', async () => {
    await scenario('busy'); await ev(() => window.PM56_DEMO.selectThread('query')); await sleep(700);
    const alpha = (sel) => ev((s) => { const e = [...document.querySelectorAll(s)].filter((x) => x.getBoundingClientRect().height > 0).pop(); if (!e) return null; const c = getComputedStyle(e).backgroundColor; const m = c.match(/[\d.]+/g) || []; return { c, a: /^rgba|\/ /.test(c) && m.length >= 4 ? +m[3] : 1 }; }, sel);
    const r = {};
    r.bar = await alpha('#pmRoot .pm56-activity-bar');
    r.dock = await alpha('#pmRoot .composer .pmx-dock-line');
    await ev(() => window.PM7_WORK_UI.open('agents')); await sleep(500); r.panel = await alpha('#pm7-work'); await ev(() => window.PM7_WORK_UI.close()); await sleep(300);
    await ev(() => window.PM7_WORK_UI.systemStatus()); await sleep(400); r.system = await alpha('#pm7-work-system'); await ev(() => window.PM7_WORK_UI.systemStatus()); await sleep(300);
    await clickAt('#pmRoot .context-ring'); await sleep(600); r.menu = await alpha('.overlay-menu'); await page.keyboard.press('Escape'); await sleep(300);
    const need = r.menu ? r.menu.a - 0.005 : 1;
    return { ok: !!r.menu && ['bar', 'dock', 'panel', 'system'].every((k) => r[k] && r[k].a >= need), note: JSON.stringify(r) };
  });
  await check(49, 'Escape closes System status and the Stop list even when focus is not inside them, as in a sandboxed frame where their focus does not land', async () => {
    await ev(() => window.PM7_WORK_UI.systemStatus()); await sleep(400);
    await ev(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }); await page.keyboard.press('Escape'); await sleep(300);
    const sys = await ev(() => !document.getElementById('pm7-work-system'));
    await ev(() => window.PM7_WORK_UI.confirmPlatform()); await sleep(500);
    await ev(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }); await page.keyboard.press('Escape'); await sleep(300);
    const dlg = await ev(() => !document.getElementById('pm7-work-dialog'));
    return { ok: sys && dlg, note: JSON.stringify({ systemClosed: sys, stopListClosed: dlg }) };
  });
  await check(50, 'A hidden tab holds the moving rows: running process marks pause where they are and resume from there, in step, and working agents\' loaders go off (Q11 B, Astra\'s review)', async () => {
    await scenario('many'); await openP('processes'); await sleep(1200);
    const sample = () => ev(() => ({ vis: document.visibilityState, t: [...document.querySelectorAll('#pm7-work .wk-row.wk-moving:not(.wk-off)')].slice(0, 3).map((r) => r.querySelector('.wk-lead').getAnimations({ subtree: true }).map((a) => [a.playState, Math.round(a.currentTime)])[0] || null) }));
    const other = await page.context().newPage(); await other.goto('about:blank'); await other.bringToFront(); await sleep(300);
    /* a hidden page restyles lazily: the hold lands on its next style pass, so the hold is read from 1 s in */
    const h0 = await sample(); await sleep(1000); const h1 = await sample(); await sleep(1500); const h2 = await sample();
    await page.bringToFront(); await sleep(60); const back = await sample(); await sleep(900); const later = await sample();
    await other.close();
    await scenario('busy'); await openP('agents'); await sleep(1200);
    const o2 = await page.context().newPage(); await o2.goto('about:blank'); await o2.bringToFront(); await sleep(400);
    const hidLoaders = await ev(() => [...document.querySelectorAll('#pm7-work .wk-pip .pml-ld')].map((l) => l.getAttribute('data-pml-run')));
    await page.bringToFront(); await o2.close(); await sleep(400);
    await ev(() => window.PM7_WORK_UI.close());
    const t = (s) => s.t.map((x) => x && x[1]);
    const ok = h1.vis === 'hidden' && h1.t.length > 0 && h1.t.every((x) => x && x[0] === 'paused') && t(h1).join() === t(h2).join() &&
      back.vis === 'visible' && back.t.every((x, i) => x && x[0] === 'running' && Math.abs(x[1] - t(h2)[i]) < 150) && later.t.every((x, i) => x[1] > back.t[i][1] + 500) &&
      new Set(t(later)).size === 1 && t(h2)[0] - t(h0)[0] < 300 && hidLoaders.length > 0 && hidLoaders.every((r) => r !== 'on');
    return { ok, note: JSON.stringify({ hidden0: t(h0), hidden1s: t(h1), hidden25s: t(h2), back: t(back), later: t(later), hidLoaders }) };
  });
} finally {
  try { (await ev(() => window.__wkErrors || [])).forEach((e) => { if (!errors.includes(e)) errors.push(e); }); } catch (_) { /* the frame is gone */ }
  const failed = results.filter((r) => !r.ok).length;
  const wantLook = (fam === 'nier' ? 'basic-' + mode + '+nier' : fam + '-' + mode), drift = results.filter((r) => r.look !== wantLook);
  if (drift.length) console.log('LOOK DRIFT: ' + drift.length + ' checks ended outside ' + wantLook + ': ' + drift.slice(0, 5).map((r) => r.n + '=' + r.look).join(', '));
  writeFileSync(join(out, 'work-checks.json'), JSON.stringify({ page: url, sandbox, look: fam + '-' + mode, width: W, results, errors, drift: drift.map((r) => r.n) }, null, 1));
  console.log(`${results.length - failed}/${results.length} passed; ${errors.length} page errors` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await page.close().catch(() => {});
  await browser.close().catch(() => {});
  process.exitCode = failed || errors.length || drift.length ? 1 : 0;
}
