# Shard 025: FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

Source: `Plans/FileSafe.md`

Source lines: L2882-L2892

Source SHA256: `e3dd00aefe77af402142dc62c8838be67674b3d6204abfdd4b1caa9f78ae6c67`

---

## FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic execution failures.

### Required behavior
- classify as `blocked_reason_code = filesafe_blocked`
- preserve completed local work when safe to do so
- emit allowed recovery actions such as inspect denial, change policy, or rerun
- require safe-point restore before retry when policy says the workspace must be rolled back to a known baseline

FileSafe must not silently convert a denial into a retryable transient error.
