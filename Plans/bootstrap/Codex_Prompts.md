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

## 8. Goal prompt — deep semantic audit with closure registry

```text
/goal
Deep-audit latest PM Bootstrap Ledger-to-Plans cycle for exact semantic fidelity.

Input: ledger_id=infer_latest. Audit-only. Do not repair/edit Plans, ledgers, .plan_index, governance, code, WorkNodes, NodeSeeds, queues, manifests, implementation files, or product build tasks. Write only Plans/.audits/<audit_id>/*.

Read AGENTS.md, Plans/00-plans-index.md, Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Codex_Prompts.md, Plans/.audits/_semantic_closure_registry.jsonl, compact state for the inferred ledger, compile_queue, changed live Plans docs, .plan_index, and latest related audit FINAL_REPORT.

Owner refs: PLS-012 owns the semantic closure registry and reopen policy; PDS-014 owns deterministic finding_key and repair_closure_matrix validation.

Infer current_ref=HEAD, latest non-background ledger from registry/recent commits, audit_id=next audit-YYYYMMDD-NNN-<slug>, and baseline_ref from the earliest contiguous cycle commit touching the ledger/live Plans/index/governance surfaces.

For every finding, compute finding_key from finding_family + ledger_id + source_atom_ids + plan_unit_ids + owner_docs + detail_keys + exact_tokens. Read the closure registry before emitting risks. If a finding is closed and source atom, PlanUnit, owner evidence, and closure evidence hashes are unchanged, classify previously_closed and do not emit it as a new semantic_risk. Reopen only when one of those hashes changed, or closure_status is blocked_requires_user_decision or reopened.

Build atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, owner_routing_findings.jsonl, closure_reuse.jsonl, ledger_consistency.json, validator_results.json, semantic_risks.jsonl, audit_report.json, and FINAL_REPORT.md. Prove canonical live Plans evidence for every exact token/detail; metadata/source_lineage alone is insufficient.

Run pm-audit-closure validate, pm-plan-index validate, pm-plan-migration validate if present, bootstrap ledger validate, run-gates, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence, and git diff --check. Record validator git status and side effects. FINAL_REPORT must include status, ids/range, changed files, PlanUnit deltas, previously_closed count, new/reopened risks, validators, forbidden artifacts, and next safe action.
```

## 9. Goal prompt — bounded semantic repair with closure registry

```text
/goal
Repair latest PM Bootstrap deep semantic audit with closure registry support.

Input: audit_id=infer_latest. Infer ledger_id from audit artifacts. Bounded repair only; do not redo the audit or broaden scope. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or product build tasks.

Read AGENTS.md, Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Codex_Prompts.md, Plans/.audits/_semantic_closure_registry.jsonl, the audit FINAL_REPORT, closure_reuse.jsonl if present, semantic_risks.jsonl, atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, owner_routing_findings.jsonl, ledger_consistency.json, validator_results.json, and compact ledger state.

Owner refs: PLS-012 owns the semantic closure registry and reopen policy; PDS-014 owns deterministic finding_key and repair_closure_matrix validation.

For every audit finding/detail in scope, write Plans/.audits/<audit_id>/repair_closure_matrix.jsonl. Each row must include source_artifact, source_row, finding_family, ledger_id, source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens, finding_key, closure_status, closure_evidence, closure_reason, and registry_closure_id, then close the item as repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, or blocked_requires_user_decision. Use reopened only in the global registry when a previously closed finding changed and the prior closed row plus source atom, PlanUnit, owner evidence, or closure evidence hash delta is proven. Green validators are insufficient without a closure row for every finding/detail.

Append/update Plans/.audits/_semantic_closure_registry.jsonl with closure_id, finding_key, finding_family, ledger_id, audit_ids, source_atom_ids, plan_unit_ids, owner_docs, consumer_docs, detail_keys, exact_tokens, closure_status, closure_evidence, closure_reason, hashes, created_at, updated_at, closed_by_audit_id, and reopen_conditions. finding_key is deterministic from finding_family + ledger_id + source_atom_ids + plan_unit_ids + owner_docs + detail_keys + exact_tokens.

Run python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix plus pm-plan-index validate, pm-plan-migration validate if present, bootstrap ledger validate, run-gates, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence, and git diff --check. If Plans docs or governed artifacts changed, perform governance seal after docs/indexes/evidence stabilize. Report changed files, closure counts, validators, registry updates, and remaining blocked user decisions.
```
