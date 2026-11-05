# Forge Integrations

> **Compliance:** This document follows `Plans/DRY_Rules.md`, consumes shared envelopes from `Plans/Contracts_V0.md`, and uses the PlanUnit contract in `Plans/Plan_Document_System.md`. Puppet Master is the only product name.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Sole canonical owner for provider-neutral forge repository binding, independent automation binding, authority roles, capability routing, mirrors, immutable review revisions and threads, pipelines/checks projections, the `repository_automation` / **Actions & Pipelines** shell contract, app/grant/token-lease shapes, webhook verification/dedup/recovery, API compatibility, degradation, provider-neutral commands/events/receipts, and common Forge GUI projections.

## 0. Scope

Puppet Master models a hosted forge independently from local source control. The closed forge identity is `forge_provider=github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|forgejo|gitea|generic_host|none`; `none` is valid only in source-control context and has no forge binding. Forgejo and Gitea are separate provider identities and separate adapters even when they reuse HTTP/auth/pagination/error/cache primitives; `forgejo_or_gitea` is forbidden as a permanent API identity. A forge never becomes an `scm_backend`, local workspace, mutation lease, model provider, or generic `provider` string.

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
| Retired source-control proposal | `Plans/Cursor_Origin_Integration.md` | DL-273 retirement anchors only; no operational offering or route. |
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
canonical_text: Plans/Forge_Integrations.md owns provider-neutral forge binding, authority, capabilities, mirrors, reviews,
  pipelines, independent automation binding, apps, webhooks, API compatibility, commands, events, receipts, degradation
  and projections. forge_provider is independent of scm_backend; each provider owner maps native behavior into this common
  contract, and Forgejo and Gitea remain distinct provider and adapter identities.
gui_related: true
gui_classification_reason: Common forge identity controls visible reviews, pipelines, source-of-truth, mirror, and setup
  projections.
depends_on:
- SCS-001
- PDS-003
unblocks:
- FGI-002
- FGI-003
- FGI-004
- FGI-005
- FGI-006
- FGI-007
- FGI-008
- GLI-001
- ADO-001
- BBI-001
acceptance_criteria:
- Every hosted repository has one typed provider/variant/host/account/repository binding.
- Local backend and forge provider remain independent.
- Forgejo and Gitea never collapse into a permanent combined API identity.
- Provider owners extend common records without duplicating them.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
risk_class: forge_parallel_owner_or_provider_overload
reasoning_tier: high
context_scope: common_forge_owner
implementation_surfaces:
- Plans/Forge_Integrations.md
- future forge facade
node_compile_hint:
  mode: common_forge_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:SCM-05
- source_ref:egolite-register:TS-04
preserved_exact_tokens:
- forge_provider
- RepositoryForgeBinding
- AutomationBinding
- github
- gitlab
- azure_devops
- bitbucket_cloud
- bitbucket_data_center
- forgejo
- gitea
- generic_host
negative_constraints:
- Do not treat a forge as scm_backend.
- Do not overload provider.
- Do not create a separate common contract per provider.
- Do not define forgejo_or_gitea as a permanent provider or API identity.
owner_hints:
- Plans/Forge_Integrations.md
```
### FGI-002 - Repository Authority Roles And Mirror Topology

```yaml
plan_unit_id: FGI-002
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  A repository binding models storage, review, checks, issues, transport and mirror authority roles independently; its legacy automation role is compatibility projection only and AutomationBinding is the sole hosted-automation selector. MirrorTopology records source, destination, authoritative binding, requested/effective mode, exact revision fence, dedupe key, lag, health and transition receipt. Detach, reconnect and authority transfer require human disclosure, current revisions, Permissions/FileSafe, durable receipt, recovery and capability re-resolution.
  Contribution records explicitly name fork/head and original/base repository bindings plus their authority roles; the strings origin and upstream never select them. FGI-023/024 and PJCT-010 use these roles through the existing Forge commands, leaving AutomationBinding independent.
gui_related: true
gui_classification_reason: Authority, source of truth, mirror health, lag, detach and reconnect are visible state and
  actions.
depends_on:
- FGI-001
- SCS-002
unblocks:
- FGI-003
- FGI-007
- FGI-008
acceptance_criteria:
- Authority roles cannot be inferred from mirror direction or remote name.
- Repository hosting authority cannot select or imply automation service/provider/account authority.
- Mirror mutations require current authority and revision fences.
- Detach and reconnect preserve transition, recovery, dedupe and capability evidence.
validation_surfaces:
- MirrorTopology fixtures
- split-authority tests
- stale detach and duplicate delivery tests
risk_class: split_brain_forge_authority
reasoning_tier: high
context_scope: forge_authority_and_mirrors
implementation_surfaces:
- Plans/forge_integration_contracts.schema.json
- future mirror coordinator
node_compile_hint:
  mode: forge_authority_mirror_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-01
- source_ref:egolite-register:SCM-05
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- storage
- review
- checks
- automation
- issues
- transport
- mirror
- MirrorTopology
- revision fence
- dedupe
negative_constraints:
- Do not call a mirror authoritative by direction alone.
- Do not detach without a human warning and durable receipt.
- Do not silently mutate a secondary provider.
owner_hints:
- Plans/Forge_Integrations.md
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
  Owner/public repository discovery uses the existing repository.list command with a new explicit account/instance/owner scope and truthful coverage; a pasted URL is a locator, never account or write authority. A read-only original may offer Contribute only where FGI-024 admits the fork capability; otherwise the team-project branch path or typed unsupported outcome is shown.
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
source_lineage:
- source_ref:egolite-register:SCM-05
- source_ref:egolite-register:ORI-03
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  Agent-authored reviews default Draft unless the exact effective review policy permits otherwise through the Settings ladder, omitting Project for application context; Mark Ready remains distinct and normal target/permission gates remain.
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
source_lineage:
- source_ref:egolite-register:ORI-04
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
canonical_text: Forge app records store stable installation identity, account, non-secret grant refs, state and credential-key
  ref only. Token leases are least-privilege, repository/scope-bound, expiring and revocable and persist no raw token.
  Webhooks verify provider signature over raw body before parsing, validate time/context, reject replay, dedupe by stable
  delivery identity, acknowledge quickly, process asynchronously, and preserve retry/inspection/redelivery/recovery state.
gui_related: true
gui_classification_reason: App/grant/reauthorization and webhook health/recovery are visible Settings state and actions.
depends_on:
- FGI-003
unblocks:
- FGI-007
- FGI-008
acceptance_criteria:
- Raw secrets never enter forge records, events, logs, Project files, chat, prompts, or ordinary receipts.
- Signature verification occurs before payload parse and replay/dedupe checks precede effects.
- Duplicate delivery produces at most one effect and remains inspectable.
validation_surfaces:
- app/token/webhook schema fixtures
- secret scans
- signature-before-parse tests
- replay/dedupe/redelivery tests
risk_class: forge_secret_or_webhook_replay
reasoning_tier: high
context_scope: forge_apps_webhooks_security
implementation_surfaces:
- Plans/forge_integration_contracts.schema.json
- future credential broker
- future webhook ingress
node_compile_hint:
  mode: forge_app_webhook_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-02..03
- source_ref:egolite-register:SEC-02..03
preserved_exact_tokens:
- ForgeAppInstallation
- ForgeInstallationTokenLease
- raw-body
- signature before parse
- replay
- dedupe
- redelivery
negative_constraints:
- Do not persist raw tokens.
- Do not parse before signature verification.
- Do not perform duplicate delivery effects.
- Do not expose webhook or broker IPC publicly.
owner_hints:
- Plans/Forge_Integrations.md
- Plans/Multi-Account.md
- Plans/Permissions_System.md
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
canonical_text: 'Forge review and hosting behavior appears in Source Control and its Settings manager, while hosted automation
  uses exactly one canonical `repository_automation` occupant labeled Actions & Pipelines, never a panel per provider.
  Provider-native PR/MR, Actions/Pipelines/build/check wording comes from the selected repository or independent automation
  adapter. Every visible action dispatches one cmd.forge.* or shared setup command with exact binding, target, permission
  and currentness data, returns a typed receipt and ObservableWork when async, and never infers automation authority
  from the Git remote, display name, or RepositoryForgeBinding.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
gui_related: true
gui_classification_reason: This unit defines visible common forge placement, vocabulary, actions, progress, health, and
  migration state.
depends_on:
- FGI-002
- FGI-003
- FGI-004
- FGI-005
- FGI-006
- FGI-007
- SCS-005
unblocks: []
acceptance_criteria:
- No provider adds a dedicated rail/panel or provider-specific command namespace; `github_actions` is migration-read/route
  input only and normalizes to `repository_automation`.
- Visible actions converge on one canonical command with exact provider/binding/target/currentness/permission payload.
- Every one of the 52 canonical Forge commands has one schema-valid request and one rejected permission/guard/currentness
  negative fixture.
- GitHub retains its provider-native Actions content inside the generic shell; a Git remote name never creates a hosted automation service.
- Legacy hosted records migrate only from validated provider identity; ambiguous records remain blocked.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- provider GUI fixtures
- command/wiring census
- migration fixtures
- accessibility and degraded-state tests
risk_class: forge_gui_command_or_migration_drift
reasoning_tier: high
context_scope: forge_gui_settings_commands_migration
implementation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: forge_gui_command_migration_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:UI-01..03
- source_ref:egolite-register:CT-01..02
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
preserved_exact_tokens:
- cmd.forge.*
- Pull Request
- Merge Request
- Ready with limits
- Needs attention
- Not available
negative_constraints:
- Do not create cmd.origin.*
- cmd.gitlab.*
- cmd.azure_devops.*
- or cmd.bitbucket.* primary namespaces.
- Do not infer provider from display copy.
- Do not call command dispatch completion.
owner_hints:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
- Plans/Settings_System.md
```
## 3. Contracts, Schemas, Events, Or Data Shapes

`Plans/forge_integration_contracts.schema.json` owns common Draft 2020-12 record shapes, including provider-neutral discriminated command request, result, error, availability, disabled-reason, currentness, target, confirmation, allowlisted official-page/protected-browser handoff, webhook-redelivery, and receipt records. `Plans/forge_integration_contract_fixtures.json` owns provider-neutral positive and negative examples, including one valid request and one rejected permission-negative for every canonical Forge command plus focused provider-identity, stale/partial-currentness, mirror, immutable review, pipeline, webhook, protected-browser, confirmation, effect-unknown, and secret-boundary negatives. Provider fixture files validate adapter-profile and provider-specific cases against the common schema; they do not create competing provider schemas.

### 3.1 Canonical commands

```text
cmd.forge.repository.list
cmd.forge.repository.refresh
cmd.forge.repository.create
cmd.forge.repository.delete
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
cmd.forge.review.edit
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
cmd.forge.pipeline.artifact.download
cmd.forge.pipeline.secret.set
cmd.forge.pipeline.secret.remove
cmd.forge.pipeline.variable.set
cmd.forge.pipeline.variable.remove
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

None of the six 2026-09-26 command admissions is an alias: repository delete is not create, fork, mirror detach, or connection removal; pipeline artifact download is not release asset download, pipeline open/list, or log access; secret set/remove and variable set/remove are not each other, not generic settings mutation, and not pipeline approval; and no admitted command is a renamed packet candidate for review listing, definition/artifact enumeration, definition pinning, capability refresh, or publication preview, which remain deliberately non-admitted (see FGI-021).

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



### W3A separate Forge family definitions (phase 1, without admission)

### FGI-1200 - forge.api.compatibility_changed prepared contract

```yaml
plan_unit_id: FGI-1200
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.api.compatibility_changed@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.api.compatibility_changed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-007 and Plans/forge_integration_contracts.schema.json#/$defs/api_compatibility
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: An actual compatibility probe replaces a previously committed compatibility assessment
  and changes at least one endpoint/version/release-state, schema pin, mutation-safety, scope, feature or rate/currentness
  fact. Unchanged re-observation saves no change. Unknown or failed compatibility remains mutation-closed; a changed
  assessment does not itself enable mutation. Endpoint pins are per endpoint; a preview-only or absent route degrades
  only its dependent capability. A synthesized global API version is not evidence. Before/after source snapshots
  are immutable owner records; event publication never selects a new behavior or resolves a conflicting owner. Result
  refs must resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeCompatibilityProbe.commit_result@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_api_compatibility_changed_source source identity and domain fact before calling forge.api.compatibility_changed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_api_compatibility_changed.schema.json# selects pm.event_payload.forge_api_compatibility_changed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  compatibility_snapshot_ref, previous_compatibility_snapshot_ref and no others. Each domain ref resolves the original
  api_compatibility or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1200; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.api.compatibility_changed, is this
  separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or
  another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year
  is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1200 policies without retaining linked content.


  Custody/redaction: forge_api_compatibility_changed_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Forge Settings connection health reader as consumer.forge.api.compatibility_changed.history@1.0.0,
  fed by projector.forge.api.compatibility_changed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1200 owns forge_api_compatibility_changed_checkpoint, exact schema, key, complete global
  scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences.
  The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including An actual compatibility probe replaces
  a previously committed compatibility assessment and changes at least one endpoint/version/release-state, schema
  pin, mutation-safety, scope, feature or rate/currentness fact. Oracle code, shared-number adoption and shared
  guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture
  also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete
  original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including its exact closed
  payload and original actor/account/time/causality fields), encoded by the existing owner physical codec. Before
  source_committed, verify that pack, its exact actual source-derived fields and recomputed owning producer_semantic_digest,
  and commit the source identity plus pack membership together. This is the restart input for the SAME publication,
  not a new accepted operation. A lost/damaged pending pack fences and requires coherent backup; current provider
  state cannot replace it. At history_committed CAS, resolve the original full-value first receipt, verify every
  intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction. Pending reference
  protection ends only on that real settlement; no hidden permanent body copy or new expiry policy is created. If
  a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-007
- CV-1200
- SP-1200
unblocks: []
acceptance_criteria:
- forge.api.compatibility_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_api_compatibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_api_compatibility_changed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_api_compatibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-007
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.api.compatibility_changed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1201 - forge.connection.capabilities_changed prepared contract

```yaml
plan_unit_id: FGI-1201
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.connection.capabilities_changed@1.0.0 under deck-2 9.a
  A (DL-450), preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.connection.capabilities_changed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-003 and Plans/forge_integration_contracts.schema.json#/$defs/capability_envelope
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A committed capability assessment for the exact connection differs from its previous
  committed assessment. Preserve requested/effective capability, catalog and adapter generation, tier/license/version/currentness
  and exact disabled reason. Repeating an unchanged probe is not a change. A review-scoped capability can narrow
  the binding ceiling only. API, transport and Actions support stay independent; unknown mutation safety never authorizes
  a write. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgeCapabilityResolver.commit_assessment@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_connection_capabilities_changed_source source identity and domain fact before calling
  forge.connection.capabilities_changed.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt
  custody by name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified
  synced first receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect
  success is established only by its own original result. Crash or effect_unknown reconciles that result, never
  repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_connection_capabilities_changed.schema.json# selects pm.event_payload.forge_connection_capabilities_changed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  capability_snapshot_ref, previous_capability_snapshot_ref and no others. Each domain ref resolves the original
  capability_envelope or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1201; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.connection.capabilities_changed, is
  this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry,
  or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run
  year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1201 policies without retaining linked content.


  Custody/redaction: forge_connection_capabilities_changed_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Forge capability routing history reader as consumer.forge.connection.capabilities_changed.history@1.0.0,
  fed by projector.forge.connection.capabilities_changed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable
  read token explicitly; SP-1201 owns forge_connection_capabilities_changed_checkpoint, exact schema, key, complete
  global scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal
  fences. The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A committed capability assessment
  for the exact connection differs from its previous committed assessment. Oracle code, shared-number adoption and
  shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending
  capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the
  complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including its exact
  closed payload and original actor/account/time/causality fields), encoded by the existing owner physical codec.
  Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning producer_semantic_digest,
  and commit the source identity plus pack membership together. This is the restart input for the SAME publication,
  not a new accepted operation. A lost/damaged pending pack fences and requires coherent backup; current provider
  state cannot replace it. At history_committed CAS, resolve the original full-value first receipt, verify every
  intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction. Pending reference
  protection ends only on that real settlement; no hidden permanent body copy or new expiry policy is created. If
  a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-003
- CV-1201
- SP-1201
unblocks: []
acceptance_criteria:
- forge.connection.capabilities_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_capabilities_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_capabilities_changed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_connection_capabilities_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.capabilities_changed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1202 - forge.connection.reauthorized prepared contract

```yaml
plan_unit_id: FGI-1202
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.connection.reauthorized@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.connection.reauthorized,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/app_installation
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The credential owner has completed a successful reauthorization for the same provider/instance/account
  connection and returned a new verified non-secret grant/lease result. Opening protected sign-in, waiting, cancellation,
  a failed auth result or merely selecting an account cannot satisfy this predicate. Broker custody and protected-browser
  restrictions remain external owners. Capture grant identity and scoped outcome only, with no token, code, credential
  path or protected-browser content. Before/after source snapshots are immutable owner records; event publication
  never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact original closed
  owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeConnectionLifecycle.commit_reauthorization@1.0.0 accepts only the actual native owner
  result/observation, not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject
  and admitted provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability
  controls for new work. Commit forge_connection_reauthorized_source source identity and domain fact before calling
  forge.connection.reauthorized.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody
  by name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified synced
  first receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect success
  is established only by its own original result. Crash or effect_unknown reconciles that result, never repeats
  the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_connection_reauthorized.schema.json# selects pm.event_payload.forge_connection_reauthorized.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  grant_ref, previous_grant_ref, auth_result_ref and no others. Each domain ref resolves the original app_installation
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1202; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.connection.reauthorized, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1202 policies without
  retaining linked content.


  Custody/redaction: forge_connection_reauthorized_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services grant-history reader as consumer.forge.connection.reauthorized.history@1.0.0,
  fed by projector.forge.connection.reauthorized.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1202 owns forge_connection_reauthorized_checkpoint, exact schema, key, complete global scan,
  inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The
  named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The credential owner has completed
  a successful reauthorization for the same provider/instance/account connection and returned a new verified non-secret
  grant/lease result. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution
  NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337
  BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent
  (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1202
- SP-1202
unblocks: []
acceptance_criteria:
- forge.connection.reauthorized is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_reauthorized.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_reauthorized_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_connection_reauthorized.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.reauthorized
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1203 - forge.connection.validated prepared contract

```yaml
plan_unit_id: FGI-1203
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.connection.validated@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.connection.validated,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-003 and Plans/forge_integration_contracts.schema.json#/$defs/capability_envelope
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact connection test has a settled typed validation result. Record its actual
  succeeded, degraded, blocked or failed result, including the capability/currentness proof. Dispatch, cached labels,
  an unfinished probe and a different account test do not count as completed validation. Validation does not create
  an account or repository and sign-in is not repository-write proof. A failed validation must not be rendered successful.
  Before/after source snapshots are immutable owner records; event publication never selects a new behavior or resolves
  a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller assertion
  or a current display copy.


  Producer and order: ForgeConnectionLifecycle.commit_connection_test@1.0.0 accepts only the actual native owner
  result/observation, not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject
  and admitted provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability
  controls for new work. Commit forge_connection_validated_source source identity and domain fact before calling
  forge.connection.validated.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by
  name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified synced first
  receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect success is
  established only by its own original result. Crash or effect_unknown reconciles that result, never repeats the
  remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_connection_validated.schema.json# selects pm.event_payload.forge_connection_validated.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  validation_result_ref, capability_snapshot_ref and no others. Each domain ref resolves the original capability_envelope
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1203; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.connection.validated, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1203 policies without
  retaining linked content.


  Custody/redaction: forge_connection_validated_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services connection-test history reader as consumer.forge.connection.validated.history@1.0.0,
  fed by projector.forge.connection.validated.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1203 owns forge_connection_validated_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact connection test has a
  settled typed validation result. Oracle code, shared-number adoption and shared guard-isolation proof are phase
  2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-003
- CV-1203
- SP-1203
unblocks: []
acceptance_criteria:
- forge.connection.validated is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_connection_validated.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_connection_validated_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_connection_validated.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.connection.validated
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1204 - forge.mirror.connected prepared contract

```yaml
plan_unit_id: FGI-1204
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.connected@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.connected,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: An admitted connect/reconnect operation commits a topology with the exact distinct
  source/destination bindings, authoritative binding, requested/effective mode and revision fence. Preserve the
  prior detached/unconnected state and successful transition receipt. Starting an attempted connection is not connected.
  Human disclosure and Permissions/FileSafe, capability and current-revision fences precede effects. Retired Origin
  or a generic transport route cannot regain mirror authority. Before/after source snapshots are immutable owner
  records; event publication never selects a new behavior or resolves a conflicting owner. Result refs must resolve
  their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeMirrorCoordinator.commit_connect@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_connected_source source identity and domain fact before calling forge.mirror.connected.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_connected.schema.json# selects pm.event_payload.forge_mirror_connected.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, previous_topology_ref, transition_receipt_ref and no others. Each domain ref resolves the
  original mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1204; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.connected, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1204 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_connected_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control Mirror Health history reader as consumer.forge.mirror.connected.history@1.0.0,
  fed by projector.forge.mirror.connected.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1204 owns forge_mirror_connected_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including An admitted connect/reconnect operation
  commits a topology with the exact distinct source/destination bindings, authoritative binding, requested/effective
  mode and revision fence. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native
  execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory
  SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic
  intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1204
- SP-1204
unblocks: []
acceptance_criteria:
- forge.mirror.connected is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_connected.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_connected_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_connected.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.connected
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1205 - forge.mirror.degraded prepared contract

```yaml
plan_unit_id: FGI-1205
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.degraded@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.degraded,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The committed topology first enters degraded service relative to its prior committed
  state, with exact lag/divergence/health evidence. Repeated observation of the same degradation does not emit another
  transition. No automatic detach, authority transfer or recovery is implied. Direction and lag do not select authority.
  Preserve both binding identities and the actual revision fence even when service is degraded. Before/after source
  snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgeMirrorCoordinator.commit_degradation@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_degraded_source source identity and domain fact before calling forge.mirror.degraded.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_degraded.schema.json# selects pm.event_payload.forge_mirror_degraded.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, previous_topology_ref, degradation_evidence_ref and no others. Each domain ref resolves the
  original mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1205; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.degraded, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1205 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_degraded_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control Mirror Health degradation reader as consumer.forge.mirror.degraded.history@1.0.0,
  fed by projector.forge.mirror.degraded.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1205 owns forge_mirror_degraded_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The committed topology first enters
  degraded service relative to its prior committed state, with exact lag/divergence/health evidence. Oracle code,
  shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or
  readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1205
- SP-1205
unblocks: []
acceptance_criteria:
- forge.mirror.degraded is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_degraded.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_degraded_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_degraded.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.degraded
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1206 - forge.mirror.detached prepared contract

```yaml
plan_unit_id: FGI-1206
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.detached@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.detached,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A permitted, disclosed detach completes and commits effective mode detached, preserving
  the preceding topology and the successful transition receipt. An attempted or uncertain detach remains its truthful
  owner result and cannot be presented as detached. Detach preserves the recovery/dedupe and capability re-resolution
  obligations. It never deletes repositories or silently transfers authority. Before/after source snapshots are
  immutable owner records; event publication never selects a new behavior or resolves a conflicting owner. Result
  refs must resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeMirrorCoordinator.commit_detach@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_detached_source source identity and domain fact before calling forge.mirror.detached.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_detached.schema.json# selects pm.event_payload.forge_mirror_detached.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, previous_topology_ref, transition_receipt_ref and no others. Each domain ref resolves the
  original mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1206; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.detached, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1206 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_detached_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control Mirror Health detach-history reader as consumer.forge.mirror.detached.history@1.0.0,
  fed by projector.forge.mirror.detached.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1206 owns forge_mirror_detached_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A permitted, disclosed detach completes
  and commits effective mode detached, preserving the preceding topology and the successful transition receipt.
  Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No
  test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1206
- SP-1206
unblocks: []
acceptance_criteria:
- forge.mirror.detached is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_detached.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_detached_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_detached.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.detached
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1207 - forge.mirror.status_changed prepared contract

```yaml
plan_unit_id: FGI-1207
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.status_changed@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.status_changed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A committed mirror status changes mode, lag state or health from a particular prior
  topology snapshot. Store both exact snapshots; unchanged polling is not a transition. This status fact remains
  distinct from a connect/detach operation receipt and from a particular sync operation outcome. Do not infer authority
  from direction, claim behind as current, or erase divergence. Any linked operation fact remains separately identified
  rather than reminted from this status. Before/after source snapshots are immutable owner records; event publication
  never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact original closed
  owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeMirrorCoordinator.commit_status@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_status_changed_source source identity and domain fact before calling forge.mirror.status_changed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_status_changed.schema.json# selects pm.event_payload.forge_mirror_status_changed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, previous_topology_ref, status_evidence_ref and no others. Each domain ref resolves the original
  mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1207; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.status_changed, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1207 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_status_changed_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control Mirror Health status reader as consumer.forge.mirror.status_changed.history@1.0.0,
  fed by projector.forge.mirror.status_changed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1207 owns forge_mirror_status_changed_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A committed mirror status changes
  mode, lag state or health from a particular prior topology snapshot. Oracle code, shared-number adoption and shared
  guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture
  also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete
  original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including its exact closed
  payload and original actor/account/time/causality fields), encoded by the existing owner physical codec. Before
  source_committed, verify that pack, its exact actual source-derived fields and recomputed owning producer_semantic_digest,
  and commit the source identity plus pack membership together. This is the restart input for the SAME publication,
  not a new accepted operation. A lost/damaged pending pack fences and requires coherent backup; current provider
  state cannot replace it. At history_committed CAS, resolve the original full-value first receipt, verify every
  intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction. Pending reference
  protection ends only on that real settlement; no hidden permanent body copy or new expiry policy is created. If
  a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1207
- SP-1207
unblocks: []
acceptance_criteria:
- forge.mirror.status_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_status_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_status_changed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_status_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.status_changed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1208 - forge.mirror.sync_completed prepared contract

```yaml
plan_unit_id: FGI-1208
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.sync_completed@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.sync_completed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact previously started sync operation settles with a truthful terminal result
  and source/destination revisions. Completion records the actual succeeded, failed or cancelled outcome; it never
  implies every sync succeeded. An effect-unknown result requires reconciliation and is not a completed fact. Join
  the original start, authoritative binding, dedupe identity and revision fence. An error result cannot carry a
  success indicator or successful exit status. Before/after source snapshots are immutable owner records; event
  publication never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact
  original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeMirrorCoordinator.commit_sync_result@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_sync_completed_source source identity and domain fact before calling forge.mirror.sync_completed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_sync_completed.schema.json# selects pm.event_payload.forge_mirror_sync_completed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, sync_started_fact_ref, sync_result_ref and no others. Each domain ref resolves the original
  mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1208; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.sync_completed, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1208 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_sync_completed_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control mirror sync-result reader as consumer.forge.mirror.sync_completed.history@1.0.0,
  fed by projector.forge.mirror.sync_completed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1208 owns forge_mirror_sync_completed_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact previously started sync
  operation settles with a truthful terminal result and source/destination revisions. Oracle code, shared-number
  adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is
  claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1208
- SP-1208
unblocks: []
acceptance_criteria:
- forge.mirror.sync_completed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_sync_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_sync_completed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_sync_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.sync_completed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1209 - forge.mirror.sync_started prepared contract

```yaml
plan_unit_id: FGI-1209
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.mirror.sync_started@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.mirror.sync_started,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/mirror_topology
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The mirror owner actually admits and starts the specific sync operation after current
  authority/revision/permission checks, preserving its accepted intent and ObservableWork. A button press, queued
  request or elapsed timer does not prove execution started. No secondary provider mutation without current authority.
  Subsequent recovery resolves this same start identity; retrying delivery of its history never repeats the sync.
  Before/after source snapshots are immutable owner records; event publication never selects a new behavior or resolves
  a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller assertion
  or a current display copy.


  Producer and order: ForgeMirrorCoordinator.commit_sync_start@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_mirror_sync_started_source source identity and domain fact before calling forge.mirror.sync_started.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_mirror_sync_started.schema.json# selects pm.event_payload.forge_mirror_sync_started.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  mirror_topology_ref, sync_intent_ref, observable_work_ref and no others. Each domain ref resolves the original
  mirror_topology or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1209; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.mirror.sync_started, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1209 policies without
  retaining linked content.


  Custody/redaction: forge_mirror_sync_started_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control mirror sync-progress history reader as consumer.forge.mirror.sync_started.history@1.0.0,
  fed by projector.forge.mirror.sync_started.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1209 owns forge_mirror_sync_started_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The mirror owner actually admits
  and starts the specific sync operation after current authority/revision/permission checks, preserving its accepted
  intent and ObservableWork. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native
  execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory
  SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic
  intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1209
- SP-1209
unblocks: []
acceptance_criteria:
- forge.mirror.sync_started is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_mirror_sync_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_mirror_sync_started_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_mirror_sync_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.mirror.sync_started
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1210 - forge.pipeline.cancelled prepared contract

```yaml
plan_unit_id: FGI-1210
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.pipeline.cancelled@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.pipeline.cancelled,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-005 and Plans/forge_integration_contracts.schema.json#/$defs/pipeline_projection
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact provider pipeline attempt is observed terminal cancelled. The terminal result
  joins its original start and independent AutomationBinding. Sending a cancel request, accepted cancellation work,
  timeout or a merely stale cancelled projection is not evidence of terminal cancellation. A provider run is not
  a Puppet Master run_id. Never manufacture a PM run or infer automation provider/account/generation from repository
  hosting. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgePipelineObserver.commit_cancelled@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_pipeline_cancelled_source source identity and domain fact before calling forge.pipeline.cancelled.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_pipeline_cancelled.schema.json# selects pm.event_payload.forge_pipeline_cancelled.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  automation_binding_ref, pipeline_snapshot_ref, start_fact_ref, provider_terminal_result_ref and no others. Each
  domain ref resolves the original pipeline_projection or the exact owner result/receipt described above under current
  access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field;
  a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review
  text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1210; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.pipeline.cancelled, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1210 policies without
  retaining linked content.


  Custody/redaction: forge_pipeline_cancelled_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Actions & Pipelines cancellation-history reader as consumer.forge.pipeline.cancelled.history@1.0.0,
  fed by projector.forge.pipeline.cancelled.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1210 owns forge_pipeline_cancelled_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact provider pipeline attempt
  is observed terminal cancelled. Oracle code, shared-number adoption and shared guard-isolation proof are phase
  2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-005
- CV-1210
- SP-1210
unblocks: []
acceptance_criteria:
- forge.pipeline.cancelled is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_cancelled.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_cancelled_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_pipeline_cancelled.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.cancelled
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1211 - forge.pipeline.completed prepared contract

```yaml
plan_unit_id: FGI-1211
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.pipeline.completed@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.pipeline.completed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-005 and Plans/forge_integration_contracts.schema.json#/$defs/pipeline_projection
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider supplies a terminal succeeded, failed or skipped outcome for the exact
  started attempt. Preserve its jobs/checks completeness and currentness. Cancelled has its own cancelled fact;
  queued, running, waiting, unknown and effect-unknown are not completed outcomes. The run state is not an individual
  gate status. Truncated checks retain their cursor and cannot certify the complete required-gate set. Before/after
  source snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgePipelineObserver.commit_completed@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_pipeline_completed_source source identity and domain fact before calling forge.pipeline.completed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_pipeline_completed.schema.json# selects pm.event_payload.forge_pipeline_completed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  automation_binding_ref, pipeline_snapshot_ref, start_fact_ref, provider_terminal_result_ref and no others. Each
  domain ref resolves the original pipeline_projection or the exact owner result/receipt described above under current
  access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field;
  a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review
  text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1211; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.pipeline.completed, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1211 policies without
  retaining linked content.


  Custody/redaction: forge_pipeline_completed_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Actions & Pipelines terminal-history reader as consumer.forge.pipeline.completed.history@1.0.0,
  fed by projector.forge.pipeline.completed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1211 owns forge_pipeline_completed_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider supplies a terminal
  succeeded, failed or skipped outcome for the exact started attempt. Oracle code, shared-number adoption and shared
  guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture
  also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete
  original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including its exact closed
  payload and original actor/account/time/causality fields), encoded by the existing owner physical codec. Before
  source_committed, verify that pack, its exact actual source-derived fields and recomputed owning producer_semantic_digest,
  and commit the source identity plus pack membership together. This is the restart input for the SAME publication,
  not a new accepted operation. A lost/damaged pending pack fences and requires coherent backup; current provider
  state cannot replace it. At history_committed CAS, resolve the original full-value first receipt, verify every
  intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction. Pending reference
  protection ends only on that real settlement; no hidden permanent body copy or new expiry policy is created. If
  a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-005
- CV-1211
- SP-1211
unblocks: []
acceptance_criteria:
- forge.pipeline.completed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_completed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_pipeline_completed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.completed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1212 - forge.pipeline.retried prepared contract

```yaml
plan_unit_id: FGI-1212
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.pipeline.retried@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.pipeline.retried,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-005 and Plans/forge_integration_contracts.schema.json#/$defs/pipeline_projection
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: An authorized retry has actually created or started the provider attempt identified
  in its retry result, linked to the exact earlier attempt. A retry request or uncertain result does not prove a
  new attempt. Same retry operation returns the original attempt and never triggers a second retry. Direct revalidation
  of the exact automation generation, provider capability, revision, permission and currentness precedes retry.
  A stale or partial projection alone cannot authorize it. Before/after source snapshots are immutable owner records;
  event publication never selects a new behavior or resolves a conflicting owner. Result refs must resolve their
  exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgePipelineObserver.commit_retry_started@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_pipeline_retried_source source identity and domain fact before calling forge.pipeline.retried.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_pipeline_retried.schema.json# selects pm.event_payload.forge_pipeline_retried.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  automation_binding_ref, previous_attempt_ref, pipeline_snapshot_ref, retry_result_ref, observable_work_ref and
  no others. Each domain ref resolves the original pipeline_projection or the exact owner result/receipt described
  above under current access. fact_ref, subject_ref, provider and every domain ref must match the actual captured
  source field by field; a valid hash or handle alone proves no native provenance. Retain only refs and bounded
  metadata, never review text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1212; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.pipeline.retried, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1212 policies without
  retaining linked content.


  Custody/redaction: forge_pipeline_retried_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Actions & Pipelines retry-history reader as consumer.forge.pipeline.retried.history@1.0.0,
  fed by projector.forge.pipeline.retried.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1212 owns forge_pipeline_retried_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including An authorized retry has actually
  created or started the provider attempt identified in its retry result, linked to the exact earlier attempt. Oracle
  code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS
  or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-005
- CV-1212
- SP-1212
unblocks: []
acceptance_criteria:
- forge.pipeline.retried is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_retried.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_retried_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_pipeline_retried.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.retried
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1213 - forge.pipeline.started prepared contract

```yaml
plan_unit_id: FGI-1213
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.pipeline.started@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.pipeline.started,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-005 and Plans/forge_integration_contracts.schema.json#/$defs/pipeline_projection
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider has actually started the exact automation attempt, as shown by its provider
  result/current projection; admission or queued ObservableWork alone does not prove a started run. Preserve the
  immutable attempt identity and selected revision, including an absent review relationship where genuine. Only
  the actual AutomationBinding selects service/provider/instance/account. Historical/external observations do not
  manufacture a PM command or ObservableWork. Before/after source snapshots are immutable owner records; event publication
  never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact original closed
  owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgePipelineObserver.commit_started@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_pipeline_started_source source identity and domain fact before calling forge.pipeline.started.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_pipeline_started.schema.json# selects pm.event_payload.forge_pipeline_started.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  automation_binding_ref, pipeline_snapshot_ref, provider_start_result_ref and no others. Each domain ref resolves
  the original pipeline_projection or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1213; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.pipeline.started, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1213 policies without
  retaining linked content.


  Custody/redaction: forge_pipeline_started_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Actions & Pipelines start-history reader as consumer.forge.pipeline.started.history@1.0.0,
  fed by projector.forge.pipeline.started.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1213 owns forge_pipeline_started_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider has actually started
  the exact automation attempt, as shown by its provider result/current projection; admission or queued ObservableWork
  alone does not prove a started run. Oracle code, shared-number adoption and shared guard-isolation proof are phase
  2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-005
- CV-1213
- SP-1213
unblocks: []
acceptance_criteria:
- forge.pipeline.started is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_pipeline_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_pipeline_started_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_pipeline_started.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-005
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.pipeline.started
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1214 - forge.repository.authority_changed prepared contract

```yaml
plan_unit_id: FGI-1214
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.repository.authority_changed@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.repository.authority_changed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-002 and Plans/forge_integration_contracts.schema.json#/$defs/repository_binding
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A disclosed authorized transfer commits the requested/effective repository-function
  authority change between the exact prior and next bindings. The transfer receipt and revision fences prove the
  same storage/review/checks/issues/transport/mirror role. Actor-permission or account changes are different facts.
  Legacy repository automation role is compatibility projection only; a transfer cannot select AutomationBinding,
  silently mutate a secondary, or infer a role from origin/upstream. Before/after source snapshots are immutable
  owner records; event publication never selects a new behavior or resolves a conflicting owner. Result refs must
  resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeAuthorityCoordinator.commit_transfer@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_repository_authority_changed_source source identity and domain fact before calling
  forge.repository.authority_changed.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody
  by name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified synced
  first receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect success
  is established only by its own original result. Crash or effect_unknown reconciles that result, never repeats
  the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_repository_authority_changed.schema.json# selects pm.event_payload.forge_repository_authority_changed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  previous_binding_ref, repository_binding_ref, transfer_receipt_ref and no others. Each domain ref resolves the
  original repository_binding or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1214; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.repository.authority_changed, is this
  separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or
  another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year
  is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1214 policies without retaining linked content.


  Custody/redaction: forge_repository_authority_changed_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control Source of Truth history reader as consumer.forge.repository.authority_changed.history@1.0.0,
  fed by projector.forge.repository.authority_changed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable
  read token explicitly; SP-1214 owns forge_repository_authority_changed_checkpoint, exact schema, key, complete
  global scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal
  fences. The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A disclosed authorized transfer
  commits the requested/effective repository-function authority change between the exact prior and next bindings.
  Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No
  test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-002
- CV-1214
- SP-1214
unblocks: []
acceptance_criteria:
- forge.repository.authority_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_authority_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_authority_changed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_repository_authority_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-002
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.authority_changed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1215 - forge.repository.created prepared contract

```yaml
plan_unit_id: FGI-1215
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.repository.created@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.repository.created,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-023 and Plans/forge_integration_contracts.schema.json#/$defs/repository_binding
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The create owner has verified the remote repository identity after a successful actual
  create for the exact reviewed provider/variant/instance/account/container/options. Accepted, effect-unknown, a
  reused existing repository or a URL without verified create proof does not mean created. PJCT-007/010 original
  result, idempotency and reconciliation remain authoritative. A history retry cannot create another repository
  or automatically delete one; no paid signup or site publication is implied. Before/after source snapshots are
  immutable owner records; event publication never selects a new behavior or resolves a conflicting owner. Result
  refs must resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeRepositoryCreate.commit_verified_result@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_repository_created_source source identity and domain fact before calling forge.repository.created.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_repository_created.schema.json# selects pm.event_payload.forge_repository_created.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  repository_binding_ref, verified_create_result_ref, create_receipt_ref and no others. Each domain ref resolves
  the original repository_binding or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1215; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.repository.created, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1215 policies without
  retaining linked content.


  Custody/redaction: forge_repository_created_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Project online-repository origin reader as consumer.forge.repository.created.history@1.0.0,
  fed by projector.forge.repository.created.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1215 owns forge_repository_created_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The create owner has verified the
  remote repository identity after a successful actual create for the exact reviewed provider/variant/instance/account/container/options.
  Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No
  test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-023
- CV-1215
- SP-1215
unblocks: []
acceptance_criteria:
- forge.repository.created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_created_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_repository_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-023
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.created
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1216 - forge.repository.discovered prepared contract

```yaml
plan_unit_id: FGI-1216
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.repository.discovered@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.repository.discovered,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-023 and Plans/forge_integration_contracts.schema.json#/$defs/repository_binding
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: Verified discovery resolves one stable repository identity in the exact admitted account/instance/owner
  discovery scope and result page. It records that observation, not a repository creation or Project binding. A
  pasted locator, inaccessible item or unverified URL cannot stand for discovery. The list may occur before a Project/repository
  binding exists. Preserve explicit scope and pagination/coverage; incomplete discovery cannot assert absence and
  no account/write authority follows. Before/after source snapshots are immutable owner records; event publication
  never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact original closed
  owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeRepositoryDiscovery.commit_verified_item@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_repository_discovered_source source identity and domain fact before calling forge.repository.discovered.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_repository_discovered.schema.json# selects pm.event_payload.forge_repository_discovered.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  discovery_scope_ref, repository_identity_ref, discovery_result_ref and no others. Each domain ref resolves the
  original repository_binding or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1216; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.repository.discovered, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1216 policies without
  retaining linked content.


  Custody/redaction: forge_repository_discovered_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services repository-discovery history reader as consumer.forge.repository.discovered.history@1.0.0,
  fed by projector.forge.repository.discovered.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1216 owns forge_repository_discovered_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including Verified discovery resolves one
  stable repository identity in the exact admitted account/instance/owner discovery scope and result page. Oracle
  code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS
  or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack
  pack of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-023
- CV-1216
- SP-1216
unblocks: []
acceptance_criteria:
- forge.repository.discovered is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_discovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_discovered_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_repository_discovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-023
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.discovered
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1217 - forge.repository.eligibility_changed prepared contract

```yaml
plan_unit_id: FGI-1217
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.repository.eligibility_changed@1.0.0 under deck-2 9.a A
  (DL-450), preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.repository.eligibility_changed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-003 and Plans/forge_integration_contracts.schema.json#/$defs/capability_envelope
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A settled repository eligibility assessment for one requested operation changes from
  its prior assessment under the actual provider admission, access, capability and currentness evidence. Repeated
  assessment with the same outcome is not a change. Eligibility is specific to an operation and current binding,
  not a global permission bit. Retired providers, transport-only routes and deferred restricted-token support remain
  refused. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgeRepositoryEligibility.commit_assessment@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_repository_eligibility_changed_source source identity and domain fact before calling
  forge.repository.eligibility_changed.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt
  custody by name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified
  synced first receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect
  success is established only by its own original result. Crash or effect_unknown reconciles that result, never
  repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_repository_eligibility_changed.schema.json# selects pm.event_payload.forge_repository_eligibility_changed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  repository_identity_ref, eligibility_snapshot_ref, previous_eligibility_snapshot_ref and no others. Each domain
  ref resolves the original capability_envelope or the exact owner result/receipt described above under current
  access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field;
  a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review
  text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1217; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.repository.eligibility_changed, is
  this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry,
  or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run
  year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1217 policies without retaining linked content.


  Custody/redaction: forge_repository_eligibility_changed_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control repository eligibility-history reader as consumer.forge.repository.eligibility_changed.history@1.0.0,
  fed by projector.forge.repository.eligibility_changed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable
  read token explicitly; SP-1217 owns forge_repository_eligibility_changed_checkpoint, exact schema, key, complete
  global scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal
  fences. The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A settled repository eligibility
  assessment for one requested operation changes from its prior assessment under the actual provider admission,
  access, capability and currentness evidence. Oracle code, shared-number adoption and shared guard-isolation proof
  are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-003
- CV-1217
- SP-1217
unblocks: []
acceptance_criteria:
- forge.repository.eligibility_changed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_repository_eligibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_repository_eligibility_changed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_repository_eligibility_changed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-003
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.repository.eligibility_changed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1218 - forge.review.approved prepared contract

```yaml
plan_unit_id: FGI-1218
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.approved@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.approved,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-020 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: One provider-native approval vote is saved for the exact reviewer and immutable review
  revision, using provider-asserted revision binding or the explicitly recorded Puppet Master observation binding.
  A missing binding cannot be shown as current approval. Preserve the required-reviewer fact and native vote identity.
  A vote recorded against an earlier revision stays historical after any base/head/merge-base change. It never becomes
  an Orchestrator approval.granted record or authorizes merge by itself. Before/after source snapshots are immutable
  owner records; event publication never selects a new behavior or resolves a conflicting owner. Result refs must
  resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewVoteObserver.commit_approval@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_approved_source source identity and domain fact before calling forge.review.approved.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_approved.schema.json# selects pm.event_payload.forge_review_approved.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, reviewer_ref, vote_record_ref and no others. Each domain ref resolves the original review_revision
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1218; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0. The current review approval is the exact
  Approval class in Storage Case L-3, read with FGI-004/020; this does not retain review bodies, grant merge authority
  or import G01/G05 by analogy. Source/ref and checkpoint policies are independently bound by SP-1218.


  Custody/redaction: forge_review_approved_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review-approval history reader as consumer.forge.review.approved.history@1.0.0,
  fed by projector.forge.review.approved.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1218 owns forge_review_approved_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including One provider-native approval vote
  is saved for the exact reviewer and immutable review revision, using provider-asserted revision binding or the
  explicitly recorded Puppet Master observation binding. Oracle code, shared-number adoption and shared guard-isolation
  proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture. Newly authored exact vote-source closure for this family: its canonical source
  row also stores the closed vote_evidence object in Plans/forge_event_storage_contracts.schema.json, with provider,
  reviewer_ref, review_revision_ref, native_vote_ref, vote_value=approved, required_reviewer (exact boolean), revision_binding_kind
  (provider-asserted or observed_by_puppet_master) and binding_evidence_ref. These original non-content decision
  scalars are the explicit exception to the source row refs/commitments-only description, not a review text/body
  copy. All vote and revision fields must join the authenticated original provider result; an observed binding resolves
  the actual original observation against the full review triple, and a provider-asserted binding resolves the provider-supplied
  revision. Required-reviewer status is the original source fact, not a present-day policy substitution. Same original
  native vote identity returns this same source row and never remints history. This is a new per-family source grammar
  within the approved missing technical definitions, not a claim that FGI-020 already had a materialized generic
  carrier or a new generic vote family. Source lineage retains these bounded decision facts under Case L-3; it grants
  no access to referenced content and chooses no separate event lifetime.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-020
- CV-1218
- SP-1218
unblocks: []
acceptance_criteria:
- forge.review.approved is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_approved.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_approved_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_approved.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-020
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.approved
- SP-286
- CV-339
- SP-278
- RP-AUTHORITY-INDEFINITE
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1219 - forge.review.changes_requested prepared contract

```yaml
plan_unit_id: FGI-1219
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.changes_requested@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.changes_requested,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-020 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: One provider-native changes-requested vote is saved with exact reviewer, immutable
  revision, required-reviewer fact and provider-asserted or observed revision binding. Requesting a review, posting
  an ordinary comment or an unbound vote is not this fact. Do not translate another provider vote value to changes_requested
  without its owner mapping. A later revision preserves this vote as historical and never silently carries its authority
  forward. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgeReviewVoteObserver.commit_changes_requested@1.0.0 accepts only the actual native owner
  result/observation, not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject
  and admitted provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability
  controls for new work. Commit forge_review_changes_requested_source source identity and domain fact before calling
  forge.review.changes_requested.publish@1.0.0. Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody
  by name, with SP-336/347 group commit/sync and actual fresh-operation/restore admission. Only a verified synced
  first receipt permits source_committed -> history_committed and terminal history disclosure. Domain effect success
  is established only by its own original result. Crash or effect_unknown reconciles that result, never repeats
  the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_changes_requested.schema.json# selects pm.event_payload.forge_review_changes_requested.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, reviewer_ref, vote_record_ref and no others. Each domain ref resolves the original review_revision
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1219; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.changes_requested, is this
  separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or
  another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year
  is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1219 policies without retaining linked content.


  Custody/redaction: forge_review_changes_requested_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review changes-requested history reader as consumer.forge.review.changes_requested.history@1.0.0,
  fed by projector.forge.review.changes_requested.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1219 owns forge_review_changes_requested_checkpoint, exact schema, key, complete global scan,
  inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The
  named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including One provider-native changes-requested
  vote is saved with exact reviewer, immutable revision, required-reviewer fact and provider-asserted or observed
  revision binding. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution
  NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337
  BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent
  (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture. Newly authored exact vote-source closure for this family: its canonical source
  row also stores the closed vote_evidence object in Plans/forge_event_storage_contracts.schema.json, with provider,
  reviewer_ref, review_revision_ref, native_vote_ref, vote_value=changes_requested, required_reviewer (exact boolean),
  revision_binding_kind (provider-asserted or observed_by_puppet_master) and binding_evidence_ref. These original
  non-content decision scalars are the explicit exception to the source row refs/commitments-only description, not
  a review text/body copy. All vote and revision fields must join the authenticated original provider result; an
  observed binding resolves the actual original observation against the full review triple, and a provider-asserted
  binding resolves the provider-supplied revision. Required-reviewer status is the original source fact, not a present-day
  policy substitution. Same original native vote identity returns this same source row and never remints history.
  This is a new per-family source grammar within the approved missing technical definitions, not a claim that FGI-020
  already had a materialized generic carrier or a new generic vote family. Source lineage retains these bounded
  decision facts under Case L-3; it grants no access to referenced content and chooses no separate event lifetime.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-020
- CV-1219
- SP-1219
unblocks: []
acceptance_criteria:
- forge.review.changes_requested is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_changes_requested.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_changes_requested_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_changes_requested.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-020
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.changes_requested
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1220 - forge.review.closed prepared contract

```yaml
plan_unit_id: FGI-1220
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.closed@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.closed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider review has actually changed from open to closed without merge, preserving
  its exact current immutable revision and successful close result/observation. A close request or merged review
  is not this close-without-merge fact. Failure or uncertainty leaves the truthful earlier state. Replaying history
  never sends close to the provider again or deletes review comments. Before/after source snapshots are immutable
  owner records; event publication never selects a new behavior or resolves a conflicting owner. Result refs must
  resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_closed@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_closed_source source identity and domain fact before calling forge.review.closed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_closed.schema.json# selects pm.event_payload.forge_review_closed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_review_snapshot_ref, review_snapshot_ref, close_result_ref and no others. Each domain
  ref resolves the original review_revision or the exact owner result/receipt described above under current access.
  fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field; a valid
  hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1220; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.closed, is this separate Forge
  history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact
  policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1220 policies without
  retaining linked content.


  Custody/redaction: forge_review_closed_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review closure-history reader as consumer.forge.review.closed.history@1.0.0,
  fed by projector.forge.review.closed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1220 owns forge_review_closed_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS, source/receipt
  joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the existing owner
  history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider review has actually
  changed from open to closed without merge, preserving its exact current immutable revision and successful close
  result/observation. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution
  NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337
  BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent
  (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1220
- SP-1220
unblocks: []
acceptance_criteria:
- forge.review.closed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_closed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_closed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_closed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.closed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1221 - forge.review.created prepared contract

```yaml
plan_unit_id: FGI-1221
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.created@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.created,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider confirms creation of the exact review, repository/head/base identities
  and first immutable revision. Preserve the actual Draft state and effective policy: agent creation defaults Draft
  unless that exact policy permits otherwise. A request, reused review or uncertain response is not creation. Cross-repository
  review explicitly joins fork/head and original/base under FGI-024; a single repo ID or remote name cannot replace
  that pair. No automatic Ready or merge follows. Before/after source snapshots are immutable owner records; event
  publication never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact
  original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_created@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_created_source source identity and domain fact before calling forge.review.created.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_created.schema.json# selects pm.event_payload.forge_review_created.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, review_snapshot_ref, create_result_ref and no others. Each domain ref resolves the original
  review_revision or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1221; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.created, is this separate Forge
  history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact
  policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1221 policies without
  retaining linked content.


  Custody/redaction: forge_review_created_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review origin-history reader as consumer.forge.review.created.history@1.0.0,
  fed by projector.forge.review.created.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1221 owns forge_review_created_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider confirms creation of
  the exact review, repository/head/base identities and first immutable revision. Oracle code, shared-number adoption
  and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed.
  Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack
  of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1221
- SP-1221
unblocks: []
acceptance_criteria:
- forge.review.created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_created_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.created
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1222 - forge.review.marked_ready prepared contract

```yaml
plan_unit_id: FGI-1222
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.marked_ready@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.marked_ready,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-022 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The separate authorized Mark Ready action has successfully changed this exact review
  from Draft to non-Draft. Its request carries draft=false and its current provider result confirms the change;
  a generic edit, draft=true, a request alone or already-Ready reobservation is insufficient. Preserve direct current
  revision, effective authority, permission and idempotency checks. Mark Ready does not approve or merge the review.
  Before/after source snapshots are immutable owner records; event publication never selects a new behavior or resolves
  a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller assertion
  or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_mark_ready@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_marked_ready_source source identity and domain fact before calling forge.review.marked_ready.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_marked_ready.schema.json# selects pm.event_payload.forge_review_marked_ready.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_review_snapshot_ref, review_snapshot_ref, mark_ready_receipt_ref and no others.
  Each domain ref resolves the original review_revision or the exact owner result/receipt described above under
  current access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field
  by field; a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never
  review text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1222; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.marked_ready, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1222 policies without
  retaining linked content.


  Custody/redaction: forge_review_marked_ready_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review readiness-history reader as consumer.forge.review.marked_ready.history@1.0.0,
  fed by projector.forge.review.marked_ready.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1222 owns forge_review_marked_ready_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The separate authorized Mark Ready
  action has successfully changed this exact review from Draft to non-Draft. Oracle code, shared-number adoption
  and shared guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed.
  Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack
  of the complete original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including
  its exact closed payload and original actor/account/time/causality fields), encoded by the existing owner physical
  codec. Before source_committed, verify that pack, its exact actual source-derived fields and recomputed owning
  producer_semantic_digest, and commit the source identity plus pack membership together. This is the restart input
  for the SAME publication, not a new accepted operation. A lost/damaged pending pack fences and requires coherent
  backup; current provider state cannot replace it. At history_committed CAS, resolve the original full-value first
  receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction.
  Pending reference protection ends only on that real settlement; no hidden permanent body copy or new expiry policy
  is created. If a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-022
- CV-1222
- SP-1222
unblocks: []
acceptance_criteria:
- forge.review.marked_ready is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_marked_ready.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_marked_ready_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_marked_ready.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-022
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.marked_ready
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1223 - forge.review.merged prepared contract

```yaml
plan_unit_id: FGI-1223
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.merged@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.merged,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-018 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider confirms that this exact immutable review revision was merged with the
  explicitly selected admitted merge strategy and required gate/permission evidence. A queued/accepted merge, effect-unknown,
  approval or synthetic local merge cannot claim a merged review. Keep provider-supported merge/strategy/currentness
  rules and cross-repository head/base joins. Replaying or retrying the history publication never merges again.
  Before/after source snapshots are immutable owner records; event publication never selects a new behavior or resolves
  a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller assertion
  or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_merged@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_merged_source source identity and domain fact before calling forge.review.merged.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_merged.schema.json# selects pm.event_payload.forge_review_merged.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, merge_receipt_ref, merge_result_ref and no others. Each domain ref resolves the original
  review_revision or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1223; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.merged, is this separate Forge
  history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact
  policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1223 policies without
  retaining linked content.


  Custody/redaction: forge_review_merged_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review merge-history reader as consumer.forge.review.merged.history@1.0.0,
  fed by projector.forge.review.merged.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1223 owns forge_review_merged_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS, source/receipt
  joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the existing owner
  history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider confirms that this
  exact immutable review revision was merged with the explicitly selected admitted merge strategy and required gate/permission
  evidence. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN.
  No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-018
- CV-1223
- SP-1223
unblocks: []
acceptance_criteria:
- forge.review.merged is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_merged.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_merged_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_merged.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-018
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.merged
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1224 - forge.review.reopened prepared contract

```yaml
plan_unit_id: FGI-1224
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.reopened@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.reopened,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider confirms the same closed, unmerged review has actually reopened. Preserve
  its prior closure and exact resulting immutable revision. A request or newly created different review is not a
  reopening, and no unsupported reopen of a merged review is invented. Prior votes, tests and captures stay bound
  to their original immutable revisions; reopening alone does not refresh them. Before/after source snapshots are
  immutable owner records; event publication never selects a new behavior or resolves a conflicting owner. Result
  refs must resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_reopened@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_reopened_source source identity and domain fact before calling forge.review.reopened.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_reopened.schema.json# selects pm.event_payload.forge_review_reopened.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_review_snapshot_ref, review_snapshot_ref, reopen_result_ref and no others. Each
  domain ref resolves the original review_revision or the exact owner result/receipt described above under current
  access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field;
  a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review
  text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1224; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.reopened, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1224 policies without
  retaining linked content.


  Custody/redaction: forge_review_reopened_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review reopening-history reader as consumer.forge.review.reopened.history@1.0.0,
  fed by projector.forge.review.reopened.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1224 owns forge_review_reopened_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider confirms the same closed,
  unmerged review has actually reopened. Oracle code, shared-number adoption and shared guard-isolation proof are
  phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1224
- SP-1224
unblocks: []
acceptance_criteria:
- forge.review.reopened is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_reopened_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.reopened
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1225 - forge.review.thread.reopened prepared contract

```yaml
plan_unit_id: FGI-1225
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.thread.reopened@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.thread.reopened,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_thread
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact resolved discussion actually becomes unresolved under its permitted thread
  action, retaining provider thread identity, actor, full immutable revision window and tracking state. A different
  discussion, comment addition or repeat read of unresolved state is not reopening. A thread anchor includes created-against,
  left and right revision refs plus tracking state/identity; partial or substituted windows cannot persist. Before/after
  source snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgeReviewThreadLifecycle.commit_reopened@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_thread_reopened_source source identity and domain fact before calling forge.review.thread.reopened.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_thread_reopened.schema.json# selects pm.event_payload.forge_review_thread_reopened.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_thread_ref, thread_snapshot_ref, reopen_result_ref and no others. Each domain ref
  resolves the original review_thread or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1225; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.thread.reopened, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1225 policies without
  retaining linked content.


  Custody/redaction: forge_review_thread_reopened_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review-thread reopening reader as consumer.forge.review.thread.reopened.history@1.0.0,
  fed by projector.forge.review.thread.reopened.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1225 owns forge_review_thread_reopened_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact resolved discussion actually
  becomes unresolved under its permitted thread action, retaining provider thread identity, actor, full immutable
  revision window and tracking state. Oracle code, shared-number adoption and shared guard-isolation proof are phase
  2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1225
- SP-1225
unblocks: []
acceptance_criteria:
- forge.review.thread.reopened is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_reopened_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_thread_reopened.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.reopened
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1226 - forge.review.thread.replied prepared contract

```yaml
plan_unit_id: FGI-1226
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.thread.replied@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.thread.replied,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_thread
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The provider confirms one new reply/comment identity in this exact discussion and immutable
  revision window. Retain comment and actor refs, not reply text. A submitted draft, another thread comment or replay
  of the same native reply does not create another reply fact. Comments, paths, ranges and participant detail remain
  behind their owner refs and read permissions; this event must not preserve deleted reply content. Before/after
  source snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgeReviewThreadLifecycle.commit_reply@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_thread_replied_source source identity and domain fact before calling forge.review.thread.replied.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_thread_replied.schema.json# selects pm.event_payload.forge_review_thread_replied.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, thread_snapshot_ref, comment_ref, reply_result_ref and no others. Each domain ref resolves
  the original review_thread or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1226; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.thread.replied, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1226 policies without
  retaining linked content.


  Custody/redaction: forge_review_thread_replied_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review-thread reply-history reader as consumer.forge.review.thread.replied.history@1.0.0,
  fed by projector.forge.review.thread.replied.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1226 owns forge_review_thread_replied_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The provider confirms one new reply/comment
  identity in this exact discussion and immutable revision window. Oracle code, shared-number adoption and shared
  guard-isolation proof are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture
  also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete
  original producer-owned EventRecord semantic intent (the EventRecord owner preimage, including its exact closed
  payload and original actor/account/time/causality fields), encoded by the existing owner physical codec. Before
  source_committed, verify that pack, its exact actual source-derived fields and recomputed owning producer_semantic_digest,
  and commit the source identity plus pack membership together. This is the restart input for the SAME publication,
  not a new accepted operation. A lost/damaged pending pack fences and requires coherent backup; current provider
  state cannot replace it. At history_committed CAS, resolve the original full-value first receipt, verify every
  intent-to-retained-event semantic join, and clear pending_intent_ref in that same transaction. Pending reference
  protection ends only on that real settlement; no hidden permanent body copy or new expiry policy is created. If
  a needed original domain proof is unavailable before capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1226
- SP-1226
unblocks: []
acceptance_criteria:
- forge.review.thread.replied is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_replied.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_replied_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_thread_replied.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.replied
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1227 - forge.review.thread.resolved prepared contract

```yaml
plan_unit_id: FGI-1227
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.thread.resolved@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.thread.resolved,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_thread
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact unresolved discussion actually becomes resolved with its authorized resolution
  actor, complete immutable revision window and successful result. A resolve request, comment alone or repeated
  resolved observation is not a new resolution. Resolution never proves the review approved or merged. It changes
  no blocking policy beyond the provider thread state already specified. Before/after source snapshots are immutable
  owner records; event publication never selects a new behavior or resolves a conflicting owner. Result refs must
  resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewThreadLifecycle.commit_resolved@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_thread_resolved_source source identity and domain fact before calling forge.review.thread.resolved.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_thread_resolved.schema.json# selects pm.event_payload.forge_review_thread_resolved.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_thread_ref, thread_snapshot_ref, resolve_result_ref and no others. Each domain ref
  resolves the original review_thread or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1227; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.thread.resolved, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1227 policies without
  retaining linked content.


  Custody/redaction: forge_review_thread_resolved_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review-thread resolution reader as consumer.forge.review.thread.resolved.history@1.0.0,
  fed by projector.forge.review.thread.resolved.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1227 owns forge_review_thread_resolved_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact unresolved discussion
  actually becomes resolved with its authorized resolution actor, complete immutable revision window and successful
  result. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN.
  No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1227
- SP-1227
unblocks: []
acceptance_criteria:
- forge.review.thread.resolved is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_thread_resolved.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_thread_resolved_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_thread_resolved.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.thread.resolved
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1228 - forge.review.updated prepared contract

```yaml
plan_unit_id: FGI-1228
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.updated@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.updated,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-022 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A successful authorized typed nonempty review patch changes this review metadata at
  the expected revision and returns the exact updated provider result. An empty/no-change patch, request acceptance
  or effect-unknown response is not a committed update. Preserve direct revalidation, authority, permission, confirmation
  and reconciliation. A change to any base/head/merge-base leg separately creates a new immutable version and stales
  or revalidates evidence; this update does not reuse old evidence as current. Before/after source snapshots are
  immutable owner records; event publication never selects a new behavior or resolves a conflicting owner. Result
  refs must resolve their exact original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeReviewLifecycle.commit_updated@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_updated_source source identity and domain fact before calling forge.review.updated.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_updated.schema.json# selects pm.event_payload.forge_review_updated.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  review_revision_ref, previous_review_snapshot_ref, review_snapshot_ref, update_receipt_ref and no others. Each
  domain ref resolves the original review_revision or the exact owner result/receipt described above under current
  access. fact_ref, subject_ref, provider and every domain ref must match the actual captured source field by field;
  a valid hash or handle alone proves no native provenance. Retain only refs and bounded metadata, never review
  text, diff/path bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1228; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.updated, is this separate Forge
  history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact
  policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1228 policies without
  retaining linked content.


  Custody/redaction: forge_review_updated_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control review edit-history reader as consumer.forge.review.updated.history@1.0.0,
  fed by projector.forge.review.updated.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1228 owns forge_review_updated_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A successful authorized typed nonempty
  review patch changes this review metadata at the expected revision and returns the exact updated provider result.
  Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No
  test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-022
- CV-1228
- SP-1228
unblocks: []
acceptance_criteria:
- forge.review.updated is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_updated.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_updated_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_updated.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-022
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.updated
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1229 - forge.review.version_created prepared contract

```yaml
plan_unit_id: FGI-1229
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.review.version_created@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.review.version_created,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-004 and Plans/forge_integration_contracts.schema.json#/$defs/review_revision
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: A new immutable revision is committed because at least one exact base/head/merge-base
  leg changed, preserving previous/new triples and actual evidence-state cause. Unchanged triples, newest-label
  inference or a partially anchored revision do not create a version. Completeness and evidence staleness are separate.
  A retarget or target-only move is not falsely called stale_head_changed, and old approvals/tests/captures remain
  bound to old triples. Before/after source snapshots are immutable owner records; event publication never selects
  a new behavior or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape,
  not a caller assertion or a current display copy.


  Producer and order: ForgeReviewRevisionStore.commit_new_version@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_review_version_created_source source identity and domain fact before calling forge.review.version_created.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_review_version_created.schema.json# selects pm.event_payload.forge_review_version_created.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  previous_review_revision_ref, review_revision_ref, revision_evidence_ref and no others. Each domain ref resolves
  the original review_revision or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1229; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.review.version_created, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1229 policies without
  retaining linked content.


  Custody/redaction: forge_review_version_created_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Source Control immutable review-version history reader as consumer.forge.review.version_created.history@1.0.0,
  fed by projector.forge.review.version_created.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token
  explicitly; SP-1229 owns forge_review_version_created_checkpoint, exact schema, key, complete global scan, inclusive
  cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader
  serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including A new immutable revision is committed
  because at least one exact base/head/merge-base leg changed, preserving previous/new triples and actual evidence-state
  cause. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN.
  No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-004
- CV-1229
- SP-1229
unblocks: []
acceptance_criteria:
- forge.review.version_created is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_review_version_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_review_version_created_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_review_version_created.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-004
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.review.version_created
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1230 - forge.webhook.delivery_failed prepared contract

```yaml
plan_unit_id: FGI-1230
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.webhook.delivery_failed@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.webhook.delivery_failed,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/signed_webhook_delivery
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: Processing the exact previously received verified delivery has failed with an actual
  failure result and truthful retry/inspection/terminal recovery state. Failure is not signature rejection, unverified
  parsing or a successful processing result. No success exit status can accompany failure. Original raw-body signature/time/context,
  replay and dedupe gates were satisfied before parsed effects. Re-observing the same failed processing attempt
  cannot repeat effects or remint a failure fact. Before/after source snapshots are immutable owner records; event
  publication never selects a new behavior or resolves a conflicting owner. Result refs must resolve their exact
  original closed owner shape, not a caller assertion or a current display copy.


  Producer and order: ForgeWebhookProcessor.commit_failed@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_webhook_delivery_failed_source source identity and domain fact before calling forge.webhook.delivery_failed.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_webhook_delivery_failed.schema.json# selects pm.event_payload.forge_webhook_delivery_failed.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  delivery_snapshot_ref, previous_delivery_snapshot_ref, processing_result_ref and no others. Each domain ref resolves
  the original signed_webhook_delivery or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1230; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.webhook.delivery_failed, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1230 policies without
  retaining linked content.


  Custody/redaction: forge_webhook_delivery_failed_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services webhook failure-history reader as consumer.forge.webhook.delivery_failed.history@1.0.0,
  fed by projector.forge.webhook.delivery_failed.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1230 owns forge_webhook_delivery_failed_checkpoint, exact schema, key, complete global scan,
  inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The
  named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including Processing the exact previously
  received verified delivery has failed with an actual failure result and truthful retry/inspection/terminal recovery
  state. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN.
  No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1230
- SP-1230
unblocks: []
acceptance_criteria:
- forge.webhook.delivery_failed is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_delivery_failed.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_delivery_failed_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_webhook_delivery_failed.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.delivery_failed
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1231 - forge.webhook.delivery_recovered prepared contract

```yaml
plan_unit_id: FGI-1231
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.webhook.delivery_recovered@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.webhook.delivery_recovered,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/signed_webhook_delivery
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: Recovery of this exact failed delivery processing attempt is verified and recovery_state
  becomes recovered, linked to its original failure and actual successful reconciliation/result. Queueing retry/redelivery
  or receiving an acknowledgement is not recovery. Resolve the original verified delivery and dedupe/effect ledger
  before recovery. Recovery cannot rerun a completed webhook effect or replace the original first receipt. Before/after
  source snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgeWebhookProcessor.commit_recovered@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_webhook_delivery_recovered_source source identity and domain fact before calling forge.webhook.delivery_recovered.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_webhook_delivery_recovered.schema.json# selects pm.event_payload.forge_webhook_delivery_recovered.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  delivery_snapshot_ref, failure_fact_ref, processing_result_ref and no others. Each domain ref resolves the original
  signed_webhook_delivery or the exact owner result/receipt described above under current access. fact_ref, subject_ref,
  provider and every domain ref must match the actual captured source field by field; a valid hash or handle alone
  proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks
  or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1231; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.webhook.delivery_recovered, is this
  separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or
  another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year
  is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1231 policies without retaining linked content.


  Custody/redaction: forge_webhook_delivery_recovered_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services webhook recovery-history reader as consumer.forge.webhook.delivery_recovered.history@1.0.0,
  fed by projector.forge.webhook.delivery_recovered.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1231 owns forge_webhook_delivery_recovered_checkpoint, exact schema, key, complete global
  scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences.
  The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including Recovery of this exact failed delivery
  processing attempt is verified and recovery_state becomes recovered, linked to its original failure and actual
  successful reconciliation/result. Oracle code, shared-number adoption and shared guard-isolation proof are phase
  2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1231
- SP-1231
unblocks: []
acceptance_criteria:
- forge.webhook.delivery_recovered is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_delivery_recovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_delivery_recovered_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_webhook_delivery_recovered.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.delivery_recovered
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1232 - forge.webhook.received prepared contract

```yaml
plan_unit_id: FGI-1232
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.webhook.received@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.webhook.received,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/signed_webhook_delivery
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The configured ingress has received this exact signed delivery and verified its raw-body
  signature before parsing, then time/context, fresh replay state and new dedupe state. This records verified receipt,
  not successful downstream processing. Invalid delivery belongs to rejected instead; duplicate delivery resolves
  its original fact. Fast provider transport acknowledgement is distinct from durable EventRecord first receipt
  and processing completion. No raw body, signature secret or credential bytes enter history. Before/after source
  snapshots are immutable owner records; event publication never selects a new behavior or resolves a conflicting
  owner. Result refs must resolve their exact original closed owner shape, not a caller assertion or a current display
  copy.


  Producer and order: ForgeWebhookIngress.commit_verified_received@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_webhook_received_source source identity and domain fact before calling forge.webhook.received.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_webhook_received.schema.json# selects pm.event_payload.forge_webhook_received.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  delivery_snapshot_ref, ingress_evidence_ref and no others. Each domain ref resolves the original signed_webhook_delivery
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1232; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.webhook.received, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1232 policies without
  retaining linked content.


  Custody/redaction: forge_webhook_received_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services webhook receipt-history reader as consumer.forge.webhook.received.history@1.0.0,
  fed by projector.forge.webhook.received.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1232 owns forge_webhook_received_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The configured ingress has received
  this exact signed delivery and verified its raw-body signature before parsing, then time/context, fresh replay
  state and new dedupe state. Oracle code, shared-number adoption and shared guard-isolation proof are phase 2;
  native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1232
- SP-1232
unblocks: []
acceptance_criteria:
- forge.webhook.received is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_received.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_received_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_webhook_received.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.received
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1233 - forge.webhook.redelivery_queued prepared contract

```yaml
plan_unit_id: FGI-1233
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.webhook.redelivery_queued@1.0.0 under deck-2 9.a A (DL-450),
  preserving DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration,
  runtime_enabled=false. This contract neither changes expected_event_types=[] on existing event-silent commands
  nor enables any handler. A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.webhook.redelivery_queued,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/signed_webhook_delivery
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The exact authorized redelivery has been durably queued by the webhook recovery owner
  after current signature, time/context, replay, dedupe, delivery identity and redelivery-idempotency checks. A
  GUI click, unsupported operation or uncertain queue result is not queued. Redelivery is linked to the original
  delivery and actual request identity; it does not reset the original occurrence, expiry clock or existing processing-effect
  identity. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgeWebhookRecovery.commit_redelivery_queued@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_webhook_redelivery_queued_source source identity and domain fact before calling forge.webhook.redelivery_queued.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_webhook_redelivery_queued.schema.json# selects pm.event_payload.forge_webhook_redelivery_queued.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  delivery_snapshot_ref, redelivery_request_ref, redelivery_receipt_ref and no others. Each domain ref resolves
  the original signed_webhook_delivery or the exact owner result/receipt described above under current access. fact_ref,
  subject_ref, provider and every domain ref must match the actual captured source field by field; a valid hash
  or handle alone proves no native provenance. Retain only refs and bounded metadata, never review text, diff/path
  bodies, raw webhooks or credential content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1233; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.webhook.redelivery_queued, is this
  separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or
  another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year
  is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
  WAVE3 permits this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains
  materially_incomplete under Case L-3. G01/G05/G26 were checked against the actual answered populations and do
  not name this Forge family. Source identity/receipt refs and derived checkpoints keep the independently justified
  SP-1233 policies without retaining linked content.


  Custody/redaction: forge_webhook_redelivery_queued_source is canonical non-rebuildable identity/source-lineage,
  coherently backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained
  event/payload-pack membership under one Storage restore boundary. It contains no body copy; referenced content
  retains its own policy. The native source owner holds original provider evidence; only that owner can attest the
  fact. Storage holds first receipt and full-value commitment. Reads recheck current actor/account permissions,
  deletion/tombstones, holds and reference availability. Deleted or expired detail becomes unavailable and is never
  reconstructed from history; no new user-visible history surface is authorized. Missing canonical custody fences
  and discloses recovery_required; never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services webhook redelivery-history reader as consumer.forge.webhook.redelivery_queued.history@1.0.0,
  fed by projector.forge.webhook.redelivery_queued.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read
  token explicitly; SP-1233 owns forge_webhook_redelivery_queued_checkpoint, exact schema, key, complete global
  scan, inclusive cursor, CAS, source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences.
  The named reader serves the existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The exact authorized redelivery
  has been durably queued by the webhook recovery owner after current signature, time/context, replay, dedupe, delivery
  identity and redelivery-idempotency checks. Oracle code, shared-number adoption and shared guard-isolation proof
  are phase 2; native execution NOT_RUN. No test PASS or readiness is claimed. Pending capture also owns pending_intent_ref:
  a mandatory SP-337 BLAKE3-addressed application/vnd.msgpack pack of the complete original producer-owned EventRecord
  semantic intent (the EventRecord owner preimage, including its exact closed payload and original actor/account/time/causality
  fields), encoded by the existing owner physical codec. Before source_committed, verify that pack, its exact actual
  source-derived fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack
  membership together. This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged
  pending pack fences and requires coherent backup; current provider state cannot replace it. At history_committed
  CAS, resolve the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear
  pending_intent_ref in that same transaction. Pending reference protection ends only on that real settlement; no
  hidden permanent body copy or new expiry policy is created. If a needed original domain proof is unavailable before
  capture, do not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1233
- SP-1233
unblocks: []
acceptance_criteria:
- forge.webhook.redelivery_queued is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_redelivery_queued.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_redelivery_queued_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_webhook_redelivery_queued.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.redelivery_queued
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### FGI-1234 - forge.webhook.rejected prepared contract

```yaml
plan_unit_id: FGI-1234
unit_type: interface_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Newly authored owner contract for forge.webhook.rejected@1.0.0 under deck-2 9.a A (DL-450), preserving
  DL-045 limits. Prepared without admission: membership ABSENT, current append missing_event_registration, runtime_enabled=false.
  This contract neither changes expected_event_types=[] on existing event-silent commands nor enables any handler.
  A later reviewed family and command-specific adoption is required.


  Search/reuse: on base f9c5de6561dff0a53a48e530f2a5c6804a7e941d, independent exact-name search across current non-pipeline
  Plans, schemas, registries, fixtures, scripts and tests finds only the §3.2 candidate line for forge.webhook.rejected,
  no registered row, payload, publisher, consumer or checkpoint. Reuse FGI-006 and Plans/forge_integration_contracts.schema.json#/$defs/signed_webhook_delivery
  for the original domain facts; retain FGI-001/011/015 provider admission and FGI-023/024 target rules. Search
  evidence and negative findings are pinned in reports/event-authority-20261105/W3A.md. All bindings named below
  are new, not rediscovered definitions.


  Semantics and transitions: The configured ingress rejects an incoming delivery for signature, timestamp, context,
  unknown key, replay-window or conflicting-duplicate failure. Capture the trusted local ingress observation/decision
  identity and reason without parsing rejected raw input or trusting a supplied delivery identity. An ordinary already-accepted
  duplicate is a dedupe result, not a second rejection. No effect dispatch or downstream body parse precedes verification.
  Rejection evidence is a bounded non-secret owner result; invalid bytes and protected material never become history
  content. Before/after source snapshots are immutable owner records; event publication never selects a new behavior
  or resolves a conflicting owner. Result refs must resolve their exact original closed owner shape, not a caller
  assertion or a current display copy.


  Producer and order: ForgeWebhookIngress.commit_rejection@1.0.0 accepts only the actual native owner result/observation,
  not arbitrary supplied JSON. Resolve the original exact native operation, fact revision, subject and admitted
  provider/variant/instance/account/binding generation; revalidate current permission/Stop/lease/capability controls
  for new work. Commit forge_webhook_rejected_source source identity and domain fact before calling forge.webhook.rejected.publish@1.0.0.
  Adopt SP-286 and CV-339 full-value v2 first-AppendReceipt custody by name, with SP-336/347 group commit/sync and
  actual fresh-operation/restore admission. Only a verified synced first receipt permits source_committed -> history_committed
  and terminal history disclosure. Domain effect success is established only by its own original result. Crash or
  effect_unknown reconciles that result, never repeats the remote operation to recover history.


  Closed payload: Plans/event_payloads/forge/forge_webhook_rejected.schema.json# selects pm.event_payload.forge_webhook_rejected.v1@1.0.0;
  required fields are schema_id, schema_version, event_type, fact_ref, provider, subject_ref, source_record_ref,
  ingress_evidence_ref, rejection_result_ref and no others. Each domain ref resolves the original signed_webhook_delivery
  or the exact owner result/receipt described above under current access. fact_ref, subject_ref, provider and every
  domain ref must match the actual captured source field by field; a valid hash or handle alone proves no native
  provenance. Retain only refs and bounded metadata, never review text, diff/path bodies, raw webhooks or credential
  content.


  Scope/identity: adopt Contracts_V0.md#EventRecord, CV-317 and CV-366. Scope policy application_or_project means
  only the actual original owner WorkflowScopeV2, without adding application support to any source that lacks it.
  All envelope joins equal that source; unused thread/run/node/attempt joins remain present null, and a provider
  pipeline ID never fills run_id. Project partitions use Storage project~base64url; application uses app with project_id=null
  and actual server_id. Unknown source scope refuses. Exact identity recipes are CV-1234; no focus/default Project
  or timestamp reminting.


  Replay/idempotency: replay_policy=dedupe_by_idempotency_key for future current writes; projector_replay_only is
  reader-only and normal append refuses it as replay_only_not_appendable. Adopt the owning producer_semantic_digest
  preimage and RFC8785 recipe, excluding Storage sequence/observed/persisted metadata; use the shared number/date-time
  owner rule when integrated, never a lane codec or blanket 2^53 cap. Same scoped identity and digest returns the
  original SP-286 receipt and result; different digest is idempotency_conflict. Missing authoritative global/scoped
  dedupe is dedupe_unavailable before append. Consumer replay performs no command, network, notification, provider
  mutation, usage charge, canonical source write or other event append.


  Retention: event retention_policy_ref=PENDING_RETENTION_DECISION. For forge.webhook.rejected, is this separate
  Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another
  exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected,
  which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)? WAVE3 permits
  this one incomplete cell. Until answered, no event admission or destructive policy; unknown remains materially_incomplete
  under Case L-3. G01/G05/G26 were checked against the actual answered populations and do not name this Forge family.
  Source identity/receipt refs and derived checkpoints keep the independently justified SP-1234 policies without
  retaining linked content.


  Custody/redaction: forge_webhook_rejected_source is canonical non-rebuildable identity/source-lineage, coherently
  backed up with the actual owner result, pending history identity, SP-286 v2 receipt/dedupe and retained event/payload-pack
  membership under one Storage restore boundary. It contains no body copy; referenced content retains its own policy.
  The native source owner holds original provider evidence; only that owner can attest the fact. Storage holds first
  receipt and full-value commitment. Reads recheck current actor/account permissions, deletion/tombstones, holds
  and reference availability. Deleted or expired detail becomes unavailable and is never reconstructed from history;
  no new user-visible history surface is authorized. Missing canonical custody fences and discloses recovery_required;
  never repair it from a projection.


  Consumer/checkpoint: newly bind Hosting Services webhook rejection-history reader as consumer.forge.webhook.rejected.history@1.0.0,
  fed by projector.forge.webhook.rejected.history@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token explicitly;
  SP-1234 owns forge_webhook_rejected_checkpoint, exact schema, key, complete global scan, inclusive cursor, CAS,
  source/receipt joins, derived quarantine/rebuild and compaction/withdrawal fences. The named reader serves the
  existing owner history/health projection only, not action authority.


  Compatibility/withdrawal: this new payload has no silently admitted older edition. Registry-selected retained
  EventRecord 1.0.0/2.0.0 and replay-only originals are read under the authenticated recipe/schema in force at original
  issuance, even after live provider capability, grant or state changes. A caller cannot select a weaker recipe;
  invalid/withdrawn/foreign records fail read. Unknown future versions stop before publication with unavailable,
  never skip into a claimed current checkpoint. At a reviewed withdrawal cutoff fence new writer admission before
  dedupe, durably mark this consumer withdrawn and invalidate its whole token; no hidden backfill/re-emission. A
  separately adopted successor rebuilds from lawful retained source under SP-278, with no in-place old-byte rewrite
  or command effect.


  Oracle obligation (criterion 12 PARTIAL): ATS-1200 and reports/event-authority-20261105/W3A-oracle-plan.json carry
  this family''s positives and single-defect negatives per predicate, including The configured ingress rejects an
  incoming delivery for signature, timestamp, context, unknown key, replay-window or conflicting-duplicate failure.
  Oracle code, shared-number adoption and shared guard-isolation proof are phase 2; native execution NOT_RUN. No
  test PASS or readiness is claimed. Pending capture also owns pending_intent_ref: a mandatory SP-337 BLAKE3-addressed
  application/vnd.msgpack pack of the complete original producer-owned EventRecord semantic intent (the EventRecord
  owner preimage, including its exact closed payload and original actor/account/time/causality fields), encoded
  by the existing owner physical codec. Before source_committed, verify that pack, its exact actual source-derived
  fields and recomputed owning producer_semantic_digest, and commit the source identity plus pack membership together.
  This is the restart input for the SAME publication, not a new accepted operation. A lost/damaged pending pack
  fences and requires coherent backup; current provider state cannot replace it. At history_committed CAS, resolve
  the original full-value first receipt, verify every intent-to-retained-event semantic join, and clear pending_intent_ref
  in that same transaction. Pending reference protection ends only on that real settlement; no hidden permanent
  body copy or new expiry policy is created. If a needed original domain proof is unavailable before capture, do
  not accept capture.'
gui_related: true
gui_classification_reason: Defines internal saved-history contracts; existing visible projections remain with their
  GUI owners.
depends_on:
- FGI-006
- CV-1234
- SP-1234
unblocks: []
acceptance_criteria:
- forge.webhook.rejected is separately typed, source-bound, replay-safe and non-emitting before admission.
- Exact owner source, custody and full-token joins are required; criterion 12 remains PARTIAL until phase 2.
validation_surfaces:
- Plans/event_payloads/forge/forge_webhook_rejected.schema.json
- Plans/forge_event_storage_contracts.schema.json
- reports/event-authority-20261105/W3A-oracle-plan.json
risk_class: forge_event_source_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: forge_webhook_rejected_phase1
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/event_payloads/forge/forge_webhook_rejected.schema.json
- Plans/forge_event_storage_contracts.schema.json
node_compile_hint:
  mode: prepared_event_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- deck-2 9.a A, DL-450; ANSWERS_E-CARDS-2_20261105.md
- Plans/Forge_Integrations.md#FGI-006
- W3A current per-family search at f9c5de6561dff0a53a48e530f2a5c6804a7e941d
preserved_exact_tokens:
- forge.webhook.rejected
- SP-286
- CV-339
- SP-278
- projector_replay_only
- PENDING_RETENTION_DECISION
negative_constraints:
- Do not admit an event or enable existing event-silent commands.
- Do not choose pending event retention or infer authority from another family.
- Do not execute domain effects from history replay.
```

### 3.3 Typed command admission and result boundary

The primary command enum is exactly the 53 IDs in §3.1. Two (`cmd.forge.review.create` and `cmd.forge.review.merge`) retain their provider-owner routes, `cmd.forge.repository.create` retains the separate common route bound by FGI-009, and the remaining 50 use the common central Forge route set: the 43 bound by FGI-010 (the prior 34 plus nine 2026-09-01 admissions), the six 2026-09-26 admissions bound by FGI-021, and review edit bound by FGI-022. The nine 2026-09-01 commands, the six 2026-09-26 commands, and review edit start `handler_unavailable`, require `expected_event_types=[]`, and do not gain runtime credit from schema, fixture, catalog, handler-name, or static wiring presence. One provider-neutral request object carries exact provider and variant, normalized host, stable account, PM and provider repository binding, expected binding generation, optional independent automation binding and expected automation-binding generation where required, requested/effective authority, requested capability, catalog/API currentness, non-secret credential/grant ref, permission snapshot, target-bound preflight, optional confirmation, target identity, availability, FileSafe decision for local writes, and `ObservableWork` when admitted asynchronous work requires it.

Family-level conditionals select repository, mirror, review, immutable review thread/version, pipeline/job, pipeline artifact, hosted secret/variable, webhook delivery, or connection targets without provider-specific peer request types. Mutations require current binding/catalog/API evidence, `mutation_safety=verified`, direct execution-time revalidation, effective authority, permission, and idempotency. Authority is target-bound and mode-aware under PS-146/147/148. Regular publication asks where required; requested YOLO create/push/publish and explicitly listed build-grant actions proceed without a duplicate human yes. Destructive actions retain confirmation unless an exact approved grant covers demonstrably grant-created resources; protected auth, secrets, trust and durable Always remain separate. Review/thread/version commands require immutable revision identities. Pipeline run/retry/cancel require current direct validation and `ObservableWork`; stale or partial projections cannot validate as dispatch-admitted mutations. Mirror mutation requires verified authority. Webhook redelivery requires signature-before-parse, fresh replay state, dedupe state, exact delivery identity, and redelivery idempotency. Repository delete additionally requires verified-create result/receipt refs and fresh human confirmation, and is never automatic cleanup. Pipeline artifact download requires exact run/artifact identity, expected digest, FileSafe destination or artifact-import handoff, and explicit download/import disposition; it never auto-executes. Secret set carries a one-use protected human-broker ref and never inline secret bytes; secret/variable mutations never return secret values. `cmd.forge.pipeline.open_in_browser` carries an exact official destination kind distinguishing the automation-run artifacts page, the hosted service settings page, and the automation service overview page.

Results distinguish `accepted`, `succeeded`, `blocked`, `degraded`, `failed`, `cancelled`, `recovery_required`, and `effect_unknown`. Acceptance requires `ObservableWork`; success requires a separate terminal provider result and receipt; `effect_unknown` requires a typed error and reconciliation-only retry. Availability and error codes are closed owner vocabularies. No request may infer provider/repository identity from remote text. No schema defines a native/provider handler, provider-specific peer common command namespace, persisted event binding, central registration, or runtime proof.

## 4. Integration Surfaces

### 4.1 Source Control

Review action labels in wiring rows render from the selected repository adapter's review noun through the wiring vocabulary reference, as the automation shell takes its noun from the selected automation binding adapter.

Reviews, optional Versions/Threads, Source of Truth, and Mirror Health are conditional Source Control sections driven by the current capability envelope. Hosted automation renders in the one provider-neutral `repository_automation` / **Actions & Pipelines** shell through the selected `AutomationBinding`. GitHub keeps GitHub Actions nouns, Current Branch, Workflows, Settings, pins, rerun, and log recovery; GitLab keeps Pipeline/Stages/Jobs/Trace; Forgejo/Gitea use their actual Actions capability; Bitbucket Data Center without configured CI says **Connect automation service**. Generic shell ownership never erases provider-specific semantics.

### 4.2 Settings and setup

Forge setup appears under **Source Control -> Hosting Services**. Generic actions are **Connect**, **Reauthorize**, connection test, Details, and provider-aware open-in-browser routes. The exact setup flow preserves cached/current state, exact host/account/container/repository, capability probe, and binding generation. Installation and authentication are separate from repository readiness.

### 4.3 Official pages and external tools

Official page navigation uses an allowlisted dispatcher owned outside this doc. Each `open_in_browser` request is GUI/human initiated and carries an `allowlisted_official_page` handoff with exact origin, route, and foreground confirmation; ordinary official-page navigation is not automatically a protected authentication session. `cmd.forge.pipeline.open_in_browser` additionally carries an exact `official_destination_kind` with three values preserving three selected concept controls: `automation_run_artifacts` binds the exact automation run behind the selected concept's `Open artifacts in service` action, `hosted_service_settings` binds the exact automation service settings scope behind `Open service settings` and carries no run identity, and `automation_service_overview` binds the selected automation service overview behind the first-card `Open in <provider>` action and carries neither run nor setting-scope identity. The three selected controls keep their labels and route through the one command with distinct destinations; no destination fabricates a run, a setting scope, or a provider origin. The handoff's allowed origin and route must equal the provider-profile-approved official UI destination for the selected instance/tenant and the request's target route: the official browser UI origin is resolved from the profile allowlist for that instance/tenant and may differ from the normalized API/transport host, because web and API domains are approved independently, so the UI origin is never equated with the normalized host. Cross-instance, cross-tenant, or cross-route substitution is rejected; approved distinct web/API domains for the same instance/tenant are not substitution. The generic `Connect automation` control names no configured service and dispatches no pipeline request: it opens the existing Settings → Source Control → Hosting Services setup through ui.settings.route.open, carries no destination kind and no binding refs, and never invokes ui.repository_automation.binding.select (which selects among existing authorized bindings), and preview-disabled no-service controls showing `automation_service_not_configured` are not valid requests. Where native artifact download or hosted secret/variable mutation is capability-unsupported, the GUI offers the corresponding official-service destination under FGI-015; that fallback is decided, not a new native-versus-external product choice. Reauthorization may select a `protected_auth_browser` handoff when the shared auth owner requires it. That protected variant fixes actor class to `human` and agent/tool/automation access, capture, and persistence to false, and it is unavailable to Assistant Chat, Orchestrator, automation, headless API, screenshots, DOM, console, network capture, recording, or artifact extraction. Structured CLI fallback is admitted only when the provider profile, exact Host/Environment installation, adapter version, capability and output schema are current. CLI stdout/stderr is diagnostic and cannot become a repository, review, pipeline, webhook, artifact, or receipt identity.

### 4.4 Plugin boundary

Forge apps and adapters may be delivered by an installed plugin/component, but this owner does not decide package type or manifest filename. The portable `plugin.json` versus PM-native `pm-plugin.json` distinction and all package security/conformance remain solely in `Plans/Plugins_System.md`. Forge records contain only validated component/adapter refs and cannot widen plugin permissions.

## 5. Validation And Acceptance

Acceptance covers every provider and supported variant with repository binding, host/account/container identity, authority split, capability requested/effective matrix, missing scope, tier/license, server version, stale catalog, offline, managed policy, rate limit, mirror lag/divergence, detach/reconnect, immutable review revisions, stale evidence, threads, Draft/Ready, pipelines/checks/jobs, app/grant/token lease, webhook signature/replay/dedupe/redelivery, API hash/currentness, fallback ladder, idempotency, cancellation/effect unknown, secret scans, official-page allowlist, migration, GUI vocabulary, disabled reasons, accessibility, and production wiring.

Schema validation is structural evidence only. Fresh provider sandboxes or controlled test doubles, raw receipts, and negative security evidence are required for runtime claims. Provider failures remain failures; a degraded read cannot certify mutation.

## 6. Plan-To-Node Readiness

The common static command contract is now structurally specified for all 52 canonical IDs. The nine 2026-09-01 additions and the six 2026-09-26 additions have explicit no-event dispositions and unavailable future handler targets, but the domain remains node-blocked until cross-owner central registration/wiring/touch closure, storage, provider-owner mappings, current signed catalogs, native adapters and handlers, credential broker, secure webhook ingress, an allowlisted official-page dispatcher plus protected-browser routing when auth requires it, `ObservableWork`, migration, security tests, GUI fixtures, and fresh provider runtime evidence exist. This Plan creates no WorkNode, event admission, native handler, connection, webhook, app, token, browser execution, runtime proof, or readiness certification.

## 7. Deferred, Retired, Compatibility, And Non-Goals

- `cmd.origin.*`, `cmd.gitlab.*`, `cmd.azure_devops.*`, generic `cmd.bitbucket.*`, and provider-specific peer common shapes are forbidden for new primary behavior.
- Existing GitHub command aliases are retained only under their GitHub owner until central command adjudication; this doc does not silently rename them.
- `github_actions` is retained only as a migration-read and route/bookmark/deep-link alias to `repository_automation`; it is never a second canonical panel occupant.
- Provider-native service headings come only from admitted AutomationBinding evidence; a Git remote name or check observation never creates a hosted automation service (DL-273, Jared 2026-11-01).
- Packet retry counts, dedupe window sizes, API versions, support floors, tiers, and license rules are signed catalog inputs, not timeless constants.
- Terminal prose scraping, raw token persistence, authority inference from mirror direction, newest-review inference, and partial-as-complete presentation are forbidden.
- Automatic repository cleanup is forbidden: delete never runs as rollback, as part of setup resume, speculatively while the remote effect is unknown, or on provider-scope reuse.
- Secret bytes in command requests, results, receipts, agent payloads, logs, or fixtures are forbidden; secret set carries a one-use protected human-broker ref only, and secret/variable reads never return values.
- Packet candidate spellings for review listing, pipeline definition/artifact enumeration, provider-neutral definition pinning, bare capability refresh, and publication preview are deliberately non-admitted and are not resurrected as aliases; their function is covered by SCS-016 projections, existing commands, GUI-owner pinning, shared connection test, and Source Control preview respectively.
- The common forge owner does not define local source-control mutation, provider secret custody, plugin manifests, GUI geometry, settings persistence, command/event registries, or storage engines.

### 7.1 Migration

Legacy GitHub-specific hosted records remain GitHub-owner data but may project into the common binding only after stable GitHub host/account/repository identity is proven. Other providers require their native container identities. Remote URLs or display labels alone produce `needs_binding`, not an inferred provider. Review evidence migrates only to an exact immutable revision; otherwise it remains historical and stale.

## 8. Source Lineage And Governance

This owner compiles accepted register rows `SCM-05`, `ORI-01..04`, `UI-01`, `UI-03`, `CT-01..02`, and `TS-04`, plus the read-only SCM/Origin audit and the 2026-09-01 Forgejo/Gitea reconciliation evidence. Provider docs own native behavior; common shapes stay here. Cross-owner follow-up must propagate the nine admitted commands, the six 2026-09-26 admitted commands, independent automation binding, and generic shell identity through central catalogs, Source Control/GitHub/GUI/settings/onboarding/storage/wiring/touch/index owners. Generated shards/evidence/Spec Lock remain untouched in this lane.

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
| `cmd.forge.pipeline.cancel` | `handlers::forge::pipeline_cancel` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.list` | `handlers::forge::pipeline_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_in_browser` | `handlers::forge::pipeline_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_job` | `handlers::forge::pipeline_open_job` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.open_logs` | `handlers::forge::pipeline_open_logs` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.refresh` | `handlers::forge::pipeline_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.retry` | `handlers::forge::pipeline_retry` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.run` | `handlers::forge::pipeline_run` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.list` | `handlers::forge::repository_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.open_in_browser` | `handlers::forge::repository_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.repository.refresh` | `handlers::forge::repository_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.approve` | `handlers::forge::review_approve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.checkout` | `handlers::forge::review_checkout` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.close` | `handlers::forge::review_close` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.comment` | `handlers::forge::review_comment` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.edit` | `handlers::forge::review_edit` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.mark_ready` | `handlers::forge::review_mark_ready` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.open` | `handlers::forge::review_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.open_in_browser` | `handlers::forge::review_open_in_browser` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.refresh` | `handlers::forge::review_refresh` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.reopen` | `handlers::forge::review_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.request_changes` | `handlers::forge::review_request_changes` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.list` | `handlers::forge::review_thread_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.reopen` | `handlers::forge::review_thread_reopen` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.reply` | `handlers::forge::review_thread_reply` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.thread.resolve` | `handlers::forge::review_thread_resolve` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.version.compare` | `handlers::forge::review_version_compare` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.review.version.open` | `handlers::forge::review_version_open` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.webhook.delivery.list` | `handlers::forge::webhook_delivery_list` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.webhook.redeliver` | `handlers::forge::webhook_redeliver` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact prior 43-command common central set (FGI-022 adds review edit): `cmd.forge.connection.reauthorize`, `cmd.forge.mirror.connect`, `cmd.forge.mirror.detach`, `cmd.forge.mirror.inspect`, `cmd.forge.mirror.sync`, `cmd.forge.pipeline.approve`, `cmd.forge.pipeline.cancel`, `cmd.forge.pipeline.list`, `cmd.forge.pipeline.open_in_browser`, `cmd.forge.pipeline.open_job`, `cmd.forge.pipeline.open_logs`, `cmd.forge.pipeline.refresh`, `cmd.forge.pipeline.retry`, `cmd.forge.pipeline.run`, `cmd.forge.release.asset.download`, `cmd.forge.release.list`, `cmd.forge.repository.fork`, `cmd.forge.repository.list`, `cmd.forge.repository.open_in_browser`, `cmd.forge.repository.policy.apply`, `cmd.forge.repository.policy.preview`, `cmd.forge.repository.refresh`, `cmd.forge.review.approve`, `cmd.forge.review.checkout`, `cmd.forge.review.checks`, `cmd.forge.review.close`, `cmd.forge.review.comment`, `cmd.forge.review.mark_ready`, `cmd.forge.review.open`, `cmd.forge.review.open_in_browser`, `cmd.forge.review.refresh`, `cmd.forge.review.reopen`, `cmd.forge.review.request_changes`, `cmd.forge.review.thread.list`, `cmd.forge.review.thread.reopen`, `cmd.forge.review.thread.reply`, `cmd.forge.review.thread.resolve`, `cmd.forge.review.version.compare`, `cmd.forge.review.version.open`, `cmd.forge.runner.registration.apply`, `cmd.forge.runner.remove`, `cmd.forge.webhook.delivery.list`, `cmd.forge.webhook.redeliver`.

Exact prior 43-handler future set (FGI-022 adds handlers::forge::review_edit): `handlers::forge::connection_reauthorize`, `handlers::forge::mirror_connect`, `handlers::forge::mirror_detach`, `handlers::forge::mirror_inspect`, `handlers::forge::mirror_sync`, `handlers::forge::pipeline_approve`, `handlers::forge::pipeline_cancel`, `handlers::forge::pipeline_list`, `handlers::forge::pipeline_open_in_browser`, `handlers::forge::pipeline_open_job`, `handlers::forge::pipeline_open_logs`, `handlers::forge::pipeline_refresh`, `handlers::forge::pipeline_retry`, `handlers::forge::pipeline_run`, `handlers::forge::release_asset_download`, `handlers::forge::release_list`, `handlers::forge::repository_fork`, `handlers::forge::repository_list`, `handlers::forge::repository_open_in_browser`, `handlers::forge::repository_policy_apply`, `handlers::forge::repository_policy_preview`, `handlers::forge::repository_refresh`, `handlers::forge::review_approve`, `handlers::forge::review_checkout`, `handlers::forge::review_checks`, `handlers::forge::review_close`, `handlers::forge::review_comment`, `handlers::forge::review_mark_ready`, `handlers::forge::review_open`, `handlers::forge::review_open_in_browser`, `handlers::forge::review_refresh`, `handlers::forge::review_reopen`, `handlers::forge::review_request_changes`, `handlers::forge::review_thread_list`, `handlers::forge::review_thread_reopen`, `handlers::forge::review_thread_reply`, `handlers::forge::review_thread_resolve`, `handlers::forge::review_version_compare`, `handlers::forge::review_version_open`, `handlers::forge::runner_registration_apply`, `handlers::forge::runner_remove`, `handlers::forge::webhook_delivery_list`, `handlers::forge::webhook_redeliver`.

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
- Every exact command ID in this 43-command set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
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
source_lineage:
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

### FGI-011 - Verified account and repository binding requirements by forge

```yaml
plan_unit_id: FGI-011
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'An onboarding online copy is an optional hosted Git destination independent from local Git or Jujutsu.
  It becomes ready only through an explicit current account verification and an explicit repository binding; selecting
  its uncreated draft requires neither a phantom account nor a phantom repository. Provider-specific host, owner/container,
  repository, visibility, eligibility, and capability requirements remain visible and typed. Reusing an existing connection
  selects and verifies the exact account and repository rather than skipping setup. Protected sign-in and explicit external
  account creation are distinct owner-controlled handoffs. PWIZ-021''s precommit exception permits only current owner-authorized
  read-only checks/listing and necessary selected-source authentication. MACS-005 owns first-time sign-in. The existing
  cmd.forge.repository.list command has a closed repository_list_scope account-container variant with a verified real
  account, no Project/repository binding, zero repository generation, and no mutation. Its request/result/error/availability/receipt
  all preserve that scope; it creates neither a new command nor a standalone storage/event family. Repository creation/binding
  and content movement remain inside the exact reviewed Project owner''s commit chain. DL-259, Jared 2026-10-31: D1 A:
  the online-service step creates or selects a code repository; onboarding does not publish a website, GitHub Pages,
  GitLab Pages or another site. Local-only Project choices remain valid. Audit FF-01..12: Review binds the exact provider/instance/account
  and repository or creation target. GitHub Internal requires an eligible enterprise organization capability; personal
  repositories cannot be Internal. GitLab uses the exact personal/group/subgroup namespace and instance visibility policy.
  Bitbucket Cloud binds an authorized workspace and explicit chosen/default Project with visibility compatibility; Data
  Center resolves an actual project key, including a supported personal Project. Azure Services binds organization and
  team Project; Server binds collection URI and team Project; selecting an existing repository carries its owner-resolved
  Project identity. Forgejo/Gitea use Public/Private repository privacy, not a fabricated Internal value; Forgejo and
  Gitea are self-managed only (DL-273). Each requires a real instance profile (DL-273). Provider/owner changes invalidate
  incompatible visibility/container/auth choices; current provider-specific naming and Git ref validation precede availability.
  The selected actual auth method and least-privilege scopes must match the saved instance profile. Review shows privacy,
  target/instance, branch and material creation consequences, with expandable exact details and owner-routed Edit links.


  DL-272 RV-14, 2026-11-01: Private under an organization, group, workspace or team means its members permitted to see
  private Projects plus people explicitly added, not every member and not Only you. Only you applies only to a personal
  owner; Data Center copy follows its Project permissions.


  DL-272 P73-BITBUCKET-REF, 2026-11-01: A Bitbucket Cloud repository address and reference use workspace/repository.
  Its grouping Project remains selected metadata and is not inserted into that path.


  DL-272 M7-AZURE-KIND, 2026-11-01: An Azure team Project shows Uses Git as the human-readable type. Its actual GUID
  remains owner identity but is not substituted for that type label.


  DL-273, Jared 2026-11-01: hosted Forgejo is not offered. Forgejo exposes only forgejo_self_managed and requires the
  person’s actual server address; Gitea also exposes only its self-managed variant (DL-273). A retired hosted variant
  value is not a valid current instance, adapter or setup-plan profile and grants no account, repository or connection
  authority. Returning to a self-managed choice still requires its explicit address and current owner verification. Jared
  left repository-restricted Forgejo tokens for now; existing account-based identification, authentication and repository
  selection remain unchanged, with no new restricted-token support admitted.


  DL-273, Jared 2026-11-01: Puppet Master’s Projects are AI-written. A hosting provider whose terms forbid AI- generated
  Projects is ineligible; the Forgejo option is only a server the person runs.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.
  FGI-023 closes the per-service create-options contract and extends repository.list with explicit owner discovery. Project setup/New Project use the same provider-native fields and exact current service admission, most-private available visibility, current names/ref checks, Review invalidation and precommit read/auth limits. Initial intake remains null-Project; only PJCT-010 reviewed commit performs create, bind or content movement.'
gui_related: true
gui_classification_reason: Defines provider cards, required fields, visibility choices, account/repository verification,
  and exact disabled reasons in Product Onboarding.
depends_on:
- FGI-001
- FGI-003
- FGI-006
- FGI-008
- SCS-011
unblocks:
- PWIZ-024
acceptance_criteria:
- A hosted-copy draft records the selected provider/variant/host, source/container intent and desired visibility. Only
  actual verified identities populate account/repository refs; absent or uncreated targets remain explicitly absent.
  Once bound, the Forge owner supplies stable account/container/repository/PM repo identity, binding generation, capability
  currentness and non-secret grant refs. Selection, listing and account verification alone never claim repository readiness.
- Account authentication and repository selection/creation are separate required results; `already_connected` must select
  and verify a current account and then select the exact repository, and cannot succeed as an empty action.
- Existing accounts use one owner-controlled protected sign-in when needed. An allowlisted official provider page is
  offered only for explicit account creation or provider-required external administration, not as a redundant second
  sign-in path.
- GitHub requires github.com or a normalized GitHub Enterprise host, a verified stable account, personal or organization
  owner, and repository; Private/Public are ordinary hosted choices and Internal is shown only when the exact enterprise
  capability permits it.
- GitLab requires GitLab.com or a normalized self-managed HTTPS instance, a verified account, namespace/group, and project
  repository; GitLab.com onboarding exposes Private/Public, while Internal on self-managed GitLab is capability-probed
  rather than assumed.
- Azure DevOps requires cloud or self-managed variant, normalized organization/server host, verified account, Azure organization
  or collection, Azure project, and repository; repository visibility inherits the Azure project policy and is not represented
  by a fabricated repository-level selector.
- Bitbucket Cloud requires a verified account, workspace, optional project locator when used, and repository, with Private/Public
  subject to current capability; Bitbucket Data Center requires normalized HTTPS instance, verified account, project
  key, repository slug, and licensed/versioned capability, without being collapsed into Cloud.
- Forgejo requires its own normalized HTTPS instance, stable instance/account/organization/repository identity, typed
  API root/base path and SSH host/port, scoped CA and known-host proof refs, detected Forgejo product/version/API schema,
  and independently probed API/Git/Actions state; PAT is the default and OAuth PKCE appears only for a registered instance
  flow.
- Gitea requires the same typed self-host fields through a distinct Gitea adapter and product identity; shared primitives
  never imply permanent Forgejo API equivalence, and API-disabled does not disable proven Git transport.
- Local-only Safe History stays valid with `forge_provider=none`; no forge account or repository is required until the
  user explicitly chooses an online copy or `Bring one from online`.
- Before commit, explicit source access may consume owner-authorized read-only preflight/current eligibility and account-scoped
  repository listing or necessary selected-source sign-in. Admission consumes PWIZ-021's exact current draft/source/permission/capability/consent/hash/expiry
  join and MACS-005 when no account exists. It never admits repository creation/binding, clone, fetch, publish, filesystem
  writes, Project creation, or broad provider setup.
- The account-list variant of cmd.forge.repository.list uses repository_list_scope in the existing command_request/result/error/availability/receipt
  definitions; only this variant permits null repo_id/repository_binding_ref with zero repository generation. It binds
  actual account verification/generation/container, provider, selected source, draft, Client/Host and return context;
  requests are human GUI/read-only/current, and responses do not emit EventRecords or complete Project setup. Ordinary
  repository-bound requests remain unchanged, and another command cannot reuse the variant.
- This PlanUnit reuses common `cmd.forge.*`, shared authentication/integration lifecycle, provider-owner adapters, and
  Source Control transport commands; it creates no provider-specific command namespace, account store, secret custody,
  or native/runtime evidence.
- 'DL-259, Jared 2026-10-31: D1 A: the online-service step creates or selects a code repository; onboarding does not
  publish a website, GitHub Pages, GitLab Pages or another site. Local-only Project choices remain valid. Audit FF-01..12:
  Review binds the exact provider/instance/account and repository or creation target. GitHub Internal requires an eligible
  enterprise organization capability; personal repositories cannot be Internal. GitLab uses the exact personal/group/subgroup
  namespace and instance visibility policy. Bitbucket Cloud binds an authorized workspace and explicit chosen/default
  Project with visibility compatibility; Data Center resolves an actual project key, including a supported personal Project.
  Azure Services binds organization and team Project; Server binds collection URI and team Project; selecting an existing
  repository carries its owner-resolved Project identity. Forgejo/Gitea use Public/Private repository privacy, not a
  fabricated Internal value; Forgejo and Gitea are self-managed only (DL-273). Each requires a real instance profile
  (DL-273). Provider/owner changes invalidate incompatible visibility/container/auth choices; current provider-specific
  naming and Git ref validation precede availability. The selected actual auth method and least-privilege scopes must
  match the saved instance profile. Review shows privacy, target/instance, branch and material creation consequences,
  with expandable exact details and owner-routed Edit links.'
- 'DL-272 RV-14, 2026-11-01: Private under an organization, group, workspace or team means its members permitted to see
  private Projects plus people explicitly added, not every member and not Only you. Only you applies only to a personal
  owner; Data Center copy follows its Project permissions.'
- 'DL-272 P73-BITBUCKET-REF, 2026-11-01: A Bitbucket Cloud repository address and reference use workspace/repository.
  Its grouping Project remains selected metadata and is not inserted into that path.'
- 'DL-272 M7-AZURE-KIND, 2026-11-01: An Azure team Project shows Uses Git as the human-readable type. Its actual GUID
  remains owner identity but is not substituted for that type label.'
- 'DL-273, Jared 2026-11-01: hosted Forgejo is not offered. Forgejo exposes only forgejo_self_managed and requires the
  person’s actual server address; Gitea also exposes only its self-managed variant (DL-273). A retired hosted variant
  value is not a valid current instance, adapter or setup-plan profile and grants no account, repository or connection
  authority. Returning to a self-managed choice still requires its explicit address and current owner verification. Jared
  left repository-restricted Forgejo tokens for now; existing account-based identification, authentication and repository
  selection remain unchanged, with no new restricted-token support admitted.'
- 'DL-273, Jared 2026-11-01: Puppet Master’s Projects are AI-written. A hosting provider whose terms forbid AI-generated
  Projects is ineligible; the Forgejo option is only a server the person runs.'
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- provider-specific positive/negative fixtures
- future protected-auth and repository-binding owner-return fixtures
risk_class: onboarding_forge_account_repository_or_provider_requirement_drift
reasoning_tier: high
context_scope: onboarding_forge_provider_binding
implementation_surfaces:
- Plans/Forge_Integrations.md
- future forge facade
- future Product Onboarding owner adapter
node_compile_hint:
  mode: forge_onboarding_binding_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- user-correction:2026-09-01-forge-onboarding-requirements
- Plans/product_onboarding_contracts.schema.json
- Concepts/pm7-tools/onboarding_cinematic_source.py
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- 'Jared 2026-11-01 via PM7 lead: hosted Forgejo is not offered; Forgejo repository-restricted tokens — we can leave
  it for now. Fields8762cda61a658081878344ddff95f9916c1aa0f0 is source lineage only.'
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- github
- gitlab
- azure_devops
- bitbucket_cloud
- bitbucket_data_center
- forgejo
- gitea
- Private
- Internal
- already_connected
negative_constraints:
- Do not treat a selected provider or verified account as a repository binding.
- Do not convert a retired provider or hosted variant into a local-only or public-by-default fallback.
- Do not offer duplicate built-in and official-page sign-in choices.
- Do not collapse GitLab hosted/self-managed, Azure cloud/self-managed, or Bitbucket Cloud/Data Center requirements.
- Do not collapse Forgejo and Gitea into one product, adapter, API schema, capability result, or account identity.
- Do not infer provider, account, repository, owner, visibility, eligibility, or readiness from display text or remote
  URL alone.
- Do not broaden precommit read-only listing/selected-source authentication into repository, filesystem, Project or unrelated-provider
  mutation; do not fabricate IDs to satisfy a repository-bound request.
```
## Forgejo/Gitea, Automation Binding, And Generic Shell Reconciliation - 2026-09-01

### FGI-012 - Distinct Self-Hosted Providers And Independent Automation Authority

```yaml
plan_unit_id: FGI-012
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'Forgejo and Gitea are distinct closed-enum provider identities with distinct adapters and version/API-schema
  capability profiles. RepositoryForgeBinding remains repository-hosting authority. AutomationBinding separately identifies
  automation service/provider/instance/account, optional repository-binding relationship, capability, catalog, permission,
  currentness and binding generation; it may differ from the Git host. Exactly one canonical repository_automation panel
  occupant labeled Actions & Pipelines renders provider-native content and accepts github_actions only as migration-read/route/bookmark/deep-link
  input.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
gui_related: true
gui_classification_reason: Defines the canonical Actions & Pipelines route, visible provider headings, binding selector,
  unsupported states, and one-occupant migration.
depends_on:
- FGI-001
- FGI-003
- FGI-005
- FGI-008
unblocks: []
acceptance_criteria:
- The provider enum includes separate forgejo and gitea tokens; a combined forgejo_or_gitea identity is invalid.
- Typed instance profiles carry custom HTTPS/API roots, API base path, SSH host/port, scoped private-CA ref, known-host
  proof, account/organization, detected product/version/API schema, independent API/Git/Actions state, auth method, permission/currentness
  refs, and no secret bytes.
- PAT is the default self-host route; OAuth PKCE is admitted only with an explicitly registered instance flow.
- API-disabled does not disable proven Git fetch/publish; Actions disabled, no runner, no workflow, insufficient permission,
  unsupported and unknown remain distinct.
- Credentials and authorization headers are stripped on redirect-origin change; local/metadata targets remain denied
  unless an existing explicit policy approves them; CA trust is instance-scoped.
- AutomationBinding never silently inherits provider/account/authority from RepositoryForgeBinding and every automation/runner
  request carries its exact binding generation.
- repository_automation is the only canonical occupant; binding selection is shown only when multiple bindings exist,
  provider headings come from the selected adapter, and no remote name creates a hosted automation service.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- provider/version/trust/API-Git-Actions fixtures
- shell migration and one-occupant fixtures
risk_class: self_host_identity_automation_authority_or_shell_conflation
reasoning_tier: high
context_scope: forgejo_gitea_automation_binding_and_shell
implementation_surfaces:
- Plans/Forge_Integrations.md
- future Forgejo adapter
- future Gitea adapter
- future repository_automation Slint shell
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
- packet_corrected_slice:machine__provider_profiles.json__part-003__lines-000401-000620.txt
- packet_corrected_slice:machine__domain_contracts.schema.json__part-002__lines-000201-000420.txt
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
preserved_exact_tokens:
- forgejo
- gitea
- RepositoryForgeBinding
- AutomationBinding
- repository_automation
- Actions & Pipelines
- github_actions
- Connect automation service
negative_constraints:
- Do not infer automation authority from the repository host, remote name, or ForgeBinding.
- Do not persist certificate bytes, credentials, authorization headers, OAuth codes, tokens, runner tokens, secrets,
  or variables in these records.
- Do not forward authorization across redirect origins or widen localhost/metadata access.
- Do not claim native adapters, runtime handlers, panel implementation, or verified provider support from Plans, schemas,
  fixtures, or concept evidence.
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
  FGI-024 admits contribution fork semantics only for GitHub and GHES subject to current host policy and capability. Other services return typed unsupported for that guided fork path while retaining the explicit team-project branch workflow. review.create binds exact head_repository and base_repository identities when different, with each account/instance/revision independently validated; single-repository historical requests remain exact.
gui_related: true
gui_classification_reason: The admitted commands back visible Source Control, Actions & Pipelines, Settings, palette, runner administration, release and download actions with exact disabled reasons.
depends_on: [FGI-005, FGI-008, FGI-010, FGI-012]
unblocks: []
acceptance_criteria:
  - The primary Forge command census was exactly 46 and the common central future-route census exactly 43 at this batch; FGI-021 supersedes both counts for the current census.
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
source_lineage:
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
- packet_corrected_slice:machine__command_census.json__part-019__lines-003601-003820.txt
- packet_corrected_slice:machine__command_census.json__part-021__lines-004001-004220.txt
- packet_corrected_slice:machine__command_census.json__part-022__lines-004201-004420.txt
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [handler_unavailable, "expected_event_types=[]", ObservableWork, FileSafe, ReadProjectionReceipt, ExternalOperationReceipt, DestructiveOperationReceipt, MutationReceipt]
negative_constraints:
  - Do not admit packet-proposed forge.* event names or treat an operation receipt as an EventRecord.
  - Do not allow reject through cmd.forge.pipeline.approve.
  - Do not synthesize a runner-registration preview inside apply.
  - Do not expose credentials, authorization, runner tokens, secret values, absolute local paths, or unredacted provider errors in requests, receipts, logs, or fixtures.
compile_disposition: extend_existing_owner
```

## Provider Operation And Capability-Matrix Depth Repair - 2026-09-02

### FGI-014 - Admitted Provider Operation Profiles

```yaml
plan_unit_id: FGI-014
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'DL-273 retires the former source-control service operation profiles. Shared exact-target, revision,
  permission, publication-preview and no-duplicate-mirror safeguards remain for admitted providers. Forgejo and Gitea
  Actions separately probe feature enablement, versioned API operations, runner availability, definitions, runs, logs,
  artifacts, dispatch/cancel/rerun, permissions, secrets/variables, and runner labels; no GitHub endpoint rewrite is
  assumed. GitHub retains direct API behavior with no hidden gh requirement. GitLab retains Merge requests, Pipelines,
  approval/mergeability, native stages/jobs/traces/artifacts/manual actions/child pipelines. Azure Services and Server
  separate Repos, Pipelines, organization/project/account, auth/version, branch policies, deployment approvals, and Git
  from unsupported TFVC; Services uses Entra rather than new legacy Azure DevOps OAuth. Bitbucket Cloud and Data Center
  retain separate identity, auth, URL, version, review, restriction, and CI profiles; Data Center never inherits Cloud
  Pipelines. Generic Git remains transport-only, local/non-Git Projects receive no fake review/CI, Jujutsu is never a
  cloud account, and saved hosting/automation bindings rather than a remote named origin choose among fork/upstream/multi-forge
  routes.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.
  New Project multi-remote setup lists fetch and push targets and fan-out effects explicitly per target, never makes every remote a push destination, and receives separate receipts. Contribution sync uses the exact FGI-024 original/fork bindings and SCM choreography rather than remote-name inference. Ordinary publication and build-grant admission come solely from Permissions.'
gui_related: true
gui_classification_reason: Provider-native labels, capability reasons, setup alternatives, review/checks, CI hierarchy,
  and external-only fallbacks are visible in Source Control and Actions & Pipelines.
depends_on:
- FGI-001
- FGI-002
- FGI-003
- FGI-004
- FGI-005
- FGI-006
- FGI-012
unblocks:
- SCS-016
- FGI-015
- F3-529
acceptance_criteria:
- Forgejo/Gitea can read runs while dispatch is unavailable and distinguish no runner, no workflow, no permission, unsupported,
  external-only, and unknown.
- GitHub regression inventory remains complete; GitLab, Azure, and Bitbucket fixtures retain provider vocabulary, identity,
  auth, hierarchy, and feature gaps without guessed parity.
- No-remote, generic SSH Git, JJ plus an admitted forge, and GitHub-fork/GitLab-upstream fixtures never fabricate a forge,
  change default remote, or cross-publish.
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- provider version
- auth
- capability
- and multi-forge routing fixtures
risk_class: provider_parity_fabrication_mirror_duplicate_effect_or_platform_overclaim
reasoning_tier: high
context_scope: admitted_provider_specific_operation_profiles
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- future provider adapters
node_compile_hint:
  mode: static_provider_contract_only
  create_worknodes: false
  create_nodeseeds: false
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
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- Pull request
- Merge request
- GitHub Actions
- GitLab Pipelines
- Azure Pipelines
- Bitbucket Pipelines
- Forgejo Actions
- Gitea Actions
- TFVC
- WSL
- external_only
negative_constraints:
- Do not install or enable WSL implicitly or treat WSL documentation as native Windows support proof.
- Do not rewrite GitHub endpoints for Forgejo/Gitea, guess GitLab/Azure/Bitbucket equivalents, or inherit Cloud features
  into self-hosted variants.
- Do not force local-only or generic Git Projects into forge setup, and do not offer Jujutsu as hosting.
- Do not claim implemented adapters, current vendor support, runtime effects, or platform certification from this static
  contract.
- Do not infer one provider authority from Cursor AI authentication or a Git remote name, or duplicate an admitted mirror
  write.
```
### FGI-015 - Exact Provider Capability, Authentication, Trust, And Administration Matrix

```yaml
plan_unit_id: FGI-015
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: 'The required provider-profile set is exactly github_cloud, github_enterprise, gitlab_saas, gitlab_self_managed,
  azure_devops_services, azure_devops_server, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, and generic_git.
  The independent local-VCS set is git, jj_git_colocated, jj_git_noncolocated, and none. Each profile reports explicit
  status, evidence/probe, reason, and freshness for Git transport, repository discovery/create, review read/write/approve/merge,
  checks, definitions, run/log/artifact read, dispatch/cancel/rerun, webhook/poll, branch policy, secrets/variables,
  runner management, release assets, and external URL fallback; no GitHub-compatible boolean grants parity. Instance
  trust validates normalized host, tenant/account, API base path, scoped private CA, redirects/pagination, SSH host key,
  and explicit localhost/metadata policy before credentials, without global TLS disable or cross-origin Authorization.
  Authentication is provider- and instance-scoped, and what a provider profile itself carries is the closed field set
  of its own schema: the setup methods it admits, in `provider_adapter_profile.auth_methods`, together with its capability
  and reason vocabulary, its version or tier gate and its catalog reference. The other six facts are each recorded by
  a named existing surface rather than by the profile record: the issuer by `Plans/GitHub_API_Auth_and_Flows.md` and
  by `provider_instance_profile.oauth_registration_ref` for a registered instance flow; the allowed host by `provider_instance_profile.normalized_host`
  and `api_base_path` under `restricted_network_target_policy`; the non-secret token owner by `provider_instance_profile.credential_ref`,
  `token_lease.credential_ref` and `app_installation.credential_key_ref`; the requested scopes by `api_compatibility.scopes`
  and `token_lease.scope_grant_refs`; refresh and revoke by `token_lease.state`, `expires_at_utc` and `ttl_seconds` with
  `app_installation.state`; and the separate Git-versus-API roles by `provider_instance_profile.git_transport_state`,
  `api_state`, `transport_api_independent` and `credential_access`. The provider list is: GitHub direct OAuth/App/token
  plus separate Git helper; GitLab registered OAuth/PKCE or scoped PAT; Azure Services Entra and Server supported on-prem
  auth; Bitbucket Cloud OAuth/current scoped API token and Data Center supported instance token; Microsoft Entra is the
  Azure Services issuer rather than a new legacy Azure DevOps OAuth registration; Forgejo/Gitea guided scoped PAT by
  default or registered OAuth/PKCE. Account passwords and silent ordinary admin scope grants are forbidden. Hosted administration
  enumerates read and write independently for repository/branch policy, CI environments/deployment approvals, secrets/variables,
  runner list/register/remove, and release assets using versioned adapter field schemas. Unsupported operations route
  to a labeled official external surface, secret values enter through the human-only broker and are never read back from
  metadata, and runner registration requires an exact Execution Host and consent rather than following from CI enablement.
  DL-259, Jared 2026-10-31: Audit FF-01..12: Review binds the exact provider/instance/account and repository or creation
  target. GitHub Internal requires an eligible enterprise organization capability; personal repositories cannot be Internal.
  GitLab uses the exact personal/group/subgroup namespace and instance visibility policy. Bitbucket Cloud binds an authorized
  workspace and explicit chosen/default Project with visibility compatibility; Data Center resolves an actual project
  key, including a supported personal Project. Azure Services binds organization and team Project; Server binds collection
  URI and team Project; selecting an existing repository carries its owner-resolved Project identity. Forgejo/Gitea use
  Public/Private repository privacy, not a fabricated Internal value; Forgejo and Gitea are self-managed only (DL-273).
  Each requires a real instance profile (DL-273). Provider/owner changes invalidate incompatible visibility/container/auth
  choices; current provider-specific naming and Git ref validation precede availability. The selected actual auth method
  and least-privilege scopes must match the saved instance profile. Review shows privacy, target/instance, branch and
  material creation consequences, with expandable exact details and owner-routed Edit links.


  DL-272 RV-16, 2026-11-01: Self-managed source-control addresses use the shared endpoint validator. An empty address
  is missing; a bare valid host is normalized with https:// for use; a rejected address gives its actual reason by the
  field and Continue. No example or typed address proves identity or authentication.


  DL-272 RV-20, 2026-11-01: Source-control sign-in explains the actual reach of that auth method before a token is entered.
  Puppet Master acts on the selected Project, but the grant may reach more repositories; copy must not promise that every
  token is repository-restricted. Provider and instance least-privilege checks remain.


  DL-272 P74-GITHUB-TOKEN, 2026-11-01: The guided GitHub token route leads with fine-grained tokens and discloses its
  actual repository reach for create versus selected-existing use. A supported classic-token alternative retains its
  broader disclosed grant; no sample credential is canon.


  DL-272 M6-SIGNUP-NOTE, 2026-11-01: A self-managed service’s sign-up-disabled information is neutral guidance, not an
  authentication failure or a Pip fault. Account authorization still requires the normal owner result.


  DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.
  P1 admits creation requirements for the ten currently offered API profiles only through FGI-023 typed service options and capability gates. generic_git remains transport-only; GitLab Dedicated remains an unoffered variant in this setup, and hosted Forgejo, hosted Gitea, Codeberg and Cursor Origin remain retired/ineligible under DL-273. P1 supplies no answer to the deferred repository-restricted Forgejo token route. No profile or product approval is native support evidence.'
gui_related: true
gui_classification_reason: The matrix supplies setup cards, permission labels, precise disabled reasons, trust prompts,
  admin forms, and external-only navigation.
depends_on:
- FGI-014
- GAAAF-015
- SIR-033
unblocks:
- F3-529
acceptance_criteria:
- All thirteen provider profiles and four local-VCS profiles exist separately with every named dimension reporting explicit
  state/probe/reason rather than generic compatibility.
- Same-name/different-instance, custom base path/SSH port, private CA, redirect, metadata, and changed-host-key fixtures
  fail or prompt at the exact trust gate without leaking authorization.
- 'Every provider profile identifies the setup method it admits, in `provider_adapter_profile.auth_methods`. The other
  six facts are identified by the surfaces the canonical text names one by one: the issuer by `Plans/GitHub_API_Auth_and_Flows.md`
  and `oauth_registration_ref`, the allowed host by `normalized_host` and `api_base_path`, the non-secret token owner
  by the three `credential_ref` and `credential_key_ref` fields, the requested scopes by `api_compatibility.scopes` and
  `token_lease.scope_grant_refs`, refresh and revoke by the `token_lease` lifetime and state fields, and the Git-versus-API
  roles by `git_transport_state`, `api_state`, `transport_api_independent` and `credential_access`. Neither closed profile
  schema has a field for those six, so this criterion is met by naming the surface that holds each one; adding them to
  the profile schemas would be a new capability and is not done here.'
- Repository delete, force push, policy edit, runner registration, secret write, and organization management remain individually
  risk-tiered with preview, permission, confirmation, and currentness.
- Every visible hosted-admin control resolves to owner command, versioned schema, permission, receipt, or labeled external-only
  route; GitHub retained administration is inventoried and no live section is silently dropped.
- 'DL-259, Jared 2026-10-31: Audit FF-01..12: Review binds the exact provider/instance/account and repository or creation
  target. GitHub Internal requires an eligible enterprise organization capability; personal repositories cannot be Internal.
  GitLab uses the exact personal/group/subgroup namespace and instance visibility policy. Bitbucket Cloud binds an authorized
  workspace and explicit chosen/default Project with visibility compatibility; Data Center resolves an actual project
  key, including a supported personal Project. Azure Services binds organization and team Project; Server binds collection
  URI and team Project; selecting an existing repository carries its owner-resolved Project identity. Forgejo/Gitea use
  Public/Private repository privacy, not a fabricated Internal value; Forgejo and Gitea are self-managed only (DL-273).
  Each requires a real instance profile (DL-273). Provider/owner changes invalidate incompatible visibility/container/auth
  choices; current provider-specific naming and Git ref validation precede availability. The selected actual auth method
  and least-privilege scopes must match the saved instance profile. Review shows privacy, target/instance, branch and
  material creation consequences, with expandable exact details and owner-routed Edit links.'
- 'DL-272 RV-16, 2026-11-01: Self-managed source-control addresses use the shared endpoint validator. An empty address
  is missing; a bare valid host is normalized with https:// for use; a rejected address gives its actual reason by the
  field and Continue. No example or typed address proves identity or authentication.'
- 'DL-272 RV-20, 2026-11-01: Source-control sign-in explains the actual reach of that auth method before a token is entered.
  Puppet Master acts on the selected Project, but the grant may reach more repositories; copy must not promise that every
  token is repository-restricted. Provider and instance least-privilege checks remain.'
- 'DL-272 P74-GITHUB-TOKEN, 2026-11-01: The guided GitHub token route leads with fine-grained tokens and discloses its
  actual repository reach for create versus selected-existing use. A supported classic-token alternative retains its
  broader disclosed grant; no sample credential is canon.'
- 'DL-272 M6-SIGNUP-NOTE, 2026-11-01: A self-managed service’s sign-up-disabled information is neutral guidance, not
  an authentication failure or a Pip fault. Account authorization still requires the normal owner result.'
- 'DL-273, Jared 2026-11-01: Consume the Forge owner’s narrowed provider admission. Forgejo and Gitea are self-managed
  only; Cursor Origin source control and its native/mirror profiles and inspector are retired. Cursor AI is unchanged.
  generic_git and generic_host remain transport-only, never aliases that restore retired provider, review, CI, auth or
  mirror authority.'
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- Plans/protected_auth_browser_contracts.schema.json
- Plans/protected_auth_browser_contract_fixtures.json
- future provider matrix/trust/admin fixtures
risk_class: capability_matrix_scope_trust_or_admin_authority_conflation
reasoning_tier: high
context_scope: provider_capability_auth_trust_and_admin_matrix
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/forge_integration_contracts.schema.json
- Plans/forge_integration_contract_fixtures.json
- future capability catalog and admin adapters
node_compile_hint:
  mode: static_matrix_contract_only
  create_worknodes: false
  create_nodeseeds: false
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
- DL-272 footage review; integration 7d2dd568be76874ff8b4d3e82bad3701226d248c; lead BATCH-FOOTAGE-REVIEW.md, 2026-11-01.
  Source spellings are lineage, not product API.
- DL-273, Jared 2026-11-01 via lead1101190655-f8ab; removal of agent-proposed hosted offerings, Cursor AI unchanged.
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- github_cloud
- github_enterprise
- gitlab_saas
- gitlab_self_managed
- azure_devops_services
- azure_devops_server
- bitbucket_cloud
- bitbucket_data_center
- forgejo
- gitea
- generic_git
- Microsoft Entra
- guided scoped PAT
- registered OAuth/PKCE
- human-only broker
- auth_methods
- credential_access
negative_constraints:
- Do not use one GitHub-compatible boolean, universal username/password form, global TLS bypass, or cross-origin Authorization.
- Do not request account passwords, deprecated Bitbucket app passwords, new legacy Azure DevOps OAuth, or silent admin
  scopes for ordinary work.
- Do not treat metadata names as secret values or offer Reveal where the provider cannot return a value.
- Do not register a runner without exact Execution Host targeting and explicit consent or merely because Actions/Pipelines
  is enabled.
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

## Forge Repository Delete And Hosted CI Closure - 2026-09-26

This owner adjudicates exactly six additional common central command routes. The table is the sole future-route authority for this batch; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/`ObservableWork`, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.forge.repository.delete` | `handlers::forge::repository_delete` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.artifact.download` | `handlers::forge::pipeline_artifact_download` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.secret.set` | `handlers::forge::pipeline_secret_set` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.secret.remove` | `handlers::forge::pipeline_secret_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.variable.set` | `handlers::forge::pipeline_variable_set` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |
| `cmd.forge.pipeline.variable.remove` | `handlers::forge::pipeline_variable_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` -> `Plans/forge_integration_contracts.schema.json#/$defs/command_result` | `Plans/forge_integration_contracts.schema.json#/$defs/command_error_record` / `Plans/forge_integration_contracts.schema.json#/$defs/permission_decision` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner `ObservableWork` contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact six-command 2026-09-26 set: `cmd.forge.repository.delete`, `cmd.forge.pipeline.artifact.download`, `cmd.forge.pipeline.secret.set`, `cmd.forge.pipeline.secret.remove`, `cmd.forge.pipeline.variable.set`, `cmd.forge.pipeline.variable.remove`.

Exact six-handler 2026-09-26 future set: `handlers::forge::repository_delete`, `handlers::forge::pipeline_artifact_download`, `handlers::forge::pipeline_secret_set`, `handlers::forge::pipeline_secret_remove`, `handlers::forge::pipeline_variable_set`, `handlers::forge::pipeline_variable_remove`.

`cmd.forge.repository.delete` is the explicit destructive command behind the PJCT-007 Delete Repository recovery route. It requires exact provider, variant, normalized host, stable account, PM `repo_id`, provider repository ID, locator, binding generation, current direct revalidation with `mutation_safety=verified`, effective authority and the target-bound Permissions decision; the PJCT-007 recovery route specifically requires a human remote_side_effect permission, verified-create result/receipt refs and fresh human confirmation. A separately admitted PS-147 build cleanup instead requires current grant-created-resource ownership and exact grant authority. An `effect_unknown` outcome carries a typed error and admits only reconciliation-only retry through SCS-016 exact remote reconciliation before any repeat or any delete. Delete never runs as automatic rollback, as part of Continue Setup or any resume, speculatively while the remote effect is unknown, on provider-scope reuse, or authorized by selected-source authentication.

`cmd.forge.pipeline.artifact.download` is the provider-neutral hosted-CI artifact command. It is AutomationBinding-scoped with expected automation-binding generation. On this command `pipeline_id` names the provider pipeline/definition and `automation_run_id` names the explicit immutable AutomationRun execution (the SCS-016 `AutomationRun` for this run); the two are distinct fields and the run is never inferred from the definition. The request carries both identities plus exact job where the provider names jobs (job stays optional), provider artifact, SCS-016 `RemoteArtifact` record, and expected digest identity, and declares an explicit `download` or `import` disposition: download writes bytes to an exact FileSafe destination, import delivers them through an exact artifact-import handoff, and both never auto-execute. It requires `local_mutation` permission, target-bound confirmation, and `ObservableWork`. Provider CI artifacts stay distinct from Puppet Master runtime outputs and Backup exports per F3-529. `cmd.forge.release.asset.download` remains separate under the `release_assets` capability and `release_asset` target; a CI artifact target is never a release asset target and a release capability never authorizes a CI download.

`cmd.forge.pipeline.secret.set`, `cmd.forge.pipeline.secret.remove`, `cmd.forge.pipeline.variable.set`, and `cmd.forge.pipeline.variable.remove` are the provider-neutral hosted secret/variable mutations. They are AutomationBinding-scoped with exact setting name and settings scope, require `remote_side_effect` permission and target-bound confirmation, and never return secret values. Secret set carries a one-use protected human-broker ref and no inline secret bytes; secret operations require a human actor. The FGI-015 hosted-administration matrix gates each area's read/write independently, and GitHub Actions Settings consumes these generic commands with GitHub nouns inside the generic `repository_automation` shell; no provider-specific peer command namespace is created. Admission is exact: `pipeline_artifacts` requires the current matrix `artifact_read` dimension plus the exact download/import authority (FileSafe destination for `download`, artifact-import handoff for `import`); `secrets`/`variables` mutations require the respective hosted-administration area's write state `ready` plus the specific current permission and capability, with the combined matrix `secrets_variables` entry as ceiling only, never blanket write authorization. Unsupported operations route to the labeled official-service destination only; the fallback never widens capability.

`cmd.forge.pipeline.open_in_browser` keeps the selected concept's `Open artifacts in service`, `Open service settings`, and first-card `Open in <provider>` labels and routes them through one command with three distinct exact destinations: `automation_run_artifacts` binds the exact automation run (immutable `automation_run_id` plus the pipeline/definition identity, with job where applicable) behind the artifacts action, `hosted_service_settings` binds the exact service settings scope (non-null `hosted_setting_scope_ref`) behind the settings action with no run identity, and `automation_service_overview` binds the selected automation service overview behind the first-card action with neither run nor scope identity. Every destination carries the exact automation binding and the profile-approved official UI origin and route for the selected instance/tenant; the UI origin may differ from the normalized API/transport host and cross-instance/tenant/route substitution is rejected. Absent native capability yields the corresponding explicit official-service fallback under the already-decided FGI-015 rule; no new native-versus-external product choice is made and no speculative route is offered.

Request-to-result-to-receipt binding is equality of actual values, not shape: the hosted-CI commands and repository delete record the same provider, instance, account, repository, and binding generations across the request, the terminal provider result, and the receipt; an artifact result binds the same automation run, artifact, `RemoteArtifact` record, and digest as its request; a delete result and receipt bind the same verified-create result and receipt as the created remote they delete. Refs that merely validate prove nothing; the equalities above are the native admission gate, and mismatched instance/account/repository/generation/run/artifact/digest/result/receipt joins are rejected while each record alone may remain structurally valid. Hosted-CI success carries its automation binding ref and generation on the result and the receipt; a success that drops them is incomplete. Secret values never appear in any ref; `variable_value` stays ordinary non-secret configuration.

The static roundtrip retains `artifact_evidence` with SCS-owned `normalized_remote_record` values for the AutomationRun and RemoteArtifact, their observed binding/run/pipeline/job membership, and artifact digest. The observed `service_repository_id` identifies the automation service repository; it equals the storage forge provider repository ID only for a `same_forge` relationship. A delete roundtrip resolves the create result through `verified_create_target`, whose target ref and embedded RepositoryBinding must match the create result and repository selected for deletion. Successful artifact results and receipts retain `artifact_identity`; the validator compares their run, artifact, record ref, and digest with the request and source witness. Capability admission retains the existing provider matrix profile, a current dimension observation, the hosted-administration surface when applicable, and a permission record; claimed matrix, write, and permission states must equal those records. A missing witness, duplicate matching administration area, stale observation, or mismatched identity cannot establish admission. These static witnesses establish internal consistency only; source provenance, official-origin allowlisting, provider effects, and native enforcement remain their existing runtime owners' obligations.

### FGI-021 - Repository Delete And Hosted CI Command Closure

```yaml
plan_unit_id: FGI-021
unit_type: command_binding
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Admit cmd.forge.repository.delete, cmd.forge.pipeline.artifact.download,
  cmd.forge.pipeline.secret.set, cmd.forge.pipeline.secret.remove,
  cmd.forge.pipeline.variable.set and cmd.forge.pipeline.variable.remove as six
  distinct provider-neutral commands. Each has one sole future handlers::forge::*
  target, starts handler_unavailable, has expected_event_types=[], returns an
  owner-typed destructive/mutation receipt, and preserves exact target, permission,
  currentness, confirmation, FileSafe, digest, broker, disposition, idempotency and
  ObservableWork guards applicable to its effect. cmd.forge.pipeline.open_in_browser
  carries an exact official destination kind for the automation-run artifacts page,
  the hosted service settings page, and the automation service overview page, with
  capability-absent official fallback already decided by FGI-015.
  Repository deletion from failed setup remains a separate current target-confirmed recovery intent and never automatic rollback or resume. In another explicit build context, PS-147 may authorize cleanup only for a resource the exact grant demonstrably created, revalidated by stable provider ID and manifest; a selected pre-existing repository or name match is insufficient. Ordinary YOLO cannot turn either selection or a failed create into delete authority. Secret operations and protected auth remain human-owned.
gui_related: true
gui_classification_reason: The admitted commands back visible recovery delete, CI artifact download/import, hosted secret/variable administration, and official-service navigation with exact disabled reasons.
depends_on: [FGI-003, FGI-005, FGI-006, FGI-008, FGI-010, FGI-012, FGI-015, SCS-016]
unblocks: []
acceptance_criteria:
  - The primary Forge command census is exactly 52 and the common central future-route census is exactly 49 (43 bound by FGI-010 plus six bound here); this supersedes the FGI-008, FGI-010-batch, and FGI-013 census counts.
  - None of the six commands aliases an existing command, a packet candidate for review listing, definition/artifact enumeration, definition pinning, capability refresh, or publication preview, a provider peer, RepositoryForgeBinding, a release asset, connection removal, or generic settings mutation.
  - repository.delete requires exact provider/binding/generation identity, current direct revalidation, effective authority and exact Permissions authority; setup recovery additionally requires human remote_side_effect permission, verified-create result/receipt refs and fresh human confirmation; PS-147 build cleanup instead requires verified grant-created ownership; effect_unknown admits only reconciliation-only retry; delete is never automatic rollback, part of resume, speculative while unknown, or authorized by source sign-in.
  - pipeline.artifact.download requires exact automation binding/generation, pipeline/definition identity plus the distinct immutable automation_run_id run identity, artifact/RemoteArtifact/digest identity with job only where applicable, local_mutation permission, confirmation, ObservableWork, and explicit download/import disposition with FileSafe destination or artifact-import handoff; downloads never auto-execute and release_assets capability or release_asset targets never authorize or substitute for it.
  - secret.set carries a one-use protected human-broker ref with no inline secret bytes; secret operations require a human actor; all four secret/variable mutations require exact name/scope, remote_side_effect permission, and confirmation, and no request, result, receipt, log, agent payload, or fixture carries secret values or returns them.
  - pipeline.open_in_browser requires an exact official destination kind; automation_run_artifacts binds the exact run, hosted_service_settings binds a non-null hosted_setting_scope_ref with no run identity, and automation_service_overview preserves the first-card Open in <provider> control with neither run nor scope identity; the handoff allowed_origin_ref and route equal the profile-approved official UI destination for the selected instance/tenant, never the normalized API/transport host by equation, and cross-instance/tenant/route substitution is rejected; absent native capability yields the corresponding explicit official-service fallback with no speculative route.
  - request/result/receipt/binding joins are equality of actual provider, instance, account, repository, generation, run, artifact, digest, and verified-create values; mismatched joins are rejected while each record alone stays structurally valid; hosted-CI success carries its automation binding ref and generation on both result and receipt.
  - pipeline_artifacts admits only from the current artifact_read matrix dimension plus exact download/import authority; secrets/variables mutations admit only from their respective hosted-administration area write state ready plus the specific current permission and capability, with the combined secrets_variables matrix entry as ceiling only.
  - Static artifact_evidence reuses the SCS normalized_remote_record schema and compares source run/artifact membership and digest with request and terminal artifact_identity values; capability admission compares actual profile, dimension observation, unique hosted-administration area, and permission records, rejecting missing witnesses and stale or mismatched claims.
  - Every command has one valid request and one rejected permission/guard/currentness fixture; every receipt/event_refs set is empty and no forge.* EventRecord family is admitted.
  - Every future handler remains handler_unavailable until source-hashed native Rust/provider evidence exists; static wiring is planning closure only.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, central catalog/wiring/touch parity checks, no-unregistered-event check]
risk_class: forge_delete_artifact_secret_contract_or_fallback_drift
reasoning_tier: high
context_scope: repository_delete_and_hosted_ci_closure
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future forge handlers]
node_compile_hint: {mode: command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md
- reports/concept-packet-integration-20260926/server-backup.md
- reports/concept-packet-integration-20260926/project-recovery-owner.md
- reports/concept-packet-integration-20260926/README.md
- Concepts/pm7-tools/forge_backup_post_integration_source.py
- Plans/Project_System.md#PJCT-007
- Plans/Source_Control_System.md#SCS-016
- Plans/FinalGUISpec.md#F3-529
- Plans/Forge_Integrations.md#FGI-015
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [cmd.forge.repository.delete, cmd.forge.pipeline.artifact.download, cmd.forge.pipeline.secret.set, cmd.forge.pipeline.secret.remove, cmd.forge.pipeline.variable.set, cmd.forge.pipeline.variable.remove, handler_unavailable, "expected_event_types=[]", ObservableWork, FileSafe, DestructiveOperationReceipt, MutationReceipt, RemoteArtifact, one-use protected broker ref, official_destination_kind, automation_run_artifacts, hosted_service_settings, automation_service_overview, automation_run_id, hosted_setting_scope_ref, allowed_origin_ref, "Open artifacts in service", "Open service settings", "Open in <provider>", download, import]
negative_constraints:
  - Do not admit packet-proposed forge.* event names or treat an operation receipt as an EventRecord.
  - Do not run repository delete automatically, as resume cleanup, speculatively while unknown, or on source sign-in.
  - Do not route a CI artifact download through release_assets capability or a release_asset target, or vice versa.
  - Do not place secret bytes in any command, agent, result, receipt, log, or fixture payload; do not reuse or bypass the one-use protected human broker.
  - Do not offer a native CI action where the capability is absent instead of the exact official-service fallback, and do not fabricate a run, setting scope, or provider origin for any destination.
  - Do not equate the official UI origin with the normalized API/transport host, and do not accept cross-instance, cross-tenant, or cross-route substitution; approved distinct web/API domains are not substitution.
  - Do not treat structurally valid refs as proof of the request/result/receipt/binding join; equality of actual values is the gate, and no const-true attestation flag grants authority.
  - Do not expose credentials, authorization, runner tokens, absolute local paths, or unredacted provider errors in requests, receipts, logs, or fixtures.
compile_disposition: extend_existing_owner
```

### FGI-022 - Review Edit And Runner Read Producer Closure

```yaml
plan_unit_id: FGI-022
unit_type: command_binding
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: >-
  Admit cmd.forge.review.edit as the provider-neutral typed title/description patch
  mutation against an exact RepositoryForgeBinding, provider review ID and expected
  immutable review revision. It requires current direct revalidation, effective
  authority, remote_side_effect permission, target-bound confirmation and
  idempotency/reconciliation before any provider effect. The existing
  cmd.forge.review.mark_ready consumes draft=false only; draft=true is not a
  Mark Ready request and remains an explicit unsupported transition until separately
  admitted. The existing cmd.forge.review.version.open and version.compare bind
  immutable review versions and serve review diff selection; an absent, stale or
  substituted version is refused, and no generic review.diff command is admitted.
  Forge-owned runner.list_projection and runner.registration.preview are read
  producers, not command aliases. They require exact AutomationBinding generation,
  provider/instance/account/scope, current capability and read permission. Preview
  binds execution host, host revision, environment, runner scope, immutable target
  digest, disclosure, producer, issue time and expiry. Registration apply resolves
  this typed preview by ref and digest, then revalidates the same binding, host,
  capability, permission, step-up, host consent and target confirmation before effect.
  Expired, stale, missing or substituted records fail closed.
gui_related: true
gui_classification_reason: Review editing, version diff, runner list, registration preview and Mark Ready are visible Forge controls.
depends_on: [FGI-004, FGI-008, FGI-013, FGI-015, FGI-021, SCS-016]
unblocks: []
acceptance_criteria:
  - The current primary command census is 53 and the common central route census is 50; review edit is the only new primary, with handlers::forge::review_edit handler_unavailable and expected_event_types=[].
  - Review edit requires a nonempty typed patch, exact provider review and expected revision, current direct revalidation, effective authority, remote_side_effect permission, confirmation, idempotency and reconciliation; success returns MutationReceipt and no forge EventRecord.
  - Mark Ready requires draft=false and cannot use draft=true to make a review draft; agent-created reviews remain Draft by default until a separate Mark Ready action.
  - Version open/compare bind review_revision_ref, plus both left/right immutable revisions for compare; no unbound current-diff inference or version substitution.
  - Runner list producer emits a permission-scoped current projection for one exact AutomationBinding and generation; stale, substituted or expired projections cannot authorize controls.
  - Runner preview producer emits typed request, record and result; apply resolves a current preview by ref and digest and revalidates binding, host/revision, environment/scope, capability, permission, disclosure, step-up, consent and target confirmation before effect. Apply never synthesizes its own preview.
  - Native producer and handler availability remains unavailable until source-hashed Rust/provider evidence exists; static fixtures are contract evidence only.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, scripts/pm_forge_command_followup.py, central catalog/wiring/touch parity checks]
risk_class: forge_review_runner_substitution_or_authority_drift
reasoning_tier: high
context_scope: forge_review_edit_and_runner_producers
implementation_surfaces: [Plans/Forge_Integrations.md, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future Forge handlers and projection services]
node_compile_hint: {mode: command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite:ACT-050, source_ref:egolite:ACT-059, source_ref:egolite:ACT-154, source_ref:egolite:ACT-163, source_ref:egolite:ACT-164, source_ref:egolite:EGOLITE-X01]
preserved_exact_tokens: [cmd.forge.review.edit, cmd.forge.review.mark_ready, draft=false, cmd.forge.review.version.open, cmd.forge.review.version.compare, runner.list_projection, runner.registration.preview, cmd.forge.runner.registration.apply, AutomationBinding, handler_unavailable, MutationReceipt]
negative_constraints: [Do not synthesize a runner registration preview inside apply., Do not treat draft=true as Mark Ready., Do not infer selected review version from current display state., Do not claim native execution from static contracts.]
compile_disposition: extend_existing_owner
```


## Projects refresh accepted owner addendum (2026-11-03)

### FGI-023 - Typed create options and explicit repository discovery

```yaml
plan_unit_id: FGI-023
unit_type: requirement
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: |-
  The shared Forge owner closes per-service create_options on cmd.forge.repository.create and its exact Project handoff in PJCT-010. Options bind provider/profile/variant, normalized instance, stable account and credential-authority refs, actual owner/container/team Project/workspace/project key, valid provider name/slug, description, default branch, visibility and requested initial-file choices. Provider/variant/address/owner changes invalidate incompatible account/container/privacy/auth and name/ref checks, including any earlier refusal. Review always shows current target/privacy and material effects; private-most available visibility is the starting value and an inherited public row cannot silently publish a new repository.

  The offered API profiles are github_cloud, github_enterprise, gitlab_saas, gitlab_self_managed, azure_devops_services, azure_devops_server, bitbucket_cloud, bitbucket_data_center, forgejo and gitea. GitHub binds personal or eligible organization owner, with Internal only where the enterprise organization capability admits it; GHES additionally requires current github_host_policy, instance/host/certification and scope admission. GitLab binds the exact personal/group/subgroup namespace; self-managed Internal is capability-probed and namespace visibility caps remain. Azure Services binds organization and an existing provider_project_id; Server binds collection URI and an existing team Project with signed version support; privacy follows that Project and TFVC is refused. Bitbucket Cloud binds authorized workspace and explicit grouping Project, private/public compatible with that Project, with workspace/repository address; Data Center binds normalized host and actual project key/personal project plus slug and its server/license/privacy rules. Forgejo/Gitea remain distinct self-managed adapters with actual instance address, account/organization and Public/Private privacy. Names and Git refs use each current provider/backend validator, never one universal regex or display label.

  This is the normative GitHub/GitLab API-profile-to-provider-variant mapping for FGI-015, create_options_v2.instance_profile and the resulting repository_binding.provider_variant. Preserve both vocabularies across discovery, reviewed creation and the PJCT-010 handoff; a display label never supplies either identity.

  | API profile (profile_id / instance_profile) | Provider | Resulting provider_variant | New Project create |
  |---|---|---|---|
  | github_cloud | github | github_cloud | Offered under current admission |
  | github_enterprise | github | github_enterprise | Offered only under current GHES host policy |
  | gitlab_saas | gitlab | gitlab_com | Offered under current admission |
  | gitlab_self_managed | gitlab | gitlab_self_managed | Offered under current admission |
  | No create profile | gitlab | gitlab_dedicated | Not offered; retains its separately gated owner variant |

  ForgeCreateProfileBindingV1 in Plans/forge_integration_contracts.schema.json validates this mapping over the existing create options and resulting binding. It is a versioned static cross-record assertion, not a new command, runtime receipt or storage family, and does not change historical request/result shapes. A mismatched pair fails before the Project adopts the remote binding. GitHub's profile and variant spellings already coincide; GitLab's hosted profile and variant deliberately retain their distinct spellings.

  Authentication methods remain provider/instance catalog data and protected owner handoffs. Git transport and API auth are independent; sign-in is neither account creation nor repository-write proof. Creation of a code repository does not publish a website, change branch policy, create topics not admitted by the schema, administer Azure team Projects or authorize paid signup. README/ignore/licence stay in online-copy Advanced and a source with existing history creates an empty remote. generic_git is transport-only with no create/review/check API; gitlab_dedicated is not offered in this setup. DL-273 retired hosted Forgejo/Gitea/Codeberg/Origin admission and the deferred repository-restricted Forgejo token route are unchanged.

  cmd.forge.repository.list extends its existing verified account-container variant with a closed explicit account/instance/owner discovery scope, optionally a named public owner and query, actual access policy and bounded coverage/pagination. Before repository binding it carries no Project/repository identity and zero repository generation. Reads may discover only what that account or admitted public scope can inspect; no inaccessible result is reported as absence. Selection still independently resolves stable repository identity and capability before binding. The same sole handler and typed family serve all consumers; no new generic search/clone wrapper, standalone receipt family or EventRecord is introduced.
gui_related: false
gui_classification_reason: Defines owner identity, target and command/data boundaries without GUI implementation.
depends_on:
- FGI-003
- FGI-011
- FGI-015
unblocks: []
acceptance_criteria:
- Each offered variant has required/forbidden fields, privacy/name/auth/instance checks and exact handoff receipts.
- GHES policy-off, Azure TFVC/missing GUID, unsupported Dedicated, retired variant and deferred-token attempts refuse
  without a generic transport bypass.
- Owner discovery preserves explicit scope and coverage; an unverified URL never becomes access or binding.
- Current provider naming/ref/privacy and secret-exclusion checks survive create/retry and Review invalidation.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_fgi_023
implementation_surfaces:
- Plans/Forge_Integrations.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P1; S1-S3; BUILD-SPEC §18/21; DL-273
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
preserved_exact_tokens:
- create_options
- cmd.forge.repository.create
- cmd.forge.repository.list
- PJCT-010
- private-most
- github_host_policy
- provider_project_id
- generic_git
- gitlab_dedicated
- DL-273
- README
- Advanced
negative_constraints:
- Do not use a universal all-forge field bag, GitHub-default target, API sign-in as Git transport or a URL as stable
  identity.
- Do not revive retired providers or admit deferred restricted Forgejo tokens under P1.
- Do not claim native service support from profile/schema/fixture existence.
owner_hints:
- Plans/Forge_Integrations.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Forge_Integrations.md#FGI-023, ContractName:Plans/Plan_Document_System.md#PDS-003

### FGI-024 - Contribution fork and team-project change workflow

```yaml
plan_unit_id: FGI-024
unit_type: integration_contract
status: accepted
owner_doc: Plans/Forge_Integrations.md
canonical_text: |-
  The guided Contribute fork workflow is admitted for GitHub and GitHub Enterprise only, subject to actual host policy, account/instance and fork/review capability. It accepts an explicitly resolved original repository from URL or owner discovery, checks readable source/current access, and chooses the exact account/namespace that keeps the fork. Preview says what remote will be made, where the fork and files live, the original upstream, and the change branch/bookmark; Regular obtains the named commit, while requested YOLO uses PS-146 authority without an extra ordinary yes. Protected auth/trust and repository-origin loosening acceptance still apply.

  At commit PJCT-010 calls cmd.forge.repository.fork once or explicitly reuses a current verified fork, clones that exact fork through the chosen Git/JJ owner, adds the original through cmd.source_control.remote.add under SCS-025, creates the separate feature branch or explicit JJ change/bookmark through backend owners, binds fork/head and original/base identities, and registers only after verified local results and required Settings. The retained contribution context includes provider/instance/account, original and fork repository IDs, head_repository and base_repository bindings/revisions, base/head branch or bookmark mapping, chosen original remote name, access/capability/inspection evidence and contribution policy/check/commit refs. cmd.forge.review.create uses that explicit pair; a single provider_repository_id or remote named origin cannot represent cross-repository review authority.

  Keep a fork current is choreography under existing SCM owners, not an unowned sync operation. Preview the original immutable revision and fork/head, fetch only the chosen original with cmd.source_control.remote.fetch or cmd.jujutsu.git.fetch, reconcile locally through the admitted Git remote.sync policy/merge-rebase adapter or cmd.jujutsu.change.rebase at the selected change, pause on conflict for the owner resolution path, then publish only the chosen fork with remote.publish or cmd.jujutsu.git.push when explicitly requested. Fetch/reconcile never silently pushes original or every remote, never treats unknown ancestry as current, and never force-pushes a foreign/default/protected branch. Y1 lease and created-work-branch checks apply. Revalidate currentness, capability, Stop and permission before every next step; a failed fence blocks dispatch.

  cross_repository_review_target_v2.provider_id retains its closed legacy selector vocabulary: github maps to provider github, API profile github_cloud and provider_variant github_cloud; github_enterprise maps to provider github, API profile github_enterprise and provider_variant github_enterprise. The selector is not the repository_binding.provider field. Both head/fork and base/original bindings must resolve to that selected profile/instance under current host policy. Preserve the historical target shape and these selectors; github_cloud is an API-profile token, not an additional target selector.

  P2 does not admit equivalent fork automation on GitLab, Azure, Bitbucket, Forgejo or Gitea: guided fork returns typed unsupported for those services, preserving historical cross-forge fixtures as lineage rather than support. Within an authorized team Project P6 defaults to Make a change to offer on a branch; Work on it directly is one visible selection away and retains normal protected-branch policy. Just copy it remains an ordinary source acquisition without pretending to own a fork or permission to publish. New remote effects retain PJCT-007/010 recovery and no automatic repository deletion.

  For the Git local reconciliation stage, the remote.sync successor explicitly carries the verified original repository/revision, fork destination repository/workspace and expected native revision, plus the existing resolved native merge/rebase policy. The stage is local_reconcile_only and cannot publish implicitly; the separately reviewed remote.publish stage names the fork target. The selected source_control_command_request_v2, source_control_command_result_v2, source_control_command_scope_v2, remote_operation_target_v2 and remote_sync_local_reconcile_target_v2 definitions under SCS-025 encode those joined facts. reconciliation_strategy binds the exact native policy ID/revision/hash, with push_targets=[] and publish_performed=false; preserve historical v1 request/result/replay bytes. The unchanged cmd.source_control.remote.sync handler returns the local before/after receipt and exact caller context, while cmd.source_control.remote.publish is the separate admitted fork publication. No identity is inferred from an origin string and no new sync engine is introduced.
gui_related: true
gui_classification_reason: Defines visible setup, choice, status, recovery or exact return behavior.
depends_on:
- FGI-003
- FGI-013
- FGI-014
- SCS-025
- PJCT-007
unblocks: []
acceptance_criteria:
- Fork, clone, original remote, feature branch/bookmark, cross-repository review and register share exact joined
  identities and typed receipts.
- Unknown/failure after fork retains recovery without repeat fork/create or speculative delete.
- Sync targets the explicit original and fork, pauses on conflict and never silently pushes original or fan-outs.
- Non-GitHub guided fork refuses; team-project branch and direct-work choices remain distinct and capability-checked.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- scripts/pm-projects-refresh-contracts.py
risk_class: identity_authority_or_false_completion
reasoning_tier: high
context_scope: projects_refresh_fgi_024
implementation_surfaces:
- Plans/Forge_Integrations.md
- future existing owner handlers; handler_unavailable until native evidence
node_compile_hint:
  mode: static_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- '/mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md#P2/P6; Y1; BUILD-SPEC §18.1 #4/5/6'
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-e
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md#18-and-21
- 'Jared, 2026-11-03 (verbatim): YOLO mode needs to absolutely be able to git push and publish.'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#B-E01'
- '/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-E01'
preserved_exact_tokens:
- Contribute
- GitHub Enterprise
- head_repository
- base_repository
- cmd.forge.repository.fork
- cmd.forge.review.create
- cmd.source_control.remote.add
- Make a change to offer
- Work on it directly
- cmd.jujutsu.change.rebase
- 'local_reconcile_only'
- 'reconciliation_strategy'
- 'push_targets=[]'
- 'publish_performed=false'
negative_constraints:
- Do not infer base/head repositories from origin/upstream names, focus or one repository ID.
- Do not invent another fork-sync engine or route JJ changes through direct Git fallback.
- Do not claim non-GitHub fork support from historical cross-forge fixtures.
owner_hints:
- Plans/Forge_Integrations.md
compatibility_only_notes:
- Existing exact historical Project requests/results/receipts remain readable under their original version; no in-place
  reinterpretation.
stale_retired_dispositions:
- Earlier pending decision labels are superseded by the approved packet; native implementation and governance certification
  remain unproved.
```

ContractRef: ContractName:Plans/Forge_Integrations.md#FGI-024, ContractName:Plans/Plan_Document_System.md#PDS-003
