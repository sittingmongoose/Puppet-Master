# Shard 029: Platform capability catalog and evaluation contract

Source: `Plans/newtools.md`

Source lines: L8672-L8678

Source SHA256: `936a666d10339c5958b6ecc5d65cd1cf5818e5e1b4728daaba5b2f65cc184390`

---

## Platform capability catalog and evaluation contract

Status: `STATICALLY_MATERIALIZED`; no runtime or validator execution is claimed.

Platform capability identity comes only from `Plans/platform_capability_catalog.json` and its closed schema. A `PlatformCapabilityRef` requires `ref_type=platform_capability_catalog_entry`, `catalog_id=pm.platform_capability_catalog`, `catalog_schema_version=1.0.0`, integer `catalog_revision>=1`, and one exact active `capability_id`. Aliases are migration-reader inputs only.

Evaluation freezes the active revision, validates evidence against the entry, rejects duplicate same-source disagreement, and selects `live_runtime_discovery`, then `provider_policy_snapshot`, then `static_platform_baseline`. Lower-precedence valid evidence remains provenance and cannot override. The v2 writer is `Plans/event_payload_platform_capability_evaluated.schema.json#`; the exact v1 object is reader-only at `#/$defs/platform_capability_evaluated_1_0_0_compatibility_reader`. Storage binding is `MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0`; unprovable migration quarantines without checkpoint advance.
