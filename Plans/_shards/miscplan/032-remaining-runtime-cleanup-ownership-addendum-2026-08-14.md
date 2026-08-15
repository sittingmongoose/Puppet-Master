# Shard 032: Remaining Runtime Cleanup Ownership Addendum (2026-08-14)

Source: `Plans/MiscPlan.md`

Source lines: L6405-L6439

Source SHA256: `beb6fc1a5577ad84a061ff2803887816b569a9d4415ab37005d1ad0f9ef72ab0`

---

## Remaining Runtime Cleanup Ownership Addendum (2026-08-14)

### M-084 - Workspace Cleanup Manager Sole Owner

```yaml
plan_unit_id: M-084
unit_type: owner_boundary
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  MiscPlan owns the sole Workspace Cleanup Manager policy and operation: exact
  workspace/worktree target, inventory, allowlist, retention and sensitivity
  classification, preview, Permissions and FileSafe decisions, resource
  admission, deletion receipt, post-delete verification, restart reconciliation,
  and recovery disclosure. Storage persists policy/receipts and Worktree owns
  worktree lifecycle; neither is a peer cleanup manager.
gui_related: true
gui_classification_reason: Cleanup preview, exclusions, retained evidence, blocked reasons, verification, and recovery are user-visible.
depends_on: [M-020, M-021, M-061, SIR-006, W-084]
unblocks: []
acceptance_criteria:
  - MGR-020 routes cleanup to MiscPlan rather than storage or a worktree-local peer.
  - Cleanup binds an exact root and refuses repository, home, broad mount, unresolved variable, symlink escape, concurrent-owner, or stale-generation targets.
  - Protected state, evidence, active worktrees, credentials, and allowlisted paths survive; deletion success requires post-action verification and a durable receipt.
  - Interrupted cleanup reconciles from inventory, intent, per-entry result, and verification evidence; missing evidence never becomes success.
validation_surfaces: [cleanup owner-routing audit, path/symlink/concurrent-owner negative fixtures, restart reconciliation fixtures]
risk_class: cleanup_data_loss_or_parallel_owner
reasoning_tier: high
context_scope: workspace_cleanup_manager
implementation_surfaces: [Plans/MiscPlan.md, Plans/FileSafe.md, Plans/Permissions_System.md, Plans/storage-plan.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: workspace_cleanup_manager_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#MGR-020
negative_constraints: [Do not use Storage or Worktree as a peer cleanup manager., Do not run broad recursive cleanup from an unresolved path., Do not claim deletion without verification.]
```
