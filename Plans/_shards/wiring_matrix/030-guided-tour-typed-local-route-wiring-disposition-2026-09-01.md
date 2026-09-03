# Shard 030: Guided Tour typed local route wiring disposition - 2026-09-01

Source: `Plans/Wiring_Matrix.md`

Source lines: L4039-L4094

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## Guided Tour typed local route wiring disposition - 2026-09-01

`ui.guided_tour.focus_route` is covered by Touch Closure profile
`TCP-GUIDED-NAV`, not by the production command matrix. Its one concept
consumer is the Guided Tour `Open Usage` control; its one specified local
controller consumes `route_target.page_id`, checks the mounted application router,
changes visible route/focus only, and returns the closed
`pm.guided_tour.focus_route_result.v1` no-domain/no-persistence local result.
The native Slint presentation controller remains absent and must not be
inferred from the authored HTML or browser verifier.

`catalog.nav_focus_route` is removed because it falsely implied an adopted
command and `handlers::nav::focus_route`. The retained historical token
`cmd.nav.focus_route` is exclusions-only. This disposition does not affect the
separately adopted `cmd.nav.open_subject` and
`cmd.nav.open_usage_subject` wrapper rows.

ContractRef: ContractName:Plans/Commands_System.md#CS-072, ContractName:Plans/UI_Command_Catalog.md#UCC-150, ContractName:Plans/touch_closure.json#TCP-GUIDED-NAV

### WM-049 - Guided Tour focus route uses Touch Closure, not false production wiring

```yaml
plan_unit_id: WM-049
unit_type: wiring_disposition
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  TCP-GUIDED-NAV binds ui.guided_tour.focus_route to its typed route target,
  mounted-application local controller, exact result, accessible disabled state,
  return route, tests, and sole Guided Tour consumer. cmd.nav.focus_route and
  catalog.nav_focus_route have no production standing and no handler claim.
gui_related: true
gui_classification_reason: Governs exact GUI-to-local-controller and reverse-consumer coverage for the Guided Tour route step.
depends_on: [WM-046, CS-072, UCC-150, PWIZ-023]
unblocks: []
acceptance_criteria:
  - TCP-GUIDED-NAV has one typed UI action, one local concept controller, one GUI trigger, one exact return, and browser/static tests.
  - No production matrix row, dispatcher, handler, domain event, or persistence effect is attributed to cmd.nav.focus_route.
  - Missing-router state remains keyboard-focusable, hover-bound, described, and non-dispatching.
  - Concept, browser, native Slint, and production-runtime evidence remain separate.
validation_surfaces: [Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, python3 scripts/pm-touch-closure-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, Concepts/pm7-tools/verify/guided_tour.mjs]
risk_class: false_production_wiring_or_missing_reverse_local_action_coverage
reasoning_tier: high
context_scope: guided_tour_application_focus_route
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: guided_tour_local_action_wiring_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - Plans/Planning_Wizard.md#PWIZ-023
preserved_exact_tokens: [TCP-GUIDED-NAV, ui.guided_tour.focus_route, route_target.page_id, pm.guided_tour.focus_route_result.v1, cmd.nav.focus_route, catalog.nav_focus_route]
negative_constraints:
  - Do not restore catalog.nav_focus_route or invent handlers::nav::focus_route.
  - Do not treat the PMConcept7 controller as a native Slint or production handler.
  - Do not remove the adopted open-subject wrapper rows.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Planning_Wizard.md]
```
