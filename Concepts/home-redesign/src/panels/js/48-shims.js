/* Compatibility shims (CONTRACT 6.2) and the jobs the old Home controller used to do (it no longer runs). Every old
   open path goes through PM_HOME.open, so D7 holds everywhere: the file tree, cmd.file.open, the demo facade's
   files.open, the bottom-panel reveals. The left rail keeps working until it moves to the API. */

var shims = PMW.shims = {};

function demo() { return window.PM_DEMO || null; }

/* file tree: a single click opens the preview tab, a double click keeps it (D7) */
shims.fileTree = function () {
  var lastClick = { path: null, at: 0 };
  // capture before the demo router so the tree row never reaches the old pane-1 path
  doc.addEventListener('click', function (e) {
    var row = e.target.closest && e.target.closest('.fm-row[data-path][data-demo-action="cmd.file.open"], .fm-openrow[data-path]');
    if (!row || row.getAttribute('data-kind') === 'folder' || row.hasAttribute('data-collapse')) return;
    if (row.getAttribute('data-ignored') === '1') return;
    e.stopPropagation(); e.preventDefault();
    var path = row.getAttribute('data-path');
    qsa('.fm-row.active-file').forEach(function (r) { r.classList.remove('active-file'); });
    row.classList.add('active-file');
    if (window.PM_PAGES && PM_PAGES.current !== 'dashboard') { try { PM_PAGES.go('dashboard'); } catch (_) {} }
    var now = Date.now();
    var dbl = lastClick.path === path && now - lastClick.at < 450;
    lastClick = { path: path, at: now };
    PM_HOME.open({ kind: 'editor', path: path, mode: dbl ? 'keep' : 'preview', where: e.altKey ? 'panel' : 'auto', background: e.ctrlKey || e.metaKey });
  }, true);
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var row = e.target.closest && e.target.closest('.fm-row[data-path][data-demo-action="cmd.file.open"]');
    if (!row || row.hasAttribute('data-collapse')) return;
    e.stopPropagation(); e.preventDefault();
    PM_HOME.open({ kind: 'editor', path: row.getAttribute('data-path'), mode: 'keep', where: e.altKey ? 'panel' : 'auto' });
  }, true);
};

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
    D.actions.register('cmd.file.open', function (ctx) {
      var path = ctx && (ctx.path || ctx.arg || (ctx.el && ctx.el.getAttribute && ctx.el.getAttribute('data-path')));
      if (typeof path === 'string' && path.indexOf('cmd.file.open:') === 0) path = path.slice('cmd.file.open:'.length);
      if (!path) return { ok: false };
      var r = PM_HOME.open({ kind: 'editor', path: path, mode: 'preview' });
      return { ok: !!r.ok };
    });
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
