// FO-63/64: real actions invalidate the result they abandon. Film the AI remove transition at 60 fps.
import { LOOKS } from '../browser-check.config.mjs';
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const CASES = [['gitea', null], ['forgejo', null], ['github_enterprise', null], ['gitlab', 'self_managed'], ['azure_devops', 'self_managed'], ['bitbucket_cloud', 'data_center']];

const settled = (f, screen) => f.waitForFunction(([L, s]) => {
 const l = document.querySelector(L);
 return !!l && (!s || l.getAttribute('data-screen') === s) && l.getAttribute('data-screen') === window.O55.S.sess.screen && !document.documentElement.hasAttribute('data-o55-vt') && !l.matches('.o55-hold, .o55-entering');
}, [LAYER, screen], { timeout: 15000 });
async function openAt(t, f, screen) {
	await f.evaluate(() => window.O55.studio.open('onboarding'));
	await f.waitForSelector('#pmds-sheet [data-pmds-do="open-screen"]', { timeout: 15000 });
	await f.click('#pmds-sheet [data-pmds-do="pick-base"][data-arg="fresh"]');
	for (let i = 0; i < 12; i++) {
		const on = f.locator('#pmds-sheet [data-pmds-do="pick-twist"][aria-checked="true"]');
		if (!(await on.count())) break;
		await on.first().click(); await t.page.waitForTimeout(150);
	}
	const row = f.locator(`#pmds-sheet [data-pmds-do="open-screen"][data-arg="${screen}"]`);
	await row.scrollIntoViewIfNeeded(); await row.click();
	return settled(f, screen).then(() => true, () => false);
}
async function click(t, f, sel) {
	await settled(f);
	const el = f.locator(`${LAYER} ${sel}`).first();
	if (!(await el.count()) || !(await el.isVisible())) return false;
	await el.scrollIntoViewIfNeeded(); await el.click(); await settled(f); return true;
}
/* the demo hint that works (Demo Studio's sample address or token), clicked like any button */
async function works(t, f) {
	const i = await f.evaluate((L) => { const w = window.O55.t('demoHint.outcome.works'); return [...document.querySelectorAll(L + ' [data-o55-do="demoHint"]')].findIndex((e) => (e.querySelector('.o55-demohint-o') || {}).textContent === w); }, LAYER);
	if (i < 0) return false;
	const el = f.locator(`${LAYER} [data-o55-do="demoHint"]`).nth(i);
	await el.scrollIntoViewIfNeeded(); await el.click(); await settled(f); return true;
}

export default async function(t) {
 const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
 for (const [ix,look] of looks.entries()) for (const mode of [0,1]) {
  if(t.args.widths) {const widths=String(t.args.widths).split(',').map(Number);await t.page.setViewportSize({width:widths[(ix*2+mode)%widths.length],height:t.args.short ? 500 : 1080});}
  if (t.args.only !== 'token') for (const action of (t.args.action ? [t.args.action] : ['remove','key'])) await t.step(`${look} w${mode} AI cheer ${action}`, async()=>{
   const f = await t.app.open(); await t.app.look(look);
   if (t.args.motion !== 'reduced') await t.emulate({ reducedMotion:'no-preference' });
   await openAt(t,f,'ai');
   if(mode) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
   const row = '[data-key="pv-cursor"] ';
   await click(t,f,row+'[data-o55-do="key"]');
   async function key(v) { await f.locator('#o55f-key-cursor').fill(v); await click(t,f,row+'[data-o55-do="keyCheck"]'); }
   await key('short-key');
   await f.waitForFunction(()=>Object.values(O55.S.sess.ops).some(x=>x.state==='failed'));
   await t.page.waitForTimeout(300);
   await key('demo-key-0000-1111-2222');
   await f.waitForFunction(()=>O55.S.sess.ai.list.some(x=>x.provider==='cursor'));
   await f.waitForFunction(()=>{const b=document.querySelector('#pm-o55-onboarding .pst-bt-on');return b && b.textContent.startsWith('That');});
   await f.evaluate(()=>{
    window.__aiFrames=[];window.__aiBefore=null;
    const capture=(e)=>{if(e.target.closest('[data-o55-do="removeGo"]') || (e.type==='input' && e.target.id==='o55f-key-cursor')) window.__aiBefore=document.querySelector('#pm-o55-onboarding .pst-bt-on')?.textContent;};
    document.addEventListener('pointerdown',capture,true);document.addEventListener('input',capture,true);
    window.__aiStop=()=>{document.removeEventListener('pointerdown',capture,true);document.removeEventListener('input',capture,true);};
    const tick=()=>{const b=document.querySelector('#pm-o55-onboarding .pst-bubble'), el=b&&b.querySelector('.pst-bt-on');
     const text=b&&b.classList.contains('on')&&el?el.textContent:'';
     const alive=O55.S.sess.ai.list.some(x=>x.provider==='cursor') && !O55.S.sess.ai.accounts.cursor.keyTyped;
     __aiFrames.push({alive,text}); window.__aiRAF=requestAnimationFrame(tick);};tick();
   });
   await f.locator(LAYER+' '+row+'[data-o55-do="manage"]').first().click({force:true});
   if(action==='remove') await f.locator(LAYER+' '+row+'[data-o55-do="remove"]').first().click({force:true});
   else await f.locator(LAYER+' '+row+'[data-o55-do="addAnother"]').first().click({force:true});
   if(action==='remove') await f.locator(LAYER+' '+row+'[data-o55-do="removeGo"]').first().click({force:true});
   else await f.locator('#o55f-key-cursor').fill('replacement-key-1234');
   await t.mark(`${look} w${mode} account ${action}`);
   await t.page.waitForTimeout(1100);
   const r=await f.evaluate(()=>{cancelAnimationFrame(__aiRAF);__aiStop();return {frames:__aiFrames,before:__aiBefore};});
   await t.check('cheer is still typing at the invalidating input',!!r.before&&r.before.startsWith('That'),r.before||'no captured speech');
   const gone=r.frames.filter(x=>!x.alive), bad=gone.filter(x=>x.text.startsWith('That'));
   await t.check('account removal/key edit cannot keep its cheer',gone.length>10&&bad.length===0,JSON.stringify({frames:gone.length,bad:bad.length,first:gone.slice(0,4)}));
  });
  if(t.args.only !== 'ai') await t.step(`${look} w${mode} token abandoned`,async()=>{
   const f=await t.app.open();await t.app.look(look);await openAt(t,f,'online-service');
   if(mode) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
   await click(t,f,'[data-o55-do="others"]');await click(t,f,'[data-o55-do="pick"][data-arg="github_enterprise"]');await works(t,f);await click(t,f,'.o55-primary');await f.waitForFunction(()=>O55.S.sess.screen==='online-signin');await settled(f,'online-signin');
   await click(t,f,'[data-o55-do="tokenOn"]');
   await f.locator('#o55f-token').fill('pm-demo-token-7f3a9c41');
   await f.locator(LAYER+' [data-o55-do="tokenCheck"]').click();
   const running=await f.evaluate(()=>O55.S.sess.ops['token:'+O55.S.sess.signin.service]?.state==='running');
   await f.locator(LAYER+' [data-o55-do="tokenOff"]').click();await t.mark('abandoned running token');
   await t.page.waitForTimeout(1200);
   const r=await f.evaluate(()=>({state:O55.S.sess.signin.state,signin:O55.S.sess.signin}));
   await t.check('running token abandoned by browser choice cannot sign in',running&&r.state==='idle',JSON.stringify(r));
  });
 }
}
