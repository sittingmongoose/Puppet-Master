# Shard 007: Recovery Terminology Canonical Alignment (2026-03-08)

Source: `Plans/Crosswalk.md`

Source lines: L461-L472

Source SHA256: `3abb1cf569e859bf71410fc96b1de66de1dee6e1465ffb6f739965f2805c403c`

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
