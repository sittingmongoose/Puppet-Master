// SW-06, SW-28, SW-29, FO-56, FO-57: the words used by the look screen and Pip parts editor.
import { readFileSync } from 'node:fs';
import { reachableMenuLines } from '../helpers/look-menu-lines.mjs';
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
  // Read real rendered titles after the user's header toggle, in both directions.
  await f.evaluate(() => window.O55.talk.set('ELI5', 'copy-check'));
  for (const mode of ['Expert', 'ELI5']) {
    await f.locator('.o55-talkslot .o55-talk').click();
    for (const [selector, id] of [['.o55-close', 'close'], ['.o55-soundslot .o55-sound', 'sound']]) {
      const tip = tips.find(x => x.g === 'chrome' && x.id === id)[mode === 'Expert' ? 'expert' : 'text'];
      const title = await f.locator(selector).getAttribute('title');
      await t.check(`SW-28 ${mode} actual ${id} title`, title?.endsWith('\n' + tip));
    }
  }
  // A failed copy expectation must not abort the remaining independent regressions.
  for (const [mode, key] of [['ELI5','text'], ['Expert','expert']]) {
    await f.evaluate((m) => window.O55.talk.set(m, 'copy-check'), mode);
    for (const id of ['pickFamily:basic','pickFamily:friendly','pickFamily:glass','pickFamily:retro','pickFamily:nier']) {
      const q = f.locator(`.o55-layer:not(.o55-out) .o55-tipq[data-arg="${id}"]`).last();
      await q.click();
      const row = tips.find(x => x.g === 'look' && x.id === id);
      await t.check(`SW-28 ${mode} ${id}: opened note`, await f.locator('#pm7ob-explainer .o55-sr').textContent() === row[key]);
      await q.click();
    }
  }
  for (const family of ['basic','friendly','glass','retro','nier']) {
    const tile = f.locator(`[data-o55-do="pickFamily"][data-arg="${family}"]`).last();
    await f.locator('[data-o55-do="pickFamily"][data-arg="basic"]').last().hover();
    await tile.hover();
    await f.waitForTimeout(1800);
    const bubble = await f.locator('.pst-bt').first().textContent();
    t.log(`SW-06 ${family}: ${bubble}`);
    const expected = {basic:'Clean and calm. Very tidy.',friendly:'Soft and cosy. I like it.',glass:'Ooh, shiny. Imagine me in glass!',retro:'Retro! Straight out of an old computer.',nier:'NieR? I can do stoic.'}[family];
    const scene = await f.evaluate(family => window.O55.pipScenes.spec(window.O55.S, {hover:'pickFamily:' + family}), family);
    await t.check(`FO-57 ${family}: current action routes line and face`, scene.say === expected && scene.pip.mood === {basic:'watch',friendly:'happy',glass:'wonder',retro:'happy',nier:'watch'}[family]);
    await t.check(`SW-06 ${family}: hover shows its preview line`, !!bubble && bubble === expected && !/am i glass now|in it goes/i.test(bubble));
  }
  await t.emulate({ reducedMotion: 'reduce' });
  const menuIds = ['lookFamily:basic','lookFamily:friendly','lookFamily:glass','lookFamily:retro','lookFamily:nier','lookMode:light','lookMode:dark','lookNierAdjust:nier-adjust'];
  const sizes = t.args.menuSizes ? String(t.args.menuSizes).split(',').map(s => s.split('x').map(Number)) : [[1280,500],[740,768],[860,900],[1024,900],[1280,900],[1390,900],[1920,1080]];
  for (const [width,height] of sizes) {
    await t.viewport(width,height);
    for (const family of ['basic','friendly','retro','glass','nier']) for (const themeMode of ['light','dark']) {
      await f.locator(`[data-o55-do="pickFamily"][data-arg="${family}"]`).last().click();
      await f.locator(`[data-o55-do="pickMode"][data-arg="${themeMode}"]`).last().click();
      for (const [mode,key] of [['ELI5','text'],['Expert','expert']]) {
        await f.locator(`[data-o55-do="pickMode"][data-arg="${themeMode}"]`).last().click();
        await f.evaluate(m => window.O55.talk.set(m,'copy-check'),mode);
        await f.locator('.o55-lookbtn').focus();
        await t.page.keyboard.press('Enter');
        const observations = [];
        for (const id of menuIds.filter(id => family === 'nier' || !id.startsWith('lookNierAdjust'))) {
          if (id.startsWith('lookMode:')) await f.locator(`.o55-lookslot [data-o55-do="lookMode"][data-arg="${id.split(':')[1]}"]`).click();
          if (id.startsWith('lookNierAdjust:')) await f.locator(`.o55-lookslot [data-o55-do="lookMode"][data-arg="${themeMode}"]`).click();
          const q = f.locator(`.o55-lookslot .o55-tipq[data-arg="${id}"]`);
          await q.click();
          const expected = tips.find(x => x.g === 'chrome' && x.id === id)[key];
          const inline = !await f.evaluate(() => window.O55.tips.onStage());
          const note = f.locator(inline ? '.o55-lookslot .o55-explainer-w' : '.o55-stage .pst-tip-t').last();
          const body = await note.textContent();
          const marker = await note.getAttribute('data-written');
          observations.push({id, body, expected, marker, ok:body === expected && (!inline || marker === id + '|' + mode)});
          const reach = await reachableMenuLines(t, f, id);
          observations.push(reach);
          if (width === 1280 && family === 'basic' && themeMode === 'dark' && mode === 'ELI5' && id === 'lookFamily:nier') {
            await t.shot('fo56-short-menu-wheel', 'Every NieR note line is reachable by wheel inside the stationary window');
          }
          if (id === 'lookFamily:basic') {
            for (const other of [mode === 'ELI5' ? 'Expert' : 'ELI5', mode]) {
              // Settings can change wording while this note remains open; a header click closes the menu.
              await f.evaluate(m => window.O55.talk.set(m, 'copy-check-settings'), other);
              const changed = await note.textContent();
              const target = tips.find(x => x.g === 'chrome' && x.id === id)[other === 'Expert' ? 'expert' : 'text'];
              observations.push({id, other, body:changed, expected:target, ok:changed === target && (!inline || await note.getAttribute('data-written') === id + '|' + other)});
            }
          }
          await q.click();
        }
        t.log(JSON.stringify({width,height,family,themeMode,mode,observations}));
        await t.check(`FO-56 ${width}x${height} ${family}/${themeMode} ${mode}: every note written and every painted line reachable by wheel`, observations.every(x => x.ok));
        await f.locator('.o55-lookbtn').focus();
        await t.page.keyboard.press('Enter');
      }
    }
  }
  await f.locator('.o55-close').click();
  for (const [mode,key] of [['ELI5','text'],['Expert','expert'],['ELI5','text']]) {
    await f.evaluate(m => window.O55.talk.set(m,'copy-check'),mode);
    const title = await f.locator('#o55-resume [data-o55-chip="resume"]').getAttribute('title');
    await t.check(`SW-28 ${mode}: existing Resume title refreshed`, title.endsWith('\n' + tips.find(x => x.id === 'resume')[key]));
  }
  const actual = await f.evaluate(() => {
    window.PM_PIP_EDITOR.popup();
    return [...document.querySelectorAll('#pipe-pop [data-pipe-part]')].map(e => ({id:e.dataset.pipePart,help:e.querySelector('.pipe-chip-help').textContent}));
  });
  t.log('SW-29 page parts: ' + JSON.stringify(actual));
  await t.check('SW-29: every displayed Pip part help matches Plans', JSON.stringify(actual) === JSON.stringify(canon));
}
