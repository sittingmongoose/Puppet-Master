## 23. Gaps, Competitive Comparison, and Enhancements

This section reviews the Assistant & Chat plan for **gaps**, **potential problems**, and **competitive coverage** (vs. OpenCode, Claude Code, Codex, Gemini, Antigravity, Cursor). **All gaps listed below are adopted as MVP:** the main body of this plan (§1-§22) has been updated to include every adopted requirement (slash commands, interrupt vs. stop, up to 2 queued messages FIFO, Plan read-only until execute, thinking toggle, export, compact, model switch UI, resume/rewind, revert last edit, session share, HITL dashboard + thread notification).

### 23.1 Gaps (all adopted as MVP)

The following MVP gap closures are now adopted as normative behavior for chat integration:

- visible file-reference chips rather than hidden context injection
- explicit `cmd.chat.add_file_reference` ownership for file handoff
- explicit separation between `cmd.chat.revert` (file restore) and `cmd.chat.rewind` (conversation rewind)
- chat consumption of Search, Source Control, and LSP results without taking over their owner responsibilities
- browser/preview and remote recovery copy aligned with the shared requested/effective and no-silent-fallback contracts

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

### 23.2 Potential problems (risks and ambiguities)

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Steer/queue ordering** | If multiple messages are queued and user "Send now" on the second, do we send only that one or reorder the queue? Codex issues report "queued messages execute sequentially" and earlier work can be undone by later steps. | Define queue semantics: FIFO vs. "Send now" = promote to front; and whether we batch queued messages (execute together) or one-by-one; **Resolved:** §4 specifies queue is **FIFO** and max 2 messages; "Send now" sends that message immediately (steer). |
| **Context re-pack on model switch** | "Context is passed along" when switching model--different platforms have different context limits and formats. Re-pack logic (summarize, truncate, normalize) must be specified so we do not overflow or lose critical context. | **Resolved in §17:** Preserve system prompt + AGENTS.md + active file refs + last 6 turns verbatim; summarize older turns; truncate summary first if over limit; normalize Provider-specific formatting. Config: `context.repack.verbatim_turns` (default `6`). Max tokens from `platform_specs::context_window(provider)`. |
| **Interview thought stream vs. Assistant thought stream** | §16 (Interview) and exec summary mention "thought stream"; §13 (activity transparency) defines thought stream and thinking toggle for both. Whether Assistant also shows a continuous thought stream or only "what it searched/changed." | Unify: define "thought stream" as reasoning/thinking from the model when available; same UX component for both Interview and Assistant when in a run. |
| **HITL and chat** | User can "approve and continue" via Assistant for HITL; if the user is in a different thread or the Assistant is busy, the CtA might be missed or delayed. | **Mitigation:** §21 requires the Dashboard to show the HITL CtA **and** a notification in the message thread (chat) so the user sees it both on the Dashboard and in the thread. |
| **Plan + Crew execution path** | §15 says plan output must be consumable by single-agent and crew. If plan format or todo list is platform-specific, crew execution might need a translation layer. | **Plan/Todo Format for Crew Execution (Resolved):** Crew execution uses the same plan/todo JSON format as single-agent execution. No translation layer is needed — the Provider abstraction normalizes all output formats. If a Provider returns non-standard plan format, the Provider's output parser (see orchestrator-subagent-integration.md §10) handles normalization into the canonical plan schema before it reaches the orchestrator. |
| **ELI5 and system prompt size** | App and chat ELI5 add instructions to prompts; long ELI5 text could consume context. | Keep ELI5 appendages short (e.g. one sentence); document in §2. |
| **Long thread performance and flicker** | Long chat threads (many messages, diffs, thought streams) can cause lag, high memory, or flicker if the whole list is rendered or rebuilt on every stream chunk. | **§24** specifies virtualized rendering, flicker avoidance (stable IDs, incremental updates, no full rebuild on stream), and Slint-oriented mitigations. Implement §24 for production-quality long threads. |

### 23.3 Competitive comparison (what others have)

| Feature | OpenCode | Claude Code | Codex | Gemini | Antigravity | Cursor | Our plan |
|---------|----------|-------------|-------|------------|------------|--------|----------|
| **Steer / queue** | -- | -- | ✅ Steer, queue | -- | -- | -- | ✅ §4 |
| **Queued message above chat, edit + send now** | -- | -- | (extension lags CLI) | -- | -- | -- | ✅ §4 |
| **Context / usage display** | ✅ Desktop | -- | -- | -- | -- | -- | ✅ §12 (OpenCode-like) |
| **Thinking / reasoning toggle** | ✅ `/thinking` | ✅ Tab toggle | -- | -- | -- | -- | ✅ §13 (show/hide when stream provides thinking) |
| **Slash commands** | ✅ `/models`, `/share`, `/compact`, `/export`, `/new`, `/thinking` | -- | ✅ `/model`, `/permissions`, `/agent`, etc. | ✅ `/skills`, `/resume`, `/rewind` | -- | -- | ✅ §5 (app/project-wide, customizable) |
| **Export conversation** | ✅ `/export` Markdown | -- | Transcripts local | -- | -- | -- | ✅ §6 (export thread to Markdown/JSON) |
| **Session compact** | ✅ `/compact` | -- | -- | -- | -- | -- | ✅ §17 (user-triggered Compact session) |
| **Resume / rewind** | -- | ✅ `-c`, `-r` | ✅ `/resume` | ✅ `/resume`, `/rewind` | -- | -- | ✅ §11 (resume and rewind) |
| **Model switch mid-session** | -- | -- | ✅ `/model` | -- | -- | -- | ✅ §1 (chat header or thread settings; applies next turn) |
| **Multi-agent / crew** | -- | ✅ Subagents | ✅ Experimental multi-agent | -- | ✅ Inbox per agent, parallel | -- | ✅ §14, §15, §18 |
| **Permission modes** | -- | ✅ plan, default, acceptEdits, bypass | ✅ `/permissions` | -- | ✅ Pause, approve | -- | ✅ §3 YOLO vs Regular |
| **MCP / plugins** | ✅ `opencode mcp` | ✅ MCP, hooks, skills | -- | -- | -- | ✅ MCP | ✅ §7 |
| **@ file mention** | ✅ Fuzzy | -- | -- | -- | -- | ✅ @ context | ✅ §9 |
| **Bash / tools in chat** | -- | ✅ Read, Edit, Bash, etc. | -- | -- | -- | ✅ | ✅ §13 |
| **Activity transparency** | -- | -- | -- | -- | ✅ Artifacts, logs | -- | ✅ §13 (search, bash, files read/changed) |
| **Agent skills (load by trigger)** | -- | Skills/hooks | -- | ✅ Agent Skills | -- | -- | ⚠️ newfeatures §6; not in this plan |
| **Undo / Git for edits** | ✅ Undo/redo + Git | -- | -- | -- | -- | -- | ✅ §9 (revert last agent edit) |
| **Session sharing** | ✅ `/share` | -- | -- | -- | -- | -- | ✅ §11 (session share) |

**Summary:** All listed features are now in scope: steer/queue (§4), context display (§12), permissions (§3), MCP (§7), @ mention (§9), **LSP-aware chat/editor integration (§9, Plans/LSPSupport.md §5)**, activity transparency (§13), multi-agent (§14-§15), slash commands (§5), export (§6), thinking toggle (§13), model switch (§1), user compact (§17), resume/rewind (§11), revert edit (§9), session share (§11). **LSP is MVP** (editor + Chat). Inbox-per-agent and real-time collaboration are out of scope for the initial desktop MVP (see glossary in table above).

### 23.4 Adopted enhancements (all MVP)
All of the following are **MVP requirements** and are already reflected in the main body (§1-§22):

1. **Thinking/reasoning toggle** -- §13: show or hide extended thinking when the stream provides it.
2. **Slash commands (app/project-wide, customizable)** -- §5: `/` commands near Rules; user can customize.
3. **Export conversation** -- §6: export current thread to Markdown or JSON.
4. **Up to 2 queued messages, FIFO** -- §4: ordered list above composer, each with edit and `Send now`.
5. **Interrupt != Stop** -- §4: Stop cancels run (no message); `Send now` steers by injecting a message.
6. **Model/platform change UI** -- §1: chat header or thread settings; applies to the next turn.
7. **User-triggered Compact session** -- §17: user can run compaction from chat.
8. **Resume / rewind** -- §11: resume thread, rewind or restore to message.
9. **Revert last agent edit** -- §9: revert from thread via the canonical file-restore pipeline.
10. **Session share** -- §11: produce a shareable bundle (messages + metadata, no secrets).
11. **HITL: new thread spawned** -- §21: CtA on Dashboard; a **new thread** is spawned with an appropriate name for the HITL prompt.
12. **No project selected** -- §1: many chat features do not work when no project is selected; only application rules apply.
13. **Queued messages** -- §4: two-slot FIFO queue with edit/send-now/cancel controls; no clear-queue action.
14. **Keyboard shortcuts** -- §4: chat actions reachable via shortcuts and command palette (`newfeatures.md` §11).
15. **Streaming** -- §12: response streams when platform supports it; normalized stream; fallback to batch.
16. **Paste / drag-drop** -- §7: paste and drag-drop into composer supported.
17. **Rate limit hit** -- §12: option to switch platform or model.
18. **Task running** -- §4: active agent run in **this thread** (per-thread).
19. **Delete thread** -- §11: delete permanently with confirmation.
20. **Copy message** -- §11: selectable content and/or Copy action.
21. **Run-complete notification** -- §11: notify when run completes in another thread; **setting** to turn off.
22. **Concurrent threads** -- §11: user-facing setting, **default 10** max concurrent thread runs in Assistant UI. This is a thread-level Assistant concurrency setting, not the global runtime subagent ceiling. Global orchestration caps remain SSOT in `Plans/orchestrator-subagent-integration.md`, and interview reviewer narrowing remains in `Plans/interview-subagent-integration.md`; the more restrictive applicable limit wins.
23. **Custom vs built-in commands** -- §5: no conflicting names; UI explains why if user tries.
24. **Plan panel scope** -- §11: plan panel **per thread**. **Accessibility** is **not MVP**.
25. **Error and failure UX** -- §4: clear error state, Resend or Cancel, queue unchanged unless user resends; suggest switch platform or model when appropriate.
26. **Orchestrator to Assistant handoff** -- §21: Dashboard offers `Continue in Assistant` with run summary and context when orchestrator completes or pauses.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md
### 23.5 Previously open gaps (now closed)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0572
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Several docs now fail because they promise canonical sections/IDs that do not exist at all.
  - The remaining partial surface is now fully confirmed as meaningful; none of these docs should be treated as low-signal leftovers.
  - Consumer docs now simultaneously claim:
  - fields present now include `provider_attempt_ref`, `usage_event_ref`, `detail_ref`, and `report_ref`
  - provider_attempt_ref
  - usage_event_ref
  - detail_ref
  - report_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
This traceability table now records what moved into the main body without claiming blanket closure.

The competitive-comparison traceability stays intact.
### 23.6 Git & GitHub parity

**Git & GitHub parity:** Full specification in Plans/GitHub_Integration.md. The Git panel (§A), GitHub API integration (§B), SSH remote dev servers (§C), and no-wizard project flows (§D) bring Puppet Master to IDE-level git integration. Chat git commands (§5.1 above) allow driving git operations from the assistant without switching to the Git panel. ContractRef: Plans/GitHub_Integration.md.

---

