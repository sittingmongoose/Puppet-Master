# Assistant & Chat UI -- Design Plan


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Shared conversational/runtime boundary
### Canonical route payload


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Change Summary

- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-message only), and media-generation invocation model. SSOT: `Plans/Media_Generation_and_Capabilities.md`.
- 2026-02-25: Remediation alignment with `Plans/GitHub_Integration.md §B.3` — `/actions` and `/actions logs` outputs now require the same run/log summary fields and failure-state parity as the Actions panel.
- 2026-02-25: Hardened §26 settings/report consistency: clarified that per-pass provider/model settings remain app-settings-only while resolved values are mirrored into `validation_pass_report` payload fields (`provider`, `model`) for auditability (see `Plans/Project_Output_Artifacts.md §10.2`); added acceptance criterion for settings-to-report parity.
- 2026-02-25: Added §5.3 Git & GitHub command boundary and §23.6 Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.
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
- **Additive field placement:** Assistant Chat treats the additive field design from `Plans/Contracts_V0.md` as frozen for this surface; reconciliation may align wording and placement but must not reopen the shared field set.

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
   - [5.3 Git & GitHub command boundary](#53-git--github-command-boundary)
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
- `/mode debug` selects the Debug Mode workflow overlay and must preserve the requested/effective overlay fields through restore and resume.
- Debug transcript and status labeling must make investigations visually distinct from `/Agent/Plan` threads while preserving the same Assistant mode strip family.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md

**Debug axis boundaries:**
- PM distinguishes Debug Mode's runtime-evidence pipeline from orthogonal assistant-diagnostics products. GitHub Copilot / VS Code Agent Debug Log and Chat Debug view may instrument the Copilot session, including tool calls, prompts, OTLP export, and `/troubleshoot`, but that is not the same as instrumenting the user's running app through injected logs. Reference URL: `https://code.visualstudio.com/docs/copilot/chat/chat-debug-view`.
- Windsurf Cascade Hooks are governance/audit hooks around assistant actions such as `pre_read_code`, `post_write_code`, and shell hooks; Download Diagnostics are support-style logs. They are not the Cursor-like local runtime-evidence pipeline PM needs for Debug Mode. Reference URL: `https://docs.windsurf.com/windsurf/cascade/hooks`.
- JetBrains AI Assistant Explain runtime error / console is reactive help over existing output and does not provide a bundled probe, collector, and cleanup workflow. Reference URL: `https://www.jetbrains.com/help/ai-assistant/explain-code-with-ai.html`.
- Amazon Q, Gemini Code Assist, Tabnine fix flows, and similar chat/diagnostics/suggest-logging products are useful OSS and IDE comparison points, but the materials reviewed did not show a first-party match for PM's integrated local log sink plus cleanup story.
- Devin-style bug-from-report workflows may use production/data-plane observability and MCP context, but `/data-plane` evidence is a different axis from PM's local runtime-evidence loop. Reference URL: `https://docs.devin.ai/use-cases/gallery/fix-bug-from-report`.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

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
- The normal automated path covers target discovery and selection, browser or `/test/process` reproduction, evidence capture, tracer `/instrumentation` install or activation, analysis, tentative fix, automated verification, and cleanup or rollback.
- Revalidation is also mandatory after target restarts, debug adapter/session replacement, or evidence expiry that invalidates the current hypothesis.
- A revalidation gate surfaces an explicit reason in the Investigation Context; it MUST NOT silently continue as though the earlier target binding were still valid.
- `verification` is not optional. A fix attempt without a recorded verification result remains `attention_required` or `failed_cleanup`, not `resolved`.
- `cleanup` is the terminal mutation-capable phase for an otherwise successful investigation. Temporary instrumentation may persist only when the user explicitly preserves it or a preservation/hold rule says it must stay.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/GitHub_Integration.md

### 1.0C Runtime mode normalization (canonical)

The chat surface exposes both workflow overlays and runtime execution posture. Only the runtime posture normalizes into the canonical run-envelope `mode` used by `Plans/Run_Modes.md`.

For Assistant display, message metadata, and context-detail filtering, the workflow-mode enum is closed to `ask | agent | debug | plan | deep_plan`. `debug` remains a workflow overlay that normalizes to `regular` by default or to `yolo` only by explicit opt-in; `deep_plan` remains a first-class workflow/display identity even though the underlying run-envelope runtime posture is still `plan`. Subordinate behavior/profile fields may describe investigation or planning depth, but they do not replace this workflow-mode enum.

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

Expert/ELI5 copy pairs must remain behaviorally equivalent: Expert text uses precise, compact system-model language, while ELI5 text uses plain-language explanation plus one concrete example. The dual-copy rule covers authored `/help` and tooltip text; it does not create a separate `concept-help` system or let concept explanations drift from the owner contract.

---

## 3. Permissions: YOLO vs Regular

- **YOLO mode:** Chat runs with maximum permissions; no permission prompts. Agent can execute, edit, and run tools without asking. User accepts full automation for that session.
- **Regular mode:** Agent asks for permission before executing or editing. User-facing approval follows the canonical ladder: `deny`, `once`, `for session`, `always`.
- **Persistence:** Mode is a per-session or per-chat setting (configurable in chat UI or settings). `for session` does not persist across app restarts; durable approval/default behavior is owned by `Plans/Permissions_System.md`.

---

## 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop

This section defines the canonical contract for this surface.

Core rules:
- Message controls are locked to most-recent-user scope, queued-message FIFO semantics, explicit rewind/discard behavior, always-visible code-block copy, mandatory subagent disclosure, and transient queue state that is not restored across reload or restart.
- Ordinary fenced code blocks render an always-visible copy button; the copy affordance/behavior may add emphasis or secondary controls on hover/focus, but copy availability must not depend on hover-only discovery.
- The message-stream control row keeps a thread-visible copy-icon on user and assistant messages, exposes `/submit`/stop morphing in the composer, and scopes `Stop`, `Edit`, and `Resend` to the most recent user-sent message only. `/edit/delete` is retired as a shorthand: edit and resend are supported, but no delete action is exposed. This is the message-control SSOT for most-recent-message controls.
- `/control` is a retired generic shorthand in this section; use `message-control` plus the concrete Stop/Edit/Resend, send-stop morph, copy-icon, and jump controls.
- The normalized message action labels are `Copy`, `Edit`, and `Resend`: `Copy` appears on every message, while `Edit` and `Resend` appear only on the most recent user-sent message. `Resend` replays that message and discards later generated history or work.
- Stop, Edit, and Resend render as icon buttons with accessible names rather than long text buttons in compact message-control rows.
- When the user is scrolled away from the bottom, chat shows a jump-to-latest / jump-to-bottom control with an unseen-count badge; auto-follow resumes when the user returns to the bottom.
- Message-control canon keeps `/steer` as the queue-area and interrupt path, not a message rewrite action. Only the most recent user message exposes Edit and `/resend`; resend replays as-is after rewinding later `/history`, stop cancels the active-run, `/steer/interrupt` remains distinct from stop, resend, `/follow`, and follow-up queuing, and controls expire after the next user message. `/follow` auto-follows only while the user is at the bottom and re-enables when the jump-to-latest action returns to bottom.
- Inline interactive visuals may be summoned by natural-language requests, but they render through the visual-module host contract and remain bounded thread content rather than arbitrary runtime heap state.
- Code-block actions include copy by default and may expose `/open-in-editor` only when a filename/path binding exists.
- The queued-message capacity is max 2 in FIFO order; when the queue is full, the composer must surface a queue full state and require the user to send, edit, or cancel an existing queued message before adding another.

Rules:
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- always-visible copy-icon on message rows
- jump-to-latest with unseen-count
- chat-control /steer and /re-runs stay constrained to the most recent user-sent message.
- /open-in-editor requires a resolved path
- /composer is a retired shorthand label; composer behavior is represented by the send/stop morph and most-recent-message actions above.
- visible copy button on ordinary fenced code blocks
- queue state is transient and is not restored across reload or restart
- Stop becomes disabled when a run completes and no next message is queued
- Edit restores content into composer and discards later history/work
- Resend retries the most recent message and discards later history/work

### Composer Behavior

Composer behavior is the live owner surface for the send/stop morph, per-message stop scope, jump-to-bottom affordance, always-visible copy controls, and the no-delete message policy. These rules remain part of the message-control contract above rather than a separate command family or chat-local history mutation model.

### 4.1 Chat footer, queue UI, and files touched -- implementation detail

The chat footer owns the send/stop morph, queued-message affordance, and visible latest-message actions, while files-touched output stays a compact projection of edit/diff activity rather than a second transcript.

Rules:
- Queue UI shows FIFO order, pending count, and stop/interrupt state without restoring transient queued text after reload or restart.
- Files touched entries show `Read:` / `Edited:` labels, diff counts, and click-to-open editor routes through the shared operation-card and editor target contracts.
- Footer controls, queue state, and files-touched summaries must remain synchronized with operation cards so command-card, web/search, terminal, and diff activity do not fork separate status models.
## 5. Commands (slash commands and custom commands)

The reserved slash-command surface is canonical and non-overridable.

### 5.1 Reserved built-ins

This section consumes the linked owner contract and stays aligned with it.

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /rewind
- /revert
- /share
- /settings
- /doctor
- /help
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /cancel resolves internally to cmd.chat.stop
- /web remains settings-visible and discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.
- Thread-management commands group resume, rewind, `/revert/share/archive`, settings, and `/help/doctor` help surfaces without turning every history operation into a separate local control family.
- Migration `/alias` and `/deprecation` handling keeps `/cancel` visibly deprecated toward `/stop` and keeps retired `/clear` behavior out of active command canon unless the command-catalog owner re-promotes it.
### 5.2 `/web` and `/skill`

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete.
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.
- The now-locked `/web` direction keeps web research as a first-class Assistant, Interviewer, and doc-builder capability even in Plan or Deep Plan contexts; permission-mode/mode-override rules must not silently auto-deny web-research, websearch, webfetch, model-native, provider-native, or PM-composed research paths merely because the thread is planning.
- Settings and help surfaces disclose provider support through a compatibility-matrix style view for first-class web tools, including support tier, provider order/fallback, credential state, and unavailable/high-side-effect controls.
- `/skill`, GUI skill management, and natural-language skill invocation share the same invoke_skill dispatch path; built-in skill surfacing is user-visible but does not create a separate MVP subcommand family.
- Bare `/web` is /help-only autocomplete and dispatches `cmd.chat.web.help`; executable web intents must resolve to an explicit subcommand and must not create slash-only or search-only event families.
- Legacy `/what` lineage is compatibility/help-only and may surface usage or autocomplete guidance, but it does not bypass the explicit `/web` subcommand grammar.
- `/web` UI-command schemas mirror the normalized web inputs: search uses `{ query }`, fetch/extract use `{ url }`, research uses `{ task }`, and crawl/map use `{ root_url, max_pages?, max_depth?, same_origin_only? }` with `root_url`, `max_pages`, `max_depth`, and `same_origin_only` surfaced as command-help fields.
- Direct slash execution uses the concrete grammar `/web search <query>`, `/web extract <url>`, `/web research <task>`, `/web crawl <url>`, and `/web map <url>`; `<query>` and `<task>` consume the remaining text verbatim, `<url>` / `URL` normalize to an absolute URL before dispatch, and parse failure shows usage help rather than guessing.
- Assistant Chat command-routing consumes `Plans/UI_Command_Catalog.md` for `/web`, `/skill`, reserved built-ins, and source obligation carry-through for `obl-037`, `obl-046`, `obl-047`, `obl-048`, and `obl-051`; stale local summaries are `/retire` lineage until the command-catalog owner promotes an active command ID.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- No subcommand family for MVP
- Skills panel
- Natural language
- doc-builder
- compatibility-matrix
- mode-override
- high-side-effect

Labels and values:
- /skill

Rules:
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- availability plus support-tier visibility in Settings
- availability plus support-tier visibility in `/web` help/autocomplete
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- cmd.chat.web.help
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
- command-routing
- obl-037
- obl-046
- obl-047
- obl-048
- obl-051
- /retire
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
### 5.5 Dispatcher parity

This section defines the canonical contract for this surface.

Core rules:
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.
- Reading phrases such as "read this site", "read this URL", and "fetch this page" resolve to `webfetch`; they do not route to `websearch` or provider `extract`.

Fields:
- intent phrase
- resolved tool key

Rules:
- NL intents and slash commands hit the same dispatcher
- "search the web for X" → `websearch`
- "extract this page" → `webextract`
- "read this URL" → `webfetch`
- "read this site" / "fetch this page" → `webfetch`
- "research topic" → `webresearch`
- Reading intents MUST resolve to `webfetch`, not `websearch`
ContractRef: ContractName:Plans/Tools.md#12. Web tool routing algorithm, ContractName:Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- command tables and routing docs must mirror the same mappings
## 6. Teach

Teach-owned durable behavior includes `user-locked` records: explicit user unlock, supersession, or revocation is required before automated memory cleanup, summarization, or profile migration can weaken or remove the stored behavior.


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
- browser capture chips (`browser_selection_context` and `browser_element_context`)

Attachment rules:
- files may include project files, logs, documents, archives, and generated artifacts addressable through the file-manager/editor contracts
- images render with preview, filename or source label, and size metadata when known
- URLs render as normalized link chips/cards and may later resolve into fetched/extracted web-activity cards
- code snippets pasted into the composer preserve formatting and language hinting when detection is possible
- voice input is a composer input mode for Assistant chat: captured speech becomes a visible draft message or pending input transcript before send, never hidden context, and it follows the same edit/send/cancel, privacy, and provenance rules as typed composer text.
- browser click/highlight/share flows produce explicit visible chips from user-triggered selection or element-pick actions; ordinary browser capture never arrives as hidden automatic context injection
- browser capture chips stay pending, visible, and removable until the user sends; `cmd.browser.add_selection_to_chat` creates a `browser_selection_context` chip, `cmd.browser.pick_element_for_chat` creates a `browser_element_context` chip, and neither command auto-sends a chat message
- Assistant chat owns the visible `/primary` browser-to-agent capture lifecycle: click `/highlight` and share actions create pending chips, chip target resolution may use explicit `/new-thread` creation when no writable thread/composer exists, and the flow remains user-visible through selection/highlight mode, share scope, revoke timing, multi-selection, persistence, and screenshots with capture.
- The locked attachment taxonomy replaces any older two-type rendered-selection wording with three explicit paths: browser-element (`browser_element_context`), browser-text-selection (`browser_selection_context`), and native-document-selection (`document_selection_context`). Browser text capture must not stay half-modeled as native `document_selection_context`, because browser selections are browser-specific and not document-source selections; `Plans/Prompt_Pipeline.md` is the `/primary` normalization consumer, while stale `Plans/newfeatures.md` and `/newfeatures.md` browser references are cleanup lineage only.
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

### 7.4 Question card and questionnaire system

This section defines the canonical contract for this surface.

Core rules:
- Question flows are locked to PM-managed draft state, required visible options plus a freeform path, resumable multi-question drafts, and explicit dismissed or paused behavior instead of fabricated answers.
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.
- The question tool contract is locked to a multi-question envelope, normalized output statuses, object-array options, included answer source, and top-level orchestrator ownership of user questioning.
- The multi-question lifecycle is `draft → incomplete → ready_to_submit → submitted → paused`: `draft → incomplete` when the user begins answering, `incomplete → ready_to_submit` when all `required` questions are answered, `ready_to_submit → submitted` when the user confirms submit, and `paused` when the user dismisses without submitting.
- Multi-select support is an MVP UX requirement where the schema sets `multi_select`: render options as a checkbox group, preserve selected option IDs in order, show required validation before submit, and keep freeform input additive when `allow_freeform` is true.
- Subagent question tool access follows default-denial and cannot address users directly unless explicitly re-enabled by run config; subagents escalate to the parent orchestrator, and the parent owns the `assistant-chat-design.md §15.2` user-question surface decision. Subagent-direct question flows are prohibited product behavior, not a configurable local default.
- `allow_freeform` is canonical. `allow_other` is a retired alias, and the historical `allow_freeform? / allow_other?` slash-ambiguity resolves to `allow_freeform`.
- `default_values` and `draft_value` are different concepts: `default_values` seeds option IDs, while `draft_value` stores the current freeform or draft answer text.
- `single_question` is legacy syntactic sugar over the questionnaire envelope with exactly one QuestionItem; it uses the same answer source, draft, dismissal, and submit lifecycle as `questionnaire`. Decision #9 resolves the earlier Future Fields / TBD annotation: `response_kind` is LOCKED to `"selection" | "freeform" | "mixed"` and `validation_state` is LOCKED to `"valid" | "invalid" | "pending"`; both fields are optional and omitted when not needed by the question type.
- Single-question callers emit `{ mode: 'single_question', questions: [item] }` and receive the same response envelope; the host may accept a simplified `{ question, options?, ... }` alias only by internally promoting it to the full envelope before processing.
- Legacy tool-shape aliases `header?: string`, `text: string`, and `options?: string[]` are accepted only at the compatibility boundary and normalize into the questionnaire envelope; legacy `answer: string` output normalizes into the canonical answer array with source metadata.
- Multi-question `questionnaire` and `/questionnaire` cards render selectable options from `options?: Array<{id, label, description?}>`; `string[]` remains backwards-compatible only for legacy `single_question` callers and must be normalized to object-array options before draft storage, validation, or final answer submission.
- The shared question-card applies across Assistant, Interviewer, `/Interviewer/requirements`, and `/document-builder` flows; it is not Interview-only and does not force strict one-question-at-a-time sequencing.
- Question-card inputs support `allow_other`, `allow_multi_select?: boolean`, `required?: boolean`, `placeholder?: string`, and legacy `default_value?: string | string[]` as compatibility aliases that normalize into canonical `allow_freeform`, `multi_select`, `required`, `placeholder`, and `default_values`.
- Shared question styling uses one consistent question-card `/flow` across Assistant, Interviewer, requirements, and `/document-builder` questions, so question visuals are not restyled ad hoc per surface and PM-owned draft state remains the answer owner.
- The minimum output compatibility shape is `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`, `answers: Array<{ question_id, value, source: "option" | "other" | "freeform" }>`, `submitted: boolean`, and `submitted_at?`; canonical storage may also expose `answers: Array<{question_id, values: string[]}>`.
- Dismissed and paused flows preserve submitted-vs-dismissed distinction: `status = "dismissed"` / dismissed state pauses the flow and must not fabricate partial submitted answers, auto-submit, or auto-cancel the broader thread. Paused is UI-only for a backgrounded/navigated-away widget and does not produce a tool output until resumed or dismissed.
- `/dismiss` is a retired shorthand for the same question-card exit path; canonical behavior is the dismissed/paused state transition above.
- The question-flow supports single-choice and multi-choice question-card layouts; `allow_other = true` keeps the `Other` freeform route visible for legacy /callers as well as new questionnaire callers.
- Question flows never perform auto-submitting or auto-cancelling when dismissed.
- `/submit` is the explicit user action that moves a ready question flow to submitted; it is separate from dismissal and is never invoked by an inline visual through `sendPrompt`.

Fields:
- mode: "single_question" | "questionnaire"
- questions: Array<QuestionItem>
- status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"
- flow_state: "draft" | "incomplete" | "ready_to_submit" | "submitted" | "paused"
- answers: Array<{question_id, values: string[]}>
- answers: Array<{ question_id, value, source: "option" | "other" | "freeform" }>
- answer_text?
- source?: "option" | "other" | "freeform"
- options?: Array<{id, label, description?}>
- options[]
- allow_other
- allow_other = true
- allow_multi_select
- single-choice
- multi-choice
- required?: boolean
- placeholder?: string
- default_value?: string | string[]
- submitted: boolean
- submitted_at?
- Headless/HITL-unavailable = `status = "unavailable"`
- Subagent question tool access is DENIED by default

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed
- incomplete
- ready_to_submit
- submitted
- paused

Rules:
- NOT via `sendPrompt`
- Something else
- Always-visible options
- Drafts auto-save until submit
- Exiting/dismissing does NOT auto-submit
- Thread-scoped draft state
- status: 'dismissed'
- /submit
- draft
- question_id
- question
- allow_freeform
- allow_other (retired alias; use allow_freeform)
- multi_select
- default_values?: string[]
- draft_value?: string
- string[] backwards-compatible
- response_kind: "selection" | "freeform" | "mixed" (optional; LOCKED by Decision #9; earlier Future Fields / TBD note resolved)
- validation_state: "valid" | "invalid" | "pending" (optional; LOCKED by Decision #9; earlier Future Fields / TBD note resolved)
- default-denial
- slash-ambiguity
- drafts auto-save continuously
- required questions block final submit
- question cards may include a visual
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
- source-text-first visual context may be attached to the question-card, but PM still owns the draft and submit lifecycle.
- /callers
## 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)

### 8.1 Canonical planning model

This section defines the canonical contract for this surface.

ContractRef: Plans/FinalGUISpec.md#15.4 Planning panel widget (sticky sidebar)

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.
- Visible plan/checklist review is checklist-forward execution-tracker behavior: Plan and Deep Plan show a reviewable plan artifact plus the normalized TODO/checklist projection before execution, keep live execution progress connected to that projection, and do not hide planning inside an opaque unified planning/execution loop.
- Plan/TODO review exposes `/add/remove/reorder` structural controls before approval; after approval, structural edits require a new revision while status-only execution progress remains thread-visible through the sticky panel and `chat.plan_todo_updated` history.
- User edits to a Deep Plan artifact reconcile through PM-extracted `/diffs`: TODO changes are normalized into the thread TODO list, emitted through `chat.plan_todo_updated`, and execution continues from the updated TODO projection rather than from a stale artifact copy.
- Thread `/run-level` plan state distinguishes draft, approved, executing, completed, blocked, and superseded states; `/replans` create explicit new draft/revision records instead of mutating prior plan history invisibly.
- Competitive rationale: Cursor is the closest comparator because it emphasizes explicit Plan mode, visible plan/checklist review, and live execution progress; Codex is weaker as a direct checklist-forward template because its planning/execution loop is more unified; Claude Code remains relevant for visible task/todo management patterns but does not become PM's primary planning template without stronger direct-doc evidence.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated

Labels and values:
- Plan
- Deep Plan
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
- Research continuation in the Assistant Chat GUI starts from the current work-item ledger for the active planning run, then narrows repo research to the most relevant GUI/planning docs for the feature areas under review instead of sweeping unrelated docs by default.

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
- LOCKED behavior: Deep Plan does materially more thinking, research, and clarifying-question work than standard Plan; the Plan vs Deep Plan difference is degree/intensity, not categorical.
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

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.
- TODO items include `order_index` and `notes`; `order_index` owns item-level ordering, while `notes` carry reviewer or execution context without changing status.
- Legacy optional spellings `notes?` and `order_index?` normalize to canonical `notes` and `order_index`; this intentionally retires the source `?` suffix rather than dropping notes or ordering.
- Structural edit means adding, removing, reordering, or replacing TODO items; status update means changing item execution state or notes without changing the item set.
- When the auto-use heuristic fires mid-conversation, on-trigger behavior may populate or refresh the TODO projection when a plan artifact changes, but it must emit `chat.plan_todo_updated` before execution observes the revised list and must keep the plan panel state reviewable.
- Outside Plan and Deep Plan, non-Plan execution may auto-use `todowrite` when the task is multi-step enough to benefit from visible tracking, including dependency-bearing work, multi-file or multi-subsystem work, delegated subagent or crew execution, or an explicit user request to track progress.
- `todowrite` auto-use on-trigger behavior emits a tool call with proposed TODO items. If auto-approved by the resolved permission preset, items are created silently and `chat.plan_todo_updated` records the mutation; if ask-mode, the user sees an approval prompt listing the proposed TODO items before creation.
- `Superseded TODO N/N` is a plan-level summary for superseded plan revisions, not an item-level TODO status; `superseded` stays out of the active TODO status enum.
- `verification_hint` may be item-level or plan-level, but the payload must label the scope instead of relying on position in the rendered panel.
- Legacy tool payloads `todos: Array<{ id?, content, status? }>` and `todos: Array<{ id, content, status }>` normalize into the Assistant TODO schema with `todo_id`, `title`, `summary`, `dependencies[]`, `owner_hint`, and `verification_hint`; `TODO` remains the visible checklist concept, not a second schema.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- order_index
- owner_hint
- verification_hint
- notes
- pending | in_progress | completed | blocked | skipped
- superseded (plan-level only)
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- todos: Array<{ id?, content, status? }>
- todos: Array<{ id, content, status }>
- TODO
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
- on-trigger
- item-level
- plan-level
- Superseded TODO N/N
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan
- chat.plan_todo_updated
### 8.7 Review loop for planning artifacts

Standard Plan review:
- user may continue the chat, request revisions, or open the plan in the editor
- follow-up chat responses may revise the planning artifact

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

Deep Plan review:
- the plan document opens automatically in the editor / preview-capable planning surface
- users may edit the markdown directly
- on source-backed or deterministically mapped selections, the review palette offers `Comment / Ask`, `Replace with...`, `Insert after...`, `Remove / Strike this`, and `Send selection to chat`
- durable actions create annotations on the existing `note_record.v1` lineage; `Send selection to chat` creates a visible pending `document_selection_context` chip on the owning thread and stays a separate ephemeral action, not a durable annotation
- if the owning thread is terminal-associated or `/non-writable`, `send-to-chat` defaults to a new thread in the same owning surface rather than reviving the old thread or cross-routing to an unrelated target
- v1 does not expose direct `patch-apply` behavior from document annotations; mutating annotations are applied only through targeted revision after validation

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Deep Plan targeted revision rules:
- `Resubmit with Annotations` launches a targeted revision pass over docs with open durable annotations, or a user-selected subset
- targeted revision may update the plan document and/or answer question/comment annotations
- targeted revision MUST NOT auto-run Multi-Pass Review
- conflicting or stale mutating annotations are excluded from automatic revision until the user resolves them
- requested/effective revision capability remains visible when a requested structured-revision path degrades to validated local output or `chat_handoff_only`

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Deep Plan annotation-handling rules:
- preserve the annotation lifecycle `open -> addressed -> resolved`
- preserve deterministic position + quote selector re-anchoring
- if an anchor cannot be reattached, keep the annotation open and show an explicit warning rather than silently dropping it
- comment annotations may coexist with other annotations on the same span; overlapping mutating annotations conflict by default
- final review gates use `no open annotations`, not `no open notes`
- read-only / no-source-map renders such as plan-graph-like surfaces are `Send selection to chat` only in v1 unless a stable semantic-anchor contract is added later

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

Document selection and annotation handoff rules:
- `selection-to-chat` and `document-selection` always create chat-visible pending composer chips; they must not silently inject hidden messages or mutate a thread before the user sends.
- The composer prep tray is shared by `Context` and `Attachments`; `document-selection` chips live under `Context`, failed sends keep chips visible, successful sends clear chips for that turn, and tray contents persist per thread when switching threads.
- GUI defaults: the annotation drawer may `auto-open` only on the first durable annotation creation in a bundle/page context; after that, drawer state is sticky and must not force-open for every annotation. Hidden chat on `send-to-chat` does not auto-open by default: the surface adds the selection to pending composer chips, pulses or badges the chat launcher, and shows a lightweight `/snackbar` with `Selection added to Assistant chat` and an `Open chat` action so document-review flow and batching stay intact.
- The unified `pre-send` composer prep strip/tray groups typed chips by source, including `doc selection`, `browser context`, `Context Lens`, and attachments where applicable. Do not create a `document-selection-only` `/tray` or a separate document-only strip.
- Send-to-chat target resolution is isolated to the resolved owning thread or `/surface`: explicit user-selected target wins, then page-owned chat surface, then explicit `new-thread` creation when no writable target exists. Hidden chat panels still count as owning targets; no silent `cross-thread` fallback is allowed.
- Surface labels are `surface-dependent`: document review may expose `Send selection to chat`, `Send to Assistant`, or `Send to Interviewer`, but all labels normalize to the same typed handoff and requested/effective target audit fields.
- Selection forwarding obeys `/privacy` and sensitivity boundaries from FileSafe; blocked, expired, or scrubbed chips remain visible with `/statuses` and reason codes rather than pretending the send succeeded.
- Chat must not render `full-document` bodies inline for Builder or Interview handoff. It should keep `/document-pane` or editor pointers plus bounded excerpts, context summaries, and provenance instead of dumping the whole document into chat.
- V1 surface matrix: `/source-backed` editable text docs and deterministic markdown previews expose all five actions; read-only rendered views without stable source mapping may allow `quote-only` `Comment / Ask` and `Send selection to chat`; `Replace / Insert / Remove` stay disabled there; browser/HTML click-to-context surfaces do not inherit `document-annotation` semantics in v1.
- Conflict and stale outcomes are explicit: `overlaps`, `contradicts`, and `stale_after_edit` are later-phase conflict/status labels that can appear in audit or review UI, while current automatic revision still excludes conflicting mutating annotations until resolved.
- Re-anchoring outcomes are `position_match`, `quote_match`, and `anchor_not_found`; `position_match` or `quote_match` keeps the annotation eligible, while `anchor_not_found` leaves it `/unresolved` and open.
- `/resubmit` may target all open annotations or a selected subset. Selected-subset resubmit, consistent rationale capture, and compact chat-side digesting for many sent selections are `later-phase` improvements, not current hard requirements.
- Recovery is anchored by `revision_run.{bundle_id}.{revision_id}`. Interrupted runs preserve `revision_id`, `resumed_from_revision_id?`, `interrupted_at`, safe-point metadata, and per-annotation history; already-validated annotation outcomes remain persisted through resume/retry.
- GUI impact stays first-class: the annotation action menu is a reusable `/palette`, not a one-off context-menu hack; drawer filters include `Open / Addressed / Resolved`, operation-type badges or filters, pre-send chip state, `/overlays`, and ghost-preview styling for pending or hover-only payload previews.

### 8.8 Approval, queue, and execution handoff

Approval rules:
- Planning output never auto-executes.
- The assistant must wait for explicit approval to execute.
- Approval to execute means the planning artifact/TODO state is frozen as the execution starting point.
- The user may still continue planning instead of executing.

Required primary post-plan actions after Plan or Deep Plan produces a plan:
- `Accept the plan and build with Yolo`
- `Accept the plan and build on default permissions`
- `Exit plan`
- `Suggest plan changes`

Post-plan action semantics:
- `Accept the plan and build with Yolo` freezes the planning artifact/TODO state, switches out of Plan/Deep Plan into the correct execution mode and effective execution Persona, requests the `yolo` runtime posture, and begins or queues execution from the accepted plan.
- `Accept the plan and build on default permissions` freezes the planning artifact/TODO state, switches out of Plan/Deep Plan into the correct execution mode and effective execution Persona, keeps normal/default permissions, and begins or queues execution from the accepted plan.
- `Exit plan` leaves Plan/Deep Plan and returns to normal prompting without beginning build execution.
- `Suggest plan changes` keeps the planning agent active, revises the plan from user feedback, re-proposes the updated plan, and shows the same four primary actions again.

Secondary affordances may include `Open in Editor`, `Save As`, and, after an accept action, `Queue Execution` when another run is active in the same thread. Crew execution may be selected through execution configuration or a crew-specific flow, but it must not replace the four primary post-plan choices.

Execution rules:
- If the thread is idle, an accept action starts execution immediately.
- If another run is active in the same thread, an accept action may place the approved plan behind the current run through `Queue Execution`.
- The follow-on execution run uses canonical runtime `regular` by default, or `yolo` only when the user explicitly selects `Accept the plan and build with Yolo`.
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
- File Manager `Add to Assistant Chat` uses that command to insert a visible canonical file reference into the active composer/thread context; it must not inline full file contents as a hidden side effect
- file references are file-only in MVP; folder insertion is out of scope
- clicking a file chip or file citation opens through the shared open-file contract rather than through chat-local navigation rules

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Restore and review boundaries:
- `cmd.chat.revert` is the canonical entrypoint for `Revert last agent edit`
- omitted `target_message_id` resolves to the latest assistant turn in the current thread with persisted file mutations
- if that assistant turn touched multiple files, the revert applies to the whole turn across all affected files
- `cmd.chat.rewind` remains conversation-history rewind only
- Chat may preview or summarize diff/review context, but Source Control owns hunk actions, compare targets, conflict resolution, final stage / mark-resolved actions, and Git /unstage/discard mutations
- Chat-thread diff cards use a preview-vs-open-vs-rollback boundary: preview is a compact chat-thread summary, open routes to the owner file/diff surface, and rollback routes through restore/rollback history rather than hidden chat-local diff mutation.
- Worktree reverts use the absolute paths captured in the mutation log, so a deleted worktree example such as `/project/.puppet-master/worktrees/thread-abc/src/main.rs` fails with a file-not-found style inline error instead of recreating missing directories or resolving through the current `working_directory`.

Assistant chat is a review-oriented GUI consumer of Source Control, not a replacement Source Control owner. When a run-produced or patch-first diff appears in chat, chat may summarize, annotate, or collect review-comments, but `Review mode`, `Open Review Mode`, `Source Control > History`, `Source Control > Changes`, `Source Control > Worktrees`, `Graph`, and `Worktrees` remain the owned destinations for compare, topology, conflict, and commit operations. Chat CTAs may call `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, `cmd.source_control.toggle_generated_filter`, `cmd.source_control.suggest_commit_groups`, `cmd.source_control.accept_commit_group`, `cmd.source_control.generate_commit_message`, `cmd.git.worktree.open`, and `cmd.git.worktree.open|compare|recover|prune|focus_lineage` through the command catalog; `/event/storage` records the route, selected compare target, and review handoff without persisting generated commit text as history before acceptance. `/tradeoffs`: AI commit batching can help users group changes, but false grouping can make misleading history, so the user remains the final approver.

The files-touched strip is an aggregate chat preview: clicking a path under files-touched, `Read:`, or `Edited:` opens the canonical source file, while any diff-oriented affordance opens the canonical diff/review owner surface. Chat may preview diffs and edit counts, but it must not own hunk-level stage/unstage/discard controls, conflict-review state, or chat-local review mutations.

Worktree and completed-work cards in chat show SCM context as a consumer projection: `/branch/worktree`, `/worktree/run`, multi-branch ownership, worktree-safe-point relation, safe-point/baseline restore target, compare target, merge target, preserved-local-work summary, and actions for `Open in Source Control` and `Compare run output`. Chat never treats tier-level, run-scoped, or completed-work SCM `/ownership` badges as canonical ownership; it deep-links to Source Control, Run Graph, Orchestrator `Tiers`, `Node Graph`, `History`, and `Evidence` with exact context. Activity-bar copy is function-first: `GITHUB ACTIONS`, `ACTIONS`, and Source Control labels must reflect the function rather than a generic `Git` icon, and concept-only notes about the older `Git (GitHub)` framing are migration evidence, not live panel ownership.

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
- `grep(pattern, path?, glob?)` -> transparent regex search over project files. When the per-project sparse n-gram index can narrow the query, grep uses it without changing the interface, limit, timeout, or permission model. When the index is missing, disabled, corrupted, building without a valid snapshot, or skipped for query-specific reasons, grep falls back to raw ripgrep (`raw-ripgrep`) instead of preserving a stale raw-ripgrep-only assumption. Stale-but-valid snapshots remain usable, and dirty-layer freshness guarantees still apply.

Dedicated GUI log surfaces expose `logsearch` / `logread` summary rows, drill-down, export, and on-demand deref without turning full payloads into default chat transcript content.

The agent-facing `search-tool` summary in `Plans/assistant-chat-design.md` (`/assistant-chat-design.md`) preserves same-freshness guarantees: stale-index disclosure must say when a valid snapshot is serving results, when raw ripgrep fallback is active, and when dirty-layer freshness is still protected.

Assistant-facing search summaries reference `Tools.md #### 3.5.A` for grep acceleration performance targets and the index-build priority mechanism; chat copy describes user-visible fallback and freshness outcomes rather than re-owning implementation details.

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

### Message type taxonomy

Canonical chat records use the following message taxonomy.

| message_type | sender | properties | rendering |
|---|---|---|---|
| `user` | human | `text`, `attachments[]`, `edit_history[]` | left-aligned bubble |
| `assistant` | model | `text`, `tool_calls[]`, `citations[]` | right-aligned bubble |
| `system` | runtime | `text`, `severity` | centered notice |
| `tool_result` | tool | `tool_id`, `output`, `exit_code` | collapsible card |
| `operation_card` | runtime | `operation_type`, `status`, `progress` | inline card |
| `blocked_notice` | runtime | `blocked_family`, `allowed_action_ids[]` | warning card |
| `subagent_card` | runtime | `agent_id`, `role`, `status`, `handoff_summary?` | inline card |
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
- thread metadata includes `created_at`, `updated_at`, `title`, `mode_overlay`, `requested_persona`, `effective_persona`, `persona_selection_source`, and `persona_override_owner_id`; `persona_id` remains registry/storage lineage only and is not a thread runtime Persona identity field

Generation and lineage rules:
- the system MUST NOT mint a durable `thread_id` for an unsent empty draft
- `title` is auto-generated from the first user message and remains user-editable without changing identity
- `mode_overlay` stores the effective workflow overlay for the thread using the canonical closed overlay enum
- thread records reference their originating `dev_session_id` when present, but a single `dev_session_id` may relate to multiple branched or restored threads
- when terminal lineage exists, `terminal_session_id` remains attached for audit even if the terminal later exits

Terminal-associated threads are ordinary chat threads with terminal lineage, not a second terminal-thread identity model. If a message, command card, restore target, or permission path describes the owning thread as `terminal or non-writable`, the surface MUST treat that thread as terminal-associated or read-only/non-writable for mutation purposes: chat may show bounded preview and audit state, but live terminal/output/ports `/surfaces` remain owned by the terminal or dev-session identity. The label `terminal-thread` is a compatibility/search label for this boundary, not a durable object type.

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
- Thread restore must rehydrate the visible Investigation Context header, linked artifacts, requested/effective debug posture, revalidation reason (if any), and frozen target bindings without silently rebinding to a different target; this no-silent-rebind rule applies at resume-time before any mutation-capable automation continues.
- `attention_required` investigations do not auto-resume execution; reopen restores the Investigation Context with the current `attention_required_reason_code` and allowed recovery actions.
- `failed_cleanup` investigations reopen directly into cleanup-recovery state; PM must not start a new mutation-capable debug loop against the same target until residue is resolved, rolled back, or explicitly promoted into the durable fix lane.

**Revalidation reasons** that prevent silent resume include at minimum target replacement, auth/account switch, worktree or branch drift, HEAD drift for bound file/worktree targets, expired instrumentation, and stale safe-point or remediation lineage.

**Deterministic final-state mapping:**
- `resolved` pairs with `stop_reason_code = investigation.resolved_verified` or `investigation.analysis_only_completed`.
- `attention_required` pairs with `stop_reason_code = investigation.attention_required` plus `attention_required_reason_code`.
- `blocked` pairs with `stop_reason_code = investigation.blocked` plus shared `blocked_reason_code`.
- `failed` pairs with `stop_reason_code = investigation.verification_failed`, `investigation.no_repro_observed`, `investigation.budget_exhausted`, `investigation.runtime_unavailable`, `investigation.target_unreachable`, or `investigation.adapter_unavailable`.
- `failed_cleanup` pairs with `stop_reason_code = investigation.cleanup_failed`.
- `cancelled` pairs with `stop_reason_code = investigation.cancelled_by_user`.
- `superseded` pairs with `stop_reason_code = investigation.superseded`.

**Debug automation budget and attention defaults:**
- Initial automated browser/evidence loop ceilings are `max_browser_scenario_branches = 3` and `max_consecutive_no_new_evidence_loops = 2`.
- Temporary mutation and resume ceilings are `max_active_temporary_instrumentation_lanes = 1`, `max_cleanup_retries = 2`, and `max_attention_required_resume_cycles = 3`.
- The Debug-specific attention taxonomy includes `auth_handoff_required`, `manual_repro_required`, `manual_verification_required`, `external_app_start_required`, `session_reconnect_required`, `missing_credentials_or_secret`, `degraded_evidence_review_required`, `sensitive_capture_review_required`, `adapter_switch_recommended`, `target_selection_required`, `workspace_binding_required`, and `import_bundle_required`.
- Budget, blocked, and attention stops remain machine-readable through `stop_reason_code` values such as `investigation.verification_failed`, `investigation.no_repro_observed`, `investigation.budget_exhausted`, `investigation.attention_required`, `investigation.blocked`, and `investigation.runtime_unavailable`.

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

Normal thread `context-usage` behavior is owned by this section and `Plans/usage-feature.md`: Assistant, Interview, BrainStorm, and Crew views route cross-doc open/focus actions to the canonical thread usage surface rather than redefining usage semantics locally.

`Plans/assistant-chat-design.md` and `Plans/usage-feature.md` are the primary feature owners for context/usage display; command, storage, runtime-identity, and artifact-target docs remain required consumers so `/open` behavior resolves through canonical route/open to the editor-tab Context Detail Pane instead of a chat-local special case. Stale wording that sends this seam to a side-panel, artifact-local, or chat-local usage route is non-buildable until reconciled against those owners.


### 12.0 Context Detail Pane contract

Every Assistant or Interview thread exposes a visible context-usage summary and a drill-down Context Detail Pane for the context actually consumed by that thread.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

**Required visible thread-level signals:**
- current context usage against the effective model window
- the last compaction / truncation reason when compaction changed what remained in prompt
- whether displayed cost/token figures are provider-authoritative or estimated
- whether additional hidden/background usage contributed to the thread total

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

**Context Detail Pane information architecture:**
- the editor-tab pane has top-level `Curated` and `Raw` views
- `Curated` contains `Overview`, `Breakdown`, and `Messages`
- `Overview` shows thread/session title, message counts, headline provider/model/mode/persona summary (`/model/mode/persona`), effort/worker summary when relevant, and headline tokens/context/cost metrics (`/context/cost`)
- `Breakdown` shows the context usage bar, token buckets, and grouped breakdowns by role, tools, provider, and model when available
- `Messages` shows one expandable row per message with role, worker type, mode, model, time or duration, total tokens, and cost
- `Raw` shows an accordion list of messages; expanding a message exposes the full serialized payload for that message, plus related `tool-part` payloads, provider metadata blobs, and path/runtime data needed for debugging

**Required Context Detail Pane breakdown:**
- system and instruction blocks
- user and assistant messages
- compiled context attachments and forwarded document selections
- tool-derived or activity-derived context when the thread uses it
- run-level or message-level usage snapshots derived from canonical `usage.event` and `run.completed.usage`
- debug-only Investigation Context items when the thread is an active debug-thread / debug thread

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
- `target`
- `requested_target?`
- `effective_target?`
- `display_label?`
- `primary_target_summary`
- `debug_target_kind`
- `adapter_id?`
- `investigation_phase`
- `state`
- `verification_state?`
- `attention_reason_code?`
- `blocked_reason_code?`
- `revalidation_reason_code?`
- `active_instrumentation_count`
- `last_updated_at_utc`

Chat-local aliases such as `primary_target` and `final_or_intermediate_state` are retired. Assistant Chat consumes the canonical field names above and may layer presentation labels on top, but it must not rename the durable data contract. This is the canonical Contracts_V0 §5.1A to assistant-chat-design §12.0A field-name boundary for Investigation Context.

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
- ordinary browser `/capture` remains explicit and user-triggered.
- Debug auto-ingestion is allowed only inside an active investigation and must create visible Investigation Context items rather than hidden messages.
- Agent-fed, agent-emitted in-scope evidence may auto-enter the visible Investigation Context only inside the active Debug investigation; it is a bounded debug-context item, not a hidden message or an exception to the normal browser-capture rule.
- Investigation Context may render as a card, `/chip/panel`, or equivalent compact surface, but attach, `/removal/revocation`, and `/revoke` behavior must remain explicit and user-visible.
- Command-surface actions for Investigation Context attach and revoke must reflect visible state changes rather than hidden injection.
- every Investigation Context item must expose provenance, timestamp, redaction/truncation state, and a revoke action.
- raw logs, traces, screenshots, recordings, and full transcript payloads remain owned by Runtime Artifacts; Investigation Context carries bounded summaries and stable refs rather than raw unbounded payloads.
- Investigation Context is summary-first, bounded, redacted by default, user-visible, and revocable: the chat surface shows the summary/ref/item state first, keeps raw artifacts in the shared runtime-artifact system, and lets users revoke individual items or the visible bundle without implying deletion of the underlying artifact record.
- Investigation Context filtering groups by `investigation_id` and may narrow by phase, item state, evidence role, cleanup state, restore state, instrumentation state, or verification state; cleanup, restore, and instrumentation visibility stays in the visible context surface while the raw manifest, artifact bytes, and export/import schema remain owned by Runtime Artifacts.

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

This section defines the canonical contract for this surface.

Core rules:
- Assistant Chat, `Plans/UI_Command_Catalog.md`, and `Plans/FinalGUISpec.md` remain live propagation targets rather than verify-only notes for blocked-state, slash-routing, visualizer, provider-disclosure, question, planning, terminal, and audit-field canon. Interface-shape and behavioral-edge requirements must route to owner corrections plus consumer reconciliation instead of disappearing into cross-reference-only text.
- `Plans/assistant-chat-design.md` is the PRIMARY OWNER for chat modes, activity transparency, question system, TODO, operation cards, slash commands, `/auto-follow`, `/inline` visualizer and `/Mermaid` rendering, `/questionnaire`, the `/web` family, `/skill` helper behavior, `/cancel` deprecation, `/edit/resend` controls, plan-mode auto-use/auto-deny boundaries, and `/lsp/question/todo/web` carry-through; `Plans/FinalGUISpec.md` and `Plans/Permissions_System.md` consume the three-way operation-card and permission surfaces without replacing this owner.
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Shell owns interactive state; chat owns preview+audit.
- Operation cards preserve the three-way rendering distinction across terminal, search, and diff/web cards; the card-family table below owns the terminal/command, web/search, and diff/edit anatomy for Assistant Chat.
- The term `inline operation card` names this shared card family when it appears in cross-document terminology.
- PM must not describe the unified operation-card model as a separate activity strip, external terminal pop-out, or non-unified card behavior.
- Operation cards are restricted to lifecycle-bearing operations, exclude other widget families, and use a locked card-level state machine reconciled against the 8-state agent/process taxonomy.
- The inline operation-card family explicitly EXCLUDES question cards, permission-request approval cards, the sticky plan-tracker panel, reasoning-transparency blocks, and delegated-task or subagent disclosure blocks; those are separate widget families and require an explicit design decision before becoming operation-card variants.
- A batch-card is an operation-card specialization only when it represents a lifecycle-bearing batch operation; it does not absorb the question, approval, TODO, reasoning, or delegated-task families.
- Task and subagent operation cards preserve `pending → running → completed | failed | cancelled | timed_out`; failure emits a `task.failed` event with error detail, regular child-operation timeouts default to `120s`, long-running child operations default to `300s`, retries remain parent-owned, and child access to `question` is denied unless parent orchestration grants it.
- The legacy compact badge shorthand `pending→running→completed|failed|cancelled` is only a base path; `running → blocked` and `blocked → running | cancelled` are explicit transitions triggered by recoverable waits such as permission denied, FileSafe held, or MCP unavailable.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools independently visible and ask-gated in plan presets, allow strict read_only/no-network presets to deny them, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Chat terminal-handoff rules are preserved: interactive, long-running, stdin/TTY, watch/server, or user-promoted operations bind to a terminal session while chat keeps the bounded preview, audit card, and stable `Open in Terminal` route.

Fields:
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- status_badge_state

Permission rules:
- deny
- once
- for session
- always
- /session/always/deny
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"

Rules:
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator, and exit `/truncation-style` details
- READ-ONLY and non-interactive
- One card per command `/instance`
- Retries create a new terminal and therefore a new mini terminal card
- Open in Terminal
- terminal-handoff
- pending
- running
- completed
- failed
- cancelled
- blocked
- starting
- exited
- denial_reason_code
- denial_source
- suggested_recovery_action
- projection_freshness
- projection_health
- adapter_id
- adapter_unavailable
- question default `allow` only when HITL is available
- read_only
- plan
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- simple read/grep/glob results remain inline text, not cards
- blocked responses must be machine-actionable through `allowed_action_ids[]`
- error naming aligns to `adapter_unavailable`
- batch-card
- question cards
- permission-request
- plan-tracker
- reasoning-transparency
- delegated-task
- EXCLUDES

Inline operation card metadata table:

Type-specific primary actions, card-specific divergence rules, and card-summary defaults are captured by the table below.

| Card family | Collapsed summary | Primary action | Detail and payload behavior |
| --- | --- | --- | --- |
| command card | `Ran: <command>` or `Running: <command>` | `Open in Terminal` / focus owning session | May show bounded live tail while active; large output stores full data behind refs/blobs and completed verbose cards default collapsed. |
| web/search card | `<operation>: <query/url> — N sources` | open search results view or sources/results/browser detail surface | Shows source count or scope summary, support tier, fallback disclosure, and warning/error text; search and diff cards do not need live streaming behavior. |
| diff/edit card | `<path> +N −M` | editor diff open at relevant file/range | Remains a distinct operation-card subtype and does not silently inherit generic fenced-code copy behavior. |

The files-touched strip is the compact aggregate view for diff/edit activity; each file entry shows diff counts such as `+N −M`, and `Read:` / `Edited:` / files-touched click-to-open routes through the shared editor diff/open-file target.

Failed or blocked cards surface the key failure line in collapsed form without forcing expansion. All cards persist in thread history like other activity entries, and large payloads move through refs/blobs while cards show bounded previews.
Operation cards are not minimal-only captions: `/watch-mode` terminal work, search-result cards, and `/diff` edit cards share the richer metadata and bounded-preview anatomy unless a later owner contract specializes them.
Inline operation cards are the shared chat-history artifact for command/bash, search/web, and file edit/diff activity; they are non-final previews for operational work and remain separate from question cards, `/approval/plan` surfaces, sticky plan panels, thought-stream blocks, and subagent blocks.
Per-message activity transparency sections for bash/commands, web search, files explored, files changed, and code diffs are collapsible and default-collapsed; expansion reveals bounded details without turning the whole message into a raw log dump.

### 13.2 Web activity and provenance

This section consumes the linked owner contract and stays aligned with it.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context, Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability

Core rules:
- Preserve the Firecrawl-specific audit payload keys as exact contract-owned fields.
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- `webfetch = native Site Reader path by DEFAULT`: Site Reader is the PRIMARY architecture for PM-native site reading, provider-delegated fetch through Firecrawl scrape, Exa crawl, Tavily extract, or similar adapters is an ALTERNATIVE path, and the `Reading Site` activity label is RESERVED for the native Site Reader path.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- The global provider stack is user-changeable in Settings, but per-operation priority reordering is NOT MVP; consumers show the effective provider order and capability result rather than allowing hidden per-operation reshuffles.
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl. When Firecrawl transport changes, the activity card and audit payload disclose the requested and effective Firecrawl route.
- Site Reader canon is native, detail-level, token-efficient, iframe-aware, and requires full browser interaction in v1; it reserves `Reading Site` for the PM-native Site Reader path and prevents provider-routed fetch from reusing that reserved identity.
- `Extracting Site` and `Reading Site` are different evidence paths and failure modes: `Extracting Site` uses provider-level extraction, while `Reading Site` uses PM's native Site Reader.
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; same URL change tracking requires a previous fetch in cache/storage and returns `change_status: "new" | "same" | "changed" | "removed"` in output rather than disappearing silently.
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- The Firecrawl owner section must preserve shared routing/audit disclosure for requested/effective provider selection, fallback visibility, denied-web projection, and canonical web error taxonomy linkage.
- Denied web-operation activity preserves `tool.denied.payload.meta` with `web_operation`, `web_input`, `denial_reason_code`, `denial_source` (`policy` | `permission` | `mode` | `user`), `suggested_recovery_action`, requested adapter/projection fields, `allowed_action_ids[]`, and `headless_denied` when present.
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- All web tools share a common output field set that includes provider identity, routing reason, timing, cache status, and standard error or warning fields.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.
- Web/provider activity consumes tool-specific payload extensions through the `/tool/storage/runtime` bridge; owner contracts define payload shape while chat owns visible provenance, setup guidance, and runtime disclosure.
- History rows and `/inspector` details combine top-level requested/effective runtime fields with the web child payload and dereference `sources_ref`, `content_ref`, `map_ref`, and `answer_summary_ref` only on demand. `sources_ref` points to a normalized source-set or blob-ref with `URLs`, /titles/snippets/provenance badges, `content_ref` points to /read or extracted content, and `/url/task` previews remain bounded metadata rather than payload storage. `map_ref` points to site-map /topology data, and storage-key naming follows storage-plan blob-ref conventions with sensitive-data scrubbed before persistence.
- Provider-native web research carries source-lineage fields such as `enableWebSearch`; Firecrawl consumer copy may surface Fire Engine limits, and file-upload/webfetch summaries preserve the 5 MB default when that cap applies.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.
- `web_operation = "read"` is the semantic audit value for site/page reading while the underlying tool invocation remains `webfetch`; consumers must map between `read` and `webfetch` rather than treating them as separate operations.
- Expanded web activity-card details show operation input, requested/effective runtime delta when relevant, support tier, fallback disclosure when relevant, source count or scope summary, and warning or error text.
- Collapsed web activity labels use the specific operation label: `Searching Web: <query>`, `Fetching Site: <url> (via <provider>)`, `Reading Site: <url>`, `Extracting Site: <url>`, `Researching Web: <task>`, `Crawling Site: <url>`, and `Mapping Site: <url>`.
- `Reading Site: <url>` is reserved EXCLUSIVELY for the PM-native Site Reader path; provider-routed or provider-delegated fetch uses `Fetching Site: <url> (via <provider>)` and must not reuse the reserved native Site Reader identity.
- Provenance badges are locked to the concrete evidence family when known: `search snippet`, `site extract`, `site reader`, `research synthesis`, `crawl result`, or `map result`.
- Firecrawl audit payload keys preserve provider response lineage exactly: `firecrawl_credits_used?: number` is populated from response `creditsUsed`, and `firecrawl_cache_state?: "hit" | "miss"` is populated from response `metadata.cacheState`.
- Provider fallback on rate-limit or outage must fall to the next eligible provider in priority order that supports the same operation, and must be shown in BOTH the chat activity label and the audit log through `provider_fallback_summary`.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`
- changeTracking.status
- changeTracking.previous_content_ref
- changeTracking.diff_summary_ref
- changeTracking.checked_at_utc
- `tool_use_id`
- `adapter_id`
- `adapter_selection_reason`
- `duration_ms`
- `timestamp`
- `cached`
- `error_code?`
- `error_message?`
- `warnings?`
- `provenance_badge?`
- provenance_badge?: "search snippet" | "site extract" | "site reader" | "research synthesis" | "crawl result" | "map result"
- adapter_hint?: string
- depth_hint?: "fast" | "balanced" | "deep"
- change_tracking
- change_summary?: { new: number, changed: number, same: number, removed: number }
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health
- tool.denied.payload.meta
- web_operation
- web_input

Permission rules:
- single confirmation prompt showing all unique domains in the batch
- For Session grants all listed domains for that session

Rules:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- fallback-only
- webfetch
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`
- native (model)
- pm-composed
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: "new" | "same" | "changed" | "removed"
- pages[].change_status
- change_summary
- explicit out-of-scope retirement if `changeTracking` is not MVP
- no silent disappearance of the capability
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- global provider stack is user-changeable in Settings
- per-operation priority reordering is NOT MVP
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- enableWebSearch
- Fire Engine
- 5 MB default
- /tool/storage/runtime
- tool.denied
- tool.invoked
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
- `urls: string[]` (required; min 1, max 50)
- `concurrency?: number` (default 3; max 10
- `continue_on_error?: boolean` (default true
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)
- chat may shortlist with search but must read chosen pages before citing them as final evidence
### 13.3 Bash and terminal ownership

This section defines the canonical contract for this surface.

Core rules:
- Inline mini-terminal and operation cards are locked to bounded inline previews, persistent per-command cards, narrative-order placement, and shared card anatomy.
- Terminal promotion and handoff are locked so interactive or long-running work binds to a stable terminal session while chat retains only bounded preview and audit ownership.
- Terminal action canon must preserve the distinct terminal actions and give Rerun in Terminal owned command-table treatment rather than collapsing actions into one normalized target.

Fields:
- terminal_session_id
- Open in Terminal
- Show Terminal
- Rerun in Terminal
- Detach/Pop-Out

Rules:
- Collapsed preview: 5 lines
- Expanded preview: 15 lines
- Persists after completion
- status, cwd, command summary, elapsed time, exit code / truncation indicator, and exit `/truncation-style` details
- READ-ONLY and non-interactive
- One card per command `/instance`
- Retries create a new terminal and therefore a new mini terminal card
- Shell owns interactive state; chat owns preview+audit
- Commands requiring stdin/TTY start Terminal immediately
- Background/watch/server actions create terminal-owned session
- One-shot commands remain chat-inline by default
- Every promoted command card binds to stable terminal session identity
- Large payloads store full data behind refs/blobs
- non-interactive work may promote if it becomes long-running
- attach failure recovery differs for live process, ended process, and inline-only completed command
- `Open in Terminal` and `Show Terminal` must focus the same live session
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively
- `/collapsible` result behavior is shared across command, search, and diff activity cards: collapsed cards retain material status, subject summary, failure line when present, and the primary reveal action; expansion exposes only bounded preview/detail, with full payloads kept behind refs/blobs or the owning surface.
- `pop-out-to-terminal` behavior normalizes to terminal-owned reveal/detach actions over the existing `terminal_session_id`: `Open in Terminal` and `Show Terminal` focus the live session, while `Detach/Pop-Out` changes terminal surface placement without creating a chat-owned terminal transcript.
- Command-card `/edit/manage` menus expose terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop process` only when the referenced terminal/session state supports them. The legacy `Pop Out Terminal` label is a deprecated alias for `Detach/Pop-Out`.
- Completed inline commands without a real `terminal_session_id` expose `View output` and `Rerun in Terminal` follow-up actions, but must not fabricate `Open in Terminal`.

### Terminal consumer carry-through

Chat consumes the terminal model without becoming the terminal owner. The terminal engine/emulator, PTY/process host, and UI shell/chrome remain separate concerns; chat cards expose bounded preview, audit, and reveal controls only. Product-critical terminal fidelity includes GPU fallback with context-loss disclosure, IME correctness, /accessibility/Unicode-width handling, /log/CI-safe and machine-readable output modes, diff-based redraw, /command/exit markers, recent-command navigation, /detach/revive/reconnect flows, and narrow /extensibility APIs rather than broad plugin surfaces.

Shell-first command continuity is /PTY-backed and preserves /env/session, working-directory, and terminal-session state. Chat is not a pseudo-terminal or earlier-thread transcript owner; it shows per-step /changes and /summaries plus explicit Open in Terminal / `/show` Terminal focus actions, and /transparency plus /logging/subagents plus terminal-session continuity stay visible in audit rather than hidden in a chat-only reconstruction.

Shell-first routing is /reaffirmed. Route shell-like or shell-native /CLI-native work to Terminal when it needs stdin, PTY, /TUI or TTY interaction, session continuity, visible /control, or may evolve into interactive behavior. Route non-interactive, short-lived, summary-oriented /build/test or structured /build/runtime-output and /results output to Output. Route diagnostics to Problems only when /line/code/location semantics exist, and route discovered endpoints to Ports. Inline previews, command cards, and chat summaries are audit/preview surfaces, never the canonical execution-surface for shell work; hiding infrastructure-like work is allowed only when terminal semantics are not needed.
Assistant routing must distinguish terminal-oriented PTY work from `/non-PTY` output routing: Terminal is required for shell-native `/steps`, TTY, stdin, alternate-screen, shell editing, prompts, multi-command continuity, and `/profile/cwd/env` fidelity, while Output is appropriate only for non-interactive work with bounded `/progress/result` or `/results/structured` payloads and no expected live takeover.

Terminal workspace behavior is now-explicit and /clarifying rather than a replacement of older shell-first assumptions. The model covers /tabs/panes, /focus/send-input/interrupt/resize/state APIs, /status/search/selection state, /overlay state, /persistence/diagnostics/labeling/docking settings, /cwd/shell disclosure, /Problems/Ports linked surfaces, tab-scoped overrides, /reuse/binding, and session-reveal semantics for Open in Terminal. The `/controller` split stays visible: Terminal owns live PTY lifecycle, Output owns derived structured process views, Problems owns diagnostics, Ports owns endpoint state, and chat owns only preview/reveal cards. Non-guarantees are explicit: chat does not guarantee full terminal transcript ownership after promotion, future-transport surfaces are sibling transports into the same terminal model, and MVP extensibility stays typed and automation-oriented for PM-owned /workflows.
Terminal search is a first-class review tool in chat-consuming surfaces: search can target whole-transcript history within the current `/pane` and `/session`, show result count plus current-hit position, navigate next and `/previous`, keep stable highlights while output streams, jump between `/matching` command blocks when metadata exists, and restore prior live/review state predictably when search exits.

Command-block confidence rules:
- rich or basic shell integration may show authoritative command blocks with start/end markers, cwd, exit metadata, sticky headers, failed-command navigation, /confidence metadata, and safe rerun.
- weak grouping must look approximate; PM must not show fake exact command blocks, exact command-text, /copy-command, or rerun controls unless command-text capture is authoritative or sufficiently trustworthy.
- running output extends the active block without re-keying the block identity; completed blocks keep stable /end, /output, cwd, duration, exit status, and confidence metadata.

Terminal empty, restore, and review states:
- no-structure-yet uses new-user empty copy and offers create default terminal plus settings when relevant.
- hidden-structure is not empty; Show Terminal reveals the existing structure.
- review-only, `/review-only`, and history-only workspaces emphasize /reviews and /rerun/reopen/clear/close rather than onboarding copy.
- pane-without-live-runtime shows an honest pane-local status with restart, rerun, replace, and close actions.
- restored-without-history says that no retained transcript/history exists; it is not first-run empty.
- /disconnected panes remain reviewable when history exists.
- /tab/pane/session structure restore is separate from live runtime restore.

Pane status, badges, and notifications:
- terminal_session state includes creating, attaching, ready, running, interrupting, terminating, killing, exited, failed, and restoring; restore ends as ready, /exited/disconnected-equivalent, /restoring/disconnected/exited, or another honest outcome.
- aggregate precedence for tabs and /sections is failed_to_start or /disconnect/failed-start, disconnected, restore_action_needed, exited_error, failed_command_since_focus, running, unseen_completion, unseen_output, context_changed, ready, then exited_clean.
- visual-surface placement keeps exact runtime-state in pane headers, compact /badges with quiet /count semantics on tabs, summary attention on /dock entries, and high-priority /chrome attention on detached windows.
- focused-pane events prefer inline-status and badges over intrusive notifications; /inactive/detached failures may notify.
- focusing a pane clears unseen_output and unseen_completion; failed_command_since_focus clears only after the failed pane is focused/reviewed, and restore_action_needed clears only after the restore issue is fixed or the pane is intentionally /replaced.
- TUI mouse-capture guidance is contextual, not a permanent warning banner.

Transcript, alternate-screen, and reset semantics:
- persisted transcript is review continuity, not emulator-state resurrection.
- /TUI and alternate-screen entering or /exiting are represented as events or /markers; normal-screen transcript continues after TUI exit.
- clear scrollback starts a new visible transcript segment; /reset or /reinitialize does not delete history unless paired with clear.
- Clear, reset, replace, and close remain separate card actions: clear affects reviewable and `/reviewable` history visibility, reset reinitializes display `/parser` state when supported, interrupt requests stop of the foreground command, terminate ends the session/process, kill force-stops where policy allows, replace starts a new runtime in the slot, and close is a workspace-structure action unless an explicit runtime termination policy is chosen.
- block-level copy/export indicates partial backing history when only pruned transcript remains.
- metadata-only command blocks may expose command metadata, duration, cwd, and exit status without fabricating output text.
- per-project Terminal settings distinguish live scrollback depth, persisted transcript retention, clear-on-close, and preserve-on-close behavior.

Terminal labels and accessibility:
- pane headers carry the primary label, runtime status chip, and lightweight context badges such as cwd/shell/remote/profile.
- /shell/remote/profile and /shell/profile/remote/container context should prefer badges, subtitles, /tooltips, or details rather than noisy /tab/window titles.
- labels are stable identity, badges are compact context or attention, subtitles and tooltips hold richer detail, and /sticky headers hold command-local review detail.
- The display label for a Terminal tab or `/pane` is separate from derived suggestions and `/metadata`: user labels always win, derived context may update badges, and default labels such as Terminal or Terminal 2 come from stable workspace-oriented runtime context rather than volatile every-command changes. Suggested label sources include project/folder, `/cwd/context`, long-running task, `/profile/role`, and `/shell/remote/task` context, but they must not overwrite a user-facing label after rename.
- accessibility-name identifies the same stable object as the visible primary label; descriptions may add current status/context.
- user-rename freezes only the primary label; runtime-state, context badges, and subtitles keep updating, and reset-to-auto restores derived labels.

Terminal diagnostics:
- diagnostics use structured events and typed failure reasons instead of only freeform logs.
- user-facing pane UI avoids /noisy internals and offers retry, restart pane, rerun command, reveal logs, or switch renderer mode when applicable.
- minimum failure taxonomy includes failed_to_start_session, attach_failed, reconnect_failed, shell_integration_unavailable, shell_integration_degraded, transcript_persist_failed, transcript_unavailable, renderer_fallback_activated, renderer_error, clipboard_integration_failed, IME /input_pipeline_error, and unsupported_platform_capability.
- pane-level diagnostics prefer inline banners/cards, status chips/badges, and drill-down /details; support exports and diagnostics surfaces share the same structured /source state.

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
- reveal-origin may land on an `/exited` or `/review-only` pane when that pane is the true origin; it must not silently replace that origin with a fresh shell unless the user chooses restart, `/rerun/new`, or explicit New Terminal.
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

The message-level `info-popover` consumes this closed field list; it is not a second schema and must stay aligned with the context-detail `Messages` row expansion and the shared Contracts field labels.

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
- Provider-specific parent TUI affordances such as OpenCode `view subagents` are reference examples only; PM projects equivalent session-centric child visibility through inline cards, header badges, and direct child history navigation rather than treating a provider-native TUI tree as canonical chat state.
- OpenCode runtime-shape references in this chat-display section are provenance-anchored to upstream commit `9a006d87004835d1867207def09c9aa4cf7394db`; that commit is comparative evidence only and does not override PM-owned child-run display contracts.

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
| Context state | Shows relevant context-shaping disclosures, including context-expansion/rehydration requests and whether dynamic context shrinking affected the child. The expanded child-panel context-state disclosure and hover metadata are MVP, and subagent-expanded panels must show enough context-shaping state for the user to understand what the child received. |
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
| `blocked` | Child cannot proceed because of a tool/policy/provider/runtime restriction, including permission-policy denial. |
| `complete` | Child finished successfully. |
| `failed` | Child attempted execution and ended unsuccessfully. |
| `cancelled` | Child was intentionally stopped before completion. |

Signal mapping rules:
- `clarification_needed`, `user_input_requested`, and `context_expansion_requested` render as `awaiting_parent`.
- policy/tool/provider/runtime denials render as `blocked`.
- replacement/supersession is preserved as terminal reason metadata even when the visible terminal status is `cancelled`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### Parallel fan-out, batch cards, and subgroup inspection

Parallel child spawning and grouping/aggregation are first-class behavior. The thread must not assume only one or two children exist.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Rules:
- small fan-out may render as separate child cards
- large fan-out renders as one top-level batch card
- expanding a large batch card opens intermediate subgroups of 10 children each
- expanding a subgroup opens the 10 inline child cards for that subgroup
- only one subgroup is expanded by default unless the user explicitly opens more
- canonical child order remains launch order; status changes do not reorder the child list
- subgroup and batch summaries surface blocked, awaiting-parent, and failed counts so the user knows where attention is needed
- when `continue_on_error` is `false`, the first failure closes the batch, preserves already completed child results, and marks later unstarted children as not run rather than successful
- batch cards link the failing subgroup and failing child instead of flattening strict-stop runs into one generic failure summary
- parent and child audit identity remain inspectable from the batch card rather than being hidden in a storage-only projection
### Parent-mediated clarification and escalation

Children do not question the user directly by default. A child escalates to the parent; the parent decides whether to answer from existing context, send more context, ask the user, reroute, or cancel the child.
For missing-capability signals, including `/runtime/tool` gaps, the parent chooses `/reframing`, reroute, replacement, context expansion, user question, or cancellation; the visible status is `awaiting_parent` when parent action can continue the child and `blocked` when policy, runtime, or tool restrictions make progress impossible.

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

Assistant-invoked `/dev` and live command work uses shell-owned terminal/output/ports and `/output/ports` surfaces; chat must not invent a parallel dev-output model.

Chat-visible runtime and account information stays owner-doc consistent with `Plans/Multi-Account.md`; `/runtime-disclosure` is a presentation obligation over the resolved runtime/account snapshot, not a new chat-local account-routing model.

Approval display copy uses PM-native durable/default approval wording; external labels such as Bypass, Autopilot, and Default Approvals are reference-baseline terms only and do not become canonical PM approval modes.

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
ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-memory-subsystem.md#7-gui-and-maintenance, ContractName:Plans/Contracts_V0.md#7-uicommand

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
- **Subagent collaboration:** During BrainStorm, subagents collaborate through the canonical crew message board owned by `Plans/orchestrator-subagent-integration.md`; this is the chat-facing subagent-collaboration projection, not the normative schema owner. This chat document may describe the user-facing behavior, but the schema, routing rules, priority model, rate limit, and orchestrator-visibility contract live in the orchestrator owner doc.
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
References inventory.

Reference lists must defer to live owner docs instead of stale section-number citations.


- **AGENTS.md:** DRY Method, platform_specs, subagent_registry, Pre-Completion Verification Checklist.
- **Plans/interview-subagent-integration.md:** Interview phases, document generation, AGENTS.md/DRY for target projects, §5.2 AI-Overseer and wiring/completeness.
- **Plans/orchestrator-subagent-integration.md:** Subagent selection, crews, execution engine, Plan/Crew execution.
- **Plans/human-in-the-loop.md:** HITL mode (phase/task/subtask approval gates), GUI settings, Dashboard CtAs.
- **Plans/agent-rules-context.md:** Application-level rules (Puppet Master) and project-level rules; fed into every agent (orchestrator, interview, Assistant). When building Assistant context, include the shared rules pipeline output (application + project when a project is selected).
- **Plans/FileSafe.md:** Context compilation (orchestrator/iteration); chat uses separate conversation context.
- **Plans/Tools.md:** Central tool registry, tool permission keys, and ask-flow alignment; YOLO = no ask prompts, and Regular uses the canonical approval ladder from `Plans/Permissions_System.md`; the live web/provider owner sections remain `Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure` and `Plans/Tools.md#12. Web tool routing algorithm`; §2.5 cross-plan alignment with FileSafe, FileManager, orchestrator, interview.
- **Plans/Commands_System.md:** Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for the canonical `/web` family behavior and deprecated aliases.
- **Plans/UI_Command_Catalog.md:** Canonical chat slash-command catalog and reveal identities; see `Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved)` for the reserved slash-command surface.
- **Plans/Permissions_System.md:** Approval ladder, blocked-recovery defaults, deterministic ask/plan behavior, and web permission derivation at `Plans/Permissions_System.md#3.4A Web-operation permission-key derivation`.
- **Plans/Skills_System.md:** Skill discovery/invocation boundary and runtime ownership; see `Plans/Skills_System.md#6.3 Slash and runtime boundary`.
- **Plans/MCP_Integration.md:** MCP naming, requested/effective availability, auth-state and connection-state vocabulary, credential binding, and invalidation; chat/search consumers reference this owner doc instead of re-owning MCP state terms.
- **Plans/newtools.md:** GUI/settings alignment note only; older cited-search framing is non-normative and does not own live provider, routing, provenance, or billing canon.
- **Cited web search (historical background only):** Adapt one or combine approaches so Assistant, Interview, and Orchestrator share one implementation. [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) -- LLM cited search, inline citations + Sources list (Google/OpenAI/OpenRouter). [opencode-websearch](https://www.npmjs.com/package/opencode-websearch) -- Anthropic/OpenAI provider wiring, model selection. [Opencode-Google-AI-Search-Plugin](https://github.com/IgorWarzocha/Opencode-Google-AI-Search-Plugin) -- Google AI Mode via Playwright, markdown + sources. These references do not replace the owner canon in `Plans/Tools.md`, `Plans/FinalGUISpec.md`, or `Plans/MCP_Integration.md`.
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
13. **Queued messages** -- §4: two-slot FIFO queue with edit/send-now/cancel controls; no clear-queue action.
14. **Keyboard shortcuts** -- §4: chat actions reachable via shortcuts and command palette (`newfeatures.md` §11).
15. **Streaming** -- §12: response streams when platform supports it; normalized stream; fallback to batch.
16. **Paste / drag-drop** -- §7: paste and drag-drop into composer supported.
17. **Rate limit hit** -- §12: option to switch platform or model.
18. **Task running** -- §4: active agent run in **this thread** (per-thread).
19. **Delete thread** -- §11: delete permanently with confirmation.
20. **Copy message** -- §11: selectable content and/or Copy action.
21. **Run-complete notification** -- §11: notify when run completes in another thread; **setting** to turn off.
22. **Concurrent threads** -- §11: user-facing setting, **default 10** max concurrent thread runs in Assistant UI. This is a thread-level Assistant concurrency setting, not the global runtime subagent ceiling. Global orchestration caps remain SSOT in `Plans/orchestrator-subagent-integration.md` and `Plans/Run_Modes.md` (`max_total_active_agents=32`), and interview reviewer narrowing remains in `Plans/interview-subagent-integration.md`; the more restrictive applicable limit wins.
    - Copy and deep-link labels may use `context-detail` and `concurrent-thread` only as Assistant UI route/copy tokens; they must continue to reflect this owner section and must not redefine global runtime concurrency.
23. **Custom vs built-in commands** -- §5: no conflicting names; UI explains why if user tries.
24. **Plan panel scope** -- §11: plan panel **per thread**. **Accessibility** is **not MVP**.
25. **Error and failure UX** -- §4: clear error state, Resend or Cancel, queue unchanged unless user resends; suggest switch platform or model when appropriate.
26. **Orchestrator to Assistant handoff** -- §21: Dashboard offers `Continue in Assistant` with run summary and context when orchestrator completes or pauses.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md
### 23.5 Previously open gaps (now closed)


This traceability table now records what moved into the main body without claiming blanket closure.

The competitive-comparison traceability stays intact.
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

Chat selection consumes the eligibility rules in `Plans/Personas.md`: `assistant` is the default direct-chat Persona; `explorer` and `bash` are subagent-only and cannot be selected as the direct chat Persona; `teacher` is direct-chat eligible but not a subagent Persona.

### 27.2 Current Persona display (required)

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Runtime identity canon must preserve requested and effective naming and the account/provider identity fields, and must retire local _id substitutes.
- Chat MUST NOT invent assistant-local substitutes: `requested_persona_id` and `effective_persona_id` normalize to `requested_persona` and `effective_persona`; `active_model` and `actual_model` normalize to `effective_model`; `resolved_account`, `current_account`, and `chat_role_identity` normalize to canonical account fields and `execution_role`; `assistant_runtime_state` uses the canonical runtime snapshot; `projection_trust` normalizes to `projection_freshness` and `projection_health`; and local `selection_reason` uses `adapter_selection_reason` or `account_switch_reason` when those owners apply.

Rules:
- requested_persona
- effective_persona
- effective_account_label
- requested_persona_id
- effective_persona_id
- active_model
- actual_model
- resolved_account
- current_account
- chat_role_identity
- assistant_runtime_state
- projection_trust
- effective_model
- execution_role
- projection_freshness
- projection_health
- adapter_selection_reason
- account_switch_reason
### 27.3 Natural-language Persona invocation in chat

The Assistant must support user requests such as:
- `Use Collaborator`
- `Be a Rust engineer`
- `Answer as a technical writer`
- `Switch to security auditor`
- `Ask Explorer to inspect the repo`
- `Run that with Bash`

#### Scope semantics

Default scope handling:
- `for this`, `for this answer`, `right now` -> turn scope,
- `from now on`, `in this chat`, `for this session` -> session scope.

UI must show when a natural-language override is active, for example:
- `Persona: Collaborator (User requested)`
- `Persona: Researcher (User requested, session lock)`

When the override expires, the UI should return to auto display, for example:
- `Persona: Rust Engineer (Auto: Rust repo + code task)`

Subagent-only requests such as `Ask Explorer` or `Run that with Bash` create or route a child run when the surrounding task permits delegation; they do not switch the direct chat Persona. If the user asks to make a subagent-only Persona the direct chat Persona, chat must explain the eligibility constraint and offer the closest valid route.

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
- the selection reason or why the subagent/persona was used, when that reason is meaningful,
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
- the default crew editor may expose per-member model selectors and per-member provider/runtime surface selectors for non-Copilot surfaces.
- `Copilot` is not a per-member freely mixed provider in the default crew editor; when Copilot is selected for any member, the UI immediately normalizes the entire crew to Copilot and explains that Copilot is being treated as a crew-level provider selection constraint.

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


Chat and planning surfaces support both Mermaid and the broader inline visualizer, but they are distinct contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 28.1 Canonical split

- Mermaid remains the fenced-diagram rendering path
- the inline visualizer is a separate sandboxed HTML/SVG module
- neither path owns hidden mutable state outside durable source or metadata refs
- Message widget taxonomy keeps `plain code blocks`, `diff/operation cards`, `Mermaid/native diagram cards`, `question cards`, and the `inline visual module` distinct. The inline visual module has its own rendering pipeline, sandbox settings, theme-token injection, and bridge API; it is not a Mermaid/native diagram card, not a plain code block, and not a diff/operation card.

### 28.2 Inline visualizer bridge

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.
- The Inline HTML/JS Visual Module is the sandboxed iframe rendering path for agent-generated HTML/JS/CSS fragments. It is used for data visualizations, interactive diagrams, and custom UI that exceeds Mermaid/code-block capabilities while staying inside the visual-module host contract.
- Inline visualizer iframes MUST use an explicit `sandbox` attribute token set. The sandbox policy is closed by default: MVP uses `sandbox="allow-scripts"` so the module can execute its bundled code, and the exact minimum attribute is `sandbox='allow-scripts'`. `allow-same-origin`, `allow-forms`, `allow-popups`, and `allow-top-navigation` are explicitly DENIED; the iframe stays isolated from the PM origin, and all cross-boundary communication uses the `postMessage` bridge as the only allowed bridge.
- Non-iframe Markdown, Mermaid, HTML, and SVG rendering uses the rendering contract here until a dedicated `Plans/security-sanitization.md` owner exists; `/security-sanitization.md` is lineage for that proposed split, not the current owner. The baseline sanitizer is the standard HTML5 safe subset per DOMPurify `DEFAULT_ALLOWED_TAGS` plus approved URL-bearing attributes only; raw `<script>`, `<iframe>`, `<object>`, `<embed>`, and `<style>` with external URL references are denied in message-flow rendering.
- The inline visualizer host bridge exposes only async-safe calls: `sendPrompt(text: string): void`, `openLink(url: string, target?: "_blank" | "_self"): void`, `copyToClipboard(text: string): Promise<boolean>`, and `requestResize(width?: number, height?: number): void`. `openLink` treats `_blank` as a new tab and blocks `_self` navigation inside the sandbox; `requestResize` is advisory and the host may constrain it. For question-flow embedded visual modules, the host omits `sendPrompt` from the bridge and exposes only the narrowed PM-managed question-draft bridge, so visuals cannot bypass PM draft state by queueing chat messages.
- Decision #10 is resolved for visualizer theme-token injection: the MVP mechanism is locked as CSS custom properties injected through the inline `style` attribute on the visualizer container. MVP tokens are `--pm-viz-bg`, `--pm-viz-fg`, `--pm-viz-accent`, `--pm-viz-border`, `--pm-viz-font-family`, and `--pm-viz-font-size`; visualizer fragments MUST use those tokens and must not hardcode replacement colors.
- Bridge calls preserve exact host semantics: `sendPrompt(text)` queues into the active thread composer outside question-flow contexts; dual-context enforcement means that if a questionnaire is active when `sendPrompt` is called from within a visualizer, the text is routed as a question answer rather than a new chat message, and if no questionnaire is active it is routed as a new chat input. Question-flow embedded visuals do not receive `sendPrompt` and write draft answers only through the narrowed question bridge, so the visualizer cannot bypass the question flow; `openLink(url)` routes through `cmd.browser.open_detached_preview` or the system browser when external; theme injection pushes the CSS custom property bundle on mount and theme change; auto-height/resize reporting sends `{ height: px }` to the host, which adjusts the visual card height within host constraints.
- `Classic298/open-webui-plugins` and `/open-webui-plugins` remain reference-only lineage for host-wrapped, auto-height, by-reference visual modules; PM names the live surface inline visual module, keeps provider-specific agent-skills runtime assumptions out of canon, and treats `/catalog`, folder-based `SKILL.md`, `/discovery/runtime`, and `/preview/editor` as owner-consumed import/editor concepts rather than visualizer authority.
- Inline visual modules support interactive `/controls`, local visual-state `/queues`, `/diagrams/explainers`, and host-mediated `/auto-resize`; auto-sizing is driven by `requestResize` telemetry and constrained by the host rather than by direct DOM access.
- The visualizer is a general-purpose surface for user-requested or clearly helpful quizzes, interactive visualizations, and other artifacts; it may use third-party script `/library` code inside the sandbox only when policy allows, with bundled, version-pinned, and integrity-recorded code. Arbitrary external network loads are denied; the visualizer is not limited to `/questions`, and it is not an accessibility-only fallback path.
- Visualizer `/source/etc` handling keeps fragment source, copy/export metadata, and generated assets behind the visual-module contract so the sandbox can show the artifact without injecting raw controls into the main chat DOM.

ContractRef: Plans/FinalGUISpec.md#15.6 Mermaid and inline visualizer widgets

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
- copyToClipboard(text)
- requestResize(width?, height?)
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

`chat_excerpt_refs[]` entries identify bounded source excerpts by `thread_id`, `message_id`, optional `range_ref`, `excerpt_role`, and `redaction_state`. They are lineage pointers for imported assistant/deep-plan context, not copied transcript authority, and the wizard resolves them through the canonical thread/message store before rendering or reusing excerpts.

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

Canonical thread blocked surfaces reuse the shared blocked packet instead of local ask-flow tuples. This section supersedes earlier overlapping blocked-state addenda in this document; those addenda remain historical transfer notes and must not be read as peer recovery guidance.


Required fields:
- `blocked_notice`
- `blocked_sequence`
- `approval_scope_key`
- `allowed_action_ids[]`

### Multi-episode display
- each `blocked_notice` renders as its own system message
- `validation_blocked` and `remediation_ceiling_exceeded` remain ordinary members of the blocked taxonomy
- chat action buttons are rendered from ordered `allowed_action_ids[]`
- resolving one blocked episode does not collapse sibling blocked episodes
## Worktrees in Assistant

This section specifies the W.1-W.17 thread-level worktree binding feature: a per-thread worktree button in the chat header, worktree icon in the thread selector, merge-back flow, pre-merge test gate, and all associated lifecycle, data model, events, commands, settings, and error handling.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.0 Source Control consumer state

Assistant chat deep-links into Source Control without owning its accordion layout. Per-project Source Control section open/close (`/close`) state persists at `config:project:{pid}:source_control.accordion_state` as:

```json
{ "Changes": true, "Worktrees": false, "Branches/Stash": false, "History": false, "Graph": false }
```

Inline diagnostics may render the same persisted object as `json { "Changes": true, "Worktrees": false, "Branches/Stash": false, "History": false, "Graph": false }`.

The fixed section order is Changes, Worktrees, Branches/Stash, History, Graph; user reordering is outside MVP, scroll position is not persisted, and each project's `accordion_state` is independent.

Source Control owns the Worktrees row layout and filters that Assistant Chat links to. The accordion uses a two-level scroll model: expanded sections may scroll internally under their max-height, and the outer accordion container scrolls when combined section content exceeds the panel. The Worktrees filter is `All | Threads | Orchestrator | Manual`; its per-project state persists at `config:project:{pid}:source_control.worktree_filter` as `worktree_filter`, defaults to `All`, and is not shared across projects.

### W.1 Chat header worktree button

**Placement:** Chat header strip, after the Reasoning/effort control (rightmost existing control). The header strip currently contains: Platform, Model, Reasoning/effort. The Worktree button is appended after these. Mode buttons (Ask, Agent, Debug, Plan, Deep Plan) are separate from the header strip and not adjacent to this button.

**Visual states:**
- **Unbound (default):** Dimmed worktree glyph icon. No label text. Tooltip: "No worktree — click to create"
- **Bound, clean:** Lit/active worktree glyph icon. Tooltip shows branch name. No label text.
- **Bound, dirty:** Lit worktree glyph with a small dot indicator (same pattern as unsaved-file dot in editor tabs). Tooltip: branch name + "uncommitted changes"
- **Bound, conflict:** Lit worktree glyph with warning indicator (triangle). Tooltip: branch name + "merge conflict"

Icon colors resolve through theme tokens (`icon-secondary`, `accent-warning`, `accent-error`), not hardcoded hex values. Icon is ~32px and follows existing header overflow/min-width pattern.

Status bindings expose `dirty_state`/`/dirty_state` and `conflict_state`/`/conflict_state` to the icon renderer for compatibility with older state labels; canonical rendering still reads from `worktree_projection.v1:{project_id}:{worktree_id}`. All worktree controls have accessible labels, and create, unbind, remove, dirty-state, conflict-state, and creation-failed changes are announced through `aria-live="polite"`. Narrow Source Control worktree filters and overflow actions degrade to icon-only controls rather than wrapping text into the compact chat header.

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
| Path | Info sublabel (truncated, e.g. `.puppet-master/worktrees/thread-a1b2c3d4`) | No action |
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
  "worktree_path": ".puppet-master/worktrees/thread-a1b2c3d4",
  "bound_at_utc": "2026-03-26T02:45:00Z",
  "binding_origin": "manual | auto_create",
  "temp_branch_name": "assistant/thread-a1b2c3d4"
}
```
`temp_branch_name` tracks the original temporary branch name assigned before title generation. For UI display, always use `branch_name`; `temp_branch_name` is internal bookkeeping only. Assistant thread worktree filesystem paths are generated as `.puppet-master/worktrees/thread-{short_id}` from the bound thread id and append numeric suffixes such as `thread-{short_id}-2` when that directory already exists; `worktree_id` remains the stable record identity and MUST NOT make `wt-*` the filesystem path model.

**Inverse lookup (for 1:1 enforcement):**
- Key: `worktree_binding_reverse:{worktree_id}`
- Value: `thread_id`
- Used to quickly check whether a worktree is already bound to another thread.

**Binding rebuild logic:** Projectors replay `chat.thread_worktree_bound` and `chat.thread_worktree_unbound` events in sequence order to reconstruct current binding state. The last event for a given `thread_id` determines whether a binding exists and which `worktree_id` it references.

**Worktree record extension (existing `worktree_record.v1`):**
- Add optional field: `owner_thread_id?` alongside existing `owner_run_id?` and `owner_node_id?`.
- Owner semantics: exactly one of `owner_thread_id`, `owner_run_id/owner_node_id`, or neither (manual) is set.

**Startup revalidation:** After PM startup rehydrates thread state from redb/seglog, the next focus of a thread with `thread_state:{thread_id}:worktree_binding` lazily verifies that the recorded path exists and appears in `git worktree list`. If the path is missing, PM auto-unbinds by deleting the binding and reverse lookup, emits `chat.thread_worktree_unbound` with `reason=path_missing`, and notifies the user; it does not silently re-create the missing worktree.

**Worktree-aware same-file identity rules:**
- The canonical file identity for thread-bound chat, debug, Source Control, and GitHub pivots is `{ repo_id, worktree_id, relative_path }`; path alone is not sufficient.
- The same relative path in two worktrees is treated as two different open subjects unless a compare session explicitly binds them together.
- Thread-scoped opens default to the thread's bound `worktree_id`. If the thread has no bound worktree, the UI may fall back to the currently selected worktree but must label that fallback explicitly.
- Historical cards, receipts, and debug evidence remain pinned to the captured `worktree_id` even if the thread later rebinds to a different worktree.
- Merge-back, compare, and PR creation flows may intentionally bridge the bound worktree to a base branch, but they must preserve both identities rather than collapsing them into one generic path.
- At turn-start, Chat populates and freezes `execution_unit_context.worktree_id` plus `working_directory` for the whole turn; safe points include worktree snapshot fields `worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`.
- Project switch marks the worktree binding inactive rather than unbound; the button stays disabled until switch-back, then reactivates against the same binding.

**1:1 enforcement:** One worktree per thread, one thread per worktree. If a user tries to bind a worktree already bound to another thread, the action is blocked with an explicit error and a deep link to the owning thread when available.

**Mode-worktree invariant:** Worktree binding is thread-level state, orthogonal to Ask, Agent, Debug, Plan, and Deep Plan mode. Mode transitions never rebind, unbind, or change the frozen `working_directory` for an in-flight turn; the next turn observes the same bound worktree unless the user explicitly changes the binding.

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
5. Backend calls `WorktreeManager::create_worktree(branch_name, base_ref, worktree_path)` where `worktree_path` is auto-generated under `.puppet-master/worktrees/thread-{short_id}` with a numeric suffix such as `thread-{short_id}-2` if the directory already exists
6. On success: new `worktree_record` written to redb; `thread_state:{thread_id}:worktree_binding` written; `chat.thread_worktree_bound` seglog event emitted; dialog closes; chat header button updates to bound state
7. On failure: dialog stays open with inline error (e.g. "Branch already exists", "Git error: ..."); retry or cancel
8. Thread selector icon appears immediately on binding

Worktree creation and removal entrypoints are always user-initiated (chat header dropdown, slash command, or Source Control action) or system-initiated through the auto-create setting. The AI agent never invokes worktree creation or removal as a direct tool call.

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
   a. Sanitize title for git branch name (lowercase, replace spaces with hyphens, strip invalid chars, truncate to 50 chars). Examples: `Fix Auth Bug` becomes `fix-auth-bug`, `User's Login (v2)` becomes `users-login-v2`, and a title that strips to empty falls back to a `thread-a1b2c3d4`-style short-id seed.
   b. Compute target: `assistant/<sanitized_title>`
   c. If target branch name exists: auto-append `-2`, `-3`, etc. until unique (silent — no user dialog since this is auto-create)
   d. Call `git branch -m <temp_name> <target_name>` inside the worktree
   e. Update `worktree_record` and `thread_state` binding with new branch name
   f. Emit `chat.thread_worktree_renamed` seglog event
   g. On rename failure: keep temp name, no user interruption, log warning

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

**Ownership:** Chat runtime owns the auto-create call. Executor never invokes WorktreeManager directly for thread worktree creation.

**Concurrent auto-create:** `WorktreeManager::create_worktree` is serialized per project (mutex/lock) to prevent racing. The reverse lookup key write is atomic (redb transaction). If a create fails due to race, auto-create retry logic attempts with the next suffix. Auto-create does NOT retry on non-race failures.

Title-less threads keep the temporary branch name `assistant/thread-{short_id}` and worktree path suffix `/thread-{short_id}` indefinitely until the user renames through Git or the title rename flow succeeds.

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
- **Compact row slot:** In compact/default thread rows, the worktree glyph occupies the `wt_icon` slot before the branch label (for example, `assistant/fix-auth`) and the chevron; the second line carries status plus owner copy such as `dirty · Thread: Auth fix`.
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Line 1: Branch name. Line 2: Status pill text (clean/dirty/conflict). Line 3: Worktree path.
- **Icon color/state:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`.
- When an owner label is shown, its exact copy is `Thread: <thread_title>`, `Orch: <tier_label>`, or `Manual`; tooltips preserve the full `thread_title` or `tier_label`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)".

### W.7 Cleanup flow (thread delete)

**Cleanup-on-delete canon:** Cleanup choices are part of the existing thread-delete confirmation path, not an automatic completed-thread cleanup path. Delete first checks `thread_state:{thread_id}:worktree_binding`; when no binding exists, the standard delete confirmation applies, and when a binding exists, keep/remove behavior follows `branching.assistant_worktree_cleanup_default`. Keep unbinds the thread and leaves the worktree on disk, while remove unbinds and prunes the worktree through `WorktreeManager` after dirty/active-run safeguards.

Thread worktree cleanup is scoped to thread delete, not archive/unarchive lifecycle changes. The extended delete confirmation presents `Keep worktree on disk` and `Remove worktree` choices; dirty worktrees include a dirty-check confirmation sublabel, the default choice is configured in Settings > Branching by `branching.assistant_worktree_cleanup_default`, and after cleanup action completes the system emits `chat.thread_worktree_unbound` with the appropriate `reason`.

When the extended delete confirmation uses explicit button copy, `Delete and keep worktree` deletes the thread, unbinds it, and leaves the worktree on disk as orphaned/manual Source Control inventory. `Delete and remove worktree` deletes the thread, unbinds it, and prunes the worktree; if the worktree is dirty and the user chooses that destructive option, PM uses `git worktree remove --force <path>` plus `git branch -D <branch>` after the warning label has been shown.

Unbind has no dedicated undo in MVP: the worktree remains on disk as a manual worktree, and any future undo toast is post-MVP rather than part of the initial cleanup flow.


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

When a thread reaches `completed` or `failed` status while it still has a bound worktree, Assistant Chat performs no automatic unbind or cleanup. The worktree remains available for Merge and PR creation; dirty completed or failed worktrees surface in Source Control with combined status such as `dirty · completed` or `dirty · failed`, while the thread selector keeps the standard worktree icon. Users release the worktree only through explicit thread delete cleanup or unbind, and completion may toast: "Thread completed. Worktree has uncommitted changes — merge or clean up when ready."

There is no auto-cleanup for `completed` or `failed` threads.

**Four access paths (all equivalent in outcome):**

| Path | Entry point | Notes |
|------|-------------|-------|
| Chat header dropdown | "Merge into Base…" / "Create PR…" actions | Primary UI path |
| Source Control worktree section | "Merge" / "Create PR" buttons in expanded worktree row | Secondary UI path |
| Slash commands | `/worktree merge [--squash\|--rebase]`, `/worktree pr` | Keyboard-driven; default squash |
| Natural language in chat | User says "merge my changes into main" | Agent triggers dialog pre-filled with inferred strategy |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

Compare buttons open committed branch-to-branch review only: worktree branch HEAD against base branch HEAD through `cmd.git.open_diff`. Source Control merge buttons route through the same `cmd.chat.worktree.merge` command with `thread_id=null` for non-thread worktrees; the command handler detects null `thread_id` and omits thread-specific behaviors such as unbind, thread status update, or chat notification.

#### W.8.1 Merge confirmation dialog

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Strategy | Segmented control: `Squash` / `Merge` / `Rebase` | `Squash` | Squash = single clean commit; Merge = merge commit preserving history; Rebase = replay on top of base |
| Target branch | Dropdown | From `branching.assistant_worktree_base_ref` or `branching.base_branch` | Must be existing local branch |
| Commit message | Text area (multi-line) | Auto-generated per strategy | Editable; only shown for Squash and Merge (hidden for Rebase) |

**Buttons:** `Merge` (primary, label changes per strategy), `Cancel`

**Dialog reactive behavior:** Squash selected → commit message visible (concatenated commits). Merge selected → commit message visible ("Merge assistant/{title} into {target}"). Rebase selected → commit message hidden. User edits preserved across strategy switches.

After the user confirms strategy, target branch, and commit message, the dialog enters a strategy-specific loading state ("Merging...", "Squashing...", or "Rebasing..."): the strategy segmented control and target branch dropdown are disabled, the commit message textarea is read-only/greyed when shown, the Merge button shows a loading spinner with a strategy-specific label, and Cancel remains enabled for user abort.

#### W.8.2 Pre-merge guards

| Condition | Behavior |
|-----------|----------|
| Worktree has uncommitted changes | Block merge. Warning: "Worktree has uncommitted changes. Commit or stash before merging." Button disabled. |
| Worktree has merge conflicts | Block merge. Warning: "Resolve existing conflicts before merging." Button disabled. |
| Active run in worktree | Block merge. "Cannot merge while a run is active." |
| Target branch deleted | Error if deleted between dialog open and confirm |
| Worktree on detached HEAD | Block merge/PR, including when a user ran `git checkout <sha>` in the worktree terminal. "Cannot merge: worktree is on a detached HEAD. Checkout a branch first." |
| Main repo dirty (squash/merge + merged_result) | Block. "Cannot run pre-merge test: main repo has uncommitted changes." |

Detached HEAD recovery is explicit: the user can run `git checkout -b <branch>` in a terminal, or unbind and re-creates a named-branch worktree through the normal create flow.

#### W.8.3 Merge execution

**Critical:** Merge executes in the main repo working tree, NOT inside the worktree. This is consistent with WorktreeGitImprovement.md `merge_worktree()` operating from the main repo context: the worktree branch is merged INTO the target branch in the main repo. Exception: Rebase is a two-phase operation: step 1 (`git rebase` / `git rebase {target}`) runs in the worktree, and step 3 (`git merge --ff-only`) runs in the main repo.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

**Exclusive merge lock:** `.git/pm-merge.lock` (main repo). Acquired BEFORE guard checks for atomicity. Guards fail → lock released immediately. Lock held → ALL merge buttons project-wide disabled.

Worktree command when-clause conditions are UI pre-checks only; Merge uses a two-phase check in which `.git/pm-merge.lock` is acquired first, then dirty/conflict/active-run/detached-HEAD guards are re-checked atomically before mutation.

The lock lives under the main repo `.git/` directory; acquiring `.git/pm-merge.lock` is the FIRST merge-execution step and makes the guard-check plus execution atomic.

This guard-to-lock atomicity includes the detached HEAD guard: after the lock is held, PM re-reads the worktree HEAD state before merge, rebase, PR, or pre-merge test mutation proceeds.

The UI pre-check `/disabling` state is advisory only: all pre-checks are re-checked atomically AFTER lock acquisition. For Rebase, the lock covers the ENTIRE sequence from worktree rebase through tests to main repo ff-merge.

**Lock file format:** `{ "pid": <int>, "started_utc": "<ISO8601>", "worktree_id": "<string>", "strategy": "<string>" }`

**Stale lock recovery:** On startup (lazy), if PID dead or lock older than 5 minutes → auto-remove. The stale lock is auto-removed before new merge execution proceeds. Toast: "Stale merge lock cleaned up."

**Execution steps (when pre-merge test disabled):**
- **Squash:** `git checkout {target}` → `git merge --squash {branch}` → `git commit -m "{message}"`
- **Merge:** `git checkout {target}` → `git merge --no-ff {branch} -m "{message}"`
- **Rebase:** (in worktree) `git rebase {target}` → (in main repo) `git checkout {target}` → `git merge --ff-only {branch}`

Canonical command templates may use `{worktree_branch}` for the same source branch: `git merge --squash {worktree_branch}`, `git merge --no-ff {worktree_branch} -m "{message}"`, and `git merge --ff-only {worktree_branch}`.

**Auto-fetch:** Before any merge strategy, the backend runs `git fetch origin {target_branch}` in the main repo so the local target is up-to-date. If fetch fails because there is no remote or the user is offline, merge proceeds with local state and shows an advisory toast.

**Rebase is non-interactive only.** The dialog runs plain `git rebase` / `git rebase {target}`; interactive `git rebase -i`, `-i`, pick/squash/fixup, and `/squash/fixup` workflows are terminal-only.

**Commit authorship:** User's git identity (`user.name`/`user.email`). No AI co-author injection.

**Git hooks:** NOT bypassed. Hook failure = merge failure with Retry/Cancel. Standard commit hooks run at their normal Git trigger points during the merge/commit step after any pre-merge test passes; `pre-merge-commit` runs during `git merge --no-ff` commit and gets the same treatment as pre-commit failure. For `prepare-commit-msg`, PM's provided commit message is the initial value; hooks may append/modify it before the commit is finalized. If hooks modify files, for example auto-formatting in a pre-commit hook, the test gate tests the PRE-hook state; hooks run after test pass as part of the commit pipeline, not the test pipeline.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

#### W.8.4 Post-merge behavior

Modal: "Branch `assistant/{title}` has been merged into `{target}`."
- "Keep worktree" — worktree remains bound
- "Remove worktree" — unbind + prune
- "Cancel" — dismiss, worktree stays

Default follows `branching.assistant_worktree_cleanup_default` setting.

**No undo for completed merge.** User can `git reset`/`git revert` via terminal or agent bash.

#### W.8.5 Conflict resolution

- **UI-initiated:** Conflict markers in files route to `Source Control > Changes` and open the Conflict assistant through `cmd.source_control.open_conflict`; applying a concrete choice may fall through to existing `cmd.git.conflict_apply_resolution`, while lower-level `cmd.git.*` operations may support diff or hunk mechanics but are not the GUI entrypoint
- **Natural-language-initiated (NL-initiated):** Agent resolves conversationally by reading markers, explaining choices, and proposing edits via file editing tools; semantic resolution requires explicit user approval and then follows the Source Control Conflict assistant flow
- **Rebase conflicts during `git rebase {target}`:** Auto-abort (`git rebase --abort`). Dialog shows error. Tests never run. Lock released.

Assistant-bound worktree conflicts consume the Source Control owner flow instead of defining a second chat-local conflict UI. When a merge, `/rebase/worktree`, or worktree operation blocks on conflicts, chat surfaces the affected file list and routes `Open Conflict Assistant` to `Source Control > Changes` through `cmd.source_control.open_conflict`; pre-merge review pivots may open `cmd.source_control.open_review` with the current worktree and target branch as the compare pair. Natural-language assistance may explain conflict choices and propose edits, but semantic resolution still requires explicit user approval and follows the Source Control `/disabled`, `/settings`, and per-project preference rules.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

#### W.8.6 Create PR flow

Opens existing PR creation panel from GitHub_Integration.md §B with pre-filled fields: title (thread title), body (commit messages), target branch, source branch.

**Auto-push:** `git push -u origin {branch}` before PR panel opens. Push failure → error toast, PR panel does NOT open, and Chat emits `chat.thread_worktree_pr_failed` with `phase=push`.

**Guard:** Requires configured GitHub remote.

If the PR API call fails after push, the PR panel does not open; Chat shows "PR creation failed: {error}" and emits `chat.thread_worktree_pr_failed` with `phase=api`.

**Post-PR:** Worktree stays bound (PR open, may push more commits). No cleanup modal.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### W.8.7 Natural language merge

The agent emits a structured system action `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash|merge|rebase", "target_branch": "string", "commit_message": "string" } }`. This follows the same structured-command pattern as `cmd.chat.revert`; the agent does not run merge directly via bash. PM shows dialog pre-filled with agent's parameters. The merge is user-confirmed regardless of entry path: even yolo or auto-approve posture still shows the dialog before mutation.

For example, "merge my changes into main" may emit `{ "action": "cmd.chat.worktree.merge", "params": { "strategy": "squash", "target_branch": "main" } }` after resolving intent and parameters.

Before emitting the action, the agent may run `git status` through its normal tools; the tool context auto-scopes that check to the bound worktree through `working_directory` / `/cwd`.

**Mode guard:** Agent-NL invocation is rejected when the current mode is `ask` or `plan` with the exact error "Merge is not available via assistant in {mode} mode. Use the Merge button in the chat header dropdown." User UI clicks always allowed.

**Chaining:** Agent can chain commit → merge → cleanup in single conversational exchange.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Modes.md

### W.9 Pre-merge test gate

**Purpose:** Before committing a merge, run the project's test suite against the merged result to verify integration.

**Settings:** `branching.assistant_worktree_pre_merge_test` (bool, default true), `branching.assistant_worktree_pre_merge_cmd` (string, default empty = auto-detect), `branching.worktree_pre_merge_test_timeout_s` (int, default 300, clamped [30, 1800]), `branching.assistant_worktree_pre_merge_test_target` (enum `merged_result` (default, recommended) | `branch_only`).

When `branching.assistant_worktree_pre_merge_cmd` is set, PM runs that exact command. When it is empty, PM auto-detects the command from project files using the rules below.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

#### W.9.1 Auto-detection of test command

When `branching.assistant_worktree_pre_merge_cmd` is empty, detection requires verification that the relevant script/target actually exists, not just that a configuration file is present; rows marked file-presence-sufficient below are explicit convention-backed exceptions.

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
| **Rebase** | (worktree) `git rebase {target}` → **run tests** against the post-rebase worktree state → pass: (main) `git checkout {target}` → `git merge --ff-only {branch}` / fail: `git rebase --abort` |

The no-commit invariant for Squash/Merge is that tests run before any merge result is committed: Merge uses explicit `--no-commit`, while Squash uses `git merge --squash` to leave the merged result staged and uncommitted.

**For `branch_only` target:** Tests run in worktree against branch as-is BEFORE any merge/rebase operation. Failure blocks merge (with override). Rebase + branch_only: tests run BEFORE rebase begins. This preserves branch_only semantics: test the branch in isolation before any `/rebase` or merge/rebase mutation starts.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

#### W.9.3 Test dialog UX

Dialog transitions in-place to test phase. Fields become read-only. Live output in scrollable monospace region (~200px max-height). Cancel aborts test + cleanup. Auto-detect VERIFIES script/target existence before first-run prefill; package.json checks `scripts.test`, and Makefile checks for a `test:` target.

- **Pass (exit 0):** Auto-proceed to commit. Brief "Tests passed" indicator.
- **Fail (exit ≠ 0):** Red header "Tests failed" + full output + "Merge Anyway" (secondary/destructive) + "Cancel" (primary). Override proceeds to commit; seglog records override.
- **Timeout:** Same UI as failure.
- **Process error:** Same UI with error message.

Clean abort paths keep the repo out of a half-committed state: Squash cleanup uses `git reset --hard HEAD`, Merge cleanup uses `git merge --abort`, and Rebase cleanup uses `git rebase --abort`.

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

`/worktree merge` is one command with `--squash` and `--rebase` flags; separate slash commands are not introduced.

### W.12 File manager worktree context

When user switches to a thread with a worktree binding (and `file_manager.worktree_follow_thread` is `true`), the file manager switches root to show the worktree's file tree.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

**Breadcrumb indicator:** Worktree glyph + branch name + swap toggle icon at top of file manager tree. Clicking swap toggles between worktree root and main project root. Binary toggle. Toggle resets on ANY thread switch.

**Accessible label:** "Viewing worktree assistant/fix-auth. Click to switch to project root." (and inverse)

**Rules:**
- Open editor tabs NOT affected by root switch — tabs retain own paths
- File manager search scope follows current file manager root
- `@file` resolves relative to thread's `working_directory` (worktree root when bound)
- MCP tools and `/providers` receive the thread worktree path as `working_directory` when a worktree binding is active.
- Quick-open (Ctrl+P) remains project-scoped regardless of worktree context
- If thread unbound mid-session: file manager falls back to project root with toast "Worktree unbound — showing project root."

File-edit card path semantics follow the same execution context: chat file-edit cards display paths relative to the active `working_directory`, so a bound thread naturally shows worktree-relative paths without rewriting captured absolute mutation-log paths.

### W.13 LSP worktree awareness

LSP sessions are already keyed by `(host_id, server_id, root_identity)`. Different worktree path = different root_identity = naturally separate LSP session. No new keying model needed.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/storage-plan.md

**Thread focus change flow:** File manager root changes → LSP client sends `workspace/didChangeWorkspaceFolders` or new session initialized (lazy). Diagnostics/hover/completion operate against worktree file state.

**LSP session lifecycle:** Created on first file open from worktree. Idle-collected after 5 minutes with no open files (configurable). Destroyed when worktree removed.

### W.14 Remote SSH projects

Worktree creation follows project host authority. For remote SSH projects, `WorktreeManager` executes on remote host via SSH subprocess. No silent local fallback. All paths (worktree, FileSafe working_directory, terminal cwd) use remote filesystem.

Remote-mode projects are remote-host-scoped. PM MUST NOT create a silent local checkout `/mirror` as primary authority, and remote editing is not a download-edit-upload flow unless an explicit degraded `/offline` cache path is surfaced. File Manager and `/editor/FileSafe` read and write the remote filesystem, listing uses SFTP by default with SSH `find`/`ls` fallback, terminal sessions bind to remote PTY `/session-supervision`, and provider CLIs execute on the remote host while stdout/stderr stream back over SSH. Exact terminal host/process details belong to `seam-terminal-runtime-environment`, but chat, worktree, and dev-status surfaces must disclose the effective remote host instead of silently launching local equivalents.
Missing remote provider CLIs surface as degraded or unavailable provider capability: PM may probe or run configured provider CLIs on the remote host, but it MUST NOT auto-install a missing provider CLI without explicit user consent and provisioning confirmation, and it MUST NOT retarget provider execution to a local CLI as a silent fallback.

`GitHub_Integration.md §C` remains the owner of remote host identity, SSH reconnect policy, and remote-means-remote execution semantics. Assistant chat consumes that host-scoped context alongside File Manager, editor, terminal, and LSP: chat actions that target remote files use the shared remote-state vocabulary for `offline`, `stale`, `retrying`, `/pending-write`, and `read-only` situations and must never silently substitute local host behavior for a remote-mode project.

The `/file-manager/remote/review/runtime` seam stays implementation-ready through owner-doc handoffs: FileManager owns file-tree identity and remote file operations, Source Control/review owns compare and hunk review, Terminal/runtime owns PTY and process execution, and assistant chat owns only preview, reveal, and confirmation surfaces.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Executor_Protocol.md

### W.15 Error handling

| Error scenario | User-visible behavior |
|---------------|----------------------|
| `create_worktree` fails | Dialog stays open with inline error; retry or cancel |
| Auto-create fails | Thread created without worktree; warning toast |
| Branch rename fails after title gen | Keep temp name; no user interruption; log warning |
| Worktree path no longer exists | On next focus: detect, toast, auto-unbind with reason `path_missing`; PM does not re-create the missing worktree |
| Remove blocked by active run | Error toast; Remove button disabled |
| Branch name collision | Auto-append `-2`, `-3`… up to 10 attempts; dialog error if all collide |
| 1:1 violation attempt | Error toast "Already bound to thread '{title}'" |
| Merge fails mid-operation | Dialog shows inline error, main repo state is unchanged when git merge auto-aborts, and the dialog stays open for Retry or Cancel; after fixing the cause, the user re-triggers merge |
| Merge conflict | Dialog closes; conflict markers in files; SC highlights; existing resolution flow |
| Concurrent merge (lock contention) | Error toast "Another merge in progress"; all Merge buttons disabled |
| Test not found | Dialog shows error; Retry / Merge Anyway / Cancel |
| Test timed out | Dialog shows timeout + Merge Anyway / Cancel |
| Test output > 1MB | "[OUTPUT TRUNCATED]"; does not affect pass/fail |
| Detached HEAD: merge/PR | Dialog error; buttons disabled |
| Git hook rejects commit | "Merge failed: {hook} rejected commit"; Retry / Cancel |
| Stale merge lock at startup | Auto-remove if PID dead or >5 min; advisory toast |
| Project switch with bound worktree | Button disabled; tooltip "Worktree belongs to project '{name}'"; no auto-unbind |
| Worktree unbound mid-merge dialog | `binding-disappears-mid-dialog` FINAL behavior: dialog shows error and closes; no merge executes after the when-clause and binding re-check fail |
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
- No "Bind Existing" in MVP; binding an arbitrary pre-existing manual or orch-owned worktree would break the 1:1 ownership model because orch-owned worktrees carry `owner_node_id` lineage and manual worktrees have no Assistant thread owner
- No undo for unbind or merge in MVP
- No per-merge command override in MVP
- App uninstall does NOT auto-clean worktrees
- No inline chat history markers for worktree context changes
- Terminal context (cwd) for worktree-bound threads follows worktree path; no special terminal management
- Changes section always shows main repo (worktree-scoping Changes is not MVP)
- No thread export of worktree binding metadata
- No orchestrator-to-assistant worktree transfer on handoff
## Shared actor-boundary, route payload, and blocked_notice packet


### Actor boundary and runtime identity
- Assistant chat actors share runtime identity semantics with Orchestrator and Interview agents.
- Chat actors remain chat/session actors; they do not become nodes or lanes merely because they delegate to subagents.
- Requested/effective runtime identity, `execution_role`, and `operational_identity` are visible on chat-facing surfaces and in delegated child-run handoffs.

`execution_role` identifies the runtime actor; `operational_identity` identifies the side-effect identity or target context used by the action. `package-overseer` and seam-overseer identities are named runtime actors for handoff/display; they are not ordinary delegated subagents merely because a chat thread shows them.

### Canonical route payload
- Chat context includes route args from the parent run or session.
- Route args govern which tools and subagents are accessible within the chat session.
- Route args are immutable for the duration of the chat session; dynamic route changes are prohibited.

### blocked_notice packet
- When a chat query cannot be resolved within the current route/context, a structured blocked_notice packet is emitted.
- The blocked_notice includes the blocked query, the blocker reason, and a fallback resolution path (escalate to human, delegate to full Orchestrator, etc.).
- Blocked notices are distinct from errors; they indicate that the chat agent is functioning correctly but the requested work is out of scope.

`blocked_notice` packets include the blocked reason, detail ref, `/attempt` and node references when applicable, preserved-local-work summary, and ordered `allowed_action_ids[]` / `allowed_action_ids` action rendering. `wizard.blocked` and `node.blocked` consume the same stronger blocked taxonomy; any older `pre-runtime-escalation` wizard shape is compatibility evidence, not a separate live state.

## Shared Conversational Actor Runtime Identity

Assistant chat, interview, requirements-doc-builder, and PRD builder share `/account/usage/runtime` identity behavior without becoming orchestration nodes, `/packages/seams`, `Feature Seams`, `Work Packages`, graph `Nodes`, graph-plan actors, lane-pool objects, or package `/seam-governance` objects. They share requested/effective provider/model/persona/account/auth semantics, selection reason, skipped `/honored` disclosure, blocked `/retry/remediation/degradation` taxonomy, shared activity `/event-stream` infrastructure, and requested/effective `/model/effort/persona` display, while remaining conversational actors for `/brainstorming`, decision-forming, document-handling, conversational-to-structured questioning, topic-by-topic closure, and traditional requirements documents `/artifacts` under the relevant `/rules` and `/contract`. The requirements-doc-builder and PRD flows are document-production surfaces, not orchestration-style HITL escalation routes.

Blocked `/HITL/critical` Orchestrator events may open a chat-thread resolution-thread, but that pattern must not be projected back onto ordinary assistant, interview, or `/interviewer/requirements-builder` conversation. Those conversational actors already operate directly in chat and share `/account/usage` runtime behavior without becoming Orchestrator-style resolution objects.

Runtime recovery seams that affect chat must preserve `Architecture_Invariants.md` / `Architecture_Invariants`, `Decision_Log.md` / `Decision_Log`, `MiscPlan.md`, and `FileSafe.md` as adjacent owners for frozen requested/effective execution identity bundles, provider-pool concurrency scope, projection trust versus scheduler authority, safe-point lineage exactness, pre-cleanup ordering, deferred-run resume validity, DAE `/post-scan` blocked phases, orphan cleanup, and `/remediation` ordering. Under-documentation in those adjacent docs must not soften chat's own `/effective` identity and safe-point rules.

The execution-policy `/UI` split is explicit: worker kind and retry-context policy are separate settings, chat is a requested-identity override surface, and requested-vs-effective identity must align across chat actors and orchestration actors. The seam covers agent vs subagent, fresh vs reused retry worker, overseer delegation `/off`, delegated-worker provider/model/effort policy, requested-identity display, execution_role, actor_kind, `/platform/model-level` identity, `/account/switch` identity, and requested/effective `/account` disclosure.

Cross-doc parity references are `Plans/assistant-chat-design.md`, `/assistant-chat-design.md`, `Plans/interview-subagent-integration.md`, and `/interview-subagent-integration.md`; both docs must expose `/account` behavior for conversational actors sharing provider runtime.

`package`, `seam`, `lane`, `promotion`, `review`, and `resolution_thread` are persisted-or-projected schema questions owned by the package `/seam/lane` family, not by the chat thread model. Chat may render a detail-focus route with `inspector_target`, but that enum must stay small and must never become a fallback bag for unresolved route design. Live page/widget attribution that chat consumes is attempt-/lane-/session-aware: it uses `attempt_id`, receipt refs, `scheduler_lane`, `worktree_id`, requested/effective identity, and avoids tier-only routing through `tier_id` or generic `/widget` summaries.

`auto` persona or model selection must never appear as an opaque state with no resolved `/reason`; historical runs preserve the resolved effective persona and reason from the time of execution.

## Chat Route, Permission, and History Behaviors

Permission approval state must not leak across lanes, accounts, or shared-runtime actors just because they share a UI session. `always`, reject-cascade, and doom-loop behavior require a canonical actor/account/lane scope key; `Permissions_System.md` / `Permissions_System` default-deny hints for `todoread` and `todowrite` must narrow by execution-entity, actor-scoped context, and `/member/lane/account-bounded` permissions.

Worker-facing handoff and `/retry` memory are project-scoped structured runtime records, not vague "JSON-like" logs. The design must say whether the backing records/projections are `/JSONL/redb-backed`, which concrete `/path/delivery` or storage domain owns them, and how a worker receives the bounded packet, while keeping `/projections` and worker-facing handoff separate from full raw history.

`History` remains chronological but windowed: initial load shows a recent slice, `load-older` or jump controls bring in older items, dense event bursts collapse low-level records, and initial viewports do not force every low-level record into the thread. `Settings` is source-axis heavy and must show inheritance plus override origin so the user can answer what will be requested from the current surface. `origin` is audit-only even when actor identity is first-class elsewhere; it must never become behavior-driving actor identity.

Graph and history consumers use viewport culling with overscan, table virtualization, per-generation layout caching, incremental row `/item` updates, and frame-cadence burst throttling; when rectangle-based rendering falls below target performance, the fallback is canvas-style rendering.

A CtA card, blocked notice, search result, artifact pivot, thread usage jump, and `cmd.chat.focus_thread_usage` all restore destination and scope using the same internal payload model. Command palette entries, search results, artifact deep-links, blocked notices, and FileManager / `/Editor` opens all resolve through this internal target model rather than chat-local navigation. `cmd.chat.focus_thread_usage` focuses the thread Usage detail surface and may reuse side-panel docking or `/floating` realization. Blocked notices are rendered from `allowed_action_ids[]`, `allowed_action_ids`, and blocked metadata; `assistant-chat-design.md` / `assistant-chat-design` must not invent thread-local recovery semantics.

Route catalog policy is deterministic. Do not make a large public `cmd.nav.*` or `cmd.nav` family the main catalog-facing answer. Do not use hedge words such as `optional` or `maybe` when stating canonical direction. State allowed serialized data classes directly: wizard-step detail is a narrow serialized anchor, not a top-level base route field. `OpenFile` stays path `/editor` scoped; `OpenSubject` is the identity-open contract consumed by FileManager and assistant chat.

owner-consumer reconciliation treats these gaps as spec-integrity failures, not fresh design space. The remaining work is reconciliation-order implementation, not open-ended research or model invention.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/assistant-chat-design.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### ACD-001 - Assistant & Chat UI -- Design Plan Source-Preserving PlanUnit

```yaml
plan_unit_id: ACD-001
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Plans/assistant-chat-design.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0154
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0155
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0156
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0157
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0158
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0159
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0160
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0161
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0162
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0163
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0164
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0165
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0166
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0167
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0168
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0169
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0170
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0171
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0172
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0173
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0174
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0175
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0176
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0177
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0178
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0179
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:assistant-chat-design-S0180
preserved_exact_tokens:
- Assistant & Chat UI -- Design Plan
- Canonical owner-section requirements
- Shared conversational/runtime boundary
- Canonical route payload
- Change Summary
- Rewrite alignment (2026-02-21)
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md'
- Executive Summary
- Table of Contents
- 1. Modes Overview
- 1.0 Primary Assistant mode strip
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md'
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md'
- 1.0A Planning workflow rules
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md'
- 1.0B Debug Mode contract
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/GitHub_Integration.md'
- 1.0C Runtime mode normalization (canonical)
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
- '1.1 Chat controls: platform, model, and reasoning/effort'
negative_constraints:
- '- **Identity disclosure:** requested/effective runtime identity, account binding, and auth state are imported from the shared runtime contracts. Assistant Chat must not invent a parallel provider/auth field set.'
- '- **Additive field placement:** Assistant Chat treats the additive field design from `Plans/Contracts_V0.md` as frozen for this surface; reconciliation may align wording and placement but must not reopen the shared field set.'
- '- A revalidation gate surfaces an explicit reason in the Investigation Context; it MUST NOT silently continue as though the earlier target binding were still valid.'
- There are **two separate ELI5 toggles**; they are independent and must not be conflated. The authoritative dual-copy checklist for in-scope strings is `Plans/FinalGUISpec.md` §7.4.0.
- '- Ordinary fenced code blocks render an always-visible copy button; the copy affordance/behavior may add emphasis or secondary controls on hover/focus, but copy availability must not depend on hover-only discovery.'
- '- The now-locked `/web` direction keeps web research as a first-class Assistant, Interviewer, and doc-builder capability even in Plan or Deep Plan contexts; permission-mode/mode-override rules must not silently auto-deny web-research, websearch, webfetch, model-native, provider-native, or PM-compose'
- '- Bare `/web` is /help-only autocomplete and dispatches `cmd.chat.web.help`; executable web intents must resolve to an explicit subcommand and must not create slash-only or search-only event families.'
- '- The assistant MUST NOT silently reinterpret a Git request as a GitHub request, or vice versa, just because one path appears easier.'
- '- Teach MUST NOT persist secrets, tokens, passwords, or other credentials'
- '- The locked attachment taxonomy replaces any older two-type rendered-selection wording with three explicit paths: browser-element (`browser_element_context`), browser-text-selection (`browser_selection_context`), and native-document-selection (`document_selection_context`). Browser text capture mus'
- '- Dismissed and paused flows preserve submitted-vs-dismissed distinction: `status = "dismissed"` / dismissed state pauses the flow and must not fabricate partial submitted answers, auto-submit, or auto-cancel the broader thread. Paused is UI-only for a backgrounded/navigated-away widget and does not'
- '- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.'
- '- targeted revision MUST NOT auto-run Multi-Pass Review'
- '- `selection-to-chat` and `document-selection` always create chat-visible pending composer chips; they must not silently inject hidden messages or mutate a thread before the user sends.'
- '- GUI defaults: the annotation drawer may `auto-open` only on the first durable annotation creation in a bundle/page context; after that, drawer state is sticky and must not force-open for every annotation. Hidden chat on `send-to-chat` does not auto-open by default: the surface adds the selection t'
- '- The unified `pre-send` composer prep strip/tray groups typed chips by source, including `doc selection`, `browser context`, `Context Lens`, and attachments where applicable. Do not create a `document-selection-only` `/tray` or a separate document-only strip.'
- '- Chat must not render `full-document` bodies inline for Builder or Interview handoff. It should keep `/document-pane` or editor pointers plus bounded excerpts, context summaries, and provenance instead of dumping the whole document into chat.'
- Secondary affordances may include `Open in Editor`, `Save As`, and, after an accept action, `Queue Execution` when another run is active in the same thread. Crew execution may be selected through execution configuration or a crew-specific flow, but it must not replace the four primary post-plan choi
- '- File Manager `Add to Assistant Chat` uses that command to insert a visible canonical file reference into the active composer/thread context; it must not inline full file contents as a hidden side effect'
- '- file references are file-only in MVP; folder insertion is out of scope'
- 'The files-touched strip is an aggregate chat preview: clicking a path under files-touched, `Read:`, or `Edited:` opens the canonical source file, while any diff-oriented affordance opens the canonical diff/review owner surface. Chat may preview diffs and edit counts, but it must not own hunk-level s'
- '- **Project-only by default:** Auto-retrieval searches **only within the current project** (project-scoped indices; see §10.3). It MUST NOT search other projects or external sources unless the user explicitly requests external navigation/import (§7.4).'
- '- Retrieved Context is **not** “memory” and must not be written into the Assistant memory store unless separately captured as a verified gist (Plans/assistant-memory-subsystem.md).'
- '- the system MUST NOT mint a durable `thread_id` for an unsent empty draft'
compatibility_only_notes:
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
- '- Settings and help surfaces disclose provider support through a compatibility-matrix style view for first-class web tools, including support tier, provider order/fallback, credential state, and unavailable/high-side-effect controls.'
- '- Legacy `/what` lineage is compatibility/help-only and may surface usage or autocomplete guidance, but it does not bypass the explicit `/web` subcommand grammar.'
- '- compatibility-matrix'
- '- `single_question` is legacy syntactic sugar over the questionnaire envelope with exactly one QuestionItem; it uses the same answer source, draft, dismissal, and submit lifecycle as `questionnaire`. Decision #9 resolves the earlier Future Fields / TBD annotation: `response_kind` is LOCKED to `"sele'
- '- Legacy tool-shape aliases `header?: string`, `text: string`, and `options?: string[]` are accepted only at the compatibility boundary and normalize into the questionnaire envelope; legacy `answer: string` output normalizes into the canonical answer array with source metadata.'
- '- Multi-question `questionnaire` and `/questionnaire` cards render selectable options from `options?: Array<{id, label, description?}>`; `string[]` remains backwards-compatible only for legacy `single_question` callers and must be normalized to object-array options before draft storage, validation, '
- '- Question-card inputs support `allow_other`, `allow_multi_select?: boolean`, `required?: boolean`, `placeholder?: string`, and legacy `default_value?: string | string[]` as compatibility aliases that normalize into canonical `allow_freeform`, `multi_select`, `required`, `placeholder`, and `default_'
- '- The minimum output compatibility shape is `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`, `answers: Array<{ question_id, value, source: "option" | "other" | "freeform" }>`, `submitted: boolean`, and `submitted_at?`; canonical storage may also expose `answers: Array<'
- '- `/dismiss` is a retired shorthand for the same question-card exit path; canonical behavior is the dismissed/paused state transition above.'
- '- The question-flow supports single-choice and multi-choice question-card layouts; `allow_other = true` keeps the `Other` freeform route visible for legacy /callers as well as new questionnaire callers.'
- '- Legacy optional spellings `notes?` and `order_index?` normalize to canonical `notes` and `order_index`; this intentionally retires the source `?` suffix rather than dropping notes or ordering.'
- '- Legacy tool payloads `todos: Array<{ id?, content, status? }>` and `todos: Array<{ id, content, status }>` normalize into the Assistant TODO schema with `todo_id`, `title`, `summary`, `dependencies[]`, `owner_hint`, and `verification_hint`; `TODO` remains the visible checklist concept, not a secon'
- Terminal-associated threads are ordinary chat threads with terminal lineage, not a second terminal-thread identity model. If a message, command card, restore target, or permission path describes the owning thread as `terminal or non-writable`, the surface MUST treat that thread as terminal-associate
- '- The legacy compact badge shorthand `pending→running→completed|failed|cancelled` is only a base path; `running → blocked` and `blocked → running | cancelled` are explicit transitions triggered by recoverable waits such as permission denied, FileSafe held, or MCP unavailable.'
- '- Command-card `/edit/manage` menus expose terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop process` only when the referenced terminal/session state supports them. The legacy `Pop Out Terminal` label is a deprecated alias for `Detach/Pop-Out`.'
- '### 27.7 Provider compatibility disclosure in chat'
- Status bindings expose `dirty_state`/`/dirty_state` and `conflict_state`/`/conflict_state` to the icon renderer for compatibility with older state labels; canonical rendering still reads from `worktree_projection.v1:{project_id}:{worktree_id}`. All worktree controls have accessible labels, and creat
- '`blocked_notice` packets include the blocked reason, detail ref, `/attempt` and node references when applicable, preserved-local-work summary, and ordered `allowed_action_ids[]` / `allowed_action_ids` action rendering. `wizard.blocked` and `node.blocked` consume the same stronger blocked taxonomy; a'
stale_retired_dispositions:
- '- The message-stream control row keeps a thread-visible copy-icon on user and assistant messages, exposes `/submit`/stop morphing in the composer, and scopes `Stop`, `Edit`, and `Resend` to the most recent user-sent message only. `/edit/delete` is retired as a shorthand: edit and resend are supporte'
- '- `/control` is a retired generic shorthand in this section; use `message-control` plus the concrete Stop/Edit/Resend, send-stop morph, copy-icon, and jump controls.'
- '- /composer is a retired shorthand label; composer behavior is represented by the send/stop morph and most-recent-message actions above.'
- '- deprecated aliases shown distinctly from active commands'
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
- '- Migration `/alias` and `/deprecation` handling keeps `/cancel` visibly deprecated toward `/stop` and keeps retired `/clear` behavior out of active command canon unless the command-catalog owner re-promotes it.'
- '- Assistant Chat command-routing consumes `Plans/UI_Command_Catalog.md` for `/web`, `/skill`, reserved built-ins, and source obligation carry-through for `obl-037`, `obl-046`, `obl-047`, `obl-048`, and `obl-051`; stale local summaries are `/retire` lineage until the command-catalog owner promotes an'
- '- The locked attachment taxonomy replaces any older two-type rendered-selection wording with three explicit paths: browser-element (`browser_element_context`), browser-text-selection (`browser_selection_context`), and native-document-selection (`document_selection_context`). Browser text capture mus'
- '- `allow_freeform` is canonical. `allow_other` is a retired alias, and the historical `allow_freeform? / allow_other?` slash-ambiguity resolves to `allow_freeform`.'
- '- `/dismiss` is a retired shorthand for the same question-card exit path; canonical behavior is the dismissed/paused state transition above.'
- '- allow_other (retired alias; use allow_freeform)'
- '- User edits to a Deep Plan artifact reconcile through PM-extracted `/diffs`: TODO changes are normalized into the thread TODO list, emitted through `chat.plan_todo_updated`, and execution continues from the updated TODO projection rather than from a stale artifact copy.'
- '- conflicting or stale mutating annotations are excluded from automatic revision until the user resolves them'
- '- Conflict and stale outcomes are explicit: `overlaps`, `contradicts`, and `stale_after_edit` are later-phase conflict/status labels that can appear in audit or review UI, while current automatic revision still excludes conflicting mutating annotations until resolved.'
- '- `grep(pattern, path?, glob?)` -> transparent regex search over project files. When the per-project sparse n-gram index can narrow the query, grep uses it without changing the interface, limit, timeout, or permission model. When the index is missing, disabled, corrupted, building without a valid sn'
- 'The agent-facing `search-tool` summary in `Plans/assistant-chat-design.md` (`/assistant-chat-design.md`) preserves same-freshness guarantees: stale-index disclosure must say when a valid snapshot is serving results, when raw ripgrep fallback is active, and when dirty-layer freshness is still protect'
- '**Revalidation reasons** that prevent silent resume include at minimum target replacement, auth/account switch, worktree or branch drift, HEAD drift for bound file/worktree targets, expired instrumentation, and stale safe-point or remediation lineage.'
- '`Plans/assistant-chat-design.md` and `Plans/usage-feature.md` are the primary feature owners for context/usage display; command, storage, runtime-identity, and artifact-target docs remain required consumers so `/open` behavior resolves through canonical route/open to the editor-tab Context Detail Pa'
- Chat-local aliases such as `primary_target` and `final_or_intermediate_state` are retired. Assistant Chat consumes the canonical field names above and may layer presentation labels on top, but it must not rename the durable data contract. This is the canonical Contracts_V0 §5.1A to assistant-chat-de
- '- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.'
- '- Command-card `/edit/manage` menus expose terminal-focus, `View output`, `View output log`, `Retry attach`, and `Stop process` only when the referenced terminal/session state supports them. The legacy `Pop Out Terminal` label is a deprecated alias for `Detach/Pop-Out`.'
- Reference lists must defer to live owner docs instead of stale section-number citations.
- '- **Plans/Commands_System.md:** Reserved built-in slash-command set for chat surfaces; see `Plans/Commands_System.md#7. Reserved built-in slash commands` for the canonical `/web` family behavior and deprecated aliases.'
- '**Status source:** Chat header icon and thread selector icon read from `worktree_projection.v1:{project_id}:{worktree_id}` which includes `dirty_state` and `conflict_state` fields. UI subscribes to projection changes via standard reactive binding. If `projection_freshness = stale`: icon shows last-k'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Shared conversational/runtime boundary'
- '### Canonical route payload'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-26: Added media generation and capability introspection requirements (§7): image attachment nuance (all platforms accept image attachments; image *generation* is Cursor-native or Google-key-backed), `capabilities.get` introspection rule, natural-language model override semantics (per-messa'
- '- 2026-02-25: Added §5.3 Git & GitHub command boundary and §23.6 Git & GitHub parity note; cross-references Plans/GitHub_Integration.md.'
- '- 2026-02-25: Added §26 Per-Pass Validation Model/Provider Settings UX: settings group for per-pass (Pass 1/2/3) provider+model selection for the Three-Pass Canonical Validation Workflow (Plans/chain-wizard-flexibility.md §12). Stored in app settings (not project artifacts). Deterministic defaults v'
- '- 2026-02-24: Aligned Interview/Assistant output surfacing with **canonical sharded plan graphs** under `.puppet-master/project/plan_graph/` (**index + node shards**). Outputs are **persisted canonically in seglog** and projected into `.puppet-master/project/...` for file-based review; `.puppet-mast'
- '- 2026-02-23: Added Interview chat UX cross-reference to Contract Layer outputs and required `.puppet-master/project/*` artifact pack so interview completion is maximally AI-executable and verifiable (SSOT: `Plans/Project_Output_Artifacts.md`, `Plans/chain-wizard-flexibility.md` §5.7/§11).'
- '**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/Contracts_V0.md`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/UI_Command_Catalog.md`.'
- '- [5.3 Git & GitHub command boundary](#53-git--github-command-boundary)'
- '| Primary Assistant mode | Purpose | Canonical runtime posture | Default execution posture | Primary outputs | Default next step |'
- '### 1.0C Runtime mode normalization (canonical)'
- The chat surface exposes both workflow overlays and runtime execution posture. Only the runtime posture normalizes into the canonical run-envelope `mode` used by `Plans/Run_Modes.md`.
- '| UI/workflow state | Canonical runtime mode | Notes |'
- 'Expert/ELI5 copy pairs must remain behaviorally equivalent: Expert text uses precise, compact system-model language, while ELI5 text uses plain-language explanation plus one concrete example. The dual-copy rule covers authored `/help` and tooltip text; it does not create a separate `concept-help` sy'
- '- **Regular mode:** Agent asks for permission before executing or editing. User-facing approval follows the canonical ladder: `deny`, `once`, `for session`, `always`.'
- This section defines the canonical contract for this surface.
- '- The message-stream control row keeps a thread-visible copy-icon on user and assistant messages, exposes `/submit`/stop morphing in the composer, and scopes `Stop`, `Edit`, and `Resend` to the most recent user-sent message only. `/edit/delete` is retired as a shorthand: edit and resend are supporte'
- Composer behavior is the live owner surface for the send/stop morph, per-message stop scope, jump-to-bottom affordance, always-visible copy controls, and the no-delete message policy. These rules remain part of the message-control contract above rather than a separate command family or chat-local hi
- The reserved slash-command surface is canonical and non-overridable.
- This section consumes the linked owner contract and stays aligned with it.
- '- /assistant-chat and /clear are retired legacy or compatibility aliases in this Assistant Chat SSOT. `/revert` is active only through the command-catalog-owned `cmd.chat.revert` file-mutation restore path; it is not a conversation rewind or thread-clear alias.'
owner_hints:
- Plans/assistant-chat-design.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `617115e11c2fedeb013bfac6ecdbc1bd8abca75f85d590c67a2930152ff0664e`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `assistant-chat-design-S0001` through `assistant-chat-design-S0180` are preserved in place and mapped in `coverage_map.jsonl` to `ACD-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
