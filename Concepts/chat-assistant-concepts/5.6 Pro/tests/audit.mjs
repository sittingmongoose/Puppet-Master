import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
let chromium;
try { ({chromium}=await import('playwright')); }
catch(e1){ try { ({chromium}=await import('playwright-core')); } catch(e2){ fs.writeFileSync(process.argv[2]||'audit.json',JSON.stringify({overall:'MISSING',error:String(e2)},null,2)); process.exit(2); } }

const root=path.resolve(process.argv[3]||path.dirname(new URL(import.meta.url).pathname),'..');
const out=path.resolve(process.argv[2]||path.join(root,'reports','audit.json'));
const evidence=path.join(root,'evidence','screenshots');
fs.mkdirSync(evidence,{recursive:true});
const failures=[],passes=[],consoleErrors=[],pageErrors=[];
const check=(ok,label,detail='')=>{(ok?passes:failures).push({label,detail});};
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
page.on('pageerror',e=>pageErrors.push(String(e)));
const url=pathToFileURL(path.join(root,'index.html')).href;
try{
  await page.goto(url,{waitUntil:'load',timeout:20000});
  await page.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:10000});
  check(true,'Boots from direct file URL');
}catch(e){check(false,'Boots from direct file URL',String(e));}

async function safe(label,fn){try{await fn();passes.push({label});}catch(e){failures.push({label,detail:String(e)});}}
async function inViewport(selector,label=selector){
  const result=await page.locator(selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return {ok:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>0&&r.height>0,r:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},vp:{w:innerWidth,h:innerHeight}}});
  check(result.ok,`Viewport containment: ${label}`,JSON.stringify(result));
}
async function noPageOverflow(label){const r=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth}));check(r.sw<=r.cw+1&&r.bw<=r.cw+1,`No page horizontal overflow: ${label}`,JSON.stringify(r));}
async function clickAction(action,extra=''){const sel=`[data-action="${action}"]${extra}`;await page.locator(sel).first().click();}

await safe('Initial demo content is populated',async()=>{
  await page.getByText('Query Performance',{exact:true}).first().waitFor();
  await page.getByText('Analyze the analytics query performance',{exact:false}).waitFor();
  await page.locator('.working-card').waitFor();
  const rows=await page.locator('.thread-row').count();if(rows<10)throw new Error(`Only ${rows} thread rows`);
});
await safe('Initial working animation advances',async()=>{
  const a=await page.evaluate(()=>PM56_DEMO.getState().work.step);await page.waitForTimeout(2600);const b=await page.evaluate(()=>PM56_DEMO.getState().work.step);if(b<=a)throw new Error(`step ${a} -> ${b}`);
});
await noPageOverflow('initial');

await safe('Context Ring opens compact menu',async()=>{
  await page.locator('.context-ring').click();await page.getByText('Compact Now',{exact:true}).waitFor();await page.getByText('More Details',{exact:true}).waitFor();
  for(const t of ['83.9K','78%','Source composition'])await page.getByText(t,{exact:false}).first().waitFor();
});
await inViewport('[data-overlay="root-menu"]','Context compact menu');
await safe('Context More Details contains required metrics',async()=>{
  await page.getByText('More Details',{exact:true}).click();await page.getByText('Context More Details',{exact:true}).waitFor();
  for(const t of ['current window used','Tokens loaded','Cache hit','Cached tokens','Source composition','Context growth','API billed'])await page.getByText(t,{exact:false}).first().waitFor();
  await page.locator('[data-action="close-context-details"]').click();
});

for(const domain of ['goal','todo','subagents','changes','artifacts']){
  await safe(`Activity hover preview: ${domain}`,async()=>{
    const b=page.locator(`[data-hover-domain="${domain}"]`);await b.hover();await page.locator('.hover-card').waitFor({state:'visible'});await inViewport('.hover-card',`${domain} hover`);
  });
  await safe(`Activity click opens all-category detail: ${domain}`,async()=>{
    await page.locator(`[data-hover-domain="${domain}"]`).click();await page.locator('.activity-panel').waitFor({state:'visible'});
    const cats=await page.locator('.activity-section').count();if(cats!==5)throw new Error(`Expected 5 sections, found ${cats}`);
    for(const label of ['Goal','Todo','Subagents','Changes','Artifacts'])await page.locator('.activity-section-head').filter({hasText:label}).first().waitFor();
    await page.locator('[data-action="close-activity"]').first().click();
  });
}

await safe('Activity Detail pin and unpin',async()=>{
  await page.locator('[data-hover-domain="goal"]').click();await page.locator('[data-action="pin-activity"]').click();
  const pinned=await page.evaluate(()=>PM56_DEMO.getState().activity.pinned);if(!pinned)throw new Error('not pinned');
  await page.locator('[data-action="unpin-activity"]').click();
  await page.locator('[data-action="close-activity"]').first().click();
});

async function openRootMenu(kind){await page.locator(`[data-action="open-menu"][data-menu="${kind}"]`).click();await page.locator('[data-overlay="root-menu"]').waitFor({state:'visible'});}
await safe('Model picker and effort sidecar',async()=>{
  await openRootMenu('model');await inViewport('[data-overlay="root-menu"]','model picker');
  const before=await page.locator('[data-overlay="root-menu"]').boundingBox();
  const row=page.locator('.model-row').first();await row.hover();await page.locator('[data-overlay="sidecar"]').waitFor({state:'visible'});await inViewport('[data-overlay="sidecar"]','model sidecar');
  await page.locator('[data-input="model-search"]').fill('Sonnet');await page.waitForTimeout(600);const after=await page.locator('[data-overlay="root-menu"]').boundingBox();if(after.height>before.height+2)throw new Error(`picker grew ${before.height}->${after.height}`);
  await page.keyboard.press('Escape');
});
await safe('Plan and Deep Plan hover sidecars',async()=>{
  await openRootMenu('mode');await page.locator('[data-submenu="plan"]').hover();await page.locator('[data-overlay="sidecar"]').waitFor();await inViewport('[data-overlay="sidecar"]','Plan sidecar');await page.keyboard.press('Escape');
  await openRootMenu('mode');await page.locator('[data-submenu="deep-plan"]').hover();await page.locator('[data-overlay="sidecar"]').waitFor();await inViewport('[data-overlay="sidecar"]','Deep Plan sidecar');await page.keyboard.press('Escape');
});
await safe('Capability hover sidecars',async()=>{
  await openRootMenu('wand');for(const sub of ['goal-menu','bsd-menu','context-lens','thought-menu']){await page.locator(`[data-submenu="${sub}"]`).hover();await page.locator('[data-overlay="sidecar"]').waitFor();await inViewport('[data-overlay="sidecar"]',sub);}await page.keyboard.press('Escape');
});

await safe('Working Animation controls and history',async()=>{
  await page.evaluate(()=>PM56_DEMO.resetWorking());await page.locator('[data-action="start-working"]').click();await page.waitForTimeout(1600);await page.locator('[data-action="pause-working"]').click();
  await page.locator('[data-action="step-working"]').click();await page.locator('[data-action="complete-working"]').click();await page.getByText('Worked for',{exact:false}).waitFor();await page.locator('.wa-chrome .pm-roll').first().waitFor();
  await page.locator('[data-action="toggle-work-history"]').click();await page.getByText('Organized work stream and evidence',{exact:true}).waitFor();
});
for(let v=0;v<24;v++)await safe(`Distinct Working Animation option ${v+1}`,async()=>{await page.evaluate(v=>PM56_DEMO.setVariant(2,v),v);await page.locator(`.working-variant-${v}`).waitFor();const h=await page.locator('.working-card').evaluate(el=>el.innerHTML.length);if(h<700)throw new Error(`too shallow ${h}`);});
await safe('Working chrome compacts and re-expands a phase',async()=>{
  await page.evaluate(()=>PM56_DEMO.completeWorking());
  await page.locator('.wa-chrome .pm-roll').first().waitFor();
  await page.locator('.wa-disc[data-value="files"]').click();
  await page.getByText('Read src/analytics/queries.rs',{exact:true}).waitFor();
  await page.locator('.wa-disc[data-value="files"]').click();
  if(await page.locator('.wa-row').count())throw new Error('phase did not collapse');
});

await safe('Plan card has View, Revise, Build',async()=>{
  await page.evaluate(()=>PM56_DEMO.selectThread('query'));for(const t of ['View Plan','Revise','Build'])await page.locator('.plan-card').getByText(t,{exact:true}).waitFor();
});
await safe('Plan decision is in flow above Activity Bar',async()=>{
  await page.evaluate(()=>PM56_DEMO.openPlan());const d=await page.locator('.decision-host').boundingBox(),a=await page.locator('.activity-wrap').boundingBox();if(!((d.y+d.height)<=(a.y+2)))throw new Error(JSON.stringify({d,a}));
  await page.getByText('Revise',{exact:true}).last().click();await page.locator('[data-input="plan-feedback"]').fill('Add a rollback rehearsal and explicit owner.');await page.getByText('Create revision',{exact:true}).click();
});
await safe('Questionnaire persists and stays in flow',async()=>{
  await page.evaluate(()=>PM56_DEMO.openQuestionnaire());const d=await page.locator('.decision-host').boundingBox(),a=await page.locator('.activity-wrap').boundingBox();if(!((d.y+d.height)<=(a.y+2)))throw new Error('question overlays activity');
  await page.locator('[data-action="close-decision"]').click();await page.evaluate(()=>PM56_DEMO.openQuestionnaire());await page.getByText('Deployment questionnaire',{exact:true}).waitFor();
});

for(const id of ['mermaid-runtime','dashboard-query','data-explorer','architecture-map','quiz-indexes','periodic-capabilities','flow-plan','chart-cost','generated-image','test-evidence','broken-viz'])await safe(`Artifact opens: ${id}`,async()=>{await page.evaluate(id=>PM56_DEMO.openArtifact(id),id);await page.locator('.editor-doc').waitFor();});
await safe('Interactive quiz responds',async()=>{await page.evaluate(()=>PM56_DEMO.openArtifact('quiz-indexes'));await page.locator('[data-action="quiz-answer"]').nth(1).click();await page.getByText('Correct',{exact:true}).waitFor();});
await safe('Mermaid source/render switches',async()=>{await page.evaluate(()=>PM56_DEMO.openArtifact('mermaid-runtime'));await page.locator('[data-action="toggle-mermaid-source"]').click();await page.getByText('flowchart LR',{exact:false}).waitFor();await page.locator('[data-action="toggle-mermaid-source"]').click();});
await safe('Live subagent content is visible without hover',async()=>{await page.evaluate(()=>PM56_DEMO.selectThread('subagents'));const rows=page.locator('.live-agent-row');if(await rows.count()<3)throw new Error('agent rows missing');for(let i=0;i<Math.min(3,await rows.count());i++){const op=await rows.nth(i).evaluate(el=>getComputedStyle(el).opacity);if(Number(op)<.9)throw new Error(`opacity ${op}`);}});
await safe('Ordinary text-only conversation exists',async()=>{await page.evaluate(()=>PM56_DEMO.selectThread('plain'));const text=await page.locator('.message').count();const cards=await page.locator('.system-card,.event-card,.working-card').count();if(text<8||cards!==0)throw new Error(`messages ${text}, system ${cards}`);});
await safe('Message More Details opens',async()=>{await page.locator('[data-action="message-details"]').first().click();await page.getByText('Cache hit',{exact:true}).waitFor();});

const themes=['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light'];
const widths=[430,650,1024,1440,1920];
for(const theme of themes){for(const width of widths){await page.setViewportSize({width,height:900});await page.evaluate(theme=>PM56_DEMO.setTheme(theme),theme);await page.waitForTimeout(80);await noPageOverflow(`${theme} ${width}`);await safe(`Core geometry ${theme} ${width}`,async()=>{for(const sel of ['.pm-shell','.chat-stage','.composer','.activity-wrap'])await inViewport(sel,`${sel} ${theme} ${width}`);});if(width===1440)await page.screenshot({path:path.join(evidence,`${theme}-${width}.png`),fullPage:false});}}

for(let family=0;family<7;family++){for(let option=0;option<8;option++)await safe(`Component family ${family+1}, option ${option+1}`,async()=>{await page.setViewportSize({width:1440,height:900});await page.evaluate(({family,option})=>PM56_DEMO.setVariant(family,option),{family,option});await page.waitForTimeout(35);await noPageOverflow(`family ${family} option ${option}`);});}

await safe('Global reset restores stock state',async()=>{await page.evaluate(()=>{PM56_DEMO.setTheme('friendly-light');PM56_DEMO.setVariant(2,7);PM56_DEMO.selectThread('plain');PM56_DEMO.reset();});await page.waitForTimeout(100);const s=await page.evaluate(()=>PM56_DEMO.snapshot());if(s.theme!=='basic-dark'||s.thread!=='query'||s.variants.some(x=>x!==0))throw new Error(JSON.stringify(s));});

check(consoleErrors.length===0,'No browser console errors',consoleErrors.join('\n'));
check(pageErrors.length===0,'No uncaught page errors',pageErrors.join('\n'));
await page.screenshot({path:path.join(evidence,'final-stock-1440x900.png'),fullPage:false});
await browser.close();
const report={overall:failures.length?'FAIL':'PASS',summary:{passed:passes.length,failed:failures.length,consoleErrors:consoleErrors.length,pageErrors:pageErrors.length},passes,failures,consoleErrors,pageErrors,generatedAt:new Date().toISOString()};
fs.writeFileSync(out,JSON.stringify(report,null,2));
process.exit(failures.length?1:0);
