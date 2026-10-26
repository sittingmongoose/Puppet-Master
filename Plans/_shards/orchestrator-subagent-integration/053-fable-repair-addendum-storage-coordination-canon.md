# Shard 053: FABLE Repair Addendum - storage coordination canon

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31502-L31568

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## FABLE Repair Addendum - storage coordination canon

This addendum applies the FABLE storage/coordination canon repair decision. It does not repair platform_specs, FileSafe, UI command catalog, wiring matrix, Goal Runtime, Executor Protocol, broad boilerplate, WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or generated governance artifacts outside the derived refresh phase.

### OSI-432 - Coordination Canon Record Projection And Mirror Contract

```yaml
plan_unit_id: OSI-432
unit_type: schema_contract
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Active-agent coordination canonical truth is the EventRecord seglog coordination family plus redb projections for agent
  registration, status, operation, file-activity, unregister/crash/abort, snapshots, and optional debug mirror export.
  `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` files are compatibility/debug/export
  mirrors or retired source-lineage only; they cannot drive scheduling, execution admission, conflict prevention, prompt
  injection, unregister, crash, or abort decisions.
gui_related: false
gui_classification_reason: This unit defines backend coordination storage and projection authority, not GUI presentation.
depends_on: [OSI-225, OSI-270, OSI-271, CV-309, SP-230]
unblocks: []
acceptance_criteria:
  - "`coordination.agent_registered`, `coordination.agent_status_updated`, `coordination.agent_operation_updated`, `coordination.agent_file_ownership_updated`, `coordination.agent_unregistered`, `coordination.agent_crashed`, `coordination.agent_aborted`, and `coordination.debug_mirror_exported` are the named coordination event families consumed by Orchestrator."
  - "`coordination_agent_projection.v1:{project_id}:{agent_id}`, `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}`, `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}`, `coordination_snapshot_projection.v1:{project_id}:{projection_scope}`, and `projector.checkpoint.coordination:{project_id}` are the authoritative coordination read models."
  - Up to 32 active agents across multiple worktrees update coordination through append/CAS boundaries with idempotency keys, expected agent revision or last applied event id, and one redb projection/checkpoint transaction.
  - Lost updates return coordination conflict diagnostics; writers reload projections and append successor events instead of overwriting canonical state.
  - Canonical coordination forbids read-modify-write of `.puppet-master/state/*.json`; mirror writes occur only after projection commit and are recoverable by regenerating from seglog/redb.
  - Corrupted, missing, stale, or lagging mirrors are quarantined or overwritten by PM-owned projection/export code and cannot decide scheduling, execution, conflict prevention, prompt injection, unregister, crash, or abort behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: coordination_file_canon_regression
reasoning_tier: high
context_scope: storage_coordination_canon
implementation_surfaces:
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/storage_value_registry.json
  - Plans/path_reference_registry.json
node_compile_hint:
  mode: storage_coordination_canon_repair
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl:6
source_atom_ids: []
preserved_exact_tokens:
  - "active-agents.json"
  - ".puppet-master/state/*.json"
  - "File-based coordination (canonical)"
  - "single source of coordination truth"
  - "seglog/redb projections"
  - "coordination.agent_registered"
  - "coordination_snapshot_projection.v1"
negative_constraints:
  - Do not read file-based coordination state as canonical runtime truth.
  - Do not allow debug/export mirrors to drive scheduling, execution admission, conflict prevention, prompt injection, unregister, crash, or abort decisions.
  - Do not use read-modify-write of `.puppet-master/state/*.json` for canonical coordination updates.
  - Do not reinterpret file-activity coordination claims as FileSafe locks or durable exclusive leases.
owner_hints:
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```
