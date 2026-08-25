import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.waitForTimeout(700);
console.log('negative inset accepted:', await p.evaluate(()=>{
  const d=document.createElement('div');document.body.appendChild(d);
  d.style.clipPath='inset(-60px -60px -60px 102%)';
  const v=getComputedStyle(d).clipPath; d.remove(); return v;
}));
// shadow paint test: sample just right of the drawer's right edge, open vs closed
async function sample(){
  return await p.evaluate(()=>{
    const f=document.querySelector('.history-flyout'); if(!f) return null;
    const r=f.getBoundingClientRect();
    return {right:Math.round(r.right), y:Math.round(r.top+r.height/2)};
  });
}
await p.evaluate(()=>{document.querySelector('[data-action="ph-toggle-pin"]').click();}); // unpin -> open (shadow state)
await p.waitForTimeout(600);
const s=await sample(); console.log('open drawer edge', s);
const shot=await p.screenshot({clip:{x:s.right+1,y:s.y-6,width:26,height:12}});
const openPix=await p.evaluate(async d=>{const i=new Image();await new Promise(r=>{i.onload=r;i.src=d});
  const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);
  const px=g.getImageData(0,0,c.width,c.height).data;let t=0;for(let k=0;k<px.length;k+=4)t+=(px[k]+px[k+1]+px[k+2])/3;
  return Math.round(t/(px.length/4));},'data:image/png;base64,'+shot.toString('base64'));
await p.evaluate(()=>{document.querySelector('[data-action="toggle-history"]').click();});
await p.waitForTimeout(700);
const shot2=await p.screenshot({clip:{x:s.right+1,y:s.y-6,width:26,height:12}});
const closedPix=await p.evaluate(async d=>{const i=new Image();await new Promise(r=>{i.onload=r;i.src=d});
  const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);
  const px=g.getImageData(0,0,c.width,c.height).data;let t=0;for(let k=0;k<px.length;k+=4)t+=(px[k]+px[k+1]+px[k+2])/3;
  return Math.round(t/(px.length/4));},'data:image/png;base64,'+shot2.toString('base64'));
console.log('luminance just right of drawer:  open',openPix,' closed',closedPix,' -> shadow present:',openPix<closedPix-1);
await b.close();
