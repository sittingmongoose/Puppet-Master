/* Compatibility shims (CONTRACT 6.2) and the jobs the old Home controller used to do (it no longer runs). Every old
   open path goes through PM_HOME.open, so D7 holds everywhere: the file tree, cmd.file.open, the demo facade's
   files.open, the bottom-panel reveals. The left rail keeps working until it moves to the API. */

var shims = PMW.shims = {};

function demo() { return window.PM_DEMO || null; }

/* file tree: the shell's own rows and handlers stay (the left rail's concept D is a skin over them and restores them
   byte for byte); the open is rerouted BEHIND the shell's handler: the demo router hands its cmd.file.open action the
   click event, and that action (re-registered below, last registration wins) applies D7: a single click opens the
   preview tab, a double click keeps it, Alt+click opens a new panel, Ctrl/Cmd+click opens in the background. */
/* the path a cmd.file.open row names. A row's data-path is the tree's own and is trusted; otherwise the row's visible
   path (.fm-path / .fm-cpath), then the demo arg ('cmd.file.open -> image.rs (note)'), never the raw arg (it would
   become a tab called 'cmd.file.open -> ...'). Anything but a data-path is resolved through the project's file index,
   so a bare name or a partial path lands on the same id the tree opens (one id, one tab). */
var FILE_ARG_RE = /^cmd\.file\.open\s*(?:->|:)\s*(.+?)(?:\s+\(.*\))?\s*$/;
function resolveProjectPath(name) {
  if (typeof PMW.fileIndex !== 'function') return name;
  var all = [];
  try { all = PMW.fileIndex('', 100000) || []; } catch (_) { return name; }
  if (all.indexOf(name) >= 0) return name;
  var tail = '/' + name.replace(/^\.?\//, '');
  for (var i = 0; i < all.length; i++) if (all[i].slice(-tail.length) === tail) return all[i];
  return null;
}
function rowFilePath(ctx) {
  var el = ctx && ctx.el;
  var path = el && el.dataset ? (el.dataset.path || '') : '';
  if (path) return { path: path };
  if (ctx && ctx.path) return { path: String(ctx.path) };
  var vis = el && el.querySelector ? el.querySelector('.fm-path, .fm-cpath') : null;
  var name = vis ? (vis.textContent || '').trim() : '';
  if (!name && ctx && typeof ctx.arg === 'string') { var m = FILE_ARG_RE.exec(ctx.arg.trim()); name = m ? m[1] : ''; }
  if (!name) return { path: '' };
  return { path: resolveProjectPath(name), name: name };
}
function fileOpenFromRow(ctx) {
  var el = ctx && ctx.el, e = ctx && ctx.event;
  var found = rowFilePath(ctx), path = found.path;
  if (!path) return found.name ? { ok: false, toast: found.name.split('/').pop() + ' is not in this project.' } : { ok: false };
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
    // reveals go through revealKind (rule 1: an existing tab of the kind is revealed, never a new one per click);
    // PMW.revealKind is defined by bottomPanel below and looked up at click time
    D.actions.register('cmd.terminal.show', terminalAt);
    D.actions.register('cmd.run_debug.console.reveal', function () { return PMW.revealKind('debug'); });
    D.actions.register('cmd.run_debug.terminal.reveal', function () { return PMW.revealKind('terminal'); });
  }
};

/* 'Open in terminal' (a tree row's button: 'cmd.terminal.show -> cwd src/' on a folder, '-> <file>' on a file) and
   'Reveal in terminal' (the file context menu: '... at row cwd'). The folder is worked out from the arg or the row;
   a terminal already in that folder is revealed, else one opens there. With no folder to go on, the existing
   terminal is revealed (or one opened), as the page's own handler did. */
var PROJECT_CWD = '~/tastebook/api';   // the concept's project root: the home layout's terminals start here
var ctxRow = null;                     // the row the file context menu was opened on ({ path, folder })
function folderOf(path, folder) { path = String(path || '').replace(/\/+$/, ''); return folder ? path : (path.indexOf('/') >= 0 ? path.slice(0, path.lastIndexOf('/')) : ''); }
function normCwd(p) { return String(p || '').replace(/\/+$/, '').replace(/^(?:~|\/home\/[^\/]+|\/Users\/[^\/]+)(?=\/|$)/, ''); }
function terminalCwdFor(ctx) {
  var arg = String(ctx && ctx.arg || '');
  var m = /->\s*cwd\s+(\S+)/.exec(arg);
  if (m) return folderOf(m[1], true);
  var row = ctx && ctx.el && ctx.el.closest ? ctx.el.closest('[data-path]') : null;
  if (row) return folderOf(row.getAttribute('data-path'), row.getAttribute('data-kind') === 'folder');
  if (/row cwd/.test(arg) && ctxRow) return folderOf(ctxRow.path, ctxRow.folder);
  m = /->\s*(\S+)\s*$/.exec(arg);
  if (m && /[.\/]/.test(m[1])) return folderOf(m[1], /\/$/.test(m[1]));
  return null;
}
function terminalAt(ctx) {
  var rel = terminalCwdFor(ctx);
  if (rel == null) return PMW.revealKind('terminal');
  var cwd = PROJECT_CWD + (rel ? '/' + rel : '');
  var want = normCwd(cwd), l = state.layout, live = {};
  try { if (window.PMT && typeof PMT.sessions === 'function') PMT.sessions().forEach(function (x) { live[x.id] = x.cwd; }); } catch (_) {}
  var hit = Object.keys(l.tabs).filter(function (t) {
    var rec = l.tabs[t];
    if (rec.kind !== 'terminal') return false;
    var sid = t.indexOf('terminal:') === 0 ? t.slice(9) : t;
    var now = live[sid] != null ? live[sid] : (rec.state && rec.state.cwd);
    return now != null && normCwd(now) === want;
  })[0];
  if (hit) return PM_HOME.reveal(hit);
  return PM_HOME.open({ kind: 'terminal', cwd: cwd });
}

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
    ctxRow = row ? { path: target, folder: row.getAttribute('data-kind') === 'folder' } : null;
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
