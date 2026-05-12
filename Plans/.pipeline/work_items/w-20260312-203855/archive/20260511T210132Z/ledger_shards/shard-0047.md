  - wizard, builder, interview remain conversational/document-production actors, not orchestration nodes/packages/seams
  - but their handoff payloads still need to carry enough canonical identity and lineage so downstream runtime, history, ledger, search, and audit can explain how execution began

### Impacted docs
- `Plans/chain-wizard-flexibility.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- downstream consumers:
  - `Plans/assistant-chat-design.md`
  - `Plans/storage-plan.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- `chain-wizard-flexibility.md` already carries `project_id` in the assistant-to-wizard payload, but `interview-subagent-integration.md` still shows `thread_id: None` in concrete orchestration/crew paths that should likely preserve thread correlation.
- `Prompt_Pipeline.md` owns the canonical requested/effective runtime record, but the wizard/interview handoff payloads only expose a thin subset of it.
- `persona_override_owner_id` still allows `tier_id`-style ownership in shared runtime docs, while wizard/interview are simultaneously trying to align with newer non-tier execution semantics.
- Validation pass reports in chain-wizard require `provider` and `model`, but not the fuller runtime identity fields now needed for multi-account/shared-runtime explanation.
- Wizard/interview docs are good on blocked/degraded planning lineage, but still weak on the bridge from that lineage into the eventual execution run identity.

### Candidate fixes to carry forward
- Extend wizard/interview handoff payloads so they can carry the upstream subset of canonical runtime identity:
  - `project_id`
  - `thread_id`
  - `wizard_id`
  - `requested_persona?` / `effective_persona?`
  - `requested_platform?` / `effective_platform?`
  - `requested_model?` / `effective_model?`
  - `requested_account_policy?`
  - `requested_account_id?`
  - `requested_account_binding?`
  - `effective_account_id?`
  - `execution_role`
  - `operational_identity?`
  - permission/runtime snapshot refs when relevant
- Add an explicit lineage bridge from wizard/interview artifacts and handoff payloads into the eventual execution run:
  - likely `wizard_id -> run_id`
  - plus stable refs from validation pass reports and staged bundles into the launched run
- Treat interview-phase `tier_id`-style coordination keys as legacy/local labels only; do not let them become canonical ownership or routing keys.
- Keep wizard/interview separate from Orchestrator ontology, but require them to emit enough canonical identity for downstream consumers to remain truthful without reconstructing context heuristically.

### Do-not-forget details
- the upstream actors are not orchestration nodes, but they still need shared runtime identity semantics when handing off into execution
- `thread_id: None` in interview examples is now a concrete drift signal, not just omitted detail
- validation pass reports need richer runtime identity than provider/model alone if they are meant to be auditable later

## Research Progress - 2026-03-16 - GPT-5.3-Codex downstream cohort synthesis

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
- adjacent owner docs pulled for contradiction checks (`Orchestrator_Page.md`, `Run_Graph_View.md`, `Wiring_Matrix.md`, `UI_Wiring_Rules.md`, `Commands_System.md`, `Project_Output_Artifacts.md`, `GitHub_Integration.md`, `Contracts_V0.md`, `storage-plan.md`, `Permissions_System.md`)

### Key findings
- The Codex pass mostly closed the loop by turning several remaining downstream issues into exact spec-integrity failures.
- GUI / command ownership remains split in concrete, machine-breaking ways:
  - `FinalGUISpec.md` now shows a second internal navigation contradiction beyond the already-known Orchestrator-page drift (`§4.1` vs `§5.1`), and `Orchestrator_Page.md` itself is structurally incomplete because its TOC advertises a missing `UICommand IDs` section.
  - `Wiring_Matrix.md` still references `cmd.orchestrator.switch_tab`, but `UI_Command_Catalog.md` does not define it.
  - `Commands_System.md` and `assistant-chat-design.md` still disagree on whether reserved slash commands may be overridden, while `UI_Command_Catalog.md` still lacks the corresponding `cmd.chat.run_user_command` owner row.
  - catalog/promoted-family gaps remain explicit: account, concern, promotion, and several promised tab/window/catalog/dev command families still do not exist as concrete catalog entries.
- Artifact / HITL / tool contracts remain under-owned at the exact file/field level:
  - `Runtime_Artifacts_Panel.md` still sits in a three-way ownership contradiction with `Contracts_V0.md` and `storage-plan.md` over payload schema authority; it still points at missing schema files and still lacks a concrete artifact-projection key family in `storage-plan.md`.
  - `human-in-the-loop.md` still contains an intra-doc contradiction on `allowed_actions` vs `allowed_action_ids`, still leaves `request_id <-> blocked_sequence` mapping unowned, and still keeps approval-scope/session semantics under-keyed while neighboring docs cascade approvals broadly.
  - `Tools.md` is now a fully visible three-way SSOT split (`Tools.md` / `Contracts_V0.md` / `storage-plan.md`) for `tool.denied`, still allows `pending-HITL` without a legal persisted tool-approval contract, and still lacks durable event families for unavailable/degraded tool truth.
- Execution-core and runtime coordination gaps remain exact rather than abstract:
  - `Executor_Protocol.md` contains byte-identical duplicated canonical scheduler sections and still leaves `blocked_sequence` minting, startup recovery handshake, `execution_role` ownership, and reviewer/corroboration lifecycle unowned.
  - `orchestrator-subagent-integration.md` now shows an explicit same-file contradiction: `TierContext` declares fields that its own constructor does not populate, while file-based coordination is simultaneously described as canonical and as a derived/debug mirror.
- Wizard / interview / worktree seams still expose the remaining high-risk lineage holes:
  - `interview-subagent-integration.md` still mixes canonical and deprecated persona field names, still truncates auth/account identity from its runtime contract, and still routes interview work through pseudo-tier keys with at least one concrete malformed routing key.
  - `chain-wizard-flexibility.md` still leaves the normalized downstream payload too lineage-thin, still conflicts with interview ownership on where pre-run quality/CUP correction lives, and still contains a self-contradictory Contribute(PR) worktree policy.
  - `WorktreeGitImprovement.md` still lacks a durable `worktree_record` / `worktree_projection` family, still has no explicit precedence rule between persisted runtime lineage and filesystem rediscovery, and still treats git-hook blocks and state files as if they could substitute for canonical blocked/runtime events.

### Highest-risk impacted docs
- `Plans/UI_Command_Catalog.md`
  - command/catalog/template/example integrity is still broken enough to miswire surfaces mechanically.
- `Plans/Runtime_Artifacts_Panel.md`
  - schema-family authority, missing storage key owner, and missing attempt/project identity remain unresolved.
- `Plans/human-in-the-loop.md`
  - approval identity, field-family normalization, and persistence semantics are still split across incompatible shapes.
- `Plans/Executor_Protocol.md`
  - duplicate canonical sections plus unowned mint/handshake rules remain an execution-core risk multiplier.
- `Plans/orchestrator-subagent-integration.md`
  - active coordination and context construction still cannot be trusted as canonical runtime identity.
- `Plans/interview-subagent-integration.md`
  - runtime identity parity and routing-key correctness remain visibly incomplete.
- `Plans/chain-wizard-flexibility.md`
  - pre-run lineage and worktree/isolation policy are still too ambiguous for deterministic audit.
- `Plans/WorktreeGitImprovement.md`
  - durable worktree lineage, base-branch authority, and canonical blocked emitters remain unresolved.

### Contradictions / gaps surfaced
- Several docs now fail because they promise canonical sections/IDs that do not exist at all.
- Approval and mutation flows still span multiple incompatible key families and scope models across chat/HITL/runtime/tooling.
- The same owner docs still claim both file-based canon and event-sourced canon for runtime coordination/audit.
- Storage-plan is now clearly missing several record/projection families that downstream docs already treat as if they exist (`runtime_artifact` payload schemas, worktree records/projections, artifact index registration).
- Cross-surface lineage still weakens exactly at the planning->wizard->validation->run and runtime->SCM->PR boundaries where audit now matters most.

### Candidate fixes to carry forward
- Reconcile all remaining command/template/example drift so `UI_Command_Catalog.md` is the sole stable action owner and every referenced command actually exists.
- Resolve the payload-owner triangle for runtime artifacts and either add the missing schema family/registration or soften the mandate explicitly.
- Normalize HITL/tool approval semantics onto one blocked-episode model with explicit scope keying, field-family cleanup, and durable provenance.
- Add the missing canonical record/projection families to `storage-plan.md` for worktree lifecycle and artifact index state before downstream docs keep inventing them implicitly.
- Collapse duplicated executor canon and explicitly assign owners for `blocked_sequence`, `startup_recovered` handshake, `execution_role`, and reviewer/corroboration lifecycle.
- Replace pseudo-tier interview/wizard/runtime lineage keys with the same canonical thread/project/run/attempt identity families already required elsewhere.

### Do-not-forget details
- `Orchestrator_Page.md` currently advertises a missing section; that is a spec-integrity problem, not only a content gap.
- `cmd.orchestrator.switch_tab` is still referenced without existing in the catalog.
- `Runtime_Artifacts_Panel.md` still points at schema files that do not exist and an index key not registered in storage-plan.
- `allowed_actions` is still alive in canonical-looking HITL/storage shapes even after the deprecation addendum.
- The coordination-canon contradiction in `orchestrator-subagent-integration.md` is now explicit in the same file.

## Research Progress - 2026-03-16 - Validation-pass report identity and lineage

### Targeted docs read
- `Plans/chain-wizard-flexibility.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- current `working_ledger.md`

### Key findings
- Validation-pass reports are already treated as canonical first-class artifacts:
  - exactly three per sweep
  - grouped by `workflow_run_id`
  - stored in seglog as `artifact_type: validation_pass_report`
  - required to include `pass_number`, `pass_name`, `pass_verdict`, `verdict_reason`, and `provider` / `model`
- That contract is structurally better than many adjacent artifacts, but it still stops too early on identity:
  - it links the three passes together with `workflow_run_id`
  - it links to provider/model settings
  - but it still does not carry enough context to explain which wizard/runtime state produced the sweep and what later execution it seeded
- The current lineage story is fragmented across multiple docs:
  - `chain-wizard-flexibility.md` ties reports to the three-pass sweep and wizard blocked/attention behavior
  - `Project_Output_Artifacts.md` owns the artifact type and `workflow_run_id`
  - wizard state elsewhere owns `wizard_id`, `phase_plan_ref`, staged bundle refs, and blocked report refs
  - no single pass-report contract currently ties those together cleanly
- The missing fields are now fairly clear:
  - planning lineage:
    - `wizard_id`
    - `project_id`
    - `thread_id?`
    - `phase_plan_ref?`
    - `staged_bundle_ref?` or equivalent pre/post-unification bundle refs
    - `requirements_quality_report_ref?` when relevant
  - runtime identity:
    - richer requested/effective runtime snapshot than provider/model alone
    - `effective_account_id?`
    - `execution_role`
    - permission/runtime snapshot refs when a pass is provider-executed rather than purely structural
  - downstream bridge:
    - stable ref from accepted/final sweep output into the launched execution run
    - likely eventual `run_id?` or launch receipt ref once execution begins
- These reports are upstream artifacts, not execution attempts, so they should not pretend to be run/node/attempt records. But they now need a stronger bridge so runtime/history/ledger/search can answer:
  - which wizard/session produced this sweep
  - which staged artifact bundle it evaluated
  - which final artifact tree it promoted
  - which eventual run, if any, launched from it

### Impacted docs
- `Plans/chain-wizard-flexibility.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- downstream consumers:
  - `Plans/assistant-chat-design.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- Validation-pass reports require `provider` and `model`, but not the fuller requested/effective runtime identity fields that other provider-using artifacts are now expected to expose.
- The pass reports are canonical enough to gate wizard transitions and downstream artifact promotion, but not canonical enough to explain their own upstream/downstream lineage without consulting multiple other records.
- `workflow_run_id` links the three passes together, but it is not enough by itself to relate the sweep to `wizard_id`, staged requirements state, or the later launched run.
- The docs clearly state that the post-pass artifact tree is the canonical final set, but they do not define a strong receipt/reference object that binds that finality to the sweep reports and later execution handoff.

### Candidate fixes to carry forward
- Extend `validation_pass_report` identity so it carries the planning/governance lineage needed for audit and routing:
  - `wizard_id`
  - `project_id`
  - `thread_id?`
  - `phase_plan_ref?`
  - input/output artifact-bundle refs
  - `requirements_quality_report_ref?` when applicable
- Add the upstream subset of canonical runtime identity to pass reports when a provider/model actually executed the pass:
  - requested/effective persona/platform/model snapshot refs
  - `requested_account_policy?`
  - `effective_account_id?`
  - `execution_role`
- Add an explicit bridge from the accepted sweep result into the launched execution package/run, likely via a launch receipt or promoted package ref rather than by mutating the pass report afterward.
- Keep validation-pass reports distinct from runtime attempts, but stop leaving them as isolated artifacts with only local workflow identity.
