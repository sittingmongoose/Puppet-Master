# Shard 026: PMConcept7 settled-interaction command reuse addendum - 2026-08-27

Source: `Plans/Commands_System.md`

Source lines: L4809-L4917

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## PMConcept7 settled-interaction command reuse addendum - 2026-08-27

The recovered PMConcept7 surfaces consume the existing command registry; they do not create a
concept-specific command language. Pointer motion, drag/resize previews, hover summaries, popup
open/close state, Usage room/scope/range/disclosure/filter selection, and Context-ring menu disclosure
are local projections. A changed semantic release dispatches one existing command, a no-change release
returns without dispatch, and Escape or `pointercancel` restores the original projection without a
command, receipt, persisted event, or storage write.

The canonical dispositions are:

| Interaction family | Canonical command or disposition | Commit/effect boundary |
|---|---|---|
| Usage/Dashboard widget add, remove, configure, resize, move, reset | `cmd.widget.add`, `cmd.widget.remove`, `cmd.widget.configure`, `cmd.widget.resize`, `cmd.widget.move`, `cmd.widget.reset_layout` | One settled command updates the owner widget-layout store and records its command receipt; no pointer-preview frame is a domain event. |
| Home shell surface move, resize, collapse, reset | `cmd.workspace_layout.move_surface`, `cmd.workspace_layout.resize_surface`, `cmd.workspace_layout.set_collapsed`, `cmd.workspace_layout.reset` | One changed release/activation commits `pm.home_workspace_layout.v1`; only that commit may produce the existing `workspace.layout_changed` effect. |
| PM7 semantic Home size preset | Normalize the concept token `cmd.workspace_layout.size_surface` to `cmd.workspace_layout.resize_surface` after resolving `preset_id` to committed dimensions | `cmd.workspace_layout.size_surface` is concept/compatibility lineage only and is not a new primary registry row or handler. |
| Usage refresh and object-backed Usage/Ledger drill-through | `cmd.usage.refresh`, `cmd.nav.open_usage_subject` | Refresh records a no-persist dispatch receipt. Event-primary callers use `usage_event`/`usage_event_ref`; a PMConcept7 Ledger attempt row uses `usage_attempt`/`attempt_id`, repeats `attempt_id` at top level, retains `usage_event_ref` plus provider/account/runtime refs as correlation, and carries no `OpenSubject`. |
| Aggregate provider/account/panel details | local inspector (`view_only`) | Current aggregate cards open their local inspector only; no command, command receipt, domain event, or invented route kind is admitted. |
| Usage room, scope, range, disclosure, More-menu state, and per-widget filters | local projection (`view_only`) | No command, command receipt, persisted event, or storage mutation is emitted merely for local projection changes. Settled saved preferences remain storage-owned. |
| Context-ring popup/hover summary | local projection (`view_only`) | Opening or hovering the menu does not compact context or open a detail surface. |
| `Compact Now` | `cmd.chat.compact_context` | Dispatches only after explicit selection. While no `context.compaction.*` Event Authority registration exists, production wiring records the command result/receipt and visible projection state rather than fabricating an event family. |
| `More Details`, focus, and close | `cmd.chat.open_thread_context_details`, `cmd.chat.focus_thread_context_details`, `cmd.chat.close_thread_context_details` | Reuses the shared thread Context Detail Pane; it does not create a Usage route or a second chat-local details store. |
| Shell/Chat panel visibility | `cmd.panel.switch` | Changes visibility/seat state for the existing shared Assistant node; it does not instantiate another Assistant. |

`cmd.provider.usage.open_management` remains rejected and exclusions-only. This addendum does not
register that token, does not register `cmd.workspace_layout.size_surface`, and does not alter any
provider-management command disposition.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Widget_System.md, ContractName:Plans/storage-plan.md

### CS-068 - PMConcept7 Settled Interaction Command Reuse And Local Preview Boundary

```yaml
plan_unit_id: CS-068
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  PMConcept7 uses the existing cmd.widget.*, cmd.workspace_layout.*, cmd.usage.refresh,
  object-backed cmd.nav.open_usage_subject, cmd.chat.compact_context, thread Context Detail
  Pane, and cmd.panel.switch authorities. Event-primary Usage callers use usage_event/usage_event_ref;
  a PMConcept7 Ledger attempt row dispatches the navigation command with usage_attempt/attempt_id and
  retains usage_event_ref as correlation. Current PMConcept7 aggregate provider/account/panel details remain
  local inspectors. Pointer, hover, popup, room, scope, range, disclosure, filter, ghost,
  placeholder, and animation previews are local projection state; exactly one changed semantic
  release or explicit action dispatches the existing command, while no-change and cancel paths
  dispatch nothing and write nothing. The concept-only
  cmd.workspace_layout.size_surface token normalizes to cmd.workspace_layout.resize_surface
  after preset resolution and never becomes a primary command. No pointer-preview event,
  PM7 command family, second Assistant command path, or rejected provider-management
  command is admitted.
gui_related: true
gui_classification_reason: The unit governs which visible PMConcept7 controls dispatch and which interactions remain local previews.
split_recommended: false
depends_on: [CS-067, WS-019, WS-020, SP-249, SP-250]
unblocks: [UCC-147, WM-045, UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Usage and Dashboard widget mutations reuse cmd.widget.add, remove, configure, resize, move, and reset_layout; one changed settled action creates one command receipt and no pointer-preview domain event.
  - Home move, resize, collapse, and reset reuse cmd.workspace_layout.move_surface, resize_surface, set_collapsed, and reset; cmd.workspace_layout.size_surface is compatibility-only and normalizes to resize_surface.
  - Usage room, scope, range, disclosure, More-menu state, per-widget filters, and current PMConcept7 aggregate provider/account/panel inspectors remain local projection state and do not mint commands, receipts, events, or route identity; event-primary callers use cmd.nav.open_usage_subject with usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row uses usage_attempt/attempt_id without OpenSubject and retains usage_event_ref plus provider/account/runtime refs as correlation.
  - Compact Now dispatches cmd.chat.compact_context only after explicit selection; More Details reuses the thread Context Detail Pane command family; menu open and hover dispatch nothing.
  - Escape, pointercancel, invalid target, and no-change releases restore or retain the prior projection and emit no command, receipt, event, or persistence write.
  - cmd.provider.usage.open_management remains rejected and no PM7-only command namespace is added.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_parallel_command_or_preview_event_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/UI_Wiring_Rules.md
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: pm7_settled_interaction_command_reuse
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - cmd.widget.resize
  - cmd.widget.move
  - cmd.workspace_layout.move_surface
  - cmd.workspace_layout.resize_surface
  - cmd.workspace_layout.size_surface
  - cmd.usage.refresh
  - cmd.nav.open_usage_subject
  - cmd.chat.compact_context
  - cmd.chat.open_thread_context_details
  - cmd.panel.switch
negative_constraints:
  - Do not register a PM7-only command family or a primary cmd.workspace_layout.size_surface row.
  - Do not dispatch commands or persist events for pointer-preview frames, hover, popup disclosure, or cancellation.
  - Do not revive cmd.provider.usage.open_management.
  - Do not create a second Assistant command path or store.
  - Do not route aggregate provider/account/panel cards, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the PMConcept7 Ledger attempt selector.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```
