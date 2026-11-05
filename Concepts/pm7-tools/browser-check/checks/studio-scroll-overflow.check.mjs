// SW-42: walk the long Studio scroller in Glass Light, including its final viewport.
export default async function (t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open(); await t.app.look('glass-light');
  // The retained historical looks summary identifies Home's whole-page audit as partial.
  // browser-check caps the unscoped probe at eight scrollers and twelve stops; scope each
  // visible scroller at every viewport so that cap cannot silently skip its middle.
  const paths = await f.evaluate(() => {
    const nodes = [document.scrollingElement, ...document.querySelectorAll('body *')].filter((e,i,a) => a.indexOf(e) === i && e.clientHeight > 40 && e.scrollHeight > e.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.checkVisibility({visibilityProperty:true}));
    return nodes.map(e=>{const path=[];for(let n=e;n&&n.nodeType===1;n=n.parentElement){const tag=n.tagName.toLowerCase();const siblings=n.parentElement?[...n.parentElement.children].filter(x=>x.tagName===n.tagName):[n];path.unshift(tag+':nth-of-type('+(siblings.indexOf(n)+1)+')');}return path.join(' > ');});
  });
  await t.check('Home has visible scrollers to audit', paths.length > 0, String(paths.length), {hard:true});
  t.log('Home visible scrollers: '+paths.length);
  try {
    for (let i=0;i<paths.length;i++) {
      const selector=paths[i], e=f.locator(selector); await e.scrollIntoViewIfNeeded();
      const r=await e.boundingBox(); if(!r)throw Error('Scroller vanished');
      await t.page.mouse.move(r.x+r.width/2,r.y+Math.min(r.height/2,200)); await t.page.mouse.wheel(0,-100000); await f.waitForTimeout(100);
      let done=false;
      for(let n=0;n<200;n++) {
        await t.noOverflow(`Home scroller ${i} segment ${n}`,{scope:selector});
        const pos=await e.evaluate(x=>({top:x.scrollTop,height:x.clientHeight,total:x.scrollHeight}));
        if(pos.top+pos.height>=pos.total-2){done=true;break;}
        await t.page.mouse.wheel(0,Math.max(40,Math.min(pos.height,900)*.8)); await f.waitForTimeout(100);
      }
      await t.check('Home scroller '+i+' reached bottom',done,'',{hard:true});
    }
  } finally { /* Scoped probes restore their scroll positions themselves. */ }
  await t.viewport(1390,900);
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
