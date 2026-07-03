# Shard 017: Runtime Retry / Fallback Ownership Addendum (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1241-L1256

Source SHA256: `66d19758732f76d6a0917667f9ec80f09fdf8d5dfb3aa73042f7f03558b2e47b`

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
