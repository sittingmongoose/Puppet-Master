import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
export const TARGET = process.env.PM56_TARGET || path.join(ROOT, 'index.html');

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
  await p.waitForTimeout(400);
  return { b, p, errs };
}

/** Dense filmer: keep ALL frames (no thinning). Appearance only for sheets. */
export function makeDenseFilmer(p, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  let cdp = null, frames = [];
  return {
    async attach() {
      cdp = await p.context().newCDPSession(p);
      cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
        frames.push({ data, at: Date.now(), ts: metadata?.timestamp ?? null });
        try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
      });
    },
    raw() { return frames; },
    async capture(ms, action) {
      frames = [];
      await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 2880, maxHeight: 1800, everyNthFrame: 1 });
      await p.waitForTimeout(120);
      const t0 = Date.now();
      if (action) await action();
      await p.waitForTimeout(ms);
      await cdp.send('Page.stopScreencast');
      let post = frames.filter(f => f.at >= t0 - 16);
      if (post.every(f => f.ts != null)) post.sort((a, b) => a.ts - b.ts);
      return post;
    },
    async sheet(name, post, clip, { cols = 8, scale = 1, maxLabel = 200 } = {}) {
      if (!post?.length || !clip) { console.log('SKIP sheet', name); return null; }
      const baseTs = post[0].ts != null ? post[0].ts * 1000 : post[0].at;
      const offsets = post.map(f => Math.round((f.ts != null ? f.ts * 1000 : f.at) - baseTs));
      // For very long captures, sheet still shows all frames but in a grid (may be large).
      const use = post.length > maxLabel
        ? Array.from({ length: maxLabel }, (_, i) => post[Math.floor(i * (post.length - 1) / (maxLabel - 1))])
        : post;
      const useOff = post.length > maxLabel
        ? Array.from({ length: maxLabel }, (_, i) => offsets[Math.floor(i * (offsets.length - 1) / (maxLabel - 1))])
        : offsets;
      const res = await p.evaluate(async ([b64s, clip, cols, offsets, title, scale]) => {
        const imgs = [];
        for (const b64 of b64s) {
          const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); imgs.push(i);
        }
        if (!imgs.length) return null;
        const S = imgs[0].width / innerWidth;
        const rows = Math.ceil(imgs.length / cols);
        const dw = Math.round(clip.width * scale), dh = Math.round(clip.height * scale);
        const pad = 4, lab = 13;
        const c = document.createElement('canvas');
        c.width = cols * (dw + pad) + pad;
        c.height = rows * (dh + pad + lab) + pad + 18;
        const g = c.getContext('2d');
        g.fillStyle = '#0c0c14'; g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#ffe680'; g.font = 'bold 11px monospace';
        g.fillText(title + '  n=' + imgs.length, pad, 13);
        imgs.forEach((im, k) => {
          const cx = pad + (k % cols) * (dw + pad);
          const cy = 18 + pad + Math.floor(k / cols) * (dh + pad + lab);
          g.drawImage(im, clip.x * S, clip.y * S, clip.width * S, clip.height * S, cx, cy, dw, dh);
          g.strokeStyle = '#444'; g.strokeRect(cx - .5, cy - .5, dw + 1, dh + 1);
          g.fillStyle = '#8fe3ff'; g.font = '10px monospace';
          g.fillText('#' + k + ' +' + offsets[k] + 'ms', cx + 1, cy + dh + 11);
        });
        return c.toDataURL('image/png');
      }, [use.map(f => f.data), clip, cols, useOff, name, scale]);
      if (!res) return null;
      const file = path.join(outDir, name + '.png');
      fs.writeFileSync(file, Buffer.from(res.split(',')[1], 'base64'));
      // also dump every raw frame for frame-by-frame review
      const dir = path.join(outDir, name + '-frames');
      fs.mkdirSync(dir, { recursive: true });
      for (let i = 0; i < post.length; i++) {
        fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), Buffer.from(post[i].data, 'base64'));
      }
      console.log(`${name}: ${post.length} raw frames, sheet ${use.length} tiles, ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
      return { n: post.length, sheet: use.length, file, dir, offsets };
    },
  };
}
