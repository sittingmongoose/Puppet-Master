# Repair Report: audit-20260619-007-prd-planning-wizard-head-semantic-fidelity

Status: repair_validated

Closed all 4 repair_required rows: 3 repaired, 1 stale_retired. No user decisions remain blocked. No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, runtime dispatch, or production build tasks were created.

## Closed Rows

- semantic_risks.jsonl:1 / sfk-9004c05d325c979c02058376 - repaired local validation path leakage.
- semantic_risks.jsonl:2 / sfk-678e9596c78963b2c1cbdd12 - repaired PlanCompile runtime/design-only schema contradiction.
- owner_routing_findings.jsonl:1 / sfk-f359a7d831b908a36af76013 - repaired owner map underreporting by distinguishing ContractRef targets from PlanUnit-index lineage/support docs.
- atom_fidelity_matrix.jsonl:167 / sfk-8e89d5a3ec1c8ddcae9899d0 - stale_retired source-lineage atom; current repair scope remains repair_required=true only.

## Artifacts

- `repair_closure_matrix.jsonl`
- `parallel_assignment_receipts.jsonl`
- `_semantic_closure_registry.jsonl` rows `closure-audit-20260619-007-prd-planning-wizard-head-semantic-fidelity-repair-001` through `-004`

## Validators

All required validators passed: audit closure, target ledger validator, PlanUnit index, migration proof, run-gates, shard check, auto-decisions, Spec Lock, evidence, plan graph, handoff schema, audit-governance, local path scan, and git diff check.

Node readiness remains `blocked_compiler_contract_incomplete`.
