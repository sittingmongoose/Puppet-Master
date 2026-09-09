import { launch } from './drive.mjs';
for (const [w,h,label] of [[1100,760,'1100x760'],[880,700,'880x700'],[620,900,'620x900']]) {
  const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: w, height: h });
  for (const s of ['welcome','project','review']) {
    await page.evaluate(x => { window.PMO_ONBOARDING.open('n');
      window.PMO_FLOW.set({name:'Book club website', inherit:'tastebook'}); window.PMO_ONBOARDING.go(x); }, s);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `evidence/nw_${label}_${s}.png` });
    const r = await page.evaluate(() => {
      const win = document.querySelector('.pmo-window').getBoundingClientRect();
      const sc = document.querySelector('.pmo-scroll'), st = sc.querySelector('.pmo-step');
      const foot = document.querySelector('.pmo-foot').getBoundingClientRect();
      const acts = document.querySelector('.pmo-foot-actions').getBoundingClientRect();
      sc.scrollTop = sc.scrollHeight;
      const last = st.lastElementChild.getBoundingClientRect();
      const box = sc.getBoundingClientRect();
      const reachable = last.bottom <= box.bottom + 3;
      sc.scrollTop = 0;
      return { winFits: win.width <= innerWidth + 1 && win.height <= innerHeight + 1,
               actionsOnScreen: acts.right <= innerWidth + 1 && acts.left >= -1,
               footerBelowBody: foot.top >= box.bottom - 2, reachable };
    });
    console.log(label, s.padEnd(8), JSON.stringify(r));
  }
  if (errs.length) console.log(label, 'ERRS', errs.slice(0,2));
  await browser.close();
}
