import { chromium } from 'playwright';
import path from 'path'; import fs from 'fs';
const OUT='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w4orbit/film';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1600,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
async function drag(pct){ const h=await p.locator('[data-resize="editor"]').first().boundingBox();
  await p.mouse.move(h.x+h.width/2,h.y+h.height/2); await p.mouse.down();
  await p.mouse.move(1600*(pct/100), h.y+h.height/2,{steps:12}); await p.mouse.up(); await p.waitForTimeout(400); }
await drag(24);
const shots=[];
for(const [take,label] of [[3,'take3-chrome'],[8,'take8-rail8']]){
  await p.evaluate(v=>{window.PM56_DEMO.setVariant(2,v); window.PM56_DEMO.setWorkStep(6);},take);
  await p.waitForTimeout(700);
  await p.evaluate(()=>document.querySelector('.wa-head,.rail8-head').scrollIntoView({block:'center'}));
  await p.waitForTimeout(250);
  const clip=await p.evaluate(()=>{const e=document.querySelector('.wa-head')||document.querySelector('.rail8-head');
    const r=e.getBoundingClientRect(); return {x:Math.round(r.left)-2,y:Math.round(r.top)-4,width:Math.min(360,Math.round(r.width)+4),height:Math.round(r.height)+8};});
  const buf = await p.screenshot({clip});
  // magnify x3 nearest-neighbour so sub-pixel smearing would be obvious
  const url='data:image/png;base64,'+buf.toString('base64');
  const out=await p.evaluate(async u=>{const i=new Image(); i.src=u; await i.decode();
    const c=document.createElement('canvas'); c.width=i.width*3; c.height=i.height*3;
    const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(i,0,0,c.width,c.height);
    return c.toDataURL('image/png');},url);
  fs.writeFileSync(`${OUT}/trail-${label}.png`, Buffer.from(out.split(',')[1],'base64'));
  shots.push(label);
}
console.log('wrote', shots.join(', '));
await b.close();
