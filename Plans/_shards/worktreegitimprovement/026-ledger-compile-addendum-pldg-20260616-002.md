# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L4840-L4904

Source SHA256: `b5d92e49a0d78ddcd74bbe1103fffe81fdd002b82e91070b5be05de37768dc4d`

---

## Ledger Compile Addendum - pldg-20260616-002

### W-071 - GoalRun Worktree Lease And Write Surface UX

```yaml
plan_unit_id: W-071
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Source Control and Worktrees must surface GoalRun and WorkNode write-surface policy through worktree leases, isolated writes, parent merge, blocked write reasons, and write-mode labels. Supported labels include read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer. Subagents must not mutate overlapping live surfaces concurrently, and every GoalRun write-capable action must preserve worktree_id, owner lane, and lease or blocker evidence.
gui_related: true
gui_classification_reason: Source Control, Worktrees, blocked write reasons, and lease labels are user-visible worktree/source-control UI.
depends_on:
  - W-070
  - PS-115
  - SP-215
unblocks: []
acceptance_criteria:
  - Source Control displays GoalRun and WorkNode write-surface policy and lease state.
  - Worktree leases preserve worktree_id, owner lane, and blocker evidence.
  - read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer labels are available to visible source-control surfaces.
  - Overlapping live writes by subagents are blocked or serialized through explicit parent merge policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Source Control GoalRun lease review
risk_class: overlapping_write_surface_drift
reasoning_tier: high
context_scope: goalrun_worktree_leases
implementation_surfaces:
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: goalrun_worktree_lease_ui
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0025
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0037
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
preserved_exact_tokens:
  - "Source Control"
  - "Worktrees"
  - "worktree leases"
  - "isolated writes"
  - "parent merge"
  - "write-surface"
  - "blocked write reasons"
  - "read_only"
  - "proposal_only"
  - "patch_only"
  - "isolated_worktree"
  - "leased_writer"
  - "parent_writer"
negative_constraints:
  - Do not mutate repositories outside write-surface and worktree policy.
  - Do not allow overlapping live writes without explicit lease or parent merge authority.
owner_hints:
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
```
