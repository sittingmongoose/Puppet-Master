/* AUDIT-ONLY: what the 40 matrix cases do not assert — layout integrity. */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(path.join(__dirname,'.verify','node_modules','__probe.js'))('playwright-core');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((rq,rs)=>{let u=decodeURIComponent((rq.url||'/').split('?')[0]);if(u==='/')u='/u11-prism.html';
 const f=path.normalize(path.join(__dirname,u)); if(!f.startsWith(__dirname)||!fs.existsSync(f)||!fs.statSync(f).isFile()){rs.writeHead(404);rs.end('nf');return;}
 rs.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(rs);});
await new Promise(r=>server.listen(8137,'127.0.0.1',r));
const ctx=await chromium.launchPersistentContext(path.join(os.tmpdir(),'u11-p4-'+process.pid),{headless:true,
 executablePath:'/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
 args:['--headless','--disable-gpu','--no-sandbox','--no-first-run','--no-default-browser-check']});
const rows=[];
for (const w of [900,1280,1700,2200,2500]) {
  const page=await ctx.newPage(); await page.setViewportSize({width:w,height:1000});
  await page.addInitScript(kv=>{try{Object.keys(kv).forEach(k=>localStorage.setItem(k,kv[k]))}catch{}},{'pm.theme':'friendly-dark'});
  await page.goto('http://127.0.0.1:8137/u11-prism.html',{waitUntil:'load',timeout:30000});
  await page.waitForSelector('.us-page.u11',{timeout:15000}); await page.waitForTimeout(700);
  rows.push(await page.evaluate((vw)=>{
    const de=document.documentElement;
    const overflowers=[];
    document.querySelectorAll('.us-page.u11 *').forEach(el=>{
      const r=el.getBoundingClientRect();
      if (r.width>0 && (r.right>vw+1 || r.left<-1)) overflowers.push((el.tagName+'.'+(el.className||'').toString().split(' ')[0]).slice(0,50)+' right='+Math.round(r.right));
    });
    return { width: vw, docScrollWidth: de.scrollWidth, bodyHorizOverflow: de.scrollWidth>vw+1,
      renderedTextLen: document.body.innerText.length,
      visiblePane: (document.querySelector('.u11-pane:not(.pm-hidden)')||{dataset:{}}).dataset.pane || null,
      overflowingElements: overflowers.length, overflowSample: overflowers.slice(0,4) };
  }, w));
  await page.close();
}
console.log(JSON.stringify(rows,null,1));
fs.writeFileSync('/mnt/Cursor/PuppetMaster/Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/audit-evidence/probes/replay-matrix-coverage-probe.json',JSON.stringify({note:'dimensions the 40 matrix cases never assert',rows},null,2));
await ctx.close(); server.close(); process.exit(0);
