/* 20-catalog.js: renders the catalog from PM56_NEON (the chat set), PMG (the Puppet Master additions) and PMG_DATA.
 * Every glyph on the page is drawn by the real renderer, so what Jared reviews is what the surfaces will get. */
(function () {
  'use strict';
  var N = window.PM56_NEON, G = window.PMG, D = window.PMG_DATA || {};
  var html = document.documentElement, main = document.getElementById('pmgMain'), nav = document.getElementById('pmgNav');
  if (!N || !G) { main.innerHTML = '<p class="pmg-empty">The glyph renderer did not load: ' + (window.PM56_NEON_ERROR || window.PMG_ERROR || 'unknown') + '</p>'; return; }

  var LOOKS = ['basic', 'friendly', 'glass', 'retro', 'nier'];
  var LOOK_NAME = { basic: 'Basic', friendly: 'Friendly', glass: 'Glass', retro: 'Retro', nier: 'NieR' };
  var SIZES = [12, 14, 16, 20, 24];
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var frame = html.getAttribute('data-pmg-frame');

  /* ------------------------------------------------------------ view state */
  var q = new URLSearchParams(location.search), saved = {};
  try { saved = JSON.parse(localStorage.getItem('pmg.view') || '{}'); } catch (e) {}
  var lookQ = /^(basic|friendly|glass|retro|nier)-(light|dark)$/.exec(q.get('look') || '');
  var view = {
    family: lookQ ? lookQ[1] : (saved.family || 'basic'),
    mode: lookQ ? lookQ[2] : (saved.mode || 'dark'),
    motion: q.get('motion') || saved.motion || 'full',
    layout: frame ? 'one' : (saved.layout || 'one'),
    section: q.get('section') || saved.section || 'status'
  };
  function lookKey() { return view.family + '-' + view.mode; }
  function paint() {
    var theme = (view.family === 'nier' ? 'basic' : view.family) + '-' + view.mode;
    html.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    if (view.family === 'nier') { html.setAttribute('data-o55-nier', 'on'); html.setAttribute('data-o55-nier-parts', 'icons'); }
    else { html.removeAttribute('data-o55-nier'); html.removeAttribute('data-o55-nier-parts'); }
    if (view.motion === 'reduced') html.setAttribute('data-motion', 'reduced'); else html.removeAttribute('data-motion');
    document.querySelectorAll('.pmg-ctl').forEach(function (g) {
      var k = g.getAttribute('data-ctl');
      g.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-v') === view[k])); });
    });
    if (!frame) try { localStorage.setItem('pmg.view', JSON.stringify(view)); } catch (e) {}
  }

  /* ------------------------------------------------------------ colour maths (the 3:1 gate, measured live) */
  function rgba(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null;
    var p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function over(c, b) { return [0, 1, 2].map(function (i) { return c[i] * c[3] + b[i] * (1 - c[3]); }).concat(1); }
  function lum(c) { return [0, 1, 2].map(function (i) { var x = c[i] / 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }).reduce(function (a, x, i) { return a + x * [.2126, .7152, .0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  /* the field behind an element: its ancestors' backgrounds composited over the page background */
  function field(el) {
    var stack = [];
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) { var c = rgba(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) stack.push(c); }
    var base = rgba(getComputedStyle(document.body).backgroundColor) || [0, 0, 0, 1];
    if (base[3] < 1) base = over(base, [255, 255, 255, 1]);
    for (var i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  }
  function inkOf(svg) { var t = svg.querySelector('.nx-c, .nx-f'); if (!t) return null; var cs = getComputedStyle(t); return rgba(t.classList.contains('nx-f') ? cs.fill : cs.stroke); }
  function contrastOf(svg) { var ink = inkOf(svg); if (!ink) return null; var f = field(svg); return ratio(over(ink, f), f); }

  /* ------------------------------------------------------------ data */
  var STATUS = N.STATUS;
  var EXTRA = (D.status && D.status.extra) || {};           /* PMG statuses beyond the chat's 13 (10-status.js data) */
  var SURF = (D.status && D.status.surfaces) || {};         /* status key -> the PM7 words that map to it, by surface */
  var STATUS_ORDER = ((D.status && D.status.order) || Object.keys(STATUS)).filter(function (k) { return STATUS[k] || EXTRA[k]; });
  var families = (D.families && D.families.list) || [];
  var records = G.records();
  var chat = N.list().filter(function (r) { return !r.status; });

  function famGlyphs(f) {
    if (f.from === 'chat') return chat.filter(function (r) { return (f.match ? new RegExp(f.match).test(r.name) : true) && !(f.exclude && new RegExp(f.exclude).test(r.name)) && !records.some(function (x) { return x.name === r.name && x.source === 'pmg'; }); }).map(function (r) { return { name: r.name, role: r.role, act: r.act, aliases: r.aliases, source: 'c56', rec: G.record(r.name) }; });
    return records.filter(function (r) { return r.family === f.id && r.source === 'pmg'; }).map(function (r) { return { name: r.name, role: r.role, act: r.act, aliases: r.aliases, source: 'pmg', rec: r }; });
  }

  var SECTIONS = [
    { id: 'status', title: 'Status vocabulary', icon: 'st-working', count: function () { return STATUS_ORDER.length; }, render: renderStatus },
    { id: 'decisions', title: 'Decisions for Jared', icon: 'question', count: function () { return ((D.decisions && D.decisions.cards) || []).length; }, render: renderDecisions },
    { id: 'inks', title: 'Glyph inks and contrast', icon: 'eye', count: function () { return 10; }, render: renderInks }
  ].concat(families.map(function (f) {
    return { id: 'fam-' + f.id, title: f.title, icon: f.icon || 'sparkles', fam: f, count: function () { return famGlyphs(f).length; }, render: function (el) { renderFamily(el, f); } };
  }));

  /* ------------------------------------------------------------ sections */
  function head(sec, kicker, intro) {
    return '<header class="pmg-sec-head"><span class="pmg-kicker">' + esc(kicker) + '</span><h2>' + N.icon(sec.icon, 22, 'nx-r-concept') + esc(sec.title) + '</h2>' + (intro ? '<p>' + intro + '</p>' : '') + '</header>';
  }

  function statusMark(k, size) {
    if (STATUS[k]) return N.status(k, size);
    var x = EXTRA[k]; if (!x) return '';
    return '<span class="nx-st nx-st-' + esc(k) + ' nx-tn-' + esc(x.tone) + '" data-k="st:' + esc(k) + '" aria-hidden="true">' + N.icon(x.glyph, size, 'nx-r-status nx-t-' + x.tone) + '</span>';
  }
  function renderStatus(el) {
    var sec = SECTIONS[0];
    var rows = STATUS_ORDER.map(function (k) {
      var S = STATUS[k] || EXTRA[k], words = SURF[k] || {}, isNew = !STATUS[k];
      var aliasHtml = Object.keys(words).map(function (s) { return '<b>' + esc(s) + '</b> ' + esc(words[s].join(', ')); }).join(' · ') || ('<b>chat</b> ' + esc((S.aliases || []).join(', ')));
      return '<div class="pmg-st-row" data-status="' + esc(k) + '">' +
        '<div class="pmg-st-name">' + statusMark(k, 20) + '<div>' + esc(S.label || k) + (isNew ? ' <span class="pmg-origin-new">new</span>' : '') + '<small>' + esc(S.glyph) + ' · tone ' + esc(S.tone) + '</small></div></div>' +
        '<div class="pmg-sizes">' + SIZES.map(function (z) { return '<span>' + statusMark(k, z) + z + '</span>'; }).join('') + '</div>' +
        '<div class="pmg-line pmg-live">' + statusMark(k, 15) + '<span>' + esc((S.example || 'Refactor the settings store')) + '</span><span class="pmg-line-sub">' + esc(S.label || k) + '</span></div>' +
        '<div><div class="pmg-meaning">' + esc(S.meaning || S.motion || '') + '</div><div class="pmg-aliases">' + aliasHtml + '</div></div>' +
        '<div class="pmg-contrast" data-measure>…</div></div>';
    }).join('');
    el.innerHTML = head(sec, 'One meaning per shape, everywhere',
      'Every state Puppet Master shows maps to one of these marks. A shape never means two states, and a state never wears two shapes. The marks move only as the chat set does (the bead orbits, the question mark hops), and Reduced Motion keeps the lit pose with no movement.') +
      '<div class="pmg-panel pmg-status"><div class="pmg-st-row pmg-st-head"><span>State</span><span>Real sizes</span><span>In a list row</span><span>Meaning and the words it replaces</span><span style="text-align:right">Contrast</span></div>' + rows + '</div>';
    requestAnimationFrame(function () {
      el.querySelectorAll('.pmg-st-row[data-status]').forEach(function (row) {
        var svg = row.querySelector('.pmg-line svg.nx'), out = row.querySelector('[data-measure]');
        var r = svg && contrastOf(svg);
        out.textContent = r ? r.toFixed(2) + ':1' : '–';
        if (r && r < 3) out.classList.add('pmg-low');
      });
    });
  }

  function renderDecisions(el) {
    var sec = SECTIONS[1], cards = (D.decisions && D.decisions.cards) || [];
    var demo = function (items) {
      return (items || []).map(function (d) {
        var g = d.status ? statusMark(d.status, 18) : N.icon(d.glyph, 18, d.tone ? 'nx-r-status nx-t-' + d.tone : 'nx-r-concept');
        return '<span>' + g + esc(d.label) + '</span>';
      }).join('');
    };
    el.innerHTML = head(sec, 'Open choices', 'Each card names the choice, shows every option in the current look, and gives a recommendation. Nothing here is adopted until Jared answers.') +
      '<div class="pmg-cards">' + (cards.length ? cards.map(function (c) {
        return '<article class="pmg-panel pmg-card" id="card-' + esc(c.id) + '"><div class="pmg-card-head"><span class="pmg-card-id">' + esc(c.id) + '</span><h3>' + esc(c.title) + '</h3></div><p>' + esc(c.question) + '</p>' +
          '<div class="pmg-options">' + c.options.map(function (o) {
            return '<div class="pmg-option' + (o.recommended ? ' pmg-rec' : '') + '"><div class="pmg-option-head">' + esc(o.key) + '. ' + esc(o.title) + (o.recommended ? '<span class="pmg-rec-word">Recommended</span>' : '') + '</div><div class="pmg-option-demo pmg-live">' + demo(o.demo) + '</div><p>' + esc(o.detail) + '</p></div>';
          }).join('') + '</div></article>';
      }).join('') : '<p class="pmg-empty">No open decisions yet.</p>') + '</div>';
  }

  function renderInks(el) {
    var sec = SECTIONS[2], rep = (D['ink-report'] && D['ink-report'].looks) || {};
    var tones = ['blocked', 'attention', 'working', 'changed', 'done', 'paused', 'idle'];
    var here = view.family === 'nier' ? 'nier-' + view.mode : lookKey();
    var rows = Object.keys(rep).map(function (look) {
      var r = rep[look];
      return '<tr' + (look === here ? ' class="pmg-here"' : '') + '><td>' + esc(look) + '</td>' + tones.map(function (t) {
        var x = r[t]; if (!x) return '<td>–</td>';
        return '<td' + (x.moved ? ' class="pmg-moved"' : '') + '><span class="pmg-sw" style="background:' + esc(x.ink) + '"></span>' + x.after.toFixed(2) + (x.moved ? '<small>was ' + x.before.toFixed(2) + '</small>' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    el.innerHTML = head(sec, 'The 3:1 gate', 'Glyphs take their own inks, fitted per look so every tone reads at least 3.1:1 on every field a glyph sits on, keeping the look\'s hue. A tone that already passed keeps PMConcept7\'s token exactly. Changed is the violet second accent in every look, so it never shares a colour with blocked or attention. NieR keeps its near-monochrome palette; its close pairs are told apart by shape.') +
      '<div class="pmg-panel pmg-inks"><table><thead><tr><th>Look</th>' + tones.map(function (t) { return '<th>' + t + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="pmg-note">Measured by tools/tune_inks.py on PMConcept7\'s own look tokens (tools/extract_looks.py). Glass fields are composited over the look\'s background; the GPU film measures them over the real wallpaper.</p>';
  }

  function tile(g) {
    var small = [12, 16].map(function (z) { return N.icon(g.name, z, g.role === 'status' ? '' : 'nx-r-' + (g.role || 'concept')); }).join('');
    var meta = g.source === 'pmg' ? '<span class="pmg-origin-new">new</span>' : '<span>chat set</span>';
    return '<button class="pmg-tile" data-glyph="' + esc(g.name) + '" data-role="' + esc(g.role) + '"><span class="pmg-tile-stage">' + N.icon(g.name, 40, 'nx-r-' + (g.role === 'status' ? 'concept' : g.role || 'concept')) + '</span><span class="pmg-tile-name">' + esc(g.name) + '</span><span class="pmg-tile-meta">' + meta + (g.act && g.act !== 'none' ? '<span>' + esc(g.act) + '</span>' : '') + '<span class="pmg-small">' + small + '</span></span></button>';
  }
  function renderFamily(el, f) {
    var sec = SECTIONS.filter(function (s) { return s.fam === f; })[0], list = famGlyphs(f);
    el.innerHTML = head(sec, f.kicker || (f.from === 'chat' ? 'From the 5.6 Pro chat' : 'New in the neon language'), esc(f.intro || '')) +
      (list.length ? '<div class="pmg-grid">' + list.map(tile).join('') + '</div>' : '<p class="pmg-panel pmg-empty">' + esc(f.empty || 'Being drawn.') + '</p>');
  }

  /* ------------------------------------------------------------ detail sheet */
  var sheet = document.getElementById('pmgDetail');
  function openDetail(name) {
    var r = G.record(name) || {}, l = N.list().filter(function (x) { return x.name === N.alias(name); })[0] || {};
    var role = r.role || l.role || 'concept';
    var ctl = 'nx-r-' + (role === 'status' ? 'concept' : role);
    sheet.innerHTML = '<div class="pmg-detail-head"><span class="pmg-hero pmg-live">' + N.icon(name, 56, ctl) + '</span><div><h3>' + esc(name) + '</h3><p>' + esc(r.meaning || '') + '</p></div><button class="pmg-close" aria-label="Close">' + N.icon('close', 18, 'nx-r-control') + '</button></div>' +
      '<dl class="pmg-dl"><dt>Origin</dt><dd>' + (r.source === 'pmg' ? 'New, ' + esc(r.family) + ' family' : '5.6 Pro chat set') + '</dd><dt>Role</dt><dd>' + esc(role) + '</dd><dt>Act</dt><dd>' + esc(r.act || l.act || 'none') + '</dd>' +
      ((l.aliases && l.aliases.length) || (r.aliases && r.aliases.length) ? '<dt>Also drawn as</dt><dd>' + esc((r.aliases || []).concat(l.aliases || []).join(', ')) + '</dd>' : '') +
      (r.replaces && r.replaces.length ? '<dt>Replaces</dt><dd>' + esc(r.replaces.join('; ')) + '</dd>' : '') + (r.note ? '<dt>Note</dt><dd>' + esc(r.note) + '</dd>' : '') + '</dl>' +
      '<div class="pmg-contexts"><h4>Real sizes</h4><div class="pmg-sizes">' + SIZES.concat([32]).map(function (z) { return '<span>' + N.icon(name, z, ctl) + z + '</span>'; }).join('') + '</div>' +
      '<h4>In context (hover each)</h4><div class="pmg-ctx-row"><button class="pmg-btn" title="Icon button">' + N.icon(name, 16, 'nx-r-control') + '</button><button class="pmg-rail" title="Rail item">' + N.icon(name, 20, 'nx-r-concept') + '</button><button class="pmg-tab">' + N.icon(name, 14, 'nx-r-concept') + 'Tab title</button></div>' +
      '<div class="pmg-ctx-row"><button class="pmg-menu-row">' + N.icon(name, 15, 'nx-r-concept') + 'Menu item</button><span class="pmg-line pmg-live" style="min-width:260px">' + N.icon(name, 15, 'nx-r-concept') + '<span>List row</span><span class="pmg-line-sub">now</span></span></div>' +
      '<h4>Every tone</h4><div class="pmg-ctx-row pmg-live">' + ['blocked', 'attention', 'working', 'changed', 'done', 'idle', 'paused'].map(function (t) { return '<span title="' + t + '">' + N.icon(name, 20, 'nx-r-status nx-t-' + t) + '</span>'; }).join('') + '</div></div>';
    sheet.hidden = false;
    sheet.querySelector('.pmg-close').addEventListener('click', closeDetail);
    sheet.querySelector('.pmg-close').focus();
  }
  function closeDetail() { sheet.hidden = true; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeDetail(); });

  /* ------------------------------------------------------------ layout */
  function renderNav() {
    nav.innerHTML = SECTIONS.map(function (s) { return '<li><a href="#' + s.id + '" data-sec="' + s.id + '"' + (s.id === view.section ? ' aria-current="true"' : '') + '>' + N.icon(s.icon, 15, 'nx-r-concept') + '<span>' + esc(s.title) + '</span><span class="pmg-count">' + s.count() + '</span></a></li>'; }).join('');
  }
  function renderMain() {
    if (view.layout === 'all' && !frame) {
      var sec = SECTIONS.filter(function (s) { return s.id === view.section; })[0] || SECTIONS[0];
      var src = location.pathname.split('/').pop() || '';
      var figs = [];
      LOOKS.forEach(function (f) { ['light', 'dark'].forEach(function (m) {
        figs.push('<figure><figcaption>' + N.icon('eye', 13, 'nx-r-concept') + LOOK_NAME[f] + ' ' + m + '</figcaption><iframe loading="lazy" title="' + LOOK_NAME[f] + ' ' + m + '" src="' + esc(src) + '?frame=1&section=' + esc(sec.id) + '&look=' + f + '-' + m + '&motion=' + view.motion + '"></iframe></figure>');
      }); });
      main.innerHTML = '<section class="pmg-sec">' + head(sec, 'All ten looks', 'The same section in every look and mode. Scroll inside each frame.') + '<div class="pmg-matrix">' + figs.join('') + '</div></section>';
      return;
    }
    var only = frame ? SECTIONS.filter(function (s) { return s.id === view.section; }) : SECTIONS;
    main.innerHTML = only.map(function (s) { return '<section class="pmg-sec" id="' + s.id + '"></section>'; }).join('');
    only.forEach(function (s) { s.render(document.getElementById(s.id)); });
  }

  document.querySelectorAll('.pmg-ctl button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.parentElement.getAttribute('data-ctl'), v = b.getAttribute('data-v');
      if (view[k] === v) return;
      view[k] = v; paint();
      if (k === 'layout' || k === 'motion' || k === 'family' || k === 'mode') renderMain();
    });
  });
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-sec]'); if (!a) return;
    view.section = a.getAttribute('data-sec'); paint();
    nav.querySelectorAll('a').forEach(function (x) { x.setAttribute('aria-current', String(x === a)); });
    if (view.layout === 'all') { e.preventDefault(); renderMain(); }
  });
  main.addEventListener('click', function (e) { var t = e.target.closest('.pmg-tile'); if (t) openDetail(t.getAttribute('data-glyph')); });
  sheet.addEventListener('click', function () {});

  var brand = document.querySelector('.pmg-brand-mark');
  if (brand) brand.innerHTML = '<span class="nx-st nx-tn-working pmg-live">' + N.icon('sparkles', 26, 'nx-r-concept') + '</span>';
  /* Concept Hub bridge (pm-concept-ready / pm-concept-state): the Hub's theme and reduced motion drive the view. The
     catalog's own look frames (?frame=) ignore it: their look is fixed by the URL. */
  window.addEventListener('message', function (e) {
    var m = e.data;
    if (frame || !m || m.source !== 'pm-concept-hub' || m.type !== 'pm-concept-state' || !m.state) return;
    var t = /^(basic|friendly|glass|retro)-(light|dark)$/.exec(m.state.theme || '');
    if (t) { view.family = t[1]; view.mode = t[2]; }
    if (typeof m.state.reducedMotion === 'boolean') view.motion = m.state.reducedMotion ? 'reduced' : 'full';
    paint(); renderMain();
  });
  if (!frame && window.parent !== window) window.parent.postMessage({ source: 'pm-concept', type: 'pm-concept-ready', version: 1, capabilities: { theme: true, reducedMotion: true, testWidth: false } }, '*');

  paint(); renderNav(); renderMain();
  if (!frame && location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  window.PMG_CATALOG = { view: view, render: function () { renderNav(); renderMain(); }, contrastOf: contrastOf };
  if (G.problems.length) console.warn('PMG problems:', G.problems);
})();
