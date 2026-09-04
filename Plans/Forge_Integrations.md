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
  each capability. Self-hosted profiles keep Git transport, general API, and Actions state independent; pin detected
  product/version and supported API schema; and distinguish Actions disabled, no runner, no workflow, insufficient
  permission, and unsupported. Unknown or failed compatibility disables mutation; validated reads may remain degraded
  and partial data is never complete.
gui_related: true
gui_classification_reason: Capability state controls visible sections, disabled reasons, remediation, and requested/effective disclosure.
depends_on: [FGI-001]
unblocks: [FGI-004, FGI-005, FGI-006, FGI-007, FGI-008]
acceptance_criteria:
  - Every provider operation resolves one capability entry before dispatch.
  - Missing scope, tier, version, rate, offline, managed policy and unsupported states remain distinguishable.
  - API-disabled Forgejo/Gitea instances may retain healthy Git fetch/publish; Actions state never stands in for either API or transport state.
  - Mutation cannot proceed under unknown, stale, or failed compatibility.
validation_surfaces: [capability envelope fixtures, provider matrix fixtures, stale and fail-closed mutation tests]
risk_class: capability_widening_or_false_completeness
reasoning_tier: high
context_scope: forge_capability_routing
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future provider adapters]
node_compile_hint: {mode: forge_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:ORI-03]
preserved_exact_tokens: [requested, effective, available, degraded, unavailable, unsupported, mutation_safe, partial data is never complete]
negative_constraints: [Do not hide unsupported capabilities., Do not downgrade a failed mutation into success., Do not scrape terminal prose as capability proof.]
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
  A new head creates a new revision and stales or revalidates prior approvals, tests, captures and audits.
  ForgeReviewThread binds exact revision, path/range, participants, comments, resolution actor/state, evidence and
  blocking status. Agent-authored reviews default Draft unless explicit Project policy permits otherwise; Mark Ready is distinct.
gui_related: true
gui_classification_reason: Reviews, versions, threads, Draft/Ready, evidence staleness and actions are user-visible.
depends_on: [FGI-003]
unblocks: [FGI-005, FGI-008]
acceptance_criteria:
  - Review evidence cannot silently transfer to a new head revision.
  - Thread resolution is scoped to one immutable review revision and actor.
  - Agent review creation defaults Draft and Mark Ready uses a separate command and receipt.
validation_surfaces: [review revision/thread fixtures, stale-head gate tests, Draft/Mark Ready policy tests, compact query fixtures]
risk_class: stale_review_evidence_or_agent_publication
reasoning_tier: high
context_scope: forge_reviews
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future review adapters]
node_compile_hint: {mode: immutable_forge_review_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-04]
preserved_exact_tokens: [ForgeReviewRevision, ForgeReviewThread, Draft, Mark Ready, stale_head_changed]
negative_constraints: [Do not reuse approvals across a changed head., Do not publish an agent review as Ready by default., Do not inject a whole review when a compact query suffices.]
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
  stale, partial, cancelled, Actions-disabled, no-runner, no-workflow and insufficient-permission results remain explicit.
gui_related: true
gui_classification_reason: Pipeline/check state, jobs, logs, actions, progress, and degraded history are visible.
depends_on: [FGI-003, FGI-004]
unblocks: [FGI-008]
acceptance_criteria:
  - Provider-native jobs/builds/checks map without losing identity or currentness.
  - Pipeline and runner requests carry an exact automation binding and expected automation-binding generation even when its provider differs from the repository host.
  - Accepted async mutation returns ObservableWork and one terminal provider result.
  - A stale or partial pipeline projection cannot authorize retry/cancel without direct validation.
validation_surfaces: [pipeline projection fixtures, retry/cancel idempotency tests, stale history and partial result tests]
risk_class: pipeline_mutation_or_progress_misrepresentation
reasoning_tier: high
context_scope: forge_pipelines_and_checks
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/Shared_Integration_Runtime.md, future pipeline adapters]
node_compile_hint: {mode: forge_pipeline_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:SCM-05, source_ref:egolite-register:TS-04]
preserved_exact_tokens: [pipeline, build, jobs, checks, ObservableWork, partial, stale]
negative_constraints: [Do not infer progress from elapsed time., Do not call partial history complete., Do not retry or cancel from a stale projection.]
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
  ForgeApiCompatibility pins provider/variant, adapter version, OpenAPI or contract hash, signed catalog generation,
  probe, endpoints, scopes, features, mutation safety, requested/effective capability, rate budget and currentness.
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
validation_surfaces: [API compatibility fixtures, rate-limit/backoff tests, CLI JSON version gate tests, no-prose-scrape negatives]
risk_class: forge_api_drift_or_unsafe_fallback
reasoning_tier: high
context_scope: forge_api_compatibility
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, future signed provider catalog]
node_compile_hint: {mode: forge_api_compatibility_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:ORI-03, source_ref:egolite-register:SCM-05]
preserved_exact_tokens: [ForgeApiCompatibility, OpenAPI hash, catalog generation, Retry-After, structured-JSON CLI, partial]
negative_constraints: [Do not scrape terminal prose., Do not mutate on unknown compatibility., Do not ignore Retry-After., Do not call fallback data complete.]
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
  - Every one of the 46 canonical Forge commands has one schema-valid request and one rejected permission/guard/currentness negative fixture.
  - GitHub retains its provider-native Actions content inside the generic shell; a Git remote named Origin never fabricates an Origin Actions service.
  - Legacy hosted records migrate only from validated provider identity; ambiguous records remain blocked.
validation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, provider GUI fixtures, command/wiring census, migration fixtures, accessibility and degraded-state tests]
risk_class: forge_gui_command_or_migration_drift
reasoning_tier: high
context_scope: forge_gui_settings_commands_migration
implementation_surfaces: [Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, Plans/Settings_System.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: forge_gui_command_migration_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-register:UI-01..03, source_ref:egolite-register:CT-01..02]
preserved_exact_tokens: [cmd.forge.*, Pull Request, Merge Request, Ready with limits, Needs attention, Not available]
negative_constraints: [Do not create cmd.origin.*, cmd.gitlab.*, cmd.azure_devops.*, or cmd.bitbucket.* primary namespaces., Do not infer provider from display copy., Do not call command dispatch completion.]
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
cmd.github.pr.create remains direct GitHub owner behavior
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

The primary command enum is exactly the 46 IDs in §3.1. Two (`cmd.forge.review.create` and `cmd.forge.review.merge`) retain their provider-owner routes, `cmd.forge.repository.create` retains the separate common route bound by FGI-009, and the remaining 43 use the FGI-010 common central Forge route set (the prior 34 plus nine new command admissions). The nine new commands start `handler_unavailable`, require `expected_event_types=[]`, and do not gain runtime credit from schema, fixture, catalog, handler-name, or static wiring presence. One provider-neutral request object carries exact provider and variant, normalized host, stable account, PM and provider repository binding, expected binding generation, optional independent automation binding and expected automation-binding generation where required, requested/effective authority, requested capability, catalog/API currentness, non-secret credential/grant ref, permission snapshot, target-bound preflight, optional confirmation, target identity, availability, FileSafe decision for local writes, and `ObservableWork` when admitted asynchronous work requires it.

Family-level conditionals select repository, mirror, review, immutable review thread/version, pipeline/job, webhook delivery, or connection targets without provider-specific peer request types. Mutations require current binding/catalog/API evidence, `mutation_safety=verified`, direct execution-time revalidation, effective authority, permission, and idempotency. Destructive or publication-sensitive actions require target-bound confirmation. Review/thread/version commands require immutable revision identities. Pipeline run/retry/cancel require current direct validation and `ObservableWork`; stale or partial projections cannot validate as dispatch-admitted mutations. Mirror mutation requires verified authority. Webhook redelivery requires signature-before-parse, fresh replay state, dedupe state, exact delivery identity, and redelivery idempotency.

Results distinguish `accepted`, `succeeded`, `blocked`, `degraded`, `failed`, `cancelled`, `recovery_required`, and `effect_unknown`. Acceptance requires `ObservableWork`; success requires a separate terminal provider result and receipt; `effect_unknown` requires a typed error and reconciliation-only retry. Availability and error codes are closed owner vocabularies. No request may infer provider/repository identity from remote text. No schema defines a native/provider handler, provider-specific peer common command namespace, persisted event binding, central registration, or runtime proof.

## 4. Integration Surfaces

### 4.1 Source Control

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

The common static command contract is now structurally specified for all 46 canonical IDs. The nine 2026-09-01 additions have explicit no-event dispositions and unavailable future handler targets, but the domain remains node-blocked until cross-owner central registration/wiring/touch closure, storage, provider-owner mappings, current signed catalogs, native adapters and handlers, credential broker, secure webhook ingress, an allowlisted official-page dispatcher plus protected-browser routing when auth requires it, `ObservableWork`, migration, security tests, GUI fixtures, and fresh provider runtime evidence exist. This Plan creates no WorkNode, event admission, native handler, connection, webhook, app, token, browser execution, runtime proof, or readiness certification.

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
canonical_text: >-
  An onboarding online copy is an optional hosted Git destination independent from local Git or Jujutsu. It becomes
  selectable only through an explicit current account verification and an explicit repository binding. Provider-specific
  host, owner/container, repository, visibility, eligibility, and capability requirements remain visible and typed.
  Cursor Origin Preview is an eligible hosted Git destination with Private or Internal onboarding visibility, never a
  no-host pseudo-option. Reusing an existing connection selects and verifies the exact account and repository rather than
  skipping setup. Protected sign-in and explicit external account creation are distinct owner-controlled handoffs.
gui_related: true
gui_classification_reason: Defines provider cards, required fields, visibility choices, account/repository verification, and exact disabled reasons in Product Onboarding.
depends_on: [FGI-001, FGI-003, FGI-006, FGI-008, SCS-011]
unblocks: [PWIZ-024]
acceptance_criteria:
  - Every hosted-copy draft names `forge_provider`, provider variant, normalized HTTPS host, stable account ref, owner/container locator, provider repository ref, PM `repo_id`, binding generation, visibility or inherited-visibility disposition, capability currentness, and non-secret credential/grant ref as applicable.
  - Account authentication and repository selection/creation are separate required results; `already_connected` must select and verify a current account and then select the exact repository, and cannot succeed as an empty action.
  - Existing accounts use one owner-controlled protected sign-in when needed. An allowlisted official provider page is offered only for explicit account creation or provider-required external administration, not as a redundant second sign-in path.
  - GitHub requires github.com or a normalized GitHub Enterprise host, a verified stable account, personal or organization owner, and repository; Private/Public are ordinary hosted choices and Internal is shown only when the exact enterprise capability permits it.
  - GitLab requires GitLab.com or a normalized self-managed HTTPS instance, a verified account, namespace/group, and project repository; GitLab.com onboarding exposes Private/Public, while Internal on self-managed GitLab is capability-probed rather than assumed.
  - Azure DevOps requires cloud or self-managed variant, normalized organization/server host, verified account, Azure organization or collection, Azure project, and repository; repository visibility inherits the Azure project policy and is not represented by a fabricated repository-level selector.
  - Bitbucket Cloud requires a verified account, workspace, optional project locator when used, and repository, with Private/Public subject to current capability; Bitbucket Data Center requires normalized HTTPS instance, verified account, project key, repository slug, and licensed/versioned capability, without being collapsed into Cloud.
  - Forgejo requires its own normalized HTTPS instance, stable instance/account/organization/repository identity, typed API root/base path and SSH host/port, scoped CA and known-host proof refs, detected Forgejo product/version/API schema, and independently probed API/Git/Actions state; PAT is the default and OAuth PKCE appears only for a registered instance flow.
  - Gitea requires the same typed self-host fields through a distinct Gitea adapter and product identity; shared primitives never imply permanent Forgejo API equivalence, and API-disabled does not disable proven Git transport.
  - Cursor Origin requires a current Preview eligibility projection, verified eligible account/team owner, fixed hosted Origin service identity, and repository binding; onboarding permits only Private or Internal, keeps Public unavailable, and allows normal Git or Jujutsu-backed clone/fetch/push through certified transports.
  - Local-only Safe History stays valid with `forge_provider=none`; no forge account or repository is required until the user explicitly chooses an online copy or `Bring one from online`.
  - Before Review confirmation, Product Onboarding records only the intended provider/account/repository fields and cached projections; it performs no sign-in, eligibility check, repository list/create/bind, clone, fetch, or publish.
  - This PlanUnit reuses common `cmd.forge.*`, shared authentication/integration lifecycle, provider-owner adapters, and Source Control transport commands; it creates no provider-specific command namespace, account store, secret custody, or native/runtime evidence.
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, provider-specific positive/negative fixtures, future protected-auth and repository-binding owner-return fixtures]
risk_class: onboarding_forge_account_repository_or_provider_requirement_drift
reasoning_tier: high
context_scope: onboarding_forge_provider_binding
implementation_surfaces: [Plans/Forge_Integrations.md, future forge facade, future Product Onboarding owner adapter]
node_compile_hint: {mode: forge_onboarding_binding_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [user-correction:2026-09-01-forge-onboarding-requirements, Plans/product_onboarding_contracts.schema.json, Concepts/pm7-tools/onboarding_cinematic_source.py]
preserved_exact_tokens: [github, gitlab, azure_devops, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, cursor_origin, Private, Internal, already_connected]
negative_constraints:
  - Do not treat a selected provider or verified account as a repository binding.
  - Do not represent Cursor Origin as no-host, local-only, or public-by-default.
  - Do not offer duplicate built-in and official-page sign-in choices.
  - Do not collapse GitLab hosted/self-managed, Azure cloud/self-managed, or Bitbucket Cloud/Data Center requirements.
  - Do not collapse Forgejo and Gitea into one product, adapter, API schema, capability result, or account identity.
  - Do not infer provider, account, repository, owner, visibility, eligibility, or readiness from display text or remote URL alone.
  - Do not dispatch forge or authentication work before Review confirmation.
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
  Authentication is provider- and instance-scoped: GitHub direct OAuth/App/token plus separate Git helper;
  GitLab registered OAuth/PKCE or scoped PAT; Azure Services Entra and Server supported on-prem auth;
  Bitbucket Cloud OAuth/current scoped API token and Data Center supported instance token; Forgejo/Gitea
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
  - Every provider profile identifies issuer, allowed host, setup method, non-secret token owner, requested scopes, refresh/revoke, and separate Git-versus-API roles.
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
preserved_exact_tokens: [github_cloud, github_enterprise, gitlab_saas, gitlab_self_managed, azure_devops_services, azure_devops_server, bitbucket_cloud, bitbucket_data_center, forgejo, gitea, cursor_origin_native, cursor_origin_github_mirror, generic_git, Microsoft Entra, guided scoped PAT, registered OAuth/PKCE, human-only broker]
negative_constraints:
  - Do not use one GitHub-compatible boolean, universal username/password form, global TLS bypass, or cross-origin Authorization.
  - Do not request account passwords, deprecated Bitbucket app passwords, new legacy Azure DevOps OAuth, or silent admin scopes for ordinary work.
  - Do not treat metadata names as secret values or offer Reveal where the provider cannot return a value.
  - Do not register a runner without exact Execution Host targeting and explicit consent or merely because Actions/Pipelines is enabled.
  - Do not fabricate mutation success when an API is unsupported or unimplemented.
  - Do not claim live vendor currentness, runtime security, provider access, or admin implementation from static matrix/schema/fixtures.
```
