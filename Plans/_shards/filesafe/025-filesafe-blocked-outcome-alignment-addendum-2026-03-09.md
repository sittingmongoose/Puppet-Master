# Shard 025: FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

Source: `Plans/FileSafe.md`

Source lines: L2778-L2788

Source SHA256: `6d3a95c633375320c254cf79fdb02f5f8ac5d955fe3275e97b3e28f031767e71`

---

## FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic execution failures.

### Required behavior
- classify as `blocked_reason_code = filesafe_blocked`
- preserve completed local work when safe to do so
- emit allowed recovery actions such as inspect denial, change policy, or rerun
- require safe-point restore before retry when policy says the workspace must be rolled back to a known baseline

FileSafe must not silently convert a denial into a retryable transient error.
