import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: 1500, height: 940 });
const byText = async t => page.evaluate(x => { const e=[...document.querySelectorAll('button,[role="button"],a')].find(b=>(b.textContent||'').trim().toLowerCase().startsWith(x.toLowerCase())&&b.offsetParent); if(e){e.click();return true;} return false; }, t);
await page.evaluate(() => window.PMO_TOUR.start({source:'v'}));
await page.waitForTimeout(700);
await page.evaluate(() => window.PM_PAGES.go('wizard'));
await page.waitForTimeout(900);
await byText('Brand-new product'); await page.waitForTimeout(300);
await byText('Continue'); await page.waitForTimeout(800);
await byText('Build them with the PRD Builder'); await page.waitForTimeout(1200);
await page.evaluate(() => { const i=window.PMO_TOUR.steps.findIndex(s=>s.id==='wiz-answer'); window.PMO_TOUR.goStep(i); });
await page.waitForTimeout(900);

const rows = () => page.evaluate(() => [...document.querySelectorAll('.pmot-p-row')].map(r => ({
  text: r.textContent.trim().slice(0, 44),
  rect: (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(r.getBoundingClientRect()),
  anim: getComputedStyle(r).animationName })));

// answer "A few organisers"
await page.evaluate(() => document.querySelector('.pmot-p-choice[data-arg="few"]').click());
await page.waitForTimeout(60);
const during = await rows();
await page.waitForTimeout(900);
const after = await rows();

console.log('rows after answering:', after.length);
console.log('animating DURING the change:');
during.forEach(r => console.log('   ', r.anim === 'none' ? 'still  ' : 'ANIMATE', '|', r.text));
const settledBefore = after.slice(0,3).map(r => JSON.stringify(r.rect));

// now change to "Only me" and check the three agreed outcomes do not move
await page.evaluate(() => document.querySelector('.pmot-p-choice[data-arg="me"]').click());
await page.waitForTimeout(60);
const during2 = await rows();
await page.waitForTimeout(900);
const after2 = await rows();
const settledAfter = after2.slice(0,3).map(r => JSON.stringify(r.rect));

console.log('\nafter switching to "Only me": rows =', after2.length);
console.log('animating DURING the switch:');
during2.forEach(r => console.log('   ', r.anim === 'none' ? 'still  ' : 'ANIMATE', '|', r.text));
console.log('\nthe three agreed outcomes kept identical geometry:',
  JSON.stringify(settledBefore) === JSON.stringify(settledAfter));
console.log('ERRS:', errs.slice(0,4));
await browser.close();
