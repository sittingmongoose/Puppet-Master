# Shard 029: Platform capability catalog and evaluation contract

Source: `Plans/newtools.md`

Source lines: L8748-L8754

Source SHA256: `9f698fcab6c706445f0ef32194c5399f63732355fa657b8c5b42897abc5ff779`

---

## Platform capability catalog and evaluation contract

Status: `STATICALLY_MATERIALIZED`; no runtime or validator execution is claimed.

Platform capability identity comes only from `Plans/platform_capability_catalog.json` and its closed schema. A `PlatformCapabilityRef` requires `ref_type=platform_capability_catalog_entry`, `catalog_id=pm.platform_capability_catalog`, `catalog_schema_version=1.0.0`, integer `catalog_revision>=1`, and one exact active `capability_id`. Aliases are migration-reader inputs only.

Evaluation freezes the active revision, validates evidence against the entry, rejects duplicate same-source disagreement, and selects `live_runtime_discovery`, then `provider_policy_snapshot`, then `static_platform_baseline`. Lower-precedence valid evidence remains provenance and cannot override. The v2 writer is `Plans/event_payload_platform_capability_evaluated.schema.json#`; the exact v1 object is reader-only at `#/$defs/platform_capability_evaluated_1_0_0_compatibility_reader`. Storage binding is `MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0`; unprovable migration quarantines without checkpoint advance.
