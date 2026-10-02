/* Concept A — Files. Explorer is the one place rows stay single-line (a 28 px tree for scanning); Changed and Open are
   ledger rows. Selecting rows brings up a calm selection bar at the bottom with what you can do with them; the ops
   tray is the last line of the panel. */

const FILES_DEFAULT_OPEN = ['src', 'web/src', 'web/src/routes', 'web/src/routes/recipe/[id]'];
const LETTER_STATE = { M: 'modified', A: 'added', D: 'deleted', '?': 'untracked', C: 'conflict' };

function filesContextGroups(panel) {
  const m = panel.menus && panel.menus.fileContext;
  return m ? m.groups : [];
}
function filesRowMenu(inst, item) {
  const quick = PMR.fileQuick(item).concat((item.actions || []).filter(a => a.primary));
  return { id: 'a-file-' + item.id, label: item.name, groups: [{ label: item.name, items: menuItemsOf(quick) }].concat(filesContextGroups(inst.panel)) };
}
function filesContextAt(inst, ev) {
  ev.preventDefault();
  PMR.menu.at(inst.panel.menus.fileContext, ev.clientX, ev.clientY, { menus: inst.menus });
}

/* ---------- the explorer tree ------------------------------------------------------------------------------------ */
function filesTree(inst, v, sec) {
  const T = inst.tree = {
    open: new Set(FILES_DEFAULT_OPEN.concat(PMR.util.flatten(sec.items).filter(x => x.item.open).map(x => x.item.id))),
    sel: new Set(), anchor: null, focus: null, filter: '', hideIgnored: !!PMR.state.get('files.hideIgnored', false), rows: new Map(),
  };
  const flat = [];
  (function walk(list, depth, parent) {
    (list || []).forEach(item => {
      flat.push({ item, depth, parent });
      if (item.children) walk(item.children, depth + 1, item);
      if (item.capped) flat.push({ item: { id: item.id + '#capped', kind: 'capped', capped: item.capped, parentItem: item }, depth: depth + 1, parent: item });
    });
  })(sec.items, 0, null);
  T.flat = flat;
  const byId = new Map(flat.map(x => [x.item.id, x]));
  const tree = h('div.pmr-a-tree', { role: 'tree', 'aria-label': 'Files in ' + ((inst.panel.menus.root || {}).value || 'main'), 'aria-multiselectable': 'true' });

  flat.forEach(rec => {
    const { item, depth } = rec;
    if (item.kind === 'capped') {
      const c = item.capped;
      const el = h('div', { class: 'pmr-a-trow pmr-a-tcapped', role: 'none', style: { '--d': Math.min(depth, 6) } },
        h('span.pmr-a-guides', { 'aria-hidden': 'true' }), h('span.pmr-a-tchev.is-empty'),
        h('span.pmr-a-tcapt', { text: 'Showing ' + c.shown + ' of ' + c.total }),
        act(c.action, { variant: 'quiet', cls: 'pmr-a-sm' }));
      PMR.hover(el.querySelector('.pmr-a-tcapt'), 'Showing ' + c.shown + ' of ' + c.total, c.note);
      T.rows.set(item.id, { el, rec });
      tree.appendChild(el);
      return;
    }
    const isDir = item.kind === 'folder';
    const at = item.attrs || {};
    const letter = item.letter || null;
    const roll = isDir ? (item.rollup || PMR.rollup(item.children || [])) : null;
    const rollState = roll ? (roll.state || null) : null;
    const rollLetter = rollState ? ({ modified: 'M', added: 'A', deleted: 'D', untracked: '?', conflict: 'C' })[rollState] : null;
    const ignored = at['data-ignored'] === '1';
    const ro = at['data-readonly'] === '1';
    const primary = (item.actions || []).find(a => a.primary);
    const nameNode = nameEl(item.name, { mono: true, hover: false });
    const nameCarrier = !isDir && primary
      ? h('span', Object.assign({ class: 'pmr-a-tname' }, PMR.actionAttrs(Object.assign({}, primary, { primary: false }))), nameNode)
      : h('span.pmr-a-tname', nameNode);
    const chev = isDir ? h('span.pmr-a-tchev', { 'aria-hidden': 'true' }, ico('chevR', 'pmr-a-chev')) : h('span.pmr-a-tchev.is-empty', { 'aria-hidden': 'true' });
    const right = h('span.pmr-a-tright');
    if (letter) right.appendChild(PMR.letterEl(letter, LETTER_STATE[letter]));
    else if (rollLetter) right.appendChild(h('span.pmr-a-roll', PMR.letterEl(rollLetter, rollState)));
    else if (ro) right.appendChild(PMR.glyph('info'));
    const more = h('button', { type: 'button', class: 'pmr-a-more', tabindex: '-1', 'aria-haspopup': 'menu' }, dots());
    PMR.hover(more, 'More actions', item.path || item.name);
    const el = h('div', {
      class: cx('pmr-a-trow pmr-cur', isDir && 'is-dir', ignored && 'is-ignored', item.active && 'is-current', ro && 'is-readonly'),
      role: 'treeitem', 'aria-level': String(depth + 1), 'aria-selected': 'false', tabindex: '-1',
      style: { '--d': Math.min(depth, 6) }, 'data-canon': item.canon || (roll && roll.canon) || null,
    }, h('span.pmr-a-guides', { 'aria-hidden': 'true' }), chev, ico(isDir ? 'folder' : (item.icon || 'file'), 'pmr-a-ticon'), nameCarrier, h('span.pmr-a-trcol', right, more));
    Object.keys(at).forEach(k => el.setAttribute(k, at[k]));
    if (item.active) el.setAttribute('aria-current', 'true');
    if (rollState && isDir) el.setAttribute('data-roll', rollState);
    const detail = [item.path || item.name];
    if (item.meta) detail.push(item.meta.join(' · '));
    if (roll && roll.word) detail.push(roll.word);
    else if (roll && roll.count) detail.push(roll.count + ' changed');
    if (item.status && item.status.word && !letter) detail.push(item.status.word);
    if (item.note) detail.push(item.note);
    if (item.active) detail.push('the file open in the editor');
    PMR.hover(el, item.name, detail.slice(1).join(' · ') || item.path);
    T.rows.set(item.id, { el, rec, isDir, more });
    tree.appendChild(el);

    more.addEventListener('click', ev => {
      ev.preventDefault(); ev.stopPropagation();
      if (!T.sel.has(item.id)) selectOnly(item.id);
      PMR.menu.toggle(filesRowMenu(inst, item), more, { menus: inst.menus, align: 'end' });
    });
    chev.addEventListener('click', ev => { if (!isDir) return; ev.stopPropagation(); setFolder(item.id, !T.open.has(item.id), true); selectOnly(item.id, true); });
    el.addEventListener('click', ev => {
      if (ev.target.closest('.pmr-a-more')) return;
      if (ev.shiftKey && T.anchor) { selectRange(T.anchor, item.id); return; }
      if (ev.ctrlKey || ev.metaKey) { toggleSel(item.id); return; }
      if (isDir) {
        const wasSel = T.sel.has(item.id) && T.sel.size === 1;
        selectOnly(item.id);
        if (!T.open.has(item.id)) setFolder(item.id, true, true);
        else if (wasSel) setFolder(item.id, false, true);
      } else selectOnly(item.id);
    });
    el.addEventListener('dblclick', ev => { if (isDir && !ev.target.closest('.pmr-a-more')) { ev.preventDefault(); } });
    el.addEventListener('contextmenu', ev => { if (!T.sel.has(item.id)) selectOnly(item.id); filesContextAt(inst, ev); });
  });

  function visibleRec(rec) {
    let p = rec.parent;
    while (p) { if (!T.open.has(p.id) && !T.filter) return false; p = byId.get(p.id) ? byId.get(p.id).parent : null; }
    const it = rec.item;
    if (T.hideIgnored && ((it.attrs && it.attrs['data-ignored'] === '1') || (rec.parent && rec.parent.attrs && rec.parent.attrs['data-ignored'] === '1') || (it.parentItem && it.parentItem.attrs && it.parentItem.attrs['data-ignored'] === '1'))) return false;
    if (T.filter) {
      const q = T.filter.toLowerCase();
      if (it.kind === 'capped') return false;
      const self = (it.path || it.name || '').toLowerCase().includes(q);
      if (self) return true;
      if (it.kind === 'folder') return PMR.util.flatten(it.children || []).some(x => (x.item.path || x.item.name || '').toLowerCase().includes(q));
      return false;
    }
    return true;
  }
  function refresh(anim) {
    const shownBefore = new Set();
    T.rows.forEach(r => { if (!r.el.hidden) shownBefore.add(r.el); });
    T.rows.forEach(({ el, rec, isDir }) => {
      el.hidden = !visibleRec(rec);
      if (isDir) {
        const open = T.open.has(rec.item.id) || !!T.filter;
        el.setAttribute('aria-expanded', String(open));
        el.classList.toggle('is-open', open);
      }
      navFor(rec.item.id);
    });
    if (anim) {
      const added = []; T.rows.forEach(r => { if (!r.el.hidden && !shownBefore.has(r.el)) added.push(r.el); });
      cascade(added, { dy: -4, step: 14, max: 12, dur: M.spec().fast });
    }
    fitNames(tree);
    const any = Array.from(T.rows.values()).some(r => !r.el.hidden);
    empty.hidden = any;
    notice.hidden = !T.hideIgnored;
  }
  function navFor(id) {
    const r = T.rows.get(id); if (!r || !r.rec || r.rec.item.kind === 'capped') return;
    const kind = r.isDir && !T.open.has(id) ? 'expand' : 'select';
    setNav(r.el, kind, navIdOf('tr', id), true);
  }
  function setFolder(id, open, anim) {
    if (open) T.open.add(id); else T.open.delete(id);
    refresh(anim && open);
  }
  function paintSel() {
    T.rows.forEach(({ el, rec }, id) => { if (rec.item.kind !== 'capped') { const on = T.sel.has(id); el.setAttribute('aria-selected', String(on)); el.classList.toggle('is-selected', on); } });
    if (inst.selBar) inst.selBar.update();
  }
  function selectOnly(id, keepFocus) {
    T.sel = new Set([id]); T.anchor = id; focusRow(id, !keepFocus); paintSel();
  }
  function toggleSel(id) { if (T.sel.has(id)) T.sel.delete(id); else T.sel.add(id); T.anchor = id; focusRow(id, true); paintSel(); }
  function selectRange(a, b) {
    const vis = flat.filter(r => r.item.kind !== 'capped' && !T.rows.get(r.item.id).el.hidden).map(r => r.item.id);
    const i = vis.indexOf(a), j = vis.indexOf(b);
    if (i < 0 || j < 0) return selectOnly(b);
    T.sel = new Set(vis.slice(Math.min(i, j), Math.max(i, j) + 1)); focusRow(b, true); paintSel();
  }
  function focusRow(id, doFocus) {
    T.focus = id;
    T.rows.forEach((r, rid) => { if (r.rec.item.kind !== 'capped') r.el.tabIndex = rid === id ? 0 : -1; });
    if (doFocus) { const r = T.rows.get(id); if (r && document.activeElement && inst.view.contains(document.activeElement)) r.el.focus({ preventScroll: false }); }
  }
  T.clear = () => { T.sel = new Set(); paintSel(); };
  T.selected = () => Array.from(T.sel).map(id => byId.get(id)).filter(Boolean).map(r => r.item);
  T.collapseAll = () => {
    const anyOpen = flat.some(r => r.item.kind === 'folder' && T.open.has(r.item.id));
    if (anyOpen) T.open.clear(); else flat.forEach(r => { if (r.item.kind === 'folder' && !(r.item.attrs && r.item.attrs['data-capped'])) T.open.add(r.item.id); });
    refresh(!anyOpen);
    return anyOpen;
  };
  T.setHideIgnored = on => { T.hideIgnored = on; PMR.state.set('files.hideIgnored', on); refresh(false); };
  T.setFilter = q => { T.filter = q || ''; refresh(false); };
  T.refresh = refresh;

  tree.addEventListener('keydown', ev => {
    const id = T.focus; const r = id && T.rows.get(id); if (!r) return;
    const vis = flat.filter(x => x.item.kind !== 'capped' && !T.rows.get(x.item.id).el.hidden).map(x => x.item.id);
    const i = vis.indexOf(id);
    const item = r.rec.item;
    const go = nid => { if (nid) { if (ev.shiftKey) selectRange(T.anchor || id, nid); else selectOnly(nid); } };
    switch (ev.key) {
      case 'ArrowDown': ev.preventDefault(); go(vis[i + 1]); break;
      case 'ArrowUp': ev.preventDefault(); go(vis[i - 1]); break;
      case 'Home': ev.preventDefault(); go(vis[0]); break;
      case 'End': ev.preventDefault(); go(vis[vis.length - 1]); break;
      case 'ArrowRight': ev.preventDefault(); if (r.isDir && !T.open.has(id)) setFolder(id, true, true); else if (r.isDir) go(vis[i + 1]); break;
      case 'ArrowLeft': ev.preventDefault(); if (r.isDir && T.open.has(id)) setFolder(id, false, false); else if (r.rec.parent) go(r.rec.parent.id); break;
      case 'Enter': ev.preventDefault(); if (r.isDir) setFolder(id, !T.open.has(id), true); else { const c = r.el.querySelector('.pmr-a-tname[data-demo-action]'); if (c) c.click(); } break;
      case ' ': ev.preventDefault(); toggleSel(id); break;
      case 'Escape': if (T.sel.size) { ev.preventDefault(); T.clear(); } break;
      case 'ContextMenu': { ev.preventDefault(); const rc = r.el.getBoundingClientRect(); filesContextAt(inst, { preventDefault() {}, clientX: rc.left + 48, clientY: rc.bottom - 4 }); break; }
      case 'F10': if (ev.shiftKey) { ev.preventDefault(); const rc = r.el.getBoundingClientRect(); filesContextAt(inst, { preventDefault() {}, clientX: rc.left + 48, clientY: rc.bottom - 4 }); } break;
      default:
        if (ev.key.length === 1 && /\S/.test(ev.key) && !ev.ctrlKey && !ev.metaKey) {
          const low = ev.key.toLowerCase();
          for (let n = 1; n <= vis.length; n++) { const cand = vis[(i + n) % vis.length]; if ((byId.get(cand).item.name || '').toLowerCase().startsWith(low)) { go(cand); break; } }
        }
    }
    void item;
  });

  /* the reveal-hidden notice (F-079): shown while ignored files are hidden */
  const nt = (v.notices || [])[0];
  const notice = h('div.pmr-a-notice', { hidden: true, 'data-canon': nt ? nt.canon : null },
    PMR.glyph('info'), h('span.pmr-a-notice-t', { text: nt ? nt.text : 'Ignored files are hidden.' }),
    nt && nt.action ? act(nt.action, { variant: 'quiet', cls: 'pmr-a-sm', onLocal: () => { T.setHideIgnored(false); if (inst.syncIgnoredBtn) inst.syncIgnoredBtn(); } }) : null);
  const empty = h('p.pmr-a-tempty', { hidden: true, text: 'No files match this filter.' });
  refresh(false);
  focusRow(flat.find(r => r.item.active) ? flat.find(r => r.item.active).item.id : flat[0].item.id, false);
  return [notice, tree, empty];
}

/* ---------- selection bar and ops tray (the panel's bottom) ----------------------------------------------------- */
function filesFooter(inst) {
  const panel = inst.panel;
  const sel = panel.selection || { actions: [] };
  const selActs = sel.actions.filter(a => !a.local);
  const clearA = sel.actions.find(a => a.local === 'fmSelClear');
  const num = h('span.pmr-a-selnum.pmr-num', { text: '0' });
  const label = h('span.pmr-a-selk', num, ' ', sel.countLabel || 'selected');
  const name = h('span.pmr-a-selname');
  const clearB = iconAct(clearA || { label: 'Clear selection', icon: 'x', local: 'fmSelClear' }, { onLocal: () => inst.tree && inst.tree.clear() });
  const moreB = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-a-iact', 'aria-haspopup': 'menu' }, dots());
  PMR.hover(moreB, 'All file actions', 'Cut, copy, paste, rename, delete, open with and more');
  setNav(moreB, 'menu', navIdOf('selmore', 'files'), true);
  const acts = h('div.pmr-a-acts.pmr-a-selacts');
  const bar = h('div.pmr-a-selbar', { hidden: true, role: 'region', 'aria-label': 'Selection' },
    h('div.pmr-a-selhead', label, name, h('span.pmr-a-selbtns', moreB, clearB)), acts);
  moreB.addEventListener('click', ev => {
    ev.preventDefault();
    const items = inst.tree ? inst.tree.selected() : [];
    const groups = [{ label: 'Selection', items: menuItemsOf(selActs) }];
    if (items.length === 1) groups.unshift({ label: items[0].name, items: menuItemsOf(PMR.fileQuick(items[0])) });
    PMR.menu.toggle({ id: 'a-files-sel', label: 'File actions', groups: groups.concat(filesContextGroups(panel)) }, moreB, { menus: inst.menus, align: 'end' });
  });
  let shown = false;
  inst.selBar = {
    update() {
      const items = inst.tree ? inst.tree.selected() : [];
      const n = items.length;
      tick(num, n);
      name.textContent = '';
      acts.textContent = '';
      if (n === 1) {
        const it = items[0];
        name.appendChild(nameEl(it.path || it.name, { mono: true }));
        PMR.fileQuick(it).forEach(a => acts.appendChild(act(a, { variant: 'quiet', cls: 'pmr-a-sm' })));
      } else if (n > 1) {
        selActs.forEach(a => acts.appendChild(act(a, { variant: 'quiet', cls: 'pmr-a-sm' })));
      }
      if (n && !shown) {
        shown = true; bar.hidden = false;
        if (!reduced()) {
          if (stepped()) animateEl(bar, [{ opacity: 0 }, { opacity: 1 }], { duration: 60, easing: 'steps(2, end)' });
          else animateEl(bar, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: M.spec().med, easing: fam() === 'friendly' ? M.spec().spring : M.spec().ease });
        }
      } else if (!n && shown) {
        shown = false;
        const an = !reduced() ? animateEl(bar, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px)' }], { duration: M.spec().fast, easing: stepped() ? 'steps(2, end)' : M.spec().ease }) : null;
        if (an) an.onfinish = () => { if (!shown) bar.hidden = true; }; else bar.hidden = true;
      }
      requestAnimationFrame(() => fitNames(bar));
    },
  };

  /* ops tray: one copy in progress, with cancel (F-076) */
  const ops = panel.ops;
  let tray = null;
  if (ops && ops.items && ops.items.length) {
    const op = ops.items[0];
    const prog = op.progress || { done: 0, total: 1 };
    const fill = h('span.pmr-a-progfill', { style: { transform: `scaleX(${(prog.done / prog.total).toFixed(3)})` } });
    const opRow = row(inst, op, {
      cls: 'pmr-a-oprow', icons: false, wordAt: 'l2', navScope: 'ops', primary: null,
      l2: it => (it.meta || []).slice(),
      right: () => { const c = op.actions.find(a => a.local === 'opsCancel'); return c ? act(c, { variant: 'quiet', cls: 'pmr-a-sm pmr-a-opcancel', onLocal: (l, b) => cancelOp(b) }) : null; },
      onLocal: (l, b) => { if (l === 'opsCancel') cancelOp(b); },
    });
    function cancelOp() {
      if (tray.classList.contains('is-cancelled')) return;
      tray.classList.add('is-cancelled');
      tray.querySelectorAll('[data-local="opsCancel"]').forEach(x => { x.setAttribute('aria-disabled', 'true'); PMR.hover(x, 'Cancel', 'This copy was cancelled after 3 of 50 files.'); });
      const nm = tray.querySelector('.pmr-a-l1 .pmr-a-name'); if (nm) { nm.setAttribute('data-full', 'Copy cancelled after 3 of 50 files'); nm.textContent = 'Copy cancelled after 3 of 50 files'; fitNames(tray); }
    }
    tray = h('div.pmr-a-ops', { role: 'status', 'data-canon': ops.canon || null }, opRow, h('div.pmr-a-prog', { 'aria-hidden': 'true' }, fill));
  }
  return h('div.pmr-a-filesfoot', bar, tray);
}

/* ---------- the panel ---------------------------------------------------------------------------------------------- */
function renderFiles(panel, view, ctx) {
  const ctxLine = panel.context.lines[0];
  const inst = makePanel(panel, view, ctx, {
    identity() {
      const trig = PMR.menu.trigger(panel.menus.root, { icon: 'branch', cls: 'pmr-a-trigger', hover: ctxLine.hover });
      setNav(trig, 'menu', navIdOf('root', 'files'), true);
      return h('div.pmr-a-idline.is-nowrap', h('span.pmr-a-idk', { text: 'Worktree' }), trig, h('span.pmr-a-idsp'), PMR.statusEl(panel.context.state));
    },
    toolbar(inst2, v) {
      if (v.id !== 'explorer') return null;
      const onLocal = (l, b) => {
        const T = inst2.tree; if (!T) return;
        if (l === 'fmCollapseAll') {
          const collapsed = T.collapseAll();
          b.querySelector('.pmr-ico').replaceWith(ico(collapsed ? 'boxPlus' : 'boxMinus', 'pmr-btn-ico'));
          PMR.hover(b, collapsed ? 'Expand all' : 'Collapse all', 'Collapse or expand all folders');
        } else if (l === 'fmHideIgnored') {
          T.setHideIgnored(!T.hideIgnored); syncIgnored();
        } else if (l === 'fmFilterToggle') {
          const open = filterRow.hidden;
          filterRow.hidden = !open; b.setAttribute('aria-pressed', String(open)); b.classList.toggle('is-on', open);
          setNav(b, 'expand', navIdOf('filter', 'files'), !open);
          if (open) { if (!reduced()) animateEl(filterRow, stepped() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: M.spec().fast, easing: stepped() ? 'steps(2, end)' : M.spec().ease }); input.focus(); }
          else { input.value = ''; T.setFilter(''); }
        }
      };
      let ignoredBtn = null;
      const btns = (v.toolbar || []).map(a => {
        const b = iconAct(a, { onLocal });
        if (a.local === 'fmHideIgnored') { b.setAttribute('aria-pressed', 'false'); ignoredBtn = b; }
        if (a.local === 'fmFilterToggle') { b.setAttribute('aria-pressed', 'false'); setNav(b, 'expand', navIdOf('filter', 'files'), true); }
        return b;
      });
      const syncIgnored = () => {
        const on = !!(inst2.tree && inst2.tree.hideIgnored);
        if (!ignoredBtn) return;
        ignoredBtn.setAttribute('aria-pressed', String(on)); ignoredBtn.classList.toggle('is-on', on);
        ignoredBtn.querySelector('.pmr-ico').replaceWith(ico(on ? 'eyeOff' : 'eye', 'pmr-btn-ico'));
        PMR.hover(ignoredBtn, on ? 'Show ignored files' : 'Hide ignored files', on ? 'Ignored files are hidden from the tree' : 'Ignored files are shown dimmed');
      };
      inst2.syncIgnoredBtn = syncIgnored;
      const f = v.filter || {};
      const input = h('input', { type: 'search', class: 'pmr-a-filterin', placeholder: f.placeholder || 'Filter files', 'aria-label': f.label || 'Filter files', id: 'pmrAFilesFilter' });
      const clearB = f.action ? iconAct(f.action, { onLocal: () => { input.value = ''; if (inst2.tree) inst2.tree.setFilter(''); input.focus(); } }) : null;
      const filterRow = h('div.pmr-a-filterrow', { hidden: true }, ico('search', 'pmr-a-filterico'), input, clearB);
      input.addEventListener('input', PMR.util.debounce(() => { if (inst2.tree) inst2.tree.setFilter(input.value.trim()); }, 80));
      input.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); const fb = btns.find(b => b.getAttribute('data-local') === 'fmFilterToggle'); if (fb) fb.click(); } });
      setTimeout(syncIgnored, 0);
      return h('div.pmr-a-tooltree', h('div.pmr-a-toolbar.is-icons', btns), filterRow);
    },
    pane(inst2, v) {
      const ctxOf = (ev) => filesContextAt(inst2, ev);
      if (v.id === 'explorer') {
        const sec = v.sections[0];
        const foot = (panel.footer || []).length ? h('div.pmr-a-notes.pmr-a-colophon', panel.footer.map(t => h('p', { text: t }))) : null;
        return [h('section.pmr-a-sec.pmr-a-kind-tree', { 'data-sec': sec.id }, filesTree(inst2, v, sec)), foot];
      }
      return defaultPane(inst2, v, {
        rowOpts: (s, vv) => {
          if (vv.id === 'changed') return { primary: s.items.length ? undefined : null, context: ctxOf, l2: it => (it.meta || []) };
          if (s.id === 'recent') return { flat: true, l2: () => [], context: ctxOf };
          return {
            context: ctxOf, wordAt: 'l2', primary: null,
            l2: it => [stateWord(it.status), (it.meta || [])[0], it.active ? 'you are here' : null],
            right: it => (it.status ? PMR.glyph(it.status.state) : null),
          };
        },
      });
    },
    footer(inst2) { return filesFooter(inst2); },
    onShowPane(inst2, v) { inst2.foot.classList.toggle('is-other-view', v.id !== 'explorer'); },
  });
  return inst;
}
