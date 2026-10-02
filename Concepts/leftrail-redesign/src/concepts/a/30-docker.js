/* Concept A — Docker Manager. The head names where Docker runs (Execution Host, Execution Environment, the context as a
   chat-style trigger) and its readiness word; ten views in one strip of full words with More for the rest.
   Containers are ledger rows (name and status word, then image and facts); the fleet summary is a quiet sentence;
   events a short dated list; the publish chain a numbered sequence joined by a hairline. */

function dockerIdentity(inst) {
  const panel = inst.panel, ctx = panel.context || {};
  const l1 = (ctx.lines || [])[0] || {};
  const l2 = (ctx.lines || [])[1] || {};
  const where = String(l1.text || '').split(' · ');
  const trig = PMR.menu.trigger(panel.menus.context, { icon: 'docker', cls: 'pmr-a-trigger', hover: l1.hover });
  setNav(trig, 'menu', navIdOf('context', 'docker'), true);
  const lead = h('span.pmr-a-idtext', { 'data-canon': l1.canon || null }, joinFacts(where.slice(0, 2)));
  if (l1.hover) PMR.hover(lead, l1.hover.label, l1.hover.detail);
  const parts = String(l2.text || '').split(' · ');
  const ready = ctx.state ? h('span', { class: 'pmr-status', 'data-state': ctx.state.state }, PMR.glyph(ctx.state.state), h('span.pmr-status-word', { text: parts[0] || ctx.state.word })) : null;
  return [
    h('div.pmr-a-idline.is-quiet', lead),
    h('div.pmr-a-idline.is-nowrap', h('span.pmr-a-idk', { text: 'Context' }), trig, h('span.pmr-a-idsp'), ready),
    parts.length > 1 ? h('div.pmr-a-idline.is-quiet', { 'data-canon': l2.canon || null }, h('span.pmr-a-idtext', { text: parts.slice(1).join(' \u00b7 ') })) : null,
    miniDisclosure(inst, 'where', 'Where this runs', () => factsBlock(inst, ctx.facts || [], 'where'), { cls: 'pmr-a-where' }),
  ];
}

/* a status word where it helps: running and healthy rows show the glyph alone, anything else names its state */
function quietWord(it) {
  const st = it.status;
  if (!st) return null;
  if (st.state === 'running' && /^running$/.test(st.word)) return PMR.h('span', { class: 'pmr-status', 'data-state': st.state, 'aria-label': st.word }, PMR.glyph(st.state));
  return PMR.statusEl(st);
}

function dockerRowOpts(inst, sec, v) {
  const o = { menus: inst.menus, navScope: v.id };
  const kind = ((sec.items || [])[0] || {}).kind;
  if (kind === 'container') {
    Object.assign(o, {
      right: quietWord,
      l2: it => (it.meta || []).filter(m => !(it.status && m === it.status.word)),
      hoverDetail: it => 'Image ' + factValue(it.facts, 'Image'),
    });
  } else if (kind === 'service' || kind === 'scenario' || kind === 'registry' || kind === 'context') {
    Object.assign(o, { right: kind === 'service' ? quietWord : null, wordAt: 'l1', l2: it => (it.meta || []).filter(m => !(it.status && m === it.status.word)) });
    if (!o.right) delete o.right;
    if (kind !== 'service') o.primary = null;
  } else if (kind === 'event') {
    Object.assign(o, { wordAt: 'l1', flat: true });
  } else if (kind === 'stage') {
    Object.assign(o, {
      cls: 'pmr-a-step is-wrapname', wrap: true, wordAt: 'l1', primary: null, defaultOpen: true,
      lead: it => h('span.pmr-a-stepn', { text: String((sec.items || []).indexOf(it) + 1), 'aria-hidden': 'true' }),
      l2: it => (it.meta || []).filter(m => !/^step \d+$/.test(m)),
    });
  } else if (kind === 'image' || kind === 'network' || kind === 'volume') {
    o.primary = null;
  }
  return o;
}

function dockerSection(inst, sec, v) {
  if (sec.id === 'fleet') {
    const cpu = (sec.items || []).find(x => x.id === 'fleet:cpu');
    const mem = (sec.items || []).find(x => x.id === 'fleet:memory');
    const ctr = (v.sections || []).find(s => s.id === 'containers') || {};
    const crash = (ctr.items || []).filter(x => x.status && x.status.state === 'failed').map(x => x.name);
    return h('div.pmr-a-summary', { role: 'group', 'aria-label': sec.label },
      h('p', { text: sec.count + ' on this context: ' + String(ctr.count || v.summary).replace(/ · /g, ', ') + '.' }),
      h('p.pmr-a-muted', { text: 'Across them, ' + (cpu ? (cpu.name.toLowerCase() + ' is ' + cpu.meta[0]) : '') + (mem ? ' and ' + mem.name.toLowerCase() + ' is ' + mem.meta[0] : '') + '.' + (crash.length ? ' ' + crash.join(', ') + ' keeps restarting.' : '') }),
      h('div.pmr-a-metrics', (sec.items || []).map(x => (x.metrics || []).map(meter))));
  }
  if (sec.kind === 'chain') {
    return h('div.pmr-a-chain', { role: 'list', 'aria-label': sec.label }, (sec.items || []).map(it => {
      const el = row(inst, it, dockerRowOpts(inst, sec, v));
      el.setAttribute('data-state', it.status ? it.status.state : '');
      if ((it.meta || []).includes('current step')) el.classList.add('is-current-step');
      return el;
    }));
  }
  if (sec.kind === 'facts') return h('div.pmr-a-list', { role: 'list', 'aria-label': sec.label }, (sec.items || []).map(it => factItem(inst, it, { menus: inst.menus })));
  if (sec.id === 'events') return h('div.pmr-a-list.pmr-a-events', { role: 'list', 'aria-label': sec.label }, (sec.items || []).map(it => row(inst, it, dockerRowOpts(inst, sec, v))));
  return null;
}

function renderDocker(panel, view, ctx) {
  return makePanel(panel, view, ctx, {
    identity: dockerIdentity,
    toolbar: (inst, v) => defaultToolbar(inst, v),
    pane: (inst, v) => defaultPane(inst, v, {
      build: (s) => dockerSection(inst, s, v),
      rowOpts: (s, vv) => dockerRowOpts(inst, s, vv),
      secOpts: s => ({ actsAfter: s.kind === 'chain' || s.kind === 'facts' }),
    }),
  });
}
