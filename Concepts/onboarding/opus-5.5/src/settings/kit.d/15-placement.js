/* O55 · placement order and landing.
   - A placement.d rule lists its ids in reading order (the master switch first, the choices it unlocks after it);
     rows used to follow the inventory's order, which put "Use language servers" under "Find this project's languages".
   - A manager's tab strip stays at the top while you scroll it, so a jump to a section inside that manager lands just
     below the strip instead of under it. */
(function o55OrderPlacedRows() {
  if (!PLACEMENT || !Array.isArray(PLACEMENT.overrides)) return;
  for (const rule of PLACEMENT.overrides) {
    if (!rule || !rule._patch || !Array.isArray(rule.ids)) continue;
    const sec = pm51SectionObjects.get(rule.section); if (!sec || !Array.isArray(sec.settings)) continue;
    const at = new Map(rule.ids.map((id, i) => [id, i]));
    sec.settings.sort((x, y) => (at.has(x.id) ? at.get(x.id) : 1e6) - (at.has(y.id) ? at.get(y.id) : 1e6));
  }
})();
const o55Offset = scrollOffsetWithin;
scrollOffsetWithin = function (scroller, el) {
  const base = o55Offset(scroller, el);
  const page = el && el.closest ? el.closest('.pm51-mgr.has-manager-tabs') : null;
  if (!page || (el.matches && el.matches('[data-workspace-block], .manager-section'))) return base;
  const tabs = page.querySelector(':scope > .pm51-tabs');
  return tabs ? base - tabs.offsetHeight - 12 : base;
};
/* Hand-written rows that only repeat canonical rows are not drawn a second time. "Preferred container engine" and
   "Registry accounts" (the Editor page's old Containers section, which the base placement carried into Toolchain)
   repeat Container engine and the registry sign-ins, which now live together on Containers & Execution. */
(function o55DropDuplicateHandSections() {
  const drop = new Set(['toolchain-containers']);
  for (const d of D.domains) for (const w of d.workspaces) if (Array.isArray(w.sections)) w.sections = w.sections.filter(s => !drop.has(s.id));
  drop.forEach(id => pm51SectionObjects.delete(id));
  allSettingsCatalogCache = null; searchIndexDirty = true;
})();
