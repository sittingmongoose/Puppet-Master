# Shard 055: PM7 project and work command entries (2026-10-29; B1/B6, D2/D6/D8–D13, G4–G7)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L19212-L19318

Source SHA256: `3a8a28f9c33b0923707842f58734c35a70fc12f1af19c595e04b08942d3b6b5c`

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

### UCC-212 - DL-270 Chat Load-Older Command And Storage Dispositions

```yaml
plan_unit_id: UCC-212
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'DL-270 registers one new UICommand, cmd.chat.load_older (ACD-242, SP-338). It is a shell_view,
  receipt-only read: one request fetches the next older sealed 50-item page of a thread''s render pages, given
  thread_id and before_page_ref, and appends it above the loaded window. Scrolling near the top of the history
  sends it by itself, and the visible Load 50 older row (ACD-242) stays as the fallback; both send the same
  command, and no UI surface reads the page store directly (UIW-002). Opening a thread is not this command:
  it reads thread_head, the hot tail and the newest page and never replays events. The Reclaim action of storage
  health is the existing cmd.storage.compaction.request (UCC-124) and gets no second id. The record inspector
  opens through the existing cmd.storage.open_value (UCC-123). pm db dump, pm inspect, pm tail and pm export
  (SP-339, SP-342) are command-line reads and get no cmd.* id; this unit holds their disposition. The Case
  L seventeen-ID count is unchanged: this unit is a separate DL-270 registration.


  Current projects-refresh contract: No project is genuine application scope, with a named fixed Computer after
  first message, lazy visible chat folder and no invented Project/Vault. Admit ordinary files/browser/editor/terminal/tools/notebook/history/recovery
  under exact app roots and owner versions, retaining private notebook/memory isolation and counterpart limits.
  Six projects.* read tools return explicit requested/looked_in/not_looked_in/partial coverage; source read
  grants do not authorize writes. Existing cmd.thread.request/spawn Send uses current local previews and receiver
  authority; maximum three automatic round trips. Two equal conversion choices share one manifest/copy-check/cutover/report/Undo
  engine; stop/fence Goal/Crew/Plan/timers and use linked destination records by default. No new work plus
  seven days bounds chat Undo, not independent canonical custody. Screen use is off until exact chat/app/controller/disclosure
  admission, with one targeted Stop. The exact consumer contract is UCC-216/WM-102 and Plans/projects_refresh_command_bindings.json.
  Historical schema/hash/replay resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses
  remain as specified; unavailable handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Registers the chat load-older control and dispositions the storage health, record
  inspector and export controls.
split_recommended: false
depends_on:
- CS-107
- SP-337
- SP-338
- SP-339
- SP-340
- ACD-242
- UCC-123
- UCC-124
unblocks: []
acceptance_criteria:
- cmd.chat.load_older has exactly one catalog row, one production wiring entry and one handler, handlers::chat::load_older.
- Scroll-near-top and the Load 50 older control send the same cmd.chat.load_older request, and neither reads
  the page store directly.
- No cmd.* id exists for pm db dump, pm inspect, pm tail or pm export.
- The storage health Reclaim action sends cmd.storage.compaction.request and has no second command id.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-216; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: storage_command_registry_drift
reasoning_tier: high
context_scope: dl270_storage_profile_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-270
- Plans/storage-plan.md#SP-338
- Plans/assistant-chat-design.md#ACD-242
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- cmd.chat.load_older
- cmd.storage.compaction.request
- cmd.storage.open_value
negative_constraints:
- Do not mint ids for command-line verbs.
- Do not add a second reclaim command or a local action for load-older.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
owner_hints:
- Plans/UI_Command_Catalog.md
```
