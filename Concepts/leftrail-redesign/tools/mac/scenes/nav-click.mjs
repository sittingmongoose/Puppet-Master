/* Film: click the Nth visible [data-pmr-nav="<kind>"] inside the active rail view (or the overlay).
   --param kind=tab|expand|drill|select|menu  --param n=1  --param ms=800  --param extra=0 */
export default (p) => ({
  ms: Number(p.ms || 800), extra: Number(p.extra || 0),
  trigger: `(() => { const vis = [...document.querySelectorAll('.pmr-view [data-pmr-nav="${p.kind || 'tab'}"], #pmr-overlay [data-pmr-nav="${p.kind || 'tab'}"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= innerHeight; }); const e = vis[Math.min(${Number(p.n || 1)}, vis.length - 1)]; if (e) e.click(); return !!e; })()`,
});
