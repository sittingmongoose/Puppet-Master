/* Film (concept B): drill into the first destination during setup, then film the pop back. --param ms=800 */
export default (p) => ({
  ms: Number(p.ms || 800),
  async setup(pm) { await pm.ev(() => { const e = [...document.querySelectorAll('.pmr-view [data-pmr-nav="drill"]')].find(x => x.getBoundingClientRect().height > 2); if (e) e.click(); }); await pm.wait(900); },
  trigger: `(() => { const b = [...document.querySelectorAll('.pmr-view [data-pmr-nav="back"]')].find(x => x.getBoundingClientRect().height > 2); if (b) b.click(); return !!b; })()`,
});
