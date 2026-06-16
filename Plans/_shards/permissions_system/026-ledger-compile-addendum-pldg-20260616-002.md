# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Permissions_System.md`

Source lines: L7591-L7648

Source SHA256: `6fea7cd9e8c993ab6551844d3149b3ef238328a3abe6b93c2011663974721db1`

---

## Ledger Compile Addendum - pldg-20260616-002

### PS-115 - GoalRun Write Authority And Lane Blockers

```yaml
plan_unit_id: PS-115
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Permissions_System owns GoalRun write authority checks for read_only, proposal_only, patch_only, leased_writer, and parent_writer modes, plus blocked-action payloads for missing lane bindings, overlapping worktree leases, unsafe/destructive scope, and invisible/internal goals that exceed predeclared authority. Permission decisions consume capability_lane and write_mode from runtime records and return recoverable blockers where user or settings action can resolve the issue.
gui_related: false
gui_classification_reason: Write authority and blocker payloads are permission/runtime policy; GUI surfaces consume their visible projections.
depends_on:
  - PS-114
  - MS-109
unblocks: []
acceptance_criteria:
  - Permission checks consume write_mode values read_only, proposal_only, patch_only, leased_writer, and parent_writer.
  - Missing capability lanes and overlapping write surfaces produce typed blockers.
  - Invisible/internal goals cannot exceed predeclared authority.
  - Recoverable blockers name the user, Settings, worktree, or approval action needed to proceed.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalRun permission/blocker review
risk_class: goalrun_write_authority_drift
reasoning_tier: high
context_scope: goalrun_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goalrun_write_authority
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0037
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "read_only"
  - "proposal_only"
  - "patch_only"
  - "leased_writer"
  - "parent_writer"
  - "capability_lane"
  - "write_mode"
  - "unconfigured-lane"
negative_constraints:
  - Do not let invisible/internal goals exceed predeclared authority.
  - Do not allow overlapping live writes without a permission-owned lease decision.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/WorktreeGitImprovement.md
```
