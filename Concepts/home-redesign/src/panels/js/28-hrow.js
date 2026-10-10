/* The shared header row (CONTRACT section 5, D12): one component for every kind that needs a row of controls above
   its content, so terminals, browsers, plan viewers and the rest look and behave alike. 30 px tall; 24 px targets with
   12 px text; labels show while the body is at least 520 px wide, icons with hover tags below that (or below the row's
   own spec.labelsAt); the row hides while the body is under 150 px tall (CSS container queries on pmw-body).

     api.headerRow({ label, left: [fact], actions: [action], labelsAt }) -> { el, set(spec), setAction(id, patch), action(id) }
     fact:   { id, text | el, icon, title, detail, mono, strong, dim, grow (takes the free width: .pmw-hfact.is-grow) }
             title and detail are the fact's hover tag (data-pm-hover-label from title, or from text when only a detail
             is given; data-pm-hover-detail from detail); an el is drawn in place of text either way
     action: { id, label, icon, shortcut, detail, primary, danger, pressed, disabled, run(e, button), menu }
             or { id, el }: a ready-made element adopted into the actions area as it is (never cloned or restyled)
     labelsAt: px of the tab body's width below which the buttons go icon-only (the row carries .is-icons, and
             .is-labels at or above it); without it the 520 px container rule decides

   set() patches in place: a fact or a button whose id survives keeps its node (so focus, hover and a menu hanging from
   it stay), and only what changed is created or removed. Nodes a kind put into the row by hand are left where they are. */

PMW.headerRow = function (entry, spec) {
  spec = spec || {};
  var left = h('div', { class: 'pmw-hrow-left' });
  var acts = h('div', { class: 'pmw-hrow-actions' });
  var row = h('div', { class: 'pmw-hrow', role: 'toolbar', 'aria-label': spec.label || 'Tab controls' }, [left, acts]);
  var factEls = {}, factList = [];       // id -> fact wrapper; the wrappers this row placed, in order
  var actionEls = {}, actionList = [];   // id -> { el, spec, adopted }; the buttons this row placed, in order

  /* put `els` into `box` in that order: what the row placed before and no longer wants leaves, a node is moved only
     when it is out of order, and nodes a kind added by hand stay */
  function reconcile(box, els, before) {
    before.forEach(function (n) { if (els.indexOf(n) < 0 && n.parentNode === box) box.removeChild(n); });
    // moving a node blurs whatever has focus inside it: a kept button that only changed place takes its focus back
    var active = doc.activeElement, held = active && box.contains(active) ? active : null;
    var prev = null;
    els.forEach(function (n) {
      var inPlace = n.parentNode === box && (!prev || !!(prev.compareDocumentPosition(n) & 4));   // 4: FOLLOWING
      if (!inPlace) box.insertBefore(n, prev ? prev.nextSibling : box.firstChild);
      prev = n;
    });
    if (held && held.isConnected && doc.activeElement !== held) { try { held.focus({ preventScroll: true }); } catch (_) {} }
  }
  /* the icon slot and the content node of a fact or a button, swapped only when they change */
  function setIcon(el, name, size) {
    name = name || null;
    if (el._pmwIcon === name && (!name || (el._pmwIconEl && el._pmwIconEl.parentNode === el))) return;
    if (el._pmwIconEl && el._pmwIconEl.parentNode === el) el.removeChild(el._pmwIconEl);
    el._pmwIconEl = name ? icon(name, { size: size }) : null;
    if (el._pmwIconEl) el.insertBefore(el._pmwIconEl, el.firstChild);
    el._pmwIcon = name;
  }
  function setContent(el, node) {
    if (el._pmwContent === node && node.parentNode === el) return;
    if (el._pmwContent && el._pmwContent !== node && el._pmwContent.parentNode === el) el.removeChild(el._pmwContent);
    el.appendChild(node);
    el._pmwContent = node;
  }

  /* ---- facts (left) ---- */
  function paintFact(el, it) {
    // toggles, not className: a kind may tag its own facts
    el.classList.add('pmw-hfact');
    el.classList.toggle('is-mono', !!it.mono);
    el.classList.toggle('is-strong', !!it.strong);
    el.classList.toggle('is-dim', !!it.dim);
    el.classList.toggle('is-grow', !!it.grow);
    setAttr(el, 'data-id', it.id != null ? String(it.id) : null);
    var tagLabel = it.title != null && it.title !== '' ? String(it.title) : it.detail && it.text != null && it.text !== '' ? String(it.text) : null;
    setAttr(el, 'data-pm-hover-label', tagLabel);
    setAttr(el, 'data-pm-hover-detail', it.detail != null && it.detail !== '' ? String(it.detail) : null);
    setIcon(el, it.icon, 13);
    var node;
    if (it.el && it.el.nodeType === 1) node = it.el;
    else {
      node = el._pmwText || (el._pmwText = h('span', { class: 'pmw-hfact-t' }));
      setText(node, it.text);
    }
    setContent(el, node);
  }
  function fillLeft(items) {
    var next = {}, els = [];
    (items || []).forEach(function (it) {
      if (!it) return;
      var key = it.id != null ? String(it.id) : null;
      var el = key != null && !next[key] ? factEls[key] : null;
      if (!el) el = h('span', { class: 'pmw-hfact' });
      paintFact(el, it);
      if (key != null && !next[key]) next[key] = el;
      els.push(el);
    });
    reconcile(left, els, factList);
    factEls = next;
    factList = els;
  }

  /* ---- actions ---- */
  /* everything a spec says about its button, patched on the same node: the button keeps focus, its place in the Tab
     order and any menu hanging from it (replacing the node dropped focus to <body>) */
  function paint(b, a) {
    // toggles, not className: the hover engine and an open menu put their own classes on the button
    b.classList.add('pmw-hbtn');
    b.classList.toggle('is-primary', !!a.primary);
    b.classList.toggle('is-danger', !!a.danger);
    var label = a.label == null ? '' : String(a.label);
    var key = a.shortcut ? PMW.keyLabel(a.shortcut) : '';
    setAttr(b, 'data-id', a.id != null ? String(a.id) : null);
    setAttr(b, 'aria-label', label + (key ? ' (' + key + ')' : ''));
    setAttr(b, 'data-pm-hover-label', label);
    // a menu button with nothing else to say names what it holds (with no detail the page's tag controller fills in
    // "Choose this option")
    setAttr(b, 'data-pm-hover-detail', a.detail || key || (a.menu ? menuWords(a.menu) : '') || null);
    setIcon(b, a.icon, 14);
    var lab = b._pmwText || (b._pmwText = h('span', { class: 'pmw-hbtn-label' }));
    setText(lab, label);
    setContent(b, lab);
    setAttr(b, 'aria-pressed', a.pressed != null ? (a.pressed ? 'true' : 'false') : null);
    setAttr(b, 'aria-disabled', a.disabled ? 'true' : null);
    setAttr(b, 'aria-haspopup', a.menu ? 'menu' : null);
  }
  function menuWords(m) {
    var v;
    try { v = typeof m === 'function' ? m() : m; } catch (_) { return 'Opens a menu'; }
    var rows = [];
    if (Array.isArray(v)) rows = v;
    else if (v) {
      var secs = typeof v.sections === 'function' ? v.sections() : v.sections;
      if (Array.isArray(secs)) secs.forEach(function (sec) { rows = rows.concat(sec && sec.rows || []); });
      else rows = typeof v.rows === 'function' ? v.rows() : (v.rows || []);
    }
    var names = (rows || []).filter(function (r) { return r && typeof r === 'object' && r.label && !r.disabled; }).map(function (r) { return String(r.label).replace(/\.\.\.$|\u2026$/, ''); });
    if (!names.length) return 'Opens a menu';
    return names.slice(0, 3).join(', ') + (names.length > 3 ? ' and more' : '');
  }
  function actionEl(a) {
    var b = h('button', { type: 'button', class: 'pmw-hbtn', 'data-pmh': 'icon' });
    var rec = { el: b, spec: a, adopted: false };
    paint(b, a);
    b.addEventListener('click', function (e) {
      var cur = rec.spec;   // read at click time: set() and setAction() patch the spec
      if (b.getAttribute('aria-disabled') === 'true') return;
      if (cur.menu) {
        // the same mapping as api.menu (CONTRACT 4 items, PMW.menu rows or a whole spec), toggling on this button
        var v = typeof cur.menu === 'function' ? cur.menu() : cur.menu;
        var own = v && !Array.isArray(v) ? v : {};
        kindMenu(entry, v, b, { align: own.align || 'end', width: own.width || 260 });
        return;
      }
      if (cur.run) cur.run(e, b);
    });
    return rec;
  }
  function isEl(x) { return !!x && x.nodeType === 1; }
  function fillActions(list) {
    var next = {}, els = [], recs = [];
    (list || []).forEach(function (a) {
      if (!a) return;
      var key = a.id != null ? String(a.id) : null;
      var rec = key != null && !next[key] ? actionEls[key] : null;
      if (isEl(a.el)) {
        if (rec && rec.adopted && rec.el === a.el) rec.spec = a;
        else rec = { el: a.el, spec: a, adopted: true };
      } else if (rec && !rec.adopted) {
        rec.spec = a;
        paint(rec.el, a);
      } else rec = actionEl(a);
      if (key != null && !next[key]) next[key] = rec;
      els.push(rec.el);
      recs.push(rec);
    });
    var gone = actionList.filter(function (n) { return els.indexOf(n) < 0; });
    var active = doc.activeElement;
    var hadFocus = gone.some(function (n) { return n === active || n.contains(active); });
    // a menu hanging from a button that leaves closes with it
    var cur = PMW.menu && PMW.menu.current;
    if (cur && cur.anchor && gone.indexOf(cur.anchor) >= 0) PMW.menu.close({ returnFocus: false });
    reconcile(acts, els, actionList);
    actionEls = next;
    actionList = els;
    // focus that sat on a button that left stays in the tab instead of falling to the page
    if (hadFocus && (!doc.activeElement || doc.activeElement === doc.body)) {
      var to = els.filter(function (n) { return n.isConnected && n.getAttribute('aria-disabled') !== 'true'; })[0] || (entry && entry.host);
      if (to) { try { to.focus({ preventScroll: true }); } catch (_) {} }
    }
  }
  function swapAdopted(rec, el) {
    var old = rec.el;
    if (old === el) return;
    if (old.parentNode === acts) acts.replaceChild(el, old); else acts.appendChild(el);
    rec.el = el;
    var i = actionList.indexOf(old);
    if (i >= 0) actionList[i] = el;
  }

  /* ---- labels below spec.labelsAt: a class on the row, kept by a ResizeObserver on the tab body ---- */
  var labelsAt = null, observer = null, iconsNow = null;
  function applyLabels() {
    if (labelsAt == null) { row.classList.remove('is-icons', 'is-labels'); iconsNow = null; return; }
    var w = entry && entry.host ? entry.host.clientWidth : 0;
    if (!w) return;   // hidden: keep what it was until it has a width again
    var icons = w < labelsAt;
    if (icons === iconsNow) return;
    iconsNow = icons;
    row.classList.toggle('is-icons', icons);
    row.classList.toggle('is-labels', !icons);
  }
  function setLabelsAt(v) {
    labelsAt = typeof v === 'number' && isFinite(v) && v >= 0 ? v : null;
    iconsNow = null;
    if (labelsAt != null && !observer && typeof ResizeObserver === 'function' && entry && entry.host) {
      observer = new ResizeObserver(applyLabels);
      observer.observe(entry.host);
      if (entry.off) entry.off.push(function () { if (observer) observer.disconnect(); observer = null; });
    }
    applyLabels();
  }

  fillLeft(spec.left);
  fillActions(spec.actions);
  if (spec.labelsAt != null) setLabelsAt(spec.labelsAt);
  return {
    el: row,
    set: function (s) {
      s = s || {};
      if (s.left) fillLeft(s.left);
      if (s.actions) fillActions(s.actions);
      if (Object.prototype.hasOwnProperty.call(s, 'labelsAt')) setLabelsAt(s.labelsAt);
      if (s.label) row.setAttribute('aria-label', s.label);
    },
    setAction: function (id, patch) {
      var rec = actionEls[id];
      if (!rec || !patch) return;
      Object.assign(rec.spec, patch);
      if (rec.adopted) { if (isEl(patch.el)) swapAdopted(rec, patch.el); }
      else paint(rec.el, rec.spec);
    },
    action: function (id) { return actionEls[id] ? actionEls[id].el : null; }
  };
};
