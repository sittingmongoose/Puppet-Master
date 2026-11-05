// SW-42: walk the long Studio scroller in Glass Light, including its final viewport.
export default async function (t) {
  await t.viewport(1390, 900);
  const f = await t.app.open(); await t.app.look('glass-light');
  await f.locator('.pmds-entry').click();
  await f.locator('[data-pmds-tab="onboarding"]').click();
  const scroller = f.locator('#pmds-main');
  const box = await scroller.boundingBox(); if (!box) throw Error('Studio scroller missing');
  let visits = 0, bottom = false; const bad = [];
  for (; visits < 100; visits++) {
    const state = await scroller.evaluate(e => ({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight,width:e.clientWidth,wide:e.scrollWidth}));
    if (state.wide > state.width + 1) bad.push(state);
    if (state.top + state.height >= state.total - 2) { bottom = true; break; }
    await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await t.page.mouse.wheel(0, Math.max(100, state.height * .8));
    await f.waitForTimeout(200);
  }
  await t.check('long Studio scroller visited through its bottom', bottom && visits > 0, JSON.stringify({bottom,visits}), {hard:true});
  await t.check('no horizontal overflow at any visited segment', !bad.length, JSON.stringify(bad));
}
