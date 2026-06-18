/goal Compile PM Bootstrap Ledger pldg-20260618-001-prd-planning-wizard to canonical Plans.

Read AGENTS.md; Plans/bootstrap/Bootstrap_Planning_Workflow.md; Plans/Planning_Ledger_System.md; Plans/Plan_Document_System.md; Plans/Plan_To_Node_Compilation.md; Plans/Goal_Runtime_System.md; Plans/bootstrap/Codex_Prompts.md; ledger registry; and this ledger's compact state. Read records/source_shards only when a compact item or source_ref requires exact detail.

Authority:
- Ledger is source/planning memory, not canon.
- Live non-pipeline Plans docs are canon.
- Every ready atom needs a fine-grained PlanUnit or evidence-backed disposition.
- Expected new owners are Plans/PRD_Builder.md and Plans/Planning_Wizard.md unless owner adjudication proves otherwise.

HARD PARALLEL GATE:
This ledger exceeds all broad-work thresholds. Build a bounded worklist from compile_groups and launch many read-only subagents in parallel by atom family, owner-doc family, and <=400-line doc windows. Record assignment IDs, boundaries, atoms/docs assigned and completed, failures, and proposals. Subagents propose owner routing, PlanUnits, consumer refs, conflicts, and fidelity findings only. Main agent is sole writer. A single broad-agent fallback is forbidden; if parallel execution is unavailable, stop with a typed capability blocker.

Rules:
- Canonical terms: PRD Builder and Planning Wizard.
- Semantically migrate valid chain-wizard content; do not blind-replace names or preserve stale flow.
- Preserve exact tokens, key/enum shapes, examples, negative constraints, stale/compat dispositions, owner/consumer impacts, source refs, GUI requirements, acceptance, and user corrections.
- Every PlanUnit includes gui_related true/false.
- New Plans docs use the New Plan Authoring Profile; all new/updated feature content is fine-grained PlanUnits.
- Never use source_preserving_planunit for new feature content.
- Trace every claim to ledger evidence, current canon, explicit policy, or a marked assumption.
- Introduce no stub, TODO, TBD, placeholder, empty required section, fake acceptance criterion, or deferred implementation detail.
- Create no WorkNodes, NodeSeeds/candidates, WorkNodeRequests, WorkGraphs, queues, GoalRuns, implementation files, or production tasks.
- Do not update Spec_Lock, shards, evidence, plan_graph, or auto_decisions.

Tasks:
1. Validate ledger health and compact-state consistency.
2. Audit current owner docs and stale/conflicting legacy material.
3. Adjudicate owners autonomously; do not ask row-by-row.
4. For each atom choose create_new_planunit, update_existing_planunit, compile_to_existing_planunit, create_new_owner_doc, consumer_reference_only, explicitly_deferred, duplicate, obsolete, or non_applicable.
5. Write live Plans and required consumer refs.
6. Mark compiled_to_plan only after live canonical evidence exists; record PlanUnit IDs and outputs.
7. Reconcile manifest/current/handoff/open_items/compile_queue/operating_capsule/ledger_health/registry.
8. Regenerate allowed Plans/.plan_index outputs only after Plans stabilize.
9. Run:
   python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
   python3 scripts/pm-plan-index.py validate
   python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits, if present
   git diff --check, if available
10. Report changed files, PlanUnits, atom dispositions, owner adjudications, parallel evidence, validators, node-readiness status, and governance status.

If Plans or .plan_index changed, report governance_status=pending_seal. Do not seal governance here.
