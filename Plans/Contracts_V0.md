# Contracts V0 (Canonical)


  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - Keep `active_subview`, filters, compare targets, pinned selections, and similar fields in destination/view-state contracts.
  - active_subview
  - `focus_thread_usage`
  - focus_thread_usage
  - `navigation_wrapper`
  - navigation_wrapper
  - `domain_action`
  - domain_action
  - contracts own canonical route identity
  - `backing_document_id`
  - backing_document_id
  - `last_saved_path`
  - last_saved_path
  - Those fields belong elsewhere:
  - The narrow scope-restoration fields are:
  - The narrow focus-refinement fields are:
  - Good serialized fields
  - Bad serialized fields
  - `object_kind = blocked_episode`
  - object_kind = blocked_episode
  - `focused_run_id = run_id`
  - focused_run_id = run_id
  - `object_id = blocked_sequence`
  - object_id = blocked_sequence
  - It must stay small.
  - `object_kind = usage_event`
  - `agent-rules-context.md` still under-enumerates callers, omits execution-role input, conflicts with Personas/Prompt_Pipeline on bundle ordering, and has weaker disclosure/help contracts than adjacent systems.
  - agent-rules-context.md
  - `project_id = <project_id>`
  - project_id = <project_id>
  - `thread_id = <thread_id>`
  - thread_id = <thread_id>
  - `focused_run_id = <run_id>`
  - focused_run_id = <run_id>
  - `object_id = <attempt_id>`
  - object_id = <attempt_id>
  - `object_id = <blocked_sequence>`
  - object_id = <blocked_sequence>
  - `object_kind = scheduler_pass`
  - object_kind = scheduler_pass
  - `object_id = <scheduler_pass_id>`
  - object_id = <scheduler_pass_id>
  - `object_id = <safe_point_id>`
  - object_id = <safe_point_id>
  - `object_id = <remediation_root_id>`
  - object_id = <remediation_root_id>
  - `object_kind = graph_generation`
  - object_kind = graph_generation
  - `object_id = <graph_generation_id>`
  - object_id = <graph_generation_id>
  - `object_kind = graph_patch`
  - object_kind = graph_patch
  - `object_id = <graph_patch_id>`
  - object_id = <graph_patch_id>
  - `object_id = <worktree_id>`
  - object_id = <worktree_id>
  - `object_id = <lane_id>`
  - object_id = <lane_id>
  - `object_kind = feature_seam`
  - object_kind = feature_seam
  - `object_id = <feature_seam_id>`
  - object_id = <feature_seam_id>
  - `object_kind = work_package`
  - object_kind = work_package
  - `object_id = <work_package_id>`
  - object_id = <work_package_id>
  - `object_id = <concern_id>`
  - object_id = <concern_id>
  - `object_id = <promotion_id>`
  - object_id = <promotion_id>
  - `seams`
  - seams
  - `node_graph`
  - node_graph
  - `object_id = scheduler_pass_id`
  - object_id = scheduler_pass_id
  - `object_id = safe_point_id`
  - object_id = safe_point_id
  - `object_id = remediation_root_id`
  - object_id = remediation_root_id
  - `object_id = attempt_id`
  - object_id = attempt_id
  - Stratum 1: owner docs
  - Treat the routing tranche as structurally closed after the owner-doc contracts are added.
  - subsection `7.2 WiringEntry`
  - 7.2 WiringEntry
  - `handler_location`
  - handler_location
  - `expected_event_types`
  - expected_event_types
  - unknown-command rejection
  - report/evidence refs
  - `workflow_refs`
  - workflow_refs
  - `docker_refs`
  - docker_refs
  - `kubernetes_refs`
  - kubernetes_refs
  - `attempt_record` with scheduler/safe-point/remediation/runtime identity fields
  - they correctly carry blocked/wizard state
  - wizard-blocked keeps wizard-specific clarification/report fields
  - usage_record
  - tier-adjacent `evidence_record`
  - `thread_blocked_notice` / `wizard_runtime_state` with `resume_url?`
  - resume_url?
  - exact command-arg mismatches
  - `requested_platform`
  - requested_platform
  - `effective_platform`
  - effective_platform
  - `requested_model`
  - requested_model
  - `effective_model`
  - effective_model
  - `worker_provider`
  - worker_provider
  - `worker_model`
  - worker_model
  - `verifier_provider`
  - verifier_provider
  - `verifier_model`
  - verifier_model
  - `request_id`
  - request_id
  - `request_kind = tier_boundary_approval`
  - request_kind = tier_boundary_approval
  - Strong aligned owner:
  - with `request_id` args
  - `PuppetMasterEvent::TierChanged`
  - PuppetMasterEvent::TierChanged
  - `PuppetMasterEvent::IterationStart`
  - PuppetMasterEvent::IterationStart
  - `PuppetMasterEvent::EvidenceStored`
  - PuppetMasterEvent::EvidenceStored
  - `IterationStart`
  - `GateStart`
  - GateStart
  - `GateComplete`
  - GateComplete
  - `EvidenceStored`
  - EvidenceStored
  - Strong owner docs:
  - `hitl_request_id`
  - hitl_request_id
  - Reconcile the base `GraphNode` and `GraphNodeUI` contracts to the later runtime-lineage model.
  - GraphNode
  - GraphNodeUI
  - `Orchestrator_Page.md`
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `3.13` appears twice
  - 3.13
  - `3.14` appears twice
  - 3.14
  - `3.15` appears twice
  - 3.15
  - `DRY_Rules.md` second
  - DRY_Rules.md
  - `Decision_Log.md` third
  - Decision_Log.md
  - `DRY_Rules.md` needs:
  - `Decision_Log.md` needs:
  - `plan_or_tier_default`
  - plan_or_tier_default
  - `Orchestrator_Page.md` needs:
  - mixed-canon owner docs
  - MUST RECONCILE
  - MUST VERIFY
  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2
  - `Plans/_shards/**`
  - Plans/_shards/**
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - 1. Reconcile owner contracts and schemas first.
  - Plans/Decision_Policy.md
  - The rerun confirms that these were not just vague "help gaps", but concrete missing contracts:
  - pressure-summary field
  - Plans/Crosswalk.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Executor_Protocol.md
  - execution_unit_context
  - ### 5.1B Persona/Runtime Snapshot Payload Contract
  - gap-001
  - requested_account_binding
  - requested_account_policy
  - operational_identity
  - cov-034
  - obl-016
  - active
  - acknowledged
  - resolved
  - dismissed
  - resolution_kind
  - accepted_risk
  - `working_ledger.md:L806`
  - working_ledger.md:L806
  - `working_ledger.md:L1030`
  - working_ledger.md:L1030
  - `working_ledger.md:L1035-L1036`
  - working_ledger.md:L1035-L1036
  - `working_ledger.md:L1283-L1290`
  - working_ledger.md:L1283-L1290
  - `working_ledger.md:L1539`
  - working_ledger.md:L1539
  - `working_ledger.md:L3070-L3092`
  - working_ledger.md:L3070-L3092
  - `working_ledger.md:L3170-L3182`
  - working_ledger.md:L3170-L3182
  - `working_ledger.md:L5990-L6015`
  - working_ledger.md:L5990-L6015
  - `working_ledger.md:L6442-L6490`
  - working_ledger.md:L6442-L6490
## Canonical owner-section requirements


These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Owner-first canonicalization order


### Requested/effective account identity contract


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
### Shared governance/runtime record envelope


### Concern record family definition


### Concern lifecycle and resolution kinds


### Concern action policy and authority model


### Concern linkage to adjacent families


### Promotion classes and gate evidence


### Historical semantic consistency


### Coverage blocker concern lifecycle owner section
### Concern owner vs creator vs resolver separation


### Concern source-event vs record vs projection split


### Runtime attribution ownership split


### Approval scope key and approver identity


### Concern update heuristics


### Route/open compatibility-only fallback marking


  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - allowed_actions[]
  - Base route/open primitives landed, but missing:
  - Route/open auditing must stay focused on **refinement omissions**, not on re-claiming absence of primitives that already landed.
### Recommended minimum concern record shape


### Concern ownership / authority direction


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- CANONICAL CONTRACTS

Purpose:
- This file is the single source of truth for core, cross-cutting **contracts** referenced by other plan documents.
- Keep it DRY: define only stable envelopes + type contracts; other plans reference these contracts instead of redefining.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- Use "Puppet Master" naming consistently throughout this document.
-->

## 0. Scope
This document defines the canonical contracts for:
- Persisted event envelopes (`EventRecord`, schema `pm.event.v0`)
- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers
- Provider normalized stream (CLI-bridged, server-bridged, and direct-provider transports)
- UI commands (`UICommand`)
- Auth state + events (`AuthState`, `AuthPolicy`, `AuthEvent`)

Other plans MUST reference these contracts rather than redefining them.

ContractRef: ContractName:Plans/Contracts_V0.md

## Cross-surface runtime, concern, and route/open contracts


This section is the single canonical owner for runtime identity, concern/episode lifecycle, route_target primitives, and OpenSubject routing semantics across all surfaces and execution contexts.

### Canonicalization order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.
- The canonicalization sequence in this owner section is strict: canonical owner repairs first, dependent consumer updates second, mirror cleanup third, and final verification evidence last.
- Owner-before-consumer rule: when the canonicalization map calls for same-heading replacement or stale-residue retirement, owner-doc correction remains mandatory before consumer cleanup.
- The owner-doc integrity stack is ordered, not three isolated docs: `Crosswalk.md` first for primitive/term routing, `DRY_Rules.md` second for duplication and SSOT discipline, and `Decision_Log.md` third for durable decision trace. Contract repairs that touch those owners must preserve that order.
- When a verification `re-check` cannot be trusted as one end-to-end read because owner or `/consumer` documents are too large, split it into smaller bounded reviewer slices and reconcile their findings back into this owner-before-consumer sequence before declaring closure.
- For partial-doc verification work, a cleared model-specific tail does not close the owner-correction pass. Continue the ordered later-model sequence, and do not treat the first pass boundary as coverage holes unless reconciled owner and consumer slices prove an omitted contract obligation.

### Shared governance and runtime record envelope

Required shared envelope fields:
- `record_id`
- `record_kind`
- `project_id`
- `scope_ref?`
- `source_refs[]?`
- `artifact_refs[]?`
- `evidence_refs[]?`
- `supersedes_record_id?`
- `superseded_by_record_id?`
- `status`
- `created_at_utc`
- `updated_at_utc?`

Shared actor envelope fields:
- `actor_kind`
- `actor_ref?`
- `execution_role?`

Rules:
- `record_id` and `record_kind` identify the durable governance or runtime record; they are not artifact ids, receipt ids, rendered summary ids, or process report ids.
- `source_refs[]`, `artifact_refs[]`, and `evidence_refs[]` preserve lineage without copying raw source material into the record body.
- Supersession fields preserve historical lineage and do not delete or rewrite the superseded record.
- `actor_kind` is required wherever a record action is attributable; `actor_ref?` stays sparse when the actor is anonymous, external, or intentionally redacted, while `execution_role?` carries runtime role when the actor participated through execution.
- New first-class Orchestrator object families reuse this envelope and the shared status/lineage conventions; `feature_seam`, `work_package`, `lane`, `promotion`, `review`, `resolution_thread`, `concern`, `graph_patch`, and `worktree` remain canonical records rather than adapter-local summaries.
- Family-specific payloads specialize under the shared envelope; they must not invent one-off top-level shapes when a subordinate payload block can carry the family-specific fields under the canonical record identity, status, provenance, and lineage fields.


- Define one shared record envelope with canonical lineage refs and artifact/evidence refs.
- Keep record objects distinct from artifacts and rendered summaries.
- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.
- Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Let Contracts_V0 own cross-family attribution packet shape.
- Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins.
- Temporal records that affect receipts, blocked states, stream sessions, or recovery MUST carry typed wait/timeout fields in the shared envelope rather than burying them in rendered summaries. The shared envelope admits `timeout_class?`, `wait_state_class?`, `observation_state?`, `source_timer_ref?`, `retention_anchor_kind?`, and `retention_anchor_at_utc?` when applicable.
- Let storage-plan own the persistence mechanics for crash-critical active receipt/session lifecycle, blocked episode creation/resolution, follow-mode intent, last inspected run/node/log context, and retention anchors for receipts, log tails, watch buffers, explorer snapshots, and stale caches.

### Requested/effective account and execution identity


  ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md, Primitive:RuntimeIdentity

### Requested/effective runtime identity field split

Required rules:
- Preserve `requested_persona` and `effective_persona` as canonical shared runtime identity fields.
- Add requested_account_id alongside requested_account_policy
- Add requested_account_binding and govern provider_account_id as subordinate provider-native metadata
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Model requested_account_id separately from requested_account_policy
- Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Carry execution_role plus requested/effective operational identity in shared runtime identity
- Project them into effective-resolution, attempt, usage, and inspector surfaces

Canonical field split:
- `requested_persona` and `effective_persona` are persisted core runtime identity fields. `_id` variants such as `requested_persona_id` and `effective_persona_id` are retired from canonical contracts and may survive only as migration/source-lineage aliases.
- `requested_account_id` is the explicit requested account anchor; `requested_account_policy` remains the policy selector used before effective resolution and MUST NOT replace the concrete requested account field.
  ContractRef: Primitive:RuntimeIdentity
  ContractRef: ContractName:Plans/Contracts_V0.md
- `requested_account_binding` is the canonical binding posture with `none | preferred | required` semantics.
- `effective_account_id` and `effective_provider_identity` disclose the resolved runtime account without rewriting the requested selection.
- `provider_account_id` is retired as canonical/live identity vocabulary and may survive only as subordinate provider-native metadata inside bridged-provider envelopes.

Projection/display rules:
- Runtime, effective-resolution, permission, attempt, usage, and inspector surfaces all project Requested account / Requested binding / Effective account / Switch reason from the same shared runtime identity snapshot.
- Shared runtime identity carries `execution_role` / `actor-role` together with requested/effective operational identity so downstream audit, approval, and attribution joins keep the same intent-versus-effective split; the actor envelope is not `run-centric` and must follow the shared runtime/governance record envelope across attempt, usage, approval, and inspector consumers.
- Bridged-provider and permission envelopes preserve the same requested/effective account pair instead of collapsing them into provider-native identifiers or policy-only selectors.
- orchestrator-related docs and payloads that consume this contract must preserve requested/effective provider/model/effort/persona/account wording, including the compact `/model/effort/persona/account` disclosure shape where a UI surface needs a single grouped label.
- Gemini account resolution uses the same shared requested-vs-effective identity contract: the compact `/model/auth` display shorthand must still preserve account selection, switch reason, concrete auth mode, and `vs-effective` differences. A Gemini family may contain multiple API-key accounts and multiple OAuth accounts simultaneously; OAuth-backed Gemini entries may require `project-context` and `/project` quota resolution beyond token presence. Provider grouping may expose one Gemini family surface or `/provider` card for mixed accounts, but it must not mint fake API-key/OAuth `pseudo-providers` that compete with the real runtime entries.
- Usage/account pressure that blocks execution carries `monthly_plan_or_billing_cycle` and any provider `cooldown_until` facts in the runtime identity/pressure envelope rather than hiding the reset horizon in prose.
- `requested_provider_family_id`, `effective_provider_family_id`, and connection-profile fields are additive requested/effective runtime fields; they do not replace `requested_account_id`, `effective_account_id`, or account terminology in cross-provider contracts.
- `selectable_unit_id` is resolver/debug identity for the chosen runtime candidate. It MUST NOT replace `account_id` in user-facing copy or persisted canonical auth/routing fields; `/routing` payloads keep account identity stable and may add selectable-unit evidence only as subordinate resolution detail.
- OpenCode UI may label server-backed configuration as `Server Profiles`, but cross-provider requested/effective runtime records keep `account` for account-backed subjects and add connection-profile fields for server/profile-backed subjects instead of globally renaming account vocabulary.
- Agent/runtime account isolation uses fresh `XDG_` / `XDG_*` roots where the platform supports them; `CURSOR_USER_DATA_DIR` alone is not sufficient evidence that a Cursor-backed agent account is isolated or that `cursor-agent` will report a different logged-in identity.
- Runtime routing and execution consumers must retain the same `object-family`, lane/package/seam `execution-model`, `route_target`, `UICommand`, `OpenSubject`, blocked-episode, and `HITL` anchors when they project the shared identity envelope into owner and consumer docs.

### Runtime lineage, route, and blocked-state closure

Wizard, interview, Source Control, and worktree handoff payloads are high-risk runtime lineage consumers. `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `chain-wizard-flexibility`, `chain-wizard-flexibility.md`, `interview-subagent-integration`, and `interview-subagent-integration.md` consume the shared contract rather than owning alternate identity. Interview and wizard payloads must not reintroduce `tier_id = None`, `interview-phase-*`, `pseudo-tier`, or `tier_id` as canonical routing keys; these are migration/source-lineage aliases only. Pre-run `/CUP` and `/quality` correction must not leave the downstream payload `lineage-thin`, self-contradictory about `Contribute(PR)`, or dependent on `stable-branch`, `base_branch`, `git-hook`, filesystem rediscovery, or ad hoc state files in place of `project_id`, thread `/report` identity, `/account`, `/runtime`, `/effective`, `/projection`, `worktree_record`, and `worktree_projection` lineage.

Priority-1 cleanup docs that cannot safely coexist with the new model unless aligned to this shared runtime contract are `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`), `Plans/Executor_Protocol.md` (`/Executor_Protocol.md`), `Plans/Contracts_V0.md` (`/Contracts_V0.md`), `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`), `Plans/WorktreeGitImprovement.md` (`/WorktreeGitImprovement.md`), `Plans/plan_graph.schema.json` (`/plan_graph.schema.json`), and `Plans/project_plan_node.schema.json` (`/project_plan_node.schema.json`).

Graph and runtime object schemas must carry explicit package/seam/lane IDs before they are used for execution recovery or promotion decisions. `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`, `/plan_graph.schema.json`, `/project_plan_node.schema.json`, and `/project_plan_graph_index.schema.json` must not remain node-only or `/seam/lane`-blind when representing `/contaminated/restore-required`, safe-point, contamination, promotion, and requested `/effective` execution identity. Schema constants that cannot express package/seam/lane/worktree/account IDs are compatibility fields, not the canonical runtime object family.

When older audit notes ask for `/node/seam` IDs, the canonical owner shape is explicit node/package/seam/lane IDs plus `/package/seam` lineage, so node-local execution and seam governance can be joined without reviving tier-shaped identifiers.

Runtime event rows that affect execution, usage, or recovery must carry the shared identity snapshot rather than a compatibility-era subset. `run.started`, `usage.event`, `/Run`, `/UI`, `/attempt`, and `/effective` consumers in `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, and `storage-plan.md` must preserve `/runtime/auth/account`, requested/effective persona/runtime/auth/account, and snapshot references for `/consumers`; enumerated event tables may point to a `requested_effective_snapshot_ref?` only when that referenced record is the canonical complete snapshot.

`EventRecord` / runtime alignment claims are incomplete unless the schema carries project/thread/run/attempt/account identity directly or by canonical snapshot ref; owner docs must not claim runtime alignment while omitting those join keys.

Orchestrator and Source Control projections preserve requested/effective identity across `Orchestrator_Page`, `Orchestrator_Page.md`, `live-status`, `/switch`, `/model`, `/account`, `project_id`, cross-surface, and multi-project routing. Legacy `requested_persona_id` and `effective_persona_id` names are forbidden canonical names and may appear only as migration aliases to `requested_persona` and `effective_persona`; account policy, account selection, switch reason, and project-scoped derivation must remain visible when live-status or command pivots resolve identity.

Artifact, HITL, and tool-denial surfaces must converge on the same blocked episode and runtime action contract. `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `human-in-the-loop`, and `human-in-the-loop.md` must preserve `attempt_id`, `tool.denied`, `HITL`, `human-in-the-loop`, `allowed_action_ids`, and `allowed_action_ids[]`; `allowed_actions` and `allowed_actions[]` are compatibility aliases only where a legacy consumer still maps them into ordered canonical action IDs. Any self-contradiction in those surfaces is scheduler-impacting when it changes pending approval, denial, blocked episode creation, or recovery routing.

Project artifact, validation, and file-management routes use object identity before paths or page-local links. `validation_pass_report` must support pass-level `skipped` outcomes instead of `/fail-only` pass/fail assumptions; `project_id` is not a nice-to-have because per-project `/search`, `/runtime`, `/worktree`, and `/evidence` indexing depend on it. `OpenFile { path }`, `OpenFile`, `path-open`, page-local links, and `/alias` wrappers must normalize to open-by-identity, `route-target`, `route_target`, `OpenSubject`, `command_kind`, `target_kind`, `object_kind`, `object_kind = usage_event`, `inspector_target`, route validation, scoped-resolver rules, and `normalizes_to_contract` before any runtime/generated artifact becomes addressable. Owner-doc consumers include `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/UI_Command_Catalog.md`, `Plans/assistant-chat-design.md`, `Plans/Crosswalk.md`, `Plans/FileManager.md`, `/FinalGUISpec.md`, `/storage-plan.md`, `/usage-feature.md`, `/UI_Command_Catalog.md`, `/assistant-chat-design.md`, `/Crosswalk.md`, and `/FileManager.md`.

`Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, and `/Contracts_V0.md` are the practical runtime/UI SSOT for execution, blocked states, `/handoff`, `/recovery`, terminals, and event families. `AttemptJournal` and handoff payloads must not remain `/iteration-shaped`; `/package/seam/lane/promotion`, `/lane-aware`, first-class package/seam/lane identity, package overseer authority, seam overseer authority, `/UI`, `/effective`, and `HITL` scope must replace tier-boundary ancestry when these docs project execution identity.

The package/seam/lane/promotion object family is defined canonically through those runtime object records and route object kinds. `GPT` audit attribution surfaced this owner gap, but live canon is the package/seam/lane/promotion object family plus its package-overseer, seam-overseer, lane, promotion, and status/lineage fields.

`package-overseer-only` responsibility is bounded local execution supervision, package-level worker dispatch / review cadence, and package-local remediation recommendations. Cross-package promotion, seam governance, durable route identity, and global remediation policy stay outside package-local authority unless the package overseer receives an explicit higher-scope decision.

Blocked-state GUI commands map from canonical action identity, not local button vocabulary. `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `cmd.runtime`, `cmd.runtime.*`, `blocked-state`, `GUI`, chat, graph, and orchestrator consumers must derive buttons from `allowed_action_ids` and `allowed_action_ids[]` and keep `/gating/fallback`, `account_pressure_episode`, `requested_account_binding`, requested_account_id, `operational_identity`, `account_switch_event`, `projection_freshness`, and `projection_health` in the `/detail` or inspector payload when those facts explain why an action is available, blocked, or degraded.

Canonical record/help anchors are part of route and runtime identity. `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md#Canonical records`, `Plans/Glossary.md`, `Plans/Glossary.md#Orchestrator rewrite terms`, `/storage-plan.md`, `/Orchestrator_Page.md`, `/Glossary.md`, `/help`, `/open`, `help-entry`, blocked-action, blocked-episode, runtime-identity, `/receipt/account-history`, `wave-one`, `exact_items`, `Canonical records for this feature set`, `Canonical records`, `canonical_record.v1:{project_id}:{record_id}`, `canonical_record`, `record_id`, `gap-003`, `gap-006`, and `projection-health` are canonical anchor/consumer obligations, not optional prose labels. Broken consumer references to those anchors must resolve through owner headings or equivalent route/open aliases before history, concern, receipt, or help surfaces claim the records are discoverable.

Glossary/Crosswalk routing and `/term` ownership provide the stable landing place for later reconciliations: `/Crosswalk` names the owner primitive or contract route, while Glossary term entries define vocabulary without becoming alternate runtime, route, or record owners.

Storage and projection backbones are package-aware and must not retain `/tier/session/thread` as their primary runtime scope. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/assistant-memory-subsystem.md`, `/storage-plan.md`, `/usage-feature.md`, `/assistant-memory-subsystem.md`, `/package`, `/seam`, `/worktree`, `/projection`, and `AutoRunBoundary` consumers carry package/seam namespaces, lane/worktree state, contamination events, package-aware usage attribution, and node/package execution semantics before any storage or projection record falls back to tier, session, or thread scope.

Storage families must not stay attempt/block/usage-centric when the rewrite depends on lane/worktree/concern/project-attention-centric objects; attempt, blocked, and usage projections remain valid only when they join to lane/worktree/concern/project-attention identity rather than hiding it.

Compatibility adoption is explicit: `HITLRequest`, `request_id`, `run.tier_`, `run.tier_*`, `/compatibility`, and `/navigation` are lineage or lookup metadata, not peer canonical approval or runtime snapshot identity. `route_target` and `OpenSubject` own navigation identity; `wizard.blocked` and `remediation.resolved` reconcile to one field contract each; `selection_rule`, `tier-rooted` graph-schema breadcrumbs, `/event/envelope`, `/seam/lane/worktree/account`, safe-point, and blocked-payload contracts must carry package/seam/lane/worktree/account identity before producers persist runtime or recovery events.

Worktree/lane binding and requested/effective account/runtime identity are mandatory parts of canonical execution context, not optional downstream embellishments. Runtime records that carry `/lane`, `/runtime`, or `/effective` facts must preserve worktree/lane binding beside requested/effective account and runtime identity.

Operational surfaces consume this contract across `Plans/FinalGUISpec.md`, `Plans/Run_Graph_View.md`, `Plans/assistant-chat-design.md`, `/FinalGUISpec.md`, `/Run_Graph_View.md`, and `/assistant-chat-design.md`. `phase-grouped` layouts, `/tier` actions, or one-current-task assumptions must not obscure `/worktree/thread` context, blocked episodes, safe-point restore, requested `/effective` identity, or cross-surface attention routing. GitHub auth consumers, including `Plans/GitHub_Integration.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `/GitHub_Integration.md`, and `/GitHub_API_Auth_and_Flows.md`, use per-realm stable account identity and degraded-capability disclosure instead of mutable provider identity alone.

Graph readability is a route/runtime projection contract before it is a local drawing preference. `Plans/Run_Graph_View.md` consumes zoom-dependent label density: far zoom shows structure/state only, medium zoom shows abbreviated/local labels, near zoom shows full labels and richer local annotations, and selected objects still expose strong detail in the right-side inspector regardless of zoom.

Canonical persona and account field names must be traceable end to end. `Contracts_V0`, `Contracts_V0.md`, `attempt.started`, usage, storage, auth, and `/effective/provider/account` surfaces must not normatively revive `requested_persona_id` or `effective_persona_id` after this contract forbids them; those names are field-name compatibility aliases only. Provider/runtime/account seams for `OpenCode_Deep_Extraction`, `OpenCode_Coverage_Matrix`, `OpenCode_Deep_Extraction.md`, `OpenCode_Coverage_Matrix.md`, `Media_Generation_and_Capabilities`, `Media_Generation_and_Capabilities.md`, OpenCode, `media.generate`, mid-run, `/effective`, `session-scoped`, disabled-state, `/stream-owner`, `/observe`, server-global, source-verifies, dual-auth-realm, under-specified `/runtime/account`, concurrent-client, capability-change, runtime-correlation, and `GUI` must preserve requested/effective account disclosure and cannot pretend an unobservable server-global stream is a reconnectable, account-owned runtime without explicit evidence.

Dispatcher and projection safety are runtime contract concerns. `/domain`, `cmd.runtime`, `cmd.runtime.*`, `correlation_id`, `allowed_action_ids`, and `allowed_action_ids[]` require a trace-through into persisted dispatch/domain events; recovery actions are admitted only when the current blocked episode exposes the corresponding ordered actions. `stale-projection` safety uses a canonical revalidation handshake and disable-with-reason `GUI` behavior before mutation, rather than trusting a stale projection or omitting the disable reason.

If a stale or degraded blocked-flow projection previously displayed `allowed_action_ids[]`, the `GUI` must not guess that the old action set is still valid; it revalidates against canonical/current runtime state before execution or disables the action with an explicit projection-health reason.

Child/orchestrator lineage consumers must retire tier-era side files and selectors. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `TierContext`, `TierType`, `select_for_tier`, `tier_id`, `active-agents`, `active-agents.json`, `/effective-runtime`, node-adjacent addenda, tier-canonical body text, tier-rooted execution, and split-brain state files are compatibility/source-lineage only once child-run and execution-unit identity are canonical. `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` consumers must align persona field names before account identity is layered on top.

`Plans/Orchestrator_Page.md` may describe newer blocked/remediation lineage only through the canonical blocked/remediation and route contracts; `TierChanged` and `active tier` are tier-era compatibility labels, not route identity, remediation identity, or runtime ownership.

Widget and ledger projections consume provider-account storage families rather than owning account state. `widget.multi_account`, `settings/multi_account.*`, `/multi_account`, `/account/receipt-aware`, `/account/trust`, `provider_accounts`, `provider_accounts.*`, `tier-era`, `/effective`, switch-history, projection-trust, attempt/account/receipt-aware routing, and receipt-aware filters must route through the canonical provider_accounts family, requested/effective account envelope, and projection-trust contract before a widget, ledger, or Orchestrator summary displays account health or filters history.

Tool and artifact events are runtime contracts when they affect execution, mutation authority, denial recovery, or provider/account routing. `tool.invoked`, `tool.denied`, `/tool`, `/event`, `/event/policy`, `/attempt/actor/account`, and `mutation_capable` records carry the same blocked reason taxonomy and identity envelope as orchestration events. When a tool event intersects Orchestrator execution it is `runtime-attributed`, not merely `analytics-only`, and the record exposes canonical optional refs for `node_id`, `attempt_id`, `lane_id`, `work_package_id`, `feature_seam_id`, `execution_role`, `/runtime`, `/effective`, `effective_account_id`, and `operational_identity`. Tool/artifact linkage must preserve `artifact_id` back to `attempt_id`, resulting artifact refs, and `usage_event_ref` as a secondary `drill-through` anchor rather than the sole evidence trail.

Runtime attribution packets are carried by immutable prompt handoff bundles, `attempt.started`, `attempt_record`, `/dispatch`, and usage/worker-inspection projections when relevant. `tool.invoked` and `tool.denied` are both first-class runtime trace records; `tool.invoked` must not remain under-attributed analytics exhaust when it affects execution, artifacts, receipts, usage, or operational identity.

Wizard and interview handoffs inherit the runtime identity grammar before they emit artifacts. `Plans/chain-wizard-flexibility.md`, `/chain-wizard-flexibility.md`, `pre-run`, and `/artifact` payloads must not stay `under-keyed` relative to the adjacent event/artifact contracts. `interview-subagent-integration`, `interview-subagent-integration.md`, `/effective`, and `/provenance` records keep `source_stage`, `source_phase_ids`, `source_phase_ids[]`, `persona_id`, `provider`, `model`, `timestamp`, `execution_role`, requested/effective account fields, and `execution-governance` evidence together so downstream handoff consumers do not lose runtime authority context.

Route/open and command metadata use the shared route primitive instead of path or panel-local targeting. `Crosswalk.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `route-target`, `subject-open`, `navigation-related`, `route_target`, `OpenSubject`, `OpenFile`, `file-open`, `path-based`, and `resume_url` define how persisted navigation refs normalize to canonical route identity. `Plans/UI_Command_Catalog.md`, `/UI_Command_Catalog.md`, `/open`, `shell_view`, `shell-facing`, `domain_action`, and `navigation_wrapper` consumers classify `cmd.panel.switch` as a pure shell-facing `shell_view` command; object/thread/worktree focus and open commands route through normalized `navigation_wrapper` arguments, while mutating subject commands remain `domain_action`s.

Tier-era event names and cleanup priorities are explicit compatibility obligations. `Plans/storage-plan.md` and `/storage-plan.md` may retain `run.tier_started`, `run.tier_completed`, `run.verification_result`, `run.persona_stage_changed`, `run.qa_cycle_started`, and `run.qa_cycle_completed` as `tier-era` aliases only when the payload resolves into the package/seam/lane execution model. Cleanup work prioritizes exact `ContractRef`, `section-anchor`, and `duplicate-number` repair in owner docs, then `promoted-shell` `command-family` completeness and `persistence-scope` normalization, then `DAE` and `/FileSafe/recovery` canon cleanup, then `OpenCode` `provider-native` SSE correlation with `requested-effective` disclosure.

Concern projections share one record family across operational and audit surfaces. `/governance`, `Seams`, `History`, `Progress`, `Evidence`, and `Ledger` views project the same `concern-record`: `Progress` owns operational attention, `Seams` owns integration and governance routing, `Evidence` owns the `proof-backed` projection, `History` owns lifecycle chronology, and `Ledger` owns exact structured concern projection.

Storage, telemetry, terminology, and event schemas anchor runtime identity with package/seam/lane/account scope before legacy scopes. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/Glossary.md`, `Plans/Crosswalk.md`, `/storage-plan.md`, `/usage-feature.md`, `/Glossary.md`, and `/Crosswalk.md` define `/safe-point/promotion`, `/seam/lane/attempt/work-package`, `/event/envelope/schema`, and `/seam/lane/worktree/account` as canonical ownership surfaces. `/tier/session/thread` and `/model/platform` are compatibility or partial identity lenses; `/effective` execution identity covers account as well as persona/model/platform before runtime, recovery, storage, or telemetry consumers persist the event.

Provider/model controls are execution identity controls, not page-local preferences. `Plans/newtools.md`, `Plans/assistant-chat-design.md`, `/newtools.md`, `/assistant-chat-design.md`, `/model`, `per-run`, `per-thread`, and `/effective` consumers must expose requested/effective execution identity across package, seam, node, and delegated subagent layers rather than reducing the envelope to thread or run settings. `Personas.md`, `Models_System`, `Models_System.md`, `Prompt_Pipeline`, `Prompt_Pipeline.md`, `Contracts_V0`, and `Contracts_V0.md` preserve `requested_account_policy`; when a user pins a `concrete-account`, the requested side is canonical and `bridged-provider` contracts must not treat `/model/persona` as the complete identity envelope.

`Plans/Prompt_Pipeline.md` is upstream of requested/effective identity disclosure across chat, builders, Orchestrator, and storage; scope drift in that owner contract must not leak weaker requested/effective runtime fields into downstream projections.

Bridged provider and transport contracts disclose account authority across the bridge. `CLI_Bridged_Providers`, `CLI_Bridged_Providers.md`, `Provider_OpenCode`, `Provider_OpenCode.md`, `Provider_Stream_Mapping_External_Reference_A2A`, `Provider_Stream_Mapping_External_Reference_A2A.md`, `/account`, `/effective`, and `effective-account` consumers must carry requested/effective auth and account fields in request, persistence, usage, diagnostic, and stream-mapping envelopes. `Permissions_System`, `Permissions_System.md`, `/runtime`, `multi-lane`, `/multi-actor`, `server-global`, `always`, `reject-cascades`, and `account-switch` rules must scope approvals, rejection cascades, and server-global streams to the active lane/actor/account snapshot and invalidate permission snapshots when account changes can alter tool availability.

Event-schema precision is mandatory wherever runtime identity appears in tables or examples. `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `run.started`, `usage.event`, `hitl.*`, `config-validation`, `safe_point`, `safe_point.created`, `scheduler.pass`, and `remediation.resolved` rows must not `under-specify`, `mis-key`, or preserve `multi-addendum` field drift for runtime identity or execution anchors. Every `event-table` either inlines the canonical runtime snapshot fields or normatively references the shared snapshot object so table readers cannot `under-implement` package/seam/lane/account requirements.

Gate/evidence contracts align the evidence schema with actual gate outputs expected by `GATE-011` and `/GATE-012`; a `GATE` claim is valid only when the schema can encode the produced gate output, otherwise the claim is reduced to the encodable result.

Resume, run-graph, and command consumers keep account trust and worker identity visible. `Plans/GitHub_Integration.md`, `/GitHub_Integration.md`, `/account`, and `trust-state` flows normalize commands and bind resumed flows to project/account trust before rehydrating state. `/Run`, `/use`, `/receipts`, `/verifier`, `attempt_id`, `usage_event_ref`, `/skipped`, `tier_id`, and `_persona_id` consumers must replace stale worker identity names with auth mode, account, project context, switch reason, and applied/skipped control visibility before graph/use pivots or verifier projections claim runtime identity is complete.

HITL and tool-event contracts retire request-local and analytics-only eras into compatibility language. `HITL`, `HITLRequest`, `request-local`, `tier_id`, `tier_type`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are legacy approval vocabulary unless mapped to the `runtime-facing` blocked overlay: `waiting_approval`, canonical `allowed_action_ids`, `allowed_action_ids[]`, `cmd.runtime`, and `cmd.runtime.*`. Tool event tables similarly treat `analytics-oriented` fields such as `tool_name`, `run_id`, `thread_id`, `latency_ms`, `success`, `error`, and `reason` as minimum compatibility metadata, while the `runtime-oriented` `tool.invoked` and `tool.denied` records add `blocked_reason_code`, `failure_class`, ordered `allowed_action_ids[]`, `headless_denied`, and effective permission snapshot evidence whenever scheduler state is affected.

Legacy `HITLRequest` / blocked-flow examples that lean on `tier_id` or `tier_type` are compatibility references only; runtime-facing records use `node_id`, `blocked_sequence`, and attempt-scoped records as canonical execution anchors.

Adjacent command, route, evidence, usage, and storage schemas consume this same identity contract. `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/evidence.schema.json`, `/UI_Command_Catalog.md`, `/Crosswalk.md`, and `/evidence.schema.json` must not define incompatible target or proof records outside the route/open and evidence identity primitives. `Plans/storage-plan.md`, `/storage-plan.md`, `usage_record`, `evidence_record`, `tier-keyed`, and `tier_id` families are compatibility surfaces only until they resolve to package/seam/lane/account execution identity and the canonical record/projection contracts above.

`Plans/storage-plan.md` and `/storage-plan.md` maintain an explicit `same-file` split between early `event-table` / `writer-facing` guidance and later runtime-recovery / `canonical-record` addenda. Readers must treat the latter as the governing canonical record and recovery contract whenever the early table examples still carry legacy tier or writer shorthand.

HITL request identity is compatibility vocabulary unless it resolves to blocked runtime action identity. `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `request_id`, `tier_id`, `tier_type`, `request_kind`, `request_kind = tier_boundary_approval`, `tier_boundary_approval`, and `tier-boundary` restore state are lineage terms only after the runtime contract binds approval state to `blocked_sequence`, `allowed_action_ids`, and `allowed_action_ids[]`. `Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `/recovery`, and `HITL` consumers must present the mixed model as a migration bridge, not as a second approval authority.

Scheduling and handoff schemas use package/seam/lane execution identity before tier or task framing. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `/seam/lane/package-overseer/seam-overseer`, `package-safe`, `ready-set`, `/effective`, `/task/subtask`, `tier-rooted`, and `tier-centric` consumers preserve package-overseer and seam-overseer authority, scored ready-set scheduling, requested/effective account identity, and package-safe remediation lineage. Graph and prompt handoff schemas must not keep `selection_rule = "lexicographic_node_id"` as a `hard-coded` owner rule; `lexicographic_node_id` is only the final tiebreak after the scored tuple, and `selection_rule`, `HandoffMessage`, `ProviderRequestEnvelope`, `prompt-handoff`, `/attempt/safe-point`, `phase_id`, `task_id`, and `/package/seam` payloads must carry node/package/seam identity before recovery or provider handoff.

Graph-native runtime surfaces expose the same identity and governance drill-down. `Plans/Run_Graph_View.md`, `/Run_Graph_View.md`, `/effective`, `graph-native`, `drill-in`, `trust-state`, and `governance-record` contracts must let operators inspect requested/effective identity, account trust, and governance records from the graph rather than relying on distant owner docs. Historical runtime semantics remain durable: `/runtime`, `stale_historical`, `fixed`, `superseded`, `abandoned`, and `replan_required` states keep older attempts, blocked projections, and remediation lineage visible even after the live target disappears or resolution changes the active projection.

Requested identity is carried beside verified/effective identity across downstream integrations. `GitHub_API_Auth_and_Flows`, `GitHub_API_Auth_and_Flows.md`, `GitHub_Integration`, `GitHub_Integration.md`, `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Contracts_V0`, `Contracts_V0.md`, `Run_Graph_View`, `Run_Graph_View.md`, `/runtime`, `/effective`, and `requested identity` consumers must not rely on canonical effective identity alone when the user or scheduler asked for a different provider/account/runtime binding.

One shared requested/effective identity disclosure contract is reusable across graph detail, artifacts, GitHub/auth surfaces, and usage/account-pressure surfaces; consumers may narrow display, but they must not fork the requested/effective identity grammar.

Provider account snapshots use actor envelopes broader than `run_id`. `storage-plan`, `storage-plan.md`, `/account`, `provider_accounts`, `provider_accounts.run_snapshot.{run_id}.{provider_id}`, `run_snapshot`, `project_id`, `actor_kind`, `/chat/interview/wizard/non-run`, `run_id`, `attempt_id`, `thread_id`, `wizard_id`, `interview_id`, `provider_id`, and `/effective` records form a sparse actor envelope for requested/effective runtime and account resolution across run, chat, interview, wizard, and non-run actors.

Account-health and pressure projection is a distinct runtime family, not an overloaded auth-state. `GPT` lineage that identified this pressure resolves canonically into `CLI_Bridged_Providers`, `CLI_Bridged_Providers.md`, `/Orchestrator`, `/runtime`, `auth-state`, `account-health`, `account-pressure`, `/degraded-trust`, `/availability/pressure/cooldown`, and `confidence-aware` records that expose configuration, availability, pressure, cooldown, and confidence without conflating them with login/auth lifecycle alone. `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `/Contracts_V0.md`, `/storage-plan.md`, `/approval`, and `/switch` own canonical blocked/approval identity linkage plus pressure and switch projection families.

Operational identity can be displayed beside provider or account identity, but `/account` ownership remains with the auth/account contract. A UI may show operational identity for clarity, yet it must not imply the same owner, token source, or authority as provider/account identity unless the owning auth contract explicitly says so.

`TierContext` is not a valid dumping ground for execution identity. `orchestrator-subagent-integration`, `orchestrator-subagent-integration.md`, `/view`, `tier_id`, `tier_type`, `title`, `description`, `workspace`, `worktree_path`, `/domain/framework`, `code-review`, `/testing/error`, `/effective`, and `/platform/model` fields must be separated into decomposition/view identity, workspace binding, project heuristics, live execution hints, and requested/effective runtime state before a child run or worker view claims canonical identity.

Tool denial and approval projections use the scheduler-impacting payload, not thinner compatibility rows. `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, and `tool.denied` consumers must not publish thin payloads as sufficient canon when scheduler state changes. `/event` approval records, storage blocked projections, and runtime action routes stay consistent on `blocked_sequence`, `allowed_action_ids`, `allowed_action_ids[]`, and canonical runtime action routing; when applicable, canonical field names include `safe_point_id`, `remediation_root_id`, `remediation_parent_attempt_id`, `blocked_sequence`, `failure_class`, and `blocked_reason_code`.

Output, route, and artifact surfaces inherit runtime/account lineage and route identity instead of local shortcuts. `Plans/Project_Output_Artifacts.md`, `/Project_Output_Artifacts.md`, and `/runtime/account` outputs must carry modern event/runtime/account lineage. `/open`, `route_target`, `OpenSubject`, `OpenFile`, `cmd.nav`, and `cmd.nav.*` share one canonical route target object consumed by specialized focus/open wrapper commands. Runtime artifact attribution remains anchored by `cost_usage`, `usage.event`, `Show in Usage`, and `Show in Ledger`; `/B/C` placement alternatives are historical placement language, not a replacement for usage identity.

Storage, usage, evidence, and summary families stay node-native and execution-context first. `storage-plan`, `storage-plan.md`, `/runtime`, `rewrite-era`, `node-native`, `execution-context`, `tier_runtime_record`, `tier_id`, `cross-surface`, `usage_record`, `/summary`, and `tier-correlated` records must demote stale tier runtime framing to derived compatibility state and stop using tier IDs as the primary cross-surface key for runtime, usage, evidence, summary, Run Graph, or Orchestrator projections.

Subject-first preview and rewrite identity are already canonical enough to consume. `Plans/rewrite-tie-in-memo.md`, `/rewrite-tie-in-memo.md`, `/redb/Tantivy`, `/runtime`, `/account`, `/effective`, `subject-first`, `doc:<document_id>`, `artifact:<artifact_id>`, `document_id`, and `artifact_id` establish preview subject identity and provider/runtime account terminology for downstream Project Output and artifact consumers.

False-positive exclusions stay closed, while operational trust gating remains owned here. `re-open`, `false-positive`, and `already-correct` findings must not reopen existing `route_target`, `OpenSubject`, `command_kind`, `normalizes_to_contract`, `target_kind`, `object_kind`, `inspector_target`, `projection_freshness`, `projection_health`, `account-pressure`, and `account-switch` coverage. The missing transfer is `/gating/fallback` operational trust UI plus schema/contract ownership, including requested/effective account fields in `/storage/schema` contracts where `GPT` lineage surfaced multi-account UX ahead of runtime modeling.

Approval action identity uses one canonical action-ID family. `Plans/Contracts_V0.md`, `Plans/human-in-the-loop.md`, `/Contracts_V0.md`, and `/human-in-the-loop.md` consumers must not wire blocked action IDs from both `allowed_actions[]` and `allowed_action_ids[]` as coequal canon; `allowed_actions[]` is compatibility vocabulary, while ordered `allowed_action_ids[]`, `allowed_action_ids`, `blocked_sequence`, and `detail_ref?` are the runtime action source. Event tables, GUI button rows, and `*_ref` fields must use explicit identity fields and canonical event fields rather than GUI-only aliases.

Usage, storage, widget, and Orchestrator projections consume provider-account sourcing from the shared runtime contract. `Plans/usage-feature.md`, `Plans/storage-plan.md`, `Plans/Widget_System.md`, `Plans/Orchestrator_Page.md`, `/usage-feature.md`, `/storage-plan.md`, `/Widget_System.md`, and `/Orchestrator_Page.md` must not leave lane/package/remediation or `/package/remediation` dimensions `under-modeled`; concern, review, promotion, corroboration, graph-patch, and recovery records resolve through one `governance-record` envelope for `/reviews/promotions/corroboration/graph-patch/recovery`. `provider_account_id` is a `shadow-identity` risk unless it resolves through canonical `provider_accounts.*`, `project-scoped` account sourcing, requested/effective linkage, switch-history, `projection-health`, `trust-state`, and projection-trust rules rather than page-local heuristics or widget-era tab assumptions with incomplete account identity.

Event-envelope and projected-record families use the same `governance-record` template for concerns, reviews, promotions, corroboration, graph patches, and recovery so those first-class durable objects do not drift into separate summary-only projections.

Route payloads are a first-class internal contract. `route_payload`, `primary_route_payload`, `secondary_route_payload?`, `resume_url`, URL deep links, and in-app command dispatch all decode into the same route model; stored `resume_url` fields are serialized transport forms for portability and must not imply a separate routing ontology. `Plans/Orchestrator_Page.md` may project route-open pivots, but it must not mint forbidden canonical names or panel-local route semantics outside the shared route payload and route target objects.

Widget/page drill contracts use typed route payloads tied to canonical identity/trust/linkage fields, including `/trust/linkage` refs when a drill path depends on trust, account, linkage, or route provenance rather than page-local chrome.

The Orchestrator/Usage/GitHub deep-link story uses route payload/trust contracts before page chrome: `Plans/Orchestrator_Page.md`, `Plans/usage-feature.md`, `Plans/GitHub_Integration.md`, and GitHub/auth consumers must carry route payload, projection-trust, and linkage facts instead of relying on local chrome to make deep links trustworthy.

Runtime identity carries role and operational identity beside provider account identity. Role-scoped pools from storage and `Plans/Multi-Account.md` become auditably explainable only when effective runtime records, usage records, page projections, and graph identity projections preserve `execution_role`, `actor_role`, role-based choice rationale, and role-scoped provenance trace. `Multi-Account.md` lineage, `/namespace`, `/cluster`, and `operational-identity` records distinguish provider account identity from operational identity classes such as GitHub API identity, registry/namespace identity, Kubernetes context/cluster identity, and the normalized kinds `github_api_account`, `registry_namespace`, `kubernetes_context`, plus future provider `/surface-specific` kinds where externally scoped authority matters.

The shared runtime snapshot is the explicit replacement for `TierContext`. Any execution-unit refs, lane/worktree refs, requested/effective runtime identity, execution role, governance lineage, remediation generation, or `/replan` generation formerly packed into tier context must resolve into the package/seam/lane/account runtime snapshot, with compatibility references to `TierContext`, `tier_id`, and tier-era execution kept only as historical trace.

Recovery command and wake semantics stay keyed to blocked runtime state. `UI_Command_Catalog.md`, `UI_Command_Catalog`, `HITL`, `cmd.runtime`, `cmd.runtime.*`, and pre-attempt blocked episodes map canonical recovery from `allowed_action_ids[]` to runtime commands; pre-attempt blocks are keyed by `blocked_sequence` instead of fabricated `attempt_id`. The canonical blocked field family is `node.blocked`, `node.unblocked`, `blocked_reason_code`, `blocked_sequence`, ordered `allowed_action_ids`, `allowed_action_ids[]`, `node.prerequisite_resolved`, and `wake_reason = approval_resolved | clarification_resolved | auth_recovered | startup_recovered | ...`; old HITL request examples are compatibility references only when they resolve into that family.

`blocked_sequence` is monotonic per `{ run_id, node_id }`, starts at `1`, and increments only when the node transitions from non-blocked to a new blocked episode.

Execution-core and handoff consumers must align on the shared runtime identity envelope before local structs claim ownership. `WorktreeGitImprovement.md`, `Executor_Protocol`, `Executor_Protocol.md`, `chain-wizard-flexibility`, `chain-wizard-flexibility.md`, `interview-subagent-integration`, `interview-subagent-integration.md`, `orchestrator-subagent-integration`, `orchestrator-subagent-integration.md`, `/PR`, `/source-control`, `/lifecycle`, `/role`, `/subtask`, `/corroboration`, `wizard_id`, `run_id`, `tier_id`, `extract_tier_id`, `wake-reason`, `execution-core`, `load-bearing`, `blocked-handoff`, and `/node-named` records must resolve reviewer/corroboration actor lifecycles and lane/package/seam/account/role identity through `/package/seam/account/role` and `/effective` rather than through tier-shaped crew structs or incomplete wake-reason sets.

Effective runtime identity ownership is split by field family, not by whichever feature emits first. `orchestrator-subagent-integration`, `orchestrator-subagent-integration.md`, `/view`, `tier_id`, `tier_type`, `has_errors`, `needs_testing`, `execution-state`, `workspace`, `/domain/framework`, `/platform/model`, and requested/effective persona/platform/model hints remain decomposition, workspace, and live execution-state inputs until the `Plans/Prompt_Pipeline.md` and `/Prompt_Pipeline.md` effective-resolution field family defines which requested/effective runtime identity fields exist and what they mean. `newtools.md`, `assistant-memory-subsystem`, `assistant-memory-subsystem.md`, and `/event` producers may emit supporting command or event families only after the canonical owner registers the shared event/runtime fields.

Runtime artifact and navigation contracts share common fields without overloading route identity. `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, and `runtime-artifact` use one common field contract for artifact envelopes. `cmd.nav`, `cmd.nav.*`, and equivalent wrappers route through `route_target` without forcing every consumer doc to restate the route model. Destination-only state such as `/view-state`, `active_subview`, `surface-local` tabs, `line`, and `range` belongs to persisted shell/view state or `OpenFile`, not to `route_target`; `OpenFile` may carry `line` and `range`, while base route identity stays limited to selector and scope fields.

Runtime artifact envelopes keep artifact-family distinctions while consuming the shared attribution packet instead of artifact-local identity alone. Artifact payload metadata includes `created_at_utc`, `summary?`, `detail_ref?`, `content_ref?`, and `source_surface?`; surviving `task_id` language in an artifact packet is compatibility metadata unless it is bound through node/package/seam/lane-native execution context.

The bounded `route_target` selector rule is explicit. `Contracts_V0`, `Contracts_V0.md`, `route_target`, `subject_id`, `object_kind`, `object_id`, and `target_kind` define target selection and host-surface routing as separate concerns: a route target selects by `subject_id` or by `object_kind` plus `object_id`, never both as independent primary selectors for the same target. `target_kind` is not object identity and not shell persistence state; it tells the router what class of surface must host the target after scope restoration and target selection are applied.

Stable target kinds are required for rewrite-era object families even when older Orchestrator, FileManager, or path-opening docs still pivot by `run_id`, `tier_id`, or file path. `node`, `attempt`, `scheduler_pass`, `blocked_episode`, and other rewrite-era objects are first-class navigation targets through `object_kind` + `object_id`; stale `tier_id`, run-only, or file-path pivots are compatibility inputs only when they normalize into `route_target`.

Chapter 7 owns the route/open collapse before wiring tables consume it. `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `route_target`, and `OpenSubject` must be canonical sections before `WiringEntry` references them. `Contracts_V0`, `Contracts_V0.md`, `/open`, `HITL`, request-centric HITL identity, `allowed_actions`, and `allowed_actions[]` collapse into blocked runtime identity: ordered `allowed_action_ids`, `allowed_action_ids[]`, named `route_target`, `OpenSubject`, and one remediation resolution enum family are the shared runtime canon.

Attempt, preview, and receipt identity remain subject-first and attempt-native. `preview_subject_id` supplies restore identity; `orchestrator.receipt.{run_id}.{attempt_id}` and `orchestrator.receipt` are `attempt-native`; provider-account policy plus requested/effective `/effective` identity fields are the governing runtime snapshot for receipts, previews, and downstream consumer docs.

Command catalogs and graph projections consume contract-owned runtime and route primitives. `UI_Command_Catalog.md`, `UI_Command_Catalog`, `/UI`, `Progress`, graph-local `HITL` approval commands, `layout/UI state only` pivots, per-command `command_kind`, normalization metadata, and `navigation-family` rules must demote graph-local or layout-only behavior unless it maps to runtime commands, route targets, or Orchestrator-hosted `Progress` widgets. `Plans/UI_Command_Catalog.md` and `/UI_Command_Catalog.md` entries carry per-command `command_kind` and normalization metadata before a command family is treated as canonical navigation.

Run graph and event projections expose the same runtime state without stale tier or persona field drift. `Run_Graph_View`, `Run_Graph_View.md`, graph detail, usage pivots, `/attempt/runtime`, `/verifier`, stale `hitl_request_id`, `View in Tiers`, `tier_id`, worker/verifier identity, `Contracts_V0`, `Contracts_V0.md`, `Orchestrator_Page`, `Orchestrator_Page.md`, `_persona_id`, and runtime-facing worker identity fields resolve through requested/effective disclosure and the allowed persona field names. `Progress` may show compact requested/effective live context, while `History` and `Ledger` keep the exact audit trail of requested/effective identity, reason, and source snapshot refs.

`View in Usage` links from `Orchestrator_Page.md` may keep a `run_id` filter as compatibility narrowing, but canonical usage pivots carry richer route context and resolve through `object_kind = usage_event`, canonical usage event `object_id`, project/thread/run scope, and requested/effective runtime lineage rather than a run-only link.

Event naming is shared across runtime and UI projections. Scheduling, execution, review/verification, contamination/recovery, remediation/replan, promotion, `HITL`/escalation, worktree/lane, `/lane`, `/replan`, `/recovery`, `/escalation`, `/verification`, and effective-resolution events must be registered in the owner event model before Dashboard, `/Orchestrator/chat`, Orchestrator, or chat surfaces project them. Events may be `runtime-internal` or `operator-visible`, but Orchestrator must not invent a shadow event language outside the shared event family.

Shared record envelopes carry enough refs for audit and projection joins. Good base records include `record_id`, `record_kind`, `schema_version`, `project_id`, `run_id?`, `scope_type`, `scope_id`, `status`, `created_at_utc`, `updated_at_utc?`, `summary`, `summary_kind?`, `detail_ref?`, `source_refs`, `source_refs[]`, `artifact_refs`, `artifact_refs[]`, `related_record_refs`, `related_record_refs[]`, `lineage_refs`, `lineage_refs[]`, `actor_ref`, and `requested_effective_snapshot_refs`; shorter projection summaries may reference the shared envelope but must not silently drop these join fields when the user opens detail.

Worktree cleanup and concern operations preserve runtime ownership. `recover`, `prune`, `/remove`, `active-run`, `safe-point`, remediation lineage, `dirty_worktree`, and `worktree_conflict` are runtime actions or blocked reasons, not trivial delete affordances. Concern operations from `Progress`, `Seams`, `Evidence`, `History`, `Ledger`, and the graph inspector share the same action policy so UI density changes do not weaken confirmation, authority, or auditability.

Concern-action reversibility is a controlled audit field. Each concern action records actor authority, confirmation, rationale, and one reversibility class from `immediate_undo`, `compensating_action_only`, or `non_reversible`; `compensating_action_only` and `non_reversible` require consequence-specific confirmation before execution.

Provider, stream, and route payload adapters round-trip the same runtime snapshot. `Plans/CLI_Bridged_Providers.md`, `/CLI_Bridged_Providers.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, OpenCode, `/account`, `/effective`, `/permission`, `GPT` lineage, model `IDs`, auth/account fields, upstream provider identity ownership, switch attribution, execution-role scoping, lane `/worktree` attribution, `projection-ready` usage signals, and the `dispatch-boundary` all resolve to the shared requested/effective provider-account and operational identity envelope. Stream adapters must preserve canonical requested/effective identity and `blocked-owner` payloads on `round-trip`, including the OpenCode transport-platform versus upstream-provider split.

Scheduler, safe-point, and remediation records use one canonical payload block. `Contracts_V0`, `Contracts_V0.md`, `safe-point`, scheduler payload shapes, remediation lineage, remediation resolution enums, `intra-doc` conflicts, and downstream storage/UI consumers must resolve to one `obviously-canonical` scheduler/safe-point/remediation contract instead of local partial shapes. Approval and recovery schemas use one key strategy: `/recovery`, retained `request_id` values must map explicitly to `blocked_sequence`, and ordered `allowed_action_ids` / `allowed_action_ids[]` remain the runtime action family.

Attention rows, deep links, search, and palette results share the internal route payload. URLs, in-app actions, `/search/palette` results, deep links, and `resume_url` decode to the same route payload rather than separate link semantics. The canonical internal route payload is separate from command `IDs` and may carry `target_kind`, `project_id?`, `workspace_tab_id?`, `destination_surface`, `destination_tab?`, `focused_run_id?`, `historical_mode?`, `thread_id?`, `wizard_id?`, `object_kind?`, `object_id?`, `record_id?`, `artifact_id?`, `attempt_id?`, `lane_id?`, `worktree_id?`, `filter_payload?`, `inspector_target?`, `scroll_target?`, and `focus_behavior?`.

Runtime storage and persistence records carry execution context before tier compatibility. `attempt_record`, `tier_runtime_record`, run-start/runtime snapshot events, `/runtime`, `/persistence`, `auth-account`, `/account/role`, `shared-runtime`, provider-account identity, and `operational_identity` blocks must retain requested/effective auth/account/role fields where those fields become auditable. The canonical replacement execution-context object reconciles node-native keys `run_id`, `thread_id`, `node_id`, `attempt_id`, `replan_generation`, and `scheduler_lane` with stale tier-native keys `tier_id`, `TierType`, `TierContext`, tier-level crews, and tier worktree ownership before downstream docs project execution identity.

Execution ownership fields on that context include `execution_role`, `scheduler_lane`, `manual_priority?`, `safe_point_id?`, and remediation lineage refs when those facts control scheduling, recovery, or handoff priority.

That execution context is strict enough to support scheduler dispatch, worker spawn, safe-point creation/restore, retry/remediation lineage, approval/recovery targeting, and UI inspection/audit without reconstructing those guarantees from loose prose.

Schema-level runtime promises require the shared identity fields to be present, not implied. Any UI/runtime promise that depends on `/runtime`, `attempt_id`, `blocked_sequence`, account identity, execution-role, or shared-runtime persistence must reference the canonical snapshot fields directly, including provider-account identity, operational identity, `/account/role`, and the execution-context object, so later implementations do not reconstruct those fields from prose.

Validation and artifact attribution inherit the shared runtime identity envelope. Validation-pass reports require at least `provider` and `model` for compatibility, but provider-using artifacts must still expose the fuller requested/effective `/effective` runtime identity when the artifact participates in account, usage, or routing audit. `Contracts_V0`, `Contracts_V0.md`, `tool.denied`, `tool.invoked`, and `runtime-artifact` records share one attribution family whenever scheduler state, runtime action state, or generated artifact state is affected; a stricter `tool.denied` payload must not coexist with thinner `tool.invoked` or runtime-artifact projections that drop node, attempt, actor, account, or runtime snapshot joins.

Route activation uses the same canonical target model across search, attention, artifacts, and opens. A `search-result`, `attention-item`, artifact `Show in *` action, usage pivot, and wrapper `/open` command normalize through `route-target` / `route_target` rather than through ad hoc surface behavior. `OpenSubject` is the identity-native open contract: it requires `subject_id`, resolves through canonical subject/open rules, and may realize as a workspace document, transient `generated://` buffer, or routed non-editor surface. Initial `subject_id` families must remain narrow and explicit, while the `object_kind` enum family is controlled contract vocabulary with room for later governed extension.

Persisted destination state is subordinate to the requested route target. `/view-state` owns `active_subview`, filters, compare targets, pinned selections, destination tabs, and similar surface-local state, but those fields must be overridden when reuse would land on the wrong object, hide the requested target behind the wrong tab or `/subview`, or silently keep the user on a stale run `/thread/project` context. `cmd.orchestrator.open_in_source_control` must land in Source Control with the relevant run `/worktree/repo` context available; it may reuse a remembered Source Control subview only when that subview still clearly exposes the requested target.

The route/open split is structural. `route_target` gets the user to the correct app surface, project `/run/thread` scope, object, and focus context, and may reference `subject_id`, `object_kind/object_id`, `object_kind`, `/object_id`, `tab_id`, `inspector_target`, and related scope fields. `OpenSubject` takes the canonical `subject_id` and resolves it to a workspace-backed file or `/document` open, a transient `generated://<artifact_id>` source buffer keyed by `artifact_id`, or another subject-native preview/open path defined by the subject contract; it does not own broad shell routing, panel selection, or the whole `/open` route envelope. When run scope or exact resumption matters, route payloads carry `focused_run_id` plus narrow anchor details such as wizard-step focus rather than relying on remembered shell state.

Usage deep links are object routes, not top-level route aliases. Cost or usage rows normalize through `object_kind = usage_event` and `object_id = <canonical usage event id>`; `usage_event_ref` may remain a storage/projection reference, but it must not survive as a top-level route field that bypasses the canonical `object_kind` and `object_id` selector model.

Route validation rejects invalid-combination payloads before any surface-specific open behavior runs. `route_target` requires `project_id` and one primary selector; it must reject a missing primary selector, competing `subject_id` and `object_kind/object_id` selectors, `object_kind` without `object_id`, `object_id` without `object_kind`, `inspector_target` without an object selector, `tab_id` that conflicts with `target_kind`, `line` or `range` inside `route_target`, and any per-surface state inside `route_target`. `/object_id`, `subject_id`, `object_kind`, `object_id`, `target_kind`, `tab_id`, and `inspector_target` are route contract fields only when these selector rules are satisfied.

Runtime record compatibility must not keep stale tier keys as structural canon. `tier_runtime_record` keyed by `run_id` and `tier_id`, `usage_record` keyed by `run_id`, `tier_id`, `attempt_id?`, and `usage_sequence`, and `evidence_record` keyed by `run_id`, `tier_id`, and `evidence_id` are compatibility shapes that must resolve through the node-native execution-context object before projection. Earlier event examples that center `tier_id` remain historical examples only. Likewise, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `/recovery`, and `HITL` preserve the split between ordered `allowed_action_ids[]` / `allowed_action_ids` recovery actions and request-era `request_id`, `allowed_actions`, and `allowed_actions[]` records; `HITL` request-era identity is lineage/compatibility metadata, not a peer runtime action key.

Rewrite-root and Crosswalk routing guidance must consume contract-owned primitives instead of under-route ownership. `00-plans-index.md`, `plans-index`, `Decision_Log.md`, `Decision_Log`, `rewrite-tie-in-memo.md`, `rewrite-tie-in-memo`, `/effective`, `rewrite-era`, and `/Packages/Overseers` decisions must record Seams, Packages, Overseers, requested/effective identity scope, operational identity classes, and Crosswalk-based owner precedence without treating those index or decision docs as route owners. `Plans/Crosswalk.md` and `/Crosswalk.md` may publish top-level primitive guidance only when it points back to contract-owned `route_target` and `OpenSubject`; stale `Primitive:WidgetCatalog` / `WidgetCatalog` claims about `Orchestrator widget tabs`, stale `Primitive:OrchestratorPage` / `OrchestratorPage` claims about six tabs with `Tiers`, duplicate `3.13`, `3.14`, or `3.15` anchors, and headings after `## References` must not be used as deterministic ownership anchors.

Tool, usage, and page projections must not shadow runtime contract ownership. `Plans/Tools.md`, `/Tools.md`, and `tool.invoked` records are analytics-thin unless they carry the richer attribution packet from the shared runtime contract. Usage already preserves canonical `account_id`; the remaining usage-side `account-history` gap is requested/effective `/effective` identity and runtime-role carry-through, not account identity wholesale. Orchestrator page `live-status` mappings and concrete event sources are projections of canonical runtime contracts; the page layer must consume them without redefining event ownership.

Persisted object and graph schemas use first-class runtime objects instead of tier-shaped shortcuts. The most important persisted object shapes include `attempt`, `lane`, `promotion`, `review`, and `resolution_thread`; graph projections from `Plans/Run_Graph_View.md` and `/Run_Graph_View.md` must replace `TierTree`, `View in Tiers`, `tier_type`, and phase `/task/subtask` grouping with first-class seam `/package/lane` nodes, promotion-class badges, requested/effective `/effective` execution identity, and unified blocked `/recovery` actions. `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `Plans/Project_Output_Artifacts.md`, and `/Project_Output_Artifacts.md` must resolve the `HITL` contradiction between tier-boundary approval and mid-tier approval nodes through this shared runtime object model.

Provider, projection, and identity owner docs deconflict shared runtime fields before consumers persist them. `usage-feature`, `usage-feature.md`, `storage-plan`, and `storage-plan.md` may carry `provider_account_id` only under the canonical provider/account ownership and `/deconfliction` rule; they must not mint a second account key beside the requested/effective identity model. `Plans/Multi-Account.md`, `/Multi-Account.md`, `Plans/Models_System.md`, `/Models_System.md`, `Plans/Prompt_Pipeline.md`, and `/Prompt_Pipeline.md` are companion owners for account, model, and requested/effective naming, while `Contracts_V0` / `Contracts_V0.md` rejects persisted `requested_persona_id` and `effective_persona_id` aliases as noncanonical historical names.

Projection health states use one rebuild/scan vocabulary. `/rebuild`, `/scan`, and `/sections` projections use `current` when caught up enough for normal use, `refreshing` when an old committed projection remains visible while refresh or rebuild runs, `stale` when usable for context but not guaranteed to reflect current runtime truth, `degraded` when a projector or scan partially failed or a dependency signal is missing and some fields/sections are less trustworthy, and `unavailable` when the surface contract cannot currently be answered. `Plans/storage-plan.md` and `/storage-plan.md` table-vs-prose conflicts for runtime identity, usage attribution, receipt ownership, and `/projection` ownership resolve to these contract fields rather than to contradictory local tables.

Projection-health / trust-state records are built from committed projection state, checkpoint refs, and last-updated metadata; mutation gating reads those facts instead of inferring safety from page-local timestamps.

GitHub, stream, and multi-account projections carry account and blocked-owner context across boundaries. `Plans/GitHub_Integration.md` and `/GitHub_Integration.md` bind project-scoped repo/account selection, `/account`, `project-scoped` trust, `degraded-trust` signaling, and `blocked-episode` recovery linkage to the shared concern and runtime model. Stream `usage` events must carry account attribution; `auth_state` carries pool-member account context for failover rotation; `input_required` and `input_provided` distinguish node `HITL`, corroboration pause, and conversational user-input pause. `Plans/Multi-Account.md`, `/Multi-Account.md`, `/failover`, and per-interaction attribution preserve switch/failover reasoning so streams do not erase multi-account provenance.

Normalized provider streams disclose actor class and governance transitions. Stream envelopes include `actor_kind`, actor-class, package `/seam/lane` context, and `/overseer` relationships when handoff or speaker selection affects governance. `handoff` events must not use bare agent names without package/seam/lane context, and `SelectSpeakerEvent` must not be demoted to `raw_observation` when it carries governance-relevant speaker or overseer transitions for downstream projections.

Project and model projections stay deterministic outside raw shell UI state. `projects:v1` owns the canonical `project-summary` projection alongside project records rather than embedding that summary inside raw shell UI state. `Plans/Models_System.md`, `/Models_System.md`, `/effective`, transport naming, and `/upstream` naming must distinguish transport platform from upstream model/provider identity so requested/effective identity remains deterministic.

Model, provider, and permission snapshots must split transport identity from upstream provider identity before any requested/effective renderer persists the result. `Models_System` and `Models_System.md` use `provider_id` only after distinguishing transport host identity, upstream provider identity, and model/provider naming; `/effective` renderers must not collapse those vocabularies. Rewrite-era permission snapshots under the `SSOT` carry requested/effective capability truth, requested state, downgrade reason, effective account, and actor `/surface` context, not only resolved or effective values.

Account binding and actor-role projections preserve the runtime choice that produced an effective account. Account `/routing` binding values are `none` when no concrete account is requested and policy routing chooses from the eligible pool, `preferred` when a concrete account is requested as a preference and fallback remains allowed, and `required` when a concrete account is pinned and fallback must surface a blocked or explicit override failure. Runtime snapshots, usage records, and surface payloads carry `/role`, `execution_role`, `actor_kind`, role-scoped pools, and requested/effective account decisions so account selection remains auditable.

Usage and provider health records keep switch lineage without turning current state into durable episode history. `UsageRecord` includes `account_switch_reason` plus a durable switch `/signal` pointer so switch explanations can join History and `/Ledger`; `account_switch_reason` also remains on effective `/runtime` snapshots as `current-run` disclosure. `provider_accounts.health` and `provider_accounts` describe `current-state` health, not durable episode history.

Runtime replacement and worktree projections inherit the canonical snapshot contract. Replacements must not create a parallel `runtime-resolution` schema when existing runtime snapshots already define the contract. `WorktreeGitImprovement.md` and Git `/PR` operations treat `extract_tier_id` and `extract_tier_id()` as migration tripwires, preserve `/node-named` lane worktrees during restart repopulation, and carry the lane lifecycle model, shared worktree projection object, and account identity through Git and PR contexts.

Orchestrator UI and command contracts consume shared runtime primitives instead of minting surface-local owners. `Plans/FinalGUISpec.md` and `/FinalGUISpec.md` consume Orchestrator-page ownership, concern-model UI, historical-run-mode behavior, projection-freshness, and `/health` language from contract health and projection rules. Canonical command families cover account operations, concern operations, and promotion operations, mapping `HITL` `allowed_action_ids` into stable `cmd.*` handlers.

Subagent integration docs are consumers of runtime identity, not identity owners. `Plans/interview-subagent-integration.md` and `/interview-subagent-integration.md` must not claim shared runtime alignment while dropping auth `/account` identity or reintroducing pseudo-tier execution keys. `Plans/orchestrator-subagent-integration.md` and `/orchestrator-subagent-integration.md` likewise may describe active coordination and context construction only as projections; those surfaces cannot be trusted as canonical runtime identity without the shared account, actor, route, and execution-context contracts.

Tool events are shared runtime/audit records before they are Usage widgets. `Tools.md` tool events must explain scheduler blocking, permission `/HITL` behavior, receipts, evidence, cross-surface audit, and why a run used or failed to use a tool under a specific account and `/runtime` context; widget input summaries cannot be the only durable meaning of tool execution.

Worktree and lane lifecycle state is a first-class storage family. Durable contracts include a worktree record, a lane/worktree projection for current state, historical lineage retention after archive/remove, and conflict `/suspect/restoring/archive/remove` lifecycle support. Project UI state such as `selected_worktree_id?` or `selected_worktree_id` is only a selection pointer and is not a substitute for that durable worktree record family.

Approval and restart semantics preserve blocked-state identity across the Contracts, Executor Protocol, and HITL owners. `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/human-in-the-loop.md`, and `/human-in-the-loop.md` jointly own the rule that a `waiting_approval` blocked episode exists first-class in `/state`; when an approval prompt surface needs a stable `request_id`, that `request_id` maps 1:1 to the underlying `{ run_id, node_id, blocked_sequence }`. If restart determines an in-flight attempt cannot resume, that attempt transitions to `stale_historical`; if a blocked prerequisite still exists, the existing unresolved blocked episode remains the actionable state.

Startup recovery handshakes, DAE restart `/intercept` routing, and blocked-owner attribution use the same blocked-episode contract: `/rules` decide whether recovery resumes, retries, or waits, while the owning blocked episode keeps attribution and restart intent visible to Executor, HITL, and stream consumers.

Supporting subsystems register event and command families in canonical owners instead of stranding them in support docs. Memory and live-preview `/build` event families, doctor checks, `ToolIDs`, and `/tool/command` identities belong in the canonical storage, tool, and command contracts. `Run_Graph_View` / `Run_Graph_View.md` projections must not keep `tier_id` as the main per-node correlation key for output filtering, verification event filtering, usage links, copy/open `/open` actions, or event drill-in; they must join through first-class per-node runtime identity. Payload contracts reject route-local `line` / `range`, raw provider/account disclosure fields, and arbitrary per-feature payload blobs unless they are normalized by the shared route, `/account`, and per-feature schema rules.

Navigation and command migration normalize payload semantics without requiring a hard flag day. Existing user-facing wrapper commands may remain during migration, but their payloads normalize through `route_target` and `OpenSubject`; older payload shapes may be accepted, while new producers and `/docs` emit the canonical normalized target model. Route overrides MUST override target object identity, explicit destination surface when the action names a different surface, and scope required to make the target meaningful, including `project_id`, `thread_id`, `focused_run_id`, an explicitly requested panel, and `/tab`.

Route activation may legitimately name which major surface, `/tab/panel`, and project/workspace context should become visible. It must not encode panel widths, floating window coordinates, icon order, or full project-state snapshots; `/workspace` and project context are routing scope, while layout realization stays shell state.

Usage, catalog, and wrapper commands declare route intent instead of hiding object identity in layout state. `cmd.artifacts.show_in_usage` must open/focus Usage in the correct project `/thread/run` scope and may reuse current layout or `/filter` chrome only when the requested usage target is still revealed. `UI_Command_Catalog.md`, `UI_Command_Catalog`, and `/UI` split shell or layout commands from object-targeting navigation commands when payloads carry object identity. Stable domain-facing wrapper and `/open/focus` commands normalize internally to canonical route semantics while the contract layer owns `route_target` and `OpenSubject`.

Alias and resume-url contracts keep migration metadata separate from canonical routing. `alias_of_command_id` belongs to migration `/deprecation` alias handling only; stable wrappers declare `normalizes_to`, `canonical_target_contract`, and `canonical_route_kind` instead of pretending to be deprecated aliases. `storage-plan` / `storage-plan.md` may persist `resume_url`, but Contracts defines it as transport serialization: `resume_url` serializes enough transport/open realization for a resolver to execute `OpenSubject`, while `route_target` remains canonical identity and serialization stays narrower than the internal route model. Shell and scope belong to `route_target`; persistence and `/provenance` belong to storage records and projections.

Inspector and page-focus fields are closed route-contract fields, not arbitrary UI tab names or message anchors. `Contracts_V0` / `Contracts_V0.md` own the closed `inspector_target` enum and keep message-step-line-range style anchors out of `inspector_target`. `tab_id` is a routed page-focus field, not a generic any-tab-anywhere value. The base route contract stays small; resolver context comes from existing scope fields such as `project_id`, `focused_run_id`, and the destination's canonical object store.

Usage deep-links and open contracts resolve through canonical route identity. Usage deep-links normalize through `object_kind = usage_event` and `object_id = canonical usage event id`; consumers must not infer Usage targets from local filters alone. Contract placement keeps `7.1 UICommand envelope`, adds `route_target` and `OpenSubject` as sibling route/open contract sections, and keeps `WiringEntry` after those sections so the wiring layer consumes rather than owns route/open semantics. `Plans/UI_Command_Catalog.md` and `/UI_Command_Catalog.md` remain adjacent consumers of this route/open contract.

Run graph and recovery projections use attempt-native runtime identity instead of node-through-tier routing. `Plans/Run_Graph_View.md` and `/Run_Graph_View.md` must not route Usage by node-through-tier or treat `tier_id` as the Usage correlation key; they join through first-class runtime and usage-event identity. Canonical runtime event families include `scheduler.pass`, `node.blocked`, `safe_point.*`, and `remediation.*`; canonical projection keys include `blocked_projection`, `attempt_record`, and `scheduler_pass_record`, with attempt-native projection rules and blocked projections preserving runtime recovery lineage.

Runtime-core docs that still depend on tier-rooted live coordination objects must normalize those objects to attempt-native keys before `/history`, recovery, or restart views consume them. Tier-rooted labels may remain compatibility annotations only after the durable history contract can join through attempt-native runtime identity.

Legacy HITL and EventRecord canon is compatibility lineage, not a peer runtime model. Section `6. HITLRequest` / `HITLRequest` examples that center `request_id`, `tier_id`, `tier_type`, `request_kind`, `request_kind = tier_boundary_approval`, `allowed_actions`, and `allowed_actions[]` remain compatibility records resolved through the shared blocked-state model. Section `1.1 EventRecord` / `EventRecord` examples such as `run.tier_started` and `run.tier_completed` are historical event shapes, not current runtime snapshot ownership.

Runtime identity packets carry execution role, blocked minima, and parent scope without reviving older field families. `requested_persona` ownership is about scope, not renaming it back into older fields. `Plans/Contracts_V0.md` and `/Contracts_V0.md` attempt/runtime packet families include `execution_role`, blocked-family minimums, and ref-family separation. Minimal parent object shapes cover `project`, `run`, `feature_seam`, and `work_package` so projections can reference stable parents without stale tier shortcuts.

Requested/effective account identity extends existing persona/model patterns instead of creating an account-only parallel system. Container and Docker auth fields such as `requested_auth_mode`, `effective_capabilities`, `effective_capabilities[]`, and `effective_account_identity` are the shared execution identity shape, not isolated container-only fields. Existing `/persona`, `/model`, and `/effective` rules remain the base and extend to account identity rather than being replaced by a parallel account-only model. `Plans/chain-wizard-flexibility.md`, `/chain-wizard-flexibility.md`, `Plans/FinalGUISpec.md`, and `/FinalGUISpec.md` treat `resume_url` as derived transport only, not as a primary routing primitive.

Docker auth is the clearest requested/effective example and must generalize into the shared execution identity pattern instead of remaining a domain-specific one-off. Domain-specific auth examples may illustrate requested/effective identity, but they do not own a separate identity grammar.

Downstream identity consumers reconcile to one requested/effective account block owned by `Contracts_V0` / `Contracts_V0.md`, with `Plans/Multi-Account.md` and `/Multi-Account.md` as companion account-policy consumers. That block must expose `/fallback`, `/effective`, and account-switch disclosures, preserve `requested_account_policy`, and define a requested-side concrete account anchor so downstream docs do not improvise requested account selection semantics. `effective_provider_identity` and `/display` labels are audit/display fields, not routing keys, and must not override the canonical account or route identity.

The requested-side account anchor is required for durable historical requested-vs-effective analysis, not just for live UI explanation. Historical run, usage, approval, and recovery records preserve the requested-side concrete account or binding/policy evidence beside the effective account chosen for execution.

Inspector `/detail` presentations for requested/effective runtime identity use a two-column requested/effective block when both sides are material; controls carry support-status chips, and reason text below the control explains why a requested value was honored, changed, unsupported, or blocked.

`HITL` request/resolution events carry actor/lane/account identity and approver provenance. The `/lane/account` scope and `/resolution` outcome must explain which actor requested approval, which lane/account context would execute, and which approver accepted, rejected, or modified the action.

Runtime history and recovery consumers preserve distinct outcome meanings instead of flattening them into a generic failure. `superseded` and `replan_required` remain graph patch and generation-lineage states, `abandoned` is not the same as simple `failed`, and a generic `failed` outcome cannot erase the reason needed to explain the historical projection.

Executor, HITL, and stream consumers share blocked-owner and audit vocabulary from Contracts. `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/human-in-the-loop.md`, and `/human-in-the-loop.md` depend on `blocked-owner` and audit-scope semantics richer than a provider stream can expose by itself. The normalized A2A stream layer must not productize `tier_boundary` or tier-audit as current `/runtime` canon, and it must carry normalized paths for account-switch, pressure `/confidence`, and actor-class disclosure. `SelectSpeakerEvent` must not remain only `raw_observation` when speaker selection or conversational actor changes affect durable runtime lineage.

Widget and permission projections inherit shared account and blocked-state scope. Widget multi-account and `/account-pressure` contracts bind to canonical `provider_accounts` and `provider_accounts.*` projections, inherit trust and `/scope` from the host surface, and cannot create a local account-pressure identity. Permission approval caches use runtime-overlay and `/blocked-state` terminology instead of stale tier-boundary phrasing, and cache keys include actor plus `/run/lane/account` context.

Project attention records are first-class projection records with the field family `project_attention_item`. Required fields are `attention_item_id`, `project_id`, `severity`, `owner_kind`, `reason_code`, `source_kind`, `source_object_ref`, either `primary_route_payload_ref` or an inline route payload, optional `secondary_route_payload`, `projection_trust_state`, `dismissibility_kind`, optional `quiet_until_utc`, `active`, `created_at_utc`, `updated_at_utc`, and optional `resolved_at_utc`.

Account switch records use a durable `account_switch_event` shape. Fields include `switch_event_id`, `project_id`, `provider_id`, optional `execution_role?`, optional `requested_account_id?`, optional `requested_account_binding?`, optional `from_account_id?`, optional `to_account_id?`, `switch_reason`, `decision_kind`, optional `source_episode_id?`, optional `run_id?`, optional `attempt_id?`, optional `thread_id?`, and `ts`; `decision_kind` is closed to `switched | stayed | blocked_no_backup | blocked_required_account | failed` so blocked no-backup and required-account outcomes survive audit and display.

Concern, corroboration, and promotion governance use durable object families rather than loose remediation notes. `Executor_Protocol` / `Executor_Protocol.md` and `orchestrator-subagent-integration` / `orchestrator-subagent-integration.md` consume concern model, `/corroboration` lifecycle, wake reasons for concern, `/promotion/governance` boundaries, `/corroboration/promotion` lineage, and a dual-overseer actor model from Contracts-owned concern and governance records.

Storage-owned projection records define generic health and freshness fields. `storage-plan` / `storage-plan.md` owns `/health`, `/refresh`, `/projection`, `project_summary`, `project_attention_item`, account pressure/switch episode records, projector refresh semantics, and fallback rules; Contracts keeps the shared field grammar while storage owns persistence and projection mechanics.

Runtime receipts and run graph projections are attempt-native. `orchestrator.receipt.{run_id}.{attempt_id}` and `orchestrator.receipt` records are keyed by `run_id` and `attempt_id`, `usage_record` carries `attempt_id?`, run-graph and `/orchestrator` projections require attempt-level resolution, and `/tool`, `/runtime`, `/attempt`, and blocked/runtime records assume node/attempt identity rather than a tier-only shortcut.

Wizard, interview, and runtime artifact handoffs preserve runtime identity into later attempts. `/interview` and wizard handoff payloads carry requested/effective account disclosure, `execution_role`, `operational_identity`, permission posture, and a durable link from handoff into later run/attempt lineage. `Plans/Runtime_Artifacts_Panel.md`, `/Runtime_Artifacts_Panel.md`, `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `Plans/Executor_Protocol.md`, and `/Executor_Protocol.md` are consumers of this runtime identity envelope.

Blocked episodes are the canonical unit for waiting and recovery. A blocked episode covers approval waiting, clarification waiting, auth `/prerequisite` waiting, permission `/FileSafe/external-side-effect` blocks, and worktree conflict or dirty-worktree blocks without replacing the underlying concern, receipt, or runtime object.

The runtime packet set requires `execution_role`, and receipt-style operation bridges are where `operational_identity` belongs. One shared attribution family is available to `tool.invoked`, `tool.denied`, `runtime_artifact.*`, `runtime_artifact`, runtime receipts, `usage_record` / `cost_usage`, and relevant evidence or trace views so tool, receipt, usage, artifact, and evidence pivots do not fork attribution semantics.

Usage routing treats `usage_event_ref` as canonical when present. `usage-feature` / `usage-feature.md` may retain timestamp or `/run/thread` fallback only as degraded compatibility, not as the preferred routing path when canonical usage identity exists.

Runtime open contracts include attempt-scoped and generated-object opens. Evidence opens by `attempt_id`, safe-point manifests or restore logs by `safe_point_id`, remediation lineage summaries by `remediation_root_id`, generated non-repo drafts, and runtime artifacts by `artifact_id` are valid second-category opens distinct from repository file opens.

Workspace file opens and identity-native opens remain layered under the same higher-level routing model. `FinalGUISpec.md` keeps `OpenFile` true for workspace files, while identity-native opens route through `OpenSubject`; `Contracts_V0` / `Contracts_V0.md` own concrete `route_target` and `OpenSubject` shapes, and `FileManager.md` narrows `OpenFile` to a workspace-document path operation rather than the universal object-open primitive.

`OpenSubject` subject kinds include `doc:<document_id>` and `artifact:<artifact_id>`. Resolution may end in a workspace-backed source opening, a transient `generated://<artifact_id>` buffer, or a routed non-editor surface. `OpenSubject(subject_id = doc:...)` resolves to workspace-backed source opening; `OpenSubject(subject_id = artifact:...)` resolves to real document source when one exists, otherwise it resolves to transient `generated://<artifact_id>` source opening.

For non-persisted drafts, transient `generated://<artifact_id>` buffers are valid; deep-plan plus embedded-document flows expect source, `/preview/editor`, and editor surfaces to work before final persist. `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/FinalGUISpec.md` consume this staged/non-persisted bundle rule when opens must work before stable workspace paths exist. `inspector_target` is valid only when the field is a detail-pane selection, not the main identity.

`resume_url` is a serialized transport of the canonical route-target / `route_target` model, not the owner contract or a parallel stronger primitive. Internally the canonical model is `route_target`; external or persisted transport is a narrowed serializable form that decodes into `route_target`, and `resume_url` is one concrete transport instance of that form. Scope restorers such as `focused_run_id` and `thread_id` remain route fields because they restore meaningful route context, not because they are object metadata.

The near-term command migration keeps domain-facing wrapper commands public and stable while adding canonical `route_target` / `OpenSubject` semantics underneath them. Wrappers normalize internally to the shared navigation primitive so public command stability does not fork a second route/open contract.

Route detail and blocked-episode identity stay closed contract vocabulary. `inspector_target` is allowed as reusable detail-focus, not per-surface noise; its controlled values are `summary`, `evidence`, `artifacts`, `history`, `reviews`, `usage`, `lineage`, and `details`. Blocked-episode routes identify `object_kind = blocked_episode`, `project_id`, `focused_run_id = run_id`, `object_id = blocked_sequence`, and object scope = node_id within run, preserving `run_id`, `node_id`, `object_id`, `object_kind`, `focused_run_id`, `blocked-episode`, `blocked_episode`, and `blocked_sequence` as route/open identity facts rather than UI-local metadata.

Tier boundaries are not approval scope anchors. Approval and recovery pivots normalize to `/node/blocked` runtime scope with blocked-episode identity anchored by run/node/blocked sequence, so tier boundary, tier type, and page-local approval grouping cannot replace `run_id`, `node_id`, and `blocked_sequence`.

Route/open ownership must not leak into consumers or wiring. `WiringEntry` consumes route/open contracts and `/open` behavior; it is not their surrogate owner. Direct command dispatch verification must also encode wrapper normalization, deprecated alias mapping, route/open contract consumption, and command classification such as `shell_view` versus `navigation_wrapper`.

Route transport and adjacent consumers follow the owner-doc split. `resume_url` is serialized transport of `route_target`, remains narrower than the internal route contract, and must not act as a shadow routing primitive. `Plans/Runtime_Artifacts_Panel.md` and `/Runtime_Artifacts_Panel.md` are the strong implicated and strong aligned adjacent consumer for runtime-artifact surfaces; `Plans/assistant-chat-design.md` and `/assistant-chat-design.md` are strong aligned adjacent consumers for assistant-chat surfaces; `Plans/Run_Modes.md` and `/Run_Modes.md` are strong adjacent owners for run-mode surfaces. This seam is an owner-doc gap: `storage-plan` / `storage-plan.md` is ahead of `Contracts_V0` / `Contracts_V0.md` and `Crosswalk.md` on it, while route/open ownership stays in Contracts unless later evidence retargets it.

Approval and wizard-blocked identity collapse older aliases into route/runtime primitives. `human-in-the-loop.md` and `human-in-the-loop` may retain historical request-centric tier-boundary approval language, but the canonical flow is the blocked/runtime overlay: `waiting_approval`, `/blocked`, `blocked_sequence`, ordered `allowed_action_ids[]` / `allowed_action_ids`, `/runtime`, canonical runtime commands, and primary approval action identity from the blocked episode rather than `request_id`. A surviving `request_id` is lineage or compatibility metadata for historical replay, not the primary approval action target.

Wizard blocked routing and remediation resolution must not keep competing canonical vocabularies. `wizard.blocked` is grounded in named `route_target`; `resume_url` and `resume_url?` are serialized transport forms only, never a shadow primitive. `remediation.resolved` owns one `resolution` reconciliation: legacy `success | failed | ceiling_exceeded` and current `fixed | superseded | abandoned | replan_required` values must be represented through an explicit compatibility mapping, with `ceiling_exceeded` and `replan_required` retained as named outcomes instead of presenting both lists as independent canonical sets.

The early thin `wizard.blocked` definition is reconciled through the `route_target` owner contract: `report_ref` remains an inspection/report reference, `resume_url` remains transport-only, and runtime recovery uses blocked/remediation identity rather than treating the wizard event as a standalone navigation model.

Storage identity, key registration, and auth/usage disclosure follow the same owner split. Usage and Evidence must not recreate `tier_id` drift in Usage, Graph, and Orchestrator consumers; `storage-plan` / `storage-plan.md` normalizes around attempt-native runtime records, blocked projections keyed by blocked episode identity, subject-first restore identity, and receipt records for cross-surface joins. Every storage or key registration requires a field schema / value-shape contract. `Authentication` / `Usage` and `/auth` records carry effective account/auth emphasis with `project-policy` and `manual-preferred-account` source disclosure where relevant.

Record/search/routing and route-field contracts preserve actor/run distinctions. `/run`, `/search/routing`, and runtime-identity disclosure reuse one grammar across record, search, and routing surfaces without collapsing distinct actor kinds, run kinds, or lifecycle models. Not every route uses every field, but the contract makes route fields composable rather than reinvented surface by surface.

Resolution and account identity contracts use richer lineage-aware envelopes. Remediation should use one canonical resolution family, and the lineage-aware form is preferred over a coarse `success` / `/failed` enum when replay or repair lineage matters. Shared `/effective/provider/account` disclosure is reusable across auth events, usage records, graph details, artifacts, and blocked `/recovery` records; wherever user-selected account pinning must be represented, the contract requires a requested-side concrete account field or equivalent explicit rule.

Runtime actor and account payloads preserve provider and realm boundaries. A canonical actor envelope is shared by runtime records, provider-account snapshots, receipts, Usage pivots, and conversational actor telemetry. Stable account identity normalization must preserve the hard realm split between `github_api` and `copilot_github`; model/provider contracts and downstream projection payloads must also split transport host identity from upstream `/provider` identity.

Requested-side account switching and pre-run governance have durable linkage. Canonical requested-side fields include `requested_account_id?`, `requested_account_binding?`, and a usage record extension with `account_switch_reason?` plus `switch_event_ref?` or equivalent durable linkage. Wizard docs carry explicit CUP governance and handoff fields including `execution_role`, requested `/effective` account identity, `/worktree` isolation/worktree mode, `thread_id`, `project_id`, validation `/report` lineage, `/interview`, and wizard/interview pre-run governance payload identity.

Scheduler-impacting approval and tool-denial states are blocked-runtime episodes. Pending approvals, `/pending` state, and any scheduler-impacting `tool.denied` outcome must resolve to the blocked episode contract instead of a weak standalone tool-denial path. Relevant `tool.invoked`, `tool.denied`, runtime artifact payloads, operational receipt records, and `/bridge` records carry `operational_identity?` whenever side effects occur, so provider/account/permission posture remains attributable across attempts.

Tier-shaped progress displays are compatibility overlays over attempt-shaped truth. `tier_runtime_record` may survive only as a derived current-view/runtime-overlay projection, represented as compatibility `/runtime-overlay` or `/overlay` display state for a tier-shaped UI grouping; it is not the canonical owner of execution identity. Progress tree, compact terminal, and high-level tab badges answer visible progress, latest active attempt, and blocked episode pointer questions by reading `attempt_record`, blocked/runtime records, and attempt-shaped context first, while `usage_record` and evidence joins retire old `tier_id` primary joins rather than keeping tier-shaped records alive as execution truth.

Executor-facing runtime dispatch contracts must be stricter than compatibility event envelopes. `EventEnvelopeV1` may retain historical "should include `run_id` / `thread_id`" wording for broad event compatibility, but executor-facing docs and dispatch payloads require the runtime attribution packet: `run_id`, `thread_id?`, `node_id?`, `attempt_id?`, `execution_role?`, `provider_attempt_ref?`, and `usage_event_ref?`. `Tools.md` owns tool-specific semantics only and references this shared runtime attribution packet instead of treating tool events as analytics-only.

Open contracts keep workspace-file opens separate from identity-native object opens. `OpenFile { path... }` remains the canonical workspace-file open shape, while identity-native objects use the section 7.4 `OpenSubject` contract with `subject_id` and `open_intent`. Compatibility shorthand such as `OpenSubject { subject_id, target_group?, open_mode?, location? }` normalizes `target_group?`, `open_mode?`, and `location?` through `route_target`, `open_intent`, or owner-defined route recipes rather than defining a second `OpenSubject` schema. `OpenArtifact` is a compatibility or convenience name only when it normalizes to `OpenSubject` with an artifact subject. Command contracts follow the same alias `/migration` pattern as event contracts: legacy wrappers and aliases remain recognizable during migration, but command execution and routing normalize to the canonical route/open contract rather than inventing a parallel command-owned target model.

The legacy `open_subject` command or payload name is accepted only as a compatibility alias for the identity-based target; new producers emit `OpenSubject` with `subject_id` and `open_intent`, while `target_group?`, `open_mode?`, and `location?` resolve through route or open-intent rules.

Generated artifact source transports never become canonical identity. `generated://<artifact_id>` is ephemeral source-buffer transport; canonical persisted identity remains `artifact:<artifact_id>` / `artifact_id`. The base `route_target` target object stays small: it uses `subject_id` or `object_kind` + `object_id`; `path`, `line`, `range`, and `/line/range` selectors stay outside base route identity and belong to `OpenFile` or specialized open/operation contracts. `OpenFile` owns `path`, `line`, and `range`; `OpenSubject` owns `subject_id` and source realization; `object-specific` / object-family commands may carry `family-specific` or `object-family-specific` anchors only when truly `domain-local` and not reusable.

`route_target` owns main identity and `/scope`; sub-selection goes to `OpenFile` line/range, `inspector_target` for reusable detail-surface focus, or domain-local object-family-specific anchors. The internal `route_target` model can be richer than serialized `URL` form. `resume_url` is serialized route-target transport, not a stronger navigation-like primitive; `wizard-blocked` and clarification flows may carry `resume_url`, but they still decode to the general `route_target` / UI command contract. Route activation may reuse persisted project `/surface` state only when the route omits a destination-local override and reuse still reveals the requested target. Panel docking `/floating`, destination-local subview, and `/sort/layout` filters or layout are shell state that must not hide or distort the requested target. The route model must be precise enough to get the user where they asked to go and restrained enough not to trash unrelated remembered shell state.

The command-definition layer carries minimal command-classification and normalization metadata without restating route payload structure: `command_kind` plus optional `normalization { kind, normalizes_to_contract? | alias_of_command_id? }`. Stable wrappers set `normalizes_to_contract`; deprecated aliases set `alias_of_command_id`; command execution normalizes to the canonical route/open contract rather than a command-local target model.

Route serialization and source opening stay separate from destination semantics. `resume_url` is a derived serialization of `route_target` with decoding rules anchored back to `Contracts_V0.md`; `Contracts_V0` owns the route/object contract, and canonical route/object identity remains primary over `/object` transport links. `OpenSubject` is identity plus open intent, not storage metadata and not shell routing. If `OpenSubject` carries panel/tab/shell destination semantics or `/tab/shell` state, it collapses into a second route contract; destination class stays in required `target_kind`, while transport/open realization detail and shell/view persistence detail stay outside `route_target`.

Route normalization happens before special identifiers enter the canonical route layer. Restore `project_id` first, then route scope such as `focused_run_id` and `thread_id` when present. Normalize every special-case id into `subject_id` or `object_kind` + `object_id`; `subject_id` is not a second generic object taxonomy. Usage routes normalize `usage_event_ref` into `object_kind = usage_event` with the canonical usage event as `object_id`. Graph/detail pivots and `/detail` opens are canonical route restoration, not tab switches plus local state.

`artifact_id` and `document_id` normalize into `subject_id`; `document_id` or `artifact_id` prose in navigation should name `subject_id` directly when the target is a content subject. `wizard_id`, `message_id`, `scheduler_pass_id`, `safe_point_id`, `remediation_root_id`, and similar domain/runtime identities normalize into `object_kind` + `object_id`. `subject_id` wins for openable/renderable content subjects; `object_kind` + `object_id` wins for domain/runtime/governance objects.

`subject-first` behavior is one normalized identity rule, not a set of special-case prose pockets: openable/renderable content starts at `subject_id`, while domain runtime and governance records start at `object_kind` + `object_id` and then resolve through the same route/open contract.

Do not add `thread:`, `run:`, `wizard:`, `safe_point:`, or similar runtime/governance families as new `subject_id` prefixes. Those identities are modeled as `object_kind/object_id`, with `thread`, `run`, `wizard`, and `safe_point` values carried through route object identity.

Inspection and usage refs do not become route identity. `Orchestrator_Page.md` may use `evidence_ref` for summary/evidence surfaces because that is record inspection, not routing; `resume_url` remains serialized transport derived from canonical route identity. Usage may keep `usage_event_ref` as canonical usage identity for accounting and evidence joins, while `tier_id` cross-surface node usage is compatibility or projection context rather than the primary usage route key.

Approval and dispatch proof stay runtime-command aware. `allowed_action_ids[]` has won at the runtime-command layer, so approval targeting resolves through `blocked_sequence` while any retained `request_id` is lineage or lookup metadata. `GATE-010` must eventually validate more than flat wiring coverage: command wrapper normalization, `route_target` pass-through, `OpenSubject` subject-open binding, and deprecated alias versus stable wrapper semantics are part of the Contracts-owned proof shape.

The highest-risk reconciliation seams stay ordered by owner responsibility. DAE `/FileSafe` enforcement, promoted-shell command ownership, execution-role / requested-effective disclosure, OpenCode provider-native identity mapping, and rewrite-root owner routing are owner-doc issues before mirror cleanup. `Crosswalk.md` cleanup requires corrected section numbering, stale `Tiers` and widgetized-Orchestrator wording removal, and explicit primitive ownership for `route_target` and `OpenSubject`. Rewrite seam cleanup runs `rewrite-tie-in-memo.md` first as rewrite-root routing, `UI_Command_Catalog.md` second for command-family cleanup, and `FinalGUISpec.md` third for visible shell/view cleanup. Feature-list tranche cleanup runs upstream owner docs first, `GUI_Rebuild_Requirements_Checklist.md` second as status repair, `feature-list.md` and `newfeatures.md` third as summary cleanup, and `Section15_MVP_Promoted_Features_Spec.md` last as verification against corrected upstream owners.

Runtime identity, handoff, and stewardship records preserve their concrete keys. An effective-resolution record must carry `execution_role`, operational identity / side-effect target identity, and requested concrete account binding fields rather than relying on nearby runtime prose. Each attempt handoff records what was attempted, what changed or which artifacts were produced, checks/tests/review outcome including `/tests/review`, why it failed/blocked including `/blocked`, contamination / restore state when relevant, recommended next action, and reusable learnings or `/patterns`. Stewardship refreshes preserve `status`, `run_prefix`, `next_run_seq`, and `run_id`.

### Concern record family, lifecycle, and deferred visibility

`degraded-trust` is represented as a cross-surface concern/projection-trust state. Contracts consumers MUST route degraded-trust/account-health concern escalation through the shared concern record, blocked-owner, and escalation-ladder model instead of inventing surface-local warning aliases.


- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata.
- Use active/acknowledged/resolved/dismissed as concern lifecycle states.
- Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values.
- Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions.
- Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions.
- Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns.
- Allow blocked episodes to reference concerns without replacing concern identity.
- Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics.
- Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section.
- Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority.
- Allow ownership changes without changing concern identity.
- Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers.
- Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one.
- Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract.
- Keep `blocking_effect` explicitly separate from `severity`.
- Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- Treat `concern resolver` as distinct from owner/source roles.
- Allow concern ownership reassignment without changing concern identity.

### route_target, OpenSubject, and command normalization


- Define lane_to_package, package_to_seam_available, and seam_complete promotions.
- Attach exact gate/evidence expectations to each promotion class.
- Use one shared routing/deep-link payload for search, palette, widgets, recovery links, and cross-surface pivots.
- Treat resume_url as serialized transport of that route payload.
- Let Contracts_V0 own canonical route_target and OpenSubject contracts.
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based.
- Carry selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, and resume_url demotion into live route/open docs.
- Carry Primitive:RouteTarget/OpenSubject and wrapper/canonical normalization into crosswalk and wiring docs.
- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts.
- Keep ref-family split explicit when route/open normalization is transferred.

### Blocked episode, approval scope, and compatibility fallback


- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.
- Separate blocked-episode approval scope from session-wide policy scope.
- Persist durable approver identity fields on approval and rejection events.
- Approval lineage stays keyed to blocked-episode identity (`run_id`, `node_id`, `blocked_sequence`, `attempt_id?`) instead of being inferred from session-wide policy state.

## 1. Events (persisted)

Debug and investigation lifecycle events that affect stop, retry, resume, or user-attention state must carry machine-readable `stop_reason_code`, `attention_required_reason_code`, and `budget_kind` fields when applicable so storage, UI, exported bundles, and prompt assembly can preserve the same reason without parsing prose.

Task lifecycle events persist in thread history and storage through the canonical event stream. Subagent/task progress, HITL, plan/TODO transitions, and completion or blocked outcomes may render as task cards or thread projections, but those projections do not replace durable event records.

`/events`, `/history`, and `/rejection` audit views read durable approver identity from approval and rejection records/events, so they can explain who approved or declined rather than only that an approval state changed.

The Seglog contract must continue to cover 10 event families; the live coverage includes tools, usage, HITL, plan/todo, subagent, rollback, persona, background, runtime lifecycle, and recovery/blocked-state events.

Document annotation events reuse the existing `bundle-note` event family for durable annotation lifecycle and audit transitions. Ephemeral document-selection chat handoff is a separate event, `bundle.selection_sent_to_chat`, whose payload must include the requested chat target, effective resolved target, document provenance, and bounded selection excerpt; this event prepares visible chat context but does not mutate durable annotation state by itself.

### Runtime event catalog carry-through

Contracts registers persisted event names, producer/consumer boundaries, and cross-contract payload minima. `Plans/storage-plan.md` owns concrete persisted payload schemas, segment/projector mechanics, retention, and janitor cleanup.

| Event type | Producer | Primary consumers | Cross-contract payload minimum |
|---|---|---|---|
| `seglog.event_appended` | storage append writer | projectors, analytics, replay | `seq`, appended event `type`, `event_ref`, `segment_ref`, `writer_id?`, `ts` |
| `run.started` | executor/orchestrator | run graph, history, usage, recovery | `run_id`, `project_id`, `thread_id?`, `runtime_mode`, `requested_effective_snapshot_ref?`, `ts` |
| `run.completed` | executor/orchestrator | run graph, history, usage, recovery | `run_id`, terminal outcome, `usage_ref?` or bounded usage snapshot, `result_ref?`, `ts` |
| `node.started` | executor | run graph, scheduler, artifacts, recovery | `run_id`, `node_id`, `attempt_id`, `execution_unit_context_ref?`, `ts` |
| `node.completed` | executor | run graph, scheduler, artifacts, recovery | `run_id`, `node_id`, `attempt_id`, result outcome, evidence or artifact refs, `ts` |
| `tool.execution_started` | tool runner | run graph, history, usage, audit, recovery | `run_id`, `thread_id?`, `tool_use_id`, `tool_name`, `attempt_id?`, `runtime_snapshot_ref?`, `ts` |
| `tool.execution_completed` | tool runner | run graph, history, usage, audit, recovery | `run_id`, `thread_id?`, `tool_use_id`, `tool_name`, terminal outcome, `result_ref?`, `duration_ms?`, `ts` |
| `gate.evaluation_started` | progression gate runner | scheduler, UI, validation reports | `gate_id`, `run_id`, `node_id?`, `attempt_id?`, `score_threshold?`, `ts` |
| `gate.passed` | progression gate runner | scheduler, UI, validation reports | `gate_id`, `run_id`, `node_id?`, `attempt_id?`, `score?`, `score_threshold?`, evidence refs, `ts` |
| `gate.failed` | progression gate runner | scheduler, UI, validation reports | `gate_id`, `run_id`, `node_id?`, `attempt_id?`, `score?`, `score_threshold?`, `failure_reason_code`, evidence refs, `ts` |
| `worktree.created` | source control / lane allocator | orchestrator, storage, recovery | `project_id`, `repo_id?`, `worktree_id`, `run_id?`, `package_id?`, `lane_id?`, `branch_name`, `worktree_path`, `ts` |
| `worktree.deleted` | source control / cleanup owner | orchestrator, storage, recovery | `project_id`, `repo_id?`, `worktree_id`, `run_id?`, `package_id?`, `lane_id?`, `cleanup_reason`, `grace_period_ms`, `file_lock_checked`, `active_lock_refs[]?`, `safe_point_refs[]?`, `ts` |
| `lsp.server.lifecycle_changed` | LSP supervisor | editor, Problems, chat, storage | `project_id`, `host_id`, `server_id`, `root_identity`, `lsp_session_id?`, `previous_state?`, `state`, `state_reason?`, `ts` |
| `platform.capability_evaluated` | platform capability manager / Doctor | config, runner, UI, diagnostics | `project_id?`, `platform_id`, `provider_id?`, `capability_key`, `requested_capability?`, `effective_capability`, `degraded_reason?`, `evidence_ref?`, `ts` |
| `memory.gist_state_changed` | assistant memory subsystem | prompt assembly, memory GUI, audit | `gist_id`, `source`, `previous_verification_state?`, `verification_state`, `evidence_refs[]?`, `changed_fields[]?`, `ts` |
| `bundle.annotation_state_changed` | document bundle / review owner | builder, chat, audit, targeted revision | `bundle_id`, `doc_id`, `annotation_id`, `previous_state?`, `state`, `operation?`, `anchor_ref?`, `ts` |
| `bundle.selection_sent_to_chat` | document bundle / review owner | chat, prompt assembly, audit | `bundle_id`, `doc_id`, `selection_id`, requested/effective chat target, bounded selection excerpt ref, provenance refs, `ts` |
| `bundle.revision_requested` | document bundle / review owner | targeted revision, audit, validation | `bundle_id`, `revision_id`, ordered `annotation_ids[]`, requested/effective revision capability, `safe_point_id?`, `ts` |
| `approval.requested` | HITL / blocked-state owner | UI, orchestrator, permissions, recovery | `run_id`, `node_id`, `blocked_sequence`, `approval_scope_key`, ordered `allowed_action_ids[]`, `detail_ref?`, `ts` |
| `approval.granted` | HITL / approval resolver | UI, orchestrator, permissions, recovery | `run_id`, `node_id`, `blocked_sequence`, `approval_scope_key`, `approver_identity`, selected `allowed_action_id`, rationale ref or bounded rationale, `ts` |
| `approval.denied` | HITL / approval resolver | UI, orchestrator, permissions, recovery | `run_id`, `node_id`, `blocked_sequence`, `approval_scope_key`, `approver_identity?`, denial reason, `ts` |
| `approval.timeout` | HITL / approval resolver | UI, orchestrator, permissions, recovery | `run_id`, `node_id`, `blocked_sequence`, `approval_scope_key`, `timeout_class?`, `ts` |

Legacy `lsp.server_started` and `lsp.server_crashed` event names normalize to `lsp.server.lifecycle_changed` with `state` and `state_reason?`; producers must not fork a second LSP lifecycle family when the normalized event can carry the transition.

`seglog.event_appended` records append observability only; it must not replace the appended event itself. Runtime event records may carry `ttl_policy_ref?`, `retention_anchor_kind?`, and `retention_anchor_at_utc?`; default TTL values, max-cardinality bounds, janitor cleanup triggers, and legal-hold exceptions remain storage-owned and must not be inferred from file mtime.

Gate event payloads reference the `Plans/Executor_Protocol.md` dispatch score tuple when they expose `score?` or `score_threshold?`; `Plans/Progression_Gates.md` remains the semantic owner for gate evaluation rules.

Payload detail remains with the producer docs for these registered families: `Plans/LSPSupport.md` owns LSP lifecycle states, `Plans/newtools.md` and `Plans/orchestrator-subagent-integration.md` own platform capability evaluation, `Plans/assistant-memory-subsystem.md` owns memory gist verification and indexing, and `Plans/chain-wizard-flexibility.md` plus `Plans/assistant-chat-design.md` own annotation, selection, and targeted revision behavior.


### 1.1 Assistant worktree seglog events
Assistant worktree seglog events keep assistant-worktree lifecycle local while pointing shared record ownership back to canonical storage.

Rules:
- Authoritative storage ownership stays in `Plans/storage-plan.md`.
- This section links to `Plans/storage-plan.md#Canonical records` for canonical record families instead of restating them locally.

Contracts registers the assistant worktree event family with underscore-separated names that match existing chat seglog convention (`chat.thread_created`, `chat.thread_archived`, `chat.thread_deleted`). Dot-namespaced proposals such as `chat.thread.worktree_bound` are migration/review aliases only and MUST normalize to `chat.thread_worktree_*` before persistence.

Minimum assistant worktree event registrations:

| Event type | Minimum payload |
|---|---|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` |

For `chat.thread_worktree_pr_failed`, `phase` is the exact enum `push | api`: `push` means the git push failed before PR creation, while `api` means the PR API call failed after push.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### 1.3 EventEnvelopeV1 -- minimal compatibility envelope
`EventEnvelopeV1` is the minimal event envelope used by some plans as an intermediate format.

```json
{
  "ts": "2026-02-23T00:00:00Z",
  "seq": 1,
  "type": "run.started",
  "payload": {}
}
```

Rules:
- Writers SHOULD include `run_id` and `thread_id` whenever available, but `EventEnvelopeV1` does not require them.
- Readers MUST tolerate both envelopes; projectors SHOULD upgrade in-memory to `EventRecord` form.

ContractRef: ContractName:Plans/Contracts_V0.md#EventEnvelopeV1, PolicyRule:Decision_Policy.md§2

---

**Payload schema ownership:** `Contracts_V0.md` owns the canonical persisted envelope (`EventRecord`) and cross-cutting auth/event contracts. Concrete persisted event-type payload schemas are registered in `Plans/storage-plan.md` so writers, projectors, analytics, and generated docs share one payload SSOT.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

## 2. Provider normalized stream (non-persisted contract)


Providers emit a normalized stream for live UI consumption. Persistent storage remains governed by `EventRecord` in §1.

**Normative:** See `Plans/CLI_Bridged_Providers.md` for the full schema (event envelope + event types). This contracts file only asserts the boundary: normalized provider stream events are transport-facing, while seglog events are persistence-facing.

**Provider architecture constraints (normative):**
- All providers (CLI-bridged, server-bridged, and direct-provider) MUST conform to the unified Provider facade/trait contract with capability flags and tool-policy inputs defined at the Provider boundary.
- UI and orchestrator consumers MUST NOT special-case provider transport or provider brand beyond provider configuration fields (enablement, connection/auth inputs, model selection).
- Provider-originated events and tool-call lifecycle signals MUST be normalized into the canonical provider event stream contract before reaching consumers or persistence mapping.
- PM bundling and PM skill tool access are preserved regardless of provider transport; transport selection must not remove built-in PM tool availability.
ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md

---

### 2.1 Provider transport taxonomy

Provider and stream seams require explicit contract-version governance. A transport adapter must not invent adapter-local shadow fields for actor/account/trust categories; new fields require a contract-versioned owner path before persistence or UI projections consume them.

Providers may use one of these transport classes. The normalized stream contract (§2) applies identically regardless of class:
- **CLI-bridged:** local CLI subprocess transport (`stream-json`/ACP). Cursor and Claude Code are CLI-bridged only.
- **Server-bridged:** HTTP REST + SSE to a local server process. OpenCode is server-bridged.
- **Direct-provider:** direct provider endpoint calls with provider-native auth. Codex, Copilot, and Gemini Direct follow this class.
- Provider support-state projections use the closed values `native`, `native_projected`, and `projected` so UI/help surfaces can distinguish provider-native support from PM-projected compatibility.
- Direct-provider catalog candidates such as Alibaba, MiniMax, and Z.AI stay lower-confidence until a primary-source pass confirms the direct-provider shape; unverified entries must not be promoted as first-class PM direct providers.
- Legacy `CLI/runtime outputs + CLI auth/import` design notes are migration provenance; Codex and Copilot-facing contracts reconcile toward direct-provider auth/runtime semantics while preserving `/import`, `/runtime`, PM skill access, and the separate `copilot_github` auth realm.

Canonical enum contract for implementation:
```text
ProviderTransport = CliBridge | DirectApi | ServerBridge
```

Mapping:
- `CliBridge` → CLI-bridged
- `DirectApi` → direct-provider
- `ServerBridge` → server-bridged

**Transport-specific notes:**
- Server-bridged providers communicate via HTTP REST endpoints and SSE event streams (e.g., OpenCode; see `Plans/Provider_OpenCode.md`).
- CLI-bridged providers communicate via CLI event outputs and adapter parsing (`Plans/CLI_Bridged_Providers.md`).
- Direct-provider integrations may use provider HTTP/gRPC endpoints directly, but they MUST still emit the same normalized event types (`text_delta`, `tool_use`, `tool_result`, `usage`, `done`, etc.).
- For `Gemini/Vertex`, PM owns the schema sanitizer and the post-tool loop rule: provider `finish_reason` alone is not sufficient evidence that tool execution, tool-result ingestion, or response continuation is complete.
- OpenCode `EXEC` adapters enumerate handled terminal finish reasons before marking a stream complete: `FinishReasonContentFilter` and `FinishReasonSafety` are safety/content-filter terminals, while `FinishReasonUnknown` with empty content is an error path rather than normal completion.
- Consumers MUST NOT branch on transport class. All provider output is consumed through the unified normalized stream.
- Vocabulary-safe persisted contracts MUST NOT replace `requested_platform` or `effective_platform` with `provider_entry_id`; `provider_entry_id` is provider/account configuration metadata and may accompany, but not rewrite, requested/effective platform fields.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md

---

## 3. Tool events (persisted)
Tool activity MUST be represented in the persisted event stream using the following `type` values.

ContractRef: EventType:tool.invoked, EventType:tool.denied, ContractName:Plans/Contracts_V0.md

**tool event contract** for `tool.invoked`.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**runtime/tool/artifact attribution** must live in the authoritative payload shape itself.

**Authoritative payload fields**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the tool invocation. |
| `attempt_id` | Canonical local runtime anchor for the invocation attempt. |
| `lane_id` | Lane identity associated with the invocation. |
| `package_id` | Package identity associated with the invocation. |
| `execution_role` | Effective execution-role disclosure for the tool attempt. |
| `effective_account_id` | Effective account identity when the invocation is account-backed. |
| `operational_identity` | External-operation identity carried for downstream attribution. |
| `tool_use_id` | Stable tool-use identity for receipts and joins. |
| `provider_attempt_ref` | Provider-side attempt/reference bridge that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |

Rules:
- Analytics-thin tool events are no longer sufficient.
- `attempt_id` is the canonical local runtime anchor; bridge refs stay subordinate but explicit.
- Policy-driven tool events may carry requested identity in addition to effective identity: `requested_account_id?`, `requested_account_binding?`, `actor_kind`, and `actor_ref?` preserve the request/actor envelope without replacing `effective_account_id` or `operational_identity`.
**tool event contract** for `tool.denied`.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**runtime/tool/artifact attribution** must live in the authoritative denial payload shape itself.

**Authoritative payload fields**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the denied tool action. |
| `attempt_id` | Canonical local runtime anchor for the denied action. |
| `lane_id` | Lane identity associated with the denial. |
| `package_id` | Package identity associated with the denial. |
| `execution_role` | Effective execution-role disclosure for the denied action. |
| `effective_account_id` | Effective account identity when the denial is account-backed. |
| `operational_identity` | External-operation identity carried for denial attribution. |
| `tool_use_id` | Stable tool-use identity for denial receipts. |
| `provider_attempt_ref` | Provider-side bridge reference that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |

Rules:
- Analytics-thin tool events are no longer sufficient.
- `attempt_id` is the canonical local runtime anchor; bridge refs stay subordinate but explicit.
- permission and denial surfaces must still expose effective actor and account identity.
- Denial payloads that originate in requested account, permission, or policy routing preserve `requested_account_id?`, `requested_account_binding?`, `actor_kind`, and `actor_ref?` so consumers can explain the rejected request without inventing local actor fields.
Requirements-quality workflow state uses stable persisted event shapes anchored to the canonical **validation pass report** artifact and launch handoff lineage.

ContractRef: Plans/Project_Output_Artifacts.md#10. Validation Pass Report Artifacts, Plans/chain-wizard-flexibility.md#12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)

**Authoritative shared payload fields**

| Field | Requirement |
| --- | --- |
| `validation_pass_report` | Canonical artifact family for the persisted quality result. |
| `workflow_run_id` | Workflow execution lineage for the validation pass. |
| `pass_number` | Ordered validation pass index. |
| `pass_name` | Stable name for the pass. |
| `pass_verdict` | Verdict value for the pass; supports `skipped` where the flow requires it. |
| `verdict_reason` | Structured reason for the emitted verdict. |
| `provider` | Provider used for the validation step. |
| `model` | Model used for the validation step. |
| `wizard_id` | Wizard identity that owns the requirements workflow. |
| `project_id` | Owning project identity. |
| `thread_id` | Conversation or workflow thread identity. |
| `phase_plan_ref` | Phase-plan lineage reference for launch handoff. |
| `staged_bundle_ref` | Staged-bundle lineage reference for launch handoff. |
| `requirements_quality_report_ref` | Stable reference to the quality report artifact. |
| `execution_role` | Effective runtime identity that survives from validation into launch handoff. |
| `effective_account_id` | Effective account identity that survives from validation into launch handoff. |
| `run_id` | Run identity when a launch handoff is already bound to runtime state. |

Rules:
- Pass reports must stay upstream artifacts rather than masquerading as runtime attempts.
- `pass_verdict` must support `skipped` where the flow needs it.
- Accepted/final pass output must bridge into launched execution.
- effective runtime identity must survive from validation into launch handoff.
This section owns the payload-extension fields that stay attached to persisted events and records rather than becoming route payload surrogates.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#7.3 `route_target`

**inspection refs**

| Field | Requirement |
| --- | --- |
| `detail_ref` | Stable detail reference for a tool/event detail payload. |
| `report_ref` | Stable report reference for emitted reports. |
| `evidence_ref` | Stable evidence reference for linked evidence artifacts. |
| `usage_event_ref` | Stable usage reference for accounting joins. |
| `workflow_refs` | Workflow-specific reference bundle when workflow lineage is present. |
| `docker_refs` | Container/runtime reference bundle when Docker lineage is present. |
| `kubernetes_refs` | Cluster/workload reference bundle when Kubernetes lineage is present. |

**navigation transport**

| Field | Requirement |
| --- | --- |
| `resume_url` | Transport-only serialized resume/open handoff; it does not replace canonical route identity. |

Rules:
- Inspection/provenance refs stay in event and record payloads.
- Route/open contracts own navigation identity.
- Existing `detail_ref` and `*_ref` conventions are expanded by new record families, not replaced by route payload fields.
- `resume_url` remains transport-only.
- `detail_ref`, `report_ref`, and `resume_url` are not interchangeable open-this-thing fields: `detail_ref` and `report_ref` identify inspection/report payloads, while `resume_url` serializes a canonical `route_target` transport.

### 3.4 Tool-specific payload extensions

This section owns tool-specific payload extensions for `/Runtime`, `/web`, `/tools/chat`, and `/section` consumers. Transfer lineage for this contract family preserves `### 1.1 Assistant worktree seglog events`, `#### Common web output fields`, `#### Question schema and tool contract`, obligations `obl-043`, `obl-044`, `obl-054`, `obl-055`, `obl-056`, `obl-066`, `obl-068`, `obl-009`, `obl-021`, and `obl-040`; `/retire` lineage is retained only as evidence when stale aliases are replaced.

The `/WebAction/web-output/error` carry-through family keeps question responses, WebAction output, and web error payloads aligned here: `answers[]` is compatibility shorthand for `answers: Array<{question_id, values: string[]}>`, and `answer_text?`, `value?: string`, `description?: string`, `tool_use_id`, and `adapter_id` remain canonical payload fields.

#### Common web output fields

Common web payloads carry `source_refs[]`, `citation_refs[]`, `provenance_refs[]`, `requested_provider`, `effective_provider`, `adapter_id`, `provider_attempt_ref?`, `cache_state`, `rate_limit_state` (`/rate-limit`), and support metadata for `/batch`, anti-bot, and `/stability` behavior when the provider exposes those facts. They also carry `execution_path?: string` so routing/audit consumers can distinguish `provider_search_native`, `provider_extract_native`, `pm_search_plus_site_reader`, `pm_site_reader`, `provider_firecrawl_scrape`, `pm_fetch_fallback`, `provider_firecrawl_agent`, and `pm_research_composed` without inferring execution from display labels. Firecrawl and other provider-backed adapters may report `credits_used`, provider request IDs, and provider-cache outcomes, but those fields stay subordinate to the PM web output contract. Firecrawl-specific subordinate fields are exactly `firecrawl_credits_used`, `firecrawl_cache_state`, and `firecrawl_scrape_id`; `firecrawl_credits_used?: number` is populated from provider response `creditsUsed`, `firecrawl_cache_state?: "hit" | "miss"` is populated from provider response `metadata.cacheState`, and `firecrawl_scrape_id?: string` is populated from provider response `data.metadata.scrapeId`, while legacy `scrape_id` is a retired incorrect alias. These fields are payload extensions under this contract, not a separate Firecrawl-owned event family.

`result_quality_hint` is an optional common web output field with exact values `search_snippets_only`, `extracted_pages`, `site_reader_pages`, and `research_synthesis`. It describes the evidence depth behind the returned result so consumers can distinguish snippet-only search results, provider-extracted page bodies, PM Site Reader page reads, and synthesized multi-source research.

`web_input` is a structured object containing the normalized request/input facts used for routing, audit, replay, and provenance joins; it is not a preview string and must not be flattened into display text. Web result payloads also carry `provenance_badge?: string`, with the canonical underscore values `site_reader`, `search_snippet`, `site_extract`, `research_synthesis`, `crawl_result`, and `map_result`; `provider_scrape` is retained as a provider-specific proposed extension pending Part P provenance-badge harmonization and must be marked as such wherever a narrowed locked set is required. Narrowed TypeScript-style consumers may render the owner-owned subset as `provenance_badge?: 'site_reader' | 'provider_scrape'` only when they also preserve that proposed-extension caveat. Underscore values are required for code-friendliness and stable joins across contracts, storage, and web activity displays.

Prompt-based web action payloads use `prompt: string` for natural-language browser/research instructions, keep the action path agent-friendly, and record provider cost dimensions such as credits per `/min` or `/clicks/extracts` when the provider reports them.

#### Question schema and tool contract

Question and `/questionnaire` payloads share one lifecycle contract. Allowed flow states are `draft`, `incomplete`, `ready_to_submit`, `submitted`, and `paused`. Runtime state triggers are `pending` to `active` when the question is presented, `active` to `answered` or `submitted` when the user submits a response, `active` to `dismissed` when the user dismisses it, and `active` to `expired` when a configured timeout is reached. The UI lifecycle maps `pending` to `draft`, `active` with missing required answers to `incomplete`, `active` with all required answers present to `ready_to_submit`, submitted multi-question completion to `submitted`, and dismissed-but-resumable branches to `paused`; `answered`, `submitted`, `dismissed`, and `expired` remain terminal or explicitly restorable question outcomes according to the owning surface.

Question responses use `answers: Array<{question_id, values: string[], source?: "option" | "other" | "freeform"}>` for structured multi-answer submission, may include `answer_text?` for free-form display text, and use runtime status exactly `"answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`. Question item/action payload fields include `question_id`, `draft_value?`, `default_values?`, `response_kind`, `validation_state`, `value?: string`, `description?: string`, `tool_use_id`, `adapter_id`, and `adapter_selection_reason`. `response_kind?: "selection" | "freeform" | "mixed"` and `validation_state?: "valid" | "invalid" | "pending"` are both optional. Selectable question options use `options?: Array<{id, label, description?}>` in multi-question and `/questionnaire` payloads; `options` format is locked as `Array<{id: string, label: string, description?: string}>` object-array wire format. `string[]` remains backwards-compatible only for legacy `single_question` inputs and is auto-expanded to `{id: str, label: str}` before persistence or rendering.

Both `draft_value?` and `default_values?` belong in this contract: `draft_value?` is PM-managed in-progress freeform or draft answer text, while `default_values?` seeds caller-provided option IDs. Chat renders and collects these fields, but does not own the contract itself, the canonical field list, or the resolution semantics.

Question input envelopes carry `mode: "single_question" | "questionnaire"` and output `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`. `allow_other` is a deprecated alias for canonical `allow_freeform`; plain-text compatibility wording may say allow_other is a deprecated alias, but consumers may accept it only as a compatibility input and must normalize it before persistence, validation, or rendering.

The persisted `requirements.clarification_requested` event is the requirements-quality clarification request event. It carries the same `wizard_id`, `thread_id`, and `question_ids[]` set represented by the blocked requirements report, and legacy single-question tool shapes (`header?: string`, `text: string`, `options?: string[]`, and `answer: string`) normalize into the questionnaire payload and `answers[]` contract before persistence or resolution.

Subagents MUST NOT invoke the `question` tool to address users directly; they escalate to the parent orchestrator per `assistant-chat-design.md §15.2`, and the parent decides whether to surface the question to the user.

#### Web operation event payloads

Web operations MUST use the existing `tool.invoked` and `tool.denied` event families. `tool.invoked` records successful or attempted-completed web operations; `tool.denied` records policy/user-denied web operations. The `web.operation` / `web.operation.*` vocabulary is reserved for payload classification only; creating a parallel `web.operation.*` seglog event family is an explicit prohibition unless a future analytics contract explicitly introduces one. Web-specific fields live under `payload.meta` so tool, denial, usage, and audit joins remain consistent.

For `tool.invoked.payload.meta`, common web fields are `web_operation`, `web_input_preview`, `support_tier`, `execution_path`, `requested_adapter_id?`, `effective_adapter_id?`, `adapter_selection_reason?`, `projection_freshness?`, `projection_health?`, `provider_fallback_occurred`, `provider_fallback_summary?`, `source_count?`, `result_quality_hint?`, `warnings_count?: number`, and `error_code?: string` when `success = false`. Result-shape hints by operation remain lightweight: `websearch` may include `query_preview` and `results_count`; `webextract` may include `url`, `content_format?`, and `content_length_hint?`; `webresearch` may include `task_preview`, `sources_used_count?`, and `answer_summary_ref?`; `webcrawl` may include `root_url`, `pages_visited_count?`, `pages_returned_count?`, `max_pages?`, and `max_depth?`; `webmap` may include `root_url`, `nodes_count?`, `edges_count?`, `max_pages?`, and `max_depth?`.

For fallback caused by provider rate-limit or outage, `provider_fallback_summary?` records the failed provider, cause (`rate-limit` or `outage`), and next same-operation provider attempted. Audit wording must match the chat activity fallback disclosure rather than hiding the route behind `effective_adapter_id`.

Web result and denial payloads use the same lightweight `/meta` shape. `tool.denied.payload.meta` for web operations may carry `web_operation?`, `web_input_preview?`, `requested_adapter_id?`, `projection_freshness?`, `projection_health?`, `blocked_reason_code?`, `allowed_action_ids[]?`, and `headless_denied?`. Operation-specific inline meta includes `task_preview`, `sources_used_count?`, and `answer_summary_ref?` for `webresearch`; `root_url`, `pages_visited_count?`, `pages_returned_count?`, `max_pages?`, and `max_depth?` for `webcrawl`; and `root_url`, `nodes_count?`, `edges_count?`, `max_pages?`, and `max_depth?` for `webmap`.

Inline event/meta fields are short previews, counts, enum-like routing/provenance values, and stable error codes. Full extracted page bodies, long research synthesis notes, large source sets, crawl page inventories, and map graph payloads must move by ref or `/blob` rather than being duplicated into every event projection.

Batch web operations preserve one parent audit event for the batch and child audit events per URL. The parent event carries the batch-level tool use, routing metadata, adapter selection, and aggregate status; each child event carries URL-level status, provider attempt refs, cache fields, and error/provenance metadata.

#### Runtime snapshot and tool/chat payloads

Tool payloads consumed by storage, tools, and chat carry `runtime_snapshot`, `task_id`, `subagent_type`, `resumed`, `chat.plan_todo_updated`, `/turn`, `/todo`, and `/tokens` when those fields participate in runtime or chat projection. Subagent lifecycle payloads use the canonical `subagent.*` event family without a `chat.` prefix: legacy `chat.subagent_*`, `chat.subagent_`, and `chat.subagent_spawned` references are retired aliases and normalize to `subagent.*`. Producer-specific request/completion names such as `subagent.spawn_requested` and `subagent.spawn_completed` preserve the same PM lineage envelope as `subagent.spawned` and `subagent.completed` instead of creating a parallel chat namespace. The PM lineage envelope includes `run_id`, `thread_id`, `agent_id`, `parent_run_id?`, `child_run_id?`, `parent_thread_id?`, and requested/effective runtime descriptors when they differ. Runtime snapshot fields remain cross-cutting payload extensions rather than local tool-result decorations.

`chat.plan_todo_updated` minimal payload schema is `{ plan_id: string, todo_id: string, field: string, old_value: any, new_value: any, source: "agent" | "user" }` for durable TODO mutations. Structural item creation, removal, or reordering may emit one event per affected `todo_id`, but every event must retain `plan_id`, changed `field`, `old_value`, `new_value`, and the mutation source.

Verbose investigation and browser evidence payloads are reference-first by default: raw logs, full trace payloads, full DOM dumps, request `/response` bodies, cookies, `/storage` values, and binary blobs must not auto-inline into model context unless an owner contract grants a bounded preview or explicit attachment path.

#### Owner hint resolution payload

`owner_hint` starts as advisory tool output. Crew or delegation resolution records `owner_hint_advisory` and `owner_hint_resolved`, including the concrete `/model/persona` mapping when resolution selects a provider, model, Persona, or role binding. The advisory-to-effective lifecycle trigger is delegation resolution, not a user action.

### 3.4A Web error taxonomy and applicability (web-error)

This section defines the canonical contract for this surface.

Core rules:
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified.

Fields:
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- HTTP 404 → `content_not_found`
- HTTP 400 → `invalid_input`
- "Blocked by robots.txt" → `crawl_robots_blocked` or `content_blocked`
- "Content too large" → `content_too_large`

Legacy web-operation error aliases normalize into this canonical taxonomy instead of creating a parallel code family: `web_timeout` -> `timeout`; `web_dns_failure`, `web_connection_refused`, `web_tls_error` (`/SSL` lineage), and `web_provider_error` -> `adapter_unavailable`; `web_http_4xx` -> `invalid_input`, `content_not_found`, or `content_blocked` according to the response; `web_http_5xx` -> `adapter_unavailable`; `web_content_too_large` -> `content_too_large`; `web_content_blocked` (`/robots` lineage) -> `crawl_robots_blocked` or `content_blocked`; `web_auth_required` -> `adapter_unavailable` or permission recovery; `web_rate_limited` -> `rate_limited`; `web_parse_failure` -> `extraction_empty`, `extraction_schema_mismatch`, `schema_invalid`, or `schema_too_large`; `empty_result` -> `extraction_empty`; `projection_too_stale` -> `projection_freshness: "stale"` plus refresh-first/retry handling rather than a web error code; and `crawl_limit_reached` -> `crawl_depth_exceeded` when a depth cap stops traversal, or a structured warning with `pages_returned_count` / `max_pages` / `depth_limit` when the configured crawl cap is reached without an error.

Web-specific legacy codes are deduplicated into the one canonical table rather than a parallel web-specific family. `no_eligible_adapter` normalizes to `adapter_unavailable` when no configured provider can perform the requested operation.

`content_not_found` covers HTTP 404 or equivalent not-found URL responses. When `change_tracking` is requested with no previous cached fetch, the result is INFORMATIONAL: return `change_status: "new"` and `no_previous_version` in `warnings[]`, not `error_code`.

Rules:
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- schema_too_large
- schema_invalid
- extraction_empty
- autonomous_budget_exceeded
- autonomous_unavailable
- crawl_depth_exceeded
- crawl_timeout
- crawl_rate_limited
- map_timeout
- map_no_sitemap
- map_robots_blocked
- sitemap_parse_error
- no_previous_version
### 3.5 Debug investigation events

Debug investigations use persisted `EventRecord` envelopes with the following stable `type` values. Collectively these rows define the `debug.investigation.*` event family; Assistant Chat consumes that family for status and visibility but does not duplicate its payload ownership.

| Event type | Minimum payload |
|---|---|
| `debug.investigation.started` | `investigation_id`, `project_id`, `thread_id?`, `run_id?`, `initiator_surface`, `target_kind`, bounded `target_locator_summary`, `requested_mode_overlay`, `effective_mode_overlay`, `runtime_mode` |
| `debug.investigation.state_changed` | `investigation_id`, `previous_phase?`, `phase`, `state`, `attention_reason_code?`, `blocked_reason_code?`, `verification_strength?` |
| `debug.investigation.target_bound` | `investigation_id`, `target_kind`, `target_bindings`, `binding_state` |
| `debug.investigation.context_item_added` | `investigation_id`, `item_id`, `item_kind`, `source_surface`, `state`, bounded `summary`, `artifact_ref?`, `redaction_state` |
| `debug.investigation.context_item_state_changed` | `investigation_id`, `item_id`, `previous_state`, `state`, `reason_code?` |
| `debug.investigation.instrumentation_state_changed` | `investigation_id`, `instrumentation_id`, `scope_kind`, `state`, `rollback_state`, `detail_ref?` |
| `debug.investigation.verification_recorded` | `investigation_id`, `verification_strength`, bounded `verification_summary`, `artifact_refs?` |
| `debug.investigation.exported` | `investigation_id`, `bundle_id`, `schema_id`, `item_count`, `artifact_count`, `redaction_profile` |
| `debug.investigation.imported` | `investigation_id`, `bundle_id`, `source_kind`, `schema_id`, `imported_target_kind` |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

Event rules:
- raw secrets, raw log dumps, raw trace blobs, and raw binary artifact bytes MUST NOT be duplicated inside these payloads
- raw material is referenced through artifact or blob refs owned by the appropriate artifact system
- bounded summaries must preserve redaction and omission state so downstream readers can tell what was intentionally trimmed or withheld

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

---

<a id="AuthState"></a>
### 4.1 AuthState
`AuthState` is the canonical persisted and evented auth snapshot for a provider subject. It records the selected identity, readiness state, and any provider-owned optional dimensions without forcing null-padding for dimensions that do not apply.

Example persisted row for a server-bridged OpenCode profile where the effective subject is a server profile and no billing-entity selection exists:
- `provider = opencode`
- `subject_kind = server_profile`
- `connection_profile_id = opencode-main`
- `provider_identity = http://127.0.0.1:4096`
- `auth_job_state = LoggedIn`
- `readiness_state = Ready`
- `credential_state = present`
- `configuration_state = ready`
- `availability_state = eligible`
- `updated_at = 2026-03-23T00:00:00Z`

The omitted fields in this example are intentional: `account_id`, `selected_billing_entity_id`, `auth_realm`, and `auth_surface` are absent because they do not apply to this server-profile-backed subject.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

Rules:
- `subject_kind`, `account_id`, and `connection_profile_id` follow the provider-specific rules in this document and in `Plans/Multi-Account.md`.
- `account_id` is present only when the selected runtime subject is account-backed; server-profile-backed rows omit `account_id` rather than null-padding it.
- `provider_identity` is provider-owned and may be an email, URL, local account label, or server profile id.
- `selected_billing_entity_id` is conditionally required: it MUST be present when the effective quota bucket depends on entity selection and MUST be omitted when the provider quota is purely account-scoped. Null-padding is not canonical, and omitted billing fields are not null-padded.
- This conditional-requirement is cross-referenced by `### Billing entity field contract`; consumers must follow that shared contract instead of restating a looser optional-field rule.
- `auth_realm` and `auth_surface` remain provider-owned optional fields; they are omitted when unused rather than backfilled with placeholder values.
- `connection_profile_id` is nullable except for OpenCode or similar bridge/profile-backed cases where the selected runtime subject is a server/profile connection rather than an account row.
- Server-profile-backed subjects may carry `launch_mode = managed_server | attach_existing` when PM must distinguish a managed server profile from an attached external server profile; this field is subordinate to `subject_kind = server_profile`, `connection_profile_id`, and the user-visible `label`.
- `auth_family` is the provider-facing auth bucket used for account/setup routing. Canonical values are `api_key`, `oauth_user`, `vertex_adc`, `vertex_service_account`, `vertex_api_key`, `subscription`, `chatgpt_oauth`, `server_managed`, or a provider-specific equivalent.
- Auth-surface separation is explicit for providers that can host mixed account pools. Gemini-style reference implementations expose separate `type: "oauth"` and `type: "api"` choices; key-based/API-key-derived accounts and bearer-token OAuth accounts are not one interchangeable credential. OAuth request preparation removes API-key headers and uses bearer-token auth for Code Assist-style endpoints, while quota commands that require OAuth must report an explicit error for API-key-based auth.
- Provider calls that depend on expiring credentials use proactive token refresh by check-before-use. Before each provider call, if the credential is within the provider-defined pre-expiry window, default `20%` of remaining lifetime where no stronger owner contract exists, refresh first; no background timer is required, and a reactive refresh after `401` is only fallback recovery.
- Account-state is orthogonal rather than one provider-specific enum. `credential_state` closes to `missing | present | expired | invalid | revoked`, `configuration_state` closes to `ready | needs_configuration | validation_required`, and `availability_state` closes to `eligible | cooldown | hard_blocked | disabled`. UI `/provider-level` chips such as `LoggedOut`, `LoggedIn`, `AuthExpired`, and `AuthFailed` are derived from lower-level account-state dimensions, and provider-jargon such as `needs_project` maps to user-facing `needs_configuration` where the missing setup is broader than a project id.
- Multi-account status summaries carry `control_mode` and `drift_state`; when the account is not `In Sync`, they also carry one-line remediation text plus primary actions.
- Filesystem and cache roots that depend on provider/account identity use stable IDs such as `account_id` and `connection_profile_id` rather than display names, avoiding rename drift and case-collision problems.
- Provider-normalized payloads must not introduce a second canonical field named `provider` where it would collide with `AuthState.provider`; use explicit names such as `requested_provider`, `effective_provider`, or `provider_identity` for non-auth-state meanings.
- Canonical auth/account vocabulary remains `platform`, `provider_identity`, `auth_surface`, `account_id`, and requested/effective runtime fields; `Contracts_V0.md` consumers must not fork those names into surface-local aliases.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/usage-feature.md

Attached external OpenCode providers use `provider = opencode-external`, `subject_kind = external_server`, and a stable `provider_identity` derived from the attached server profile. They omit `account_id`, `selected_billing_entity_id`, `auth_realm`, and `auth_surface` unless a provider-specific runtime contract explicitly requires one of those fields.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md
### 4.2 AuthPolicy
Defines deterministic defaults for auth method selection per provider.

Canonical enum contracts for implementation:
```text
ProviderAuthMethod = OAuthBrowser | OAuthDeviceCode | ApiKey | GoogleCredentials | CliInteractive
RequestedAuthMode = auto | oauth | api_key | device_code | google_credentials | cli_interactive
```

Rules:
- Cursor and Claude Code use `CliInteractive` (CLI-bridged only).
- Codex supports `OAuthBrowser`, `OAuthDeviceCode`, and `ApiKey` for direct-provider auth/calls, but product auth copy must distinguish the ChatGPT-plan-plus-API-key model: plan-backed ChatGPT access and API-key usage are separate paths with separate billing/limit semantics.
- GitHub Copilot uses `OAuthDeviceCode` for direct-provider auth/calls.
- Gemini Direct (`gemini`) uses direct-provider auth/calls with `ApiKey` only.
- Gemini CLI (`gemini_cli`) is a CLI-bridged provider entry that may resolve `oauth` requests through `CliInteractive`, `api_key` requests through CLI-managed API-key flows, and `google_credentials` requests through `GoogleCredentials` where the provider/runtime capability matrix supports them.
- OpenCode uses server credentials for server access plus provider-native auth managed by OpenCode.
- Anthropic Console/API setup surfaces use the helper action label `Sign in to Console/API` with helper text `Uses Anthropic API or workspace billing; cost and rate-limit reporting may be more precise` where the selected auth path can produce provider-authoritative billing or rate-limit data.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/CLI_Bridged_Providers.md, SchemaID:Spec_Lock.json#locked_decisions.auth_model

- Gemini Direct and Gemini CLI are separate provider entries and MUST NOT be collapsed into one mixed auth pool.
- `gemini` defaults `requested_auth_mode` to `api_key`.
- `gemini_cli` defaults `requested_auth_mode` to `auto`, and the provider-default auth-surface preference is OAuth/CLI-interactive first, then API key, then Google credentials, unless project/run policy overrides it.
- Explicit `oauth` or `cli_interactive` requests MUST filter to Gemini CLI accounts only.
- Explicit `api_key` requests MUST remain inside the selected provider entry's API-key-capable accounts.
- Explicit `google_credentials` requests MUST filter to Gemini CLI Google-credential accounts only.
- There is no silent cross-provider fallback between `gemini` and `gemini_cli`.
- The locked `auto` auth-mode rule is that `auto` follows provider, role, and account policy preference order for auth surfaces before account selection; it does not pick any credential opportunistically or bypass policy. Explicit auth-mode requests do not silently cross-fallback across account families or provider entries.
- Each mixed-pool account profile carries an explicit auth-surface `/method` such as `oauth`, `api_key`, or the provider's equivalent so account resolution can distinguish OAuth quota, API-key billing, and provider-specific capability paths.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

- `auto` resolves auth-surface preference before account selection and then chooses an eligible account inside the first viable surface.
- Same-provider accounts are not interchangeable. Policy precedence is: provider default -> account override -> role-by-provider override -> role-by-account override -> run snapshot -> attempt/message resolution.
- Manual `set active` / preferred-account selection is an override/debug control, not the default operating model.
- Manual `active-account` selection is an `/operator` override/control mode for debugging or explicit operator control. It is not the default operating model and must be recorded as requested state before effective resolution.
- For GitHub, default interactive auth MUST be OAuth device-code flow.
- CRITICAL OAuth callback integrity rule: a successful browser callback MUST NOT be overwritten by a later registration attempt. Any adapter that uses dynamic OAuth client registration MUST persist and reuse the stable `clientId` for the account/provider auth flow and serialize token writes; registering a new `clientId` on every call is forbidden because it can race with callback token persistence and replace a valid token.
- Auth reliability LESSON: managed OAuth flows use proactive token refresh by heartbeat, explicit precedence order `config > stored`, strict secret scrubbing before any LLM/tool exposure, differentiated `401/429/quota` recovery states, and platform-specific OAuth testing for callback and credential-store behavior.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md
### 4.3 AuthEvent
Auth flows MUST emit persisted events using `EventRecord` (§1.2), with stable `type` strings owned by the provider's plan.

Example (GitHub):
- `auth.github.device_code.issued`
- `auth.github.token.polling`
- `auth.github.authenticated`
- `auth.github.failed`
- `auth.github.disconnected`

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

### 4.4 Setup/Health lifecycle contracts
Canonical enum families for setup, health, and readiness:

```text
InstallableComponent = CursorAgent | ClaudeCodeCli | GeminiCli | Playwright | Nanobanana | OpenCodeServer
InstallJobState = NotInstalled | Installing | Installed | Uninstalling | Failed
AuthJobState = LoggedOut | LoggingIn | LoggedIn | LoggingOut | AuthExpired | AuthFailed
ProviderReadinessState = NeedsSetup | Validating | Ready | Degraded | ExternalNotManaged
AuthRealm = github_api | copilot_github
AuthSurface = oauth | api_key | chatgpt | google_adc | service_account_json | vertex_api_key | cli_interactive | console_api | sso
CredentialState = missing | present | expired | invalid | revoked
ConfigurationState = ready | needs_configuration | validation_required
AvailabilityState = eligible | eligible_pending_recheck | cooldown | hard_blocked | disabled
UsagePressureState = nominal | approaching_threshold | threshold_reached | exhausted | unknown
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

Lifecycle rules:
- Setup and Health MUST expose both `AuthJobState` and `ProviderReadinessState` when a provider can be authenticated but still blocked on configuration, billing/entity selection, trust, discovery, or validation.
- `CursorAgent` is the canonical installable/runtime target for Cursor CLI integration.
- `Nanobanana` is an installable helper for Gemini CLI media paths only when media is enabled.
- `AuthSurface = chatgpt` is the canonical user-facing direct-login family for Codex plan-backed usage.
- `google_adc`, `service_account_json`, and `vertex_api_key` are separate validation branches for Gemini CLI Vertex/Google Cloud setups and MUST NOT be collapsed into a single unlabeled "Google credentials" setup path in user-facing flows.
- `UsagePressureState` is provider-agnostic and maps authoritative counters, authoritative blocks, monthly-plan exhaustion, or weaker inferred pressure into one normalized scheduler vocabulary.
- Provider projections expose `pressure_state` with `nominal`, `approaching_threshold`, `threshold_reached`, `exhausted`, and `unknown` values; an `unhealthy` provider remains a readiness/health presentation and must not be collapsed into usage pressure.
- provider-reported cooldown windows remain facts; user actions such as `Temporary Pause`, `Resume Now`, and `Mark Needs Recheck` are PM-imposed overlays and MUST NOT overwrite the provider-reported cooldown metadata.
- Post-reset provider/account behavior is explicit: when `reset_at` or `cooldown_until` passes, the availability state becomes `eligible_pending_recheck` and the readiness projection enters `validating` until successful validation or the next successful run returns the account to `nominal` pressure or another observed state. Failed validation keeps the account blocked or in cooldown with updated evidence.
- Threshold or exhaustion handling records `resolution_outcome` as `honored`, `unknown`, or another owner-defined outcome so a `threshold_reached` or `exhausted` state can be audited without inferring the decision from prose.
- Usage warnings expose a configurable threshold, dismiss/quiet window, and path to Usage/config so non-blocking account pressure can be quieted without losing `/config` provenance or the `/quiet` period that explains why the warning is temporarily suppressed.
- A provider account can be auth-ready while unresolved workspace trust, first-run prompts, billing-entity selection, or validation requirements still keep the provider from being fully operational for a specific run context.
- Provider setup actions use stable action-progress labels such as `Sign In` -> `Signing In...` -> `Logged In`; provider-specific setup copy may specialize the provider name, but the lifecycle labels remain shared.
- For Claude Code import, `CLAUDE_CONFIG_DIR` is the account root boundary and auth import may seed only auth-bearing `credentials.json` / `.credentials.json` material before validation.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md

### 4.5 Provider State Lifecycle Mapping

Provider setup/health projection needs an explicit lifecycle mapping because provider-profile state, Executor Protocol node state, and PM runtime/contract state are related but not identical. The table below is canonical for provider-state reconciliation. It does not replace the canonical child-run lifecycle in §Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment; instead, it defines how provider-profile state should be understood when compared across those systems.

| Provider state | EP equivalent | Contracts equivalent | Notes |
|---|---|---|---|
| `unknown` | — | — | Pre-registration |
| `discovered` | `pending` | `created` | Provider found but not configured |
| `configuring` | `pending` | `initializing` | User entering credentials |
| `ready` | `pending` | `ready` | Configured, not yet used |
| `active` | `running` | `active` | Processing requests |
| `degraded` | `running` (with warning) | `degraded` | Working but with issues |
| `suspended` | `blocked` | `suspended` | Temporarily unavailable |
| `expired` | `failed` | `expired` | Credentials expired |
| `removed` | — | `deleted` | Provider removed |

When provider lifecycle is projected into canonical child execution, only execution-relevant states map through the child-run lifecycle directly: `active`/`degraded` correspond to active execution, `suspended` corresponds to blocked execution, and `expired` corresponds to failure. Discovery/configuration-only states remain provider-profile states and MUST NOT be misreported as in-flight child execution.
ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md

Model lifecycle is separate from provider account readiness. Model catalog records use `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`; `/sunset` is UI/help shorthand for this lifecycle family, not a separate state family. Dispatch setup records may carry `sunset_at_utc?`, `replacement_model_id?`, and `deprecation_notice_ref?` when the model owner exposes them, and `sunset` or `removed` models are ineligible for new dispatch unless an explicit compatibility policy permits them.

**requested/effective execution identity**

**AuthState account-backed identity fields**

| Field | Meaning |
| --- | --- |
| `effective_account_id` | Stable internal selected account identity captured in persisted auth state when the runtime subject is account-backed. |
| `effective_provider_identity` | provider-native metadata preserved for display and routing audit without replacing the stable internal account key. |
| `provider_account_id` | provider-native metadata key retained only as provider-native metadata subordinate to stable internal identity. |
| `execution_role` | Runtime disclosure role preserved with the effective auth snapshot. |
| `operational_identity` | Stable runtime and audit identity preserved with the effective auth snapshot. |

**AuthPolicy requested selection fields**

| Field | Meaning |
| --- | --- |
| `requested_account_id` | Explicit selected-account anchor for historical recovery and account-directed routing. |
| `requested_account_binding` | Binding mode that distinguishes preference from requirement. |
| `requested_account_policy` | Requested account-policy selection used before effective resolution. |

**provider-native metadata** remains subordinate to the stable internal account key.

Non-persona runtime field adoption is centralized here and in `Plans/Prompt_Pipeline.md`, `Plans/Multi-Account.md`, and `Plans/storage-plan.md` before any feature-specific packet depends on those fields. The `if/when` acceptance guard is intentional: accepted non-persona fields such as `requested_account_id`, `requested_account_binding`, `execution_role`, `operational_identity`, `projection_freshness`, and `projection_health` must land in the shared runtime contracts first, so `question`, `todowrite`, web, or other feature-specific docs do not invent shadow names or ad-hoc local versions. Feature-specific packets for `/tool/chat/etc` reuse canonical runtime field names and attach only additive child payloads for feature-specific execution details. `Plans/Multi-Account.md` remains the account-selection companion owner for these account and execution-role fields.

Rules:
- Requested state must remain recoverable in historical snapshots.
- Binding distinguishes preference from requirement.
- `provider_account_id` must be retired or explicitly governed as provider-native metadata subordinate to stable internal identity.

Permission carry-through:
- effective-account-scoped permission resolution must read `requested_account_binding` rather than a policy-only route
- `effective_account_id` must remain available to approval and permission snapshots

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Multi-Account.md#4.5 Selectable unit and runtime resolution

Required fields:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- effective_provider_identity
- provider_account_id
- execution_role
- operational_identity

Canonical record families:
- `provider_account_state`: provider/account current-state snapshot for auth, readiness, availability, pressure, selected billing/entity context, and provider-native metadata subordinate to stable account identity.
- `model_catalog_entry`: model-catalog record for provider/model/runtime availability, display metadata, capability facts, and requested/effective runtime compatibility.
- `provider_preferences`: configured provider, auth, account, model, runtime, and fallback preferences used as resolver inputs rather than as proof of effective execution.
- `requested_effective_runtime`: shared snapshot family that keeps requested runtime/provider/model/auth/account/preferences distinct from the effective runtime/provider/model/auth/account selected for an attempt.

Canonical terms and values:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- effective_provider_identity
- provider_account_id

Labels:
- requested/effective execution identity
- provider-native metadata

Behavioral rules:
- Requested state must remain recoverable in historical snapshots.
- Binding distinguishes preference from requirement.
- `provider_account_id` must be retired or explicitly governed as provider-native metadata subordinate to stable internal identity.

Permission carry-through:
- effective-account-scoped permission resolution must read `requested_account_binding` rather than a policy-only route
- `effective_account_id` must remain available to approval and permission snapshots
## 5. Context management (instruction scoping + attempt journaling + parent summary + `AGENTS.md` enforcement)


Context management keeps runtime identity explicit across prompt assembly, execution, approval, and historical review.

### 5.1A InvestigationContextAttachment
Investigation attachments remain additive and do not rename or shadow the shared runtime snapshot fields.

### 5.1B Persona/Runtime Snapshot Payload Contract

Runtime snapshot payloads preserve `requested_persona` and `effective_persona` as canonical Persona identity fields. The legacy aliases `requested_persona_id` and `effective_persona_id` are field-name drift, retired from canonical payloads, and migration-only: they may appear only in migration or source-lineage metadata and must not be reintroduced into live tool, chat, or storage payload shapes.

`PersonaSnapshot` is a migration compatibility label for this payload contract, not a separate schema family. When a runtime snapshot is embedded in `EventRecord.payload`, mode fields remain part of the runtime snapshot and use canonical names such as `runtime_mode`, `mode_family?`, and `mode_policy_ref?` alongside requested/effective Persona and runtime identity fields.

Legacy source labels `persona_active_persona_id`, `persona_display_label`, `persona_display_icon`, `persona_system_prompt_sha`, `mode_overlay_runtime_mode`, and `mode_overlay_ceiling` are source-lineage aliases only; live payloads use the requested/effective Persona fields, runtime identity fields, and canonical `runtime_mode`/`mode_family?`/`mode_policy_ref?` names instead of reviving the legacy snapshot vocabulary.


`execution_unit_context` is the authoritative runtime snapshot packet.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `lane_id`
- `package_id`
- `seam_id`
- `worktree_id`
- `execution_role`
- `requested_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `effective_account_id`
- `operational_identity`
- `tool_use_id`

Rules:
- Requested and effective account state stays explicit across runtime, approval, and usage surfaces.
- `requested_account_binding` distinguishes preference from requirement.
- `requested_account_policy` remains explicit in the stored snapshot.
- `operational_identity` and `tool_use_id` survive into downstream joins.
## 6. HITLRequest

Approval and recovery are anchored to runtime blocked episodes rather than to tier-boundary request objects.

Required runtime-facing fields are:
- `run_id`
- `node_id`
- `blocked_sequence`
- `attempt_id?`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `approval_scope_key`
- `approver_identity?`
- `detail_ref?`
- `report_ref?`

ContractRef: Plans/human-in-the-loop.md#Canonical HITL request contract, Plans/Executor_Protocol.md#Worktree-aware execution unit context

Labels:
- Blocked
- Waiting approval
- Action Required

Behavioral rules:
- `blocked_sequence` is the canonical approval anchor.
- Pre-attempt blocked episodes must not invent `attempt_id`.
- Chat and GUI action buttons derive from ordered `allowed_action_ids[]`.

Permission carry-through:
- approval scope remains blocked-episode-scoped rather than session-global
- ordered `allowed_action_ids[]` must survive into approval UI
### 6.2 Scope and persistence rules


Rules:
- approvals bind to canonical runtime identity first: `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`
- a blocked-episode approval does not imply a broader policy approval unless the `approval_scope_key` says so explicitly
- unresolved blocked episodes survive restart and are rehydrated rather than reminted opportunistically
- a failed approval attempt or failed switch of recovery action remains historically material and must persist in records/history

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

### 6.3 Compatibility boundary
Older request-centric payloads may continue to carry `request_id` for lineage and migration, but any consumer that mutates runtime state must resolve through the blocked-episode identity model.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
## 7. UICommand

### 7.1 Assistant worktree command registrations

Six UICommand registrations for assistant worktree operations. All require `activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`.

| Command ID | Label | Icon | Category | Extra when clause |
|---|---|---|---|---|
| `cmd.chat.worktree.create` | Create Worktree | `worktree-add` | chat | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.unbind` | Unbind Worktree | `worktree-unlink` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.remove` | Remove Worktree | `worktree-remove` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.merge` | Merge Worktree | `git-merge` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.pr` | Create PR | `git-pull-request-create` | chat | `activeThreadHasWorktree && projectHasGitHubRemote` |
| `cmd.chat.worktree.info` | Worktree Info | `info` | chat | `activeThreadHasWorktree` |

Compatibility aliases such as `cmd.chat.worktree.bind_existing`, `cmd.chat.worktree.open_files`, and `cmd.chat.worktree.create_pr` MAY route to the canonical assistant worktree commands above, but they are not replacements for the canonical six command IDs.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md

`UICommand` is the canonical command envelope. Shared navigation and identity-open primitives sit underneath public wrapper commands rather than beside them.

Required envelope fields are:
- `command_id`
- `command_kind`
- `args`
- `context?`
- `normalization?`

`command_kind` is closed to:
- `shell_view`
- `navigation_wrapper`
- `domain_action`

`normalization` is closed to:
- `wrapper`
- `deprecated_alias`

Rules:
- deprecated aliases point at `alias_of_command_id`
- stable wrapper commands point at `normalizes_to_contract`
- shell-facing commands may carry terminal-scoped identity args, but those identities still normalize through the canonical route and persistence model

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Crosswalk.md

### 7.2 UICommand envelope rules

ContractRef: Plans/UI_Command_Catalog.md#2.0 Command entry contract (doc-level), Plans/Crosswalk.md#3.1 Runtime orchestration ownership

Required fields:
- normalization.kind

Canonical terms and values:
- normalization.kind

Labels:
- command envelope

Behavioral rules:
- Wrapper metadata stays narrow and contract-level.
- Wrappers point to canonical primitive families only.
- Route payload structure is not restated inside command metadata.

### 7.3 `route_target`
`route_target` is the canonical navigation-and-focus contract.

Required fields:
- `target_kind`
- `project_id`

Allowed focus fields:
- `focused_run_id`
- `thread_id`
- `tab_id`
- `browser_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `inspector_target`

Exactly one selector is required:
- `subject_id`
- or `object_kind` + `object_id`

`target_kind` is closed to:
- `primary_view`
- `side_panel`
- `bottom_panel`
- `embedded_surface`
- `page_tab`

`subject_id` is closed to:
- `doc:<document_id>`
- `artifact:<artifact_id>`

`object_kind` is closed to:
- `thread`
- `message`
- `wizard`
- `usage_event`
- `run`
- `node`
- `attempt`
- `scheduler_pass`
- `blocked_episode`
- `safe_point`
- `remediation`
- `feature_seam`
- `work_package`
- `lane`
- `worktree`
- `concern`
- `promotion`
- `graph_patch`
- `graph_generation`
- `browser_session`
- `terminal_section`
- `terminal_tab`
- `terminal_pane`
- `terminal_session`
- `dev_session`

Terminal-focused `/open` and reveal contracts use the terminal object kinds above with the matching focus identifiers. A route that targets a terminal section, tab, pane, session, or dev session MUST stay in `route_target` object identity instead of inventing panel-local terminal routing semantics.

Terminal widgets target runtime/worker identity (`/worker`) and terminal object identity rather than using `tier_id` as the primary selector.

`inspector_target` is closed to:
- `summary`
- `evidence`
- `artifacts`
- `history`
- `reviews`
- `usage`
- `lineage`
- `details`

Rules:
- `project_id` is required
- route activation must override remembered shell state when needed to reveal the requested object, scope, and destination surface
- route activation may reuse remembered shell state when that state still reveals the requested object cleanly
- terminal routes prefer exact same-session reveal when `terminal_session_id` is supplied and still resolvable
- historical terminal routes may reveal a historical pane or receipt view, but they MUST NOT synthesize live PTY continuity
- `resume_url` is serialized transport only and decodes to `route_target`; it is not a stronger parallel primitive
- `route_target` owns `/focus/destination-surface` selection; docked/floating placement, widths, local panel layout, `/chrome`, `/editor/tree/session`, and other shell-realization details stay outside route identity and restore only as view state.
- Route activation restores destination surface plus scope-restoration fields such as `project_id`, `focused_run_id`, `thread_id`, selected object, and `inspector_target`; `inspector_target` is reusable detail/subsection focus (`/subsection`) after primary selector identity is established, not a replacement for selector identity.
- The narrow focus-refinement fields are `tab_id` and `inspector_target`; `inspector_target = lineage` is used for scheduler `/remediation/safe-point/patch` and scheduler `/safe-point/remediation/patch` lineage drill-ins when the object is already selected, while shell `/destination`, docked/floated (`/floated`) panel placement, workspace tab/window hosting, per-project layout, remembered local UI state, source-buffer realization, `line`, and `range` stay outside base route identity.
- `inspector_target` is useful for reusable detail-pane or subsection focus, not as a universal dumping ground for feature-local anchors. Use `inspector_target = usage` for graph/node/attempt pivots that keep the same object but focus the usage section; domain-local anchors remain object-family-specific and validated outside base route identity.
- Reuse is one-tab-per-path-per-group for `OpenFile`; opening the same path in another group requires explicit `multi-group` disposition rather than accidental duplication.
- Settings, `/object/navigation`, search/open entry points, chat links, file-tree selections, and wizard/object links normalize to `route_target` plus `OpenFile` or `OpenSubject` as the source realization; they MUST NOT own bespoke open behavior.
- Do not mint a brand-new routing primitive for generated, `/thread-backed`, `/artifact-backed`, browser-session, terminal-session, or dev-session reveals; use `route_target` for destination/focus and `OpenSubject` only for canonical document/artifact source realization.

Additional route resolver fields:
- `resolver_scope` closed to `project | run | thread | global`
- `route_recipe_id?` for owner-defined route recipes that bundle selector, destination, and inspector defaults
- `tab_family?` for surfaces whose tabs have owner-defined families
- `open_disposition?` closed to `reuse_existing | open_new | split_group | focus_only`

Route validity rules:
- Legacy labels `tab-family` and `open-disposition` map to `tab_family` and `open_disposition`; producers must use the canonical underscore field names in payloads.
- A route is rejected as `invalid_route` when `target_kind`, selector, `resolver_scope`, `tab_family`, or `open_disposition` is not valid for the destination surface.
- Resolver scope must be explicit when the same `object_kind` can exist in more than one run, thread, or project.
- `tab_id` is valid with `target_kind = page_tab` or with a routed page whose visibility depends on a known stable tab family; otherwise `tab_id` is rejected as shell-local state.
- `tab_id` does not replace `target_kind`; `tab_id` does not replace `inspector_target`.
- Route examples are normative selector examples: a chat search result uses `object_kind = message` with `object_id = <message_id>`, and a wizard resume uses `object_kind = wizard` with `object_id = <wizard_id>`.
- Scoped-resolution rules are part of the refinement layer: `blocked_episode` uses `object_id = blocked_sequence` and requires `focused_run_id` plus node membership inside that run; `scheduler_pass` uses `object_id = scheduler_pass_id` and requires `focused_run_id`; `safe_point` uses `object_id = safe_point_id` and requires `focused_run_id`; `remediation` uses `object_id = remediation_root_id` and requires `focused_run_id`; `attempt` uses `object_id = attempt_id` and requires `focused_run_id`.
- Selector precedence, reject rules, route examples, and scoped-resolution rules belong to `route_target` / `OpenSubject` refinement: `route_target` owns destination, scope, selector, and resolver validation, while `OpenSubject` owns identity-native source opening.
- Route activation may reuse an existing destination only when `open_disposition` permits reuse and the existing destination still reveals the requested object, scope, and inspector target.
- Route producers must not add a generic extra-args bag to bypass field validation.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

Labels:
- route target
- target kind
- object kind
- inspector target

Behavioral rules:
- Exactly one canonical primary selector is permitted.
- `project_id` is required.
- `target_kind` is destination class only, and `inspector_target` is focus refinement only after selector identity is established.
- `resume_url` is serialized transport of `route_target`, not a second routing ontology.

### 7.3A Debug target kind

`debug_target_kind` is the canonical investigation-target classification for Debug Mode. It names the operational class being investigated; it does not replace `route_target`, `OpenSubject`, or stored session identities.

`debug_target_kind` is closed to:
- `dev_session`
- `browser_target`
- `dap_session`
- `agent_session`
- `imported_bundle`

Rules:
- `dev_session`, `browser_target`, `dap_session`, and `agent_session` identify live or resumable PM-controlled targets.
- `imported_bundle` identifies an external investigation bundle that can be inspected and reasoned over without pretending PM can still drive the original runtime target.
- consumers may display requested and effective target details, but durable routing and opening continue through the canonical route/open contracts.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 7.4 OpenSubject
`OpenSubject` is the canonical identity-native source-open contract.

Required fields:
- `subject_id`
- `open_intent`

`open_intent` is closed to:
- `open_source`
- `open_preview`
- `open_review`

Rules:
- `OpenSubject` resolves canonical identity to the best source realization
- `OpenSubject` may resolve to `OpenFile` or to a transient `generated://<artifact_id>` buffer
- transport details do not belong in the `OpenSubject` contract itself
- terminal, dev-session, and browser-session reveals normalize through `route_target` rather than overloading `OpenSubject`
- Generated or `/artifact-backed` source results use `OpenSubject`; real workspace source results use `OpenFile`; thread-backed, browser-session, terminal-session, and dev-session reveals remain route targets.
- `OpenSubject` `subject_id` represents a source/open/preview/review subject, including `/open/preview/review` document or artifact content identity resolvable through `OpenSubject`.
- FileManager consumes `OpenSubject` for artifact/document/checkpoint/open-source and `/document/checkpoint/open-source` flows; `OpenFile` remains only for workspace-file path opens, so FileManager callers must not claim every open goes through `OpenFile`.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Canonical terms and values:
- doc:<document_id>
- artifact:<artifact_id>
- Everything else routes through object_kind + object_id

Labels:
- open subject
- subject identity

Behavioral rules:
- `subject_id` is bounded to canonical renderable/openable content only.
- Everything outside document/artifact families routes through `object_kind + object_id`.

### 7.5 settings-page ownership for panel-specific persistence and visibility

Settings-page organization owns durable panel-specific persistence and visibility controls when they affect reusable app or project preferences. Individual panels own live operational affordances, `Plans/storage-plan.md` owns persistence keys and write cadence, and `Plans/FinalGUISpec.md` owns the Settings grouping and visible placement.

Panel-specific controls are placed under the Settings tab for the owning surface when they are durable preferences: Source Control / Branching for worktree and git panel preferences, GitHub Actions for workflow and run visibility defaults, Docker Manager / Kubernetes for runtime and namespace visibility defaults, Terminal for terminal layout and restore behavior, File Manager for file tree and editor behavior, and Models / Providers for provider-backed panels. Cross-cutting visibility, shortcut, security, and health controls stay under General, Shortcuts, Advanced, or Health rather than being duplicated by each panel.

Live run actions, selected runtime objects, current inspector focus, and transient filter focus stay in the owning panel or `route_target`/`OpenSubject` payloads; they are not promoted into settings-page canon merely because the panel can display them.

### 7.6 Account-sensitive cache and requested-identity binding

GitHub Actions, Docker registry state, Kubernetes selections, and SSH remote selections MUST either store account-sensitive UI/cache state per effective account identity or invalidate that state on account switch. This closes the account partitioning and user-teaching/disclosure blind-spot for provider-backed panels.

Account-sensitive examples include pinned workflows, last-opened run/job/log focus (`/job/log` routes), namespace selections, and admin-readiness snapshots.

Queued or blocked work that depends on hosted auth or admin capability MUST persist `requested_account_identity` or an equivalent auth-handle reference with the blocked/requested record. On resume, if the active account changed, the action revalidates and either continues only under an explicitly accepted new identity or remains blocked as `identity_changed`.

This binding applies to Actions admin CRUD, workflow dispatch, image push or repository creation, and cluster mutations.

Runtime identity and admin identity are distinct capability sets. A GitHub identity may read runs without administering secrets or `/environments`; receipts, disabled states, `/requested` views, and `/disclosure` views must show which identity and capability set was evaluated for the attempted action.

Usage or quota pressure is treated as `exhausted` / failover-required only when Codex, the provider, or the selected plan actually refuses more usage; estimates, warnings, and approaching-threshold signals remain pressure evidence rather than automatic failover triggers.

ChatGPT-backed Codex usage is plan-dependent and may have plan-included limits; API-key usage is a separate path and must not be conflated with ChatGPT plan-included quota.

For Codex, explicit provider responses plus rate-limit and `/reset` hints outrank local token statistics when PM evaluates pressure, cooldown, or recovery timing.

Claude Code subscription accounts have weaker cost precision and provider-specific cooldown semantics than Console/API accounts: `/cost` is API-billing evidence, while subscriber-backed rows use `/stats` as softer pressure evidence unless the runtime or provider explicitly reports exhaustion.

Account recovery projections expose common actions `Retry Sign-In`, `Choose Billing Entity`, and `Refresh Entitlements`; when billing-entity selection is missing for premium requests, state becomes `Needs setup` with text explaining that the user must choose a billing entity.

GitHub Copilot setup copy may use `Uses your GitHub Copilot license and organization policies` for the sign-in helper and `Choose Billing Entity` when multiple eligible organizations or enterprises can pay for premium requests.

Account skip/cooldown reasons are separate machine values such as `rate-limited`, `model-unsupported`, `workspace-deactivated`, and `auth-invalid`; `/cooldown` display groups must preserve the underlying reason.

Provider-facing usage labels prefer product language over raw internal field names: `Codex` displays `Plan` or `Usage Bucket`, and `Claude Code CLI` displays `Subscription` or `API Billing` where those labels explain the effective entitlement or billing bucket.

`policy_blocked` displays as `Blocked by plan or policy` and should include the provider-specific reason where known, such as billing entity required or overage disallowed.

The current predicted requested/effective state must remain visible in the runtime inspector and must not be hidden behind Usage/history/diagnostics. Deeper historical or `/run-specific` requested/effective inspection belongs in `/history/diagnostics`, but it is supplemental to the current predicted state.

The canonical-vs-internal split is audit-visible: requested/effective identity, clamping outcomes, and `/switching` outcomes belong in canonical snapshots, while provider-registry or scheduler-only internals remain subordinate evidence unless a debug/audit contract promotes them.

## 8. UI Scaling

The application exposes a user-facing UI scale setting (Settings → General tab).
In the Slint rewrite this MUST be implemented via Slint's native window/global scale-factor mechanism.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2

**Contract fields:**

| Field | Value |
|-------|-------|
| `scale_range` | `[0.75, 1.5]` (clamped) |
| `presets` | `[0.75, 0.9, 1.0, 1.1]` |
| `default` | `1.0` |
| `mechanism` | Slint native scale factor (window-level) |
| `prohibited` | Per-token manual scaling / Iced-era `ScaledTokens` multiplication layers |

Rules:
- UI scale MUST use Slint's native global/window scale factor as the **only** scaling path.
- Per-token manual scaling (e.g. the legacy Iced `ScaledTokens` multiplication approach) MUST NOT be ported to Slint view code.
- The same four preset buttons (75 %, 90 %, 100 %, 110 %) MUST appear in Settings → General.
- Editor text zoom (Ctrl+= / Ctrl+−) is independent of app-level UI scale.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

## Usage and Billing Contracts Addendum


### Cost field type contract


All persisted usage/cost values are stored as integer microdollars (`u64`). Presentation converts to decimal currency strings; storage and accumulation do not.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

### Thread context detail and usage display contract
Assistant chat-thread usage surfaces use a shared context-detail contract instead of a chat-local side panel. The stale direct-click detail-open pattern is replaced by a hover info-popover plus `More Details`: hover shows the compact thread status module, selecting `More Details` opens the context-detail editor-tab detail-surface, and the click-triggered action on the context circle is `Compact Now`.

The compact-row schema for the under-message summary and the `Messages` tab is closed to role, worker type, mode, model, time or `/duration`, total tokens, and cost. `Messages` renders one expandable row per message. The expanded message info-popover uses the closed Assistant Chat field list and label rules for `Mode`, `Provider`, `Model`, `Effort`, `Persona`, `Worker`, `Tokens`, and `Context`; expanded detail rows may add token breakdown, context usage, cost, relevant requested `/effective` deltas, and notable tool `/part` summary. `Resend` remains the message action that retries the most recent user message and discards later history or work.

The context-detail editor-tab has top-level `Curated` and `/raw` inspection paths. `Curated` contains Overview, Breakdown, and Messages. `/raw` may expose serialized payloads, provider metadata blobs, and path/runtime data for `/log`, `/detail`, and `/debugging` without making those lower-level fields chat-facing labels. Deep Plan remains a distinct `/workflow` identity and display label rather than being collapsed into generic plan mode.

Thread cost labels are `Estimated Cost` unless PM has provider-authoritative cost semantics for that value. The estimated-cost baseline may use the OpenCode-style normalization formula, but contracts must preserve provider-reported buckets, provider-sensitive cache normalization caveats, and over-200k pricing tier selection where available. Raw/log/debug paths preserve the normalization path and raw bucket values for audit.

Implementation readiness pins canonical schema and `/field` names only when they are part of planning-doc contracts, persisted payloads, runtime identity objects, or cross-doc shared vocabulary; it does not require naming every implementation-local helper, variable, or UI component ahead of time.

### Token bucket contract


The canonical token fields are:
- `input_tokens`
- `output_tokens`
- `cache_read_input_tokens`
- `cache_creation_input_tokens`
- `reasoning_tokens`

Provider-specific token counting flows through a token-counting abstraction before these buckets are persisted. Usage events and run-completion snapshots preserve `token_counting_adapter_id`, `token_counting_basis`, and optional provider raw-count metadata when provider semantics differ; raw counts explain the canonical buckets but do not replace them.

These fields are individually persisted. Storage-layer aggregation or collapse into a smaller field set is prohibited. The product LESSON from provider cost failures is that every LLM call, including title generation, summaries, hidden helper passes, subagents, and other background ops, emits usage with separated input, output, cache_read, cache_write, and reasoning buckets. Client-side spending limit enforcement reads the canonical usage stream rather than an optional display rollup.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md

`total_tokens` MAY be stored or derived for convenience, but it MUST NOT replace the individual token buckets.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Usage attribution contract
Usage records and normalized usage events MUST preserve:
- `provider_id`
- `model_id`
- `account_id` when the provider/runtime surface is account-backed
- `provider_account_id?` and `/account-label` only as provider-native/display metadata subordinate to stable account identity when needed for future multi-account UI
- `parent_run_id` when usage is emitted by a child run, tool, title-generation pass, summary pass, or other background operation
- per-message model attribution for every user-visible or background LLM call
- parent aggregation keys so subagent costs roll up to the parent run without losing the child usage event
- `billing_entity_id` when quota semantics depend on it
- `entitlement_class` when provider routing, quota, or pricing semantics depend on it
- `usage_source_kind` so Gemini and similar providers can distinguish `local-estimated`, API-key-derived, OAuth-quota-derived, and `/API-key-derived/OAuth-quota-derived` attribution rather than collapsing all usage into one projection
- usage-window metadata, including `window_label` and `window_scope`; `window_scope` is closed to `provider | account | account+model | org | server_profile`
- `cache_hit?`
- `cache_strategy?`
- The display/review phrase usage-record maps to canonical `usage_record`; the canonical object only adds fields that materially affect attribution, rollups, or cross-surface clarity.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Rules:
- usage attribution is keyed by the canonical tuple `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those fields are known
- Per-node UsageRecord consumption, worker-identity surfaces, and model-selection SSOT must stay coherent when `/auth/account` attribution expands. `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, and `Plans/Models_System.md` are consumers of this contract; node-level usage display must not restate or conflict with the requested/effective account model.
- High-value Gemini contradictions are tracked here because they affect core auth and usage contracts: direct-provider planning is valid, but GUI/spec copy must not over-focuses API key or under-specifies OAuth as a distinct surface. Usage and account wording must keep OAuth bucket semantics distinct from API-key semantics.
- Provider-settings/auth UI specs must expose OAuth login, `/re-auth/logout`, and status independently from API key presence/config, explain what each mode unlocks and which bucket it uses, and define precedence when both are present.
- bridge adapters, storage snapshots, analytics rollups, and UI projections MUST NOT collapse that tuple to `billing_entity_id` alone when account or entitlement context exists
- background/helper usage keeps the same attribution tuple and lineage through `parent_run_id` rather than inventing a second attribution model
- Bridge-visible usage fields that affect spending-limit checks must round-trip through the normalized stream and remain aligned with `Plans/Run_Modes.md` and `Plans/CLI_Bridged_Providers.md`; UI, storage, and rollup consumers may summarize display text, but they cannot drop account, entitlement, or source-kind fields needed for enforcement.
- `run.completed.usage` snapshots MUST NOT use the legacy `(tokens_in, tokens_out, cost, thread_id)` tuple as the persisted contract. If compatibility import sees legacy `tokens_in`, `tokens_out`, or `cost`, it maps them into the canonical token buckets, microdollar cost fields, attribution tuple, and runtime lineage; this migration work is separate from already-fixed root-precedence rules.
- Cost accumulation is monotonic, non-decreasing, and /non-negative across a cumulative-session, including model-switch scenarios. A model-switch cost sign-flip or provider correction that would otherwise produce negative-raw-cost is recorded as an explicit /adjustment or clamp event rather than retroactively decreasing prior displayed usage.
- `cost_usd` is presentation-only and derived from stored microdollars. Sub-cent display uses an adaptive precision tier, including `<$0.01 => 6 decimals`, while persistence remains integer microdollars; a negative-cost display is always backed by an explicit adjustment record, never by mutating prior usage.
- Contracts mirror the usage-event field blocks needed by `Plans/Executor_Protocol.md` consumers without copying protocol /prose: `### 7.1 Classified outcome matrix`, `### 7.2 Doom-loop guard`, `### 7.3 Signal handling and process lifecycle`, and `### Blocked and retry behavior` remain protocol anchors, while `### Usage attribution contract` owns the shared attribution tuple. BrainStorm and subagent-collaboration consumers use these owner contracts rather than defining parallel usage or retry fields.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Architecture_Invariants.md

Legacy audit closure note: `LF-004` and `LF-008` identify the old same-file contradiction between `### 4.1 AuthState` examples and `### Billing entity field contract`; they are resolved by the conditional omission rules above. Audit verdict words such as `MINOR`, `MOSTLY`, and `CONFIRMED` are not schema states. Stale TODOs, case-folding examples, and shell-isolation notes remain non-authoritative unless restated in the relevant owner contract; `timeout_ms` and shell execution envelopes belong to executor/runtime contracts, not usage attribution.

### Spending limits and budget enforcement

Spending-limit enforcement reads the canonical usage_record stream and its legacy `/record` review marker through the same attribution tuple. Pre-dispatch checks that exceed budget emit `kill.budget_exceeded`; post-response `/post` recording that discovers an overrun emits `done.budget_exceeded` and persists overrun evidence rather than rewriting prior usage.

The canonical usage pipeline is `seglog -> analytics scan -> redb rollups -> UI`. Rollups preserve per-run, per-session, and per-tool attribution, including `parent_run_id`, `cache_hit?`, and `cache_strategy?`, so helper calls and subagent work remain explainable without collapsing child usage into display-only parent totals.

CLI bridge consumers stay aligned with `Plans/CLI_Bridged_Providers.md` owner sections named `### HTTP/status to failure-class mapping`, `### Normalized usage event minimum fields`, and `### Stream cancellation and replay safety`. For bridge-side consumer-field projections, `402 / quota_exceeded` is no-retry and upgrade-facing, `429 / rate limit` remains a distinct rate-limited class, and transient circuit-breaker windows preserve the owner value such as `2 minutes` instead of redefining it in this contract.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

### Provider cache accounting policy

OpenRouter cache policy is explicit:
- PM records the provider cache-key policy used for an OpenRouter request when cache behavior affects reuse, billing, or debugging.
- OpenCode-sourced OpenRouter requests that expose `prompt_cache_key` keep that key as provider/cache metadata; TTL evidence from `#16848` and `#16850` informs adapter policy, while cache-write accounting evidence from `#18440` maps into PM usage buckets instead of redefining storage persistence.
- PM records the OpenRouter cache TTL policy as provider/cache metadata and must not treat TTL as a PM-owned persistence guarantee.
- OpenRouter `/accounting` records preserve the cache TTL policy used for the request so cost, cache reuse, and debug views can explain provider behavior without inventing PM-owned cache persistence.
- OpenRouter cache-write token accounting maps into the canonical cache token buckets; cache-write tokens are persisted in `cache_creation_input_tokens`, and cache reads remain in `cache_read_input_tokens`.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md

### Billing entity field contract

`requested_billing_entity_id` and `effective_billing_entity_id` are conditionally required fields. A provider includes them only when billing entity selection exists for that provider and when the field is meaningful in the current flow.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

This conditional-requirement contract applies uniformly wherever billing entity selection is surfaced:
- In `EventRecord.payload`, fields are present only for provider flows that expose billing entity selection.
- In `AuthState`, the persisted selection field is present only when the effective quota bucket depends on entity selection; otherwise the field is omitted.
- In usage attribution, canonical attribution is keyed by `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those dimensions are known. `billing_entity_id` alone is never a sufficient canonical substitute when account or entitlement context exists.

UI readiness projections that mention `pm.lock`, viewer-mode, MCP lazy-load, or `/startup-time` are contract consumers. `pm.lock` and viewer-mode messaging follow the storage/runtime lock contract, while MCP lazy-load and startup-time UX defer to the MCP/tool owner docs; Contracts_V0 only requires those projections to preserve the referenced owner state and not mint parallel status fields.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md

## Scheduler, Safe-Point, and Remediation Events Addendum (2026-03-08)


Add the following event families to the canonical contract set.

### 1. Scheduler analysis and readiness events

#### `scheduler.pass`

Canonical `wake_reason` values include prerequisite, approval, clarification, auth, startup, backoff, verification, and remediation wakes; `startup_recovered` is the scheduler-pass value used for the first pass after startup recovery, while `watchdog_recheck` is a defensive verification wake that may recheck readiness without becoming the primary correctness path.


> **Migration note:** `run.scheduler_analysis` is a deprecated legacy alias for this event. New producers MUST emit `scheduler.pass`. Consumers SHOULD accept both during migration.

ContractRef: EventType:scheduler.pass, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `scheduler_pass_id` (canonical identity -- `analysis_id` is a legacy alias)
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]`
- `selected_nodes[]` with per-node `{ node_id, score_tuple, lane }`
- `non_selected_nodes[]` with per-node `{ node_id, non_selected_reason }`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `run.node_ready`
Minimum payload:
- `run_id`
- `node_id`
- `ready_since_utc`
- `wake_reason`
- `replan_generation`

#### `node.blocked`

> **Migration note:** `run.node_blocked` is a deprecated legacy alias for this event. New producers MUST emit `node.blocked`.

Approval scopes that still use tier boundaries normalize to `/node/blocked` runtime scope: blocked-episode identity is anchored by run/node/blocked sequence, not by tier boundary, tier type, or page-local approval grouping.

ContractRef: EventType:node.blocked, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_reason_code`
- `blocked_sequence`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- `failure_class?` (only when the block originated from a classified outcome)
- `timeout_class?` (only when the blocked state originated from a timeout-class event)
- `wait_state_class?` (only when the blocked state represents a known wait)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `node.unblocked`

> **Migration note:** `run.node_unblocked` is a deprecated legacy alias for this event. New producers MUST emit `node.unblocked`.

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence`
- `resolution` (the action that resolved the block)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 2. Retry/backoff events

#### `run.node_backoff_started`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `backoff_until_utc`
- `retry_count`
- `ts`

#### `run.node_backoff_expired`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `ts`

#### `run.node_retry_scheduled`
Minimum payload:
- `run_id`
- `node_id`
- `prior_attempt_id`
- `retry_count`
- `failure_class`
- `safe_point_id?`
- `ts`

### 3. Safe-point events

#### `safe_point.created`


Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_id?`
- `worktree_path?`
- `worktree_branch?`
- `working_directory?`
- `baseline_ref`
- `replan_generation`
- `ts`

When a safe point is created from a worktree-bound execution unit, `safe_point.created` carries the worktree snapshot fields (`worktree_id`, `worktree_path`, `worktree_branch`, and `working_directory`) so restore, retry, and UI history can return to the same worktree context instead of silently substituting the main project root.

#### `safe_point.restored`
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `restore_outcome`
- `ts`

#### `restore_outcome` enum

Canonical values for the `restore_outcome` field in `safe_point.restored` events:

| Value | Meaning |
|-------|---------|
| `restored_clean` | All files and state restored to safe-point snapshot without conflicts. |
| `restored_with_conflicts` | Restore completed but one or more files had merge conflicts requiring resolution. |
| `restore_failed` | Restore could not be applied; original state preserved. |
| `restore_skipped` | Restore was requested but determined unnecessary (state already matches safe-point). |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### FileSafe snapshot event compatibility

FileSafe may emit compatibility producer event names `filesafe.snapshot_created`, `filesafe.snapshot_conflict`, and `filesafe.snapshot_restore` when it creates, detects a conflict for, or restores a mutation safe-point snapshot. These names are FileSafe-facing wrappers for the Contracts-owned safe-point event contract, not separate event-family owners: creation maps to `safe_point.created`, restore maps to `safe_point.restored`, and conflict reporting carries the same safe-point/snapshot identity with a `restore_outcome` or `conflict_reason_code` as applicable. Minimum payload fields are `snapshot_id`, `safe_point_id`, `run_id`, `node_id?`, `attempt_id?`, `target_path?`, `conflict_reason_code?`, `restore_outcome?`, and `ts`.

### 4. Remediation lineage events


#### `remediation.spawned`

> **Migration note:** `run.remediation_started` is a deprecated legacy alias for this event. New producers MUST emit `remediation.spawned`.

ContractRef: EventType:remediation.spawned, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `remediation_generation`
- `parent_failure_class`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `remediation.resolved`


> **Migration note:** `run.remediation_completed` is a deprecated legacy alias for this event. New producers MUST emit `remediation.resolved`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `resolution` (`fixed` | `superseded` | `abandoned` | `replan_required`)
- `ts`

`remediation_ceiling_exceeded` remains a blocked-state outcome (`blocked_reason_code`), not a `remediation.resolved.resolution` value.

The legacy remediation completion enum `success|failed|ceiling_exceeded` is source-lineage for older completion prose only; canonical `remediation.resolved.resolution` uses `fixed|superseded|abandoned|replan_required`, with `ceiling_exceeded` represented through blocked-state outcome vocabulary rather than the resolution enum.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 5. Degradation / integrity events

#### `plan.decomposition_degraded`
Minimum payload:
- `project_id`
- `source_stage`
- `reason_code`
- `original_shape`
- `degraded_shape`
- `evidence_ref`
- `ts`

#### `run.graph_integrity_failed`
Minimum payload:
- `run_id`
- `reason_code`
- `detail_ref`
- `replan_generation`
- `ts`

### 6. Wizard blocked escalation events


#### `wizard.blocked`
`wizard.blocked` is not standalone navigation or blocked-state ownership; it decodes through `route_target` plus blocked/remediation identity, with `resume_url` as serialized transport only and `report_ref` / `detail_ref` as inspection references.

Minimum payload:
- `wizard_id`
- `thread_id?`
- `round_count`
- `report_ref`
- `resume_url`
- `ts`

#### `wizard.unblocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `resolution_source`
- `ts`

### 7. Contract rules

- Events above are canonical ledger events, not debug-only instrumentation.
- All UI and storage projections added by this packet derive from these events or fields normatively referenced by them.
- `safe_point.*` events are runtime-internal recovery records and are distinct from user-facing `restore_point.*` / `rollback.*` contracts.
- `plan.decomposition_degraded` is allowed only before canonical graph lock.
## Runtime Scheduler / Attempt Lineage Contract Addendum (2026-03-09)


Add the following canonical runtime event families and required fields.

Required fields:
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]` with score breakdown terms
- `selected_nodes[]`
- `non_selected[]` with `non_selected_reason`
- capacity summary

ContractRef: Plans/Executor_Protocol.md#Wake reasons and coalescing

Required fields:
- startup_recovered

Canonical terms and values:
- scheduler.pass
- startup_recovered

Labels:
- scheduler pass

Behavioral rules:
- The first scheduler pass after startup recovery persists `wake_reason = startup_recovered`.
- Blocked and recovery wake ownership is carried by `scheduler.pass` rather than inferred from prompt text.
### `attempt.started`


Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `scheduler_lane`
- effective requested/effective model snapshot
- effective permission snapshot identifier
- `safe_point_id` when present
- `remediation_root_id` / `remediation_parent_attempt_id` when present
- `replan_generation`

### `attempt.completed`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- terminal state
- `failure_class` or success marker
- retry count and backoff metadata
- verification / reviewer result references when relevant
- resolved lineage identifiers

### `node.blocked`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id` if an attempt existed
- `blocked_reason_code`
- `failure_class` when the blocked state originated from a classified outcome
- `timeout_class` when the blocked state originated from a timeout-class event
- `wait_state_class` when the blocked state represents a known wait
- ordered `allowed_action_ids[]`
- `auth_realm`, `missing_scopes[]`, or side-effect metadata when relevant
- whether local work was preserved

### `safe_point.created` and `safe_point.restored`
Required fields:
- `safe_point_id`
- `run_id`, `node_id`, `attempt_id`
- workspace / worktree reference
- `replan_generation`
- reason for creation or restore
- restore result

For a worktree-bound attempt, `safe_point.created` MUST capture the exact worktree snapshot fields `worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`. Restore and retry flows verify the captured worktree context and expected `HEAD_sha` before mutation-capable work continues; if the worktree path, branch name, or HEAD state no longer matches, the recovery flow reports a blocked/stale baseline rather than silently substituting the main project root or a different worktree.

### `remediation.spawned` and `remediation.resolved`
Required fields:
- `remediation_root_id`
- `remediation_parent_attempt_id`
- child `attempt_id`
- finding / issue references
- `remediation_generation`
- resolution enum (`fixed`, `superseded`, `abandoned`, `replan_required`)

### `tool.denied` alignment


`tool.denied` MUST carry canonical runtime mapping fields when the denial affects scheduler state:
ContractRef: EventType:tool.denied, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- `failure_class`
- ordered `allowed_action_ids[]`
- `headless_denied` boolean
- effective permission snapshot identifier

All of the above are canonical contract fields, not UI-only projection conveniences.
## Canonical Runtime Taxonomy and Event Precedence Canonical Alignment (2026-03-09)


This section is an exact compatibility mirror of the later canonical runtime contract so readers do not stop at stale transitional enum lists.

### Event-name precedence
| Canonical event | Legacy alias | Rule |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler.pass` is canonical. |
| `node.blocked` | `run.node_blocked` | `node.blocked` is canonical. |
| `node.unblocked` | `run.node_unblocked` | `node.unblocked` is canonical. |
| `remediation.spawned` | `run.remediation_started` | `remediation.spawned` is canonical. |
| `remediation.resolved` | `run.remediation_completed` | `remediation.resolved` is canonical. |

### Canonical enum families
`failure_class`:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `auth_expired`
- `storage_io`
- `quota_exceeded`
- `rate_limited`
- `graph_integrity`

`blocked_reason_code`:
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `network_blocked_by_policy`
- `host_unreachable`
- `host_untrusted`
- `replan_required`
- `waiting_approval`
- `clarification_blocked`
- `worktree_conflict`
- `dirty_worktree`
- `plugin_hook_blocked`
- `validation_blocked`
- `remediation_ceiling_exceeded`

`offline_cached` is a read-only surface/projection state, not a `blocked_reason_code`. Mutating `/runtime`, `/registry`, Kubernetes, plugin-added, or `/extensibility` actions from `offline_cached` state must still emit a canonical blocked payload when policy or host state prevents execution, using `network_blocked_by_policy`, `host_unreachable`, or `host_untrusted` rather than generic network failure.

These blocked-state primitives are the canonical contract for worktree-heavy Source Control and Orchestrator recovery surfaces; settings and consumer docs may expose them, but they do not re-own blocked-state identity.

Domain blocked-payload details for SCM, GitHub Actions, and Docker/Kubernetes are schema-bearing details on top of the shared blocked-state primitives. SCM payloads for `dirty_worktree` and `worktree_conflict` carry `repo_id`, `worktree_id`, dirty/conflict file refs, affected files summary, safe-point relation, recovery target, and recovery command refs. Mutation-capable SCM attempts also carry branch and head refs so consumers can resolve the attempted action to `repo/worktree/branch/head` without guessing. GitHub Actions payloads carry hosted reason detail for auth expired, `missing scope`, `no GitHub remote`, `rate-limited`, and `environment waiting for review`, plus workflow/job/step refs, code-pivot refs, and readiness refs for secrets/variables/environments. Docker/Kubernetes payloads carry reason detail for `runtime unavailable`, `repo missing`, `Buildx/Bake unavailable`, `compose invalid`, `cluster unreachable`, and `namespace/workload missing`, plus image, compose, context, namespace, workload, and rollout refs.

`allowed_action_id`:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `restore_safe_point_then_retry`
- `start_fresh_attempt`
- `replan`
- `skip_node`
- `abort_run`
- `open_details`

Command shorthand `/abort` resolves to `abort_run` or the provider-specific stream cancellation action for an in-progress provider call; persisted approval and blocked-state payloads keep the canonical `allowed_action_id` rather than storing the slash command as a separate action identity.

### Temporal outcome and timeout-class taxonomy

Runtime records that describe elapsed time, observation gaps, or known waits MUST carry `timeout_class?` only when a timeout-class event actually occurred.

Canonical `timeout_class` values are:
- `hard_execution_timeout` (`hard execution timeout`): execution budget expired and the runtime ended, cancelled, or blocked the operation.
- `inactivity_timeout` (`inactivity timeout`): no qualifying activity arrived before an inactivity threshold.
- `polling_timeout` (`polling timeout`): a poll loop or remote status refresh exceeded its observation budget without a terminal remote answer.
- `reconnect_timeout` (`reconnect timeout`): an interrupted stream or `/session` failed to revalidate or reconnect before its reconnect budget expired.
- `user_visible_wait_timer_expiry` (`user-visible wait timer expiry`): a timer shown to the user expired while the workflow was otherwise in a known wait state.

`timeout_class` is distinct from `failure_class` and `blocked_reason_code`; it is a recovery discriminator that `/receipts`, blocked events, blocked projections, and receipt-linked runtime artifacts retain because recovery differs by class. A timeout may later produce `/failed` state only when the owning runtime contract declares that outcome; the timeout class itself is not a generic failure substitute.

Known waits use `wait_state_class?` instead of being collapsed into generic `deadlock/stall` states. Canonical wait classes include:
- `environment_wait_timer`
- `approval_wait`
- `queue_wait`
- `long_governance_wait` (`long-governance-wait`)
- `scheduled_workflow_observation_gap`
- `future_timestamp_wait` (`future-timestamp`)

A scheduled workflow with no fresh observation is not skipped/failed by inference alone. A known future-timestamp wait is not a timeout until its governing timer actually expires, and it MUST NOT produce a `/stall` banner or `auto-pause` behavior reserved for deadlocked work.

Timestamp provenance, time-source, and clock-skew blind-spot rules:
- Temporal records distinguish `source_occurred_at` from the remote, provider, or runtime when available; `observed_at` when Puppet Master received the event; and `recorded_at` when the event was persisted locally.
- Persisted timestamps are UTC ISO-8601 values with `Z`. UI surfaces display local timezone by default and expose absolute UTC in detail or hover.
- Ordering prefers Puppet Master's canonical local sequence/order when remote wall-clock time conflicts with local ordering. Remote `/provider/runtime` wall-clock time remains evidence, not the ordering authority, when clocks disagree.
- Relative labels such as `5m ago` derive from one chosen base timestamp per surface and must not silently mix receive, `/update/log`, and persistence times.
- GitHub Actions, SSH remote git state, Docker runtime, and Kubernetes events may report skewed clocks. When skew is material, the UI warns with `clock_skew_detected` and avoids duration or `/staleness` claims based only on remote timestamps.
- Scheduled-workflow projections declare displayed schedule timezone, next-run computation source, missed-run behavior while the app is closed or offline (`/offline`), and the stale threshold for `next run overdue`. Orchestrator and receipts must not mark a scheduled workflow skipped or `/failed` merely because no fresh observation arrived.

### Blocking payload rule


Every runtime-facing blocked event or projection MUST expose:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- prerequisite metadata needed to bind the recovery command
- `preserved_local_work`
- `requires_safe_point_restore?`
- `failure_class?`
- `timeout_class?`
- `wait_state_class?`
- `detail_ref?`

No section in this file may present an earlier shorter enum set as the canonical value family.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
## Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)


The canonical runtime event contract extends to child runs, crew coordination, and effective-context shaping. These contracts are part of the same runtime event and action family as parent execution. They are not an optional overlay and they do not define a separate event grammar.

### Child-run lifecycle and projection

PM child runs are canonical runtime entities with stable identity, lineage, and lifecycle. Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members all project into this same model. Disposable-by-default child lifecycle is the default product posture; long-lived or reopened child identity is the exception path.

This contract consumes the Persona definitions in `Plans/Personas.md` at `### 1.2 Subagent` and `### 5.1 Selection`, and it projects child lifecycle through `### 8.0 Event payloads (seglog)` rather than local status text. `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md` in legacy path references) is a provider-facade consumer of this child-run + Persona-storage contract, not a separate child-run ontology.

Canonical child lifecycle states are: `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, `cancelled`. `superseded` remains a terminal reason used when replacement occurred, even if the user-facing terminal state is still presented as `cancelled` or `complete` in some consumers.
ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]

Canonical child-run records preserve identity `/lineage`, role `/routing`, lifecycle state, attempt/resume state, effective capabilities `/runtime`, context `/handoff`, grouping structure, and result `/history` references. Chat `/storage/orchestration` projections consume those canonical events and MUST NOT invent child-only shadow state machines.

Child-to-parent signals are canonical runtime events, not ad hoc UI messages. At minimum the contract family includes: `progress`, `result`, `blocked`, `clarification_needed`, `context_expansion_requested`, `user_input_requested`, `failed`, `cancelled`. Parent orchestration may summarize, consolidate, or route these signals, but canonical event identity must remain intact.
ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]

The child event-model covers `/start/progress/work/thought/pause/block/outcome/retry/reroute/resume/grouping/context-shrinking` transitions as normalized runtime events, not as consumer-local prose states.

Legacy user-facing signal labels may render as `clarification-needed`, `context-expansion-needed`, and `user-input-requested`, but they map back to canonical child-to-parent runtime events rather than ad hoc message strings.

Chat-facing projection events may normalize child lifecycle into UI-specific projection envelopes, but they MUST preserve the underlying canonical child identity fields. Required fields remain `child_run_id`, `parent_run_id`, `thread_id`, timestamp, attempt identity when relevant, and requested/effective persona/runtime descriptors when the event semantics depend on them.
ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]

Child lineage must not be over-summarizes into generic status text. Runtime events, chat projections, batch summaries, and crew views may compress display copy, but they must preserve the canonical child lineage fields above and remain reversible to the event payload.
Child session header and `/sidebar` projections may show token `/context` and cost details, but those displays are projections over canonical child-run records and usage events rather than independent child state.

### Retry, reroute, replacement, and resume


`retry`, `reroute`, `replacement`, and `resume` are distinct runtime concepts and must remain distinct in contracts, storage, and event history.

- `resume`: continue the same paused or interrupted child without semantically resetting the task.
- `retry`: a new attempt in the same child lineage after failure, blockage, or interruption.
- `reroute`: same logical child task, different effective runtime surface or capability path.
- `replacement`: a new child because the old role, task shape, or specialization was wrong.

ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]

Cancelled and superseded children are terminal by default. Resumption is primarily for in-flight interrupted or waiting children, not for re-opening completed disposable helpers. Crew mode may justify narrower persistence or re-entry behavior, but only as an explicit mode-level exception.
ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]

### Crew-board coordination contracts

`Plans/orchestrator-subagent-integration.md` consumers must retire older crew `/message-board` and `active-agent` side-file patterns into this child-run contract. A side-file may project from canonical child-run records, but it must not stand beside them as a competing source of runtime truth.


Crew coordination uses an explicit crew board. Child-to-child communication in crew mode occurs through board messages or other explicit crew-scoped coordination records, not hidden direct peer channels. Crew board messages are task-scoped, attributable, timestamped, and persisted as part of shared crew coordination state.
ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]

Crew members do not gain new authority through board traffic. Permissions, tools, skills, plugins, MCP access, and provider restrictions remain subject to the same requested/effective capability rules as any other child run.
ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]

#### Stable subagent and crew event families


In addition to the effective-context projection events defined below (`subagent.context_shrunk` and `subagent.context_rehydrated`), the following stable runtime event families are canonical for subagent and crew orchestration. Child identity and lineage are not optional metadata: they are part of the event contract. A row that over-summarizes child lineage into generic status text is non-compliant with this contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `subagent.*` event below, the payload MUST preserve the PM lineage envelope:
- `run_id`
- `thread_id`
- `agent_id`
- `parent_run_id?`
- `child_run_id?`
- `parent_thread_id?`
- requested and effective runtime descriptors when they differ

The same lineage envelope applies to `subagent.spawn_requested` and `subagent.spawn_completed` when a dispatcher distinguishes request lifecycle from child-run creation and terminal completion. These names remain under `subagent.*`; `chat.subagent_*` and `chat.subagent_spawned` are legacy source aliases only.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

| event_type | payload_fields | description |
|---|---|---|
| `subagent.spawned` | `run_id`, `thread_id`, `agent_id`, `agent_type`, `parent_run_id`, `child_run_id`, `parent_thread_id`, `model_id` | New subagent created and linked to parent lineage. |
| `subagent.started` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `prompt_preview` | Subagent begins execution. |
| `subagent.progress` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `progress_pct?`, `status_text` | Progress update. |
| `subagent.tool_called` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `tool_args_preview` | Subagent invoked a tool. |
| `subagent.tool_completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `success`, `duration_ms` | Tool call finished. |
| `subagent.message_sent` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `message_preview`, `turn_index` | Follow-up message sent. |
| `subagent.message_received` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `response_preview`, `turn_index` | Response received. |
| `subagent.completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms`, `token_usage` | Subagent finished successfully. |
| `subagent.failed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `error_code`, `error_message`, `duration_ms` | Subagent failed. |
| `subagent.cancelled` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason`, `duration_ms` | Subagent was cancelled. |
| `subagent.timeout` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `timeout_ms`, `partial_result?` | Subagent exceeded time limit. |
| `subagent.retried` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `attempt_number`, `retry_reason` | Subagent retry attempt. |
| `subagent.context_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `context_usage_pct`, `threshold` | Context approaching limit. |
| `subagent.model_switched` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `from_model`, `to_model`, `reason` | Model changed mid-execution. |
| `subagent.paused` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason` | Subagent paused. |
| `subagent.resumed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `trigger` | Subagent resumed. |
| `subagent.output_truncated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `original_length`, `truncated_length` | Output was truncated. |
| `subagent.budget_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `budget_used_pct`, `budget_limit` | Approaching budget limit. |
| `subagent.escalated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `escalation_reason`, `target` | Subagent escalated to parent. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `crew.*` event below, the payload MUST preserve crew and child lineage together:
- `run_id`
- `thread_id`
- `crew_id`
- `parent_run_id?`
- `child_run_id?`
- `member_agent_ids[]` where membership matters

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md

| event_type | payload_fields | description |
|---|---|---|
| `crew.formed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `member_agent_ids[]`, `purpose` | Crew created. |
| `crew.member_added` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `role` | Member joined. |
| `crew.member_removed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `reason` | Member left. |
| `crew.coordination` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `coordination_type`, `details` | Inter-agent coordination. |
| `crew.completed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms` | Crew finished. |
| `crew.disbanded` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `reason` | Crew dissolved. |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md
### Dynamic context shrinking and effective-context projection


### Effective context rule

Dynamic context shrinking is a canonical effective-context mechanism distinct from compaction, retrieval injection, rotation, and Assistant memory. It operates during ordinary tool-driven work and may replace stale effective-context blocks with shorter summaries while preserving canonical source state and rehydration references.
ContractRef: Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history. [Source: Prompt_Pipeline.md#dynamic-context-shrinking; storage-plan.md#canonical-child-run-records-and-batch-structure]

Prompt Pipeline remains the owner for `## 2. Compaction and pruning`, `### 2.1 Context assembly and cache preservation`, and `### 2.2 Dynamic context shrinking`. Contracts_V0 records only the cross-contract floor: giant-instruction-file and instruction-file content must have an agent-visible context-budget, oversized static instruction material should shift to /on-demand retrieval or scoped references, and shrinking/replay events must preserve enough `/history`, `/continuity`, source refs, and drift-control lineage to rehydrate without pretending effective-context summaries are the source of truth.

The default automatic shrinking scope is tool results. Retrieved-context blocks and plan/report blocks remain user-configurable optional categories. Shrinking uses conservative automatic triggers based on staleness and context pressure, with current working set items protected from automatic shrinking.
ContractRef: Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content. [Source: Prompt_Pipeline.md#dynamic-context-shrinking]

Runtime projection may emit `subagent.context_shrunk` and `subagent.context_rehydrated` events where effective-context state changes need to be inspectable or replayable. These events supplement, but do not replace, canonical child history and source references.
ContractRef: Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#17-context--truncation]

Every tool-call event that participates in effective-context shaping carries `_context_updates`; when no compression or rehydration is needed, the field is present as `[]`.

### Parent mediation and required-vs-optional dependency state

Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis. Children do not directly interrogate the user by default. Required versus optional child dependency classification is part of the canonical runtime contract because it determines whether unresolved child work blocks dependent parent completion.
ContractRef: Parent orchestration MUST preserve required-vs-optional child dependency semantics and MUST mediate child-to-user escalation by default. [Source: orchestrator-subagent-integration.md#plan-mode-strategy--defaults; assistant-chat-design.md#14-subagents--crew]

Blocked state means external or runtime constraints prevent progress. `awaiting_parent` means the child is paused pending parent decision, clarification, context expansion, or user response. These are not interchangeable.
ContractRef: `blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; assistant-chat-design.md#14-subagents--crew]

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Contracts_V0.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CV-001 - Contracts V0 (Canonical) Source-Preserving PlanUnit

```yaml
plan_unit_id: CV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Plans/Contracts_V0.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Contracts_V0-S0118
preserved_exact_tokens:
- Contracts V0 (Canonical)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
- Canonical owner-section requirements
- Owner-first canonicalization order
- Requested/effective account identity contract
- Shared governance/runtime record envelope
- Concern record family definition
- Concern lifecycle and resolution kinds
- Concern action policy and authority model
- Concern linkage to adjacent families
- Promotion classes and gate evidence
- Historical semantic consistency
- Coverage blocker concern lifecycle owner section
- Concern owner vs creator vs resolver separation
- Concern source-event vs record vs projection split
- Runtime attribution ownership split
- Approval scope key and approver identity
- Concern update heuristics
- Route/open compatibility-only fallback marking
- Recommended minimum concern record shape
- Concern ownership / authority direction
- 0. Scope
- 'ContractRef: ContractName:Plans/Contracts_V0.md'
negative_constraints:
- '- Family-specific payloads specialize under the shared envelope; they must not invent one-off top-level shapes when a subordinate payload block can carry the family-specific fields under the canonical record identity, status, provenance, and lineage fields.'
- '- `requested_account_id` is the explicit requested account anchor; `requested_account_policy` remains the policy selector used before effective resolution and MUST NOT replace the concrete requested account field.'
- '- Gemini account resolution uses the same shared requested-vs-effective identity contract: the compact `/model/auth` display shorthand must still preserve account selection, switch reason, concrete auth mode, and `vs-effective` differences. A Gemini family may contain multiple API-key accounts and m'
- '- `selectable_unit_id` is resolver/debug identity for the chosen runtime candidate. It MUST NOT replace `account_id` in user-facing copy or persisted canonical auth/routing fields; `/routing` payloads keep account identity stable and may add selectable-unit evidence only as subordinate resolution de'
- Wizard, interview, Source Control, and worktree handoff payloads are high-risk runtime lineage consumers. `GitHub_Integration.md`, `GitHub_Integration`, `WorktreeGitImprovement.md`, `chain-wizard-flexibility`, `chain-wizard-flexibility.md`, `interview-subagent-integration`, and `interview-subagent-i
- Graph and runtime object schemas must carry explicit package/seam/lane IDs before they are used for execution recovery or promotion decisions. `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`, `/plan_graph.schema.json`, `/project_pla
- '`EventRecord` / runtime alignment claims are incomplete unless the schema carries project/thread/run/attempt/account identity directly or by canonical snapshot ref; owner docs must not claim runtime alignment while omitting those join keys.'
- Orchestrator and Source Control projections preserve requested/effective identity across `Orchestrator_Page`, `Orchestrator_Page.md`, `live-status`, `/switch`, `/model`, `/account`, `project_id`, cross-surface, and multi-project routing. Legacy `requested_persona_id` and `effective_persona_id` names
- '`Plans/Orchestrator_Page.md`, `/Orchestrator_Page.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, and `/Contracts_V0.md` are the practical runtime/UI SSOT for execution, blocked states, `/handoff`, `/recovery`, terminals, and event families. `AttemptJournal` and '
- Storage and projection backbones are package-aware and must not retain `/tier/session/thread` as their primary runtime scope. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/assistant-memory-subsystem.md`, `/storage-plan.md`, `/usage-feature.md`, `/assistant-memory-subsystem.md`, `/package
- Storage families must not stay attempt/block/usage-centric when the rewrite depends on lane/worktree/concern/project-attention-centric objects; attempt, blocked, and usage projections remain valid only when they join to lane/worktree/concern/project-attention identity rather than hiding it.
- Operational surfaces consume this contract across `Plans/FinalGUISpec.md`, `Plans/Run_Graph_View.md`, `Plans/assistant-chat-design.md`, `/FinalGUISpec.md`, `/Run_Graph_View.md`, and `/assistant-chat-design.md`. `phase-grouped` layouts, `/tier` actions, or one-current-task assumptions must not obscur
- Canonical persona and account field names must be traceable end to end. `Contracts_V0`, `Contracts_V0.md`, `attempt.started`, usage, storage, auth, and `/effective/provider/account` surfaces must not normatively revive `requested_persona_id` or `effective_persona_id` after this contract forbids them
- If a stale or degraded blocked-flow projection previously displayed `allowed_action_ids[]`, the `GUI` must not guess that the old action set is still valid; it revalidates against canonical/current runtime state before execution or disables the action with an explicit projection-health reason.
- Runtime attribution packets are carried by immutable prompt handoff bundles, `attempt.started`, `attempt_record`, `/dispatch`, and usage/worker-inspection projections when relevant. `tool.invoked` and `tool.denied` are both first-class runtime trace records; `tool.invoked` must not remain under-attr
- Wizard and interview handoffs inherit the runtime identity grammar before they emit artifacts. `Plans/chain-wizard-flexibility.md`, `/chain-wizard-flexibility.md`, `pre-run`, and `/artifact` payloads must not stay `under-keyed` relative to the adjacent event/artifact contracts. `interview-subagent-i
- Provider/model controls are execution identity controls, not page-local preferences. `Plans/newtools.md`, `Plans/assistant-chat-design.md`, `/newtools.md`, `/assistant-chat-design.md`, `/model`, `per-run`, `per-thread`, and `/effective` consumers must expose requested/effective execution identity ac
- '`Plans/Prompt_Pipeline.md` is upstream of requested/effective identity disclosure across chat, builders, Orchestrator, and storage; scope drift in that owner contract must not leak weaker requested/effective runtime fields into downstream projections.'
- Event-schema precision is mandatory wherever runtime identity appears in tables or examples. `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `run.started`, `usage.event`, `hitl.*`, `config-validation`, `safe_point`, `safe_point.created`, `scheduler.pass`, and `remediation.resol
- Adjacent command, route, evidence, usage, and storage schemas consume this same identity contract. `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/evidence.schema.json`, `/UI_Command_Catalog.md`, `/Crosswalk.md`, and `/evidence.schema.json` must not define incompatible target or proof re
- Scheduling and handoff schemas use package/seam/lane execution identity before tier or task framing. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `/seam/lane/
- Requested identity is carried beside verified/effective identity across downstream integrations. `GitHub_API_Auth_and_Flows`, `GitHub_API_Auth_and_Flows.md`, `GitHub_Integration`, `GitHub_Integration.md`, `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Contracts_V0`, `Contracts_V0.md`, `Ru
- One shared requested/effective identity disclosure contract is reusable across graph detail, artifacts, GitHub/auth surfaces, and usage/account-pressure surfaces; consumers may narrow display, but they must not fork the requested/effective identity grammar.
- 'Operational identity can be displayed beside provider or account identity, but `/account` ownership remains with the auth/account contract. A UI may show operational identity for clarity, yet it must not imply the same owner, token source, or authority as provider/account identity unless the owning '
compatibility_only_notes:
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Route/open compatibility-only fallback marking'
- '- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers'
- Graph and runtime object schemas must carry explicit package/seam/lane IDs before they are used for execution recovery or promotion decisions. `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`, `/plan_graph.schema.json`, `/project_pla
- Runtime event rows that affect execution, usage, or recovery must carry the shared identity snapshot rather than a compatibility-era subset. `run.started`, `usage.event`, `/Run`, `/UI`, `/attempt`, and `/effective` consumers in `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, and `storage-plan.md`
- Orchestrator and Source Control projections preserve requested/effective identity across `Orchestrator_Page`, `Orchestrator_Page.md`, `live-status`, `/switch`, `/model`, `/account`, `project_id`, cross-surface, and multi-project routing. Legacy `requested_persona_id` and `effective_persona_id` names
- Artifact, HITL, and tool-denial surfaces must converge on the same blocked episode and runtime action contract. `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, `human-in-the-loop`, and `human-in-the-loop.md` m
- 'Compatibility adoption is explicit: `HITLRequest`, `request_id`, `run.tier_`, `run.tier_*`, `/compatibility`, and `/navigation` are lineage or lookup metadata, not peer canonical approval or runtime snapshot identity. `route_target` and `OpenSubject` own navigation identity; `wizard.blocked` and `re'
- Canonical persona and account field names must be traceable end to end. `Contracts_V0`, `Contracts_V0.md`, `attempt.started`, usage, storage, auth, and `/effective/provider/account` surfaces must not normatively revive `requested_persona_id` or `effective_persona_id` after this contract forbids them
- Child/orchestrator lineage consumers must retire tier-era side files and selectors. `Plans/orchestrator-subagent-integration.md`, `/orchestrator-subagent-integration.md`, `TierContext`, `TierType`, `select_for_tier`, `tier_id`, `active-agents`, `active-agents.json`, `/effective-runtime`, node-adjace
- '`Plans/Orchestrator_Page.md` may describe newer blocked/remediation lineage only through the canonical blocked/remediation and route contracts; `TierChanged` and `active tier` are tier-era compatibility labels, not route identity, remediation identity, or runtime ownership.'
- Tier-era event names and cleanup priorities are explicit compatibility obligations. `Plans/storage-plan.md` and `/storage-plan.md` may retain `run.tier_started`, `run.tier_completed`, `run.verification_result`, `run.persona_stage_changed`, `run.qa_cycle_started`, and `run.qa_cycle_completed` as `tie
- Storage, telemetry, terminology, and event schemas anchor runtime identity with package/seam/lane/account scope before legacy scopes. `Plans/storage-plan.md`, `Plans/usage-feature.md`, `Plans/Glossary.md`, `Plans/Crosswalk.md`, `/storage-plan.md`, `/usage-feature.md`, `/Glossary.md`, and `/Crosswalk
- 'HITL and tool-event contracts retire request-local and analytics-only eras into compatibility language. `HITL`, `HITLRequest`, `request-local`, `tier_id`, `tier_type`, `allowed_actions`, `allowed_actions[]`, and `approve_continue` are legacy approval vocabulary unless mapped to the `runtime-facing` '
- Legacy `HITLRequest` / blocked-flow examples that lean on `tier_id` or `tier_type` are compatibility references only; runtime-facing records use `node_id`, `blocked_sequence`, and attempt-scoped records as canonical execution anchors.
- Adjacent command, route, evidence, usage, and storage schemas consume this same identity contract. `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/evidence.schema.json`, `/UI_Command_Catalog.md`, `/Crosswalk.md`, and `/evidence.schema.json` must not define incompatible target or proof re
- '`Plans/storage-plan.md` and `/storage-plan.md` maintain an explicit `same-file` split between early `event-table` / `writer-facing` guidance and later runtime-recovery / `canonical-record` addenda. Readers must treat the latter as the governing canonical record and recovery contract whenever the ear'
- HITL request identity is compatibility vocabulary unless it resolves to blocked runtime action identity. `Plans/human-in-the-loop.md`, `/human-in-the-loop.md`, `request_id`, `tier_id`, `tier_type`, `request_kind`, `request_kind = tier_boundary_approval`, `tier_boundary_approval`, and `tier-boundary`
- Tool denial and approval projections use the scheduler-impacting payload, not thinner compatibility rows. `Tools.md`, `Contracts_V0`, `Contracts_V0.md`, `storage-plan`, `storage-plan.md`, and `tool.denied` consumers must not publish thin payloads as sufficient canon when scheduler state changes. `/e
- 'Storage, usage, evidence, and summary families stay node-native and execution-context first. `storage-plan`, `storage-plan.md`, `/runtime`, `rewrite-era`, `node-native`, `execution-context`, `tier_runtime_record`, `tier_id`, `cross-surface`, `usage_record`, `/summary`, and `tier-correlated` records '
- Approval action identity uses one canonical action-ID family. `Plans/Contracts_V0.md`, `Plans/human-in-the-loop.md`, `/Contracts_V0.md`, and `/human-in-the-loop.md` consumers must not wire blocked action IDs from both `allowed_actions[]` and `allowed_action_ids[]` as coequal canon; `allowed_actions[
- The shared runtime snapshot is the explicit replacement for `TierContext`. Any execution-unit refs, lane/worktree refs, requested/effective runtime identity, execution role, governance lineage, remediation generation, or `/replan` generation formerly packed into tier context must resolve into the pa
- Recovery command and wake semantics stay keyed to blocked runtime state. `UI_Command_Catalog.md`, `UI_Command_Catalog`, `HITL`, `cmd.runtime`, `cmd.runtime.*`, and pre-attempt blocked episodes map canonical recovery from `allowed_action_ids[]` to runtime commands; pre-attempt blocks are keyed by `bl
- 'Runtime artifact envelopes keep artifact-family distinctions while consuming the shared attribution packet instead of artifact-local identity alone. Artifact payload metadata includes `created_at_utc`, `summary?`, `detail_ref?`, `content_ref?`, and `source_surface?`; surviving `task_id` language in '
stale_retired_dispositions:
- '- Owner-before-consumer rule: when the canonicalization map calls for same-heading replacement or stale-residue retirement, owner-doc correction remains mandatory before consumer cleanup.'
- '- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.'
- '- Let storage-plan own the persistence mechanics for crash-critical active receipt/session lifecycle, blocked episode creation/resolution, follow-mode intent, last inspected run/node/log context, and retention anchors for receipts, log tails, watch buffers, explorer snapshots, and stale caches.'
- '- `requested_persona` and `effective_persona` are persisted core runtime identity fields. `_id` variants such as `requested_persona_id` and `effective_persona_id` are retired from canonical contracts and may survive only as migration/source-lineage aliases.'
- '- `provider_account_id` is retired as canonical/live identity vocabulary and may survive only as subordinate provider-native metadata inside bridged-provider envelopes.'
- Dispatcher and projection safety are runtime contract concerns. `/domain`, `cmd.runtime`, `cmd.runtime.*`, `correlation_id`, `allowed_action_ids`, and `allowed_action_ids[]` require a trace-through into persisted dispatch/domain events; recovery actions are admitted only when the current blocked epi
- If a stale or degraded blocked-flow projection previously displayed `allowed_action_ids[]`, the `GUI` must not guess that the old action set is still valid; it revalidates against canonical/current runtime state before execution or disables the action with an explicit projection-health reason.
- Resume, run-graph, and command consumers keep account trust and worker identity visible. `Plans/GitHub_Integration.md`, `/GitHub_Integration.md`, `/account`, and `trust-state` flows normalize commands and bind resumed flows to project/account trust before rehydrating state. `/Run`, `/use`, `/receipt
- Graph-native runtime surfaces expose the same identity and governance drill-down. `Plans/Run_Graph_View.md`, `/Run_Graph_View.md`, `/effective`, `graph-native`, `drill-in`, `trust-state`, and `governance-record` contracts must let operators inspect requested/effective identity, account trust, and go
- 'Storage, usage, evidence, and summary families stay node-native and execution-context first. `storage-plan`, `storage-plan.md`, `/runtime`, `rewrite-era`, `node-native`, `execution-context`, `tier_runtime_record`, `tier_id`, `cross-surface`, `usage_record`, `/summary`, and `tier-correlated` records '
- 'Stable target kinds are required for rewrite-era object families even when older Orchestrator, FileManager, or path-opening docs still pivot by `run_id`, `tier_id`, or file path. `node`, `attempt`, `scheduler_pass`, `blocked_episode`, and other rewrite-era objects are first-class navigation targets '
- 'Run graph and event projections expose the same runtime state without stale tier or persona field drift. `Run_Graph_View`, `Run_Graph_View.md`, graph detail, usage pivots, `/attempt/runtime`, `/verifier`, stale `hitl_request_id`, `View in Tiers`, `tier_id`, worker/verifier identity, `Contracts_V0`, '
- 'Runtime storage and persistence records carry execution context before tier compatibility. `attempt_record`, `tier_runtime_record`, run-start/runtime snapshot events, `/runtime`, `/persistence`, `auth-account`, `/account/role`, `shared-runtime`, provider-account identity, and `operational_identity` '
- Persisted destination state is subordinate to the requested route target. `/view-state` owns `active_subview`, filters, compare targets, pinned selections, destination tabs, and similar surface-local state, but those fields must be overridden when reuse would land on the wrong object, hide the reque
- Runtime record compatibility must not keep stale tier keys as structural canon. `tier_runtime_record` keyed by `run_id` and `tier_id`, `usage_record` keyed by `run_id`, `tier_id`, `attempt_id?`, and `usage_sequence`, and `evidence_record` keyed by `run_id`, `tier_id`, and `evidence_id` are compatibi
- Rewrite-root and Crosswalk routing guidance must consume contract-owned primitives instead of under-route ownership. `00-plans-index.md`, `plans-index`, `Decision_Log.md`, `Decision_Log`, `rewrite-tie-in-memo.md`, `rewrite-tie-in-memo`, `/effective`, `rewrite-era`, and `/Packages/Overseers` decision
- Projection health states use one rebuild/scan vocabulary. `/rebuild`, `/scan`, and `/sections` projections use `current` when caught up enough for normal use, `refreshing` when an old committed projection remains visible while refresh or rebuild runs, `stale` when usable for context but not guarante
- 'Approval and restart semantics preserve blocked-state identity across the Contracts, Executor Protocol, and HITL owners. `Plans/Contracts_V0.md`, `/Contracts_V0.md`, `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `Plans/human-in-the-loop.md`, and `/human-in-the-loop.md` jointly own the rule '
- Alias and resume-url contracts keep migration metadata separate from canonical routing. `alias_of_command_id` belongs to migration `/deprecation` alias handling only; stable wrappers declare `normalizes_to`, `canonical_target_contract`, and `canonical_route_kind` instead of pretending to be deprecat
- Runtime identity packets carry execution role, blocked minima, and parent scope without reviving older field families. `requested_persona` ownership is about scope, not renaming it back into older fields. `Plans/Contracts_V0.md` and `/Contracts_V0.md` attempt/runtime packet families include `executi
- Widget and permission projections inherit shared account and blocked-state scope. Widget multi-account and `/account-pressure` contracts bind to canonical `provider_accounts` and `provider_accounts.*` projections, inherit trust and `/scope` from the host surface, and cannot create a local account-pr
- 'Route/open ownership must not leak into consumers or wiring. `WiringEntry` consumes route/open contracts and `/open` behavior; it is not their surrogate owner. Direct command dispatch verification must also encode wrapper normalization, deprecated alias mapping, route/open contract consumption, and '
- 'The command-definition layer carries minimal command-classification and normalization metadata without restating route payload structure: `command_kind` plus optional `normalization { kind, normalizes_to_contract? | alias_of_command_id? }`. Stable wrappers set `normalizes_to_contract`; deprecated al'
- Approval and dispatch proof stay runtime-command aware. `allowed_action_ids[]` has won at the runtime-command layer, so approval targeting resolves through `blocked_sequence` while any retained `request_id` is lineage or lookup metadata. `GATE-010` must eventually validate more than flat wiring cove
owner_boundary_notes:
- '# Contracts V0 (Canonical)'
- '- contracts own canonical route identity'
- '- Stratum 1: owner docs'
- '- Treat the routing tranche as structurally closed after the owner-doc contracts are added.'
- '- Strong aligned owner:'
- '- Strong owner docs:'
- '- mixed-canon owner docs'
- '- 1. Reconcile owner contracts and schemas first.'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Owner-first canonicalization order'
- '- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.'
- '### Coverage blocker concern lifecycle owner section'
- '### Concern owner vs creator vs resolver separation'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- PUPPET MASTER -- CANONICAL CONTRACTS
- 'This document defines the canonical contracts for:'
- This section is the single canonical owner for runtime identity, concern/episode lifecycle, route_target primitives, and OpenSubject routing semantics across all surfaces and execution contexts.
- '- Apply owner-doc corrections before consumer and mirror cleanup.'
- '- Rerun fidelity audit only after owner and consumer corrections are in place.'
- '- The canonicalization sequence in this owner section is strict: canonical owner repairs first, dependent consumer updates second, mirror cleanup third, and final verification evidence last.'
- '- Owner-before-consumer rule: when the canonicalization map calls for same-heading replacement or stale-residue retirement, owner-doc correction remains mandatory before consumer cleanup.'
- '- The owner-doc integrity stack is ordered, not three isolated docs: `Crosswalk.md` first for primitive/term routing, `DRY_Rules.md` second for duplication and SSOT discipline, and `Decision_Log.md` third for durable decision trace. Contract repairs that touch those owners must preserve that order.'
- '- When a verification `re-check` cannot be trusted as one end-to-end read because owner or `/consumer` documents are too large, split it into smaller bounded reviewer slices and reconcile their findings back into this owner-before-consumer sequence before declaring closure.'
owner_hints:
- Plans/Contracts_V0.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `42abbe15109062453a0378c74f249cc2f0b399fd77da8be9000f1e95d09bcc27`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Contracts_V0-S0001` through `Contracts_V0-S0118` are preserved in place and mapped in `coverage_map.jsonl` to `CV-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
