/* Compatibility shims (CONTRACT 6.2) and the jobs the old Home controller used to do (it no longer runs). Every old
   open path goes through PM_HOME.open, so D7 holds everywhere: the file tree, cmd.file.open, the demo facade's
   files.open, the bottom-panel reveals. The left rail keeps working until it moves to the API. */

var shims = PMW.shims = {};

function demo() { return window.PM_DEMO || null; }

/* file tree: the shell's own rows and handlers stay (the left rail's concept D is a skin over them and restores them
   byte for byte); the open is rerouted BEHIND the shell's handler: the demo router hands its cmd.file.open action the
   click event, and that action (re-registered below, last registration wins) applies D7: a single click opens the
   preview tab, a double click keeps it, Alt+click opens a new panel, Ctrl/Cmd+click opens in the background. */
function fileOpenFromRow(ctx) {
  var el = ctx && ctx.el, e = ctx && ctx.event;
  var path = el && el.dataset ? (el.dataset.path || '') : '';
  if (!path && ctx) path = ctx.path || '';
  if (!path && ctx && typeof ctx.arg === 'string') path = ctx.arg.indexOf('cmd.file.open:') === 0 ? ctx.arg.slice(14) : ctx.arg;
  if (!path) return { ok: false };
  if (window.PM_PAGES && PM_PAGES.current && PM_PAGES.current !== 'dashboard') { try { PM_PAGES.go('dashboard'); } catch (_) {} }
  var dbl = !!(e && e.detail >= 2);
  // a single click previews and leaves focus in the tree (arrows keep walking it); a double click keeps and moves focus
  var r = PM_HOME.open({ kind: 'editor', path: path, mode: dbl ? 'keep' : 'preview', where: e && e.altKey ? 'panel' : 'auto',
    background: !!(e && (e.ctrlKey || e.metaKey)), focus: dbl });
  var host = el && el.closest ? el.closest('#panel-files') : null;
  if (host && r.ok) {
    host.querySelectorAll('.fm-row.active-file').forEach(function (row) { row.classList.remove('active-file'); });
    el.classList.add('active-file');
  }
  return { ok: !!r.ok };
}
shims.fileTree = function () {};

/* the demo engine's facades and actions (last registration wins) */
shims.demoFacades = function () {
  var D = demo();
  if (!D) return;
  if (D.files) {
    D.files.open = function (path, o) {
      var r = PM_HOME.open(Object.assign({ kind: 'editor', path: path, mode: 'keep' }, o || {}));
      return { ok: !!r.ok };
    };
  }
  if (D.actions && typeof D.actions.register === 'function') {
    D.actions.register('cmd.file.open', fileOpenFromRow);
    var reveal = function (kind, spec) {
      return function () { return PM_HOME.open(Object.assign({ kind: kind }, spec || {})); };
    };
    D.actions.register('cmd.terminal.show', reveal('terminal'));
    D.actions.register('cmd.run_debug.console.reveal', reveal('debug-console'));
    D.actions.register('cmd.run_debug.terminal.reveal', reveal('terminal'));
  }
};

/* the old bottom panel's reveal paths: open or reveal that kind under rule 2 */
var BOTTOM_KIND = { terminal: 'terminal', problems: 'problems', output: 'output', ports: 'ports', debug: 'debug-console', browser: 'browser' };
shims.bottomPanel = function () {
  function revealKind(name) {
    var kind = BOTTOM_KIND[String(name || 'terminal').toLowerCase()] || 'terminal';
    var l = state.layout;
    var existing = Object.keys(l.tabs).filter(function (t) { return l.tabs[t].kind === kind; })[0];
    if (existing) return PM_HOME.reveal(existing);
    return PM_HOME.open({ kind: kind });
  }
  PMW.revealKind = revealKind;
  var oldSwitch = window.switchBottomTab;
  window.switchBottomTab = function (name) {
    try { if (typeof oldSwitch === 'function') oldSwitch.apply(this, arguments); } catch (_) {}
    return revealKind(name);
  };
  window.revealBottomTab = function (name) { return revealKind(name); };
  var T = window.PM_TERMINAL_DEMO;
  if (T && typeof T.showBottomTab === 'function') {
    var oldShow = T.showBottomTab;
    T.showBottomTab = function (name) { try { oldShow.apply(T, arguments); } catch (_) {} return revealKind(name); };
  }
};

/* the file context menu: portalled to <body> (as the old controller did) with "Open to the side" and "Open in new panel" */
shims.fileContextMenu = function () {
  var menuEl = qs('#fileContextMenu');
  if (!menuEl) return;
  if (menuEl.parentNode !== doc.body) doc.body.appendChild(menuEl);
  menuEl.style.setProperty('z-index', '10070', 'important');
  menuEl.setAttribute('data-pm-home-body-portal', 'true');
  var target = null;
  doc.addEventListener('contextmenu', function (e) {
    var row = e.target.closest && e.target.closest('.fm-row[data-path], .fm-openrow[data-path]');
    target = row ? row.getAttribute('data-path') : null;
  }, true);
  if (!menuEl.querySelector('[data-pmw-open]')) {
    var rows = [
      ['open', 'Open'], ['panel', 'Open in new panel'], ['side', 'Open to the side']
    ].map(function (r) {
      var b = h('div', { class: 'fm-ctx-item pmw-ctx-item', role: 'menuitem', tabindex: '-1', 'data-pmw-open': r[0], text: r[1] });
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        menuEl.classList.remove('open', 'show', 'visible');
        menuEl.style.display = 'none';
        if (!target) return;
        PM_HOME.open({ kind: 'editor', path: target, mode: 'keep', where: r[0] === 'open' ? 'auto' : r[0] === 'panel' ? 'panel' : 'right' });
      });
      return b;
    });
    var sep = h('div', { class: 'fm-ctx-sep pmw-ctx-sep', role: 'separator' });
    rows.concat([sep]).reverse().forEach(function (el) { menuEl.insertBefore(el, menuEl.firstChild); });
  }
};

/* the page's other jobs the old controller owned */
shims.misc = function () {
  qsa('.pane-header-drag').forEach(function (el) { el.setAttribute('draggable', 'false'); });
  var page = qs('#panel-dashboard');
  if (page) page.classList.add('pm-home-owned');
};

/* Settings "Restore home layout" (general.startup.reset-home-layout) runs cmd.workspace_layout.reset */
var RESET_SEL = '[data-action="run-setting-action"][data-setting="general.startup.reset-home-layout"], .s4-row[data-sid="general.startup.reset-home-layout"] .s4-action';
shims.settingsReset = function () {
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest(RESET_SEL);
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var ok = PMW.resetLayout();
    b.setAttribute('data-pm-home-reset-outcome', ok ? 'applied' : 'rejected');
    b.setAttribute('aria-label', 'Restore home layout');
    PMW.toast(ok ? 'Home layout restored. Your open tabs stayed open.' : 'The home layout could not be restored.');
  }, true);
};

/* body.pm-home-dragging while a tab or panel is carried (the tour bar and callout hold still and dim) */
shims.dragClass = function () {
  var mo = new MutationObserver(function () {
    var on = doc.body.classList.contains('pmw-dragging');
    if (doc.body.classList.contains('pm-home-dragging') !== on) doc.body.classList.toggle('pm-home-dragging', on);
  });
  mo.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
};

/* the chat icon in the activity bar: a capture handler in the tour core already routes it through the shim; keep
   the hover tag honest */
shims.install = function () {
  shims.misc();
  shims.fileTree();
  shims.demoFacades();
  shims.bottomPanel();
  shims.fileContextMenu();
  shims.settingsReset();
  shims.dragClass();
};
