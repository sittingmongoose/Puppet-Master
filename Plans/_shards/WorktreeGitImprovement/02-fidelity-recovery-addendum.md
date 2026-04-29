## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-041: Source Control and worktree handshake

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0548
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Worktree visibility is only partially wired between Source Control and Orchestrator.** Several docs acknowledge shared visibility, yet status models still stop at repo/worktree/branch/tier rather than package/lane ownership, contamination, restore eligibility, or promotion posture.
  - Research Progress - 2026-03-16 - Source Control / Worktree Handshake
  - Reword Source Control worktree rows from `owner run/tier` to something like:
  - owner run/tier
  - Source Control worktree rows remain concrete and filesystem/Git oriented, but must show enough orchestration metadata to prevent isolation drift:
  - Source Control / worktree implication
  - no unresolved blocked recovery requiring that exact worktree
  - Because Source Control is narrow, it should default to compact current/live worktree rows with filters/toggles for:
  - safe-point and blocked recovery lineage can keep an old worktree relevant even after supersession
  - Orchestrator-owned worktree partitioning still exists only as row metadata (`owner run/tier`) in Source Control docs, not as a canonical grouping/partition contract
  - Move worktree docs onto node/lane-aware vocabulary and define projection authority between Source Control and Orchestrator receipt lineage.
  - Move worktree ownership to lane/worktree plus canonical run/node/attempt references, with Source Control remaining worktree-first at the UI level and Orchestrator remaining lane/package/seam/node-first operationally.
  - Source Control / worktree docs still describe boundary ownership in prose only; they still do not anchor one shared projection object or route payload that other surfaces can rely on.
  - Source Control and worktree docs still lack one durable object family for worktree ownership, restart authority, and historical lineage preservation.
  - Normalize Source Control worktree selection through `object_kind = worktree`.
  - object_kind = worktree
  - Source Control worktree selection is still described as UI state only even though worktree identity is now a first-class routed object in the broader model.
  - Keep Source Control worktree-first, but route by canonical worktree object identity rather than treating worktree selection as shell state or tier metadata.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0549
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Why it matters: worktree lifecycle, visibility, and conflict recovery cannot be coherent if both models remain canonical.
  - 5. **Specify package-based worktree lane pools end-to-end.**
  - what likely new model pressure is: scored ready-set scheduling, lane pools, package/seam governance split, contamination and safe-point-aware recovery.
  - likely issue: worktree ownership is still tier/subtask-native and does not support package-based lane pools or contamination quarantine.
  - a lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed.
  - archive lane worktree
  - lane / worktree
  - recreate a pruned worktree lane only via new runtime action, not true undo
  - Research Progress - 2026-03-16 - Lane / Worktree Cleanup Lifecycle
  - a lane may remain historically important after its live worktree is archived or removed
  - a live worktree may be operationally suspect even while the lane remains active in orchestration terms
  - Orchestrator should continue to present the lane state and show worktree status in context.
  - Define distinct lane and worktree lifecycle states, with explicit mapping but no forced identity collapse.
  - Worktree lane binding and historical lineage preservation are now correctness requirements, not nice-to-have source-control polish.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-059
- Fidelity gap refs: cov-059
- Required fidelity items:
- Exact required item: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-059: Lane vs worktree lifecycle split` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-059` repair states the exact requirement: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Exact acceptance check: The `cov-059` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-076: Historical semantic consistency

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0550
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - restore attempts and recovery episodes need current vs historical semantics
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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


