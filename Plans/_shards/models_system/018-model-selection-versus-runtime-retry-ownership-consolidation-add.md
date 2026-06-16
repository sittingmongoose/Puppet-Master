# Shard 018: Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1120-L1129

Source SHA256: `f19bad2aebb5d8c4d8e4b3fc3e824c0f9dfb893b4403113f0dc11c062a70d1be`

---

## Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)


Model selection and retry ownership remain separate concerns.

Rules:
- attempt start persists stable requested/effective model snapshot identifiers
- retries and resumes do not silently change model identity unless the canonical runtime policy explicitly creates a new attempt with new snapshot IDs
- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics
- UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring them from provider names alone
