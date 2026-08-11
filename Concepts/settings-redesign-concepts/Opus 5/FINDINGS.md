# Opus 5 — Settings redesign findings

No concept is ranked or recommended. This records what each one decided, what is deliberately
different between them, what conflicts turned up in the sources, what stays simulated, and
what looks risky to translate to Slint.

---

## 1. Information architecture per concept

### Opus 5 — Atlas · Settings is a place

A humanised **directory of destinations**, grouped under plain-language headings ("Everyday",
"Who does the work", "What they may do", "What they know", "Craft and upkeep") that deliberately
do not match the internal category order. A destination is a full-width row with a title, a
purpose sentence, a status summary and a chevron. Opening one travels to a workspace with a
persistent outline tree; search docks above that outline. A manager is a **room inside** the
destination — the outline stays put, the document area is replaced, a back path returns you.

The bet: people navigate settings spatially, and the thing that reduces anxiety is always
knowing where you are and how to get back.

### Opus 5 — Console · Settings is a question

The console owns the first screen. Below it, destinations are a **numbered contents page** —
ordinal, name, purpose, status phrase — with no tile, chip or pill geometry anywhere. The
distinctive move is **answering in place**: the first result for a setting becomes a live
control you can change without leaving the console; a manager result becomes a preview with
counts; an action becomes a receipt. On navigation the console shrinks and docks, keeping its
query. A manager is a full-bleed console **mode**.

The bet: most Settings trips are one specific known thing, and the fastest correct design lets
you change it without ever loading a page.

### Opus 5 — Stack · Settings is a route

Progressive columns. Column one is the root list — with "Things that need you" as its first
entry, so notices are part of the route rather than a sidebar. Column two is the sections of
the place you chose; column three is the settings document; a manager pushes column four. The
**scrollspy lives across columns**: scrolling column three moves the marker in column two and
fills a per-section progress bar there. Search collapses the whole stack into one result
column where every hit shows its complete route, and choosing one rebuilds the stack to it.

The bet: depth is fine if it is legible and reversible. Showing the route continuously is what
makes a deep settings tree navigable rather than a maze.

### Opus 5 — Ledger · Settings is a record

The home is the system's **state of record**: three ledger blocks (needs attention / continue
setup / recommended) then a sortable table of domains with real columns — settings, changed,
managed, unavailable, needs a person. Destinations are table rows, unmistakably places you open
rather than facets. In the workspace every setting is a record laid out as label + value +
source + scope, with effect and reason as notes. Navigation is a contents list carrying counts
plus a **proportional mini-map** on the right edge whose bands are sized from the section model
and whose lozenge glides with the viewport.

The bet: the real question in a mature settings system is not "where is it" but "what is
actually in force, where did it come from, and how far does it reach".

---

## 2. What each concept deliberately explores differently

| Question | Atlas | Console | Stack | Ledger |
|---|---|---|---|---|
| How the home establishes hierarchy | Grouped directory + attention column | One dominant console, everything else subordinate | Root column with notices as the first route step | Severity blocks then a data table |
| How search stays central without pills | Wide locator that docks above navigation | The console *is* the app | Stack-spanning header; results carry routes | Omnibar with plain-language filter tokens |
| How the workspace uses space | Outline + wide document | Narrow measure + margin index | Three columns of increasing specificity | Contents + records + edge map |
| How scroll sync feels | Marker glyph fills | Marker travels continuously | Adjacent column marks and fills | Lozenge glides over proportional bands |
| How managers relate to settings | Rooms entered in place | Console modes | A pushed column | Inventories with requested vs effective |
| Progressive disclosure | Level switch + per-section "show N more" | Level in the dock, guard lines inline | Level in the route bar | Level in the omnibar, counts in contents |
| Motion | Architectural | Typographic | Kinetic depth | Instrument panel |

Cross-cutting decisions all four share, because the packet requires the meaning to be constant:
the nine row states, the six exposure levels, the notice grammar (status word, headline,
consequence, one primary action), no colour-only state, no coloured left-edge accents, and no
emoji.

---

## 3. Conflicts and gaps found in the sources

1. **Hub width control versus the packet's test widths.** `ConceptHub/starter/model-folder/concept-hub.json`
   caps `widthControl.max` at 1920, but packet §6 requires testing at 2200 and 2500. Resolved
   here by setting `max: 2600` with presets `[760, 900, 1280, 1700, 2200, 2500]`, which
   `validate.py` accepts. If 1920 is a deliberate ceiling rather than a default, the packet's
   test matrix and the starter need reconciling. Logged as a `source_conflict`.

2. **Personas had no entry point in the settings inventory.** The packet lists Personas among
   the domains that must stay discoverable and among the dedicated managers, but nothing in the
   category structure pointed at a Personas manager. A `Personas` subcategory was added under
   *Agents & models* in the demo fixture. If the real `settings_inventory.json` has the same
   gap, Personas is currently only reachable from Chat.

3. **"Free Models" is a view, not a provider — but it reads like one.** The packet is explicit
   that Free Models is a grouping over underlying providers and not its own credential store.
   Every concept therefore had to say so on the surface, because the obvious rendering (a
   provider card called "Free & community models") implies the opposite. A one-line grouping
   note is doing real work here; a production build probably needs stronger structure than a
   sentence.

4. **`Authenticated` versus `ready` needs two separate readouts.** Modelling this as one health
   field was not enough: OpenRouter authenticates, refreshes its catalogue, and fails every
   generation. Each concept ended up showing catalogue freshness and last successful generation
   as separate lines, plus an explicit readiness check. This should probably be two fields in
   canon, not one.

5. **"What happens next" cannot be a global setting.** The packet forbids a universal
   `When the budget runs out`. Once the continuation options are genuinely per-product, the
   natural home for them is the account row inside the provider manager — which means the
   *Agents → When a route runs out* section is mostly a pointer, not a settings page. All four
   concepts render it that way.

6. **Requested versus effective is not an edge case.** It applies to models, accounts, Crew
   composition, concurrency, terminal shell paths, and context sources. Treating it as a
   per-row annotation was not enough for Crew, where requested 5 / effective 3 / 2 queued is the
   headline fact. The Ledger concept promotes it to a two-reading comparison; the others keep it
   as a note. A shared component is likely needed.

7. **Scope of this reading.** `Plans/**` was not read — it is read-only canon and the packet is
   the stated source of truth for the redesign. Conflicts between this packet and the Plans
   documents may therefore exist and are not recorded here. Everything in
   `IMPACT_REGISTER.json` that names a Plans document is a *probable* owner, flagged with an
   uncertainty level.

---

## 4. What remains simulated

Nothing is a no-op and nothing pretends to have really happened. Each returns a dated receipt
naming the production call.

| Action | Stands in for | Outcome shown |
|---|---|---|
| Sign in (Claude / Antigravity profile) | `CLIBridge.launchOwnLogin` | Handed off — the CLI owns the login |
| Install / update a CLI | `CLIBridge.install` | Handed off |
| Refresh catalogues | `CatalogueService.refresh` | Partial — models.dev activates, Free Coding Models quarantined |
| Readiness probe | `ProviderService.safeProbe` | Ready, or authenticated-but-failing |
| Reconnect MCP server | `MCPService.reconnect` | Fails honestly for postgres |
| Free-model setup | `ProviderService.openConnection` | Handed off to the underlying provider |
| Extra usage / add credit | provider billing | Never executed |
| Logs | `LogService.open` | Not available in a standalone page |
| Reset all, erase memory, discard a note | destructive services | **Refused** with a reason |
| Media test generation, history | `MediaService.*` | Handed off |
| Crew selection, Persona application | `CrewService` / `PersonaService` | Simulated with scope stated |

Account switching, model favourite/alias/hide/priority, Normal-Fast and effort menus, setting
edits, reset-to-default, disclosure levels, search, jump, scrollspy, theme, width, rail, panel,
reduced motion and spellcheck are **genuinely functional** against the in-page model.

---

## 5. Slint 1.17.1 translation risks

- **Low risk.** The section model, scrollspy hysteresis, jump tween, search index, status
  vocabulary, and the whole state layer are plain data and pure functions. They port directly:
  the scrollspy becomes a comparison against `ScrollView.viewport-y`, the jump becomes an
  animated property.
- **Medium: the mini-map (Ledger) and the travelling marker (Console).** Both derive positions
  from the section table rather than from live measurement, so the maths ports — but both
  currently read one element rectangle per layout checkpoint to place items. In Slint these need
  the layout to publish item extents as properties.
- **Medium: `position: sticky` section headers.** Used in Atlas and Ledger. Slint has no direct
  equivalent; it needs an explicit pinned-header row driven by the same active-section property.
- **Medium: the glass themes.** Glass themes are meant to use a single `backdrop-filter` level per
  surface. Console's docked search-results panel was found nested inside the dock's own blur —
  two blurred layers stacked, which the packet forbids relying on — and has been fixed:
  `.co-dock-results` no longer blurs, and the two glass themes give it an opaque background
  instead (see `TEST_REPORT.md` §6 item 25). Slint's blur story is more limited regardless; the
  glass theme should degrade to a translucent fill with a border rather than attempting a live
  blur stack.
- **Higher: `clip-path` wipe (Ledger).** Presentational; the wipe should become an opacity or
  height animation. (An earlier draft of Atlas also used `-webkit-line-clamp` on destination
  purposes, which the packet forbids — found and removed during testing; see `TEST_REPORT.md`
  §6 item 13. No clamp remains, so it is no longer a translation risk here.)
- **Higher: contenteditable spellcheck.** The concept marks up a contenteditable field and
  restores the caret by character offset. Production needs the spelling-service abstraction with
  a real text-input widget; the four actions (check, suggest, learn, ignore) are the portable
  part, the DOM re-marking is not.
- **Virtualisation.** Long lists are data-backed but the concept renders them fully at these
  sizes. With ~198 settings that is fine; the production list needs windowing, which is why the
  section model deliberately does not depend on every row existing.
- **Entrance animations must not be load-bearing for content visibility.** An earlier draft used
  `animation-fill-mode: both` to hold an entrance animation's start and end states, which meant
  content stayed invisible until the animation played — and stayed invisible forever if it never
  did (a throttled tab, a skipped animation, a headless renderer with no compositor frames). The
  fix here was a JS timeout that unconditionally removes the entrance class once its window has
  passed, independent of whether the animation actually ran. A Slint port needs the equivalent
  guarantee: whatever drives an entrance transition must never be the only path to a visible,
  readable end state.

---

## 6. Things a reviewer should poke at

- Switch the demo state to **Calm** on every concept. A settings home that only works when
  something is broken is a common failure; each concept had to earn its layout without notices.
- Compare **Stack at 760px** with the others. One-column-at-a-time is the most opinionated
  narrow behaviour in the set.
- Search `half-life` in **Atlas** and in **Console**. Atlas travels to it and raises the
  disclosure level to make it visible; Console changes it where you are.
- Open the provider manager in all four and look at **OpenRouter**. It is the case that breaks
  a naive "connected / not connected" model.
- Toggle **reduced motion** and repeat a jump in each. The final position must be identical.
