// A speech reservation must not push Creating's stack above the visible pane.
// Keep first speech placement, actual resting paint and assigned art scale in one capture.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { installSampler } from './pip-bubble-string-anchors.check.mjs';

const LOOKS=['basic','friendly','retro','glass','nier'].flatMap(f=>[`${f}-light`,`${f}-dark`]);
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
export default async function(t) {
 for(const mode of t.app.surfaces()) for(const look of String(t.args.looks||LOOKS.join(',')).split(',')) {
  if(t.recording){await t.viewport();await t.goto('about:blank');}
  const size=String(t.args.size||'740x768').split('x').map(Number);await t.viewport(...size);
  const f=await t.app.open({onboarding:true,query:'o55=screen=welcome',sandbox:mode==='sandbox'});
  await f.waitForFunction(()=>!!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.gHead);
  await t.emulate({reducedMotion:t.args.motion==='reduce'?'reduce':'no-preference'});
  await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));
  await f.waitForFunction(l=>document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.theme===l&&!O55.S.vt&&!document.documentElement.hasAttribute('data-o55-vt'),look);
  await f.evaluate(()=>document.fonts.ready);await f.waitForTimeout(1200);
  await f.evaluate(installSampler,!!t.args.counter);
  await f.evaluate(()=>{
   window.__ground=[];const dot=document.createElement('i');dot.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;contain:strict';document.body.append(dot);
   const rect=e=>{const r=e.getBoundingClientRect();return[r.left,r.top,r.right,r.bottom];};
   new ResizeObserver(()=>{
    if(!__qbs.on)return;const st=document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;if(!st)return;
    const crop=rect(st.screen);crop[0]=Math.max(crop[0],0);crop[1]=Math.max(crop[1],0);crop[2]=Math.min(crop[2],innerWidth);crop[3]=Math.min(crop[3],innerHeight);
    for(let e=st.screen.parentElement;e;e=e.parentElement){const cs=getComputedStyle(e),r=rect(e);if(/hidden|clip|auto|scroll/.test(cs.overflowX)){crop[0]=Math.max(crop[0],r[0]);crop[2]=Math.min(crop[2],r[2]);}if(/hidden|clip|auto|scroll/.test(cs.overflowY)){crop[1]=Math.max(crop[1],r[1]);crop[3]=Math.min(crop[3],r[3]);}}
    const props=[...st.props.values()].filter(p=>p.spec.stack!=null&&p.state!=='out').map(p=>{
     const tg=st.propTarget(p),m=p.el.parentNode.getCTM().inverse().multiply(p.el.getCTM());
     return{id:p.id||p.spec.id,stack:p.spec.stack,box:rect(p.el),landed:!!p.landed,settled:!!p.settled,op:p.op,ax:p.ax,len:p.len,target:tg,scale:Math.hypot(m.a,m.b),assigned:(p.spec.scale||1)*st.L.propScale,bb:p.bb};
    });
    __ground.push({seq:__qbs.seq,t:performance.now(),screen:O55.S.sess.screen,crop,props,theme:st.theme,plan:st.stackFit(),layout:st.layoutName,vis:st.vis,keepOff:st.keepOff,stack:st.L.stack,map:st.map});
   }).observe(dot);
   let w=1;const tick=()=>{if(__qbs.on){w=w===1?2:1;dot.style.width=w+'px';}requestAnimationFrame(tick);};requestAnimationFrame(tick);
   __qbs.frames=[];__qbs.seq=0;__qbs.on=true;
  });
  const label=`${mode} ${look} ${size.join('x')} Creating`;t.mark(label);
  await f.evaluate(()=>O55.ui.open({fresh:true,screen:'creating'}));
  const r=await f.evaluate(()=>{const r=O55.S.root.querySelector('.o55-stage').getBoundingClientRect();return{x:r.left+r.width*.3,y:r.top+r.height*.5};});
  const fe=await f.frameElement().catch(()=>null),off=fe&&await fe.boundingBox()||{x:0,y:0};
  await t.page.mouse.move(off.x+r.x,off.y+r.y);await t.page.mouse.move(off.x+r.x+40,off.y+r.y+2,{steps:8});
  await f.waitForTimeout(Number(t.args.secs||9)*1000);
  const capture=await f.evaluate(()=>{__qbs.on=false;__qbs.cells?.forEach(e=>e.style.background='#808080');return{ground:__ground,frames:__qbs.frames};});
  fs.appendFileSync(path.join(t.run.dir,'ground-frames.jsonl.gz'),zlib.gzipSync(JSON.stringify({mode,look,size,...capture})+'\n'));
  await t.check(`${label}: requested look stays applied`,capture.ground.some(r=>r.screen==='creating')&&capture.ground.filter(r=>r.screen==='creating').every(r=>r.theme===look),'Creating must retain its requested onboarding look',{hard:true});
  const rests=capture.ground.flatMap(r=>r.screen==='creating'?r.props.filter(p=>p.op>.95&&p.landed&&p.settled&&Math.abs(p.ax-p.target.ax)<2.51&&Math.abs(p.len-p.target.len)<2.51).map(p=>({p,crop:r.crop,plan:r.plan})):[]);
  const worst=Math.max(0,...rests.map(({p,crop:c})=>Math.max(c[0]-p.box[0],c[1]-p.box[1],p.box[2]-c[2],p.box[3]-c[3])));
  await t.check(`${label}: positive resting stack coverage`,rests.length>=30,`${rests.length} samples`,{hard:true});
  await t.check(`${label}: every resting block stays inside the painted crop`,worst<=1,`${worst.toFixed(3)}px outside; ${JSON.stringify(rests.find(({p,crop:c})=>Math.max(c[0]-p.box[0],c[1]-p.box[1],p.box[2]-c[2],p.box[3]-c[3])>1)||rests.at(-1))}`);
  await t.check(`${label}: ground art keeps its existing .45 scale floor`,rests.every(({p})=>p.scale/p.assigned+.005/p.assigned+1e-6>=.45),JSON.stringify(rests.at(-1)));
  const entries=new Map();
  for(const r of capture.ground) if(r.screen==='creating') for(const p of r.props) if(p.op>.02&&!p.landed){if(!entries.has(p.id))entries.set(p.id,[]);entries.get(p.id).push(p);}
  const travel=[...entries].map(([id,ps])=>({id,frames:ps.length,actual:Math.max(...ps.map(p=>p.ax))-Math.min(...ps.map(p=>p.ax)),target:Math.max(...ps.map(p=>p.target.ax))-Math.min(...ps.map(p=>p.target.ax))}));
  await t.check(`${label}: each entering block keeps its top suspension column`,(t.args.motion==='reduce'||travel.length>0)&&travel.every(r=>r.actual<=.05&&r.target<=.05),JSON.stringify(travel));
  const groups=[];let group;
  for(const r of capture.frames){const key=r.screen==='creating'&&r.bub?.shown?r.bub.text:null;if(!key){group=null;continue;}if(!group||group.key!==key){group={key,rows:[]};groups.push(group);}group.rows.push(r);}
  let first=0,worstBubble=0;
  for(const g of groups){const rows=g.rows,rel=rows.map(r=>r.fam==='nier'?r.bub.fixed:r.bub.rel),tr=rows.map(r=>r.fam==='nier'?r.bub.fixed:r.bub.tr),at=[0,1].map(i=>median(rel.slice(-20).map(q=>q[i]))),pin=[0,1].map(i=>median(tr.slice(-20).map(q=>q[i])));const ds=rel.map((q,j)=>Math.max(...[0,1].map(i=>Math.min(Math.abs(q[i]-at[i]),Math.abs(tr[j][i]-pin[i])))));first=Math.max(first,ds[0]);worstBubble=Math.max(worstBubble,...ds);}
  await t.check(`${label}: first speech and every later placement stay within1px`,groups.length>0&&first<=1&&worstBubble<=1,`first ${first.toFixed(3)}px, worst ${worstBubble.toFixed(3)}px; ${groups.length} full lines`);
  await t.app.resetLayout(t);
 }
}
