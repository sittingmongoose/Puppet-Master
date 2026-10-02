/* Concept B — registration: one Stack per panel, and the activity bar treatment (40-bar.js). */
PMR.concepts.register('b', {
  label: 'Stack',
  blurb: 'Drill in',
  render(panel, view, ctx) {
    const mod = B.panels[panel.id];
    if (!mod) { view.appendChild(h('div.pmr-missing', { text: 'This panel is not part of the concept round.' })); return {}; }
    const st = new Stack(view, panel, ctx, mod);
    return {
      show() { st.show(); },
      hide() { st.settle(); PMR.menu.closeAll(); },
      destroy() { st.destroy(); },
    };
  },
  bar(barEl, ctx) { return B.barTreatment ? B.barTreatment(barEl, ctx) : null; },
});
