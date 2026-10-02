/* Concept B (Stack) — stub registered by the shared core so the host can be tested; the concept builder replaces it. */
PMR.concepts.register('b', {
  label: 'Stack', blurb: 'Drill in',
  render(panel, view) {
    const h = PMR.h;
    view.appendChild(h('div.pmr-stub', h('h2', { text: panel.title + ' · concept B' }),
      PMR.viewsOf(panel).map(v => h('p', h('strong', { text: v.label }), ' ', v.summary || ''))));
    return {};
  },
});
