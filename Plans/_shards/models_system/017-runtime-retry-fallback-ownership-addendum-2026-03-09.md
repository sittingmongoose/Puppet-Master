# Shard 017: Runtime Retry / Fallback Ownership Addendum (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1256-L1271

Source SHA256: `4685696c058fe6c44090aafea6432e1e13f104e1b7b6dc0b0552cddae1b1a110`

---

## Runtime Retry / Fallback Ownership Addendum (2026-03-09)

Model fallback and runtime retry are separate concerns.

### Ownership split
- model selection decides requested/effective provider/model before execution begins
- runtime policy decides whether an attempt is retried, remediated, blocked, or escalated after a classified outcome
- providers and adapters may not invent model-local retry loops that bypass runtime policy

### Required attempt snapshots


Each attempt MUST retain requested and effective model/provider identifiers so users can later explain why a blocked or failed attempt ran under a specific effective configuration.

### Fallback rule
Model fallback may change the effective model only through the shared model-selection contract, never as an implicit side effect of provider transient handling inside an already-running attempt.
