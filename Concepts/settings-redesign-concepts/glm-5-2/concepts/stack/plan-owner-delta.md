# Plan-Owner Delta — Concept 03 Stack (GLM-5.2)

Concept: **concept-03-stack** — single-surface progressive disclosure. Settings Home is one vertical stack of expandable destination rows; search is the stack head; selecting a destination expands it in place (push/pop FLIP depth). Deep-owns the C3 bucket (File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools, Testing & Debug) and demonstrates core. This delta is provisional; the audit agent adjudicates exact canonical names. No SQLite; no Playwright terminology (PM-native Browser Program only); CLI-owned OAuth boundary respected.

---

### impact — `Plans/FinalGUISpec.md`
`gui_related: true`

- Settings workspace is a single expandable stack, not a category modal/bloom and not a persistent right-rail split. Destination rows expand IN PLACE with push/pop FLIP depth and a sticky in-row subnav; notices sit at the stack head; collapse-all returns to stack top.
- `cmd.settings.manager.open` supersedes `catalog.settings_bloom_open`; deep-links expand the target destination + subcategory + focus-flash the setting row (no bloom modal).
- Expanded-destination is **model state** (`active_destination_id` + `expanded_set` + `active_subcategory`), NOT DOM measurement. FLIP computes first/last geometry on the web demo only; Slint maps each expand to a property/layout animation. Reduced-motion reaches the same final state instantly.
- Supersedes: legacy one-category bloom modal, category filter chips, right-rail detail pane split.
- Related provisional commands: `cmd.settings.expand`, `cmd.settings.collapse`, `cmd.settings.collapse_all`.

### impact — `Plans/settings_inventory.json` (+ schema)
`gui_related: false`

- Inventory must expose the C3 families under `code` / `extensions` / `system` / `planning` categories with the subgroup model the stack consumes (`code.terminal`, `code.editing`, `extensions.skills` / `plugins` / `commands`, `system.mcp`, `planning.testing`).
- Every row carries an explicit nine-state chip (Default/Recommended/Inherited/Auto/Not-configured/Managed/Custom/Unavailable/Effective-differs) + value source + exposure level (Standard/Advanced/Expert-risky/Managed-read-only/Diagnostic/Unavailable). Blank is never a state.
- Distinguish `persistent_value` vs `one_shot_action` vs `manager_navigation` so `code.editing.lsp-restart`, command dry-run, and open-manager are NOT stored as preferences.
- Retire stale `regular/yolo` command-mode coupling → `extensions.commands.command-mode` (Freedom-level: Safe/Normal/Unrestricted) + shell-safety gate.
- Retire invalid inventory values: blank-as-state, dual-formatter silent fallback, boolean tool toggle.

### impact — `Plans/FileManager.md`
`gui_related: true`

- Inline file-manager surface inside the expanded "Code & Execution" destination demonstrating: virtualized/lazy tree, workspace-only drag/drop (FileSafe enforced), hidden/ignored (`.gitignore` + globs), large-file hex preview above `code.editing.large-file-threshold`, tabs/split groups, changed-on-disk (reload/keep/compare), recovery + transient/unavailable reasons.
- Reuses canonical verbs: `catalog.file_open`, `catalog.file_new_file`, `catalog.file_rename`, `catalog.file_delete`, `catalog.file_expand_capped`, `catalog.editor_close_tab`.
- Slint port: production tree must be virtualized/lazy (viewport-windowed) with expand-capped semantics; tree state is model-owned.
- Provisional new verbs: `cmd.file_manager.tree_reveal`, `cmd.file_manager.changed_on_disk.resolve`.

### impact — `Plans/LSPSupport.md`
`gui_related: true`

- LSP catalog rows: registry/catalog/provenance, startup mode, requested vs effective attachment (RequestedEffectiveInspector), **formatting-ownership conflict** badge when a server exposes `formatDocument` while a Formatter also owns the language, restart + open-logs, remote degradation via AvailabilityReason.
- Reuses `catalog.lsp_restart_server`, `catalog.lsp_format_document`, `catalog.lsp_format_selection`.
- `lsp.format_document` is flagged as a **conflict** with Formatters_System: a single-ownership resolve flow must designate the effective owner before format dispatch; default resolves to the formatter when a custom formatter owns the language.
- Provisional new verbs: `cmd.lsp.server.add`, `cmd.lsp.server.open_logs`, `cmd.lsp.formatting_ownership.resolve`.

### impact — `Plans/Formatters_System.md`
`gui_related: true`

- Formatter table: global enable, built-in/custom rows, detected/not-found/disabled health, command/env/ext, add/remove/reset, Global/Project scope, health+test, **single-ownership-per-language** conflict resolution (two claimants → one effective owner + demoted losers, never a silent dual-run).
- Provisional new verbs: `cmd.formatter.add`, `cmd.formatter.test`, `cmd.formatter.remove`, `cmd.formatter.reset`, `cmd.formatter.resolve_conflict`, `cmd.formatter.scope.set`.
- Fixtures: formatter single-ownership conflict (prettier vs biome), `shfmt not-found` (health=not_found + SetupFlowLauncher).

### impact — `Plans/Commands_System.md`
`gui_related: true`

- Dedicated Commands & Shortcuts manager: custom command lifecycle (create/update/delete), parameters/includes, shell-safety gate, **dry-run preview (HARD-GATED to NEVER send to an agent)**, validation, shortcut search/conflict/remap/reset/import/export/cheat-sheet.
- Dry-run invariant: payload MUST carry `dispatch_target=preview_only` and `agent_recipient=null`; the event `command.dry_run.previewed` is explicitly preview-only and never crosses the agent dispatch boundary. Related existing setting: `catalog.settings_agent_rules_dry_method_default_guard_set`.
- Retire stale `regular/yolo` → Freedom-level modes.
- Provisional new verbs: `cmd.commands.custom.create/update/delete/dry_run`, `cmd.shortcuts.bind/remap/reset/import/export/conflict.resolve`.
- Fixtures: shortcut conflict (Cmd+Shift+P collision), dry-run-never-sends-to-agent.

### impact — `Plans/UI_Command_Catalog.md`
`gui_related: false`

- Census reuses canonical IDs: `catalog.lsp_restart_server`, `catalog.testing_capability_policy_set`, `catalog.testing_visibility_policy_set`, `catalog.catalog_install_item` / `catalog_update_item` / `catalog_remove_item` (with a `kind=skill|plugin|tool` discriminator), `catalog.remote_reconnect` (aliased for MCP reconnect), `catalog.terminal_open`, `catalog.file_open`, `catalog.editor_close_tab`, `catalog.search_show` / `search_open_result`.
- Retire/alias `catalog.settings_bloom.open` → `cmd.settings.manager.open`.
- New candidate families (provisional): `cmd.formatter.*`, `cmd.commands.custom.*`, `cmd.shortcuts.*`, `cmd.mcp.server.add/restart`, `cmd.skill/plugin/tool.enable`, `cmd.tool.select_for_turn`, `cmd.lsp.server.add`.
- `lsp.format_document` flagged as a **conflict** between LSP and Formatters ownership (pending adjudication).
- 144 UCC PlanUnits referenced; no canonical name minted by this concept.

### impact — `Plans/MCP_Integration.md`
`gui_related: true`

- MCP resource rows: transport (stdio/remote-url/sse), scope, exposed-tools-of-total, approval duration, last-contact, reconnect-on-failure with a visible transport-aware receipt, lazy-exposure, logs.
- `cmd.mcp.server.reconnect` aliases `catalog.remote_reconnect` (no parallel verb); carries transport-aware receipt + exposed-tools re-probe.
- Provisional new verbs: `cmd.mcp.server.add`, `cmd.mcp.server.restart`, `cmd.mcp.server.approve`, `cmd.mcp.server.open_logs`.
- Reuses settings: `system.mcp.server-list`, `system.mcp.transport`, `system.mcp.server-scope`, `system.mcp.lazy-exposure`, `system.mcp.timeout`, `system.mcp.health-status`, `system.mcp.oauth-refresh`.
- CLI-owned vs PM-direct OAuth boundary respected on every reconnect/auth step.
- Fixture: MCP reconnect-failed (AvailabilityReason + retry/deep-link).

### impact — `Plans/Skills_System.md`
`gui_related: true`

- Skills manager is the **shared host** for catalog/provenance/trust, install/update/compatibility/unload, project-enablement, effective-availability, policy/risk — AND demonstrates the four distinct kinds (skill / plugin / tool / command-as-kind) with shared row grammar and a `kind` discriminator.
- Install/update/remove reuse `catalog.catalog_install_item` / `catalog_update_item` / `catalog_remove_item` (kind=skill).
- Provisional new verbs: `cmd.skill.enable`, `cmd.skill.disable`, `cmd.skill.update`, `cmd.skill.validate`.
- Reuses settings: `extensions.skills.your-skills`, `extensions.skills.skill-on-off`, `extensions.skills.discovery`, `extensions.skills.auto-invocation`, `extensions.skills.validate`, `extensions.skills.permissions`, `extensions.skills.projection`.

### impact — `Plans/Plugins_System.md`
`gui_related: true`

- Plugins demonstrated as a **distinct kind** inside the Skills manager (package install [catalog vs local], hook-timeout, tool-override where plugins may replace built-in tools, remove) with a lifecycle distinct from skill enablement.
- Install/remove reuse `catalog.catalog_install_item` / `catalog_remove_item` (kind=plugin).
- Provisional new verbs: `cmd.plugin.enable`, `cmd.plugin.disable`, `cmd.plugin.update`.
- Reuses settings: `extensions.plugins.plugin-on-off`, `extensions.plugins.add-from-catalog`, `extensions.plugins.add-local`, `extensions.plugins.remove`, `extensions.plugins.packages`, `extensions.plugins.hook-timeout`, `extensions.plugins.tool-override`.

### impact — `Plans/Tools.md`
`gui_related: true`

- Tools demonstrated as a **distinct kind** with the full **5 lifecycle states**: installed / project-enabled / currently-available / selected-for-turn / actually-invoked. Effective-availability is the projection (RequestedEffectiveInspector); `selected-for-turn` is a transient per-turn mutation that does NOT invoke.
- Reuses settings: `system.mcp.tool-toggle`, `safety.rules.per-tool-permissions`, `safety.rules.default-tool-permission`, `personas.tools.tool-posture`, `ai.usage.max-tool-rounds`.
- `system.mcp.tool-toggle` must reflect the 5-state ladder, NOT a boolean (enabled ≠ available ≠ selected ≠ invoked).
- Provisional new verbs: `cmd.tool.enable`, `cmd.tool.disable`, `cmd.tool.select_for_turn`, `cmd.tool.invoke_preview`.
- Fixture: tool 5-state ladder (installed + project-enabled + currently-available + selected-for-turn + not-yet-invoked).

### impact — `Plans/Automated_Testing_System.md`
`gui_related: true`

- Per-capability Auto/On/Off grid: unit/integration, **built-in browser = PM-native Browser Program (NO Playwright terminology)**, desktop/native, hot-reload, simulator/emulator/device (may be unavailable), API/database, console/network, perf/sec/a11y, DAP debugger, persistent eval, capture/artifacts.
- Tri-state `Auto` resolves to On/Off at runtime given environment; unavailable capabilities surface AvailabilityReason (not a hard error).
- Reuses `catalog.testing_capability_policy_set` / `catalog.testing_visibility_policy_set` / `catalog.testing_open_panel` / `catalog.testing_run` / `catalog.testing_cancel_run`; DAP reuses `catalog.run_debug_*` / `catalog.debug_*`.
- Provisional new verb: `cmd.testing.capability.set` (reuses the canonical capability-policy verb with a capability param — do NOT mint a per-capability verb).
- Fixtures: simulator/emulator/device unavailable (Auto→Off).

### impact — `Plans/BinaryLocator_Spec.md`
`gui_related: false`

- Provider/Account/Model/Installation manager demonstrates all **7 installation lifecycle fixtures** (found+ready, found+not-signed-in, multi-install shadowed, unknown-owner manual-only, explicit install, update-available-ask, update-scheduled-idle + verify-failed-then-rollback) with requested/effective provider+model.
- **CLI-owned vs PM-direct OAuth boundary** labeled distinctly per installation card: CLI-owned OAuth profile (e.g. Claude CLI), PM-direct OAuth (e.g. OpenAI), API-key connection, OpenCode external server. PM never bypasses CLI-owned OAuth.
- Reuses `catalog.provider_switch_route`, `catalog.account_select_profile`, `catalog.health_provider_setup_open`, `catalog.onboarding_provider_setup_open`.
- Provisional new verbs: `cmd.provider.installation.scan`, `cmd.provider.installation.select`, `cmd.provider.installation.verify`, `cmd.provider.installation.rollback`.
- Fixture: verify-failed-then-rollback (InstallationCard shows verify-failed then rollback-complete; requested/effective returns to last-known-good).
