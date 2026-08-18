# concept-10-command-suite — candidate Plan / owner impact (Rethemed Command Suite)

Concept pass 2026-08-18. Canon NOT edited: Plans, settings_inventory.json/schema, Command Catalog, Wiring Matrix, DRY owners.

## Inventory / schema impact (candidate)

- Plans/settings_inventory.json carries legacy scope metadata (global on 582 of 828 records, plus run/account/provider/persona scopes). This concept pass projects every record into the current Project and exposes no scope selector, inheritance, profiles, or sync. Future schema work: replace per-record scope with explicit resource-location metadata (account / provider installation / server / host) plus a Project-local value; record provenance separately. Candidate owner: Settings inventory schema owner (owner_plan_unit F3-441).
- The curated, tier, and recommended fields are consumed read-only for exposure ordering; no change proposed.

## Command Catalog impact (candidate)

- Reuse candidates: cmd.settings.open / navigate / search.focus / value.set / default.restore / import.* / reset.* / export / copy_from_project.preview / copy_from_project.apply.
- New candidates: cmd.settings.search.select_result (immutable result ID routing), cmd.settings.back, cmd.settings.close, cmd.settings.copy_from_project.rollback, cmd.provider.install.begin, cmd.provider.install.verify, cmd.provider.repair, cmd.provider.test_connection, cmd.manager.hydrate, cmd.manager.object.select, cmd.manager.object.save, cmd.op.cancel, cmd.op.retry, cmd.op.rollback.
- Alias: cmd.provider.account.select → cmd.account.select_profile. Retire-alias: cmd.settings.bloom.open (old chip/bloom architecture).
- See candidate-command-delta.json for the typed closure fields each candidate needs.

## Wiring Matrix impact (candidate)

- New route surfaces: settings.search.result (immutable-ID deep link), settings.deep_link, settings.manager.open, settings.copy.apply, settings.back. See candidate-wiring-delta.json.

## DRY impact (candidate)

- Singular owners preserved (ResourceGovernor, ObservableWork, BinaryLocator, provider readiness/usage, Project identity, browser sessions, and the deferred owner modules). The shared v2 layer is headless data/semantics only; all visible presentation is concept-native. No second state owner, no universal visible renderer. See candidate-dry-delta.json.
