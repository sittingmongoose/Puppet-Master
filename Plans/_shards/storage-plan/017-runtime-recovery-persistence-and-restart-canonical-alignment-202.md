# Shard 017: Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2257-L2277

Source SHA256: `39412013f7dd410255dfec964717dad5d4ced853d27765102b50365907f2c455`

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
