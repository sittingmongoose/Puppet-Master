import { boot, W5 } from './rig.mjs';
import fs from 'fs';

const { b, p, errs } = await boot({});
await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);

// what IS the panel?
const shape = await p.evaluate(() => {
  const card = document.querySelector('.working-card');
  const kids = [...card.children].map(c => c.className);
  const body = card.querySelector('.working-body');
  const bkids = body ? [...body.children].map(c => c.className + ' h=' + c.getBoundingClientRect().height.toFixed(1)) : [];
  return { kids, bkids, bodyCS: body ? { pos: getComputedStyle(body).position, ov: getComputedStyle(body).overflow, tr: getComputedStyle(body).transition } : null };
});
console.log(JSON.stringify(shape, null, 1));

await p.evaluate(() => document.querySelector('.orbit-node[data-value="4"]').click());
await p.waitForTimeout(1000);

const t = await p.evaluate(async () => {
  const out = [];
  const card = document.querySelector('.working-card');
  const t0 = performance.now();
  let stop = false;
  const snap = () => {
    const body = card.querySelector('.working-body');
    const pan = card.querySelector('.orbit-detail, .orbit-panel, [data-orbit-panel], .orbit-phase-panel');
    const cs = getComputedStyle(card), bs = body ? getComputedStyle(body) : null;
    return {
      t: +(performance.now() - t0).toFixed(1),
      cardRect: +card.getBoundingClientRect().height.toFixed(1),
      cardOff: card.offsetHeight,
      cardTr: cs.transform === 'none' ? '-' : cs.transform,
      bodyRect: body ? +body.getBoundingClientRect().height.toFixed(1) : null,
      bodyOff: body ? body.offsetHeight : null,
      bodyTr: bs && bs.transform !== 'none' ? bs.transform : '-',
      bodyMaxH: bs ? bs.maxHeight : null,
      panH: pan ? +pan.getBoundingClientRect().height.toFixed(1) : null,
      panCls: pan ? pan.className : null,
      // where does the card's BOTTOM sit on screen? that's what the reader sees move
      cardBottom: +card.getBoundingClientRect().bottom.toFixed(1),
      nextTop: card.nextElementSibling ? +card.nextElementSibling.getBoundingClientRect().top.toFixed(1) : null,
    };
  };
  const tick = () => { out.push(snap()); if (!stop) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  await new Promise(r => setTimeout(r, 30));
  document.querySelector('[data-action="orbit-collapse"]').click();
  await new Promise(r => setTimeout(r, 900));
  stop = true;
  return out;
});
fs.writeFileSync(W5 + '/trace-snap.json', JSON.stringify(t));
let prev = null;
t.forEach(s => {
  const k = `${s.cardRect}|${s.cardOff}|${s.bodyRect}|${s.bodyOff}|${s.panH}|${s.bodyTr}|${s.cardBottom}`;
  if (k !== prev) { console.log(`+${s.t}ms cardRect=${s.cardRect} cardOff=${s.cardOff} bodyRect=${s.bodyRect} bodyOff=${s.bodyOff} pan=${s.panH} bottom=${s.cardBottom} next=${s.nextTop} bodyTr=${s.bodyTr}`); prev = k; }
});
console.log('ERRORS', errs.length);
await b.close();
