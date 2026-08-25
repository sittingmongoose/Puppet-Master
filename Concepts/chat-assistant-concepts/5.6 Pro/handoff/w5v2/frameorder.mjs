// TASK 1a — does CDP screencast deliver frames out of paint order?
// Method: paint a monotonically-increasing counter into every frame as an RGB colour,
// then decode that colour out of each captured frame. Arrival order vs painted order.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
const S = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5v2';
const TARGET = process.argv[2] || (S + '/snap/index.html');
const DSF = 2;

const b = await chromium.launch({ headless: true, args: ['--disable-gpu','--allow-file-access-from-files','--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF });
await p.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);

// install the paint-order beacon + an in-page rAF height trace
await p.evaluate(() => {
  const d = document.createElement('div');
  d.id = 'w5v2beacon';
  d.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;z-index:2147483647;background:#000';
  document.body.appendChild(d);
  window.__w5n = 0;
  window.__w5trace = [];
  const tick = () => {
    const n = ++window.__w5n;
    d.style.background = 'rgb(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ')';
    const panel = document.querySelector('.orbit-panel') || document.querySelector('[data-orbit-panel]');
    window.__w5trace.push({ n, t: performance.now(), h: panel ? +panel.getBoundingClientRect().height.toFixed(1) : -1 });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.waitForTimeout(300);

const cdp = await p.context().newCDPSession(p);
let frames = [];
cdp.on('Page.screencastFrame', async (ev) => {
  frames.push({ data: ev.data, arrivedAt: Date.now(), ts: ev.metadata.timestamp, meta: ev.metadata });
  try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) {}
});

async function run(label, action, ms) {
  frames = [];
  await p.evaluate(() => { window.__w5trace = []; });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 2880, maxHeight: 1800, everyNthFrame: 1 });
  await p.waitForTimeout(220);
  const t0 = Date.now();
  await action();
  await p.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  const post = frames.filter(f => f.arrivedAt >= t0);
  // decode the beacon colour out of each frame, and the panel-region ink, in-page
  const dec = await p.evaluate(async ([b64s, dsf]) => {
    const out = [];
    for (const b64 of b64s) {
      const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      const sc = im.width / innerWidth;               // real scale of THIS frame
      const px = g.getImageData(Math.round(20*sc), Math.round(20*sc), 1, 1).data;
      out.push({ n: (px[0]<<16) | (px[1]<<8) | px[2], w: im.width, h: im.height, sc: +sc.toFixed(3) });
    }
    return out;
  }, [post.map(f => f.data), DSF]);
  const trace = await p.evaluate(() => window.__w5trace);
  return { label, post, dec, trace, t0 };
}

const results = [];
results.push(await run('expand', async () => {
  await p.evaluate(() => document.querySelector('.orbit-node[data-value="4"]').click());
}, 900));
await p.waitForTimeout(600);
results.push(await run('collapse', async () => {
  await p.evaluate(() => { const b = document.querySelector('[data-action="orbit-collapse"]'); if (b) b.click(); else document.querySelector('.orbit-node[data-value="4"]').click(); });
}, 900));

const report = { target: TARGET, runs: [] };
for (const r of results) {
  const seq = r.dec.map((d, i) => ({ i, n: d.n, arr: r.post[i].arrivedAt - r.t0, ts: r.post[i].ts, sc: d.sc }));
  // inversions in painted-counter order vs arrival order
  const inv = [];
  for (let i = 1; i < seq.length; i++) if (seq[i].n < seq[i-1].n) inv.push({ at: i, prev: seq[i-1].n, cur: seq[i].n });
  // inversions in metadata.timestamp vs arrival order
  const tsInv = [];
  for (let i = 1; i < seq.length; i++) if (seq[i].ts < seq[i-1].ts) tsInv.push({ at: i, prev: seq[i-1].ts, cur: seq[i].ts });
  // panel height trace monotonic?
  const hs = r.trace.map(t => t.h);
  const dir = r.label === 'expand' ? 1 : -1;
  let hInv = 0, prevH = null;
  for (const h of hs) { if (prevH !== null && (h - prevH) * dir < -0.5) hInv++; prevH = h; }
  report.runs.push({ label: r.label, frames: seq.length, paintedOrderInversions: inv, tsOrderInversions: tsInv,
    counterRange: [seq.length?seq[0].n:null, seq.length?seq[seq.length-1].n:null],
    traceFrames: hs.length, traceHeightRange: [Math.min(...hs), Math.max(...hs)], traceNonMonotonicSteps: hInv,
    seq });
}
// NEGATIVE CONTROL: shuffle one run's frames and confirm the inversion detector goes red
{
  const r = results[0];
  const seq = r.dec.map((d, i) => ({ i, n: d.n }));
  const sh = seq.slice(); [sh[1], sh[sh.length-2]] = [sh[sh.length-2], sh[1]];
  let inv = 0; for (let i = 1; i < sh.length; i++) if (sh[i].n < sh[i-1].n) inv++;
  report.negativeControl = { description: 'swap frames 1 and n-2 of the expand run', inversionsDetected: inv };
}
fs.writeFileSync(S + '/frameorder.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.runs.map(r => ({ label: r.label, frames: r.frames,
  paintedInversions: r.paintedOrderInversions.length, tsInversions: r.tsOrderInversions.length,
  counterRange: r.counterRange, traceFrames: r.traceFrames, traceHeightRange: r.traceHeightRange,
  traceNonMonotonic: r.traceNonMonotonicSteps })), null, 1));
console.log('negative control:', JSON.stringify(report.negativeControl));
await b.close();
