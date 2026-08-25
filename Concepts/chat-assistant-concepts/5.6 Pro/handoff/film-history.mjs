/* Films the drawer OPEN and the drawer PIN with CDP screencast frames, then
 * builds a contact sheet (an HTML page of the frames, screenshotted) so the
 * interpolation can be looked at rather than inferred from a metric. */
import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
import path from 'path';

const DIR='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/hfilm';
fs.mkdirSync(DIR,{recursive:true});
const FILE=process.argv[2]||"/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";

const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>PM56_DEMO.setVariant(1,5));
await p.waitForTimeout(600);

const cdp=await p.context().newCDPSession(p);
let frames=[], t0=0;
cdp.on('Page.screencastFrame', async e=>{
  frames.push({data:e.data, t: e.metadata.timestamp*1000 - t0});
  try{ await cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}); }catch(err){}
});
async function film(ms, sel){
  frames=[]; t0=0;
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:80,everyNthFrame:1,maxWidth:1440,maxHeight:900});
  await p.waitForTimeout(140);
  /* t0 and the click MUST be one round-trip.  Timing them separately puts
     Playwright's actionability wait plus two CDP hops (~150-250ms here) between
     the mark and the event, which reads on a contact sheet as a dead period the
     app does not actually have. */
  t0 = await p.evaluate(sel=>{
    var el=document.querySelector(sel); var t=performance.timeOrigin+performance.now();
    el.click(); return t;
  }, sel);
  await p.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  return frames.slice();
}

// close first so the OPEN can be filmed from scratch
await p.locator('[data-action="toggle-history"]').first().click();
await p.waitForTimeout(600);

const openFrames = await film(520, '[data-action="toggle-history"]');
await p.waitForTimeout(500);
const pinFrames  = await film(520, '[data-action="ph-toggle-pin"]');
await p.waitForTimeout(500);
const closeFrames= await film(520, '[data-action="toggle-history"]');

console.log('frames captured  open:',openFrames.length,' pin:',pinFrames.length,' close:',closeFrames.length);

/* Contact sheet: crop each frame to the assistant pane so the drawer edge and
   the transcript's left edge are both visible and comparable frame to frame. */
/* Tight crop on the drawer's own travel: from a little left of the pane edge to
   a little past the widest the drawer ever gets, and only the top third, so the
   drawer edge and the transcript's left edge are both large and comparable. */
const crop = await p.evaluate(()=>{const r=document.querySelector('.assistant-pane').getBoundingClientRect();
  return {x:Math.round(r.left)-8,y:Math.round(r.top),w:360,h:300};});

const SC=0.62;
function sheet(title, fr, every){
  const use = fr.filter(f=>f.t>=-30).filter((_,i)=>i%every===0).slice(0,12);
  return `<section><h2>${title} — ${fr.length} frames, showing every ${every}</h2><div class="row">`
    + use.map(f=>`<figure><div class="clip"><div class="inner" style="width:${crop.w}px;height:${crop.h}px">
        <img src="data:image/jpeg;base64,${f.data}" style="margin-left:${-crop.x}px;margin-top:${-crop.y}px">
      </div></div><figcaption>${Math.round(f.t)}ms</figcaption></figure>`).join('')
    + '</div></section>';
}
const html=`<!doctype html><meta charset=utf-8><style>
body{background:#0b0d14;color:#dfe4f2;font:12px system-ui;margin:0;padding:14px}
h2{font-size:13px;margin:16px 0 6px} .row{display:flex;gap:5px;flex-wrap:nowrap}
figure{margin:0;flex:0 0 auto;width:${Math.round(crop.w*SC)}px}
figcaption{text-align:center;color:#8e97aa;font-size:11px;margin-top:3px}
.clip{width:${Math.round(crop.w*SC)}px;height:${Math.round(crop.h*SC)}px;overflow:hidden;border:1px solid #353d50;border-radius:4px}
.inner{overflow:hidden;position:relative;transform:scale(${SC});transform-origin:top left}
img{position:absolute;top:0;left:0}
</style><h1 style="font-size:15px">5.6 Pro history drawer — filmed</h1>
${sheet('OPEN (translateX(-102%) -> 0, 240ms)',openFrames,2)}
${sheet('PIN (width 300 -> 200 in place, gutter 0 -> 200)',pinFrames,2)}
${sheet('CLOSE (exit animation, node kept alive for the duration)',closeFrames,2)}`;
fs.writeFileSync(path.join(DIR,'sheet.html'),html);

const p2=await b.newPage({viewport:{width:2900,height:1000},deviceScaleFactor:1});
await p2.goto(pathToFileURL(path.join(DIR,'sheet.html')).href,{waitUntil:'load'});
await p2.waitForTimeout(900);
await p2.screenshot({path:path.join(DIR,'contact-sheet.png'),fullPage:true});
console.log('wrote',path.join(DIR,'contact-sheet.png'));
await b.close();
