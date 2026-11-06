import {writeFile} from 'node:fs/promises';
import {LOOKS} from '../browser-check.config.mjs';
export default async function(t){
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>window.O55?.S?.open);const rows=[];
 for(const look of (t.args.look?String(t.args.look).split(','):LOOKS)){
  await t.page.mouse.move(2,2);await f.evaluate(v=>O55.ui.applyLook(...v),look.split('-'));await f.waitForTimeout(1600);
  await f.evaluate(()=>{O55.ui.go('s-ready',{noHistory:true});const sv=O55.S.sess.server;sv.candidates=[{id:'review-guest',name:'Review phone',gen:sv.pairGen,state:'waiting',confirmed:false}];sv.runOk={'review-guest':true};sv.pairUntil=Date.now()+300000;O55.ui.refresh();});await f.waitForTimeout(1200);
  const c=f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="match"]');await t.check(`Server guest-match exists ${look}`,await c.count()===1);if(!await c.count())continue;
  for(const checked of [false,true]){
   await f.evaluate(v=>{O55.S.sess.server.candidates[0].confirmed=v;O55.ui.refresh();},checked);await c.scrollIntoViewIfNeeded();
   const p=await c.evaluate(e=>{const s=getComputedStyle(e),f=e.querySelector('.o55-checkface'),fs=f&&getComputedStyle(f),r=e.getBoundingClientRect();return {border:s.borderTopWidth,background:s.backgroundColor,shadow:s.boxShadow,face:!!f,faceBorder:fs?.borderTopWidth,faceBackground:fs?.backgroundColor,checked:e.getAttribute('aria-checked'),rect:{x:r.x,y:r.y,width:r.width,height:r.height}};});
   await t.check(`Server guest-match keeps painted checkbox ring ${look} ${checked}`,parseFloat(p.border)>0||parseFloat(p.faceBorder)>0||p.shadow!=='none',JSON.stringify(p));
   if(t.args.shots)await t.crop(`${look}-guest-${checked}`,{x:p.rect.x-5,y:p.rect.y-5,width:p.rect.width+10,height:p.rect.height+10},'Server guest confirmation checkbox: ring and checked fill compare against control.');
   rows.push({look,checked,paint:p,ax:await c.ariaSnapshot()});
  }
 }
 if(t.args.dataOut)await writeFile(String(t.args.dataOut),JSON.stringify(rows,null,2));
}
