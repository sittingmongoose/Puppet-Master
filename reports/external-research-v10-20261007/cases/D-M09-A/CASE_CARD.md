# D-M09-A — prospective comparison card

Complementary review of one online-backup module

Family: GLM, Max; exact account/model route is root-bound before dispatch. Root Max overrides packet Ultra. No dispatch performed.

Question/sources: [inputs/brief.md](inputs/brief.md), [inputs/sources.json](inputs/sources.json), [INPUT_MAP.json](INPUT_MAP.json).

Method: M09 — Parallel complementary critics at equal total work budget. The full unaltered method card, stage procedures, output scope and quality map are in [case-card.json](case-card.json).

Control: One critic reviews the declared bounded scope.

Treatment: Two same-family critics cover complementary evidence/implementation risks in parallel, followed by explicit reconciliation.

Each arm has an equal 15-minute complete diagnostic envelope, including cold-equivalent common seed, retries, source work, finalization, and parallel occupied work. Each arm's cold-equivalent latency ceiling is 15 minutes; parallel stages reduce critical path but never aggregate cost.

control: common_seed 3 min → single_critic 10 min → reconcile_and_final 2 min.

treatment: common_seed 3 min → evidence_critic 4 min (parallel critics) → operations_critic 4 min (parallel critics) → reconcile_and_final 4 min.

Launch rank 17; arm order control → treatment. No cross-arm answer sharing.

Quality guard: Total candidate budget includes both critics and reconciliation. Majority agreement is not source truth; nested tasks consume the family concurrency allocation.

Common predecessor is missing. See [PREDECESSOR.md](PREDECESSOR.md). No READY.json until its actual bytes and receipts exist.
