# FABLE Storage Coordination Canon Repair

Audit: `fable-20260706`

Finding: `fable-20260706-p0-storage-coordination-canon-file-vs-seglog-redb`

Status: `repair_validated`

## Decision Applied

Canonical durable coordination truth is the `EventRecord` seglog coordination family plus redb projections. File artifacts such as `active-agents.json`, `agent-messages.json`, and `.puppet-master/state/*.json` may exist only as compatibility/debug/export mirrors or retired source-lineage.

## Canonical Records And Projections

Seglog EventRecord families:

- `coordination.agent_registered`
- `coordination.agent_status_updated`
- `coordination.agent_operation_updated`
- `coordination.agent_file_ownership_updated`
- `coordination.agent_unregistered`
- `coordination.agent_crashed`
- `coordination.agent_aborted`
- `coordination.debug_mirror_exported`

Authoritative redb projections:

- `coordination_agent_projection.v1:{project_id}:{agent_id}`
- `coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id}`
- `coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id}`
- `coordination_snapshot_projection.v1:{project_id}:{projection_scope}`
- `projector.checkpoint.coordination:{project_id}`

## Repair Evidence

- `Plans/orchestrator-subagent-integration.md` defines the canonical coordination record/projection families, mirror contract, CAS/lost-update behavior, and `OSI-432`.
- `Plans/storage-plan.md` removes active-agent truth from `project_state`, defines the storage-owned coordination record/projection/mirror families, and adds `SP-232`.
- `Plans/Contracts_V0.md` adds stable `coordination.*` event families and `CV-310`.
- `Plans/storage_value_registry.json` registers `coordination_event_records`, `coordination_read_model_projections`, and `coordination_debug_mirror_exports`.
- `Plans/path_reference_registry.json` classifies the ad hoc `.puppet-master/state/*.json` coordination paths as source-lineage/debug-export paths.

## Active-Canon Scan

The repair scan for live file-canon claims found no remaining active claim that file-based coordination state is source of truth. Remaining old-token hits are explicit preserved-token or source-lineage contexts, including the retired `File-based coordination (canonical)` token in `OSI-271` and the negative constraints in `OSI-432`.

## Scope Boundary

This repair does not repair platform_specs, FileSafe, UI command catalog, wiring matrix, Goal Runtime, Executor Protocol, broad PlanUnit boilerplate, WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or unrelated FABLE backlog rows.
