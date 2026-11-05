// SW-42: walk current rail panels; open every reachable historical PMMenu shelf trigger.
export default async function (t) {
  await t.viewport(1920,1080); const f = await t.app.open();
  const targets = await f.locator('#activityBar .icon[data-target]').evaluateAll(es => es.filter(e => e.getBoundingClientRect().width).map(e=>e.dataset.target));
  const rows=[]; let reached=0;
  for (const target of targets) {
    const icon=f.locator(`#activityBar .icon[data-target="${target}"]`);await icon.click();await f.waitForTimeout(500);
    // Clicking the already selected Files icon folds its panel; a second click opens it.
    if(!await f.locator('#sidePanelSlot').isVisible())await icon.click();
    await t.visible('#sidePanelSlot',target+' rail surface opened');
    await f.waitForTimeout(500);
    const ids=await f.evaluate(()=>[...document.querySelectorAll('#sidePanelSlot .sh-shelf .pm6-tb-menu-wrap')].flatMap((w,i)=>{
      const e=w.querySelector('.pm6-tb-menu-trigger'),m=w.querySelector('.pm6-tb-menu,.pm6-chat-more-menu');
      const r=e?.getBoundingClientRect(),hit=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      w.setAttribute('data-shelf-case',String(i));
      return r?.width&&r.height&&hit&&(hit===e||e.contains(hit))&&m?[i]:[];
    }));rows.push({target,reachable:ids.length});
    for(const id of ids){
      const trigger=f.locator(`[data-shelf-case="${id}"] .pm6-tb-menu-trigger`);
      await trigger.click();
      await t.check(target+' shelf '+id+' opens its menu',await trigger.getAttribute('aria-expanded')==='true','',{hard:true});
      const menu=f.locator('.pmr-menu.is-open');
      await menu.waitFor({state:'visible',timeout:5000});
      await t.check(target+' shelf '+id+' has menu items',await menu.locator('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]').count()>0,'',{hard:true});
      await t.page.keyboard.press('Escape');
      await t.check(target+' shelf '+id+' closes on Escape',await trigger.getAttribute('aria-expanded')==='false','');reached++;
    }
  }
  t.log(JSON.stringify(rows));
  await t.check('all rail targets inspected and reachable shelf menus exercised',targets.length>0&&reached>0,JSON.stringify({reached,rows}));
  await f.evaluate(()=>document.querySelectorAll('[data-shelf-case]').forEach(e=>e.removeAttribute('data-shelf-case')));
}
