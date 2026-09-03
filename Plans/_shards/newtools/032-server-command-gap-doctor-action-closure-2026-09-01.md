# Shard 032: Server command-gap Doctor action closure (2026-09-01)

Source: `Plans/newtools.md`

Source lines: L8866-L8923

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## Server command-gap Doctor action closure (2026-09-01)

Doctor remains a registry/router/projection owner, not the owner of every diagnostic domain. `Plans/doctor_contracts.schema.json` therefore owns one DRY `DoctorReportExportRequest|DoctorReportExportResult|DoctorReportExportCommandError|DoctorReportExportCommandAvailability|DoctorReportExportDisabledReason|DoctorReportExportPermissionDecision` family for the one genuine Doctor command, and the shared `doctor_action_request|doctor_action_result` pair for six typed local actions.

| Row / packet line | Disposition | Exact retained semantic |
|---|---|---|
| 42 / `machine/command_census.json:492` | reject `cmd.doctor.cancel` | Closing Doctor only detaches the viewer and must not cancel owner `ObservableWork`. Cancellation remains the exact semantic-owner action when that owner exposes it. No Doctor cancel command or handler is registered. |
| 43 / `machine/command_census.json:498` | `cmd.doctor.copy_diagnostics` -> `ui.doctor.copy_diagnostics` | Copy only the currently hydrated, bounded, redacted diagnostics projection. |
| 44 / `machine/command_census.json:504` | `cmd.doctor.export_report` -> `handlers::doctor_report::export_report` | Build one bounded, redacted report projection and export that exact artifact through the Doctor report contract; never reinterpret it as a Project FileManager copy-out request. |
| 45 / `machine/command_census.json:510` | `cmd.doctor.open` -> `ui.doctor.open` | Open the exact local Doctor surface/projection and restore typed return/focus context without unrelated owner work. |
| 46 / `machine/command_census.json:516` | `cmd.doctor.open_finding` -> `ui.doctor.open_details` | Open the exact current finding and preserve focus/currentness return context. |
| 47 / `machine/command_census.json:522` | `cmd.doctor.open_owner` -> `ui.doctor.open_remediation` | Navigate to the exact semantic-owner remediation and update only from a fresh owner result. |
| 48 / `machine/command_census.json:528` | `cmd.doctor.refresh` -> `ui.doctor.refresh_visible` | Refresh the bounded visible projection under cache, deadline, and resource-governor rules. |
| 49 / `machine/command_census.json:534` | reject `cmd.doctor.run_all` | An unbounded global sweep conflicts with cached-first, relevance-scoped, resource-governed scheduling. Use `ui.doctor.refresh_visible` or exact `ui.doctor.run_check`; no command or handler is registered. |
| 50 / `machine/command_census.json:540` | `cmd.doctor.run_check` -> `ui.doctor.run_check` | Run one exact bounded check through its domain owner and replace state only from a fresh owner result. |

The six `ui.doctor.*` rows have typed request/result records, but no Doctor semantic-domain handler and no domain EventRecord. A local controller may route `run_check` or `open_remediation` to an already-admitted exact semantic-owner operation; that owner result remains the only mutation/truth evidence. Local results are bounded and redacted, preserve exact currentness/focus/return context, and cannot claim owner success from navigation, focus, cache, or stale state.

The exact GUI consumers for the export and all six local actions are Settings > Doctor and Doctor finding/detail/return surfaces.

`cmd.doctor.export_report` has exactly one future handler, `handlers::doctor_report::export_report`, and remains `handler_unavailable` until central registration, schema binding, permission/FileSafe/export-destination policy, production wiring, and receipt-or-separately-admitted-event disposition are proved. Export uses `ObservableWork`, exact idempotency/currentness, bounded selection, mandatory redaction, exact artifact digest/readback, and exact return. Raw secrets, protected authentication content, unrestricted paths, stale hydrated projections, FileManager copy-out substitution, restart/race ambiguity, or unknown effects fail closed.

The packet source base for every line above is `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14.zip.contents/PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/machine/command_census.json`; the schema preserves every complete `packet_source_ref`, rejection reason, and intended semantic byte-for-byte.

### N2-155 - Doctor Report Command, Local Actions, And Explicit Rejections

```yaml
plan_unit_id: N2-155
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: >-
  Doctor owns one exact bounded redacted report-export command through one closed request/result/error/availability/
  disabled/permission family, six typed local projection/router actions, and explicit rejections for Doctor cancel and
  unbounded run-all. Export remains handler_unavailable until its sole native handler and complete central integration
  exist; local actions and rejected spellings create no Doctor semantic-domain handler or domain EventRecord.
gui_related: true
gui_classification_reason: Doctor open/details/copy/refresh/run/remediation/export availability, focus, blockers, and return behavior are user-visible.
depends_on: [N2-152, N2-153]
unblocks: []
acceptance_criteria:
  - The owner schema and fixtures cover exactly one command, six typed local actions, and two rejected rows from adjudication rows 42-50.
  - Export binds only handlers::doctor_report::export_report and remains handler_unavailable without exact native integration evidence.
  - Local actions have typed request/results, no Doctor semantic-domain handler, no domain EventRecord, bounded redaction, currentness, accessibility, and exact return.
  - cmd.doctor.cancel and cmd.doctor.run_all stay unregistered with their exact replacement/reason dispositions.
  - Permission/FileSafe, idempotency, restart/race, security/redaction, unknown-effect, and exact-return negatives fail closed.
validation_surfaces: [Plans/doctor_contracts.schema.json, Plans/doctor_contract_fixtures.json, focused Server owner-bundle-B validator]
risk_class: doctor_router_authority_or_unbounded_probe_sweep
reasoning_tier: high
context_scope: server_command_gap_doctor
implementation_surfaces: [Plans/newtools.md, Plans/doctor_contracts.schema.json, future Doctor report export native handler]
node_compile_hint: {mode: doctor_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-42-50]
negative_constraints:
  - Do not cancel semantic-owner work by closing or detaching Doctor.
  - Do not admit an unbounded Doctor run-all sweep.
  - Do not interpret local routing/navigation or static fixture state as owner success.
```
