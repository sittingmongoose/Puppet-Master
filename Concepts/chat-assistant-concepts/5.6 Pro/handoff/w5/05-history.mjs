import { boot, makeFilmer, W5 } from './rig.mjs';
import fs from 'fs';
const OUT = W5 + '/film';

const { b, p, errs } = await boot({});
const F = makeFilmer(p, OUT); await F.attach();

const state0 = await p.evaluate(() => ({ hist: window.PM56_DEMO.getState().historyMode, v1: window.PM56_DEMO.getState().variants[1] }));
console.log('start', JSON.stringify(state0));

// make sure the drawer is CLOSED before filming the open (never trigger twice)
await p.evaluate(() => { const s = window.PM56_DEMO.getState(); if (s.historyMode !== 'closed') document.querySelector('[data-action="toggle-history"]').click(); });
await p.waitForTimeout(600);
console.log('pre-open mode', await p.evaluate(() => window.PM56_DEMO.getState().historyMode));

const leftClip = { x: 0, y: 60, width: 720, height: 560 };

// 1 — the W1 open: left drawer 240ms
await F.film('hist-01-open', async () => { await p.evaluate(() => document.querySelector('[data-action="toggle-history"]').click()); }, 800, leftClip, { cols: 6, maxFrames: 18, scale: 0.62 });
await p.waitForTimeout(600);

// rAF trace of the open — the real timing instrument
const openTrace = await p.evaluate(async () => {
  document.querySelector('[data-action="toggle-history"]').click();  // close
  await new Promise(r => setTimeout(r, 700));
  const out = []; const t0 = performance.now(); let stop = false;
  const tick = () => {
    const el = document.querySelector('.history-flyout, .history-panel');
    const r = el ? el.getBoundingClientRect() : null;
    const ed = document.querySelector('.transcript, .chat-stage');
    out.push({ t: +(performance.now() - t0).toFixed(1), x: r ? +r.left.toFixed(1) : null, w: r ? +r.width.toFixed(1) : null, op: el ? +getComputedStyle(el).opacity : null, edL: ed ? +ed.getBoundingClientRect().left.toFixed(1) : null });
    if (!stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  await new Promise(r => setTimeout(r, 40));
  document.querySelector('[data-action="toggle-history"]').click();
  await new Promise(r => setTimeout(r, 900));
  stop = true; return out;
});
fs.writeFileSync(W5 + '/trace-hist-open.json', JSON.stringify(openTrace));
let prev = null; console.log('--- open trace (drawer left/width, transcript left)');
openTrace.forEach(s => { const k = `${s.x}|${s.w}|${s.edL}`; if (k !== prev) { console.log(`  +${s.t} x=${s.x} w=${s.w} op=${s.op} transcriptLeft=${s.edL}`); prev = k; } });

await p.waitForTimeout(400);
// 2 — pin in place: drawer narrows 300->200 while the transcript gutter grows
const pinSel = await p.evaluate(() => {
  const cands = [...document.querySelectorAll('[data-action]')].filter(el => /pin/i.test(el.dataset.action) && el.closest('.history-flyout,.history-panel'));
  return cands.map(el => el.dataset.action + '|' + (el.getAttribute('title') || el.textContent.trim().slice(0, 20)));
});
console.log('pin candidates', pinSel);

const gridClip = { x: 0, y: 60, width: 1440, height: 520 };
await F.film('hist-02-pin', async () => {
  await p.evaluate(() => { const el = [...document.querySelectorAll('.history-flyout [data-action],.history-panel [data-action]')].find(e => /pin/i.test(e.dataset.action)); if (el) el.click(); });
}, 900, gridClip, { cols: 6, maxFrames: 18, scale: 0.40 });
await p.waitForTimeout(700);

const pinTrace = await p.evaluate(async () => {
  const out = []; const t0 = performance.now(); let stop = false;
  const tick = () => {
    const el = document.querySelector('.history-panel, .history-flyout');
    const tr = document.querySelector('.transcript');
    out.push({ t: +(performance.now() - t0).toFixed(1), w: el ? +el.getBoundingClientRect().width.toFixed(1) : null, trL: tr ? +tr.getBoundingClientRect().left.toFixed(1) : null, trW: tr ? +tr.getBoundingClientRect().width.toFixed(1) : null });
    if (!stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  await new Promise(r => setTimeout(r, 40));
  const el = [...document.querySelectorAll('.history-panel [data-action],.history-flyout [data-action]')].find(e => /pin/i.test(e.dataset.action));
  if (el) el.click();
  await new Promise(r => setTimeout(r, 900));
  stop = true; return out;
});
fs.writeFileSync(W5 + '/trace-hist-pin.json', JSON.stringify(pinTrace));
prev = null; console.log('--- pin trace (drawer width, transcript left/width)');
pinTrace.forEach(s => { const k = `${s.w}|${s.trL}|${s.trW}`; if (k !== prev) { console.log(`  +${s.t} drawerW=${s.w} transcriptL=${s.trL} transcriptW=${s.trW}`); prev = k; } });

await p.waitForTimeout(600);
// 3 — pin a THREAD (FLIP into the Pinned group)
const drawerClip = await p.evaluate(() => { const el = document.querySelector('.history-panel,.history-flyout'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.max(0, Math.round(r.left)), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(Math.min(600, innerHeight - r.top)) }; });
console.log('drawerClip', JSON.stringify(drawerClip));
await F.film('hist-03-threadpin', async () => {
  await p.evaluate(() => {
    const rows = [...document.querySelectorAll('.thread-row')];
    const target = rows[Math.min(4, rows.length - 1)];
    const btn = target && (target.querySelector('[data-action="toggle-thread-pin"]') || target.querySelector('[data-action="thread-menu"]'));
    if (btn) btn.click(); else window.__noPin = true;
  });
}, 1000, drawerClip, { cols: 6, maxFrames: 18, scale: 0.62 });
console.log('noPin?', await p.evaluate(() => !!window.__noPin));

console.log('ERRORS', errs.length, errs.slice(0, 5));
await b.close();
