import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const req = createRequire(path.join(__dirname, '.verify', 'node_modules', '__probe.js'));
const { chromium } = req('playwright-core');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((rq,rs)=>{let u=decodeURIComponent((rq.url||'/').split('?')[0]);if(u==='/')u='/u11-prism.html';
 const f=path.normalize(path.join(__dirname,u)); if(!f.startsWith(__dirname)||!fs.existsSync(f)||!fs.statSync(f).isFile()){rs.writeHead(404);rs.end('nf');return;}
 rs.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(rs);});
await new Promise(r=>server.listen(8127,'127.0.0.1',r));
const ctx=await chromium.launchPersistentContext(path.join(os.tmpdir(),'u11-p3-'+process.pid),{headless:true,
 executablePath:'/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
 args:['--headless','--disable-gpu','--no-sandbox','--no-first-run','--no-default-browser-check']});
const page=await ctx.newPage(); await page.setViewportSize({width:1700,height:1000});
await page.addInitScript(kv=>{try{Object.keys(kv).forEach(k=>localStorage.setItem(k,kv[k]))}catch{}},{'pm.theme':'friendly-dark','u11:disclosure':'"essentials"'});
await page.goto('http://127.0.0.1:8127/u11-prism.html',{waitUntil:'load',timeout:30000});
await page.waitForSelector('.us-page.u11',{timeout:15000}); await page.waitForTimeout(800);
const measure=()=>page.evaluate(()=>{const el=document.querySelector('.u11-advonly');
 return {inline:el.getAttribute('style')||'',computed:getComputedStyle(el).display,h:el.offsetHeight,
  visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length),
  moreOpen:!document.getElementById('u11MoreGrp').classList.contains('closed')};});
const res={};
res.essentials_moreClosed=await measure();
await page.click('#u11Disc button[data-disc="advanced"]'); await page.waitForTimeout(600);
res.advanced_moreClosed=await measure();
await page.click('#u11MoreGrp [data-more-toggle]'); await page.waitForTimeout(500);
res.advanced_moreOpen=await measure();
await page.click('#u11Disc button[data-disc="standard"]'); await page.waitForTimeout(600);
res.standard_moreOpen=await measure();
console.log(JSON.stringify(res,null,1));
fs.writeFileSync('/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence/probes/replay-advonly-visibility-probe.json',JSON.stringify(res,null,2));
await page.close(); await ctx.close(); server.close(); process.exit(0);
