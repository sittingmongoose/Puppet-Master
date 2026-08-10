# Plans Command Registry — GUI controls for Usage-page prototypes

Canonical IDs verified in the CURRENT corpus (2026-07-30). Owner = the doc that owns the ID/behavior. Persistence/mutation from the catalog row's event column + wiring. Flags: Net = needs network/provider; Paid = cost/billing-bearing; Dest = destructive/irreversible (confirmation class per FinalGUISpec §10.1). "Proto-only" = appears only in the prototype build plan / concept HTML, no canonical Plans registration.

Source key: UCC = `Plans/UI_Command_Catalog.md` §2 canonical-command-ids; WM = `Plans/Wiring_Matrix.md`; WMp = `Plans/Wiring_Matrix.production.json`; ACD = `Plans/assistant-chat-design.md`; F3 = `Plans/FinalGUISpec.md`; UF = `Plans/usage-feature.md`; WS = `Plans/Widget_System.md`; RP = `Concepts/usage-concepts/BUILD_PLAN.md` (build plan, NOT canonical).

| Control (prototype) | Canonical command ID | Owner module | Mutation / persistence | Net | Paid | Dest | Proto-only? | Citation |
|---|---|---|---|---|---|---|---|---|
| Context ring → Compact Now | `cmd.chat.compact_context` | assistant-chat (ACD-434/441); UI_Command_Catalog | Mutation; emits `context.compaction.started/completed/failed`; status enum | Y (provider compaction) | N | N (light; explicit only) | No — canonical | UCC L745; WM L385; ACD L11875 |
| Context ring → More Details | `cmd.chat.open_thread_context_details` | assistant-chat §12; usage-feature UF-012; FinalGUISpec F3-132 | Layout/UI state only (open/focus editor-tab pane) | N | N | N | No — canonical | UCC L746,L752; WM L384 |
| Context Detail focus/close | `cmd.chat.focus_thread_context_details` / `cmd.chat.close_thread_context_details` | UI_Command_Catalog (Context Detail Pane family) | UI state only | N | N | N | No — canonical | UCC shard 019 L32 |
| Context Lens open/close | `cmd.chat.context_lens.toggle` | assistant-chat §176; FinalGUISpec F3-306 | UI state (dropdown open/close) | N | N | N | No — canonical | UCC L705; WM L346 |
| Context Lens mode | `cmd.chat.context_lens.set_mode` | assistant-chat; UI_Command_Catalog | UI/overlay state (one mode at a time) | N | N | N | No — canonical | UCC L706; WM L347 |
| Context Lens Turn Off | `cmd.chat.context_lens.turn_off` | UI_Command_Catalog | Clears selection state | N | N | N | No — canonical | UCC L707 |
| Context Lens select msg | `cmd.chat.context_lens.toggle_message_selection` / `clear_selection` | UI_Command_Catalog | Thread-local overlay store; does not mutate history | N | N | N | No — canonical | UCC L708–709; WM L349 |
| Context Lens Subcompact apply/revert | `cmd.chat.context_lens.apply_subcompact` / `revert_subcompact` | assistant-chat; Prompt_Pipeline (dynamic shrinking owner) | Mutation (creates local summary artifact); explicit confirm | Y | N | N (explicit apply/revert) | No — canonical | UCC L710–711; WM L354 |
| Widget add (Dashboard/Usage) | `cmd.widget.add` `{page, widget_id}` | UI_Command_Catalog §2 | No persisted domain event (UI layout state) | N | N | N | Canonical, but see conflict G1 | UCC L375 |
| Widget add (repaired entrypoint) | `cmd.dashboard.add_widget` `{project_id, dashboard_id, widget_id, layout_slot,…}` | UI_Command_Catalog (Fable closure addendum); FinalGUISpec L27735 | Mutation; emits `dashboard.widget_added`; persists layout | N | N | N | Canonical (duplicate of cmd.widget.add) | UCC shard 017 L55; WMp L6943; F3 L27735 |
| Widget catalog open | `cmd.dashboard.catalog` `{surface, filter?, cache_policy}` | UI_Command_Catalog | No persisted event (dispatch receipt / route-open) | N | N | N | No — canonical | UCC shard 017 L56; WMp L7005 |
| Widget remove | `cmd.widget.remove` `{page, instance_id}` | UI_Command_Catalog §2 | No persisted domain event (UI layout state) | N | N | Y (light) | No — canonical | UCC L376; WM L72 (EXAMPLE row) |
| Widget resize | `cmd.widget.resize` `{page, instance_id, col_span, row_span}` | UI_Command_Catalog §2 | UI layout state (free grid-span) | N | N | N | No — canonical | UCC L377 |
| Widget configure (gear) | `cmd.widget.configure` `{page, instance_id, config}` | UI_Command_Catalog §2; Widget_System WS-004 | UI layout state (presentation/local filter only) | N | N | N | No — canonical | UCC L378; WS L34 |
| Widget move | `cmd.widget.move` `{page, instance_id, col, row}` | UI_Command_Catalog §2 | UI layout state | N | N | N | No — canonical | UCC L379 |
| Widget reset layout | `cmd.widget.reset_layout` `{page}` | UI_Command_Catalog §2 | UI layout state | N | N | Y (light) | No — canonical | UCC L380 |
| Widget **focus mode** | — NONE — | (unowned) | — | — | — | — | **YES — prototype-only** (RP L53 kebab "focus") | gap G2 |
| Widget **S/M/L/XL presets** | map to `cmd.widget.resize` col_span/row_span | UI_Command_Catalog (resize) | UI layout state | N | N | N | **Presets prototype-only** (RP L53); primitive canonical | gap G3 |
| Theme set (variant/mode) | `cmd.theme.set_mode` `{scope, mode, expected_theme_revision, idempotency_key}` | FinalGUISpec §6; UI_Command_Catalog (Fable addendum) | Mutation; emits `settings.theme.updated`; persists `theme:v1` | N | N | N | No — canonical | UCC shard 017 L23; WMp (theme family) |
| Theme accent | `cmd.theme.set_accent` | UI_Command_Catalog | Mutation; `settings.theme.updated` | N | N | N | No — canonical | UCC shard 017 L24; WMp L26135 |
| Theme density | `cmd.theme.set_density` | UI_Command_Catalog | Mutation; `settings.theme.updated` | N | N | N | No — canonical | UCC shard 017 L25 |
| Theme preview | `cmd.theme.preview` `{theme_patch, preview_surface, ttl_ms}` | UI_Command_Catalog | No persisted event (dispatch receipt, TTL preview) | N | N | N | No — canonical | UCC shard 017 L26; WMp L26018 |
| Theme reset | `cmd.theme.reset` | UI_Command_Catalog | Mutation; `settings.theme.updated` | N | N | Y (light) | No — canonical | UCC shard 017 L27; WMp L26073 |
| **Reduced-motion toggle** | — NONE — | (setting, not command) | `reduce-animations` setting drives reduced-motion; `prefers-reduced-motion` honored | N | N | N | **YES — no canonical command ID** (RP L26 manual MOTION toggle) | gap G4 |
| Usage refresh | `cmd.usage.refresh` | usage-feature UF-089; UI_Command_Catalog | Domain action (re-read projections); icon-only button | Y (provider routes) | N | N | No — canonical | UCC shard 020 L114; shard 021 L477 |
| Usage export | `cmd.usage.export` `{scope: snapshot|ledger}` | usage-feature; UI_Command_Catalog | Domain action (JSON export; ledger preserves usage_event_refs); icon-only | N | N | N | No — canonical | UCC shard 020 L113 |
| Nav to usage subject | `cmd.nav.open_usage_subject` (+ `cmd.nav.open_subject`, `cmd.nav.focus_route`) | UI_Command_Catalog §2; Crosswalk | Route/open (object-first; route_target.object_kind=usage_event) | N | N | N | No — canonical | UCC L92–93; shard 019 L23; Crosswalk L267 |
| Chat archive (kebab) | `cmd.chat.archive` | assistant-chat ACD-443 | Mutation | N | N | Y (light) | No — canonical | ACD L24281,L24316 |
| Kebab Duplicate/Pop out/Cycle/Close | — NONE (surface affordances) | assistant-chat ACD-443 | No new command registrations | — | — | — | No command by design | ACD L24282,L24318 |

## Notes on flags
- **Confirmation classes** (FinalGUISpec §10.1, shard 017 L15–23): `none | light | strong | hard_gate`, recorded separately from reversibility. Widget add/remove/reset and theme reset are low-risk reversible → `light`/`none`. `apply_subcompact` needs explicit confirmation (creates an artifact).
- **Disabled-reason closed set** for mutation rows: `stale_projection | permission_required | unreachable` (e.g. UCC L10689/UCC-140). Theme rows add `invalid_args`, `handler_unavailable`.
- **Network/paid:** `cmd.usage.refresh` and `cmd.chat.compact_context` touch provider routes; cost figures are projections over the single UsageRecord cost authority (UF-087) — no command here is "paid" in the spend-authorizing sense (budget gates live elsewhere, usage-feature L5226).
- **Retired aliases never registered:** `cmd.chat.open_thread_usage` / `focus_thread_usage` / `close_thread_usage` are compatibility-only; production wiring must not register them (UCC shard 019 L23). `cmd.widget.*` bare prefix and `cmd.theme` bare prefix are listed in `Wiring_Matrix.production.exclusions.json` L56/L60 (the concrete subcommands above are the registered rows).
