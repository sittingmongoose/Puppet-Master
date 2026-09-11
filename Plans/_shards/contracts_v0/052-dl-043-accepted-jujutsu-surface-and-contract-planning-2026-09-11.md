# Shard 052: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/Contracts_V0.md`

Source lines: L21602-L21801

Source SHA256: `a3685be18003c3800423c52467425d2cdfe2104a8af0b606c6cd8ef3d21157e3`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### CV-330 — Jujutsu Planned Action Envelope Consumer Boundary

```yaml
plan_unit_id: CV-330
unit_type: integration_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Accepted Jujutsu action planning consumes the neutral Source Control envelope and Jujutsu-owned
  typed extensions rather than duplicating them. Expected native identities, writer and credential leases, Permissions/FileSafe
  decisions, idempotency and terminal receipt authority survive every internal-service and consumer boundary.
  This unit adds no schema field, event family or admitted command.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- JJI-003
- SCS-018
- JJI-009
- JJI-012
- JJI-015
- JJI-018
unblocks: []
acceptance_criteria:
- Each planned request/result binds repository/topology, workspace, change_id, immutable commit_id, operation_id
  and affected bookmarks where applicable, plus expected operation/revision and caller return context; identity
  is never reconstructed from labels or stdout.
- Mutations require current writer lease, exact authorization and FileSafe decision, idempotency and target-bound
  confirmation where required. Transport separately binds credential lease and exact remote. Reads acquire no
  implicit mutation, credential, FileSafe or confirmation authority.
- 'JJI-003 owns the terminal rule: accepted work requires ObservableWork and may have null receipt_ref; every
  established command_result with succeeded, blocked, failed, cancelled, recovery_required or effect_unknown references
  a typed non-secret operation receipt. New planning cannot weaken that rule or invent EventRecord registration.'
- Grouped operations reference ordered member requests/receipts and explicit partial disposition rather than asserting
  atomicity. Redo carries a qualified relation; selected-operation reversal carries its exact selected target.
  These shapes remain owner-qualified planning requirements until separately admitted.
- A managed rewrite preview binds exact base/preview identities, affected scope, possible writes/external effects
  and cleanup lifecycle; Apply revalidates the reviewed preview and current native state. Earlier-state reads
  bind one historical operation and cannot carry restore/apply authority.
- Structured hunk selections require exact native snapshot/file/range bindings, duplicate/ambiguous match and
  truncation handling; content hashes alone grant no authority. Comparison and review correspondence preserve
  immutable endpoint identity and unknown/stale/orphaned states.
- Service restart, timeout and lost response preserve idempotency and reconcile actual owner effects before retry.
  Internal-service architecture grants no public endpoint or independent actor authority; the 31-command schema
  and existing event/storage registration remain unchanged.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d022
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### CV-331 — Qualified Publication And Recovery Envelope Boundaries

```yaml
plan_unit_id: CV-331
unit_type: integration_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Publication, maintenance, export, managed preview and missing-data completion preserve their independent
  effect and evidence scopes. The semantic owners define payloads; Contracts requires typed identity/authorization/result
  references without extending the currently admitted schemas.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- CV-330
- PS-139
- JJI-019
- FGI-016
- FGI-017
- BRS-021
- BRS-022
- SCS-021
- JJI-013
unblocks: []
acceptance_criteria:
- Conflict publication carries a default-block decision and only allows an advanced path with qualified adapter/target
  compatibility and explicit reviewed unresolved-content scope. Conflicted-bookmark resolution preserves all alternatives
  and the exact admitted mutation target.
- Stack workflows bind one explicitly supported provider workflow at a time, exact instance/repository/review/base/revision
  mapping and each effect result. Publication success and review failure remain distinct; unknown effects require
  reconciliation before idempotent retry.
- Additional provider support requires a concrete workflow contract independent of local history, rather than
  assuming native upload capability admits a hosting provider.
- Maintenance references protected recovery scope and Backup capture/GC fence decisions; preview lifecycle records
  cleanup without pretending object writes are a read-only query. Sanitized export identifies reviewed scope,
  redaction disposition and artifact receipt without exposing secrets or raw sensitive paths/content.
- Restore drill results distinguish correctness-critical index rebuild, optional captured-index acceleration,
  missing native dependencies and closure verification. Completion binds separate authorization, remote/credential
  scope, bounded progress/cancellation and remaining missing data; it never implies restore activation or all-history
  completeness from a successful fetch.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d034
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```
