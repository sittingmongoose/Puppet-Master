# concept-07-compendium-workspace — Plan-owner delta (fable, bakeoff packet 2026-08-18)

Concept register only. Nothing here edits canon; the audit adjudicates.

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/settings_inventory.json | extends | First surface to render all 828 rows as one faceted, virtualized compendium; facets depend on tier/type/curated/search staying populated, and a record-kind discriminator (setting / action / manager / diagnostic) should become schema instead of concept-side inference. |
| Plans/FinalGUISpec.md | extends | Compendium workspace grammar: persistent workspace rail on every Settings surface, domain pages as overview strip + curated key settings + full subgroup sections + related-managers panel, and the About-this-setting explanation panel as the deep-link landing contract. |
| Plans/UI_Command_Catalog.md | extends | Candidate command family for facet presets, sort, explanation panel, and copy-preview staging (candidate-command-delta.json); dest-object navigation reused, no per-destination aliases minted. |
| Performance decision register (2026-08-13) | extends | Reference implementation of the long-tail budget: 2,828 records windowed to fewer than 40 live DOM rows, O(n) facet recounts, latest-request-wins search, lazy manager hydration. |
| Plans/CLI_Bridged_Providers.md | reuses | Provider list/detail renders shared resolver states verbatim: selected/shadowed installs, unknown-owner manual-only, ask-first updates with verify checklists, verification-failed -> rolled-back history, official-source Cursor CLI setup. |
| Project-copy policy | extends | The preview showpiece contract: five outcome counts, per-area breakdown, expandable current->incoming diff rows with per-kind stories, credential-by-reference note, conflicts never auto-applied, receipt + exact rollback. |
| Settings schema/registry | conflicts | Legacy rev-2 probe id `system.health.diagnostics-verbosity` is absent from pm2-inventory; c07 lands honestly on System & Advanced with an explanation. boot-check now probes both this stale id (honest fallback required) and the real `system.health.platform-diagnostics` (exact landing required) — c07 passes both. The rev-2 vs pm2 census should still be reconciled. |

## 2. Notes for the audit

1. Every trace in candidate-wiring-delta.json is flagged `concept_local_state`; no production wiring is claimed.
2. Inventory `action`-type rows execute as simulated receipts only — the concept never fakes success beyond the honest "simulated" wording.
3. The compendium's record-kind facet counts all 47 shared-registry entries (38 demonstrated managers + 9 deferred owner shells; 41 index as record kind "manager" and the 6 health/diagnostic-archetype ones as "diagnostic"); deferred shells stay read-only with owner + insertion contract rendered. The remaining 4 of the 42 demonstrated families (Home, Search, Workspace, row grammar) are concept surfaces, not registry entries.
4. Legacy `global` scope metadata is surfaced only inside the row Details drawer as the impact-analysis note; no scope selector exists anywhere.
