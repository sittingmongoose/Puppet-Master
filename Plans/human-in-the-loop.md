# Human-in-the-Loop (HITL) Mode -- Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- HITL behavior and tier-boundary semantics
- Settings model (phase / task / subtask, independent, off by default)
- Integration points with the orchestrator run loop
- DRY alignment with existing tier and verification plans

## Rewrite alignment (2026-02-21)

HITL semantics are part of the deterministic agent-loop core described in `Plans/rewrite-tie-in-memo.md`:

- HITL approvals should be represented as explicit **events** in the unified event model (seglog ledger)
- "Pause for approval" must be reproducible/replayable (event stream + projections), not just an in-memory UI state
- UI can change (Slint rewrite), but tier-boundary meaning and approval requirements must not

## Executive Summary

**Human-in-the-Loop (HITL) mode** lets the user require explicit human approval at selected tier boundaries. The orchestrator completes all work within the current tier (phase, task, or subtask), then **pauses at the boundary** until the human reviews and approves before proceeding to the next phase, task, or subtask. HITL is a **setting**: it can be enabled independently at phase level, task level, and subtask level. All HITL toggles are **off by default**.

**Critical autonomy rule:** HITL is an optional product UX feature. It MUST NOT be required for correctness, verification, or progression gates; autonomous runs proceed deterministically without any human approvals.  
ContractRef: PolicyRule:Decision_Policy.md§4, Gate:GATE-001

**Use cases:** Optional tier-boundary pauses for stakeholders (when explicitly enabled by the user).

## Relationship to Other Plans

| Plan | Relevance to HITL |
|------|-------------------|
| **Plans/orchestrator-subagent-integration.md** | Defines the main run loop (Phase → Task → Subtask → Iteration), tier boundaries, and **Start and End Verification at Phase, Task, and Subtask**. HITL does not redefine tiers; it adds a **pause-for-approval** step at the **end** of a tier, after end verification and before advancing. Tier semantics are the single source of truth in the orchestrator plan. |
| **Plans/interview-subagent-integration.md** | Interview flow has its own phases (Scope, Architecture, UX, etc.). HITL in this plan applies to the **orchestrator** tiers (Phase/Task/Subtask). Interview-phase-level HITL (pause after each interview phase for approval) is out of scope here but could mirror this design if added later. |
| **Plans/assistant-chat-design.md** | Defines **Dashboard warnings and Calls to Action (CtA)** and that they are **addressable via the chat Assistant**. HITL prompts are one type of CtA: when paused for approval, the Dashboard shows a CtA; the user can respond via the Assistant or a direct Dashboard control. See §16 there. |
| **Plans/newfeatures.md §20** | Summary and orchestrator integration: HITL is a **setting** only; tier semantics stay in the orchestrator plan; newfeatures defers full HITL spec to this document. |

## Tier Boundaries (DRY)

Tier boundaries are **not** redefined in this plan. They are defined in the orchestrator plan:

- **Phase boundary:** After all tasks (and their subtasks/iterations) in the current phase are complete; before starting the next phase.
- **Task boundary:** After all subtasks (and their iterations) in the current task are complete; before starting the next task.
- **Subtask boundary:** After all iterations in the current subtask are complete; before starting the next subtask.

HITL only specifies **where** to pause (at these boundaries) and **what** the human must do (review and explicitly approve). The **definition** of "phase," "task," and "subtask" remains in the orchestrator plan and code.

## Settings Model

### Three Independent Toggles

| Setting | Scope | Default | Effect when ON |
|--------|--------|--------|----------------|
| **HITL at phase** | After completing all tasks in the current phase | Off | Pause after phase end verification; wait for human approval before starting next phase. |
| **HITL at task** | After completing all subtasks in the current task | Off | Pause after task end verification; wait for human approval before starting next task. |
| **HITL at subtask** | After completing all iterations in the current subtask | Off | Pause after subtask end verification; wait for human approval before starting next subtask. |

- Each toggle is **independent**: e.g. phase-only, or task+subtask, or all three.
- **Off by default:** No HITL pause unless the user explicitly enables one or more levels.
- **Single source of truth:** These three settings live in one place in config (e.g. orchestrator or app config); GUI and run loop both read from that config. No duplicated semantics (DRY).

### GUI: Primary Place to Turn On and Configure HITL

HITL is a **setting in the GUI**. The user turns HITL on and configures **which tiers** it is enabled for from the application UI.

- **Where:** Orchestrator settings, Wizard, or a dedicated Orchestrator/Dashboard settings area. One place so the user can enable HITL and choose phase / task / subtask without editing config files.
- **Controls:** At least:
  - A way to **enable HITL** (master toggle or implicit when any tier is on).
  - **Per-tier toggles:** "Pause for human approval at phase completion," "... at task completion," "... at subtask completion." Each can be turned on or off independently.
- **Persistence:** Selections are written to the same config the orchestrator uses (e.g. `hitl: { phase: bool, task: bool, subtask: bool }` or equivalent); GUI reads and writes that config. Use existing widget patterns per `docs/gui-widget-catalog.md` where applicable.
- **Config (backend):** One structured block in the same config that holds tier/orchestrator settings. Exact key names and location to be decided at implementation time; GUI is the primary interface for changing them.

## Behavior

### Run-Loop Integration (Conceptual)

1. Orchestrator runs as today: Phase → Task → Subtask → Iteration, with start/end verification at phase, task, and subtask per the orchestrator plan.
2. When a **phase** is completed (end verification done):
   - If **HITL at phase** is ON → **pause**. Show completion state and "Approve & continue" (or equivalent). On approval → advance to next phase. On reject/cancel → remain paused (behavior for "reject" can be defined at implementation: e.g. stay on same phase, or mark phase as needs-review).
3. When a **task** is completed (end verification done):
   - If **HITL at task** is ON → **pause**. Same idea: human reviews, approves or rejects; on approval → next task.
4. When a **subtask** is completed (end verification done):
   - If **HITL at subtask** is ON → **pause**. Same idea: human reviews, approves or rejects; on approval → next subtask.

Pause points are **only** at tier boundaries (after a full phase/task/subtask is done), not mid-tier. Within a tier, the system runs to completion before any HITL gate.

### What the Human Sees and Does

- **At pause:** The UI should present that the current tier (phase/task/subtask) is complete and that approval is required to continue. The user can review progress, logs, artifacts, or evidence as needed.
- **Approve:** Explicit action (e.g. "Approve & continue") that clears the pause and allows the orchestrator to advance to the next tier.
- **Reject / Cancel:** Optional; exact semantics (e.g. retry same tier, mark for review, or abort run) can be specified at implementation time. This plan only requires that "approve" is the single mandatory action to proceed.

### Dashboard: Warnings and Calls to Action (CtA)

When the orchestrator is paused for HITL, the **Dashboard** must surface this as a **warning or Call to Action (CtA)** so the user is prompted to interact.

- **Dashboard role:** The Dashboard shows **warnings** and **Calls to Action** that need or benefit from user attention. HITL approval is one such CtA: e.g. "Phase X complete -- approval required to continue" or "Task Y done -- approve to proceed."
- **Addressable via Assistant:** These CtAs (including HITL prompts) can be **answered or addressed by the chat Assistant**. The user may:
  - Open the Assistant and respond there (e.g. "approve and continue," or ask for a summary before approving). The Assistant is the place where the user is prompted to interact with HITL when the Dashboard shows the CtA.
  - Or use a direct control on the Dashboard (e.g. "Approve & continue" button) if provided.
- **Single concept:** Warnings/CtAs live on the Dashboard; the Assistant is one way to address them. So HITL prompts appear as Dashboard CtAs and are explicitly addressable via the Assistant. See **Plans/assistant-chat-design.md** for Dashboard warnings/CtAs and Assistant integration.

### Relation to Existing Pause

The orchestrator plan mentions a **pause gate** (e.g. `PAUSE.md` or equivalent) that halts the run until the file is removed or the user resumes. HITL is **separate**: it is a tier-boundary approval gate driven by settings, not by a global pause file. The two can coexist: e.g. global pause can still apply; HITL adds additional, tier-specific approval points when enabled.

## DRY Summary

- **Tier definitions and boundaries:** Use orchestrator plan only; do not duplicate in this plan or in code.
- **HITL settings:** One config schema and one set of three booleans; GUI and orchestrator both read from that single source.
- **Verification order:** HITL runs **after** end verification at that tier (orchestrator plan "Start and End Verification at Phase, Task, and Subtask"); no new verification concept, only a pause-and-approve step.

## Implementation Hooks (Planning Only)

When implementing:

1. **Config:** Add HITL flags to the same config that the orchestrator uses for tier execution; ensure GUI reads/writes the same fields.
2. **GUI settings:** Provide HITL as a setting in the GUI: user turns HITL on and configures which tiers (phase / task / subtask) it is enabled for. Persist to config; orchestrator reads from config.
3. **Orchestrator run loop:** After "end verification" for a given tier (phase/task/subtask), if the corresponding HITL toggle is ON, transition to a "waiting for approval" state and do not advance until the user approves.
4. **Dashboard CtAs:** When paused for HITL, add a warning or Call to Action on the Dashboard that prompts the user to interact (e.g. "Phase complete -- approval required"). This CtA is addressable via the Assistant (see assistant-chat-design.md) or via a direct Dashboard control ("Approve & continue").
5. **Persistence:** If the app is closed while paused for HITL, on restore the run should still be in "waiting for approval" so the user can approve or cancel after reopening (align with any existing recovery/snapshot plan, e.g. newfeatures.md §4). **Seglog:** Emit a HITL event when the run pauses for approval and when the user approves/rejects (event type, tier, timestamp, outcome). This makes approval history replayable and auditable. **redb:** Persist **checkpoint/approval state** in redb (e.g. run or session table or a dedicated HITL state): current run id, tier at which pause occurred, status = awaiting_approval | approved | rejected, and optional timestamp. On restore, read this state so the UI shows 'waiting for approval' and the user can approve or cancel. Align with storage-plan.md (checkpoints in redb).

## Optional: Interview Flow

This plan does not define HITL for the **interview** flow (Scope, Architecture, UX, etc.). If interview-phase-level HITL is added later, it should:
- Reuse the same **concept** (pause at boundary, human approves, then continue).
- Use a separate setting (e.g. "HITL at interview phase") and interview-phase boundaries from the interview plan, so orchestrator tiers and interview phases remain separate and DRY.

---

*Document created for planning only; no code changes.*
