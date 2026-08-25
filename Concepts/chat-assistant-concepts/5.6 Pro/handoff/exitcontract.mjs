import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
for(const rm of [false,true]){
  const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:rm?'reduce':'no-preference'});
  const p=await ctx.newPage();
  const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(''+e));
  await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.waitForTimeout(300);
  // 1. work sequence still advances
  await p.evaluate(()=>{window.PM56_DEMO.resetWorking&&window.PM56_DEMO.resetWorking();window.PM56_DEMO.startWorking();});
  const steps=[];
  for(let i=0;i<10;i++){await p.waitForTimeout(700);steps.push(await p.evaluate(()=>window.PM56_DEMO.getState().work.step));}
  // 2. exit vocabulary contract
  await p.evaluate(()=>document.querySelector('[data-action="open-menu"][data-menu="persona"]').click());
  await p.waitForTimeout(300);
  const contract=await p.evaluate(async()=>{
    const m=document.querySelector('[data-overlay="root-menu"]');
    const o0=getComputedStyle(m).opacity;
    m.classList.add('pm-leaving');
    const cs=getComputedStyle(m);
    const dur=parseFloat(cs.animationDuration)*1000;
    const samples=[];
    await new Promise(r=>{let n=0;const iv=setInterval(()=>{
      samples.push([Math.round(n*20),+Number(getComputedStyle(m).opacity).toFixed(3),getComputedStyle(m).transform.slice(0,32)]);
      if(++n>14){clearInterval(iv);r();}},20);});
    const end=getComputedStyle(m);
    const res={anim:cs.animationName,dur,fill:cs.animationFillMode,pe:cs.pointerEvents,
      origin:cs.transformOrigin, opacityBefore:o0, opacityAfter:+Number(end.opacity).toFixed(3), samples};
    m.classList.remove('pm-leaving');
    return res;});
  // 3. row-level exit
  const rowContract=await p.evaluate(()=>{
    const r=document.querySelector('.pm-materialize')||document.querySelector('.message');
    r.classList.add('pm-leaving'); const cs=getComputedStyle(r);
    const o={anim:cs.animationName,dur:parseFloat(cs.animationDuration)*1000,filter:cs.filter,pe:cs.pointerEvents};
    r.classList.remove('pm-leaving'); return o;});
  console.log(rm?'REDUCED':'NORMAL', JSON.stringify({steps, overlay:{...contract, samples:contract.samples.filter((x,i)=>i%3===0)}, row:rowContract, errs},null,1));
  await ctx.close();
}
await b.close();
