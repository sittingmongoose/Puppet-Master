/* tests/audit.mjs — the 5.6 Pro interaction suite.
 *
 * Three things this file has to get right that it previously did not, all of
 * them found by measurement rather than review:
 *
 * 1. NO TEST MAY POISON ITS SUCCESSOR.  There used to be no cleanup between
 *    tests.  When one assertion threw it left the context compact menu OPEN,
 *    and that menu intercepted pointer events for the next eight tests, so a
 *    single copy mismatch was reported as TEN failures naming eight innocent
 *    modules.  `cleanup()` now runs after every test and, crucially, VERIFIES
 *    itself — a silent cleanup failure is the same class of bug as a silent
 *    assertion.
 *
 * 2. AN UNSCOPED TEXT MATCHER IS NOT A SCOPE.  `getByText('More details',
 *    {exact:true})` resolves to 26 elements in the `plain` thread — every
 *    message action row carries that label.  It only ever passed because the
 *    old compact menu used Title Case and the message row did not: an accident.
 *    Every text assertion now goes through `one()`, which fails on 0 matches
 *    (the assertion measures nothing) AND on more matches than declared (the
 *    assertion is an accident), and prints the offending texts either way.
 *
 * 3. A HARNESS THAT DIES MUST NOT LEAVE A GREEN REPORT BEHIND.  `inViewport()`
 *    and `noPageOverflow()` were called at top level, outside `safe()`.  A
 *    missing element there throws TimeoutError out of the module, node exits
 *    on an uncaught exception, no report is written, and `reports/audit.json`
 *    keeps whatever it said last time.  Everything is inside `safe()` now, and
 *    the report is written from a `finally`.
 *
 * Run:  node tests/audit.mjs [outfile.json] [rootHintDir] [--no-orphan-gate]
 *       PM56_SRC=<dir>  — where the CSS/JS sources live, if not next to index.html
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { runOrphanGate } from './orphan-gate.mjs';
let chromium;
try { ({chromium}=await import('playwright')); }
catch(e1){ try { ({chromium}=await import('playwright-core')); } catch(e2){ fs.writeFileSync(process.argv[2]||'audit.json',JSON.stringify({overall:'MISSING',error:String(e2)},null,2)); process.exit(2); } }

const here=path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const root=path.resolve(process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:here,'..');
const out=path.resolve(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:path.join(root,'reports','audit.json'));
const srcDir=process.env.PM56_SRC?path.resolve(process.env.PM56_SRC):root;
const wantOrphanGate=!process.argv.includes('--no-orphan-gate');
const evidence=path.join(root,'evidence','screenshots');
fs.mkdirSync(evidence,{recursive:true});
fs.mkdirSync(path.dirname(out),{recursive:true});
const failures=[],passes=[],consoleErrors=[],pageErrors=[],matchers=[],hygiene=[];
let orphan=null;
const check=(ok,label,detail='')=>{(ok?passes:failures).push({label,detail});};
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('pageerror',e=>pageErrors.push(String(e)));
const url=pathToFileURL(path.join(root,'index.html')).href;

function writeReport(extra={}){
  const report={overall:failures.length?'FAIL':'PASS',
    summary:{passed:passes.length,failed:failures.length,consoleErrors:consoleErrors.length,pageErrors:pageErrors.length},
    ...extra,passes,failures,consoleErrors,pageErrors,
    matcherHygiene:matchers,cleanupLog:hygiene,generatedAt:new Date().toISOString()};
  fs.writeFileSync(out,JSON.stringify(report,null,2));
  return report;
}

try{
  await page.goto(url,{waitUntil:'load',timeout:20000});
  await page.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:10000});
  /* Control-run hook. A gate nobody has tried to make RED is worth nothing, and
     an always-red gate is worth less than nothing. PM56_INJECT_CSS lets a
     control run drive the real suite -- not a copy of it that can drift --
     against a configuration where a defect cannot occur. Unset in normal runs. */
  if(process.env.PM56_INJECT_CSS){
    await page.addStyleTag({content:process.env.PM56_INJECT_CSS});
    /* shaped like a cleanup entry: line 538 filters this list on h.stuck.length,
       and a bare {injectedCss} threw a TypeError out of the whole suite. */
    hygiene.push({after:'PM56_INJECT_CSS',injectedCss:process.env.PM56_INJECT_CSS,stuck:[],tries:0});
  }
  check(true,'Boots from direct file URL');
}catch(e){check(false,'Boots from direct file URL',String(e));}

/* ------------------------------------------------------------------ cleanup */
/* What counts as "transient" here is deliberately narrow.  Escape's handler
   order in app.js is  menu -> dialog -> context drawer -> floating history ->
   decision, and the history drawer is part of the RESTING ui in this build, so
   a blanket Escape loop would close it and change what every later test sees —
   cleanup-induced failures instead of cleanup.  Each surface is therefore
   dismissed through the control that owns it, driven off the real state. */
async function overlayState(){
  return await page.evaluate(()=>{
    let s={}; try{ s=PM56_DEMO.getState(); }catch(e){}
    return {
      menu:!!s.menu, dialog:!!s.dialog, hover:!!s.hover, decision:!!(s.decision&&s.decision.type),
      ctxDetails:!!(s.context&&s.context.details),
      activityOpen:!!(s.activity&&s.activity.open), activityPinned:!!(s.activity&&s.activity.pinned),
      domMenu:document.querySelectorAll('[data-overlay="root-menu"]').length,
      domSidecar:document.querySelectorAll('[data-overlay="sidecar"]').length,
      domHover:document.querySelectorAll('[data-overlay="hover"]').length,
      domDrawer:document.querySelectorAll('.drawer').length,
      domPanel:document.querySelectorAll('.activity-panel').length,
      domGhost:document.querySelectorAll('body > .overlay-menu').length
    };
  }).catch(()=>({unreadable:true}));
}
async function cleanup(label){
  let before=await overlayState(), tries=0;
  try{
    await page.mouse.move(2,2);                       // drop any hover card
    while(tries++<8){
      const s=await overlayState();
      if(s.unreadable)break;
      if(s.menu){ await page.keyboard.press('Escape'); await page.waitForTimeout(30); continue; }
      if(s.dialog){ await page.keyboard.press('Escape'); await page.waitForTimeout(30); continue; }
      if(s.ctxDetails){ await page.keyboard.press('Escape'); await page.waitForTimeout(30); continue; }
      if(s.activityPinned){ await page.evaluate(()=>document.querySelector('[data-action="unpin-activity"]')?.click()); await page.waitForTimeout(40); continue; }
      if(s.activityOpen){ await page.evaluate(()=>document.querySelector('[data-action="close-activity"]')?.click()); await page.waitForTimeout(40); continue; }
      if(s.decision){ await page.evaluate(()=>document.querySelector('[data-action="close-decision"]')?.click()); await page.waitForTimeout(40); continue; }
      if(s.hover||s.domHover){ await page.mouse.move(2,2); await page.waitForTimeout(220); 
        const t=await overlayState(); if(t.hover||t.domHover){ if(tries>4)break; } continue; }
      if(s.domGhost){ await page.waitForTimeout(120); continue; }   // menus.js close clone, self-clearing
      break;
    }
    await page.waitForTimeout(60);
  }catch(e){ /* cleanup itself must never throw into the next test */ }
  const after=await overlayState();
  const stuck=[];
  for(const k of ['menu','dialog','ctxDetails','decision','activityOpen','activityPinned'])
    if(after[k])stuck.push(k);
  for(const k of ['domMenu','domSidecar','domHover','domDrawer','domPanel'])
    if(after[k])stuck.push(`${k}=${after[k]}`);
  hygiene.push({after:label,before,after_:after,stuck,tries});
  if(stuck.length) check(false,`Cleanup after: ${label}`,JSON.stringify({stuck,after}));
  return stuck;
}

/* --------------------------------------------------------------- assertions */
async function safe(label,fn){
  try{await fn();passes.push({label});}
  catch(e){failures.push({label,detail:String(e).split('\n').slice(0,6).join(' | ')});}
  finally{ await cleanup(label); }
}
/* safe() WITHOUT cleanup, for the tiers that deliberately carry state forward
   (the theme/width sweep sets a theme, then screenshots it). */
async function safeKeep(label,fn){
  try{await fn();passes.push({label});}
  catch(e){failures.push({label,detail:String(e).split('\n').slice(0,6).join(' | ')});}
}

/* one(scope,text) — the matcher-hygiene helper.
   `allow` is the number of elements this assertion EXPECTS to see. 0 matches
   means the assertion measures nothing; more than `allow` means it is not
   scoped, it is lucky. Both are failures, and both print what they matched. */
async function one(scope,text,opts={},allow=1){
  const loc=scope.getByText(text,opts);
  try{ await loc.first().waitFor({state:'attached',timeout:8000}); }catch(e){}
  const n=await loc.count();
  matchers.push({text:String(text),exact:opts.exact!==false,found:n,allow});
  if(n===0)throw new Error(`matcher "${text}" matched NOTHING — the assertion measures nothing`);
  if(allow!=='any'&&n>allow){
    const seen=(await loc.allTextContents()).slice(0,6);
    throw new Error(`matcher "${text}" is unscoped: ${n} matches, expected <=${allow} :: ${JSON.stringify(seen)}`);
  }
  return loc.first();
}
const seeIn=async(scope,text,opts={},allow=1)=>{await (await one(scope,text,opts,allow)).waitFor();};

async function inViewport(selector,label=selector){
  const result=await page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return {ok:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>0&&r.height>0,r:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},vp:{w:innerWidth,h:innerHeight}}},{timeout:8000});
  check(result.ok,`Viewport containment: ${label}`,JSON.stringify(result));
}
async function noPageOverflow(label){const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth}));check(r.sw<=r.cw+1&&r.bw<=r.cw+1,`No page horizontal overflow: ${label}`,JSON.stringify(r));}
/* Every geometry probe now runs inside safe-style protection: a missing element
   used to kill the process instead of failing one assertion. */
async function inViewportSafe(sel,label){try{await inViewport(sel,label);}catch(e){check(false,`Viewport containment: ${label}`,String(e).split('\n')[0]);}}
async function noOverflowSafe(label){try{await noPageOverflow(label);}catch(e){check(false,`No page horizontal overflow: ${label}`,String(e).split('\n')[0]);}}

try{
await safe('Initial demo content is populated',async()=>{
  // scoped: "Query Performance" is BOTH the chat title and a thread row, so an
  // unscoped exact match resolves to 2. Assert both, deliberately.
  await seeIn(page.locator('.chat-header'),'Query Performance',{exact:true});
  await seeIn(page.locator('.thread-row'),'Query Performance',{exact:true});
  await seeIn(page.locator('.transcript'),'Analyze the analytics query performance',{exact:false});
  await page.locator('.working-card').waitFor();
  const rows=await page.locator('.thread-row').count();if(rows<10)throw new Error(`Only ${rows} thread rows`);
});
await safe('Initial working animation advances',async()=>{
  const a=await page.evaluate(()=>PM56_DEMO.getState().work.step);await page.waitForTimeout(2600);const b=await page.evaluate(()=>PM56_DEMO.getState().work.step);if(b<=a)throw new Error(`step ${a} -> ${b}`);
});
await safe('No page horizontal overflow: initial',async()=>{await noPageOverflow('initial');});

await safe('Context Ring opens compact menu',async()=>{
  /* item 6: the compact menu's two stacked full-width rows were replaced by
     u11's single dense action row, whose minibuttons read "Compact now" /
     "More details". Everything here is scoped to the open menu — "More
     details" is also the label on every message action row (26 of them in the
     plain thread), and "Source composition"/"83.9K"/"78.34%" all appear in the
     drawer too. */
  await page.locator('.context-ring').click();
  const ctxMenu=page.locator('[data-overlay="root-menu"]');
  await ctxMenu.waitFor({state:'visible'});
  await seeIn(ctxMenu,'Compact now',{exact:true});
  await seeIn(ctxMenu,'More details',{exact:true});
  await seeIn(ctxMenu,'83.9K',{exact:false});   // window used in the head fraction
  await seeIn(ctxMenu,'78.34%',{exact:false});
  await seeIn(ctxMenu,'Source composition',{exact:false});
  await inViewport('[data-overlay="root-menu"]','Context compact menu');
});
await safe('Context More Details contains required metrics',async()=>{
  await page.locator('.context-ring').click();
  await page.locator('[data-overlay="root-menu"]').getByText('More details',{exact:true}).click();
  const drawer=page.locator('.drawer');
  await drawer.waitFor({state:'visible'});
  await seeIn(drawer,'Context More Details',{exact:true});
  await seeIn(drawer,'current window used',{exact:false});
  await seeIn(drawer,'Tokens loaded',{exact:false});
  await seeIn(drawer,'Cache hit',{exact:false});
  await seeIn(drawer,'Cached tokens',{exact:false},2); // metric card + the cache note
  await seeIn(drawer,'Source composition',{exact:false});
  await seeIn(drawer,'Context growth',{exact:false});
  await seeIn(drawer,'API billed',{exact:false});
  await page.locator('[data-action="close-context-details"]').click();
});

for(const domain of ['goal','todo','subagents','changes','artifacts']){
  await safe(`Activity hover preview: ${domain}`,async()=>{
    const b=page.locator(`[data-hover-domain="${domain}"]`);await b.hover();
    const preview=page.locator('.hover-card.ab-card[role="dialog"]');
    await preview.waitFor({state:'visible'});await inViewport('.hover-card.ab-card',`${domain} hover`);
    if((await preview.getAttribute('data-domain'))!==domain)throw new Error(`Preview did not target ${domain}`);
  });
  await safe(`Activity click opens focused Status Board: ${domain}`,async()=>{
    await page.locator(`[data-hover-domain="${domain}"]`).click();await page.locator('.activity-panel').waitFor({state:'visible'});
    const panel=page.locator('.activity-panel');
    if((await panel.getAttribute('data-variant'))!=='1')throw new Error('Status Board is not the default');
    if((await panel.getAttribute('data-scope'))!=='focus')throw new Error('Activity bar did not open focused scope');
    if((await panel.getAttribute('data-domain'))!==domain)throw new Error(`Expected ${domain} focus`);
    if(await panel.locator('.pmap-tile').count())throw new Error('Focused scope still renders overview tiles');
    const selected=panel.locator('.activity-filter button[aria-pressed="true"]');
    if(await selected.count()!==1)throw new Error('Focused scope must expose exactly one selected domain');
  });
}

await safe('Activity Detail Show all and domain drill-down',async()=>{
  await page.locator('[data-hover-domain="changes"]').click();
  const panel=page.locator('.activity-panel');
  await panel.locator('[data-action="activity-scope"][data-value="all"]').click();
  const expected=await page.locator('.activity-item[data-hover-domain]').count();
  const tiles=panel.locator('.pmap-tile');
  if(await tiles.count()!==expected)throw new Error(`Expected ${expected} domain tiles, found ${await tiles.count()}`);
  if((await panel.getAttribute('data-scope'))!=='all')throw new Error('Show all did not change panel scope');
  if(await panel.locator('.activity-filter button[aria-pressed="true"]').count())throw new Error('All scope must not expose a false selected domain');
  await tiles.filter({hasText:'Todo'}).click();
  if((await panel.getAttribute('data-domain'))!=='todo'||(await panel.getAttribute('data-scope'))!=='focus')throw new Error('Overview tile did not drill into Todo');
});

await safe('Activity Detail pin and unpin',async()=>{
  await page.locator('[data-hover-domain="goal"]').click();
  const pinned=await page.evaluate(()=>PM56_DEMO.getState().activity.pinned);if(!pinned)throw new Error('not pinned');
  await page.locator('[data-action="unpin-activity"]').click();
  if(await page.evaluate(()=>PM56_DEMO.getState().activity.pinned))throw new Error('did not unpin');
  await page.locator('[data-action="pin-activity"]').click();
  if(!await page.evaluate(()=>PM56_DEMO.getState().activity.pinned))throw new Error('did not pin again');
});

async function openRootMenu(kind){await page.locator(`[data-action="open-menu"][data-menu="${kind}"]`).click();await page.locator('[data-overlay="root-menu"]').waitFor({state:'visible'});}
await safe('Model picker and effort sidecar',async()=>{
  await openRootMenu('model');await inViewport('[data-overlay="root-menu"]','model picker');
  const before=await page.locator('[data-overlay="root-menu"]').boundingBox();
  const row=page.locator('.model-row').first();await row.hover();await page.locator('[data-overlay="sidecar"]').waitFor({state:'visible'});await inViewport('[data-overlay="sidecar"]','model sidecar');
  await page.locator('[data-input="model-search"]').fill('Sonnet');await page.waitForTimeout(600);const after=await page.locator('[data-overlay="root-menu"]').boundingBox();if(after.height>before.height+2)throw new Error(`picker grew ${before.height}->${after.height}`);
});
await safe('Plan and Deep Plan hover sidecars',async()=>{
  await openRootMenu('mode');await page.locator('[data-submenu="plan"]').first().hover();await page.locator('[data-overlay="sidecar"]').waitFor();await inViewport('[data-overlay="sidecar"]','Plan sidecar');await page.keyboard.press('Escape');
  await page.waitForTimeout(320);   // menus.js parks a pointer-events:none close clone for 260ms
  await openRootMenu('mode');await page.locator('[data-submenu="deep-plan"]').first().hover();await page.locator('[data-overlay="sidecar"]').waitFor();await inViewport('[data-overlay="sidecar"]','Deep Plan sidecar');
});
await safe('Capability hover sidecars',async()=>{
  await openRootMenu('wand');
  /* Assistant-redesign wave: the wand's BSD and ELI5 rows were superseded.
     BSD now renders its own `bsd-v2` sidecar (Off/Auto/On + Configure…) from
     bsd.js through the new `submenu` slot, and ELI5 is an independent
     conversation toggle owned by assistant-features.js rather than a
     capability sidecar. `bsd-menu`/`eli5-menu` still resolve in app.js as
     fallbacks for a build without those modules, but nothing opens them. */
  for(const sub of ['goal-menu','crew-menu','bsd-v2','thought-menu']){
    await page.locator(`[data-submenu="${sub}"]`).first().hover();
    await page.locator('[data-overlay="sidecar"]').waitFor();
    await inViewport('[data-overlay="sidecar"]',sub);
  }
});
await safe('Context Lens header strip',async()=>{
  await page.keyboard.press('Escape');
  await page.waitForTimeout(320);
  await page.locator('[data-action="lens-open"]').click();
  await page.locator('.overlay-menu.lens-strip').waitFor({state:'visible'});
  await inViewport('.overlay-menu.lens-strip','Context Lens strip');
  await page.keyboard.press('Escape');
});

await safe('Working Animation controls and history',async()=>{
  await page.evaluate(()=>PM56_DEMO.resetWorking());await page.locator('[data-action="start-working"]').click();await page.waitForTimeout(1600);await page.locator('[data-action="pause-working"]').click();
  await page.locator('[data-action="step-working"]').click();await page.locator('[data-action="complete-working"]').click();
  /* Default take is Orbit: elapsed lives in the card head, not a "Worked for"
     receipt chip (orbit.js passes {elapsed:false} on the strip). Open Orbit
     stage has no receipt row until collapsed; other takes still emit chips. */
  await seeIn(page.locator('.working-card .working-head'),'Completed',{exact:false});
  const elapsedTxt=await page.locator('.working-card .working-head .sub').first().innerText();
  if(!/\d+m \d{2}s/.test(elapsedTxt))throw new Error(`elapsed missing from working head: ${JSON.stringify(elapsedTxt)}`);
  const chips=await page.locator('.working-card .work-receipt .receipt-chip').count();
  const orbitOpen=await page.locator('.working-card .orbit-stage').count();
  if(!chips && !orbitOpen)throw new Error('receipt chips missing');
  await page.locator('[data-action="toggle-work-history"]').click();
  await seeIn(page.locator('.work-history'),'Organized work stream and evidence',{exact:true});
});
for(let v=0;v<24;v++)await safe(`Distinct Working Animation option ${v+1}`,async()=>{await page.evaluate(v=>PM56_DEMO.setVariant(2,v),v);await page.locator(`.working-variant-${v}`).waitFor();const h=await page.locator('.working-card').evaluate(el=>el.innerHTML.length);if(h<700)throw new Error(`too shallow ${h}`);});
/* The take is PINNED. This assertion used to run on whatever take the 24-option
   loop above happened to leave selected (option 23), and it is not true of every
   take -- measured, 5 of 24 do not expand a phase from `.wa-disc[data-value=
   "files"]`. Inheriting a variant from the previous test is the same class of
   cross-test coupling as inheriting an open menu. Take 3 uses the shared phase
   chrome, which is what this assertion is about. */
await safe('Working chrome compacts and re-expands a phase',async()=>{
  await page.evaluate(()=>PM56_DEMO.setVariant(2,2));
  await page.evaluate(()=>PM56_DEMO.completeWorking());
  await page.locator('.wa-chrome .pm-roll').first().waitFor();
  await page.locator('.wa-disc[data-value="files"]').first().click();
  await seeIn(page.locator('.wa-chrome'),'Read src/analytics/queries.rs',{exact:true});
  await page.locator('.wa-disc[data-value="files"]').first().click();
  if(await page.locator('.wa-row').count())throw new Error('phase did not collapse');
});
/* ...and the sweep the pin makes necessary: pinning one take must not hide that
   the other 23 were never checked. Takes that own their own chrome (Orbit) are
   allowed to have no `.wa-disc` at all; a take that HAS the disc and does
   nothing with it is a defect. */
await safe('Phase compact and expand across all 24 working takes',async()=>{
  /* Asserts the PROPERTY (the disc toggles its rows and returns to where it started), not a
     presumed starting state. The previous form assumed the chrome opens closed and demanded
     opened>=1 then closed===0; after completeWorking() some takes restore an open phase, so
     it read the toggle inverted (opened:0 / closed:3) and called working takes broken.
     It never genuinely passed -- the earlier green came from the loop stopping at take 23.
     Takes carrying CHROME_OPTS.noRows (v = 0, 11, 15) print rows in their own body, so the
     shared chrome has none to toggle; base===toggled===0 and there is nothing to assert.
     Do NOT add a probe click: an extra click desynchronises every later take. */
  const broken=[];
  for(let v=0;v<24;v++){
    await page.evaluate(v=>PM56_DEMO.setVariant(2,v),v);
    await page.evaluate(()=>PM56_DEMO.completeWorking());
    await page.waitForTimeout(180);
    const disc=page.locator('.wa-disc[data-value="files"]');
    if(!await disc.count())continue;              // take renders its own chrome
    let base=-1,toggled=-1,back=-1,err='';
    try{
      base=await page.locator('.wa-row').count();
      await disc.first().click({timeout:1500});await page.waitForTimeout(200);
      toggled=await page.locator('.wa-row').count();
      await disc.first().click({timeout:1500});await page.waitForTimeout(180);
      back=await page.locator('.wa-row').count();
    }catch(e){err=String(e).split('\n')[0];}
    if(!err&&base===0&&toggled===0&&back===0)continue;   // no rows in the shared chrome
    if(err||toggled===base||back!==base)broken.push({take:v+1,base,toggled,back,err});
  }
  await page.evaluate(()=>PM56_DEMO.setVariant(2,0));
  if(broken.length)throw new Error(`takes whose phase disc does not toggle its rows: ${JSON.stringify(broken)}`);
});

/* The working card used to LURCH, and every take was a victim: [data-flip] sits
   on `.working-body`, which app.js:664 emits identically for all 24.
   flipHeights() reads its FLIP target with getBoundingClientRect() one line
   after the pmPatch, and a CSS transition still presents its OLD value at t=0 --
   so on an Orbit toggle, where the panel track runs 0fr <-> 1fr over 420ms, the
   target came back short by the whole panel AND pointing the wrong way. The card
   crept backwards for 320ms and then snapped 231-271px in a single frame.
   Separately, the animation's clock started in the frame that still had to lay
   out everything the patch wrote, so the first frame anyone SAW was already
   36-64% through the travel: another 282-349px jump, on all 24.
   Evidence: handoff/w6/flip/measure-baseline.json vs measure-fixed2.json.

   This asserts the PROPERTY, not the mechanism, so it survives a rewrite of the
   fix: whatever drives the height, the subject must travel forward, in humane
   steps, and stop.

   The per-frame budget is max(40px, 25% of travel) rather than a flat 40px, and
   that number is measured rather than assumed: the FLIP's own easing,
   cubic-bezier(.22,.80,.28,1) over 320ms, puts 17.9% of the travel into its
   FIRST 16.7ms frame by construction, so a flat 40px would be a standing
   failure for any travel past ~215px -- the work-history toggle alone travels
   547px. The 40px floor still does the work on short travels, where a
   percentage of a small number means nothing. Deltas are discounted by
   min(1, 16.7/dt) so a DROPPED frame, which shows two frames of legitimate
   travel in one sample, is not reported as a lurch; that discount can only
   soften a reading, never invent one.

   Stated plainly so nobody mistakes it for more than it is: the settle limb is
   NOT what the old defect violated -- it snapped, but it snapped on time
   (342ms). It is here for the opposite failure, a fix that leaves the box
   drifting. On the reverted build the limbs that go red are the frame budget
   and backwards (both on the Orbit toggle, which is cause (c)) and the
   first-painted-frame limb (on every take, which is the clock defect). */
await safe('Working-card FLIP travels forward, in steps, and stops',async()=>{
  await page.evaluate(()=>{
    /* Timing has to come from an in-page rAF loop: a Playwright click round
       trip fabricates a phantom ~200ms and would swamp everything here. */
    /* `now` is the rAF FRAME timestamp, not performance.now(). It has to be:
       the frame clock is the clock the animations are driven by, and
       performance.now() taken after a 30ms renderApp reports a gap the
       animation did not actually experience -- which is exactly the reading
       that would turn a dropped frame into a phantom lurch. */
    window.__flipRec=(trigSrc,ms)=>new Promise(res=>{
      const trig=eval('('+trigSrc+')');
      const rows=[];let n=0,fired=false,t0=null,subj=null;
      const h=()=>{if(!subj||!subj.isConnected)subj=document.querySelector('.working-card [data-flip]');
        return subj?+subj.getBoundingClientRect().height.toFixed(2):null;};
      const tick=(now)=>{
        if(!fired&&n>=3){subj=document.querySelector('.working-card [data-flip]');trig();t0=now;fired=true;rows.push({t:0,mark:1,h:h()});}
        else rows.push({t:t0===null?null:+(now-t0).toFixed(1),h:h()});
        n++;
        if(t0===null||now-t0<ms)requestAnimationFrame(tick);else res(rows);};
      requestAnimationFrame(tick);});
  });
  const verdict=(rows,label)=>{
    const f=rows.filter(r=>r.h!=null), i0=f.findIndex(r=>r.mark), out=[];
    if(i0<1)return [`${label}: no trigger frame — this assertion measured nothing`];
    const h0=f[i0-1].h, hEnd=f[f.length-1].h, travel=+(hEnd-h0).toFixed(2);
    if(Math.abs(travel)<4)return [`${label}: the trigger moved nothing (${travel}px) — this assertion measured nothing`];
    const budget=Math.max(40,0.25*Math.abs(travel));
    let peak=0,peakT=null,peakRaw=0,backAt=null;
    for(let i=i0;i<f.length;i++){
      const dt=Math.max(1,(f[i].t||0)-(f[i-1].t||0));
      const raw=f[i].h-f[i-1].h, norm=Math.abs(raw)*Math.min(1,16.7/dt);
      if(norm>Math.abs(peak)){peak=raw<0?-norm:norm;peakT=f[i].t;peakRaw=+raw.toFixed(2);}
      const rel=f[i].h-h0;                       // 4px dead-band = app.js's own early-out
      if(backAt===null&&Math.abs(rel)>4&&(rel>0)!==(travel>0))backAt={t:f[i].t,h:f[i].h,rel:+rel.toFixed(2)};
    }
    let settle=null;
    for(let j=i0;j<f.length-5;j++){let ok=true;
      for(let k=j;k<j+5;k++)if(Math.abs(f[k].h-hEnd)>1){ok=false;break;}
      if(ok){settle=f[j].t;break;}}
    /* The motion must START at its start. The dt discount above deliberately
       forgives a dropped frame MID-FLIGHT, but a dropped FIRST frame is a
       defect in its own right and the discount would hide it: the animation
       clock used to run through the 33-50ms the browser spent laying out what
       pmPatch had just written, so the first frame anyone SAW was already
       36-64% of the way through the travel. Undiscounted, and stable by
       construction on a build that defers the clock -- the animation is at
       currentTime 0 on that frame whatever the machine is doing, so this
       reads 0% rather than merely "small". */
    const second=f[i0+1];
    if(second){
      const started=Math.abs(second.h-h0);
      if(started>budget)out.push(`${label}: the first painted frame after the trigger is already ${Math.round(100*started/Math.abs(travel))}% of the travel (${started.toFixed(1)}px) — budget ${budget.toFixed(1)}px`);
    }
    if(Math.abs(peak)>budget)out.push(`${label}: ${peak.toFixed(1)}px in one frame at ${peakT}ms (raw ${peakRaw}px) — budget ${budget.toFixed(1)}px for a ${travel}px travel`);
    if(backAt)out.push(`${label}: travels BACKWARDS at ${backAt.t}ms (h=${backAt.h}, ${backAt.rel}px against a ${travel}px travel)`);
    if(settle===null||settle>520)out.push(`${label}: settles at ${settle}ms, limit 520ms (travel ${travel}px)`);
    return out;
  };
  const TOG='function(){document.querySelector(\'[data-action="toggle-work-history"]\').click();}';
  const rec=(t,ms)=>page.evaluate(([a,b])=>window.__flipRec(a,b),[t,ms]);
  const bad=[];
  for(const v of [1,12,0,7]){
    await page.evaluate(v=>{PM56_DEMO.setVariant(2,v);PM56_DEMO.setWorkStep(7);},v);
    await page.waitForTimeout(700);
    /* Take 1's stage is ALWAYS open now — a live orbit card has no collapse
       affordance and a node click only re-pins the panel (no height travel),
       so the old orbit expand/collapse FLIP probes have nothing to trigger.
       The one surviving orbit grid motion is the two-beat strip reopen, and
       orbit-verify.mjs section 9 traces that with an in-page rAF sampler.
       Here take 1 is measured through the same work-history toggle as every
       other take, which is the height travel it still performs. */
    bad.push(...verdict(await rec(TOG,1000),`take ${v} work-history open`));
    await page.waitForTimeout(500);
    bad.push(...verdict(await rec(TOG,1000),`take ${v} work-history close`));
    await page.waitForTimeout(500);
  }
  await page.evaluate(()=>{PM56_DEMO.setVariant(2,0);PM56_DEMO.resetWorking();});
  await page.waitForTimeout(300);
  if(bad.length)throw new Error(bad.join(' || '));
});

/* Assistant-redesign wave (2026-09-03). This asserted the RETIRED plan card:
   `.plan-card` with a `View Plan` button. The Plan is now the `plan-card-v2`
   document card owned by plans.js -- the document IS the card, so `View Plan`
   is gone, and the footer is one Build control plus the eligible actions.
   Rewritten to the new contract rather than deleted, and tightened: it now
   also asserts the single-control invariant that the old test could not. */
await safe('Plan card is the redesigned document card',async()=>{
  await page.evaluate(()=>PM56_DEMO.selectThread('query'));
  /* Scoped to the TRANSCRIPT copy. The editor pane renders the same record
     through the same renderers (one Plan truth, not two), so an unscoped
     selector matches both and trips strict mode. */
  const card=page.locator('.transcript .plan-doc[data-plan-id="ap-index"]').first();
  await card.waitFor();
  for(const t of ['Rich Text','Markdown','Build','Revise','Build With Crew','Build At…','Export'])
    await seeIn(card,t,{exact:true});
  const builds=await card.locator('.pd-build').count();
  if(builds!==1)throw new Error(`expected exactly one Build control, found ${builds}`);
  const label=(await card.locator('.pd-build').textContent()).trim();
  if(!['Build','Building…','Completed','Canceled'].includes(label))
    throw new Error(`Build control label "${label}" is outside the four allowed states`);
  const carets=await card.locator('textarea,[contenteditable="true"]').count();
  if(carets)throw new Error(`Plan document must not be editable; found ${carets} caret hosts`);
});
async function waitOpenDecision(){
  const host=page.locator('.decision-host:not(.empty)');
  await host.waitFor();
  await page.waitForFunction(()=>{
    const el=document.querySelector('.decision-host:not(.empty)');
    if(!el) return false;
    return el.getBoundingClientRect().height>40;
  },null,{timeout:8000});
  return host;
}
await safe('Plan decision is in flow above Activity Bar',async()=>{
  await page.evaluate(()=>PM56_DEMO.openPlan());
  const hostEl=await waitOpenDecision();
  const d=await hostEl.boundingBox(),a=await page.locator('.activity-wrap').boundingBox();
  if(!d||!a||!((d.y+d.height)<=(a.y+2)))throw new Error(JSON.stringify({d,a}));
  /* scoped: "Revise" is on the editor's plan doc, the transcript plan card AND
     the decision surface — three matches. The old test took `.last()`, i.e.
     whichever happened to be latest in the DOM. Name the one it means. */
  const host=page.locator('.decision-host');
  await (await one(host,'Revise',{exact:true})).click();
  await page.locator('[data-input="plan-feedback"]').fill('Add a rollback rehearsal and explicit owner.');
  await (await one(host,'Create revision',{exact:true})).click();
});
await safe('Questionnaire persists and stays in flow',async()=>{
  await page.evaluate(()=>PM56_DEMO.openQuestionnaire());
  const qHost=await waitOpenDecision();
  const d=await qHost.boundingBox(),a=await page.locator('.activity-wrap').boundingBox();
  if(!d||!a||!((d.y+d.height)<=(a.y+2)))throw new Error('question overlays activity');
  await page.locator('[data-action="close-decision"]').click();await page.evaluate(()=>PM56_DEMO.openQuestionnaire());
  await seeIn(page.locator('.decision-host'),'Deployment questionnaire',{exact:true});
});

for(const id of ['mermaid-runtime','dashboard-query','data-explorer','architecture-map','quiz-indexes','periodic-capabilities','flow-plan','chart-cost','generated-image','test-evidence','broken-viz'])await safe(`Artifact opens: ${id}`,async()=>{await page.evaluate(id=>PM56_DEMO.openArtifact(id),id);await page.locator('.editor-doc').waitFor();});
await safe('Interactive quiz responds',async()=>{await page.evaluate(()=>PM56_DEMO.openArtifact('quiz-indexes'));await page.locator('[data-action="quiz-answer"]').nth(1).click();await seeIn(page.locator('.editor-doc'),'Correct',{exact:true});});
await safe('Mermaid source/render switches',async()=>{await page.evaluate(()=>PM56_DEMO.openArtifact('mermaid-runtime'));await page.locator('[data-action="toggle-mermaid-source"]').click();await seeIn(page.locator('.editor-doc'),'flowchart LR',{exact:false});await page.locator('[data-action="toggle-mermaid-source"]').click();});
await safe('Live subagent content is visible without hover',async()=>{await page.evaluate(()=>PM56_DEMO.selectThread('subagents'));const rows=page.locator('.live-agent-row');if(await rows.count()<3)throw new Error('agent rows missing');for(let i=0;i<Math.min(3,await rows.count());i++){const op=await rows.nth(i).evaluate(el=>getComputedStyle(el).opacity);if(Number(op)<.9)throw new Error(`opacity ${op}`);}});
await safe('Ordinary text-only conversation exists',async()=>{await page.evaluate(()=>PM56_DEMO.selectThread('plain'));const text=await page.locator('.message').count();const cards=await page.locator('.system-card,.event-card,.working-card').count();if(text<8||cards!==0)throw new Error(`messages ${text}, system ${cards}`);});
await safe('Message More Details opens',async()=>{
  /* item 8: message actions are gated on `visibility` as well as `opacity`, so
     at rest they are neither painted NOR hit-testable — which is the point.
     The old test clicked an opacity:0 button, i.e. an invisible click target.
     Hover the turn first, the way a user must, and assert the button really is
     absent before the hover (otherwise "hover first" would paper over a button
     that never hides at all). */
  await page.evaluate(()=>PM56_DEMO.selectThread('plain'));
  const turn=page.locator('.message-assistant').first();
  await turn.scrollIntoViewIfNeeded();
  const btn=turn.locator('[data-action="message-details"]').first();
  const atRest=await btn.evaluate(el=>{const cs=getComputedStyle(el);return {vis:cs.visibility,op:cs.opacity};});
  if(atRest.vis!=='hidden'&&Number(atRest.op)>0.05)throw new Error(`actions are not hidden at rest: ${JSON.stringify(atRest)}`);
  await turn.hover();
  await btn.click();
  await seeIn(turn.locator('.message-details'),'Cache hit',{exact:true});
});

const themes=['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light'];
const widths=[430,650,1024,1440,1920];
for(const theme of themes){for(const width of widths){await page.setViewportSize({width,height:900});await page.evaluate(theme=>PM56_DEMO.setTheme(theme),theme);await page.waitForTimeout(80);await noOverflowSafe(`${theme} ${width}`);await safeKeep(`Core geometry ${theme} ${width}`,async()=>{for(const sel of ['.pm-shell','.chat-stage','.composer','.activity-wrap'])await inViewport(sel,`${sel} ${theme} ${width}`);});if(width===1440)await page.screenshot({path:path.join(evidence,`${theme}-${width}.png`),fullPage:false});}}
await cleanup('theme and width sweep');

for(let family=0;family<7;family++){for(let option=0;option<8;option++)await safeKeep(`Component family ${family+1}, option ${option+1}`,async()=>{await page.setViewportSize({width:1440,height:900});await page.evaluate(({family,option})=>PM56_DEMO.setVariant(family,option),{family,option});await page.waitForTimeout(35);await noPageOverflow(`family ${family} option ${option}`);});}
await cleanup('component family sweep');

/* The suite swept 5 VIEWPORT widths and never once moved the editor split, so
   it was structurally blind to the one constraint this concept keeps tripping
   over: the assistant pane is sized by a user-draggable split, and the
   degradation tiers are viewport media queries that cannot see it. Holding the
   viewport at 1440 and dragging the split to its maximum puts the chat column
   at ~249px -- narrower than the 430px viewport tier -- with none of the narrow
   rules applied. Measured this way and not otherwise. */
/* From the STOCK state, deliberately. On the first version this sweep inherited
   whatever the component-family loop left behind and passed at 1440 -- while the
   same sweep from stock overflows by 29px. An assertion whose verdict depends on
   which test ran before it is not an assertion. */
for(const vw of [1920,1440,1280,1100]){
  await safeKeep(`No page overflow at ${vw} across the editor split range`,async()=>{
    await page.evaluate(()=>PM56_DEMO.reset());
    await page.setViewportSize({width:vw,height:900});
    await page.waitForTimeout(350);
    const bad=[],reached=[];
    for(const pct of [30,54,70,80]){
      /* re-read the handle EVERY time: it moves with the split, and dragging
         from a stale position silently misses it, so only the first drag
         happens and the sweep measures one layout four times. */
      const ws=await page.locator('.workspace').boundingBox();
      const h=await page.locator('[data-resize="editor"]').boundingBox();
      if(!ws||!h)throw new Error('no editor resizer');
      await page.mouse.move(h.x+h.width/2,h.y+h.height/2);
      await page.mouse.down();
      await page.mouse.move(Math.round(ws.x+ws.width*(pct/100)),h.y+h.height/2,{steps:10});
      await page.mouse.up();
      await page.waitForTimeout(320);
      const r=await page.evaluate(()=>{
        const cw=document.documentElement.clientWidth,over=[];
        document.querySelectorAll('*').forEach(el=>{const b=el.getBoundingClientRect();
          if(b.width>0&&b.right>cw+1)over.push(`${el.tagName.toLowerCase()}.${(el.className||'').toString().split(/\s+/)[0]}+${Math.round(b.right-cw)}px`);});
        return {cw,sw:document.documentElement.scrollWidth,bw:document.body.scrollWidth,
                editorPct:Math.round(document.querySelector('.editor-pane').getBoundingClientRect().width/document.querySelector('.workspace').getBoundingClientRect().width*1000)/10,
                over:[...new Set(over)].slice(0,4)};});
      reached.push(r.editorPct);
      if(r.sw>r.cw+1||r.bw>r.cw+1)bad.push({askedPct:pct,...r});
    }
    // put it back
    const ws2=await page.locator('.workspace').boundingBox();
    const h2=await page.locator('[data-resize="editor"]').boundingBox();
    if(ws2&&h2){ await page.mouse.move(h2.x+h2.width/2,h2.y+h2.height/2);await page.mouse.down();
      await page.mouse.move(Math.round(ws2.x+ws2.width*0.54),h2.y+h2.height/2,{steps:8});await page.mouse.up();
      await page.waitForTimeout(250); }
    /* the split must actually have MOVED, or a green here means nothing */
    if(new Set(reached).size<3)throw new Error(`the split did not move: editor% reached ${JSON.stringify(reached)}`);
    if(bad.length)throw new Error(`page overflows with the VIEWPORT unchanged, only the split moved: ${JSON.stringify(bad)}`);
  });
}
await page.setViewportSize({width:1440,height:900});
await cleanup('editor split sweep');

await safe('Global reset restores stock state',async()=>{await page.evaluate(()=>{PM56_DEMO.setTheme('friendly-light');PM56_DEMO.setVariant(2,7);PM56_DEMO.selectThread('plain');PM56_DEMO.reset();});await page.waitForTimeout(100);const s=await page.evaluate(()=>PM56_DEMO.snapshot());const expected=[7,5,1,0,1,0,8];if(s.theme!=='basic-dark'||s.thread!=='query'||s.variants.some((x,i)=>x!==expected[i]))throw new Error(JSON.stringify(s));});

/* ------------------------------------------------- matcher-hygiene summary */
check(matchers.length>0,'Matcher hygiene: text assertions were actually exercised',`${matchers.length} matchers`);
const zero=matchers.filter(m=>m.found===0);
check(zero.length===0,'Matcher hygiene: no text assertion matched zero elements',JSON.stringify(zero));
const loose=matchers.filter(m=>m.allow!=='any'&&m.found>m.allow);
check(loose.length===0,'Matcher hygiene: no text assertion is unscoped',JSON.stringify(loose));
const dirtyRuns=hygiene.filter(h=>h.stuck.length);
check(dirtyRuns.length===0,'Test isolation: no test left an overlay open for its successor',JSON.stringify(dirtyRuns.map(h=>({after:h.after,stuck:h.stuck}))));

check(consoleErrors.length===0,'No browser console errors',consoleErrors.join('\n'));
check(pageErrors.length===0,'No uncaught page errors',pageErrors.join('\n'));
await page.screenshot({path:path.join(evidence,'final-stock-1440x900.png'),fullPage:false});

/* --------------------------------------------------------- the orphan gate */
/* "fail if a CSS selector matches nothing the JS emits" — the check that would
   have caught 15a/15b/15g years of hand-edits ago. HARD = the class name is not
   emitted, not constructible and not even a string literal anywhere. */
if(wantOrphanGate){
  try{
    orphan=await runOrphanGate(browser,{src:srcDir,html:path.join(root,'index.html')});
    check(orphan.hardFindings.length===0,'Orphan gate: every CSS selector can match something the JS emits',
      JSON.stringify(orphan.hardFindings.map(f=>`${f.sheet} ${f.selector} -> ${f.hard.join(',')}`)));
    check(orphan.live>500,'Orphan gate: the emitted-token set is real',
      `LIVE ${orphan.live} (static ${orphan.staticTokens} + ${orphan.patterns} patterns, runtime ${orphan.runtimeClasses}); ${orphan.unconstrainedPatterns} wildcard patterns discarded`);
  }catch(e){
    /* A gate that cannot run must FAIL, not be skipped: a skipped gate reads
       exactly like a passing one in the summary. */
    check(false,'Orphan gate: every CSS selector can match something the JS emits',`gate could not run: ${String(e).split('\n')[0]}`);
  }
}

}catch(fatal){
  failures.push({label:'Suite ran to completion',detail:String(fatal).split('\n').slice(0,8).join(' | ')});
}finally{
  try{await browser.close();}catch(e){}
  const report=writeReport(orphan?{orphanGate:{hard:orphan.hardFindings,soft:orphan.softFindings,live:orphan.live,staticTokens:orphan.staticTokens,patterns:orphan.patterns,unconstrainedPatterns:orphan.unconstrainedPatterns,runtimeClasses:orphan.runtimeClasses}}:{});
  console.log(`${report.summary.passed} pass / ${report.summary.failed} fail / ${report.summary.consoleErrors} console / ${report.summary.pageErrors} page`);
  process.exit(report.summary.failed?1:0);
}
