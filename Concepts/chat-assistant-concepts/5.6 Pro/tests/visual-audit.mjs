import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
for (const candidate of ['playwright','playwright-core']) {
  try { playwright = require(candidate); break; } catch {}
}
if (!playwright) {
  const candidates = [
    '/usr/lib/node_modules/playwright',
    '/usr/local/lib/node_modules/playwright',
    '/opt/node_modules/playwright',
    '/home/oai/share/npm/node_modules/playwright'
  ];
  for (const candidate of candidates) {
    try { playwright = require(candidate); break; } catch {}
  }
}
if (!playwright) throw new Error('Playwright is not installed');

const { chromium } = playwright;
const root = path.resolve('/mnt/data/work/pm56_pro_reaudit');
const reportDir = path.join(root,'reports');
const shotDir = path.join(root,'evidence','screenshots');
const videoDir = path.join(root,'evidence','videos');
fs.mkdirSync(reportDir,{recursive:true});
fs.mkdirSync(shotDir,{recursive:true});
fs.mkdirSync(videoDir,{recursive:true});

const mime = new Map([['.html','text/html'],['.js','text/javascript'],['.css','text/css'],['.json','application/json'],['.svg','image/svg+xml'],['.png','image/png']]);
const server = http.createServer((req,res)=>{
  const raw = decodeURIComponent((req.url||'/').split('?')[0]);
  const local = path.resolve(root, raw==='/'?'index.html':raw.replace(/^\//,''));
  if (!local.startsWith(root) || !fs.existsSync(local) || fs.statSync(local).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200,{'content-type':mime.get(path.extname(local))||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(local).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const url=`http://127.0.0.1:${port}/`;

const results=[];
const consoleErrors=[];
const pageErrors=[];
const screenshots=[];
const videos=[];
const started=new Date().toISOString();
function pass(name,detail=''){results.push({name,status:'PASS',detail});}
function fail(name,detail=''){results.push({name,status:'FAIL',detail});}
function assert(name,condition,detail=''){condition?pass(name,detail):fail(name,detail);return condition;}

const executableCandidates=['/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome','/usr/bin/google-chrome-stable'];
const executablePath=executableCandidates.find(p=>fs.existsSync(p));
const browser=await chromium.launch({headless:true,executablePath,args:['--disable-dev-shm-usage','--no-sandbox']});

async function makePage(width=1440,height=900,{recordVideo=false}={}) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,recordVideo:recordVideo?{dir:videoDir,size:{width,height}}:undefined});
  const page=await context.newPage();
  page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
  page.on('pageerror',err=>pageErrors.push(String(err)));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.PM56_DEMO?.version==='5.6-pro-final',{timeout:15000});
  await page.waitForTimeout(350);
  return {page,context};
}

async function screenshot(page,name,fullPage=false){
  const file=path.join(shotDir,`${name}.png`);await page.screenshot({path:file,fullPage});screenshots.push(file);return file;
}

async function closeOverlays(page){
  await page.evaluate(()=>window.PM56_DEMO.closeOverlays());
  await page.waitForTimeout(50);
}

async function box(page,selector){return page.locator(selector).first().boundingBox();}
async function withinViewport(page,selector,padding=0){
  const b=await box(page,selector);if(!b)return false;
  const vp=page.viewportSize();return b.x>=-padding&&b.y>=-padding&&b.x+b.width<=vp.width+padding&&b.y+b.height<=vp.height+padding;
}

async function noUnexpectedOverlap(page,aSel,bSel,tolerance=2){
  const a=await box(page,aSel),b=await box(page,bSel);if(!a||!b)return false;
  const ix=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
  const iy=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
  return ix*iy<=tolerance;
}

// 1. Baseline visual and runtime audit
{
  const {page,context}=await makePage(1440,900);
  const audit=await page.evaluate(()=>window.PM56_DEMO.audit());
  assert('baseline invariant audit',audit.ok,JSON.stringify(audit.issues));
  assert('thread history visible before hover',await page.locator('#thread-history').isVisible());
  const historyStyle=await page.locator('#thread-history').evaluate(el=>({opacity:getComputedStyle(el).opacity,visibility:getComputedStyle(el).visibility,width:el.getBoundingClientRect().width}));
  assert('thread history has stable visible geometry',Number(historyStyle.opacity)>.99&&historyStyle.visibility==='visible'&&historyStyle.width>=170,JSON.stringify(historyStyle));
  assert('pinned section rendered',await page.locator('[data-history-section="pinned"] .thread-row').count()>=1);
  assert('recent section rendered',await page.locator('[data-history-section="recent"] .thread-row').count()>=1);
  assert('transcript is scrollable and populated',await page.locator('#transcript .message,#transcript .working-animation,#transcript .artifact-preview').count()>=6);
  assert('composer visible',await page.locator('#composer-shell').isVisible());
  assert('editor artifact visible',await page.locator('#editor-canvas .editor-document,#editor-canvas .artifact-stage').count()>=1);
  await screenshot(page,'baseline-1440x900');
  await context.close();
}

// 2. Menu and nested sidecar sweep at multiple widths/themes.
const widths=[430,650,850,1200,1440,1920];
const themes=['puppet-dark','midnight','graphite','ember','puppet-light','paper','glass-dark','glass-light'];
const selectors=['persona','model','mode','worktree','permissions','wand'];
for (const width of widths) {
  const {page,context}=await makePage(width,900);
  for (const theme of themes) {
    await page.evaluate(theme=>window.PM56_DEMO.setTheme(theme),theme);
    for (const selector of selectors) {
      await closeOverlays(page);
      const anchor=page.locator(`[data-selector="${selector}"]`);
      if(!(await anchor.isVisible())) { pass(`menu ${selector} intentionally unavailable at ${width}px ${theme}`); continue; }
      await anchor.click();
      await page.waitForTimeout(180);
      const count=await page.locator('.pm-popover').count();
      assert(`menu opens: ${selector} ${width}px ${theme}`,count>=1,`popover count ${count}`);
      assert(`menu inside viewport: ${selector} ${width}px ${theme}`,await withinViewport(page,'.pm-popover',1));
      const z=await page.locator('.pm-popover').first().evaluate(el=>Number(getComputedStyle(el).zIndex));
      assert(`menu z-index: ${selector} ${width}px ${theme}`,z>=700,String(z));
      if(selector==='mode') {
        const item=page.locator('.pm-popover [data-sidecar="mode:plan"]');
        if(await item.count()) {
          await item.click();await page.waitForTimeout(180);
          assert(`mode sidecar coexists ${width}px ${theme}`,await page.locator('.pm-popover').count()===2);
          assert(`mode sidecar inside viewport ${width}px ${theme}`,await withinViewport(page,'.pm-popover.sidecar',1));
          assert(`mode parent remains visible ${width}px ${theme}`,await page.locator('.pm-popover:not(.sidecar)').isVisible());
        }
      }
      if(selector==='wand') {
        const item=page.locator('.pm-popover [data-sidecar="capability:lens"]');
        if(await item.count()) {
          await item.click();await page.waitForTimeout(180);
          assert(`wand sidecar coexists ${width}px ${theme}`,await page.locator('.pm-popover').count()===2);
          assert(`wand sidecar inside viewport ${width}px ${theme}`,await withinViewport(page,'.pm-popover.sidecar',1));
        }
      }
      if(selector==='model') {
        const item=page.locator('.pm-popover [data-sidecar^="model-effort:"]').first();
        if(await item.count()) {
          await item.click();await page.waitForTimeout(180);
          assert(`model effort sidecar coexists ${width}px ${theme}`,await page.locator('.pm-popover').count()===2);
          assert(`model sidecar inside viewport ${width}px ${theme}`,await withinViewport(page,'.pm-popover.sidecar',1));
          assert(`configured provider-only model rail ${width}px ${theme}`,await page.locator('.provider-button').count()===5,'all + four configured providers');
        }
      }
    }
  }
  await context.close();
}

// 3. Thread history, search, archive, row actions, and scrolling.
{
  const {page,context}=await makePage(1200,900);
  const rows=page.locator('.thread-row');
  assert('thread history has plentiful demo rows',await rows.count()>=12,String(await rows.count()));
  const firstTitle=await rows.nth(1).locator('.thread-row-title').textContent();
  await rows.nth(1).click();await page.waitForTimeout(120);
  assert('thread selection updates header',(await page.locator('#active-thread-title').textContent())===firstTitle);
  const more=page.locator('.thread-row').nth(1).locator('[data-action="thread-row-menu"]');
  await more.click();await page.waitForTimeout(160);
  assert('thread row menu visible without corrupting row',await page.locator('.pm-popover').isVisible());
  assert('thread row menu inside viewport',await withinViewport(page,'.pm-popover',1));
  await closeOverlays(page);
  await page.locator('[data-action="toggle-archived"]').last().click();
  assert('archived section displays',await page.locator('[data-history-section="archived"] .thread-row').count()>=6);
  await page.locator('[data-action="open-thread-search"]').first().click();await page.waitForTimeout(140);
  await page.locator('[data-action="search-scope"][data-value="archived"]').click();
  const input=page.locator('[data-action="thread-search-input"]');await input.fill('provider');
  assert('archived search returns result',await page.locator('.search-result').count()>=1);
  assert('history scroll surface actually scrolls',await page.locator('#history-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;return el.scrollTop>0;}));
  await screenshot(page,'thread-history-archive-search');
  await context.close();
}

// 4. Activity bar transient and pinned details.
{
  const {page,context}=await makePage(1440,900);
  for(const domain of ['goal','todo','subagents','changes','artifacts']){
    await closeOverlays(page);
    await page.locator(`[data-domain="${domain}"]`).click();await page.waitForTimeout(160);
    assert(`activity popover visible ${domain}`,await page.locator('.activity-details-popover').isVisible());
    assert(`activity popover inside viewport ${domain}`,await withinViewport(page,'.activity-details-popover',1));
    assert(`activity details scroll area ${domain}`,await page.locator('.transient-activity-body').count()===1);
  }
  await page.locator('[data-action="pin-activity"]').click();await page.waitForTimeout(200);
  assert('activity detail pins into dock',await page.locator('#activity-detail-dock').isVisible());
  assert('pinned activity has independent content',await page.locator('#activity-detail-content .activity-card').count()>=1);
  const dockBox=await box(page,'#activity-detail-dock'), chatBox=await box(page,'#chat-surface');
  assert('pinned activity does not overlap chat',dockBox&&chatBox&&dockBox.x+dockBox.width<=chatBox.x+2,JSON.stringify({dockBox,chatBox}));
  await screenshot(page,'activity-detail-pinned');
  await page.locator('[data-action="unpin-activity"]').click();await page.waitForTimeout(160);
  assert('activity dock unpins cleanly',!(await page.locator('#activity-detail-dock').isVisible()));
  await context.close();
}

// 5. Demo trigger inventory and representative material states.
{
  const {page,context}=await makePage(1440,900);
  const triggerIds=await page.evaluate(()=>window.PM56_DEMO.triggers);
  assert('plentiful deterministic trigger inventory',triggerIds.length>=60,String(triggerIds.length));
  const representative=[
    'work:web-search','work:web-fetch','work:browser','work:bash','work:program-test','work:subagents','work:complete',
    'artifact:mermaid-runtime','artifact:dashboard-usage','artifact:data-explorer','artifact:quiz-routing','artifact:periodic-capabilities','artifact:generated-dancer',
    'question:open','decision:plan','decision:permission','decision:conflict','thread:long','thread:error','thread:new-message','context:details'
  ];
  for(const id of representative){
    await closeOverlays(page);
    await page.evaluate(id=>window.PM56_DEMO.trigger(id),id);await page.waitForTimeout(id.startsWith('question:')||id.startsWith('decision:')?180:100);
    const audit=await page.evaluate(()=>window.PM56_DEMO.audit());
    assert(`trigger invariant ${id}`,audit.ok,JSON.stringify(audit.issues));
    if(id==='artifact:mermaid-runtime')assert('Mermaid preview rendered',await page.locator('.mermaid-stage svg').count()>=1);
    if(id==='artifact:dashboard-usage')assert('interactive visual dashboard rendered',await page.locator('.dashboard-grid').count()>=1);
    if(id==='artifact:quiz-routing')assert('interactive quiz rendered',await page.locator('[data-interactive="quiz"]').count()>=1);
    if(id==='artifact:generated-dancer')assert('generated image preview rendered',await page.locator('.generated-image-preview').count()>=1);
  }
  await screenshot(page,'demo-trigger-rich-thread',true);
  await context.close();
}

// 6. Every recipe/theme at core widths.
for(const width of [650,900,1280,1700,2200]){
  const {page,context}=await makePage(width,900);
  for(const recipe of ['refined','compact','reading','agentic','technical','visual','planning','adaptive']){
    await page.evaluate(recipe=>window.PM56_DEMO.setRecipe(recipe),recipe);
    for(const theme of themes){
      await page.evaluate(theme=>window.PM56_DEMO.setTheme(theme),theme);
      const audit=await page.evaluate(()=>window.PM56_DEMO.audit());
      assert(`recipe-theme invariant ${recipe}/${theme}/${width}`,audit.ok,JSON.stringify(audit.issues));
      const clipped=await page.evaluate(()=>{
        const allowed=el=>el.matches('.thread-row-title,.thread-row-summary,.tab-label,.thread-title-line h1,.thread-meta,.activity-list-copy strong,.activity-list-copy small,.menu-item-copy strong,.menu-item-copy small,.model-copy strong,.model-copy small,.artifact-preview-title strong,.artifact-preview-title small');
        return [...document.querySelectorAll('body *')].filter(el=>{
          const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;
          if(!el.childNodes.length||[...el.children].length)return false;
          if(allowed(el))return false;
          return el.scrollWidth>el.clientWidth+2&&s.overflowX!=='auto'&&s.overflowX!=='scroll';
        }).slice(0,20).map(el=>({text:(el.textContent||'').trim().slice(0,80),class:el.className,sw:el.scrollWidth,cw:el.clientWidth}));
      });
      assert(`no unexpected text clipping ${recipe}/${theme}/${width}`,clipped.length===0,JSON.stringify(clipped));
    }
  }
  if(width===1280)await screenshot(page,'all-theme-matrix-sample-1280');
  await context.close();
}

// 7. Component options: every option in every family across themes at representative width.
{
  const {page,context}=await makePage(1440,900);
  const families=['shell','history','working','activitybar','activitypanel','transcript','question'];
  for(const family of families){
    for(let option=1;option<=8;option++){
      await page.evaluate(({family,option})=>window.PM56_DEMO.setFamily(family,option),{family,option});
      for(const theme of themes){
        await page.evaluate(theme=>window.PM56_DEMO.setTheme(theme),theme);
        const audit=await page.evaluate(()=>window.PM56_DEMO.audit());
        assert(`family option ${family}-${option}-${theme}`,audit.ok,JSON.stringify(audit.issues));
      }
    }
  }
  await context.close();
}

// 8. Scroll and resize mechanics.
{
  const {page,context}=await makePage(1440,900);
  await page.evaluate(()=>window.PM56_DEMO.trigger('thread:long'));
  const chatScrollable=await page.locator('#chat-scroll').evaluate(el=>{el.scrollTop=0;const before=el.scrollTop;el.scrollTop=el.scrollHeight;return el.scrollTop>before;});
  assert('chat transcript scrolls',chatScrollable);
  await page.locator('[data-message-id] [data-action="toggle-message"]').last().click();
  assert('long message expands',await page.locator('.message.expanded').count()>=1);
  const assistantHandle=page.locator('[data-resize="assistant"]');
  const hb=await assistantHandle.boundingBox();
  if(hb){await page.mouse.move(hb.x+2,hb.y+100);await page.mouse.down();await page.mouse.move(hb.x-100,hb.y+100,{steps:8});await page.mouse.up();}
  const audit=await page.evaluate(()=>window.PM56_DEMO.audit());
  assert('assistant resize preserves invariants',audit.ok,JSON.stringify(audit.issues));
  const historyHandle=page.locator('[data-resize="history"]');const hhb=await historyHandle.boundingBox();
  if(hhb){await page.mouse.move(hhb.x+1,hhb.y+120);await page.mouse.down();await page.mouse.move(hhb.x+50,hhb.y+120,{steps:6});await page.mouse.up();}
  const audit2=await page.evaluate(()=>window.PM56_DEMO.audit());
  assert('history resize preserves invariants',audit2.ok,JSON.stringify(audit2.issues));
  await screenshot(page,'resized-panels');
  await context.close();
}

// 9. Motion recordings with direct frame-visible state changes.
const motionScenarios=[
  {name:'menu-sidecar-motion',run:async page=>{await page.locator('[data-selector="mode"]').click();await page.waitForTimeout(500);await page.locator('[data-sidecar="mode:plan"]').click();await page.waitForTimeout(900);}},
  {name:'working-animation-motion',run:async page=>{for(const id of ['thinking','exploring','web-search','web-fetch','browser','bash','subagents','editing','browser-test','validating','complete']){await page.evaluate(id=>window.PM56_DEMO.trigger(`work:${id}`),id);await page.waitForTimeout(430);}}},
  {name:'questionnaire-morph-motion',run:async page=>{await page.evaluate(()=>window.PM56_DEMO.trigger('question:prepare'));await page.waitForTimeout(1500);const opt=page.locator('.question-option').first();if(await opt.count()){await opt.click();await page.locator('[data-action="question-next"]').click();await page.waitForTimeout(600);}}},
  {name:'activity-pin-motion',run:async page=>{await page.locator('[data-domain="subagents"]').click();await page.waitForTimeout(600);await page.locator('[data-action="pin-activity"]').click();await page.waitForTimeout(900);await page.locator('[data-action="unpin-activity"]').click();await page.waitForTimeout(700);}}
];
for(const scenario of motionScenarios){
  const {page,context}=await makePage(1440,900,{recordVideo:true});
  await scenario.run(page);await screenshot(page,scenario.name);
  const video=page.video();await context.close();
  const vp=await video?.path().catch(()=>null);if(vp){const target=path.join(videoDir,`${scenario.name}.webm`);fs.copyFileSync(vp,target);videos.push(target);}
}

await browser.close();server.close();
const failures=results.filter(r=>r.status==='FAIL');
const report={started,finished:new Date().toISOString(),overall:failures.length||consoleErrors.length||pageErrors.length?'FAIL':'PASS',summary:{total:results.length,passed:results.length-failures.length,failed:failures.length,consoleErrors:consoleErrors.length,pageErrors:pageErrors.length,screenshots:screenshots.length,videos:videos.length},failures,consoleErrors,pageErrors,results,screenshots,videos};
fs.writeFileSync(path.join(reportDir,'visual-audit.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(reportDir,'AUDIT_STATUS.txt'),report.overall);
fs.writeFileSync(path.join(reportDir,'visual-audit-summary.md'),`# Visual Audit\n\n**Overall: ${report.overall}**\n\n- Checks: ${report.summary.total}\n- Passed: ${report.summary.passed}\n- Failed: ${report.summary.failed}\n- Console errors: ${report.summary.consoleErrors}\n- Page errors: ${report.summary.pageErrors}\n- Screenshots: ${report.summary.screenshots}\n- Videos: ${report.summary.videos}\n\n## Failures\n\n${failures.length?failures.map(f=>`- **${f.name}** — ${f.detail}`).join('\n'):'None.'}\n`);
if(report.overall!=='PASS')process.exitCode=1;
