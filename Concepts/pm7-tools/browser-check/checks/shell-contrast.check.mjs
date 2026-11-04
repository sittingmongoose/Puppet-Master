// SW18: rendered text contrast on onboarding's primary action and Recommended badge.
import {decodePng} from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const looks=['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark']);
const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
export default async function(t){
 const f=await t.app.open();
 await f.evaluate(()=>O55.studio.onboarding.screen('where','fresh'));
 await f.waitForSelector('#pm-o55-onboarding .o55-tag');
 for(const look of (t.args.looks?String(t.args.looks).split(','):looks)){
  await f.evaluate(([family,mode])=>O55.ui.applyLook(family,mode),look.split('-')); await t.settle();
  // An enabled action: select the first Computer card through its real control.
  await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [role="radio"]').first().click();
  for(const [sel,hover] of [['.o55-tag',false],['.o55-foot .o55-primary',false],['.o55-foot .o55-primary',true]]){
   const el=f.locator('#pm-o55-onboarding '+sel+':visible').first();
   if(hover) await el.hover(); else await t.page.mouse.move(1,1); await t.settle();
   const meta=await el.evaluate(e=>{const n=[...e.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());const r=document.createRange();r.selectNodeContents(n||e); const b=r.getBoundingClientRect(),a=e.getBoundingClientRect();const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.fillStyle=getComputedStyle(e).color;ctx.fillRect(0,0,1,1);return{x:b.x-a.x,y:b.y-a.y,w:b.width,h:b.height,text:e.textContent,fg:[...ctx.getImageData(0,0,1,1).data].slice(0,3)};});
   const png=decodePng(await el.screenshot());
   const counts=new Map(),pixels=[];
   for(let y=Math.max(0,Math.floor(meta.y));y<Math.min(png.height,Math.ceil(meta.y+meta.h));y++)for(let x=Math.max(0,Math.floor(meta.x));x<Math.min(png.width,Math.ceil(meta.x+meta.w));x++){const i=(y*png.width+x)*4,c=[...png.data.slice(i,i+3)],k=c.map(v=>v>>4).join(',');pixels.push(c);const b=counts.get(k)||[0,0,0,0];for(let j=0;j<3;j++)b[j]+=c[j];b[3]++;counts.set(k,b);}
   const b=[...counts.values()].sort((a,b)=>b[3]-a[3])[0],ground=b.slice(0,3).map(v=>v/b[3]);
   const distance=c=>c.reduce((n,v,i)=>n+(v-meta.fg[i])**2,0);const stem=pixels.reduce((best,c)=>distance(c)<distance(best)?c:best);const cr=ratio(stem,ground);
   t.log(`${look} ${sel}${hover?' hover':''}: ${cr.toFixed(2)}:1`);
   await t.check(`${look} ${sel}${hover?' hover':''} text >=4.5`,cr>=4.5,`${meta.text.trim()}: ${cr.toFixed(2)}:1`);
  }
 }
}
