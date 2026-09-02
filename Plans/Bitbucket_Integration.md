# Bitbucket Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes common forge contracts from `Plans/Forge_Integrations.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Bitbucket Cloud and Bitbucket Data Center provider separation, native repository containers, Pull Requests, Cloud Pipelines versus Data Center checks/build-status behavior, auth/access, version/license support, webhook/API mapping, GUI projection, degradation, and migration.

## 0. Scope

Bitbucket Cloud and Bitbucket Data Center are separate forge providers, exactly `forge_provider=bitbucket_cloud|bitbucket_data_center`. A generic durable `bitbucket` provider is forbidden. Cloud binds stable account, workspace and repository. Data Center binds normalized host, stable account, project and repository plus signed server version/license support.

Both providers use provider-native **Pull Request** vocabulary but have separate capability matrices. Bitbucket Cloud Pipelines may map to common pipelines when enabled and probed. Bitbucket Data Center does not inherit Cloud Pipelines; it maps admitted build-status/check or externally integrated build capability only when the signed catalog/probe proves it.

ContractRef: ContractName:Plans/Bitbucket_Integration.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.provider_adapter_profile.v1

## 1. Ownership And Consumers

This owner defines Cloud/Data Center identity separation; workspace/repository versus project/repository hierarchy; auth/access mappings; Pull Request revisions/threads/approvals; Cloud Pipelines; Data Center build-status/check behavior; version/license/tier gates; provider webhook/API/rate mapping; provider-specific health, GUI, migration and degradation.

Common bindings, authority, capabilities, mirrors, review/pipeline/webhook/API shapes, commands/events/receipts, GUI section grammar and fallback remain `Plans/Forge_Integrations.md`. Local source control, shared install/auth/connection lifecycle and `ObservableWork`, credentials, Settings, GUI, commands, storage and wiring remain retained owners.

Consumers pass exact `forge_provider=bitbucket_cloud` or `bitbucket_data_center` on generic commands. No generic `cmd.bitbucket.*` primary namespace or dedicated panel exists.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Shared_Integration_Runtime.md

## 2. Canonical PlanUnits

### BBI-001 - Cloud And Data Center Provider Separation

```yaml
plan_unit_id: BBI-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Bitbucket_Integration.md
canonical_text: >-
  Bitbucket Cloud and Data Center are distinct forge_provider values, bitbucket_cloud and bitbucket_data_center.
  Cloud identity is account/workspace/repository; Data Center identity is host/account/project/repository plus
  signed server version/license support. Generic bitbucket is not a durable provider or automatic fallback.
gui_related: true
gui_classification_reason: Provider selection, host/container hierarchy and support state are visible setup behavior.
depends_on: [FGI-001, PDS-003]
unblocks: [BBI-002, BBI-003, BBI-004, BBI-005]
acceptance_criteria:
  - Cloud and Data Center records cannot share a generic provider discriminator.
  - Cloud workspace and Data Center project identities remain distinct.
  - Data Center mutation requires current signed host/version/license support evidence.
validation_surfaces: [Plans/bitbucket_integration_fixtures.json, generic-provider and cross-variant negative tests]
risk_class: bitbucket_cross_product_identity_conflation
reasoning_tier: high
context_scope: bitbucket_provider_identity
implementation_surfaces: [Plans/Bitbucket_Integration.md, future Bitbucket adapters]
node_compile_hint: {mode: bitbucket_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [bitbucket_cloud, bitbucket_data_center, workspace, project, repository, version, license]
negative_constraints: [Do not use generic bitbucket as durable provider., Do not reuse Cloud capability for Data Center., Do not infer support from host name.]
owner_hints: [Plans/Bitbucket_Integration.md, Plans/Forge_Integrations.md]
```

### BBI-002 - Auth, Access, Repository Binding, And Capability Routing

```yaml
plan_unit_id: BBI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Bitbucket_Integration.md
canonical_text: >-
  Bitbucket bindings carry exact provider, variant, host where applicable, stable account, workspace or project,
  provider repository ID, PM repo_id, credential/grant ref, adapter/catalog and binding generation. Auth, account,
  container access, repository access, PR access, pipeline/check access, server version/license, rate and readiness
  remain separate. Missing or unsupported capability returns a typed reason and fallback.
gui_related: true
gui_classification_reason: Account, container/repository, auth, version/license and requested/effective capability are visible setup state.
depends_on: [BBI-001, FGI-003]
unblocks: [BBI-003, BBI-004, BBI-005]
acceptance_criteria:
  - Stable IDs, not usernames or URLs, join account and repository records.
  - Cloud and Data Center capability probes use their own exact provider branch.
  - Secrets remain credential refs and unsupported features are not hidden.
validation_surfaces: [Bitbucket adapter fixtures, access/version/license/rate matrices, secret scans]
risk_class: bitbucket_access_or_capability_widening
reasoning_tier: high
context_scope: bitbucket_auth_binding_capabilities
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Bitbucket auth/API adapters]
node_compile_hint: {mode: bitbucket_binding_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-012..017]
preserved_exact_tokens: [OAuth, PAT ref, SSH ref, workspace access, project access, pipeline enabled, build status, signed catalog]
negative_constraints: [Do not persist raw credentials., Do not equate sign-in with repository readiness., Do not silently map Cloud capabilities to Data Center.]
owner_hints: [Plans/Bitbucket_Integration.md, Plans/Forge_Integrations.md, Plans/Multi-Account.md]
```

### BBI-003 - Pull Requests, Revisions, Threads, And Approval State

```yaml
plan_unit_id: BBI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Bitbucket_Integration.md
canonical_text: >-
  Cloud and Data Center Pull Requests map to common ForgeReview while preserving exact provider PR identity,
  immutable base/head/version, participants/reviewers, approvals, comments/threads, merge state, checks/build status
  and currentness. A new head creates a new ForgeReviewRevision and stales prior evidence. Unsupported Draft or
  thread behaviors remain typed capability limits and are not locally emulated.
gui_related: true
gui_classification_reason: Pull Requests, revisions, threads, approvals, checks and actions are visible.
depends_on: [BBI-002, FGI-004]
unblocks: [BBI-004, BBI-005]
acceptance_criteria:
  - Review state preserves exact Cloud or Data Center provider identity.
  - Approval/check evidence cannot transfer silently after a new head.
  - Provider differences are disclosed as capabilities, not erased by local emulation.
validation_surfaces: [PR revision/thread/approval fixtures, stale-head tests, provider capability limit tests]
risk_class: bitbucket_stale_pr_or_cross_variant_emulation
reasoning_tier: high
context_scope: bitbucket_pull_requests
implementation_surfaces: [future Bitbucket review adapters, future Source Control review UI]
node_compile_hint: {mode: bitbucket_pull_request_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [Pull Request, ForgeReviewRevision, reviewers, approvals, threads, build status]
negative_constraints: [Do not reuse evidence after head change., Do not merge Cloud and Data Center review semantics., Do not emulate unsupported capability silently.]
owner_hints: [Plans/Bitbucket_Integration.md, Plans/Forge_Integrations.md]
```

### BBI-004 - Cloud Pipelines, Data Center Checks, Webhooks, API Compatibility, And Degradation

```yaml
plan_unit_id: BBI-004
unit_type: requirement
status: accepted
owner_doc: Plans/Bitbucket_Integration.md
canonical_text: >-
  Bitbucket Cloud Pipelines map to common pipelines only when enabled and effective. Bitbucket Data Center maps
  admitted build-status/check or external build capability and never inherits Cloud Pipelines. Both providers use
  common webhook delivery/dedupe/recovery and API compatibility/rate contracts with provider-specific verification.
  Async pipeline mutations use ObservableWork; unsupported or unknown mutation fails closed.
gui_related: true
gui_classification_reason: Pipelines/checks/build status, webhook/API health, rate limits, degraded state and remediation are visible.
depends_on: [BBI-002, BBI-003, FGI-005, FGI-006, FGI-007]
unblocks: [BBI-005]
acceptance_criteria:
  - Data Center never presents Cloud Pipelines as available.
  - Provider-native webhook replay/dedupe prevents duplicate effects.
  - Pipeline mutations use ObservableWork and current capability/revision evidence.
validation_surfaces: [Cloud Pipeline fixtures, Data Center check/build-status fixtures, webhook replay/dedupe tests, API/version/license/rate matrix]
risk_class: bitbucket_pipeline_product_or_api_misrepresentation
reasoning_tier: high
context_scope: bitbucket_pipelines_checks_webhooks_api
implementation_surfaces: [future Bitbucket pipeline/check/webhook/API adapters]
node_compile_hint: {mode: bitbucket_pipeline_api_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [Bitbucket Pipelines, Data Center, build status, checks, webhook, ObservableWork, degraded]
negative_constraints: [Do not show Cloud Pipelines for Data Center., Do not scrape terminal prose., Do not mutate under unknown compatibility.]
owner_hints: [Plans/Bitbucket_Integration.md, Plans/Forge_Integrations.md]
```

### BBI-005 - Source Control, Settings, Commands, Migration, And Acceptance

```yaml
plan_unit_id: BBI-005
unit_type: validation
status: accepted
owner_doc: Plans/Bitbucket_Integration.md
canonical_text: >-
  Bitbucket appears in existing Source Control and Source Control Settings with exact Cloud workspace or Data Center
  host/project/repository identity, Pull Requests and effective Pipelines or Checks. Connect uses
  cmd.integration.connection.add with typed provider payload; all forge actions use cmd.forge.*. No generic
  cmd.bitbucket.* or dedicated panel exists. Migration requires validated provider branch and native container identity.
gui_related: true
gui_classification_reason: This unit defines visible provider placement, vocabulary, setup, actions, health, migration and acceptance.
depends_on: [BBI-003, BBI-004, FGI-008, SCS-005]
unblocks: []
acceptance_criteria:
  - Every visible control maps to one generic command with exact provider/binding payload.
  - Cloud/Data Center and capability-limit states have accessible responsive fixtures.
  - Migration never infers provider branch, authority or support from a remote URL alone.
validation_surfaces: [Plans/bitbucket_integration_fixtures.json, command/wiring census, GUI/accessibility fixtures, migration negatives]
risk_class: bitbucket_gui_command_or_migration_drift
reasoning_tier: high
context_scope: bitbucket_gui_settings_migration
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: bitbucket_gui_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01..03, source_ref:egolite-register:CT-01..02]
preserved_exact_tokens: [Connect Bitbucket Cloud, Connect Bitbucket Data Center, Pull Request, Pipelines, Checks, Ready with limits]
negative_constraints: [Do not create generic cmd.bitbucket.*., Do not create a Bitbucket panel., Do not infer Cloud or Data Center from display copy alone.]
owner_hints: [Plans/Bitbucket_Integration.md, Plans/Forge_Integrations.md, Plans/Settings_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/bitbucket_integration_fixtures.json` validates separate Cloud and Data Center adapter profiles and rejects a generic Bitbucket provider against `Plans/forge_integration_contracts.schema.json`. No provider-specific common schema, event envelope or command namespace is created.

Connect/auth/test/Details reuse shared `cmd.integration.connection.*` and `cmd.auth_profile.*`. Repository/PR/pipeline/check/webhook/browser actions use applicable `cmd.forge.*` with the exact Cloud or Data Center `forge_provider`, binding generation and review revision. Async operations return `ObservableWork`.

## 4. Integration Surfaces

Source Control may show Pull Requests, Versions/Threads, and **Pipelines** for admitted Cloud bindings or **Checks** for admitted Data Center bindings. Settings routes **Source Control -> Hosting Services -> Bitbucket Cloud** and **Bitbucket Data Center** as distinct connection destinations, showing the correct workspace or host/project/repository hierarchy and capability reasons.

## 5. Validation And Acceptance

Acceptance covers Cloud/Data Center identity separation; workspace versus project/repository; auth refs and secret negatives; version/license/tier/access/rate; PR revisions/threads/approvals/checks; Cloud Pipeline enablement/run/retry/cancel; Data Center build-status/check behavior; webhook verification/replay/dedupe/recovery; API compatibility/fallback; commands/receipts/ObservableWork; migration; responsive/accessibility fixtures; and production wiring. Static fixtures are not live provider support evidence.

## 6. Plan-To-Node Readiness

Bitbucket remains node-blocked until central registration, current signed Data Center support catalog, live Cloud/Data Center adapters, auth/access/API/webhook/pipeline/check implementations, migration, wiring, GUI and fresh provider/security/runtime evidence exist. No WorkNode, connection, PR, pipeline, webhook or readiness certificate is created here.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Current Data Center versions/licenses, Cloud plans, APIs, auth options and features are signed catalog/probe data, not timeless constants.
- Generic `bitbucket`, generic `cmd.bitbucket.*`, a dedicated Bitbucket panel, Cloud-to-Data-Center capability inheritance, raw secret storage and terminal prose scraping are forbidden.
- This owner does not define local Git/JJ, common forge shapes, shared lifecycle, plugin manifests, Settings geometry, command/event catalogs, storage or wiring.

### 7.1 Migration

Cloud migration requires validated stable account, workspace and provider repository. Data Center migration requires validated host, account, project, provider repository, server version/license support and capability probe. Remote URL recognition is discovery evidence only. Ambiguous generic Bitbucket records remain `needs_binding` until the provider branch is proven.

## 8. Source Lineage And Governance

This owner compiles Bitbucket portions of accepted `SCM-05`, `UI-01`, `UI-03`, `CT-01..02` and provider token inventories. Root-owned central registrations and governance outputs remain follow-up.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md
