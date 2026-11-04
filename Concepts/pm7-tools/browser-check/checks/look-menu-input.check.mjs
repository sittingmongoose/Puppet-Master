// FO-56: resizing an open note, keyboard scrolling and existing note semantics.
import {reachableMenuLines} from '../helpers/look-menu-lines.mjs';
export default async function(t) {
  await t.emulate({reducedMotion:'reduce'});
  const f = await t.app.open({onboarding:true,query:'o55=screen=look'});
  await f.locator('[data-o55-do="pickFamily"][data-arg="nier"]').last().click();
  await f.locator('.o55-lookbtn').click();
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
  await t.check('FO-56 keyboard reaches every menu button inside the window', controls === 15 && reached === controls && visible);
  // The final tab reaches Adjust NieR's question; Enter opens its existing note.
  await t.page.keyboard.press('Enter');
  await t.check('FO-56 question retains expanded state, note description and screen-reader copy',await f.evaluate(() => {
    const q=document.querySelector('.o55-lookslot .o55-tipq[data-arg="lookNierAdjust:nier-adjust"]');
    const note=document.querySelector('.o55-lookslot [role="note"]');
    const option=document.querySelector('.o55-lookslot .o55-looknier-adjust');
    return q.getAttribute('aria-expanded') === 'true' && !!note && option.getAttribute('aria-describedby').split(' ').includes(note.id) && note.querySelector('.o55-sr').textContent === note.querySelector('.o55-explainer-w').textContent;
  }));
}
