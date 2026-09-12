# Shard 017: Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2240-L2260

Source SHA256: `a825526fffc96c404feb9f7ff0b0b93fb89ad0dff4f3390fd21b72b2596e2126`

---

## Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)


### Restart and stale history
Required fields:
- `historical`
- `archived`
- `removed`
- `projection_freshness`
- `projection_health`
- `historical_lineage_refs[]`
- `worktree_id`
- `lane_id`
- `last_seen_at_utc`
- `owner_run_id`
- `owner_attempt_id`

Rules:
- Restart and cleanup must keep `historical`, `archived`, and `removed` distinct.
- Missing live worktrees or lanes remain historically inspectable instead of disappearing.
- Projection trust remains explicit through `projection_freshness` and `projection_health`.
