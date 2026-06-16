# Shard 005: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Planning_Ledger_System.md`

Source lines: L141-L476

Source SHA256: `f4fd0c47b3816fbd615609371d5b3cba424714cb2b7648331d63e613034c3bea`

---

## Ledger Compile Addendum - pldg-20260616-002

### PLS-011 - Compile Queue Fidelity And Governance-Seal Boundary

```yaml
plan_unit_id: PLS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  A v2 ledger compile queue must preserve accepted atom dispositions, target owner docs, compile_queue.items, candidate_compile_plan, compiled_plan_unit_ids, duplicate/deferred/non-applicable rationale, validation commands, and governance status without writing Spec_Lock, generated shards, evidence bundles, plan_graph, auto_decisions, WorkNodes, NodeSeeds, executable queues, final node manifests, final build tasks, or production build tasks during ordinary ledger-to-Plans compile. After canonical docs and allowed plan indexes change, the ledger status is compiled pending governance seal until an explicit seal phase refreshes governance artifacts. Compile-readiness projections may record accepted recommendations, no remaining open design questions, and live repo backlink audit requirements, but they must not treat plan-compile readiness as direct code implementation readiness.
gui_related: false
gui_classification_reason: Compile queue fidelity and governance seal state are planning/governance metadata, not GUI behavior.
depends_on:
  - PLS-009
  - PLS-010
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
node_compile_hint:
  mode: compile_queue_fidelity
  create_worknodes: false
source_lineage:
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
```

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

### PLS-008 - Chain Wizard And Goal Integration

```yaml
plan_unit_id: PLS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: Future Chain Wizard planning uses native Goal Mode invisibly to transfer ledgers to Plans, convert Plans to future work-node artifacts after the compiler contract exists, and audit. Assistant chat may invoke Goal Mode visibly for arbitrary execution tasks.
gui_related: false
gui_classification_reason: Goal orchestration policy is not itself GUI implementation work.
depends_on: [PLS-001, PLS-002, PNC-001]
unblocks: [BPM-002, PNC-006]
acceptance_criteria:
  - Chain Wizard/native Goal integration respects the ledger-to-Plan and Plan-to-node boundaries.
  - Visible Assistant Goal Mode remains available for user-directed long-running execution tasks.
validation_surfaces:
  - Future Chain Wizard integration tests.
  - Plan_To_Node_Compilation boundary checks.
risk_class: execution_boundary
reasoning_tier: standard
context_scope: native_future
implementation_surfaces: [future Chain Wizard, future Goal Mode service, Plans/Plan_To_Node_Compilation.md]
node_compile_hint: {mode: future_native_integration, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0029
  - source_ref:chat:design-discussion
preserved_exact_tokens: ["Chain Wizard", "native Goal Mode", "ledger-to-Plans", "Plans to work nodes", "audit"]
negative_constraints: []
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
canonical_text: The bootstrap ledger validator must fail on structural drift, including invalid JSON/JSONL, missing required files, duplicate record IDs, manifest count mismatch, current/handoff/health disagreement, stale last-event cursors, missing gui_related booleans, compile queue/source atom mismatch, PlanUnit YAML parse errors, duplicate YAML keys, PlanUnit schema misses, and missing governance registration for canonical targets.
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
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
risk_class: false_completion
reasoning_tier: high
context_scope: ledger_and_governance
implementation_surfaces: [scripts/pm-bootstrap-ledger-validate.py, Plans/ledgers/v2/schemas/plan_unit.schema.json, Plans/sharding_config.json, Plans/Spec_Lock.json, Plans/plan_graph.json]
node_compile_hint: {mode: validator_contract, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0036
  - source_ref:chat:implementation-readiness-review
preserved_exact_tokens: ["duplicate YAML keys", "manifest count mismatch", "current/handoff/health disagreement", "last_event_id", "gui_related", "sharding_config", "Spec_Lock", "plan_graph"]
negative_constraints:
  - Do not rely on ordinary plan gates alone to prove ledger/PlanUnit health.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/Plan_Document_System.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
