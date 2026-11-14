# Shard 017: Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2420-L2440

Source SHA256: `da01bb5b8995f081f223c1fed265377a35453f2a97e31e5b739209ed03c31ee9`

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
