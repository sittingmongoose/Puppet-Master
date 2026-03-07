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

**Taxonomy note (required):** These five entries are **chat-surface modes**. They are distinct from the execution-layer run modes in `Plans/Run_Modes.md` (`ask`, `plan`, `regular`, `yolo`). Chat modes decide the user-facing flow and available controls in the thread. Run modes decide permission posture and delegated-tool behavior once execution starts. When a read-only chat mode transitions into execution (for example, approved Plan execution or BrainStorm execution), the chat switches to Agent mode and the execution layer resolves the appropriate run mode per `Plans/Run_Modes.md`.

**Requires a project:** Many chat features (e.g. @ file mention, File Manager, project-specific commands, running the Assistant with project context) **do not work when no project is selected**; when no project is selected, only application rules apply and project-scoped actions are unavailable or disabled.


### 1.0.1 Runtime mode normalization (canonical)

The chat surface exposes both **workflow overlays** and **runtime execution posture**. Only the runtime posture normalizes into the canonical run-envelope `mode` used by `Plans/Run_Modes.md`.

| UI/workflow state | Canonical runtime mode | Notes |
|---|---|---|
| Ask | `ask` | Always read-only. |
| Plan (before execution) | `plan` | Always read-only; produces plan output only. |
| Execute from Plan / Interview / BrainStorm / Crew with standard approvals | `regular` | Workflow overlay stays visible in UI, but does not create a new runtime mode enum. |
| Explicit Regular posture | `regular` | Standard execute posture. |
| Explicit YOLO posture | `yolo` | Full-automation execute posture. |

`Interview`, `BrainStorm`, and `Crew` are **workflow overlays**, not additional runtime mode enum values. The UI MUST normalize any active overlay + posture into one canonical runtime mode before spawning a run, and MAY persist the overlay separately for UX/restoration purposes only.

### 1.1 Chat controls: platform, model, and reasoning/effort (OpenCode-style)

The **chat window** must allow the user to change **platform**, **model**, and **reasoning/effort** at any time, without leaving the chat. This matches OpenCode desktop behavior where the session UI exposes provider and model selection (and optionally effort) in the titlebar or prompt area so the user can switch before sending the next message.

**Required controls (placement: chat header or footer strip, same area as the context circle):**

| Control | Requirement |
|--------|--------------|
| **Platform** | **Dropdown** listing available platforms (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). Selection applies to the **current thread**; next message uses the selected platform. Data from `platform_specs`; no hardcoding. |
| **Model** | **Dropdown** listing models for the **currently selected platform**. List is **dynamically discovered** (CLI-bridged providers only: `agent models`, `claude --list-models`; Gemini: models are discovered via Gemini API models.list (and cached)) and **cached**. **Customizable:** User can manage the model list (e.g. add/remove models, reorder, or mark favorites) via Settings or a "Manage models" entry point from the dropdown (OpenCode desktop adds a manage-models icon next to the selector so the user can open the models dialog without leaving the session). Fallback: when discovery fails, use `platform_specs::fallback_model_ids(platform)`. |
| **Reasoning / effort** | Shown **only when the platform supports it** (per `platform_specs::supports_effort(platform)`). **Claude Code:** dropdown or toggle (e.g. low / medium / high) -- maps to `CLAUDE_CODE_EFFORT_LEVEL`. **Codex / Copilot:** dropdown (e.g. Low, Medium, High, Extra High). **Cursor:** no separate control -- reasoning is encoded in model names (e.g. `sonnet-4.5-thinking`); model dropdown is sufficient. **Gemini:** no effort support; hide the control. |

**Definition: Turn.** A *turn* is one complete user→agent exchange: one user message plus the full agent response (including all tool calls, streaming output, and final result). Changing platform, model, or effort level takes effect on the **next turn** — the current response completes with the previous selection. If the user changes settings while an agent response is streaming, the change applies after that response finishes.

**Behavior:** Changing platform/model/effort applies to the **next turn** (see definition above); the current run (if any) continues with the previous selection unless the user stops it. **Context is passed along** when the user switches: conversation context is re-packed for the new model's limits and format (see §17). Slash command **`/model`** (or equivalent) can open the model selector or a quick-switch dialog for keyboard users.

**Reference:** OpenCode desktop -- provider and model selection in the session UI; "Manage models" icon next to the model selector (e.g. [anomalyco/opencode PR #9722](https://github.com/anomalyco/opencode/pull/9722)); model list from server/CLI discovery and user-managed models. We follow the same pattern: dropdowns in the chat footer/header, dynamic model list, optional "Manage models" from the chat.

---

