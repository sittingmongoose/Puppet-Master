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
 async 'SW07 Escape restores search trigger'(t) {
  const f = await t.app.open();
  const looks=['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark']);
  for(const look of looks){
   await t.app.look(look); await f.locator('#o55np-reboot').waitFor({state:'hidden'}); await t.viewport(900,900); await t.settle();
   await t.until('search trigger is reachable',()=>{const e=document.getElementById('tbSearchBtn'),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !e.hidden && hit && (hit===e||e.contains(hit));});
   await f.locator('#tbSearchBtn').focus(); await t.page.keyboard.press('Enter');
   await f.waitForSelector('#tbSearchPopInput', {state:'visible'});
   await t.page.keyboard.press('Escape'); await t.settle();
   await t.equal(look+' focus returns to search button', () => f.evaluate(() => document.activeElement.id), 'tbSearchBtn');
  }
  for(const width of [740,860,1024,1280,1390,1920]){
   await t.viewport(width, width===1280?500:900); await t.settle();
   if(await f.locator('#tbSearchBtn').isVisible()){
    await f.locator('#tbSearchBtn').focus();await t.page.keyboard.press('Enter');await t.page.keyboard.press('Escape');await t.settle();
    await t.equal(width+' focus returns to search button',()=>f.evaluate(()=>document.activeElement.id),'tbSearchBtn');
   }else await t.check(width+' inline search visible',await f.locator('#tbSearchInput').isVisible());
  }

 },
 async 'SW08 Studio opens tip-bearing owner screens'(t) {
  let f;
  for (const look of ['nier-light','friendly-dark']) {
   f=await t.app.open();
   await t.app.look(look); await f.locator('#o55np-reboot').waitFor({state:'hidden'});
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
    if(await note.count()){await note.click();await t.check(`${look} ${id} help opens`,await f.evaluate(()=>!!O55.S.tip));}

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
