/* src/logo/pm-pip-parts.js: the Pip parts registry, window.PM_PIP_PARTS (SSYS-056, S1-S9). OWNER: pm7-found (PM7 build,
 * 2026-10-29).
 *
 * The one option, default and preset table for Pip's parts (Plans/pip_parts.json mirrors it). Parts change Pip in the
 * chat and in onboarding only (S9): the brand mark, app icon, tray, loader and notification faces always use the kit,
 * and the agent puppet, helper marks and Activity agent rows stay Pip under every preset, Plain included. Where a NieR
 * part and a Pip part both draw, the NieR part wins (S7). There is no Pip on/off row (S6).
 *
 * Storage (S2): general.visual.pip-parts, per Project, a multiselect of the part ids (Plans/settings_inventory.json
 * lists the ids as its options: they stay stable when a label's copy changes; a stored label still reads). The Settings engine is private to its script, so the registry reads and writes it
 * through window.PM_PIP_PARTS_STORE (Concepts/onboarding/opus-5.5/src/settings/kit.d/28-pip-parts.js: the same
 * transaction and refusal path as a Settings row). Until the Settings data has that row, and in a sandboxed preview,
 * the choice lives in memory for the session, per Project. A Project switch re-reads the row and says so if the parts
 * changed.
 *
 * API
 *   PARTS                -> [{ id, label, group, def, size, help }] in canonical order (25); GROUPS;
 *                           PRESETS { full, quiet, still, plain } (ids); PRESET_INFO [{ id, label, help }]
 *   get(id)              -> true when that part is on (the preview first, then the Project's choice); unknown id -> false
 *   all()                -> { id: bool } for every part;  ids() -> the ids that are on, in PARTS order
 *   count()              -> { on, total } (the editor's "On N / 25" meter; its words are copy)
 *   preset()             -> 'full' | 'quiet' | 'still' | 'plain' when the parts match one exactly, else null ("Custom")
 *   set(ids)             -> stores exactly these parts for the current Project; returns true when stored
 *   toggle(id, on?)      -> one part; applyPreset(name) -> one of PRESETS
 *   preview(ids | null)  -> a non-persistent choice painted over the stored one (onboarding before its Project is saved,
 *                           the editor's live preview); null clears it; previewing() -> ids or null;
 *                           commitPreview() -> stores the preview for the current Project and clears it
 *   on('change', cb)     -> off; cb({ ids, reason: 'set' | 'preview' | 'project' | 'settings' }); also the window event
 *                           'pm7.pip-parts.changed' { detail: { ids, reason } }
 *   SETTING              -> 'general.visual.pip-parts' */
(function () {
  'use strict';
  const W = window, D = document;
  if (W.PM_PIP_PARTS) return;

  const SETTING = 'general.visual.pip-parts';
  /* [id, label (the stored option), group, default, size, help]. Labels and defaults are Plans/pip_parts.json's. Size is
     how much a part adds, as in NieR Mode's Plug-in Chips; help is its one line. Both come from the approved chat
     concept's registry (chat-assistant-concepts/opus-5.5-pip/pip-chat.js PARTS) where a part was there, and are new for
     idle-life, setup-world-life, setup-voice and setup-music. */
  const PARTS = Object.freeze([
    ['sheet-hosts', 'Sheet hosts', 'Where Pip appears', true, 5, 'Each sheet has a Pip by its close button, holding up that sheet\u2019s sign.'],
    ['status-faces', 'Status faces in lists', 'Where Pip appears', true, 3, 'In Scheduled and Memory, each row\u2019s status icon is Pip\u2019s face: sent is happy, failed says oops, waiting sleeps.'],
    ['working-orbit', 'Working orbit', 'Where Pip appears', true, 3, 'Pip sits in the middle of the Orbit while work runs.'],
    ['plans', 'Plans', 'Where Pip appears', true, 3, 'Pip holds up a plan that is ready for review, and naps beside a build that waits for its window.'],
    ['wand-menu', 'Wand menu', 'Where Pip appears', true, 2, 'Pip holds the wand at the top of Assistant capabilities.'],
    ['empty-lists', 'Empty lists', 'Where Pip appears', true, 2, 'A resting Pip where there is nothing yet.'],
    ['state-faces', 'State faces', 'Faces', true, 4, 'Working shows thinking dots, done is happy, needs you wonders, failed says oops, waiting sleeps.'],
    ['watches', 'Watches', 'Faces', true, 3, 'Rest the pointer on a control and the sheet\u2019s Pip watches it.'],
    ['wonders-while-typing', 'Wonders while typing', 'Faces', true, 2, 'Big eyes while you write in a sheet\u2019s fields.'],
    ['cheers', 'Cheers', 'Faces', true, 2, 'Happy, and a hop, when you press a sheet\u2019s main button.'],
    ['oops', 'Oops', 'Faces', true, 2, 'A worried face when a button can\u2019t be used yet.'],
    ['gaze', 'Gaze', 'Faces', true, 2, 'Pip looks where the pointer is, and keeps looking there when it stops.'],
    ['blinks', 'Blinks', 'Motion', true, 1, 'Now and then, never two Pips at once.'],
    ['sway-and-physics', 'Sway and physics', 'Motion', true, 2, 'Pip swings a little on its strings, as if a hand held it, and drops in when a sheet opens.'],
    ['face-transitions', 'Blinks between faces', 'Motion', true, 2, 'A face changes behind a quick blink.'],
    ['thinking-dots', 'Thinking dots', 'Motion', true, 1, 'The working face\u2019s three dots bob in turn.'],
    ['idle-life', 'Idle life', 'Motion', true, 2, 'Left alone, Pip looks around, stretches and, after a while, naps.'],
    ['seat-colours', 'Seat colours', 'Look', true, 2, 'Each helper wears its seat\u2019s colour. Off: every Pip is the theme\u2019s Pip.'],
    ['role-props', 'Role props', 'Look', true, 3, 'Crown, hard hat, glasses, gavel, jester cap, page, pennant and the rest.'],
    ['strings', 'Strings', 'Look', true, 2, 'Off: Pip floats without its strings.'],
    ['cheeks-and-shine', 'Cheeks and shine', 'Look', true, 1, 'Friendly and Glass only.'],
    ['setup-world-life', 'Setup world life', 'Look', true, 3, 'In setup, the world behind Pip moves in each theme\u2019s own way.'],
    ['setup-voice', 'Pip talks in setup', 'Sound', true, 3, 'Pip says its lines in setup, in the theme\u2019s voice.'],
    ['app-voice', 'Pip chirps in the app', 'Sound', false, 3, 'A small chirp with each face a sheet\u2019s Pip makes, in the theme\u2019s voice. Starts off.'],
    ['setup-music', 'Setup music', 'Sound', true, 3, 'Each theme\u2019s own music plays quietly through setup.']
  ].map(([id, label, group, def, size, help]) => Object.freeze({ id, label, group, def, size, help })));
  const IDS = PARTS.map((p) => p.id);
  const GROUPS = Object.freeze([...new Set(PARTS.map((p) => p.group))]);
  const byLabel = new Map(PARTS.map((p) => [p.label, p.id]));
  const byId = new Map(PARTS.map((p) => [p.id, p]));
  const DEFAULT = Object.freeze(PARTS.filter((p) => p.def).map((p) => p.id));
  /* Full = every part but the app's chirps; Quiet = work-only extras, no reactions; Still = no motion or world life;
     Plain = no extras (the mandatory agent Pip stays) */
  // the presets as the editor shows them (labels and lines are the editor's copy, drafted from the chat concept)
  const PRESET_INFO = Object.freeze([
    Object.freeze({ id: 'full', label: 'Full', help: 'Everything but chirps in the app' }),
    Object.freeze({ id: 'quiet', label: 'Quiet', help: 'Pip where work is; no reactions' }),
    Object.freeze({ id: 'still', label: 'Still', help: 'Nothing moves' }),
    Object.freeze({ id: 'plain', label: 'Plain', help: 'No extras; agents are still Pips' })
  ]);
  const PRESETS = Object.freeze({
    full: DEFAULT,
    quiet: Object.freeze(['status-faces', 'working-orbit', 'plans', 'empty-lists', 'state-faces', 'seat-colours', 'role-props', 'strings']),
    still: Object.freeze(IDS.filter((id) => byId.get(id).group !== 'Motion' && id !== 'setup-world-life' && id !== 'app-voice')),
    plain: Object.freeze([])
  });

  const order = (ids) => { const want = new Set((Array.isArray(ids) ? ids : []).map(String)); return IDS.filter((id) => want.has(id)); };
  const labels = (ids) => order(ids).map((id) => byId.get(id).label);

  /* ------------------------------------------------------------ the store */
  // The Settings adapter (src/settings/kit.d/28-pip-parts.js) loads with the body's Settings script; read it late.
  const store = () => { const S = W.PM_PIP_PARTS_STORE; try { return S && S.ready() ? S : null; } catch (_) { return null; } };
  function projectId() { try { const p = W.PM7_SETTINGS_TOME && W.PM7_SETTINGS_TOME.project(); return p && p.id ? String(p.id) : ''; } catch (_) { return ''; } }
  const memory = Object.create(null);      // per Project, for the session, while Settings has no row (or no storage)
  let pv = null;                           // the preview
  function stored() {
    const S = store();
    if (S) {
      const v = S.read();
      return Array.isArray(v) ? order(v.map((l) => byLabel.get(l) || (byId.has(l) ? l : null)).filter(Boolean)) : DEFAULT.slice();
    }
    const m = memory[projectId()];
    return m ? m.slice() : DEFAULT.slice();
  }
  const current = () => (pv ? pv.slice() : stored());
  function write(ids) {
    const list = order(ids), S = store();
    if (S) return S.write(list);
    memory[projectId()] = list;
    return true;
  }

  /* ----------------------------------------------------------- the events */
  const subs = new Set();
  let lastSig = null, bound = false;
  function emit(reason) {
    const ids = current(), sig = ids.join(' ');
    if (sig === lastSig && reason !== 'set') return;
    lastSig = sig;
    subs.forEach((fn) => { try { fn({ ids: ids.slice(), reason }); } catch (e) { console.error(e); } });
    try { W.dispatchEvent(new CustomEvent('pm7.pip-parts.changed', { detail: { ids, reason } })); } catch (_) { /* old engines */ }
  }
  const on = (type, fn) => { if (type !== 'change' || typeof fn !== 'function') return () => {}; subs.add(fn); return () => subs.delete(fn); };
  /* The adapter says when the Project or the row changed (after a save and after a render); nothing polls. */
  function bind() {
    if (bound || !W.PM_PIP_PARTS_STORE) return;
    bound = true;
    W.PM_PIP_PARTS_STORE.onChange(() => emit(projectId() === lastProject ? 'settings' : 'project'));
    emit('settings');
  }
  let lastProject = '';
  subs.add(() => { lastProject = projectId(); });
  function boot() { lastSig = current().join(' '); lastProject = projectId(); bind(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  W.addEventListener('load', bind, { once: true });

  /* --------------------------------------------------------------- the API */
  function presetOf(ids) {
    const sig = order(ids).join(' ');
    return Object.keys(PRESETS).find((k) => PRESETS[k].join(' ') === sig) || null;
  }
  W.PM_PIP_PARTS = Object.freeze({
    version: 1, SETTING, PARTS, GROUPS, PRESETS, PRESET_INFO, DEFAULT,
    get: (id) => current().indexOf(String(id)) >= 0,
    all: () => { const on = new Set(current()); return IDS.reduce((o, id) => { o[id] = on.has(id); return o; }, {}); },
    ids: () => current(),
    count: () => ({ on: current().length, total: IDS.length }),
    preset: () => presetOf(current()),
    label: (id) => (byId.get(id) || {}).label || null,
    set(ids) { const ok = write(ids); if (ok) emit('set'); return ok; },
    toggle(id, want) {
      if (!byId.has(id)) return false;
      const now = stored(), has = now.indexOf(id) >= 0, next = want == null ? !has : !!want;
      if (next === has) return true;
      return this.set(next ? now.concat(id) : now.filter((x) => x !== id));
    },
    applyPreset(name) { const p = PRESETS[String(name || '').toLowerCase()]; return p ? this.set(p) : false; },
    preview(ids) { pv = ids == null ? null : order(ids); emit('preview'); return current(); },
    previewing: () => (pv ? pv.slice() : null),
    commitPreview() { if (!pv) return true; const ids = pv; pv = null; const ok = write(ids); if (!ok) pv = ids; emit('set'); return ok; },
    on, subscribe: (fn) => on('change', fn)
  });
})();
