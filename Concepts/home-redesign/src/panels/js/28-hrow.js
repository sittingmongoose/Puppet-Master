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
  function actionEl(a) {
    var b = h('button', { type: 'button', class: 'pmw-hbtn' + (a.primary ? ' is-primary' : '') + (a.danger ? ' is-danger' : ''), 'data-id': a.id,
      'aria-label': a.label + (a.shortcut ? ' (' + PMW.keyLabel(a.shortcut) + ')' : ''), 'data-pm-hover-label': a.label,
      'data-pm-hover-detail': a.detail || (a.shortcut ? PMW.keyLabel(a.shortcut) : ''), 'data-pmh': 'icon' });
    if (a.icon) b.appendChild(icon(a.icon, { size: 14 }));
    b.appendChild(h('span', { class: 'pmw-hbtn-label', text: a.label }));
    if (a.pressed != null) b.setAttribute('aria-pressed', a.pressed ? 'true' : 'false');
    if (a.disabled) b.setAttribute('aria-disabled', 'true');
    if (a.menu) b.setAttribute('aria-haspopup', 'menu');
    b.addEventListener('click', function (e) {
      if (b.getAttribute('aria-disabled') === 'true') return;
      if (a.menu) { PMW.menu.open(b, typeof a.menu === 'function' ? toSpec(a.menu()) : toSpec(a.menu)); return; }
      if (a.run) a.run(e, b);
    });
    actionEls[a.id] = { el: b, spec: a };
    return b;
  }
  function toSpec(m) { return Array.isArray(m) ? { id: 'hrow-menu', rows: m, width: 260, align: 'end' } : m; }
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
      var a = Object.assign(rec.spec, patch);
      var fresh = actionEl(a);
      rec.el.replaceWith(fresh);
    },
    action: function (id) { return actionEls[id] ? actionEls[id].el : null; }
  };
};
