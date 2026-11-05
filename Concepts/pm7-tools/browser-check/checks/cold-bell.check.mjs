// SW-26: the bell is the first trusted gesture in each fresh app document.
// Native setup/CDP reads never grant activation. No app.open/look/evaluate
// helper runs between the final navigation and that gesture.
import {writeFileSync} from 'node:fs';

function boot(look,key){
 const R=window.__coldBell={key,events:0,framed:window!==window.top,gaps:[]};
 try{localStorage.getItem('cold-bell-surface');R.storageBlocked=false;}catch(e){R.storageBlocked=e.name==='SecurityError';}
 let last;
 function tick(at){
  if(last!=null&&R.clickAt!=null)R.gaps.push([at,at-last]);
  last=at;requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
 for(const type of ['pointerdown','keydown','touchstart'])document.addEventListener(type,e=>{
  if(e.isTrusted){R.events++;if(type==='pointerdown')performance.mark(key+'-down');}
 },true);
 document.addEventListener('click',e=>{
  if(!e.isTrusted)return;
  R.clickAt=performance.now();R.bell=!!e.target.closest?.('#pmnStack');
  performance.mark(key+'-click');
 },true);
 window.addEventListener('load',()=>{
  PM_THEME.setMode('dark',{persist:false});
  PM_THEME.setFamily(look.split('-')[0],{persist:false});
  const ready=()=>{
   const el=document.querySelector('#pmnStack'),b=el?.getBoundingClientRect();
   if(!window.PM_TITLEBAR_NOTIFY||document.documentElement.getAttribute('data-pmr-ready')!=='1'||
      window.PM_THEME_TRANSITION?.busy()||window.PM_LOOK_COVERED?.()||!b?.width||!b.height){requestAnimationFrame(ready);return;}
   R.ready=true;R.rect={x:b.x,y:b.y,w:b.width,h:b.height};
   R.theme=document.documentElement.getAttribute('data-theme');
   R.readyActive=navigator.userActivation.hasBeenActive;
  };ready();
 },{once:true});
}

export default async function(t){
 const sandbox=String(t.args.sandbox)==='1',out=[];
 const builds=t.args.base&&t.args.fixed?[['control',t.args.base],['fixed',t.args.fixed]]:[['fixed',t.args.page||new URL('../../../PMConcept7.html',import.meta.url).href]];
 const top=await t.page.context().newCDPSession(t.page);
 await top.send('Emulation.setFocusEmulationEnabled',{enabled:true});
 for(const [label,page]of builds)for(const look of String(t.args.looks||'basic-dark,glass-dark').split(',')){
  const key='cold-'+label+'-'+look,target=new URL(page,'file://');
  target.searchParams.set('o55','off');target.searchParams.set('cb',Date.now()+'-'+key);
  if(sandbox)await t.openInSandbox(target.href);
  const app=sandbox?await t.page.context().newCDPSession(t.root).catch(e=>{
   if(String(e.message).includes('part of the parent frame'))return top;throw e;
  }):top;
  const {frameTree}=await app.send('Page.getFrameTree');
  const find=tree=>(tree.childFrames||[]).map(find).find(Boolean)||(new URL(tree.frame.url,'file://').pathname===target.pathname?tree.frame:null);
  // The normal document may still be about:blank or the previous build.
  const frame=sandbox?find(frameTree):frameTree.frame;
  if(!frame)throw new Error('cold bell needs the approved app frame');
  let contextId;
  const created=({context})=>{if(context.auxData?.isDefault&&context.auxData.frameId===frame.id)contextId=context.id;};
  app.on('Runtime.executionContextCreated',created);
  await app.send('Runtime.enable');await app.send('Page.enable');
  const {identifier}=await app.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+boot.toString()+')('+JSON.stringify(look)+','+JSON.stringify(key)+')'});
  await top.send('Tracing.start',{categories:'devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'});
  try{
   await app.send('Page.navigate',{url:target.href,frameId:frame.id});
   const read=async()=>{
    if(!contextId)return null;
    try{
     const x=await app.send('Runtime.evaluate',{contextId,userGesture:false,returnByValue:true,
      expression:'JSON.stringify({r:window.__coldBell,active:navigator.userActivation.hasBeenActive,path:location.pathname,played:!!window.O55?.sound?.log.some(x=>x.played),open:!!window.PM_TITLEBAR_NOTIFY?.isOpen()})'});
     return JSON.parse(x.result.value);
    }catch(_){return null;}
   };
   let before;const until=Date.now()+60000;
   while(Date.now()<until){before=await read();if(before?.r?.ready)break;await t.page.waitForTimeout(100);}
   const ready=!!before?.r?.ready;
   await t.check(key+': native setup ready',ready,JSON.stringify(before));
   if(!ready)continue;
   await t.equal(key+': requested source loaded',before.path,target.pathname);
   await t.equal(key+': requested look loaded',before.r.theme,look);
   const surface=sandbox?before.r.framed&&before.r.storageBlocked:!before.r.framed&&!before.r.storageBlocked;
   await t.check(key+': requested surface retained',surface,JSON.stringify(before));
   const cold=before.r.events===0&&!before.active&&!before.r.readyActive&&!before.played;
   await t.check(key+': no input, activation or live sound before bell',cold,JSON.stringify(before));
   if(!cold||!surface||before.path!==target.pathname||before.r.theme!==look)continue; // Unexercised setup is never a cold sample.
   await t.mark(key+' ready');
   const b=before.r.rect,x=b.x+b.w/2,y=b.y+b.h/2;
   await top.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
   await top.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
   await t.page.waitForTimeout(20);
   await top.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
   await t.page.waitForTimeout(1400);
   const after=await read();out.push({key,before,after});
   await t.check(key+': first trusted gesture opened the bell',after?.r?.events===1&&after.r.bell&&after.open,JSON.stringify(after));
   t.log('cold bell native sample '+JSON.stringify({key,before,after}));
  }finally{
   const done=new Promise(resolve=>top.once('Tracing.tracingComplete',resolve));
   await top.send('Tracing.end');const {stream}=await done;
   let data='';for(;;){const x=await top.send('IO.read',{handle:stream});data+=x.data;if(x.eof)break;}
   await top.send('IO.close',{handle:stream});
   if(t.args.evidence)writeFileSync(t.args.evidence+'/'+key+'-trace.json',data);
   await app.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
   app.off('Runtime.executionContextCreated',created);
   if(app!==top)await app.detach();
  }
 }
 if(t.args.evidence)writeFileSync(t.args.evidence+'/cold-bell-metrics.json',JSON.stringify(out,null,2));
 await top.detach();
}
