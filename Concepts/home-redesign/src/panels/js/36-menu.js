/* PMW.menu: the picker every panels menu uses (the "+" menu, the "+N" list, panel and tab menus, the narrow switcher).
   Ported from the Usage PMU.menu (origin/concept/usage-pm7-20261009: src/js/45-menu.js, src/css/15-menu.css), itself a
   port of the 5.6 Pro chat's menus: the same metrics, keyboard and corner sprout, so every PM dropdown looks alike
   (Jared, 2026-10-02: "Drop down menus should use the chat assistant style drop down menus"). Rendered in #pmw-overlay.

   open(anchor, spec) -> handle { el, close(), update(spec) }
   spec: { id, title, meta, search: true | { placeholder }, sections: [{ label, rows }] | rows, width, align: 'start'|'end',
           at: { x, y } (a context menu), foot, empty, onClose, className,
           onItemClosed() (after a row's close lands; return false to close the menu) }
   row:  { id, label, sub, right, icon, kind (a kind icon), checked (true|false: a check slot), danger, disabled, reason,
           run(info) (info = { alt, row }), alt: { label, icon, run } (the trailing cell: "Open in new panel"),
           links: [{ label, title, run }] (an inline sub-row of plain links), submenu: spec | () => spec,
           keywords, keepOpen, close(row) (renders a close cell instead of alt; may return a Promise) }
   Keyboard: Up/Down (rows and links in reading order), Home/End, Enter/Space picks, Alt+Enter the trailing cell,
   Right opens a submenu, Left or Escape goes back, Escape closes and returns focus, Tab closes, printable keys go to
   the search field (else type-ahead), Delete on a row with a close cell closes that item.
   Anchors: a real control (a button, a tab) or null with `at`. Never the whole centre: a click anywhere in the panels
   would then count as inside, and the menu would never close; open() treats the centre as no anchor. `title` and
   `sections` may be functions, re-read after a row's close cell closes its item. */

var menu = PMW.menu = { current: null };
var MENU_GAP = 6, MENU_EDGE = 8;

menu.close = function (opts) { if (menu.current) menu.current.close(opts); };
menu.isOpen = function () { return !!menu.current; };

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
  if (anchor && anchor === state.centre) anchor = null;
  if (!anchor && !spec.at) spec = Object.assign({}, spec, { at: centreTopPoint() });
  var opener = doc.activeElement;   // focus goes back here when the anchor cannot take it
  if (menu.current) {
    var same = menu.current.anchor === anchor && menu.current.spec.id && spec.id === menu.current.spec.id;
    menu.current.close({ instant: true, keepFocus: true });
    if (same) return null;
  }
  var hnd = { anchor: anchor, spec: spec, stack: [], el: null, closed: false };
  // aria-expanded and the open tint belong to a menu button, not to a context menu opened at a point
  var marksAnchor = !!(anchor && anchor.setAttribute && !spec.at);
  /* hover: rows opt into the merged hover engine (data-pmh="row"); hover TAGS stay off the rows with
     data-pm-hover-visual-suppressed (data-pm-hover-exempt would also take the rows out of the hover engine) */
  var el = hnd.el = h('div', { class: 'pmw-menu pmw-pop' + (spec.className ? ' ' + spec.className : ''), role: 'menu', tabindex: '-1',
    'data-pm-hover-visual-suppressed': 'true', 'data-pmh': 'off', 'data-mstate': 'measure', 'aria-label': valueOf(spec.title) || spec.label || 'Menu' });
  overlay().appendChild(el);
  hnd.render = function (sp, keepQuery) {
    var q = keepQuery && hnd.search ? hnd.search.value : '';
    el.textContent = '';
    hnd.items = [];
    hnd.search = null;
    hnd.titleEl = null;
    var title = valueOf(sp.title);
    if (title || hnd.stack.length) {
      var head = h('div', { class: 'pmw-mhead' });
      if (hnd.stack.length) {
        var back = h('button', { type: 'button', class: 'pmw-mback', 'aria-label': 'Back', tabindex: '-1' }, [icon('chevronLeft', { size: 14 })]);
        back.addEventListener('click', function () { goBack(); });
        head.appendChild(back);
      }
      head.appendChild(hnd.titleEl = h('strong', { text: title || '' }));
      if (sp.meta) head.appendChild(h('span', { class: 'pmw-mmeta', text: sp.meta }));
      el.appendChild(head);
    }
    if (sp.search) {
      var wrap = h('label', { class: 'pmw-msearch' }, [icon('search', { size: 14 })]);
      hnd.search = h('input', { type: 'text', class: 'pmw-msearchin', placeholder: (sp.search && sp.search.placeholder) || 'Type to filter', 'aria-label': 'Filter', spellcheck: 'false', autocomplete: 'off', 'data-pm-hover-visual-suppressed': 'true' });
      hnd.search.value = q;
      wrap.appendChild(hnd.search);
      el.appendChild(wrap);
      hnd.search.addEventListener('input', function () { fill(sp, hnd.search.value); });
      hnd.search.addEventListener('keydown', onKey);
    }
    hnd.list = h('div', { class: 'pmw-mlist', role: 'none' });
    el.appendChild(hnd.list);
    if (sp.foot) el.appendChild(h('p', { class: 'pmw-mfoot', text: sp.foot }));
    fill(sp, q);
  };
  function matches(row, q) {
    if (!q) return true;
    var hay = [row.label, row.sub, row.keywords, row.right].concat((row.links || []).map(function (l) { return l.label; })).join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) >= 0; });
  }
  function fill(sp, q) {
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
    if (hnd.placed) morph();
  }
  function buildRow(r) {
    var row = h('div', { class: 'pmw-mrow' + (r.alt || r.close ? ' has-cell' : ''), 'data-pmh': r.disabled ? 'off' : 'row' });
    var main = h('button', { type: 'button', class: 'pmw-mitem pmw-cur' + (r.disabled ? ' is-disabled' : '') + (r.danger ? ' is-danger' : '') + (r.submenu ? ' has-sub' : '') + (r.current ? ' is-current' : ''),
      role: r.checked != null ? 'menuitemcheckbox' : 'menuitem', tabindex: '-1' });
    if (r.checked != null) main.setAttribute('aria-checked', r.checked ? 'true' : 'false');
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
      cell.addEventListener('click', function (e) { e.stopPropagation(); if (!r.disabled && !hnd.closed) { close({ returnFocus: false }); r.alt.run({ row: r }); restoreFocus(); } });
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
        if (i) lr.appendChild(h('span', { class: 'pmw-mlinksep', 'aria-hidden': 'true', text: '·' }));
        var a = h('button', { type: 'button', class: 'pmw-mlink pmw-cur', role: 'menuitem', tabindex: '-1', text: lk.label });
        if (lk.title) a.setAttribute('data-pm-hover-label', lk.title);
        a.addEventListener('click', function (e) { if (hnd.closed) return; close({ returnFocus: false }); lk.run({ alt: e.altKey }); restoreFocus(); });
        a._pmwLink = lk;
        lr.appendChild(a);
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
    if (r.submenu) {
      var sub = typeof r.submenu === 'function' ? r.submenu() : r.submenu;
      hnd.stack.push(hnd.spec);
      hnd.spec = sub;
      hnd.render(sub);
      morph();
      focusFirst();
      return;
    }
    if (!r.keepOpen) close({ returnFocus: false });
    if (r.run) r.run({ alt: !!(info && info.alt), row: r });
    if (r.keepOpen) { hnd.render(hnd.spec, true); focusFirst(); }
    else restoreFocus();
  }
  function goBack() {
    if (!hnd.stack.length) { close({}); return; }
    hnd.spec = hnd.stack.pop();
    hnd.render(hnd.spec);
    morph();
    focusFirst();
  }
  function focusIndex(i) {
    var items = hnd.items;
    if (!items.length) { el.focus({ preventScroll: true }); return; }
    var n = items.length;
    i = ((i % n) + n) % n;
    items[i].focus({ preventScroll: false });
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
    if (e.key === 'ArrowDown') { e.preventDefault(); focusIndex(i < 0 ? 0 : i + 1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0 && hnd.search) hnd.search.focus(); else focusIndex(i < 0 ? items.length - 1 : i - 1); return; }
    if (e.key === 'Home' && !inSearch) { e.preventDefault(); focusIndex(0); return; }
    if (e.key === 'End' && !inSearch) { e.preventDefault(); focusIndex(items.length - 1); return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (hnd.stack.length) goBack(); else close({}); return; }
    // Tab: focus goes back to the menu button and the browser's own Tab moves on from there (WAI-ARIA menu button)
    if (e.key === 'Tab') { close({}); return; }
    if (e.key === 'ArrowRight' && i >= 0 && items[i]._pmwRow && items[i]._pmwRow.submenu) { e.preventDefault(); pick(items[i]._pmwRow); return; }
    if (e.key === 'ArrowLeft' && hnd.stack.length && !inSearch) { e.preventDefault(); goBack(); return; }
    if (e.key === 'Enter' || (e.key === ' ' && !inSearch)) {
      var target = inSearch ? items[0] : items[i];
      if (!target) return;
      e.preventDefault();
      if (target._pmwLink) { close({ returnFocus: false }); target._pmwLink.run({ alt: e.altKey }); restoreFocus(); return; }
      var r = target._pmwRow;
      if (e.altKey && r.alt) { if (r.disabled) return; close({ returnFocus: false }); r.alt.run({ row: r }); restoreFocus(); return; }
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
  function place() {
    var vw = doc.documentElement.clientWidth, vh = doc.documentElement.clientHeight;
    el.style.maxHeight = '';
    var width = hnd.spec.width || Math.min(Math.max(el.offsetWidth, 220), 420);
    el.style.width = width + 'px';
    var natural = el.scrollHeight;
    var ar;
    var at = hnd.spec.at || spec.at || (anchor && anchor.isConnected ? null : centreTopPoint());
    if (at) ar = { left: at.x, right: at.x, top: at.y, bottom: at.y, width: 0 };
    else ar = anchor.getBoundingClientRect();
    var below = vh - ar.bottom - MENU_GAP - MENU_EDGE, above = ar.top - MENU_GAP - MENU_EDGE;
    var up = natural > below && above > below;
    var room = Math.max(120, up ? above : below);
    var maxH = Math.min(Math.round(vh * 0.7), 520, room);
    el.style.maxHeight = maxH + 'px';
    var x = hnd.spec.align === 'end' ? ar.right - width : ar.left;
    x = clamp(x, MENU_EDGE, vw - width - MENU_EDGE);
    var hgt = Math.min(natural, maxH);
    var y = up ? ar.top - MENU_GAP - hgt : ar.bottom + MENU_GAP;
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
    el.setAttribute('data-side', up ? 'above' : 'below');
    var ox = clamp((ar.left + ar.width / 2) - x, 18, width - 18);
    el.style.setProperty('--pmw-mox', ox + 'px');
    el.style.setProperty('--pmw-moy', up ? '100%' : '0%');
    hnd.placed = true;
  }
  var lastH = 0;
  function morph() {
    if (!hnd.placed) return;
    var before = lastH || el.offsetHeight;
    place();
    var after = el.offsetHeight;
    lastH = after;
    if (Math.abs(before - after) > 2) motion.animate(el, [{ height: before + 'px' }, { height: after + 'px' }], { dur: 220, easing: motion.ease('slide') });
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
    if (hnd.spec.onClose) try { hnd.spec.onClose(); } catch (_) {}
    if (opts.instant || reducedMotion()) { el.remove(); return; }
    // leaving: no keys, no clicks and no focus for the 200 ms the fade takes
    try { el.inert = true; } catch (_) {}
    el.setAttribute('data-mstate', 'leaving');
    setTimeout(function () { el.remove(); }, 200 * motion.speed() + 20);
  }
  hnd.close = close;
  hnd.update = function (sp) { hnd.spec = sp; hnd.render(sp, true); morph(); };
  try { hnd.render(spec); place(); }
  catch (err) { el.remove(); throw err; }   // a bad spec never leaves an invisible menu in the overlay
  lastH = el.offsetHeight;
  if (marksAnchor) { anchor.setAttribute('aria-expanded', 'true'); anchor.classList.add('pmw-anchor-open'); }
  el.setAttribute('data-mstate', 'closed');
  void el.offsetWidth;
  el.setAttribute('data-mstate', 'open');
  menu.current = hnd;
  setTimeout(function () { if (!hnd.closed) doc.addEventListener('pointerdown', onOutside, true); }, 0);
  window.addEventListener('resize', onResize);
  focusFirst();
  return hnd;
};

/* one-line prompt inside a menu-styled popover (rename, save layout) */
menu.prompt = function (anchor, o) {
  var hnd = menu.open(anchor, { id: 'prompt', title: o.title, rows: [], width: 280, className: 'pmw-mprompt' });
  if (!hnd) return;
  var input = h('input', { type: 'text', class: 'pmw-msearchin pmw-mpromptin', value: o.value || '', 'aria-label': o.title, spellcheck: 'false', autocomplete: 'off', 'data-pm-hover-visual-suppressed': 'true' });
  var row = h('div', { class: 'pmw-mpromptrow' }, [input]);
  var btns = h('div', { class: 'pmw-mpromptbtns' }, [
    h('button', { type: 'button', class: 'pmw-btn', text: 'Cancel', onclick: function () { hnd.close({}); } }),
    h('button', { type: 'button', class: 'pmw-btn pmw-btn-primary', text: o.ok || 'Save', onclick: function () { submit(); } })
  ]);
  hnd.list.replaceWith(h('div', { class: 'pmw-mlist' }, [row, btns]));
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
