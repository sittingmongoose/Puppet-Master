import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// QA-7 owner-scene audit. Demo Studio opens every registered screen with its normal fixture seed.
// The real Recovery Kit route is separately exercised by onboarding-drop.check.mjs.
// --set looks=, --set screens= narrow it; --set dwell= defaults to 1800 ms per screen.
export default async function(t) {
  const looks=String(t.args.looks||'glass-dark,glass-light,basic-dark,basic-light,friendly-dark,friendly-light,retro-dark,retro-light,nier-dark,nier-light').split(',');
  const f=await t.app.open({onboarding:true,query:'o55=fresh&o55scenario=fresh'});
  await f.waitForFunction(()=>O55.S?.open);
  const screens=await f.evaluate(()=>Object.keys(O55.pipScenes.SCREENS));
  const selected=t.args.screens?String(t.args.screens).split(','):screens;
  let cases=selected.map(screen=>({screen,label:screen}));
  if(!t.args.screens)cases.push(
    {screen:'where',label:'where-connect',click:'[data-o55-do="pick"][data-arg="connect"]'},
    {screen:'s-kind',label:'server-cloud',click:'[data-o55-do="kind"][data-arg="cloud"]'},
    {screen:'r-source',label:'backup-folder',click:'[data-o55-do="source"][data-arg="folder"]'},
    {screen:'r-source',label:'backup-cloud',click:'[data-o55-do="source"][data-arg="cloud"]'},
    {screen:'like',label:'copy-settings',scenario:'returning',click:'[data-o55-do="pick"]:not([data-arg="fresh"])'},
    {screen:'safe',label:'preview-online',hover:'[data-o55-do="online"]'},
    {screen:'safe',label:'preview-backup',hover:'[data-o55-do="backup"]'},
    {screen:'ready',label:'ready-confetti',effect:'ready'},
    {screen:'where',label:'act-card',effect:'banner'},
    {screen:'r-pick',label:'choice-cheer',effect:'cheer'});
  if(t.args.variantsOnly)cases=cases.filter(c=>c.label!==c.screen);
  if(t.args.labels)cases=cases.filter(c=>String(t.args.labels).split(',').includes(c.label));
  if(Number(t.args.reps)>1)cases=Array.from({length:Number(t.args.reps)},(_,rep)=>cases.map(c=>({...c,label:c.label+'-r'+rep}))).flat();
  await t.check('requested scene/effect cases selected',cases.length>0,String(cases.length),{hard:true});
  const inventory=[];
  for(const look of looks) {
    await t.emulate({reducedMotion:t.args.reduced?'reduce':'no-preference'});
    await f.evaluate(l=>O55.ui.applyLook(...l.split('-')),look);await f.waitForTimeout(1500);
    for(const entry of cases) {
      const {screen,label}=entry;
      // Studio's real row press wakes Pip. A programmatic scene jump needs that same trusted input first,
      // otherwise Welcome's asleep pose leaks through every subsequent fixture (the bubble-clear kit does this too).
      if(screen!=='welcome'&&await f.evaluate(()=>!!document.querySelector('#pm-o55-onboarding .pst')?.__pipStage?.sleepZ)){
        await t.page.keyboard.press('Shift');
        await f.waitForFunction(()=>!document.querySelector('#pm-o55-onboarding .pst')?.__pipStage?.sleepZ,null,{timeout:5000});
      }
      const cdp=t.args.trace?await t.page.context().newCDPSession(t.page):null;
      if(cdp)await cdp.send('Tracing.start',{categories:'devtools.timeline,v8.execute,blink.user_timing,cc,gpu,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'});
      await t.mark(look+' '+label+' entry');
      await f.evaluate(([id,scenario])=>O55.studio.onboarding.screen(id,scenario),[screen,entry.scenario||'fresh']);
      await f.waitForFunction(id=>O55.S.sess.screen===id,screen);
      // Arm the observer before input. A choice click may finish after most of its fall, which would measure only
      // the final swing as a tiny descent and call its natural turning point a long midpoint stall.
      const captureKey=look+'-'+label;
      const capture=f.evaluate(async ([duration,key,paintTag])=>{
        const rows=[],deadline=performance.now()+15000,ids=new WeakMap(),bannerTimings=new Set();let nextId=0,started=null;
        window.__qa7FallArmed=key;
        if(paintTag&&!window.__qa7FallTag){
          const tag=document.createElement('div');tag.style.cssText='position:fixed;left:0;top:0;width:168px;height:8px;contain:strict;z-index:2147483647;pointer-events:none;view-transition-name:qa7-fall-tag';
          const cells=[];for(let i=0;i<42;i++){const c=document.createElement('i');c.style.cssText=`position:absolute;left:${i*4}px;top:0;width:4px;height:8px;background:#808080`;tag.appendChild(c);cells.push(c);}
          document.documentElement.appendChild(tag);window.__qa7FallTag={seq:0,cells,shown:[]};
        }
        await new Promise(resolve=>{
          let raf=0,lastTs=0,toggle=0,done=false;
          const clock=document.createElement('i');clock.style.cssText='position:fixed;left:-10px;top:-10px;width:1px;height:1px;contain:strict;pointer-events:none';document.documentElement.appendChild(clock);
          // ResizeObserver runs after the frame's rAF callbacks and layout, as the kit's Pip witness does.
          const observer=new ResizeObserver(()=>{
            const ts=lastTs||performance.now();
            const s=document.querySelector('#pm-o55-onboarding .pst')?.__pipStage;
            if(s?.live()&&started===null)started=performance.now();
            if(s)rows.push({ts,delivered:performance.now(),t:s.t,theme:s.theme,render:s.renderN,stage:s.id,live:s.live(),fps:s.frameRate(),pip:{head:s.H,dy:s.ps.dy},props:[...s.props].map(([id,p])=>({id,kind:p.spec.kind,state:p.state,op:p.op,settled:p.settled,len:p.len,target:s.propTarget(p).len,box:p.box,pos:p.pos,rest:p.restBox,ground:!!p.spec.ground,stack:p.spec.stack})),fx:s.fx.map(p=>{if(!ids.has(p))ids.set(p,++nextId);return {id:ids.get(p),kind:p.kind,follow:!!p.follow,x:p.x,y:p.y,life:p.life};})});
            const card=document.querySelector('.o55fx-banner[data-hang]:not([data-wait]) .o55fx-bn-card');
            if(s&&card){
              const animations=card.getAnimations();animations.forEach(a=>bannerTimings.add(JSON.stringify(a.effect.getTiming())));
              card.__qa7Hauling||=animations.some(a=>a.effect.getTiming().duration===260&&/^steps\(5(?:, end)?\)$/.test(a.effect.getTiming().easing));
              const anim=card.__qa7Descent||(card.__qa7Descent=animations.find(a=>a.effect.getTiming().duration===230&&/^steps\(6(?:, end)?\)$/.test(a.effect.getTiming().easing)));
              if(anim){const b=card.getBoundingClientRect(),time=Number(anim.currentTime),phase=Math.max(0,Math.min(230,time-90));
                rows.at(-1).props.push({id:'act-card',kind:'act-card',state:card.__qa7Hauling?'out':'in',op:1,len:phase,target:230,box:[b.left,b.top,b.right,b.bottom]});}
            }
            if(paintTag&&s){const w=window.__qa7FallTag,seq=++w.seq;rows.at(-1).paintSeq=seq;const bits=[1,0];for(let i=0;i<20;i++)bits.push((seq>>i)&1);for(let i=0;i<20;i++)bits.push(1-((seq>>i)&1));bits.forEach((b,i)=>{if(w.shown[i]!==b){w.cells[i].style.background=b?'#fff':'#000';w.shown[i]=b;}});}
            if((started!==null&&performance.now()-started>=duration)||performance.now()>=deadline){
              done=true;cancelAnimationFrame(raf);observer.disconnect();clock.remove();
              // No previous case's tag may label an uncaptured scene transition.
              if(paintTag){const w=window.__qa7FallTag;w.cells.forEach(c=>{c.style.background='#808080';});w.shown=[];}
              resolve();
            }
          });observer.observe(clock);
          const tick=ts=>{if(done)return;lastTs=ts;clock.style.width=(++toggle%2+1)+'px';raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
        });
        return {screen:O55.S.sess.screen,rows,bannerTimings:[...bannerTimings],bannerPolicy:window.__qa7BannerPolicy,tag:paintTag?{bits:20,block:4,x:0,y:0}:null};
      },[Number(t.args.dwell||(screen==='creating'?7000:screen==='ready'?6500:1800)),captureKey,!!t.recording||!!t.args.paintTag]);
      await f.waitForFunction(key=>window.__qa7FallArmed===key,captureKey);
      if(entry.click)await f.locator('.o55-pane > .o55-layer:not(.o55-out) '+entry.click).first().click();
      if(entry.hover){await f.locator('.o55-pane > .o55-layer:not(.o55-out) '+entry.hover).first().hover();await f.waitForTimeout(450);}
      // Positive effect owner fixtures complement the default Ready fixture, which is intentionally calm without AI.
      if(entry.effect)await f.evaluate(effect=>{const host=document.querySelector('#pm-o55-onboarding .pst'),s=host.__pipStage;if(effect==='ready')s.ready();else if(effect==='banner'){window.__qa7BannerPolicy={enabled:O55.nierFx.enabled('banner'),reduced:O55.motion.reduced(),lowResource:O55.motion.lowResource};if(window.__qa7BannerPolicy.enabled)void O55.nierFx.banner({within:host,title:'Chapter complete',hang:true,inset:.08,at:.36,ms:1660,sound:false});}else s.cheer('clipboard',{sound:false});},entry.effect);
      const result=await capture;
      writeFileSync(join(t.run.dir,look+'-'+label+'.json'),JSON.stringify(result));
      if(cdp){
        const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await done;
        let data='';for(;;){const chunk=await cdp.send('IO.read',{handle:stream});data+=chunk.data;if(chunk.eof)break;}
        await cdp.send('IO.close',{handle:stream});await cdp.detach();writeFileSync(join(t.run.dir,look+'-'+label+'-trace.json'),data);
      }
      const groups=new Map();
      // Model continuity uses the animation clock. Physical frame intervals/holds are judged by the tagged film;
      // callback delivery can bunch after a long task, and records that never painted are not film frames.
      for(const r of result.rows)for(const p of r.props){const key=r.stage+':'+p.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push({...p,ts:r.t*1000,render:p.kind==='act-card'?p.box.map(x=>Math.round(x*100)).join(','):r.render,fps:r.fps});}
      const props=[];
      for(const [id,all]of groups) {
        const visible=all.filter(p=>p.op>.1&&p.state!=='out'&&p.box);
        const a=visible.filter((p,i)=>i===0||p.render!==visible[i-1].render);
        if(a.length<4){props.push({id,kind:all[0]?.kind,covered:false,samples:a.length});continue;}
        const y=p=>(p.box[1]+p.box[3])/2,start=y(a[0]),end=y(a.at(-1)),span=end-start;
        const wireStart=a[0].len,wireTravel=a.at(-1).len-wireStart;
        // 412's first visible sample is not on the wire yet, and a single retro frame can spike the offset
        // and return. Rest ignores that entry sample and a one-frame spike. A jump that stays, which is how
        // the vault leaves its wire, remains.
        const off=p=>y(p)-p.len,kept=[];
        for(let i=1;i<a.length;i++){
          if(i<a.length-1){const o=off(a[i]),prev=off(a[i-1]),next=off(a[i+1]);if(Math.abs(o-prev)>20&&Math.abs(o-next)>20&&Math.abs(prev-next)<=20)continue;}
          kept.push(a[i]);
        }
        const restSpan=kept.length>1?y(kept.at(-1))-y(kept[0]):span,restWire=kept.length>1?kept.at(-1).len-kept[0].len:wireTravel;
        let worst=0,stall=0,maxStall=0;
        for(let i=1;i<a.length;i++){
          const p=a[i-1],q=a[i],dt=q.ts-p.ts,progress=(p.len-wireStart)/wireTravel;
          if(dt<=0||p.render===q.render||progress<.15||progress>.85)continue;
          const dy=y(q)-y(p);worst=Math.max(worst,Math.abs(dy)/Math.abs(span)*1000/dt);
          const dl=q.len-p.len;
          if(dl>.01&&Math.abs(dy)<dl*.1)stall+=dt;else stall=0;
          maxStall=Math.max(maxStall,stall);
        }
        const remaining=a[0].target-a[0].len;
        const last=a.at(-1);
        // The rig treats a prop as arrived within 2.5 of its target length. Friendly Light's vault used to pass
        // with span about 5 and wire about -53 because a short or backward travel was not covered.
        const arrived=Math.abs(last.target-last.len)<=2.5;
        const wireGap=restSpan-restWire;
        props.push({id,kind:a[0].kind,ground:a[0].ground,span,remaining,wireTravel,restSpan,restWire,wireGap,arrived,samples:a.length,covered:span>20&&wireTravel>20,worst,maxStall});
      }
      const effects=new Map();
      for(const r of result.rows)for(const p of r.fx){const key=r.stage+':'+p.id;if(!effects.has(key))effects.set(key,[]);effects.get(key).push({...p,ts:r.t*1000,render:r.render});}
      const bursts=[];
      for(const all of effects.values()){
        const a=all.filter((p,i)=>i===0||p.render!==all[i-1].render);let speed=0;
        for(let i=1;i<a.length;i++){const dt=(a[i].ts-a[i-1].ts)/1000;if(dt>0)speed=Math.max(speed,Math.hypot(a[i].x-a[i-1].x,a[i].y-a[i-1].y)/dt);}
        bursts.push({kind:a[0]?.kind,follow:a[0]?.follow,samples:a.length,maxSpeed:speed});
      }
      const cell={look,screen:result.screen,label,clock:'animation seconds; film reader judges physical frames',props,effects:bursts};inventory.push(cell);t.log(JSON.stringify(cell));
      await t.equal(look+' '+label+': owner fixture opened',result.screen,screen);
      await t.check(look+' '+label+': requested rig look painted',result.rows.length>10&&result.rows.every(r=>r.theme===look),JSON.stringify([...new Set(result.rows.map(r=>r.theme))]));
      const bad=props.filter(p=>p.covered&&(p.worst>15||p.maxStall>Math.max(60,300/(look==='retro-light'?10:look==='retro-dark'?20:120))));
      await t.check(look+' '+label+': placement has continuous animation progress',bad.length===0,JSON.stringify(bad));
      // The act card's length is its banner phase, not a suspension. On the passing 412 wholes the largest
      // remaining gap is 26px (Windows glass-light backup folder). The hung vault misses by about 58
      // (Friendly Light, not covered) or about 168 (Friendly Dark). 30 sits between those records.
      // The continuity rate stays 15.
      const offWire=props.filter(p=>p.kind!=='act-card'&&(p.covered||p.arrived)&&(Math.abs(p.restSpan)>20||Math.abs(p.restWire)>20)&&Math.abs(p.wireGap)>30);
      await t.check(look+' '+label+': a settled prop rests on its wire',offWire.length===0,JSON.stringify(offWire));
      await t.check(look+' '+label+': independent particles have no position jumps',bursts.every(p=>p.follow||p.maxSpeed<1600),JSON.stringify(bursts.filter(p=>!p.follow&&p.maxSpeed>=1600)));
      if(entry.effect==='ready'&&!t.args.reduced){const expected=look.startsWith('nier-')?0:60;await t.equal(look+': confetti follows its look policy',bursts.filter(p=>p.kind==='conf').length,expected);}
      if(entry.effect==='banner')await t.check(look+': hanging act card follows its look policy',look.startsWith('nier-')?props.some(p=>p.kind==='act-card'&&p.covered):!props.some(p=>p.kind==='act-card'),JSON.stringify({props:props.filter(p=>p.kind==='act-card'),policy:result.bannerPolicy,timings:result.bannerTimings}));
      // A fresh Creating fixture starts real owner work. The next Studio open respects that running commit.
      if(screen==='creating') await f.waitForFunction(()=>O55.S.sess.commit?.state!=='running',null,{timeout:30000});
    }
  }
  writeFileSync(join(t.run.dir,'fall-inventory.json'),JSON.stringify(inventory,null,2));
  await t.check('every requested scene was exercised',inventory.length===looks.length*cases.length,String(inventory.length));
}
