import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const res=await p.evaluate(()=>{
  const CH={middot:'·',minus:'−',times:'×',ellipsis:'…',emdash:'—',arrow:'→',cmd:'⌘',ret:'↵',rsquo:'’'};
  const TOFU='';            // private-use: no font has a glyph for it
  const c=document.createElement('canvas'); c.width=64; c.height=64;
  const g=c.getContext('2d',{willReadFrequently:true});
  const bitmap=(ch,fam)=>{
    g.clearRect(0,0,64,64); g.fillStyle='#000'; g.font=`36px ${fam}`;
    g.textBaseline='middle'; g.fillText(ch,8,32);
    const d=g.getImageData(0,0,64,64).data;
    let ink=0,sig='';
    for(let i=3;i<d.length;i+=4){ if(d[i]>16){ink++;sig+=((i/4)|0).toString(36);} }
    return {ink,hash:sig.length?sig.slice(0,80)+':'+sig.length:'blank'};
  };
  const cs=getComputedStyle(document.body);
  const stacks={ui:cs.getPropertyValue('--font-ui').trim(), mono:cs.getPropertyValue('--font-mono').trim()};
  const out={};
  for(const [famName,fam] of Object.entries(stacks)){
    const tofu=bitmap(TOFU,fam);
    out[famName]={tofuInk:tofu.ink,glyphs:{}};
    for(const [name,ch] of Object.entries(CH)){
      const bm=bitmap(ch,fam);
      out[famName].glyphs[name]={ink:bm.ink, sameAsTofu:bm.hash===tofu.hash, blank:bm.hash==='blank'};
    }
    out[famName].missing=Object.entries(out[famName].glyphs).filter(([,v])=>v.sameAsTofu||v.blank).map(([k])=>k);
  }
  return out;
});
console.log('Under retro (UI == mono stack), glyph presence by PIXELS not advance width:');
for(const [fam,v] of Object.entries(res)){
  console.log(`\n  ${fam}  (tofu box ink = ${v.tofuInk}px)`);
  for(const [n,gph] of Object.entries(v.glyphs)) console.log(`    ${n.padEnd(9)} ink=${String(gph.ink).padStart(4)}  identicalToTofu=${gph.sameAsTofu}  blank=${gph.blank}`);
  console.log(`    => genuinely missing: ${v.missing.length?v.missing.join(', '):'NONE'}`);
}
await b.close();
