import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: 1500, height: 940 });
await page.evaluate(() => window.PMO_TOUR.start({source:'v'}));
await page.waitForTimeout(800);
// jump straight into a planning step whose target is not on screen
await page.evaluate(() => { const i=window.PMO_TOUR.steps.findIndex(s=>s.id==='wiz-answer'); window.PMO_TOUR.goStep(i); });
await page.waitForTimeout(900);
const lost = await page.evaluate(() => ({
  lost: document.querySelector('.pmot-card').getAttribute('data-lost'),
  recoveryVisible: getComputedStyle(document.querySelector('.pmot-lost')).display !== 'none',
  spotHidden: document.querySelector('.pmot-spot').style.display === 'none' }));
console.log('stranded step:', JSON.stringify(lost));
await page.screenshot({ path: 'evidence/recovery_01_lost.png' });
await page.evaluate(() => document.querySelector('[data-pmot-act="reveal"]').click());
await page.waitForTimeout(5200);
const back = await page.evaluate(() => ({
  lost: document.querySelector('.pmot-card').getAttribute('data-lost'),
  spotShown: document.querySelector('.pmot-spot').style.display !== 'none',
  practice: !!document.querySelector('.pmot-practice'),
  page: (document.querySelector('.primary-content > .page.active')||{className:''}).className }));
console.log('after recovery:', JSON.stringify(back));
await page.screenshot({ path: 'evidence/recovery_02_recovered.png' });
console.log('ERRS:', errs.slice(0,4));
await browser.close();
