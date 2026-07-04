# Shard 019: Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1265-L1274

Source SHA256: `90daa3edae3561ea8a38226d25133642290e9286103ed6ddd375bf8c9e7c316e`

---

## Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)


Model selection and retry ownership remain separate concerns.

Rules:
- attempt start persists stable requested/effective model snapshot identifiers
- retries and resumes do not silently change model identity unless the canonical runtime policy explicitly creates a new attempt with new snapshot IDs
- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics
- UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring them from provider names alone
