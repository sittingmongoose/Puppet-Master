## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-041: Source Control and worktree handshake
- Coverage rows: cov-041
- Fidelity gap refs: cov-041
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-041: Source Control and worktree handshake` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-041` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-041` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-041` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-059: Lane vs worktree lifecycle split
- Coverage rows: cov-059
- Fidelity gap refs: cov-059
- Required fidelity items:
- Exact required item: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-059: Lane vs worktree lifecycle split` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-059` repair states the exact requirement: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Exact acceptance check: The `cov-059` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-076: Historical semantic consistency
- Coverage rows: cov-076
- Fidelity gap refs: cov-076
- Required fidelity items:
- Exact required item: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-076: Historical semantic consistency` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-076` repair states the exact requirement: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Exact acceptance check: The `cov-076` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-169: Coverage blocker provider/model precedence owner section
- Coverage rows: cov-169
- Fidelity gap refs: cov-169
- Required fidelity items:
- Exact required item: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact required item: Tie that section to parallel-node worktree assignment and ownership transitions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-169: Coverage blocker provider/model precedence owner section` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-169` repair states the exact requirement: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact acceptance check: The `cov-169` repair states the exact requirement: Tie that section to parallel-node worktree assignment and ownership transitions
- Exact acceptance check: The `cov-169` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-171: Coverage blocker worktree allocation strategy
- Coverage rows: cov-171
- Fidelity gap refs: cov-171
- Required fidelity items:
- Exact required item: Define concrete worktree allocation strategy
- Exact required item: Define contamination, reuse, and cleanup rules for that strategy
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-171: Coverage blocker worktree allocation strategy` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-171` repair states the exact requirement: Define concrete worktree allocation strategy
- Exact acceptance check: The `cov-171` repair states the exact requirement: Define contamination, reuse, and cleanup rules for that strategy
- Exact acceptance check: The `cov-171` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-189: Projection fields for startup rehydration
- Coverage rows: cov-189
- Fidelity gap refs: cov-189
- Required fidelity items:
- Exact required item: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact required item: Carry dirty_state and conflict_state in worktree projections
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-189: Projection fields for startup rehydration` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-189` repair states the exact requirement: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact acceptance check: The `cov-189` repair states the exact requirement: Carry dirty_state and conflict_state in worktree projections
- Exact acceptance check: The `cov-189` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-206: Lane cleanup lineage fields
- Coverage rows: cov-206
- Fidelity gap refs: cov-206
- Required fidelity items:
- Exact required item: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-206: Lane cleanup lineage fields` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-206` repair states the exact requirement: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Exact acceptance check: The `cov-206` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


