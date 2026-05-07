  - now a visible blocker because multiple docs point to definitions that do not exist.
- `Plans/Crosswalk.md`
  - structurally unreliable as a boundary/precedence map right when rewrite-era ownership disputes are peaking.
- `Plans/Decision_Policy.md`
  - still missing the deterministic policies that executor/storage/runtime surfaces now assume exist.
- `Plans/newtools.md` and `Plans/assistant-memory-subsystem.md`
  - both introduce concrete commands/events/tool IDs that the canonical owners do not currently register.

### Contradictions / gaps surfaced
- The command/wiring/documentation stack now has multiple hard ghost-ID failures, not just naming drift.
- Several owner docs claim EventRecord/runtime alignment but still omit project/thread/run/attempt/account identity in their own schemas.
- Rewrite-era governance and runtime terms still have no canonical glossary owner, even while multiple docs explicitly point readers there.
- Crosswalk and Progression Gates both show structural integrity issues (duplicate numbering/addenda) that make them unreliable as authorities.
- New supporting docs (`newtools.md`, `assistant-memory-subsystem.md`) are now independently inventing command/event families faster than the canonical owners are registering them.

### Candidate fixes to carry forward
- Reconcile reserved slash-command override policy into one canonical rule and register all real `cmd.chat.*` / `cmd.orchestrator.*` IDs in the catalog before more UI wiring lands.
- Upgrade `Project_Output_Artifacts.md` and adjacent artifact/event owners to carry canonical project/thread/run/attempt/account lineage, and align pass-report enums/fields with wizard/interview producers.
- Add the missing runtime-identity open path to FileManager and align evidence/artifact keys with attempt-native records.
- Promote missing rewrite vocabulary into `Glossary.md` and repair dead forward references before more docs keep depending on a glossary that lacks the terms.
- Repair Crosswalk/Progression Gates structural issues and add rewrite-era runtime/governance primitives/gates rather than leaving them in prose addenda.
- Register memory and live-preview/build event families, new doctor checks, and new ToolIDs in the canonical storage/tool/command owners instead of leaving them stranded in supporting docs.

### Do-not-forget details
- `cmd.chat.run_user_command` exists only in `Commands_System.md` right now.
- `cmd.orchestrator.switch_tab` and `cmd.chat.branch_from_restore` are already referenced in wiring docs without catalog entries.
- `Project_Output_Artifacts.md` still does not align with interview-emitted `glossary` / `evidence/<node_id>.json` artifact types.
- `Overseer` is currently a dead glossary reference in multiple rewrite-owner docs.
- FileManager’s `OpenFile { path... }` shape still cannot satisfy its own runtime-identity addendum without a new resolution layer.

## Research Progress - 2026-03-16 - Execution-context owner split and `TierContext` replacement

### Targeted docs read
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`

### Key findings
- The owner split is now explicit enough to stop treating this as a vague “replace `TierContext`” task.
- `Prompt_Pipeline.md` already owns the canonical effective-resolution contract through the `effective resolution record`. It defines requested/effective persona/platform/model/auth/account fields and the required selection metadata.
- `storage-plan.md` already owns the canonical runtime persistence side for execution attempts and runtime overlays:
  - `attempt_record`
  - `tier_runtime_record`
  - `blocked_projection`
  - `usage_record`
- `orchestrator-subagent-integration.md` is still embedding a single `TierContext` object that mixes four different concerns:
  - decomposition/view identity (`tier_type`, `tier_id`, titles, focus labels)
  - workspace heuristics (`workspace`, language/domain/framework detection)
  - execution-state hints (`has_errors`, `needs_testing`, active subagent tracking)
  - canonical runtime identity (`requested/effective persona/platform/model`)
- `Executor_Protocol.md` has already moved toward node-native execution and runtime blocked overlays, which makes the tier-shaped `TierContext` even less defensible as a canonical execution object.

### Recommended owner split
- `Plans/Prompt_Pipeline.md` should remain the owner of the effective-resolution field family.
  - It owns which requested/effective runtime identity fields exist and what they mean.
- `Plans/storage-plan.md` should remain the owner of persisted execution/runtime record families.
  - It owns where requested/effective identity is stored for attempts and current runtime projections.
- `Plans/Executor_Protocol.md` should own which execution-scoped context is required for scheduler/executor correctness.
  - It should define the minimum execution-unit identity/runtime anchors needed for dispatch, retry, blocked handling, and receipts.
- `Plans/orchestrator-subagent-integration.md` should stop owning a canonical mixed runtime object.
  - It should consume canonical execution/runtime context by reference and keep only selection/decomposition helpers that are local to subagent policy.

### Recommended replacement model
- Canonical object:
  - `execution_unit_context`
- Optional derived object:
  - `decomposition_context` or `selection_context`

### Canonical `execution_unit_context` minimum shape
- identity / lineage:
  - `project_id`
  - `run_id`
  - `thread_id?`
  - `feature_seam_id?`
  - `work_package_id?`
  - `node_id`
  - `attempt_id?`
  - `blocked_sequence?`
  - `replan_generation`
- execution ownership:
  - `execution_role`
  - `scheduler_lane`
  - `manual_priority?`
  - `safe_point_id?`
  - remediation lineage refs
- workspace / isolation:
  - `lane_id?`
  - `worktree_id?`
  - `workspace_ref` or canonical path ref
  - `snapshot_ref?`
- requested/effective runtime identity:
  - requested/effective persona refs or embedded snapshot refs
  - requested/effective model/platform refs or embedded snapshot refs
  - `requested_auth_mode?`
  - `effective_auth_mode?`
  - `requested_account_policy?`
  - `requested_account_id?`
  - `requested_account_binding?`
  - `effective_account_id?`
  - `account_switch_reason?`
  - `operational_identity?`
- runtime state hooks:
  - `blocked_reason_code?`
  - `allowed_action_ids[]?`
  - `failure_class?`
  - `permission_snapshot_id?`
  - `provider_attempt_ref?`

### Recommended derived `decomposition_context` / `selection_context`
- tier/view identity only:
  - `tier_type`
  - `tier_id`
  - title / description
  - optional parent tier labels
- heuristic inputs only:
  - `primary_language?`
  - `framework?`
  - `domain?`
  - `subtask_focus?`
  - `has_errors?`
  - `needs_testing?`
  - `error_patterns[]?`
  - `parent_subagents[]?`
- This object is allowed to stay tier-shaped if the integration policy still wants phase/task/subtask/iteration selectors, but it should no longer pretend to be the canonical runtime context.

### Impacted docs
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Executor_Protocol.md`
- `Plans/storage-plan.md`
- `Plans/Prompt_Pipeline.md`
- likely downstream consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- `storage-plan.md` still publishes both `attempt_record` and `tier_runtime_record`, but only the attempt record is close to the rewrite-era execution unit; the tier runtime record still reflects old tier-shaped progress ownership.
- `Prompt_Pipeline.md` already has a strong effective-resolution schema, but the integration doc duplicates a thinner subset of those fields directly on `TierContext`.
- `orchestrator-subagent-integration.md` constructs `TierContext` without clear run/node/attempt/lane identity, which means downstream hook, artifact, and retry logic can inherit a context object that is not a trustworthy canonical anchor.
- `Executor_Protocol.md` is node-native in its scheduler addendum, but it still lacks an explicit execution-context contract naming the minimum fields the runtime expects to exist on dispatch.

### Candidate fixes to carry forward
- Introduce `execution_unit_context` as the canonical runtime-facing context object and make `TierContext` explicitly derived or compatibility-only.
- Move all requested/effective runtime identity field definitions back behind the owner split:
  - `Prompt_Pipeline.md` defines field family and meaning
  - `storage-plan.md` defines persistence/projection
  - executor docs define required presence at dispatch/runtime boundaries
- Recast `tier_runtime_record` as a current-view/runtime-overlay projection rather than the canonical execution owner.
- Refactor `orchestrator-subagent-integration.md` so selector and hook APIs consume:
  - canonical execution-unit refs for truth
  - a smaller derived selection/decomposition object for heuristics

### Do-not-forget details
- This seam is now mostly an ownership cleanup, not a concept invention problem.
- The highest-risk duplication is requested/effective runtime identity being defined three times:
  - prompt pipeline
  - storage
  - tier context
- If `TierContext` survives at all, it should survive as a derived selection/view helper, not as the thing that owns canonical runtime identity.

## Research Progress - 2026-03-16 - `tier_runtime_record` as derived overlay and downstream surface drift

### Targeted docs read
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/human-in-the-loop.md`
- spot-checks against `Plans/storage-plan.md`

### Key findings
- The downstream surface docs still expose the old tier-shaped correlation model much more strongly than the runtime/storage direction now supports.
- `Run_Graph_View.md` still repeatedly treats `tier_id` as the main per-node correlation key for:
  - output filtering
  - verification event filtering
  - usage links
  - copy/open actions
  - event drill-in
- `Orchestrator_Page.md` still describes the page as `Progress / Tiers / Node Graph / Evidence / History / Ledger`, and many data-source rows still bind live state to:
  - `TierChanged`
  - `tier_id`
  - tier-scoped evidence and terminal widgets
- `human-in-the-loop.md` is currently split across two models:
  - older request state keyed by `request_id`, `tier_id`, `tier_type`
  - newer addenda acknowledging `blocked_reason_code = waiting_approval` and `blocked_sequence`
- The surface docs are therefore already behaving as if `tier_runtime_record` is canonical, even though the stronger rewrite direction is:
  - `attempt_record` and blocked/runtime records hold canonical execution truth
  - tier-shaped records should be overlays or derived views

### Recommended compatibility boundary
- `tier_runtime_record` may survive, but only as a derived current-view/runtime-overlay projection.
- It should answer questions like:
  - what is the current visible progress state for this tier-shaped UI grouping
  - what is the latest active attempt or blocked episode pointer for this grouping
  - what should the progress tree / compact terminal / high-level tab badges display right now
- It should not be treated as the canonical source for:
  - execution identity
  - retry lineage
  - approval/recovery targeting
  - usage truth
