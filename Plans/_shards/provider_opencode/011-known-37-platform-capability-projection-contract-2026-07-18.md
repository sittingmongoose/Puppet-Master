# Shard 011: Known-37 platform-capability projection contract - 2026-07-18

Source: `Plans/Provider_OpenCode.md`

Source lines: L349-L355

Source SHA256: `8629de0b0a491c725a7fe023e1456ca34da1cd408ce530a7fee43fe6afe864ac`

---

## Known-37 platform-capability projection contract - 2026-07-18

OpenCode is a consumer of the platform-capability manager; it does not mint capability identity or reinterpret provider/model capability state as the event state. New evaluation uses an immutable `PlatformCapabilityRef` from the one active revision of `Plans/platform_capability_catalog.json`. The exact requested states are `required | preferred | not_requested`; the exact effective states are `available | degraded | unavailable | not_evaluated`. OpenCode must preserve both requested and effective values and the complete selected/lower-precedence provenance in the persisted `platform.capability_evaluated` event.

Evidence selection is deterministic: `live_runtime_discovery` precedes `provider_policy_snapshot`, which precedes `static_platform_baseline`. Valid lower-precedence disagreement is retained as provenance but cannot override the selected source. `available` requires selected `supports_available`; `degraded` requires selected `supports_degraded` and its exact reason/source pair; `unavailable` requires explicit selected `supports_unavailable`; `not_requested` alone yields `not_evaluated` with no evidence. Missing, stale, mutable, secret-bearing, wrong-owner, wrong-subject, same-precedence-conflicting, unknown, or catalog-unresolved evidence quarantines without checkpoint advance. It never becomes `unavailable`, a dynamic catalog entry, or a fallback success.

The catalog identity is `(pm.platform_capability_catalog, catalog_revision, capability_id)`, not a display label or legacy key. The frozen event payload is resolved against that immutable revision during replay and is never recomputed from current OpenCode discovery, current provider policy, or current UI selection. The adjacent Models `capability_state` vocabulary is not copied into this event; provider-policy evidence must be owner-normalized to the exact three evidence findings first.
