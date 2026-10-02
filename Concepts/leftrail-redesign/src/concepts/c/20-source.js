/* Source Control in the Lens concept (Git and Jujutsu engines).
   Identity: repository + branch menu + engine menu, then "Where this runs" (opens in the Lens). Changes are index
   lists per group with the commit composer pinned at the bottom (message, Generate, Commit, and pull / push / fetch /
   stash in a menu); "Publish and review" is a footer line that opens in the Lens. Worktrees / Workspaces, History,
   Branches / Bookmarks, Reviews and the Operation Log are index lists; every item opens its Lens. A 'facts' section
   (Remote projection, Current change, Jujutsu review) is one summary row whose Lens holds it. */

const C_SRC = { wtFilter: 'all' };

function cSrcEngine() { return PMR.state.get('source.engine', (PMR.data.source.engines || {}).current || 'git'); }

/* a summary row for a 'facts' section: name on line one, its state on line two; the Lens holds the facts */
function cSummaryRow(P, sec, o) {
  o = o || {};
  const first = (sec.items || [])[0] || {};
  const name = o.name || sec.label;
  const sub = o.sub || [sec.status && sec.status.word, typeof sec.count === 'string' ? sec.count : (first.meta || []).join(' · ')].filter(Boolean).join(' · ');
  const key = 'sec:' + sec.id;
  const row = P.row({
    key, name, icon: o.icon || 'info', kind: o.kind || 'Section', kindIcon: o.icon || 'info',
    end: sec.status ? cGlyph(sec.status) : null, cls: 'is-two', hoverLabel: name, hoverDetail: sub,
    attrs: Object.assign({ 'data-canon': sec.canon || null }, sec.attrs || {}),
    build: o.build || (() => cSectionDoc(P, sec, o.extra)),
  });
  const nm = row.querySelector('.pmr-c-name');
  nm.replaceWith(h('span.pmr-c-two', h('span.pmr-c-name', { text: name }), sub ? h('span.pmr-c-two-sub', { text: sub }) : null));
  return row;
}

function cSrcGateTable(view) {
  const gates = (view.sections || []).find(s => s.id === 'gates');
  if (!gates) return null;
  return h('div.pmr-c-lens-block', cLensHeading('Checks', h('span.pmr-num', { text: String(gates.count) })),
    h('table.pmr-c-gates',
      h('colgroup', h('col', { style: 'width:39%' }), h('col', { style: 'width:30%' }), h('col', { style: 'width:31%' })),
      h('thead', h('tr', h('th', { text: 'Check' }), h('th', { text: 'Source' }), h('th', { text: 'Enforcement' }))),
      h('tbody', gates.items.map(g => {
        const fact = k => ((g.facts || []).find(f => f[0] === k) || [])[1] || '';
        return h('tr', { 'data-enforcement': (g.attrs || {})['data-enforcement'] || null },
          h('td', h('span.pmr-c-gate-name', { text: g.name }), h('span.pmr-c-gate-state', { 'data-state': g.status.state }, cGlyph(g.status, { loud: true }), h('span', { text: g.status.word }))),
          h('td', { text: (g.meta || [])[0] || fact('Source') }),
          h('td', { text: fact('Enforcement') }));
      }))),
    gates.note ? h('p.pmr-c-lens-meta', { text: gates.note }) : null);
}

function cSrcFilesBlock(title, children) {
  if (!children || !children.length) return null;
  return h('div.pmr-c-lens-block', cLensHeading(title, h('span.pmr-num', { text: String(children.length) })),
    h('div.pmr-c-mini', children.map(c => h('div.pmr-c-mini-row', PMR.icon(KIND_ICON[c.kind] || 'file', 'pmr-c-mini-ico'),
      h('span', { class: ['pmr-c-mini-name', c.mono && 'is-mono'], text: c.name }),
      c.meta ? h('span.pmr-c-mini-meta', { text: c.meta.join(' · ') }) : null,
      c.status ? cStatusWordEl(c.status) : null,
      c.diff ? cDiff(c.diff) : null))));
}

function cSrcSyncBlock(item) {
  const f = (item.facts || []).find(x => x[0] === 'Ahead / behind');
  if (!f) return null;
  const m = /ahead (\d+) · behind (\d+)(?: vs (.+))?/.exec(f[1]);
  if (!m) return null;
  return h('div.pmr-c-lens-block', cLensHeading('Against ' + (m[3] || 'its base')),
    h('div.pmr-c-sync',
      h('div.pmr-c-sync-n', PMR.icon('arrowUp'), h('b', { text: m[1] }), h('span', { text: 'commits ahead' })),
      h('div.pmr-c-sync-n', PMR.icon('arrowDn'), h('b', { text: m[2] }), h('span', { text: 'commits behind' }))));
}

function cSrcWtMatch(item) {
  const f = C_SRC.wtFilter || 'all';
  if (f === 'all') return true;
  const at = item.attrs || {};
  const text = ((item.meta || []).join(' ') + ' ' + (item.facts || []).map(x => x[1]).join(' ')).toLowerCase();
  if (f.startsWith('lifecycle:')) return at['data-lifecycle'] === f.slice(10);
  if (f === 'flag:locked') return /locked|run-owned/.test(text);
  if (f === 'flag:dirty') return /dirty|uncommitted/.test(text);
  if (f === 'flag:prunable') return /orphaned|released/.test(at['data-lifecycle'] || '');
  if (f === 'flag:repairable') return at['data-lifecycle'] === 'orphaned';
  return at['data-owner'] === f;
}

function cSrcList(P, view, sec, body) {
  const isWt = sec.items.some(i => i.kind === 'worktree');
  let shown = 0;
  sec.items.forEach(it => {
    if (isWt && !cSrcWtMatch(it)) return;
    shown += 1;
    body.appendChild(cItemRow(P, it, { ctx: { view, sec } }));
  });
  if (isWt && !shown) body.appendChild(h('p.pmr-c-note', { text: 'No worktree here matches the filter.' }));
  if (sec.note && sec.kind !== 'facts') body.appendChild(h('p.pmr-c-note.is-sec', { text: sec.note }));
}

function cSrcGraph(P, view, sec, body) {
  const walk = (items, depth, parentKey) => items.forEach(it => {
    body.appendChild(cItemRow(P, it, { ctx: { view, sec }, icon: 'branch', row: { depth, parentKey, hoverDetail: (it.attrs && it.attrs['data-lane']) ? 'lane: ' + it.attrs['data-lane'] : '' } }));
    if (it.children) walk(it.children, depth + 1, it.id);
  });
  walk(sec.items, 0, null);
}

function cSrcRenderView(P, view, content) {
  const facts = [];
  view.sections.forEach(sec => {
    if (sec.kind === 'form') return;                          /* the commit composer lives in the footer */
    if (sec.id === 'remote' && view.id === 'changes') return; /* pull / push / fetch: the composer's menu */
    if (sec.id === 'publish') return;                         /* Publish and review: a footer line */
    if (sec.kind === 'facts') { facts.push(sec); return; }
    content.appendChild(P.section(sec, body => {
      if (sec.kind === 'graph') cSrcGraph(P, view, sec, body); else cSrcList(P, view, sec, body);
    }));
  });
  /* facts sections: Jujutsu's current change leads the view; Remote projection and reviews follow the lists */
  facts.forEach(sec => {
    const icon = sec.id === 'current' ? 'edit' : sec.id === 'projection' ? 'globe' : sec.id === 'review' ? 'pr' : 'info';
    const kind = sec.id === 'current' ? 'Current change' : sec.id === 'projection' ? 'Remote' : sec.id === 'review' ? 'Review' : 'Section';
    const one = sec.id === 'current' ? sec.items[0] : null;
    const row = cSummaryRow(P, sec, {
      icon, kind,
      name: one ? one.name : sec.label,
      sub: one ? [sec.label, sec.status && sec.status.word].filter(Boolean).join(' · ') : null,
      build: one ? () => cLensDoc({ P, navKey: 'source:current', title: one.name, status: one.status, line: one.meta, facts: one.facts, actions: sec.actions,
        notes: [] }) : null,
    });
    const wrap = h('div.pmr-c-sumwrap', row);
    if (sec.id === 'current') content.insertBefore(wrap, content.firstChild); else content.appendChild(wrap);
  });
}

function cSrcComposer(P, view) {
  const commit = view.sections.find(s => s.kind === 'form');
  const remote = view.sections.find(s => s.id === 'remote');
  const publish = view.sections.find(s => s.id === 'publish');
  const lines = [];
  if (publish) {
    const pub = h('button', Object.assign({ type: 'button', class: 'pmr-c-footline pmr-cur', 'data-pmr-nav': 'select', 'data-pmr-nav-id': 'source:publish' }, publish.attrs || {}),
      PMR.icon('upload', 'pmr-c-footline-ico'), h('span.pmr-c-footline-t', { text: publish.label }),
      h('span.pmr-c-footline-s', { 'data-state': publish.status.state }, cGlyph(publish.status, { loud: true })), PMR.icon('chevR', 'pmr-c-footline-chev'));
    PMR.hover(pub, publish.label + ': ' + publish.status.word, publish.note);
    pub.addEventListener('click', () => cLensShow(P, { key: '__publish', el: pub, kind: 'Publish and review', icon: 'upload', label: publish.label, build: () => cSectionDoc(P, publish) }));
    lines.push(pub);
  }
  if (commit) {
    const field = commit.form[0];
    const input = h('input', { type: 'text', class: 'pmr-c-msg-in', placeholder: field.placeholder, 'aria-label': field.label, id: 'pmr-c-commitMessage' });
    const gen = PMR.button(field.action, { variant: 'icon', cls: 'pmr-btn-quiet pmr-c-gen' });
    const main = commit.actions.find(a => a.primary);
    const rest = commit.actions.filter(a => !a.primary);
    const commitBtn = PMR.button(main, { variant: 'primary', cls: 'pmr-c-commit' });
    const syncBtn = h('button', { type: 'button', class: 'pmr-btn pmr-btn-text pmr-c-sync-trig', 'aria-haspopup': 'menu', 'data-pmr-nav': 'menu', 'data-pmr-nav-id': 'source:sync' },
      h('span.pmr-btn-label', { text: 'Pull and push' }), PMR.icon('chevD', 'pmr-c-sync-chev'));
    PMR.hover(syncBtn, remote ? remote.label : 'Pull and push', remote ? remote.note : '');
    syncBtn.addEventListener('click', ev => {
      ev.preventDefault();
      const groups = [];
      if (remote) groups.push({ label: String(remote.count), items: remote.actions.map(a => Object.assign({}, a)) });
      if (rest.length) groups.push({ items: rest.map(a => Object.assign({}, a)) });
      PMR.menu.toggle({ id: 'c-src-sync', label: remote ? remote.label : 'Pull and push', groups }, syncBtn, { align: 'end', width: 260 });
    });
    lines.push(h('div.pmr-c-composer', { 'data-scm-section': 'commit' },
      h('div.pmr-c-msg', input, gen),
      h('div.pmr-c-commitrow', commitBtn, syncBtn)));
  }
  return lines.length ? h('div.pmr-c-footlines', lines) : null;
}

function cSrcWhereDoc(P) {
  const d = P.panel;
  const eng = (d.engines.options.find(o => o.id === cSrcEngine()) || {}).hover;
  return cLensDoc({
    P, navKey: 'source:where', title: 'tastebook', mono: false, sub: d.context.lines[0].text.replace(/^tastebook · /, ''), subMono: false,
    status: d.context.state, line: [d.status.word],
    facts: d.context.facts,
    related: [eng ? h('p.pmr-c-lens-meta', { text: eng.detail }) : null,
      cActRow({ label: 'Switch branch', icon: 'branch' }, { P, navKey: 'source:where', menu: P.menus.branch })],
    actions: d.actions,
  });
}

C_SPECS.source = {
  kindWord(P, item) { if (item.kind === 'worktree') return cSrcEngine() === 'jj' ? 'Workspace' : 'Worktree'; if (item.kind === 'commit' && cSrcEngine() === 'jj') return 'Change'; return KIND_WORD[item.kind]; },
  identity(P) {
    const d = P.panel;
    const branch = PMR.menu.trigger(P.menus.branch, { icon: 'branch', cls: 'pmr-c-idtrig', hover: { label: 'Switch branch', detail: 'Current branch: ' + P.menus.branch.value } });
    branch.setAttribute('data-pmr-nav', 'menu'); branch.setAttribute('data-pmr-nav-id', 'ident:source:branch');
    branch.querySelector('.pmr-trigger-label').classList.add('is-mono');
    const engId = cSrcEngine();
    const engMenu = {
      id: 'engine', label: 'History engine', value: engId,
      groups: [{ label: 'Preview the panel with', items: d.engines.options.map(o => Object.assign({}, o.action, { value: o.id, label: o.label, meta: o.id === 'git' ? 'Git / GitHub' : 'preview only' })) }],
    };
    const eng = PMR.menu.trigger(engMenu, {
      cls: 'pmr-c-idtrig pmr-c-engine', hover: { label: 'History engine', detail: 'Preview the panel as Git or Jujutsu. This does not switch the project.' },
      onPick: it => { if (it.value && it.value !== cSrcEngine()) { PMR.state.set('source.engine', it.value); setTimeout(() => P.ctx.rerender(), 0); } },
    });
    eng.setAttribute('data-pmr-nav', 'menu'); eng.setAttribute('data-pmr-nav-id', 'ident:source:engine');
    const where = h('button', { type: 'button', class: 'pmr-c-idstate pmr-cur', 'data-pmr-nav': 'select', 'data-pmr-nav-id': 'ident:source:where' },
      cGlyph(d.context.state), h('span', h('b.pmr-c-idrepo', { text: 'tastebook' }), ' · ' + d.context.lines[1].text));
    PMR.hover(where, 'Where this runs', d.context.lines[0].text + ' · ' + d.context.lines[1].text + ' · ' + d.context.state.word);
    where.addEventListener('click', () => cLensShow(P, { key: '__where', el: where, kind: 'Where this runs', icon: 'monitor', label: 'tastebook', build: () => cSrcWhereDoc(P) }));
    return h('div.pmr-c-identcol', h('div.pmr-c-identrow', branch, eng), where);
  },
  tools(P, view) {
    const panelActs = P.panel.actions.map(a => ({ a }));
    const vt = (view.toolbar || []).filter(a => !a.menu).map(a => ({ a }));
    if (view.filters) {
      const menu = Object.assign({}, view.filters, { value: C_SRC.wtFilter });
      vt.push({ a: { label: 'Filter worktrees', icon: 'filter' }, menu, onPick: it => { C_SRC.wtFilter = it.value || 'all'; P.renderBody(); P.fitAll(); } });
    }
    return vt.concat(panelActs);
  },
  panelGroup(P) { return { label: 'This panel', items: P.panel.actions.map(a => Object.assign({}, a)) }; },
  renderView: cSrcRenderView,
  itemLens(P, item, parts, ctx) {
    const view = (ctx && ctx.view) || P.viewDef();
    if (item.kind === 'change' || item.kind === 'conflict') {
      parts.title = item.name; parts.sub = item.path || null;
      parts.related = [];
      const cmp = (item.meta || [])[1];
      if (cmp) parts.related.push(h('div.pmr-c-lens-block', cLensHeading('Compare'), h('p.pmr-c-lens-meta', { text: item.kind === 'conflict' ? 'Three-way: base, ours and theirs. ' + cmp : cmp })));
      if (item.hunks) parts.related.push(h('div.pmr-c-lens-block', cLensHeading('Hunks', h('span.pmr-num', { text: String(item.hunks.length) })),
        h('div.pmr-c-mini', item.hunks.map(hk => h('div.pmr-c-hunk', h('span.pmr-c-mini-name.is-mono', { text: hk.header }), h('span.pmr-c-hunk-acts', (hk.actions || []).map(a => PMR.button(a, { variant: 'text' }))))))));
      if (item.preview) parts.related.push(h('div.pmr-c-lens-block', cLensHeading('First line'), h('p.pmr-c-lens-note.is-mono', { text: item.preview })));
    }
    if (item.kind === 'worktree') {
      parts.lead = [cSrcSyncBlock(item)];
      parts.related = []; parts.meta = null;
      parts.sub = null;
      parts.facts = (item.facts || []).filter(f => f[0] !== 'Ahead / behind');
      if (item.owner) parts.facts.unshift(['Owner', item.owner]);
      if (item.time) parts.facts.splice(1, 0, ['Last activity', item.time]);
      parts.line = [];
    }
    if (item.kind === 'commit') {
      parts.mono = false;
      parts.related.push(cSrcFilesBlock('Files changed', item.children));
      if (item.time) parts.line = [item.time];
    }
    if (item.kind === 'stash') parts.related.push(cSrcFilesBlock('Files in this stash', item.children));
    if (item.kind === 'bookmark') parts.related.push(cSrcFilesBlock('Per remote', item.children));
    if (item.kind === 'branch' && item.children) parts.related.push(cSrcFilesBlock('Branches off ' + item.name, item.children.map(c => Object.assign({}, c, { meta: c.attrs && c.attrs['data-lane'] ? [c.attrs['data-lane'] + ' lane'] : null }))));
    if (item.kind === 'review') parts.related.push(cSrcGateTable(view));
    if (item.kind === 'operation') parts.line = [item.time];
    if (item.kind === 'gate' && item.note) { parts.notes.push(item.note); parts.note = null; }
  },
  footer(P, view) {
    if (view.id === 'changes' && cSrcEngine() === 'git') return cSrcComposer(P, view);
    return null;
  },
  onRender(P) {},
};
