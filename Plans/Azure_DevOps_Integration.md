# Azure DevOps Integration

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes common forge contracts from `Plans/Forge_Integrations.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for Azure DevOps Services/Server variants, organization or collection, project, repository, Pull Request, branch-policy/check, build/pipeline, access/auth mapping, provider webhook/API behavior, and Azure-specific degradation.

## 0. Scope

Azure DevOps is exactly `forge_provider=azure_devops` with provider variants `azure_devops_services` and `azure_devops_server`. Every binding preserves normalized host, stable account, organization or Server collection, project name, project GUID (`provider_project_id`), repository identity, provider repository ID, credential/grant ref, adapter, signed support catalog generation, binding generation, requested/effective capabilities, and currentness.

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
  repository ID. The project carries two identifiers, its name and its provider_project_id GUID, exactly as the
  repository carries a slug and a provider repository ID; both come from a provider resource and neither is parsed
  from a URL. Project is mandatory and no path, remote URL, display name or focus may replace the hierarchy. A
  container that is TFVC rather than Git is a recognized, typed unsupported container.
gui_related: true
gui_classification_reason: Provider variant and organization/collection/project/repository selection are visible setup behavior.
depends_on: [FGI-001, PDS-003]
unblocks: [ADO-002, ADO-003, ADO-004, ADO-005]
acceptance_criteria:
  - Services and Server remain explicit variants.
  - Every repository binding carries organization/collection and project identity.
  - Display URLs and local paths remain descriptive only.
  - >-
    Every Azure repository binding carries provider_project_id, the project's GUID, alongside the project name. The
    two are not spellings of one identifier: the route path accepts either, while the policy artifact identity
    vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId} accepts only the GUID, and a binding that omits it
    produces a well-formed request and an empty result rather than an error. A binding without the GUID is
    needs_binding, and the GUID is obtained from a provider resource and never parsed from a remote or display URL.
  - >-
    A TFVC container is recognized from the provider's own repository-kind data and reported as the typed reason
    tfvc_container_unsupported. Recognition is evidence-based: a CLI failure string, a 403 body or an empty Git
    response cannot establish it, and a TFVC container is never presented as an empty or broken Git repository.
validation_surfaces: [Plans/azure_devops_integration_fixtures.json, missing-project and variant negative tests, null-project and TFVC negative fixtures]
risk_class: azure_container_identity_collapse
reasoning_tier: high
context_scope: azure_devops_provider_identity
implementation_surfaces: [Plans/Azure_DevOps_Integration.md, future Azure adapter]
node_compile_hint: {mode: azure_devops_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [azure_devops, azure_devops_services, azure_devops_server, organization, collection, project, repository, provider_project_id, TFVC, tfvc_container_unsupported]
negative_constraints: [Do not omit project identity., Do not infer hierarchy from a URL or focused view., Do not merge Services and Server support., Do not parse the project GUID from a remote or display URL., Do not present a TFVC container as a Git repository or infer TFVC from a CLI failure string or a 403 body.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md]
```

### ADO-002 - Account, Auth, Access, Server Support, And Capability Routing

```yaml
plan_unit_id: ADO-002
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure connection state keeps authentication method, stable account, organization access, collection access,
  project access, repository access, branch policy scope, build/pipeline access, API compatibility, rate and
  readiness distinct. Secrets remain credential refs. Azure DevOps Server capabilities require a current signed support catalog
  entry naming host and version; missing access, scope, version, license or policy returns typed limits and
  remediation.
gui_related: true
gui_classification_reason: Account, access, exact hierarchy, Server support and requested/effective capability are visible setup/health state.
depends_on: [ADO-001, FGI-003]
unblocks: [ADO-003, ADO-004, ADO-005]
acceptance_criteria:
  - Entra/PAT/SSH are auth methods or refs, never readiness by themselves.
  - Organization/collection, project, repository, policy and build access failures remain distinguishable.
  - Azure DevOps Server mutation fails closed without current signed support evidence.
  - >-
    The policy leg of that distinguishability means the write, exempt and bypass paths. Azure publishes EditPolicies,
    PolicyExempt and PullRequestBypassPolicy and no read bit, and reading branch policies and their evaluations rides
    on repository read under the same scope that reads code. A caller who can read the repository can read its
    policies, so policy_scope_missing is not a read-side state the service can produce and is not declared as one.
  - >-
    The Azure profiles declare review_versions and repository_policy among their optional capabilities, because
    the command contract pins each of those capability names for a command the Azure owner is named as consuming,
    and a profile that omits one cannot satisfy the rule that every operation resolves a capability entry before
    dispatch. Policy applicability and policy status are then two capabilities, repository_policy and checks,
    probed and degraded separately. Which policies apply is branch-keyed and released; whether each one passes is review-keyed and
    preview-only. A host whose probed API set lacks the preview policy-evaluations endpoint reports
    capability_unsupported naming the API version it looked for, and never an inferred status and never an empty
    check list.
validation_surfaces: [Azure capability fixtures, access/scope/version/license/rate matrices, secret scans]
risk_class: azure_access_or_server_capability_widening
reasoning_tier: high
context_scope: azure_devops_auth_access_capabilities
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future Azure auth/API adapter]
node_compile_hint: {mode: azure_devops_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-012..017]
preserved_exact_tokens: [Entra, PAT, SSH, organization access, project access, branch policy, build access, signed support catalog, EditPolicies, PolicyExempt, PullRequestBypassPolicy, policy_scope_missing, review_versions, repository_policy, capability_unsupported]
negative_constraints: [Do not persist raw credentials., Do not equate authentication with project/repository access., Do not mutate an unsupported Server version., Do not report a policy read failure as a policy scope failure., Do not infer policy status from merge status or show an empty check list when the evaluations endpoint is absent.]
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
  A new provider revision creates a new immutable review revision (`ForgeReviewRevision`) and stales approvals/check
  evidence. A provider
  revision is the whole triple: the provider's own revision identity advancing, or any leg of base, head or
  merge-base changing, is a new revision, so a target-branch move or a retarget stales evidence with no head change
  at all. Agent-created PRs default Draft where supported and policy-admitted; Mark Ready remains a separate common
  command and receipt.
gui_related: true
gui_classification_reason: Pull Requests, threads, votes, policies, Draft/Ready, evidence and actions are visible.
depends_on: [ADO-002, FGI-004]
unblocks: [ADO-004, ADO-005]
acceptance_criteria:
  - >-
    PR evidence binds the provider revision it was read against, together with the policy and check identities the
    provider supplied. Azure attaches no revision identity to a vote or to a policy evaluation, so that evidence is
    bound to the revision Puppet Master observed when it read it and is labelled observed by Puppet Master rather
    than provider-asserted. Evidence carrying no such binding is not presented as current.
  - >-
    Votes and approvals cannot transfer silently to a new provider revision. Until a provider-neutral vote and
    reviewer carrier exists in the common forge contracts, an Azure vote is held only as an observed-at binding with
    the revision that observation was made against, and the surface states that the provider did not assert it. This
    unit does not promise a provider-asserted vote-to-revision binding that no shape can hold.
  - Unsupported Draft semantics expose a typed capability limit rather than emulation.
  - >-
    A retarget re-resolves the applicable branch policy and check set rather than carrying it. Azure resolves each
    branch policy server-side by target ref, so a retarget changes which policies apply at all: a previously
    satisfied required reviewer can cease to be required and a new one can appear, with no head movement.
  - >-
    A completion request that names no merge strategy is not neutral on Azure: omitting the strategy selects a
    no-fast-forward merge. The effective policy's permitted strategies are known before a merge affordance is
    offered, and a completion the policy forbids is refused before the request rather than reported after it.
validation_surfaces:
  - Plans/azure_devops_integration_fixtures.json
  - >-
    The Azure review, policy and check fixtures this unit needs do not exist yet. What exists is the Services and
    Server adapter profiles and the repository-binding negatives in Plans/azure_devops_integration_fixtures.json; no
    Azure review revision, thread, vote, policy evaluation or check fixture exists in any Plans fixture pack, so
    these criteria are stated and not yet falsifiable by a fixture. Writing them is separate work gated on the
    common gate-record contract.
  - future stale-head/vote tests, Draft capability tests
risk_class: azure_stale_pr_or_policy_evidence
reasoning_tier: high
context_scope: azure_devops_pull_requests_policies
implementation_surfaces: [future Azure review/policy adapter, future Source Control review UI]
node_compile_hint: {mode: azure_devops_review_policy_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [Pull Request, ForgeReviewRevision, threads, votes, required reviewers, branch policy, checks, provider revision, observed by Puppet Master, retarget, no-fast-forward]
negative_constraints: [Do not reuse votes or checks after head change., Do not emulate unsupported provider behavior silently., Do not flatten policy failure into generic unavailable., Do not resolve policy applicability client-side; a failed scope resolution fails closed., Do not carry the applicable policy set across a retarget., Do not offer a merge affordance before the effective policy's permitted strategies are known.]
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
gui_classification_reason: Build/pipeline/check status, logs, service hooks, API health, rate and degradation are visible.
depends_on: [ADO-002, ADO-003, FGI-005, FGI-006, FGI-007]
unblocks: [ADO-005]
acceptance_criteria:
  - Builds/pipelines/checks preserve provider identity and immutable review linkage.
  - Async mutations expose ObservableWork and terminal provider receipts.
  - Hook replay/dedupe and Server/API compatibility prevent duplicate or unsafe effects.
  - >-
    The API compatibility pin is per endpoint, not per product and not per host. One Azure host serves the branch
    policy configuration route at a released version and the policy evaluation route at a preview version in the same
    request family, so every probed endpoint records its own api_version and release_state; a single adapter version,
    catalog generation or contract hash cannot stand in for them.
  - >-
    An absent or preview-only endpoint leaves degraded only the capability that depends on it. A missing policy
    evaluations route removes checks with capability_unsupported naming the API version that was looked for; it does
    not remove repository_policy and it does not license an inferred status.
validation_surfaces: [Azure build/pipeline/check fixtures, service hook replay/dedupe tests, API/version/rate degradation matrix]
risk_class: azure_build_or_api_misrepresentation
reasoning_tier: high
context_scope: azure_devops_builds_hooks_api
implementation_surfaces: [future Azure pipeline/hook/API adapters]
node_compile_hint: {mode: azure_devops_pipeline_api_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [build, pipeline, branch-policy checks, service hooks, ObservableWork, degraded, api_version, release_state, capability_unsupported, repository_policy]
negative_constraints: [Do not infer progress from time., Do not call partial history complete., Do not mutate under unknown compatibility., Do not pin one API version for a host or a product when its endpoints differ.]
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
gui_classification_reason: This unit defines visible provider placement, its vocabulary (Connect Azure DevOps, Pull Request, Policies, Checks, Builds, Pipelines, Ready with limits), setup, actions, health, migration and acceptance.
depends_on: [ADO-003, ADO-004, FGI-008, SCS-005]
unblocks: []
acceptance_criteria:
  - Visible controls map to generic commands with typed provider/hierarchy/binding payload.
  - Services/Server and all access/capability states have accessible responsive fixtures.
  - Migration cannot invent project, authority or Server support from a remote URL.
validation_surfaces:
  - Plans/azure_devops_integration_fixtures.json
  - >-
    That pack holds the Services and Server adapter profiles and the repository-binding negatives and nothing else.
    The Azure Pull Request, Policies/Checks and Builds/Pipelines fixtures this unit's placement promise would need do
    not exist yet, so placement is stated here and is not yet falsifiable by a fixture.
  - command/wiring census, GUI/accessibility fixtures, migration negatives
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

`Plans/azure_devops_integration_fixtures.json` validates Services and Server adapter profiles, a missing-project negative, a null-project negative and a TFVC-container negative against `Plans/forge_integration_contracts.schema.json`. It holds no Azure review revision, thread, vote, policy-evaluation or check fixture: those are named by ADO-003 and ADO-005 as surfaces the Azure adapter will need and they are not yet written, so the Azure review, policy and check acceptance criteria are stated and not yet falsifiable by a fixture. Azure DevOps adds no provider-specific common schema, command namespace, or event envelope.

Connect, auth, test and Details reuse shared `cmd.integration.connection.*` and `cmd.auth_profile.*`. Repository/PR/policy/check/build/pipeline/hook/open-browser actions use applicable `cmd.forge.*` identities with `forge_provider=azure_devops`, variant, organization/collection, project, repository binding and expected generation/revision. Async work returns `ObservableWork`.

## 4. Integration Surfaces

Source Control may show Pull Requests, Versions/Threads, Policies/Checks, Builds/Pipelines, and provider health as capabilities permit. The branch policies Puppet Master shows are the ones evaluated on a pull request. Reading the policies configured on a branch is not offered and no command reads them, so a branch view shows no policies; DL-059 defers that read until the gate list DL-062 establishes exists to display it. Settings routes **Source Control -> Hosting Services -> Azure DevOps** with Connection, Repositories, Security, Tools and Advanced, showing exact Services/Server hierarchy and access/currentness without raw credentials.

## 5. Validation And Acceptance

Acceptance covers Services and signed-supported Server variants; host normalization; account/org/collection/project/repository identity; Entra/PAT/SSH refs; access/scope/license/version/rate failures; PR revisions/threads/votes/policies/checks; builds/pipelines/jobs/run/retry/cancel; service-hook verification/replay/dedupe/recovery; API compatibility/fallback; commands/receipts/ObservableWork; migration; responsive/accessibility fixtures; and production wiring. Of that list, only the adapter-profile, hierarchy and negative-binding legs have fixtures today; the PR revision, thread, vote, policy and check legs are stated acceptance with no fixture written yet, and this document says so rather than implying the coverage exists. Static fixtures are not live Azure evidence.

## 6. Plan-To-Node Readiness

Azure DevOps remains node-blocked until central registration, signed Server support catalog, live adapters, auth/access probes, policy/build/hook/API implementations, migration, wiring, GUI and fresh provider/security/runtime evidence exist. No WorkNode, connection, PR, build, hook or readiness certificate is created here.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- Current Azure DevOps Server versions, APIs, auth methods, access rules, tiers/licenses and feature availability are signed catalog/probe data, not timeless hardcoded claims.
- `cmd.azure_devops.*`, a dedicated Azure panel, raw secret persistence, terminal prose scraping and omitted project identity are forbidden.
- Boards/issues are optional capability projections and are not silently claimed by repository access.
- TFVC is out of scope and is never emulated as Git. An Azure project can hold a TFVC container, and the first thing a new user of such a project meets is a container Puppet Master cannot serve. It is recognized from the provider's own repository-kind data, reported as `tfvc_container_unsupported`, and never inferred from a CLI failure string, a 403 body or an empty Git response.
- Reading the branch policies configured on a branch is deferred, not declined: the closed forge command set has no command that reads them, so the Azure owner promises policy information on a pull request only, and DL-059 records the deferral.
- Requeueing a branch-policy evaluation is not offered today; DL-064 plans the command, and until it compiles this non-goal stands. The provider accepts a requeue on any evaluation, but only build policies act on it, and a build-policy requeue cancels the build already running for that policy. A requeue is therefore a destructive effect on a third object for some policy types and a silent no-op for the rest; if it is ever offered it must name the policy type, disclose the cancellation, and refuse rather than silently succeed where no action follows.
- This owner does not define local Git/JJ, common forge shapes, shared lifecycle, plugin manifests, Settings geometry, command/event catalogs, storage or wiring.

### 7.1 Migration

Migration requires validated variant, host, stable account, organization/collection, project name and `provider_project_id`, provider repository ID, PM `repo_id`, credential/grant ref and capability probe. Missing project, missing `provider_project_id` or missing variant is `needs_binding`; URL parsing is discovery evidence only, and the project GUID is never taken from a URL. Historical PR evidence without immutable revision/policy/check identity remains stale.

## 8. Source Lineage And Governance

This owner compiles Azure DevOps portions of accepted `SCM-05`, `UI-01`, `UI-03`, `CT-01..02` and provider token inventories. Root-owned central registrations and governance outputs remain follow-up.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md

## DL-059 to DL-065 Accepted Azure Decision Planning Addendum - 2026-09-18

This addendum compiles the seven accepted Azure DevOps decision-card answers of 2026-09-18 as accepted planning requirements. It does not change current command or provider enums, admit typed schema variants, register handlers or events, implement runtime behavior or claim readiness. Conditions remain acceptance criteria. The deferred branch-policy read receives no PlanUnit. Cross-owner command, GUI, wiring and contract amendments remain with their canonical owners.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/FinalGUISpec.md

### ADO-006 - Observed Revision Binding For Azure Votes And Policy Evidence

```yaml
plan_unit_id: ADO-006
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  Azure attaches no revision identity to a vote or to a policy evaluation, so that evidence is bound at
  observation: Puppet Master records the provider revision it read the evidence against and labels the binding
  observed by Puppet Master rather than provider-asserted. The observation revision is the whole provider
  revision identity, so a target-branch move or a retarget makes an earlier observation stale exactly as a new
  head does. Evidence observed against an earlier provider revision is shown as stale against the current one.
  Evidence carrying neither a provider-asserted nor an observed-at binding is not shown as current. This is
  DL-060's rule stated where the Azure adapter reads it, and it is the binding the provider-neutral carrier
  planned as FGI-020 applies.
gui_related: true
gui_classification_reason: The observed-at label and the stale marker are what a person reads beside an approval or a policy result before trusting it.
depends_on: [ADO-003, FGI-004]
unblocks: []
acceptance_criteria:
  - Every Azure vote and policy evaluation Puppet Master shows carries the provider revision it was observed against and the label observed by Puppet Master.
  - >-
    Staleness is computed against the whole provider revision identity, so an observation taken before a target
    move, a retarget or a merge-base change is stale even though the head did not move.
  - Evidence with no binding of either kind is not shown as current, and is never silently carried to a new provider revision.
  - No command, handler, event or runtime behaviour is admitted by this unit, and no WorkNode or NodeSeed is created.
validation_surfaces:
  - Plans/azure_devops_integration_fixtures.json
  - >-
    The Azure vote and policy-evaluation fixtures this unit will need do not exist yet, for the reason ADO-003
    states: no Azure review, vote, policy or check fixture exists in any Plans fixture pack. This unit is planned
    and is not yet falsifiable by a fixture.
risk_class: silently_transferred_azure_approval_or_policy_evidence
reasoning_tier: high
context_scope: azure_devops_observed_revision_binding
implementation_surfaces: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md, future Azure review adapter]
node_compile_hint: {mode: azure_devops_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-060, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-002]
preserved_exact_tokens: [observed by Puppet Master, provider-asserted, provider revision, retarget]
negative_constraints: [Do not present an observed-at binding as a provider assertion., Do not treat a head that did not move as evidence that an observation is still current., Do not show evidence with no binding as current.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Forge_Integrations.md]
```

### ADO-007 - Evaluations First Checks View With Unwatched Statuses Shown Separately

```yaml
plan_unit_id: ADO-007
unit_type: requirement
status: accepted
owner_doc: Plans/Azure_DevOps_Integration.md
canonical_text: >-
  On Azure a status check is both a separate API surface and a branch-policy type, so the checks view leads with
  policy evaluations, the list that agrees with what the provider will enforce, and shows any status check that
  no policy watches in a separate informational group that is never presented as a gate. One provider check never
  appears in both groups at once. The single joined list is the stated end state and is admitted only once a
  documented key between a status check and the policy that watches it is established and recorded as evidence;
  until then the two-group form is what ships and the absent key is stated rather than worked around. Each row
  carries the source and enforcement the gate list of DL-062 requires.
gui_related: true
gui_classification_reason: The composition, order and grouping of the checks region are what a person reads to see what will block a merge.
depends_on: [ADO-003, ADO-004, FGI-005]
unblocks: []
acceptance_criteria:
  - Policy evaluations are the primary list, and a status check no policy watches appears in a separate informational group that is not presented as a gate.
  - One provider check never appears in both groups at once.
  - >-
    The joined single list is admitted only on a documented, evidence-bearing key between a status check and the
    policy that watches it. Without that key the two-group form stands and the missing key is stated on the
    surface rather than inferred or guessed.
  - No command, handler, event or runtime behaviour is admitted by this unit, and no WorkNode or NodeSeed is created.
validation_surfaces:
  - Plans/azure_devops_integration_fixtures.json
  - >-
    The Azure policy-evaluation and status-check fixtures this unit will need do not exist yet, so it is planned
    and not yet falsifiable by a fixture.
risk_class: duplicated_or_unenforced_azure_check_presentation
reasoning_tier: high
context_scope: azure_devops_checks_view_composition
implementation_surfaces: [Plans/Azure_DevOps_Integration.md, Plans/Source_Control_System.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: azure_devops_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-061, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-003]
preserved_exact_tokens: [policy evaluations, status check, informational, gate]
negative_constraints: [Do not show one provider check in both groups at once., Do not present an unwatched status check as a gate., Do not join the two lists on an inferred key.]
owner_hints: [Plans/Azure_DevOps_Integration.md, Plans/Source_Control_System.md]
```
