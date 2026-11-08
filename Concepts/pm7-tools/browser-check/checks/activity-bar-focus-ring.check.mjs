// FO-96 / F96-1 round 9 (opus-recheck-f96h): the rail's key focus ring (.d-abring, one element above every layer, placed
// on the focused tile by CSS anchor positioning since round 8) where its box-shadow paint is not enough.
//   forced colors: Windows High Contrast drops box-shadow, so round 8's ring was invisible there (Tab to Search changed
//     0 to 2 pixels of the tile). With forced colors emulated, the tile must change on pixels between the focus off the
//     bar and a Tab onto it (at least 100 pixels by more than 40 levels: a 3 px ring round a 30 px tile is about 330).
//   scroll box: the ring lies outside the bar, so the bar's scroll box does not clip it. With the names shown at
//     1280x500 the bar scrolls; a real wheel scrolls it until the key-focused Files is partly out of the scroll box, and
//     the ring must be clipped there: its painted box (the box less its clip-path) inside the scroll box, and nothing
//     painted beyond it (the strip of the ring's box outside the scroll box is captured with the ring and again with the
//     focus moved off without a scroll, and may not change). The hover tags are hidden for that capture: a key focus
//     opens one, and its coming or going is not the ring's.
//   pointer only (opus-recheck-f96h K-h1): a pointer focuses an icon without :focus-visible, so the ring must not show.
//     With no key focus anywhere, a real click on an unfocused icon, then pointer-only use (a click on another icon, the
//     pointer resting on a third), read in every frame after layout: the ring may not be drawn in any (its box laid out
//     on screen). The clicked tile is then captured focused by the pointer and again with the focus taken off by script
//     (nothing else changes), and may not change: a ring gated on :focus instead of :focus-visible fails both.
// All three tests on either surface (--set sandbox=1); --set looks= picks the looks.
import { decodePng } from '../helpers/activity-cover-pixels.mjs';

const settle = async (t, f, look) => {
  await t.app.look(look);
  await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {});
  await f.waitForTimeout(700);
};
// a 1 px button just before the bar takes the focus without scrolling anything, so a Tab from it walks the bar
const sentinel = f => f.evaluate(() => { let b = document.getElementById('fo96-ring-s'); if (!b) { b = document.createElement('button'); b.id = 'fo96-ring-s'; b.type = 'button'; b.setAttribute('aria-label', 'ring sentinel');
  Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0' }); const bar = document.getElementById('activityBar'); bar.parentNode.insertBefore(b, bar); } b.focus({ preventScroll: true }); });
const tabTo = async (t, f, k) => { await sentinel(f); for (let i = 0; i < 20; i++) { await t.page.keyboard.press('Tab'); if (await f.evaluate(k => document.activeElement?.getAttribute('data-ab-id') === k && document.activeElement.matches(':focus-visible'), k)) return true; } return false; };
const shot = async (t, r) => decodePng(await t.page.screenshot({ clip: { x: r.x, y: r.y, width: Math.max(1, r.width), height: Math.max(1, r.height) } }));
const changed = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 40) n++; return n; };

async function forcedColors(t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1880, 1040);
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['glass-light', 'basic-dark', 'friendly-light'];
  for (const look of looks) {
    await settle(t, f, look);
    await t.page.emulateMedia({ forcedColors: 'active' });
    await f.waitForTimeout(300);
    const active = await f.evaluate(() => matchMedia('(forced-colors: active)').matches);
    await sentinel(f); await f.waitForTimeout(300);
    const box = await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox();
    const off = await shot(t, box);
    const reached = await tabTo(t, f, 'search');
    await f.waitForTimeout(150);
    const box2 = await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox();
    const on = await shot(t, box);
    const n = changed(off, on), moved = Math.abs(box2.x - box.x) > 0.5 || Math.abs(box2.y - box.y) > 0.5;
    t.log(`${look} forced colors ${active}: Tab onto Search changed ${n} pixels of its ${Math.round(box.width)}x${Math.round(box.height)} tile${moved ? ' (the tile moved)' : ''}`);
    await t.check(`${look}: with forced colors, a Tab onto Search paints a visible focus ring (100 or more pixels of the tile change)`, active && reached && !moved && n >= 100, JSON.stringify({ active, reached, moved, changed: n }));
    await t.page.emulateMedia({ forcedColors: 'none' });
    await sentinel(f);
  }
  await f.evaluate(() => document.getElementById('fo96-ring-s')?.remove());
}

async function scrollBox(t) {
  await t.viewport(1280, 500);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1240, 480);
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['glass-light', 'basic-dark'];
  const geo = () => f.evaluate(() => {
    const bar = document.getElementById('activityBar'), b = bar.getBoundingClientRect(), s = document.querySelector('#activityBar .icon[data-ab-id="files"] .symbol').getBoundingClientRect();
    const ring = document.getElementById('d-abring'), rr = ring ? ring.getBoundingClientRect() : null, cs = ring ? getComputedStyle(ring) : null;
    const m = cs && /inset\(([^)]*)\)/.exec(cs.clipPath || ''), ins = m ? m[1].trim().split(/\s+/).map(parseFloat) : [0, 0, 0, 0];
    const [it, ir, ib, il] = ins.length === 1 ? [ins[0], ins[0], ins[0], ins[0]] : ins.length === 2 ? [ins[0], ins[1], ins[0], ins[1]] : ins.length === 3 ? [ins[0], ins[1], ins[2], ins[1]] : ins;
    const top = b.top + bar.clientTop, left = b.left + bar.clientLeft;
    return { box: { top, left, bottom: top + bar.clientHeight, right: left + bar.clientWidth }, scrollTop: bar.scrollTop, scrollMax: bar.scrollHeight - bar.clientHeight, sym: { top: s.top, left: s.left, bottom: s.bottom, right: s.right, height: s.height },
      ring: rr && { top: rr.top, left: rr.left, bottom: rr.bottom, right: rr.right, width: rr.width }, shown: !!rr && cs.display !== 'none' && rr.width > 4,
      painted: rr && { top: rr.top + it, right: rr.right - ir, bottom: rr.bottom - ib, left: rr.left + il }, clip: cs ? cs.clipPath : null,
      keyFocus: document.activeElement?.getAttribute('data-ab-id') === 'files' && document.activeElement.matches(':focus-visible') };
  });
  for (const look of looks) {
    await settle(t, f, look);
    if (await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed'))) {
      await f.evaluate(() => document.getElementById('activityBarToggle').click());
      await f.waitForFunction(() => !document.getElementById('activityBar').classList.contains('collapsed'), null, { timeout: 5000 }).catch(() => {});
      await f.waitForTimeout(700);
    }
    await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
    const reached = await tabTo(t, f, 'files');
    await f.waitForTimeout(300);
    let g = await geo();
    // a real wheel over the bar, until Files' tile is cut by about a third at the scroll box's top
    const want = g.sym.top - g.box.top + g.sym.height / 3, bb = await f.locator('#activityBar').boundingBox();
    await t.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height * 0.7);
    await t.page.mouse.wheel(0, want);
    await f.waitForTimeout(700);
    await t.page.mouse.move(1240, 480);
    await f.waitForTimeout(500);
    g = await geo();
    const cut = g.box.top - g.sym.top;
    t.log(`${look} scroll box: ${JSON.stringify({ reached, want: +want.toFixed(1), scrollTop: g.scrollTop, scrollMax: g.scrollMax, cut: +cut.toFixed(1), clip: g.clip, ring: g.ring, painted: g.painted, box: g.box })}`);
    await t.check(`${look}: names shown at 1280x500, the wheel leaves the key-focused Files partly out of the bar's scroll box`, reached && g.keyFocus && g.shown && cut > 2 && cut < g.sym.height - 2, JSON.stringify({ reached, keyFocus: g.keyFocus, shown: g.shown, cut, scrollTop: g.scrollTop, scrollMax: g.scrollMax }), { hard: true });
    const inside = g.painted.top >= g.box.top - 0.5 && g.painted.left >= g.box.left - 0.5 && g.painted.bottom <= g.box.bottom + 0.5 && g.painted.right <= g.box.right + 0.5;
    await t.check(`${look}: the ring's painted box (its box less its clip) lies inside the bar's scroll box`, inside, JSON.stringify({ painted: g.painted, box: g.box, clip: g.clip }));
    // the strip of the ring's box beyond the scroll box's top, with the ring and without it (the focus moved off, no scroll)
    await f.evaluate(() => { let st = document.getElementById('fo96-ring-tags'); if (!st) { st = document.createElement('style'); st.id = 'fo96-ring-tags'; st.textContent = '#pm-hover-tag-root { visibility: hidden !important; }'; document.head.appendChild(st); } });
    await f.waitForTimeout(300);
    const top = Math.floor(g.ring.top), h = Math.floor(g.box.top) - top - 1;
    let beyond = null;
    if (h >= 2) {
      const r = { x: Math.floor(g.ring.left), y: top, width: Math.ceil(g.ring.width), height: h };
      const withRing = await shot(t, r);
      await sentinel(f); await f.waitForTimeout(400);
      const g2 = await geo(), without = await shot(t, r);
      beyond = { region: r, changed: changed(withRing, without), scrollKept: Math.abs(g2.scrollTop - g.scrollTop) < 0.5 };
    }
    t.log(`${look} beyond the scroll box: ${JSON.stringify(beyond)}`);
    await t.check(`${look}: nothing of the ring is painted beyond the bar's scroll box (the strip of its box there does not change when it goes)`, !!beyond && beyond.scrollKept && beyond.changed <= 3, JSON.stringify(beyond));
    await f.evaluate(() => { document.getElementById('fo96-ring-tags')?.remove(); document.getElementById('activityBar').scrollTop = 0; });
    if (!(await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed')))) { await f.evaluate(() => document.getElementById('activityBarToggle').click()); await f.waitForTimeout(500); }
  }
  await f.evaluate(() => document.getElementById('fo96-ring-s')?.remove());
}

async function pointerOnly(t) {
  await t.viewport(1920, 1080);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1880, 1040);
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['glass-light', 'basic-dark'];
  const centre = async k => { const b = await f.locator(`#activityBar .icon[data-ab-id="${k}"] .symbol`).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  // every frame after layout (a ResizeObserver on a probe resized each frame), started before the input is sent
  const startRead = () => f.evaluate(() => {
    const P = window.__fo96p = { frames: 0, drawn: 0, at: [], done: false, stop: false }, t0 = performance.now(), probe = document.createElement('div');
    Object.assign(probe.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
    document.body.appendChild(probe);
    const ro = new ResizeObserver(() => { P.frames++;
      const g = document.getElementById('d-abring'); if (!g) return; const c = getComputedStyle(g), r = g.getBoundingClientRect();
      if (c.display !== 'none' && c.visibility !== 'hidden' && r.width > 4 && r.height > 4 && r.right > 0 && r.bottom > 0) { P.drawn++; if (P.at.length < 6) P.at.push(Math.round(performance.now() - t0)); } });
    ro.observe(probe);
    let flip = false;
    const step = () => { flip = !flip; probe.style.width = flip ? '2px' : '1px'; if (!P.stop) requestAnimationFrame(step); else { ro.disconnect(); probe.remove(); P.done = true; } };
    requestAnimationFrame(step);
  });
  const stopRead = async () => { await f.evaluate(() => { window.__fo96p.stop = true; }); await f.waitForFunction(() => window.__fo96p.done, null, { timeout: 5000 }).catch(() => {}); return f.evaluate(() => { const P = window.__fo96p; return { frames: P.frames, drawn: P.drawn, at: P.at }; }); };
  for (const look of looks) {
    await settle(t, f, look);
    await f.evaluate(() => { document.activeElement?.blur?.(); });
    await t.page.mouse.move(1880, 1040); await f.waitForTimeout(300);
    await startRead();
    await t.page.mouse.click(...(await centre('search'))); await f.waitForTimeout(500);
    const after = await f.evaluate(() => ({ active: document.activeElement?.getAttribute('data-ab-id') || document.activeElement?.tagName, fv: !!document.activeElement?.matches?.(':focus-visible') }));
    await t.page.mouse.click(...(await centre('files'))); await f.waitForTimeout(500);
    await t.page.mouse.move(...(await centre('source'))); await f.waitForTimeout(600);
    await t.page.mouse.click(...(await centre('search'))); await f.waitForTimeout(500);
    await t.page.mouse.move(1880, 1040); await f.waitForTimeout(500);
    const read = await stopRead();
    t.log(`${look} pointer only: after the first click ${JSON.stringify(after)}, ${JSON.stringify(read)}`);
    await t.check(`${look}: a real click on an unfocused icon, then pointer-only use, draws the focus ring in no frame (and the clicked icon has no :focus-visible)`, after.active === 'search' && !after.fv && read.frames > 30 && read.drawn === 0, JSON.stringify({ after, read }));
    // the clicked tile focused by the pointer, then with the focus taken off by script: nothing else changes
    const box = await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox(), r = { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 };
    const focused = await f.evaluate(() => document.activeElement?.getAttribute('data-ab-id'));
    const a = await shot(t, r);
    await f.evaluate(() => document.activeElement?.blur?.()); await f.waitForTimeout(300);
    const b = await shot(t, r), n = changed(a, b);
    t.log(`${look} pointer only: Search focused by the pointer (${focused}) against no focus: ${n} pixels change`);
    await t.check(`${look}: an icon focused by the pointer looks as it does with no focus (no ring: 3 or fewer pixels change)`, focused === 'search' && n <= 3, JSON.stringify({ focused, changed: n }));
  }
}

export const tests = { 'forced colors': forcedColors, 'scroll box': scrollBox, 'pointer only': pointerOnly };
