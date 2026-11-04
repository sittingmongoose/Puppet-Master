// SW-06, SW-28, SW-29: the words used by the look screen and Pip parts editor.
import { readFileSync } from 'node:fs';
const canon = JSON.parse(readFileSync(new URL('../../../../Plans/pip_parts.json', import.meta.url), 'utf8')).parts.map(({id, help}) => ({id, help}));
const targets = [["common", "tour"], ["common", "enter"], ["common", "startOver"], ["chrome", "lookMenu"], ["chrome", "sound"], ["chrome", "close"], ["chrome", "resume"], ["chrome", "lookFamily:basic"], ["chrome", "lookFamily:friendly"], ["chrome", "lookFamily:glass"], ["chrome", "lookFamily:retro"], ["chrome", "lookFamily:nier"], ["chrome", "lookMode:light"], ["chrome", "lookMode:dark"], ["chrome", "lookNier:nier"], ["chrome", "lookNierAdjust:nier-adjust"], ["welcome", "skipAll"], ["look", "pickFamily:basic"], ["look", "pickFamily:friendly"], ["look", "pickFamily:glass"], ["look", "pickFamily:retro"], ["look", "pickFamily:nier"], ["look", "group:pickMode"], ["look", "pickNier"], ["look", "adjustNier"]];
export default async function (t) {
  const f = await t.app.open({ onboarding: true, query: 'o55=screen=look' });
  await f.waitForSelector('[data-o55-do="pickFamily"][data-arg="glass"]');
  const tips = await f.evaluate((targets) => {
    const data = targets.map(([g,id]) => { const v = window.O55.tx('pip.tips.' + g)[id]; return {g,id,text:v.text,expert:v.expert}; });
    for (const [mode, key] of [['ELI5','plainShown'], ['Expert','expertShown']]) {
      window.O55.talk.set(mode, 'copy-check');
      for (const row of data) row[key] = (window.O55.tips.of(row.id, row.g) || {}).text;
    }
    return data;
  }, targets);
  t.log('SW-28 page tips: ' + JSON.stringify(tips));
  await t.check('SW-28: each common, chrome, welcome and look tip has an Expert wording', tips.length === 25 && tips.every(x => typeof x.expert === 'string' && x.expert.trim() && x.expert !== x.text && x.plainShown === x.text && x.expertShown === x.expert));
  for (const family of ['basic','friendly','glass','retro','nier']) {
    const tile = f.locator(`[data-o55-do="pickFamily"][data-arg="${family}"]`).last();
    await f.locator('[data-o55-do="pickFamily"][data-arg="basic"]').last().hover();
    await tile.hover();
    await f.waitForTimeout(1800);
    const bubble = await f.locator('.pst-bt').first().textContent();
    t.log(`SW-06 ${family}: ${bubble}`);
    const expected = await f.evaluate((family) => window.O55.pipScenes.spec(window.O55.S, {hover: 'pickFamily:' + family}).say, family);
    await t.check(`SW-06 ${family}: hover shows its preview line`, !!bubble && bubble === expected && !/am i glass now|in it goes/i.test(bubble));
  }
  const actual = await f.evaluate(() => {
    window.PM_PIP_EDITOR.popup();
    return [...document.querySelectorAll('#pipe-pop [data-pipe-part]')].map(e => ({id:e.dataset.pipePart,help:e.querySelector('.pipe-chip-help').textContent}));
  });
  t.log('SW-29 page parts: ' + JSON.stringify(actual));
  await t.check('SW-29: every displayed Pip part help matches Plans', JSON.stringify(actual) === JSON.stringify(canon));
}
