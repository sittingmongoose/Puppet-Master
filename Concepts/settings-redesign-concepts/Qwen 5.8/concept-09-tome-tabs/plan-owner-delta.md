# Plan-owner delta — concept-09-tome-tabs (Qwen 5.8)

Provisional concept evidence. Canon (Plans/**, inventory, schema, catalogs) is NOT modified by this work.

## Legacy `global` scope in the settings inventory → schema impact

- `Plans/settings_inventory.json` (projected verbatim into `_shared/pm-inventory-data.js`) carries legacy `scope: ["global"]` metadata on many rows (e.g. `general.visual.theme`, `safety.rules.permission-preset`).
- Product rule (packet 04 + supersessions): all editable settings apply to the current Project; no Global/Project/Goal/Host selector, no inheritance, no profiles/sync.
- Impact on schema owners: the `scope` field must be reclassified as **provenance metadata** (where the value historically lived) rather than an editable dimension. Candidate schema change: add `provenance.legacy_scope` and remove `scope` from any UI-facing projection; keep the raw field for migration tooling only.
- Concept behavior: the legacy scope is never rendered as a control anywhere in concept-09; rows show project-owned values with source chips (default/custom/managed/etc.) only.

## Supersessions honored (machine_readable/supersessions.json)

- Four-concept build superseded by seven new concepts 05-11; concepts 01-04 frozen, untouched by this work.
- Collective manager coverage superseded: this concept individually demonstrates all 42 required families (manager-coverage.json), never via shared grammar.
- Editable scopes and inheritance superseded as above.

## Plan owners touched (candidates only)

- **Settings IA owner**: chapter-tab geometry, stable page location (scroll memory), narrow push navigation; candidate commands `cmd.settings.chapter.push`, `cmd.settings.scrollstate.restore`.
- **Provider Lifecycle owner**: provider detail tab sectioning (overview/accounts/models/install/limits/logs); Installation deferred insertion stays inside the install tab with its return contract.
- **Server Backbone**: Servers/Server Claim/Remote Access/Full Server Backup shells render owner + insertion + return contract only; no fabricated backend.
- **Project Syncing and Updates**: Sync & Move and App & Content Updates shells likewise.
- **Product Onboarding plan owner**: onboarding shell on General chapter and `#/mgr/onboarding`.

## Storage keys (namespaced, demo-only)

- `pm.settings-demo2.concept-09-tome-tabs` (PMState2), `pm.tt9.fx` (manager fixture demo values). Neither collides with sibling concepts.
