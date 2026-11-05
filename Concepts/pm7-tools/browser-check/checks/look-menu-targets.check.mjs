// FO-75: no look-option pixel belongs to another control; help retains its original expanded target.
import { writeFile } from 'node:fs/promises';
import { LOOKS } from '../browser-check.config.mjs';
const menu='#pm-o55-onboarding .o55-lookmenu', option=':is(.o55-lookopt,.o55-lookmodes button)';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 await f.evaluate(()=>{window.__menuClicks=[];window.addEventListener('click',e=>{const b=e.target.closest?.('button');window.__menuClicks.push({id:b?.__menuId??'other',trusted:e.isTrusted});e.stopImmediatePropagation();e.preventDefault();},true);});
 const motions=t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'];
 for(const motion of motions) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of (t.args.look?String(t.args.look).split(','):LOOKS)) {
   await t.page.mouse.move(2,2);await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');O55.S.lookOpen=false;O55.ui.go('look',{noHistory:true});O55.ui.act('lookMenu');},motion);await f.waitForTimeout(1800);
   const scan=await f.evaluate(()=>{
    const root=document.querySelector('#pm-o55-onboarding .o55-lookmenu'),options=[...root.querySelectorAll(':is(.o55-lookopt,.o55-lookmodes button)')];let pixels=0,wrong=0;const examples=[];
    options.forEach((e,i)=>{e.__menuId=i;const b=e.getBoundingClientRect();
     for(let y=b.top+.5;y<b.bottom;y++)for(let x=b.left+.5;x<b.right;x++){
      pixels++;const hit=document.elementFromPoint(x,y)?.closest('button,input,select,textarea,[role="button"]');
      if(hit&&hit!==e&&!e.contains(hit)){wrong++;if(examples.length<12)examples.push({option:e.textContent.trim(),x,y,cover:hit.className});}
     }
    });
    const help=[...root.querySelectorAll('button.o55-tipq')].map(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e),p=getComputedStyle(e,'::before'),r={x:b.x+parseFloat(s.borderLeftWidth)+parseFloat(p.left),y:b.y+parseFloat(s.borderTopWidth)+parseFloat(p.top),w:parseFloat(p.width),h:parseFloat(p.height)};let owned=true;
     for(const [x,y] of [[r.x+1,r.y+1],[r.x+r.w-1,r.y+1],[r.x+1,r.y+r.h-1],[r.x+r.w-1,r.y+r.h-1],[r.x+1,r.y+r.h/2],[r.x+r.w-1,r.y+r.h/2],[r.x+r.w/2,r.y+1],[r.x+r.w/2,r.y+r.h-1]])owned=owned&&document.elementFromPoint(x,y)?.closest('button')===e;
     return {...r,owned};});return {count:options.length,pixels,wrong,examples,help};
   });
   const tag=`${look} ${motion}`;
   await t.check(`FO-75 every look-option pixel avoids other controls ${tag}`,scan.count>=7&&scan.wrong===0,JSON.stringify(scan));
   await t.check(`FO-75 help retains usable expanded target ${tag}`,scan.help.length>=6&&scan.help.every(x=>x.w>=26&&x.h>=26&&x.owned),JSON.stringify(scan.help));
   if(motion==='no-preference')await t.crop(`${look}-look-menu-rest`,f.locator(menu),'Transparent hit expansion changes without changing the resting menu.');
   const misses=[];
   for(let i=0;i<scan.count;i++) {
    const c=f.locator(menu+' '+option).nth(i),b=await c.boundingBox(),before=await f.evaluate(()=>window.__menuClicks.length);
    await t.page.mouse.move(b.x+b.width-1,b.y+b.height/2);await t.page.mouse.down();await f.waitForTimeout(350);await t.page.mouse.up();
    await f.waitForFunction(n=>window.__menuClicks.length>n,before,{timeout:1000}).catch(()=>{});
    const got=await f.evaluate(n=>window.__menuClicks.slice(n),before);if(got.length!==1||got[0].id!==i||!got[0].trusted)misses.push({i,got});
   }
   await t.check(`FO-75 held look-option right edge activates itself ${tag}`,!misses.length,JSON.stringify(misses));
  }
 }
 const proof=[];
 for(const screen of ['where','look','nas-find']) {
  await f.evaluate(s=>{O55.S.lookOpen=false;O55.ui.go(s,{noHistory:true});},screen);
  await f.waitForFunction(s=>!!document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) '+(s==='look'?'.o55-tile':'.o55-card')),screen);
  const row=await f.evaluate(screen=>{const layer=document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'),choice=layer?.querySelector('.o55-card,.o55-tile');return {screen,selector:'#pm-o55-onboarding .o55-lookmenu .o55-tipq::before',matchingOriginElements:document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-tipq').length,fixtureDOM:choice?.cloneNode(false).outerHTML||null,ancestors:choice?Array.from((function*(n){for(;n;n=n.parentElement)yield n;})(choice.parentElement)).map(n=>({tag:n.tagName,classes:n.className})):[]};},screen);
  proof.push(row);await t.check(`FO-75 scoped menu rule cannot match choice fixture ${screen}`,row.matchingOriginElements===0&&!!row.fixtureDOM,JSON.stringify(row));
 }
 if(t.args.scopeOut)await writeFile(String(t.args.scopeOut),JSON.stringify(proof,null,2));
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));await t.emulate({reducedMotion:'no-preference'});
}
