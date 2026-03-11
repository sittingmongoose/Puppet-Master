## Runtime Scheduler Consumer Reconciliation Addendum (2026-03-09)

The orchestrator is the primary consumer of the canonical runtime scheduler contract.

### Consumer rules
- consume canonical runtime event names from `Plans/Contracts_V0.md`; do not treat legacy `run.*` names as separate semantics
- reevaluate directly affected runnable units in the same wake cycle after `node.prerequisite_resolved`
- shortage of slots is `non_selected_reason = capacity_deferred`, not a blocked outcome
- worktree merge/conflict or dirty-baseline problems block dispatch using `blocked_reason_code = worktree_conflict` or `dirty_worktree`
- `allowed_action_ids[]` are the only recovery actions surfaced from blocked outcomes; domain metadata binds the exact command surface

### Retry/remediation integration
- retries, resume-after-prerequisite, and restore-before-rerun always create new attempts
- FileSafe may override generic retry policy by setting `requires_safe_point_restore = true`
- remediation children inherit lineage metadata but not the old attempt identity
