import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.waitForTimeout(500);
const measure = () => p.evaluate(()=>{
  const de=document.documentElement, bd=document.body;
  const wide=[...document.querySelectorAll('*')].filter(el=>{
    const r=el.getBoundingClientRect(); return r.right>innerWidth+0.5 || r.left<-0.5;
  }).slice(0,12).map(el=>({t:el.tagName+'.'+String(el.className).split(' ')[0],
    right:+el.getBoundingClientRect().right.toFixed(1), left:+el.getBoundingClientRect().left.toFixed(1),
    w:+el.getBoundingClientRect().width.toFixed(1)}));
  return {deScroll:de.scrollWidth, deClient:de.clientWidth, bodyScroll:bd.scrollWidth, wide, ready:de.getAttribute('data-ab-ready')};
});
console.log('WITH MODULE   ', JSON.stringify(await measure()));
await p.evaluate(()=>{document.documentElement.removeAttribute('data-ab-ready');});
await p.waitForTimeout(250);
console.log('MODULE CSS OFF', JSON.stringify(await measure()));
await b.close();
