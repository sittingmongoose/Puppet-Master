// SW-42: inventory every shelf menu, including real panel tabs and expanders.
export default async function (t) {
  await t.viewport(Number(t.args.width || 1920),Number(t.args.height || 1080)); const f = await t.app.open();
  if(t.args.look) await t.app.look(t.args.look);
  // Preserve the original initial-view census; the complete routed inventory below
  // independently includes hidden tabs and collapsed shelves. Zero here is initial-only.
  const expected = {'panel-files':0,'panel-search':1,'panel-source':0,'panel-git':0,
    'panel-docker':1,'panel-testing':0,'panel-run':0,'panel-agents':0,'panel-artifacts':0};
  const expectedRouted = {
    'panel-files':[], 'panel-search':['shScopeMenu','shReplScopeMenu'], 'panel-source':[],
    'panel-git':['shDispRefCI','shDispProfCI','shDispRefDkr','shDispPlatDkr'],
    'panel-docker':['shCtxMenu'], 'panel-testing':[], 'panel-run':['rdSessMenu','rdBpMode'],
    'panel-agents':[], 'panel-artifacts':[]
  };
  if (t.args.selftest === 'docker') await f.evaluate(() => {
    window.__blockedDocker = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('#activityBar .icon[data-target="panel-docker"]')) {
        window.__blockedDocker++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  });
  if (t.args.blockMenu) await f.evaluate(id => {
    window.__blockedShelfMenu = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('.pm6-tb-menu-trigger')?.getAttribute('aria-controls') === id) {
        window.__blockedShelfMenu++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  }, t.args.blockMenu);
  const targets = await f.locator('#activityBar .icon[data-target]').evaluateAll(es => es.filter(e => e.getBoundingClientRect().width).map(e=>e.dataset.target));
  await t.check('expected activity routes present', JSON.stringify([...targets].sort()) === JSON.stringify(Object.keys(expected).sort()), JSON.stringify(targets), {hard:true});
  const rows=[]; let reached=0; const routedRows=[];
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
    // Visit every real panel tab, including those whose initial DOM has no menu.
    // Inventory is independent of visibility: a new hidden menu cannot silently
    // disappear from coverage when its tab/expander stops working.
    const panel=f.locator(`#${target}`), exercised=new Set(), inventory=new Set();
    const tabs=await panel.locator('[role="tab"][data-tab]').evaluateAll(es=>es.map(e=>e.dataset.tab));
    for (const tab of [null,...tabs]) {
      if(tab!==null) {
        const control=panel.locator(`[role="tab"][data-tab="${tab}"]`);
        await control.click();
        await t.check(`${target} tab ${tab} active`,await control.evaluate(e=>e.classList.contains('active')||e.getAttribute('aria-selected')==='true'),'',{hard:true});
      }
      const candidates=await panel.locator('.sh-shelf .pm6-tb-menu-trigger').evaluateAll(es=>es.map((e,i)=>{
        const key=e.getAttribute('aria-controls');
        e.setAttribute('data-shelf-route',String(i));
        return {key,index:i,pane:e.closest('[data-pane]')?.getAttribute('data-pane')};
      }));
      await t.check(`${target} shelf trigger identities unique`,new Set(candidates.map(c=>c.key)).size===candidates.length,JSON.stringify(candidates),{hard:true});
      for(const c of candidates) {
        await t.check(`${target} trigger ${c.index} has stable menu identity`,!!c.key,'',{hard:true});
        inventory.add(c.key);
        if(exercised.has(c.key)||(c.pane&&c.pane!==tab))continue;
        const trigger=panel.locator(`[data-shelf-route="${c.index}"]`);
        // Read ancestry only; change state exclusively through real clicks.
        const ancestors=await trigger.evaluate(e=>{
          const out=[];
          for(let a=e.parentElement;a&&!a.classList.contains('side-panel-view');a=a.parentElement)
            if(a.matches('[data-acc]'))out.unshift(a);
          return out.map((a,i)=>{a.setAttribute('data-shelf-expand',String(i));return i;});
        });
        for(const id of ancestors) {
          const acc=panel.locator(`[data-shelf-expand="${id}"]`);
          if(!await acc.evaluate(e=>e.classList.contains('open')))await acc.locator(':scope > [data-collapse]').click();
          await t.check(`${target} ${c.key} ancestor ${id} expanded`,await acc.evaluate(e=>e.classList.contains('open')),'',{hard:true});
        }
        await trigger.scrollIntoViewIfNeeded();
        await t.visible(`#${target} [data-shelf-route="${c.index}"]`,`${target} ${c.key} reachable`);
        await trigger.click();
        await t.check(`${target} ${c.key} opens its menu`,await trigger.getAttribute('aria-expanded')==='true',
          JSON.stringify({blocked:t.args.blockMenu||null,hits:await f.evaluate(()=>window.__blockedShelfMenu||0)}),{hard:true});
        const menu=f.locator('.pmr-menu.is-open');
        await menu.waitFor({state:'visible',timeout:5000});
        await t.check(`${target} ${c.key} has menu items`,await menu.locator('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]').count()>0,'',{hard:true});
        await t.page.keyboard.press('Escape');
        await t.check(`${target} ${c.key} closes on Escape`,await trigger.getAttribute('aria-expanded')==='false','',{hard:true});
        exercised.add(c.key);
        await panel.locator('[data-shelf-expand]').evaluateAll(es=>es.forEach(e=>e.removeAttribute('data-shelf-expand')));
      }
    }
    const row={target,tabs,inventory:[...inventory],exercised:[...exercised]};routedRows.push(row);
    await t.check(target+' routed shelf census',JSON.stringify([...inventory].sort())===JSON.stringify([...expectedRouted[target]].sort()),JSON.stringify(row),{hard:true});
    await t.check(target+' complete shelf menu inventory exercised',inventory.size===exercised.size&&[...inventory].every(k=>exercised.has(k)),JSON.stringify(row),{hard:true});
  }
  t.log(JSON.stringify({initial:rows,routed:routedRows}));
  await t.check('workflow Ref route exercised',routedRows.find(r=>r.target==='panel-git')?.exercised.includes('shDispRefCI'),'',{hard:true});
  await t.check('all rail targets inspected and reachable shelf menus exercised',targets.length===Object.keys(expected).length&&reached===Object.values(expected).reduce((a,b)=>a+b,0),JSON.stringify({reached,rows}));
  await f.evaluate(()=>document.querySelectorAll('[data-shelf-case],[data-shelf-route]').forEach(e=>{e.removeAttribute('data-shelf-case');e.removeAttribute('data-shelf-route');}));
}
