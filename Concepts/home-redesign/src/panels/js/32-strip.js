/* The tab strip (D5), one for every panel. Anatomy, left to right:
     [narrow switcher] [pinned tabs] [tabs ...] [+N] [+]  ...  [panel menu]      (corner grip at the top right)
   Widths are set by the fitter, never by flex shrinking (the old strip's `flex-shrink:1 !important` is what killed its
   overflow): natural 96-200 px, then inactive tabs shrink to 72, then to 36 px icons; the active tab keeps at least
   120 px and never hides; then a contiguous window of tabs around the active one stays and "+N" counts the rest.
   ARIA tabs pattern: arrows, Home/End, Enter/Space, Delete closes, Shift+F10 the tab menu. */

var TAB = PMW.TAB = { max: 200, natural: 96, shrunk: 72, icon: 36, activeMin: 120, pinned: 36, gap: 8, padL: 10, padR: 4, iconSlot: 16, iconGap: 6, close: 24, plus: 28, more: 34, menu: 28, stripPadL: 6, stripPadR: 6, gripReserve: 14 };
var strip = PMW.strip = {};
var measureCtx = null, measureCache = {};

/* label widths are measured on a real hidden label inside the strip (the same font, size, weight and letter
   spacing the look gives a tab, web fonts included), cached per text and look, cleared when fonts finish loading */
var measureHost = null;
function labelWidth(text, font, host, italic) {
  var key = font + '|' + (italic ? 'i|' : '') + text;
  if (measureCache[key] != null) return measureCache[key];
  if (!host) return Math.ceil(text.length * 7);
  var m = host._pmwMeasure;
  if (!m || !m.isConnected) {
    m = h('div', { class: 'pmw-tab pmw-measure', 'aria-hidden': 'true' }, [h('span', { class: 'pmw-tlabel' })]);
    host.appendChild(m);
    host._pmwMeasure = m;
  }
  setAttr(m, 'data-preview', !!italic);
  var lab = m.firstChild;
  lab.textContent = text;
  var w = Math.ceil(lab.getBoundingClientRect().width);
  measureCache[key] = w;
  return w;
}
if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', function () { measureCache = {}; render.schedule({ animate: false }); });
var fontCache = { at: 0, value: '' };
function stripFont(stripEl) {
  var now = Date.now();
  if (fontCache.value && now - fontCache.at < 500) return fontCache.value;
  var probe = stripEl;
  var cs = getComputedStyle(probe);
  fontCache.value = (cs.fontStyle || 'normal') + ' ' + (cs.fontWeight || '400') + ' ' + (cs.fontSize || '12px') + ' ' + (cs.fontFamily || 'sans-serif');
  fontCache.at = now;
  return fontCache.value;
}
bus.on('look', function () { measureCache = {}; fontCache.value = ''; });

/* natural width of a tab: icon + gap + label + marks + close slot + padding, clamped */
function naturalWidth(rec, font, host) {
  var label = tabLabel(rec);
  // padding, icon, the two 6 px gaps (icon-label, label-close), the label, the 24 px close slot, 2 px of slack
  var w = TAB.padL + TAB.iconSlot + TAB.iconGap + labelWidth(label, font, host, !!rec.preview) + TAB.iconGap + TAB.close + TAB.padR + 2;
  if (rec.exitCode != null) w += labelWidth(String(rec.exitCode), font, host) + 18;
  if (rec.agent) w += 14;
  return clamp(w, TAB.natural, TAB.max);
}

/* fit(): decide each tab's width and which tabs hide. Pure: returns { widths: {id: px}, size: {id: 'full'|'shrunk'|'icon'}, hidden: [ids] }
   frozen (during a tab drag): { id: px } as the tabs were at the grab, -1 for a tab that was behind "+N" */
strip.fit = function (tabs, recs, activeId, avail, font, frozen, host) {
  var res = { widths: {}, size: {}, hidden: [] };
  var pinned = tabs.filter(function (t) { return recs[t].pinned; });
  var rest = tabs.filter(function (t) { return !recs[t].pinned; });
  pinned.forEach(function (t) { res.widths[t] = TAB.pinned; res.size[t] = 'pinned'; });
  var room = avail - pinned.length * (TAB.pinned + TAB.gap);
  if (frozen) {
    // while a tab is dragged, nothing reflows under the silhouette: the same widths, and the same tabs behind "+N"
    // (so "+N" keeps its count and stays a drop target); a tab opened during the drag waits behind "+N" too
    rest.forEach(function (t) {
      var fw = frozen[t];
      if (fw === -1 || fw == null) { res.hidden.push(t); return; }
      res.widths[t] = fw || TAB.shrunk;
      res.size[t] = fw && fw <= TAB.icon ? 'icon' : 'full';
    });
    return res;
  }
  if (!rest.length) return res;
  var nat = {};
  rest.forEach(function (t) { nat[t] = naturalWidth(recs[t], font, host); });
  var activeIn = rest.indexOf(activeId) >= 0;
  var aW = activeIn ? Math.max(TAB.activeMin, nat[activeId]) : 0;
  var others = rest.filter(function (t) { return t !== activeId; });
  var gaps = rest.length * TAB.gap;
  // the active tab gives up width (down to 120) before the others shrink past a step; it never covers "+" or "+N"
  function activeFor(each) { return activeIn ? Math.max(TAB.activeMin, Math.min(aW, room - gaps - others.length * each)) : 0; }
  var sumNat = others.reduce(function (a, t) { return a + nat[t]; }, 0) + aW + gaps;
  if (sumNat <= room) {
    rest.forEach(function (t) { res.widths[t] = t === activeId ? aW : nat[t]; res.size[t] = 'full'; });
    return res;
  }
  if (!others.length) {   // the active tab alone: as wide as the room allows, never under 120
    res.widths[activeId] = activeFor(0); res.size[activeId] = res.widths[activeId] < nat[activeId] ? 'shrunk' : 'full';
    return res;
  }
  // 1. shrink inactive tabs evenly toward 72 (a tab never grows past its natural width)
  var a1 = activeFor(TAB.shrunk), roomOthers = room - a1 - gaps;
  if (roomOthers / others.length >= TAB.shrunk) {
    // tabs narrower than the share keep their width; the rest split what is left
    var sorted = others.slice().sort(function (a, b) { return nat[a] - nat[b]; });
    var left = roomOthers, n = sorted.length;
    sorted.forEach(function (t, i) {
      var fair = left / (n - i);
      var w = Math.min(nat[t], fair);
      res.widths[t] = Math.floor(w); left -= res.widths[t];
      res.size[t] = w < nat[t] ? 'shrunk' : 'full';
    });
    if (activeIn) { res.widths[activeId] = a1; res.size[activeId] = a1 < nat[activeId] ? 'shrunk' : 'full'; }
    return res;
  }
  // 2. icons at 36
  var a2 = activeFor(TAB.icon);
  if ((room - a2 - gaps) / others.length >= TAB.icon) {
    others.forEach(function (t) { res.widths[t] = TAB.icon; res.size[t] = 'icon'; });
    if (activeIn) { res.widths[activeId] = a2; res.size[activeId] = a2 < nat[activeId] ? 'shrunk' : 'full'; }
    return res;
  }
  // 3. a window of icon tabs around the active tab; the rest hide behind "+N" (the active tab leaves room for it)
  if (activeIn) aW = Math.max(TAB.activeMin, Math.min(aW, room - TAB.more - 2 * TAB.gap));
  var capacity = Math.max(0, Math.floor((room - TAB.more - (activeIn ? aW + TAB.gap : 0)) / (TAB.icon + TAB.gap)));
  var order = rest.slice();
  var ai = order.indexOf(activeId);
  var start = 0;
  var visibleOthers = capacity;
  if (ai >= 0) {
    // the window holds the active tab plus `capacity` others, as far left as possible
    start = Math.max(0, Math.min(ai, order.length - (capacity + 1)));
    if (ai - start > capacity) start = ai - capacity;
  }
  var shown = 0;
  order.forEach(function (t, i) {
    if (t === activeId) { res.widths[t] = aW; res.size[t] = aW < nat[t] ? 'shrunk' : 'full'; return; }
    if (i >= start && shown < visibleOthers) { res.widths[t] = TAB.icon; res.size[t] = 'icon'; shown += 1; }
    else res.hidden.push(t);
  });
  return res;
};

/* ---- render ---- */
strip.render = function (panelEl, p, l, opts) {
  opts = opts || {};
  var host = panelEl.querySelector('.pmw-strip-host');
  if (!host._pmw) buildStrip(host, p.id);
  var s = host._pmw;
  s.panelId = p.id;
  var narrow = !!opts.narrow;
  setAttr(host, 'data-narrow', narrow);
  // narrow switcher (D4 step 3)
  var panels = model.panels(l);
  setAttr(s.switcher, 'hidden', !narrow || panels.length < 2);
  if (narrow && panels.length > 1) {
    var idx = panels.map(function (x) { return x.id; }).indexOf(p.id) + 1;
    setText(s.switcherText, idx + '/' + panels.length);
    s.switcher.setAttribute('aria-label', 'Panel ' + idx + ' of ' + panels.length + ': switch panel');
  }
  // tabs
  var want = {};
  p.tabs.forEach(function (tid) { want[tid] = true; });
  Object.keys(s.tabEls).forEach(function (tid) { if (!want[tid]) { s.tabEls[tid].remove(); delete s.tabEls[tid]; } });
  var pinnedIds = p.tabs.filter(function (t) { return l.tabs[t].pinned; });
  var restIds = p.tabs.filter(function (t) { return !l.tabs[t].pinned; });
  pinnedIds.forEach(function (tid, i) { placeTab(s, s.pins, tid, i, l, p); });
  restIds.forEach(function (tid, i) { placeTab(s, s.tabsEl, tid, i, l, p); });
  setAttr(s.pins, 'hidden', !pinnedIds.length);
  setAttr(s.sep, 'hidden', !pinnedIds.length || !restIds.length);
  // fit against the panel's target width: an animated paint has only just written the new width, so the strip's own
  // clientWidth still reports where the glide starts (the panel-to-strip inset is the same at either end of it)
  var tr = opts.rects && opts.rects.panels && opts.rects.panels[p.id];
  var stripW = host.clientWidth;
  if (tr && panelEl.offsetWidth) stripW = Math.max(0, tr.w - (panelEl.offsetWidth - host.clientWidth));
  else if (!stripW) stripW = render.rects() && render.rects().panels[p.id] ? render.rects().panels[p.id].w : 0;
  s.fitW = stripW;
  var fixed = TAB.stripPadL + TAB.stripPadR + TAB.plus + TAB.menu + TAB.gripReserve + (narrow && panels.length > 1 ? 52 : 0) + (pinnedIds.length && restIds.length ? 9 : 0);
  var font = stripFont(host);
  var fit = strip.fit(p.tabs, l.tabs, p.active, Math.max(0, stripW - fixed), font, s.frozen, host);
  var hiddenSet = {};
  fit.hidden.forEach(function (t) { hiddenSet[t] = true; });
  s.hidden = fit.hidden.slice();
  p.tabs.forEach(function (tid) {
    var el = s.tabEls[tid];
    var w = fit.widths[tid];
    setAttr(el, 'hidden', !!hiddenSet[tid]);
    setAttr(el, 'data-size', fit.size[tid] || 'full');
    if (w != null && !hiddenSet[tid]) { var px = w + 'px'; if (el.style.width !== px) el.style.width = px; }
    middleEllipsis(el, l.tabs[tid], fit.size[tid], w, tid === p.active, host, font);
  });
  // +N: plain text, counts the hidden tabs only
  var n = fit.hidden.length;
  setAttr(s.more, 'hidden', !n);
  if (n) {
    setText(s.more, '+' + n);
    var activeHidden = hiddenSet[p.active];
    s.more.setAttribute('aria-label', n + ' more tab' + (n === 1 ? '' : 's') + (activeHidden ? ', including the active tab' : ''));
    s.more.setAttribute('data-pm-hover-label', n + ' more tab' + (n === 1 ? '' : 's'));
    s.more.setAttribute('data-pm-hover-detail', 'List the tabs that do not fit');
  }
  setAttr(s.lock, 'hidden', !p.locked);
  s.plus.setAttribute('data-pm-hover-label', 'New tab or panel');
  s.plus.setAttribute('data-pm-hover-detail', PMW.keyLabel(KEYS.plusMenu) + ' opens this menu, ' + PMW.keyLabel(KEYS.newTab) + ' makes a new tab of this panel\'s usual kind');
  setAttr(host, 'data-collapsed', p.collapsed ? 'yes' : null);
  if (PMW.shape) PMW.shape.sync(host, p, l, opts);
};

/* A shrunk file tab keeps both ends of its name ("rec\u2026es.rs"), so same-prefix files stay apart (research 6.3). */
function middleEllipsis(el, rec, size, w, active, host, font) {
  var lab = el.querySelector('.pmw-tlabel');
  var full = tabLabel(rec);
  if (size !== 'shrunk' || active || !w || !(rec.state && rec.state.path)) { if (lab.textContent !== full) lab.textContent = full; return; }
  var room = w - TAB.padL - TAB.iconSlot - TAB.iconGap - 8 - (rec.dirty ? TAB.close + TAB.iconGap : 0);
  if (labelWidth(full, font, host, !!rec.preview) <= room) { if (lab.textContent !== full) lab.textContent = full; return; }
  var dot = full.lastIndexOf('.');
  var tailLen = dot > 0 && full.length - dot <= 6 ? full.length - dot + 2 : 3;
  var tail = full.slice(-Math.min(tailLen, full.length - 1));
  var lo = 1, hi = Math.max(1, full.length - tail.length - 1), best = full.slice(0, 1) + '\u2026' + tail;
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    var cand = full.slice(0, mid) + '\u2026' + tail;
    if (labelWidth(cand, font, host, !!rec.preview) <= room) { best = cand; lo = mid + 1; } else hi = mid - 1;
  }
  if (lab.textContent !== best) lab.textContent = best;
}

function placeTab(s, container, tid, index, l, p) {
  var el = s.tabEls[tid] || (s.tabEls[tid] = createTab(s, tid));
  // while a tab is carried, the DOM order is the drag's (33-tabdrag.js commits it on release): a paint during the
  // drag only adds a tab that is new, at its group's end, and never moves one
  if (s.dragging) { if (el.parentNode !== container) container.appendChild(el); }
  else if (container.children[index] !== el) container.insertBefore(el, container.children[index] || null);
  updateTab(el, l.tabs[tid], p, l);
}

var tabSeqId = 0;
function createTab(s, tid) {
  tabSeqId += 1;
  var el = h('div', { class: 'pmw-tab', role: 'tab', id: 'pmw-tab-' + tabSeqId, tabindex: '-1', 'data-tab-id': tid, 'aria-selected': 'false' }, [
    h('span', { class: 'pmw-tico' }),
    h('span', { class: 'pmw-tlabel' }),
    h('span', { class: 'pmw-tmark', hidden: true }),
    h('span', { class: 'pmw-tclose', 'aria-hidden': 'true', 'data-pm-hover-label': 'Close', 'data-pmh': 'off' }, [h('i', { class: 'pmw-tdot' }), icon('close', { size: 12 })]),
    h('i', { class: 'pmw-tattn', 'aria-hidden': 'true' })
  ]);
  el._pmwId = tid;
  return el;
}

function updateTab(el, rec, p, l) {
  var active = p.active === rec.id;
  var label = tabLabel(rec);
  setAttr(el, 'aria-selected', active ? 'true' : 'false');
  el.tabIndex = active ? 0 : -1;
  setAttr(el, 'data-active', active);
  setAttr(el, 'data-kind', rec.kind);
  setAttr(el, 'data-preview', !!rec.preview);
  setAttr(el, 'data-dirty', !!rec.dirty);
  setAttr(el, 'data-pinned', !!rec.pinned);
  setAttr(el, 'data-attention', !!rec.attention);
  setAttr(el, 'data-busy', !!rec.busy);
  setAttr(el, 'data-failed', rec.exitCode != null && rec.exitCode !== 0);
  setAttr(el, 'data-agent', rec.agent || null);
  var inst = instances[rec.id];
  if (inst) el.setAttribute('aria-controls', inst.host.id); else el.removeAttribute('aria-controls');
  var lab = el.querySelector('.pmw-tlabel');
  setText(lab, label);
  // icon (kind icon, or the tab's own)
  var ico = el.querySelector('.pmw-tico');
  var k = kindDef(rec.kind);
  var iconName = rec.icon || (k && k.icon) || 'file';
  if (ico._name !== iconName) { ico.textContent = ''; ico.appendChild(kindIcon(iconName)); ico._name = iconName; }
  // marks: failed command's exit code (D12), agent mark
  var mark = el.querySelector('.pmw-tmark');
  var markText = rec.exitCode != null && rec.exitCode !== 0 ? String(rec.exitCode) : '';
  setAttr(mark, 'hidden', !markText && !rec.agent);
  if (mark._t !== markText + '|' + (rec.agent || '')) {
    mark.textContent = '';
    if (rec.agent) mark.appendChild(h('i', { class: 'pmw-agentmark', 'aria-hidden': 'true' }));
    if (markText) mark.appendChild(h('span', { class: 'pmw-exit', text: markText }));
    mark._t = markText + '|' + (rec.agent || '');
  }
  var desc = [];
  if (rec.preview) desc.push('preview');
  if (rec.dirty) desc.push('unsaved changes');
  if (rec.pinned) desc.push('pinned');
  if (rec.attention) desc.push('new');
  if (markText) desc.push('last command failed with exit code ' + markText);
  if (rec.agent) desc.push(rec.agent + ' is driving it');
  el.setAttribute('aria-label', label + (desc.length ? ', ' + desc.join(', ') : ''));
  el.setAttribute('data-pm-hover-label', tabTitle(rec));
  el.setAttribute('data-pm-hover-detail', desc.length ? desc.join(' · ') : (k ? k.label : ''));
}

function buildStrip(host, panelId) {
  host.classList.add('pmw-strip');
  host.setAttribute('data-pmh', 'off');
  var s = { panelId: panelId, tabEls: {}, hidden: [], frozen: null };
  s.switcher = h('button', { type: 'button', class: 'pmw-switcher pmw-sbtn', hidden: true, 'aria-haspopup': 'menu' }, [icon('panel', { size: 14 }), s.switcherText = h('span', { class: 'pmw-switcher-n' })]);
  s.pins = h('div', { class: 'pmw-pins', role: 'presentation' });
  s.sep = h('i', { class: 'pmw-pinsep', 'aria-hidden': 'true', hidden: true });
  s.tabsEl = h('div', { class: 'pmw-tabs', role: 'presentation' });
  s.list = h('div', { class: 'pmw-tablist', role: 'tablist', 'aria-orientation': 'horizontal' }, [s.pins, s.sep, s.tabsEl]);
  s.more = h('button', { type: 'button', class: 'pmw-more', hidden: true, 'aria-haspopup': 'dialog' });
  s.plus = h('button', { type: 'button', class: 'pmw-plus pmw-sbtn', 'aria-label': 'New tab or panel', 'aria-haspopup': 'menu', 'data-pmh': 'icon' }, [icon('plus', { size: 14 })]);
  s.fill = h('div', { class: 'pmw-strip-fill', 'aria-hidden': 'true' });
  s.lock = h('span', { class: 'pmw-lockmark', hidden: true, 'data-pm-hover-label': 'Locked', 'data-pm-hover-detail': 'Files open in other panels' }, [icon('lock', { size: 12 })]);
  s.menuBtn = h('button', { type: 'button', class: 'pmw-pmenu pmw-sbtn', 'aria-label': 'Panel options', 'aria-haspopup': 'menu', 'data-pm-hover-label': 'Panel options', 'data-pmh': 'icon' }, [icon('more', { size: 14 })]);
  s.grip = h('button', { type: 'button', class: 'pmw-grip', 'aria-label': 'Move panel (drag, or Enter then arrows)', 'data-pm-hover-label': 'Move panel', 'data-pm-hover-detail': 'Drag it to another place, or press Enter and use the arrows', 'data-pmh': 'off' }, [icon('grip', { size: 9 })]);
  s.plate = h('div', { class: 'pmw-plate', 'aria-hidden': 'true' });
  append(host, [s.plate, s.switcher, s.list, s.more, s.plus, s.fill, s.lock, s.menuBtn, s.grip]);
  host._pmw = s;
  wireStrip(host, s);
}

function stripPanel(s) { return model.panel(state.layout, s.panelId); }

function wireStrip(host, s) {
  s.list.addEventListener('pointerdown', function (e) {
    var tab = e.target.closest('.pmw-tab');
    if (!tab) return;
    if (e.button === 1) { e.preventDefault(); return; }
    if (e.button !== 0) return;
    if (e.target.closest('.pmw-tclose')) return;
    if (PMW.tabDrag) PMW.tabDrag.begin(e, tab, s);
  });
  s.list.addEventListener('auxclick', function (e) {
    var tab = e.target.closest('.pmw-tab');
    if (tab && e.button === 1) { e.preventDefault(); PMW.closeTab(tab._pmwId); }
  });
  s.list.addEventListener('click', function (e) {
    var tab = e.target.closest('.pmw-tab');
    if (!tab) return;
    if (e.target.closest('.pmw-tclose')) { e.stopPropagation(); PMW.closeTab(tab._pmwId); return; }
    if (e.altKey) { PMW.moveTabToNewPanel(tab._pmwId); return; }
    PMW.activateTab(tab._pmwId, { focus: true });
  });
  s.list.addEventListener('dblclick', function (e) {
    var tab = e.target.closest('.pmw-tab');
    if (tab && !e.target.closest('.pmw-tclose')) PMW.keepTab(tab._pmwId);
  });
  s.list.addEventListener('contextmenu', function (e) {
    var tab = e.target.closest('.pmw-tab');
    if (!tab) return;
    e.preventDefault();
    PMW.menus.tab(tab._pmwId, tab, { x: e.clientX, y: e.clientY });
  });
  s.list.addEventListener('keydown', function (e) { stripKey(e, s); });
  s.fill.addEventListener('dblclick', function () { PMW.toggleMaximize(s.panelId); });
  s.plus.addEventListener('click', function (e) { PMW.menus.plus(s.panelId, s.plus, { alt: e.altKey }); });
  s.plus.addEventListener('contextmenu', function (e) { e.preventDefault(); PMW.menus.plus(s.panelId, s.plus); });
  s.more.addEventListener('click', function () { PMW.menus.overflow(s.panelId, s.more); });
  s.menuBtn.addEventListener('click', function () { PMW.menus.panel(s.panelId, s.menuBtn); });
  s.switcher.addEventListener('click', function () { PMW.menus.switcher(s.panelId, s.switcher); });
  s.grip.addEventListener('pointerdown', function (e) { if (PMW.panelDrag) PMW.panelDrag.begin(e, s.panelId, s.grip); });
  s.grip.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (PMW.panelDrag) PMW.panelDrag.keyboard(s.panelId, s.grip); }
  });
  // collapsed panels expand when a tab is clicked (handled by activateTab) or the strip background is clicked
  host.addEventListener('click', function (e) {
    var p = stripPanel(s);
    if (p && p.collapsed && (e.target === host || e.target === s.fill)) PMW.setCollapsed(p.id, false);
  });
}

/* ARIA tabs keyboard: arrows move focus and activate (automatic activation), Home/End, Delete closes, Shift+F10 menu */
function stripKey(e, s) {
  var tab = e.target.closest('.pmw-tab');
  if (!tab) return;
  var p = stripPanel(s);
  if (!p) return;
  var visible = p.tabs.filter(function (t) { return s.hidden.indexOf(t) < 0; });
  var i = visible.indexOf(tab._pmwId);
  var go = null;
  if (e.key === 'ArrowRight') go = visible[(i + 1) % visible.length];
  else if (e.key === 'ArrowLeft') go = visible[(i - 1 + visible.length) % visible.length];
  else if (e.key === 'Home') go = visible[0];
  else if (e.key === 'End') go = visible[visible.length - 1];
  else if (e.key === 'Delete' || e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); PMW.closeTab(tab._pmwId); return; }
  else if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') { e.preventDefault(); PMW.menus.tab(tab._pmwId, tab); return; }
  else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    PMW.activateTab(tab._pmwId, { focus: true });
    return;
  }
  if (go) {
    e.preventDefault();
    PMW.activateTab(go, { focus: false });
    nextFrame(function () { var el = s.tabEls[go]; if (el) el.focus({ preventScroll: true }); });
  }
}

/* bring a tab into the visible window (activation already does it through the fitter) */
strip.reveal = function () {};
strip.stateOf = function (panelId) {
  var el = render.panelEl(panelId);
  return el ? el.querySelector('.pmw-strip-host')._pmw : null;
};
strip.tabEl = function (tabId) {
  var p = model.panelOf(state.layout, tabId);
  var s = p && strip.stateOf(p.id);
  return s ? s.tabEls[tabId] || null : null;
};

/* Alt+click on a tab, or "Move to new panel": the tab moves into a new panel by the fit rule */
PMW.moveTabToNewPanel = function (tabId) {
  var p = model.panelOf(state.layout, tabId);
  if (!p) return null;
  if (PMW.narrow && PMW.narrow.singleColumn()) { announce('The window is too narrow for another panel.'); return null; }
  var rects = render.rects();
  var edge = rects && geom.splitFits(state.layout, p.id, 'right', rects) ? 'right' : rects && geom.splitFits(state.layout, p.id, 'bottom', rects) ? 'bottom' : null;
  if (!edge) { PMW.toast('There is not room for another panel here.'); return null; }
  if (p.tabs.length === 1) { announce('This tab is already alone in its panel.'); return null; }
  return PMW.moveTabToSplit(tabId, p.id, edge);
};
