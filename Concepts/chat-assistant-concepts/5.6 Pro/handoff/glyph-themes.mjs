import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const themes=await p.evaluate(()=>PM56_DATA.themes.map(t=>t.id));
// the 9 non-ASCII codepoints app.js actually emits
const CHARS=['·','−','×','…','—','→','⌘','↵','’'];
const NAMES=['middot','minus','times','ellipsis','emdash','arrow','cmd','return','rsquo'];
const out={};
for(const th of themes){
  await p.evaluate(t=>PM56_DEMO.setTheme(t),th); await p.waitForTimeout(200);
  out[th]=await p.evaluate(([chars,names])=>{
    const cs=getComputedStyle(document.body);
    const ui=cs.getPropertyValue('--font-ui').trim(), mono=cs.getPropertyValue('--font-mono').trim();
    const span=document.createElement('span');
    span.style.cssText='position:absolute;left:-9999px;top:0;font-size:12px;white-space:pre;visibility:hidden';
    document.body.appendChild(span);
    const w=(ch,fam)=>{span.style.fontFamily=fam;span.textContent=ch;return +span.getBoundingClientRect().width.toFixed(2);};
    const TOFU=''; // private-use area: guaranteed no glyph -> fallback box
    const res={fontUi:ui.split(',')[0],fontMono:mono.split(',')[0],uiIsMono:ui===mono,ui:{},mono:{}};
    for(const fam of ['ui','mono']){
      const stack = fam==='ui'?ui:mono;
      const tofu = w(TOFU,stack);
      res[fam].tofuWidth=tofu;
      res[fam].missing=[];
      chars.forEach((ch,i)=>{
        const width=w(ch,stack);
        res[fam][names[i]]=width;
        if(Math.abs(width-tofu)<0.01) res[fam].missing.push(names[i]);
      });
    }
    span.remove();
    return res;
  },[CHARS,NAMES]);
}
// and the load-bearing one, painted for real in the diff blocks under the mono-UI theme
await p.evaluate(()=>{PM56_DEMO.setTheme('retro-dark');PM56_DEMO.openArtifact('file:threads/provider-selector.js');});
await p.waitForTimeout(400);
const painted=await p.evaluate(()=>{
  const blocks=[...document.querySelectorAll('.code-block')];
  const txt=blocks.map(b=>b.textContent).join('');
  const doc=document.querySelector('.editor-doc');
  const pill=[...doc.querySelectorAll('.meta-pill')].find(e=>/−/.test(e.textContent));
  return {
    monoFamily:getComputedStyle(blocks[0]).fontFamily.split(',')[0],
    minusPill:pill?pill.textContent:null,
    replacementChars:(txt.match(/�/g)||[]).length,
    middotsInDoc:(doc.textContent.match(/·/g)||[]).length
  };
});
console.log(JSON.stringify({themes:out,painted,errors:errs},null,1));
await b.close();
