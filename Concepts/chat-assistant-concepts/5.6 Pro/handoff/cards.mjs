import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const target=process.argv[2], out=process.argv[3];
fs.mkdirSync(out,{recursive:true});
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
for (const theme of ['basic-dark','basic-light']) {
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  await p.goto(pathToFileURL(path.resolve(target)).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
  await p.evaluate(t=>PM56_DEMO.setTheme(t), theme);
  await p.waitForTimeout(400);
  for (const d of ['goal','todo','subagents','changes','artifacts']) {
    await p.hover(`[data-hover-domain="${d}"]`);
    await p.waitForSelector('.hover-card.ab-card',{timeout:4000});
    await p.waitForTimeout(420);
    const present = await p.evaluate(()=>{const c=document.querySelector('.hover-card.ab-card');
      if(!c) return null; const r=c.getBoundingClientRect();
      return {x:r.left,y:r.top,w:r.width,h:r.height,domain:c.dataset.domain,op:getComputedStyle(c).opacity};});
    // full viewport shot, cropped generously around the card
    const clip={x:Math.max(0,Math.round(present.x)-14),y:Math.max(0,Math.round(present.y)-14),
      width:Math.round(present.w)+28,height:Math.round(present.h)+28};
    fs.writeFileSync(path.join(out,`${theme}-${d}.png`), await p.screenshot({clip, animations:'disabled'}));
    console.log(theme,d,JSON.stringify(present));
    await p.mouse.move(600,300); await p.waitForTimeout(300);
  }
  await p.close();
}
await b.close();
