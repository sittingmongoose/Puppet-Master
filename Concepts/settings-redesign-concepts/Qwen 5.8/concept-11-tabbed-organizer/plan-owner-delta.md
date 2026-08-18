# Plan-owner delta — concept-11-tabbed-organizer (Qwen 5.8)

Scope: candidate impacts only. No canon mutated. Packet: PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18.

## Inventory legacy `global` scope → schema impact

- `Plans/settings_inventory.json` (projected verbatim into `_shared/pm-inventory-data.js`) preserves legacy scope metadata (e.g. `"global"`) for provenance.
- This concept NEVER presents it as an editable scope: no Global/Project/Goal/Host selector, no inheritance, no profiles, no sync UI exists anywhere in the tabbed-organizer surface.
- Every editable row applies to the current Project; the Home footer, Close receipt, and every change receipt state "this Project only".
- Migration shape for canon adoption (owner: settings inventory & schema):
  1. Drop legacy scope from the editable schema; keep it as a read-only provenance field (`legacy_scope`).
  2. Rows previously `global` become Project-owned values with a one-time migration receipt per Project (demonstrated by the `#/lifecycle` "Legacy migration" dry-run card, which reports would-migrate rows without mutating canon).
  3. Deep links keep stable ids (`#/cat/<cat>/<sub>?row=<id>`), so migration is idempotent and re-runnable.
- Validation-failure and import-conflict scenarios demonstrate the migration review path: conflicts queue (keep mine / take incoming) and apply stays a separate step.

## Supersessions honored by this concept

- Collective manager coverage is superseded: this concept individually demonstrates all 42 required families (manager-coverage.json, manager-route-matrix.json).
- `shared_grammar` is not used as a coverage status; statuses are `demonstrated` and `deferred_named_owner` only.
- Reference 07 (Tabbed Organizer) is layout-only: category tabs, layered sheets, roster+detail, and adjacent copy panes are kept; paper/binder/folder/staple/parchment/office-supply ornament is removed and replaced by PM tokens (flat surfaces, layered sheet shadows, tab underline motion).
- Search routes only by immutable rid with exact destination objects; duplicate labels ("Rate Limits" x2, "Context Window" x2) disambiguate by full path and land on distinct objects.

## Deferred named owners (insertion + return contracts)

- Product Onboarding → Product Onboarding plan owner; returns to Providers with the new connection selected + continuation receipt.
- Provider CLI Installation → Provider Lifecycle owner; install receipts deep-link to the provider Installations tab; failed verification returns with previous generation restored.
- Server Claim / Servers / Remote Access / Full Server backup → Server Backbone; cards deep-link back into matching storage/hosting rows.
- Project Hosting & Files / Sync & Move / App & Content Updates → Project Syncing and Updates; finished moves return to Settings Lifecycle with re-verified settings.

## Command / wiring / DRY candidates

- See candidate-command-delta.json, candidate-wiring-delta.json, candidate-dry-delta.json. One provisional presentation candidate (`cmd.settings.tab.select`), everything else reuse/alias of canon route_target/OpenSubject and owner commands.
