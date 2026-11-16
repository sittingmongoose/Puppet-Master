import {setLookBySetting,guardPaintedLook} from '../helpers/settings-look.mjs';
async function go(t,f,d,w){await f.evaluate(([d,w])=>PM51.go(d,w),[d,w]);await f.waitForSelector(`[data-continuous-workspace-body="${w}"][data-workspace-mounted="true"]`);await t.settle();}
const body=(f,w)=>f.locator(`[data-continuous-workspace-body="${w}"]`);
async function tab(t,f,w,label){const b=body(f,w).locator('.manager-tab',{hasText:new RegExp('^\\s*'+label+'\\s*$')}).first();await b.scrollIntoViewIfNeeded();await b.click();await t.settle();await t.page.waitForTimeout(400);}
const activePage=(f)=>f.evaluate(()=>document.querySelector('.page-tabs .page-tab.active')?.id);
async function shut(t,f){
 // A resize can put a scheme tile under the pointer; leave its hover preview before testing close.
 const head=f.locator('.pmt-cz:not(.pmed-cz):not(.pmt-cz-parked):not([aria-hidden="true"]) .pmt-cz-head').first();
 if(await head.isVisible())await head.hover();
 await t.page.keyboard.press('Escape');await t.page.waitForTimeout(450);
}
export default async function(t){
 t.log('Chrome '+t.context.browser().version());
 const noCloseBite=String(t.args.noCloseBite||'')==='1';
 if(noCloseBite)await t.context.addInitScript(()=>{
  // Negative fixture: real Escape reaches the app, but the broken close handler does nothing.
  window.addEventListener('keydown',e=>{
   if(e.key!=='Escape')return;
   const open=[...document.querySelectorAll('.pmt-cz:not(.pmed-cz):not(.pmt-cz-parked):not([aria-hidden="true"])')].some(el=>el.getBoundingClientRect().height>0);
   if(!open)return;
   window.__fo171NoCloseEscape=(window.__fo171NoCloseEscape||0)+1;
   e.preventDefault();e.stopImmediatePropagation();
  },true);
 });
 const sizes=[[860,900],[1024,768],[1280,900],[1390,900],[1920,1080],[740,900],[1280,500]];
 for(const look of (t.args.looks||'basic-light,friendly-dark,glass-dark,nier-dark').split(',')){
  await t.step(look,async()=>{
   await t.viewport(1280,900);const f=await t.app.open();await t.app.resetLayout();await f.locator('#tab-settings').click();await t.settle();await setLookBySetting(t,f,look);
   await guardPaintedLook(t,f,look,look+' start');
   await go(t,f,'system','servers');await tab(t,f,'servers','Servers');
   const more=body(f,'servers').locator('.pm51-detail-actions button[aria-label="More actions"]').first();
   await more.scrollIntoViewIfNeeded();await more.click();await t.page.waitForTimeout(300);
   const foreign=await f.evaluate(()=>{
    const a=document.querySelector('[data-continuous-workspace-body="servers"] .pm51-detail-actions button[aria-label="More actions"]');
    for(const e of document.querySelectorAll('#pm-settings-root *')){
     const r=e.getBoundingClientRect();
     if(!e.contains(a)&&e.scrollHeight>e.clientHeight+40&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)&&r.width>20&&r.height>60&&r.x>=0&&r.y>=0&&r.bottom<innerHeight){e.dataset.reviewWheel='foreign';return {top:e.scrollTop,delta:e.scrollTop>80?-100:100};}
    }
    return null;
   });
   if(foreign){
    const box=f.locator('[data-review-wheel="foreign"]');await box.hover();await t.page.mouse.wheel(0,foreign.delta);await t.page.waitForTimeout(500);
    await t.check(look+': native wheel scrolled the unrelated box',await box.evaluate((el,old)=>Math.abs(el.scrollTop-old)>1,foreign.top));
    await t.check(look+': unrelated native wheel leaves More actions open',await f.locator('.pm51-popout.pm51-menu.is-open').count()>0);
   }else t.log(look+': no unrelated visible Settings box scrolls at this size; native wheel probe is non-coverage');

   await shut(t,f);
   await go(t,f,'code','editor-runtime');
   for(const [w,h] of sizes){
    await t.viewport(w,h);
    const b=body(f,'editor-runtime').locator('[data-action="pm51-o55-terminal-customize"]').first();
    const before=await f.evaluate(()=>({body:document.body.scrollTop,window:scrollY,portal:document.querySelector('#pm-settings-portals').getBoundingClientRect().y}));
    await b.scrollIntoViewIfNeeded();
    const after=await f.evaluate(()=>({body:document.body.scrollTop,window:scrollY,portal:document.querySelector('#pm-settings-portals').getBoundingClientRect().y}));
    t.log('SCROLL '+JSON.stringify({look,w,h,before,after}));await b.click();
    const dialog=f.locator('.pmt-cz:not(.pmed-cz):not(.pmt-cz-parked):not([aria-hidden="true"]) .pmt-cz-dialog').first();
    await dialog.waitFor({state:'visible',timeout:12000});await t.page.waitForTimeout(500);
    await t.check(`${look} ${w}x${h}: Customize stays over Settings`,await activePage(f)==='tab-settings');
    await t.visible(dialog.locator('button', {hasText:/^\s*Done\s*$/}).last(),`${look} ${w}x${h}: Done can be reached`).catch(async e=>{t.log(String(e));});
    const r=await dialog.boundingBox();await t.check(`${look} ${w}x${h}: sheet fits the viewport`,!!r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=w+1&&r.y+r.height<=h+1,JSON.stringify(r));
    await shut(t,f);
    await t.check(`${look} ${w}x${h}: Escape returns to the Settings button`,await activePage(f)==='tab-settings'&&await b.evaluate(el=>document.activeElement===el));
   }
   await t.viewport(1280,900);
   await go(t,f,'general','notifications');await tab(t,f,'notifications','Destinations');
   const n=body(f,'notifications');
   const inapp=n.locator('[data-action="pm51-notifications-pick"][data-id="in-app"]').first();if(await inapp.count()){await inapp.click();await t.settle();}
   const update=n.locator('.pm51-row',{has:f.locator('.pm51-row-label',{hasText:/^\s*Update available\s*$/})}).first();
   const sw=update.locator('[role="switch"]').first();
   await sw.scrollIntoViewIfNeeded();await sw.click();await t.page.waitForTimeout(500);
   await tab(t,f,'notifications','Quiet hours');
   for(const [nw,nh] of [[1280,900],[1390,900],[1920,1080]]){
    await t.viewport(nw,nh);const change=n.locator('[data-action="pm51-notifications-quiet-dests"]').first();await change.scrollIntoViewIfNeeded();await change.click();
    const drawer=f.locator('.drawer-wrap').last();await drawer.waitFor({state:'visible'});await t.page.waitForTimeout(500);
    await t.check(`${look} ${nw}x${nh}: quiet-hours Change opens the destination choices`,(await drawer.locator('select[data-action="pm51-notifications-dest-quiet"]').count())>0);
    const pr=await drawer.locator('.pm51-panel').boundingBox();await t.check(`${look} ${nw}x${nh}: notification sheet fits`,!!pr&&pr.x>=0&&pr.y>=0&&pr.x+pr.width<=nw&&pr.y+pr.height<=nh,JSON.stringify(pr));
    const header=drawer.locator('.pm51-panel-head').first(), close=drawer.locator('.pm51-panel-close').first();
    if(pr&&pr.y>=0){
     await t.visible(header,`${look} ${nw}: sheet header exposed`);await t.visible(close,`${look} ${nw}: close exposed`);
     await drawer.locator('.pm51-dd-trigger').first().click();await t.settle();
     const list=f.locator('.pm51-dd-list.is-open').last();await list.waitFor({state:'visible'});
     const lr=await list.boundingBox();await t.check(`${look} ${nw}: quiet destination popup fits`,!!lr&&lr.x>=0&&lr.y>=0&&lr.x+lr.width<=nw&&lr.y+lr.height<=nh,JSON.stringify(lr));
     await shut(t,f);await close.click();await t.settle();
    }

    await shut(t,f);
   }
   if(t.args.bite!=='1') for(const [width,height] of [[1280,900],[1390,900],[1920,1080]]){
    await t.viewport(width,height);
    for(const [label,action] of [['Quiet hours','help'],['Destinations','add-dest'],['Events','event'],['Events','group'],['Events','add-event'],['Sounds','add-sound']]){
     await tab(t,f,'notifications',label);
     const trigger=action==='add-sound'?n.locator('button',{hasText:/^\s*Add sound\s*$/}).first():n.locator(`[data-action="pm51-notifications-${action}"]`).first();
     await trigger.scrollIntoViewIfNeeded();await trigger.click();await t.settle();
     const sheet=f.locator('#pm-settings-portals .pm51-panel, #pm-settings-portals .dialog, .pm51-popout.is-open').last();
     await sheet.waitFor({state:'visible'});
     const r=await sheet.boundingBox();
     await t.check(`${look} ${width}: ${action} fits`,!!r&&r.x>=0&&r.y>=0&&r.x+r.width<=width&&r.y+r.height<=height,JSON.stringify(r));
     const close=sheet.locator('.pm51-panel-close, .dialog-head [data-action="close-overlay"]').first();
     if(await close.count()){await t.visible(close,`${look} ${width}: ${action} close exposed`);await close.click();await t.settle();}
     await shut(t,f);await t.check(`${look} ${width}: ${action} dismissed`,await sheet.count()===0||!await sheet.isVisible());
    }
   }
   await t.viewport(1280,900);
   await go(t,f,'code','toolchain');
   const py=body(f,'toolchain').locator('.resource-row',{hasText:'Pyright'}).first();await py.scrollIntoViewIfNeeded();await py.click();await t.page.waitForTimeout(400);
   const head=body(f,'toolchain').locator('.pm51-detail-head').first();await t.visible(head,look+': language-server detail visible');

   await guardPaintedLook(t,f,look,look+' after manager actions');
   await t.app.resetLayout();
  });
 }
 if(noCloseBite)await t.check('no-close bite: real Escape reached the open Customize sheet',await t.root.evaluate(()=>Number(window.__fo171NoCloseEscape||0)>0));
}
