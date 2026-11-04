# Shard 015: Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2203-L2217

Source SHA256: `708e6627389eaa12f14119187a1f37ac936da0988d1b8d4d3f4eb10cb6b0a054`

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
