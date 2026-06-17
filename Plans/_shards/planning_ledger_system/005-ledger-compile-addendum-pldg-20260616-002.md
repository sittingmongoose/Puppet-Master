# Shard 005: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Planning_Ledger_System.md`

Source lines: L400-L560

Source SHA256: `b13638e887ac0fb19d4bf7f56be42ded1670e91de9c2bf3ca941a40a356b5427`

---

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
  closed_by_audit_id, and reopen_conditions. Audits read the registry before
  emitting new semantic risks; if an unchanged finding is already closed with
  valid evidence and hashes, the audit classifies it as previously_closed rather
  than a new warning. A finding reopens only when the source atom hash,
  PlanUnit hash, owner evidence hash, or closure evidence hash changes, or when
  the current closure_status is blocked_requires_user_decision or reopened.
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
  - Reopen decisions are based on changed source atom, PlanUnit, owner evidence, or closure evidence hashes, or on blocked/reopened closure status.
  - Closure rows preserve the allowed statuses repaired, false_positive, explicitly_deferred, source_lineage_only, not_for_plan, stale_retired, blocked_requires_user_decision, and reopened.
validation_surfaces:
  - python3 scripts/pm-audit-closure.py validate
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix
risk_class: repeated_audit_loop
reasoning_tier: high
context_scope: bootstrap_audit_repair
implementation_surfaces:
  - Plans/.audits/_semantic_closure_registry.jsonl
  - Plans/.audits/audit-*/repair_closure_matrix.jsonl
  - Plans/bootstrap/Codex_Prompts.md
  - scripts/pm-audit-closure.py
node_compile_hint:
  mode: audit_registry_process
  create_worknodes: false
source_lineage:
  - source_ref:chat:2026-06-17-semantic-closure-registry-support
preserved_exact_tokens:
  - "Plans/.audits/_semantic_closure_registry.jsonl"
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
negative_constraints:
  - Do not re-emit unchanged closed findings as new warnings.
  - Do not hide a finding when source/canonical/owner/closure evidence hashes changed.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks from audit closure state.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```
