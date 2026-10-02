/* Concept C (Lens) — stub registered by the shared core so the host can be tested; the concept builder replaces it. */
PMR.concepts.register('c', {
  label: 'Lens', blurb: 'Detail beside the rail',
  render(panel, view) {
    const h = PMR.h;
    view.appendChild(h('div.pmr-stub', h('h2', { text: panel.title + ' · concept C' }),
      PMR.viewsOf(panel).map(v => h('p', h('strong', { text: v.label }), ' ', v.summary || ''))));
    return {};
  },
});
