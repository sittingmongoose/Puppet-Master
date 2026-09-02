# Azure DevOps Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes common forge contracts from `Plans/Forge_Integrations.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Azure DevOps Services/Server variants, organization or collection, project, repository, Pull Request, branch-policy/check, build/pipeline, access/auth mapping, provider webhook/API behavior, and Azure-specific degradation.

## 0. Scope

Azure DevOps is exactly `forge_provider=azure_devops` with provider variants `azure_devops_services` and `azure_devops_server`. Every binding preserves normalized host, stable account, organization or Server collection, project, repository identity, provider repository ID, credential/grant ref, adapter, signed support catalog generation, binding generation, requested/effective capabilities, and currentness.

The project identity is mandatory and cannot be collapsed into organization, collection, repository name, local path, remote URL, or focused UI state. Azure Pull Requests map to the common immutable review contract. Branch policies/status checks and Azure builds/pipelines map into common checks/pipeline projections without losing provider IDs, policy identity, review revision, currentness, or access reason.

ContractRef: ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.provider_adapter_profile.v1

## 1. Ownership And Consumers

This owner defines Services/Server provider variants; organization/collection/project/repository identity; Azure account/auth/scope/access mapping; Pull Request versions/threads/votes/status; branch policy/check mapping; builds/pipelines/jobs; provider webhook/API/rate behavior; Azure DevOps Server signed version support; and typed Azure degradation.

Common forge bindings, authority, capabilities, mirrors, reviews, pipelines, webhooks, API compatibility, commands/events/receipts, GUI section grammar and fallback ladder remain in `Plans/Forge_Integrations.md`. Local Git/JJ, shared install/auth/connection lifecycle, credential custody, Settings shell, GUI tokens, commands, event envelopes, storage and wiring remain retained owners.

Consumers use generic commands with `forge_provider=azure_devops`; `cmd.azure_devops.*` is not a primary command namespace.

ContractRef: ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Shared_Integration_Runtime.md

## 2. Canonical PlanUnits

### ADO-001 - Azure DevOps Provider Identity And Container Hierarchy

```yaml
plan_unit_id: ADO-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure DevOps uses forge_provider=azure_devops with explicit azure_devops_services or azure_devops_server variant.
  Durable hierarchy is normalized host, stable account, organization or collection, project, repository and provider
  repository ID. Project is mandatory and no path, remote URL, display name or focus may replace the hierarchy.
gui_related: true
gui_classification_reason: Provider variant and organization/collection/project/repository selection are visible setup behavior.
depends_on: [FGI-001, PDS-003]
unblocks: [ADO-002, ADO-003, ADO-004, ADO-005]
acceptance_criteria:
  - Services and Server remain explicit variants.
  - Every repository binding carries organization/collection and project identity.
  - Display URLs and local paths remain descriptive only.
validation_surfaces: [Plans/azure_devops_integration_fixtures.json, missing-project and variant negative tests]
risk_class: azure_container_identity_collapse
reasoning_tier: high
context_scope: azure_devops_provider_identity
implementation_surfaces: [Plans/Azure_DevOps_Integration.md, future Azure adapter]
node_compile_hint: {mode: azure_devops_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [azure_devops, azure_devops_services, azure_devops_server, organization, collection, project, repository]
negative_constraints: [Do not omit project identity., Do not infer hierarchy from a URL or focused view., Do not merge Services and Server support.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md]
```

### ADO-002 - Account, Auth, Access, Server Support, And Capability Routing

```yaml
plan_unit_id: ADO-002
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure connection state keeps authentication method, stable account, organization/collection access, project access,
  repository access, branch-policy scope, build/pipeline access, API compatibility, rate and readiness distinct.
  Secrets remain credential refs. Azure DevOps Server capabilities require a current signed host/version support entry;
  missing access, scope, version, license or policy returns typed limits and remediation.
gui_related: true
gui_classification_reason: Account, access, exact hierarchy, Server support and requested/effective capability are visible setup/health state.
depends_on: [ADO-001, FGI-003]
unblocks: [ADO-003, ADO-004, ADO-005]
acceptance_criteria:
  - Entra/PAT/SSH are auth methods or refs, never readiness by themselves.
  - Organization/collection, project, repository, policy and build access failures remain distinguishable.
  - Azure DevOps Server mutation fails closed without current signed support evidence.
validation_surfaces: [Azure capability fixtures, access/scope/version/license/rate matrices, secret scans]
risk_class: azure_access_or_server_capability_widening
reasoning_tier: high
context_scope: azure_devops_auth_access_capabilities
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Azure auth/API adapter]
node_compile_hint: {mode: azure_devops_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-012..017]
preserved_exact_tokens: [Entra, PAT, SSH, organization access, project access, branch policy, build access, signed support catalog]
negative_constraints: [Do not persist raw credentials., Do not equate authentication with project/repository access., Do not mutate an unsupported Server version.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md, Plans/Multi-Account.md]
```

### ADO-003 - Pull Requests, Revisions, Threads, Votes, And Branch Policies

```yaml
plan_unit_id: ADO-003
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure Pull Requests map to ForgeReview with provider PR identity, exact base/head/version, threads/comments,
  participants/votes, required reviewers, merge status, branch-policy/check identities and evidence currentness.
  A new head creates a new immutable review revision and stales approvals/check evidence. Agent-created PRs default
  Draft where supported and policy-admitted; Mark Ready remains a separate common command and receipt.
gui_related: true
gui_classification_reason: Pull Requests, threads, votes, policies, Draft/Ready, evidence and actions are visible.
depends_on: [ADO-002, FGI-004]
unblocks: [ADO-004, ADO-005]
acceptance_criteria:
  - PR evidence binds exact immutable revision and policy/check identities.
  - Votes/approvals cannot transfer silently after head change.
  - Unsupported Draft semantics expose a typed capability limit rather than emulation.
validation_surfaces: [Azure PR revision/thread/policy fixtures, stale-head/vote tests, Draft capability tests]
risk_class: azure_stale_pr_or_policy_evidence
reasoning_tier: high
context_scope: azure_devops_pull_requests_policies
implementation_surfaces: [future Azure review/policy adapter, future Source Control review UI]
node_compile_hint: {mode: azure_devops_review_policy_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [Pull Request, ForgeReviewRevision, threads, votes, required reviewers, branch policy, checks]
negative_constraints: [Do not reuse votes or checks after head change., Do not emulate unsupported provider behavior silently., Do not flatten policy failure into generic unavailable.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md]
```

### ADO-004 - Builds, Pipelines, Service Hooks, API Compatibility, And Degradation

```yaml
plan_unit_id: ADO-004
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure builds, pipelines, jobs and branch-policy checks map to common pipeline/check projections with exact
  provider IDs, repository and review revision, state, currentness and ObservableWork for run/retry/cancel.
  Service hooks/webhooks use common verified delivery/dedupe/recovery shapes. API compatibility pins Services or
  Server variant, host/version, adapter/catalog, endpoints/scopes/features and rate; unknown mutations fail closed.
gui_related: true
gui_classification_reason: Build/pipeline/check status, logs, hooks, API health, rate and degradation are visible.
depends_on: [ADO-002, ADO-003, FGI-005, FGI-006, FGI-007]
unblocks: [ADO-005]
acceptance_criteria:
  - Builds/pipelines/checks preserve provider identity and immutable review linkage.
  - Async mutations expose ObservableWork and terminal provider receipts.
  - Hook replay/dedupe and Server/API compatibility prevent duplicate or unsafe effects.
validation_surfaces: [Azure build/pipeline/check fixtures, service hook replay/dedupe tests, API/version/rate degradation matrix]
risk_class: azure_build_or_api_misrepresentation
reasoning_tier: high
context_scope: azure_devops_builds_hooks_api
implementation_surfaces: [future Azure pipeline/hook/API adapters]
node_compile_hint: {mode: azure_devops_pipeline_api_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [build, pipeline, branch-policy checks, service hooks, ObservableWork, degraded]
negative_constraints: [Do not infer progress from time., Do not call partial history complete., Do not mutate under unknown compatibility.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md]
```

### ADO-005 - Source Control, Settings, Commands, Migration, And Acceptance

```yaml
plan_unit_id: ADO-005
unit_type: validation
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure DevOps appears in existing Source Control and Source Control Settings with Pull Request, Policies/Checks,
  Builds/Pipelines and exact organization/collection/project/repository state. Connect uses
  cmd.integration.connection.add with typed Azure payload; all forge actions use cmd.forge.*. No
  cmd.azure_devops.* or dedicated panel exists. Migration requires validated hierarchy, variant and capability evidence.
gui_related: true
gui_classification_reason: This unit defines visible provider placement, vocabulary, setup, actions, health, migration and acceptance.
depends_on: [ADO-003, ADO-004, FGI-008, SCS-005]
unblocks: []
acceptance_criteria:
  - Visible controls map to generic commands with typed provider/hierarchy/binding payload.
  - Services/Server and all access/capability states have accessible responsive fixtures.
  - Migration cannot invent project, authority or Server support from a remote URL.
validation_surfaces: [Plans/azure_devops_integration_fixtures.json, command/wiring census, GUI/accessibility fixtures, migration negatives]
risk_class: azure_gui_command_or_migration_drift
reasoning_tier: high
context_scope: azure_devops_gui_settings_migration
implementation_surfaces: [Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: azure_devops_gui_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01..03, source_ref:egolite-register:CT-01..02]
preserved_exact_tokens: [Connect Azure DevOps, Pull Request, Policies, Checks, Builds, Pipelines, Ready with limits]
negative_constraints: [Do not create cmd.azure_devops.*., Do not create an Azure DevOps panel., Do not omit project identity.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md, Plans/Settings_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/azure_devops_integration_fixtures.json` validates Services and Server adapter profiles and a missing-project negative against `Plans/forge_integration_contracts.schema.json`. Azure DevOps adds no provider-specific common schema, command namespace, or event envelope.

Connect, auth, test and Details reuse shared `cmd.integration.connection.*` and `cmd.auth_profile.*`. Repository/PR/policy/check/build/pipeline/hook/open-browser actions use applicable `cmd.forge.*` identities with `forge_provider=azure_devops`, variant, organization/collection, project, repository binding and expected generation/revision. Async work returns `ObservableWork`.

## 4. Integration Surfaces

Source Control may show Pull Requests, Versions/Threads, Policies/Checks, Builds/Pipelines, and provider health as capabilities permit. Settings routes **Source Control -> Hosting Services -> Azure DevOps** with Connection, Repositories, Security, Tools and Advanced, showing exact Services/Server hierarchy and access/currentness without raw credentials.

## 5. Validation And Acceptance

Acceptance covers Services and signed-supported Server variants; host normalization; account/org/collection/project/repository identity; Entra/PAT/SSH refs; access/scope/license/version/rate failures; PR revisions/threads/votes/policies/checks; builds/pipelines/jobs/run/retry/cancel; service-hook verification/replay/dedupe/recovery; API compatibility/fallback; commands/receipts/ObservableWork; migration; responsive/accessibility fixtures; and production wiring. Static fixtures are not live Azure evidence.

## 6. Plan-To-Node Readiness

Azure DevOps remains node-blocked until central registration, signed Server support catalog, live adapters, auth/access probes, policy/build/hook/API implementations, migration, wiring, GUI and fresh provider/security/runtime evidence exist. No WorkNode, connection, PR, build, hook or readiness certificate is created here.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Current Azure DevOps Server versions, APIs, auth methods, access rules, tiers/licenses and feature availability are signed catalog/probe data, not timeless hardcoded claims.
- `cmd.azure_devops.*`, a dedicated Azure panel, raw secret persistence, terminal prose scraping and omitted project identity are forbidden.
- Boards/issues are optional capability projections and are not silently claimed by repository access.
- This owner does not define local Git/JJ, common forge shapes, shared lifecycle, plugin manifests, Settings geometry, command/event catalogs, storage or wiring.

### 7.1 Migration

Migration requires validated variant, host, stable account, organization/collection, project, provider repository ID, PM `repo_id`, credential/grant ref and capability probe. Missing project or variant is `needs_binding`; URL parsing is discovery evidence only. Historical PR evidence without immutable revision/policy/check identity remains stale.

## 8. Source Lineage And Governance

This owner compiles Azure DevOps portions of accepted `SCM-05`, `UI-01`, `UI-03`, `CT-01..02` and provider token inventories. Root-owned central registrations and governance outputs remain follow-up.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md
