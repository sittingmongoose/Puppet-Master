# Shard 018: Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1283-L1290

Source SHA256: `1cb6c90beff8f25fe7a4e73492591a6633aa0604bb00de41849855bcbee3887a`

---

## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
