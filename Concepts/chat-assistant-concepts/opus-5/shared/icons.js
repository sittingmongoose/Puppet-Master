/* PMX icons — Opus 5
 * NOTE ON POLICY: this file contains no emoji and no pictographic/emoji
 * Unicode characters anywhere, in code, strings, or comments. Every glyph is
 * built exclusively from inline SVG shape primitives (path/line/circle/rect/
 * polyline) via document.createElementNS — never emoji, never an icon font,
 * never an external file, never a data-URI raster. An automated policy test
 * scans this file for emoji codepoints; keep it that way.
 *
 * Every icon shares stroke="currentColor" fill="none" stroke-width="1.5"
 * stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" as
 * presentation attributes on the root <svg>; children inherit fill/stroke
 * per normal SVG inheritance and only override them when a glyph genuinely
 * needs fill (the `dot` and `square` status markers) or a bigger dot stroke
 * (the round-linecap "same point twice" trick used for small dots, e.g. in
 * `info`, `alert`, `more`, `robot`).
 *
 * get() always returns a freshly created SVGElement — never a shared node —
 * so callers can insert the same icon in multiple places safely.
 *
 * Contract: CONTRACT.md section 8.1 ("no emoji anywhere"); SERVICES.md "PMXIcons".
 */
(function (global) {
  'use strict';

  var doc = global.document;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VIEWBOX = '0 0 24 24';
  var DEFAULT_SIZE = 16;

  /* name -> array of child shape specs: { tag, attrs }. Coordinates are on
   * the 24x24 grid described above. Kept intentionally simple (few points,
   * few nested curves) so glyphs stay legible at 14px across 8 themes x 4
   * stroke widths and do not turn to mud at small size. */
  var GLYPHS = {
    copy: [
      { tag: 'rect', attrs: { x: '8', y: '8', width: '12', height: '12', rx: '2' } },
      { tag: 'path', attrs: { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' } }
    ],
    edit: [
      { tag: 'path', attrs: { d: 'M12 20h9' } },
      { tag: 'path', attrs: { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' } }
    ],
    info: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
      { tag: 'line', attrs: { x1: '12', y1: '11', x2: '12', y2: '16' } },
      { tag: 'line', attrs: { x1: '12', y1: '7.5', x2: '12.01', y2: '7.5' } }
    ],
    send: [
      { tag: 'path', attrs: { d: 'M22 2 11 13' } },
      { tag: 'path', attrs: { d: 'M22 2 15 22l-4-9-9-4Z' } }
    ],
    stop: [
      { tag: 'rect', attrs: { x: '6', y: '6', width: '12', height: '12', rx: '2' } }
    ],
    search: [
      { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7' } },
      { tag: 'line', attrs: { x1: '21', y1: '21', x2: '16.65', y2: '16.65' } }
    ],
    /* Aperture-style focus reticle (four corner brackets + center point) so it
     * reads as "focus/selection" and never as a magnifier (search) or a
     * gauge (ring). */
    lens: [
      { tag: 'path', attrs: { d: 'M4 8V6a2 2 0 0 1 2-2h2' } },
      { tag: 'path', attrs: { d: 'M16 4h2a2 2 0 0 1 2 2v2' } },
      { tag: 'path', attrs: { d: 'M20 16v2a2 2 0 0 1-2 2h-2' } },
      { tag: 'path', attrs: { d: 'M8 20H6a2 2 0 0 1-2-2v-2' } },
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } }
    ],
    /* Circular gauge: track circle plus a shorter highlighted arc segment. */
    ring: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '8' } },
      { tag: 'path', attrs: { d: 'M12 4a8 8 0 0 1 6.93 12' } }
    ],

    /* ---------------------------------------------------------------- status set
     * Purpose-built for the thread-history rail rather than reused from the general
     * icons above, for two reasons.
     *
     * First, ambiguity: the `ring` gauge is a full circle PLUS a heavy arc, and once
     * that arc rotates it reads as a ball orbiting the inside of the circle rather
     * than as a spinner. Several rows caught at different phases look like dots
     * scattered into different corners. A dash-based arc on a true circle has no
     * such reading.
     *
     * Second, consistency: every glyph here is inscribed in the SAME r=7.5 circle,
     * so a column of mixed states shares one optical size and one baseline. Mixing
     * icons drawn to different internal margins is what makes a status column look
     * ragged even when every box is aligned to the pixel.
     */

    /* Indeterminate spinner. The track and the arc are the same circle, so the arc
     * cannot drift off the track no matter how it is animated; the arc is a quarter
     * of the 47.12 circumference. The core is dead centre by construction — it is a
     * child of the same coordinate system, not a separately positioned element. */
    'status-working': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '7.5', opacity: '.25' } },
      { tag: 'circle', attrs: {
        cx: '12', cy: '12', r: '7.5', class: 'pmx-arc-spin',
        'stroke-dasharray': '11.8 35.3', 'stroke-linecap': 'round'
      } },
      { tag: 'circle', attrs: {
        cx: '12', cy: '12', r: '2', fill: 'currentColor', stroke: 'none', class: 'pmx-core-pulse'
      } }
    ],

    /* Bar plus dot, the dot drawn with the round-cap "same point twice" trick used
     * elsewhere in this file so it stays perfectly round at 13px. */
    'status-attention': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '7.5' } },
      { tag: 'line', attrs: { x1: '12', y1: '8', x2: '12', y2: '12.6' } },
      { tag: 'line', attrs: { x1: '12', y1: '15.7', x2: '12.01', y2: '15.7', 'stroke-width': '2' } }
    ],

    /* A slash, not a filled stop sign: at 13px an octagon turns to mud. */
    'status-blocked': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '7.5' } },
      { tag: 'line', attrs: { x1: '7.2', y1: '16.8', x2: '16.8', y2: '7.2' } }
    ],

    'status-paused': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '7.5' } },
      { tag: 'line', attrs: { x1: '10', y1: '9.4', x2: '10', y2: '14.6' } },
      { tag: 'line', attrs: { x1: '14', y1: '9.4', x2: '14', y2: '14.6' } }
    ],

    /* The check is one polyline so it can be drawn with a single dash offset;
     * its two segments total ~10.7 units, which is why --pmx-dash is 11. */
    'status-finished': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '7.5' } },
      { tag: 'polyline', attrs: { points: '8.4,12.3 11,14.9 15.6,9.6', class: 'pmx-check-stroke' } }
    ],

    /* Deliberately smaller and unfilled: idle should recede next to five states
     * that all want attention. */
    'status-idle': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3.2' } }
    ],
    more: [
      { tag: 'line', attrs: { x1: '5', y1: '12', x2: '5.01', y2: '12', 'stroke-width': '2.5' } },
      { tag: 'line', attrs: { x1: '12', y1: '12', x2: '12.01', y2: '12', 'stroke-width': '2.5' } },
      { tag: 'line', attrs: { x1: '19', y1: '12', x2: '19.01', y2: '12', 'stroke-width': '2.5' } }
    ],
    'chevron-down': [
      { tag: 'path', attrs: { d: 'M6 9l6 6 6-6' } }
    ],
    'chevron-right': [
      { tag: 'path', attrs: { d: 'M9 6l6 6-6 6' } }
    ],
    'chevron-up': [
      { tag: 'path', attrs: { d: 'M6 15l6-6 6 6' } }
    ],
    'chevron-left': [
      { tag: 'path', attrs: { d: 'M15 6l-6 6 6 6' } }
    ],
    pin: [
      { tag: 'path', attrs: { d: 'M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12Z' } },
      { tag: 'circle', attrs: { cx: '12', cy: '10', r: '2.5' } }
    ],
    archive: [
      { tag: 'rect', attrs: { x: '3', y: '4', width: '18', height: '4', rx: '1' } },
      { tag: 'path', attrs: { d: 'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8' } },
      { tag: 'line', attrs: { x1: '10', y1: '13', x2: '14', y2: '13' } }
    ],
    trash: [
      { tag: 'path', attrs: { d: 'M4 7h16' } },
      { tag: 'path', attrs: { d: 'M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3' } },
      { tag: 'path', attrs: { d: 'M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13' } },
      { tag: 'line', attrs: { x1: '10', y1: '11', x2: '10', y2: '17' } },
      { tag: 'line', attrs: { x1: '14', y1: '11', x2: '14', y2: '17' } }
    ],
    export: [
      { tag: 'path', attrs: { d: 'M14 4h6v6' } },
      { tag: 'path', attrs: { d: 'M20 4 10 14' } },
      { tag: 'path', attrs: { d: 'M18 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5' } }
    ],
    branch: [
      { tag: 'line', attrs: { x1: '6', y1: '3', x2: '6', y2: '15' } },
      { tag: 'circle', attrs: { cx: '18', cy: '6', r: '3' } },
      { tag: 'circle', attrs: { cx: '6', cy: '18', r: '3' } },
      { tag: 'path', attrs: { d: 'M18 9a9 9 0 0 1-9 9' } }
    ],
    plus: [
      { tag: 'line', attrs: { x1: '12', y1: '5', x2: '12', y2: '19' } },
      { tag: 'line', attrs: { x1: '5', y1: '12', x2: '19', y2: '12' } }
    ],
    close: [
      { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } },
      { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } }
    ],
    check: [
      { tag: 'path', attrs: { d: 'M20 6 9 17l-5-5' } }
    ],
    /* Status marker — filled, per spec. */
    dot: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '4', fill: 'currentColor', stroke: 'none' } }
    ],
    play: [
      { tag: 'path', attrs: { d: 'M7 4v16l13-8Z' } }
    ],
    pause: [
      { tag: 'rect', attrs: { x: '8', y: '5', width: '3', height: '14', rx: '1' } },
      { tag: 'rect', attrs: { x: '13', y: '5', width: '3', height: '14', rx: '1' } }
    ],
    /* Status marker — filled, per spec. Smaller and unrounded vs. the
     * outline `stop` icon so the two stay visually distinct. */
    square: [
      { tag: 'rect', attrs: { x: '7', y: '7', width: '10', height: '10', rx: '1', fill: 'currentColor', stroke: 'none' } }
    ],
    alert: [
      { tag: 'path', attrs: { d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z' } },
      { tag: 'line', attrs: { x1: '12', y1: '9', x2: '12', y2: '13' } },
      { tag: 'line', attrs: { x1: '12', y1: '17', x2: '12.01', y2: '17' } }
    ],
    file: [
      { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' } },
      { tag: 'path', attrs: { d: 'M14 2v6h6' } }
    ],
    folder: [
      { tag: 'path', attrs: { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' } }
    ],
    globe: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
      { tag: 'line', attrs: { x1: '3', y1: '12', x2: '21', y2: '12' } },
      { tag: 'path', attrs: { d: 'M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z' } }
    ],
    terminal: [
      { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '2' } },
      { tag: 'polyline', attrs: { points: '8 9 11 12 8 15' } },
      { tag: 'line', attrs: { x1: '13', y1: '15', x2: '16', y2: '15' } }
    ],
    sparkle: [
      { tag: 'path', attrs: { d: 'M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8Z' } }
    ],
    layers: [
      { tag: 'path', attrs: { d: 'M12 3 3 8.5 12 14 21 8.5Z' } },
      { tag: 'path', attrs: { d: 'M3 13 12 18.5 21 13' } }
    ],
    clock: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
      { tag: 'polyline', attrs: { points: '12 7 12 12 15 14' } }
    ],
    user: [
      { tag: 'path', attrs: { d: 'M5 21v-1a7 7 0 0 1 7-7 7 7 0 0 1 7 7v1' } },
      { tag: 'circle', attrs: { cx: '12', cy: '7', r: '4' } }
    ],
    /* The assistant marker: rounded head, antenna, two dot-eyes, a mouth line. */
    robot: [
      { tag: 'rect', attrs: { x: '4', y: '8', width: '16', height: '12', rx: '3' } },
      { tag: 'line', attrs: { x1: '12', y1: '8', x2: '12', y2: '4' } },
      { tag: 'line', attrs: { x1: '12', y1: '3', x2: '12.01', y2: '3', 'stroke-width': '2.5' } },
      { tag: 'line', attrs: { x1: '9', y1: '13', x2: '9.01', y2: '13', 'stroke-width': '2.5' } },
      { tag: 'line', attrs: { x1: '15', y1: '13', x2: '15.01', y2: '13', 'stroke-width': '2.5' } },
      { tag: 'line', attrs: { x1: '9', y1: '17', x2: '15', y2: '17' } }
    ],
    /* A vertical chain of linked nodes — a conversation thread — kept
     * distinct from any chat-bubble glyph. */
    thread: [
      { tag: 'circle', attrs: { cx: '12', cy: '5', r: '2' } },
      { tag: 'line', attrs: { x1: '12', y1: '7', x2: '12', y2: '11' } },
      { tag: 'circle', attrs: { cx: '12', cy: '13', r: '2' } },
      { tag: 'line', attrs: { x1: '12', y1: '15', x2: '12', y2: '19' } },
      { tag: 'circle', attrs: { cx: '12', cy: '21', r: '1.5' } }
    ],
    attach: [
      { tag: 'path', attrs: { d: 'M21.44 11.05 12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.41 17.41a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49' } }
    ],
    mic: [
      { tag: 'path', attrs: { d: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z' } },
      { tag: 'path', attrs: { d: 'M19 11a7 7 0 0 1-14 0' } },
      { tag: 'line', attrs: { x1: '12', y1: '18', x2: '12', y2: '22' } },
      { tag: 'line', attrs: { x1: '8', y1: '22', x2: '16', y2: '22' } }
    ]
  };

  function makeChild(spec) {
    var node = doc.createElementNS(SVG_NS, spec.tag);
    var attrs = spec.attrs || {};
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) node.setAttribute(k, attrs[k]);
    }
    return node;
  }

  function buildSvg(spec, size) {
    var svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', VIEWBOX);
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    /* Decorative only; the label lives in adjacent text per contract 8.1. */
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (spec) {
      for (var i = 0; i < spec.length; i++) svg.appendChild(makeChild(spec[i]));
    }
    return svg;
  }

  /**
   * get(name, size) -> SVGElement. Always a fresh node. Unknown names log a
   * warning and return an empty (but real, insertable) SVGElement rather
   * than null, so a typo cannot crash a caller mid-render.
   */
  function get(name, size) {
    var n = (size === undefined || size === null) ? DEFAULT_SIZE : size;
    var spec = Object.prototype.hasOwnProperty.call(GLYPHS, name) ? GLYPHS[name] : null;
    if (!spec && global.console && console.warn) {
      console.warn('[pmx-icons] unknown icon name: ' + name);
    }
    return buildSvg(spec, n);
  }

  /** has(name) -> boolean. */
  function has(name) {
    return Object.prototype.hasOwnProperty.call(GLYPHS, name);
  }

  /** names() -> string[], sorted, fresh array each call. */
  function names() {
    var out = [];
    for (var key in GLYPHS) {
      if (Object.prototype.hasOwnProperty.call(GLYPHS, key)) out.push(key);
    }
    return out.sort();
  }

  global.PMXIcons = { get: get, has: has, names: names };
})(window);
