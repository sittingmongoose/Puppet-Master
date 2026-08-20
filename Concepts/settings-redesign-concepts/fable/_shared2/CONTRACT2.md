# fable Seven New Concepts — Shared-v2 Contract (CONTRACT2)

Binding API and conventions for concepts **05–11** (bakeoff packet 2026-08-18). This is an
**additive** layer: nothing in `_shared/` is edited, and concepts 01–04 never load `_shared2/`.
`CONTRACT.md` revision 2 still governs the frozen originals; its ground rules (below) bind here too.

**Differentiation clause (binding, from the packet):** `_shared2/` exports **no HTML and no CSS**
for any Settings surface. It returns plain data, semantics, and state. Each concept 05–11 composes
its own Home, navigation, workspace, manager surfaces, search dropdown, exact-result reveal,
narrow-width behavior, and motion. No concept may reference another concept's page, markup, CSS
class, or renderer. CSS class prefixes: `c05-` `c06-` `c07-` `c08-` `c09-` `c10-` `c11-` — never
cross files. The only shared visible chrome is the quiet PM shell (`_shared/pm-shell.*`), the icon
set, and the floating States drawer (a test affordance, not Settings UI).

## Ground rules (non-negotiable, cumulative packet)

- Work ONLY inside `Concepts/settings-redesign-concepts/fable/`. Never edit `_shared/*`, `c1–c4`
  files, or their register folders.
- No emoji anywhere; inline SVG via `PMIcons`. No colored left-edge accent bars. No primary nav
  shaped like tiny pills. No raw internal enums/IDs in ordinary prose (intentionally technical
  detail drawers may show them). No hover-only critical meaning. No fake no-op actions — anything
  that cannot truly run returns an honest simulated receipt.
- **Project-only:** every editable setting applies to the current Project ("Puppet Master").
  Never render Global/Project/Goal/Host scope selectors, inheritance, linked projects, profiles,
  or sync. Resource location (accounts, installations, servers) is context, not a scope system.
  Managed/effective state is allowed where an external policy genuinely controls the result — put
  origin in Details.
- Provider CLIs: never bundled/pre-seeded/silently installed. Explicit user-triggered Install/Set
  Up from the official source for the exact selected Host/Environment; authentication separate;
  runtime demand deep-links to the exact setup row and preserves the originating operation.
- Home: search first; at most ONE critical banner; compact attention list (2–4 items); major
  destinations dominant; recent/history/All Settings/Copy are secondary utilities. No CTA wall,
  no horizontal shelves.
- Rows: title + one concise explanation + control + only the status needed. Advanced evidence
  behind Details/"Why this value?"/diagnostic drawers. Groups of ~4–8 before a new heading.
- All 8 themes (`friendly|glass|retro|basic` × `dark|light`), reduced motion (3 kill switches in
  pm-shell.css), widths 760–2500. Shell rail must never overlay content at narrow widths; use push
  navigation. PM popup-menu conventions (collision handling, layering, Esc) and the PM custom
  scrollbar on scrollable surfaces.
- Slint 1.17.1 portability: stable model IDs, virtualized lists (>40 rows windowed or paged),
  explicit state machines for routes/menus/drawers, no DOM-geometry-derived semantics, bounded
  blur/shadow, reusable components (no monolithic renderer).
- Lazy hydration: Home loads destination summaries + search index only. A manager's view model is
  computed on first entry; inactive managers drop subscriptions. No startup probe storms. Search
  never instantiates manager UI. Latest-request-wins for search/previews; cached values stay
  visible while refreshing; caches and result sets bounded.
- localStorage ONLY under `pm.settingsConcepts.fable.<conceptId>.*`.

## Files and load order (every concept page)

```html
<script src="_shared/pm-icons.js"></script>
<script src="_shared/pm-demo-data.js"></script>
<script src="_shared/pm-demo-data-ext.js"></script>
<script src="_shared/pm-provider.js"></script>
<script src="_shared2/pm2-inventory.js"></script>
<script src="_shared2/pm2-store.js"></script>
<script src="_shared2/pm2-managers.js"></script>
<script src="_shared2/pm2-managers2.js"></script>
<script src="_shared2/pm2-search.js"></script>
<script src="_shared2/pm2-copy.js"></script>
<script src="_shared2/pm2-states.js"></script>
<script src="_shared2/pm2-route.js"></script>
<script src="_shared/pm-scrollspy.js"></script>
<script src="_shared/pm-spell.js"></script>
<script src="_shared/pm-shell.js"></script>
<script src="concept-NN-<stem>.js"></script>
```

Page skeleton, `<head>`, fonts, and the static shell markup are exactly CONTRACT.md's (titlebar,
rail, `.pm-stage`, Assistant, statusbar), with `data-concept-model="fable"` literal and title
`fable · NN <Name> — Puppet Master Settings`. Concept content renders inside `.pm-stage`.
Boot order: `PMShell.init` → `PM2.store.init(conceptId)` → build UI → `PM2.route.bind({open})`.

All `_shared2` modules attach to `window.PM2` and are plain ES5-compatible IIFEs (match `_shared`
style; no modules, no deps). Demo "now" stays **2026-08-05**.

## `pm2-inventory.js` — `window.PM2_INVENTORY` (generated; do not hand-edit)

`{schema, settingsCount:828, categories:[12 × {id,title,icon,desc,subgroups:[3 × {id,title,desc}]}],`
`settings:[828 × {id,cat,sub,label,desc,type,tier,search[],legacyScope[],options?,default?,recommended?,badges?,curated?,related_features?}]}`

Types: `select toggle slider number action radio list multiselect keyvalue text path`.
`legacyScope` is candidate-impact metadata ONLY — never rendered as a scope control. The 12
categories are the canonical browse domains. Setting id = `<cat>.<sub>.<slug>`.

## `pm2-store.js` — `PM2.store`

- `PM2.store.init(conceptId)` → `store` singleton per page:
  `{conceptId, data, values, get(k), set(k,v), on(evt,fn), off, emit(evt,p)}`.
  `data` = deep-cloned object world (`PM_DATA` + ext collections, untouched originals) plus
  `data.project = {id:'proj.puppet-master', name:'Puppet Master', role:'Project Admin'}`.
  `values` = current-Project value map over inventory ids (default-seeded, plus a curated set of
  realistic divergences `changedFromDefault:true`, at least 25, spread over ≥8 categories).
- `store.getValue(id)` / `store.setValue(id, v, {source})` → validates by type/options, records
  `{changedAt, by:'You'}`, emits `value` + receipt via `PM2.states.receipt`. Number/text
  validation failures return `{ok:false, error}` (used by the validation-error fixture).
- `store.resolveRow(id)` → THE row view model every concept renders from (markup per concept):
  `{id, label, desc, control:{type,options?,min?,max?}, value, valueLabel, changedFromDefault,
    recommended?, badges[], chips:[{kind,label}], state:'normal'|'managed'|'unavailable'|
    'restart-required'|'reconnect-required'|'changed-elsewhere'|'error', stateNote?, tier,
    detail:{legacyScopeNote, related[], searchTerms[]}}` — chips use pm-shell's
  `.pm-chip-value[data-kind]` vocabulary; `state` reflects active scenario/fixtures.
- `store.rowsFor(cat, sub?)` → ordered inventory rows for a domain/subgroup (curated first,
  then simple tier, then advanced; stable order). `store.counts()` → per-category totals +
  attention/changed counts for Home summaries (computed once, cached).
- `store.recents()` → recent-change feed (seeded ≥6 realistic entries + live setValue appends).
- `store.attention()` → 2–4 unresolved items in baseline
  (`{id, statusWord, headline, consequence, dest}`), more under `attention-heavy`.

## `pm2-managers.js` + `pm2-managers2.js` — `PM2.managers`

Registry of every manager family. Both files call `PM2.managers.register([defs])`;
`pm2-managers.js` also defines the registry object + shared helpers (`PM2.managers.get(id)`,
`.all()`, `.byCat(cat)`, `.demonstrated()`, `.deferred()`).

Manager def:
```js
{ id:'m.providers', family:'Provider / Account / Model / Installation',   // EXACT packet name
  cat:'ai', title:'AI Providers', blurb, icon,
  archetype:'preference-doc'|'roster-detail'|'catalog'|'setup-sequence'|'health'|'diagnostic'|'transaction',
  status:'demonstrated'|'deferred_named_owner',
  owner?, insertionContract?,                    // deferred only: canonical owner + return/deep-link contract
  settingPrefixes:['ai.'],                       // inventory rows this manager surfaces as related
  model(store) -> viewModel,                     // lazy; cached until store emits invalidating event
  objects(store) -> [{id, label, kind, note?, dest}],   // searchable managed objects
  actions(store) -> [{id, label, ico?, available, reason?, run(store)}],  // run → op/receipt
  states:['fx.…'],                               // fixtures this manager visibly reacts to
}
```
View models are plain data trees a concept can render in its own layout: named `sections[]`, each
with `kind` (`overview|roster|form|table|steps|log|health|preview`), `rows`/`items`/`fields`, and
per-item `dest` route objects. Provider view model answers the human questions first (connected
state, account in use, models, usage-end behavior, routing/fallback, setup/repair) with
credentials/installations/catalogs/limits/logs as subpage sections — reuse `PMProvider.*`
resolvers for all provider state strings. No fabricated backends for deferred owners.

**File split (ownership):**
`pm2-managers.js`: registry + helpers + `m.providers m.context m.memory m.personas m.goal m.crew
m.permissions m.bsd m.notifications m.sounds m.appearance m.spellcheck m.desktop m.teacher m.doctor`.
`pm2-managers2.js`: `m.files m.terminal m.lsp m.formatters m.commands m.mcp m.skills m.plugins
m.tools m.testing m.storage m.backup m.lifecycle m.history m.artifacts m.sourceControl m.actions
m.containers m.web m.searchIndex m.cleanup m.media m.dry` + the nine deferred owner shells
`m.onboarding m.deployment m.serverClaim m.servers m.hosting m.remote m.projectSync m.appUpdates
m.serverBackup`.

**Family → id map (coverage evidence uses the exact left-hand names):**
Settings Home/`home` route, Settings Search/`search surface`, Settings Workspace/`workspace
routes`, Ordinary setting grammar/`store.resolveRow` rendering — these four are demonstrated by
the concept surfaces themselves (coverage entries point at routes, not manager pages). All other
families map 1:1 to the `m.*` ids above; `Sound Library / Uploads / Packs`→`m.sounds`,
`Appearance / themes / fonts / motion`→`m.appearance`, `Settings Lifecycle`→`m.lifecycle`,
`Runtime Artifacts / Project Outputs`→`m.artifacts`, `Source Control / Worktrees`→`m.sourceControl`,
`GitHub Actions`→`m.actions`, `Web / Search / Fetch / Crawl`→`m.web`, `Project Search
Index`→`m.searchIndex`, `Workspace Cleanup`→`m.cleanup`, `Media & Output`→`m.media`,
`DRY Method visible state where exposed`→`m.dry` (read-only projection of shared-owner state).

**Manager → domain map (canonical `cat`):** general: appearance, desktop, notifications, sounds,
spellcheck, teacher · ai: providers · safety: permissions, bsd · code: terminal, files, lsp,
formatters, containers · memory: context, memory · planning: goal, dry · branching: sourceControl,
actions, crew · media: media · web: web, searchIndex · personas: personas · extensions: skills,
plugins, commands, tools · system: doctor, mcp, testing, storage, backup, lifecycle, history,
artifacts, cleanup + all nine deferred shells. Concepts may group navigation differently, but
search paths, breadcrumbs, and evidence use this canonical map.

## `pm2-search.js` — `PM2.search`

- `PM2.search.query(q, {limit=50})` → `{query, total, groups:[{kind, label, results:[…]}]}`.
  Index built lazily on first query from inventory + manager registry + `objects(store)` +
  action/workflow/diagnostic/help sources — WITHOUT instantiating any manager UI. Latest-request-
  wins; results bounded; tokenized fuzzy match with the `_shared` ladder (label > search terms >
  category > desc), typo tolerance (edit distance 1 on tokens ≥5 chars).
- Result: `{rid, kind, label, sub?, path:[…], dest, availability?}` where `rid` is immutable:
  `s:<settingId>` · `m:<managerId>` · `o:<managerId>/<objectId>` · `a:<actionId>` ·
  `w:<workflowId>` · `d:<diagId>` · `u:<capabilityId>` · `h:<helpTopicId>`.
  `path` is the human breadcrumb (`['Settings','AI Brains & Providers','Providers','OpenAI…']`).
  **Routing is by `rid`/`dest` only — never by array position or label.**
- `dest`: `{route:'home'|'dest'|'manager'|'setting'|'copy'|'all', cat?, sub?, managerId?,
  objectId?, tab?, sectionId?, settingId?, reason?}`.
- Required corpus cases (the harness depends on these): duplicate labels ("API Key" objects for
  ≥3 providers; "Rate Limits" pages), grouped kinds for one query, typo probes
  (`notifcations`, `apperance`, `permisions`), no-results probe `flux capacitor`, unavailable
  capability results with reasons, deep object rows (installation, model, sound pack, worktree),
  help results from teacher topics, setup workflows (`w:setup.cursor-cli`, provider sign-in,
  repair flows).

## `pm2-copy.js` — `PM2.copy`

One-time transaction, never a link. `PM2.copy.sources()` → 5 demo source projects
(`{id, name, lastUpdated, categorySummaries:[{cat, count}]}`, one legacy project that produces
unavailable values + conflicts). `PM2.copy.preview(sourceId, catIds)` → deterministic
`{token, counts:{add, replace, unchanged, unavailable, conflict}, perCategory:[…],
items:[{settingId, label, cat, kind:'add'|'replace'|'unchanged'|'unavailable'|'conflict',
current?, incoming?, note?}], credentialNote}` — credential/account references are preserved by
reference with an explicit no-secret-material note. `PM2.copy.apply(token)` → staged op
(restore-point → apply → verify) via `PM2.states.op`, atomic against `store.values`, returns
`{receiptId, restorePointId, applied, verified:true}` and emits `copy`. `PM2.copy.rollback
(receiptId)` restores exactly. Source and destination stay independent afterward — no sync state
exists. Item-level inspection allowed; per-setting inheritance/overrides are not.

## `pm2-states.js` — `PM2.states`

- Scenarios (8): `baseline calm attention-heavy usage-exhausted invocation-failed
  managed-workspace first-run offline`. `applyScenario(id)` mutates `store` data/values
  deterministically; baseline co-exhibits every co-existable state.
- Fixture overlays (additive, idempotent, persisted under store key `fixtures`):
  `fx.loading-cached fx.import-conflict fx.rollback-complete fx.changed-elsewhere
  fx.restart-required fx.reconnect-required fx.validation-error fx.theme-fallback
  fx.storage-pressure fx.credit-guard fx.index-failed fx.long-text fx.doom-loop-tripped`.
  Provider-side required states (usage-unavailable-but-ready, multi-install selected/shadowed,
  unknown-owner manual-only, update-available-ask-first, verification-failed→rolled-back) are
  permanently present in the shared provider data — managers must surface them.
- Triggers: the rev-2 registry names carried forward (`provider-refresh catalog-refresh reconnect
  invoke-test install-scan install-select install-update install-update-fail install-repair
  import-preview import-cancel import-apply import-rollback sound-preview sound-upload pack-import
  dest-test sound-test theme-reload backup-now test-restore index-rebuild cleanup-dry-run
  formatter-test lsp-restart actions-refresh permission-test changed-elsewhere teacher-explain`)
  plus `copy-preview copy-apply copy-rollback stress-load`. `PM2.states.op(name, ref)` emits
  truthful staged `op` events (`queued → running(phase, determinate only with a real denominator)
  → terminal|degraded|retryable|canceled`); `PM2.states.setTimescale(0)` settles instantly
  (probe mode, also via `?instant=1`). `PM2.states.receipt(label, detail)` → simulated receipt.
- `PM2.states.mountDrawer(store)` → the floating States drawer (scenario radios, fixture
  checkboxes, trigger registry, stress toggle). Shared chrome is acceptable here — it is a test
  harness affordance, not Settings UI.
- Stress: `stress=1` (param or drawer) adds 2,000 synthetic records **clearly namespaced**
  `zz-stress.*` with `synthetic:true` — never replacing or masquerading as inventory; search and
  compendium must stay bounded/virtualized with them active.

## `pm2-route.js` — `PM2.route`

Deep-link grammar (rev-2 contract carried forward):
`<page>.html[?hub=1]#/<route>?<params>` with
`route := home | all | copy | dest/<cat>[/<sub>] | manager/<managerId>[/<objectId>[/<tab>]]
 | setting/<settingId> | search/<query>` and
`params := scenario, fixture (comma list), trigger (comma list of name[:ref]), focus=<rid|id>,
 instant=1, pin=1, stress=1, theme, motion=reduced`.
- `parse(loc)` / `build(route, params)` / `go(dest|hash, {replace})` (pushState so Back/Forward
  are real; replace for scrollspy) / `current()` → parsed route / `bind({open})` — applies the
  initial link in order scenario → fixtures → stress → route → focus → triggers, listens to
  `hashchange`, then stamps `data-pm-state="ready"` + `data-pm2-route` on `<html>` and posts
  `pm-concept-applied` to the parent (hub parity with rev 2).
- `open(dest)` is the concept's own router: it must load the domain/page, open the manager,
  select the exact object/tab/section, scroll the exact row, focus it, and apply the concept's
  calm locator treatment. Back must restore the previous surface **including a search query and
  its results** (search state rides in the route). Escape ladder: popup → drawer/detail → one
  level out → stop at Home.
- URL-applied state is ephemeral unless `pin=1`.

## Test hooks (all concepts, required — the shared harness depends on these)

- Every rendered search result element: `data-rid="<rid>"`.
- Manager navigation entries: `data-manager="m.x"`; workspace rows: `data-setting-id`;
  sections: `data-section`; manager objects: `data-object-id`; tabs: `data-tab`.
- The exact landing target of a deep link gets class `pm2-located` (styling per concept, calm,
  non-flashing, decays; reduced motion → single opacity step).
- `<html data-pm2-route>` mirrors the current route; `data-pm-state="ready"` after boot/link.
- No console errors/warnings in any required state.

## Evidence files (per concept dir `concept-NN-<stem>/`)

Nine files, schemas:
- `manager-coverage.json` `{schema:'pm2.manager_coverage.v2', conceptId, families:[{family:<exact
  packet name>, managerId|surface, status:'demonstrated'|'deferred_named_owner', route, entryPoints
  [], evidence, owner?, returnContract?}]}` — all 42 + 9; never `shared_grammar`, never `missing`.
- `search-route-matrix.json` `{schema:'pm2.search_route_matrix.v1', conceptId, cases:[{query, rid,
  path, dest, expectedLanding, actualLanding, focus, highlight, backRestores, pass}]}` — covers
  grouped, duplicate-label, typo, unavailable, manager-object, deep-row, back-restores cases.
- `manager-route-matrix.json` `{schema:'pm2.manager_route_matrix.v1', conceptId, managers:[{
  managerId, entryPoints[], route, shellRetained, backTarget, closeTarget, narrowBehavior,
  statesShown[], pass}]}` — every demonstrated + deferred route.
- `impact-register.json`, `candidate-command-delta.json`, `candidate-wiring-delta.json`,
  `candidate-dry-delta.json`, `plan-owner-delta.md` — follow the c1-atlas file shapes (read them
  as reference; candidate IDs provisional, `concept_local_state` honesty flags, canon untouched).
- `test-evidence.json` — created by the builder with self-run checks; the Phase-C harness is the
  final writer.

## Concept identities (fixed)

| id | name | stem |
|---|---|---|
| c05 | Waypoint | concept-05-directory-take-1 |
| c06 | Longform | concept-06-directory-take-2 |
| c07 | Compendium | concept-07-compendium-workspace |
| c08 | Beacon | concept-08-directory-take-3 |
| c09 | Chapters | concept-09-tome-tabs |
| c10 | Conductor | concept-10-command-suite |
| c11 | Sheaf | concept-11-tabbed-organizer |

Each concept must also provide: an **All Settings** long-tail index (faceted + virtualized —
primary for c07, secondary utility elsewhere), the Copy flow (`#/copy`), and honest empty/loading/
error/offline surfaces for every scenario and fixture above.
