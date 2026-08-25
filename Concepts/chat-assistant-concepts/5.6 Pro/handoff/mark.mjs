import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
console.log(JSON.stringify(await p.evaluate(()=>{
  const el=document.querySelector('.activity-item .state-mark');
  return {
    ready: document.documentElement.getAttribute('data-ab-ready'),
    htmlAttrs:[...document.documentElement.attributes].map(a=>a.name+'='+a.value),
    bodyStyle: document.body.getAttribute('style'),
    display: getComputedStyle(el).display,
    matches: el.matches('html[data-ab-ready] .activity-item .state-mark'),
    parentTag: el.parentElement.className,
    sheetHits: [...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch(e){return []}})
       .filter(r=>r.selectorText&&/state-mark/.test(r.selectorText))
       .map(r=>r.selectorText+' {'+r.style.cssText+'}')
  };
})));
await b.close();
