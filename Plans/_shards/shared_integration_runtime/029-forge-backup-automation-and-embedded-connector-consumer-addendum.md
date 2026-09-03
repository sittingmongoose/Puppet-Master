# Shard 029: Forge, Backup, Automation, And Embedded-Connector Consumer Addendum - 2026-09-01

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1661-L1789

Source SHA256: `f88fb4ba43e4f4ebe35d05fbcca41c262ca95ad1aff4b2ab2c7f8dfac59c2058`

---

## Forge, Backup, Automation, And Embedded-Connector Consumer Addendum - 2026-09-01

Shared Integration Runtime remains the sole owner of the durable command outbox, host-local `RuntimeResourceGovernor`, `ObservableWork`, `LeaseCoordinator`, shared authentication/profile references, and exact-return continuation primitives. Forgejo, Gitea, the provider-neutral `repository_automation` shell, Backup destinations, and the embedded Go tsnet connector consume those primitives by reference. Their semantic owners retain provider capability, `AutomationBinding`, Backup scheduling/crypto/repository behavior, and connector identity/process/IPC state. No peer shared supervisor, auth broker, scheduler, updater, or provider capability pool is created here.

`Plans/shared_integration_runtime.schema.json#/$defs/SharedIntegrationConsumerProjection` carries only owner refs, current generations, shared-primitive refs, and truthful availability. `handler_unavailable` and `read_only` never authorize mutation; `protected` requires a human-only handoff. A Gitea or Forgejo API limit does not erase an independently ready Git transport. `repository_automation` requires its own `automation_binding_ref` and never inherits automation authority from a repository `ForgeBinding`. A Backup destination carries an exact destination/profile/continuation ref without making Shared Integration Runtime the Backup owner. The embedded connector carries one Remote-Access-owned `connector_identity_ref` per PM Server; it is never Project-, WSL-, runner-, replica-, or Client-scoped, and its secret state never enters this projection.

Every projection is receipt/projection-only, event-silent, and marked `runtime_evidence_claimed=false`. Static schema acceptance does not establish a native handler, provider call, cloud account, OAuth registration, connector process, network route, secret-isolation result, or runtime success.

### SIR-032 - Post-Integration Shared Consumer Boundary

```yaml
plan_unit_id: SIR-032
unit_type: integration_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Forgejo, Gitea, repository_automation, Backup destinations, and the embedded Go tsnet connector consume the one shared outbox, governor, ObservableWork, lease, authentication-profile/credential-attachment, and exact-return primitives through owner references. Provider, automation, Backup, and connector semantics remain with their named owners; handler_unavailable, read_only, and protected states fail closed and static projections claim no runtime evidence.
gui_related: true
gui_classification_reason: Settings, Actions & Pipelines, Data Backup and Retention, Remote Access, Onboarding, and Doctor render these exact unavailable, read-only, and protected states.
depends_on: [SIR-005, SIR-006, SIR-007, SIR-008, SIR-011, SIR-012, SIR-031]
unblocks: []
acceptance_criteria:
  - Forgejo and Gitea remain distinct provider identities while consuming one shared authentication/profile and connection lifecycle.
  - repository_automation requires an independent AutomationBinding and never derives automation authority from ForgeBinding or the selected shell.
  - Backup consumes outbox, governor, ObservableWork, lease, and exact auth continuation refs without transferring scheduler, crypto, repository, restore, or destination ownership.
  - The embedded connector carries exactly one Remote-Access-owned connector identity per PM Server and never a Project/WSL/environment/runner/replica/session identity.
  - handler_unavailable and read_only projections have mutation_dispatch_allowed=false; protected projections require the human-only boundary and expose no protected content to agents or adapters.
  - All records use receipt_projection_only_no_unregistered_eventrecord and runtime_evidence_claimed=false.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: shared_consumer_owner_drift_or_false_availability
reasoning_tier: high
context_scope: forge_backup_automation_connector_shared_consumption
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json]
node_compile_hint: {mode: static_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/01_AUTHORITY_SCOPE_AND_PRESERVATION.md:55-63
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:31-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/15_DRY_WIRING_AND_PLAN_OWNERS.md:7-45
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md:8-19
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md:113-127
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md:66-78
preserved_exact_tokens: [Forgejo, Gitea, repository_automation, AutomationBinding, handler_unavailable, read_only, protected, AuthBrowserSession, pm-tailnet-connector]
negative_constraints:
  - Do not create a peer shared supervisor, governor, ObservableWork system, auth broker, Backup scheduler, connector owner, or provider capability owner.
  - Do not infer Git transport availability from hosting API availability or automation authority from repository hosting.
  - Do not expose connector state, credentials, auth URLs/codes, protected content, or raw provider errors.
  - Do not claim native/runtime/provider/network/security evidence from static contracts or fixtures.
```

### SIR-033 - Post-Integration Auth Candidate Normalization

```yaml
plan_unit_id: SIR-033
unit_type: compatibility_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Post-integration packet candidates cmd.auth_session.resume, cmd.auth_session.submit_code, and cmd.credential.add normalize before permission and dispatch to cmd.authentication.resume, cmd.auth_profile.submit_code, and cmd.credential_source.add respectively. The source spellings are unregistered compatibility inputs with no peer handler, availability, persistence, EventRecord, secret payload, or protected-browser authority.
gui_related: false
gui_classification_reason: This is pre-dispatch identity normalization and owner routing, not GUI implementation.
depends_on: [SIR-028, SIR-031]
unblocks: []
acceptance_criteria:
  - The expansion sidecar contains exactly 36 approved aliases and 94 total rows while retaining 44 canonical commands and 14 typed local actions.
  - Each of the three source tokens normalizes to one exact existing owner command before permission, availability, validation, dispatch, receipt, event, or persistence handling.
  - cmd.auth_profile.verify and cmd.auth_profile.sign_out remain exact Multi-Account owner commands and are not duplicated or aliased here.
  - AuthBrowserSession content and raw submitted code/credential material are absent from alias records and unavailable to agents and adapters.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: duplicate_auth_handler_or_secret_bearing_alias
reasoning_tier: high
context_scope: post_integration_auth_candidate_reconciliation
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json]
node_compile_hint: {mode: compatibility_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/coverage_verification.md:84-93
preserved_exact_tokens: [cmd.auth_session.resume, cmd.auth_session.submit_code, cmd.credential.add, cmd.authentication.resume, cmd.auth_profile.submit_code, cmd.credential_source.add]
negative_constraints:
  - Do not register any source alias or create a peer handler, availability row, persistence identity, or EventRecord.
  - Do not carry raw codes, tokens, credentials, URLs, cookies, or protected AuthBrowserSession content through normalization.
```

### SIR-034 - Backup Shared Primitives And Common External-Effect Envelope

```yaml
plan_unit_id: SIR-034
unit_type: integration_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  BackupCoordinator and RestoreCoordinator consume, without re-owning, the one durable command outbox, host-local RuntimeResourceGovernor, ObservableWork, LeaseCoordinator, AuthenticationBroker/CredentialBroker, protected human session, and exact-return continuation. Every external-effect request carries common non-secret operation/request, actor/Client, Home Server, Project, repository/source-location/checkout/Host/Environment, instance/connection/profile, expected revision/capability revision, idempotency, and optional Goal/Plan/thread refs when applicable. The host revalidates context and leases. Outcomes are accepted, running, outcome_unknown, observed_complete, failed, partial, or cancelled; read-only observations carry revision/freshness and never claim current state from stale cache. Recovery credentials, OAuth codes/tokens, browser content, and connector secrets use separate protected channels.
gui_related: true
gui_classification_reason: Durable progress, retries, rate/cost deferral, protected handoff, exact return, stale/read-only state, and external-effect outcomes are visible across Backup, Settings, Doctor, and recovery surfaces.
depends_on: [SIR-005, SIR-006, SIR-007, SIR-011, SIR-012, SIR-032, BRS-017, BRS-019]
unblocks: []
acceptance_criteria:
  - Backup consumes the shared outbox, governor, ObservableWork, leases, auth/profile/credential attachments, protected browser/human boundary, and exact-return refs; it creates no peer implementation.
  - RuntimeResourceGovernor accounts capture, compression, encryption, hashing, IO, network, staging, uploads, retries, and process leases while reserving interactive, approval, and recovery capacity.
  - Per-repository mutation and maintenance authority is serialized; restart reconciliation reads persisted intent/phase before effects, and stale locks require proven ownership or explicit recovery override rather than reachability guesses.
  - The non-secret common envelope binds every applicable identity/currentness/idempotency field and forbids raw secrets, arbitrary parameter bags, foreign paths, or stale-cache freshness claims.
  - External-effect receipts distinguish accepted, running, outcome_unknown, observed_complete, failed, partial, and cancelled; receipt/projection truth remains event-silent with "expected_event_types=[]" unless Event Authority admits a family.
  - Source/integration DRY components remain RepositoryContextHeader, CapabilityAction, RevisionBadge, ReviewRequestList, NativeJobTree, StreamingLogView, ArtifactProvenanceRow, and SetupReturnContext; Backup DRY components remain owned by BRS-019 and are only referenced here.
  - Static schema/fixtures retain handler_unavailable and runtime_evidence_claimed=false; PROC-001/PROC-002, native handlers, provider calls, resource behavior, release proof, and GUI execution remain unproved.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/BackupSharedRuntimeConsumptionRecord, Plans/shared_integration_runtime_expansion_fixtures.json, python3 scripts/pm-new-contracts-verify.py]
risk_class: shared_runtime_duplication_or_external_effect_ambiguity
reasoning_tier: high
context_scope: backup_shared_primitives_and_common_envelope
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json]
node_compile_hint: {mode: static_shared_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTO-002
  - source_ref:packet:2026-09-01:AUTO-006
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-002
  - source_ref:packet:2026-09-01:OWN-001-OWN-002
  - source_ref:packet:2026-09-01:OWN-005-OWN-006
  - source_ref:packet:2026-09-01:PROC-001-PROC-002
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.4
preserved_exact_tokens: [RuntimeResourceGovernor, ObservableWork, LeaseCoordinator, AuthenticationBroker, CredentialBroker, accepted, running, outcome_unknown, observed_complete, failed, partial, cancelled, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not create a Backup-specific governor, work system, lease service, auth broker, credential broker, protected browser, outbox, or common command envelope.
  - Do not put Recovery Keys, OAuth codes/tokens, credentials, browser content, connector state, raw provider errors, or foreign absolute paths into the ordinary envelope.
  - Do not claim currentness from stale cache or completion from request acceptance, Client reconnect, process memory, schema acceptance, or target strings.
  - Do not claim PROC-001/PROC-002 execution, runtime, release, provider, native GUI, security, performance, or readiness evidence.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Backup_Restore_System.md, Plans/Contracts_V0.md, Plans/Permissions_System.md]
```
