# Shard 026: Cross-owner Product Onboarding and Settings consumer catalog addendum - 2026-09-01

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10953-L11210

Source SHA256: `e90c2d9e9cd4dd77d91979cf6ed178eb6f9bf117ad4dbda3dbf62a060fe35af9`

---

## Cross-owner Product Onboarding and Settings consumer catalog addendum - 2026-09-01

This catalog consumes the packet-owner semantics registered by CS-070. The `Sole specified target` values
are dispatch destinations only; every new row remains disabled with `handler_unavailable` until a native
dispatcher and handler are evidenced. All rows use their exact `state.commands.<id>.availability` and
`.disabled_reason` projections, keyboard/pointer parity, deterministic focus return, a typed owner result,
and receipt/projection-only effects with an empty EventRecord set.

| Command ID | Label | Owner request -> result | Sole specified target | Visible reverse consumers |
|---|---|---|---|---|
| `cmd.source_control.repository.clone` | Clone Git Repository | `source_control_command_request` -> `source_control_command_result` | `handlers::source_control::repository_clone` | Product Onboarding first-project branch; Settings SCM/Origin manager |
| `cmd.jujutsu.git.clone` | Clone with Jujutsu | `command_request` -> `command_result` | `handlers::jujutsu::git_clone` | Product Onboarding first-project branch; Settings SCM/Origin manager |
| `cmd.restore.preview` | Preview Restore | `backup_restore_command_request` -> `backup_restore_command_result` | `handlers::backup_restore::preview_restore` | Product Onboarding restore branch; Settings Backup/Restore manager; Doctor recovery route |
| `cmd.server.connect` | Connect Server | `command_payload` -> `command_result` | `handlers::server::connect` | Product Onboarding discovered/known Server branch; Settings Server manager; Doctor connectivity route |
| `cmd.server.bootstrap.start` | Start Server Bootstrap | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::server::bootstrap_start` | Product Onboarding post-claim standalone/container branch; Settings Server manager |
| `cmd.client.pair.start` | Start Client Pairing | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::start` | Product Onboarding pairing methods; Settings paired-clients manager |
| `cmd.client.pair.approve` | Approve Pairing | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::approve` | Settings pairing-request detail; Product Onboarding exact owner return |
| `cmd.client.pair.reject` | Reject Pairing | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::reject` | Settings pairing-request detail; Product Onboarding exact owner return |
| `cmd.client.pair.cancel` | Cancel Pairing | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_pairing::cancel` | Settings pairing-progress detail; Product Onboarding exact owner return |
| `cmd.client.revoke` | Revoke Client Trust | `supplemental_command_payload` -> `supplemental_command_result` | `handlers::client_trust::revoke` | Settings paired-client detail; Doctor trust remediation route |

The three existing Project rows now bind exactly to
`Plans/project_system_contracts.schema.json#/$defs/project_action_request` and
`#/$defs/project_action_result`. Their payload/result coverage includes stable Project, Server, Source
Location, repository, revision/generation/hash, receipt, and byte-exact caller
surface/route/focus/invocation/continuation context. Closing the Product Onboarding modal returns focus and
does not cancel dispatched owner work.

The three existing Authentication rows continue to use the shared-runtime request/result definitions and
sole `handlers::authentication::*` targets. Protected-auth start, cancel, and resume require the exact
initiating Client/session generation, same authentication operation/revision, protected session and return
target, continuation where applicable, and a redacted cancel/timeout/success disposition. No fallback
Client, protected content, capture, recording, persistence, or caller navigation is allowed.

`cmd.server.reconnect`, `cmd.server.resume`, `cmd.git.clone`, `cmd.scm.clone`, `cmd.project.clone`,
`cmd.project.jj_clone`, `cmd.client.pair.qr.import`, and `cmd.server.peer_candidate.select` receive no
catalog row or alias. Remote Access retains its visible adapter IDs while routing the same protected
operation through `cmd.authentication.start|resume|cancel`; it owns no parallel auth lifecycle.

ContractRef: ContractName:Plans/Commands_System.md#CS-070, ContractName:Plans/Project_System.md, ContractName:Plans/Server_System.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Wiring_Matrix.md

### UCC-148 - Exact owner command rows and reverse consumer routes

```yaml
plan_unit_id: UCC-148
unit_type: command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The UI catalog adds exactly ten owner-backed command rows for ordinary Git clone, Jujutsu clone,
  restore preview, Server connect/bootstrap, pairing start/approve/reject/cancel, and Client trust
  revocation; strengthens the existing Project and shared Authentication rows; and enumerates every
  PMConcept7, Settings, Onboarding, and Doctor reverse consumer. Every specified handler target remains a
  contract target rather than implementation evidence and is unavailable until native proof exists.
gui_related: true
gui_classification_reason: Registers the labels, disabled behavior, exact return, accessibility, and reverse routes for visible setup and management controls.
depends_on: [UCC-147, CS-070]
unblocks: [WM-047]
acceptance_criteria:
  - The ten new command IDs each have one catalog row, one owner request/result pair, one specified target, one availability selector, and all intended GUI consumers.
  - Existing Project and Authentication rows are strengthened in place; no duplicate primary identities or handlers are created.
  - Product Onboarding remains typed local choreography and dispatches owner commands directly without a cmd.onboarding namespace.
  - Clone families, Server connection modes, pairing methods, and protected-auth lifecycle remain semantically distinct exactly as their owners require.
  - Disabled controls announce the exact owner reason including handler_unavailable; caller/modal close does not silently cancel owner work.
  - No rejected alias or unregistered EventRecord is admitted, and static/browser evidence is not native-runtime proof.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: catalog_or_reverse_route_gap
reasoning_tier: high
context_scope: cross_owner_product_onboarding_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/onboarding_cinematic_source.py, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: cross_owner_catalog_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-070
  - scratchpad/pm-integration-20260831/authority-repairs/central-owner-merge/merged-central-owner-delta-manifest.json
preserved_exact_tokens: [cmd.source_control.repository.clone, cmd.jujutsu.git.clone, cmd.restore.preview, cmd.server.connect, cmd.server.bootstrap.start, cmd.client.pair.start, cmd.client.pair.approve, cmd.client.pair.reject, cmd.client.pair.cancel, cmd.client.revoke, handler_unavailable]
negative_constraints:
  - Do not add rejected aliases or concept-local owner commands.
  - Do not interpret a catalog target as a native handler claim.
  - Do not route protected authentication to a fallback Client or expose protected content.
  - Do not omit a GUI reverse consumer or exact focus-return route.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Wiring_Matrix.md]
```

### UCC-140 - Orchestrator Run-Control Trio Catalog Registration

```yaml
plan_unit_id: UCC-140
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.run.resume, cmd.run.view_log, and cmd.run.stop are registered in this
  catalog per Plans/Commands_System.md §7.3 with availability class selection,
  confirmation two_step on cmd.run.stop and none on the other two rows, and
  disabled-reason subsets drawn only from the §7.3 closed set. The registration
  resolves the dangling cmd.run.* references from Plans/FinalGUISpec.md's
  run_interrupted CTA card. Run lifecycle semantics remain owned by
  Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md (referenced, never
  restated).
gui_related: true
gui_classification_reason: The trio backs the visible run_interrupted CTA card primary and secondary actions and the run log reveal.
depends_on: [UCC-139]
unblocks: []
acceptance_criteria:
  - cmd.run.resume, cmd.run.view_log, and cmd.run.stop each appear exactly once in the adjudication table and exactly once in the registration tables above, with owner orchestrator_runs.
  - All three rows declare availability class selection; cmd.run.stop carries confirmation class two_step and the other two carry none.
  - Disabled reasons on the three rows come only from the closed set stale_projection, permission_required, unreachable.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: orchestrator_run_control_trio_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (Run & Debug Revival Addendum §7.3, CS-064; referenced)"
  - "Plans/FinalGUISpec.md (run_interrupted CTA card contract row; referenced)"
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate run lifecycle semantics here; Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md own run lifecycle canon.
  - Do not mint additional cmd.run.* ids in this unit or its tables.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### UCC-141 - Debug Family Wiring Re-Home Record

```yaml
plan_unit_id: UCC-141
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The ten cmd.debug.* production wiring rows (catalog.debug_start,
  catalog.debug_stop, catalog.debug_pause, catalog.debug_resume,
  catalog.debug_add_breakpoint, catalog.debug_remove_breakpoint,
  catalog.debug_clear_breakpoints, catalog.debug_view_evidence, catalog.debug_step,
  catalog.debug_collect_snapshot) are re-homed in Plans/Wiring_Matrix.production.json
  from the Run & Debug > Debug controls location to the assistant Debug Mode
  investigation surface, with the matrix edited in the same wave as this addendum.
  cmd.debug.* semantics are unchanged and remain owned by Plans/Commands_System.md
  §7.1; the CS-009 boundary is satisfied because classical debugger dispatch uses
  only cmd.run_debug.*. Terminology follows Plans/FinalGUISpec.md F3-495
  (referenced).
gui_related: true
gui_classification_reason: Records which user-visible surface the assistant Debug Mode investigation controls are wired to.
depends_on: [UCC-139, UCC-077]
unblocks: []
acceptance_criteria:
  - All ten catalog.debug_* wiring rows are recorded as re-homed to the assistant Debug Mode investigation surface; no row changes its ui_command_id or handler contract.
  - cmd.debug.* remains scoped to assistant-thread investigation control per CS-009 and Commands_System §7.1; no cmd.debug.* id is re-registered as a classical debugger dispatch id.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: debug_family_wiring_rehome_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (§7.1 debug dispatch family, CS-009 boundary; referenced)"
  - "Plans/FinalGUISpec.md (F3-495 terminology; referenced)"
preserved_exact_tokens:
  - cmd.debug.*
  - catalog.debug_start
  - catalog.debug_view_evidence
  - cmd.run_debug.*
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate or re-scope cmd.debug.* semantics; Plans/Commands_System.md §7.1 owns them unchanged.
  - Do not edit Wiring_Matrix.production.json or Wiring_Matrix.md from this unit; the matrix re-home is recorded here and owned by the wiring matrix editors.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### UCC-142 - Debug Investigation Verification and Cleanup Catalog Registration

```yaml
plan_unit_id: UCC-142
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.debug.record_verification and cmd.debug.run_cleanup are registered with the
  per-row availability, confirmation, and disabled-reason metadata in the table above,
  extending the cmd.debug.* investigation family per Plans/Commands_System.md §7.4 and
  closing the §1.0B verification-recording and cleanup-dispatch holes found in the
  2026-07-27 assistant Debug Mode gap audit. Plans/Commands_System.md §7.4 owns family
  semantics (referenced); the catalog remains the row-level metadata owner per the
  existing catalog/Commands boundary.
gui_related: true
gui_classification_reason: Verification recording and cleanup dispatch surface as investigation banner/header controls in Assistant Chat's Debug Mode overlay.
split_recommended: false
depends_on: [UCC-141, UCC-077]
unblocks: []
acceptance_criteria:
  - Both rows resolve in this catalog with command_kind, availability, confirmation, disabled_reasons, and owner metadata matching Plans/Commands_System.md §7.4.
  - cmd.debug.run_cleanup carries confirmation class two_step and dispatches only through the shared confirm surface.
  - Disabled reasons for both rows come only from the closed set: stale_projection, phase_not_reached, preservation_hold_active.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: debug_investigation_verification_cleanup_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/assistant-chat-design.md (§1.0B closed debug phase model; verification/cleanup phases)"
preserved_exact_tokens:
  - cmd.debug.record_verification
  - cmd.debug.run_cleanup
  - verification_recorded
  - preservation_hold_active
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate Plans/Commands_System.md §7.4 semantics beyond row-level metadata fields.
  - Do not re-scope these ids to classical DAP debugging; cmd.run_debug.* remains the sole classical namespace (CS-009).
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/Commands_System.md §7.1/§7.4 own cmd.debug.* family semantics; this unit owns only catalog row metadata for the verification/cleanup pair."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```
