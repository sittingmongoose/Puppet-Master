# c11-sheaf — Plan-owner delta (fable, seven-new-concepts bakeoff 2026-08-18)

Concept register only. Nothing here edits canon; the audit adjudicates.

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/FinalGUISpec.md | extends | Grouped-tab Home reorganization: 9 top tabs over the 12 canonical categories with an in-sheet category lens for the three shared tabs; complete mapping documented on Home; per-category routes (`#/dest/<cat>`) stay canonical, so grouping is presentation, never scope. |
| Plans/FinalGUISpec.md | extends | Sheet-pile location model: deeper navigation lays a sheet inside the same tabbed frame; the crumb-chip pile (Home › Category › Manager › Object) is the location instrument at every width; stacked-edge affordances communicate depth without extra route levels. |
| Plans/settings_inventory.json | conflicts | `system.health.diagnostics-verbosity` exists only in the legacy rev-2 demo dataset, not in the 828-row v2 inventory. This concept renders the stale deep link as an honest non-crashing "not in this project's settings" surface (with search and All Settings escapes) and lands the real `system.health.platform-diagnostics` row exactly. The census should retire or re-mint the stale probe id. |
| Plans/CLI_Bridged_Providers.md | extends | Provider detail tabs render multi-install selected/shadowed, unknown-owner manual-only refusal (no update action on the local Ollama runtime), ask-first Codex update, and verification-failed→rolled-back history as first-class tab content; the tabbed detail composition is proposed as a sanctioned provider layout. |
| Plans/Provider_OpenCode.md | reuses | Server tab (address, version, reachability, handshake, server-supplied catalog, scoped token reference) rendered verbatim from shared resolvers. |
| Plans/Multi-Account.md | reuses | Accounts tab renders auth-boundary ownership, priority, sticky/use-next, and health words from `PMProvider` resolvers; nothing re-derived. |
| Plans/Permissions_System.md | reuses | Permissions manager consumed as shared view model in Sheaf line/roster grammar; no new permission semantics. |
| Plans/UI_Command_Catalog.md | extends | Tab/sheet navigation implies `cmd.settings.tab.select` and `cmd.settings.sheet.pop` candidates plus dest-object payloads for `cmd.settings.navigate`; all provisional, censused in candidate-command-delta.json. |
| Wiring matrix owner | extends | Ten keystone traces registered (candidate-wiring-delta.json), every one flagged `concept_local_state`. |
| Settings schema/registry | extends | Advanced-tier disclosure that also absorbs essential overflow (visible groups stay ~4–8 rows) needs a stated rule: a deep link must auto-open any fold hiding its target — implemented here, worth canonizing. |

## 2. Supersessions demanded

1. **Home-count flexibility.** Any plan text hard-coding "12 top-level destinations" is superseded by "12 canonical categories, presentable through 9–12 top-level tabs with a complete documented mapping; no setting disappears; per-category routes canonical."
2. **Search landing by destination object.** Any surviving text describing search result activation by list index or label is superseded: results carry immutable rids and dest objects; this concept routes only by rid/dest (verified in search-route-matrix.json).
3. **Manager slide navigation.** Global previous/next-manager affordances remain retired; managers are sheets in a pile with crumb/Back/Close, not slides.

## 3. Boundary confirmations

- **Project-only.** No scope selectors anywhere; the frame bar carries "changes apply to this project only"; `legacyScope` shows only inside the row Details drawer as history with the packet-approved wording.
- **Copy is a transaction, not a link.** Source select → category choose (adjacent panes with counts) → preview (adds/replaces/unchanged/unavailable/conflicts + item inspection + credential-by-reference note) → restore point → atomic apply → verify → receipt → working rollback. No sync language exists on the surface.
- **Provider CLIs acquired explicitly.** The Cursor CLI setup tab is user-triggered, official-source, exact host/environment; sign-in is a separate step; the unknown-owner installation is manual-only and refuses honestly.
- **ObservableWork.** The ops strip renders determinate progress only when the op payload carries a real denominator (`progressKind === 'determinate'`); otherwise phase text + indeterminate shimmer; terminal states truthful.
- **Single governor.** No second resource/admission owner is modeled; ops are projections of `PM2.states.op` events only.
- **DRY visible state.** `m.dry` renders read-only projections of the shared owners; boundary checks return receipts, not repairs.
