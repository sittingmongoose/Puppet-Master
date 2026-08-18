# Plan-owner delta — concept-07-compendium-workspace (Qwen 5.8)

Provisional concept evidence. Canon (Plans/**, inventory, schema, catalogs) is NOT modified by this work.

## Legacy `global` scope in the settings inventory → schema impact

- `Plans/settings_inventory.json` (projected verbatim into `_shared/pm-inventory-data.js`) carries legacy `scope: ["global"]` metadata on many rows (e.g. `general.visual.theme`, `safety.rules.permission-preset`).
- Product rule (packet 04 + supersessions): all editable settings apply to the current Project; no Global/Project/Goal/Host selector, no inheritance, no profiles/sync.
- Impact on schema owners: reclassify `scope` as **provenance metadata** (where the value historically lived), not an editable dimension. Candidate schema change: add `provenance.legacy_scope`; keep raw field for migration tooling only. The Lifecycle page (#/lifecycle) presents this as read-only migration history.
- Concept behavior: legacy scope is never rendered as a control anywhere in concept-07; rows show project-owned values with source chips only.

## Supersessions honored (machine_readable/supersessions.json)

- Four-concept build superseded by seven new concepts 05-11; concepts 01-04 frozen, untouched.
- Collective manager coverage superseded: this concept individually demonstrates all 42 required families (manager-coverage.json), never via shared grammar.
- Editable scopes and inheritance superseded as above.
- Search routes only by immutable result ID (data-rid -> PMSearch2.byRid), never by grouped-list position.

## Plan owners touched (candidates only)

- **Settings IA owner**: faceted compendium geometry, facet view-state (#/all?cat=...), narrow drawer transformation; candidate commands `cmd.settings.compendium.facet.set`, `cmd.settings.compendium.row.open`.
- **Provider Lifecycle owner**: provider detail tab sectioning with aliases (accounts->credentials, logs->diagnostics, catalog->models, setup->overview); Installation deferred insertion stays inside the install tab with its return contract.
- **Server Backbone**: Servers/Server Claim/Remote Access/Full Server Backup shells render owner + insertion + return contract only; no fabricated backend.
- **Project Syncing and Updates**: Sync & Move and App & Content Updates shells likewise.
- **Product Onboarding plan owner**: onboarding shell on General domain and `#/mgr/onboarding`.

## Storage keys (namespaced, demo-only)

- `pm.settings-demo2.concept-07-compendium-workspace` (PMState2). No collision with sibling concepts.
