## Appendix A: Cross-References

| Plan Document | Sections Incorporated |
|--------------|----------------------|
| `Plans/assistant-chat-design.md` | Chat panel (§7.16), modes, threads, steer/queue submission, subagent inline blocks, commands, activity transparency, plan panel, context usage, HITL-to-chat handoff |
| `Plans/FileManager.md` | File Manager (§7.17), File Editor (§7.18), embedded document pane shared-buffer contract (§7.19.1), click-to-open, @ mention, preview, external drag-and-drop, HTML preview/hot reload, click-to-context, open-file contract, shared buffer model, editor diff view, **SSH remote editing (§7.4.5 and §7.18)**, **run/debug configurations (§7.4.6 and §7.20.2)**, **terminal/browser tab management (§7.20.1)** |
| `Plans/usage-feature.md` | Usage page (§7.8), per-thread usage, ledger, analytics, 5h/7d visibility, alerts |
| `Plans/human-in-the-loop.md` | HITL settings (§7.4 Settings/HITL tab), HITL approval UI (§10.8) |
| `Plans/chain-wizard-flexibility.md` | Wizard redesign (section 7.5), intent selection, intent-specific fields, file upload limits, Builder opener + turn semantics, checklist status UI, findings preview, single final approval gate, tri-location chat pointers, embedded document pane + agent activity separation, pause/cancel/resume controls, recovery state, adaptive interview phases |
| `Plans/storage-plan.md` | Persistence (§15), seglog projections, redb schema, Tantivy |
| `Plans/agent-rules-context.md` | Settings/Rules tab (§7.4), application + project rules |
| `Plans/Glossary.md` | Product name "Puppet Master" throughout |
| `Plans/newfeatures.md` | Bottom panel/terminal (§7.20), thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, **instant project switch (§3.4)**, **sound effects (§10.13)**, **hot reload controls (§7.20 Ports)**, **instructions editor (§7.18)**, **language auto-detection (§7.3)** |
| `Plans/interview-subagent-integration.md` | Interview config tab (§7.4), agent activity (§7.19), embedded document pane (§7.19.1), findings summary preview, single final approval gate, multi-pass review |
| `Plans/orchestrator-subagent-integration.md` | Orchestrator (§7.1), orchestrator controls, node/package/lane/seam display |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings (§7.4), worktree recovery in Health tab |
| `Plans/FileSafe.md` | Advanced tab in Settings (§7.4), command blocklist, write scope, security filter |
| `Plans/MiscPlan.md` | Health tab "Clean workspace" button (§7.4), cleanup config in Advanced tab, Shortcuts tab (§7.4) |
| `Plans/Skills_System.md` | Agent Config panel (§7.4.7) |
| `Plans/feature-list.md` | Master feature reference: chat modes (§7.16), thread management, slash commands (§7.16.2), ELI5/YOLO, attachments, Teach, context management (§9.6), editor detach (§7.18), **storage and cache admin UI (§7.4.3)**, **unified settings/search/import/export (§7.4.4)** |
| `Plans/newtools.md` | MCP/settings alignment note and non-owning cited-search guidance; live provider/routing/billing canon stays in the owner docs. |

| `Plans/Commands_System.md` | Reserved built-in slash-command set for chat surfaces, including `/web` family behavior and deprecated aliases. |
| `Plans/UI_Command_Catalog.md` | Terminal reveal identities and canonical `cmd.chat.web.*` command ids consumed by chat and command surfaces. |
| `Plans/Permissions_System.md` | Tool permission keys, approval ladder, blocked-recovery defaults, and deterministic ask/plan behavior. |
| `Plans/MCP_Integration.md` | Requested/effective MCP availability, auth-state and connection-state enums, credential binding, and invalidation vocabulary. |
| `Plans/Tools.md` | Tool permissions in Permissions tab (§7.4.9), tool permission keys, presets, central tool registry, canonical approval ladder, web-provider matrix, routing algorithm, Firecrawl integration, and batch-operation contracts; tool usage widget on Usage page (§7.8); tool approval dialog in Chat (§7.16) |
| `Plans/LSPSupport.md` | LSP tab in Settings (§7.4.9), editor LSP features (§7.18: diagnostics, hover, completion, signature help, inlay hints, code actions, code lens, semantic highlighting, go-to-definition), **Chat Window LSP (§7.16: diagnostics in context, @ symbol with LSP, code-block hover/go-to-definition, Problems link)**, Problems tab (§7.20.2), status bar LSP indicator |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment; ensures GUI migration ties into broader rewrite plan |
| `Plans/FinalGUISpec.md` (internal clipboard contract) | Clipboard migration requirements and verification map: SelectableText contract (§8.1), context-menu clipboard contract (§10.9, §10.9.1-§10.9.3), migration gate (§16.4) |
