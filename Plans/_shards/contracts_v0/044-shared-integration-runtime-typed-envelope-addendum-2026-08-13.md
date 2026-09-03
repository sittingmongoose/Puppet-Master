# Shard 044: Shared Integration Runtime typed-envelope addendum (2026-08-13)

Source: `Plans/Contracts_V0.md`

Source lines: L20976-L21107

Source SHA256: `a3be47f5e955848bc80a0e5e520138bac0c9a225986aba2f30e79c0b74641810`

---

## Shared Integration Runtime typed-envelope addendum (2026-08-13)

`Plans/shared_runtime_contracts.schema.json` is the sole closed schema bundle for
shared-runtime values owned by `Plans/Shared_Integration_Runtime.md`. The root
union materializes only the owner-closed envelopes for runtime topology,
installation lifecycle, environment connection, independent domain sync,
host-local resource admission, ObservableWork, operational awareness, bounded
prompt runtime projection, immutable permission snapshots, and provider dispatch
admission evidence. A value
definition marked `blocked_pending_owner_adjudication` is an identity/reference
skeleton only: it is not storage materialization, runtime readiness, or authority
to invent a missing lifecycle enum.

`ProviderRequestPermit` is the ephemeral decision name for the same logical,
single-use object whose sole durable evidence is
`ProviderDispatchAdmissionReceipt`. It is not a second type family. The receipt
binds one provider-request attempt to the immutable finalized request SHA-256,
the structured attachment-manifest SHA-256 and artifact ref, PromptCapsule and
ContextEpoch, the existing Packet Admission decision ref, host-local
RuntimeResourceGovernor admission ref, route/model, requested/effective account
refs, project/thread/Goal/run/node/agent lineage, applicable Host/Environment,
topology and policy generations, the immutable permission snapshot, independent
FileSafe receipt refs for mutation-capable work, issuance, expiry, and atomic
consumption evidence. It contains no raw prompt/request/attachment bytes and no
secret material. Each
network retry receives a fresh receipt even if the bytes are unchanged. A byte,
route, model, account, permission, topology, policy-generation, or required
FileSafe-evidence change invalidates the prior permit before network send.

The storage owner now materializes exactly one
`provider_dispatch_admission_receipt` row and promotes the existing
`permission_snapshot_record` declaration in the 59-family registry. Both inline
schemas are deterministic copies of this bundle's closed definitions and are
checked by `scripts/pm-shared-runtime-storage-materialize.py`; the registry does
not create a second schema owner. Permission evidence is non-rebuildable authority
retained indefinitely. Dispatch evidence is non-rebuildable run evidence retained
for at least 365 days and under any stronger hold. This storage closure does not
authorize provider network dispatch while Event Authority, PNC-019, buildability,
or the executable runtime remains blocked.

Shared-runtime values may carry prospective source-event references, but this
addendum creates no EventRecord producer, payload schema, event-family row, or
emission authority. Event Authority must admit each producer family separately.

Portable Draft 2020-12 constraints close required/null fields, provider CLI
acquisition-basis branches, terminal-time presence, waiting-work evidence, and
permission decision consistency. `scripts/pm-shared-runtime-contracts.py` is the
companion semantic validator for ordered timestamps, completed-versus-total
progress, non-admitted resource reasons/reevaluation, dispatch issue-expiry-
consumption order, and secret/local-path-shaped ref rejection. Passing either
layer alone is insufficient, and neither is runtime evidence.

### CV-324 - Shared Runtime Closed Typed Envelope Catalog

```yaml
plan_unit_id: CV-324
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  pm.shared_runtime.contracts.v1 closes only the shared-runtime envelopes whose
  owner fields and enum sets are settled; unresolved outbox, replay, lease,
  Debug/Eval, conditional-rule, installation-inventory, capability, and BSD
  details remain blocked_pending_owner_adjudication and cannot be treated as
  implementation-ready contracts.
gui_related: false
depends_on: [SIR-001, SIR-011, CV-309]
unblocks: []
acceptance_criteria:
  - The standalone schema is Draft 2020-12, closed, JSON-valid, and uses the owner document's exact settled state tokens.
  - Every blocked definition is excluded from the materialized root union and names its owner-adjudication gap.
  - No shared-runtime EventRecord family is registered or inferred by this schema.
validation_surfaces:
  - python3 -m json.tool Plans/shared_runtime_contracts.schema.json
  - python3 scripts/pm-shared-runtime-contracts.py --self-test
  - python3 -m unittest tests/test_shared_runtime_storage_contracts.py
risk_class: invented_runtime_contract
reasoning_tier: high
context_scope: shared_runtime_typed_envelopes
implementation_surfaces: [Plans/Contracts_V0.md, Plans/shared_runtime_contracts.schema.json]
node_compile_hint: {mode: shared_runtime_contract_catalog, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not widen a blocked field to an unconstrained lifecycle string.
  - Do not register events before individual Event Authority admission.
owner_hints: [Plans/Contracts_V0.md, Plans/Shared_Integration_Runtime.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/08_GUI_PLAN_COMMAND_WIRING_DRY_SCHEMA_EVENTS.md#gui-projections
  - 'Plans/runtime_integration_disposition.json#items[PROV-004,PROV-005,PROV-007,PROV-009,PROV-010,PROV-012,PROV-023,PROV-024,CTX-020,AGT-014,AGT-016,AGT-020,PRM-010,PRM-011,PRM-012,PRM-016,PRM-017,PRM-018,PRM-019,PRM-020,PRM-022]'
```

### CV-325 - Provider Permit And Durable Admission Receipt Identity

```yaml
plan_unit_id: CV-325
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  ProviderRequestPermit is the ephemeral name for the same single-use logical
  decision evidenced durably by ProviderDispatchAdmissionReceipt; only the receipt
  is a storage family, it binds immutable finalized request bytes by SHA-256 and
  independent Permissions/FileSafe evidence, and it is invalid before network send
  after any bound identity, generation, route, account, or byte change.
gui_related: false
depends_on: [CV-324, SIR-009, PS-132]
unblocks: []
acceptance_criteria:
  - No PacketAdmissionReceipt, FileSafeGuardReceipt, ImmutableDispatchIntent, second permit family, or adapter-issued permit exists.
  - Mutation-capable receipts require at least one existing FileSafe receipt ref and every receipt requires an immutable permission snapshot ID.
  - Raw provider request bytes and secrets are schema-forbidden; only the exact SHA-256 and non-secret refs persist.
  - The receipt requires the structured attachment-manifest hash/ref, existing Packet Admission decision ref, host-local resource-admission ref, and required-present nullable run/node lineage.
  - Every retry uses a fresh provider_request_attempt_id and receipt_id and consumption is atomic, idempotent, short-lived, and pre-network.
  - The registry materializes exactly one provider_dispatch_admission_receipt row and one permission_snapshot_record row from this bundle, while runtime use remains independently gated by Event Authority, PNC-019, and buildability.
validation_surfaces:
  - provider dispatch no-bypass and immutable-byte fixtures
  - secret-bearing receipt rejection fixtures
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
risk_class: provider_dispatch_authority_bypass
reasoning_tier: high
context_scope: provider_dispatch_admission_evidence
implementation_surfaces: [Plans/Contracts_V0.md, Plans/shared_runtime_contracts.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: provider_dispatch_admission_contract, create_worknodes: false, create_nodeseeds: false}
negative_constraints:
  - Do not persist ProviderRequestPermit as a second family.
  - Do not let dispatch admission replace authentication, budget, Permissions, FileSafe, or readiness policy.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Contracts_V0.md]
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - 'Plans/runtime_integration_disposition.json#items[PRM-012]'
```
