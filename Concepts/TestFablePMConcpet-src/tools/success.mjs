import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
const THEMES = ['friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','basic-light','basic-dark'];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.addInitScript(()=>{ try{ localStorage.clear(); }catch(e){} });
await page.goto('file:///mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2200);
for (const t of THEMES) { await page.evaluate(t=>window.PM_THEME.set(t), t); await page.waitForTimeout(800); await page.screenshot({ path: `shots/v3_welcome_${t}.png` }); }
await page.evaluate(()=>{ const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Book club website'; d.online=true; d.online_account='jared'; d.history=true; d.committed={project_id:'book-club-website', receipt_id:'rcpt-demo-1', at:''}; P.state.stack=['welcome']; P.go('commit'); });
await page.waitForTimeout(1200);
for (const t of THEMES) { await page.evaluate(t=>window.PM_THEME.set(t), t); await page.waitForTimeout(700); await page.screenshot({ path: `shots/v3_success_${t}.png` }); }
await browser.close();
