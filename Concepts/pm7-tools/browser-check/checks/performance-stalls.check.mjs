// SW-10/15/16/26: collect timing and a matching GPU film; timings do not prove painted frames.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
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
 if(t.args.stripProbe) await t.page.addInitScript(()=>{
  window.__stripReads=[];
  for(const [proto,name] of [[Element.prototype,'clientWidth'],[HTMLElement.prototype,'offsetWidth']]){
   const d=Object.getOwnPropertyDescriptor(proto,name);if(!d?.get)continue;
   Object.defineProperty(proto,name,{...d,get(){if(document.body?.classList.contains('pm-resizing')){const stack=new Error().stack;if(/at (?:Object\.)?measure\b/.test(stack))window.__stripReads.push({name,stack});}return d.get.call(this);}});
  }
 });
 if(t.args.audioProbe) await t.page.addInitScript(()=>{
  window.__audioCosts=[];
  for(const [type,names] of [[window.BaseAudioContext,['createGain','createOscillator','createBuffer','createBufferSource','createBiquadFilter','createConvolver','createStereoPanner','createDynamicsCompressor']], [window.AudioNode,['connect']], [window.AudioScheduledSourceNode,['start']]]){
   if(!type)continue;
   for(const name of names){const real=type.prototype[name];if(!real)continue;
    type.prototype[name]=function(...args){const at=performance.now();try{return real.apply(this,args);}finally{const ms=performance.now()-at;if(ms>1)window.__audioCosts.push({name,at,ms,stack:new Error().stack});}};
   }
  }
 });
 const f = await t.app.open();
 if(t.args.page)await t.equal('loaded requested source',new URL(f.url()).pathname,new URL(t.args.page,'file://').pathname);
 await t.app.look('basic-dark');
 const cdp = await t.page.context().newCDPSession(t.page);
 await cdp.send('Tracing.start', {categories:'devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline.stack', transferMode:'ReturnAsStream'});
 await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 if(t.args.profile){await cdp.send('Profiler.enable');await cdp.send('Profiler.start');}
 const metrics=[];
 async function sample(name, action, ms=1200) {
  await f.evaluate(name=>{window.__perfSample={name,start:performance.now(),gaps:[],times:[],last:performance.now(),on:true}; const s=window.__perfSample; performance.mark(name); document.addEventListener(name.includes('drag')?'pointerdown':'click',()=>{s.clickAt=performance.now();performance.mark(name+'-click');},{once:true,capture:true}); function tick(now){if(!s.on)return; s.gaps.push(now-s.last);s.times.push([now,now-s.last]);s.last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);},name);
  await t.mark(name); await action(); await t.page.waitForTimeout(ms);
  metrics.push(await f.evaluate(()=>{const s=window.__perfSample;s.on=false;const a=(s.clickAt==null?s.gaps.slice(1):s.times.filter(([at])=>at>=s.clickAt).map(x=>x[1])).sort((a,b)=>a-b),m=s.times.filter(([t])=>t>=s.movingStart&&t<=s.movingEnd).map(x=>x[1]).sort((a,b)=>a-b);return {name:s.name,max:Math.max(...a),p95:a[Math.floor(a.length*.95)],frames:a.length,movingP95:m[Math.floor(m.length*.95)],movingMax:Math.max(...m),movingFrames:m.length,firstPostClickGap:s.clickAt==null?null:s.times.find(([t])=>t>=s.clickAt)?.[1]};}));
 }
 async function drag(name) {
   const b=await f.locator('#chatResizer').boundingBox();
   const edge=(await f.locator('#chatPanel').boundingBox()).x;
   await sample(name, async()=>{
    await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2); await t.page.mouse.down();
    await t.check('drag admission set',await f.evaluate(()=>document.body.classList.contains('pm-resizing')));
    await f.evaluate(()=>{window.__perfSample.movingStart=performance.now();performance.mark(window.__perfSample.name+'-moving-start');window.__dragEvents=[];window.addEventListener('pointermove',e=>{if(e.buttons)window.__dragEvents.push([e.clientX,e.buttons,e.target.id]);},{capture:true});});
    for(let j=0;j<Number(t.args.steps||60);j++) {await t.page.mouse.move(b.x+b.width/2-160*Math.sin(j/(Number(t.args.steps||60)-1)*Math.PI),b.y+b.height/2);await t.page.waitForTimeout(16);if(j===Math.floor(Number(t.args.steps||60)/2)){if(t.args.debug)metrics.push({dragDebug:await f.evaluate(()=>({pages:[...document.querySelectorAll('.page.active')].map(e=>({id:e.id,cls:e.className})),home:document.querySelector('#panel-dashboard')?.className,writes:window.__widthWrites,body:document.body.className,frozen:PMW.narrow.frozen}))});const x=(await f.locator('#chatPanel').boundingBox()).x;await t.check('chat edge follows pointer',Math.abs(x-(edge-160*Math.sin(j/(Number(t.args.steps||60)-1)*Math.PI)))<=1,JSON.stringify({actual:x,start:edge,expected:edge-160*Math.sin(j/(Number(t.args.steps||60)-1)*Math.PI),state:await f.evaluate(()=>({inline:document.querySelector('#chatPanel').style.cssText,centre:document.querySelector('#pmw-centre')?.clientWidth,pmw:PMW.narrow.state,evt:window.__dragEvents.slice(-2),writes:window.__widthWrites?.slice(-3)}))}));}}
    t.log(JSON.stringify(await f.evaluate(()=>({inline:document.querySelector('#chatPanel').style.getPropertyValue('--pmw-chat-w'),width:document.querySelector('#chatPanel').getBoundingClientRect().width,events:window.__dragEvents.slice(-3)}))));
    await f.evaluate(()=>{window.__perfSample.movingEnd=performance.now();performance.mark(window.__perfSample.name+'-moving-end')});
    if(t.args.stripProbe){const reads=await f.evaluate(()=>window.__stripReads);await t.check('strip target fits reuse cached geometry during drag',reads.length===0,JSON.stringify(reads.slice(0,2)));}
    await t.check('drag remains admitted after moving',await f.evaluate(()=>document.body.classList.contains('pm-resizing')));
    await t.page.waitForTimeout(Number(t.args.hold||3000)); await t.page.mouse.up();
   },400);
 }
 async function lookPicks(prefix='') {
   for(const from of ['basic-dark','nier-dark']) for(let i=0;i<3;i++) {
    await t.app.look(from);
    await f.waitForFunction(()=>!(window.PM_THEME_TRANSITION?.busy()||window.PM_LOOK_COVERED?.()||window.PM_NIER?.wanted?.()!==window.PM_NIER?.on?.()),null,{timeout:20000});
    await f.locator('#themeSelect').click();
    await f.evaluate(()=>{window.__colourSweeps=0;const real=document.getAnimations;window.__getAnimations=real;document.getAnimations=function(...a){if(new Error().stack.includes('finishColourTransitions'))window.__colourSweeps++;return real.apply(this,a);};});
    await sample(prefix+from+'-glass-'+i, async()=>{
     await f.locator('.pm6-tt-family[data-family="glass"]').click();
     await f.waitForFunction(()=>!(window.PM_THEME_TRANSITION?.busy()||window.PM_LOOK_COVERED?.()),null,{timeout:20000});
    },1500);
    const sweeps=await f.evaluate(()=>{document.getAnimations=window.__getAnimations;return window.__colourSweeps;});
    await t.check('look readiness bounds colour enumeration to initial/final sweeps',sweeps>0&&sweeps<=2,String(sweeps));
   }
 }
 try {
  if(!t.args.only||t.args.only==='studio') {
  await f.locator('.pmds-entry').click(); await f.locator('[data-pmds-tab="activity"]').click();
  const scenes=await f.locator('[data-pmds-do="act-scene"]').evaluateAll(es=>es.map(e=>e.getAttribute('data-arg')));
  await t.check('scenario controls exist',scenes.length>1);
  for(let i=0;i<21;i++) await sample('scenario-'+i,()=>f.locator(`[data-pmds-do="act-scene"][data-arg="${scenes[i%scenes.length]}"]`).click(),450);
  await f.locator('.pmds-entry').click();
  }
  if(!t.args.only) {
  for(let i=0;i<3;i++) {
   await sample('bell-'+i,async()=>{await f.locator('#pmnStack').click();await t.check('inbox opened',await f.evaluate(()=>PM_TITLEBAR_NOTIFY.isOpen()));});
   await t.page.keyboard.press('Escape');
  }
  for(let i=0;i<3;i++) {
   await t.app.look('basic-dark');
   await f.locator('#themeSelect').click();
   await sample('glass-'+i,()=>f.locator('.pm6-tt-family[data-family="glass"]').click(),4500);
  }
  for(let i=0;i<3;i++) {
   await t.app.look('nier-dark');
   await f.locator('#themeSelect').click();
   await sample('nier-glass-'+i,()=>f.locator('.pm6-tt-family[data-family="glass"]').click(),6000);
  }
  }
  if(t.args.only==='look') await lookPicks();
  if(t.args.only==='bell') {
   for(const look of ['basic-dark','glass-dark']) {
    await t.app.look(look);
    for(let i=0;i<3;i++) {
     await sample(look+'-bell-'+i,async()=>{await f.locator('#pmnStack').click();await t.check('inbox opened',await f.evaluate(()=>PM_TITLEBAR_NOTIFY.isOpen()));});
     await t.page.keyboard.press('Escape');
     await f.locator('#pmnPanel').waitFor({state:'hidden',timeout:10000});
    }
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
     await f.evaluate(()=>{
      window.__crewCommitPhases=[];
      if(!window.__crewPhaseHook){window.__crewPhaseHook=true;PM56_EXT.slot('afterRender',(ctx,info)=>{const limit=Error.stackTraceLimit;Error.stackTraceLimit=40;const stack=new Error().stack;Error.stackTraceLimit=limit;if(stack.includes('onAppClick'))window.__crewCommitPhases.push(info.phase==='app'&&info.scope?'app-scope':info.phase);});}
     });
     try { await sample('crew-start-'+i,()=>btn.click(),2000);
      const phases=await f.evaluate(()=>window.__crewCommitPhases);
      await t.check('Crew commit projects its conversation scope',phases.includes('scope')&&!phases.includes('app'),JSON.stringify(phases));
      await t.check('Crew commit closes its configure sheet',await f.locator('[data-action="collab-modal-commit"]').count()===0);
     }
     finally {const n=await f.evaluate(()=>{window.getComputedStyle=window.__nativeStyle;return window.__tokenStyleReads;}); await t.check('commit uses cached timing tokens',n===0,String(n));}
   }
   }
  }
  if(t.args.only==='pair') {
   if(!t.args.base||!t.args.fixed)throw new Error('pair needs --set base=<main> and --set fixed=<build>');
   const order=String(t.args.order||'control,fixed').split(',').map(x=>x.trim());
   if(order.some(x=>!['control','fixed'].includes(x)))throw new Error('pair order must contain control/fixed labels');
   for(let i=0;i<order.length;i++) {
    const label=order[i];
    if(i) {
     const file=label==='control'?t.args.base:t.args.fixed;
     const url=pathToFileURL(file);url.searchParams.set('o55','off');url.searchParams.set('cb',String(Date.now()));
     await t.page.goto(url.href);
     await f.waitForFunction(()=>window.PM56_PORT?.ready&&window.PMW?.chatCol&&document.querySelector('main.primary-content'),null,{timeout:60000});
    }
    await f.waitForFunction(()=>window.__PM56_BOOT_OK&&window.PM56_PORT?.ready&&(!window.O55?.motion?.softwareKnown||O55.motion.softwareKnown()),null,{timeout:60000});
    await f.evaluate(()=>document.fonts.ready.then(()=>true));
    await t.page.waitForTimeout(1000);
    await t.app.resetLayout();
    if(t.args.task!=='look')await t.app.look('glass-dark');
    const expected=pathToFileURL(label==='control'?t.args.base:t.args.fixed).pathname;
    await t.equal('loaded '+label+' source',new URL(f.url()).pathname,expected);
    if(t.args.task==='look')await lookPicks(label+'-');
    else {
     await cdp.send('Input.setInterceptDrags',{enabled:true});
     await drag(label);
     await cdp.send('Input.setInterceptDrags',{enabled:false});
    }
   }
  }
  if(t.args.only==='drag') {
  await t.app.look('glass-dark');
  await cdp.send('Input.setInterceptDrags',{enabled:true});
  if(t.args.debug)await f.evaluate(()=>{window.__widthWrites=[];const set=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(n,v,...args){if(n==='--pmw-chat-w')window.__widthWrites.push({v,stack:new Error().stack});return set.call(this,n,v,...args);};});
  for(let i=0;i<Number(t.args.reps || 5);i++) await drag('chat-drag-'+i);
  await cdp.send('Input.setInterceptDrags',{enabled:false});
  }
  if(t.args.audioProbe)metrics.push({audioCosts:await f.evaluate(()=>window.__audioCosts)});
  if(t.args.idleProbe)metrics.push({idleDuringDrag:await f.evaluate(()=>window.__idleDuringDrag)});
  t.log(JSON.stringify(metrics.map(m=>m.idleDuringDrag?{idleCallbacksDuringDrag:m.idleDuringDrag.length}:m.dragDebug?{dragDebug:true}:m)));
 } finally {
  if(t.args.profile){const {profile}=await cdp.send('Profiler.stop');writeFileSync(t.args.profile,JSON.stringify(profile));}
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
  await cdp.send('Tracing.end'); const {stream}=await complete;
  let data=''; for(;;){const r=await cdp.send('IO.read',{handle:stream});data+=r.data;if(r.eof)break;}
  await cdp.send('IO.close',{handle:stream}); await cdp.detach();
  if(t.args.trace)writeFileSync(t.args.trace,data);
  if(t.args.metrics)writeFileSync(t.args.metrics,JSON.stringify(metrics,null,2));
 }
}
