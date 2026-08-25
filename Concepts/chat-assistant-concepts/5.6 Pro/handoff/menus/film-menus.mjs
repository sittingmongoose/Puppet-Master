/* Film the sprout open and the asymmetric close with CDP screencast frames and
   build two contact sheets. Motion claims are checked in the frames, not in CSS. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import fs from 'fs';
const OUT = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/menus';
const EXE = '/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const target = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html';

const b = await chromium.launch({ executablePath: EXE, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(target).href, { waitUntil: 'load' });
await p.waitForFunction(() => window.__PM56_BOOT_OK === true);
await p.waitForTimeout(400);

/* settled clip for the persona menu, padded so the collapse has room */
await p.evaluate(() => document.querySelector('.selector-button[data-kind="persona"]').click());
await p.waitForTimeout(700);
const clip = await p.evaluate(() => {
  const m = document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
  const r = m.getBoundingClientRect();
  const pad = 14;
  return {
    x: Math.max(0, Math.round(r.left - pad)), y: Math.max(0, Math.round(r.top - pad)),
    width: Math.round(r.width + pad * 2), height: Math.round(r.height + pad * 2 + 34)
  };
});
console.log('clip', JSON.stringify(clip));

const cdp = await p.context().newCDPSession(p);
let frames = [];
cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
  frames.push({ data, at: Date.now() });
  try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch (e) {}
});

async function film(label, action, ms) {
  frames = [];
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
  await p.waitForTimeout(180);
  const t0 = Date.now();
  await action();
  await p.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  const post = frames.filter(f => f.at >= t0 - 4);
  console.log(label, 'frames', post.length, 'offsets', post.map(f => f.at - t0).join(','));
  return post;
}

async function sheet(name, list, cols) {
  const url = await p.evaluate(async ([blobs, clip, cols]) => {
    const imgs = [];
    for (const b64 of blobs) { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); imgs.push(i); }
    const S = imgs[0].width / innerWidth;
    const dw = clip.width, dh = clip.height, gap = 8;
    const rows = Math.ceil(imgs.length / cols);
    const c = document.createElement('canvas');
    c.width = cols * (dw + gap) + gap; c.height = rows * (dh + gap + 16) + gap;
    const g = c.getContext('2d');
    g.fillStyle = '#101014'; g.fillRect(0, 0, c.width, c.height);
    imgs.forEach((im, k) => {
      const cx = (k % cols) * (dw + gap) + gap, cy = Math.floor(k / cols) * (dh + gap + 16) + gap;
      g.drawImage(im, clip.x * S, clip.y * S, clip.width * S, clip.height * S, cx, cy, dw, dh);
      g.fillStyle = '#8ab4ff'; g.font = '11px monospace';
      g.fillText('#' + k, cx + 3, cy + dh + 12);
    });
    return c.toDataURL('image/png');
  }, [list.map(f => f.data), clip, cols]);
  fs.writeFileSync(`${OUT}/${name}`, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', name);
}

/* ---- CLOSE first (a menu is already open) ---- */
const closeFrames = await film('close', async () => {
  await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
}, 500);
await sheet('close-contact-sheet.png', closeFrames.slice(0, 12), 6);

await p.waitForTimeout(500);

/* ---- OPEN ---- */
const openFrames = await film('open', async () => {
  await p.evaluate(() => document.querySelector('.selector-button[data-kind="persona"]').click());
}, 620);
await sheet('open-contact-sheet.png', openFrames.slice(0, 12), 6);

/* ---- model-menu search filter (height spring) ---- */
await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
await p.waitForTimeout(500);
await p.evaluate(() => document.querySelector('.selector-button[data-kind="model"]').click());
await p.waitForTimeout(700);
const clip2 = await p.evaluate(() => {
  const m = document.querySelector('.overlay-menu.model-menu');
  const r = m.getBoundingClientRect();
  return { x: Math.max(0, Math.round(r.left - 10)), y: Math.max(0, Math.round(r.top - 10)), width: Math.round(r.width + 20), height: Math.round(r.height + 30) };
});
const savedClip = { ...clip };
Object.assign(clip, clip2);
const filterFrames = await film('filter', async () => {
  await p.evaluate(() => {
    const i = document.querySelector('input[data-input="model-search"]');
    i.value = 'claude'; i.dispatchEvent(new Event('input', { bubbles: true }));
  });
}, 700);
await sheet('filter-contact-sheet.png', filterFrames.slice(0, 12), 6);
Object.assign(clip, savedClip);

await b.close();
