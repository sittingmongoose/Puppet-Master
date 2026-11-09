// The all-screen walk enters Welcome asleep. Its own first speech begins only after a real arrival,
// so cover that separate flow explicitly, with positive speech coverage and the same strict1px bound.
import fs from 'node:fs';
import path from 'node:path';
import { installSampler } from './pip-bubble-string-anchors.check.mjs';

const LOOKS=['basic','friendly','retro','glass','nier'].flatMap(f=>[`${f}-light`,`${f}-dark`]);
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
export default async function(t) {
 const out=[];
 for(const mode of t.app.surfaces()) for(const look of String(t.args.looks||LOOKS.join(',')).split(',')) {
  const f=await t.app.open({onboarding:true,query:'o55=screen=welcome',sandbox:mode==='sandbox'});
  await f.waitForFunction(()=>!!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.gHead);
  await t.emulate({reducedMotion:t.args.motion==='reduce'?'reduce':'no-preference'});
  await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));
  await f.evaluate(()=>document.fonts.ready);await f.waitForTimeout(1500);
  const expected=await f.evaluate(()=>{const st=document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;return {asleep:!!st.sleepZ,line:st.spec.wakeSay};});
  await t.check(`${mode} ${look}: Welcome starts asleep with its own line`,expected.asleep&&!!expected.line,JSON.stringify(expected));
  await f.evaluate(installSampler,!!t.args.counter);
  await f.evaluate(base=>{__qbs.frames=[];__qbs.seq=base;__qbs.on=true;},out.length*10000);
  t.mark(`${mode} ${look} Welcome real arrival`);
  await t.page.mouse.move(400,350);await t.page.mouse.move(1000,550,{steps:16});
  const awake=await f.waitForFunction(()=>!document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.sleepZ,null,{timeout:6500}).then(()=>true,()=>false);
  await f.waitForTimeout(4500);
  const frames=await f.evaluate(()=>{__qbs.on=false;__qbs.cells?.forEach(e=>{e.style.background='#808080';});return __qbs.frames;});
  out.push({mode,look,expected,frames});fs.writeFileSync(path.join(t.run.dir,'welcome-bubble.json'),JSON.stringify(out));
  const shown=frames.filter(x=>!x.none&&x.screen==='welcome'&&x.bub.shown&&x.bub.text.includes(expected.line));
  await t.check(`${mode} ${look}: real arrival paints Welcome's own speech`,awake&&shown.length>=30,`${shown.length} frames, awake ${awake}`);
  const groups=[];let current;
  for(const x of shown) {
   const key=[x.dn,x.layout,x.bub.text].join('|');
   if(!current||current.key!==key){current={key,rows:[]};groups.push(current);}current.rows.push(x);
  }
  let worst=0,first=0;
  for(const g of groups) {
   const rs=g.rows,rel=rs.map(x=>{const k=x.fam==='nier'?1:x.mapK[0];return (x.fam==='nier'?x.bub.fixed:x.bub.rel).map(v=>v/k);});
   const tr=rs.map(x=>x.fam==='nier'?x.bub.fixed:x.bub.tr.map((v,i)=>(v-x.mapK[i+1])/x.mapK[0]));
   const tail=rel.slice(-20),tt=tr.slice(-20),at=[0,1].map(i=>median(tail.map(q=>q[i]))),pin=[0,1].map(i=>median(tt.map(q=>q[i])));
   const k=rs[0].fam==='nier'?1:median(rs.slice(-20).map(x=>x.mapK[0]));
   const ds=rel.map((r,j)=>Math.max(...[0,1].map(i=>Math.min(Math.abs(r[i]-at[i]),Math.abs(tr[j][i]-pin[i]))))*k);
   worst=Math.max(worst,...ds);first=Math.max(first,ds[0]);
  }
  await t.check(`${mode} ${look}: first awake speech and all later frames stay within1px`,shown.length>=30&&first<=1&&worst<=1,`first ${first.toFixed(3)}px, worst ${worst.toFixed(3)}px; ${groups.length} episodes`);
  await t.app.resetLayout(t);
 }
}
