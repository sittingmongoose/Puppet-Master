/* O55 · placement order and landing.
   - A placement.d rule lists its ids in reading order (the master switch first, the choices it unlocks after it);
     rows used to follow the inventory's order, which put "Use language servers" under "Find this project's languages".
   - A manager's tab strip stays at the top while you scroll it, so a jump to a section inside that manager lands just
     below the strip instead of under it.
   - A jump keeps following its target until the page above it has settled: All Project Settings measures its rows
     only as they pass through view, so a jump past it to History & Artifacts landed about 400px low. */
(function o55OrderPlacedRows() {
  if (!PLACEMENT || !Array.isArray(PLACEMENT.overrides)) return;
  for (const rule of PLACEMENT.overrides) {
    if (!rule || !rule._patch || !Array.isArray(rule.ids)) continue;
    const sec = pm51SectionObjects.get(rule.section); if (!sec || !Array.isArray(sec.settings)) continue;
    const at = new Map(rule.ids.map((id, i) => [id, i]));
    sec.settings.sort((x, y) => (at.has(x.id) ? at.get(x.id) : 1e6) - (at.has(y.id) ? at.get(y.id) : 1e6));
  }
  /* A hand-written row moved into a placement section (hand_moves) has no inventory id, so a rule cannot list it.
     The section's `after` places it: {"accent": "general.visual.theme-mode"} puts Accent color right under Light or
     dark; an empty target puts the row first. Entries apply in order, so a row can follow one placed just before. */
  for (const [sid, def] of Object.entries(PLACEMENT.sections || {})) {
    const sec = def && def.after ? pm51SectionObjects.get(sid) : null; if (!sec || !Array.isArray(sec.settings)) continue;
    for (const [id, prev] of Object.entries(def.after)) {
      const i = sec.settings.findIndex(x => x.id === id); if (i < 0) continue;
      const [row] = sec.settings.splice(i, 1);
      const j = prev ? sec.settings.findIndex(x => x.id === prev) : -1;
      sec.settings.splice(!prev ? 0 : j >= 0 ? j + 1 : sec.settings.length, 0, row);
    }
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
/* All Project Settings is a virtual list whose rows get their real heights only as they pass through view, and the
   workspaces after it hydrate on the way; a smooth jump past them aimed at an offset that moved mid-flight. So a jump
   longer than three screens goes straight there (no one can read 100,000px of rows sliding past), and after any jump
   (page index, PM51.go, a section link) the target is followed for up to three seconds: each time the scroll comes to
   rest away from where the target now is, it is set right at once. The follow ends when the target has stayed put, or
   when the reader scrolls, types or clicks, or a scroll heads elsewhere (PM51.stopLanding: a search hit being
   centred). */
let o55Landing = null;
PM51.stopLanding = () => { if (o55Landing) o55Landing.stop(); };
const o55LandAt = (scroller, el) => Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, Math.round(scrollOffsetWithin(scroller, el) - 26)));
const o55Far = el => { const sc = root.querySelector('#settings-document'); return !!(sc && el && Math.abs(o55LandAt(sc, el) - sc.scrollTop) > sc.clientHeight * 3); };
function o55Land(el) {
  PM51.stopLanding();
  const scroller = root.querySelector('#settings-document'); if (!scroller || !el) return;
  const quit = ['wheel', 'touchstart', 'pointerdown', 'keydown'], t0 = performance.now();
  let last = scroller.scrollTop, still = 0, rested = false, raf = 0;
  const job = { stop: () => { cancelAnimationFrame(raf); quit.forEach(n => root.removeEventListener(n, job.stop, true)); if (o55Landing === job) o55Landing = null; } };
  quit.forEach(n => root.addEventListener(n, job.stop, { capture: true, passive: true }));
  const step = () => {
    if (!el.isConnected || !scroller.isConnected) return job.stop();
    const top = scroller.scrollTop, aim = o55LandAt(scroller, el), moved = Math.abs(top - last) >= 1;
    last = top; still = moved ? 0 : still + 1;
    /* once at rest, a move that leaves the target behind is someone else's scroll */
    if (moved && rested && Math.abs(top - aim) > 1) return job.stop();
    if (still >= 2) {
      rested = true;
      if (Math.abs(top - aim) > 1) { scroller.scrollTo({ top: aim, behavior: 'instant' }); last = scroller.scrollTop; still = 0; }
    }
    suppressScrollSpyUntil = Math.max(suppressScrollSpyUntil, performance.now() + 160);
    if (performance.now() - t0 > 3000 || (still >= 12 && Math.abs(scroller.scrollTop - aim) <= 1)) return job.stop();
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  o55Landing = job;
}
const o55JumpLand = jumpToWorkspace;
jumpToWorkspace = function (wsId, behavior) {
  const block = () => root.querySelector(`[data-workspace-block="${cssEscape(wsId)}"]`);
  const r = o55JumpLand.call(this, wsId, behavior || (o55Far(block()) ? 'auto' : behavior));
  o55Land(block());
  return r;
};
const o55SectionLand = scrollToSection;
scrollToSection = function (sectionId, smooth = true) {
  const scroller = root.querySelector('#settings-document');
  const find = () => root.querySelector(`#section-${cssEscape(sectionId)}`) || (scroller && scroller.querySelector(`[data-section-id="${cssEscape(sectionId)}"]`));
  const r = o55SectionLand.call(this, sectionId, smooth && !o55Far(find()));
  o55Land(find());
  return r;
};
/* Hand-written rows that only repeat canonical rows are not drawn a second time. "Preferred container engine" and
   "Registry accounts" (the Editor page's old Containers section, which the base placement carried into Toolchain)
   repeat Container engine and the registry sign-ins, which now live together on Containers. Single hand rows named in
   placement `hand_drops` repeat an inventory row with other options or defaults, e.g. on Advanced "Diagnostic
   telemetry" (crash reports on) against "Share anonymous usage and crash reports" (off), and on App & Input
   "Interface font size" against "Text size", which were stored apart. A hand section left with no rows (its rows moved
   into placement groups or dropped) is removed, so no page draws a heading with nothing under it. */
(function o55DropDuplicateHandSections() {
  const drop = new Set(['toolchain-containers']);
  for (const d of D.domains) for (const w of d.workspaces) if (Array.isArray(w.sections)) w.sections = w.sections.filter(s => !drop.has(s.id));
  drop.forEach(id => pm51SectionObjects.delete(id));
  const dropRows = {};
  for (const [ws, ids] of Object.entries(PLACEMENT.hand_drops || {})) dropRows[ws] = new Set(ids);
  for (const d of D.domains) for (const w of d.workspaces) {
    if (!Array.isArray(w.sections)) continue;
    if (dropRows[w.id]) w.sections.forEach(s => { s.settings = (s.settings || []).filter(x => !dropRows[w.id].has(x.id)); });
    const page = PLACEMENT.pages[w.id];
    if (page && page.hand) w.sections = w.sections.filter(s => s.placement || (s.settings || []).length);
  }
  /* The hand-drawn "Interface density" offered Compact / Comfortable / Relaxed with Comfortable as the default; the
     inventory row it draws is Auto / Comfortable / Compact with Auto. "Relaxed" was never a stored value. */
  const rows = Object.values((window.PM12_REFERENCE || {}).byCat || {}).flatMap(c => c.settings || []);
  for (const id of ['general.visual.interface-density']) {
    const e = pm51ById[id], ref = rows.find(r => r.id === id);
    if (!e || !e.setting || !ref || !Array.isArray(ref.options)) continue;
    e.setting.options = ref.options.slice(); e.setting.value = ref.default; e.setting.control = 'select';
    if (ref.desc) e.setting.description = ref.desc;
  }
  allSettingsCatalogCache = null; searchIndexDirty = true;
})();
