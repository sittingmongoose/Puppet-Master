# Shard 024: Retained PKT-04 Candidate Inventory (Deferred, Non-Emitting, Non-Canonical)

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1129-L1234

Source SHA256: `68f490730360190a462e589a2e83adc0276929bc4a170d5a69b7be7d9f502852`

---

## Retained PKT-04 Candidate Inventory (Deferred, Non-Emitting, Non-Canonical)

Every name below is retained exactly as packet inventory with `canonical=false`, `registered=false`, `emits_eventrecord=false`, `disposition=deferred_non_emitting_event_candidate`, and reason `event_authority_and_native_producer_contract_absent`. Retention does not add an EventRecord family, registry entry, producer, handler, or runtime proof.

- Installation: `installation.discovered`, `installation.selected`, `installation.ownership_proven`, `installation.ambiguous`, `installation.install_requested`, `installation.download_started`, `installation.staged`, `installation.verified`, `installation.activated`, `installation.update_available`, `installation.update_deferred`, `installation.update_started`, `installation.update_completed`, `installation.repair_started`, `installation.repair_completed`, `installation.rollback_started`, `installation.rollback_completed`, `installation.recovery_required`, `installation.external_change_detected`.
- Connection: `integration.connection.added`, `integration.connection.tested`, `integration.connection.updated`, `integration.connection.removed`, `integration.connection.degraded`.
- Capability: `capability.requirement.detected`, `capability.provisioning_started`, `capability.ready`, `capability.blocked`, `capability.continuation_rejected`.

Adjacent installation command candidates are also retained without admission:

| Exact candidate | Disposition | Reason |
|---|---|---|
| `cmd.installation.install` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.update` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.repair` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.rollback` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.verify` | `existing_canonical_outside_select_contract` | Existing lifecycle command; not redefined by installation-select closure. |
| `cmd.installation.rescan` | `deferred_noncanonical_candidate` | Owner contract, central registration, native route, and runtime evidence are absent. |
| `cmd.installation.check_updates` | `deferred_noncanonical_candidate` | Owner contract, central registration, native route, and runtime evidence are absent. |
| `cmd.installation.remove` | `deferred_noncanonical_candidate` | Destructive ownership/data-disposition contract and native route are absent. |
| `cmd.installation.open_logs` | `deferred_noncanonical_candidate` | Bounded redacted projection contract and native route are absent. |
| `cmd.installation.update_policy.set` | `deferred_noncanonical_candidate` | Policy owner, permission, and persistence contract are absent. |
| `cmd.installation.attach_external` | `deferred_noncanonical_candidate` | External ownership/provenance binding contract and native route are absent. |
| `cmd.installation.detach_external` | `deferred_noncanonical_candidate` | External ownership/data-disposition contract and native route are absent. |
| `cmd.installation.open_details` | `deferred_noncanonical_candidate` | Bounded redacted projection contract and native route are absent. |

For the six closed commands, every result now settles the initiating return context. A successful connection test must return non-null probe evidence, and a successful selected installation must return non-null activation proof while echoing its continuation and caller settlement. These are static result obligations; no provider probe, focus restoration, installation activation, or continuation execution is claimed.

### SIR-021 - Installation Ownership Maintenance Coalescing Persistence And Credential Attachments

```yaml
plan_unit_id: SIR-021
unit_type: requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Externally and package-manager managed installations default to check-and-notify; Puppet Master may mutate them only
  under a current explicit ownership-compatible action or delegation. Identical provisioning or update requests across
  Projects and Clients coalesce at the logical installation-operation layer only when every effect, target, artifact,
  authority, and policy fingerprint matches; one attempt fans out separately current results without sharing caller
  authority, and conflicting requests never coalesce. The PM Tool Store and isolated profiles use explicit durable
  roots that survive image and pod replacement and require reconciliation before readiness. Shared Runtime consumes
  rather than redefines the common AuthenticationProfile and CredentialAttachment contract, carrying broker refs only
  and enforcing exact provider, Host, Environment, repository, operation/capability, expiry, revocation, and
  owner-generation attenuation.
gui_related: true
gui_classification_reason: Ownership, check/update state, shared work, persistence, and credential attachment health are visible setup state.
depends_on: [SIR-003, SIR-004, SIR-006, SIR-007, SIR-011, SIR-020, MA-045]
unblocks: [SCS-007]
acceptance_criteria:
  - IRT-008 makes external and package-manager ownership check-and-notify by default; automatic PM maintenance, Auto/On, demand, successful discovery, and baseline presence cannot mutate without a current explicit action or reviewed delegation.
  - IRT-008 positive fixtures separate PM-managed automatic maintenance, external notification, one-operation consent, and delegated maintenance; negatives reject automatic download/package-manager/configuration/activation/removal and unknown-owner mutation.
  - IRT-009 coalesces one identical provisioning/update attempt across Projects/Clients only when operation kind, desired effect, product/package/version/channel, source/provenance/artifact, exact Host/Environment, ownership/delegation generation, and policy generation match.
  - IRT-009 preserves per-waiter permission, approval, continuation, cancellation, currentness, and result; negatives vary each fingerprint/authority dimension, cancel one of two waiters, and submit conflicting install/update/remove states to prove no authority or cancellation fanout.
  - IRT-010 keeps Tool Store and isolated-profile roots on declared durable volumes across image and pod replacement, with product/profile isolation and restart/reconciliation receipts before readiness.
  - IRT-010 positive fixtures replace an image and a pod while retaining verified tool/profile generations; negatives cover missing/wrong/stale mount, corrupt or partial root, cross-profile home reuse, silent reacquisition, and raw secret material.
  - IRT-011 consumes the common AuthenticationProfile/CredentialAttachment contract and attaches only non-secret refs under exact provider/Host/Environment/repository/operation-capability scopes, expiry, revocation, owner generation, and broker enforcement.
  - IRT-011 negatives reject raw secret fields, expired/revoked/stale refs, provider/profile mismatch, Host/Environment/repository mismatch, operation/capability widening, and treating profile attachment as authentication/readiness proof.
  - Static schema/fixture success does not prove package-manager behavior, acquisition, update, persistence across replacement, broker isolation, or runtime recovery.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, focused Egolite remediation validator, future ownership-maintenance positive/negative fixtures, future multi-Project/multi-Client coalescing matrix, future image/pod replacement recovery matrix, future broker attenuation and secret-isolation tests]
risk_class: installation_ownership_mutation_or_persistence_secret_failure
reasoning_tier: high
context_scope: integration_installation_and_credential_closure
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Multi-Account_Connection_Spec.md, future InstallationLifecycleManager and CapabilityProvisioner, future credential-attachment enforcement]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-008, source_ref:egolite-requirement:IRT-009, source_ref:egolite-requirement:IRT-010, source_ref:egolite-requirement:IRT-011]
preserved_exact_tokens: [check-and-notify, coalesce identical provisioning/update operations, Tool Store, isolated profiles, image replacement, pod replacement, AuthenticationProfile, CredentialAttachment]
negative_constraints:
  - Do not mutate an externally managed installation under an automatic PM maintenance policy.
  - Do not use StreamCoalescer, equal display text, or partial fingerprints as installation-operation deduplication authority.
  - Do not claim readiness after image/pod replacement until exact durable-root reconciliation succeeds.
  - Do not re-own AuthenticationProfile lifecycle, provider authentication policy, or credential custody.
  - Do not persist raw credential material in Tool Store, profiles, attachments, records, or receipts.
```

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#4.7, ContractName:Plans/Shared_Integration_Runtime.md#4.8, ContractName:Plans/Shared_Integration_Runtime.md#4.9, ContractName:Plans/Shared_Integration_Runtime.md#4.10, ContractName:Plans/Multi-Account_Connection_Spec.md

### SIR-023 - Human Step Projection Consumption

```yaml
plan_unit_id: SIR-023
unit_type: consumer_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ObservableWork consumes the owner-authored HumanStepProjection without re-owning Browser or test semantics. It
  preserves stable step identity/revision, bounded user_step_label/detail, requested/effective state, freshness,
  owner receipt refs, and terminal disposition so Chat, Testing, Watch, and timeline projections reconcile the same
  step. Labels remain secret/path/raw-ID/code-free and grant no authority.
gui_related: true
depends_on: [SIR-007, SIR-015, SMPFS-154]
unblocks: []
acceptance_criteria:
  - All five projections retain one stable step identity and revision rather than copying unrelated prose.
  - Stale or missing owner evidence is visible and cannot become a completed step.
  - Client focus, attachment, disconnect, or projection suppression does not cancel server-owned work.
  - Static fixtures do not prove producer emission or consumer rendering.
validation_surfaces: [Plans/egolite_retained_requirement_contracts.schema.json, Plans/egolite_retained_requirement_contract_fixtures.json, focused Egolite remediation validator]
risk_class: human_step_projection_divergence
reasoning_tier: high
context_scope: observable_human_step_projection
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ObservableWork projector]
node_compile_hint: {mode: shared_runtime_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-013]
negative_constraints: [Do not re-own Browser or test outcomes., Do not use human copy as payload or authority.]
```
