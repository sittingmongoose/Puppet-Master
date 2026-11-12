# Shard 018: Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1272-L1279

Source SHA256: `4685696c058fe6c44090aafea6432e1e13f104e1b7b6dc0b0552cddae1b1a110`

---

## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
