# Shard 025: Guided Tour local focus-route catalog disposition - 2026-09-01

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12953-L13008

Source SHA256: `86ed1901070fb341ea2d4bed7d884b4207e77e828bde1c6466056b6c35cb221f`

---

## Guided Tour local focus-route catalog disposition - 2026-09-01

Guided Tour's `Open Usage` action during workspace practice binds to
`ui.guided_tour.focus_route`, a closed typed local action carrying
`route_target.page_id=usage`. The local controller checks the mounted shell
router, moves only visible page/focus state, and returns the closed
`pm.guided_tour.focus_route_result.v1` no-domain/no-persistence result. When unavailable, the control remains keyboard
focusable with `aria-disabled=true`, its exact reason, and the shared themed
hover tag; activation dispatches nothing.

The historical `cmd.nav.focus_route` token is an optional migration candidate,
not an adopted alias or catalog identity. It is recorded in
`Plans/Wiring_Matrix.production.exclusions.json` and has no primary catalog
row, fake `handlers::nav::focus_route` target, or production wiring row.

ContractRef: ContractName:Plans/Commands_System.md#CS-072, ContractName:Plans/Planning_Wizard.md#PWIZ-023, SchemaID:pm.guided_tour.focus_route_result.v1, ContractName:Plans/Wiring_Matrix.md#WM-049

### UCC-150 - Guided Tour focus route is catalog-external local presentation

```yaml
plan_unit_id: UCC-150
unit_type: command_disposition
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  ui.guided_tour.focus_route is a typed local presentation action with
  route_target.page_id, mounted-router availability, accessible disabled
  reason, and the exact pm.guided_tour.focus_route_result.v1 no-domain/no-persistence result. cmd.nav.focus_route is
  an unadopted migration candidate with no catalog registration, alias,
  handler, EventRecord, or production wiring row.
gui_related: true
gui_classification_reason: Binds the visible Guided Tour route control to its exact local action and accessible unavailable behavior.
depends_on: [CS-072, PWIZ-023, UCC-147]
unblocks: [WM-049]
acceptance_criteria:
  - The Guided Tour control binds exactly the typed local action ui.guided_tour.focus_route through the Guided Tour owner, with no domain-command binding or dispatch.
  - route_target.page_id is required by the closed action schema.
  - Missing router state remains focusable with aria-disabled=true, described, hover-bound, and non-activating.
  - cmd.nav.focus_route is exclusions-only and absent from the production matrix.
validation_surfaces: [Plans/guided_tour_contracts.schema.json, Plans/guided_tour_contract_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json]
risk_class: guided_tour_catalog_alias_or_inaccessible_unavailable_state
reasoning_tier: high
context_scope: guided_tour_shell_focus_route
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: guided_tour_local_action_catalog_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Planning_Wizard.md#PWIZ-023
  - Concepts/pm7-tools/guided_tour_source.py
  - "DL-260/DL-280 source lineage only (no product DOM obligation): data-ui-action-id and data-command-id were concept census attributes, not the product binding interface."
preserved_exact_tokens: [ui.guided_tour.focus_route, route_target.page_id, pm.guided_tour.focus_route_result.v1, cmd.nav.focus_route, aria-disabled=true]
negative_constraints:
  - Do not add a primary catalog or wiring row for cmd.nav.focus_route.
  - Do not make an unavailable action unfocusable or activatable.
  - Do not claim native or production execution from concept evidence.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Planning_Wizard.md, Plans/Wiring_Matrix.md]
```
