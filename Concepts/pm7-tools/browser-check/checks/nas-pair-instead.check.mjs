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
   if(wording==='ELI5') {
    for(const [w,h] of [[860,768],[1024,768],[1280,900],[1390,900],[1920,1080],[740,768],[1280,500]]) {
     await t.viewport(w,h); await t.visible(b,`${look} ${w}x${h}: Pair instead on top`);
     await t.check('action text fits',await b.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
    }
    await t.viewport(1920,1080);
   }
   await t.text(b,/^Pair instead$/i); await t.check('screen-reader name',await f.getByRole('button',{name:/^Pair instead$/i}).count()===1); await t.visible(b,'Pair instead reachable');
   // Reach it with the keyboard, then inspect the owner's visible focus paint.
   for(let i=0;i<70;i++){if(await b.evaluate(e=>e===document.activeElement))break;await t.page.keyboard.press('Tab');}
   await t.check('keyboard reaches Pair instead',await b.evaluate(e=>e===document.activeElement));
   if(look.startsWith('nier-'))await f.evaluate(()=>Promise.all((document.getElementById('o55np-reticle')?.getAnimations({subtree:true})||[]).map(a=>a.finished.catch(()=>{}))));
   await t.check('visible focus',await b.evaluate(e=>{const s=getComputedStyle(e);const bracket=['::before','::after'].some(p=>{const v=getComputedStyle(e,p);return v.content!=='none'&&v.opacity!=='0'&&[v.borderTopStyle,v.borderRightStyle,v.borderBottomStyle,v.borderLeftStyle].some(b=>b!=='none');});const ret=document.getElementById('o55np-reticle'),r=e.getBoundingClientRect(),corners=ret?[...ret.children].map(c=>c.getBoundingClientRect()):[],q=corners.length===4?{left:Math.min(...corners.map(c=>c.left)),right:Math.max(...corners.map(c=>c.right)),top:Math.min(...corners.map(c=>c.top)),bottom:Math.max(...corners.map(c=>c.bottom))}:null,v=ret&&getComputedStyle(ret);if(q){q.width=q.right-q.left;q.height=q.bottom-q.top;}const reticle=q&&v.visibility!=='hidden'&&+v.opacity>0&&q.left<=r.left&&q.right>=r.right&&q.top<=r.top&&q.bottom>=r.bottom&&q.width<r.width+24&&q.height<r.height+24;return e.matches(':focus-visible')&&(s.outlineStyle!=='none'||s.boxShadow!=='none'||bracket||reticle);}));
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
 // Pending device picks do not switch the committed NAS. The typed form keeps its endpoint too.
 await A.click('useSsh',undefined,'nas-identity'); await A.click('back',undefined,'nas-find');
 await A.click('device','nas-media'); await t.count(L+'[data-o55-do="pairInstead"]',0);
 await A.click('device','nas-home'); await A.click('manualOn'); await A.fill('o55f-addr','192.168.1.20'); await A.fill('o55f-port','22');
 await A.click('pairInstead',undefined,'nas-pmpair'); await A.click('back',undefined,'nas-find');
 await t.equal('typed address kept',await f.locator('#o55f-addr').inputValue(),'192.168.1.20');
 await t.equal('typed port kept',await f.locator('#o55f-port').inputValue(),'22');
 // Media server can only use SSH; Check again models the person enabling it on that NAS.
 await A.fill('o55f-addr','192.168.1.31'); await t.count(L+'[data-o55-do="pairInstead"]',0);
 await A.click('checkAgain'); await A.waitEnabled('next'); await A.click('next',undefined,'nas-identity'); await A.click('back',undefined,'nas-find');
 for(const wording of ['ELI5','Expert']) {await f.evaluate(w=>O55.talk.set(w),wording);await t.count(L+'[data-o55-do="pairInstead"]',0);}
}
