/* Concept A — Source Control (Git and Jujutsu presentations). The head reads like a document header: the repository
   and branch, a quiet line naming the engine and the online service with the Git / Jujutsu switch, and "Where this
   runs" opening the context facts in place. Changes reads top to bottom: conflicts, staged, the commit message,
   unstaged, untracked, then remotes and "Publish and review" as ordinary sections. */

const SOURCE_TAB_TWIN = { worktrees: 'workspaces', workspaces: 'worktrees', branches: 'bookmarks', bookmarks: 'branches', operations: 'history' };
const SOURCE_CLICK_KINDS = { change: 1, conflict: 1, commit: 1 };

function sourceEngine(panel) { return PMR.state.get('source.engine', (panel.engines && panel.engines.current) || 'git'); }

function sourceIdentity(inst) {
  const panel = inst.panel, ctx = panel.context || {};
  const engine = sourceEngine(panel);
  const out = [];
  /* line 1: repository and branch */
  if (engine === 'git' && panel.menus.branch) {
    const trig = PMR.menu.trigger(panel.menus.branch, { icon: 'branch', cls: 'pmr-a-trigger', hover: { label: 'Switch branch', detail: 'Current branch: ' + panel.menus.branch.value } });
    setNav(trig, 'menu', navIdOf('branch', 'source'), true);
    out.push(h('div.pmr-a-idline.is-nowrap', h('span.pmr-a-idname', { text: 'tastebook' }), sep(), trig));
  } else {
    out.push(h('div.pmr-a-idline', h('span.pmr-a-idname', { text: 'tastebook' }), sep(), h('span.pmr-a-idtext', { text: 'default workspace' })));
  }
  /* line 2: engine, online service, outgoing; the presentation switch */
  const sw = h('div.pmr-a-engine', { role: 'group', 'aria-label': 'Presentation' });
  (panel.engines ? panel.engines.options : []).forEach(opt => {
    const chosen = opt.id === engine;
    const b = h('button', Object.assign({ type: 'button', class: 'pmr-a-eng pmr-chosen pmr-strip', 'aria-pressed': String(chosen) }, PMR.actionAttrs(opt.action)), opt.label, chosen ? h('span.pmr-a-engink', { 'aria-hidden': 'true' }) : null);
    if (opt.hover && !b.getAttribute('data-pm-hover-label')) PMR.hover(b, opt.hover.label, opt.hover.detail);
    setNav(b, 'tab', navIdOf('engine', opt.id), !chosen);
    b.addEventListener('click', ev => {
      ev.preventDefault();
      if (sourceEngine(panel) === opt.id) return;
      inst.keepForRerender();
      const k = A.keep.source; if (k && SOURCE_TAB_TWIN[k.tab]) k.tab = SOURCE_TAB_TWIN[k.tab];
      A.engineSwitched = true;
      PMR.state.set('source.engine', opt.id);
      inst.ctx.rerender();
    });
    sw.appendChild(b);
  });
  const remoteSec = (panel.views.find(v => v.id === 'changes') || { sections: [] }).sections.find(s => s.id === 'remote');
  const outgoing = remoteSec && /(\d+) outgoing/.exec(String(remoteSec.count || ''));
  const quiet = [engine === 'jj' ? 'Jujutsu' : 'Git', 'GitHub'].concat(outgoing ? [outgoing[1] + ' to push'] : []);
  const ctxHover = (ctx.lines && ctx.lines[0] && ctx.lines[0].hover) || panel.hover;
  const qt = h('span.pmr-a-idtext', joinFacts(quiet));
  if (ctxHover) PMR.hover(qt, ctxHover.label, ctxHover.detail);
  out.push(h('div.pmr-a-idline.is-quiet', qt, h('span.pmr-a-idsp'), sw));
  /* where this runs */
  const intro = ctx.lines && ctx.lines[1] ? h('p.pmr-a-note', { text: ctx.lines[1].text }) : null;
  out.push(miniDisclosure(inst, 'where', 'Where this runs', () => [intro].concat(factsBlock(inst, ctx.facts || [], 'where')), { right: PMR.statusEl(ctx.state), cls: 'pmr-a-where' }));
  return out;
}

function sourceRowOpts(inst, sec, v) {
  const base = {
    menus: inst.menus, navScope: v.id,
    primary: undefined,
  };
  const kindOf = it => it.kind;
  /* only reading actions run on a click of the name (open diff, open the conflict assistant); everything that changes
     the repository stays an explicit button in the detail */
  base.primary = null;
  const firstKind = (sec.items || [])[0] ? kindOf(sec.items[0]) : '';
  if (SOURCE_CLICK_KINDS[firstKind]) base.primary = undefined;
  if (firstKind === 'commit') Object.assign(base, { wrap: true, cls: 'is-wrapname', l2: it => [it.status ? stateWord(it.status) : null].concat(it.meta || []).filter(m => !(it.status && m === it.status.word)) });
  if (firstKind === 'worktree') {
    Object.assign(base, {
      right: it => (it.status ? PMR.glyph(it.status.state) : null),
      l2: it => [stateWord(it.status), it.owner].concat((it.meta || []).slice(0, 1)),
      extra: it => (it.diff ? [h('div.pmr-a-fact.pmr-a-dline', h('span.pmr-a-fk', { text: 'Changes against the base' }), h('span.pmr-a-fv', diffEl(it.diff)))] : []),
      l3: it => ((it.meta || []).length > 1 ? it.meta.slice(1) : []),
    });
  }
  if (firstKind === 'branch' || firstKind === 'bookmark' || firstKind === 'stash' || firstKind === 'operation') {
    Object.assign(base, { right: it => (it.status ? PMR.glyph(it.status.state) : null) });
  }
  if (firstKind === 'review') {
    Object.assign(base, {
      primary: null,
      l2: it => [stateWord(it.status), (it.meta || [])[0]],
      l3: it => [factValue(it.facts, 'Merge strategy')].concat((it.meta || []).slice(1)),
    });
  }
  if (firstKind === 'gate') {
    Object.assign(base, {
      cls: 'pmr-a-gate', primary: null,
      right: it => h('span.pmr-a-gsrc', { text: (it.meta || [])[0] || '' }),
      l2: it => [h('span', { class: 'pmr-a-enf', 'data-enforcement': (it.attrs || {})['data-enforcement'] || '', text: (it.meta || [])[1] || factValue(it.facts, 'Enforcement') || '' })],
      l2right: it => (it.status ? PMR.statusEl(it.status) : null),
    });
  }
  return base;
}

function sourceSection(inst, sec, v) {
  if (sec.kind === 'form') return sourceCommitForm(inst, sec);
  if (sec.kind === 'graph') return h('div.pmr-a-graph', sec.items.map(root => [
    h('div.pmr-a-glane.is-root', h('span.pmr-a-gdot', { 'aria-hidden': 'true' }), nameEl(root.name, { mono: true }), root.status ? PMR.statusEl(root.status) : null),
    (root.children || []).map(c => h('div.pmr-a-glane', { 'data-lane': (c.attrs || {})['data-lane'] || null }, h('span.pmr-a-gdot', { 'aria-hidden': 'true' }), nameEl(c.name, { mono: true }), h('span.pmr-a-gmeta', { text: (c.attrs || {})['data-lane'] || '' }))),
    root.facts ? h('div.pmr-a-graphtech', factsBlock(inst, root.facts, 'tech:' + root.id)) : null,
  ]));
  if (sec.kind === 'facts') {
    return h('div.pmr-a-list', { role: 'list', 'aria-label': sec.label }, (sec.items || []).map(it => (it.kind === 'current-change' ? row(inst, it, Object.assign(sourceRowOpts(inst, sec, v), { primary: null, wrap: true, cls: 'is-wrapname', right: x => (x.status ? PMR.glyph(x.status.state) : null) })) : factItem(inst, it, { menus: inst.menus }))));
  }
  if (!(sec.items || []).length) return null;
  return listOf(inst, sec, sourceRowOpts(inst, sec, v));
}

function sourceCommitForm(inst, sec) {
  const f = (sec.form || [])[0] || {};
  const ta = h('textarea', { rows: '2', placeholder: (f.placeholder || 'Commit message').replace(/\.\.\.$/, '…'), 'aria-label': f.label || 'Commit message', spellcheck: 'true' });
  const gen = f.action ? iconAct(f.action) : null;
  const acts = sec.actions || [];
  const staged = (inst.views.find(x => x.id === 'changes').sections.find(s => s.id === 'staged') || {}).count;
  return h('div.pmr-a-form',
    h('div.pmr-a-field', ta, gen),
    h('div.pmr-a-formacts', ordered(acts).map(a => act(a, { variant: a.primary ? 'text' : 'quiet', keepPrimary: true }))),
    staged != null ? h('p.pmr-a-secnote.pmr-a-formnote', { text: 'Commits the ' + staged + ' staged files. Git changes do not join editor undo.' }) : null);
}

function sourcePane(inst, v) {
  let sections = (v.sections || []).slice();
  if (v.id === 'changes' && sourceEngine(inst.panel) === 'git') {
    const by = id => sections.find(s => s.id === id);
    const order = ['conflicts', 'staged', 'commit', 'unstaged', 'untracked', 'remote', 'projection', 'publish'];
    sections = order.map(by).filter(Boolean).concat(sections.filter(s => !order.includes(s.id)));
  }
  const vv = Object.assign({}, v, { sections });
  return defaultPane(inst, vv, {
    build: (s) => sourceSection(inst, s, v),
    secOpts: s => ({ collapsible: s.kind !== 'form', actsAfter: s.kind === 'facts' }),
  });
}

function sourceToolbar(inst, v) {
  const list = (v.toolbar || []).filter(a => !a.menu);
  const filt = v.filters ? PMR.menu.trigger(v.filters, { icon: 'filter', cls: 'pmr-a-filter', onPick: it => sourceFilter(inst, v, it) }) : null;
  if (filt) setNav(filt, 'menu', navIdOf('filter', 'source', v.id), true);
  if (!list.length && !filt) return null;
  return h('div.pmr-a-toolbar', list.map(a => act(a, { variant: 'quiet', cls: 'pmr-a-tool', menus: inst.menus })), filt ? h('span.pmr-a-toolsp') : null, filt);
}

/* worktree filters: owner, lifecycle, flags; filtered-empty says so and offers to show all */
function sourceFilter(inst, v, it) {
  const pane = inst.panes.get(v.id);
  if (!pane) return;
  const val = String(it.value || 'all');
  const items = new Map();
  (v.sections || []).forEach(s => (s.items || []).forEach(x => items.set(x.id, x)));
  const match = x => {
    if (val === 'all') return true;
    const at = x.attrs || {};
    const [k, w] = val.includes(':') ? val.split(':') : ['owner', val];
    if (k === 'owner') return at['data-owner'] === w || (w === 'thread' && /thread/i.test(x.owner || ''));
    if (k === 'lifecycle') return at['data-lifecycle'] === w;
    if (k === 'flag') {
      if (w === 'locked') return !!factValue(x.facts, 'Lock') || (x.meta || []).some(m => /locked/.test(m));
      if (w === 'dirty') return (x.meta || []).some(m => /dirty|staged|unstaged/.test(m)) || /uncommitted/.test(factValue(x.facts, 'Dirty') || '');
      if (w === 'prunable' || w === 'repairable') return at['data-lifecycle'] === 'orphaned';
    }
    return false;
  };
  let shown = 0;
  pane.querySelectorAll('.pmr-a-row[data-item]').forEach(r => { const x = items.get(r.getAttribute('data-item')); const ok = !x || match(x); r.hidden = !ok; if (ok) shown += 1; });
  pane.querySelectorAll('.pmr-a-sec').forEach(sc => { const rows = sc.querySelectorAll('.pmr-a-row[data-item]'); if (rows.length) sc.hidden = !Array.from(rows).some(r => !r.hidden); });
  let empty = pane.querySelector('.pmr-a-filterempty');
  if (!empty) {
    empty = h('div.pmr-a-empty.pmr-a-filterempty', h('p.pmr-a-empty-t', PMR.glyph('info'), h('span', { text: 'No worktrees match this filter.' })),
      h('p.pmr-a-empty-why', { text: 'The worktrees still exist; the filter only hides them here.' }),
      h('div.pmr-a-acts', act({ label: 'Show all worktrees', icon: 'x', local: 'wtFilterClear' }, { variant: 'quiet', onLocal: () => { const t = inst.tools.get(v.id).querySelector('.pmr-a-filter'); v.filters.value = 'all'; v.filters.groups.forEach(g => (g.items || []).forEach(m => { m.selected = m.value === 'all'; })); if (t) { t.querySelector('.pmr-trigger-label').textContent = 'All worktrees'; } sourceFilter(inst, v, { value: 'all' }); } })));
    pane.insertBefore(empty, pane.firstChild);
  }
  empty.hidden = shown > 0;
  cascade(Array.from(pane.querySelectorAll('.pmr-a-row[data-item]')).filter(r => !r.hidden), { max: 10, step: 16 });
}

function renderSource(panel, view, ctx) {
  const inst = makePanel(panel, view, ctx, { identity: sourceIdentity, pane: sourcePane, toolbar: sourceToolbar });
  if (A.engineSwitched) {
    /* after a Git / Jujutsu switch: the ink draws in under the chosen word, then the new presentation cascades in */
    A.engineSwitched = false;
    const ink = view.querySelector('.pmr-a-engink');
    requestAnimationFrame(() => {
      if (ink) animateEl(ink, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: stepped() ? 120 : M.spec().med, easing: stepped() ? 'steps(3, end)' : M.spec().spring });
      if (ctx.isShown()) inst.show();
    });
  }
  return inst;
}
