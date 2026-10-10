/* 00-loader.js: PMG, the Puppet Master glyph registry on top of the 5.6 Pro neon renderer (window.PM56_NEON).
 * OWNER: pm7-glyphs (2026-10-10). Loads after neon-icons.js and before every family file.
 *
 * WHY: the 5.6 Pro chat set (Concepts/chat-assistant-concepts/5.6 Pro/neon-icons.js) is the Puppet Master default
 * (Jared, RAIL-4). PMG adds what the chat never had, in the same neon-sign anatomy, and keeps one record per glyph
 * (meaning, surfaces, the items it replaces) so the specs can cite one registry instead of a glyph list per surface.
 * The chat's own drawings are never redrawn here: PMG.def refuses a name PM56_NEON already draws unless the record
 * says {redraw: '<why>'} (a decision Jared approved in the catalog).
 *
 * FAMILY FILE FORMAT (src/registry/families/<family>.js), one call per glyph:
 *   PMG.def('term-kind', {
 *     family: 'terminal',                 // the family file's name
 *     meaning: 'A terminal tab',          // one sentence: the single meaning this shape carries everywhere
 *     role: 'concept',                    // concept | control | status | brand (neon-icons.css section 4)
 *     act: 'seq',                         // loop shape, one of PMG.ACTS (neon-icons.css nx-L-*), or 'none'
 *     replaces: ['terminal 90-kind.js ICON'],   // the inventory items it stands for (free text, cite file or id)
 *     aliases: ['terminal-tab'],          // other names that draw it
 *     parts: [
 *       '<path d="M4 6.5h16v11H4z"/>',    // a static part: markup of one or more path/circle/rect/ellipse/line
 *       { els: '<path d="m7.5 10 2.5 2-2.5 2"/>', move: { ax: -1.5, ao: .3, ad: 0, b: 1 } }   // a moving part
 *     ]
 *   });
 * Moving-part pose keys are neon-icons.js's (see its THE GLYPHS comment): ax/ay translate and cr circle radius
 * (user units), ar rotate (deg, + clockwise), ao opacity at the pose, ad stagger (ms), ac/ae clip insets
 * ('top right bottom left', user units) for draw-ons, o pivot [x,y] or 'c', b bounce one-shot, n sits out loops.
 * Drawing rules (the neon grammar): 24-unit grid, stroke 1.8 currentColor, round caps and joins, no fill except
 * {f} dots/beads (write class="nx-f"), at most two moving parts (three for a sequence: act 'seq'), the rest pose is
 * the finished lit drawing,
 * transform and opacity only. Keep 2 units of margin (the halo blooms past the stroke).
 *
 * STATUS: PMG.status(key, {...}) adds a status to the shared vocabulary (one meaning per shape); see 10-status.js.
 */
(function () {
  'use strict';
  var N = window.PM56_NEON;
  if (!N) { window.PMG_ERROR = 'neon-icons.js did not load'; return; }
  if (window.PMG) return;

  var ACTS = ['none', 'strike', 'seq', 'fill', 'wave', 'swap', 'spin', 'hop', 'drop', 'ratchet', 'blink', 'calm', 'tip', 'tick2'];
  var ROLES = ['concept', 'control', 'status', 'brand'];
  var records = Object.create(null), order = [], problems = [], aliasOf = Object.create(null);

  /* markup -> neon element objects (the same shape neon-icons.js builds with el()) */
  function parse(str) {
    var out = [], re = /<(path|circle|rect|ellipse|line)\b([^>]*?)\/?>/g, m;
    while ((m = re.exec(String(str)))) {
      var attrs = {}, o = { tag: m[1], attrs: attrs }, ar = /([\w:-]+)="([^"]*)"/g, a;
      while ((a = ar.exec(m[2]))) {
        if (a[1] === 'class') { o.cls = a[2]; if (/\bnx-f\b/.test(a[2])) o.f = 1; }
        else if (a[1] === 'stroke-dasharray') o.dash = a[2];
        else attrs[a[1]] = a[2];
      }
      out.push(o);
    }
    return out;
  }

  function def(name, r) {
    name = String(name || '');
    var bad = function (why) { problems.push(name + ': ' + why); return false; };
    if (!name || !r || !Array.isArray(r.parts) || !r.parts.length) return bad('needs a name and parts');
    if (records[name]) return bad('defined twice (' + records[name].family + ', ' + r.family + ')');
    if (N.has(name) && !r.redraw) return bad('the 5.6 Pro set already draws it: map to it instead, or give {redraw: why}');
    if (!r.meaning) return bad('needs a one-sentence meaning');
    var role = r.role || 'concept', act = r.act || 'none';
    if (ROLES.indexOf(role) < 0) return bad('unknown role ' + role);
    if (ACTS.indexOf(act) < 0) return bad('unknown act ' + act);
    var moving = 0, parts = [];
    r.parts.forEach(function (p) {
      if (typeof p === 'string') { parse(p).forEach(function (e) { parts.push(e); }); return; }
      var els = parse(Array.isArray(p.els) ? p.els.join('') : p.els);
      if (!els.length) return;
      moving++;
      parts.push({ els: els, m: p.move || {} });
    });
    if (moving > (act === 'seq' ? 3 : 2)) return bad(act === 'seq' ? 'more than three moving parts' : 'more than two moving parts (three only for act seq)');
    if (!N.register(name, { parts: parts, act: act, role: role })) return bad('PM56_NEON.register refused it');
    records[name] = {
      name: name, family: r.family || 'misc', families: [r.family || 'misc'], meaning: r.meaning, role: role, act: act,
      replaces: r.replaces || [], aliases: r.aliases || [], surfaces: r.surfaces || [], note: r.note || '',
      redraw: r.redraw || '', moving: moving, source: 'pmg'
    };
    order.push(name);
    /* an alias draws the same glyph under the PM7 name it replaces, unless the chat set already owns that name */
    (r.aliases || []).forEach(function (a) {
      if (N.has(a) || records[a] || aliasOf[a]) { problems.push(name + ': alias ' + a + ' is taken'); return; }
      N.register(a, { parts: parts, act: act, role: role }); aliasOf[a] = name;
    });
    return true;
  }

  /* A mapping record for a glyph the chat already draws: which PM7 items it now stands for. */
  function map(name, r) {
    var c = N.alias(name);
    if (!N.has(c)) { problems.push('map ' + name + ': the 5.6 Pro set has no such glyph'); return false; }
    var rec = records[c];
    if (!rec) {
      rec = records[c] = { name: c, family: r.family || 'chat', families: [], meaning: r.meaning || '', role: '', act: '', replaces: [], aliases: [], surfaces: [], note: '', source: 'c56' };
      order.push(c);
    }
    /* one glyph can serve several families (the status marks: the rail, the terminal, the panels) */
    if (r.family && rec.families.indexOf(r.family) < 0) rec.families.push(r.family);
    (r.replaces || []).forEach(function (x) { if (rec.replaces.indexOf(x) < 0) rec.replaces.push(x); });
    (r.surfaces || []).forEach(function (x) { if (rec.surfaces.indexOf(x) < 0) rec.surfaces.push(x); });
    if (r.meaning && !rec.meaning) rec.meaning = r.meaning;
    return true;
  }

  /* ---- flat render (Usage PERF-3, t3-usage-pm7 2026-10-10): the whole glyph as one stroked path (and one filled path if
     it has beads), no halo, no moving parts: <svg><path/></svg>. For chrome where element count is the budget (Usage's
     card-head tools). It lights by ink alone on hover (the light looks' ignite), and plays no act. Cached per call. */
  var flatCache = Object.create(null);
  function fmt(n) { var v = Math.round(n * 1000) / 1000; return String(Object.is(v, -0) ? 0 : v); }
  function absHead(d) {
    var h = /^\s*m/.exec(d); if (!h) return d;
    var rest = d.slice(h[0].length), xy = [], re = /^[\s,]*(-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/i, x;
    for (var i = 0; i < 2; i++) { x = re.exec(rest); if (!x) return d; xy.push(x[1]); rest = rest.slice(x[0].length); }
    return 'M' + xy[0] + ' ' + xy[1] + (/^[\s,]*[-+.\d]/.test(rest) ? 'l' : '') + rest;
  }
  function attrsOf(tag) { var a = {}, ar = /([\w:-]+)="([^"]*)"/g, m; while ((m = ar.exec(tag))) a[m[1]] = m[2]; return a; }
  function pathOf(name, a) {
    var n = function (k) { return Number(a[k]) || 0; };
    if (name === 'path') return absHead(a.d || '');
    if (name === 'line') return 'M' + fmt(n('x1')) + ' ' + fmt(n('y1')) + 'L' + fmt(n('x2')) + ' ' + fmt(n('y2'));
    if (name === 'circle' || name === 'ellipse') {
      var rx = name === 'circle' ? n('r') : n('rx'), ry = name === 'circle' ? n('r') : n('ry'), cx = n('cx'), cy = n('cy');
      return 'M' + fmt(cx - rx) + ' ' + fmt(cy) + 'a' + fmt(rx) + ' ' + fmt(ry) + ' 0 1 0 ' + fmt(2 * rx) + ' 0a' + fmt(rx) + ' ' + fmt(ry) + ' 0 1 0 ' + fmt(-2 * rx) + ' 0';
    }
    if (name === 'rect') {
      var x = n('x'), y = n('y'), w = n('width'), h = n('height'), r = Math.min(n('rx') || n('ry'), w / 2, h / 2);
      if (!r) return 'M' + fmt(x) + ' ' + fmt(y) + 'h' + fmt(w) + 'v' + fmt(h) + 'h' + fmt(-w) + 'z';
      return 'M' + fmt(x + r) + ' ' + fmt(y) + 'h' + fmt(w - 2 * r) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(r) + ' ' + fmt(r) + 'v' + fmt(h - 2 * r) +
        'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(-r) + ' ' + fmt(r) + 'h' + fmt(-(w - 2 * r)) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(-r) + ' ' + fmt(-r) +
        'v' + fmt(-(h - 2 * r)) + 'a' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + fmt(r) + ' ' + fmt(-r) + 'z';
    }
    return '';
  }
  function flat(name, size, cls) {
    var key = name + '|' + size + '|' + (cls || '');
    if (flatCache[key]) return flatCache[key];
    var svg = N.icon(name, size, cls), open = /^<svg\b[^>]*>/.exec(svg)[0], stroke = [], fill = [], re = /<(path|circle|rect|ellipse|line)\b([^>]*?)\/?>/g, m;
    while ((m = re.exec(svg))) {
      var a = attrsOf(m[2]), c = a['class'] || '';
      if (/\bnx-(h|ov)\b/.test(c)) continue;            /* halos and act overlays go */
      (/\bnx-f\b/.test(c) ? fill : stroke).push(pathOf(m[1], a));
    }
    open = open.replace(/\sstyle="[^"]*"/, '').replace(/class="([^"]*)"/, function (x, k) { return 'class="' + k.replace(/\bnx-a-\w+/, 'nx-a-none') + ' pmg-flat"'; });
    var out = open + (stroke.length ? '<path class="nx-c" d="' + stroke.join('') + '"/>' : '') + (fill.length ? '<path class="nx-c nx-f" d="' + fill.join('') + '"/>' : '') + '</svg>';
    return (flatCache[key] = out);
  }
  /* a calm status mark: lit and still from the first frame, no list rhythm and no mount act (Usage: b-motion's room
     entrance owns arrival motion). The wrapper takes nx-still and pmg-calm (pm7-bridge.css). */
  function calm(key, size, cls) { return N.status(key, size, 'nx-still pmg-calm' + (cls ? ' ' + cls : '')); }

  window.PMG = {
    version: 1,
    ACTS: ACTS, ROLES: ROLES,
    def: def, map: map,
    icon: N.icon, status: N.status, has: N.has, alias: N.alias, flat: flat, calm: calm,
    records: function () { return order.map(function (k) { return records[k]; }); },
    record: function (k) { return records[N.alias(k)] || records[k] || records[aliasOf[k]] || null; },
    /* true for a name PMG drew or aliased (the catalog keeps those out of the chat set's lists) */
    owns: function (k) { return !!(records[k] && records[k].source === 'pmg') || !!aliasOf[k]; },
    problems: problems
  };
})();
