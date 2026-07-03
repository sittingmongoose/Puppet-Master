# Planning Ledger System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns the planning ledger system boundary; it does not make ledger records canonical product prose.

## 0. Scope

This document is the canonical owner for the Bootstrap Planning Ledger, the Native Ledger Service runtime contract, compact operating surfaces, per-turn ledger protocol, ledger source-lineage preservation, and ledger-to-Plan compilation boundary.

The ledger exists to preserve planning/source memory during long feature-spec conversations. Canonical product/build truth remains in live non-pipeline `Plans/**` docs after compilation.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## 1. Architecture Summary

The planning system has two incarnations:

1. Bootstrap Ledger: file-backed JSONL/JSON under `Plans/ledgers/v2/`.
2. Native Ledger Service: the finished-product Puppet Master runtime contract for service/API or storage-backed ledger persistence, with implementation required to conform to PLS-015.

Both incarnations use `design_atom` records during conversation and compile accepted atoms into PlanUnits only when the user asks to compile.

The active bootstrap ledger format is machine-first: append-only JSONL event and record streams plus compact JSON projections. Markdown may exist as a debug export only and does not replace active JSONL/JSON state.

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

## 2. PlanUnits

### PLS-001 - Ledger Authority Boundary

```yaml
plan_unit_id: PLS-001
unit_type: constraint
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The Bootstrap Planning Ledger is durable planning/source state for feature-spec conversations. It is not assistant memory, not Plan Mode, and not canonical Plans prose. Canonical product/build truth remains live non-pipeline Plans docs after compilation.
gui_related: false
gui_classification_reason: Ledger authority and source/canon boundaries are backend/governance behavior, not GUI or visual presentation.
depends_on: []
unblocks: [PLS-002, PLS-005, BPM-001]
acceptance_criteria:
  - Ledger records can be cited as source_lineage without being treated as canonical product prose.
  - Compiled PlanUnits point canonical evidence at live Plans docs, not ledgers or source shards.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Ledger health reports for open blockers and unresolved contradictions.
risk_class: governance_boundary
reasoning_tier: standard
context_scope: repo
implementation_surfaces: [Plans/ledgers/v2, Plans/bootstrap, Plans/*.md]
node_compile_hint: {mode: index_only, create_worknodes: false}
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0002
  - pldg-20260610-001-ledger-plan-system:atom-0001
  - pldg-20260610-001-ledger-plan-system:atom-0016
  - pldg-20260610-001-ledger-plan-system:atom-0009
  - pldg-20260610-001-ledger-plan-system:dec-0001
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["assistant memory", "Plan Mode", "Plans/**", "source_evidence", "canonical_evidence", "process_evidence", "governance_evidence", "live non-pipeline Plans docs"]
negative_constraints:
  - Do not confuse the ledger with the actual chat memory system.
  - Do not treat the ledger as canonical product prose.
  - Do not point canonical evidence at ledgers, shards, pipeline/process artifacts, or governance bundles.
owner_hints: [Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### PLS-002 - Bootstrap And Native Incarnations

```yaml
plan_unit_id: PLS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The Bootstrap Ledger and the Native Ledger Service are two incarnations of one planning-ledger standard. Bootstrap uses repo files now; the finished-product native service/API or storage-backed implementation conforms to the strict PLS-015 runtime contract and preserves import/export compatibility for append logs, records, projections, source-lineage, exact-token fields, and currentness receipts.
gui_related: false
gui_classification_reason: Storage/service architecture is not GUI implementation work.
depends_on: [PLS-001]
unblocks: [PLS-003, PLS-004, BPM-001]
acceptance_criteria:
  - Bootstrap records can be imported into the native service without losing record identity, source refs, decisions, questions, blockers, corrections, or gui_related classification.
  - Native export can reconstruct the bootstrap concepts needed for audit or migration.
  - PLS-015 defines the current Native Ledger Service API, atomic turn-write, CAS, idempotency, recovery, compaction, import/export, and ledger_sync_blocked clearance contract.
validation_surfaces:
  - Ledger schema validation.
  - Native Ledger Service runtime contract validation.
risk_class: migration_compatibility
reasoning_tier: standard
context_scope: repo_to_native
implementation_surfaces: [Plans/ledgers/v2, Plans/Planning_Ledger_System.md, Plans/prd_planning_runtime_contracts.json]
node_compile_hint: {mode: native_ledger_contract, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0002
  - pldg-20260610-001-ledger-plan-system:atom-0012
  - pldg-20260610-001-ledger-plan-system:dec-0001
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Bootstrap Ledger", "Native Ledger Service", "import/export", "pldg-YYYYMMDD-NNN-<slug>", "ledger_registry.json"]
negative_constraints: []
owner_hints: [Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

### PLS-003 - Machine-First Bootstrap Record Set

```yaml
plan_unit_id: PLS-003
unit_type: decision
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Bootstrap ledger state uses JSONL append logs and JSON state projections. Source shards preserve exact source/history for recovery, audit, and migration; shards are cold source/history, not the active operating interface.
gui_related: false
gui_classification_reason: File format and source-history boundaries are not GUI work.
depends_on: [PLS-002]
unblocks: [PLS-004, PLS-006]
acceptance_criteria:
  - A v2 ledger contains manifest, events, records, state, validation, indexes, and source_shards locations.
  - The normal resume surface is compact JSON state, not a full event-log read.
validation_surfaces:
  - JSON syntax validation.
  - Ledger health checks.
risk_class: data_integrity
reasoning_tier: standard
context_scope: repo
implementation_surfaces: [Plans/ledgers/v2/*/manifest.json, Plans/ledgers/v2/*/events.jsonl, Plans/ledgers/v2/*/records, Plans/ledgers/v2/*/state, Plans/ledgers/v2/*/source_shards]
node_compile_hint: {mode: source_memory_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0003
  - pldg-20260610-001-ledger-plan-system:atom-0005
  - pldg-20260610-001-ledger-plan-system:dec-0002
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["JSONL", "JSON projections", "Markdown debug export", "source_shards", "cold source/history", "active state projections"]
negative_constraints:
  - Do not create another Markdown working_ledger.md as the active format.
  - Sharding alone must not become the active working interface.
compatibility_only_notes:
  - Legacy working_ledger.md files are source-lineage/debug material only.
owner_hints: [Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md

### PLS-004 - Compact Operating Surface

```yaml
plan_unit_id: PLS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Agents continue a ledger from compact operating views and capsules by default. The normal read set is ledger_registry.json, state/handoff.json, state/current.json, state/open_items.json, state/operating_capsule.json, and any explicitly allowed queue/record files named by the capsule.
gui_related: false
gui_classification_reason: Agent resume protocol is not GUI or visual implementation work.
depends_on: [PLS-003]
unblocks: [PLS-006, BPM-001]
acceptance_criteria:
  - A lower-quality agent can resume from compact projections without reading full events.jsonl or source_shards.
  - The operating capsule names allowed reads, allowed writes, and forbidden governance outputs.
validation_surfaces:
  - Ledger health projections.
  - Manual compile review.
risk_class: context_budget
reasoning_tier: standard
context_scope: single_ledger
implementation_surfaces: [Plans/ledgers/v2/*/state/current.json, Plans/ledgers/v2/*/state/handoff.json, Plans/ledgers/v2/*/state/open_items.json, Plans/ledgers/v2/*/state/operating_capsule.json]
node_compile_hint: {mode: index_resume_surface, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0004
  - pldg-20260610-001-ledger-plan-system:dec-0003
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["operating capsule", "state/current.json", "state/handoff.json", "state/open_items.json"]
negative_constraints:
  - Do not require agents to read the whole ledger to continue.
owner_hints: [Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/bootstrap/Bootstrap_Planning_Workflow.md

### PLS-005 - Design Atom Lifecycle And Exact Preservation

```yaml
plan_unit_id: PLS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Conversational planning captures neutral design_atom records. The compiler converts accepted atoms into PlanUnits later. Ledger records preserve exact field names, examples, negative constraints, compatibility-only notes, stale/retired notes, owner hints, user corrections, and agent-inferred gui_related true/false.
gui_related: false
gui_classification_reason: Metadata and preservation rules are not GUI implementation work.
depends_on: [PLS-001, PLS-003]
unblocks: [PDS-002, PDS-003, PNC-005]
acceptance_criteria:
  - Every new or updated design atom includes gui_related true/false.
  - Accepted corrections survive compilation into PlanUnits or explicit dispositions.
validation_surfaces:
  - Ledger schema validation.
  - PlanUnit coverage review.
risk_class: source_loss
reasoning_tier: standard
context_scope: ledger_to_plan
implementation_surfaces: [Plans/ledgers/v2/*/records/design_atoms.jsonl, Plans/ledgers/v2/*/records/corrections.jsonl, Plans/*.md]
node_compile_hint: {mode: planunit_source_lineage, create_worknodes: false}
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0004
  - pldg-20260610-001-ledger-plan-system:atom-0006
  - pldg-20260610-001-ledger-plan-system:atom-0008
  - pldg-20260610-001-ledger-plan-system:atom-0032
  - pldg-20260610-001-ledger-plan-system:corr-0003
  - source_ref:chat:design-discussion
  - source_ref:chat:user-gui-classification-correction
preserved_exact_tokens: ["design_atom", "PlanUnit", "obligation", "negative constraints", "compatibility-only", "stale/retired", "owner hints", "user corrections", "gui_related", "GUI", "UI", "icons", "SVGs", "images", "true", "false"]
negative_constraints:
  - Do not prematurely treat every discussion point as a transfer obligation.
  - Do not require the user to declare whether an item is GUI-related.
  - Do not use a granular surface taxonomy for the bootstrap standard; use a simple boolean.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

### PLS-006 - Per-Turn Update Protocol

```yaml
plan_unit_id: PLS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: After every substantive ledger conversation turn, append one event, upsert affected records, update questions/blockers/corrections, and rewrite current/handoff/open-item projections. Multiple simultaneous ledgers are tracked by stable ledger_id values in ledger_registry.json.
gui_related: false
gui_classification_reason: Conversation-state persistence is not GUI implementation work.
depends_on: [PLS-002, PLS-003, PLS-004]
unblocks: [BPM-001, BPM-002]
acceptance_criteria:
  - events.jsonl records the turn-level history.
  - records/*.jsonl captures durable planning state.
  - state/handoff.json remains sufficient for transfer.
validation_surfaces:
  - JSON syntax validation.
  - Ledger health summary counts.
risk_class: continuity
reasoning_tier: standard
context_scope: single_ledger
implementation_surfaces: [Plans/ledgers/v2/ledger_registry.json, Plans/ledgers/v2/*/events.jsonl, Plans/ledgers/v2/*/records, Plans/ledgers/v2/*/state]
node_compile_hint: {mode: ledger_maintenance, create_worknodes: false}
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0003
  - pldg-20260610-001-ledger-plan-system:atom-0007
  - pldg-20260610-001-ledger-plan-system:atom-0012
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["events.jsonl", "records/*.jsonl", "state/handoff.json", "pldg-YYYYMMDD-NNN-<slug>", "ledger_registry.json"]
negative_constraints: []
owner_hints: [Plans/Planning_Ledger_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md

### PLS-007 - Owner Ambiguity And Evidence Classes

```yaml
plan_unit_id: PLS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Owner ambiguity is normal during planning. The ledger captures candidate owners, consumer docs, evidence, and adjudication rules; compile agents resolve ordinary row-level placement by evidence and deterministic policy, asking Jared only for a true product decision.
gui_related: false
gui_classification_reason: Owner adjudication is planning/governance behavior, not GUI work.
depends_on: [PLS-001, PLS-005]
unblocks: [PDS-005, BPM-004]
acceptance_criteria:
  - Ambiguous placement records include candidate owners and adjudication evidence.
  - Ordinary owner ambiguity does not block compilation when a safe target owner is known.
validation_surfaces:
  - Compile queue owner_adjudication_status.
  - PlanUnit source_lineage and owner_hints.
risk_class: owner_drift
reasoning_tier: standard
context_scope: cross_doc
implementation_surfaces: [Plans/ledgers/v2/*/state/compile_queue.json, Plans/*.md]
node_compile_hint: {mode: owner_route_metadata, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0010
  - pldg-20260610-001-ledger-plan-system:atom-0009
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["candidate owners", "consumer docs", "owner adjudication", "source_evidence", "canonical_evidence", "process_evidence", "governance_evidence"]
negative_constraints:
  - Do not blindly trust queued owner hints as authority.
  - Do not block on ordinary row-level owner ambiguity.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

### PLS-008 - Planning Wizard And Goal Integration

```yaml
plan_unit_id: PLS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Future Planning Wizard planning uses native Goal Mode invisibly to transfer ledgers to Plans, convert Plans to future work-node artifacts after the compiler contract exists, and audit. Assistant chat may invoke Goal Mode visibly for arbitrary execution tasks. Chain Wizard remains a retired compatibility/source-lineage name, not current product terminology.
gui_related: false
gui_classification_reason: Goal orchestration policy is not itself GUI implementation work.
depends_on: [PLS-001, PLS-002, PNC-001]
unblocks: [BPM-002, PNC-006]
acceptance_criteria:
  - Planning Wizard/native Goal integration respects the ledger-to-Plan and Plan-to-node boundaries.
  - Visible Assistant Goal Mode remains available for user-directed long-running execution tasks.
validation_surfaces:
  - Future Planning Wizard integration tests.
  - Plan_To_Node_Compilation boundary checks.
risk_class: execution_boundary
reasoning_tier: standard
context_scope: native_future
implementation_surfaces: [future Planning Wizard, future Goal Mode service, Plans/Plan_To_Node_Compilation.md]
node_compile_hint: {mode: future_native_integration, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0029
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Planning Wizard", "Chain Wizard", "native Goal Mode", "ledger-to-Plans", "Plans to work nodes", "audit"]
negative_constraints:
  - Do not use Chain Wizard as current product terminology.
compatibility_only_notes:
  - Chain Wizard is retained only for historical migration, source-lineage, and compatibility search.
stale_retired_dispositions:
  - Chain Wizard is retired as current product/workflow terminology; current prose uses Planning Wizard.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_To_Node_Compilation.md


### PLS-009 - Bootstrap Ledger Directory And Record Contract

```yaml
plan_unit_id: PLS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  Every bootstrap ledger directory has a deterministic file layout: manifest.json,
  events.jsonl, records/design_atoms.jsonl, records/decisions.jsonl,
  records/questions.jsonl, records/blockers.jsonl, records/corrections.jsonl,
  state/current.json, state/handoff.json, state/open_items.json,
  state/compile_queue.json, state/operating_capsule.json,
  validation/ledger_health.json, indexes/, and source_shards/. The registry entry
  points to the ledger handoff file and records status, phase, canonical targets,
  and resume path.
gui_related: false
gui_classification_reason: File layout and machine-state contracts are not GUI work.
depends_on: [PLS-002, PLS-003, PLS-004]
unblocks: [PLS-006, BPM-001, BPM-002]
acceptance_criteria:
  - A new feature ledger can be created from the contract without reading an old working_ledger.md.
  - Every required stream/projection file exists before an agent claims a ledger is usable.
  - Registry, manifest, compile queue, and handoff paths agree on the same ledger_id and phase.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/<ledger_id>
  - JSON/JSONL syntax validation.
risk_class: bootstrap_operability
reasoning_tier: standard
context_scope: single_ledger
implementation_surfaces: [Plans/ledgers/v2/README.md, Plans/ledgers/v2/ledger_registry.json, Plans/ledgers/v2/*/manifest.json, Plans/ledgers/v2/*/events.jsonl, Plans/ledgers/v2/*/records, Plans/ledgers/v2/*/state, Plans/ledgers/v2/*/validation]
node_compile_hint: {mode: ledger_file_contract, create_worknodes: false}
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0001
  - pldg-20260610-001-ledger-plan-system:atom-0035
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["manifest.json", "events.jsonl", "records/design_atoms.jsonl", "records/decisions.jsonl", "records/questions.jsonl", "records/blockers.jsonl", "records/corrections.jsonl", "state/current.json", "state/handoff.json", "state/open_items.json", "state/compile_queue.json", "state/operating_capsule.json", "validation/ledger_health.json", "ledger_registry.json"]
negative_constraints:
  - Do not treat legacy working_ledger.md files as the v2 active ledger format.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/bootstrap/Bootstrap_Planning_Workflow.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/bootstrap/Bootstrap_Planning_Workflow.md

### PLS-010 - Bootstrap Ledger Validator And Projection Contract

```yaml
plan_unit_id: PLS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: The bootstrap ledger validator must fail on structural drift, including invalid JSON/JSONL, missing required files, duplicate record IDs, manifest count mismatch, current/handoff/health disagreement, stale last-event cursors, missing gui_related booleans, compile queue/source atom mismatch, PlanUnit YAML parse errors, duplicate YAML keys, PlanUnit schema misses, and missing governance registration for canonical targets. Standard plan run-gates intentionally exclude the full bootstrap-ledger matrix; the dedicated `validate-bootstrap-ledgers` smoke check validates every selected `Plans/ledgers/v2/pldg-*` ledger, including historical sealed ledgers.
gui_related: false
gui_classification_reason: Validator behavior is not GUI implementation work.
depends_on: [PLS-005, PLS-006, PLS-009, PDS-003]
unblocks: [BPM-003, BPM-005]
acceptance_criteria:
  - Validator output reports exact errors and warnings instead of allowing false completion.
  - Validator checks canonical targets against sharding_config, Spec_Lock, and plan_graph coverage after seal.
  - Duplicate PlanUnit YAML keys are rejected so overwritten fields cannot hide drift.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/<ledger_id>
  - python3 scripts/pm-plans-verify.py validate-bootstrap-ledgers
  - python3 scripts/pm-shard-plans.py --check
risk_class: false_completion
reasoning_tier: high
context_scope: ledger_and_governance
implementation_surfaces: [scripts/pm-bootstrap-ledger-validate.py, scripts/pm-plans-verify.py, Plans/ledgers/v2/schemas/plan_unit.schema.json, Plans/sharding_config.json, Plans/Spec_Lock.json, Plans/plan_graph.json]
node_compile_hint: {mode: validator_contract, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0036
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["duplicate YAML keys", "manifest count mismatch", "current/handoff/health disagreement", "last_event_id", "gui_related", "validate-bootstrap-ledgers", "sharding_config", "Spec_Lock", "plan_graph"]
negative_constraints:
  - Do not rely on ordinary plan gates alone to prove ledger/PlanUnit health.
  - Do not treat run-gates as proof that every historical bootstrap ledger validates.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

## Ledger Compile Addendum - pldg-20260616-002

### PLS-011 - Compile Queue Fidelity And Governance-Seal Boundary

```yaml
plan_unit_id: PLS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  A v2 ledger compile queue must preserve accepted atom dispositions, target owner docs, compile_queue.items, candidate_compile_plan, compiled_plan_unit_ids, duplicate/deferred/non-applicable rationale, validation commands, and governance status without writing Spec_Lock, generated shards, evidence bundles, plan_graph, auto_decisions, WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, or production build tasks during ordinary ledger-to-Plans compile. After canonical docs and allowed plan indexes change, the ledger status is compiled pending governance seal until an explicit seal phase refreshes governance artifacts; Bootstrap_Planning_Migration/BPM-005 owns governance seal timing while this PlanUnit owns compile-queue fidelity and ledger status projection. Compile-readiness projections may record accepted recommendations, no remaining open design questions, and live repo backlink audit requirements, but they must not treat plan-compile readiness as direct code implementation readiness.
gui_related: false
gui_classification_reason: Compile queue fidelity and governance seal state are planning/governance metadata, not GUI behavior.
depends_on:
  - PLS-009
  - PLS-010
  - BPM-005
unblocks: []
acceptance_criteria:
  - Compile queue state records per-atom dispositions, compile_queue.items, candidate_compile_plan, compiled PlanUnit ids, and compiled_plan_unit_ids.
  - Duplicate, deferred, and non-applicable atoms preserve rationale instead of disappearing.
  - Ordinary compile does not update Spec_Lock, shards, evidence bundles, plan_graph, auto_decisions, WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, or production build tasks.
  - Governance status is pending_seal after canonical docs or allowed plan indexes change.
  - Compile readiness can record accepted recommendations, no remaining open design questions, and live repo backlink audit requirements without implying code implementation readiness.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/<ledger_id>
  - python3 scripts/pm-plan-index.py validate
risk_class: compile_queue_false_completion
reasoning_tier: high
context_scope: bootstrap_ledger_compile_queue
implementation_surfaces:
  - Plans/Planning_Ledger_System.md
  - Plans/ledgers/v2/*/state/compile_queue.json
  - Plans/ledgers/v2/*/records/design_atoms.jsonl
  - Plans/ledgers/v2/*/manifest.json
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: compile_queue_fidelity
  create_worknodes: false
source_lineage:
  - pldg-20260703-001-feature-intake:atom-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0085
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0086
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0096
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0099
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0104
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0029
preserved_exact_tokens:
  - "compile_queue"
  - "compile_queue.items"
  - "candidate_compile_plan"
  - "compiled PlanUnit ids"
  - "compiled_plan_unit_ids"
  - "ledger-to-Plans compile"
  - "accepted"
  - "no remaining open design questions"
  - "live repo backlink audit"
  - "pending governance seal"
  - "Bootstrap_Planning_Migration"
  - "BPM-005"
  - "Spec_Lock"
  - "generated shards"
  - "evidence bundles"
  - "plan_graph"
  - "auto_decisions"
  - "WorkNodes"
  - "NodeSeeds"
  - "executable queues"
  - "final build tasks"
negative_constraints:
  - Do not mark a ledger sealed during ordinary compile.
  - Do not create executable build tasks before the WorkNode compiler contract exists.
  - Do not create fake compiled_plan_unit_ids before Plans are compiled.
  - Do not create executable WorkNodes or NodeSeeds during ledger compile.
  - Do not skip the live repo backlink audit at compile time.
  - Do not treat plan-compile readiness as direct code implementation readiness.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
  - Plans/Bootstrap_Planning_Migration.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## Semantic Audit Closure Addendum - 2026-06-17

### PLS-012 - Semantic Closure Registry And Reopen Contract

```yaml
plan_unit_id: PLS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  Deep semantic audit and repair cycles use the global
  Plans/.audits/_semantic_closure_registry.jsonl registry to make audit
  findings durable across runs. Registry rows preserve closure_id, finding_key,
  finding_family, ledger_id, audit_ids, source_atom_ids, plan_unit_ids,
  owner_docs, consumer_docs, detail_keys, exact_tokens, closure_status,
  closure_evidence, closure_reason, hashes, created_at, updated_at,
  closed_by_audit_id, and reopen_conditions. Audit findings carry
  repair_required:boolean and finding_level:blocker|warning|observation.
  BLOCKED is reserved for repair_required=true findings, validator failures or
  validator state mutation, forbidden artifacts, or required user decisions.
  PASS_WITH_WARNINGS is terminal when all findings have repair_required=false;
  PASS means no findings. Audits read the registry before emitting new semantic
  risks; if an unchanged finding is already closed with valid evidence and
  hashes, the audit classifies it as previously_closed with repair_required=false
  rather than a new warning. A finding reopens only when the source atom hash,
  PlanUnit hash, owner evidence hash, or closure evidence hash changes, or when
  the current closure_status is blocked_requires_user_decision or reopened.
  Before semantic review, each audit writes audit_scope_manifest.jsonl with
  stable check_id rows for every compiled atom detail, compile target,
  added/changed PlanUnit claim, reciprocal source_lineage claim,
  owner/consumer route, schema/contract identity, depends_on/unblocks edge,
  synchronized ledger projection field, index/governance check, and
  forbidden-artifact check. Audit completion requires every manifest row to be
  classified. Every emitted audit finding carries finding_family, ledger_id,
  source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens,
  repair_required, finding_level, and deterministic sfk finding_key; audit-id,
  row-number, or prose-order keys are invalid.
  Audits record subject_ref as the latest substantive commit touching live
  Plans, target-ledger governing state, .plan_index, governance, or process
  scripts, excluding Plans/.audits/** and closure-registry-only or hygiene
  commits; HEAD is recorded separately as observation_ref. Ledger latest_audit_*
  tracks the latest state-certifying audit or repair that changed or validated
  canonical Plans, ledger governing state, index, or governance. Audit-only
  observations and hygiene repairs do not stale or restamp ledger projections.
  Deep audits may schema-check prior audit artifacts but must not emit
  semantic/currentness findings about old report wording, review/commit text, or
  missing pointers to audit-only runs. Chat-sourced semantic closure support is
  recorded as source-lineage process support unless a v2 ledger atom or decision
  explicitly owns it. Before editing, repair writes repair_impact_matrix.jsonl
  mapping every actionable finding to synchronized files, PlanUnits, schemas,
  dependency edges, owner refs, ledger projection fields, index artifacts, and
  governance artifacts. Repair then runs an internal post-repair semantic audit
  over the original audit scope plus every impact row, adds any newly discovered
  actionable findings to the same scope/impact set, and continues repair until
  repair_required_count is zero or a true user decision is required. Passing
  validators alone are not semantic closure. Only after internal closure may
  repair update the global registry, regenerate PlanUnit indexes or governance
  artifacts, seal governance, or write REPAIR_CERTIFICATION.md.
gui_related: false
gui_classification_reason: Audit closure durability and reopen policy are process/governance behavior, not GUI implementation work.
depends_on:
  - PLS-005
  - PLS-010
unblocks:
  - PDS-014
acceptance_criteria:
  - The global closure registry exists at Plans/.audits/_semantic_closure_registry.jsonl.
  - Deep audits treat unchanged closed findings as previously_closed, not new semantic_risks.
  - Every new audit finding records repair_required:boolean and finding_level:blocker|warning|observation.
  - audit_scope_manifest.jsonl exists before semantic review and has stable check_id coverage for compiled atom details, compile targets, PlanUnit claims, reciprocal source_lineage, owner/consumer routes, schema identity, dependency edges, ledger projections, index/governance checks, and forbidden-artifact checks.
  - Audit completion requires every audit_scope_manifest.jsonl row to be classified.
  - Every audit finding carries finding_family, ledger_id, source_atom_ids, plan_unit_ids, owner_docs, detail_keys, exact_tokens, repair_required, finding_level, and deterministic sfk finding_key.
  - PASS_WITH_WARNINGS is terminal when every finding has repair_required=false.
  - subject_ref excludes Plans/.audits/** and closure-registry-only or hygiene commits; observation_ref records HEAD separately.
  - latest_audit_* projections track only state-certifying audits or repairs, not audit-only observations or hygiene repairs.
  - Planning Wizard, PlanCompile, and WorkNode audit findings reuse closed registry rows when evidence has not changed.
  - Reopen decisions are based on changed source atom, PlanUnit, owner evidence, or closure evidence hashes, or on blocked/reopened closure status.
  - Closure rows preserve the allowed statuses repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, blocked_requires_user_decision, and reopened.
  - Chat-sourced closure-support PlanUnits are not represented as outputs of a target ledger compile unless their source_lineage names that ledger atom or decision.
  - repair_impact_matrix.jsonl exists before repair edits when actionable findings exist and maps synchronized files, PlanUnits, schemas, dependency edges, owner refs, ledger projections, index artifacts, and governance artifacts.
  - Repair runs an internal post-repair semantic audit over the original scope plus impact rows and finishes only with repair_required_count=0 or a true user decision.
  - New repair-discovered actionable findings are added to the same scope/impact set and closed in the same Goal.
  - Registry updates, PlanUnit index regeneration, governance seal, and REPAIR_CERTIFICATION.md happen only after internal semantic closure.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py validate
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
  - python3 -m unittest tests/test_pm_audit_closure.py
risk_class: repeated_audit_loop
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/audit_scope_manifest.jsonl
  - Plans/.audits/audit-*/repair_impact_matrix.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
  - tests/test_pm_audit_closure.py
node_compile_hint:
  mode: audit_registry_process
  create_worknodes: false
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0054
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
  - "Planning Wizard"
  - "Plan Wizard"
  - "closure_id"
  - "finding_key"
  - "finding_family"
  - "ledger_id"
  - "audit_ids"
  - "source_atom_ids"
  - "plan_unit_ids"
  - "owner_docs"
  - "consumer_docs"
  - "detail_keys"
  - "exact_tokens"
  - "closure_status"
  - "closure_evidence"
  - "closure_reason"
  - "hashes"
  - "created_at"
  - "updated_at"
  - "closed_by_audit_id"
  - "reopen_conditions"
  - "previously_closed"
  - "repair_required"
  - "finding_level"
  - "audit_scope_manifest.jsonl"
  - "check_id"
  - "repair_impact_matrix.jsonl"
  - "REPAIR_CERTIFICATION.md"
  - "subject_ref"
  - "observation_ref"
  - "PASS_WITH_WARNINGS"
  - "source-lineage process support"
compatibility_only_notes:
  - Plan Wizard is a retired compatibility/search term; active audit prose uses Planning Wizard.
stale_retired_dispositions:
  - Plan Wizard is retained only as compatibility/source-lineage terminology and not as the current product name.
negative_constraints:
  - Do not re-emit unchanged closed findings as new warnings.
  - Do not require repair closure rows for previously_closed, exact_present, equivalent_with_evidence, repair_required=false warnings, ordinary validator warnings, or audit-artifact wording.
  - Do not accept audit-specific finding_key values based on audit_id, row number, or prose order.
  - Do not finish an audit with unclassified audit_scope_manifest.jsonl rows.
  - Do not start repair edits before mapping actionable findings in repair_impact_matrix.jsonl.
  - Do not claim repair completion until the internal post-repair semantic audit over original scope plus impact rows reaches repair_required_count=0 or a true user decision.
  - Do not stale ledger latest_audit_* projections because of audit-only observations or hygiene-only commits.
  - Do not hide a finding when source/canonical/owner/closure evidence hashes changed.
  - Do not update the global closure registry, regenerate indexes, seal governance, or write REPAIR_CERTIFICATION.md before internal semantic closure.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from audit closure state.
  - Do not place chat-sourced closure-support PlanUnits under a target-ledger compile addendum as though they were compiled from that ledger.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md

## 3. Compilation Coverage

| Ledger atom | Disposition |
| --- | --- |
| atom-0001 | PLS-001 |
| atom-0002 | PLS-002 |
| atom-0003 | PLS-003 |
| atom-0004 | PLS-004 |
| atom-0005 | PLS-003 |
| atom-0006 | PLS-005 |
| atom-0007 | PLS-006 |
| atom-0008 | PLS-005 |
| atom-0009 | PLS-001, PLS-007 |
| atom-0010 | PLS-007 |
| atom-0012 | PLS-002, PLS-006 |
| atom-0016 | PLS-001; creation of this owner doc fulfills the broad owner-doc atom. |
| atom-0028 | PLS-001 preserves the stale/retired boundary; BPM-006 owns migration handling. |
| atom-0029 | PLS-008 |
| atom-0032 | PLS-005; PDS-003 and PNC-005 consume it. |
| atom-0035 | PLS-009 |
| atom-0036 | PLS-010 |
| atom-0042 | PLS-001 |
| source_ref:chat:2026-06-17-semantic-closure-registry-support | PLS-012; PDS-014 owns deterministic finding_key and validator-facing closure matrix checks. |

ContractRef: ContractName:Plans/Planning_Ledger_System.md

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PLS-013 - Implementation Readiness And Doc Impact Matrix Compile Inputs

```yaml
plan_unit_id: PLS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  A v2 planning ledger may declare implementation_readiness_matrix.json and doc_impact_matrix.json as required compile inputs when a ledger-to-Plans compile must produce implementation-ready PlanUnits and reference coverage. implementation_readiness_matrix maps design areas to required PlanUnits, schemas, fields, acceptance criteria, validators, owner docs, consumer docs, and no-build boundaries. doc_impact_matrix maps primary owner docs, direct consumer docs, reference/index/UI docs, search tokens, required update types, deferred update handling, and per-doc no-update evidence. The ledger remains source/planning memory; canonical truth is established only by live non-pipeline Plans docs and schema drafts after compile.
  The doc_impact_matrix rule forbids owner-only repairs: Do not update only the obvious owner docs while leaving stale references in consumer/index/UI docs.
gui_related: false
gui_classification_reason: Matrix input handling is ledger/process behavior, not GUI implementation.
depends_on: [PLS-010, PDS-015]
unblocks: []
acceptance_criteria:
  - Matrix refs in compact state are treated as required compile inputs when present.
  - Implementation readiness covers PlanUnits, schemas, fields, acceptance, validators, owner/consumer docs, and no-build boundaries.
  - Doc impact covers owner, consumer, reference/index/UI docs, search terms, required updates, no-update evidence, and deferred updates.
  - The ledger remains source memory rather than canonical product prose.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future bootstrap ledger validate matrix checks
risk_class: vague_compile_output
reasoning_tier: high
context_scope: bootstrap_ledger_compile_inputs
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
node_compile_hint: {mode: compile_input_matrix_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:atom-0062
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
  - pldg-20260617-001-plans-to-code-handoff:corr-0010
preserved_exact_tokens:
  - "implementation_readiness_matrix"
  - "required PlanUnits"
  - "schemas"
  - "fields"
  - "acceptance criteria"
  - "validators"
  - "owner docs"
  - "consumer docs"
  - "no-build boundaries"
  - "doc_impact_matrix"
  - "reference docs"
  - "search tokens"
  - "no-update evidence"
  - "deferred rename"
negative_constraints:
  - Do not compile vague roadmap prose that leaves future agents to infer the contracts.
  - Do not update only obvious owner docs while leaving direct stale references unaccounted for.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PLS-014 - Planning Product Ledger Synchronization And Compile Boundary

```yaml
plan_unit_id: PLS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: 'Every substantive PRD Builder exchange must append an event and update affected PRD atoms, decisions, assumptions, constraints, questions, conflicts, annotations, projections, and handoff state before the turn is complete. Every substantive Planning Wizard exchange must append an event and update topic-scoped planning atoms plus any affected global decisions, constraints, dependencies, invalidations, amendments, questions, and handoff state before the turn is complete. If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired. The durable PRD ledger is working memory and source lineage; the visible PRD is a versioned human-readable projection of accepted ledger atoms and must not become the only source of truth. Material functional requirements and acceptance criteria receive
  stable identifiers such as FR-001 and AC-001, with stable internal atom IDs and source lineage. Large documents must be divided into bounded, source-addressable slices that preserve page, heading, paragraph, table, image, and offset lineage so agents never need to ingest the entire corpus at once. Each intake subagent emits bounded candidate requirement atoms, source spans, confidence, ambiguity, conflicts, duplicates, and extraction warnings; only the controller or assigned owner may reduce and write the canonical PRD ledger and draft. Conflicting inputs create durable conflict records and are resolved using explicit current user instruction, accepted PRD Builder decisions, source recency/authority, and recorded assumptions; overridden claims remain traceable. Topic agents write topic_id-scoped records into one Planning Run ledger plus global records for cross-topic decisions and constraints, avoiding independent ledgers that can silently disagree.
  The ApprovedPlanPack and frozen canonical PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger remains source and reasoning lineage rather than executable canon. After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases. The deep-audit Goal uses many bounded read-only subagents in parallel for atom fidelity, reciprocal lineage, owner routing, changed-doc fidelity, ledger consistency, index/governance, forbidden artifacts, and validator mutability, with the main agent writing audit artifacts. The repair Goal builds a closure matrix only for repair_required=true findings, repairs or adjudicates those actionable rows, updates the semantic closure registry only for actionable closures, uses bounded read-only specialist subagents, and no-ops when no actionable rows exist. Passing validators alone are insufficient when repair_required=true rows remain unclosed. Ledger-to-Plans compilation writes
  or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0010
- pldg-20260618-001-prd-planning-wizard:atom-0011
- pldg-20260618-001-prd-planning-wizard:atom-0012
- pldg-20260618-001-prd-planning-wizard:atom-0023
- pldg-20260618-001-prd-planning-wizard:atom-0025
- pldg-20260618-001-prd-planning-wizard:atom-0032
- pldg-20260618-001-prd-planning-wizard:atom-0034
- pldg-20260618-001-prd-planning-wizard:atom-0035
- pldg-20260618-001-prd-planning-wizard:atom-0054
- pldg-20260618-001-prd-planning-wizard:atom-0103
- pldg-20260618-001-prd-planning-wizard:atom-0161
- pldg-20260618-001-prd-planning-wizard:atom-0166
- pldg-20260618-001-prd-planning-wizard:atom-0167
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0010
- atom-0011
- atom-0012
- atom-0023
- atom-0025
- atom-0032
- atom-0034
- atom-0035
- atom-0054
- atom-0103
- atom-0161
- atom-0166
- atom-0167
- atom-0168
decision_refs:
- dec-0004
- dec-0008
- dec-0009
- dec-0011
- dec-0029
- dec-0030
correction_refs:
- corr-0004
preserved_exact_tokens:
- after every substantive turn
- ledger_sync_blocked
- topic_id
- global planning state
- PRD ledger
- projection
- FR-001
- AC-001
- bounded slices
- source-addressable
- candidate requirement atoms
- controller
- conflict record
- source priority
- global records
- PlanUnit index
- acceptance-unit index
- lineage
- governance seal
- Deep Audit
- many bounded read-only subagents in parallel
- repair_closure_matrix.jsonl
- semantic closure registry
- repair_required
- finding_level
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not defer ledger reconstruction until the end of the conversation.
- Do not advance a topic from chat state that has not been durably synchronized.
- Do not rely on one broad summary pass over huge source documents.
- Do not allow extraction subagents to independently author the final PRD.
- Do not silently average or erase contradictory requirements.
- Do not create disconnected authoritative ledgers per topic.
- Do not treat mutable planning-ledger projections as the sole Plan Compile authority.
- Do not treat repair_required=false warnings, previously_closed rows, or audit-artifact wording as repair work.
- Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Ledger_System.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/bootstrap/Codex_Prompts.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

### PLS-015 - Native Ledger Service Runtime Contract

```yaml
plan_unit_id: PLS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: 'The Native Ledger Service is the finished-product runtime owner for PRD Builder, Planning Wizard, topic, and compile-source ledger persistence. It provides strict append_event, upsert_record, update_projection, commit_turn, recover_turn, compact_ledger, and import_export APIs with ledger_id, PlanningRun/thread/topic binding, monotonic revision/CAS, idempotency keys, causation/correlation refs, source refs, and receipt hashes. A substantive PRD Builder or Planning Wizard turn is not durable until event append, record upserts, projection updates, handoff/currentness projection, and ledger_turn_commit receipt are atomically committed; failed partial writes leave the visible thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until recovery proves append log, records, projections, and handoff state agree. Runtime certification must reject dangling, orphaned, cross-project, cross-snapshot, stale-revision, wrong-kind, or hash-mismatched *_ref and *_refs edges across PRD source records, PlanningRun records, ApprovedPlanPack, PlanApproved, PlanCompileRun, WorkGraph, WorkNodeRecord, activation, testing, and evidence receipts. Compaction and import/export preserve enough source-lineage, exact-token data, forwarding refs, and tombstone refs to reproduce canonical Plan evidence and revalidate every certified edge, while native storage implementation details may vary behind the service contract. The strict machine-readable contract lives in Plans/prd_planning_runtime_contracts.json and is validated by scripts/pm-prd-planning-runtime-validate.py through the standard plan gates.'
gui_related: false
gui_classification_reason: Runtime storage/API contract, not visual presentation.
depends_on: [PLS-014]
unblocks: [PRDB-004, PWIZ-002, PWIZ-004, PWIZ-012]
acceptance_criteria:
- Native ledger writes use atomic per-turn commit with revision/CAS and idempotency.
- ledger_sync_blocked clears only after append log, records, projections, and handoff/currentness state agree.
- Referential-integrity certification rejects stale, dangling, wrong-kind, wrong-project, wrong-revision, or hash-mismatched refs before terminal success.
- The runtime contract packet validates under python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py run-gates
risk_class: implementation_readiness
reasoning_tier: high
context_scope: native_ledger_service_contract
implementation_surfaces:
- Plans/Planning_Ledger_System.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- scripts/pm-prd-planning-runtime-validate.py
node_compile_hint:
  mode: native_runtime_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Planning_Ledger_System.md#PLS-014
- Plans/PRD_Builder.md#PRDB-004
- Plans/Planning_Wizard.md#PWIZ-002
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-004
preserved_exact_tokens:
- Native Ledger Service
- append_event
- upsert_record
- update_projection
- commit_turn
- revision/CAS
- idempotency
- ledger_sync_blocked
- import/export
- referential integrity
negative_constraints:
- Do not treat the bootstrap file ledger as the finished native runtime service.
- Do not clear ledger_sync_blocked from chat memory or UI state alone.
- Do not certify runtime records whose IDs, hashes, record kinds, projects, revisions, or currentness disagree.
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/storage-plan.md
- Plans/prd_planning_runtime_contracts.json
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PLS-016 - P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY

```yaml
plan_unit_id: PLS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY (P2) is compiled as canonical Puppet Master intent for Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass: Imported external-repo finding extrepo-20260703-0087 / P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY (P2): None The preserved PM gap/delta is: PM has a semantic closure registry for plan audits, but external-upstream watch findings need similar durable status/disposition to avoid repeated rediscovery. The observed external-repo signal remains source-lineage evidence: Pi issue #6280 was auto-closed/untriaged despite containing a real architectural request. | OpenCode issue/PR volume is very high and uses needs-compliance/repro style triage. | PM already discovered semantic closure registry needs internally.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- ExternalRepoFinding records have finding_key, upstream_url, observed_state, PM disposition, reopen conditions, and freshness window.
- Auto-closed upstream issue is not treated as false merely because upstream closed it; PM can keep it as design evidence with status=upstream_auto_closed_pm_relevant.
- Repeated external audits reuse closed findings unless upstream content, PM coverage, or source family changed.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- ExternalRepoFinding records have finding_key, upstream_url, observed_state, PM disposition, reopen conditions, and freshness window.
- Auto-closed upstream issue is not treated as false merely because upstream closed it; PM can keep it as design evidence with status=upstream_auto_closed_pm_relevant.
- Repeated external audits reuse closed findings unless upstream content, PM coverage, or source family changed.
risk_class: p2_transport_websocket_streaming_coverage
reasoning_tier: standard
context_scope: transport_websocket_streaming
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p2_upstream_triage_closure_registry
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0091
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0091
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0087/P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0087/P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0091
external_atom_id: extrepo-20260703-0087
source_row_id: P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
priority: P2
finding_family: Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass
target_docs:
- Planning_Ledger_System.md
- GitHub_Integration.md
- Research_Mode / audit prompts
- Contracts_V0.md
owner_hints:
- Planning_Ledger_System.md
- GitHub_Integration.md
- Research_Mode / audit prompts
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0087
- P2-UPSTREAM-TRIAGE-CLOSURE-REGISTRY
- P2
- Tracking auto-closed/needs-repro/upstream issues without rediscovering them every pass
negative_constraints: []
observed_signal: 'Pi issue #6280 was auto-closed/untriaged despite containing a real architectural request. | OpenCode issue/PR volume is very high and uses needs-compliance/repro style triage. | PM already discovered semantic closure registry needs internally.'
pm_gap_or_delta: PM has a semantic closure registry for plan audits, but external-upstream watch findings need similar durable status/disposition to avoid repeated rediscovery.
relationship_to_prior_reports: Meta-process addition rather than product runtime P0.
compile_disposition: create_new_planunit
```

### PLS-017 - P2-AI-TRIAGE-CLOSURE-CONFIDENCE

```yaml
plan_unit_id: PLS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2) is compiled as canonical Puppet Master intent for AI triage closure confidence and reopen policy: Imported external-repo finding extrepo-20260703-0099 / P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2): None The preserved PM gap/delta is: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers. The observed external-repo signal remains source-lineage evidence: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
risk_class: p2_external_handoff_and_triage_coverage
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p2_ai_triage_closure_confidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE@line=12
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0103
external_atom_id: extrepo-20260703-0099
source_row_id: P2-AI-TRIAGE-CLOSURE-CONFIDENCE
priority: P2
finding_family: AI triage closure confidence and reopen policy
source_repos:
- Pi
- Ghostty
- Cline
preserved_exact_tokens:
- extrepo-20260703-0099
- P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- P2
- AI triage closure confidence and reopen policy
- Pi
- Ghostty
- Cline
negative_constraints: []
observed_signal: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
pm_gap_or_delta: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers.
compile_disposition: create_new_planunit
```

### PLS-018 - external_issue_closure

```yaml
plan_unit_id: PLS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  external_issue_closure (P1) is compiled as canonical Puppet Master intent for external_issue_closure: Add ExternalIssueClosureRegistry The preserved PM gap/delta is: External issue/PR closure governance not clearly extended The observed external-repo signal remains source-lineage evidence: OpenCode needs:compliance auto-close user frustration
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No auto-close without evidence/triage schema
- reopen conditions
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No auto-close without evidence/triage schema
- reopen conditions
risk_class: p1_external_handoff_and_triage_hardening
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: external_issue_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0116
external_atom_id: extrepo-20260703-0112
source_row_id: external_issue_closure
priority: P1
finding_family: external_issue_closure
target_docs:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
preserved_exact_tokens:
- extrepo-20260703-0112
- external_issue_closure
- P1
negative_constraints: []
observed_signal: OpenCode needs:compliance auto-close user frustration
pm_current_coverage: Semantic closure registry exists for audits
pm_gap_or_delta: External issue/PR closure governance not clearly extended
proposal_or_recommendation: Add ExternalIssueClosureRegistry
compile_disposition: create_new_planunit
```
