- Remote file operations have no timeout/retry contract
- File watcher integration says "use platform APIs" — no abstraction layer specified
- Search-in-files delegates to "Search side panel" but no handoff event defined
- SSH file operations have no error classification (network vs permission vs not-found)

**filesafe-core** (FileSafe.md L1-1000): 21 findings (2 HIGH, 13 MED)
- `recovery_options[]` field referenced in Contracts_V0 addendum as deprecated but still used in 3 FileSafe sections
- Safe-point creation has no storage size limit or cleanup policy
- `filesafe.snapshot_created` event not in Contracts_V0 canonical event list
- Conflict resolution for concurrent edits is "last-write-wins" but no vector clock or sequence number

**filesafe-features** (FileSafe.md L1000-2000): 25 findings (3 HIGH, 12 MED)
- Restore flow UX has no confirmation dialog spec
- Diff view for safe-point comparison references "editor diff mode" that doesn't exist in editor spec
- Auto-save interval configurable but no min/max bounds specified
- FileSafe interaction with worktree branching undefined — what happens to safe points on branch switch?

**filesafe-context** (FileSafe.md L2000-2808): 28 findings (3 HIGH)
- `recovery_options[]` contradiction between Contracts_V0 (deprecated) and FileSafe (active usage)
- Field name drift: `safe_point_id` vs `snapshot_id` vs `checkpoint_id` used in different sections
- Action ID `filesafe.restore` not in UI_Command_Catalog
- Storage binding for safe-point data references `filesafe_snapshot.v1:*` key not in storage-plan §2.3

**lsp-core** (LSPSupport.md L1-450): 16 findings (2 P0, 4 P1)
- P0: §5.1 "Chat LSP" referenced 12 times throughout doc but heading doesn't exist — phantom section
- P0: §3.5 root discovery promised "table of per-language root detection rules" — only abstract prose, no table
- SSH transport for remote LSP says "via SSH subprocess" but no protocol details (stdio over SSH? port forwarding?)
- Language server lifecycle (start/stop/restart) has no state machine diagram or enum
- `lsp.server_started` / `lsp.server_crashed` events not in Contracts_V0

**lsp-impl** (LSPSupport.md L450-890): 16 findings (4 HIGH, 4 MED)
- Code action integration with tool approval flow unspecified — does applying an LSP code action require permission?
- Diagnostic-to-chat pipeline ("send diagnostics to assistant") has no message format
- Multi-root workspace handling only covers "first matching server" — no load balancing or routing contract
- LSP server resource limits (memory, CPU) unspecified — no OOM handling

**tools-core** (Tools.md L1-500): 27 findings (3 CRIT, 4 HIGH)
- CRIT: §3.5 per-tool contracts EMPTY — no I/O schema for bash, edit, read, grep, glob, create, etc.
- CRIT: §3.6 task tool EMPTY — no input schema, no enum of 42 subagent types, no dispatch contract
- CRIT: Plan mode preset DENIES question/todo/web tools — self-defeating for planning research
- §3.5A skill tool runtime contract is a placeholder with zero content
- Tool approval flow references Permissions_System.md but the permission key pattern for each tool is undefined
- Tool execution timeout: "configurable" — no default, no max, no per-tool override

**tools-impl** (Tools.md L500-952): 20 findings (2 P0, 8 P1)
- P0: `tool.execution_started` / `tool.execution_completed` events not in Contracts_V0 canonical list
- P0: Tool result streaming contract missing — does output stream or arrive at completion?
- §5.1 tool composition (chaining) is prose-only — no pipeline schema
- MCP tool discovery mentions "capability probing" but no probe protocol
- Tool sandboxing says "each tool runs in its own context" — no isolation mechanism specified

**newtools-core** (newtools.md L1-600): 23 findings (1 P0, 4 P1)
- P0: §8.1-8.3 referenced in TOC but sections don't exist (phantom)
- `TierTree::load_test_strategy` uses stale terminology
- Browser tool capture flow references "visible composer chips" from assistant-chat-design but the chip schema is undefined
- Click-to-context tool has no coordinate system spec (viewport? document? element-relative?)

**newtools-impl** (newtools.md L600-1209): 20 findings (2 HIGH, 12 MED)
- "per-tier overrides" in test tool configuration — stale terminology
- Web research tool has no rate limiting contract
- Code search tool references "semantic search" but no embedding model or index spec
- Terminal tool says "shares terminal identity with chat" but terminal identity model is split across 3 docs

**storage-core** (storage-plan.md L1-540): 28 findings (3 CRIT, 10 HIGH)
- CRIT: §2.2 seglog wire format UNDEFINED — "append-only event log" with no concrete serialization format
- CRIT: `attempt_record` key has 4 components (with `project_id`) in §2.3 but addendum has 3 components
- CRIT: `blocked_projection` key shape has 3-way conflict across 3 locations
- No versioning/migration strategy for redb schema changes
- `seglog.event_appended` not in Contracts_V0 canonical events
- Per-record TTL mentioned but no default values or cleanup trigger
- Index rebuild procedure is prose-only — no algorithm or time complexity

**storage-addenda** (storage-plan.md L540-1081): 30 findings (4 S1-CRIT, 16 S2-HIGH)
- CRIT: Stale retry formula at L820 (`retry_count = attempt_count - 1`) directly conflicts with sub-counter model at L941-944
- CRIT: §5.1-5.4 ALL STUBS — Unsaved editor recovery, requested/effective state, search/SC projection, LSP persistence each have zero implementation spec
- CRIT: Key format 3-way conflict for blocked_projection across §2.3, §4.1, and addendum
- Overlapping addenda: 4 separate "storage reconciliation" addenda that restate the same "single projection, multiple views" rule
- `terminal_workspace_state.v1:*` through `terminal_command_block.v1:*` (7 terminal keys) defined here but NOT in FinalGUISpec §15.1
- Permission Snapshot Storage addendum defines schema but FinalGUISpec §15.1 has no `permission_snapshot.v1:*` key

**worktree-git** (WorktreeGitImprovement.md): 22 findings (4 HIGH)
- 14 `tier_id` references throughout worktree helper APIs
- Branch strategy manager uses `tier_type` for strategy selection — stale
- Worktree cleanup on run completion has no grace period or file-lock check
- `worktree.created` / `worktree.deleted` events not in Contracts_V0

**gui-core** (FinalGUISpec.md L1-700): 17 findings (1 CRIT, 4 HIGH)
- CRIT: §8 Widget Catalog, §9 State Management, §10 UX Patterns listed in TOC but completely absent from document
- Activity bar items list doesn't match side-panel definitions — GHA panel referenced but not specified
- Settings panel: only 3 of 24+ tabs specified (General, Editor, Terminal)
- Keyboard shortcut catalog incomplete — only ~20 of likely 80+ shortcuts defined

#### Wave 3 — Provider / GUI / Chat / Permissions (20 agents, ~300 findings)

**gui-panels** (FinalGUISpec.md L700-1400): 20 findings (2 P0, 8 P1)
- P0: §8/§9/§10 completely missing from body (referenced in TOC, never written)
- P0: Only 5 of 8+ side-panels have substantive specs
- "Docker Manage" at §7.4.8A — should be "Docker Manager"
- Settings tabs: only 3 of 24+ specified (General, Editor, Terminal — missing 21+ tabs)
- Appendix A cross-references use section numbers (§7.16, §7.18, §7.20) that don't exist in current numbering

**gui-impl** (FinalGUISpec.md L1400-2184): 30 findings (3 CRIT, 6 HIGH, 14 MED)
- CRIT: Duplicate §17 — two completely different sections share same number (Risks vs Persona Editor)
- CRIT: 6 overlapping blocked/recovery addenda (L1963, 2031, 2048, 2087, 2099, 2123) with `wizard_blocked` card defined TWICE
- CRIT: §15.1 redb keys dramatically incomplete — missing 30+ keys that exist in storage-plan.md §2.3 (attempt_record, blocked_projection, artifacts_index, lane_record, worktree_record, concern_record, provider_account_record, 7 terminal keys, mcp keys, skill keys, dev_session_record)
- HIGH: No GHA panel persistence key in either FinalGUISpec §15.1 OR storage-plan.md §2.3
- HIGH: Persona §17.2 missing `disabled_plugins` and `default_skill_refs` fields that exist in Personas.md §3.2
- HIGH: §17.8 mapping editor uses stale "phase/task/subtask/iteration tiers" — should be Feature Seam/Work Package/Lane/Node
- HIGH: `wizard_blocked` card defined at L1965-1978 AND re-defined at L2050-2067 with priority ordering only in second copy
- HIGH: Docker Manage addendum (L1718-1737) embedded inside Persona §17 with no section break
- MED: Appendix C.5 redb key migration references deprecated `dashboard_layout:v1` but §15.4 Startup Restore still uses old key
- MED: `terminal_state:v1` referenced in Startup Restore but never defined in §15.1 — phantom key
- MED: Stale `tiers.slint` file path, "Tiers" tab name, "TierTree" widget name
- MED: L2180-2183 all-nodes-blocked timeout (10min/30min) uses timer-driven behavior that contradicts L2043 event-driven mandate
- MED: L1238 seglog projection mentions "tier" field — ambiguous (decomposition tier vs pricing tier?)
- MED: Activity transparency events have no GUI visual treatment mapping
- MED: Blocked-State Visual Distinction table (L2127) maps only 3 states, missing `retrying/backoff` and `remediation` badges

**chat-core** (assistant-chat-design.md L1-700): 18 findings (1 P0, 4 P1)
- P0: §6 "Teach Mode" and §7 "Attachments & Web Search" in TOC but sections don't exist — phantom
- No message taxonomy (what types of messages exist? user, assistant, system, tool_result, operation_card, blocked_notice — never enumerated)
- No chat lifecycle state machine (thread creation → active → archived → deleted — undefined)
- Thread identity model incomplete — `thread_id` mentioned but no format, no generation rule, no uniqueness scope
- No explicit "no delete" rule for messages (user-locked decision never written)

**chat-features** (assistant-chat-design.md L700-1300): 18 findings (1 P0, 4 P1)
- P0: §6/§7 phantom sections again — referenced in body cross-refs
- Tool approval UX in chat not specified — Permissions_System says "ask" but chat has no dialog spec for the approval prompt
- HITL approval UX disconnected from chat blocked-state lifecycle
- Export/share format unspecified — mentions "export conversation" but no format (markdown? JSON? PDF?)
- Inline subagent card (§14) doesn't cross-reference Persona §27.6 subagent display fields
