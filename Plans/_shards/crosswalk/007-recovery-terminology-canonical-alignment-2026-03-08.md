# Shard 007: Recovery Terminology Canonical Alignment (2026-03-08)

Source: `Plans/Crosswalk.md`

Source lines: L386-L397

Source SHA256: `f2f8e870f84d197685516b94bf721a02b4a839ed3d513287213a5168585c0682`

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
