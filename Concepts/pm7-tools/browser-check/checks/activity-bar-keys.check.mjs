// FO-96: the Activity bar (the left rail, #activityBar) is worked by keys. Every Activity item and More is a button in
// the tab order, as in the product's other bars (the chat's Activity strip, its Activity domains toolbar, the title bar,
// the Debug transport): none of them roves with arrow keys. Each is named; Enter and Space work it as a real click does
// at that size; More also opens on ArrowDown, its menu takes the focus, and Escape gives it back to More. A key focus
// paints a mark on every side of the item's tile at 3:1 or more against what was painted there before, in every look,
// lit or not, collapsed or with the names shown, and never crosses or touches a name's letters (F96-1); NieR's mark is
// its four target brackets; in Friendly Light the ring must stand 3:1 against both its neighbours (FO-99). The chat strip's FO-76 sizer copies stay inert
// and out of the tab order. One test per size: 1920x1100 (everything), 1390x860, 1280x500, 1024x768 and 740x900 (all
// but the chat switch, the Docker drag and the chat strip, which are judged at 1920). Both surfaces (--set sandbox=0|1).
// FO-98 (section 5b): every icon's aria-expanded says whether its panel is on screen (Chat: the chat column) and its
// aria-controls names it, at rest, after Enter opens and shuts a panel, after the folded rail's overlay is shut by
// Escape, and in Playwright's accessibility tree; at 1920 and 740 each icon's own menu (Shift+F10, the Menu key, a right
// click) moves it up and down and hides it in More by keys, Alt+ArrowUp/Down move it, Ctrl+N follows the new order, the
// focus stays on the icon (the next one after a hide), each change is announced, and More's menu puts it back; at 1920
// also the shell's own menu with the rail skin unmounted. Round 4: a right click's menu finished by keys keeps the focus
// on the bar (Escape: the icon; a move: the moved icon; a hide: the next icon), and a right click soon after a key's menu
// opens its own. The bar's order is put back at the end.
//   --set size=1280x500   --set looks=basic-dark,nier-light   --set crops=1
//   --set fo98=only (just section 5b)   --set fo98=off (without it)
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

// The rail's controls on screen at rest (K-F96c-2), with the bar scrolled to its top and the focus off it, as a person
// first sees it: each tile's centre lies inside the bar's clip box and the window, and a point there hits the tile. The
// collapsed rail holds all its controls so, in every look, as on main; with the names shown the bar may scroll instead
// (overflow-y auto or scroll, with something to scroll), where scrolling it must bring the tile in (F96b-3). A Tab walk
// proves none of this, as a focus scrolls the bar to it: Glass's collapsed rail at 1280x500 held 528 px in 411, with
// Artifacts, More and the toggle below the fold and no scrollbar to say so (F96c-2). `below` lists the controls seen only
// by scrolling; `trimmed`, the tiles in view whose edge the box cuts by more than 1 px (Friendly's toggle at 1280x500,
// 5 px, on b622109459 as well: logged, not failed).
function railAtRest() {
  const bar = document.getElementById('activityBar');
  if (!bar) return null;
  const shown = e => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const top0 = bar.scrollTop, oy = getComputedStyle(bar).overflowY;
  bar.scrollTop = 0;
  const scrolls = /^(auto|scroll|overlay)$/.test(oy) && bar.scrollHeight > bar.clientHeight + 1;
  const clipBox = () => { const b = bar.getBoundingClientRect(), x0 = b.left + bar.clientLeft, y0 = b.top + bar.clientTop;
    return { x0: Math.max(0, x0), y0: Math.max(0, y0), x1: Math.min(innerWidth, x0 + bar.clientWidth), y1: Math.min(innerHeight, y0 + bar.clientHeight) }; };
  const inside = (q, c) => { const x = (q.left + q.right) / 2, y = (q.top + q.bottom) / 2; return y >= c.y0 && y <= c.y1 && x >= c.x0 && x <= c.x1; };
  const cut = (q, c) => Math.round(Math.max(0, c.y0 - q.top, q.bottom - c.y1, c.x0 - q.left, q.right - c.x1));
  const hits = (e, q) => { const h = document.elementFromPoint((q.left + q.right) / 2, (q.top + q.bottom) / 2); return !!h && (h === e || e.contains(h)); };
  const rows = [...document.querySelectorAll('#activityBar .icon[data-ab-id], #activityBar > .activity-bar-toggle')].filter(shown).map(e => {
    const s = e.querySelector(':scope > .symbol') || e, key = e.getAttribute('data-ab-id') || e.id;
    let q = s.getBoundingClientRect(), c = clipBox();
    if (inside(q, c) && hits(e, q)) return cut(q, c) > 1 ? { key, seen: 'at rest', cut: cut(q, c) } : { key, seen: 'at rest' };
    const row = { key, bottom: Math.round(q.bottom), top: Math.round(q.top), box: [Math.round(c.y0), Math.round(c.y1)] };
    if (!scrolls) return { ...row, seen: false };
    bar.scrollTop += q.bottom > c.y1 ? q.bottom - c.y1 + 2 : q.top < c.y0 ? q.top - c.y0 - 2 : 0;
    q = s.getBoundingClientRect(); c = clipBox();
    const ok = inside(q, c) && hits(e, q);
    bar.scrollTop = 0;
    return { ...row, seen: ok ? 'by scrolling the bar' : false };
  });
  bar.scrollTop = top0;
  return { overflowY: oy, client: bar.clientHeight, content: bar.scrollHeight, scrolls, rows, unseen: rows.filter(r => !r.seen).map(r => r.key),
    below: rows.filter(r => r.seen === 'by scrolling the bar').map(r => r.key), trimmed: rows.filter(r => r.cut).map(r => `${r.key} ${r.cut}px`) };
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
  // how much of the tile the bar cuts off (K-F96b-2): the bar scrolls (overflow-y: auto), so it clips at its padding
  // box; the mark is drawn inside the tile, and a cut tile is a cut mark (Chat's top in Glass at 1280x500, F96b-3)
  const bar = document.getElementById('activityBar'), bb = bar.getBoundingClientRect(), tt = (sym || el).getBoundingClientRect();
  const cx0 = bb.left + bar.clientLeft, cy0 = bb.top + bar.clientTop, cx1 = cx0 + bar.clientWidth, cy1 = cy0 + bar.clientHeight;
  const clip = { top: Math.max(0, +(cy0 - tt.top).toFixed(1)), bottom: Math.max(0, +(tt.bottom - cy1).toFixed(1)), left: Math.max(0, +(cx0 - tt.left).toFixed(1)), right: Math.max(0, +(tt.right - cx1).toFixed(1)) };
  return { item: R(el), tile: sym ? R(sym) : R(el), lit: el.classList.contains('active'), label: l, clip,
    brackets: (root.getAttribute('data-o55-nier') === 'on' || /^nier/.test(root.getAttribute('data-theme') || '')) && /(^|\s)brackets(\s|$)/.test(root.getAttribute('data-o55-nier-parts') || '') };
}
// A side of the ring, read along scanlines across it (6 px either side of the tile's edge, through the middle 60% of
// the side). On each scanline the mark is the run of pixels that changed most on the key focus (by more than 40
// luminance levels) and now share one colour; the scanline counts when that run stands at 3:1 or more against what is
// beside it now (the better of its two sides, as opus-recheck-f96 measured: the 1 or 2 px just beyond the run, so a
// blended edge pixel is passed over but nothing past a border is reached). A side counts when 90% of its scanlines do. So a side the bar's edge cuts away, a side drawn in the accent on
// a lit accent tile (it barely changes), a side squeezed onto a tile's shadow (it barely changes either), and a side
// missing altogether all fail; a ring with a band of ground on its inner side passes on a lit tile and an unlit one. Region coordinates: the capture's
// origin is (ox, oy) in page pixels.
const Yv = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const ratio = (p, q) => (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05);
function scanline(rest, focus, pts, both = false) {
  const px = pts.map(([x, y]) => (x < 0 || y < 0 || x >= rest.width || y >= rest.height) ? null : 4 * (y * rest.width + x));
  let core = -1, best = 40;
  px.forEach((i, k) => { if (i == null) return; const d = Math.abs(Yv(focus.data, i) - Yv(rest.data, i)); if (d > best) { best = d; core = k; } });
  if (core < 0) return 0;
  // the run: the pixels of the core's own colour (every channel within 32 levels; by luminance alone a blue ring and
  // the grey border beside it would merge, and the border's far side would be read as the ring's neighbour)
  const L = i => lum(focus.data[i], focus.data[i + 1], focus.data[i + 2]), c0 = px[core];
  const same = j => px[j] != null && Math.max(Math.abs(focus.data[px[j]] - focus.data[c0]), Math.abs(focus.data[px[j] + 1] - focus.data[c0 + 1]), Math.abs(focus.data[px[j] + 2] - focus.data[c0 + 2])) <= 32;
  let a = core, b = core;
  while (a > 0 && same(a - 1)) a--;
  while (b < px.length - 1 && same(b + 1)) b++;
  const lc = L(px[core]);
  const beside = (from, step) => { let m = 0; for (let k = 1; k <= 2; k++) { const j = from + step * k; if (j < 0 || j >= px.length || px[j] == null) break; m = Math.max(m, ratio(lc, L(px[j]))); } return m; };
  // the better of its two neighbours, as opus-recheck-f96 judged it: a two-tone mark has its ground band on one side.
  // `both` (FO-99, Friendly Light, whose ring lies between the white band and the bar's pale ground): the worse of the
  // two, so the ring must stand 3:1 against each (its old pale-blue ring read about 3:1 against the band and 1.9 to
  // 2.9:1 against the ground)
  return both ? Math.min(beside(a, -1), beside(b, 1)) : Math.max(beside(a, -1), beside(b, 1));
}
function sides(rest, focus, tile, ox, oy, both = false) {
  const L = Math.round(tile.x - ox), T = Math.round(tile.y - oy), Rr = Math.round(tile.x + tile.w - ox), B = Math.round(tile.y + tile.h - oy);
  const mid = (p, q) => { const out = []; for (let v = Math.round(p + (q - p) * 0.2); v < Math.round(p + (q - p) * 0.8); v++) out.push(v); return out; };
  const span = e => { const out = []; for (let v = e - 6; v < e + 6; v++) out.push(v); return out; };
  const side = lines => { const got = lines.map(pts => scanline(rest, focus, pts, both)).sort((p, q) => p - q); const n = got.length;
    return { share: n ? +(got.filter(v => v >= 3).length / n).toFixed(2) : 0, worst: n ? +got[0].toFixed(2) : 0, median: n ? +got[Math.floor(n / 2)].toFixed(2) : 0 }; };
  return {
    top: side(mid(L, Rr).map(x => span(T).map(y => [x, y]))),
    bottom: side(mid(L, Rr).map(x => span(B).map(y => [x, y]))),
    left: side(mid(T, B).map(y => span(L).map(x => [x, y]))),
    right: side(mid(T, B).map(y => span(Rr).map(x => [x, y]))),
  };
}
// each side read at the tile's edge and at the item's, the one that holds the mark (a ring may sit on the tile or go
// round the whole item, names included)
const bestSides = (a, b) => Object.fromEntries(Object.keys(a).map(k => [k, (b[k].share > a[k].share || (b[k].share === a[k].share && b[k].median > a[k].median)) ? b[k] : a[k]]));
function corners(rest, focus, item, ox, oy) {
  const L = Math.round(item.x - ox), T = Math.round(item.y - oy), Rr = Math.round(item.x + item.w - ox), B = Math.round(item.y + item.h - oy);
  const corner = (cx, cy, dx, dy) => { let n = 0; for (let y = cy - 6; y < cy + 8; y++) for (let x = cx - 6; x < cx + 8; x++) { const xx = dx > 0 ? x : 2 * cx - x, yy = dy > 0 ? y : 2 * cy - y; if (contrastAt(rest, focus, xx, yy) >= 3) n++; } return n; };
  return { tl: corner(L, T, 1, 1), tr: corner(Rr, T, -1, 1), bl: corner(L, B, 1, -1), br: corner(Rr, B, -1, -1) };
}
// a mark passes when every side (every corner for NieR) is there at 3:1
const markOk = r => !!r && r.focused && (r.brackets ? Object.values(r.corners).every(n => n >= 6)
  : Object.values(r.sides).every(sd => sd.share >= 0.9) && (!r.clip || Object.values(r.clip).every(v => v <= 1)));
const brief = r => r && { key: r.key, lit: r.lit, focused: r.focused, ...(r.unreached ? { unreached: true } : {}), ...(r.skipped ? { skipped: r.skipped } : {}), ...(r.moved ? { moved: true } : {}), ...(r.clip && Object.values(r.clip).some(v => v > 1) ? { clip: r.clip } : {}),
  ...(r.corners ? { corners: r.corners } : {}), ...(r.sides ? { sides: Object.fromEntries(Object.entries(r.sides).map(([k, v]) => [k, `${v.share} ${v.worst}-${v.median}`])) } : {}), ...(r.names ? { names: r.names } : {}) };

// A key-focused bar control's mark as the page holds it (not its paint, which the pixel reads judge): the rail's focus
// ring (.d-abring on its tile's box, F96-1 round 8), its own outline (where anchor positioning is missing), or, on builds
// before round 8, Liquid Glass's flagged lens painted at rest on it.
function markOn(k) {
  const i = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = i && (i.querySelector('.symbol') || i);
  if (!sym) return { keyFocus: false, any: false };
  const b = sym.getBoundingClientRect(), o = getComputedStyle(sym), near = r => Math.abs((r.left + r.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((r.top + r.bottom) / 2 - (b.top + b.bottom) / 2) <= 3;
  const own = o.outlineStyle !== 'none' && parseFloat(o.outlineWidth) >= 2;
  const L = [...document.querySelectorAll('.lg-lens[data-lg-for="rail-icons"][data-lg-focus]')].find(x => { const c = getComputedStyle(x); return c.display !== 'none' && parseFloat(c.opacity) > 0.5; });
  const lens = !!L && near(L.getBoundingClientRect());
  const g = document.getElementById('d-abring'), gc = g && getComputedStyle(g), gr = g && g.getBoundingClientRect();
  const ring = !!g && gc.display !== 'none' && gc.visibility !== 'hidden' && gr.width > 4 && Math.abs(gr.left - b.left) <= 1 && Math.abs(gr.top - b.top) <= 1 && Math.abs(gr.width - b.width) <= 1 && Math.abs(gr.height - b.height) <= 1;
  const keyFocus = document.activeElement === i && i.matches(':focus-visible');
  return { keyFocus, ring, own, lens, any: keyFocus && (ring || own || lens) };
}

// Names' letters, every name in view (K-F96b-3: a mark must not cross a neighbour's name either). The letters are found
// exactly: the region is captured once more at rest with every name's text made transparent, and a letter is a pixel
// inside a rail name's text box that differs between the two by more than 24 levels (so a lens rim or a tile edge in a
// name's box is never taken for a letter, K-F96b-5, nor a tip card's words over the bar). Each letter is grown by 1 px, and none of those pixels may change on the key focus.
// boxes: the rail names' own text boxes, in the capture's pixels; nothing outside them (a tip card, a title) is a letter
function lettersCrossed(rest, bare, focus, boxes) {
  const w = rest.width, h = rest.height, Y = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  const inName = (x, y) => boxes.some(b => x >= b.x - 1 && x < b.x + b.w + 1 && y >= b.y - 1 && y < b.y + b.h + 1);
  const ink = new Uint8Array(w * h); let letters = 0, crossed = 0;
  for (let i = 0, p = 0; i < rest.data.length; i += 4, p++) if (Math.abs(Y(rest.data, i) - Y(bare.data, i)) > 24 && inName(p % w, Math.floor(p / w))) { ink[p] = 1; letters++; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w && ink[yy * w + xx]) { near = true; break; } }
    if (!near) continue;
    const i = 4 * (y * w + x);
    if (Math.abs(Y(focus.data, i) - Y(rest.data, i)) > 40) crossed++;
  }
  return { letters, crossed };
}
const hideNames = on => { const id = 'fo96-bare-names'; document.getElementById(id)?.remove(); if (!on) return;
  const st = document.createElement('style'); st.id = id; st.textContent = ':root #activityBar.activity-bar .icon .icon-label:not(#fo96a):not(#fo96b):not(#fo96c):not(#fo96d):not(#fo96e) { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; -webkit-text-stroke: 0 !important; }'; document.head.appendChild(st); };
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

// FO-98: what each icon's open state is, read from what a person sees: a panel icon's view on screen (its .active and a
// box of its own); for Chat, the chat itself on screen: shown, at least 120 px wide and inside the window, with its
// folded strip ("Open the chat") not shown (round 2, K-act8-1: the strip was counted as open, so a Chat reading
// expanded while the chat was folded passed); set beside it, the icon's aria-expanded, aria-controls, lit state and
// whether a menu marked it.
function openTruth() {
  const out = {};
  for (const ic of document.querySelectorAll('#activityBar > .icon[data-ab-id]')) {
    const k = ic.getAttribute('data-ab-id');
    if (k === 'more') continue;
    const tg = ic.getAttribute('data-target'), view = tg && document.getElementById(tg);
    let open = null, want = null;
    if (view) { const r = view.getBoundingClientRect(); open = view.classList.contains('active') && r.width > 1 && r.height > 1; want = tg; }
    else if (k === 'chat') {
      const c = document.getElementById('chatPanel'), r = c && c.getBoundingClientRect(), strip = document.getElementById('pmw-chat-strip');
      const folded = !!(strip && !strip.hidden && strip.getClientRects().length);
      open = !!c && !c.classList.contains('hidden') && !folded && r.width >= 120 && r.right > 0 && r.left < innerWidth; want = 'chatPanel';
    }
    out[k] = { open, want, expanded: ic.getAttribute('aria-expanded'), controls: ic.getAttribute('aria-controls'), lit: ic.classList.contains('active'), menuMark: ic.classList.contains('is-menu-open') };
  }
  return out;
}
const barOrder = () => [...document.querySelectorAll('#activityBar > .icon[data-ab-id]')].map(i => i.getAttribute('data-ab-id'));
function iconMenu() {
  const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-icon"]') || document.querySelector('.pm-ab-ctx');
  const shown = !!m && m.isConnected && m.getClientRects().length > 0 && getComputedStyle(m).display !== 'none' && getComputedStyle(m).visibility !== 'hidden';
  const rows = shown ? [...m.querySelectorAll('.pmr-mi, .pm-ab-tray-row')] : [];
  const a = document.activeElement;
  return { open: shown, kind: m ? (m.classList.contains('pm-ab-ctx') ? 'shell' : 'skin') : null, role: m && m.getAttribute('role'),
    rows: rows.map(b => ((b.querySelector('.pm6-chat-modelname') || b).textContent.trim()) + (b.getAttribute('aria-disabled') === 'true' ? ' (disabled)' : '')),
    focusRow: shown && m.contains(a) ? ((a.querySelector && a.querySelector('.pm6-chat-modelname')) || a).textContent.trim() : null };
}

// FO-98, at every size: each icon's open state is exposed (aria-expanded and aria-controls) and kept true as panels open
// and close by keys and clicks, the folded rail's overlay included; at 1920 and 740, reorder and hide by keys (each
// icon's menu by Shift+F10, the Menu key or a right click, Alt+ArrowUp/Down), back again, with the focus kept and each
// change announced; at 1920 the shell's own menu with the rail skin unmounted too. The bar's order is put back at the end.
async function fo98(t, f, { at, kb, key, sentinel, rest, full, off }) {
  const settle = (n = 4) => frames(f, n);
  const reach = async (k) => { await sentinel('#activityBar'); for (let i = 0; i < 16; i++) { await kb.press('Tab'); if ((await key()).key === k) return true; } return false; };
  // what the live region said since the last drain(), every announcement in turn (round 4): reading only its last text
  // let a demo's own announcement ("cargo test --workspace failed ...") that came after a move's hide the move's
  await f.evaluate(() => {
    if (window.__fo98said) return;
    window.__fo98said = [];
    const watch = (el) => new MutationObserver(() => { const tx = el.textContent || ''; if (tx) window.__fo98said.push(tx); }).observe(el, { childList: true, characterData: true, subtree: true });
    const el = document.getElementById('pmw-live');
    if (el) { watch(el); return; }
    const mo = new MutationObserver(() => { const e = document.getElementById('pmw-live'); if (e) { mo.disconnect(); watch(e); if (e.textContent) window.__fo98said.push(e.textContent); } });
    mo.observe(document.body, { childList: true });
  });
  const drain = () => f.evaluate(() => { (window.__fo98said || []).splice(0); });
  const live = () => f.evaluate(() => (window.__fo98said || []).splice(0).join(' | '));
  const agree = async (label, extra) => {
    await settle(); await f.waitForTimeout(80);
    const s = await f.evaluate(openTruth);
    const bad = Object.entries(s).filter(([, v]) => v.controls !== v.want || (v.expanded === 'true') !== !!v.open);
    await t.check(`${at} FO-98 ${label}: each icon's aria-expanded says whether its panel (Chat: the chat column) is on screen, aria-controls names it`,
      bad.length === 0 && (!extra || extra(s)), bad.length ? JSON.stringify(Object.fromEntries(bad)) : Object.entries(s).map(([k, v]) => `${k}=${v.expanded}${v.lit ? '*' : ''}`).join(' '));
    return s;
  };
  const s0 = await agree('at rest');
  // the accessibility tree, as a screen reader gets it
  const snapOf = async (k) => (await f.locator(`#activityBar > .icon[data-ab-id="${k}"]`).ariaSnapshot()).split('\n')[0];
  const openKey = Object.keys(s0).find(k => s0[k].want && s0[k].want !== 'chatPanel' && s0[k].open);
  const shutKey = Object.keys(s0).find(k => s0[k].want && s0[k].want !== 'chatPanel' && !s0[k].open);
  const so = openKey ? await snapOf(openKey) : '', ss = shutKey ? await snapOf(shutKey) : '';
  t.log(`${at} FO-98 tree: ${so || '(no open panel)'} | ${ss}`);
  await t.check(`${at} FO-98: the accessibility tree reads the open panel's icon as expanded and a shut one's as not`,
    (!openKey || /\[expanded(=true)?\]/.test(so)) && !!shutKey && !/\[expanded(=true)?\]/.test(ss), JSON.stringify({ openKey, so, shutKey, ss }));
  // a panel opened and shut by keys
  if (await reach('search')) { await kb.press('Enter'); await agree('after Enter opens Search', s => s.search.expanded === 'true'); }
  const folded = await f.evaluate(() => document.querySelector('.main-area')?.getAttribute('data-pmw-rail') === 'fold');
  if (folded) {
    await kb.press('Escape');
    await agree('the folded rail\'s overlay shut by Escape (Search stays lit)', s => s.search.expanded === 'false' && s.search.lit);
  } else if (full && await reach('search')) {
    await kb.press('Enter');
    await agree('after Enter shuts Search', s => s.search.expanded === 'false');
  }
  // Files lit and its panel open, as the page starts (folded: Files lit with its overlay shut)
  const filesBack = async (label) => {
    if (!(await reach('files'))) return;
    await kb.press('Enter'); await agree(label, s => s.files.expanded === 'true');
    if (folded) { await kb.press('Escape'); await agree(label + ', its overlay shut by Escape', s => s.files.expanded === 'false' && s.files.lit); }
  };
  await filesBack('after Enter opens Files again');
  // the same by real mouse clicks (round 2, K-act8-3)
  const clickIcon = async (ic) => { const b = await f.locator(`#activityBar > .icon[data-ab-id="${ic}"]`).boundingBox(); if (!b) return false; await t.page.mouse.click(off.x + b.x + b.width / 2, off.y + b.y + b.height / 2); await rest(); return true; };
  if (await clickIcon('search')) await agree('after a click opens Search', s => s.search.expanded === 'true');
  if (await clickIcon('files')) await agree('after a click opens Files', s => s.files.expanded === 'true');
  if (folded && await reach('files')) { await kb.press('Escape'); await agree('Files\' overlay shut by Escape again', s => s.files.expanded === 'false'); }
  if (full && await reach('chat')) {
    await kb.press('Enter'); await f.waitForTimeout(900); await agree('after Enter switches the chat column');
    await kb.press(' '); await f.waitForTimeout(900); await agree('after Space switches it back');
  }
  // the chat folded to its strip ("Open the chat"): Chat is not expanded; Enter on it opens the chat over the centre,
  // which expands it, and Escape folds it back (round 2, F98-1)
  const stripOn = () => f.evaluate(() => { const b = document.getElementById('pmw-chat-strip'); return !!(b && !b.hidden && b.getClientRects().length); });
  const peeking = () => f.evaluate(() => !!document.querySelector('.main-area')?.hasAttribute('data-pmw-chat-peek'));
  // At 740 the step is required, whatever ran before (round 3, K8b-1): section 5's 1920 test stores "Keep the chat open
  // in narrow windows" on the normal page, and the 740 test that follows then never folded the chat, so the step only
  // logged a skip and round 1 passed the default run. It turns that preference off for the step (as the chat's own
  // "Keep the chat open in narrow windows" item does), fails by name if the chat still does not fold, and puts it back.
  if (await peeking() && await reach('chat')) { await kb.press('Escape'); await f.waitForTimeout(500); }
  const mustFold = at === '740x900';
  const keptOpen = mustFold ? await f.evaluate(() => { const c = window.PMW && PMW.chatCol; if (!c || !c.keepOpen || !c.keepOpen()) return false; c.setKeepOpen(false); return true; }) : false;
  if (mustFold) await f.waitForFunction(() => { const b = document.getElementById('pmw-chat-strip'); return !!(b && !b.hidden && b.getClientRects().length); }, null, { timeout: 4000 }).catch(() => {});
  if (keptOpen) t.log(`${at} FO-98: "keep the chat open" was stored by an earlier test; turned off for the strip step`);
  if (await stripOn()) {
    await agree('the chat folded to its strip', s => s.chat.expanded === 'false' && s.chat.lit);
    if (await reach('chat')) { await kb.press('Enter'); await f.waitForTimeout(700); }
    await agree('after Enter opens the chat over the centre', s => s.chat.expanded === 'true');
    await kb.press('Escape'); await f.waitForTimeout(700);
    await agree('after Escape folds the chat back to its strip', s => s.chat.expanded === 'false');
  } else if (mustFold) await t.check(`${at} FO-98: the chat folds to its strip at 740x900 for the strip step`, false, JSON.stringify(await f.evaluate(() => ({ keepOpen: !!(window.PMW && PMW.chatCol && PMW.chatCol.keepOpen && PMW.chatCol.keepOpen()), chatStrip: !!(window.PMW && PMW.narrow && PMW.narrow.state.chatStrip), chatW: Math.round(document.getElementById('chatPanel')?.getBoundingClientRect().width || 0) }))));
  else t.log(`${at} FO-98: the chat is not folded to its strip at this size`);
  if (keptOpen) { await f.evaluate(() => PMW.chatCol.setKeepOpen(true)); await f.waitForTimeout(500); }
  // across the fold in one session (round 2, K-act8-3): the state is read again after the window narrows and widens
  if (full) {
    await t.viewport(740, 900); await f.waitForTimeout(1200);
    await agree('the same session narrowed to 740x900');
    await t.viewport(1920, 1100); await f.waitForTimeout(1200);
    await agree('the same session back at 1920x1100', s => s.files.expanded === 'true');
  }
  if (!full && at !== '740x900') return;

  // reorder and hide by keys, through the rail skin's menu
  // an icon with a neighbour on each side, so it can move both ways (section 4's drag leaves Docker last)
  const order0 = await f.evaluate(barOrder), visible0 = order0.filter(x => x !== 'more');
  const middle = visible0.slice(1, -1), k = middle.includes('docker') ? 'docker' : middle[Math.floor(middle.length / 2)];
  const i0 = order0.indexOf(k);
  const menuUp = () => f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-icon"], .pm-ab-ctx'); return !!m && m.getClientRects().length > 0 && m.contains(document.activeElement); }, null, { timeout: 2000 }).catch(() => {});
  const menuGone = () => f.waitForFunction(() => { const m = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-icon"], .pm-ab-ctx'); return !m || !m.isConnected || !m.getClientRects().length || getComputedStyle(m).display === 'none'; }, null, { timeout: 2000 }).catch(() => {});
  let reached = await reach(k);
  const exp0 = (await f.evaluate(openTruth))[k];
  if (reached) { await kb.press('Shift+F10'); await menuUp(); }
  let m = await f.evaluate(iconMenu);
  const exp1 = (await f.evaluate(openTruth))[k];
  await t.check(`${at} FO-98 ${k}: Shift+F10 opens its menu (Move up, Move down, Hide in More) with the focus on its first row, and leaves the icon's aria-expanded alone`,
    reached && m.open && m.kind === 'skin' && m.role === 'menu' && /^Move up/.test(m.rows[0] || '') && /^Move down/.test(m.rows[1] || '') && /^Hide in More/.test(m.rows[2] || '') && /^Move up/.test(m.focusRow || '')
      && exp1.expanded === exp0.expanded && !exp1.menuMark, JSON.stringify({ reached, menu: m, before: exp0, open: exp1 }));
  await drain();
  if (m.open) { await kb.press('Enter'); await menuGone(); await settle(); await f.waitForTimeout(120); }
  let order = await f.evaluate(barOrder), foc = await key(), said = await live();
  await t.check(`${at} FO-98 ${k}: Move up moves it one place up, keeps the focus on it and is announced`,
    order.indexOf(k) === i0 - 1 && order.filter(x => x !== k).join() === order0.filter(x => x !== k).join() && foc.key === k && /moved up/i.test(said), JSON.stringify({ order, focus: foc.key, said }));
  await drain(); await kb.press('Alt+ArrowDown'); await settle(); await f.waitForTimeout(120);
  order = await f.evaluate(barOrder); foc = await key(); said = await live();
  await t.check(`${at} FO-98 ${k}: Alt+ArrowDown moves it back down, the focus kept`, order.join() === order0.join() && foc.key === k && /moved down/i.test(said), JSON.stringify({ order, focus: foc.key, said }));
  // Ctrl+1..9 follow the order, as they always did
  await kb.press('Alt+ArrowUp'); await settle();
  const ctrlN = await f.evaluate((k) => [...document.querySelectorAll('.activity-bar .icon[data-target]')].findIndex(i => i.getAttribute('data-ab-id') === k) + 1, k);
  if (ctrlN >= 1 && ctrlN <= 9) {
    await kb.press(`Control+${ctrlN}`); await settle(); await f.waitForTimeout(250);
    await agree(`Ctrl+${ctrlN} opens ${k}'s panel at its new place`, s => s[k].expanded === 'true');
    await filesBack('Files again after Ctrl+N');
  } else t.log(`${at} FO-98: ${k} is past Ctrl+9 (${ctrlN})`);
  if (await reach(k)) { await kb.press('Alt+ArrowDown'); await settle(); }
  order = await f.evaluate(barOrder);
  await t.check(`${at} FO-98 ${k}: back at its own place`, order.join() === order0.join(), order.join());
  // hide by the Menu key, then back from More, then back to its place. Windows Chrome sends the Menu key's own
  // contextmenu on its keyup, to the menu row that has the focus by then: it must arrive cancelled (round 2, K-act8-4)
  await f.evaluate(() => { window.__fo98ctx = []; if (!window.__fo98ctxOn) { window.__fo98ctxOn = true; window.addEventListener('contextmenu', (e) => { window.__fo98ctx.push({ prevented: e.defaultPrevented, on: String((e.target && e.target.className) || (e.target && e.target.tagName) || '').slice(0, 40) }); }); } });
  reached = await reach(k);
  if (reached) { await kb.press('ContextMenu'); await menuUp(); await f.waitForTimeout(150); }
  const ctxSeen = await f.evaluate(() => window.__fo98ctx.slice());
  t.log(`${at} FO-98: contextmenu events after the Menu key: ${JSON.stringify(ctxSeen)}`);
  await t.check(`${at} FO-98 ${k}: no contextmenu event from the Menu key reaches the page uncancelled`, ctxSeen.every((e) => e.prevented), JSON.stringify(ctxSeen));
  m = await f.evaluate(iconMenu);
  await drain();
  if (m.open) { await kb.press('End'); await kb.press('Enter'); await menuGone(); await settle(); await f.waitForTimeout(120); }
  order = await f.evaluate(barOrder); foc = await key(); said = await live();
  const nextKey = visible0[visible0.indexOf(k) + 1] || visible0[visible0.indexOf(k) - 1];
  const empty = await f.evaluate(() => document.getElementById('abMoreBtn').getAttribute('data-empty'));
  await t.check(`${at} FO-98 ${k}: the Menu key's menu hides it in More, the focus goes to the next icon and it is announced`,
    reached && m.open && !order.includes(k) && empty === '0' && foc.key === nextKey && /hidden in More/i.test(said), JSON.stringify({ menu: m.rows, order, empty, focus: foc.key, want: nextKey, said }));
  if (!order.includes(k) && await reach('more')) {
    await kb.press('ArrowDown');
    await f.waitForFunction(() => { const mm = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !!mm && mm.contains(document.activeElement); }, null, { timeout: 2000 }).catch(() => {});
    await kb.press('Enter'); await settle(); await f.waitForTimeout(300);
  }
  order = await f.evaluate(barOrder);
  await t.check(`${at} FO-98 ${k}: More's menu puts it back, at the end of the bar`, order[order.length - 2] === k && order[order.length - 1] === 'more', order.join());
  if (await reach(k)) for (let n = 0; n < order0.length && (await f.evaluate(barOrder)).indexOf(k) > i0; n++) { await kb.press('Alt+ArrowUp'); await settle(1); }
  order = await f.evaluate(barOrder); foc = await key();
  await t.check(`${at} FO-98 ${k}: Alt+ArrowUp walks it back to its own place, the focus on it all the way`, order.join() === order0.join() && foc.key === k, JSON.stringify({ order, focus: foc.key }));
  // a right click opens the same menu at the pointer; the first icon's Move up is disabled
  const fb = await f.locator('#activityBar > .icon[data-ab-id="files"]').boundingBox();
  if (fb) {
    await t.page.mouse.click(off.x + fb.x + fb.width / 2, off.y + fb.y + fb.height / 2, { button: 'right' });
    await f.waitForFunction(() => !!document.querySelector('.pmr-menu[data-pmr-menu="d-ab-icon"]'), null, { timeout: 2000 }).catch(() => {});
    m = await f.evaluate(iconMenu);
    const fx = (await f.evaluate(openTruth)).files;
    await t.check(`${at} FO-98: a right click on Files opens its menu, and Files' aria-expanded is still its panel's`, m.open && m.rows.length === 3 && (fx.expanded === 'true') === !!fx.open && !fx.menuMark, JSON.stringify({ menu: m, files: fx }));
    await kb.press('Escape'); await menuGone(); await rest();
  }
  // a right click's menu finished by keys (round 4, B): the focus follows the key that finished it, not the press that
  // opened it. Escape gives it back to the icon, ArrowDown and Enter on Move up keep it on the moved icon, and End and
  // Enter on Hide in More give it to the next icon, as the Menu key's menu does; before, all three left it on <body>
  const rightMenu = async (ic) => {
    const b = await f.locator(`#activityBar > .icon[data-ab-id="${ic}"]`).boundingBox();
    if (!b) return false;
    await t.page.mouse.click(off.x + b.x + b.width / 2, off.y + b.y + b.height / 2, { button: 'right' });
    await menuUp();
    return (await f.evaluate(iconMenu)).open;
  };
  const nextOf = (o, ic) => { const v = o.filter(x => x !== 'more'), i = v.indexOf(ic); return v[i + 1] || v[i - 1]; };
  let opened = await rightMenu(k);
  if (opened) { await kb.press('Escape'); await menuGone(); }
  foc = await key();
  await t.check(`${at} FO-98 ${k}: Escape on a right click's menu gives the focus back to the icon (round 4, B)`, opened && foc.key === k && !(await f.evaluate(iconMenu)).open, JSON.stringify({ opened, focus: foc.key }));
  await rest();
  opened = await rightMenu(k);
  await drain();
  if (opened) { await kb.press('ArrowDown'); await kb.press('Enter'); await menuGone(); await settle(); await f.waitForTimeout(120); }
  order = await f.evaluate(barOrder); foc = await key(); said = await live();
  await t.check(`${at} FO-98 ${k}: a right click's menu, ArrowDown and Enter on Move up move it up and keep the focus on it (round 4, B)`,
    opened && order.indexOf(k) === i0 - 1 && foc.key === k && /moved up/i.test(said), JSON.stringify({ opened, order, focus: foc.key, said }));
  if (order.indexOf(k) === i0 - 1 && (foc.key === k || await reach(k))) { await kb.press('Alt+ArrowDown'); await settle(); }   /* undo only a move that happened */
  await rest();
  const orderB = await f.evaluate(barOrder), nextB = nextOf(orderB, k);
  opened = await rightMenu(k);
  await drain();
  if (opened) { await kb.press('End'); await kb.press('Enter'); await menuGone(); await settle(); await f.waitForTimeout(120); }
  order = await f.evaluate(barOrder); foc = await key(); said = await live();
  await t.check(`${at} FO-98 ${k}: a right click's menu, End and Enter on Hide in More hide it and give the focus to the next icon (round 4, B)`,
    opened && orderB.join() === order0.join() && !order.includes(k) && foc.key === nextB && /hidden in More/i.test(said), JSON.stringify({ opened, before: orderB, order, focus: foc.key, want: nextB, said }));
  if (!order.includes(k) && await reach('more')) {
    await kb.press('ArrowDown');
    await f.waitForFunction(() => { const mm = document.querySelector('.pmr-menu[data-pmr-menu="d-ab-more"]'); return !!mm && mm.contains(document.activeElement); }, null, { timeout: 2000 }).catch(() => {});
    await kb.press('Enter'); await settle(); await f.waitForTimeout(300);
  }
  if (await reach(k)) for (let n = 0; n < order0.length && (await f.evaluate(barOrder)).indexOf(k) > i0; n++) { await kb.press('Alt+ArrowUp'); await settle(1); }
  order = await f.evaluate(barOrder);
  await t.check(`${at} FO-98 ${k}: back at its own place after the right click's hide`, order.join() === order0.join(), order.join());
  // a right click soon after a key's menu (round 4, C): Shift+F10 on Files, Escape, then a right click on Search within
  // a second of the key. Only the key's own contextmenu is swallowed, so Search's menu opens; before, every right click
  // on the bar was dropped for a second after the key. The second is timed in the page; a run too slow to land inside
  // it tries once more and then fails by name.
  const searchMenu = () => {
    const ms = [...document.querySelectorAll('.pmr-menu[data-pmr-menu="d-ab-icon"], .pm-ab-ctx')].filter(x => x.isConnected
      && /^Search\b/.test(x.getAttribute('aria-label') || '') && x.getClientRects().length > 0 && getComputedStyle(x).display !== 'none' && getComputedStyle(x).visibility !== 'hidden');
    return { open: ms.length > 0, label: ms.length ? ms[0].getAttribute('aria-label') : null, focusIn: ms.length > 0 && ms[0].contains(document.activeElement) };
  };
  let quick = null;
  for (let n = 0; n < 2 && !(quick && quick.inWindow); n++) {
    await rest();
    const sb = await f.locator('#activityBar > .icon[data-ab-id="search"]').boundingBox();
    if (!sb || !(await reach('files'))) break;
    await f.evaluate(() => {
      window.__fo98c = { key: 0, ctx: 0 };
      if (window.__fo98cOn) return;
      window.__fo98cOn = true;
      window.addEventListener('keydown', (e) => { if (e.key === 'F10' && e.shiftKey) window.__fo98c.key = performance.now(); }, true);
      window.addEventListener('contextmenu', (e) => { if (e.target && e.target.closest && e.target.closest('#activityBar')) window.__fo98c.ctx = performance.now(); }, true);
    });
    await kb.press('Shift+F10'); await menuUp();
    const keyOpened = (await f.evaluate(iconMenu)).open;
    await kb.press('Escape');
    await t.page.mouse.click(off.x + sb.x + sb.width / 2, off.y + sb.y + sb.height / 2, { button: 'right' });
    await f.waitForFunction(searchMenu, null, { timeout: 1500 }).catch(() => {});
    const c = await f.evaluate(() => window.__fo98c), sm = await f.evaluate(searchMenu);
    quick = { keyOpened, inWindow: c.key > 0 && c.ctx > c.key && c.ctx - c.key < 1000, ms: Math.round(c.ctx - c.key), search: sm, try: n + 1 };
    t.log(`${at} FO-98: right click on Search after Shift+F10 and Escape on Files: ${JSON.stringify(quick)}`);
    await kb.press('Escape'); await menuGone();
  }
  await t.check(`${at} FO-98: a right click on Search within a second of Shift+F10 and Escape on Files opens Search's menu (round 4, C)`,
    !!quick && quick.keyOpened && quick.inWindow && quick.search.open, JSON.stringify(quick));
  // Sol's route to the same fault (sol-review-g8 F98-S1): a right click on Source and Escape, then Shift+F10 on Source
  // and Escape, then a right click on Source 150 ms and again 350 ms after the key, or as soon after as input allows
  // (Escape between them, so the second lands on the icon, not on the first menu). Each must open Source's menu, and the
  // first must land inside the old one-second watch; before, both were dropped.
  const sourceMenu = () => {
    const ms = [...document.querySelectorAll('.pmr-menu[data-pmr-menu="d-ab-icon"], .pm-ab-ctx')].filter(x => x.isConnected
      && /^Source\b/.test(x.getAttribute('aria-label') || '') && x.getClientRects().length > 0 && getComputedStyle(x).display !== 'none' && getComputedStyle(x).visibility !== 'hidden'
      && !x.classList.contains('is-closing'));
    return ms.length > 0;
  };
  let sol = null;
  for (let n = 0; n < 2 && !(sol && sol.inWindow); n++) {
    await rest();
    const ob = await f.locator('#activityBar > .icon[data-ab-id="source"]').boundingBox();
    if (!ob) break;
    const at0 = { x: off.x + ob.x + ob.width / 2, y: off.y + ob.y + ob.height / 2 };
    const first = await rightMenu('source');
    if (first) { await kb.press('Escape'); await menuGone(); }
    if ((await key()).key !== 'source' && !(await reach('source'))) break;
    await f.evaluate(() => {
      window.__fo98s = { key: 0, ctx: [] };
      if (window.__fo98sOn) return;
      window.__fo98sOn = true;
      window.addEventListener('keydown', (e) => { if (e.key === 'F10' && e.shiftKey) window.__fo98s.key = performance.now(); }, true);
      window.addEventListener('contextmenu', (e) => { if (e.target && e.target.closest && e.target.closest('#activityBar')) window.__fo98s.ctx.push(performance.now()); }, true);
    });
    await kb.press('Shift+F10'); await menuUp();
    const keyOpened = (await f.evaluate(iconMenu)).open;
    await kb.press('Escape'); await menuGone();
    const opens = [];
    for (const delay of [150, 350]) {
      await f.waitForFunction((d) => performance.now() - window.__fo98s.key >= d, delay, { timeout: 2000 }).catch(() => {});
      await t.page.mouse.click(at0.x, at0.y, { button: 'right' });
      const ok = await f.waitForFunction(sourceMenu, null, { timeout: 350 }).then(() => true, () => false);
      opens.push(ok);
      if (ok) { await kb.press('Escape'); await menuGone(); }   /* a dropped click leaves nothing to close; no wait */
    }
    const s = await f.evaluate(() => window.__fo98s), ms = s.ctx.map(c => Math.round(c - s.key));
    /* the first click must land inside the old second (over --host it lands about 0.4 s after the key); the second is
       logged, and it must open too, inside the second or not */
    sol = { first, keyOpened, opens, ms, inWindow: s.key > 0 && ms.length === 2 && ms[0] > 0 && ms[0] < 1000, secondInWindow: ms.length === 2 && ms[1] < 1000, try: n + 1 };
    t.log(`${at} FO-98: Sol's route on Source: ${JSON.stringify(sol)}`);
  }
  await t.check(`${at} FO-98: right clicks on Source 150 and 350 ms after Shift+F10 and Escape, after a right click and Escape, each open Source's menu (sol-review-g8 F98-S1)`,
    !!sol && sol.first && sol.keyOpened && sol.inWindow && sol.opens.length === 2 && sol.opens.every(Boolean), JSON.stringify(sol));
  await rest();
  const first = (await f.evaluate(barOrder))[0];
  if (await reach(first)) { await kb.press('Shift+F10'); await menuUp(); }
  m = await f.evaluate(iconMenu);
  if (m.open) { await kb.press('Escape'); await menuGone(); }
  foc = await key();
  await t.check(`${at} FO-98 ${first} (first): Move up is disabled, Escape gives the focus back to the icon`, m.open && /^Move up.*\(disabled\)$/.test(m.rows[0] || '') && !/disabled/.test(m.rows[1] || '') && foc.key === first, JSON.stringify({ menu: m, focus: foc.key }));
  if (!full) return;

  // NieR: the focused row is an ink bar; its glyph must stand off it (the hover tags' ignite drew it in the bar's own ink)
  for (const look of ['nier-light', 'nier-dark']) {
    await t.app.look(look);
    await f.waitForFunction(() => !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
    if (await reach(k)) { await kb.press('Shift+F10'); await menuUp(); await f.waitForTimeout(250); }
    const g = await f.evaluate(() => {
      const row = document.activeElement, svg = row && row.closest && row.closest('.pmr-menu') && row.querySelector('.pmr-mi-ico svg');
      if (!svg) return null;
      const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const L = ([r, gg, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
      const part = [...svg.querySelectorAll('path, line, polyline, circle, rect')].find((e) => getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden') || svg;
      const st = rgb(getComputedStyle(part).stroke), bg = rgb(getComputedStyle(row).backgroundColor), a = L(st), c = L(bg);
      return { row: row.textContent.trim(), stroke: st.join(), bg: bg.join(), ratio: +((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05)).toFixed(2) };
    });
    await t.check(`${at} FO-98 ${look}: the focused menu row's glyph stands at 3:1 or more on its ink bar`, !!g && g.ratio >= 3, JSON.stringify(g));
    await kb.press('Escape'); await menuGone();
  }
  await t.app.look('basic-dark');

  // the shell's own menu and open state, the rail skin unmounted (the review copy's Original rail)
  const swapped = await f.evaluate(() => { try { PMR.host.setConcept('current', { force: true }); return !document.documentElement.hasAttribute('data-rail-skin'); } catch (e) { return false; } });
  if (!swapped) { t.log(`${at} FO-98: the rail skin could not be unmounted here; the shell's own menu is not judged`); return; }
  await settle(6);
  await agree('the rail skin unmounted, at rest');
  reached = await reach(k);
  if (reached) { await kb.press('Shift+F10'); await menuUp(); }
  m = await f.evaluate(iconMenu);
  await t.check(`${at} FO-98 ${k}, no rail skin: Shift+F10 opens the shell's own menu with the focus on its first row`, reached && m.open && m.kind === 'shell' && m.role === 'menu' && m.rows.length === 3 && /^Move up/.test(m.focusRow || ''), JSON.stringify(m));
  if (m.open) { await kb.press('ArrowDown'); await kb.press('Enter'); await menuGone(); await settle(); }
  order = await f.evaluate(barOrder); foc = await key();
  await t.check(`${at} FO-98 ${k}, no rail skin: ArrowDown and Enter on Move down move it, the focus on it`, order.indexOf(k) === i0 + 1 && foc.key === k, JSON.stringify({ order, focus: foc.key }));
  if (foc.key === k) { await kb.press('Shift+F10'); await menuUp(); await kb.press('Escape'); await menuGone(); }
  foc = await key();
  await t.check(`${at} FO-98 ${k}, no rail skin: Escape closes the shell's menu and gives the focus back to the icon`, foc.key === k && !(await f.evaluate(iconMenu)).open, foc.key);
  await kb.press('Alt+ArrowUp'); await settle();
  order = await f.evaluate(barOrder);
  await t.check(`${at} FO-98 ${k}, no rail skin: Alt+ArrowUp puts it back`, order.join() === order0.join(), order.join());
  // the shell's own menu opened by a right click and finished by keys (round 4, B): the focus stays on the moved icon
  opened = await rightMenu(k);
  m = await f.evaluate(iconMenu);
  if (opened && m.kind === 'shell') { await kb.press('ArrowDown'); await kb.press('Enter'); await menuGone(); await settle(); }
  order = await f.evaluate(barOrder); foc = await key();
  await t.check(`${at} FO-98 ${k}, no rail skin: a right click's menu, ArrowDown and Enter on Move down move it, the focus on it (round 4, B)`,
    opened && m.kind === 'shell' && order.indexOf(k) === i0 + 1 && foc.key === k, JSON.stringify({ opened, kind: m.kind, order, focus: foc.key }));
  if (order.indexOf(k) === i0 + 1 && (foc.key === k || await reach(k))) { await kb.press('Alt+ArrowUp'); await settle(); }   /* undo only a move that happened */
  await rest();
  order = await f.evaluate(barOrder);
  await t.check(`${at} FO-98 ${k}, no rail skin: Alt+ArrowUp puts it back after the right click's move`, order.join() === order0.join(), order.join());
  if (await reach('search')) { await kb.press('Enter'); await agree('no rail skin, after Enter opens Search', s => s.search.expanded === 'true'); }
  if (await reach('files')) { await kb.press('Enter'); await agree('no rail skin, after Enter opens Files', s => s.files.expanded === 'true'); }
  await f.evaluate(() => PMR.host.setConcept('d', { force: true }));
  await settle(6);
  await agree('the rail skin mounted again');
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
  const fo98ctx = { at, kb, key, sentinel, rest, full, off };
  if (t.args.fo98 === 'only') { await fo98(t, f, fo98ctx); await f.evaluate(() => document.getElementById('fo96-sentinel')?.remove()); return; }

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
  // ...and at rest, with the focus off the bar, every control of the collapsed rail is on screen (K-F96c-2)
  await f.evaluate(placeSentinel, ['#activityBar', 'before']); await f.evaluate(() => document.getElementById('fo96-sentinel').focus({ preventScroll: true })); await frames(f, 2);
  const seen1 = await f.evaluate(railAtRest);
  t.log(`${at} at rest ${JSON.stringify(seen1)}`);
  await t.check(`${at}: at rest every control of the collapsed rail is on screen`, !!seen1 && seen1.unseen.length === 0 && seen1.below.length === 0, JSON.stringify(seen1));

  // The painted mark on a control reached by a key. The control is reached by keys first, so the bar scrolls as it
  // will; the focus then steps to the sentinel without scrolling, the rest is captured, and a real Tab from the control
  // before it gives it the focus again with nothing left to scroll. The tile must not move between the two captures.
  // the control before it in the bar as it is now (at 1920 the Docker drag puts Docker back just before More)
  const before = async target => { const now = await f.evaluate(railControls), i = now.findIndex(c => c.key === target); return i > 0 ? now[i - 1].key : null; };
  const focusQuiet = k => f.evaluate(k => { const el = k ? (k === 'activityBarToggle' ? document.getElementById(k) : document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`)) : document.getElementById('fo96-sentinel'); if (el) el.focus({ preventScroll: true }); }, k);
  // FO-99: whether a ring side is read against both its neighbours (Friendly Light, set per look below)
  let both = false;
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
    // with the names shown, every name's letters in the region, its own and its neighbours': an exact mask (below)
    const named = !!b.label;
    const r0 = await t.pixels(region);
    let bare = null;
    let nameBoxes = [];
    if (named) {
      nameBoxes = await f.evaluate(() => [...document.querySelectorAll('#activityBar .icon .icon-label')].filter(n => getComputedStyle(n).display !== 'none' && n.getClientRects().length)
        .map(n => { const g = document.createRange(); g.selectNodeContents(n); const q = g.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; }));
      await f.evaluate(hideNames, true); await frames(f, 2); bare = await t.pixels(region); await f.evaluate(hideNames, false); await frames(f, 2);
    }
    await focusQuiet(await before(target));
    await kb.press('Tab');
    await f.waitForTimeout(450);
    // NieR's one reticle glides from target to target in steps: read it once it is round this item and has come to rest
    // (three still frames; a pause between two steps is still for a frame or two)
    if (b.brackets) await f.waitForFunction(it => { const r = document.getElementById('o55np-reticle'); if (!r || !r.hasAttribute('data-on')) return false;
      const c = [...r.children].map(i => i.getBoundingClientRect()); if (c.length !== 4) return false;
      const box = [Math.min(...c.map(q => q.left)), Math.min(...c.map(q => q.top)), Math.max(...c.map(q => q.right)), Math.max(...c.map(q => q.bottom))];
      return [it.x - 3, it.y - 3, it.x + it.w + 3, it.y + it.h + 3].every((v, i) => Math.abs(v - box[i]) <= 8); }, b.item, { timeout: 1500 }).catch(() => {});
    if (b.brackets) await f.evaluate(() => new Promise(done => { const r = document.getElementById('o55np-reticle'), t0 = performance.now(); let last = '', still = 0;
      const step = () => { const now = r ? [...r.children].map(i => i.style.transform + getComputedStyle(i).translate).join('|') : ''; still = now === last ? still + 1 : 0; last = now;
        if (still >= 3 || performance.now() - t0 > 1500) done(); else requestAnimationFrame(step); }; requestAnimationFrame(step); }));
    const now = await key();
    let r1 = await t.pixels(region);
    // a read of NieR's brackets taken while one corner was still on its way in (K-F96c-4, a false stop: tl 0, bl 8 once,
    // passing on a rerun): read once more after 500 ms, the focus unmoved. A corner still short then is a real fault.
    if (b.brackets && !Object.values(corners(r0, r1, b.item, region.x - off.x, region.y - off.y)).every(n => n >= 6)) {
      t.log(`${target}: NieR's brackets read short ${JSON.stringify(corners(r0, r1, b.item, region.x - off.x, region.y - off.y))}; read again after 500 ms`);
      await f.waitForTimeout(500);
      if ((await key()).key === target) r1 = await t.pixels(region);
    }
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
      const it = b.item, iy = Math.round(it.y + it.h * 0.6 - oy), ix0 = Math.round(it.x - ox), irow = [...Array(Math.round(it.w) + 12).keys()].map(k => [ix0 - 6 + k, iy]);
      t.log(`debug ${target} item row rest ${str(r0, irow)}`); t.log(`debug ${target} item row focus ${str(r1, irow)}`);
      t.log(`debug ${target} state ` + JSON.stringify(await f.evaluate(k => { const ic = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`), sym = ic && ic.querySelector('.symbol'); if (!sym) return null; const c = getComputedStyle(sym);
        const ops = []; for (let n = sym; n && n !== document.documentElement; n = n.parentElement) { const q = getComputedStyle(n); if (q.opacity !== '1' || q.filter !== 'none') ops.push([n.id || String(n.className).slice(0, 30), q.opacity, q.filter]); }
        return { outline: c.outlineColor + ' ' + c.outlineStyle + ' ' + c.outlineWidth, shadow: c.boxShadow.slice(0, 80), ops, anims: [sym, ic, ...document.querySelectorAll('#activityBar .d-abind')].flatMap(e => e.getAnimations().map(a => [e.className, a.id || a.animationName || a.transitionProperty, a.playState, +(a.effect?.getComputedTiming?.().progress ?? -1).toFixed(2)])),
          overlays: [...document.querySelectorAll('body > *')].filter(e => { const q = getComputedStyle(e); if (q.pointerEvents !== 'none' || q.display === 'none' || q.visibility === 'hidden' || q.opacity === '0') return false; const r = e.getBoundingClientRect(), s = sym.getBoundingClientRect(); return r.right > s.left && r.left < s.right && r.bottom > s.top && r.top < s.bottom; }).map(e => (e.id || String(e.className).slice(0, 40)) + ' op ' + getComputedStyle(e).opacity) }; }, target)));
      t.log(`debug ${target} over ` + JSON.stringify(await f.evaluate(([x, y, w, hh]) => [[x + 1, y + hh / 2], [x + w / 2, y + 1], [x + w / 2, y + hh - 1]].map(([px, py]) => document.elementsFromPoint(px, py).slice(0, 3).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className?.baseVal ?? e.className).split(' ').slice(0, 2).join('.'))), [b.tile.x, b.tile.y, b.tile.w, b.tile.h])));
    }
    return { key: target, lit: b.lit, focused: now.key === target && !moved, moved, brackets: b.brackets, clip: b.brackets ? null : b.clip,
      ...(b.brackets ? { corners: corners(r0, r1, b.item, ox, oy) } : { sides: bestSides(sides(r0, r1, b.tile, ox, oy, both), sides(r0, r1, b.item, ox, oy, both)) }),
      ...(named ? { names: lettersCrossed(r0, bare, r1, nameBoxes.map(q => ({ x: q.x + off.x - region.x, y: q.y + off.y - region.y, w: q.w, h: q.h }))) } : {}) };
  };
  // The mark as it is now, after a key or a click acted on the focused control (K-F96b-1: a panel closing or changing
  // under a key focus). Read first with the focus where the action left it, then at rest with the focus stepped off
  // without scrolling; the key focus is then given back by a real Tab. A control the action left without a key focus
  // (:focus-visible off) is skipped, as no mark is due.
  const markNow = async (target) => {
    const st = await f.evaluate(k => { const el = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`); return { fv: !!el && document.activeElement === el && el.matches(':focus-visible') }; }, target);
    if (!st.fv) return { key: target, focused: false, skipped: 'no key focus after the action' };
    await f.waitForTimeout(450);
    const b = await f.evaluate(boxOf, target);
    // NieR re-places its brackets a little after a press (it locks them on the chosen item first): wait for them on this
    // item, then for three still frames
    if (b.brackets) await f.waitForFunction(it => { const r = document.getElementById('o55np-reticle'); if (!r || !r.hasAttribute('data-on')) return false;
      const c = [...r.children].map(i => i.getBoundingClientRect()); if (c.length !== 4) return false;
      const box = [Math.min(...c.map(q => q.left)), Math.min(...c.map(q => q.top)), Math.max(...c.map(q => q.right)), Math.max(...c.map(q => q.bottom))];
      return [it.x - 3, it.y - 3, it.x + it.w + 3, it.y + it.h + 3].every((v, i) => Math.abs(v - box[i]) <= 8); }, b.item, { timeout: 1500 }).catch(() => {});
    if (b.brackets) await f.evaluate(() => new Promise(done => { const r = document.getElementById('o55np-reticle'), t0 = performance.now(); let last = '', still = 0;
      const step = () => { const now = r ? [...r.children].map(i => i.style.transform + getComputedStyle(i).translate).join('|') : ''; still = now === last ? still + 1 : 0; last = now;
        if (still >= 3 || performance.now() - t0 > 1500) done(); else requestAnimationFrame(step); }; requestAnimationFrame(step); }));
    const u = { x: Math.min(b.item.x, b.tile.x), y: Math.min(b.item.y, b.tile.y), r: Math.max(b.item.x + b.item.w, b.tile.x + b.tile.w), b: Math.max(b.item.y + b.item.h, b.tile.y + b.tile.h) };
    const P = 12, x = Math.max(0, Math.floor(off.x + u.x) - P), y = Math.max(0, Math.floor(off.y + u.y) - P);
    const region = { x, y, width: Math.ceil(off.x + u.r) + P + 1 - x, height: Math.min(Math.ceil(off.y + u.b) + P + 1, Math.floor(off.y + h)) - y };
    const r1 = await t.pixels(region);
    if (t.args.debug && b.brackets) t.log(`debug markNow ${target} reticle at focus ` + JSON.stringify(await f.evaluate(() => { const r = document.getElementById('o55np-reticle'); return r ? { on: r.hasAttribute('data-on'), kids: [...r.children].map(i => (q => [q.left, q.top].map(Math.round))(i.getBoundingClientRect())) } : null; })) + ' item ' + JSON.stringify(b.item));
    await f.evaluate(placeSentinel, ['#activityBar', 'before']); await focusQuiet(null); await f.waitForTimeout(350);
    // NieR locks its brackets on a clicked (or Enter-pressed) item for 1.2 s (19-nier-parts.js retChoose): the rest is
    // read once they have left it
    if (b.brackets) await f.waitForFunction(() => { const r = document.getElementById('o55np-reticle'); return !r || !r.hasAttribute('data-on') || r.getBoundingClientRect().width === 0 || [...r.children].every(i => i.getBoundingClientRect().top < -50); }, null, { timeout: 2000 }).catch(() => f.waitForTimeout(1300));
    const r0 = await t.pixels(region);
    if (t.args.debug && b.brackets) t.log(`debug markNow ${target} reticle at rest ` + JSON.stringify(await f.evaluate(() => { const r = document.getElementById('o55np-reticle'); return r ? { on: r.hasAttribute('data-on'), kids: [...r.children].map(i => (q => [q.left, q.top].map(Math.round))(i.getBoundingClientRect())), act: document.activeElement?.id || document.activeElement?.tagName } : null; })));
    const moved = await f.evaluate(([k, t0]) => { const q = document.querySelector(`#activityBar .icon[data-ab-id="${k}"]`).getBoundingClientRect(); return Math.abs(q.x - t0.x) + Math.abs(q.y - t0.y) > 0.5; }, [target, b.item]);
    await focusQuiet(await before(target)); await kb.press('Tab'); await f.waitForTimeout(150);
    const ox = region.x - off.x, oy = region.y - off.y;
    return { key: target, lit: b.lit, focused: !moved, moved, brackets: b.brackets, clip: b.brackets ? null : b.clip,
      ...(b.brackets ? { corners: corners(r0, r1, b.item, ox, oy) } : { sides: bestSides(sides(r0, r1, b.tile, ox, oy, both), sides(r0, r1, b.item, ox, oy, both)) }) };
  };
  // Frames where the lens carries the mark away from the focused control (F96b-2), sampled every frame from just before
  // a key until 900 ms after it; only a page whose rail lens can carry the mark (Glass with Liquid Glass on) can count any.
  const startLensSampler = () => f.evaluate(() => { window.__fo96s = { frames: 0, flagged: 0, away: 0 }; const t0 = performance.now();
    const step = () => { const s = window.__fo96s; s.frames++;
      const L = [...document.querySelectorAll('.lg-lens[data-lg-for="rail-icons"][data-lg-focus]')].find(x => { const c = getComputedStyle(x); return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.5; }), act = document.activeElement;
      if (L && act && act.closest && act.closest('#activityBar')) {
        s.flagged++; const a = L.getBoundingClientRect(), q = (act.querySelector('.symbol') || act).getBoundingClientRect();
        if (Math.abs((a.left + a.right) / 2 - (q.left + q.right) / 2) > 3 || Math.abs((a.top + a.bottom) / 2 - (q.top + q.bottom) / 2) > 3) s.away++; }
      if (performance.now() - t0 < 900) requestAnimationFrame(step); };
    requestAnimationFrame(step); });
  const lensSamples = () => f.evaluate(() => window.__fo96s);
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
    const m1 = reached ? await markNow(c.key) : null;
    // a real click on the open item (the key focus stays: its mark is due), then back to open by a key if it shut it
    await f.locator(`#activityBar .icon[data-ab-id="${c.key}"]`).click(); await frames(f, 4); await f.waitForTimeout(150);
    const clicked = await f.evaluate(panelState, c.key);
    await rest();   /* the pointer off the item: a resting pointer's hover covers it (Retro's hover block) */
    const mc = await markNow(c.key);
    if (!clicked.open && await tabTo(c.key)) { await kb.press('Enter'); await frames(f, 4); }
    reached = reached && await tabTo(c.key);
    const s2a = await f.evaluate(panelState, c.key);
    if (reached) { await kb.press(' '); await frames(f, 4); await f.waitForTimeout(150); }
    const s2 = await f.evaluate(panelState, c.key);
    const m2 = reached ? await markNow(c.key) : null;
    const still = await key();
    const reads = [m1, mc, m2].filter(r => r && !r.skipped);
    await t.check(`${at} ${c.key}: its key focus mark is on every side after Enter, a click and Space`, reads.length >= 2 && reads.every(r => markOk(r)), JSON.stringify([m1, mc, m2].map(brief)));
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

  // 5b. FO-98: the open state, and reorder and hide by keys (above).
  if (t.args.fo98 !== 'off') { await fo98(t, f, fo98ctx); await f.evaluate(() => PMW.chatCol.show()); }

  // 6. The painted focus mark in every look, on the two items lit by default (Chat, while the chat column shows, and
  // Files, the open panel; F96-1), an unlit item (Search) and More; then with the bar's names shown, on lit Files,
  // Search and Pipelines (its p is the bar's lowest letter), none of whose letters may be crossed or touched. In
  // Friendly Light each side is read against both its neighbours (FO-99: the accent's pale blue read under 3:1 on the
  // bar's ground; the ring now takes the accent's ink there, 80-bar.src.css).
  const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
  for (const look of looks) {
    await t.app.look(look);
    // a look change plays under a cover (NieR's switch-on reboots the screen), and NieR's brackets hold off until that
    // cover has gone, which is after it reports itself uncovered at the reveal (19-nier-parts.js rbRelease)
    await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.() &&
      window.PM_NIER?.wanted?.() === window.PM_NIER?.on?.() && !document.getElementById('o55np-reboot'), null, { timeout: 20000 }).catch(() => {});
    await frames(f, 4);
    await rest();
    both = look === 'friendly-light';
    const ok = markOk;
    const both3 = both ? ' against both its neighbours' : '';
    const rows = [await painted('chat'), await painted('files'), await painted('search'), await painted('more')];
    t.log(`${at} ${look} marks ${JSON.stringify(rows.map(brief))}`);
    await t.check(`${at} ${look}: Chat and Files are lit, Search and More are not`, rows[0]?.lit && rows[1]?.lit && rows[2] && !rows[2].lit && rows[3] && !rows[3].lit, JSON.stringify(rows.map(r => r && [r.key, r.lit])));
    await t.check(`${at} ${look}: a key focus mark on every side at 3:1 or more${both3} on lit Chat and Files, on Search and on More`, rows.every(ok), JSON.stringify(rows.map(brief)));
    // Keys acting on the open panel's icon (F96b-1): Enter (at 1920 it closes the panel), Enter again, a real click on
    // the focused icon, then Enter on Search (the panel changes, F96b-2); the mark is read after each, and no frame may
    // show the lens carrying it away from the focused control. Files is left open again.
    const acts = [];
    if (await tabTo('files')) {
      await kb.press('Enter'); await frames(f, 4); acts.push({ after: 'Enter', ...(await markNow('files')) });
      await kb.press('Enter'); await frames(f, 4); acts.push({ after: 'Enter again', ...(await markNow('files')) });
      await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await frames(f, 4); await f.waitForTimeout(150); await rest(); acts.push({ after: 'click', ...(await markNow('files')) });
      if (!(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
    }
    let lens = null;
    if (await tabTo('search')) {
      await startLensSampler(); await kb.press('Enter'); await f.waitForTimeout(950); lens = await lensSamples();
      acts.push({ after: 'Enter on Search', ...(await markNow('search')) });
    }
    if (!(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
    t.log(`${at} ${look} after keys ${JSON.stringify(acts.map(a => ({ after: a.after, ...brief(a) })))} lens ${JSON.stringify(lens)}`);
    const actsRead = acts.filter(a => !a.skipped);
    await t.check(`${at} ${look}: the key focus mark at 3:1 on every side${both3} after Enter, Enter again and a click on the open panel's icon, and after Enter changes the panel`,
      actsRead.length >= 3 && actsRead.every(ok), JSON.stringify(acts.map(a => ({ after: a.after, ...brief(a) }))));
    await t.check(`${at} ${look}: the lens never carries the mark away from the focused item when Enter changes the panel`, !!lens && lens.away === 0, JSON.stringify(lens));
    await rest();
    // the collapsed bar at rest, focus off it: every control on screen (K-F96c-2)
    await f.evaluate(placeSentinel, ['#activityBar', 'before']); await focusQuiet(null); await frames(f, 2);
    const seen6 = await f.evaluate(railAtRest);
    t.log(`${at} ${look} at rest ${JSON.stringify(seen6)}`);
    await t.check(`${at} ${look}: at rest every control of the collapsed rail is on screen`, !!seen6 && seen6.unseen.length === 0 && seen6.below.length === 0, JSON.stringify(seen6));
    // Reduced Motion, a panel shortcut with the key focus kept on the open panel's icon (K-F96d-1), and in motion a click
    // on that icon. In Glass the lens
    // carries the mark on the open panel's icon; Ctrl+2 opens another panel and the lens jumps there in one step, and
    // Ctrl+1 brings it back. Every frame for 900 ms from each key is read after layout, just before paint (a
    // ResizeObserver callback): the key-focused icon must have a mark in each (its own outline, or the flagged lens
    // painted at rest on it), and no flagged lens may be away from it (F96d-1: one frame with neither on 981463667f, the
    // lens and its ring already on Search). Reduced Motion is the app's own setting (data-motion="reduced", as Settings
    // sets it) and the media query, so both surfaces take it; both are put back after.
    if (/^glass-/.test(look)) {
      // started (and awaited) before the key is sent, so no frame after it is missed; read back once it has run ms
      const frameRead = ms => f.evaluate(ms => {
        const P = window.__fo96f = { frames: 0, none: 0, away: 0, at: [], done: false }, t0 = performance.now(), probe = document.createElement('div');
        Object.assign(probe.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
        document.body.appendChild(probe);
        const ro = new ResizeObserver(() => {
          const act = document.activeElement;
          if (!act || !act.matches || !act.matches('#activityBar .icon') || !act.matches(':focus-visible')) return;
          P.frames++;
          const sym = act.querySelector('.symbol') || act, o = getComputedStyle(sym), b = sym.getBoundingClientRect();
          const own = o.outlineStyle !== 'none' && parseFloat(o.outlineWidth) >= 2;
          const L = [...document.querySelectorAll('.lg-lens[data-lg-for="rail-icons"][data-lg-focus]')].find(x => { const c = getComputedStyle(x); return c.display !== 'none' && parseFloat(c.opacity) > 0.5; });
          let onLens = false;
          if (L) { const a = L.getBoundingClientRect(); onLens = Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) <= 3 && Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) <= 3; if (!onLens) P.away++; }
          const g = document.getElementById('d-abring'), gc = g && getComputedStyle(g), gr = g && g.getBoundingClientRect();
          const onRing = !!g && gc.display !== 'none' && gc.visibility !== 'hidden' && gr.width > 4 && Math.abs(gr.left - b.left) <= 1 && Math.abs(gr.top - b.top) <= 1 && Math.abs(gr.width - b.width) <= 1 && Math.abs(gr.height - b.height) <= 1;
          if (!own && !onLens && !onRing) { P.none++; P.at.push(Math.round(performance.now() - t0)); }
        });
        ro.observe(probe);
        let flip = false;
        const step = () => { flip = !flip; probe.style.width = flip ? '2px' : '1px'; if (performance.now() - t0 < ms) requestAnimationFrame(step); else { ro.disconnect(); probe.remove(); P.done = true; } };
        requestAnimationFrame(step);
      }, ms);
      // the side panel on screen (below 1920 it lies over the page and can be folded away while it keeps its open state)
      const shown = () => f.evaluate(() => { const s = document.getElementById('sidePanelSlot'); return !!s && s.getClientRects().length > 0 && getComputedStyle(s).display !== 'none'; });
      const was = await f.evaluate(() => { const r = document.documentElement, w = r.getAttribute('data-motion'); r.setAttribute('data-motion', 'reduced'); return w; });
      await t.page.emulateMedia({ reducedMotion: 'reduce' });
      if (!(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      if (!(await shown()) && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      const reached = await tabTo('files');
      await f.waitForTimeout(1600);
      const pre = (await f.evaluate(markOn, 'files')).any;
      const reads = [];
      for (const [k, label] of [['Control+2', 'Ctrl+2, the lens leaves it'], ['Control+1', 'Ctrl+1, the lens comes back']]) {
        await frameRead(900); await kb.press(k);
        await f.waitForFunction(() => window.__fo96f && window.__fo96f.done, null, { timeout: 5000 }).catch(() => {});
        const r = await f.evaluate(() => { const P = window.__fo96f; return { frames: P.frames, none: P.none, away: P.away, at: P.at.slice(0, 4), done: P.done }; });
        reads.push({ key: label, ...r }); await f.waitForTimeout(300);
      }
      await f.evaluate(w => { const r = document.documentElement; if (w === null) r.removeAttribute('data-motion'); else r.setAttribute('data-motion', w); }, was);
      await t.page.emulateMedia({ reducedMotion: 'no-preference' });
      if (!(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      t.log(`${at} ${look} Reduced Motion, panel shortcuts with the focus kept on Files: a mark before ${pre}, ${JSON.stringify(reads)}`);
      await t.check(`${at} ${look}: in Reduced Motion, Ctrl+2 and Ctrl+1 with the key focus kept on the open panel's icon leave it a mark in every frame, and no flagged lens away from it`,
        reached && pre && reads.every(r => r.done && r.frames > 0 && r.none === 0 && r.away === 0), JSON.stringify({ reached, pre, reads }));
      // ...and in motion, a real click on the key-focused open icon, with no key in the bar: the panel closes (at 1920) or
      // folds away (below it, where the panel lies over the page and keeps its open state), and the lens hides in one
      // step. 981463667f left one frame with no mark there. The panel is shown again after, by Enter.
      if (!(await shown()) && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      const reachedC = await tabTo('files');
      await f.waitForTimeout(1600);
      const preC = (await f.evaluate(markOn, 'files')).any;
      await frameRead(900); await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await rest();
      await f.waitForFunction(() => window.__fo96f && window.__fo96f.done, null, { timeout: 5000 }).catch(() => {});
      const click = await f.evaluate(() => { const P = window.__fo96f; return { frames: P.frames, none: P.none, away: P.away, at: P.at.slice(0, 4), done: P.done }; });
      const closed = !(await shown());
      if (closed && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      if (!(await shown()) && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
      t.log(`${at} ${look} a click on the key-focused open Files: a mark before ${preC}, panel gone ${closed}, ${JSON.stringify(click)}`);
      await t.check(`${at} ${look}: a real click on the key-focused open panel's icon leaves it a mark in every frame as the panel goes and the lens hides`,
        reachedC && preC && click.done && click.frames > 0 && click.none === 0 && click.away === 0 && closed, JSON.stringify({ reachedC, preC, closed, click }));
    }
    // the bar with its names shown (the toggle)
    await f.evaluate(() => document.getElementById('activityBarToggle').click());
    await f.waitForFunction(() => !document.getElementById('activityBar').classList.contains('collapsed'), null, { timeout: 5000 }).catch(() => {});
    await f.waitForTimeout(900);
    await f.evaluate(placeSentinel, ['#activityBar', 'before']); await focusQuiet(null); await frames(f, 2);
    const seenW = await f.evaluate(railAtRest);
    t.log(`${at} ${look} names shown, at rest ${JSON.stringify(seenW)}`);
    await t.check(`${at} ${look}, names shown: at rest every rail control is on screen, or the bar scrolls to it`, !!seenW && seenW.unseen.length === 0, JSON.stringify(seenW));
    // Chat (the first item, K-F96b-2), lit Files, Search and Pipelines (its p is the bar's lowest letter)
    const wide = [await painted('chat'), await painted('files'), await painted('search'), await painted('repository_automation')];
    t.log(`${at} ${look} names shown, marks ${JSON.stringify(wide.map(brief))}`);
    await t.check(`${at} ${look}, names shown: a key focus mark on every side at 3:1 or more${both3} on Chat, lit Files, Search and Pipelines, and no name's letters in view are crossed or touched`,
      wide.every(ok) && wide[1]?.lit && wide.every(r => r && r.names && r.names.letters >= 15 && r.names.crossed === 0), JSON.stringify(wide.map(brief)));
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
    // A family change with the key focus kept on the open panel's icon (K-F96c-1). In Glass the lens carries the mark;
    // in the look it changes to (Basic, then Retro, each from this Glass look) the icon draws its own at once, with no
    // focus flag left behind (F96c-1). The change is made with the rail idle (1.6 s on the icon: no sync of the lens
    // still queued, which on b622109459 could clear the flag by chance). Last in the look, as the next look is set by
    // the loop.
    if (/^glass-/.test(look)) {
      const flags = async () => ({ ...(await f.evaluate(() => { const i = document.querySelector('#activityBar .icon[data-ab-id="files"]'), L = document.querySelector('.lg-lens[data-lg-for="rail-icons"]');
        return { theme: document.documentElement.getAttribute('data-theme'), iconFlag: !!i && i.hasAttribute('data-lg-focus'), lensFlag: !!L && L.hasAttribute('data-lg-focus'), keyFocus: !!i && document.activeElement === i && i.matches(':focus-visible') }; })), mark: (await f.evaluate(markOn, 'files')).any });
      for (const fam of ['basic', 'retro']) {
        if (fam !== 'basic') {
          await t.app.look(look);
          await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), null, { timeout: 20000 }).catch(() => {});
          await frames(f, 4); await rest();
        }
        if (!(await f.evaluate(panelState, 'files')).open && await tabTo('files')) { await kb.press('Enter'); await frames(f, 4); }
        const reached = await tabTo('files');
        await f.waitForTimeout(1600);
        const pre = await flags();
        await f.evaluate(fam => PM_THEME.setFamily(fam, { persist: false }), fam);
        await f.waitForFunction(fam => (document.documentElement.getAttribute('data-theme') || '').startsWith(fam + '-') && !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.(), fam, { timeout: 20000 }).catch(() => {});
        await frames(f, 4);
        const post = await flags(), r = await markNow('files');
        t.log(`${at} ${look} -> ${fam} with the focus kept: before ${JSON.stringify(pre)}, after ${JSON.stringify(post)}, mark ${JSON.stringify(brief(r))}`);
        await t.check(`${at} ${look}: a change to ${fam} with the key focus kept on the open panel's icon leaves it its own mark at 3:1 on every side and no focus flag`,
          reached && pre.keyFocus && pre.mark && post.keyFocus && !post.iconFlag && !post.lensFlag && !r.skipped && markOk(r), JSON.stringify({ pre, post, mark: brief(r) }));
      }
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
