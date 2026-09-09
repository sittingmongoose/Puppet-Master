import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark' });
const net = [];
page.on('request', r => { const u = r.url(); if (!u.startsWith('file://') && !u.startsWith('data:') && !u.startsWith('blob:')) net.push(r.method()+' '+u.slice(0,120)); });
const usage = () => page.evaluate(() => {
  const u = window.PM7_USAGE || {};
  const b = window.__PM7_USAGE_BRIDGE_STATE_V1__ || {};
  return JSON.stringify({ u: Object.keys(u).length, snap: JSON.stringify(b).length });
});
const before = await usage();
await page.evaluate(() => window.PMO_TOUR.start({source:'verify'}));
await page.waitForTimeout(1200);
// drive every step via Show Me (which invokes the same handlers a user would)
for (let i=0;i<16;i++){
  const running = await page.evaluate(() => window.PMO_TOUR.running);
  if (!running) break;
  await page.evaluate(() => { const b=document.querySelector('#pmot [data-pmot-act="showme"]'); if(b)b.click(); });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { const b=document.querySelector('#pmot [data-pmot-act="next"]'); if(b)b.click(); });
  await page.waitForTimeout(900);
}
const after = await usage();
console.log(JSON.stringify({
  offFileRequests: net.length, sample: net.slice(0,5),
  usageBefore: before, usageAfter: after, usageUnchanged: before === after,
  tourProviderRequests: await page.evaluate(() => window.PMO_TOUR.provider_requests),
  consoleErrors: errs.slice(0,4)
}, null, 1));
await browser.close();
