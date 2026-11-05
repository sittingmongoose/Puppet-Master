// SW-42: census reachable PMMenu shelf triggers without exposing legacy hidden panels.
export default async function (t) {
  await t.viewport(1920,1080); const f = await t.app.open();
  const targets = await f.locator('#activityBar .icon[data-target]').evaluateAll(es => es.filter(e => e.getBoundingClientRect().width).map(e=>e.dataset.target));
  const rows=[]; let reachable=0;
  for (const target of targets) {
    await f.locator(`#activityBar .icon[data-target="${target}"]`).click();
    await t.visible('#sidePanelSlot',target+' rail surface opened');
    await f.waitForTimeout(500);
    const census=await f.evaluate(()=>[...document.querySelectorAll('#sidePanelSlot .sh-shelf .pm6-tb-menu-wrap')].map(w=>{
      const e=w.querySelector('.pm6-tb-menu-trigger'),m=w.querySelector('.pm6-tb-menu,.pm6-chat-more-menu');
      const r=e?.getBoundingClientRect(); const hit=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return {trigger:!!e,menu:!!m,reachable:!!(r?.width&&r.height&&hit&&(hit===e||e.contains(hit))),text:e?.textContent};
    })); rows.push({target,census}); reachable+=census.filter(x=>x.reachable).length;
  }
  t.log(JSON.stringify(rows));
  await t.check('all rail targets inspected for shelf routes',targets.length>0,String(targets.length));
  await t.check('historical PMMenu shelf triggers have no reachable route',reachable===0,JSON.stringify(rows));
}
