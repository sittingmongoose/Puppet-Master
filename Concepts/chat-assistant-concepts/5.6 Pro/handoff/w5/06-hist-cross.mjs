import { boot, makeFilmer, W5 } from './rig.mjs';
import fs from 'fs';
const OUT = W5 + '/film';
const { b, p, errs } = await boot({});
const F = makeFilmer(p, OUT); await F.attach();

await p.evaluate(() => { const s = window.PM56_DEMO.getState(); if (s.historyMode !== 'closed') document.querySelector('[data-action="toggle-history"]').click(); });
await p.waitForTimeout(700);

// does the drawer PAINT over the editor mid-entrance?
const probe = await p.evaluate(async () => {
  const out = [];
  let stop = false;
  const tick = () => {
    const el = document.querySelector('.history-flyout');
    const r = el ? el.getBoundingClientRect() : null;
    let hitMid = null, hitLeft = null;
    if (r) {
      const cy = Math.round(r.top + r.height / 2);
      const a = document.elementFromPoint(Math.round(r.left + 20), cy);
      const c = document.elementFromPoint(500, cy);
      hitLeft = a ? (a.closest('.history-flyout') ? 'FLYOUT' : a.className.toString().slice(0, 30)) : null;
      hitMid = c ? (c.closest('.history-flyout') ? 'FLYOUT' : (c.closest('.editor-pane,.code-pane,.workspace>*') ? 'EDITOR:' + c.className.toString().slice(0, 20) : c.className.toString().slice(0, 30))) : null;
    }
    out.push({
      t: +performance.now().toFixed(0), x: r ? +r.left.toFixed(1) : null, w: r ? +r.width.toFixed(1) : null,
      parent: el ? el.parentElement.id || el.parentElement.className : null,
      cp: el ? getComputedStyle(el).clipPath : null,
      op: el ? getComputedStyle(el).opacity : null,
      hitLeft, hitMid,
    });
    if (!stop) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  await new Promise(r => setTimeout(r, 40));
  document.querySelector('[data-action="toggle-history"]').click();
  await new Promise(r => setTimeout(r, 800));
  stop = true;
  // ancestors overflow
  const el = document.querySelector('.history-flyout');
  const anc = []; let n = el;
  while (n && n !== document.documentElement) { const cs = getComputedStyle(n); anc.push(`${n.tagName}.${(n.className || '').toString().split(' ')[0]} ov=${cs.overflow} pos=${cs.position} z=${cs.zIndex} contain=${cs.contain}`); n = n.parentElement; }
  return { out, anc };
});
fs.writeFileSync(W5 + '/trace-hist-cross.json', JSON.stringify(probe));
let prev = null;
probe.out.forEach(s => { const k = `${s.x}|${s.hitLeft}|${s.hitMid}`; if (k !== prev) { console.log(`x=${s.x} w=${s.w} clip=${s.cp} op=${s.op} hitAtDrawerLeft=${s.hitLeft} hitAt500=${s.hitMid}`); prev = k; } });
console.log('ANCESTORS:', probe.anc.join('\n  '));

// film it with a clip that actually contains the travel
await p.evaluate(() => document.querySelector('[data-action="toggle-history"]').click());
await p.waitForTimeout(700);
await F.film('hist-01b-open-wide', async () => { await p.evaluate(() => document.querySelector('[data-action="toggle-history"]').click()); }, 700, { x: 380, y: 40, width: 1060, height: 520 }, { cols: 5, maxFrames: 15, scale: 0.46 });

console.log('ERRORS', errs.length, errs.slice(0, 5));
await b.close();
