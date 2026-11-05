// FO-63/64: real actions invalidate the result they abandon. Film the AI remove transition at 60 fps.
// checkedit (FO-63 reentrant): typing into the auto-cleared key field while the working key's check runs, focus kept until
// the check ends, raises no uncaught error, and the cheer that result earns is still owned by its account.
import { LOOKS } from '../browser-check.config.mjs';
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';

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

async function wording(t,f,mode) {
 const want=mode ? 'Expert' : 'ELI5';
 if(await f.evaluate(()=>O55.talk.mode())!==want) await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
 await t.check('requested wording is applied',await f.evaluate(()=>O55.talk.mode())===want,want);
}
export default async function(t) {
 const initialViewport=t.args.widths ? await t.page.evaluate(()=>({width:innerWidth,height:innerHeight})) : null;
 const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
 for (const [ix,look] of looks.entries()) for (const mode of [0,1]) {
  if(t.args.widths) {const widths=String(t.args.widths).split(',').map(Number);await t.page.setViewportSize({width:widths[(ix*2+mode)%widths.length],height:t.args.short ? 500 : 1080});}
  if (t.args.only !== 'token') for (const action of (t.args.action ? String(t.args.action).split(',') : t.args.multi ? ['remove','key','unrelated'] : ['remove','key','checkedit'])) await t.step(`${look} w${mode} AI cheer ${action}`, async()=>{
   const f = await t.app.open(); await t.app.look(look);
   await t.emulate({ reducedMotion:t.args.motion === 'reduced' ? 'reduce' : 'no-preference' });
   if(t.args.motion === 'reduced') await t.check('Reduced Motion is applied',await f.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
   await openAt(t,f,'ai');
   await wording(t,f,mode);
   const row = '[data-key="pv-cursor"] ';
   await f.locator(LAYER+' '+row+'[data-o55-do="key"]').waitFor({state:'visible'});
   await t.check('key entry opens after provider detection',await click(t,f,row+'[data-o55-do="key"]'),'',{hard:true});
   async function key(v) { await f.locator('#o55f-key-cursor').fill(v); await click(t,f,row+'[data-o55-do="keyCheck"]'); }
   if(t.args.multi) {
    await key('demo-key-previous-123456');
    await f.waitForFunction(()=>O55.S.sess.ai.list.some(x=>x.provider==='cursor'));
    await f.locator(LAYER+' '+row+'[data-o55-do="manage"]').first().click();
    await f.locator(LAYER+' '+row+'[data-o55-do="manage"]').first().click();
    await f.locator(LAYER+' '+row+'[data-o55-do="addAnother"]').first().click();
   }
   await key('short-key');
   await f.waitForFunction(()=>Object.values(O55.S.sess.ops).some(x=>x.state==='failed'));
   await t.page.waitForTimeout(300);
   if(action==='checkedit') {
    /* in the app's own window (the sandbox is an opaque frame): every uncaught error from here on */
    await f.evaluate(()=>{window.__ckErr=[];addEventListener('error',(e)=>__ckErr.push(String(e.message||e.error)));addEventListener('unhandledrejection',(e)=>__ckErr.push('rejection: '+String(e.reason)));});
    await key('demo-key-0000-1111-2222');
    const field=f.locator('#o55f-key-cursor');
    await field.focus(); await field.pressSequentially('bad');
    const during=await f.evaluate(()=>{const a=document.activeElement;return {state:O55.S.sess.ai.accounts.cursor.state,focused:a&&a.id,value:a&&a.value};});
    await t.check('replacement typed into the focused key field while its check runs',during.state==='keyChecking'&&during.focused==='o55f-key-cursor'&&during.value==='bad',JSON.stringify(during),{hard:true});
    const added=await f.waitForFunction(()=>O55.S.sess.ai.list.some(x=>x.provider==='cursor'),null,{timeout:5000}).then(()=>true,()=>false);
    await t.mark(`${look} w${mode} check ends under the focused edit`);
    const cheered=await f.waitForFunction(()=>{const b=document.querySelector('#pm-o55-onboarding .pst-bt-on');return b && b.textContent.startsWith('That');},null,{timeout:4000}).then(()=>true,()=>false);
    const errs=await f.evaluate(()=>__ckErr);
    await t.check('no uncaught error when the check ends under a focused key edit',errs.length===0,JSON.stringify(errs));
    if(!(await t.check('the working key still adds its account and its cheer',added&&cheered,JSON.stringify({added,cheered})))) return;
   } else {
    await key('demo-key-0000-1111-2222');
    await f.waitForFunction(()=>O55.S.sess.ai.list.some(x=>x.provider==='cursor'));
    await f.waitForFunction(()=>{const b=document.querySelector('#pm-o55-onboarding .pst-bt-on');return b && b.textContent.startsWith('That');});
   }
   if(action==='checkedit') {
    const typed=await f.evaluate(()=>O55.S.sess.ai.accounts.cursor.keyTyped);
    await t.check('discarded replacement clears typed state',typed===false,JSON.stringify({typed}));
    await f.locator(LAYER+' '+row+'[data-o55-do="manage"]').first().click();
    await f.locator(LAYER+' '+row+'[data-o55-do="addAnother"]').first().click();
    await f.waitForSelector('#o55f-key-cursor');
    const fresh=await f.evaluate(()=>({value:document.querySelector('#o55f-key-cursor').value,typed:O55.S.sess.ai.accounts.cursor.keyTyped}));
    await t.check('Add another key opens empty and untyped',fresh.value===''&&fresh.typed===false,JSON.stringify(fresh));
    await f.locator(LAYER+' [data-o55-do="cancelAdd"]').first().click();
   }
   const ids=await f.evaluate(()=>O55.S.sess.ai.list.filter(x=>x.provider==='cursor').map(x=>x.id));
   const targetId=ids[ids.length-1], otherId=ids.length>1 ? ids[0] : null;
   await f.evaluate(([targetId,otherId,action])=>{
    window.__aiFrames=[];window.__aiBefore=null;
    const capture=(e)=>{if(e.target.closest('[data-o55-do="removeGo"]') || (e.type==='input' && e.target.id==='o55f-key-cursor')) window.__aiBefore=document.querySelector('#pm-o55-onboarding .pst-bt-on')?.textContent;};
    document.addEventListener('pointerdown',capture,true);document.addEventListener('input',capture,true);
    window.__aiStop=()=>{document.removeEventListener('pointerdown',capture,true);document.removeEventListener('input',capture,true);};
    const tick=()=>{const b=document.querySelector('#pm-o55-onboarding .pst-bubble'), el=b&&b.querySelector('.pst-bt-on');
     const text=b&&b.classList.contains('on')&&el?el.textContent:'';
     /* (checkedit leaves its discarded replacement noted as typed; only a key typed after the cheer ends it) */
     const alive=O55.S.sess.ai.list.some(x=>x.id===targetId) && (action==='checkedit' || !O55.S.sess.ai.accounts.cursor.keyTyped);
     __aiFrames.push({alive,text,otherGone:!!otherId&&!O55.S.sess.ai.list.some(x=>x.id===otherId)}); window.__aiRAF=requestAnimationFrame(tick);};tick();
   },[targetId,otherId,action]);
   await f.locator(LAYER+' '+row+'[data-o55-do="manage"]').first().click({force:true});
   if(action!=='key') await f.locator(LAYER+' '+row+'[data-o55-do="remove"][data-arg="'+(action==='unrelated'?otherId:targetId)+'"]').click({force:true});
   else await f.locator(LAYER+' '+row+'[data-o55-do="addAnother"]').first().click({force:true});
   if(action!=='key') await f.locator(LAYER+' '+row+'[data-o55-do="removeGo"]').first().click({force:true});
   else await f.locator('#o55f-key-cursor').fill('replacement-key-1234');
   await t.mark(`${look} w${mode} account ${action}`);
   await t.page.waitForTimeout(1100);
   const r=await f.evaluate(()=>{cancelAnimationFrame(__aiRAF);__aiStop();return {frames:__aiFrames,before:__aiBefore};});
   await t.check('cheer is still typing at the invalidating input',!!r.before&&r.before.startsWith('That'),r.before||'no captured speech');
   if(action==='unrelated') {
    const first=r.frames.find(x=>x.otherGone);
    await t.check('removing a different account keeps this account cheer',!!first&&first.alive&&first.text.startsWith('That'),JSON.stringify(first));
    return;
   }
   const gone=r.frames.filter(x=>!x.alive), bad=gone.filter(x=>x.text.startsWith('That'));
   await t.check('account removal/key edit cannot keep its cheer',gone.length>10&&bad.length===0,JSON.stringify({frames:gone.length,bad:bad.length,first:gone.slice(0,4)}));
   if(action==='key') {
    /* a key's revision follows its value: a nonempty-to-nonempty keystroke is an edit, the change the blur repeats is not */
    const rev=()=>f.evaluate(()=>O55.S.sess.ai.accounts.cursor.keyRevision||0);
    const r0=await rev(); await f.locator('#o55f-key-cursor').press('End'); await f.locator('#o55f-key-cursor').press('x');
    const r1=await rev(); await f.locator('#o55f-key-cursor').evaluate((el)=>el.blur());
    const r2=await rev();
    await t.check('nonempty key edit advances its revision, the unchanged blur change does not',r1===r0+1&&r2===r1,JSON.stringify({r0,r1,r2}));
   }
  });
  if(t.args.only !== 'ai') await t.step(`${look} w${mode} token abandoned`,async()=>{
   const f=await t.app.open();await t.app.look(look);await openAt(t,f,'online-service');
   await wording(t,f,mode);
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
 if(initialViewport) await t.page.setViewportSize(initialViewport);
}
