# Assistant & Chat UI -- Design Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary

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

This plan's **UX requirements** remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- **Core:** Providers + unified event model + deterministic agent loop (OpenCode-style)
- **Storage/search:** seglog/redb/Tantivy projections (not chat-history SQLite). Implementation checklist and chat mapping: Plans/storage-plan.md.
- **UI:** Rust + Slint (not Iced)
- **Tooling:** central tool registry + policy engine; tool approvals and results flow through the unified event stream
- **Auth:** subscription-first; **Gemini API key is the explicit allowed exception** (subscription-backed)

Any references in this plan to current UI widget implementation details should be treated as illustrative; the behavior and data contracts are what must remain stable.

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
19. [Documentation Audience (AI Executor)](#19-documentation-audience-ai-executor)  
20. [References](#20-references)  
21. [Dashboard Warnings and Calls to Action](#21-dashboard-warnings-and-calls-to-action)  
22. [Live Testing Tools and Hot Reload](#22-live-testing-tools-and-hot-reload)  
23. [Gaps, Competitive Comparison, and Enhancements](#23-gaps-competitive-comparison-and-enhancements)  
24. [Chat thread performance, virtualization, and flicker avoidance](#24-chat-thread-performance-virtualization-and-flicker-avoidance)
25. [Context Circle Enhancements (Addendum -- 2026-02-23)](#25-context-circle-enhancements-addendum----2026-02-23)
26. [Per-Pass Validation Model/Provider Settings (Invariant Sweep)](#26-per-pass-validation-modelprovider-settings-invariant-sweep)

---

## 1. Modes Overview

| Mode       | Description |
|-----------|-------------|
| **Ask**   | Read-only. No edits, no execution. Agent explains and researches only. |
| **Plan**  | **Read-only until you execute.** Puppet Master-owned flow: clarifying questions (required) → research → plan + todo; then run or add to queue (see below). Until the user runs the plan, the agent does not edit or execute. See §8. |

**Plan Output Execution — Queue Applicability (Resolved):**
Plan output can be "run immediately" or "added to queue" depending on the current state:
- **Add to queue:** When a run is already active in the current thread (Interview mode, Crew mode, or any in-progress run). The plan joins the FIFO queue.
- **Run immediately:** When no run is active (idle state). In Ask mode and idle Plan mode, plan output executes immediately.
- Queue is not applicable when the system is idle — there is nothing to queue behind.
| **Interview** | Switches to interview flow (reduced phases when from Assistant); at end: Do now or Add to queue. |
| **BrainStorm** | Multi-model collaboration: same plan, shared context, subagents can talk to each other; on execute, chat switches to Agent mode. See §18. |
| **Crew**  | User invokes crew (button or "use a crew"); must work together with Plan mode. See §15. |

**Requires a project:** Many chat features (e.g. @ file mention, File Manager, project-specific commands, running the Assistant with project context) **do not work when no project is selected**; when no project is selected, only application rules apply and project-scoped actions are unavailable or disabled.

### 1.1 Chat controls: platform, model, and reasoning/effort (OpenCode-style)

The **chat window** must allow the user to change **platform**, **model**, and **reasoning/effort** at any time, without leaving the chat. This matches OpenCode desktop behavior where the session UI exposes provider and model selection (and optionally effort) in the titlebar or prompt area so the user can switch before sending the next message.

**Required controls (placement: chat header or footer strip, same area as the context circle):**

| Control | Requirement |
|--------|--------------|
| **Platform** | **Dropdown** listing available platforms (Cursor, Codex, Claude Code, Gemini, GitHub Copilot). Selection applies to the **current thread**; next message uses the selected platform. Data from `platform_specs`; no hardcoding. |
| **Model** | **Dropdown** listing models for the **currently selected platform**. List is **dynamically discovered** (e.g. from platform CLI: `agent models`, `claude --list-models`, `gemini models`, etc.) and **cached**. **Customizable:** User can manage the model list (e.g. add/remove models, reorder, or mark favorites) via Settings or a "Manage models" entry point from the dropdown (OpenCode desktop adds a manage-models icon next to the selector so the user can open the models dialog without leaving the session). Fallback: when discovery fails, use `platform_specs::fallback_model_ids(platform)`. |
| **Reasoning / effort** | Shown **only when the platform supports it** (per `platform_specs::supports_effort(platform)`). **Claude Code:** dropdown or toggle (e.g. low / medium / high) -- maps to `CLAUDE_CODE_EFFORT_LEVEL`. **Codex / Copilot:** dropdown (e.g. Low, Medium, High, Extra High). **Cursor:** no separate control -- reasoning is encoded in model names (e.g. `sonnet-4.5-thinking`); model dropdown is sufficient. **Gemini:** no effort support; hide the control. |

**Definition: Turn.** A *turn* is one complete user→agent exchange: one user message plus the full agent response (including all tool calls, streaming output, and final result). Changing platform, model, or effort level takes effect on the **next turn** — the current response completes with the previous selection. If the user changes settings while an agent response is streaming, the change applies after that response finishes.

**Behavior:** Changing platform/model/effort applies to the **next turn** (see definition above); the current run (if any) continues with the previous selection unless the user stops it. **Context is passed along** when the user switches: conversation context is re-packed for the new model's limits and format (see §17). Slash command **`/model`** (or equivalent) can open the model selector or a quick-switch dialog for keyboard users.

**Reference:** OpenCode desktop -- provider and model selection in the session UI; "Manage models" icon next to the model selector (e.g. [anomalyco/opencode PR #9722](https://github.com/anomalyco/opencode/pull/9722)); model list from server/CLI discovery and user-managed models. We follow the same pattern: dropdowns in the chat footer/header, dynamic model list, optional "Manage models" from the chat.

---

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
- **Error and failure UX:** When the CLI fails, times out, or returns an error, the thread must show a **clear error state**: the error message (or a user-friendly summary) and, where applicable, **Retry** and **Cancel** (or Dismiss) actions. Retry re-sends the last user message (or re-runs the same request); Cancel dismisses the error and leaves the queue unchanged. Failed runs do not consume a queued message unless the user explicitly retries; the queue remains so the user can edit, send now, or clear. If the failure was due to a platform or network issue, the UI can suggest switching platform or model (see §12 rate limit hit).

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

---

## 5. Commands (slash commands and custom commands)

- **Slash commands in the GUI:** The app supports **slash commands** (e.g. `/new`, `/model`, `/export`, `/compact`, `/stop`) invoked by typing `/` in chat or via a command palette. Unlike CLIs, slash commands here are a first-class GUI feature so the user can run actions without leaving the chat.
- **Application-wide and project-wide commands:** Commands can be **application-wide** (apply everywhere) or **project-wide** (apply when that project is active). Configuration lives **near Project/Application Rules** (similar to Cursor's rules), so the user manages commands and rules in the same area.
- **User-customizable:** The user can **customize** what commands do: add new slash commands, change behavior of built-in ones (where allowed), or define custom actions (e.g. run a script, inject a prompt template). Custom commands are stored **per application** (e.g. in app config or user data dir) or **per project** (e.g. in `.puppet-master/` or project root); the same UI that manages Application/Project Rules (Plans/agent-rules-context.md) hosts command definitions so the user edits commands and rules in one place. Custom commands are invoked with `/` like built-ins. **No conflicting names:** the app does **not** allow the user to define a custom command whose name clashes with a built-in; if they try, the UI explains why (e.g. "This name is reserved for a built-in command").
- **Reserved Slash Commands (Canonical List):**

| Command | Action | Scope |
|---------|--------|-------|
| `/new` | Start a new thread | Chat |
| `/model` | Switch model for next turn | Chat |
| `/effort` | Set effort/reasoning level | Chat |
| `/mode` | Switch mode (Ask/Plan/Interview/BrainStorm/Crew) | Chat |
| `/export` | Export thread as Markdown/JSON | Chat |
| `/clear` | Clear current thread history | Chat |
| `/help` | Show available commands | Global |
| `/settings` | Open settings panel | Global |
| `/doctor` | Run Doctor health checks | Global |
| `/cancel` | Cancel current run | Chat |
| `/stop` | Stop streaming response | Chat |

User-defined custom commands MUST NOT use any reserved command name. Custom commands are prefixed with `/x-` by convention (e.g., `/x-deploy`).

This list is the SSOT. The canonical machine-readable list is in Plans/UI_Command_Catalog.md.

### 5.1 Git & GitHub Slash Commands

Git and GitHub commands are available in chat when the active project is a git repository. All git operations executed via chat use the same code path as the Git panel (Plans/GitHub_Integration.md §A) — they are not separate implementations. ContractRef: Plans/GitHub_Integration.md, Plans/DRY_Rules.md

**Git commands (slash commands):**

| Command | Description | Error behavior |
|---------|-------------|----------------|
| `/git status` | Show current branch, staged/unstaged file count, sync state | Shows "(no repo)" if not a git repo |
| `/git commit <message>` | Commit all staged changes with the given message | "Nothing staged" if no staged files |
| `/git stage <file>` | Stage a specific file (or `.` for all) | "File not found" or "Already staged" |
| `/git push` | Push current branch to tracking remote | Shows auth-expired or unreachable error |
| `/git pull` | Pull with rebase (default) | Shows conflict file list on conflict |
| `/git sync` | Pull then push (equivalent to Sync button) | Stops at first error, shows which step failed |
| `/git branch <name>` | Create and switch to a new branch | "Invalid branch name" on bad chars |
| `/git stash` | Stash all uncommitted changes | "Nothing to stash" if working tree clean |
| `/git log [N]` | Show last N commits (default 10) in chat as a formatted list | — |

**GitHub Actions commands:**

| Command | Description | Error behavior |
|---------|-------------|----------------|
| `/actions` | List recent workflow runs for the current repo with status/log summary fields | "Not linked to GitHub" if no github_api auth |
| `/actions run <workflow>` | Trigger a workflow_dispatch workflow by name | "Permission denied" (403) or "No workflow_dispatch trigger" |
| `/actions logs <run-id>` | Fetch and show log tail (last 200 lines) plus status/log summary for the run | "Run not found" |

- GitHub commands require `github_api` auth realm (ContractRef: Plans/GitHub_API_Auth_and_Flows.md §auth-realm-split)
- If not authenticated, commands show inline device-code auth prompt
- All command outputs are rendered as structured chat messages (not raw terminal output)
- Command outputs include a "Open Git Panel" / "Open Actions Panel" deep-link button
- `/actions` and `/actions logs` outputs MUST include the same summary fields defined by `Plans/GitHub_Integration.md §B.3`:
  run status, run conclusion, run duration, failed job count, log truncation state, and last log timestamp.
- `/actions` command failures MUST mirror `Plans/GitHub_Integration.md §B.3` failure-state semantics for auth/rate-limit/list/detail/log failures so chat and panel behavior stay consistent.

---

## 6. Teach

- **Concept:** Users can ask the Assistant how to use Puppet Master (platform, modes, queues, etc.). No separate "Teach" sidebar or inline tips component is required.
- **Implementation:** Give the chat bot access to information on how Puppet Master works (e.g. inject or retrieve from docs: REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, platform CLI sections, mode descriptions). The same chat surface is used; the user just asks ("How does Plan mode work?", "How do I add to the queue?"). **Build requirement:** The documentation that Teach uses (REQUIREMENTS.md, ARCHITECTURE.md, AGENTS.md, GUI_SPEC.md, and any other canonical docs referenced above) must be built or validated when the rest of the project is built so it is always available to the Assistant.
- **Document rendering rule (required):** Chat must not render full document bodies for requirements, PRD, phase docs, contract seeds, or other long artifacts. Teach responses use concise summaries plus pointers to review surfaces.
- **Optional enhancements (in chat):** Structured tips tied to current mode/platform, short copy-pasteable "how to" snippets, and "How does [platform] work?" or "How does Plan mode work?" flows that inject a short summary/snippet with pointers, not full documents. All of this is delivered **through the chat**, not a separate UI.
- **Export conversation:** The user can **export the current thread** (messages and optionally agent tool summary) to **Markdown or JSON** for backup, sharing, or compliance. Available via slash command (e.g. `/export`) or a menu action.

---

## 7. Attachments, Web Search, and Extensibility

- **Files and photos:** User can add files to the chat, especially **photos**, so the agent has visual and file context. **Paste** (e.g. image from clipboard) and **drag-drop** into the composer are supported; same attachment pipeline as "add files." Attachments are included in the context sent to the platform CLI (per platform capabilities; all five platforms support images per AGENTS.md).
- **Web search (cited):** The agent must be able to **search the web with citations** when appropriate (e.g. via MCP or a dedicated web-search tool). Results must include **inline citations** and a **Sources:** list (URLs and titles) so the user can verify and follow references. The same capability applies to **Interview** and **Orchestrator** -- they use the same run config and MCP/tool wiring. Full specification (output format, architecture options, provider/auth, model selection, errors, security, per-platform, and **gaps/potential problems**) is in **Plans/newtools.md §8.2.1**. We adapt an approach like [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) (LLM-grounded search; Google, OpenAI, OpenRouter) as a single shared implementation (prefer MCP server so all three surfaces use the same tool).
- **Plugins, MCPs, and extensibility:** The chat must be able to use **plugins**, **MCPs** (Model Context Protocol servers), and other extensibility mechanisms available in the application. When the user runs the Assistant (or Interview) in chat, the same plugin/MCP configuration that applies to the rest of Puppet Master (e.g. Context7, Browser MCP, custom tools) should be available to the chat session so the agent can call tools, query docs, or use other registered capabilities. Wire chat execution to the same run config and MCP/plugin discovery used elsewhere (see Plans/newtools.md §8 for MCP config and platform coverage).

---

## 8. Plan Mode Depth & Rules

### 8.1 Depth setting (Shallow / Regular / Deep)

- **Setting:** In chat, Plan mode has a depth control: **Shallow**, **Regular**, or **Deep**.
- **Effect:** Controls how many clarifying questions are asked and how long the agent researches before producing the plan.
  - **Shallow:** Fewer questions, shorter research.  
  - **Regular:** Default balance.  
  - **Deep:** More questions, longer research.
- **Scope:** Applies only to the Plan-mode flow (questions → research → plan + todo).

### 8.2 Plan mode rules

- **Clarifying questions:** Not optional. The plan flow **always** includes clarifying questions after the user's prompt before research and plan creation.
- **Add to queue:** **Not** available in regular Plan mode. "Add to orchestrator queue" is available in **Interview** mode (after interview completes) or in other explicitly defined flows, not as the default outcome of a standalone Plan-mode run.
- **Parallelization:** Always try to parallelize execution when possible (e.g. independent steps, subagents). User can **disable** parallelization in settings if desired.
- **Plan panel:** A **plan panel** stays visible in the chat (or adjacent) showing:
  - The **written plan** (narrative or structured).  
  - The **todo list** (steps/tasks), similar to Cursor's plan UI.  
- **Execution:** After the user approves the plan, execution runs via the same execution engine (fresh process per step; subagent selection per step when applicable).

---

## 9. File Manager, IDE-style editor, and @ Mention

**Full specification:** Plans/FileManager.md (File Manager panel, in-app IDE-style editor, @ mention, click-to-open from chat).

**Chat-specific requirements (this document):**

- **@ mention in chat:** In the chat input, the user can type **@** to open a small search box over the file list. User picks a file (search/filter by name or path); the selected file is added to the agent's context for that message. Same file list as File Manager (single source of truth). When **LSP is available** (MVP), **@ symbol** also offers **symbols** (functions, classes, etc.) via LSP workspace/symbol so the user can add a symbol by name to context; see §9.1.
- **Click-to-open:** Clicking a file path (files-touched strip, "Read:" / "Edited:", or code block filename) in the thread **opens that file in the in-app IDE-style editor** (FileManager.md); when line/range is known, the editor scrolls to it. See §4.1 (files-touched strip) and §13 (activity transparency, code blocks).
- **Document review messaging contract (required):** After document generation or revision, chat must post:
  1. `Opened in editor` indicator,
  2. Clickable canonical file path,
  3. Document-pane pointer (`See <Document name> in document pane` or equivalent).
- **No full-doc-in-chat rule (required):** Chat message bodies for document workflows contain summaries, findings, gaps, and next actions only.
- **Findings summary in chat (required):** Requirements and Interview Multi-Pass runs must post a findings summary block before final approval.

### Findings summary block (requirements and interview)

Chat renders a compact findings block for review flows:
- `Scope` (`requirements` or `interview`)
- `Gaps`
- `Consistency issues`
- `Missing information`
- `Applied changes summary`
- `Unresolved items`

The findings block is shown before final approval and links to the same artifact surfaced in the page preview section.

### 9.1 LSP support in Chat (MVP)

**LSP is MVP.** The Chat Window must **fully take advantage of LSP** so the user and the Assistant benefit from language intelligence without leaving the chat. Full specification: **Plans/LSPSupport.md §5.1 (LSP in the Chat Window)** and **Plans/FinalGUISpec.md §7.16** (control placement, empty/error states, accessibility). Summary of Chat-specific requirements:

| Requirement | Behavior |
|-------------|----------|
| **Diagnostics in Assistant context** | When building context for the next Assistant (or Interview) turn, **include a summary of current LSP diagnostics** for the project or for @'d/recently edited files (errors/warnings with file, line, message, severity, source). The agent can suggest fixes and prioritize work. |
| **@ symbol with LSP** | When LSP is available, the **@** menu includes **symbols** (from LSP workspace/symbol and optionally documentSymbol) so the user can add a function/class/symbol to context by name; results show path, line, kind. When no project is set, @ symbol shows files only (no symbol category). Empty result: show "No symbols" (no error). |
| **Code blocks in messages** | **Code blocks** in assistant or user messages support **LSP hover** (tooltip with type/docs) and **click-to-definition** (e.g. Ctrl+Click or F12) when the block has a known language and the project has an LSP server; definition opens in the File Editor. Unknown language or no LSP: no hover/definition, no error. |
| **Problems link from Chat** | **Placement:** Chat **footer** strip, right of context usage (FinalGUISpec §7.16). Label: **"N problems"** when count > 0, **"Problems"** when zero. **Click target:** Opens the **Problems** panel (FinalGUISpec §7.20) filtered to the current project (or context). |
| **Diagnostics hint for @'d files** |

**Diagnostics Hint for @'d Files (Resolved — Deferred to Post-MVP):**
Not included in MVP. Priority: **P3** (post-MVP polish). When implemented: show a compact badge next to @-mentioned files with error/warning counts from LSP diagnostics (if LSP gate is enabled). |

**Fallback:** When no LSP server is active, @ symbol uses text-based or indexed symbol search (FileManager §12.1.4); code blocks have no hover/definition; diagnostics in context are omitted.

**Control placement and edge cases:** Exact placement of LSP controls (footer order, Problems link position), empty/zero states ("No problems", "No symbols", unknown-language code blocks), error states (LSP server error, timeout, project not set), and accessibility (focus order, screen reader text for Problems link and code-block go-to-definition) are specified in **Plans/FinalGUISpec.md §7.16** (Chat LSP control placement, empty and zero states, error states, accessibility).

**Additional Chat enhancements (LSP):** With LSP MVP, further Chat/Assistant flows become possible (Plans/LSPSupport.md §9.1): **"Fix all" / quick fixes** from diagnostics (Assistant suggests or user clicks "Fix" on a diagnostic); **"Rename X to Y"** from Chat (invoke LSP Rename symbol with confirmation); **"Where is this used?"** (LSP Find references, show in Chat or References panel); **"Format this file"** (LSP Format document); **Copy type/signature to Chat** from editor hover. Implement as high-value follow-ups after core Chat LSP (§5.1).

---

## 10. Chat History Search

- **Human search:** Chat must support **search across chats / history** so **users** can find prior conversations and reuse context (e.g. search within current chat and, if applicable, across past chats or sessions). This is a first-class UI feature (search box, filters, results list). Implementation: Tantivy chat index fed by seglog projector (Plans/storage-plan.md).
- **Agent search:** **Agents** must also be able to **search through chat history** when answering or planning. Provide a way for the running agent (Assistant, Interview, or subagent) to query past messages or sessions -- e.g. via a tool/MCP, or by including a searchable index of chat history in the context pipeline -- so the agent can retrieve relevant prior decisions, explanations, or outcomes. Enables continuity (e.g. "last time we decided X") and avoids asking the user to re-paste old context. Implementation can share the same storage/index as human search (Tantivy) but must expose an agent-callable interface (tool, API, or injected context).

---

## 11. Threads and chat management

- **Multiple threads, single chat window:** The user can add **additional chats** (message threads). This **switches to another message thread** in the same chat UI -- it does **not** open a new chat window or pop-out. So there is one chat panel with a **thread list** (or equivalent); selecting a thread shows that thread's messages. This lets the user run **multiple things in parallel** (e.g. one thread in Plan mode, another in Ask mode) by switching between threads.
- **Responsive chat UI -- icons when narrow:** The **chat area** (composer, footer, queue strip, header buttons) must be **responsive** to the chat window or panel width. When the chat window is **made small**, **buttons and other components** that normally show **text labels** (e.g. "Send", "Stop", "Edit", "Send now", "Cancel", "Clear queue") should **switch to small icons only** to save space and avoid crowding. When the window is **wide enough**, show text labels (with or without icons). When the chat panel width is below **280px**, the UI switches to icon-only mode (labels hidden, only icons shown). Config: `ui.chat.icon_only_breakpoint_px`, default `280`, stored in redb. **Tooltips** must remain available so the user can hover to see the action name when in icon-only mode. Applies to: composer actions, queue message buttons (Edit, Send now, Cancel), footer controls, and any other labeled buttons in the chat panel.
- **Thread list (sidebar) -- resizable and collapsible:** The **side part that shows prior thread history** (the thread list) must be **adjustable in size** and **collapsible**. (1) **Resizable:** The user can **drag** the divider between the thread list and the chat area to make the list wider or narrower. (2) **Collapsible:** The user can **collapse** the thread list to a **much smaller** strip (e.g. narrow column or icon rail). **Expanded** state: show a **larger preview** of each thread name (more of the title visible, more list items in view). **Collapsed** state: show a **much smaller** strip--e.g. narrow width with a compact thread name (truncated or icon/short label) so the user still sees which thread is selected and can expand again or switch threads. Toggle via a button (e.g. chevron or panel toggle) or by double-clicking the divider. Persist the user's choice (expanded/collapsed and width if resizable) per session or in settings.
- **New thread:** A **plus button** (or equivalent) starts a **new chat/thread**. New thread gets a default title (e.g. "New chat" or first message snippet); user can rename it (see below).
- **Thread state indicators:** In the **thread list** (message thread history), each thread has an **indicator** showing:
  - **Working** -- this thread has an agent run in progress (e.g. spinner, "Working...", or status text).
  - **Completed** -- the last agent turn in this thread finished (e.g. checkmark or "Done").
  - **Attention Required** -- the thread is paused waiting for the user to answer clarification questions from the requirements quality reviewer (see §11.1). Shown as an amber ⚠ badge with a numeric count of unanswered questions.
  So at a glance the user can see which threads are active, idle, or awaiting user attention.
- **Rename threads:** The user can **rename** a thread (e.g. via context menu, inline edit, or thread settings). The chosen title is shown in the thread list and in any history/search.
- **Archive threads:** The user can **archive** a thread. Archived threads are hidden from the default thread list but remain **searchable** (in chat history search) and recoverable (e.g. "View archived" or filter). Archiving keeps the list manageable without losing history.
- **Resume and rewind:** The user can **resume** a thread from persisted state (restore context and continue) and **rewind** (or "Restore to here") to a given message -- i.e. branch/rollback using the same restore-point mechanism as Plans/newfeatures.md §8. Exposed via slash command or thread actions.
- **Session share:** The user can **share session** -- produce a bundle (e.g. messages + metadata, no secrets) for support or replay. Available via slash command or menu.
- **Delete thread:** The user can **delete** a thread permanently (in addition to archiving). Deletion requires confirmation; archive remains the default for "hide but keep."
- **Copy message:** Message content is **selectable** so the user can copy text (e.g. assistant reply) to the clipboard; or provide a "Copy" action on messages. Use selectable widgets per docs/gui-widget-catalog.md.
- **Run-complete notification:** When a run completes in a **different** thread than the one the user is viewing, the app shows a notification (e.g. badge or toast). A **setting in application settings** (e.g. under Chat or Notifications: "Notify when run completes in another thread") allows the user to **turn this off**. Default: on.
- **Concurrent threads:** A **setting** controls the maximum number of threads that can have an agent run in progress at the same time. Default: **10** concurrent threads. When the limit is reached, new runs **queue** automatically (FIFO). Config: `orchestrator.max_concurrent_threads`, default `10`. Platform rate/process limits still apply.
- **Plan panel scope:** The **plan panel** (§8) is **per thread**: when the user switches threads, the panel shows the plan (and todo) for the **current thread**.
- **Persistence -- everything in the chat thread:** **Everything** in the chat thread must **persist**. The thread is the full record of the conversation and must survive app restart, re-open, and resume/rewind. Nothing shown in the thread is ephemeral-only. Implementation: canonical event stream (seglog) and projections (redb, Tantivy) per Plans/storage-plan.md. Specifically, persist (e.g. per project under `.puppet-master/` or in app data):
  - **Thread list** and per-thread metadata (title, archive state, etc.).
  - **Messages** -- every user and assistant message (prompts and replies).
  - **Prompts** -- user prompts and any composed-but-queued or sent prompts, so the full prompt history is retained.
  - **Thought streams** -- reasoning/chain-of-thought (thinking) content when the normalized stream provides it; persist so scrolling back or re-opening the thread shows past reasoning.
  - **Code block diffs** -- code blocks and their diffs (e.g. edits, patches, file changes shown in the thread) must be stored with the thread so the user can review what was proposed or applied at any point.
  - **Subagent blocks** -- which subagents ran and what they worked on (§14); first-class entries in thread history.
  - **Plan and todo** -- the plan panel content (written plan, todo list) per thread.
  - **Queue state** -- when a run is not active, the pending queued messages for that thread.
  - **Activity transparency data** -- what was searched, which files were explored or changed, bash output summaries (or references), so the audit trail in the thread is complete.
  - **Attachments** -- references to attached files/images so the thread can restore context (blobs may be stored separately; thread stores references and metadata).
  - **Usage per turn** -- tokens (input/output/reasoning/cache if available) and cost per assistant turn, so the **context circle** and **thread Usage tab** (§12, Plans/usage-feature.md §5) can show per-thread usage without rescanning. When seglog is in place, this can be derived from `usage.event` (with `thread_id`); until then, persist with the thread or in usage.jsonl keyed by thread/session id.
  Resume and rewind rely on this; see Plans/newfeatures.md for recovery and snapshot behavior. If the UI shows it in the thread, it must be persisted.
- **Backup and sync to other devices:** Chat threads and messages (including **Interview** threads and messages) must be **included in the application's backup and sync-to-other-devices feature**. When the user exports, backs up, or syncs to another device (e.g. via manual export/import or BYOS per Plans/newfeatures.md §22), the payload must include all chat and interview thread data (thread list, full message content, and all persisted thread content listed above) so the user can restore or continue conversations on another machine. Same scope as the sync payload defined in newfeatures.md §22 (thread/history index and message blobs for Assistant and Interview).

### 11.1 Thread State: `attention_required`

**State definition:** A thread enters `attention_required` when the requirements quality reviewer generates `needs_user_clarification[]` entries that could not be auto-resolved. The wizard is paused; no further agent execution occurs until the user submits answers.

#### Thread List Indicator (sidebar)

When a thread is in `attention_required` state, its entry in the thread list shows:

- An amber/warning-colored badge (⚠ or equivalent icon) to the left of the thread name.
- A numeric count badge showing the number of unanswered clarification questions (e.g., "3 questions").
- The thread entry is visually elevated -- moved to the top of its section, or rendered bold -- so it is immediately noticeable.
- The badge clears when all questions are answered and the wizard returns to a non-`attention_required` state.

#### Badge data model

```json
{
  "thread_id": "<string>",
  "state": "attention_required",
  "unanswered_question_count": "<integer ≥ 1>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "quality_report_path": "<string path to quality report file>"
}
```

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`

### 11.2 System Message Type: `clarification_request`

This message is automatically posted to the thread when the requirements quality reviewer generates `needs_user_clarification[]` entries that could not be auto-resolved.

#### Message schema (within the thread message model)

```json
{
  "type": "clarification_request",
  "message_id": "<string>",
  "timestamp_utc": "<ISO-8601 date-time>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "quality_report_path": "<string path to quality report>",
  "questions": [
    {
      "question_id": "<string>",
      "question": "<specific, answerable, non-overlapping question>",
      "context": "<background context for the user>",
      "answer_format": "<free_text|single_choice|multi_choice|yes_no|identifier>",
      "choices": ["<option1>", "<option2>"]
    }
  ],
  "resume_url": "<deep-link to exact wizard step>",
  "answered": false
}
```

- `answered` transitions to `true` when all questions have received user responses.
- When `answered` becomes `true`, the wizard re-runs Pass 1 + Pass 2 automatically.

#### Visual rendering spec

- Displayed as a distinct card/panel within the thread (not a regular chat bubble).
- **Header:** ⚠ "Requirements Clarification Needed" in amber.
- **Sub-header:** "Wizard: [wizard_step]" + "Resume →" link.
- Each question rendered as a labeled form field matching `answer_format`:
  - `free_text` → textarea
  - `yes_no` → radio buttons (Yes / No)
  - `single_choice` → radio button group using `choices[]`
  - `multi_choice` → checkbox group using `choices[]`
  - `identifier` → text input with validation
- "Submit Answers" button at bottom; disabled until all questions have a value.
- After submit: system posts a confirmation message and the card shows a "Submitted ✓" state.

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`, `ContractName:Plans/FinalGUISpec.md`

### 11.3 Thread State Lifecycle: `attention_required`

```
[wizard running]
    → quality reviewer runs
    → needs_user_clarification[] non-empty
    → state: attention_required
    → clarification_request system message posted
    → user views + answers questions
    → "Submit Answers" clicked
    → wizard re-runs Pass 1 + Pass 2
    → [if PASS] state: active  (attention_required cleared, badge removed)
    → [if FAIL again] state: attention_required  (new clarification_request posted, old one archived)
```

**State transitions:**

| From | To | Trigger |
|------|----|---------|
| `active` | `attention_required` | Quality reviewer reports `needs_user_clarification[]` non-empty |
| `attention_required` | `active` | User submits answers and Pass 1 + Pass 2 return PASS verdict |
| `attention_required` | `attention_required` | User submits answers but Pass 1 + Pass 2 still return FAIL (new round of questions) |

**Max clarification rounds:** **3**. After 3 consecutive rounds still failing, wizard state becomes `blocked` and a different escalation path is triggered -- outside the scope of this spec; see `Plans/chain-wizard-flexibility.md`.

ContractRef: `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`

---

## 12. Context usage display

- **Streaming:** When the platform supports it, the assistant's **response streams** (text appears as it arrives rather than all at once). The UI consumes the normalized stream (Plans/newfeatures.md §5, §19.3); fallback to batch when the platform does not stream.
- **Visible context and usage info:** The chat UI should show **context usage and related information** in a way similar to **OpenCode's desktop application** -- e.g. token or context-window usage, current model, rate limits, or other usage/limits that help the user understand how much context is in use and when limits might be hit.
- **Context circle (OpenCode-style):** At the **top of the chat** (e.g. in the chat header next to platform/model), show a **small context indicator** -- a circular progress or gauge showing **context usage %** for the current thread. **Hover:** Tooltip shows **token count**, **usage %**, and **cost** (USD or equivalent) for that thread. **Click:** Opens a **Usage tab (or panel) for that chat thread** with detailed breakdown: tokens (input/output/reasoning/cache if available), cost, usage over time or per turn, and link to the app-wide Usage view. Reference: OpenCode -- `packages/app/src/components/session-context-usage.tsx` (ProgressCircle + Tooltip, click opens "context" tab), `session-context-metrics.ts` (metrics from messages). Full spec: Plans/usage-feature.md "Per-thread usage in Chat (OpenCode-style)".
- **Empty state:** When the thread has **no usage data yet** (new thread or no token/cost reported): show the indicator at **0%** (or neutral "--"); tooltip "No usage yet." Click still opens the thread Usage tab (showing 0 tokens, $0.00, and link to app-wide Usage).
- **Keyboard and accessibility:** The context indicator is **focusable** (in tab order). **Enter** or **Space** opens the thread Usage tab (same as click). Use an **accessible-label** (e.g. "Context usage for this thread") so screen readers announce its purpose. See Plans/usage-feature.md §5.
- **Interview:** The same context circle and thread Usage tab behavior applies to **Interview** chat threads (context circle in Interview header, hover, click → Usage tab for that Interview thread).
- **Context Usage Display Placement (Resolved):** **Tab in the chat side panel** labeled **"Usage"**. Not a slide-out panel. The Usage tab sits alongside the thread list in the sidebar. Consistent with the thread list sidebar pattern — no new UI paradigm needed. Contains: token breakdown (input/output), cost estimate, context window fill percentage, and per-turn usage history.
- **Purpose:** Helps users manage long sessions, avoid truncation surprises, and understand cost/limits when running multiple threads or heavy plans. Data for this display is supplied by analytics scan rollups (seglog → counters/rollups → redb) per Plans/storage-plan.md and by **per-thread usage** derived from the thread's messages (tokens, cost per assistant turn); the same rollups feed dashboard and usage widgets (Plans/usage-feature.md, Plans/feature-list.md).
- **Rate limit hit:** When the platform returns a rate-limit or quota error (e.g. 5h window full), the thread shows a clear message and, where appropriate, the option to **switch platform or model** so the user can continue without waiting.

---

## 13. Activity transparency: search, bash, and file activity

- **Audit trail:** Everything the agent does in the thread that affects context or the system (searches, **bash commands and scripts**, file reads/edits, tool calls) must form a **full audit trail** in the thread: what was run, when, and what the outcome was. Commands entered and scripts run are first-class entries; persist them with the thread (§11) so the user can scroll back and see exactly what was executed. Much of this detail should be **collapsible** (see "Collapsible sections" below) so the thread stays scannable while still preserving the complete record.
- **Internet/web search -- show search and links:** When the agent performs an **internet or web search** (e.g. via cited web search tool per §7), the thread must **show that a search was performed** and **show the links** (sources/URLs) that were used. Display can be **collapsible**: when collapsed, show a summary (e.g. "Web search: 3 sources" or "Web search: &lt;query&gt; -- 3 links"); when expanded, show the **search query** and the **list of links** (title + URL per source). Same Sources list as in cited web search output; persist with the thread (§11). Align with Plans/newtools.md §8.2.1 (cited web search).
- **Show what it searched:** The chat must **show what was searched** whenever the agent (or the system) performs a search. For chat-history search, web search, file search, or other search actions, the thread should display the **search query** (or scope) and, where appropriate, a short summary of what was searched (e.g. "Searched: 3 threads, 12 messages" or "Web search: ..."). This gives the user visibility into what context the agent used.
- **Bash and commands -- audit trail:** The Assistant must be able to **use bash** (run shell commands and scripts) when not in read-only mode (e.g. in Plan execution or Agent mode). Every **command entered** and **script run** must appear in the thread as part of the audit trail: the command/script text and the outcome (stdout/stderr, or a summary with expandable full output). Execution is subject to permissions (YOLO vs regular approval) and to FileSafe/guards where applicable. Bash blocks in the thread should be **collapsible** (e.g. show "Ran: `cargo test`" or "3 commands" when collapsed; expand to show full command(s) and output). Persist commands and output with the thread so the audit trail is complete.
- **Files explored in the thread:** For each agent turn (or run), the thread should show **which files the agent explored** (read or opened for context). Display a concise list or summary in the thread -- e.g. "Read: `src/main.rs`, `docs/ARCHITECTURE.md`" -- so the user knows what the agent had access to.
- **What it changed in the thread:** The thread should show **what the agent changed** -- files edited, created, or deleted, with enough detail to understand the impact (e.g. "Edited: `src/lib.rs` (lines 12-45)", "Created: `tests/foo.rs`"). This can be a summary line per file or an expandable diff/list. Together with "files explored", this gives a clear **audit trail** in the thread: what was read, what was run (bash), and what was changed. All of this (search, bash, files explored, files changed, code block diffs) is part of the thread and **must persist** with the thread per §11.
- **Document review content policy:** For requirements/interview document workflows, chat audit entries summarize document updates and findings but do not inline full document bodies. Long artifacts are reviewed in File Editor or embedded document pane.
- **Code block and diff presentation in chat (Cursor-style):** When the agent proposes or applies file changes, present them in the thread as **code block diffs** in a **Cursor-style** layout: (1) **Filename** and **diff count** (e.g. `path/to/file.rs` **+12 −3** for 12 lines added, 3 removed). (2) **Line-by-line diff**: removed lines shown with a **minus** prefix (e.g. red or distinct styling), added lines with a **plus** prefix (e.g. green or distinct styling). (3) Optional summary lines (e.g. "Explored 2 files, 2 searches") for file/search activity. Blocks can be **collapsible** when long (collapse to filename + count; expand to show full diff). Persist full diff content with the thread (§11). Reference: Cursor in-chat diff UI (filename + +N −M, then −/+ lines).
- **Click to open in editor:** Clicking a **file path** anywhere in the thread (files-touched strip, "Read:" / "Edited:" lines, or a **code block** filename/header) **opens that file in the in-app IDE-style editor** (Plans/FileManager.md). When the target is a code block or diff that has **line or range information**, the editor opens that file and **scrolls to the relevant line or range**. This applies to: filename in the files-touched strip, "Read: path" and "Edited: path" in activity transparency, and the filename/header of inline code blocks and diffs. Single behavior: all such clicks open in the same editor; no separate "preview" vs "edit" for this action.
- **Thinking/reasoning toggle:** When the normalized stream (Plans/newfeatures.md) provides **thinking** (or reasoning) events, the Assistant chat UI must show them in a **collapsible** area with a **toggle to show/hide**. **Thought streams default to collapsed** because they are typically long; the user can expand when they want to read the reasoning. Same behavior for Interview when thought stream is present. **Thought streams must persist** with the thread (see §11) so they remain visible when scrolling back or re-opening the thread; **Thought Stream Collapse (Resolved):** **Per-entry** collapse state. Each thought stream entry starts **collapsed** by default (showing only the first line as a summary). The user can expand individual entries by clicking. Collapse state is not persisted — all entries reset to collapsed on thread reload. A global "Expand all / Collapse all" toggle may be added post-MVP as a convenience. Align with Plans/newfeatures.md §12, §15.6.
- **Collapsible sections -- default state:** Much of the detailed content in the thread should be **collapsible** so the thread stays scannable while preserving the full audit trail. When collapsed, show a short summary (e.g. "Thought stream (expand)", "Ran: `cargo test`", "3 files changed"). **Defaults:**
  - **Thought streams:** **Default collapsed** (typically long).
  - **Bash / command blocks:** Collapsible; when collapsed show command summary or count (e.g. "1 command" or "Ran: `cargo test`").
  - **Code block diffs:** Collapsible when long; when collapsed show filename + +N −M; expand to show full line-by-line diff (Cursor-style).
  - **Web search / links:** Collapsible; when collapsed show "Web search: N sources" or query + count; expand to show query and list of links (title + URL).
  - **Files explored / files changed:** Can be a single collapsed "N files read" / "N files changed" with expand to list.
  User can expand any section to see full content; persistence (§11) stores everything so the full record is always available.
- **Revert last agent edit:** The user can **revert the last agent edit** (or "Revert file X") from the thread -- tied to activity transparency and Git/restore points (Plans/newfeatures.md §8, §15.3) so the user can undo agent file changes without leaving the chat.
- **Agent-requested rollback:** Agents can **request** a rollback (e.g. "revert my last edit" or "restore to previous point") via a designated tool call exposed in the agent's tool set. The tool is request-only — the app does not perform the restore immediately. Instead, the app shows a **user confirmation step** (optionally showing affected files, conflict status, and diff). After the user confirms, the app performs the restore (writes snapshot content back, updates app/chat state per §8 rollback flow), then sends a **refresh notification** to the editor and chat so they reload affected buffers and state. This uses the same restore pipeline as user-initiated "revert last agent edit." **Tiered scope:** narrow (last turn) or broader (specific restore point); broader requests require user confirmation and may be limited to same-session or last N points. See Plans/newfeatures.md §8 for store location (redb, not filesystem), read-only agent constraint (tool registry), tiered undo, and conflict handling (§23.4). **Relationship to rewind (§11):** "Rewind" is user-initiated message-level restore; agent-requested rollback uses the same restore-point infrastructure but is agent-initiated with a mandatory user confirmation gate.

---

## 14. Subagents & Crew

- **Automatic subagents:** The chat can **automatically spawn subagents** when it determines that a task benefits from specialized help (e.g. research, code review, debugging). Logic should align with orchestrator subagent selection where applicable (e.g. `subagent_registry`, task type).
- **User-requested subagents:** The user can explicitly ask the agent to use subagents (e.g. "use a code reviewer for this" or "run this with subagents").
- **Subagent visibility in the thread:** When a subagent is **active** in the thread, the chat must show **in the message stream** (inline in the thread):
  - **Which persona** is being used (e.g. "Rust Expert", "Technical Writer", "Code Reviewer") -- the display name from `subagent_registry` or persona config.
  - **What they are working on** -- a short description or task (e.g. "Reviewing `src/lib.rs`", "Researching best practices for ..."). This can come from the orchestrator/subagent runtime (current step or task label) or from the first message/tool call assigned to that subagent.
  So the user always sees which specialist is active and what they're doing, without leaving the chat. Behavior aligns with Cursor's in-thread subagent indicators.
- **Subagents kept in thread history:** The **subagents used** in the thread must be **kept in the chat thread history**. Each subagent block (persona + task) is a first-class entry in the message/event stream: when the user scrolls back or re-opens the thread, they see not only user and assistant messages but also **which subagents ran and what they did** at those points in time (e.g. "Rust Expert -- Reviewing `src/lib.rs`", "Technical Writer -- Drafting API docs"). Persist these blocks with the thread so the full audit trail -- who (which persona) worked on what and when -- is always visible in the thread history.
- **Crew mode:** A **Crew** is a multi-agent group (see Plans/orchestrator-subagent-integration.md). The user can invoke crew via:
  - A **button** in the chat UI, or  
  - A natural-language request (e.g. "use a crew" or "run this with a crew").  
- **Crew + Plan:** Plan mode and Crew mode **must work together**: e.g. user can run Plan mode and then execute the plan with a crew, or run a crew for a planned set of steps. See §15.

### 14.1 Subagent visibility in thread -- implementation detail

**GUI updates**

- **In-thread indicator:** When a subagent is active, the **message stream** (same area as user/assistant messages) must show an **inline block** (or message-like row) that includes:
  - **Persona name** (e.g. "Rust Expert", "Technical Writer") -- from `subagent_registry` or persona config; use the same display name used elsewhere (e.g. crew/subagent list).
  - **What they're working on** -- short task label (e.g. "Reviewing `src/lib.rs`", "Researching best practices for error handling"). One line is enough; optional expand for detail.
- **Placement:** Show the indicator **when the subagent run starts** (e.g. at the point in the thread where the system hands off to that subagent). Optionally update the same block when the task label changes (e.g. "Reviewing..." → "Writing summary") or leave it static until the subagent finishes. When the subagent finishes, the block **remains in the thread** as a permanent history entry (e.g. "Rust Expert -- Reviewing \`src/lib.rs\`" or "Rust Expert -- completed"); it is **not** removed. Main requirement: visibility **while** active and **persistence in thread history** so scrolling back or re-opening the thread shows which subagents were used and when.
- **Visual treatment:** Differentiate from regular user/assistant messages (e.g. secondary background, icon, or "Subagent" chip) so the user can scan quickly. Use existing widgets (e.g. `status_badge`, `selectable_label`) where possible; tag new ones with `// DRY:WIDGET:...`.
- **Multiple subagents:** If several subagents are active at once, show one block per subagent (or a compact "2 subagents: Rust Expert (reviewing ...), Technical Writer (drafting ...)"). Align with footer "active subagent count" (§4.1) so the number matches the number of blocks shown.

**Backend updates**

- **Data per active subagent:** For each active subagent in a thread, the backend (or event stream) must provide:
  - **Persona id or name** -- to resolve to display name via `subagent_registry` or persona config.
  - **Task label** -- short string describing what they're working on (e.g. step title, first message snippet, or "Working on step 2"). If the execution layer does not provide this, derive from: plan step title, tool call name, or "Working..." as fallback.
- **Events:** Emit (or model in unified events) **subagent_start** and **subagent_end** (or equivalent) with `thread_id`, `subagent_id`/persona name, and optional `task_label`. The chat view subscribes and inserts/updates the in-thread indicator. Optionally **task_progress** events to update "what they're working on" without a new block.
- **Source of task label:** Orchestrator/crew runtime (Plans/orchestrator-subagent-integration.md) should pass a **task label** when delegating to a subagent (e.g. "Review `src/lib.rs`", "Research error-handling patterns"). If not available, UI shows persona name only or "Working..." until the first tool call or message can be used as a proxy label.

**Examples (unchanged)**

- "**Rust Expert** -- Reviewing `src/lib.rs`"
- "**Technical Writer** -- Researching best practices for API docs"
- "**Code Reviewer** -- Checking test coverage"

**Gaps and missing details**

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Task label optional** | Some runs may not have a step title or task label. | Require execution layer to set a default (e.g. "Working..." or first tool/message summary). GUI must handle empty/missing label (show only persona name). |
| **Order in thread** | Subagent blocks interleaved with assistant messages; order must be clear. | Order by **event time** so the subagent block appears at the position in the thread where the handoff happened. |
| **Persistence** | When thread is persisted and re-opened, do we show past subagent blocks? | **Yes.** Subagent blocks are first-class thread history: persist as part of thread message/event history so "Rust Expert reviewed ..." remains visible after reload and when scrolling back. Requirement: chat thread history **keeps** all subagents used in that thread. |
| **Interview vs Assistant** | Interview may use different subagent naming or flow. | Use same persona display names from `subagent_registry`; task label can be phase-specific (e.g. "Phase: Architecture -- Researching patterns"). |

**Potential issues**

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Flicker** | Subagent starts and ends quickly; block appears and disappears. | Keep a short "just finished" state (e.g. "Rust Expert -- completed") for a few seconds, or leave a collapsed summary line so the user saw that someone worked. |
| **Long task labels** | "Researching best practices for error handling in async Rust and ..." truncates badly. | Truncate with tooltip or "..." (e.g. max 40-50 chars); full text on hover or expand. |
| **No persona display name** | Unknown subagent id or missing from registry. | Fallback: show raw id or "Subagent" so the slot is never empty. |
| **Concurrent subagents** | Several blocks in a row; thread gets long. | Allow collapsing "N subagents active" to one line when more than 2-3, with expand to list; or keep one block per subagent but use compact layout. |

---

## 15. Plan Mode + Crew Mode

- Plan mode produces a **plan + todo list**. Execution of that plan can be:
  - **Regular agent** (single agent),  
  - **Crew** (multi-agent coordination), or  
  - **Agent + subagents** (main agent plus specialized subagents).  
- The **manager/orchestrator** can automatically decide which execution strategy to use, or the **user can request** one (e.g. "execute with a crew", "use subagents for steps 2 and 3").  
- Implementation must allow:
  - Entering Plan mode, then choosing "execute with crew" (or similar) after the plan is ready.  
  - Entering Crew mode (or "use a crew") and having the crew work from an existing plan or from a new plan created in the same flow.  
- No conflicting assumptions: e.g. plan output format should be consumable by both single-agent and crew execution paths.

---

## 16. Interview Phase UX (Chat Surface)

When the chat is in **Interview** mode (interview flow):

- **Thought stream:** Show the **thought stream** (reasoning/chain-of-thought from the model) so the user sees how the interviewer is thinking.
- **Message strip:** Show the **message strip** (current Q&A or phase messages) in addition to phase progress.
- **Question UI:** When the interviewer asks a question, present:
  - **Several suggested options** (e.g. buttons or selectable chips).  
  - A **"Something else"** control that reveals a **text bar** where the user can type a freeform response.  
- This keeps navigation quick for common answers while allowing any custom answer.
- **Contract Layer outputs (completion surface):** When the interview completes (or when a phase boundary produces artifacts), the Interview surface must provide a read-only **Outputs** card/pane listing the canonical user-project artifact set under `.puppet-master/project/` (requirements, Project Contract Pack with `contracts/index.json`, `plan.md` (human-readable), **sharded plan graph** under `plan_graph/` (**index + node shards**), `acceptance_manifest.json`, and validator status). These outputs are **persisted canonically in seglog** and surfaced here via projection into `.puppet-master/project/...` (do not assume anything about the user project’s own folder layout). Each entry must be click-to-open via the File Manager/editor surface (Plans/FileManager.md). Authoritative artifact contract: `Plans/Project_Output_Artifacts.md` (do not duplicate schemas here).

---

## 17. Context & Truncation

- **Goal:** Do our best **not to truncate** important context. Long conversations and large plans should remain usable.
- **Approach:** Use strategies similar to those used by mature AI-coding systems:
  - **VBW (Vibe Better With Claude Code):** Context compilation, role-specific context, compaction awareness, token efficiency. See [VBW manifesto](https://github.com/yidakee/vibe-better-with-claude-code-vbw/tree/main?tab=readme-ov-file#manifesto).  
  - **Get Shit Done (GSD):** Context engineering, sized context files, fresh context per plan. See [GSD](https://github.com/gsd-build/get-shit-done).  
  - **yume:** Session recovery, checkpoints, persistent state. See [yume](https://github.com/aofp/yume).  
- **Application:** Where applicable, implement or plan for: context compilation for chat (e.g. conversation summary + recent turns + plan), compaction-aware re-reads, and clear boundaries so the agent knows what is "current" vs "summarized". FileSafe/context-compilation (Plans/FileSafe.md) applies to orchestrator/iteration context; chat has its own **conversation-level** context format that should be normalized for model switches and long sessions.
- **User-triggered "Compact session":** The user can trigger **"Compact session"** (or "Summarize and continue") in chat -- e.g. via slash command or menu -- which runs the same compaction pipeline as auto-compact (Plans/newfeatures.md §10), with clear UI feedback (e.g. "Compacting...").
- **Context Re-Pack on Model Switch (Resolved)**

  When the model changes mid-thread, the context pipeline re-packs the conversation before the next turn:

  1. **Preserve unconditionally:** System prompt, AGENTS.md content, active file references, last 6 turns verbatim (config: `context.repack.verbatim_turns`, default `6`).
  2. **Summarize:** All turns older than the last 6 are condensed into a single "Conversation Summary" block (key decisions, file paths mentioned, outcomes).
  3. **Truncate:** If the preserved + summarized content exceeds the new model's context window (from `platform_specs`), truncate the summary first, then drop oldest preserved turns until it fits. Never truncate the system prompt or AGENTS.md.
  4. **Normalize:** Provider-specific formatting (e.g., tool call syntax) is normalized to the new provider's expected format.
  5. **Timing:** Re-pack runs synchronously before the next turn is sent. The user sees a brief "Repacking context…" indicator.

  Config: `context.repack.verbatim_turns` (default `6`). Max tokens sourced from `platform_specs::context_window(provider)`.

---

## 18. BrainStorm Mode

- **Flow:** BrainStorm runs a **plan-style flow** (questions, research, debugging as needed) to form a **single plan**. Questions are **not** asked multiple times by multiple subagents; one coordinated Q&A/research phase, then the plan is formed.
- **Execution:** When the user **starts or executes** the plan, the **chat must switch to Agent mode** (execution mode), because Plan mode is read-only and execution requires write/execute permissions.
- **Who executes:** The plan can be executed by:
  - A **regular agent**,  
  - A **crew**, or  
  - **Agent + subagents**.  
  The **manager** (orchestrator) automatically decides, or the **user can request** which option.
- **Subagent collaboration:** During BrainStorm, subagents are **not** only handed the same static context. They must be able to **talk to each other** via the crew message board so they can debate, refine, and synthesize before the manager merges results.
- **Reference:** Align with Plans/orchestrator-subagent-integration.md (crews, subagent communication) and Plans/interview-subagent-integration.md where interview/plan flows are defined.

---

## 19. Documentation Audience (AI Executor)

- All **documentation and plans** produced by the **Interview** (PRD, AGENTS.md, requirements, phase plans, etc.) must be written with the understanding that an **AI agent** will execute them, not a human.
- **Implications:**
  - Instructions must be **unambiguous** and **wire-explicit**: every component, config key, and feature must be explicitly wired (e.g. "wire X to Y", "ensure Z is passed to the run config").
  - **DRY Method** must be enforced in generated content (single source of truth, no duplicated logic, tag reusable items). See Plans/interview-subagent-integration.md §5.1.
  - **No partially complete components:** Generated tasks and plans must call out **completeness**: ensure components are fully implemented and wired to the GUI/config/API as intended, and that nothing is "built but not wired" or left as a stub.
- **Interview plan:** The detailed requirements for "AI as executor", "wire everything together", and "no incomplete components" are specified in **Plans/interview-subagent-integration.md** §5.2 (Documentation and plans for AI execution). The interview prompt templates and document generators must include these requirements so generated PRD and AGENTS.md reduce unwired or incomplete work.

---

## 20. References

- **AGENTS.md:** DRY Method, platform_specs, subagent_registry, Pre-Completion Verification Checklist.  
- **Plans/interview-subagent-integration.md:** Interview phases, document generation, AGENTS.md/DRY for target projects, §5.2 AI-executor and wiring/completeness.  
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
- **Plans/assistant-chat-design.md §23:** Gaps, competitive comparison (OpenCode, Claude Code, Codex, Gemini CLI, Antigravity, Cursor), and recommended enhancements.
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

The **Assistant** can **call up live testing tools**: the user (or the Assistant on the user's behalf) can request e.g. "start hot reload dev mode" or "run tests in watch mode." The app starts the right watcher/dev server for the current project and routes live logs, errors, and reload status into the IDE panes (Terminal, Output, Problems). Full specification: **Plans/newfeatures.md** §15.16 (Hot Reload, Live Reload, and Fast Iteration). The Assistant execution path must be able to invoke the canonical actions `StartDevMode` and `RunTestsWatch` so that results surface in the integrated panes.

---

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

This section extends the context usage ring (section 12) with a "Compact Now" action in the tooltip and a pop-out detailed usage window on click.

### 25.1 "Compact Now" Action in Tooltip

The hover tooltip for the context circle (section 12) is extended with a clickable action line:

**Updated tooltip contents:**

| Line | Content | Behavior |
|------|---------|----------|
| 1 | Tokens Used: {count} | Static text |
| 2 | Context Used: {percent}% | Static text |
| 3 | Cost: ${amount} | Static text (dollars and cents, e.g., $1.23) |
| 4 | **Compact Now** | Clickable link/button text |

**"Compact Now" behavior:**
- Triggers context compaction for the current thread -- same effect as the user-triggered "Compact session" (e.g., /compact or the compaction pipeline from section 17).
- On click: tooltip closes, context circle shows a brief "Compacting..." spinner overlay (200ms minimum display to prevent flash).
- On completion: context circle animates to reflect the new usage percentage. A brief toast notification confirms: "Context compacted: {old_percent}% -> {new_percent}%".
- If compaction is not possible (e.g., already at minimum context, or no messages to compact): show toast "Context already at minimum."
- If compaction fails (error): show toast "Compaction failed: {reason}".

**UICommand:** `cmd.chat.compact_context` with args `{ thread_id }`.

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand)

### 25.2 Pop-Out Detailed Usage View

Clicking the context circle opens a **pop-out window** (not just a tab) with detailed thread usage information.

**Pop-out window specification:**

| Property | Value |
|----------|-------|
| Window type | Floating / detachable (per Plans/FinalGUISpec.md section 5 panel detaching semantics) |
| Default size | 400 x 500 px |
| Title | "Usage -- {thread_name}" |
| Behavior | Only one pop-out per thread at a time; clicking the circle again focuses the existing pop-out |
| Close | Window close button (X), or Escape key |
| Position persistence | redb key `context_popout_state:v1:{thread_id}` stores `{ x, y, width, height }` |

**Pop-out content** (same data as the thread Usage tab described in section 12, plus enhancements):

1. **Header**: "Compact Now" button (prominent, top-right). Thread name. Context ring (larger, 48px).

2. **Summary row**: Total tokens, context percentage, total cost -- same as tooltip but larger and more readable.

3. **Token breakdown table**:
   | Category | Tokens | % |
   |----------|--------|---|
   | Input | {count} | {pct} |
   | Output | {count} | {pct} |
   | Reasoning | {count} | {pct} |
   | Cache (read) | {count} | {pct} |

4. **Per-turn table** (scrollable, virtualized):
   | Turn | Role | Platform | Model | Tokens In | Tokens Out | Cost |
   |------|------|----------|-------|-----------|------------|------|
   | 1 | user | -- | -- | {n} | -- | -- |
   | 2 | assistant | Claude | opus | {n} | {n} | $X.XX |
   | ... | ... | ... | ... | ... | ... | ... |

5. **Cost-over-time chart**: small line chart showing cumulative cost over turns.

6. **Link to app-wide Usage**: "View all usage" link at bottom -- navigates to the dedicated Usage page (Plans/usage-feature.md).

ContractRef: ContractName:Plans/FinalGUISpec.md#5, ContractName:Plans/usage-feature.md

### 25.3 Accessibility

**Context circle:**
- The context circle MUST be focusable (Tab key reaches it).
- `accessible-role: "button"`.
- `accessible-label: "Context usage for this thread, {percent}% used"`.
- Enter or Space opens the pop-out detailed view (same as click).
- Tooltip MUST be available to keyboard users: on focus, tooltip appears; "Compact Now" is focusable within the tooltip (Tab key).

**Pop-out window:**
- All elements inside the pop-out MUST be keyboard-navigable.
- The per-turn table MUST support arrow-key navigation.
- The "Compact Now" button and "View all usage" link MUST be focusable.
- The pop-out root container uses an explicit `accessible-role` for a floating dialog/window surface.
- `accessible-label` on pop-out window: "Detailed usage for {thread_name}".
- On open: focus moves to the pop-out window. On close (Escape): focus returns to the context circle.

ContractRef: ContractName:Plans/FinalGUISpec.md#13

### 25.4 UICommand IDs (Context Circle)

| Command ID | Args | Behavior | Events |
|-----------|------|----------|--------|
| `cmd.chat.compact_context` | `{ thread_id: string }` | Trigger context compaction | `context.compaction.started`, `context.compaction.completed` |
| `cmd.chat.open_usage_popout` | `{ thread_id: string }` | Open/focus the usage pop-out window | UI-only (no persisted event) |
| `cmd.chat.close_usage_popout` | `{ thread_id: string }` | Close the usage pop-out window | UI-only (no persisted event) |

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand), ContractName:Plans/UI_Command_Catalog.md

### 25.5 References (Section 25)

- Section 12 of this document (original context circle specification)
- Section 17 of this document (compaction pipeline)
- Plans/usage-feature.md section 5 (per-thread usage data)
- Plans/FinalGUISpec.md section 5 (panel detaching / floating windows)
- Plans/FinalGUISpec.md section 13 (accessibility)
- Plans/Contracts_V0.md (UICommand contract)

---

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
