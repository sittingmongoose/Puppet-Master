import {paintedText} from '../helpers/painted-text.mjs';
// Stream F shell state regressions; run on both normal and opaque-origin surfaces.
export const tests = {
 async 'SW31 every CLI installer exposes failure examples'(t) {
  const f=await t.app.open();
  await f.evaluate(()=>O55.studio.onboarding.screen('ai-all','fresh'));
  await f.waitForSelector('#pm-o55-onboarding [data-o55-do="install"]');
  await f.locator('#pm-o55-onboarding [data-o55-do="useAlt"][data-arg="cursor"]').click();
  const ids=await f.locator('#pm-o55-onboarding [data-o55-do="install"]').evaluateAll(es=>es.map(e=>e.dataset.arg));
  await t.check('CLI install rows exist',ids.length>=5,ids.join(','));
  for(const id of ids){
   for(const code of ['offline','unsupported','permission','verify']){
    await f.locator(`#pm-o55-onboarding [data-o55-do="install"][data-arg="${id}"]`).click();
    const hints=f.locator(`#pm-o55-onboarding [data-key="dh-install:${id}"] button`);
    const n=await hints.count();
    await t.check(`${id}: failures offered before acquisition`,n>=5);
    if(n<5) break;
    await hints.nth(['works','offline','unsupported','permission','verify'].indexOf(code)).click();
    await f.locator(`#pm-o55-onboarding [data-o55-do="installGo"][data-arg="${id}"]`).click();
    await f.waitForFunction(id=>O55.S.sess.ai.accounts[id].state==='installFailed',id);
    const row=await f.evaluate(id=>O55.S.sess.ai.accounts[id],id);
    const authStarted=await f.evaluate(id=>Object.keys(O55.S.sess.ops||{}).some(k=>k.startsWith('signin:'+id+':')),id);
    await t.check(`${id} ${code}: failed without install or auth`,row.installFailCode===code && !row.installed && row.state==='installFailed' && !authStarted);
    await t.check(`${id} ${code}: reason visible`,await f.locator('#pm-o55-onboarding').innerText().then(text=>text.includes(({offline:'download could not finish',unsupported:'does not support this operating system',permission:'installer was refused permission',verify:'program could not be verified'})[code])));
    await t.check(`${id} ${code}: Retry asks for consent`,await f.locator(`#pm-o55-onboarding [data-o55-do="install"][data-arg="${id}"]`).count()===1);
   }
   await f.locator(`#pm-o55-onboarding [data-o55-do="install"][data-arg="${id}"]`).click();
   await t.check(`${id}: retry requires a fresh Install press`,await f.locator(`#pm-o55-onboarding [data-o55-do="installGo"][data-arg="${id}"]`).count()===1);
   await f.locator(`#pm-o55-onboarding [data-o55-do="installGo"][data-arg="${id}"]`).click();
   await f.waitForFunction(id=>O55.S.sess.ai.accounts[id].state==='signin',id);
   await t.check(`${id}: verified retry offers separate sign-in`,await f.evaluate(id=>{const r=O55.S.sess.ai.accounts[id];return !!(r.installed||r.altInstalled)&&!Object.keys(O55.S.sess.ops).some(k=>k.startsWith('signin:'+id+':'));},id));
  }
 },
 async 'SW31 OpenCode managed install failures stop before server auth'(t) {
  const f=await t.app.open();
  await f.evaluate(()=>O55.studio.onboarding.screen('ai-all','fresh'));
  await f.locator('[data-o55-do="server"][data-arg="opencode-runtime"]').click();
  await f.locator('[data-o55-do="ocMode"][data-arg="managed"]').click();
  const hints=f.locator('[data-key="dh-install:opencode-runtime"] button');
  const n=await hints.count(); await t.check('managed installer exposes failure hints',n===5);
  if(n!==5)return;
  await hints.nth(4).click(); await f.locator('[data-o55-do="installGo"][data-arg="opencode-runtime"]').click();
  await f.waitForFunction(()=>O55.S.sess.ai.accounts['opencode-runtime'].state==='installFailed');
  await t.check('no install or server start',await f.evaluate(()=>{const r=O55.S.sess.ai.accounts['opencode-runtime'];return !r.installed && r.installFailCode==='verify' && !O55.S.sess.ops['oc:opencode-runtime:1'];}));
 },
 async 'SW34 Everything restores the default Home layout'(t) {
  if(t.args.sandbox==='1') return;
  const f=await t.app.open();
  await f.evaluate(()=>PMW.applyNamed('focus'));
  await t.equal('changed layout saved',()=>f.evaluate(()=>PMW.state.layout.named),'focus');
  await Promise.all([f.waitForNavigation(),f.evaluate(()=>O55.studio.reset.everything())]);
  await f.waitForFunction(()=>window.O55 && O55.S.open);
  await t.equal('Home returns to default',()=>f.evaluate(()=>PMW.state.layout.named),'home');
 },
 async 'SW03 per-project NieR survives opaque-origin switching'(t) {
  const f=await t.app.open();
  await t.viewport(1390,900);
  await t.page.emulateMedia({reducedMotion:'no-preference'});
  await f.evaluate(()=>O55.studio.looks.setReduced(false));
  await f.evaluate(() => O55.studio.looks.set('nier','dark'));
  await t.until('tastebook is NieR',()=>PMLogo.look()==='nier-dark');
  await f.locator('#o55np-reboot').waitFor({state:'hidden'});
  await f.evaluate(() => PM_PROJECT_BOX.select('harbor'));
  await t.until('other project is Basic',()=>PMLogo.look()==='basic-dark');
  await f.locator('#o55np-reboot').waitFor({state:'hidden'});
  await f.evaluate(() => PM_PROJECT_BOX.select('tastebook'));
  await f.locator('#o55np-reboot').waitFor({state:'visible',timeout:5000});
  await t.check('tastebook pick plays NieR reboot cover',await f.locator('#o55np-reboot').isVisible());
  await t.until('tastebook returns to NieR',()=>PMLogo.look()==='nier-dark');
 },
 async 'SW07 search dismissal preserves useful focus'(t) {
  const f=await t.app.open();
  for(const look of ['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark'])){
   await t.app.look(look); await f.locator('#o55np-reboot').waitFor({state:'hidden'});
   for(const [w,h] of [[740,900],[860,900],[900,900],[1024,900],[1280,900],[1280,500],[1390,900],[1920,900]]){
    await t.viewport(w,h); await t.settle();
    if(!await f.locator('#tbSearchBtn').isVisible()) {await t.check(`${look} ${w}x${h} inline`,await f.locator('#tbSearchInput').isVisible());continue;}
    for(const mode of ['Escape','outside margin','outside control']){
     await f.locator('#tbSearchBtn').focus();await t.page.keyboard.press('Enter');
     await f.waitForSelector('#tbSearchPopInput',{state:'visible'});
     let target='tbSearchBtn';
     if(mode==='Escape') await t.page.keyboard.press('Escape');
     else if(mode==='outside margin') {
      // Real pointer click on a nonfocusable page margin, including opaque iframe coordinates.
      await f.locator('body').click({position:{x:w-4,y:h-4}});
     } else {
      const control=f.locator('#themeMenuWrap button:visible').first();
      target=await control.getAttribute('id'); await control.click();
     }
     await t.settle();
     await t.equal(`${look} ${w}x${h} ${mode} focus`,()=>f.evaluate(()=>document.activeElement.id),target);
     await t.check(`${look} ${w}x${h} ${mode} closed`,await f.evaluate(()=>!PM_TB_SEARCH.isOpen()));
     await t.page.keyboard.press('Escape');
    }
   }
  }
 },
 async 'SW08 Studio opens tip-bearing owner screens'(t) {
  let f;
  for (const look of ['nier-light','friendly-dark']) {
   f=await t.app.open();
   await f.evaluate(()=>O55.studio.looks.setReduced(true));await t.settle();
   await t.app.look(look); await f.locator('#o55np-reboot').waitFor({state:'hidden'});
   if(t.args.helpSelftest==='transparent') await f.addStyleTag({content:'#pm7ob-explainer .pst-bt-on, #pm7ob-explainer .pst-bt-off, #pm7ob-explainer .o55-explainer-w {opacity:0!important}'});
   for (const id of ['ai','ai-none','c-review','c-pair','c-ready','s-kind','s-wait','s-confirm','s-ready','away-setup']) {
    await f.evaluate(() => O55.studio.open('onboarding'));
    const row=f.locator(`#pmds-sheet [data-pmds-do="open-screen"][data-arg="${id}"]`);
    await row.scrollIntoViewIfNeeded(); await row.click();
    await t.until(`${look} ${id} opens`, () => window.O55.S.open && !!document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'));
    await f.waitForFunction(()=>{const e=document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');return e && !e.matches('.o55-hold,.o55-entering') && e.innerText.trim().length>0;},null,{timeout:15000});
    await t.equal(`${look} ${id} owner screen`, () => f.evaluate(() => O55.S.sess.screen),id);
    await t.equal(`${look} ${id} keeps look`,()=>f.evaluate(()=>PMLogo.look()),look);
    await t.check(`${look} ${id} pane has content`,await f.locator('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)').innerText().then(x=>x.trim().length>0));
    const note=f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="tip"]:visible').first();
    // A deliberate negative fixture proves a missing control cannot silently pass.
    if(t.args.helpSelftest==='missing') await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="tip"]').evaluateAll(es=>es.forEach(e=>e.remove()));
    await t.check(`${look} ${id} help control exists`,await note.count()>0);
    if(!await note.count()) throw new Error(`${look} ${id}: required help control missing`);
    await note.click();
    // A full-box hit probe can select stage SVG decoration around this prose.
    // Require the note and its rendered body to be visible instead.
    await f.waitForFunction(()=>{const e=document.querySelector('#pm7ob-explainer');if(!e)return false;const r=e.getBoundingClientRect();if(!(r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.x<innerWidth&&r.y<innerHeight))return false;for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility!=='visible'||Number(s.opacity)===0)return false;}return true;});
    await t.check(`${look} ${id} help note visible`,await f.locator('#pm7ob-explainer').isVisible());
    const words=f.locator('#pm7ob-explainer .pst-bt-on, #pm7ob-explainer .o55-explainer-w').first();
    await t.check(`${look} ${id} help note has rendered body text`,await words.isVisible()&&(await words.innerText()).trim().length>0);
    const opacity=await words.evaluate(e=>{const walk=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let count=0,n;while((n=walk.nextNode())){if(!n.textContent.trim())continue;count++;for(let p=n.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility!=='visible'||Number(s.opacity)===0)return false;}}return count>0;});
    await t.check(`${look} ${id} body text subtree has visible opacity`,opacity);
    const bodyPaint=await paintedText(words);
    t.log(JSON.stringify({look,id,bodyPaint}));
    await t.check(`${look} ${id} body text paints ink`,bodyPaint.count>=3&&bodyPaint.minimum>=3,JSON.stringify(bodyPaint));
    if(['c-pair','s-wait'].includes(id)) await t.crop(`${look}-${id}-help`,'#pm7ob-explainer','Rendered help body stays visible on the pairing and discovery screens');

    await f.evaluate(() => O55.ui.close());
   }
  }
 },
 async 'SW30 route result follows completed status'(t) {
  const f=await t.app.open();
  await f.click('#tab-settings');
  await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]');
  await f.click('#pm-settings-root .domain-link[data-domain="system"]');
  await f.evaluate(() => PM51.go('system','servers'));
  await f.locator('[role="tab"][data-action="pm51-tab"][data-manager="servers"][data-tab="away"]').click();
  // Admit a configured route fixture; the default fresh Project has none to check.
  await f.evaluate(()=>{const r=PM51.s().serverProject.remoteAccess.routes.find(r=>r.id==='tailscale');r.status='ready';r.enabled=true;PM51.refresh('servers');});

  const check=f.locator('[data-action="pm51-servers-route-check"]:not([aria-disabled="true"])').first();
  await check.click();
  const state=await f.evaluate(() => ({checking:!!document.querySelector('[data-route][data-status="testing"]'),result:[...document.querySelectorAll('.drawer-wrap')].some(e=>e.textContent.includes('Checked · example data'))}));
  await t.check('no completed result while checking', !state.checking || !state.result, JSON.stringify(state));
  await f.waitForFunction(()=>!![...document.querySelectorAll('.drawer-wrap')].find(e=>e.textContent.includes('Checked · example data')));
  await t.check('result row is finished',await f.evaluate(()=>!document.querySelector('[data-route][data-status="testing"]')));


 }
};
