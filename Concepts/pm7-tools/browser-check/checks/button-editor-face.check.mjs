import {writeFile} from 'node:fs/promises';
export default async function(t){
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>window.O55?.S?.open);await t.emulate({reducedMotion:'no-preference'});
 await f.evaluate(()=>{O55.S.draft().project_name='Press example';window.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();},true);});
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0},records=[];
 for(const motion of (t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'])) {
 await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
 for(const look of (t.args.look?String(t.args.look).split(','):['friendly-dark','friendly-light'])){
  await t.page.mouse.move(2,2);await f.evaluate(v=>{O55.nierLook.closePanel({silent:true});O55.ui.applyLook(...v);},look.split('-'));await f.waitForTimeout(1800);
  await f.evaluate(m=>document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full'),motion);const actual=await f.evaluate(()=>({theme:document.documentElement.dataset.theme,nier:!!(window.PM_NIER&&PM_NIER.on()),family:O55.S.root.dataset.family,mode:O55.S.root.dataset.mode}));await t.check('Film named look applies '+look,actual.mode===look.split('-')[1]&&(look.startsWith('nier')?actual.nier:!actual.nier&&actual.theme===look),JSON.stringify(actual));
  for(const [screen,kinds] of (look.startsWith('friendly')?[['nier-editor',['editor-done','editor-on']]]:[])){
   await f.evaluate(s=>{O55.ui.go(s==='nier-editor'?'look':s,{noHistory:true});if(s==='nier-editor')O55.nierLook.adjust();},screen);await f.waitForTimeout(1800);
   for(const kind of kinds){
    const sel=kind.startsWith('editor-')?'#pm-o55-onboarding .o55-nierpanel '+(kind==='editor-done'?'[data-o55nc-done]':'[data-o55nc-on]'):'#pm-o55-onboarding .o55-layer:not(.o55-out) '+(kind==='card'?'.o55-card':kind==='tile'?'.o55-tile':kind==='segment'?'.o55-seg button[aria-checked="false"]':'.o55-btn.o55-'+kind+':not([aria-disabled="true"])');
    const c=f.locator(sel).first();await t.check(`film fixture ${look} ${kind}`,await c.count()>0);if(!await c.count())continue;await c.scrollIntoViewIfNeeded();
    for(let rep=0;rep<2;rep++){
     await t.page.mouse.move(2,2);await f.waitForTimeout(600);
     await c.evaluate(async e=>{getComputedStyle(e).transform;await Promise.all(e.getAnimations({subtree:true}).filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));});
     const b=await c.boundingBox(),r={x:Math.floor(b.x-10),y:Math.floor(b.y-10),width:Math.ceil(b.width+20),height:Math.ceil(b.height+20)},tag=`${look}-${motion}-${kind}-${rep}`;
     if(rep===0)await t.crop(tag+'-rest',r,'Resting native boundary, words and shadow; compare paired immutable builds at original resolution.');
     await t.mark('rest '+tag);await t.page.mouse.move(off.x+b.x+Math.min(7,b.width/4),off.y+b.y+b.height/2);await f.waitForTimeout(300);
     await t.mark('down '+tag);await t.page.mouse.down();await f.waitForTimeout(500);
     const held=await c.evaluate(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e),ks=e.firstElementChild&&getComputedStyle(e.firstElementChild);return {x:b.x,y:b.y,width:b.width,height:b.height,active:e.matches(':active'),transform:s.transform,scale:s.scale,translate:s.translate,kid:ks&&{transform:ks.transform,scale:ks.scale,translate:ks.translate}};});
     if(rep===0)await t.crop(tag+'-held',r,'Held native boundary and inner press feel. Film contains the transition and release.');
     await t.mark('up '+tag);await t.page.mouse.up();await f.waitForTimeout(650);await t.mark('end '+tag);
     records.push({look,motion,actual,screen,kind,rep,tag,rect:r,rest:b,held,offset:off});await t.check('Editor target stays stationary '+tag,Math.abs(held.x-b.x)<.01&&Math.abs(held.y-b.y)<.01&&Math.abs(held.width-b.width)<.01&&Math.abs(held.height-b.height)<.01);if(kind.startsWith('editor-'))await t.check('Friendly editor retains press cue '+tag,motion==='no-preference'?(held.kid&&held.kid.scale==='0.97'):(held.transform==='none'&&held.kid&&['none','1'].includes(held.kid.scale)),JSON.stringify(held));await t.check(`film actual active press ${tag}`,held.active);
    }
   }
  }
 }
 }
 await t.emulate({reducedMotion:'no-preference'});await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));
 if(t.args.dataOut)await writeFile(String(t.args.dataOut),JSON.stringify(records,null,2));
}
