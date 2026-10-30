/* src/logo/pm-logo.js: Pip, the Puppet Master mark. The one drawing kit (DR-076, F3-660) for the title-bar mark, the
 * favicon, the app and tray icons, the notification and status faces, the system loader (pm-loader.js) and every live
 * Pip (onboarding's stage, the chat's sheet hosts). OWNER: pm7-found (PM7 build, 2026-10-29).
 *
 * Vendored from the approved concept Concepts/Icon-Concepts/Opus5.5icon/pm-logo.js v0.3 ("Ok pip is perfect!",
 * Jared 2026-10-26) and changed for product use (HANDOFF W1 "Changes the kit needs"):
 *   - Colours come from the look's tokens. In the page a mark is drawn with colour roles (--pip-ctl, --pip-head ...,
 *     src/logo/pm-logo.css) that read --accent-primary, --text-primary, --background and the NieR inks, so a look, a
 *     light/dark switch or an accent colour repaints Pip with no redraw. EXPORT below is used only where no page exists
 *     (Node, a downloaded file, another look than the one painted): the concept's palette, sampled from those tokens.
 *   - One shared stylesheet per family x motion x tier (<style id="pm-logo-anim">, made on first use) and one shared
 *     <defs> per family (#pm-logo-defs-<family>), so an animated mark is classes only: no inline <style> and no ids of
 *     its own. The markup is a pure function of its options (no random or per-render ids), which the chat's reconciler
 *     and its id-stripping sheet-exit copy need.
 *   - Accessibility: an animated mark is always decorative (aria-hidden); its host carries aria-busy or role=status
 *     (pm-loader.js does). A still mark is role=img with a label unless asked to be decorative.
 *   - One look per size at every dpr: the tier follows the logical size (micro <= 18 px: hand-placed sprites; small
 *     19-40 px: the heavier cut; full > 40 px), never the device pixels.
 *   - The still pose is every animated mark's base markup (pixel frames 1-7 carry opacity="0"), so a renderer that
 *     ignores CSS (a tray image, Slint's SVG loader) shows the finished mark.
 *   - Every mood: idle, happy, alert (shown as wonder), error, sleep, think, wink, watch, oops, and working's dots, at
 *     every tier and in NieR.
 *   - NieR: square nodes everywhere; every mark shows the eyes through the band, static marks still (Decision X3 B,
 *     Jared 2026-10-30; the 16 px sprite's eyes are hand-placed); { eyes: false } draws the plain band.
 *   - Retro redraws its strings as pixel lines in every frame; Glass has no brow band.
 *   - The monogram direction is not carried (Jared: Pip, not the PM monogram).
 *
 * API (window.PMLogo; full reference in the build share's lanes/found/API.md)
 *   mark(o) -> svg markup for the page. o: { look?, px = 24, mood = 'idle', motion = null | 'swing' | 'think' | 'hop',
 *            form = 'glyph' | 'tray', ink? (tray), eyes? (NieR: default true, X3 B; false = plain band), title?, decorative?,
 *            cls?, vars? }
 *            look defaults to the painted look (look()). An animated mark animates only under an ancestor with
 *            data-pml-run="on" (pm-loader.js arms it); NieR marks never animate.
 *   svg(o) -> a self-contained file (inline <style>, literal colours), the concept's API: { theme | look, form =
 *            'glyph' | 'tile' | 'tray', px, dpr, mood, motion, reduced, title, decorative, tier, prefix, tokens }.
 *   dataUrl(o) -> a still mark as a data: URL; favicon(px = 32) -> the app icon's data: URL (A1: Basic Dark tile).
 *   look() -> the painted look id ('friendly-dark', ..., 'nier-light'); family(look), scheme(look); onLook(cb).
 *   tierFor(px) -> 'micro' | 'small' | 'full'; period({ look | family, motion, px }) -> ms at speed 1.
 *   MOODS, MOOD_STATUS (mood -> status key), STATUS_FACE (status key -> mood), trayFace(states) (A3), moodFor(key).
 *   clock: the one clock for every Pip motion: now(), phase(ms), delay(ms), speed(), hold(why), release(why),
 *          held(), on(cb).
 *   solver: strings(tier, ctlAt, place, style) -> [{ T, E, ringC }], pose(motion, family, u), transforms(tier, pose).
 *   kit: the drawing parts (geometry, faces, control, head, NieR parts) for live rigs. */
(function (G) {
  'use strict';
  if (G.PMLogo && G.PMLogo.product) return;
  const D = typeof document !== 'undefined' ? document : null;

  /* ------------------------------------------------------------------ looks */
  const LOOKS = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'basic-dark', 'basic-light', 'retro-dark', 'retro-light', 'nier-light', 'nier-dark'];
  const FAMILIES = ['friendly', 'glass', 'basic', 'retro', 'nier'];
  const familyOf = (look) => { const f = String(look || '').split('-')[0]; return FAMILIES.indexOf(f) >= 0 ? f : 'basic'; };
  const schemeOf = (look) => (/-light$/.test(String(look || '')) ? 'light' : 'dark');

  /* The export palette: the concept's values, which were PMConcept7's computed tokens for each look (sampled
     2026-10-26). Used only where no page is painted in that look (Node, downloads, Demo Studio's other looks); the page
     draws with the colour roles in pm-logo.css. W9 locks the final values in Plans. */
  const EXPORT = {
    'friendly-dark': { bg: '#211E26', ctl: '#C3B1E4', pin: '#9C87C8', str: '#9A93A6', head: ['#86D3F0', '#5BB6DD'], eye: '#272230', cheek: '#FFB4A6', sheen: .32, shine: true,
      tile: { kind: 'soft', stops: ['#3B3647', '#24212B'], glow: 'rgba(111,198,232,.22)', edge: 'rgba(255,255,255,.09)' } },
    'friendly-light': { bg: '#FBF7F3', ctl: '#9678C9', pin: '#7A5DB0', str: '#ADA5B6', head: ['#5BB4DC', '#3893BF'], eye: '#2F2A36', cheek: '#FFA68C', sheen: .3, shine: true,
      tile: { kind: 'soft', stops: ['#FFFFFF', '#F1EAF4'], glow: 'rgba(90,185,224,.20)', edge: 'rgba(122,109,140,.16)' } },
    'glass-dark': { bg: '#04060D', ctl: '#F6F8FC', pin: '#74B9FF', str: '#B9C2D2', head: '#86C1FF', eye: '#071026', cheek: '#FF86C2', shine: true,
      glass: { tint: ['#D2E8FF', '#8DC5FF', '#5FA8F5'], alpha: .8, frost: 'rgba(255,255,255,.10)', rimTop: 'rgba(255,255,255,.95)', rimBot: 'rgba(255,255,255,.38)', edge: 'rgba(4,10,30,.55)', drop: 'rgba(0,2,12,.55)', rod: '#EEF2F8' },
      tile: { kind: 'liquid', wall: 'dark', veil: 'rgba(4,6,13,.34)', edgeTop: 'rgba(255,255,255,.34)', edgeBot: 'rgba(0,0,0,.28)' } },
    'glass-light': { bg: '#EEF1F6', ctl: '#262E3E', pin: '#005FCC', str: '#5B6476', head: '#4E9BF2', eye: '#0C0F15', cheek: '#FF86C2', shine: true,
      glass: { tint: ['#B9DAFF', '#5EA6F6', '#2F80E2'], alpha: .88, frost: 'rgba(255,255,255,.18)', rimTop: 'rgba(255,255,255,.98)', rimBot: 'rgba(255,255,255,.6)', edge: 'rgba(30,45,90,.30)', drop: 'rgba(30,45,90,.30)', rod: '#2A3242' },
      tile: { kind: 'liquid', wall: 'light', veil: 'rgba(255,255,255,.22)', edgeTop: 'rgba(255,255,255,.95)', edgeBot: 'rgba(30,45,90,.16)' } },
    'basic-dark': { bg: '#121212', ctl: '#E8E8E8', pin: '#9E9E9E', str: '#7A8290', head: '#64B5F6', eye: '#121212', cheek: null,
      tile: { kind: 'flat', stops: ['#2D2D2D', '#2D2D2D'], edge: 'rgba(255,255,255,.08)' } },
    'basic-light': { bg: '#EAECEF', ctl: '#2B2B2B', pin: '#5C6470', str: '#8A929C', head: '#0056B3', eye: '#FFFFFF', cheek: null,
      tile: { kind: 'flat', stops: ['#FFFFFF', '#FFFFFF'], edge: '#C9CDD3' } },
    'retro-dark': { bg: '#10120E', ctl: '#DFE6CF', str: '#8F9A7C', head: '#86C46A', cheek: '#E9853F', eye: '#10120E', pixel: true,
      tile: { kind: 'retro', stops: ['#1E2219', '#1E2219'], edge: '#4A533A', shadow: 'rgba(224,224,224,.55)' } },
    'retro-light': { bg: '#F5F0E8', ctl: '#1A1A1A', str: '#6A665E', head: '#2F7A3D', cheek: '#FF1493', eye: '#F5F0E8', pixel: true,
      tile: { kind: 'retro', stops: ['#FAF7F2', '#FAF7F2'], edge: '#1A1A1A', shadow: '#1A1A1A' } },
    'nier-light': { bg: '#CCC8B1', ink: '#211F1B', paper: '#D1CDB7', red: '#A94A38', ctl: '#211F1B', str: '#211F1B', head: '#211F1B', cheek: null, nier: true,
      tile: { kind: 'nier', stops: ['#D1CDB7', '#C6C2AB'], edge: '#211F1B', grid: 'rgba(33,31,27,.07)' } },
    'nier-dark': { bg: '#2F2D26', ink: '#D1CDB7', paper: '#36342C', red: '#C96B57', ctl: '#D1CDB7', str: '#D1CDB7', head: '#D1CDB7', cheek: null, nier: true,
      tile: { kind: 'nier', stops: ['#36342C', '#2B2922'], edge: '#D1CDB7', grid: 'rgba(209,205,183,.06)' } }
  };

  /* Each family moves the way its look already moves in PMConcept7 (W5): Friendly springs 1.8 s, Glass glides 2.6 s,
     Basic eases 1.7 s, Retro flips eight pixel frames in 1.2 s. NieR never animates. */
  const MOTION = {
    friendly: { dur: 1.8, amp: 1, wave: 'spring', label: 'spring' },
    glass: { dur: 2.6, amp: .85, wave: 'glide', label: 'glide' },
    basic: { dur: 1.7, amp: .7, wave: 'sine', label: 'ease' },
    retro: { dur: 1.2, amp: 1, wave: 'frames', label: '8 frames' }
  };
  const MOTIONS = ['swing', 'think', 'hop'];

  /* ---------------------------------------------------------------- helpers */
  const R = (v) => +(+v).toFixed(2);
  const D2R = Math.PI / 180;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const line = (a, b, w, c, cap, extra) => `<line x1="${R(a[0])}" y1="${R(a[1])}" x2="${R(b[0])}" y2="${R(b[1])}" stroke="${c}" stroke-width="${R(w)}" stroke-linecap="${cap || 'round'}"${extra || ''}/>`;
  function mix(a, b, t) {
    const h = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const solid = (v) => Array.isArray(v) ? (v[0].charAt(0) === '#' ? mix(v[0], v[v.length - 1], .5) : v[v.length - 1]) : v;
  function grad(id, stops, x1, y1, x2, y2) {
    const n = stops.length - 1;
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${R(x1)}" y1="${R(y1)}" x2="${R(x2)}" y2="${R(y2)}">${stops.map((c, i) => `<stop offset="${R(i / n)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }
  /* Options that reach markup are checked here, at the owner (the loader's html() does the same): a class token, an id
     or selector stem, a CSS custom property name and a colour each have one accepted shape; anything else is dropped. */
  const CLS_TOKEN = /^-?[_a-zA-Z][\w-]*$/;
  const safeCls = (v) => String(v == null ? '' : v).split(/\s+/).filter((t) => CLS_TOKEN.test(t)).join(' ');
  const safeStem = (v) => (typeof v === 'string' && /^[a-zA-Z][\w-]{0,40}$/.test(v) ? v : null);
  const COLOR = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,24}|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([0-9a-zA-Z.,%\s/+-]*\)|var\(--[\w-]+\))$/;
  const safeColor = (v) => (typeof v === 'string' && COLOR.test(v.trim()) ? v.trim() : null);
  const safeVar = (v) => (typeof v === 'number' && isFinite(v) ? String(v) : safeColor(v));
  const rot = (p, c, deg) => { const a = deg * D2R, s = Math.sin(a), k = Math.cos(a); const x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * k - y * s, c[1] + x * s + y * k]; };

  /* --------------------------------------------------------------- geometry */
  // full: every detail. small: heavier strokes for 19-40 px (the 40 px title bar's 24 px mark).
  const GEO = {
    full: { P: [32, 14.5], half: 22, ang: 20, w: 6, tip: 5, head: { x0: 14, x1: 50, y0: 31.5, y1: 59.5, r: 11, nub: 5 }, eyeletX: [19.5, 44.5], ring: 1.5, ringW: 1.15, strW: 1.5,
      eye: { dx: 6, y: 44, r: 3.6 }, mouth: { w: 7, y: 51.1, d: 3.4, sw: 2.6 }, detail: true },
    small: { P: [32, 14.5], half: 23, ang: 20, w: 7.5, tip: 5, head: { x0: 12, x1: 52, y0: 30.5, y1: 61, r: 11, nub: 4.2 }, eyeletX: [19, 45], ring: 0, ringW: 0, strW: 3,
      eye: { dx: 7, y: 44.5, r: 4.4 }, mouth: { w: 9, y: 53, d: 3.8, sw: 3.6 }, detail: false }
  };
  function sticks(g) {
    const [cx, cy] = g.P, dx = g.half * Math.cos(g.ang * D2R), dy = g.half * Math.sin(g.ang * D2R);
    // s1: the back stick, upper-left to lower-right. s2: the front stick, lower-left to upper-right.
    return { s1: [[cx - dx, cy - dy], [cx + dx, cy + dy]], s2: [[cx - dx, cy + dy], [cx + dx, cy - dy]] };
  }
  // string anchors sit 5 units in from the two lower tips: left on the front stick, right on the back one
  function anchors(g) {
    const { s1, s2 } = sticks(g), c = Math.cos(g.ang * D2R), s = Math.sin(g.ang * D2R);
    return [[s2[0][0] + g.tip * c, s2[0][1] - g.tip * s], [s1[1][0] - g.tip * c, s1[1][1] - g.tip * s]];
  }
  // Each stick gets its hardware on its underside; n is the stick's downward normal, so it never sits across the bar.
  function barAttach(g) {
    const { s1, s2 } = sticks(g), A = anchors(g), sa = Math.sin(g.ang * D2R), ca = Math.cos(g.ang * D2R);
    const n = [[sa, ca], [-sa, ca]];
    return A.map((a, i) => ({ a, n: n[i], stick: i === 0 ? s2 : s1, front: i === 0 }));
  }
  function headTopY(h, x) {
    const { x0, x1, y0, r } = h;
    if (x < x0 + r) { const d = x0 + r - x; return y0 + r - Math.sqrt(Math.max(0, r * r - d * d)); }
    if (x > x1 - r) { const d = x - (x1 - r); return y0 + r - Math.sqrt(Math.max(0, r * r - d * d)); }
    return y0;
  }
  // where each string ends on Pip, at rest: a screw eye on the head whose lower half tucks into it
  function eyelets(g) {
    return g.eyeletX.map((x) => {
      const top = headTopY(g.head, x);
      return g.ring ? { x, base: top, ring: [x, top - g.ring * .45], end: [x, top - g.ring * 1.45] } : { x, base: top, ring: null, end: [x, top + 1.2] };
    });
  }
  /* The solver: the two points a string runs between, for any pose. ctlAt(p) maps a point of the control to where it
     is now, place(p) a point of Pip. With eyes at both ends the string leaves each eye on the side facing the other,
     the way a real string pulls on a screw eye. One solver for the still mark, every loader frame and every live rig. */
  function stringEnds(g, style, ctlAt, place) {
    const bars = barAttach(g), eyes = eyelets(g);
    return bars.map((b, i) => {
      const e = eyes[i];
      if (style === 'eye' && g.ring) {
        const rc = [b.a[0] + b.n[0] * (g.w / 2 + g.ring * .45), b.a[1] + b.n[1] * (g.w / 2 + g.ring * .45)];
        const C = ctlAt(rc), H = place(e.ring), vx = H[0] - C[0], vy = H[1] - C[1], l = Math.hypot(vx, vy) || 1;
        return { T: [C[0] + vx / l * g.ring, C[1] + vy / l * g.ring], E: [H[0] - vx / l * g.ring, H[1] - vy / l * g.ring], ringC: rc };
      }
      // threaded through the bar: the string starts at the stick's centre line, hidden under it
      return { T: ctlAt(b.a), E: place(e.end), ringC: null };
    });
  }
  function headPath(h) {
    const { x0, x1, y0, y1, r, nub } = h, ym = (y0 + y1) / 2, k = nub * 1.15;
    return `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${R(ym - k)}Q${x1} ${ym} ${x1 + nub} ${ym}Q${x1} ${ym} ${x1} ${R(ym + k)}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${R(ym + k)}Q${x0} ${ym} ${x0 - nub} ${ym}Q${x0} ${ym} ${x0} ${R(ym - k)}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
  }
  // NieR: a machined head, chamfered corners and angled brace points
  function headPathNier(h, inset) {
    const i = inset || 0, x0 = h.x0 + i, x1 = h.x1 - i, y0 = h.y0 + i, y1 = h.y1 - i, c = 4.2 - i * .4, ym = (h.y0 + h.y1) / 2, nub = Math.max(0, h.nub - i * .9), k = h.nub * 1.1 - i * .2;
    return `M${R(x0 + c)} ${R(y0)}H${R(x1 - c)}L${R(x1)} ${R(y0 + c)}V${R(ym - k)}L${R(x1 + nub)} ${R(ym)}L${R(x1)} ${R(ym + k)}V${R(y1 - c)}L${R(x1 - c)} ${R(y1)}H${R(x0 + c)}L${R(x0)} ${R(y1 - c)}V${R(ym + k)}L${R(x0 - nub)} ${R(ym)}L${R(x0)} ${R(ym - k)}V${R(y0 + c)}Z`;
  }

  /* --------------------------------------------------------------- the face */
  // Shapes in one ink. Tray templates punch them out instead.
  function faceShapes(g, mood, ink, opts) {
    const cx = 32, { dx, y, r } = g.eye, m = g.mouth, L = cx - dx, Rx = cx + dx;
    const st = (d, w) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${R(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const dot = (x, yy, rr) => `<circle cx="${R(x)}" cy="${R(yy)}" r="${R(rr)}" fill="${ink}"/>`;
    const shine = (x, yy, rr) => opts.shine ? `<circle cx="${R(x + rr * .36)}" cy="${R(yy - rr * .38)}" r="${R(rr * .32)}" fill="#fff"/>` : '';
    const c = opts.cls || {};
    const eyes = (inner) => `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${inner}</g></g>`;
    const smile = st(`M${R(cx - m.w / 2)} ${m.y}Q${cx} ${R(m.y + m.d)} ${R(cx + m.w / 2)} ${m.y}`, m.sw);
    switch (mood) {
      case 'happy': {
        const arc = (x) => `M${R(x - r)} ${R(y + r * .5)}Q${x} ${R(y - r * 1.25)} ${R(x + r)} ${R(y + r * .5)}`;
        return eyes(st(arc(L) + arc(Rx), r * .78)) +
          `<path d="M${R(cx - m.w * .62)} ${R(m.y - .6)}Q${cx} ${R(m.y + m.d * 2.1)} ${R(cx + m.w * .62)} ${R(m.y - .6)}Z" fill="${ink}" stroke="${ink}" stroke-width="${R(m.sw * .6)}" stroke-linejoin="round"/>`;
      }
      // 'wonder' is this face by onboarding's name for it: big eyes and a round mouth
      case 'alert': case 'wonder':
        return eyes(dot(L, y - .5, r * 1.22) + dot(Rx, y - .5, r * 1.22) + shine(L, y - .5, r * 1.22) + shine(Rx, y - .5, r * 1.22)) + `<ellipse cx="${cx}" cy="${R(m.y + 1.2)}" rx="${R(m.w * .22)}" ry="${R(m.w * .27)}" fill="${ink}"/>`;
      case 'error': {
        const x = (xx) => `M${R(xx - r)} ${R(y - r)}L${R(xx + r)} ${R(y + r)}M${R(xx + r)} ${R(y - r)}L${R(xx - r)} ${R(y + r)}`;
        return eyes(st(x(L) + x(Rx), r * .66)) + st(`M${R(cx - m.w / 2)} ${R(m.y + 1.6)}Q${R(cx - m.w / 4)} ${R(m.y)} ${cx} ${R(m.y + 1.6)}T${R(cx + m.w / 2)} ${R(m.y + 1.6)}`, m.sw * .85);
      }
      case 'watch': {
        // interested in a choice: bright eyes glancing up to one side, that side's brow lifted, a small smile turned the same way
        const ex = r * .42, ey = -r * .5, er = r * 1.05, gx = Rx + ex;
        const brow = st(`M${R(gx - r * 1.15)} ${R(y - r * 1.95)}Q${R(gx - r * .1)} ${R(y - r * 2.8)} ${R(gx + r * 1.1)} ${R(y - r * 2.2)}`, r * .48);
        return `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${dot(L + ex, y + ey, er) + dot(gx, y + ey, er) + shine(L + ex, y + ey, er) + shine(gx, y + ey, er)}</g>${brow}</g>`
          + st(`M${R(cx - m.w * .26)} ${R(m.y)}Q${R(cx + m.w * .08)} ${R(m.y + m.d * 1.1)} ${R(cx + m.w * .42)} ${R(m.y)}`, m.sw * .9);
      }
      case 'oops': {
        // something went wrong (a sign-in failed, a key was refused): worried brows, a wobbly mouth, a bead of sweat
        const brow = (xx, s) => `M${R(xx - s * r * 1.15)} ${R(y - r * 1.5)}L${R(xx + s * r * .95)} ${R(y - r * 2.25)}`;
        const qx = Rx + r * 2.35, qy = y - r * 1.55;
        const drop = g.detail ? `<path d="M${R(qx)} ${R(qy - 2.7)}C${R(qx + 2)} ${R(qy - .2)} ${R(qx + 2)} ${R(qy + 2)} ${R(qx)} ${R(qy + 2)}C${R(qx - 2)} ${R(qy + 2)} ${R(qx - 2)} ${R(qy - .2)} ${R(qx)} ${R(qy - 2.7)}Z" fill="#fff" fill-opacity=".92" stroke="${ink}" stroke-width=".55"/>` : '';
        return `<g class="${c.eyes || ''}"><g class="${c.blink || ''}">${dot(L, y + .4, r * .9) + dot(Rx, y + .4, r * .9) + shine(L, y + .4, r * .9) + shine(Rx, y + .4, r * .9)}</g>${st(brow(L, 1) + brow(Rx, -1), r * .5)}</g>`
          + st(`M${R(cx - m.w * .45)} ${R(m.y + 1)}Q${R(cx - m.w * .22)} ${R(m.y - .7)} ${cx} ${R(m.y + 1)}T${R(cx + m.w * .45)} ${R(m.y + 1)}`, m.sw * .85) + drop;
      }
      case 'sleep': {
        const cl = (xx) => `M${R(xx - r)} ${R(y)}Q${xx} ${R(y + r * 1.15)} ${R(xx + r)} ${R(y)}`;
        return eyes(st(cl(L) + cl(Rx), r * .7)) + `<ellipse cx="${cx}" cy="${R(m.y + 1.4)}" rx="${R(m.w * .14)}" ry="${R(m.w * .18)}" fill="${ink}"/>`;
      }
      case 'think':
        return eyes(dot(L + r * .35, y - r * .45, r) + dot(Rx + r * .35, y - r * .45, r) + shine(L + r * .35, y - r * .45, r) + shine(Rx + r * .35, y - r * .45, r)) + st(`M${R(cx - m.w * .2)} ${R(m.y + 1.2)}H${R(cx + m.w * .45)}`, m.sw * .9);
      case 'dots': {
        const dr = r * .8, gap = r * 2.35;
        return [-1, 0, 1].map((i) => `<g class="${(c.dot || '') + (i + 2)}">${dot(cx + i * gap, y + 2.5, dr)}</g>`).join('');
      }
      case 'wink': {
        const arc = `M${R(Rx - r)} ${R(y + r * .2)}Q${Rx} ${R(y - r * 1.05)} ${R(Rx + r)} ${R(y + r * .2)}`;
        return eyes(dot(L, y, r) + shine(L, y, r) + st(arc, r * .78)) + st(`M${R(cx - m.w / 2)} ${m.y}Q${R(cx + m.w * .1)} ${R(m.y + m.d * 1.15)} ${R(cx + m.w / 2 + .6)} ${R(m.y - .8)}`, m.sw);
      }
      case 'blank': return '';
      default:
        return eyes(dot(L, y, r) + dot(Rx, y, r) + shine(L, y, r) + shine(Rx, y, r)) + smile;
    }
  }

  /* ------------------------------------------------------ Pip, vector looks */
  function controlSvg(g, th, cls, opts) {
    const { s1, s2 } = sticks(g), cap = 'round';
    const tray = opts.tray, glass = !tray && th.glass;
    const col = tray ? opts.ink : glass ? th.glass.rod : th.ctl;
    // the back stick is shaded with a solid colour, never transparency, so nothing shows through it
    const back = tray || th.flatCtl || !g.detail ? col : (glass ? th.glass.rodBack : th.back);
    const style = opts.attach || 'eye', strc = tray ? opts.ink : th.str;
    let under = '';
    if (g.detail && !tray) {
      stringEnds(g, style, (q) => q, (q) => q).forEach((e) => {
        // a screw eye on the bar's underside, its top tucked under the stick, matching the one on Pip
        if (e.ringC) under += `<circle cx="${R(e.ringC[0])}" cy="${R(e.ringC[1])}" r="${g.ring}" fill="none" stroke="${strc}" stroke-width="${g.ringW}"/>`;
      });
    }
    let s = under + line(s1[0], s1[1], g.w, back, cap) + line(s2[0], s2[1], g.w, col, cap);
    if (glass && g.detail) {
      // glass rods: a fine specular line along the upper edge of each stick
      const sa = Math.sin(g.ang * D2R), ca = Math.cos(g.ang * D2R), k = g.w * .24;
      const up1 = [sa * k, -ca * k], up2 = [-sa * k, -ca * k];
      const hl = th.scheme === 'dark' ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.75)';
      const h1 = shorten(s1.map((q) => [q[0] + up1[0], q[1] + up1[1]]), 2.4), h2 = shorten(s2.map((q) => [q[0] + up2[0], q[1] + up2[1]]), 2.4);
      s += line(h1[0], h1[1], .9, hl, 'round', ' opacity=".55"') + line(h2[0], h2[1], .9, hl, 'round');
    }
    if (g.detail && !tray) s += `<circle cx="${g.P[0]}" cy="${g.P[1]}" r="1.55" fill="${th.pin || th.str}"/>`;
    return `<g class="${cls.ctl || ''}">${s}</g>`;
  }
  function shorten(seg, k) {
    const [a, b] = seg, l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l;
    return [[a[0] + ux * k, a[1] + uy * k], [b[0] - ux * k, b[1] - uy * k]];
  }

  function pipHead(g, th, mood, ids, cls, opts) {
    const h = g.head, d = headPath(h), tray = opts.tray;
    let defs = '', s = '';
    if (tray) {
      // one ink with the face punched out: a valid macOS template image
      defs += `<mask id="${ids.face}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/><g>${faceShapes(g, mood, '#000', { cls: {} })}</g></mask>`;
      s += `<path d="${d}" fill="${opts.ink}" mask="url(#${ids.face})"/>`;
      return { defs, body: s };
    }
    if (th.glass) {
      const gl = th.glass, { x0, x1, y0, y1 } = h, cxh = (x0 + x1) / 2;
      defs += grad(ids.grad, gl.tint, x0, y0, x1 - 4, y1);
      defs += `<clipPath id="${ids.clip}"><path d="${d}"/></clipPath>`;
      defs += `<linearGradient id="${ids.rim}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="${gl.rimTop}"/><stop offset=".3" stop-color="${gl.rimTop}" stop-opacity="0"/><stop offset=".72" stop-color="${gl.rimBot}" stop-opacity="0"/><stop offset="1" stop-color="${gl.rimBot}"/></linearGradient>`;
      defs += `<radialGradient id="${ids.glow}" cx="${cxh}" cy="${y1 + 2}" r="${R((x1 - x0) * .55)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${th.scheme === 'dark' ? .55 : .7}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      defs += `<radialGradient id="${ids.spec}" cx="${x0 + 9}" cy="${y0 + 6}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      if (g.detail) defs += `<filter id="${ids.drop}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="${gl.drop}"/></filter>`;
      let refr = '';
      if (opts.backdrop && g.detail) {
        // on the app tile the wallpaper is known: show it through the glass, magnified and frosted
        const bd = opts.backdrop, k = 64 / bd.size, rb = ribbonsSvg(bd.wall, ids.grad + 'w');
        defs += rb.defs + `<filter id="${ids.grad}f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.1"/></filter>`;
        const cy = (y0 + y1) / 2;
        refr = `<g clip-path="url(#${ids.clip})"><g filter="url(#${ids.grad}f)" transform="translate(${cxh} ${cy}) scale(1.16) translate(${-cxh} ${-cy}) scale(${R(k)}) translate(${-bd.x} ${-bd.y})">${rb.body}</g></g>`;
      }
      s += `<g${g.detail ? ` filter="url(#${ids.drop})"` : ''}>${refr}<path d="${d}" fill="url(#${ids.grad})" fill-opacity="${refr ? gl.alpha * .62 : g.detail ? gl.alpha : 1}"/>`;
      s += `<path d="${d}" fill="${gl.frost}"/>`;
      if (g.detail) {
        s += `<g clip-path="url(#${ids.clip})"><rect x="${x0 - 6}" y="${y0}" width="${x1 - x0 + 12}" height="${y1 - y0}" fill="url(#${ids.glow})"/>`;
        s += `<ellipse cx="${x0 + 9}" cy="${y0 + 6}" rx="13" ry="9" fill="url(#${ids.spec})"/>`;
        s += `<path d="${d}" fill="none" stroke="url(#${ids.rim})" stroke-width="2.6"/></g>`;
      } else s += `<path d="${d}" fill="none" stroke="url(#${ids.rim})" stroke-width="4" clip-path="url(#${ids.clip})"/>`;
      s += `<path d="${d}" fill="none" stroke="${gl.edge}" stroke-width="${g.detail ? .6 : 1}"/></g>`;
    } else {
      const fill = Array.isArray(th.head) ? (defs += grad(ids.grad, th.head, 0, h.y0, 0, h.y1), `url(#${ids.grad})`) : th.head;
      s += `<path d="${d}" fill="${fill}"/>`;
      if (th.sheen && g.detail) {
        // a soft vinyl-toy highlight in one corner (never a band across the top)
        defs += `<radialGradient id="${ids.spec}" cx="${h.x0 + 8}" cy="${h.y0 + 6}" r="10" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="${th.sheen}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
        defs += `<clipPath id="${ids.clip}"><path d="${d}"/></clipPath>`;
        s += `<ellipse cx="${h.x0 + 8}" cy="${h.y0 + 6}" rx="11" ry="8" fill="url(#${ids.spec})" clip-path="url(#${ids.clip})"/>`;
      }
    }
    if (g.detail && th.cheek && mood !== 'error' && mood !== 'dots') {
      const cy = g.eye.y + 6.2, op = th.glass ? .75 : .95;
      s += `<ellipse cx="${32 - g.eye.dx - 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity="${op}"/><ellipse cx="${32 + g.eye.dx + 4.2}" cy="${cy}" rx="3.1" ry="1.9" fill="${th.cheek}" opacity="${op}"/>`;
    }
    s += `<g class="${cls.face || ''}">${faceShapes(g, mood, th.eye, { cls, shine: g.detail && th.shine })}</g>`;
    return { defs, body: s };
  }

  function eyeletRings(g, th, opts) {
    if (!g.ring || opts.tray) return '';
    return eyelets(g).map((e) => `<circle cx="${R(e.ring[0])}" cy="${R(e.ring[1])}" r="${g.ring}" fill="none" stroke="${th.str}" stroke-width="${g.ringW}"/>`).join('');
  }

  /* -------------------------------------------------------------- Pip, NieR */
  // YoRHa Pip: hairline line art like PMConcept7's own Pod, a blindfold band, square nodes where lines end, the diamond.
  function nierHud(cy, mood, paper, red, cls, eyes, small) {
    // idle shows two eyes through the blindfold on every mark (X3 B, Jared 2026-10-30): still on static marks, blinking
    // on a live Pip; eyes: false draws the plain band. Every other state lights up on the band like a HUD.
    const cx = 32, dx = 6.5;
    const rect = (x, yy, w, h, c) => `<rect x="${R(x)}" y="${R(yy)}" width="${R(w)}" height="${R(h)}" fill="${c || paper}"/>`;
    const st = (d, w, c) => `<path d="${d}" fill="none" stroke="${c || paper}" stroke-width="${R(w)}" stroke-linecap="square" stroke-linejoin="miter"/>`;
    const both = (f) => f(cx - dx) + f(cx + dx);
    const caret = (x) => st(`M${x - 2.6} ${cy + 1.3}L${x} ${cy - 1.3}L${x + 2.6} ${cy + 1.3}`, 1.3);
    switch (mood) {
      case 'happy': return both(caret);
      case 'wink': return `<g class="${cls.blink || ''}">${rect(cx - dx - 1.5, cy - 1.5, 3, 3)}</g>` + caret(cx + dx);
      case 'alert': case 'wonder': return both((x) => rect(x - 1.7, cy - 1.7, 3.4, 3.4));
      case 'error': return both((x) => st(`M${x - 2} ${cy - 1.9}L${x + 2} ${cy + 1.9}M${x + 2} ${cy - 1.9}L${x - 2} ${cy + 1.9}`, 1.2, red));
      case 'sleep': return both((x) => rect(x - 2.6, cy + .9, 5.2, 1));
      // watching: both eyes glance up to one side
      case 'watch': return `<g class="${cls.blink || ''}">${both((x) => rect(x + .4, cy - 2.4, 2.8, 2.8))}</g>`;
      // worried: each eye's top edge rises toward the middle
      case 'oops': return both((x) => { const s = x < cx ? 1 : -1; return `<path d="M${R(x - 1.5 * s)} ${R(cy - .3)}L${R(x + 1.5 * s)} ${R(cy - 2)}L${R(x + 1.5 * s)} ${R(cy + 2.1)}L${R(x - 1.5 * s)} ${R(cy + 2.1)}Z" fill="${paper}"/>`; });
      case 'think': case 'dots': return [-1, 0, 1].map((i) => `<g class="${(cls.dot || '') + (i + 2)}">${rect(cx + i * 4.4 - 1.2, cy - 1.2, 2.4, 2.4)}</g>`).join('');
      default: {
        if (!eyes) return '';
        // the small cut (19-40 px) is heavier: wider, taller eyes so they survive 20 px
        const w = small ? 3.8 : 2.7, h = small ? 5.4 : 4.8;
        return `<g class="${cls.blink || ''}">${both((x) => `<rect x="${R(x - w / 2)}" y="${R(cy - h / 2)}" width="${w}" height="${h}" rx="${small ? 1 : .8}" fill="${paper}"/>`)}</g>`;
      }
    }
  }
  function pipNier(g, th, mood, cls, ids, opts) {
    const ink = opts.tray ? opts.ink : th.ink, paper = opts.tray ? '#000' : th.paper, small = !g.detail;
    const { s1, s2 } = sticks(g), A = anchors(g), h = g.head;
    const E = g.eyeletX.map((x) => ({ x, base: h.y0, end: [x, h.y0 + 1.5] }));
    const sq = (p, n, c) => `<rect x="${R(p[0] - n / 2)}" y="${R(p[1] - n / 2)}" width="${R(n)}" height="${R(n)}" fill="${c || ink}"/>`;
    const sw = small ? 3.6 : 2.4;
    // the control: two flat bars, the front one cut out of the back one, square nodes, a diamond pin
    let ctl = line(s1[0], s1[1], sw, ink, 'butt');
    if (!opts.tray) ctl += line(shorten(s2, 1)[0], shorten(s2, 1)[1], sw + 2.2, th.bg, 'butt');
    ctl += line(s2[0], s2[1], sw, ink, 'butt');
    if (!small) {
      [s1[0], s1[1], s2[0], s2[1]].forEach((p) => { ctl += sq(p, 3.4); });
      ctl += `<path d="M${g.P[0]} ${g.P[1] - 3.6}L${g.P[0] + 3.6} ${g.P[1]}L${g.P[0]} ${g.P[1] + 3.6}L${g.P[0] - 3.6} ${g.P[1]}Z" fill="${ink}"${opts.tray ? '' : ` stroke="${th.bg}" stroke-width="1.1"`}/>`;
    }
    // nodes hang from the bar's underside, the way every NieR line ends in a square
    const nodes = barAttach(g).map((b) => [b.a[0] + b.n[0] * (sw / 2 + .95), b.a[1] + b.n[1] * (sw / 2 + .95)]);
    if (!small) nodes.forEach((q) => { ctl += sq(q, 2.4); });
    const strings = nodes.map((q, i) => line(small ? A[i] : q, small ? E[i].end : [E[i].x, E[i].base], small ? 2.6 : 1, ink, 'butt')).join('');
    // the head: hairline line art like PMConcept7's Pod, with an inner frame line
    const d = headPathNier(h);
    let headS = opts.tray ? `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${small ? 4 : 2.2}" stroke-linejoin="miter"/>`
      : `<path d="${d}" fill="${paper}" stroke="${ink}" stroke-width="${small ? 2.6 : 1.5}" stroke-linejoin="miter"/>`;
    if (!small && !opts.tray) headS += `<path d="${headPathNier(h, 2.6)}" fill="none" stroke="${ink}" stroke-opacity=".38" stroke-width=".5"/>`;
    if (!small) E.forEach((e) => { headS += sq([e.x, e.base], 2.6); });
    // the YoRHa blindfold: one band wrapped edge to edge, above the brace points
    const vy = small ? 42 : 40.6, vh = small ? 8 : 6.6, vx0 = h.x0 + (small ? 4.2 : .75), vx1 = h.x1 - (small ? 4.2 : .75);
    let visor = `<rect x="${R(vx0)}" y="${R(vy - vh / 2)}" width="${R(vx1 - vx0)}" height="${R(vh)}" fill="${ink}"/>`;
    if (!small) {
      // the blindfold's knot is behind the head; its two tails fly out past the right ear
      const tx = h.x1 + .4, ty = vy - vh / 2 + .6;
      visor += `<path d="M${R(tx - 1)} ${R(ty)}L${R(tx + 7.8)} ${R(ty + 3.6)}L${R(tx + 8.6)} ${R(ty + 5.6)}L${R(tx - 1)} ${R(ty + 2.6)}Z" fill="${ink}"/>`;
      visor += `<path d="M${R(tx - 1)} ${R(ty + 2.9)}L${R(tx + 6.2)} ${R(ty + 9.4)}L${R(tx + 6.4)} ${R(ty + 11.4)}L${R(tx - 1)} ${R(ty + 5.4)}Z" fill="${ink}"/>`;
    }
    if (mood === 'error' && !small) {
      // a slice glitch: the band torn and shifted, the way NieR tears a screen
      visor = `<rect x="${R(vx0)}" y="${R(vy - vh / 2)}" width="${R(vx1 - vx0)}" height="${R(vh * .55)}" fill="${ink}"/><rect x="${R(vx0 + 2.4)}" y="${R(vy - vh / 2 + vh * .55 + .9)}" width="${R(vx1 - vx0 - 2.4)}" height="${R(vh * .45 - .9)}" fill="${ink}"/>`;
    }
    const eyes = opts.eyes !== false;   // X3 B: on every mark unless a caller asks for the plain band
    let hud = `<g class="${cls.face || ''}">${nierHud(vy, mood, opts.tray ? '#000' : th.paper, opts.tray ? '#000' : th.red, cls, eyes, small)}</g>`;
    if (opts.tray) {
      const mid = ids.face + 'v';
      visor = `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-8" y="-8" width="80" height="80"><rect x="-8" y="-8" width="80" height="80" fill="#fff"/>${nierHud(vy, mood, '#000', '#000', {}, eyes, small)}</mask><g mask="url(#${mid})">${visor}</g>`;
      hud = '';
    }
    const my = small ? 52.5 : 51, mw = small ? 8 : 6, mt = small ? 2.8 : 1.5;
    const mouth = mood === 'alert' || mood === 'wonder' ? `<rect x="30.4" y="${R(my - 1)}" width="3.2" height="3.2" fill="${ink}"/>`
      : mood === 'happy' || mood === 'wink' ? `<path d="M${R(32 - mw / 2 - .6)} ${R(my - .4)}L${R(32 - mw / 4)} ${R(my + 1.6)}H${R(32 + mw / 4)}L${R(32 + mw / 2 + .6)} ${R(my - .4)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'watch' ? `<path d="M${R(32 - mw * .3)} ${R(my - .2)}L${R(32 - mw * .05)} ${R(my + 1.2)}H${R(32 + mw * .3)}L${R(32 + mw * .55)} ${R(my - .6)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'oops' ? `<path d="M${R(32 - mw / 2)} ${R(my + .8)}Q${R(32 - mw / 4)} ${R(my - .7)} 32 ${R(my + .8)}T${R(32 + mw / 2)} ${R(my + .8)}" fill="none" stroke="${ink}" stroke-width="${mt}"/>`
      : mood === 'error' || mood === 'sleep' ? `<rect x="${R(32 - mw * .35)}" y="${R(my)}" width="${R(mw * .7)}" height="${mt}" fill="${ink}"/>`
      : `<rect x="${R(32 - mw / 2)}" y="${R(my)}" width="${R(mw)}" height="${mt}" fill="${ink}"/>`;
    const head = `<g class="${cls.pup || ''}">${headS}${visor}${hud}${mouth}</g>`;
    // parts, for places that hang the head at their own distance (the onboarding stage)
    if (opts.parts) return { ctl, headInner: headS + visor + hud + mouth, barNodes: nodes, headNodes: E.map((e) => [e.x, e.base]) };
    return { defs: '', body: strings + head + `<g class="${cls.ctl || ''}">${ctl}</g>` };
  }

  /* ------------------------------------------------------------- pixel art */
  // Sprites on 16, 24 and 32 grids: tray and favicon sizes in every look, and Retro at every size. Sticks and heads
  // are drawn from rules, faces are stamped as [x, y, w, h] holes, and the strings are pixel lines from the stick to the
  // head, drawn again for every animation frame.
  function stairSticks(Gs, x0, x1, ytop, step, thick) {
    const g = Array.from({ length: Gs }, () => Array(Gs).fill('.'));
    const n = Math.ceil((x1 - x0 + 1) / step);
    const rowAt = (x) => ytop + (n - 1 - Math.floor((x - x0) / step));
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) { const xb = Gs - 1 - x; if (g[rowAt(x) + t][xb] === '.') g[rowAt(x) + t][xb] = 'b'; }
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) g[rowAt(x) + t][x] = 'c';
    return g.map((r) => r.join(''));
  }
  function roundHead(Gs, x0, x1, y0, y1, r, nubRows) {
    const rows = [];
    for (let y = 0; y < Gs; y++) {
      let row = '';
      for (let x = 0; x < Gs; x++) {
        const px = x + .5, py = y + .5;
        let h = false;
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) {
          const qx = Math.min(px - x0, x1 - px), qy = Math.min(py - y0, y1 - py);
          h = !(qx < r && qy < r && Math.hypot(r - qx, r - qy) > r + .15);
        }
        if (nubRows.indexOf(y) >= 0 && (x === Math.floor(x0) - 1 || x === Math.floor(x1))) h = true;
        row += h ? 'h' : '.';
      }
      rows.push(row);
    }
    return rows;
  }
  // eye: the left eye's holes, mirrored for the right one unless eyeR gives the right eye's own holes
  const SPRITES = {
    16: {
      sticks: ['................', '..cccccccccccc..', '..cccccccccccc..'].concat(Array(13).fill('................')),
      head: Array(5).fill('................').concat(['...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.',
        '.hhhhhhhhhhhhhh.', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '................']),
      anchor: [4, 3], eyelet: [4, 4],
      faces: {
        idle: { eye: [[5, 7, 2, 3]], mouth: [[6, 11, 1, 1], [9, 11, 1, 1], [7, 12, 2, 1]] },
        happy: { eye: [[5, 8, 1, 1], [4, 9, 1, 1], [6, 9, 1, 1]], mouth: [[5, 11, 1, 1], [10, 11, 1, 1], [6, 12, 4, 1]] },
        alert: { eye: [[4, 7, 3, 3]], mouth: [[7, 11, 2, 2]] },
        error: { eye: [[4, 7, 1, 1], [6, 7, 1, 1], [5, 8, 1, 1], [4, 9, 1, 1], [6, 9, 1, 1]], mouth: [[6, 11, 4, 1]] },
        sleep: { eye: [[4, 9, 3, 1]], mouth: [[7, 11, 2, 1]] },
        think: { eye: [[6, 7, 2, 2]], eyeR: [[10, 7, 2, 2]], mouth: [[7, 11, 4, 1]] },
        dots: { mouth: [[4, 9, 2, 2], [7, 9, 2, 2], [10, 9, 2, 2]] },
        wink: { eye: [[5, 7, 2, 3]], eyeR: [[10, 8, 1, 1], [9, 9, 1, 1], [11, 9, 1, 1]], mouth: [[6, 11, 1, 1], [10, 10, 1, 1], [7, 12, 3, 1]] },
        watch: { eye: [[6, 6, 2, 2]], eyeR: [[11, 6, 2, 2]], mouth: [[8, 11, 1, 1], [11, 11, 1, 1], [9, 12, 2, 1]] },
        oops: { eye: [[5, 8, 2, 2]], mouth: [[5, 12, 1, 1], [6, 11, 1, 1], [7, 12, 1, 1], [8, 11, 1, 1], [9, 12, 1, 1], [10, 11, 1, 1]] }
      },
      cheeks: null
    },
    24: {
      sticks: stairSticks(24, 2, 21, 1, 4, 2),
      head: roundHead(24, 4, 20, 10.5, 22.5, 4, [16, 17]),
      anchor: [4, 7], eyelet: [7, 9],
      faces: {
        idle: { eye: [[8, 14, 2, 3]], mouth: [[9, 18, 1, 1], [14, 18, 1, 1], [10, 19, 4, 1]] },
        happy: { eye: [[8, 14, 2, 1], [7, 15, 1, 1], [10, 15, 1, 1]], mouth: [[9, 18, 6, 1], [10, 19, 4, 1]] },
        alert: { eye: [[7, 13, 3, 3]], mouth: [[11, 18, 2, 2]] },
        error: { eye: [[7, 14, 1, 1], [9, 14, 1, 1], [8, 15, 1, 1], [7, 16, 1, 1], [9, 16, 1, 1]], mouth: [[10, 19, 4, 1]] },
        sleep: { eye: [[7, 16, 3, 1]], mouth: [[11, 19, 2, 1]] },
        think: { eye: [[9, 13, 2, 2]], eyeR: [[15, 13, 2, 2]], mouth: [[11, 19, 4, 1]] },
        dots: { mouth: [[7, 16, 2, 2], [11, 16, 2, 2], [15, 16, 2, 2]] },
        wink: { eye: [[8, 14, 2, 3]], eyeR: [[14, 14, 2, 1], [13, 15, 1, 1], [16, 15, 1, 1]], mouth: [[9, 18, 1, 1], [15, 17, 1, 1], [10, 19, 5, 1]] },
        watch: { eye: [[9, 13, 2, 2]], eyeR: [[16, 13, 2, 2], [15, 11, 3, 1]], mouth: [[11, 18, 1, 1], [15, 18, 1, 1], [12, 19, 3, 1]] },
        oops: { eye: [[8, 15, 2, 2], [7, 13, 1, 1], [8, 12, 2, 1]], eyeR: [[14, 15, 2, 2], [16, 13, 1, 1], [14, 12, 2, 1]],
          mouth: [[9, 19, 1, 1], [10, 18, 1, 1], [11, 19, 1, 1], [12, 18, 1, 1], [13, 19, 1, 1], [14, 18, 1, 1]] }
      },
      cheeks: [[6, 18, 2, 1], [16, 18, 2, 1]]
    },
    32: {
      sticks: stairSticks(32, 3, 28, 2, 4, 2),
      head: roundHead(32, 6, 26, 14.5, 30.5, 5.5, [21, 22, 23]),
      anchor: [5, 10], eyelet: [10, 13],
      faces: {
        idle: { eye: [[10, 19, 3, 4]], mouth: [[12, 25, 1, 1], [19, 25, 1, 1], [13, 26, 6, 1]] },
        happy: { eye: [[11, 19, 1, 1], [10, 20, 1, 1], [12, 20, 1, 1], [9, 21, 1, 1], [13, 21, 1, 1]], mouth: [[12, 24, 8, 1], [13, 25, 6, 1], [14, 26, 4, 1]] },
        alert: { eye: [[9, 18, 4, 4]], mouth: [[15, 24, 2, 3]] },
        error: { eye: [[9, 19, 1, 1], [12, 19, 1, 1], [10, 20, 2, 2], [9, 22, 1, 1], [12, 22, 1, 1]], mouth: [[13, 26, 6, 1]] },
        sleep: { eye: [[9, 21, 4, 1]], mouth: [[15, 25, 2, 1]] },
        think: { eye: [[11, 18, 3, 3]], eyeR: [[20, 18, 3, 3]], mouth: [[15, 25, 5, 1]] },
        dots: { mouth: [[8, 21, 4, 4], [14, 21, 4, 4], [20, 21, 4, 4]] },
        wink: { eye: [[10, 19, 3, 4]], eyeR: [[20, 19, 1, 1], [19, 20, 1, 1], [21, 20, 1, 1], [18, 21, 1, 1], [22, 21, 1, 1]], mouth: [[12, 25, 1, 1], [19, 25, 1, 1], [20, 24, 1, 1], [13, 26, 6, 1]] },
        watch: { eye: [[11, 17, 3, 3]], eyeR: [[21, 17, 3, 3], [20, 15, 4, 1]], mouth: [[14, 25, 1, 1], [20, 25, 1, 1], [15, 26, 5, 1]] },
        oops: { eye: [[10, 20, 3, 3], [9, 17, 1, 1], [10, 16, 2, 1], [12, 15, 1, 1]], eyeR: [[19, 20, 3, 3], [22, 17, 1, 1], [20, 16, 2, 1], [19, 15, 1, 1]],
          mouth: [[12, 26, 1, 1], [13, 25, 1, 1], [14, 26, 1, 1], [15, 25, 1, 1], [16, 26, 1, 1], [17, 25, 1, 1], [18, 26, 1, 1], [19, 25, 1, 1]] }
      },
      cheeks: [[8, 24, 3, 1], [21, 24, 3, 1]]
    }
  };
  // NieR at tray size: hairline head, the band, nodes at the bar ends. Rows 8-10 are the band (solid at rest, like the
  // large mark), 12-13 the mouth.
  const NIER16 = {
    base: [
      '................',
      '................',
      '.nn..........nn.',
      '.nnccccccccccnn.',
      '....s......s....',
      '....s......s....',
      '...hhhhhhhhhh...',
      '..h..........h..',
      '..h.vvvvvvvv.h..',
      '.hhvvvvvvvvvvhh.',
      '.hh.vvvvvvvv.hh.',
      '..h..........h..',
      '..h....mm....h..',
      '..h..........h..',
      '...hhhhhhhhhh...',
      '................'
    ],
    moods: {
      // X3 B: the eyes show through the band on every mark: two single pixels in the band's middle row, hand-placed at
      // 16 px on the vector eyes' spacing (32 +- 6.5 of 64), the band whole above and below them so they read as eyes
      // behind the blindfold, apart from think's four dots and sleep's notches on the band's lower edge
      idle: { 9: '.hhvvv.vv.vvvhh.' },
      happy: { 8: '..h.vv.vv.vv.h..', 9: '.hhvv.vvvv.vvhh.', 12: '..h...m..m...h..', 13: '..h....mm....h..' },
      wink: { 8: '..h.v..vvvvv.h..', 9: '.hhvv..vv..vvhh.', 12: '..h...m..m...h..', 13: '..h....mm....h..' },
      alert: { 8: '..h.v..vv..v.h..', 9: '.hhvv..vv..vvhh.', 12: '..h....mm....h..', 13: '..h....mm....h..' },
      watch: { 8: '..h.vv..vv..vh..', 12: '..h.....mm...h..' },
      oops: { 8: '..h.vv.vv.vv.h..', 9: '.hhvv..vv..vvhh.', 12: '..h...m.m.m..h..', 13: '..h....m.m...h..' },
      error: { 8: '..h.v.vvvv.v.h..', 9: '.hhvvv.vv.vvvhh.', 10: '.hh.v.vvvv.v.hh.', 12: '..h...mmmm...h..' },
      sleep: { 9: '.hhvvvvvvvvvvhh.', 10: '.hh.v..vv..v.hh.', 12: '..h...mmmm...h..' },
      think: { 9: '.hhvv.v.v.v.vhh.', 12: '..h....mmm...h..' }
    }
  };
  function nier16(mood) {
    const rows = NIER16.base.slice(), o = NIER16.moods[mood] || {};
    Object.keys(o).forEach((k) => { rows[+k] = o[k]; });
    return rows;
  }
  function bresenham(a, b) {
    const pts = []; let [x0, y0] = a; const [x1, y1] = b;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    return pts;
  }
  function spriteRows(Gs, mood, f0) {
    const { dx = 0, eyeDx = 0, dy = 0, lift = -1 } = f0 || {};
    const S = SPRITES[Gs];
    const g = Array.from({ length: Gs }, () => Array(Gs).fill('.'));
    const put = (x, y, ch) => { if (x >= 0 && x < Gs && y >= 0 && y < Gs) g[y][x] = ch; };
    S.sticks.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') put(x, y, ch); }));
    S.head.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'h') put(x + dx, y + dy, 'h'); }));
    // strings: pixel lines from just under each stick to just above the head, wherever the head has swung to
    [[S.anchor, S.eyelet], [[Gs - 1 - S.anchor[0], S.anchor[1]], [Gs - 1 - S.eyelet[0], S.eyelet[1]]]].forEach(([a, e]) => {
      bresenham(a, [e[0] + dx, e[1] + dy]).forEach(([x, y]) => { if (g[y] && g[y][x] === '.') put(x, y, 's'); });
    });
    const f = S.faces[mood === 'wonder' ? 'alert' : mood] || S.faces.idle;
    const hole = (r, ox, mirror, oy) => {
      const x0 = mirror ? Gs - r[0] - r[2] : r[0];
      for (let y = r[1]; y < r[1] + r[3]; y++) for (let x = x0; x < x0 + r[2]; x++) put(x + ox, y + dy + (oy || 0), 'e');
    };
    if (S.cheeks && mood !== 'error' && mood !== 'dots') S.cheeks.forEach((r) => { for (let x = r[0]; x < r[0] + r[2]; x++) put(x + dx, r[1] + dy, 'k'); });
    (f.eye || []).forEach((r) => hole(r, dx + eyeDx, false));
    if (f.eyeR) f.eyeR.forEach((r) => hole(r, dx + eyeDx, false)); else (f.eye || []).forEach((r) => hole(r, dx + eyeDx, true));
    (f.mouth || []).forEach((r, i) => hole(r, dx, false, i === lift ? -Math.max(1, Math.round(Gs / 16)) : 0));
    return g.map((r) => r.join(''));
  }
  // the sprite grid for a size: the one that lands on whole pixels at 1x (one look per size at every dpr)
  function spriteGrid(px) {
    if (px >= 64) return 32;
    let best = 16, cover = 0;
    [16, 24, 32].forEach((Gs) => { const k = Math.floor(px / Gs); if (k >= 1 && Gs * k >= cover) { best = Gs; cover = Gs * k; } });
    return best;
  }
  function pixelRects(rows, colors) {
    let s = '';
    const Gs = rows.length;
    rows.forEach((row, y) => {
      let x = 0;
      while (x < Gs) {
        const ch = row[x];
        if (ch === '.' || ch === 'e' || !colors[ch]) { x++; continue; }
        let w = 1;
        while (x + w < Gs && row[x + w] === ch) w++;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${colors[ch]}"/>`;
        x += w;
      }
    });
    return s;
  }

  /* --------------------------------------------------------------- the rig */
  // Motion as sampled poses: the control's angle and lift, Pip's angle, lift and squash, and where the eyes look.
  // Strings are solved from those poses, so they stay tied at both ends.
  function wave(kind, u) {
    const s = Math.sin(2 * Math.PI * u);
    if (kind === 'spring') return Math.sin(2 * Math.PI * u + .32 * Math.sin(2 * Math.PI * u)) * 1.02;
    if (kind === 'glide') return s * (1 - .08 * Math.cos(4 * Math.PI * u));
    return s;
  }
  function pose(kind, fam, u) {
    if (typeof fam === 'string') fam = MOTION[fam] || MOTION.basic;
    const a = fam.amp, w = fam.wave;
    if (kind === 'think') {
      const bob = .5 - .5 * Math.cos(4 * Math.PI * u);
      return { cRot: 2.6 * a * Math.sin(2 * Math.PI * u), cDy: -.6 * bob, pRot: 1.6 * a * Math.sin(2 * Math.PI * u - .5), pDy: -1.7 * a * bob, sx: 1, sy: 1, eye: 0 };
    }
    if (kind === 'hop') {
      const air = (v) => { v = ((v % 1) + 1) % 1; return v < .62 ? Math.sin(Math.PI * v / .62) : 0; };
      const land = (v) => { v = ((v % 1) + 1) % 1; return v >= .62 && v < .8 ? Math.sin(Math.PI * (v - .62) / .18) : 0; };
      const take = u < .14 ? Math.sin(Math.PI * u / .14) : 0, sq = land(u);
      return { cRot: 0, cDy: -3.2 * a * air(u + .05), pRot: 0, pDy: -6 * a * air(u), sx: 1 + .08 * sq - .03 * take, sy: 1 - .11 * sq + .05 * take, eye: 0 };
    }
    const lag = w === 'glide' ? .13 : .1;
    return { cRot: 7 * a * wave(w, u), cDy: 0, pRot: 10 * a * wave(w, u - lag), pDy: 0, sx: 1, sy: 1, eye: 1.8 * a * wave(w, u - lag - .04) };
  }
  const REST = { cRot: 0, cDy: 0, pRot: 0, pDy: 0, sx: 1, sy: 1, eye: 0 };
  function transformsAt(g, ps, attach) {
    const P = g.P, h = g.head, H = [(h.x0 + h.x1) / 2, h.y1];
    const hx = H[0] - P[0], hy = H[1] - P[1];
    const place = (pt) => {
      // pup: translate(0,dy) rotate(r) about P, then squash about the head's base
      const q = [H[0] + (pt[0] - H[0]) * ps.sx, H[1] + (pt[1] - H[1]) * ps.sy];
      const r = rot(q, P, ps.pRot);
      return [r[0], r[1] + ps.pDy];
    };
    const ctlAt = (pt) => { const r = rot(pt, P, ps.cRot); return [r[0], r[1] + ps.cDy]; };
    const strs = stringEnds(g, attach || 'eye', ctlAt, place).map((e) => {
      const A = e.T, vx = e.E[0] - A[0], vy = e.E[1] - A[1];
      return { A, ang: Math.atan2(-vx, vy) / D2R, len: Math.hypot(vx, vy) };
    });
    return {
      ctl: `translate(0px,${R(ps.cDy)}px) rotate(${R(ps.cRot)}deg)`,
      pup: `translate(0px,${R(ps.pDy)}px) rotate(${R(ps.pRot)}deg) translate(${R(hx)}px,${R(hy)}px) scale(${R(ps.sx)},${R(ps.sy)}) translate(${R(-hx)}px,${R(-hy)}px)`,
      eye: `translate(${R(ps.eye)}px,0px)`,
      strs: strs.map((s) => `translate(${R(s.A[0])}px,${R(s.A[1])}px) rotate(${R(s.ang)}deg) scale(1,${R(s.len)})`),
      raw: strs
    };
  }
  // the keyframes of one vector loader: 30-36 sampled stops per moving part, strings solved at each
  function rigFrames(kind, family, g, attach) {
    const fam = MOTION[family] || MOTION.basic, N = kind === 'hop' ? 36 : 30;
    const k = { ctl: [], pup: [], eye: [], s0: [], s1: [] };
    for (let i = 0; i <= N; i++) {
      const u = i / N, t = transformsAt(g, pose(kind, fam, u), attach), pc = R(u * 100) + '%';
      k.ctl.push(`${pc}{transform:${t.ctl}}`); k.pup.push(`${pc}{transform:${t.pup}}`); k.eye.push(`${pc}{transform:${t.eye}}`);
      k.s0.push(`${pc}{transform:${t.strs[0]}}`); k.s1.push(`${pc}{transform:${t.strs[1]}}`);
    }
    return k;
  }

  /* ------------------------------------------------------------- the tiers */
  // micro: hand-placed pixels at 18 px and below; small: the heavier cut up to 40 px; full above. Logical px, never
  // device px, so a size draws the same way at every dpr. Retro is pixel art at every size.
  function tierFor(px, family) {
    const n = +px || 24;
    if (family === 'retro') return n <= 18 ? 'micro' : 'pixel';
    return n <= 18 ? 'micro' : n <= 40 ? 'small' : 'full';
  }
  // the key of a drawing's shared stylesheet rules and defs: family x tier (pixel grids by size)
  function tierKey(family, tier, px) { return tier === 'pixel' ? 'g' + spriteGrid(px) : tier === 'micro' ? 'g16' : tier; }
  function periodOf(family, motion, tier) {
    const fam = MOTION[family] || MOTION.basic;
    if (tier === 'micro' || tier === 'pixel') return fam.dur * ((motion === 'think' || motion === 'hop') ? .85 : 1) * 1000;
    return (motion === 'hop' ? R(fam.dur * .78) : motion === 'think' ? R(fam.dur * 1.15) : fam.dur) * 1000;
  }

  /* --------------------------------------------------------------- palettes */
  // The page's palette: colour roles that pm-logo.css maps to the painted look's tokens. '@x' is var(--pip-x).
  function rolePalette(look) {
    const family = familyOf(look), scheme = schemeOf(look);
    const p = { family, scheme, look, bg: '@bg', ctl: '@ctl', back: '@back', pin: '@pin', str: '@str', head: '@head', eye: '@eye', cheek: '@cheek', shine: false };
    if (family === 'friendly') Object.assign(p, { head: ['@head0', '@head1'], headSolid: '@head', sheen: scheme === 'dark' ? .32 : .3, shine: true });
    if (family === 'glass') Object.assign(p, { shine: true, glass: { tint: ['@tint0', '@tint1', '@tint2'], alpha: scheme === 'dark' ? .8 : .88, frost: '@frost', rimTop: '@rimtop', rimBot: '@rimbot', edge: '@edge', drop: '@drop', rod: '@rod', rodBack: '@rodback' } });
    if (family === 'basic') p.cheek = null;
    if (family === 'retro') p.pixel = true;
    if (family === 'nier') Object.assign(p, { nier: true, noMotion: true, flatCtl: true, ink: '@ink', paper: '@paper', red: '@red', ctl: '@ink', str: '@ink', head: '@ink', cheek: null });
    return p;
  }
  // A file's palette: literal colours. tokens (optional) are live values read from the page for the painted look.
  function filePalette(look, tokens) {
    const e = EXPORT[look] || EXPORT['basic-dark'], family = familyOf(look), scheme = schemeOf(look);
    const p = Object.assign({ family, scheme, look }, e);
    if (tokens) Object.keys(tokens).forEach((k) => {
      const t = tokens[k], c = Array.isArray(t) ? (t.length && t.every((x) => safeColor(x)) ? t.map((x) => safeColor(x)) : null) : safeColor(t);
      if (c && Object.prototype.hasOwnProperty.call(e, k)) p[k] = c;
    });
    const ctl = solid(p.ctl);
    p.back = family === 'nier' ? ctl : mix(ctl, family === 'retro' ? p.tile.stops[0] : p.bg, .42);
    p.headSolid = solid(p.head);
    if (p.glass) { p.glass = Object.assign({}, p.glass); p.glass.rodBack = mix(p.glass.rod, p.bg, .42); }
    if (family === 'nier') { p.noMotion = true; p.flatCtl = true; }
    return p;
  }

  /* --------------------------------------------------------------- the mark */
  const CLS = Object.freeze({ ctl: 'pml-ctl', pup: 'pml-pup', face: 'pml-face', eyes: 'pml-eyes', blink: 'pml-blink', dot: 'pml-dot', fr: 'pml-fr', str: 'pml-str', s: 'pml-s' });
  function moodOf(m) { return m === 'working' ? 'dots' : (MOODS.indexOf(m) >= 0 || m === 'dots' || m === 'blank') ? m : 'idle'; }
  function markBody(o, th, tier) {
    const anim = !!o.motion && !th.noMotion;
    const tray = o.form === 'tray';
    const ink = tray ? safeColor(o.ink) || '#000' : null;
    const live = anim && !o.reduced;
    const cls = o.cls;
    const ids = o.ids;
    const mood = live && o.motion === 'think' ? 'dots' : moodOf(o.mood);

    if (tier === 'micro' || tier === 'pixel') {
      const ctl = solid(ink || th.ctl);
      const back = ink || th.flatCtl ? ctl : th.back;
      const colors = { c: ctl, b: back, s: solid(ink || th.str), h: solid(ink || th.headSolid || th.head), k: ink ? null : th.cheek, n: ctl, v: solid(ink || th.ink || th.ctl), m: solid(ink || th.ink || th.ctl) };
      if (th.nier) {
        const c = colors.c, col = { n: c, c, s: c, h: c, v: c, m: c };
        const nm = mood === 'dots' ? 'think' : mood === 'wonder' ? 'alert' : mood;
        return { vb: 16, defs: '', crisp: true, body: pixelRects(nier16(nm === 'idle' && o.eyes === false ? 'band' : nm), col) };
      }
      const Gs = tier === 'micro' ? 16 : spriteGrid(o.px);
      if (anim) {
        // Retro's snap motion: eight flipped frames (four for think and hop); strings drawn again in every frame.
        // Frame 0 is the rest pose and the only one shown without CSS (the still pose is the base markup).
        const n = Gs >= 24 ? 2 : 1;
        const plan = o.motion === 'think' ? [{ lift: 0 }, { lift: 1 }, { lift: 2 }, {}]
          : o.motion === 'hop' ? [{}, { dy: -Math.ceil(n / 2) }, { dy: -n - 1 }, { dy: -Math.ceil(n / 2) }]
          : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const dx = Math.round(Math.sin(2 * Math.PI * i / 8) * n); return { dx, eyeDx: Math.sign(dx) }; });
        const fm = o.motion === 'think' ? 'dots' : mood;
        const body = plan.map((f, i) => `<g class="${cls.fr} ${cls.fr}${i}"${i ? ' opacity="0"' : ''}>${pixelRects(spriteRows(Gs, fm, f), colors)}</g>`).join('');
        return { vb: Gs, defs: '', crisp: true, body, frames: plan.length };
      }
      return { vb: Gs, defs: '', crisp: true, body: pixelRects(spriteRows(Gs, mood), colors) };
    }

    const g = GEO[tier === 'small' ? 'small' : 'full'];
    if (th.nier) { const r = pipNier(g, th, mood, cls, ids, { tray, ink, eyes: o.eyes !== false }); return { vb: 64, defs: r.defs, body: r.body }; }

    // strings: solved at rest for still marks; an animated mark gives each string its own transform (the rest pose)
    const attach = tray ? 'thread' : (o.attach || 'eye');
    const strCol = ink || th.str;
    let strings;
    if (anim) {
      const t = transformsAt(g, REST, attach);
      strings = t.raw.map((s, i) => `<line class="${cls.str} ${cls.s}${i}" x1="0" y1="0" x2="0" y2="1" stroke="${strCol}" stroke-width="${g.strW}" transform="translate(${R(s.A[0])} ${R(s.A[1])}) rotate(${R(s.ang)}) scale(1 ${R(s.len)})"/>`).join('');
    } else strings = stringEnds(g, attach, (q) => q, (q) => q).map((e) => line(e.T, e.E, g.strW, strCol, 'butt')).join('');
    const hd = pipHead(g, th, mood, ids, cls, { tray, ink, backdrop: o._backdrop });
    const pup = `<g class="${cls.pup || ''}">${eyeletRings(g, th, { tray })}${hd.body}</g>`;
    const ctl = controlSvg(g, th, cls, { tray, ink, attach });
    return { vb: 64, defs: hd.defs, body: strings + pup + ctl };
  }

  /* ------------------------------------------------- page output: mark() */
  // '@role' attributes become one style attribute per element (presentation attributes cannot take var()).
  const ROLE_ATTR = /\s(fill|stroke|stop-color|flood-color)="@([a-z0-9]+)"/g;
  function roleStyles(markup) {
    return markup.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?(\/?)>/g, (m, tag, attrs, sl) => {
      if (!attrs || attrs.indexOf('"@') < 0) return m;
      const decl = [];
      attrs = attrs.replace(ROLE_ATTR, (_, p, r) => { decl.push(p + ':var(--pip-' + r + ')'); return ''; });
      return '<' + tag + attrs + ' style="' + decl.join(';') + '"' + sl + '>';
    });
  }
  const fixedIds = (family, tk, form, mood) => {
    const b = 'pml-' + family + '-' + tk + (form === 'tray' ? '-tray-' + mood : '');
    return { face: b + '-m', grad: b + '-h', clip: b + '-c', rim: b + '-r', glow: b + '-g', spec: b + '-s', drop: b + '-d' };
  };
  function hashKey(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function look() {
    if (!D) return 'basic-dark';
    const h = D.documentElement, t = h.getAttribute('data-theme') || 'basic-dark';
    if (h.getAttribute('data-o55-nier') === 'on') return 'nier-' + schemeOf(t);
    return LOOKS.indexOf(t) >= 0 ? t : 'basic-dark';
  }
  function mark(opts) {
    const o = Object.assign({ px: 24, mood: 'idle', motion: null, form: 'glyph' }, opts || {});
    o.form = o.form === 'tray' ? 'tray' : 'glyph';
    if (['micro', 'small', 'full', 'pixel'].indexOf(o.tier) < 0) o.tier = null;
    const painted = look();
    o.look = o.look && LOOKS.indexOf(o.look) >= 0 ? o.look : painted;
    // the page's colour roles hold the painted look's tokens: a mark of another look draws in its export palette
    const off = !!D && o.look !== painted;
    const family = familyOf(o.look), th = off ? filePalette(o.look, null) : rolePalette(o.look);
    const vars = o.vars && typeof o.vars === 'object' ? Object.keys(o.vars).filter((k) => /^[a-z0-9-]{1,24}$/.test(k) && safeVar(o.vars[k]) != null).map((k) => '--pip-' + k + ':' + safeVar(o.vars[k])) : [];
    o.px = +o.px || 24;
    const tier = o.tier || tierFor(o.px, family), tk = tierKey(family, tier, o.px);
    // below 12 px no part moves (F3-584); NieR never moves
    const anim = !!o.motion && MOTIONS.indexOf(o.motion) >= 0 && family !== 'nier' && o.px >= 12;
    if (!anim) o.motion = null;
    o.cls = CLS;
    // per-instance colours (vars) reach gradients only through defs inside this svg: keyed by the vars, so the markup
    // stays a pure function of its options; marks without vars share one <defs> per family
    const vk = (vars.length ? '-v' + hashKey(vars.join(';')) : '') + (off ? '-x' + o.look : '');
    o.ids = fixedIds(family, tk + vk, o.form, moodOf(o.mood));
    const m = markBody(o, th, tier), own = !!vk && !!m.defs, body = (own ? `<defs>${m.defs}</defs>` : '') + m.body;
    if (m.defs && !own) ensureDefs(family, o.ids.grad, m.defs);
    const key = anim ? family + '-' + o.motion + '-' + tk : '';
    if (anim) ensureAnim(family, o.motion, tier, tk, o.px);
    const label = o.title || 'Puppet Master';
    const role = anim || o.decorative ? 'aria-hidden="true" focusable="false"' : 'role="img" aria-label="' + esc(label) + '"';
    const extra = safeCls(o.className);
    const cls = 'pml pml-f-' + family + ' pml-t-' + tk + (anim ? ' pml-a pml-k-' + key + ' pml-m-' + o.motion : '') + (extra ? ' ' + extra : '');
    let vbox = `0 0 ${m.vb} ${m.vb}`;
    if (m.crisp) {
      const Dp = Math.round(o.px), k = Math.floor(Dp / m.vb);
      if (k >= 1 && Dp < 64 && Dp % m.vb) { const V = R(Dp / k), pad = R((V - m.vb) / 2); vbox = `${-pad} ${-pad} ${V} ${V}`; }
    }
    const style = vars.length ? ' style="' + vars.join(';') + '"' : '';
    const size = o.size === 'em' ? 'width="1em" height="1em"' : `width="${o.px}" height="${o.px}"`;
    return roleStyles(`<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" ${size} viewBox="${vbox}"${m.crisp ? ' shape-rendering="crispEdges"' : ''} ${role} data-pml-mood="${esc(moodOf(o.mood))}"${style}>${body}</svg>`);
  }

  /* -------------------------------------------- shared defs and stylesheet */
  const defsDone = Object.create(null);
  function defsHost(family) {
    if (!D) return null;
    const id = 'pm-logo-defs-' + family;
    let s = D.getElementById(id);
    if (!s) {
      const root = D.body || D.documentElement;
      s = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('id', id); s.setAttribute('class', 'pml-defs pml-f-' + family); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      s.setAttribute('width', '0'); s.setAttribute('height', '0');
      s.innerHTML = '<defs></defs>';
      root.appendChild(s);
    }
    return s.firstChild;
  }
  function ensureDefs(family, key, defs) {
    if (!D || defsDone[key]) return;
    const host = defsHost(family);
    if (!host) return;
    const tmp = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tmp.innerHTML = roleStyles(defs);
    // one copy of each id, whatever order the marks asking for them come in
    [...tmp.children].forEach((n) => { if (!n.id || !D.getElementById(n.id)) host.appendChild(n); });
    defsDone[key] = true;
  }
  let animSheet = null;
  const animDone = Object.create(null);
  function animStyle() {
    if (animSheet || !D) return animSheet;
    animSheet = D.getElementById('pm-logo-anim');
    if (!animSheet) {
      animSheet = D.createElement('style'); animSheet.id = 'pm-logo-anim';
      (D.head || D.documentElement).appendChild(animSheet);
    }
    return animSheet;
  }
  /* One block of rules per family x motion x tier. Every animation runs only under an armed host
     ([data-pml-run="on"]), takes its period from --pml-dur and its phase from --pml-delay (pm-loader.js sets both from
     the shared clock and Animation speed), and its play state from --pml-ps (paused during drags and under the
     onboarding window). The shorthand keeps durations out of Animation speed's generated sheet, which would scale
     them a second time. */
  const ANIM = (name, ease, delay) => `animation:${name} var(--pml-dur) ${ease || 'linear'} ${delay || 'var(--pml-delay,0s)'} infinite var(--pml-ps,running)`;
  function animRules(family, motion, tier, tk, px) {
    const key = family + '-' + motion + '-' + tk, s = `[data-pml-run="on"] .pml-k-${key}`, n = 'pml-' + key;
    let css = '';
    if (tier === 'micro' || tier === 'pixel') {
      const frames = motion === 'swing' ? 8 : 4;
      css += `${s} .pml-fr{${ANIM('pml-flip' + frames, 'steps(1,end)')}}`;
      for (let i = 0; i < frames; i++) css += `${s} .pml-fr${i}{animation-delay:calc(var(--pml-delay,0s) + var(--pml-dur) * ${R(i / frames - 1)})}`;
      return css;
    }
    const g = GEO[tier === 'small' ? 'small' : 'full'], k = rigFrames(motion, family, g, 'eye'), P = g.P;
    css += `.pml-k-${key} .pml-ctl,.pml-k-${key} .pml-pup{transform-box:view-box;transform-origin:${P[0]}px ${P[1]}px}.pml-k-${key} .pml-str{transform-box:view-box;transform-origin:0 0}`;
    css += `${s} .pml-ctl{${ANIM(n + '-c')}}${s} .pml-pup{${ANIM(n + '-p')}}${s} .pml-s0{${ANIM(n + '-s0')}}${s} .pml-s1{${ANIM(n + '-s1')}}`;
    css += `@keyframes ${n}-c{${k.ctl.join('')}}@keyframes ${n}-p{${k.pup.join('')}}@keyframes ${n}-s0{${k.s0.join('')}}@keyframes ${n}-s1{${k.s1.join('')}}`;
    if (motion === 'swing') {
      css += `${s} .pml-eyes{${ANIM(n + '-e')}}@keyframes ${n}-e{${k.eye.join('')}}`;
      css += `.pml-k-${key} .pml-blink{transform-box:fill-box;transform-origin:center}${s} .pml-blink{animation:pml-blink calc(var(--pml-dur) * 2) linear var(--pml-kdelay,var(--pml-delay,0s)) infinite var(--pml-ps,running)}`;
    }
    if (motion === 'think') {
      [1, 2, 3].forEach((i) => { css += `${s} .pml-dot${i + 1}{animation:pml-hopdot calc(var(--pml-dur) * .7) cubic-bezier(.45,0,.3,1) calc(var(--pml-delay,0s) + var(--pml-dur) * ${R((i - 1) * .7 / 6)}) infinite var(--pml-ps,running)}`; });
    }
    return css;
  }
  function ensureAnim(family, motion, tier, tk, px) {
    const key = family + '-' + motion + '-' + tk;
    if (animDone[key]) return key;
    const st = animStyle();
    if (st) st.appendChild(D.createTextNode(animRules(family, motion, tier, tk, px) + '\n'));
    animDone[key] = true;
    return key;
  }

  /* --------------------------------------------------------------- tiles */
  // PMConcept7's Glass wallpaper, redrawn as vector ribbons so the tile stays sharp at any size (files only)
  const RIBBONS = {
    dark: { sky: ['#03050B', '#0A1024'], bands: [
      ['#2448C9', '#13256E', 'M-2 20C14 14 28 25 44 21S60 12 66 14V70H-2Z'],
      ['#7B45E6', '#3B1B8E', 'M-2 27C12 25 26 30 40 27S58 18 66 20V70H-2Z'],
      ['#1BC2B4', '#0E7178', 'M-2 32C16 30 30 31 44 29S60 26 66 27V70H-2Z'],
      ['#EC4E9B', '#8A1E58', 'M-2 37C14 36 30 33 46 34S60 39 66 40V70H-2Z'],
      ['#4F7FEA', '#172F80', 'M-2 42C10 40 22 38 34 40S56 49 66 48V70H-2Z'],
      ['#9157E2', '#2A1366', 'M-2 49C14 47 28 50 42 53S58 55 66 53V70H-2Z'],
      ['#2E5FE4', '#0F2063', 'M-2 56C16 55 30 57 46 59S60 58 66 57V70H-2Z']
    ], rim: 'rgba(225,230,255,.55)' },
    light: { sky: ['#F4F4F6', '#E8EAF0'], bands: [
      ['#A2C2F8', '#86AAF2', 'M-2 20C14 14 28 25 44 21S60 12 66 14V70H-2Z'],
      ['#BFA6F7', '#A88EF2', 'M-2 27C12 25 26 30 40 27S58 18 66 20V70H-2Z'],
      ['#61D6C3', '#33B8A4', 'M-2 32C16 30 30 31 44 29S60 26 66 27V70H-2Z'],
      ['#F582B8', '#F7BDD7', 'M-2 37C14 36 30 33 46 34S60 39 66 40V70H-2Z'],
      ['#F5B566', '#F8E0C2', 'M-2 42C10 40 22 38 34 40S56 49 66 48V70H-2Z'],
      ['#8DB0F6', '#CCDBFA', 'M-2 49C14 47 28 50 42 53S58 55 66 53V70H-2Z'],
      ['#B79EF5', '#9C84EE', 'M-2 56C16 55 30 57 46 59S60 58 66 57V70H-2Z']
    ], rim: 'rgba(255,255,255,.9)' }
  };
  function ribbonsSvg(kind, idp) {
    const w = RIBBONS[kind];
    let defs = grad(idp + 'k', w.sky, 0, 0, 0, 30), s = `<rect x="-2" y="-2" width="68" height="68" fill="url(#${idp}k)"/>`;
    w.bands.forEach((b, i) => {
      defs += `<linearGradient id="${idp}b${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b[0]}"/><stop offset="1" stop-color="${b[1]}"/></linearGradient>`;
      s += `<path d="${b[2]}" fill="url(#${idp}b${i})"/><path d="${b[2].split('V70')[0]}" fill="none" stroke="${w.rim}" stroke-width=".35"/>`;
    });
    return { defs, body: s };
  }
  function tileFrame(th, ids, inner, innerVb, crisp) {
    const t = th.tile;
    let defs = '', s = '';
    if (t.kind === 'retro') {
      defs += grad(ids.tile, t.stops, 0, 0, 64, 64);
      s += `<rect x="4" y="4" width="60" height="60" fill="${t.shadow}"/>`;
      s += `<rect x="1" y="1" width="58" height="58" fill="url(#${ids.tile})" stroke="${t.edge}" stroke-width="2"/>`;
      s += `<svg x="8.5" y="7.5" width="43" height="43" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
      return { defs, body: s };
    }
    if (t.kind === 'nier') {
      // parchment, graph grid, target brackets, a hairline rule ending in squares, a unit code
      defs += grad(ids.tile, t.stops, 0, 0, 0, 64);
      s += `<rect width="64" height="64" fill="url(#${ids.tile})"/>`;
      let grid = '';
      for (let i = 4; i < 64; i += 4) grid += `M${i} 0V64M0 ${i}H64`;
      s += `<path d="${grid}" stroke="${t.grid}" stroke-width=".3"/>`;
      s += `<rect x="5.5" y="5.5" width="53" height="53" fill="none" stroke="${t.edge}" stroke-opacity=".4" stroke-width=".5"/>`;
      const tick = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 5}V${y}H${x + dx * 5}" fill="none" stroke="${t.edge}" stroke-width="1.2"/>`;
      s += tick(3, 3, 1, 1) + tick(61, 3, -1, 1) + tick(3, 61, 1, -1) + tick(61, 61, -1, -1);
      s += `<path d="M10 53.5H54" stroke="${t.edge}" stroke-width=".5"/><rect x="9" y="52.5" width="2" height="2" fill="${t.edge}"/><rect x="53" y="52.5" width="2" height="2" fill="${t.edge}"/>`;
      s += `<text x="54" y="10.4" text-anchor="end" font-family="'PM NieR Mono','JetBrains Mono',ui-monospace,monospace" font-size="3.1" letter-spacing=".3" fill="${t.edge}">P-01</text>`;
      s += `<svg x="12" y="9" width="40" height="40" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
      return { defs, body: s };
    }
    if (t.kind === 'liquid') {
      // Liquid Glass: crisp ribbon wallpaper, a light veil, and a rim lit from above
      const rb = ribbonsSvg(t.wall, ids.tile);
      defs += rb.defs + `<clipPath id="${ids.clip}"><rect width="64" height="64" rx="14.4"/></clipPath>`;
      defs += `<radialGradient id="${ids.glow}" cx="32" cy="38" r="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.veil}"/><stop offset="1" stop-color="${t.veil}" stop-opacity="0"/></radialGradient>`;
      defs += `<linearGradient id="${ids.rim}" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.edgeTop}"/><stop offset=".4" stop-color="${t.edgeTop}" stop-opacity="0"/><stop offset=".8" stop-color="${t.edgeBot}" stop-opacity="0"/><stop offset="1" stop-color="${t.edgeBot}"/></linearGradient>`;
      s += `<g clip-path="url(#${ids.clip})">${rb.body}<rect width="64" height="64" fill="url(#${ids.glow})"/></g>`;
      s += `<rect x=".6" y=".6" width="62.8" height="62.8" rx="13.9" fill="none" stroke="url(#${ids.rim})" stroke-width="1.2"/>`;
      s += `<svg x="7" y="6.5" width="50" height="50" viewBox="0 0 ${innerVb} ${innerVb}">${inner}</svg>`;
      return { defs, body: s };
    }
    defs += grad(ids.tile, t.stops, 0, 0, 64, 64);
    const rx = t.kind === 'flat' ? 12.5 : 14.4;
    s += `<rect width="64" height="64" rx="${rx}" fill="url(#${ids.tile})"/>`;
    if (t.glow) {
      defs += `<radialGradient id="${ids.glow}" cx="32" cy="40" r="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${t.glow}"/><stop offset="1" stop-color="${t.glow}" stop-opacity="0"/></radialGradient>`;
      s += `<rect width="64" height="64" rx="${rx}" fill="url(#${ids.glow})"/>`;
    }
    if (t.edge) s += `<rect x=".5" y=".5" width="63" height="63" rx="${rx - .4}" fill="none" stroke="${t.edge}" stroke-width="1"/>`;
    const pad = crisp ? 9.5 : 7.5;
    s += `<svg x="${pad}" y="${pad - .5}" width="${64 - pad * 2}" height="${64 - pad * 2}" viewBox="0 0 ${innerVb} ${innerVb}"${crisp ? ' shape-rendering="crispEdges"' : ''}>${inner}</svg>`;
    return { defs, body: s };
  }

  /* -------------------------------------------- file output: svg() */
  let seq = 0;
  const nextId = () => 'pm' + (++seq).toString(36);
  // reduced motion in a file: no travel; the control breathes in opacity and Pip blinks
  function reducedCss(p, family, px) {
    const d = (MOTION[family] || MOTION.basic).dur;
    const keys = `@keyframes ${p}-breath{0%,100%{opacity:1}50%{opacity:.42}}@keyframes ${p}-rblink{0%,42%,58%,100%{opacity:1}50%{opacity:.15}}`;
    const rules = (pre) => px
      ? `${pre}.${p}-fr{animation:none!important;opacity:0}${pre}.${p}-fr0{opacity:1;animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}`
      : `${pre}.${p}-ctl{animation:${p}-breath ${R(d * 1.3)}s ease-in-out infinite!important}${pre}.${p}-blink{animation:${p}-rblink ${R(d * 2.6)}s ease-in-out infinite!important}`;
    return { keys, rules };
  }
  function fileRigCss(p, kind, family, g, attach) {
    const k = rigFrames(kind, family, g, attach), dur = periodOf(family, kind, 'full') / 1000, P = g.P;
    let css = `.${p}-ctl,.${p}-pup{transform-box:view-box;transform-origin:${P[0]}px ${P[1]}px}.${p}-str{transform-box:view-box;transform-origin:0 0}`;
    css += `.${p}-ctl{animation:${p}-c ${dur}s linear infinite}.${p}-pup{animation:${p}-p ${dur}s linear infinite}.${p}-s0{animation:${p}-s0 ${dur}s linear infinite}.${p}-s1{animation:${p}-s1 ${dur}s linear infinite}`;
    css += `@keyframes ${p}-c{${k.ctl.join('')}}@keyframes ${p}-p{${k.pup.join('')}}@keyframes ${p}-s0{${k.s0.join('')}}@keyframes ${p}-s1{${k.s1.join('')}}`;
    if (kind === 'swing') {
      css += `.${p}-eyes{animation:${p}-e ${dur}s linear infinite}@keyframes ${p}-e{${k.eye.join('')}}`;
      css += `.${p}-blink{transform-box:fill-box;transform-origin:center;animation:${p}-b ${R(dur * 2)}s linear infinite}@keyframes ${p}-b{0%,70%,77%,100%{transform:scaleY(1)}73.5%{transform:scaleY(.1)}}`;
    }
    if (kind === 'think') {
      [1, 2, 3].forEach((i) => { css += `.${p}-dot${i + 1}{animation:${p}-hop ${R(dur * .7)}s cubic-bezier(.45,0,.3,1) infinite;animation-delay:${R((i - 1) * dur * .7 / 6)}s}`; });
      css += `@keyframes ${p}-hop{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4.2px)}}`;
    }
    return css;
  }
  // the painted look's colours, read once per look from the page (for a file made in the page: the favicon, a tray image)
  const tokenCache = Object.create(null);
  function liveTokens(lk) {
    if (!D || !G.getComputedStyle || lk !== look()) return null;
    if (tokenCache[lk]) return tokenCache[lk];
    const probe = D.createElementNS('http://www.w3.org/2000/svg', 'svg');
    probe.setAttribute('class', 'pml pml-f-' + familyOf(lk)); probe.setAttribute('width', '0'); probe.setAttribute('height', '0'); probe.setAttribute('aria-hidden', 'true');
    probe.style.position = 'absolute';
    (D.body || D.documentElement).appendChild(probe);
    const cs = G.getComputedStyle(probe), v = (n) => cs.getPropertyValue('--pip-' + n).trim();
    const out = {};
    const keys = familyOf(lk) === 'nier' ? ['bg', 'ink', 'paper', 'red'] : ['bg', 'ctl', 'pin', 'str', 'eye', 'cheek'];
    keys.forEach((k) => { const x = rgbHex(probeColor(probe, v(k))); if (x) out[k] = x; });
    const hd = familyOf(lk) === 'friendly' ? [rgbHex(probeColor(probe, v('head0'))), rgbHex(probeColor(probe, v('head1')))] : rgbHex(probeColor(probe, v('head')));
    if (Array.isArray(hd) ? hd[0] && hd[1] : hd) out.head = hd;
    probe.remove();
    return (tokenCache[lk] = out);
  }
  function probeColor(probe, value) {
    if (!value) return '';
    probe.style.color = ''; probe.style.color = value;
    return probe.style.color ? G.getComputedStyle(probe).color : '';
  }
  // computed colours come back as rgb() or, for a color-mix() in srgb, as color(srgb r g b) with 0..1 channels
  function rgbHex(c) {
    const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    let m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/.exec(c || '');
    if (m) return '#' + [m[1], m[2], m[3]].map((x) => hex(+x)).join('');
    m = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)/.exec(c || '');
    return m ? '#' + [m[1], m[2], m[3]].map((x) => hex(+x * 255)).join('') : '';
  }
  function svg(opts) {
    const o = Object.assign({ theme: null, form: 'glyph', px: 64, dpr: 1, mood: 'idle', motion: null, reduced: false }, opts || {});
    o.px = Math.max(1, Math.round(+o.px) || 64); o.dpr = Math.max(1, +o.dpr || 1);
    o.form = ['glyph', 'tile', 'tray'].indexOf(o.form) >= 0 ? o.form : 'glyph';
    o.motion = MOTIONS.indexOf(o.motion) >= 0 ? o.motion : null;
    if (['micro', 'small', 'full', 'pixel', 'auto'].indexOf(o.tier) < 0) o.tier = null;
    const outPx = o.px;
    const lk = LOOKS.indexOf(o.look || o.theme) >= 0 ? (o.look || o.theme) : (D ? look() : 'friendly-dark');
    const family = familyOf(lk);
    const th = filePalette(lk, o.tokens || liveTokens(lk));
    o.prefix = safeStem(o.prefix) || nextId();
    const p = o.prefix;
    const inner = o.form === 'tile' ? o.px * .68 : o.px;
    const tier = o.tier && o.tier !== 'auto' ? o.tier : tierFor(inner, family);
    o.px = o.form === 'tile' ? Math.max(12, Math.round(inner)) : o.px;
    if (o.form === 'tile' && th.tile.kind === 'liquid') o._backdrop = { wall: th.tile.wall, x: 7, y: 6.5, size: 50 };
    const anim = !!o.motion && !th.noMotion;
    o.cls = anim ? { ctl: `${p}-ctl`, pup: `${p}-pup`, face: `${p}-face`, eyes: `${p}-eyes`, blink: `${p}-blink`, dot: `${p}-dot`, fr: `${p}-fr`, str: `${p}-str`, s: `${p}-s` } : { fr: `${p}-fr`, str: `${p}-str`, s: `${p}-s` };
    o.ids = { face: p + 'f', grad: p + 'h', clip: p + 'c', rim: p + 'r', glow: p + 'g', spec: p + 's', drop: p + 'd' };
    const m = markBody(o, th, tier), body = m.body;
    const px = !!m.crisp;
    let css = '';
    if (anim) {
      const red = reducedCss(p, family, px);
      if (o.reduced) css = red.keys + red.rules(`.${p} `);
      else {
        if (px) {
          const n = m.frames || 4, d = periodOf(family, o.motion, 'pixel') / 1000;
          css += `.${p}-fr{animation:${p}-flip ${R(d)}s steps(1,end) infinite}@keyframes ${p}-flip{0%{opacity:1}${R(100 / n)}%,100%{opacity:0}}`;
          for (let i = 0; i < n; i++) css += `.${p}-fr${i}{animation-delay:${R(-d + i * d / n)}s}`;
        } else css += fileRigCss(p, o.motion, family, GEO[tier === 'small' ? 'small' : 'full'], o.form === 'tray' ? 'thread' : (o.attach || 'eye'));
        // a file follows the OS setting; inlined in PMConcept7 it follows its switch too
        css += red.keys + `@media (prefers-reduced-motion:reduce){.${p} *{animation:none!important}${red.rules(`.${p} `)}}`;
        css += `:root[data-motion="reduced"] .${p} *,:root[data-reduced-motion="1"] .${p} *{animation:none!important}`;
        css += red.rules(`:root[data-motion="reduced"] .${p} `) + red.rules(`:root[data-reduced-motion="1"] .${p} `);
      }
    }
    // written in two pieces: this file is inlined in the page's head, where a closing style tag would end the block
    const style = css ? '<style>' + css + '<' + '/style>' : '';
    const label = o.title || 'Puppet Master';
    const role = anim || o.decorative ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(label) + '"';
    const size = `width="${o.px}" height="${o.px}"`;
    if (o.form === 'tile') {
      const ids = { tile: p + 't', glow: p + 'w', rim: p + 'q', clip: p + 'k' };
      const innerSvg = (m.defs ? `<defs>${m.defs}</defs>` : '') + body;
      const fr = tileFrame(th, ids, innerSvg, m.vb, m.crisp);
      return `<svg xmlns="http://www.w3.org/2000/svg" class="${p}" width="${outPx}" height="${outPx}" viewBox="0 0 64 64" ${role}>${style}<defs>${fr.defs}</defs>${fr.body}</svg>`;
    }
    // sprites land on whole device pixels: pad the view box instead of scaling by a fraction
    let vbox = `0 0 ${m.vb} ${m.vb}`;
    if (m.crisp) {
      // k device pixels per sprite cell; the view box is in sprite cells: device size / k (never divided by dpr again)
      const Dp = Math.round(o.px * (o.dpr || 1)), k = Math.floor(Dp / m.vb);
      if (k >= 1 && Dp < 64 && Dp % m.vb) { const V = R(Dp / k), pad = R((V - m.vb) / 2); vbox = `${-pad} ${-pad} ${V} ${V}`; }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" class="${p}" ${size} viewBox="${vbox}"${m.crisp ? ' shape-rendering="crispEdges"' : ''} ${role}>${style}${m.defs ? `<defs>${m.defs}</defs>` : ''}${body}</svg>`;
  }
  // a still mark as a data: URL (the favicon; a static file in the painted look's colours)
  function dataUrl(opts) { return 'data:image/svg+xml,' + encodeURIComponent(svg(Object.assign({ px: 32, decorative: false }, opts || {}, { motion: null }))); }
  // The favicon is the app icon (A1: one fixed tile, Basic Dark, static); the title-bar lane writes the <link rel="icon">.
  // tokens: {} keeps the frozen Basic Dark export palette: without it a page painted in Basic Dark sampled its live
  // tokens, so the favicon's colours depended on the saved look (Astra M2-A1)
  function favicon(px) { return dataUrl({ look: 'basic-dark', form: 'tile', px: px || 32, title: 'Puppet Master', tokens: {} }); }

  /* ------------------------------------------------------------ the clock */
  /* One clock for every Pip motion, so loaders on screen stay in phase and a live Pip can sway with them. It runs on
     the document timeline (the time every CSS animation uses) and stands still while it is held: during a drag
     (body.pm-resizing and the other drag classes the hover engine rests on) and for any reason a caller holds it.
     now() is its time in ms; phase(p) where a loop of period p is (0..1); delay(p) the animation-delay that starts an
     animation of period p in that phase at the current frame. speed() is Animation speed's factor (kit.d/17-look.js:
     Fast .6, Measured 1, Cinematic 1.6). */
  const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
  const SPEED = Object.freeze({ Fast: 0.6, Measured: 1, Cinematic: 1.6 });
  const tl = () => (D && D.timeline && typeof D.timeline.currentTime === 'number' ? D.timeline.currentTime : (G.performance ? G.performance.now() : Date.now()));
  const clockSubs = new Set(), holds = new Set();
  let heldAt = null, heldFor = 0;
  function emitClock(why) { clockSubs.forEach((fn) => { try { fn(why); } catch (_) { /* a listener's error is its own */ } }); }
  const clock = {
    now() { return (heldAt != null ? heldAt : tl()) - heldFor; },
    phase(p) { const n = clock.now(); return p > 0 ? ((n % p) + p) % p / p : 0; },
    delay(p) { return p > 0 ? -(((clock.now() % p) + p) % p) : 0; },
    // Animation speed (general.visual.animation-speed), read through the Settings script's public PM51.value with the
    // look pass's own table (kit.d/17-look.js O55_SPEED); its factor variable is private to that script
    speed() { try { const P = G.PM51, v = P && typeof P.value === 'function' ? P.value('general.visual.animation-speed') : null; return SPEED[v] || 1; } catch (_) { return 1; } },
    hold(why) { const w = String(why || 'hold'); if (holds.has(w)) return; if (!holds.size) heldAt = tl(); holds.add(w); emitClock('hold'); },
    release(why) { const w = String(why || 'hold'); if (!holds.delete(w)) return; if (!holds.size && heldAt != null) { heldFor += tl() - heldAt; heldAt = null; emitClock('release'); } },
    held() { return [...holds]; },
    on(fn) { if (typeof fn !== 'function') return () => {}; clockSubs.add(fn); return () => clockSubs.delete(fn); }
  };
  function watchDrags() {
    const b = D && D.body;
    if (!b || watchDrags.done) return;
    watchDrags.done = true;
    const sync = () => { const drag = DRAG.some((c) => b.classList.contains(c)); if (drag) clock.hold('drag'); else clock.release('drag'); };
    new MutationObserver(sync).observe(b, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  /* ---------------------------------------------------------- look changes */
  const lookSubs = new Set();
  let lastLook = null;
  function watchLook() {
    if (!D || watchLook.done) return;
    watchLook.done = true;
    lastLook = look();
    new MutationObserver(() => {
      const now = look();
      if (now === lastLook) return;
      const was = lastLook; lastLook = now;
      Object.keys(tokenCache).forEach((k) => { delete tokenCache[k]; });
      lookSubs.forEach((fn) => { try { fn(now, was); } catch (_) { /* a listener's error is its own */ } });
    }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier'] });
  }
  function onLook(fn) { if (typeof fn !== 'function') return () => {}; watchLook(); lookSubs.add(fn); return () => lookSubs.delete(fn); }
  if (D) {
    if (D.body) watchDrags(); else D.addEventListener('DOMContentLoaded', watchDrags, { once: true });
    watchLook();
  }

  /* ---------------------------------------------- moods and status keys */
  // A5: every mood maps to one of the 22 pinned status keys (scripts/pm7-canon-check.py); no mood adds a key. A face
  // never invents state: an owner's typed status picks the face (STATUS_FACE), and decorative moods map to idle or
  // complete only for what they show.
  const MOODS = ['idle', 'happy', 'alert', 'wonder', 'error', 'sleep', 'think', 'wink', 'watch', 'oops', 'working'];
  const MOOD_STATUS = Object.freeze({
    idle: 'idle', think: 'working', working: 'working', happy: 'complete', alert: 'waiting', wonder: 'waiting',
    error: 'failed', oops: 'failed', sleep: 'paused', watch: 'idle', wink: 'complete'
  });
  // the face that shows a status key (tray, notifications, the chat's status faces); keys with no face show idle
  const STATUS_FACE = Object.freeze({
    idle: 'idle', working: 'working', reviewing: 'working', recovering: 'working', complete: 'happy', waiting: 'alert',
    blocked: 'oops', failed: 'error', warning: 'oops', offline: 'oops', paused: 'sleep', 'waiting-dep': 'sleep',
    pending: 'sleep', skipped: 'idle', off: 'sleep', info: 'idle', mixed: 'oops', 'change-modified': 'idle',
    'change-added': 'idle', 'change-deleted': 'idle', 'change-conflict': 'alert', 'change-renamed': 'idle'
  });
  /* A3, the tray: one face for the whole app, summed over every Project, on existing keys only: waiting (needs you,
     always wins) > failed > blocked > working > paused (only when everything left is paused) > complete (about 10 s
     after the work finished) > idle. Blocked shows oops, never the needs-you face (B5 keeps them apart). This is the
     one reducer: PM_WORK.tray() hands it live work, and a caller may hand it any status list.
     states: [{ key, at?, stopping?, seen? }]. Live keys (waiting, blocked, recovering, working, reviewing, waiting-dep)
     are outstanding work, and so is anything stopping (G5); paused counts as remaining work; complete counts for
     completeMs after at (or when at is absent); failed counts until seen; skipped, warning, pending and the rest are
     not outstanding. Returns { key, mood, frames, counts }. */
  const TRAY = Object.freeze({ order: Object.freeze(['waiting', 'failed', 'blocked', 'working', 'paused', 'complete', 'idle']), completeMs: 10000,
    live: Object.freeze(['waiting', 'blocked', 'recovering', 'working', 'reviewing', 'waiting-dep']),
    faces: Object.freeze({ waiting: 'alert', failed: 'error', blocked: 'oops', working: 'working', paused: 'sleep', complete: 'happy', idle: 'idle' }) });
  function trayFace(states, now) {
    const t = now == null ? Date.now() : now, has = {};
    const add = (k) => { has[k] = (has[k] || 0) + 1; };
    let live = 0, paused = 0;
    (Array.isArray(states) ? states : []).forEach((s) => {
      if (!s) return;
      const k = s.stopping ? 'working' : String(s.key);
      if (TRAY.live.indexOf(k) >= 0) { live++; add(k === 'waiting' ? 'waiting' : k === 'blocked' ? 'blocked' : 'working'); }
      else if (k === 'paused') { live++; paused++; }
      else if (k === 'failed') { if (!s.seen) add('failed'); }
      else if (k === 'complete') { if (s.at == null || t - s.at < TRAY.completeMs) add('complete'); }
    });
    if (live && paused === live) has.paused = paused;
    const key = TRAY.order.find((k) => has[k]) || 'idle';
    return { key, mood: TRAY.faces[key], frames: key === 'working' ? 4 : 1, counts: has };
  }

  /* ---------------------------------------------------------------- export */
  // THEMES keeps the concept's shape (label, family, scheme beside the colours) for the live rigs ported from it
  // (onboarding's stage, the chat's sheet hosts); solidStr is the concept's opaque string colour.
  const THEMES = Object.freeze(LOOKS.reduce((o, lk) => {
    // filePalette adds what the drawing parts derive: back (the back stick), headSolid, glass.rodBack, NieR's flags
    o[lk] = Object.assign({ label: lk.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }, filePalette(lk));
    return o;
  }, {}));
  const solidStr = (th) => (String(th.str).indexOf('rgba') === 0 ? (th.scheme === 'dark' ? '#B9C2D2' : '#5B6476') : th.str);
  const kit = { GEO, R, mix, solid, solidStr, grad, sticks, anchors, barAttach, eyelets, stringEnds, headPath, headPathNier, faceShapes,
    controlSvg, pipHead, eyeletRings, nierHud, pipNier, ribbonsSvg, RIBBONS, pose, wave, transformsAt, rigFrames, spriteRows,
    pixelRects, nier16, SPRITES, rolePalette, filePalette, roleStyles };
  const solver = {
    strings: (tier, ctlAt, place, style) => stringEnds(GEO[tier === 'small' ? 'small' : 'full'], style || 'eye', ctlAt, place),
    pose: (motion, family, u) => pose(motion, family, u),
    transforms: (tier, ps, attach) => transformsAt(GEO[tier === 'small' ? 'small' : 'full'], Object.assign({}, REST, ps || {}), attach)
  };
  G.PMLogo = {
    product: true, version: '1.0',
    mark, svg, dataUrl, favicon, look, onLook, family: familyOf, scheme: schemeOf, tierFor,
    // NieR never moves: 0. Whole ms at speed 1 otherwise.
    period: (o) => { const f = o && o.family || familyOf(o && o.look || look()); return f === 'nier' ? 0 : Math.round(periodOf(f, o && o.motion || 'swing', tierFor(o && o.px || 24, f))); },
    LOOKS, FAMILIES, MOTION, MOTIONS, THEME_ORDER: LOOKS, THEMES, EXPORT,
    MOODS, MOOD_STATUS, STATUS_FACE, TRAY, trayFace, moodFor: (key) => STATUS_FACE[key] || 'idle',
    clock, solver, kit
  };
})(typeof window !== 'undefined' ? window : globalThis);
