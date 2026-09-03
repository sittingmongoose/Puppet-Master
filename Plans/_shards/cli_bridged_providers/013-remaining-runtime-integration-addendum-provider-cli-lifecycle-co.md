# Shard 013: Remaining Runtime Integration Addendum - Provider CLI Lifecycle Consumer (2026-08-13)

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1641-L1758

Source SHA256: `53d1d3779e9c3f41567c015b7e879c5d021cc372a690db9bfeb6813495145459`

---

## Remaining Runtime Integration Addendum - Provider CLI Lifecycle Consumer (2026-08-13)

This addendum adopts provider-facade policy from the corrected Remaining Runtime Integration packet without creating a second lifecycle engine. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `ObservableWork`, and their generic installation/provisioning/update/repair/verification/rollback, continuation, retry/backoff/circuit, coalescing, and failure-loop state machines. This owner retains provider/bridge compatibility, authentication ownership, readiness proof, normalized failure, and route-resume policy.

### Provider CLI acquisition and runtime-demand rule

- No provider CLI is bundled in Puppet Master core, included in a default native/Server/container/WSL/Kubernetes execution baseline, pre-seeded as a PM-distributed Tool Store package, or silently acquired by Project/model/provider/Goal/Plan/WorkNode/agent/`Auto`/`On` demand.
- Initial acquisition requires an explicit user-triggered `Install` or `Setup`, an official provider installer/release artifact/package feed/documented package-manager route, and the exact selected Host/Environment. Catalog metadata or adapter capability cannot create consent.
- When a bridged-provider request has no compatible ready installation, the facade consumes `InstallationResolver.setup_required` and returns typed `provider_setup_required` with provider/route, exact `execution_host_id`, `execution_environment_id`, `topology_generation`, setup destination, requirement proof ref, originating `OperationId`, and continuation token. It must not fall back to another host, environment, provider, account, auth surface, or billing route without a separately valid resolver decision.
- `Auto` and `On` may maintain an already consented and bound provider installation under shared lifecycle policy. They are never first-acquisition consent. General `Auto | On | Off` provisioning for non-provider capabilities remains outside this provider exception and continues through the shared runtime plus the owning domain adapter.

### Separate installation, authentication, and readiness truth

The facade must preserve these independent provider facts for the selected installation/profile/route:

```text
installation_state
executable_health
authentication_state
account_identity_state
product_or_entitlement_state
model_catalog_state
adapter_handshake_state
required_capability_state
generation_verification_state
usage_telemetry_state
```

`installed`, `executable_healthy`, `authenticated`, and `ready` are not aliases. Authentication success alone cannot produce provider readiness. Usage telemetry may be unavailable while the route is otherwise ready. An optional model-backed generation check is a separately attributed validation-purpose Usage event; if policy, cost, privacy, or quota prevents it, the readiness proof records the lower confidence rather than fabricating success.

`ProviderReadinessProof` carries `provider_id`, `provider_route_id`, `installation_id`, `installation_generation`, `execution_host_id`, `execution_environment_id`, `topology_generation`, `profile_ref?`, `account_id?`, `connection_id?`, product/entitlement and catalog refs, adapter/capability probe refs, generation proof/refusal reason, Usage availability, required-check set, observed facts, `readiness_state`, `readiness_confidence`, `failure_class?`, `failure_evidence_refs[]`, and `observed_at`. A bridge attempt freezes the effective installation generation and profile/account/connection identity; activation of a later generation never rewrites in-flight or historical truth.

Claude CLI and Antigravity CLI OAuth/native login remain CLI-owned. PM may select an isolated supported profile root, launch the CLI-owned login, handle a protected human-only browser/device-code step, and verify identity/readiness afterward, but it must not label or copy that flow as PM-direct OAuth. PM-direct OAuth exists only for explicitly supported direct-provider clients. Provider setup manifests own exact official URLs/domains and trusted probe procedure IDs; manifests and clients cannot inject arbitrary shell commands.

Raw secrets never enter bridge envelopes, argv, logs, receipts, Project Sync, prompts, seglog, or redb. PM-owned secret material is referenced only through an OS credential-store handle. A CLI-owned profile is represented by a non-secret, host-local `profile_ref`; it is not a PM secret-store reference and its OAuth material is not copied. SQLite is forbidden.

### Post-consent lifecycle and provider-specific failure proof

Once explicit acquisition is proven, the shared lifecycle owner may update, repair, verify, activate, or roll back the exact installation. The provider facade supplies compatibility range, provider-native doctor/health, auth identity, product/entitlement, model catalog, adapter protocol, required capability, and optional generation checks. Installer exit zero or a changed version string is not provider readiness proof. After activation or rollback, every dependent profile/account/connection/model route is revalidated; the update target remains the installation, never an account row.

Provider-specific lifecycle failures normalize to stable classes including `installation_owner_unknown`, `wrong_install_target`, `duplicate_path_shadow`, `binary_launch_failed`, `doctor_or_health_failed`, `auth_identity_changed`, `product_or_entitlement_failed`, `model_discovery_failed`, `adapter_incompatible`, `required_capability_failed`, `generation_verification_failed`, `known_bad_version`, `rollback_unsupported`, and `rollback_failed`. The facade attaches the exact provider/route/install/profile/account/connection evidence needed for diagnosis and emits a deterministic provider failure fingerprint. `InstallationLifecycleManager` decides retry budget, backoff, circuit state, cooldown, coalescing, and unchanged-failure suppression; `ObservableWork` projects the truthful wait and outcome. An unchanged failed automatic attempt must not be repeated or re-notified indefinitely; relevant state change, explicit user retry, or a policy-approved cooldown expiry is required.

### Exact Host/Environment identity

Provider installation, CLI-owned profile, bridge process, readiness proof, and continuation token are local to one exact Host/Environment identity. Windows Native is distinct from each WSL2 distribution. Container identities retain Server/Execution Host, runtime, instance/service, image digest, and persistent Tool Store/profile volume identity. Kubernetes identities retain cluster/context, namespace, workload/pod/container as applicable, image digest, and persistent Tool Store/profile volume identity. Native macOS/Linux, Apple Linux containers, standalone Server, Docker/TrueNAS/Unraid Server, Kubernetes Server, and SSH Execution Hosts never share readiness merely because provider, account label, path, or model name matches.

### Conflict record

- Historical provider-CLI packet clauses permitting default-baseline inclusion, pre-distribution, mirroring/repackaging, or catalog/adapter-selected first acquisition conflict with the direct provider-specific decision. Packet-root `PROVIDER_CLI_FINAL_ADJUDICATION.md` supersedes only those permissive clauses; the shared post-consent lifecycle, exact-host, auth/readiness-separation, and proof requirements remain adopted.
- Existing bridge readiness language can be read as auth/protocol success being enough. This addendum makes the required fact set and `ProviderReadinessProof` authoritative for bridged routes; missing required evidence yields not-ready or lower-confidence state, not inferred readiness.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Shared_Integration_Runtime.md#8.2, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Release_Supply_Chain.md, PolicyRule:no_secrets_in_storage, SchemaID:pm.shared_runtime.contracts.v1, SchemaID:spec_lock

### CBP-028 - Provider CLI Consent Auth And Readiness Integration

```yaml
plan_unit_id: CBP-028
unit_type: schema_contract
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: >-
  CLI/provider bridges consume Shared Integration Runtime lifecycle state machines while retaining provider acquisition,
  authentication ownership, compatibility, readiness, and normalized failure policy. Initial provider CLI acquisition is
  explicit, official-source, and exact-Host/Environment only; installation, authentication, and route readiness remain
  separate; post-consent lifecycle management is allowed only against the proven bound installation.
gui_related: true
gui_classification_reason: Provider Setup Required, authentication ownership, readiness state, recovery, and continuation consequences are user-visible provider setup behavior.
depends_on: [SIR-002, SIR-003, SIR-006, SIR-009, SIR-011, CBP-008, CBP-011, CBP-012, CBP-014, CBP-020, CBP-021, CBP-024, CBP-026, BS-028]
unblocks: []
acceptance_criteria:
  - Missing provider CLI demand returns typed provider_setup_required with exact Host/Environment and continuation evidence and never silently installs or cross-routes.
  - ProviderReadinessProof keeps installation, executable, auth, account, entitlement, model, adapter, capability, generation, and Usage facts independent.
  - Claude CLI and Antigravity CLI auth remain CLI-owned; PM-direct OAuth is not fabricated.
  - Post-consent activation or rollback revalidates every dependent route while preserving in-flight installation-generation truth.
  - Failure classes and fingerprints are typed; unchanged automatic failures are suppressed by shared-runtime loop policy.
  - Secret material is represented only by OS credential-store handles or non-secret CLI profile refs and never enters runtime/storage evidence.
  - Native, WSL distribution, container, Kubernetes, and remote provider state is keyed by exact Host/Environment, and SQLite remains forbidden.
validation_surfaces:
  - bounded markdown/YAML structure check for CBP-028
  - future provider_setup_required and stale-continuation fixtures
  - future installation-auth-readiness separation fixtures
  - future post-update dependent-route revalidation and failure-loop fixtures
risk_class: provider_cli_consent_readiness_lifecycle_drift
reasoning_tier: high
context_scope: provider_cli_lifecycle_consumer
implementation_surfaces:
  - Plans/CLI_Bridged_Providers.md
  - future bridged-provider adapter contracts
node_compile_hint:
  mode: provider_cli_consent_auth_readiness_integration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_PROVIDER_UPDATE_SOURCE_REVIEW.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-008
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-009
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-010
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-012
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-013
preserved_exact_tokens:
  - "provider_setup_required"
  - "official provider/package source"
  - "exact Host/Environment"
  - "ProviderReadinessProof"
  - "installation and authentication remain separate"
  - "post-consent lifecycle management"
negative_constraints:
  - Do not bundle, baseline, pre-seed, mirror/repackage by default, or silently acquire a provider CLI.
  - Do not treat installation, authentication, version output, installer exit zero, or Usage availability as provider readiness by itself.
  - Do not duplicate Shared Integration Runtime state machines or store raw secrets.
owner_hints:
  - Plans/CLI_Bridged_Providers.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Multi-Account.md
```
