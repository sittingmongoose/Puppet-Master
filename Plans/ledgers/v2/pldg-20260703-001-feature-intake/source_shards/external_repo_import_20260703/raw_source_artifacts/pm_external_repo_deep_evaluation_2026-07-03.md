# External Repo Deep Evaluation → Puppet Master Plan Deltas

**Date:** 2026-07-03  
**Requested scope:** Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, tmux; compare against the uploaded Puppet Master repo/Plans; focus on the last six months where possible; include terminal lessons for PM's built-in GUI terminal.

## Method and honesty boundary

This was not a random spot-check pass. I reviewed the live repo landing pages, recent issue lists, recent PR lists, releases/changelogs, and targeted current issue bodies for the requested repositories, then compared recurring failure families to the uploaded PM Plans. The largest repositories expose hundreds to thousands of open issues and PRs through the web UI. This report therefore does **not** claim to be a verbatim hand-read transcript of every individual issue body. It is a systematic failure-family review based on the visible recent surfaces plus targeted drill-downs where the issue/PR titles signaled material architecture risk.

The actionable comparison is at the level PM needs: runtime contracts, data-shape invariants, GUI/terminal semantics, provider/tool/context handling, release/migration process, and concrete PlanUnit/backlog deltas.

## Executive finding

PM's current Plans are already unusually strong in three areas that these projects struggled with:

1. **Identity separation.** PM already separates terminal section/tab/pane/session/dev-session identity and provider requested/effective identity.
2. **Central policy engine.** PM already routes tool execution through permission, FileSafe, terminal binding, execution, and normalized result flow.
3. **Prompt/context ownership.** PM already has a single Prompt Pipeline SSOT for context selection, skill/tool/persona injection, and compaction.

The high-value lesson from this repo pass is not "copy their CLI." PM is GUI-first. The lesson is: **formalize the edge contracts underneath the GUI** so terminal, provider, tool, release, history, and agent-progress failures cannot become invisible state drift.

## PM local evidence baseline

| PM area | Evidence |
|---|---|
| Terminal as GUI shell surface | `Plans/Section15_MVP_Promoted_Features_Spec.md:175-238` defines terminal as canonical interactive shell surface and separates `terminal_section_id`, `terminal_tab_id`, `terminal_pane_id`, `terminal_session_id`, and `dev_session_id`. |
| Terminal interaction modes | `Plans/Section15_MVP_Promoted_Features_Spec.md:242-279` defines `live_input`, `scrollback_review`, `selection_active`, `search_active`, `tui_capture`, PTY passthrough, copy/paste, TUI, alternate-screen behavior. |
| Command metadata honesty | `Plans/Section15_MVP_Promoted_Features_Spec.md:281-346` requires shell-integration tiers and forbids fabricated command boundaries/success semantics when integration is weak. |
| Requested/effective capability state | `Plans/Section15_MVP_Promoted_Features_Spec.md:351-366` applies requested/effective state to terminal renderer, shell integration, detach/windowing, clipboard/IME, accessibility, transcript retention, and remote/local runtime behavior. |
| Terminal architecture | `Plans/Section15_MVP_Promoted_Features_Spec.md:573-627` already splits process host/PTY, terminal engine/transcript buffer, renderer, shell-integration extractor, and workspace chrome. |
| Provider/model identity | `Plans/Models_System.md:35-95` owns requested/effective provider/model/account resolver shape. |
| Provider bridge normalization | `Plans/CLI_Bridged_Providers.md:80-150` says bridge context is not host authority and requires normalized output preservation. |
| Tool policy engine | `Plans/Tools.md:101-120` requires permission → FileSafe → terminal binding → execute/reject → normalized outcome. |
| Storage foundation | `Plans/storage-plan.md:1504-1519` uses seglog/redb/checkpoints/tool usage/usage events. |
| Prompt/context SSOT | `Plans/Prompt_Pipeline.md:20-80` owns context selection, compaction, skill/tool/persona/run-envelope assembly. |

## Most important PM gaps found by comparison

The gaps are not broad feature absence; they are **edge-contract specificity gaps**.

1. **Terminal protocol matrix.** PM covers VT/ANSI/grid/buffer generally, but quick scans did not find explicit live Plan coverage for OSC 52, bracketed paste, DEC synchronized updates, tmux, pasteboard priority, or global-keybind failure isolation. PM does cover OSC 7 and OSC 133-style shell-integration markers, but not enough low-level fixtures.
2. **No silent output loss accounting.** PM says retention/pruning are honest and high-output should not stall UI, but it needs receipts at each ingestion step: PTY accepted bytes, parsed cells, transcript chunks, storage flush, paint/defer/drop.
3. **Accessibility text mirror.** PM has screen-reader labels and requested/effective accessibility support, but terminal GPU/grid accessibility requires a separate text-state projection.
4. **Tool-turn settlement state.** Upstream projects repeatedly fail on truncation, nullable content, large tool results, and redaction ordering. PM needs a no-lossy-success state machine.
5. **Release/migration gates.** Cline, Agent Zero, Pi, Ghostty, Warp, and Codex all show update/migration regressions. PM needs explicit canary, migration, asset provenance, link validation, and rollback contracts.
6. **External config import policy.** MCP/tool configs imported from other agents must be first-class suggestions with provenance and trust gates, not auto-executable facts.
7. **Resource governors.** PM needs unified watcher/indexer/history/MCP/tool-result quotas so GUI background services cannot starve the host.
8. **Agent progress heartbeat.** GUI agents and terminal-bound long commands need checkpoint/progress/next-check/stalled state, not only chat scrollback.

## Repo-by-repo lessons

### 1. Cline

**Strengths to learn from**
- Broad surface strategy: IDE extension, CLI, SDK, Kanban/multi-agent board, scheduled agents, MCP/plugins, rules/skills, and multiple providers.
- Product-grade workflow affordances: Plan/Act, diff review, checkpoints, bash execution, `.clinerules`, skills, plugin ecosystem.
- Active PR stream on provider catalog/capabilities, CLI codesigning, terminal reliability, output-token handling, model reasoning controls, image capability filtering, inline XML tool recovery, and provider history bounds.

**Pitfalls to avoid**
- Release stability and migration: users report critical behavior breaking on update, tasks/chats becoming unusable, and inability to trust automatic updates.
- Plan/Act and approval boundary failures: issue reports show plan-mode work writing files/running Docker/schema changes and destructive shell commands running without approval because model/provider output claimed approval wasn't required.
- Provider/tool normalization fragility: current issues include large MCP tool result crashes, string/array content shape failures, provider ID bugs, and reasoning-only response misclassification.
- Terminal/session lifecycle debt: orphaned terminal sessions and VS Code terminal reliability PRs show shell integration cannot be an afterthought.

**PM delta**
- Runtime-enforced mode ceilings and `AutonomyCeilingReceipt`.
- Large tool result managed-output references.
- Provider model/catalog capability versioning.
- Release rings + state migration tests.

### 2. Agent Zero

**Strengths to learn from**
- Launcher/Docker onboarding and in-thread provider setup reduce first-run friction.
- Web UI and multi-agent customization make agent behavior inspectable.
- Changelog indicates serious work on Responses fallback, MCP image artifacts, stricter tool schema compatibility, ordered replay, large backup reliability, and provider setup.

**Pitfalls to avoid**
- Credential/security concerns need design-time redaction and metadata minimization, not later bug triage.
- CLI/server protocol mismatch can corrupt terminal state, misreport capability, leave orphan processes, and break cooked terminal mode.
- Truncated tool-call turns treated as successful can create unbounded retry loops.
- Chat history bloat and raw JSON context pollution can crash runtimes and degrade model context.
- v2 upgrades and tag/migration flows show state migration must be treated as a product feature.

**PM delta**
- `BridgeHandshakeReceipt` with version/capability/session-mode pre/post.
- No partial/truncated turn can be success.
- History object budgets and context compiler guards.
- Redaction-before-render/persistence ordering.

### 3. Pi

**Strengths to learn from**
- Small, focused harness architecture: CLI, agent-core, and unified provider API.
- Recent provider-factory changes show a cleaner boundary: explicit provider factories rather than inherited selective entrypoints.
- Prompt cache/accounting design demonstrates value of visible usage/cached-token cost tracking.
- PR stream includes SQLite session storage and stable TUI redraw improvements.

**Pitfalls to avoid**
- New model integrations expose edit-tool failures and nullable reasoning/content edge cases.
- Context-window clamping versus max-token policy needs precise semantics.
- Binary packaging/provenance and extension loading require release/installer verification.
- Generated release notes/docs links need validation under each rendering target.

**PM delta**
- Provider-native nullable content/reasoning normalization.
- Context-window/token-budget acceptance tests.
- Binary provenance and generated-link validation in governance seal.
- SQLite/redb session chunking tests for PM storage.

### 4. OpenAI Codex

**Strengths to learn from**
- Goals, subagents, and skills match PM's durable-goal architecture direction: persistent objectives, progress checkpoints, specialized parallel agents, and reusable workflow skills.
- Official skills docs make progressive disclosure explicit and limit initial skill-list context budget.
- Changelog shows hardening around managed permission profile allowlists, skill load warning deduplication, terminal/app UI, Windows native sandbox/proxy behavior, handoff/worktrees, and MCP rendering.
- PR stream shows exact issues PM should copy conceptually: scope model cache by provider/account, harden namespace-aware executable policy matching, one-shot approval for inspected wrappers.

**Pitfalls to avoid**
- Current issues show even official tools can have redaction timing, TUI terminal state, and API surface edge cases.
- Subagents use more tokens and should be explicit and bounded.
- Goal progress reporting must be compact, verifiable, and checkpoint-oriented.

**PM delta**
- Skill catalog budget and omission warnings.
- Goal heartbeat and checkpoint receipts.
- Redaction settlement before transcript rendering.
- Provider/account-scoped model/cache state.
- Namespace-aware executable policy matching.

### 5. Ghostty

**Strengths to learn from**
- Terminal-first engineering discipline: fast native/GPU terminal, platform-native UI, full VT/terminal API focus, detailed release notes, performance and regression patches.
- 1.3.0 release shows the importance of scrollback search, native scrollbars, click-to-move-cursor, and hundreds of terminal correctness/performance fixes.
- 1.3.1 shows realistic regression strategy: patch quickly after a large terminal release.
- Discussions/issues surface deep terminal details PM must account for: screen readers, global keybind/event taps, pasteboard priority, IME crashes, key repeats, mouse/TUI forwarding.

**Pitfalls to avoid**
- GPU rendering alone does not solve accessibility.
- Global keybindings/event taps can harm the entire OS if not isolated.
- Clipboard/pasteboard type priority can cause surprising behavior.
- Terminal shell-integration and prompt markers have complex edge cases across shells/themes.

**PM delta**
- Accessibility text mirror.
- Global shortcut watchdog and kill switch.
- Clipboard/paste safety policy.
- Explicit shell integration fixtures for dynamic/multiline prompts.

### 6. Warp

**Strengths to learn from**
- Warp’s evolution from terminal into agentic development environment shows how terminal, code review, MCP, settings, agent mode, cloud/background agents, and third-party CLI agents can converge into a GUI-ish developer workspace.
- Changelog details are directly useful: TOML settings, long-running shell command snapshots, “last seen by agent,” project MCP cwd defaults, session reopen, WSL PWD restore, alt-screen CLI agent visual fixes, context-window configuration, MCP from third-party agents, and agent/code-review interaction.
- Strong GUI lessons: visible follow-up/steering state, configurable max context per profile, clickable disabled-tool explanations, restore semantics.

**Pitfalls to avoid**
- File watcher/resource exhaustion can damage unrelated tools.
- Focus/stall bugs can make an agent appear working while nothing progresses.
- Open-source release creates huge issue/PR load; triage process matters.
- Terminal agent features can obscure core terminal reliability if the product drifts too hard toward agent UI.

**PM delta**
- Runtime resource governor.
- Agent heartbeat/stall detection.
- MCP config import provenance.
- GUI-first policy: terminal is built in, but PM control plane stays GUI/Goal/PlanUnit driven.

### 7. tmux

**Strengths to learn from**
- Stable abstractions: sessions/windows/panes, detach/reattach, copy mode, scripting/control mode, status/popup/menu, and well-tested UTF-8/mouse/focus behavior.
- CHANGES show decades of protocol correctness work: OSC 133 prompt markers, OSC 52 clipboard, output buffering/backpressure, extended keys, mouse features, UTF-8/zero-width joiners, copy-mode commands, pane/server identities.
- Current issues are specialized and low-volume compared with AI-agent repos, which is a signal: the model is small, durable, protocol-driven, and intensely tested.

**Pitfalls to avoid**
- Prompt metadata like OSC 133 is semantic state, not merely text; clearing a line can accidentally clear command navigation markers.
- Mouse/copy-mode crashes and redraw synchronization are real even in mature terminal software.
- Output speed/client speed mismatch must be explicit.

**PM delta**
- Treat semantic shell markers as grid metadata with lifecycle rules.
- Add control-mode/backpressure-like fairness in terminal ingestion/rendering.
- Terminal session/window/pane invariants should be testable independent of GUI chrome.

## Prioritized action backlog

### P0-TERMINAL-PROTOCOL-MATRIX — Built-in GUI terminal protocol coverage (P0)

**Sources:** ghostty-org/ghostty, tmux/tmux, warpdotdev/warp  
**Observed upstream signal:** Ghostty/tmux current issues and releases revolve around OSC 133 shell integration, pasteboard semantics, mouse/key handling, Unicode/ZWJ crashes, and platform-specific regressions; Warp changelog shows alt-screen CLI-agent contrast, dropped keystrokes, zero-width crash, WSL PWD restore, session reopening, MCP spawn cwd, and settings/autonomy fixes.  
**PM current coverage:** PM Section15 has strong identity/lifecycle/interaction model, shell-integration tiers, cross-platform matrix, and parser-engine gates.  
**Gap:** No explicit terminal protocol test matrix for OSC 52, OSC 8, OSC 9;4, OSC 133, OSC 633, bracketed paste, focus events, SGR/UTF-8 mouse, DEC synchronized updates, pasteboard priority, or terminal-feature negotiation.  
**Plan change:** Add PlanUnits under Section15 or a new Built_In_Terminal_Runtime.md that enumerate VT/xterm/OSC protocol fixtures and acceptance tests. Treat protocols as data fixtures with replayable byte streams, not prose-only requirements.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md, Plans/storage-plan.md, Plans/Automated_Testing_System.md  
**Acceptance tests:**  
- VT replay corpus includes OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate screen, synchronized update sequences.
- Parser output is deterministic across macOS/Linux/Windows/WSL fixtures.
- Weak/unknown protocol support downgrades requested-vs-effective state rather than fabricating command blocks.

### P0-TERMINAL-OUTPUT-BACKPRESSURE — No silent terminal output loss (P0)

**Sources:** tmux/tmux, ghostty-org/ghostty, warpdotdev/warp  
**Observed upstream signal:** tmux history includes backpressure/control-mode buffering design; older issue families report output lines missing when terminal/client can't keep up; Warp/Ghostty issue streams include huge output, rendering, and persisted block edge cases.  
**PM current coverage:** PM says retention/pruning are honest and high-output sessions must not stall UI; parser-engine gates include huge output fixtures.  
**Gap:** PM needs explicit loss accounting: when bytes are accepted by PTY reader, parsed, painted, persisted, pruned, redacted, or dropped/deferred, there must be receipts and user-visible status.  
**Plan change:** Add TerminalIngestionReceipt and TerminalBackpressureState. Differentiate accepted-by-PTY, parsed-to-grid, appended-to-transcript, flushed-to-storage, painted, pruned, redacted, and diagnostic-exported.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md  
**Acceptance tests:**  
- A fast-output fixture records byte counts and no silent loss.
- If retention cap prunes, transcript chunk references prove what remains and what was pruned.
- UI thread never blocks on raw PTY ingestion.

### P0-TERMINAL-ACCESSIBILITY-TEXT-MIRROR — Accessible terminal text model separate from renderer (P0)

**Sources:** ghostty-org/ghostty  
**Observed upstream signal:** Ghostty screen-reader discussion notes GPU rendering prevents screen readers from extracting terminal state and calls for direct screen-reader output, terminal-state exposure, cursor navigation support, and spam silencing.  
**PM current coverage:** PM has accessibility requirements and screen-reader-readable labels, plus requested-vs-effective disclosure for accessibility support.  
**Gap:** PM still needs an explicit terminal accessibility text mirror and speech/event throttling model; labels alone are insufficient for a terminal grid.  
**Plan change:** Add TerminalAccessibleBuffer projection from canonical grid/transcript state, with cursor navigation, line/selection reading, output announcement modes, and long-output silence/throttle controls.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Screen reader projection can read current line, selection, prompt/command boundaries, and latest output without scraping GPU pixels.
- Long-running spam commands throttle announcements without hiding state.

### P0-PLAN-ACT-PERMISSION-BOUNDARY — Plan/Act/autonomy boundaries must be runtime enforced (P0)

**Sources:** cline/cline, openai/codex, warpdotdev/warp  
**Observed upstream signal:** Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.  
**PM current coverage:** PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.  
**Gap:** Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.  
**Plan change:** Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.  
**Target docs:** Plans/Permissions_System.md, Plans/Tools.md, Plans/Run_Modes.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.

### P0-TOOL-RESULT-SETTLEMENT — Partial/truncated/nullable provider tool turns cannot count as success (P0)

**Sources:** agent0ai/agent-zero, cline/cline, earendil-works/pi, openai/codex  
**Observed upstream signal:** Agent Zero issue list reports finish_reason=length treated as success and causing unbounded retry; Cline issue list reports large MCP tool_result crash; Pi issue list reports null content/reasoning during tool use; Codex issue list has redaction-hook timing for tool output.  
**PM current coverage:** PM has normalized tool outcomes and provider bridge output preservation requirements.  
**Gap:** Need explicit `ToolTurnSettlement` state machine for provider native turns: success, partial, truncated, malformed, nullable-content, redacted, retained, retryable, fatal.  
**Plan change:** Add no-lossy-success rule: a tool/model turn is not successful until required content/result/error/truncation metadata is retained and normalized. Length truncation is `partial_truncated`, not success.  
**Target docs:** Plans/Tools.md, Plans/CLI_Bridged_Providers.md, Plans/Models_System.md, Plans/storage-plan.md  
**Acceptance tests:**  
- finish_reason=length with tool call is classified partial_truncated.
- nullable reasoning/content arrays are normalized without crashing and without dropping provider-native metadata.
- large MCP tool_result is stored as managed output ref or rejected with explicit retention failure.

### P0-PROVIDER-METADATA-REPLAY — Provider-native reasoning/thinking/message metadata replay (P0)

**Sources:** cline/cline, agent0ai/agent-zero, earendil-works/pi, openai/codex  
**Observed upstream signal:** Cline PRs/issues target model catalogs, reasoning effort controls, provider IDs, image capability omission, transient empty model responses, string agent messages, tool invocation repair; Pi issues include thinking-block normalization and Bedrock/OpenAI Responses provider work; Codex PR scopes model cache by provider/account.  
**PM current coverage:** PM has requested/effective provider/model/account identity and provider facade normalization.  
**Gap:** Need a typed provider-native artifact replay/drop/canonicalize policy for thinking blocks, signatures, reasoning IDs, nullable content, model variants, image/video content, provider account scoping.  
**Plan change:** Add ProviderNativeMetadataPolicy table: per provider/model capability, fields to retain, redact, drop-on-cross-provider, replay-only-same-account, or canonicalize. Include cache keys and model catalog version.  
**Target docs:** Plans/Models_System.md, Plans/CLI_Bridged_Providers.md, Plans/Prompt_Pipeline.md, Plans/Multi-Account.md  
**Acceptance tests:**  
- Switching provider/model never replays incompatible native reasoning blocks.
- Model cache scoped by provider+account+capability catalog version.
- Image/tool/reasoning content gates check capabilities before sending.

### P0-HISTORY-STORAGE-CAPS — Bounded session/history storage (P0)

**Sources:** agent0ai/agent-zero, cline/cline, earendil-works/pi  
**Observed upstream signal:** Agent Zero issue list reports chat history metadata ~127MB and raw JSON pollution of utility-model context; Cline issues/PRs target large MCP result crashes and compacted provider history; Pi has a SQLite session-storage PR.  
**PM current coverage:** PM uses seglog/redb/checkpoints and says transcript retention is bounded/honest.  
**Gap:** Need explicit per-record, per-turn, per-tool-result, and per-thread cap policy with managed-output references and context compiler backpressure.  
**Plan change:** Add HistoryObjectBudget and ManagedOutputRef requirements. Segment large histories by reference; never inline unbounded JSON into model context.  
**Target docs:** Plans/storage-plan.md, Plans/Prompt_Pipeline.md, Plans/Runtime_Artifacts_Panel.md  
**Acceptance tests:**  
- 127MB metadata fixture is rejected/segmented before UI or model context load.
- Context compiler emits compact summaries plus refs, not raw massive JSON.
- Large tool results remain retrievable from artifacts with hashes.

### P0-RELEASE-MIGRATION-GATE — Release, installer, migration, and rollback hardening (P0)

**Sources:** cline/cline, agent0ai/agent-zero, earendil-works/pi, ghostty-org/ghostty, warpdotdev/warp, openai/codex  
**Observed upstream signal:** Cline v4 issues report task corruption and release stability concerns; Agent Zero issue list includes missing upgrade tag, v2 regression, Launcher/self-update bugs; Pi has binary/provenance and packaging/link issues; Ghostty 1.3.1 quickly patched 1.3.0 regressions; Warp changelog shows frequent migration/restore fixes; Codex changelog shows frequent CLI/app releases.  
**PM current coverage:** PM has governance gates and protected namespace, but release/migration strategy is not as explicit as runtime specs.  
**Gap:** Need a release compatibility plan: canary/stable rings, artifact provenance, generated-link checks, state migration tests, downgrade/backup restore, extension/CLI/server protocol handshake, terminal session preservation across updates.  
**Plan change:** Add Release_Compatibility_and_Migration.md or PlanUnits under Progression_Gates. All major updates must run state-migration and rollback fixtures before users get them.  
**Target docs:** Plans/Progression_Gates.md, Plans/Project_Output_Artifacts.md, Plans/storage-plan.md, Plans/Goal_Runtime_System.md  
**Acceptance tests:**  
- Major version migration has backup/restore test.
- Generated release links validate.
- Protocol version mismatch blocks with actionable message.
- App update does not orphan terminal/process sessions silently.

### P1-TERMINAL-CLIPBOARD-PASTE-SAFETY — Clipboard, pasteboard, bracketed paste, OSC 52 (P1)

**Sources:** ghostty-org/ghostty, warpdotdev/warp, tmux/tmux  
**Observed upstream signal:** Ghostty issue list includes paste preferring NSURL over plain text; Ghostty 1.3.0 fixed a paste/drag command-execution CVE; tmux CHANGES include OSC 52 clipboard support; Warp issues include copy/paste isolation.  
**PM current coverage:** PM has copy/paste/selection semantics and default copy-on-select disabled.  
**Gap:** Need explicit paste-source priority and pasted-control-character handling, bracketed-paste negotiation, OSC 52 policy, and cross-context clipboard isolation.  
**Plan change:** Add TerminalClipboardPolicy: plain text preference, URI/file types explicit, control-character confirmation, bracketed paste support state, OSC 52 allow/ask/deny, local/remote/container clipboard scope.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Permissions_System.md, Plans/FileSafe.md  
**Acceptance tests:**  
- Pasting mixed URL/plain text chooses plain text unless user selects URI action.
- Pasted Ctrl+C/control chars cannot execute without warning/normalization.
- OSC 52 read/write respects policy and remote trust.

### P1-TERMINAL-GLOBAL-HOTKEY-ISOLATION — Global keyboard hook isolation (P1)

**Sources:** ghostty-org/ghostty, warpdotdev/warp  
**Observed upstream signal:** Ghostty discussion reports system-wide keyboard freezes tied to global quick-terminal keybinding/event tap; Warp changelog includes global hotkey memory leak fixes.  
**PM current coverage:** PM has shortcut conflict disclosure and terminal input ownership states.  
**Gap:** No explicit global-event-tap isolation requirements: hooks must not run on UI/compositor main thread, must auto-disable on stall, and must be observable.  
**Plan change:** Add GlobalShortcutSafety PlanUnit for all app-level hotkeys, not only terminal. Include watchdog, timeout auto-disable, kill switch, and diagnostic banner.  
**Target docs:** Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Permissions_System.md  
**Acceptance tests:**  
- Global hotkey handler stall cannot freeze system input.
- User can disable terminal/global hotkey path from safe mode.
- Diagnostic bundle records hook health.

### P1-TERMINAL-SESSION-PRESERVE-UPDATE — Terminal session continuity across relaunch/update (P1)

**Sources:** warpdotdev/warp, tmux/tmux, ghostty-org/ghostty  
**Observed upstream signal:** Warp issue requests terminal/agent sessions alive across relaunch/app updates; Warp changelog includes reopen closed sessions and restored WSL PWD; tmux's mature value is session/window/pane durability.  
**PM current coverage:** PM says live continuity after app restart is best-effort and explicit when unavailable; historical state is not fake live shell.  
**Gap:** Need a concrete platform matrix for live session survival/reconnect and a UX flow for when only historical review can be restored.  
**Plan change:** Add TerminalSessionRestorePolicy by platform/runtime: local PTY, WSL, SSH, container, devcontainer. Define reconnect tokens, when impossible, and exact banners/actions.  
**Target docs:** Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/storage-plan.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Relaunch fixtures prove PWD/profile/layout/transcript restoration.
- If live PTY cannot survive, UI says review-limited and offers restart/rerun, not fake continuity.

### P1-RESOURCE-QUOTAS-INDEXERS-WATCHERS — Resource ceilings for indexers/watchers/background agents (P1)

**Sources:** warpdotdev/warp, agent0ai/agent-zero, cline/cline  
**Observed upstream signal:** Warp issue reports exhausting hundreds of thousands of file watchers; Agent Zero history bloat crashes; Cline large MCP/history issues.  
**PM current coverage:** PM has dirty-layer watcher design and storage rollups but not a global resource-governor narrative for all background services.  
**Gap:** Need per-project/global file watcher, indexer, terminal transcript, MCP result, and agent-context budgets with user-visible degradation.  
**Plan change:** Add RuntimeResourceGovernor PlanUnit with quotas, backoff, suspension, prioritization, and Explain/Resume controls.  
**Target docs:** Plans/FileManager.md, Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md  
**Acceptance tests:**  
- Large repo cannot allocate unbounded watchers.
- Quota exceeded degrades with warning and exact subsystem, not crash.

### P1-MCP-AND-THIRD-PARTY-CONFIG-IMPORT — MCP and external agent config import with trust boundaries (P1)

**Sources:** cline/cline, warpdotdev/warp, agent0ai/agent-zero, openai/codex  
**Observed upstream signal:** Cline emphasizes MCP/plugins and `.clinerules`; Warp changelog says MCP servers detected from third-party agents become visible/spawnable and project MCP servers spawn from repo root; Codex docs expose MCP/skills/plugins surfaces.  
**PM current coverage:** PM has MCP Integration and central tool registry/permission model.  
**Gap:** Need config-import provenance and trust policy: imported MCP config is a suggestion, not automatically executable.  
**Plan change:** Add ImportedToolConfigSource records: source app/file, hash, cwd resolution, permission default, secret redaction, first-run review.  
**Target docs:** Plans/MCP_Integration.md, Plans/Tools.md, Plans/Permissions_System.md, Plans/FileSafe.md  
**Acceptance tests:**  
- Imported MCP server from `.claude`/Codex/Warp config defaults ask/disabled until reviewed.
- Relative command cwd is project-root only when explicitly resolved and shown.

### P1-CONTEXT-SKILL-BUDGETS — Skill/context catalog progressive disclosure (P1)

**Sources:** openai/codex, cline/cline, earendil-works/pi  
**Observed upstream signal:** Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.  
**PM current coverage:** PM Prompt Pipeline owns skill bundling and compaction algorithms.  
**Gap:** Need explicit skill/tool/catalog listing budgets and omission warnings in GUI.  
**Plan change:** Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.  
**Target docs:** Plans/Prompt_Pipeline.md, Plans/Skills_System.md, Plans/Tools.md, Plans/Models_System.md  
**Acceptance tests:**  
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.

### P1-SECURITY-CREDENTIAL-LOGGING — Credential and sensitive output redaction timing (P1)

**Sources:** agent0ai/agent-zero, cline/cline, openai/codex  
**Observed upstream signal:** Agent Zero security issue raises credential leakage concerns; Codex issue list has PostToolUse redaction-before-transcript-rendering problem; Cline PRs add credential lifecycle debug logging.  
**PM current coverage:** PM has FileSafe and privileged session metadata minimization.  
**Gap:** Need a redaction-time ordering contract: raw tool output must not hit UI/transcript before redaction policy has a chance to apply, unless explicitly marked sensitive/raw local-only.  
**Plan change:** Add RedactionSettlement stage before UI/render/persistence for tool/terminal/model outputs; keep secure raw vault only when required for replay with explicit policy.  
**Target docs:** Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Tools.md, Plans/storage-plan.md  
**Acceptance tests:**  
- Secret fixture in tool output is redacted before GUI transcript render.
- Privilege metadata logs actor/target/realm/transport without command secrets.

### P1-CLI-BRIDGE-PROTOCOL-HANDSHAKE — CLI/server/extension protocol compatibility (P1)

**Sources:** agent0ai/agent-zero, cline/cline, openai/codex  
**Observed upstream signal:** Agent Zero CLI/server mismatch produced terminal corruption, false code-exec status, timeout, orphan, and cooked-mode issues; Cline CLI package/version issues and codesigning failures; Codex CLI releases patch platform/sandbox/proxy behavior.  
**PM current coverage:** PM has CLI_Bridged_Providers and ProviderRequestEnvelope.  
**Gap:** Need version/capability handshake and terminal-mode restore around all CLI bridges.  
**Plan change:** Add BridgeHandshakeReceipt: protocol version, binary hash, provider version, shell/terminal mode pre/post, cwd, capabilities, keepalive, timeout policy.  
**Target docs:** Plans/CLI_Bridged_Providers.md, Plans/Tools.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- Version mismatch blocks before raw protocol noise hits terminal.
- Bridge restores cooked mode/echo on crash or timeout.
- Orphan process cleanup receipts written.

### P1-AGENT-FOCUS-WATCHDOG — Agent focus/progress watchdog for GUI (P1)

**Sources:** warpdotdev/warp, cline/cline, openai/codex  
**Observed upstream signal:** Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.  
**PM current coverage:** PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.  
**Gap:** Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.  
**Plan change:** Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.  
**Target docs:** Plans/Goal_Runtime_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Section15_MVP_Promoted_Features_Spec.md  
**Acceptance tests:**  
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.

### P2-DOCS-GENERATED-LINK-VALIDATION — Generated docs/release notes link validation (P2)

**Sources:** earendil-works/pi  
**Observed upstream signal:** Pi issue reports generated release-note relative links broken on GitHub/terminal and suggests improving prompt/tests.  
**PM current coverage:** PM has governance shards/evidence and plan validators.  
**Gap:** Need link-mode validators for generated Markdown across GitHub, local GUI, terminal/plaintext, and app viewer.  
**Plan change:** Add GeneratedMarkdownLinkCheck to governance seal.  
**Target docs:** Plans/Progression_Gates.md, Plans/Project_Output_Artifacts.md  
**Acceptance tests:**  
- Release notes/bootstrap docs validate relative links under repo, GitHub rendered, and app routes.

### P2-BINARY-PROVENANCE-ASSETS — Binary/provenance/codesigning (P2)

**Sources:** earendil-works/pi, cline/cline, openai/codex  
**Observed upstream signal:** Pi issue requests SHA256SUMS/provenance for binaries; Cline has AMFI/codesign killed CLI and Darwin sign PRs; Codex ships npm CLI releases.  
**PM current coverage:** PM has Spec Lock/governance hashes but product release asset provenance is not detailed.  
**Gap:** Need release asset signature/hash/SBOM policy for any PM distributed binary/plugin/bridge.  
**Plan change:** Add ReleaseArtifactProvenance PlanUnit.  
**Target docs:** Plans/Project_Output_Artifacts.md, Plans/Progression_Gates.md  
**Acceptance tests:**  
- Every downloadable binary/plugin has SHA256, signing/provenance, build source ref, and install verification.

### P2-GUI-NOT-CLI-CONTROL-PLANE — Translate CLI lessons into GUI adapter contracts (P2)

**Sources:** warpdotdev/warp, openai/codex, cline/cline, tmux/tmux  
**Observed upstream signal:** Warp became an agentic development environment born out of terminal; Codex offers CLI/app/IDE; Cline offers IDE/terminal/CLI/SDK/Kanban; tmux is terminal-native and scriptable.  
**PM current coverage:** PM is GUI-first and Section15 says terminal is canonical interactive shell surface, not app CLI.  
**Gap:** Need explicit non-goal: do not let a PM CLI become the main product. CLI/terminal lessons feed internal tool/adapter APIs, GUI command catalog, and embedded terminal behavior.  
**Plan change:** Add GUI-first terminal policy note: built-in terminal is a user shell and agent surface; PM command/control remains GUI/Goal/PlanUnit driven.  
**Target docs:** Plans/FinalGUISpec.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/UI_Command_Catalog.md  
**Acceptance tests:**  
- Every terminal action has GUI-visible state and command palette command; no core workflow requires opaque CLI-only state.

## Concrete PlanUnit suggestions

Add or update PlanUnits with these canonical names or equivalents:

| PlanUnit | Owner doc | Purpose |
|---|---|---|
| `TERMINAL-PROTOCOL-OSC-MATRIX` | Section15 / Built_In_Terminal_Runtime | OSC 52/8/9;4/133/633, bracketed paste, focus, mouse, alternate-screen, synchronized updates. |
| `TERMINAL-OUTPUT-BACKPRESSURE-RECEIPTS` | Section15 / storage-plan | Byte/cell/transcript/flush/paint/prune accounting. |
| `TERMINAL-ACCESSIBLE-TEXT-MIRROR` | Section15 / FinalGUISpec | Screen-reader text-state projection independent of renderer. |
| `TERMINAL-CLIPBOARD-PASTE-SAFETY` | Section15 / FileSafe / Permissions | Clipboard type priority, control-character paste, OSC 52, remote trust. |
| `TERMINAL-GLOBAL-HOTKEY-SAFETY` | FinalGUISpec / Section15 | Event-tap isolation, watchdog, safe mode. |
| `TOOL-TURN-SETTLEMENT` | Tools / CLI_Bridged_Providers | Truncation, nullable content, malformed tool calls, redaction, retryability. |
| `PROVIDER-NATIVE-METADATA-POLICY` | Models_System / Prompt_Pipeline | Thinking/reasoning/image/tool metadata replay/drop/canonicalize. |
| `HISTORY-OBJECT-BUDGETS` | storage-plan / Prompt_Pipeline | Per-message/tool-result/history caps and managed refs. |
| `RELEASE-COMPATIBILITY-MIGRATION` | Progression_Gates / Project_Output_Artifacts | Major-version migration, backup/restore, tags/assets/provenance, generated links. |
| `RUNTIME-RESOURCE-GOVERNOR` | FileManager / storage-plan / Runtime Artifacts | Watchers, indexers, transcript, MCP, agent quotas. |
| `AGENT-PROGRESS-HEARTBEAT` | Goal_Runtime_System / Runtime Artifacts | Last action, next check, stalled state, terminal snapshot trigger. |
| `IMPORTED-TOOL-CONFIG-PROVENANCE` | MCP_Integration / Tools | Third-party MCP/config import as reviewed, permissioned suggestions. |

## Terminal-specific “do not ship without” checklist

PM’s built-in terminal should not ship unless these are true:

1. Terminal protocol replay corpus covers OSC 52/8/9;4/133/633, bracketed paste, focus events, SGR mouse, alternate screen, synchronized updates, extended keys, wide/zero-width/grapheme cases.
2. PTY ingestion/render/storage has explicit backpressure and no-silent-loss receipts.
3. Copy/paste is correct for plain text vs URI/file types, control characters, remote trust, and OSC 52.
4. Accessibility has a real terminal text projection, not only labels around a GPU canvas.
5. Global shortcuts cannot freeze OS-wide input and have watchdog/safe-mode escape.
6. Command blocks are never fabricated under weak shell integration.
7. `terminal_session_id` continuity is not confused with tab/pane/dev-session continuity.
8. App update/relaunch/reopen surfaces exact live vs review-limited continuity.
9. TUI mouse/keyboard capture and terminal-level override paths are visible.
10. Terminal diagnostic bundle separates metadata from transcript content and respects secrets.

## GUI-first interpretation

PM should not become a CLI product because Cline, Codex, Warp, Agent Zero, and Pi have CLIs. PM should use their CLI lessons for **internal adapter contracts**:

- a GUI action should have the same deterministic envelope as a CLI command would,
- a terminal-visible shell action should still produce a canonical runtime event,
- imported CLI-agent/MCP configs should be reviewed by GUI policy,
- the built-in terminal is a user shell and agent surface, not the main product control plane,
- every terminal/agent state must be visible in GUI inspectors, command palette, runtime artifacts, and diagnostic bundles.

## Final recommendation

Treat this external repo pass as a new PM ledger input family:

- `external_repo_lesson`
- `terminal_protocol_lesson`
- `provider_tool_failure_lesson`
- `release_migration_lesson`
- `resource_governor_lesson`
- `gui_first_adapter_lesson`

Do **not** blend these into broad prose. Convert the P0/P1 rows into discrete PlanUnits with acceptance criteria and validators. The OpenCode review already showed PM needs stronger provider/session/tool settlement; this pass broadens the evidence: Cline/Agent Zero/Pi/Codex show model/provider/tool/context failure modes, while Ghostty/Warp/tmux show terminal/protocol/session/UI failure modes.

