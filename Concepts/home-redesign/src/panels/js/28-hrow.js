/* The shared header row (CONTRACT section 5, D12): one component for every kind that needs a row of controls above
   its content, so terminals, browsers, plan viewers and the rest look and behave alike. 30 px tall; 24 px targets with
   12 px text; labels show while the body is at least 520 px wide, icons with hover tags below that; the row hides
   while the body is under 150 px tall (CSS container queries on pmw-body). */

PMW.headerRow = function (entry, spec) {
  spec = spec || {};
  var left = h('div', { class: 'pmw-hrow-left' });
  var acts = h('div', { class: 'pmw-hrow-actions' });
  var row = h('div', { class: 'pmw-hrow', role: 'toolbar', 'aria-label': spec.label || 'Tab controls' }, [left, acts]);
  var actionEls = {};
  function fillLeft(items) {
    left.textContent = '';
    (items || []).forEach(function (it) {
      if (!it) return;
      var el = h('span', { class: 'pmw-hfact' + (it.mono ? ' is-mono' : '') + (it.strong ? ' is-strong' : '') + (it.dim ? ' is-dim' : ''), 'data-id': it.id || null });
      if (it.icon) el.appendChild(icon(it.icon, { size: 13 }));
      if (it.el) el.appendChild(it.el);
      else el.appendChild(h('span', { class: 'pmw-hfact-t', text: it.text || '' }));
      if (it.title) el.setAttribute('data-pm-hover-label', it.title);
      left.appendChild(el);
    });
  }
  /* everything a spec says about its button; setAction re-runs it on the same node, so the button keeps focus, its
     place in the Tab order and any menu hanging from it (replacing the node dropped focus to <body>) */
  function paint(b, a) {
    // toggles, not className: the hover engine and an open menu put their own classes on the button
    b.classList.add('pmw-hbtn');
    b.classList.toggle('is-primary', !!a.primary);
    b.classList.toggle('is-danger', !!a.danger);
    b.setAttribute('aria-label', a.label + (a.shortcut ? ' (' + PMW.keyLabel(a.shortcut) + ')' : ''));
    b.setAttribute('data-pm-hover-label', a.label);
    b.setAttribute('data-pm-hover-detail', a.detail || (a.shortcut ? PMW.keyLabel(a.shortcut) : ''));
    b.textContent = '';
    if (a.icon) b.appendChild(icon(a.icon, { size: 14 }));
    b.appendChild(h('span', { class: 'pmw-hbtn-label', text: a.label }));
    setAttr(b, 'aria-pressed', a.pressed != null ? (a.pressed ? 'true' : 'false') : null);
    setAttr(b, 'aria-disabled', a.disabled ? 'true' : null);
    setAttr(b, 'aria-haspopup', a.menu ? 'menu' : null);
  }
  function actionEl(a) {
    var b = h('button', { type: 'button', class: 'pmw-hbtn', 'data-id': a.id, 'data-pmh': 'icon' });
    var rec = { el: b, spec: a };
    paint(b, a);
    b.addEventListener('click', function (e) {
      var cur = rec.spec;   // read at click time: setAction patches the spec in place
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
    actionEls[a.id] = rec;
    return b;
  }
  function fillActions(list) {
    acts.textContent = '';
    actionEls = {};
    (list || []).forEach(function (a) { if (a) acts.appendChild(actionEl(a)); });
  }
  fillLeft(spec.left);
  fillActions(spec.actions);
  return {
    el: row,
    set: function (s) { if (s.left) fillLeft(s.left); if (s.actions) fillActions(s.actions); },
    setAction: function (id, patch) {
      var rec = actionEls[id];
      if (!rec) return;
      paint(rec.el, Object.assign(rec.spec, patch));
    },
    action: function (id) { return actionEls[id] ? actionEls[id].el : null; }
  };
};
