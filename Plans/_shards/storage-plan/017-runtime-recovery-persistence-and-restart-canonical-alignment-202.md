# Shard 017: Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2112-L2132

Source SHA256: `a09c79bd51df81731897baaade6e17091e02fd58e5c7b46df365430deaeb6f95`

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
