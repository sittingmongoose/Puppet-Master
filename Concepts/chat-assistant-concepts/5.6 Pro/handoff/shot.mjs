import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.waitForTimeout(400);
const info = await p.evaluate(()=>{
  const bar=document.querySelector('.activity-bar');
  const r=bar.getBoundingClientRect();
  return {rect:{x:r.left,y:r.top,w:r.width,h:r.height},
    items:[...bar.children].map(c=>({d:c.dataset.hoverDomain,w:+c.getBoundingClientRect().width.toFixed(1),
      text:c.innerText.replace(/\n/g,'|'), labelDisp:getComputedStyle(c.querySelector('.label')).display,
      svgW:+c.querySelector('svg').getBoundingClientRect().width.toFixed(1)}))};
});
console.log(JSON.stringify(info,null,1));
fs.writeFileSync(process.argv[3]||'bar.png', await p.screenshot({clip:{x:Math.round(info.rect.x)-6,y:Math.round(info.rect.y)-6,width:Math.round(info.rect.w)+12,height:Math.round(info.rect.h)+12}}));
await b.close();
