/* Files (File Manager) in the Lens concept: a compact tree (indent min(depth, 6) x 12 px, faint guides, folder
   roll-up letter), Changed and Open as index lists. The file Lens holds path, status, kind, the row's quick actions
   (PMR.fileQuick), the context menu's groups (Open with, Open in panel, Copy path), Restore this file and Open in Source
   Control. Explorer tools sit beside the title; the operation in progress and the selection are footer lines. */

const C_FILE_KIND = { rs: 'Rust source', ts: 'TypeScript source', js: 'JavaScript source', svelte: 'Svelte component', sql: 'SQL migration', toml: 'TOML configuration', yml: 'YAML file', xml: 'XML template', md: 'Markdown document', docker: 'Dockerfile', generic: 'File', folder: 'Folder' };
const C_FILES = { ops: { cancelled: false } };

function cFilesState() {
  return {
    hideIgnored: !!CST.get('files.hideIgnored', false),
    filterOpen: !!CST.get('files.filterOpen', false),
    filter: String(CST.get('files.filter', '') || ''),
  };
}
function cFilesOpenSet(view) {
  const saved = CST.get('files.open', null);
  if (Array.isArray(saved)) return new Set(saved);
  const s = new Set();
  U.flatten(view.sections[0].items).forEach(({ item }) => { if (item.kind === 'folder' && item.open) s.add(item.id); });
  return s;
}
function cFilesFind(id) {
  const ex = PMR.data.files.views[0];
  return U.flatten(ex.sections[0].items).map(x => x.item).find(it => it.id === id || it.path === id) || null;
}

/* the file Lens: Open first, the row's quick actions, then the context menu's groups as menu rows */
function cFileParts(P, item, parts) {
  const at = item.attrs || {};
  const path = item.path || at['data-path'] || item.name;
  const isFolder = item.kind === 'folder';
  const ctxMenu = P.menus.fileContext;
  const pick = label => { for (const g of ctxMenu.groups) for (const it of g.items) if (it.label === label) return it; return null; };
  parts.title = isFolder ? item.name : cBaseName(item.name);
  parts.mono = true;
  parts.sub = path !== parts.title ? path : null;
  const kindWord = isFolder ? 'Folder' : (C_FILE_KIND[at['data-kind']] || C_FILE_KIND[item.icon] || 'File');
  const facts = [];
  if (item.kind === 'file' || isFolder) {
    facts.push(['Kind', kindWord]);
    facts.push(['Worktree', String(P.menus.root.value || 'main'), { mono: true }]);
    if (isFolder) {
      if (item.meta) facts.push(['Holds', item.meta.join(' · ')]);
      if (item.rollup) facts.push(['Changes inside', item.rollup.word, { state: item.rollup.state }]);
    } else if (item.status) facts.push(['Git', item.status.state === 'ignored' ? 'ignored by .gitignore' : item.status.word + ' in the working tree']);
    if (item.active) facts.push(['Editor', 'the file open in the editor now']);
    if (at['data-readonly'] === '1') facts.push(['Editing', 'read-only (binary)']);
  }
  parts.facts = facts.concat(parts.facts || []);
  if (item.capped) parts.notes.push(item.capped.note);
  const acts = (item.actions || []).slice();
  if (item.kind === 'file' || isFolder) PMR.fileQuick(item).forEach(a => acts.push(a));
  if (item.kind === 'file' || isFolder || item.kind === 'changed' || item.kind === 'open' || item.kind === 'recent') {
    const restore = pick('Restore this file');
    if (!isFolder && restore && !acts.some(a => a.label === 'Restore this file')) acts.push(restore);
    const inSc = pick('Open in Source Control');
    if (inSc) acts.push(inSc);
  }
  if (item.capped) acts.push(item.capped.action);
  parts.actions = acts;
  parts.extra = [h('div.pmr-c-acts.is-menus', { role: 'group', 'aria-label': 'More file actions' },
    !isFolder ? cActRow({ label: 'Open with', icon: 'external' }, { P, navKey: 'files:' + item.id, menu: P.menus.openWith }) : null,
    !isFolder ? cActRow({ label: 'Open in panel', icon: 'layers' }, { P, navKey: 'files:' + item.id, menu: P.menus.openInPanel }) : null,
    cActRow({ label: 'Copy path', icon: 'copy' }, { P, navKey: 'files:' + item.id, menu: P.menus.copyPath }),
    cActRow({ label: 'All file actions', icon: 'files', hint: 'Also on right-click and Shift+F10' }, { P, navKey: 'files:' + item.id, menu: ctxMenu }))];
}

function cFilesTree(P, items, depth, container, parentKey, ctx) {
  items.forEach(it => {
    const ignored = it.attrs && it.attrs['data-ignored'] === '1';
    if (ctx.st.hideIgnored && ignored) return;
    if (ctx.q && !ctx.match.has(it.id)) return;
    const isFolder = it.kind === 'folder';
    if (isFolder) {
      const open = ctx.q ? true : ctx.open.has(it.id);
      const roll = it.rollup || null;
      const letter = roll ? PMR.letterEl(PMR.STATE_LETTER[roll.state] || 'M', roll.state) : null;
      if (letter) letter.classList.add('pmr-c-roll');
      const group = h('div.pmr-c-tgroup', { role: 'group', style: { '--d': String(Math.min(depth, 6)) } });
      let filled = false;
      const fill = () => {
        if (filled) return; filled = true;
        cFilesTree(P, it.children || [], depth + 1, group, it.id, ctx);
        if (it.capped) {
          const more = PMR.button(it.capped.action, { variant: 'quiet', cls: 'pmr-c-capped' });
          PMR.hover(more, it.capped.action.label, it.capped.note);
          group.appendChild(h('div.pmr-c-capline', { style: { '--d': String(Math.min(depth + 1, 6)) } }, more));
        }
      };
      const row = P.row({
        key: it.id, item: it, name: it.name, mono: true, icon: 'folder', depth, folder: true, open,
        dim: ignored, parentKey, kind: 'Folder', kindIcon: 'folder', end: letter,
        cls: [roll && 'has-roll', !open && 'is-collapsed'].filter(Boolean).join(' '),
        attrs: Object.assign({ 'data-roll': roll ? roll.state : null }, it.attrs || {}),
        hoverLabel: it.path || it.name, hoverDetail: [(it.meta || [])[0], roll && roll.word].filter(Boolean).join(' · '),
        build: () => cDocFor(P, it, {}),
        toggle: want => {
          const isOpen = row.getAttribute('aria-expanded') === 'true';
          if (want === isOpen) return;
          row.setAttribute('aria-expanded', String(want));
          row.classList.toggle('is-collapsed', !want);
          if (want) ctx.open.add(it.id); else ctx.open.delete(it.id);
          if (!ctx.q) CST.set('files.open', Array.from(ctx.open));
          if (want) { fill(); cFitNames(group); }
          MO.height(group, want, { dur: 'med' });
          if (want && !MO.reduced()) MO.stagger(Array.from(group.children).slice(0, 12), { dy: 4, step: 14, frames: [{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }] });
          P.track(MO.reduced() ? 0 : 420);
        },
      });
      container.append(row, group);
      if (open) fill(); else group.hidden = true;
    } else {
      const letter = it.letter ? PMR.letterEl(it.letter) : (it.status && it.status.state === 'info' ? cGlyph(it.status) : null);
      container.appendChild(P.row({
        key: it.id, item: it, name: it.name, mono: true, icon: it.icon || 'file', depth, parentKey, dim: ignored,
        strong: !!it.active, kind: KIND_WORD.file, kindIcon: it.icon || 'file', end: letter,
        cls: it.active ? 'is-active-file' : '', attrs: it.attrs,
        hoverLabel: it.path || it.name, hoverDetail: [it.status && it.status.word, it.active ? 'open in the editor now' : null, it.note].filter(Boolean).join(' · '),
        build: () => cDocFor(P, it, {}),
      }));
    }
  });
}

function cFilesExplorer(P, view, content) {
  const st = cFilesState();
  const sec = view.sections[0];
  const open = cFilesOpenSet(view);
  const q = st.filterOpen ? st.filter.trim().toLowerCase() : '';
  const match = new Set();
  if (q) {
    (function walk(list, trail) {
      list.forEach(it => {
        const t = trail.concat(it.id);
        if (it.name.toLowerCase().includes(q) || (it.path || '').toLowerCase().includes(q)) t.forEach(id => match.add(id));
        if (it.children) walk(it.children, t);
      });
    })(sec.items, []);
  }
  if (st.filterOpen) {
    const input = h('input', { type: 'search', class: 'pmr-c-filter-in', placeholder: view.filter.placeholder, value: st.filter, 'aria-label': view.filter.label, id: 'pmr-c-fmFilter' });
    const clear = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet' }, PMR.icon('x'));
    PMR.hover(clear, view.filter.action.label);
    clear.addEventListener('click', () => P.local('fmFilterClear'));
    const rerender = U.debounce(() => { CST.set('files.filter', input.value); P.renderBody(); const n = P.content.querySelector('.pmr-c-filter-in'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 160);
    input.addEventListener('input', rerender);
    input.addEventListener('keydown', ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); P.local('fmFilterClear'); } else if (ev.key === 'ArrowDown') { ev.preventDefault(); const r = P.content.querySelector('.pmr-c-row'); if (r) P.select(r.getAttribute('data-key'), { focus: true }); } });
    content.appendChild(h('div.pmr-c-filter', PMR.icon('search', 'pmr-c-filter-ico'), input, clear));
  }
  (view.notices || []).forEach(n => {
    if (!(n.shown || st.hideIgnored)) return;
    content.appendChild(h('div.pmr-c-notice', { 'data-state': n.state, 'data-canon': n.canon || null },
      cGlyph({ state: n.state }, { loud: true }), h('p', { text: n.text }), cActRow(n.action, { P })));
  });
  const tree = h('div.pmr-c-tree', { role: 'tree', 'aria-label': 'Files in ' + (P.menus.root.value || 'main') });
  content.appendChild(tree);
  cFilesTree(P, sec.items, 0, tree, null, { st, open, q, match });
  if (q && !match.size) content.appendChild(h('p.pmr-c-note', { text: 'No file names match "' + st.filter + '".' }));
}

function cFilesList(P, view, content) {
  view.sections.forEach(sec => {
    content.appendChild(P.section(sec, body => {
      sec.items.forEach(it => {
        const isRecent = it.kind === 'recent';
        const name = isRecent ? cBaseName(it.name) : it.name;
        let end;
        if (it.kind === 'open') {
          end = it.status && it.status.state === 'warn' ? cGlyph(it.status, { shape: 'running' }) : null;
          if (end) end.classList.add('is-dot');
        }
        body.appendChild(cItemRow(P, Object.assign({}, it), {
          name, end, icon: it.icon || 'file',
          row: { strong: !!it.active, cls: it.active ? 'is-active-file' : '', hoverLabel: it.path || it.name, attrs: it.path ? { 'data-path': it.path } : null },
        }));
      });
    }));
  });
}

C_SPECS.files = {
  multi: true,
  kindWord: (P, item) => KIND_WORD[item.kind],
  identity(P) {
    const trig = PMR.menu.trigger(P.menus.root, { icon: 'branch', cls: 'pmr-c-idtrig', hover: P.panel.context.lines[0].hover });
    trig.setAttribute('data-pmr-nav', 'menu');
    trig.setAttribute('data-pmr-nav-id', 'ident:files:root');
    trig.querySelector('.pmr-trigger-label').classList.add('is-mono');
    const state = P.panel.context.state;
    const about = h('button', { type: 'button', class: 'pmr-c-idstate pmr-cur', 'data-pmr-nav': 'select', 'data-pmr-nav-id': 'ident:files:about' },
      cGlyph(state), h('span', { text: state.word }));
    PMR.hover(about, 'About this tree', P.panel.footer.join(' · '));
    about.addEventListener('click', () => cLensShow(P, {
      key: '__about', el: about, kind: 'File tree', icon: 'files', label: 'About this tree',
      build: () => cLensDoc({
        P, navKey: 'files:about', title: (P.menus.root.value || 'main') + ' worktree', mono: false, status: state,
        facts: [['Worktree root', String(P.menus.root.value || 'main'), { mono: true }], ['Changed files', P.panel.status.word, { state: P.panel.status.state }],
          ['Search index', P.panel.indexChip && P.panel.indexChip.shown ? P.panel.indexChip.text : 'ready']],
        related: [cActRow({ label: 'Choose another worktree', icon: 'branch' }, { P, navKey: 'files:about', menu: P.menus.root })],
        actions: P.panel.actions, notes: P.panel.footer,
      }),
    }));
    return h('div.pmr-c-identrow', trig, about);
  },
  tools(P, view) {
    const panelActs = P.panel.actions.map(a => ({ a }));
    if (view.id !== 'explorer') return panelActs;
    const tb = view.toolbar;
    const by = local => tb.find(a => a.local === local);
    return [
      { a: tb[0] }, { a: tb[1] },
      { a: by('fmFilterToggle'), run: () => P.local('fmFilterToggle'), toggled: () => cFilesState().filterOpen },
      { a: by('fmCollapseAll'), run: () => P.local('fmCollapseAll') },
      { a: Object.assign({}, by('fmHideIgnored'), { icon: cFilesState().hideIgnored ? 'eyeOff' : 'eye' }), run: () => P.local('fmHideIgnored'), toggled: () => cFilesState().hideIgnored, detail: 'Hide files that .gitignore excludes' },
    ].concat(panelActs);
  },
  panelGroup(P) { return { label: 'This panel', items: P.panel.actions.map(a => Object.assign({}, a)) }; },
  renderView(P, view, content) {
    if (view.id === 'explorer') cFilesExplorer(P, view, content);
    else cFilesList(P, view, content);
  },
  itemLens(P, item, parts) {
    if (['file', 'folder', 'changed', 'open', 'recent'].includes(item.kind)) cFileParts(P, item, parts);
    if (item.kind === 'changed') {
      parts.related.push(h('div.pmr-c-lens-block', cLensHeading('Compare'),
        h('p.pmr-c-lens-meta', { text: item.letter === 'A' || item.letter === '?' ? 'A new file: the diff compares an empty file with the working tree.' : 'Open diff compares the index with the working tree. Same path in another worktree: Compare with worktree.' })));
    }
    if (item.kind === 'recent') parts.line = ['opened ' + item.time];
  },
  footer(P, view) {
    const ops = P.panel.ops;
    const op = ops.items[0];
    const cancelled = C_FILES.ops.cancelled;
    const st = cancelled ? { state: 'stopped', word: 'cancelled' } : op.status;
    const opBtn = h('button', { type: 'button', class: 'pmr-c-footline pmr-cur', 'data-pmr-nav': 'select', 'data-pmr-nav-id': 'files:ops', 'data-canon': ops.canon },
      cGlyph(st, { loud: true }),
      h('span.pmr-c-footline-t', { text: cancelled ? 'Copy cancelled after 3 of 50 files' : op.name }),
      cancelled ? null : cMeter(op.progress.done / op.progress.total * 100, 'running', 'Copy progress'));
    PMR.hover(opBtn, ops.label, op.meta.join(' · '));
    opBtn.addEventListener('click', () => cLensShow(P, {
      key: '__ops', el: opBtn, kind: 'Operation', icon: 'copy', label: op.name,
      build: () => cLensDoc({
        P, navKey: 'files:ops', title: cancelled ? 'Copy cancelled' : op.name, status: st, line: cancelled ? ['3 of 50 copied'] : op.meta,
        related: cancelled ? [] : [h('div.pmr-c-lens-block', cLensHeading('Progress', h('span.pmr-num', { text: op.progress.done + ' of ' + op.progress.total })), cMeter(op.progress.done / op.progress.total * 100, 'running', 'Copy progress'))],
        facts: op.facts, actions: cancelled ? op.actions.filter(a => a.local !== 'opsCancel') : op.actions,
      }),
    }));
    const lines = [opBtn];
    if (view.id === 'explorer') {
      const n = P.multi.size;
      if (n) {
        const selActs = P.panel.selection.actions;
        const trig = h('button', { type: 'button', class: 'pmr-btn pmr-btn-quiet pmr-c-seltrig', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'files:selection' },
          h('span.pmr-btn-label', { text: 'Selection actions' }), PMR.icon('chevD', 'pmr-btn-ico'));
        trig.addEventListener('click', ev => {
          ev.preventDefault();
          const items = selActs.map(a => Object.assign({}, a));
          PMR.menu.toggle({ id: 'c-files-sel', label: 'Selection actions', groups: [{ items: items.filter(a => !a.local) }, { items: items.filter(a => a.local) }] }, trig, {
            align: 'start', onPick: it => { if (it.local) P.local(it.local, it); },
          });
        });
        const clear = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-btn-quiet' }, PMR.icon('x'));
        PMR.hover(clear, 'Clear selection');
        clear.addEventListener('click', () => P.local('fmSelClear'));
        lines.push(h('div.pmr-c-selline', h('span.pmr-c-selcount', h('span.pmr-num', { text: String(n) }), ' ' + P.panel.selection.countLabel), trig, clear));
      }
    }
    return h('div.pmr-c-footlines', lines);
  },
  onSelect(P) { if (P.viewId === 'explorer') { P.renderFoot(); cFitNames(P.foot); } },
  contextMenu(P, entry, x, y) {
    const it = entry.item;
    if (!it || !['file', 'folder', 'changed', 'open', 'recent'].includes(it.kind)) return false;
    if (!P.multi.has(entry.key)) P.select(entry.key, { lens: false });
    PMR.menu.at(P.menus.fileContext, x, y, { menus: P.menus });
    return true;
  },
  locals: {
    fmSelClear(P) { P.clearSelection(); },
    fmCollapseAll(P) { CST.set('files.open', []); P.renderBody(); P.fitAll(); },
    fmHideIgnored(P) { CST.set('files.hideIgnored', !cFilesState().hideIgnored); if (LENS.owner === P) cLensHide('filter'); P.renderBody(); P.fitAll(); },
    fmFilterToggle(P) {
      const on = !cFilesState().filterOpen;
      CST.set('files.filterOpen', on);
      if (!on) CST.set('files.filter', '');
      P.renderBody(); P.fitAll();
      if (on) { const n = P.content.querySelector('.pmr-c-filter-in'); if (n) { n.focus(); if (!MO.reduced()) MO.animate(n.parentNode, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { dur: 'fast', fill: 'none' }); } }
    },
    fmFilterClear(P) { CST.set('files.filter', ''); CST.set('files.filterOpen', false); P.renderBody(); P.fitAll(); },
    opsCancel(P) { C_FILES.ops.cancelled = true; P.renderFoot(); if (LENS.owner === P && LENS.key === '__ops') { LENS.key = null; const b = P.foot.querySelector('.pmr-c-footline'); if (b) b.click(); } },
    opsRetryFailed() { /* disabled: nothing has failed */ },
  },
};
