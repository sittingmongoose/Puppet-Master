/* The panel framework every Lens panel uses.
   Layout: head (title menu + icon tools, identity line) / morphing icon tabs / index list (one shared selection
   highlight that slides between rows) / footer. A spec (10-files, 20-source, 30-docker) supplies the identity line,
   tools, view bodies, Lens documents, footer and local actions.

   spec = {
     identity(P) -> node,            tools(P, view) -> [{ a, run?, menu?, onPick?, toggled? }],
     panelGroup(P) -> menu group,    lessUsed: [viewId] (first into the More tab menu),
     renderView(P, view, list),      itemLens(P, item, ctx) -> parts overrides,   rowEnd(P, item) -> node,
     footer(P, view) -> node|null,   locals: { id(P, action, el) },   contextMenu(P, entry, x, y),
     multi: bool (Ctrl/Shift-click multi-select), onSelect(P, entry), onRender(P) } */

function cMountPanel(panel, view, ctx, spec) {
  const P = {
    panel, view, ctx, spec, menus: Object.assign({}, panel.menus || {}),
    entries: new Map(), order: [], sel: null, multi: new Set(), viewId: null, offs: [], shown: false, firstShow: true,
  };
  P.views = () => PMR.viewsOf(panel);
  P.viewDef = () => P.views().find(v => v.id === P.viewId) || P.views()[0];
  const stateKey = 'view.' + panel.id + (panel.id === 'source' ? '.' + PMR.state.get('source.engine', 'git') : '');
  P.viewId = CST.get(stateKey, (P.views()[0] || {}).id);
  if (!P.views().some(v => v.id === P.viewId)) P.viewId = (P.views()[0] || {}).id;

  /* ---- skeleton ---- */
  const root = h('div.pmr-c-panel', { 'data-panel': panel.id });
  const titleBtn = h('button', { type: 'button', class: 'pmr-c-titlebtn pmr-title', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'title:' + panel.id },
    h('span.pmr-c-title-text', { text: panel.title }), PMR.icon('chevD', 'pmr-c-title-chev'));
  PMR.hover(titleBtn, panel.title + ' views', (panel.hover && panel.hover.detail) || 'Every view of this panel, with what each one holds');
  const headRow = h('div.pmr-c-headrow', titleBtn);
  const ident = h('div.pmr-c-ident');
  const head = h('header.pmr-c-head', headRow, ident);
  const tabs = h('div.pmr-c-tabs', { role: 'tablist', 'aria-label': panel.title + ' views' });
  const hl = h('div.pmr-c-hl', { 'aria-hidden': 'true' });
  const content = h('div.pmr-c-content');
  const list = h('div.pmr-c-list', hl, content);
  const scroll = h('div.pmr-c-scroll', { role: 'tabpanel' }, list);
  const foot = h('footer.pmr-c-foot');
  root.append(head, tabs, scroll, foot);
  view.appendChild(root);
  Object.assign(P, { root, head, headRow, titleBtn, ident, tabs, scroll, list, content, hl, foot, scrollEl: scroll });
  let tools = null;

  /* ---- title menu: every view with its count and summary, then the panel's own actions ---- */
  titleBtn.addEventListener('click', ev => {
    ev.preventDefault();
    const groups = [{
      label: 'Views',
      items: P.views().map(v => ({
        value: v.id, label: v.label, icon: v.icon,
        meta: v.conditional && !v.conditional.shown ? 'hidden' : (v.count != null ? String(v.count) : ''),
        attrs: { 'data-pmr-nav': 'tab' },
      })),
    }];
    const extra = spec.panelGroup ? spec.panelGroup(P) : null;
    if (extra && extra.items && extra.items.length) groups.push(extra);
    PMR.menu.toggle({ id: 'c-title-' + panel.id, label: panel.title + ' views', value: P.viewId, groups }, titleBtn, {
      menus: P.menus, width: 284,
      onPick: it => { if (it.value != null && P.views().some(v => v.id === it.value)) P.setView(it.value); else if (it.__run) it.__run(); },
    });
  });

  /* ---- morphing icon tabs ---- */
  const tabEls = new Map();
  const moreTab = h('button', { type: 'button', class: 'pmr-c-tab pmr-c-tab-more pmr-strip', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'tabmore:' + panel.id },
    h('span.pmr-c-tab-ico', PMR.icon('chevD')));
  PMR.hover(moreTab, 'More views', 'Views that do not fit in the strip');
  let moreIds = [];
  moreTab.addEventListener('click', ev => {
    ev.preventDefault();
    const items = moreIds.map(id => P.views().find(v => v.id === id)).filter(Boolean).map(v => ({
      value: v.id, label: v.label, icon: v.icon, meta: v.conditional && !v.conditional.shown ? 'hidden' : (v.count != null ? String(v.count) : ''),
      attrs: { 'data-pmr-nav': 'tab' },
    }));
    PMR.menu.toggle({ id: 'c-more-' + panel.id, label: 'More views', value: P.viewId, groups: [{ items }] }, moreTab, { width: 260, onPick: it => P.setView(it.value) });
  });
  function buildTabs() {
    tabs.replaceChildren();
    tabEls.clear();
    P.views().forEach(v => {
      const att = v.attention ? cGlyph({ state: v.attention.state }, { loud: true }) : null;
      if (att) att.classList.add('pmr-c-tab-att');
      const t = h('button', {
        type: 'button', role: 'tab', class: 'pmr-c-tab pmr-strip pmr-chosen', 'data-view': v.id,
        'data-pmr-nav': 'tab', 'data-pmr-nav-id': 'tab:' + panel.id + ':' + v.id, 'aria-label': v.label,
      },
      h('span.pmr-c-tab-ico', PMR.icon(v.icon || 'layers'), att),
      h('span.pmr-c-tab-label', h('span.pmr-c-tab-text', { text: v.label })));
      const detail = [v.count != null ? cPlural(v.count, 'item') : null, v.summary, v.attention ? v.attention.text : null].filter(Boolean).join(' · ');
      t.setAttribute('data-pm-hover-label', v.label);
      if (detail) t.setAttribute('data-pm-hover-detail', detail);
      t.addEventListener('click', ev => { ev.preventDefault(); P.setView(v.id); });
      tabs.appendChild(t);
      tabEls.set(v.id, t);
    });
    tabs.appendChild(moreTab);
    markTabs();
  }
  function markTabs() {
    tabEls.forEach((t, id) => {
      const on = id === P.viewId;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.setAttribute('tabindex', on ? '0' : '-1');
    });
  }
  function measureTabs() {
    tabEls.forEach(t => { const tx = t.querySelector('.pmr-c-tab-text'); if (tx) t.style.setProperty('--w', Math.ceil(tx.offsetWidth + 2) + 'px'); });
  }
  function fitTabs() {
    const avail = tabs.clientWidth;
    if (!avail) return;
    measureTabs();
    const vs = P.views();
    const act = P.viewId;
    const forced = new Set(vs.filter(v => v.conditional && !v.conditional.shown && v.id !== act).map(v => v.id));
    let shown = vs.filter(v => !forced.has(v.id)).map(v => v.id);
    const widthOf = id => (id === act ? 28 + 10 + (parseFloat(tabEls.get(id).style.getPropertyValue('--w')) || 60) : 28) + 2;
    const total = ids => ids.reduce((s, id) => s + widthOf(id), 0) + ((ids.length < vs.length) ? 30 : 0);
    const order = (spec.lessUsed || []).slice().reverse().concat(vs.map(v => v.id).reverse());
    for (const id of order) {
      if (total(shown) <= avail) break;
      if (id === act || !shown.includes(id)) continue;
      shown = shown.filter(x => x !== id);
    }
    moreIds = vs.map(v => v.id).filter(id => !shown.includes(id));
    tabEls.forEach((t, id) => { t.hidden = !shown.includes(id); });
    moreTab.hidden = moreIds.length === 0;
  }

  /* ---- view switching ---- */
  P.setView = (id, o) => {
    o = o || {};
    if (!P.views().some(v => v.id === id)) return;
    if (id === P.viewId && !o.force) return;
    const vs = P.views();
    const from = vs.findIndex(v => v.id === P.viewId), to = vs.findIndex(v => v.id === id);
    if (LENS.owner === P) cLensHide('view');
    P.viewId = id;
    CST.set(stateKey, id);
    markTabs();
    const t = tabEls.get(id);
    if (t && !MO.reduced()) MO.animate(t.querySelector('.pmr-c-tab-ico'), [{ transform: 'translateX(0)' }, { transform: 'translateX(-1px)' }, { transform: 'none' }], { dur: 'med', ease: 'spring', fill: 'none' });
    renderBody();
    fitAll();
    if (!o.quiet && !MO.reduced()) {
      const dir = to > from ? 1 : -1;
      MO.animate(content, [{ opacity: 0, transform: `translateX(${dir * 14}px)` }, { opacity: 1, transform: 'none' }], { dur: 'med', ease: 'ease', fill: 'none' });
    }
  };

  /* ---- index rows ---- */
  P.reg = entry => { P.entries.set(entry.key, entry); P.order.push(entry.key); return entry; };
  /* o: { key, name, mono, icon, end, depth, folder, open, dim, strong, hoverLabel, hoverDetail, role, attrs, build,
          kind, kindIcon, item, activate, cls, tree, level } */
  P.row = o => {
    const tree = o.depth != null;
    const nameEl = h('span', { class: ['pmr-c-name', o.mono && 'is-mono', o.strong && 'is-strong'] });
    if (o.mono || o.fit) { nameEl.dataset.full = o.name; nameEl.textContent = o.name; } else nameEl.textContent = o.name;
    const row = h('div', Object.assign({
      class: ['pmr-c-row', 'pmr-cur', tree && 'is-tree', o.folder && 'is-folder', o.dim && 'is-dim', o.cls],
      role: tree ? 'treeitem' : 'option', tabindex: '-1', 'aria-selected': 'false', 'data-key': o.key,
      'data-pmr-nav': o.build || o.folder ? 'select' : null,
      'data-pmr-nav-id': 'row:' + panel.id + ':' + P.viewId + ':' + o.key,
      'aria-level': tree ? String(o.depth + 1) : null, 'aria-expanded': o.folder ? String(!!o.open) : null,
      style: tree ? { '--d': String(Math.min(o.depth, 6)) } : null,
    }, o.attrs || {}),
    tree ? h('span.pmr-c-twisty', { 'aria-hidden': 'true' }, o.folder ? PMR.icon('chevR') : null) : null,
    o.icon ? PMR.icon(o.icon, 'pmr-c-rico') : (o.lead || null),
    nameEl,
    h('span.pmr-c-end', o.end || null));
    if (o.hoverLabel) PMR.hover(row, o.hoverLabel, o.hoverDetail || '');
    P.reg({ key: o.key, el: row, item: o.item, kind: o.kind, kindIcon: o.kindIcon || o.icon, label: o.name, build: o.build, activate: o.activate, folder: o.folder, depth: o.depth, toggle: o.toggle, parentKey: o.parentKey });
    if (P.sel === o.key) { row.classList.add('is-current'); row.setAttribute('aria-selected', 'true'); row.tabIndex = 0; }
    return row;
  };
  /* a definition line: label left, value right; selectable when it has a Lens */
  P.factLine = (key, label, value, o) => {
    o = o || {};
    const v = h('span', { class: ['pmr-c-fl-v', o.mono && 'is-mono'], text: value });
    const el = h('div', { class: ['pmr-c-fl', o.build && 'pmr-c-row pmr-cur is-fact'], role: o.build ? 'option' : null, tabindex: o.build ? '-1' : null, 'data-key': o.build ? key : null,
      'data-pmr-nav': o.build ? 'select' : null, 'data-pmr-nav-id': o.build ? 'row:' + panel.id + ':' + P.viewId + ':' + key : null },
    h('span.pmr-c-fl-k', { text: label }), o.state ? cGlyph({ state: o.state }) : null, v, o.extra || null);
    if (o.build) P.reg({ key, el, item: o.item, kind: o.kind, kindIcon: o.icon, label, build: o.build });
    if (String(value).length > 22) PMR.hover(v, label, value);
    return el;
  };

  /* ---- sections: sentence-case heading, plain count, one quiet text action, the rest in a small menu ---- */
  P.section = (sec, fill, o) => {
    o = o || {};
    const k = 'sec.' + panel.id + '.' + P.viewId + '.' + sec.id;
    const collapsible = o.collapsible !== false;
    let open = collapsible ? CST.get(k, sec.open === true || o.open === true) : true;
    const body = h('div.pmr-c-secbody', { role: 'group', 'aria-label': sec.label });
    const btn = h('button', { type: 'button', class: ['pmr-c-sechead-btn', 'pmr-head'], 'aria-expanded': String(open), disabled: collapsible ? null : true },
      collapsible ? PMR.icon('chevR', 'pmr-c-chev') : null,
      h('span.pmr-c-sec-label', { text: o.label || sec.label }),
      sec.count != null && sec.count !== '' ? h('span', { class: ['pmr-c-sec-count', typeof sec.count === 'number' && 'pmr-num'], text: String(sec.count) }) : null);
    const setNav = () => { if (collapsible && !open) { btn.setAttribute('data-pmr-nav', 'expand'); btn.setAttribute('data-pmr-nav-id', 'sec:' + panel.id + ':' + P.viewId + ':' + sec.id); } else { btn.removeAttribute('data-pmr-nav'); btn.removeAttribute('data-pmr-nav-id'); } };
    setNav();
    const acts = (o.actions || sec.actions || []).filter(Boolean);
    const actEls = [];
    if (acts.length) {
      const first = acts[0];
      const b = first.local ? h('button', { type: 'button', class: 'pmr-btn pmr-btn-quiet pmr-c-secact' }, h('span.pmr-btn-label', { text: first.label })) : PMR.button(first, { variant: 'quiet', cls: 'pmr-c-secact' });
      if (first.local) b.addEventListener('click', () => P.local(first.local, first, b));
      b.querySelectorAll('.pmr-btn-ico').forEach(x => x.remove());
      if (first.attrs && first.attrs['aria-label']) b.setAttribute('aria-label', first.attrs['aria-label']);
      actEls.push(b);
      if (acts.length > 1) {
        const mb = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet pmr-c-secmore', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'secmore:' + panel.id + ':' + P.viewId + ':' + sec.id }, PMR.icon('chevD'));
        PMR.hover(mb, 'More ' + (o.label || sec.label).toLowerCase() + ' actions', acts.slice(1).map(a => a.label).join(', '));
        mb.addEventListener('click', ev => { ev.preventDefault(); PMR.menu.toggle({ id: 'c-sec-' + sec.id, label: (o.label || sec.label) + ' actions', groups: [{ label: sec.note && o.noteInMenu ? sec.note : null, items: acts.slice(1) }] }, mb, { align: 'end', menus: P.menus }); });
        actEls.push(mb);
      }
    }
    const status = sec.status && o.showStatus !== false ? cGlyph(sec.status) : null;
    if (status) PMR.hover(status, sec.status.word);
    const actsEl = h('span.pmr-c-sechead-acts', { hidden: !open }, actEls);
    const headEl = h('div.pmr-c-sechead', btn, status, actsEl);
    const el = h('section', { class: ['pmr-c-sec', open ? 'is-open' : 'is-closed'], 'data-sec': sec.id }, headEl, body);
    let filled = false;
    const doFill = () => { if (!filled) { filled = true; fill(body); } };
    if (open) doFill(); else body.hidden = true;
    if (collapsible) btn.addEventListener('click', () => {
      open = !open;
      CST.set(k, open);
      btn.setAttribute('aria-expanded', String(open));
      el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
      actsEl.hidden = !open;
      setNav();
      if (open) { doFill(); cFitNames(body); }
      MO.height(body, open, { dur: 'med' });
      P.track(MO.reduced() ? 0 : 420);
      if (open && !MO.reduced()) MO.stagger(Array.from(body.children).slice(0, 10), { dy: 4, step: 16 });
    });
    return el;
  };

  /* ---- shared highlight and Lens tracking while rows move (expanders) ---- */
  let trackUntil = 0, trackRaf = 0;
  P.track = ms => {
    trackUntil = Math.max(trackUntil, performance.now() + (ms || 0));
    hl.classList.add('is-tracking');
    const step = () => {
      syncHl(false);
      if (LENS.owner === P) cLensPlace();
      if (performance.now() < trackUntil) trackRaf = requestAnimationFrame(step);
      else { trackRaf = 0; hl.classList.remove('is-tracking'); }
    };
    if (!trackRaf) trackRaf = requestAnimationFrame(step);
  };
  function syncHl(animate) {
    const e = P.sel && P.entries.get(P.sel);
    const row = e && e.el;
    if (!row || !row.isConnected || !row.offsetParent || row.classList.contains('is-fact')) { hl.classList.remove('is-on'); return; }
    const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top;
    const wasOn = hl.classList.contains('is-on');
    if (!animate || !wasOn) hl.classList.add('is-snap');
    hl.style.height = row.offsetHeight + 'px';
    hl.style.transform = `translate3d(0, ${Math.round(top)}px, 0)`;
    hl.classList.add('is-on');
    if (!animate || !wasOn) { void hl.offsetWidth; hl.classList.remove('is-snap'); }
  }
  P.syncHl = syncHl;

  /* ---- selection ---- */
  function markSel(prevKey, key) {
    const prev = prevKey && P.entries.get(prevKey);
    if (prev && prev.el) { prev.el.classList.remove('is-current'); prev.el.setAttribute('aria-selected', 'false'); prev.el.tabIndex = -1; }
    P.multi.forEach(k => { const e = P.entries.get(k); if (e && e.el && k !== key) e.el.classList.add('is-multi'); });
    const e = key && P.entries.get(key);
    if (e && e.el) { e.el.classList.add('is-current'); e.el.classList.remove('is-multi'); e.el.setAttribute('aria-selected', 'true'); e.el.tabIndex = 0; }
  }
  function clearMulti() { P.entries.forEach(e => e.el && e.el.classList.remove('is-multi')); }
  P.select = (key, o) => {
    o = o || {};
    const e = P.entries.get(key);
    if (!e) return;
    const ev = o.event;
    if (ev && spec.multi && (ev.ctrlKey || ev.metaKey || ev.shiftKey) && !e.noMulti) {
      if (ev.shiftKey && P.sel) {
        const keys = visibleRows().map(r => r.getAttribute('data-key'));
        const a = keys.indexOf(P.sel), b = keys.indexOf(key);
        if (a >= 0 && b >= 0) keys.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(k => P.multi.add(k));
      } else if (P.multi.has(key)) P.multi.delete(key); else P.multi.add(key);
      if (P.sel) P.multi.add(P.sel);
      clearMulti();
      P.multi.forEach(k => { const x = P.entries.get(k); if (x && x.el && k !== P.sel) x.el.classList.add('is-multi'); });
      if (spec.onSelect) spec.onSelect(P, e);
      return;
    }
    const was = P.sel;
    P.sel = key;
    clearMulti();
    P.multi = new Set([key]);
    markSel(was, key);
    if (e.folder && o.toggleFolder && e.toggle) {
      const isOpen = e.el.getAttribute('aria-expanded') === 'true';
      if (!isOpen) e.toggle(true); else if (was === key) e.toggle(false);
    }
    syncHl(true);
    if (o.focus) { e.el.focus({ preventScroll: true }); e.el.scrollIntoView({ block: 'nearest' }); }
    if (o.lens !== false && e.build) cLensShow(P, { key, el: e.el, build: e.build, label: e.label, kind: e.kind, icon: e.kindIcon });
    else if (LENS.owner === P && !e.build) cLensHide('select');
    if (spec.onSelect) spec.onSelect(P, e);
  };
  P.clearSelection = () => {
    const was = P.sel;
    P.sel = null; P.multi = new Set();
    clearMulti();
    markSel(was, null);
    hl.classList.remove('is-on');
    if (LENS.owner === P) cLensHide('clear');
    if (spec.onSelect) spec.onSelect(P, null);
  };
  P.activate = key => {
    const e = P.entries.get(key);
    if (!e) return;
    if (e.folder && e.toggle) { e.toggle(e.el.getAttribute('aria-expanded') !== 'true'); return; }
    if (e.activate) { e.activate(); return; }
    const a = cPrimary(e.item);
    if (a) {
      if (a.local) P.local(a.local, a, e.el); else cRunAction(a, view);
      if (LENS.owner === P && !LENS.pinned) cLensHide('activate');
    } else if (e.build) cLensShow(P, { key, el: e.el, build: e.build, label: e.label, kind: e.kind, icon: e.kindIcon });
  };
  P.onLensClosed = () => {};
  P.local = (id, a, el) => { const fn = spec.locals && spec.locals[id]; if (fn) fn(P, a, el); };

  /* ---- list events: click selects (and opens the Lens), double-click / Enter run the primary action ---- */
  function visibleRows() { return Array.from(content.querySelectorAll('.pmr-c-row')).filter(r => r.offsetParent !== null && !r.closest('[hidden]')); }
  P.off = [];
  P.off.push(cOn(content, 'click', ev => {
    const row = ev.target.closest('.pmr-c-row');
    if (!row || !content.contains(row)) return;
    if (ev.target.closest('button, a, input, textarea') && !ev.target.closest('.pmr-c-twisty')) return;
    const key = row.getAttribute('data-key');
    const e = P.entries.get(key);
    if (!e) return;
    if (ev.target.closest('.pmr-c-twisty') && e.folder && e.toggle) { e.toggle(row.getAttribute('aria-expanded') !== 'true'); return; }
    P.select(key, { event: ev, toggleFolder: true });
  }));
  P.off.push(cOn(content, 'dblclick', ev => {
    const row = ev.target.closest('.pmr-c-row');
    if (!row || ev.target.closest('button, input, textarea') || ev.target.closest('.pmr-c-twisty')) return;
    const e = P.entries.get(row.getAttribute('data-key'));
    if (e && !e.folder) P.activate(e.key);
  }));
  P.off.push(cOn(content, 'contextmenu', ev => {
    const row = ev.target.closest('.pmr-c-row');
    if (!row || !spec.contextMenu) return;
    const e = P.entries.get(row.getAttribute('data-key'));
    if (!e) return;
    if (spec.contextMenu(P, e, ev.clientX, ev.clientY, ev) !== false) ev.preventDefault();
  }));
  let typed = '', typedT = 0;
  P.off.push(cOn(content, 'keydown', ev => {
    const row = ev.target.closest('.pmr-c-row');
    if (!row || ev.target !== row) return;
    const rows = visibleRows();
    const i = rows.indexOf(row);
    const key = row.getAttribute('data-key');
    const e = P.entries.get(key);
    const go = j => { const r = rows[cClamp(j, 0, rows.length - 1)]; if (r) P.select(r.getAttribute('data-key'), { focus: true, lens: true }); };
    const k = ev.key;
    if (k === 'ArrowDown') { ev.preventDefault(); go(i + 1); }
    else if (k === 'ArrowUp') { ev.preventDefault(); go(i - 1); }
    else if (k === 'Home') { ev.preventDefault(); go(0); }
    else if (k === 'End') { ev.preventDefault(); go(rows.length - 1); }
    else if (k === 'ArrowRight' && e && e.folder) {
      ev.preventDefault();
      if (row.getAttribute('aria-expanded') !== 'true') e.toggle(true); else go(i + 1);
    } else if (k === 'ArrowLeft' && e && e.depth != null) {
      ev.preventDefault();
      if (e.folder && row.getAttribute('aria-expanded') === 'true') e.toggle(false);
      else if (e.parentKey && P.entries.get(e.parentKey)) P.select(e.parentKey, { focus: true, lens: true });
    } else if (k === 'Enter') { ev.preventDefault(); P.activate(key); }
    else if (k === ' ') {
      ev.preventDefault();
      if (LENS.open && LENS.owner === P && LENS.key === key) cLensHide('space', { focusRow: true });
      else if (e && e.build) P.select(key, { lens: true });
    } else if ((k === 'F10' && ev.shiftKey) || k === 'ContextMenu') {
      if (spec.contextMenu && e) { ev.preventDefault(); const r = row.getBoundingClientRect(); spec.contextMenu(P, e, r.left + 24, r.bottom - 4, ev); }
    } else if (k === 'Escape' && LENS.open && LENS.owner === P) { ev.preventDefault(); cLensHide('escape', { focusRow: true }); }
    else if (k.length === 1 && /\S/.test(k) && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      clearTimeout(typedT); typed += k.toLowerCase(); typedT = setTimeout(() => { typed = ''; }, 700);
      const start = typed.length === 1 ? i + 1 : i;
      for (let n = 0; n < rows.length; n++) {
        const r = rows[(start + n) % rows.length];
        if ((r.querySelector('.pmr-c-name') || r).getAttribute('data-full') ? r.querySelector('.pmr-c-name').dataset.full.toLowerCase().startsWith(typed) : (r.textContent || '').trim().toLowerCase().startsWith(typed)) {
          P.select(r.getAttribute('data-key'), { focus: true, lens: LENS.open && LENS.owner === P }); break;
        }
      }
    }
  }));
  /* focus entering the list lands on the current row (roving tabindex) */
  P.off.push(cOn(scroll, 'focusin', ev => {
    if (ev.target === scroll) { const r = (P.sel && P.entries.get(P.sel) && P.entries.get(P.sel).el) || visibleRows()[0]; if (r) r.focus({ preventScroll: true }); }
  }));
  P.off.push(cOn(scroll, 'scroll', () => { if (LENS.owner === P) cLensPlaceSoon(); }, { passive: true }));

  /* ---- render ---- */
  function renderHead() {
    ident.replaceChildren();
    const idn = spec.identity ? spec.identity(P) : null;
    if (idn) ident.append(idn);
    ident.hidden = !idn;
  }
  function renderTools() {
    if (tools) tools.remove();
    const list = spec.tools ? spec.tools(P, P.viewDef()) : [];
    tools = cTools(P, list);
    headRow.appendChild(tools);
    P.tools = tools;
  }
  function renderBody() {
    P.entries.clear(); P.order = [];
    const keepSel = P.sel;
    P.sel = null;
    content.replaceChildren();
    hl.classList.remove('is-on');
    const v = P.viewDef();
    content.setAttribute('data-view', v.id);
    scroll.setAttribute('aria-label', v.label);
    if (v.conditional && !v.conditional.shown) renderEmpty(v);
    else spec.renderView(P, v, content);
    (v.notes || []).forEach(n => content.appendChild(h('p.pmr-c-note', { text: n })));
    if (v.canonNote) content.appendChild(h('p.pmr-c-note', { text: v.canonNote }));
    if (keepSel && P.entries.has(keepSel)) { P.sel = keepSel; markSel(null, keepSel); }
    else { const first = visibleRows()[0]; if (first) first.tabIndex = 0; }
    renderTools();
    renderFoot();
    if (spec.onRender) spec.onRender(P);
    requestAnimationFrame(() => { cFitNames(content); syncHl(false); });
  }
  function renderEmpty(v) {
    const em = v.empty || {};
    const c = v.conditional || {};
    content.appendChild(h('div.pmr-c-empty',
      h('div.pmr-c-empty-ico', PMR.icon(v.icon || 'info')),
      h('p.pmr-c-empty-t', { text: em.text || v.summary }),
      c.why ? h('p.pmr-c-empty-why', { text: c.why }) : null,
      (em.action || c.action) ? cActRow(Object.assign({}, em.action || c.action), { P }) : null));
  }
  function renderFoot() {
    foot.replaceChildren();
    const f = spec.footer ? spec.footer(P, P.viewDef()) : null;
    if (f) foot.append(f);
    foot.hidden = !f;
  }
  P.renderBody = renderBody;
  P.renderFoot = renderFoot;
  P.renderHead = renderHead;
  P.rerender = () => { renderHead(); buildTabs(); renderBody(); fitAll(); };

  function fitAll() {
    fitTabs();
    if (tools) {
      const tt = titleBtn.querySelector('.pmr-c-title-text');
      const natural = Math.ceil((tt ? tt.scrollWidth : 80) + 30);
      const avail = headRow.clientWidth - natural - 6;
      tools.fit(avail);
    }
    cFitNames(content);
    cFitNames(foot);
    syncHl(false);
  }
  P.fitAll = fitAll;
  let fitRaf = 0;
  const ro = window.ResizeObserver ? new ResizeObserver(() => { if (fitRaf) return; fitRaf = requestAnimationFrame(() => { fitRaf = 0; if (root.offsetParent) fitAll(); }); }) : null;
  if (ro) ro.observe(root);

  renderHead();
  buildTabs();
  renderBody();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { C_FONT_CACHE.clear(); if (root.isConnected && root.offsetParent) fitAll(); });

  function entrance() {
    if (MO.reduced()) return;
    const rows = visibleRows().slice(0, 16);
    MO.stagger([head, tabs].concat(rows), { dy: 6, step: 18, max: 18 });
  }

  return {
    show(info) {
      P.shown = true;
      requestAnimationFrame(() => {
        fitAll();
        if (P.firstShow || (info && info.reason === 'switch')) entrance();
        P.firstShow = false;
      });
    },
    hide() {
      P.shown = false;
      if (LENS.owner === P) cLensHide('panel');
    },
    destroy() {
      if (LENS.owner === P) cLensDestroy();
      else if (!LENS.open) cLensDestroy();
      P.off.forEach(f => f());
      if (ro) ro.disconnect();
      if (trackRaf) cancelAnimationFrame(trackRaf);
      if (spec.destroy) spec.destroy(P);
      root.remove();
    },
  };
}

/* ---------- generic item rows and Lens documents (used by every spec) ---------------------------------------- */
function cRowEnd(P, item) {
  if (P.spec.rowEnd) { const x = P.spec.rowEnd(P, item); if (x !== undefined) return x; }
  if (item.letter) return PMR.letterEl(item.letter);
  if (item.status) { const g = cGlyph(item.status); return g; }
  return null;
}
function cItemRow(P, item, o) {
  o = o || {};
  const kindWord = (P.spec.kindWord && P.spec.kindWord(P, item)) || KIND_WORD[item.kind] || 'Item';
  const icon = item.icon || KIND_ICON[item.kind] || 'file';
  const statusWord = item.status ? item.status.word : '';
  const detail = [statusWord, (item.meta || [])[0], item.time].filter(Boolean).join(' · ');
  return P.row(Object.assign({
    key: o.key || item.id, item, kind: kindWord, kindIcon: icon,
    name: o.name || item.name, mono: item.mono, icon: o.icon || icon,
    end: o.end !== undefined ? o.end : cRowEnd(P, item),
    hoverLabel: o.name || item.name, hoverDetail: detail,
    build: () => cDocFor(P, item, o.ctx || {}),
  }, o.row || {}));
}
/* the Lens document for an item: generic parts plus the spec's related block and extra actions */
function cDocFor(P, item, ctx) {
  const parts = {
    P, navKey: P.panel.id + ':' + item.id,
    title: item.name, mono: item.mono,
    sub: item.path && item.path !== item.name ? item.path : null,
    status: item.status, letter: item.letter, diff: item.diff,
    line: [item.time, item.owner].filter(Boolean),
    blocked: item.blocked ? { reason: item.blocked.reason, allowed: item.blocked.allowed, title: 'Blocked: ' + String(item.blocked.code || '').replace(/_/g, ' ') } : null,
    note: item.note, facts: (item.facts || []).slice(), related: [], actions: (item.actions || []).slice(), notes: [],
  };
  if ((item.meta || []).length) parts.meta = item.meta.join(' · ');
  if (P.spec.itemLens) P.spec.itemLens(P, item, parts, ctx || {});
  return cLensDoc(parts);
}
/* a 'facts' section (Publish and review, Remote projection, Compose project, ...) is one row whose Lens holds it */
function cSectionDoc(P, sec, extra) {
  const facts = [], related = [], acts = (sec.actions || []).slice();
  (sec.items || []).forEach(it => {
    facts.push([it.name, (it.meta || []).join(' · ') || (it.status ? it.status.word : ''), { mono: it.mono, state: it.status ? it.status.state : null }]);
    (it.facts || []).forEach(f => facts.push(f));
    (it.actions || []).forEach(a => acts.push(a));
    if (it.children && it.children.length) {
      related.push(h('div.pmr-c-lens-block', cLensHeading(it.name + (it.note ? '' : '')),
        it.note ? h('p.pmr-c-lens-meta', { text: it.note }) : null,
        h('div.pmr-c-mini', it.children.map(c => h('div.pmr-c-mini-row', PMR.icon(KIND_ICON[c.kind] || 'globe', 'pmr-c-mini-ico'),
          h('span', { class: ['pmr-c-mini-name', c.mono && 'is-mono'], text: c.name }),
          h('span.pmr-c-mini-meta', { text: (c.meta || []).join(' · ') }),
          c.status ? cStatusWordEl(c.status) : null)))));
    }
  });
  return cLensDoc(Object.assign({
    P, navKey: P.panel.id + ':sec:' + sec.id, title: sec.label, status: sec.status, note: sec.note,
    facts, related, actions: acts,
  }, extra || {}));
}
