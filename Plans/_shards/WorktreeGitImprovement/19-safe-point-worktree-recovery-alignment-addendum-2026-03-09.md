## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0542
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Retry from Safe Point`
  - Retry from Safe Point
  - attempt to restore or reconcile a suspect/orphaned/conflicted worktree into a safe known state
  - `retry from safe point` vs `start fresh attempt`
  - retry from safe point
  - start fresh attempt
  - `safe point vs restore point`
  - safe point vs restore point
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
