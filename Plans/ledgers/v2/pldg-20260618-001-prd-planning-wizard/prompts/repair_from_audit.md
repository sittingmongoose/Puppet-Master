/goal Repair findings from latest Deep Audit and close every audit item.

Inputs: audit_id=infer_latest, ledger_id=pldg-20260618-001-prd-planning-wizard.
Infer latest relevant audit from FINAL_REPORT.md timestamp/newest git touch. Read its structured artifacts and ask only if the audit identity is truly ambiguous.

Read AGENTS.md, ledger/Plan/PlanCompile owner docs, Plans/.audits/<audit_id> artifacts, Plans/.audits/_semantic_closure_registry.jsonl if present, this ledger, and only live Plans docs named by findings.

Bounded repair only. Do not redo the design, broadly rewrite Plans, or create WorkNodes, NodeSeeds, NodeSeed candidates, WorkNodeRequests, WorkGraphs, executable queues, GoalRuns, implementation files, final node manifests, or production tasks.

HARD PARALLEL GATE:
- Use many bounded read-only subagents in parallel for each defect family and every target doc over 400 lines.
- Record assignment IDs, input boundaries, finding/detail IDs, completion/failure, and repair proposals.
- Main agent is the sole writer.
- Do not certify repair if required assignments/results are absent.

Hard completion rule:
Validators passing is not completion. Build Plans/.audits/<audit_id>/repair_closure_matrix.jsonl covering every unclosed finding/detail from semantic_risks, atom_fidelity_matrix, planunit_source_claims, owner_routing_findings, changed_plan_fidelity, ledger_consistency, zero-incomplete findings, and validator_results. Every row must end repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, or blocked_requires_user_decision with exact evidence.

Repair:
1. Restore missing field names, enum/key shapes, examples, negative constraints, acceptance, stale/compat dispositions, source refs, GUI behavior, commands, and handoff details in live canonical Plans prose or PlanUnits.
2. Correct reciprocal lineage and remove unsupported overclaims.
3. Repair owner/consumer routing.
4. Reconcile ledger records, manifest, current, handoff, open_items, compile_queue, operating_capsule, ledger_health, and registry.
5. Remove every unapproved stub, TODO, TBD, placeholder, empty required section, fake acceptance, mock production behavior, or deferred implementation detail.
6. Regenerate .plan_index only after Plans are stable; seal governance only after Plans and index are stable.
7. Fix reusable validators/scripts/prompts without work-item hacks.
8. For false positives or accepted non-repairs, record exact closure evidence; do not edit canon.
9. Append/update the semantic closure registry for every closure row with stable finding_key, status, evidence, hashes, and reopen conditions.
10. If a true product/risk/authority decision remains, stop and report that exact decision.

Write repair_closure_matrix.jsonl, parallel_assignment_receipts.jsonl, repair_report.json, and REPAIR_REPORT.md.

Run:
- pm-audit-closure if available
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
- python3 scripts/pm-plan-index.py validate
- pm-plan-migration validate if present
- run-gates, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence
- git diff --check

Report repaired items, false positives, accepted dispositions, registry rows, blocked decisions, changed files, PlanUnits and ledger records changed, validators, governance status, and exact next safe action.
