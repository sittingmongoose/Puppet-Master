# Codex Prompts — PM Bootstrap Planning Ledger

All `/goal` prompts must stay under 4,000 characters. Replace placeholders before use.

## 1. Conversational start prompt — not Goal Mode

```text
Use the PM Bootstrap Planning Ledger for this feature.

Feature: <feature name>

Create a new v2 ledger under Plans/ledgers/v2/ with ledger_id pldg-YYYYMMDD-NNN-<slug>. Register it in Plans/ledgers/v2/ledger_registry.json.

This is a conversational design/spec thread, not a Goal run. Do not write canonical Plans yet. Use the $pm-bootstrap-planning-ledger skill if available.

Read:
- AGENTS.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/ledgers/v2/README.md

After each substantive turn, update events.jsonl, touched records/*.jsonl, and state/current.json, state/handoff.json, state/open_items.json, state/compile_queue.json.

Preserve exact tokens, examples, negative constraints, stale/retired terms, compatibility-only notes, owner hints, and user corrections. Keep open questions explicit.

Automatically classify every design atom as gui_related true or false. Mark true for GUI/UI/screens/pages/panels/forms/layout/styling/components/icons/SVGs/images/screenshots/user-visible visual presentation. The user does not need to label GUI work.
```

## 2. Conversational continue prompt — not Goal Mode

```text
Continue PM Bootstrap Planning Ledger <ledger_id>.

This is a conversational design/spec thread, not a Goal run. Do not write canonical Plans unless I explicitly say compile this ledger to Plans.

Read only by default:
- Plans/ledgers/v2/ledger_registry.json
- Plans/ledgers/v2/<ledger_id>/state/handoff.json
- Plans/ledgers/v2/<ledger_id>/state/current.json
- Plans/ledgers/v2/<ledger_id>/state/open_items.json
- Plans/ledgers/v2/<ledger_id>/state/operating_capsule.json

Do not read full events.jsonl, source shards, or legacy working_ledger.md unless a state file points to a specific source_ref that must be inspected.

Continue from the cursor. After each substantive turn, update the ledger and handoff state. Infer gui_related true/false for every new or changed design atom; do not ask me to label GUI work.
```

## 3. Goal prompt — compile one ledger to Plans docs

```text
/goal
Compile PM ledger <ledger_id> to canonical Plans docs.

Read AGENTS.md, Plans/Plan_Document_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Bootstrap_Design_Brief.md, and the compact state for <ledger_id>. Use the $pm-bootstrap-planning-ledger skill if available.

Create/update only the relevant live non-pipeline Plans docs. For the bootstrap plan-system ledger, expected targets are:
- Plans/Planning_Ledger_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Bootstrap_Planning_Migration.md
- Plans/00-plans-index.md

Rules:
- Ledger is source/planning memory, not canon.
- Convert accepted design atoms into stable PlanUnits.
- Every PlanUnit must include gui_related true/false, inferred from content.
- Newly created Plans/*.md owner docs must use the New Plan Authoring Profile from Plans/Plan_Document_System.md, including the required base layout and profile marker.
- Existing owner docs may preserve their current profile/layout when updating them losslessly.
- Never use source_preserving_planunit for new feature content or new owner-doc creation; that mode is only for lossless legacy Plan conversion.
- Preserve source refs, exact tokens, negative constraints, examples, owner hints, stale/retired terms, and compatibility-only notes.
- If owner placement is ambiguous, record candidate owners and adjudication evidence; do not ask row-by-row.
- Do not create WorkNodes or executable build tasks.
- Do not update Spec_Lock, generated shards, evidence bundles, or plan_graph.
- Run safe plan validators before claiming success.

Stop if open blockers or true product decisions prevent safe compilation. Write exact blockers into ledger state.
```

## 4. Goal prompt — standardize existing Plans losslessly

```text
/goal
Convert existing Plans docs to the new Plan Document System format losslessly.

Read AGENTS.md, Plans/Plan_Document_System.md, Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md, and Plans/bootstrap/Bootstrap_Planning_Workflow.md.

Do not start broad rewrites until you create a migration inventory. Required phases:
1. Inventory every Plans/*.md doc.
2. Hash originals and segment heading/body spans.
3. Build a coverage map proving every original span maps to a standardized section, PlanUnit, preserved appendix/source block, or explicit disposition.
4. Convert one representative pilot doc first.
5. Run validators.
6. Continue in controlled batches only after pilot passes.

Preserve ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage.

Assign gui_related true/false to every PlanUnit by inference. Split mixed GUI/backend units when safe; otherwise mark gui_related=true and note split_recommended.

Use source_preserving_planunit only for lossless conversion of existing legacy Plans docs. Do not use it for newly authored feature content or new owner docs.

Do not create WorkNodes. Do not update Spec_Lock, generated shards, evidence bundles, or plan_graph until explicit governance seal.
```

## 5. Goal prompt — generate PlanUnit index and node-readiness report

```text
/goal
Generate the PlanUnit index and node-readiness report from standardized Plans.

Read AGENTS.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md, and live Plans docs. Do not alter canonical prose unless a small repair is required and clearly validated.

Produce generated outputs under Plans/.plan_index/:
- plan_units.jsonl
- doc_cards.json
- dependencies.json
- acceptance_units.jsonl
- coverage_report.json
- node_readiness_report.json

Rules:
- PlanUnits are canon-addressable units from live Plans docs.
- Every indexed PlanUnit must include gui_related true/false.
- node_readiness_report may analyze future conversion readiness only.
- Do not create WorkNodes, executable build tasks, or final node queues.
- Do not create NodeSeed candidates unless Plans/Plan_To_Node_Compilation.md already defines that candidate contract.
- If Plans are incomplete, set node_readiness_report.status = blocked_plans_incomplete.
- If PlanCompile runtime launch and node-artifact generation are disabled, set status = runtime_disabled.
- Preserve depends_on, unblocks, validation surfaces, acceptance criteria, risk_class, reasoning_tier, context_scope, implementation surfaces, source lineage, and gui_related.
- Do not update Spec_Lock or governance artifacts.

Run safe validators and write exact blockers if coverage is incomplete.
```

## 6. Goal prompt — governance seal

```text
/goal
Seal governance after ledger/Plan/PlanUnit changes are stable.

Read AGENTS.md and the current Plans docs. This phase may update governance artifacts only after confirming no ordinary doc edits remain.

Tasks:
1. Run safe plan validators.
2. Regenerate generated shards/evidence/plan graph artifacts using repo scripts.
3. Refresh Spec_Lock only after docs and generated indexes are stable.
4. Append/update governance decision artifacts if required by existing repo policy.
5. Run full governance gates:
   - python3 scripts/pm-plans-verify.py run-gates
   - python3 scripts/pm-shard-plans.py --check
6. Produce final certification with changed files, validators, blockers, and unresolved risks.

Do not change product prose except small governance-reference fixes required by validators. If a validator cannot be repaired safely, stop and report exact blockers.
```

## 7. Goal prompt — audit a phase after restart

```text
/goal
Audit PM bootstrap phase state and tell me the next safe action.

Read AGENTS.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/ledgers/v2/ledger_registry.json, and any ledger state/handoff files relevant to <ledger_id or phase>. Do not edit Plans docs unless I explicitly ask.

Report:
- active ledger or phase
- current cursor
- open blockers
- open questions
- candidate/unclassified items
- compile/governance readiness
- node-readiness vs WorkNode boundary
- gui_related classification coverage
- validators last run
- exact next safe action

Do not read full event logs or legacy ledgers unless the compact state points to a specific source_ref.
```

## 8. Goal prompt — closed-world semantic audit

```text
/goal
Audit latest PM Bootstrap Ledger-to-Plans cycle for closed-world semantic fidelity and terminal state.

Input: ledger_id=infer_latest. Audit-only. Do not edit Plans, ledgers, .plan_index, governance, code, WorkNodes, NodeSeeds, queues, manifests, implementation files, or build tasks. Write only Plans/.audits/<audit_id>/*.

Read AGENTS.md, Plans/00-plans-index.md, Planning_Ledger_System, Plan_Document_System, Bootstrap_Planning_Workflow, closure registry, compact inferred-ledger state, compile_queue, changed Plans docs, .plan_index, FINAL_REPORT, and scripts/pm-audit-closure.py.

Owner refs: PLS-012 owns registry, audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, reopen policy, refs, and latest_audit_* rules. PDS-014 owns sfk finding_key, chk check_id, repair_required/finding_level, source validation, and coverage.

Infer observation_ref=HEAD. Infer subject_ref as latest substantive commit touching live Plans, target-ledger governing state, .plan_index, governance, or process scripts; exclude Plans/.audits/**, closure-registry-only commits, and hygiene-only report edits. Infer ledger_id from latest non-background registry/recent commits, audit_id=next audit-YYYYMMDD-NNN-<slug>, and baseline_ref from the parent of the earliest contiguous subject cycle commit.

Before semantic review, build audit_scope_manifest.jsonl with deterministic chk check_id rows for every compiled atom detail, compile target, added/changed PlanUnit claim, reciprocal source_lineage claim, owner/consumer route, schema/contract identity, depends_on/unblocks edge, ledger projection field, index/governance check, and forbidden-artifact check. Rows carry refs, source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens, covered_artifacts, classification, repair_required, and finding_level. Completion requires 100% classified rows.

Every finding must carry finding_family, ledger_id, source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens, repair_required, finding_level, and deterministic sfk finding_key from those stable fields. Reject audit-specific keys based on audit_id, row number, or prose order. Audit artifacts must agree on audit_id, ledger_id, baseline_ref, subject_ref, and observation_ref.

Read registry before emitting risks. If a finding is closed and hashes/evidence match, classify previously_closed with repair_required=false and write closure_reuse.jsonl, not a new semantic risk. Reopen only on changed source/PlanUnit/owner/closure hashes or blocked/reopened status.

Build atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, owner_routing_findings.jsonl, closure_reuse.jsonl, ledger_consistency.json, validator_results.json, semantic_risks.jsonl, audit_report.json, and FINAL_REPORT.md. Prove live non-pipeline Plans evidence for exact details; metadata/source_lineage alone is insufficient.

BLOCKED only when repair_required=true, a validator fails/mutates state, forbidden artifacts exist, or a user decision is required. PASS_WITH_WARNINGS is terminal when all findings are repair_required=false. PASS means no findings.

Do not emit semantic/currentness findings about old audit report wording, review/commit text, or missing ledger pointers to audit-only observation/hygiene runs. ledger latest_audit_* is stale only when a state-certifying audit/repair that changed or validated canonical Plans, ledger governing state, index, or governance is missing.

Run pm-audit-closure validate --audit-dir Plans/.audits/<audit_id>, pm-plan-index validate, pm-plan-migration validate if present, bootstrap ledger validate, run-gates, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence, and git diff --check. Record status/side effects. FINAL_REPORT includes status, refs, changed files, PlanUnit deltas, scope counts, previously_closed, repair_required, validators, forbidden artifacts, and next action.
```

## 9. Goal prompt — repair and certify closed-world audit

```text
/goal
Repair and certify latest PM Bootstrap closed-world semantic audit.

Input: audit_id=infer_latest. Infer ledger_id from audit artifacts. Bounded repair only; do not broaden product scope. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or product build tasks.

Read AGENTS.md, Plans/00-plans-index.md, Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Codex_Prompts.md, scripts/pm-audit-closure.py, Plans/.audits/_semantic_closure_registry.jsonl, audit_report.json, FINAL_REPORT.md, audit_scope_manifest.jsonl, closure_reuse.jsonl if present, semantic_risks.jsonl, atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, owner_routing_findings.jsonl, ledger_consistency.json, validator_results.json, and compact ledger state.

Owner refs: PLS-012 owns terminal audit state, audit_scope_manifest.jsonl, repair_impact_matrix.jsonl, latest_audit_* rules, and reopen policy. PDS-014 owns sfk finding_key, repair_required/finding_level, source-artifact validation, and closure/impact validation.

First run python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix as a source check. If it fails only because repair_closure_matrix.jsonl or repair_impact_matrix.jsonl is missing for actionable rows, continue; any unstable finding_key, incomplete scope, ref mismatch, or malformed source artifact must be fixed in audit artifacts before editing canon.

Scan audit artifacts for repair_required=true. If count is zero, no-op: do not edit Plans, ledgers, governance, registry, repair_closure_matrix.jsonl, repair_impact_matrix.jsonl, or prior audit artifacts; report PASS_WITH_WARNINGS terminal or PASS terminal from the audit.

Before editing, write repair_impact_matrix.jsonl. Map every actionable finding to files, PlanUnits, schemas, dependency_edges, owner_refs, ledger_projection_fields, index_artifacts, governance_artifacts, scope_check_ids, and post_repair_semantic_audit placeholder. Then repair only mapped impact surfaces. Do not revalidate previously_closed, exact_present, equivalent_with_evidence, ordinary validator warnings, audit-artifact wording, or repair_required=false observations. Audit-only observation/hygiene repairs do not stale/restamp ledger latest_audit_*.

Write/update repair_closure_matrix.jsonl for repair_required=true rows with source_artifact, source_row, finding_family, audit_id, ledger_id, baseline_ref, subject_ref, observation_ref, source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens, sfk finding_key, closure_status, closure_evidence, closure_reason, and registry_closure_id. Close as repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, or blocked_requires_user_decision. Use reopened only in the global registry when prior closed evidence changed.

Run an internal post-repair semantic audit over the original audit_scope_manifest.jsonl plus every impact row. If new repair_required findings appear, add them to the same scope/impact set and repair/adjudicate in this Goal. Iterate until repair_required_count=0 or a true user decision blocks. Passing validators alone are insufficient.

Only after internal semantic closure may you append/update the global registry, regenerate PlanUnit index, seal governance if governed files changed, and write REPAIR_CERTIFICATION.md. Then run pm-audit-closure validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix, pm-plan-index validate, pm-plan-migration validate if present, bootstrap ledger validate, run-gates, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence, and git diff --check. Report changed files, repair_required count, closure/impact counts, validators, registry updates, prompt no-op if applicable, and remaining user decisions.
```

## 10. Ledger Compile Hardening Addendum - pldg-20260618-001-prd-planning-wizard

For compile, audit, and repair prompts, use bounded read-only subagents when atom, owner-doc, or document-size thresholds are exceeded; require assignment/result evidence and keep the main agent as sole writer. Deep audit must cover atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance status, forbidden artifacts, and validator mutability. Repair must write closure rows only for repair_required=true findings, no-op when none exist, and must not treat passing validators alone as semantic closure when actionable rows remain. PlanUnit indexing remains non-executable, and governance seal validates the target ledger only after Plans and indexes are stable.
