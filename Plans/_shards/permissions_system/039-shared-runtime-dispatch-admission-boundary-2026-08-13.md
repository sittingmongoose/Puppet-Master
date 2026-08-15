# Shard 039: Shared runtime dispatch-admission boundary (2026-08-13)

Source: `Plans/Permissions_System.md`

Source lines: L9163-L9223

Source SHA256: `b12f3a9c23ddf5697455b4575a1ae8192c0b81515ae83f1e8622f82618f1fbb9`

---

## Shared runtime dispatch-admission boundary (2026-08-13)

Provider dispatch admission consumes one immutable
`permission_snapshot_record.v1:{project_id}:{snapshot_id}` by reference. It does
not reinterpret, refresh, or replace permission authority. The snapshot must be
materialized, identity-matched to the current operation/attempt, non-corrupt, and
current for the exact route, effective account, topology generation, and mutation
intent before `ProviderDispatchAdmissionService` may issue its ephemeral
`ProviderRequestPermit` / durable `ProviderDispatchAdmissionReceipt` evidence.
The receipt also binds the existing Packet Admission decision, structured
attachment-manifest hash/ref, host-local RuntimeResourceGovernor admission, and
required-present project/thread/Goal/run/node/agent lineage; these refs do not
replace permission authority.

Permission `allow` is necessary but never sufficient. Mutation-capable work must
also supply the independent FileSafe receipt refs for the exact finalized mutation
evidence. Missing, stale, corrupt, mismatched, or unmaterialized permission
evidence rejects dispatch before network transmission. A retry after any policy,
account, target, route, topology, FileSafe, or request-byte change creates a fresh
permission snapshot where required and always creates a fresh dispatch receipt.
Neither receipt may contain raw secrets, credential material, auth values, raw
request bytes, or credential-store paths.

### PS-134 - Shared Runtime Permission Snapshot Admission Join

```yaml
plan_unit_id: PS-134
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Provider dispatch admission consumes the immutable materialized permission
  snapshot by exact attempt identity and cannot issue or consume a permit when the
  snapshot is missing, corrupt, stale, mismatched, or superseded; permission allow
  remains independently co-bound with FileSafe for mutation-capable work.
gui_related: false
depends_on: [PS-132, PS-133, CV-325, SIR-009]
unblocks: []
acceptance_criteria:
  - Dispatch admission references one exact permission_snapshot_record and never reconstructs it from current Settings or UI state.
  - Every bound policy, account, route, target, topology, or request-byte change invalidates prior admission and triggers fresh evidence as applicable.
  - Permission allow cannot bypass FileSafe, auth, provider readiness, budget, storage mode, or host-local resource admission.
  - Permission and dispatch records contain refs, decisions, and hashes only and reject raw credentials, tokens, auth values, request bytes, and credential paths.
  - Attachment-manifest, Packet Admission, host-local resource admission, and run/node lineage refs are identity-matched before dispatch and cannot authorize permission reuse.
validation_surfaces:
  - future permission-snapshot and provider-dispatch join fixtures
  - future stale/missing/corrupt snapshot negative fixtures
risk_class: stale_permission_dispatch_bypass
reasoning_tier: high
context_scope: shared_runtime_permission_admission
implementation_surfaces: [Plans/Permissions_System.md, Plans/storage_value_registry.json, Plans/shared_runtime_contracts.schema.json]
node_compile_hint: {mode: shared_runtime_permission_join, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not treat a provider permit as permission authority.
  - Do not reuse a permission snapshot after its bound authority changes.
owner_hints: [Plans/Permissions_System.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-012]'
```
