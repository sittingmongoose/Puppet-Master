/* Concept A — register with the host. render() draws one panel; show() runs the head-then-rows entrance once per show. */
PMR.concepts.register('a', {
  label: 'Ledger',
  blurb: 'Read it in place',
  render(panel, view, ctx) {
    const fn = panel.id === 'files' ? renderFiles
      : panel.id === 'source' && typeof renderSource === 'function' ? renderSource
        : panel.id === 'docker' && typeof renderDocker === 'function' ? renderDocker
          : (p, v, c) => makePanel(p, v, c, {});
    const inst = fn(panel, view, ctx);
    return {
      show() { if (inst.show) inst.show(); },
      hide() { PMR.menu.closeAll(); },
      destroy() { if (inst.destroy) inst.destroy(); },
    };
  },
  bar(barEl, ctx) { return typeof ledgerBar === 'function' ? ledgerBar(barEl, ctx) : null; },
});
