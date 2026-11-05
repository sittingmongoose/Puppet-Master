// FO-76: a fit measured while Chat is hidden must not survive its reveal.
import pod from './pod-clearance.check.mjs';
import { LOOKS } from '../browser-check.config.mjs';
export default async function(t) {
  t.args.width=1512; t.args.only='query';
  await pod(t);
  const f=t.root;
  await t.viewport(1920,1100);
  // No intervening render/reveal: retain the exact narrow-return history
  // that made kit2f's sizing signature reuse the smaller generated text.
  for(const width of [720,560,400,560,660,665,680,720]) {
    await f.evaluate(w=>PMW.chatCol.setWidth(w),width);
    await t.settle();
    await f.waitForTimeout(500);
    const fit=await readFit(f);
    await t.check(`activity narrow return ${width}`,fit.selected==='query'&&fit.pinned&&
      Math.abs(fit.chat-width-fit.history)<=1&&fit.scroll<=fit.width+1&&
      (fit.available>=fit.need+8 ? !fit.compact&&fit.labels : fit.available+0.5<fit.need ? fit.compact&&!fit.labels : true),JSON.stringify(fit));
  }
  for(const width of [720,560,400,560,660,665,680,800,600,720]) {
    await f.evaluate(w=>PMW.chatCol.setWidth(w),width);
    await t.settle();
    await f.waitForTimeout(500);
    for(const phase of ['before','after']) {
      if(phase==='after') {
        await f.evaluate(()=>PMW.chatCol.setVisible(false));
        await f.waitForFunction(()=>document.querySelector('#chatPanel').getBoundingClientRect().width===0);
        await f.evaluate(()=>{PM56_DEMO.setVariant(3,1);PM56_DEMO.setVariant(3,0);PMW.chatCol.setVisible(true);});
        await t.settle();
        await f.waitForTimeout(1500);
      }
      const fit=await readFit(f);
      t.log(JSON.stringify({columnWidth:width,phase,...fit}));
      await t.check(`activity labels follow fit ${width} ${phase}`,fit.selected==='query'&&fit.pinned&&(width===400 ? fit.history>0&&fit.history<=320 : Math.abs(fit.history-320)<=1)&&Math.abs(fit.chat-width-fit.history)<=1&&fit.scroll<=fit.width+1&&
        (fit.available>=fit.need+8 ? !fit.compact&&fit.labels : fit.available+0.5<fit.need ? fit.compact&&!fit.labels : true),JSON.stringify(fit));
    }
  }

  // Cross the pseudo-content boundary in every look, from both directions.
  for(const look of t.args.targeted ? [] : LOOKS) {
    await t.app.look(look);
    for(const width of [800,400,560,660,720,800]) {
      await f.evaluate(w=>PMW.chatCol.setWidth(w),width);
      await t.settle();
      const fit=await readFit(f);
      await t.check(`live activity fit ${look} ${width}`,fit.scroll<=fit.width+1&&
        (fit.available>=fit.need+8 ? !fit.compact&&fit.labels : fit.available+0.5<fit.need ? fit.compact&&!fit.labels : true),JSON.stringify(fit));
    }
    // Probe near the measured threshold from each direction. Observe tier
    // mutations for 60 frames after settling; a self-induced resize loop fails.
    const fit=await readFit(f);
    const edge=Math.ceil(800+fit.need-fit.available);
    for(const width of [edge+12,edge+2,edge-2,edge+2,edge+12]) {
      await f.evaluate(w=>PMW.chatCol.setWidth(w),width);
      await t.settle();
      const hold=await f.evaluate(async()=>{
        const wrap=document.querySelector('#pmRoot .activity-wrap, #pmRoot .pm56-activity-wrap');
        const tier=()=>wrap.classList.contains('is-ab-icon-only')?2:wrap.classList.contains('is-ab-compact')?1:0;
        const initial=tier(); let changes=0,previous=initial;
        const mo=new MutationObserver(()=>{const next=tier();if(next!==previous)changes++;previous=next;});
        mo.observe(wrap,{attributes:true,attributeFilter:['class']});
        for(let i=0;i<60;i++) await new Promise(requestAnimationFrame);
        mo.disconnect(); return {initial,final:tier(),changes};
      });
      await t.check(`activity threshold holds ${look} ${width}`,hold.changes===0,JSON.stringify(hold));
    }
  }
  await t.app.look('nier-dark');

  await t.viewport(1512,982);
  await f.evaluate(()=>PMW.chatCol.setWidth(560));
  await t.settle();
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
      return {selected:PM56_DEMO.getState().selectedThread,history:document.querySelector('.history-flyout')?.getBoundingClientRect().width,pinned:document.body.dataset.phDrawer==='pinned',chat:document.querySelector('#chatPanel').getBoundingClientRect().width,width:bar.clientWidth,scroll:bar.scrollWidth,wrap:wrap.clientWidth,classes:wrap.className,cache:window.__abMeasure};
    });
    results.push(r); t.log(JSON.stringify(r));
    if(r.scroll-r.width>1) await t.shot('hidden-fit-'+i,'Activity overflow after Chat is revealed, native window');
  }
  await t.shot('activity-visible-final','Activity strip after six hidden-render/reveal cycles');
  await t.check('activity fit survives hidden rendering',results.length===6&&results.every(r=>r.selected==='query'&&r.pinned&&Math.abs(r.history-320)<=1&&Math.abs(r.chat-880)<=1&&r.scroll-r.width<=1),JSON.stringify(results));
}

// Measure the full tier on a detached-from-flow clone in the same hosted
// ancestry; never change the live strip's classes to test its expected tier.
async function readFit(f) {
  return f.evaluate(()=>{
    const bar=document.querySelector('#pmRoot .activity-bar, #pmRoot .pm56-activity-bar');
    const wrap=bar.parentElement, cs=getComputedStyle(wrap);
    const clone=wrap.cloneNode(true);
    clone.classList.remove('is-ab-compact','is-ab-icon-only');
    Object.assign(clone.style,{position:'absolute',visibility:'hidden',width:wrap.clientWidth+'px'});
    wrap.parentElement.append(clone);
    const full=clone.querySelector('.activity-bar, .pm56-activity-bar');
    const need=full.scrollWidth + parseFloat(getComputedStyle(full).borderLeftWidth) + parseFloat(getComputedStyle(full).borderRightWidth);
    clone.remove();
    return {available:wrap.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),need,
      compact:wrap.classList.contains('is-ab-compact'),labels:[...bar.querySelectorAll('.label')].every(e=>getComputedStyle(e).display!=='none'),
      width:bar.clientWidth,scroll:bar.scrollWidth,chat:document.querySelector('#chatPanel').getBoundingClientRect().width,
      pinned:document.body.dataset.phDrawer==='pinned',history:document.querySelector('.history-flyout')?.getBoundingClientRect().width,selected:PM56_DEMO.getState().selectedThread};
  });
}
