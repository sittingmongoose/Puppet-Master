const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  const candidates = [
    'playwright',
    '/mnt/data/work/pm56_final_v3/node_modules/playwright',
    '/mnt/data/work/pm56_final_repair/node_modules/playwright',
    '/mnt/data/work/pm56_pro_reaudit/node_modules/playwright'
  ];
  for (const candidate of candidates) {
    try { return require(candidate); } catch (_) {}
  }
  throw new Error('Playwright is not available');
}

const { chromium } = loadPlaywright();
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'PM_Chat_Assistant_5.6_Pro_MOTION_REPAIRED_Standalone.html');
const evidence = path.join(root, 'evidence', 'motion-visibility');
const reportPath = path.join(root, 'reports', 'motion-visibility-audit.json');
fs.mkdirSync(evidence, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const failures = [];
  const warnings = [];
  const consoleErrors = [];
  const pageErrors = [];
  const results = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => pageErrors.push(String(err && err.stack || err)));
    await page.goto(pathToFileURL(target).href, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1800);

    async function snapshot(name) {
      await page.screenshot({ path: path.join(evidence, `${name}.png`), fullPage: true });
    }

    async function metrics() {
      return page.evaluate(() => {
        const parse = value => {
          const m = String(value || '').match(/rgba?\(([^)]+)\)/i);
          if (!m) return null;
          const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return {r:p[0]||0,g:p[1]||0,b:p[2]||0,a:Number.isFinite(p[3])?p[3]:1};
        };
        const lum = c => {
          const f = v => { v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); };
          return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
        };
        const con = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
        const bgFor = el => {
          let n=el;
          while(n && n.nodeType===1){ const c=parse(getComputedStyle(n).backgroundColor); if(c&&c.a>.08)return c; n=n.parentElement; }
          return parse(getComputedStyle(document.body).backgroundColor)||{r:10,g:12,b:18,a:1};
        };
        const visible = el => {
          const s=getComputedStyle(el), r=el.getBoundingClientRect();
          return !el.hidden && !el.closest('[hidden],[aria-hidden="true"]') && s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity)>.08 && r.width>2 && r.height>2;
        };
        const all=[...document.querySelectorAll('body *')].filter(visible);
        const textEls=all.filter(el => (el.innerText||'').trim() && el.children.length===0);
        const controls=all.filter(el=>el.matches('button,input,textarea,select,[role="button"],[role="menuitem"],[role="tab"]'));
        const low=[];
        const whiteBlocks=[];
        for(const el of [...new Set([...textEls,...controls])]){
          const s=getComputedStyle(el), fg=parse(s.color), bg=bgFor(el), r=el.getBoundingClientRect();
          if(fg && fg.a>.1 && con(fg,bg)<1.18) low.push({tag:el.tagName,cls:String(el.className).slice(0,120),text:(el.innerText||el.value||el.getAttribute('aria-label')||'').trim().slice(0,90),contrast:con(fg,bg)});
          const own=parse(s.backgroundColor);
          if(own && own.a>.75 && lum(own)>.92 && lum(bg)<.18 && r.width>12 && r.height>10 && !el.matches('img,canvas,video')) {
            const txt=(el.innerText||el.value||'').trim();
            if(!txt || (fg && lum(fg)>.82)) whiteBlocks.push({tag:el.tagName,cls:String(el.className).slice(0,120),text:txt.slice(0,90),rect:{w:r.width,h:r.height}});
          }
        }
        const fullScreenDark=[...document.querySelectorAll('body *')].filter(el=>{
          if(!visible(el))return false; const s=getComputedStyle(el),r=el.getBoundingClientRect();
          if(s.position!=='fixed'||r.width<innerWidth*.84||r.height<innerHeight*.84)return false;
          if(el.matches('[role="dialog"],dialog,[class*="modal" i],[class*="drawer" i],[class*="backdrop" i],[class*="scrim" i]')||el.querySelector('[role="dialog"],dialog'))return false;
          const c=parse(s.backgroundColor); return c&&c.a>.7&&lum(c)<.04;
        }).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,120)}));
        const app=document.querySelector('#app,[data-app-root],.app-shell,.concept-app')||document.body;
        const appStyle=getComputedStyle(app),appRect=app.getBoundingClientRect();
        const stage=document.querySelector('.pm-live-motion__title');
        return {
          textCount:textEls.length, controlCount:controls.length, visibleCount:all.length,
          lowContrast:low.slice(0,40), whiteBlocks:whiteBlocks.slice(0,40), fullScreenDark,
          app:{opacity:Number(appStyle.opacity),visibility:appStyle.visibility,display:appStyle.display,w:appRect.width,h:appRect.height},
          engineCount:window.PM56_MOTION?.engines?.length||0,
          stageTitle:stage?.textContent?.trim()||null,
          build:document.documentElement.dataset.build||null
        };
      });
    }

    const base = await metrics();
    results.push({name:'base',metrics:base});
    await snapshot('00-base');
    if (!base.build || !base.build.includes('motion-repair')) failures.push('Standalone did not load the repaired build marker');
    if (base.textCount < 25 || base.controlCount < 8) failures.push(`Application content did not render (${base.textCount} text, ${base.controlCount} controls)`);
    if (base.engineCount < 1) failures.push('Working Animation enhancer did not mount');
    if (base.lowContrast.length) failures.push(`Found ${base.lowContrast.length} severe resting text contrast failures`);
    if (base.whiteBlocks.length) failures.push(`Found ${base.whiteBlocks.length} white/blank control surfaces before hover`);
    if (base.fullScreenDark.length) failures.push('Found an unapproved full-screen dark transition layer at rest');

    const startResult = await page.evaluate(() => { window.PM56_MOTION?.reset(); window.PM56_MOTION?.setVariant(0); window.PM56_MOTION?.start(); return window.PM56_MOTION?.engines?.length||0; });
    if (!startResult) failures.push('Working Animation could not be started');
    const animationSamples=[];
    for (let i=0;i<22;i++) {
      await page.waitForTimeout(350);
      const m=await metrics();
      animationSamples.push({t:(i+1)*350,title:m.stageTitle,visible:m.visibleCount,text:m.textCount,appOpacity:m.app.opacity,blackouts:m.fullScreenDark.length});
      if (m.app.opacity < .9 || m.app.visibility !== 'visible' || m.fullScreenDark.length) failures.push(`Blackout/hidden root detected during animation at ${(i+1)*350}ms`);
      if (m.visibleCount < base.visibleCount*.62) failures.push(`Visible content collapsed during animation at ${(i+1)*350}ms`);
      if ([2,7,13,20].includes(i)) await snapshot(`motion-${String(i).padStart(2,'0')}`);
    }
    const distinct=[...new Set(animationSamples.map(s=>s.title).filter(Boolean))];
    if (distinct.length < 3) failures.push(`Working Animation did not visibly advance slowly enough; only ${distinct.length} distinct stages observed`);
    const dwellRuns=[];
    let last=null,start=0;
    for(const sample of animationSamples){ if(sample.title!==last){ if(last)dwellRuns.push({title:last,ms:sample.t-start}); last=sample.title; start=sample.t; } }
    if(last)dwellRuns.push({title:last,ms:animationSamples.at(-1).t+350-start});
    if (dwellRuns.slice(0,-1).some(run=>run.ms<1000)) failures.push(`A Working Animation stage changed too quickly: ${JSON.stringify(dwellRuns)}`);
    results.push({name:'working-animation',distinct,dwellRuns,samples:animationSamples});

    await page.evaluate(() => window.PM56_MOTION?.pause());
    for (let variant=0; variant<8; variant++) {
      await page.evaluate(v => { window.PM56_MOTION?.setVariant(v); window.PM56_MOTION?.step(); }, variant);
      await page.waitForTimeout(1050);
      const m=await metrics();
      results.push({name:`variant-${variant}`,metrics:m});
      await snapshot(`variant-${variant}`);
      if (m.fullScreenDark.length || m.app.opacity < .9) failures.push(`Variant ${variant} caused a blackout`);
      if (m.lowContrast.length || m.whiteBlocks.length) failures.push(`Variant ${variant} has unreadable resting content`);
    }

    // Exercise likely selector menus and sample while they are opening.
    const menuLabels=['Model','Mode','Capabilities','Wand','Persona','Permissions'];
    for (const label of menuLabels) {
      const button=page.getByRole('button',{name:new RegExp(label,'i')}).first();
      if (!(await button.count())) continue;
      try {
        await button.click({timeout:2000});
        await page.waitForTimeout(140);
        const early=await metrics();
        await page.waitForTimeout(520);
        const settled=await metrics();
        results.push({name:`menu-${label}`,early,settled});
        await snapshot(`menu-${label.toLowerCase()}`);
        if (early.fullScreenDark.length || early.app.opacity < .9) failures.push(`${label} menu blacked out the application while opening`);
        if (settled.lowContrast.length || settled.whiteBlocks.length) failures.push(`${label} menu contains unreadable resting items`);
        await page.keyboard.press('Escape');
      } catch (error) { warnings.push(`${label} menu was not exercisable: ${error.message}`); }
    }

    // Hover a sample of controls and ensure hover is not what first makes them readable.
    const controls=page.locator('button:visible,[role="button"]:visible,[role="menuitem"]:visible');
    const count=Math.min(await controls.count(),35);
    for(let i=0;i<count;i++){
      const item=controls.nth(i);
      const before=await item.evaluate(el=>{const s=getComputedStyle(el);return {opacity:s.opacity,color:s.color,bg:s.backgroundColor,text:(el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,80)}}).catch(()=>null);
      if(!before)continue;
      await item.hover().catch(()=>{});
      await page.waitForTimeout(30);
      const after=await item.evaluate(el=>{const s=getComputedStyle(el);return {opacity:s.opacity,color:s.color,bg:s.backgroundColor}}).catch(()=>null);
      if(Number(before.opacity)<.2 && after && Number(after.opacity)>.75) failures.push(`Control was hidden until hover: ${before.text}`);
    }

    // Responsive direct-file smoke.
    for (const width of [1024,650,430]) {
      await page.setViewportSize({width,height:900});
      await page.waitForTimeout(650);
      const m=await metrics();
      results.push({name:`viewport-${width}`,metrics:m});
      await snapshot(`viewport-${width}`);
      if (m.fullScreenDark.length || m.app.opacity < .9) failures.push(`Viewport ${width} has a blackout layer`);
      if (m.whiteBlocks.length) failures.push(`Viewport ${width} has ${m.whiteBlocks.length} white/blank surfaces`);
      if (m.lowContrast.length) failures.push(`Viewport ${width} has ${m.lowContrast.length} severe contrast failures`);
    }

    if (consoleErrors.length) failures.push(`Console errors: ${consoleErrors.join(' | ')}`);
    if (pageErrors.length) failures.push(`Page errors: ${pageErrors.join(' | ')}`);
    const report={
      overall:failures.length?'FAIL':'PASS',
      generatedAt:new Date().toISOString(),
      target,
      failures:[...new Set(failures)],warnings:[...new Set(warnings)],consoleErrors,pageErrors,results
    };
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
    fs.writeFileSync(path.join(root,'reports','MOTION_VISIBILITY_STATUS.txt'),report.overall+'\n');
    if (failures.length) process.exitCode=1;
    await context.close();
  } catch (error) {
    const report={overall:'FAIL',fatal:String(error&&error.stack||error),failures,consoleErrors,pageErrors};
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
    fs.writeFileSync(path.join(root,'reports','MOTION_VISIBILITY_STATUS.txt'),'FAIL\n');
    process.exitCode=1;
  } finally {
    if(browser) await browser.close();
  }
})();
