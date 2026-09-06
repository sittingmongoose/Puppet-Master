import { launch } from './drive.mjs';
const SCENE = process.env.SCENE || 'route';
const MAP = { route: 'review', origin: 'begin' };
const THEMES = ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark'];
for (const t of THEMES) {
  const { browser, page } = await launch({ theme: t, width: 1500, height: 940 });
  await page.evaluate(x => { window.PMO_ONBOARDING.open('sc');
    window.PMO_FLOW.set({ name: 'Book club website', inherit: 'tastebook' });
    window.PMO_ONBOARDING.go(x); }, MAP[SCENE]);
  await page.waitForTimeout(2400);
  const el = await page.$('#pmo .pmo-plate');
  await el.screenshot({ path: `evidence/sc_${SCENE}_${t}.png` });
  await browser.close();
}
console.log(SCENE, 'captured');
