# Shard 013: Remaining Runtime Integration Addendum - Provider CLI Lifecycle Consumer (2026-08-13)

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1641-L1811

Source SHA256: `44c3cfa5c3806c6a9ba4babf74561c51c41a1c8bc149e4cfd6f42f185adff772`

---

## Remaining Runtime Integration Addendum - Provider CLI Lifecycle Consumer (2026-08-13)

This addendum adopts provider-facade policy from the corrected Remaining Runtime Integration packet without creating a second lifecycle engine. `Plans/Shared_Integration_Runtime.md` owns `InstallationResolver`, `InstallationLifecycleManager`, `CapabilityProvisioner`, `ObservableWork`, and their generic installation/provisioning/update/repair/verification/rollback, continuation, retry/backoff/circuit, coalescing, and failure-loop state machines. This owner retains provider/bridge compatibility, authentication ownership, readiness proof, normalized failure, and route-resume policy.

### Provider CLI acquisition and runtime-demand rule

- No provider CLI is bundled in Puppet Master core, included in a default native/Server/container/WSL/Kubernetes execution baseline, pre-seeded as a PM-distributed Tool Store package, or silently acquired by Project/model/provider/Goal/Plan/WorkNode/agent/`Auto`/`On` demand.
- Initial acquisition requires an explicit user-triggered `Install` or `Setup`, an official provider installer/release artifact/package feed/documented package-manager route, and the exact selected Host/Environment. Catalog metadata or adapter capability cannot create consent.
- When a bridged-provider request has no compatible ready installation, the facade consumes `InstallationResolver.setup_required` and returns typed `provider_setup_required` with provider/route, exact `execution_host_id`, `execution_environment_id`, `topology_generation`, setup destination, requirement proof ref, originating `OperationId`, and continuation token. It must not fall back to another host, environment, provider, account, auth surface, or billing route without a separately valid resolver decision.
- `Auto` and `On` may maintain an already consented and bound provider installation under shared lifecycle policy. They are never first-acquisition consent. General `Auto | On | Off` provisioning for non-provider capabilities remains outside this provider exception and continues through the shared runtime plus the owning domain adapter.

### Separate installation, authentication, and readiness truth

The September 3 simple-provider entry requirements include Claude subscription through `claude`, Antigravity subscription through `agy`, Grok Build subscription through `grok`, and Muse Code subscription through `muse`. These name the selected external runtime required by the source, not proof of an installed or supported version. Optional external OpenCode runtime installation through `opencode` is offered only when that external runtime is actually selected and needed. Initial acquisition remains an explicit selected-Host action through an officially verified provider method, followed by installation, executable, identity, capability and route-readiness verification. A missing verified acquisition/auth/probe manifest remains unavailable or setup-required; a catalog label or this requirement must not manufacture readiness.

Cursor SDK/API-key routes, Anthropic API/cloud routes, Gemini API/Vertex, xAI API, Qwen/Alibaba Coding Plan and Token Plan, Z.AI Coding Plan, Kimi Code, OpenCode Go, OpenCode Zen, and Meta Model API do not expose provider-CLI Install merely because their internal adapter uses an SDK, bridge, or shipped runtime dependency. They use only their provider-supported sign-in or API-key flow. Preserve the Qwen/Alibaba Token Plan source requirement without asserting it is an alias of Coding Plan. Exact identity, endpoint, credentials, entitlement, supported method, and evidence are resolved by the existing provider-entry owner before a route can be enabled. These are required entry classifications, not verified current vendor offerings or a second Onboarding provider registry.

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

`Plans/provider_readiness_contracts.schema.json` closes this existing proof value and its original query binding. All ten independent observed facts retain their own owner identity and evidence: `verified`, `failed`, `unavailable`, or `not_applicable`. Verified facts require actual owner evidence; not-applicable facts require genuine applicability evidence, not missing probes. Null Installation is valid only when the actual route owner establishes that none applies; API/SDK routes never fabricate one. The genuine selected owner determines required checks, not the submitted proof. Ready requires every required fact to be verified or genuinely not applicable. Optional refused generation verification preserves the refusal and lowers confidence; unavailable Usage alone does not fail readiness unless its owner requires it. No mandatory paid probe is introduced.

The native provider owner resolves the original query, setup binding, exact route/account/product/credential compatibility, and independently issued facts. Proof identities, dispositions and evidence must equal those original sources. Historical proof remains immutable; current consumers separately revalidate route/account/installation/topology and disclosure after helpers under the existing owner fence. Credential references, schema equality or earlier authentication are not readiness authority. This finite contract adds no command, writer, storage key, account/product/credential-proof family or second readiness engine. Actual probes, authentication, source verification and dispatch remain native implementation obligations. The query/proof values are nonpersisted owner-read projections, not newly admitted physical records.

Claude CLI and Antigravity CLI OAuth/native login remain CLI-owned. PM may select an isolated supported profile root, launch the CLI-owned login, handle a protected human-only browser/device-code step, and verify identity/readiness afterward, but it must not label or copy that flow as PM-direct OAuth. PM-direct OAuth exists only for explicitly supported direct-provider clients. Provider setup manifests own exact official URLs/domains and trusted probe procedure IDs; manifests and clients cannot inject arbitrary shell commands.

Account concurrency is an applicability fact of the actual provider route, executable generation, selected profile/account and exact Host/Environment—not a consequence of displaying several account rows or setting supports_multi_account. The provider adapter discloses which of its supported native-profile, isolated-home, auth-only-profile, credential-pool or PM-managed-connection forms is actually in use and what mutable login/profile state that form shares. Those are descriptive capabilities, not a promise that every provider supports every form or new credential-store variants. Auth-only import and a pool membership do not by themselves prove isolated concurrent execution. Where the selected CLI has a single-active-login limitation or cannot establish independent runnable account state, concurrent account use is unavailable with that owner reason; switching follows the existing supported switch boundary and does not rewrite an in-flight attempt's account/profile. Shared installation identity is not shared login authority. Existing provider-specific root, native-login and OS credential-store rules remain authoritative; no retired provider route is revived.

`Plans/provider_setup_manifest_contracts.schema.json` defines the PM-owned declarative setup-method value consumed by the existing provider/auth owners. Its sixteen metadata dimensions are provider identity, setup-method identity, human label, credential owner (`cli`, `pm`, or `external_service`), account-creation destination, authorization/key-creation destination and exact domain allowlist, instructions, required scopes/organization/region, secure-input description, callback/device-code behavior, validation procedure, model-refresh procedure, Usage-refresh procedure, exact return destination, known limitations, and source/last-verification provenance. A method may explicitly mark an inapplicable destination or optional procedure null; absence never guesses a provider URL, callback, support or default. Provider identity resolves to the existing concrete provider entry, not just its family label.

The manifest contains no executable command, shell arguments, script, secret input, credential value or usable callback/dispatch token. Instructions are explanatory text, never execution input. Procedure IDs resolve only through the actual PM-owned trusted procedure registry for this exact entry, setup method, credential owner and procedure role; arbitrary IDs or caller-supplied registry contents do not grant execution. Official account/auth destinations are separately validated by their owner against the manifest's exact allowlisted hosts and verified source. Matching host strings alone are not official-source proof. Redirects, dynamically issued authorization URLs, callbacks and protected human input remain governed by the existing authentication owner and its current state/PKCE/expiry/protected-channel rules, not supplied by this manifest.

The internal consumer binding retains the original invocation, exact manifest identity/revision/hash, concrete provider entry/route, selected Host/Environment/topology, selected account/profile/connection references where applicable, current owner revision and exact return context. Null account/profile is allowed before acquisition; a nonnull reference does not establish authentication or readiness. Current owner resolution must verify supported route/method, credential ownership, real account/product compatibility and genuine independent readiness evidence when referenced; no new account/product/credential-proof family is created. Initial provider CLI acquisition still needs explicit consent; manifest selection, UI navigation and provider demand are not consent or successful setup.

After dependent resolvers return, recheck original/current binding and disclosure under the actual owner fence before use. A changed manifest, registry, route, account, topology, operation or return context rejects stale use instead of substituting the current focused selection. Historical metadata never replays login, acquisition, probes or return navigation. A successful static validation is not a dispatch permit, live provider support, authentication, ready route or successful return. Native procedure execution, official-source verification, credentials, protected channels and effects remain NOT_RUN. This value adds no public command, handler, storage family/key, independent writer or readiness authority.

`scd.provider_setup.manifest_transport.v1` classifies the decoded manifest and internal consumer binding as nonpersisted validation/transport views. Authentic PM-owned manifest publication and trusted-registry custody remain with their existing owners; the decoded view creates no new catalog row, stored credential or reusable authority. The fixture wrapper is test-only and is not a runtime record.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md#CBP-028, ContractName:Plans/Multi-Account.md#MA-012, ContractName:Plans/Multi-Account.md#MA-070, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/provider_setup_manifest_contracts.schema.json

Raw secrets never enter bridge envelopes, argv, logs, receipts, Project Sync, prompts, seglog, or redb. PM-owned secret material is referenced only through an OS credential-store handle. A CLI-owned profile is represented by a non-secret, host-local `profile_ref`; it is not a PM secret-store reference and its OAuth material is not copied. SQLite is forbidden.

### Post-consent lifecycle and provider-specific failure proof

Once explicit acquisition is proven, the shared lifecycle owner may update, repair, verify, activate, or roll back the exact installation. The provider facade supplies compatibility range, provider-native doctor/health, auth identity, product/entitlement, model catalog, adapter protocol, required capability, and optional generation checks. Installer exit zero or a changed version string is not provider readiness proof. After activation or rollback, every dependent profile/account/connection/model route is revalidated; the update target remains the installation, never an account row.

Provider-specific lifecycle failures normalize to stable classes including `installation_owner_unknown`, `wrong_install_target`, `duplicate_path_shadow`, `binary_launch_failed`, `doctor_or_health_failed`, `auth_identity_changed`, `product_or_entitlement_failed`, `model_discovery_failed`, `adapter_incompatible`, `required_capability_failed`, `generation_verification_failed`, `known_bad_version`, `rollback_unsupported`, and `rollback_failed`. The facade attaches the exact provider/route/install/profile/account/connection evidence needed for diagnosis and emits a deterministic provider failure fingerprint. `InstallationLifecycleManager` decides retry budget, backoff, circuit state, cooldown, coalescing, and unchanged-failure suppression; `ObservableWork` projects the truthful wait and outcome. An unchanged failed automatic attempt must not be repeated or re-notified indefinitely; relevant state change, explicit user retry, or a policy-approved cooldown expiry is required.

Provider-update remediation preserves the failed operation's exact installation, Host/Environment, original failure fingerprint and current lifecycle-policy generation. These are action meanings consumed through the existing lifecycle, policy, diagnostics and selection owners, not new public command IDs or permission grants:

| Recovery choice | Owner effect and applicability |
|---|---|
| Retry | Explicitly request another bounded attempt of the failed owner operation after fresh availability, ownership and permission checks; never bypass a circuit, repeat an unknown effect, or silently change its target. |
| Repair | Request a separately reviewed, ownership-compatible repair plan when supported. An update grant or a successful check is not repair authority. |
| Manual instructions | Open provider/installation-owner instructions and exact failure details; explanatory text is not executable input or proof of repair. |
| Snooze | Defer eligible repeat remediation notifications until the user's selected expiry through the existing notification owner. It does not retry, change installation policy, erase the failure, or hide required approval/security state. No default duration is introduced. |
| Stop checking | Set the exact installation's existing automatic check policy to disabled (including startup checks), using the current shared preference owner. Manual checks remain available; this is not merely Do not notify and does not change PM's app-updater policy. |
| Keep current | Decline the proposed replacement and retain the last verified current activation. Do not pretend that the failed candidate passed, rewrite in-flight generations, or silently change the saved checking/notification policy. If no verified current activation exists, disclose that absence rather than offering a fictitious working fallback. |
| Pin | Request an explicit selected-version constraint from the installation lifecycle policy owner, distinct from Keep current and from disabling checks. Preserve the selected version and target; do not infer Latest, grant acquisition, or override compatibility/security/ownership restrictions. Until that owner's exact pin policy writer/contract is admitted, show its unsupported/unavailable reason instead of persisting a new provider-local preference. |
| Logs | Open bounded, redacted evidence for the original failure/operation with freshness and source references; opening logs causes no retry or policy mutation. |
| Installation selection | Use the existing cmd.installation.select for an already discovered, verified, compatible installation under current inventory/installation/topology generations. It neither acquires nor authenticates and never silently resumes the failed update. |

Only applicable choices are available; unsupported repair/rollback/pin or stale target evidence carries the actual owner reason. Recovery labels do not restore retired default update modes: Shared Integration Runtime section 4.7 remains the authority for the September 9 update choices, ownership/delegation and independent routine-notification preference. Native dispatch, an unbound pin writer and physical policy custody are not proved by this mapping.

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
  - Account concurrency follows proven route/profile/Host isolation; auth-only import, credential pools and multiple visible rows never prove concurrent runnable account state or erase single-active-login limits.
  - Post-consent activation or rollback revalidates every dependent route while preserving in-flight installation-generation truth.
  - Failure classes and fingerprints are typed; unchanged automatic failures are suppressed by shared-runtime loop policy.
  - Recovery choices bind the original failure and exact installation; Stop checking uses the current shared disabled policy, Keep current preserves verified activation without rewriting preferences, and Pin stays unavailable until its exact owner contract is admitted.
  - Retry, Repair, Manual instructions, Snooze, Logs and installation selection preserve their distinct effects and actual authority; none grants acquisition, hides a failed candidate or silently resumes an update.
  - Secret material is represented only by OS credential-store handles or non-secret CLI profile refs and never enters runtime/storage evidence.
  - Native, WSL distribution, container, Kubernetes, and remote provider state is keyed by exact Host/Environment, and SQLite remains forbidden.
  - Source-required external runtime mappings retain Claude subscription to claude, Antigravity subscription to agy, Grok Build subscription to grok, Muse Code subscription to muse, and conditional optional external OpenCode runtime to opencode; acquisition is explicit and exact-Host, never inferred from catalog presence.
  - Cursor SDK/API-key, Anthropic API/cloud, Gemini API/Vertex, xAI API, Qwen/Alibaba Coding Plan and Token Plan, Z.AI Coding Plan, Kimi Code, OpenCode Go, OpenCode Zen, and Meta Model API routes expose no provider-CLI Install merely for an SDK/bridge/shipped dependency. Token Plan is not silently collapsed into Coding Plan.
  - A named required route with missing verified acquisition/auth/probe evidence remains unavailable or setup-required, not ready; product retention does not invent provider IDs, endpoints, supported methods, entitlement or live integration facts.
  - A setup manifest retains all sixteen source metadata dimensions, names only trusted owner-resolved procedure IDs, and cannot inject executable commands or raw secrets.
  - Exact manifest/entry/method/credential/route/account/Host/currentness/return bindings are resolved by existing owners; unresolved, unsupported or stale values never become setup authority or readiness.
validation_surfaces:
  - bounded markdown/YAML structure check for CBP-028
  - Plans/provider_setup_manifest_contracts.schema.json
  - Plans/provider_setup_manifest_contract_fixtures.json
  - tests/test_pm_provider_setup_manifest.py
  - Plans/provider_readiness_contracts.schema.json
  - Plans/provider_readiness_contract_fixtures.json
  - tests/test_pm_provider_readiness.py
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
  - PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/03_SIMPLE_PROVIDER_SETUP_AFTER_PROJECT.md:40-78
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
