# Seven New Concepts — Findings (2026-08-18 pass, Qwen 5.8)

Scope: concepts 05–11 added to `Concepts/settings-redesign-concepts/Qwen 5.8/` under packet `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18.zip`. Concepts 01–04 frozen; no repairs, renames, or removals. No winner selected.

## Architecture findings

1. **Shared headless layer, concept-native presentation.** New `_shared/pm-*2` modules carry data/semantics only (inventory projection, search index, store/receipts/ObservableWork, copy engine, manager fixtures, grammar atoms, quiet shell). Every concept renders its own Home, navigation geometry, search dropdown, manager composition, reveal behavior, narrow transformation, motion, and density. This satisfies "shared headless data/search/state allowed; visible surfaces concept-native" and avoids a second visible renderer. Pre-existing `_shared/*` files were not edited (zero regression surface for 01–04).

2. **Inventory truth.** `pm-inventory-data.js` is a verbatim projection of `Plans/settings_inventory.json` (828 settings, 12 categories, 36 subgroups; verified 828/12 programmatically). Legacy `scope` metadata is preserved in data but never rendered as an editable scope; the schema impact (retire `global` as user-facing scope) is recorded in each concept's `plan-owner-delta.md` and the cumulative impact register, without editing canon.

3. **Search contract.** Results carry immutable `rid`s (`sr:setting:<id>`, `sr:manager:<id>`, `sr:object:*`, `sr:action:*`, `sr:setup:*`, `sr:diag:*`, `sr:unavailable:*`) with canonical destination objects; routing is by `rid` only. Duplicate-label fixtures (two "Rate Limits", "Context Window" setting vs model row) resolve to distinct destinations. Selection pushes `#/q/<query>` before navigating so browser Back restores the query and reopens the dropdown. Bounded Levenshtein fuzzy, capped results (30), latest-request-wins; no manager hydration during search.

4. **Manager coverage per concept.** All 42 required families demonstrated in each concept (roster/detail/catalog/setup/health/diagnostic/transaction archetypes), plus 9 deferred named-owner insertion shells (owner named, insertion destination, return contract, no fabricated backend). No `shared_grammar`, no `missing` in any `manager-coverage.json`.

5. **Project-only + copy.** No scope selectors, inheritance, linked projects, profiles, or sync anywhere. Copy Settings From Another Project is a one-time transaction: preview (add/replace/unchanged/unavailable/conflict + credential-reference note), restore point, atomic apply, verification, receipt, rollback; source and destination remain independent.

6. **Provider rules.** CLI acquisition is explicit, official-source, exact Host/Environment; CLI-owned OAuth for Claude CLI/Antigravity; PM-direct OAuth only OpenAI/Codex, GitHub, Copilot; 17 fixtures cover selected/shadowed installations, unknown-owner manual-only, verification-failed→rolled-back, usage-unavailable, last-known-good catalog, requested-vs-effective.

7. **Performance/truthfulness.** Compendium virtualizes the 828 rows (bounded DOM window; `data-window` proves start:end:total) with a clearly-labeled +2000 synthetic stress toggle that never replaces real data. ObservableWork phases with wait reasons; determinate progress only with denominators; skeletons with cached content; hidden surfaces stop animation; reduced motion preserves state.

## Differentiation (verified by visual audit)

- 05 quiet spatial directory (two-column destination cards, expand/contract motion).
- 06 editorial list (narrow rail, single-column rows, vertical slide).
- 07 compendium workspace (faceted virtualized long-tail spine, pane transfer).
- 08 spacious large-card directory (status cards + quick actions, soft scale).
- 09 rethemed chapter tabs (edge tabs, layered page stack, page-turn translate; zero parchment/brass/fantasy).
- 10 rethemed command suite (Ctrl-K palette, multi-pane drill, compact tables; zero terminal-green/CRT/monospace body).
- 11 rethemed tabbed organizer (category tabs + layered sheets; zero paper/binder/office skeuomorphism).

## Known limitations

- Prototypes simulate ObservableWork/ResourceGovernor/BinaryLocator truthfully but are not production wiring; candidate command/wiring/DRY IDs remain provisional pending canonical owner adjudication.
- Synthetic stress rows are labeled synthetic; real product data is the 828-row inventory only.
- Deferred families are insertion shells by design (named owners + return contracts).
- Windows test environment required an `os.getuid` shim launcher (temp-only; ConceptHub untouched).

## Temporary material

All screenshots, browser profiles, harness scripts, and intermediate results live in `%TEMP%\pm-qwen58-seven\` and are deleted at cleanup; only requested reports/evidence remain in the model folder.

## Completeness sweep (2026-08-18, independent read-only subagent)

Full packet cross-check (all 12 packet files + machine-readable contracts vs repo): verdict **PASS**, zero dropped requirements. Residuals found and closed:

- 08 deferred-family display names realigned to packet canon (`Installation / Deployment`, `Server Claim / Bootstrap`, `Servers / Execution Hosts / Clients`, `Project Sync / Move`, `Puppet Master application/content updates`, `Full Server backup owner flow`).
- 06 search matrix gained an explicit `grouped_results` case (verified live: 2 type groups, 18 rows, rid routing).
- Cumulative impact register count corrected (05: 42 demonstrated).
- `slint_port_impacts` notes filled in 05/07/09/10 registers.
- Runtime-demand → setup deep-link + continuation validation added to 05/08/09/10/11 (receipt names originating operation, token, resume-only-if-current).
- Concept-07 copy-step text glyph replaced with SVG icon.
- Concept-10 scroll-position persistence added.
- 05/08 All Settings gained record-kind + attention facets over the virtualized list.
