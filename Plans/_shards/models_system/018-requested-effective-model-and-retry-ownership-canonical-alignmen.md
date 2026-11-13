# Shard 018: Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1272-L1279

Source SHA256: `dee618544c82f1dea7dbd9558bd093dae88c784b1a6383c823f8895256c0e015`

---

## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
