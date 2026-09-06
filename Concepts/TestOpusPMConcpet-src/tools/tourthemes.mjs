import { launch } from './drive.mjs';
const THEMES = ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark'];
const byText = (page,t) => page.evaluate(x => { const e=[...document.querySelectorAll('button,[role="button"],a')].find(b=>(b.textContent||'').trim().toLowerCase().startsWith(x.toLowerCase())&&b.offsetParent); if(e){e.click();return true;} return false; }, t);
for (const t of THEMES) {
  const { browser, page, errs } = await launch({ theme: t, width: 1600, height: 1000 });
  await page.evaluate(() => window.PMO_TOUR.start({source:'th'}));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `evidence/tt_chat_${t}.png` });          // guide card + spotlight
  // drive to the planning practice fixture
  await page.evaluate(() => window.PM_PAGES.go('wizard')); await page.waitForTimeout(900);
  await byText(page,'Brand-new product'); await page.waitForTimeout(300);
  await byText(page,'Continue'); await page.waitForTimeout(800);
  await byText(page,'Build them with the PRD Builder'); await page.waitForTimeout(1200);
  await page.evaluate(() => { const i=window.PMO_TOUR.steps.findIndex(s=>s.id==='wiz-answer'); window.PMO_TOUR.goStep(i); });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { const b=document.querySelector('.pmot-p-choice[data-arg="few"]'); if(b) b.click(); });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `evidence/tt_plan_${t}.png` });
  if (errs.length) console.log(t, 'ERRS', errs.slice(0,2));
  await browser.close();
}
console.log('tour themes captured');
