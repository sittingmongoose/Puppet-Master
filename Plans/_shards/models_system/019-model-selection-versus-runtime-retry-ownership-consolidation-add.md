# Shard 019: Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1280-L1289

Source SHA256: `4685696c058fe6c44090aafea6432e1e13f104e1b7b6dc0b0552cddae1b1a110`

---

## Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)


Model selection and retry ownership remain separate concerns.

Rules:
- attempt start persists stable requested/effective model snapshot identifiers
- retries and resumes do not silently change model identity unless the canonical runtime policy explicitly creates a new attempt with new snapshot IDs
- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics
- UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring them from provider names alone
