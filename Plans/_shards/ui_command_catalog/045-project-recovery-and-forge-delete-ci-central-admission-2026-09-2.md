# Shard 045: Project Recovery And Forge Delete/CI Central Admission — 2026-09-26

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13295-L13357

Source SHA256: `34e31c82004dfe489d467887335b00cbb112451ae72a6b0b44a5dcccb387e304`

---

## Project Recovery And Forge Delete/CI Central Admission — 2026-09-26

This section admits exactly seven owner-backed primaries into central companions: one Project recovery command from `Plans/Project_System.md#PJCT-007` and six Forge commands from `Plans/Forge_Integrations.md#FGI-021`. The owners remain authoritative for payload shape, permission, availability, errors, lifecycle, persistence, and return settlement; this catalog owns row identity, reverse consumers, and return contracts only. Every row below has exactly one production-intent entry with the same command and sole future target, typed request/result refs, `expected_event_types=[]`, and central response separation; no alias, peer row, or second handler exists for any admitted ID.

All seven rows remain `handler_unavailable` until source-hashed native evidence closes typed availability, permission, receipt/`ObservableWork`, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations. Handler strings, schemas, fixtures, catalog rows, and production-intent rows prove no native dispatcher, handler, effect, or runtime. No EventRecord family is admitted by this batch. Every dispatch projects the central v2 response envelope (`Plans/ui_command_response.schema.json`) for acceptance, pending, and terminal state while the owner typed result remains the separate effect truth per UCC-164, UIW-023, and CV-333; an accepted dispatch, dismissal, or unknown effect never displays successful completion, and a surfaced-but-unregistered consumer still reports `command_not_registered`.

| Command | Label | Owner binding | Sole future handler | Intended GUI consumers / return |
|---|---|---|---|---|
| `cmd.project.resume_creation` | Project Resume Creation | `Plans/Project_System.md#PJCT-007` | `handlers::project::resume_creation` | Projects page; Product Onboarding automatic_preparation recovery (Continue Setup); palette/API; return: Exact resumed Project result, reviewed draft binding, verified repository binding, and caller route/focus/continuation. |
| `cmd.forge.repository.delete` | Forge Repository Delete | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::repository_delete` | Project recovery Delete Repository route; provider-neutral forge workspace; Settings Source Control; palette/API; return: Exact destructive receipt and caller focus. |
| `cmd.forge.pipeline.artifact.download` | Forge Pipeline Artifact Download | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_artifact_download` | Source Control Actions & Pipelines or provider-neutral forge workspace; Settings Source Control; Project setup; palette/API; return: Exact FileSafe destination or artifact-import handoff and caller focus. |
| `cmd.forge.pipeline.secret.set` | Forge Pipeline Secret Set | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_secret_set` | Source Control Actions & Pipelines or provider-neutral forge workspace; Settings Source Control; Project setup; palette/API; return: Exact redacted set receipt without secret values and caller focus. |
| `cmd.forge.pipeline.secret.remove` | Forge Pipeline Secret Remove | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_secret_remove` | Source Control Actions & Pipelines or provider-neutral forge workspace; Settings Source Control; Project setup; palette/API; return: Exact remove receipt and caller focus. |
| `cmd.forge.pipeline.variable.set` | Forge Pipeline Variable Set | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_variable_set` | Source Control Actions & Pipelines or provider-neutral forge workspace; Settings Source Control; Project setup; palette/API; return: Exact set receipt and caller focus. |
| `cmd.forge.pipeline.variable.remove` | Forge Pipeline Variable Remove | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_variable_remove` | Source Control Actions & Pipelines or provider-neutral forge workspace; Settings Source Control; Project setup; palette/API; return: Exact remove receipt and caller focus. |

`cmd.project.resume_creation` consumes `Plans/project_system_contracts.schema.json#/$defs/project_action_request` and `#/$defs/project_action_result`, joined by `#/$defs/creation_recovery_resume_binding` over the retained `#/$defs/project_creation_recovery_context`; the commit read model is `#/$defs/project_setup_commit_binding`. It resumes only verified_created recoveries with the exact reviewed draft, the verified repository binding, a fresh resume-namespaced attempt identity, current Project/registry fences, a revalidated permission snapshot with explicit resume authorization, and remaining-effects-only scope; replaying the original creation key re-observes and never resumes. It is not an alias of `cmd.project.move.resume`, `cmd.project.move.retry`, `cmd.authentication.resume`, or any pipeline retry, which remain other owners' operations. Asynchronous creation paths correlate through `ObservableWork`; the terminal result echoes the exact return context byte-for-byte.

`cmd.forge.repository.delete` consumes `Plans/forge_integration_contracts.schema.json#/$defs/command_request` and `#/$defs/command_result`, with errors in `#/$defs/command_error_record`, permission in `#/$defs/permission_decision`, currentness in `#/$defs/command_currentness`, and confirmation in `#/$defs/confirmation`. It requires exact provider/binding/generation identity, current direct revalidation with `mutation_safety=verified`, effective authority, `remote_side_effect` permission with a human actor, verified-create result and receipt refs, and fresh target-bound human confirmation. An `effect_unknown` outcome admits only reconciliation-only retry through SCS-016; delete is never automatic rollback, part of any resume, speculative while unknown, on provider-scope reuse, or authorized by selected-source authentication.

`cmd.forge.pipeline.artifact.download` consumes the same Forge request/result/error/permission/currentness/confirmation refs. It is AutomationBinding-scoped with expected automation-binding generation, exact run, job where applicable, provider artifact, `RemoteArtifact` record, and expected digest identity, and requires `local_mutation` permission, target-bound confirmation, `ObservableWork`, and an explicit `download` or `import` disposition: download writes bytes to an exact FileSafe destination, import delivers them through an exact artifact-import handoff, and both never auto-execute. A CI artifact target is never a release asset target and the `release_assets` capability never authorizes a CI download; `cmd.forge.release.asset.download` remains separate.

`cmd.forge.pipeline.secret.set`, `cmd.forge.pipeline.secret.remove`, `cmd.forge.pipeline.variable.set`, and `cmd.forge.pipeline.variable.remove` consume the same Forge request/result/error/permission/currentness/confirmation refs. They are AutomationBinding-scoped with exact setting name and settings scope, require `remote_side_effect` permission and target-bound confirmation, and never return secret values. Secret set carries a one-use protected human-broker ref and no inline secret bytes; secret operations require a human actor; variable set carries a plain non-secret value that passes the secret scan. The FGI-015 hosted-administration matrix gates each area's read/write independently, and provider settings surfaces consume these generic commands with provider nouns inside the generic `repository_automation` shell; no provider-specific peer namespace is created.

Recovery reverse consumers reuse Forge owner routes, never Project-local mutation: Continue Setup dispatches `cmd.project.resume_creation`; Open Repository dispatches the existing `cmd.forge.repository.open_in_browser` on the verified binding only, mutating nothing; Delete Repository dispatches `cmd.forge.repository.delete` as separate explicit destructive intent. The existing `cmd.forge.pipeline.open_in_browser` row keeps its FGI-010 binding while FGI-021 refines its exact `official_destination_kind` with three values: `automation_run_artifacts` binds the exact automation run (immutable `automation_run_id` plus the pipeline/definition identity, with job where applicable) behind `Open artifacts in service`, `hosted_service_settings` binds the exact service settings scope (non-null `hosted_setting_scope_ref`) behind `Open service settings` with no run identity, and `automation_service_overview` binds the selected automation service overview with its exact `AutomationBinding` behind the first-card `Open in <provider>` action with neither run nor scope identity. The allowed official-page origin comes from the provider instance profile `web_base_url`, which may differ from the API host `api_root`; the handoff allowed origin and route equal the profile-approved official UI destination for the selected instance/tenant, never the normalized API/transport host by equation; run and settings identities are never conflated and no run, scope, or origin is fabricated. The generic `Connect automation` control names no configured service and dispatches no pipeline request: it is existing local setup/navigation intent, not a malformed `cmd.forge.pipeline.open_in_browser`.

The Commands & Shortcuts local action census remains in repair and gains no row in this batch; a later task admits it. No other command, alias, EventRecord family, native handler, or runtime is admitted here.

### UCC-165 - Project Recovery And Forge Delete/CI Central Admission

```yaml
plan_unit_id: UCC-165
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The 2026-09-26 central admission registers exactly seven primaries -- cmd.project.resume_creation from PJCT-007 and six Forge commands from FGI-021 -- each with one owner binding, one typed request/result/error contract set, one sole future handler, handler_unavailable projection, expected_event_types=[], central response separation, and complete reverse consumers with exact return; recovery open/delete routes reuse Forge owner routes and Commands & Shortcuts local actions were outside that seven-primary batch; UCC-166 now admits their distinct local-action consumers without additional primaries.
gui_related: true
gui_classification_reason: These rows are the reverse-consumer identity for recovery Continue Setup, Delete Repository, CI artifact download/import, hosted secret/variable administration, and official-service navigation controls.
depends_on: [UCC-164, PJCT-007, FGI-021]
unblocks: [WM-058]
acceptance_criteria:
  - All seven IDs appear exactly once in the admission table with label, owner binding, sole future handler, and intended consumers with exact return.
  - Each ID has exactly one production-intent row with the same command and sole target, typed request/result refs, expected_event_types=[], and central response separation.
  - Every named consumer reads typed availability and disabled reason, renders handler_unavailable until native evidence, and returns to the exact initiating route/focus/continuation.
  - Recovery open/delete dispatch through Forge owner routes only; no Project-local mutation, peer row, alias, or second handler exists for any admitted ID.
  - Commands & Shortcuts local actions gain no row here; no EventRecord, native handler, or runtime is claimed.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-plan-index.py validate]
risk_class: central_admission_alias_collision_or_simulated_success
reasoning_tier: high
context_scope: project_recovery_forge_delete_ci_central_admission
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_command_catalog_registration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Project_System.md#PJCT-007, Plans/Forge_Integrations.md#FGI-021, Plans/project_system_contracts.schema.json#x-project-recovery-command-contract, reports/packet-integration-completion-20260926/project-recovery.md]
preserved_exact_tokens: [cmd.project.resume_creation, cmd.forge.repository.delete, cmd.forge.pipeline.artifact.download, cmd.forge.pipeline.secret.set, cmd.forge.pipeline.secret.remove, cmd.forge.pipeline.variable.set, cmd.forge.pipeline.variable.remove, handlers::project::resume_creation, handlers::forge::repository_delete, handlers::forge::pipeline_artifact_download, handlers::forge::pipeline_secret_set, handlers::forge::pipeline_secret_remove, handlers::forge::pipeline_variable_set, handlers::forge::pipeline_variable_remove, handler_unavailable, "expected_event_types=[]", command_not_registered, creation_recovery_resume_binding, project_creation_recovery_context, ObservableWork, FileSafe, one-use protected human-broker ref, official_destination_kind, automation_run_artifacts, hosted_service_settings, automation_service_overview, automation_run_id, hosted_setting_scope_ref, AutomationBinding, "Open artifacts in service", "Open service settings", "Open in <provider>", download, import]
negative_constraints:
  - Do not create a second catalog row, peer control, or alternate handler for any admitted ID.
  - Do not claim a native dispatcher, handler, rendered control, receipt, event, or runtime from static registration.
  - Do not admit Commands & Shortcuts local actions or any EventRecord in this batch.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Project_System.md, Plans/Forge_Integrations.md]
owner_boundary_notes: [Project System owns resume semantics and recovery joins; Forge owns delete/CI semantics and official destinations; this catalog owns central row identity, reverse consumers, and return contracts only.]
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/Forge_Integrations.md#FGI-021, ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/ui_command_response.schema.json
