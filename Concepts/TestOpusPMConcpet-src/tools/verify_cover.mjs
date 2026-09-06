import { launch } from './drive.mjs';
const byText = (page,t) => page.evaluate(x => { const e=[...document.querySelectorAll('button,[role="button"],a')].find(b=>(b.textContent||'').trim().toLowerCase().startsWith(x.toLowerCase())&&b.offsetParent); if(e){e.click();return true;} return false; }, t);
for (const w of [[1600,1000],[1440,900],[1280,860]]) {
  const { browser, page } = await launch({ theme: 'friendly-dark', width: w[0], height: w[1] });
  await page.evaluate(() => window.PMO_TOUR.start({source:'v'}));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.PM_PAGES.go('wizard')); await page.waitForTimeout(900);
  await byText(page,'Brand-new product'); await page.waitForTimeout(300);
  await byText(page,'Continue'); await page.waitForTimeout(800);
  await byText(page,'Build them with the PRD Builder'); await page.waitForTimeout(1200);
  const out = [];
  for (const id of ['wiz-goal','wiz-answer','wiz-consequence','wiz-review','wiz-boundary']) {
    await page.evaluate(x => { const i=window.PMO_TOUR.steps.findIndex(s=>s.id===x); window.PMO_TOUR.goStep(i); }, id);
    await page.waitForTimeout(1100);
    out.push(await page.evaluate(x => {
      const card = document.querySelector('.pmot-card').getBoundingClientRect();
      const proj = document.querySelector('.pm6-wiz-prdpreview');
      if (!proj) return { id: x, proj: 'missing' };
      const p = proj.getBoundingClientRect();
      const ow = Math.max(0, Math.min(card.right,p.right)-Math.max(card.left,p.left));
      const oh = Math.max(0, Math.min(card.bottom,p.bottom)-Math.max(card.top,p.top));
      return { id: x, coveredPct: Math.round((ow*oh)/(p.width*p.height)*100) };
    }, id));
  }
  console.log(w.join('x'), out.map(o => o.id.replace('wiz-','') + ':' + (o.proj || o.coveredPct + '%')).join('  '));
  await browser.close();
}
