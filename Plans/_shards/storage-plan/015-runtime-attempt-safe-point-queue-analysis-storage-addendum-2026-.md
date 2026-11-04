# Shard 015: Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2209-L2223

Source SHA256: `452eb063ad8c3c01bf9f26a9383d387ce73c1773bb7ae6c3665f05070f03ce8d`

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
