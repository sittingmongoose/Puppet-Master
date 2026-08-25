import {chromium} from 'playwright';import {pathToFileURL} from 'url';import fs from 'fs';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const DIR='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/hfilm';
const NINE=['working','reviewing','waiting','idle','complete','blocked','failed','paused','recovering'];
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const tiles={};
for(const theme of ['basic-dark','basic-light','retro-dark','glass-light']){
 for(const reduce of [false,true]){
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:4,reducedMotion:reduce?'reduce':'no-preference'});
  await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.evaluate(t=>{PM56_DEMO.setTheme(t);PM56_DEMO.setVariant(1,5);},theme);
  await p.waitForTimeout(700);
  for(const s of NINE){
    const el=p.locator(`.history-flyout .ph-status[data-status="${s}"]`).first();
    if(await el.count()===0) continue;
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(120);
    const bx=await el.boundingBox(); if(!bx) continue;
    const png=await p.screenshot({clip:{x:bx.x-5,y:bx.y-5,width:bx.width+10,height:bx.height+10}});
    tiles[`${theme}|${reduce?'reduce':'motion'}|${s}`]='data:image/png;base64,'+png.toString('base64');
  }
  await p.close();
 }
}
// also a wide crop of the take-6 rows themselves, dark + light
const rows={};
for(const theme of ['basic-dark','basic-light']){
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
  await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.evaluate(t=>{PM56_DEMO.setTheme(t);PM56_DEMO.setVariant(1,5);},theme);
  await p.waitForTimeout(700);
  const bx=await p.locator('.history-flyout').boundingBox();
  const png=await p.screenshot({clip:{x:bx.x,y:bx.y,width:bx.width,height:Math.min(bx.height,620)}});
  rows[theme]='data:image/png;base64,'+png.toString('base64');
  await p.close();
}
const cell=(k)=>tiles[k]?`<img src="${tiles[k]}">`:'<span class=miss>–</span>';
const html=`<!doctype html><meta charset=utf-8><style>
body{background:#12141c;color:#dfe4f2;font:12px system-ui;margin:0;padding:16px}
table{border-collapse:collapse}th{font-size:10px;color:#8e97aa;font-weight:600;padding:4px 6px;text-align:center}
td{padding:3px;text-align:center}img{width:84px;height:84px;image-rendering:pixelated;border:1px solid #2b3346;border-radius:4px}
.rowlab{text-align:right;font-size:11px;color:#b9c0d4;padding-right:8px}
h2{font-size:13px;margin:16px 0 6px}.miss{color:#5b6377}
.rowshots{display:flex;gap:14px;align-items:flex-start}.rowshots img{width:430px;height:auto;image-rendering:auto}
</style><h1 style="font-size:15px">Take 6 "Preview Rows" — the nine status indicators</h1>
${['basic-dark','basic-light','retro-dark','glass-light'].map(th=>`
<h2>${th}</h2><table><tr><th></th>${NINE.map(s=>`<th>${s}</th>`).join('')}</tr>
<tr><td class=rowlab>motion</td>${NINE.map(s=>`<td>${cell(th+'|motion|'+s)}</td>`).join('')}</tr>
<tr><td class=rowlab>reduced</td>${NINE.map(s=>`<td>${cell(th+'|reduce|'+s)}</td>`).join('')}</tr></table>`).join('')}
<h2>The rows themselves (dark / light)</h2><div class=rowshots>
<img src="${rows['basic-dark']}"><img src="${rows['basic-light']}"></div>`;
fs.writeFileSync(DIR+'/glyphs.html',html);
const p2=await b.newPage({viewport:{width:1180,height:1400},deviceScaleFactor:1});
await p2.goto(pathToFileURL(DIR+'/glyphs.html').href,{waitUntil:'load'});
await p2.waitForTimeout(800);
await p2.screenshot({path:DIR+'/glyphs.png',fullPage:true});
console.log('wrote',DIR+'/glyphs.png','tiles',Object.keys(tiles).length);
await b.close();
