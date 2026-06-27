# Closed-World Semantic Audit: pldg-20260626-001-feature-name

Status: BLOCKED

- Audit ID: `audit-20260627-001-feature-name-closed-world-semantic-fidelity`
- Observation ref: `HEAD` / `c3416e738`
- Baseline ref: `5432e92e8`
- Scope rows: 6176 / 6176 classified, no sampling
- Ledger coverage: 157 atoms, 126 compiled atoms, 31 not-for-plan atoms, 39 PlanUnits
- Actionable findings: 5
- Validator status: blocked; closure validators failed, all non-closure validators passed

## Findings

1. `sfk-f8423c4e517fb17c07f85c79` error: open_items simultaneously says no governance-seal items remain and keeps stale pending-seal/migration entries under unsealed_governance while governance_status is sealed.
2. `sfk-59d05a2506768c5b5e4b7dd5` error: Registry root updated_at_utc predates the target sealed ledger row updated_at_utc, leaving registry-level freshness stale.
3. `sfk-bb22404e699f565749330a00` error: The compile introduced three additional true dependency cycles touching History, vision bridge, and Teach PlanUnits; build_order_available remains false with cycle count rising from 3 to 6.
4. `sfk-ef42a1471f0d65648b3c4041` error: PRDB-010 and PWIZ-016 both depend on and unblock OP-026, making producer/consumer edge polarity contradictory.
5. `sfk-92aad11571a0b876c62d3a0e` warning: Node readiness remains intentionally blocked and no node/runtime/build artifacts were created; dependency metadata issues above are separately actionable.
6. `sfk-aef5a92d05e19f031cb5a83e` info: This audit is intentionally not written back into ledger projections because the user restricted writes to the audit directory.
7. `sfk-125645c0f5a976d064d70821` error: Global closure validation fails with 782 stale owner/closure evidence hash errors across 237 closure-registry rows after the current Plans/index/registry changes. Existing closure rows cannot be treated as valid reuse until hashes are refreshed through the governed closure process.

## Clean Evidence

- Atom exact-token preservation: 1 missing token rows across compiled atom mappings.
- Reciprocal source lineage: 0 missing atom-to-PlanUnit source claims.
- Owner-doc locations: 0 missing PlanUnit locations in live owner docs.
- Not-for-plan leakage: 0 not-for-plan atoms emitted as standalone PlanUnit source lineage.
- Forbidden artifacts: no WorkNode, NodeSeed, src/Cargo.toml, Slint, or Iced implementation artifacts found in the workspace sweep.
- Validators: target ledger, PlanUnit index, migration, run-gates, shard check, auto-decisions, Spec Lock, evidence, plan graph, and diff checks passed; closure registry validation failed with 782 stale-hash errors.

## Next Action

Repair is required, but this audit is audit-only. Do not repair in this lane.
