# Shard 028: PMConcept7 settled interaction production wiring addendum - 2026-08-27

Source: `Plans/Wiring_Matrix.md`

Source lines: L3939-L4049

Source SHA256: `3c0e5c94343cffc51ae2cd06c8693bdd23d6862e22a03ad99cc4778ba99ec40d`

---

## PMConcept7 settled interaction production wiring addendum - 2026-08-27

Production wiring for the recovered PMConcept7 surfaces is command-owner-first and settled-state-only.
The machine-readable rows in `Plans/Wiring_Matrix.production.json` carry the same producer, handler,
state selector, effect, cancellation, error, and evidence boundaries summarized here.

Amended 2026-10-09 (DL-180): Home is one universal panel system and the chat a fixed column (WM-090). The Home row
below now covers every panel and tab commit (`cmd.panel_tab.*` and `cmd.workspace_layout.*` on
`pm.home_workspace_layout.v2`, SP-330); Collapse Bottom Terminal retires and any panel folds to its strip. The Chat row
no longer re-seats the chat: show and hide stay `cmd.panel.switch`, the width is
`cmd.workspace_layout.resize_surface` with `{ surface: chat, width }`, and Pop out and Dock back are `cmd.panel.undock`
and `cmd.panel.redock` with `chat` (UCC-203). Dashboard widgets live in dashboard tabs, each board in its own
`widget_layout:v1:dashboard:<board_id>` (WS-030).

| Producer | Command/disposition | Handler/reducer and owner state | Persistence/effect | Consumer | Cancel/error path |
|---|---|---|---|---|---|
| Usage/Dashboard widget add/remove/configure | existing `cmd.widget.*` row, addressed by `board_id` in a dashboard tab (amended 2026-10-09) | `handlers::widget::*`; Widget System owner | settled `widget_layout:v1:usage` or `widget_layout:v1:dashboard` (per board `widget_layout:v1:dashboard:<board_id>` from 2026-10-09, WS-030); dispatch receipt; no persisted domain event | current widget host and saved layout projection | disabled/rejected/stale result leaves owner state unchanged |
| Usage/Dashboard resize or reorder | `cmd.widget.resize` / `cmd.widget.move` on changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation; preview is `view_only` | `handlers::widget::resize` / `handlers::widget::move`; surface-specific local draft: Usage pointer resize and pointer/keyboard reorder visibly repack affected peers, Dashboard resize peers remain frozen | one settled write and receipt; no pointer-preview event | Usage retains the accepted last-painted pointer-preview topology once; Dashboard reflows after commit | Escape, `pointercancel`, invalid/no-change release/drop/activation restores prior geometry/order and dispatches nothing |
| Home move/resize/collapse/reset (amended 2026-10-09: every panel and tab commit) | `cmd.workspace_layout.*` and `cmd.panel_tab.*` rows (WM-090) | `handlers::workspace_layout::*`, `handlers::panel_tab::*`; `pm.home_workspace_layout.v2` owner (`pm.home_workspace_layout.v1` is a read-only migration input) | one revision-checked commit; existing `workspace.layout_changed` effect with its v2 payload (CV-361); no preview effect | Home panels: split tree, tabs, sizes and folded panels | cancel/invalid/stale revision restores prior layout and emits no command/effect; error projects owner reason |
| Home preset size | concept alias normalized to `cmd.workspace_layout.resize_surface` | preset resolver produces committed width/height/flex and optional `preset_id` | same resize commit as direct resize | Home surface layout | no primary `cmd.workspace_layout.size_surface` row or handler exists |
| Usage Refresh | `cmd.usage.refresh` | `handlers::usage::refresh`; existing Usage projection owner | no-persist dispatch receipt; background refresh remains independent | Usage freshness/health projection | unavailable/stale failure remains visible and does not overwrite current projection |
| PMConcept7 Ledger attempt drill-through | `cmd.nav.open_usage_subject`, with stable `attempt_id` and `usage_event_ref` | `handlers::nav::open_usage_subject`; route/open owner resolves `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`; usage_event/provider/account/runtime refs are correlation | route/open receipt, no fabricated domain event, no `OpenSubject` | canonical Usage attempt inspector/route | missing/invalid attempt identity or unavailable target returns typed route/open failure without state mutation |
| Aggregate provider/account/panel details | `view_only` local inspector | current Usage projection; no router or command handler | no command, receipt, domain event, or persistence | local inspector | missing presentation data remains local; no fallback route or invented object kind |
| Usage room/scope/range/disclosure/filter/More-menu | `view_only` | current Usage view projection | no command/receipt/event; settled preference storage remains storage-owned | current Usage render | dismissal/cancel restores or retains prior local selection |
| Context ring popup/hover | `view_only` | shared Assistant local overlay projection | no command/receipt/event | compact context summary | dismissal emits nothing |
| Context ring `Compact Now` | `cmd.chat.compact_context` | `handlers::chat::compact_context`; live Prompt Pipeline/context owner | explicit dispatch receipt and visible result/projection; no fabricated `context.compaction.*` event while unregistered | the same ring and Context Detail Pane | already-running/no-op/degraded/unavailable/retry/failed states remain visible and preserve thread identity |
| Context ring `More Details` and pane focus/close | existing thread Context Detail Pane commands | `handlers::chat::*thread_context_details`; shared Assistant/thread state | no-persist receipt/layout state | one shared Context Detail Pane | unavailable/close returns focus deterministically; no second pane store |
| Chat visibility, width and pop-out (amended 2026-10-09; re-seating retired) | `cmd.panel.switch` for visibility; `cmd.workspace_layout.resize_surface` with `{ surface: chat, width }` for the width; `cmd.panel.undock` / `cmd.panel.redock` with `chat` for Pop out and Dock back (desktop app) | shell panel reducer plus one shared Assistant node/store | no clone and no transcript/state fork; visibility is a receipt, the width a `workspace.layout_changed` commit, Pop out and Dock back `panel.undocked` / `panel.redocked` | the fixed chat column on the right, from the title bar to the status bar, or its own window | a failed width commit restores the earlier width; a failed pop-out keeps the chat in its column; node identity and thread state remain intact |

The production matrix does not register `cmd.workspace_layout.size_surface`, does not register
`cmd.provider.usage.open_management`, and does not add an event for preview frames. A command receipt
proves dispatch/admission only; a committed owner projection or declared event proves the settled effect.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

### WM-045 - PMConcept7 Producer Commit Cancel Error And Shared Assistant Wiring

```yaml
plan_unit_id: WM-045
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The PMConcept7 production wiring matrix binds every relevant producer to an existing
  command or view_only disposition, its sole handler/reducer, owner projection/store,
  settled persistence or declared effect, dispatch receipt, consumer, cancel path, and
  error path. Pointer/hover/popup previews never dispatch or persist; Usage pointer resize may locally advance
  its target footprint and visibly repack only obstructed peers while Dashboard resize peers remain frozen; one changed
  pointer release, keyboard reorder drop, or atomic keyboard-resize activation commits through cmd.widget.* or
  cmd.workspace_layout.*; Usage refresh and stable-event
  drill-through reuse their existing rows while current PMConcept7 aggregate provider/account/panel details
  remain local inspectors; Context-ring actions reuse their existing rows; and the same
  Assistant node/store is re-seated across Home and global docks without cloning. Amended 2026-10-09 (DL-180): the
  chat no longer re-seats inside the window; it is a fixed column whose only move is Pop out into its own window and
  Dock back, and the same node/store serves both without cloning. Home commits are every panel and tab commit of
  WM-090 on pm.home_workspace_layout.v2. The concept-only size_surface
  token is normalized to resize_surface, rejected provider management stays unwired, and
  no pointer-preview event family is added.
gui_related: true
gui_classification_reason: The wiring contract connects the recovered visible controls, their disabled/error states, and the shared Assistant seating behavior.
split_recommended: false
depends_on: [WM-044, CS-068, UCC-147, WS-019, SP-249, SP-250]
unblocks: [UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Prose and production JSON agree on producer, command/disposition, handler, selector/store, persistence/effect, receipt, consumer, cancel, and error behavior for every covered family; event-primary callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row dispatches cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject and retains usage_event_ref plus provider/account/runtime refs as correlation. Current aggregate cards remain local with no command, receipt, or event. The production matrix retains all 726 keys and this recovery enriches exactly 40 existing rows, comprising the 13 named catalog rows for Chat Context, Usage, panel switching, and widget commands plus the 27 existing home.* rows; cmd.artifacts.show_in_usage and cmd.artifacts.show_in_ledger retain their pre-recovery bytes and are not counted in that enrichment set.
  - "Amended 2026-10-09 (DL-180): the counts in the criterion above are the 2026-08-27 recovery's. After DL-180 the Home rows are WM-090's tables: 51 fixed-zone home.* rows retired, five rebuilt on the v2 model, and the chat's rows are show and hide, width, Pop out and Dock back with no re-seat row."
  - Preview frames, popup/hover disclosure, and cancellation produce zero commands, receipts, persisted events, and storage writes.
  - Changed widget pointer releases, keyboard reorder drops, atomic keyboard-resize activations, and changed Home releases produce exactly one existing semantic command and settle only after owner acceptance.
  - The Context ring and shared Assistant rows preserve one node/store and use existing compact/details/panel authorities.
  - No production row exists for cmd.workspace_layout.size_surface or cmd.provider.usage.open_management.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: pm7_production_wiring_or_cancel_path_drift
reasoning_tier: high
context_scope: pm7_commands_wiring_dry_assistant
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: pm7_production_wiring_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens:
  - view_only
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - pm.home_workspace_layout.v1
  - pm.home_workspace_layout.v2
  - workspace.layout_changed
  - pm:command-dispatch
negative_constraints:
  - Do not treat a receipt as terminal domain success.
  - Do not emit a command, event, or persistence write from pointer-preview or cancel state.
  - Do not clone the Assistant or create a second pane/store while re-seating it.
  - Do not move, dock or float the chat inside the window; Pop out is its only move (DL-180).
  - Do not create production rows for compatibility-only or rejected command tokens.
  - Do not route aggregate Usage cards, dispatch cmd.nav.open_usage_subject without the branch's stable selector, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use correlation identity as the PMConcept7 Ledger object_id.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the chat's in-window re-seat across Home and global docks retires (Pop out and Dock back remain), and Home commits move to the v2 record. DL-180 is cited here and not in depends_on: DL-180 builds on DL-147, whose chain already reaches this unit, so the dependency would close a loop; WM-090 depends on this unit instead. Pop out's command is Plans/UI_Command_Catalog.md#UCC-203."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```
