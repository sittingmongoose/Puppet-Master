# GitLab Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes common forge contracts from `Plans/Forge_Integrations.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for GitLab provider variants, namespace/repository binding, Merge Request behavior, approvals/threads/versions, pipelines/jobs, account/scope mapping, self-managed/Dedicated support gating, and GitLab-specific degradation.

## 0. Scope

GitLab is exactly `forge_provider=gitlab` with provider variants `gitlab_com`, `gitlab_self_managed`, and `gitlab_dedicated`. Provider variant, normalized host, stable account, namespace/group, provider project/repository identity, tier/license, server version where applicable, adapter version, signed support catalog generation, scopes, and capability probe remain explicit.

GitLab uses provider-native **Merge Request** vocabulary in ordinary UI. Durable reviews use the common `ForgeReview`, `ForgeReviewRevision`, and `ForgeReviewThread` contracts. GitLab pipelines/jobs map into the common pipeline projection. GitLab Environment Toolkit is deployment tooling and is not a forge adapter, provider variant, repository connection, or capability proof.

ContractRef: ContractName:Plans/GitLab_Integration.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.provider_adapter_profile.v1

## 1. Ownership And Consumers

This owner defines GitLab.com, Self-Managed and Dedicated adapter behavior; namespace/repository identity; Merge Request labels/state/approvals/discussions/versions; pipelines/jobs; GitLab-specific auth/scope and rate mapping; self-managed/Dedicated version/tier/license catalog gating; provider webhook/API mapping; and typed degradation.

`Plans/Forge_Integrations.md` retains common bindings, authority, capabilities, mirrors, review/pipeline/app/webhook/API shapes, commands/events/receipts, GUI section grammar, and fallback rules. Source Control retains local Git/JJ identity. Shared Integration Runtime owns connection/auth/installation work and `ObservableWork`. Multi-Account/Permissions own account choice, secrets and grants. Settings/Final GUI/commands/storage/wiring remain retained owners.

Source Control, Settings, Onboarding, Doctor, Runtime Artifacts, Usage, Assistant Chat and automation consume GitLab projections and generic commands with `forge_provider=gitlab`; none may create `cmd.gitlab.*` primary actions or duplicate MR/pipeline shapes.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Shared_Integration_Runtime.md

## 2. Canonical PlanUnits

### GLI-001 - GitLab Provider Identity And Variants

```yaml
plan_unit_id: GLI-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/GitLab_Integration.md
canonical_text: >-
  GitLab uses forge_provider=gitlab with explicit gitlab_com, gitlab_self_managed or gitlab_dedicated variant,
  normalized host, account, namespace/group, provider repository, tier/license, server version where applicable,
  adapter and signed support catalog. GitLab Environment Toolkit is not a forge adapter or capability proof.
gui_related: true
gui_classification_reason: Provider variant, host, account and support state appear in setup and health UI.
depends_on: [FGI-001, PDS-003]
unblocks: [GLI-002, GLI-003, GLI-004, GLI-005]
acceptance_criteria:
  - All three provider variants remain distinguishable.
  - Self-managed/Dedicated capability requires current signed host/version/tier support evidence.
  - Environment Toolkit cannot satisfy GitLab forge readiness.
validation_surfaces: [Plans/gitlab_integration_fixtures.json, provider/variant negative scans, signed catalog fixtures]
risk_class: gitlab_variant_or_tool_identity_conflation
reasoning_tier: high
context_scope: gitlab_provider_identity
implementation_surfaces: [Plans/GitLab_Integration.md, future GitLab adapter]
node_compile_hint: {mode: gitlab_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [gitlab, gitlab_com, gitlab_self_managed, gitlab_dedicated, GitLab Environment Toolkit]
negative_constraints: [Do not infer variant from display name., Do not treat Environment Toolkit as a forge adapter., Do not claim unsupported self-managed hosts.]
owner_hints: [Plans/GitLab_Integration.md, Plans/Forge_Integrations.md]
```

### GLI-002 - Namespace, Repository, Account, Auth, And Capability Binding

```yaml
plan_unit_id: GLI-002
unit_type: requirement
status: accepted
owner_doc: Plans/GitLab_Integration.md
canonical_text: >-
  A GitLab binding carries normalized host, stable account, namespace/group path, provider project/repository ID,
  PM repo_id, credential/grant ref, adapter, binding generation and requested/effective capabilities. Installation,
  auth, account, repository access, tier/license, API compatibility, rate budget and readiness are separate axes.
  Missing scopes or host/version/tier support produce typed limits and remediation rather than hidden fallback.
gui_related: true
gui_classification_reason: Account, namespace, host, scope, capability and remediation are visible setup state.
depends_on: [GLI-001, FGI-003]
unblocks: [GLI-003, GLI-004, GLI-005]
acceptance_criteria:
  - Account and repository identity use stable IDs; display handles are descriptive.
  - Capability probe binds exact provider variant, host, version/tier and scopes.
  - Secrets remain credential refs and never enter binding/event/log/artifact values.
validation_surfaces: [GitLab binding/capability fixtures, missing scope/tier/version/rate tests, secret scans]
risk_class: gitlab_access_or_capability_widening
reasoning_tier: high
context_scope: gitlab_connection_and_capabilities
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future GitLab auth/API adapter]
node_compile_hint: {mode: gitlab_binding_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-012..017]
preserved_exact_tokens: [namespace, group, Merge Request, requested, effective, tier, license, server version]
negative_constraints: [Do not store raw credentials., Do not equate sign-in with repository readiness., Do not call partial capability complete.]
owner_hints: [Plans/GitLab_Integration.md, Plans/Forge_Integrations.md, Plans/Multi-Account.md]
```

### GLI-003 - Merge Requests, Revisions, Discussions, And Approvals

```yaml
plan_unit_id: GLI-003
unit_type: requirement
status: accepted
owner_doc: Plans/GitLab_Integration.md
canonical_text: >-
  GitLab Merge Requests map to ForgeReview while preserving provider MR identity, exact immutable base/head/version,
  draft/ready state, merge status, approval requirements/results, discussions/threads, resolution actor, commit/status
  evidence and currentness. A new head creates a new ForgeReviewRevision and stales prior evidence. Agent-created MRs
  default Draft absent explicit Project policy; Mark Ready is a separate command and receipt.
gui_related: true
gui_classification_reason: Merge Requests, approvals, discussions, Draft/Ready, evidence and actions are visible.
depends_on: [GLI-002, FGI-004]
unblocks: [GLI-004, GLI-005]
acceptance_criteria:
  - UI uses Merge Request/MR vocabulary while durable common identity stays ForgeReview.
  - Approval/discussion evidence binds exact revision and cannot transfer silently to a new head.
  - Draft and Mark Ready remain distinct for user and agent flows.
validation_surfaces: [MR revision/thread fixtures, approval and stale-head tests, Draft/Ready command tests]
risk_class: gitlab_stale_mr_evidence_or_publication
reasoning_tier: high
context_scope: gitlab_merge_requests
implementation_surfaces: [future GitLab review adapter, future Source Control review UI]
node_compile_hint: {mode: gitlab_merge_request_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [Merge Request, MR, ForgeReviewRevision, discussions, approvals, Draft, Mark Ready]
negative_constraints: [Do not label GitLab reviews Pull Requests in ordinary UI., Do not reuse evidence after head change., Do not auto-ready an agent MR.]
owner_hints: [Plans/GitLab_Integration.md, Plans/Forge_Integrations.md]
```

### GLI-004 - Pipelines, Jobs, Webhooks, API Compatibility, And Degradation

```yaml
plan_unit_id: GLI-004
unit_type: requirement
status: accepted
owner_doc: Plans/GitLab_Integration.md
canonical_text: >-
  GitLab pipelines and jobs map to common pipeline/check projections with provider IDs, exact repository/review
  revision, state, currentness, jobs/checks and ObservableWork for mutations. GitLab webhooks use common verified
  delivery/dedupe/recovery shapes with provider-native verification. API compatibility pins variant, host, server
  version/tier, adapter/catalog and rate state; unsupported or unknown mutations fail closed while admitted reads degrade.
gui_related: true
gui_classification_reason: Pipeline/job status, webhook/API health, rate limits, degraded history and remediation are visible.
depends_on: [GLI-002, GLI-003, FGI-005, FGI-006, FGI-007]
unblocks: [GLI-005]
acceptance_criteria:
  - Pipeline run/retry/cancel returns ObservableWork and terminal provider receipt.
  - Webhook replay/dedupe and API/rate currentness prevent duplicate or unsafe effects.
  - Unsupported self-managed/Dedicated features expose exact reason and fallback.
validation_surfaces: [pipeline/job tests, webhook replay/dedupe tests, API/version/tier/rate degradation matrix]
risk_class: gitlab_pipeline_or_api_misrepresentation
reasoning_tier: high
context_scope: gitlab_pipelines_webhooks_api
implementation_surfaces: [future GitLab pipeline/webhook/API adapters]
node_compile_hint: {mode: gitlab_pipeline_api_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [pipelines, jobs, ObservableWork, webhook, dedupe, rate budget, degraded]
negative_constraints: [Do not scrape terminal prose., Do not call partial pipeline history complete., Do not mutate on unknown compatibility.]
owner_hints: [Plans/GitLab_Integration.md, Plans/Forge_Integrations.md]
```

### GLI-005 - Source Control, Settings, Commands, Migration, And Acceptance

```yaml
plan_unit_id: GLI-005
unit_type: validation
status: accepted
owner_doc: Plans/GitLab_Integration.md
canonical_text: >-
  GitLab appears in existing Source Control and Source Control Settings with provider-native Merge Request and
  Pipeline vocabulary. Connect uses cmd.integration.connection.add with typed GitLab payload; all repository,
  review, pipeline, webhook and browser actions use cmd.forge.*. No cmd.gitlab.* or dedicated panel exists.
  Migration requires validated host/account/namespace/repository/variant evidence; ambiguous remotes remain blocked.
gui_related: true
gui_classification_reason: This unit defines visible provider placement, vocabulary, setup, actions, health, migration and acceptance.
depends_on: [GLI-003, GLI-004, FGI-008, SCS-005]
unblocks: []
acceptance_criteria:
  - Every visible GitLab control maps to one generic command with typed provider/binding payload.
  - All variants and capability-limit states have accessible responsive fixtures.
  - Migration never infers self-managed/Dedicated support or authority from a remote URL alone.
validation_surfaces: [Plans/gitlab_integration_fixtures.json, command/wiring census, GUI/accessibility fixtures, migration negatives]
risk_class: gitlab_gui_command_or_migration_drift
reasoning_tier: high
context_scope: gitlab_gui_settings_migration
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: gitlab_gui_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01..03, source_ref:egolite-register:CT-01..02]
preserved_exact_tokens: [Connect GitLab, Merge Request, Pipeline, Ready with limits, Needs attention, Not available]
negative_constraints: [Do not create cmd.gitlab.*., Do not create a GitLab panel., Do not infer provider variant or capability from display URL alone.]
owner_hints: [Plans/GitLab_Integration.md, Plans/Forge_Integrations.md, Plans/Settings_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/gitlab_integration_fixtures.json` validates GitLab.com, Self-Managed, and Dedicated adapter profiles and rejects GitLab Environment Toolkit as a forge identity using `Plans/forge_integration_contracts.schema.json`. Self-Managed and Dedicated fixtures require signed host/release/tier support refs; fixture validity does not prove a live host is supported.

GitLab introduces no provider-specific command/event envelope. Primary UI actions are `cmd.integration.connection.add`, shared auth/connection commands, and applicable `cmd.forge.repository.*`, `cmd.forge.review.*`, `cmd.forge.pipeline.*`, `cmd.forge.webhook.*`, and `cmd.forge.connection.reauthorize`. Async work returns `ObservableWork`.

## 4. Integration Surfaces

Source Control shows **Merge Requests**, optional Versions/Threads, **Pipelines**, and provider health only when the effective GitLab capability envelope admits them. Settings routes **Source Control -> Hosting Services -> GitLab** with Connection, Repositories, Security, Tools, Advanced and variant/host/tier/version currentness. Self-managed and Dedicated official pages are allowlisted per normalized host and never opened from unvalidated server metadata.

## 5. Validation And Acceptance

Acceptance covers all variants; host normalization; namespace/group/repository identity; OAuth/PAT/SSH refs without secret leakage; missing scopes; tiers/licenses/server versions; rate/offline/managed states; MR revisions/discussions/approvals/Draft/Ready; pipelines/jobs/run/retry/cancel/logs; webhook verification/replay/dedupe/redelivery; API hash/currentness/fallback; exact commands/receipts/ObservableWork; migration; responsive/accessibility fixtures; and production wiring. Static fixture validation is not a live GitLab compatibility claim.

## 6. Plan-To-Node Readiness

GitLab remains node-blocked until central registration, signed support catalogs, live adapters, auth/scopes, webhook/API/pipeline/review implementation, migration, wiring, GUI and fresh provider/security/runtime evidence exist. No WorkNode, connection, webhook, MR, pipeline or readiness certificate is created here.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Current server versions, tiers, licenses, API versions, rate budgets and features are signed catalog/probe data, not hardcoded timeless claims.
- GitLab Environment Toolkit is explicitly not a forge adapter.
- `cmd.gitlab.*`, a dedicated GitLab rail/panel, raw secret storage, terminal prose scraping and partial-as-complete presentation are forbidden.
- This owner does not define local Git/JJ mutation, common forge shapes, shared install/auth lifecycle, plugin manifests, Settings geometry, command/event catalogs, storage or production wiring.

### 7.1 Migration

Migration requires exact normalized host, provider variant, stable account, namespace/group, provider repository ID, PM `repo_id`, credential/grant ref and capability probe. A remote string alone yields `needs_binding`. Legacy MR evidence without immutable base/head/version remains historical/stale.

## 8. Source Lineage And Governance

This owner compiles GitLab portions of accepted `SCM-05`, `UI-01`, `UI-03`, `CT-01..02` and provider token inventories. Root-owned central registrations and generated governance updates remain follow-up after stable edits.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md
