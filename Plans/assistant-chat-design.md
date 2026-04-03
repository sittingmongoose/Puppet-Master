# Assistant & Chat UI -- Design Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary

- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-message only), and media-generation invocation model. SSOT: `Plans/Media_Generation_and_Capabilities.md`.
- 2026-02-25: Remediation alignment with `Plans/GitHub_Integration.md §B.3` — `/actions` and `/actions logs` outputs now require the same run/log summary fields and failure-state parity as the Actions panel.
- 2026-02-25: Hardened §26 settings/report consistency: clarified that per-pass provider/model settings remain app-settings-only while resolved values are mirrored into `validation_pass_report` payload fields (`provider`, `model`) for auditability (see `Plans/Project_Output_Artifacts.md §10.2`); added acceptance criterion for settings-to-report parity.
- 2026-02-25: Added §5.2 Git & GitHub Slash Commands and §23.X Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.
- 2026-02-25: Added §26 Per-Pass Validation Model/Provider Settings UX: settings group for per-pass (Pass 1/2/3) provider+model selection for the Three-Pass Canonical Validation Workflow (Plans/chain-wizard-flexibility.md §12). Stored in app settings (not project artifacts). Deterministic defaults via platform_specs. DRY: reuses chat platform+model dropdowns.
- 2026-02-24: Aligned Interview/Assistant output surfacing with **canonical sharded plan graphs** under `.puppet-master/project/plan_graph/` (**index + node shards**). Outputs are **persisted canonically in seglog** and projected into `.puppet-master/project/...` for file-based review; `.puppet-master/project/plan.md` remains the human-readable plan view.
- 2026-02-23: Added Interview chat UX cross-reference to Contract Layer outputs and required `.puppet-master/project/*` artifact pack so interview completion is maximally AI-executable and verifiable (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md` §5.7/§11).

**Date:** 2026-02-20  
**Status:** Plan document only  
**Cross-references:** Plans/FileManager.md (File Manager, IDE-style editor, click-to-open), Plans/storage-plan.md (seglog/redb/Tantivy, chat persistence and search), Plans/interview-subagent-integration.md, Plans/orchestrator-subagent-integration.md, AGENTS.md (DRY Method)
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/Contracts_V0.md`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/UI_Command_Catalog.md`.

---

## Rewrite alignment (2026-02-21)
This plan's **UX requirements** remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md` with the following reconciled assumptions:

- **Core:** providers + unified event model + deterministic agent loop remain the base architecture.
- **Storage/search:** seglog/redb/Tantivy projections remain the persistence/search stack; JSONL mirror is derived only.
- **UI:** Rust + Slint remain the intended shell implementation.
- **Tooling:** tool registry, approvals, and results normalize through the unified event stream and shared permission/runtime contracts.
- **Auth/runtime taxonomy:** subscription-first remains the default posture, but Gemini is not one mixed provider. The concrete runtime platforms are `gemini` (**Gemini Direct**; direct API-key transport) and `gemini_cli` (**Gemini CLI**; CLI-wrapped OAuth/API-key/Google-credential flows). Consumers MAY group them under `provider_family_id = gemini`, but chat/runtime surfaces MUST display the concrete requested/effective platform instead of collapsing them into a single generic Gemini badge.
- **Identity disclosure:** requested/effective runtime identity, account binding, and auth state are imported from the shared runtime contracts. Assistant Chat must not invent a parallel provider/auth field set.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md

Any references in this plan to current UI widget implementation details should be treated as illustrative; the behavior and data contracts are what must remain stable.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
## Executive Summary

The **Assistant** is the third major surface alongside **Interview** and **Orchestrator**: a flexible chat for ask/plan/execute, teaching, **addressing dashboard warnings and Calls to Action (CtAs)** -- including HITL approval prompts -- and continuing work after the orchestrator completes. Chat UI is shared between Assistant and Interview with mode-specific presentation (Interview: phase-centric with thought stream and message strip; Assistant: message history, plan panel, thought stream). This plan defines modes, permissions, attachments, File Manager integration, Plan/Crew/BrainStorm behavior, and interview-phase UX. All design follows DRY: single source of truth for platform data (`platform_specs`), subagent names (`subagent_registry`), and reusable widgets per `docs/gui-widget-catalog.md`.

---

## Table of Contents

1. [Modes Overview](#1-modes-overview)  
2. [ELI5 Mode](#2-eli5-mode)  
3. [Permissions: YOLO vs Regular](#3-permissions-yolo-vs-regular)  
4. [Message submission (Steer vs Queue), queued editing, interrupt, and stop](#4-message-submission-steer-vs-queue-queued-editing-interrupt-and-stop)  
   - [4.1 Chat footer, queue UI, and files touched -- implementation detail](#41-chat-footer-queue-ui-and-files-touched--implementation-detail)  
5. [Commands (slash commands and custom commands)](#5-commands-slash-commands-and-custom-commands)  
   - [5.1 Git & GitHub Slash Commands](#51-git--github-slash-commands)  
6. [Teach](#6-teach)  
7. [Attachments, Web Search, and Extensibility](#7-attachments-web-search-and-extensibility)  
8. [Plan Mode Depth & Rules](#8-plan-mode-depth--rules)  
9. [File Manager, IDE-style editor, and @ Mention](#9-file-manager-ide-style-editor-and--mention)  
   - [9.1 LSP support in Chat (MVP)](#91-lsp-support-in-chat-mvp)  
10. [Chat History Search](#10-chat-history-search)  
11. [Threads and chat management](#11-threads-and-chat-management)  
   - [11.1 Thread State: `attention_required`](#111-thread-state-attention_required)  
   - [11.2 System Message Type: `clarification_request`](#112-system-message-type-clarification_request)  
   - [11.3 Thread State Lifecycle: `attention_required`](#113-thread-state-lifecycle-attention_required)  
12. [Context usage display](#12-context-usage-display)  
13. [Activity transparency: search, bash, and file activity](#13-activity-transparency-search-bash-and-file-activity)  
14. [Subagents & Crew](#14-subagents--crew)  
   - [14.1 Subagent visibility in thread -- implementation detail](#141-subagent-visibility-in-thread--implementation-detail)  
15. [Plan Mode + Crew Mode](#15-plan-mode--crew-mode)  
16. [Interview Phase UX (Chat Surface)](#16-interview-phase-ux-chat-surface)  
17. [Context & Truncation](#17-context--truncation)  
18. [BrainStorm Mode](#18-brainstorm-mode)  
19. [Documentation Audience (AI Overseer)](#19-documentation-audience-ai-overseer)  
20. [References](#20-references)  
21. [Dashboard Warnings and Calls to Action](#21-dashboard-warnings-and-calls-to-action)  
22. [Live Testing Tools and Hot Reload](#22-live-testing-tools-and-hot-reload)  
23. [Gaps, Competitive Comparison, and Enhancements](#23-gaps-competitive-comparison-and-enhancements)  
24. [Chat thread performance, virtualization, and flicker avoidance](#24-chat-thread-performance-virtualization-and-flicker-avoidance)
25. [Context Circle Enhancements (Addendum -- 2026-02-23)](#25-context-circle-enhancements-addendum----2026-02-23)
26. [Per-Pass Validation Model/Provider Settings (Invariant Sweep)](#26-per-pass-validation-modelprovider-settings-invariant-sweep)

---

## 1. Modes Overview

### 1.0 Primary Assistant mode strip

The primary Assistant mode strip exposes five stable choices: `Ask`, `Agent`, `Debug`, `Plan`, and `Deep Plan`.

| Primary Assistant mode | Purpose | Canonical runtime posture | Default execution posture | Primary outputs | Default next step |
|---|---|---|---|---|---|
| **Ask** | Read-only explanation, inspection, and research | `ask` | no execution | answer, guidance, cited findings | stay read-only or switch modes |
| **Agent** | Standard execution workflow for implementation and iteration | `regular` by default, `yolo` only when explicitly chosen | execution-capable | edits, commands, artifacts, verification | continue normal execution |
| **Debug** | Evidence-first automated diagnosis, fix, verification, and cleanup | `regular` by default; `yolo` only by explicit opt-in | execution-capable investigation | Investigation Context, bounded evidence, fix attempts, verification, cleanup status | continue, export bundle, or close the investigation |
| **Plan** | Faster, lighter planning for medium-complexity asks | `plan` | read-only | lightweight plan artifact + normalized TODO list | user reviews, then executes or queues |
| **Deep Plan** | Heavier planning for larger, riskier, or high-uncertainty asks | `plan` | read-only | rich planning artifact + normalized TODO list | user reviews in editor/doc pane, then executes or queues |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

Specialized workflows such as `Interview`, `BrainStorm`, and `Crew` remain supported, but they do not replace the primary Assistant mode strip. They are specialized overlays or routed flows that still normalize through the shared requested/effective runtime and overlay model.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md

### 1.0A Planning workflow rules

Planning-time rules for both `Plan` and `Deep Plan` remain:
- planning is read-only with respect to project files
- any planning artifact created during the planning run is a Puppet Master-controlled draft, not a normal repo file by default
- approval is required before the assistant can switch from planning into execution
- execution after approval reuses the approved plan/TODO state and runs under `regular` or `yolo`, never under `plan`
- queueing affects only post-approval execution, never the planning-time read-only run

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

### 1.0B Debug Mode contract
Debug Mode is the explicit Assistant entrypoint for PM's automated, evidence-first debugging workflow.

Required rules:
- Debug Mode is stronger than a behavioral hint. When selected, the assistant is expected to use debug-capable tools, bounded evidence capture, revalidation gates, and verification loops when policy and capabilities allow.
- Debug Mode is an Assistant-only workflow overlay, but the underlying debug-capable tools remain shared platform capabilities that Orchestrator, Interview, and delegated runs may use under the same contracts.
- Debug Mode remains execution-capable. There is no stable `Debug + ask` combination for automated investigations.
- Debug Mode persists `requested_mode_overlay = debug` and `effective_mode_overlay = debug`, while runtime mode and execution strategy continue to resolve through `Plans/Run_Modes.md`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md

**Closed debug phase model:**
1. `target_binding` — bind or confirm the exact debug target.
2. `baseline_capture` — capture starting state, reproduction preconditions, and relevant runtime identity.
3. `instrumentation` — add only the minimum temporary instrumentation required for diagnosis.
4. `reproduction` — reproduce or confirm the issue against the bound target.
5. `analysis` — reason over the bounded evidence set.
6. `repair` — apply the smallest viable fix or remediation step.
7. `verification` — verify whether the issue is resolved.
8. `cleanup` — remove temporary instrumentation, temporary env/config, and temporary debug-only runtime state.

**Revalidation rules:**
- Before any mutation-capable step after `target_binding`, the assistant MUST revalidate the investigation when the target identity, bound worktree/branch, requested/effective runtime identity, auth/account binding, or instrumentation availability has drifted.
- Revalidation is also mandatory after target restarts, debug adapter/session replacement, or evidence expiry that invalidates the current hypothesis.
- A revalidation gate surfaces an explicit reason in the Investigation Context; it MUST NOT silently continue as though the earlier target binding were still valid.
- `verification` is not optional. A fix attempt without a recorded verification result remains `attention_required` or `failed_cleanup`, not `resolved`.
- `cleanup` is the terminal mutation-capable phase for an otherwise successful investigation. Temporary instrumentation may persist only when the user explicitly preserves it or a preservation/hold rule says it must stay.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/GitHub_Integration.md

### 1.0C Runtime mode normalization (canonical)

The chat surface exposes both workflow overlays and runtime execution posture. Only the runtime posture normalizes into the canonical run-envelope `mode` used by `Plans/Run_Modes.md`.

| UI/workflow state | Canonical runtime mode | Notes |
|---|---|---|
| Ask | `ask` | Always read-only. |
| Plan / Deep Plan (before execution) | `plan` | Always read-only; produces planning output only. |
| Agent with standard approvals | `regular` | Standard execute posture. |
| Debug with standard approvals | `regular` | Debug overlay stays visible; runtime stays execution-capable without minting a new enum. |
| Debug with explicit YOLO posture | `yolo` | Power-user opt-in only. |
| Interview / BrainStorm / Crew execution with standard approvals | `regular` | Specialized overlays do not create extra runtime-mode enum values. |
| Explicit YOLO execution outside Debug | `yolo` | Full-automation posture. |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md

**Requires a project:** many assistant capabilities (for example `@` file mention, project-scoped commands, local browser targets, run/debug presets, and project-bound debugging) do not work when no project is selected. When no project is selected, only application-wide rules and non-project target kinds remain available.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 1.1 Chat controls: platform, model, and reasoning/effort

The chat window must allow the user to change platform, model, reasoning/effort, and worktree binding without leaving the chat.

Required controls (placement: chat header strip, same area as the context indicator / mode controls):

| Control | Requirement |
|---|---|
| **Platform** | Dropdown listing available platforms. Selection applies to the current thread and the next turn. Data comes from `platform_specs`; no hardcoding. |
| **Model** | Dropdown listing models for the currently selected platform. Models are dynamically discovered where supported, cached, and user-manageable via Settings or a manage-models entrypoint. Fallback model lists come from `platform_specs::fallback_model_ids(platform)`. |
| **Reasoning / effort** | Shown only when the active platform supports it. Applies to the next turn rather than interrupting an in-flight response. |
| **Worktree** | Icon button (rightmost in header strip, after Reasoning/effort). Dropdown for per-thread worktree binding: create, unbind, merge, PR, remove. Visual states: unbound (dimmed glyph), bound-clean (lit glyph), bound-dirty (lit glyph + dot indicator), bound-conflict (lit glyph + warning triangle). Hidden when the active project has no git repository. Full specification in the "Worktrees in Assistant" section below. |

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md

A *turn* is one complete user -> agent exchange: one user message plus the full agent response, including tool calls and final result. Changing platform, model, effort, or worktree binding takes effect on the next turn. If the user changes settings while a response is streaming, the current response completes with the prior selection.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

## 2. ELI5 Mode

There are **two separate ELI5 toggles**; they are independent and must not be conflated. The authoritative dual-copy checklist for in-scope strings is `Plans/FinalGUISpec.md` §7.4.0.

### 2.1 Chat-level ELI5 (in chat only)

- **What:** A toggle **in the chat UI** that, when **on**, instructs the Assistant to explain technical terms and steps in simpler terms and with more detail (ELI5 = "Explain Like I'm 5") in **that chat**.
- **Default:** **OFF** (Expert/default LLM behavior). By default, no extra "explain simply" instruction is added.
- **Scope:** Affects **Assistant chat behavior only** (explanations, follow-ups, teaching in the conversation).
- **Does NOT affect:** Interviewer **documentation writing style**. When the interview generates PRD, AGENTS.md, requirements, or other docs, chat ELI5 is **ignored**; generated docs remain technical and precise for agent consumption.
- **Implementation:** Chat ELI5 is a per-chat or per-session flag. When building the system prompt or instruction block for the Assistant, append an ELI5 instruction only for that session; do not pass it into interview document-generation prompts.

### 2.2 Application-level ELI5 (app-wide)

- **What:** A **separate** toggle at **application/settings level** labeled **Interaction Mode (Expert/ELI5)**. When ELI5 is active, **tooltips** and **interviewer responses** (in the Interview flow) are longer and simpler.
- **Default:** **ON** (ELI5). New users see simpler copy by default.
- **Scope:** Affects **tooltips** across the app (e.g. Config, Dashboard, Chat) and **interviewer Q&A responses** (the text the interview agent shows when asking questions or giving feedback). Does **not** change generated documentation (PRD, AGENTS.md, etc.).
- **Independent of chat ELI5:** A user can have app ELI5 on (simpler tooltips and interviewer text) and chat ELI5 off (technical Assistant answers in chat), or the reverse. The two toggles are stored and applied separately.
- **Dual-copy rule:** Every in-scope authored copy item in this plan (tooltips/help, interviewer Q&A copy, and chat style instruction copy) must define both **Expert** and **ELI5** variants. Track and audit against `Plans/FinalGUISpec.md` §7.4.0.

---

## 3. Permissions: YOLO vs Regular

- **YOLO mode:** Chat runs with maximum permissions; no permission prompts. Agent can execute, edit, and run tools without asking. User accepts full automation for that session.
- **Regular mode:** Agent asks for permission before executing or editing. User can:
  - **Approve once** (single action), or  
  - **Approve for entire chat session** (all subsequent actions in that session auto-approved).
- **Persistence:** Mode is a per-session or per-chat setting (configurable in chat UI or settings). Do not persist "approve for session" across app restarts; it applies only to the current session.

---

## 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop

- **Steer mode vs Queue mode:** The user can send messages in **Steer mode** or **Queue mode** (configurable in chat or settings), similar to [Codex's Steer feature](https://github.com/openai/codex/pull/10690):
  - **Steer mode (steer enabled):** **Enter** submits the message **immediately**, even when a task is running (the new message is sent right away and can steer or interrupt the flow). **Tab** (or a dedicated "Queue" action) **queues** the message when a task is running, so the user can build up a queue of follow-up messages.
  - **Queue mode (steer disabled):** **Enter** **queues** the message when a task is running (preserves "queue while a task is running" behavior). When no task is running, Enter submits as usual.
  So the user chooses whether Enter means "submit now" (Steer) or "queue when busy" (Queue). Tab (or equivalent) is used to queue when in Steer mode. **"Task is running"** means there is an active agent run in **this thread** (queue/steer behavior is per-thread).
- **Interrupt vs. Stop (distinct):**
  - **Interrupt** means sending a new message into the flow (steer): the new message is delivered to the agent and can change or redirect the current run. **Interrupt is not stop.**
  - **Stop** means cancelling the current agent run without sending any message. The run ends; queued messages remain. The user can then send a new message or process the queue. Implementation must not treat Stop as steer.
- **Chat footer layout (bottom of chat, top to bottom):** The bottom of the chat has a fixed order, similar to Cursor:
  1. **Pending queued messages** -- Just **above** the text entry (composer). Up to **two** messages (FIFO). Each queued message shows the text and three actions: **Edit** (change before send), **Send now (steer)** (send immediately), **Cancel** (remove from queue). When more than one message is queued, show an **ordered list** (first queued at top).
  2. **Text entry (composer)** -- The main input for typing and sending messages.
  3. **Active subagent count** -- Just **below** the text entry: show the **number of active subagents** in this thread (e.g. "2 active subagents" or "0 active subagents"). Keeps the user aware of how many agents are currently working in the thread.
  4. **Files touched + diff count** -- Just **below** the active subagent count: list **files that have been touched** in this thread, with a **diff count** per file (e.g. `src/main.rs` (+12 −3), `docs/readme.md` (+2 −0)). Gives a quick audit of what changed in the thread without opening the diff view.
- **Queued messages (max 2, FIFO):** When a message is **queued** (e.g. via Tab in Steer mode, or Enter in Queue mode while a task is running), it appears in the **pending queued messages** area above the composer. Each queued message has:
  - **Edit** -- the user can change the text before it is sent (e.g. icon or button).
  - **Send now (steer)** -- send that message immediately (steer). Once sent, it is no longer shown as queued.
  - **Cancel** -- remove that message from the queue (do not send).
  If the queue is full (2 messages), the UI must prevent adding another until one is sent or removed (or show a clear "queue full" state).
- **Keyboard shortcuts:** Chat actions (Send, New thread, Stop, focus composer, Clear queue, etc.) must be reachable via **keyboard shortcuts** and/or the **command palette**. See Plans/newfeatures.md §11.
- **Clear queue:** The user can **clear the entire queue** (e.g. "Clear queue" action when one or more messages are queued), removing all queued messages at once.
- **Stop the agent:** The user must be able to **stop** the agent at any time (e.g. a "Stop" button or shortcut). Stop **cancels** the current run and does **not** send any message. Stopping does not remove queued messages; the next queued message can be processed after stop, or the user can edit/remove queued messages or clear the queue.
- **Error and failure UX:** When the CLI fails, times out, or returns an error, the thread must show a **clear error state**: the error message (or a user-friendly summary) and, where applicable, **Resend** and **Cancel** (or Dismiss) actions. `Resend` replays the latest eligible user message using the canonical history-aware resend path; Cancel dismisses the error and leaves the queue unchanged. Failed runs do not consume a queued message unless the user explicitly resends; the queue remains so the user can edit, send now, or clear. If the failure was due to a platform or network issue, the UI can suggest switching platform or model (see §12 rate limit hit).

### 4.0A Composer Behavior

The composer follows one stable control model across idle, streaming, interrupted, and scrolled-away states.

Required rules:
- the primary composer action is **Send** while no assistant generation is active in the thread
- once the assistant is generating, the same primary action morphs in place from **Send** to **Stop** instead of introducing a second competing control elsewhere in the footer
- when generation completes, fails, or is cancelled, the primary action returns to **Send** for the next user turn
- the currently streaming assistant message also exposes a per-message **Stop** icon; selecting it halts generation for that specific in-flight message/run and preserves already-rendered partial output in history
- when the user is scrolled above the newest content, the thread shows a **Jump to bottom** control with an unseen-count badge; the badge increments as new messages/cards arrive below the viewport
- activating **Jump to bottom** scrolls to the latest visible boundary, clears the unseen-count badge for content now in view, and restores normal auto-follow behavior
- assistant messages expose an always-visible **Copy** icon in message chrome so copying the latest assistant output does not require hover discovery
- user messages are not deletable from thread history; the corrective path is limited to **Edit** plus submit/resend under the canonical history-aware replay rules

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 4.1 Chat footer, queue UI, and files touched -- implementation detail
**GUI updates**

- **Footer container:** Add a **chat footer** region at the bottom of the chat view that hosts, in order (top to bottom): (1) pending queued messages strip, (2) composer (text entry), (3) status line for active subagent count, (4) files-touched strip. The footer is **per thread** -- when the user switches threads, it shows that thread's queue, count, and files. Use existing widget patterns (e.g. selectable labels for file paths, styled buttons for Edit / Send now / Cancel) per `docs/gui-widget-catalog.md`; tag new reusable pieces with `// DRY:WIDGET:...`.
- **Queued messages strip:** When the queue is non-empty, render one row per queued message (max 2). Each row: **preview of message text** (truncate with tooltip or expand on click), plus three actions: **Edit** (opens inline edit or small modal), **Send now (steer)**, **Cancel** (remove from queue). Order: first queued at top. When queue is full, show a "Queue full (2 messages)" hint and disable or warn on further queue attempts. **Empty state:** when queue is empty, this strip can be hidden or show a minimal "No queued messages" so the composer is not pushed down unnecessarily.
- **Active subagent count line:** A single line below the composer, e.g. "0 active subagents" or "2 active subagents". Style as secondary/muted text; optional: make it a control that expands to list active personas (if we have that data) or links to the thread's run state. **Empty state:** "0 active subagents" when none.
- **Files touched strip:** A compact list of **file paths** with **diff counts** (additions, deletions). Example: `src/main.rs` (+12 −3) - `docs/readme.md` (+2 −0). Paths should be **selectable/copyable** (e.g. `selectable_label_mono`). **Click opens the file in the in-app IDE-style editor** (Plans/FileManager.md); when the entry has line/range info, the editor opens at that location. **Empty state:** "No files changed in this thread" or hide the strip when empty. If many files (e.g. >10), show a fixed number (e.g. 5) with "+ N more" and expand on click or hover.
- **Scrolling and layout:** Message area scrolls independently; footer stays fixed at bottom. Ensure keyboard focus (e.g. Tab order) goes: composer → queue actions → other footer controls, and that "focus composer" shortcut is available.

**Backend updates**

- **Thread state:** Each thread must expose (or the chat view must subscribe to):
  - **Queued messages:** Ordered list (max 2) of `{ id, text }`. Actions: add (when queueing), remove (Cancel or Send now), edit (update text), reorder not required (FIFO only).
  - **Active subagent count:** Integer -- number of subagents currently "active" for this thread. Define "active" as: subagent run started and not yet completed for this thread (e.g. has an in-flight tool call or turn). Backend or execution layer must emit this (e.g. from orchestrator/crew runtime or from normalized event stream).
  - **Files touched:** List of `{ path, additions, deletions }` (or `path` + `diff_summary`) for this thread. Source: accumulate from **edit/tool events** in the thread (e.g. `file_edit`, `write`, or platform tool results). Diff counts come from **git diff** (e.g. `git diff --numstat` for the path since thread start or since last commit) or from the **event stream** if the platform reports line-level changes. Prefer a single source of truth (e.g. "files changed in this thread" maintained by the run/thread state).
- **Events:** The unified event model (Plans/rewrite-tie-in-memo.md) must support (or be extended with):
  - **Queue events:** `queue_add`, `queue_remove`, `queue_edit`, `queue_clear`; and a way to read current queue per thread.
  - **Subagent lifecycle:** Events (or state) that indicate "subagent X started for thread T" and "subagent X finished for thread T" so the UI can compute active count and show persona/task in the thread (see §14.1).
  - **File change events:** Per-thread accumulation of file edits (path + optional add/delete counts) so the footer can show files touched without re-scanning the filesystem on every paint.
- **Persistence:** Queue state is per-thread and must be persisted (e.g. with thread list and messages) so after app restart the user sees the same queued messages if the run was not active. Active count and files touched are derived from run state; if the run is not persisted mid-flight, on restart show 0 active and last known files touched (or empty).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md

**Examples (unchanged)**

- Queued strip: first message "Add tests for login"; second "Then update the README." Buttons: [Edit] [Send now] [Cancel] for each.
- Active count: "2 active subagents".
- Files touched: `src/auth.rs` (+12 −3) - `src/lib.rs` (+2 −2) - `README.md` (+5 −0).

**Gaps and missing details**

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Definition of "active" subagent** | When does a subagent count as active? (e.g. from first tool call until turn end.) | **Resolved:** A subagent is **active** from the moment its Provider process is spawned until it emits a final result event (`run.completed`, `run.failed`, or `run.cancelled`) in the seglog. A spawned subagent that has not yet emitted a final result is active. The "what they're working on" label comes from the `task_label` field in the `run.started` seglog event. |
| **Source of "what they're working on"** | §14 says persona + task; task can come from "current step or first message." | Backend must expose a short **task label** per active subagent (e.g. from plan step title, or first user/tool message). If missing, show only persona name. |
| **Diff count source** | Git vs event stream vs both. | Prefer **event stream** for consistency (what the agent reported). Fallback: `git diff --numstat` for listed paths since thread start (or since last clean state). Define in backend so GUI only displays. |
| **Files touched scope** | "This thread" -- do we include only edits in this thread's run, or all edits in the project since thread start? | Scope to **edits made during this thread's runs** (agent-originated edits in this conversation). Exclude user edits outside chat. |
| **Queue Full Behavior (Resolved)** | What exactly happens when user tries to queue a third message? | When the queue is full (2 messages): (1) Show a **"Queue full"** label above the input area. (2) Offer two actions (in this order): **[Clear queue]** (removes all queued messages) and **[Send now — replace first]** (discards the oldest queued message, sends new message immediately). (3) Further typing in queue mode is **disabled** until queue space is available (either via Clear, Send now, or a queued message being consumed by the agent). |

**Potential issues**

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Many files touched** | Long list pushes footer or scrolls. | Display up to **5** files touched, then show '+ N more' as a clickable expander. Config: `ui.chat.files_touched_display_cap`, default `5`, stored in redb. |
| **Stale Diff Counts — Files Touched (Resolved)** | User or another process edits file after agent; diff no longer matches "agent's edit." | The chat footer shows "last known" file counts from the most recent agent turn. Counts are recomputed automatically when the user **switches to the thread** (focus event). No manual "Refresh" button — event-based counts (from seglog `file.edited` events) are preferred; focus-triggered recompute is the fallback for stale data. Diff source: `git diff --numstat` scoped to agent-originated edits in this thread's runs. |
| **Multiple threads with runs** | Active count is per-thread, but runs might be concurrent. | Backend must attribute each subagent run to a thread id; count only subagents for the **current** thread in the footer. |
| **Edit queued message (Resolved)** | Inline expand. | Clicking "Edit" on a queued message expands the row in-place into an editable text field pre-filled with the original message. Below the field: [Save] and [Cancel] buttons. No modal, no popover. While editing, the message remains in queue position. Saving replaces the queued message content; cancelling restores the original. |
| **Accessibility** | Footer has many interactive elements. | Ensure focus order, keyboard activation for Edit/Send now/Cancel, and screen-reader-friendly labels (e.g. "Edit queued message 1", "Send now (steer)", "Remove from queue"). |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

#### Message-level hover actions and resend contract

Message-level controls use a hover/focus row directly below the message body.

Rules:
- the row is hidden until hover or keyboard focus and does not create permanent always-visible chrome under every message
- the left cluster is icon-only message actions
- the right cluster is compact runtime summary plus the info icon
- `Copy` is available on every message
- assistant messages additionally pin a small always-visible `Copy` icon in message chrome; the hover/focus row remains canonical for all other message actions
- `Edit` and `Resend` are available only on the most recent user-sent message
- `Delete` is not available for user-authored thread history
- this subsection supersedes earlier message-level `Retry` wording in this document

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

`Resend` is a history-aware replay action, not transport retry.

Rules:
- `Resend` rewinds the thread to the selected latest user message, discards later generated assistant/subagent/runtime history after that point, and replays that user message
- `Resend` is distinct from provider retry, network retry, backoff, or error recovery terminology
- if the selected message is no longer the most recent user message, `Resend` is unavailable rather than silently retargeted
- `Edit` restores the selected latest user message into the composer for user modification before submission

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Compact runtime summary rules:
- compact display label is one of `Ask`, `Agent`, `Plan`, or `Deep Plan`
- compact row shows the resolved display label, model, and either assistant thinking time/duration or the user timestamp
- the info icon opens the message runtime popover

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md
## 5. Commands (slash commands and custom commands)

The reserved slash-command surface is canonical and non-overridable.

### 5.1 Reserved built-ins

#### `/mode debug`

`/mode debug` remains a reserved built-in routed through `cmd.chat.mode` with payload `{ mode: "debug" }`.

Required behavior:
- invoking `/mode debug` switches the thread into the Debug overlay and either resumes the active investigation or opens the canonical target-discovery flow
- `/mode debug` does not create a hidden secondary thread or hidden background mode state
- entering Debug from `Plan` or `Deep Plan` leaves planning and creates an execution-capable thread posture; existing plan artifacts remain visible as ordinary context, not as an active planning lock
- leaving Debug does not silently discard Investigation Context; completed or superseded investigations remain historically visible until explicitly closed or revoked

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/Run_Modes.md

Reserved built-ins for Assistant Chat are:
- `/new`
- `/model`
- `/effort`
- `/mode`
- `/export`
- `/compact`
- `/stop`
- `/resume`
- `/rewind`
- `/revert`
- `/share`
- `/settings`
- `/doctor`
- `/help`
- `/web`
- `/skill`

Rules:
- Reserved built-ins MUST be visible in the slash-command catalog and settings surfaces.
- Reserved built-ins MUST NOT be overridden by User Commands.
- `/cancel` is a deprecated alias of `/stop` and MUST NOT carry separate semantics.
- `/clear` is not part of the canonical reserved Assistant Chat set and MUST NOT remain a default built-in unless a later packet explicitly reintroduces it.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md

### 5.2 `/web` and `/skill`
`/web` is one canonical command family with these subcommands:
- `/web search <query>`
- `/web extract <url>`
- `/web research <task>`
- `/web crawl <url>`
- `/web map <url>`

Natural-language requests for searching, extracting, researching, crawling, or mapping the web MUST route through the same internal dispatcher as `/web`, not a parallel feature-local path.

`/skill` is a lightweight invocation helper for loading or invoking an installed skill. Skill management remains in `Agent Config > Skills` and MUST NOT move into a `/skills` management family.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md

### 5.3 Git & GitHub command boundary
Git and GitHub prefixes remain reserved and route into the canonical source-control and GitHub command surfaces rather than to user-defined command overrides.

Boundary rules:
- `/git ...` and natural-language requests for local repository work route to the Git/Source Control command family: status, diff, branch/worktree, commit, merge, revert, stash, and other local repository operations.
- `/github ...` and natural-language requests for PR, issue, Actions, workflow, review, comment, release, or hosted-repo administration route to the GitHub command family.
- The assistant MUST NOT silently reinterpret a Git request as a GitHub request, or vice versa, just because one path appears easier.
- When a user request spans both domains, the assistant must expose the boundary explicitly (for example: local compare first, then hosted PR creation) and preserve the handoff identity between the two stages.
- Requests that pivot into compare/review/open flows MUST preserve the canonical repo/worktree/compare identity fields rather than reconstructing targets from whatever branch happens to be active later.

GitHub-local detail ownership remains in `Plans/GitHub_Integration.md`; chat owns only the dispatch boundary, routing expectations, and inline disclosure that a request is crossing from local Git to hosted GitHub behavior.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md

### 5.4 Custom command boundary
User Commands may complement built-ins, but they do not replace or suppress the canonical Assistant Chat command set. PM-native Ask and Plan behavior remains authoritative even when an upstream reference product handles modes or permissions differently.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md, ContractName:Plans/OpenCode_Deep_Extraction.md

## 6. Teach

Teach defines how users deliberately teach Puppet Master durable codebase knowledge, preferences, and workflow constraints from within chat.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Teach trigger rules:
- Teach may be invoked explicitly via `/teach` or equivalent natural-language intent such as "remember that...", "for this repo always...", or "please prefer..."
- the assistant may recommend Teach when it detects reusable guidance, but persistence requires an explicit user-confirming action before the knowledge is stored
- Teach is a capture workflow, not a separate closed `mode_overlay`; execution posture remains controlled by the thread's current runtime/mode selection unless the user also changes modes

What Teach stores:
- project conventions such as naming, testing, logging, formatting, architecture boundaries, and generated-file rules
- user preferences that materially affect future responses or edits
- recurring environment facts such as canonical commands, repository structure, or approval expectations
- negative constraints such as "never edit derived files" or "always plan before execution for risky tasks"

Persistence scope:
- each taught item MUST declare a scope before commit: `thread`, `project`, or `user`
- `thread` scope persists only with the current thread and its descendants where lineage explicitly carries that memory
- `project` scope persists across future threads in the same project/workspace
- `user` scope persists as a user-level preference only when the content is not project-confidential
- persisted Teach records store at minimum `memory_id`, `scope`, `source_thread_id`, `author_message_id`, `captured_at`, and `normalized_fact`, plus optional `supersedes_memory_id` / `revoked_at`

Effect on future responses:
- taught knowledge is retrieved into future prompt assembly as explicit memory/context rather than as undocumented hidden prompt mutation
- when a taught fact materially changes an answer, plan, or execution choice, the assistant should be able to disclose that the response was influenced by taught memory
- conflicting teachings do not silently overwrite prior knowledge; PM records supersession or revocation so the user can audit why a newer fact won
- taught knowledge may influence future responses, planning posture, tool-selection defaults, and code-generation choices only within its approved persistence scope

Safety and audit rules:
- users can inspect, narrow, supersede, or revoke taught knowledge later
- Teach MUST NOT persist secrets, tokens, passwords, or other credentials
- ordinary one-off chat instructions do not become taught knowledge unless the user explicitly confirms persistence

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md

## 7. Attachments, Web Search, and Extensibility

Assistant chat accepts structured inputs beyond plain text and exposes external capability integrations without hiding provenance.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 7.1 Attachment model

Supported attachment families are:
- files
- images
- URLs
- inline code snippets

Attachment rules:
- files may include project files, logs, documents, archives, and generated artifacts addressable through the file-manager/editor contracts
- images render with preview, filename or source label, and size metadata when known
- URLs render as normalized link chips/cards and may later resolve into fetched/extracted web-activity cards
- code snippets pasted into the composer preserve formatting and language hinting when detection is possible
- attachments persist as structured message payloads rather than being flattened into plain text only

Minimum attachment fields:
- `attachment_id`
- `attachment_type`
- `display_name`
- `source_ref`
- `mime_type?`
- `size_bytes?`
- `preview_state`

### 7.2 Web search integration

Web search is a first-class chat capability, not a hidden side channel.

Required rules:
- when the assistant uses web search, the thread shows explicit web activity cards and later source/citation disclosure in the related assistant turn
- web-derived results appear inline in chat as operation cards, source blocks, or citations tied to the turn that used them
- fetched/extracted content preserves provenance so users can distinguish search snippets, extracted page text, and synthesized conclusions
- if the active provider or policy cannot use web search, the assistant discloses that limitation rather than implying that the web was consulted
- user-supplied URLs and assistant-triggered web results share the same attachment/provenance system while preserving distinct origin labels

### 7.3 Extensibility surface

Assistant chat can surface extensibility points that are callable or inspectable from the thread when policy allows.

Supported extensibility families:
- skills
- plugins
- MCP tools / servers

Required rules:
- skills, plugins, and MCP-backed tools surface through canonical tool-call, tool-result, and operation-card patterns rather than bespoke invisible integrations
- when an extensibility point is invoked, chat shows the capability identity, status, and resulting output or failure
- capability discovery may depend on installation/provider state, but unavailable integrations must not be presented as callable
- extensibility integrations follow the same permissions, provenance, and audit-trail rules as built-in tools
- chat should disclose whether an action came from a built-in tool, a skill, a plugin, or an MCP server-backed tool

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

## 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)

### 8.1 Canonical planning model

- **Plan** and **Deep Plan** are Assistant Chat workflow overlays.
- While planning is in progress, both overlays normalize to canonical runtime mode **`plan`**.
- Planning-time behavior is read-only with the `read_only + plan_output_scaffold_v1` overlay semantics from `Plans/Run_Modes.md`.
- Planning runs may research the repo, ask clarifying questions, inspect documents, and perform cited web research when allowed, but they MUST NOT mutate project files or execute side-effecting implementation actions.
- Planning artifacts are Puppet Master-owned drafts by default; they are not normal repo files unless the user explicitly saves them into the workspace.
- Approving execution exits the planning overlay and starts a new execution run using canonical runtime `regular` or `yolo` depending on the chosen execution posture.
- The approved planning artifact and TODO list remain the source of truth for the follow-on execution run.

### 8.2 Plan Thoroughness (PT)

**Plan Thoroughness (PT)** replaces the old planning-depth control.

PT is visible in the Assistant Chat GUI whenever **Plan** or **Deep Plan** is active.

Canonical PT enum:
- `Light`
- `Balanced`
- `Comprehensive`

Defaults:
- Plan default PT: `Balanced`
- Deep Plan default PT: `Balanced`

PT controls:
- clarifying-question budget
- repo-research breadth
- whether cited web research is used by default vs only when clearly needed
- how explicitly the plan captures risks, alternatives, dependencies, and validation steps
- how detailed the normalized TODO list and execution ordering become

**Interpretation rule:** PT is relative to the active planning mode. Deep Plan at a given PT is always more intensive than Plan at the same PT.

### 8.3 PT budget matrix (deterministic baseline)

These are deterministic first-implementation budgets. They are ceilings/defaults, not promises that every planning run must use the full budget.

| Mode | PT | Clarifying-turn budget | Repo/codebase research | Web research default | Expected output detail |
|---|---|---:|---|---|---|
| Plan | Light | 2 | focused, nearby files only | off by default; only if user explicitly asks or current/external facts are required | concise plan + TODO list |
| Plan | Balanced | 4 | moderate, cross-file where needed | targeted cited web research when materially helpful | detailed plan + TODO list + affected areas |
| Plan | Comprehensive | 6 | broad local research over affected subsystems | limited cited web research across key external dependencies/capabilities | detailed plan + TODO list + risks + alternatives |
| Deep Plan | Light | 4 | broad local research with architectural context | targeted cited web research allowed by default | full markdown plan doc + TODO list |
| Deep Plan | Balanced | 6 | deep local research across relevant subsystems, constraints, and prior docs | multi-source cited web research when helpful | full markdown plan doc + TODO list + risks + alternatives + validation notes |
| Deep Plan | Comprehensive | 8 | deepest local research, including architecture seams and likely downstream impacts | strongest cited web research posture of any planning path | full markdown plan doc + TODO list + alternatives + rollout/validation + wizard-escalation check |

Web-research rules:
- When web research is used, it must follow the cited web-search contract.
- Plan uses shorter web research than Deep Plan.
- Deep Plan should favor primary/official sources when researching platform capabilities, provider behavior, or current best practices.

### 8.4 Standard Plan Mode

**Intended use:** medium-complexity work that benefits from explicit planning but does not obviously require a spec-style document or assistant-to-wizard escalation.

Required behavior:
- Clarifying questions are allowed and expected; they are not optional.
- The planning artifact is lightweight and execution-oriented.
- The plan panel remains visible in chat and shows the written plan plus the normalized TODO list.
- The user may open the plan artifact in the editor on demand, but automatic editor opening is not required for standard Plan.
- Plan may use parallel safe research/subagent work where allowed, but it remains a read-only planning run.
- Plan should prefer repo/codebase research first and use shorter web research than Deep Plan.

Standard Plan artifact minimums:
- concise problem statement
- current-state summary when relevant
- proposed approach summary
- normalized TODO list for execution
- verification / validation notes
- unresolved questions when they remain

### 8.5 Deep Plan Mode

**Intended use:** larger features, substantial enhancements, major refactors, complex changes spanning several domains, or asks with high uncertainty.

Required behavior:
- Deep Plan asks more questions than standard Plan at the same PT.
- Deep Plan performs materially broader repo research and web research than standard Plan at the same PT.
- Deep Plan produces a richer markdown planning document and automatically opens it in a preview-capable editing surface.
- The default Deep Plan artifact class is `planning_draft` unless the user explicitly saves it to a workspace path.
- `open_source` for a non-persisted Deep Plan document opens a transient `generated://<artifact_id>` buffer.
- Deep Plan documents may include headings, tables, checklists, file paths, fenced code blocks, Mermaid diagrams, and explicit tradeoff sections.
- The planning document remains canonical as source markdown / Mermaid text even when richly rendered.

Deep Plan document minimum sections:
- `Objective`
- `Scope`
- `Current State / Relevant Context`
- `Proposed Approach`
- `Open Questions / Assumptions`
- `Execution Plan / TODOs`
- `Validation / Acceptance`

Optional but allowed sections:
- `Risks`
- `Alternatives Considered`
- `Mermaid Diagrams`
- `Code Snippets`
- `Affected Files / Areas`
- `Rollout / Migration Notes`

### 8.6 Normalized TODO contract for planning outputs

Both Plan and Deep Plan MUST emit a normalized TODO list even when the visible artifact is markdown-first.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

Required TODO fields per item:
- `todo_id`
- `title`
- `summary`
- `dependencies[]`
- `owner_hint` (`main_agent`, `subagent`, `crew`, or `unspecified`)
- `verification_hint`
- `status`

Optional but recommended execution-tracking fields carried by the same canonical TODO identity:
- `notes?`
- `order_index?`
- `blocked_reason_code?`
- `superseded_by_todo_id?`

**Closed TODO lifecycle:**
- `draft` — proposed during planning; not yet approved for execution.
- `approved` — user accepted the item as part of the execution handoff.
- `queued` — approved but waiting for execution to begin.
- `ready` — execution has begun and the item has no unmet dependency.
- `in_progress` — actively being executed.
- `blocked` — paused behind a real dependency, approval, or prerequisite issue.
- `completed` — finished with the required verification.
- `dropped` — intentionally removed from the plan without replacement.
- `superseded` — replaced by a newer TODO item or plan revision.

Rules:
- TODO order is the default execution order unless dependencies require otherwise.
- Dependencies may further constrain order.
- TODO items keep the same `todo_id` across approval, queueing, execution, and completion unless a deliberate supersession occurs.
- Replans create a new plan revision, but surviving TODOs keep identity where the work item is materially the same.
- This TODO lifecycle is a planning/chat contract. It MUST NOT be treated as a synonym for orchestrator node lifecycle or run-graph state.
- `todowrite` and `todoread` MUST use this same normalized schema instead of a separate checklist-only shape.

**Plan-level status** remains distinct from per-item status and is closed to `draft`, `approved`, `executing`, `completed`, `blocked`, and `superseded`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md

### 8.7 Review loop for planning artifacts

Standard Plan review:
- user may continue the chat, request revisions, or open the plan in the editor
- follow-up chat responses may revise the planning artifact

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

Deep Plan review:
- the plan document opens automatically in the editor / preview-capable planning surface
- users may edit the markdown directly
- on source-backed or deterministically mapped selections, the review palette offers `Comment / Ask`, `Replace with...`, `Insert after...`, `Remove / Strike this`, and `Send selection to chat`
- durable actions create annotations on the existing `note_record.v1` lineage; `Send selection to chat` creates a visible pending `document_selection_context` chip on the owning thread

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Deep Plan targeted revision rules:
- `Resubmit with Annotations` launches a targeted revision pass over docs with open durable annotations, or a user-selected subset
- targeted revision may update the plan document and/or answer question/comment annotations
- targeted revision MUST NOT auto-run Multi-Pass Review
- conflicting or stale mutating annotations are excluded from automatic revision until the user resolves them

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Deep Plan annotation-handling rules:
- preserve the annotation lifecycle `open -> addressed -> resolved`
- preserve deterministic position + quote selector re-anchoring
- if an anchor cannot be reattached, keep the annotation open and show an explicit warning rather than silently dropping it
- comment annotations may coexist with other annotations on the same span; overlapping mutating annotations conflict by default
- final review gates use `no open annotations`, not `no open notes`
- read-only / no-source-map renders such as plan-graph-like surfaces are `Send selection to chat` only in v1 unless a stable semantic-anchor contract is added later

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### 8.8 Approval, queue, and execution handoff

Approval rules:
- Planning output never auto-executes.
- The assistant must wait for explicit approval to execute.
- Approval to execute means the planning artifact/TODO state is frozen as the execution starting point.
- The user may still continue planning instead of executing.

Required post-plan actions when applicable:
- `Execute`
- `Execute with Crew`
- `Continue Planning`
- `Open in Editor`
- `Save As`
- `Queue Execution` (only when another run is active in the same thread)

Execution rules:
- If the thread is idle, `Execute` starts immediately.
- If another run is active in the same thread, `Queue Execution` places the approved plan behind the current run.
- The follow-on execution run uses canonical runtime `regular` by default, or `yolo` only when the user explicitly selects YOLO posture.
- Execution may be performed by a single agent, a crew, or an agent with subagents using the same approved plan/TODO state.

### 8.9 Wizard-escalation check

Both planning overlays may recommend the Chain Wizard when the work is better treated as feature/enhancement specification plus adaptive interview/orchestrator flow.

Recommendation behavior:
- Standard Plan may recommend the Chain Wizard when signals are strong.
- Deep Plan MUST perform a wizard-escalation check before presenting final execute-first recommendations.
- Recommendation is a user-facing suggestion/CTA, not an automatic forced redirect.

Escalation signals include:
- new feature or substantial enhancement language
- major refactor / broad architectural change language
- likely impact across UI + data + security + deployment or several of those domains
- many unresolved questions remaining after planning
- the plan reads more like a feature spec / project delta than a straightforward implementation checklist

### 8.10 Acceptance criteria

- Plan and Deep Plan both remain read-only with respect to project files while planning.
- PT appears in the Assistant Chat GUI for both planning overlays and uses the canonical enum `Light | Balanced | Comprehensive`.
- Deep Plan at a given PT performs more research and produces a richer artifact than Plan at the same PT.
- Both planning overlays emit a normalized TODO list suitable for later execution.
- Deep Plan documents open in an editor/preview-capable surface and support durable annotations plus targeted revision.
- Planning artifacts are not written into the project repo by default.
- Execution starts only after explicit approval and uses `regular` or `yolo`, never `plan`.
- Approved plans can execute immediately when idle or queue behind another active run in the same thread.

## 9. File Manager, IDE-style editor, and @ Mention

Chat consumes file context through explicit file-reference handoff and canonical editor/file-open contracts.

Rules:
- `@` mention and picker flows may discover files and symbols, but actual file insertion into the composer is represented as visible chips
- `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }` is the canonical file-reference insertion command
- file references are file-only in MVP; folder insertion is out of scope
- clicking a file chip or file citation opens through the shared open-file contract rather than through chat-local navigation rules

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Restore and review boundaries:
- `cmd.chat.revert` is the canonical entrypoint for `Revert last agent edit`
- omitted `target_message_id` resolves to the latest assistant turn in the current thread with persisted file mutations
- if that assistant turn touched multiple files, the revert applies to the whole turn across all affected files
- `cmd.chat.rewind` remains conversation-history rewind only
- Chat may preview or summarize diff/review context, but Source Control owns hunk actions, compare targets, and conflict resolution

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

Search boundary:
- chat search/history retrieval is chat-domain retrieval only
- project-wide find-in-files and replace-in-files remain Search side-panel owned
- semantic symbol/reference lookup remains editor/LSP owned even when chat launches it

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

## 10. Chat History Search

- **Human search:** Chat must support **search across chats / history** so **users** can find prior conversations and reuse context (e.g. search within current chat and, if applicable, across past chats or sessions). This is a first-class UI feature (search box, filters, results list). Implementation: Tantivy chat index fed by seglog projector (Plans/storage-plan.md).
- **Agent search:** **Agents** must also be able to **search through chat history** when answering or planning. Provide a way for the running agent (Assistant, Interview, or subagent) to query past messages or sessions -- e.g. via a tool/MCP, or by including a searchable index of chat history in the context pipeline -- so the agent can retrieve relevant prior decisions, explanations, or outcomes. Enables continuity (e.g. "last time we decided X") and avoids asking the user to re-paste old context. Implementation can share the same storage/index as human search (Tantivy) but must expose an agent-callable interface (tool, API, or injected context).

### 10.1 Smart auto-retrieval (RAG) across project sources (NOT “always search everything”)

In addition to explicit human/agent search, the Assistant Chat context pipeline supports **smart auto-retrieval** that can pull **relevant slices** from **project chat history**, **project workspace code**, and **project logs** to keep long threads usable without overloading the context window.

**Hard rules:**
- **Project-only by default:** Auto-retrieval searches **only within the current project** (project-scoped indices; see §10.3). It MUST NOT search other projects or external sources unless the user explicitly requests external navigation/import (§7.4).
- **Not always-on for everything:** Auto-retrieval MUST be **triggered and budgeted**, not “search everything every turn.”
- **Deterministic budget caps:** Auto-retrieval has strict per-source limits (queries/hits/bytes) so it cannot crowd out user/assistant messages.

**Retrieval sources (project-only):**
- **Chat history retrieval:** Tantivy chat index; enables “what did we decide earlier / in another thread.”
- **Code retrieval:** Tantivy code index (MVP) + LSP symbol search + ripgrep fallback (Plans/Tools.md + Plans/storage-plan.md).
- **Logs retrieval:** Tantivy logs index (MVP) over log summaries + pointers to full payload (Plans/storage-plan.md).

**Trigger heuristics (examples; implementation may add more, but must remain deterministic):**
- **Chat-history triggers:** user references earlier decisions (“last time”, “earlier thread”, “we decided”), asks to continue previous work, or asks “why did we do X.”
- **Code triggers:** user mentions file paths/symbol names, asks “where is X implemented,” references diagnostics (file:line), or requests edits that require locating code.
- **Logs triggers:** user references failures (“it crashed,” “why did this fail”), mentions run IDs/tool errors, or asks for the last output.

**Modes and defaults (Settings-controlled; see FinalGUISpec.md):**
- For each retrieval source (chat/code/logs): `off` | `auto` | `always`.
- Default: **`auto`** for chat/code/logs.
- A thread-local override exists (Auto Retrieval chip; §12 addendum): **On/Off** for the current thread (does not change project defaults).

**Context injection behavior:**
- Retrieval results are injected into the **Work bundle** as a dedicated **“Retrieved Context”** block with:
  - source type (chat/code/logs),
  - provenance (thread_id/message_id or path/line or run_id/event_id),
  - byte/token sizes per snippet,
  - truncation notes if caps were hit.
- Retrieved Context is **not** “memory” and must not be written into the Assistant memory store unless separately captured as a verified gist (Plans/assistant-memory-subsystem.md).
- Auto-retrieval MUST respect **Context Lens** overlays (§17): muted messages are excluded; focused messages are prioritized; subcompacted messages use the subcompact summary instead of raw messages.

### 10.2 Agent-callable search tools (project-only)

To support both explicit agent reasoning and smart retrieval, provide project-scoped agent-callable tools (or MCP equivalents) that query the project indices:

- `chatsearch(query, filters={thread_id?, time_range?}, k)` -> hits with `thread_id`, `message_id`, `ts`, snippet, score.
- `codesearch(query, path?, mode={text|symbol}, k)` -> hits with `path`, line/range, snippet (symbol-aware when LSP is available).
- `logsearch(query, filters={time_range?, run_id?, thread_id?, tool_name?, level?}, k)` -> hits with `event_id` / `blob_ref`, `ts`, short summary or snippet.
- `logread(ref)` -> full payload (bounded by size caps; subject to stricter permission defaults).
- `grep(pattern, path?, glob?)` -> transparent regex search over project files. When the per-project sparse n-gram index can narrow the query, grep uses it without changing the interface, limit, timeout, or permission model. When the index is missing, disabled, corrupted, building without a valid snapshot, or skipped for query-specific reasons, grep falls back to raw ripgrep. Stale-but-valid snapshots remain usable, and dirty-layer freshness guarantees still apply.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### 10.3 Scoping and performance: per-project indices (required)

To guarantee **project-only search** and keep performance stable as threads grow:

- Tantivy indices for chat/code/logs MUST be stored **per project**:
  - `storage/tantivy/projects/{project_id}/chat`
  - `storage/tantivy/projects/{project_id}/code`
  - `storage/tantivy/projects/{project_id}/logs`
- This enables fast queries in long-lived projects, supports clean retention/cleanup per project, and does not block future cross-project search (future enhancement: query multiple project indices and merge top-K).

ContractRef: ContractName:Plans/storage-plan.md

---
## 11. Threads and chat management

### Message Taxonomy

Canonical chat records use the following message taxonomy.

| message_type | sender | properties | rendering |
|---|---|---|---|
| `user` | human | `text`, `attachments[]`, `edit_history[]` | left-aligned bubble |
| `assistant` | model | `text`, `tool_calls[]`, `citations[]` | right-aligned bubble |
| `system` | runtime | `text`, `severity` | centered notice |
| `tool_result` | tool | `tool_id`, `output`, `exit_code` | collapsible card |
| `operation_card` | runtime | `operation_type`, `status`, `progress` | inline card |
| `blocked_notice` | runtime | `blocked_family`, `allowed_action_ids[]` | warning card |
| `error` | runtime | `error_code`, `message` | error banner |

Rules:
- the visible rendering vocabulary is closed to the taxonomy above unless a later SSOT contract extends it
- message taxonomy is independent of thread lifecycle state and runtime posture
- persisted transcript records MUST retain their canonical `message_type` so restore, export, and search do not infer type from presentation alone

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

### Thread Lifecycle State Machine

Thread lifecycle state is separate from operational status markers such as `attention_required`, `blocked`, `completed`, or `failed`.

Canonical lifecycle path:
`creating -> active -> suspended -> archived -> deleted`

Transitions:
- `creating -> active`: first message sent
- `active -> suspended`: user closes thread / session ends
- `suspended -> active`: user reopens thread
- `active -> archived`: user archives or retention policy triggers
- `archived -> active`: user unarchives
- `active -> deleted`: user deletes
- `archived -> deleted`: retention policy or user deletes

Persistence behavior by state:
- `creating`: keep only lightweight draft shell metadata; no durable transcript is required until the first user message commits
- `active`: keep the full transcript, queue state, thread metadata, runtime references, and restorable UI state
- `suspended`: keep the durable transcript and metadata, but drop ephemeral auto-follow, focus, and non-restorable streaming affordances
- `archived`: keep transcript, lineage, citations, attachments, and audit metadata while pruning transient composer state, active queue state, and nonessential caches according to retention policy
- `deleted`: remove the thread from normal user-visible chat surfaces; only minimal tombstone or ledger records required for integrity, sync, or retention compliance may remain

Rules:
- lifecycle transitions MUST be explicit and auditable
- archiving does not rewrite message ids, thread lineage, or worktree lineage
- deletion is terminal for ordinary user navigation even if compliance metadata is retained elsewhere

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

### Thread Identity Model

Thread identity is canonical and stable across reopen, restore, archive, and branch-aware history views.

Required fields and relationships:
- `thread_id`: format `thr_{ulid}`; minted on the first user message; globally unique within the PM instance
- `dev_session_id`: optional reference to the originating development/runtime session; one dev session may span multiple threads
- `terminal_session_id`: optional lineage field when the thread was spawned from a terminal context
- thread metadata includes `created_at`, `updated_at`, `title`, `mode_overlay`, and `persona_id`

Generation and lineage rules:
- the system MUST NOT mint a durable `thread_id` for an unsent empty draft
- `title` is auto-generated from the first user message and remains user-editable without changing identity
- `mode_overlay` stores the effective workflow overlay for the thread using the canonical closed overlay enum
- thread records reference their originating `dev_session_id` when present, but a single `dev_session_id` may relate to multiple branched or restored threads
- when terminal lineage exists, `terminal_session_id` remains attached for audit even if the terminal later exits

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

### 11.0A Debug investigation lifecycle and reopen semantics

Threads may contain ordinary turns, historical investigations, and at most one active investigation at a time.

**Closed investigation lifecycle:**
- `active` — the current mutation-capable or evidence-gathering investigation for the thread.
- `blocked` — waiting on a prerequisite such as approval, target availability, or revalidation.
- `attention_required` — user input or human review is needed before the investigation may continue.
- `verifying` — the investigation is in its verification stage and has not yet reached a terminal conclusion.
- `failed_cleanup` — the investigation found or fixed something, but cleanup could not be completed.
- `resolved` — verification passed and required cleanup completed (or was explicitly preserved under a documented hold).
- `cancelled` — the user or runtime stopped the investigation without resolving it.
- `superseded` — replaced by a newer investigation targeting a different subject or a newer branch of the same problem.

Required lifecycle rules:
- A thread may hold multiple historical investigations, but only one investigation may be non-terminal (`active`, `blocked`, `attention_required`, `verifying`, or `failed_cleanup`) for prompt injection and mutation-capable automation at a time.
- Choosing a new debug target in a thread with a non-terminal investigation must default to continuing the current investigation. Switching to a materially different target requires an explicit supersede action that marks the older investigation `superseded`.
- `resolved`, `cancelled`, and `superseded` investigations reopen as historical views by default; they do not silently restart automation, instrumentation, or browser/dev sessions.
- Reopening a terminal investigation for new live work creates a new investigation lineage entry linked by `supersedes_investigation_id` unless the prior investigation is still in a resumable non-terminal state.
- `blocked`, `attention_required`, `verifying`, and `failed_cleanup` investigations reopen against the same `investigation_id` when the bound target, runtime identity, and worktree identity are still valid.
- Thread restore must rehydrate the visible Investigation Context header, linked artifacts, requested/effective debug posture, revalidation reason (if any), and frozen target bindings without silently rebinding to a different target.

**Revalidation reasons** that prevent silent resume include at minimum target replacement, auth/account switch, worktree or branch drift, HEAD drift for bound file/worktree targets, expired instrumentation, and stale safe-point or remediation lineage.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md

### Canonical navigation model

Assistant Chat consumes the shared navigation and runtime identity contracts rather than defining chat-local replacements.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile`
- thread usage, artifact usage, ledger pivots, wizard resume, and object-focused opens use the same internal route model
- `resume_url` is serialized transport only and must not outgrow the canonical route contract

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

Runtime identity display rules:
- chat may display requested/effective runtime identity and projection state
- chat must not define assistant-local replacements for the owner-doc field set
- historical thread/activity views use frozen requested/effective runtime snapshots captured for the execution

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md
### Branching conversations
- restore-and-branch creates a new `thread_id` and `branch_id` linked to the source restore point and source thread
- branch labels are visible in history and thread navigation
- branching from a running or dirty thread requires confirmation that names the preserved source state and the new branch target
- branch lineage remains queryable for restore/history and usage attribution

### Session browser interaction
- project/session browsing may open or focus a thread, but active-thread navigation remains local to the chat shell
- blocked, queued, and background states must remain visible through badges and attention surfaces even when the thread is not active
## 12. Context usage display

### 12.0 Normal thread context usage

Every Assistant or Interview thread exposes a visible context-usage summary and a drill-down Context Detail Pane for the context actually consumed by that thread.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

**Required visible thread-level signals:**
- current context usage against the effective model window
- the last compaction / truncation reason when compaction changed what remained in prompt
- whether displayed cost/token figures are provider-authoritative or estimated
- whether additional hidden/background usage contributed to the thread total

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

**Required Context Detail Pane breakdown:**
- system and instruction blocks
- user and assistant messages
- compiled context attachments and forwarded document selections
- tool-derived or activity-derived context when the thread uses it
- run-level or message-level usage snapshots derived from canonical `usage.event` and `run.completed.usage`
- debug-only Investigation Context items when the thread is an active debug thread

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Rules:
- the thread surface MUST derive usage from canonical runtime records; it MUST NOT invent a second chat-local cost model
- hidden/background helper calls MAY roll into thread totals, but their source class MUST remain inspectable in raw/detail views
- truncation, redaction, and context-serialization state remain visible per item; the UI MUST NOT silently present omitted context as if it were still serialized

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md


### 12.0A Investigation Context for Debug threads

Debug threads expose a visible **Investigation Context** alongside the normal context-usage affordances.

Investigation Context is the live, user-visible bundle of bounded evidence, target metadata, temporary instrumentation state, verification outcomes, and revalidation state that the assistant may use while an investigation is active.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Canonical header fields imported into chat:**
- `investigation_id`
- `primary_target_summary`
- `debug_target_kind`
- `investigation_phase`
- `state`
- `verification_state?`
- `attention_reason_code?`
- `blocked_reason_code?`
- `revalidation_reason_code?`
- `active_instrumentation_count`
- `last_updated_at_utc`

Chat-local aliases such as `primary_target` and `final_or_intermediate_state` are retired. Assistant Chat consumes the canonical field names above and may layer presentation labels on top, but it must not rename the durable data contract.

**Required per-item states:**
- `active`
- `redacted`
- `revoked`
- `blocked`
- `expired`
- `omitted`

Only `active` and `redacted` items may be serialized into prompt context. `revoked`, `blocked`, `expired`, and `omitted` items remain visible for audit but must not be serialized as successful context.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

**Visibility rules:**
- Investigation Context is separate from ordinary browser/document composer chips.
- ordinary browser capture remains explicit and user-triggered.
- Debug auto-ingestion is allowed only inside an active investigation and must create visible Investigation Context items rather than hidden messages.
- every Investigation Context item must expose provenance, timestamp, redaction/truncation state, and a revoke action.
- raw logs, traces, screenshots, recordings, and full transcript payloads remain owned by Runtime Artifacts; Investigation Context carries bounded summaries and stable refs rather than raw unbounded payloads.

**Required actions from the Investigation Context surface:**
- `Open target`
- `Open artifacts`
- `Export bundle`
- `Revalidate target`
- `Revoke item`
- `Show raw in Context Detail Pane`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md
## 13. Activity transparency: search, bash, and file activity

Activity transparency uses a shared inline operation-card family rather than isolated one-off widgets.

### 13.1 Operation-card family
Activity transparency uses a shared inline operation-card family rather than isolated one-off widgets.

**Closed card taxonomy:**
- `command_activity`
- `web_activity`
- `files_explored`
- `files_changed`
- `code_diff`
- `subagent_activity`
- `blocked_notice`
- `approval_request`
- `clarification_request`
- `investigation_context`

**Shared card rules:**
- Every card has a stable `card_id`, card type, status badge, created/updated timestamps, and a primary focus/open action appropriate to the card type.
- Cards are inline with the assistant narrative, not a parallel navigation system.
- Compact summaries may be terse, but every card expands into structured details instead of free-form prose only.
- Cards link to owner surfaces through canonical route/open contracts rather than feature-local payloads.

**Family-specific rules:**
- `blocked_notice` surfaces blocked-family identity, `blocked_reason_code`, and canonical `allowed_action_ids[]`; it does not invent chat-local recovery enums.
- `approval_request` renders a pending permission decision with direct actions that map to the canonical approval semantics (for example `Allow Once`, allowed scope/session reuse when policy permits, and `Deny`). Permission resolution logic stays owned by `Plans/Permissions_System.md`.
- `clarification_request` is the structured card form of a question or missing-input requirement; it must not be hidden as ordinary assistant narration.
- `investigation_context` cards summarize investigation phase, target, verification/revalidation state, and primary pivots into the full Investigation Context and Runtime Artifacts surfaces; they are summaries, not raw artifact dumps.
- Existing command/web/file/subagent cards continue to use the same skeleton and must not fork the family contract.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileManager.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Tools.md

### 13.2 Web activity and provenance
Assistant Chat uses distinct web activity labels:
- `Searching Web`
- `Extracting Site`
- `Researching Web`
- `Crawling Site`
- `Mapping Site`
- `Reading Site`

Rules:
- `Reading Site` is reserved for PM-native Site Reader work.
- Search/result provenance MUST distinguish search snippets, extracts, site-reader output, research synthesis, crawl results, and map results.
- The final Sources block MUST deduplicate repeated URLs while preserving the strongest provenance badge per source.
- Provider fallback or support-tier changes MUST be visible in the related activity card.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 13.3 Bash and terminal ownership
Assistant Chat may preview shell-backed work inline, but the canonical interactive runtime remains the terminal workspace.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Rules:
- one inline command card still corresponds to one observed command invocation or session reference.
- `Open in Terminal` and `Show Terminal` resolve to the exact referenced terminal session, workgroup, and leaf pane when that linkage exists.
- chat owns compact audit and preview receipts; the bottom runtime terminal workspace owns the canonical PTY layout and interaction state.
- the bottom runtime workspace uses workgroups and subtabs rather than one flat strip of unrelated tabs.
- editor-embedded terminal panels are secondary presentations of existing terminal leaf panes and do not become independent chat-owned runtimes.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md
### Command-card model
Command cards are transcript-adjacent summaries rather than a second shell implementation.

Rules:
- cards surface summary, status, and a primary reveal action without pretending to own the full shell lifecycle
- when shell integration is `rich` or `basic`, command cards may expose cwd, duration, exit code, and command labels according to confidence tier
- when shell integration is `opaque`, the card MUST degrade to lower-confidence activity disclosure and MUST NOT fabricate exact command text or exact command boundaries
- transcript continuity remains canonical even when command-card metadata is degraded

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

### Reveal and focus behavior
- if the referenced terminal session is already visible, `Open in Terminal` and `Show Terminal` simply focus it
- if the session is hidden inside another pane, tab, or section, the shell reveals the existing pane or tab before creating anything new
- if only historical state remains, the card opens that historical shell receipt and presents explicit recovery actions instead of silently creating a replacement session
- explicit `New Terminal` and explicit restart remain separate user-visible actions

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Status, degradation, and linked-surface behavior
Command-card status badges may reflect `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, and `attention_required`.

Rules:
- chat preview stays compact even when the terminal transcript is large
- Output, Problems, Debug Console, and Ports continue to route through the owning terminal or dev-session identity rather than through chat-local state
- command cards may link to Output, Problems, or Ports when the command or dev session produced those linked surfaces

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md
### 13.4 Shared runtime identity display
Assistant Chat may display requested/effective runtime identity, but it must consume the owner-doc shared runtime model rather than invent assistant-local fields.

Rules:
- compact chat surfaces may show only the material display summary needed for that moment
- the message-under-row summary uses the resolved user-facing mode label, model, and time or duration
- the mode display label is derived from canonical shared fields rather than from assistant-local string assembly
- compact chat surfaces do not show version and do not show `current` or `frozen` wording
- historical thread/activity views show frozen requested/effective runtime state captured for that execution
- assistant/chat MUST NOT introduce local replacement fields such as `active_model`, `actual_model`, or `assistant_runtime_state`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Message runtime popover fields are closed to:
- `Mode`
- `Provider`
- `Model`
- `Effort`
- `Persona`
- `Worker`
- `Tokens`
- `Context`

Label rules:
- `Mode` uses the normalized user-facing labels `Ask`, `Agent`, `Plan`, and `Deep Plan`
- `Worker` is `Agent` or `Subagent`
- `Tokens` shows compact total and may disclose breakdown on expansion or in the detailed pane
- `Context` shows used, limit, and percentage when known
- assistant rows show thinking time or duration; user rows show timestamp

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Display mapping rules:
- `Deep Plan` is shown when the effective overlay is `deep_plan`
- `Plan` is shown when the effective overlay is `plan` and the runtime posture is planning
- `Ask` is shown when the effective runtime posture is `ask` and no higher planning overlay is active
- `Agent` is shown for normal execution posture when no higher planning overlay is active

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md
## 14. Subagents & Crew

Subagents and crews use the PM child-run model. A subagent is a child run with its own identity, lifecycle, requested/effective runtime state, and inspectable history. Subagents are disposable by default: spawn, run, complete/cancel/fail, then remain in history instead of being treated as reusable long-lived actors.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 14.1 Subagent visibility in thread -- implementation detail

Subagent work remains visible in the parent thread while preserving transcript compactness.

Required thread-surface behavior:
- each active subagent shows a real-time status chip with the subagent name, current status (`running`, `waiting`, `done`, or `failed`), and elapsed time
- the thread header shows an active subagent count badge
- subagent output streams inline into the thread as collapsible cards
- users may collapse any subagent output card to a one-line summary and later expand it without losing streamed history
- when a subagent fails, the failure card names the failing subagent, what it was doing, and the error/failure summary

Interaction rules:
- collapse/expand state is thread-local and persists while the thread remains open in the current session
- collapsed summaries preserve the latest status and headline result so the transcript remains scannable
- inline cards and header badges project canonical child-run state; chat MUST NOT invent a divergent subagent-only lifecycle model

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### Inline subagent cards

Every child run MUST appear inline in the parent thread as a visually distinct subagent card.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Collapsed card content:

| Field | Requirement |
|---|---|
| Persona | Show the effective child Persona label. |
| Task | Show the child task label in plain language. |
| Status | Show the current status badge. |
| Provider/model | Shown on hover, matching the hover metadata pattern used by other chat bubbles. |

Expanded panel content:

| Region | Requirement |
|---|---|
| Work stream | Live progress and work activity visible while the child is running. |
| Thought stream | Visible and visually distinct from the work stream. |
| State block | Shows blocked, awaiting-parent, failure, or cancellation reason when relevant. |
| Context state | Shows relevant context-shaping disclosures, including context-expansion/rehydration requests and whether dynamic context shrinking affected the child. |
| Result block | Shows a concise final outcome summary once the child completes. |

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Child status taxonomy

The chat thread and child-run runtime MUST use the same visible status vocabulary.
ContractRef: ContractName: child_status_projection. Child status projection into chat MUST remain a direct projection of canonical child lifecycle state and MUST NOT create a separate chat-only status enum. [Source: Tools.md#event-model; Contracts_V0.md#canonical-runtime-event-outcome-and-action-contract-reconciliation-addendum-2026-03-09]

| Status | Meaning |
|---|---|
| `queued` | Child exists but has not started active execution yet. |
| `running` | Child is actively executing or streaming work. |
| `awaiting_parent` | Child is paused pending parent action, clarification, or more context. |
| `blocked` | Child cannot proceed because of tool, permission, policy, provider, or runtime restriction. |
| `complete` | Child finished successfully. |
| `failed` | Child attempted execution and ended unsuccessfully. |
| `cancelled` | Child was intentionally stopped before completion. |

Signal mapping rules:
- `clarification_needed`, `user_input_requested`, and `context_expansion_requested` render as `awaiting_parent`.
- policy/tool/provider/runtime denials render as `blocked`.
- replacement/supersession is preserved as terminal reason metadata even when the visible terminal status is `cancelled`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### Parallel fan-out, batch cards, and subgroup inspection

Parallel child spawning is a first-class behavior. The thread must not assume only one or two children exist.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Rules:
- small fan-out may render as separate child cards.
- large fan-out renders as one top-level batch card.
- expanding a large batch card opens intermediate subgroups of 10 children each.
- expanding a subgroup opens the 10 inline child cards for that subgroup.
- only one subgroup is expanded by default unless the user explicitly opens more.
- canonical child order remains launch order; status changes do not reorder the child list.
- subgroup and batch summaries surface blocked, awaiting-parent, and failed counts so the user knows where attention is needed.

### Parent-mediated clarification and escalation

Children do not question the user directly by default. A child escalates to the parent; the parent decides whether to answer from existing context, send more context, ask the user, reroute, or cancel the child.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

If user input is required:
- the child card shows `awaiting_parent` with the reason.
- the parent emits the actual user-facing question in the main thread.
- the user answers the parent thread, not a hidden child channel.

### Crew mode

Crew mode is a multi-model coordination overlay over the child-run system. It does not replace child cards, child history, or parent-owned synthesis.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md

Default crew behavior:
- same task framing across members.
- often the same Persona across members.
- diversity comes primarily from model/provider choice.
- crew members coordinate through an explicit attributable crew board.
- the parent owns final synthesis, user-facing summarization, and user escalation.

Crew boards are inspectable on demand. They are not hidden memory and do not grant capabilities.
## 15. Plan Mode + Crew Mode

Plan-mode and crew-mode rules must align with the PM child-run contract.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md

### Plan-mode delegated work

`ask` and `plan` may launch delegated child runs only for read-only research or analysis.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

Rules:
- no code-writing, file mutation, or execution child may be launched from `ask` or `plan`.
- required planning dependencies may still be child runs as long as they remain read-only.
- parent mode is a hard ceiling; a child may narrow but must not widen parent authority.
- unresolved required planning children keep the plan provisional rather than falsely complete.

### Crew-mode planning interaction

Crew is an overlay, not a new runtime-mode enum. A crew launched from `plan` remains read-only; a crew launched from `regular` or `yolo` inherits those parent ceilings and guardrails.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Models_System.md, ContractName:Plans/orchestrator-subagent-integration.md

### Crew selection flow

When crew mode is first invoked for a relevant scope:
- if a valid default crew exists, ask whether to use the default crew.
- otherwise ask which models to use.
- after model selection, resolve and confirm provider/runtime mapping where ambiguity or restriction-sensitive mapping exists.
- if any crew member is configured to use Copilot, the entire crew normalizes to Copilot as a crew-level provider constraint.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
## 16. Interview Phase UX (Chat Surface)

When the chat is in **Interview** mode, it uses the same shared question system that powers assistant clarification flows and builder clarification flows.

### Shared question system baseline
Each question flow shows:
- question text
- suggested options as buttons/chips when provided
- a mandatory `Something else` / freeform path when freeform is allowed
- current draft answer state

Rules:
- the Interview question UI is the baseline visual pattern for reusable question cards across Assistant, Interviewer, and requirements/document-builder flows
- questions are required by default unless explicitly marked optional
- a question flow may contain multiple questions in one questionnaire
- users may answer in any order and revise answers before final submission
- dismissing a questionnaire pauses that conversational branch and returns an explicit dismissed state; it does not fabricate a submitted answer set

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md

### Clarification and resume behavior
Structured clarification flows MUST preserve question identity and resume deterministically.

Rules:
- `clarification_request` and related wizard/thread surfaces may point at a multi-question questionnaire, not only one prompt at a time
- `question_ids[]` remain the canonical cross-surface identifiers for clarification work
- thread resume and wizard resume must restore the same outstanding questionnaire state or its resolved outcome

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

### Runtime visibility
Active Interview work blocks must show the effective runtime state required by the shared runtime owner docs.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

## 17. Context & Truncation

- **Goal:** Do our best **not to truncate** important context. Long conversations and large plans should remain usable.
- **Approach:** Use strategies similar to those used by mature AI-coding systems:
  - **VBW (Vibe Better With Claude Code):** Context compilation, role-specific context, compaction awareness, token efficiency. See [VBW manifesto](https://github.com/yidakee/vibe-better-with-claude-code-vbw/tree/main?tab=readme-ov-file#manifesto).  
  - **Get Shit Done (GSD):** Context engineering, sized context files, fresh context per plan. See [GSD](https://github.com/gsd-build/get-shit-done).  
  - **yume:** Session recovery, checkpoints, persistent state. See [yume](https://github.com/aofp/yume).  
- **Application:** Where applicable, implement or plan for: context compilation for chat (e.g. conversation summary + recent turns + plan), compaction-aware re-reads, and clear boundaries so the agent knows what is "current" vs "summarized".
- **User-triggered "Compact session":** The user can trigger **"Compact session"** (or "Summarize and continue") in chat -- e.g. via slash command or menu -- which runs the same compaction pipeline as auto-compact (Plans/newfeatures.md §10), with clear UI feedback (e.g. "Compacting...").

### 17.1 Deterministic bundle ordering (Instruction / Work / Memory)

Rule: For every Assistant turn (and any chat-triggered run), the context pipeline MUST assemble the run context as three explicit bundles, in this deterministic order: (1) Instruction Bundle, (2) Work Bundle, (3) Memory Bundle.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

Rule: The Work Bundle acceptance criteria MUST NEVER be truncated; if truncation is required to fit a model’s window, truncation MUST occur in instruction example/illustrative content first and in conversation summaries/older turns before any acceptance criteria content is removed.

ContractRef: ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.2 Injected-context breakdown + truncation transparency (UI)

Rule: The chat UI MUST surface an “Injected Context” breakdown per run/turn, including: included `AGENTS.md` paths + byte counts; parent summary and attempt journal inclusion + byte counts; and whether truncation occurred (and the reason/order that was applied).

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles

Rule: The three context injectors MUST be user-configurable (per-project; optional per-run override) with deterministic defaults; budget defaults (bytes/lines/headings) MUST be decided deterministically and recorded via `auto_decisions.jsonl`.

ContractRef: ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.3 Context re-pack on model switch (Resolved)

When the model changes mid-thread, the context pipeline re-packs the conversation before the next turn is sent:

1. **Preserve unconditionally:** System prompt, Instruction Bundle (`AGENTS.md` chain where enabled), active file references, last 6 turns verbatim (config: `context.repack.verbatim_turns`, default `6`).
2. **Summarize:** All turns older than the last 6 are condensed into a single "Conversation Summary" block (key decisions, file paths mentioned, outcomes).
3. **Truncate:** If the preserved + summarized content exceeds the new model's context window (from `platform_specs`), truncate the summary first, then drop oldest preserved turns until it fits. Never truncate the system prompt or the Work Bundle acceptance criteria.
4. **Normalize:** Provider-specific formatting (e.g., tool call syntax) is normalized to the new provider's expected format.
5. **Timing:** Re-pack runs synchronously before the next turn is sent. The user sees a brief "Repacking context…" indicator.

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

Config: `context.repack.verbatim_turns` (default `6`). Max tokens sourced from `platform_specs::context_window(provider)`.

Rule: Any UI affordance that offers “Promote to `AGENTS.md`” (or similar) MUST enforce Promotion rules and `AGENTS.md` lightness enforcement (including budgets) before applying changes.

ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 17.4 Assistant-only memory capsule + retrieval injection (SSOT)

Rule: For Assistant turns with a selected project, chat context assembly MUST call the Assistant-memory SSOT interfaces (`build_capsule(project_id, now)` and `search(project_id, user_message, now, k)`) and MUST enforce the configured capsule/retrieval budgets.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#8-integration-points, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

Rule: Automatic memory injection in chat MUST apply eligibility gating per the Assistant-memory SSOT (Verified-only by default; any Unverified inclusion requires explicit user action).

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#5-verification-and-triggers, ContractName:Plans/assistant-memory-subsystem.md#6-prompt-injection-contract, ContractName:Plans/assistant-memory-subsystem.md#9-deterministic-defaults

Rule: Memory injection in chat MUST use summary-only memory text and MUST remain separate from Application/Project rules pipeline assembly.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#3-data-model, ContractName:Plans/agent-rules-context.md

Rule: Assistant memory MUST NOT be forwarded to subagents or non-Assistant execution paths from chat.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#1-capability-boundary, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

Rule: Gist Review actions in Assistant chat MUST dispatch canonical `cmd.chat.memory.*` UI command IDs from `Plans/UI_Command_Catalog.md` and MUST NOT use ad-hoc command identifiers.
ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#UICommand

### 17.5 Project retrieval injection (chat/code/logs) — “RAG” for long threads (project-only)

In addition to the Assistant-only memory capsule (§17.4), the chat context pipeline MAY inject **project-scoped retrieved context** (chat/code/logs) per §10.1. This is designed to keep long-running threads usable without relying on full-history in-context.

Rule: Project retrieval injection MUST remain **separate** from Assistant memory injection:
- Project retrieval injection is **fresh, ephemeral context for the current turn** (Work Bundle: “Retrieved Context”).
- Assistant memory injection remains governed by verification + gist rules (Plans/assistant-memory-subsystem.md) and is never implicitly expanded by chat/code/log retrieval.

Rule: Project retrieval injection MUST respect:
- **Thread-local Auto Retrieval override** (chip; default On; user can disable per thread).
- **Per-project retrieval settings** (allowlist + modes + budgets; Settings/Memory).
- **Context Lens overlays** (§17.6) to avoid injecting muted content or ignoring focused selections.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### 17.6 Context Lens (Mute / Focus / Subcompact) — user-directed context shaping (thread-local)

Context Lens is the user-facing thread-local context-shaping control.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FinalGUISpec.md

Placement and control shape:
- the control lives in the top-right of the chat window.
- it appears immediately to the right of the chat search bar.
- it renders as an icon with a dropdown arrow.
- opening the dropdown exposes `Mute`, `Focus`, `Subcompact`, and `Turn Off`.

Mode behavior:
- all three modes support selecting multiple messages at once.
- `Mute` applies immediately as selection toggles happen.
- `Focus` applies immediately as selection toggles happen.
- `Subcompact` prepares a selection and then requires an explicit apply action because it creates a local summary artifact.
- `Turn Off` exits Context Lens mode and clears the active selection state.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

Context assembly rules:
- muted messages are excluded from effective context assembly and from chatsearch results returned to the agent.
- focused messages remain protected and high-priority in effective context assembly.
- Subcompact replaces the selected message region in effective context assembly with a local summary while preserving canonical source history and rehydration handles.
- Context Lens state is thread-local UI shaping, not Assistant memory.
- child handoff bundles derive from canonical source state plus current effective shaping state; children do not inherit a lossy copy as their only truth.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md
## 18. BrainStorm Mode
- **Flow:** BrainStorm runs a **plan-style flow** (questions, research, debugging as needed) to form a **single plan**. Questions are **not** asked multiple times by multiple subagents; one coordinated Q&A/research phase, then the plan is formed.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Run_Modes.md
- **Execution:** When the user **starts or executes** the plan, the **chat must switch to Agent mode** (execution mode), because Plan mode is read-only and execution requires write/execute permissions.
- **Who executes:** The plan can be executed by:
  - A **regular agent**,  
  - A **crew**, or  
  - **Agent + subagents**.  
  The **manager** (orchestrator) automatically decides, or the **user can request** which option.
- **Subagent collaboration:** During BrainStorm, subagents collaborate through the canonical crew message board owned by `Plans/orchestrator-subagent-integration.md`. This chat document may describe the user-facing behavior, but the schema, routing rules, priority model, rate limit, and orchestrator-visibility contract live in the orchestrator owner doc.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md
- **Reference:** Align with `Plans/orchestrator-subagent-integration.md` (crews, subagent communication) and `Plans/interview-subagent-integration.md` where interview/plan flows are defined.

## 19. Documentation Audience (AI Overseer)

- All **documentation and plans** produced by the **Interview** (PRD, AGENTS.md, requirements, phase plans, etc.) must be written with the understanding that an **AI agent** will execute them, not a human.
- **Implications:**
  - Instructions must be **unambiguous** and **wire-explicit**: every component, config key, and feature must be explicitly wired (e.g. "wire X to Y", "ensure Z is passed to the run config").
  - **DRY Method** must be enforced in generated content (single source of truth, no duplicated logic, tag reusable items). See Plans/interview-subagent-integration.md §5.1.
  - **No partially complete components:** Generated tasks and plans must call out **completeness**: ensure components are fully implemented and wired to the GUI/config/API as intended, and that nothing is "built but not wired" or left as a stub.
- **Interview plan:** The detailed requirements for "AI as Overseer", "wire everything together", and "no incomplete components" are specified in **Plans/interview-subagent-integration.md** §5.2 (Documentation and plans for AI execution). The interview prompt templates and document generators must include these requirements so generated PRD and AGENTS.md reduce unwired or incomplete work.

---

## 20. References

- **AGENTS.md:** DRY Method, platform_specs, subagent_registry, Pre-Completion Verification Checklist.  
- **Plans/interview-subagent-integration.md:** Interview phases, document generation, AGENTS.md/DRY for target projects, §5.2 AI-Overseer and wiring/completeness.  
- **Plans/orchestrator-subagent-integration.md:** Subagent selection, crews, execution engine, Plan/Crew execution.  
- **Plans/human-in-the-loop.md:** HITL mode (phase/task/subtask approval gates), GUI settings, Dashboard CtAs.  
- **Plans/agent-rules-context.md:** Application-level rules (Puppet Master) and project-level rules; fed into every agent (orchestrator, interview, Assistant). When building Assistant context, include the shared rules pipeline output (application + project when a project is selected).  
- **Plans/FileSafe.md:** Context compilation (orchestrator/iteration); chat uses separate conversation context.  
- **Plans/Tools.md:** Central tool registry and permission model (allow/deny/ask); YOLO = no ask prompts, Regular = ask (once / approve for session ≈ [OpenCode "always"](https://opencode.ai/docs/permissions/#what-ask-does)); §2.5 cross-plan alignment with FileSafe, FileManager, orchestrator, interview.  
- **Plans/newtools.md:** MCP, web search (cited), GUI tool catalog; **§8.2.1** cited web search (full spec, architecture, provider/auth, errors, security, per-platform, **gaps and potential problems**).
- **Cited web search (references):** Adapt one or combine approaches so Assistant, Interview, and Orchestrator share one implementation. [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) -- LLM cited search, inline citations + Sources list (Google/OpenAI/OpenRouter). [opencode-websearch](https://www.npmjs.com/package/opencode-websearch) -- Anthropic/OpenAI provider wiring, model selection. [Opencode-Google-AI-Search-Plugin](https://github.com/IgorWarzocha/Opencode-Google-AI-Search-Plugin) -- Google AI Mode via Playwright, markdown + sources. See Plans/newtools.md §8 for full list.  
- **Plans/newfeatures.md §15.15-15.16:** IDE-style terminal and panes (Terminal, Problems, Output, Debug Console, Ports); hot reload, live reload, fast iteration; Assistant can call up live testing tools.  
- **Plans/newfeatures.md §3, §7:** Persistent rate limit and analytics (5h/7d visibility, "know where your tokens go"); use for usage/context display in chat header or status area.  
- **VBW:** https://github.com/yidakee/vibe-better-with-claude-code-vbw (token efficiency, context compilation).  
- **GSD:** https://github.com/gsd-build/get-shit-done (spec-driven development, context engineering).  
- **yume:** https://github.com/aofp/yume (session recovery, native UI for Claude Code).
- **Plans/assistant-chat-design.md §23:** Gaps, competitive comparison (OpenCode, Claude Code, Codex, Gemini, Antigravity, Cursor), and recommended enhancements.
- **Plans/assistant-chat-design.md §24:** Chat thread performance, virtualization, and flicker avoidance (long threads, Slint, virtualized list, stable IDs, incremental stream updates).
- **Plans/newfeatures.md §15.11:** Virtualization for long lists (messages, iterations, logs); overscan, visible slice, placeholder height. **Plans/FinalGUISpec.md**, **Plans/feature-list.md:** Slint + winit, virtualized file tree, backend (Skia).

---

## 21. Dashboard Warnings and Calls to Action

The **Dashboard** displays **warnings** and **Calls to Action (CtAs)** that require or benefit from user attention. These are not only informational: the user is expected to **answer or address** them.

- **Warnings:** e.g. approaching usage limits, config wiring gaps, Doctor findings, or run state that needs review. Shown on the Dashboard so the user sees them without opening another view.
- **Calls to Action (CtAs):** Items that need an explicit user action -- e.g. approve, acknowledge, run a suggested action, or fix a configuration issue. CtAs prompt the user to interact.

**Addressable via the chat Assistant:** Warnings and CtAs can be **answered or addressed by the chat Assistant**. The user can:
- Open the Assistant and respond in natural language (e.g. "approve and continue," "what's blocking?", "run the suggested fix").
- Use the Assistant to discuss or clarify before taking action (e.g. "summarize what was done in this phase" before approving a HITL gate).

**HITL prompts:** When Human-in-the-Loop (HITL) is enabled and the orchestrator pauses at a tier boundary (phase, task, or subtask):
  - The **Dashboard** shows a **CtA** that prompts the user to interact (e.g. "Phase X complete -- approval required to continue").
  - A **new thread** is **spawned** with an **appropriate name** (e.g. tied to the phase/task or "Approval: Phase X") so the user has a dedicated place to respond. That thread shows the CtA; the user can address it there via the Assistant (e.g. "approve and continue" or ask for a summary and then approve). So the user is notified on the Dashboard and in a dedicated HITL thread.
  The user can also address the CtA via the Assistant in that thread (e.g. "approve and continue" or ask for a summary and then approve) or via a direct "Approve & continue" control on the Dashboard if provided. See **Plans/human-in-the-loop.md** for HITL settings (GUI) and behavior.

**Orchestrator to Assistant handoff:** When the orchestrator **completes** a run or **pauses** (e.g. at a tier for HITL or at end of phase), the Dashboard/completion UI must offer the canonical CtA **Continue in Assistant**. That action opens the Assistant chat with **relevant context** injected: e.g. run summary, current phase/task/subtask id, and a short summary of what was done. The user can then continue in natural language ("approve and continue", "what should we do next?") without re-pasting. Implementation: Dashboard CtA or completion panel includes a control that switches to Assistant view, creates or selects a thread, and injects a context block (run summary, phase/task, optional suggested prompt).

---

## 22. Live Testing Tools and Hot Reload
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Live testing and hot reload are dev-session operations.

Rules:
- assistant-invoked dev actions map to stable UI commands and visible shell state changes
- `start hot reload dev mode`, `start dev server`, and `run tests in watch mode` are user-facing intents that resolve to canonical `cmd.dev.*` or terminal command IDs
- the chat surface shows whether a dev session is starting, active, failed, stopping, stopped, or restored as historical state
- output routes into the canonical Terminal, Output, Problems, Debug Console, and Ports surfaces owned by the shell; chat does not create a parallel dev-output model
- project switch or workspace-tab close must surface explicit consequences for any active dev session

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md

### Dev-session and terminal binding
A dev session may own or link multiple terminal sessions without collapsing them into one PTY identity.

Rules:
- a dev session may span multiple workgroups, leaf panes, and editor-embedded terminal panels.
- `Show Output`, `Show Problems`, and `Show Ports` reveal the surfaces linked to the current `dev_session_id` without changing the canonical owning runtime records.
- `Open in Terminal` from a dev-status row reveals the primary or last-active terminal leaf pane for that dev session when one exists.
- closing a workgroup or pane that is mirrored in the editor stack must remove or update the associated editor panel references.
- if a pane exists only in the editor stack, the bottom workspace surfaces placeholder guidance rather than pretending the pane no longer exists.
- stopping a dev session preserves historical shell evidence and linked surface history even when the live process has exited.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md
### Project-switch and close rules
- switching projects recalculates effective shell, tool, and dev-session state for the new project context
- background activity from the old project remains visible through badges and attention surfaces tied to its own project and session identities
- closing a workspace tab or terminal tab with an active dev session requires explicit consequence disclosure; Puppet Master MUST NOT silently orphan the background workflow by default

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Run_Modes.md
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
13. **Clear queue** -- §4: user can clear the entire queue.
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

The following were the last open gaps; they are now specified in the main body. This table is kept for traceability.

| Area | Status |
|------|--------|
| **Error and failure UX** | Now in §4: thread shows error state, Resend/Cancel, queue unchanged unless user resends; suggest switch platform/model when appropriate. |
| **Orchestrator → Assistant handoff** | Now in §21: Dashboard offers "Continue in Assistant" with run summary and context when orchestrator completes or pauses. |

**Verdict:** The plan is **fully fleshed out** for MVP for all adopted items (§23.4). No remaining gaps; **accessibility** is explicitly not MVP.

### 23.6 Git & GitHub parity

**Git & GitHub parity:** Full specification in Plans/GitHub_Integration.md. The Git panel (§A), GitHub API integration (§B), SSH remote dev servers (§C), and no-wizard project flows (§D) bring Puppet Master to IDE-level git integration. Chat git commands (§5.1 above) allow driving git operations from the assistant without switching to the Git panel. ContractRef: Plans/GitHub_Integration.md.

---

## 24. Chat thread performance, virtualization, and flicker avoidance

This section addresses **long chat threads**: keeping them performant, using **virtualized rendering**, and **avoiding flicker**. The UI stack is **Rust + Slint** with an advanced renderer (e.g. winit + Skia per rewrite-tie-in-memo and Composergui5); the following requirements apply to the chat message list and related thread content.

### 24.1 Virtualized rendering

- **Requirement:** For long chat threads (e.g. hundreds or thousands of messages/blocks), the **message list must be virtualized**. Only the **visible viewport** plus an **overscan of 10 items** above and below should be rendered at any time. Config: `ui.chat.virtualization_overscan`, default `10`. Tune based on Slint rendering performance. The scrollable area uses a **virtual spacer height** derived from item count and an **estimated item height** (or from measured heights when available) so the scrollbar is correct and the user can scroll to any position. This keeps the number of live widgets/nodes bounded and avoids lag, high memory use, and layout thrash.
- **Why it helps:** Long threads (full history, many diffs, thought streams, subagent blocks) would otherwise create thousands of widgets. Virtualization ensures that only a small window of items is built and measured; scrolling recomputes the visible slice and reuses or recreates only that slice. Reference: **Plans/newfeatures.md** §15.11 (virtualization for long lists); **Composergui5** and **feature-list** (Slint, virtualized file tree, terminal).
- **Slint:** With Slint, use a **ListView** (or equivalent) that is backed by a **model providing only the visible slice** (e.g. Rust supplies a window of items based on scroll position and container height), or use a scroll area with a virtualized content component that receives (start_index, count) and renders only those items. Avoid building a single huge widget tree for the entire thread.
- **Stable identity:** Each message or block (user message, assistant message, diff block, thought stream, subagent block, etc.) must have a **stable ID** (e.g. message_id or event_id). The virtualized list uses these IDs so that when the visible window changes (user scrolls), the same logical item is not recreated with different identity--this reduces flicker and allows Slint/renderer to reuse or efficiently update.

### 24.2 Flicker avoidance

- **Incremental updates, no full replace:** When the assistant **streams** a response, the UI must **append** or **update in place** the current message node--**not** replace the entire message list or rebuild all visible items. Appending to the streaming message (e.g. appending text to the last assistant bubble) should not cause other items to re-render or the list to jump. Use **minimal-diff** or **append-only** updates for the active streaming node so only that node's content changes.
- **Avoid full list rebuild on stream chunk:** On each stream chunk (e.g. new token or thinking segment), do **not** trigger a full re-layout or re-build of the virtualized list. Update only the **content** of the currently streaming item (and optionally the scroll position to follow tail). Batch or throttle UI updates if the stream is very fast (e.g. coalesce into 1-2 frames per second for layout).
- **Collapse/expand and scroll position:** When the user expands or collapses a section (thought stream, diff block, web search links), the **scroll position** should be preserved or adjusted minimally so the list does not jump. If expanding changes item heights, the virtual list should recompute the visible window and, if needed, adjust scroll offset so the expanded content stays in view or the user's scroll position is stable. Avoid recalculating every item's height on every expand/collapse; cache or estimate heights where possible.
- **Layout thrash:** Avoid **read-write-read** patterns that force multiple layout passes (e.g. measure all items then position). Prefer: compute visible range from scroll position and container height; render only that range; update scrollbar from total estimated height. Slint's layout model should be used so that only the visible slice participates in layout.
- **Double-buffer or single update path for streaming:** For the **actively streaming** message, consider a single update path: stream events append to a buffer or model that the UI binds to; the renderer draws the current state once per frame (or on coalesced updates) rather than replacing the whole node on every chunk.

### 24.3 Additional performance measures

- **Lazy content for collapsed sections:** When a section is **collapsed** (thought stream, bash output, diff, web links), the full content need not be **rendered** until the user expands it. Store full content in the thread model for persistence and search; for the virtual list, collapsed items can render only the summary line (e.g. "Thought stream (expand)", "Ran: `cargo test`") so layout and paint are cheap.
- **Pagination or "load older" (optional):** For very long threads, consider **loading older messages on demand** (e.g. "Load 50 older" or load when user scrolls near the top). The virtual list then has a bounded "window" of loaded items that grows as the user scrolls up. Full history remains in storage (§11); the UI layer fetches a slice. This is an enhancement if virtualization alone is insufficient for extreme thread lengths.
- **Bounded in-memory size for "current thread":** Even with virtualization, avoid holding the entire thread's message blobs in hot memory if the thread is huge. Stream or page message content from storage (seglog/redb/projection per rewrite-tie-in-memo) into the visible window. In-memory cap: last **200 messages** or **8 MB** (whichever limit is reached first). Older messages are paged from storage on demand. Config: `ui.chat.in_memory_cap_messages` (default `200`), `ui.chat.in_memory_cap_bytes` (default `8388608`).

### 24.4 Enhancements (MVP -- fleshed out)

These enhancements are **MVP** requirements. They must integrate with virtualization (§24.1) and flicker avoidance (§24.2). Short summary below; full specifications follow.

- **24.4.1 Skeleton placeholders:** While loading a thread or when scrolling quickly, show **skeleton placeholders** (e.g. grey bars or simple shapes) for not-yet-loaded items so the list doesn't "pop" when content arrives. Improves perceived performance.
- **24.4.2 Jump to message:** Allow the user to **jump to a specific message** (e.g. by ID or by search result). Virtual list scrolls to that index and loads the slice containing it; stable ID ensures the right item is highlighted or focused.
- **24.4.3 Search-in-thread highlights:** When the user searches within the thread (§10), highlight matches in the visible messages. Virtualization still applies; only visible items need highlight computation. Avoid re-scanning the entire thread on every scroll; cache match ranges per message.

**Skeleton placeholders (24.4.1) -- full spec (MVP):** (1) **Purpose:** During thread load or fast scroll, show skeleton placeholders for not-yet-loaded items so the list does not pop or show blanks. (2) **When:** Thread load = **8 skeleton rows** until first slice is loaded (Config: `ui.chat.skeleton_row_count`, default `8`); scroll = skeletons for new visible window until slice content is ready, then replace in place. (3) **UI:** Simple grey rounded bars (one or two lines; optional different heights for user/assistant/diff); theme-aware; replace in place when content arrives to avoid jump/flicker. (4) **Data:** UI-only; for any visible index without content, render skeleton; when slice loader returns data, re-render. (5) **Slint:** Reusable skeleton component; list model signals loading per index. (6) **Edge cases:** On load failure, show error placeholder + Retry; do not leave skeletons indefinitely.

**Jump to message (24.4.2) -- full spec (MVP):** (1) **Purpose:** Jump to a message from search results (§10), shared link, or command palette; virtual list scrolls to target and optionally highlights it. (2) **When:** Search result "Go to message"; URL/deep link to message; optional "Go to message..." command. (3) **UI:** Scroll so target (by stable ID or index) is in viewport (centered or upper third); ensure slice containing target is loaded (target_index ± overscan); optional brief highlight or focus, fading after a few seconds. (4) **Data:** Resolve message ID → index (or scroll offset); if paged, resolve via storage; use search result IDs as jump targets. (5) **Edge cases:** Deleted/rewound target → "Message not found"; target in unloaded older region → trigger load older, then scroll.

**Search-in-thread highlights (24.4.3) -- full spec (MVP):** (1) **Purpose:** When user searches in thread (§10), highlight matching text in visible messages; only visible items need highlight computation. (2) **When:** Thread view focused after search; optional "Highlight all in thread" mode while scrolling until search cleared. (3) **UI:** Distinct highlight style (e.g. background or underline), consistent across types/themes; only visible window scanned; cache match ranges per message ID so re-entering visible window restores highlights; highlight all occurrences; optional Next/Previous match (keyboard). (4) **Data:** Store match ranges (start, end offset) per message; compute on search or when message enters view; cache by (message_id, query); thread search query available to chat view; clear on search clear or thread change. (5) **Performance:** Do not re-scan full thread on scroll--cache ranges for all matching messages at search time, or compute only for visible slice and cache by message ID. (6) **Edge cases:** Cap matches per message (e.g. 50); escape regex/special chars; empty query = no highlights.

### 24.5 Gaps and potential problems

| Gap / problem | Description | Mitigation |
|---------------|-------------|------------|
| **Overscan size** | How many items above/below viewport to render? Too few = blank areas when scrolling fast; too many = extra work. | Overscan: **10 items** above and below the visible viewport. Config: `ui.chat.virtualization_overscan`, default `10`. Tune based on Slint rendering performance. |
| **Item height estimation** | Virtual list needs total height for scrollbar; items have variable height (short message vs long diff). | Use **estimated height** per item type (e.g. message ~80px, diff ~200px) or store measured heights in a cache keyed by stable ID; update scrollbar as user scrolls and more heights are known. |
| **Expand/collapse and virtual list** | Expanding a block changes its height; the list must reflow and possibly adjust scroll. | Recompute visible slice and scroll offset after expand/collapse; preserve "anchor" (e.g. first visible item id) so the list doesn't jump arbitrarily. Consider keeping expanded height in a cache so re-expand is instant. |
| **Scroll position restore** | When user switches threads and back, or reopens app, restore scroll position. | Persist scroll position (e.g. last visible message id or offset) with the thread or session; on load, scroll virtual list to that position after first paint. |
| **Streaming at bottom** | While streaming, user expects to see the tail. If virtual list only has a fixed window, the "tail" might be off-screen. | Keep the **currently streaming** message in the visible window (e.g. scroll to bottom when streaming starts, or ensure the last item is always in the overscan). When user has scrolled up during stream, do not auto-scroll; only auto-scroll when already at bottom. |
| **Max thread length (display)** | Is there an upper bound on thread length for display? Persistence stores full thread (§11). | No hard limit for persistence. For display, virtualization and optional "load older" keep the UI bounded. Document that threads with 10k+ messages may need pagination or load-older in addition to virtualization. |

---

<a id="25-context-enhancements"></a>
## 25. Context Circle Enhancements (Addendum -- 2026-02-23)
The canonical thread-usage behavior now lives in `## 12. Context usage display` and `Plans/usage-feature.md`.

Historical note:
- compact-now behavior remains valid when backed by canonical compaction commands
- the detached usage pop-out is no longer canonical
- any old command IDs or persistence keys that exist only for the pop-out model are superseded by the canonical thread-scoped Context Detail Pane/editor-tab model and its stable command IDs
## 26. Per-Pass Validation Model/Provider Settings (Invariant Sweep)

> **Addendum — 2026-02-25**

### 26.1 Context

The Three-Pass Canonical Validation Workflow (see `Plans/chain-wizard-flexibility.md §12`) runs three sequential passes after every interview/wizard project-plan generation cycle. Each pass uses a designated AI provider and model to perform its specific analysis and correction duties. This section specifies the **settings UX** that exposes per-pass provider + model selection to the user.

### 26.2 Settings Location

Per-pass provider and model selections live in a dedicated **Validation Passes** settings group within the existing app Settings surface — not in the chat UI itself.

**Navigation path:** Settings → Interview / Chain Wizard → Validation Passes

This placement keeps validation configuration co-located with other interview/wizard settings and away from the chat session controls, which govern the interactive conversation only.

### 26.3 Per-Pass Controls

The **Validation Passes** settings group exposes one row of controls per pass.

| Pass | Label | Default Provider | Default Model |
|------|-------|-----------------|---------------|
| Pass 1 | Document Creation | (primary configured platform) | (primary model for that platform) |
| Pass 2 | Docs + Canonical Alignment | (primary configured platform) | (primary model for that platform) |
| Pass 3 | Canonical Systems Only | (primary configured platform) | (primary model for that platform) |

**Controls per pass:**

- **Provider dropdown** — lists all enabled platforms (sourced from `platform_specs`; same data source as the chat platform dropdown). Label: "Provider".
- **Model dropdown** — lists models for the selected provider (dynamically discovered, cached; same data source as the chat model dropdown). Label: "Model". Fallback: `platform_specs::fallback_model_ids(platform)`.

> **Note:** No reasoning/effort control is shown in this settings group. Effort settings apply to the interactive chat session and do not govern these background validation passes.

// DRY:WIDGET:validation-pass-provider-model-selector

### 26.4 Default Resolution (Deterministic)

Default provider and model values are resolved using the following deterministic priority chain:

1. **Explicit stored value** — if `validation_sweep.passN.provider` / `validation_sweep.passN.model` is present in app settings, use it.
2. **Primary chat platform + model** — if no per-pass value is stored, use the provider and model selected in the main chat settings (the user's primary platform).
3. **First available platform + first fallback model** — if the primary chat platform/model is also unset, select the first platform returned by `platform_specs` and the first entry from `platform_specs::fallback_model_ids(platform)`.

**Invariants:**
- Given the same app settings state, the same provider and model are always selected (no randomness, no environment-dependent branching).
- On first explicit save of per-pass settings, the resolved default is written to app settings so that subsequent reads are reproducible.

### 26.5 Storage

Per-pass selections are stored in **app settings** only. They are not stored in project artifacts, not emitted to seglog as project data, and not included in project exports.

For auditability, each pass's resolved provider/model selection is mirrored into that pass's `validation_pass_report` payload fields (`provider`, `model`) in seglog (see `Plans/Project_Output_Artifacts.md §10.2`). This does not store the settings keys themselves as project artifacts.

**Normative storage keys:**

| Key | Purpose |
|-----|---------|
| `validation_sweep.pass1.provider` | Provider for Pass 1 (Document Creation) |
| `validation_sweep.pass1.model` | Model for Pass 1 |
| `validation_sweep.pass2.provider` | Provider for Pass 2 (Docs + Canonical Alignment) |
| `validation_sweep.pass2.model` | Model for Pass 2 |
| `validation_sweep.pass3.provider` | Provider for Pass 3 (Canonical Systems Only) |
| `validation_sweep.pass3.model` | Model for Pass 3 |

These keys are written to the same app settings store as all other GUI configuration values. See `Plans/chain-wizard-flexibility.md §3.1.1` for the OpenCode provider settings surface reference.

### 26.6 UX Copy

| Element | Copy |
|---------|------|
| Section header | "Validation Passes" |
| Section description | "Puppet Master runs a three-pass canonical validation sweep after every project plan is generated. Choose which provider and model to use for each pass." |
| Pass 1 description | "Document Creation — generates project artifacts (requirements, contracts, plan graph, acceptance manifest)." |
| Pass 2 description | "Canonical Alignment — checks artifacts against project contracts and platform canonical references; finds and fixes gaps." |
| Pass 3 description | "Canonical Systems Only — enforces DRY/SSOT, plan graph integrity, wiring matrix, and evidence alignment. Never modifies product requirements." |
| Default indicator | Show "(Default)" next to the automatically resolved provider/model when no explicit selection has been saved for that pass. |

### 26.7 DRY Rules

- Provider and model lists **MUST** be sourced exclusively from `platform_specs` (same SSOT as §1.1 chat controls). No hardcoded provider names or model lists anywhere in this feature.
- Reuse the same provider + model dropdown widgets as the §1.1 chat controls. Tag new reusable settings wrappers with: `// DRY:WIDGET:validation-pass-provider-model-selector`.

ContractRef: PolicyRule:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md#platform_specs

### 26.8 Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | Settings changes take effect on the **next** validation sweep run — not mid-sweep. A sweep in progress uses the provider/model that was active when it started. |
| 2 | When a saved provider is no longer available (platform uninstalled or disabled), Puppet Master falls back to the deterministic default (§26.4) and displays a warning: *"Pass N provider [name] is unavailable; using default."* |
| 3 | Per-pass settings are preserved across app restarts. |
| 4 | All three pass selectors are independently configurable: Pass 1 may use a different provider and model than Pass 2 or Pass 3. |
| 5 | The "(Default)" indicator (§26.6) is visible whenever no explicit selection has been saved for a given pass, and disappears once the user saves an explicit choice. |
| 6 | Provider and model dropdowns for all three passes draw from the same `platform_specs` data source as the §1.1 chat controls — no divergence. |
| 7 | For each pass `N`, emitted `validation_pass_report.provider` and `.model` values match resolved settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` (see `Plans/Project_Output_Artifacts.md §10.2`). |

### 26.9 References (Section 26)

- `Plans/chain-wizard-flexibility.md §12` — Three-Pass Canonical Validation Workflow (primary specification)
- `Plans/chain-wizard-flexibility.md §3.1.1` — OpenCode provider settings surface reference
- `Plans/Project_Output_Artifacts.md §10.2` — validation pass report payload fields (`provider`, `model`)
- `Plans/Decision_Policy.md §2` — deterministic default policy
- `Plans/DRY_Rules.md` — DRY/SSOT rules
- `Plans/Contracts_V0.md` — platform_specs contract
- Section 1.1 of this document — chat platform + model controls (shared widget source)

ContractRef: ContractName:Plans/chain-wizard-flexibility.md§12, ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:Decision_Policy.md§2
## 27. Persona Control in Assistant Chat (2026-03-06)

This addendum defines Persona behavior for the Assistant chat surface.

### 27.1 Chat Persona modes

Assistant chat supports Persona modes:
- `manual`
- `auto`
- `hybrid`

Definitions:
- **manual:** user selects the Persona directly.
- **auto:** chat resolver selects Persona based on repo/task/message context.
- **hybrid:** auto selects by default, but the user may temporarily or persistently override it.

### 27.2 Current Persona display (required)

Chat UI MUST display the effective Persona even when auto mode is active.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Required display content (imported from shared runtime/Persona fields rather than redefined locally):
- `requested_persona?`
- `effective_persona`
- `persona_selection_source`
- `persona_override_owner_id?`
- `effective_platform`
- `effective_model`
- `effective_talkativeness` when not `model_default`
- optional `effective_variant?` / `effective_effort?`
- skipped Persona controls when relevant

Example:
- `Persona: Rust Engineer (Auto: repo detected as Rust + code task)`
- `Model: Codex GPT-5.3 (Persona preferred)`
- `Platform: Codex (Available)`

Rules:
- Auto mode MUST NOT display only `Auto` with no resolved Persona.
- Assistant Chat consumes the field names owned by `Plans/Personas.md`; it MUST NOT create parallel names such as chat-local selection-source or override-owner aliases.
- Inline subagent cards, child-run receipts, and any persona chip in the chat header use the same imported runtime field set so the user sees one consistent requested/effective Persona story across the thread.
- Reserved Personas remain defined in `Plans/Personas.md`; chat acknowledges them only by reference.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md

### 27.3 Natural-language Persona invocation in chat

The Assistant must support user requests such as:
- `Use Explorer`
- `Use Collaborator`
- `Be a Rust engineer`
- `Answer as a technical writer`
- `Switch to security auditor`

#### Scope semantics

Default scope handling:
- `for this`, `for this answer`, `right now` -> turn scope,
- `from now on`, `in this chat`, `for this session` -> session scope.

UI must show when a natural-language override is active, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Explorer (User requested, session lock)`

When the override expires, the UI should return to auto display, for example:
- `Persona: Rust Engineer (Auto: Rust repo + code task)`

### 27.4 Persona aliases and fuzzy matching

Chat Persona invocation should resolve through:
- canonical Persona IDs,
- display names,
- aliases,
- normalized natural-language forms.

Examples:
- `rust engineer` -> `rust-engineer`
- `tech writer` -> `technical-writer`
- `collaborator` -> `collaborator`

If multiple Personas match, chat may request clarification. If exactly one reliable match exists, it should resolve without extra friction.
If no Persona matches:
- **Manual picker:** the selector must reject submission with an inline `Persona not found` validation state.
- **Natural-language request:** chat must ask for clarification (for example, nearest matches or a prompt to pick a Persona) before starting a run; it must not silently pretend a request resolved when it did not.
- **Persisted unresolved reference:** if a stored/manual/auto Persona reference reaches runtime and remains unresolved, the fallback contract in `Plans/Personas.md` §2.3 applies, and chat must surface that the run is proceeding without Persona context.

### 27.5 Chat-level controls

The chat panel should include:
- Persona mode selector (`Auto` / `Manual` / `Hybrid`),
- effective Persona pill/badge,
- optional manual Persona picker,
- selection-reason tooltip or inline sublabel,
- effective talkativeness in Persona details when the active Persona overrides model-default verbosity,
- and a way to lock/unlock the current Persona.

### 27.6 Subagent and child-run display

When chat spawns subagents/child runs, the inline subagent blocks must show:
- effective Persona name,
- task label,
- effective platform,
- effective model,
- elapsed time,
- and if relevant, skipped unsupported Persona controls.

### 27.7 Provider compatibility disclosure in chat

Chat surfaces must disclose requested versus effective runtime choice when the distinction matters to user trust or behavior.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

Required disclosure behavior:
- provider/model for a child run is visible on hover in the collapsed card.
- the expanded child panel may show requested versus effective runtime surface, effective effort, and fallback reason when a remap occurred.
- explicit user-chosen runtime surfaces must not silently fallback without disclosure.
- Copilot-native routing restrictions must surface as incompatibility or denial rather than silently degrading into a different execution path.

Crew-mode disclosure:
- the default crew confirmation surface shows each member as `model -> provider/runtime surface`.
- when Copilot forces crew-wide provider normalization, the UI explains that Copilot is being treated as a crew-level provider constraint.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md
### 27.8 Chat acceptance criteria addendum

- Assistant chat must support explicit natural-language Persona invocation.
- Auto Persona mode must always disclose the resolved Persona and why it was chosen.
- Current effective Persona/model/platform must be visible in the chat surface.
- If the active Persona sets `talkativeness` away from `model_default`, chat details must expose the effective setting.
- Subagent inline blocks must display effective Persona/model/platform rather than only generic role text.
- Manual Persona selection must block submission when the selected Persona cannot be resolved.
- Natural-language Persona requests that do not resolve to a single reliable match must produce clarification or fallback disclosure, not a silent wrong-Persona resolution.

## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

This section defines how rendered Markdown and Mermaid appear in chat, plan-mode outputs, and other assistant-driven document surfaces.

### 28.1 Scope

Applies to:

- normal assistant/user/system chat messages
- assistant-created documents opened from chat
- planning documents opened or generated through chat workflows
- future Deep Plan Mode documents and previews

### 28.2 Canonical model

### 28.2A Chat/planning artifact source model (2026-03-08)

Chat/planning rendering needs one explicit source model for non-file content.

**Artifact classes**
- `chat_message_block` — renderable Markdown/Mermaid originating from a chat message
- `assistant_draft_document` — assistant-created document not yet saved to a workspace path
- `planning_draft` — planning document content created before first persist
- `persisted_planning_document` — planning content with a real workspace file path

**Planning surfaces in scope**
- plan-mode output previews shown in chat/document workflows
- assistant-created documents opened from chat
- planning drafts and persisted planning documents shown in preview-capable document panes
- future Deep Plan Mode previews, when present, following the same canonical-source rules

**Source behavior**
- `persisted_planning_document` opens its real workspace file on `open_source`.
- Non-file artifact classes open a transient `generated://<artifact_id>` source buffer on `open_source`.
- Transient source buffers MUST show provenance (`from chat message`, `from planning draft`, etc.).
- Exporting or opening source from chat/planning content MUST NOT silently create workspace files.
- Explicit user actions such as `Save As` or `Insert into file` create the first workspace-backed document for a non-file artifact.

**Mutation scope**
- Chat/planning render surfaces remain non-destructive until they are wired to the same validated preview-action pipeline used by File Editor and Embedded Document Pane.

- Chat and planning surfaces may render Markdown richly, but canonical saved/editable artifacts remain source text.
- Mermaid remains canonical as fenced `mermaid` code blocks or `.mmd` text.
- The assistant may create Mermaid diagrams, but it creates text artifacts, not hidden binary/graph models.

### 28.3 Mermaid detection and rendering rules

- Detect Mermaid primarily from fenced `mermaid` code blocks and Mermaid documents.
- When detected, render Mermaid natively as a diagram card/surface in chat and planning previews.
- When not detected or when parse fails, show the source block plus a visible render error state rather than silently dropping the content.
- Mermaid preview in chat/planning surfaces uses the restricted generated-preview trust tier.

### 28.4 Allowed user actions on rendered chat/planning content

### 28.4A Element-context attachment contract

Rendered selection capture uses three canonical typed attachments:
- `attachment_type = browser_element_context` for browser / HTML element capture
- `attachment_type = browser_selection_context` for browser text selection capture
- `attachment_type = document_selection_context` for native document selections forwarded into chat

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

`browser_element_context` required fields:
- `attachment_id`
- `schema_version`
- `browser_session_id`
- `session_class`
- `page_url`
- `tag_name`
- `element_ref?`
- bounded `text_content?`
- `role?`
- `rect`
- `parent_path?`
- `html_excerpt?`
- `requested_target`
- `effective_target?`
- `captured_at`
- `truncation_state`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

`browser_selection_context` required fields:
- `attachment_id`
- `schema_version`
- `origin_kind`
- `source_surface`
- `browser_session_id`
- `session_class`
- `page_url`
- bounded `selected_text`
- `selection_anchor?`
- `requested_target`
- `effective_target?`
- `captured_at`
- `truncation_state`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

`document_selection_context` required fields:
- `attachment_id`
- `schema_version`
- `origin_kind` (`assistant_deep_plan`, `wizard_document_review`, `interview_document_review`, `document_review_surface`, `workspace_preview`)
- `source_surface`
- `bundle_id?`
- `doc_id`
- `doc_path` or equivalent bounded provenance
- `display_name?`
- `captured_at`
- `selected_text` (bounded)
- `anchor` (`text_position?`, `text_quote`, or stable semantic anchor id)
- `requested_target`
- `effective_target?`
- `sensitivity_state`
- `truncation_state`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

Composer behavior:
- capture creates a visible pending composer chip/card immediately visible to the user
- chips are stored in composer-prep state keyed by `thread_id`, never as global chat state
- the chip is attached to the next submitted user message by default and the user may remove it before send
- capturing browser context MUST NOT silently inject a hidden message into the thread
- hidden chat panels do not auto-open by default; the owning chat surface may pulse/badge and show a toast instead
- if the owning thread is terminal or non-writable, create a new thread in the same owning surface and record both `requested_target` and `effective_target`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Browser capture actions exposed to users are:
- `Add Selection to Chat`
- `Add Selection + Screenshot`
- `Add Selection + Full Screenshot`
- `Pick Element for Chat`
- `Pick Element + Screenshot`
- `Pick Element + Full Screenshot`
- `Add Screenshot to Chat`
- `Add Full Screenshot to Chat`

The default combined capture is context plus clipped screenshot.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Prompt assembly:
- all three structured attachment types are serialized before the user's freeform message text
- `document_selection_context` serializes bounded provenance, anchor, and excerpt fields first; it MUST NOT inject raw unbounded document bodies
- `browser_element_context` and `browser_selection_context` serialize bounded provenance first and MUST NOT inject raw unbounded DOM/page bodies
- blocked or expired chips MUST NOT be serialized as successful user attachments

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

Persistence and audit:
- submitted attachments persist as part of the submitted user message record
- pending composer chips may persist across restart per thread until sent or removed; if they cannot be restored safely they return as blocked/expired, not silently dropped
- search/indexing stores bounded summary fields only; do not index unbounded raw document text or unbounded browser DOM dumps
- captures and blocks must be visible in thread history or audit views as user-supplied context, including source provenance and requested/effective target

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

### 28.5 Structured editing rules

Chat/planning preview surfaces may support a constrained set of structured interactions, but they are not freeform WYSIWYG editors.

Rules:

- structured edits must target known source spans/nodes
- stale or ambiguous actions must fall back to source focus/open
- raw HTML/unknown syntax regions remain source-only for editing
- preview DOM state must never become the authority

### 28.6 Safety and trust boundaries

- Rendered chat/planning Markdown does not gain arbitrary browser privilege.
- Arbitrary HTML from messages is not executed as a full-trust page.
- Mermaid preview runs with a strict/restricted posture by default.
- Full HTML/browser mode is a separate surface and is not implied by rich chat Markdown rendering.

### 28.7 Planning-document support

Planning documents, including future Deep Plan Mode documents, use the same rendering pipeline and canonical-source rules as normal Markdown files.

Required consequence:

- if a planning doc contains Mermaid, it renders natively
- if the user edits the planning doc, the saved artifact remains Markdown/Mermaid text
- preview/edit behavior follows the same source-preview contract as editor Markdown documents

### 28.8 UX expectations

- Rendered Markdown in chat should feel significantly better than plain monospace message dumps.
- Mermaid cards should feel first-class rather than like pasted screenshots.
- Export/open-source/open-detached actions should be obvious and low-friction.
- Error states should tell the user whether the issue is syntax, runtime, or trust/sanitization related.

### 28.9 Acceptance criteria

- Assistant output containing fenced Mermaid renders as a native diagram card in chat.
- The same Mermaid content can be opened in source form and exported as SVG/PNG.
- Planning documents with Mermaid render using the same rules as normal Markdown docs.
- If inline rendered editing is not safe, the UI moves the user to source rather than corrupting content.

## 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)

### 29.1 Natural-language mode invocation
Natural-language mode invocation resolves workflow identity and runtime posture separately.

Required requested/effective fields are:
- `requested_mode_overlay`
- `effective_mode_overlay`
- `requested_runtime_mode`
- `effective_runtime_mode`
- `requested_plan_thoroughness`
- `effective_plan_thoroughness`
- `selection_source`
- `selection_reason`
- `override_scope`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

Canonical enum closure:
- `requested_mode_overlay` and `effective_mode_overlay` are closed to `none`, `plan`, `deep_plan`, `debug`, `interview`, `brainstorm`, and `crew`
- `requested_runtime_mode` and `effective_runtime_mode` are closed to the canonical runtime postures from `Plans/Run_Modes.md`
- `deep_plan` MUST survive normalization through the overlay fields and MUST NOT be discarded from historical/runtime records simply because the runtime posture is planning

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

Resolution rules:
- `use ask mode`, `don't edit`, and `just inspect` resolve to `effective_mode_overlay = none` and canonical runtime `ask`
- `use plan mode` resolves to `effective_mode_overlay = plan` and canonical runtime `plan`
- `use deep plan` resolves to `effective_mode_overlay = deep_plan` and canonical runtime `plan`
- `use agent mode` clears planning overlays and resolves to the normal execution posture for the thread, preserving explicit permission posture such as `regular` or `yolo`
- compact display labels are derived from the effective overlay plus runtime posture so the visible label can still be `Ask`, `Agent`, `Plan`, or `Deep Plan`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md
### 29.2 Assistant recommendation of Chain Wizard

Assistant chat should proactively recommend the Chain Wizard when the user appears to be asking for:
- a new feature inside an existing project
- a substantial enhancement
- a major refactor / major change
- feature work that likely benefits from adaptive interview scoping and orchestrator follow-through

Signals may come from:
- direct natural-language phrasing (`add a feature`, `major enhancement`, `big change`, `large refactor`)
- inferred scope (many affected domains, many open questions, large plan size)
- Deep Plan output after research

Recommendation behavior:
- recommendation is a CTA, not an automatic redirect
- the user may accept or decline
- declining keeps the user in chat with no hidden workflow switch

### 29.3 Deep Plan post-plan wizard recommendation

Deep Plan MUST perform a final wizard-escalation evaluation before defaulting to pure chat execution.

Deep Plan should recommend the Chain Wizard when one or more of the following are true:
- the work spans several interview domains (for example UI + data + security, or architecture + deployment + testing)
- the plan still contains material unresolved questions
- the plan reads like a feature spec rather than a finite implementation checklist
- the likely output should include orchestrator-ready project artifacts rather than only code edits

### 29.4 Accepting the recommendation: handoff to Chain Wizard / Interview

If the user accepts the recommendation, Assistant Chat MUST launch the Chain Wizard / Interview flow with a structured handoff bundle.

Required handoff payload fields:
- `handoff_source` (`assistant_chat` or `deep_plan`)
- `handoff_reason` (`feature_request`, `major_change`, `deep_plan_recommendation`, `user_explicit`, or similar deterministic enum)
- `origin_thread_id`
- `origin_message_id`
- `project_id` when available
- `project_path` when available
- `default_intent = EnhanceRewriteAdd`
- `user_goal`
- `requirements_summary`
- `scope_summary`
- `codebase_summary`
- `has_gui_hint`
- `plan_artifact_ref` when a plan exists
- `plan_todo_snapshot[]`
- `open_questions[]`
- `assumptions[]`
- `chat_excerpt_refs[]`

Handoff rules:
- imported context must be visible to the user; it must not be hidden system state
- the imported plan, if present, becomes contextual input for the wizard/interviewer rather than an immediate executable artifact
- the handoff must preserve the audit trail that the wizard was launched from Assistant Chat / Deep Plan

### 29.5 Wizard launch behavior from chat handoff

Launch behavior depends on available project context:
- if the current thread already has an active project/path, open the Chain Wizard in the preloaded `EnhanceRewriteAdd` flow with imported context ready for requirements/interview review
- if the current thread lacks required project context, open the Chain Wizard with the imported context preserved and land on the project-setup review path first

The interviewer must not start cold:
- imported context is available before the first interview question
- the imported plan may be opened as additional context for the interviewer
- the mandatory scope probe still runs; the imported context does not bypass phase 0

### 29.6 Acceptance criteria

- Ask mode is reachable by natural-language requests and visibly resolves to canonical runtime `ask`.
- Natural-language requests for Plan and Deep Plan resolve to workflow overlays plus canonical runtime `plan`.
- Assistant chat can recommend the Chain Wizard for feature/enhancement/major-change requests.
- Deep Plan can recommend the Chain Wizard after planning when the work is too large or too spec-like for chat-only execution.
- Accepting the recommendation opens the Chain Wizard / Interview flow with imported assistant context and, when present, the plan artifact reference/content.
- The imported handoff remains visible/auditable and does not silently create a repo file.

## Unified Thread Blocked-State Lifecycle
Canonical thread states:
- `active`
- `attention_required`
- `blocked`
- `completed`
- `failed`

Rules:
- `attention_required` means the active flow can continue inside the same clarification or review loop
- `blocked` means automation cannot continue until a prerequisite changes or a new explicit recovery action occurs
- blocked episodes are persisted as distinct episodes and MUST NOT be collapsed into one mutable thread flag
- thread-surface action buttons are rendered from ordered `allowed_action_ids[]` plus blocked metadata; chat does not invent thread-local recovery semantics

### Precedence
1. active node-blocked episode for the visible runtime context
2. active wizard-blocked episode
3. active `attention_required` clarification
4. historical blocked episodes

### Multi-episode display
- each `blocked_notice` renders as its own system message
- a thread with multiple active blocked episodes shows the highest-severity active badge plus a count indicator
- resolving one blocked episode updates only that episode; others remain active
- `validation_blocked` and `remediation_ceiling_exceeded` are ordinary members of the canonical blocked taxonomy and render through the same blocked-notice contract

### Persistence and restore rule
Thread blocked notices persist enough identity to restore the same blocked surfaces and action set after restart or resume.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

## Worktrees in Assistant

This section specifies the thread-level worktree binding feature: a per-thread worktree button in the chat header, worktree icon in the thread selector, merge-back flow, pre-merge test gate, and all associated lifecycle, data model, events, commands, settings, and error handling.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.1 Chat header worktree button

**Placement:** Chat header strip, after the Reasoning/effort control (rightmost existing control). The header strip currently contains: Platform, Model, Reasoning/effort. The Worktree button is appended after these. Mode buttons (Ask, Agent, Debug, Plan, Deep Plan) are separate from the header strip and not adjacent to this button.

**Visual states:**
- **Unbound (default):** Dimmed worktree glyph icon. No label text. Tooltip: "No worktree — click to create"
- **Bound, clean:** Lit/active worktree glyph icon. Tooltip shows branch name. No label text.
- **Bound, dirty:** Lit worktree glyph with a small dot indicator (same pattern as unsaved-file dot in editor tabs). Tooltip: branch name + "uncommitted changes"
- **Bound, conflict:** Lit worktree glyph with warning indicator (triangle). Tooltip: branch name + "merge conflict"

Icon colors resolve through theme tokens (`icon-secondary`, `accent-warning`, `accent-error`), not hardcoded hex values. Icon is ~32px and follows existing header overflow/min-width pattern.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Wiring_Matrix.md

**Dropdown contents when NO worktree bound:**

| Row | Type | Action |
|-----|------|--------|
| `None` | Selected label | No action (current state) |
| `Create Worktree…` | Action row | Opens Create Worktree dialog |

**Dropdown contents when worktree IS bound:**

| Row | Type | Action |
|-----|------|--------|
| Branch name | Info label (e.g. `assistant/fix-auth-bug`) | No action |
| Path | Info sublabel (truncated, e.g. `.puppet-master/worktrees/wt-3`) | No action |
| Status | Pill (clean/dirty/conflict) | No action |
| separator | --- | --- |
| `Unbind` | Action row | Detaches worktree from thread; worktree remains on disk |
| `Merge into Base…` | Action row | Opens merge confirmation dialog (squash/merge/rebase) |
| `Create PR…` | Action row | Opens PR creation panel with pre-filled fields |
| `Remove Worktree` | Action row (destructive) | Detaches AND prunes; shows confirmation if dirty |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

**Behavior rules:**
- Changing binding mid-thread is allowed; change applies to the next turn (same semantics as platform/model changes per §1.1)
- While a turn is in-flight, the dropdown is read-only (no binding changes during execution)
- `Unbind` sets thread binding to None; agent's next turn uses main project dir
- `Remove Worktree` calls `WorktreeManager::remove_worktree`, then sets binding to None
- Remove is blocked with error toast if worktree has an active run in any thread or orch tier
- The button is visible in all chat modes (Ask, Agent, Debug, Plan, Deep Plan)
- Hidden when the active project has no git repository

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/WorktreeGitImprovement.md

### W.2 Thread-to-worktree binding data model

Thread-to-worktree binding is durable, explicit, and identity-bearing.


**New redb key family:**
- Key: `thread_state:{thread_id}:worktree_binding`
- Value (JSON):
```json
{
  "worktree_id": "wt-abc123",
  "branch_name": "assistant/fix-auth-bug",
  "worktree_path": ".puppet-master/worktrees/wt-abc123",
  "bound_at_utc": "2026-03-26T02:45:00Z",
  "binding_origin": "manual | auto_create",
  "temp_branch_name": "assistant/thread-a1b2c3d4"
}
```
`temp_branch_name` tracks the original temporary branch name assigned before title generation. For UI display, always use `branch_name`; `temp_branch_name` is internal bookkeeping only.

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check whether a worktree is already bound to another thread.

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`.
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set.

**Worktree-aware same-file identity rules:**
- The canonical file identity for thread-bound chat, debug, Source Control, and GitHub pivots is `{ repo_id, worktree_id, relative_path }`; path alone is not sufficient.
- The same relative path in two worktrees is treated as two different open subjects unless a compare session explicitly binds them together.
- Thread-scoped opens default to the thread's bound `worktree_id`. If the thread has no bound worktree, the UI may fall back to the currently selected worktree but must label that fallback explicitly.
- Historical cards, receipts, and debug evidence remain pinned to the captured `worktree_id` even if the thread later rebinds to a different worktree.
- Merge-back, compare, and PR creation flows may intentionally bridge the bound worktree to a base branch, but they must preserve both identities rather than collapsing them into one generic path.

**1:1 enforcement:** One worktree per thread, one thread per worktree. If a user tries to bind a worktree already bound to another thread, the action is blocked with an explicit error and a deep link to the owning thread when available.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md
### W.3 Create worktree dialog

**Trigger:** "Create Worktree…" action from chat header dropdown.

**Dialog fields:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| Branch name | Text input | `assistant/thread-<short_id>` (temp name) | Must be valid git branch name. If branch already exists: advisory warning (user can Create Anyway or change name). |
| Base ref | Dropdown | Value of `branching.assistant_worktree_base_ref` or `branching.base_branch` if empty | Must be an existing branch/ref |

**Buttons:** `Create` (primary), `Cancel` (secondary)

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md

**Create flow:**
1. User clicks `Create Worktree…` in dropdown
2. Dialog opens with pre-filled temp branch name and base ref
3. User optionally edits branch name and/or base ref
4. User clicks Create
5. Backend calls `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)` where `worktree_path` is auto-generated under `.puppet-master/worktrees/`
6. On success: new `worktree_record` written to redb; `thread_state:{thread_id}:worktree_binding` written; `chat.thread_worktree_bound` seglog event emitted; dialog closes; chat header button updates to bound state
7. On failure: dialog stays open with inline error (e.g. "Branch already exists", "Git error: ..."); retry or cancel
8. Thread selector icon appears immediately on binding

**Branch name collision in create dialog:** Warning in dialog: "Branch '{name}' already exists. Creating a worktree on the same branch as another worktree may cause interference." Buttons: "Create Anyway" (proceeds) / "Use Different Branch" (clears field, focuses input). Advisory only.

**Loading state:** While creation is in progress: chat header button icon shows a subtle pulse/loading indicator; dropdown is disabled; dialog Create button disabled + loading ("Creating…"). On success: dialog closes, button transitions to bound. On failure: dialog returns to interactive with inline error.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Wiring_Matrix.md

### W.4 Auto-create flow (when setting is on)

**Trigger:** New thread creation while `branching.assistant_auto_worktree` is `true`.

**Step by step:**
1. User creates new thread (via `cmd.chat.new` or first message in fresh chat)
2. Chat runtime checks `branching.assistant_auto_worktree` setting
3. If true: Chat runtime calls `WorktreeManager::create_worktree(temp_branch_name, base_ref)` synchronously BEFORE first turn dispatch
4. On success: binding created immediately; thread starts with worktree active
5. On failure: thread created without worktree; warning toast "Could not create worktree: {error}. Thread will use project root."; user can manually create later via dropdown
6. **Title rename flow:** Triggered by the `chat.thread_title_generated` event. System then:
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip invalid chars, truncate to 50 chars)
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until unique (silent — no user dialog since this is auto-create)
   d. Call `git branch -m <temp_name> <target_name>` inside the worktree
   e. Update `worktree_record` and `thread_state` binding with new branch name
   f. Emit `chat.thread_worktree_renamed` seglog event
   g. On rename failure: keep temp name, no user interruption, log warning

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

**Ownership:** Chat runtime owns the auto-create call. Executor never invokes WorktreeManager directly for thread worktree creation.

**Concurrent auto-create:** `WorktreeManager::create_worktree` is serialized per project (mutex/lock) to prevent racing. The reverse lookup key write is atomic (redb transaction). If a create fails due to race, auto-create retry logic attempts with the next suffix. Auto-create does NOT retry on non-race failures.

### W.5 Settings — Branching tab

**New settings (project-level, persisted in redb):**

| Setting key (redb) | Type | Default | UI label | Description |
|-----|------|---------|----------|-------------|
| `config:project:{pid}:branching.assistant_auto_worktree` | bool | `false` | "Auto-create worktree for new assistant threads" | When true, new threads auto-create a worktree |
| `config:project:{pid}:branching.assistant_worktree_cleanup_default` | enum(`ask`, `keep`, `remove`) | `ask` | "When deleting a thread with a worktree" | Default cleanup behavior; `ask` shows modal |
| `config:project:{pid}:branching.assistant_worktree_base_ref` | string | `""` (empty = use `base_branch`) | "Base branch for assistant worktrees" | Override base ref; empty inherits from branching.base_branch |
| `config:project:{pid}:file_manager.worktree_follow_thread` | bool | `true` | "File manager follows active thread's worktree" | When true, file manager switches on thread focus |
| `config:project:{pid}:branching.worktree_warning_threshold` | integer | `10` | "Worktree count warning threshold" | Show advisory toast when total worktrees exceed this count; 0 = disabled |
| `config:project:{pid}:branching.worktree_create_timeout_s` | integer | `30` | "Worktree creation timeout (seconds)" | Abort `git worktree add` if it exceeds this duration |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test` | bool | `true` | "Run tests before merging worktree" | When true, runs test command and blocks merge on failure |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_cmd` | string | `""` (empty = auto-detect) | "Pre-merge test command" | Override auto-detected test command |
| `config:project:{pid}:branching.worktree_pre_merge_test_timeout_s` | integer | `300` | "Pre-merge test timeout (seconds)" | Abort test run if it exceeds this duration |
| `config:project:{pid}:branching.assistant_worktree_pre_merge_test_target` | enum(`merged_result`, `branch_only`) | `merged_result` | "What to test before merge" | `merged_result` tests integrated state; `branch_only` tests branch in isolation |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

**UI placement:** Settings > Branching tab, new subsection "Assistant Worktrees" below existing branching controls. Settings grouped into visual sub-groups:
- **Creation:** auto_worktree, base_ref, create_timeout_s
- **Merge & Testing:** pre_merge_test, pre_merge_cmd, pre_merge_test_timeout_s, pre_merge_test_target
- **Behavior:** cleanup_default, file_manager.worktree_follow_thread, warning_threshold

**Namespace note:** `file_manager.worktree_follow_thread` uses the `file_manager.*` namespace (not `branching.*`) because it controls file manager behavior. `assistant_worktree_*` prefix = assistant-specific; `worktree_*` prefix = generic all-worktree settings.

**Settings validation:**

| Setting key | Min | Max | Zero behavior | Widget |
|-------------|-----|-----|---------------|--------|
| `worktree_warning_threshold` | 0 | 100 | Disabled (no warning) | Numeric stepper |
| `worktree_create_timeout_s` | 5 | 300 | Clamp to 5 | Numeric stepper |
| `worktree_pre_merge_test_timeout_s` | 30 | 1800 | Clamp to 30 | Numeric stepper |

Out-of-range values from settings file edits are clamped to nearest valid bound on load with a log warning.

### W.6 Thread selector — worktree icon

**Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention).

- **Icon:** Theme-consistent branch/tree glyph from icon set (not emoji)
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Line 1: Branch name. Line 2: Status pill text (clean/dirty/conflict). Line 3: Worktree path.
- **Icon color/state:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)".

### W.7 Cleanup flow (thread delete)

**Trigger:** Thread is deleted while it has a worktree binding.

**Integration:** Cleanup options are embedded into the existing delete confirmation dialog — not shown as a separate modal.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

**Flow:**
1. User initiates thread delete
2. System checks `thread_state:{thread_id}:worktree_binding`
3. If no binding: standard delete confirmation, proceed normally
4. If binding exists, check `branching.assistant_worktree_cleanup_default` setting:
   - `ask` (default): show extended delete confirmation
   - `keep`: standard confirmation; on confirm, silently unbind, keep worktree on disk
   - `remove`: standard confirmation; on confirm, silently remove worktree if clean; if dirty, fall through to `ask` behavior
5. **Extended delete confirmation (when `ask`):**
   - Title: "Delete thread?"
   - Body: "This thread is bound to worktree `assistant/fix-auth-bug`."
   - If dirty: additional warning line: "This worktree has uncommitted changes."
   - Button 1: "Delete and keep worktree" (secondary style)
   - Button 2: "Delete and remove worktree" (destructive style; if dirty, label becomes "Delete and remove worktree (has changes)")
   - Button 3: "Cancel" (tertiary style, default focus)
6. Force-remove dirty worktree uses `git worktree remove --force <path>` + `git branch -D <branch>`
7. After cleanup: `chat.thread_worktree_unbound` seglog event emitted with appropriate `reason`

### W.8 Merge-back flow

**Four access paths (all equivalent in outcome):**

| Path | Entry point | Notes |
|------|-------------|-------|
| Chat header dropdown | "Merge into Base…" / "Create PR…" actions | Primary UI path |
| Source Control worktree section | "Merge" / "Create PR" buttons in expanded worktree row | Secondary UI path |
| Slash commands | `/worktree merge [--squash\|--rebase]`, `/worktree pr` | Keyboard-driven; default squash |
| Natural language in chat | User says "merge my changes into main" | Agent triggers dialog pre-filled with inferred strategy |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

#### W.8.1 Merge confirmation dialog

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Strategy | Segmented control: `Squash` / `Merge` / `Rebase` | `Squash` | Squash = single clean commit; Merge = merge commit preserving history; Rebase = replay on top of base |
| Target branch | Dropdown | From `branching.assistant_worktree_base_ref` or `branching.base_branch` | Must be existing local branch |
| Commit message | Text area (multi-line) | Auto-generated per strategy | Editable; only shown for Squash and Merge (hidden for Rebase) |

**Buttons:** `Merge` (primary, label changes per strategy), `Cancel`

**Dialog reactive behavior:** Squash selected → commit message visible (concatenated commits). Merge selected → commit message visible ("Merge assistant/{title} into {target}"). Rebase selected → commit message hidden. User edits preserved across strategy switches.

#### W.8.2 Pre-merge guards

| Condition | Behavior |
|-----------|----------|
| Worktree has uncommitted changes | Block merge. Warning: "Worktree has uncommitted changes. Commit or stash before merging." Button disabled. |
| Worktree has merge conflicts | Block merge. Warning: "Resolve existing conflicts before merging." Button disabled. |
| Active run in worktree | Block merge. "Cannot merge while a run is active." |
| Target branch deleted | Error if deleted between dialog open and confirm |
| Worktree on detached HEAD | Block merge/PR. "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." |
| Main repo dirty (squash/merge + merged_result) | Block. "Cannot run pre-merge test: main repo has uncommitted changes." |

#### W.8.3 Merge execution

**Critical:** Merge executes in the main repo working tree, NOT inside the worktree. Exception: Rebase step 1 (`git rebase {target}`) runs in the worktree; step 3 (`git merge --ff-only`) runs in the main repo.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

**Exclusive merge lock:** `.git/pm-merge.lock` (main repo). Acquired BEFORE guard checks for atomicity. Guards fail → lock released immediately. Lock held → ALL merge buttons project-wide disabled.

**Lock file format:** `{ "pid": <int>, "started_utc": "<ISO8601>", "worktree_id": "<string>", "strategy": "<string>" }`

**Stale lock recovery:** On startup (lazy), if PID dead or lock older than 5 minutes → auto-remove. Toast: "Stale merge lock cleaned up."

**Execution steps (when pre-merge test disabled):**
- **Squash:** `git checkout {target}` → `git merge --squash {branch}` → `git commit -m "{message}"`
- **Merge:** `git checkout {target}` → `git merge --no-ff {branch} -m "{message}"`
- **Rebase:** (in worktree) `git rebase {target}` → (in main repo) `git checkout {target}` → `git merge --ff-only {branch}`

**Auto-fetch:** `git fetch origin {target}` before merge. Proceeds with local state if offline (advisory toast).

**Rebase is non-interactive only.** Interactive rebase → use terminal.

**Commit authorship:** User's git identity (`user.name`/`user.email`). No AI co-author injection.

**Git hooks:** NOT bypassed. Hook failure = merge failure with Retry/Cancel.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

#### W.8.4 Post-merge behavior

Modal: "Branch `assistant/{title}` has been merged into `{target}`."
- "Keep worktree" — worktree remains bound
- "Remove worktree" — unbind + prune
- "Cancel" — dismiss, worktree stays

Default follows `branching.assistant_worktree_cleanup_default` setting.

**No undo for completed merge.** User can `git reset`/`git revert` via terminal or agent bash.

#### W.8.5 Conflict resolution

- **UI-initiated:** Conflict markers in files → Source Control Changes → existing `cmd.git.conflict_apply_resolution` flow
- **NL-initiated:** Agent resolves conversationally — reads markers, proposes resolutions, edits files
- **Rebase conflicts during `git rebase {target}`:** Auto-abort (`git rebase --abort`). Dialog shows error. Tests never run. Lock released.

#### W.8.6 Create PR flow

Opens existing PR creation panel from GitHub_Integration.md §B with pre-filled fields: title (thread title), body (commit messages), target branch, source branch.

**Auto-push:** `git push -u origin {branch}` before PR panel opens. Push failure → error toast, PR panel does NOT open.

**Guard:** Requires configured GitHub remote.

**Post-PR:** Worktree stays bound (PR open, may push more commits). No cleanup modal.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### W.8.7 Natural language merge

The agent emits a structured system action `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash|merge|rebase", "target_branch": "string", "commit_message": "string" } }`. PM shows dialog pre-filled with agent's parameters. User confirms or cancels.

**Mode guard:** Agent-NL invocation rejected in Ask/Plan mode. User UI clicks always allowed.

**Chaining:** Agent can chain commit → merge → cleanup in single conversational exchange.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Modes.md

### W.9 Pre-merge test gate

**Purpose:** Before committing a merge, run the project's test suite against the merged result to verify integration.

**Settings:** `branching.assistant_worktree_pre_merge_test` (bool, default true), `branching.assistant_worktree_pre_merge_cmd` (string, default empty = auto-detect), `branching.worktree_pre_merge_test_timeout_s` (int, default 300, clamped [30, 1800]), `branching.assistant_worktree_pre_merge_test_target` (enum merged_result|branch_only, default merged_result).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### W.9.1 Auto-detection of test command

| File detected | Verification | Inferred command | Priority |
|---------------|-------------|-----------------|----------|
| `package.json` | `scripts.test` field exists and non-empty | `npm test` | 1 |
| `Cargo.toml` | File presence | `cargo test` | 2 |
| `pyproject.toml` | `[tool.pytest]` or `pytest` in deps | `pytest` | 3 |
| `setup.py` or `setup.cfg` | File presence | `python -m pytest` | 4 |
| `Makefile` | Contains `test:` target | `make test` | 5 |
| `build.gradle` or `build.gradle.kts` | File presence | `./gradlew test` | 6 |
| `pom.xml` | File presence | `mvn test` | 7 |
| `Gemfile` | File presence | `bundle exec rake test` | 8 |
| `go.mod` | File presence | `go test ./...` | 9 |

Multiple matches → highest priority. Persisted command overrides auto-detection. Clear setting to re-run auto-detect.

**First run:** Auto-detected command shown pre-filled; "Change" link for inline edit; confirmed command persisted.

**No detection + enabled:** Info row "No test command detected" with Settings link. Test step skipped (merge NOT blocked).

#### W.9.2 Execution flow with test gate

**For `merged_result` target (default):**

| Strategy | Steps |
|----------|-------|
| **Squash** | Fetch → checkout target → `git merge --squash {branch}` → **run tests** (staged, uncommitted) → pass: `git commit` / fail: `git reset --hard HEAD` |
| **Merge** | Fetch → checkout target → `git merge --no-ff --no-commit {branch}` → **run tests** → pass: `git commit` / fail: `git merge --abort` |
| **Rebase** | (worktree) `git rebase {target}` → **run tests** (worktree has rebased state) → pass: (main) `git checkout {target}` → `git merge --ff-only {branch}` / fail: `git rebase --abort` |

**For `branch_only` target:** Tests run in worktree against branch as-is BEFORE any merge. Failure blocks merge (with override). Rebase + branch_only: tests run BEFORE rebase begins.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

#### W.9.3 Test dialog UX

Dialog transitions in-place to test phase. Fields become read-only. Live output in scrollable monospace region (~200px max-height). Cancel aborts test + cleanup.

- **Pass (exit 0):** Auto-proceed to commit. Brief "Tests passed" indicator.
- **Fail (exit ≠ 0):** Red header "Tests failed" + full output + "Merge Anyway" (secondary/destructive) + "Cancel" (primary). Override proceeds to commit; seglog records override.
- **Timeout:** Same UI as failure.
- **Process error:** Same UI with error message.

**Test execution environment:** Working directory depends on strategy and target. Shell: `/bin/sh -c "{command}"` (Unix), `cmd /c "{command}"` (Windows). No PM environment injection. Stdout + stderr merged. Remote SSH: executes on remote host.

**Output handling:** 1MB cap; ANSI stripped; UTF-8 lossy decode; CRLF normalized to LF.

**Crash recovery:** Orphaned test process. Main repo in transitional state. WorktreeManager reconciliation detects `.git/MERGE_HEAD` or `.git/rebase-merge/` on next launch.

**Test gate does NOT apply to PR creation** (delegates to GitHub CI).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.10 Seglog events (11 total)

| Event type | Fields | Description |
|------------|--------|-------------|
| `chat.thread_worktree_bound` | `thread_id`, `worktree_id`, `branch_name`, `worktree_path`, `binding_origin` (`manual` \| `auto_create`) | Thread bound to worktree |
| `chat.thread_worktree_unbound` | `thread_id`, `worktree_id`, `reason` (`user_unbind`, `user_remove`, `thread_delete`, `path_missing`) | Thread unbound from worktree |
| `chat.thread_worktree_renamed` | `thread_id`, `worktree_id`, `old_branch_name`, `new_branch_name` | Branch renamed after title generation |
| `chat.thread_worktree_create_failed` | `thread_id`, `error`, `binding_origin` | Worktree creation failed |
| `chat.thread_worktree_merged` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `result_commit_sha` | Worktree branch merged |
| `chat.thread_worktree_merge_failed` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `strategy`, `error`, `has_conflicts` | Merge attempt failed |
| `chat.thread_worktree_pr_created` | `thread_id`, `worktree_id`, `branch_name`, `target_branch`, `pr_url`, `pr_number` | PR created |
| `chat.thread_worktree_pr_failed` | `thread_id`, `worktree_id`, `branch_name`, `error`, `phase` (`push` \| `api`) | PR creation failed |
| `chat.thread_worktree_pre_merge_test_started` | `thread_id`, `worktree_id`, `command`, `test_target`, `strategy` | Pre-merge test started |
| `chat.thread_worktree_pre_merge_test_passed` | `thread_id`, `worktree_id`, `command`, `duration_ms`, `strategy` | Tests passed |
| `chat.thread_worktree_pre_merge_test_failed` | `thread_id`, `worktree_id`, `command`, `exit_code`, `duration_ms`, `strategy`, `user_override` | Tests failed |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### W.11 Command catalog

| Command ID | Slash command | Parameters | Surface |
|------------|---------------|------------|---------|
| `cmd.chat.worktree.create` | `/worktree create` | `{ thread_id, branch_name?, base_ref? }` | Chat dropdown, command palette |
| `cmd.chat.worktree.unbind` | `/worktree unbind` | `{ thread_id }` | Chat dropdown, command palette |
| `cmd.chat.worktree.remove` | `/worktree remove` | `{ thread_id }` | Chat dropdown, command palette |
| `cmd.chat.worktree.merge` | `/worktree merge [--squash\|--rebase]` | `{ thread_id, strategy?, target_branch?, message? }` | Chat dropdown, SC, command palette |
| `cmd.chat.worktree.pr` | `/worktree pr` | `{ thread_id, title?, body?, target_branch? }` | Chat dropdown, SC, command palette |
| `cmd.chat.worktree.info` | `/worktree` | `{ thread_id }` | Chat, command palette |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

**Command visibility/enablement conditions:**

| Command | Visible when | Enabled when |
|---------|-------------|-------------|
| `cmd.chat.worktree.create` | No binding AND project has git | Always (when visible) |
| `cmd.chat.worktree.unbind` | Has binding | No active run |
| `cmd.chat.worktree.remove` | Has binding | No active run |
| `cmd.chat.worktree.merge` | Has binding (or SC row) | No active run AND no merge lock AND not dirty AND no conflicts AND not detached HEAD |
| `cmd.chat.worktree.pr` | Has binding AND has GitHub remote | No active run AND not detached HEAD |
| `cmd.chat.worktree.info` | Has binding | Always (read-only) |

### W.12 File manager worktree context

When user switches to a thread with a worktree binding (and `file_manager.worktree_follow_thread` is `true`), the file manager switches root to show the worktree's file tree.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

**Breadcrumb indicator:** Worktree glyph + branch name + swap toggle icon at top of file manager tree. Clicking swap toggles between worktree root and main project root. Binary toggle. Toggle resets on ANY thread switch.

**Accessible label:** "Viewing worktree assistant/fix-auth. Click to switch to project root." (and inverse)

**Rules:**
- Open editor tabs NOT affected by root switch — tabs retain own paths
- File manager search scope follows current file manager root
- `@file` resolves relative to thread's `working_directory` (worktree root when bound)
- Quick-open (Ctrl+P) remains project-scoped regardless of worktree context
- If thread unbound mid-session: file manager falls back to project root with toast "Worktree unbound — showing project root."

### W.13 LSP worktree awareness

LSP sessions are already keyed by `(host_id, server_id, root_identity)`. Different worktree path = different root_identity = naturally separate LSP session. No new keying model needed.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md

**Thread focus change flow:** File manager root changes → LSP client sends `workspace/didChangeWorkspaceFolders` or new session initialized (lazy). Diagnostics/hover/completion operate against worktree file state.

**LSP session lifecycle:** Created on first file open from worktree. Idle-collected after 5 minutes with no open files (configurable). Destroyed when worktree removed.

### W.14 Remote SSH projects

Worktree creation follows project host authority. For remote SSH projects, `WorktreeManager` executes on remote host via SSH subprocess. No silent local fallback. All paths (worktree, FileSafe working_directory, terminal cwd) use remote filesystem.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Executor_Protocol.md

### W.15 Error handling

| Error scenario | User-visible behavior |
|---------------|----------------------|
| `create_worktree` fails | Dialog stays open with inline error; retry or cancel |
| Auto-create fails | Thread created without worktree; warning toast |
| Branch rename fails after title gen | Keep temp name; no user interruption; log warning |
| Worktree path no longer exists | On next focus: detect, toast, auto-unbind with reason `path_missing` |
| Remove blocked by active run | Error toast; Remove button disabled |
| Branch name collision | Auto-append `-2`, `-3`… up to 10 attempts; dialog error if all collide |
| 1:1 violation attempt | Error toast "Already bound to thread '{title}'" |
| Merge conflict | Dialog closes; conflict markers in files; SC highlights; existing resolution flow |
| Concurrent merge (lock contention) | Error toast "Another merge in progress"; all Merge buttons disabled |
| Test not found | Dialog shows error; Retry / Merge Anyway / Cancel |
| Test timed out | Dialog shows timeout + Merge Anyway / Cancel |
| Test output > 1MB | "[OUTPUT TRUNCATED]"; does not affect pass/fail |
| Detached HEAD: merge/PR | Dialog error; buttons disabled |
| Git hook rejects commit | "Merge failed: {hook} rejected commit"; Retry / Cancel |
| Stale merge lock at startup | Auto-remove if PID dead or >5 min; advisory toast |
| Project switch with bound worktree | Button disabled; tooltip "Worktree belongs to project '{name}'"; no auto-unbind |
| Worktree unbound mid-merge dialog | Dialog shows error and closes; no merge executed |
| Revert with deleted worktree path | File-not-found error |

### W.16 Acceptance criteria

**Chat header worktree button:** (AC-1) Button visible in all modes; (AC-2) Dropdown correct per binding state; (AC-3) Create dialog works; (AC-4) Unbind detaches without deleting; (AC-5) Remove detaches and prunes; (AC-6) Icon state updates reactively; (AC-7) Binding change applies next turn; (AC-8) Read-only during in-flight turn.

**Settings:** (AC-9) Auto-create toggle works; (AC-10) Cleanup default controls modal; (AC-11) FM follow setting works; (AC-12) Settings persist across restart.

**Thread selector icon:** (AC-13) Appears on bind; (AC-14) Disappears on unbind; (AC-15) Color reflects status; (AC-16) Tooltip shows info.

**File manager:** (AC-25) Switches root on focus change; (AC-26) Breadcrumb toggle works; (AC-27) Toggle resets on switch; (AC-28) Editor tabs unaffected.

**LSP:** (AC-29) Diagnostics reflect worktree state; (AC-30) Lazy-init per worktree; (AC-31) Idle-collected.

**Lifecycle:** (AC-32) Auto-create temp name + rename; (AC-33) Collision suffix; (AC-34) Cleanup modal on delete; (AC-35) 1:1 enforced.

**Merge-back:** (AC-66) Merge dialog with strategy; (AC-67) PR panel with pre-fill; (AC-68) SC row buttons; (AC-69) Slash commands work; (AC-70) NL merge shows dialog; (AC-71) Dirty blocks merge; (AC-72) Conflict resolution; (AC-73) Post-merge cleanup; (AC-77) All modes including Debug; (AC-83) NL merge requires confirmation even in yolo; (AC-84) Ask/Plan NL guard.

**Pre-merge test gate:** (AC-86) Tests merged result; (AC-87) Auto-detect; (AC-88) First-run pre-fill; (AC-89) Failure override UI; (AC-92) Clean rollback; (AC-94) Not for PR; (AC-95) Exclusive lock; (AC-99) Remote SSH executes remotely.

### W.17 Non-goals (explicit)

- No emojis in the GUI
- No changes to orchestrator's own worktree management (lanes, tiers)
- Git submodules out of scope
- No "Bind Existing" in MVP
- No undo for unbind or merge in MVP
- No per-merge command override in MVP
- App uninstall does NOT auto-clean worktrees
- No inline chat history markers for worktree context changes
- Terminal context (cwd) for worktree-bound threads follows worktree path; no special terminal management
- Changes section always shows main repo (worktree-scoping Changes is not MVP)
- No thread export of worktree binding metadata
- No orchestrator-to-assistant worktree transfer on handoff
