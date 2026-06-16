# Shard 017: Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1112-L1119

Source SHA256: `6da0c29a05f08d750d91c32658484506b8ec1e8eac510c6af4b41cdbf3c7879c`

---

## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
