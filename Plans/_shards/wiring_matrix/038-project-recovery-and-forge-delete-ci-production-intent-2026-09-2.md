# Shard 038: Project Recovery And Forge Delete/CI Production Intent — 2026-09-26

Source: `Plans/Wiring_Matrix.md`

Source lines: L4891-L4927

Source SHA256: `f9af971e0328db881e9488ebbabbf57685cc317d6b0a5a21c3d468e26247c799`

---

## Project Recovery And Forge Delete/CI Production Intent — 2026-09-26

`Plans/Wiring_Matrix.production.json` carries one production-intent row for each of the seven UCC-165 primaries: `catalog.project_resume_creation` for `cmd.project.resume_creation`, and `catalog.forge_repository_delete`, `catalog.forge_pipeline_artifact_download`, `catalog.forge_pipeline_secret_set`, `catalog.forge_pipeline_secret_remove`, `catalog.forge_pipeline_variable_set`, `catalog.forge_pipeline_variable_remove` for the six FGI-021 commands. Each row names the exact owner request/result refs, the one sole future handler from the PJCT-007 or FGI-021 table, typed state/disabled-reason selectors, receipt-only effects with `expected_event_types=[]`, accessibility, deterministic return, and future-evidence requirements. The existing `catalog.forge_pipeline_open_in_browser` row keeps its FGI-010 binding and adds the FGI-021 exact `official_destination_kind` with three values: `automation_run_artifacts` binds the exact automation run (immutable `automation_run_id` plus the pipeline/definition identity, with job where applicable) behind `Open artifacts in service`, `hosted_service_settings` binds the exact service settings scope (non-null `hosted_setting_scope_ref`) behind `Open service settings` with no run identity, and `automation_service_overview` binds the selected automation service overview with its exact `AutomationBinding` behind the first-card `Open in <provider>` action with neither run nor scope identity. The allowed official-page origin resolves from the provider instance profile `web_base_url`, which may differ from the API host `api_root`; the handoff's allowed origin and route match the instance/tenant profile-approved official UI origin and route reference; the API host is not an official UI-origin equality constraint. The generic `Connect automation` control names no configured service and dispatches no pipeline request: it is existing local setup/navigation intent, not a malformed `cmd.forge.pipeline.open_in_browser`.

Every row inherits the one production-root `response_contract_ref` while its typed owner result stays separate per UIW-023: the central v2 envelope projects acceptance, pending, and terminal state, and dispatch acceptance is never completion. All rows remain static production intent and `handler_unavailable` until source-hashed native dispatcher and handler evidence exists. Recovery reverse consumers dispatch Continue Setup through `cmd.project.resume_creation`, Open Repository through the existing `cmd.forge.repository.open_in_browser`, and Delete Repository through `cmd.forge.repository.delete`; neither open nor delete is Project-local mutation. Denominators are the ones `scripts/pm-touch-closure-verify.py` reports and are not frozen here. The Commands & Shortcuts local action census gains no production row in this batch.

### WM-058 - Project Recovery And Forge Delete/CI Production Intent

```yaml
plan_unit_id: WM-058
unit_type: production_wiring
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: The seven UCC-165 primaries each have exactly one production-intent row with the exact owner request/result refs, one sole future handler, expected_event_types=[], central response separation, and complete reverse consumers with exact return; the pipeline open_in_browser row carries the exact automation-run versus hosted-settings destination kind with provider-profile origin resolution, and recovery open/delete reuse Forge owner routes.
gui_related: true
gui_classification_reason: Production rows bind recovery, delete, CI artifact, secret/variable, and official-service controls to availability, disabled reasons, dispatch targets, results, accessibility, and return routes.
depends_on: [WM-051, UCC-165, UIW-023]
unblocks: []
acceptance_criteria:
  - Each of the seven commands has exactly one production entry keyed catalog.<suffix> with the same command and sole target as its catalog row.
  - Every new row validates against Plans/Wiring_Matrix.schema.json with typed request/result refs, state/disabled-reason selectors, receipt-only effects, expected_event_types=[], accessibility, and the four required evidence kinds.
  - The open_in_browser row requires exactly one official_destination_kind, never conflates run and settings identities, and resolves the allowed origin from the provider instance profile web_base_url.
  - Recovery open/delete dispatch through Forge owner routes only; no Project-local mutation row exists for either.
  - All rows remain handler_unavailable static intent; no EventRecord, native handler, or runtime is claimed, and no literal denominator is carried here.
validation_surfaces: [Plans/Wiring_Matrix.production.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py --json]
risk_class: production_intent_wiring_and_claim_boundary
reasoning_tier: high
context_scope: project_recovery_forge_delete_ci_production_intent
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: production_intent_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/UI_Command_Catalog.md#UCC-165, Plans/Project_System.md#PJCT-007, Plans/Forge_Integrations.md#FGI-021]
preserved_exact_tokens: [catalog.project_resume_creation, catalog.forge_repository_delete, catalog.forge_pipeline_artifact_download, catalog.forge_pipeline_secret_set, catalog.forge_pipeline_secret_remove, catalog.forge_pipeline_variable_set, catalog.forge_pipeline_variable_remove, official_destination_kind, automation_run_artifacts, hosted_service_settings, automation_service_overview, automation_run_id, hosted_setting_scope_ref, AutomationBinding, "Open in <provider>", handler_unavailable, "expected_event_types=[]"]
negative_constraints: [Do not claim native runtime implementation from static wiring., Do not register an event without Event Authority., Do not restore a literal actionable-primary or production-entry count; those denominators belong to scripts/pm-touch-closure-verify.py., Do not admit Commands & Shortcuts local actions in this batch.]
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-165, ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/Forge_Integrations.md#FGI-021
