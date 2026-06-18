# Shard 027: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L4906-L4959

Source SHA256: `b5d92e49a0d78ddcd74bbe1103fffe81fdd002b82e91070b5be05de37768dc4d`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### W-072 - Plans-To-Code Worktree Allocation And Source-Control Truth

```yaml
plan_unit_id: W-072
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Mutation-capable WorkNode attempts must run in a known repo/worktree context. Parallel WorkNodes require isolated worktrees or explicit clean allocation, and dirty, conflicted, contaminated, blocked-preserved, or lineage-mismatched worktrees cannot be reused silently. Worktree allocation records preserve repo_id, worktree_id, worktree_path, baseline_commit_oid, branch/head state, head_commit_oid, changed_files, conflict_refs, owner lane, lease state, dirty_state_policy, conflict_policy, merge_policy, github_policy, rollback_available, rollback_ref, and restore_command_or_action. Local source-control/worktree state remains execution truth; GitHub is an optional promotion/output layer when configured.
  This is the source-control execution contract for worktree allocation; a dirty worktree or merge conflict blocks silent reuse, and GitHub optional promotion cannot replace local source-control truth.
gui_related: true
gui_classification_reason: Worktree allocation, Source Control status, lease state, conflicts, and blocked-preserved states are user-visible source-control UI surfaces.
depends_on: [W-071, EP-100]
unblocks: [OP-024, EP-100, RAP-029]
acceptance_criteria:
  - Mutation-capable WorkNodes preserve repo and worktree identity before execution.
  - Parallel writes use isolated worktrees or explicit clean allocation.
  - Dirty, conflicted, contaminated, blocked-preserved, and lineage-mismatched worktrees block silent reuse.
  - Local worktree state remains source-control truth even when GitHub promotion is configured.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future source-control preflight validation
risk_class: unsafe_worktree_reuse
reasoning_tier: high
context_scope: plans_to_code_worktrees
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md, Plans/FileSafe.md, Plans/GitHub_Integration.md]
node_compile_hint: {mode: worktree_allocation_source_control_truth, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0035
  - pldg-20260617-001-plans-to-code-handoff:atom-0036
  - pldg-20260617-001-plans-to-code-handoff:atom-0038
  - pldg-20260617-001-plans-to-code-handoff:dec-0015
preserved_exact_tokens:
  - "worktree_id"
  - "isolated worktree"
  - "dirty worktree"
  - "merge conflict"
  - "changed_files"
  - "conflict_refs"
  - "rollback_ref"
  - "blocked-preserved"
  - "local source-control truth"
negative_constraints:
  - Do not reuse unsafe worktrees silently.
  - Do not require GitHub for local-only project completion.
owner_hints:
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/FileSafe.md
```

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md
