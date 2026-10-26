# Shard 058: Working Notebook Scopes Addendum (2026-09-05)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31754-L31818

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Working Notebook Scopes Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Workers and coordinators gain bounded notebook scopes bound to existing runtime identities — no new agent/session/hierarchy is created. Scope `worker_lineage` binds a notebook to one node/attempt lineage (run_id/node_id/attempt_id): a worker and its authorized recovery paths record observations, hypotheses, and rejected approaches there, and a node retry reuses relevant lineage learning without inheriting unrelated histories. Scope `coordinator_run` binds a notebook to the coordinating run/package for bounded cross-task observations and references. Assignment, dependency, completion, blocking, and evidence truth always load from the existing runtime owners (coordination projections, `execution_unit_context`, Executor records); coordinator or worker note status prose never marks a node complete, changes assignment, or satisfies a dependency, and updating a note is never a completion event. Notebook content is never hidden orchestrator memory beyond the existing owner boundaries, mirrors stay compatibility/debug artifacts, and worker notebooks contain no Assistant-only memory payload (AMS-046).

```yaml
plan_unit_id: OSI-436
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Worker and coordinator notebooks use worker_lineage and coordinator_run scopes bound to existing run/node/attempt and run/package identities. Node retry reuses relevant lineage notebook learning without inheriting unrelated histories. Assignment, dependency, completion, and evidence truth load only from existing runtime owners; coordinator or worker notes never complete a node, change assignment, or satisfy a dependency, and coordination projections stay the authority over notebook mirrors.
gui_related: false
gui_classification_reason: Orchestration scope semantics are runtime behavior, not GUI work.
depends_on: [OSI-435, WN-005]
unblocks: [OSI-437]
acceptance_criteria:
  - A node retry sees relevant lineage notes and no unrelated histories.
  - A coordinator note update never marks a node complete or changes dependencies.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: note_status_truth
reasoning_tier: high
context_scope: orchestration
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Working_Notebook.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A44
preserved_exact_tokens: ["worker_lineage", "coordinator_run", "never a completion event"]
negative_constraints:
  - Do not derive scheduling or completion truth from notebook prose.
  - Do not create a new agent/session hierarchy for notebooks.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Executor_Protocol.md

```yaml
plan_unit_id: OSI-437
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: "Orchestrator notebook access is read/inspect plus owner-scoped write through the existing detail surfaces: the selected run/worker inspector exposes notebook entry, author, evidence, freshness, and included-context status via the same projection-trust freshness rules (OP-006), with stale/degraded/unavailable projections disabling mutation. Notebook state never bypasses canonical EventRecord/coordination families, and no notebook-specific shadow projection family is created."
gui_related: true
gui_classification_reason: This unit specifies user-visible Orchestrator detail-surface notebook behavior.
depends_on: [OSI-436]
unblocks: []
acceptance_criteria:
  - Selected run/worker detail reaches the notebook through existing inspector patterns.
  - Notebook mutation follows projection freshness rules like every mutating surface.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: shadow_projection
reasoning_tier: standard
context_scope: orchestration
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X01
preserved_exact_tokens: ["projection_state", "existing detail surfaces"]
negative_constraints:
  - Do not create a notebook-specific shadow projection or event family.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md]
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md
