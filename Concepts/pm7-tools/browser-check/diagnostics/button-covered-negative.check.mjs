// FO-82: an adversarial cover inside the initialized onboarding modal must fail the press guard.
// The cover goes into the modal root only after onboarding opens, so the modal's inert handling
// (which makes the page outside it inert) cannot neutralize it. The guard's failures are accepted
// only when the FO-82 checks pass: the cover is live (not inert, takes pointer events) and owns the
// tested points, no trial reached a native press, the guard refused every covered trial, and a
// native click at the tested point lands on the cover.
// Expected result: one "FO-73 only proven fractional own-scroller clip" failure per tested button
// (nine at the defaults basic-light / no-preference / safe / top-1) and every other check passing.
// Any other failure, or a passing guard check, means this run proves nothing.
// Self-test: --set coverIn=body-early repeats the old placement (a <body> child added before the
// modal opens, which the modal then makes inert); the first FO-82 check must fail and stop the run.
import original from '../checks/button-press-edges.check.mjs';
import {writeFile} from 'node:fs/promises';
const GUARD='FO-73 only proven fractional own-scroller clip ';
const COVER='fo82-modal-cover';
export default async function(t){
 t.args.look??='basic-light';t.args.motion??='no-preference';t.args.screen??='safe';t.args.point??='top-1';
 const open=t.app.open,check=t.check,guard=[];let f=null;
 t.check=function(name,ok,...rest){if(String(name).startsWith(GUARD))guard.push({name,ok:!!ok});return check.call(this,name,ok,...rest);};
 t.app.open=async(...args)=>{
  f=await open.apply(t.app,args);
  const make=([id,where])=>{const c=document.createElement('div');c.id=id;c.setAttribute('aria-hidden','true');
   c.style.cssText='position:fixed;inset:0;pointer-events:auto;background:transparent;z-index:2147483647';
   (where==='modal'?O55.S.root:document.body).appendChild(c);};
  const where=String(t.args.coverIn||'modal');
  if(where==='body-early')await f.evaluate(make,[COVER,where]);
  await f.waitForFunction(()=>window.O55?.S?.open&&O55.S.root?.isConnected,null,{timeout:30000});
  if(where==='modal')await f.evaluate(make,[COVER,where]);
  const pre=await f.evaluate(id=>{
   const root=O55.S.root,c=document.getElementById(id);
   // Count native presses that reach the page while the guard runs: a covered trial must not press.
   window.__fo82Downs=0;window.addEventListener('pointerdown',e=>{if(e.isTrusted)window.__fo82Downs++;},true);
   const r=root.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   return {where:c.parentElement===root?'modal root':c.parentElement?.tagName,inRoot:root.contains(c),rootInert:root.inert||!!root.closest('[inert]'),inert:c.inert||!!c.closest('[inert]'),pointerEvents:getComputedStyle(c).pointerEvents,visible:c.checkVisibility(),hit:hit?.id||hit?.tagName};
  },COVER);
  await t.check('FO-82 cover sits inside the initialized modal, not inert, and owns its point',pre.inRoot&&!pre.rootInert&&!pre.inert&&pre.pointerEvents!=='none'&&pre.visible&&pre.hit===COVER,JSON.stringify(pre),{hard:true});
  return f;
 };
 try{
  await original(t);
  const c=f.locator('#pm-o55-onboarding .o55-foot button.o55-btn').first();await c.scrollIntoViewIfNeeded();const b=await c.boundingBox();
  const own=await c.evaluate((e,id)=>{const r=e.getBoundingClientRect(),cover=document.getElementById(id),hit=document.elementFromPoint(r.x+r.width/2,r.y+1);
   return {hit:hit?.id||hit?.tagName,inert:!cover||cover.inert||!!cover.closest('[inert]'),pointerEvents:cover&&getComputedStyle(cover).pointerEvents,downs:window.__fo82Downs};},COVER);
  await t.check('FO-82 cover still owns the tested point and is not inert',own.hit===COVER&&!own.inert&&own.pointerEvents!=='none',JSON.stringify(own));
  await t.check('FO-82 no trial reached a native press under the cover',own.downs===0,JSON.stringify(own));
  await t.check('FO-82 the press guard refused every covered trial',guard.length>0&&guard.every(g=>!g.ok),JSON.stringify({trials:guard.length,excused:guard.filter(g=>g.ok).map(g=>g.name)}));
  await f.evaluate(()=>{window.__press.trial='adversarial-witness';window.__press.clicks=[];window.__press.downs=[];window.__press.ups=[];});
  await t.page.mouse.move(b.x+b.width/2,b.y+1);await t.page.mouse.down();await f.waitForTimeout(350);await t.page.mouse.up();
  const witness=await f.evaluate(()=>({clicks:window.__press.clicks,downs:window.__press.downs,ups:window.__press.ups}));
  await t.check('FO-82 independent native witness: the press at the tested point lands on the cover',witness.clicks.length===1&&witness.clicks[0].id===null&&witness.clicks[0].trusted,JSON.stringify(witness));
  if(t.args.inventoryOut)await writeFile(String(t.args.inventoryOut)+'.witness.json',JSON.stringify({button:b,owner:own,guard,...witness},null,2));
 }finally{t.app.open=open;t.check=check;}
}
