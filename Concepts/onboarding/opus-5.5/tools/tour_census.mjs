/* Guided Tour census: meaningful actions and dwell time per chapter, measured on the real tour.
 * node tools/tour_census.mjs <out-dir> [--wpm 200]
 * The tour is walked the way t2 walks it (Show Me for each action, Next for each explanation). For every step it
 * records the learner's meaningful actions (an action step is one; adding and then placing the widget, and opening
 * Why before answering, are two), the words on screen the step asks the learner to read (the callout, plus the
 * answer, rewrite or plan section the step points at), and the time the action itself took. Dwell per step is
 * reading time at the given pace + the action's own time + 0.8 s to decide per action. The packet asks that Plan
 * before building get at least half of both. Writes census.json and prints the table. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
/* Remove a run's Chrome profile (~150 MB). The helper's close() kills Chrome without waiting, and Chrome's helpers
   keep writing for a moment, so wait for the exit, then retry the removal; cleanup never fails the run. */
const dropProfile = async (dir, chrome) => {
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) await new Promise((r) => { chrome.once('exit', r); setTimeout(r, 3000); });
  for (let i = 0; i < 25; i++) { try { rmSync(dir, { recursive: true, force: true }); return; } catch (_) { await new Promise((r) => setTimeout(r, 200)); } }
};

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/census');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const WPM = Number(opt('wpm', 200));
mkdirSync(out, { recursive: true });

/* what else a step asks the learner to read, besides its callout */
const READ = {
  answer_stream: () => (window.O55.tour.chat.lastAnswerEl() || {}).textContent || '',
  same_answer_eli5: () => (window.O55.tour.chat.lastAnswerEl() || {}).textContent || '',
  three_outcomes: () => (document.getElementById('pm6WizTopicList') || {}).textContent || '',
  access_answer: () => ((document.querySelector('#pm6WizThread .o55p-bubble') || {}).textContent || ''),
  review: () => (document.getElementById('pm6WizDoc') || {}).textContent || '',
  consequence_changed: () => (document.querySelector('#pm6WizDoc [data-key="s-dec"]') || {}).textContent || '',
  review_parts: () => ['part1', 'part2', 'part3', 'part4'].map((k) => window.O55.tx('tour.steps.review_parts.' + k)).join(' ')
};
const EXTRA_ACTIONS = { widget_action: 1, access_answer: 1 }; /* place after add; Why before the answer */

const profile = `${tmpdir()}/pm-census-${process.pid}`;
const { page, close, chrome } = await launch({ width: 1600, height: 1000, profile });
const ev = (fn, ...a) => page.evaluate(fn, ...a);
const until = async (fn, what, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(fn)) return; await sleep(100); } throw new Error('timeout ' + what); };
const clickSel = async (sel) => { const c = await ev((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel); if (!c) throw new Error('no ' + sel); await page.mouse(c.x, c.y); };
const words = (s) => String(s || '').split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;

await page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1300);
await ev(() => localStorage.removeItem('pm.o55.tour.v1'));
await ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook', fresh: true }));
const rows = [];
for (let guard = 0; guard < 40; guard++) {
  const id = await ev(() => window.O55.tour.state().step);
  const d = await ev((i) => { const s = window.O55.tour.byId[i]; return { kind: s.kind, chapter: s.chapter, after: !!s.after, stay: !!s.stay }; }, id);
  await sleep(700);
  let actionMs = 0;
  if (d.kind === 'action' && id !== 'completion_boundary') {
    if (id === 'same_answer_eli5') await until(() => window.O55.tour.chat.answered('a1'), 'answer');
    const t0 = Date.now();
    await clickSel('#pm-o55-tour .o55t-callout [data-o55t="showMe"]');
    await until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 'done ' + id, 25000);
    actionMs = Date.now() - t0;
    await sleep(400);
  } else if (d.kind === 'info') {
    /* an explanation that plays out over time (the orientation glide, the plan read part by part) holds the learner
       at least as long as it takes to reach its Next */
    const t0 = Date.now();
    await until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]') || !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="finish"]'), 'ready ' + id, 25000);
    actionMs = -(Date.now() - t0 + 700);
  }
  const callout = await ev(() => (document.querySelector('#pm-o55-tour .o55t-callout') || {}).innerText || '');
  const extra = READ[id] ? await ev(`(${READ[id].toString()})()`) : '';
  const actions = d.kind === 'action' ? 1 + (EXTRA_ACTIONS[id] || 0) : 0;
  const readWords = words(callout) + words(extra);
  const readS = readWords / (WPM / 60), heldS = actionMs < 0 ? -actionMs / 1000 : 0;
  const dwellS = (heldS ? Math.max(readS, heldS) : readS + actionMs / 1000) + actions * 0.8;
  if (actionMs < 0) actionMs = 0;
  rows.push({ id, chapter: d.chapter, kind: d.kind, actions, readWords, actionMs, dwellS: +dwellS.toFixed(1) });
  if (id === 'completion_boundary') break;
  if (d.kind === 'info') await clickSel('#pm-o55-tour .o55t-callout [data-o55t="next"]');
  else if (d.stay) { await sleep(600); await clickSel('#pm-o55-tour .o55t-callout [data-o55t="next"]'); }
  await until(new Function(`return window.O55.tour.state().step !== ${JSON.stringify(id)}`), 'leave ' + id, 12000);
}
await close(); await dropProfile(profile, chrome);

const chapters = {};
for (const r of rows) { const c = chapters[r.chapter] || (chapters[r.chapter] = { actions: 0, dwellS: 0, steps: 0 }); c.actions += r.actions; c.dwellS += r.dwellS; c.steps++; }
const tot = Object.values(chapters).reduce((a, c) => ({ actions: a.actions + c.actions, dwellS: a.dwellS + c.dwellS }), { actions: 0, dwellS: 0 });
for (const c of Object.values(chapters)) { c.dwellS = +c.dwellS.toFixed(1); c.actionShare = +(c.actions / tot.actions).toFixed(3); c.dwellShare = +(c.dwellS / tot.dwellS).toFixed(3); }
const result = { wpm: WPM, rows, chapters, total: { actions: tot.actions, dwellS: +tot.dwellS.toFixed(1), minutes: +(tot.dwellS / 60).toFixed(1) }, planMajority: chapters.plan && chapters.plan.actionShare >= 0.5 && chapters.plan.dwellShare >= 0.5 };
writeFileSync(join(out, 'census.json'), JSON.stringify(result, null, 1));
for (const r of rows) console.log(`${r.chapter.padEnd(10)} ${r.id.padEnd(22)} ${r.kind.padEnd(7)} actions ${r.actions}  words ${String(r.readWords).padStart(3)}  action ${String(r.actionMs).padStart(5)} ms  dwell ${r.dwellS}s`);
console.log(JSON.stringify({ chapters, total: result.total, planMajority: result.planMajority }));
