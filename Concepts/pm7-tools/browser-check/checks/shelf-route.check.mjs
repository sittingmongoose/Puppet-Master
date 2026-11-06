// SW-42: walk current rail panels; open every reachable historical PMMenu shelf trigger.
export default async function (t) {
  await t.viewport(Number(t.args.width || 1920),Number(t.args.height || 1080)); const f = await t.app.open();
  if(t.args.look) await t.app.look(t.args.look);
  // Explicit per-route census: zero is intentional for panels whose shelf has no menu.
  const expected = {'panel-files':0,'panel-search':1,'panel-source':0,'panel-git':0,
    'panel-docker':1,'panel-testing':0,'panel-run':0,'panel-agents':0,'panel-artifacts':0};
  if (t.args.selftest === 'docker') await f.evaluate(() => {
    window.__blockedDocker = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('#activityBar .icon[data-target="panel-docker"]')) {
        window.__blockedDocker++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  });
  const targets = await f.locator('#activityBar .icon[data-target]').evaluateAll(es => es.filter(e => e.getBoundingClientRect().width).map(e=>e.dataset.target));
  await t.check('expected activity routes present', JSON.stringify([...targets].sort()) === JSON.stringify(Object.keys(expected).sort()), JSON.stringify(targets), {hard:true});
  const rows=[]; let reached=0;
  for (const target of targets) {
    const icon=f.locator(`#activityBar .icon[data-target="${target}"]`);await icon.click();await f.waitForTimeout(500);
    // Clicking the already selected Files icon folds its panel; a second click opens it.
    if(!await f.locator('#sidePanelSlot').isVisible())await icon.click();
    const active = await f.evaluate(target => ({
      panel: document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id,
      icon: document.querySelector('#activityBar .icon.active[data-target]')?.dataset.target,
      blockedDocker: window.__blockedDocker || 0
    }), target);
    await t.check(target+' requested panel active', active.panel === target && active.icon === target,
      JSON.stringify(active), {hard:true});
    await t.visible('#sidePanelSlot',target+' rail surface opened');
    await f.waitForTimeout(500);
    const ids=await f.evaluate(()=>[...document.querySelectorAll('#sidePanelSlot .sh-shelf .pm6-tb-menu-wrap')].flatMap((w,i)=>{
      const e=w.querySelector('.pm6-tb-menu-trigger'),m=w.querySelector('.pm6-tb-menu,.pm6-chat-more-menu');
      const r=e?.getBoundingClientRect(),hit=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      w.setAttribute('data-shelf-case',String(i));
      return r?.width&&r.height&&hit&&(hit===e||e.contains(hit))&&m?[i]:[];
    }));rows.push({target,reachable:ids.length});
    await t.check(target+' expected shelf menu census', Object.hasOwn(expected,target) && ids.length === expected[target],
      JSON.stringify({expected:expected[target],actual:ids.length}), {hard:true});
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
  await t.check('all rail targets inspected and reachable shelf menus exercised',targets.length===Object.keys(expected).length&&reached===Object.values(expected).reduce((a,b)=>a+b,0),JSON.stringify({reached,rows}));
  await f.evaluate(()=>document.querySelectorAll('[data-shelf-case]').forEach(e=>e.removeAttribute('data-shelf-case')));
}
