# Shard 032: PMConcept7 command reuse and view-local disposition addendum - 2026-08-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L11641-L11735

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## PMConcept7 command reuse and view-local disposition addendum - 2026-08-27

The recovered PMConcept7 controls bind to existing catalog rows. The table below is a consumer-surface
census, not a new command family.

| PMConcept7 producer/action | Canonical command/disposition | Required result |
|---|---|---|
| Usage widget show/hide/configure | `cmd.widget.add`, `cmd.widget.remove`, `cmd.widget.configure` | One settled widget-layout mutation and receipt. |
| Usage or Dashboard resize release | `cmd.widget.resize` | One command only when committed dimensions changed; preview and cancel are `view_only`. |
| Usage or Dashboard reorder release | `cmd.widget.move` | One command only when committed order changed; ghost/placeholder preview and cancel are `view_only`. |
| Usage/Dashboard reset | `cmd.widget.reset_layout` | One reset command to the selected host namespace. |
| Home surface move/resize/collapse/reset | `cmd.workspace_layout.move_surface`, `cmd.workspace_layout.resize_surface`, `cmd.workspace_layout.set_collapsed`, `cmd.workspace_layout.reset` | One revision-checked settled command. |
| Home preset-size control | resolve the historical PM7 semantic preset alias through `cmd.workspace_layout.resize_surface` | Resolve `preset_id` to committed size values before dispatch; the alias is documentation-only and is not cataloged. |
| Usage Refresh | `cmd.usage.refresh` | One explicit refresh request; background refresh remains separately owner-driven. |
| Usage Ledger attempt drill-through | `cmd.nav.open_usage_subject` | One Usage object route with `route_target.object_kind = usage_attempt`, `route_target.object_id = attempt_id`, top-level `attempt_id`, and `usage_event_ref` correlation; no `OpenSubject`. |
| Usage provider/account/presentation-panel details | `view_only` local projection | Stable local identity opens the existing local inspector; no UICommand, route receipt, or domain event. |
| Provider setup or management | `cmd.settings.open` | Open the typed setting target `ai.accounts.provider-connections`; do not alias the rejected provider-management token. |
| Usage room/scope/range/disclosure/filter/More-menu selection | `view_only` local projection | No command; settled preference persistence remains storage-owned. |
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
gui_related: true
gui_classification_reason: The catalog census binds visible PMConcept7 controls to canonical commands or explicit view-only behavior.
split_recommended: false
depends_on: [CS-068, UCC-060, UCC-144, UCC-146]
unblocks: [WM-045, UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Every listed PMConcept7 control maps to exactly one existing command or view_only disposition; Ledger attempt drill-through uses cmd.nav.open_usage_subject with route_target.object_kind usage_attempt, route_target.object_id attempt_id, top-level attempt_id, usage_event_ref correlation, and no OpenSubject, while provider, account, and presentation-panel aggregate details use stable local identities and dispatch no UICommand.
  - Resize and move previews dispatch nothing; a changed release dispatches exactly one cmd.widget.resize, cmd.widget.move, cmd.workspace_layout.resize_surface, or cmd.workspace_layout.move_surface command as appropriate.
  - Compact Now dispatches only after explicit choice; More Details uses cmd.chat.open_thread_context_details and does not route through app-wide Usage.
  - The historical semantic preset alias is not registered as a primary command and normalizes to cmd.workspace_layout.resize_surface.
  - cmd.provider.usage.open_management remains rejected, has no alias, and is absent from production wiring; provider setup or management instead dispatches cmd.settings.open with target_type setting and setting_id ai.accounts.provider-connections.
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
preserved_exact_tokens:
  - view_only
  - cmd.workspace_layout.resize_surface
  - Compact Now
  - More Details
  - cmd.provider.usage.open_management
negative_constraints:
  - Do not register commands for popup disclosure, hover, pointer preview, or cancellation.
  - Do not dispatch cmd.nav.open_usage_subject for provider, account, or presentation-panel aggregate details.
  - Do not attach OpenSubject to a Usage object route.
  - Do not create a PM7 command namespace or duplicate primary command row.
  - Do not revive or alias a rejected provider-management command.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```
