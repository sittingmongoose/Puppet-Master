/* Concept A (Ledger) — stub registered by the shared core so the host can be tested; the concept builder replaces it. */
PMR.concepts.register('a', {
  label: 'Ledger', blurb: 'Read it in place',
  render(panel, view) {
    const h = PMR.h;
    view.appendChild(h('div.pmr-stub', h('h2', { text: panel.title + ' · concept A' }),
      PMR.viewsOf(panel).map(v => h('p', h('strong', { text: v.label }), ' ', v.summary || ''))));
    return {};
  },
});
