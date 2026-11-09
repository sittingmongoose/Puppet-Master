// 6b: run the real controller's full and live census over an actual held carry. Real controls must still bind.
export default async function(t){
 await t.viewport(1280,900);await t.emulate({reducedMotion:'no-preference'});
 for(const look of ['friendly-light','friendly-dark','basic-light','basic-dark']){
  const f=await t.app.open({onboarding:true,query:'o55=fresh'});await t.app.look(look);
  await f.waitForFunction(()=>window.O55?.S?.open&&!!window.PM_HOVER_TAG_CONTROLLER);
  await f.evaluate(()=>O55.ui.go('nas-find',{noHistory:true}));
  const strip='#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg';
  await f.locator(strip+' button').first().waitFor({state:'visible'});
  const real=await f.evaluate(sel=>{const c=PM_HOVER_TAG_CONTROLLER,p=document.querySelector(sel),buttons=[...p.querySelectorAll('button')];c.scan(p);return buttons.map(e=>({prepared:!!c.prepare(e),bound:!!c.bind(e),key:e.getAttribute('data-pm-hover-key'),kind:e.getAttribute('data-pm-hover-kind')}));},strip);
  await t.check(`${look}: real selector controls keep their hover bindings`,real.length>=2&&real.every(e=>e.prepared&&e.bound&&!!e.key&&!!e.kind),JSON.stringify(real),{hard:true});
  const choice=f.locator(strip+' button').filter({hasText:'SMB'}).first(),b=await choice.boundingBox();
  await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await t.page.mouse.down();
  try{
   await f.waitForFunction(sel=>!!document.querySelector(sel+' .lg-twin'),strip,{timeout:3000});
   const state=await f.evaluate(async sel=>{const c=PM_HOVER_TAG_CONTROLLER,p=document.querySelector(sel),carry=p.querySelector('.lg-carry'),roots=[...carry.querySelectorAll('.lg-twin')],nodes=roots.flatMap(e=>[e,...e.querySelectorAll('*')]);
    const prepared=nodes.map(e=>c.prepare(e)),bound=nodes.map(e=>c.bind(e));c.scan(carry);c.enqueueLive(carry,true);await c.whenIdle();
    return {copies:roots.length,connected:roots.every(e=>e.isConnected),hidden:roots.every(e=>!!e.closest('[aria-hidden="true"]')),inert:roots.every(e=>!!e.closest('[inert]')),prepared:prepared.filter(Boolean).length,bound:bound.filter(Boolean).length,hooks:nodes.flatMap(e=>[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name)),realBound:[...p.querySelectorAll(':scope > button')].every(e=>!!e.getAttribute('data-pm-hover-key'))};
   },strip);
   await t.check(`${look}: prepare, bind, scan and live census leave real carry copies unannotated`,state.copies>=2&&state.connected&&state.hidden&&state.inert&&!state.prepared&&!state.bound&&!state.hooks.length&&state.realBound,JSON.stringify(state),{hard:true});
  }finally{await t.page.mouse.up();}
 }
}
