/goal Generate the PlanUnit index and node-readiness report from live standardized Plans.

Read AGENTS.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Bootstrap_Planning_Migration.md if present, and live non-pipeline Plans docs.

This is an index/readiness phase only.

Rules:
- Do not create WorkNodes, NodeSeeds, NodeSeed candidates, WorkNodeRequests, WorkGraphs, executable queues, GoalRuns, implementation files, final node manifests, or production build tasks.
- Do not alter canonical prose unless a small, clearly validated repair is required.
- Do not update Spec_Lock, shards, evidence, plan_graph, or auto_decisions.
- PlanUnits are canon-addressable units from live Plans docs.
- Every indexed PlanUnit must include gui_related true/false.
- Preserve depends_on, unblocks, validation_surfaces, acceptance_criteria, risk_class, reasoning_tier, context_scope, implementation_surfaces, source_lineage, and gui_related.
- node_readiness_report analyzes future conversion readiness only.
- If Plans are incomplete, status = blocked_plans_incomplete.
- If the compiler/runtime contract remains incomplete or disabled, status = blocked_compiler_contract_incomplete or runtime_disabled according to current canon.
- No stubs, TODOs, TBDs, placeholders, empty required sections, or fake acceptance criteria may be hidden by the index.

Tasks:
1. Regenerate only allowed Plans/.plan_index outputs:
   - plan_units.jsonl
   - doc_cards.json
   - dependencies.json
   - acceptance_units.jsonl
   - coverage_report.json
   - node_readiness_report.json
2. Run:
   python3 scripts/pm-plan-index.py validate
   python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits, if present
   git diff --check, if available
3. Write exact blockers and typed dependency/cycle findings if readiness is incomplete.

Report changed files, PlanUnit count, acceptance count, node_readiness_report.status, validators, and governance seal status.
