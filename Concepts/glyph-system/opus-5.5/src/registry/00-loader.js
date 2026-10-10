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
  var records = Object.create(null), order = [], problems = [];

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
      name: name, family: r.family || 'misc', meaning: r.meaning, role: role, act: act,
      replaces: r.replaces || [], aliases: r.aliases || [], surfaces: r.surfaces || [], note: r.note || '',
      redraw: r.redraw || '', moving: moving, source: 'pmg'
    };
    order.push(name);
    return true;
  }

  /* A mapping record for a glyph the chat already draws: which PM7 items it now stands for. */
  function map(name, r) {
    var c = N.alias(name);
    if (!N.has(c)) { problems.push('map ' + name + ': the 5.6 Pro set has no such glyph'); return false; }
    var rec = records[c];
    if (!rec) {
      rec = records[c] = { name: c, family: r.family || 'chat', meaning: r.meaning || '', role: '', act: '', replaces: [], aliases: [], surfaces: [], note: '', source: 'c56' };
      order.push(c);
    }
    (r.replaces || []).forEach(function (x) { if (rec.replaces.indexOf(x) < 0) rec.replaces.push(x); });
    (r.surfaces || []).forEach(function (x) { if (rec.surfaces.indexOf(x) < 0) rec.surfaces.push(x); });
    if (r.meaning && !rec.meaning) rec.meaning = r.meaning;
    return true;
  }

  window.PMG = {
    version: 1,
    ACTS: ACTS, ROLES: ROLES,
    def: def, map: map,
    icon: N.icon, status: N.status, has: N.has, alias: N.alias,
    records: function () { return order.map(function (k) { return records[k]; }); },
    record: function (k) { return records[N.alias(k)] || records[k] || null; },
    problems: problems
  };
})();
