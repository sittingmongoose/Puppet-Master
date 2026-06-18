# Shard 004: Concern lifecycle verification checklist

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L24-L56

Source SHA256: `28ffe502125883e33ded97b18f62b1a8b17abff9800c4c44fa951a19b274591a`

---

## Concern lifecycle verification checklist
- [ ] Concern lifecycle states are explicitly `active`, `acknowledged`, `resolved`, and `dismissed`.
- [ ] `resolution_kind` includes `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`.
- [ ] `accepted_risk` is verified as a resolution path and never treated as a dismissal shortcut.
- [ ] Confirmation rules distinguish acknowledge, dismiss, resolve, and lineage-edit actions, and each path records rationale plus acting authority.
- [ ] Concern identity stays distinct from blocked episodes, review findings, annotations, and graph patch requests.
- [ ] Owner, creator, and resolver roles remain separately testable so ownership reassignment does not change concern identity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Remaining high-value Orchestrator blind spots stay in scope for checklist verification: exact Source Control/worktree handshake, widget-system hostability and persistence, command palette / shortcut / context-menu / bulk-action integration, large-graph and many-record `/performance`, multi-run behavior in one project, object `/text` search across Plan Compile / Seams / Graph / Evidence / History / Ledger, notification `/escalation` beyond in-page alerts, accessibility for dense `/records`, and safety `/confirmation` for user-facing actions.

Orchestrator tab redesign is explicit: `Progress` is the widget-hosting operational summary; `Plan Compile` is the plans-to-code projection tab; `Seams` replaces `Tiers` as seam-first, package-second, node-on-drill-in hierarchy; `Node Graph`, `Evidence`, `History`, and `Ledger` remain native tabs; `History` is the chronological runtime story and `Ledger` is structured exact-record inspection.

`Orchestrator_Page` / `Orchestrator_Page.md` must retire `Tiers`, keep only `Progress` widget-composed, treat `Evidence`, `History`, and `Ledger` as native tabs, replace `tier_id` filters with canonical node `/attempt/runtime` identity, and elevate blocked/runtime event sources over request-centric HITL and `TierChanged` assumptions.

Non-Progress Orchestrator widget layouts are retired: `/Tiers`, `Orch/Tiers`, `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, `widget_layout:v1:orchestrator:ledger`, and `widget.tier_tree` remain migration evidence only while active Orchestrator layout uses the current `widget_layout` family.

Impacted Orchestrator rebuild surfaces are `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` / `/Orchestrator_Page.md`, `/Run_Graph_View.md`, `/Widget_System.md`, and `/GUI_Rebuild_Requirements_Checklist.md`; checklist verification must ensure first-class work package, feature seam, lane, promotion, contamination, and resolution-thread surfaces rather than restoring `Tiers` as the mental model.

Exact record inspection in `Ledger` uses paging: exactness does not require eager full materialization of every record.

`Run_Graph_View` / `Run_Graph_View.md` performance verification covers 500-node render targets, 1000-node stretch targets, 60 fps pan `/zoom`, layout under 500ms at 500 nodes, and initial load under 1s at 500 nodes.

Runtime artifact and command-surface checks reference `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/UI_Command_Catalog.md`, and `/Runtime_Artifacts_Panel.md`.

Tooling and memory-adjacent checklist rows reference `Plans/newtools.md`, `Plans/assistant-memory-subsystem.md`, `/newtools.md`, and `/assistant-memory-subsystem.md`.

Container packaging checklist rows reference `Plans/Containers_Registry_and_Unraid.md`, `Plans/Document_Packaging_Policy.md`, `/Containers_Registry_and_Unraid.md`, and `/Document_Packaging_Policy.md`.

Usage artifact checklist rows reference `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/usage-feature.md`, and `/Runtime_Artifacts_Panel.md`.

Orchestrator artifact checklist rows reference `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/Orchestrator_Page.md`, and `/Runtime_Artifacts_Panel.md`.
