# Shard 030: Guided Tour local focus-route command disposition - 2026-09-01

Source: `Plans/Commands_System.md`

Source lines: L5138-L5189

Source SHA256: `f083fc0c7e53c324e4b735dc7df7db49667b8f504ac8c22329fa3aa4f6274487`

---

## Guided Tour local focus-route command disposition - 2026-09-01

`ui.guided_tour.focus_route` is a typed presentation action, not a semantic
command. It carries `route_target.page_id`, requires the currently mounted
shell router, changes only the visible page and focus, and emits a bounded
local result with `domain_mutation=false` and `persistence_write=false`.
`cmd.nav.focus_route` remains an unadopted migration candidate found in older
route vocabulary. It has no central registration, dispatcher row, handler,
event, receipt family, persistence authority, alias target, or production
wiring row. Guided Tour must not manufacture those surfaces to satisfy a
command census.

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-023, SchemaID:pm.guided_tour.contracts.v1, ContractName:Plans/UI_Command_Catalog.md#UCC-150, ContractName:Plans/Wiring_Matrix.md#WM-049

### CS-072 - Guided Tour focus route stays a typed local action

```yaml
plan_unit_id: CS-072
unit_type: command_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Guided Tour page/focus presentation uses ui.guided_tour.focus_route with a
  typed route_target.page_id and a closed pm.guided_tour.focus_route_result.v1
  no-domain/no-persistence result.
  cmd.nav.focus_route remains unadopted source-lineage and receives no command
  registration, alias, dispatcher, handler, EventRecord, receipt family, or
  production wiring row.
gui_related: true
gui_classification_reason: Governs the visible Guided Tour shell-route control, its unavailable state, and focus behavior.
depends_on: [PWIZ-023, CS-068]
unblocks: [UCC-150, WM-049]
acceptance_criteria:
  - The local action carries route_target.page_id and uses only the mounted shell presentation controller.
  - The action reports unavailable with a keyboard-reachable disabled reason when the shell router is absent.
  - No cmd.nav.focus_route registration, alias, handler, event, persistence write, or production wiring row exists.
  - Static or browser concept evidence is never promoted into native Slint or runtime-handler evidence.
validation_surfaces: [Plans/guided_tour_contracts.schema.json, Plans/guided_tour_contract_fixtures.json, Plans/Wiring_Matrix.production.exclusions.json, Concepts/pm7-tools/verify/guided_tour.mjs]
risk_class: local_presentation_promoted_to_false_domain_command
reasoning_tier: high
context_scope: guided_tour_shell_focus_route
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: guided_tour_local_action_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - Plans/Planning_Wizard.md#PWIZ-023
preserved_exact_tokens: [ui.guided_tour.focus_route, route_target.page_id, pm.guided_tour.focus_route_result.v1, cmd.nav.focus_route, domain_mutation=false, persistence_write=false]
negative_constraints:
  - Do not invent a domain command merely to model local page or focus presentation.
  - Do not claim a native controller or runtime result from the PMConcept7 simulation.
owner_hints: [Plans/Commands_System.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
