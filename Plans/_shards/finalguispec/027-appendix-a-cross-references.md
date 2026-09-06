# Shard 027: Appendix A: Cross-References

Source: `Plans/FinalGUISpec.md`

Source lines: L3975-L4012

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Appendix A: Cross-References

Cross-References inventory.

Reference rows must point at live owner documents or live section anchors, not nonexistent section numbers.

LF-007 stale-reference cleanup applies to this appendix and to `Plans/assistant-chat-design.md#20. References`: `Plans/FinalGUISpec.md#Appendix A: Cross-References` must keep references explicit to live owner documents or remove them, and stale-reference repairs must not remain implicit in packet scope.

| Plan Document | Sections Incorporated |
| --- | --- |
| `Plans/assistant-chat-design.md` | Chat panel, modes, threads, steer/queue submission, subagent inline blocks, commands, activity transparency, plan panel, context usage, and HITL-to-chat handoff. |
| `Plans/FileManager.md` | File Manager, File Editor, embedded document pane shared-buffer contract, click-to-open, @ mention, preview, external drag-and-drop, HTML preview/hot reload, click-to-context, open-file contract, shared buffer model, editor diff view, SSH remote editing, run/debug configurations, and terminal/browser tab management. |
| `Plans/usage-feature.md` | Usage page, per-thread usage, ledger, analytics, visibility windows, and alerts. |
| `Plans/human-in-the-loop.md` | HITL settings, approval UI, and dashboard calls to action. |
| `Plans/chain-wizard-flexibility.md` | Wizard redesign, intent selection, intent-specific fields, file upload limits, Builder opener and turn semantics, checklist status UI, findings preview, single final approval gate, tri-location chat pointers, embedded document pane separation, pause/cancel/resume controls, recovery state, and adaptive interview phases. |
| `Plans/storage-plan.md` | Persistence, seglog projections, redb schema, and Tantivy. |
| `Plans/agent-rules-context.md` | Application-level rules, project-level rules, and shared rules-pipeline context for orchestrator, interview, and Assistant. |
| `Plans/Glossary.md` | Product name "Puppet Master" throughout. |
| `Plans/newfeatures.md` | Bottom panel and terminal, thinking display, streaming, keyboard shortcuts, stream event visualization, duration timers, background runs, restore points, config migration dialog, rate-limit banner, version update banner, instant project switch, sound effects, hot reload controls, instructions editor, and language auto-detection. |
| `Plans/interview-subagent-integration.md` | Interview config tab, agent activity, embedded document pane, findings summary preview, single final approval gate, and multi-pass review. |
| `Plans/orchestrator-subagent-integration.md` | Orchestrator, orchestrator controls, and node/package/lane/seam display. |
| `Plans/WorktreeGitImprovement.md` | Branching tab in Settings and worktree recovery in Health. |
| `Plans/FileSafe.md` | Advanced tab in Settings, command blocklist, write scope, and security filter. |
| `Plans/MiscPlan.md` | Health tab clean-workspace button, cleanup config in Advanced, and Shortcuts tab. |
| `Plans/Skills_System.md` | Agent Config panel and slash/runtime boundary at `Plans/Skills_System.md#6.3 Slash and runtime boundary`. |
| `Plans/feature-list.md` | Master feature reference for chat modes, thread management, slash commands, ELI5/YOLO, attachments, Teach, context management, editor detach, storage and cache admin UI, and unified settings/search/import/export. |
| `Plans/newtools.md` | MCP/settings alignment note and non-owning cited-search guidance; live provider, routing, provenance, and billing canon stays in owner docs. |
| `Plans/Commands_System.md` | Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for `/web` family behavior and deprecated aliases. |
| `Plans/UI_Command_Catalog.md` | Terminal reveal identities and canonical `cmd.chat.web.*` command ids consumed by chat and command surfaces; see `Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)`. |
| `Plans/Permissions_System.md` | Tool permission keys, approval ladder, blocked-recovery defaults, deterministic ask/plan behavior, and web-operation derivation at `Plans/Permissions_System.md#3.4A Web-operation permission-key derivation`. |
| `Plans/MCP_Integration.md` | Requested versus effective MCP availability at `Plans/MCP_Integration.md#2. Requested versus effective availability`; GUI surfacing at `Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing`; plus auth-state and connection-state enums, credential binding, and invalidation vocabulary. |
| `Plans/Tools.md` | Tool permissions in Permissions tab, tool permission keys, presets, central tool registry, canonical approval ladder, web-provider matrix, routing algorithm, Firecrawl integration, batch-operation contracts, tool usage widget on Usage page, and tool approval dialog in Chat. |
| `Plans/Provider_OpenCode.md` / `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` | `Provider_OpenCode` / `Provider_OpenCode.md` and `Provider_Stream_Mapping_External_Reference_A2A` / `Provider_Stream_Mapping_External_Reference_A2A.md` consumers cannot satisfy runtime `/account` disclosure from `/API` mappings alone; GUI details must show the owner runtime receipt, account source, or unavailable-field reason before treating provider events as complete. |
| `Plans/Widget_System.md` / `Plans/storage-plan.md` / `Plans/Runtime_Artifacts_Panel.md` | Widget, storage, and runtime-artifact GUI consumers route through `Plans/Widget_System.md`, `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `/Widget_System.md`, `/storage-plan.md`, and `/Runtime_Artifacts_Panel.md` owner contracts before treating a widget or artifact view as canonical. |
| `Plans/Widget_System.md` / `Plans/Run_Graph_View.md` | `Plans/Widget_System.md` / `/Widget_System.md` consumes the Progress-only catalog and deterministic `drill-target` mapping, while `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` uses node-aware `/graph` views, treats `by-phase` as legacy grouping, and exposes `/package-group` swimlanes. |
| `Plans/LSPSupport.md` | LSP tab in Settings, editor LSP features, chat-window LSP affordances, Problems tab, and status-bar LSP indicator. |
| `Plans/rewrite-tie-in-memo.md` | Rewrite scope alignment so GUI migration stays tied into the broader rewrite plan. |
| `Plans/FinalGUISpec.md` | Internal clipboard contract, clipboard migration requirements, SelectableText contract, context-menu clipboard contract, and migration gate. |
