// 60fps screencast filmer: node film.mjs <scenario> [theme]
// Writes frames to film/<scenario>/f_<ms>.jpg and a contact sheet film/<scenario>_sheet.png
import { chromium } from '/home/sittingmongoose/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';
import fs from 'node:fs'; import { execSync } from 'node:child_process';
const scenario = process.argv[2] || 'ob-open'; const theme = process.argv[3] || 'friendly-dark';
const dir = `film/${scenario}`; fs.rmSync(dir, {recursive:true, force:true}); fs.mkdirSync(dir, {recursive:true});
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files','--force-device-scale-factor=1'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; page.on('pageerror', e => errs.push(e.message));
const onbState = scenario.startsWith('tour') ? JSON.stringify({completed:true, provider_done:true}) : null;
await page.addInitScript((s)=>{ try{ localStorage.clear(); if(s) localStorage.setItem('pmf.onboarding.v1', s);}catch(e){} }, onbState);
await page.goto('file:///mnt/Cursor/PuppetMaster/Concepts/TestFablePMConcpet.html#no-onboarding', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(t=>window.PM_THEME.set(t), theme); await page.waitForTimeout(500);
const SLOW = parseFloat(process.env.SLOW||'1');
const cdp = await page.context().newCDPSession(page);
if (SLOW !== 1) { await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 1/SLOW }); await page.evaluate(s=>{ window.__pmfTimeScale = s; }, SLOW); }
let frames=[]; let t0=null; let recording=false;
cdp.on('Page.screencastFrame', async (ev)=>{ try { await cdp.send('Page.screencastFrameAck', {sessionId: ev.sessionId}); } catch(e){} if(!recording) return; const ts = ev.metadata.timestamp*1000; if(t0===null) t0=ts; const ms=Math.round((ts-t0)/SLOW); frames.push({ms, data: ev.data}); });
await cdp.send('Page.bringToFront');
await cdp.send('Page.startScreencast', { format:'jpeg', quality: parseInt(process.env.Q||'82'), maxWidth: parseInt(process.env.MAXW||'1440'), maxHeight: 900, everyNthFrame: 1 });
await page.waitForTimeout(400);
// ---- scenario setup (before t=0) ----
const S = {};
const _wft = page.waitForTimeout.bind(page); page.waitForTimeout = (ms)=>_wft(ms*SLOW);
S['ob-open'] = { setup: async()=>{}, trigger: ()=>page.evaluate(()=>window.PMF_ONBOARDING.open({fresh:true, source:'film'})), dur: 1600 };
S['ob-where-begin'] = { setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>window.PMF_ONBOARDING.go('where')); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>{ window.PMF_ONBOARDING.draft().mode='new'; window.PMF_ONBOARDING.go('begin'); }), dur: 1500 };
S['ob-begin-history'] = { setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>{const P=window.PMF_ONBOARDING; P.draft().mode='new'; P.draft().name='Book club website'; P.draft().online=true; P.draft().online_account='jared'; P.go('name');}); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>window.PMF_ONBOARDING.go('history')), dur: 1500 };
S['ob-pick'] = { setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>window.PMF_ONBOARDING.go('where')); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>document.querySelector('#pmf-onboarding [data-group="where"][data-arg="remote"]').click()), dur: 1400 };
S['ob-commit'] = { dur: 6200, setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>{const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Book club website'; d.online=true; d.online_account='jared'; P.go('review');}); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>window.PMF_ONBOARDING.actions.commit()) };
S['ob-commit-old'] = { setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>{const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Book club website'; d.online=true; d.online_account='jared'; P.go('review');}); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>window.PMF_ONBOARDING.actions.commit()), dur: 5200 };
S['ob-done-tour'] = { setup: async()=>{ await page.evaluate(()=>{window.PMF_ONBOARDING.open({fresh:true, source:'film'});}); await page.waitForTimeout(1400); await page.evaluate(()=>{const P=window.PMF_ONBOARDING; const d=P.draft(); d.mode='new'; d.name='Book club website'; d.committed={project_id:'bcw',receipt_id:'r',at:''}; d.providers={cursor:{state:'ready'}}; P.go('done');}); await page.waitForTimeout(1800); }, trigger: ()=>page.evaluate(()=>window.PMF_ONBOARDING.actions.finish()), dur: 2600 };
S['tour-showme-open'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>window.PMF_TOUR.actions.next()); await page.waitForTimeout(1200); }, trigger: ()=>page.evaluate(()=>document.querySelector('#pmf-tour [data-act="show-me"]').click()), dur: 3200 };
S['tour-step-travel'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>window.PMF_TOUR.actions.next()); await page.waitForTimeout(1200); await page.evaluate(()=>window.PMF_TOUR.h.showChat()); await page.waitForTimeout(900); }, trigger: ()=>page.evaluate(()=>window.PMF_TOUR.actions.next()), dur: 1400 };
S['tour-drag'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>{const T=window.PMF_TOUR; T.actions.next(); T.h.showChat();}); await page.waitForTimeout(900); await page.evaluate(()=>window.PMF_TOUR.goto(4)); await page.waitForTimeout(1200); }, trigger: ()=>page.evaluate(()=>document.querySelector('#pmf-tour [data-act="show-me"]').click()), dur: 5000 };
S['tour-eli5'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>{const T=window.PMF_TOUR; T.actions.next(); T.h.showChat();}); await page.waitForTimeout(600); await page.evaluate(()=>window.PMF_TOUR.goto(2)); await page.waitForTimeout(600); await page.evaluate(()=>window.PMF_TOUR.h.sendGuided()); await page.waitForTimeout(3800); await page.evaluate(()=>window.PMF_TOUR.goto(3)); await page.waitForTimeout(900); }, trigger: ()=>page.evaluate(()=>window.PMF_TOUR.h.applyEli5()), dur: 1400 };
S['tour-consequence'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>{window.PM_PAGES.go('wizard');}); await page.waitForTimeout(600); await page.evaluate(()=>{const T=window.PMF_TOUR; T.fx.goalSubmitted=true; T.fx.answer='me'; T.goto(10);}); await page.waitForTimeout(1200); await page.evaluate(()=>document.querySelector('[data-pmft="edit-answer"]').click()); await page.waitForTimeout(900); }, trigger: ()=>page.evaluate(()=>document.querySelector('[data-pmft="choose"][data-choice="organizers"]').click()), dur: 1800 };
S['tour-outcomes'] = { setup: async()=>{ await page.evaluate(()=>window.PMF_TOUR.start({source:'film'})); await page.waitForTimeout(900); await page.evaluate(()=>{window.PM_PAGES.go('wizard');}); await page.waitForTimeout(600); await page.evaluate(()=>{const T=window.PMF_TOUR; T.goto(7);}); await page.waitForTimeout(1400); }, trigger: ()=>page.evaluate(()=>document.querySelector('[data-pmft="submit-goal"]').click()), dur: 1800 };
const sc = S[scenario]; if(!sc){ console.log('unknown scenario'); process.exit(1); }
await sc.setup();
await page.waitForTimeout(300);
frames=[]; t0=null; recording=true;
const trig = sc.trigger(); // do not await before stamping
await _wft(sc.dur * SLOW);
recording=false; await trig;
await cdp.send('Page.stopScreencast');
// dedupe consecutive identical frames and write
let last=null, kept=0; const meta=[];
for (const f of frames){ if(f.data===last) continue; last=f.data; fs.writeFileSync(`${dir}/f_${String(f.ms).padStart(5,'0')}.jpg`, Buffer.from(f.data,'base64')); meta.push(f.ms); kept++; }
fs.writeFileSync(`${dir}/meta.json`, JSON.stringify({scenario, theme, frames: meta, total: frames.length}));
console.log(`frames ${frames.length} kept ${kept} span ${meta.length? meta[meta.length-1]:0}ms errors ${JSON.stringify(errs)}`);
// contact sheet: up to 30 frames sampled evenly, 6 columns, with ms labels
const N = Math.min(30, kept); const pick=[]; for(let i=0;i<N;i++){ pick.push(meta[Math.round(i*(kept-1)/Math.max(1,N-1))]); }
const font = fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') ? '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' : null;
const inputs = pick.map(ms=>`-i ${dir}/f_${String(ms).padStart(5,'0')}.jpg`).join(' ');
const crop = process.env.CROP || ''; // e.g. "1120:720:160:90"
const fc = pick.map((ms,i)=>`[${i}]${crop?`crop=${crop},`:''}scale=480:-1${font?`,drawtext=fontfile=${font}:text='${ms}ms':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6`:''}[s${i}]`).join(';') + ';' + pick.map((_,i)=>`[s${i}]`).join('') + `xstack=inputs=${N}:layout=` + pick.map((_,i)=>`${(i%6)*480}_${Math.floor(i/6)*(crop? Math.round(480*parseInt(crop.split(':')[1])/parseInt(crop.split(':')[0])) : 300)}`).join('|');
execSync(`ffmpeg -loglevel error -y ${inputs} -filter_complex "${fc}" film/${scenario}_sheet.png`);
console.log('sheet', `film/${scenario}_sheet.png`);
await browser.close();
