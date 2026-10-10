/* Keyboard model (CONTRACT section 9). The page already owns Ctrl+1..9 (activity-bar pages) and Ctrl+K (Settings
   search, and canon's command palette), so the panels use neither: tab N is Alt+1..9, panels are focused with
   Alt+arrows, and there are no Ctrl+K chords. In a browser four chords belong to the browser and cannot be taken by a
   page (Ctrl+T, Ctrl+W, Ctrl+Shift+T, Ctrl+Tab); the concept and the web client answer Alt+T, Alt+W, Alt+Shift+T and
   Alt+` for them, and every label shows the key that works where the page runs. Chrome also reserves Ctrl+PgDn/PgUp
   (its own next/previous tab, like Ctrl+Tab), so next/previous tab in the panel is Alt+PgDn/PgUp in a browser. No bare
   letters or digits; Escape stays scoped to the innermost open thing; text inputs keep their own keys (on a Mac,
   Option+letter and Option+` type characters, so the Alt stand-ins never fire from a text field there). */

var IN_BROWSER = PMW.inBrowser = true;   // the concept always runs in a browser; the native app maps the Ctrl chords
var KEYS = PMW.KEYS = {
  newTab: IN_BROWSER ? 'Alt+T' : 'Ctrl+T',
  closeTab: IN_BROWSER ? 'Alt+W' : 'Ctrl+W',
  reopen: IN_BROWSER ? 'Alt+Shift+T' : 'Ctrl+Shift+T',
  mru: IN_BROWSER ? 'Alt+`' : 'Ctrl+Tab',
  plusMenu: 'Ctrl+Shift+Space',
  newTerminal: 'Ctrl+Shift+`',
  newBrowser: 'Ctrl+Shift+B',
  quickOpen: 'Ctrl+P',
  allTabs: 'Ctrl+Shift+A',
  nextTab: IN_BROWSER ? 'Alt+PgDn' : 'Ctrl+PgDn', prevTab: IN_BROWSER ? 'Alt+PgUp' : 'Ctrl+PgUp',
  moveTabLeft: 'Ctrl+Shift+PgUp', moveTabRight: 'Ctrl+Shift+PgDn',
  tabN: 'Alt+1..8, Alt+9 last',
  focusPanelDir: 'Alt+arrows', focusPanelN: 'Alt+Shift+1..9', cycleRegions: 'F6, Shift+F6',
  moveTabToPanelDir: 'Alt+Shift+arrows',
  splitRight: 'Ctrl+\\', splitDown: 'Ctrl+Shift+\\',
  maximize: 'Shift+Escape'
};

function isTextTarget(el) {
  if (!el || !el.closest) return false;
  if (el.isContentEditable) return true;
  var tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !/^(button|checkbox|radio|range|submit|reset|color|file)$/i.test(el.type || '');
  return false;
}
function homeVisible() { return !!(state.centre && state.centre.offsetParent !== null && state.centre.getClientRects().length); }
function focusedTabEntry() {
  var a = doc.activeElement;
  var body = a && a.closest ? a.closest('.pmw-tabbody') : null;
  return body ? instances[body.getAttribute('data-pmw-tab')] : null;
}
function focusedPanelId() { return state.layout ? state.layout.view.focus : null; }

/* The rects the keyboard steers by: the tree's own, even while a panel is maximized (the maximized rect is the whole
   centre, so a neighbour or a split fit measured against it would be wrong). Prefers the engine's PMW.treeRects. */
function keyRects() {
  var r = render.rects();
  if (!r || r.mode !== 'maximized') return r;
  if (typeof PMW.treeRects === 'function') return PMW.treeRects();
  return state.layout && state.centre ? geom.layout(state.layout, render.centreRect(), {}) : r;
}

/* a panel's neighbour in a direction, by rect centres */
function panelInDirection(panelId, dir) {
  var rects = keyRects();
  if (!rects) return null;
  var r = rects.panels[panelId];
  if (!r) return null;
  var cx = r.x + r.w / 2, cy = r.y + r.h / 2, best = null, bestD = Infinity;
  Object.keys(rects.panels).forEach(function (id) {
    if (id === panelId || rects.hidden[id]) return;
    var q = rects.panels[id], qx = q.x + q.w / 2, qy = q.y + q.h / 2;
    var ok = dir === 'left' ? q.x + q.w <= r.x + 1 : dir === 'right' ? q.x >= r.x + r.w - 1 : dir === 'up' ? q.y + q.h <= r.y + 1 : q.y >= r.y + r.h - 1;
    if (!ok) return;
    var overlap = dir === 'left' || dir === 'right' ? Math.min(q.y + q.h, r.y + r.h) - Math.max(q.y, r.y) : Math.min(q.x + q.w, r.x + r.w) - Math.max(q.x, r.x);
    var d = Math.hypot(qx - cx, qy - cy) - Math.max(0, overlap) * 0.5;
    if (d < bestD) { bestD = d; best = id; }
  });
  return best;
}
PMW.panelInDirection = panelInDirection;

function cycleTab(delta) {
  var l = state.layout, p = model.panel(l, focusedPanelId());
  if (!p || !p.tabs.length) return;
  var i = p.tabs.indexOf(p.active);
  var next = p.tabs[(i + delta + p.tabs.length) % p.tabs.length];
  PMW.activateTab(next, { focus: true });
}
function nudgeTab(delta) {
  var l = state.layout, p = model.panel(l, focusedPanelId());
  if (!p || !p.active) return;
  var i = p.tabs.indexOf(p.active), j = i + delta;
  if (j < 0 || j >= p.tabs.length) return;
  if (!!l.tabs[p.tabs[j]].pinned !== !!l.tabs[p.active].pinned) return;
  PMW.moveTab(p.active, p.id, j);
  nextFrame(function () { var t = strip.tabEl(p.active); if (t) t.focus(); });
}
function moveTabToward(dir) {
  var l = state.layout, p = model.panel(l, focusedPanelId());
  if (!p || !p.active) return;
  var other = panelInDirection(p.id, dir);
  if (other) { PMW.moveTab(p.active, other, null); return; }
  var edge = { left: 'left', right: 'right', up: 'top', down: 'bottom' }[dir];
  var rects = keyRects();
  if (p.tabs.length > 1 && rects && geom.splitFits(l, p.id, edge, rects)) PMW.moveTabToSplit(p.active, p.id, edge);
  else announce('There is no panel ' + (dir === 'up' ? 'above' : dir === 'down' ? 'below' : 'to the ' + dir));
}
function focusPanelN(n) {
  var ps = model.panels(state.layout);
  if (ps[n - 1]) { PMW.focusPanel(ps[n - 1].id); PMW.focusPanelDom(ps[n - 1].id); }
}
function focusTabN(n) {
  var p = model.panel(state.layout, focusedPanelId());
  if (!p || !p.tabs.length) return;
  var t = n === 9 ? p.tabs[p.tabs.length - 1] : p.tabs[n - 1];
  if (t) PMW.activateTab(t, { focus: true });
}
/* the rail is the whole left panel (activity bar and side panel, so the file tree counts), then the panels, then the
   chat (#chatPanel; the offsetParent filter drops it while hidden) */
var REGION_SEL = ['.left-panel', '#pm-home-centre', '#chatPanel'];
function cycleRegion(back) {
  var regions = REGION_SEL.map(function (s) { return qs(s); }).filter(function (el) { return el && el.offsetParent !== null; });
  if (!regions.length) return;
  var a = doc.activeElement;
  var i = regions.findIndex(function (r) { return r.contains(a); });
  if (i < 0) i = Math.max(0, regions.indexOf(state.centre));   // from nowhere (the body, a bar): count from the panels
  var next = regions[(i + (back ? -1 : 1) + regions.length) % regions.length];
  if (!next) return;
  if (next.id === 'pm-home-centre') PMW.focusPanelDom(focusedPanelId());
  else { var f = next.querySelector('[tabindex="0"], button, textarea, input, [tabindex]'); (f || next).focus(); }
}

var dirOf = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

var MODIFIER_KEYS = { Shift: 1, Control: 1, Alt: 1, Meta: 1, AltGraph: 1, CapsLock: 1 };

doc.addEventListener('keydown', function (e) {
  if (!homeVisible() || !state.layout) return;
  if (e.defaultPrevented || e.isComposing) return;
  var t = e.target;
  if (PMW.menu.isOpen()) {
    // the menu owns its keys while focus is inside it; a menu left open behind the focus (a click elsewhere that
    // did not close it) never swallows the panel shortcuts: the first real key outside closes it and goes on
    var cur = PMW.menu.current;
    if (cur && cur.el && cur.el.contains(t)) return;
    if (MODIFIER_KEYS[e.key]) return;
    PMW.menu.close({ returnFocus: false });
  }
  var ctrl = e.ctrlKey || e.metaKey, alt = e.altKey, shift = e.shiftKey;
  var k = e.key, code = e.code;
  // F6 works from every region (the rail, the panels, the chat) and before a tab's wantsKey: a terminal gives it back
  if (k === 'F6' && !ctrl && !alt) { cycleRegion(shift); e.preventDefault(); e.stopPropagation(); return; }
  var inCentre = state.centre.contains(t) || t === doc.body || t === doc.documentElement;
  var inChat = !!(t.closest && t.closest('#chatPanel'));
  if (!inCentre && !inChat) return;
  var entry = focusedTabEntry();
  if (entry && entry.instance && entry.instance.wantsKey) { try { if (entry.instance.wantsKey(e)) return; } catch (_) {} }
  var text = isTextTarget(t);
  // typing: on a Mac, Option+letter and Option+` type characters (a dagger, the grave dead key) in a text field, and a
  // dead key is the start of a character anywhere; the Alt stand-ins leave both alone (Windows and Linux Alt+T types
  // nothing, so it still works from a field there)
  var typing = alt && !ctrl && text && (IS_MAC || k === 'Dead');
  var handled = true;
  var pid = focusedPanelId();
  if (ctrl && shift && (k === ' ' || code === 'Space')) { var plusBtn = (strip.stateOf(pid) || {}).plus; if (plusBtn && plusBtn.isConnected && plusBtn.offsetParent !== null) PMW.menus.plus(pid, plusBtn); else PMW.menus.plus(pid, null); }
  else if (ctrl && shift && code === 'Backquote') PM_HOME.open({ kind: 'terminal', where: 'auto' });
  else if (ctrl && shift && code === 'KeyB' && !alt) PM_HOME.open({ kind: 'browser' });
  else if (ctrl && shift && code === 'KeyA' && !alt && !text) PMW.menus.allTabs();
  else if (ctrl && !shift && !alt && code === 'KeyP' && !text) PMW.quickOpen && PMW.quickOpen(pid);
  else if (((alt && !ctrl && !shift) || (ctrl && !alt && !shift)) && code === 'KeyT' && (alt || !IN_BROWSER) && !typing) PM_HOME.open(Object.assign({}, PMW.defaultSpecFor(pid), { where: pid }));
  else if (((alt && !ctrl && !shift) || (ctrl && !alt && !shift)) && code === 'KeyW' && (alt || !IN_BROWSER) && !text) { var p0 = model.panel(state.layout, pid); if (p0 && p0.active) PMW.closeTab(p0.active); }
  else if (((alt && shift && !ctrl) || (ctrl && shift && !alt)) && code === 'KeyT' && (alt || !IN_BROWSER) && !typing) PMW.reopenClosed();
  else if (((alt && !ctrl && code === 'Backquote' && !typing) || (ctrl && !alt && k === 'Tab' && !IN_BROWSER))) { if (!PMW.mru.el && e.repeat) handled = true; else PMW.mru.start(shift ? -1 : 1, alt ? 'Alt' : 'Control'); }
  // next/previous tab: Alt+PgDn/PgUp in a browser (Chrome keeps Ctrl+PgDn/PgUp); Ctrl is still taken where it arrives
  else if (!shift && (k === 'PageDown' || k === 'PageUp') && ((ctrl && !alt) || (alt && !ctrl && IN_BROWSER && !(IS_MAC && text)))) cycleTab(k === 'PageDown' ? 1 : -1);
  else if (ctrl && shift && !alt && (k === 'PageDown' || k === 'PageUp')) nudgeTab(k === 'PageDown' ? 1 : -1);
  else if (alt && !ctrl && !shift && /^Digit[1-9]$/.test(code) && !text) focusTabN(+code.slice(5));
  else if (alt && shift && !ctrl && /^Digit[1-9]$/.test(code) && !text) focusPanelN(+code.slice(5));
  else if (alt && !ctrl && !shift && dirOf[k] && !text) { var to = panelInDirection(pid, dirOf[k]); if (to) { PMW.focusPanel(to); PMW.focusPanelDom(to); } }
  else if (alt && shift && !ctrl && dirOf[k] && !text) moveTabToward(dirOf[k]);
  else if (ctrl && !alt && code === 'Backslash') PMW.splitPanel(pid, shift ? 'bottom' : 'right');
  else if (shift && !ctrl && !alt && k === 'Escape') PMW.toggleMaximize(pid);
  else if (!ctrl && !alt && !shift && k === 'Escape' && state.layout.view.maximized && t.closest && t.closest('.pmw-strip')) PMW.toggleMaximize(state.layout.view.maximized);
  else handled = false;
  if (handled) { e.preventDefault(); e.stopPropagation(); }
}, true);

/* MRU switcher across panels and kinds: hold the modifier, the key steps, release activates (JetBrains Switcher) */
var mru = PMW.mru = { el: null, list: [], i: 0, mod: null };
mru.start = function (delta, mod) {
  var l = state.layout;
  if (!mru.el) {
    var ids = (l.view.mru || []).filter(function (t) { return l.tabs[t]; });
    model.panels(l).forEach(function (p) { p.tabs.forEach(function (t) { if (ids.indexOf(t) < 0) ids.push(t); }); });
    if (ids.length < 2) return;
    mru.list = ids; mru.i = 0; mru.mod = mod;
    mru.el = h('div', { class: 'pmw-mru pmw-pop', role: 'listbox', 'aria-label': 'Recent tabs' });
    overlay().appendChild(mru.el);
    var c = state.centre.getBoundingClientRect();
    mru.el.style.left = Math.round(c.left + c.width / 2 - 170) + 'px';
    mru.el.style.top = Math.round(c.top + 60) + 'px';
    doc.addEventListener('keyup', mru.onUp, true);
    window.addEventListener('blur', mru.cancel);
  }
  mru.i = (mru.i + delta + mru.list.length) % mru.list.length;
  mru.paint();
};
mru.paint = function () {
  var l = state.layout;
  mru.el.textContent = '';
  mru.list.slice(0, 12).forEach(function (t, i) {
    var r = l.tabs[t], def = kindDef(r.kind);
    var row = h('div', { class: 'pmw-mru-row pmw-cur' + (i === mru.i ? ' is-current' : ''), role: 'option', 'aria-selected': i === mru.i ? 'true' : 'false', 'data-pmh': 'row' }, [
      kindIcon((def && def.icon) || 'file'), h('b', { text: tabLabel(r) }), h('span', { text: model.describe(l, model.panelOf(l, t).id) })]);
    mru.el.appendChild(row);
  });
  announce(tabLabel(l.tabs[mru.list[mru.i]]));
};
mru.onUp = function (e) {
  if (e.key !== mru.mod && !(mru.mod === 'Control' && e.key === 'Meta')) return;
  var pick = mru.list[mru.i];
  mru.cancel();
  if (pick) PMW.activateTab(pick, { focus: true });
};
mru.cancel = function () {
  if (mru.el) mru.el.remove();
  mru.el = null;
  doc.removeEventListener('keyup', mru.onUp, true);
  window.removeEventListener('blur', mru.cancel);
};
