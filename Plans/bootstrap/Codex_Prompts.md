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

## 3. Goal prompt — compile one ledger to new Plans docs

```text
/goal
Compile PM ledger <ledger_id> to canonical Plans docs.

Read AGENTS.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Bootstrap_Design_Brief.md, and the compact state for <ledger_id>. Use the $pm-bootstrap-planning-ledger skill if available.

Create/update only as needed:
- Plans/Planning_Ledger_System.md
- Plans/Plan_Document_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Bootstrap_Planning_Migration.md
- Plans/00-plans-index.md

Rules:
- Ledger is source/planning memory, not canon.
- Convert accepted design atoms into stable PlanUnits.
- Every PlanUnit must include gui_related true/false, inferred from content.
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
- If the compiler contract is incomplete, set status = blocked_compiler_contract_incomplete.
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
