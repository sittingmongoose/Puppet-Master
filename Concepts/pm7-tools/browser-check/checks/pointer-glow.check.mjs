// FO-121: the pointer's circle is gone; the box edge still catches its proximity.
// Real painted pixels, with the recorder's own pointer marker hidden. No test-created hover targets.
// The circle was a pseudo-element fill, not a separate DOM node; check both readers as well as old overlay IDs.
// --set looks=a,b / places=shell,usage,chat,settings,onboarding limits diagnostics only; defaults cover all ten.
// --set standalone=1 checks the separately built chat. --set film=1 walks two looks for a before/after film.
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { LOOKS } from '../browser-check.config.mjs';

const list = (v, all) => v ? String(v).split(',') : all;
const pause = (f, ms = 650) => f.waitForTimeout(ms);
const png = async (t, clip) => decodePng(await t.unmarked(() => t.page.screenshot({ clip })));
const delta = (a, b, p) => Math.max(...[0, 1, 2].map(k => Math.abs(a.data[p * 4 + k] - b.data[p * 4 + k])));
const luma = (a, p) => .2126 * a.data[p * 4] + .7152 * a.data[p * 4 + 1] + .0722 * a.data[p * 4 + 2];

// A plain patch inside a real surface, with room for an 11..19 px annulus clear of text, art and box edges.
// A second point, on the SAME box but far from the patch, preserves its ordinary hover state in the reference frame.
async function ground(f, selectors) {
 return f.evaluate(selectors => {
  for (const sel of selectors) for (const [index,e] of [...document.querySelectorAll(sel)].entries()) {
   const b = e.getBoundingClientRect();
   if (b.width < 190 || b.height < 65 || b.left < 0 || b.top < 0 || b.bottom > innerHeight || b.right > innerWidth) continue;
   const obstacles = [];
   const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
   while (tw.nextNode()) if (tw.currentNode.textContent.trim()) {
    const r = document.createRange(); r.selectNodeContents(tw.currentNode);
    obstacles.push(...[...r.getClientRects()].filter(r => r.width && r.height));
   }
   for (const n of e.querySelectorAll('svg,canvas,img,input,textarea,button,[role="button"]')) obstacles.push(n.getBoundingClientRect());
   const clear = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    return hit && e.contains(hit) && !obstacles.some(r => r.width && r.height && x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24);
   };
   const ys=[b.top+b.height/2];for(let y=b.top+45;y<b.bottom-40;y+=12)ys.push(y);
   ys.sort((a,z)=>Math.abs(a-(b.top+b.height/2))-Math.abs(z-(b.top+b.height/2)));
   for (const y of ys) for (let x = b.right - 65; x > b.left + 60; x -= 12) {
    if (!clear(x, y)) continue;
    for (const fx of [b.left + 30, b.right - 30]) {
     const fy = Math.min(b.bottom - 25, Math.max(b.top + 25, y));
     const hit = document.elementFromPoint(fx, fy);
     if (Math.hypot(fx - x, fy - y) < 140 || !hit || !e.contains(hit)) continue;
     return { index, x: Math.round(x), y: Math.round(y), far: [fx, fy], selector: sel,
      box: { x:b.x,y:b.y,width:b.width,height:b.height }, kind: e.getAttribute('data-pmh-kind') };
    }
   }
  }
  return null;
 }, selectors);
}

async function circle(t, f, place, selectors) {
 const g = await ground(f, selectors);
 await t.check(`${place}: real plain ground found`, !!g, JSON.stringify(g), { hard: true });
 const target = f.locator(g.selector).nth(g.index);
 // Locator boxes include the sandbox frame's offset. Browser evaluation coordinates are local to the app.
 const outer = await target.boundingBox();
 const off = {x:outer.x-g.box.x,y:outer.y-g.box.y};
 const move = async ([x,y]) => { await t.page.mouse.move(x+off.x,y+off.y,{steps:8}); await pause(f); };
 const clip = {x:g.x+off.x-22,y:g.y+off.y-22,width:44,height:44};
 await move(g.far); const a = await png(t,clip); await pause(f,150); const quiet = await png(t,clip);
 await move([g.x,g.y]); const near = await png(t,clip);
 await move(g.far); const back = await png(t,clip);
 let total=0,stable=0,changed=0,sum=0,mx=0;
 for(let y=0;y<44;y++)for(let x=0;x<44;x++){
  const r=Math.hypot(x-22,y-22);if(r<11||r>19)continue;total++;
  const p=y*44+x;if(delta(a,quiet,p)>1||delta(a,back,p)>2)continue;
  stable++;const d=delta(quiet,near,p);sum+=d;mx=Math.max(mx,d);if(d>2)changed++;
 }
 const m={...g,total,stable,changed,share:changed/Math.max(1,stable),mean:sum/Math.max(1,stable),max:mx};
 t.log(`${place}: annulus ${JSON.stringify(m)}`);
 await t.check(`${place}: resting-pointer ring is clear of motion`,stable>=total*.95,JSON.stringify(m));
 await t.check(`${place}: no glow paint around resting pointer`,stable>0&&changed/stable<.02&&sum/stable<.6,JSON.stringify(m));
 const layers={overlays:await f.locator('#lg-shine,#pm8-spot,#pm8-spotlight').count(),reader:await target.evaluate(e=>{
  const p=getComputedStyle(e,e.matches('.pmu-card')?'::before':'::after');return {fieldReader:!!window.PMH&&PMH.resolve(e)===e&&['card','row','tile'].includes(PMH.kindOf(e)),background:p.backgroundColor,image:p.backgroundImage,mask:p.maskImage};
 })};
 await t.check(`${place}: no cursor-glow overlay element`,layers.overlays===0,JSON.stringify(layers));
 // Only PMH field readers had the circle. Other surfaces keep their existing hover materials.
 if(await f.evaluate(()=>!document.documentElement.hasAttribute('data-o55-nier')&&/^(basic|friendly|glass)-/.test(document.documentElement.dataset.theme||'')) && layers.reader.fieldReader) {
  const s=layers.reader;await t.check(`${place}: edge reader has no circle fill`,s.background==='rgba(0, 0, 0, 0)'&&s.image==='none',JSON.stringify(s));
 }
}

// Measure a real box edge before entry, inside and after retreat. The Usage plate has no magnet; the Project
// box returns to its rest rectangle before both outside samples. No test styling changes its response.
async function edge(t,f,look,selector='#panel-usage .pmu-card:not([data-head="band"])',place="Usage"){
 const c=f.locator(selector).first();
 await c.scrollIntoViewIfNeeded();const b=await c.boundingBox();
 const x=b.x,y=b.y+b.height*.6;
 const move=async(dx)=>{await t.page.mouse.move(x+dx,y,{steps:8});await pause(f);const q=await c.boundingBox();return png(t,{x:Math.round(q.x+1),y:Math.round(q.y+q.height*.6-14),width:10,height:28});};
 await move(10); // establishes the real scope, including the plate's neighbours
 const far=await move(-36),middle=await move(-12),near=await move(-2),inside=await move(9),back=await move(-36);
 const stats=(a,b)=>{let d=0,n=0,mx=0,energy=0;for(let p=0;p<a.data.length/4;p++){d+=luma(b,p)-luma(a,p);energy+=delta(a,b,p);if(delta(a,b,p)>2)n++;mx=Math.max(mx,delta(a,b,p));}return {rise:d/(a.data.length/4),energy:energy/(a.data.length/4),changed:n,max:mx};};
 const m={middle:stats(far,middle),near:stats(far,near),inside:stats(far,inside),back:stats(far,back)};
 t.log(`${look} ${place}: edge ${JSON.stringify(m)}`);
 if(/^(basic|friendly|glass)-/.test(look)){
  await t.check(`${look} ${place}: box edge brightens before entry`,m.near.energy>.08&&m.near.changed>=8,JSON.stringify(m));
  await t.check(`${look} ${place}: box edge strengthens as pointer approaches`,m.near.energy>m.middle.energy+.08,JSON.stringify(m));
  await t.check(`${look} ${place}: box edge remains lit inside`,m.inside.energy>.08&&m.inside.changed>=8,JSON.stringify(m));
  await t.check(`${look} ${place}: box edge falls back`,Math.abs(m.back.rise)<.5&&m.back.changed<=4,JSON.stringify(m));
 }else await t.check(`${look}: own hover form keeps no proximity circle`,true,'Retro Raise and NieR Lock-on have no proximity field by design');
}

async function film(t){
 const f=await t.app.open();
 // The recorder's pink ring could be confused with the removed glow. Use a plain arrow at CDP's real pointer
 // position, and hide the unrelated OS cursor. This witness is film-only, on both builds; no product paint changes.
 await f.evaluate(()=>{
  const style=document.createElement('style');style.id='fo121-film-cursor';style.textContent='html,body,body *{cursor:none!important}';document.head.append(style);
  const arrow=document.createElement('div');arrow.id='fo121-film-arrow';arrow.style.cssText='position:fixed;left:0;top:0;width:18px;height:24px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)';
  arrow.innerHTML='<svg width="18" height="24" viewBox="0 0 18 24"><path d="M1 1L1 19L5.8 14.8L9.3 22L12.5 20.5L9 13.4L15.5 13.3Z" fill="white" stroke="black" stroke-width="1.4"/></svg>';
  document.documentElement.append(arrow);window.__fo121Arrow=e=>{arrow.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;};addEventListener('pointermove',window.__fo121Arrow,{passive:true});
 });
 await t.unmarked(async()=>{
  for(const look of list(t.args.looks,['glass-dark','friendly-light'])){
   await t.app.look(look);await f.locator('#tab-projects').click();await pause(f,1600);
   await t.mark(look+' pointer over boxes');
   for(const c of (await f.locator('#panel-projects .pm6-proj-card').all()).slice(0,2)){
    const b=await c.boundingBox();if(!b)continue;
    for(const p of [[b.x-24,b.y+b.height*.5],[b.x+5,b.y+b.height*.5],[b.x+b.width*.55,b.y+b.height*.5],[b.x+b.width-8,b.y+b.height*.5]]){
     await t.page.mouse.move(...p,{steps:18});await pause(f,350);
    }
   }
   await t.mark(look+' Usage proximity');await f.locator('#tab-usage').click();await pause(f,1600);
   const b=await f.locator('#panel-usage .pmu-card').first().boundingBox();
   for(const dx of [-36,-2,9,-36]){await t.page.mouse.move(b.x+dx,b.y+b.height*.6,{steps:18});await pause(f,400);}
  }
 });
 await f.evaluate(()=>{removeEventListener('pointermove',window.__fo121Arrow);delete window.__fo121Arrow;document.getElementById('fo121-film-arrow')?.remove();document.getElementById('fo121-film-cursor')?.remove();});
}

export default async function(t){
 await t.emulate({reducedMotion:'no-preference'});
 if(t.args.film==='1')return film(t);
 const standalone=t.args.standalone==='1';
 for(const look of list(t.args.looks,LOOKS)){
  const f=standalone?await (async()=>{const u=t.args.page; if(t.app.sandboxed())await t.openInSandbox(u);else await t.goto(u);await t.until('standalone ready',()=>!!window.__PM56_BOOT_OK);return t.root;})():await t.app.open();
  if(standalone){await f.evaluate(k=>PM56_DEMO.setTheme(k),look);await pause(f,1800);}
  else {await t.app.look(look);await pause(f,1000);}
  await f.evaluate(()=>window.PM56_DEMO?.completeWorking());await pause(f,600);
  const places=list(t.args.places,standalone?['chat']:['shell','usage','chat','settings','onboarding']);
  for(const place of places)await t.step(`${look} ${place}`,async()=>{
   if(place==='shell'){await f.locator('#tab-projects').click();await pause(f,1200);await circle(t,f,place,['#panel-projects .pm6-proj-card']);await edge(t,f,look,'#panel-projects .pm6-proj-card','Project');}
   if(place==='usage'){await f.locator('#tab-usage').click();await pause(f,1400);await circle(t,f,place,['#panel-usage .pmu-card:not([data-head="band"])']);await edge(t,f,look);}
   if(place==='chat')await circle(t,f,place,['#pmRoot .transcript','.transcript']);
   if(place==='settings'){await f.locator('#tab-settings').click();await pause(f,1800);await t.app.look(look);await circle(t,f,place,['#pm-settings-root .main-scroll','#pm-settings-root main','#pm-settings-root .settings-main','#pm-settings-root']);}
   if(place==='onboarding'){await f.evaluate(()=>O55.studio.onboarding.screen('where','fresh'));await f.waitForFunction(()=>{const r=document.getElementById('pm-o55-onboarding');return r&&!r.hasAttribute('data-o55nw-cold')&&!r.hasAttribute('data-o55nw-go')&&!r.classList.contains('o55-opening')&&!r.querySelector('.o55-pane > .o55-layer.o55-out,.o55-pane > .o55-layer.o55-entering')&&!O55.S.vt;},null,{timeout:30000});await pause(f,300);await circle(t,f,place,['#pm-o55-onboarding .o55-card:not(.o55-card-parent)']);}
  });
 }
}
