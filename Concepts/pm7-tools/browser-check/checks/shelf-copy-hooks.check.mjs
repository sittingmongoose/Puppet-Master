// Stream F batch9a item6b: the same shelf function/route assertions as followup-routes-matrix, in the nine
// Basic/Friendly cells the lead requested. A real held Changed-tab press makes temporary hook aliasing deterministic.
// The page, viewport, look, codeOnly and depth match the matrix; no menu/edge/context assertion is changed or skipped.
import shelf from './shelf-route.check.mjs';
const CASES=['basic-light','basic-dark','friendly-light','friendly-dark'].flatMap(look=>[[look,1280,900],[look,740,900]]).concat([['basic-light',1280,500]]);
export const tests={};
for(const [look,width,height] of CASES) tests[`${look} ${width}x${height}`]=async t=>{
 Object.assign(t.args,{look,width,height,codeOnly:1,depth:1});delete t.args.only;
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
 // Reload through the original function, just as the parent matrix does, and retain its full shelf coverage.
 await shelf(t);
 const size=await t.page.evaluate(()=>({width:innerWidth,height:innerHeight}));
 await t.check('requested viewport retained',size.width===width&&size.height===height,JSON.stringify(size));
};
