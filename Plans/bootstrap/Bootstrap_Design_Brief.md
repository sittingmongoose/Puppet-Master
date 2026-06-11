# Bootstrap Design Brief — Ledger, Plan Docs, and Node Readiness

This brief is the source seed for Codex so it does not rediscover the design from scratch.

## Accepted scope

Build a linked bootstrap/native system:

```text
conversation / Chain Wizard design discussion
  -> structured bootstrap planning ledger
  -> standardized canonical Plans docs
  -> PlanUnit index
  -> node-readiness report
  -> future NodeSeed / WorkNode compiler
  -> future native Goal Mode execution
```

The current package must not create WorkNodes. WorkNodes are future executable build tasks and require complete Plans plus a defined compiler contract.

## Bootstrap vs native

Bootstrap now:
- file-backed JSONL/JSON under `Plans/ledgers/v2/`;
- used by Jared and Codex before native Chain Wizard exists;
- Codex can use normal chat for ledger-building conversations;
- Codex Goal Mode is used for artifact transformations: ledger-to-Plans, Plan conversion, indexing, audits, and governance seal.

Native later:
- a Puppet Master service/API-backed ledger and Goal state system;
- Chain Wizard uses it invisibly for planning/transfer/audit;
- Assistant chat can expose Goal Mode visibly for arbitrary long-running tasks;
- native storage may be DB-backed but must import/export the bootstrap record concepts.

## Ledger architecture

Use machine-first records, not Markdown journals:

```text
manifest.json
events.jsonl
records/design_atoms.jsonl
records/decisions.jsonl
records/questions.jsonl
records/blockers.jsonl
records/corrections.jsonl
state/current.json
state/handoff.json
state/open_items.json
state/compile_queue.json
state/operating_capsule.json
validation/ledger_health.json
source_shards/**
```

Events preserve what happened. Design atoms preserve durable planning state. State projections are the only default resume surface. Source shards are cold exact-source recovery/audit material, not the normal operating view.

## Plan Document System

The repo already has governance-standardized Plans, but not a uniform layout. Add a canonical Plan Document System that supports:
- stable PlanUnits;
- base required sections plus doc-type modules;
- ContractRef/owner/consumer discipline;
- lossless migration from current Plans docs;
- exact-token and negative-constraint preservation;
- generated PlanUnit indexes;
- future node-readiness.

Do not force every existing Plan doc into one rigid skeleton in a single unsafe rewrite.

## PlanUnits

PlanUnits are canonical addressable units. Every accepted requirement, constraint, decision, validation rule, deferred item, compatibility-only note, or node-relevant implementation hint should map to a PlanUnit or an explicit disposition.

Required PlanUnit concepts:
- `plan_unit_id`
- `unit_type`
- `status`
- `owner_doc`
- `canonical_text`
- `gui_related: true|false`
- `depends_on`
- `unblocks`
- `acceptance_criteria`
- `validation_surfaces`
- `risk_class`
- `reasoning_tier`
- `context_scope`
- `implementation_surfaces`
- `node_compile_hint`
- `source_lineage`

## GUI-related routing

Agents infer GUI classification. The user does not need to identify GUI/UI/icon/image work.

Use only:

```json
"gui_related": true | false
```

Mark `true` when the item involves GUI, UI, screens, pages, panels, forms, layout, styling, visual components, icons, SVGs, images, screenshots, or user-visible visual presentation. Mark backend/router/governance/docs/test logic as `false`, even if it references GUI routing but is not itself GUI implementation work.

Native Puppet Master should expose a simple setting equivalent to “use different model for GUI elements?” Future WorkNodes inherit `gui_related`; if enabled, GUI-related work routes to the configured GUI-capable model/CLI. Do not expose a granular GUI/UI/icon/image routing taxonomy in the product UI.

## Node-readiness boundary

The current safe output is:

```text
Plans/.plan_index/plan_units.jsonl
Plans/.plan_index/doc_cards.json
Plans/.plan_index/dependencies.json
Plans/.plan_index/acceptance_units.jsonl
Plans/.plan_index/coverage_report.json
Plans/.plan_index/node_readiness_report.json
```

Do not create:
- final WorkNodes;
- executable build tasks;
- NodeSeed candidates unless `Plans/Plan_To_Node_Compilation.md` explicitly defines the candidate contract.

## Governance seal

Spec Lock and governance artifacts are updated only after canonical docs and generated indexes stop changing. The seal phase may regenerate shards, evidence, plan graph artifacts, decision logs, and `Plans/Spec_Lock.json`, then run full gates.
