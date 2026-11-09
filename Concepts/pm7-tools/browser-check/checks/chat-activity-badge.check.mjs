// FO-120. Real Orbit renderer and existing work fixtures, on Home and the chat's own page, normal and opaque.
// Tool stopping bar: a reproduced real false pass or product bug stops; other tool issues go to TOOL-ISSUES.md.
// --set chat=<5.6 Pro build> --set phase=structure|motion|compare (default structure)
// motion: record on Windows/Nas1 at 60 fps; all work glyphs, status rhythms and density tiers. No Mac motion claims.
// compare: --set base=<pre-fix PM7 build>, short before/after working/complete/waiting film for Jared.
import { LOOKS } from '../browser-check.config.mjs';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const CARD = '.working-card[data-card="primary"]';
const STAGE = CARD + ' .orbit-stage';
const SYMBOL = STAGE + ' .orbit-node-symbol';
const STATES = ['working','complete','waiting','failed','failed-running','paused','cancelled'];
const statusFor = s => s==='complete'?'complete':s==='waiting'?'waiting':null;
const list = (s, fallback) => s ? String(s).split(',') : fallback;
const url = p => (/^[a-z][a-z0-9+.-]*:/i.test(p) ? p : pathToFileURL(p).href) + '?o55=off&fo120=' + Date.now();

async function open(t, page, surface, override) {
  await t.viewport(1920, 1080);
  let f;
  if (page === 'home' && !override) f = await t.app.open({ sandbox: surface === 'sandbox' });
  else {
    const u = url(override || String(t.args.chat));
    if (surface === 'sandbox') await t.openInSandbox(u); else await t.goto(u);
    f = t.root === t.page ? t.page.mainFrame() : t.root;
  }
  await f.waitForFunction(() => window.__PM56_BOOT_OK && window.PM56_EXT?.ctx && window.PM56_DEMO);
  await f.evaluate(() => {
    PM56_DEMO.selectThread('query'); PM56_DEMO.pauseWorking(); PM56_DEMO.setVariant(2, 1);
    if (window.PMW?.chatCol) { PMW.chatCol.show(); PMW.chatCol.setWidth(760); }
    window.__fo120 = { savedSteps: PM56_EXT.ctx().D.workSteps.map(s => ({ ...s })) };
  });
  return f;
}

async function look(t, f, name) {
  if (await f.evaluate(() => !!window.PM_THEME)) await t.app.look(name);
  else await f.evaluate(name => PM56_DEMO.setTheme(name), name);
  const result = await f.evaluate(() => ({ theme: document.body.dataset.theme || document.documentElement.dataset.theme,
    nier: document.documentElement.dataset.o55Nier === 'on' }));
  await t.check('look ' + name, result.nier === name.startsWith('nier-') && result.theme === (name.startsWith('nier-') ? name.replace('nier-', 'basic-') : name), JSON.stringify(result));
}

// Use the normal app render path. Hold its demo clock, leaving CSS/GPU animations running. liveB supplies the
// real failed migration and waiting-for-approval steps. Cancelled uses the renderer's admitted statusOf contract.
async function state(f, name, index = 6, dense = 0) {
  return f.evaluate(([name, index, dense]) => {
    const c = PM56_EXT.ctx(), base = window.__fo120.savedSteps;
    // Dedicated cloned real inputs avoid mutating the shared data's other consumers or cached timelines.
    let steps = base.map((s, i) => ({ ...s, uid: 'fo120:' + i, startAt: i * 2, dur: 2, rows: [] }));
    if (dense) {
      while (steps.length < dense) { const i = steps.length; steps.push({ ...steps[i % base.length], uid: 'fo120:' + i, startAt: i * 2 }); }
      index = dense - 1;
    }
    if (name === 'complete') index = steps.length - 1;
    if (name === 'complete') {
      // A real failed migration followed by successful later work: completed history keeps its work glyph still.
      const raw=c.D.workRuns.liveB.steps.find(s=>s.status==='failed');
      steps[6]={...steps[6],...base.find(s=>s.id===raw.ref),...raw,uid:'fo120:6',startAt:12,rows:raw.rows||[]};
    }
    let clock = index * 2 + .4;
    if (name === 'waiting' || name.startsWith('failed')) {
      steps=c.D.workRuns.liveB.steps.map((s,i)=>({...base.find(b=>b.id===s.ref),...s,uid:'liveB:'+i,rows:s.rows||[]}));
      index=steps.findIndex(s=>s.status===(name==='waiting'?'waiting':'failed'));
      const step=steps[index];clock=step.startAt+(name==='waiting'?step.statusAt:step.dur+.1);
    }
    if (name === 'cancelled') steps[index].status = 'cancelled', steps[index].statusAt = 0;
    const rec = { step: index, clock, running: name === 'working'||name==='failed-running', started: true, completed: name === 'complete',
      elapsed: 12, openPhase: index, expanded: false, ownerProjection: true, steps };
    c.state.work = rec;
    c.renderApp();
    const card = document.querySelector('.working-card[data-card="primary"]');
    card?.scrollIntoView({ block: 'center', inline: 'nearest' });
    const node = card?.querySelector('.orbit-node.live') || card?.querySelector('.orbit-node.focus');
    window.__fo120.nodeKey = node?.getAttribute('data-k');
    return { nodes: card?.querySelectorAll('.orbit-node').length || 0, key: window.__fo120.nodeKey,
      kind: steps[index].kind, icon: steps[index].icon,
      expectedGlyph:c.icon(steps[index].icon,22).match(/data-nx="([^"]+)"/)?.[1] };
  }, [name, index, dense]);
}

async function inspect(t, f, tag, expected) {
  const r = await f.evaluate(stageSel => {
    const s = document.querySelector(stageSel), core = s?.querySelector('.orbit-core'), face = core?.querySelector('.orbit-core-face');
    const nodes = [...(s?.querySelectorAll('.orbit-node') || [])];
    const chosen = nodes.find(n => n.getAttribute('data-k') === window.__fo120.nodeKey);
    const glyph = chosen?.querySelector('.orbit-node-symbol');
    const box = e => { const q = e.getBoundingClientRect(); return { x:q.x, y:q.y, width:q.width, height:q.height }; };
    const parts = [...(glyph?.querySelectorAll('.nx-p') || [])];
    return { core: !!core, inner: core?.querySelectorAll('.orbit-core-icon, .nx-st, svg.nx').length,
      pip: !!face?.querySelector('.pmx-pip-mk'), centered: face && Math.abs((box(face).x + box(face).width / 2) - (box(core).x + box(core).width / 2)) < 1,
      nodes: nodes.length, symbols: nodes.filter(n => n.querySelectorAll('.orbit-node-symbol svg').length === 1).length,
      chosen: !!glyph, status: glyph?.querySelector('.nx-st')?.className || '', glyph: (glyph?.querySelector('svg')||chosen?.querySelector(':scope > svg'))?.dataset.nx,
      parts: parts.map(p => ({ name:getComputedStyle(p).animationName, duration:getComputedStyle(p).animationDuration })),
      history: nodes.filter(n=>n.classList.contains('done')&&n.classList.contains('failed')).map(n=>({
        glyph:n.querySelector('.orbit-node-symbol svg, :scope > svg')?.dataset.nx,
        loops:n.getAnimations({subtree:true}).filter(a=>a.playState==='running'&&a.effect.getComputedTiming().iterations===Infinity).map(a=>a.animationName),
      })),
      box: glyph && box(glyph), node: chosen && box(chosen), label: core && box(core.querySelector('strong')),
      animations: s ? s.getAnimations({subtree:true}).map(a => ({name:a.animationName, state:a.playState,
        target:a.effect.target?.classList?.value || ''})) : [] };
  }, STAGE);
  await t.check(tag + ': Pip alone, centred; no inner glyph', r.core && r.pip && r.inner === 0 && r.centered, JSON.stringify(r));
  await t.check(tag + ': every outer node has one painted-symbol host', r.nodes > 0 && r.symbols === r.nodes && r.chosen, JSON.stringify(r));
  if (expected) await t.check(tag + ': outer status ' + expected, r.status.includes('nx-st-' + expected), r.status);
  if(expected==='complete')await t.check(tag+': completed fixture includes its failed history',r.history.length===1,JSON.stringify(r.history));
  if(r.history.length)await t.check(tag+': failed history retains its static work glyph',r.history.every(h=>h.glyph==='terminal'&&h.loops.length===0),JSON.stringify(r.history));
  return r;
}

async function settled(f) {
  await f.evaluate(async sel=>{
    const stage=document.querySelector(sel);
    if(!stage)throw new Error('activity badge missing while waiting for its entry');
    await Promise.all(stage.getAnimations({subtree:true}).filter(a=>a.effect&&Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  },STAGE);
}

async function reducedEntry(t,f,tag) {
  const moving=await f.evaluate(sel=>[...document.querySelectorAll(sel+' .orbit-node-symbol')].flatMap(e=>e.getAnimations({subtree:true})
    .filter(a=>a.playState!=='finished'&&a.effect&&Number(a.effect.getComputedTiming().duration)>1)
    .map(a=>({name:a.animationName,duration:a.effect.getComputedTiming().duration,state:a.playState}))),STAGE);
  await t.check(tag+': reduced outer symbols have no motion at entry',moving.length===0,JSON.stringify(moving));
}

async function ink(t, f, tag) {
  const selector = STAGE + ' .orbit-node[data-k="' + await f.evaluate(() => window.__fo120.nodeKey) + '"] .orbit-node-symbol';
  const loc = f.locator(selector);
  if (!await loc.count()) return; // inspect has already failed the missing host on the baseline.
  // Compare actual ink with that same paused frame with only its svg hidden: tile/background cannot pass for ink.
  await loc.scrollIntoViewIfNeeded();
  await f.evaluate(async sel => {
    const stage=document.querySelector(sel).closest('.orbit-stage');
    await Promise.all(stage.getAnimations({subtree:true}).filter(a=>a.effect&&Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    window.__fo120.paused=document.querySelector(sel).closest('.orbit-stage').getAnimations({subtree:true}).filter(a=>a.playState==='running');
    window.__fo120.paused.forEach(a=>a.pause());
  }, selector);
  const painted=()=>f.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await painted();
  const box=await loc.boundingBox(),viewportWidth=await t.window.evaluate(()=>innerWidth);
  // Full native captures avoid a clipped compositor read during an opaque frame's just-settled layout.
  // Both crops use the same window rectangle; no extra scroll or layout measurement happens inside capture.
  const read=async()=>{
    const img=await t.pixels(),scale=img.width/viewportWidth,x=Math.floor(box.x*scale),y=Math.floor(box.y*scale);
    const width=Math.ceil((box.x+box.width)*scale)-x,height=Math.ceil((box.y+box.height)*scale)-y,data=new Uint8Array(width*height*4);
    for(let row=0;row<height;row++)data.set(img.data.subarray(((y+row)*img.width+x)*4,((y+row)*img.width+x+width)*4),row*width*4);
    return {width,height,data};
  };
  const on = await read();
  // A live app patch may replace an SVG or reconcile its inline style during a capture. A head stylesheet keeps
  // the mask on the same subject through that patch; opacity also hides descendants with explicit visibility.
  await f.evaluate(sel=>{const style=document.createElement('style');style.id='fo120-ink-mask';style.textContent=sel+' svg { opacity: 0 !important; }';document.head.append(style);},selector);
  await painted();
  const maskedBefore=await loc.locator('svg').evaluate(e=>getComputedStyle(e).opacity);
  const off = await read();
  const maskedAfter=await loc.locator('svg').evaluate(e=>getComputedStyle(e).opacity);
  const afterBox=await loc.boundingBox();
  await f.evaluate(()=>document.getElementById('fo120-ink-mask')?.remove());
  await painted();
  await f.evaluate(() => { window.__fo120.paused.forEach(a=>a.play()); });
  let changed=0;
  for(let i=0;i<on.data.length;i+=4) if(Math.max(...[0,1,2].map(k=>Math.abs(on.data[i+k]-off.data[i+k])))>24) changed++;
  if(changed<3){
    const stem=tag.replace(/[^a-z0-9-]+/gi,'-');
    for(const [name,img] of [['on',on],['off',off]])writeFileSync(join(t.run.dir,stem+'-'+name+'.png'),encodePng(img));
    t.log('paired ink failure pixels: '+stem+'-on.png and '+stem+'-off.png');
  }
  await t.check(tag + ': capture rectangle stayed fixed',!!afterBox&&['x','y','width','height'].every(k=>Math.abs(box[k]-afterBox[k])<.1),JSON.stringify({box,afterBox}));
  await t.check(tag + ': glyph mask held through the off capture',maskedBefore==='0'&&maskedAfter==='0',JSON.stringify({maskedBefore,maskedAfter}));
  await t.check(tag + ': outer symbol paints ink', on.width===off.width && on.height===off.height && changed>=3, JSON.stringify({changed,width:on.width,height:on.height}));
}

async function structure(t, page, surface) {
  const f=await open(t,page,surface);
  for(const name of list(t.args.looks,LOOKS)) {
    await look(t,f,name);
    for(const motion of ['full','media','attribute','body']) {
      await t.emulate({reducedMotion:motion==='media'?'reduce':'no-preference',forcedColors:'none'});
      await f.evaluate(m=>{document.documentElement.dataset.motion=m==='attribute'?'reduced':'full';document.body.classList.toggle('pm56-reduced',m==='body');},motion);
      for(const s of STATES) {
        const tag=`${page} ${surface} ${name} ${motion} ${s}`;
        const fixture=await state(f,s);if(motion!=='full')await reducedEntry(t,f,tag);await settled(f);
        const r=await inspect(t,f,tag,statusFor(s));
        if(!statusFor(s))await t.check(tag+': original work glyph stays on the outer node',r.glyph===fixture.expectedGlyph,JSON.stringify({expected:fixture.expectedGlyph,actual:r.glyph}));
        if(motion!=='full') await t.check(tag+': no running animation',r.animations.every(a=>a.state!=='running'),JSON.stringify(r.animations));
        await ink(t,f,tag);
      }
    }
    await t.emulate({reducedMotion:'reduce',forcedColors:'active'});
    await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
    await t.check(name+': forced colours active',await f.evaluate(()=>matchMedia('(forced-colors: active)').matches));
    for(const s of STATES) {
      const tag=`${name} forced ${s}`,fixture=await state(f,s);await reducedEntry(t,f,tag);await settled(f);
      const r=await inspect(t,f,tag,statusFor(s));
      if(!statusFor(s))await t.check(tag+': original work glyph stays on the outer node',r.glyph===fixture.expectedGlyph,JSON.stringify({expected:fixture.expectedGlyph,actual:r.glyph}));
      await ink(t,f,tag);
    }
  }
  await t.emulate({reducedMotion:'no-preference',forcedColors:'none'});
}

// Geometry supports the native film review; it is not a substitute for painted-frame motion evidence.
async function watchClearance(f, start) {
  return f.evaluate(([sel,start])=>{
    if(!start){const w=window.__fo120.clearance;if(w)w.active=false;return w;}
    const wanted=document.querySelector(sel)?.querySelector('svg')?.dataset.nx;
    const w=window.__fo120.clearance={active:true,totalFrames:0,frames:0,missingFrames:0,changedGlyphFrames:0,minEdge:1e6,labelOverlap:0,bad:[]};
    const sample=()=>{
      if(!w.active)return;
      w.totalFrames++;
      const e=document.querySelector(sel), n=e?.closest('.orbit-node'), label=document.querySelector('.working-card[data-card="primary"] .orbit-core strong');
      if(n&&label){
        const nr=n.getBoundingClientRect(),lr=label.getBoundingClientRect();w.frames++;
        if(e.querySelector('svg')?.dataset.nx!==wanted)w.changedGlyphFrames++;
        for(const tube of e.querySelectorAll('.nx-c')){
          const r=tube.getBoundingClientRect();if(!r.width&&!r.height)continue;
          const edge=Math.min(r.left-nr.left,nr.right-r.right,r.top-nr.top,nr.bottom-r.bottom);
          w.minEdge=Math.min(w.minEdge,edge);
          if(r.left<lr.right&&r.right>lr.left&&r.top<lr.bottom&&r.bottom>lr.top)w.labelOverlap++;
          if(edge<0&&w.bad.length<5)w.bad.push({edge,part:tube.getAttribute('class')});
        }
      }else w.missingFrames++;
      requestAnimationFrame(sample);
    };requestAnimationFrame(sample);return null;
  },[STAGE+' .orbit-node[data-k="'+await f.evaluate(()=>window.__fo120.nodeKey)+'"] .orbit-node-symbol',start]);
}

async function motion(t,page,surface) {
  const f=await open(t,page,surface), observations=[];
  await t.emulate({reducedMotion:'no-preference',forcedColors:'none'});
  await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
  const interval=async(tag,s,index=6,dense=0,reduced=false)=>{
    if(s==='complete'){await state(f,'working',await f.evaluate(()=>window.__fo120.savedSteps.length-1));await settled(f);}
    await t.mark(tag+' begins');const fixture=await state(f,s,index,dense);
    if(reduced)await reducedEntry(t,f,tag);await settled(f);
    const r=await inspect(t,f,tag,statusFor(s));
    const loc=f.locator(STAGE+' .orbit-node[data-k="'+await f.evaluate(()=>window.__fo120.nodeKey)+'"] .orbit-node-symbol');
    const node=loc.locator('..');
    await f.waitForFunction(key=>{const n=document.querySelector('.working-card[data-card="primary"] .orbit-node[data-k="'+key+'"]');if(!n)return false;const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));},await f.evaluate(()=>window.__fo120.nodeKey));
    await t.visible(node,tag+': outer tile is on screen and uncovered');
    const row={tag,fixture,...r,captureBox:await loc.boundingBox(),nativeExpectation:!reduced&&['working','waiting','failed-running'].includes(s)?'motion':'still'};
    if(!statusFor(s))await t.check(tag+': original work glyph stays on the outer node',r.glyph===fixture.expectedGlyph,JSON.stringify({expected:fixture.expectedGlyph,actual:r.glyph}));
    if((s==='working'||s==='failed-running')&&!reduced)await t.check(tag+': full inner moving anatomy retained',r.parts.length>0&&r.parts.some(p=>p.name!=='none'),JSON.stringify(r.parts));
    await watchClearance(f,true);
    await t.mark(tag+' steady');
    // The mandatory reader judges every native GPU-video frame after the run. Keep screenshot polling out of the
    // film: it would add capture load and sample only a fraction of the encoded frames.
    await f.waitForTimeout(row.nativeExpectation==='motion'?(s==='working'?2400:2800):1200);
    row.clearance=await watchClearance(f,false);
    await t.check(tag+': moving tubes stay inside the outer tile and clear of the label',row.clearance.frames>10&&row.clearance.missingFrames===0&&row.clearance.changedGlyphFrames===0&&row.clearance.minEdge>=0&&row.clearance.labelOverlap===0,JSON.stringify(row.clearance));
    await t.mark(tag+' ends');observations.push(row);
  };
  for(const name of list(t.args.looks,LOOKS)) {
    await look(t,f,name);
    const count=await f.evaluate(()=>window.__fo120.savedSteps.length);
    for(const i of list(t.args.kinds,Array.from({length:count},(_,i)=>i)).map(Number))await interval(`${page} ${surface} ${name} working ${i}`,'working',i);
    // Real scripted-only subjects (MCP, skills) also used to put their glyph beside Pip.
    const extras=await f.evaluate(()=>{const c=PM56_EXT.ctx(),known=new Set(window.__fo120.savedSteps.map(s=>s.icon));return [...new Map(Object.values(c.D.workRuns).flatMap(r=>r.steps).filter(s=>s.icon&&!known.has(s.icon)).map(s=>[s.icon,s])).values()];});
    for(const extra of extras){
      await f.evaluate(extra=>{const a=window.__fo120.savedSteps;window.__fo120.restore=a[6];a[6]={...a[6],...extra};},extra);
      await interval(`${page} ${surface} ${name} working ${extra.icon}`,'working');
      await f.evaluate(()=>{window.__fo120.savedSteps[6]=window.__fo120.restore;});
    }
    for(const s of STATES.filter(s=>s!=='working'))await interval(`${page} ${surface} ${name} ${s}`,s);
    for(const dense of [18,24])await interval(`${page} ${surface} ${name} density ${dense}`,'working',6,dense);
    await t.emulate({reducedMotion:'reduce'});
    for(const s of STATES)await interval(`${page} ${surface} ${name} reduced ${s}`,s,6,0,true);
    await t.emulate({reducedMotion:'no-preference'});
  }
  writeFileSync(join(t.run.dir,`fo120-motion-${page}-${surface}.json`),JSON.stringify(observations,null,2));
}

async function compare(t) {
  for(const [caption,src] of [['Before',t.args.base],['After',t.args.page]]) {
    const f=await open(t,'home','normal',String(src));await look(t,f,'basic-dark');
    await t.emulate({reducedMotion:'no-preference'});
    await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
    for(const s of ['working','complete','waiting']) {
      await t.mark(caption+' '+s);await state(f,s,s==='working'?12:6);
      await f.evaluate(label=>{let el=document.getElementById('fo120-film-caption');if(!el){el=document.createElement('div');el.id='fo120-film-caption';Object.assign(el.style,{position:'fixed',left:'20px',top:'72px',zIndex:'2147483646',padding:'8px 12px',background:'#111',color:'#fff',font:'700 16px system-ui',borderRadius:'6px',pointerEvents:'none'});document.body.append(el);}el.textContent=label;},caption+' · '+s);
      await f.waitForTimeout(3200);
      await t.crop(caption+'-'+s,f.locator(STAGE+' .orbit-dial'),caption+': '+s+' Pip, ring symbol, label clearance');
    }
  }
}

export const tests={};
for(const page of ['home','chat']) for(const surface of ['normal','sandbox']) {
  tests[`${page} ${surface}`]=async t=>{
    if(String(t.args.phase)==='compare') {if(page==='home'&&surface==='normal')await compare(t);return;}
    if(!t.app.surfaces().includes(surface)||page==='chat'&&!t.args.chat){t.log('surface/page not selected');return;}
    if(String(t.args.phase)==='motion')await motion(t,page,surface);else await structure(t,page,surface);
  };
}
