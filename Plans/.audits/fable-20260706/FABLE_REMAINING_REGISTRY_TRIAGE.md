# FABLE Remaining Registry Triage

Generated: 2026-07-08T00:30:58Z

## Scope

This is a closure-aware triage of the remaining mechanical rows in `buildability_repair_registry.jsonl`. It does not repair broad product prose, create WorkNodes/NodeSeeds/queues/runtime artifacts/implementation files/build tasks, mark `buildability_gate_passed` true, or refresh the PNC-019 receipt.

## Result

- Selected registry rows inventoried: 296
- Closed/non-repair dispositions applied: 86
- Confirmed current or owner-decision action rows: 210
- Explicitly deferred or runtime-certification-currentness rows: 7
- Current buildability boundary: `buildability_gate_passed=false`; `PNC-019` still blocks runtime readiness through `IRB-005` and `IRB-011`.

## State Counts

- `confirmed_current_needs_repair`: 201
- `duplicate_of_closed_row`: 3
- `explicitly_deferred`: 6
- `false_positive`: 4
- `not_for_plan`: 4
- `out_of_scope_runtime_certification`: 1
- `owner_decision_required`: 9
- `repaired_superseded`: 61
- `source_lineage_only`: 6
- `stale_retired`: 1

## Action Buckets

- `P2/P3 doc hygiene`: 194 open rows
- `PlanUnit behavioral AC/dependency hygiene`: 1 open rows
- `concept-vs-plans GUI design decisions/absent imagery`: 9 open rows
- `owner decisions`: 6 open rows
- `PNC-019 runtime/clean-room certification currentness`: tracked as a separate synthetic action row because the live gate blockers are governed readiness artifacts, not ordinary mechanical registry prose.

## Evidence Rules

- Rows closed as `repaired_superseded` link to existing FABLE repair reports, closure matrix rows, or global closure rows.
- Rows closed as `false_positive`, `source_lineage_only`, `not_for_plan`, `stale_retired`, or `explicitly_deferred` carry explicit non-repair disposition evidence.
- Rows left as `confirmed_current_needs_repair` or `owner_decision_required` are routed to `fable_remaining_action_plan.jsonl`; validators passing is not used as closure proof.

## Next Prompts

### PlanUnit / Buildability Hardening

```text
Goal: Harden remaining FABLE PlanUnit/buildability doc hygiene without opening runtime/build work.

Read AGENTS.md, Plans/00-plans-index.md, Plans/.audits/fable-20260706/FABLE_REMAINING_REGISTRY_TRIAGE.md, fable_remaining_registry_triage_report.json, fable_remaining_action_plan.jsonl, buildability_repair_registry.jsonl, repair_closure_matrix.jsonl, effective_status.json, terminal_state.json, and only live Plans docs named by action rows in buckets PlanUnit behavioral AC/dependency hygiene, concept-vs-plans GUI design decisions/absent imagery, owner decisions, and P2/P3 doc hygiene.

Scope: product prose/spec hygiene only. Do not create WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, or production build tasks. Do not mark buildability_gate_passed true. Do not refresh PNC-019 receipts.

Use read-only subagents by bucket. Main agent is only writer. First reuse closure evidence; repair only rows still confirmed_current_needs_repair or owner_decision_required. Preserve PMConcept as source-lineage unless Jared explicitly reopens a design choice. After edits, refresh derived plan/index/governance artifacts only if repo policy requires. Run the FABLE validator stack from the triage report and git diff --check.
```

### PNC-019 Certification Currentness

```text
Goal: Re-certify current PNC-019 runtime lifecycle and clean-room evidence after FABLE docs/projections stabilize.

Read AGENTS.md, Plans/00-plans-index.md, Plans/.audits/fable-20260706/FABLE_REMAINING_REGISTRY_TRIAGE.md, fable_remaining_action_plan.jsonl, Plans/.implementation_readiness/buildability_gate_report.json, readiness_blockers.jsonl, readiness_matrix.json, Plans/.plan_index/node_readiness_report.json, and current PNC-019 owner docs.

Scope: certification currentness only. Do not create product WorkNodes/NodeSeeds/queues/build tasks. Do not reuse stale receipts or static-only proof. Keep buildability_gate_passed=false unless current executable lifecycle plus clean-room harness evidence closes IRB-005 and IRB-011 under governed validators.

Use read-only subagents for runtime lifecycle, clean-room harness, readiness artifacts, and closure/validator. Main agent writes only certification receipts/projections explicitly required by the PNC-019 contract. Run validate-implementation-readiness, pm-plan-index validate, audit closure validators, run-gates, and git diff --check.
```

## Files

- `fable_remaining_registry_triage_report.json` contains the full per-row inventory and stable keys.
- `fable_remaining_action_plan.jsonl` contains only remaining action/deferred/runtime-currentness rows.
- `buildability_repair_registry.jsonl` now records per-row `remaining_registry_triage` projections so stale mechanical rows are not rediscovered as open.
