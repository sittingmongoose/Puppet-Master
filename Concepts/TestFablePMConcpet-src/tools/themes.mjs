import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
// Usage: SCREEN=welcome|where|review|power node themes.mjs  -> shots/th_<screen>_<theme>.png + sheet
const screen = process.env.SCREEN || 'welcome';
const THEMES = ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark'];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.addInitScript(()=>{ try{ localStorage.clear(); }catch(e){} });
await page.goto('file:///mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2000);
// prepare a realistic draft for later screens
await page.evaluate((screen)=>{
  const P=window.PMF_ONBOARDING; const d=P.draft();
  if (screen!=='welcome' && screen!=='where') { d.mode='new'; d.name='Book club website'; d.path='~/Puppet Master/Book club website'; d.history=true; d.online=true; d.online_host='github'; d.online_account='jared'; }
  if (screen==='power' || screen==='free' || screen==='done') { d.committed={project_id:'book-club-website', receipt_id:'rcpt-demo', at:new Date().toISOString()}; P.state.tmp.detected=true; P.state.tmp.states={}; d.providers={cursor:{state:'ready',detail:'Signed in as jared@example.com'}}; }
  P.state.stack=['welcome']; P.go(screen,'fwd');
}, screen);
await page.waitForTimeout(900);
for (const t of THEMES) {
  await page.evaluate(t=>window.PM_THEME.set(t), t);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `shots/th_${screen}_${t}.png` });
}
await browser.close();
