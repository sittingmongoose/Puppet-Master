// SW18: compare opaque glyph stems to the ground painted at those exact pixels.
import {decodePng} from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
const looks=['basic','friendly','retro','glass','nier'].flatMap(x=>[x+'-light',x+'-dark']);
const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
async function measure(t,f,el,label){
 const meta=await el.evaluate(e=>{const n=[...e.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());const r=document.createRange();r.selectNodeContents(n||e);const b=r.getBoundingClientRect(),a=e.getBoundingClientRect();const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.fillStyle=getComputedStyle(e).color;ctx.fillRect(0,0,1,1);return{x:b.x-a.x,y:b.y-a.y,w:b.width,h:b.height,fg:[...ctx.getImageData(0,0,1,1).data].slice(0,3)};});
 const retain=label.startsWith('glass')&&!label.includes('Recommended')&&(label.endsWith('rest')||label.endsWith('hover'));
 if(retain) await t.crop(label,el,'Glass gradient and highlight remain visible behind legible primary text');
 const ink=decodePng(await el.screenshot());
 // Retain the exact background, filter, gradient and geometry. Only ink/shadow disappear.
 const styles=await el.evaluate(e=>[e,...e.querySelectorAll('*')].map(n=>{const s=n.getAttribute('style');n.style.setProperty('-webkit-text-fill-color','transparent','important');n.style.setProperty('text-shadow','none','important');return s;}));
 let ground;
 try {ground=decodePng(await el.screenshot());if(retain) await t.crop(label+' ground',el,'Same painted gradient with only text ink hidden, for independent pixel measurement');}
 finally {await el.evaluate((e,styles)=>[e,...e.querySelectorAll('*')].forEach((n,i)=>styles[i]===null?n.removeAttribute('style'):n.setAttribute('style',styles[i])),styles);}
 const samples=[];
 for(let y=Math.max(0,Math.ceil(meta.y));y<Math.min(ink.height,Math.floor(meta.y+meta.h));y++)for(let x=Math.max(0,Math.ceil(meta.x));x<Math.min(ink.width,Math.floor(meta.x+meta.w));x++){
  const i=(y*ink.width+x)*4,a=[...ink.data.slice(i,i+3)],b=[...ground.data.slice(i,i+3)];
  if(Math.max(...a.map((v,j)=>Math.abs(v-b[j])))>40) samples.push({distance:Math.hypot(...a.map((v,j)=>v-meta.fg[j])),contrast:ratio(a,b)});
 }
 const nearest=Math.min(...samples.map(s=>s.distance));
 const stems=samples.filter(s=>s.distance<=nearest+1).map(s=>s.contrast);
 const cr=Math.min(...stems);
 t.log(`${label}: ${cr.toFixed(2)}:1, ${stems.length} opaque stem pixels`);
 await t.check(`${label} local text >=4.5`,stems.length>=3&&cr>=4.5,`${cr.toFixed(2)}:1 (${stems.length} stems)`);
}
export default async function(t){
 const f=await t.app.open(); await t.viewport(1390,900);
 for(const look of (t.args.looks?String(t.args.looks).split(','):looks)){

  for(const screen of (look.startsWith('glass')?['where','ai-all','ai-install']:['where'])){
   await f.evaluate(id=>O55.studio.onboarding.screen(id,'fresh'),screen==='ai-install'?'ai-all':screen);
   await f.waitForFunction(id=>O55.S.sess&&O55.S.sess.screen===id,screen==='ai-install'?'ai-all':screen);
   await f.waitForFunction(()=>{const e=document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)');return e&&!e.matches('.o55-hold,.o55-entering');});
   await f.evaluate(([family,mode])=>O55.ui.applyLook(family,mode),look.split('-'));await t.settle();
   await f.waitForFunction(expected=>PMLogo.look()===expected,look);
   await f.locator('#o55np-reboot').waitFor({state:'hidden'});
   await t.equal(`${look} ${screen} look retained`,()=>f.evaluate(()=>PMLogo.look()),look);
   if(screen==='where') await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [role="radio"]').first().click();
   await t.page.mouse.move(1,1);await t.settle();
   if(screen==='where') await measure(t,f,f.locator('#pm-o55-onboarding .o55-tag:visible').first(),look+' Recommended');
   if(screen==='ai-install') await f.locator('#pm-o55-onboarding [data-o55-do="install"][data-arg="claude"]').click();
   const el=f.locator(screen==='ai-install'?'#pm-o55-onboarding [data-o55-do="installGo"][data-arg="claude"]':'#pm-o55-onboarding .o55-foot .o55-primary:visible:not(:disabled)').first();
   await t.check(`${look} ${screen} expected primary label`,(await el.textContent()).trim()===(screen==='where'?'Continue':screen==='ai-install'?'Install':'Done'));
   for(const state of (look.startsWith('glass')?['rest','hover','focus','pressed']:['rest','hover'])){
    await t.page.mouse.move(1,1); await el.evaluate(e=>e.blur());
    if(state==='hover'||state==='pressed') await el.hover();
    if(state==='focus'){await t.page.keyboard.press('Tab');await el.focus();await t.check(`${look} ${screen} keyboard focus visible`,await el.evaluate(e=>e.matches(':focus-visible')));}
    if(state==='pressed'){await t.page.mouse.down();await t.check(`${look} ${screen} pressed`,await el.evaluate(e=>e.matches(':active')));}
    try {await t.settle();await measure(t,f,el,`${look} ${screen} ${state}`);}
    finally {if(state==='pressed'){await t.page.mouse.move(1,1);await t.page.mouse.up();}}
   }
  }
 }
}
