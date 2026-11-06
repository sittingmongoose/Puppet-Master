// SW-42: inventory every shelf menu, including real panel tabs and expanders.
export default async function (t) {
  if (t.args.blockMenu) await t.page.addInitScript(id => {
    window.__blockedShelfMenu = 0;
    window.addEventListener('click', e => {
      if (e.target.closest?.('.pm6-tb-menu-trigger')?.getAttribute('aria-controls') === id) {
        window.__blockedShelfMenu++; e.preventDefault(); e.stopImmediatePropagation();
      }
    }, true);
  }, t.args.blockMenu);
  await t.viewport(Number(t.args.width || 1920),Number(t.args.height || 1080)); const f = await t.app.open();
  if(t.args.look) await t.app.look(t.args.look);
  // Preserve the original initial-view census; the complete routed inventory below
  // independently includes hidden tabs and collapsed shelves. Zero here is initial-only.
  const expected = {'panel-files':0,'panel-search':1,'panel-source':0,'panel-git':0,
    'panel-docker':1,'panel-testing':0,'panel-run':0,'panel-agents':0,'panel-artifacts':0};
  const expectedRouted = {
    'panel-files':['fmRootMenu'], 'panel-search':['shScopeMenu','shReplScopeMenu'], 'panel-source':['shBranchMenu'],
    'panel-git':['shDispRefCI','shDispProfCI','shDispRefDkr','shDispPlatDkr'],
    'panel-docker':['shCtxMenu'], 'panel-testing':[], 'panel-run':['rdCfgMenu','rdAfAdapter','rdSessMenu','rdBpMode'],
    'panel-agents':[], 'panel-artifacts':['shArtSort']
  };
  // Read the actual PMMenu upgrade contract from the loaded page's owner functions.
  // A selector change in product source changes discovery without a test hand list.
  const selectors = await f.evaluate(() => {
    const owner = window.PMCozeMenu;
    const read = (fn, call) => fn.toString().match(new RegExp(call + "\\('([^']+)'\\)"))?.[1];
    return {wrap: read(owner.init, 'querySelectorAll'), trigger: read(owner.upgradeWrap, 'querySelector')};
  });
  await t.check('PMMenu upgrade selectors available',!!selectors.wrap && !!selectors.trigger,JSON.stringify(selectors),{hard:true});
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
    // Inventory every wrapper PMMenu upgrades, even before its route is visible.
    const panel=f.locator(`#${target}`), exercised=new Set(), inventory=new Set();
    const tabs=await panel.locator('[role="tab"][data-tab]').evaluateAll(es=>es.filter(e=>e.checkVisibility()).map(e=>e.dataset.tab));
    for (const tab of [null,...tabs]) {
      if(tab!==null) {
        const control=panel.locator(`[role="tab"][data-tab="${tab}"]`);
        await control.click();
        await t.check(`${target} tab ${tab} active`,await control.evaluate(e=>e.classList.contains('active')||e.getAttribute('aria-selected')==='true'),'',{hard:true});
      }
      // Stable handles: the set of collapsed accordions shrinks after each click.
      const heads=await panel.locator('[data-acc] > [data-collapse]').elementHandles();
      for (let pass=0;pass<20;pass++) {
        let opened=false;
        for(const head of heads) if(await head.isVisible() && !await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open'))) {
          await head.scrollIntoViewIfNeeded(); await head.click({position:{x:8,y:8}});
          await t.check(`${target} displayed accordion expanded`,await head.evaluate(e=>e.closest('[data-acc]').classList.contains('open')),'',{hard:true});
          opened=true;
        }
        if(!opened)break;
        await t.check(`${target} accordion traversal bounded`,pass<19,'',{hard:true});
      }
      for(const head of heads)await head.dispose();
      const discover = async () => panel.locator(selectors.wrap).evaluateAll((ws,sel)=>ws.map((w,i)=>{
        const e=w.querySelector(sel);
        if(!e)return null;
        e.setAttribute('data-shelf-route',String(i));
        return {key:e.getAttribute('aria-controls'),index:i};
      }).filter(Boolean),selectors.trigger);
      const exercise = async () => {
        const candidates=await discover();
        await t.check(`${target} shelf trigger identities unique`,new Set(candidates.map(c=>c.key)).size===candidates.length,JSON.stringify(candidates),{hard:true});
        for(const c of candidates) {
          await t.check(`${target} trigger ${c.index} has stable menu identity`,!!c.key,'',{hard:true});
          inventory.add(c.key);
          const trigger=panel.locator(`[data-shelf-route="${c.index}"]`);
          if(exercised.has(c.key))continue;
          // Offscreen content can be skipped by content-visibility. Only an actual
          // hidden route excludes it; scroll into it before testing reachability.
          if(await trigger.evaluate(e=>{
            for(let a=e;a;a=a.parentElement)if(getComputedStyle(a).display==='none')return true;
            return false;
          }))continue;
          await trigger.scrollIntoViewIfNeeded();
          const scroll = await trigger.evaluate(e=>{
            for(let a=e.parentElement;a;a=a.parentElement)if(a.scrollHeight>a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY)) {
              a.setAttribute('data-shelf-scroller','');
              const r=e.getBoundingClientRect(),s=a.getBoundingClientRect();
              return {delta:r.y+r.height/2-s.y-s.height/2};
            }
          });
          if(scroll) {
            await panel.locator('[data-shelf-scroller]').hover();
            await t.page.mouse.wheel(0,scroll.delta);
            await f.waitForTimeout(150);
            await panel.locator('[data-shelf-scroller]').evaluate(e=>e.removeAttribute('data-shelf-scroller'));
          }
          await t.visible(`#${target} [data-shelf-route="${c.index}"]`,`${target} ${c.key} reachable`);
          await trigger.click();
          await t.check(`${target} ${c.key} opens its menu`,await trigger.getAttribute('aria-expanded')==='true',
            JSON.stringify({blocked:t.args.blockMenu||null,hits:await f.evaluate(()=>window.__blockedShelfMenu||0)}),{hard:true});
          const menu=f.locator('.pmr-menu.is-open');
          await menu.waitFor({state:'visible',timeout:5000});
          await t.check(`${target} ${c.key} has menu items`,await menu.locator('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]').count()>0,'',{hard:true});
          await t.page.keyboard.press('Escape');
          await t.check(`${target} ${c.key} closes on Escape`,await trigger.getAttribute('aria-expanded')==='false','',{hard:true});
          await menu.waitFor({state:'hidden',timeout:5000});
          exercised.add(c.key);
        }
      };
      await exercise();
      if(target==='panel-run' && !await panel.locator('#rdAddForm').isVisible()) {
        await panel.locator('[aria-controls="rdCfgMenu"]').click();
        await f.locator('.pmr-menu.is-open').getByRole('menuitem',{name:/Add Configuration/}).click();
        await t.check('Run Add Configuration reveals debugger selector',await panel.locator('#rdAddForm').isVisible(),'',{hard:true});
        await exercise();
      }
    }
    const row={target,tabs,inventory:[...inventory],exercised:[...exercised]};routedRows.push(row);
    await t.check(target+' routed shelf census',expectedRouted[target].every(k=>inventory.has(k)),JSON.stringify(row),{hard:true});
    await t.check(target+' complete shelf menu inventory exercised',inventory.size===exercised.size&&[...inventory].every(k=>exercised.has(k)),JSON.stringify(row),{hard:true});
  }
  await t.check('at least 14 known PMMenu identities exercised',new Set(routedRows.flatMap(r=>r.exercised)).size>=14,JSON.stringify(routedRows),{hard:true});
  t.log(JSON.stringify({initial:rows,routed:routedRows}));
  if(t.args.blockMenu) await t.check('capture blocker intercepted requested menu',await f.evaluate(()=>window.__blockedShelfMenu)>0,t.args.blockMenu,{hard:true});
  await t.check('workflow Ref route exercised',routedRows.find(r=>r.target==='panel-git')?.exercised.includes('shDispRefCI'),'',{hard:true});
  await t.check('all rail targets inspected and reachable shelf menus exercised',targets.length===Object.keys(expected).length&&reached===Object.values(expected).reduce((a,b)=>a+b,0),JSON.stringify({reached,rows}));
  await f.evaluate(()=>document.querySelectorAll('[data-shelf-case],[data-shelf-route]').forEach(e=>{e.removeAttribute('data-shelf-case');e.removeAttribute('data-shelf-route');}));
}
