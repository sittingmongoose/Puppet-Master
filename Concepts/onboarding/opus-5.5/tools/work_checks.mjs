/* work_checks.mjs: the background-activity concept's 22 scripted checks, rewritten for the native surfaces (W6; the
 * concept was Concepts/background-activity/opus-5.5, its checks lived in its lab). OWNER: pm7-activity, PM7 build
 * 2026-10-29. Drives an existing GPU browser (an agent-browser or gpu-browser session; this tool never launches one):
 *
 *   node tools/work_checks.mjs <page path or url> --cdp <endpoint> [--look basic-dark] [--width 1920] [--out dir]
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
const cdp = opt('cdp');
if (!page0 || !cdp) { console.error('usage: work_checks.mjs <page path or url> --cdp <endpoint> [--look basic-dark] [--width 1920] [--out dir]'); process.exit(2); }
const url = /^https?:|^file:/.test(page0) ? page0 : pathToFileURL(resolve(page0)).href;
const [fam, mode] = opt('look', 'basic-dark').split('-');
const W = Number(opt('width', '1920')), H = 1000;
const out = resolve(opt('out', '/tmp/o55/work-checks')); mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.connectOverCDP(cdp, { noDefaults: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e && e.message || e).slice(0, 300)));
const results = [];
async function check(n, name, fn) {
  let ok = false, note = '';
  try { const r = await fn(); ok = r === true || (r && r.ok === true); note = r && r.note ? r.note : (typeof r === 'string' ? r : ''); }
  catch (e) { note = 'threw: ' + String(e.message || e).slice(0, 200); }
  results.push({ n, name, ok, note });
  console.log((ok ? 'PASS ' : 'FAIL ') + String(n).padStart(2) + ' ' + name + (note ? ' — ' + note : ''));
}
const ev = (fn, arg) => page.evaluate(fn, arg);
const scenario = async (name) => { await ev((n) => window.PM_WORK.scenario(n), name); await sleep(500); };
const clickAt = async (sel) => { const r = await ev((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) throw new Error('nothing to click: ' + sel); await page.mouse.click(r.x, r.y); return r; };
const hoverAt = async (sel) => { const r = await ev((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, sel); if (!r) throw new Error('nothing to hover: ' + sel); await page.mouse.move(r.x, r.y + 60); await sleep(60); await page.mouse.move(r.x, r.y, { steps: 5 }); return r; };
const barText = (k) => ev((k) => { const e = document.querySelector('[data-work-group] [data-status-action="' + k + '"]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, k);
const closeActivity = () => ev(() => { const x = document.querySelector('#pmRoot .activity-panel [data-action="close-activity"]'); if (x) x.click(); });

try {
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'o55=off', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => !!(window.PM_WORK && window.PM7_WORK_UI && window.PM56_DEMO && window.PM_THEME), null, { timeout: 120000 });
  await ev(([f, m]) => { if (window.PM_NIER && f !== 'nier') window.PM_NIER.set(false, { sound: false }); window.PM_THEME.setFamily(f === 'nier' ? 'basic' : f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); if (window.PM_NIER && f === 'nier') window.PM_NIER.set(true, { sound: false }); }, [fam, mode]);
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
    await scenario('quiet');
    const r = await ev(() => { const st = window.PM56_DEMO.getState(); return { icon: !!document.querySelector('#pmRoot .activity-item[data-domain="processes"]'), a: document.querySelector('[data-status-action="agents"]').textContent.trim(), p: document.querySelector('[data-status-action="processes"]').textContent.trim(), open: st.activity.open, dom: st.activity.domain, hover: st.hover }; });
    return { ok: !r.icon && /No agents/.test(r.a) && /No processes/.test(r.p), note: JSON.stringify(r) };
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
    return { ok: r.prev && r.next && !r.hidden && a === '162' && p === '101', note: JSON.stringify(r) + ' ' + a + ' / ' + p };
  });
  await check(14, 'Words: 16 agents · 2 questions and 10 processes · 1 needs input (general.interaction.status-bar-words)', async () => {
    await ev(() => document.documentElement.setAttribute('data-pm-status-words', 'on')); await sleep(300);
    const a = await barText('agents'), p = await barText('processes');
    await ev(() => document.documentElement.setAttribute('data-pm-status-words', 'off'));
    return { ok: a === '16 agents2 questions' && p === '10 processes1 needs input', note: a + ' / ' + p };
  });
  await check(15, 'Hover tags say where the agents run and how many wait on you', async () => {
    const t = await ev(() => document.querySelector('[data-status-action="agents"]').getAttribute('data-pm-hover-detail'));
    return { ok: /16 agents running across Puppet Master \(Assistant 6, Orchestrator 4, Planning Wizard 1, PRD Builder 2, Scout 3\)\. 2 questions for you\./.test(t), note: t };
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
    await clickAt('#pm7-work [data-work-p="stopall"]'); await sleep(300);
    const sa = await ev(() => { const d = document.querySelector('.wk-dialog'); const before = d.querySelectorAll('input:not(:disabled)').length; return { before, choices: [...d.querySelectorAll('[data-choice]')].map((b) => b.textContent) }; });
    await clickAt('.wk-dialog [data-choice="all"]'); await sleep(150);
    const sa2 = await ev(() => document.querySelectorAll('.wk-dialog input:not(:disabled)').length);
    await clickAt('.wk-dialog [data-x="cancel"]'); await sleep(200);
    await clickAt('#pm7-work [data-work-p="float"]'); await ev(() => window.PM7_WORK_UI.close());
    await ev(() => window.PM7_WORK_UI.quit()); await sleep(300);
    const q = await ev(() => { const all = document.querySelectorAll('.wk-dialog'), d = all[all.length - 1]; return { dialogs: all.length, go: d.querySelector('[data-x="go"]').textContent, enabled: d.querySelectorAll('input:not(:disabled)').length, checked: d.querySelector('[data-choice][aria-checked="true"]').getAttribute('data-choice') }; });
    await clickAt('.wk-dialog [data-choice="stop_selected"]'); await sleep(150);
    const q2 = await ev(() => document.querySelector('.wk-dialog [data-x="go"]').textContent);
    await clickAt('.wk-dialog [data-x="cancel"]');
    return { ok: f0.floating && f1 > f0.x + 60 && sa.choices.length === 2 && sa2 > sa.before && q.checked === 'keep_running' && q.go === 'Quit' && q.enabled === 0 && /^Quit and stop \d+$/.test(q2),
      note: JSON.stringify({ moved: f1 - f0.x, stopList: [sa.before, sa2], quit: q, quitStop: q2 }) };
  });
} finally {
  const failed = results.filter((r) => !r.ok).length;
  writeFileSync(join(out, 'work-checks.json'), JSON.stringify({ page: url, look: fam + '-' + mode, width: W, results, errors }, null, 1));
  console.log(`${results.length - failed}/${results.length} passed; ${errors.length} page errors` + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close().catch(() => {});
  await browser.close().catch(() => {});
  process.exitCode = failed || errors.length ? 1 : 0;
}
