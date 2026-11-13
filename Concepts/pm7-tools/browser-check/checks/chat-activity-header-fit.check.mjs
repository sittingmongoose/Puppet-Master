// FO-193. Tool stopping bar: only a reproduced real false pass or product bug stops;
// other tool findings go to the project's TOOL-ISSUES list.
// First run main with --set geometry=<json>; run head with --set reference=<same json>.
// Both runs exercise the entire matrix even when assertions fail. Completed has no caption by design.
import {LOOKS} from '../browser-check.config.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const HEAD='#pmRoot .working-card[data-card="primary"] .working-head';
export default async function(t){
 const f=await t.app.open();
 await f.evaluate(()=>{PMW.chatCol.show();PM56_DEMO.selectThread('query');PM56_DEMO.pauseWorking();PM56_DEMO.setVariant(2,1);});
 const reference=t.args.reference?JSON.parse(readFileSync(t.args.reference,'utf8')):null, geometry={};
 for(const look of LOOKS){
  await t.app.look(look);
  for(const width of [400,420,600]){
   await f.evaluate(w=>PMW.chatCol.setWidth(w),width);await f.waitForTimeout(350);
   for(const state of ['Preparing','Working','Completed','Long caption','Long status']){
    await f.evaluate(state=>{
     PM56_DEMO.resetWorking();PM56_DEMO.pauseWorking();
     if(state!=='Preparing')PM56_DEMO.setWorkStep(6);
     if(state==='Completed')PM56_DEMO.completeWorking();
    },state);
    const toggle=f.locator(HEAD+' [data-action="work-demo-menu"]');
    if(await toggle.getAttribute('aria-expanded')==='true')await toggle.click();
    await f.locator(HEAD).evaluate(h=>h.scrollIntoView({block:'center',inline:'nearest'}));
    await f.waitForTimeout(250);
    const read=()=>f.locator(HEAD).evaluate(h=>{
     const origin=h.getBoundingClientRect();
     const box=e=>{const r=e.getBoundingClientRect();return {x:r.x-origin.x,y:r.y-origin.y,w:r.width,h:r.height,client:e.clientWidth,scroll:e.scrollWidth};};
     return {head:box(h),status:box(h.querySelector('strong')),caption:h.querySelector('.orbit-caption')?box(h.querySelector('.orbit-caption')):null,time:box(h.querySelector('.sub')),controls:box(h.querySelector('.working-controls')),icon:box(h.querySelector('.work-phase-icon'))};
    });
    const key=[look,width,state].join('/'), closed=await read();geometry[key]=closed;
    if(reference){
     const b=reference[key];
     await t.check(key+' collapsed geometry unchanged',!!b&&Object.entries(closed).every(([part,v])=>v===null?b[part]===null:b[part]&&['x','y','w','h'].every(k=>Math.abs(v[k]-b[part][k])<=1)),JSON.stringify({head:closed,main:b}));
    }
    await toggle.click();await f.waitForTimeout(280);
    // Stress the existing styled text nodes after the real drawer render, with no layout overrides.
    await f.locator(HEAD).evaluate((h,state)=>{
     if(state==='Long caption')h.querySelector('.orbit-caption').textContent='Searching the workspace and comparing every available project configuration before continuing with the implementation';
     if(state==='Long status')h.querySelector('strong').textContent='Waiting for permission';
    },state);
    const r=await read();
    await t.check(key+' status and time fit',r.status.scroll<=r.status.client&&r.time.scroll<=r.time.client,JSON.stringify(r));
    await t.check(key+' caption has width',state==='Completed'?r.caption===null:!!r.caption&&r.caption.w>0,JSON.stringify(r.caption));
    await t.check(key+' controls on own row',r.controls.y>=Math.max(r.status.y+r.status.h,r.time.y+r.time.h,r.icon.y+r.icon.h)-.5,JSON.stringify(r));
    if(width===400&&state==='Working')await t.crop(look+'-expanded-400',HEAD,'FO-193: Working status, caption, timer and expanded demo controls');
    await toggle.click();await f.waitForTimeout(250);
    if(state!=='Long status'){
     const back=await read();
     await t.check(key+' closing restores header geometry',['head','status','time','icon'].every(part=>['x','y','w','h'].every(k=>Math.abs(back[part][k]-closed[part][k])<=1)),JSON.stringify({closed,back}));
    }
   }
  }
 }
 if(t.args.geometry)writeFileSync(t.args.geometry,JSON.stringify(geometry,null,2));
}
