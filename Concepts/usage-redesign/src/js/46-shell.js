/* The rail, the head and the popovers (owner: engine; ARCHITECTURE.md section 4.10, DESIGN-SPEC sections 2.1 and 16).
   Room, range, scope and detail are local view state: each change is one view action, never a command (R-SHELL-08). */
(function () {
  var st = PMU.core.state;
  var app = document.getElementById('pmuApp');
  var nav = document.getElementById('pmuNav'), ink = document.getElementById('pmuNavInk');
  var inkCtl = null, inkReady = false, popEl = null;
  var SCOPES = [['all', 'All current usage', 'Every configured route'], ['work', 'Work accounts', 'Company and team credentials'],
    ['personal', 'Personal accounts', 'Personal plans and keys']].concat(DATA.providers.map(function (p) { return ['provider:' + p.id, p.name + ' only', 'Only ' + p.name + ' records']; }));

  function scopeLabel(scope) {
    var row = SCOPES.filter(function (s) { return s[0] === scope; })[0];
    return row ? row[1] : 'Validated Usage scope';
  }
  function syncInk(animate) {
    if (!inkCtl && window.PM6_LIQUID_INK && nav && ink) {
      try { inkCtl = window.PM6_LIQUID_INK.attach({ strip: nav, ink: ink, axis: 'v', getActive: function () { return nav.querySelector('.pmu-navbtn[data-room].active'); } }); } catch (error) { inkCtl = null; }
    }
    if (!inkCtl) return;
    requestAnimationFrame(function () { try { inkCtl.resync(!!animate && inkReady); inkReady = true; } catch (error) {} });
  }
  function render() {
    if (!app) return;
    var room = ROOM[st.room] ? st.room : 'overview';
    app.setAttribute('data-room', room);
    PMU.core.$$('.pmu-navbtn[data-room]', app).forEach(function (button) {
      var chosen = button.getAttribute('data-room') === room;
      button.classList.toggle('active', chosen);
      if (chosen) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    var title = document.getElementById('pmuRoomTitle'), desc = document.getElementById('pmuRoomDesc');
    if (title && title.textContent !== ROOM[room].title) title.textContent = ROOM[room].title;   /* one text node (NieR decode) */
    if (desc) desc.textContent = ROOM[room].desc;
    PMU.core.$$('.pmu-range button[data-range]', app).forEach(function (button) {
      var on = button.getAttribute('data-range') === st.range;
      button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var detail = document.getElementById('pmuDetailLabel'); if (detail) detail.textContent = DETAIL[st.detail].label;
    var scope = document.getElementById('pmuScopeLabel'); if (scope) scope.textContent = scopeLabel(st.scope);
    var count = document.getElementById('pmuPanelCount'); if (count && PMU.board) count.textContent = t('head.panels', { n: PMU.board.visible(room).length });
    syncInk(true);
  }
  function setView(patch, source) {
    var changed = Object.keys(patch).filter(function (k) { return patch[k] !== undefined && st[k] !== patch[k]; });
    if (!changed.length) return false;
    var roomChange = changed.indexOf('room') >= 0, prevRoom = st.room;
    changed.forEach(function (k) { st[k] = patch[k]; });
    var type = roomChange ? 'view.usage.room_selected' : 'view.usage.' + changed[0] + '_selected';
    var payload = { source: source || 'head' }; changed.forEach(function (k) { payload[k] = patch[k]; });
    viewAction(type, payload);
    render();
    if (PMU.board) {
      if (roomChange || changed.indexOf('detail') >= 0) PMU.board.mount(st.room, { dir: roomChange && ROOM_ORDER.indexOf(st.room) < ROOM_ORDER.indexOf(prevRoom) ? -1 : 1 });
      else PMU.board.refresh(changed[0]);
      PMU.board.persist();
    }
    if (changed.indexOf('detail') >= 0) PMU.shell.toast(t('toast.detail', { level: DETAIL[st.detail].label, n: PMU.board ? PMU.board.visible(st.room).length : 0 }));
    return true;
  }
  var ROOM_ORDER = Object.keys(ROOM);
  function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
  function pop(anchor, spec) {
    closePop();
    popEl = document.createElement('div');
    popEl.className = 'pmu-pop open';
    popEl.setAttribute('role', 'menu');
    popEl.innerHTML = (spec.title ? '<div class="pmu-poptitle">' + esc(spec.title) + '</div>' : '') + spec.rows.map(function (r) {
      return '<button type="button" class="pmu-poprow' + (r.active ? ' active' : '') + '" role="menuitem" data-value="' + esc(r.value) + '"' + (r.disabled ? ' aria-disabled="true"' : '') + '>' +
        '<span class="pmu-poptext"><b>' + esc(r.label) + '</b>' + (r.sub ? '<span>' + esc(r.sub) + '</span>' : '') + '</span>' + (r.active ? PMU.icon('check', 'pmu-popcheck') : '') + '</button>';
    }).join('');
    app.appendChild(popEl);
    var a = anchor.getBoundingClientRect(), host = app.getBoundingClientRect();
    popEl.style.top = (a.bottom - host.top + 6) + 'px';
    popEl.style.left = Math.max(8, Math.min(host.width - popEl.offsetWidth - 8, (spec.align === 'left' ? a.left : a.right - popEl.offsetWidth) - host.left)) + 'px';
    popEl.addEventListener('click', function (event) {
      var row = event.target.closest('.pmu-poprow'); if (!row || row.getAttribute('aria-disabled') === 'true') return;
      var value = row.getAttribute('data-value'); closePop(); spec.onPick(value);
    });
    return { close: closePop };
  }
  function toastText(text) { toast(text); }

  if (app) {
    app.addEventListener('click', function (event) {
      var target = event.target;
      if (popEl && !popEl.contains(target) && !target.closest('[aria-haspopup]')) closePop();
      var range = target.closest('.pmu-range button[data-range]');
      if (range) { setView({ range: range.getAttribute('data-range') }, 'range'); return; }
      if (target.closest('#pmuDetailBtn')) {
        pop(target.closest('#pmuDetailBtn'), { title: 'Workspace detail', rows: Object.keys(DETAIL).map(function (k) { return { value: k, label: DETAIL[k].label, sub: DETAIL[k].desc, active: st.detail === k }; }),
          onPick: function (v) { setView({ detail: v }, 'detail'); } });
        return;
      }
      if (target.closest('#pmuScopeBtn')) {
        pop(target.closest('#pmuScopeBtn'), { title: 'Scope', align: 'left', rows: SCOPES.map(function (s) { return { value: s[0], label: s[1], sub: s[2], active: st.scope === s[0] }; }),
          onPick: function (v) { setView({ scope: v }, 'scope'); toastText(t('toast.scope', { scope: scopeLabel(v) })); } });
        return;
      }
      if (target.closest('#pmuCustomize') && PMU.board) {
        var hidden = st.hidden[st.room] || {};
        pop(target.closest('#pmuCustomize'), { title: 'Panels in ' + ROOM[st.room].label, rows: PMU.board.layout(st.room).map(function (r) {
          var d = PMU.widgets.get(r.id) || { title: r.id }; return { value: r.id, label: d.title, sub: hidden[r.id] ? 'Hidden' : DETAIL[d.level || 'glance'].label, active: !hidden[r.id] };
        }).concat([{ value: '__reset_room', label: 'Reset this room' }, { value: '__reset_all', label: 'Reset every room' }]),
          onPick: function (v) {
            if (v === '__reset_room') { PMU.board.reset('room'); toastText(t('toast.reset')); return; }
            if (v === '__reset_all') { PMU.board.reset('all'); toastText(t('toast.reset')); return; }
            PMU.board.setVisible(v, !!hidden[v]); render();
          } });
        return;
      }
      if (target.closest('#pmuRefresh') && window.PM7_USAGE) { window.PM7_USAGE.refresh(); return; }
      if (target.closest('#pmuExport') && window.PM7_USAGE) { window.PM7_USAGE.exportJson('snapshot'); return; }
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && popEl) closePop(); });
  }

  PMU.shell = { render: render, setView: setView, pop: pop, closePop: closePop, toast: toastText, syncInk: syncInk, scopeLabel: scopeLabel };
})();
