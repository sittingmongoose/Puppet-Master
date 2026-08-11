/* ============================================================================
   Opusicon / pm-core.js
   Single source of truth for every Puppet Master logo asset.

   Loaded as a CLASSIC script by both:
     - index.html          <script src="pm-core.js">   (works under file://)
     - tools/emit.mjs      via node:vm                  (writes files to disk)
   so the live preview and the downloaded bytes are produced by the same code
   and cannot drift apart.

   ES modules are deliberately NOT used: <script type="module"> is subject to
   CORS and fails under file://, which is the primary way this page is opened.

   Geometry below is derived from the authored path data of
   "Pm placeholder 3.svg", not eyeballed. See GEO for the derivation results.
   ============================================================================ */
(function (root) {
  'use strict';

  /* --------------------------------------------------------------------------
     1. GEOMETRY  (all values in the 43.2 x 43.2 source viewBox)
     --------------------------------------------------------------------------
     The control cross is a perfectly symmetric X. Both bars share |slope|
     0.4432 (23.9044 deg), length 31.07, and span x 7.785 -> 36.190 on their
     centre lines, with round caps of radius 1.578 (perpendicular width 3.156).

     We redraw the bars as STROKED LINES with round caps instead of reusing the
     filled outlines. Visually identical, but the weight becomes a parameter --
     which is what makes the optical size tiers possible at all.
     -------------------------------------------------------------------------- */
  var GEO = {
    VB: 43.2,
    // bar centerlines
    // Centre lines recovered by flattening the authored cubics (t=1/200) and
    // taking scanline cross-sections -- NOT from the path's outer extremes.
    // Check: left cap centre 7.785 - radius 1.578 = 6.207, and the measured
    // path bbox min-x is 6.210. Taking the outer extremes instead gives 5.82.
    MAIN: { x1: 7.785, y1: 7.600, x2: 36.190, y2: 20.190 },
    CTR:  { x1: 7.785, y1: 20.190, x2: 36.190, y2: 7.600 },
    BAR_W: 3.156,          // perpendicular thickness (cap radius 1.578)
    // the crossing point -- transform-origin for every rotation
    PIVOT: { x: 21.99, y: 13.895, fx: 0.50902, fy: 0.32164 },
    // strings: str-l hangs from the COUNTER bar, str-r from the MAIN bar
    STR_L: { x: 14.42, y: 15.60, w: 0.97, h: 8.59,  cx: 14.905, dx: -7.08, bar: 'ctr'  },
    STR_R: { x: 28.85, y: 16.28, w: 0.97, h: 12.18, cx: 29.335, dx: +7.35, bar: 'main' },
    ANGLE: 23.9044
  };

  /* Authored letterform + bracket outlines, lifted verbatim from the source.
     These are true outlines (not strokes) so they cannot be re-weighted --
     which is exactly why they are dropped below the "full" tier. */
  var PATH = {
    BRK_L: 'M9.34,28.55c0,.19-.03.34-.1.43-.07.09-.17.16-.31.21.14.05.24.13.31.26.07.12.1.25.1.38v1.73c0,.13,0,.23.03.31.02.08.04.14.08.19.03.05.08.08.13.1.05.02.12.03.19.04.13.02.23.08.3.16s.11.2.11.34c0,.15-.05.27-.14.36s-.21.14-.37.14c-.25,0-.47-.02-.65-.06-.19-.04-.34-.12-.47-.22-.12-.1-.22-.25-.28-.43-.06-.18-.1-.42-.1-.7v-1.62c0-.15-.02-.25-.07-.32-.05-.07-.13-.11-.24-.13-.14-.02-.25-.08-.32-.17s-.11-.21-.11-.37c0-.13.04-.25.11-.34.07-.09.18-.15.31-.17.12-.02.2-.06.25-.14.05-.07.08-.18.08-.33v-1.62c0-.3.03-.54.1-.72s.17-.33.29-.43.28-.17.47-.21c.19-.04.39-.05.62-.05.16,0,.29.04.38.13.09.09.14.21.14.37,0,.14-.04.25-.11.34-.08.09-.18.14-.31.16-.07,0-.13.02-.19.04-.05.02-.09.06-.13.1-.03.05-.06.11-.08.19-.02.08-.03.18-.03.31v1.73Z',
    BRK_R: 'M34.64,29.01c0-.13,0-.23-.03-.31-.02-.08-.04-.14-.08-.19-.03-.05-.08-.08-.13-.1-.05-.02-.11-.04-.19-.04-.13-.02-.23-.08-.31-.16-.08-.08-.11-.2-.11-.34,0-.16.05-.29.14-.37.09-.08.22-.13.38-.13.22,0,.43.02.62.05.19.04.34.11.47.21s.22.25.29.43.1.42.1.72v1.62c0,.15.03.26.08.33.05.07.14.12.25.14.13.02.24.08.31.17.07.09.11.2.11.34s-.04.27-.11.37-.18.15-.32.17c-.11.02-.19.06-.24.13-.05.07-.07.18-.07.32v1.62c0,.29-.03.52-.1.7-.06.18-.16.33-.28.43-.13.1-.28.18-.47.22-.19.04-.4.06-.65.06-.15,0-.27-.05-.37-.14s-.14-.21-.14-.36.04-.25.11-.34.17-.14.3-.16c.07,0,.14-.02.19-.04.05-.02.1-.06.13-.1.03-.05.06-.11.08-.19.02-.08.03-.18.03-.31v-1.73c0-.13.03-.26.1-.38.07-.12.17-.21.31-.26-.14-.05-.24-.12-.31-.21-.07-.09-.1-.23-.1-.43v-1.73Z',
    M:     'M26.38,32.54l3.13-6.67c.16-.34.35-.59.59-.74.23-.15.5-.22.79-.22.48,0,.84.14,1.1.42s.38.65.38,1.1v10.3c0,.38-.11.68-.34.89-.23.21-.53.32-.91.32s-.66-.11-.88-.32-.33-.51-.33-.89v-7l-2.34,4.92c-.15.32-.32.54-.52.65s-.42.17-.68.17-.49-.06-.69-.17-.38-.34-.52-.65l-2.3-4.86v6.94c0,.38-.11.68-.33.89s-.52.32-.9.32-.66-.11-.88-.32-.33-.51-.33-.89v-10.3c0-.45.12-.82.37-1.1.24-.28.61-.42,1.09-.42.3,0,.56.07.79.22s.44.39.61.74l3.13,6.67Z',
    P:     'M12.93,36.25c-.55,0-1-.16-1.32-.48-.33-.33-.5-.75-.5-1.27v-10.37c0-.52.16-.94.49-1.27.32-.32.75-.49,1.26-.49h3.3c.78,0,1.49.09,2.12.28.65.19,1.21.48,1.67.86.47.38.84.87,1.09,1.45.25.56.38,1.23.38,1.99,0,1.5-.49,2.67-1.45,3.48-.94.79-2.21,1.19-3.8,1.19h-1.47v2.89c0,.52-.16.94-.49,1.27-.32.32-.75.49-1.26.49ZM15.79,28.44c.76,0,1.33-.13,1.63-.37.28-.22.41-.59.41-1.12,0-.46-.13-.79-.41-1.01-.3-.24-.87-.37-1.63-.37h-1.1v2.87h1.1Z'
  };

  /* --------------------------------------------------------------------------
     2. OPTICAL SIZE TIERS
     --------------------------------------------------------------------------
     Measured against the source canvas: a 0.97-unit string renders 0.36px at
     16px and 0.54px at 24px. Below ~1px a feature stops existing. The brackets,
     the PM counter-channel and the strings all die within 8px of each other,
     between 43 and 51px -- a clean natural tier boundary.

     Weight alone was not enough. Thickening the authored geometry at 16px still
     reads as a pair of crossed blades: the cross spans 69% of the canvas while
     the strings are short stubs, so the silhouette is dominated by the X and the
     marionette reading is lost. Verified by rendering five weight-only variants
     side by side at 16-32px.

     What fixes it is PROPORTION -- narrow the cross, lengthen the strings, so
     the silhouette becomes "a bar with things hanging from it". The authored
     asymmetry (strings of 8.59 and 12.18 at different heights) also stops
     reading as intentional below ~48px and starts looking like a defect, so the
     redrawn tiers are symmetric.

        tier    use                     geometry
        micro   tray 16-24              redraw, cross 72% span, heavy
        small   title bar 25-63         redraw, cross 86% span
        full    app icon, splash 64+    authored geometry, untouched

     `full` is authored geometry. `micro`/`small` set `redraw`. */
  var TIERS = {
    micro: { redraw: true, spanX: 0.72, barW: 4.00, strW: 2.90, strBot: 37.0, yShift: -2.5,
             pm: false, brackets: false, scale: 1, strAt: 0.48 },
    small: { redraw: true, spanX: 0.86, barW: 3.10, strW: 1.95, strBot: 34.0, yShift: -1.5,
             pm: false, brackets: false, scale: 1, strAt: 0.50 },
    full:  { barW: 3.156, strW: 0.97, strings: ['l', 'r'], pm: true, brackets: true, scale: 1.00 }
  };

  function tierFor(px) {
    if (px <= 24) return 'micro';
    if (px < 64) return 'small';
    return 'full';
  }

  /* --------------------------------------------------------------------------
     3. THEME TABLE -- values transcribed verbatim from Concepts/PMConcept7.html
     -------------------------------------------------------------------------- */
  var THEMES = [
    { slug: 'friendly-dark',  label: 'Friendly Dark',  family: 'friendly', mode: 'dark',
      bg: '#211E26', surface: '#2A2731', accent: '#6FC6E8', text: '#F0EDF4', radius: 14 },
    { slug: 'friendly-light', label: 'Friendly Light', family: 'friendly', mode: 'light',
      bg: '#FBF7F3', surface: '#FFFFFF', accent: '#3F9CC7', text: '#4A4550', radius: 14 },
    { slug: 'glass-dark',     label: 'Glass Dark',     family: 'glass',    mode: 'dark',
      bg: '#241B36', surface: '#2E2248', accent: '#B79CFF', text: '#EDE7F8', radius: 12 },
    { slug: 'glass-light',    label: 'Glass Light',    family: 'glass',    mode: 'light',
      bg: '#E4CDE4', surface: '#F6F0FF', accent: '#8B6ED9', text: '#453A5C', radius: 12 },
    { slug: 'retro-dark',     label: 'Retro Dark',     family: 'retro',    mode: 'dark',
      bg: '#1A1A1A', surface: '#252525', accent: '#00FF41', text: '#E0E0E0', radius: 0 },
    { slug: 'retro-light',    label: 'Retro Light',    family: 'retro',    mode: 'light',
      bg: '#F5F0E8', surface: '#FAF7F2', accent: '#0047AB', text: '#1A1A1A', radius: 0 },
    { slug: 'basic-dark',     label: 'Basic Dark',     family: 'basic',    mode: 'dark',
      bg: '#121212', surface: '#1E1E1E', accent: '#64B5F6', text: '#E8E8E8', radius: 4 },
    { slug: 'basic-light',    label: 'Basic Light',    family: 'basic',    mode: 'light',
      bg: '#EAECEF', surface: '#FFFFFF', accent: '#0056B3', text: '#1A1A1A', radius: 4 }
  ];

  function theme(slug) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].slug === slug) return THEMES[i];
    return THEMES[0];
  }

  /* --------------------------------------------------------------------------
     4. CONTRAST -- WCAG 2.x relative luminance / ratio
     --------------------------------------------------------------------------
     Used to PICK the mark colour rather than hardcode it. Taking the mark
     mechanically from --background fails the 3:1 non-text floor (WCAG 1.4.11)
     on glass-light (2.66:1) and friendly-light (2.90:1); choosing the best of
     {background, white, black} clears it everywhere.
     -------------------------------------------------------------------------- */
  function _lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }

  function luminance(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b);
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return ((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05));
  }

  function mix(a, b, k) {
    function ch(h, i) { return parseInt(String(h).replace('#', '').substr(i, 2), 16); }
    var out = '#';
    for (var i = 0; i < 6; i += 2) {
      var v = Math.round(ch(a, i) * (1 - k) + ch(b, i) * k);
      out += (v < 16 ? '0' : '') + v.toString(16);
    }
    return out.toUpperCase();
  }

  var FLOOR = 3.0;   // WCAG 1.4.11 non-text minimum
  var AIM   = 4.5;   // what we actually try to hit before reaching for ink we didn't choose

  /* Resolve the tile/mark pair for a theme + polarity.

     Rather than hardcoding one token (which fails the 3:1 floor on glass-light
     and friendly-light), this prefers the theme's OWN colours and only reaches
     outside the palette when it must:

       1. the theme background as ink, if it clears AIM       -> keeps theme character
       2. otherwise deepen the accent tile toward the theme's ink until white
          clears AIM                                          -> keeps the hue, stays light
       3. otherwise whichever of white/black simply wins       -> last resort
  */
  function colorsFor(slug, polarity) {
    var t = theme(slug);
    if (polarity === 'ground') {
      // quiet: tile is the theme's own surface, mark is the brand accent
      return { tile: t.surface, mark: t.accent, ratio: contrast(t.surface, t.accent), adjusted: false };
    }

    // 1. the theme's own background as knocked-out ink
    var r0 = contrast(t.accent, t.bg);
    if (r0 >= AIM) return { tile: t.accent, mark: t.bg, ratio: r0, adjusted: false };

    // 2. deepen the tile toward the theme's ink, keeping a light knockout
    var knock = t.mode === 'light' ? '#FFFFFF' : t.bg;
    for (var k = 0; k <= 0.6; k += 0.05) {
      var tile = mix(t.accent, t.text, k);
      var r = contrast(tile, knock);
      if (r >= AIM) return { tile: tile, mark: knock, ratio: r, adjusted: k > 0 };
    }

    // 3. last resort
    var best = null;
    ['#FFFFFF', '#000000'].forEach(function (ink) {
      var rr = contrast(t.accent, ink);
      if (!best || rr > best.ratio) best = { tile: t.accent, mark: ink, ratio: rr, adjusted: false };
    });
    return best;
  }

  /* --------------------------------------------------------------------------
     5. MOTIONS
     --------------------------------------------------------------------------
     Every motion animates the PARTS of the rig, never the whole tile.

     `slint: true`  -> expressible with Slint's animation-tick() + rotation-angle
                       / x / y / opacity, so it can be ported natively.
     `slint: false` -> depends on stroke-dashoffset or similar; web only. These
                       are labelled in the dashboard rather than shipped as
                       Slint components that would silently not animate.

     Note on phase: the strings are siblings of #bars, not children, so they do
     not inherit the cross rotation -- their travel is authored explicitly from
     the measured attach offsets (str-l dx -7.08, str-r dx +7.35). A rigid +7deg
     tilt lifts str-l by 0.863 and drops str-r by 0.895; the keyframes below use
     those numbers, which is why the strings look mechanically connected.
     -------------------------------------------------------------------------- */
  var MOTIONS = [
    { id: 'rig',   name: 'Marionette Rig',  dur: 1800, slint: true,
      blurb: 'The cross tilts; each string rises and falls with the bar it actually hangs from.' },
    { id: 'pluck', name: 'String Pluck',    dur: 1500, slint: true,
      blurb: 'Bars hold still while the strings pluck in sequence and settle.' },
    { id: 'rock',  name: 'Control-Bar Rock', dur: 2000, slint: true,
      blurb: 'A slow single-axis rock with the strings swinging a beat behind.' },
    { id: 'takeup', name: 'Take-Up',        dur: 2000, slint: true,
      blurb: 'Hand over hand — one string reels in while the other pays out, tilting the puppet.' },
    { id: 'weave', name: 'Pulse Weave',     dur: 1600, slint: true,
      blurb: 'Light travels along each bar through the over/under crossing.' },
    { id: 'drop',  name: 'Suspend Drop',    dur: 1900, slint: true,
      blurb: 'PM is lowered on its strings and settles, over and over.' },
    { id: 'orbit', name: 'Crossbar Scissor', dur: 2200, slint: true,
      blurb: 'The cross turns a full revolution while the strings stay plumb.' },
    { id: 'cut',   name: 'Cut Strings',     dur: 1700, slint: true, determinate: true,
      blurb: 'Strings pay out and reel back from the bar. Rests full; drives a determinate progress fill.' }
  ];

  function motion(id) {
    for (var i = 0; i < MOTIONS.length; i++) if (MOTIONS[i].id === id) return MOTIONS[i];
    return null;
  }

  /* cubic-bezier(.37,0,.63,1) is exact sine-in-out. Chaining four of these
     across a 0/+A/0/-A/0 oscillation reproduces a true sinusoid with continuous
     velocity at every key INCLUDING the wrap; ease-in-out (.42,0,.58,1) does
     not, and the mismatch reads as a faint stutter once per loop.
     -------------------------------------------------------------------------- */
  var SINE = 'cubic-bezier(.37,0,.63,1)';

  /* Each builder returns the CSS body for its motion.
     `d` is the period in ms; `R` is the tier's resolved rigCoords, so the
     transform origins follow the redrawn tiers instead of assuming `full`. */
  var MOTION_CSS = {
    rig: function (d, R) {
      return [
        '#bars{transform-box:view-box;transform-origin:' + R.pivot.x + 'px ' + R.pivot.y + 'px;animation:o-rig-bars ' + d + 'ms ' + SINE + ' infinite}',
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-rig-sl ' + d + 'ms ' + SINE + ' infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-rig-sr ' + d + 'ms ' + SINE + ' infinite}',
        '#pm{transform-box:view-box;transform-origin:' + R.pivot.x + 'px 30px;animation:o-rig-pm ' + d + 'ms ' + SINE + ' infinite}',
        '@keyframes o-rig-bars{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}',
        // str-l hangs from the counter bar: tilt +7deg lifts it 0.863
        '@keyframes o-rig-sl{0%,100%{transform:translateY(0.863px) rotate(2.5deg)}50%{transform:translateY(-0.863px) rotate(-2.5deg)}}',
        // str-r hangs from the main bar: tilt +7deg drops it 0.895
        '@keyframes o-rig-sr{0%,100%{transform:translateY(-0.895px) rotate(-2.5deg)}50%{transform:translateY(0.895px) rotate(2.5deg)}}',
        // the puppet lags the rig by a quarter cycle
        '@keyframes o-rig-pm{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(0.35px) rotate(1.2deg)}75%{transform:translateY(-0.35px) rotate(-1.2deg)}}'
      ].join('\n');
    },

    pluck: function (d, R) {
      // Rotate about each string's TOP so it swings like a plucked string.
      // The earlier version scaled X, which just made a 0.97-wide string fatter.
      // Amplitudes decay 0.62 per half cycle (Q ~ 6); str-r is the longer string
      // (11.21 vs 7.62 free length) so it swings later and slightly softer.
      return [
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-pl-l ' + d + 'ms linear infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-pl-r ' + d + 'ms linear infinite}',
        '#pm{transform-box:view-box;transform-origin:' + R.pivot.x + 'px 30px;animation:o-pl-pm ' + d + 'ms ease-out infinite}',
        '@keyframes o-pl-l{0%,52%,100%{transform:rotate(0deg)}3%{transform:rotate(-7deg)}9%{transform:rotate(4.34deg)}18%{transform:rotate(-2.69deg)}28%{transform:rotate(1.67deg)}38%{transform:rotate(-1.03deg)}46%{transform:rotate(.4deg)}}',
        '@keyframes o-pl-r{0%,50%,100%{transform:rotate(0deg)}54%{transform:rotate(-5.95deg)}61%{transform:rotate(3.69deg)}72%{transform:rotate(-2.29deg)}84%{transform:rotate(1.42deg)}94%{transform:rotate(-.55deg)}}',
        '@keyframes o-pl-pm{0%,100%{transform:translateY(0)}6%{transform:translateY(.35px)}30%{transform:translateY(0)}56%{transform:translateY(.35px)}82%{transform:translateY(0)}}'
      ].join('\n');
    },

    rock: function (d, R) {
      return [
        '#bars{transform-box:view-box;transform-origin:' + R.pivot.x + 'px ' + R.pivot.y + 'px;animation:o-rk-b ' + d + 'ms ' + SINE + ' infinite}',
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-rk-l ' + d + 'ms ' + SINE + ' infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-rk-r ' + d + 'ms ' + SINE + ' infinite}',
        '@keyframes o-rk-b{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}',
        // strings trail the bar by a quarter period -- the follow-through
        '@keyframes o-rk-l{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(.62px) rotate(4deg)}50%{transform:translateY(0) rotate(0deg)}75%{transform:translateY(-.62px) rotate(-4deg)}}',
        '@keyframes o-rk-r{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-.64px) rotate(-4deg)}50%{transform:translateY(0) rotate(0deg)}75%{transform:translateY(.64px) rotate(4deg)}}'
      ].join('\n');
    },

    takeup: function (d, R) {
      // Hand over hand: one string reels in while the other pays out, so the
      // puppet tilts on its rigging. Replaces an earlier stroke-dashoffset
      // "draw on" motion -- that could not work in Slint (no dash properties
      // exist) and, mid-retraction, read as scattered debris rather than a
      // line being drawn.
      // Travel is the free length times the scale delta: 8.59*0.14 = 1.20 and
      // 12.18*0.13 = 1.58 units. The letters sit ~15 units apart, so the
      // differential works out to a ~2.6deg tilt.
      return [
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-tu-l ' + d + 'ms ' + SINE + ' infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-tu-r ' + d + 'ms ' + SINE + ' infinite}',
        '#pm{transform-box:view-box;transform-origin:' + R.pivot.x + 'px 30px;animation:o-tu-pm ' + d + 'ms ' + SINE + ' infinite}',
        '@keyframes o-tu-l{0%,100%{transform:scaleY(1)}25%{transform:scaleY(.86)}75%{transform:scaleY(1.14)}}',
        '@keyframes o-tu-r{0%,100%{transform:scaleY(1)}25%{transform:scaleY(1.13)}75%{transform:scaleY(.87)}}',
        '@keyframes o-tu-pm{0%,100%{transform:rotate(0deg) translateY(0)}25%{transform:rotate(2.6deg) translateY(.22px)}75%{transform:rotate(-2.6deg) translateY(-.22px)}}'
      ].join('\n');
    },

    weave: function (d, R) {
      return [
        '#bar-main{animation:o-wv-a ' + d + 'ms ' + SINE + ' infinite}',
        '#bar-counter{animation:o-wv-b ' + d + 'ms ' + SINE + ' infinite}',
        '#str-l{animation:o-wv-s ' + d + 'ms ' + SINE + ' infinite;animation-delay:' + Math.round(d * 0.15) + 'ms}',
        '#str-r{animation:o-wv-s ' + d + 'ms ' + SINE + ' infinite;animation-delay:' + Math.round(d * 0.35) + 'ms}',
        '@keyframes o-wv-a{0%,100%{opacity:.78}30%{opacity:1}60%{opacity:.78}}',
        '@keyframes o-wv-b{0%,100%{opacity:1}30%{opacity:.78}60%{opacity:1}}',
        '@keyframes o-wv-s{0%,100%{opacity:.82}50%{opacity:1}}'
      ].join('\n');
    },

    drop: function (d, R) {
      return [
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-dp-s ' + d + 'ms cubic-bezier(.34,1.56,.64,1) infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-dp-s ' + d + 'ms cubic-bezier(.34,1.56,.64,1) infinite}',
        '#pm{transform-box:view-box;transform-origin:' + R.pivot.x + 'px 24px;animation:o-dp-pm ' + d + 'ms cubic-bezier(.34,1.56,.64,1) infinite}',
        '@keyframes o-dp-s{0%,100%{transform:scaleY(.72)}45%{transform:scaleY(1.12)}}',
        '@keyframes o-dp-pm{0%,100%{transform:translateY(-1.5px)}45%{transform:translateY(1.1px)}}'
      ].join('\n');
    },

    orbit: function (d, R) {
      // The two bars counter-rotate against each other -- the X opens and closes.
      // The previous version spun #bars a full turn while the strings, which are
      // SIBLINGS of #bars rather than children, stayed put and visibly detached.
      //
      // str-r hangs from the main bar at dx +7.35, str-l from the counter bar at
      // dx -7.08. Rotating main by +t and counter by -t moves BOTH attach points
      // down together (dx * sin of each bar's own angle), so the strings bob in
      // unison -- the correct physics for a scissor, and the clean contrast with
      // Marionette Rig where they oppose. Travel at 6deg: 0.768 and 0.740 units.
      return [
        '#bar-main{transform-box:view-box;transform-origin:' + R.pivot.x + 'px ' + R.pivot.y + 'px;animation:o-ob-a ' + d + 'ms ' + SINE + ' infinite}',
        '#bar-counter{transform-box:view-box;transform-origin:' + R.pivot.x + 'px ' + R.pivot.y + 'px;animation:o-ob-b ' + d + 'ms ' + SINE + ' infinite}',
        '#str-l{transform-box:view-box;animation:o-ob-sl ' + d + 'ms ' + SINE + ' infinite}',
        '#str-r{transform-box:view-box;animation:o-ob-sr ' + d + 'ms ' + SINE + ' infinite}',
        '#pm{transform-box:view-box;animation:o-ob-pm ' + d + 'ms ' + SINE + ' infinite}',
        '@keyframes o-ob-a{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}',
        '@keyframes o-ob-b{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-6deg)}}',
        '@keyframes o-ob-sl{0%,100%{transform:translateY(-0.74px)}50%{transform:translateY(0.74px)}}',
        '@keyframes o-ob-sr{0%,100%{transform:translateY(-0.77px)}50%{transform:translateY(0.77px)}}',
        '@keyframes o-ob-pm{0%,100%{transform:translateY(-0.5px)}50%{transform:translateY(0.5px)}}'
      ].join('\n');
    },

    cut: function (d, R) {
      return [
        '#str-l{transform-box:view-box;transform-origin:' + R.strings[0].cx + 'px ' + R.strings[0].top + 'px;animation:o-ct-s ' + d + 'ms cubic-bezier(.4,0,.2,1) infinite}',
        '#str-r{transform-box:view-box;transform-origin:' + R.strings[1].cx + 'px ' + R.strings[1].top + 'px;animation:o-ct-s ' + d + 'ms cubic-bezier(.4,0,.2,1) infinite;animation-delay:' + Math.round(d * 0.12) + 'ms}',
        '#pm{animation:o-ct-pm ' + d + 'ms cubic-bezier(.4,0,.2,1) infinite}',
        '@keyframes o-ct-s{0%,10%{transform:scaleY(1)}45%{transform:scaleY(0)}90%,100%{transform:scaleY(1)}}',
        '@keyframes o-ct-pm{0%,12%{opacity:1}45%{opacity:.78}88%,100%{opacity:1}}'
      ].join('\n');
    }
  };

  /* Reduced motion: every loader collapses to a still mark with one slow breath
     on the strings, so it still reads as "working" without any travel. */
  function reducedCSS() {
    return [
      '@media (prefers-reduced-motion:reduce){',
      '  #bars,#str-l,#str-r,#pm,#bar-main,#bar-counter{animation:none!important;transform:none!important;',
      '    stroke-dasharray:none!important;stroke-dashoffset:0!important;opacity:1!important}',
      '  #str-l,#str-r{animation:o-breathe 2400ms ease-in-out infinite!important}',
      '}',
      '@keyframes o-breathe{0%,100%{opacity:.78}50%{opacity:1}}'
    ].join('\n');
  }

  /* --------------------------------------------------------------------------
     6. SVG COMPOSITION
     -------------------------------------------------------------------------- */
  function n(v) {  // trim float noise so the emitted files stay readable
    return (Math.round(v * 1000) / 1000).toString();
  }

  /* Resolve the four rig coordinates for a tier. `full` returns the authored
     centerlines verbatim; the redraw tiers derive a narrower, symmetric cross
     on the same 22.99deg slope so the mark keeps its angle identity. */
  var SL = GEO.STR_L, SR = GEO.STR_R;

  function rigCoords(T) {
    if (!T.redraw) {
      return {
        main: GEO.MAIN, ctr: GEO.CTR,
        strings: [
          { k: 'l', cx: SL.cx, top: SL.y, h: SL.h },
          { k: 'r', cx: SR.cx, top: SR.y, h: SR.h }
        ],
        pivot: { x: GEO.PIVOT.x, y: GEO.PIVOT.y }
      };
    }
    var half = (GEO.MAIN.x2 - GEO.MAIN.x1) / 2 * T.spanX;
    var cx = GEO.VB / 2, cy = GEO.PIVOT.y + T.yShift;
    var dy = half * 0.4432;                        // preserve the authored 23.9044deg slope
    var x1 = cx - half, x2 = cx + half;
    var sTop = cy + dy * T.strAt;                  // where the strings meet the bar
    return {
      main: { x1: x1, y1: cy - dy, x2: x2, y2: cy + dy },
      ctr:  { x1: x1, y1: cy + dy, x2: x2, y2: cy - dy },
      strings: [
        { k: 'l', cx: cx - half * T.strAt, top: sTop, h: T.strBot - sTop },
        { k: 'r', cx: cx + half * T.strAt, top: sTop, h: T.strBot - sTop }
      ],
      pivot: { x: cx, y: cy }
    };
  }

  function rigMarkup(tier, ink, opts) {
    var T = TIERS[tier];
    var o = opts || {};
    var out = [];
    var R = rigCoords(T);
    var strokeAttrs = 'stroke="' + ink + '" stroke-width="' + n(T.barW) + '" stroke-linecap="round" fill="none"';

    // Draw counter first, main on top -- reproduces the authored over/under weave.
    out.push('    <g id="bars">');
    out.push('      <line id="bar-counter" x1="' + n(R.ctr.x1) + '" y1="' + n(R.ctr.y1) + '" x2="' + n(R.ctr.x2) + '" y2="' + n(R.ctr.y2) + '" ' + strokeAttrs + '/>');
    out.push('      <line id="bar-main" x1="' + n(R.main.x1) + '" y1="' + n(R.main.y1) + '" x2="' + n(R.main.x2) + '" y2="' + n(R.main.y2) + '" ' + strokeAttrs + '/>');
    out.push('    </g>');

    R.strings.forEach(function (S) {
      var w = T.strW;
      out.push('    <rect id="str-' + S.k + '" x="' + n(S.cx - w / 2) + '" y="' + n(S.top) + '" width="' + n(w) +
        '" height="' + n(S.h) + '" rx="' + n(w / 2) + '" ry="' + n(w / 2) + '" fill="' + ink + '"/>');
    });

    if (T.pm && !o.noPM) {
      out.push('    <g id="pm">');
      out.push('      <path d="' + PATH.P + '" fill="' + ink + '"/>');
      out.push('      <path d="' + PATH.M + '" fill="' + ink + '"/>');
      out.push('    </g>');
    }
    if (T.brackets && !o.noPM) {
      out.push('    <g id="brk">');
      out.push('      <path d="' + PATH.BRK_L + '" fill="' + ink + '"/>');
      out.push('      <path d="' + PATH.BRK_R + '" fill="' + ink + '"/>');
      out.push('    </g>');
    }
    return out.join('\n');
  }

  /* Glass gets a real frost gradient rather than a flat slab, so the tile still
     reads as the Glass family at app-icon size where it must be opaque. */
  function tileMarkup(t, tileColor, radius) {
    if (t.family === 'glass') {
      return [
        '    <defs>',
        '      <linearGradient id="oFrost" x1="0" y1="0" x2="0.35" y2="1">',
        '        <stop offset="0" stop-color="' + tileColor + '" stop-opacity="1"/>',
        '        <stop offset="0.55" stop-color="' + tileColor + '" stop-opacity="0.88"/>',
        '        <stop offset="1" stop-color="' + tileColor + '" stop-opacity="1"/>',
        '      </linearGradient>',
        '    </defs>',
        '    <rect id="tile" width="43.2" height="43.2" rx="' + radius + '" ry="' + radius + '" fill="' + tileColor + '"/>',
        '    <rect width="43.2" height="43.2" rx="' + radius + '" ry="' + radius + '" fill="url(#oFrost)"/>'
      ].join('\n');
    }
    return '    <rect id="tile" width="43.2" height="43.2" rx="' + radius + '" ry="' + radius + '" fill="' + tileColor + '"/>';
  }

  /* --------------------------------------------------------------------------
     buildSVG(opts) -> string

     opts = {
       theme:     slug                       (default friendly-dark)
       form:      'tile'|'mark'|'mono'|'lockup'
       tier:      'micro'|'small'|'full'     (default derived from size)
       polarity:  'flood'|'ground'           (tile only)
       motion:    motion id | null
       size:      px hint for width/height + tier derivation
       speed:     multiplier on motion duration (1 = authored)
     }
     -------------------------------------------------------------------------- */
  function buildSVG(opts) {
    var o = opts || {};
    var size = o.size || 256;
    var form = o.form || 'tile';
    var tier = o.tier || tierFor(size);
    var t = theme(o.theme || 'friendly-dark');
    var pol = o.polarity || 'ground';
    var pair = colorsFor(t.slug, pol);

    var ink, tile = null;
    if (form === 'mono') {
      // alpha-mask master: one colour, no tile. Slint tints this with `colorize`.
      ink = '#000000';
    } else if (form === 'mark') {
      ink = t.accent;
    } else {
      ink = pair.mark;
      tile = pair.tile;
    }

    var T = TIERS[tier];
    var body = rigMarkup(tier, ink, { noPM: form === 'mono' && tier !== 'full' });

    var head = [];
    head.push('<?xml version="1.0" encoding="UTF-8"?>');
    head.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.2 43.2" width="' + size + '" height="' + size + '"' +
      (form === 'mono' ? ' data-pm-mask="true"' : '') + '>');
    head.push('  <title>Puppet Master' + (form === 'mono' ? ' (mask)' : ' — ' + t.label) + '</title>');
    head.push('  <g id="mark">');
    if (tile) head.push(tileMarkup(t, tile, t.radius));

    // The rig is scaled about the canvas centre for the tighter tiers.
    var close = '';
    if (T.scale !== 1) {
      var c = GEO.VB / 2, s = T.scale;
      head.push('    <g id="rig" transform="translate(' + n(c - c * s) + ' ' + n(c - c * s) + ') scale(' + n(s) + ')">');
      close = '    </g>';
    } else {
      head.push('    <g id="rig">');
      close = '    </g>';
    }

    var tail = [];
    if (close) tail.push(close);
    tail.push('  </g>');

    var css = '';
    var m = o.motion ? motion(o.motion) : null;
    if (m) {
      var d = Math.round(m.dur / (o.speed || 1));
      css = '\n  <style>\n' + MOTION_CSS[m.id](d, rigCoords(T)) + '\n' + reducedCSS() + '\n  </style>';
    }

    return head.join('\n') + '\n' + body + '\n' + tail.join('\n') + css + '\n</svg>\n';
  }

  /* Lockup: mark + wordmark.
     NOTE: the wordmark is real <text>. resvg's text support requires font
     resolution, so for Slint/native use the PNG export (rasterised by the
     browser, which has the font) is the reliable artifact -- or convert the
     text to outlines with a font tool. This is documented in the README. */
  function buildLockup(opts) {
    var o = opts || {};
    var t = theme(o.theme || 'friendly-dark');
    var h = o.size || 64;
    var fonts = {
      friendly: "'Cal Sans','Nunito',system-ui,sans-serif",
      glass:    "'Inter',system-ui,sans-serif",
      basic:    "'Inter',system-ui,sans-serif",
      retro:    "'Orbitron','Rajdhani',sans-serif"
    };
    var markW = 43.2, gap = 10, textSize = 15.5;
    var totalW = markW + gap + 104;
    var inner = buildSVG({ theme: t.slug, form: 'mark', tier: 'full', size: markW, motion: null });
    // strip the xml decl + outer svg so it can nest
    inner = inner.replace(/^<\?xml[^>]*\?>\s*/, '').replace(/^<svg[^>]*>\s*/, '').replace(/<\/svg>\s*$/, '');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + totalW + ' 43.2" width="' + Math.round(h * totalW / 43.2) + '" height="' + h + '">',
      '  <title>Puppet Master — ' + t.label + '</title>',
      '  <g>',
      inner.replace(/^/gm, '  '),
      '  </g>',
      '  <text x="' + (markW + gap) + '" y="27.5" font-family="' + fonts[t.family] + '" font-size="' + textSize +
        '" font-weight="700" fill="' + t.text + '">Puppet Master</text>',
      '</svg>',
      ''
    ].join('\n');
  }

  /* --------------------------------------------------------------------------
     7. PART FILES for Slint composition
     --------------------------------------------------------------------------
     Slint animates by composing separately-loaded Images and driving their
     rotation-angle / x / y / opacity from animation-tick(). Each part is an
     alpha mask on the full 43.2 canvas so they stack in perfect register.
     -------------------------------------------------------------------------- */
  function buildPart(which, tier) {
    var T = TIERS[tier || 'full'];
    var R = rigCoords(T);
    var ink = '#000000';
    var inner;
    var sa = 'stroke="' + ink + '" stroke-width="' + n(T.barW) + '" stroke-linecap="round" fill="none"';
    if (which === 'bar-main') {
      inner = '  <line x1="' + n(R.main.x1) + '" y1="' + n(R.main.y1) + '" x2="' + n(R.main.x2) + '" y2="' + n(R.main.y2) + '" ' + sa + '/>';
    } else if (which === 'bar-counter') {
      inner = '  <line x1="' + n(R.ctr.x1) + '" y1="' + n(R.ctr.y1) + '" x2="' + n(R.ctr.x2) + '" y2="' + n(R.ctr.y2) + '" ' + sa + '/>';
    } else if (which === 'string-l' || which === 'string-r') {
      var S = R.strings[which === 'string-l' ? 0 : 1], w = T.strW;
      inner = '  <rect x="' + n(S.cx - w / 2) + '" y="' + n(S.top) + '" width="' + n(w) + '" height="' + n(S.h) +
        '" rx="' + n(w / 2) + '" ry="' + n(w / 2) + '" fill="' + ink + '"/>';
    } else if (which === 'pm') {
      inner = '  <path d="' + PATH.P + '" fill="' + ink + '"/>\n  <path d="' + PATH.M + '" fill="' + ink + '"/>';
    } else if (which === 'brackets') {
      inner = '  <path d="' + PATH.BRK_L + '" fill="' + ink + '"/>\n  <path d="' + PATH.BRK_R + '" fill="' + ink + '"/>';
    } else {
      throw new Error('unknown part: ' + which);
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.2 43.2" width="256" height="256">\n' +
      inner + '\n</svg>\n';
  }

  var PARTS = ['bar-main', 'bar-counter', 'string-l', 'string-r', 'pm', 'brackets'];

  root.PMCore = {
    GEO: GEO, PATH: PATH, TIERS: TIERS, THEMES: THEMES, MOTIONS: MOTIONS, PARTS: PARTS,
    theme: theme, motion: motion, tierFor: tierFor, rigCoords: rigCoords,
    luminance: luminance, contrast: contrast, colorsFor: colorsFor,
    buildSVG: buildSVG, buildLockup: buildLockup, buildPart: buildPart
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
