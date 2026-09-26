# Forge Integrations

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes shared envelopes from `Plans/Contracts_V0.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for provider-neutral forge repository binding, independent automation binding, authority roles, capability routing, mirrors, immutable review revisions and threads, pipelines/checks projections, the `repository_automation` / **Actions & Pipelines** shell contract, app/grant/token-lease shapes, webhook verification/dedup/recovery, API compatibility, degradation, provider-neutral commands/events/receipts, and common Forge GUI projections.

## 0. Scope

Puppet Master models a hosted forge independently from local source control. The closed forge identity is `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|generic_host|cursor_origin|none`; `none` is valid only in source-control context and has no forge binding. Forgejo and Gitea are separate provider identities and separate adapters even when they reuse HTTP/auth/pagination/error/cache primitives; `forgejo_or_gitea` is forbidden as a permanent API identity. A forge never becomes an `scm_backend`, local workspace, mutation lease, model provider, or generic `provider` string.

Every forge request carries exact provider, provider variant, normalized host, stable account ID, PM `repo_id`, provider repository ID, organization/workspace/project locator, repository binding generation, requested/effective authority role, requested/effective capability, adapter and signed catalog generation, credential or grant ref, expected revision/currentness, authorization, idempotency, and immutable review revision when applicable. Automation and runner requests additionally carry the independent `automation_binding_ref` and expected automation-binding generation; those values are never inferred from the repository binding.

Common forge contracts preserve provider-native vocabulary and semantics. The GUI may label a GitLab review “Merge Request” and the others “Pull Request”; the durable common identity remains `ForgeReview`. Provider differences are capabilities and adapter mappings, not missing identity fields or terminal-prose fallbacks.

ContractRef: ContractName:Plans/Forge_Integrations.md, SchemaID:pm.forge.repository_binding.v1, ContractName:Plans/Source_Control_System.md

## 1. Ownership And Consumers

### 1.1 Owned here

- `RepositoryForgeBinding`, provider/variant/host/account/repository identity, and binding generation;
- `AutomationBinding`, automation service/provider/instance/account identity, optional repository-binding relationship, capability/catalog/permission/currentness refs, and independent binding generation;
- independent storage/review/checks/automation/issues/transport/mirror authority roles;
- requested/effective `RepositoryCapabilityRouting` and typed unavailable/degraded outcomes;
- `MirrorTopology`, authority transfer fencing, lag, dedupe, detach/reconnect recovery;
- immutable `ForgeReviewRevision`, `ForgeReviewThread`, review versions, Draft-by-default agent behavior, and Mark Ready separation;
- pipeline/check projections, runner administration, releases/assets, repository policy, and `ObservableWork` linkage;
- forge app installation/grant/token-lease record shapes without owning provider secret custody;
- signed webhook delivery verification state, replay/dedupe, fast acknowledgement, async work, inspection/redelivery/recovery;
- `ForgeApiCompatibility`, OpenAPI/contract hash pinning, rate budget, fail-closed mutation, and fallback ladder;
- provider-neutral `cmd.forge.*`, `forge.*`, and command receipt shapes; and
- common Source Control and Settings forge projections without a panel per provider, plus the one canonical `repository_automation` shell occupant labeled **Actions & Pipelines**.

### 1.2 Retained owners

| Domain | Canonical owner | Common forge role |
|---|---|---|
| Local Git/JJ repository, workspace, revision and writer lease | `Plans/Source_Control_System.md`, `Plans/Jujutsu_Integration.md`, `Plans/WorktreeGitImprovement.md` | Consume exact local identities; never select local mutation authority. |
| GitHub API/auth and GitHub Actions | `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md` | Adapt GitHub to common capabilities; retain GitHub-native Actions nouns, pins, rerun, settings, and log recovery inside the provider-neutral shell. |
| GitLab | `Plans/GitLab_Integration.md` | Provider variants, MR/pipeline/tier/version behavior. |
| Azure DevOps | `Plans/Azure_DevOps_Integration.md` | Organization/project/repository/PR/policy/build/access/Server behavior. |
| Bitbucket Cloud/Data Center | `Plans/Bitbucket_Integration.md` | Distinct provider identities, PR/pipeline/build-status/version/license behavior. |
| Cursor Origin Preview | `Plans/Cursor_Origin_Integration.md` | Eligibility, modes, authority/mirrors, App/token/webhook/API/CLI/JJ/health. |
| Credentials, secrets and account selection | `Plans/Multi-Account.md`, `Plans/Permissions_System.md`, credential broker owners | Hold raw secrets and account policy; forge stores refs and grants only. |
| Shared install/auth/connection lifecycle and ObservableWork | `Plans/Shared_Integration_Runtime.md` | Execute lifecycle; forge supplies provider needs and domain receipt facts. |
| Official pages and URL dispatch | owning Browser/Permissions/official-page dispatcher contracts | Validate allowlisted destinations; forge provides route identity only. |
| Commands, events, storage and wiring | `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Wiring_Matrix.production.json` | Register and persist common identities; this doc does not edit central catalogs. |
| Plugin package/manifest grammar | `Plans/Plugins_System.md` | A forge app or adapter consumes a validated installed plugin/component identity only. Any portable `plugin.json` versus PM-native `pm-plugin.json` distinction remains solely Plugins-owned. |

Source Control, Settings, Actions & Pipelines, GitHub Actions provider semantics, Runtime Artifacts, Usage, Assistant Chat, Orchestrator, Onboarding, Doctor, command palette, automation, and provider-specific integrations consume this owner. Consumers must not create provider-local mirror, capability, review revision/thread, webhook, automation-binding, or API-compatibility shapes.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Shared_Integration_Runtime.md

## 2. Canonical PlanUnits

### FGI-001 - Common Forge Authority And Provider Identity

```yaml
plan_unit_id: FGI-001
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Plans/Forge_Integrations.md owns provider-neutral forge binding, authority, capabilities, mirrors, reviews,
  pipelines, independent automation binding, apps, webhooks, API compatibility, commands, events, receipts,
  degradation and projections. forge_provider is independent of scm_backend; each provider owner maps native
  behavior into this common contract, and Forgejo and Gitea remain distinct provider and adapter identities.
gui_related: true
gui_classification_reason: Common forge identity controls visible reviews, pipelines, source-of-truth, mirror, and setup projections.
depends_on: [SCS-001, PDS-003]
unblocks: [FGI-002, FGI-003, FGI-004, FGI-005, FGI-006, FGI-007, FGI-008, ORI-001, GLI-001, ADO-001, BBI-001]
acceptance_criteria:
  - Every hosted repository has one typed provider/variant/host/account/repository binding.
  - Local backend and forge provider remain independent.
  - Forgejo and Gitea never collapse into a permanent combined API identity.
  - Provider owners extend common records without duplicating them.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json]
risk_class: forge_parallel_owner_or_provider_overload
reasoning_tier: high
context_scope: common_forge_owner
implementation_surfaces: [Plans/Forge_Integrations.md, future forge facade]
node_compile_hint: {mode: common_forge_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:TS-04]
preserved_exact_tokens: [forge_provider, RepositoryForgeBinding, AutomationBinding, github, gitlab, azure_devops, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, generic_host, cursor_origin]
negative_constraints: [Do not treat a forge as scm_backend., Do not overload provider., Do not create a separate common contract per provider., Do not define forgejo_or_gitea as a permanent provider or API identity.]
owner_hints: [Plans/Forge_Integrations.md]
```

### FGI-002 - Repository Authority Roles And Mirror Topology

```yaml
plan_unit_id: FGI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  A repository binding models storage, review, checks, issues, transport and mirror authority roles independently;
  its legacy automation role is compatibility projection only and AutomationBinding is the sole hosted-automation
  selector. MirrorTopology records source, destination, authoritative binding, requested/effective mode,
  exact revision fence, dedupe key, lag, health and transition receipt. Detach, reconnect and authority transfer
  require human disclosure, current revisions, Permissions/FileSafe, durable receipt, recovery and capability re-resolution.
gui_related: true
gui_classification_reason: Authority, source of truth, mirror health, lag, detach and reconnect are visible state and actions.
depends_on: [FGI-001, SCS-002]
unblocks: [FGI-003, FGI-007, FGI-008, ORI-002]
acceptance_criteria:
  - Authority roles cannot be inferred from mirror direction or remote name.
  - Repository hosting authority cannot select or imply automation service/provider/account authority.
  - Mirror mutations require current authority and revision fences.
  - Detach and reconnect preserve transition, recovery, dedupe and capability evidence.
validation_surfaces: [MirrorTopology fixtures, split-authority tests, stale detach and duplicate delivery tests]
risk_class: split_brain_forge_authority
reasoning_tier: high
context_scope: forge_authority_and_mirrors
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future mirror coordinator]
node_compile_hint: {mode: forge_authority_mirror_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-01, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [storage, review, checks, automation, issues, transport, mirror, MirrorTopology, revision fence, dedupe]
negative_constraints: [Do not call a mirror authoritative by direction alone., Do not detach without a human warning and durable receipt., Do not silently mutate a secondary provider.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Cursor_Origin_Integration.md]
```

### FGI-003 - Requested Effective Capabilities And Degradation

```yaml
plan_unit_id: FGI-003
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  RepositoryCapabilityRouting evaluates provider variant, host, account, repository, scopes/grants, tier/license,
  server version, adapter version, signed catalog generation, API compatibility, rate budget and currentness for
  each capability. A capability entry is resolved at repository-binding scope by default. Where a provider fixes
  support for one review at creation and never revisits it, a review-scoped entry may narrow the binding-scoped one;
  it is a floor under that ceiling and can never claim more than the binding allows, and the result stays a
  capability limit rather than a permission failure. Self-hosted profiles keep Git transport, general API, and
  Actions state independent; pin detected product/version and supported API schema; and distinguish Actions
  disabled, no runner, no workflow, insufficient permission, and unsupported. A profile's declared unsupported
  reason codes come from one closed vocabulary that is checked, so a declared state is always one the corpus can
  tell from another; the vocabulary is separate from the runtime disabled and error codes because a profile
  declaration is a static claim a provider makes about itself before any request. Unknown or failed compatibility
  disables mutation; a capability is available, degraded, unavailable or unsupported and mutation_safe is stated
  rather than assumed; validated reads may remain degraded and partial data is never complete.
gui_related: true
gui_classification_reason: Capability state controls visible sections, disabled reasons, remediation, and requested/effective disclosure.
depends_on: [FGI-001]
unblocks: [FGI-004, FGI-005, FGI-006, FGI-007, FGI-008]
acceptance_criteria:
  - Every provider operation resolves one capability entry before dispatch.
  - Missing scope, tier, version, rate, offline, managed policy and unsupported states remain distinguishable.
  - >-
    Those states stay distinguishable because the codes a profile declares are drawn from one closed, checked
    vocabulary, `provider_unsupported_reason_code`. A free string array cannot keep them apart: a profile could
    declare a code no consumer recognises and nothing would say so.
  - >-
    A capability whose support the provider fixes per review resolves at review scope with the binding-level entry
    as a ceiling. A review-scoped entry never reports a capability as effective, and a binding-scoped entry never
    names a narrower subject.
  - API-disabled Forgejo/Gitea instances may retain healthy Git fetch/publish; Actions state never stands in for either API or transport state.
  - Mutation cannot proceed under unknown, stale, or failed compatibility.
validation_surfaces: [capability envelope fixtures, provider matrix fixtures, stale and fail-closed mutation tests]
risk_class: capability_widening_or_false_completeness
reasoning_tier: high
context_scope: forge_capability_routing
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future provider adapters]
node_compile_hint: {mode: forge_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [requested, effective, available, degraded, unavailable, unsupported, mutation_safe, partial data is never complete, provider_unsupported_reason_code, review scope]
negative_constraints: [Do not hide unsupported capabilities., Do not downgrade a failed mutation into success., Do not scrape terminal prose as capability proof., Do not admit a profile reason code from outside the closed vocabulary., Do not let a review-scoped entry widen its binding-scoped entry.]
owner_hints: [Plans/Forge_Integrations.md]
```

### FGI-004 - Immutable Review Revisions, Threads, And Draft Policy

```yaml
plan_unit_id: FGI-004
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  ForgeReviewRevision binds provider review identity, version, exact base/head/merge-base and evidence refs.
  A new provider revision creates a new revision and stales or revalidates prior approvals, tests, captures and
  audits. Identity is the whole triple, so any leg of base, head or merge-base changing is a new revision: a
  target-branch move or a retarget stales evidence with no head change at all. The revision names which of those
  paths made it stale, because reporting five different causes as stale_head_changed is false in four of them, and
  it states separately whether its own contents are complete, because a revision can be current and truncated at
  the same time. ForgeReviewThread binds exact revision, path/range, participants, comments, resolution actor/state,
  evidence and blocking status. A thread's position is a projection onto the revision window it was read through
  rather than a stored fact, so its anchor carries both sides of that window, the revision it was created against,
  and whether the provider supplied a durable tracking identity; a partial anchor tuple is never persisted.
  Agent-authored reviews default Draft unless explicit Project policy permits otherwise; Mark Ready is distinct.
gui_related: true
gui_classification_reason: Reviews, versions, threads, Draft/Ready, evidence staleness and actions are user-visible.
depends_on: [FGI-003]
unblocks: [FGI-005, FGI-008]
acceptance_criteria:
  - Review evidence cannot silently transfer to a new head revision.
  - Thread resolution is scoped to one immutable review revision and actor.
  - Agent review creation defaults Draft and Mark Ready uses a separate command and receipt.
  - >-
    A revision names the cause of its own state in `evidence_state_cause`. Current evidence carries no staleness
    cause; a stale or revalidation-required revision names which path produced it, and stale_head_changed means the
    head actually moved.
  - >-
    Completeness is a separate axis from staleness. `contents_complete` states whether the revision's own contents
    are whole and, when they are not, which truncation produced that; a complete revision cannot also name a
    truncation, and an incomplete one cannot stay silent about why.
  - >-
    A thread's `revision_anchor` is the whole window. It carries the revision the thread was created against, the
    left and right sides it was read through, and a tracking state of tracked, no tracking record, or not
    applicable; a tracked anchor names the tracking identity it was tracked by, and no partial anchor tuple is
    persisted.
validation_surfaces: [review revision/thread fixtures, stale-head gate tests, Draft/Mark Ready policy tests, compact query fixtures]
risk_class: stale_review_evidence_or_agent_publication
reasoning_tier: high
context_scope: forge_reviews
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future review adapters]
node_compile_hint: {mode: immutable_forge_review_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04]
preserved_exact_tokens: [ForgeReviewRevision, ForgeReviewThread, Draft, Mark Ready, stale_head_changed, evidence_state_cause, contents_complete, revision_anchor]
negative_constraints: [Do not reuse approvals across a changed head., Do not publish an agent review as Ready by default., Do not inject a whole review when a compact query suffices., Do not report a staleness with no head change as stale_head_changed., Do not present a truncated revision as complete., Do not persist a partial thread anchor tuple.]
owner_hints: [Plans/Forge_Integrations.md]
```

### FGI-005 - Pipelines, Checks, Jobs, And Observable Work

```yaml
plan_unit_id: FGI-005
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Forge pipelines/checks are provider-neutral projections of provider-native pipeline, build, Actions, job and check
  identities, bound through an independent AutomationBinding and to repository/review revision where applicable.
  Automation authority is never inferred from Git hosting authority. Run, retry, cancel, approval and runner administration
  are asynchronous guarded work using ObservableWork; list/refresh/open preserve projection currentness. Historical,
  stale, partial, cancelled, Actions-disabled, no-runner, no-workflow and insufficient-permission results remain
  explicit. Every branch policy or status check a review carries is one typed gate record rather than an opaque
  reference: it holds the identity the provider supplied, whether it is required or advisory, a normalized status
  from one closed vocabulary, and the source surface it came from, because two provider surfaces can carry the same
  wire word with opposite meanings. A gate record also declares what its status is bound to. A revision-bound gate
  was posted against one revision; a review-bound gate is evaluated by the provider against the merge of source and
  target, carries the merge triple rather than a head fence, and cannot be head-scoped at all, so sending it a head
  key the endpoint never receives is not enforcement. A gate list that was cut short says so and says where to
  resume. A policy request identifies one provider configuration and the scope entry that made it apply, and fences
  the whole applicable set per configuration, because membership can change without any member's revision changing.
  A gate whose provider publishes no human-facing page carries no URL and states why; a synthesized portal link is
  admissible only when it is labelled synthesized.
gui_related: true
gui_classification_reason: Pipeline/check state, jobs, logs, actions, progress, and degraded history are visible.
depends_on: [FGI-003, FGI-004]
unblocks: [FGI-008]
acceptance_criteria:
  - Provider-native jobs/builds/checks map without losing identity or currentness.
  - Pipeline and runner requests carry an exact automation binding and expected automation-binding generation even when its provider differs from the repository host.
  - Accepted async mutation returns ObservableWork and one terminal provider result.
  - A stale or partial pipeline projection cannot authorize retry/cancel without direct validation.
  - >-
    Whether each gate currently passes is answerable from the record. Enforcement is required, advisory, not
    enforced or unknown; the status vocabulary keeps requirement_bypassed apart from not_applicable and errored
    apart from failed, and none of them is folded into a pipeline-run state or a generic unavailable.
  - >-
    A gate declares its binding kind. A revision-bound row names the revision its status was posted against; a
    review-bound row names the merge commit, merge source commit and merge target commit it was evaluated against
    and carries no revision fence. A request for one family cannot be fenced as though it were the other.
  - >-
    A truncated gate or policy list is distinguishable from a complete one and carries the cursor that resumes it,
    and policy_set_partial names that state; a complete list carries no cursor.
  - >-
    A policy request names one provider configuration and the scope entry that made it apply, and carries a
    per-configuration expected-revision set with a membership digest. One scalar revision cannot fence a set.
validation_surfaces: [pipeline projection fixtures, retry/cancel idempotency tests, stale history and partial result tests]
risk_class: pipeline_mutation_or_progress_misrepresentation
reasoning_tier: high
context_scope: forge_pipelines_and_checks
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/Shared_Integration_Runtime.md, future pipeline adapters]
node_compile_hint: {mode: forge_pipeline_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:TS-04]
preserved_exact_tokens: [pipeline, build, jobs, checks, ObservableWork, partial, stale, gate record, requirement_bypassed, policy_set_partial, binding kind]
negative_constraints: [Do not infer progress from elapsed time., Do not call partial history complete., Do not retry or cancel from a stale projection., Do not fence a review-bound gate with a head revision., Do not present a truncated gate list as complete., Do not identify a branch policy by a branch name., Do not present a synthesized link as the provider's own.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Shared_Integration_Runtime.md]
```

### FGI-006 - Apps, Grants, Token Leases, Webhooks, And Secret Boundary

```yaml
plan_unit_id: FGI-006
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Forge app records store stable installation identity, account, non-secret grant refs, state and credential-key
  ref only. Token leases are least-privilege, repository/scope-bound, expiring and revocable and persist no raw token.
  Webhooks verify provider signature over raw body before parsing, validate time/context, reject replay, dedupe by stable
  delivery identity, acknowledge quickly, process asynchronously, and preserve retry/inspection/redelivery/recovery state.
gui_related: true
gui_classification_reason: App/grant/reauthorization and webhook health/recovery are visible Settings state and actions.
depends_on: [FGI-003]
unblocks: [FGI-007, FGI-008, ORI-003]
acceptance_criteria:
  - Raw secrets never enter forge records, events, logs, Project files, chat, prompts, or ordinary receipts.
  - Signature verification occurs before payload parse and replay/dedupe checks precede effects.
  - Duplicate delivery produces at most one effect and remains inspectable.
validation_surfaces: [app/token/webhook schema fixtures, secret scans, signature-before-parse tests, replay/dedupe/redelivery tests]
risk_class: forge_secret_or_webhook_replay
reasoning_tier: high
context_scope: forge_apps_webhooks_security
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future credential broker, future webhook ingress]
node_compile_hint: {mode: forge_app_webhook_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-02..03, source_ref:egolite-register:SEC-02..03]
preserved_exact_tokens: [ForgeAppInstallation, ForgeInstallationTokenLease, raw-body, signature before parse, replay, dedupe, redelivery]
negative_constraints: [Do not persist raw tokens., Do not parse before signature verification., Do not perform duplicate delivery effects., Do not expose webhook or broker IPC publicly.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Multi-Account.md, Plans/Permissions_System.md]
```

### FGI-007 - API Compatibility, Rate Budgets, And Fallback Ladder

```yaml
plan_unit_id: FGI-007
unit_type: invariant
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  ForgeApiCompatibility pins provider/variant, adapter version, OpenAPI hash or contract hash, signed catalog
  generation, probe, endpoints, scopes, features, mutation safety, requested/effective capability, rate budget and
  currentness. The endpoint pin is per endpoint. One host can serve two routes of the same request family at two
  different API versions and release states, so each probed endpoint records the version and release state it
  answered at, and one adapter version, catalog generation or contract hash cannot stand in for them. A
  customer-hosted instance of any provider, not only the Actions-based self-hosted products, may carry the typed
  instance profile that records its normalized host, API base path, detected product and version, transport and API
  state, trust material and currentness.
  Retry-After is honored with bounded coalescing, jitter and backoff. The fallback ladder is validated API read,
  low-level Git data, Git transport, narrow version-gated structured-JSON CLI, or official provider page; never prose scraping.
gui_related: true
gui_classification_reason: Compatibility, rate limits, degraded reads, disabled mutations, and fallbacks are visible health and remediation.
depends_on: [FGI-002, FGI-003, FGI-006]
unblocks: [FGI-008]
acceptance_criteria:
  - Unknown compatibility fails mutation closed while explicitly admitted reads may remain degraded.
  - Retry respects provider budgets and does not create retry storms or duplicate effects.
  - Every fallback is typed and evidence-bearing; partial data remains partial.
  - >-
    Every probed endpoint carries its own `api_version` and `release_state`, and a bare endpoint name is rejected. A
    capability that depends on a preview-only or absent route degrades on its own and reports
    capability_unsupported naming the version that was looked for, rather than taking its neighbours with it.
  - >-
    A customer-hosted instance of a provider with per-instance host, base path and version can carry an instance
    profile; trust validation is not reserved to one product family.
validation_surfaces: [API compatibility fixtures, rate-limit/backoff tests, CLI JSON version gate tests, no-prose-scrape negatives]
risk_class: forge_api_drift_or_unsafe_fallback
reasoning_tier: high
context_scope: forge_api_compatibility
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future signed provider catalog]
node_compile_hint: {mode: forge_api_compatibility_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-03, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [ForgeApiCompatibility, OpenAPI hash, catalog generation, Retry-After, structured-JSON CLI, partial, api_version, release_state]
negative_constraints: [Do not scrape terminal prose., Do not mutate on unknown compatibility., Do not ignore Retry-After., Do not call fallback data complete., Do not pin one API version for a host or a product when its endpoints differ.]
owner_hints: [Plans/Forge_Integrations.md]
```

### FGI-008 - Common Forge GUI, Settings, Commands, Receipts, And Migration

```yaml
plan_unit_id: FGI-008
unit_type: validation
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Forge review and hosting behavior appears in Source Control and its Settings manager, while hosted automation uses
  exactly one canonical `repository_automation` occupant labeled Actions & Pipelines, never a panel per provider.
  Provider-native PR/MR, Actions/Pipelines/build/check wording comes from the selected repository or independent
  automation adapter. Every visible action dispatches one cmd.forge.* or shared setup command with exact binding,
  target, permission and currentness data, returns a typed receipt and ObservableWork when async, and never infers
  automation authority from the Git remote, display name, or RepositoryForgeBinding.
gui_related: true
gui_classification_reason: This unit defines visible common forge placement, vocabulary, actions, progress, health, and migration state.
depends_on: [FGI-002, FGI-003, FGI-004, FGI-005, FGI-006, FGI-007, SCS-005]
unblocks: []
acceptance_criteria:
  - No provider adds a dedicated rail/panel or provider-specific command namespace; `github_actions` is migration-read/route input only and normalizes to `repository_automation`.
  - Visible actions converge on one canonical command with exact provider/binding/target/currentness/permission payload.
  - Every one of the 46 existing legacy Forge commands retains one schema-valid request and one rejected permission/guard/currentness negative fixture; FGI-021 separately requires actual positive and causal negative fixtures for the new team-project child command.
  - Review checkout keeps separate-workspace placement and also permits current-workspace placement only when explicitly chosen after the existing safety preview (DL-097, PCC-REVIEW-CHECKOUT-001); local work is preserved in either placement and no preview or mutation-safety requirement is waived.
  - GitHub retains its provider-native Actions content inside the generic shell; a Git remote named Origin never fabricates an Origin Actions service.
  - Legacy hosted records migrate only from validated provider identity; ambiguous records remain blocked.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, provider GUI fixtures, command/wiring census, migration fixtures, accessibility and degraded-state tests]
risk_class: forge_gui_command_or_migration_drift
reasoning_tier: high
context_scope: forge_gui_settings_commands_migration
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: forge_gui_command_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01..03, source_ref:egolite-register:CT-01..02, Plans/Decision_Log.md#DL-097]
preserved_exact_tokens: [cmd.forge.*, Pull Request, Merge Request, Ready with limits, Needs attention, Not available]
negative_constraints: [Do not create cmd.origin.*, cmd.gitlab.*, cmd.azure_devops.*, or cmd.bitbucket.* primary namespaces., Do not infer provider from display copy., Do not call command dispatch completion., Do not silently default review checkout to the current workspace or waive any preview or mutation-safety requirement for either placement.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Source_Control_System.md, Plans/Settings_System.md]
```

## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/forge_integration_contracts.schema.json` owns common Draft 2020-12 record shapes, including provider-neutral discriminated command request, result, error, availability, disabled-reason, currentness, target, confirmation, allowlisted official-page/protected-browser handoff, webhook-redelivery, and receipt records. `Plans/forge_integration_contract_fixtures.json` owns provider-neutral positive and negative examples, including one valid request and one rejected permission-negative for every canonical Forge command plus focused provider-identity, stale/partial-currentness, mirror, immutable review, pipeline, webhook, protected-browser, confirmation, effect-unknown, and secret-boundary negatives. Provider fixture files validate adapter-profile and provider-specific cases against the common schema; they do not create competing provider schemas.

### 3.1 Canonical commands

```text
cmd.forge.repository.list
cmd.forge.repository.refresh
cmd.forge.repository.create
cmd.forge.repository.fork
cmd.forge.repository.policy.preview
cmd.forge.repository.policy.apply
cmd.forge.repository.open_in_browser
cmd.forge.mirror.connect
cmd.forge.mirror.sync
cmd.forge.mirror.inspect
cmd.forge.mirror.detach
cmd.forge.review.create
cmd.forge.review.open
cmd.forge.review.refresh
cmd.forge.review.mark_ready
cmd.forge.review.approve
cmd.forge.review.request_changes
cmd.forge.review.comment
cmd.forge.review.merge
cmd.forge.review.close
cmd.forge.review.reopen
cmd.forge.review.checkout
cmd.forge.review.checks
cmd.forge.review.open_in_browser
cmd.forge.review.thread.list
cmd.forge.review.thread.reply
cmd.forge.review.thread.resolve
cmd.forge.review.thread.reopen
cmd.forge.review.version.open
cmd.forge.review.version.compare
cmd.forge.pipeline.list
cmd.forge.pipeline.refresh
cmd.forge.pipeline.run
cmd.forge.pipeline.retry
cmd.forge.pipeline.cancel
cmd.forge.pipeline.approve
cmd.forge.pipeline.open_job
cmd.forge.pipeline.open_logs
cmd.forge.pipeline.open_in_browser
cmd.forge.webhook.delivery.list
cmd.forge.webhook.redeliver
cmd.forge.runner.registration.apply
cmd.forge.runner.remove
cmd.forge.release.list
cmd.forge.release.asset.download
cmd.forge.connection.reauthorize
```

Setup reuses shared runtime commands: `cmd.integration.connection.add|update|test|remove|open_details`, `cmd.auth_profile.sign_in|sign_out|verify|cancel|retry|submit_code|open_official_page|select`, and `cmd.installation.install|select|verify|repair|rollback`. Provider behavior is a typed payload discriminator, never a new provider command namespace.

Compatibility normalization:

```text
cmd.source_control.pr.create -> cmd.forge.review.create {provider: github}
cmd.source_control.pr.merge  -> cmd.forge.review.merge  {provider: github}
cmd.github.pr.create -> cmd.forge.review.create {provider: github}
cmd.actions.* | cmd.github_actions.* -> command-owner-adjudicated cmd.github.actions.*
github_actions panel/route/bookmark/deep-link input -> repository_automation with a GitHub AutomationBinding
cmd.origin.* -> forbidden
```

None of the nine 2026-09-01 command admissions is an alias: repository fork is not create, pipeline approval is not review approval, review checks are not pipeline open/list, policy preview/apply is not generic settings mutation, runner administration is not connection removal, and releases/assets are not pipeline artifacts. `AutomationBinding` is not an alias of `RepositoryForgeBinding`; Forgejo is not an alias of Gitea.

### 3.2 Canonical event candidates pending Event Authority

```text
forge.connection.validated
forge.connection.capabilities_changed
forge.connection.reauthorized
forge.repository.discovered
forge.repository.eligibility_changed
forge.repository.created
forge.repository.authority_changed
forge.mirror.connected
forge.mirror.sync_started
forge.mirror.sync_completed
forge.mirror.status_changed
forge.mirror.degraded
forge.mirror.detached
forge.review.created
forge.review.updated
forge.review.marked_ready
forge.review.approved
forge.review.changes_requested
forge.review.merged
forge.review.closed
forge.review.reopened
forge.review.version_created
forge.review.thread.replied
forge.review.thread.resolved
forge.review.thread.reopened
forge.pipeline.started
forge.pipeline.retried
forge.pipeline.cancelled
forge.pipeline.completed
forge.webhook.received
forge.webhook.rejected
forge.webhook.delivery_failed
forge.webhook.redelivery_queued
forge.webhook.delivery_recovered
forge.api.compatibility_changed
```

These names remain semantic-owner candidates only. This command-contract pass does not admit any candidate into the central Event Authority registry and does not bind any command to a persisted event. The event envelope and persistence remain central-owner responsibilities. The common command receipt carries provider, repository binding, requested/effective authority, immutable review revision, expected binding generation, credential/grant ref, idempotency, outcome, `ObservableWork`, event refs, and recovery actions; `event_refs` may remain empty until an admitted event or explicit no-persist disposition exists.

### 3.3 Typed command admission and result boundary

The historical `command_id` enum remains exactly the 46 existing IDs in §3.1; FGI-021 separately specifies `cmd.forge.team_project.create` through a new concrete current-admission arm, not by widening that legacy enum. Two (`cmd.forge.review.create` and `cmd.forge.review.merge`) retain their provider-owner routes, `cmd.forge.repository.create` retains the separate common route bound by FGI-009, and the remaining 43 use the FGI-010 common central Forge route set (the prior 34 plus nine new command admissions). The nine new commands start `handler_unavailable`, require `expected_event_types=[]`, and do not gain runtime credit from schema, fixture, catalog, handler-name, or static wiring presence. One provider-neutral request object carries exact provider and variant, normalized host, stable account, PM and provider repository binding, expected binding generation, optional independent automation binding and expected automation-binding generation where required, requested/effective authority, requested capability, catalog/API currentness, non-secret credential/grant ref, permission snapshot, target-bound preflight, optional confirmation, target identity, availability, FileSafe decision for local writes, and `ObservableWork` when admitted asynchronous work requires it.

Family-level conditionals select repository, mirror, review, immutable review thread/version, pipeline/job, webhook delivery, or connection targets without provider-specific peer request types. Mutations require current binding/catalog/API evidence, `mutation_safety=verified`, direct execution-time revalidation, effective authority, permission, and idempotency. Destructive or publication-sensitive actions require target-bound confirmation. Review/thread/version commands require immutable revision identities. Pipeline run/retry/cancel require current direct validation and `ObservableWork`; stale or partial projections cannot validate as dispatch-admitted mutations. Mirror mutation requires verified authority. Webhook redelivery requires signature-before-parse, fresh replay state, dedupe state, exact delivery identity, and redelivery idempotency.

Results distinguish `accepted`, `succeeded`, `blocked`, `degraded`, `failed`, `cancelled`, `recovery_required`, and `effect_unknown`. Acceptance requires `ObservableWork`; success requires a separate terminal provider result and receipt; `effect_unknown` requires a typed error and reconciliation-only retry. Availability and error codes are closed owner vocabularies. No request may infer provider/repository identity from remote text. No schema defines a native/provider handler, provider-specific peer common command namespace, persisted event binding, central registration, or runtime proof.

### 3.4 Original selected-operation values

Exact cmd.forge.review.create retains original head/base RepositoryBindings, refs and immutable object IDs, submitted title/body/draft and nullable selected approved publication. Current focus/newest heads cannot replace them. The provider-owner route remains unchanged; this companion does not add create to the common 43-command provider routing set. No existing review/thread is fabricated. Agent-authored non-Draft requires actual explicit Project policy, not a submitted allow flag; Mark Ready is separate.

The source token `publication_ref` means the optional approved publication selection. Its current typed materialization resolves the genuine Git/JJ association and selected destination; it is not an extra public field or an opaque reference sufficient for authorization.

The provider-issued creation observation preserves original selection separately from genuinely returned review identity and any actual immutable review revision. Incomplete provider responses never fabricate a complete base/head/merge-base triple. Known created effects survive later failure/cancellation; unknown creation remains same-operation reconciliation. Accepted work is genuine nonterminal work, not a successful review.

Publication selection is disjoint null, ordinary Git, or existing selected JJ. Null authorizes no push. Nonnull resolves the genuine Source Control original/approved association and exact selected destination/ref/head; source repository/context may differ from a destination/fork, and publication invocation IDs remain distinct from review-create IDs. Current provider/native owner authenticates that relation; URL text/shared OIDs are not authority. Selected-target success never becomes whole-fanout success. No automatic publication, all-peer success policy, new provider support or backend conversion is introduced.

ContractRef: ContractName:Plans/forge_review_create_selected_contracts.schema.json

For exactly cmd.forge.pipeline.run, retain independent AutomationBinding/generation, the actual provider-native definition and immutable source revision, the exact submitted typed inputs and genuine owner-issued run preview. A new closed run definition descriptor binds these to actual adapter/catalog/API/capability evidence; an opaque existing definition reference or caller-provided JSON bag is not that descriptor. Supplied input fields are unique by native identity. Type, explicit null, empty value and absence remain distinct. Homogeneous lists retain native order and repeated values unless the actual descriptor requires uniqueness. No PM default, coercion, sorting or deduplication is inferred.

The admitted descriptor grammar contains text/integer/boolean/enum/resource scalars, corresponding homogeneous lists, explicit nullable values, actual enum/resource constraints, supplied integer/text/list bounds and finite requires/excludes dependencies. No executable validators, arbitrary schema references or generic object escape is admitted. Native definitions requiring unsupported nested/heterogeneous/nonintegral or richer forms remain explicitly unadmitted typed cases, not silently narrowed or claimed universally covered. Populating faithfully representable native definitions remains implementation work.

The actual preview preserves every submitted value. For omitted inputs, it distinguishes a genuinely provider-resolved effective value from retained omission; no caller manufactures defaults. Definition completeness, omission semantics and provider-resolved values require authentic native evidence for that exact immutable revision. Secret input bytes or redeemable handles gain no ordinary metadata route; definitions requiring an unadmitted secure-input mechanism remain unavailable here. A changed definition, revision, input or relevant native fence invalidates the preview. Current native capability/permission/credential/binding and applicable lease are revalidated immediately before submission.

Requested definition, any authentic preexisting pipeline context and actually returned run/work identities are distinct. A returned identity is native evidence, not guessed from the definition or required to differ from an existing run. Accepted requires genuine nonterminal ObservableWork; cancellation before submission fabricates no work or run. Failed/cancelled results preserve issued work and partial effects; unknown effects retain same-operation reconciliation and cannot coexist with no-effect assertions or authorize blind resubmission.

The exact request/result composes actual common Forge authority/receipt/error with genuine original SIR identity, caller, current return context and actual central response. A nullable safe-error projection preserves cancelled-null UI behavior while retaining the true owner error. Actual originals and resolved values remain immutable across all helpers; final current disclosure is independently checked. Static fixtures supply no native authentication or execution proof.

The nested run authority is an explicitly versioned materialization: preserve every common predecessor condition except schema/command discrimination and removal of allOf[14]'s nonnull pipeline_id and observable_work_id restrictions for this command only. Keep allOf[31]'s nonnull definition guard. Preserve any genuine nullable preexisting pipeline context without inventing a future run; accepted still needs real work. Exact predecessor-diff regression is mandatory; historical common authority stays unchanged.

No command, provider support, event, handler availability, store, TTL, secure-input route or default policy is added. New logical descriptor/preview/revalidation/observation/original custody still requires explicit admission before persistence. Native producer, effect engine, proof fences and current disclosure remain unbuilt prerequisites.

ContractRef: ContractName:Plans/forge_run_selected_contracts.schema.json

For exactly `cmd.forge.pipeline.retry`, the selected successor preserves the original independent AutomationBinding/generation, provider-native run and explicit `supported_failed_jobs|all|selected` scope, with an authentic retry preview and direct current owner revalidation. Selected member identities retain provider-native kind, parent and ancestry within that run; no displayed label, latest projection or guessed universal job tree is identity. Selected members are a duplicate-free exact set. Failed/all scopes retain actual provider-scoped operations without fabricating a complete enumeration. They cannot silently become selected subsets, and an unsupported scope cannot become all.

The new typed retry preview is an explicit owner materialization, not an assertion that an existing untyped reference already supplies its contents. It binds the exact selection to the native run projection and opaque owner/provider revision evidence. Direct revalidation authenticates that retained preview immediately before the effect under current capability, permission, credential, binding generation and any existing lease. Original preview observation and invocation/admission remain distinct. Native owner adapters authenticate actual hierarchy, preview eligibility and submitted operation; structural validation does not authorize a provider effect.

The selected observation retains actual provider submission receipt, original scope, and separately identified returned provider work. A returned work identity is not invented or required to differ from the original run. Member effects may record genuine partial evidence; a provider-scoped operation does not require an invented enumerated complete member list. Selected completion accounts for every selected member, while failures, cancellation and uncertainty preserve any known issued work and member effects. Unknown effects retain same-operation reconciliation and prohibit blind resubmission. Accepted uses genuine nonterminal ObservableWork without terminal evidence; pre-submission cancellation does not fabricate native work. Known applied or uncertain effect evidence cannot coexist with an error claiming no effect.

The new retry request/result, preview, direct revalidation, observation, SIR original and error projection are logical contract materializations only. Physical original/preview/observation custody and native production/admission remain pending. No new store, TTL, event, default retry policy, provider guarantee, command or handler availability is admitted. Existing historical common requests and all other successors remain unchanged.

The nested `pm.forge.retry_selected.authority.v1` is explicitly new: materialize the unchanged common request using absolute predecessor references, pin this command, and remove only the nonnull observable_work_id restriction in the pipeline-mutation conditional. Its required nonnull target.pipeline_id guard remains. The base nullable work field can therefore represent cancellation before work exists; accepted retry still requires actual nonterminal ObservableWork through result composition. A predecessor-diff regression permits only this removal and the schema/command discriminator changes. Historical common admission is not relaxed.

ContractRef: ContractName:Plans/forge_retry_selected_contracts.schema.json

For exactly `cmd.forge.repository.list` and `cmd.forge.pipeline.list`, Forge materializes a versioned provider-query descriptor and immutable selected-query original. The authenticated provider adapter produces the descriptor for the actual provider/variant/host/account, endpoint version/release state and signed catalog/capability revision under FGI007. This is a new explicit query-owner interface: the existing API compatibility/catalog references and creation-field catalog do not already supply its grammar. The descriptor grants no read or mutation authority.

Actual descriptor fields declare supported typed operator/operand alternatives, scalar/list cardinality, enum/resource scope, explicit null/absence behavior and finite cross-field restrictions. Selected values validate against resolved original descriptor bytes, not an opaque JSON bag, arbitrary executable expression or external schema URL. Unsupported expression structures remain an explicit interface limit until genuinely materialized; a fixture descriptor does not establish a provider-wide vocabulary. No universal operator set, default sorting, page limit, implicit all-history scope or unsupported-filter coercion is chosen. Actual owner ordering and continuation selections are explicit descriptor fields only where genuinely supported.

Repository listing preserves admitted account/container or repository scope, including the existing null-Project precommit account-list branch and its original initiating Client/return focus. No committed Project or repository binding is fabricated. Pipeline listing preserves its actual AutomationBinding and independent generation, native run identity and hierarchy; repository generation cannot stand in for automation generation. Both are read-only and perform no write probes or hidden mutation. Selection changes invalidate dependent continuation/admission without replacing historical original selection.

The list read owner produces a new exact read-projection receipt and source window. Each returned repository or pipeline is a genuine typed owner projection, not an arbitrary item bag; unbound discovered repository identity is distinct from PM repository binding. Original descriptor/query and previous page identity fence actual continuations; token metadata is not a secret cursor or read grant. Page completeness, data freshness, query completion and terminal outcome remain distinct, including authentic partial/stale results and failures retaining observed rows. A null continuation alone never proves complete. Missing native interfaces remain unimplemented obligations, not invented unsupported evidence or successful empty results.

Descriptor/original versions and read receipt/source windows require explicit physical-registration-pending custody where retained; transport and safe projections remain nonpersisted. Existing catalog ownership does not admit a new physical writer. No durable secret/provider cursor bytes, new TTL, source lifetime extension, fallback write probe, effect receipt or event is introduced. Native descriptor, resource, read-admission, source-window and current-disclosure producers must authenticate actual facts independently of the static fixtures.

For this exact read profile, common Forge `degraded` maps to central `succeeded` only as completion of an actual read operation whose required source window and read receipt retain explicit partial/cached/stale/unknown-completeness facts. It never means a complete or fresh dataset. Failed/cancelled reads retain actual observed rows and errors; no mutation outcome or historical shared enum is redefined. A successful current page may have continuation without claiming the entire query dataset is complete. Currentness, completeness and operation completion are independently owner-authenticated.

ContractRef: ContractName:Plans/forge_list_query_contracts.schema.json

For exactly `cmd.forge.review.comment`, `Plans/forge_review_comment_contracts.schema.json` retains the actual original RepositoryBinding/review identity, exact submitted body and explicit nullable selected revision/line anchor. Null means an unanchored review comment, never permission to select a current line later. A nonnull anchor reuses the complete revision-window/tracking, path and range grammars and authentic provider qualification for the selected review; it is not a fabricated pre-existing ForgeReviewThread. Resolve actual immutable base/head/merge-base values with independent completeness/currentness. A provider comment/thread or new tracking identity is recorded only when actually returned. Unsupported anchored capability is refused rather than converted to an unanchored effect.

Actual provider comment observation binds original body/review/anchor to the common operation/result/receipt and issued comment identity, retaining genuine returned thread/anchor facts without assuming every provider represents comments as threads. Returned tracking may be newly issued; selected path/range and revision window cannot silently move. Accepted ObservableWork is not a posted comment and cannot be terminal or carry a terminal receipt. Success requires actual provider completion; known applied effects survive cancellation and uncertain effects remain reconciliation-only. Replay cannot repost. Existing permission, credential, currentness and current disclosure/caller apply; no resolution, approval, Draft/Ready, checkout, provider expansion, new command/event/store or runtime proof follows. Physical original/observation custody remains pending.

For exactly `cmd.forge.review.thread.reply`, `Plans/forge_thread_reply_contracts.schema.json` preserves the actual original RepositoryBinding/review/thread and immutable review revision, submitted body, and any explicitly selected change version. Resolve the actual existing ForgeReviewThread and ForgeReviewRevision; a displayed line number or latest thread projection is not identity. Reuse the whole current revision-window/tracking tuple without reconstructing or narrowing it, preserving the complete base/head/merge-base triple and independent completeness/currentness. Null optional change version means no additional version operand, never permission to replace the original revision or thread with latest. Native provider ownership validates actual version and reply capability; no universal provider codec or head-only tracking is invented.

The actual provider reply observation binds original thread/revision/version/body and issued provider reply identity to the unchanged common operation/receipt and authentic SIR original/current caller. Accepted work is not a posted reply: it uses an actual nonterminal acceptance snapshot with no terminal receipt, never later terminal work. Success requires actual provider reply evidence; unknown effects remain reconciliation-only and replay never reposts. Current authority/disclosure remain mandatory. No checkout, Draft/Ready transition, thread resolution, provider expansion, new command/event/store or retention follows; native proof and physical original/observation custody remain pending.


The following existing commands preserve the user's original selected values in addition to section 3.3's authority/currentness envelope. Current focus, a binding's latest revision, an opaque reference without its authenticated owner contents, or a generic free-text intent cannot substitute for that selection. This requirement does not reinterpret historical v1 requests, enroll a successor schema, add a command, change a provider route, or enable a handler; typed request/result companions remain required where the current carrier omits these values.

| Existing command | Original selected values and existing-owner join |
| --- | --- |
| `cmd.forge.review.create` | Head and base refs with immutable object IDs, exact title/body and draft choice, and an approved publication reference when selected; preserve the provider-owner route and Source Control context rather than inventing a thread. |
| `cmd.forge.review.approve` | Exact review/head plus the optional submitted review body. |
| `cmd.forge.review.request_changes` | Exact review/head and submitted body. |
| `cmd.forge.review.comment` | Exact review and body plus any selected revision/line anchor, using the existing revision-window/tracking semantics rather than treating displayed line numbers as permanent identity. |
| `cmd.forge.review.thread.reply` | Exact review/thread, submitted body and any selected change version; preserve the existing immutable review revision and thread owner. |
| `cmd.forge.review.checkout` | Selected Source Location, explicit checkout placement, and exact Source Control checkout preview/handoff, with FileSafe and current local-write authority; this is not merely opening a review. Placement keeps separate-workspace checkout and also permits current-workspace checkout only when explicitly chosen after the existing safety preview; local work is preserved in either placement and no preview or mutation-safety requirement is waived. |
| `cmd.forge.repository.list` | Original repository filter within the admitted account/container or repository scope; the existing precommit account-list scope remains read-only and does not create or bind a Project. |
| `cmd.forge.pipeline.list` | Original run filter within the selected AutomationBinding, not the latest visible panel filter. |
| `cmd.forge.pipeline.run` | Selected definition, immutable revision, actual provider-validated inputs and exact run preview. Provider input validation belongs to the admitted provider definition, not an invented universal argument bag. |
| `cmd.forge.pipeline.cancel` | Exact run and expected provider state/revision authenticated at execution; approval's separate required revision rule does not implicitly supply cancellation's missing selected-state binding. |
| `cmd.forge.pipeline.retry` | Selected supported failed-jobs, all, or selected retry scope and its exact preview; unsupported provider scopes remain unavailable rather than silently broadening to all. |
| `cmd.forge.pipeline.open_logs` | Exact run, optional selected job/stage and original pagination cursor; current permission and redaction still govern disclosure. |

Selected inputs, any owner-issued preview and actual results must correlate to the same original command, provider/account, repository or automation binding and generation. A changed input invalidates its preview. Effectful commands revalidate current authority immediately before dispatch; read-only commands gain no write authority from filters or cursors. Accepted work is not terminal success. Result/replay preserves original selection, actual provider receipts and reconciliation of uncertain effects, without resubmitting an external effect or replacing original values with current UI state. No new persisted event, credential payload, provider capability or Azure-specific behavior is introduced.

Per DL-097 (PCC-REVIEW-CHECKOUT-001), `cmd.forge.review.checkout` keeps separate-workspace checkout and also permits current-workspace checkout only when explicitly chosen after the existing safety preview. The explicit placement choice is part of the original selection alongside the exact Source Location; it binds the backend-qualified Source Control checkout preview/handoff with FileSafe, current local-write authority, and the existing §3.3 mutation guards. Local work is preserved in either placement: an admitted checkout may establish its intended target state, but no preview authorizes discarding or overwriting existing dirty/uncommitted work. Current-workspace checkout is never silently defaulted, a changed placement invalidates its preview, checkout is not replaced with opening a review, no dirty-work discard is inferred, and no generic push/publication authority follows. Typed request/result companions remain required where the current carrier omits the placement selection and preview digest; command routes, handler availability, and event admission are unchanged.

The approve and request-changes commands use `Plans/forge_review_decisions.schema.json#/$defs/request` -> `Plans/forge_review_decisions.schema.json#/$defs/result`. Their unchanged common authority is nested under `authority`; exact review/head/body selection joins the actual RepositoryBinding, ReviewRevision, retained original, common receipt and provider-owned selected-decision observation. Null approval body differs from submitted empty text. Result/receipt operation, outcome, work, event references, recovery actions and optional AutomationBinding identity/generation remain consistent with the original. Static fixture resolution is not native admission, provider authentication or physical original/observation custody. Historical common v1 meanings, other command routes, handlers, availability and event admission remain unchanged. Exact original replay and observation physical custody remain pending; no effect is automatically replayed.

For exactly `cmd.forge.pipeline.open_logs`, the selected-input boundary binds one exact AutomationBinding and generation, one provider-native run, either whole-run logs or an explicitly selected job/stage, and the original optional pagination cursor. A null child means admitted whole-run scope, not first job; stage is not job. A null cursor means initial read, not latest panel position. Cursors are opaque nonsecret owner handles scoped to the actual binding/run/child and provider log stream, not checks-list cursors or authorization. The result preserves actual page content hash/readback, stream identity, original and continuation cursor, completeness/truncation, freshness and redaction. Missing/unavailable logs never become an empty complete stream. Partial page retrieval can succeed only with explicit incomplete/truncated disclosure; it does not claim complete stream retrieval.

`Plans/forge_log_selection_contracts.schema.json` supplies the closed request/result/read-projection and disjoint SIR original-dispatch binding for that command only. It composes existing Forge admission/result/receipt, AutomationBinding, actual run/child/cursor ownership and unchanged Full Thread identity/outcome/UI response types. Native dispatcher/source/disclosure adapters authenticate originals; synthetic fixtures cannot. Exact redacted bytes are resolved and hashed, not accepted from an unchecked artifact ref. The original binding retains actual caller return context and permission; no Project, Run, Attempt or caller identity is manufactured from provider IDs. Unsupported stage/whole-run capability refuses instead of substituting another target. Existing generic degraded outcome has no admitted terminal UI mapping in this finite composition and fails closed rather than becoming succeeded; explicit partial log-page metadata is distinct from that enum.

The nested `pm.forge.log_selection.authority.v1` is an explicitly versioned materialization of existing common authority. Historical common v1 required pipeline_job plus non-null job for open_logs and could not express whole-run/stage scope. The successor changes only its own schema identity, restricts command_id to this action, and replaces that one job-only conditional with required actual pipeline identity plus pipeline/pipeline_job applicability checked against the exact selection. Every other common shape/admission condition is preserved, with absolute references to the genuine predecessor. Historical schemas are unchanged; no fake job is supplied. A predecessor-diff regression enforces those exact three edits. Opening logs admits no pipeline run/retry, mutation, provider event or credential payload, no broader filter grammar, physical family or retention interval; handler availability and other successors remain unchanged.

For exactly `cmd.forge.pipeline.cancel`, `Plans/forge_cancel_selected_contracts.schema.json` retains one actual AutomationBinding and generation, one provider-native run and the original expected provider-state fence. The fence is opaque owner-issued evidence for that exact run, not a normalized queued/running label, local UI state, elapsed-time inference or approval's separate revision requirement. Resolve its actual owner contents and directly validate the same original fence against the selected run immediately before dispatch. A changed, unavailable or unsupported fence blocks or requires a newly admitted selection; it never silently replaces the original with latest. Existing provider support, confirmation, Permissions, credential/currentness and Tools/storage gates remain unchanged. No provider compare-and-swap capability is invented.

The actual cancellation observation identifies the original binding/run/fence, effect and genuine provider receipt/reconciliation evidence. Accepted cancellation means only actual nonterminal ObservableWork with no terminal result receipt, not that the remote run or every child stopped or costs ceased. Terminal success requires the provider owner's completion evidence for this operation. Failed, cancelled and unknown effects remain distinct, with unknown reconciliation-only; no_op is not inferred from an already-terminal run and response replay never reissues cancellation. The unchanged common authority/result/receipt joins the authentic SIR original identity/payload/caller and actual UI outcome through mandatory native admission, fence/effect and final-disclosure adapters. These adapters remain unbuilt prerequisites, not facts established by static fixtures. No new public command, event, provider capability, physical store or retention interval is admitted.

## 4. Integration Surfaces

### 4.1 Source Control

Review action labels in wiring rows render from the selected repository adapter's review noun through the wiring vocabulary reference, as the automation shell takes its noun from the selected automation binding adapter.

Reviews, optional Versions/Threads, Source of Truth, and Mirror Health are conditional Source Control sections driven by the current capability envelope. Hosted automation renders in the one provider-neutral `repository_automation` / **Actions & Pipelines** shell through the selected `AutomationBinding`. GitHub keeps GitHub Actions nouns, Current Branch, Workflows, Settings, pins, rerun, and log recovery; GitLab keeps Pipeline/Stages/Jobs/Trace; Forgejo/Gitea use their actual Actions capability; Bitbucket Data Center without configured CI says **Connect automation service**. Generic shell ownership never erases provider-specific semantics.

### 4.2 Settings and setup

Forge setup appears under **Source Control -> Hosting Services**. Generic actions are **Connect**, **Reauthorize**, connection test, Details, and provider-aware open-in-browser routes. The exact setup flow preserves cached/current state, exact host/account/container/repository, capability probe, and binding generation. Installation and authentication are separate from repository readiness.

### 4.3 Official pages and external tools

Official page navigation uses an allowlisted dispatcher owned outside this doc. Each `open_in_browser` request is GUI/human initiated and carries an `allowlisted_official_page` handoff with exact origin, route, and foreground confirmation; ordinary official-page navigation is not automatically a protected authentication session. Reauthorization may select a `protected_auth_browser` handoff when the shared auth owner requires it. That protected variant fixes actor class to `human` and agent/tool/automation access, capture, and persistence to false, and it is unavailable to Assistant Chat, Orchestrator, automation, headless API, screenshots, DOM, console, network capture, recording, or artifact extraction. Structured CLI fallback is admitted only when the provider profile, exact Host/Environment installation, adapter version, capability and output schema are current. CLI stdout/stderr is diagnostic and cannot become a repository, review, pipeline, webhook, artifact, or receipt identity.

### 4.4 Plugin boundary

Forge apps and adapters may be delivered by an installed plugin/component, but this owner does not decide package type or manifest filename. The portable `plugin.json` versus PM-native `pm-plugin.json` distinction and all package security/conformance remain solely in `Plans/Plugins_System.md`. Forge records contain only validated component/adapter refs and cannot widen plugin permissions.

## 5. Validation And Acceptance

Acceptance covers every provider and supported variant with repository binding, host/account/container identity, authority split, capability requested/effective matrix, missing scope, tier/license, server version, stale catalog, offline, managed policy, rate limit, mirror lag/divergence, detach/reconnect, immutable review revisions, stale evidence, threads, Draft/Ready, pipelines/checks/jobs, app/grant/token lease, webhook signature/replay/dedupe/redelivery, API hash/currentness, fallback ladder, idempotency, cancellation/effect unknown, secret scans, official-page allowlist, migration, GUI vocabulary, disabled reasons, accessibility, and production wiring.

Schema validation is structural evidence only. Fresh provider sandboxes or controlled test doubles, raw receipts, and negative security evidence are required for runtime claims. Provider failures remain failures; a degraded read cannot certify mutation.

## 6. Plan-To-Node Readiness

The common static command contract is structurally specified for the existing 46 IDs. FGI-021's separately specified team-project child command still requires its machine companions and current-admission consumer enrollment. The nine 2026-09-01 additions have explicit no-event dispositions and unavailable future handler targets, but the domain remains node-blocked until cross-owner central registration/wiring/touch closure, storage, provider-owner mappings, current signed catalogs, native adapters and handlers, credential broker, secure webhook ingress, an allowlisted official-page dispatcher plus protected-browser routing when auth requires it, `ObservableWork`, migration, security tests, GUI fixtures, and fresh provider runtime evidence exist. This Plan creates no WorkNode, event admission, native handler, connection, webhook, app, token, browser execution, runtime proof, or readiness certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- `cmd.origin.*`, `cmd.gitlab.*`, `cmd.azure_devops.*`, generic `cmd.bitbucket.*`, and provider-specific peer common shapes are forbidden for new primary behavior.
- Existing GitHub command aliases are retained only under their GitHub owner until central command adjudication; this doc does not silently rename them.
- `github_actions` is retained only as a migration-read and route/bookmark/deep-link alias to `repository_automation`; it is never a second canonical panel occupant.
- Provider-native service headings are never derived from a Git remote name; in particular, **Origin Actions** must not be fabricated.
- Packet retry counts, dedupe window sizes, API versions, support floors, tiers, and license rules are signed catalog inputs, not timeless constants.
- Terminal prose scraping, raw token persistence, authority inference from mirror direction, newest-review inference, and partial-as-complete presentation are forbidden.
- The common forge owner does not define local source-control mutation, provider secret custody, plugin manifests, GUI geometry, settings persistence, command/event registries, or storage engines.

### 7.1 Migration

Legacy GitHub-specific hosted records remain GitHub-owner data but may project into the common binding only after stable GitHub host/account/repository identity is proven. Other providers require their native container identities. Remote URLs or display labels alone produce `needs_binding`, not an inferred provider. Review evidence migrates only to an exact immutable revision; otherwise it remains historical and stale.

## 8. Source Lineage And Governance

This owner compiles accepted register rows `SCM-05`, `ORI-01..04`, `UI-01`, `UI-03`, `CT-01..02`, and `TS-04`, plus the read-only SCM/Origin audit and the 2026-09-01 Forgejo/Gitea reconciliation evidence. Provider docs own native behavior; common shapes stay here. Cross-owner follow-up must propagate the nine admitted commands, independent automation binding, and generic shell identity through central catalogs, Source Control/GitHub/GUI/settings/onboarding/storage/wiring/touch/index owners. Generated shards/evidence/Spec Lock remain untouched in this lane.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/00-plans-index.md

## Forge Repository-Create Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure assigns `cmd.forge.repository.create` to exactly one future common-forge handler target, `handlers::forge::repository_create`, under `ForgeIntegrationCoordinator`. It consumes the existing `command_request|command_result|command_error|command_availability|command_disabled_reason` contract family in `Plans/forge_integration_contracts.schema.json`. The target is a planned route, not an implemented provider adapter: availability remains `handler_unavailable`, the result is receipt/`ObservableWork` based with no newly admitted EventRecord, and exact provider/account/container/repository identity, credential-broker, permission, policy, idempotency, cancellation, reconciliation, and exact-return fences remain mandatory.

### FGI-009 - Forge Repository Create Sole Future Handler

```yaml
plan_unit_id: FGI-009
unit_type: command_binding
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: cmd.forge.repository.create has one planned common-forge route, handlers::forge::repository_create, over the existing owner-DRY forge command contracts; no provider-specific peer handler or native implementation is inferred.
gui_related: true
gui_classification_reason: Common forge setup, repository managers, Product Onboarding owner handoff, Settings, Doctor, and palette consumers can expose the action and exact disabled reason.
depends_on: [FGI-008]
unblocks: []
acceptance_criteria:
  - Central catalog and production-intent wiring name exactly handlers::forge::repository_create and the existing command request/result schema pointers.
  - Provider-specific values remain typed data and no provider-specific peer common command or handler is created.
  - Missing executable Rust/provider evidence keeps handler_unavailable and cannot be promoted by schema, fixture, plan, or concept evidence.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: forge_repository_create_phantom_handler_or_provider_split
reasoning_tier: high
context_scope: forge_repository_create_central_binding
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:270, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#retained_egolite_canonical:cmd.forge.repository.create]
negative_constraints:
  - Do not treat a planned handler target as native/provider execution evidence.
  - Do not infer provider, account, container, repository, credential, or permission identity from display text or remote URL.
```

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 43 common central command routes: the prior 34 plus the nine separately admitted commands below. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.forge.pipeline.approve` | `handlers::forge::pipeline_approve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.release.asset.download` | `handlers::forge::release_asset_download` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.release.list` | `handlers::forge::release_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.fork` | `handlers::forge::repository_fork` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.policy.apply` | `handlers::forge::repository_policy_apply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.policy.preview` | `handlers::forge::repository_policy_preview` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.checks` | `handlers::forge::review_checks` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.runner.registration.apply` | `handlers::forge::runner_registration_apply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.runner.remove` | `handlers::forge::runner_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.connection.reauthorize` | `handlers::forge::connection_reauthorize` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.mirror.connect` | `handlers::forge::mirror_connect` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.mirror.detach` | `handlers::forge::mirror_detach` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.mirror.inspect` | `handlers::forge::mirror_inspect` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.mirror.sync` | `handlers::forge::mirror_sync` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.cancel` | `handlers::forge::pipeline_cancel` | `Plans/forge_cancel_selected_contracts.schema.json#/$defs/request` -> `Plans/forge_cancel_selected_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.list` | `handlers::forge::pipeline_list` | `Plans/forge_list_query_contracts.schema.json#/$defs/request` -> `Plans/forge_list_query_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_in_browser` | `handlers::forge::pipeline_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_job` | `handlers::forge::pipeline_open_job` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_logs` | `handlers::forge::pipeline_open_logs` | `Plans/forge_log_selection_contracts.schema.json#/$defs/request` -> `Plans/forge_log_selection_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.refresh` | `handlers::forge::pipeline_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.retry` | `handlers::forge::pipeline_retry` | `Plans/forge_retry_selected_contracts.schema.json#/$defs/request` -> `Plans/forge_retry_selected_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.run` | `handlers::forge::pipeline_run` | `Plans/forge_run_selected_contracts.schema.json#/$defs/request` -> `Plans/forge_run_selected_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.list` | `handlers::forge::repository_list` | `Plans/forge_list_query_contracts.schema.json#/$defs/request` -> `Plans/forge_list_query_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.open_in_browser` | `handlers::forge::repository_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.refresh` | `handlers::forge::repository_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.approve` | `handlers::forge::review_approve` | `Plans/forge_review_decisions.schema.json#/$defs/request` -> `Plans/forge_review_decisions.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.checkout` | `handlers::forge::review_checkout` | `Plans/forge_review_checkout_selected_contracts.schema.json#/$defs/request` -> `Plans/forge_review_checkout_selected_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.close` | `handlers::forge::review_close` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.comment` | `handlers::forge::review_comment` | `Plans/forge_review_comment_contracts.schema.json#/$defs/request` -> `Plans/forge_review_comment_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.mark_ready` | `handlers::forge::review_mark_ready` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.open` | `handlers::forge::review_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.open_in_browser` | `handlers::forge::review_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.refresh` | `handlers::forge::review_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.reopen` | `handlers::forge::review_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.request_changes` | `handlers::forge::review_request_changes` | `Plans/forge_review_decisions.schema.json#/$defs/request` -> `Plans/forge_review_decisions.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.list` | `handlers::forge::review_thread_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.reopen` | `handlers::forge::review_thread_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.reply` | `handlers::forge::review_thread_reply` | `Plans/forge_thread_reply_contracts.schema.json#/$defs/request` -> `Plans/forge_thread_reply_contracts.schema.json#/$defs/result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.resolve` | `handlers::forge::review_thread_resolve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.version.compare` | `handlers::forge::review_version_compare` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.version.open` | `handlers::forge::review_version_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.webhook.delivery.list` | `handlers::forge::webhook_delivery_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.webhook.redeliver` | `handlers::forge::webhook_redeliver` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact 43-command common central set: `cmd.forge.connection.reauthorize`, `cmd.forge.mirror.connect`, `cmd.forge.mirror.detach`, `cmd.forge.mirror.inspect`, `cmd.forge.mirror.sync`, `cmd.forge.pipeline.approve`, `cmd.forge.pipeline.cancel`, `cmd.forge.pipeline.list`, `cmd.forge.pipeline.open_in_browser`, `cmd.forge.pipeline.open_job`, `cmd.forge.pipeline.open_logs`, `cmd.forge.pipeline.refresh`, `cmd.forge.pipeline.retry`, `cmd.forge.pipeline.run`, `cmd.forge.release.asset.download`, `cmd.forge.release.list`, `cmd.forge.repository.fork`, `cmd.forge.repository.list`, `cmd.forge.repository.open_in_browser`, `cmd.forge.repository.policy.apply`, `cmd.forge.repository.policy.preview`, `cmd.forge.repository.refresh`, `cmd.forge.review.approve`, `cmd.forge.review.checkout`, `cmd.forge.review.checks`, `cmd.forge.review.close`, `cmd.forge.review.comment`, `cmd.forge.review.mark_ready`, `cmd.forge.review.open`, `cmd.forge.review.open_in_browser`, `cmd.forge.review.refresh`, `cmd.forge.review.reopen`, `cmd.forge.review.request_changes`, `cmd.forge.review.thread.list`, `cmd.forge.review.thread.reopen`, `cmd.forge.review.thread.reply`, `cmd.forge.review.thread.resolve`, `cmd.forge.review.version.compare`, `cmd.forge.review.version.open`, `cmd.forge.runner.registration.apply`, `cmd.forge.runner.remove`, `cmd.forge.webhook.delivery.list`, `cmd.forge.webhook.redeliver`.

Exact 43-handler future set: `handlers::forge::connection_reauthorize`, `handlers::forge::mirror_connect`, `handlers::forge::mirror_detach`, `handlers::forge::mirror_inspect`, `handlers::forge::mirror_sync`, `handlers::forge::pipeline_approve`, `handlers::forge::pipeline_cancel`, `handlers::forge::pipeline_list`, `handlers::forge::pipeline_open_in_browser`, `handlers::forge::pipeline_open_job`, `handlers::forge::pipeline_open_logs`, `handlers::forge::pipeline_refresh`, `handlers::forge::pipeline_retry`, `handlers::forge::pipeline_run`, `handlers::forge::release_asset_download`, `handlers::forge::release_list`, `handlers::forge::repository_fork`, `handlers::forge::repository_list`, `handlers::forge::repository_open_in_browser`, `handlers::forge::repository_policy_apply`, `handlers::forge::repository_policy_preview`, `handlers::forge::repository_refresh`, `handlers::forge::review_approve`, `handlers::forge::review_checkout`, `handlers::forge::review_checks`, `handlers::forge::review_close`, `handlers::forge::review_comment`, `handlers::forge::review_mark_ready`, `handlers::forge::review_open`, `handlers::forge::review_open_in_browser`, `handlers::forge::review_refresh`, `handlers::forge::review_reopen`, `handlers::forge::review_request_changes`, `handlers::forge::review_thread_list`, `handlers::forge::review_thread_reopen`, `handlers::forge::review_thread_reply`, `handlers::forge::review_thread_resolve`, `handlers::forge::review_version_compare`, `handlers::forge::review_version_open`, `handlers::forge::runner_registration_apply`, `handlers::forge::runner_remove`, `handlers::forge::webhook_delivery_list`, `handlers::forge::webhook_redeliver`.

### FGI-010 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: FGI-010
unit_type: command_binding
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Forge Integrations owns exactly 43 common central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, Source Control, Actions & Pipelines, owner workspaces, palette/API, and other named consumers expose some or all of these 43 commands and their exact disabled reasons.
depends_on: [FGI-008, FGI-009]
unblocks: []
acceptance_criteria:
- Exact cmd.forge.review.create retains provider-owner routing, head/base refs and immutable objects, title/body/draft, nullable or authentically approved Git/JJ publication, actual issued review and original SIR/caller/error/result joins; no fabricated existing review, automatic publication or native/physical custody proof follows.
- Exact cmd.forge.pipeline.run retains native definition and immutable revision, typed original inputs and provider-resolved omission without invented defaults, actual preview/current admission and returned work, truthful partial/unknown effects and original SIR/caller/error composition. The run-only authority removes only premature pipeline/work nonnull guards, preserves the definition guard and historical admission; unsupported native input forms remain explicitly unadmitted.
- Exact cmd.forge.pipeline.retry preserves original supported_failed_jobs/all/selected scope, actual native member hierarchy and owner preview, current admission, genuine nonterminal work and partial/unknown effect truth through original SIR/caller/receipt/error composition. Its explicit authority successor removes only the premature nonnull work guard, preserving required pipeline identity and every other predecessor constraint; native and physical custody remain pending.
- Exact cmd.forge.repository.list and cmd.forge.pipeline.list retain original typed descriptor/selected filter and authentic scope through source window, read receipt and common response; no universal filters, sort/page defaults, write probes or secret cursor bytes are introduced.
- Precommit listing preserves null Project and genuine Client/return focus; independent AutomationBinding and provider-native results retain explicit completeness/freshness without false complete/fresh promotion.
- The exact thread-reply successor preserves submitted body/optional version, actual thread membership and whole immutable revision window, provider observation/receipt and authentic SIR original/current caller. Accepted work is nonterminal and receipt-free; unknown effects cannot authorize repost. Safe error disclosure binds the unchanged actual owner error, including genuine cancelled null UI error; native producer authentication and physical custody remain pending.
- Every exact command ID in this 43-command set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Existing commands covered by section 3.4 preserve original selected values and genuine owner preview/result joins; an incomplete historical request or unresolved reference is not evidence that its selected-operand companion exists or that a native effect is admitted.
- The exact cancellation successor binds original AutomationBinding/run/state fence, actual direct revalidation and provider completion/receipt to the authentic SIR original and current disclosure. Changed or unavailable fences cannot authorize effects; accepted work cannot substitute terminal state or a terminal receipt. The common UI error resolves the genuine unchanged Forge error through the exact SIR projection, retaining cancelled null-UI-error legality and actual owner recovery facts. Native producers, source/effect authentication and physical custody remain unproved.
- The exact open_logs successor binds actual run/job/stage/cursor, authenticated redacted content and bounded-page completeness to its original dispatch/caller and common receipt/response; unavailable is not empty success, unknown effects remain reconciliation-only and no_op is not inferred. Its versioned authority preserves every predecessor constraint except the explicitly enumerated three edits; no fake job or native proof is admitted.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
- >-
  Exact `cmd.forge.review.checkout` consumes the Source Control-owned `pm.source_control.review_checkout.preview.v1` through the selected request's explicit placement and preview digest: the Forge target keeps the original review/revision and Source Location, while checkout authority, target lease scope, dirty-work safety and effect truth come only from the owner-qualified preview and its Source Control receipt. A changed placement invalidates its preview; Forge never issues, requalifies or extends the preview, never defaults placement, never substitutes opening a review, and never infers discard, autostash, push or publication authority.
- >-
  Target-workspace acquisition/activation for either placement stays owned by the existing neutral Source Control workspace/repository authority; this unit admits no `workspace.create`, `workspace.switch`, `repository.bind`, `status.refresh` or other implementation sequence for review checkout, and internal Git/Jujutsu sequencing remains implementation-owned behind the exact typed request/result/lease/preview invariant. Truthful checkout completion is only the Forge owner result `succeeded` joined to the selected observation `checked_out` with `known_applied` effects equal to the qualified preview, preserved dirty work, no provider receipt, and the Source Control operation receipt for the exact command instance and target lease; rejected, cancelled and unknown outcomes preserve their typed error, reconciliation-only unknown effects and replay identity without re-executing checkout. The sole public route, `handler_unavailable` disposition and empty expected event types are unchanged; no new command, event, family, store or native proof follows.
validation_surfaces:
- Plans/forge_review_create_selected_contracts.schema.json
- Plans/forge_review_create_selected_contract_fixtures.json
- tests/test_pm_forge_review_create_selected.py
- tests/test_pm_forge_review_create_bindings.py
- Plans/forge_run_selected_contracts.schema.json
- Plans/forge_run_selected_contract_fixtures.json
- tests/test_pm_forge_run_selected.py
- tests/test_pm_forge_run_bindings.py
- Plans/forge_retry_selected_contracts.schema.json
- Plans/forge_retry_selected_contract_fixtures.json
- tests/test_pm_forge_retry_selected.py
- tests/test_pm_forge_retry_bindings.py
- Plans/forge_list_query_contracts.schema.json
- Plans/forge_list_query_contract_fixtures.json
- tests/test_pm_forge_list_query.py
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
preserved_exact_tokens: [cmd.forge.review.create, publication_ref, cmd.forge.pipeline.run, cmd.forge.pipeline.retry, supported_failed_jobs, selected, cmd.forge.repository.list, cmd.forge.pipeline.list]
source_lineage:
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-048
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-070
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-072
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-062
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:ACT-067
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json

## Product Onboarding forge-binding addendum - 2026-09-01

### Uncreated repository identity and creation lifecycle

The read-only `repository_list_scope` remains the sole account-container listing variant admitted before the Onboarding commit. It cannot be attached to another command or used to authorize repository creation. Separately, the existing `cmd.forge.repository.create` must represent a genuinely uncreated repository without fabricating `repo_id`, `repository_binding_ref`, or a provider repository identity. Its absent PM identity pair is jointly null, expected and observed repository binding generations are zero, and `identity_source=validated_account_container` still requires the actual verified account/container and exact intended locator. Mixed absent/bound identities are invalid. Existing repository-bound forms and all other command requirements remain unchanged.

For Onboarding, that create operation belongs only inside the explicitly reviewed Project-owner commit chain, never the precommit source-access exception. Absent identity grants no permission: current account/container, capability/API evidence, direct revalidation, authority, credential, permission, idempotency and the exact reviewed creation intent remain mandatory. A zero generation describes an absent repository binding; it is not a wildcard for bypassing account, capability, draft or operation currentness.

Create results and receipts may retain an absent repository binding with generation zero while `accepted`, `blocked`, `failed`, `cancelled`, `recovery_required`, or `effect_unknown`. This denotes a binding not yet established or verified, not proof that an unknown remote effect did not occur. Create errors may likewise identify the uncreated target without a binding; create availability with absent binding uses zero expected and observed repository generations without upgrading its availability state. `accepted` still requires owner `ObservableWork`; failure outcomes retain their typed error/recovery rules, and `effect_unknown` remains reconciliation-only. `succeeded` must resolve a real repository binding plus the terminal provider result and receipt required by §3.3. `degraded` retains its existing nonnull-binding constraint; it is not an escape for unresolved creation. Closing, retrying or resuming never invents a binding or blindly repeats an unknown remote create. These shape rules do not authenticate referenced records, supply the complete creation-intent carrier, admit an EventRecord or prove native execution.

### Complete reviewed creation intent and preview

The existing `cmd.forge.repository.create` route consumes a closed inline `repository_creation_intent`, not just a locator or a schema-valid opaque reference. It is the actual runtime request input assembled from the reviewed choices and current verified account/container facts. The Forge owner supplies a separate read-only creation preview; the request names that exact preview and its digest. The owner resolves the trusted preview, recomputes the canonical intent digest, checks the approved draft and owner facts, and revalidates execution-time authority before mutation. A caller's `verified` boolean, UI label, safe reference or static test wrapper cannot establish these joins.

The concrete current create writer is `repository_create_command_request_v2` (`pm.forge.repository_create_command_request.v2`) in the common Forge schema. Every dispatcher, including API/headless callers, first enforces `command_request_admission`: unchanged v1 requests except repository create and the eleven selected successors below, this v2 create request, or an exact selected successor request. The selected arms are review_decisions for `cmd.forge.review.approve`/`cmd.forge.review.request_changes`, log_selection for `cmd.forge.pipeline.open_logs`, cancel_selected for `cmd.forge.pipeline.cancel`, thread_reply for `cmd.forge.review.thread.reply`, review_comment for `cmd.forge.review.comment`, list_query for `cmd.forge.repository.list`/`cmd.forge.pipeline.list`, retry_selected for `cmd.forge.pipeline.retry`, run_selected for `cmd.forge.pipeline.run`, and review_create_selected for `cmd.forge.review.create` (retaining its separate provider-owner route). Their historical generic requests remain readable and valid as nested authority where specified, but are no longer standalone current admission. The original closed `command_request` remains readable for historical create records but is not current create admission; importing or replaying it cannot authorize a mutation or synthesize missing reviewed choices. Root schema decoding includes both concrete historical and current records and is not an admission check. The existing command ID, handler, unavailable-until-native-proof disposition, and no-unregistered-event boundary do not change.

`repository_creation_choices`, `repository_creation_intent`, and `repository_creation_preview` materialize the retained fields below. `creation_option_selections` binds the actual versioned `creation_field_catalog`, whose closed field descriptors specify allowed typed values, bounds, resource kinds, protected-write-only references, and conditional cross-field requirements/exclusions. Catalog categories preserve all independently named provider capabilities; unsupported categories remain explicit, never inherited across providers or promoted by a caller. Adapter schema references are producer/version metadata, not substitutes for validating the actual descriptors. Instance trust, Source Control transport, and post-create effects are independently owner/phase bound. Pattern evaluation must use a safe engine with bounded resource use. Current owner-resolved catalog, capability, permission and resource admission remains mandatory even for a schema-valid selection.

The static `validate_repository_creation` oracle consumes the real request plus separately supplied trusted resolver/current owner facts; native code must authenticate those dependencies. Its `repository_creation_validation_input`, `repository_creation_execution_snapshot`, and typed `repository_creation_envelope_binding` are explicitly secondary test compositions, not new authority records, physical storage families or caller grants. The envelope binding is independently resolved original admission/current owner data, never a runtime copy of caller fields: it fences credential/grant, rate budget, requested/effective authority, repository/native identity and generations, availability, targets, FileSafe/work and idempotency fields outside the intent. Duplicated namespace and connection IDs must match the actual intent subject; expected/observed repository generations agree, and future permission/availability/projection observations cannot authorize creation. The canonical digest uses the existing integer/string-domain owner oracle; native numeric-domain compatibility requires separate proof. Pattern checking in the static oracle uses an isolated resource-limited worker and shared pattern-work budget, failing closed when limits are exceeded or unavailable; this does not certify a native engine. Actual intent/preview/catalog/selection transport remains nonpersisted under `scd.forge.command_transport.v1`, with existing redaction and expiry rules. Onboarding draft writer/migration/mapping, result/receipt correlation, separate Azure team-project contracts, native resolution and execution evidence remain distinct required companions; this contract materialization alone does not close them or certify readiness.

All fourteen source-specification dimensions remain represented. The packet's field labels below describe retained meaning, not a second set of competing identities or permission to invent a future repository binding:

| Packet field | Required creation-intent meaning |
|---|---|
| `forge_binding_id` | Actual existing provider/instance/connection context, joined to the envelope; an uncreated repository has no fabricated RepositoryForgeBinding. |
| `account_identity_id` | Verified stable account joined to the selected draft and envelope provider/host/account. |
| `namespace_external_id` | Actual provider-owned personal/organization/group/workspace/project container identity, not its display label or a PM Project ID. |
| `repository_name` | Exact reviewed name under the current provider naming rules. |
| `provider_slug_or_path` | Required selected or provider-derived path/slug, with its derivation shown in the same reviewed preview. |
| `visibility` | Requested visibility plus effective provider policy; Azure inherits verified project policy rather than a repository selector. |
| `existing_or_create` | Explicit create-versus-select choice; this command consumes create, while selection uses the existing binding flow. |
| `source_template/ref` | Exact optional selected template and resolved source identity/currentness, with its own capability and permission checks. |
| `initialization_policy` | Reviewed README, gitignore, license and content initialization choices; existing source history is preserved. |
| `expected_capability_revision` | Current owner creation/API/catalog evidence used by preview and revalidated at dispatch. |
| `expected_name_availability_revision` | Owner name/path availability result, revision and freshness for that exact account/container. Unknown is not available. |
| `requested Git transport` | Explicit transport choice handed to Source Control, independent from API access and the Project's local/mounted/SSH location. |
| `branch/default-branch policy` | Exact approved branch choice/policy and capability, never an unreviewed provider/current-branch substitution. |
| `provider-specific optional settings` | Closed versioned adapter selections with explicit owner and effect phase, never an arbitrary dictionary or general-purpose patch. |

Product Onboarding's existing normal fields remain the input source, including description, container/project, default branch, README, gitignore and license. Missing advanced selections must extend that same typed draft and its reviewed revision/hash; they do not create another account, draft store or Onboarding-only create route. Only choices that cannot be safely derived need normal-mode controls. Derived values are disclosed and bound by the same review. Instance trust, credentials, selected templates and later child effects retain their own owners. A missing required provider field or capability blocks with its actual reason, rather than dropping the requested option.

The ordinary Azure path creates a Git repository in an existing verified Azure team project. The packet's optional advanced creation of a new Azure team project is separate Azure-owned work: explicit selection, project name, visibility, process-template/capability and Git-only version-control choices, its own preview and permission, and an awaited or reconciled asynchronous result before repository creation. It is neither PM Project creation nor an implied side effect of repository creation. This requirement does not declare that separate operation's command/carrier already materialized. Generic Git gains no hosted-create capability; expert bare-over-SSH creation is not a first-run fallback.

ADO-008 owns that separate team-project operation and its result-derived handoff. The repository producer consumes the operation's causally verified ready project resource only after its own current repository preview/permission checks; it never reuses `cmd.forge.repository.create` to create a project, invents a project GUID, rewrites the approved create selection as existing, or treats a pending operation reference as a repository destination. Typed companions and any common command/capability/target/storage registration are separate reviewed prerequisites, not implied by retaining the draft choice.

### FGI-011 - Verified account and repository binding requirements by forge

```yaml
plan_unit_id: FGI-011
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  An onboarding online copy is an optional hosted Git destination independent from local Git or Jujutsu. It becomes
  ready only through an explicit current account verification and an explicit repository binding; selecting its
  uncreated draft requires neither a phantom account nor a phantom repository. Provider-specific
  host, owner/container, repository, visibility, eligibility, and capability requirements remain visible and typed.
  Cursor Origin Preview is an eligible hosted Git destination with Private or Internal onboarding visibility, never a
  no-host pseudo-option. Reusing an existing connection selects and verifies the exact account and repository rather than
  skipping setup. Protected sign-in and explicit external account creation are distinct owner-controlled handoffs.
  PWIZ-021's precommit exception permits only current owner-authorized read-only checks/listing and necessary
  selected-source authentication. MACS-005 owns first-time sign-in. The existing cmd.forge.repository.list command
  has a closed repository_list_scope account-container variant with a verified real account, no Project/repository
  binding, zero repository generation, and no mutation. Its request/result/error/availability/receipt all preserve
  that scope; it creates neither a new command nor a standalone storage/event family. Repository creation/binding and
  content movement remain inside the exact reviewed Project owner's commit chain. The existing create command separately
  represents uncreated repository identities as absent with zero binding generation during its authorized creation
  lifecycle; this is not a second precommit exception or a successful binding. The existing repository-create route
  consumes one closed runtime creation intent derived from the exact reviewed draft and verified owner facts, with
  a current read-only preview bound to those same choices. Provider-specific options, independent child effects,
  unavailable capabilities and uncertain-effect recovery remain explicit; opaque refs, labels and static validation
  wrappers neither replace the intent nor prove a repository exists.
gui_related: true
gui_classification_reason: Defines provider cards, required fields, visibility choices, account/repository verification, and exact disabled reasons in Product Onboarding.
depends_on: [FGI-001, FGI-003, FGI-006, FGI-008, SCS-011]
unblocks: [PWIZ-024]
acceptance_criteria:
  - A hosted-copy draft records the selected provider/variant/host, source/container intent and desired visibility. Only actual verified identities populate account/repository refs; absent or uncreated targets remain explicitly absent. Once bound, the Forge owner supplies stable account/container/repository/PM repo identity, binding generation, capability currentness and non-secret grant refs. Selection, listing and account verification alone never claim repository readiness.
  - Account authentication and repository selection/creation are separate required results; `already_connected` must select and verify a current account and then select the exact repository, and cannot succeed as an empty action.
  - Existing accounts use one owner-controlled protected sign-in when needed. An allowlisted official provider page is offered only for explicit account creation or provider-required external administration, not as a redundant second sign-in path.
  - GitHub requires github.com or a normalized GitHub Enterprise host, a verified stable account, personal or organization owner, and repository; Private/Public are ordinary hosted choices and Internal is shown only when the exact enterprise capability permits it.
  - GitLab requires GitLab.com or a normalized self-managed HTTPS instance, a verified account, namespace/group, and project repository; GitLab.com onboarding exposes Private/Public, while Internal on self-managed GitLab is capability-probed rather than assumed.
  - Azure DevOps requires cloud or self-managed variant, normalized organization/server host, verified account, Azure organization or collection, Azure project, and repository; repository visibility inherits the Azure project policy and is not represented by a fabricated repository-level selector.
  - Bitbucket Cloud requires a verified account, workspace, optional project locator when used, and repository, with Private/Public subject to current capability; Bitbucket Data Center requires normalized HTTPS instance, verified account, project key, repository slug, and licensed/versioned capability, without being collapsed into Cloud.
  - Forgejo requires its own normalized HTTPS instance, stable instance/account/organization/repository identity, typed API root/base path and SSH host/port, scoped CA and known-host proof refs, detected Forgejo product/version/API schema, and independently probed API/Git/Actions state; PAT is the default and OAuth PKCE appears only for a registered instance flow.
  - Gitea requires the same typed self-host fields through a distinct Gitea adapter and product identity; shared primitives never imply permanent Forgejo API equivalence, and API-disabled does not disable proven Git transport.
  - "For an admitted self-hosted Forgejo or Gitea instance whose current authoritative instance observation reports user self-registration disabled, Onboarding suppresses Create account for that instance; account creation then requires the instance administrator's invitation or external provisioning. A user with an existing account retains the admitted FGI-011/015 sign-in routes, including scoped PAT as the default and registered OAuth/PKCE where supported. Missing or unknown observation is not evidence that registration is disabled; this clause does not choose the unknown-state presentation or admit registration as enabled. The authoritative current-instance observation and currentness contract for user-registration state is not yet pinned by current owner law: existing OAuth-application and runner registration facts do not supply it, so the technical observation prerequisite remains open. MACS-005 continues to own official-signup-page navigation and current official-source proof."
  - Cursor Origin requires a current Preview eligibility projection, verified eligible account/team owner, fixed hosted Origin service identity, and repository binding; onboarding permits only Private or Internal, keeps Public unavailable, and allows normal Git or Jujutsu-backed clone/fetch/push through certified transports.
  - Local-only Safe History stays valid with `forge_provider=none`; no forge account or repository is required until the user explicitly chooses an online copy or `Bring one from online`.
  - Before commit, explicit source access may consume owner-authorized read-only preflight/current eligibility and account-scoped repository listing or necessary selected-source sign-in. Admission consumes PWIZ-021's exact current draft/source/permission/capability/consent/hash/expiry join and MACS-005 when no account exists. It never admits repository creation/binding, clone, fetch, publish, filesystem writes, Project creation, or broad provider setup.
  - The account-list variant of cmd.forge.repository.list uses repository_list_scope in the existing command_request/result/error/availability/receipt definitions; only this read-only variant permits account-container listing with null repo_id/repository_binding_ref before the Onboarding commit. It uses zero repository generation and binds actual account verification/generation/container, provider, selected source, draft, Client/Host and return context; requests are human GUI/read-only/current, and responses do not emit EventRecords or complete Project setup. Ordinary repository-bound requests remain unchanged, and another command cannot reuse the variant.
  - The existing repository.create request separately permits jointly absent repo_id/repository_binding_ref and provider repository identity only with zero expected/observed repository binding generations and validated_account_container identity; verified account/container, intended locator and all mutation/currentness gates remain required. Within Onboarding, creation remains inside the reviewed Project-owner commit chain, never precommit source access.
  - Create result/receipt absent bindings require zero generation and accepted, blocked, failed, cancelled, recovery_required or effect_unknown; create error and availability may name the still-unbound target without weakening their existing gates. Accepted requires ObservableWork, effect_unknown requires reconciliation, and succeeded/degraded retain a real binding, with terminal provider result/receipt required for success. Other commands do not gain nullability and mixed identities fail closed.
  - This PlanUnit reuses common `cmd.forge.*`, shared authentication/integration lifecycle, provider-owner adapters, and Source Control transport commands; it creates no provider-specific command namespace, account store, secret custody, or native/runtime evidence.
  - The actual common repository.create request carries closed inline repository_creation_intent preserving the source meanings of forge_binding_id, account_identity_id, namespace_external_id, repository_name, provider_slug_or_path, visibility, existing_or_create, source_template/ref, initialization_policy, expected_capability_revision, expected_name_availability_revision, requested Git transport, branch/default-branch policy, and provider-specific optional settings as defined in the creation-intent table, including exact normal description/initialization fields and provider-qualified advanced choices. Its provider/variant/host/account/container joins the outer request and current owner evidence. These source labels are not competing serialized identities. It is not a validation-only wrapper, second command or physical family; absent repository identity is not replaced with a fake binding.
  - Onboarding derives creation intent from the same closed setup_draft and revision/hash authorized by PWIZ-021 and the Project owner. Preserve existing normal fields and add missing typed advanced selections to that draft, with a deterministic owner mapping checked before create. Changed name, container, account, provider, visibility, template, initialization, branch, transport or optional settings requires a current preview and the applicable renewed reviewed consent. Non-Onboarding callers retain their own explicit approved-intent path, without fabricated Onboarding IDs or silent defaults.
  - The closed Forge-owner creation preview binds the intent digest, provider/variant/host/account/container and account generation, applicable source-draft/approval binding, name/path, capability/API/catalog/permission evidence and name-availability result/revision/freshness. The create request carries its exact ref and digest along with the full intent. The owner resolves actual trusted preview bytes, recomputes the canonical intent digest, compares every identity/revision/choice, and rechecks current permission, capability and name availability at execution. Missing, stale, changed or unsupported preview blocks with the actual reason; a safe_ref or caller verified flag is not evidence.
  - Read-only preview requires the existing phase and permission authority; it does not extend selected-source precommit access to destination sign-in, broad provider setup or mutation. If a phase cannot obtain the necessary real account/container proof, creation stays pending/unavailable until the existing approved owner chain can obtain it. Never fabricate an account, call an unknown preview ready, bypass final review or replace Project-owner routing.
  - Provider options use the actual provider/variant/version adapter field schema and capability evidence, rejecting unknown keys, cross-provider values, raw secrets and unavailable requested fields. Preserve GitHub template/team access/repository permissions/policies; GitLab path/template/MR settings/protected branches/CI variables/runners; Bitbucket project grouping/slug/main branch/fork/policy/Pipelines; distinct Forgejo and Gitea mirror/template/team/SSH host-port/scoped CA/branch policy/Actions; and capability-proved Origin repository settings/integrations. Common description, README, gitignore, license and default-branch choices remain exact, without guessed universal vendor limits. FGI-015 owns administration-field schemas; instance trust and credentials keep their own owners.
  - An exact repository-create API consumes only fields it supports. Selected team, policy, CI, runner, mirror or transport effects exposed as separate provider operations remain explicit reviewed child work with their own permission, dependency, result, receipt and recovery. Template, mirror and fork are not interchangeable. Source Control owns local Git/JJ initialization, independent fetch/push verification and publication; API success proves none of them. Choosing a service cannot silently enroll a runner, write a secret, push, synchronize a mirror or administer a repository.
  - Ordinary Azure creation requires an existing verified project identity and inherits its visibility; TFVC remains typed unsupported. Explicit advanced new-team-project work separately preserves project name, visibility, process-template/capability and Git-only selection with its own preview/permission/async reconciliation before repository creation; the repository-create carrier alone does not implement it. Origin keeps capability-qualified Private/Internal and unavailable Public with native-versus-GitHub-mirror authority distinct. Other providers retain exact instance/hierarchy distinctions, and generic Git has no fabricated hosted create.
  - Create acceptance is ObservableWork intake, not success. Success requires actual provider result, real binding and receipt; Project listing still requires its full required child chain. Preserve completed, failed, ambiguous and compensatable effects with approved intent and external request identity. After timeout or lost response, reconcile the exact account/container/name/request identity before retry; an unrelated same-name repository is not success, completed work is not replayed, and failed required optional settings are not hidden as complete setup. Compensation requires separate current owner approval; nothing is automatically deleted. This criterion admits no EventRecord or storage family.
  - Companion acceptance must exercise the actual runtime request, closed preview and result/receipt linkage, full normal/advanced draft-to-owner mapping and independently schema-valid mismatches in intent, preview, draft, account/container, capability/name revision and return/currentness. Version required new-writer changes explicitly; preserve historical readers and migrate old drafts through current review without default-filling effects or fabricating preview/consent. A standalone validation wrapper or unresolved adapter-schema ref is insufficient. Static materialization and native handler/adapter/source-hashed security evidence remain distinct requirements before availability.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, provider-specific positive/negative fixtures, future protected-auth and repository-binding owner-return fixtures, future creation-preview and approved-draft owner-join fixtures, future versioned provider-option fixtures]
risk_class: onboarding_forge_account_repository_or_provider_requirement_drift
reasoning_tier: high
context_scope: onboarding_forge_provider_binding
implementation_surfaces: [Plans/Forge_Integrations.md, future forge facade, future Product Onboarding owner adapter]
node_compile_hint: {mode: forge_onboarding_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-forge-onboarding-requirements, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py, "packet:PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/04_ACCOUNT_SIGNIN_AND_PROJECT_CREATION_MATRIX.md#sections-2-10-and-13", "packet:PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/09_COMMAND_EVENT_WIRING_DRY_PLAN_DELTAS.md#sections-3-4-and-6"]
preserved_exact_tokens: [github, gitlab, azure_devops, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, cursor_origin, Private, Internal, already_connected, forge_binding_id, account_identity_id, namespace_external_id, repository_name, provider_slug_or_path, visibility, existing_or_create, source_template/ref, initialization_policy, expected_capability_revision, expected_name_availability_revision, requested Git transport, branch/default-branch policy, provider-specific optional settings]
negative_constraints:
  - Do not treat a selected provider or verified account as a repository binding.
  - Do not represent Cursor Origin as no-host, local-only, or public-by-default.
  - Do not offer duplicate built-in and official-page sign-in choices.
  - Do not collapse GitLab hosted/self-managed, Azure cloud/self-managed, or Bitbucket Cloud/Data Center requirements.
  - Do not collapse Forgejo and Gitea into one product, adapter, API schema, capability result, or account identity.
  - Do not infer provider, account, repository, owner, visibility, eligibility, or readiness from display text or remote URL alone.
  - Do not broaden precommit read-only listing/selected-source authentication into repository, filesystem, Project or unrelated-provider mutation; do not fabricate IDs to satisfy a repository-bound request.
```

## Forgejo/Gitea, Automation Binding, And Generic Shell Reconciliation - 2026-09-01

### FGI-012 - Distinct Self-Hosted Providers And Independent Automation Authority

```yaml
plan_unit_id: FGI-012
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Forgejo and Gitea are distinct closed-enum provider identities with distinct adapters and version/API-schema
  capability profiles. RepositoryForgeBinding remains repository-hosting authority. AutomationBinding separately
  identifies automation service/provider/instance/account, optional repository-binding relationship, capability,
  catalog, permission, currentness and binding generation; it may differ from the Git host. Exactly one canonical
  repository_automation panel occupant labeled Actions & Pipelines renders provider-native content and accepts
  github_actions only as migration-read/route/bookmark/deep-link input.
gui_related: true
gui_classification_reason: Defines the canonical Actions & Pipelines route, visible provider headings, binding selector, unsupported states, and one-occupant migration.
depends_on: [FGI-001, FGI-003, FGI-005, FGI-008]
unblocks: []
acceptance_criteria:
  - The provider enum includes separate forgejo and gitea tokens; a combined forgejo_or_gitea identity is invalid.
  - Typed instance profiles carry custom HTTPS/API roots, API base path, SSH host/port, scoped private-CA ref, known-host proof, account/organization, detected product/version/API schema, independent API/Git/Actions state, auth method, permission/currentness refs, and no secret bytes.
  - PAT is the default self-host route; OAuth PKCE is admitted only with an explicitly registered instance flow.
  - API-disabled does not disable proven Git fetch/publish; Actions disabled, no runner, no workflow, insufficient permission, unsupported and unknown remain distinct.
  - Credentials and authorization headers are stripped on redirect-origin change; local/metadata targets remain denied unless an existing explicit policy approves them; CA trust is instance-scoped.
  - AutomationBinding never silently inherits provider/account/authority from RepositoryForgeBinding and every automation/runner request carries its exact binding generation.
  - repository_automation is the only canonical occupant; binding selection is shown only when multiple bindings exist, provider headings come from the selected adapter, and no remote name fabricates a service such as Origin Actions.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, provider/version/trust/API-Git-Actions fixtures, shell migration and one-occupant fixtures]
risk_class: self_host_identity_automation_authority_or_shell_conflation
reasoning_tier: high
context_scope: forgejo_gitea_automation_binding_and_shell
implementation_surfaces: [Plans/Forge_Integrations.md, future Forgejo adapter, future Gitea adapter, future repository_automation Slint shell]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md, packet_corrected_slice:machine__provider_profiles.json__part-003__lines-000401-000620.txt, packet_corrected_slice:machine__domain_contracts.schema.json__part-002__lines-000201-000420.txt]
preserved_exact_tokens: [forgejo, gitea, RepositoryForgeBinding, AutomationBinding, repository_automation, "Actions & Pipelines", github_actions, "Connect automation service"]
negative_constraints:
  - Do not infer automation authority from the repository host, remote name, or ForgeBinding.
  - Do not persist certificate bytes, credentials, authorization headers, OAuth codes, tokens, runner tokens, secrets, or variables in these records.
  - Do not forward authorization across redirect origins or widen localhost/metadata access.
  - Do not claim native adapters, runtime handlers, panel implementation, or verified provider support from Plans, schemas, fixtures, or concept evidence.
```

### FGI-013 - Nine Distinct Event-Silent Forge Command Admissions

```yaml
plan_unit_id: FGI-013
unit_type: command_binding
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Admit cmd.forge.repository.fork, cmd.forge.pipeline.approve, cmd.forge.review.checks,
  cmd.forge.repository.policy.preview, cmd.forge.repository.policy.apply,
  cmd.forge.runner.registration.apply, cmd.forge.runner.remove, cmd.forge.release.list and
  cmd.forge.release.asset.download as nine distinct provider-neutral commands. Each has one sole future
  handlers::forge::* target, starts handler_unavailable, has expected_event_types=[], returns an owner-typed
  operation/read/destructive/mutation receipt, and preserves exact target, permission, currentness, confirmation,
  FileSafe, digest, idempotency and ObservableWork guards applicable to its effect.
gui_related: true
gui_classification_reason: The admitted commands back visible Source Control, Actions & Pipelines, Settings, palette, runner administration, release and download actions with exact disabled reasons.
depends_on: [FGI-005, FGI-008, FGI-010, FGI-012]
unblocks: []
acceptance_criteria:
  - The primary Forge command census is exactly 46 and the common central future-route census is exactly 43.
  - None of the nine commands aliases an existing command, Forgejo/Gitea peer, RepositoryForgeBinding, pipeline artifact, connection removal, review approval, repository create, or generic settings mutation.
  - pipeline.approve accepts approval only; rejection requires a separately adjudicated command.
  - runner.registration.apply requires a current admitted preview plus exact execution host, expected host revision, step-up and explicit host consent; it never synthesizes its own preview.
  - release.asset.download requires exact release/asset/destination, FileSafe decision and expected SHA-256 digest; policy and runner mutations require target-bound confirmation and current direct revalidation.
  - Every command has one valid request and one rejected permission/guard/currentness fixture; every receipt/event_refs set is empty and no forge.* EventRecord family is admitted.
  - Every future handler remains handler_unavailable until source-hashed native Rust/provider evidence exists; static wiring is planning closure only.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, central catalog/wiring/touch parity checks, no-unregistered-event check]
risk_class: command_alias_event_forgery_or_phantom_runtime
reasoning_tier: high
context_scope: nine_forge_command_admissions
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future forge handlers]
node_compile_hint: {mode: command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md, packet_corrected_slice:machine__command_census.json__part-019__lines-003601-003820.txt, packet_corrected_slice:machine__command_census.json__part-021__lines-004001-004220.txt, packet_corrected_slice:machine__command_census.json__part-022__lines-004201-004420.txt]
preserved_exact_tokens: [handler_unavailable, "expected_event_types=[]", ObservableWork, FileSafe, ReadProjectionReceipt, ExternalOperationReceipt, DestructiveOperationReceipt, MutationReceipt]
negative_constraints:
  - Do not admit packet-proposed forge.* event names or treat an operation receipt as an EventRecord.
  - Do not allow reject through cmd.forge.pipeline.approve.
  - Do not synthesize a runner-registration preview inside apply.
  - Do not expose credentials, authorization, runner tokens, secret values, absolute local paths, or unredacted provider errors in requests, receipts, logs, or fixtures.
compile_disposition: extend_existing_owner
```

## Provider Operation And Capability-Matrix Depth Repair - 2026-09-02

### FGI-014 - Origin And Provider-Specific Operation Profiles

```yaml
plan_unit_id: FGI-014
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Cursor Origin is a read/write Git host whose clone/fetch/pull/push authority is operation-, branch-,
  credential-, policy-, and currentness-specific; mirror mode preserves mapped GitHub write/review/CI authority
  and never becomes a provider-wide read-only flag or a duplicate-push path. Origin review operations use a
  pinned and golden-tested official CLI adapter where no stable public API is established. It requires JSON
  output and explicit repository/head/base/target for PR list/view/create/diff/checks/edit/ready/draft,
  review/comment/thread reply-resolve-reopen, merge/close/reopen, and stale-version refresh. Read-only PR view
  is distinct from checkout; create --push still requires publication preview/approval; Cursor Agent auth is
  not proof of Origin access. GitHub-owned mirror workflows, issues, checks, secrets, settings, and history stay
  GitHub-owned, while .github workflow files are ordinary Git tree content. Native Windows Origin CLI support
  remains unverified from WSL-only documentation; offer explicit WSL or remote-compatible setup without
  implicitly enabling WSL or degrading unrelated Windows capability. Forgejo and Gitea Actions separately
  probe feature enablement, versioned API operations, runner availability, definitions, runs, logs, artifacts,
  dispatch/cancel/rerun, permissions, secrets/variables, and runner labels; no GitHub endpoint rewrite is
  assumed. GitHub retains direct API behavior with no hidden gh requirement. GitLab retains Merge requests,
  Pipelines, approval/mergeability, native stages/jobs/traces/artifacts/manual actions/child pipelines. Azure
  Services and Server separate Repos, Pipelines, organization/project/account, auth/version, branch policies,
  deployment approvals, and Git from unsupported TFVC; Services uses Entra rather than new legacy Azure DevOps
  OAuth. Bitbucket Cloud and Data Center retain separate identity, auth, URL, version, review, restriction, and
  CI profiles; Data Center never inherits Cloud Pipelines. Generic Git remains transport-only, local/non-Git
  Projects receive no fake review/CI, Jujutsu is never a cloud account, and saved hosting/automation bindings
  rather than a remote named origin choose among fork/upstream/multi-forge routes.
gui_related: true
gui_classification_reason: Provider-native labels, capability reasons, setup alternatives, review/checks, CI hierarchy, and external-only fallbacks are visible in Source Control and Actions & Pipelines.
depends_on: [FGI-001, FGI-002, FGI-003, FGI-004, FGI-005, FGI-006, FGI-012]
unblocks: [SCS-016, FGI-015, F3-529]
acceptance_criteria:
  - Origin standalone and GitHub-mirror fixtures preserve exact Git, review, CI, issue, and write authority without duplicate publication or dispatch.
  - Recorded Origin CLI reads, writes, errors, auth interfaces, and stale-head cases bind an explicit repository and revision; PR creation never unexpectedly publishes.
  - WSL-off native Windows shows a narrow Origin-tool limitation plus explicit WSL/remote options and does not install WSL or mark Puppet Master globally degraded.
  - Forgejo/Gitea can read runs while dispatch is unavailable and distinguish no runner, no workflow, no permission, unsupported, external-only, and unknown.
  - GitHub regression inventory remains complete; GitLab, Azure, and Bitbucket fixtures retain provider vocabulary, identity, auth, hierarchy, and feature gaps without guessed parity.
  - No-remote, generic SSH Git, JJ plus Origin, and GitHub-fork/GitLab-upstream fixtures never fabricate a forge, change default remote, or cross-publish.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future Origin golden output, provider version, auth, capability, and multi-forge routing fixtures]
risk_class: provider_parity_fabrication_mirror_duplicate_effect_or_platform_overclaim
reasoning_tier: high
context_scope: origin_and_provider_specific_operation_profiles
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future provider adapters]
node_compile_hint: {mode: static_provider_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:7-13
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:39-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:47-53
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:55-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:63-69
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md:71-77
  - source_ref:corrected-slice:machine__requirements.json__part-004__lines-000601-000820.txt:11-151
preserved_exact_tokens: [create --push, JSON, -R, Pull request, Merge request, GitHub Actions, GitLab Pipelines, Azure Pipelines, Bitbucket Pipelines, Forgejo Actions, Gitea Actions, TFVC, WSL, external_only]
negative_constraints:
  - Do not infer Origin access from Cursor Agent auth, current directory, current branch, or a remote named origin.
  - Do not represent Origin as blanket read-only, fabricate Origin Actions, duplicate mirror CI, or copy GitHub secrets/settings/history through code mirroring.
  - Do not install or enable WSL implicitly or treat WSL documentation as native Windows support proof.
  - Do not rewrite GitHub endpoints for Forgejo/Gitea, guess GitLab/Azure/Bitbucket equivalents, or inherit Cloud features into self-hosted variants.
  - Do not force local-only or generic Git Projects into forge setup, and do not offer Jujutsu as hosting.
  - Do not claim implemented adapters, current vendor support, runtime effects, or platform certification from this static contract.
```

### FGI-015 - Exact Provider Capability, Authentication, Trust, And Administration Matrix

```yaml
plan_unit_id: FGI-015
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  The required provider-profile set is exactly github_cloud, github_enterprise, gitlab_saas,
  gitlab_self_managed, azure_devops_services, azure_devops_server, bitbucket_cloud,
  bitbucket_data_center, forgejo, gitea, cursor_origin_native, cursor_origin_github_mirror, and
  generic_git. The independent local-VCS set is git, jj_git_colocated, jj_git_noncolocated, and none.
  Each profile reports explicit status, evidence/probe, reason, and freshness for Git transport, repository
  discovery/create, review read/write/approve/merge, checks, definitions, run/log/artifact read,
  dispatch/cancel/rerun, webhook/poll, branch policy, secrets/variables, runner management, release assets,
  and external URL fallback; no GitHub-compatible boolean grants parity. Instance trust validates normalized
  host, tenant/account, API base path, scoped private CA, redirects/pagination, SSH host key, and explicit
  localhost/metadata policy before credentials, without global TLS disable or cross-origin Authorization.
  Authentication is provider- and instance-scoped, and what a provider profile itself carries is the closed field
  set of its own schema: the setup methods it admits, in `provider_adapter_profile.auth_methods`, together with its
  capability and reason vocabulary, its version or tier gate and its catalog reference. The other six facts are
  each recorded by a named existing surface rather than by the profile record: the issuer by
  `Plans/GitHub_API_Auth_and_Flows.md` and by `provider_instance_profile.oauth_registration_ref` for a registered
  instance flow; the allowed host by `provider_instance_profile.normalized_host` and `api_base_path` under
  `restricted_network_target_policy`; the non-secret token owner by `provider_instance_profile.credential_ref`,
  `token_lease.credential_ref` and `app_installation.credential_key_ref`; the requested scopes by
  `api_compatibility.scopes` and `token_lease.scope_grant_refs`; refresh and revoke by `token_lease.state`,
  `expires_at_utc` and `ttl_seconds` with `app_installation.state`; and the separate Git-versus-API roles by
  `provider_instance_profile.git_transport_state`, `api_state`, `transport_api_independent` and
  `credential_access`. The provider list is: GitHub direct OAuth/App/token plus separate Git helper;
  GitLab registered OAuth/PKCE or scoped PAT; Azure Services Entra and Server supported on-prem auth;
  Bitbucket Cloud OAuth/current scoped API token and Data Center supported instance token; Microsoft Entra is the
  Azure Services issuer rather than a new legacy Azure DevOps OAuth registration; Forgejo/Gitea
  guided scoped PAT by default or registered OAuth/PKCE; Origin official CLI browser auth plus verified Git
  helper. Account passwords and silent ordinary admin scope grants are forbidden. Hosted administration
  enumerates read and write independently for repository/branch policy, CI environments/deployment approvals,
  secrets/variables, runner list/register/remove, and release assets using versioned adapter field schemas.
  Unsupported operations route to a labeled official external surface, secret values enter through the
  human-only broker and are never read back from metadata, and runner registration requires an exact Execution
  Host and consent rather than following from CI enablement.
gui_related: true
gui_classification_reason: The matrix supplies setup cards, permission labels, precise disabled reasons, trust prompts, admin forms, and external-only navigation.
depends_on: [FGI-014, GAAAF-015, SIR-033]
unblocks: [F3-529]
acceptance_criteria:
  - All thirteen provider profiles and four local-VCS profiles exist separately with every named dimension reporting explicit state/probe/reason rather than generic compatibility.
  - Same-name/different-instance, custom base path/SSH port, private CA, redirect, metadata, and changed-host-key fixtures fail or prompt at the exact trust gate without leaking authorization.
  - >-
    Every provider profile identifies the setup method it admits, in `provider_adapter_profile.auth_methods`. The
    other six facts are identified by the surfaces the canonical text names one by one: the issuer by
    `Plans/GitHub_API_Auth_and_Flows.md` and `oauth_registration_ref`, the allowed host by `normalized_host` and
    `api_base_path`, the non-secret token owner by the three `credential_ref` and `credential_key_ref` fields, the
    requested scopes by `api_compatibility.scopes` and `token_lease.scope_grant_refs`, refresh and revoke by the
    `token_lease` lifetime and state fields, and the Git-versus-API roles by `git_transport_state`, `api_state`,
    `transport_api_independent` and `credential_access`. Neither closed profile schema has a field for those six,
    so this criterion is met by naming the surface that holds each one; adding them to the profile schemas would be
    a new capability and is not done here.
  - Repository delete, force push, policy edit, runner registration, secret write, and organization management remain individually risk-tiered with preview, permission, confirmation, and currentness.
  - Every visible hosted-admin control resolves to owner command, versioned schema, permission, receipt, or labeled external-only route; GitHub retained administration is inventoried and no live section is silently dropped.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future provider matrix/trust/admin fixtures]
risk_class: capability_matrix_scope_trust_or_admin_authority_conflation
reasoning_tier: high
context_scope: provider_capability_auth_trust_and_admin_matrix
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future capability catalog and admin adapters]
node_compile_hint: {mode: static_matrix_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:7-13
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:31-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:39-45
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:90-140
  - source_ref:corrected-slice:machine__requirements.json__part-011__lines-002001-002196.txt:142-158
  - source_ref:corrected-slice:machine__provider_profiles.json__part-001__lines-000001-000220.txt:1-220
  - source_ref:corrected-slice:machine__provider_profiles.json__part-002__lines-000201-000420.txt:201-420
  - source_ref:corrected-slice:machine__provider_profiles.json__part-003__lines-000401-000620.txt:401-620
  - source_ref:corrected-slice:machine__provider_profiles.json__part-004__lines-000601-000692.txt:601-692
preserved_exact_tokens: [github_cloud, github_enterprise, gitlab_saas, gitlab_self_managed, azure_devops_services, azure_devops_server, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, cursor_origin_native, cursor_origin_github_mirror, generic_git, Microsoft Entra, guided scoped PAT, registered OAuth/PKCE, human-only broker, auth_methods, credential_access]
negative_constraints:
  - Do not use one GitHub-compatible boolean, universal username/password form, global TLS bypass, or cross-origin Authorization.
  - Do not request account passwords, deprecated Bitbucket app passwords, new legacy Azure DevOps OAuth, or silent admin scopes for ordinary work.
  - Do not treat metadata names as secret values or offer Reveal where the provider cannot return a value.
  - Do not register a runner without exact Execution Host targeting and explicit consent or merely because Actions/Pipelines is enabled.
  - Do not fabricate mutation success when an API is unsupported or unimplemented.
  - Do not claim live vendor currentness, runtime security, provider access, or admin implementation from static matrix/schema/fixtures.
```

## DL-043 Accepted Jujutsu Planning Addendum - 2026-09-11

This addendum compiles the specified DL-043 answers as accepted planning requirements. It does not change current command/provider enums, admit typed schema variants, register handlers/events, implement runtime behavior or claim readiness. Conditions remain acceptance criteria. Declined dispositions receive no PlanUnits. Cross-owner command, GUI, wiring, Contracts, Permissions/FileSafe and Backup amendments remain with their canonical owners.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Jujutsu_Integration.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/Forge_Integrations.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/FinalGUISpec.md

### FGI-016 - Conditional Ordered Review Stack Workflow

```yaml
plan_unit_id: FGI-016
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: Add one explicitly supported forge workflow at a time. Ordered review-stack publication is planned
  only through a qualified workflow for an exact existing forge profile; neither all-provider support nor atomic
  push-and-review creation is implied.
gui_related: true
gui_classification_reason: The unit defines user-visible history, selection, comparison, or availability behavior.
depends_on:
- FGI-003
- FGI-004
- FGI-010
- SCS-015
- SCS-016
- SCS-018
- JJI-019
unblocks: []
acceptance_criteria:
- Each admitted workflow names its provider/instance/profile, repository/account/binding generation, native local
  changes and immutable commits, ordered review dependencies, exact base/head mappings, publish refs/refspecs/URLs,
  existing review IDs and per-phase capabilities. A preview shows every local/transport/hosted effect and expected
  remote heads.
- Publish and review create/update/link phases record intent and idempotency/correlation before each effect and
  retain per-item receipts. A successful push followed by failed review creation is partial success with known published
  refs, created review IDs and pending work, not rollback or total failure.
- Unknown review/push effects block retry until exact SCS-016 reconciliation. Resume repeats only proven unapplied
  phases; no duplicate reviews, force push, remote deletion or destructive compensation occurs automatically.
- Rewrites require a fresh explicit mapping from old/new immutable commits to the existing exact review IDs and
  bases. Changed remote head, reordered/removed change, merge-shaped stack, protected ref or unsupported base-link
  behavior blocks or requests a newly previewed supported plan; no mapping by title or stable change ID alone.
- Preserve FGI-004 immutable review versions, stale approvals, Draft-by-default agent behavior and separate Mark
  Ready. Transport credential lease and hosted API credential/grant remain separately scoped; policy/CI/cost disclosure
  and per-target authorization recheck for each phase.
- 'Design default grounded in FGI-003/004: this unit establishes workflow qualification criteria without choosing
  a forge or extending the closed command/provider enums. Unqualified workflows stay unavailable; publication remains
  inside existing adapter behavior.'
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- future push-success/review-failure, timeout-after-create, restart resume, rewritten stack, protected head, exact
  base mapping and Draft policy fixtures
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: conditional_ordered_review_stack_workflow
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Forge_Integrations.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Forge_Integrations.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add one explicitly supported forge workflow at a time.
```

### FGI-017 - Conditional Additional Review Service Admission

```yaml
plan_unit_id: FGI-017
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: Add only for a concrete user workflow and keep local history independent. Additional review services
  are conditionally planned, with a concrete workflow and complete owner admission required before expanding the
  existing closed provider envelope. A native upload command or adjacent library does not admit Gerrit or any other
  provider.
gui_related: false
gui_classification_reason: The unit defines owner service, identity, authorization, or native effect semantics.
depends_on:
- FGI-001
- FGI-003
- FGI-004
- FGI-015
- SCS-011
- SCS-012
- SCS-018
unblocks: []
acceptance_criteria:
- Before a service can become effective, record its concrete workflow, distinct provider/variant/instance/account/repository
  identity, immutable change/review/revision vocabulary, authentication/credential scopes, read/upload/update/submit
  semantics, policy and protected target checks, capability/version matrix, failure/retry/reconciliation and migration
  boundaries under a named provider owner.
- Extend exact enums, typed contracts, positive/negative fixtures, catalog, owner commands and central routing only
  in a separate explicit admission step; generic_host is not a tunnel to unsupported hosted review behavior. Until
  then preserve the current provider list and truthful unavailable/unknown states.
- Local JJ change/operation history, checkpoint/Backup and workspace recovery remain functional independently of
  online review setup, availability or credentials. Service outage or detachment never deletes local history or
  changes local mutation authority.
- Hosted review receipt/evidence uses FGI-004 immutable revisions and SCS-016 exact effect reconciliation; authentication,
  idempotency, changed-head, cancellation and provider-native conflict limitations must be qualified for the concrete
  workflow.
- No external IDE client, public shared source-control service, MCP surface, third-party engine/diff library, automatic
  provider choice or bespoke publishing hook is introduced by this condition.
- Planning acceptance does not admit a command, schema variant, native handler, persisted event, supported version,
  or runtime capability; SCS-018 admission requirements apply.
validation_surfaces:
- future concrete-workflow owner admission checklist, local-offline independence, provider identity/scopes, timeout
  reconciliation and unsupported-provider negatives
- future exact-version positive and negative fixtures; static prose is not runtime proof
risk_class: conditional_additional_review_service_admission
reasoning_tier: high
context_scope: jujutsu_d5_owner_planning
implementation_surfaces:
- Plans/Forge_Integrations.md
- future qualified owner adapter and typed contract extensions
node_compile_hint:
  mode: accepted_planning_pending_typed_admission
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- Plans/Decision_Log.md:DL-043
negative_constraints:
- Do not claim runtime, security, visual, or readiness proof from this planning acceptance.
owner_hints:
- Plans/Forge_Integrations.md
- Plans/Contracts_V0.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
preserved_exact_tokens:
- Add only for a concrete user workflow and keep local history independent.
```

## DL-063 to DL-065 Accepted Forge Capability Planning Addendum - 2026-09-18

This addendum compiles the seven accepted Azure DevOps decision-card answers of 2026-09-18 as accepted planning requirements. It does not change current command or provider enums, admit typed schema variants, register handlers or events, implement runtime behavior or claim readiness. Conditions remain acceptance criteria. The deferred branch-policy read receives no PlanUnit. Cross-owner command, GUI, wiring and contract amendments remain with their canonical owners.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Azure_DevOps_Integration.md, ContractName:Plans/Source_Control_System.md, ContractName:Plans/UI_Command_Catalog.md

### FGI-018 - Typed Merge Strategy On The Forge Merge Request

```yaml
plan_unit_id: FGI-018
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  The forge merge request carries one provider-neutral typed merge strategy field. Its default is the provider's
  own default rather than a Puppet Master preference, and it is always shown before the merge, including when it
  is the default, because a strategy visible only when changed is a strategy nobody reads. Omission is not
  neutral on every provider: on Azure a completion that names no strategy selects a no-fast-forward merge, which
  a repository policy may forbid. The effective policy's permitted strategies are therefore resolved before a
  merge affordance is offered, a strategy the policy forbids is not offered, and a completion naming one is
  refused before the request rather than reported after it. Each provider maps the neutral value to its own
  parameter, and a provider with no equivalent for a value does not offer that value.
gui_related: true
gui_classification_reason: The strategy is a visible control and a line of confirmation copy on the one action a person cannot undo cheaply.
depends_on: [FGI-005, FGI-010]
unblocks: []
acceptance_criteria:
  - The merge request carries one typed provider-neutral merge strategy whose default is the provider's own default.
  - The strategy is shown before every merge, including when it is the default.
  - >-
    The effective policy's permitted strategies are known before a merge affordance is offered; a forbidden
    strategy is not offered and a completion naming one is refused before the request rather than reported after
    it.
  - A provider with no equivalent for a neutral value does not offer that value, and no value is silently mapped to a different one.
  - No command is added, no handler or event is registered, and no WorkNode or NodeSeed is created by this unit.
validation_surfaces:
  - >-
    no validator surface in this landing; recorded as `q-020`. The shapes this unit describes are not in any schema or fixture pack, because the addendum admits no typed schema variant, so the unit is stated and not yet falsifiable. No merge-strategy field exists in the forge schema or its fixture pack, at base or after
    this landing, so the contracts gate cannot fail if this unit's promises are broken.
  - future per-provider merge strategy mapping fixtures
risk_class: implicit_merge_strategy_selection
reasoning_tier: high
context_scope: forge_merge_strategy
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, future review adapters]
node_compile_hint: {mode: forge_capability_planning_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-063, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-005]
preserved_exact_tokens: [merge strategy, no-fast-forward, the provider's own default]
negative_constraints: [Do not hide the strategy when it is the default., Do not default the strategy to a Puppet Master preference., Do not offer a strategy the effective policy forbids., Do not silently map a neutral value to a different provider parameter.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Azure_DevOps_Integration.md]
```

### FGI-019 - Policy Evaluation Requeue That Degrades Truthfully

```yaml
plan_unit_id: FGI-019
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  A command that re-runs one policy evaluation is accepted planning. It is disabled with a typed reason and never
  hidden where the provider has no equivalent. Where the provider would accept a requeue that does nothing,
  because the evaluation is not a build policy, the request is refused with a typed reason rather than reported
  as success. Where a requeue cancels a build already running for that policy, the confirmation names the policy
  and discloses the cancellation before dispatch, as an effect on a third object rather than a discovery
  afterwards. The command targets one evaluation identity from the gate record rather than a whole policy set,
  and it follows DL-061, because the interface has to settle what an evaluation is before a control can re-run
  one. Nothing here admits the command to the central command set, the command catalog or production wiring;
  those remain with their owners.
gui_related: true
gui_classification_reason: The control, its typed disabled reason and its confirmation copy are what a person meets when a gate has failed for a transient reason.
depends_on: [FGI-005, FGI-010]
unblocks: []
acceptance_criteria:
  - The requeue control is disabled with a typed reason and never hidden where the provider has no equivalent.
  - A requeue the provider would accept but not act on is refused with a typed reason rather than reported as success.
  - A requeue that cancels a build already running names the policy and discloses the cancellation in the confirmation before dispatch.
  - The command targets one evaluation identity from the gate record, never a whole policy set.
  - This unit admits no command to the central command set, the command catalog, production wiring or any event family, and creates no WorkNode or NodeSeed.
validation_surfaces:
  - >-
    no validator surface in this landing; recorded as `q-020`. The shapes this unit describes are not in any schema or fixture pack, because the addendum admits no typed schema variant, so the unit is stated and not yet falsifiable. No requeue command, target kind or disabled reason exists in the forge schema or its
    fixture pack, so the contracts gate cannot fail if this unit's promises are broken.
  - future requeue disabled-reason and confirmation fixtures
risk_class: silent_no_op_or_undisclosed_build_cancellation
reasoning_tier: high
context_scope: forge_policy_evaluation_requeue
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/Azure_DevOps_Integration.md, future policy adapters]
node_compile_hint: {mode: forge_capability_planning_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-064, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-006]
preserved_exact_tokens: [requeue, build policy, typed reason, gate record]
negative_constraints: [Do not hide the control where the provider has no equivalent., Do not report a requeue that does nothing as success., Do not cancel a running build without disclosing it in the confirmation first., Do not admit this command to the central command set or production wiring under this unit.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Azure_DevOps_Integration.md, Plans/UI_Command_Catalog.md]
```

### FGI-020 - Provider Neutral Vote And Reviewer Carrier

```yaml
plan_unit_id: FGI-020
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  A provider-neutral vote and reviewer carrier is accepted planning for the common forge contracts. It holds the
  reviewer identity, the vote value from one closed vocabulary, whether that reviewer is a required reviewer, and
  the revision the vote is bound to together with the binding kind that established it. The binding kind is
  provider-asserted where the provider supplies a revision identity on the vote, and observed by Puppet Master
  where it does not, which is DL-060's rule. A vote carrying neither binding is not shown as current evidence.
  The carrier is what lets the Azure owner's two vote acceptance criteria be restated as promises a shape can
  keep rather than removed, and it is exercised by fixtures for more than one provider before it is claimed as
  common.
gui_related: true
gui_classification_reason: Reviewer identity, the vote value and the required-reviewer marker are what a review view shows about who has approved what.
depends_on: [FGI-004, FGI-005]
unblocks: []
acceptance_criteria:
  - The carrier holds reviewer identity, a vote value from one closed vocabulary, a required-reviewer flag, the bound revision and the binding kind.
  - The binding kind is provider-asserted or observed by Puppet Master, and a vote with neither is not shown as current evidence.
  - The carrier is exercised by a fixture for more than one provider before it is claimed as a common shape.
  - A vote observed against an earlier provider revision is reported stale against the current one rather than carried silently.
  - No command, handler, event or runtime behaviour is admitted by this unit, and no WorkNode or NodeSeed is created.
validation_surfaces:
  - >-
    no validator surface in this landing; recorded as `q-020`. The shapes this unit describes are not in any schema or fixture pack, because the addendum admits no typed schema variant, so the unit is stated and not yet falsifiable. No vote, approval or reviewer definition exists in the forge schema or its fixture pack,
    so the contracts gate cannot fail if this unit's promises are broken.
  - future per-provider vote and reviewer fixtures
risk_class: unbindable_vote_promise
reasoning_tier: high
context_scope: forge_vote_and_reviewer_carrier
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/Azure_DevOps_Integration.md]
node_compile_hint: {mode: forge_capability_planning_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-065, Plans/Decision_Log.md#DL-060, Plans/ledgers/v2/pldg-20260918-001-azure-devops-corrections:q-007]
preserved_exact_tokens: [vote value, required reviewer, observed by Puppet Master, provider-asserted]
negative_constraints: [Do not add a vote carrier only one provider can populate., Do not show a vote with no binding of either kind as current evidence., Do not restore the Azure vote criteria before the carrier exists.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Azure_DevOps_Integration.md]
```


## Explicit Team-Project Child Routing — 2026-09-24

### FGI-021 - Team-Project Create Child Route And Admission

```yaml
plan_unit_id: FGI-021
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  cmd.forge.team_project.create is the distinct generic Forge child command for ADO-008's explicitly reviewed
  Azure team-project creation, with one sole planned target handlers::forge::team_project_create under
  ForgeIntegrationCoordinator. It is a required child of the initiating approved Project-owner operation, not a
  new Puppet Master Project command, independent Onboarding wrapper or hidden repository-create effect. Its
  pre-project subject binds the actual verified account and organization or collection without a fabricated
  project or repository. Current dispatch consumes its real closed intent, preview and target-specific admission;
  handler_unavailable remains until native owner routing, durable recovery and provider proof exist.
gui_related: true
gui_classification_reason: The existing reviewed optional Azure choice exposes exact availability, child progress, failures and return without adding an independent setup command surface.
depends_on: [FGI-008, FGI-011, ADO-008, PJCT-007]
unblocks: []
acceptance_criteria:
  - >-
    The sole planned target is handlers::forge::team_project_create under ForgeIntegrationCoordinator; the Azure
    owner supplies provider mapping and execution. Requests are restricted to azure_devops_services or
    azure_devops_server under a current initiating Project request/setup binding, original reviewed draft hash,
    exact parent operation, active Client and selected Host/Execution Environment. The generic command name
    grants no other provider support, standalone palette/API creation or precommit source-access authority.
  - >-
    Plans/forge_integration_contracts.schema.json owns team_project_create_command_request_v1,
    team_project_create_command_result_v1, team_project_create_command_error_v1,
    team_project_create_command_availability_v1 and team_project_create_command_receipt_v1. Each carries a
    distinct schema ID and the exact command ID. Existing command_id remains the closed historical 46-ID enum;
    all existing request/result/error/availability/receipt definitions remain exact. The new request cannot be
    decoded or dispatched as legacy command_request or repository_create_command_request_v2.
  - >-
    Current command_request_admission appends only team_project_create_command_request_v1 to its unchanged
    existing arms. command_result_admission is exactly command_result or team_project_create_command_result_v1;
    command_error_admission is exactly command_error_record or team_project_create_command_error_v1;
    command_availability_admission is exactly command_availability or team_project_create_command_availability_v1;
    command_receipt_admission is exactly command_receipt or team_project_create_command_receipt_v1.
    All legacy arms remain unchanged. Their discriminating schema IDs prevent an older carrier from gaining the new
    mutation. Current consumers use these admission unions; historical readers remain available as readers.
  - >-
    The concrete request consumes actual team_project_creation_intent and the hash-bound resolved
    team_project_creation_preview. team_project_creation_admission independently joins actual source, parent,
    account/organization-or-collection, current capability/catalog/API endpoint support, permission_decision,
    scoped grant, target-bound confirmation, rate budget and expiry. A caller snapshot or wrapper-only validator
    is not admission. The operation's exact team-project-create target and capability are explicit new arms,
    never a repository capability, invented repository generation or extension of the legacy closed vocabularies.
  - >-
    Intent/preview retain project name, explicit project visibility, current catalog-resolved process template
    and Git-only capabilities. An uncreated project has no provider_project_id. Provider acceptance exposes
    linked ObservableWork and the actual native operation identity when returned, not success. Typed
    team_project_operation_observation and the dedicated terminal result/receipt distinguish pending, failure,
    cancellation, reconciliation-required and effect_unknown from causally verified success with ready-project
    readback. No unknown response or same-name resource licenses a second creation request.
  - >-
    Forge owns the bounded durable team_project_creation_operation journal and typed terminal receipt under
    existing scd.forge.durable.v1, with Storage-owned physical registration and retention/redaction companions.
    The journal binds parent/request/intent/preview/source hashes, target, stable dedupe identity, dispatch
    boundary, observation sequence and native operation/result refs before effects and through reconciliation.
    scd.forge.command_transport.v1 continues to classify transient requests/previews/results separately. The
    existing durable disposition is physical_family_registration_pending; naming a journal or reusing that
    disposition is not a physical writer, implemented journal, restart guarantee or native admission.
  - >-
    A typed team_project_repository_handoff binds the original approved create source, child journal/operation,
    verified terminal receipt and current ready-project resource. Project System resolves and hash-checks the
    actual child records; generic receipt membership or matching strings do not prove success. The existing
    repository-create command receives the real result-derived subject plus its own fresh preview/permission.
    The approved source is never rewritten to existing and the child's admission never requires its own
    terminal parent result. Required child failures prevent publication of a falsely ready Puppet Master Project.
  - >-
    Central Commands/catalog, TCP-FORGE and production wiring companions must name the same concrete command,
    schemas and sole planned handler. Existing thirteen Onboarding local actions remain unchanged; the reviewed
    Project owner dispatches the child. Every new actual carrier requires positive and causal negative fixtures,
    including wrong parent/subject/hash, legacy admission bypass, no-project absence, async response loss and
    no-replay, terminal readback mismatch and exact repository handoff. expected_event_types=[] remains; no
    EventRecord, native implementation, WorkNode, readiness unlock or physical family is admitted by this prose.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, current admission and legacy rejection tests, actual Project-child-to-repository composition tests, journal/reconciliation static contract tests]
risk_class: azure_team_project_child_bypasses_common_forge_admission
reasoning_tier: high
context_scope: forge_team_project_creation_child_route
implementation_surfaces: [Plans/Commands_System.md, Plans/Project_System.md, Plans/UI_Command_Catalog.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, Plans/storage_value_registry.json, future ForgeIntegrationCoordinator and Azure adapter]
node_compile_hint: {mode: forge_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Azure_DevOps_Integration.md#ADO-008, "packet:PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/04_ACCOUNT_SIGNIN_AND_PROJECT_CREATION_MATRIX.md#section-4", Plans/Project_System.md#PJCT-007]
preserved_exact_tokens: [cmd.forge.team_project.create, handlers::forge::team_project_create, ForgeIntegrationCoordinator, handler_unavailable, command_request_admission, command_result_admission, command_error_admission, command_availability_admission, command_receipt_admission, permission_decision, ObservableWork, provider_project_id, effect_unknown, scd.forge.durable.v1, scd.forge.command_transport.v1, physical_family_registration_pending]
negative_constraints: [Do not add the new mutation to the legacy 46-ID enum., Do not reuse repository creation for team-project creation., Do not invent a project or repository identity before provider creation., Do not treat transient transport as a durable dedupe journal., Do not bypass current parent/target permission through an internal wrapper., Do not rewrite approved create intent as existing., Do not grant native availability from schemas or handler names.]
owner_hints: [Plans/Forge_Integrations.md, Plans/Azure_DevOps_Integration.md, Plans/Project_System.md, Plans/Commands_System.md, Plans/storage-plan.md]
```
