// generic PNG crop/scale via headless chromium canvas
import { chromium } from 'playwright';
import fs from 'fs';
const [,, src, outPrefix, spec] = process.argv;
// spec: JSON array of {x,y,w,h,scale,name}
const jobs = JSON.parse(spec);
const b64 = fs.readFileSync(src).toString('base64');
const br = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-gpu'] });
const p = await br.newPage();
const outs = await p.evaluate(async ([b64, jobs]) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const res = [];
  for (const j of jobs) {
    const sc = j.scale || 1;
    const c = document.createElement('canvas');
    c.width = Math.round(j.w * sc); c.height = Math.round(j.h * sc);
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, j.x, j.y, j.w, j.h, 0, 0, c.width, c.height);
    res.push([j.name, c.toDataURL('image/png')]);
  }
  return res;
}, [b64, jobs]);
for (const [name, url] of outs) {
  fs.writeFileSync(outPrefix + name + '.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', outPrefix + name + '.png');
}
await br.close();
