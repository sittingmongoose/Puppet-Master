// FO-96: the Activity bar (the left rail, #activityBar) is worked by keys. Every Activity item and More is a button in
// the tab order, as in the product's other bars (the chat's Activity strip, its Activity domains toolbar, the title bar,
// the Debug transport): none of them roves with arrow keys. Each is named; Enter and Space work it as a real click does
// at that size; More also opens on ArrowDown, its menu takes the focus, and Escape gives it back to More. A key focus
// paints a mark on every side of the item's tile at 3:1 or more against what was painted there before, in every look,
// lit or not, collapsed or with the names shown, and never crosses or touches a name's letters (F96-1); NieR's mark is
// its four target brackets. Friendly Light's 3:1 is held back for FO-99. The chat strip's FO-76 sizer copies stay inert
// and out of the tab order. One test per size: 1920x1100 (everything), 1390x860, 1280x500, 1024x768 and 740x900 (all
// but the chat switch, the Docker drag and the chat strip, which are judged at 1920). Both surfaces (--set sandbox=0|1).
//   --set size=1280x500   --set looks=basic-dark,nier-light   --set crops=1   --set fo99=1 (Friendly Light held to 3:1)
import { LOOKS } from '../browser-check.config.mjs';

const frames = (f, n = 3) => f.evaluate(async n => { for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame); }, n);

// What has the focus, in the app's frame.
function focused() {
  const a = document.activeElement;
  if (!a || a === document.body) return { key: 'body' };
  const sizer = !!a.closest('.activity-sizer'), menu = a.closest('.pmr-menu');
  return { key: a.getAttribute('data-ab-id') || a.getAttribute('data-domain') || a.id || a.tagName.toLowerCase(), bar: !!a.closest('#activityBar'),
    sizer, menu: menu ? menu.getAttribute('data-pmr-menu') : null, wrap: !!a.closest('.activity-wrap'), label: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40) };
}

// A focusable 1 px button placed just before `sel`, out of flow, so one Tab from it is the first control after it.
function placeSentinel([sel, where]) {
  document.getElementById('fo96-sentinel')?.remove();
  const b = document.createElement('button');
  b.id = 'fo96-sentinel'; b.type = 'button'; b.setAttribute('aria-label', 'FO-96 sentinel');
  Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', padding: '0', border: '0', margin: '0', pointerEvents: 'none' });
  const ref = document.querySelector(sel);
  if (!ref) return false;
  ref.parentNode.insertBefore(b, where === 'after' ? ref.nextSibling : ref);
  return true;
}

// The rail's controls as a person sees them, in DOM order (the toggle is the bar's last control).
function railControls() {
  const shown = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  return [...document.querySelectorAll('#activityBar .icon[data-ab-id], #activityBar > .activity-bar-toggle')].filter(shown)
    .map(e => ({ key: e.getAttribute('data-ab-id') || e.id, target: e.getAttribute('data-target') }));
}

// The focus mark, judged from painted pixels (F96-1). The item, its tile (the symbol box) and 12 px round them are
// captured with the focus off the bar and again 450 ms after a real key puts the focus on it. A ring is judged per side
// of the tile, not by a median: across each side (6 px either side of the tile's edge), every scanline through the side's
// middle 60% is read, and the scanline counts when one of its pixels now stands at 3:1 or more against what was painted
// there before (WCAG 1.4.11); 90% of each side's scanlines must count, so a side the bar's edge cuts, a side in the
// accent of a lit tile, and a side missing altogether all fail. NieR marks a key focus with four target brackets
// (19-nier-parts.js, 3 px outside the item): each corner of the item must hold 6 or more such pixels.
const lum = (r, g, b) => { const c = [r, g, b].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrastAt = (rest, focus, x, y) => {
  if (x < 0 || y < 0 || x >= rest.width || y >= rest.height) return 1;
  const i = 4 * (y * rest.width + x), a = lum(rest.data[i], rest.data[i + 1], rest.data[i + 2]), c = lum(focus.data[i], focus.data[i + 1], focus.data[i + 2]);
  return (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
};
function boxOf(key) {
  const el = key === 'activityBarToggle' ? document.getElementById(key) : document.querySelector(`#activityBar .icon[data-ab-id="${key}"]`);
  if (!el) return null;
  const R = e => { const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; };
  // the name's own text (a block label's box spans the whole item, its letters do not)
  const n = el.querySelector(':scope > .icon-label'), sym = el.querySelector(':scope > .symbol');
  let l = null;
  if (n && getComputedStyle(n).display !== 'none' && n.getClientRects().length) { const g = document.createRange(); g.selectNodeContents(n); l = R(g); }
  const root = document.documentElement;
  return { item: R(el), tile: sym ? R(sym) : R(el), lit: el.classList.contains('active'), label: l,
    brackets: (root.getAttribute('data-o55-nier') === 'on' || /^nier/.test(root.getAttribute('data-theme') || '')) && /(^|\s)brackets(\s|$)/.test(root.getAttribute('data-o55-nier-parts') || '') };
}
// A side of the ring, read along scanlines across it (6 px either side of the tile's edge, through the middle 60% of
// the side). On each scanline the mark is the run of pixels that changed most on the key focus (by more than 40
// luminance levels) and now share one colour; the scanline counts when that run stands at 3:1 or more against what is
// beside it now (the better of its two sides, as opus-recheck-f96 measured: the 1 to 3 px beyond the run, past any
// blend). A side counts when 90% of its scanlines do. So a side the bar's edge cuts away, a side drawn in the accent on
// a lit accent tile (it barely changes), a side squeezed onto a tile's shadow (it barely changes either), and a side
// missing altogether all fail; a ring with a band of ground on its inner side passes on a lit tile and an unlit one. Region coordinates: the capture's
// origin is (ox, oy) in page pixels.
const Yv = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const ratio = (p, q) => (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05);
function scanline(rest, focus, pts) {
  const px = pts.map(([x, y]) => (x < 0 || y < 0 || x >= rest.width || y >= rest.height) ? null : 4 * (y * rest.width + x));
  let core = -1, best = 40;
  px.forEach((i, k) => { if (i == null) return; const d = Math.abs(Yv(focus.data, i) - Yv(rest.data, i)); if (d > best) { best = d; core = k; } });
  if (core < 0) return 0;
  const L = i => lum(focus.data[i], focus.data[i + 1], focus.data[i + 2]), Yc = Yv(focus.data, px[core]);
  let a = core, b = core;
  while (a > 0 && px[a - 1] != null && Math.abs(Yv(focus.data, px[a - 1]) - Yc) <= 25) a--;
  while (b < px.length - 1 && px[b + 1] != null && Math.abs(Yv(focus.data, px[b + 1]) - Yc) <= 25) b++;
  const lc = L(px[core]);
  const beside = (from, step) => { let m = 0; for (let k = 1; k <= 3; k++) { const j = from + step * k; if (j < 0 || j >= px.length || px[j] == null) break; m = Math.max(m, ratio(lc, L(px[j]))); } return m; };
  // the better of its two neighbours, as opus-recheck-f96 judged it: a two-tone mark has its ground band on one side
  return Math.max(beside(a, -1), beside(b, 1));
}
function sides(rest, focus, tile, ox, oy) {
  const L = Math.round(tile.x - ox), T = Math.round(tile.y - oy), Rr = Math.round(tile.x + tile.w - ox), B = Math.round(tile.y + tile.h - oy);
  const mid = (p, q) => { const out = []; for (let v = Math.round(p + (q - p) * 0.2); v < Math.round(p + (q - p) * 0.8); v++) out.push(v); return out; };
  const span = e => { const out = []; for (let v = e - 6; v < e + 6; v++) out.push(v); return out; };
  const side = lines => { const got = lines.map(pts => scanline(rest, focus, pts)).sort((p, q) => p - q); const n = got.length;
    return { share: n ? +(got.filter(v => v >= 3).length / n).toFixed(2) : 0, worst: n ? +got[0].toFixed(2) : 0, median: n ? +got[Math.floor(n / 2)].toFixed(2) : 0 }; };
  return {
    top: side(mid(L, Rr).map(x => span(T).map(y => [x, y]))),
    bottom: side(mid(L, Rr).map(x => span(B).map(y => [x, y]))),
    left: side(mid(T, B).map(y => span(L).map(x => [x, y]))),
    right: side(mid(T, B).map(y => span(Rr).map(x => [x, y]))),
  };
}
function corners(rest, focus, item, ox, oy) {
  const L = Math.round(item.x - ox), T = Math.round(item.y - oy), Rr = Math.round(item.x + item.w - ox), B = Math.round(item.y + item.h - oy);
  const corner = (cx, cy, dx, dy) => { let n = 0; for (let y = cy - 6; y < cy + 8; y++) for (let x = cx - 6; x < cx + 8; x++) { const xx = dx > 0 ? x : 2 * cx - x, yy = dy > 0 ? y : 2 * cy - y; if (contrastAt(rest, focus, xx, yy) >= 3) n++; } return n; };
  return { tl: corner(L, T, 1, 1), tr: corner(Rr, T, -1, 1), bl: corner(L, B, 1, -1), br: corner(Rr, B, -1, -1) };
}
// a mark passes when every side (every corner for NieR) is there at 3:1; `soft` (FO-99) asks only that every side changed
const markOk = (r, soft) => !!r && r.focused && (r.brackets ? Object.values(r.corners).every(n => n >= 6)
  : Object.values(r.sides).every(sd => soft ? sd.share >= 0.9 || sd.median > 1.5 : sd.share >= 0.9));
const brief = r => r && { key: r.key, lit: r.lit, focused: r.focused, ...(r.moved ? { moved: true } : {}), ...(r.brackets ? { corners: r.corners } : { sides: Object.fromEntries(Object.entries(r.sides).map(([k, v]) => [k, `${v.share} ${v.worst}-${v.median}`])) }), ...(r.name ? { name: r.name } : {}) };

// the name's letters: inside its text box, the pixels that stand out from the box's own ground (its most common
// colour) by more than 40 luminance levels, grown by 1 px so a ring that only touches a letter counts; none of them may
// change on a key focus. The region is the text box and 2 px round it.
function inkDiff(rest, focus, pad, tileBox) {
  const w = rest.width, h = rest.height, Y = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  const counts = new Map();
  for (let y = pad; y < h - pad; y++) for (let x = pad; x < w - pad; x++) { const i = 4 * (y * w + x), k = Math.round(Y(rest.data, i) / 8); counts.set(k, (counts.get(k) || 0) + 1); }
  const ground = 8 * [...counts.entries()].sort((p, q) => q[1] - p[1])[0][0];
  const ink = new Uint8Array(w * h); let letters = 0;
  for (let y = pad; y < h - pad; y++) for (let x = pad; x < w - pad; x++) if (Math.abs(Y(rest.data, 4 * (y * w + x)) - ground) > 40) { ink[y * w + x] = 1; letters++; }
  // tileBox (in the capture's pixels): where a name is laid out over its own tile (Glass at 1280x500, names shown,
  // on b79930bc40 as well) a mark drawn in the tile meets the letters there; those count apart, as base overlap
  let crossed = 0, overlap = 0;
  const inTile = (x, y) => !!tileBox && x >= tileBox.x && x < tileBox.x + tileBox.w && y >= tileBox.y && y < tileBox.y + tileBox.h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w && ink[yy * w + xx]) { near = true; break; } }
    if (!near) continue;
    const i = 4 * (y * w + x);
    if (Math.abs(Y(focus.data, i) - Y(rest.data, i)) > 40) { if (inTile(x, y)) overlap++; else crossed++; }
  }
  return { letters, crossed, overlap };
}
function panelState(key) {
  const ic = document.querySelector(`#activityBar .icon[data-ab-id="${key}"]`), slot = document.getElementById('sidePanelSlot');
  const view = ic && ic.getAttribute('data-target') && document.getElementById(ic.getAttribute('data-target'));
  return { active: !!ic && ic.classList.contains('active'), open: !!slot && !slot.classList.contains('hidden') && !!view && view.classList.contains('active') };
}
function moreState() {
  const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'), btn = document.getElementById('abMoreBtn');
  const shown = !!m && m.isConnected && getComputedStyle(m).display !== 'none' && m.getClientRects().length > 0;
  return { open: shown, expanded: btn && btn.getAttribute('aria-expanded'), items: shown ? [...m.querySelectorAll('.pmr-mi')].map(b => b.textContent.trim()) : [],
    focusIn: shown && m.contains(document.activeElement), focusOnMore: document.activeElement === btn };
}

const SIZES = [[1920, 1100], [1390, 860], [1280, 500], [1024, 768], [740, 900]];

async function run(t, w, h) {
  const full = w === 1920;
  await t.viewport(w, h);
  const f = await t.app.open();
  const kb = t.page.keyboard;
  const surface = (await f.evaluate(() => window.top !== window)) ? 'sandbox' : 'normal';
  const at = `${w}x${h}`;
  t.log(`surface ${surface}, ${at}`);
  await f.waitForFunction(() => !!document.getElementById('abMoreBtn') && !!document.querySelector('#activityBar .icon[data-ab-id]'), null, { timeout: 20000 });
  await frames(f);
  const key = () => f.evaluate(focused);
  const sentinel = async (sel, where = 'before') => { await f.evaluate(placeSentinel, [sel, where]); await f.locator('#fo96-sentinel').focus(); };
  const fe = surface === 'sandbox' ? await f.frameElement() : null, off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
  const rest = () => t.page.mouse.move(off.x + w - 30, off.y + h - 30);   /* the pointer away from the bar */

  // 1. Tab from just before the bar walks every visible control in order, then leaves; Shift+Tab walks back.
  const controls = await f.evaluate(railControls);
  t.log('rail controls ' + controls.map(c => c.key).join(' '));
  await sentinel('#activityBar');
  const forward = [];
  for (let i = 0; i < controls.length; i++) { await kb.press('Tab'); forward.push((await key()).key); }
  await kb.press('Tab');
  const after = await key();
  await t.check(`${at}: Tab reaches every Activity item and More in order`, JSON.stringify(forward) === JSON.stringify(controls.map(c => c.key)),
    `expected ${controls.map(c => c.key).join(' ')}; got ${forward.join(' ')}`);
  await t.check(`${at}: Tab leaves the bar after its last control`, !after.bar && !after.sizer, JSON.stringify(after));
  const back = [];
  for (let i = 0; i < controls.length; i++) { await kb.press('Shift+Tab'); back.push((await key()).key); }
  await t.check(`${at}: Shift+Tab walks the bar back`, JSON.stringify(back) === JSON.stringify(controls.map(c => c.key).reverse()), back.join(' '));

  // The painted mark on a control reached by a key. The control is reached by keys first, so the bar scrolls as it
  // will; the focus then steps to the sentinel without scrolling, the rest is captured, and a real Tab from the control
  // before it gives it the focus again with nothing left to scroll. The tile must not move between the two captures.
  // the control before it in the bar as it is now (at 1920 the Docker drag puts Docker back just before More)
  const before = async target => { const now = await f.evaluate(railControls), i = now.findIndex(c => c.key === target); return i > 0 ? now[i - 1].key : null; };
  const focusQuiet = k => f.evaluate(k => { const el = k ? (k === 'activityBarToggle' ? document.getElementById(k) : document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`)) : document.getElementById('fo96-sentinel'); if (el) el.focus({ preventScroll: true }); }, k);
  const painted = async (target) => {
    await sentinel('#activityBar');
    await byTab(target)();
    if ((await key()).key !== target) return { key: target, focused: false, unreached: true };
    await focusQuiet(null);
    await f.waitForTimeout(300);
    const b = await f.evaluate(boxOf, target);
    if (!b) return null;
    const u = { x: Math.min(b.item.x, b.tile.x), y: Math.min(b.item.y, b.tile.y), r: Math.max(b.item.x + b.item.w, b.tile.x + b.tile.w), b: Math.max(b.item.y + b.item.h, b.tile.y + b.tile.h) };
    const P = 12, x = Math.max(0, Math.floor(off.x + u.x) - P), y = Math.max(0, Math.floor(off.y + u.y) - P);
    const region = { x, y, width: Math.ceil(off.x + u.r) + P + 1 - x, height: Math.min(Math.ceil(off.y + u.b) + P + 1, Math.floor(off.y + h)) - y };
    // with the names shown, the name's own text box and 2 px round it: the mark must not cross or touch its letters
    const L = b.label, lr = L && { x: Math.floor(off.x + L.x) - 2, y: Math.floor(off.y + L.y) - 2, width: Math.ceil(L.w) + 5, height: Math.ceil(L.h) + 5 };
    const r0 = await t.pixels(region), l0 = lr && await t.pixels(lr);
    await focusQuiet(await before(target));
    await kb.press('Tab');
    await f.waitForTimeout(450);
    const now = await key();
    const r1 = await t.pixels(region), l1 = lr && await t.pixels(lr);
    // the item, not its tile, which a focused tile's own style may move by a fraction (Glass's press scale is lifted)
    const moved = await f.evaluate(([k, t0]) => { const el = k === 'activityBarToggle' ? document.getElementById(k) : document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`); const q = el.getBoundingClientRect(); return Math.abs(q.x - t0.x) + Math.abs(q.y - t0.y) > 0.5; }, [target, b.item]);
    const ox = region.x - off.x, oy = region.y - off.y;
    if (t.args.debug) {   /* the middle scanline of each side, rest -> focus, and what overlies the tile's edges */
      const tl = b.tile, cx = Math.round(tl.x + tl.w / 2 - ox), cy = Math.round(tl.y + tl.h / 2 - oy), Lx = Math.round(tl.x - ox), Ty = Math.round(tl.y - oy);
      const str = (img, pts) => pts.map(([x, y]) => { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return '-'; const i = 4 * (y * img.width + x); return `${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`; }).join(' ');
      const colPts = [...Array(Math.round(tl.h) + 12).keys()].map(k => [cx, Ty - 6 + k]), rowPts = [...Array(Math.round(tl.w) + 12).keys()].map(k => [Lx - 6 + k, cy]);
      t.log(`debug ${target} tile ${JSON.stringify(b.tile)} item ${JSON.stringify(b.item)} region ${JSON.stringify(region)}`);
      t.log(`debug ${target} col rest ${str(r0, colPts)}`); t.log(`debug ${target} col focus ${str(r1, colPts)}`);
      t.log(`debug ${target} row rest ${str(r0, rowPts)}`); t.log(`debug ${target} row focus ${str(r1, rowPts)}`);
      t.log(`debug ${target} state ` + JSON.stringify(await f.evaluate(k => { const ic = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = ic && ic.querySelector('.symbol'); if (!sym) return null; const c = getComputedStyle(sym);
        const ops = []; for (let n = sym; n && n !== document.documentElement; n = n.parentElement) { const q = getComputedStyle(n); if (q.opacity !== '1' || q.filter !== 'none') ops.push([n.id || String(n.className).slice(0, 30), q.opacity, q.filter]); }
        return { outline: c.outlineColor + ' ' + c.outlineStyle + ' ' + c.outlineWidth, shadow: c.boxShadow.slice(0, 80), ops, anims: [sym, ic, ...document.querySelectorAll('#activityBar .d-abind')].flatMap(e => e.getAnimations().map(a => [e.className, a.id || a.animationName || a.transitionProperty, a.playState, +(a.effect?.getComputedTiming?.().progress ?? -1).toFixed(2)])),
          overlays: [...document.querySelectorAll('body > *')].filter(e => { const q = getComputedStyle(e); if (q.pointerEvents !== 'none' || q.display === 'none' || q.visibility === 'hidden' || q.opacity === '0') return false; const r = e.getBoundingClientRect(), s = sym.getBoundingClientRect(); return r.right > s.left && r.left < s.right && r.bottom > s.top && r.top < s.bottom; }).map(e => (e.id || String(e.className).slice(0, 40)) + ' op ' + getComputedStyle(e).opacity) }; }, target)));
      t.log(`debug ${target} over ` + JSON.stringify(await f.evaluate(([x, y, w, hh]) => [[x + 1, y + hh / 2], [x + w / 2, y + 1], [x + w / 2, y + hh - 1]].map(([px, py]) => document.elementsFromPoint(px, py).slice(0, 3).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className?.baseVal ?? e.className).split(' ').slice(0, 2).join('.'))), [b.tile.x, b.tile.y, b.tile.w, b.tile.h])));
    }
    // the tile and 2 px round it (the mark's own edge, and the 1 px grown round each letter): a letter there is laid out
    // against the tile (Glass at 1280x500 with the names shown, b79930bc40 as well), and any mark on the tile meets it;
    // that counts as overlap, reported as base. A mark that reaches beyond it (a ring outside the tile or round the
    // item, as 7d1ef16b13 and 030240ea66 drew) still crosses
    const tileInName = lr && { x: b.tile.x + off.x - lr.x - 2, y: b.tile.y + off.y - lr.y - 2, w: b.tile.w + 4, h: b.tile.h + 4 };
    return { key: target, lit: b.lit, focused: now.key === target && !moved, moved, brackets: b.brackets,
      ...(b.brackets ? { corners: corners(r0, r1, b.item, ox, oy) } : { sides: sides(r0, r1, b.tile, ox, oy) }),
      ...(lr ? { name: inkDiff(l0, l1, 2, tileInName) } : {}) };
  };
  const byTab = target => async () => { for (let i = 0; i < controls.length; i++) { await kb.press('Tab'); if ((await key()).key === target) return; } };
  await rest();
  const paint1 = [];
  for (const c of controls) paint1.push(await painted(c.key));
  t.log(`${at} default look marks ` + JSON.stringify(paint1.map(brief)));
  const faint = paint1.filter(r => !markOk(r));
  await t.check(`${at}: each control shows a focus mark on every side at 3:1 or more on a key focus`, faint.length === 0, faint.length ? JSON.stringify(faint.map(brief)) : 'all ' + paint1.length);

  // 2. Each control is a named button (Playwright's own accessibility tree, as a screen reader gets it).
  const named = [];
  for (const c of controls) {
    const loc = c.key === 'activityBarToggle' ? f.locator('#activityBarToggle') : f.locator(`#activityBar .icon[data-ab-id="${c.key}"]`);
    const snap = (await loc.ariaSnapshot()).split('\n')[0];
    named.push({ key: c.key, snap, ok: /^- button "[^"]*[A-Za-z][^"]*"/.test(snap) });   // a word, not ">"
  }
  t.log('names ' + named.map(n => n.snap.replace(/^- /, '')).join(', '));
  const unnamed = named.filter(n => !n.ok);
  await t.check(`${at}: each control is a button with a name`, unnamed.length === 0, unnamed.length ? JSON.stringify(unnamed) : named.map(n => n.snap.replace(/^- /, '')).join(', '));

  // 3. Enter and Space work every panel item as a real click does at this size. Enter opens a shut panel. On an open
  // item a click closes its panel at 1920, but not below it (the rail folds over the page there and a press on the open
  // item keeps it, on b79930bc40 as well): Space is held to whatever a real click does on the open item, measured here.
  const tabTo = async target => {
    await sentinel('#activityBar');
    for (let i = 0; i < controls.length; i++) { await kb.press('Tab'); if ((await key()).key === target) return true; }
    return false;
  };
  for (const c of controls.filter(c => c.target)) {
    let reached = await tabTo(c.key);
    let s0 = await f.evaluate(panelState, c.key);
    if (reached && s0.open) {   /* start from its panel shut: open another first */
      const other = controls.find(o => o.target && o.key !== c.key);
      if (other && await tabTo(other.key)) { await kb.press('Enter'); await frames(f, 4); }
      reached = await tabTo(c.key); s0 = await f.evaluate(panelState, c.key);
    }
    if (reached) { await kb.press('Enter'); await frames(f, 4); }
    const s1 = await f.evaluate(panelState, c.key);
    // a real click on the open item, then back to open by a key if the click shut it
    await f.locator(`#activityBar .icon[data-ab-id="${c.key}"]`).click(); await frames(f, 4); await f.waitForTimeout(150);
    const clicked = await f.evaluate(panelState, c.key);
    if (!clicked.open && await tabTo(c.key)) { await kb.press('Enter'); await frames(f, 4); }
    reached = reached && await tabTo(c.key);
    const s2a = await f.evaluate(panelState, c.key);
    if (reached) { await kb.press(' '); await frames(f, 4); await f.waitForTimeout(150); }
    const s2 = await f.evaluate(panelState, c.key);
    const still = await key();
    const enterOk = reached && !s0.open && s1.active && s1.open, spaceOk = s2a.open && s2.open === clicked.open && s2.active === clicked.active;
    if (clicked.open) t.log(`${at} ${c.key}: a real click on the open item keeps its panel here (base behaviour, b79930bc40 too); Space does the same`);
    await t.check(`${at} ${c.key}: Enter opens its panel, Space on the open item does what a real click does`, enterOk && spaceOk && still.key === c.key,
      JSON.stringify({ reached, before: s0, enter: s1, click: clicked, space: s2, focus: still.key }));
  }
  // leave Files open, as the page starts
  if (controls.some(c => c.key === 'files') && !(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
  if (full && controls.some(c => c.key === 'chat')) {
    const chatState = () => f.evaluate(() => ({ lit: document.querySelector('#activityBar .icon[data-ab-id="chat"]').classList.contains('active'), width: Math.round(document.getElementById('chatPanel')?.getBoundingClientRect().width || 0) }));
    const reached = await tabTo('chat');
    const c0 = await chatState();
    if (reached) { await kb.press('Enter'); await f.waitForTimeout(900); }
    const c1 = await chatState();
    if (reached) { await kb.press(' '); await f.waitForTimeout(900); }
    const c2 = await chatState();
    await t.check('chat: Enter and Space switch the chat column', reached && c1.lit !== c0.lit && (c1.width > 0) === c1.lit && c2.lit === c0.lit && (c2.width > 0) === c2.lit,
      JSON.stringify({ reached, before: c0, enter: c1, space: c2 }));
  }

  // 4. More opens its menu on Enter, Space and ArrowDown, the focus goes into it, Escape returns it to More. First with
  // nothing hidden (the menu says how to hide an icon), then (at 1920) with Docker dragged onto More by the real
  // pointer, where the focus lands on the hidden icon's row and Enter on it puts the icon back.
  // the menu closes through its exit motion: judge it once that has run
  const menuGone = () => f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !m || !m.isConnected || !m.getClientRects().length || getComputedStyle(m).display === 'none'; }, null, { timeout: 2000 }).catch(() => {});
  const moreCase = async label => {
    for (const k of ['Enter', ' ', 'ArrowDown']) {
      const reached = await tabTo('more');
      if (reached) { await kb.press(k); await f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !!m && m.getClientRects().length > 0 && m.contains(document.activeElement); }, null, { timeout: 2000 }).catch(() => {}); }
      const open = await f.evaluate(moreState);
      if (reached) { await kb.press('Escape'); await menuGone(); }
      const closed = await f.evaluate(moreState);
      await t.check(`${at} More ${label}: ${k === ' ' ? 'Space' : k} opens its menu with the focus in it, Escape returns the focus to More`,
        reached && open.open && open.focusIn && open.expanded === 'true' && !closed.open && closed.focusOnMore && closed.expanded !== 'true',
        JSON.stringify({ reached, open, closed }));
      if (open.open && !closed.open) continue;
      await f.evaluate(() => { try { PMR.menu.closeAll(); } catch (e) { /* none */ } });
    }
  };
  await moreCase('with nothing hidden');
  if (full) {
    const box = async sel => { const b = await f.locator(sel).boundingBox(); return b && { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
    const docker = await box('#activityBar .icon[data-ab-id="docker"]'), moreAt = await box('#abMoreBtn');
    if (docker && moreAt) {
      await t.page.mouse.move(docker.x, docker.y); await t.page.mouse.down();
      for (let i = 1; i <= 12; i++) await t.page.mouse.move(docker.x + (moreAt.x - docker.x) * i / 12, docker.y + (moreAt.y - docker.y) * i / 12);
      await t.page.mouse.up();
      await rest();
      await frames(f, 4);
      const hidden = await f.evaluate(() => !document.querySelector('#activityBar .icon[data-ab-id="docker"]') && document.getElementById('abMoreBtn').getAttribute('data-empty') === '0');
      await t.check('Docker dragged onto More is hidden', hidden, hidden ? 'hidden' : 'still on the bar');
      if (hidden) {
        await moreCase('with Docker hidden');
        const reached = await tabTo('more');
        if (reached) { await kb.press('ArrowDown'); await f.waitForTimeout(400); }
        const open = await f.evaluate(moreState);
        const onRow = await key();
        if (reached && open.open) { await kb.press('Enter'); await menuGone(); await frames(f, 4); }
        t.log('More menu with Docker hidden: rows ' + JSON.stringify(open.items) + ', focus on ' + JSON.stringify(onRow));
        const back = await f.evaluate(() => !!document.querySelector('#activityBar .icon[data-ab-id="docker"]'));
        const end = await f.evaluate(moreState);
        await t.check('More: the hidden icon\'s row, named and not its raw id, takes the focus and Enter puts Docker back, the focus on More',
          reached && open.open && open.items.length === 1 && /docker/i.test(open.items[0]) && open.items[0] !== 'docker' && onRow.menu === 'd-ab-more' && back && !end.open && end.focusOnMore,
          JSON.stringify({ reached, open, onRow, back, end }));
      }
    } else await t.check('Docker and More on the bar for the drag', false, JSON.stringify({ docker, moreAt }));
  } else t.log(`${at}: the Docker drag and the chat switch are judged at 1920 (at 1280x500 More is below the window)`);

  // 5. (1920) The chat's Activity strip: its items are buttons in the tab order, in order, and the FO-76 sizer copies
  // are inert, unfocusable and never reached by Tab or Shift+Tab.
  if (full) {
    await f.evaluate(() => { try { PMW.chatCol.setKeepOpen(true); } catch (e) { /* older page */ } PMW.chatCol.show(); PM56_DEMO.selectThread('query'); });
    await f.waitForFunction(() => !!document.querySelector('#pmRoot :is(.activity-bar, .pm56-activity-bar) .activity-item') && document.getElementById('chatPanel').getBoundingClientRect().width > 0, null, { timeout: 15000 });
    await t.settle(); await frames(f, 4);
    const strip = await f.evaluate(() => {
      const live = [...document.querySelectorAll('#pmRoot :is(.activity-bar, .pm56-activity-bar)')].find(b => !b.closest('.activity-sizer'));
      const sizer = live.parentElement.querySelector(':scope > .activity-sizer');
      const items = [...live.querySelectorAll(':scope > .activity-item')].filter(e => e.getClientRects().length).map(e => e.getAttribute('data-domain'));
      if (!sizer) return { items, sizer: null };
      const focusables = [...sizer.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')];
      const took = focusables.filter(e => { e.focus(); return document.activeElement === e; }).length;
      return { items, sizer: { inert: sizer.inert, ariaHidden: sizer.getAttribute('aria-hidden'), copies: sizer.querySelectorAll('.activity-item').length, focusables: focusables.length, negative: focusables.every(e => e.tabIndex < 0), took, more: sizer.querySelectorAll('[data-ab-id="more"], #abMoreBtn').length } };
    });
    t.log('chat strip ' + JSON.stringify(strip));
    if (strip.sizer) await t.check('chat strip sizer copies are inert and take no focus', strip.sizer.inert && strip.sizer.ariaHidden === 'true' && strip.sizer.copies > 0 && strip.sizer.negative && strip.sizer.took === 0 && strip.sizer.more === 0, JSON.stringify(strip.sizer));
    else t.log('chat strip has no FO-76 sizer on this page (main before FO-76): copies not checked');
    await f.evaluate(placeSentinel, ['#pmRoot .activity-wrap', 'before']);
    await f.locator('#fo96-sentinel').focus();
    const sForward = [];
    for (let i = 0; i <= strip.items.length; i++) { await kb.press('Tab'); sForward.push(await key()); }
    const sBack = [];
    for (let i = 0; i <= strip.items.length; i++) { await kb.press('Shift+Tab'); sBack.push(await key()); }
    const inSizer = [...sForward, ...sBack].filter(k => k.sizer);
    await t.check('chat strip: Tab walks its items in order, then leaves it, never into the sizer',
      JSON.stringify(sForward.slice(0, strip.items.length).map(k => k.key)) === JSON.stringify(strip.items) && !sForward[strip.items.length].wrap && inSizer.length === 0,
      JSON.stringify({ items: strip.items, forward: sForward.map(k => k.key + (k.sizer ? '(sizer)' : '')) }));
    await t.check('chat strip: Shift+Tab walks it back and out, never into the sizer',
      JSON.stringify(sBack.slice(0, strip.items.length).map(k => k.key)) === JSON.stringify([...strip.items].reverse()) && !sBack[strip.items.length].wrap,
      JSON.stringify(sBack.map(k => k.key + (k.sizer ? '(sizer)' : ''))));
    await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove());
  } else await f.evaluate(() => PMW.chatCol.show());   /* Chat lit, as at 1920 */

  // 6. The painted focus mark in every look, on the two items lit by default (Chat, while the chat column shows, and
  // Files, the open panel; F96-1), an unlit item (Search) and More; then with the bar's names shown, on lit Files,
  // Search and Pipelines (its p is the bar's lowest letter), none of whose letters may be crossed or touched. Friendly
  // Light's accent is under 3:1 on its own ground (FO-99, logged for batch 8): there each side must change and the
  // contrast is logged, unless --set fo99=1 holds it to 3:1.
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
  for (const look of looks) {
    await t.app.look(look);
    // a look change plays under a cover (NieR's switch-on reboots the screen), and NieR's brackets hold off until that
    // cover has gone, which is after it reports itself uncovered at the reveal (19-nier-parts.js rbRelease)
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.() &&
      window.PM_NIER?.wanted?.() === window.PM_NIER?.on?.() && !document.getElementById('o55np-reboot'), null, { timeout: 20000 }).catch(() => {});
    await frames(f, 4);
    await rest();
    const known = look === 'friendly-light' && !t.args.fo99;
    const ok = r => markOk(r, known);
    const rows = [await painted('chat'), await painted('files'), await painted('search'), await painted('more')];
    t.log(`${at} ${look} marks ${JSON.stringify(rows.map(brief))}`);
    await t.check(`${at} ${look}: Chat and Files are lit, Search and More are not`, rows[0]?.lit && rows[1]?.lit && rows[2] && !rows[2].lit && rows[3] && !rows[3].lit, JSON.stringify(rows.map(r => r && [r.key, r.lit])));
    await t.check(`${at} ${look}: a key focus mark on every side ${known ? '(3:1 held back for FO-99)' : 'at 3:1 or more'} on lit Chat and Files, on Search and on More`, rows.every(ok), JSON.stringify(rows.map(brief)));
    // the bar with its names shown (the toggle)
    await f.evaluate(() => document.getElementById('activityBarToggle').click());
    await f.waitForFunction(() => !document.getElementById('activityBar').classList.contains('collapsed'), null, { timeout: 5000 }).catch(() => {});
    await f.waitForTimeout(900);
    const wide = [await painted('files'), await painted('search'), await painted('repository_automation')];
    t.log(`${at} ${look} names shown, marks ${JSON.stringify(wide.map(brief))}`);
    await t.check(`${at} ${look}, names shown: a key focus mark on every side ${known ? '(FO-99)' : 'at 3:1 or more'} on lit Files, on Search and on Pipelines, and no name's letters are crossed or touched`,
      wide.every(ok) && wide[0]?.lit && wide.every(r => r && r.name && r.name.letters >= 15 && r.name.crossed === 0), JSON.stringify(wide.map(brief)));
    for (const r of wide) if (r?.name?.overlap) t.log(`${at} ${look} ${r.key}: the name is laid out over its own tile here (base layout, b79930bc40 as well), so ${r.name.overlap} px of its letters inside the tile change with the tile's mark; not counted as crossed`);
    if (t.args.crops) {
      await sentinel('#activityBar'); await byTab('files')(); await f.waitForTimeout(450);
      await t.crop(`${at}-names-files-${surface}-${look}`, f.locator('#activityBar'), `${at} ${look}: names shown, lit Files with the key focus mark`);
    }
    await f.evaluate(() => document.getElementById('activityBarToggle').click());
    await f.waitForFunction(() => document.getElementById('activityBar').classList.contains('collapsed'), null, { timeout: 5000 }).catch(() => {});
    await f.waitForTimeout(900);
    if (t.args.crops) {
      await sentinel('#activityBar'); await byTab('files')(); await f.waitForTimeout(450);
      await t.crop(`${at}-files-${surface}-${look}`, f.locator('#activityBar'), `${at} ${look}: lit Files with the key focus mark`);
    }
  }
  await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove());
}

export const tests = {};
for (const [w, h] of SIZES) {
  tests[`FO-96 Activity bar keys ${w}x${h}`] = async (t) => {
    if (t.args.size && !String(t.args.size).split(',').includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
    return run(t, w, h);
  };
}
