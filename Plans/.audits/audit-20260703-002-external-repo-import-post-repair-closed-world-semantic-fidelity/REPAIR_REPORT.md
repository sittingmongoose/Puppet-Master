# Repair Report - audit-20260703-002

Status: `PASS_WITH_WARNINGS`

Ledger: `pldg-20260703-001-feature-intake`
Generated: `2026-07-03T23:16:27Z`

## Scope

- Original audit scope rows: 4,476
- Repair impact rows: 4
- Closure rows: 4
- Coverage: 100%, no sampling
- Repair-required findings remaining: 0
- Non-actionable warnings remaining: 2

## Closures

- `sfk-f2071824da7401e6ca59eb43` repaired: all 122 atoms backlink to `0PI-066` while retaining detailed compile targets.
- `sfk-ff7c947dff249da73ad63a1a` repaired: existing process PlanUnits now carry source_atom_ids and the audit-named exact tokens.
- `sfk-7ac4b10c5ce4296b24691da1` repaired: July 3 auto-decision provenance row records the required Spec Lock/governance seal basis.
- `sfk-13f7d62e51d043854a69f648` repaired: `0PI-066` no longer says governance seal remains pending after the explicit seal.

## Validators

All required validators passed, including closure validation, target ledger validation, plan index, migration, shards, auto-decisions, Spec Lock, evidence, plan graph, audit status index, audit-governance, run-gates, bootstrap-ledger sweep, `git diff --check`, and `pytest` (`19 passed`).

## Terminal State

No WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, final node manifests, or production build tasks were created. Terminal state is `PASS_WITH_WARNINGS`; no repair action remains.
