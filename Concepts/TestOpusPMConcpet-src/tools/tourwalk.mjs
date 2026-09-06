import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark' });
const st = () => page.evaluate(() => ({ step: window.PMO_TOUR.step, i: window.PMO_TOUR.index, running: window.PMO_TOUR.running,
  stage: [...document.querySelectorAll('[class*="pm6-wiz-stage"]')].filter(e=>e.classList.contains('active')).map(e=>e.className.replace('pm6-wiz-stage ','')).join(),
  practice: !!document.querySelector('.pmot-practice') }));
const waitStep = async (from, ms=9000) => { const t0=Date.now();
  while (Date.now()-t0 < ms) { const s = await st(); if (s.i !== from || !s.running) return s; await page.waitForTimeout(180); }
  return st(); };

await page.evaluate(() => window.PMO_TOUR.start({source:'test'}));
await page.waitForTimeout(1500);
let seen = [];
for (let n=0; n<20; n++) {
  const s = await st();
  if (!s.running) { console.log('FINISHED after', seen.length, 'steps'); break; }
  seen.push(s.step);
  console.log(String(n).padStart(2,'0'), JSON.stringify(s));
  await page.screenshot({ path: `evidence/tour_${String(n).padStart(2,'0')}_${s.step}.png` });
  // Show Me performs the action for us; manual steps need the explicit button.
  await page.evaluate(() => { const b=document.querySelector('#pmot [data-pmot-act="showme"]'); if(b) b.click(); });
  await page.waitForTimeout(3200);
  const manual = await page.evaluate(() => !!document.querySelector('#pmot [data-pmot-act="next"]'));
  if (manual) await page.evaluate(()=>document.querySelector('#pmot [data-pmot-act="next"]').click());
  await waitStep(s.i);
}
console.log('SEQUENCE:', seen.join(' -> '));
console.log('ERRS:', JSON.stringify(errs.slice(0,6)));
await browser.close();
