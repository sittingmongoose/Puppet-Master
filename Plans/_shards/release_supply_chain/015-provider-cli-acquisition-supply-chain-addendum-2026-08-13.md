# Shard 015: Provider CLI Acquisition Supply-Chain Addendum - 2026-08-13

Source: `Plans/Release_Supply_Chain.md`

Source lines: L819-L948

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## Provider CLI Acquisition Supply-Chain Addendum - 2026-08-13

This addendum adopts the corrected provider-CLI adjudication at the release/supply-chain boundary. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `ObservableWork`, and generic installation/provisioning/update/repair/verification/rollback, continuation, retry/backoff/circuit, coalescing, and failure-loop state. Release Supply Chain retains source, publisher, signature/hash, license, architecture, version/channel, compatibility, SBOM/provenance, known-bad quarantine, and receipt-admission policy.

### Provider CLI distribution and acquisition policy

- Provider CLIs are not Puppet Master core artifacts, default native/Server/container/WSL/Kubernetes baseline artifacts, or pre-seeded PM-distributed Tool Store packages. Project/model/provider/Goal/Plan/WorkNode/agent demand and non-provider `Auto`/`On` provisioning cannot authorize first acquisition.
- Initial acquisition requires explicit user-triggered `Install`/`Setup`, an official provider installer, official release artifact, official package feed, or provider-documented package-manager route, and the exact selected Host/Environment. A download cache, catalog row, package-owner adapter, or lifecycle procedure is not an official source or user consent by itself.
- Normal supply-chain handling must not mirror, repackage, redistribute, or baseline a provider CLI. A future exception requires a named user-approved decision for one exact provider CLI/platform/source after redistribution, license, provenance, security, size, update, removal, and support review.
- After explicit acquisition and binding, Puppet Master may perform proven update, repair, verification, activation, and rollback for the exact installation under shared lifecycle policy. This permission does not retroactively authorize bundling or first acquisition.
- General `Auto | On | Off` acquisition classes remain valid for approved non-provider capabilities and PM-owned runtime artifacts. They do not weaken the provider-CLI exception.

### Typed supply-chain proof

Every provider-CLI acquisition, update, repair download, rollback artifact, or adoption into PM management carries `ProviderCliSupplyChainProof`:

```text
proof_id
operation_id
attempt_id
installation_id
installation_generation?
provider_id
provider_cli_product
host_environment_ref
execution_host_id
execution_environment_id
topology_generation
official_source_kind
official_source_ref
publisher_identity
package_or_artifact_identity
manager_or_installer_identity
version
channel
target_os
target_architecture
artifact_sha256
signature_or_attestation_ref?
trust_root_ref?
notarization_ref?
sbom_ref?
license_ref
redistribution_disposition
compatibility_manifest_ref
known_bad_check_ref
download_receipt_ref
verification_receipt_ref?
rollback_artifact_proof_ref?
observed_at
```

`operation_id` and `attempt_id` are the canonical Shared Integration Runtime `OperationId` and `AttemptId`; `host_environment_ref`, when retained for compatibility, must resolve to canonical `ExecutionHostId`, `ExecutionEnvironmentId`, and `TopologyGeneration`. `redistribution_disposition` is `official_source_only | named_exception_approved | redistribution_forbidden | unknown_blocked`; `unknown_blocked` and `redistribution_forbidden` cannot enter a PM baseline, mirror, repackage, or cached redistribution path. Missing, stale, mismatched, or unverifiable mandatory evidence fails closed. Installer exit zero, version output, or an artifact checksum alone does not prove a healthy provider route; provider-specific executable/auth/account/product/model/adapter/capability verification remains with provider owners and is linked by `verification_receipt_ref`.

Immutable signed Server/container images remain unchanged during provider setup or maintenance. A consented mutable provider CLI is installed in a persistent Tool Store/managed environment/task runner and its CLI-owned profile in a persistent provider-profile volume. WSL state remains local to the selected distribution. Container proof binds Server/Execution Host, runtime, instance/service, image digest, and persistent-volume identity. Kubernetes proof binds cluster/context, namespace, workload/pod/container as applicable, image digest, and persistent-volume identity. Native Windows/macOS/Linux, WSL distributions, Apple Linux containers, standalone Server, Docker/TrueNAS/Unraid Server, Kubernetes Server, and SSH Execution Hosts never share supply-chain proof merely because an artifact hash or provider version matches.

Supply-chain failure classes include `official_source_unverified`, `publisher_unverified`, `signature_or_attestation_invalid`, `hash_mismatch`, `license_unknown`, `redistribution_not_authorized`, `architecture_mismatch`, `channel_mismatch`, `compatibility_rejected`, `known_bad_version`, `download_integrity_failed`, `rollback_artifact_missing`, and `host_environment_mismatch`. Each failure records the proof fields available, evidence refs, exact Host/Environment, and deterministic `failure_fingerprint`. Release Supply Chain owns failure meaning and quarantine evidence; `InstallationLifecycleManager` owns automatic retry budget, backoff, circuit state, cooldown/coalescing, and unchanged-failure suppression, while `ObservableWork` owns truthful wait and outcome projection. No supply-chain proof or receipt contains a raw credential, token, cookie, or secret path. Canonical storage remains seglog + redb + Tantivy; SQLite is forbidden.

### Conflict record and precedence

- `RSC-003` and `RSC-006` use broad “downloadable binary/plugin” and “packaged helper/CLI/runtime” wording that could be read as authority for Puppet Master to package provider CLIs. Resolution: those units govern PM-distributed artifacts and verification of externally acquired artifacts; they do not authorize provider-CLI bundling, baseline inclusion, mirroring, repackaging, redistribution, or pre-seeding.
- Historical provider packet clauses permitting provider-CLI baseline/pre-distribution or catalog/adapter-selected acquisition classes conflict with the direct provider decision. Packet-root `PROVIDER_CLI_FINAL_ADJUDICATION.md` supersedes those clauses; post-consent update/repair/rollback and proof-based lifecycle material remains adopted.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Shared_Integration_Runtime.md#8.2, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, SchemaID:pm.shared_runtime.contracts.v1, SchemaID:spec_lock

### RSC-010 - Provider CLI Official-Source And Post-Consent Supply-Chain Gate

```yaml
plan_unit_id: RSC-010
unit_type: schema_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Provider CLIs are excluded from Puppet Master core/default baselines and pre-seeded distribution. Explicit first
  acquisition uses an official source for one exact Host/Environment and carries typed publisher, package, hash,
  signature/attestation, license, architecture, channel, compatibility, and known-bad proof. Proven post-consent update,
  repair, verification, activation, and rollback are allowed through Shared Integration Runtime.
gui_related: false
gui_classification_reason: This unit owns supply-chain admission evidence and distribution policy; GUI owners only project its outcomes.
depends_on: [SIR-002, SIR-003, SIR-006, SIR-011, RSC-003, RSC-006, RSC-007, RSC-008, BS-028, CBP-028]
unblocks: []
acceptance_criteria:
  - Provider CLIs are absent from PM core/default baseline and pre-seed manifests unless a named exact exception is approved.
  - Initial acquisition proves explicit consent, official source, and exact Host/Environment before download or mutation.
  - ProviderCliSupplyChainProof fails closed on missing/stale/mismatched mandatory source, publisher, hash, license, architecture, channel, compatibility, or known-bad evidence.
  - Post-consent operations link shared lifecycle and provider verification receipts without treating exit zero, version text, or checksum alone as route readiness.
  - Signed immutable container images are not mutated; mutable provider installations and profiles persist outside replaceable images.
  - Native, WSL distribution, container, Kubernetes, and remote proofs retain exact execution identity.
  - Typed failure fingerprints feed shared retry suppression and known-bad quarantine without exposing secrets or using SQLite.
validation_surfaces:
  - bounded markdown/YAML structure check for RSC-010
  - future official-source, signature/hash, license, architecture, compatibility, and known-bad fixtures
  - future negative baseline/pre-seed/mirror/repackage and immutable-image fixtures
  - future exact Host/Environment supply-chain proof fixtures
risk_class: provider_cli_supply_chain_distribution_drift
reasoning_tier: high
context_scope: provider_cli_supply_chain
implementation_surfaces:
  - Plans/Release_Supply_Chain.md
  - future release/supply-chain receipt contracts
node_compile_hint:
  mode: provider_cli_official_source_post_consent_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-008
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-009
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-010
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-023
preserved_exact_tokens:
  - "official provider/package source"
  - "not PM core/default baseline"
  - "not pre-seeded Tool Store"
  - "exact Host/Environment"
  - "ProviderCliSupplyChainProof"
  - "post-consent lifecycle management"
negative_constraints:
  - Do not bundle, baseline, pre-seed, mirror, repackage, or redistribute a provider CLI without a named exact exception.
  - Do not mutate a signed immutable container image for provider setup or maintenance.
  - Do not accept exit zero, version text, checksum alone, raw secrets, or SQLite as sufficient lifecycle evidence or storage.
owner_hints:
  - Plans/Release_Supply_Chain.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```
