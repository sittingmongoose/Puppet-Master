import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
console.log(JSON.stringify(await p.evaluate(()=>{
  const wrap=document.querySelector('.activity-wrap'), item=document.querySelector('.activity-item');
  const cw=getComputedStyle(wrap), ci=getComputedStyle(item);
  const label=item.querySelector('.label'), count=item.querySelector('.count');
  return { wrapContainer:{type:cw.containerType,name:cw.containerName,padding:cw.padding,
             borderBoxW:+wrap.getBoundingClientRect().width.toFixed(1), clientW:wrap.clientWidth},
    item:{padding:ci.padding,gap:ci.gap,w:+item.getBoundingClientRect().width.toFixed(1)},
    labelFs:label?getComputedStyle(label).fontSize:null,
    countFs:count?getComputedStyle(count).fontSize:null,
    barScroll:document.querySelector('.activity-bar').scrollWidth,
    barW:+document.querySelector('.activity-bar').getBoundingClientRect().width.toFixed(1)};
})));
await b.close();
