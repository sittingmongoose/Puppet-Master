# Shard 009: Settings Model

Source: `Plans/human-in-the-loop.md`

Source lines: L168-L254

Source SHA256: `ee507a21b600be08f0abbf657d63ce092c83687df7b82a35a5d66a026dab7abe`

---

## Settings Model

### Three Independent Toggles

| Setting | Scope | Default | Effect when ON |
|--------|--------|--------|----------------|
| **HITL at phase** | User-facing phase grouping | Off | Request approval at the corresponding package/seam gate decision point before the next phase grouping begins. |
| **HITL at task** | User-facing task grouping | Off | Request approval at the corresponding package/seam gate decision point before the next task grouping begins. |
| **HITL at subtask** | User-facing subtask grouping | Off | Request approval at the corresponding package/seam gate decision point before the next subtask grouping begins. |

- Each toggle is **independent**: e.g. phase-only, or task+subtask, or all three.
- Phase/task/subtask labels are configuration and display groupings only. They MUST NOT redefine `approval_scope_key`, blocked identity, recovery semantics, persistence ownership, or package/seam gate ownership.
- **Off by default:** No HITL pause unless the user explicitly enables one or more levels.
ContractRef: PolicyRule:Decision_Policy.md§4
- **Single source of truth:** These three settings live in one place in config (e.g. orchestrator or app config); GUI and run loop both read from that config. No duplicated semantics (DRY).
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### GUI: Primary Place to Turn On and Configure HITL
HITL is configured in the GUI and persisted in one canonical execution-affecting config block.

Canonical config shape:

```yaml
hitl:
  phase: false
  task: false
  subtask: false
```

Rules:
- this structure lives inside `GuiConfig`
- it is persisted in redb at `config:gui.hitl`
- GUI controls read and write this exact structure
- Option B runtime config construction copies this structure unchanged into the run snapshot at run start
- there is no second backend-only HITL key family for the same semantics

UI requirements:
- one visible place to enable or disable HITL per phase/task/subtask grouping
- phase/task/subtask toggles remain independent
- execution-affecting changes apply to the next run without requiring a restart

This section replaces any prior wording that left key names or config location to implementation-time choice.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md
### Run-Loop Integration (Conceptual)

1. Orchestrator may present Phase → Task → Subtask → Iteration grouping, with verification labels from Plans/orchestrator-subagent-integration.md, but those labels are display/configuration groupings rather than durable approval scope.
2. When a package or seam reaches its decision point:
   - If the matching HITL grouping setting is ON → **pause** through the canonical blocked episode. Show completion state and approval controls (see button labels below). On approval → emit the canonical approval and gate outcome events and advance according to the package/seam gate result.

    **HITL Button Labels (Resolved):**
    - **Primary action:** "Approve" or "Approve & Continue" is display copy for `allowed_action_id = approve`, dispatched as `cmd.runtime.approve`.
    - **Decline action:** "Decline" is the canonical display label for `allowed_action_id = decline`, dispatched as `cmd.runtime.decline`. Legacy "Reject" copy may appear only as compatibility text and MUST map to this action family.
    - **Recovery actions:** CtA buttons such as "Retry from safe point", "Start fresh attempt", "Resume after prerequisite", and "Replan" derive from the ordered `allowed_action_ids[]` for the blocked episode.
    - **Skip and abort actions:** "Skip node" maps to `allowed_action_id = skip_node`; "Abort run" maps to `allowed_action_id = abort_run`. Legacy "Skip" or "Cancel Run" copy is surface text only and MUST NOT create graph-local command semantics.
    - Button order follows the ordered `allowed_action_ids[]` from the runtime blocked episode; surfaces may group the primary approve/decline controls before recovery actions when the order is otherwise equivalent.

    **Action-label cleanup:** `Reject`, `Cancel Run`, and `Skip` are action-label surface copy over runtime action families, not canonical action names or separate command semantics.

    **On decline:** The run remains paused. The node is marked as blocked or needing review in the seglog with the same `run_id`, `node_id`, and `blocked_sequence`. A Call-to-Action (CtA) appears in the Assistant chat with runtime-derived options such as "Retry from safe point", "Skip node", "Replan", or "Abort run". The user must choose one of the advertised `allowed_action_ids[]` to proceed.

    **On abort:** The current run is aborted. The blocked episode and node execution context remain in lineage. All active subagents for this run receive a cancellation signal. The orchestrator returns to IDLE state. A runtime abort event is emitted with the node execution context.
3. The phase/task/subtask setting that requested the approval is retained as display/configuration context only; the blocked episode remains keyed by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`.
4. Within an unresolved package or seam, the system continues autonomous execution until a package/seam gate or blocked episode reaches its decision point. HITL does not create a competing tier-only execution model.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### What the Human Sees and Does

- **At pause:** The UI should present that the current package/seam decision point or configured phase/task/subtask grouping is complete and that approval is required to continue. The user can review progress, logs, artifacts, or evidence as needed.
- **Approve:** "Approve" or "Approve & Continue" clears the pause through `cmd.runtime.approve` and allows the orchestrator to advance when the blocked episode is current.
- **Decline / Abort:** "Decline" maps to `cmd.runtime.decline` and surfaces the ordered runtime recovery actions. "Abort run" maps to `cmd.runtime.abort_run`; legacy "Reject" and "Cancel Run" labels are compatibility copy only. See §2 for full specification.

### Dashboard: Warnings and Calls to Action (CtA)

When the orchestrator is paused for HITL, the **Dashboard** must surface this as a **warning or Call to Action (CtA)** so the user is prompted to interact.
ContractRef: ContractName:Plans/assistant-chat-design.md

- **Dashboard role:** The Dashboard shows **warnings** and **Calls to Action** that need or benefit from user attention. HITL approval is one such CtA: e.g. "Phase X complete -- approval required to continue" or "Task Y done -- approve to proceed."
- **Addressable via Assistant:** These CtAs (including HITL prompts) can be **answered or addressed by the chat Assistant**. The user may:
  - Open the Assistant and respond there (e.g. "approve and continue," or ask for a summary before approving). The Assistant is the place where the user is prompted to interact with HITL when the Dashboard shows the CtA.
  - Or use a direct control on the Dashboard (e.g. "Approve & continue" button) if provided.
- **Single concept:** Warnings/CtAs live on the Dashboard; the Assistant is one way to address them. So HITL prompts appear as Dashboard CtAs and are explicitly addressable via the Assistant. See **Plans/assistant-chat-design.md** for Dashboard warnings/CtAs and Assistant integration.

### Relation to Existing Pause

The Plans/orchestrator-subagent-integration.md mentions a **pause gate** (`PAUSE.md` file) that halts the run until the file is removed or the user resumes. HITL is **separate**: it is a package-complete / seam-complete approval gate driven by settings, not by a global pause file. The two can coexist: global pause can still apply; HITL adds additional, gate-specific approval points when enabled.
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md
