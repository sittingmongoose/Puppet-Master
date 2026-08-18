# What every one of concepts 05–11 must build

Read `shared2/CONTRACT.md` first — it is the API. This file is the scope: the same
work in all seven concepts, so the only thing that differs between them is the design.

Your concept is **one HTML page at the model-folder root** plus **one directory beside
it** holding `concept.js` and `concept.css`. You own exactly those three files.

## 1. The PM shell

Your page needs `<div id="pm-root"></div>` and one `PMShell.mount({...})` call. Read
`shared/pm-shell.js` for the option list and `concepts/atlas/concept.js:2149` for a
working call site. It returns:

```js
shell.main            // the element you render Settings into
shell.review          // the reviewer strip, if you want to append a control
shell.widthMode()     // "normal" | "narrow" | "squeezed" — derived at resize checkpoints
shell.announce(text)  // the live region
shell.notify(entry)   // the title-bar notification inbox
shell.setTheme / setWidth / setRail / setPanel / setReducedMotion
```

The shell gives you the title bar, activity rail, side panel, status bar and the
theme / width / reduced-motion controls. Settings renders **inside `shell.main`**. The
rail must never overlay Settings content at any width.

Two shell controls are wired to the older concepts' data and must **not** be used by
you: its `Demo state` select reads `window.PMData.demoStates`, and its `Reset` button
clears a `PMStore` namespace you do not own. Build your own state-fixture control over
`PM2States.grouped()` and your own reset over `store.reset()`, in your own visual
grammar, and keep the selected fixture in the route (`?s=<id>`) so a deep link
reproduces the exact screen.

## 2. Settings Home

First viewport, at every tested width, in this order of visual weight:

1. the Project name as context (never a scope selector),
2. the large universal search field,
3. **at most one** critical full-width notice — only when `PM2States.notice()` returns
   one,
4. a compact `Needs attention` list, normally 2–4 items, from `PM2States.attention()`,
5. **the major Settings destinations as the dominant content** — the 12 domains.

Secondary utilities (All Settings, Copy Settings, recent changes, history) are
visibly secondary. Forbidden on Home: a wall of calls to action, horizontally
scrolling shelves, tiny destination pills, every block styled as equally actionable,
emoji, colored left-edge accent bars, decorative controls.

## 3. Domain → page → section → row

`#/d/<domainId>` shows the domain: its purpose, its pages, and the manager
destinations that live in it (`PM2Model.domain(id).families`). `#/d/<domainId>/<pageId>`
shows the page's sections; each section holds 4–8 rows already grouped for you.

Row rendering (`PM2Model.stateLabel/stateTone/stateReason/isEditable`):

- title, one explanation, the control, and only the status the reader needs;
- `standard` rows visible, `advanced`/`expert`/`diagnostic` behind your own disclosure;
- `Why this value?` / Details carries the reason, the restart note and the technical
  origin — never the row itself;
- managed and unavailable rows are readable and clearly not editable;
- controls must actually work: toggles, selects, numbers, sliders, text, paths, lists,
  key/value and multiselect all round-trip through `store.setValue()`.

Every row is virtualized or bounded — `PMVirtual.windowFor()` — once a list exceeds
about 40 rows.

## 4. All Settings

Every concept ships a complete, faceted, **virtualized** long-tail index over
`PM2Index.all(filter)`: facets for domain, record kind, exposure, changed-from-default,
managed/unavailable, and attention state, with live counts. It must never be an
828-row DOM dump. It is primary in concept 07 and a secondary utility elsewhere, but
it exists everywhere.

## 5. Universal search

The field is prominent on Home and reachable from every Settings surface. Typing opens
a dropdown **anchored directly beneath the field**, grouped by result kind, each result
showing its human label, its type, its complete Settings path, its object where
relevant, and its availability where useful.

Selecting a result must, in this order: load the domain → load the page → open the
manager if the destination names one → select the exact object → select the subpage or
section → scroll the exact row into view → move focus to it → apply one calm,
non-flashing locator highlight → leave a Back route that restores the query text and
the selected result.

Route **only** through `PM2Index.byId(result.id).destination`. Never through an array
index, a grouped-list position, or a label. Duplicate labels must remain
distinguishable by path.

## 6. Managers — all of them

Every entry of `PM2Model.FAMILIES` (42) and `PM2Model.EXTRA_MANAGERS` (2) is rendered
by your concept, in your concept's own layout, reached from its owning domain and from
search. Every entry of `PM2Model.DEFERRED` (10) has a reachable destination that names
its owner, says why it is separate, shows the insertion and return contract, and fakes
no backend.

Write **one** `renderManager(spec, ctx)` that branches on
`PM2Managers.archetype(id)` — `preference document`, `resource roster and detail
sheet`, `inventory catalogue`, `setup or repair sequence`, `read-only health
projection`, `diagnostic drawer`, `preview and confirmation transaction`,
`named owner insertion point` — so a roster does not get flattened into preference
rows. Then build the **provider manager bespoke**: it is the one surface the seven
designs are meant to disagree about.

Provider manager rules: the default view answers connected state, selected
account/product, available models, what happens when usage runs out, routing and
fallback, and setup/repair. Credentials, installations, model catalogues, limits, logs
and diagnostics are coordinated subpages — never one wall. Never render secret
material. First acquisition of a provider CLI is an explicit user-triggered
Install/Set up from the official source for the exact host; authentication is separate.

Every manager keeps the shell: Project name, breadcrumb, search, `Back to <named
location>`, `Close Settings`. There is no previous/next-manager control. Managers
hydrate lazily — call `PM2Managers.spec()` on entry, not on load — and release their
subscriptions when they are not visible.

## 7. Copy Settings From Another Project

A four-step transaction using `PM2Copy`: choose source → choose categories → preview →
apply, then a receipt with rollback. The preview shows additions, replacements,
unchanged, unavailable and conflicts with counts and an itemised diff, states the
credential policy (`PM2Copy.secretPolicy()`), and states that the two Projects stay
independent (`PM2Copy.independence`). Drive `apply()` step by step so each phase —
restore point, apply, verify — is visible; honour `verify-failed-rollback`.

## 8. Deep links, Back, Escape

Hash routes per `CONTRACT.md`. `Back` moves one Settings level out and names the place
it returns to. `Close Settings` returns to the surface that opened Settings. Escape
order: close popup → close detail/drawer → one level out → stop at Settings Home.
A malformed hash goes Home; a well-formed hash naming something absent renders an
inline notice quoting the link (`PM2Route.resolve()` tells you which it is).

## 9. States

All 19 `PM2States` fixtures must visibly change your concept, including
`loading-cached` (cached content stays, marked refreshing), `empty`, `no-results`,
`typo-search`, `validation-error`, `offline`, `managed`, `unavailable`,
`restart-required`, `reconnect-required`, `changed-elsewhere`, `import-conflict`,
`rollback-complete`, `usage-unavailable`, `multi-install-shadowed`,
`unknown-install-owner`, `update-available`, `verify-failed-rollback`.

Operations use `PMWork` and its single governor. Determinate progress only with a real
denominator; otherwise an honest indeterminate state with a named wait reason.

## 10. Theme, motion, width

Eight themes and reduced motion come from `shared/pm-themes.css`. Author your CSS
against its custom properties only — never hard-code a colour. Test at 760, 900, 1280,
1700, 2200 and 2500.

- Narrow: push navigation or a controlled drawer; selection, scroll position, query and
  Back target all survive the collapse; the search dropdown stays in the viewport.
- Wide: bounded measures, no stretched text lines, no empty deserts.
- Popups: PM Model/Mode selector family — collision flipping, layering, submenu
  behaviour, Escape closes only the top layer.
- Scroll surfaces use the PM custom scrollbar.
- Motion explains location: forward in one consistent direction, Back reverses it,
  focus and scroll restore. No continuous decorative animation, no loader theatre, no
  flashing locator, no full-page blur.

## 11. Test attributes — the one thing all seven concepts share visually

The audit harness drives seven completely different layouts, so it identifies things
by attribute rather than by class or position. These are the only markings your DOM
must carry; they constrain nothing about how anything looks. Put them on the real
element, not on a wrapper, because the harness measures geometry through them.

```text
[data-pm-surface="home|domain|page|manager|all|copy|search|notice"]   the surface currently shown
[data-pm-domain="<domainId>"]        a domain destination, wherever it appears
[data-pm-page="<pageId>"]            a page destination
[data-pm-section="<sectionId>"]      a section heading block
[data-pm-row="<settingId>"]          one setting row (the whole row)
[data-pm-control="<settingId>"]      the focusable control inside that row
[data-pm-manager="<managerId>"]      a manager destination link AND the manager's own root
[data-pm-object="<objectId>"]        a selected object inside a manager
[data-pm-search-field]               the universal search input
[data-pm-search-dropdown]            the results dropdown container
[data-pm-result="<resultId>"]        one result, carrying its immutable id
[data-pm-locator="1"]                whatever currently carries the arrival highlight
[data-pm-back] [data-pm-close]       the Back and Close Settings controls
[data-pm-breadcrumb]                 the breadcrumb container
[data-pm-project]                    the element naming the current Project
[data-pm-state-control]              your state-fixture control
```

You do **not** maintain `data-pm-hydrated`: `PM2Managers.spec()` writes it on `<html>`
itself, which is the only place a manager is ever built. That is how the harness proves
that typing in the search field did not instantiate forty managers — so never call
`PM2Managers.spec()` or `PM2Managers.coverage()` during load, during search, or to
build a link label. Call it when a manager is opened, and read
`PM2Managers.record(id)` / `PM2Model.familyOf(id)` for the title, purpose and icon you
need on a destination link.

## 12. Self-check before you finish

Run these against your own page and fix what fails:

- page loads with **zero** console errors and zero page errors at 760/1280/2500;
- `document.documentElement.scrollWidth <= innerWidth` at every tested width;
- every one of `PM2Model.FAMILIES` + `EXTRA_MANAGERS` + `DEFERRED` reachable by route
  and by a click path from Home;
- 828 inventory ids all reachable: `#/d/<domain>/<page>/<section>/<settingId>` scrolls
  and focuses the row;
- 20 search queries land on the exact destination and Back restores the query;
- no `<iframe>`, no `opus-5-`, no other `concept-NN-` reference, no emoji, no
  hard-coded hex colours outside a theme token fallback;
- `data-concept-model="Opus 5"` present.
