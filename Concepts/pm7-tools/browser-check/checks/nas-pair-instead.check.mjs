import { onboardingApp } from '../helpers/onboarding-fields.mjs';
import { LOOKS } from '../browser-check.config.mjs';
const L = '.o55-pane > .o55-layer:not(.o55-out) ';
export default async function(t) {
 const A=onboardingApp(t); await A.boot({scenario:'fresh+homeNasPm'}); const f=A.frame();
 await A.click('pick','this'); await A.click('next',undefined,'begin');
 await A.click('pick','existing'); await A.click('sub','device'); await A.click('next',undefined,'nas-find');
 await A.waitFor(()=>!!document.querySelector('.o55-card[data-arg="nas-home"]'));
 await A.click('device','nas-home'); await A.click('next',undefined,'nas-pmpair');
 await A.click('pairing','code');
 for(const wording of ['ELI5','Expert']) {
  await f.evaluate(w=>O55.talk.set(w),wording);
  for(const look of (t.args.looks?t.args.looks.split(','):LOOKS)) {
   await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-')); await A.sleep(1600);
   await A.click('useSsh',undefined,'nas-identity'); await A.click('back',undefined,'nas-find');
   const before=await f.evaluate(()=>{const n=O55.S.sess.nas;return {device:n.device,pairing:n.pairing,port:n.port,fromConfig:n.fromConfig,user:n.user,key:n.key};});
   const b=f.locator(L+'[data-o55-do="pairInstead"]');
   const exists=await b.count(); await t.check(`${wording} ${look}: Pair instead offered`,exists===1);
   if(!exists)return;
   await t.text(b,'Pair instead'); await t.visible(b,'Pair instead reachable');
   // Reach it with the keyboard, then inspect the owner's visible focus paint.
   for(let i=0;i<70;i++){if(await b.evaluate(e=>e===document.activeElement))break;await t.page.keyboard.press('Tab');}
   await t.check('keyboard reaches Pair instead',await b.evaluate(e=>e===document.activeElement));
   await t.check('visible focus',await b.evaluate(e=>{const s=getComputedStyle(e);return e.matches(':focus-visible')&&(s.outlineStyle!=='none'||s.boxShadow!=='none');}));
   const r=await b.boundingBox(); await t.page.mouse.move(r.x+r.width/2,r.y+r.height/2); await t.page.mouse.down();
   const held=await b.boundingBox(); await t.check('stationary press target',Math.max(...['x','y','width','height'].map(k=>Math.abs(held[k]-r[k])))<0.6);
   await t.page.mouse.up(); await A.screen('nas-pmpair');
   const after=await f.evaluate(()=>{const n=O55.S.sess.nas;return {device:n.device,pairing:n.pairing,port:n.port,fromConfig:n.fromConfig,user:n.user,key:n.key};});
   await t.equal('same NAS and choices',JSON.stringify(after),JSON.stringify(before));
   await t.check('pairing branch only',await f.evaluate(()=>O55.ui.onBranch('nas-pmpair')&&!O55.ui.onBranch('nas-identity')));
   await A.click('back',undefined,'nas-find'); await A.click('next',undefined,'nas-pmpair');
   await t.check('Back and forward keep one history entry per screen',await f.evaluate(()=>new Set(O55.S.sess.history).size===O55.S.sess.history.length));
  }
 }
 await A.click('back',undefined,'nas-find');
 const sshOnly=await f.evaluate(()=>O55.S.env.devices.find(d=>d.ssh&&!d.pm)?.id);
 await t.check('SSH-only fixture exists',!!sshOnly);
 if(sshOnly){await A.click('device',sshOnly);await A.click('next',undefined,'nas-identity');await A.click('back',undefined,'nas-find');await t.count(L+'[data-o55-do="pairInstead"]',0);}
}
