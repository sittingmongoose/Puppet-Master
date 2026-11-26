# Shard 018: Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Source: `Plans/Models_System.md`

Source lines: L1279-L1286

Source SHA256: `cacc3e2efa43deeaeea1a96025e0f348aae2b1203a82df10552301c3196ce686`

---

## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
