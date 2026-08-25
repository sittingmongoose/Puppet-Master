import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w4orbit/film';
const TARGET = process.argv[2] || "/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/index.html";

const b = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(TARGET).href, { waitUntil: 'load' });
await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(400);

const cdp = await p.context().newCDPSession(p);
let frames = [];
cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
  frames.push({ data, at: Date.now() });
  try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch (e) { }
});

async function film(name, action, ms, clipFn, cols = 5, every = 1) {
  frames = [];
  const clip = await p.evaluate(clipFn);
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 2880, maxHeight: 1800, everyNthFrame: 1 });
  await p.waitForTimeout(220);
  const t0 = Date.now();
  await action();
  await p.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  const post = frames.filter(f => f.at >= t0).filter((_, i) => i % every === 0);
  const list = post.slice(0, cols * 4);
  const offsets = post.slice(0, cols * 4).map(f => f.at - t0);
  const res = await p.evaluate(async ([b64s, clip, cols, offsets, title]) => {
    const imgs = [];
    for (const b64 of b64s) { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); imgs.push(i); }
    const S = imgs[0].width / innerWidth;
    const rows = Math.ceil(imgs.length / cols);
    const dw = Math.round(clip.width), dh = Math.round(clip.height);
    const pad = 6, lab = 15;
    const c = document.createElement('canvas');
    c.width = cols * (dw + pad) + pad;
    c.height = rows * (dh + pad + lab) + pad + 22;
    const g = c.getContext('2d');
    g.fillStyle = '#1b1b24'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#e6e6f0'; g.font = 'bold 13px monospace';
    g.fillText(title, pad, 15);
    imgs.forEach((im, k) => {
      const cx = pad + (k % cols) * (dw + pad);
      const cy = 22 + pad + Math.floor(k / cols) * (dh + pad + lab);
      g.drawImage(im, clip.x * S, clip.y * S, clip.width * S, clip.height * S, cx, cy, dw, dh);
      g.strokeStyle = '#4a4a5e'; g.strokeRect(cx - .5, cy - .5, dw + 1, dh + 1);
      g.fillStyle = '#9aa0b5'; g.font = '11px monospace';
      g.fillText('#' + k + '  +' + offsets[k] + 'ms', cx, cy + dh + 12);
    });
    return c.toDataURL('image/png');
  }, [list.map(f => f.data), clip, cols, offsets, name]);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.split(',')[1], 'base64'));
  console.log(name, '->', list.length, 'frames, offsets', offsets.join(','));
}

const cardClip = () => { const r = document.querySelector('.working-card').getBoundingClientRect(); return { x: Math.max(0, Math.round(r.left) - 6), y: Math.max(0, Math.round(r.top) - 6), width: Math.round(r.width) + 12, height: 500 }; };

// 1 — expand
await film('01-expand', async () => { await p.evaluate(() => document.querySelector('.orbit-node[data-value="4"]').click()); }, 900, cardClip, 5);
await p.waitForTimeout(500);
// 2 — collapse
await film('02-collapse', async () => { await p.evaluate(() => document.querySelector('[data-action="orbit-collapse"]').click()); }, 900, cardClip, 5);
await p.waitForTimeout(500);
// 3 — open the delegation phase (satellites appear)
await film('03-satellites', async () => { await p.evaluate(() => document.querySelector('.orbit-node[data-value="7"]').click()); }, 900, cardClip, 5);
await p.waitForTimeout(600);

// 4 — wide<->narrow reflow, driven by the real editor divider
async function drag(pct) {
  const h = await p.locator('[data-resize="editor"]').first().boundingBox();
  await p.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await p.mouse.down();
  await p.mouse.move(1440 * (pct / 100), h.y + h.height / 2, { steps: 18 });
  await p.mouse.up();
}
await drag(26); await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await film('04-reflow-wide-to-narrow', async () => { await drag(70); }, 700, cardClip, 5);
await p.waitForTimeout(600);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(200);
await film('05-reflow-narrow-to-wide', async () => { await drag(26); }, 700, cardClip, 5);

// stills: the two layouts, settled
await drag(26); await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/still-wide.png`, clip: await p.evaluate(cardClip) });
await drag(70); await p.waitForTimeout(800);
await p.evaluate(() => document.querySelector('.working-card').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/still-narrow.png`, clip: await p.evaluate(cardClip) });

// trail still, on a take that has the chrome
await p.evaluate(() => { window.PM56_DEMO.setVariant(2, 3); window.PM56_DEMO.setWorkStep(6); });
await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.wa-chrome').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(250);
const tr = await p.evaluate(() => { const r = document.querySelector('.wa-head').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) - 4, width: Math.round(r.width), height: Math.round(r.height) + 8 }; });
await p.screenshot({ path: `${OUT}/still-trail.png`, clip: tr });
console.log('stills written');
await b.close();
