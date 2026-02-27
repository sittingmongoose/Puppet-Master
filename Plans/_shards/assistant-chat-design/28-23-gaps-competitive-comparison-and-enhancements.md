## 23. Gaps, Competitive Comparison, and Enhancements

This section reviews the Assistant & Chat plan for **gaps**, **potential problems**, and **competitive coverage** (vs. OpenCode, Claude Code, Codex, Gemini CLI, Antigravity, Cursor). **All gaps listed below are adopted as MVP:** the main body of this plan (§1-§22) has been updated to include every adopted requirement (slash commands, interrupt vs. stop, up to 2 queued messages FIFO, Plan read-only until execute, thinking toggle, export, compact, model switch UI, resume/rewind, revert last edit, session share, HITL dashboard + thread notification).

### 23.1 Gaps (all adopted as MVP)

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Thinking/reasoning visibility** | §15 mentions "thought stream" for Interview; the plan does not explicitly require a **toggle** to show/hide extended thinking in **Assistant** chat (e.g. when platform streams `thinking` events). Newfeatures.md §12 and §15.6 define stream event viz and "Interleaved Thinking Toggle" but are not cited in this plan. | Add a brief requirement: Assistant chat can show/hide extended thinking when the normalized stream provides it; align with Plans/newfeatures.md §12, §15.6. |
| **Slash commands** | Competitors (OpenCode, Codex, Claude Code, Gemini CLI) support slash commands (e.g. `/model`, `/compact`, `/new`, `/export`). This plan does not mention slash commands or a command palette for chat. | Consider adding: chat supports slash-style or command-palette actions (e.g. switch model, new thread, export, compact session) for keyboard-first users; can be phased after MVP. |
| **Session export / share** | OpenCode has `/export` (conversation to Markdown) and `/share`; Codex has resume/transcripts. This plan has "chat history search" but no explicit **export conversation** (e.g. to Markdown) or **share session** (link or bundle). | Add: user can export current thread (or conversation) to Markdown (or JSON); optional "share session" (e.g. bundle for support or replay) as enhancement. |
| **Session compact / compress** | OpenCode's `/compact` compresses session history. We have §16 (context & truncation) and newfeatures.md §10 (auto-compaction) but no explicit **user-triggered "compact this session"** in chat. | Consider: user-initiated "Compact session" (or "Summarize and continue") in chat, triggering the same compaction logic as auto-compact; document in §16 or reference newfeatures.md §10. |
| **Model switch mid-thread** | Plan says "Platform/model/effort are selectable at any time" and "context is passed along" when switching; it does not say **where** (toolbar, thread header, slash command) or whether the **current run** is cancelled when the user switches model mid-stream. | **Addressed in §1.1:** Controls in chat header or footer; change applies to next turn; current run continues with previous selection unless user stops it; `/model` can open model selector. |
| **Multiple queued messages** | §4 describes one queued message above the chat with edit + "Send now." It does not say how **multiple** queued messages are shown (stack, list, one at a time with "next"). | Clarify: when more than one message is queued, show a list or ordered stack above the chat, each with edit and "Send now" (or "Send next"); ordering and reorder/remove should be specified. |
| **Undo / Git integration for edits** | OpenCode documents undo/redo with Git for file changes. Plan mentions File Manager and agent "what it changed" but not **user-undo** of agent file edits (e.g. "Revert last edit" or Git-based rollback). | Consider: "Revert last agent edit" or link to restore points / Git (newfeatures.md §8, §15.3); can live in activity transparency (§12) or a separate control. |
| **Interrupt vs. steer semantics** | Codex has had bugs where ESC acts like "steer" instead of true interrupt. Plan has "Stop" and "Send now (steer)" but does not distinguish **hard stop** (cancel current turn, no new input) vs. **steer** (inject new message as next input). | Clarify: "Stop" = cancel current run, no message sent; "Send now" = steer (inject message). Ensure UI and backend do not conflate the two. |
| **Permission granularity** | Claude Code has plan / default / acceptEdits / bypassPermissions; we have YOLO vs Regular and "approve once" vs "approve for session." We do not have an explicit **read-only (plan) mode** in the mode table; Ask is read-only but not named as "plan." | Consider: explicit "Plan (read-only)" mode or alias in UI for Ask when user wants plan-only behavior; or document that Ask maps to platform plan/read-only where available. |
| **LSP / language intelligence** | **LSP** = Language Server Protocol (editor + Chat: diagnostics, hover, go-to-definition, etc.). | **In scope for MVP.** Plans/LSPSupport.md §5.1 (LSP in the Chat Window); assistant-chat-design §9.1. Full LSP in editor (FileManager.md) and Chat (diagnostics in context, @ symbol with LSP, code-block hover/definition, Problems link). |
| **Agent skills (Gemini-style)** | Gemini CLI has "Agent Skills" (load-on-demand by trigger). Newfeatures.md §6 mentions skills. | Reference newfeatures.md §6; skill triggers can be added when we implement skills. |
| **Resume / rewind in chat** | Resume thread from state; rewind/restore to message N. | **Adopted:** §11 (Threads) now requires resume and rewind; §5 (Commands) exposes them. |
| **Inbox / per-agent threads** | **Inbox-per-agent** = one conversation thread per agent (e.g. Antigravity). We have multiple threads and crew, not "inbox per agent." | Out of scope for MVP; we do not model inbox-per-agent. |
| **Real-time collaboration** | **Real-time collaboration** = multiple humans (or humans + agents) editing the same project at once with live updates. | Out of scope for MVP; not in this plan. |

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

| Feature | OpenCode | Claude Code | Codex | Gemini CLI | Antigravity | Cursor | Our plan |
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
| **Undo / Git for edits** | ✅ Undo/redo + Git | -- | -- | -- | -- | -- | ✅ §13 (revert last agent edit) |
| **Session sharing** | ✅ `/share` | -- | -- | -- | -- | -- | ✅ §11 (session share) |

**Summary:** All listed features are now in scope: steer/queue (§4), context display (§12), permissions (§3), MCP (§7), @ mention (§9), **LSP in Chat (§9.1, Plans/LSPSupport.md §5.1)**, activity transparency (§13), multi-agent (§14-§15), slash commands (§5), export (§6), thinking toggle (§13), model switch (§1), user compact (§17), resume/rewind (§11), revert edit (§13), session share (§11). **LSP is MVP** (editor + Chat). Inbox-per-agent and real-time collaboration are out of scope for the initial desktop MVP (see glossary in table above).

### 23.4 Adopted enhancements (all MVP)

All of the following are **MVP requirements** and are already reflected in the main body (§1-§22):

1. **Thinking/reasoning toggle** -- §13: show/hide extended thinking when the stream provides it.
2. **Slash commands (app/project-wide, customizable)** -- §5: `/` commands near Rules, user can customize.
3. **Export conversation** -- §6: export current thread to Markdown or JSON.
4. **Up to 2 queued messages, FIFO** -- §4: ordered list above composer, each with edit and "Send now."
5. **Interrupt ≠ Stop** -- §4: Stop cancels run (no message); "Send now" = steer (inject message).
6. **Model/platform change UI** -- §1: chat header or thread settings; applies to next turn.
7. **User-triggered Compact session** -- §17: user can run compaction from chat.
8. **Resume / rewind** -- §11: resume thread, rewind/restore to message (branch/rollback).
9. **Revert last agent edit** -- §13: revert from thread, tied to Git/restore points.
10. **Session share** -- §11: produce shareable bundle (messages + metadata, no secrets).
11. **HITL: new thread spawned** -- §21: CtA on Dashboard; a **new thread** is spawned with an appropriate name for the HITL prompt.
12. **No project selected** -- §1: many chat features do not work when no project is selected; only application rules apply.
13. **Clear queue** -- §4: user can clear the entire queue.
14. **Keyboard shortcuts** -- §4: chat actions reachable via shortcuts and command palette (newfeatures.md §11).
15. **Streaming** -- §12: response streams when platform supports it; normalized stream; fallback to batch.
16. **Paste / drag-drop** -- §7: paste and drag-drop into composer supported.
17. **Rate limit hit** -- §12: option to switch platform or model.
18. **"Task running"** -- §4: active agent run in **this thread** (per-thread).
19. **Delete thread** -- §11: delete permanently with confirmation.
20. **Copy message** -- §11: selectable content and/or Copy action.
21. **Run-complete notification** -- §11: notify when run completes in another thread; **setting** to turn off.
22. **Concurrent threads** -- §11: setting, **default 10** max concurrent runs. Per-platform concurrency caps also apply (see `Plans/FinalGUISpec.md` §7.4.7); the more restrictive limit wins.
23. **Custom vs built-in commands** -- §5: no conflicting names; UI explains why if user tries.
24. **Plan panel scope** -- §11: plan panel **per thread**. **Accessibility** is **not MVP**.
25. **Error and failure UX** -- §4: clear error state, Retry/Cancel, queue unchanged unless user retries; suggest switch platform/model when appropriate.
26. **Orchestrator to Assistant handoff** -- §21: Dashboard offers "Continue in Assistant" with run summary and context when orchestrator completes or pauses.

### 23.5 Previously open gaps (now closed)

The following were the last open gaps; they are now specified in the main body. This table is kept for traceability.

| Area | Status |
|------|--------|
| **Error and failure UX** | Now in §4: thread shows error state, Retry/Cancel, queue unchanged unless user retries; suggest switch platform/model when appropriate. |
| **Orchestrator → Assistant handoff** | Now in §21: Dashboard offers "Continue in Assistant" with run summary and context when orchestrator completes or pauses. |

**Verdict:** The plan is **fully fleshed out** for MVP for all adopted items (§23.4). No remaining gaps; **accessibility** is explicitly not MVP.

### 23.6 Git & GitHub parity

**Git & GitHub parity:** Full specification in Plans/GitHub_Integration.md. The Git panel (§A), GitHub API integration (§B), SSH remote dev servers (§C), and no-wizard project flows (§D) bring Puppet Master to IDE-level git integration. Chat git commands (§5.1 above) allow driving git operations from the assistant without switching to the Git panel. ContractRef: Plans/GitHub_Integration.md.

---

