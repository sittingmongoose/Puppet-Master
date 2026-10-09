# Shard 026: Project recovery and Forge delete/CI central companion boundary — 2026-09-26

Source: `Plans/DRY_Rules.md`

Source lines: L2518-L2524

Source SHA256: `92b9843cc9445ef32b3be2568251c9b0e7ffccd394cbad6d64d3ce39d2357496`

---

## Project recovery and Forge delete/CI central companion boundary — 2026-09-26

Under DR-040 and DR-041, the seven UCC-165 primaries keep exact keys: one `command_id`, one owner contract set, one `sole_handler`, one `schema_ref` pair, and real `reverse_consumers`. `Plans/Project_System.md#PJCT-007` owns resume semantics, the `creation_recovery_resume_binding` join, and recovery availability; `Plans/Forge_Integrations.md#FGI-021` owns delete/CI semantics, the `official_destination_kind` destinations, and the protected-broker rule. Central companions own row identity only: `Plans/UI_Command_Catalog.md#UCC-165` carries the admission table, `Plans/Wiring_Matrix.md#WM-058` carries production intent, and `Plans/touch_closure.json` carries `TOUCH-PJCT-011` plus `TOUCH-FGI-047` through `TOUCH-FGI-052` under the existing `TCP-PROJECT` and `TCP-FORGE` profiles with `partial` disposition. No new profile, alias, peer row, peer handler, peer schema, EventRecord, or native proof is created here.

Reverse wiring reuses owner routes: Continue Setup dispatches `cmd.project.resume_creation`; Open Repository dispatches the existing `cmd.forge.repository.open_in_browser`; Delete Repository dispatches `cmd.forge.repository.delete`. Neither open nor delete is Project-local mutation, and no synthetic control satisfies reverse coverage. All rows stay `handler_unavailable` with `expected_event_types=[]`; the visible-behavior flags live on the companion units (`gui_related: true` on UCC-165 and WM-058), not on a duplicated product specification. The Commands & Shortcuts local action census remains unadmitted.

ContractRef: ContractName:Plans/DRY_Rules.md#DR-040, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/UI_Command_Catalog.md#UCC-165, ContractName:Plans/Wiring_Matrix.md#WM-058
