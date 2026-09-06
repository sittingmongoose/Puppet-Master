import { launch } from './drive.mjs';
const THEMES = ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark'];
const SCREEN = process.env.SCREEN || 'where';
for (const t of THEMES) {
  const { browser, page, errs } = await launch({ theme: t, width: 1440, height: 900 });
  await page.evaluate((s) => {
    window.PMO_ONBOARDING.open('theme');
    window.PMO_FLOW.set({ name: 'Book club website', inherit: 'tastebook' });
    window.PMO_ONBOARDING.go(s);
  }, SCREEN);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `evidence/th_${SCREEN}_${t}.png` });
  if (errs.length) console.log(t, 'ERRS', errs.slice(0,2));
  await browser.close();
}
console.log('themes captured for', SCREEN);
