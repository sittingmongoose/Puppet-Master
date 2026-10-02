/* Docker Manager in the Lens concept. Identity: Execution Host, the Docker context menu and the readiness word; the
   second line ("Ready · 6 running ...") opens "Where this runs" in the Lens. Ten views as morphing icon tabs; Networks,
   Volumes, Contexts and Kubernetes go into the More tab first when the strip is full. Containers list failing first;
   the container Lens holds ports with Open, CPU and memory, recent events, the image and every action. The publish
   chain is a list of steps whose Lens explains the step's state and what it waits on. */

const C_DOCK_RANK = { failed: 0, blocked: 1, warn: 2, stale: 3, stopped: 4, pending: 5, running: 6, ok: 7, info: 8 };

function cDockPorts(ports) {
  if (!ports || !ports.length) return null;
  return h('div.pmr-c-lens-block', cLensHeading('Ports', h('span.pmr-num', { text: String(ports.length) })),
    h('div.pmr-c-mini', ports.map(p => {
      const copy = /^Copied/.test(p.arg || '');
      const b = h('button', Object.assign({ type: 'button', class: 'pmr-btn pmr-btn-text pmr-c-portbtn' }, PMR.actionAttrs(p)),
        PMR.icon(copy ? 'copy' : 'external', 'pmr-btn-ico'), h('span.pmr-btn-label', { text: copy ? 'Copy address' : 'Open' }));
      PMR.hover(b, copy ? 'Copy address' : 'Open in the browser', p.arg);
      return h('div.pmr-c-mini-row', PMR.icon('link', 'pmr-c-mini-ico'), h('span.pmr-c-mini-name.is-mono', { text: p.label }), b);
    })));
}
function cDockMetrics(metrics) {
  if (!metrics || !metrics.length) return null;
  return h('div.pmr-c-lens-block', cLensHeading('Load'),
    h('div.pmr-c-mini', metrics.map(m => h('div.pmr-c-mini-row', h('span.pmr-c-mini-k', { text: m.label }), cMeter(m.value, m.state || 'ok', m.label), h('span.pmr-c-mini-meta.pmr-num', { text: m.text })))));
}
function cDockEvents(name) {
  const ev = ((PMR.data.docker.views[0].sections.find(s => s.id === 'events') || {}).items || []).filter(e => e.name.startsWith(name + ' '));
  if (!ev.length) return null;
  return h('div.pmr-c-lens-block', cLensHeading('Recent events'),
    h('div.pmr-c-mini', ev.map(e => h('div.pmr-c-mini-row', cGlyph(e.status, { loud: true }), h('span.pmr-c-mini-name', { text: e.name.slice(name.length + 1) + ' · ' + (e.meta || []).join(' · ') })))));
}
function cDockChain(view, current) {
  const chain = view.sections.find(s => s.kind === 'chain');
  if (!chain) return null;
  return h('div.pmr-c-lens-block', cLensHeading('The chain'),
    h('div.pmr-c-mini', chain.items.map((s, i) => h('div', { class: ['pmr-c-mini-row', s.id === current && 'is-here'] },
      h('span.pmr-c-stepno', { text: String(i + 1) }), h('span.pmr-c-mini-name', { text: s.name }), cStatusWordEl(s.status)))));
}

function cDockList(P, view, sec, body) {
  let items = sec.items.slice();
  if (sec.id === 'containers') items.sort((a, b) => (C_DOCK_RANK[(a.status || {}).state] ?? 9) - (C_DOCK_RANK[(b.status || {}).state] ?? 9));
  items.forEach((it, i) => {
    if (it.kind === 'fact' || it.kind === 'summary') {
      const m = (it.metrics || [])[0];
      body.appendChild(P.factLine(it.id, it.name, (it.meta || []).join(' · '), { mono: it.mono, state: it.status ? it.status.state : null, extra: m ? cMeter(m.value, m.state || 'ok', m.label) : null }));
      return;
    }
    const lead = it.kind === 'stage' ? h('span.pmr-c-stepno', { text: String(i + 1) }) : null;
    body.appendChild(cItemRow(P, it, { ctx: { view, sec }, row: lead ? { fit: true, lead, icon: null } : { fit: true } }));
  });
  if (sec.note) body.appendChild(h('p.pmr-c-note.is-sec', { text: sec.note }));
}

function cDockWhereDoc(P) {
  const d = P.panel;
  return cLensDoc({
    P, navKey: 'docker:where', title: 'Home Server', mono: false, sub: 'Docker Engine · default context', subMono: false,
    status: d.context.state, line: [d.context.lines[1].text.replace(/^Ready · /, '')],
    facts: d.context.facts,
    related: [cActRow({ label: 'Switch Docker context', icon: 'docker' }, { P, navKey: 'docker:where', menu: P.menus.context })],
    actions: d.actions,
  });
}

C_SPECS.docker = {
  lessUsed: ['networks', 'volumes', 'contexts', 'kubernetes'],
  identity(P) {
    const d = P.panel;
    const host = h('span.pmr-c-idtext.is-strong', { text: 'Home Server' });
    PMR.hover(host, d.context.lines[0].hover.label, d.context.lines[0].hover.detail);
    const ctxTrig = PMR.menu.trigger(P.menus.context, { icon: 'docker', cls: 'pmr-c-idtrig', hover: { label: 'Docker context and source', detail: d.hover.detail } });
    ctxTrig.setAttribute('data-pmr-nav', 'menu'); ctxTrig.setAttribute('data-pmr-nav-id', 'ident:docker:context');
    ctxTrig.querySelector('.pmr-trigger-label').classList.add('is-mono');
    const where = h('button', { type: 'button', class: 'pmr-c-idstate pmr-cur', 'data-pmr-nav': 'select', 'data-pmr-nav-id': 'ident:docker:where', 'data-canon': d.context.lines[1].canon },
      cGlyph(d.context.state, { loud: true }), h('span', { text: d.context.lines[1].text }));
    PMR.hover(where, 'Where this runs: ' + d.context.state.word, d.context.lines[0].text + ' · engine handshake checked 12 seconds ago');
    where.addEventListener('click', () => cLensShow(P, { key: '__where', el: where, kind: 'Where this runs', icon: 'monitor', label: 'Home Server', build: () => cDockWhereDoc(P) }));
    return h('div.pmr-c-identcol', h('div.pmr-c-identrow', host, ctxTrig), where);
  },
  tools(P, view) {
    const vt = (view.toolbar || []).filter(a => !a.menu).map(a => ({ a }));
    return vt.concat(P.panel.actions.map(a => ({ a })));
  },
  panelGroup(P) { return { label: 'This panel', items: P.panel.actions.map(a => Object.assign({}, a)) }; },
  renderView(P, view, content) {
    view.sections.forEach(sec => {
      if (sec.kind === 'facts') {
        const wrap = h('div.pmr-c-sumwrap', cSummaryRow(P, sec, { icon: 'compose', kind: 'Compose project', name: 'tastebook compose project', sub: [sec.status && sec.status.word, '5 of 7 up', 'checked 12 seconds ago'].join(' · ') }));
        content.appendChild(wrap);
        return;
      }
      const one = view.sections.length === 1 && sec.label === view.label;
      content.appendChild(P.section(sec, body => cDockList(P, view, sec, body), { collapsible: !one, label: one ? sec.label : null }));
    });
  },
  rowEnd(P, item) {
    if (item.kind === 'container' && item.status) return cGlyph(item.status, { loud: true });
    return undefined;
  },
  itemLens(P, item, parts, ctx) {
    const view = (ctx && ctx.view) || P.viewDef();
    if (item.kind === 'container' || item.kind === 'service' || item.kind === 'scenario') {
      if (item.note) { parts.noteMono = true; parts.noteState = item.status && item.status.state; }
      parts.related.push(cDockPorts(item.ports));
      parts.related.push(cDockMetrics(item.metrics));
      if (item.kind === 'container') parts.related.push(cDockEvents(item.name));
    }
    if (item.kind === 'stage') {
      const rc = (item.facts || []).find(f => f[0] === 'Receipt');
      const m = rc && /blocked by: (.+)$/.exec(rc[1]);
      if (m) parts.blocked = { state: 'pending', title: 'Waiting on an earlier step', reason: 'This step cannot start yet: ' + m[1] + '. Nothing is sent until the earlier link has a receipt.' };
      parts.related.push(cDockChain(view, item.id));
      const chain = view.sections.find(s => s.kind === 'chain');
      if (chain && chain.note) parts.notes.push(chain.note);
      if (chain && item.id === 'stage:2') parts.actions = chain.actions.filter(a => /Push$/.test(a.label));
      if (chain && item.id === 'stage:4') parts.actions = chain.actions.filter(a => /template/.test(a.label));
    }
    if (item.kind === 'build-target') parts.line = [];
    if (item.kind === 'context' && item.blocked) parts.blocked.state = 'failed';
  },
  footer() { return null; },
};
