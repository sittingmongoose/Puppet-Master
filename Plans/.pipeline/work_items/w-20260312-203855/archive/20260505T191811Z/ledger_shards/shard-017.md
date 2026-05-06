  - rollback to restore point -> diff preview + confirmation
  - clean workspace / prune evidence -> confirmation
  - delete thread / remove skill / delete file -> confirmation
  - create repository -> non-bypassable confirmation
  - HITL approvals use explicit allowed actions rather than generic confirm modals
- What is missing is a shared policy for Orchestrator/runtime actions specifically.
- There is still no unified classification answering:
  - which actions need no confirmation
  - which need light confirmation
  - which need strong confirmation
  - which are non-bypassable/hard-gated
  - which are logically undoable vs only compensatable by later actions

### Recommended action classes
- Strong recommendation:
  - classify actions by both `confirmation level` and `reversibility`
- Candidate confirmation levels:
  - `none`
  - `light`
  - `strong`
  - `hard_gate`
- Candidate reversibility classes:
  - `immediate_undo`
  - `compensating_action_only`
  - `non_reversible`

### Working interpretation
- `none`
  - safe navigation/focus actions
  - low-risk presentation actions
  - no user-data or live-runtime mutation
- `light`
  - moderate-impact actions where accidental activation is plausible
  - short confirm or inline affordance is enough
- `strong`
  - actions that may discard local state, remove artifacts/worktrees, revoke accepted state, or materially change live execution
  - should show scope and consequence clearly
- `hard_gate`
  - actions that must go through a canonical approval/blocked flow and cannot be bypassed by generic UI confirmation
  - examples already exist in HITL and explicit remote-side-effect safety flows

### Reversibility direction
- `immediate_undo`
  - UI can offer a direct undo/revert path within a practical window
  - example class: reversible local presentation/layout actions, some editor-level reverts
- `compensating_action_only`
  - no true undo, but a later action can change the system back or restore equivalent behavior
  - examples:
    - acknowledge/dismiss concern
    - reopen after revoke
    - restore from safe point / restore point
    - recreate a pruned worktree lane only via new runtime action, not true undo
- `non_reversible`
  - action destroys or mutates durable/live state in a way that is not directly undoable
  - examples:
    - removing a worktree directory
    - pruning evidence
    - deleting records/skills/files when no protected restore path exists

### Recommended action-family mapping
- `none`
  - open/focus/navigate/deep-link
  - open evidence/history/ledger/source control
  - tab-local filter/sort/search changes
- `light`
  - acknowledge minor concern
  - dismiss non-blocking advisory
  - switch focused run
  - open resolution thread
- `strong`
  - pause/cancel live run
  - start fresh attempt
  - retry from safe point
  - remove/prune/archive worktree
  - clean workspace / clean all worktrees
  - prune evidence
  - revoke promotion / seam completion
  - merge/split concerns
  - delete run if that remains allowed at all
- `hard_gate`
  - approve/reject HITL boundaries
  - graph patch application when it changes canonical graph generation
  - remote-side-effect actions with explicit non-bypassable policy
  - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice

### Recommended confirmation payload rules
- `light` confirm should show:
  - action name
  - target object
- `strong` confirm should show:
  - action name
  - target object(s)
  - concrete consequence summary
  - whether local work/artifacts/history remain
  - reversibility class
- `hard_gate` should show:
  - runtime-defined allowed actions
  - why the gate exists
  - exact consequence of each allowed action
  - no hidden alternative path

### Undo / post-action affordance direction
- Recommended rule:
  - do not over-promise "undo" when the system really only supports compensating actions
- Good labels:
  - `Undo`
    - only when true immediate undo exists
  - `Reopen`
  - `Restore`
  - `Retry from Safe Point`
  - `Create New Lane`
  - `Re-request Promotion`
  - `Reapply`
- This matters because many orchestration actions are not true editor-style undo operations.

### Concern / promotion / graph-patch implications
- concerns
  - acknowledge/dismiss may be `light` or `strong` depending on severity/blocking effect
  - merge/split should be `strong`
- promotions
  - promote may be normal action when runtime says eligible
  - revoke should likely be `strong`
- graph patch
  - request patch may be `strong`
  - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation

### Source Control / cleanup implications
- narrow Source Control panel means destructive actions there should likely route through compact but clear confirmation patterns, not giant forms
- worktree prune/remove and cleanup actions should disclose:
  - whether the backing worktree will be removed
  - whether historical lineage remains
  - whether there is any direct restore path

### Contradictions / gaps surfaced
- Confirmation behavior exists in many isolated places, but there is no shared action policy spanning runtime, Orchestrator, Source Control, cleanup, and review/governance actions.
- The current docs sometimes use "revert", "rollback", "restore", and "undo" in different domains without a clear global distinction.
- `Delete Run` in History looks especially questionable until delete semantics and reversibility are defined more carefully.

### Candidate fixes to carry forward
- Add a shared action policy matrix:
  - action family
  - confirmation level
  - reversibility class
  - canonical recovery path
- Normalize copy:
  - `Undo` only for real undo
  - `Restore` / `Rollback` / `Retry from Safe Point` / `Reopen` for distinct cases
- Bind high-consequence runtime actions to canonical blocked/HITL command contracts where appropriate instead of ad hoc UI confirms.

### Do-not-forget details
- confirmation is not the same as authorization; some actions require runtime/HITL gating, not just a modal
- destructive worktree/cleanup actions must preserve historical lineage even when the live object is removed
- strong confirmations should be consequence-specific, not generic "Are you sure?"

## Research Progress - 2026-03-16 - Exact Artifact / Record Shapes

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Run_Graph_View.md`

### Key findings
- The docs already distinguish several important things:
  - evidence vs artifacts
  - parent-summary artifact vs evidence summary
  - preview subjects can be document-backed or artifact-backed
  - exact records belong in Ledger while summary/inspection lives elsewhere
- The problem is that many major record families are named but not shaped clearly enough:
  - review record
  - corroboration packet/result
  - graph patch request / applied result
  - promotion record
  - recovery record
  - state transition report
- Compared to attempts/blocked/usage, these families still lack a normalized envelope and linkage story.

### Recommended envelope direction
- Strong recommendation:
  - use a shared record-envelope pattern across major governance/runtime record families
- Candidate shared envelope fields:
  - `record_id`
  - `record_kind`
  - `project_id`
  - `run_id?`
  - scope refs:
    - `seam_id?`
    - `package_id?`
    - `node_id?`
    - `attempt_id?`
    - `promotion_id?`
    - `concern_id?`
    - `lane_id?`
    - `worktree_id?`
  - `status`
  - `created_at_utc`
  - `created_by_kind`
  - `created_by_ref?`
  - `superseded_by_record_id?`
