import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
console.log(JSON.stringify(await p.evaluate(()=>{
  const o={};
  document.querySelectorAll('.activity-item[data-hover-domain]').forEach(b=>{
    const svg=b.querySelector('svg'), pth=svg.querySelector('path,circle,rect,line,polyline');
    o[b.dataset.hoverDomain]={tone:document.documentElement.getAttribute('data-ab-'+b.dataset.hoverDomain),
      svgStroke:getComputedStyle(svg).strokeWidth, childStroke:pth?getComputedStyle(pth).strokeWidth:null,
      shadow:getComputedStyle(svg).filter.slice(0,28)};
  });
  return o;
})));
await b.close();
