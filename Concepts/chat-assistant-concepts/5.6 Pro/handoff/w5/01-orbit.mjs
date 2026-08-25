import { boot, makeFilmer, W5 } from './rig.mjs';
import fs from 'fs';
const OUT = W5 + '/film';

const { b, p, errs } = await boot({});
const F = makeFilmer(p, OUT);
await F.attach();

await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);

const cardClip = () => {
  const r = document.querySelector('.working-card').getBoundingClientRect();
  return { x: Math.max(0, Math.round(r.left) - 4), y: Math.max(0, Math.round(r.top) - 4), width: Math.round(r.width) + 8, height: Math.min(440, innerHeight - Math.max(0, Math.round(r.top) - 4)) };
};

// --- rAF trace of the collapse, in-page, no CDP involved -------------------
async function traceOrbit(label, actionSrc, ms) {
  const t = await p.evaluate(async ([actionSrc, ms]) => {
    const out = [];
    const t0 = performance.now();
    let stop = false;
    const probe = () => {
      const pan = document.querySelector('.orbit-detail, .orbit-panel, [data-orbit-panel], .orbit-phase-panel');
      const el = pan || null;
      const r = el ? el.getBoundingClientRect() : null;
      const cs = el ? getComputedStyle(el) : null;
      return {
        exists: !!el,
        h: r ? +r.height.toFixed(1) : null,
        op: cs ? +cs.opacity : null,
        vis: cs ? cs.visibility : null,
        txt: el ? el.innerText.replace(/\s+/g, ' ').slice(0, 30) : null,
        // how many painted rows the whole card shows
        cardH: +document.querySelector('.working-card').getBoundingClientRect().height.toFixed(1),
      };
    };
    const tick = () => { out.push({ t: +(performance.now() - t0).toFixed(1), ...probe() }); if (!stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    await new Promise(r => setTimeout(r, 30));
    eval(actionSrc);
    await new Promise(r => setTimeout(r, ms));
    stop = true;
    return out;
  }, [actionSrc, ms]);
  fs.writeFileSync(`${W5}/trace-${label}.json`, JSON.stringify(t));
  // print compressed
  const seen = [];
  t.forEach(s => { const k = `${s.exists}|${s.h}|${s.op}|${s.cardH}`; if (!seen.length || seen[seen.length - 1].k !== k) seen.push({ k, t: s.t, ...s }); });
  console.log(`TRACE ${label}: ${t.length} frames, ${seen.length} distinct states`);
  seen.forEach(s => console.log(`   +${s.t}ms exists=${s.exists} h=${s.h} op=${s.op} cardH=${s.cardH} "${s.txt}"`));
}

// 1 expand  (film)
await F.film('orbit-01-expand', async () => { await p.evaluate(() => document.querySelector('.orbit-node[data-value="4"]').click()); }, 900, cardClip, { cols: 6, maxFrames: 18, scale: 0.75 });
await p.waitForTimeout(700);

// 2 collapse (film) — THE EYE CHECK
await F.film('orbit-02-collapse', async () => { await p.evaluate(() => document.querySelector('[data-action="orbit-collapse"]').click()); }, 900, cardClip, { cols: 6, maxFrames: 18, scale: 0.75 });
await p.waitForTimeout(700);

// re-expand then trace the collapse with rAF (fresh state; not the same event twice)
await p.evaluate(() => document.querySelector('.orbit-node[data-value="4"]').click());
await p.waitForTimeout(900);
await traceOrbit('collapse', `document.querySelector('[data-action="orbit-collapse"]').click()`, 900);

await p.waitForTimeout(500);
await traceOrbit('expand', `document.querySelector('.orbit-node[data-value="6"]').click()`, 900);

// 3 phase handover (auto step advance)
await p.evaluate(() => { window.PM56_DEMO.setWorkStep(3); });
await p.waitForTimeout(600);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await F.film('orbit-03-handover', async () => { await p.evaluate(() => window.PM56_DEMO.stepWorking()); }, 900, cardClip, { cols: 6, maxFrames: 18, scale: 0.75 });

console.log('ERRORS', errs.length, errs.slice(0, 5));
await b.close();
