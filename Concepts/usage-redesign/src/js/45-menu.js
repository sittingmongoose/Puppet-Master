/* The shared dropdown menu (owner: engine; Jared 2026-10-02: "Drop down menus should use the chat assistant style drop
   down menus", DECISIONS.md "Dropdown menus"). Every Usage dropdown (scope, range overflow, detail, panels, export, the
   card menu, size picker, gear options, threshold, filters) is one PMU.menu. Ported from the Chat Assistant 5.6 Pro
   menus (menus.css / menus.js and the .overlay-menu / .menu-* rules of styles.css):
   - look: a floating panel with a menu head (bold title left, muted "Current · <value>" right), rows of title + one muted
     description line, a check on the active row, a rounded hover / active row highlight, small-caps section labels, an
     optional search field at the top and an optional icon rail on the left, hairline dividers; theme tokens per family
     (src/css/15-menu.css);
   - motion: the corner-origin spring sprout (opacity 160 ms + transform 300 ms cubic-bezier(.22,1.55,.36,1) from the
     non-uniform closed scale .72 x .48, origin at the trigger corner); the closed state is applied only AFTER the
     untransformed box has been measured (the 5.6 Pro measuring trap: a transformed box measures 28 % / 52 % small); an
     asymmetric close (transform 220 ms, the fade held to the last 45 ms); a height spring with a size bounce when the
     contents change (search filter, rail, drill-in, toggles);
   - keyboard: arrows, Home / End, Enter / Space, Escape (focus returns to the trigger), Tab closes, type-to-search
     (into the search field when there is one, type-ahead otherwise), Left / Right between the rail and the list.
   The panel is appended inside .pmu-shell (so it reads the --pmu-* tokens) and placed against the shell box; rows carry
   .pmu-poprow and the panel .pmu-pop so NieR Mode's menu cursor and slice apply (usage_layer NIER_NAMES).
   API (NOTES-engine.md): PMU.menu.open(anchor, spec) -> handle { el, close(), update(spec), refresh() };
   PMU.menu.toggle(anchor, spec); PMU.menu.close(); PMU.menu.isOpen(); PMU.menu.choice(anchor, opts). */
(function () {
  var app = document.getElementById('pmuApp');
  var GAP = 6, EDGE = 8, OPEN_MS = 300, CLOSE_MS = 260, SPRING_MS = 360;
  var current = null;          /* the open handle */
  var seq = 0;

  function speed() { return PMU.motion ? PMU.motion.speed() : 1; }
  function reduced() { return PMU.motion ? PMU.motion.reduced() : false; }
  function icon(name) { return SVG[name] || ''; }
  function nierSlice() { return !!(PMU.theme && PMU.theme.has && PMU.theme.has('slice')); }

  /* ---- markup ---- */
  function normRows(spec) {
    if (spec.sections) return spec.sections;
    return [{ rows: spec.rows || [] }];
  }
  function matches(row, q) {
    if (!q) return true;
    var hay = ((row.label || '') + ' ' + (row.sub || '') + ' ' + (row.keywords || '') + ' ' + (row.right || '')).toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function leadHtml(r) {
    if (r.mark) return '<span class="pmu-mlead pmu-mlead-mark">' + PMU.mark(r.mark, 18) + '</span>';
    if (r.swatch) return '<span class="pmu-mlead pmu-mlead-swatch"><i style="background:' + esc(r.swatch) + '"></i></span>';
    if (r.icon) return '<span class="pmu-mlead pmu-micon" aria-hidden="true">' + icon(r.icon) + '</span>';
    return '';
  }
  function rowHtml(r, i) {
    if (r.divider) return '<div class="pmu-mdiv" role="separator"></div>';
    if (r.html != null) return '<div class="pmu-mblock">' + r.html + '</div>';
    var on = !!r.active, dis = !!r.disabled;
    var role = r.toggle ? 'menuitemcheckbox' : r.radio === false || r.action ? 'menuitem' : 'menuitemradio';
    var sub = dis && r.reason ? r.reason : r.sub;
    var trail = r.submenu ? '<span class="pmu-mchev" aria-hidden="true">' + icon('chevronRight') + '</span>'
      : (on && r.check !== false) || (r.toggle && on) ? '<span class="pmu-mcheck" aria-hidden="true">' + icon('check') + '</span>'
      : r.toggle ? '<span class="pmu-mcheck pmu-mcheck-off" aria-hidden="true"></span>' : '';
    return '<button type="button" class="pmu-poprow pmu-mitem' + (on && !r.toggle ? ' active' : '') + (r.toggle ? ' is-toggle' + (on ? ' is-on' : '') : '') + (dis ? ' is-disabled' : '') + (r.danger ? ' is-danger' : '') +
      (sub ? ' has-sub' : '') + '" role="' + role + '"' + (role !== 'menuitem' ? ' aria-checked="' + (on ? 'true' : 'false') + '"' : '') +
      ' tabindex="-1" data-mi="' + i + '"' + (dis ? ' aria-disabled="true"' : '') +
      (r.hover ? ' data-pm-hover-label="' + esc(r.hover) + '"' : ' data-pm-hover-exempt="menu"') + '>' +
      leadHtml(r) + '<span class="pmu-mcopy"><b>' + esc(r.label) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</span>' +
      (r.right != null && r.right !== '' ? '<span class="pmu-mright">' + esc(r.right) + '</span>' : '') + trail + '</button>';
  }
  function railHtml(h) {
    var spec = h.spec;
    if (!spec.rail || !spec.rail.length) return '';
    return '<div class="pmu-mrail" role="tablist" aria-label="' + esc(spec.railLabel || 'Filter') + '">' + spec.rail.map(function (b) {
      var on = (h.rail || 'all') === b.value;
      return '<button type="button" class="pmu-mrailbtn' + (on ? ' active' : '') + '" role="tab" aria-selected="' + on + '" data-rail="' + esc(b.value) + '"' +
        ' aria-label="' + esc(b.label) + '" data-pm-hover-label="' + esc(b.label) + '">' +
        (b.mark ? PMU.mark(b.mark, 18) : '<span class="pmu-ico">' + icon(b.icon || 'grid') + '</span>') + '</button>';
    }).join('') + '</div>';
  }
  function listHtml(h) {
    var spec = h.spec, q = h.query || '', rail = h.rail || 'all', out = [], any = false;
    h.flat = [];
    normRows(spec).forEach(function (sec) {
      var secMatch = rail === 'all' || sec.group === rail;
      var rows = (sec.rows || []).filter(function (r) {
        if (r.divider || r.html != null) return !q && secMatch;
        if (!secMatch && r.group !== rail) return false;
        return matches(r, q);
      });
      var real = rows.filter(function (r) { return !r.divider && r.html == null; });
      if (!rows.length || (q && !real.length)) return;
      if (sec.label) out.push('<div class="pmu-msec" role="presentation">' + esc(sec.label) + '</div>');
      rows.forEach(function (r) { var i = h.flat.length; h.flat.push(r); out.push(rowHtml(r, i)); if (!r.divider && r.html == null) any = true; });
    });
    if (!any) out.push('<p class="pmu-mempty">' + esc(spec.empty || 'No matching options.') + '</p>');
    return out.join('');
  }
  function headHtml(h) {
    var spec = h.spec;
    if (spec.title == null && !h.stack.length) return '';
    var back = h.stack.length ? '<button type="button" class="pmu-mback" data-mback aria-label="Back" data-pm-hover-exempt="menu">' + icon('chevronLeft') + '</button>' : '';
    var right = spec.meta != null ? spec.meta : spec.current != null && spec.current !== '' ? (/^Current\s*·/.test(String(spec.current)) ? String(spec.current) : 'Current · ' + spec.current) : '';
    return '<div class="pmu-mhead">' + back + '<strong>' + esc(spec.title || '') + '</strong><span class="pmu-mspacer"></span>' +
      (right ? '<span class="pmu-mcur">' + esc(right) + '</span>' : '') + '</div>';
  }
  function searchHtml(h) {
    var s = h.spec.search;
    if (!s) return '';
    return '<div class="pmu-msearch"><label class="pmu-msearchwrap"><span class="pmu-ico" aria-hidden="true">' + icon('search') + '</span>' +
      '<input type="text" class="pmu-msearchin" data-pm-hover-exempt="menu" spellcheck="false" autocomplete="off" placeholder="' + esc((s && s.placeholder) || 'Search…') +
      '" value="' + esc(h.query || '') + '" aria-label="' + esc((s && s.placeholder) || 'Search') + '"></label></div>';
  }
  function bodyHtml(h) {
    var spec = h.spec;
    var list = '<div class="pmu-mlist" role="none">' + listHtml(h) + '</div>';
    var foot = spec.foot ? '<p class="pmu-mfoot">' + esc(spec.foot) + '</p>' : '';
    var custom = spec.body ? '<div class="pmu-mcustom"></div>' : '';
    if (spec.rail && spec.rail.length) {
      return headHtml(h) + '<div class="pmu-mlayout">' + railHtml(h) + '<div class="pmu-mmain">' + searchHtml(h) + list + custom + foot + '</div></div>';
    }
    return headHtml(h) + searchHtml(h) + list + custom + foot;
  }

  /* ---- placement: measured untransformed, against the shell box; flips above when the room below is short ---- */
  function place(h) {
    var el = h.el, anchor = h.anchor;
    var host = app.getBoundingClientRect();
    var a = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : h.lastAnchor || { left: host.left + 20, right: host.left + 20, top: host.top + 60, bottom: host.top + 60, width: 0, height: 0 };
    h.lastAnchor = { left: a.left, right: a.right, top: a.top, bottom: a.bottom, width: a.width, height: a.height };
    el.style.left = '0px'; el.style.top = '0px'; el.style.bottom = 'auto'; el.style.maxHeight = ''; el.style.width = h.spec.width ? h.spec.width + 'px' : '';
    var w = Math.min(el.offsetWidth, host.width - 2 * EDGE), natural = el.offsetHeight;
    var below = host.bottom - a.bottom - GAP - EDGE, above = a.top - host.top - GAP - EDGE;
    var side = h.spec.placement === 'above' ? 'above' : h.spec.placement === 'below' ? 'below' : (natural <= below || below >= above ? 'below' : 'above');
    var room = Math.max(120, side === 'below' ? below : above);
    var align = h.spec.align || 'start';
    var left = align === 'end' ? a.right - host.left - w : align === 'center' ? a.left + a.width / 2 - host.left - w / 2 : a.left - host.left;
    left = Math.max(EDGE, Math.min(host.width - w - EDGE, left));
    el.style.width = w + 'px';
    el.style.maxHeight = room + 'px';
    el.style.left = Math.round(left) + 'px';
    if (side === 'below') { el.style.top = Math.round(a.bottom - host.top + GAP) + 'px'; el.style.bottom = 'auto'; }
    else { el.style.top = 'auto'; el.style.bottom = Math.round(host.bottom - a.top + GAP) + 'px'; }
    var ox = Math.max(18, Math.min(w - 18, a.left + a.width / 2 - host.left - left));
    el.style.setProperty('--pmu-mox', Math.round(ox) + 'px');
    el.style.setProperty('--pmu-moy', side === 'below' ? '0px' : '100%');
    el.setAttribute('data-side', side);
    h.side = side;
  }

  /* ---- content changes: the height spring + the size bounce (5.6 Pro portalAnimateHeight + pm56-menu-size-bounce) ---- */
  function morph(h, mutate) {
    var el = h.el;
    var h0 = el.offsetHeight;
    var focusIdx = document.activeElement && el.contains(document.activeElement) ? document.activeElement.getAttribute('data-mi') : null;
    var inSearch = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('pmu-msearchin');
    var caret = inSearch ? document.activeElement.selectionStart : null;
    var scrollTop = h.listEl ? h.listEl.scrollTop : 0;
    mutate();
    wire(h);
    if (inSearch) { var input = el.querySelector('.pmu-msearchin'); if (input) { input.focus(); try { input.setSelectionRange(caret, caret); } catch (e) {} } }
    else if (focusIdx != null) { var again = el.querySelector('.pmu-mitem[data-mi="' + focusIdx + '"]'); if (again) again.focus({ preventScroll: true }); }
    if (h.listEl && !h.resetScroll) h.listEl.scrollTop = scrollTop;
    h.resetScroll = false;
    if (reduced() || !h.settled) return;
    el.style.height = 'auto';
    var h1 = el.offsetHeight;
    if (Math.abs(h1 - h0) < 1) { el.style.height = ''; return; }
    el.classList.remove('pmu-m-spring');
    el.style.height = h0 + 'px';
    void el.offsetHeight;
    el.classList.add('pmu-m-spring');
    el.style.height = h1 + 'px';
    clearTimeout(h.springT);
    h.springT = setTimeout(function () { el.classList.remove('pmu-m-spring'); el.style.height = ''; }, SPRING_MS * speed() + 40);
    if (el.animate) {
      try { el.animate([{ transform: 'scale3d(1,1,1)' }, { transform: 'scale3d(1.012,1.055,1)', offset: 0.4 }, { transform: 'scale3d(1,1,1)' }],
        { duration: 380 * speed(), easing: 'cubic-bezier(.22,1.55,.36,1)' }); } catch (e) {}
    }
  }

  /* ---- events ---- */
  function rowsOf(h) { return Array.prototype.slice.call(h.el.querySelectorAll('.pmu-mitem')); }
  function enabledRows(h) { return rowsOf(h).filter(function (b) { return b.getAttribute('aria-disabled') !== 'true'; }); }
  function focusRow(h, row) { if (row) { row.focus({ preventScroll: false }); } }
  function pick(h, row) {
    if (!row || row.getAttribute('aria-disabled') === 'true') return;
    var r = h.flat[+row.getAttribute('data-mi')];
    if (!r) return;
    if (r.submenu) {
      var next = typeof r.submenu === 'function' ? r.submenu(r) : r.submenu;
      if (next) { h.stack.push({ spec: h.spec, query: h.query, rail: h.rail }); h.spec = next; h.query = ''; h.rail = next.railValue || 'all'; h.resetScroll = true;
        morph(h, function () { h.el.innerHTML = bodyHtml(h); }); focusFirst(h); }
      return;
    }
    var keep = h.spec.keepOpen || r.keepOpen;
    var res;
    try { res = h.spec.onPick ? h.spec.onPick(r.value, r, h) : undefined; } catch (error) { console.error('[pm-usage] menu pick', error); }
    if (!h.open) {   /* the pick itself closed the menu (a view change closes menus): focus still goes back to the trigger */
      if (h.anchor && h.anchor.isConnected && typeof h.anchor.focus === 'function') { try { h.anchor.focus({ preventScroll: true }); } catch (e) {} }
      return;
    }
    if (res === false || (keep && res !== true)) {
      if (h.open && h.spec.refresh !== false) refresh(h);
      return;
    }
    close(h, { focus: true });
  }
  function back(h) {
    var prev = h.stack.pop(); if (!prev) return;
    h.spec = prev.spec; h.query = prev.query; h.rail = prev.rail; h.resetScroll = true;
    morph(h, function () { h.el.innerHTML = bodyHtml(h); });
    focusFirst(h);
  }
  function focusFirst(h) {
    var input = h.el.querySelector('.pmu-msearchin');
    if (input && h.spec.search && h.spec.focusSearch !== false) { input.focus({ preventScroll: true }); return; }
    var rows = enabledRows(h);
    var on = rows.filter(function (b) { return b.classList.contains('active'); })[0];
    focusRow(h, on || rows[0]);
  }
  var typeBuf = '', typeT = 0;
  function onKey(h, event) {
    var key = event.key, el = h.el;
    var rows = enabledRows(h), idx = rows.indexOf(document.activeElement);
    var inSearch = document.activeElement && document.activeElement.classList.contains('pmu-msearchin');
    var inRail = document.activeElement && document.activeElement.classList.contains('pmu-mrailbtn');
    if (key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (h.stack.length) { back(h); return; } close(h, { focus: true }); return; }
    if (key === 'Tab') { close(h, { focus: false }); return; }
    if (inRail) {
      var rbs = Array.prototype.slice.call(el.querySelectorAll('.pmu-mrailbtn')), ri = rbs.indexOf(document.activeElement);
      if (key === 'ArrowDown' || key === 'ArrowUp') { event.preventDefault(); var nb = rbs[(ri + (key === 'ArrowDown' ? 1 : -1) + rbs.length) % rbs.length]; if (nb) { nb.focus(); nb.click(); } return; }
      if (key === 'ArrowRight') { event.preventDefault(); focusRow(h, rows[0]); return; }
      if (key === 'Enter' || key === ' ') { event.preventDefault(); document.activeElement.click(); return; }
      return;
    }
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!rows.length) return;
      var next = key === 'ArrowDown' ? (idx < 0 ? 0 : (idx + 1) % rows.length) : (idx < 0 ? rows.length - 1 : (idx - 1 + rows.length) % rows.length);
      focusRow(h, rows[next]); return;
    }
    if (key === 'Home' && !inSearch) { event.preventDefault(); focusRow(h, rows[0]); return; }
    if (key === 'End' && !inSearch) { event.preventDefault(); focusRow(h, rows[rows.length - 1]); return; }
    if (key === 'ArrowLeft' && !inSearch) {
      var rb = el.querySelector('.pmu-mrailbtn.active') || el.querySelector('.pmu-mrailbtn');
      if (rb) { event.preventDefault(); rb.focus(); return; }
      if (h.stack.length) { event.preventDefault(); back(h); return; }
    }
    if (key === 'ArrowRight' && !inSearch && idx >= 0) {
      var rr = h.flat[+rows[idx].getAttribute('data-mi')];
      if (rr && rr.submenu) { event.preventDefault(); pick(h, rows[idx]); return; }
    }
    if (key === 'Enter' || (key === ' ' && !inSearch)) {
      if (inSearch) { event.preventDefault(); pick(h, rows[0]); return; }
      if (idx >= 0) { event.preventDefault(); pick(h, rows[idx]); }
      return;
    }
    /* type-to-search: printable keys go to the search field; without one, type-ahead jumps to the next matching row */
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !inSearch) {
      var input = el.querySelector('.pmu-msearchin');
      if (input) { input.focus(); return; }
      clearTimeout(typeT); typeBuf += key.toLowerCase(); typeT = setTimeout(function () { typeBuf = ''; }, 600);
      var start = idx + 1, n = rows.length;
      for (var k = 0; k < n; k++) {
        var cand = rows[(start + k) % n], label = (cand.querySelector('.pmu-mcopy b') || cand).textContent.trim().toLowerCase();
        if (label.indexOf(typeBuf) === 0) { focusRow(h, cand); break; }
      }
    }
  }
  function wire(h) {
    h.listEl = h.el.querySelector('.pmu-mlist');
    var input = h.el.querySelector('.pmu-msearchin');
    if (input) input.addEventListener('input', function () {
      h.query = input.value;
      morph(h, function () { h.listEl.innerHTML = listHtml(h); });
    });
    if (h.spec.body) { var c = h.el.querySelector('.pmu-mcustom'); if (c) { try { h.spec.body(c, h); } catch (error) { console.error('[pm-usage] menu body', error); } } }
  }

  /* ---- open / close ---- */
  function open(anchor, spec) {
    if (!app || !spec) return null;
    if (current) close(current, { focus: false, instant: false });
    var el = document.createElement('div');
    el.className = 'pmu-pop pmu-menu' + (spec.className ? ' ' + spec.className : '') + (spec.rail && spec.rail.length ? ' has-rail' : '');
    el.setAttribute('role', 'menu');
    el.setAttribute('data-pm-hover-exempt', 'menu');
    el.setAttribute('data-mid', spec.id || ('m' + (++seq)));
    if (spec.title) el.setAttribute('aria-label', spec.title);
    var h = { el: el, anchor: anchor, spec: spec, query: '', rail: spec.railValue || 'all', stack: [], open: true, settled: false, flat: [] };
    h.close = function (o) { close(h, o); };
    h.update = function (next) { h.spec = next || h.spec; refresh(h); };
    h.refresh = function () { refresh(h); };
    el.innerHTML = bodyHtml(h);
    /* 1. measure untransformed and invisible */
    el.setAttribute('data-mstate', 'measure');
    el.setAttribute('data-mnomo', '');
    el.style.setProperty('--pmu-msp', String(speed()));
    app.appendChild(el);
    wire(h);
    place(h);
    /* 2. arm the closed sprout (no transition), force it, re-enable transitions, force again, release to open */
    if (reduced()) { el.removeAttribute('data-mnomo'); el.setAttribute('data-mstate', 'open'); h.settled = true; }
    else {
      el.setAttribute('data-mstate', 'closed');
      void el.offsetWidth;
      el.removeAttribute('data-mnomo');
      void el.offsetWidth;
      el.setAttribute('data-mstate', 'open');
      el.classList.add('open');
      h.settleT = setTimeout(function () { h.settled = true; }, OPEN_MS * speed() + 40);
    }
    el.classList.add('open');
    if (anchor && anchor.setAttribute) { anchor.setAttribute('aria-expanded', 'true'); anchor.classList.add('pmu-menu-anchor-open'); }
    el.addEventListener('click', function (event) {
      var b = event.target.closest('[data-mback]'); if (b) { back(h); return; }
      var rb = event.target.closest('.pmu-mrailbtn');
      if (rb) { h.rail = rb.getAttribute('data-rail'); h.resetScroll = true; morph(h, function () { el.innerHTML = bodyHtml(h); }); var again = el.querySelector('.pmu-mrailbtn[data-rail="' + h.rail + '"]'); if (again) again.focus({ preventScroll: true }); if (h.spec.onRail) h.spec.onRail(h.rail, h); return; }
      var row = event.target.closest('.pmu-mitem'); if (row) pick(h, row);
    });
    el.addEventListener('keydown', function (event) { onKey(h, event); });
    el.addEventListener('pointerdown', function (event) { event.stopPropagation(); });
    current = h;
    requestAnimationFrame(function () { if (h.open) focusFirst(h); });
    return h;
  }
  function refresh(h) {
    if (!h || !h.open) return;
    morph(h, function () { h.el.innerHTML = bodyHtml(h); });
  }
  function close(h, opts) {
    h = h || current; opts = opts || {};
    if (!h || !h.open) return;
    h.open = false;
    if (current === h) current = null;
    clearTimeout(h.settleT); clearTimeout(h.springT);
    var el = h.el, anchor = h.anchor;
    if (anchor && anchor.setAttribute) { anchor.setAttribute('aria-expanded', 'false'); anchor.classList.remove('pmu-menu-anchor-open'); }
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    if (reduced() || opts.instant) { el.remove(); }
    else {
      /* asymmetric close: the box collapses toward the trigger corner, opaque through most of it */
      el.setAttribute('data-mstate', 'leaving');
      setTimeout(function () { el.remove(); }, CLOSE_MS * speed() + 20);
    }
    if (opts.focus && anchor && anchor.isConnected && typeof anchor.focus === 'function') { try { anchor.focus({ preventScroll: true }); } catch (e) {} }
    if (h.spec.onClose) { try { h.spec.onClose(h); } catch (error) { console.error('[pm-usage] menu close', error); } }
  }
  function toggle(anchor, spec) {
    if (current && current.anchor === anchor && (!spec.id || current.spec.id === spec.id || (current.stack[0] && current.stack[0].spec.id === spec.id))) { close(current, { focus: false }); return null; }
    return open(anchor, spec);
  }
  /* one-question pickers: PMU.menu.choice(anchor, {title, value, options: [{value, label, sub?, right?, disabled?, reason?}], onPick}) */
  function choice(anchor, o) {
    var cur = (o.options || []).filter(function (x) { return x.value === o.value; })[0];
    return toggle(anchor, { id: o.id, title: o.title, current: o.current != null ? o.current : cur ? cur.label : '', align: o.align, width: o.width, foot: o.foot,
      search: o.search, sections: o.sections, rows: o.sections ? undefined : (o.options || []).map(function (x) { return Object.assign({ active: x.value === o.value }, x); }),
      onPick: o.onPick });
  }

  /* outside pointer, scroll of the board, resize and room changes close the open menu */
  document.addEventListener('pointerdown', function (event) {
    if (!current) return;
    var t = event.target;
    if (current.el.contains(t)) return;
    if (current.anchor && current.anchor.contains && current.anchor.contains(t)) return;
    close(current, { focus: false });
  }, true);
  window.addEventListener('resize', function () { if (current) close(current, { instant: true }); });
  var scroller = document.getElementById('pmuScroll');
  if (scroller) scroller.addEventListener('scroll', function () { if (current && !current.spec.keepOnScroll) close(current, { focus: false }); }, { passive: true });

  PMU.menu = { open: open, toggle: toggle, close: function () { if (current) close(current, { focus: false }); }, isOpen: function () { return !!current; },
    current: function () { return current; }, choice: choice };
})();
