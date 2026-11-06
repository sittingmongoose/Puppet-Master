import {writeFile} from 'node:fs/promises';
import {LOOKS} from '../browser-check.config.mjs';
export default async function(t){
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>window.O55?.S?.open);
 const records=[];
 for(const look of (t.args.look?String(t.args.look).split(','):LOOKS)){
  await t.page.mouse.move(2,2);await f.evaluate(v=>O55.ui.applyLook(...v),look.split('-'));await f.waitForTimeout(1600);
  for(const motion of (t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'])){
   await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
   await f.evaluate(m=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');Object.assign(O55.S.sess.server,{claimed:false,orClaimReq:true,orClaimOk:true,orBootOk:true,orRunOk:true,selfConfirmed:false});O55.ui.go('s-confirm',{noHistory:true});},motion);
   await f.waitForTimeout(1200);
   for(const checked of [false,true]){
    await f.evaluate(c=>{O55.S.sess.server.selfConfirmed=c;O55.ui.refresh();},checked);
    const sel='#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="selfMatch"]',c=f.locator(sel);
    await t.check(`Server self-match control exists ${look} ${motion} ${checked}`,await c.count()===1);
    if(!await c.count())continue;await c.scrollIntoViewIfNeeded();
    const paint=await c.evaluate(e=>{const s=getComputedStyle(e),face=e.querySelector('.o55-checkface'),fs=face&&getComputedStyle(face),b=e.getBoundingClientRect();return {border:s.borderTopWidth,background:s.backgroundColor,shadow:s.boxShadow,color:s.color,face:!!face,faceBorder:fs?.borderTopWidth,faceBackground:fs?.backgroundColor,children:e.innerHTML,checked:e.getAttribute('aria-checked'),rect:{x:b.x,y:b.y,width:b.width,height:b.height}};});
    const tag=`${look}-${motion}-${checked}`,ax=await c.ariaSnapshot();
    const border=parseFloat(paint.border)>0||parseFloat(paint.faceBorder)>0;
    await t.check(`Server self-match keeps painted checkbox ring ${tag}`,border||paint.shadow!=='none',JSON.stringify(paint));
    if(t.args.shots&&motion==='no-preference')await t.crop(tag,{x:paint.rect.x-5,y:paint.rect.y-5,width:paint.rect.width+10,height:paint.rect.height+10},'Server self-confirmation checkbox, checked and unchecked; compare native control versus fixed build without resizing.');
    records.push({look,motion,checked,paint,ax});
   }
  }
 }
 if(t.args.dataOut)await writeFile(String(t.args.dataOut),JSON.stringify(records,null,2));
}
