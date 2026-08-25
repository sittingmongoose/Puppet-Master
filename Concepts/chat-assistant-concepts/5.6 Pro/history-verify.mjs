/* history-verify.mjs — Wave 3 (History) assertions for items 3 and 4.
 *
 * Written so ANOTHER agent can re-run it: no state is inherited, every claim is
 * re-measured, and nothing rests on getBoundingClientRect() alone.  Where the
 * claim is visual, the check is a PAINTED PIXEL: elementFromPoint() at the
 * target's own centre plus a colour read taken from a real screenshot crop
 * (the PNG is handed back to the page as a data URL, drawn to a canvas and
 * sampled with getImageData) — a bounding box says nothing about a node that
 * is clipped, occluded or mid-transition.
 *
 *   node history-verify.mjs [--reduced] [--out results.json] [--shots DIR]
 *                           [--file OTHER.html]
 *
 * --file exists for the NEGATIVE CONTROL: point it at a build made with
 * history.js / history.css emptied and every item-3 / item-4 assertion below
 * must go RED.  A harness that has only ever been seen green has not been
 * tested; see negative-control.py next to this file.
 *
 * Chromium comes from the local playwright install; the page is driven over
 * file:// because http hangs in this sandbox.
 */
import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import path from 'path';
import fs from 'fs';

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/%20/g,' ');
const argv = process.argv.slice(2);
const FILE = (argv.includes('--file') ? path.resolve(argv[argv.indexOf('--file')+1])
                                      : path.join(HERE, 'PM_Chat_Assistant_5.6_Pro_Standalone.html'));
const REDUCED = argv.includes('--reduced');
const OUT   = (argv.includes('--out')   ? argv[argv.indexOf('--out')+1]   : null);
const SHOTS = (argv.includes('--shots') ? argv[argv.indexOf('--shots')+1] : null);
if(SHOTS) fs.mkdirSync(SHOTS,{recursive:true});

const results=[]; let pass=0, fail=0;
const check=(ok,label,detail)=>{ results.push({ok:!!ok,label,detail}); ok?pass++:fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${label}${ok?'':'\n        '+JSON.stringify(detail)}`); };

const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,
  reducedMotion: REDUCED ? 'reduce' : 'no-preference'});
const consoleErrors=[],pageErrors=[];
page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')consoleErrors.push(m.type()+': '+m.text())});
page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await page.waitForTimeout(500);

/* ---------- painted-pixel helper -------------------------------------------
   Screenshot the element's box, hand the PNG back to the page, sample it.  The
   signature is deliberately richer than a mean colour: a mean alone cannot tell
   a red cross from a red bar.  distinct = number of distinct RGB triples,
   grid = a 5x5 luminance map, which is what actually separates nine glyphs that
   share two or three accent colours. */
async function paint(selector, index=0){
  const el = page.locator(selector).nth(index);
  const box = await el.boundingBox();
  if(!box) return null;
  const clip = {x:Math.max(0,Math.floor(box.x)-1,0), y:Math.max(0,Math.floor(box.y)-1),
                width:Math.max(2,Math.ceil(box.width)+2), height:Math.max(2,Math.ceil(box.height)+2)};
  const png = await page.screenshot({clip});
  const b64 = 'data:image/png;base64,'+png.toString('base64');
  return await page.evaluate(async src=>{
    const img = new Image();
    await new Promise(r=>{img.onload=r;img.src=src;});
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const g=c.getContext('2d');g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data;
    let r=0,gg=0,b=0,n=0;const seen=new Set();
    for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];n++;seen.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);}
    const grid=[];
    for(let gy=0;gy<5;gy++)for(let gx=0;gx<5;gx++){
      let s=0,k=0;
      const x0=Math.floor(gx*c.width/5),x1=Math.max(x0+1,Math.floor((gx+1)*c.width/5));
      const y0=Math.floor(gy*c.height/5),y1=Math.max(y0+1,Math.floor((gy+1)*c.height/5));
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*c.width+x)*4;s+=(d[i]*.299+d[i+1]*.587+d[i+2]*.114);k++;}
      grid.push(Math.round(s/k));
    }
    return {w:c.width,h:c.height,mean:[Math.round(r/n),Math.round(gg/n),Math.round(b/n)],distinct:seen.size,grid};
  }, b64);
}
const hitsSelf = (sel,i=0)=>page.locator(sel).nth(i).evaluate(el=>{
  const r=el.getBoundingClientRect();
  const t=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
  return !!(t && (el===t || el.contains(t) || t.contains(el)));
});
const shot = (name)=> SHOTS ? page.screenshot({path:path.join(SHOTS,name)}) : Promise.resolve();

/* Fail fast and fail SOFT.  The negative control (--file, a build with this
   module emptied) must produce a full red report, not a crash on the first
   missing element — a harness that dies half-way cannot tell the next agent
   which assertions are load-bearing. */
page.setDefaultTimeout(6000);
async function sec(label, fn){
  try{ await fn(); }
  catch(e){ check(false, `[${label}] threw before it could assert`, String((e&&e.message)||e)); }
}
/* Preconditions (clicking the toggle, clicking the pin) are recorded as
   failures too rather than throwing: in the negative control none of these
   controls exist, and a thrown precondition would hide every assertion after
   it. */
async function click(sel, i=0){
  try{ await page.locator(sel).nth(i).click({timeout:4000}); return true; }
  catch(e){ check(false, `precondition: click ${sel}`, String((e&&e.message)||e)); return false; }
}

/* =====================================================================
   ITEM 3 — the nine take-6 status indicators
   ===================================================================== */
await page.evaluate(()=>PM56_DEMO.setVariant(1,5));
await page.waitForTimeout(400);

const NINE=['working','reviewing','waiting','idle','complete','blocked','failed','paused','recovering'];
const present = await page.evaluate(()=>{
  const o={}; document.querySelectorAll('.history-flyout .ph-status').forEach(e=>{o[e.dataset.status]=(o[e.dataset.status]||0)+1});
  return o;
});
check(NINE.every(s=>present[s]>0), 'All nine statuses render a .ph-status indicator', present);

/* Each indicator must be a DISTINCT PAINTED GLYPH, not nine copies of the
   spinner with different tooltips.  Signatures are compared pairwise. */
const sigs={};
for(const s of NINE){
  const sel = `.history-flyout .ph-status[data-status="${s}"]`;
  if(await page.locator(sel).count()===0){ check(false,`Painted signature: ${s}`,'no such row'); continue; }
  await page.locator(sel).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(60);
  const p = await paint(sel);
  const hit = await hitsSelf(sel);
  sigs[s]=p;
  check(!!p && p.distinct>1 && hit, `Painted indicator + hit-test: ${s}`, {p,hit});
}
const dup=[];
for(let i=0;i<NINE.length;i++)for(let j=i+1;j<NINE.length;j++){
  const a=sigs[NINE[i]],b=sigs[NINE[j]]; if(!a||!b) continue;
  const same = a.distinct===b.distinct && a.grid.every((v,k)=>Math.abs(v-b.grid[k])<=2)
            && a.mean.every((v,k)=>Math.abs(v-b.mean[k])<=2);
  if(same) dup.push(`${NINE[i]}==${NINE[j]}`);
}
check(dup.length===0 && Object.keys(sigs).length===NINE.length,
      'All nine indicators are pairwise visually distinct',
      {duplicates:dup, measured:Object.keys(sigs).length});

/* Each must also carry its own motion signature (animation-name set), and the
   terminal one (complete) must NOT loop. */
const anims = await page.evaluate(()=>{
  const out={};
  document.querySelectorAll('.history-flyout .ph-status').forEach(e=>{
    if(out[e.dataset.status]) return;
    const names=[];
    for(const n of [e,e.querySelector('.ph-ring'),e.querySelector('.ph-mark')]){
      if(!n) continue;
      for(const pe of ['',"::before","::after"]){
        const cs=getComputedStyle(n,pe||undefined);
        if(cs.animationName && cs.animationName!=='none')
          names.push(cs.animationName+'|'+cs.animationDuration+'|'+cs.animationIterationCount);
      }
    }
    out[e.dataset.status]=names.sort();
  });
  return out;
});
if(REDUCED){
  /* Reduced motion must reach the same END STATE without motion, so the
     expectation INVERTS here rather than being skipped: zero animations on the
     indicators, and — asserted just above, in painted pixels — nine glyphs that
     are still pairwise distinguishable while standing still. */
  check(NINE.every(s=>(anims[s]||[]).length===0),'Reduced motion: no indicator animations at all',anims);
  const inf = await page.evaluate(()=>document.getAnimations()
      .filter(a=>{try{return a.effect.getTiming().iterations===Infinity}catch(e){return false}}).length);
  check(inf===0,'Reduced motion: zero perpetual loops document-wide',{infinite:inf});
} else {
  check(NINE.every(s=>(anims[s]||[]).length>0), 'Every status has at least one animation', anims);
  check((anims.complete||[]).length>0 && (anims.complete||[]).every(a=>a.split('|')[2]==='1'),
        'complete is terminal — one iteration, no loop', anims.complete);
  check(new Set(NINE.map(s=>(anims[s]||[]).join(','))).size===NINE.length,
        'All nine motion signatures differ', anims);
}

/* THE HOVER BUG (styles.css:123): the spinner used to fade to opacity 0 under
   the cursor.  Assert in pixels, not in computed style: hover the row and prove
   the glyph is still the element returned at its own centre and still paints. */
await sec('item3: status survives row hover', async()=>{
  const row='.history-flyout .thread-row';
  const rest = await paint('.history-flyout .thread-row .ph-status');
  await page.locator(row).first().hover();
  await page.waitForTimeout(320);
  const op = await page.locator('.history-flyout .thread-row .thread-status-slot').first()
                       .evaluate(el=>getComputedStyle(el).opacity);
  const hovered = await paint('.history-flyout .thread-row .ph-status');
  const hit = await hitsSelf('.history-flyout .thread-row .ph-status');
  check(Number(op)===1 && hit && hovered && hovered.distinct>1,
        'Status indicator survives row hover (styles.css:123 fade defeated)',
        {opacity:op,hit,rest:rest&&rest.distinct,hovered:hovered&&hovered.distinct});
  await page.mouse.move(4,4); await page.waitForTimeout(200);
});

/* ROW PADDING actually decreased.  Measured as a real before/after in the same
   page: read the height with the module rule live, then DELETE that rule via
   CSSOM and read it again, which is the honest baseline (the take's own
   styles.css rule is min-height:72px / padding-top:9px). */
await sec('item3: row padding before/after', async()=>{
  const before = await page.locator('.history-flyout .thread-row').first()
                  .evaluate(el=>{const cs=getComputedStyle(el);return {h:el.getBoundingClientRect().height,pt:cs.paddingTop,pb:cs.paddingBottom,mh:cs.minHeight};});
  const baseline = await page.evaluate(()=>{
    const ss=[...document.styleSheets].filter(s=>{try{return !!s.cssRules}catch(e){return false}});
    let removed=0;
    for(const s of ss){
      for(let i=s.cssRules.length-1;i>=0;i--){
        const t=s.cssRules[i].selectorText||'';
        if(t.includes('[data-history-variant="5"] .thread-row') && s.cssRules[i].style.padding!==''){
          s.deleteRule(i); removed++;
        }
      }
    }
    const el=document.querySelector('.history-flyout .thread-row');
    const cs=getComputedStyle(el);
    return {removed,h:el.getBoundingClientRect().height,pt:cs.paddingTop,pb:cs.paddingBottom,mh:cs.minHeight};
  });
  check(baseline.removed>0 && parseFloat(before.pt)<parseFloat(baseline.pt)
        && parseFloat(before.pb)<parseFloat(baseline.pb) && before.h < baseline.h,
        'Take-6 row padding and height actually decreased', {withModule:before, withoutModule:baseline});
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await page.evaluate(()=>PM56_DEMO.setVariant(1,5));
  await page.waitForTimeout(400);
});

/* The floating flyout must actually WEAR the take, not collapse to take 0
   (Wave 1A added the attribute; the CSS never followed). */
await sec('item3: flyout wears take 6', async()=>{
  const r = await page.evaluate(()=>{
    const f=document.querySelector('.history-flyout');
    const row=f&&f.querySelector('.thread-row');
    const sub=row&&row.querySelector('.thread-sub .summary');
    return f? {attr:f.dataset.historyVariant, clamp:sub?getComputedStyle(sub).webkitLineClamp:null,
               white:sub?getComputedStyle(sub).whiteSpace:null} : null;
  });
  check(r && r.attr==='5' && r.clamp==='2' && r.white==='normal',
        'Floating flyout wears take 6 (not take 0)', r);
});

/* SELECTION: no coloured left-edge bar anywhere, and the replacement paints. */
await sec('item3: selection treatment', async()=>{
  const r = await page.evaluate(()=>{
    const a=document.querySelector('.history-flyout .thread-row.active');
    if(!a) return null;
    const bs=getComputedStyle(a,'::before');
    const cs=getComputedStyle(a);
    const inactive=document.querySelector('.history-flyout .thread-row:not(.active)');
    return {beforeContent:bs.content, beforeW:bs.width, shadow:cs.boxShadow,
            bg:cs.backgroundColor, bgInactive:inactive?getComputedStyle(inactive).backgroundColor:null,
            weight:getComputedStyle(a.querySelector('.thread-title')).fontWeight,
            weightInactive:inactive?getComputedStyle(inactive.querySelector('.thread-title')).fontWeight:null};
  });
  const barGone = r && (r.beforeContent==='none' || r.beforeW==='auto' || r.beforeW==='0px');
  check(barGone, 'No coloured left-edge accent bar on the selected row', r);
  check(r && r.shadow!=='none' && r.shadow.includes('inset') && r.bg!==r.bgInactive,
        'Selection replacement paints (inset ring + tint)', r);
  // and it is a RING, not an edge: sample the row's left, right, top and bottom insets
  const ring = await page.evaluate(()=>{
    const a=document.querySelector('.history-flyout .thread-row.active');
    const r=a.getBoundingClientRect();
    const pts=[[r.left+1.5,r.top+r.height/2],[r.right-1.5,r.top+r.height/2],
               [r.left+r.width/2,r.top+1.5],[r.left+r.width/2,r.bottom-1.5]];
    return pts.map(p=>{const e=document.elementFromPoint(p[0],p[1]);return !!(e&&(e===a||a.contains(e)))});
  });
  check(ring.every(Boolean),'Selection ring covers all four edges (not one side)',ring);
});
/* `historyChrome` is a shared append slot (Goals puts a card there too), so the
   drawer's own children must lay out by ROLE, not by count.  Before the flex
   fix, a fourth child collapsed the search row to 0px and dropped the scroll
   surface on top of it — measured at a 17px overlap. */
await sec('item3: drawer rows do not overlap at any child count', async()=>{
  const r = await page.evaluate(()=>{
    const host=document.querySelector('.history-flyout')||document.querySelector('.history-panel');
    const se=host.querySelector('.history-search'), sr=host.querySelector('.history-scroll');
    const hr=host.getBoundingClientRect();
    const boxes=[...host.children].filter(c=>getComputedStyle(c).position!=='absolute')
      .map(c=>{const b=c.getBoundingClientRect();return {cls:c.className,top:Math.round(b.top),bottom:Math.round(b.bottom)};});
    let worst=0;
    for(let i=1;i<boxes.length;i++) worst=Math.max(worst, boxes[i-1].bottom-boxes[i].top);
    return {children:boxes.length, worstOverlap:Math.round(worst),
            searchH:Math.round(se.getBoundingClientRect().height),
            scrollFits:Math.round(sr.getBoundingClientRect().bottom-hr.bottom)};
  });
  check(r.children>=4 && r.worstOverlap<=0 && r.searchH>10 && r.scrollFits<=1,
        'Drawer rows stack without overlap even with a second module in historyChrome', r);
});
/* Take 6 relaxes .thread-sub to white-space:normal for the two-line summary;
   only the summary may wrap. */
await sec('item3: only the summary wraps', async()=>{
  const r = await page.evaluate(()=>{
    const sub=document.querySelector('.history-flyout .thread-row .thread-sub');
    const first=sub.querySelector('span:not(.summary)');
    const cs=getComputedStyle(first);
    /* The span is a flex item and stretches to the row height, so its box height
       says nothing about wrapping.  A Range over its contents returns one client
       rect per LINE BOX, which is the actual question. */
    const rng=document.createRange(); rng.selectNodeContents(first);
    return {white:cs.whiteSpace, text:first.textContent, lineBoxes:rng.getClientRects().length};
  });
  check(r.white==='nowrap' && r.lineBoxes===1, 'The timestamp stays on one line', r);
});
await shot(`item3-take6${REDUCED?'-reduced':''}.png`);

/* =====================================================================
   ITEM 4 — the open / pin / close choreography
   ===================================================================== */
const drawerGeom = ()=>page.evaluate(()=>{
  const f=document.querySelector('.history-flyout');
  const pane=document.querySelector('.assistant-pane');
  const grid=document.querySelector('.assistant-grid');
  const stage=document.querySelector('.chat-stage')||document.querySelector('.chat-column')||grid;
  return {
    mode:document.body.dataset.phDrawer||null,
    present:!!f,
    x:f?f.getBoundingClientRect().left:null,
    w:f?f.getBoundingClientRect().width:null,
    transform:f?getComputedStyle(f).transform:null,
    shadow:f?getComputedStyle(f).boxShadow:null,
    paneLeft:pane?pane.getBoundingClientRect().left:null,
    paneW:pane?pane.getBoundingClientRect().width:null,
    gutter:grid?parseFloat(getComputedStyle(grid).paddingLeft):null,
    stageLeft:stage?stage.getBoundingClientRect().left:null,
    scrim:pane?{op:Number(getComputedStyle(pane,'::after').opacity),pe:getComputedStyle(pane,'::after').pointerEvents}:null
  };
});

// start from a known state: closed
await page.evaluate(()=>{document.querySelector('.chat-header [data-action="toggle-history"], .app-header [data-action="toggle-history"]');});
let g = await drawerGeom();
check(g.mode==='pinned' && g.present && Math.abs(g.x-g.paneLeft)<2,
      'Boots as ONE drawer at the assistant pane\'s LEFT edge (no .history-panel column)', g);
check((await page.locator('.history-panel').count())===0,
      'The old .history-panel grid column is gone', {count:await page.locator('.history-panel').count()});

/* Close it, then film the OPEN.  The transform must INTERPOLATE, not snap. */
await click('[data-action="toggle-history"]');
await page.waitForTimeout(500);
g = await drawerGeom();
check(g.mode==='closed' && !g.present && (g.gutter||0)<1,
      'Toggle closes a PINNED drawer and the gutter collapses with it (the bug not ported)', g);

const sampleTransform = async (ms, step=16)=>{
  const out=[]; const t0=Date.now();
  while(Date.now()-t0 < ms){
    out.push(await page.evaluate(()=>{
      const f=document.querySelector('.history-flyout');
      const grid=document.querySelector('.assistant-grid');
      const pane=document.querySelector('.assistant-pane');
      if(!f) return null;
      const r=f.getBoundingClientRect();
      const cp=getComputedStyle(f).clipPath;
      /* Chromium reports the 4th inset as px OR as % depending on where the
         interpolation is, so both are handled and % is resolved against the
         element's own current width (which is what inset() resolves against). */
      const m=/inset\([^)]*?([-0-9.]+)(px|%)\s*\)/.exec(cp);
      return {t:performance.now(), x:Math.round(r.left*100)/100, w:Math.round(r.width*100)/100,
              g:Math.round(parseFloat(getComputedStyle(grid).paddingLeft)*100)/100,
              s:Math.round(Number(getComputedStyle(pane,'::after').opacity)*1000)/1000,
              c:m?Math.round((m[2]==='%'?parseFloat(m[1])*r.width/100:parseFloat(m[1]))*100)/100:null,
              cp:cp,
              pl:Math.round(pane.getBoundingClientRect().left*100)/100};
    }));
    await page.waitForTimeout(step);
  }
  return out.filter(Boolean);
};

const openPromise = sampleTransform(420,14);
await click('[data-action="toggle-history"]');
const openTrace = await openPromise;
await page.waitForTimeout(400);
g = await drawerGeom();
await sec('item4: open interpolates', async()=>{
  const xs=[...new Set(openTrace.map(s=>s.x))];
  const scr=[...new Set(openTrace.map(s=>s.s))];
  const inflight = openTrace.filter(s=>s.x < g.paneLeft-1 && s.x > g.paneLeft-g.w+1).length;
  if(REDUCED){
    check(inflight===0 && Math.abs(openTrace[openTrace.length-1].x-g.paneLeft)<2,
          'Reduced motion: the drawer arrives at the same place with no in-flight frames',
          {inflight,last:openTrace[openTrace.length-1],paneLeft:g.paneLeft});
  } else {
    check(xs.length>=4 && inflight>=2,
          'OPEN interpolates from the left (transform is sampled mid-flight, not snapped)',
          {distinctX:xs.length,inflight,first:xs[0],last:xs[xs.length-1],paneLeft:g.paneLeft});
    check(scr.length>=3, 'Scrim opacity ramps in step with the slide', {distinctScrim:scr.length,scr});
    /* The clip that keeps the drawer inside the pane must stay in LOCKSTEP with
       the transform: at every in-flight frame the amount hanging left of the
       pane edge must equal the clip's left inset.  Drift here would show as the
       drawer bleeding over the editor mid-slide, which is what the contact
       sheet caught before the clip existed. */
    const flying = openTrace.filter(s=>s.c!=null && s.c>1 && s.x<s.pl-1);
    const drift = flying.map(s=>Math.round(Math.abs((s.pl-s.x)-s.c)*10)/10);
    check(flying.length>=2 && drift.every(d=>d<=3),
          'The pane clip stays in lockstep with the slide (drawer never bleeds over the editor)',
          {frames:flying.length, drift});
  }
});
check(g.mode==='open' && Math.abs(g.x-g.paneLeft)<2 && g.scrim.op>0.9 && g.scrim.pe==='auto',
      'Opens LEFT with a live scrim', g);

/* THE PANE CLIP MUST NOT EAT THE FLOAT SHADOW — and this guard now toggles the
   CLIP, which is the thing its name is about.
   ---------------------------------------------------------------------------
   It used to A/B `box-shadow:none` only.  That is not vacuous — it still went
   red, delta 4.03 -> 0.00 against a `>1` threshold with an A/A floor of 0.00 —
   but it proves "a shadow is painted here", not "the shadow survives the clip",
   and the comment above it claimed the second thing.  A guard whose stated
   purpose and actual behaviour differ is worse than no guard, because the next
   agent reads the name.

   Three arms now, all painted-pixel reads just outside the drawer's right edge:
     A  as shipped                      -> clip inset(-90px -90px -90px 0), shadow on
     B  clip-path forced to inset(0)    -> the clip hugs the box; if the -90px
                                           insets are what let the shadow out,
                                           this must go dark
     C  box-shadow forced to none       -> the original arm, kept
   The claim is A > B and A > C.  The extra statement worth having is B ~= C:
   clipping the shadow away is indistinguishable from deleting it, which is what
   makes `inset(0)` the wrong declaration and `-90px` the load-bearing one.
   Independently confirmed last wave by a different method at -0.007 delta.

   Every override goes through an injected <style> in <head>, NEVER an inline
   style on the node: pmSyncAttrs deletes attributes the render did not emit, so
   an inline `style` is wiped by whichever 2s work tick lands inside the sample
   window.  That made this assertion flaky exactly once, under reduced motion,
   before it was moved into <head>.  The waits are 320ms because clip-path is on
   the 240ms transition and a 160ms sample would read it mid-flight. */
await sec('item4: the clip keeps the float shadow', async()=>{
  const e = await page.evaluate(()=>{const r=document.querySelector('.history-flyout').getBoundingClientRect();
    return {right:Math.round(r.right), y:Math.round(r.top+r.height/2)};});
  const lum = async ()=>{
    const s = await page.screenshot({clip:{x:e.right+2,y:e.y-8,width:20,height:16}});
    return await page.evaluate(async d=>{const i=new Image();await new Promise(r=>{i.onload=r;i.src=d});
      const c=document.createElement('canvas');c.width=i.width;c.height=i.height;
      const g=c.getContext('2d');g.drawImage(i,0,0);
      const px=g.getImageData(0,0,c.width,c.height).data;let s=0;
      for(let k=0;k<px.length;k+=4)s+=(px[k]+px[k+1]+px[k+2])/3;
      return Math.round(s*100/(px.length/4))/100;},'data:image/png;base64,'+s.toString('base64'));
  };
  const force = async (css)=>{
    await page.evaluate(c=>{let s=document.getElementById('__phForce');
      if(!c){ if(s) s.remove(); return; }
      if(!s){ s=document.createElement('style'); s.id='__phForce'; document.head.appendChild(s); }
      s.textContent=c;}, css);
    await page.waitForTimeout(320);
  };
  const A  = await lum();
  await page.waitForTimeout(320);
  const A2 = await lum();                      /* A/A floor: no change, no delta */
  await force('body[data-ph-drawer] .history-flyout{clip-path:inset(0) !important}');
  const B  = await lum();
  await force('.history-flyout{box-shadow:none !important}');
  const C  = await lum();
  await force(null);
  /* A shadow DARKENS the strip outside the drawer, so the shipped reading is the
     LOW one; both ways of removing the shadow must make it brighter. */
  check(Math.abs(A-A2) <= 0.5, 'A/A floor: two reads of the same pixels agree', {A, A2});
  check(A < B - 1,
        'The float shadow paints THROUGH the pane clip (forcing clip-path:inset(0) clips it away)',
        {shipped:A, clippedToBox:B, delta:+(B-A).toFixed(3)});
  check(A < C - 1,
        'That reading really is the shadow (forcing box-shadow:none removes it too)',
        {shipped:A, noShadow:C, delta:+(C-A).toFixed(3)});
  check(Math.abs(B-C) <= 0.5,
        'Clipping the shadow away is INDISTINGUISHABLE from deleting it — which is why the insets are -90px and not 0',
        {clippedToBox:B, noShadow:C, delta:+(B-C).toFixed(3)});
});
await shot(`item4-open${REDUCED?'-reduced':''}.png`);

/* Esc and scrim-click DO dismiss while unpinned. */
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
check((await drawerGeom()).mode==='closed', 'Esc dismisses an UNPINNED drawer', await drawerGeom());
await click('[data-action="toggle-history"]');
await page.waitForTimeout(450);
await sec('item4: scrim click dismisses when unpinned', async()=>{
  const pane=await page.locator('.assistant-pane').boundingBox();
  await page.mouse.click(pane.x+pane.width-40, pane.y+pane.height/2);
  await page.waitForTimeout(500);
  check((await drawerGeom()).mode==='closed','Scrim click dismisses an UNPINNED drawer',await drawerGeom());
});

/* PIN: narrows in place, gutter grows, transcript slides right. */
await click('[data-action="toggle-history"]');
await page.waitForTimeout(450);
const beforePin = await drawerGeom();
const pinTrace = sampleTransform(420,14);
await click('[data-action="ph-toggle-pin"]');
const pinSamples = await pinTrace;
await page.waitForTimeout(400);
const afterPin = await drawerGeom();
await sec('item4: pin narrows in place', async()=>{
  const widths=[...new Set(pinSamples.map(s=>s.w))];
  const gutters=[...new Set(pinSamples.map(s=>s.g))];
  const moved = Math.abs(afterPin.x-beforePin.x);
  check(afterPin.w < beforePin.w-40, 'PIN narrows the drawer', {before:beforePin.w,after:afterPin.w});
  check(beforePin.present && afterPin.present && afterPin.x!=null && moved < 2,
        'PIN does not MOVE the drawer (narrows in place)', {moved,before:beforePin.x,after:afterPin.x});
  check(REDUCED ? (widths.length<=2 && gutters.length<=2) : (widths.length>=4 && gutters.length>=4),
        REDUCED ? 'Reduced motion: width and gutter reach the pinned values in one step'
                : 'Width and gutter interpolate together, not in one step',
        {widths:widths.length,gutters:gutters.length});
  check(afterPin.w>0 && afterPin.gutter>0 && Math.abs(afterPin.gutter-afterPin.w)<2,
        'Reserved gutter tracks the pinned width exactly', {gutter:afterPin.gutter,width:afterPin.w});
  check(afterPin.stageLeft > beforePin.stageLeft+40, 'The transcript slid RIGHT into the gutter',
        {before:beforePin.stageLeft,after:afterPin.stageLeft});
  check(afterPin.scrim.op<0.05 && afterPin.scrim.pe==='none','Scrim goes on pin (chat stays interactive)',afterPin.scrim);
  check(afterPin.shadow==='none','Heavy overlay shadow becomes a quiet border on pin',{shadow:afterPin.shadow});
});
await shot(`item4-pinned${REDUCED?'-reduced':''}.png`);

/* THE CLOSE BUG THAT MUST NOT BE PORTED: Esc and scrim are guarded while
   pinned, but the explicit toggle still closes. */
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
check((await drawerGeom()).mode==='pinned','Esc does NOT dismiss a pinned drawer (guarded)',await drawerGeom());
await sec('item4: esc guarded while pinned', async()=>{
  const pane=await page.locator('.assistant-pane').boundingBox();
  await page.mouse.click(pane.x+pane.width-40, pane.y+pane.height/2);
  await page.waitForTimeout(400);
  check((await drawerGeom()).mode==='pinned','Scrim area click does NOT dismiss a pinned drawer (guarded)',await drawerGeom());
});
/* Unpin restores the scrim — the reference never does (paintPin sets
   scrim.style.display='none' on pin and never clears it). */
await click('[data-action="ph-toggle-pin"]');
await page.waitForTimeout(450);
await sec('item4: unpin restores the scrim', async()=>{
  const u=await drawerGeom();
  check(u.mode==='open' && u.scrim.op>0.9 && u.scrim.pe==='auto',
        'UNPIN restores the scrim (the reference\'s sibling defect, fixed)', u);
  check(u.w>afterPin.w+40 && Math.abs(u.x-u.paneLeft)<2, 'UNPIN widens in place', u);
  check(u.present && u.mode==='open' && (u.gutter||0)<1, 'Gutter collapses on unpin', u);
});
/* Re-pin, then prove the EXPLICIT toggle closes a pinned drawer. */
await click('[data-action="ph-toggle-pin"]');
await page.waitForTimeout(450);
const rePinned = await drawerGeom();
check(rePinned.mode==='pinned' && rePinned.gutter>0,'Re-pinned with a live gutter',rePinned);
await sec('item4: toggle closes a pinned drawer', async()=>{
  const exitTrace = sampleTransform(400,14);
  await click('[data-action="toggle-history"]');
  const exitSamples = await exitTrace;
  const xs=[...new Set(exitSamples.map(s=>s.x))];
  await page.waitForTimeout(500);
  const c = await drawerGeom();
  check(c.mode==='closed' && !c.present,
        'THE TOGGLE CLOSES A PINNED DRAWER (kimi-k3 w1-solo-column.js:330 bug NOT ported)', c);
  check(rePinned.gutter>0 && (c.gutter||0)<1,
        'Closing a pinned drawer unpins, so the gutter collapses too', {was:rePinned.gutter, now:c.gutter});
  check(REDUCED ? true : xs.length>=3,
        'The close is ANIMATED — the node survives the exit instead of being dropped',
        {distinctX:xs.length,samples:exitSamples.length});
});

/* The exit honours Wave 1B's published contract. */
await click('[data-action="toggle-history"]');
await page.waitForTimeout(450);
await sec('item4: exit contract', async()=>{
  const contract = await page.evaluate(()=>{
    const f=document.querySelector('.history-flyout');
    document.body.dataset.phDrawer='closing';
    f.classList.add('pm-leaving');
    const cs=getComputedStyle(f);
    const r={name:cs.animationName,dur:cs.animationDuration,
             ms:parseFloat(cs.animationDuration)*1000, pe:cs.pointerEvents};
    f.classList.remove('pm-leaving'); document.body.dataset.phDrawer='open';
    return r;
  });
  check(contract.name!=='none' && contract.ms>0 && contract.pe==='none',
        'Exit contract: pm-leaving yields a readable animationDuration and kills pointer events',
        contract);
  check(REDUCED ? contract.ms<=2 : Math.abs(contract.ms-240)<5,
        `Exit duration is ${REDUCED?'1ms under reduced motion':'240ms'}`, contract);
});

/* pmPatch must not drop the node mid-exit.  Start a close and let a full 2s
   work tick land inside the exit window. */
await sec('item4: pmPatch cannot drop the node mid-exit', async()=>{
  await page.evaluate(()=>PM56_DEMO.startWorking());
  await click('[data-action="toggle-history"]');
  await page.waitForTimeout(120);
  const mid = await page.evaluate(()=>({
    present:!!document.querySelector('.history-flyout'),
    mode:document.body.dataset.phDrawer,
    historyMode:PM56_DEMO.getState().historyMode}));
  if(REDUCED){
    /* The exit collapses to 1ms, so the node is legitimately already gone at
       the 120ms sample — the point of the contract is that the caller reads the
       wait back instead of hard-coding 240ms and stalling. */
    check(!mid.present && mid.mode==='closed' && mid.historyMode==='closed',
          'Reduced motion: the exit completes immediately and the state still advances', mid);
  } else {
    check(mid.present && mid.mode==='closing' && mid.historyMode==='floating',
          'pmPatch cannot remove the drawer before the exit finishes', mid);
  }
  await page.waitForTimeout(600);
  const gone = !(await page.locator('.history-flyout').count());
  check(gone && (REDUCED || mid.present),'…and it IS removed once the exit lands',{mid,gone});
});

/* =====================================================================
   BETTER THAN THE REFERENCE — a pinned thread ANIMATES into Pinned
   ===================================================================== */
await click('[data-action="toggle-history"]');
await page.waitForTimeout(450);
await sec('item4: pinned thread animates into Pinned', async()=>{
  const target = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('.history-flyout .thread-row[data-id]')];
    const secs=[...document.querySelectorAll('.history-flyout .history-scroll section')];
    const recent=secs.find(s=>/Recent/i.test(s.querySelector('.section-head span')?.textContent||''));
    const row=recent?recent.querySelector('.thread-row[data-id]'):rows[rows.length-1];
    if(!row) return null;
    row.scrollIntoView({block:'center'});
    const r=row.getBoundingClientRect();
    return {id:row.dataset.id, y:r.top};
  });
  await page.waitForTimeout(200);
  await page.locator(`.history-flyout .thread-row[data-id="${target.id}"] [data-action="thread-menu"]`).click();
  await page.waitForTimeout(300);
  // capture the animation the module starts, from inside the page
  await page.evaluate(()=>{ window.__phAnims=[];
    const orig=Element.prototype.animate;
    Element.prototype.animate=function(k,o){ if(this.classList.contains('thread-row'))
      window.__phAnims.push({id:this.dataset.id,kf:JSON.stringify(k),dur:o&&o.duration}); return orig.call(this,k,o); };
  });
  await page.locator('[data-action="toggle-thread-pin"]').click();
  await page.waitForTimeout(60);
  /* `state.menu` is the honest assertion for app.js:1506 — the DOM check has to
     tolerate the Wave 3 Menus module, which clones the closing menu into
     document.body as a `.pm56-menu-ghost` for its exit animation. */
  const flip = await page.evaluate(()=>({anims:window.__phAnims,
    menuState:PM56_DEMO.getState().menu,
    liveMenu:!!document.querySelector('#pmOverlayRoot .overlay-menu')}));
  await page.waitForTimeout(900);
  flip.menuGone = await page.evaluate(()=>!document.querySelector('.overlay-menu:not(.pm56-menu-ghost)'));
  const after = await page.evaluate(id=>{
    const secs=[...document.querySelectorAll('.history-flyout .history-scroll section')];
    const pin=secs.find(s=>/Pinned/i.test(s.querySelector('.section-head span')?.textContent||''));
    const row=pin&&pin.querySelector(`.thread-row[data-id="${id}"]`);
    return {inPinned:!!row, y:row?row.getBoundingClientRect().top:null};
  }, target.id);
  check(after.inPinned, 'The thread really moved into the Pinned group', {target,after});
  if(REDUCED){
    check(flip.anims.length===0,'Reduced motion: no FLIP animation, state still advances',flip);
  } else {
    const mine=flip.anims.filter(a=>a.id===target.id);
    check(mine.length>0 && mine.every(a=>a.dur===420),
          'The move is ANIMATED (FLIP), not a teleport', {count:flip.anims.length, mine});
  }
  check(flip.menuState===null && !flip.liveMenu && flip.menuGone,
        'Pinning also closes the thread menu (app.js:1506 left it open for 2s)',flip);
});

/* =====================================================================
   WAVE 6 — THE PINNED DRAWER'S RESIZE HANDLE, restored.
   ---------------------------------------------------------------------
   The invariant an earlier wave traded the handle away to protect is that the
   drawer's width and the transcript's reserved gutter are ONE expression.  So
   the assertions below are not "the drag works": they are "on every frame of
   the drag the gutter still equals the width, and the drawer's left edge has
   not moved".  Anything less would let the handle back in at the cost of
   pin-in-place, which is the whole point of the choreography.

   The work tick is paused first: renderApp() every 2s would land inside the
   drag window and make the "renders nothing" assertion a coin flip.
   ===================================================================== */
await sec('wave6: the pinned drawer resizes without breaking pin-in-place', async()=>{
  await page.evaluate(()=>{const b=document.querySelector('[data-action="pause-working"]'); if(b) b.click();});
  await page.waitForTimeout(250);
  /* The "renders nothing" assertion is only meaningful if the 2s work tick is
     actually stopped; say so out loud rather than reporting a silent green. */
  const tickStopped = await page.evaluate(()=>!PM56_DEMO.getState().work.running);
  /* reach a resting PINNED drawer without measuring a toggle by toggling it */
  const st0 = await page.evaluate(async()=>{
    if(!document.querySelector('.history-flyout')) document.querySelector('[data-action="toggle-history"]').click();
    await new Promise(r=>setTimeout(r,650));
    if(document.body.dataset.phDrawer!=='pinned') document.querySelector('.history-flyout [data-action="ph-toggle-pin"]').click();
    await new Promise(r=>setTimeout(r,700));
    return document.body.dataset.phDrawer;
  });
  check(st0==='pinned','precondition: pinned and at rest before the resize is measured',{mode:st0});

  const g0 = await page.evaluate(()=>{
    const h=document.querySelector('[data-ph-resize]');
    const f=document.querySelector('.history-flyout');
    const sc=document.querySelector('.history-flyout .history-scroll');
    if(!h||!f) return {present:!!h};
    const hr=h.getBoundingClientRect(), fr=f.getBoundingClientRect(), sr=sc.getBoundingClientRect();
    const cs=getComputedStyle(h);
    const t=document.elementFromPoint(hr.left+hr.width/2, hr.top+hr.height/2);
    return {present:true, display:cs.display, cursor:cs.cursor,
      hitsSelf:!!(t&&(t===h||h.contains(t))),
      role:h.getAttribute('role'), tab:h.getAttribute('tabindex'),
      now:Number(h.getAttribute('aria-valuenow')), min:Number(h.getAttribute('aria-valuemin')),
      left:hr.left, width:hr.width, flyoutRight:fr.right,
      scrollbarPx: sc.offsetWidth - sc.clientWidth, scrollTrackLeft: sr.right-(sc.offsetWidth-sc.clientWidth),
      scrollable: sc.scrollHeight > sc.clientHeight};
  });
  check(g0.present && g0.display==='block' && g0.cursor==='col-resize' && g0.hitsSelf,
        'The pinned drawer has a hit-testable resize handle with a col-resize cursor', g0);
  check(g0.role==='separator' && g0.tab==='0' && g0.now>0 && g0.min>0,
        'It is the ARIA window-splitter pattern (separator + tabindex + a value range)', g0);
  /* It lives INSIDE the drawer because .history-flyout is overflow:hidden
     (styles.css:304) — measured, see history.css.  It must therefore not
     swallow the scrollbar thumb, which styles.css:349 insets 2px each side. */
  check(!g0.scrollable || (g0.left - (g0.scrollTrackLeft + 2)) >= 2.5,
        'It leaves usable scrollbar thumb to its left', {handleLeft:g0.left, trackLeft:g0.scrollTrackLeft, freePx:g0.left-(g0.scrollTrackLeft+2)});

  /* the SAME node must exist and be hidden while floating: pmPatch must never
     mount or unmount it, or a pin would remount it mid-transition */
  await click('[data-action="ph-toggle-pin"]'); await page.waitForTimeout(650);
  const floatState = await page.evaluate(()=>{const h=document.querySelector('[data-ph-resize]');
    return {present:!!h, display:h?getComputedStyle(h).display:null};});
  check(floatState.present && floatState.display==='none',
        'The handle node stays mounted but hidden while floating', floatState);
  await click('[data-action="ph-toggle-pin"]'); await page.waitForTimeout(700);

  /* --- the drag, traced on the FRAME CLOCK ------------------------------- */
  const start = await page.evaluate(()=>{const r=document.querySelector('.history-flyout').getBoundingClientRect();
    return {x:Math.round(r.right-3), y:Math.round(r.top+r.height/2), w0:r.width};});
  await page.evaluate(()=>{
    window.__phRz={out:[],stop:false,mut:0};
    const o=new MutationObserver(rs=>{window.__phRz.mut+=rs.length;});
    o.observe(document.getElementById('pmRoot'),{childList:true,subtree:true,attributes:true,characterData:true});
    o.observe(document.getElementById('pmOverlayRoot'),{childList:true,subtree:true,attributes:true,characterData:true});
    window.__phRzStop=()=>o.disconnect();
    const tick=(ts)=>{const T=window.__phRz; if(T.t0==null)T.t0=ts;
      const f=document.querySelector('.history-flyout');
      const gr=document.querySelector('.assistant-grid');
      const pane=document.querySelector('.assistant-pane');
      const tr=document.querySelector('.transcript');
      const r=f&&f.getBoundingClientRect();
      T.out.push({t:+(ts-T.t0).toFixed(1), x:r?+r.left.toFixed(2):null, w:r?+r.width.toFixed(2):null,
        right:r?+r.right.toFixed(2):null,
        paneL:pane?+pane.getBoundingClientRect().left.toFixed(2):null,
        gutter:gr?+parseFloat(getComputedStyle(gr).paddingLeft).toFixed(2):null,
        trL:tr?+tr.getBoundingClientRect().left.toFixed(2):null,
        rz:document.body.dataset.phResizing||null,
        v:getComputedStyle(document.documentElement).getPropertyValue('--ph-user-w').trim()});
      if(!T.stop) requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  });
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for(let i=1;i<=10;i++){ await page.mouse.move(start.x + i*8, start.y); await page.waitForTimeout(24); }
  await page.waitForTimeout(60);
  const flagDuring = await page.evaluate(()=>document.body.dataset.phResizing||null);
  const mutDuring  = await page.evaluate(()=>window.__phRz.mut);
  await page.mouse.up();
  await page.waitForTimeout(350);
  const rz = await page.evaluate(()=>{window.__phRz.stop=true;window.__phRzStop();return window.__phRz.out;});

  const moving = rz.filter(s=>s.rz==='1');
  const ws=[...new Set(moving.map(s=>s.w))];
  check(moving.length>4 && ws.length>=4 && Math.max(...ws)-Math.min(...ws)>30,
        'DRAG: the drawer width follows the pointer', {frames:moving.length, distinct:ws.length, min:Math.min(...ws), max:Math.max(...ws)});
  check(flagDuring==='1','body[data-ph-resizing] is set for the whole drag',{flagDuring});
  check(moving.length>4 && moving.every(s=>Math.abs(s.x-s.paneL)<=1),
        'PIN-IN-PLACE HOLDS DURING A RESIZE: the drawer\'s left edge never moves',
        {offenders:moving.filter(s=>Math.abs(s.x-s.paneL)>1).slice(0,4)});
  check(moving.length>4 && moving.every(s=>s.gutter!=null && Math.abs(s.w-s.gutter)<=1),
        'COUPLING HOLDS ON EVERY FRAME: the reserved gutter equals the drawer width',
        {offenders:moving.filter(s=>s.gutter==null||Math.abs(s.w-s.gutter)>1).slice(0,4)});
  check(moving.length>4 && moving.every(s=>s.trL!=null && Math.abs(s.trL-s.right)<=1),
        'SEAM HOLDS ON EVERY FRAME: the transcript starts at the drawer\'s right edge',
        {offenders:moving.filter(s=>s.trL==null||Math.abs(s.trL-s.right)>1).slice(0,4)});
  /* The 240ms pin transition must be suppressed while dragging, or the drawer
     lags the pointer by a full --ph-t.  Painted width == published width, same frame. */
  check(moving.length>4 && moving.every(s=>!s.v || Math.abs(s.w-parseFloat(s.v))<=1.5),
        'NO TRANSITION LAG: the painted width equals the published --ph-user-w on the same frame',
        {offenders:moving.filter(s=>s.v&&Math.abs(s.w-parseFloat(s.v))>1.5).slice(0,4)});
  check(tickStopped && mutDuring===0,
        tickStopped ? 'CHEAP PATH: the drag renders nothing — zero mutations in #pmRoot and #pmOverlayRoot'
                    : 'CHEAP PATH: NOT MEASURED — the work tick could not be stopped, so a render inside the drag window would be indistinguishable from the drag rendering',
        {tickStopped, mutDuring});

  /* keyboard: role="separator" + tabindex is only honest if the arrows move it */
  const kb0 = await page.evaluate(()=>{const h=document.querySelector('[data-ph-resize]');h.focus();
    return {focused:document.activeElement===h, w:document.querySelector('.history-flyout').getBoundingClientRect().width};});
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(330);
  const kb1 = await page.evaluate(()=>{const h=document.querySelector('[data-ph-resize]');
    return {w:document.querySelector('.history-flyout').getBoundingClientRect().width,
            g:parseFloat(getComputedStyle(document.querySelector('.assistant-grid')).paddingLeft),
            now:h?Number(h.getAttribute('aria-valuenow')):null,
            focused:!!(document.activeElement&&document.activeElement.hasAttribute&&document.activeElement.hasAttribute('data-ph-resize'))};});
  check(kb0.focused && kb1.w < kb0.w-6 && Math.abs(kb1.w-kb1.g)<1,
        'KEYBOARD: ArrowLeft narrows the drawer and the gutter follows it', {kb0, kb1});
  check(kb1.now===Math.round(kb1.w) && kb1.focused,
        'KEYBOARD: aria-valuenow is refreshed and focus survives the render', kb1);

  /* Leave the drawer at its declared default so the sections after this one
     measure what they were written to measure. */
  await page.evaluate(()=>{try{localStorage.removeItem('pm56-history-w');}catch(e){}
    document.documentElement.style.removeProperty('--ph-user-w');});
  await page.waitForTimeout(350);
  const back = await page.evaluate(()=>({w:document.querySelector('.history-flyout').getBoundingClientRect().width,
    g:parseFloat(getComputedStyle(document.querySelector('.assistant-grid')).paddingLeft),
    dflt:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ph-pin-w'))}));
  check(back.dflt>0 && Math.abs(back.w-back.dflt)<1 && Math.abs(back.w-back.g)<1,
        'With no stored width the drawer returns to the --ph-pin-w default, gutter still coupled', back);
  await page.evaluate(()=>{const b=document.querySelector('[data-action="start-working"]'); if(b) b.click();});
});
await shot(`item4-resized${REDUCED?'-reduced':''}.png`);

/* =====================================================================
   Regressions: 8 themes, no overflow, other takes untouched
   ===================================================================== */
await sec('regression: 8 themes', async()=>{
  const ids=await page.evaluate(()=>(window.PM56_DATA&&window.PM56_DATA.themes||[]).map(t=>t.id));
  const bad=[];
  for(const id of (ids.length?ids:['basic-dark'])){
    await page.evaluate(t=>PM56_DEMO.setTheme(t),id);
    await page.waitForTimeout(160);
    const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
      bw:document.body.scrollWidth,drawer:!!document.querySelector('.history-flyout')}));
    if(r.sw>r.cw+1||r.bw>r.cw+1||!r.drawer) bad.push({id,...r});
    if(SHOTS && ids.indexOf(id)<8) await shot(`theme-${id}${REDUCED?'-reduced':''}.png`);
  }
  check(bad.length===0 && ids.length===8, `No overflow and the drawer paints in all ${ids.length} themes`, {bad,ids});
  await page.evaluate(()=>PM56_DEMO.setTheme('basic-dark'));
});
await sec('regression: other seven takes', async()=>{
  // the other seven takes must still use renderStatus(), untouched
  const other=[]; let seen=0;
  for(const v of [0,1,2,3,4,6,7]){
    seen++;
    await page.evaluate(x=>PM56_DEMO.setVariant(1,x),v);
    await page.waitForTimeout(120);
    const r=await page.evaluate(()=>({ph:document.querySelectorAll('.history-flyout .ph-status').length,
      stock:document.querySelectorAll('.history-flyout .thread-status-slot > :not(.ph-status)').length}));
    if(r.ph!==0||r.stock===0) other.push({v,...r});
  }
  check(other.length===0 && seen===7,'The other seven takes still render the stock indicator',{other,seen});
  await page.evaluate(()=>PM56_DEMO.setVariant(1,5));
});
await sec('regression: reset all', async()=>{
  await page.evaluate(()=>PM56_DEMO.reset());
  await page.waitForTimeout(700);
  const r=await drawerGeom();
  check(r.present && (r.mode==='pinned'||r.mode==='open') && (await page.locator('.history-panel').count())===0,
        'Reset all does not resurrect the old .history-panel column', r);
});

check(consoleErrors.length===0,'Zero console errors/warnings',consoleErrors);
check(pageErrors.length===0,'Zero page errors',pageErrors);

console.log(`\n${pass} pass / ${fail} fail  (${REDUCED?'prefers-reduced-motion: reduce':'normal motion'})`);
if(OUT) fs.writeFileSync(OUT,JSON.stringify({pass,fail,reduced:REDUCED,results,consoleErrors,pageErrors},null,1));
await browser.close();
process.exit(fail?1:0);
