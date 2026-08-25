import { boot, W5 } from './rig.mjs';
import fs from 'fs';
const { b, p, errs } = await boot({});
await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);

const rest = await p.evaluate(() => {
  const st = document.querySelector('.orbit-stage');
  const dump = el => el ? { cls: el.className, h: +el.getBoundingClientRect().height.toFixed(1), tr: getComputedStyle(el).transition.slice(0, 90), anim: getComputedStyle(el).animationName } : null;
  return { stage: dump(st), kids: [...st.children].map(dump) };
});
console.log('REST', JSON.stringify(rest, null, 1));

async function trace(label, actionSrc) {
  const t = await p.evaluate(async ([actionSrc]) => {
    const out = []; const t0 = performance.now(); let stop = false;
    const snap = () => {
      const st = document.querySelector('.orbit-stage');
      const kids = st ? [...st.children].map(k => k.className.split(' ')[0] + ':' + k.getBoundingClientRect().height.toFixed(0)) : [];
      return { t: +(performance.now() - t0).toFixed(1), stage: st ? +st.getBoundingClientRect().height.toFixed(1) : null, kids: kids.join(' '), card: +document.querySelector('.working-card').getBoundingClientRect().height.toFixed(1) };
    };
    const tick = () => { out.push(snap()); if (!stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    await new Promise(r => setTimeout(r, 30));
    eval(actionSrc);
    await new Promise(r => setTimeout(r, 950));
    stop = true; return out;
  }, [actionSrc]);
  fs.writeFileSync(`${W5}/trace-stage-${label}.json`, JSON.stringify(t));
  let prev = null;
  console.log('--- ' + label);
  t.forEach(s => { const k = `${s.stage}|${s.kids}|${s.card}`; if (k !== prev) { console.log(`  +${s.t} stage=${s.stage} card=${s.card} [${s.kids}]`); prev = k; } });
}

await trace('expand', `document.querySelector('.orbit-node[data-value="4"]').click()`);
await p.waitForTimeout(600);
await trace('collapse', `document.querySelector('[data-action="orbit-collapse"]').click()`);
console.log('ERRORS', errs.length);
await b.close();
