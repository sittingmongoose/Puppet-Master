# Shard 032: PMConcept7 command reuse and view-local disposition addendum - 2026-08-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L11671-L11802

Source SHA256: `0b9226898eb192f2b85b963443aadd6858968975367640b9191697000992ddc8`

---

## PMConcept7 command reuse and view-local disposition addendum - 2026-08-27

The recovered PMConcept7 controls bind to existing catalog rows. The table below is a consumer-surface
census, not a new command family.

| PMConcept7 producer/action | Canonical command/disposition | Required result |
|---|---|---|
| Usage widget show/hide/configure | `cmd.widget.add`, `cmd.widget.remove`, `cmd.widget.configure` | One settled widget-layout mutation and receipt. |
| Usage or Dashboard resize release | `cmd.widget.resize` | One command only when committed dimensions changed; preview and cancel are `view_only`. On Usage that one command settles the whole room, including peers moved by the resolver and by Usage board gravity (`Plans/Widget_System.md#WS-019`). |
| Usage or Dashboard reorder release | `cmd.widget.move` | One command only when committed order changed; ghost/placeholder preview and cancel are `view_only`. On Usage that one command settles the whole room, including peers moved by the resolver and by Usage board gravity. |
| Usage board gravity after a move, resize, preset, hide, or show | part of that action's own `cmd.widget.move`, `cmd.widget.resize`, `cmd.widget.remove`, or `cmd.widget.add` | No extra command, receipt, or write; the held preview moves only obstructed peers, and gravity is applied at settle inside the one commit (`Plans/Widget_System.md#WS-019`). |
| Usage Tidy (card menu or Customize panel) | one existing `cmd.widget.move` carrying `arrange` `{ mode: "tidy", detail }` (section 2.3) | One settled layout transaction with one receipt: the owner computes the repack from the committed layout, and the settled result carries every card it moved; no per-card move command and no Tidy command; a Tidy that moves nothing dispatches nothing (`Plans/Widget_System.md#WS-019`). |
| Usage size picker preset | `cmd.widget.resize` with the preset's geometry; the settled record stores its `preset_id` | One command on choice; opening the picker and hovering or focusing a row to preview a size are `view_only` (`Plans/Widget_System.md#WS-017`, `#WS-020`). |
| Usage chart type and gear options | `cmd.widget.configure` | One settled configuration change per choice; opening the menu is `view_only`. |
| Usage/Dashboard reset | `cmd.widget.reset_layout` | One reset command to the selected host namespace. |
| Home surface move/resize/collapse/reset | `cmd.workspace_layout.move_surface`, `cmd.workspace_layout.resize_surface`, `cmd.workspace_layout.set_collapsed`, `cmd.workspace_layout.reset` | One revision-checked settled command. |
| Home preset-size control | resolve the historical PM7 semantic preset alias through `cmd.workspace_layout.resize_surface` | Resolve `preset_id` to committed size values before dispatch; the alias is documentation-only and is not cataloged. |
| Usage Refresh | `cmd.usage.refresh` | One explicit refresh request; background refresh remains separately owner-driven. |
| Usage Ledger attempt drill-through | `cmd.nav.open_usage_subject` | One Usage object route with `route_target.object_kind = usage_attempt`, `route_target.object_id = attempt_id`, top-level `attempt_id`, and `usage_event_ref` correlation; no `OpenSubject`. |
| Usage provider/account/presentation-panel details | `view_only` local projection | Stable local identity opens the existing local inspector; no UICommand, route receipt, or domain event. On the Accounts room the card body and Details stay local; the three Accounts rows below are the only owner-routed actions on an account card or provider plate. |
| Usage Accounts card Use this account | `cmd.account.select_profile` | Shown only when the provider's capability `supports_manual_set_active` is true and labelled as an override; asks first when the account is already past its provider's switch point (`Plans/Multi-Account.md#MA-073`); unavailable states show the command's own disabled reason. |
| Usage Accounts provider Auto-switch toggle and switch level | `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` at scope `provider` for that provider id | The same Settings value Settings edits, committed once per settled change through the Settings owner; no Usage copy, no new command (`Plans/Settings_System.md#SSYS-044`). The provider's warning level and rest period are edited in Settings, reached through Open in Settings. |
| Usage Accounts Open in Settings | `cmd.settings.open` with `target_type` `setting` | Lands on the row inside that provider's section in Settings. |
| Usage head Export menu (Snapshot or Ledger) and the Ledger table's export | `cmd.usage.export` with `scope` `snapshot` or `ledger` | One export per choice; opening the menu is `view_only`; no other export command. |
| Usage alert Acknowledge and Snooze 1 hour | `cmd.alert.acknowledge`, `cmd.alert.snooze` | The shared alert store owns the lifecycle (`Plans/FinalGUISpec.md#F3-453`); Usage keeps no alert state of its own. |
| Provider setup or management | `cmd.settings.open` | Open the typed setting target `ai.accounts.provider-connections`; do not alias the rejected provider-management token. |
| Usage room/scope/range/disclosure/filter/More-menu selection | `view_only` local projection | No command; settled preference persistence remains storage-owned. |
| Usage Live / Paused (rail head, beside Usage) | `view_only` local projection | No command; holding or applying arriving Usage projection updates is a view choice, and the remembered choice is the storage-owned Usage view preference `live` (`Plans/usage-feature.md#UF-095`). |
| Usage Play the next hour, Back to now, and the concept feature switches | the lab-only disposition of `Plans/usage-feature.md#UF-107` | No command; UF-107 owns the exclusion. |
| Context ring popup/hover | `view_only` local projection | No compaction and no detail-open dispatch. |
| Context ring `Compact Now` | `cmd.chat.compact_context` | Explicit click/choice only; visible result/receipt projection and no fabricated event family. |
| Context ring `More Details` | `cmd.chat.open_thread_context_details` | Opens or focuses the existing shared thread Context Detail Pane. |
| Context detail focus/close | `cmd.chat.focus_thread_context_details`, `cmd.chat.close_thread_context_details` | Reuses the existing pane and shared Assistant state. |
| Chat/side-panel visibility | `cmd.panel.switch` | Shows/hides the same Assistant/panel identity; does not clone it. |

The rejected `cmd.provider.usage.open_management` token remains exclusions-only with no alias. Provider
setup or management reuses `cmd.settings.open`; no provider-management command is revived by this
addendum.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/assistant-chat-design.md

### UCC-147 - PMConcept7 Existing Command Census And View-Local Dispositions

```yaml
plan_unit_id: UCC-147
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Every PMConcept7 producer resolves to an existing catalog command or an explicit
  view_only disposition. Widget commits use cmd.widget.*, Home commits use the existing
  workspace_layout and panel commands, Usage refresh and subject opens use
  cmd.usage.refresh and, for Ledger usage-attempt drill-through only, cmd.nav.open_usage_subject.
  Provider, account, and presentation-panel aggregate details remain local and dispatch
  nothing; provider setup or management reuses cmd.settings.open. Context-ring explicit actions use
  cmd.chat.compact_context plus the thread Context Detail Pane family. Local preview,
  popup, hover, room, scope, range, disclosure, filter, ghost, placeholder, and animation
  state dispatch nothing. The concept-only semantic preset alias normalizes to
  cmd.workspace_layout.resize_surface; cmd.provider.usage.open_management
  remains rejected with no alias, and no PM7-only or duplicate primary command row is created.
  The redesigned Usage page (2026-10-09) adds no command. On its Accounts room the card body and
  Details stay local, Use this account dispatches cmd.account.select_profile, shown only when
  supports_manual_set_active holds, and each provider's Auto-switch toggle and switch level commit
  through cmd.settings.transaction.preview and then cmd.settings.transaction.apply at scope provider,
  with Open in Settings on cmd.settings.open, which is also where the provider's warning level and rest
  period are edited. Usage board gravity commits inside the one cmd.widget.move, cmd.widget.resize,
  cmd.widget.add or cmd.widget.remove of the action that caused it, and Tidy commits the whole
  repacked room as one settled layout transaction through exactly one existing cmd.widget.move that
  carries the optional arrange field { mode: tidy, detail }, with one receipt and the repack computed
  by the owner, never one move per card. A size-picker preset
  commits one cmd.widget.resize and stores its preset_id; chart type and gear options use
  cmd.widget.configure; the head Export menu and the Ledger table export use cmd.usage.export with
  scope snapshot or ledger; alert Acknowledge and Snooze use cmd.alert.acknowledge and
  cmd.alert.snooze. Live / Paused is view_only with its remembered choice storage-owned, and the
  concept's demo controls take the lab-only disposition UF-107 owns.
gui_related: true
gui_classification_reason: The catalog census binds visible PMConcept7 controls to canonical commands or explicit view-only behavior.
split_recommended: false
depends_on: [CS-068, UCC-060, UCC-144, UCC-146, WS-019]
unblocks: [WM-045, UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Every listed PMConcept7 control maps to exactly one existing command or view_only disposition; Ledger attempt drill-through uses cmd.nav.open_usage_subject with route_target.object_kind usage_attempt, route_target.object_id attempt_id, top-level attempt_id, usage_event_ref correlation, and no OpenSubject, while provider, account, and presentation-panel aggregate details use stable local identities and dispatch no UICommand.
  - Resize and move previews dispatch nothing; a changed release dispatches exactly one cmd.widget.resize, cmd.widget.move, cmd.workspace_layout.resize_surface, or cmd.workspace_layout.move_surface command as appropriate.
  - Compact Now dispatches only after explicit choice; More Details uses cmd.chat.open_thread_context_details and does not route through app-wide Usage.
  - The historical semantic preset alias is not registered as a primary command and normalizes to cmd.workspace_layout.resize_surface.
  - cmd.provider.usage.open_management remains rejected, has no alias, and is absent from production wiring; provider setup or management instead dispatches cmd.settings.open with target_type setting and setting_id ai.accounts.provider-connections.
  - "Usage Accounts actions: Use this account dispatches one cmd.account.select_profile and is absent when supports_manual_set_active is false; a change of a provider's Auto-switch toggle or switch level dispatches one cmd.settings.transaction.preview and one bound cmd.settings.transaction.apply at scope provider; opening a card's Details dispatches nothing."
  - "Usage layout: a Tidy that moves cards dispatches exactly one cmd.widget.move carrying arrange { mode: tidy, detail } and one receipt for the whole repacked room, the owner computing the repack, a Tidy that moves nothing dispatches nothing, gravity adds no command beyond the action that caused it, and a size-picker preset dispatches one cmd.widget.resize whose settled record carries the preset_id."
  - "Live / Paused and the concept demo controls of UF-107 dispatch no command and have no catalog or production wiring row; export, alert acknowledge and alert snooze reuse cmd.usage.export, cmd.alert.acknowledge and cmd.alert.snooze."
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_catalog_duplicate_or_view_state_command_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: pm7_existing_command_census
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
  - Plans/Decision_Log.md#DL-174
  - Plans/Decision_Log.md#DL-176
  - Plans/Decision_Log.md#DL-177
  - "Concepts/usage-redesign/src/js (Usage redesign producers; source-lineage-only)"
preserved_exact_tokens:
  - view_only
  - cmd.workspace_layout.resize_surface
  - Compact Now
  - More Details
  - cmd.provider.usage.open_management
  - Tidy
  - Live / Paused
negative_constraints:
  - Do not register commands for popup disclosure, hover, pointer preview, or cancellation.
  - Do not dispatch cmd.nav.open_usage_subject for provider, account, or presentation-panel aggregate details.
  - Do not mint a command for Tidy, gravity, size presets, Live / Paused, or the lab-only demo controls, and do not commit Tidy as one move per card.
  - Do not write a provider's auto-switch values from Usage except through the Settings transaction.
  - Do not attach OpenSubject to a Usage object route.
  - Do not create a PM7 command namespace or duplicate primary command row.
  - Do not revive or alias a rejected provider-management command.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```
