# GUI Rebuild Requirements Checklist (2026-02-23)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- GUI REBUILD CHECKLIST

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## Purpose

This checklist is the single auditable summary that verifies the 2026-02-23 GUI rebuild handoff requirements are covered by canonical plan documents.

## Verification Table

| Requirement | Source of Truth (REF) | Verification Status | Notes |
|---|---|---|---|
| Cross-cutting widget system: unified catalog, grid resizing, preconfigured defaults | `Plans/Widget_System.md` sections 2, 3, 6, 7 | PASS | Covers canonical widget IDs, responsive 2/3/4-column grid behavior, layout persistence, and dashboard key migration. |
| Usage page: dedicated, fully widget-composed, Multi-Account widget | `Plans/usage-feature.md` section `Widget-Composed Page Layout`; `Plans/Widget_System.md` section 2.2 | PASS | Usage is fully widget-composed; `widget.multi_account` is first-class and reusable on Dashboard. |
| Chat context usage ring enhancements: `Compact Now` + pop-out detail | `Plans/assistant-chat-design.md` section 25 | PASS | `cmd.chat.compact_context`, pop-out detailed usage view, and keyboard/accessibility behavior are specified. |
| Dashboard upgrade: card grid -> widget grid + add-widget flow | `Plans/FinalGUISpec.md` Appendix C; `Plans/Widget_System.md` sections 3 and 4 | PASS | Dashboard layout migration and add-widget behavior are explicitly defined with redb key transition details. |
| Orchestrator page: single page with 6 tabs | `Plans/Orchestrator_Page.md` sections 2 and 3 | PASS | Tabs are Progress, Tiers, Node Graph Display, Evidence, History, Ledger. |
| Node Graph Display: Airflow-style DAG spec with contract + presets + 8-section detail panel + HITL controls | `Plans/Run_Graph_View.md` sections 2, 6, 7, 9, 16, 17 | PASS | Includes 5 layout presets, C1-C8 detail sections, HITL actions, data model contract, and acceptance criteria. |
| Summary verification coverage + image references | `Plans/Run_Graph_View.md` references section; `Concepts/dag_run_graph.png`; `Concepts/dag_run_graph1.png` | PASS | Reference images are present and linked by the run-graph specification. |

## Command Catalog Coverage Check

The following command groups introduced by the 2026-02-23 docs are now listed in the canonical command registry:

- `cmd.widget.*`
- `cmd.graph.*`
- `cmd.orchestrator.*`
- `cmd.chat.compact_context`
- `cmd.chat.open_usage_popout`
- `cmd.chat.close_usage_popout`

REF: `Plans/UI_Command_Catalog.md` sections 2.3 through 2.6.

## Completion Criteria

This checklist is complete when all rows in the verification table are `PASS` and verifier gates pass.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
