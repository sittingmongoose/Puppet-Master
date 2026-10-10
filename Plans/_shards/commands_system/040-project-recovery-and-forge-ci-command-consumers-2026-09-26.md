# Shard 040: Project recovery and Forge CI command consumers (2026-09-26)

Source: `Plans/Commands_System.md`

Source lines: L6807-L6877

Source SHA256: `675134f8f3a9b0f190562f18a68e18437407e488fd3b9f0bfad155729112a3b3`

---

## Project recovery and Forge CI command consumers (2026-09-26)

This companion consumes UCC-165 and WM-058 without adding another primary or handler. All seven routes project `handler_unavailable` until native evidence; `expected_event_types=[]` remains receipt-only. The central UICommand response consumes CV-333 while the typed owner result remains effect truth.

| Primary | Semantic owner | Sole future handler | Request → result |
|---|---|---|---|
| `cmd.project.resume_creation` | `Plans/Project_System.md#PJCT-007` | `handlers::project::resume_creation` | `Plans/project_system_contracts.schema.json#/$defs/project_action_request` → `Plans/project_system_contracts.schema.json#/$defs/project_action_result` |
| `cmd.forge.repository.delete` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::repository_delete` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.forge.pipeline.artifact.download` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_artifact_download` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.forge.pipeline.secret.set` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_secret_set` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.forge.pipeline.secret.remove` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_secret_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.forge.pipeline.variable.set` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_variable_set` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |
| `cmd.forge.pipeline.variable.remove` | `Plans/Forge_Integrations.md#FGI-021` | `handlers::forge::pipeline_variable_remove` | `Plans/forge_integration_contracts.schema.json#/$defs/command_request` → `Plans/forge_integration_contracts.schema.json#/$defs/command_result` |

Project recovery uses a fresh authorized attempt bound to the retained recovery, original operation/result, reviewed draft, verified repository and fenced remaining effects; original-key replay observes only. Open Repository remains the existing Forge browser route; Delete Repository is a separate target-confirmed Forge action and never rollback or resume. Unknown remote effects permit reconciliation only. CI artifacts bind exact AutomationBinding/run/artifact identity and a FileSafe download or explicit import destination, never execution. Hosted secret/variable actions bind exact service scope and current area capability/permission; protected secret handoff never exposes secret bytes. All routes retain their exact caller return context and owner-disabled reasons.

### CS-082 - Project Recovery And Forge CI Command Consumers

```yaml
plan_unit_id: CS-082
unit_type: integration_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Commands System consumes the seven UCC-165 primaries through their sole Project or Forge
  owner handler and typed request/result contract. Recovery is a fresh authorized, fenced
  attempt over retained original evidence and remaining effects; original replay never resumes.
  Forge deletion is separately confirmed, CI downloads have exact run/artifact/FileSafe scope,
  and hosted administration consumes area-specific capability and protected secret handoff.
  All routes retain handler_unavailable until native evidence and expected_event_types=[];
  CV-333 central response projection never replaces owner effect truth.
gui_related: true
gui_classification_reason: Recovery and CI controls consume the central command identities and exact owner return states.
depends_on: [PJCT-007, FGI-021, UCC-165, WM-058]
unblocks: []
acceptance_criteria:
  - Every primary in the companion table has the same sole handler and typed request/result refs as UCC-165 and its production wiring row.
  - Recovery replay, fresh resume, separately confirmed deletion, CI artifact delivery and protected hosted administration retain their owning contracts.
  - Static registration confers no native handler, effect, event or readiness proof.
validation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/project_system_contracts.schema.json, Plans/forge_integration_contracts.schema.json]
risk_class: consumer_route_drift_or_false_effect
reasoning_tier: high
context_scope: project_recovery_forge_ci_command_consumers
implementation_surfaces: [Plans/Commands_System.md]
node_compile_hint: {mode: static_command_consumer_contract_only, create_worknodes: false}
source_lineage: [Plans/UI_Command_Catalog.md#UCC-165, Plans/Wiring_Matrix.md#WM-058]
preserved_exact_tokens:
  - cmd.project.resume_creation
  - handlers::project::resume_creation
  - cmd.forge.repository.delete
  - handlers::forge::repository_delete
  - cmd.forge.pipeline.artifact.download
  - handlers::forge::pipeline_artifact_download
  - cmd.forge.pipeline.secret.set
  - handlers::forge::pipeline_secret_set
  - cmd.forge.pipeline.secret.remove
  - handlers::forge::pipeline_secret_remove
  - cmd.forge.pipeline.variable.set
  - handlers::forge::pipeline_variable_set
  - cmd.forge.pipeline.variable.remove
  - handlers::forge::pipeline_variable_remove
  - handler_unavailable
  - "expected_event_types=[]"
negative_constraints:
  - Do not create duplicate primaries, handlers or Project-local repository deletion.
  - Do not grant permission or capability from a visible control or selected-source sign-in.
  - Do not claim native dispatch, authenticated result lookup, runtime effects or EventRecords.
owner_hints: [Plans/Project_System.md, Plans/Forge_Integrations.md, Plans/UI_Command_Catalog.md]
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-007, ContractName:Plans/Forge_Integrations.md#FGI-021, ContractName:Plans/UI_Command_Catalog.md#UCC-165, ContractName:Plans/Contracts_V0.md#CV-333
