# Shard 007: Recovery Terminology Canonical Alignment (2026-03-08)

Source: `Plans/Crosswalk.md`

Source lines: L461-L472

Source SHA256: `ea5c5a6b23ece0992f83140a6a680509aeb7dcb64be07c6e1c3365f82743245d`

---

## Recovery Terminology Canonical Alignment (2026-03-08)


This packet requires an explicit terminology crosswalk:
- `safe point` = runtime-internal retry/remediation anchor
- `restore point` = user-visible history/rewind anchor
- `rollback` = explicit request/confirm restoration flow
- `worktree baseline` = execution-root state used to materialize a safe point or restore point depending on context

Required rule:
- docs and implementations must not use these terms interchangeably
- UI copy must preserve the distinction
