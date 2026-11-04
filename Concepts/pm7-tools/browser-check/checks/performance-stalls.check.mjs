// SW-10/15/16/26: collect timing and a matching GPU film; timings do not prove painted frames.
import { writeFileSync } from 'node:fs';
export default async function(t) {
 if(t.args.idleProbe) await t.page.addInitScript(()=>{
  window.__idleDuringDrag=[];
  for(const kind of ['setTimeout','requestIdleCallback']) {
   const real=window[kind]; if(!real)continue;
   window[kind]=function(fn,...args){
    if(typeof fn!=='function')return real.call(window,fn,...args);
    const origin=new Error().stack, body=String(fn).slice(0,300);
    return real.call(window,function(...a){
     if(document.body?.classList.contains('pm-resizing')&&window.__idleDuringDrag.length<1000)window.__idleDuringDrag.push({kind,origin,body,at:performance.now()});
     return fn.apply(this,a);
    },...args);
   };
  }
 });
 const f = await t.app.open();
 await t.app.look('basic-dark');
 const cdp = await t.page.context().newCDPSession(t.page);
 await cdp.send('Tracing.start', {categories:'devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline.stack', transferMode:'ReturnAsStream'});
 const metrics=[];
 async function sample(name, action, ms=1200) {
  await f.evaluate(name=>{window.__perfSample={name,start:performance.now(),gaps:[],times:[],last:performance.now(),on:true}; const s=window.__perfSample; performance.mark(name); function tick(now){if(!s.on)return; s.gaps.push(now-s.last);s.times.push([now,now-s.last]);s.last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);},name);
  await t.mark(name); await action(); await t.page.waitForTimeout(ms);
  metrics.push(await f.evaluate(()=>{const s=window.__perfSample;s.on=false;const a=s.gaps.slice(1).sort((a,b)=>a-b),m=s.times.filter(([t])=>t>=s.movingStart&&t<=s.movingEnd).map(x=>x[1]).sort((a,b)=>a-b);return {name:s.name,max:Math.max(...a),p95:a[Math.floor(a.length*.95)],frames:a.length,movingP95:m[Math.floor(m.length*.95)],movingMax:Math.max(...m),movingFrames:m.length};}));
 }
 try {
  if(!t.args.only) {
  await f.locator('.pmds-entry').click(); await f.locator('[data-pmds-tab="activity"]').click();
  const scenes=await f.locator('[data-pmds-do="act-scene"]').evaluateAll(es=>es.map(e=>e.getAttribute('data-arg')));
  await t.check('scenario controls exist',scenes.length>1);
  for(let i=0;i<21;i++) await sample('scenario-'+i,()=>f.locator(`[data-pmds-do="act-scene"][data-arg="${scenes[i%scenes.length]}"]`).click(),450);
  await f.locator('.pmds-entry').click();
  for(let i=0;i<3;i++) {
   await sample('bell-'+i,async()=>{await f.locator('#pmnStack').click();await t.check('inbox opened',await f.evaluate(()=>PM_TITLEBAR_NOTIFY.isOpen()));});
   await t.page.keyboard.press('Escape');
  }
  for(let i=0;i<3;i++) {
   await t.app.look('basic-dark');
   await sample('glass-'+i,()=>t.app.look('glass-dark'),1500);
  }
  }
  if(t.args.only==='crew') {
   for(let i=0;i<3;i++) {
    await f.locator('[data-menu-anchor="wand"], [data-action="open-menu"][data-menu="wand"]').first().click();
    if(!await f.locator('[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])').isVisible()) await f.locator('[data-action="polish-wand-group"][data-group="work"]').click();
    await f.locator('[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])').click();
    await f.locator('[data-collab-input="purpose"]').fill('Measure query performance and report the findings '+i);
    const btn=f.locator('[data-action="collab-modal-commit"]');
    await t.check('Start enabled', await btn.isEnabled());
    if(await btn.isEnabled()) {
     await f.evaluate(()=>{window.__tokenStyleReads=0;window.__nativeStyle=window.getComputedStyle;window.getComputedStyle=function(...args){if(new Error().stack.includes('tokRaw'))window.__tokenStyleReads++;return window.__nativeStyle.apply(this,args);};});
     try { await sample('crew-start-'+i,()=>btn.click(),2000); }
     finally {const n=await f.evaluate(()=>{window.getComputedStyle=window.__nativeStyle;return window.__tokenStyleReads;}); await t.check('commit uses cached timing tokens',n===0,String(n));}
   }
   }
  }
  if(t.args.only==='drag') {
  await t.app.look('glass-dark');
  await cdp.send('Input.setInterceptDrags',{enabled:true});
  for(let i=0;i<5;i++) {
   const b=await f.locator('#chatResizer').boundingBox();
   await sample('chat-drag-'+i, async()=>{
    await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2); await t.page.mouse.down();
    await t.check('drag admission set',await f.evaluate(()=>document.body.classList.contains('pm-resizing')));
    await f.evaluate(()=>{window.__perfSample.movingStart=performance.now()});
    for(let j=0;j<60;j++) {await t.page.mouse.move(b.x+b.width/2-160*Math.sin(j/59*Math.PI),b.y+b.height/2);await t.page.waitForTimeout(16);}
    await f.evaluate(()=>{window.__perfSample.movingEnd=performance.now()});
    await t.page.waitForTimeout(3000); await t.page.mouse.up();
   },400);
  }
  await cdp.send('Input.setInterceptDrags',{enabled:false});
  }
  if(t.args.idleProbe)metrics.push({idleDuringDrag:await f.evaluate(()=>window.__idleDuringDrag)});
  t.log(JSON.stringify(metrics.map(m=>m.idleDuringDrag?{idleCallbacksDuringDrag:m.idleDuringDrag.length}:m)));
 } finally {
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
  await cdp.send('Tracing.end'); const {stream}=await complete;
  let data=''; for(;;){const r=await cdp.send('IO.read',{handle:stream});data+=r.data;if(r.eof)break;}
  await cdp.send('IO.close',{handle:stream}); await cdp.detach();
  if(t.args.trace)writeFileSync(t.args.trace,data);
  if(t.args.metrics)writeFileSync(t.args.metrics,JSON.stringify(metrics,null,2));
 }
}
