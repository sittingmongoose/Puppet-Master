# Shard 061: Stream C closure fixes addendum (2026-11-26)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L22055-L22100

Source SHA256: `32e8fa9eee045837318f5fdf01b94605a92358f6ba36b7bf4217ce8fdc031945`

---

## Stream C closure fixes addendum (2026-11-26)

### Conflict Assistant requests and results

The four rows in [Source Control review and conflict commands](#source-control-review-and-conflict-commands) select `Plans/source_control_contracts.schema.json#/$defs/conflict_assistant_request_v2` and carry `Plans/source_control_contracts.schema.json#/$defs/conflict_assistant_owner_result_v1` through `source_control_command_result_v2.owner_result_ref`. They carry the exact Project, repository, worktree, status generation and `conflict_selection_ref`. A file selection supplies its repo-relative `path` and `conflict_id`. Resolve Side adds `resolution_side`, `confirmation_ref`, optional `hunk_id`, and `manual_result_ref` for `manual` only. `Plans/WorktreeGitImprovement.md`, "Conflict Assistant command payloads and results", owns currentness, the Git writer lease, closed failures, exact return and effect receipts. DL-056 governs the Git-only mutations and Jujutsu view paths. The low-level `cmd.git.conflict_apply_resolution` keeps its separate request and choice set.

Retired audit wording is preserved below.

> Conflict assistant commands record resolution events and blocked-state handoff outcomes through `/event/storage`; they do not persist conflicted file content.

### PRD Builder revision resubmission

Amended 2026-11-24 (DL-2602, C-FIX79): `cmd.prd_builder.revision.resubmit`, the PRDB-014 targeted revision pass (`Resubmit with Annotations`), joins [Concrete PRD Builder, Planning Wizard, and Plan Compile command rows](#concrete-prd-builder-planning-wizard-and-plan-compile-command-rows), bringing that table to 29 canonical command ids. FinalGUISpec §7.19.2 bundle `Resubmit`, F3-150 and F3-322 dispatch it; `Plans/prd_planning_runtime_contracts.json` `ui_command_contracts` carries its contract and `Plans/Wiring_Matrix.production.json` row `catalog.prd_builder_revision_resubmit` wires it.

### Investigation Context Open target

| PMConcept token | Disposition |
|---|---|
| `cmd.chat.open_investigation_target` | Cataloged 2026-11-25 (C-FIX79): the Investigation Context `Open target` action (`Plans/assistant-chat-design.md` ACD-100). A no-persist `navigation_wrapper`: payload `thread_id` and `investigation_id`; it opens the investigation's `effective_target` (else `target`, by `debug_target_kind`) in the surface that owns that target through that surface's existing route, and never opens a raw payload (ACD-092). Disabled reasons: `stale_projection` when the target no longer resolves (the user runs `Revalidate target` first) and `unreachable` when the owning surface cannot open it. It records a no-persist route/open disposition and emits no event. The chat document's older Open target spelling is retired there, not aliased. |

### Persona update operations

Amended 2026-11-25 (DL-2602). The historical `cmd.persona.update` row under [Added GUI command families](#added-gui-command-families) keeps its `persona_patch` sketch. The active request is `persona_update_request_v2`, a whole-record request whose `update_operation` field selects `edit` (default), `set_enabled` (with `enabled: boolean`) or `restore_shipped_default`, with the refusals in `Plans/Personas.md` §4.1 item 5 (`invalid_args` for a protected core built-in or a Persona with no shipped default, `stale_projection` for a stale `expected_owner_revision`); every operation's success is `persona.updated`. There are no separate disable, restore or validate-schema commands.

### Settings provider media route verification

| Command ID | Label | Preconditions and producer | Owner and sole handler | Typed payload and result |
| --- | --- | --- | --- | --- |
| `cmd.media.route.verify` | Verify | Explicit human activation in Settings > Providers on one exact provider/account/model/output-mode row. The media owner must admit the current row and its probe. | `Plans/Media_Generation_and_Capabilities.md`, "Generated Media Route Row Schema". `handlers::media::verify_route`. | `Plans/media_route_verification_contracts.schema.json#/$defs/MediaRouteVerifyRequest` → `Plans/media_route_verification_contracts.schema.json#/$defs/MediaRouteVerifyResult`. |

This media-owned `domain_action` uses `catalog.media_route_verify` in `Plans/Wiring_Matrix.production.json`. Settings renders the per-row owner availability and disabled reason before dispatch and restores focus to the initiating row. It reads the route ID, output mode and capability snapshot from that same row. This action remains `handler_unavailable` until native handler proof exists. The closed `UICommandResponse` (CV-333) references the typed media result and receipt, with no new command EventRecord. Opening the Settings recovery link, verifying an auth profile or installation, and refreshing a model catalog do not invoke this action.

### GitHub Actions subview commands and alias dispositions

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.github.actions.open_current_branch` | Open Current Branch | `navigation_wrapper` | always | none | `unsupported` | github_actions |
| `cmd.github.actions.settings.open` | Open Actions Settings | `navigation_wrapper` | always | none | `unsupported` | github_actions |

Added 2026-11-25: `cmd.github.actions.open_current_branch` opens the GitHub Actions `Current Branch` subview and `cmd.github.actions.settings.open` opens its `Settings` subview, two of the three stable subviews `Plans/GitHub_Integration.md#GI-008` names (`Current Branch`, `Workflows`, `Settings`). Both are route/open commands with no persisted event: each records a no-persist route/open disposition, and the subview itself shows a missing GitHub link or sign-in as its own state, so neither command is disabled for it. They are the live rows for the two ids UCC-047 preserves, already wired in `Plans/Wiring_Matrix.production.json` (`catalog.github_actions_open_current_branch` to `handlers::github::actions_open_current_branch`, and `catalog.github_actions_settings_open` to `handlers::github::actions_settings_open`). The legacy route token `/Workflows/Settings` resolves to `cmd.github.actions.settings.open`. The other three UCC-047 tokens use the compatibility dispositions below.

| Token | Disposition | Canonical target and notes |
|---|---|---|
| `cmd.actions.show` | live compatibility route | Opens the GitHub Actions side panel through `catalog.actions_show` and `handlers::actions::show`. Dispatch records a no-persist receipt or route/open disposition. Legacy `cmd.github_actions.show` normalizes to this command. |
| `cmd.actions.switch_subview` | live compatibility switch | `catalog.actions_switch_subview` dispatches `subview` = `current_branch` \| `workflows` \| `settings` to `handlers::actions::switch_subview` for the corresponding GI-008 subview and records a no-persist receipt or route/open disposition. Legacy `cmd.github_actions.switch_subview` normalizes to this command. No further `cmd.actions.*` id may be minted. |
| `cmd.github.actions.open_run_diff` | alias-of `cmd.github.actions.open_related_diff` (run-scoped) | The run-detail wiring row `catalog.github_actions_open_run_diff_canonical` uses `handlers::github::actions_open_related_diff` and the canonical no-persist effect. Both this spelling and legacy `cmd.github_actions.open_run_diff` normalize before dispatch and preserve the invoked spelling in provenance. |
