/* Concept B — Docker. The summary page names where Docker runs (Execution Host, Execution Environment, Source Location
   and the readiness word) and lists all ten areas as destinations, the two that need you on top; Kubernetes stays a
   quiet "hidden" row with its Show action. Under them, the recent events. */

B.panels.docker = (function () {
  const views = (st) => () => st.panel.views;

  function eventRow(st, it) {
    return row({ key: 'docker:' + it.id, lead: PMR.glyph(it.status.state), name: it.name, metaEl: metaWith(null, [it.status.word].concat(asList(it.meta))), cls: 'is-event' });
  }
  function cfg(st) {
    return {
      sections: {
        fleet: sec => section({
          key: 'docker:fleet', label: sec.label, count: sec.count, collapsible: true, open: false, actions: sec.actions, menus: st.menus,
          body: () => [h('div.pmr-b-meters', sec.items.map(it => meterEl(it.metrics[0])))],
        }),
        events: sec => section({
          key: 'docker:events', label: sec.label, count: sec.count, collapsible: true, open: false,
          body: () => sec.items.map(it => eventRow(st, it)),
        }),
      },
      rows: {
        containers: { noun: 'container', meta: x => asList(x.meta).filter(m => m !== (x.status && x.status.word)), metaLabel: 'State' },
        images: { noun: 'image', metaLabel: 'Size and use' },
        services: { noun: 'service', metaLabel: 'Image' },
        scenarios: { noun: 'scenario', metaLabel: 'Ports' },
        registries: { noun: 'registry' },
        chain: { noun: 'step', metaLabel: 'Step' },
        networks: { noun: 'network' }, volumes: { noun: 'volume' }, contexts: { noun: 'context' },
        build: { noun: 'build setting' },
      },
    };
  }
  function areaFor(st, v) { return areaDesc(st, v, views(st), cfg(st)); }

  function rootDesc(st) {
    const panel = st.panel;
    return {
      key: 'docker:root', kind: 'root', title: panel.title,
      actions: () => panel.actions.map(a => iconAct(a, st.menus)),
      build: () => {
        const l0 = panel.context.lines[0], l1 = panel.context.lines[1];
        const trig = PMR.menu.trigger(panel.menus.context, { icon: 'docker', hover: l0.hover });
        trig.setAttribute('data-pmr-nav', 'menu');
        const facts = panel.context.facts;
        const top3 = facts.filter(f => /^(Execution Host|Execution Environment|Source Location)$/.test(f[0]));
        const more = facts.filter(f => !top3.includes(f));
        const ident = h('div.pmr-b-block.pmr-b-ident', { 'data-canon': l0.canon || null },
          h('div.pmr-b-ident-line', trig, h('span.pmr-b-grow'), h('span.pmr-b-readiness', { 'data-canon': l1.canon || null, text: l1.text.replace(/^Ready · /, '') })),
          h('div.pmr-b-facts.is-ident', top3.map(factEl)),
          disclosure('Readiness and context', factList(more, { key: 'docker-where' }), { navId: 'docker-where' }));
        const vs = panel.views;
        const dest = v => {
          if (v.conditional && !v.conditional.shown) {
            const d = destRow({ key: 'docker:' + v.id, icon: v.icon, label: v.label, summary: 'Hidden, no manifests found', quiet: true, canon: v.canon, drill: () => areaFor(st, v) });
            return h('div.pmr-b-destrow', d, textAct(Object.assign({}, v.conditional.action, { label: 'Show' }), st.menus));
          }
          return destRow({ key: 'docker:' + v.id, icon: v.icon, label: v.label, summary: v.summary, attention: v.attention, count: v.count, canon: v.canon, drill: () => areaFor(st, v) });
        };
        const att = vs.filter(v => v.attention), rest = vs.filter(v => !v.attention);
        const out = [ident];
        if (att.length) out.push(h('div.pmr-b-group.is-needs', h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Needs you' })), h('div.pmr-b-dests', att.map(dest))),
          h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Everything else' })));
        out.push(h('div.pmr-b-dests', rest.map(dest)));
        const ev = vs[0].sections.find(s => s.id === 'events');
        if (ev) out.push(h('div.pmr-b-glance', h('div.pmr-b-group-head', h('span.pmr-b-sec-title.pmr-head', { text: 'Recent' }), h('span.pmr-b-sec-count.pmr-num', { text: String(ev.count) })), ev.items.map(it => eventRow(st, it))));
        return out;
      },
    };
  }

  return {
    state(st) { return st.panel.context.state ? PMR.statusEl(st.panel.context.state, { cls: 'pmr-b-pstate' }) : null; },
    root: rootDesc,
  };
})();
