# Shard 028: PMConcept7 settled interaction production wiring addendum - 2026-08-27

Source: `Plans/Wiring_Matrix.md`

Source lines: L3905-L4015

Source SHA256: `b2fd211658773af1cc2194754ae343af548eb4d787daa0c517312b453b725b6d`

---

## PMConcept7 settled interaction production wiring addendum - 2026-08-27

Production wiring for the recovered PMConcept7 surfaces is command-owner-first and settled-state-only.
The machine-readable rows in `Plans/Wiring_Matrix.production.json` carry the same producer, handler,
state selector, effect, cancellation, error, and evidence boundaries summarized here.

| Producer | Command/disposition | Handler/reducer and owner state | Persistence/effect | Consumer | Cancel/error path |
|---|---|---|---|---|---|
| Usage/Dashboard widget add/remove/configure | existing `cmd.widget.*` row | `handlers::widget::*`; Widget System owner | settled `widget_layout:v1:usage` or `widget_layout:v1:dashboard`; dispatch receipt; no persisted domain event | current widget host and saved layout projection | disabled/rejected/stale result leaves owner state unchanged |
| Usage/Dashboard resize or reorder | `cmd.widget.resize` / `cmd.widget.move` on changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation; preview is `view_only` | `handlers::widget::resize` / `handlers::widget::move`; surface-specific local draft: Usage pointer resize and pointer/keyboard reorder visibly repack affected peers in the held preview and apply Usage board gravity only at settle, Dashboard resize peers remain frozen | one settled write and receipt for the whole room, gravity included; no pointer-preview event | Usage retains the accepted last-painted pointer-preview topology once, with gravity applied at settle; Dashboard reflows after commit | Escape, `pointercancel`, invalid/no-change release/drop/activation restores prior geometry/order and dispatches nothing |
| Usage Tidy (card menu or Customize panel) | one existing `cmd.widget.move` carrying `arrange` `{ mode: "tidy", detail }` for the whole repacked room | `handlers::widget::move`; Widget System owner (`Plans/Widget_System.md#WS-019`) | one settled layout transaction: one write of `widget_layout:v1:usage` and one receipt; no per-card move, no Tidy command | current Usage room and saved layout projection | a Tidy that moves nothing dispatches nothing; rejection leaves the pre-Tidy layout |
| Usage size picker preset | `cmd.widget.resize` with the preset's geometry | `handlers::widget::resize`; settled record stores `preset_id` (`Plans/Widget_System.md#WS-020`) | one settled write and receipt, gravity included; picker open and row-hover preview are `view_only` | current Usage card and saved layout projection | dismissing the picker or an unchanged choice dispatches nothing |
| Home move/resize/collapse/reset | existing `cmd.workspace_layout.*` rows | `handlers::workspace_layout::*`; `pm.home_workspace_layout.v1` owner | one revision-checked commit; existing `workspace.layout_changed` effect; no preview effect | Home hosts, saved dock/size/collapse projection | cancel/invalid/stale revision restores prior layout and emits no command/effect; error projects owner reason |
| Home preset size | concept alias normalized to `cmd.workspace_layout.resize_surface` | preset resolver produces committed width/height/flex and optional `preset_id` | same resize commit as direct resize | Home surface layout | no primary `cmd.workspace_layout.size_surface` row or handler exists |
| Usage Refresh | `cmd.usage.refresh` | `handlers::usage::refresh`; existing Usage projection owner | no-persist dispatch receipt; background refresh remains independent | Usage freshness/health projection | unavailable/stale failure remains visible and does not overwrite current projection |
| PMConcept7 Ledger attempt drill-through | `cmd.nav.open_usage_subject`, with stable `attempt_id` and `usage_event_ref` | `handlers::nav::open_usage_subject`; route/open owner resolves `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`; usage_event/provider/account/runtime refs are correlation | route/open receipt, no fabricated domain event, no `OpenSubject` | canonical Usage attempt inspector/route | missing/invalid attempt identity or unavailable target returns typed route/open failure without state mutation |
| Aggregate provider/account/panel details | `view_only` local inspector | current Usage projection; no router or command handler | no command, receipt, domain event, or persistence | local inspector | missing presentation data remains local; no fallback route or invented object kind |
| Usage Accounts Use this account | `cmd.account.select_profile`, shown only when `supports_manual_set_active` | `handlers::account::select_profile`; Multi-Account owner (`Plans/Multi-Account.md#MA-073`) | dispatch receipt and the existing `account_switch_event` history; no Usage-side state | the account card and every account and provider projection | past the provider's switch point it asks first; declining dispatches nothing; owner disabled reasons stay visible |
| Usage Accounts provider Auto-switch toggle and switch level | `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` at scope `provider` | `handlers::settings::transaction_preview` / `handlers::settings::transaction_apply`; Settings owner (`Plans/Settings_System.md#SSYS-044`) | one Settings transaction per settled change, read back | the provider plate and Settings › Providers & Accounts, showing the same value | stale revision, invalid value or denial leaves the stored value and both surfaces unchanged and shows the reason |
| Usage room/scope/range/disclosure/filter/More-menu | `view_only` | current Usage view projection | no command/receipt/event; settled preference storage remains storage-owned | current Usage render | dismissal/cancel restores or retains prior local selection |
| Usage Live / Paused | `view_only` | current Usage view projection holds or applies arriving projection updates | no command/receipt/event; the remembered choice is the storage-owned Usage view preference `live` | current Usage render | none; the concept's demo controls have no row (`Plans/usage-feature.md#UF-107`) |
| Context ring popup/hover | `view_only` | shared Assistant local overlay projection | no command/receipt/event | compact context summary | dismissal emits nothing |
| Context ring `Compact Now` | `cmd.chat.compact_context` | `handlers::chat::compact_context`; live Prompt Pipeline/context owner | explicit dispatch receipt and visible result/projection; no fabricated `context.compaction.*` event while unregistered | the same ring and Context Detail Pane | already-running/no-op/degraded/unavailable/retry/failed states remain visible and preserve thread identity |
| Context ring `More Details` and pane focus/close | existing thread Context Detail Pane commands | `handlers::chat::*thread_context_details`; shared Assistant/thread state | no-persist receipt/layout state | one shared Context Detail Pane | unavailable/close returns focus deterministically; no second pane store |
| Chat visibility/seat | `cmd.panel.switch` for visibility; re-seating itself is shell-local identity-preserving projection | shell panel reducer plus one shared Assistant node/store | no clone and no transcript/state fork | Home saved dock or right-side global dock | failed seat restores the prior host; node identity and thread state remain intact |

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
  its target footprint and visibly repack only obstructed peers, with Usage board gravity applied at settle and
  never previewed, while Dashboard resize peers remain frozen; one changed
  pointer release, keyboard reorder drop, or atomic keyboard-resize activation commits through cmd.widget.* or
  cmd.workspace_layout.*, and on Usage that one command carries the whole settled room, gravity included. Usage
  Tidy commits the whole repacked room as one settled layout transaction through exactly one existing
  cmd.widget.move carrying arrange { mode: tidy, detail } with one receipt, never one move per card, and a
  size-picker preset commits one cmd.widget.resize. The Usage Accounts room's Use this account reuses the
  account-select row, and each provider's Auto-switch toggle and switch level reuse the Settings transaction rows at
  scope provider; Live / Paused is view_only, and the concept's demo controls have no row (UF-107). Usage refresh and stable-event
  drill-through reuse their existing rows while current PMConcept7 aggregate provider/account/panel details
  remain local inspectors; Context-ring actions reuse their existing rows; and the same
  Assistant node/store is re-seated across Home and global docks without cloning. The concept-only size_surface
  token is normalized to resize_surface, rejected provider management stays unwired, and
  no pointer-preview event family is added.
gui_related: true
gui_classification_reason: The wiring contract connects the recovered visible controls, their disabled/error states, and the shared Assistant seating behavior.
split_recommended: false
depends_on: [WM-044, CS-068, UCC-147, WS-019, SP-249, SP-250]
unblocks: [UIW-012, DR-039, ACD-448]
acceptance_criteria:
  - Prose and production JSON agree on producer, command/disposition, handler, selector/store, persistence/effect, receipt, consumer, cancel, and error behavior for every covered family; event-primary callers use usage_event/usage_event_ref, while a PMConcept7 Ledger attempt row dispatches cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject and retains usage_event_ref plus provider/account/runtime refs as correlation. Current aggregate cards remain local with no command, receipt, or event. The production matrix retains all 726 keys and this recovery enriches exactly 40 existing rows, comprising the 13 named catalog rows for Chat Context, Usage, panel switching, and widget commands plus the 27 existing home.* rows; cmd.artifacts.show_in_usage and cmd.artifacts.show_in_ledger retain their pre-recovery bytes and are not counted in that enrichment set.
  - Preview frames, popup/hover disclosure, and cancellation produce zero commands, receipts, persisted events, and storage writes.
  - Changed widget pointer releases, keyboard reorder drops, atomic keyboard-resize activations, and changed Home releases produce exactly one existing semantic command and settle only after owner acceptance.
  - "A changed Usage move, resize, preset, hide, or show produces one command whose settled write includes every peer the resolver or Usage board gravity moved; a Tidy that moves cards produces exactly one cmd.widget.move, one receipt, and one write of widget_layout:v1:usage; no gravity or Tidy path produces a per-card command or a second commit."
  - "The Usage Accounts room's Use this account and each provider's Auto-switch toggle and switch level dispatch only cmd.account.select_profile and the cmd.settings.transaction.preview/apply pair at scope provider, the production rows catalog.account_select_profile, catalog.settings_transaction_preview and catalog.settings_transaction_apply name those Usage Accounts locations and catalog.widget_move names Usage Tidy, Live / Paused dispatches nothing, and the concept's demo controls (UF-107) have no production row."
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
  - "Concepts/usage-redesign/src/js/40-board.js (Usage redesign board: gravity and Tidy commits; source-lineage-only)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - view_only
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - pm.home_workspace_layout.v1
  - workspace.layout_changed
  - pm:command-dispatch
negative_constraints:
  - Do not treat a receipt as terminal domain success.
  - Do not wire Usage board gravity or Tidy as per-card commands, a second commit, or a new command.
  - Do not emit a command, event, or persistence write from pointer-preview or cancel state.
  - Do not clone the Assistant or create a second pane/store while re-seating it.
  - Do not create production rows for compatibility-only or rejected command tokens.
  - Do not route aggregate Usage cards, dispatch cmd.nav.open_usage_subject without the branch's stable selector, attach OpenSubject to either cmd.nav.open_usage_subject selector branch, or use correlation identity as the PMConcept7 Ledger object_id.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```
