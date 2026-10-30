/* PMW.menu: the picker every panels menu uses (the "+" menu, the "+N" list, panel and tab menus, the narrow switcher).
   Ported from the Usage PMU.menu (origin/concept/usage-pm7-20261009: src/js/45-menu.js, src/css/15-menu.css), itself a
   port of the 5.6 Pro chat's menus: the same metrics and keyboard, so every PM dropdown looks alike (Jared, 2026-10-02:
   "Drop down menus should use the chat assistant style drop down menus"). Rendered in #pmw-overlay. It opens and closes
   through the menu sprout, PM6_SPROUT (base/script/pm7-sprout.js; the plate carries pm-sprout; Jared L8 B 2026-10-30:
   one sprout owner for every menu); the levels and the plate's morph between them are this file's.

   open(anchor, spec) -> handle { el, close(), update(spec) }
   spec: { id, title, label (its name when it has no title, for screen readers and the next level's Back control), meta,
           search: true | { placeholder }, sections: [{ label, rows }] | rows, width, align: 'start'|'end',
           at: { x, y } (a context menu), foot, empty, onClose, className,
           onItemClosed() (after a row's close lands; return false to close the menu) }
   row:  { id, label, sub, right, icon, kind (a kind icon), checked (true|false: a check slot), danger, disabled, reason,
           run(info) (info = { alt, row }), alt: { label, icon, run } (the trailing cell: "Open in new panel"),
           links: [{ label, title, run }] (an inline sub-row of plain links), submenu: spec | () => spec,
           picker (its run, or its trailing cell's, opens a picker of its own: File..., Plan or document...),
           keywords, keepOpen, close(row) (renders a close cell instead of alt; may return a Promise),
           action (the typed action id the row dispatches, written to the item as data-ui-action-id) }
   Levels (Jared, 2026-10-15: "you cant go back"): a submenu, and the picker a picker row asks for, open as the next
   level in the same plate, never as a second menu. Every level after the first has a Back control at its head that
   returns to the level before as it was left (its query, its scroll) with focus on the row it was left from. A menu
   opened from a list on the page (the empty panel's launcher, menu.from()) counts that list as its level before: its
   first level has a Back control too, which closes it and puts focus back on the list's row.
   Keyboard: Up/Down (rows and links in reading order; Up from the search field reaches the Back control), Home/End,
   Enter/Space picks, Alt+Enter the trailing cell, Right opens a submenu, Left, Escape or Backspace in an empty search
   field goes back a level (Backspace on a row edits the query first), Escape on the first level closes and returns
   focus, Tab closes, printable keys go to the search field (else type-ahead), Delete on a row with a close cell
   closes that item.
   Anchors: a real control (a button, a tab) or null with `at`. Never the whole centre: a click anywhere in the panels
   would then count as inside, and the menu would never close; open() treats the centre as no anchor. `title` and
   `sections` may be functions, re-read after a row's close cell closes its item. */

var menu = PMW.menu = { current: null, into: null, outer: null };
var MENU_GAP = 6, MENU_EDGE = 8;

menu.close = function (opts) { if (menu.current) menu.current.close(opts); };
menu.isOpen = function () { return !!menu.current; };
/* run fn (a list row's action on the page) so that a menu it opens has that list as its level before:
   outer = { label } names the list for the Back control ("Back to the empty panel") */
menu.from = function (outer, fn) {
  menu.outer = outer || null;
  try { return fn(); } finally { menu.outer = null; }
};

/* a point near the top of the centre, for a menu that has no control to hang from */
function centreTopPoint() {
  var r = state.centre ? state.centre.getBoundingClientRect() : { left: 0, top: 0, width: 360 };
  return { x: r.left + r.width / 2 - 180, y: r.top + 40 };
}
menu.centreTopPoint = centreTopPoint;
function valueOf(x) { return typeof x === 'function' ? x() : x; }
/* is el a connected control that can take focus now? (focus() on a plain div or a hidden node silently does nothing) */
function canFocus(el) {
  if (!el || !el.isConnected || typeof el.focus !== 'function' || el === doc.body) return false;
  if (el.closest && el.closest('[hidden], [inert]')) return false;
  return el.tabIndex >= 0 || el.hasAttribute('tabindex') || /^(BUTTON|INPUT|TEXTAREA|SELECT|A)$/.test(el.tagName);
}

menu.open = function (anchor, spec) {
  // a picker row's run asks for its picker while its menu is still open (pick() below): the picker is that menu's next
  // level, and it keeps the menu's anchor and place
  var into = menu.into, outer = menu.outer;
  menu.into = null;
  menu.outer = null;
  if (into && into === menu.current && !into.closed) { into.descend(spec.at ? Object.assign({}, spec, { at: null }) : spec); return into; }
  if (anchor && anchor === state.centre) anchor = null;
  if (!anchor && !spec.at) spec = Object.assign({}, spec, { at: centreTopPoint() });
  var opener = doc.activeElement;   // focus goes back here when the anchor cannot take it
  if (menu.current) {
    // its own control closes a menu at any level: the first level's id is the menu's
    var cur = menu.current, rootId = (cur.stack.length ? cur.stack[0].spec : cur.spec).id;
    var same = cur.anchor === anchor && rootId && spec.id === rootId;
    cur.close({ instant: true, keepFocus: true });
    if (same) return null;
  }
  var hnd = { anchor: anchor, spec: spec, stack: [], el: null, closed: false, outer: outer, back: null, picking: null };
  // aria-expanded and the open tint belong to a menu button, not to a context menu opened at a point
  var marksAnchor = !!(anchor && anchor.setAttribute && !spec.at);
  /* hover: rows opt into the merged hover engine (data-pmh="row"); hover TAGS stay off the rows with
     data-pm-hover-visual-suppressed (data-pm-hover-exempt would also take the rows out of the hover engine) */
  var el = hnd.el = h('div', { class: 'pmw-menu pmw-pop pm-sprout' + (spec.className ? ' ' + spec.className : ''), role: 'menu', tabindex: '-1',
    'data-pm-hover-visual-suppressed': 'true', 'data-pmh': 'off', 'data-portal-display': 'flex', 'aria-label': valueOf(spec.title) || spec.label || 'Menu' });
  // measured at its full size: the labels' widths are read from their boxes (place()), which the closed scale would shrink
  el.style.transform = 'none';
  overlay().appendChild(el);
  /* a level is its parts, the plate's children it rendered (head, search field, list, foot); the levels it can go back
     to stay in the plate after it, parked (data-lv="park"), so going back is a reveal and never a render. The
     level on show always comes first, so the plate's first head, field and list are its own */
  hnd.parts = [];
  var partsAt = null;
  function part(x) { el.insertBefore(x, partsAt); hnd.parts.push(x); return x; }
  hnd.render = function (sp, keepQuery) {
    var q = keepQuery && hnd.search ? hnd.search.value : '';
    hnd.parts.forEach(function (x) { x.remove(); });
    hnd.parts = [];
    partsAt = el.firstChild;
    hnd.items = [];
    hnd.search = null;
    hnd.titleEl = null;
    hnd.back = null;
    var title = valueOf(sp.title), before = levelBefore();
    el.setAttribute('aria-label', title || sp.label || 'Menu');
    if (title || before) {
      var head = h('div', { class: 'pmw-mhead' + (before ? ' has-back' : '') });
      if (before) head.appendChild(hnd.back = backControl(before));
      head.appendChild(hnd.titleEl = h('strong', { text: title || '' }));
      if (sp.meta) head.appendChild(h('span', { class: 'pmw-mmeta', text: sp.meta }));
      part(head);
    }
    if (sp.search) {
      var wrap = h('label', { class: 'pmw-msearch' }, [icon('search', { size: 14 })]);
      // the field says which list it filters, so a screen reader hears the level it arrived in
      hnd.search = h('input', { type: 'text', class: 'pmw-msearchin', placeholder: (sp.search && sp.search.placeholder) || 'Type to filter', 'aria-label': title ? 'Filter: ' + title : 'Filter', spellcheck: 'false', autocomplete: 'off', 'data-pm-hover-visual-suppressed': 'true' });
      hnd.search.value = q;
      wrap.appendChild(hnd.search);
      part(wrap);
      hnd.search.addEventListener('input', function () { fill(sp, hnd.search.value); });
      hnd.search.addEventListener('keydown', onKey);
    }
    hnd.list = part(h('div', { class: 'pmw-mlist', role: 'none' }));
    if (sp.foot) part(h('p', { class: 'pmw-mfoot', text: sp.foot }));
    fill(sp, q, true);   // its callers place or morph the plate once it is built
  };
  /* the name of the level before this one ("New tab or panel", "the empty panel"); null on a first level */
  function levelBefore() {
    if (hnd.stack.length) { var prev = hnd.stack[hnd.stack.length - 1].spec; return valueOf(prev.title) || prev.label || 'the menu before'; }
    return hnd.outer ? hnd.outer.label || 'the list' : null;
  }
  function canGoBack() { return !!(hnd.stack.length || hnd.outer); }
  /* the Back control: the chevron and the word, the level it returns to in its name and its hover tag */
  function backControl(to) {
    var b = h('button', { type: 'button', class: 'pmw-mback', role: 'menuitem', tabindex: '-1', 'aria-label': 'Back to ' + to,
      'data-pm-hover-label': 'Back to ' + to, 'data-pm-hover-detail': PMW.isMac ? 'Esc or Delete' : 'Esc or Backspace' },
      [h('span', { class: 'pmw-mbackchev', 'aria-hidden': 'true' }, [icon('chevronLeft', { size: 14 })]), h('span', { class: 'pmw-mbackword', text: 'Back' })]);
    b.addEventListener('click', function () { goBack(); });
    return b;
  }
  function matches(row, q) {
    if (!q) return true;
    var hay = [row.label, row.sub, row.keywords, row.right].concat((row.links || []).map(function (l) { return l.label; })).join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) >= 0; });
  }
  function fill(sp, q, noMorph) {
    var list = hnd.list;
    list.textContent = '';
    hnd.items = [];
    var sections = valueOf(sp.sections) || [{ rows: sp.rows || [] }];
    if (typeof sp.filter === 'function' && q) sections = sp.filter(q) || sections;
    var any = false;
    sections.forEach(function (sec, si) {
      var rows = (sec.rows || []).filter(function (r) { return r === '-' || matches(r, q); });
      if (q) rows = rows.filter(function (r) { return r !== '-'; });
      while (rows.length && rows[0] === '-') rows.shift();
      while (rows.length && rows[rows.length - 1] === '-') rows.pop();
      if (!rows.length) return;
      if (any && !sec.label) list.appendChild(h('div', { class: 'pmw-mdiv', role: 'separator' }));
      if (sec.label) list.appendChild(h('div', { class: 'pmw-msec', role: 'presentation', text: sec.label }));
      any = true;
      rows.forEach(function (r) {
        if (r === '-') { list.appendChild(h('div', { class: 'pmw-mdiv', role: 'separator' })); return; }
        list.appendChild(buildRow(r));
      });
    });
    if (!any) list.appendChild(h('p', { class: 'pmw-mempty', text: sp.empty || 'Nothing matches.' }));
    if (hnd.placed && !noMorph) morph();
  }
  function buildRow(r) {
    var row = h('div', { class: 'pmw-mrow' + (r.alt || r.close ? ' has-cell' : ''), 'data-pmh': r.disabled ? 'off' : 'row' });
    var main = h('button', { type: 'button', class: 'pmw-mitem pmw-cur' + (r.disabled ? ' is-disabled' : '') + (r.danger ? ' is-danger' : '') + (r.submenu ? ' has-sub' : '') + (r.current ? ' is-current' : ''),
      role: r.checked != null ? 'menuitemcheckbox' : 'menuitem', tabindex: '-1' });
    if (r.checked != null) main.setAttribute('aria-checked', r.checked ? 'true' : 'false');
    if (r.action) main.setAttribute('data-ui-action-id', r.action);
    if (r.disabled) main.setAttribute('aria-disabled', 'true');
    if (r.icon || r.kind) {
      var lead = h('span', { class: 'pmw-mlead' });
      lead.appendChild(r.kind ? kindIcon(r.kind) : icon(r.icon, { size: 14 }));
      main.appendChild(lead);
    } else if (r.checked != null) {
      main.appendChild(h('span', { class: 'pmw-mlead pmw-mcheck' + (r.checked ? ' on' : '') }, [icon('check', { size: 14 })]));
    }
    var copy = h('span', { class: 'pmw-mcopy' }, [h('b', { text: r.label })]);
    if (r.sub || (r.disabled && r.reason)) copy.appendChild(h('span', { text: r.disabled && r.reason ? r.reason : r.sub }));
    main.appendChild(copy);
    if (r.right) main.appendChild(h('span', { class: 'pmw-mright', text: PMW.keyLabel(r.right) }));
    if (r.submenu) main.appendChild(h('span', { class: 'pmw-mchev' }, [icon('chevronRight', { size: 14 })]));
    if (r.hover) main.setAttribute('data-pm-hover-label', r.hover);
    else main.setAttribute('data-pm-hover-visual-suppressed', 'true');
    main.addEventListener('click', function (e) { pick(r, { alt: e.altKey }); });
    main._pmwRow = r;
    row.appendChild(main);
    hnd.items.push(main);
    if (r.alt) {
      var cell = h('button', { type: 'button', class: 'pmw-mcell', tabindex: '-1', 'aria-label': (r.alt.label || 'Open in new panel') + ': ' + r.label,
        'data-pm-hover-label': r.alt.label || 'Open in new panel', 'data-pm-hover-detail': PMW.keyLabel('Alt+Enter') }, [icon(r.alt.icon || 'newPanel', { size: 14 })]);
      cell.addEventListener('click', function (e) { e.stopPropagation(); if (!r.disabled && !hnd.closed) runAlt(r); });
      cell._pmwAltOf = main;
      row.appendChild(cell);
    } else if (r.close) {
      var cl = h('button', { type: 'button', class: 'pmw-mcell pmw-mclose', tabindex: '-1', 'aria-label': 'Close ' + r.label, 'data-pm-hover-label': 'Close' }, [icon('close', { size: 12 })]);
      cl.addEventListener('click', function (e) { e.stopPropagation(); closeItem(r); });
      row.appendChild(cl);
    }
    var wrapEl = row;
    if (r.links && r.links.length) {
      wrapEl = h('div', { class: 'pmw-mgroup' }, [row]);
      var lr = h('div', { class: 'pmw-mlinks' });
      r.links.forEach(function (lk, i) {
        var a = h('button', { type: 'button', class: 'pmw-mlink pmw-cur', role: 'menuitem', tabindex: '-1', text: lk.label });
        if (lk.title) a.setAttribute('data-pm-hover-label', lk.title);
        a.addEventListener('click', function (e) { if (hnd.closed) return; close({ returnFocus: false }); lk.run({ alt: e.altKey }); restoreFocus(); });
        a._pmwLink = lk;
        // a separator travels with the link after it, so a wrapped sub-row never ends on a dangling dot
        if (i) lr.appendChild(h('span', { class: 'pmw-mlinkpair', role: 'none' }, [h('span', { class: 'pmw-mlinksep', 'aria-hidden': 'true', text: '·' }), a]));
        else lr.appendChild(a);
        hnd.items.push(a);
      });
      wrapEl.appendChild(lr);
    }
    return wrapEl;
  }
  /* re-read the spec (sections and title may be functions) and keep focus near where it was */
  function refill(at) {
    var inSearch = hnd.search && doc.activeElement === hnd.search;
    fill(hnd.spec, hnd.search ? hnd.search.value : '');
    var title = valueOf(hnd.spec.title);
    if (hnd.titleEl && title != null) hnd.titleEl.textContent = title;
    if (title) el.setAttribute('aria-label', title);
    if (inSearch) return;
    if (!hnd.items.length && hnd.search) { hnd.search.focus({ preventScroll: true }); return; }
    focusIndex(Math.min(at || 0, Math.max(0, hnd.items.length - 1)));
  }
  /* a row's close cell or Delete: the close may ask first (canClose) and lands a microtask later, so refresh after it */
  function closeItem(r) {
    var at = hnd.focusAt || 0;
    Promise.resolve(r.close(r)).then(function () {
      if (hnd.closed) return;
      if (typeof hnd.spec.onItemClosed === 'function' && hnd.spec.onItemClosed() === false) { close({}); return; }
      refill(at);
    });
  }
  /* after a pick: an action that moved focus keeps it; otherwise focus goes back to the control the menu came from, so
     a keyboard user is never dropped on <body> when the menu's buttons go away */
  function restoreFocus() {
    var a = doc.activeElement;
    if (a && a !== doc.body && a !== doc.documentElement && !el.contains(a)) return;
    returnFocus();
  }
  function returnFocus() {
    var targets = [anchor, opener];
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      if (!canFocus(t) || el.contains(t)) continue;
      try { t.focus({ preventScroll: true }); } catch (_) {}
      if (doc.activeElement === t) return;
    }
    if (state.layout && PMW.focusPanelDom) PMW.focusPanelDom(state.layout.view.focus);
  }
  function pick(r, info) {
    if (r.disabled || hnd.closed) return;
    if (r.submenu) { descend(typeof r.submenu === 'function' ? r.submenu() : r.submenu, r); return; }
    if (r.picker) { runPicker(r, function () { r.run({ alt: !!(info && info.alt), row: r }); }); return; }
    if (!r.keepOpen) close({ returnFocus: false });
    if (r.run) r.run({ alt: !!(info && info.alt), row: r });
    if (r.keepOpen) { hnd.render(hnd.spec, true); morph(); focusFirst(); }
    else restoreFocus();
  }
  function runAlt(r) {
    if (r.picker) { runPicker(r, function () { r.alt.run({ row: r }); }); return; }
    close({ returnFocus: false });
    r.alt.run({ row: r });
    restoreFocus();
  }
  /* a picker row: the picker its run asks for opens as this menu's next level (menu.open hands it to descend while
     menu.into is this menu); a run that opened none (a tab opened at once) closes the menu as any row does */
  function runPicker(r, fn) {
    var depth = hnd.stack.length;
    menu.into = hnd;
    hnd.picking = r;
    try { fn(); }
    finally { if (menu.into === hnd) menu.into = null; hnd.picking = null; }
    if (hnd.closed || hnd.stack.length > depth) return;
    close({ returnFocus: false });
    restoreFocus();
  }
  /* the next level. The one it leaves is parked as it stands (its query, its filtered rows, its scroll, its place and
     size) with the row it was left from, so Back reveals it rather than building and measuring it again */
  function descend(sub, from) {
    if (!sub || hnd.closed) return;
    var st = el.style;
    var lv = { spec: hnd.spec, from: from && from.id != null ? from.id : null, label: el.getAttribute('aria-label'),
      scroll: hnd.list ? hnd.list.scrollTop : 0,
      parts: hnd.parts, items: hnd.items, search: hnd.search, list: hnd.list, titleEl: hnd.titleEl, back: hnd.back,
      at: { left: st.left, top: st.top, width: st.width, maxHeight: st.maxHeight, side: el.getAttribute('data-side'),
        box: { left: parseFloat(st.left) || 0, top: parseFloat(st.top) || 0, width: parseFloat(st.width) || el.offsetWidth, height: lastH || el.offsetHeight } } };
    hnd.stack.push(lv);
    var leaving = hnd.parts;
    hnd.parts = [];   // parked, not render()'s to remove
    lv.widths = level(sub, 'fwd', { leaving: leaving, enter: function () { hnd.render(sub); } });
    focusFirst();
  }
  hnd.descend = function (sub) { descend(sub, hnd.picking); };
  /* back a level, as it was left, with focus on the row it was left from; on the first level Back closes the menu and
     focus goes home (the launcher's row, the "+" button) */
  function goBack() {
    if (hnd.closed) return;
    if (!hnd.stack.length) { close({}); return; }
    var lv = hnd.stack.pop();
    // a level whose rows are read live (a function) reads them again, in case something changed while it was parked,
    // and is measured again; any other comes back exactly where and as it was
    var live = typeof lv.spec.sections === 'function';
    level(lv.spec, 'back', {
      leaving: hnd.parts, width: lv.at.width, to: live ? null : lv.at, widths: lv.widths,
      enter: function () {
        lv.parts.forEach(function (x) {
          x.removeAttribute('data-lv');
          x.removeAttribute('aria-hidden');
          // the widths it was parked with hold it while the plate morphs back; a level measured again lets them go
          if (live) { x.style.width = ''; x.style.boxSizing = ''; }
        });
        hnd.parts = lv.parts; hnd.items = lv.items; hnd.search = lv.search; hnd.list = lv.list; hnd.titleEl = lv.titleEl; hnd.back = lv.back;
        el.setAttribute('aria-label', lv.label);
        if (live) fill(lv.spec, hnd.search ? hnd.search.value : '', true);
      },
      // (the list's scroll survives parking; it is put back only where it was not at the top)
      settle: lv.scroll ? function () { if (hnd.list) hnd.list.scrollTop = lv.scroll; } : null
    });
    var at = -1;
    for (var i = 0; lv.from != null && i < hnd.items.length; i++) {
      if (hnd.items[i]._pmwRow && hnd.items[i]._pmwRow.id === lv.from) { at = i; break; }
    }
    // the row is where it was left: focus it without scrolling the plate mid-morph
    if (at >= 0) focusIndex(at, true); else focusFirst();
  }
  /* One level gives way to another in the same plate. The level that leaves keeps its own nodes where they stand (lifted
     out of the flow, never detached, so nothing is styled or bound again) and leaves toward the side it lies on, while
     the new one comes in from the other and the plate morphs to its size; then the old parts are parked (a level that
     can be returned to) or dropped. When the plate's width changes the new parts hold their final widths on the way,
     so no row reflows. A part's state is one attribute, data-lv (in-fwd, in-back, out-fwd, out-back, park), and every
     state sets only properties nothing inherits: a class or an inherited property (visibility, pointer-events) would
     restyle every row under the part against the whole page's rules, some 10 ms a list. Per look in 30-menu.css;
     Reduced Motion swaps at once. */
  var ghost = null, ghostTimer = 0, locked = [], entering = [];
  var LIFT = ['position', 'left', 'top', 'height', 'margin'];
  function settleGhost() {
    clearTimeout(ghostTimer);
    if (ghost) {
      var g = ghost;
      ghost = null;
      g.parts.forEach(function (x) {
        LIFT.forEach(function (k) { x.style[k] = ''; });
        // a parked part keeps its width, so its rows keep their layout and come back without one
        if (g.park) x.setAttribute('data-lv', 'park');
        else x.remove();
      });
    }
    entering.forEach(function (x) { x.removeAttribute('data-lv'); });
    entering = [];
    locked.forEach(function (c) { c.style.width = ''; c.style.boxSizing = ''; });
    locked = [];
    el.removeAttribute('data-mlevel');
  }
  /* lifts the leaving parts out of the flow where they stand and returns their widths (null when nothing moves) */
  function leave(parts, park) {
    parts.forEach(function (x) { x.setAttribute('aria-hidden', 'true'); });
    if (!hnd.placed || reducedMotion()) {
      if (!park) { parts.forEach(function (x) { x.remove(); }); return null; }
      var ws = parts.map(function (x) { return x.offsetWidth; });
      parts.forEach(function (x, i) { x.style.boxSizing = 'border-box'; x.style.width = ws[i] + 'px'; x.setAttribute('data-lv', 'park'); });
      return null;
    }
    // read every box, then write them: one layout
    var boxes = parts.map(function (x) { return [x.offsetLeft, x.offsetTop, x.offsetWidth, x.offsetHeight]; });
    parts.forEach(function (x, i) {
      var b = boxes[i], st = x.style;
      st.position = 'absolute'; st.left = b[0] + 'px'; st.top = b[1] + 'px'; st.width = b[2] + 'px'; st.height = b[3] + 'px';
      st.margin = '0'; st.boxSizing = 'border-box';
    });
    ghost = { parts: parts, park: park };
    return boxes.map(function (b) { return b[2]; });
  }
  /* o: { leaving (the parts that go), enter() (puts the new level in: renders it, or unparks the one returned to),
     width (the plate's width to measure the new level at), to (a parked level's own place and size: no measuring),
     widths (that level's part widths, so holding them costs no layout), settle() (puts back what the level held, its
     scroll, once the plate has its final size and again when the morph ends: a plate that changed size on the way may
     have clamped it) } -> the leaving parts' widths, or null */
  function level(sp, dir, o) {
    var from = box();
    settleGhost();
    var gone = leave(o.leaving, dir === 'fwd');
    hnd.spec = sp;
    if (o.width != null) el.style.width = o.width;
    o.enter();
    morph(from, function (a, b) {
      if (o.settle) o.settle();
      // a level returned to still holds the widths it was parked with; a new one holds its own while the plate resizes
      if (o.to) { locked = hnd.parts.slice(); return; }
      if (!gone || Math.abs(a.width - b.width) <= 2) return;
      var kids = hnd.parts.slice(), ws = kids.map(function (c) { return c.offsetWidth; });
      kids.forEach(function (c, i) { c.style.boxSizing = 'border-box'; c.style.width = ws[i] + 'px'; });
      locked = kids;
    }, o.to);
    if (o.settle && morphAnim) morphAnim.finished.then(function () { if (!hnd.closed) o.settle(); }, function () {});
    if (!gone) { locked.forEach(function (c) { c.style.width = ''; c.style.boxSizing = ''; }); locked = []; return null; }
    el.setAttribute('data-mlevel', dir);   // the plate clips the parts on their way (30-menu.css)
    ghost.parts.forEach(function (x) { x.setAttribute('data-lv', 'out-' + dir); });
    entering = hnd.parts.slice();
    entering.forEach(function (x) { x.setAttribute('data-lv', 'in-' + dir); });
    ghostTimer = setTimeout(settleGhost, 480);
    return gone;
  }
  function focusIndex(i, noScroll) {
    var items = hnd.items;
    if (!items.length) { el.focus({ preventScroll: true }); return; }
    var n = items.length;
    i = ((i % n) + n) % n;
    items[i].focus({ preventScroll: !!noScroll });
    hnd.focusAt = i;
  }
  function focusFirst() {
    if (hnd.search && hnd.spec.search && hnd.spec.focusSearch !== false) { hnd.search.focus({ preventScroll: true }); return; }
    var idx = 0;
    for (var i = 0; i < hnd.items.length; i++) if (hnd.items[i].classList.contains('is-current')) { idx = i; break; }
    focusIndex(idx);
  }
  var typeBuf = '', typeTimer = 0;
  function onKey(e) {
    if (hnd.closed) return;   // a closing menu is dead to keys (a second Enter would run the row again)
    var items = hnd.items;
    var i = items.indexOf(doc.activeElement);
    var inSearch = doc.activeElement === hnd.search;
    var onBack = !!hnd.back && doc.activeElement === hnd.back;
    // the order is the Back control, the search field, then the rows
    if (e.key === 'ArrowDown') { e.preventDefault(); if (onBack && hnd.search) hnd.search.focus(); else focusIndex(i < 0 ? 0 : i + 1); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (onBack) return;
      if (inSearch) { if (hnd.back) hnd.back.focus(); return; }
      if (i <= 0 && hnd.search) hnd.search.focus();
      else if (i === 0 && hnd.back) hnd.back.focus();
      else focusIndex(i < 0 ? items.length - 1 : i - 1);
      return;
    }
    if (e.key === 'Home' && !inSearch) { e.preventDefault(); focusIndex(0); return; }
    if (e.key === 'End' && !inSearch) { e.preventDefault(); focusIndex(items.length - 1); return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (hnd.stack.length) goBack(); else close({}); return; }
    // Tab: focus goes back to the menu button and the browser's own Tab moves on from there (WAI-ARIA menu button)
    if (e.key === 'Tab') { close({}); return; }
    if (e.key === 'ArrowRight' && i >= 0 && items[i]._pmwRow && items[i]._pmwRow.submenu) { e.preventDefault(); pick(items[i]._pmwRow); return; }
    if (e.key === 'ArrowLeft' && canGoBack() && !inSearch) { e.preventDefault(); goBack(); return; }
    /* Backspace: in an empty search field it goes back a level (a held key that has just emptied the field does not:
       only a fresh press); on a row it edits the query when there is one, else goes back */
    if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var query = hnd.search ? hnd.search.value : '';
      if (inSearch) { if (!query && canGoBack() && !e.repeat) { e.preventDefault(); goBack(); } return; }
      if (query) {
        e.preventDefault();
        hnd.search.focus();
        hnd.search.value = query.slice(0, -1);
        hnd.search.dispatchEvent(new Event('input'));
        return;
      }
      if (canGoBack() && !e.repeat) { e.preventDefault(); goBack(); }
      return;
    }
    if (onBack && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goBack(); return; }
    if (e.key === 'Enter' || (e.key === ' ' && !inSearch)) {
      var target = inSearch ? items[0] : items[i];
      if (!target) return;
      e.preventDefault();
      if (target._pmwLink) { close({ returnFocus: false }); target._pmwLink.run({ alt: e.altKey }); restoreFocus(); return; }
      var r = target._pmwRow;
      if (e.altKey && r.alt) { if (r.disabled) return; runAlt(r); return; }
      pick(r, { alt: e.altKey });
      return;
    }
    if ((e.key === 'Delete') && i >= 0 && items[i]._pmwRow && items[i]._pmwRow.close) {
      e.preventDefault();
      closeItem(items[i]._pmwRow);
      return;
    }
    if (!inSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (hnd.search) { hnd.search.focus(); return; }
      typeBuf += e.key.toLowerCase();
      clearTimeout(typeTimer);
      typeTimer = setTimeout(function () { typeBuf = ''; }, 600);
      for (var k = 1; k <= items.length; k++) {
        var cand = items[((i < 0 ? -1 : i) + k) % items.length];
        if ((cand.textContent || '').trim().toLowerCase().indexOf(typeBuf) === 0) { cand.focus(); break; }
      }
    }
  }
  el.addEventListener('keydown', function (e) { if (e.target !== hnd.search) onKey(e); });
  // a leaving or parked level takes no clicks (it is not given pointer-events: none, which every row under it would
  // inherit and be restyled for): a click on it stops here, before its controls see it
  el.addEventListener('click', function (e) {
    if (e.target === el || hnd.parts.some(function (x) { return x.contains(e.target); })) return;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  function place() {
    var vw = doc.documentElement.clientWidth, vh = doc.documentElement.clientHeight;
    el.style.maxHeight = '';
    // a spec without a width takes its widest row (from minWidth up to 420 px), so its own labels are never cut
    var width = hnd.spec.width || Math.min(Math.max(el.offsetWidth, hnd.spec.minWidth || 220), 420);
    el.style.width = width + 'px';
    if (!hnd.spec.width) {
      // the measured width can come out a few px short of a row's label (a font still settling, sub-pixel text): widen
      // by what the longest label still lacks, up to the same 420 px
      var lack = 0;
      // (measured on the text itself: scrollWidth rounds, and a label 0.4 px too wide still gets its ellipsis)
      var rng = doc.createRange();
      // this level's labels only (a parked or leaving level is not measured)
      var labels = (hnd.titleEl ? [hnd.titleEl] : []).concat(hnd.list ? Array.prototype.slice.call(hnd.list.querySelectorAll('.pmw-mcopy b')) : []);
      labels.forEach(function (b) {
        if (!b.firstChild) return;
        rng.selectNodeContents(b);
        lack = Math.max(lack, rng.getBoundingClientRect().width - b.getBoundingClientRect().width);
      });
      if (lack > 0 && width < 420) { width = Math.min(420, Math.ceil(width + lack + 1)); el.style.width = width + 'px'; }
    }
    // a leaving level's parts overflow the plate on their way out: the new level's height is its parts' then
    var natural = ghost ? partsHeight() : el.scrollHeight;
    var ar;
    var at = hnd.spec.at || spec.at || (anchor && anchor.isConnected ? null : centreTopPoint());
    if (at) ar = { left: at.x, right: at.x, top: at.y, bottom: at.y, width: 0 };
    else ar = anchor.getBoundingClientRect();
    var below = vh - ar.bottom - MENU_GAP - MENU_EDGE, above = ar.top - MENU_GAP - MENU_EDGE;
    var up = natural > below && above > below;
    var room = Math.max(120, up ? above : below);
    // as tall as its rows when the window has the room; it scrolls only when the side it opens on is really short
    var maxH = Math.min(vh - 2 * MENU_EDGE, room);
    el.style.maxHeight = maxH + 'px';
    var x = hnd.spec.align === 'end' ? ar.right - width : ar.left;
    x = clamp(x, MENU_EDGE, vw - width - MENU_EDGE);
    var hgt = Math.min(natural, maxH);
    var y = up ? ar.top - MENU_GAP - hgt : ar.bottom + MENU_GAP;
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
    el.setAttribute('data-side', up ? 'above' : 'below');
    hnd.from = at ? { x: at.x, y: at.y } : anchor;   // what the sprout grows out of
    hnd.placed = true;
    if (hnd.list) tidyLinkRows(hnd.list);
  }
  function partsHeight() {
    var cs = getComputedStyle(el), sum = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    hnd.parts.forEach(function (x) { var xs = getComputedStyle(x); sum += x.offsetHeight + parseFloat(xs.marginTop) + parseFloat(xs.marginBottom); });
    return sum;
  }
  var lastH = 0, morphAnim = null;
  /* where the plate stands now: mid-morph, where the morph has it; else its last placed height (rows just refilled have
     already changed its natural height) */
  function box() {
    var running = !!morphAnim && morphAnim.playState === 'running';
    return { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: running || !lastH ? el.offsetHeight : lastH };
  }
  /* the plate moves from its box before (from, else where it stands now) to the box its rows need: height, and for a
     level its width and place too (a menu that opens above keeps its bottom edge). beforeMove runs once the new box is
     measured and before anything moves. A morph cut short is measured from where it had got to. */
  function morph(from, beforeMove, to) {
    if (!hnd.placed) return;
    var a = from || box();
    if (morphAnim) { morphAnim.cancel(); morphAnim = null; }
    var b;
    if (to) {
      // a level returned to takes back the place and size it had: nothing it is measured from changed while it was parked
      var st = el.style;
      st.maxHeight = to.maxHeight; st.width = to.width; st.left = to.left; st.top = to.top;
      el.setAttribute('data-side', to.side || 'below');
      b = to.box;
    } else {
      place();
      b = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
    }
    lastH = b.height;
    if (beforeMove) beforeMove(a, b);
    var k0 = {}, k1 = {}, moved = false;
    ['height', 'width', 'left', 'top'].forEach(function (p) {
      if (Math.abs(a[p] - b[p]) > 2) { k0[p] = a[p] + 'px'; k1[p] = b[p] + 'px'; moved = true; }
    });
    if (moved) morphAnim = motion.animate(el, [k0, k1], { dur: 220, easing: motion.ease('slide') });
  }
  function onOutside(e) {
    if (el.contains(e.target) || (anchor && anchor.contains && anchor.contains(e.target))) return;
    close({ returnFocus: false });
  }
  function onResize() { close({ instant: true, returnFocus: false }); }
  function close(opts) {
    opts = opts || {};
    if (hnd.closed) return;
    hnd.closed = true;
    if (menu.current === hnd) menu.current = null;
    doc.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onResize);
    if (marksAnchor) { anchor.setAttribute('aria-expanded', 'false'); anchor.classList.remove('pmw-anchor-open'); }
    if (opts.returnFocus !== false && !opts.keepFocus && el.contains(doc.activeElement)) returnFocus();
    clearTimeout(ghostTimer);
    // every level the menu still holds is closing with it
    hnd.stack.map(function (lv) { return lv.spec; }).concat([hnd.spec]).forEach(function (sp, i, all) {
      if (sp.onClose && all.indexOf(sp) === i) try { sp.onClose(); } catch (_) {}
    });
    if (opts.instant || reducedMotion()) { el.remove(); return; }
    // leaving: no keys, no clicks and no focus while the sprout folds back
    try { el.inert = true; } catch (_) {}
    window.PM6_SPROUT.close(el, function () { el.remove(); });
  }
  hnd.close = close;
  hnd.update = function (sp) { hnd.spec = sp; hnd.render(sp, true); morph(); };
  try { hnd.render(spec); place(); }
  catch (err) { el.remove(); throw err; }   // a bad spec never leaves an invisible menu in the overlay
  lastH = el.offsetHeight;
  if (marksAnchor) { anchor.setAttribute('aria-expanded', 'true'); anchor.classList.add('pmw-anchor-open'); }
  el.style.transform = '';
  window.PM6_SPROUT.open(el, null, hnd.from);
  menu.current = hnd;
  setTimeout(function () { if (!hnd.closed) doc.addEventListener('pointerdown', onOutside, true); }, 0);
  window.addEventListener('resize', onResize);
  focusFirst();
  return hnd;
};

/* A row of inline links that wraps (the Terminal row's installed shells, D39, or Dashboard's boards) starts its new
   line with a link, never with the dot: each separator travels with the link after it (so no line ends on a dot), and
   a link that begins a line hides its dot and gets a line break before it, so it cannot climb back onto the line above
   without one. Measured after layout: the menu's place(), the launcher's render and its resize. */
function tidyLinkRows(root) {
  qsa('.pmw-mlinks', root).forEach(function (lr) {
    qsa('.pmw-mlinkbr', lr).forEach(function (b) { b.remove(); });
    qsa('.pmw-mlinksep', lr).forEach(function (sep) { if (sep.style.display) sep.style.display = ''; });
    var prevTop = null;
    Array.prototype.slice.call(lr.children).forEach(function (c) {
      var top = c.offsetTop;
      var sep = c.classList.contains('pmw-mlinkpair') ? c.querySelector('.pmw-mlinksep') : null;
      if (sep && prevTop != null && top > prevTop + 2) {
        lr.insertBefore(h('span', { class: 'pmw-mlinkbr', 'aria-hidden': 'true' }), c);
        sep.style.display = 'none';
        top = c.offsetTop;
      }
      prevTop = top;
    });
  });
}
PMW.tidyLinkRows = tidyLinkRows;

/* one-line prompt inside a menu-styled popover (rename, save layout) */
menu.prompt = function (anchor, o) {
  var hnd = menu.open(anchor, { id: 'prompt', title: o.title, rows: [], width: 280, className: 'pmw-mprompt' });
  if (!hnd) return;
  var input = h('input', { type: 'text', class: 'pmw-msearchin pmw-mpromptin', value: o.value || '', 'aria-label': o.title, spellcheck: 'false', autocomplete: 'off', maxlength: o.maxLength || null, 'data-pm-hover-visual-suppressed': 'true' });
  var row = h('div', { class: 'pmw-mpromptrow' }, [input]);
  var btns = h('div', { class: 'pmw-mpromptbtns' }, [
    h('button', { type: 'button', class: 'pmw-btn', text: 'Cancel', onclick: function () { hnd.close({}); } }),
    h('button', { type: 'button', class: 'pmw-btn pmw-btn-primary', text: o.ok || 'Save', onclick: function () { submit(); } })
  ]);
  var promptList = h('div', { class: 'pmw-mlist' }, [row, btns]);
  hnd.list.replaceWith(promptList);
  hnd.parts[hnd.parts.indexOf(hnd.list)] = promptList;
  hnd.list = promptList;
  function submit() { var v = input.value; hnd.close({}); o.done(v); }
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hnd.close({}); }
    e.stopPropagation();
  });
  setTimeout(function () { input.focus(); input.select(); }, 0);
  return hnd;
};

/* toasts: one quiet line at the bottom of the centre (no pill, no side stripe) */
var toastEl = null, toastTimer = 0;
PMW.toast = function (text) {
  if (!toastEl) { toastEl = h('div', { class: 'pmw-toast', role: 'status', 'aria-live': 'polite', hidden: true }); overlay().appendChild(toastEl); }
  toastEl.textContent = text;
  toastEl.hidden = false;
  var c = state.centre && state.centre.getBoundingClientRect();
  if (c) { toastEl.style.left = Math.round(c.left + c.width / 2) + 'px'; toastEl.style.top = Math.round(c.bottom - 56) + 'px'; }
  motion.animate(toastEl, [{ opacity: 0, transform: 'translate(-50%, 6px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { dur: 180 });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
};
PM_HOME.toast = PMW.toast;
