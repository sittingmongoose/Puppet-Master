/* Concept B — Files. The summary page IS the Explorer tree (the most used view), with two compact destination rows
   pinned on top (Changed, Open editors). Folders expand inline for the first two levels; deeper, a folder opens as a
   page, so deep paths become pages with a crumb instead of ever-deeper indentation. Files open on click; their item
   page (every action, Restore this file, compare, details) is behind a trailing chevron. */

B.panels.files = (function () {
  const DEEP = 2;                       /* folders at this depth or deeper open as pages */
  const view = (panel, id) => (panel.views || []).find(v => v.id === id);
  const ctxItem = (panel, label) => { for (const g of panel.menus.fileContext.groups) for (const it of g.items) if (it.label === label) return it; return null; };
  const indent = d => Math.min(d, 3) * 14;
  const kidsOf = (it) => asList(it.children);

  function treeItems(panel) { const v = view(panel, 'explorer'); return v.sections[0].items; }
  /* the path as a breadcrumb: folders that exist in the tree open as pages (sideways); slashes allow line breaks */
  function pathCrumb(st, path, self) {
    const all = U.flatten(treeItems(st.panel)).map(x => x.item);
    const parts = String(path || '').split('/');
    const box = h('span.pmr-b-path.pmr-b-pathcrumb');
    parts.forEach((seg, i) => {
      const sub = parts.slice(0, i + 1).join('/');
      const f = i < parts.length - 1 ? all.find(x => x.kind === 'folder' && x.path === sub) : null;
      if (i) box.append('/', h('wbr'));
      if (f && f !== self) {
        const b = h('button', { type: 'button', class: 'pmr-b-pathseg', text: seg });
        PMR.hover(b, 'Open ' + sub, 'Its files as a page');
        b.addEventListener('click', ev => { ev.preventDefault(); st.jump(folderDesc(st, f, null), -1); });
        box.appendChild(b);
      } else box.appendChild(h('span', { text: seg }));
    });
    return box;
  }

  /* ---------- pages ---------- */
  function fileDesc(st, it, sibs) {
    const panel = st.panel;
    const restore = ctxItem(panel, 'Restore this file');
    return {
      key: 'files:item:' + it.id, kind: 'item', title: it.name, mono: true, siblingNoun: 'file in this folder',
      siblings: sibs ? () => sibs.filter(x => x.kind !== 'folder').map(x => ({ key: 'files:item:' + x.id, title: x.name, meta: x.letter ? (x.status && x.status.word) : null, icon: x.icon, open: () => fileDesc(st, x, sibs) })) : null,
      sub: () => h('div.pmr-b-subline', pathCrumb(st, it.path, it), it.letter ? PMR.letterEl(it.letter, it.status && it.status.state) : null, it.status ? PMR.statusEl(it.status) : null),
      build: () => {
        const facts = [['Folder', (it.path || '').split('/').slice(0, -1).join('/') || 'worktree root', { mono: true }]];
        if (it.status) facts.push(['State', it.status.word]);
        if (it.active) facts.push(['Editor', 'open now, you are here']);
        if (it.attrs && it.attrs['data-kind']) facts.push(['Kind', it.attrs['data-kind']]);
        const acts = asList(it.actions).concat(PMR.fileQuick(it));
        if (restore) acts.push(Object.assign({}, restore));
        const out = [];
        if (it.note) out.push(h('div.pmr-b-callout', { 'data-state': 'info' }, PMR.glyph('info'), h('span', { text: it.note })));
        out.push(h('div.pmr-b-sub', { text: 'Facts' }), ...factList(facts, { key: it.id }));
        out.push(h('div.pmr-b-sub', { text: 'Actions' }), actionList(acts, panel.menus));
        out.push(h('div.pmr-b-acts', actRow({ label: 'All file actions', icon: 'layers', menu: 'fileContext' }, panel.menus)));
        return out;
      },
    };
  }
  function folderDesc(st, it, sibs) {
    return {
      key: 'files:folder:' + it.id, kind: 'item', title: it.name, mono: true, siblingNoun: 'folder here',
      siblings: sibs ? () => sibs.filter(x => x.kind === 'folder').map(x => ({ key: 'files:folder:' + x.id, title: x.name, meta: x.rollup ? x.rollup.word : (asList(x.meta)[0] || null), icon: 'folder', open: () => folderDesc(st, x, sibs) })) : null,
      sub: () => h('div.pmr-b-subline', pathCrumb(st, it.path, it), it.rollup ? PMR.statusEl({ state: it.rollup.state, word: it.rollup.word }) : null, asList(it.meta).length ? h('span.pmr-b-meta-rest', { text: asList(it.meta).join(' · ') }) : null),
      actions: () => PMR.fileQuick(it).map(a => iconAct(a, st.panel.menus)),
      build: () => [treeBlock(st, kidsOf(it), it)],
    };
  }
  function changedDesc(st, it, sibs) {
    return {
      key: 'files:changed:' + it.id, kind: 'item', title: it.name, mono: true, siblingNoun: 'changed file',
      siblings: sibs ? () => sibs.map(x => ({ key: 'files:changed:' + x.id, title: x.name, meta: x.status && x.status.word, open: () => changedDesc(st, x, sibs) })) : null,
      sub: () => subLine(it),
      build: () => itemBody(it, { menus: st.panel.menus, metaLabel: 'Where', after: h('div.pmr-b-acts', actRow({ label: 'All file actions', icon: 'layers', menu: 'fileContext' }, st.panel.menus)) }),
    };
  }
  function areaDesc(st, v) {
    const views = st.panel.views.filter(x => x.id !== 'explorer');
    return {
      key: 'files:area:' + v.id, kind: 'area', title: v.id === 'open' ? 'Open editors' : v.label, siblingNoun: 'view',
      siblings: () => views.map(x => ({ key: 'files:area:' + x.id, title: x.id === 'open' ? 'Open editors' : x.label, count: x.count, icon: x.icon, open: () => areaDesc(st, x) })),
      sub: () => h('div.pmr-b-subline', h('span.pmr-b-meta-rest', { text: v.summary })),
      build: () => {
        const out = v.sections.map(sec => section({
          key: 'files:' + v.id + ':' + sec.id, label: sec.label, count: sec.count, collapsible: sec.open === false, open: sec.open !== false,
          body: () => sec.items.map(it => fileListRow(st, it, sec.items)),
        }));
        asList(v.notes).forEach(n => out.push(noteEl(n)));
        return out;
      },
    };
  }

  /* ---------- rows ---------- */
  function fileListRow(st, it, sibs) {
    const leadIco = PMR.icon(it.icon || 'file');
    if (it.kind === 'recent') {
      return row({ key: it.id, lead: leadIco, name: it.name, nameText: U.midName(it.name, 34), mono: true, meta: [it.time], primary: asList(it.actions).find(a => a.primary) || asList(it.actions)[0] });
    }
    const opener = asList(it.actions).find(a => a.label === 'Open diff');
    const folder = asList(it.meta)[0];
    const meta = asList(it.meta).slice(1);
    return row({
      key: it.id, lead: it.letter ? PMR.letterEl(it.letter, it.status && it.status.state) : leadIco, name: it.name, nameText: U.midName(it.name, 30), mono: true, path: it.path,
      metaEl: h('span.pmr-b-meta.is-split', folder ? h('span.pmr-b-meta-path', { text: folder }) : null, it.diff ? diffEl(it.diff) : (it.kind === 'open' ? wordEl(it.status) : null)),
      hover: { label: it.path || it.name, detail: meta.join(' · ') || null },
      selected: !!it.active,
      primary: opener || null,
      drill: () => changedDesc(st, it, sibs),
    });
  }
  function selectBox(st, it) {
    const on = st.fm.sel.has(it.id);
    const b = h('button', { type: 'button', class: 'pmr-b-check', role: 'checkbox', 'aria-checked': String(on), 'aria-label': 'Select ' + it.name }, PMR.icon('check'));
    b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); toggleSel(st, it, b); });
    return b;
  }
  function toggleSel(st, it, b) {
    const on = !st.fm.sel.has(it.id);
    if (on) st.fm.sel.add(it.id); else st.fm.sel.delete(it.id);
    b.setAttribute('aria-checked', String(on));
    const r = b.closest('.pmr-b-row'); if (r) r.classList.toggle('is-sel', on);
    updateSelBar(st);
  }
  function treeRow(st, it, depth, sibs) {
    const ign = it.attrs && it.attrs['data-ignored'] === '1';
    const common = { 'data-path': it.path || null, 'data-ignored': ign ? '1' : null, 'data-depth': String(depth), style: `--b-ind:${indent(depth)}px` };
    if (it.kind === 'folder') {
      const roll = it.rollup;
      /* the name has priority: the roll-up is the strongest status letter (or the capped count) in a narrow column;
         the words live in the hover tag and on the folder page */
      const capCount = it.capped ? String(it.capped.total) : null;
      const end = [roll ? PMR.letterEl(PMR.STATE_LETTER[roll.state] || 'M', roll.state) : (capCount ? h('span.pmr-b-endmeta.pmr-num', { text: capCount }) : null)];
      const words = [roll && roll.word].concat(asList(it.meta)).filter(Boolean).join(' · ');
      const tag = { label: it.path || it.name, detail: words || null };
      if (depth >= DEEP) {
        const r = row({ key: 'fold:' + it.id, lead: PMR.icon('folder'), name: it.name, mono: true, dim: ign, end, drill: () => folderDesc(st, it, sibs), cls: 'pmr-b-trow is-deep', attrs: common,
          hover: { label: it.path || it.name, detail: (words ? words + '. ' : '') + 'Opens as a page.' } });
        r._bItem = it;
        return [r];
      }
      const open = st.fm.open.has(it.id) ? st.fm.open.get(it.id) : !!it.open;
      const r = row({ key: 'fold:' + it.id, lead: [PMR.icon('chevR', 'pmr-b-twist'), PMR.icon('folder', 'pmr-b-ficon')], name: it.name, mono: true, dim: ign, end, cls: ['pmr-b-trow', 'pmr-b-folder', roll && !open && 'is-rolled'].filter(Boolean).join(' '), attrs: common,
        drill: () => folderDesc(st, it, sibs), primary: { label: it.name }, hover: tag });
      const main = r.querySelector('.pmr-b-row-main');
      main.setAttribute('aria-expanded', String(open));
      main.setAttribute('data-pmr-nav', 'expand');
      main.setAttribute('data-pmr-nav-id', 'fold|' + it.id);
      r.setAttribute('aria-expanded', String(open));
      if (roll) r.querySelector('.pmr-b-name').setAttribute('data-state', roll.state);
      const go = r.querySelector('.pmr-b-row-go'); go.classList.add('is-quiet'); PMR.hover(go, 'Open as page', it.path + ': its files at full width, with folder actions');
      const kids = h('div.pmr-b-kids', { hidden: !open });
      let built = false;
      const fill = () => { if (built) return; built = true; buildLevel(st, kids, kidsOf(it), depth + 1, it); };
      if (open) fill();
      main.addEventListener('click', ev => {
        ev.preventDefault();
        const now = main.getAttribute('aria-expanded') !== 'true';
        main.setAttribute('aria-expanded', String(now)); r.setAttribute('aria-expanded', String(now));
        st.fm.open.set(it.id, now);
        r.classList.toggle('is-rolled', !!roll && !now);
        if (now) fill();
        M.height(kids, now);
      });
      r._bItem = it; r._bKids = kids; r._bMain = main;
      return [r, kids];
    }
    const openAct = asList(it.actions)[0];
    const r = row({
      key: 'file:' + it.id, lead: PMR.icon(it.icon || 'file'), name: it.name, nameText: U.midName(it.name, 26), mono: true, dim: ign, path: it.path,
      end: [it.letter ? PMR.letterEl(it.letter, it.status && it.status.state) : null],
      hover: { label: it.path || it.name, detail: [it.status && it.status.word, it.note].filter(Boolean).join('. ') || null },
      primary: openAct, drill: () => fileDesc(st, it, sibs), quietGo: true, selected: !!it.active, cls: 'pmr-b-trow', attrs: Object.assign({ 'aria-current': it.active ? 'true' : null }, common),
    });
    if (it.active) r.querySelector('.pmr-b-row-main').setAttribute('aria-current', 'true');
    if (st.fm.selMode) r.querySelector('.pmr-b-lead').replaceWith(selectBox(st, it));
    r._bItem = it;
    return [r];
  }
  function buildLevel(st, box, items, depth, parent) {
    items.forEach(it => treeRow(st, it, depth, items).forEach(n => box.appendChild(n)));
    if (parent && parent.capped) {
      const c = parent.capped;
      box.appendChild(h('div.pmr-b-capped', { style: `--b-ind:${indent(depth)}px` },
        h('span.pmr-b-note', { text: c.note }), textAct(c.action, st.panel.menus, { icon: true })));
    }
  }
  function treeBlock(st, items, parent) {
    const box = h('div.pmr-b-tree', { role: 'tree', 'aria-label': parent ? parent.name : 'Files' });
    buildLevel(st, box, items, 0, parent);
    box.addEventListener('contextmenu', ev => openCtx(st, ev));
    box.addEventListener('keydown', ev => { if (ev.key === 'F10' && ev.shiftKey) { ev.preventDefault(); const r = ev.target.getBoundingClientRect(); PMR.menu.at(st.panel.menus.fileContext, r.left + 24, r.bottom, { menus: st.panel.menus, keyboard: true }); } });
    return box;
  }
  function openCtx(st, ev) {
    const r = ev.target.closest && ev.target.closest('.pmr-b-row');
    if (!r) return;
    ev.preventDefault();
    PMR.menu.at(st.panel.menus.fileContext, ev.clientX, ev.clientY, { menus: st.panel.menus });
  }
  /* filtered: a flat list of the names that match, each with its folder */
  function filtered(st, q) {
    const low = q.toLowerCase();
    const hits = U.flatten(treeItems(st.panel)).map(x => x.item).filter(it => (it.name || '').toLowerCase().includes(low));
    const box = h('div.pmr-b-tree.is-flat', { role: 'list', 'aria-label': 'Files that match' });
    if (!hits.length) { box.appendChild(h('p.pmr-b-empty', { text: 'Nothing matches "' + q + '".' })); return box; }
    hits.forEach(it => {
      const folder = (it.path || '').split('/').slice(0, -1).join('/') || 'worktree root';
      box.appendChild(it.kind === 'folder'
        ? row({ key: 'ffold:' + it.id, lead: PMR.icon('folder'), name: it.name, mono: true, meta: [folder], drill: () => folderDesc(st, it, null), cls: 'pmr-b-trow' })
        : row({ key: 'ffile:' + it.id, lead: PMR.icon(it.icon || 'file'), name: it.name, nameText: U.midName(it.name, 28), mono: true, meta: [folder], end: [it.letter ? PMR.letterEl(it.letter) : null], primary: asList(it.actions)[0], drill: () => fileDesc(st, it, null), quietGo: true, cls: 'pmr-b-trow' }));
    });
    return box;
  }

  /* ---------- the summary page ---------- */
  function rootDesc(st) {
    const panel = st.panel, v = view(panel, 'explorer');
    const tb = v.toolbar;
    const byLocal = id => tb.find(a => a.local === id);
    return {
      key: 'files:root', kind: 'root', title: panel.title,
      actions: () => panel.actions.map(a => iconAct(a, panel.menus)),
      build: (page) => {
        const out = [];
        /* identity + tools: worktree root, filter, new file, new folder, select */
        const line = panel.context.lines[0];
        const trig = PMR.menu.trigger(panel.menus.root, { icon: 'branch', hover: line.hover, cls: 'pmr-b-roottrig' });
        trig.setAttribute('data-pmr-nav', 'menu');
        const filterBtn = iconAct(byLocal('fmFilterToggle'), panel.menus);
        filterBtn.setAttribute('aria-pressed', String(!!st.fm.filterOpen));
        page.filterBtn = filterBtn;
        filterBtn.addEventListener('click', () => toggleFilter(st, page));
        const selBtn = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-b-iact', 'data-pmr-nav': 'select', 'aria-pressed': String(st.fm.selMode) }, PMR.icon('check', 'pmr-btn-ico'));
        PMR.hover(selBtn, 'Select files', 'Choose several files, then copy their paths, cut, add them to the chat or delete them');
        selBtn.addEventListener('click', () => setSelMode(st, !st.fm.selMode));
        st.fm.selBtn = selBtn;
        out.push(h('div.pmr-b-block.pmr-b-tools', trig,
          h('span.pmr-b-toolset', filterBtn, iconAct(tb.find(a => a.cmd === 'cmd.file.new_file'), panel.menus), iconAct(tb.find(a => a.cmd === 'cmd.file.new_folder'), panel.menus), selBtn)));
        /* the filter field (opens under the head) */
        const input = h('input', { type: 'text', class: 'pmr-b-input', placeholder: v.filter.placeholder, 'aria-label': v.filter.label, id: v.filter.id ? 'pmr-b-' + v.filter.id : null, value: st.fm.filter || '' });
        const clear = iconAct(v.filter.action, panel.menus);
        clear.addEventListener('click', () => { input.value = ''; applyFilter(st, page, ''); input.focus(); });
        input.addEventListener('input', U.debounce(() => applyFilter(st, page, input.value), 90));
        input.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); if (input.value) { input.value = ''; applyFilter(st, page, ''); } else toggleFilter(st, page); } });
        const fbox = h('div.pmr-b-block.pmr-b-filter', { hidden: !st.fm.filterOpen }, PMR.icon('search', 'pmr-b-filter-ico'), input, clear);
        page.filterBox = fbox; page.filterInput = input;
        out.push(fbox);
        /* pinned destinations */
        const dests = h('div.pmr-b-dests.is-compact');
        panel.views.filter(x => x.id !== 'explorer').forEach(x => dests.appendChild(destRow({
          key: 'files:' + x.id, icon: x.icon, label: x.id === 'open' ? 'Open editors' : x.label, compact: true,
          summary: x.id === 'changed' ? x.summary : x.summary.replace(/^\d+ open editors · /, ''), count: x.count, drill: () => areaDesc(st, x),
        })));
        out.push(dests);
        /* the reveal-hidden notice, while ignored files are hidden */
        const nt = v.notices[0];
        const notice = h('div.pmr-b-block.pmr-b-callout', { 'data-state': 'info', hidden: !st.fm.hideIgnored, 'data-canon': nt.canon },
          PMR.glyph('info'), h('span', { text: nt.text }), textAct(nt.action, panel.menus, { onLocal: () => setHideIgnored(st, page, false) }));
        page.notice = notice;
        out.push(notice);
        /* the tree */
        const collapse = iconAct(byLocal('fmCollapseAll'), panel.menus);
        collapse.addEventListener('click', () => collapseAll(st, page));
        const hide = iconAct(byLocal('fmHideIgnored'), panel.menus);
        hide.setAttribute('aria-pressed', String(!!st.fm.hideIgnored));
        hide.addEventListener('click', () => setHideIgnored(st, page, !st.fm.hideIgnored));
        page.hideBtn = hide;
        out.push(h('div.pmr-b-sec-head.pmr-b-treehead', h('span.pmr-b-sec-title.pmr-head', { text: v.label }), PMR.hover(h('span.pmr-b-treestate', B.panels.files.state(st)), v.label, v.summary), h('span.pmr-b-grow'), collapse, hide));
        const tree = st.fm.filter ? filtered(st, st.fm.filter) : treeBlock(st, treeItems(panel), null);
        page.tree = tree;
        page.el.classList.toggle('is-hide-ignored', !!st.fm.hideIgnored);
        out.push(tree);
        out.push(h('div.pmr-b-foot-notes', panel.footer.map(t => h('p.pmr-b-note', { text: t }))));
        return out;
      },
    };
  }
  function toggleFilter(st, page) {
    st.fm.filterOpen = !st.fm.filterOpen;
    const b = page.filterBox; if (!b) return;
    const btn = page.filterBtn;
    if (btn) btn.setAttribute('aria-pressed', String(st.fm.filterOpen));
    M.height(b, st.fm.filterOpen);
    if (st.fm.filterOpen) setTimeout(() => page.filterInput.focus({ preventScroll: true }), 30);
    else if (st.fm.filter) { page.filterInput.value = ''; applyFilter(st, page, ''); }
  }
  function applyFilter(st, page, q) {
    st.fm.filter = q.trim();
    const fresh = st.fm.filter ? filtered(st, st.fm.filter) : treeBlock(st, treeItems(st.panel), null);
    page.tree.replaceWith(fresh); page.tree = fresh;
    M.stagger(fresh.children, { max: 10, dy: 4, step: 12, dur: 'fast' });
  }
  function setHideIgnored(st, page, on) {
    st.fm.hideIgnored = on;
    PMR.state.set('files.hideIgnored', on);
    page.el.classList.toggle('is-hide-ignored', on);
    if (page.hideBtn) page.hideBtn.setAttribute('aria-pressed', String(on));
    M.height(page.notice, on);
  }
  function collapseAll(st, page) {
    page.el.querySelectorAll('.pmr-b-folder[aria-expanded="true"]').forEach(r => { if (r._bMain) r._bMain.click(); });
  }
  function setSelMode(st, on) {
    st.fm.selMode = on;
    if (!on) st.fm.sel.clear();
    if (st.fm.selBtn) st.fm.selBtn.setAttribute('aria-pressed', String(on));
    const page = st.pages[0];
    page.el.querySelectorAll('.pmr-b-trow[data-b-row^="file:"]').forEach(r => {
      const it = r._bItem; if (!it) return;
      const lead = r.querySelector('.pmr-b-lead, .pmr-b-check');
      if (on && lead && lead.classList.contains('pmr-b-lead')) lead.replaceWith(selectBox(st, it));
      if (!on && lead && lead.classList.contains('pmr-b-check')) { lead.replaceWith(h('span.pmr-b-lead', PMR.icon(it.icon || 'file'))); r.classList.remove('is-sel'); }
    });
    const bar = st.fm.selBar;
    if (bar) { updateSelBar(st); M.height(bar, on); }
  }
  function updateSelBar(st) {
    const n = st.fm.sel.size;
    if (st.fm.selCount) st.fm.selCount.textContent = n + ' ' + st.panel.selection.countLabel;
  }

  /* ---------- footer: selection bar and the ops tray ---------- */
  function foot(st) {
    const panel = st.panel;
    const sel = panel.selection;
    const count = h('span.pmr-b-selcount.pmr-num', { text: '0 ' + sel.countLabel });
    st.fm.selCount = count;
    const acts = sel.actions.filter(a => !a.local).map(a => iconAct(a, panel.menus));
    const done = textAct(sel.actions.find(a => a.local), panel.menus, { onLocal: () => setSelMode(st, false) });
    const bar = h('div.pmr-b-selbar', { hidden: !st.fm.selMode }, h('div.pmr-b-selbar-in', count, h('span.pmr-b-grow'), acts, done));
    st.fm.selBar = bar;
    const ops = panel.ops, op = ops.items[0];
    const pct = op.progress ? op.progress.done / op.progress.total : 0;
    const opRow = row({ key: 'ops:' + op.id, lead: PMR.glyph(op.status.state), name: op.name, meta: op.meta, cls: 'pmr-b-oprow',
      extra: h('span.pmr-b-progress', { role: 'progressbar', 'aria-valuenow': String(op.progress.done), 'aria-valuemax': String(op.progress.total) }, h('span.pmr-b-progress-fill', { style: { transform: `scaleX(${pct})` } })),
      drill: () => ({ key: 'files:op:' + op.id, kind: 'item', title: op.name, sub: () => subLine(op), build: () => itemBody(op, { menus: panel.menus, metaFacts: false, onLocal: a => { if (a.local === 'opsCancel') cancelOps(st); } }) }) });
    const cancel = iconAct(op.actions[0], panel.menus);
    cancel.addEventListener('click', () => cancelOps(st));
    const tray = h('div.pmr-b-ops', { 'data-canon': ops.canon }, h('div.pmr-b-ops-row', opRow, cancel));
    st.fm.tray = tray;
    return h('div.pmr-b-footin', bar, tray);
  }
  function cancelOps(st) {
    const t = st.fm.tray; if (!t || t.hidden) return;
    if (st.depth > 1 && st.top().desc.key.startsWith('files:op:')) st.pop(1);
    M.height(t, false);
    st.fm.opsCancelled = true;
  }

  return {
    init(st) {
      st.fm = { open: new Map(), hideIgnored: !!PMR.state.get('files.hideIgnored', false), filter: '', filterOpen: false, selMode: false, sel: new Set() };
    },
    state(st) { return st.panel.context.state ? PMR.statusEl(st.panel.context.state, { cls: 'pmr-b-pstate' }) : null; },
    root: rootDesc,
    foot,
  };
})();
