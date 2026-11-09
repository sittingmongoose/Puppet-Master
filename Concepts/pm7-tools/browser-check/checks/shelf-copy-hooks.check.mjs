// Stream F batch9a item6b: nine focused Basic/Friendly shelf cells (lead ruling1109090627-b3fd).
// A real held Changed press exposes arbitrary copied data hooks; real tab routes verify their authored owners.
// The full unchanged followup-routes-matrix on both surfaces belongs to final9a integration, not this focused probe.
const CASES=['basic-light','basic-dark','friendly-light','friendly-dark'].flatMap(look=>[[look,1280,900],[look,740,900]]).concat([['basic-light',1280,500]]);
export const tests={};
for(const [look,width,height] of CASES) tests[`${look} ${width}x${height}`]=async t=>{
 Object.assign(t.args,{look,width,height,codeOnly:1,depth:1});delete t.args.only;
 await t.emulate({reducedMotion:'no-preference'});
 await t.viewport(width,height);const f=await t.app.open();await t.app.look(look);
 const panel=f.locator('#panel-files');
 if(!await panel.isVisible())await f.locator('#activityBar .icon[data-target="panel-files"]').click();
 await panel.waitFor({state:'visible'});
 const first=panel.getByRole('tab').first();
 const selected=e=>e.classList.contains('active')||e.getAttribute('aria-selected')==='true';
 if(!await first.evaluate(selected))await first.click();
 await f.waitForFunction(()=>!document.querySelector('#panel-files .lg-carry'),null,{timeout:5000});
 const tabs=await panel.getByRole('tab').evaluateAll(es=>es.filter(e=>e.checkVisibility()).map((e,i)=>{e.setAttribute('data-shelf-tab',String(i));return e.dataset.tab||e.textContent.trim();}));
 await t.check('Files has its real Changed shelf tab before the alias probe',tabs.length>=2&&/changed/i.test(tabs[1]),JSON.stringify(tabs),{hard:true});
 const changed=panel.locator('[data-shelf-tab="1"]'),b=await changed.boundingBox();
 await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.page.mouse.down();
 try{
  await f.waitForFunction(()=>document.querySelector('#panel-files .lg-twin'),null,{timeout:3000});
  const state=await panel.evaluate(p=>{const copies=[...p.querySelectorAll('.lg-twin')];return {matches:p.querySelectorAll('[data-shelf-tab="1"]').length,copies:copies.length,hooks:copies.flatMap(c=>[c,...c.querySelectorAll('*')].flatMap(n=>[...n.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name))),hidden:copies.every(c=>!!c.closest('[aria-hidden="true"]')),inert:copies.every(c=>!!c.closest('[inert]'))};});
  await t.check('Changed shelf hook stays unique throughout a real held carry',state.matches===1&&state.copies>0&&state.hooks.length===0&&state.hidden&&state.inert,JSON.stringify(state),{hard:true});
 }finally{await t.page.mouse.up();}
 await f.waitForFunction(()=>!document.querySelector('#panel-files .lg-carry'),null,{timeout:5000});
 if(!await first.evaluate(selected))await first.click();
 await f.waitForFunction(()=>!document.querySelector('#panel-files .lg-carry'),null,{timeout:5000});
 // Exercise the actual authored tab controls and their panes after the held-copy probe.
 for(const tab of ['explorer','changed','open','explorer']){
  const control=panel.locator(`:scope > .pm-segtab > button[role="tab"][data-tab="${tab}"]`);
  await control.click();
  await f.waitForFunction(()=>!document.querySelector('#panel-files .lg-carry'),null,{timeout:5000});
  await f.waitForFunction(tab=>{const p=document.getElementById('panel-files'),pane=p.querySelector(`:scope > .sh-scroll > [data-pane="${tab}"]`);return !!pane?.checkVisibility()&&p.querySelector(`:scope > .pm-segtab > button[data-tab="${tab}"]`)?.classList.contains('active');},tab,{timeout:5000});
  const route=await panel.evaluate((p,tab)=>{const panes=[...p.querySelectorAll(':scope > .sh-scroll > [data-pane]')],shown=panes.filter(e=>e.checkVisibility()).map(e=>e.dataset.pane),pane=panes.find(e=>e.dataset.pane===tab);return {shown,rows:[...pane.querySelectorAll('[tabindex],button,[role="treeitem"]')].filter(e=>e.checkVisibility()&&e.getBoundingClientRect().width>0).length};},tab);
  await t.check(`real ${tab} tab selects its populated pane and hides the others`,route.shown.length===1&&route.shown[0]===tab&&route.rows>0,JSON.stringify(route),{hard:true});
 }
 const size=await t.page.evaluate(()=>({width:innerWidth,height:innerHeight}));
 await t.check('requested viewport retained',size.width===width&&size.height===height,JSON.stringify(size));
};
