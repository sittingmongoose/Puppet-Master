# concept-06-directory-take-2 — Plan-owner delta (fable · 06 Longform, bakeoff packet 2026-08-18)

Concept register only. Nothing here edits canon; the audit adjudicates.

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/FinalGUISpec.md | extends | Editorial list-led composition proven: persistent text-led domain rail + one bounded ~76ch reading column, twelve full-width destination rows, ruled More/Advanced folds (4-8 rows per heading), in-flow manager detail sheets, fade-and-rise-only motion, narrow single-pane push with a crumb-selector popup. |
| Plans/settings_inventory.json | conflicts | The rev-2 probe id `system.health.diagnostics-verbosity` is absent from the generated 828-row PM2_INVENTORY (only the `_shared` extension dataset carries it). Longform renders stale ids as an honest "Not in this project's settings" surface with recovery links; the real probe row `system.health.platform-diagnostics` lands exactly. Generator and probe list must be reconciled. |
| Plans/UI_Command_Catalog.md | extends | Every navigation (rail, breadcrumb, destination row, manager row, search selection, recents, copy-done) uses one dest-object payload; `focus=<rid>` is proposed as the canonical navigate-and-locate carrier (candidate-command-delta.json). |
| Plans/CLI_Bridged_Providers.md | extends | Provider sheet renders the shared resolver states verbatim: selected/shadowed installs, unknown-owner manual-only refusal (Ollama), ask-first Codex update, verification-failed rollback history, official-source Cursor CLI setup with explicit host/environment and separate sign-in. |
| Plans/Permissions_System.md | reuses | Permissions & FileSafe renders purely from the shared view model in Longform's grammar (roster + form + checks); no new permission semantics introduced. |
| storage-plan.md | reuses | Hosting, Project Sync/Move, Full Server Backup remain read-only insertion shells naming this owner with return contracts rendered verbatim; no fabricated backend. |
| Settings lifecycle / copy owner | extends | The quiet-dialog copy transaction walks source → counts → full preview (add/replace/unchanged/unavailable/conflict + item inspection + credential-by-reference note) → restore point → atomic verified apply → receipt → working rollback; verified end-to-end over CDP. |

## 2. Supersessions confirmed (no new ones demanded)

1. **Chip/bloom no-sidebar Settings** — superseded again by a persistent workspace: rail + reading column coexist with the Activity Bar.
2. **Scope selectors in rows** — `legacyScope` appears only as impact prose inside the row Details drawer; the concept renders no Global/Project control anywhere.
3. **Global previous/next-manager navigation** — absent; managers are chapters reached from their domain, search, or breadcrumb, never slides.

## 3. Boundary confirmations

- **Project-only.** The header states "Puppet Master · Project" as context; the copy flow is one-time transaction language with independence stated on the receipt; no sync/link/inheritance affordance exists.
- **Provider CLIs acquired explicitly.** The Cursor CLI setup is a user-triggered numbered sequence from the official source for an exact host/environment; the unknown-owner Ollama update renders disabled with its reason and refuses honestly when invoked.
- **Truthful work.** Every staged operation prints the shared op payload (status, phase, determinate progress only with a real denominator); copy verify-failure restores automatically and says so.
- **Search routes by identity.** Selection carries `rid` + dest object; the concept re-resolves the rid after render to land on the exact element. No index- or label-based routing anywhere.

## 4. Open items for the audit

- Retire or regenerate the stale probe id `system.health.diagnostics-verbosity` (the inventory's current probe row is `system.health.platform-diagnostics`); stale deep links get the honest not-found surface until then.
- Subgroups of ~23 rows force an arbitrary editorial cut (first 7 visible, rest behind "More"); a per-subgroup curated lead flag in the inventory would make the fold principled.
- `sectionId` from search dests does not survive the URL hash (route grammar has no section segment); Longform compensates with the `focus=<rid>` param — worth standardizing across concepts.
