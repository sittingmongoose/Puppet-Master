/* =====================================================================
   PMO ART — authored scene system for onboarding + guided tour.

   Seven hero scenes, each drawn in four genuinely different illustration
   languages (friendly / glass / retro / basic) that respond to light+dark.
   A scene is a composition of semantic primitives; every family implements
   those primitives with its own geometry, stroke weight, fill logic and
   texture, so switching theme redraws the picture rather than recolouring it.

   Scenes:  marionette · workbench · origin · vault · route · constellation · curtain
   Exposed: window.PMO_ART.scene(name, opts) -> SVG string
   ===================================================================== */
(function () {
  'use strict';
  if (window.PMO_ART) return;

  var VB = { w: 640, h: 360 };
  var uid = 0;
  function nid(p) { uid += 1; return 'pmo-' + p + '-' + uid; }
  function esc(n) { return Math.round(n * 100) / 100; }

  /* ---------- small geometry helpers ---------- */

  // Deterministic pseudo-random so a scene renders identically every time.
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  // A gently irregular rounded rect — the hand-drawn wobble for Friendly.
  function wobbleRect(x, y, w, h, r, amp, seed) {
    var rand = rng(seed || 7), j = function () { return (rand() - 0.5) * 2 * amp; };
    var x0 = x, y0 = y, x1 = x + w, y1 = y + h;
    return 'M' + esc(x0 + r) + ' ' + esc(y0 + j()) +
      'L' + esc(x1 - r + j()) + ' ' + esc(y0 + j()) +
      'Q' + esc(x1 + j()) + ' ' + esc(y0) + ' ' + esc(x1 + j()) + ' ' + esc(y0 + r) +
      'L' + esc(x1 + j()) + ' ' + esc(y1 - r + j()) +
      'Q' + esc(x1) + ' ' + esc(y1 + j()) + ' ' + esc(x1 - r) + ' ' + esc(y1 + j()) +
      'L' + esc(x0 + r + j()) + ' ' + esc(y1 + j()) +
      'Q' + esc(x0 + j()) + ' ' + esc(y1) + ' ' + esc(x0 + j()) + ' ' + esc(y1 - r) +
      'L' + esc(x0 + j()) + ' ' + esc(y0 + r + j()) +
      'Q' + esc(x0) + ' ' + esc(y0 + j()) + ' ' + esc(x0 + r) + ' ' + esc(y0 + j()) + 'Z';
  }

  // Quantise to the retro pixel grid so nothing lands off-lattice.
  function q(v, g) { g = g || 8; return Math.round(v / g) * g; }

  // Per-scene ambient placement: same language, different weather on each plate.
  function blobs(seed) {
    var r = rng(1000 + (seed || 0) * 37), out = [];
    var lanes = [[40, 300], [340, 620], [160, 480]];
    for (var i = 0; i < 3; i++) {
      out.push({
        /* The plate is portrait but the viewBox is 16:9, and SVG does not clip
           to the viewBox — so the ambient is drawn well beyond it to fill. */
        x: Math.round(lanes[i][0] + r() * (lanes[i][1] - lanes[i][0])),
        y: Math.round(-150 + r() * 660),
        rx: Math.round(160 + r() * 90),
        ry: Math.round(150 + r() * 90)
      });
    }
    return out;
  }

  function attrs(o) {
    var s = '';
    for (var k in o) if (o[k] !== null && o[k] !== undefined && o[k] !== '') s += ' ' + k + '="' + o[k] + '"';
    return s;
  }

  /* =====================================================================
     FAMILY RENDERERS
     Each exposes the same primitive vocabulary:
       field()        ambient backdrop
       panel()        a rectangular surface / device / card
       disc()         an orb, node or light source
       thread()       a string, route or connection
       figure()       the marionette body
       strata()       stacked layers (history)
       mark()         a small semantic glyph (check, plus, arrow, clock…)
       defs()         family-scoped <defs>
     ===================================================================== */

  var FAMILIES = {};

  /* ------------------------------------------------------------------
     FRIENDLY — layered paper cut-outs. Soft organic shapes with a hand
     wobble, warm grain, generous rounding, no hard outlines. Light comes
     from the upper left and objects cast a soft coloured shadow.
     ------------------------------------------------------------------ */
  FAMILIES.friendly = {
    defs: function (id) {
      return '' +
        '<filter id="' + id + '-grain" x="-10%" y="-10%" width="120%" height="120%">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n"/>' +
          '<feColorMatrix in="n" type="saturate" values="0"/>' +
          '<feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer>' +
          '<feComposite operator="in" in2="SourceGraphic"/>' +
        '</filter>' +
        '<filter id="' + id + '-soft" x="-40%" y="-40%" width="180%" height="180%">' +
          '<feGaussianBlur stdDeviation="12"/>' +
        '</filter>' +
        '<filter id="' + id + '-lift" x="-30%" y="-30%" width="160%" height="180%">' +
          '<feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="var(--pmo-art-shadow)" flood-opacity="0.5"/>' +
        '</filter>';
    },
    field: function (id, seed) {
      var b = blobs(seed);
      return '<g class="pmo-art-field" filter="url(#' + id + '-soft)">' +
        '<ellipse class="pmo-drift pmo-drift-a" cx="' + b[0].x + '" cy="' + b[0].y + '" rx="' + b[0].rx + '" ry="' + b[0].ry + '" fill="var(--pmo-art-wash-1)"/>' +
        '<ellipse class="pmo-drift pmo-drift-b" cx="' + b[1].x + '" cy="' + b[1].y + '" rx="' + b[1].rx + '" ry="' + b[1].ry + '" fill="var(--pmo-art-wash-2)"/>' +
        '<ellipse class="pmo-drift pmo-drift-c" cx="' + b[2].x + '" cy="' + b[2].y + '" rx="' + b[2].rx + '" ry="' + b[2].ry + '" fill="var(--pmo-art-wash-3)"/>' +
      '</g>';
    },
    panel: function (id, o) {
      var r = o.r === undefined ? 22 : o.r;
      var seed = o.seed || 11;
      var fill = o.tone === 'accent' ? 'var(--pmo-art-ink-accent)'
               : o.tone === 'deep'   ? 'var(--pmo-art-solid-deep)'
               : 'var(--pmo-art-solid)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
        '<path d="' + wobbleRect(o.x, o.y, o.w, o.h, r, 1.6, seed) + '" fill="' + fill + '" filter="url(#' + id + '-lift)"/>' +
        '<path d="' + wobbleRect(o.x + 8, o.y + 8, o.w - 16, Math.max(6, o.h * 0.34), r * 0.6, 1.2, seed + 3) + '" fill="var(--pmo-art-hilite)" opacity="0.5"/>' +
        (o.label ? '<path d="' + wobbleRect(o.x + 16, o.y + o.h - 26, Math.min(o.w - 32, 58), 8, 4, 0.8, seed + 5) + '" fill="var(--pmo-art-ink-soft)" opacity="0.55"/>' : '') +
      '</g>';
    },
    disc: function (id, o) {
      var col = o.tone === 'accent' ? 'var(--pmo-art-ink-accent)' : o.tone === 'warm' ? 'var(--pmo-art-ink-warm)' : 'var(--pmo-art-solid)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (o.r * 1.9) + '" fill="' + col + '" opacity="0.18" filter="url(#' + id + '-soft)"/>' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + o.r + '" fill="' + col + '" filter="url(#' + id + '-lift)"/>' +
        '<ellipse cx="' + (o.cx - o.r * 0.3) + '" cy="' + (o.cy - o.r * 0.36) + '" rx="' + (o.r * 0.42) + '" ry="' + (o.r * 0.3) + '" fill="var(--pmo-art-hilite)" opacity="0.65"/>' +
      '</g>';
    },
    thread: function (id, o) {
      return '<path class="' + (o.cls || '') + '" d="' + o.d + '" fill="none" stroke="var(--pmo-art-line)" stroke-width="' + (o.w || 3) + '" stroke-linecap="round" opacity="' + (o.op || 0.75) + '"' + (o.style ? ' style="' + o.style + '"' : '') + '/>';
    },
    figure: function (id, o) {
      var x = o.x, y = o.y, s = o.s || 1;
      return '<g class="pmo-figure-anchor ' + (o.cls || '') + '" transform="translate(' + x + ',' + y + ') scale(' + s + ')"><g class="pmo-figure">' +
        '<g filter="url(#' + id + '-lift)">' +
        '<path d="' + wobbleRect(-25, 4, 50, 60, 23, 1.4, 21) + '" fill="var(--pmo-art-ink-accent)"/>' +
        '<path d="M-30 20 Q-50 38 -45 64" fill="none" stroke="var(--pmo-art-ink-accent)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M30 20 Q50 38 45 64"  fill="none" stroke="var(--pmo-art-ink-accent)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M-12 62 L-14 96" stroke="var(--pmo-art-ink-accent)" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M12 62 L14 96"  stroke="var(--pmo-art-ink-accent)" stroke-width="12" stroke-linecap="round"/>' +
        '<g transform="rotate(-5)">' +
          '<circle cx="0" cy="-18" r="22" fill="var(--pmo-art-ink-warm)"/>' +
          '<ellipse cx="-5" cy="-25" rx="8" ry="6" fill="var(--pmo-art-hilite)" opacity="0.75"/>' +
          '<circle cx="-7" cy="-19" r="2.6" fill="var(--pmo-art-shadow)" opacity="0.85"/>' +
          '<circle cx="7"  cy="-19" r="2.6" fill="var(--pmo-art-shadow)" opacity="0.85"/>' +
          '<path d="M-6 -11 Q0 -7 6 -11" fill="none" stroke="var(--pmo-art-shadow)" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>' +
        '</g>' +
        '</g>' +
      '</g></g>';
    },
    strata: function (id, o) {
      var out = '', n = o.n || 4;
      for (var i = 0; i < n; i++) {
        var yy = o.y + o.h - (i + 1) * (o.h / n);
        var d = wobbleRect(o.x + i * 3, yy, o.w - i * 6, o.h / n - 3, 8, 1, 30 + i);
        out += '<path class="pmo-stratum" style="--i:' + i + '" d="' + d + '" fill="var(--pmo-art-solid)"/>' +
               '<path d="' + d + '" fill="var(--pmo-art-hilite)" opacity="' + (0.06 + i * 0.13) + '"/>' +
               '<path d="' + d + '" fill="none" stroke="var(--pmo-art-line)" stroke-width="1.2" opacity="0.28"/>';
      }
      return '<g class="' + (o.cls || '') + '">' + out + '</g>';
    },
    mark: function (id, o) {
      var c = o.on === 'accent' ? 'var(--pmo-art-on-accent)' : 'var(--pmo-art-ink-accent)';
      if (o.kind === 'check') return '<path class="pmo-mark ' + (o.cls || '') + '" d="M' + (o.x - 11) + ' ' + o.y + ' l8 9 l16 -19" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
      if (o.kind === 'plus')  return '<g class="pmo-mark ' + (o.cls || '') + '" stroke="' + c + '" stroke-width="6" stroke-linecap="round"><path d="M' + (o.x - 11) + ' ' + o.y + ' h22"/><path d="M' + o.x + ' ' + (o.y - 11) + ' v22"/></g>';
      if (o.kind === 'clock') return '<g class="pmo-mark ' + (o.cls || '') + '"><circle cx="' + o.x + '" cy="' + o.y + '" r="15" fill="none" stroke="' + c + '" stroke-width="5"/><path d="M' + o.x + ' ' + (o.y - 8) + ' V' + o.y + ' l8 5" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>';
      return '';
    }
  };

  /* ------------------------------------------------------------------
     GLASS — luminous stacked panes. Everything is translucent, edges
     catch a specular rim, light blooms through from behind, and depth
     reads through blur rather than shadow.
     ------------------------------------------------------------------ */
  FAMILIES.glass = {
    defs: function (id) {
      return '' +
        '<linearGradient id="' + id + '-pane" x1="0" y1="0" x2="0.7" y2="1">' +
          '<stop offset="0" stop-color="var(--pmo-art-hilite)" stop-opacity="0.62"/>' +
          '<stop offset="0.46" stop-color="var(--pmo-art-ink-accent)" stop-opacity="var(--pmo-art-pane-mid, 0.10)"/>' +
          '<stop offset="1" stop-color="var(--pmo-art-ink-accent)" stop-opacity="var(--pmo-art-pane-end, 0.24)"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + id + '-rim" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="var(--pmo-art-hilite)" stop-opacity="0.95"/>' +
          '<stop offset="0.45" stop-color="var(--pmo-art-hilite)" stop-opacity="0.18"/>' +
          '<stop offset="1" stop-color="var(--pmo-art-ink-accent)" stop-opacity="0.75"/>' +
        '</linearGradient>' +
        '<radialGradient id="' + id + '-bloom"><stop offset="0" stop-color="var(--pmo-art-ink-accent)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--pmo-art-ink-accent)" stop-opacity="0"/></radialGradient>' +
        '<filter id="' + id + '-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>' +
        '<filter id="' + id + '-glow" x="-60%" y="-60%" width="220%" height="220%">' +
          '<feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>';
    },
    field: function (id, seed) {
      var b = blobs(seed);
      return '<g class="pmo-art-field">' +
        '<circle class="pmo-drift pmo-drift-a" cx="' + b[0].x + '" cy="' + b[0].y + '" r="' + b[0].rx + '" fill="url(#' + id + '-bloom)" opacity="0.5"/>' +
        '<circle class="pmo-drift pmo-drift-b" cx="' + b[1].x + '" cy="' + b[1].y + '" r="' + b[1].rx + '" fill="var(--pmo-art-wash-2)" opacity="0.55" filter="url(#' + id + '-blur)"/>' +
        '<circle class="pmo-drift pmo-drift-c" cx="' + b[2].x + '" cy="' + b[2].y + '" r="' + b[2].rx + '" fill="var(--pmo-art-wash-3)" opacity="0.5" filter="url(#' + id + '-blur)"/>' +
        '<g opacity="0.35">' +
          '<path d="M-40 300 L200 -30" stroke="var(--pmo-art-hilite)" stroke-width="70" opacity="0.06"/>' +
          '<path d="M120 340 L360 10" stroke="var(--pmo-art-hilite)" stroke-width="40" opacity="0.05"/>' +
        '</g>' +
      '</g>';
    },
    panel: function (id, o) {
      var r = o.r === undefined ? 16 : o.r;
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
        '<rect x="' + (o.x + 4) + '" y="' + (o.y + 8) + '" width="' + o.w + '" height="' + o.h + '" rx="' + r + '" fill="var(--pmo-art-ink-accent)" opacity="0.16" filter="url(#' + id + '-blur)"/>' +
        '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '" rx="' + r + '" fill="url(#' + id + '-pane)"/>' +
        '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '" rx="' + r + '" fill="none" stroke="url(#' + id + '-rim)" stroke-width="1.4"/>' +
        '<path d="M' + (o.x + r) + ' ' + (o.y + 1) + ' H' + (o.x + o.w * 0.62) + '" stroke="var(--pmo-art-hilite)" stroke-width="1.6" opacity="0.8" stroke-linecap="round"/>' +
        (o.label ? '<rect x="' + (o.x + 14) + '" y="' + (o.y + o.h - 22) + '" width="' + Math.min(o.w - 28, 54) + '" height="6" rx="3" fill="var(--pmo-art-hilite)" opacity="0.4"/>' : '') +
      '</g>';
    },
    disc: function (id, o) {
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (o.r * 2.4) + '" fill="url(#' + id + '-bloom)" opacity="0.55"/>' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + o.r + '" fill="url(#' + id + '-pane)" stroke="url(#' + id + '-rim)" stroke-width="1.4" filter="url(#' + id + '-glow)"/>' +
        '<ellipse cx="' + (o.cx - o.r * 0.32) + '" cy="' + (o.cy - o.r * 0.38) + '" rx="' + (o.r * 0.38) + '" ry="' + (o.r * 0.24) + '" fill="var(--pmo-art-hilite)" opacity="0.85"/>' +
      '</g>';
    },
    thread: function (id, o) {
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + '>' +
        '<path d="' + o.d + '" fill="none" stroke="var(--pmo-art-ink-accent)" stroke-width="' + ((o.w || 2) + 5) + '" stroke-linecap="round" opacity="0.16" filter="url(#' + id + '-blur)"/>' +
        '<path d="' + o.d + '" fill="none" stroke="var(--pmo-art-hilite)" stroke-width="' + (o.w || 2) + '" stroke-linecap="round" opacity="' + (o.op || 0.85) + '"/>' +
      '</g>';
    },
    figure: function (id, o) {
      return '<g class="pmo-figure-anchor ' + (o.cls || '') + '" transform="translate(' + o.x + ',' + o.y + ') scale(' + (o.s || 1) + ')" filter="url(#' + id + '-glow)"><g class="pmo-figure">' +
        '<circle cx="0" cy="12" r="70" fill="url(#' + id + '-bloom)" opacity="0.35"/>' +
        '<rect x="-24" y="6" width="48" height="58" rx="22" fill="url(#' + id + '-pane)" stroke="url(#' + id + '-rim)" stroke-width="1.4"/>' +
        '<circle cx="0" cy="-16" r="20" fill="url(#' + id + '-pane)" stroke="url(#' + id + '-rim)" stroke-width="1.4"/>' +
        '<path d="M-28 22 Q-46 40 -42 62" fill="none" stroke="var(--pmo-art-hilite)" stroke-width="7" stroke-linecap="round" opacity="0.75"/>' +
        '<path d="M28 22 Q46 40 42 62"  fill="none" stroke="var(--pmo-art-hilite)" stroke-width="7" stroke-linecap="round" opacity="0.75"/>' +
        '<path d="M-12 62 L-14 96" stroke="var(--pmo-art-hilite)" stroke-width="8" stroke-linecap="round" opacity="0.7"/>' +
        '<path d="M12 62 L14 96"  stroke="var(--pmo-art-hilite)" stroke-width="8" stroke-linecap="round" opacity="0.7"/>' +
        '<ellipse cx="-5" cy="-23" rx="6" ry="4" fill="var(--pmo-art-hilite)" opacity="0.95"/>' +
      '</g></g>';
    },
    strata: function (id, o) {
      var out = '', n = o.n || 4;
      for (var i = 0; i < n; i++) {
        var yy = o.y + o.h - (i + 1) * (o.h / n);
        out += '<rect class="pmo-stratum" style="--i:' + i + '" x="' + (o.x + i * 4) + '" y="' + yy + '" width="' + (o.w - i * 8) + '" height="' + (o.h / n - 4) + '" rx="6" fill="url(#' + id + '-pane)" stroke="url(#' + id + '-rim)" stroke-width="1" opacity="' + (0.4 + i * 0.15) + '"/>';
      }
      return '<g class="' + (o.cls || '') + '">' + out + '</g>';
    },
    mark: function (id, o) {
      var c = o.on === 'accent' ? 'var(--pmo-art-on-accent)' : 'var(--pmo-art-hilite)', g = ' filter="url(#' + id + '-glow)"';
      if (o.kind === 'check') return '<path class="pmo-mark ' + (o.cls || '') + '" d="M' + (o.x - 11) + ' ' + o.y + ' l8 9 l16 -19" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"' + g + '/>';
      if (o.kind === 'plus')  return '<g class="pmo-mark ' + (o.cls || '') + '" stroke="' + c + '" stroke-width="4" stroke-linecap="round"' + g + '><path d="M' + (o.x - 11) + ' ' + o.y + ' h22"/><path d="M' + o.x + ' ' + (o.y - 11) + ' v22"/></g>';
      if (o.kind === 'clock') return '<g class="pmo-mark ' + (o.cls || '') + '"' + g + '><circle cx="' + o.x + '" cy="' + o.y + '" r="15" fill="none" stroke="' + c + '" stroke-width="3"/><path d="M' + o.x + ' ' + (o.y - 8) + ' V' + o.y + ' l8 5" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>';
      return '';
    }
  };

  /* ------------------------------------------------------------------
     RETRO — pixel lattice. Every coordinate snaps to an 8px grid, fills
     are ordered-dither patterns rather than gradients, edges are hard
     2px outlines, and a scanline veil sits over the whole plate.
     ------------------------------------------------------------------ */
  FAMILIES.retro = {
    defs: function (id) {
      return '' +
        '<pattern id="' + id + '-dith" width="4" height="4" patternUnits="userSpaceOnUse">' +
          '<rect width="4" height="4" fill="var(--pmo-art-solid)"/>' +
          '<rect width="2" height="2" fill="var(--pmo-art-hilite)" opacity="0.55"/>' +
          '<rect x="2" y="2" width="2" height="2" fill="var(--pmo-art-hilite)" opacity="0.55"/>' +
        '</pattern>' +
        '<pattern id="' + id + '-dith2" width="4" height="4" patternUnits="userSpaceOnUse">' +
          '<rect width="4" height="4" fill="var(--pmo-art-ink-accent)"/>' +
          '<rect x="2" width="2" height="2" fill="var(--pmo-art-hilite)" opacity="0.4"/>' +
        '</pattern>' +
        '<pattern id="' + id + '-scan" width="4" height="4" patternUnits="userSpaceOnUse">' +
          '<rect width="4" height="2" fill="var(--pmo-art-scan)" opacity="0.5"/>' +
        '</pattern>';
    },
    field: function (id, seed) {
      var out = '<g class="pmo-art-field">';
      out += '<rect x="0" y="0" width="640" height="360" fill="var(--pmo-art-wash-1)"/>';
      // stepped horizon bands
      for (var i = 0; i < 7; i++) {
        out += '<rect class="pmo-drift pmo-band" style="--i:' + i + '" x="0" y="' + (232 + i * 16) + '" width="640" height="' + (16 - i) + '" fill="var(--pmo-art-wash-2)" opacity="' + (0.5 - i * 0.06) + '"/>';
      }
      // star lattice
      var rand = rng(99 + (seed || 0) * 17);
      for (var s = 0; s < 26; s++) {
        var sx = q(rand() * 640), sy = q(rand() * 200);
        out += '<rect class="pmo-twinkle" style="--i:' + (s % 6) + '" x="' + sx + '" y="' + sy + '" width="4" height="4" fill="var(--pmo-art-hilite)" opacity="0.5"/>';
      }
      return out + '</g>';
    },
    panel: function (id, o) {
      var x = q(o.x), y = q(o.y), w = q(o.w), h = q(o.h);
      var fill = o.tone === 'accent' ? 'url(#' + id + '-dith2)' : 'url(#' + id + '-dith)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + ' shape-rendering="crispEdges">' +
        '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + w + '" height="' + h + '" fill="var(--pmo-art-shadow)" opacity="0.55"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="var(--pmo-art-line)" stroke-width="3"/>' +
        '<rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="' + (w - 8) + '" height="4" fill="var(--pmo-art-hilite)" opacity="0.7"/>' +
        (o.label ? '<rect x="' + (x + 12) + '" y="' + (y + h - 20) + '" width="' + Math.min(w - 24, 56) + '" height="8" fill="var(--pmo-art-line)" opacity="0.75"/>' : '') +
      '</g>';
    },
    disc: function (id, o) {
      // Circles are built from quantised rows so they read as pixel art.
      var cx = q(o.cx), cy = q(o.cy), r = q(o.r), out = '', g = 4;
      for (var yy = -r; yy < r; yy += g) {
        var half = Math.sqrt(Math.max(0, r * r - yy * yy));
        var hw = q(half);
        if (hw <= 0) continue;
        out += '<rect x="' + (cx - hw) + '" y="' + (cy + yy) + '" width="' + (hw * 2) + '" height="' + g + '"/>';
      }
      var col = o.tone === 'accent' ? 'var(--pmo-art-ink-accent)' : 'var(--pmo-art-ink-warm)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + ' shape-rendering="crispEdges">' +
        '<g fill="' + col + '">' + out + '</g>' +
        '<rect x="' + (cx - r + 4) + '" y="' + (cy - r + 8) + '" width="8" height="8" fill="var(--pmo-art-hilite)" opacity="0.9"/>' +
      '</g>';
    },
    thread: function (id, o) {
      return '<path class="' + (o.cls || '') + '" d="' + o.d + '" fill="none" stroke="var(--pmo-art-line)" stroke-width="' + (o.w || 4) + '" stroke-linecap="butt" stroke-dasharray="8 6" opacity="' + (o.op || 0.9) + '" shape-rendering="crispEdges"' + (o.style ? ' style="' + o.style + '"' : '') + '/>';
    },
    figure: function (id, o) {
      var P = function (x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; };
      var A = 'var(--pmo-art-ink-accent)', W = 'var(--pmo-art-ink-warm)', L = 'var(--pmo-art-line)';
      return '<g class="pmo-figure-anchor ' + (o.cls || '') + '" transform="translate(' + q(o.x) + ',' + q(o.y) + ') scale(' + (o.s || 1) + ')" shape-rendering="crispEdges"><g class="pmo-figure">' +
        P(-24, -36, 48, 40, W) + P(-16, -24, 8, 8, L) + P(8, -24, 8, 8, L) + P(-8, -8, 16, 4, L) +
        P(-28, 8, 56, 56, A) + P(-20, 16, 40, 8, 'var(--pmo-art-hilite)') +
        P(-44, 16, 16, 40, A) + P(28, 16, 16, 40, A) +
        P(-24, 64, 16, 36, A) + P(8, 64, 16, 36, A) +
        P(-28, 100, 20, 8, L) + P(8, 100, 20, 8, L) +
      '</g></g>';
    },
    strata: function (id, o) {
      var out = '', n = o.n || 4, x = q(o.x), y = q(o.y), w = q(o.w), h = q(o.h), step = q(h / n);
      for (var i = 0; i < n; i++) {
        out += '<g class="pmo-stratum" style="--i:' + i + '">' +
          '<rect x="' + (x + i * 8) + '" y="' + (y + h - (i + 1) * step) + '" width="' + (w - i * 16) + '" height="' + (step - 4) + '" fill="' + (i % 2 ? 'url(#' + id + '-dith)' : 'var(--pmo-art-solid)') + '" stroke="var(--pmo-art-line)" stroke-width="2"/>' +
        '</g>';
      }
      return '<g class="' + (o.cls || '') + '" shape-rendering="crispEdges">' + out + '</g>';
    },
    mark: function (id, o) {
      var c = o.on === 'accent' ? 'var(--pmo-art-on-accent)' : 'var(--pmo-art-ink-accent)', x = q(o.x), y = q(o.y);
      var P = function (dx, dy) { return '<rect x="' + (x + dx) + '" y="' + (y + dy) + '" width="6" height="6" fill="' + c + '"/>'; };
      if (o.kind === 'check') return '<g class="pmo-mark ' + (o.cls || '') + '" shape-rendering="crispEdges">' + P(-12, 0) + P(-6, 6) + P(0, 12) + P(6, 0) + P(12, -6) + P(18, -12) + '</g>';
      if (o.kind === 'plus')  return '<g class="pmo-mark ' + (o.cls || '') + '" shape-rendering="crispEdges">' + P(-12, -3) + P(-6, -3) + P(0, -3) + P(6, -3) + P(0, -15) + P(0, -9) + P(0, 3) + P(0, 9) + '</g>';
      if (o.kind === 'clock') return '<g class="pmo-mark ' + (o.cls || '') + '" shape-rendering="crispEdges"><rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" fill="none" stroke="' + c + '" stroke-width="3"/>' + P(-3, -12) + P(-3, -6) + P(-3, 0) + P(3, 0) + '</g>';
      return '';
    },
    overlay: function (id) { return '<rect x="0" y="0" width="640" height="360" fill="url(#' + id + '-scan)" opacity="0.5" style="mix-blend-mode:overlay"/>'; }
  };

  /* ------------------------------------------------------------------
     BASIC — technical drawing. Monoline strokes only, no fills, dashed
     construction geometry, corner registration ticks and a faint plotting
     grid. Reads as a precise schematic rather than an illustration.
     ------------------------------------------------------------------ */
  FAMILIES.basic = {
    defs: function (id) {
      return '<pattern id="' + id + '-grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
        '<path d="M20 0 H0 V20" fill="none" stroke="var(--pmo-art-line)" stroke-width="0.6" opacity="0.28"/>' +
      '</pattern>';
    },
    field: function (id, seed) {
      return '<g class="pmo-art-field">' +
        '<rect x="0" y="0" width="640" height="360" fill="url(#' + id + '-grid)"/>' +
        '<path class="pmo-drift pmo-drift-a" d="M0 300 H640" stroke="var(--pmo-art-line)" stroke-width="1" opacity="0.5"/>' +
        '<path class="pmo-drift pmo-drift-b" d="M320 0 V360" stroke="var(--pmo-art-line)" stroke-width="0.8" stroke-dasharray="6 8" opacity="0.35"/>' +
      '</g>';
    },
    panel: function (id, o) {
      var t = 6; // registration tick length
      var c = o.tone === 'accent' ? 'var(--pmo-art-ink-accent)' : 'var(--pmo-art-line)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + ' fill="none" stroke="' + c + '" stroke-width="1.5">' +
        '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="' + o.h + '" rx="' + (o.r === undefined ? 3 : o.r) + '"/>' +
        '<path d="M' + o.x + ' ' + (o.y + 14) + ' H' + (o.x + o.w) + '" opacity="0.55"/>' +
        '<path d="M' + (o.x - t) + ' ' + o.y + ' h' + t + ' M' + o.x + ' ' + (o.y - t) + ' v' + t + '" stroke-width="2"/>' +
        '<path d="M' + (o.x + o.w + t) + ' ' + (o.y + o.h) + ' h-' + t + ' M' + (o.x + o.w) + ' ' + (o.y + o.h + t) + ' v-' + t + '" stroke-width="2"/>' +
        (o.label ? '<path d="M' + (o.x + 12) + ' ' + (o.y + o.h - 14) + ' h' + Math.min(o.w - 24, 48) + '" opacity="0.8" stroke-width="3"/>' : '') +
      '</g>';
    },
    disc: function (id, o) {
      var c = o.tone === 'accent' ? 'var(--pmo-art-ink-accent)' : 'var(--pmo-art-line)';
      return '<g class="' + (o.cls || '') + '"' + (o.style ? ' style="' + o.style + '"' : '') + ' fill="none" stroke="' + c + '" stroke-width="1.5">' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + o.r + '"/>' +
        '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (o.r * 0.55) + '" stroke-dasharray="3 5" opacity="0.7"/>' +
        '<path d="M' + (o.cx - o.r - 8) + ' ' + o.cy + ' h' + (o.r * 2 + 16) + ' M' + o.cx + ' ' + (o.cy - o.r - 8) + ' v' + (o.r * 2 + 16) + '" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.6"/>' +
      '</g>';
    },
    thread: function (id, o) {
      return '<path class="' + (o.cls || '') + '" d="' + o.d + '" fill="none" stroke="var(--pmo-art-ink-accent)" stroke-width="' + (o.w || 1.5) + '" stroke-linecap="round" opacity="' + (o.op || 0.85) + '"' + (o.style ? ' style="' + o.style + '"' : '') + '/>';
    },
    figure: function (id, o) {
      return '<g class="pmo-figure-anchor ' + (o.cls || '') + '" transform="translate(' + o.x + ',' + o.y + ') scale(' + (o.s || 1) + ')" fill="none" stroke="var(--pmo-art-line)" stroke-width="1.8" stroke-linecap="round"><g class="pmo-figure">' +
        '<circle cx="0" cy="-16" r="20"/>' +
        '<rect x="-24" y="6" width="48" height="58" rx="6"/>' +
        '<path d="M-28 22 Q-46 40 -42 62"/><path d="M28 22 Q46 40 42 62"/>' +
        '<path d="M-12 64 V98"/><path d="M12 64 V98"/>' +
        '<path d="M-22 98 h20 M2 98 h20" stroke-width="2.4"/>' +
        '<circle cx="0" cy="-16" r="27" stroke-dasharray="3 6" opacity="0.45" stroke-width="1"/>' +
      '</g></g>';
    },
    strata: function (id, o) {
      var out = '', n = o.n || 4;
      for (var i = 0; i < n; i++) {
        var yy = o.y + o.h - (i + 1) * (o.h / n);
        out += '<rect class="pmo-stratum" style="--i:' + i + '" x="' + (o.x + i * 5) + '" y="' + yy + '" width="' + (o.w - i * 10) + '" height="' + (o.h / n - 4) + '" rx="2" fill="none" stroke="var(--pmo-art-line)" stroke-width="1.4" stroke-dasharray="' + (i === n - 1 ? 'none' : '5 4') + '" opacity="' + (0.45 + i * 0.15) + '"/>';
      }
      return '<g class="' + (o.cls || '') + '">' + out + '</g>';
    },
    mark: function (id, o) {
      var c = o.on === 'accent' ? 'var(--pmo-art-on-accent)' : 'var(--pmo-art-ink-accent)';
      if (o.kind === 'check') return '<path class="pmo-mark ' + (o.cls || '') + '" d="M' + (o.x - 11) + ' ' + o.y + ' l8 9 l16 -19" fill="none" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
      if (o.kind === 'plus')  return '<g class="pmo-mark ' + (o.cls || '') + '" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"><path d="M' + (o.x - 11) + ' ' + o.y + ' h22"/><path d="M' + o.x + ' ' + (o.y - 11) + ' v22"/></g>';
      if (o.kind === 'clock') return '<g class="pmo-mark ' + (o.cls || '') + '" fill="none" stroke="' + c + '" stroke-width="1.8"><circle cx="' + o.x + '" cy="' + o.y + '" r="15"/><path d="M' + o.x + ' ' + (o.y - 8) + ' V' + o.y + ' l8 5" stroke-linecap="round" stroke-linejoin="round"/></g>';
      return '';
    }
  };

  /* =====================================================================
     SCENES — semantic compositions, family-agnostic.
     Each returns the inner SVG for the plate.
     ===================================================================== */

  var SCENES = {

    /* The product's own metaphor: intent above, work below, threads between. */
    marionette: function (F, id) {
      var s = F.field(id, 1);
      s += F.panel(id, { x: 216, y: 52, w: 208, h: 20, r: 10, tone: 'accent', cls: 'pmo-a-bar' });
      s += F.thread(id, { d: 'M262 72 Q274 132 290 176', w: 2.4, op: 0.95, cls: 'pmo-a-thread pmo-thread-1', style: '--i:0' });
      s += F.thread(id, { d: 'M320 72 Q320 122 320 158', w: 2.4, op: 0.95, cls: 'pmo-a-thread pmo-thread-2', style: '--i:1' });
      s += F.thread(id, { d: 'M378 72 Q366 132 350 176', w: 2.4, op: 0.95, cls: 'pmo-a-thread pmo-thread-3', style: '--i:2' });
      s += F.figure(id, { x: 320, y: 196, s: 1, cls: 'pmo-a-figure' });
      s += F.panel(id, { x: 246, y: 300, w: 148, h: 18, r: 9, cls: 'pmo-a-plinth' });
      s += F.disc(id, { cx: 132, cy: 244, r: 15, tone: 'accent', cls: 'pmo-a-sat pmo-sat-1', style: '--i:0' });
      s += F.disc(id, { cx: 514, cy: 222, r: 11, tone: 'warm', cls: 'pmo-a-sat pmo-sat-2', style: '--i:1' });
      return s;
    },

    /* Where the work happens: a primary machine, two dimmer satellites. */
    workbench: function (F, id) {
      var s = F.field(id, 2);
      s += F.thread(id, { d: 'M170 206 H256', w: 3, op: 0.5, cls: 'pmo-a-link pmo-link-1', style: '--i:0' });
      s += F.thread(id, { d: 'M416 206 H498', w: 3, op: 0.5, cls: 'pmo-a-link pmo-link-2', style: '--i:1' });
      s += F.panel(id, { x: 80, y: 174, w: 90, h: 66, r: 12, label: 1, cls: 'pmo-a-side pmo-side-1' });
      s += F.panel(id, { x: 498, y: 174, w: 90, h: 66, r: 12, label: 1, cls: 'pmo-a-side pmo-side-2' });
      s += F.panel(id, { x: 256, y: 132, w: 160, h: 112, r: 16, tone: 'accent', label: 1, cls: 'pmo-a-main' });
      s += F.disc(id, { cx: 336, cy: 178, r: 22, tone: 'accent', cls: 'pmo-a-core' });
      s += F.panel(id, { x: 246, y: 268, w: 180, h: 16, r: 8, cls: 'pmo-a-desk' });
      return s;
    },

    /* Three ways a project begins, as three equally weighted choices. Each sits
       in its own frame at the same scale so none dominates the others. */
    origin: function (F, id) {
      var s = F.field(id, 3);
      var cols = [132, 320, 508], fw = 150, fh = 172, fy = 96;
      for (var i = 0; i < 3; i++) {
        s += F.panel(id, { x: cols[i] - fw / 2, y: fy, w: fw, h: fh, r: 14,
                           tone: i === 0 ? 'accent' : null,
                           cls: 'pmo-a-choice pmo-o-' + (i + 1), style: '--i:' + i, seed: 40 + i * 7 });
      }
      /* new — a shoot with one leaf, so it reads as growth rather than a pin */
      s += F.thread(id, { d: 'M132 236 V200', w: 5, op: 0.9, cls: 'pmo-a-stem', style: '--i:0' });
      s += F.thread(id, { d: 'M132 216 Q152 210 156 194', w: 4, op: 0.75, cls: 'pmo-a-leaf', style: '--i:0' });
      s += F.disc(id, { cx: 132, cy: 172, r: 24, tone: 'accent', cls: 'pmo-a-bud', style: '--i:0' });
      s += F.mark(id, { kind: 'plus', x: 132, y: 172, on: 'accent', cls: 'pmo-o-mark pmo-o-mark-1' });
      /* existing — material already stacked up */
      s += F.strata(id, { x: 262, y: 132, w: 116, h: 108, n: 4, cls: 'pmo-a-crate' });
      /* restore — a dial wound back */
      s += F.disc(id, { cx: 508, cy: 182, r: 36, cls: 'pmo-a-dial', style: '--i:2' });
      s += F.mark(id, { kind: 'clock', x: 508, y: 182, cls: 'pmo-o-mark pmo-o-mark-3' });
      return s;
    },

    /* The project and its safety net: layered history over a woven mesh. */
    vault: function (F, id) {
      var s = F.field(id, 4);
      /* the vessel, open at the top so the strata read as contents */
      s += F.panel(id, { x: 186, y: 56, w: 268, h: 26, r: 12, tone: 'accent', cls: 'pmo-a-lip' });
      s += F.strata(id, { x: 208, y: 96, w: 224, h: 122, n: 4, cls: 'pmo-a-history' });

      /* A net you can actually see: two crossing families of catenaries hung
         between fixed anchors, drawn heavy enough to read as rope. */
      var L = 168, R = 472, top = 240, span = R - L, sag = 74;
      var strand = function (t) {
        var x0 = L + span * t, x1 = R - span * t;
        var dip = top + sag * (1 - Math.abs(0.5 - t) * 1.1);
        return 'M' + x0 + ' ' + top + ' Q' + ((x0 + x1) / 2) + ' ' + dip + ' ' + x1 + ' ' + top;
      };
      for (var i = 0; i <= 4; i++) {
        s += F.thread(id, { d: strand(i / 8), w: 2.6, op: 0.78, cls: 'pmo-a-net pmo-net-v', style: '--i:' + i });
      }
      /* horizontal courses tie the strands together */
      for (var j = 1; j <= 4; j++) {
        var d = j / 5, y = top + sag * d * 0.86;
        var inset = span * 0.5 * d * 0.62;
        s += F.thread(id, { d: 'M' + (L + inset) + ' ' + y + ' Q320 ' + (y + 12) + ' ' + (R - inset) + ' ' + y,
                            w: 2, op: 0.6, cls: 'pmo-a-net pmo-net-h', style: '--i:' + (j + 4) });
      }
      s += F.thread(id, { d: 'M156 240 H484', w: 4, op: 0.9, cls: 'pmo-a-rail' });
      s += F.disc(id, { cx: 168, cy: 240, r: 8, tone: 'accent', cls: 'pmo-a-anchor' });
      s += F.disc(id, { cx: 472, cy: 240, r: 8, tone: 'accent', cls: 'pmo-a-anchor' });
      return s;
    },

    /* Review: a recap of the journey. The three nodes are the objects the user
       already met — the material from `origin`, the vessel from `vault`, the
       machine from `workbench` — so the summary restates the story it is
       summarising, and a pulse carries the work along the route. */
    route: function (F, id) {
      var s = F.field(id, 5);
      s += F.thread(id, { d: 'M182 212 C230 212 240 156 262 156', w: 3, op: 0.6, cls: 'pmo-a-route pmo-route-1', style: '--i:0' });
      s += F.thread(id, { d: 'M378 156 C400 156 410 212 458 212', w: 3, op: 0.6, cls: 'pmo-a-route pmo-route-2', style: '--i:1' });

      /* 1 — the work you already have */
      s += F.panel(id, { x: 62, y: 158, w: 120, h: 108, r: 13, cls: 'pmo-a-node pmo-node-1', style: '--i:0', seed: 61 });
      s += F.strata(id, { x: 78, y: 176, w: 88, h: 74, n: 3, cls: 'pmo-a-source' });

      /* 2 — the project being made */
      s += F.panel(id, { x: 262, y: 68, w: 116, h: 176, r: 15, tone: 'accent', cls: 'pmo-a-node pmo-node-2', style: '--i:1', seed: 62 });
      s += F.strata(id, { x: 278, y: 100, w: 84, h: 128, n: 4, cls: 'pmo-a-vessel' });

      /* 3 — the machine that runs it */
      s += F.panel(id, { x: 458, y: 158, w: 120, h: 108, r: 13, cls: 'pmo-a-node pmo-node-3', style: '--i:2', seed: 63 });
      s += F.disc(id, { cx: 518, cy: 212, r: 26, tone: 'accent', cls: 'pmo-a-core' });

      /* the pulse actually walks the route it describes */
      s += F.disc(id, { cx: 182, cy: 212, r: 9, tone: 'accent', cls: 'pmo-a-pulse' });
      return s;
    },

    /* Providers: accounts as satellites lighting a shared hub. */
    constellation: function (F, id) {
      var s = F.field(id, 6), pts = [[160, 112], [502, 128], [200, 274], [468, 266], [332, 66]];
      for (var i = 0; i < pts.length; i++) {
        s += F.thread(id, { d: 'M' + pts[i][0] + ' ' + pts[i][1] + ' L320 190', w: 1.6, op: 0.34, cls: 'pmo-a-spoke pmo-spoke-' + i, style: '--i:' + i });
      }
      for (var j = 0; j < pts.length; j++) {
        s += F.disc(id, { cx: pts[j][0], cy: pts[j][1], r: j === 4 ? 15 : 13, tone: j % 2 ? 'warm' : 'accent', cls: 'pmo-a-star pmo-star-' + j, style: '--i:' + j });
      }
      s += F.disc(id, { cx: 320, cy: 190, r: 36, tone: 'accent', cls: 'pmo-a-hub' });
      s += F.mark(id, { kind: 'check', x: 320, y: 192, on: 'accent', cls: 'pmo-a-hubmark' });
      return s;
    },

    /* Finish: the curtain has parted on a lit, waiting stage. */
    curtain: function (F, id) {
      var s = F.field(id, 7);
      /* stage first, then the drapes pulled clear to the wings */
      s += F.panel(id, { x: 166, y: 128, w: 308, h: 152, r: 14, cls: 'pmo-a-stage' });
      s += F.disc(id, { cx: 320, cy: 196, r: 34, tone: 'accent', cls: 'pmo-a-spot' });
      s += F.mark(id, { kind: 'check', x: 320, y: 198, on: 'accent', cls: 'pmo-a-done' });
      s += F.panel(id, { x: 250, y: 268, w: 140, h: 14, r: 7, cls: 'pmo-a-apron' });
      s += F.panel(id, { x: 40, y: 62, w: 104, h: 226, r: 10, tone: 'deep', cls: 'pmo-a-curtain pmo-curtain-l' });
      s += F.panel(id, { x: 496, y: 62, w: 104, h: 226, r: 10, tone: 'deep', cls: 'pmo-a-curtain pmo-curtain-r' });
      for (var p = 1; p <= 3; p++) {
        s += F.thread(id, { d: 'M' + (40 + p * 26) + ' 70 V282', w: 2, op: 0.28, cls: 'pmo-a-pleat' });
        s += F.thread(id, { d: 'M' + (496 + p * 26) + ' 70 V282', w: 2, op: 0.28, cls: 'pmo-a-pleat' });
      }
      s += F.thread(id, { d: 'M28 56 H612', w: 5, op: 0.75, cls: 'pmo-a-rod' });
      return s;
    }
  };

  /* =====================================================================
     PUBLIC API
     ===================================================================== */

  function familyOf(theme) {
    var t = theme || (document.documentElement.getAttribute('data-theme') || 'friendly-dark');
    var fam = String(t).split('-')[0];
    return FAMILIES[fam] ? fam : 'friendly';
  }

  function scene(name, opts) {
    opts = opts || {};
    var fam = opts.family || familyOf(opts.theme);
    var F = FAMILIES[fam];
    var build = SCENES[name] || SCENES.marionette;
    var id = nid(fam);
    var inner = build(F, id);
    var over = F.overlay ? F.overlay(id) : '';
    var z = opts.scale || 1.16;
    return '<svg class="pmo-art pmo-art--' + fam + ' pmo-art--' + name + '" viewBox="0 0 ' + VB.w + ' ' + VB.h + '" ' +
      'preserveAspectRatio="xMidYMid meet" role="presentation" aria-hidden="true" focusable="false">' +
      '<defs>' + F.defs(id) + '</defs>' +
      '<g transform="translate(' + (VB.w / 2) + ',' + (VB.h / 2) + ') scale(' + z + ') translate(' + (-VB.w / 2) + ',' + (-VB.h / 2) + ')">' +
      inner + '</g>' + over + '</svg>';
  }

  window.PMO_ART = {
    schema_id: 'pmo.art.scene_system.v1',
    scenes: Object.keys(SCENES),
    families: Object.keys(FAMILIES),
    familyOf: familyOf,
    scene: scene
  };
})();
