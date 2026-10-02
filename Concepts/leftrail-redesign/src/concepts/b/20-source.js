/* Concept B — Source Control. The summary page is the identity block (repository, branch, the Git / Jujutsu engine
   preview as a two-option control with a sliding tile, "Where this runs") and one destination per area with its live
   summary; whatever needs you floats to the top. Changes ends with "Publish and review", which pushes its own page. */

B.panels.source = (function () {
  const engine = (panel) => PMR.state.get('source.engine', (panel.engines && panel.engines.current) || 'git');
  const views = (st) => () => PMR.sourceViews();

  /* ---------- special sections ---------- */
  function commitSection(st, sec) {
    const f = sec.form[0];
    const input = h('input', { type: 'text', class: 'pmr-b-input', placeholder: f.placeholder, 'aria-label': f.label, id: 'pmr-b-commit-msg' });
    const gen = iconAct(f.action, st.menus);
    const commit = sec.actions.find(a => a.primary);
    const rest = sec.actions.filter(a => !a.primary);
    const commitBtn = h('button', Object.assign({ type: 'button', class: 'pmr-btn pmr-btn-primary is-primary pmr-b-commitbtn' }, PMR.actionAttrs(commit)), PMR.icon(commit.icon, 'pmr-btn-ico'), h('span.pmr-btn-label', { text: commit.label }));
    return section({
      key: 'source:commit', label: sec.label, menus: st.menus,
      body: () => [h('div.pmr-b-composer', h('div.pmr-b-filter.pmr-b-commitfield', input, gen), h('div.pmr-b-composer-acts', commitBtn, rest.map(a => textAct(a, st.menus, { icon: true }))))],
    });
  }
  function remoteSection(st, sec) {
    return section({
      key: 'source:remote', label: sec.label, count: sec.count, menus: st.menus,
      body: () => [h('div.pmr-b-btnrow', sec.actions.map(a => textAct(a, st.menus, { icon: true }))), sec.note ? noteEl(sec.note) : null],
    });
  }
  function publishDesc(st, sec) {
    return {
      key: 'source:publish', kind: 'item', title: sec.label,
      sub: () => h('div.pmr-b-subline', PMR.statusEl(sec.status)),
      build: () => {
        const out = [noteEl(sec.note, 'is-lead')];
        const facts = sec.items.filter(it => it.kind === 'fact');
        const push = sec.items.find(it => it.kind === 'remote');
        out.push(h('div.pmr-b-sub', { text: 'Destination' }), factItems(facts.slice(0, 1), st.menus));
        if (push) {
          out.push(h('div.pmr-b-pushto', h('div.pmr-b-fact', h('div.pmr-b-fact-k', { text: push.name }),
            h('div.pmr-b-fact-v', PMR.glyph(push.status.state), h('span', { text: push.meta.join(' · ') + ' · ' + push.status.word }))),
          push.note ? noteEl(push.note) : null,
          asList(push.children).map(c => row({ key: 'source:' + c.id, lead: PMR.icon('globe'), name: c.name, mono: true, meta: c.meta, end: [wordEl(c.status)], cls: 'is-child', attrs: { 'data-canon': c.canon || null } }))));
        }
        out.push(h('div.pmr-b-sub', { text: 'Checks before sending' }), factItems(facts.slice(1), st.menus));
        out.push(h('div.pmr-b-sub', { text: 'Actions' }), actionList(sec.actions.map((a, i) => i === 0 ? Object.assign({ primary: true }, a) : a), st.menus));
        return out;
      },
    };
  }
  function publishSection(st, sec) {
    const wrap = h('section.pmr-b-sec', { 'data-b-sec': 'source:publish', 'data-scm-section': sec.attrs && sec.attrs['data-scm-section'] });
    wrap.appendChild(h('div.pmr-b-sec-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Publish' })));
    const d = h('div.pmr-b-dests');
    d.appendChild(destRow({ key: 'source:publish', icon: 'upload', label: sec.label, summary: sec.status.word + ' · ' + sec.items.find(i => i.kind === 'remote').meta[0], drill: () => publishDesc(st, sec) }));
    wrap.appendChild(d);
    return wrap;
  }
  function currentChange(st, sec, v) {
    const it = sec.items[0];
    const withActs = Object.assign({}, it, { actions: sec.actions });
    return section({
      key: 'source:jj-current', label: sec.label, status: sec.status, attrs: sec.attrs, menus: st.menus,
      body: () => [itemRow(st, withActs, [withActs], { meta: x => x.meta })],
    });
  }

  function cfg(st) {
    return {
      sections: {
        commit: sec => commitSection(st, sec),
        remote: sec => remoteSection(st, sec),
        publish: sec => publishSection(st, sec),
        current: (sec, v) => currentChange(st, sec, v),
      },
      rows: {
        staged: { noun: 'staged file' }, unstaged: { noun: 'unstaged file' }, untracked: { noun: 'untracked file' },
        conflicts: { noun: 'conflicted file' },
        live: { noun: 'worktree', lead: () => PMR.icon('branch'), meta: x => [x.owner, x.time], diffInMeta: true },
        orphaned: { noun: 'orphaned worktree', lead: () => PMR.icon('branch') },
        workspaces: { noun: 'workspace', lead: () => PMR.icon('folder'), meta: x => [x.owner, x.time] },
        commits: { noun: 'commit', lead: () => PMR.icon('clock'), meta: x => asList(x.meta).concat(x.time ? [x.time] : []), childLabel: () => 'Changed files' },
        changes: { noun: 'change', meta: x => asList(x.meta).concat(x.time ? [x.time] : []) },
        branches: { noun: 'branch', lead: () => PMR.icon('branch'), statusEnd: true },
        stashes: { noun: 'stash', lead: () => PMR.icon('stash'), childLabel: () => 'Files in this stash' },
        requests: { noun: 'pull request', lead: () => PMR.icon('pr') },
        gates: { noun: 'check', lead: () => PMR.icon('check'), meta: x => x.meta },
        bookmarks: { noun: 'bookmark', lead: () => PMR.icon('pin'), childLabel: () => 'Per remote' },
        operations: { noun: 'operation', lead: () => PMR.icon('layers'), meta: x => [x.time] },
      },
    };
  }

  /* ---------- the summary page ---------- */
  function engineSeg(st) {
    const panel = st.panel, cur = engine(panel);
    const opts = panel.engines.options;
    const seg = h('div.pmr-b-seg', { role: 'radiogroup', 'aria-label': 'Local history engine (preview only)', 'data-cur': cur });
    seg.appendChild(h('span.pmr-b-seg-tile', { 'aria-hidden': 'true' }));
    opts.forEach(o => {
      const b = h('button', Object.assign({ type: 'button', class: 'pmr-b-seg-opt', role: 'radio', 'aria-checked': String(o.id === cur) }, PMR.actionAttrs(o.action)), h('span', { text: o.label }));
      b.addEventListener('click', ev => {
        ev.preventDefault();
        if (engine(panel) === o.id) return;
        PMR.state.set('source.engine', o.id);
        seg.setAttribute('data-cur', o.id);
        seg.querySelectorAll('.pmr-b-seg-opt').forEach(x => x.setAttribute('aria-checked', String(x === b)));
        switchEngine(st);
      });
      seg.appendChild(b);
    });
    return seg;
  }
  function switchEngine(st) {
    PMR.menu.closeAll();
    if (st.depth > 1) st.popToRoot();
    const page = st.pages[0];
    const old = page.dyn;
    if (!old) return;
    const before = {};
    old.querySelectorAll('[data-b-row]').forEach(r => { const c = r.querySelector('.pmr-b-dest-count'); before[r.getAttribute('data-b-row')] = c ? c.textContent : ''; });
    const fresh = dynBlock(st);
    old.replaceWith(fresh); page.dyn = fresh;
    const nodes = fresh.querySelectorAll('.pmr-b-dest, .pmr-b-group-head, .pmr-b-glance-row');
    M.stagger(nodes, { max: 12, dy: 8, step: stepped(fam()) ? 0 : 16 });
    /* counts that changed tick */
    fresh.querySelectorAll('[data-b-row]').forEach(r => {
      const k = r.getAttribute('data-b-row'); const c = r.querySelector('.pmr-b-dest-count');
      if (c && k in before && before[k] !== c.textContent) tick(c);
    });
    st.changed();
  }
  function tick(el) {
    anim(el, [{ transform: 'translateY(-60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { dur: 'med', ease: 'spring', delay: 120 });
  }
  function dynBlock(st) {
    const panel = st.panel;
    const vs = PMR.sourceViews();
    const make = v => areaDesc(st, v, views(st), cfg(st));
    const box = h('div.pmr-b-dyn');
    const att = vs.filter(v => v.attention);
    const rest = vs.filter(v => !v.attention);
    const dest = v => destRow({ key: 'source:' + v.id, icon: v.icon, label: v.label, summary: v.summary, attention: v.attention, count: v.count, canon: v.canon, drill: () => make(v) });
    if (att.length) {
      const g = h('div.pmr-b-group.is-needs', h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Needs you' })), h('div.pmr-b-dests', att.map(dest)));
      box.appendChild(g);
      box.appendChild(h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Everything else' })));
    }
    box.appendChild(h('div.pmr-b-dests', rest.map(dest)));
    box.appendChild(glance(st, vs));
    return box;
  }
  function glance(st, vs) {
    const panel = st.panel;
    const out = h('div.pmr-b-glance');
    out.appendChild(h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'At a glance' })));
    if (engine(panel) === 'jj') {
      const ch = vs.find(v => v.id === 'changes');
      const cur = ch && ch.sections[0].items[0];
      const rev = vs.find(v => v.id === 'reviews');
      if (cur) out.appendChild(row({ key: 'source:glance:current', lead: PMR.icon('edit'), name: cur.name, metaEl: metaWith(cur.status, ['current change']), drill: () => areaDesc(st, ch, views(st), cfg(st)) }));
      if (rev) out.appendChild(row({ key: 'source:glance:review', lead: PMR.icon('pr'), name: rev.summary.split(' · ')[0], meta: [rev.summary.split(' · ').slice(1).join(' · ')], drill: () => areaDesc(st, rev, views(st), cfg(st)) }));
    } else {
      const ch = vs.find(v => v.id === 'changes');
      const remote = ch && ch.sections.find(s => s.id === 'remote');
      const sync = panel.actions.find(a => a.cmd === 'cmd.source_control.remote.sync');
      const rev = vs.find(v => v.id === 'reviews');
      const pr = rev && rev.sections[0].items[0];
      if (remote) out.appendChild(h('div.pmr-b-glance-row', h('span.pmr-b-lead', PMR.icon('push')), h('span.pmr-b-lines', h('span.pmr-b-name', { text: '2 commits to push' }), h('span.pmr-b-meta', { text: remote.count })), textAct(sync, st.menus, { icon: true })));
      if (pr) out.appendChild(row({ key: 'source:glance:pr', lead: PMR.icon('pr'), name: pr.name, metaEl: metaWith(pr.status, pr.meta.slice(0, 1).concat(pr.meta.slice(2))), drill: () => itemDesc(st, pr, rev.sections[0].items, cfg(st).rows.requests) }));
    }
    return out;
  }
  function rootDesc(st) {
    const panel = st.panel;
    return {
      key: 'source:root', kind: 'root', title: panel.title,
      actions: () => panel.actions.filter(a => a.cmd !== 'cmd.source_control.remote.sync').map(a => iconAct(a, st.menus)),
      build: (page) => {
        const l0 = panel.context.lines[0], l1 = panel.context.lines[1];
        const [repo, ...rest] = l0.text.split(' · ');
        const repoLine = h('div.pmr-b-ident-line', h('span.pmr-b-repo', { text: repo }), h('span.pmr-b-repo-meta', { text: rest.join(' · ') }));
        if (l0.hover) PMR.hover(repoLine, l0.hover.label, l0.hover.detail);
        const trig = PMR.menu.trigger(panel.menus.branch, { icon: 'branch', hover: { label: 'Switch branch', detail: 'Current branch: ' + panel.menus.branch.value } });
        trig.setAttribute('data-pmr-nav', 'menu');
        const where = disclosure('Where this runs', [h('p.pmr-b-note.is-lead', { text: l1.text })].concat(factList(panel.context.facts, { key: 'source-where' })), { navId: 'source-where' });
        page.dyn = dynBlock(st);
        return [h('div.pmr-b-block.pmr-b-ident', repoLine, h('div.pmr-b-ident-line', trig, h('span.pmr-b-grow'), engineSeg(st)), where), page.dyn];
      },
    };
  }

  return {
    state(st) { return st.panel.context.state ? PMR.statusEl(st.panel.context.state, { cls: 'pmr-b-pstate' }) : null; },
    root: rootDesc,
  };
})();
