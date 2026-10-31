# Shard 055: PM7 project and work command entries (2026-10-29; B1/B6, D2/D6/D8–D13, G4–G7)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L16908-L16929

Source SHA256: `1c1e737cb6f75f4a5e74e331ed2fa36227daba5d6990f9054fbb4653eb74c836`

---

## PM7 project and work command entries (2026-10-29; B1/B6, D2/D6/D8–D13, G4–G7)

| Command ID | Label | Description | Preconditions | command_kind |
|---|---|---|---|---|
| `cmd.project.switch_active_tab` | Switch active workspace Project | One typed owner route; Plans/FinalGUISpec.md#F3-661; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.project.open_in_new_workspace_tab` | Open Project in new workspace tab | One typed owner route; Plans/FinalGUISpec.md#F3-661; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.chat.processes.open` | Open Processes | One typed owner route; Plans/assistant-chat-design.md#ACD-505; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.agents_and_processes.show` | Show agents and processes | One typed owner route; Plans/FinalGUISpec.md#F3-664; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.agents_and_processes.pop_out` | Pop out agents and processes | One typed owner route; Plans/FinalGUISpec.md#F3-664; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.work.stop` | Stop work | One typed owner route; Plans/Shared_Integration_Runtime.md#SIR-054; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `domain_action` |
| `cmd.work.restart` | Restart work | One typed owner route; Plans/Shared_Integration_Runtime.md#SIR-054; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `domain_action` |
| `cmd.work.send_input` | Answer process prompt | One typed owner route; Plans/Shared_Integration_Runtime.md#SIR-054; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `domain_action` |
| `cmd.work.set_completion_delivery` | When it ends | One typed owner route; Plans/Shared_Integration_Runtime.md#SIR-054; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `domain_action` |
| `cmd.work.clear_finished` | Clear finished | View-local hiding, no record deletion; UCC-210/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `navigation_wrapper` |
| `cmd.work.quit` | Quit with running work | One typed owner route; Plans/FinalGUISpec.md#F3-665; request/result contract CS-105/CS-106. | Current scope/target, available owner, permission and storage posture; runtime effects require writer | `domain_action` |

All eleven entries have normalization.kind = canonical, alias_of_command_id = null and normalizes_to_contract = Plans/pm7_build_contracts.schema.json at the matching *_request definition. Handlers and exact request/result refs are in production wiring; semantic owner checks precede effects.

Typed local actions: `ui.project_switcher.open`, `ui.project_switcher.close`, `ui.work_panel.close`, `ui.work_panel.select_tab`, `ui.work_panel.filter`, `ui.work_panel.sort`, `ui.work_panel.expand`, `ui.work_panel.select`, `ui.work_quit.open`, `ui.work_quit.select`, `ui.work_quit.cancel`, `ui.settings.pip_editor.open`, `ui.settings.pip_editor.close`, `ui.settings.pip_editor.replay`. They write no durable/runtime value; Settings part edits use the existing transaction pair.


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.
