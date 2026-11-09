// K18 scoped diagnostic: original product assertions unchanged; only crop measurement uses drawn shapes.
import {drawnShapeBounds} from '../helpers/drawn-shape-bounds.mjs';
import {tests} from '../checks/retro-stage-fit.check.mjs';
import fs from 'node:fs';
import path from 'node:path';
function install(){
 if(window.__cropProbe)return;
 const S=window.__cropProbe={frames:[],seq:0,on:true};
 const tag=document.createElement('i');tag.style.cssText='position:fixed;left:0;top:0;width:168px;height:8px;contain:strict;z-index:2147483647;pointer-events:none';
 S.cells=Array.from({length:42},(_,i)=>{const e=document.createElement('b');e.style.cssText=`position:absolute;left:${i*4}px;top:0;width:4px;height:8px;background:#808080`;tag.append(e);return e;});document.documentElement.append(tag);
 const clock=document.createElement('i');clock.style.cssText='position:fixed;left:-10px;top:-10px;width:1px;height:1px;contain:strict;pointer-events:none;opacity:0';document.documentElement.append(clock);let w=1;
 const R=e=>{const r=e.getBoundingClientRect();return[r.left,r.top,r.right,r.bottom];};
 new ResizeObserver(()=>{
  if(!S.on)return;const st=document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;if(!st?.gHead||!st.gCtl)return;
  const c=R(st.screen);c[0]=Math.max(0,c[0]);c[1]=Math.max(0,c[1]);c[2]=Math.min(innerWidth,c[2]);c[3]=Math.min(innerHeight,c[3]);
  for(let e=st.screen.parentElement;e;e=e.parentElement){const cs=getComputedStyle(e),r=R(e);if(/hidden|clip|auto|scroll/.test(cs.overflowX)){c[0]=Math.max(c[0],r[0]);c[2]=Math.min(c[2],r[2]);}if(/hidden|clip|auto|scroll/.test(cs.overflowY)){c[1]=Math.max(c[1],r[1]);c[3]=Math.min(c[3],r[3]);}}
  const root=O55.S.root,css=getComputedStyle(root),head=R(st.gHead),hand=R(st.gCtl),seq=++S.seq;
  S.frames.push({paintedHead:window.__k18Bounds?__k18Bounds(st.gHead):null,paintedHand:window.__k18Bounds?__k18Bounds(st.gCtl):null,forced:S.forceEffect||null,judging:S.judging||0,seq,t:performance.now(),screen:O55.S.sess.screen,theme:st.theme,layout:st.layoutName,crop:c,head,hand,visible:!root.hidden&&css.visibility!=='hidden'&&+css.opacity>.05,pose:{C:{...st.ps.C},Ct:{...st.ps.Ct},th:st.ps.th,tilt:st.ps.tilt,phi:st.ps.phi},render:st.renderN});
  const bits=[1,0];for(let i=0;i<20;i++)bits.push((seq>>i)&1);for(let i=0;i<20;i++)bits.push(1-((seq>>i)&1));bits.forEach((v,i)=>S.cells[i].style.background=v?'#fff':'#000');
 }).observe(clock);
 function tick(){if(S.on){w=w===1?2:1;clock.style.width=w+'px';requestAnimationFrame(tick);}}requestAnimationFrame(tick);
}
export default async function(t){
 if(String(t.args.sandbox)!=='0'||t.args.looks!=='retro-light'||t.args.screens!=='s-confirm'||t.args.sizes!=='1280x500')throw Error('K18 diagnostic requires sandbox=0 looks=retro-light screens=s-confirm sizes=1280x500');

 const captures=[];const viewport=t.viewport.bind(t),open=t.app.open.bind(t.app);
 async function collect(){for(const f of t.page.frames()){try{const data=await f.evaluate(()=>{const S=window.__cropProbe;if(!S)return null;S.on=false;S.cells.forEach(e=>e.style.background='#808080');return {frames:S.frames,measurements:window.__k18Measurements||[]};});if(data?.frames?.length){const el=await f.frameElement().catch(()=>null),frameBox=el&&await el.boundingBox();captures.push({frameBox,frames:data.frames,measurements:data.measurements});}}catch{}}}
 t.app.open=async(...a)=>{const f=await open(...a);await f.evaluate(install);
 const fixture=await f.evaluate(source=>{
  const bounds=(0,eval)('('+source+')'),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width','200');svg.setAttribute('height','100');svg.style.cssText='position:fixed;left:0;top:0;pointer-events:none';
  const group=(tag,attrs,transform='')=>{const g=document.createElementNS(ns,'g'),e=document.createElementNS(ns,tag);if(transform)g.setAttribute('transform',transform);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);g.append(e);svg.append(g);return g;};
  const circle=group('circle',{cx:0,cy:0,r:10,fill:'#000'},'translate(115 50) rotate(45)'),outside=group('rect',{x:101.9,y:20,width:20,height:20,fill:'#000'}),within=group('rect',{x:102.1,y:20,width:20,height:20,fill:'#000'}),stroke=group('line',{x1:102,y1:10,x2:102,y2:30,fill:'none',stroke:'#000','stroke-width':1,'stroke-linejoin':'round'});document.documentElement.append(svg);
  try{return{rotatedBoxOutside:103-circle.getBoundingClientRect().left,rotatedInkOutside:103-bounds(circle).l,trueClipOutside:103-bounds(outside).l,withinOutside:103-bounds(within).l,strokeOutside:103-bounds(stroke).l};}finally{svg.remove();}
 },drawnShapeBounds.toString());
 await t.check('K18 fixture: rotated empty corner exceeds1px',fixture.rotatedBoxOutside>1,JSON.stringify(fixture),{hard:true});
 await t.check('K18 fixture: painted circle remains inside',fixture.rotatedInkOutside<=0,JSON.stringify(fixture),{hard:true});
 await t.check('K18 fixture: real1.1px clip is rejected',fixture.trueClipOutside>1,JSON.stringify(fixture),{hard:true});
 await t.check('K18 fixture: real0.9px clip stays within1px',fixture.withinOutside<=1,JSON.stringify(fixture),{hard:true});
 await t.check('K18 fixture: stroke-only clip is rejected',fixture.strokeOutside>1,JSON.stringify(fixture),{hard:true});
if(!f.__cropEval){const evaluate=f.evaluate.bind(f);f.__cropEval=true;f.evaluate=async(code,...args)=>{const sample=typeof code==='string'&&code.includes('const worst = { pip:');if(!sample)return evaluate(code,...args);await evaluate(source=>{window.__k18Bounds=(0,eval)('('+source+')');const st=O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));__k18Bounds(st.gHead);__k18Bounds(st.gCtl);window.__k18Measurements=[];},drawnShapeBounds.toString());if(code.split('out(pip, c)').length!==2)throw Error('Expected exactly one original crop measurement');code=code.replace('out(pip, c)',`(()=>{const h=__k18Bounds(st.gHead),a=__k18Bounds(st.gCtl),paint={l:Math.min(h.l,a.l),t:Math.min(h.t,a.t),r:Math.max(h.r,a.r),b:Math.max(h.b,a.b)};__k18Measurements.push({seq:__cropProbe.seq,raw:pip,paint,crop:c,outside:out(paint,c)});return out(paint,c);})()`);await evaluate(async()=>{if(O55.S.sess.screen!=='s-confirm')return;const st=O55.pipStage.of(O55.S.root.querySelector('.o55-stage')),start=performance.now();while(performance.now()-start<14000){const p=st.ps;if(p.C.x-p.Ct.x < -2.7&&p.C.vx < -2&&Math.abs(p.th)<.02&&Math.abs(p.tiltv)<.1)return;await new Promise(requestAnimationFrame);}throw Error('Natural left-sway phase not reached');});await evaluate(()=>{__cropProbe.judging=(__cropProbe.sampleN||0)+1;__cropProbe.sampleN=__cropProbe.judging;});await evaluate(()=>{if(O55.S.sess.screen!=='s-confirm')return;setTimeout(()=>{const st=O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));const random=Math.random;const values=[.5,.75,.1];const before={thv:st.ps.thv,tiltv:st.ps.tiltv};st.idleNext=st.t-.001;st.busyT=st.t-3.6;let calls=0;try{Math.random=()=>values[calls++]??.1;st.life(0);}finally{Math.random=random;}__cropProbe.forceEffect={before,after:{thv:st.ps.thv,tiltv:st.ps.tiltv},calls,owner:'life(0), natural left idle swing, phase250ms'};},250);});try{return await evaluate(code,...args);}finally{await evaluate(async()=>{if(O55.S.sess.screen!=='s-confirm')return;const st=O55.pipStage.of(O55.S.root.querySelector('.o55-stage')),start=performance.now();while(performance.now()-start<14000){const p=st.ps;if(p.C.x-p.Ct.x < -2.7&&p.C.vx < -2&&Math.abs(p.th)<.02&&Math.abs(p.tiltv)<.1)return;await new Promise(requestAnimationFrame);}throw Error('Natural left-sway phase not reached');});await evaluate(()=>{__cropProbe.judging=0;});}};}return f;};
 t.viewport=async(...a)=>{await collect();return viewport(...a);};
 try{await tests['retro props every screen normal'](t);}finally{await collect();fs.writeFileSync(path.join(t.run.dir,'crop-probe.json'),JSON.stringify(captures));t.viewport=viewport;t.app.open=open;}
}
