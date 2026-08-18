# shared2 — the contract concepts 05–11 are built against

`shared/**` belongs to concepts 01–04 and is frozen. `shared2/**` is the headless
layer for the seven new concepts: data, search, routing, manager semantics, the copy
transaction, state fixtures and persistence. **Nothing in `shared2/` draws Settings.**
Every visible surface — Home, navigation, the workspace, each manager, the search
dropdown, the exact-result reveal, narrow-width behaviour, motion and density — is
written inside the concept's own directory.

## Page skeleton

Each concept is one HTML file at the model-folder root plus one directory beside it:

```text
concept-07-compendium-workspace.html
concept-07-compendium-workspace/concept.js
concept-07-compendium-workspace/concept.css
```

The page loads, in this order and nothing else:

```html
<link rel="stylesheet" href="shared/pm-themes.css">        <!-- 8 themes + reduced motion -->
<link rel="stylesheet" href="shared/pm-shell.css">         <!-- PM app chrome only -->
<link rel="stylesheet" href="concept-07-compendium-workspace/concept.css">
...
<script src="shared/pm-icons.js"></script>
<script src="shared/pm-store.js"></script>
<script src="shared/pm-data.js"></script>          <!-- + the five pm-data-*.js modules -->
<script src="shared/pm-data-seal.js"></script>
<script src="shared/pm-virtual.js"></script>
<script src="shared/pm-work.js"></script>
<script src="shared/pm-sim.js"></script>
<script src="shared/pm-spellcheck.js"></script>
<script src="shared/pm-manager-kit.js"></script>
<script src="shared/pm-shell.js"></script>
<script src="shared/concept-hub-bridge.js"></script>
<script src="shared2/pm2-inventory.js"></script>
<script src="shared2/pm2-model.js"></script>
<script src="shared2/pm2-managers-extra.js"></script>
<script src="shared2/pm2-managers.js"></script>
<script src="shared2/pm2-index.js"></script>
<script src="shared2/pm2-route.js"></script>
<script src="shared2/pm2-states.js"></script>
<script src="shared2/pm2-scale.js"></script>
<script src="shared2/pm2-store.js"></script>
<script src="shared2/pm2-copy.js"></script>
<script src="concept-07-compendium-workspace/concept.js"></script>
```

Hard rules the packet validator and the auditors check:

- `data-concept-model="Opus 5"` must appear on the concept's identity header.
- **No `<iframe>` anywhere.**
- **No link, `href`, `src` or route to another concept page** — not `opus-5-atlas.html`,
  not another `concept-NN-*.html`. Nothing may import another concept's renderer.
- **No emoji.** Icons are inline SVG through `PMIcons.icon(name)`.
- No colored left-edge accent bars; no raw `snake_case`, enum names or internal ids in
  ordinary prose.

## What `shared/` may be used for

Allowed, read-only: `pm-themes.css` (theme tokens), `pm-shell.css` + `pm-shell.js`
(the PM application chrome: title bar, activity rail, side panel, status bar, review
strip — it contains no Settings styling), `pm-icons.js`, `pm-virtual.js`,
`pm-work.js` (ObservableWork + the single RuntimeResourceGovernor),
`pm-sim.js` (seeded receipts), `pm-spellcheck.js`, `pm-store.js`, and
`pm-manager-kit.js` + `pm-data*.js` **as headless ManagerSpec sources only**.

Forbidden: `PMManagerKit.homeOf`, `.ASSIGNMENT`, `.CONCEPTS`, `.assignedTo` — those
name concepts 01–04 and would produce a cross-concept pointer. Use `PM2Managers`
instead, which never reaches that path.

## Data

```js
PM2Model.project                  // { id, name, path, ... } — the one Project
PM2Model.otherProjects            // copy sources only; never edited, never synced
PM2Model.domains                  // 12, ordered; each has pages[] and families[]
PM2Model.page(id) / .section(id) / .setting(id)
PM2Model.rowsInSection(id) / .rowsInPage(id)
PM2Model.settings                 // all 828 canonical records
PM2Model.counts                   // { settings:828, domains:12, pages:36, sections:180, ... }
```

A setting record:

```js
{ id, label, desc, kind, options[], default, recommended, tier, curated,
  badges[], related[], search[], domainId, pageId, sectionId,
  exposure: "standard"|"advanced"|"expert"|"diagnostic",
  legacyScope[],                  // REPORTED ONLY — never rendered, never an editing scope
  state: { source, value, defaultValue, isDefault, restart, ...} }
```

`state.source` is one of `default | custom | recommended | auto | notConfigured |
managed | unavailable`. **There is no inherited state and no scope word.** Render it
through `PM2Model.stateLabel / stateTone / stateReason / isEditable`; only
`stateReason` goes behind "Why this value?" or Details, never on every row.

### Density rules for rows

- A visible group is one section: 4–8 rows, already cut that way by the generator.
- Show `standard` rows by default; `advanced`, `expert` and `diagnostic` rows sit
  behind the concept's own disclosure. Never hide a row from search.
- A row shows title, one explanation, the control, and only the status needed. Source,
  revision, policy owner and provenance belong in Details.

## Managers

```js
PM2Managers.spec(managerId, state)   // normalised ManagerSpec — never a cross-concept pointer
PM2Managers.has(managerId)
PM2Model.FAMILIES                    // the 42 required families, in the packet's words
PM2Model.EXTRA_MANAGERS              // performance + copy, demonstrated everywhere
PM2Model.DEFERRED                    // 10 named owners with insertion + return contracts
PM2Model.familyOf(managerId)         // { family, archetype, domainId, deferred? }
```

Every concept renders **all** of `FAMILIES` + `EXTRA_MANAGERS` itself, and gives each
`DEFERRED` entry a reachable destination that names its owner, says why it is separate,
and states how control returns. `shared_grammar` is not a status that exists here.

`archetype` tells the concept what shape to draw — `preference document`,
`resource roster and detail sheet`, `inventory catalogue`, `setup or repair sequence`,
`read-only health projection`, `diagnostic drawer`,
`preview and confirmation transaction`. Do not flatten them all into setting rows, and
do not build one giant provider wall: the default provider view answers connected
state, selected account, available models, usage-end behaviour, routing and
setup/repair; credentials, installations, catalogues, limits and logs are subpages.

Hydration is lazy: `PM2Managers.spec()` is called when a manager is opened, not on
load, and never by search. Off-screen managers release their subscriptions.

## Search

```js
PM2Index.query(text, opts)  // -> { generation, groups:[{ kind, label, results:[...] }], total, truncated }
PM2Index.byId(resultId)     // -> the same result object, from its immutable id
```

A result:

```js
{ id,                 // immutable, e.g. "r:setting:ai.models.default-model" — never an index
  kind,               // setting | manager | object | action | setup | diagnostic | unavailable | help
  label, typeLabel,
  path,               // complete human Settings path, e.g. "AI Brains & Providers › Models & Defaults › Model"
  destination,        // { domainId, pageId, sectionId, settingId, managerId, objectId, sectionKey }
  availability }      // string or null
```

Routing rules, tested per concept:

1. Selecting a result routes **only** via `result.id → PM2Index.byId(id).destination`.
   Never by array position, grouped-list position, or label text.
2. The route loads the domain, then the page, opens the manager when the destination
   names one, selects the exact object, selects the subpage/section, scrolls the exact
   row into view, moves focus to it, and applies one calm non-flashing locator highlight.
3. Back restores the query text **and** the previously selected result.
4. Duplicate labels, grouped results, typo/fuzzy matches, unavailable results, manager
   objects and deep rows must all land correctly. Results are bounded
   (`opts.limit`, default 40) and the dropdown says when more exist.
5. Search never hydrates a manager.

## Routing

```js
PM2Route.current()          // { kind, domainId, pageId, sectionId, settingId, managerId, objectId, sectionKey, query, resultId, demo }
PM2Route.go(dest, opts)     // push
PM2Route.replace(dest)
PM2Route.back()
PM2Route.onChange(fn)
PM2Route.href(dest)         // "#/..." only; hash routing, so file:// and the Hub both work
```

Grammar (every segment encoded):

```text
#/home
#/q/<query>[/<resultId>]
#/d/<domainId>[/<pageId>[/<sectionId>[/<settingId>]]]
#/m/<managerId>[/<objectId>[/<sectionKey>[/<rowId>]]]
#/copy[/<step>]
#/all[/<facetQuery>]
```

with an optional `?s=<stateFixtureId>` tail on any route. A malformed route goes Home;
a well-formed route naming something absent renders an inline notice quoting the link.

Every Settings destination keeps one shell showing: `Back to <named location>`, the
`Settings / Domain / Page / Object` breadcrumb, universal search, the Project name, and
`Close Settings`. Escape order: popup → detail/drawer → one Settings level out → stop at
Settings Home. There is no previous/next-manager control anywhere.

## Project-only

Never render: a Global/Project/Goal/Host selector, "apply to every Project",
inheritance, linked Projects, "keep in sync", reusable profiles, or per-setting
override-versus-default. A manager may show *where* an external resource lives and its
read-only health; how this Project uses it is still a Project setting.

## Copy Settings From Another Project

```js
PM2Copy.sources()                       // PM2Model.otherProjects
PM2Copy.preview(sourceId, domainIds)    // { counts:{additions,replacements,unchanged,unavailable,conflicts}, groups[], items[] }
PM2Copy.apply(preview)                  // -> ObservableWork op: restore point → apply → verify → receipt
PM2Copy.rollback(receiptId)
PM2Copy.receipts()
```

One-time transaction: select source → choose categories → preview additions,
replacements, unchanged, unavailable and conflicts → explain credential/account
reference handling **without showing secret material** → restore point → atomic apply →
verify → receipt + rollback. Afterwards the two Projects are independent; nothing
propagates.

## Deterministic states

```js
PM2States.list()        // the fixtures, each { id, label, note }
PM2States.active()      // from ?s= on the route
PM2States.is(id)
```

Every concept exposes all of them from its own control and honours them:
`loading-cached, empty, no-results, typo-search, validation-error, offline, managed,
unavailable, restart-required, reconnect-required, changed-elsewhere, import-conflict,
rollback-complete, usage-unavailable, multi-install-shadowed, unknown-install-owner,
update-available, verify-failed-rollback`.

Operations run through `PMWork` (ObservableWork) and ask
`PMWork.governor` for a permit. Determinate progress only with a real denominator;
otherwise an honest indeterminate state with a named wait reason. No concept may
create a second governor or a second progress owner.

## Provider CLI acquisition

No provider CLI is bundled, pre-seeded or silently installed. First acquisition is an
explicit user-triggered Install/Set up, from the official provider source, for the
exact selected host. Authentication is a separate step. When runtime demand finds a
missing CLI, the concept preserves the originating operation and deep-links to the
exact setup row, resuming only after explicit setup. Normal UI names the installation
in human terms; resolved launcher, executable, package identity and confidence live in
Advanced details. Ambiguous ownership is manual-only.

## Persistence

```js
PM2Store.create(conceptId)   // namespaced: pm2:<conceptId>:*  — never collides with shared/pm-store keys
store.get() / .set(patch) / .subscribe(fn) / .reset()
```

Persist what a reader expects to survive a reload: changed values, manager edits,
dismissed notices, the active state fixture, the route, copy receipts. Do not persist
in-flight operations.

## Theme, motion, responsive

Eight themes (`friendly|glass|retro|basic` × `dark|light`) come from
`shared/pm-themes.css` via `data-theme` on `<html>`; reduced motion from
`data-reduced-motion="1"`. Test widths: **760, 900, 1280, 1700, 2200, 2500**.

- No shell rail may overlay Settings content at any width.
- Narrow widths use push navigation or a controlled drawer; selected item, scroll
  position, query and Back destination survive a pane collapse.
- The search dropdown stays inside the viewport.
- Popup menus follow the PM Model/Mode selector family: collision flipping, layering,
  submenu behaviour, Escape closes the top layer only.
- Scrollable surfaces carry the PM custom scrollbar. `shared/` does not ship one, so
  author it in your own CSS from theme tokens and apply it to every scroll container:

  ```css
  .yourscroller { scrollbar-width: thin; scrollbar-color: var(--pm-border-strong) transparent; }
  .yourscroller::-webkit-scrollbar { width: 10px; height: 10px; }
  .yourscroller::-webkit-scrollbar-track { background: transparent; }
  .yourscroller::-webkit-scrollbar-thumb {
    background: var(--pm-border-2); border-radius: 999px;
    border: 2px solid transparent; background-clip: padding-box;
  }
  .yourscroller::-webkit-scrollbar-thumb:hover { background: var(--pm-border-strong); background-clip: padding-box; }
  ```

### Theme tokens — the complete set

Every colour, radius, shadow, duration and space in your CSS comes from these, defined
per theme in `shared/pm-themes.css` under `[data-theme="..."]`:

```text
--pm-bg  --pm-surface-1  --pm-surface-2  --pm-surface-3  --pm-surface-sunken
--pm-surface-blur  --pm-surface-alpha
--pm-text-1  --pm-text-2  --pm-text-3  --pm-text-inverse
--pm-border-1  --pm-border-2  --pm-border-strong  --pm-border-w
--pm-accent  --pm-accent-soft  --pm-accent-text  --pm-focus
--pm-ok  --pm-attention  --pm-attention-bg  --pm-setup  --pm-setup-bg
--pm-managed  --pm-managed-bg  --pm-unavailable  --pm-unavailable-bg
--pm-recommended  --pm-recommended-bg  --pm-risky  --pm-risky-bg
--pm-radius-1  --pm-radius-2  --pm-radius-3  --pm-shadow-1  --pm-shadow-2
--pm-space-1..7  --pm-dur-1..3  --pm-ease  --pm-ease-out  --pm-motion-transform
--pm-font  --pm-font-mono  --pm-font-size  --pm-line  --pm-title-weight  --pm-letter
--pm-rail-w  --pm-rail-w-closed  --pm-panel-w  --pm-topbar-h  --pm-bottombar-h
```

`--pm-motion-transform` is the multiplier reduced motion sets to 0 — multiply every
translate distance by it instead of writing a second reduced-motion rule per animation.
- Motion explains location: forward one direction, Back reverses it, focus and scroll
  restore. No continuous decorative animation, no loader theatre, no flashing locator,
  no full-page blur.

## Slint 1.17.1 portability

Stable model ids everywhere; list virtualization through `PMVirtual`; explicit state
machines for routes, menus, drawers and transitions; narrow incremental updates; no
core behaviour that depends on DOM measurement or CSS-only tricks; reusable components
rather than one monolith; bounded blur and shadow.
