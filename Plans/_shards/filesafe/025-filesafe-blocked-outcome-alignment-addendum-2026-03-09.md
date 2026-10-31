# Shard 025: FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

Source: `Plans/FileSafe.md`

Source lines: L2879-L2889

Source SHA256: `3e2760d08279b7908ac72fa0c4ec7e33d70dfb92c0747804f769be5b50d66e20`

---

## FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic execution failures.

### Required behavior
- classify as `blocked_reason_code = filesafe_blocked`
- preserve completed local work when safe to do so
- emit allowed recovery actions such as inspect denial, change policy, or rerun
- require safe-point restore before retry when policy says the workspace must be rolled back to a known baseline

FileSafe must not silently convert a denial into a retryable transient error.
