import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
console.log('browser', await p.evaluate(()=>navigator.userAgent));
// 1. does animation:<name> var(--spring) both parse?
console.log(await p.evaluate(()=>{
  const d=document.createElement('div'); d.style.cssText='animation: menu-pop var(--spring) both'; document.body.appendChild(d);
  const cs=getComputedStyle(d);
  const r={inlineAnimName:cs.animationName, inlineDur:cs.animationDuration, inlineEase:cs.animationTimingFunction};
  d.remove();
  const el=document.querySelector('.overlay-menu')||null;
  const w=document.querySelector('.working-card'); const cw=w?getComputedStyle(w):null;
  const st=document.querySelector('.activity-panel');
  return {...r, spring:getComputedStyle(document.documentElement).getPropertyValue('--spring').trim().slice(0,60)};
}));
// 2. open a menu and read animation-name
await p.evaluate(()=>document.querySelector('[data-action="open-menu"]').click());
await p.waitForTimeout(200);
console.log('menu anim', await p.evaluate(()=>{const m=document.querySelector('.overlay-menu');const cs=getComputedStyle(m);return {name:cs.animationName,dur:cs.animationDuration,ease:cs.animationTimingFunction.slice(0,40),fill:cs.animationFillMode};}));
await p.evaluate(()=>document.body.click()); await p.waitForTimeout(200);
// 3. toast animation
await p.evaluate(()=>{const b=document.querySelector('[data-action="copy-message"]'); if(b)b.click();});
await p.waitForTimeout(150);
console.log('toast anim', await p.evaluate(()=>{const m=document.querySelector('.toast');if(!m)return null;const cs=getComputedStyle(m);return {name:cs.animationName,dur:cs.animationDuration,fill:cs.animationFillMode};}));
await p.waitForTimeout(3000);
// 4. grid rows of chat-stage children
console.log('chat-stage children', await p.evaluate(()=>[...document.querySelector('.chat-stage').children].map(c=>({cls:c.className.slice(0,40),row:getComputedStyle(c).gridRow, pos:getComputedStyle(c).position}))));
// 5. decision variants family 6
await p.setViewportSize({width:700,height:850}); await p.waitForTimeout(200);
const out={};
for(let v=0;v<8;v++){
  await p.evaluate(v=>{window.PM56_DEMO.setVariant(6,v);window.PM56_DEMO.openQuestionnaire();},v);
  await p.waitForTimeout(120);
  out[v]=await p.evaluate(()=>{const h=document.querySelector('.decision-host');const e=document.querySelector('.decision-evidence');
    return {dv:h?.dataset.variant, ev:e?getComputedStyle(e).display:'(none-el)'};});
}
console.log('narrow700', JSON.stringify(out));
await p.setViewportSize({width:1440,height:900}); await p.waitForTimeout(200);
const out2={};
for(let v=0;v<8;v++){ await p.evaluate(v=>{window.PM56_DEMO.setVariant(6,v);window.PM56_DEMO.openQuestionnaire();},v); await p.waitForTimeout(120);
  out2[v]=await p.evaluate(()=>{const e=document.querySelector('.decision-evidence');return e?getComputedStyle(e).display:'(none-el)';}); }
console.log('wide1440', JSON.stringify(out2));
// 6. very wide: decision-surface width
await p.setViewportSize({width:2200,height:900}); await p.waitForTimeout(300);
console.log('surf@2200', await p.evaluate(()=>{const s=document.querySelector('.decision-surface');return s?{maxW:getComputedStyle(s).maxWidth,w:s.getBoundingClientRect().width}:null;}));
await b.close();
