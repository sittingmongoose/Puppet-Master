import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import fs from 'fs';

export const TARGET = "/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/index.html";
export const W5 = '/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/w5';

export async function boot(opts = {}) {
  const b = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox', '--force-color-profile=srgb'],
  });
  const ctx = await b.newContext({
    viewport: { width: opts.width || 1440, height: opts.height || 900 },
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference',
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto(pathToFileURL(opts.target || TARGET).href, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true, null, { timeout: 30000 });
  await p.waitForTimeout(500);
  return { b, p, errs };
}

/* Contact-sheet filmer. deviceScaleFactor 1 so 1 css px == 1 image px.
   APPEARANCE evidence only — offsets carry CDP arrival latency. */
export function makeFilmer(p, outDir) {
  let cdp = null, frames = [];
  return {
    async attach() {
      cdp = await p.context().newCDPSession(p);
      cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
        frames.push({ data, at: Date.now(), ts: metadata && metadata.timestamp });
        try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch (e) { }
      });
    },
    async film(name, action, ms, clipFn, o = {}) {
      const cols = o.cols || 6, maxFrames = o.maxFrames || 24, scale = o.scale || 1;
      frames = [];
      const clip = typeof clipFn === 'function' ? await p.evaluate(clipFn) : clipFn;
      if (!clip) { console.log('SKIP ' + name + ' (no clip)'); return null; }
      await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 3000, maxHeight: 2000, everyNthFrame: 1 });
      await p.waitForTimeout(180);
      const t0 = Date.now();
      if (action) await action();
      await p.waitForTimeout(ms);
      await cdp.send('Page.stopScreencast');
      let post = frames.filter(f => f.at >= t0 - 8);
      // CDP frames can be ACKed/delivered out of capture order. Sort by the
      // page-side capture timestamp (metadata.timestamp, seconds) when present.
      const outOfOrder = post.some((f, i) => i && f.ts != null && post[i - 1].ts != null && f.ts < post[i - 1].ts);
      if (outOfOrder) console.log(`  !! ${name}: CDP frames arrived OUT OF CAPTURE ORDER — re-sorted`);
      if (post.every(f => f.ts != null)) post.sort((a, b) => a.ts - b.ts);
      // even sampling across the window
      if (post.length > maxFrames) {
        const step = post.length / maxFrames;
        post = Array.from({ length: maxFrames }, (_, i) => post[Math.floor(i * step)]);
      }
      const offsets = post.map(f => f.at - t0);
      const res = await p.evaluate(async ([b64s, clip, cols, offsets, title, scale]) => {
        const imgs = [];
        for (const b64 of b64s) { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); imgs.push(i); }
        if (!imgs.length) return null;
        const S = imgs[0].width / innerWidth;
        const rows = Math.ceil(imgs.length / cols);
        const dw = Math.round(clip.width * scale), dh = Math.round(clip.height * scale);
        const pad = 5, lab = 14;
        const c = document.createElement('canvas');
        c.width = cols * (dw + pad) + pad;
        c.height = rows * (dh + pad + lab) + pad + 20;
        const g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#ffe680'; g.font = 'bold 12px monospace';
        g.fillText(title, pad, 14);
        imgs.forEach((im, k) => {
          const cx = pad + (k % cols) * (dw + pad);
          const cy = 20 + pad + Math.floor(k / cols) * (dh + pad + lab);
          g.drawImage(im, clip.x * S, clip.y * S, clip.width * S, clip.height * S, cx, cy, dw, dh);
          g.strokeStyle = '#5a5a76'; g.strokeRect(cx - .5, cy - .5, dw + 1, dh + 1);
          g.fillStyle = '#8fe3ff'; g.font = 'bold 11px monospace';
          g.fillText('#' + k + ' +' + offsets[k] + 'ms', cx + 1, cy + dh + 12);
        });
        return c.toDataURL('image/png');
      }, [post.map(f => f.data), clip, cols, offsets, name, scale]);
      if (!res) { console.log('NO FRAMES ' + name); return null; }
      fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(res.split(',')[1], 'base64'));
      const sz = fs.statSync(`${outDir}/${name}.png`).size;
      console.log(`${name} -> ${post.length}f  ${offsets[0]}..${offsets[offsets.length - 1]}ms  ${(sz / 1024).toFixed(0)}KB`);
      return { frames: post.length, offsets };
    },
  };
}

/* In-page rAF trace — the ONLY valid timing instrument here. */
export async function rafTrace(p, { setup, trigger, probes, ms = 1200 }) {
  return await p.evaluate(async ([probesSrc, ms]) => {
    const probes = eval('(' + probesSrc + ')');
    const out = [];
    const t0 = performance.now();
    let stop = false;
    const tick = () => {
      const t = performance.now() - t0;
      out.push({ t: +t.toFixed(1), v: probes() });
      if (!stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.__pmTraceStop = () => { stop = true; };
    await new Promise(r => setTimeout(r, ms));
    stop = true;
    return out;
  }, [probes, ms]);
}
