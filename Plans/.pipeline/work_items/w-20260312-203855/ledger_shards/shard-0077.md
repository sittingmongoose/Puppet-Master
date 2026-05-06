- Primary owner-gap docs:
  - `Plans/storage-plan.md`
  - `Plans/usage-feature.md`
- Strong stale consumers:
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
- Strong aligned adjacent consumer:
  - `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- The docs currently try to do both:
  - canonical usage identity via `usage_event_ref`
  - cross-surface node usage via `tier_id`
- That leaves `usage_record` and evidence/summary families in an unstable middle state:
  - canonical enough for Ledger and cost artifacts
  - still tier-correlated for Run Graph and Orchestrator
- The result is that node-first routing and attempt-native runtime identity still cannot flow cleanly through Usage and Evidence without compatibility translation.

### Candidate fixes to carry forward
- Reconcile usage and evidence families away from tier-first cross-surface correlation.
- Keep canonical usage-event identity primary for Usage/Ledger navigation.
- Keep node/attempt identity primary for runtime and graph inspectors.
- Treat any remaining `tier_id` use as derived compatibility metadata or view grouping, not as the primary cross-surface key.

### Do-not-forget details
- This seam links storage, Usage, Run Graph, and Orchestrator all at once.
- `Runtime_Artifacts_Panel.md` is now ahead of the main Usage and graph docs on identity rigor.

## Research Progress - 2026-03-17 - `storage-plan.md` now has live canonical sections from different execution eras

### Targeted docs read
- `Plans/storage-plan.md`

### Key findings
- `Plans/storage-plan.md` now contains a clear same-file canon split between:
  - early event-table and writer-facing sections
  - later runtime recovery / canonical-record addenda
- The early sections still teach:
  - `run.started` with `tier_id`
  - `usage.event` with `tier_id`
  - `run.tier_started`, `run.tier_completed`
  - `run.verification_result` keyed by `tier`
  - `hitl.approval_requested` with `request_id`, `tier_id`, `tier_type`, `allowed_actions`
  - tier-start validation/persona/QA events
- The later sections already teach the stronger model:
  - canonical runtime events like `scheduler.pass`, `node.blocked`, `safe_point.*`, `remediation.*`
  - canonical keys for `blocked_projection`, `attempt_record`, `scheduler_pass_record`
  - attempt-native projection rules
  - blocked projections and runtime recovery lineage
- Then the canonical-record section partially regresses again by keeping:
  - `tier_runtime_record`
  - tier-keyed `usage_record`
  - tier-adjacent `evidence_record`
  - `thread_blocked_notice` / `wizard_runtime_state` with `resume_url?`

### Impacted docs
- Primary owner doc:
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- This is no longer only “storage is stale in places.” The document now carries multiple overlapping canonicality layers from different rewrite stages.
- That makes the doc hard to reconcile mechanically because early tables, migration addenda, and canonical-record sections are not all pointing in the same direction.
- The strongest runtime model is already present in the file; the problem is that older canon has not been retired.

### Candidate fixes to carry forward
- Treat `storage-plan.md` as a same-file reconciliation problem, not only a cross-doc mismatch.
- Reconcile the document in this order:
  - canonical event families
  - canonical key families
  - canonical record families
  - restore/replay behavior
- Retire or explicitly compatibility-label the older tier/HITL request-era tables instead of letting them stand as live canon beside the newer runtime sections.

### Do-not-forget details
- This is the storage-side parallel of the `human-in-the-loop.md` supersession problem.
- Later stronger sections already exist; the cleanup problem is retirement and unification, not invention.

## Research Progress - 2026-03-17 - Current cleanup posture after extended owner-pass

### Key findings
- The remaining work on this research branch is now dominated by cleanup of overlapping canon, not missing concepts.
- The strongest repeated pattern is:
  - owner docs already contain stronger rewrite-era addenda
  - older base text still remains live and keeps teaching the stale model
  - consumer docs mirror whichever era they happened to read first

### Highest-priority owner cleanup set
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/storage-plan.md`
- `Plans/human-in-the-loop.md`
- `Plans/Prompt_Pipeline.md`

### Highest-priority stale consumer set
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Widget_System.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`

### Remaining cleanup classes
- owner-doc supersession cleanup
  - route/open contracts missing by name
  - tier-era scope wording still live
  - HITL request-era and blocked/runtime-era canon still coexisting
  - storage tables and record families from multiple execution eras coexisting
- stale consumer cleanup
  - graph and Orchestrator command payloads
  - active-tier widgets and tier-targeted terminals
  - tier-keyed usage/evidence correlation
  - legacy `PuppetMasterEvent::*` source tables
- spec-integrity defects
  - duplicate sections
  - duplicate numbering
  - internally contradictory migration rules
  - exact command-arg mismatches

### Do-not-forget details
- The branch is still not ready for reconciliation.
- The next meaningful passes should stay in owner-doc cleanup territory rather than broadening scope again.

## Research Progress - 2026-03-17 - External full-doc audit integrated into current owner-cleanup stack

### Key findings
- The external six-pass audit confirms the same cleanup pattern that this thread has been converging on:
  - owner-doc supersession and traceability failures are now the dominant risk
  - stale consumers are mostly downstream reflections of those owner failures
  - remaining issues are increasingly exact structural mismatches rather than missing concepts
- The strongest overlap between the external audit and the current Orchestrator-focused work is:
  - `Crosswalk.md` and `Contracts_V0.md` owner-routing integrity
  - `storage-plan.md` same-file mixed canon
  - `Decision_Log.md` and rewrite-root routing gaps
  - `FinalGUISpec.md`, `UI_Command_Catalog.md`, `Widget_System.md`, and promoted-shell docs as drift amplifiers
  - `FileSafe.md`, `MiscPlan.md`, and `Executor_Protocol.md` as adjacent runtime-lineage enforcement owners

### Priority merge
- Current thread priority stack remains correct, but the external audit sharpens the broader reconciliation order:
  1. owner-doc integrity and routing
     - `Plans/Contracts_V0.md`
     - `Plans/Crosswalk.md`
     - `Plans/storage-plan.md`
     - `Plans/human-in-the-loop.md`
     - `Plans/Prompt_Pipeline.md`
     - `Plans/Decision_Log.md`
     - `Plans/DRY_Rules.md`
  2. command / shell / widget / GUI drift amplifiers
     - `Plans/UI_Command_Catalog.md`
     - `Plans/FinalGUISpec.md`
     - `Plans/Widget_System.md`
     - `Plans/Section15_MVP_Promoted_Features_Spec.md`
     - `Plans/feature-list.md`
     - `Plans/newfeatures.md`
     - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  3. execution-lineage and enforcement adjacencies
     - `Plans/Executor_Protocol.md`
     - `Plans/FileSafe.md`
     - `Plans/MiscPlan.md`
     - `Plans/Run_Modes.md`
     - `Plans/Architecture_Invariants.md`
  4. provider/runtime identity and bridge adjacencies
     - `Plans/Multi-Account.md`
     - `Plans/Provider_OpenCode.md`
     - `Plans/OpenCode_Deep_Extraction.md`
     - `Plans/OpenCode_Coverage_Matrix.md`
     - `Plans/Media_Generation_and_Capabilities.md`

### Contradictions / gaps surfaced
- The external audit confirms that several remaining issues are no longer local document problems:
  - duplicate numbering and `ContractRef` failures in owner docs
  - unresolved command IDs and promoted-shell persistence contradictions
  - mixed execution-era canon in storage and runtime docs
- This means the branch is past the point where isolated consumer cleanup would be reliable.

### Candidate fixes to carry forward
- Keep the current research thread focused on owner cleanup and exact consumer drift that directly depends on those owners.
- Use the external audit as confirmation that broader repo coverage is complete; do not restart broad sweeps from scratch.
- Continue documenting exact contradictions and retirement targets so reconciliation can be ordered mechanically rather than by intuition.

### Do-not-forget details
- The external audit did not invalidate the current direction. It reinforced it.
- The remaining work is now mostly about collapsing overlapping canon and fixing exact broken references, payloads, and command contracts.

## Research Progress - 2026-03-17 - Runtime identity field names still drift in worker and verifier consumers

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`

### Key findings
- The owner docs already settled the canonical requested/effective runtime identity field names:
  - `requested_persona`
  - `effective_persona`
  - `requested_platform`
  - `effective_platform`
  - `requested_model`
  - `effective_model`
- `Plans/Contracts_V0.md` explicitly forbids parallel canonical fields:
