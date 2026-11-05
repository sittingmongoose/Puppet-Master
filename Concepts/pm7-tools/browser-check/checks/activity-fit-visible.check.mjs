// FO-76: a fit measured while Chat is hidden must not survive its reveal.
import pod from './pod-clearance.check.mjs';
export default async function(t) {
  t.args.width=1512; t.args.only='query';
  await pod(t);
  const f=t.root;
  const results=[];
  for(let i=0;i<6;i++) {
    await f.evaluate(()=>PMW.chatCol.setVisible(false));
    await f.waitForFunction(()=>document.querySelector('#chatPanel').getBoundingClientRect().width===0);
    await f.evaluate(()=>{PM56_DEMO.setVariant(3,1);PM56_DEMO.setVariant(3,0);});
    await f.evaluate(()=>PMW.chatCol.setVisible(true));
    await f.waitForTimeout(1500);
    const r=await f.evaluate(()=>{
      const bar=document.querySelector('#pmRoot .chat-float .activity-bar, #pmRoot .chat-float .pm56-activity-bar');
      const wrap=bar.parentElement;
      return {selected:PM56_DEMO.getState().selectedThread,width:bar.clientWidth,scroll:bar.scrollWidth,wrap:wrap.clientWidth,classes:wrap.className,cache:window.__abMeasure};
    });
    results.push(r); t.log(JSON.stringify(r));
    if(r.scroll-r.width>1) await t.shot('hidden-fit-'+i,'Activity overflow after Chat is revealed, native window');
  }
  await t.check('activity fit survives hidden rendering',results.length===6&&results.every(r=>r.selected==='query'&&r.scroll-r.width<=1),JSON.stringify(results));
}
