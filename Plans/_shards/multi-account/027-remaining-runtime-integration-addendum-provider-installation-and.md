# Shard 027: Remaining Runtime Integration Addendum - Provider Installation And Credential Custody (2026-08-13)

Source: `Plans/Multi-Account.md`

Source lines: L5170-L5291

Source SHA256: `d2a7eb5beb660e11a81cd2336f1430121ced46fcd02ea15970a91be3e4b9391a`

---

## Remaining Runtime Integration Addendum - Provider Installation And Credential Custody (2026-08-13)

This addendum adopts the corrected provider lifecycle adjudication while preserving Multi-Account ownership of provider/account/profile/connection/product identity and authentication/readiness policy. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `ProviderDispatchAdmissionService`, and generic lifecycle/retry/backoff/circuit/failure-loop state. Multi-Account does not create parallel lifecycle state or a second secret store.

### Identity and acquisition boundary

The canonical hierarchy is:

```text
Provider family
  Account/Profile
    Connection
      Product/Entitlement
        Models/Capabilities

Exact Host/Environment
  ProviderInstallation
```

`ProviderInstallation` is a separate host/environment-local resource, not an account row. Many profiles/accounts/connections may depend on one installation; one account may have distinct connections with different auth, billing, region, or entitlement truth. Updating an account is not meaningful: post-consent lifecycle work targets one proven installation and then revalidates all dependent profiles/accounts/connections/model routes.

No provider CLI is bundled in Puppet Master core, included in a default native/Server/container/WSL/Kubernetes execution baseline, pre-seeded, or silently acquired by Project/model/provider/Goal/Plan/WorkNode/agent/`Auto`/`On` demand. Initial provider-CLI acquisition is explicit user `Install`/`Setup`, official-source-based, and bound to the exact selected Host/Environment. A provider/account setup row may route to that flow and resume from a continuation token; it is not installation consent by being visible, enabled, preferred, required, or selected. Post-consent update, repair, verification, activation, and rollback are allowed through the shared lifecycle owner.

Non-provider `Auto | On | Off` capability provisioning remains valid through Shared Integration Runtime and the owning domain adapter. It must not be modeled as an account setting or reused as provider-CLI first-acquisition authority.

### Installation, authentication, and readiness separation

Each account/profile projection references an `installation_binding_ref?` plus canonical `ExecutionHostId`, `ExecutionEnvironmentId`, and `TopologyGeneration`, and preserves independent facts for installation, executable health, authentication, account identity, product/entitlement, model catalog, adapter handshake, required capabilities, generation verification, and Usage availability. `installed`, `authenticated`, and `ready` are distinct. Usage may be unavailable while the route is ready. A shared installation update does not rewrite account identity or historical requested/effective snapshots.

CLI-owned OAuth profiles, including Claude CLI and Antigravity CLI, remain provider-owned, host-local profile resources. PM may keep a non-secret `profile_ref`, launch native login, and verify the resulting account/product/models/readiness, but it does not copy or relabel the CLI's raw OAuth token as PM-direct OAuth. Direct-provider OAuth remains limited to explicitly supported PM clients and stays a distinct connection/auth surface.

### OS credential-store-only secret references

For live canonical behavior, `credential_ref` means only a non-secret handle to an OS-native credential store: macOS Keychain, Windows Credential Manager, or Linux Secret Service. The canonical prefix remains `os_keychain:` for cross-platform plan vocabulary. Raw API keys, refresh tokens, access tokens, cookies, and provider secrets never enter project config, profile projections, filesystem credential blobs, redb, seglog, Tantivy, logs, receipts, prompts, or Project Sync. Short-lived access tokens may exist only in bounded process memory under the authentication owner.

`env`, `file`, and `cli` are not secret-store variants of `credential_ref`:

- an environment variable may be an external input/source observation, but it is not persisted as a credential reference or silently imported; explicit adoption stores supported PM-owned secret material in the OS credential store;
- a file path may identify provider-owned profile/config source evidence, but it cannot become a PM raw-secret or encrypted-secret-blob store;
- a CLI-managed login uses a non-secret `profile_ref`/delegation descriptor, not `credential_ref`, and the CLI retains custody of its own token material.

Token/account metadata may be stored under canonical storage owners, but `encrypted_blob_ref` cannot resolve to a PM filesystem token blob. It may only refer to an OS credential-store item or non-secret receipt/metadata. There is no SQLite-backed account, token, profile, onboarding, or lifecycle database.

### Exact Host/Environment and failure truth

Installation bindings and CLI-owned profiles are keyed by exact Host/Environment. Windows Native and each WSL2 distribution are separate identities and credential/profile scopes. Container bindings retain Server/Execution Host, runtime, instance/service, image digest, persistent Tool Store, and profile-volume identity. Kubernetes bindings retain cluster/context, namespace, workload/pod/container as applicable, image digest, persistent Tool Store, and profile-volume identity. Native macOS/Linux, Apple Linux containers, standalone Server, Docker/TrueNAS/Unraid Server, Kubernetes Server, and SSH Execution Hosts cannot reuse account readiness merely because the provider-native identity or profile label matches.

Account/auth/readiness failures carry typed `failure_class`, `failure_evidence_refs[]`, `credential_route_epoch_id`, `installation_id?`, `installation_generation?`, `execution_host_id`, `execution_environment_id`, `topology_generation`, `profile_ref?`, `account_id?`, `connection_id?`, and deterministic `failure_fingerprint`. Multi-Account retains auth/account/entitlement failure meaning; `InstallationLifecycleManager` owns repeated-operation retry budget, backoff, circuit state, cooldown, coalescing, and unchanged-failure suppression. A failed install/auth/readiness attempt must not silently rotate to another account, auth surface, provider, billing route, host, or environment when the request is required-bound or recovery is explicit.

### Conflict record and precedence

- Section 4.2 and `MA-014` list `env`, `file`, and `cli` as supported `credential_ref` stores, while `MA-046` and `MA-047` require the OS credential store. Resolution: for live canonical behavior, this addendum supersedes the secret-custody portions of section 4.2 and `MA-014`; `env`/`file`/`cli` examples remain compatibility/source-lineage only and are replaced by external-source, non-secret profile, or delegation references as described above.
- `MA-054` describes an in-process/file-locked per-account token store and `MA-068` permits `encrypted_blob_ref` plus temp-file/fsync/rename token writes. Those secret-blob portions conflict with OS credential-store-only custody. Resolution: retain their account ordering, health, route-epoch, lock/lease, and metadata intent, but supersede any raw/encrypted filesystem token payload. Secrets remain OS-store-only or CLI-owned outside PM custody; access tokens are memory-only.
- Older provider-CLI material permitting default-baseline inclusion, pre-seeding, or catalog/adapter-selected first acquisition is superseded by packet-root `PROVIDER_CLI_FINAL_ADJUDICATION.md`. No implicit account/profile setting creates the named exception that adjudication requires.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md#3, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Shared_Integration_Runtime.md#11, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Release_Supply_Chain.md, PolicyRule:no_secrets_in_storage, SchemaID:pm.shared_runtime.contracts.v1, SchemaID:spec_lock

### MA-070 - Provider Installation Binding And OS Credential Custody

```yaml
plan_unit_id: MA-070
unit_type: schema_contract
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  ProviderInstallation is an exact-Host/Environment resource separate from account/profile/connection/product/model
  identity. Provider CLI acquisition is explicit and official-source-only; post-consent lifecycle work targets the proven
  installation and revalidates dependents. Live credential_ref values point only to OS credential-store items, while
  CLI-owned auth uses non-secret profile refs and installation, authentication, and readiness remain separate.
gui_related: true
gui_classification_reason: Account/profile setup, installation binding, authentication ownership, readiness, and recovery states are visible in provider settings and setup flows.
depends_on: [SIR-002, SIR-003, SIR-009, SIR-011, MA-013, MA-014, MA-015, MA-040, MA-045, MA-046, MA-047, MA-054, MA-067, MA-068, CBP-028, BS-028]
unblocks: []
acceptance_criteria:
  - Account/profile/connection identities reference but never become ProviderInstallation identity.
  - Provider CLI setup requires explicit consent, official source, and exact Host/Environment; Auto and On do not authorize first acquisition.
  - Installation, executable health, auth, account, entitlement, model, adapter, capability, generation, and Usage states remain independent.
  - Live credential_ref values are OS credential-store handles only; env/file/cli secret-store variants and filesystem token blobs are compatibility-only and superseded.
  - CLI-owned OAuth uses a non-secret host-local profile_ref and PM never copies the raw CLI token.
  - Shared installation activation or rollback revalidates all dependent routes without rewriting historical requested/effective identity.
  - Typed failure evidence preserves exact native, WSL distribution, container, Kubernetes, or remote Host/Environment and cannot silently cross-route required-bound recovery.
  - No SQLite or raw secret payload is introduced.
validation_surfaces:
  - bounded markdown/YAML structure check for MA-070
  - future OS credential-store-only schema and negative secret-spill fixtures
  - future shared-installation/multiple-account revalidation fixtures
  - future WSL/container/Kubernetes identity-isolation fixtures
risk_class: provider_account_installation_secret_custody_drift
reasoning_tier: high
context_scope: provider_account_installation_auth
implementation_surfaces:
  - Plans/Multi-Account.md
  - future provider account/profile and credential-reference contracts
node_compile_hint:
  mode: provider_installation_binding_os_secret_custody
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/PROVIDER_CLI_FINAL_ADJUDICATION.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/PROVIDER_IDENTIFICATION_INSTALLATION_AUTH_UPDATE_HANDOFF.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-001
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-013
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-014
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-016
preserved_exact_tokens:
  - "ProviderInstallation"
  - "installation and authentication remain separate"
  - "os_keychain"
  - "credential_ref"
  - "profile_ref"
  - "exact Host/Environment"
negative_constraints:
  - Do not store provider secrets in env/file/cli credential_ref variants, filesystem blobs, redb, seglog, Tantivy, logs, receipts, prompts, or Project Sync.
  - Do not make an account row the installation lifecycle target.
  - Do not silently acquire a provider CLI or cross account/auth/provider/host boundaries during required-bound recovery.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/CLI_Bridged_Providers.md
```
