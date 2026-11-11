// FO-96 / F96-1 round 9 (opus-recheck-f96h): the rail's key focus ring (.d-abring, one element above every layer, placed
// on the focused tile by CSS anchor positioning since round 8) where its box-shadow paint is not enough.
//   forced colors: Windows High Contrast drops box-shadow, so round 8's ring was invisible there (Tab to Search changed
//     0 to 2 pixels of the tile), and background images, so NieR's target brackets (gradient corners) were too (round 10,
//     opus-recheck-f96i). With forced colors emulated, in all ten looks, the tile and 8 px round it (NieR's brackets sit
//     outside the item) must change on pixels between the focus off the bar and a Tab onto it: at least 60 pixels by more
//     than 40 levels (a 3 px ring round a 30 px tile is about 300; four 2 px corners about 140). Hover tags are hidden.
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
//   wheel flick (round 11, opus-recheck-f96i F3, K-i3): the clip must hold while the compositor scrolls. Names shown at
//     1280x500, the key focus on Files, a fast wheel flick down over the bar (Files leaves at the top) and back up, every
//     compositor frame (CDP screencast) read: the 8 rows just beyond the bar's scroll box, above and below it (the row next
//     to it included), may not change against the same rows before the flick by more than 3 pixels in any frame. Basic
//     Dark and Glass Light by default; e3ba1fee9c set the clip from a script on the bar's scroll, a frame or more behind.
//   opening motion (round 11, sol-recheck-f96j): the clip must hold while a cut, key-focused tile grows or shrinks.
//     Names shown at 1280x500, in Glass Light and Dark (Glass grows an opened tile to 1.08), Files cut by about a third at
//     the scroll box's top: a refocus (focus() without a scroll) then Ctrl+2 (Files shuts), and Ctrl+1, Enter and a click
//     (Files opens). The 8 rows above the scroll box are captured with the ring off first; then every compositor frame
//     from before the input to 1.5 s after it, through the growth and its settle, may not change there by more than 3
//     pixels. The lens layer and the hover tags are hidden for it, so only the ring can change those rows.
//     e3ba1fee9c, whose clip was set by script, left the whole ring above the bar after the refocus and Ctrl+2.
// All five tests on either surface (--set sandbox=1); --set looks= picks the looks.
import { decodePng } from '../helpers/activity-cover-pixels.mjs';
import { nierReticleEscape } from '../helpers/nier-reticle-escape.mjs';

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
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'retro-light', 'retro-dark', 'glass-light', 'glass-dark', 'nier-light', 'nier-dark'];
  await f.evaluate(() => { const st = document.createElement('style'); st.id = 'fo96-ring-tags'; st.textContent = '#pm-hover-tag-root { visibility: hidden !important; }'; document.head.appendChild(st); });
  for (const look of looks) {
    await settle(t, f, look);
    await t.page.emulateMedia({ forcedColors: 'active' });
    await f.waitForTimeout(300);
    const active = await f.evaluate(() => matchMedia('(forced-colors: active)').matches);
    await sentinel(f); await f.waitForTimeout(300);
    const box = await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox(), crop = { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 };
    const off = await shot(t, crop);
    const reached = await tabTo(t, f, 'search');
    await f.waitForTimeout(450);   /* NieR's reticle glides there in 150 ms */
    const box2 = await f.locator('#activityBar .icon[data-ab-id="search"] .symbol').boundingBox();
    const on = await shot(t, crop);
    const n = changed(off, on), moved = Math.abs(box2.x - box.x) > 0.5 || Math.abs(box2.y - box.y) > 0.5;
    t.log(`${look} forced colors ${active}: Tab onto Search changed ${n} pixels of its ${Math.round(box.width)}x${Math.round(box.height)} tile and 8 px round it${moved ? ' (the tile moved)' : ''}`);
    await t.check(`${look}: with forced colors, a Tab onto Search paints a visible focus mark (60 or more pixels of the tile and 8 px round it change)`, active && reached && !moved && n >= 60, JSON.stringify({ active, reached, moved, changed: n }));
    await t.page.emulateMedia({ forcedColors: 'none' });
    await sentinel(f);
  }
  await f.evaluate(() => { document.getElementById('fo96-ring-s')?.remove(); document.getElementById('fo96-ring-tags')?.remove(); });
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
    // what of the ring is painted: its box, cut by its own clip-path and by every ancestor's (round 11: a frame on the
    // scroll box clips it), as inset()s
    const insets = (e, r) => { const m = /inset\(([^)]*)\)/.exec(getComputedStyle(e).clipPath || ''); if (!m) return null; const v = m[1].trim().split(/\s+/).map(parseFloat);
      const [t, ri, bo, l] = v.length === 1 ? [v[0], v[0], v[0], v[0]] : v.length === 2 ? [v[0], v[1], v[0], v[1]] : v.length === 3 ? [v[0], v[1], v[2], v[1]] : v; return { top: r.top + t, right: r.right - ri, bottom: r.bottom - bo, left: r.left + l }; };
    let paint = rr && { top: rr.top, right: rr.right, bottom: rr.bottom, left: rr.left };
    for (let e = ring; paint && e && e !== document.body; e = e.parentElement) { const c = insets(e, e.getBoundingClientRect()); if (c) paint = { top: Math.max(paint.top, c.top), right: Math.min(paint.right, c.right), bottom: Math.min(paint.bottom, c.bottom), left: Math.max(paint.left, c.left) }; }
    const top = b.top + bar.clientTop, left = b.left + bar.clientLeft;
    return { box: { top, left, bottom: top + bar.clientHeight, right: left + bar.clientWidth }, scrollTop: bar.scrollTop, scrollMax: bar.scrollHeight - bar.clientHeight, sym: { top: s.top, left: s.left, bottom: s.bottom, right: s.right, height: s.height },
      ring: rr && { top: rr.top, left: rr.left, bottom: rr.bottom, right: rr.right, width: rr.width }, shown: !!rr && cs.display !== 'none' && rr.width > 4,
      painted: paint, clip: cs ? cs.clipPath + (ring.parentElement && ring.parentElement !== document.body ? ' / frame ' + getComputedStyle(ring.parentElement).clipPath : '') : null,
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
    const top = Math.floor(g.ring.top), h = Math.floor(g.box.top) - top;   /* up to and with the row next to the box (K-i2) */
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
    // round 10 (opus-recheck-f96i): opening the partly cut, key-focused Files' panel (Ctrl+1, Enter, a click) lifts its
    // tile after the press (Glass: 1.08); the clip, then measured on the tile, stayed stale. Search is opened first
    // (Ctrl+2, the key focus kept on Files) and the cut checked again; after each opening, the same two checks.
    if (/^glass-/.test(look) || t.args.openAll) for (const how of ['Control+1', 'Enter', 'click']) {
      await t.page.keyboard.press('Control+2'); await f.waitForTimeout(900);
      if (!(await geo()).keyFocus) { await tabTo(t, f, 'files'); await f.waitForTimeout(300); }
      let q = await geo();
      if (!(q.box.top - q.sym.top > 2)) { await f.evaluate(d => { document.getElementById('activityBar').scrollTop += d; }, q.sym.top - q.box.top + q.sym.height / 3); await f.waitForTimeout(400); q = await geo(); }
      const c0 = q.box.top - q.sym.top;
      if (how === 'click') { const b = await f.locator('#activityBar .icon[data-ab-id="files"] .symbol').boundingBox(); await t.page.mouse.click(b.x + b.width / 2, b.y + b.height * 0.75); await t.page.mouse.move(1240, 480); }
      else await t.page.keyboard.press(how);
      await f.waitForTimeout(1200);
      q = await geo();
      const opened = await f.evaluate(() => { const v = document.getElementById(document.querySelector('#activityBar .icon[data-ab-id="files"]').getAttribute('data-target')); return !!v && v.classList.contains('active'); });
      // inside the scroll box, and cut exactly at its edge (a clip measured mid-change also hid ring that shows)
      const ok = q.painted.top >= q.box.top - 0.5 && q.painted.bottom <= q.box.bottom + 0.5 && q.painted.left >= q.box.left - 0.5 && q.painted.right <= q.box.right + 0.5
        && (q.ring.top >= q.box.top || Math.abs(q.painted.top - q.box.top) <= 0.5);
      let px = null;
      const top2 = Math.floor(q.ring.top), h2 = Math.floor(q.box.top) - top2;
      if (h2 >= 2) { const r = { x: Math.floor(q.ring.left), y: top2, width: Math.ceil(q.ring.width), height: h2 }; const w = await shot(t, r); await sentinel(f); await f.waitForTimeout(400); const wo = await shot(t, r); px = changed(w, wo); }
      t.log(`${look} opening Files by ${how} while cut ${c0.toFixed(1)} px: ${JSON.stringify({ opened, keyFocus: q.keyFocus, clip: q.clip, painted: q.painted, box: q.box, beyond: px })}`);
      await t.check(`${look}: opening the partly cut, key-focused Files by ${how} leaves its ring clipped at the scroll box's edge`, opened && c0 > 2 && q.keyFocus && ok && (px === null || px <= 3), JSON.stringify({ opened, cut: c0, keyFocus: q.keyFocus, painted: q.painted, box: q.box, clip: q.clip, beyond: px }));
      if (px !== null) { await tabTo(t, f, 'files'); await f.waitForTimeout(300); }
    }
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

async function wheelFlick(t) {
  await t.viewport(1280, 500);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1240, 480);
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'glass-light'];
  const cdp = await t.page.context().newCDPSession(t.page);
  let frames = null;
  cdp.on('Page.screencastFrame', e => { cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); if (frames) frames.push({ wall: e.metadata.timestamp * 1000, data: e.data }); });
  await f.evaluate(() => { const st = document.createElement('style'); st.id = 'fo96-ring-tags'; st.textContent = '#pm-hover-tag-root { visibility: hidden !important; }'; document.head.appendChild(st); });
  for (const look of looks) {
    await settle(t, f, look);
    if (await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed'))) { await f.evaluate(() => document.getElementById('activityBarToggle').click()); await f.waitForTimeout(700); }
    await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
    const reached = await tabTo(t, f, 'files'); await f.waitForTimeout(400);
    // the bar's scroll box in the window's pixels (the app frame is offset in the sandbox)
    const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
    const g = await f.evaluate(() => { const bar = document.getElementById('activityBar'), b = bar.getBoundingClientRect(); return { left: b.left + bar.clientLeft, top: b.top + bar.clientTop, width: bar.clientWidth, height: bar.clientHeight, max: bar.scrollHeight - bar.clientHeight }; });
    const L = Math.floor(off.x + g.left), W = Math.ceil(g.width), T = Math.floor(off.y + g.top), B = Math.ceil(off.y + g.top + g.height);
    const strips = [{ name: 'above', y: T - 8, h: 8 }, { name: 'below', y: B, h: 8 }];
    const cut = (im, s) => { const d = []; for (let y = s.y; y < s.y + s.h; y++) for (let x = L; x < L + W; x++) { const i = (y * im.width + x) * 4; d.push(im.data[i], im.data[i + 1], im.data[i + 2]); } return d; };
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 3) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 40) n++; return n; };
    const ref = decodePng(await t.page.screenshot());
    const refs = strips.map(s => cut(ref, s));
    const bb = await f.locator('#activityBar').boundingBox();
    await t.page.mouse.move(off.x + bb.x + bb.width / 2, off.y + bb.y + bb.height * 0.6);
    frames = []; await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    for (let i = 0; i < 25 && !frames.length; i++) await f.waitForTimeout(20);
    for (let i = 0; i < 8; i++) await t.page.mouse.wheel(0, 90);   /* a fast flick down: Files leaves at the top */
    await f.waitForTimeout(400);
    for (let i = 0; i < 8; i++) await t.page.mouse.wheel(0, -90);  /* and back */
    await f.waitForTimeout(600);
    await cdp.send('Page.stopScreencast').catch(() => {}); const got = frames.sort((p, q) => p.wall - q.wall); frames = null;
    await t.page.mouse.move(1240, 480);
    const bad = []; let seen = 0;
    for (const fr of got) { const im = decodePng(Buffer.from(fr.data, 'base64')); seen++;
      strips.forEach((s, k) => { const n = diff(cut(im, s), refs[k]); if (n > 3) bad.push({ ms: Math.round(fr.wall - got[0].wall), strip: s.name, changed: n }); }); }
    const st = await f.evaluate(() => ({ scrollTop: document.getElementById('activityBar').scrollTop, keyFocus: document.activeElement?.getAttribute('data-ab-id') === 'files' && document.activeElement.matches(':focus-visible') }));
    t.log(`${look} wheel flick: ${seen} frames, scroll max ${g.max}, ${bad.length} strip reads changed ${bad.length ? JSON.stringify(bad.slice(0, 6)) : ''}; after ${JSON.stringify(st)}`);
    await t.check(`${look}: through a fast wheel flick with the key focus on Files, nothing of the ring is painted beyond the bar's scroll box in any frame`, reached && seen >= 5 && g.max > 100 && bad.length === 0, JSON.stringify({ reached, frames: seen, max: g.max, bad: bad.slice(0, 6) }));
    await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
    if (!(await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed')))) { await f.evaluate(() => document.getElementById('activityBarToggle').click()); await f.waitForTimeout(500); }
  }
  await cdp.detach().catch(() => {});
  await f.evaluate(() => { document.getElementById('fo96-ring-tags')?.remove(); document.getElementById('fo96-ring-s')?.remove(); });
}

async function openingMotion(t) {
  await t.viewport(1280, 500);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch (e) { /* none */ } });
  await t.page.mouse.move(1240, 480);
  const looks = t.args.looks ? String(t.args.looks).split(',') : ['glass-light', 'glass-dark'];
  const cdp = await t.page.context().newCDPSession(t.page);
  let frames = null;
  cdp.on('Page.screencastFrame', e => { cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); if (frames) frames.push({ wall: e.metadata.timestamp * 1000, data: e.data }); });
  await f.evaluate(() => { const st = document.createElement('style'); st.id = 'fo96-ring-quiet'; st.textContent = '#pm-hover-tag-root, #lg-lenses { visibility: hidden !important; }'; document.head.appendChild(st); });
  const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  const files = () => f.evaluate(() => { const bar = document.getElementById('activityBar'), b = bar.getBoundingClientRect(), s = document.querySelector('#activityBar .icon[data-ab-id="files"] .symbol').getBoundingClientRect(), i = document.querySelector('#activityBar .icon[data-ab-id="files"]'), v = document.getElementById(i.getAttribute('data-target'));
    return { top: b.top + bar.clientTop, left: b.left + bar.clientLeft, width: bar.clientWidth, scrollTop: bar.scrollTop, symTop: s.top, symH: s.height, symX: s.left + s.width / 2, symBottom: s.bottom, open: !!v && v.classList.contains('active'), keyFocus: document.activeElement === i && i.matches(':focus-visible') }; });
  for (const look of looks) {
    await settle(t, f, look);
    if (await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed'))) { await f.evaluate(() => document.getElementById('activityBarToggle').click()); await f.waitForTimeout(700); }
    await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
    const reached = await tabTo(t, f, 'files');
    for (const route of ['refocus, then Control+2', 'Control+1', 'Enter', 'click']) {
      await t.page.keyboard.press(route.endsWith('Control+2') ? 'Control+1' : 'Control+2'); await f.waitForTimeout(900);   /* the panel to start from */
      await sentinel(f);                                                                                       /* the ring off */
      let g = await files();
      await f.evaluate(d => { document.getElementById('activityBar').scrollTop += d; }, g.symTop - g.top + g.symH / 3); await f.waitForTimeout(400);
      g = await files();
      const L = Math.floor(off.x + g.left), W = Math.ceil(g.width), T = Math.floor(off.y + g.top), strip = { y: T - 8, h: 8 };
      const cut = im => { const d = []; for (let y = strip.y; y < strip.y + strip.h; y++) for (let x = L; x < L + W; x++) { const i = (y * im.width + x) * 4; d.push(im.data[i], im.data[i + 1], im.data[i + 2]); } return d; };
      const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 3) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 40) n++; return n; };
      const ref = cut(decodePng(await t.page.screenshot()));
      await f.evaluate(() => document.querySelector('#activityBar .icon[data-ab-id="files"]').focus({ preventScroll: true }));   /* the refocus */
      await f.waitForTimeout(250);
      const before = await files(), wasCut = before.top - before.symTop;
      frames = []; await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
      for (let i = 0; i < 25 && !frames.length; i++) await f.waitForTimeout(20);
      if (route === 'click') { await t.page.mouse.click(off.x + before.symX, off.y + (before.top + before.symBottom) / 2); await t.page.mouse.move(1240, 480); }
      else await t.page.keyboard.press(route.replace('refocus, then ', ''));
      await f.waitForTimeout(1500);
      await cdp.send('Page.stopScreencast').catch(() => {}); const got = frames.sort((p, q) => p.wall - q.wall); frames = null;
      const bad = []; for (const fr of got) { const n = diff(cut(decodePng(Buffer.from(fr.data, 'base64'))), ref); if (n > 3) bad.push({ ms: Math.round(fr.wall - got[0].wall), changed: n }); }
      const after = await files();
      t.log(`${look} opening motion, ${route}: cut ${wasCut.toFixed(1)} px, key focus ${before.keyFocus}, Files ${before.open ? 'open' : 'shut'} -> ${after.open ? 'open' : 'shut'}, ${got.length} frames, ${bad.length} with ring above the box ${bad.length ? JSON.stringify(bad.slice(0, 6)) : ''}`);
      await t.check(`${look}: ${route} on the cut, key-focused Files paints none of the ring above the bar's scroll box in any frame`,
        reached && before.keyFocus && wasCut > 2 && wasCut < before.symH - 2 && got.length >= 5 && after.open === !route.endsWith('Control+2') && bad.length === 0,
        JSON.stringify({ keyFocus: before.keyFocus, cut: wasCut, frames: got.length, opened: after.open, bad: bad.slice(0, 6) }));
      await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
    }
    if (!(await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed')))) { await f.evaluate(() => document.getElementById('activityBarToggle').click()); await f.waitForTimeout(500); }
  }
  await cdp.detach().catch(() => {});
  await f.evaluate(() => { document.getElementById('fo96-ring-quiet')?.remove(); document.getElementById('fo96-ring-s')?.remove(); });
}

export const tests = { 'forced colors': forcedColors, 'scroll box': scrollBox, 'pointer only': pointerOnly, 'wheel flick': wheelFlick, 'opening motion': openingMotion, 'NieR scroll box': nierReticleEscape };
