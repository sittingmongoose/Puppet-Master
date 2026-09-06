import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files'] });
const results = [];
async function scenario(name, fn, opts={}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width||1440, height: opts.height||900 }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errs=[]; page.on('pageerror', e => errs.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,200)); });
  await page.addInitScript((pre)=>{ try{ if(!sessionStorage.getItem('mx-init')){ localStorage.clear(); sessionStorage.setItem('mx-init','1'); if(pre) Object.keys(pre).forEach(k=>localStorage.setItem(k, pre[k])); } }catch(e){} }, opts.pre||null);
  await page.goto('file:///mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html' + (opts.hash||''), { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(600);
  try { await page.waitForFunction(()=>window.PMF_ONBOARDING && (!window.PMF_ONBOARDING.state.open || !!window.PMF_ONBOARDING.state.screen), null, { timeout: 8000 }); } catch (e) {}
  await page.waitForTimeout(400);
  if (opts.theme) { await page.evaluate(t=>window.PM_THEME.set(t), opts.theme); await page.waitForTimeout(400); }
  const H = {
    page,
    st: ()=>page.evaluate(()=>({open:window.PMF_ONBOARDING.state.open, screen:window.PMF_ONBOARDING.state.screen})),
    click: async (sel, wait=650)=>{ const ok=await page.evaluate(s=>{const el=document.querySelector(s); if(!el||el.disabled||el.getAttribute('aria-disabled')==='true') return false; el.click(); return true;}, sel); if(!ok) results.push(`  [${name}] CLICK FAILED ${sel}`); await page.waitForTimeout(wait); return ok; },
    next: async (wait=750)=>H.click('#pmf-onboarding .pmf-foot .pmf-btn.is-primary', wait),
    shot: (n)=>page.screenshot({path:`shots/mx/${name}_${n}.png`}),
    type: async (sel, text)=>{ await page.evaluate(s=>document.querySelector(s).focus(), sel); await page.type(sel, text, {delay: 8}); await page.waitForTimeout(150); },
    scenario: async (id)=>{ await page.evaluate(id=>{ window.PMF_ONBOARDING.scenario_id=id; const P=window.PMF_ONBOARDING; P.state.draft=P.newDraft(); P.state.stack=[]; P.go('welcome','back',{replace:true}); }, id); await page.waitForTimeout(600); },
    expect: async (label, pred)=>{ const ok = await page.evaluate(pred); results.push(`  [${name}] ${ok?'PASS':'FAIL'} ${label}`); return ok; },
    wait: (ms)=>page.waitForTimeout(ms)
  };
  try { await fn(H); } catch(e) { results.push(`  [${name}] EXCEPTION ${e.message.slice(0,200)}`); }
  results.push(`  [${name}] errors: ${errs.length? JSON.stringify(errs.slice(0,3)) : 'none'}`);
  await ctx.close();
}

// 1. remote Puppet Master: connect → pair → ready → create new project there
await scenario('remote', async (H)=>{
  await H.next(); await H.click('#pmf-onboarding [data-group="where"][data-arg="remote"]'); await H.next(1900); await H.shot('01_connect');
  await H.click('#pmf-onboarding [data-group="server"][data-arg="studio"]'); await H.next(1200); await H.shot('02_pair');
  await H.wait(2600); await H.shot('03_paired'); await H.expect('paired', ()=>window.PMF_ONBOARDING.draft().paired===true);
  await H.next(900); await H.shot('04_ready'); await H.expect('ready screen', ()=>window.PMF_ONBOARDING.state.screen==='ready');
  await H.next(900); await H.expect('begin on remote', ()=>window.PMF_ONBOARDING.state.screen==='begin' && window.PMF_ONBOARDING.draft().where==='remote');
  await H.click('#pmf-onboarding [data-group="mode"][data-arg="new"]'); await H.next(); await H.type('#pmf-name','Book club website'); await H.shot('05_name_remote'); await H.next(); await H.next(); await H.shot('06_review_remote');
  await H.expect('review mentions server', ()=>document.querySelector('#pmf-onboarding .pmf-review').textContent.includes('Studio Mac mini'));
});
// 1b. pairing code path
await scenario('paircode', async (H)=>{
  await H.next(); await H.click('#pmf-onboarding [data-group="where"][data-arg="remote"]'); await H.next(600);
  await H.click('#pmf-onboarding [data-act="pair-code"]', 500); await H.type('#pmf-paircode','481926'); await H.shot('01_code'); await H.click('#pmf-onboarding [data-act="pair-code-go"]', 800);
  await H.expect('pair screen via code', ()=>window.PMF_ONBOARDING.state.screen==='pair');
});
// 2. existing folder
await scenario('folder', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="existing"]'); await H.next(); await H.shot('01_existing');
  await H.click('#pmf-onboarding [data-group="source"][data-arg="folder"]'); await H.next(); await H.click('#pmf-onboarding [data-group="folder"][data-arg="~/dev/tastebook"]'); await H.shot('02_folder_picked');
  await H.next(); await H.shot('03_review'); await H.expect('Add Project label', ()=>document.querySelector('#pmf-onboarding .pmf-foot .pmf-btn.is-primary').textContent.includes('Add Project'));
  await H.next(3500); await H.expect('committed', ()=>!!window.PMF_ONBOARDING.draft().committed);
});
// 3. existing online with JIT sign-in
await scenario('online', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="existing"]'); await H.next(); await H.click('#pmf-onboarding [data-group="source"][data-arg="online"]'); await H.next(); await H.shot('01_online');
  await H.click('#pmf-onboarding [data-act="host-pick"][data-arg="gitlab"]'); await H.click('#pmf-onboarding [data-act="host-signin-repos"]', 800); await H.shot('02_signin'); await H.wait(2400); await H.click('#pmf-onboarding [data-act="signin-done"]', 1400); await H.shot('03_repos');
  await H.expect('repos listed', ()=>document.querySelectorAll('#pmf-onboarding [data-group="repo"]').length>0);
  await H.click('#pmf-onboarding [data-group="repo"]'); await H.next(); await H.shot('04_review');
  await H.expect('no provider setup opened during sign-in', ()=>!window.PMF_ONBOARDING.commands.some(c=>c.command_id==='cmd.provider.detect'));
});
// 4. NAS over SSH: wrong password then right
await scenario('nas', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="existing"]'); await H.next(); await H.click('#pmf-onboarding [data-group="source"][data-arg="nas"]'); await H.next(1900); await H.shot('01_nas');
  await H.expect('SSH default', ()=>document.querySelector('#pmf-onboarding [data-group="nas_method"][data-arg="ssh"]').getAttribute('aria-checked')==='true');
  await H.click('#pmf-onboarding [data-group="nas_device"][data-arg="synology"]'); await H.shot('02_connect');
  await H.type('#pmf-nas-pass','ab'); await H.click('#pmf-onboarding [data-act="nas-connect"]', 2400); await H.shot('03_failed');
  await H.expect('auth failed shown', ()=>!!document.querySelector('#pmf-ssh-phases [data-state="failed"]'));
  await H.page.evaluate(()=>{document.querySelector('#pmf-nas-pass').value='';}); await H.type('#pmf-nas-pass','correct-horse'); await H.click('#pmf-onboarding [data-act="nas-connect"]', 3600); await H.shot('04_connected');
  await H.expect('connected', ()=>window.PMF_ONBOARDING.draft().nas_connected===true);
  await H.click('#pmf-onboarding [data-group="nas_folder"]'); await H.next(); await H.shot('05_review');
});
// 5. restore
await scenario('restore', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="restore"]'); await H.next(); await H.click('#pmf-onboarding [data-group="backup"][data-arg="b2"]'); await H.shot('01_restore'); await H.next(); await H.shot('02_review');
  await H.expect('Restore Project label', ()=>document.querySelector('#pmf-onboarding .pmf-foot .pmf-btn.is-primary').textContent.includes('Restore Project'));
});
// 6. flaky commit: fail, retry succeeds
await scenario('flaky', async (H)=>{
  await H.scenario('flaky'); await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="new"]'); await H.next(); await H.type('#pmf-name','Flaky test'); await H.next();
  await H.click('#pmf-onboarding [data-act="online-toggle"]'); await H.click('#pmf-onboarding [data-act="host-signin"]', 3000); await H.click('#pmf-onboarding [data-act="signin-done"]'); await H.next(); await H.next(4200); await H.shot('01_failed');
  await H.expect('failed phase visible', ()=>!!document.querySelector('#pmf-commit-phases [data-state="failed"]'));
  await H.expect('retry offered', ()=>!!document.querySelector('#pmf-onboarding [data-act="commit-retry"]'));
  await H.click('#pmf-onboarding [data-act="commit-retry"]', 5200); await H.shot('02_retry_ok');
  await H.expect('committed after retry (idempotent key reused)', ()=>{const d=window.PMF_ONBOARDING.draft(); const cmds=window.PMF_ONBOARDING.commands.filter(c=>c.command_id==='cmd.project.create'); return !!d.committed && cmds.length===2 && cmds[0].payload.idempotency_key===cmds[1].payload.idempotency_key;});
});
// 7. returning: like another project + groups; provider auto-ready
await scenario('returning', async (H)=>{
  await H.scenario('returning'); await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="new"]'); await H.next(); await H.type('#pmf-name','Second project'); await H.next(); await H.shot('01_like');
  await H.expect('like screen shown', ()=>window.PMF_ONBOARDING.state.screen==='like');
  await H.expect('start fresh default', ()=>document.querySelector('#pmf-onboarding [data-group="inherit"][data-arg=""]').getAttribute('aria-checked')==='true');
  await H.click('#pmf-onboarding [data-group="inherit"][data-arg="tastebook"]', 900); await H.shot('02_preview');
  await H.expect('preview shown', ()=>document.querySelector('#pmf-inherit-preview').textContent.includes('planning preferences'));
  await H.click('#pmf-onboarding [data-act="choose-groups"]', 600); await H.shot('03_groups'); await H.click('#pmf-onboarding [data-act="group-toggle"][data-arg="appearance"]'); await H.click('#pmf-onboarding [data-act="sheet-close"]');
  await H.next(); await H.next(); await H.shot('04_review'); await H.expect('review shows inherit', ()=>document.querySelector('#pmf-onboarding .pmf-review').textContent.includes('Like Tastebook'));
  await H.next(3800); await H.next(1800); await H.shot('05_power_ready');
  await H.expect('claude auto ready', ()=>(window.PMF_ONBOARDING.draft().providers.claude_sub||{}).state==='ready');
  await H.expect('cursor shows Sign in', ()=>!!document.querySelector('#pmf-onboarding [data-act="prov-signin"][data-arg="cursor"]'));
  await H.expect('antigravity shows Install', ()=>!!document.querySelector('#pmf-onboarding [data-act="prov-install"][data-arg="antigravity"]'));
});
// 8. close and resume before commit; back through every screen
await scenario('resume', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="new"]'); await H.next(); await H.type('#pmf-name','Resume me'); await H.next();
  await H.click('#pmf-onboarding [data-act="close"]', 600); await H.expect('closed', ()=>!window.PMF_ONBOARDING.state.open);
  await H.expect('no project created', ()=>!window.PMF_ONBOARDING.receipts.some(r=>r.kind==='project.commit'));
  await H.page.reload({waitUntil:'load'}); await H.wait(2600); await H.shot('01_resumed');
  await H.expect('resumed at history with name', ()=>window.PMF_ONBOARDING.state.open && window.PMF_ONBOARDING.state.screen==='history' && window.PMF_ONBOARDING.draft().name==='Resume me');
  await H.expect('welcome back banner', ()=>!!document.querySelector('#pmf-onboarding .pmf-banner'));
  for (const s of ['name','begin','where','welcome']) { await H.click('#pmf-onboarding [data-act="back"]'); await H.expect('back to '+s, `window.PMF_ONBOARDING.state.screen==='${s}'`); }
  await H.expect('still no project', ()=>!window.PMF_ONBOARDING.receipts.some(r=>r.kind==='project.commit'));
});
// 9. provider install path + api key bad/good + skip + free skip; then tour handoff
await scenario('providers', async (H)=>{
  await H.page.evaluate(()=>{ const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Prov'; d.committed={project_id:'prov',receipt_id:'r',at:''}; P.state.stack=['welcome']; P.go('power'); }); await H.wait(1800); await H.shot('01_power');
  await H.click('#pmf-onboarding [data-act="prov-install"][data-arg="claude_sub"]', 600); await H.shot('02_install_sheet'); await H.click('#pmf-onboarding [data-act="prov-install-go"]', 3600); await H.shot('03_installed');
  await H.expect('install then sign in offered', ()=>!!document.querySelector('#pmf-sheet [data-act="prov-signin"][data-arg="claude_sub"]'));
  await H.click('#pmf-sheet [data-act="prov-signin"][data-arg="claude_sub"]', 2800); await H.click('#pmf-onboarding [data-act="prov-done"]', 700); await H.shot('04_claude_ready');
  await H.expect('claude ready', ()=>(window.PMF_ONBOARDING.draft().providers.claude_sub||{}).state==='ready');
  await H.click('#pmf-onboarding [data-act="prov-key"][data-arg="anthropic_api"]', 500); await H.type('#pmf-key','bad key'); await H.click('#pmf-onboarding [data-act="prov-key-go"]', 1600); await H.shot('05_key_rejected');
  await H.expect('bad key rejected', ()=>document.querySelector('#pmf-key-hint').classList.contains('is-err'));
  await H.page.evaluate(()=>{document.querySelector('#pmf-key').value='';}); await H.type('#pmf-key','sk-ant-abcdefghijklmnop'); await H.click('#pmf-onboarding [data-act="prov-key-go"]', 1600); await H.click('#pmf-onboarding [data-act="prov-done"]', 600);
  await H.expect('api key ready', ()=>(window.PMF_ONBOARDING.draft().providers.anthropic_api||{}).state==='ready');
  await H.expect('no Connect/Use/Open Installer wording', ()=>!/Use This Installation|Use This Provider|Open Installer|>\s*Connect\s*</.test(document.querySelector('#pmf-onboarding .pmf-body').innerHTML));
  await H.next(); await H.click('#pmf-onboarding [data-act="free-skip"]'); await H.shot('06_done');
  await H.click('#pmf-onboarding [data-act="finish"]', 1500); await H.shot('07_tour_started');
  await H.expect('tour started from onboarding', ()=>window.PMF_TOUR.state.running && window.PMF_TOUR.state.source==='onboarding');
});
// 10. skip provider entirely then choose free models
await scenario('skipprov', async (H)=>{
  await H.page.evaluate(()=>{ const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Skip'; d.committed={project_id:'skip',receipt_id:'r',at:''}; P.state.stack=['welcome']; P.go('power'); }); await H.wait(1800);
  await H.click('#pmf-onboarding [data-act="power-skip"]'); await H.expect('free screen', ()=>window.PMF_ONBOARDING.state.screen==='free');
  await H.click('#pmf-onboarding [data-act="free-done"]'); await H.expect('done', ()=>window.PMF_ONBOARDING.state.screen==='done');
  await H.expect('free models receipt', ()=>window.PMF_ONBOARDING.receipts.some(r=>r.kind==='provider.free_models'));
});
// 11. close after commit and reopen resumes at provider phase
await scenario('postcommit', async (H)=>{
  await H.next(); await H.next(); await H.click('#pmf-onboarding [data-group="mode"][data-arg="new"]'); await H.next(); await H.type('#pmf-name','Post'); await H.next(); await H.next(); await H.next(3200);
  await H.expect('committed', ()=>!!window.PMF_ONBOARDING.draft().committed);
  await H.click('#pmf-onboarding [data-act="close"]', 500); await H.page.reload({waitUntil:'load'}); await H.wait(2600); await H.shot('01_reopen');
  await H.expect('reopens at power', ()=>window.PMF_ONBOARDING.state.open && window.PMF_ONBOARDING.state.screen==='power');
  await H.expect('project not recreated', ()=>window.PMF_ONBOARDING.draft().committed && window.PMF_ONBOARDING.draft().committed.project_id==='post');
});
// 12. settings entry points


await scenario('settings2', async (H)=>{
  await H.page.evaluate(()=>window.PMF_ONBOARDING.skip()); await H.wait(500);
  await H.page.evaluate(()=>window.PM_PAGES.go('settings')); await H.wait(900);
  const ok1 = await H.click('[data-action="replay-onboarding"]', 1400); await H.shot('01_replay'); await H.expect('settings replay opens onboarding', ()=>window.PMF_ONBOARDING.state.open && window.PMF_ONBOARDING.state.screen==='welcome');
  await H.page.evaluate(()=>window.PMF_ONBOARDING.close('test')); await H.wait(500);
  await H.click('[data-action="start-guided-tour"]', 1400); await H.shot('02_tour'); await H.expect('settings starts tour', ()=>window.PMF_TOUR.state.running);
});
// 13. narrow + reduced motion + retro theme welcome
await scenario('narrow', async (H)=>{ await H.shot('01_welcome_narrow'); await H.next(); await H.shot('02_where_narrow'); await H.expect('no horizontal overflow', ()=>document.documentElement.scrollWidth<=window.innerWidth+1); }, { width: 900, height: 700, theme: 'retro-light' });
await scenario('reduced', async (H)=>{ await H.next(); await H.next(); await H.shot('01_begin_reduced'); await H.expect('reduced flag', ()=>window.PMF_ONBOARDING.util.reduced()); }, { reduced: true, theme: 'glass-light' });
await browser.close();
console.log(results.join('\n'));
