# Widget System -- Cross-Cutting Specification

## 1. Scope and non-scope
Widget composition remains important, but it is no longer a blanket page-model for every major surface.

In scope:
- Dashboard widgets
- Usage widgets
- Orchestrator `Progress` widgets

Not in scope:
- `Seams` as a widget canvas
- `Node Graph` as a widget canvas
- `Evidence` as a widget canvas
- `History` as a widget canvas
- `Ledger` as a widget canvas

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

## 2. Hostability and data contracts
Widgets consume stable projections and canonical records. They do not define page semantics.

Rules:
- widget config changes presentation, local filtering, and layout only
- widget-level filters inherit page/project/focused-run context and do not invent independent run scope
- a widget action routes through canonical commands and route/open contracts rather than bypassing them

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

## 3. Layout persistence
Layout persistence uses app-default with project override.

Rules:
- the default layout key remains stable per page/surface
- project-specific overrides may diverge from the app default
- run-level layout persistence is not canonical for Orchestrator `Progress`
- migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md
