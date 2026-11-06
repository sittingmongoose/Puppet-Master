// Run the existing boundary check unchanged, retaining native event geometry if
// an outside click reaches a choice. Test telemetry only; no product hooks/events.
import original from '../checks/choice-hit-bounds.check.mjs';
import { writeFile } from 'node:fs/promises';
export default async function(t) {
 const open=t.app.open;let frame;
 t.app.open=async(...args)=>{
  frame=await open.apply(t.app,args);
  await frame.evaluate(()=>{
   const selector='.o55-pane > .o55-layer:not(.o55-out) :is(.o55-card,.o55-tile)';
   const boxes=()=>[...document.querySelectorAll(selector)].map(e=>{const r=e.getBoundingClientRect();return {arg:e.dataset.arg,x:r.x,y:r.y,w:r.width,h:r.height};});
   window.__hitProbe={recent:[],unexpected:[],rest:null};let trial='';
   Object.defineProperty(window,'__choiceTrial',{configurable:true,get:()=>trial,set:v=>{trial=v;window.__hitProbe.rest={trial:v,boxes:boxes(),screen:window.O55?.S?.sess?.screen,theme:document.documentElement.dataset.theme,transition:!!window.O55?.S?.vt};}});
   const record=(e,phase)=>{
    const p=window.__hitProbe,c=e.target.closest?.('.o55-card,.o55-tile');
    const row={phase,trial,x:e.clientX,y:e.clientY,trusted:e.isTrusted,target:e.target.tagName,arg:c?.dataset.arg||null,boxes:boxes(),transition:!!window.O55?.S?.vt};
    p.recent.push(row);if(p.recent.length>15)p.recent.shift();
    if(phase==='click'&&c&&trial!=='inside')p.unexpected.push({rest:p.rest,events:p.recent.slice(),ancestors:[c,c.parentElement,c.closest('.o55-layer'),c.closest('.o55-win')].filter(Boolean).map(n=>{const s=getComputedStyle(n);return {class:n.className,transform:s.transform,scale:s.scale,translate:s.translate};})});
   };
   for(const name of ['pointerdown','pointerup','click'])window.addEventListener(name,e=>record(e,name),true);
  });
  return frame;
 };
 try{await original(t);}
 finally{
  t.app.open=open;
  if(t.args.probeOut&&frame)await writeFile(String(t.args.probeOut),JSON.stringify(await frame.evaluate(()=>window.__hitProbe),null,2));
 }
}
