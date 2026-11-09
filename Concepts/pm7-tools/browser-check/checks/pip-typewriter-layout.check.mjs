// QA-4: VT323's one-cell fi/ff/fl ligatures disappear when the typer's shown/hidden span boundary divides them.
// Real V5 opaque frames: ai-none191→199→191px, review237→244→237, r-done168→176→168; placement moves2.1–2.4px.
// Sweep every prefix on a clone with the real bubble's styles, then watch the real typer paint the same input.
import fs from 'node:fs';
import path from 'node:path';

export default async function(t) {
 const texts=["No AI yet? That's fine.",'Which folder? Pick one first.','Open that one first?','A different file or folder?'];
 const all=[];
 for(const mode of t.app.surfaces()) for(const look of String(t.args.looks||'retro-dark').split(',')) {
  const f=await t.app.open({onboarding:true,query:'o55=screen=name',sandbox:mode==='sandbox'});
  await f.waitForFunction(()=>!!document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.gHead);
  await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));
  await t.emulate({reducedMotion:'no-preference'});
  await f.waitForTimeout(4500);
  const result=await f.evaluate(async texts=>{
   const st=document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
   await document.fonts.ready;
   const copy=st.bubble.cloneNode(true);
   copy.classList.add('on','typing');
   Object.assign(copy.style,{left:'0',top:'-10000px',translate:'none',transform:'none',animation:'none',transition:'none',opacity:'0',pointerEvents:'none'});
   st.bubble.parentNode.appendChild(copy);
   try {
    const target=copy.querySelector('.pst-bt');target.innerHTML='<span class="pst-bt-on"></span><span class="pst-bt-off"></span>';
    return texts.map(text=>{
     target.firstChild.textContent=text;target.lastChild.textContent='';
     const final=[copy.offsetWidth,copy.offsetHeight],sizes=[];
     for(let i=0;i<=text.length;i++) {
      target.firstChild.textContent=text.slice(0,i);target.lastChild.textContent=text.slice(i);
      sizes.push({i,on:text.slice(0,i),off:text.slice(i),w:copy.offsetWidth,h:copy.offsetHeight});
     }
     return {text,final,sizes,font:getComputedStyle(copy).font,ligatures:getComputedStyle(copy).fontVariantLigatures};
    });
   } finally {copy.remove();}
  },texts);
  all.push({mode,look,prefixes:result,paint:[]});
  for(const r of result) {
   const bad=r.sizes.filter(q=>q.w!==r.final[0]||q.h!==r.final[1]);
   await t.check(`${mode} ${look} every prefix keeps the final line box: ${r.text}`,!bad.length,JSON.stringify({final:r.final,bad,font:r.font,ligatures:r.ligatures}));
  }
  for(const [index,text] of texts.entries()) {
   t.mark(`${mode} ${look} real typer: ${text}`);
   const frames=await f.evaluate(async ([text,counter,base])=>{
    const st=document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
    const rows=[];let seq=base;
    const tag=document.createElement('div');tag.style.cssText='position:fixed;left:0;top:0;width:168px;height:8px;z-index:2147483647;pointer-events:none';
    const cells=counter?Array.from({length:42},(_,i)=>{const el=document.createElement('i');el.style.cssText=`position:absolute;left:${i*4}px;top:0;width:4px;height:8px;background:#808080`;tag.appendChild(el);return el;}):[];
    if(counter)document.documentElement.appendChild(tag);
    const probe=document.createElement('div');probe.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none';document.body.appendChild(probe);
    let size=1,active=true;
    const ro=new ResizeObserver(()=>{
     const b=st.bubble,box=b.getBoundingClientRect(),paintSeq=++seq;
     rows.push({paintSeq,at:performance.now(),on:st.btext.firstChild?.textContent,off:st.btext.lastChild?.textContent,w:b.offsetWidth,h:b.offsetHeight,box:[box.x,box.y,box.width,box.height],tr:b.style.translate});
     const bits=[1,0];for(let i=0;i<20;i++)bits.push((paintSeq>>i)&1);for(let i=0;i<20;i++)bits.push(1-((paintSeq>>i)&1));cells.forEach((e,i)=>{e.style.background=bits[i]?'#fff':'#000';});
    });ro.observe(probe);
    st.sayNow(text,'idle');
    const until=performance.now()+Math.max(1800,st.sayMs+500);
    await new Promise(resolve=>{
     const tick=()=>{
      size=size===1?2:1;probe.style.width=size+'px';
      if(performance.now()<until)requestAnimationFrame(tick);else {active=false;resolve();}
     };requestAnimationFrame(tick);
    });ro.disconnect();probe.remove();tag.remove();return rows;
   },[text,!!t.args.counter,all.length*100000+index*10000]);
   all.at(-1).paint.push({text,frames});
   const final=frames.at(-1),bad=frames.filter(q=>q.w!==final.w||q.h!==final.h);
   await t.check(`${mode} ${look} real typer keeps its box: ${text}`,frames.length>30&&!bad.length,JSON.stringify({frames:frames.length,final:[final.w,final.h],bad:bad.slice(0,8)}));
   fs.writeFileSync(path.join(t.run.dir,'typewriter-layout.json'),JSON.stringify(all));
  }
  await t.app.resetLayout(t);
 }
}
