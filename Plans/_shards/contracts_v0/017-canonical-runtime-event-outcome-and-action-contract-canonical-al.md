# Shard 017: Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)

Source: `Plans/Contracts_V0.md`

Source lines: L2525-L2668

Source SHA256: `395f317cff4aab317c64cd467be8f79a5edc391e26cceb7425ad6d01a40caeaa`

---

## Canonical Runtime Event, Outcome, and Action Contract Canonical Alignment (2026-03-09)


The canonical runtime event contract extends to child runs, crew coordination, and effective-context shaping. These contracts are part of the same runtime event and action family as parent execution. They are not an optional overlay and they do not define a separate event grammar.

### Child-run lifecycle and projection

PM child runs are canonical runtime entities with stable identity, lineage, and lifecycle. Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members all project into this same model. Disposable-by-default child lifecycle is the default product posture; long-lived or reopened child identity is the exception path.

This contract consumes the Persona definitions in `Plans/Personas.md` at `### 1.2 Subagent` and `### 5.1 Selection`, and it projects child lifecycle through `### 8.0 Event payloads (seglog)` rather than local status text. `Plans/CLI_Bridged_Providers.md` (`/CLI_Bridged_Providers.md` in legacy path references) is a provider-facade consumer of this child-run + Persona-storage contract, not a separate child-run ontology.

Canonical child lifecycle states are: `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, `cancelled`. `superseded` remains a terminal reason used when replacement occurred, even if the user-facing terminal state is still presented as `cancelled` or `complete` in some consumers.
ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]

Canonical child-run records preserve identity `/lineage`, role `/routing`, lifecycle state, attempt/resume state, effective capabilities `/runtime`, context `/handoff`, grouping structure, and result `/history` references. Chat `/storage/orchestration` projections consume those canonical events and MUST NOT invent child-only shadow state machines.

Child-to-parent signals are canonical runtime events, not ad hoc UI messages. At minimum the contract family includes: `progress`, `result`, `blocked`, `clarification_needed`, `context_expansion_requested`, `user_input_requested`, `failed`, `cancelled`. Parent orchestration may summarize, consolidate, or route these signals, but canonical event identity must remain intact.
ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]

The child event-model covers `/start/progress/work/thought/pause/block/outcome/retry/reroute/resume/grouping/context-shrinking` transitions as normalized runtime events, not as consumer-local prose states.

Legacy user-facing signal labels may render as `clarification-needed`, `context-expansion-needed`, and `user-input-requested`, but they map back to canonical child-to-parent runtime events rather than ad hoc message strings.

Chat-facing projection events may normalize child lifecycle into UI-specific projection envelopes, but they MUST preserve the underlying canonical child identity fields. Required fields remain `child_run_id`, `parent_run_id`, `thread_id`, timestamp, attempt identity when relevant, and requested/effective persona/runtime descriptors when the event semantics depend on them.
ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]

Child lineage must not be over-summarizes into generic status text. Runtime events, chat projections, batch summaries, and crew views may compress display copy, but they must preserve the canonical child lineage fields above and remain reversible to the event payload.
Child session header and `/sidebar` projections may show token `/context` and cost details, but those displays are projections over canonical child-run records and usage events rather than independent child state.

### Retry, reroute, replacement, and resume


`retry`, `reroute`, `replacement`, and `resume` are distinct runtime concepts and must remain distinct in contracts, storage, and event history.

- `resume`: continue the same paused or interrupted child without semantically resetting the task.
- `retry`: a new attempt in the same child lineage after failure, blockage, or interruption.
- `reroute`: same logical child task, different effective runtime surface or capability path.
- `replacement`: a new child because the old role, task shape, or specialization was wrong.

ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]

Cancelled and superseded children are terminal by default. Resumption is primarily for in-flight interrupted or waiting children, not for re-opening completed disposable helpers. Crew mode may justify narrower persistence or re-entry behavior, but only as an explicit mode-level exception.
ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]

### Crew-board coordination contracts

`Plans/orchestrator-subagent-integration.md` consumers must retire older crew `/message-board` and `active-agent` side-file patterns into this child-run contract. A side-file may project from canonical child-run records, but it must not stand beside them as a competing source of runtime truth.


Crew coordination uses an explicit crew board. Child-to-child communication in crew mode occurs through board messages or other explicit crew-scoped coordination records, not hidden direct peer channels. Crew board messages are task-scoped, attributable, timestamped, and persisted as part of shared crew coordination state.
ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]

Crew members do not gain new authority through board traffic. Permissions, tools, skills, plugins, MCP access, and provider restrictions remain subject to the same requested/effective capability rules as any other child run.
ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]

#### Stable subagent and crew event families


In addition to the effective-context projection events defined below (`subagent.context_shrunk` and `subagent.context_rehydrated`), the following stable runtime event families are canonical for subagent and crew orchestration. Child identity and lineage are not optional metadata: they are part of the event contract. A row that over-summarizes child lineage into generic status text is non-compliant with this contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `subagent.*` event below, the payload MUST preserve the PM lineage envelope:
- `run_id`
- `thread_id`
- `agent_id`
- `parent_run_id?`
- `child_run_id?`
- `parent_thread_id?`
- requested and effective runtime descriptors when they differ

The same lineage envelope applies to `subagent.spawn_requested` and `subagent.spawn_completed` when a dispatcher distinguishes request lifecycle from child-run creation and terminal completion. These names remain under `subagent.*`; `chat.subagent_*` and `chat.subagent_spawned` are legacy source aliases only.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

| event_type | payload_fields | description |
|---|---|---|
| `subagent.spawned` | `run_id`, `thread_id`, `agent_id`, `agent_type`, `parent_run_id`, `child_run_id`, `parent_thread_id`, `model_id` | New subagent created and linked to parent lineage. |
| `subagent.started` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `prompt_preview` | Subagent begins execution. |
| `subagent.progress` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `progress_pct?`, `status_text` | Progress update. |
| `subagent.tool_called` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `tool_args_preview` | Subagent invoked a tool. |
| `subagent.tool_completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `success`, `duration_ms` | Tool call finished. |
| `subagent.message_sent` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `message_preview`, `turn_index` | Follow-up message sent. |
| `subagent.message_received` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `response_preview`, `turn_index` | Response received. |
| `subagent.completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms`, `token_usage` | Subagent finished successfully. |
| `subagent.failed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `error_code`, `error_message`, `duration_ms` | Subagent failed. |
| `subagent.cancelled` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason`, `duration_ms` | Subagent was cancelled. |
| `subagent.timeout` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `timeout_ms`, `partial_result?` | Subagent exceeded time limit. |
| `subagent.retried` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `attempt_number`, `retry_reason` | Subagent retry attempt. |
| `subagent.context_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `context_usage_pct`, `threshold` | Context approaching limit. |
| `subagent.model_switched` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `from_model`, `to_model`, `reason` | Model changed mid-execution. |
| `subagent.paused` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason` | Subagent paused. |
| `subagent.resumed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `trigger` | Subagent resumed. |
| `subagent.output_truncated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `original_length`, `truncated_length` | Output was truncated. |
| `subagent.budget_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `budget_used_pct`, `budget_limit` | Approaching budget limit. |
| `subagent.escalated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `escalation_reason`, `target` | Subagent escalated to parent. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `crew.*` event below, the payload MUST preserve crew and child lineage together:
- `run_id`
- `thread_id`
- `crew_id`
- `parent_run_id?`
- `child_run_id?`
- `member_agent_ids[]` where membership matters

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md

| event_type | payload_fields | description |
|---|---|---|
| `crew.formed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `member_agent_ids[]`, `purpose` | Crew created. |
| `crew.member_added` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `role` | Member joined. |
| `crew.member_removed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `reason` | Member left. |
| `crew.coordination` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `coordination_type`, `details` | Inter-agent coordination. |
| `crew.completed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms` | Crew finished. |
| `crew.disbanded` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `reason` | Crew dissolved. |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md
### Dynamic context shrinking and effective-context projection


### Effective context rule

Dynamic context shrinking is a canonical effective-context mechanism distinct from compaction, retrieval injection, rotation, and Assistant memory. It operates during ordinary tool-driven work and may replace stale effective-context blocks with shorter summaries while preserving canonical source state and rehydration references.
ContractRef: Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history. [Source: Prompt_Pipeline.md#dynamic-context-shrinking; storage-plan.md#canonical-child-run-records-and-batch-structure]

Prompt Pipeline remains the owner for `## 2. Compaction and pruning`, `### 2.1 Context assembly and cache preservation`, and `### 2.2 Dynamic context shrinking`. Contracts_V0 records only the cross-contract floor: giant-instruction-file and instruction-file content must have an agent-visible context-budget, oversized static instruction material should shift to /on-demand retrieval or scoped references, and shrinking/replay events must preserve enough `/history`, `/continuity`, source refs, and drift-control lineage to rehydrate without pretending effective-context summaries are the source of truth.

The default automatic shrinking scope is tool results. Retrieved-context blocks and plan/report blocks remain user-configurable optional categories. Shrinking uses conservative automatic triggers based on staleness and context pressure, with current working set items protected from automatic shrinking.
ContractRef: Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content. [Source: Prompt_Pipeline.md#dynamic-context-shrinking]

Runtime projection may emit `subagent.context_shrunk` and `subagent.context_rehydrated` events where effective-context state changes need to be inspectable or replayable. These events supplement, but do not replace, canonical child history and source references.
ContractRef: Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#17-context--truncation]

Every tool-call event that participates in effective-context shaping carries `_context_updates`; when no compression or rehydration is needed, the field is present as `[]`.

### Parent mediation and required-vs-optional dependency state

Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis. Children do not directly interrogate the user by default. Required versus optional child dependency classification is part of the canonical runtime contract because it determines whether unresolved child work blocks dependent parent completion.
ContractRef: Parent orchestration MUST preserve required-vs-optional child dependency semantics and MUST mediate child-to-user escalation by default. [Source: orchestrator-subagent-integration.md#plan-mode-strategy--defaults; assistant-chat-design.md#14-subagents--crew]

Blocked state means external or runtime constraints prevent progress. `awaiting_parent` means the child is paused pending parent decision, clarification, context expansion, or user response. These are not interchangeable.
ContractRef: `blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; assistant-chat-design.md#14-subagents--crew]
