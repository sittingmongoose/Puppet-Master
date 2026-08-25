import { boot, W5 } from './rig.mjs';
import fs from 'fs';
const OUT = W5 + '/film';

const { b, p, errs } = await boot({});
const cdp = await p.context().newCDPSession(p);
let frames = [];
cdp.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
  frames.push({ data, at: Date.now(), ts: metadata && metadata.timestamp });
  try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch (e) { }
});

const N = await p.evaluate(() => window.PM56_DATA ? window.PM56_DATA.workingTakes.length : (document.querySelector('[data-family="2"]')?.max ? +document.querySelector('[data-family="2"]').max + 1 : 24));
console.log('takes:', N);

const takeNames = await p.evaluate(() => (window.PM56_DATA?.workingTakes || []).map(t => t.name || t.label || t.id || '?'));
console.log(takeNames.join(' | '));

const results = [];
const stills = [];

for (let v = 0; v < N; v++) {
  await p.evaluate((v) => { window.PM56_DEMO.setVariant(2, v); window.PM56_DEMO.setWorkStep(4); }, v);
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.working-card')?.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(350);

  const clip = await p.evaluate(() => {
    const c = document.querySelector('.working-card'); if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), width: Math.round(r.width), height: Math.round(Math.min(r.height, innerHeight - Math.max(0, r.top))) };
  });
  if (!clip) { results.push({ v, err: 'no card' }); continue; }

  // trail geometry, analytic (same method Wave 4 Orbit used)
  const trail = await p.evaluate(() => {
    const items = [...document.querySelectorAll('.pm-rail-item')];
    if (!items.length) return { n: 0 };
    const meas = (el) => {
      const svg = el.querySelector('svg'); if (!svg) return null;
      const r = svg.getBoundingClientRect();
      const vb = (svg.getAttribute('viewBox') || '0 0 24 24').split(/\s+/).map(Number);
      const sw = parseFloat(getComputedStyle(svg).strokeWidth) || 0;
      const t = getComputedStyle(el).transform;
      let sc = 1;
      if (t && t !== 'none') { const m = t.match(/matrix\(([^)]+)\)/); if (m) sc = parseFloat(m[1].split(',')[0]); }
      return { box: +el.getBoundingClientRect().width.toFixed(1), svg: +r.width.toFixed(2), sw, scale: +sc.toFixed(3), painted: +(sw * (r.width / (vb[2] || 24))).toFixed(3) };
    };
    const cur = items.find(i => i.classList.contains('current'));
    const rest = items.find(i => !i.classList.contains('current'));
    const track = document.querySelector('.wa-track');
    return {
      n: items.length,
      cur: cur ? meas(cur) : null, rest: rest ? meas(rest) : null,
      clipped: track ? (track.scrollWidth > track.clientWidth + 1) : null,
      trackW: track ? +track.clientWidth.toFixed(1) : null, contentW: track ? track.scrollWidth : null,
    };
  });

  // film the step advance
  frames = [];
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 3000, maxHeight: 2000, everyNthFrame: 1 });
  await p.waitForTimeout(200);
  const t0 = Date.now();
  await p.evaluate(() => window.PM56_DEMO.stepWorking());
  await p.waitForTimeout(950);
  await cdp.send('Page.stopScreencast');
  let post = frames.filter(f => f.at >= t0 - 8);
  if (post.every(f => f.ts != null)) post.sort((a, b) => a.ts - b.ts);
  if (post.length > 22) { const s = post.length / 22; post = Array.from({ length: 22 }, (_, i) => post[Math.floor(i * s)]); }

  const diff = await p.evaluate(async ([b64s, clip]) => {
    const imgs = [];
    for (const b of b64s) { const i = new Image(); i.src = 'data:image/png;base64,' + b; await i.decode(); imgs.push(i); }
    if (imgs.length < 2) return null;
    const S = imgs[0].width / innerWidth;
    const W = Math.min(360, Math.round(clip.width)), H = Math.min(300, Math.round(clip.height));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    const data = imgs.map(im => { g.clearRect(0, 0, W, H); g.drawImage(im, clip.x * S, clip.y * S, W * S, H * S, 0, 0, W, H); return g.getImageData(0, 0, W, H).data; });
    const d = (a, b) => { let s = 0, n = 0; for (let i = 0; i < a.length; i += 4) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n++; } return s / (n * 765); };
    const vs0 = data.map(x => +(d(data[0], x) * 100).toFixed(3));
    const consec = data.slice(1).map((x, i) => +(d(data[i], x) * 100).toFixed(3));
    return { vs0, consec, peak: Math.max(...vs0), settled: vs0[vs0.length - 1], moving: consec.filter(x => x > 0.05).length, n: imgs.length };
  }, [post.map(f => f.data), clip]);

  // rest still for the montage
  const still = await p.screenshot({ clip: { ...clip, height: Math.min(clip.height, 300) } });
  stills.push({ v, b64: still.toString('base64'), name: takeNames[v] || ('take ' + v) });

  results.push({ v, name: takeNames[v] || '', h: clip.height, trail, diff });
  console.log(`take ${String(v).padStart(2)} ${(takeNames[v] || '').slice(0, 22).padEnd(22)} h=${clip.height} discs=${trail.n} painted cur=${trail.cur?.painted} rest=${trail.rest?.painted} clip=${trail.clipped} | peak=${diff?.peak} settled=${diff?.settled} movingFrames=${diff?.moving}/${diff?.n}`);
}

fs.writeFileSync(W5 + '/takes.json', JSON.stringify(results, null, 1));

// montage of the 24 at-rest stills
for (let part = 0; part < Math.ceil(stills.length / 12); part++) {
  const grp = stills.slice(part * 12, part * 12 + 12);
  const png = await p.evaluate(async ([grp]) => {
    const imgs = [];
    for (const s of grp) { const i = new Image(); i.src = 'data:image/png;base64,' + s.b64; await i.decode(); imgs.push(i); }
    const cols = 4, dw = 300, pad = 5, lab = 15;
    const rows = Math.ceil(imgs.length / cols);
    const dhs = imgs.map(i => Math.round(i.height * (dw / i.width)));
    const rowH = [];
    for (let r = 0; r < rows; r++) rowH.push(Math.max(...dhs.slice(r * cols, r * cols + cols)));
    const c = document.createElement('canvas');
    c.width = cols * (dw + pad) + pad;
    c.height = rowH.reduce((a, x) => a + x + pad + lab, 0) + pad + 18;
    const g = c.getContext('2d');
    g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height);
    let y = 18 + pad;
    imgs.forEach((im, k) => {
      const r = Math.floor(k / cols), col = k % cols;
      if (col === 0 && k) y += rowH[r - 1] + pad + lab;
      const cx = pad + col * (dw + pad);
      g.drawImage(im, 0, 0, im.width, im.height, cx, y, dw, dhs[k]);
      g.strokeStyle = '#5a5a76'; g.strokeRect(cx - .5, y - .5, dw + 1, dhs[k] + 1);
      g.fillStyle = '#8fe3ff'; g.font = 'bold 11px monospace';
      g.fillText('take ' + grp[k].v + '  ' + grp[k].name.slice(0, 30), cx + 1, y + dhs[k] + 12);
    });
    g.fillStyle = '#ffe680'; g.font = 'bold 12px monospace'; g.fillText('working takes at rest', pad, 13);
    return c.toDataURL('image/png');
  }, [grp]);
  fs.writeFileSync(`${OUT}/takes-rest-${part}.png`, Buffer.from(png.split(',')[1], 'base64'));
  console.log('montage', part);
}
console.log('ERRORS', errs.length, errs.slice(0, 6));
await b.close();
