/* Boot. pm-home-js runs at the end of <body> (before DOMContentLoaded): the centre mounts at once, so the first frame
   already has it; the shims, the chat column and the ladder install after the page's own DOMContentLoaded boots (the
   demo engine, the cozy shelves, the chat render), so the last registration (ours) wins. ?home=current leaves today's
   Home untouched (html[data-pmw-home] is not set). */

var DEAD_PORTALS = ['pm-home-more-menu', 'pm-home-open-panel-flyout', 'pm-home-open-browser-flyout', 'pm-home-surface-menu', 'pm-home-file-panel-menu'];
var booted = false;

PMW.snapshot = function () { return state.layout ? model.clone(state.layout) : null; };
PMW.restoreSnapshot = function (snap, source) {
  if (!snap || snap.schema !== model.SCHEMA) return { ok: false, reason: 'invalid_snapshot' };
  var copy = model.clone(snap);
  model.normalize(copy);
  if (model.validate(copy).length) return { ok: false, reason: 'invalid_snapshot' };
  return commit(CMD.restore, { source: source || 'restore' }, function (d) {
    for (var k in d) delete d[k];
    Object.assign(d, copy);
    return {};
  }, { source: source || 'restore' });
};
PMW.resetLayout = PMW.resetLayout || function () { return PMW.applyNamed('home', { reset: true }); };

function firstLayout() {
  persist.bind();   // the layout belongs to the project it was loaded for, whatever the title bar says later
  var saved = persist.load();
  if (saved) return saved;
  var name = PMW.settings.get('panels.layout.named') || 'home';
  var l = PMW.buildNamed(PMW.NAMED[name] ? name : 'home', null);
  return l;
}

function homeShown() { var p = qs('#panel-dashboard'); return !!p && (p.classList.contains('active') || p.classList.contains('pm8-page-out')); }
var wasShown = null;
function onPageChange() {
  var shown = homeShown();
  if (shown === wasShown) return;
  wasShown = shown;
  if (shown) {
    narrow.schedule();
    render.schedule({ animate: false });
    for (var id in instances) {
      var e = instances[id];
      if (e.visible && e.instance && e.instance.onShow) { try { e.instance.onShow(); } catch (_) {} }
    }
  } else {
    if (PMW.menu.isOpen()) PMW.menu.close({ instant: true, returnFocus: false });
    for (var id2 in instances) {
      var e2 = instances[id2];
      if (e2.visible && e2.instance && e2.instance.onHide) { try { e2.instance.onHide(); } catch (_) {} }
    }
  }
}

PM_HOME.boot = function () {
  if (booted) return;
  if (root.getAttribute('data-pmw-home') !== 'on') return;
  booted = true;
  var page = qs('#panel-dashboard');
  if (!page) { try { console.error('[pm-home] #panel-dashboard is missing'); } catch (_) {} return; }
  page.classList.add('pm-home-owned');
  var centre = h('div', { id: 'pm-home-centre', class: 'pmw-centre pmw-scope', role: 'region', 'aria-label': 'Home panels' });
  page.insertBefore(centre, page.firstChild);
  state.centre = centre;
  overlay().classList.add('pmw-scope');
  DEAD_PORTALS.forEach(function (id) { var el = doc.getElementById(id); if (el) el.remove(); });
  bus.emit('boot:kinds', {});
  state.layout = firstLayout();
  try { persist.watchProject(); } catch (err) { try { console.error('[pm-home] project watch failed', err); } catch (_) {} }
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(function () {
      if (!homeShown()) return;
      narrow.schedule();
      render.schedule({ animate: false });
    }).observe(centre);
  }
  if (typeof MutationObserver === 'function') new MutationObserver(onPageChange).observe(page, { attributes: true, attributeFilter: ['class'] });
  try { var D = window.PM_DEMO; if (D && D.on) D.on('page.changed', function () { nextFrame(onPageChange); }); } catch (_) {}
  render.schedule({ animate: false });
  var installLate = function () {
    [['chat column', function () { PMW.chatCol.install(); }],
     ['shims', function () { shims.install(); }],
     ['title bar', function () { PMW.installTitlebar(); }],
     ['narrow ladder', function () { narrow.install(); }],
     ['stand-in chat', function () { if (PMW.standIn) PMW.standIn.install(); }],
     ['tour', function () { if (PMW.tour) PMW.tour.install(); }]
    ].forEach(function (step) {
      try { step[1](); } catch (err) { try { console.error('[pm-home] ' + step[0] + ' failed', err); } catch (_) {} }
    });
    wasShown = null;
    onPageChange();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { measureCacheReset(); render.schedule({ animate: false }); });
    bus.emit('ready', {});
  };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { setTimeout(installLate, 0); });
  else setTimeout(installLate, 0);
};
function measureCacheReset() { bus.emit('look', look()); }
PM_HOME.ready = function (fn) { if (booted && state.layout) fn(); else bus.on('ready', fn); };
