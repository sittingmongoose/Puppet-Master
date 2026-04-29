## Runtime Attempt / Safe Point / Queue Analysis Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0651
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Decision_Log.md` currently gives downstream reconciliation no durable place to point when explaining why rewrite-era ownership changed.
  - Decision_Log.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0665
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - now clearly needs a versioned correlation/context block and stronger account-health semantics
  - Reconcile `ask/plan` and `external_publish_side_effect` semantics in one canonical algorithm.
  - ask/plan
  - external_publish_side_effect
  - Concern/corroboration/promotion semantics are still absent or only gestured at:
  - still needs consolidation plus rewrite-era actor/corroboration/concern/wake semantics
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- `attempt_count` is the ground-truth count of started attempts for a node in a run, including the first attempt.
- `retry_count` is derived display data only: `max(attempt_count - 1, 0)`.
- sub-counter decomposition is additive attribution, not a replacement for `attempt_count`: `attempt_count = initial_attempts + retry_attempts + resume_attempts + remediation_retry_attempts`.
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
- projections that need lineage MUST join through `attempt_id` and the immutable attempt snapshot, not infer history from `retry_count` alone.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces

Required fields:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy

Canonical terms and values:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy
- runtime_artifact.*

Labels:
- projection freshness
- projection health
- fallback

Behavioral rules:
- Projection freshness is not the same thing as action authority.
- Projection-backed surfaces must degrade to direct-record views when trust drops.
- Runtime-artifact projections must be rebuildable from canonical seglog events.

Permission carry-through:
- action gating must respect projection trust before surfacing mutation actions
### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
