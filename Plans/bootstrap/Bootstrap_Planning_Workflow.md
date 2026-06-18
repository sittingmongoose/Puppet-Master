# Bootstrap Planning Workflow

This workflow tells Codex how to use the PM Bootstrap Planning Ledger before native Puppet Master Chain Wizard and Goal Mode exist.

## Two operating modes

1. **Conversational ledger mode** — normal chat while Jared specs a feature. Codex updates the ledger after every substantive turn. Goal Mode is optional and usually unnecessary here.
2. **Autonomous goal mode** — Codex Goal Mode for artifact transformations: ledger-to-Plans compilation, Plan doc standardization, PlanUnit indexing, node-readiness reporting, validation, and governance sealing.

## Commands

Supported user phrases:

```text
Use the PM Bootstrap Planning Ledger for this feature.
Start a PM ledger for <feature>.
Continue ledger <ledger_id>.
Compile ledger <ledger_id> to Plans.
Convert Plans to the standard format.
Generate PlanUnit index.
Generate node-readiness report.
Seal governance.
```

Do not treat “Generate node-readiness report” as permission to create WorkNodes.

## Ledger IDs

Use:

```text
pldg-YYYYMMDD-NNN-<slug>
```

Register each ledger in:

```text
Plans/ledgers/v2/ledger_registry.json
```

Each ledger directory must include manifest, events, records, state, validation, indexes, and source_shards directories.

## Default resume surface

At turn start, read only:

```text
Plans/ledgers/v2/ledger_registry.json
Plans/ledgers/v2/<ledger_id>/state/handoff.json
Plans/ledgers/v2/<ledger_id>/state/current.json
Plans/ledgers/v2/<ledger_id>/state/open_items.json
Plans/ledgers/v2/<ledger_id>/state/operating_capsule.json
```

Read full `events.jsonl`, `source_shards/**`, or legacy `working_ledger.md` only when a compact state file points to a specific source_ref that must be inspected.

## Per-turn write protocol

After every substantive conversational turn:

1. Append one event to `events.jsonl`.
2. Upsert affected design atoms, decisions, questions, blockers, and corrections.
3. Preserve exact tokens, examples, negative constraints, compatibility-only notes, stale/retired notes, owner hints, and user corrections.
4. Infer and set `gui_related: true|false` for every new or updated design atom.
5. Update `state/current.json`, `state/handoff.json`, `state/open_items.json`, and `state/compile_queue.json`.
6. Do not write canonical Plans unless Jared explicitly asks to compile.

## GUI classification rule

Agents classify GUI-related work automatically. The user does not need to know or say what is GUI.

Set `gui_related=true` for GUI, UI, screens, pages, panels, forms, layout, styling, visual components, icons, SVGs, images, screenshots, or user-visible visual presentation. Otherwise set `false`.

If an item mixes GUI and non-GUI work, split it when safe. If not safe, mark `gui_related=true` and preserve a split recommendation in notes.

## Compile ledger to Plans

When Jared asks to compile:

1. Validate ledger health.
2. Refuse false completion if open blockers, unresolved high-level questions, unclassified candidates, or contradictions remain.
3. Convert accepted design atoms into PlanUnits in live non-pipeline `Plans/**` docs.
4. Every PlanUnit must include `gui_related: true|false`.
5. Preserve source refs and exact details.
6. Do not update `Plans/Spec_Lock.json`, shards, evidence bundles, or plan graph.

## Standardize existing Plans

Lossless conversion requires:
- original file hashes;
- heading/body span inventory;
- coverage map for every original span;
- ContractRef preservation;
- anchor or alias preservation;
- explicit disposition for deferred/retired/non-applicable material;
- pilot conversion before broad batches;
- validators after each batch.

## PlanUnit index and node-readiness

The index phase may write generated files under `Plans/.plan_index/`:

```text
plan_units.jsonl
doc_cards.json
dependencies.json
acceptance_units.jsonl
coverage_report.json
node_readiness_report.json
```

The node-readiness report may classify future readiness and blockers, including `gui_related` routing inheritance. It must not create WorkNodes or executable build tasks.

## Semantic audit closure registry

This workflow section consumes `PLS-012` and `PDS-014`; those owner PlanUnits define the durable registry, deterministic finding keys, repair closure matrix, and validator behavior.

Deep semantic audits and bounded repairs use:

```text
Plans/.audits/_semantic_closure_registry.jsonl
```

Each row is keyed by a deterministic `finding_key` derived from `finding_family`, `ledger_id`, `source_atom_ids`, `plan_unit_ids`, `owner_docs`, `detail_keys`, and `exact_tokens`. The registry row preserves `closure_id`, `finding_key`, `finding_family`, `ledger_id`, `audit_ids`, `source_atom_ids`, `plan_unit_ids`, `owner_docs`, `consumer_docs`, `detail_keys`, `exact_tokens`, `closure_status`, `closure_evidence`, `closure_reason`, `hashes`, `created_at`, `updated_at`, `closed_by_audit_id`, and `reopen_conditions`.

Allowed closure statuses are:

```text
repaired
false_positive
explicitly_deferred
source_lineage_only
not_for_plan
stale_retired
blocked_requires_user_decision
reopened
```

Deep audits read the registry before writing new risks. If a finding is already closed and the source atom, PlanUnit, owner evidence, and closure evidence hashes are unchanged, the audit records `previously_closed` and does not emit the item as a new semantic warning. A closed finding reopens only when one of those hashes changes, or when the current closure status is `blocked_requires_user_decision` or `reopened`.

Bounded repairs must write `repair_closure_matrix.jsonl`; every audit finding/detail in scope is closed as `repaired`, `false_positive`, `explicitly_deferred`, `source_lineage_only`, `not_for_plan`, `stale_retired`, or `blocked_requires_user_decision`. Repairs append or update the global registry and run:

```text
python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

## Governance seal

Run only after docs and generated indexes are stable. Then regenerate governance artifacts, refresh Spec Lock, run plan/shard validators, and certify changed files/blockers/risks.

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Ledger-to-Plans compile phases that exceed atom, owner-doc, or document-size thresholds must use bounded read-only subagents with assignment/result evidence. The parent/controller remains the only canonical writer. The compile phase writes live Plans docs and allowed `Plans/.plan_index/**` outputs only; it does not run the finished-product `Approve And Build` runtime, launch Plan Compile, create WorkNodes, create NodeSeeds, create executable queues, launch GoalRuns, edit implementation files, or update Spec Lock, shards, evidence, plan_graph, or auto_decisions.
