// A bounded adversarial cover, unrelated to a scroll clip: hide only the top 2.5px of enabled footer buttons.
import original from '../checks/button-press-edges.check.mjs';
import {writeFile} from 'node:fs/promises';
export default async function(t){
 const open=t.app.open;
 t.app.open=async(...args)=>{const f=await open.apply(t.app,args);await f.evaluate(()=>{
  const layer=document.createElement('div');layer.id='reviewer-footer-edge-covers';layer.setAttribute('aria-hidden','true');layer.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2147483647';document.body.appendChild(layer);
  const tick=()=>{const buttons=[...document.querySelectorAll('#pm-o55-onboarding .o55-foot button.o55-btn:not([aria-disabled="true"])')].filter(b=>b.checkVisibility());while(layer.children.length<buttons.length)layer.appendChild(document.createElement('div'));while(layer.children.length>buttons.length)layer.lastElementChild.remove();buttons.forEach((b,i)=>{const r=b.getBoundingClientRect();layer.children[i].className='reviewer-footer-top-cover';layer.children[i].style.cssText=`position:fixed;pointer-events:auto;background:transparent;left:${r.x}px;top:${r.y}px;width:${r.width}px;height:2.5px`;});requestAnimationFrame(tick);};tick();
 });return f;};
 try{await original(t);const f=t.root===t.page?t.page.mainFrame():t.root,c=f.locator('#pm-o55-onboarding .o55-foot button.o55-btn').first();await c.scrollIntoViewIfNeeded();const b=await c.boundingBox();await f.evaluate(()=>{window.__press.trial='adversarial-witness';window.__press.clicks=[];window.__press.downs=[];window.__press.ups=[];});await t.page.mouse.move(b.x+b.width/2,b.y+1);await t.page.mouse.down();await f.waitForTimeout(350);await t.page.mouse.up();const witness=await f.evaluate(()=>({clicks:window.__press.clicks,downs:window.__press.downs,ups:window.__press.ups}));await t.check('Independent witness confirms blocked footer top edge',witness.clicks.length===1&&witness.clicks[0].id===null&&witness.clicks[0].trusted,JSON.stringify(witness));if(t.args.inventoryOut)await writeFile(String(t.args.inventoryOut)+'.witness.json',JSON.stringify({button:b,...witness},null,2));}finally{t.app.open=open;}
}
