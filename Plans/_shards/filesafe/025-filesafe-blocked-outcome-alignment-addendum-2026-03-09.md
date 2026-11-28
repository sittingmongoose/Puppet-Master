# Shard 025: FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

Source: `Plans/FileSafe.md`

Source lines: L2888-L2898

Source SHA256: `d2a96fd86b994b1dad7fc25f7903d48482dc894e36baa335772b2ecd7ade4b94`

---

## FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic execution failures.

### Required behavior
- classify as `blocked_reason_code = filesafe_blocked`
- preserve completed local work when safe to do so
- emit allowed recovery actions such as inspect denial, change policy, or rerun
- require safe-point restore before retry when policy says the workspace must be rolled back to a known baseline

FileSafe must not silently convert a denial into a retryable transient error.
