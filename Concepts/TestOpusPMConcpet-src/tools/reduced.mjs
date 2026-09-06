import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', reduced: true, width: 1440, height: 900 });
await page.evaluate(() => window.PMO_ONBOARDING.open('rm'));
await page.waitForTimeout(120);
// with motion reduced, the beat should already be readable almost immediately
const early = await page.evaluate(() => {
  const kids = [...document.querySelectorAll('#pmo .pmo-step > *')];
  return { n: kids.length, minOpacity: Math.min(...kids.map(k => +getComputedStyle(k).opacity)) };
});
console.log('120ms after open:', JSON.stringify(early));
await page.evaluate(() => window.PMO_ONBOARDING.go('where'));
await page.waitForTimeout(120);
console.log('120ms after beat change:', JSON.stringify(await page.evaluate(() => {
  const kids = [...document.querySelectorAll('#pmo .pmo-step > *')];
  return { n: kids.length, minOpacity: Math.min(...kids.map(k => +getComputedStyle(k).opacity)),
           sequenceIntact: kids.map(k=>k.className.split(' ')[0]) };
})));
await page.screenshot({ path: 'evidence/rm_onboarding.png' });
// tour under reduced motion
await page.evaluate(() => { window.PMO_ONBOARDING.close('rm'); });
await page.waitForTimeout(500);
await page.evaluate(() => window.PMO_TOUR.start({source:'rm'}));
await page.waitForTimeout(900);
console.log('tour card visible:', await page.evaluate(() => {
  const c = document.querySelector('.pmot-card'); return c ? +getComputedStyle(c).opacity : null; }));
await page.evaluate(() => document.querySelector('#pmot [data-pmot-act="showme"]').click());
await page.waitForTimeout(1400);
console.log('after showme, step:', await page.evaluate(() => window.PMO_TOUR.step));
await page.screenshot({ path: 'evidence/rm_tour.png' });
console.log('ERRS:', errs.slice(0,4));
await browser.close();
