/* Concept B — area pages and item pages built from fixture views (Source Control and Docker share this). An area
   page is the view's sections at full width: sentence-case headings, plain counts, quiet text actions, clean one- or
   two-line rows. A row with more to show pushes its item page; a file-like row's body runs its primary open action. */

const FILE_KINDS = ['change', 'changed', 'conflict', 'file'];
function hasMore(it) {
  return !!((it.facts && it.facts.length) || (it.actions && it.actions.length) || (it.children && it.children.length) || (it.hunks && it.hunks.length)
    || it.blocked || it.note || (it.ports && it.ports.length) || (it.metrics && it.metrics.length) || it.preview);
}
function folderOf(it) { const p = it.path || ''; return p.includes('/') ? p.split('/').slice(0, -1).join('/') : ''; }

/* the default row for an item */
function itemRow(st, it, list, cfg) {
  cfg = cfg || {};
  const fileish = FILE_KINDS.includes(it.kind);
  const statusLead = !it.letter && !cfg.lead && !cfg.statusEnd && !!it.status;
  const lead = it.letter ? PMR.letterEl(it.letter, it.status && it.status.state)
    : cfg.lead ? cfg.lead(it) : statusLead ? PMR.glyph(it.status.state) : (it.icon ? PMR.icon(it.icon) : null);
  const metaParts = asList(cfg.meta ? cfg.meta(it) : it.meta);
  if (it.owner && !cfg.meta) metaParts.push(it.owner);
  if (it.time && !cfg.meta) metaParts.push(it.time);
  const folder = folderOf(it);
  const metaEl = fileish
    ? h('span.pmr-b-meta.is-split', h('span.pmr-b-meta-path', { text: folder || asList(it.meta)[0] || '' }), it.diff ? diffEl(it.diff) : null)
    : statusLead ? h('span.pmr-b-meta', h('span.pmr-b-word', { 'data-state': it.status.state, text: it.status.word }), metaParts.filter(Boolean).length ? h('span.pmr-b-meta-rest', { text: metaParts.filter(Boolean).join(' · ') }) : null, cfg.diffInMeta && it.diff ? diffEl(it.diff) : null)
    : metaWith(cfg.statusEnd ? null : it.status, metaParts);
  if (cfg.diffInMeta && it.diff && !statusLead && metaEl) metaEl.appendChild(diffEl(it.diff));
  const extra = it.blocked && cfg.blockedLine !== false ? h('span.pmr-b-rowblock', PMR.glyph('blocked'), h('span', { text: it.blocked.reason })) : null;
  const end = [it.diff && !cfg.diffInMeta && !fileish ? diffEl(it.diff) : null, cfg.statusEnd && it.status ? PMR.statusEl(it.status) : null, cfg.end ? cfg.end(it) : null];
  const prim = fileish ? asList(it.actions).find(a => a.primary && !a.disabled) : null;
  return row({
    key: st.panel.id + ':' + it.id, lead, name: it.name, nameText: it.mono && fileish ? U.midName(it.name, 30) : null, mono: it.mono, path: it.path,
    metaEl, extra, end, primary: prim || null, attrs: Object.assign({}, it.attrs || {}, { 'data-canon': it.canon || null }),
    drill: hasMore(it) ? () => itemDesc(st, it, list, cfg) : null,
    hover: !prim && !hasMore(it) && it.name && it.name.length > 34 ? { label: it.name } : null,
  });
}
function itemDesc(st, it, list, cfg) {
  cfg = cfg || {};
  const sibs = asList(list).filter(x => x && x.kind === it.kind && x.name);
  return {
    key: st.panel.id + ':item:' + it.id, kind: 'item', title: it.name, mono: it.mono, siblingNoun: cfg.noun || 'item in this list', siblingGroup: cfg.group || null,
    siblings: sibs.length > 1 ? () => sibs.map(x => ({ key: st.panel.id + ':item:' + x.id, title: x.name, meta: x.status ? x.status.word : (x.letter || null), open: () => itemDesc(st, x, list, cfg) })) : null,
    sub: () => subLine(it, it.owner && !(it.facts || []).some(f => f[0] === 'Owner') ? null : null),
    actions: cfg.itemActions ? () => cfg.itemActions(it) : null,
    build: () => (cfg.itemBody ? cfg.itemBody(it) : itemBody(FILE_KINDS.includes(it.kind) ? Object.assign({}, it, { meta: asList(it.meta).filter(m => m !== folderOf(it)) }) : it, { menus: st.menus, metaLabel: FILE_KINDS.includes(it.kind) ? (it.kind === 'conflict' ? 'Why' : 'Compare') : cfg.metaLabel, childLabel: cfg.childLabel ? cfg.childLabel(it) : null, extra: cfg.itemExtra ? cfg.itemExtra(it) : null })),
  };
}

/* a section of a view, by kind */
function viewSection(st, v, sec, cfg) {
  cfg = cfg || {};
  const special = cfg.sections && cfg.sections[sec.id];
  if (special) { const s = special(sec, v); if (s) return s; }
  const kind = sec.kind || 'list';
  const rowCfg = (cfg.rows && (cfg.rows[sec.id] || cfg.rows[v.id])) || cfg.row || {};
  return section({
    key: st.panel.id + ':' + v.id + ':' + sec.id, label: sec.label, count: sec.count, status: sec.status, note: sec.note, canon: sec.canon, attrs: sec.attrs,
    collapsible: sec.open === false, open: sec.open !== false, actions: sec.actions, menus: st.menus,
    body: () => {
      if (kind === 'facts') {
        const facts = sec.items.filter(it => it.kind === 'fact');
        const rows = sec.items.filter(it => it.kind !== 'fact');
        return [facts.length ? factItems(facts, st.menus) : null].concat(rows.map(it => itemRow(st, it, rows, rowCfg)));
      }
      if (kind === 'chain') return chainEl(st, sec, rowCfg);
      if (kind === 'graph') return graphEl(st, sec);
      const facts = sec.items.filter(it => it.kind === 'fact');
      const rows = sec.items.filter(it => it.kind !== 'fact');
      return [facts.length ? factItems(facts, st.menus) : null].concat(rows.map(it => itemRow(st, it, rows, rowCfg)));
    },
  });
}
/* a publish chain: numbered steps joined by a neutral 1px line */
function chainEl(st, sec, cfg) {
  const box = h('ol.pmr-b-chain');
  sec.items.forEach((it, i) => {
    const r = itemRow(st, it, sec.items, Object.assign({}, cfg, { lead: () => h('span.pmr-b-step.pmr-num', { 'data-state': it.status && it.status.state, text: String(i + 1) }), meta: x => asList(x.meta).filter(m => !/^step \d/.test(m)) }));
    box.appendChild(h('li.pmr-b-chain-i', r));
  });
  return box;
}
/* a small graph: the current branch and the lanes that start from it, joined by a neutral 1px line */
function graphEl(st, sec) {
  const box = h('div.pmr-b-graph');
  sec.items.forEach(it => {
    box.appendChild(itemRow(st, it, sec.items, { lead: () => h('span.pmr-b-node.is-head'), statusEnd: true }));
    const lanes = h('div.pmr-b-lanes');
    asList(it.children).forEach(c => lanes.appendChild(row({ key: st.panel.id + ':' + c.id, lead: h('span.pmr-b-node'), name: c.name, mono: c.mono, meta: c.attrs && c.attrs['data-lane'] ? [c.attrs['data-lane'] === 'orchestrator' ? 'orchestrator lane' : 'thread lane'] : null, cls: 'is-lane', attrs: c.attrs })));
    box.appendChild(lanes);
  });
  return box;
}

/* an area page from a view */
function areaDesc(st, v, views, cfg) {
  cfg = cfg || {};
  const make = x => areaDesc(st, x, views, cfg);
  return {
    key: st.panel.id + ':area:' + v.id, kind: 'area', title: v.label, siblingNoun: 'area of ' + st.panel.title,
    siblings: () => views().map(x => ({ key: st.panel.id + ':area:' + x.id, title: x.label, count: x.conditional && !x.conditional.shown ? 'hidden' : (x.count != null ? x.count : ''), icon: x.icon, open: () => make(x) })),
    sub: () => (v.attention ? h('div.pmr-b-subline.is-att', { 'data-state': v.attention.state }, PMR.glyph(v.attention.state), h('span', { text: v.attention.text })) : h('div.pmr-b-subline', h('span.pmr-b-meta-rest', { text: v.summary }))),
    actions: () => {
      const out = [];
      if (v.filters) out.push(filterBtn(st, v));
      asList(v.toolbar).forEach(a => out.push(iconAct(a, st.menus)));
      return out;
    },
    build: (page) => {
      const out = [];
      if (v.conditional && !v.conditional.shown) {
        out.push(h('div.pmr-b-callout', { 'data-state': 'info' }, PMR.glyph('info'), h('span', { text: v.conditional.why })));
        if (v.empty) out.push(h('p.pmr-b-note', { text: v.empty.text }));
        out.push(actionList([Object.assign({ primary: true }, v.conditional.action)], st.menus));
      }
      (v.sections || []).forEach(sec => out.push(viewSection(st, v, sec, cfg)));
      if (cfg.after) asList(cfg.after(v, page)).forEach(n => out.push(n));
      asList(v.notes).forEach(n => out.push(noteEl(n)));
      if (v.canonNote) out.push(noteEl(v.canonNote, 'is-canon'));
      page.filterEmpty = h('div.pmr-b-callout', { hidden: true, 'data-state': 'info' }, PMR.glyph('info'), h('span', { text: 'No ' + v.label.toLowerCase() + ' match this filter. The list itself is not empty.' }));
      if (v.filters) out.splice(0, 0, page.filterEmpty);
      return out;
    },
  };
}
/* the worktree filter: owner, lifecycle and flags; filtered-empty says so (it is not a true empty) */
function filterBtn(st, v) {
  const m = v.filters;
  const b = h('button', { type: 'button', class: 'pmr-btn pmr-btn-icon pmr-b-iact', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'aria-pressed': String(!!(m.value && m.value !== 'all')) }, PMR.icon('filter', 'pmr-btn-ico'));
  PMR.hover(b, m.label, 'Owner, lifecycle and flags');
  b.addEventListener('click', ev => {
    ev.preventDefault();
    PMR.menu.toggle(m, b, { onPick: it => {
      m.value = it.value;
      b.setAttribute('aria-pressed', String(it.value !== 'all'));
      const page = st.top();
      const rows = Array.from(page.el.querySelectorAll('.pmr-b-row[data-lifecycle]'));
      let shown = 0;
      rows.forEach(r => {
        const [k, val] = String(it.value).includes(':') ? String(it.value).split(':') : ['owner', it.value];
        const ok = it.value === 'all' || (k === 'owner' && r.getAttribute('data-owner') === val) || (k === 'lifecycle' && r.getAttribute('data-lifecycle') === val);
        r.hidden = !ok; if (ok) shown++;
      });
      if (page.filterEmpty) page.filterEmpty.hidden = shown > 0;
    } });
  });
  return b;
}
