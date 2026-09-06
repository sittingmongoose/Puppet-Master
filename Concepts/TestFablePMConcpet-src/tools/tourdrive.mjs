import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
const theme = process.env.THEME || 'friendly-dark';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on('pageerror', e => errs.push(e.message)); page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,300)); });
await page.addInitScript(()=>{ try{ localStorage.clear(); localStorage.setItem('pmf.onboarding.v1', JSON.stringify({completed:true, provider_done:true})); }catch(e){} });
await page.goto('file:///mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate(t=>window.PM_THEME.set(t), theme); await page.waitForTimeout(600);
// count provider/demo sends
await page.evaluate(()=>{ window.__demoSends=0; try{ const d=window.PM_DEMO; if(d&&d.chat&&d.chat.send){ const o=d.chat.send; d.chat.send=function(){ window.__demoSends++; return o.apply(this, arguments);} } }catch(e){} });
const st = ()=> page.evaluate(()=>({idx:window.PMF_TOUR.state.index, step:window.PMF_TOUR.current&&window.PMF_TOUR.current.id, done: window.PMF_TOUR.current && window.PMF_TOUR.state.done[window.PMF_TOUR.current.id]}));
const shot = async n=>page.screenshot({path:`shots/tour_${n}.png`});
console.log('start', await page.evaluate(()=>window.PMF_TOUR.start({source:'test'})));
await page.waitForTimeout(900); console.log(JSON.stringify(await st())); await shot('00_intro');
const clickAct = async (act)=>{ const ok=await page.evaluate(a=>{const b=document.querySelector(`#pmf-tour [data-act="${a}"]`); if(!b||b.getAttribute('aria-disabled')==='true') return false; b.click(); return true;}, act); if(!ok) console.log('NO BTN', act); return ok; };
await clickAct('next'); await page.waitForTimeout(900); console.log(JSON.stringify(await st())); await shot('01_open_chat');
for (let i=1;i<=11;i++){
  const s=await st(); if(!s.step) break;
  const isAction = await page.evaluate(()=>!!(window.PMF_TOUR.current&&window.PMF_TOUR.current.action));
  if (isAction) {
    await clickAct('show-me'); 
    const ok = await page.waitForFunction(()=>{const T=window.PMF_TOUR; return T.current && T.state.done[T.current.id];}, null, {timeout: 12000}).then(()=>true).catch(()=>false);
    await page.waitForTimeout(700);
    const s2=await st(); console.log('after showme', JSON.stringify(s2), ok?'OK':'TIMEOUT'); await shot(`${String(i+1).padStart(2,'0')}_${s2.step}_done`);
    if(!ok) break;
  } else { await shot(`${String(i+1).padStart(2,'0')}_${s.step}`); }
  await clickAct('next'); await page.waitForTimeout(1100);
}
console.log('final', JSON.stringify(await st())); await shot('99_outro');
await clickAct('restore-layout'); await page.waitForTimeout(900); await shot('99_after');
console.log('demoSends', await page.evaluate(()=>window.__demoSends), 'providerReq', await page.evaluate(()=>window.PMF_TOUR.provider_requests));
console.log('errors', JSON.stringify(errs.slice(0,10)));
console.log('receipts', await page.evaluate(()=>window.PMF_TOUR.receipts.map(r=>r.kind+':'+r.status+(r.detail.id?'('+r.detail.id+')':'')).join(', ')));
await browser.close();
