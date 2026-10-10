/* The renderer: keeps one element per panel, divider and tab body in step with the layout. Panels are absolutely
   placed in the centre from geom.layout(); structural changes glide (PMW.dur('med'), off under Reduced Motion), a
   divider drag follows 1:1. Tab bodies are mounted lazily, re-parented (never re-created) when their tab moves to
   another panel, and unmounted when their tab closes. */

var state = PMW.state = PMW.state || { layout: null, centre: null, moving: false, ephemeral: false };
var instances = PMW.instances = {};
var panelEls = {};     // panelId -> element
var dividerEls = {};   // splitId:index -> element
var lastRects = null;
var paintQueued = false, paintAnimate = false;
var settleTimer = 0;
var render = PMW.render = {};

render.schedule = function (opts) {
  if (opts && opts.animate) paintAnimate = true;
  if (paintQueued) return;
  paintQueued = true;
  nextFrame(function () {
    paintQueued = false;
    var anim = paintAnimate; paintAnimate = false;
    try { render.paint({ animate: anim }); } catch (err) { try { console.error('[pm-home] paint failed', err); } catch (_) {} }
  });
};
render.now = function (opts) { paintQueued = false; render.paint(opts || {}); };

var CENTRE_PAD = PMW.CENTRE_PAD = 6;   // the same 6 px gap between the panels and the rail, the chat and the bars
function centreRect() {
  var c = state.centre;
  return { x: CENTRE_PAD, y: CENTRE_PAD, w: Math.max(0, c.clientWidth - 2 * CENTRE_PAD), h: Math.max(0, c.clientHeight - 2 * CENTRE_PAD) };
}
render.centreRect = function () { return state.centre ? centreRect() : { x: 0, y: 0, w: 0, h: 0 }; };
render.rects = function () { return lastRects; };

/* A divider drag's preview (24-dividers.js) is painted over the live layout, never written into it: commits, kind
   updates and saves made during the drag all land on the real layout, and the drag's own sizes reach the model once,
   on release. state.sizePreview = { splitId, kids: [ids], sizes: [fractions], collapsed: { kidId: bool } }; it is
   ignored once that split no longer has exactly those kids (the drag then cancels on its next move). The copy shares
   every tab record and copies only the tree's nodes. */
function copyTree(n) {
  if (!n) return n;
  var c = Object.assign({}, n);
  if (n.t === 'split') { c.kids = n.kids.map(copyTree); c.sizes = n.sizes.slice(); }
  return c;
}
function viewOf(l) {
  var pv = state.sizePreview;
  if (!pv || !l) return l;
  var f = model.find(l, pv.splitId);
  if (!f || f.node.t !== 'split' || f.node.kids.length !== pv.kids.length) return l;
  for (var i = 0; i < pv.kids.length; i++) if (f.node.kids[i].id !== pv.kids[i]) return l;
  var v = Object.assign({}, l, { root: copyTree(l.root) });
  var s = model.find(v, pv.splitId).node;
  s.sizes = pv.sizes.slice();
  s.kids.forEach(function (k) { if (k.t === 'panel' && Object.prototype.hasOwnProperty.call(pv.collapsed, k.id)) k.collapsed = pv.collapsed[k.id]; });
  return v;
}
render.view = function () { return viewOf(state.layout); };

render.paint = function (opts) {
  opts = opts || {};
  var c = state.centre, l = state.layout;
  if (!c || !l) return;
  // retire tab instances whose tabs are gone, even while Home is hidden: a tab closed from the chat or by an agent on
  // another page must release its session and timers now (CONTRACT section 3), not when Home is next shown
  for (var tid in instances) if (!l.tabs[tid]) unmountTab(tid);
  if (c.offsetParent === null && !c.getClientRects().length) return;   // Home not shown: paint when it is
  l = viewOf(l);
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  var rects = geom.layout(l, centreRect(), {
    maximized: narrow ? null : l.view.maximized,
    narrow: narrow,
    narrowFocus: l.view.focus
  });
  lastRects = rects;
  var animate = !!opts.animate && !state.dragging && dur('med') > 0;
  c.setAttribute('data-pmw-mode', rects.mode);
  c.classList.toggle('pmw-animating', animate);

  // panels
  var alive = {};
  model.panels(l).forEach(function (p) {
    alive[p.id] = true;
    var el = panelEls[p.id] || createPanelEl(p);
    var r = rects.panels[p.id];
    var hidden = !!rects.hidden[p.id] || !r;
    setAttr(el, 'hidden', hidden);
    setAttr(el, 'data-focused', l.view.focus === p.id);
    setAttr(el, 'data-collapsed', p.collapsed ? (collapsedAxis(l, p) || 'col') : null);
    setAttr(el, 'data-locked', p.locked);
    setAttr(el, 'data-empty', !p.tabs.length);
    setAttr(el, 'data-role', PMW.panelRole(l, p));
    setAttr(el, 'data-maximized', l.view.maximized === p.id && rects.mode === 'maximized');
    el.setAttribute('aria-label', panelLabel(l, p));
    if (r) placeEl(el, r, animate);
    PMW.strip.render(el, p, l, { narrow: narrow, rects: rects });
    syncBodies(el, p, l, hidden);
    PMW.renderEmpty(el, p);
  });
  for (var id in panelEls) {
    if (!alive[id]) { var gone = panelEls[id]; delete panelEls[id]; retirePanelEl(gone, animate); }
  }

  // dividers
  var seen = {};
  rects.dividers.forEach(function (d) {
    var key = d.split + ':' + d.index;
    seen[key] = true;
    var el = dividerEls[key] || (dividerEls[key] = createDivider(d));
    el.setAttribute('data-key', key);
    el.setAttribute('data-dir', d.dir);
    setAttr(el, 'hidden', d.virtual);
    el.setAttribute('aria-orientation', d.dir === 'row' ? 'vertical' : 'horizontal');
    el._pmwDivider = d;
    placeEl(el, d.rect, animate);
    updateDividerAria(el, d, l);
  });
  for (var k in dividerEls) if (!seen[k]) { dividerEls[k].remove(); delete dividerEls[k]; }

  if (animate) {
    state.moving = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      state.moving = false;
      c.classList.remove('pmw-animating');
      refitStrips();
      flushResizes(true);
    }, dur('med') + 40);
  }
  if (PMW.narrow) PMW.narrow.afterPaint(rects);
  bus.emit('paint', rects);
};

/* After a glide: refit any strip whose width is not the one it was fitted for (the fitter already fits against the
   target rect; this is the backstop for anything else measured while the panel was still moving) */
function refitStrips() {
  var l = viewOf(state.layout);
  if (!l) return;
  var narrow = PMW.narrow && PMW.narrow.singleColumn();
  model.panels(l).forEach(function (p) {
    var el = panelEls[p.id];
    if (!el || el.hidden) return;
    var host = el.querySelector('.pmw-strip-host'), s = host && host._pmw;
    if (!s || s.dragging || Math.abs(host.clientWidth - (s.fitW || 0)) <= 1) return;
    PMW.strip.render(el, p, l, { narrow: narrow, rects: lastRects });
  });
}

function collapsedAxis(l, p) {
  var parent = model.parentOf(l, p.id);
  return parent ? parent.dir : null;
}
function panelLabel(l, p) {
  var rec = p.active && l.tabs[p.active];
  var what = rec ? tabLabel(rec) : 'Empty';
  return what + ' panel, ' + model.describe(l, p.id);
}

function placeEl(el, r, animate) {
  var s = el.style;
  if (!animate) s.transition = 'none';
  s.left = r.x + 'px'; s.top = r.y + 'px'; s.width = r.w + 'px'; s.height = r.h + 'px';
  if (!animate) { void el.offsetWidth; s.transition = ''; }
}

function createPanelEl(p) {
  var el = h('section', { class: 'pmw-panel', 'data-pmw-panel': p.id, role: 'region' }, [
    h('div', { class: 'pmw-strip pmw-strip-host' }),
    h('div', { class: 'pmw-body' })
  ]);
  el.addEventListener('pointerdown', function () { PMW.focusPanel(p.id, { quiet: true }); }, true);
  el.addEventListener('focusin', function () { PMW.focusPanel(p.id, { quiet: true }); });
  state.centre.appendChild(el);
  panelEls[p.id] = el;
  return el;
}
function retirePanelEl(el, animate) {
  if (!animate) { el.remove(); return; }
  el.classList.add('pmw-leaving');
  setTimeout(function () { el.remove(); }, dur('fast') + 20);
}
render.panelEl = function (id) { return panelEls[id] || null; };
render.bodyOf = function (tabId) { var r = instances[tabId]; return r ? r.host : null; };

/* ---- tab bodies ---- */
function syncBodies(panelEl, p, l, panelHidden) {
  var body = panelEl.querySelector('.pmw-body');
  for (var i = 0; i < p.tabs.length; i++) {
    var tid = p.tabs[i];
    var active = tid === p.active;
    var rec = instances[tid];
    var visible = active && !panelHidden && !p.collapsed;
    if (!rec && (active || (kindDef(l.tabs[tid].kind) || {}).eager)) rec = mountTab(tid, body, visible);
    if (!rec) continue;
    if (rec.host.parentNode !== body) body.appendChild(rec.host);   // a moved tab keeps its instance
    setAttr(rec.host, 'hidden', !visible);
    if (visible !== rec.visible) {
      rec.visible = visible;
      var inst = rec.instance;
      if (inst) {
        try { if (visible && inst.onShow) inst.onShow(); else if (!visible && inst.onHide) inst.onHide(); }
        catch (err) { try { console.error('[pm-home] show/hide failed', err); } catch (_) {} }
      }
      if (visible) queueResize(tid);
    }
  }
}

var tabSeq = 0;
/* The body is attached to its panel (and sized by it) before mount() runs, so a kind can measure in mount(): a tab
   that will show is laid out at its real size, one that will not (an eager background tab) is hidden already. The
   first onResize, once sizes have settled, is still where precise work belongs (a panel may be mid-glide). */
function mountTab(tabId, parent, visible) {
  var l = state.layout, recd = l.tabs[tabId];
  if (!recd) return null;
  var k = kindDef(recd.kind) || PMW.missingKind;
  tabSeq += 1;
  var host = h('div', { class: 'pmw-tabbody', role: 'tabpanel', id: 'pmw-tp-' + tabSeq, 'data-pmw-tab': tabId, 'data-pmw-kind': recd.kind, tabindex: '-1' });
  if (parent) { if (!visible) host.hidden = true; parent.appendChild(host); }
  var entry = { id: tabId, kind: recd.kind, host: host, instance: null, api: null, visible: false, off: [], size: null };
  instances[tabId] = entry;
  entry.api = makeApi(entry);
  var st = recd.state ? JSON.parse(JSON.stringify(recd.state)) : {};
  try {
    entry.instance = k.mount(host, st, entry.api) || {};
  } catch (err) {
    try { console.error('[pm-home] mounting a ' + recd.kind + ' tab failed', err); } catch (_) {}
    host.textContent = '';
    host.appendChild(h('div', { class: 'pmw-tab-error', text: 'This tab could not be shown.' }));
    entry.instance = {};
  }
  observeBody(entry);
  return entry;
}
function unmountTab(tabId) {
  var e = instances[tabId];
  if (!e) return;
  delete instances[tabId];
  try { if (e.instance && e.instance.unmount) e.instance.unmount(); } catch (err) { try { console.error('[pm-home] unmount failed', err); } catch (_) {} }
  e.off.forEach(function (fn) { try { fn(); } catch (_) {} });
  if (bodyObserver) bodyObserver.unobserve(e.host);
  e.host.remove();
}
render.unmountTab = unmountTab;
render.remountKind = function (kindId) {
  for (var id in instances) if (instances[id].kind === kindId) unmountTab(id);
  render.schedule({ animate: false });
};

/* ---- resize delivery: once per frame per tab, final when nothing is moving ---- */
var bodyObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function (entries) {
  for (var i = 0; i < entries.length; i++) {
    var tid = entries[i].target.getAttribute('data-pmw-tab');
    if (tid) queueResize(tid);
  }
}) : null;
function observeBody(entry) { if (bodyObserver) bodyObserver.observe(entry.host); }
var resizePending = {}, resizeQueued = false;
function queueResize(tid) {
  resizePending[tid] = true;
  if (resizeQueued) return;
  resizeQueued = true;
  nextFrame(function () { resizeQueued = false; flushResizes(false); });
}
function flushResizes(forceFinal) {
  var ids = forceFinal ? Object.keys(instances) : Object.keys(resizePending);
  resizePending = {};
  var final = !state.moving && !state.dragging && !state.resizing;
  for (var i = 0; i < ids.length; i++) {
    var e = instances[ids[i]];
    if (!e || !e.visible || !e.instance || !e.instance.onResize) continue;
    var w = e.host.clientWidth, hh = e.host.clientHeight;
    if (!w || !hh) continue;
    var key = w + 'x' + hh + (final ? 'f' : '');
    if (e.size === key) continue;
    e.size = key;
    try { e.instance.onResize({ w: w, h: hh, final: final }); } catch (err) { try { console.error('[pm-home] onResize failed', err); } catch (_) {} }
  }
}
render.flushResizes = flushResizes;

/* ---- the per-tab host API (CONTRACT section 4) ---- */
function makeApi(entry) {
  var api = {
    id: entry.id,
    kind: entry.kind,
    update: function (fields) { PMW.updateTab(entry.id, fields || {}); },
    size: function () { return { w: entry.host.clientWidth, h: entry.host.clientHeight }; },
    isVisible: function () { return !!entry.visible; },
    isFocused: function () { return entry.host.contains(doc.activeElement); },
    activate: function (o) { PMW.activateTab(entry.id, { focus: !!(o && o.focus) }); },
    close: function () { return PMW.closeTab(entry.id); },
    split: function (direction, spec) {
      // a split beside this tab's panel is the split command (cmd.workspace_layout.split), not a plain open
      var p = model.panelOf(state.layout, entry.id);
      if (!p) return null;
      var edge = direction === 'down' ? 'bottom' : direction === 'right' || direction === 'left' || direction === 'top' || direction === 'bottom' ? direction : null;
      if (!edge) {
        var tr = PMW.treeRects ? PMW.treeRects() : render.rects();
        edge = tr && geom.splitFits(state.layout, p.id, 'right', tr) ? 'right' : 'bottom';
      }
      return PMW.splitPanel(p.id, edge, spec);
    },
    toggleMaximize: function () { var p = model.panelOf(state.layout, entry.id); if (p) PMW.toggleMaximize(p.id); },
    isMaximized: function () { var p = model.panelOf(state.layout, entry.id); return !!p && state.layout.view.maximized === p.id; },
    open: function (spec) {
      var p = model.panelOf(state.layout, entry.id);
      return PM_HOME.open(Object.assign({ source: p && p.id }, spec || {}));
    },
    menu: function (items, anchor, o) { return kindMenu(entry, items, anchor, o); },
    announce: announce,
    // persist the layout soon (250 ms, coalesced) after an in-tab view change: serialize() is read then
    saveSoon: function () { if (instances[entry.id] === entry && PMW.persist) PMW.persist.saveSoon(); },
    command: function (id, args) { return PM_HOME.command(id, args); },
    settings: PMW.settings,
    look: look,
    on: function (name, fn) {
      var off = name === 'settings' ? PMW.settings.on('*', fn) : bus.on(name, fn);
      entry.off.push(off);
      return off;
    },
    headerRow: function (spec) { return PMW.headerRow(entry, spec); }
  };
  return api;
}

/* api.menu(items, anchor, o): CONTRACT section 4's item shape { id, label, detail, icon, shortcut, disabled, reason,
   checked, danger, sub, run } ('-' a hairline) mapped onto PMW.menu rows (detail -> sub, shortcut -> right, sub ->
   submenu), opened with PMW.menu.open(anchor, spec). The anchor is an element, or a point ({ x, y } or a mouse event)
   for a context menu. o may carry title, search, width, align and onClose. A second call on the same anchor closes it.
   The same mapping serves a header-row action's `menu` and PMW.frames.button's `menu`, and it lets PMW.menu's own row
   names through (a string `sub` is the detail line, `right`, `submenu`, `alt`, `links`, `close`), so a kind may write
   either shape, an item list or a whole menu spec. */
function kindRows(items, entry) {
  if (!Array.isArray(items)) return [];
  return items.map(function (it) {
    if (!it || it === '-') return '-';
    if (typeof it !== 'object') return it;
    var r = Object.assign({}, it);
    r.label = it.label == null ? '' : String(it.label);
    var nested = it.sub && typeof it.sub !== 'string' ? it.sub : null;   // the contract's submenu
    if (nested) r.sub = it.detail != null ? it.detail : null;
    else if (r.sub == null && it.detail != null) r.sub = it.detail;
    if (r.right == null && it.shortcut) r.right = it.shortcut;
    delete r.detail; delete r.shortcut;
    if (it.checked != null) r.checked = !!it.checked;
    nested = nested || it.submenu || null;
    if (nested) {
      r.submenu = function () {
        var v = typeof nested === 'function' ? nested() : nested;
        return menuSpecOf(v, entry, { id: 'kind-sub:' + (entry ? entry.id : 'menu') + ':' + (it.id || ''), title: r.label });
      };
      delete r.run;
    } else if (typeof it.run === 'function') {
      r.run = function (info) {
        try { return it.run(info); } catch (err) { try { console.error('[pm-home] a ' + (entry ? entry.kind : 'panel') + ' menu row failed', err); } catch (_) {} }
      };
    }
    return r;
  });
}
/* an item list or a menu spec, with every row list mapped; dflt fills what a bare list does not say */
function menuSpecOf(v, entry, dflt) {
  if (!v) return null;
  if (Array.isArray(v)) return Object.assign({}, dflt, { rows: kindRows(v, entry) });
  if (typeof v !== 'object') return null;
  var spec = Object.assign({}, v);
  if (!spec.id && dflt && dflt.id) spec.id = dflt.id;
  function mapSections(ss) {
    return Array.isArray(ss) ? ss.map(function (sec) { return sec && Array.isArray(sec.rows) ? Object.assign({}, sec, { rows: kindRows(sec.rows, entry) }) : sec; }) : ss;
  }
  if (Array.isArray(spec.rows)) spec.rows = kindRows(spec.rows, entry);
  if (typeof spec.sections === 'function') { var sf = spec.sections; spec.sections = function () { return mapSections(sf.apply(this, arguments)); }; }
  else if (spec.sections) spec.sections = mapSections(spec.sections);
  return spec;
}
PMW.menuSpecOf = menuSpecOf;
var kindMenuSeq = 0;
function kindMenu(entry, items, anchor, o) {
  o = o || {};
  var at = null, el = anchor;
  if (anchor && !(anchor.nodeType === 1)) {
    var x = anchor.clientX != null ? anchor.clientX : anchor.x, y = anchor.clientY != null ? anchor.clientY : anchor.y;
    if (x != null && y != null) at = { x: x, y: y };
    el = null;
  }
  // an element-anchored menu toggles on its anchor; a point (context) menu always opens fresh where it was asked for
  var spec = menuSpecOf(items, entry, {}) || { rows: [] };
  if (!spec.id || !el) spec.id = 'kind-menu:' + entry.id + (el ? '' : ':' + (++kindMenuSeq));
  if (o.width) spec.width = o.width;
  if (o.title) spec.title = o.title;
  if (o.search) spec.search = o.search;
  if (o.align) spec.align = o.align;
  if (o.empty) spec.empty = o.empty;
  if (typeof o.onClose === 'function') spec.onClose = o.onClose;
  if (at) spec.at = at;
  if (!el && !at) { var r = entry.host.getBoundingClientRect(); spec.at = { x: r.left + 12, y: r.top + 12 }; }
  return PMW.menu.open(el, spec);
}

/* ---- dividers (behaviour in 24-dividers.js) ---- */
function createDivider(d) {
  var el = h('div', { class: 'pmw-divider', role: 'separator', tabindex: '0', 'aria-valuemin': '0', 'aria-valuemax': '100' },
    [h('i', { class: 'pmw-divider-line', 'aria-hidden': 'true' })]);
  state.centre.appendChild(el);
  if (PMW.dividers) PMW.dividers.bind(el);
  return el;
}
function updateDividerAria(el, d, l) {
  var s = model.find(l || state.layout, d.split);
  if (!s || s.node.t !== 'split') return;
  var before = 0;
  for (var i = 0; i <= d.index; i++) before += s.node.sizes[i];
  el.setAttribute('aria-valuenow', String(Math.round(before * 100)));
  el.setAttribute('aria-label', d.dir === 'row' ? 'Resize the panels to the left and right' : 'Resize the panels above and below');
}

/* ---- the missing-kind body (a kind not loaded in this build) ---- */
PMW.missingKind = {
  id: 'missing', min: PANEL_MIN,
  mount: function (host) {
    host.appendChild(h('div', { class: 'pmw-empty-note' }, [
      h('p', { text: 'This tab needs a part of Puppet Master that is not loaded in this build.' })
    ]));
    return {};
  }
};

/* ---- labels ----
   Order: the user's label, the label the kind pushed (api.update), the kind's labelFor(id, state) (so a tab that is not
   mounted yet, opened in the background, by an agent or restored, still shows its real label), the state's file name or
   title, the tab's hover title, the kind's label. The hover title falls back to the same label. */
var labelForFailed = {};
function kindLabelFor(k, rec) {
  if (!k || typeof k.labelFor !== 'function') return null;
  try {
    var v = k.labelFor(rec.id, rec.state || {});
    return v == null || v === '' ? null : String(v);
  } catch (err) {
    if (!labelForFailed[k.id]) { labelForFailed[k.id] = 1; try { console.error('[pm-home] labelFor failed for the ' + k.id + ' kind', err); } catch (_) {} }
    return null;
  }
}
function tabLabel(rec) {
  if (!rec) return '';
  if (rec.userLabel) return rec.userLabel;
  if (rec.label) return rec.label;
  var k = kindDef(rec.kind);
  var own = kindLabelFor(k, rec);
  if (own) return own;
  var s = rec.state || {};
  if (s.path) return String(s.path).split('/').pop();
  if (s.title) return String(s.title);
  if (rec.title) return rec.title;
  return k ? k.label : 'Tab';
}
PMW.tabLabel = tabLabel;
function tabTitle(rec) {
  if (!rec) return '';
  if (rec.title) return rec.title;
  var s = rec.state || {};
  if (s.path) return s.path;
  return tabLabel(rec);
}
PMW.tabTitle = tabTitle;

/* CONTRACT section 3: every mounted instance hears a look change once, at the next frame after it (the core's look
   watcher already defers past the attribute write) */
bus.on('look', function (lk) {
  for (var id in instances) {
    var e = instances[id];
    if (e.instance && typeof e.instance.onLook === 'function') {
      try { e.instance.onLook(lk); } catch (err) { try { console.error('[pm-home] onLook failed', err); } catch (_) {} }
    }
  }
});
