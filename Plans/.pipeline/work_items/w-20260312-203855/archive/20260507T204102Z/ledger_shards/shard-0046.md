- The required runtime-artifact schema family is not merely incomplete; it is absent.
- `checkpoints.hitl.{run_id}` is too coarse once more than one approval can exist in the same run.
- `execution_role` is now an audit/routing requirement, not a nice-to-have display field.
- `project_id` and validation/report lineage are still missing from the wizard’s normalized handoff payload.
- Contribute(PR) still needs isolated runtime execution even if the user-facing PR branch stays singular.

## Research Progress - 2026-03-16 - GPT-5.2 downstream cohort synthesis

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/assistant-chat-design.md`
- `Plans/human-in-the-loop.md`
- `Plans/Tools.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/WorktreeGitImprovement.md`
- adjacent owner docs pulled for contradiction checks (`Contracts_V0.md`, `storage-plan.md`, `Orchestrator_Page.md`, `Run_Graph_View.md`, `Widget_System.md`, `Project_Output_Artifacts.md`, `GitHub_Integration.md`, `Multi-Account.md`, `Permissions_System.md`)

### Key findings
- GPT-5.2 mostly confirmed and sharpened the downstream contradictions into exact field/key mismatches.
- GUI / command / page-ownership conflicts are now pinned to concrete IDs and examples:
  - `FinalGUISpec.md` still conflicts with Orchestrator-page canon by listing standalone `Tiers` / `Evidence` / `History` / `Ledger` views, and still hosts non-canonical `cmd.orchestrator.*` action IDs where `UI_Command_Catalog.md` defines different stable IDs.
  - `UI_Command_Catalog.md` now has a concrete template-level contradiction: `Wiring_Matrix.md` references `cmd.orchestrator.switch_tab`, but the canonical command catalog does not define it.
  - graph-local retry/HITL commands still cannot actually be thin aliases to runtime commands because they omit runtime-minimum anchors like `run_id`, `attempt_id`, and `blocked_sequence`.
- Artifact / HITL / tool surfaces still have direct schema and key mismatches:
  - `Runtime_Artifacts_Panel.md` still collides with `Contracts_V0.md` on what “envelope” means, still requires missing schema files, still omits `attempt_id` from the common identity set, and still does not pin whether artifact attribution comes from embedded runtime snapshots or mandatory attempt joins.
  - `human-in-the-loop.md` now exposes a sharper self-contradiction: it deprecates `allowed_actions[]` in favor of `allowed_action_ids[]`, but `Contracts_V0.md` and `storage-plan.md` still publish `allowed_actions` in HITL-adjacent canonical shapes.
  - `Tools.md` now looks even more bifurcated: scheduler-impacting denials and pending approvals can only be modeled correctly if they map into canonical blocked episodes, not as a standalone minimal `tool.denied` payload.
- Execution-core seams are now pinned to specific missing mint/ownership rules:
  - `Executor_Protocol.md` still has duplicated scheduler sections, still leaves `blocked_sequence` minting rules unowned, and still leaves the startup-recovery -> first scheduler-pass handshake implicit even though the vocabulary (`startup_recovered`) now exists.
  - `orchestrator-subagent-integration.md` still uses `TierContext` as a selection/decomposition context rather than a canonical execution identity, and still carries active-agent / hook / coordination records that cannot join to attempt-keyed runtime records.
- Wizard / interview / worktree lineage gaps continue to sharpen at the seams:
  - `interview-subagent-integration.md` still contradicts itself on persona field names, still truncates auth/account identity from its shared-runtime contract, still writes “blocked bundle” language against `attention_required`, and still contains a likely routing bug (`interview-phase-phase-*`) inside its pseudo-tier message keys.
  - `chain-wizard-flexibility.md` still leaves wizard normalized payloads too thin to satisfy adjacent contracts that already require `thread_id`, `project_id`, and validation lineage for reproducible pre-run quality governance.
  - `WorktreeGitImprovement.md` now has a sharper ownership split: `worktree_id` is first-class in `storage-plan.md` and `GitHub_Integration.md`, while the worktree plan still centers `tier_id`/filesystem path; it also still splits `base_branch` ownership across run config vs Git panel state and still returns raw git-hook errors instead of canonical blocked episodes.

### Highest-risk impacted docs
- `Plans/UI_Command_Catalog.md`
  - command/wiring/template drift is now concrete enough to break gate logic and stable action IDs.
- `Plans/human-in-the-loop.md`
  - approval identity and field-name drift (`allowed_actions` vs `allowed_action_ids`) still cut across recovery, replay, and storage.
- `Plans/Runtime_Artifacts_Panel.md`
  - envelope/schema-family ambiguity and missing attempt-key ownership still block deterministic drill-through.
- `Plans/Executor_Protocol.md`
  - still lacks the mint/ownership rules that blocked/runtime recovery now depend on.
- `Plans/interview-subagent-integration.md`
  - still contains both field-name drift and pseudo-tier execution-key bugs.
- `Plans/chain-wizard-flexibility.md`
  - still leaves pre-run governance lineage under-keyed relative to adjacent canonical event/artifact contracts.
- `Plans/WorktreeGitImprovement.md`
  - still mismatches `worktree_id` ownership, base-branch ownership, and canonical blocked-emitter semantics.

### Contradictions / gaps surfaced
- Several downstream docs now fail on exact key or field names rather than broad conceptual drift.
- The same runtime approval and recovery flows still use incompatible key sets across chat/HITL/runtime commands/storage.
- Event/persistence contracts continue to claim shared-runtime alignment while dropping auth/account/role fields exactly where those become auditable.
- Worktree/source-control docs still lack one agreed durable identity key (`worktree_id` vs tier/path) and one agreed base-branch owner.
- Command and wiring SSOTs still cannot mechanically express freshness/health gating or canonical mutation ownership.

### Candidate fixes to carry forward
- Reconcile all approval/recovery schemas onto one key strategy and one field family (`allowed_action_ids[]`, `blocked_sequence`, explicit mapping for any retained `request_id`).
- Promote `thread_id`, `project_id`, validation/report lineage, and requested/effective account identity into wizard/interview pre-run governance payloads where adjacent canonical docs already require them.
- Make `worktree_id` the durable worktree identity across storage, Source Control, and orchestration receipts, and resolve `base_branch` ownership into one canonical store.
- Treat scheduler-impacting tool denials/pending approvals as blocked-runtime episodes rather than a weak standalone `tool.denied` path.
- Remove or alias stale/non-canonical `cmd.orchestrator.*` and template/example command IDs so the catalog is truly the only stable command owner.

### Do-not-forget details
- `cmd.orchestrator.switch_tab` currently appears in the wiring template without existing in the catalog.
- `blocked_sequence` must exist even for pre-attempt blocked episodes; minting still has no owner.
- `allowed_actions[]` is still alive in neighboring docs even though HITL addenda say it is deprecated.
- `interview-phase-phase-*` looks like a real routing-key bug, not merely stale vocabulary.
- `.puppet-master/state/active-git-operations.json` cannot become canonical audit if storage-plan keeps seglog/receipts as the source of truth.

## Research Progress - 2026-03-16 - Tool-event and artifact runtime attribution

### Targeted docs read
- `Plans/Tools.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- current `working_ledger.md`

### Key findings
- Tool events are still specified in two different maturity levels:
  - older analytics-oriented minimum:
    - `tool.invoked` = `tool_name`, `run_id`, optional `thread_id`, `latency_ms`, `success`, `error`
    - `tool.denied` = `tool_name`, `run_id`, optional `thread_id`, `reason`
  - newer runtime-oriented addenda:
    - `tool.denied` must carry `blocked_reason_code`, `failure_class`, ordered `allowed_action_ids[]`, `headless_denied`, and effective permission snapshot id when scheduler state is affected
- `Tools.md` still mostly describes tool events as Usage-widget inputs, while other docs now need those same events to explain:
  - scheduler blocking
  - permission/HITL behavior
  - receipts and evidence
  - cross-surface audit
  - why a run used or failed to use a tool under a specific account/runtime context
- Runtime artifact contracts are still not carrying enough runtime identity:
  - `Runtime_Artifacts_Panel.md` canonical id set includes `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, `logical_artifact_id`
  - it still omits `attempt_id` and `node_id` from the canonical id set even though receipt linkage and the run-graph model now rely on attempt-level identity
  - receipt-like artifacts are explicitly told to stay on canonical runtime identity, which is stronger than the current artifact id guidance
- `storage-plan.md` is closer to the rewrite direction than the artifact/tool docs themselves:
  - `orchestrator.receipt.{run_id}.{attempt_id}` already exists
  - `usage_record` already carries `attempt_id?`
  - run-graph/orchestrator projections already require attempt-level resolution
  - blocked/runtime records already assume node/attempt identity
- The missing structural fields now fall into a repeatable set across tool events and artifact families:
  - execution identity:
    - `node_id?`
    - `attempt_id?`
    - `lane_id?`
    - `work_package_id?`
    - `feature_seam_id?`
    - `execution_role?`
  - runtime identity:
    - effective permission snapshot id
    - requested/effective model snapshot ids where relevant
    - `effective_account_id?`
    - `operational_identity?`
  - artifact/tool linkage:
    - `artifact_id` <-> `attempt_id`
    - tool event <-> resulting artifact refs
    - `usage_event_ref?` is useful but not sufficient as the only drill-through anchor

### Impacted docs
- `Plans/Tools.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- downstream consumers:
  - `Plans/usage-feature.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/assistant-chat-design.md`
  - Source Control / receipt-linked surfaces

### Contradictions / gaps surfaced
- `Tools.md` still says `tool.denied` should not emit for FileSafe blocks, but the normalized terminal outcome taxonomy in the same doc already includes `filesafe_blocked`. That means the event family and the normalized outcome story are not yet aligned.
- `Contracts_V0.md` upgrades `tool.denied` when scheduler state is affected, but `Tools.md` and `storage-plan.md` still publish the thinner payloads as if they were sufficient canon.
- `Runtime_Artifacts_Panel.md` says receipt-like artifacts must preserve canonical run/attempt identity, but its own canonical ID set still omits `attempt_id`.
- `Runtime_Artifacts_Panel.md` still uses `task_id` vocabulary where the rewrite increasingly needs `node_id` / package / seam / lane identity instead.
- `usage_event_ref?` is being used as a useful bridge for cost-bearing artifacts and receipts, but without `attempt_id` / `node_id` it is not enough to explain who produced the artifact or why it exists in the execution graph.

### Candidate fixes to carry forward
- Promote tool events from analytics-only payloads to runtime-attributed records whenever they intersect orchestrator execution:
  - add canonical optional refs for `node_id`, `attempt_id`, `execution_role`, and runtime snapshot identifiers
  - add effective account/runtime attribution where tool execution depends on provider identity or permission state
- Normalize tool denial/execution outcomes so `permission_denied`, `user_declined`, `headless_ask_denied`, and `filesafe_blocked` can all be explained through one durable event/result story.
- Extend runtime artifact identity so canonical artifact linkage includes `attempt_id?` and `node_id?`, with package/seam/lane refs when relevant.
- Treat `task_id` in artifact docs as legacy/decomposition wording unless a migration alias is explicitly needed.
- Ensure tool events and runtime artifacts can link to each other directly:
  - tool trace -> artifact refs
  - artifact -> originating attempt/tool refs
  - receipt -> run/attempt plus cross-surface refs

### Do-not-forget details
- the real problem is not only missing fields; it is that tool events are still described as analytics exhaust while other docs already want them to carry runtime truth
- artifact identity and receipt identity should not diverge once attempt-centric orchestration is canonical
- FileSafe blocks still need a durable attributed outcome path even if the old `tool.denied` wording excluded them

## Research Progress - 2026-03-16 - Wizard and interview pre-run governance payloads

### Targeted docs read
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- current `working_ledger.md`

### Key findings
- Wizard/interview docs are increasingly explicit about lineage and blocked-state handling, but their concrete handoff payloads still stop short of the shared runtime identity model.
- `chain-wizard-flexibility.md` has a reasonably solid assistant-to-wizard handoff payload:
  - `handoff_source`
  - `handoff_reason`
  - `origin_thread_id`
  - `origin_message_id`
  - `default_intent`
  - `project_id` / `project_path` when available
  - requirements/scope/codebase summaries and refs
  - optional effective persona/platform/model
- That is directionally good, but still thin relative to the rewrite:
  - no requested/effective account disclosure
  - no `execution_role`
  - no operational identity or permission posture
  - no durable link from wizard/interview handoff into later run/attempt lineage
- `interview-subagent-integration.md` explicitly claims shared runtime alignment and has separate requested/effective interview contract pieces, but still drops the same execution-governance fields in practice:
  - requested/effective account fields are not carried through the concrete handoff/provenance requirements
  - `execution_role` is absent
  - provenance metadata currently requires `source_stage`, `source_phase_ids[]`, `persona_id`, `provider`, `model`, `timestamp`, which is useful but still weaker than the shared runtime identity grammar elsewhere
- Interview still reintroduces tier-era coordination/ownership in several concrete examples:
  - `CrewCreator::Orchestrator { tier_id: format!(\"interview-phase-...\") }`
  - `to_tier_id: Some(format!(\"interview-phase-...\"))`
  - `thread_id: None` in multiple handoff/coordination examples even though thread continuity is part of the surrounding model
- The planning-to-runtime blocked/degraded handoff is closer to correct:
  - wizard blocked state carries `wizard_step`, `blocked_reason_code`, `clarification_round_count`, `report_ref`, and `replan_generation?`
  - degraded draft decomposition retains lineage into later graph lock artifacts
  - but even here the payload remains too wizard-local and still does not connect cleanly to the broader execution-unit / account / role model
- The upstream boundary is now clearer:
