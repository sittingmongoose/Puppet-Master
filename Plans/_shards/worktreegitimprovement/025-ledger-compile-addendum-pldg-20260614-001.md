# Shard 025: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L4863-L4900

Source SHA256: `88402dbf75591b036b5e9b242a67576bb4d2645329db848ea9b324ca3f2e8910`

---

## Ledger Compile Addendum - pldg-20260614-001

### W-070 - Worktree Allocation And Lane Cleanup Header Recovery

```yaml
plan_unit_id: W-070
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  WorktreeGitImprovement owns worktree allocation, lane/worktree binding, contamination quarantine, safe-point recovery, restore-before-reuse,
  and lane cleanup semantics. Empty worktree allocation and lane-cleanup stubs hydrate from WorktreeGit, Executor, storage, Crosswalk, and
  orchestrator-subagent owner split; they do not revive branch-per-tier or tier-keyed worktree allocation as live canon.
gui_related: true
gui_classification_reason: Source Control and worktree state are user-visible surfaces, and this unit governs their visible allocation/recovery semantics.
depends_on: [W-001]
unblocks: []
acceptance_criteria:
  - Worktree allocation defaults to package/lane ownership with seam exceptions documented by policy.
  - Contaminated worktrees quarantine until recovery clears the blocker.
  - branch-per-tier wording remains compatibility-only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual worktree owner-section review
risk_class: worktree_allocation_drift
reasoning_tier: standard
context_scope: worktree_allocation_cleanup
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: worktree_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0069
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["worktree allocation strategy", "lane-cleanup lineage", "package-based lane pools", "branch-per-tier", "contamination quarantine", "restore-before-reuse"]
negative_constraints:
  - Do not revive branch-per-tier as live worktree allocation canon.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md, Plans/storage-plan.md]
```
