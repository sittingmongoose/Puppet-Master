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
    ],

    /* ------------------------------------------------------------ packet glyph set
     * Added for the cumulative packet's route/access/BSD/sync/attachment surfaces. Same
     * construction rules as everything above: 24x24 grid, stroke-only unless the mark is
     * genuinely a filled status dot, few points so it survives 13px across eight themes.
     *
     * The six provider marks are deliberately NEUTRAL GEOMETRY, not vendor logos: a concept
     * study may not ship a trademark, and a geometric mark stays legible when the eight themes
     * invert. Each is a distinct silhouette (ring, square-in-square, triangle stack, crescent,
     * hexagon, four-point star) so a provider rail of six is scannable without colour.
     */

    /* Back Seat Driver: a second, smaller eye behind the first — an observer, not a driver. */
    bsd: [
      { tag: 'path', attrs: { d: 'M2.5 12s3.4-5.5 8.5-5.5S19.5 12 19.5 12s-3.4 5.5-8.5 5.5S2.5 12 2.5 12Z' } },
      { tag: 'circle', attrs: { cx: '11', cy: '12', r: '2' } },
      { tag: 'path', attrs: { d: 'M18 6.5a7 7 0 0 1 0 11' } }
    ],
    shield: [
      { tag: 'path', attrs: { d: 'M12 3 5 5.5V11c0 4.4 3 8.1 7 10 4-1.9 7-5.6 7-10V5.5Z' } }
    ],
    /* Half-dial with a needle: a measured amount, distinct from `ring` (a closed budget). */
    gauge: [
      { tag: 'path', attrs: { d: 'M4 16a8 8 0 1 1 16 0' } },
      { tag: 'line', attrs: { x1: '12', y1: '16', x2: '15.5', y2: '10.5' } },
      { tag: 'line', attrs: { x1: '12', y1: '16', x2: '12.01', y2: '16', 'stroke-width': '2.5' } }
    ],
    /* Three linked members around a reducer — a crew, not a single agent. */
    crew: [
      { tag: 'circle', attrs: { cx: '6', cy: '7', r: '2.5' } },
      { tag: 'circle', attrs: { cx: '18', cy: '7', r: '2.5' } },
      { tag: 'circle', attrs: { cx: '12', cy: '18', r: '2.5' } },
      { tag: 'path', attrs: { d: 'M8.2 8.6 11 15.6M15.8 8.6 13 15.6M8.5 7h7' } }
    ],
    /* A socket: bracket plus a plug stem. Reads as a bound port at 13px. */
    port: [
      { tag: 'rect', attrs: { x: '4', y: '9', width: '11', height: '10', rx: '2' } },
      { tag: 'line', attrs: { x1: '7.5', y1: '9', x2: '7.5', y2: '5' } },
      { tag: 'line', attrs: { x1: '11.5', y1: '9', x2: '11.5', y2: '5' } },
      { tag: 'line', attrs: { x1: '15', y1: '14', x2: '20', y2: '14' } }
    ],
    /* Worktree: a trunk with one checked-out copy, distinct from `branch` (a fork point). */
    'worktree-alt': [
      { tag: 'line', attrs: { x1: '5', y1: '4', x2: '5', y2: '20' } },
      { tag: 'rect', attrs: { x: '12', y: '4', width: '8', height: '6', rx: '1.5' } },
      { tag: 'rect', attrs: { x: '12', y: '14', width: '8', height: '6', rx: '1.5' } },
      { tag: 'path', attrs: { d: 'M5 7h7M5 17h7' } }
    ],
    /* A frozen frame: outer bounds plus a corner fold, so it is a point-in-time copy. */
    snapshot: [
      { tag: 'path', attrs: { d: 'M4 5h11l5 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z' } },
      { tag: 'path', attrs: { d: 'M15 5v5h5' } },
      { tag: 'circle', attrs: { cx: '11', cy: '15', r: '3' } }
    ],
    /* Globe with a slash: the connection axis, not the domain axis. */
    offline: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '8' } },
      { tag: 'path', attrs: { d: 'M4.6 9h14.8M4.6 15h14.8' } },
      { tag: 'line', attrs: { x1: '5.5', y1: '18.5', x2: '18.5', y2: '5.5', 'stroke-width': '2' } }
    ],
    /* Outbox queue: three stacked items waiting behind a line. */
    queued: [
      { tag: 'line', attrs: { x1: '4', y1: '6', x2: '20', y2: '6' } },
      { tag: 'path', attrs: { d: 'M6 10h12M6 14h12M6 18h8' } }
    ],
    /* Replay: a closed loop with one arrowhead, so it is a resend rather than a refresh. */
    replay: [
      { tag: 'path', attrs: { d: 'M20 12a8 8 0 1 1-2.6-5.9' } },
      { tag: 'path', attrs: { d: 'M20 4v4.5h-4.5' } }
    ],
    /* Passive spellcheck: a letter with the wavy underline it draws. */
    spell: [
      { tag: 'path', attrs: { d: 'M6 15 10 5l4 10' } },
      { tag: 'line', attrs: { x1: '7.3', y1: '12', x2: '12.7', y2: '12' } },
      { tag: 'path', attrs: { d: 'M4 19.2c1-1.2 2-1.2 3 0s2 1.2 3 0 2-1.2 3 0 2 1.2 3 0 2-1.2 3 0' } }
    ],
    bell: [
      { tag: 'path', attrs: { d: 'M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z' } },
      { tag: 'path', attrs: { d: 'M10.3 19a2 2 0 0 0 3.4 0' } }
    ],
    'provider-anthropic': [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '8' } },
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } }
    ],
    'provider-openai': [
      { tag: 'rect', attrs: { x: '4', y: '4', width: '16', height: '16', rx: '3' } },
      { tag: 'rect', attrs: { x: '9', y: '9', width: '6', height: '6', rx: '1' } }
    ],
    'provider-alibaba': [
      { tag: 'path', attrs: { d: 'M12 4 19 10H5Z' } },
      { tag: 'path', attrs: { d: 'M12 13 19 19H5Z' } }
    ],
    'provider-moonshot': [
      { tag: 'path', attrs: { d: 'M16.5 4A8 8 0 1 0 20 14.5 6.5 6.5 0 0 1 16.5 4Z' } }
    ],
    'provider-google': [
      { tag: 'path', attrs: { d: 'M12 3.5 19 7.5v9L12 20.5 5 16.5v-9Z' } }
    ],
    star: [
      { tag: 'path', attrs: { d: 'M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.9-5.2 2.9 1-5.9L3.5 9.8l5.9-.8Z' } }
    ],
    'star-filled': [
      { tag: 'path', attrs: {
        d: 'M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.9-5.2 2.9 1-5.9L3.5 9.8l5.9-.8Z',
        fill: 'currentColor'
      } }
    ],
    /* Two chevrons: more throughput per unit time. Not a lightning bolt — a bolt reads as an
     * outage in the same column as `alert`. */
    fast: [
      { tag: 'path', attrs: { d: 'M5 6l6 6-6 6' } },
      { tag: 'path', attrs: { d: 'M13 6l6 6-6 6' } }
    ],
    /* Verification: a flask, distinct from the `check` outcome mark. */
    beaker: [
      { tag: 'path', attrs: { d: 'M9 3v5.5L4.6 17A2 2 0 0 0 6.4 20h11.2a2 2 0 0 0 1.8-3L15 8.5V3' } },
      { tag: 'line', attrs: { x1: '7.5', y1: '3', x2: '16.5', y2: '3' } },
      { tag: 'line', attrs: { x1: '6.6', y1: '14', x2: '17.4', y2: '14' } }
    ],
    /* PM's own BrowserWorkspace mark: a page with a control strip, never a third-party logo. */
    browser: [
      { tag: 'rect', attrs: { x: '3', y: '4', width: '18', height: '16', rx: '2' } },
      { tag: 'line', attrs: { x1: '3', y1: '9', x2: '21', y2: '9' } },
      { tag: 'line', attrs: { x1: '6.5', y1: '6.5', x2: '6.51', y2: '6.5', 'stroke-width': '2' } },
      { tag: 'line', attrs: { x1: '9.5', y1: '6.5', x2: '9.51', y2: '6.5', 'stroke-width': '2' } }
    ],
    /* Diff: added and removed runs side by side. */
    diff: [
      { tag: 'path', attrs: { d: 'M7 4v7M4 7.5h6' } },
      { tag: 'path', attrs: { d: 'M4 20h6' } },
      { tag: 'path', attrs: { d: 'M14 4h6M14 12h6M14 20h6' } },
      { tag: 'path', attrs: { d: 'M17 8v8', opacity: '.35' } }
    ],
    /* Artifact: a produced object with a lid seam, distinct from `file` (a source). */
    artifact: [
      { tag: 'path', attrs: { d: 'M12 3 20 7v10l-8 4-8-4V7Z' } },
      { tag: 'path', attrs: { d: 'M4 7l8 4 8-4M12 11v10' } }
    ],
    rewind: [
      { tag: 'path', attrs: { d: 'M11 6 4 12l7 6Z' } },
      { tag: 'path', attrs: { d: 'M20 6l-7 6 7 6Z' } }
    ],
    /* Restore point: a clock with a counter-clockwise arrow. */
    restore: [
      { tag: 'path', attrs: { d: 'M4 12a8 8 0 1 0 2.6-5.9' } },
      { tag: 'path', attrs: { d: 'M4 4v4.5h4.5' } },
      { tag: 'polyline', attrs: { points: '12 9 12 12.5 14.5 14' } }
    ],
    /* Spawn: a parent node emitting a child. */
    spawn: [
      { tag: 'circle', attrs: { cx: '6', cy: '7', r: '2.5' } },
      { tag: 'path', attrs: { d: 'M6 9.5V15a3 3 0 0 0 3 3h4' } },
      { tag: 'rect', attrs: { x: '14', y: '14', width: '7', height: '7', rx: '1.5' } }
    ],
    /* Cross-thread request: an outbound arrow leaving a thread node. */
    request: [
      { tag: 'circle', attrs: { cx: '6', cy: '12', r: '2.5' } },
      { tag: 'line', attrs: { x1: '8.5', y1: '12', x2: '18', y2: '12' } },
      { tag: 'path', attrs: { d: 'M14.5 8.5 18 12l-3.5 3.5' } }
    ],
    /* Redirect: a path that turns mid-flight — the active turn changing course. */
    redirect: [
      { tag: 'path', attrs: { d: 'M4 18h6a4 4 0 0 0 4-4V7' } },
      { tag: 'path', attrs: { d: 'M10.5 10.5 14 7l3.5 3.5' } }
    ],
    /* Compact: two brackets closing inward on a shortened run. */
    compact: [
      { tag: 'path', attrs: { d: 'M4 6v12M20 6v12' } },
      { tag: 'path', attrs: { d: 'M8 12h8' } },
      { tag: 'path', attrs: { d: 'M11 9 8 12l3 3M13 9l3 3-3 3' } }
    ],
    /* ---- attachment class marks. One silhouette per resolver class so a resolution row is
     * identifiable before its label is read. */
    zip: [
      { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' } },
      { tag: 'path', attrs: { d: 'M14 2v6h6' } },
      { tag: 'path', attrs: { d: 'M10 5v2M12 8v2M10 11v2M12 14v2' } }
    ],
    pdf: [
      { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' } },
      { tag: 'path', attrs: { d: 'M14 2v6h6' } },
      { tag: 'path', attrs: { d: 'M8 13h3a1.5 1.5 0 0 1 0 3H8v-3M8 16v3' } },
      { tag: 'path', attrs: { d: 'M14 13v6h1.5a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 15.5 13Z' } }
    ],
    audio: [
      { tag: 'path', attrs: { d: 'M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2' } }
    ],
    video: [
      { tag: 'rect', attrs: { x: '3', y: '6', width: '12', height: '12', rx: '2' } },
      { tag: 'path', attrs: { d: 'M15 10.5 21 7v10l-6-3.5Z' } }
    ],
    sheet: [
      { tag: 'rect', attrs: { x: '4', y: '4', width: '16', height: '16', rx: '2' } },
      { tag: 'path', attrs: { d: 'M4 9.5h16M4 15h16M9.5 4v16' } }
    ],
    image: [
      { tag: 'rect', attrs: { x: '4', y: '4', width: '16', height: '16', rx: '2' } },
      { tag: 'circle', attrs: { cx: '9', cy: '9.5', r: '1.6' } },
      { tag: 'path', attrs: { d: 'M4.5 17.5 9.5 13l3.5 3 3-2.5 3.5 3' } }
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
