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
