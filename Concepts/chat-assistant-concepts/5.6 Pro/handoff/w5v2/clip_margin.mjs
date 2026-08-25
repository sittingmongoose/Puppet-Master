// Reproduce history-verify.mjs's EXACT sample rect + threshold, and measure its headroom,
// then force inset(0) and confirm the shipped assertion goes RED.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
const S='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5v2';
const b = await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(S+'/snap/index.html').href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
for(let i=0;i<4;i++){const st=await p.evaluate(()=>document.body.dataset.phDrawer||'');if(st==='open')break;
  if(st==='pinned')await p.evaluate(()=>window.PM56_EXT._actions['unpin-history']({},null,null));
  else await p.evaluate(()=>window.PM56_EXT._actions['toggle-history']({},null,null));
  await p.waitForTimeout(700);}
const e = await p.evaluate(()=>{const r=document.querySelector('.history-flyout').getBoundingClientRect();return {right:Math.round(r.right),y:Math.round(r.top+r.height/2)};});
const lum = async ()=>{const s=await p.screenshot({clip:{x:e.right+2,y:e.y-8,width:20,height:16}});
  return await p.evaluate(async d=>{const i=new Image();await new Promise(r=>{i.onload=r;i.src=d});
    const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);
    const px=g.getImageData(0,0,c.width,c.height).data;let s=0;for(let k=0;k<px.length;k+=4)s+=(px[k]+px[k+1]+px[k+2])/3;
    return Math.round(s*100/(px.length/4))/100;},'data:image/png;base64,'+s.toString('base64'));};
const setStyle=async(id,css)=>p.evaluate(([i,c])=>{const o=document.getElementById(i);if(o)o.remove();if(c){const s=document.createElement('style');s.id=i;s.textContent=c;document.head.appendChild(s);}},[id,css]);

const out={rect:{x:e.right+2,y:e.y-8,w:20,h:16}};
out.withShadow = await lum();
await setStyle('ns','.history-flyout{box-shadow:none !important}'); await p.waitForTimeout(200);
out.without = await lum();
await setStyle('ns',null); await p.waitForTimeout(200);
out.shippedAssertionPasses = out.withShadow < out.without - 1;
out.headroom = +(out.without - out.withShadow - 1).toFixed(3);
// A/A noise on the same rect
await p.waitForTimeout(200); out.withShadow2 = await lum();
out.noiseAA = +(out.withShadow2 - out.withShadow).toFixed(3);

// NOW force inset(0) and re-run the SHIPPED assertion — it must go red
await setStyle('ci','.history-flyout{clip-path:inset(0px) !important}'); await p.waitForTimeout(300);
const w2 = await lum();
await setStyle('ns','.history-flyout{box-shadow:none !important}'); await p.waitForTimeout(200);
const wo2 = await lum();
await setStyle('ns',null);
out.forcedInset0 = {withShadow:w2, without:wo2, shippedAssertionPasses: w2 < wo2 - 1, delta:+(wo2-w2).toFixed(3)};
console.log(JSON.stringify(out,null,1));
await b.close();
