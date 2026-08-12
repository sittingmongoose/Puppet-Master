# Shard 011: Concern lifecycle verification checklist

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L131-L171

Source SHA256: `706621f63d64d09122cea29208ce19c805002d89aee23ebc15df994033a763ca`

---

## Concern lifecycle verification checklist

Before shipping the rebuilt Orchestrator GUI, verify the following concern lifecycle behaviors:

### Basic concern creation and update
- [ ] A concern is created when an execution unit enters a blocking condition (approval, manual input, error).
- [ ] The concern_id is stable across restarts and re-entries; a new concern_id is only minted for root-cause changes.
- [ ] The blocked_episode_id increments monotonically for each episode within a concern_id.
- [ ] The escalation_stack accumulates frames; frames are never removed or reordered.
- [ ] Dismiss `/resolve` paths record `resolution_kind` and rationale while keeping concerns separate from review findings, annotations, blocked episodes, and recovery records, with explicit cross-linking where relationships exist.

### Concern visibility and filtering


- [ ] Active concerns are visible to users with execute permission on the execution_unit_context.
- [ ] Escalation stack internals are hidden unless audit mode is active.
- [ ] Help/notification surfaces show concern_id and general guidance without exposing sensitive escalation details.
- [ ] Dismissed concerns are visually distinguished from resolved concerns (see concern_reason rationale in transfer_coverage).

### Approval scope isolation
- [ ] An approval at run scope gates the entire run; child nodes do not bypass it.
- [ ] An approval at node scope gates only that node; sibling nodes proceed independently.
- [ ] An approval at delegated_subagent scope gates the subagent call but not the parent orchestrator.
- [ ] Approval scope is tied to execution_unit_context level, not to concern_id; multiple concerns can exist within the same scope.
- [ ] HITL checkpoints do not use `checkpoints.hitl.{run_id}` or `checkpoints.hitl` as the sole key; approval identity includes run_id plus the finer approval/blocked scope.

### Restart and recovery
- [ ] If a unit restarts (restart_count increments), the blocked_episode_id is preserved and rebound to the same concern_id.
- [ ] The escalation_stack shows all prior attempts; a UI inspection can trace the full recovery path.
- [ ] If runtime identity is unresolvable, escalate to execution_role's escalation chain; do not silently use a default identity.
- [ ] Route fallback (e.g., switching to workspace://project/concern) is logged in the concern record; do not hide route failures.

### Concern cleanup and retention


- [ ] Resolved concerns remain visible for inspection but are marked with resolution metadata (resolved_at, resolved_by, resolution_reason).
- [ ] Dismissed concerns are retained per retention policy (default: 7 days, configurable per concern_class).
- [ ] Archived concerns are moved to a separate ledger; do not delete them.
- [ ] Audit log contains a record of every concern lifecycle transition (created, escalated, approved, resolved, dismissed, archived).

ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope
