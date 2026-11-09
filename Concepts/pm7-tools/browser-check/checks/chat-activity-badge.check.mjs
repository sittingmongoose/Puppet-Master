// FO-120. Real Orbit renderer and existing work fixtures, on Home and the chat's own page, normal and opaque.
// Tool stopping bar: a reproduced real false pass or product bug stops; other tool issues go to TOOL-ISSUES.md.
// --set chat=<5.6 Pro build> --set phase=structure|motion|compare (default structure)
// motion: record on Windows/Nas1 at 60 fps; all work glyphs, status rhythms and density tiers. No Mac motion claims.
// compare: --set base=<pre-fix PM7 build>, short before/after working/complete/waiting film for Jared.
import { LOOKS } from '../browser-check.config.mjs';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CARD = '.working-card[data-card="primary"]';
const STAGE = CARD + ' .orbit-stage';
const SYMBOL = STAGE + ' .orbit-node-symbol';
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
    const steps = base.map((s, i) => ({ ...s, uid: 'fo120:' + i, startAt: i * 2, dur: 2, rows: [] }));
    if (dense) {
      while (steps.length < dense) { const i = steps.length; steps.push({ ...steps[i % base.length], uid: 'fo120:' + i, startAt: i * 2 }); }
      index = dense - 1;
    }
    let clock = index * 2 + .4;
    if (name === 'waiting' || name === 'failed') {
      const raw = c.D.workRuns.liveB.steps.find(s => s.status === name);
      steps[index] = { ...steps[index], ...base.find(s => s.id === raw.ref), ...raw, uid: 'fo120:' + index,
        startAt: index * 2, statusAt: 0, rows: raw.rows || [] };
    }
    if (name === 'cancelled') steps[index].status = 'cancelled', steps[index].statusAt = 0;
    const rec = { step: index, clock, running: name === 'working', started: true, completed: name === 'complete',
      elapsed: 12, openPhase: index, expanded: false, ownerProjection: true, steps };
    c.state.work = rec;
    c.renderApp();
    const card = document.querySelector('.working-card[data-card="primary"]');
    card?.scrollIntoView({ block: 'center', inline: 'nearest' });
    const node = card?.querySelector('.orbit-node.live') || card?.querySelector('.orbit-node.focus');
    window.__fo120.nodeKey = node?.getAttribute('data-k');
    return { nodes: card?.querySelectorAll('.orbit-node').length || 0, key: window.__fo120.nodeKey,
      kind: steps[index].kind, icon: steps[index].icon };
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
      chosen: !!glyph, status: glyph?.querySelector('.nx-st')?.className || '', glyph: glyph?.querySelector('svg')?.dataset.nx,
      parts: parts.map(p => ({ name:getComputedStyle(p).animationName, duration:getComputedStyle(p).animationDuration })),
      box: glyph && box(glyph), node: chosen && box(chosen), label: core && box(core.querySelector('strong')),
      animations: s ? s.getAnimations({subtree:true}).map(a => ({name:a.animationName, state:a.playState,
        target:a.effect.target?.classList?.value || ''})) : [] };
  }, STAGE);
  await t.check(tag + ': Pip alone, centred; no inner glyph', r.core && r.pip && r.inner === 0 && r.centered, JSON.stringify(r));
  await t.check(tag + ': every outer node has one painted-symbol host', r.nodes > 0 && r.symbols === r.nodes && r.chosen, JSON.stringify(r));
  if (expected) await t.check(tag + ': outer status ' + expected, r.status.includes('nx-st-' + expected), r.status);
  return r;
}

async function ink(t, f, tag) {
  const selector = STAGE + ' .orbit-node[data-k="' + await f.evaluate(() => window.__fo120.nodeKey) + '"] .orbit-node-symbol';
  const loc = f.locator(selector);
  if (!await loc.count()) return; // inspect has already failed the missing host on the baseline.
  // Compare actual ink with that same paused frame with only its svg hidden: tile/background cannot pass for ink.
  await f.evaluate(sel => { const e=document.querySelector(sel); window.__fo120.paused=e.closest('.orbit-stage').getAnimations({subtree:true}).filter(a=>a.playState==='running'); window.__fo120.paused.forEach(a=>a.pause()); }, selector);
  const on = await t.pixels(loc);
  await loc.locator('svg').evaluate(e => { e.style.visibility='hidden'; });
  const off = await t.pixels(loc);
  await loc.locator('svg').evaluate(e => { e.style.removeProperty('visibility'); });
  await f.evaluate(() => { window.__fo120.paused.forEach(a=>a.play()); });
  let changed=0;
  for(let i=0;i<on.data.length;i+=4) if(Math.max(...[0,1,2].map(k=>Math.abs(on.data[i+k]-off.data[i+k])))>24) changed++;
  await t.check(tag + ': outer symbol paints ink', on.width===off.width && on.height===off.height && changed>=3, JSON.stringify({changed,width:on.width,height:on.height}));
}

async function structure(t, page, surface) {
  const f=await open(t,page,surface);
  for(const name of list(t.args.looks,LOOKS)) {
    await look(t,f,name);
    for(const motion of ['full','media','attribute','body']) {
      await t.emulate({reducedMotion:motion==='media'?'reduce':'no-preference',forcedColors:'none'});
      await f.evaluate(m=>{document.documentElement.dataset.motion=m==='attribute'?'reduced':'full';document.body.classList.toggle('pm56-reduced',m==='body');},motion);
      for(const s of ['working','complete','waiting','failed','paused','cancelled']) {
        await state(f,s); await f.waitForTimeout(800);
        const tag=`${page} ${surface} ${name} ${motion} ${s}`, r=await inspect(t,f,tag,['complete','waiting','failed'].includes(s)?s:s==='cancelled'?'paused':null);
        if(motion!=='full') await t.check(tag+': no running animation',r.animations.every(a=>a.state!=='running'),JSON.stringify(r.animations));
        await ink(t,f,tag);
      }
    }
    await t.emulate({reducedMotion:'reduce',forcedColors:'active'});
    await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
    await t.check(name+': forced colours active',await f.evaluate(()=>matchMedia('(forced-colors: active)').matches));
    for(const s of ['working','complete','waiting','failed','paused','cancelled']) {await state(f,s);await inspect(t,f,`${name} forced ${s}`);await ink(t,f,`${name} forced ${s}`);}
  }
  await t.emulate({reducedMotion:'no-preference',forcedColors:'none'});
}

async function motion(t,page,surface) {
  const f=await open(t,page,surface), observations=[];
  await t.emulate({reducedMotion:'no-preference',forcedColors:'none'});
  await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
  for(const name of list(t.args.looks,LOOKS)) {
    await look(t,f,name);
    const count=await f.evaluate(()=>window.__fo120.savedSteps.length);
    for(const i of list(t.args.kinds,Array.from({length:count},(_,i)=>i)).map(Number)) {
      const tag=`${page} ${surface} ${name} working ${i}`;
      await t.mark(tag+' begins');const fixture=await state(f,'working',i);await f.waitForTimeout(900);
      const r=await inspect(t,f,tag);observations.push({tag,fixture,...r});
      await t.check(tag+': full inner moving anatomy retained',r.parts.length>0 && r.parts.some(p=>p.name!=='none'),JSON.stringify(r.parts));
      const loc=f.locator(SYMBOL+'.is-live').first();
      if(await loc.count()) await t.moving(loc,tag+': outer glyph changes on compositor frames',{ms:2400});
      await t.mark(tag+' ends');
    }
    for(const s of ['complete','waiting','failed','paused','cancelled']) {
      const tag=`${page} ${surface} ${name} ${s}`;
      await t.mark(tag+' begins');await state(f,s);
      const r=await inspect(t,f,tag);observations.push({tag,...r});
      await f.waitForTimeout(s==='complete'?1000:2800);
      await ink(t,f,tag);await t.mark(tag+' ends');
    }
    for(const dense of [18,24]) {await t.mark(`${name} density ${dense}`);await state(f,'working',6,dense);await f.waitForTimeout(1000);await inspect(t,f,`${name} density ${dense}`);await t.moving(f.locator(SYMBOL+'.is-live').first(),`${name} density ${dense}: outer glyph moves`,{ms:2400});}
    await t.emulate({reducedMotion:'reduce'});await state(f,'working');await f.waitForTimeout(1000);await t.still(f.locator(STAGE+' .orbit-dial'),name+': Reduced Motion dial stays still',{ms:1200});await t.emulate({reducedMotion:'no-preference'});
  }
  writeFileSync(join(t.run.dir,`fo120-motion-${page}-${surface}.json`),JSON.stringify(observations,null,2));
}

async function compare(t) {
  for(const [caption,src] of [['Before',t.args.base],['After',t.args.page]]) {
    const f=await open(t,'home','normal',String(src));await look(t,f,'basic-dark');
    await t.emulate({reducedMotion:'no-preference'});
    await f.evaluate(()=>{document.documentElement.dataset.motion='full';document.body.classList.remove('pm56-reduced');});
    for(const s of ['working','complete','waiting']) {
      await t.mark(caption+' '+s);await state(f,s);await f.waitForTimeout(3200);
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
