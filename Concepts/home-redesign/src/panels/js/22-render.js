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

render.paint = function (opts) {
  opts = opts || {};
  var c = state.centre, l = state.layout;
  if (!c || !l) return;
  if (c.offsetParent === null && !c.getClientRects().length) return;   // Home not shown: paint when it is
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
    updateDividerAria(el, d);
  });
  for (var k in dividerEls) if (!seen[k]) { dividerEls[k].remove(); delete dividerEls[k]; }

  // retire tab instances whose tabs are gone
  for (var tid in instances) if (!l.tabs[tid]) unmountTab(tid);

  if (animate) {
    state.moving = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      state.moving = false;
      c.classList.remove('pmw-animating');
      flushResizes(true);
    }, dur('med') + 40);
  }
  if (PMW.narrow) PMW.narrow.afterPaint(rects);
  bus.emit('paint', rects);
};

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
    if (!rec && (active || (kindDef(l.tabs[tid].kind) || {}).eager)) rec = mountTab(tid);
    if (!rec) continue;
    if (rec.host.parentNode !== body) body.appendChild(rec.host);   // a moved tab keeps its instance
    var visible = active && !panelHidden && !p.collapsed;
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
function mountTab(tabId) {
  var l = state.layout, recd = l.tabs[tabId];
  if (!recd) return null;
  var k = kindDef(recd.kind) || PMW.missingKind;
  tabSeq += 1;
  var host = h('div', { class: 'pmw-tabbody', role: 'tabpanel', id: 'pmw-tp-' + tabSeq, 'data-pmw-tab': tabId, 'data-pmw-kind': recd.kind, tabindex: '-1' });
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
      var p = model.panelOf(state.layout, entry.id);
      return PM_HOME.open(Object.assign({}, spec || {}, { where: direction === 'auto' || !direction ? 'split-auto' : direction, source: p && p.id }));
    },
    toggleMaximize: function () { var p = model.panelOf(state.layout, entry.id); if (p) PMW.toggleMaximize(p.id); },
    isMaximized: function () { var p = model.panelOf(state.layout, entry.id); return !!p && state.layout.view.maximized === p.id; },
    open: function (spec) {
      var p = model.panelOf(state.layout, entry.id);
      return PM_HOME.open(Object.assign({ source: p && p.id }, spec || {}));
    },
    menu: function (items, anchor, o) { return PMW.menu.open(items, anchor, o); },
    announce: announce,
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

/* ---- dividers (behaviour in 24-dividers.js) ---- */
function createDivider(d) {
  var el = h('div', { class: 'pmw-divider', role: 'separator', tabindex: '0', 'aria-valuemin': '0', 'aria-valuemax': '100' },
    [h('i', { class: 'pmw-divider-line', 'aria-hidden': 'true' })]);
  state.centre.appendChild(el);
  if (PMW.dividers) PMW.dividers.bind(el);
  return el;
}
function updateDividerAria(el, d) {
  var s = model.find(state.layout, d.split);
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

/* ---- labels ---- */
function tabLabel(rec) {
  if (!rec) return '';
  if (rec.userLabel) return rec.userLabel;
  if (rec.label) return rec.label;
  var s = rec.state || {};
  if (s.path) return String(s.path).split('/').pop();
  if (s.title) return s.title;
  var k = kindDef(rec.kind);
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
