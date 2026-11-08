# Shard 035: Neutral Source-Control Primary Registration Completion - 2026-09-02

Source: `Plans/Commands_System.md`

Source lines: L6293-L6390

Source SHA256: `78497da952aa48b2ec176f7c349d573e0dec3893d77203069c3566a124f1cf2a`

---

## Neutral Source-Control Primary Registration Completion - 2026-09-02

Three existing Source Control owner commands already have typed owner contracts, Touch Closure rows, and production-intent wiring, but require explicit concrete central catalog records. This section completes those records without minting new semantics or changing the packet compatibility aliases that target them.

| Command ID | Canonical owner | Sole future handler | Exact request -> result | Current evidence boundary |
|---|---|---|---|---|
| `cmd.source_control.repository.bind` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::repository_bind` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.status.refresh` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::status_refresh` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.workspace.remove` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::workspace_remove` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |

The compatibility spellings `cmd.project.checkout.connect_existing`, `cmd.project.checkout.verify`, and `cmd.project.checkout.remove` continue to normalize before every gate to these primaries. They do not receive peer registrations or handlers.

### CS-077 - Neutral Source-Control Primary Registration Completion

```yaml
plan_unit_id: CS-077
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Repository bind, status refresh, and workspace remove receive concrete central catalog records
  over their existing Source Control owner contracts, sole future handlers, Touch Closure rows, and production-intent
  wiring; compatibility inputs remain unregistered and native evidence remains absent.


  Current projects-refresh contract: One reviewed Project setup binding serves onboarding/New Project/conversion-to-new;
  no generic create or clone wrapper. Preserve all nine historical registration kinds, add owner-verified mounted_existing,
  and native clone plus acquisition provenance for online_import/fork_contribute. Rename changes display name
  only; refresh remains nullable-Project registry read; remove remains list-only and delete_data remains strong
  Storage purge. Inspection is read-only evidence, not a linked origin. Source-location repoint and physical
  move remain distinct. Starters/My starters are file sets; Saved setups are detached own values/things/account
  choices. Preserve FO-22 and live DL-273 service admission, Git/JJ capabilities, exact remote-create/fork
  recovery and all receipt joins. Backups use first-policy absent-key CAS, Standard plus Advanced, archive
  pause and last-good protection. The exact consumer contract is UCC-215/WM-101 and Plans/projects_refresh_command_bindings.json.
  Historical schema/hash/replay resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses
  remain as specified; unavailable handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Source Control, Settings, Project setup, Doctor, and palette/API consumers require
  exact availability, disabled reason, and return behavior for these commands.
depends_on:
- CS-073
- SCS-003
unblocks:
- UCC-155
acceptance_criteria:
- Each exact command appears once in this concrete table with Source Control owner, typed request/result, and
  one sole future handler.
- Existing production-intent and Touch Closure rows remain the only wiring identities; no compatibility source
  receives a peer row or handler.
- Every route remains handler_unavailable and event-silent with "expected_event_types=[]" until executable
  proof and Event Authority admission exist.
- Repository binding, status observation, and workspace removal remain distinct actions with owner-defined
  currentness, permission, data-disposition, and exact-return semantics.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-215; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- Plans/source_control_contracts.schema.json
- Plans/source_control_contract_fixtures.json
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: missing_central_source_control_primary_or_conflated_mutation
reasoning_tier: high
context_scope: neutral_source_control_primary_registration
implementation_surfaces:
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Source_Control_System.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_existing_primary_registration_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Source_Control_System.md#SCS-003
- source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- cmd.source_control.repository.bind
- cmd.source_control.status.refresh
- cmd.source_control.workspace.remove
- handlers::source_control::repository_bind
- handlers::source_control::status_refresh
- handlers::source_control::workspace_remove
- handler_unavailable
- expected_event_types=[]
negative_constraints:
- Do not invent peer compatibility handlers, generic source-control dispatch, automatic removal, or fabricated
  currentness.
- Do not claim native dispatcher, handler, persistence, filesystem, repository, or runtime evidence from static
  registration.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/Commands_System.md
```
