# Shard 017: Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)

Source: `Plans/storage-plan.md`

Source lines: L2510-L2530

Source SHA256: `225a9611c73a4651be781b5fb3e8eccd8f4c6b8a1b20d23de5b44cbf9aee3774`

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
