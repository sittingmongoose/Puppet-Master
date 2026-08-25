import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const out = await p.evaluate(()=>{
  const wrap=document.querySelector('.activity-wrap'), bar=document.querySelector('.activity-bar');
  const s=document.createElement('style');
  s.textContent='.activity-wrap{container-type:normal !important}.activity-item .label{display:block !important}';
  document.head.appendChild(s);
  const natural={wrap:wrap.getBoundingClientRect().width, barScroll:bar.scrollWidth,
    items:[...bar.children].map(c=>({d:c.dataset.hoverDomain,w:+c.getBoundingClientRect().width.toFixed(1)}))};
  s.remove();
  return {natural, wrapNow:wrap.getBoundingClientRect().width, barNow:bar.scrollWidth,
    editorOpen: PM56_DEMO.getState().editorTabs.length};
});
console.log(JSON.stringify(out,null,1));
// close the editor and re-measure
await p.evaluate(()=>{ const st=PM56_DEMO.getState(); });
await b.close();
