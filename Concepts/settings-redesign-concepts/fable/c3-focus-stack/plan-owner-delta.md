# c3-focus-stack — Plan-owner delta (fable, final cumulative packet 2026-08-08)

Concept register only. Nothing here edits canon; the audit adjudicates.

## 1. Owners touched

| Owner | Kind | One-line evidence |
| --- | --- | --- |
| Plans/LSPSupport.md | extends | Registry provenance per server, custom-server CRUD with honest persistence, requested/effective attachment via the shared resolver (Prettier owns TS formatting, reason shown), phased restart, logs, restart-cap/log-detail limits, remote degradation copy, manual-only rule for unproven ownership. |
| Plans/Formatters_System.md | extends | detected \| not-found \| disabled state enum, global enable + format-on-save row, Test-on-a-sample contract (scratch buffer, never project files) with rendered before/after, per-host install hint for Black, Global/Project scope per entry, custom add/remove/reset. |
| Plans/FileManager.md | extends | Tree drag/drop-ask policy, hidden/ignored treatments, large-file threshold, shell-capped tab limit, split groups, changed-on-disk prompt\|reload\|keep, autosave + recovered-buffer entries, and the offline-path contract (listed with reason, refusals carry it). |
| Plans/Commands_System.md | extends + conflicts | Custom command lifecycle with validation and risky-pattern flagging; the dry-run guarantee (never dispatches to an agent, no run button, on-surface copy) conflicts with any surviving prose that lets previews send scaled-down requests. |
| Plans/UI_Command_Catalog.md | extends | Shortcut search, functional conflict resolution (winner keeps the keys, loser suspended not deleted), recorder-based remap with live conflict check, reset-after-remap, import/export receipts, cheat sheet; census flags in candidate-command-delta.json. |
| Plans/MCP_Integration.md | extends | Requested vs negotiated protocol with consequences, lazy per-tool exposure, approval once\|session\|persistent + per-tool overrides, resources vs templates, discovery-cache freshness with honest refusal while disconnected, add-server-is-not-connect, CLI projection note. |
| Plans/Skills_System.md | extends | Provenance-first catalog, trust as reviewed permissions, enable-confirms-exactly-the-requested-authority for untrusted skills, uninstall resets trust, project skills live in the repo. |
| Plans/Plugins_System.md | extends | Lifecycle grammar active \| update-available \| failed \| unloaded with channels; failed refuses reload with the honest reason; update runs staged phases; unload without restart. |
| Plans/Tools.md | extends | The five-stage measured funnel (installed, enabled here, available now, selected this turn, invoked recently) with per-stage reasons; stages are measured, never derived from the previous stage. |
| Plans/Automated_Testing_System.md | extends | The eleven-capability Global/Project matrix with Auto/On/Off + inherit-global, inline reasons, exposure on matrix rows (persistent eval expert behind a confirm sheet), DAP/eval/capture riding the same matrix. |
| Plans/FinalGUISpec.md | extends | Sheet-stack composition: layer spine, disclosure-as-navigation, crossfading you-are-here chip, pushState sheet routes + replaceState scrollspy, browser Back closes the top sheet, cross-page receipts with live deep links. |
| Plans/settings_inventory.json | conflicts | Missing rows/collections: formatter table, testing matrix cells, file-manager values, per-server LSP/MCP config. Census discrepancy 817–826 across artifacts must be resolved before minting. |
| Settings schema/registry | extends | Requested/effective pairs as a first-class shape, independent funnel booleans, resource-scoped settings addressing, exposure attachable to collection members. |
| Plans/Models_System.md | extends | Effort arrays, catalog-sourced Fast with evidence sheets, Haiku fastNote (never name-inferred), requested/effective via PMProvider.resolveRoute. |
| Plans/Multi-Account.md | extends | Account cards with auth owner/isolation/priority/use-next/sticky; batch-reviewer account fallback with the continuation-policy reason surfaced. |
| Plans/CLI_Bridged_Providers.md | extends | Installations sheet fixtures: selected + shadowed + Tool Store, ask-first update with the seven-condition verification, honest failure + rollback with both history entries, manual-only for unknown ownership, cursor-cli explicit acquisition. |
| Plans/Provider_OpenCode.md | extends | serverInfo facts, server-supplied catalog, scoped vault token reference only; upstream keys never leave the server. |
| Wiring matrix owner | extends | Eleven keystone traces registered (candidate-wiring-delta.json), all flagged concept_local_state with real recovery deep links. |

## 2. Supersessions demanded

1. **Chip/bloom Settings contract.** Superseded by the persistent layered workspace (spine + sheet stack + router). `cmd.settings.bloom.open` is flagged retire, with a compatibility alias to `cmd.settings.open` only if telemetry shows callers.
2. **Stale right-side-panel language.** All navigation copy assumes the left Activity Bar controlling one adjacent left side-panel slot; the sheet stack lives in the main workspace and coexists with rail, chat panel, and status bar at every tested width.
3. **Dry-run-that-dispatches.** Any surviving plan text that lets a command preview send work to an agent (scaled-down request, sample run, background validation call) is superseded. The demonstrated guarantee: a dry run expands locally, dispatches nothing, queues nothing, attributes no usage, and its surface says so with no run button. This is a safety property, not a styling choice.
4. **Invalid inventory values.** Blank-means-auto is superseded by explicit value chips everywhere; terminal shell source, paste policy, and link policy render Automatic/Inherited/App-default chips when data is absent.

## 3. Boundary confirmations

- **Dry run never dispatches.** Confirmed in copy, in the wiring trace (`c3.command.dry_run` asserts no dispatch and no usage attribution), and in composition (the preview sheet has no run affordance). Execution belongs to the normal command path under permission rules.
- **MCP auth boundaries.** Server auth renders as data (local process / PM direct sign-in / API key reference); tokens are vault references; the Claude-CLI projection is read-only with Puppet Master as owner; adding a server never connects it, and rediscovery refuses honestly while disconnected.
- **Funnel-state truthfulness.** A tool stage is true only when measured true. Disabling a project tool clears downstream stages immediately; enabling re-measures on the next turn instead of assuming availability. The Linear tool stays "Enabled, not available" while its server is down, with the reason attached.
- **Provider-CLI explicit acquisition is unaffected by tool-class lifecycle reuse.** Skills, plugins, tools, formatters, and LSP servers share the lifecycle grammar (install/update/unload/verify), but provider CLIs keep their stricter acquisition contract: explicit user-triggered install, official source, exact host/environment, never bundled, never demand-triggered, install separate from sign-in. Reusing the lifecycle grammar for tool classes must not soften that contract — the cursor-cli offer sheet demonstrates the stricter path side by side with the softer tool-class flows.
- **Settings vs runtimes.** Restarting an LSP server, reconnecting an MCP server, and testing a formatter are supervised one-shots with receipts; Settings never becomes a live console. Logs sheets are read-only excerpts; full logs live with diagnostics outside Settings.
- **Sibling ownership.** Personas (and the other c1/c2/c4 families) are answered with honest cross-page receipts carrying real deep links; persisted views naming removed surfaces fall back to Home instead of resurrecting them.
