/* O55 · value fixes that have to run before anything draws.
   Switches whose inventory default is a word were turned into booleans with Boolean(word), so every "off" switch
   started ON — 14 of them, including Allow Dangerous Commands (Override), Approve & Keep Going and the three
   "Pause at each …" gates; "Project & Lane Overrides" (inherit = off) started ON too. The word decides: on, show,
   enabled, enforced, override and yes are on; off, hide, disabled, inherit and no are off. Only values the person has
   not changed are corrected, so a saved choice is never overwritten. */
(function o55FixSwitchDefaults() {
  const ON = new Set(['on', 'show', 'enabled', 'enforced', 'override', 'yes', 'true']);
  const OFF = new Set(['off', 'hide', 'disabled', 'inherit', 'no', 'false', 'none']);
  const ref = window.PM12_REFERENCE; if (!ref || !ref.byCat) return;
  let fixed = 0;
  for (const cat of Object.values(ref.byCat)) for (const row of cat.settings || []) {
    if (row.type !== 'toggle' || typeof row.default !== 'string') continue;
    const word = row.default.trim().toLowerCase();
    if (!ON.has(word) && !OFF.has(word)) continue;
    const want = ON.has(word);
    const f = findSettingGlobal(row.id);
    if (f && f.setting && f.setting.value !== want) f.setting.value = want;
    const e = PM51.placement && PM51.placement.byId[row.id];
    if (e && e.setting && e.setting.value !== want) e.setting.value = want;
    if (state.settings && !(state.changed || {})[row.id] && state.settings[row.id] !== want) { state.settings[row.id] = want; fixed++; }
  }
  if (fixed) try { saveState(); } catch (e) { /* the next save writes it */ }
})();
/* An empty stored value that really means one of the row's own choices (rows.d `emptyMeans`) starts as that choice, so
   the row reads what applies instead of "Not set": "Open container web pages in" is empty until someone picks, and
   until then the system's default browser opens them. Only values the person has not changed are corrected. */
(function o55FixEmptyMeans() {
  const rows = (typeof O55S === 'object' && O55S && O55S.rows && O55S.rows.rows) || {};
  for (const [id, row] of Object.entries(rows)) {
    if (!row || row.emptyMeans == null) continue;
    const want = row.emptyMeans, empty = v => v == null || v === '';
    const f = findSettingGlobal(id);
    if (f && f.setting && empty(f.setting.value)) f.setting.value = want;
    const e = PM51.placement && PM51.placement.byId[id];
    if (e && e.setting && empty(e.setting.value)) e.setting.value = want;
    if (state.settings && !(state.changed || {})[id] && empty(state.settings[id])) state.settings[id] = want;
  }
})();
