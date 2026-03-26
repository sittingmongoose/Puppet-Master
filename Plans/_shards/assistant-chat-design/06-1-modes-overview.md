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

Debug Mode is the explicit Assistant entrypoint for PM's fully automated, evidence-first debugging workflow.

Required rules:
- Debug Mode is stronger than a behavioral hint. When selected, the assistant is expected to proactively use debug-capable tools, bounded evidence capture, and verification loops when policy and capabilities allow.
- Debug Mode is an Assistant-only workflow overlay, but the underlying debug-capable tools remain shared platform capabilities that Orchestrator, Interview, and delegated runs may use under the same contracts.
- The default Debug loop is: target discovery or confirmation -> baseline capture -> temporary instrumentation when needed -> reproduction -> evidence collection -> diagnosis -> smallest viable fix -> verification -> cleanup.
- Debug Mode remains execution-capable. There is no stable `Debug + ask` combination for automated investigations.
- Debug Mode persists `requested_mode_overlay = debug` and `effective_mode_overlay = debug`, while runtime mode and execution strategy continue to resolve through `Plans/Run_Modes.md`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md

Supported Debug target kinds are:
- `dev_session`
- `browser_target`
- `dap_session`
- `agent_session`
- `imported_bundle`

Target rules:
- project-backed targets (`dev_session`, `browser_target`, `dap_session`) require an active project context
- without an active project, only `agent_session` and `imported_bundle` are available and the unavailable target kinds must be disclosed explicitly
- target binding is identity-native; Debug Mode must not silently retarget from one bound subject to another
- starting a different target while an active investigation already exists requires an explicit continue-or-supersede decision

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md

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

