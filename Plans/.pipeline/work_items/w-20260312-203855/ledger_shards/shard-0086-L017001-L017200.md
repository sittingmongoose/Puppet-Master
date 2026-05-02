  - Git/worktree sections still use `tier_id` as worktree ownership glue
- `Plans/GUI_Rebuild_Requirements_Checklist.md` is now clearly a reconciliation follower, not a source:
  - it marks as PASS several things that are only PASS relative to stale upstream docs, such as:
    - Orchestrator single page with 6 tabs including `Tiers`
    - cross-cutting widget system coverage for old Orchestrator widget tabs
  - it also lists command families that now need revalidation against the newer runtime recovery and route/open model

### Impacted docs
- Primary docs:
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
- Adjacent owners implicated:
  - `Plans/FinalGUISpec.md`
  - `Plans/Widget_System.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- This tranche mostly inherits contradictions from stronger owner docs instead of inventing new ones.
- That still makes it dangerous: once upstream reconciliation happens, these docs can continue to broadcast stale “PASS” status or outdated feature summaries unless they are explicitly rechecked.

### Candidate fixes to carry forward
- Reconciliation order for this tranche should be:
  - upstream owner docs first
  - `GUI_Rebuild_Requirements_Checklist.md` second as status repair
  - `feature-list.md` and `newfeatures.md` third as summary cleanup
  - `Section15_MVP_Promoted_Features_Spec.md` last as a verification pass against the corrected upstream owners
- These docs should be treated as mirrors and summaries, not as places to re-own runtime or surface contracts.

### Do-not-forget details
- `GUI_Rebuild_Requirements_Checklist.md` can create false confidence if stale upstream PASS conditions remain unchallenged.
- `feature-list.md` and `newfeatures.md` are broad drift amplifiers because they condense many features into short summaries that users and implementers often read first.


## Research Progress - 2026-03-17 - convergence and reconciliation readiness

### Targeted docs checked for coverage convergence
- Owner stack:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/Prompt_Pipeline.md`
  - `Plans/rewrite-tie-in-memo.md`
  - `Plans/Decision_Log.md`
  - `Plans/DRY_Rules.md`
  - `Plans/Progression_Gates.md`
- Primary stale consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Widget_System.md`
  - `Plans/usage-feature.md`
- Mirrors and summary/checklist followers:
  - `Plans/feature-list.md`
  - `Plans/newfeatures.md`
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - `Plans/Section15_MVP_Promoted_Features_Spec.md`

### Key findings
- The remaining research backlog is now exhausted for the current rewrite scope.
- The ledger now contains explicit findings for:
  - mixed-canon owner docs
  - stale primary consumers
  - mirror/checklist docs that will need revalidation after owner reconciliation
- No additional major design seams remain unidentified in the current scope.
- The remaining work is now reconciliation-order work, not open-ended research or model invention.

### Reconciliation order locked by research
1. Owner docs and rewrite-root routing
2. Primary stale consumers
3. Mirror/checklist followers

### Hand-off posture
- This work item is now ready for reconciliation.
- The ledger contains enough owner-routing, contradiction, and cleanup-order detail for downstream reconciliation without restarting discovery.

### Do-not-forget details
- Reconciliation should not reopen the execution model unless a new contradiction appears that is stronger than the current graph/seam/package/attempt/lane model already established.
- Mirror docs should be updated only after their owner docs are reconciled.


## Reconciliation / Coverage Pass - 2026-03-17 - final impacted-doc register before packetization

### Raw coverage ledger

#### Docs clearly implicated
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/storage-plan.md`
- `Plans/human-in-the-loop.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/rewrite-tie-in-memo.md`
- `Plans/Decision_Log.md`
- `Plans/DRY_Rules.md`
- `Plans/Progression_Gates.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`
- `Plans/FileManager.md`
- `Plans/Glossary.md`
- `Plans/00-plans-index.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`

#### Docs probably implicated
- `Plans/Personas.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/assistant-chat-design.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Permissions_System.md`
- `Plans/Decision_Policy.md`

#### Docs that could drift if left untouched
- `Plans/Tools.md`
- `Plans/newtools.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`

### Final three-bucket register

#### MUST CHANGE
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/storage-plan.md`
- `Plans/human-in-the-loop.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/rewrite-tie-in-memo.md`
- `Plans/Decision_Log.md`
- `Plans/DRY_Rules.md`
- `Plans/Progression_Gates.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- `Plans/usage-feature.md`
- `Plans/FileManager.md`

#### MUST RECONCILE
- `Plans/Glossary.md`
- `Plans/00-plans-index.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/assistant-chat-design.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Permissions_System.md`
- `Plans/Decision_Policy.md`
- `Plans/feature-list.md`
- `Plans/newfeatures.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md`

#### MUST VERIFY
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/Tools.md`
- `Plans/newtools.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`

### Packetization reminders
- `MUST CHANGE` docs carry either direct stale canon or owner-level gaps. Packetization should assume stale sections must be replaced or retired, not merely annotated.
- `MUST RECONCILE` docs are not primary execution owners, but they will drift or mislead if omitted from the packet.
- `MUST VERIFY` docs stay out of the packet unless final reconciliation inspection shows that they also require edits.
- Derived-only artifacts remain out of packet intent:
  - `Plans/_shards/**`
  - `Plans/.evidence/**`

### Same-file supersession hot list
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/human-in-the-loop.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Run_Graph_View.md`
- `Plans/Widget_System.md`
- `Plans/Progression_Gates.md`

