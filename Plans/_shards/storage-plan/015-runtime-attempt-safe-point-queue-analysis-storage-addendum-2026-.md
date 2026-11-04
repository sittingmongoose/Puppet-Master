# Shard 015: Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2203-L2217

Source SHA256: `da77de7cf190179b4f9bbc64b8849c32a715329e6b07870e62acd0c5b0aa8f15`

---

## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)


Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
