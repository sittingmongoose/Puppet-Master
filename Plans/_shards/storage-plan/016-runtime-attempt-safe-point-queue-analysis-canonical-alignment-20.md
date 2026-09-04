# Shard 016: Runtime Attempt / Safe Point / Queue Analysis Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2157-L2211

Source SHA256: `6a4eb20b9d80825dd1ca6acc4735de58c878a316d4183d8632bc80fb2d0b63da`

---

## Runtime Attempt / Safe Point / Queue Analysis Canonical Alignment (2026-03-09)


Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics


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
