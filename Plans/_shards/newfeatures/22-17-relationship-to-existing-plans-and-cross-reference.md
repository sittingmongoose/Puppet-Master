## 17. Relationship to Existing Plans and Cross-Reference

### 17.1 Relationship (Summary)

- **Orchestrator subagent integration:** Background agents (§2) and orchestration flow (§1) complement subagent selection; they don't replace it. Hooks (§9) and plugins (§6) can supply additional agents/roles.
- **Interview subagent integration:** Restore points (§8) and recovery (§4) help interview resilience; skills (§6) can inject phase-specific context; orchestration (§1) can guide phase transitions.
- **Platform install plan:** No direct dependency; new features assume platforms are installed and detected as today. App-local bin remains the source for CLI paths.
- **AGENTS.md and REQUIREMENTS.md:** New features should be documented in AGENTS.md only where they add critical rules (e.g. "bounded buffers mandatory"); long reference stays in `docs/` or this plan.

### 17.2 Cross-Reference: What We Already Have or Are Planning

The following maps **existing plans** and **current code** to the features in this document. Use this to avoid duplicating work and to align newfeatures with prior decisions.

| Area | In codebase / other plans | In newfeatures |
|------|---------------------------|----------------|
| **Guards / safety** | **FileSafe.md:** Command blocklist, Write scope, Security filter, Prompt content checking; integration in `BaseRunner::execute_command()`. Destructive-pattern blocking before Bash runs. | §9 Hooks, §15.1 FileSafe dangerous-command blocking (PreToolUse can call FileSafe blocklist). |
| **Context / tokens** | **FileSafe.md (Part B):** Role-specific context compiler (`.context-{role}.md`), delta context, context cache, compaction-aware re-reads, skill bundling. Token efficiency and handoff schemas. | §10 Auto-compaction (usage %, summarize, preserve); §6 Skills (triggers + content). |
| **Subagents / roles** | **orchestrator-subagent-integration.md:** Tier-level subagent selection (phase/task/subtask/iteration), language/framework detection, `subagent_registry`; **place to setup subagent personas/info** (Config or Setup: view/edit name, description/purpose, optional custom instructions per subagent). **interview-subagent-integration.md:** Phase-specific subagents (product-manager, architect-reviewer, qa-expert, etc.), `SubagentConfig`. | §1 Orchestration flow (understand→decompose→act→verify); §2 Background agents (queue, git isolation). Orchestration and background agents **extend** subagent usage; they do not replace the orchestrator/interview subagent plans. |
| **Git / worktrees** | **WorktreeGitImprovement.md:** Worktree create/merge/cleanup, base branch, recovery, branch sanitization, PR from worktree branch. **MiscPlan:** Cleanup (prepare_working_directory, cleanup_after_execution), allowlist, `run_with_cleanup`. | §2 Background agents: git branch per run (stash, branch, diff/merge). Reuse existing `src/git/` and worktree/cleanup behavior; add **queue** and **per-run branch** on top. |
| **Usage / limits** | **Plans/usage-feature.md:** Usage feature scope, 5h/7d and ledger, state-file-first, GUI placement, gaps (5h/7d not in GUI, ledger vs usage_tracker schema). **Code:** `platforms/usage_tracker.rs`, `platforms/rate_limiter.rs`, `platforms/quota_manager.rs`, `state/usage_tracker.rs`, `doctor/checks/usage_check.rs`, `widgets/usage_chart.rs`. | §3 Persistent rate limit in GUI; §7 Analytics dashboard; §15.9 Mid-stream usage. Newfeatures adds **always-visible 5h/7d in UI** and **analytics view**; build on usage-feature.md and existing usage/plan-detection. |
| **Interview** | **interview-subagent-integration.md:** Phase 1-8, subagent per phase, prompt templates, document generation, AGENTS.md seeding. | §8 Restore points (rollback to phase); §4 Crash recovery (restore interview state); §6 Skills (phase-specific context). Newfeatures **adds** restore/rollback and recovery; does not replace interview phases or subagent assignments. |
| **Chain wizard / intent workflows** | **Plans/chain-wizard-flexibility.md:** Intent-based workflows (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR), requirements step (multiple uploads, Requirements Doc Builder), adaptive interview phases, Project setup and GitHub (create repo, fork, PR start/finish). | §4 Recovery (snapshot includes wizard step and intent); §8 Restore (rollback). Chain-wizard-flexibility defines **entry-point flexibility** and **intent**; newfeatures recovery/restore apply to the updated flow. |
| **GUI / testing** | **newtools.md:** GUI tool discovery (gui_tool_catalog), Playwright + framework tools + custom headless, interview flow for tool choice, MCP in GUI. | §15.7 MCP (config + passthrough). MCP in newfeatures is consistent with newtools; ensure one place for MCP config and Doctor/wiring. |
| **Cleanup / artifacts** | **MiscPlan:** Cleanup policy, allowlist, `src/cleanup/`, runner contract, agent-output dir, evidence retention and pruning, Cleanup UX. | §2 Background agents: output to `.puppet-master/agent-output/{run-id}/`. Align with MiscPlan's agent-output and evidence policy; cleanup allowlist must include that dir or exclude it by policy. |
| **Config wiring** | **WorktreeGitImprovement.md:** Option B (build run config from GUI at run start). **Orchestrator/Interview plans:** Config must be wired (add to config type, set from gui_config, use at runtime). | All newfeatures that need config (hooks, plugins, compaction, recovery) must follow the same wiring pattern (e.g. Option B) so the orchestrator and interview actually see the settings. |
| **HITL (human approval at tier boundaries)** | **Plans/human-in-the-loop.md:** Pause after phase/task/subtask completion for human approval; three independent toggles, off by default. **Orchestrator plan:** Tier boundaries and "Start and End Verification at Phase, Task, and Subtask" define where HITL gates run (after end verification, before advance). | §20 Human-in-the-Loop. HITL is a **setting** only; tier semantics must stay in the orchestrator plan (DRY required). |
| **Application & project rules** | **Plans/agent-rules-context.md:** Application-level rules (e.g. "Always use Context7 MCP") must be fed to every agent everywhere; project-level rules (e.g. "Always use DRY Method") must be fed to every agent working on that project. Single rules pipeline required; orchestrator, interview, and Assistant should all use it. | N/A (fully specified in agent-rules-context.md). |
| **Updating Puppet Master** | No existing plan; app update (version visibility, update discovery, upgrade path, config compatibility) is specified in this plan only. | §21 Updating Puppet Master. |
| **Cross-device sync** | No existing plan. Manual export/import plus sync to BYOS (Bring Your Own Storage). Multiple storage options and custom config; support NAS, network storage, server (SMB, NFS, SFTP, WebDAV, or mounted path). Same payload for export and BYOS; no central cloud account. | §22 Cross-Device Sync. |
| **IDE terminal, panes, hot reload** | No existing plan. Full IDE-style terminal + Problems, Output, Debug Console, Ports (§15.14); hot reload / live reload / fast iteration with project detection, one-click dev mode, Assistant-callable live tools (§15.15). **assistant-chat-design.md §17:** Assistant can call up live testing tools; spec in newfeatures §15.16. | §15.15, §15.16. |
| **Instant project switch** | No existing plan. Ability to instantly switch between projects with context and settings swapping; project bar or sidebar (OpenCode Desktop-style). Reference: [OpenCode](https://github.com/anomalyco/opencode) `packages/app` layout + sidebar-project; route/URL as source of truth; per-project state keyed by path. | §15.17. |
| **Built-in browser / click-to-context** | No existing plan. Launch webapps inside the app; click an element and send its context (DOM, attributes, rect) immediately to the Assistant chat (Cursor-style). Native implementation via Wry WebView + custom protocol; JS captures element, POSTs to `puppet-master://element-context`; Rust forwards to Assistant. | §15.18. |
| **Sound effects** | No existing plan. Per-event sound settings (Agent, Permissions, Errors, optional others): toggle + sound selection per event; user can load their own sounds (file picker, store in app sounds dir); combined built-in + user catalog; config persistence; single playback helper. UI layout flexible. | §15.17. |
| **Assistant / chat** | **Plans/assistant-chat-design.md:** Assistant chat, Dashboard warnings and CtAs (HITL approval), live testing tools (§17 / §22), context/usage display; rules pipeline and project context. | §15.15 Assistant-callable live tools; §20 HITL (CtAs addressable via Assistant); §3/§7 usage visibility. |
| **Architecture** | **Code:** Single Rust/Iced process; platforms spawn CLI from Rust (`runner.rs`, platform-specific runners). No separate Node or WebSocket server; no stream-json parsing today (platforms use stdout capture and completion signals). | §19.1 Three-process layout (Tauri + React + Node server) is **not** our architecture. We have **one** Rust app; §5 Protocol normalization and §19 stream format still apply **if** we add streaming or multi-platform output parsing--e.g. in-Rust parser and bounded buffers, no extra process. |

### 17.3 What to Adapt from Newfeatures

- **Orchestration prompt (§1):** Add `--append-system-prompt` (or equivalent per platform) when building CLI invocations. Single canonical prompt in repo; platform_specs or orchestration module. Fits orchestrator and interview without changing tier or phase structure.
- **Persistent rate limit (§3):** Surface existing usage/plan data (usage_tracker, quota_manager, usage_check) in header or dashboard. Add 5h/7d display and optional warning threshold; refresh in background. No new backend if we already persist usage events.
- **Bounded buffers (§13):** Audit all places we read subprocess stdout (runners, headless). Introduce a shared bounded buffer type and constants; document in AGENTS.md. Aligns with FileSafe and MiscPlan (deterministic, safe behavior).
- **Hooks (§9) and FileSafe (§15.1):** Event enum (e.g. PreToolUse, UserMessageSubmit); run scripts with JSON in/out and timeout. Dangerous-command blocking is part of FileSafe; PreToolUse hooks can call into FileSafe blocklist. **Integrate with FileSafe:** FileSafe already blocks in runner; hooks can be an additional layer (e.g. user-defined rules) or call into the same pattern list. One extension point (FileSafe for core, hooks for optional/user).
- **Restore points (§8):** Snapshot after each iteration or message (file list + content); rollback = restore files + truncate state. Useful for interview (roll back phase) and orchestrator (roll back iteration). Conflict check via mtime/hash; optional branching. Can use existing evidence/state paths.
- **Session/crash recovery (§4):** Timer snapshot (state struct) to disk; on startup offer restore. Fits our single-process model; no need for a separate recovery server.
- **Compaction (§10):** If we add stream or token counting, compaction (monitor usage %, send compact prompt, replace history) can sit on top of FileSafe's context compiler and compaction-aware re-reads. FileSafe already has "compaction marker" and context cache; newfeatures compaction is **conversation** compaction (summarize messages), which is complementary.
- **Plugin/skills (§6) and one-click install (§15.14):** Single plugin dir, manifest, registries (command, agent, hook, skill) required. Resolve at runtime. One-click = catalog + copy + refresh. must fit DRY and gui_tool_catalog pattern (newtools); consider a single "catalog" pattern for both tools and plugins.

- **Background agents (§2):** Queue manager + git branch per run + output dir. Reuse `src/git/` and WorktreeGitImprovement behavior; add queue and "run on branch" semantics. Merge conflict detection via existing git/worktree logic.
- **Keyboard and command palette (§11):** Shortcut registry and Ctrl/Cmd+P modal. Improves UX without changing execution model.
- **Stream event viz, timers, thinking (§12, §15.5, §15.6):** Only relevant **if** we add streaming or stream-json parsing. Today we don't stream; if we do, use normalized stream (§5) and bounded buffers, then add UI for events and timers. Defer until we have a stream pipeline.

### 17.4 What We Do Better or Differently

- **Single process:** We don't need a middle Node server or WebSocket. Rust spawns the CLI, reads stdout, and updates state. For streaming we'd add an in-Rust parser and optional live UI updates, not a separate process. Lower complexity and no port/process management.
- **FileSafe first:** We already plan deterministic, pre-execution guards (database, file, security, prompt). Dangerous-command blocking is part of FileSafe (one blocklist, one integration point in runner).
- **Context compilation (FileSafe Part B):** We already plan role-specific context, delta context, and compaction-aware re-reads. Newfeatures' compaction (summarize conversation) is a **different** layer (message/session compaction vs. context compilation). Keep both; they address different problems.
- **Subagent registry and config:** Orchestrator and interview plans define the single source of truth for subagent names and config. Newfeatures' "agents" (e.g. architect, implementer) must map to **subagent names** from those plans and platform_specs; never introduce a parallel agent taxonomy.

- **Usage and plan detection:** We already have usage_tracker, rate_limiter, quota_manager, and plan detection from error messages. Newfeatures' "5h/7d always visible" and analytics are **UI and aggregation** on top of that; no need to reimplement tracking.
- **Worktree and cleanup:** WorktreeGitImprovement and MiscPlan define worktree lifecycle and cleanup policy. Background agents' "git branch per run" should use the same git/worktree modules and respect cleanup allowlists and evidence retention.

### 17.5 What to Defer or Skip

- **Three-process architecture (§19.1):** We are not adding a Node server or WebSocket. Treat §19.1 as "one possible pattern elsewhere"; our implementation stays single Rust process. Stream parsing (if added) is in-Rust with bounded buffers.
- **Full protocol normalization (§5) and stream-json everywhere:** Valuable if we add streaming and multi-provider output. Defer until we have a concrete need (e.g. live progress, thinking display). When we do, define a minimal schema and per-platform adapters in our runners.
- **Multi-tab / multi-window (§15.10), virtualization (§15.11):** UX improvements; defer until core features (hooks, plugins, recovery, usage UI) are in. Virtualization matters if we show very long logs or message lists.
- **In-app instructions editor (§15.3), @ mentions (§15.4), project browser (§15.8):** Nice-to-have; implement after persistent rate limit, recovery, and hooks. @ mentions require prompt-building changes; project browser can reuse project list and git status from existing code.
- **Database (§14):** Per rewrite, structured storage is not optional: use **redb** (and analytics scan jobs over seglog) for querying and scale; see Plans/storage-plan.md.

### 17.6 References to Other Plan Documents

- **Plans/FileSafe.md** -- Guards, context compilation, token efficiency; integration point in runner.
- **Plans/interview-subagent-integration.md** -- Interview phases, phase subagents, config, document generation.
- **Plans/MiscPlan.md** -- Cleanup, runner contract, agent-output, evidence, config wiring.
- **Plans/newtools.md** -- GUI tool discovery, MCP in GUI, test strategy and tool selection.
- **Plans/orchestrator-subagent-integration.md** -- Tier-level subagent selection, config wiring, verification.
- **Plans/WorktreeGitImprovement.md** -- Worktrees, git/gh resolution, config (Option B), branch strategy.
- **Plans/human-in-the-loop.md** -- Human-in-the-Loop (HITL) mode: pause at phase/task/subtask boundaries for approval; settings and behavior (§20).
- **Plans/agent-rules-context.md** -- Application-level (Puppet Master) and project-level agent rules; fed into every agent via a single rules pipeline; storage and GUI (Application rules, Project rules).
- **Plans/usage-feature.md** -- Usage feature scope, 5h/7d and ledger visibility, state-file-first data, GUI placement options, current gaps and acceptance.
- **Plans/assistant-chat-design.md** -- Assistant chat, Dashboard warnings and CtAs (including HITL approval), live testing tools (§17 / §22), context/usage display; rules pipeline and project context.
- **Plans/chain-wizard-flexibility.md** -- Intent-based workflows (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR), requirements step redesign (multiple uploads, Requirements Doc Builder), adaptive interview phases, Project setup and GitHub (create repo, fork offer/user, PR start/finish).

### 17.7 DRY and Single Source of Truth

All new features must reuse these single sources; duplication of data or logic is never permitted:

| Source | Used for |
|--------|----------|
| **platform_specs** | All platform CLI data (binary names, flags, models, auth, capabilities). should be the only source. |
| **docs/gui-widget-catalog.md** and **src/widgets/** | UI components; must check before creating new widgets. |
| **Rules pipeline** (agent-rules-context.md) | Application + project rules injected into every agent; orchestration prompt must be composed *after* rules. |
| **Usage state and usage-feature.md** | 5h/7d, ledger, analytics; usage-feature.md should be the single source for Usage scope and gaps. |
| **MiscPlan, WorktreeGitImprovement** | Cleanup, worktree, agent-output dir, config (Option B). required reference. |
| **Subagent registry** (orchestrator/interview plans) | Subagent names and config; plugin "agents" must map to subagent names. |
| **MCP config** (newtools §8 + §15.7) | required single place for MCP server list and per-platform wiring. |


---

