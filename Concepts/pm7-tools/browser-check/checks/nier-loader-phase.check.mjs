// SW21: phase diversity belongs to each loader instance. Record control and fix on the same GPU.
export default async function(t){
 const f=await t.app.open();
 await t.page.emulateMedia({reducedMotion:'no-preference'});
 await f.evaluate(()=>{O55.studio.looks.setReduced(false);O55.studio.open('pip');});
 for(const look of ['nier-light','nier-dark']){
  await t.app.look(look);await f.locator('#o55np-reboot').waitFor({state:'hidden'});
  await t.visible('#pmds-sheet .pmds-ldwall','diamond gallery visible');
  const data=await f.locator('#pmds-sheet .pmds-ldwall [data-pip-loader]').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect(),c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.fillStyle=getComputedStyle(e.firstElementChild).color;ctx.fillRect(0,0,1,1);return{x:b.x,y:b.y,w:b.width,h:b.height,fg:[...ctx.getImageData(0,0,1,1).data].slice(0,3)};}));
  t.log(JSON.stringify({look,data}));await t.mark('measure '+look);await t.page.waitForTimeout(8400);
  const phase=()=>f.locator('#pmds-sheet .pmds-ldwall [data-pip-loader]').evaluateAll(es=>es.map(e=>{const p=2800*PMLogo.clock.speed(),a=e.firstElementChild.getAnimations()[0],u=a.effect.getComputedTiming().progress;return ((u-PMLogo.clock.phase(p))%1+1)%1;}));
  const before=await phase();await f.evaluate(()=>PM_PIP_LOADER.refresh());await t.settle();const after=await phase();t.log(JSON.stringify({look,before,after}));
  if(!t.args.control){await t.check(look+' stable per-instance offsets',before.every((v,i)=>{const a=((v-before[0])%1+1)%1,b=((after[i]-after[0])%1+1)%1;return Math.min(Math.abs(a-b),1-Math.abs(a-b))<.012;}));await t.check(look+' distinct offsets',new Set(before.map(v=>Math.round(v*100))).size===before.length);}
 }
 await f.evaluate(()=>O55.studio.looks.setReduced(true));await t.settle();
 const reduced=await f.locator('#pmds-sheet .pml-nier').evaluateAll(es=>es.map(e=>{const c=getComputedStyle(e);return{name:c.animationName,duration:c.animationDuration};}));
 await t.check('Reduced Motion keeps opacity-only breath',reduced.length>=3&&reduced.every(e=>e.name==='pml-nier-breath'&&e.duration==='2.4s'),JSON.stringify(reduced));
}
