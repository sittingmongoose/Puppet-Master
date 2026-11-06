// FO-56: resizing an open note, keyboard scrolling and existing note semantics.
import openResizeNotes from './look-menu-open-resize.check.mjs';
import {reachableMenuLines} from '../helpers/look-menu-lines.mjs';
export default async function(t) {
  if (!t.args.inputOnly) await openResizeNotes(t);
  await t.emulate({reducedMotion:'reduce'});
  const f = await t.app.open({onboarding:true,query:'o55=screen=look'});
  await f.locator('[data-o55-do="pickFamily"][data-arg="nier"]').last().click();
  await f.locator('.o55-lookbtn').focus();
  await t.page.keyboard.press('Enter');
  await f.locator('.o55-lookslot .o55-tipq[data-arg="lookFamily:nier"]').click();
  for (const [width,height] of [[1280,500],[740,768],[1920,1080]]) {
    await t.viewport(width,height);
    const result = await reachableMenuLines(t,f,'lookFamily:nier');
    t.log(JSON.stringify({width,height,...result}));
    await t.check(`FO-56 open note stays bounded and readable after resize ${width}x${height}`,result.ok);
  }
  await t.viewport(1280,500);
  await f.locator('.o55-lookslot .o55-tipq[data-arg="lookFamily:nier"]').click();
  await t.page.keyboard.press('Escape');
  await t.check('FO-56 Escape closes menu and returns palette focus', await f.evaluate(() => !document.querySelector('.o55-lookslot .o55-lookmenu') && document.activeElement.matches('.o55-lookbtn') && document.activeElement.getAttribute('aria-expanded') === 'false'));
  await t.page.keyboard.press('Enter');
  const controls = await f.locator('.o55-lookslot .o55-lookmenu button').count();
  let reached = 0, visible = true;
  for (let i=0;i<controls;i++) {
    await t.page.keyboard.press('Tab');
    const result = await f.evaluate(() => {
      const a=document.activeElement, m=document.querySelector('.o55-lookslot .o55-lookmenu'), w=document.querySelector('.o55-win');
      const r=a.getBoundingClientRect(), mr=m.getBoundingClientRect(), wr=w.getBoundingClientRect();
      return {inside:m.contains(a), visible:r.top >= Math.max(mr.top,wr.top) && r.bottom <= Math.min(mr.bottom,wr.bottom)};
    });
    reached += Number(result.inside); visible &&= result.visible;
  }
  // Each family owns a choice and question; modes share a question; NieR adds its adjust pair.
  const expected = await f.evaluate(() => O55.LOOKS.length * 2 + new Set([...O55.MODES, 'auto']).size + 1 + (O55.theme().chosen === 'nier' ? 2 : 0));
  t.log(JSON.stringify({expected, controls, reached, visible}));
  await t.check('FO-56 keyboard reaches every menu button inside the window', controls === expected && reached === controls && visible);
  // The final tab reaches Adjust NieR's question; Enter opens its existing note.
  await t.page.keyboard.press('Enter');
  await t.check('FO-56 question retains expanded state, note description and screen-reader copy',await f.evaluate(() => {
    const q=document.querySelector('.o55-lookslot .o55-tipq[data-arg="lookNierAdjust:nier-adjust"]');
    const note=document.querySelector('.o55-lookslot [role="note"]');
    return q.getAttribute('aria-expanded') === 'true' && !!note && q.getAttribute('aria-controls') === note.id && !!q.getAttribute('aria-label') && note.querySelector('.o55-sr').textContent === note.querySelector('.o55-explainer-w').textContent;
  }));
  if (t.args.keyboardOnly) return;
  const adjust = f.locator('.o55-lookslot .o55-tipq[data-arg="lookNierAdjust:nier-adjust"]');
  await adjust.click(); // close the note opened by the keyboard case
  for (const [width,height] of [[1280,500],[740,768],[860,900],[1024,900],[1280,900],[1390,900],[1920,1080]]) {
    await t.viewport(width,height);
    for (const mode of ['light','dark']) {
      await f.locator(`.o55-lookslot [data-o55-do="lookMode"][data-arg="${mode}"]`).click();
      for (const wording of ['ELI5','Expert']) {
        await f.evaluate(m => window.O55.talk.set(m,'menu-input-check'),wording);
        await adjust.click();
        const result = await reachableMenuLines(t,f,'lookNierAdjust:nier-adjust');
        const actual = await f.evaluate(() => window.O55.theme().mode);
        t.log(JSON.stringify({width,height,mode,wording,actual,...result}));
        await t.check(`FO-56 Adjust NieR ${mode}/${wording} ${width}x${height}: every line reachable in the actual selected mode`,actual === mode && result.ok);
        await adjust.click();
      }
    }
  }

}
