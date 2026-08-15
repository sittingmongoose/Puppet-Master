# Shard 020: Remaining Runtime Integration Addendum - Provider Installation Discovery (2026-08-13)

Source: `Plans/BinaryLocator_Spec.md`

Source lines: L1835-L1955

Source SHA256: `68378275f233e682c37ebbeb405a91ea064046815bf2454781f7589caba3304b`

---

## Remaining Runtime Integration Addendum - Provider Installation Discovery (2026-08-13)

This addendum defines BinaryLocator's discovery contribution to `SIR-002`, `SIR-003`, and `SIR-011` from the corrected Remaining Runtime Integration packet. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, their generic state machines, and shared retry/backoff/circuit/failure-loop behavior. BinaryLocator remains a discovery/validation producer and does not install, authenticate, update, repair, roll back, provision, select the effective installation, or decide whether an acquisition is authorized.

### Canonical provider-CLI discovery boundary

- A provider CLI is never part of Puppet Master core, a default native/Server/container/WSL/Kubernetes execution baseline, or a pre-seeded PM Tool Store. A missing CLI must not cause BinaryLocator, Project/model/Goal/Plan/WorkNode/agent demand, or non-provider `Auto`/`On` policy to acquire it silently.
- Initial provider-CLI acquisition requires an explicit user-triggered `Install` or `Setup`, the provider's official installer/release artifact/package feed/documented package-manager route, and the exact selected Host/Environment. BinaryLocator may discover an existing compatible installation before setup, but discovery is not consent.
- After explicit acquisition and binding, the shared lifecycle owner may update, repair, verify, activate, or roll back that exact installation under policy. BinaryLocator contributes fresh discovery and validation proof; it does not own the transaction.
- General `Auto | On | Off` capability provisioning remains valid for approved **non-provider** tools such as LSP, DAP, formatter, test, media, emulator, Docker/Podman/Kubernetes, Helm, and similar capabilities through their domain adapters. It never changes the provider-CLI first-acquisition rule.

### Bounded inventory and typed proof

Within the existing explicit probe layers, BinaryLocator must inventory every plausible candidate instead of discarding later candidates after the first valid hit. `BinaryInventoryResult` is the canonical lifecycle-facing result and contains ordered `BinaryCandidateProof[]`; the legacy single-result `BinaryLocateResult` remains a compatibility projection derived from the same inventory by the existing deterministic first-valid rule.

Each `BinaryCandidateProof` records:

```text
provider_cli
host_environment_ref
execution_host_id
execution_environment_id
topology_generation
configured_command?
path_candidate
launcher_or_shim_chain[]
symlink_chain[]
resolved_path
real_path
file_identity
artifact_hash?
architecture
version?
release_channel?
publisher_or_signature_evidence_ref?
package_or_native_owner_evidence_ref?
package_or_formula_identity?
manager_root_or_profile?
source_layer
probe_trace_ref
ownership_confidence = proven | strongly_identified | probable | ambiguous | unknown
validation_state = valid | invalid | unavailable
failure_code?
failure_fingerprint?
observed_at
```

Package databases and provider-native metadata for the exact resolved file outrank package/path layout heuristics. A bare command, path shape, or provider name never proves npm, Homebrew, or any other owner. `ambiguous` requires user disambiguation; `unknown` is manual-only. Duplicate and shadowed installations remain distinct evidence rows and a stable selected `installation_id` must not move merely because PATH order changes.

The compatibility shorthand `host_environment_ref`, when present, must resolve to canonical `ExecutionHostId`, `ExecutionEnvironmentId`, and `TopologyGeneration` from Shared Integration Runtime. Windows Native and each WSL2 distribution are distinct. A WSL proof retains its parent Windows host plus distribution identity. A container proof retains the Server/Execution Host, container runtime and instance/service identity, image digest, and persistent Tool Store identity. A Kubernetes proof retains cluster/context, namespace, workload/pod/container identity as applicable, image digest, and persistent Tool Store identity. Native macOS/Linux, Apple Linux containers, standalone Server, Docker/TrueNAS/Unraid Server, Kubernetes Server, and SSH Execution Hosts must not share discovery or cache identities merely because paths or binary names match.

Discovery failures are typed as `not_found | override_missing | override_invalid | owner_unknown | owner_ambiguous | duplicate_shadow | wrong_architecture | version_incompatible | launch_failed | permission_denied | timeout_killed | malformed_version | environment_unreachable`. A failure proof includes `failure_code`, `execution_host_id`, `execution_environment_id`, `topology_generation`, candidate/real-path evidence when known, `probe_trace_ref`, `observed_at`, and a deterministic `failure_fingerprint`. BinaryLocator may invalidate a cache when relevant discovery evidence changes; only `InstallationResolver` / `InstallationLifecycleManager` may select, cool down, retry, coalesce, or suppress repeated lifecycle operations. No discovery proof, cache, trace, or failure record may contain a raw credential, token, cookie, or secret path. Canonical storage remains seglog + redb + Tantivy; SQLite is forbidden.

### Conflict record

- Existing `BinaryLocateResult` and the earlier first-valid requirement expose one candidate, while corrected packet items `PROV-004`, `PROV-005`, and `PROV-007` require a complete bounded candidate inventory and proof-based owner classification. Resolution: preserve the old single-result shape only as a deterministic compatibility projection over `BinaryInventoryResult`; lifecycle consumers use the inventory and must not infer that unreported later candidates do not exist.
- Older provider-CLI packet clauses permitting core/default-baseline eligibility, pre-seeding, catalog-selected redistribution, or silent first acquisition are superseded by packet-root `PROVIDER_CLI_FINAL_ADJUDICATION.md`. A future exception is valid only when a named user-approved decision identifies one exact provider CLI/platform/source after license, redistribution, provenance, security, size, update, removal, and support review.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Release_Supply_Chain.md, PolicyRule:no_secrets_in_storage, SchemaID:pm.shared_runtime.contracts.v1, SchemaID:spec_lock

### BS-028 - Provider Installation Discovery Proof And Acquisition Guard

```yaml
plan_unit_id: BS-028
unit_type: schema_contract
status: accepted
owner_doc: Plans/BinaryLocator_Spec.md
canonical_text: >-
  BinaryLocator emits a complete bounded BinaryInventoryResult with typed candidate, exact Host/Environment,
  path-chain, validation, ownership-confidence, duplicate/shadow, and failure proof. The legacy first-valid
  BinaryLocateResult is only a deterministic compatibility projection. Provider CLI discovery never authorizes
  core/default-baseline/pre-seed/silent acquisition; post-consent lifecycle work belongs to Shared Integration Runtime.
gui_related: false
gui_classification_reason: This unit owns backend discovery evidence and acquisition authority boundaries, not GUI presentation.
depends_on: [SIR-002, SIR-003, SIR-011, BS-002, BS-008, BS-009, BS-015, BS-016, BS-017, BS-018]
unblocks: []
acceptance_criteria:
  - Bounded probes inventory all plausible candidates while the compatibility result still follows the deterministic first-valid rule.
  - Ownership is evidence-ranked; ambiguous candidates require disambiguation and unknown owners are manual-only.
  - Provider CLI NotFound never triggers core/default-baseline/pre-seed/silent installation, including from Auto or On demand.
  - Every candidate and failure proof identifies the exact native, WSL distribution, container, Kubernetes, or remote Host/Environment.
  - Discovery failures carry stable typed codes and fingerprints while selection and retry/backoff/circuit/coalescing remain InstallationResolver and InstallationLifecycleManager policy.
  - Traces, proofs, and caches contain no raw secret material and introduce no SQLite dependency.
validation_surfaces:
  - bounded markdown/YAML structure check for BS-028
  - future BinaryInventoryResult positive, duplicate, ambiguous-owner, host-identity, and failure-proof fixtures
  - future negative fixture proving provider demand cannot invoke first acquisition
risk_class: provider_installation_discovery_authority_drift
reasoning_tier: high
context_scope: provider_installation_discovery
implementation_surfaces:
  - Plans/BinaryLocator_Spec.md
  - future BinaryLocator discovery contracts
node_compile_hint:
  mode: provider_installation_discovery_proof
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-004
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-005
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-007
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-008
preserved_exact_tokens:
  - "not bundled in Puppet Master core"
  - "not pre-seeded"
  - "exact Host/Environment"
  - "BinaryInventoryResult"
  - "BinaryCandidateProof"
  - "unknown"
  - "manual-only"
negative_constraints:
  - Do not make BinaryLocator an installer, authentication broker, updater, repairer, rollback manager, or provisioning authority.
  - Do not infer package ownership from a bare command or path shape.
  - Do not introduce SQLite or raw secret material.
owner_hints:
  - Plans/BinaryLocator_Spec.md
  - Plans/Shared_Integration_Runtime.md
```
