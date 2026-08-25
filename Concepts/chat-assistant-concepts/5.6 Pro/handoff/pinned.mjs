import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const { chromium } = await import('playwright');
const b = await chromium.launch({ headless:true, args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>PM56_DEMO.pinActivity());
await p.waitForTimeout(500);

const measure = () => p.evaluate(()=>{
  const de=document.documentElement;
  const over=[...document.querySelectorAll('*')].map(el=>{
    const r=el.getBoundingClientRect();
    return {t:el.tagName.toLowerCase()+'.'+String(el.className||'').split(' ').filter(Boolean)[0],
      right:+r.right.toFixed(1), left:+r.left.toFixed(1), w:+r.width.toFixed(1)};
  }).filter(x=>x.right>innerWidth+0.5).sort((a,b)=>b.right-a.right);
  const wrap=document.querySelector('.activity-wrap'), bar=document.querySelector('.activity-bar');
  const items=[...bar.children].map(c=>({d:c.dataset.hoverDomain,w:+c.getBoundingClientRect().width.toFixed(1),
    right:+c.getBoundingClientRect().right.toFixed(1),
    label:getComputedStyle(c.querySelector('.label')).display,
    count:getComputedStyle(c.querySelector('.count')).display,
    svgW:+c.querySelector('svg').getBoundingClientRect().width.toFixed(1)}));
  return {ready:de.getAttribute('data-ab-ready'),
    deScroll:de.scrollWidth, deClient:de.clientWidth, bodyScroll:document.body.scrollWidth,
    wrapClient:wrap.clientWidth, wrapRight:+wrap.getBoundingClientRect().right.toFixed(1),
    barW:+bar.getBoundingClientRect().width.toFixed(1), barScroll:bar.scrollWidth,
    barRight:+bar.getBoundingClientRect().right.toFixed(1),
    items, overCount:over.length, overTop:over.slice(0,8)};
});
const on = await measure();
console.log('PINNED, MODULE ON :', JSON.stringify(on,null,1));
await p.evaluate(()=>document.documentElement.removeAttribute('data-ab-ready'));
await p.waitForTimeout(300);
const off = await measure();
console.log('PINNED, MODULE OFF:', JSON.stringify({ready:off.ready,deScroll:off.deScroll,bodyScroll:off.bodyScroll,
  barW:off.barW,barScroll:off.barScroll,items:off.items,overCount:off.overCount,overTop:off.overTop.slice(0,4)},null,1));
await p.evaluate(()=>document.documentElement.setAttribute('data-ab-ready','1'));
await p.waitForTimeout(200);
// hover card in the pinned layout
await p.hover('[data-hover-domain="subagents"]');
await p.waitForSelector('.hover-card.ab-card');
await p.waitForFunction(()=>{const c=document.querySelector('.hover-card.ab-card');return c&&getComputedStyle(c).opacity==='1';});
const card = await p.evaluate(()=>{const c=document.querySelector('.hover-card.ab-card');const r=c.getBoundingClientRect();
  const at=document.elementFromPoint(r.left+r.width/2,r.top+12);
  return {x:+r.left.toFixed(1),y:+r.top.toFixed(1),w:r.width,h:+r.height.toFixed(1),
    inside:r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1, hit:!!(at&&c.contains(at))};});
console.log('CARD IN PINNED LAYOUT:', JSON.stringify(card));
fs.writeFileSync(process.argv[3]||'pinned.png', await p.screenshot());
await b.close();
