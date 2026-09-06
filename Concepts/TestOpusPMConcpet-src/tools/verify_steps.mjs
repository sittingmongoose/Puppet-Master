import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: 1500, height: 940 });
await page.evaluate(() => window.PMO_TOUR.start({source:'v'}));
await page.waitForTimeout(800);
const n = await page.evaluate(() => window.PMO_TOUR.steps.length);
console.log('declared steps:', n);
const rows = [];
for (let i = 0; i < n; i++) {
  await page.evaluate(x => window.PMO_TOUR.goStep(x), i);
  await page.waitForTimeout(700);
  rows.push(await page.evaluate(() => {
    const c = document.querySelector('.pmot-card');
    const spot = document.querySelector('.pmot-spot');
    return { i: window.PMO_TOUR.index, id: window.PMO_TOUR.step,
      title: (c.querySelector('.pmot-title')||{}).textContent,
      ask: !!c.querySelector('.pmot-ask'),
      showMe: !!c.querySelector('[data-pmot-act="showme"]'),
      skip: !!c.querySelector('[data-pmot-act="skip"]'),
      spotShown: spot && spot.style.display !== 'none',
      cardOnScreen: (r => r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1)(c.getBoundingClientRect()) };
  }));
}
const chapters = await page.evaluate(() => window.PMO_TOUR.steps.map(s => s.chapter));
const plan = chapters.filter(c => /Plan/.test(c)).length;
rows.forEach(r => console.log(String(r.i).padStart(2), r.id.padEnd(16),
  'ask:' + (r.ask?'y':'n'), 'showMe:' + (r.showMe?'y':'n'), 'skip:' + (r.skip?'y':'n'),
  'spot:' + (r.spotShown?'y':'n'), 'onScreen:' + (r.cardOnScreen?'y':'n'), '|', (r.title||'').slice(0,42)));
console.log('\nplanning steps:', plan, 'of', n, '=', Math.round(plan/n*100) + '%');
console.log('ERRS:', errs.slice(0,4));
await browser.close();
