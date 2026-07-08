# Provider Stream Mapping — External Reference (A2A Bridge)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Provider-native correlation and approval scope
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## 1. Purpose
This document maps upstream external-framework native events and A2A bridge concepts to Puppet Master V0 normalized stream events defined in `Plans/CLI_Bridged_Providers.md`. It is the canonical external-reference guide for adapter implementors building provider bridges against the upstream external agent framework and its A2A interop layer.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

This document is **not** the SSOT for Puppet Master internal orchestration. Internal child-run supervision, crew coordination, timeout propagation, requested/effective runtime state, and PM-native lineage remain owned by `Plans/orchestrator-subagent-integration.md`, `Plans/Contracts_V0.md`, and `Plans/storage-plan.md`.

This scope is `/future-interop-only`: external A2A mappings can inform bridge adapters, but internal-adoption of A2A semantics for PM child-run control requires a separate owner-doc change in the PM-native runtime SSOTs above.

A2A is REJECTED for internal PM orchestration. OpenCode failure evidence is consumed here only as external bridge input, then translated into PM-owned canon for run budgets, permissions, tool dispatch, provider adapters, billing, file safety, storage integrity, prompt/cache behavior, MCP lifecycle, and orchestrator ownership.

The external-only bridge may map provider reconnect `/resume` evidence to the `Plans/CLI_Bridged_Providers.md` circuit-breaker contract, but it must not redefine PM-internal retry, resume, or child-run semantics.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md
## 2. Non-goals
- Redefining the V0 event envelope or event types table (SSOT: `Plans/CLI_Bridged_Providers.md`).
- Defining persistent storage semantics (SSOT: `Plans/storage-plan.md`).
- Defining tool schemas, permissions, or policy (SSOT: `Plans/Tools.md`, `Plans/FileSafe.md`).
- Defining UI/UX behavior or widget rendering.
- Specifying transport mechanics beyond the external bridge mapping surface.
- Defining or approving PM-internal orchestration, child-run control messages, crew scheduling, or runtime ceilings.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/orchestrator-subagent-integration.md
## 3. References (DRY)

| Reference | Canonical location |
|---|---|
| V0 event envelope + event types table | `Plans/CLI_Bridged_Providers.md` §Normalized provider stream schema (V0) |
| Architecture invariant INV-001 (tool correlation) | `Plans/Architecture_Invariants.md#INV-001` |
| Canonical terms | `Plans/Glossary.md` |
| User-project output artifacts | `Plans/Project_Output_Artifacts.md` |
| Decision policy | `Plans/Decision_Policy.md` |
| HITL semantics | `Plans/human-in-the-loop.md` |
| Overseer responsibilities | `Plans/Glossary.md` §2 (Overseer definition) |

ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001

---

## 4. V0-safe primitives used

This document references only the existing V0 event types defined in `Plans/CLI_Bridged_Providers.md`. No new event types are introduced.

The V0 event types used in this mapping:

- `text_delta` — incremental assistant output
- `thinking_delta` — incremental reasoning output
- `tool_use` — tool invocation start
- `tool_result` — tool invocation end/result
- `usage` — usage/cost updates
- `auth_state` — auth/availability state changes
- `diagnostic` — non-fatal parse/adapter diagnostics
- `error` — fatal/near-fatal adapter error
- `done` — terminal event

All mapping rules in this document emit only these types. DRY: the authoritative payload-field definitions live in `Plans/CLI_Bridged_Providers.md` and are not repeated here.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009

---

## 5. Canonical diagnostic instrumentation (reserved categories)


All provider-specific diagnostic events MUST use `type: "diagnostic"` with a `category` from the reserved set below. Provider/source-specific context MUST be namespaced via `diagnostic.details.source` (e.g. `"external_ref_native"`, `"a2a"`), not via category names.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

### 5.1 Reserved diagnostic categories and required details keys

| Category | Required `diagnostic.details` keys | Semantics |
|---|---|---|
| `run_started` | `run_id`, `source`, `timestamp` | Emitted once when the adapter begins processing a provider run. |
| `run_finished` | `run_id`, `source`, `timestamp`, `outcome` | Emitted once when the adapter completes processing. `outcome` is `"success"` or `"failed"`. |
| `step_started` | `run_id`, `source`, `step_id`, `agent_name` | A logical step (agent turn) has begun. |
| `step_finished` | `run_id`, `source`, `step_id`, `agent_name`, `outcome` | A logical step has completed. |
| `tier_boundary` | `run_id`, `source`, `from_tier`, `to_tier` | Tier transition detected (Phase/Task/Subtask/Iteration). |
| `handoff` | `run_id`, `source`, `from_agent`, `to_agent`, `handoff_kind` | Agent-to-agent handoff. `handoff_kind`: `"after_work"`, `"on_condition"`, `"on_context_condition"`, `"reply_result"`. |
| `input_required` | `run_id`, `source`, `prompt_text`, `context_id` | Provider signalled human input is needed (HITL pause). |
| `input_provided` | `run_id`, `source`, `context_id` | Human input was supplied; run resumes. |
| `artifact_update` | `run_id`, `source`, `artifact_id`, `artifact_name`, `append`, `last_chunk`, `part_kind` | An artifact chunk was received. `part_kind` is `"text"`, `"data"`, `"file"`, or `"mixed"`. |
| `artifact_data_part` | `run_id`, `source`, `artifact_id`, `part_kind`, `part_index` | A data part within an artifact. `part_kind`: `"text"` or `"data"`. |
| `artifact_file_part` | `run_id`, `source`, `artifact_id`, `file_path`, `persisted` | A file-type part within an artifact has been persisted. |
| `raw_observation` | `run_id`, `source`, `event_type_name`, `truncated` | A raw upstream event was captured for debugging. Bounded ring buffer (see §8.6). |
| `overseer_audit_started` | `run_id`, `source`, `tier`, `audit_kind` | Overseer begins a subjective audit. `audit_kind`: `"start_of_tier"` or `"end_of_tier"`. |
| `overseer_reviewer_spawned` | `run_id`, `source`, `reviewer_id`, `tier` | Overseer spawned a reviewer subagent. |
| `overseer_reviewer_verdict` | `run_id`, `source`, `reviewer_id`, `verdict` | A reviewer returned a verdict. `verdict`: `"accept"` or `"remediate"`. |
| `overseer_audit_consensus` | `run_id`, `source`, `consensus_result` | Consensus computed from reviewer verdicts. `consensus_result`: `"accept"`, `"remediate"`, or `"escalate"`. |
| `overseer_audit_verdict` | `run_id`, `source`, `final_verdict`, `verifier_passed`, `forced_remediation` | Final audit verdict. May force remediation even if verifier passed. |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, Gate:GATE-009

### 5.2 Namespacing rule (normative)

Provider/source-specific diagnostics MUST be namespaced via `diagnostic.details.source`. The `category` field MUST use only the reserved values above. Adapters MUST NOT invent new categories; provider-specific context goes in `diagnostic.details` under keys prefixed with the source name if the reserved keys are insufficient.

ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, Gate:GATE-009

---

## 6. Mapping table 1 — Upstream native events → V0

Each row maps one upstream native event class to the V0 event type(s) it produces. All `ref:` citations point to local upstream clone paths.

| Upstream event class | V0 event type(s) | Mapping rule | Citation |
|---|---|---|---|
| `BaseEvent` (abstract) | — | Not emitted directly; all concrete events inherit `uuid` field used for dedup. | `ref:autogen/events/base_event.py::BaseEvent` |
| `wrap_event` decorator | — | Wraps each event class with a `type` discriminator + `content` field for serialization. Adapter reads `type` to dispatch mapping. | `ref:autogen/events/base_event.py::wrap_event` |
| `StreamEvent` | `text_delta` | `payload.text` ← `content`. Emitted per streaming text chunk. | `ref:autogen/events/client_events.py::StreamEvent` |
| `TextEvent` | `text_delta` | `payload.text` ← stringified `content`. Used for non-streaming full agent messages. | `ref:autogen/events/agent_events.py::TextEvent` |
| `ToolCallEvent` | `tool_use` (one per `tool_calls` entry) | For each `ToolCall` in `tool_calls`: `payload.tool_use_id` ← `ToolCall.id` (synthesized if null; see §8.1), `payload.tool_name` ← `ToolCall.function.name`, `payload.arguments` ← parsed `ToolCall.function.arguments`. | `ref:autogen/events/agent_events.py::ToolCallEvent` |
| `ToolResponseEvent` | `tool_result` (one per `tool_responses` entry) | For each `ToolResponse`: `payload.tool_use_id` ← `tool_call_id`, `payload.tool_name` ← lookup from the prior correlated `tool_use` with the same `tool_use_id` (fallback `"<unknown>"`), `payload.ok` ← `true`, `payload.result` ← `content`. If no correlated `tool_use` exists, follow §8.7 (synthesize a placeholder `tool_use` + emit correlation diagnostics). | `ref:autogen/events/agent_events.py::ToolResponseEvent` |
| `FunctionCallEvent` | `tool_use` | `payload.tool_use_id` ← synthesized (see §8.1), `payload.tool_name` ← `function_call.name`, `payload.arguments` ← parsed `function_call.arguments`. Legacy path; if `ToolCallEvent` is also observed for the same logical call, the adapter prefers `ToolCallEvent` and captures `FunctionCallEvent` as `raw_observation` to avoid double-emitting tool lifecycles. | `ref:autogen/events/agent_events.py::FunctionCallEvent` |
| `FunctionResponseEvent` | `tool_result` | `payload.tool_use_id` ← correlated from prior `tool_use` (or synthesized per §8.7), `payload.tool_name` ← correlated `tool_use.tool_name` (fallback `name`), `payload.ok` ← `true`, `payload.result` ← `content`. | `ref:autogen/events/agent_events.py::FunctionResponseEvent` |
| `UsageSummaryEvent` | `usage` | `payload.input_tokens` ← summed `prompt_tokens` across `actual.usages`, `payload.output_tokens` ← summed `completion_tokens`, additional fields: `total_cost`, `model` (per-model breakdown available in details). | `ref:autogen/events/client_events.py::UsageSummaryEvent` |
| `TerminationEvent` | `diagnostic` (category `run_finished`) + `done` | First emit `diagnostic` with `details.outcome` derived from `termination_reason`. Then emit `done` with `status` = `"success"` or `"failed"` based on reason analysis. | `ref:autogen/events/agent_events.py::TerminationEvent` |
| `InputRequestEvent` | `diagnostic` (category `input_required`) | `details.prompt_text` ← `prompt`. Triggers HITL pause semantics (§8.3). No `done` emitted. | `ref:autogen/events/agent_events.py::InputRequestEvent` |
| `InputResponseEvent` | `diagnostic` (category `input_provided`) | `details.context_id` ← correlated from request. Seq continues from pause point. | `ref:autogen/events/agent_events.py::InputResponseEvent` |
| `ErrorEvent` | `error` | `payload.category` ← `"upstream_error"`, `payload.message` ← stringified `error`. | `ref:autogen/events/agent_events.py::ErrorEvent` |
| `RunCompletionEvent` | `diagnostic` (category `run_finished`) + `done` | `details.outcome` ← `"success"`, `done.status` ← `"success"`. Summary/cost available in diagnostic details. | `ref:autogen/events/agent_events.py::RunCompletionEvent` |
| `AfterWorksTransitionEvent` | `diagnostic` (category `handoff`) | `details.from_agent` ← `source_agent`, `details.to_agent` ← `transition_target.display_name()`, `details.handoff_kind` ← `"after_work"`. | `ref:autogen/agentchat/group/events/transition_events.py::AfterWorksTransitionEvent` |
| `OnContextConditionTransitionEvent` | `diagnostic` (category `handoff`) | `details.handoff_kind` ← `"on_context_condition"`. Same structure as above. | `ref:autogen/agentchat/group/events/transition_events.py::OnContextConditionTransitionEvent` |
| `OnConditionLLMTransitionEvent` | `diagnostic` (category `handoff`) | `details.handoff_kind` ← `"on_condition"`. Same structure as above. | `ref:autogen/agentchat/group/events/transition_events.py::OnConditionLLMTransitionEvent` |
| `ReplyResultTransitionEvent` | `diagnostic` (category `handoff`) | `details.handoff_kind` ← `"reply_result"`. Same structure as above. | `ref:autogen/agentchat/group/events/transition_events.py::ReplyResultTransitionEvent` |
| `SelectSpeakerEvent` | `diagnostic` (category `raw_observation`) | Captured as raw observation; selection mechanics are upstream-specific and not treated as a first-class step boundary in V0. | `ref:autogen/events/agent_events.py::SelectSpeakerEvent` |
| `ExecuteCodeBlockEvent` | `diagnostic` (category `raw_observation`) | Captured as raw observation; not mapped to `tool_use` (code execution goes through Puppet Master tool policy). | `ref:autogen/events/agent_events.py::ExecuteCodeBlockEvent` |
| `ExecuteFunctionEvent` | `diagnostic` (category `raw_observation`) | Captured as raw observation for debugging. | `ref:autogen/events/agent_events.py::ExecuteFunctionEvent` |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## 7. Mapping table 2 — Upstream A2A bridge concepts → V0


### 7.0 A2A discovery and task identity boundary

Each row maps an A2A protocol concept to V0 event(s). All `ref:` citations point to local upstream clone paths.

External A2A discovery remains adapter metadata. An `AgentCard` JSON document discovered at a well-known URL may describe a remote agent's capabilities, but PM records it only as provider-native capability evidence and never lets it replace the PM registry, permission ceiling, runtime snapshot, or provider capability contract. Upstream `contextId` / `context_id` groups related A2A Tasks, and once an upstream Task is terminal PM treats that Task as immutable; continuation or recovery must use PM-owned resume, retry, or attempt lineage rather than reopening the terminal A2A Task.

A2A v1.0.0 transport evidence remains external-bridge input: `JSON-RPC 2.0` over `HTTP(S)` is the primary adapter surface, while `gRPC` and `HTTP+JSON/REST` bindings are treated as provider transport variants rather than PM-native orchestration modes. The A2A core primitives stay explicit in bridge evidence: `AgentCard` is discovery metadata, `Task` is the stateful upstream work unit, `Message` is the turn payload, `Part` is content, and `Artifact` is output.

Because each external A2A Task can create a fresh HTTP session with fresh context, provider prompt caching may rely on STABLE PREFIXES only inside a PM-owned session or adapter-continuity boundary. Cross-task cache reuse must be explicit provider evidence, not assumed from A2A task continuity.

| A2A concept | V0 event type(s) | Mapping rule | Citation |
|---|---|---|---|
| `TaskState.submitted` | `diagnostic` (category `run_started`) | Emitted when `AutogenAgentExecutor.execute` publishes the initial task. `details.source` ← `"a2a"`. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `TaskState.working` | `diagnostic` (category `step_started`) | `details.step_id` ← `task.id`, `details.agent_name` ← executor agent name. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `TaskState.input_required` | `diagnostic` (category `input_required`) | `details.prompt_text` ← extracted via `response_message_from_a2a_task` when `task.status.state is TaskState.input_required`. Note: the upstream A2A client treats `TaskState.input_required` as a completion condition for polling (`_is_task_completed`), but Puppet Master treats it as a non-terminal pause (no `done`; see §8.3). | `ref:autogen/a2a/utils.py::response_message_from_a2a_task`, `ref:autogen/a2a/client.py::_is_task_completed` |
| `TaskState.completed` (via `updater.complete()`) | `diagnostic` (category `run_finished`) + `done` | `done.status` ← `"success"`. Emitted after final artifact chunk. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `Message` (A2A protocol) | `text_delta` or `diagnostic` | If `Message.role` is user-equivalent, treat it as `input_provided` (resume signal) and preserve the raw message in `diagnostic.details`. If assistant-equivalent, emit `text_delta` by extracting text from `TextPart` and/or assembled content in `response_message_from_a2a_task`. | `ref:autogen/a2a/utils.py::request_message_to_a2a`, `ref:autogen/a2a/utils.py::response_message_from_a2a_task`, `ref:autogen/a2a/utils.py::response_message_from_a2a_message` |
| `Part` / `TextPart` | `text_delta` | `payload.text` ← `TextPart.text` (or `content` extracted via `message_from_part`). Preserve `TextPart.metadata` (when present) in `diagnostic.details` (never inlining binary). | `ref:autogen/a2a/utils.py::message_to_part`, `ref:autogen/a2a/utils.py::message_from_part` |
| `Part` / `DataPart` | `diagnostic` (category `artifact_data_part`) | Preserve the data-part payload losslessly in `diagnostic.details` and/or persisted artifacts. Do not inline non-text/binary data in `text_delta`. If a text projection exists (e.g. `data["content"]`), it MAY be emitted as `text_delta` while still retaining the full data in diagnostics. | `ref:autogen/a2a/utils.py::update_artifact_to_streaming`, `ref:autogen/a2a/utils.py::message_from_part` |
| `Artifact` (A2A) | `diagnostic` (category `artifact_update`) | `details.artifact_id` ← `artifact.artifact_id`, `details.artifact_name` ← `artifact.name`, `details.append` ← `streaming_started`, `details.last_chunk` ← from `add_artifact` call. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute`, `ref:autogen/a2a/utils.py::make_artifact` |
| `TaskArtifactUpdateEvent` (streaming) | `text_delta` + `diagnostic` (category `artifact_update`) | `update_artifact_to_streaming` yields `StreamEvent` per part → each maps to `text_delta`. Adapter also emits `artifact_update` diagnostic with chunk metadata. | `ref:autogen/a2a/utils.py::update_artifact_to_streaming` |
| `TaskStatus` updates | `diagnostic` (category `step_started` or `step_finished`) | State transitions surface as step diagnostics. Terminal states trigger `done`. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `ServiceResponse` (remote protocol) | `text_delta` or `diagnostic` | `streaming_text` → `text_delta`. `input_required` → `diagnostic` (category `input_required`). `message` → `text_delta` (final content). | `ref:autogen/agentchat/remote/protocol.py::ServiceResponse` |
| `A2aRemoteAgent` | — | Not an event; agent wrapper. Bridges `ConversableAgent` to A2A client. Adapter treats it as a regular agent source. | `ref:autogen/a2a/client.py::A2aRemoteAgent` |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## 8. Deterministic rules (normative)

### 8.1 Tool-use ID synthesis


When the upstream event provides a null or missing `tool_call_id` / `ToolCall.id` (as allowed by `FunctionCallEvent` and some `ToolCallEvent` instances; ref:autogen/events/agent_events.py::FunctionCallEvent, ref:autogen/events/agent_events.py::ToolCallEvent), the adapter MUST synthesize a deterministic `tool_use_id` using the format `pm-synth-{run_id}-{seq}` where `seq` is the current monotonic sequence number. This ensures INV-001 correlation integrity.

ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

### 8.2 Deduplication policy

Upstream events carry a `uuid` field (inherited from `BaseEvent`; ref:autogen/events/base_event.py::BaseEvent). The adapter MUST maintain a bounded seen-set (capacity: 10 000 entries, LRU eviction) keyed on `uuid`. If a duplicate `uuid` is received, the event MUST be silently dropped and a `diagnostic` (category `raw_observation`, `details.truncated` = `true`) MAY be emitted.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009

### 8.3 Pause/resume semantics (HITL input-required)

When the adapter receives `InputRequestEvent` (native; ref:autogen/events/agent_events.py::InputRequestEvent) or `TaskState.input_required` (A2A; ref:autogen/a2a/utils.py::response_message_from_a2a_task, ref:autogen/a2a/client.py::_is_task_completed):

1. Emit `diagnostic` with category `input_required` containing `details.prompt_text`.
2. Emit `details.context_id` as follows:
   - A2A: `context_id` MUST be the upstream `task.context_id` (ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute).
   - Native events: `context_id` MUST be synthesized deterministically as `pm-hitl-{run_id}-{seq}`.
3. The run enters a **paused** state. No `done` event is emitted.
4. The `seq` counter is preserved and continues from the pause point when input is provided.
5. When input arrives (via `InputResponseEvent` (native; ref:autogen/events/agent_events.py::InputResponseEvent) or an A2A user message), emit `diagnostic` with category `input_provided` using the same `context_id`, then resume normal event emission.

Note: the upstream A2A polling client treats `TaskState.input_required` as a completion condition (ref:autogen/a2a/client.py::_is_task_completed). Puppet Master explicitly overrides that interpretation: input-required is a non-terminal pause, and the run remains resumable under the same `run_id` with `seq` continuing.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/human-in-the-loop.md, Gate:GATE-009

### 8.4 Auth-required mapping

If the upstream bridge requires authenticated metadata/card fetches (e.g. the A2A client attempts an authenticated extended card when `supports_authenticated_extended_card` is true; ref:autogen/a2a/client.py::_get_agent_card) and the adapter detects an authentication barrier (e.g. explicit auth-required response/state from the transport), the adapter MUST emit `auth_state` with `payload.state` set to the appropriate value from the auth state machine defined in `Plans/CLI_Bridged_Providers.md`.

Auth recovery policy (prompts, device flows, key refresh) is owned by the Puppet Master auth subsystem; the adapter MUST NOT attempt re-authentication autonomously.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, Gate:GATE-009

### 8.5 Artifact handling

- Binary content MUST NOT appear in the V0 normalized stream. Binary artifacts MUST be persisted to the artifact store and referenced by `artifact_id` in diagnostic details (SSOT: `Plans/Project_Output_Artifacts.md`).
- Each artifact update MUST emit `diagnostic` (category `artifact_update`) carrying: `details.artifact_id`, `details.artifact_name`, `details.append`, `details.last_chunk`, and `details.part_kind`.
  - `part_kind` SHOULD be derived from observed part roots (`TextPart` vs `DataPart`) when a text projection is produced (ref:autogen/a2a/utils.py::update_artifact_to_streaming). Otherwise use `"mixed"`.
- File-type parts emit `diagnostic` (category `artifact_file_part`) with `details.file_path` and `details.persisted` = `true` after successful persistence.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-009

### 8.6 Raw observation retention

The adapter MUST maintain a bounded ring buffer (capacity: 500 entries) of raw upstream events for post-mortem debugging. Each retained event is surfaced as a `diagnostic` (category `raw_observation`) with `details.event_type_name` set to the upstream wrapped type name (ref:autogen/events/base_event.py::wrap_event) and `details.truncated` set to `true` if the original payload exceeded 4 KiB and was truncated.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/newfeatures.md, Gate:GATE-009

### 8.7 Tool correlation reconciliation (INV-001)

The adapter MUST enforce the tool correlation invariant (SSOT: `Plans/Architecture_Invariants.md#INV-001`) on the V0 stream:

Tool correlation IDs are INV-governed: every `tool_use` gets exactly one matching `tool_result` or synthetic result, and orphaned IDs are impossible in the normalized stream except as raw-observation diagnostics paired with synthesized placeholders under the `Plans/Contracts_V0.md` and `Plans/CLI_Bridged_Providers.md` reconciler rules.

- A `tool_result` MUST NOT be emitted without a corresponding `tool_use`.
- If a tool result arrives without a prior correlated `tool_use`, the adapter MUST synthesize a placeholder `tool_use` with:
  - `tool_use_id` set to the upstream correlation ID when available (e.g. `tool_call_id`), otherwise the synthesized format from §8.1.
  - `tool_name` = `"<unknown>"` and `arguments` = `null`.
  - A `diagnostic` `raw_observation` describing the orphaned tool result.
  - Then emit the `tool_result`.
- If a `tool_use` is emitted and no tool result arrives before terminal completion, the adapter MUST emit exactly one synthetic `tool_result` with `ok=false` and `error="missing_tool_result"` prior to the final `done`.
- If multiple tool results arrive for the same `tool_use_id`, the adapter MUST emit exactly one `tool_result` and preserve the additional results as `raw_observation` diagnostics.

ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009

### 8.8 Terminal event arbitration (exactly one `done`)


If the upstream emits multiple terminal indicators (e.g. `TerminationEvent` and/or `RunCompletionEvent`), the adapter MUST emit exactly one terminal `done` event and it MUST be final.

- Prefer `RunCompletionEvent` semantics when available; otherwise use `TerminationEvent`.
- Any additional terminal indicators MUST be preserved as `raw_observation` diagnostics and MUST NOT cause additional `done` events.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## 9. Overseer subjective audit protocol instrumentation (normative)

The Overseer performs subjective audits at tier boundaries (start-of-tier and end-of-tier). These audits MUST be fully observable from the V0 diagnostic stream using the reserved categories defined in §5.1.

### 9.1 Audit flow

1. Overseer begins audit → emit `diagnostic` (category `overseer_audit_started`) with `details.tier` and `details.audit_kind` (`"start_of_tier"` or `"end_of_tier"`).
2. Overseer spawns exactly 2 reviewer subagents (R1, R2) → emit `diagnostic` (category `overseer_reviewer_spawned`) once per reviewer with `details.reviewer_id`.
3. Each reviewer returns a verdict → emit `diagnostic` (category `overseer_reviewer_verdict`) with `details.reviewer_id` and `details.verdict` (`"accept"` or `"remediate"`).
4. Consensus computation → emit `diagnostic` (category `overseer_audit_consensus`) with `details.consensus_result`.
5. Final verdict → emit `diagnostic` (category `overseer_audit_verdict`) with `details.final_verdict`, `details.verifier_passed`, and `details.forced_remediation`.

### 9.2 Consensus rule (deterministic)

The consensus rule is exactly:

- Both reviewers accept → `consensus_result` = `"accept"`.
- Both reviewers remediate → `consensus_result` = `"remediate"`.
- Reviewers disagree → `consensus_result` = `"escalate"`.

### 9.3 Verdict override

The final audit verdict MAY force remediation even if the deterministic verifier passed. When `details.forced_remediation` = `true`, the Overseer has overridden the verifier result based on subjective audit findings. This is a legitimate outcome and MUST be auditable.

### 9.4 Auditability

All audit actions MUST be reconstructable from the V0 diagnostic stream alone. A consumer reading only `diagnostic` events with the `overseer_*` categories MUST be able to reconstruct: which tier was audited, how many reviewers were spawned, each reviewer's verdict, the consensus result, and the final verdict including any forced remediation.

DRY: Overseer responsibilities are defined in `Plans/Glossary.md` §2. Reviewer/Builder/Verifier role boundaries are defined in `Plans/Executor_Protocol.md`.

ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009

---

## 10. Portable patterns (A–E)

These patterns are portable adapter-design techniques derived from the upstream event/bridge model and encoded here as V0-safe guidance (no schema changes).

### Pattern A — Discriminator-driven event dispatch

Upstream events are wrapped with a `type` discriminator and `content` payload (ref:autogen/events/base_event.py::wrap_event). Adapters should treat `type` as the only stable dispatch key and preserve the original `type` name in `diagnostic.details.event_type_name` when emitting `raw_observation`.

### Pattern B — “Lossless-where-possible” via diagnostics and artifacts

When upstream emits richer payloads than V0 can represent as first-class events, adapters preserve the excess data in `diagnostic.details` (bounded; see §8.6) and/or persist it as artifacts (SSOT: `Plans/Project_Output_Artifacts.md`) instead of dropping it.

### Pattern C — Two-phase tool lifecycle with reconciliation

Emit `tool_use` on call intent and exactly one `tool_result` on completion, enforcing INV-001 correlation even when upstream omits IDs or emits legacy tool events (see §8.1 and §8.7; ref:autogen/events/agent_events.py::ToolCallEvent, ref:autogen/events/agent_events.py::ToolResponseEvent, ref:autogen/events/agent_events.py::FunctionCallEvent, ref:autogen/events/agent_events.py::FunctionResponseEvent).

### Pattern D — Input-required is a pause (not a terminal)

Upstream A2A polling treats `TaskState.input_required` as a completion condition (ref:autogen/a2a/client.py::_is_task_completed), but Puppet Master normalizes it as a resumable pause using `diagnostic` categories `input_required` / `input_provided`, with `seq` continuing and no terminal `done` (see §8.3).

### Pattern E — Artifact streaming as text projection + chunk metadata

Where upstream emits incremental streaming text via artifact updates, adapters project text to `text_delta` while preserving artifact identity, chunk flags, and part kind in `diagnostic.details` (see §8.5; ref:autogen/a2a/utils.py::update_artifact_to_streaming).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-009

## Retry/Remediation Event Continuity Addendum (2026-03-08)

Provider/A2A event normalization must preserve enough continuity for the shared runtime scheduler packet.

Required behavior:
- resumed or retried runs must preserve attempt identity where the upstream provider/protocol exposes it
- normalized diagnostics should preserve distinctions relevant to `failure_class`, especially `input_provided`, forced remediation, malformed artifact streaming, and interruption/resume signals
- when a provider-side audit forces remediation, the normalized stream must preserve that fact so runtime lineage can record `origin_failure_event_id` and remediation generation coherently
- pause/resume semantics for input-required flows must remain compatible with scheduler wake reasons and blocked-to-runnable wakeups

Acceptance criteria:
- A2A/provider normalization does not erase retry/remediation lineage
- input-provided / resume events remain sufficient to wake blocked runtime flows deterministically
## Stream Wake and Attempt Continuity Consolidation Addendum (2026-03-09)

Provider/A2A stream normalization MUST preserve canonical wake reasons and attempt continuity.

### Required mappings
- completion -> `wake_reason = node_completed` or `verification_completed` as applicable
- approval/input resolution -> `wake_reason = approval_resolved` or `clarification_resolved`
- auth recovery -> `wake_reason = auth_recovered`
- startup recovery -> `wake_reason = startup_recovered`
- watchdog defensive recheck -> `wake_reason = watchdog_recheck` only as a non-primary defensive wake; correctness still comes from event-driven prerequisite, auth, startup, and remediation wakes.
- backoff expiry -> `wake_reason = backoff_expired`
- remediation completion -> `wake_reason = remediation_completed`
- replan application -> `wake_reason = replan_applied`

### Continuity rule
Normalized streams MUST preserve `attempt_id` across reconnect/observe-only flows and MUST NOT create provider-local retry identity separate from runtime identity.

## Runtime Attempt Identity vs Provider Continuity (2026-03-09)

Runtime `attempt_id` is Puppet Master's per-dispatch identity.

Rules:
- retries, prerequisite resumes, remediation reruns, and restore-before-reruns always create a new runtime `attempt_id`
- upstream provider/session continuity uses a separate `provider_attempt_ref?`
- provider/session IDs MUST NOT be reused as runtime `attempt_id`
- reconnect flows may observe or resume streaming for the same runtime attempt but MUST NOT create hidden provider-local retry identity
## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- In `## Canonical data-shape reconciliation` -> `### Required data shape`, store upstream OpenCode/A2A session identifiers in provider-native correlation fields rather than canonical `thread_id`.
- Keep runtime/provider continuity split by requiring bridge-only correlation fields plus `provider_attempt_ref?` without replacing PM runtime identity.
- Define and reuse `approval_scope_key` across permissions, HITL, doom-loop protection, and session approval caching for this bridge surface.

#### P5 provider-stream continuity recovery requirements

- The doc internally contradicts itself on attempt continuity: - 2026-03-09 addenda say normalized streams MUST preserve `attempt_id` - but none of the reserved diagnostic category schemas actually expose `attempt_id` - adapters currently have no canonical way to satisfy both requirements at once
- `tier_boundary` is not just stale prose here; it is a reserved diagnostic category with hard detail keys (`from_tier` / `to_tier`). That means the tier model is still embedded at the stream-schema layer and cannot be reconciled by a simple terminology sweep.
- Provider continuity fields like `provider_attempt_ref?` are named but still not owned by a stable schema slot.
- The provider boundary still lacks a legal place for rewrite-era correlation and pressure semantics: - bridged envelopes remain thinner than their own addenda - A2A still forbids new categories while the rewrite needs actor/role/account/switch/trust signals at the stream layer - `provider_attempt_ref?` and similar continuity fields are still conceptually present but not fully owned by a stable schema slot
- The A2A addenda require `attempt_id` continuity, but the schema anchor never permits it explicitly.
- Treat interview-phase `tier_id`-style coordination keys as legacy/local labels only; do not let them become canonical ownership or routing keys.
- Add explicit versioning/migration notes where A2A or bridged categories/fields must grow.
- Model-wave synthesis from Claude Opus 4.6 fleet sweep across Plans/**. Focuses on Orchestrator-model impact from the transition away from Phase/Task/Subtask/Iteration tier hierarchy toward a node-graph / work-package / feature-seam execution model.
- OpenCode and other bridged runtimes may switch or obscure upstream accounts behind the bridge; the docs currently do not say whether this is capturable, opaque-but-accepted, or a hard gap.
- Keep page-tab and panel-subview resolution as destination-layer concepts, not core identity concepts.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PSMERA-002 - Document Authority And Compliance Anchor

```yaml
plan_unit_id: PSMERA-002
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  This document remains the canonical live owner-section external reference for provider/A2A stream mapping
  and preserves product, runtime, storage, UI, and governance authority while following DRY_Rules,
  Contracts_V0, Puppet Master naming, and Decision_Policy deterministic defaults.
gui_related: true
gui_classification_reason: "This unit preserves owner-section metadata that names product/runtime/storage/UI/governance authority."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
unblocks: []
acceptance_criteria:
  - "Document Authority And Compliance Anchor remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: plan_doc_authority_anchor
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0001"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0002"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0003"
preserved_exact_tokens:
  - "Provider Stream Mapping — External Reference (A2A Bridge)"
  - "Canonical owner-section requirements"
  - "product, runtime, storage, UI, and governance details"
  - "Provider-native correlation and approval scope"
  - "Compliance"
  - "Plans/DRY_Rules.md"
  - "Plans/Contracts_V0.md"
  - "Puppet Master"
  - "No open questions"
  - "Plans/Decision_Policy.md"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md, PolicyRule:Decision_Policy.md"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/DRY_Rules.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Decision_Policy.md"
split_recommendation_reason: "The authority span names mixed product/runtime/storage/UI/governance surfaces but remains a structural owner-section anchor, not implementation coverage by itself."
```

### PSMERA-003 - External-Only A2A Interop Boundary

```yaml
plan_unit_id: PSMERA-003
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  A2A mappings are future-interop-only external bridge guidance: they inform adapter implementors but are
  rejected for PM-internal orchestration and must not redefine child-run supervision, crew coordination,
  timeout propagation, requested/effective runtime state, retry, resume, lineage, budgets, permissions, tools,
  billing, FileSafe, storage, prompt/cache, MCP lifecycle, or orchestrator ownership.
gui_related: false
gui_classification_reason: "This unit constrains external bridge ownership rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "CBP-004"
unblocks: []
acceptance_criteria:
  - "External-Only A2A Interop Boundary remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: external_a2a_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0004"
preserved_exact_tokens:
  - "V0 normalized stream events"
  - "Plans/CLI_Bridged_Providers.md"
  - "canonical external-reference guide"
  - "not the SSOT for Puppet Master internal orchestration"
  - "/future-interop-only"
  - "A2A is REJECTED for internal PM orchestration"
  - "run budgets"
  - "permissions"
  - "tool dispatch"
  - "provider adapters"
  - "billing"
  - "file safety"
  - "storage integrity"
  - "prompt/cache behavior"
  - "MCP lifecycle"
  - "orchestrator ownership"
  - "/resume"
  - "circuit-breaker contract"
negative_constraints:
  - "A2A is rejected for internal PM orchestration."
  - "The external-only bridge may map provider reconnect /resume evidence to the circuit-breaker contract, but it must not redefine PM-internal retry, resume, or child-run semantics."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Contracts_V0.md"
  - "Plans/orchestrator-subagent-integration.md"
  - "Plans/storage-plan.md"
```

### PSMERA-004 - Backend Non-Goal Owner Boundaries

```yaml
plan_unit_id: PSMERA-004
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  This external-reference document does not own the V0 event envelope, persistent storage semantics, tool
  schemas, permissions, policy, transport mechanics beyond external bridge mapping, or PM-internal
  orchestration, child-run control messages, crew scheduling, or runtime ceilings.
gui_related: false
gui_classification_reason: "This unit preserves backend and runtime owner boundaries rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "CBP-004"
unblocks: []
acceptance_criteria:
  - "Backend Non-Goal Owner Boundaries remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: non_goal_owner_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0005"
preserved_exact_tokens:
  - "Redefining the V0 event envelope"
  - "SSOT: `Plans/CLI_Bridged_Providers.md`"
  - "Defining persistent storage semantics"
  - "SSOT: `Plans/storage-plan.md`"
  - "Defining tool schemas, permissions, or policy"
  - "Plans/Tools.md"
  - "Plans/FileSafe.md"
  - "Specifying transport mechanics"
  - "external bridge mapping surface"
  - "PM-internal orchestration"
  - "child-run control messages"
  - "crew scheduling"
  - "runtime ceilings"
negative_constraints:
  - "This document must not redefine V0 event envelopes, persistent storage semantics, tool schemas, permissions, policy, or PM-internal orchestration."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/orchestrator-subagent-integration.md"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/storage-plan.md"
  - "Plans/Tools.md"
  - "Plans/FileSafe.md"
  - "Plans/orchestrator-subagent-integration.md"
```

### PSMERA-005 - UI And Widget Non-Goal Boundary

```yaml
plan_unit_id: PSMERA-005
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  This document must not define UI/UX behavior or widget rendering; GUI, widget, and user-visible rendering
  consumers remain owned by the UI owner documents and only consume provider stream mapping outputs.
gui_related: true
gui_classification_reason: "This unit explicitly routes UI/UX and widget behavior to GUI owner documents."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "AI-007"
  - "AI-008"
unblocks: []
acceptance_criteria:
  - "UI And Widget Non-Goal Boundary remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: gui_consumer_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0005"
preserved_exact_tokens:
  - "Defining UI/UX behavior or widget rendering"
  - "UI/UX"
  - "widget rendering"
  - "consumer"
  - "provider stream mapping"
negative_constraints:
  - "Provider Stream Mapping must not define UI/UX behavior or widget rendering."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Widget_System.md, ContractName:Plans/UI_Command_Catalog.md"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Widget_System.md"
  - "Plans/UI_Command_Catalog.md"
```

### PSMERA-006 - DRY Reference Routing Table

```yaml
plan_unit_id: PSMERA-006
unit_type: reference
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  The DRY reference table preserves SSOT routing for the V0 event envelope, INV-001 tool correlation,
  canonical terms, user-project output artifacts, Decision Policy, HITL semantics, and Overseer
  responsibilities.
gui_related: false
gui_classification_reason: "This unit preserves reference routing and SSOT boundaries rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "CBP-004"
  - "AI-003"
unblocks: []
acceptance_criteria:
  - "DRY Reference Routing Table remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: reference_routing
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0006"
preserved_exact_tokens:
  - "References (DRY)"
  - "V0 event envelope + event types table"
  - "Architecture invariant INV-001"
  - "Canonical terms"
  - "User-project output artifacts"
  - "Decision policy"
  - "HITL semantics"
  - "Overseer responsibilities"
  - "Plans/Glossary.md"
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/human-in-the-loop.md"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/DRY_Rules.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Architecture_Invariants.md"
  - "Plans/Glossary.md"
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/Decision_Policy.md"
  - "Plans/human-in-the-loop.md"
```

### PSMERA-007 - V0 Event Type Whitelist

```yaml
plan_unit_id: PSMERA-007
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  External bridge mappings may emit only the existing V0 event types text_delta, thinking_delta, tool_use,
  tool_result, usage, auth_state, diagnostic, error, and done; this document introduces no new event types and
  defers authoritative payload fields to CLI_Bridged_Providers.
gui_related: false
gui_classification_reason: "This unit defines provider stream event types rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "CBP-007"
unblocks: []
acceptance_criteria:
  - "V0 Event Type Whitelist remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: provider_stream_event_whitelist
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0007"
preserved_exact_tokens:
  - "V0-safe primitives used"
  - "No new event types are introduced"
  - "text_delta"
  - "thinking_delta"
  - "tool_use"
  - "tool_result"
  - "usage"
  - "auth_state"
  - "diagnostic"
  - "error"
  - "done"
  - "emit only these types"
  - "authoritative payload-field definitions live in `Plans/CLI_Bridged_Providers.md`"
negative_constraints:
  - "This document introduces no new V0 event types."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-008 - Diagnostic Categories And Namespacing

```yaml
plan_unit_id: PSMERA-008
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Provider-specific diagnostics must use type diagnostic with only reserved category values, required details
  keys, and provider/source context under diagnostic.details.source; adapters must not invent new categories,
  and tier_boundary remains preserved as compatibility-sensitive stream-schema evidence.
gui_related: false
gui_classification_reason: "This unit defines diagnostic category and details semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-007"
  - "CBP-007"
  - "AI-003"
unblocks: []
acceptance_criteria:
  - "Diagnostic Categories And Namespacing remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: diagnostic_category_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0008"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0009"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0010"
preserved_exact_tokens:
  - "type: \"diagnostic\""
  - "category"
  - "diagnostic.details.source"
  - "external_ref_native"
  - "a2a"
  - "run_started"
  - "run_finished"
  - "step_started"
  - "step_finished"
  - "tier_boundary"
  - "handoff"
  - "input_required"
  - "input_provided"
  - "artifact_update"
  - "artifact_data_part"
  - "artifact_file_part"
  - "raw_observation"
  - "overseer_audit_started"
  - "overseer_reviewer_spawned"
  - "overseer_reviewer_verdict"
  - "overseer_audit_consensus"
  - "overseer_audit_verdict"
  - "Adapters MUST NOT invent new categories"
negative_constraints:
  - "Provider/source-specific diagnostics must be namespaced via diagnostic.details.source."
  - "Adapters must not invent new diagnostic categories."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, Gate:GATE-009"
  - "ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, Gate:GATE-009"
compatibility_only_notes:
  - "`tier_boundary` remains compatibility-sensitive because it embeds Phase/Task/Subtask/Iteration details in a reserved diagnostic category."
stale_retired_dispositions:
  - "`tier_boundary` is compatibility/stale-sensitive until owner docs replace or version the stream category."
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Architecture_Invariants.md"
  - "Plans/Glossary.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/DRY_Rules.md"
```

### PSMERA-009 - Native Content Usage And Error Mappings

```yaml
plan_unit_id: PSMERA-009
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Native external-framework text, stream, usage, termination, run-completion, and error events map to V0
  text_delta, usage, diagnostic, error, and done outputs without schema expansion; terminal diagnostics derive
  outcome and done status from upstream completion evidence.
gui_related: false
gui_classification_reason: "This unit maps native provider content, usage, terminal, and error events rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-007"
  - "PSMERA-008"
unblocks: []
acceptance_criteria:
  - "Native Content Usage And Error Mappings remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: native_content_usage_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0011"
preserved_exact_tokens:
  - "BaseEvent"
  - "wrap_event"
  - "StreamEvent"
  - "TextEvent"
  - "UsageSummaryEvent"
  - "TerminationEvent"
  - "ErrorEvent"
  - "RunCompletionEvent"
  - "text_delta"
  - "usage"
  - "diagnostic"
  - "error"
  - "done"
  - "payload.text"
  - "prompt_tokens"
  - "completion_tokens"
  - "total_cost"
  - "termination_reason"
  - "upstream_error"
  - "done.status"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Contracts_V0.md"
  - "Plans/usage-feature.md"
```

### PSMERA-010 - Native Tool Lifecycle Mappings

```yaml
plan_unit_id: PSMERA-010
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Native ToolCallEvent, ToolResponseEvent, FunctionCallEvent, and FunctionResponseEvent map to correlated
  tool_use and tool_result lifecycles; legacy FunctionCallEvent duplicates are retained as raw_observation
  when ToolCallEvent already represents the logical call.
gui_related: false
gui_classification_reason: "This unit maps tool lifecycle events rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-007"
  - "PSMERA-008"
  - "CBP-008"
  - "CBP-009"
  - "AI-003"
unblocks: []
acceptance_criteria:
  - "Native Tool Lifecycle Mappings remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: native_tool_lifecycle_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0011"
preserved_exact_tokens:
  - "ToolCallEvent"
  - "ToolResponseEvent"
  - "FunctionCallEvent"
  - "FunctionResponseEvent"
  - "tool_use"
  - "tool_result"
  - "tool_calls"
  - "ToolCall.id"
  - "ToolCall.function.name"
  - "ToolCall.function.arguments"
  - "tool_call_id"
  - "<unknown>"
  - "raw_observation"
  - "avoid double-emitting tool lifecycles"
negative_constraints:
  - "Legacy FunctionCallEvent must not double-emit a tool lifecycle when ToolCallEvent is already observed for the same logical call."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Tools.md"
  - "Plans/FileSafe.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-011 - Native HITL Handoff And Raw Observation Mappings

```yaml
plan_unit_id: PSMERA-011
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Native InputRequestEvent and InputResponseEvent map to input_required and input_provided diagnostics,
  transition events map to handoff diagnostics, and selection/code/function execution observations remain
  raw_observation diagnostics rather than first-class V0 steps or tools.
gui_related: false
gui_classification_reason: "This unit maps lifecycle diagnostics rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
unblocks: []
acceptance_criteria:
  - "Native HITL Handoff And Raw Observation Mappings remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: native_lifecycle_hitl_handoff_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0011"
preserved_exact_tokens:
  - "InputRequestEvent"
  - "InputResponseEvent"
  - "AfterWorksTransitionEvent"
  - "OnContextConditionTransitionEvent"
  - "OnConditionLLMTransitionEvent"
  - "ReplyResultTransitionEvent"
  - "SelectSpeakerEvent"
  - "ExecuteCodeBlockEvent"
  - "ExecuteFunctionEvent"
  - "input_required"
  - "input_provided"
  - "handoff"
  - "after_work"
  - "on_context_condition"
  - "on_condition"
  - "reply_result"
  - "raw_observation"
  - "not treated as a first-class step boundary"
  - "not mapped to `tool_use`"
negative_constraints:
  - "SelectSpeakerEvent is not treated as a first-class step boundary in V0."
  - "ExecuteCodeBlockEvent is not mapped to tool_use; code execution goes through Puppet Master tool policy."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/human-in-the-loop.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Tools.md"
```

### PSMERA-012 - A2A Discovery Task Identity And Cache Boundary

```yaml
plan_unit_id: PSMERA-012
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  A2A AgentCard, Task, Message, Part, and Artifact concepts remain external bridge evidence: AgentCard cannot
  replace PM registries or capability contracts, terminal A2A Tasks are immutable, A2A transports remain
  provider transport variants, and cross-task prompt cache reuse requires explicit provider evidence within a
  PM-owned session or adapter-continuity boundary.
gui_related: false
gui_classification_reason: "This unit defines external A2A identity and cache boundaries rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-003"
  - "CBP-013"
  - "PP-017"
unblocks: []
acceptance_criteria:
  - "A2A Discovery Task Identity And Cache Boundary remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: a2a_identity_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0012"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0013"
preserved_exact_tokens:
  - "Mapping table 2"
  - "A2A discovery and task identity boundary"
  - "AgentCard"
  - "well-known URL"
  - "provider-native capability evidence"
  - "PM registry"
  - "permission ceiling"
  - "runtime snapshot"
  - "provider capability contract"
  - "contextId"
  - "context_id"
  - "terminal"
  - "immutable"
  - "PM-owned resume, retry, or attempt lineage"
  - "JSON-RPC 2.0"
  - "HTTP(S)"
  - "gRPC"
  - "HTTP+JSON/REST"
  - "Task"
  - "Message"
  - "Part"
  - "Artifact"
  - "STABLE PREFIXES"
  - "Cross-task cache reuse"
negative_constraints:
  - "AgentCard metadata must never replace the PM registry, permission ceiling, runtime snapshot, or provider capability contract."
  - "Cross-task cache reuse must be explicit provider evidence, not assumed from A2A task continuity."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
```

### PSMERA-013 - A2A Protocol Event Mappings

```yaml
plan_unit_id: PSMERA-013
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  A2A TaskState, Message, Part/TextPart/DataPart, Artifact, TaskArtifactUpdateEvent, TaskStatus,
  ServiceResponse, and A2aRemoteAgent concepts map to V0 diagnostics, text_delta, and artifact handling while
  preserving A2A as external bridge evidence rather than a PM runtime mode.
gui_related: false
gui_classification_reason: "This unit maps A2A protocol states and payloads rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-007"
  - "PSMERA-008"
  - "PSMERA-012"
unblocks: []
acceptance_criteria:
  - "A2A Protocol Event Mappings remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: a2a_protocol_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0013"
preserved_exact_tokens:
  - "TaskState.submitted"
  - "TaskState.working"
  - "TaskState.input_required"
  - "TaskState.completed"
  - "updater.complete()"
  - "Message"
  - "TextPart"
  - "DataPart"
  - "Artifact"
  - "TaskArtifactUpdateEvent"
  - "TaskStatus"
  - "ServiceResponse"
  - "A2aRemoteAgent"
  - "diagnostic"
  - "run_started"
  - "step_started"
  - "input_required"
  - "run_finished"
  - "done"
  - "text_delta"
  - "artifact_update"
  - "artifact_data_part"
  - "streaming_text"
  - "remote protocol"
negative_constraints:
  - "A2A protocol mappings must not make A2A a PM-native orchestration or runtime mode."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Project_Output_Artifacts.md"
```

### PSMERA-014 - Tool ID Synthesis And INV-001 Reconciliation

```yaml
plan_unit_id: PSMERA-014
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  When upstream tool IDs are missing, adapters synthesize stable tool_use_id values as
  pm-synth-{run_id}-{seq}, enforce INV-001 by ensuring every tool_use has exactly one tool_result or synthetic
  result, synthesize placeholder tool_use records for orphaned results, and preserve duplicate or extra
  results as raw_observation diagnostics.
gui_related: false
gui_classification_reason: "This unit defines tool correlation mechanics rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-010"
  - "AI-003"
  - "CBP-015"
unblocks: []
acceptance_criteria:
  - "Tool ID Synthesis And INV-001 Reconciliation remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: tool_correlation_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0015"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0021"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0031"
preserved_exact_tokens:
  - "tool_call_id"
  - "ToolCall.id"
  - "pm-synth-{run_id}-{seq}"
  - "INV-001"
  - "tool_use"
  - "tool_result"
  - "orphaned IDs are impossible"
  - "tool_name = `\"<unknown>\"`"
  - "arguments = `null`"
  - "missing_tool_result"
  - "exactly one `tool_result`"
  - "raw_observation"
  - "Pattern C"
  - "Two-phase tool lifecycle with reconciliation"
negative_constraints:
  - "A tool_result must not be emitted without a corresponding tool_use."
  - "Every tool_use gets exactly one matching tool_result or synthetic result."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Architecture_Invariants.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Tools.md"
```

### PSMERA-015 - Deduplication And Raw Observation Retention

```yaml
plan_unit_id: PSMERA-015
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Adapters maintain a 10,000-entry LRU seen-set keyed by upstream uuid and a 500-entry raw-event ring buffer;
  duplicate events are dropped or diagnostically bounded, original upstream type discriminators are retained,
  and richer payloads are preserved through diagnostic.details or persisted artifacts instead of being
  dropped.
gui_related: false
gui_classification_reason: "This unit defines bounded diagnostics and raw observation retention rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "CBP-009"
  - "POA-039"
unblocks: []
acceptance_criteria:
  - "Deduplication And Raw Observation Retention remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: raw_observation_dedup_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0016"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0020"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0029"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0030"
preserved_exact_tokens:
  - "uuid"
  - "bounded seen-set"
  - "capacity: 10 000 entries"
  - "LRU eviction"
  - "duplicate `uuid`"
  - "silently dropped"
  - "raw_observation"
  - "bounded ring buffer"
  - "capacity: 500 entries"
  - "event_type_name"
  - "wrap_event"
  - "truncated"
  - "4 KiB"
  - "type discriminator"
  - "content payload"
  - "Pattern A"
  - "Pattern B"
  - "Lossless-where-possible"
  - "diagnostic.details"
  - "persist it as artifacts"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/newfeatures.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/newfeatures.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-016 - HITL Pause Resume Context Semantics

```yaml
plan_unit_id: PSMERA-016
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  InputRequestEvent and TaskState.input_required produce an input_required diagnostic, context_id is preserved
  or deterministically synthesized, the run enters a paused state without done, seq continues from the pause
  point, and input_provided resumes normal event emission even when upstream A2A polling treats input_required
  as completion.
gui_related: false
gui_classification_reason: "This unit defines HITL pause/resume stream semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "PSMERA-011"
  - "OSI-411"
  - "OSI-420"
unblocks: []
acceptance_criteria:
  - "HITL Pause Resume Context Semantics remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: hitl_pause_resume_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0017"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0032"
preserved_exact_tokens:
  - "InputRequestEvent"
  - "TaskState.input_required"
  - "input_required"
  - "details.prompt_text"
  - "details.context_id"
  - "task.context_id"
  - "pm-hitl-{run_id}-{seq}"
  - "paused"
  - "No `done` event is emitted"
  - "seq counter"
  - "InputResponseEvent"
  - "input_provided"
  - "same `context_id`"
  - "_is_task_completed"
  - "non-terminal pause"
  - "resumable"
  - "Pattern D"
negative_constraints:
  - "Input-required is a non-terminal pause; no done event is emitted solely because upstream A2A polling treats input_required as complete."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/human-in-the-loop.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/human-in-the-loop.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-017 - Auth Barrier Mapping

```yaml
plan_unit_id: PSMERA-017
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  When authenticated A2A card fetches or bridge transport detect an authentication barrier, the adapter emits
  auth_state using the CLI_Bridged_Providers auth state machine and must not attempt autonomous
  re-authentication because auth recovery policy is owned by the PM auth subsystem.
gui_related: false
gui_classification_reason: "This unit maps auth barriers into auth state rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "CBP-014"
unblocks: []
acceptance_criteria:
  - "Auth Barrier Mapping remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: auth_state_mapping_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0018"
preserved_exact_tokens:
  - "supports_authenticated_extended_card"
  - "_get_agent_card"
  - "authentication barrier"
  - "auth-required response/state"
  - "auth_state"
  - "payload.state"
  - "auth state machine"
  - "Auth recovery policy"
  - "prompts, device flows, key refresh"
  - "adapter MUST NOT attempt re-authentication autonomously"
negative_constraints:
  - "The adapter must not attempt re-authentication autonomously."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Multi-Account.md"
```

### PSMERA-018 - Artifact Persistence And Streaming Projection

```yaml
plan_unit_id: PSMERA-018
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Binary and non-text A2A artifacts must never inline into normalized text; adapters persist artifacts, emit
  artifact_update, artifact_data_part, or artifact_file_part diagnostics with artifact metadata, and project
  text_delta only where text projection is safe while retaining full data or chunk metadata.
gui_related: false
gui_classification_reason: "This unit governs artifact persistence and stream projection rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-013"
  - "PSMERA-015"
  - "POA-001"
unblocks: []
acceptance_criteria:
  - "Artifact Persistence And Streaming Projection remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: artifact_stream_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0019"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0030"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0033"
preserved_exact_tokens:
  - "Binary content MUST NOT appear"
  - "V0 normalized stream"
  - "artifact store"
  - "artifact_id"
  - "artifact_update"
  - "artifact_name"
  - "append"
  - "last_chunk"
  - "part_kind"
  - "TextPart"
  - "DataPart"
  - "mixed"
  - "artifact_file_part"
  - "file_path"
  - "persisted = `true`"
  - "text projection"
  - "text_delta"
  - "chunk metadata"
  - "Pattern E"
  - "update_artifact_to_streaming"
negative_constraints:
  - "Binary content must not appear in the V0 normalized stream."
  - "Non-text/binary data must not be inlined into text_delta."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/storage-plan.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-019 - Terminal Done Arbitration

```yaml
plan_unit_id: PSMERA-019
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  When upstream emits multiple terminal indicators such as TerminationEvent or RunCompletionEvent, the adapter
  emits exactly one final done event, prefers RunCompletionEvent semantics when available, and preserves extra
  terminal indicators as raw_observation diagnostics without causing additional done events.
gui_related: false
gui_classification_reason: "This unit defines terminal event arbitration rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "AI-003"
unblocks: []
acceptance_criteria:
  - "Terminal Done Arbitration remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: terminal_done_arbitration
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0022"
preserved_exact_tokens:
  - "Terminal event arbitration"
  - "exactly one `done`"
  - "done event"
  - "final"
  - "TerminationEvent"
  - "RunCompletionEvent"
  - "Prefer `RunCompletionEvent` semantics"
  - "additional terminal indicators"
  - "raw_observation"
  - "MUST NOT cause additional `done` events"
negative_constraints:
  - "Additional terminal indicators must not cause additional done events."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Architecture_Invariants.md"
```

### PSMERA-020 - Overseer Audit Diagnostic Protocol

```yaml
plan_unit_id: PSMERA-020
unit_type: audit_requirement
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Overseer subjective audits at tier boundaries must be reconstructable from V0 diagnostic categories for
  audit start, reviewer spawn, reviewer verdict, consensus, and final verdict, including forced remediation
  when subjective audit findings override a deterministic verifier pass.
gui_related: false
gui_classification_reason: "This unit defines audit diagnostics rather than visual presentation."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "AI-039"
unblocks: []
acceptance_criteria:
  - "Overseer Audit Diagnostic Protocol remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: overseer_audit_diagnostics
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0023"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0024"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0025"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0026"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0027"
preserved_exact_tokens:
  - "Overseer subjective audit protocol instrumentation"
  - "tier boundaries"
  - "start-of-tier"
  - "end-of-tier"
  - "overseer_audit_started"
  - "overseer_reviewer_spawned"
  - "overseer_reviewer_verdict"
  - "overseer_audit_consensus"
  - "overseer_audit_verdict"
  - "exactly 2 reviewer subagents"
  - "R1, R2"
  - "accept"
  - "remediate"
  - "escalate"
  - "verifier_passed"
  - "forced_remediation"
  - "legitimate outcome"
  - "auditable"
  - "diagnostic stream alone"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/CLI_Bridged_Providers.md, Gate:GATE-009"
compatibility_only_notes:
  - "Tier-boundary wording is preserved as compatibility-sensitive diagnostic-schema evidence."
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Glossary.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PSMERA-021 - Retry And Remediation Lineage Continuity

```yaml
plan_unit_id: PSMERA-021
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Provider/A2A normalization must preserve continuity for the shared runtime scheduler packet, including
  attempt identity evidence where exposed, failure_class distinctions, input_provided, forced remediation,
  malformed artifact streaming, interruption/resume signals, origin_failure_event_id, remediation generation,
  scheduler wake reasons, and blocked-to-runnable wakeups.
gui_related: false
gui_classification_reason: "This unit defines retry/remediation lineage preservation rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-016"
  - "OSI-414"
  - "OSI-418"
  - "OSI-419"
unblocks: []
acceptance_criteria:
  - "Retry And Remediation Lineage Continuity remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: retry_remediation_lineage
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0034"
preserved_exact_tokens:
  - "Retry/Remediation Event Continuity Addendum"
  - "shared runtime scheduler packet"
  - "attempt identity"
  - "failure_class"
  - "input_provided"
  - "forced remediation"
  - "malformed artifact streaming"
  - "interruption/resume signals"
  - "origin_failure_event_id"
  - "remediation generation"
  - "scheduler wake reasons"
  - "blocked-to-runnable wakeups"
  - "A2A/provider normalization does not erase retry/remediation lineage"
  - "deterministically"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
```

### PSMERA-022 - Wake Reason Mapping And Continuity

```yaml
plan_unit_id: PSMERA-022
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Provider/A2A normalized streams must preserve canonical wake reasons and attempt continuity: completion,
  approval/input resolution, auth recovery, startup recovery, watchdog recheck, backoff expiry, remediation
  completion, and replan application map to canonical wake_reason values, while reconnect/observe-only flows
  preserve attempt_id and do not create hidden provider-local retry identity.
gui_related: false
gui_classification_reason: "This unit defines scheduler wake reason mapping rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-021"
  - "OSI-411"
  - "OSI-420"
  - "OSI-423"
unblocks: []
acceptance_criteria:
  - "Wake Reason Mapping And Continuity remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: wake_reason_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0035"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0036"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0037"
preserved_exact_tokens:
  - "Stream Wake and Attempt Continuity Consolidation Addendum"
  - "wake_reason = node_completed"
  - "verification_completed"
  - "approval_resolved"
  - "clarification_resolved"
  - "auth_recovered"
  - "startup_recovered"
  - "watchdog_recheck"
  - "backoff_expired"
  - "remediation_completed"
  - "replan_applied"
  - "Continuity rule"
  - "attempt_id"
  - "reconnect/observe-only flows"
  - "MUST NOT create provider-local retry identity"
negative_constraints:
  - "Reconnect/observe-only flows must not create provider-local retry identity separate from runtime identity."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
```

### PSMERA-023 - Runtime Attempt Identity Vs Provider Continuity

```yaml
plan_unit_id: PSMERA-023
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  Puppet Master runtime attempt_id is per dispatch; retries, prerequisite resumes, remediation reruns, and
  restore-before-reruns create new runtime attempt_id values, while upstream provider/session continuity
  belongs in provider_attempt_ref? and provider/session IDs must never replace runtime attempt_id.
gui_related: false
gui_classification_reason: "This unit separates runtime attempt identity from provider continuity identifiers rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-022"
  - "AI-030"
  - "OSI-418"
  - "OSI-419"
unblocks: []
acceptance_criteria:
  - "Runtime Attempt Identity Vs Provider Continuity remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: runtime_provider_attempt_identity_split
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0038"
preserved_exact_tokens:
  - "Runtime Attempt Identity vs Provider Continuity"
  - "attempt_id"
  - "per-dispatch identity"
  - "retries"
  - "prerequisite resumes"
  - "remediation reruns"
  - "restore-before-reruns"
  - "new runtime `attempt_id`"
  - "provider_attempt_ref?"
  - "provider/session IDs MUST NOT be reused as runtime `attempt_id`"
  - "same runtime attempt"
  - "hidden provider-local retry identity"
negative_constraints:
  - "Provider/session IDs must not be reused as runtime attempt_id."
  - "Reconnect flows must not create hidden provider-local retry identity."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
```

### PSMERA-024 - Provider-Native Correlation Fields And Approval Scope

```yaml
plan_unit_id: PSMERA-024
unit_type: data_contract
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  OpenCode and A2A session identifiers move to provider-native correlation fields rather than canonical
  thread_id; bridge-only correlation fields, provider_attempt_ref?, and approval_scope_key are preserved
  across permissions, HITL, doom-loop protection, and session approval caching.
gui_related: false
gui_classification_reason: "This unit defines correlation and approval-scope data shape rather than visual presentation."
split_recommended: false
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-003"
  - "PSMERA-023"
  - "CBP-013"
unblocks: []
acceptance_criteria:
  - "Provider-Native Correlation Fields And Approval Scope remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_mapping_drift
reasoning_tier: standard
context_scope: provider_stream_mapping
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: provider_correlation_approval_scope
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0039"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0040"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0041"
preserved_exact_tokens:
  - "Canonical data-shape reconciliation"
  - "Required data shape"
  - "Acceptance carry-through"
  - "OpenCode session IDs"
  - "provider-native correlation fields"
  - "canonical thread_id"
  - "approval_scope_key"
  - "actor/lane/run/account context"
  - "permissions"
  - "HITL"
  - "doom-loop"
  - "session approval caching"
  - "provider_attempt_ref?"
  - "bridge-only correlation fields"
  - "provider/native IDs"
negative_constraints:
  - "Upstream OpenCode/A2A session identifiers must not replace canonical thread_id."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Contracts_V0.md"
  - "Plans/human-in-the-loop.md"
  - "Plans/Permissions_System.md"
  - "Plans/Multi-Account.md"
```

### PSMERA-025 - Provider-Stream Continuity Schema Gaps And Stale Routing Dispositions

```yaml
plan_unit_id: PSMERA-025
unit_type: deferred_reconciliation
status: accepted
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  The P5 provider-stream continuity recovery bundle records unresolved but preserved schema gaps: attempt_id
  continuity is required but reserved diagnostic schemas do not expose attempt_id, tier_boundary embeds stale
  tier semantics, provider_attempt_ref? lacks a stable slot, actor/account/switch/trust metadata needs
  versioning, OpenCode account opacity remains unresolved, and page-tab/panel-subview remain destination-layer
  concepts rather than core identity concepts.
gui_related: true
gui_classification_reason: "This unit records schema gaps that affect UI destination-layer routing terms as well as backend stream schema ownership."
split_recommended: true
depends_on:
  - "PDS-003"
  - "PDS-004"
  - "PNC-001"
  - "BPM-004"
  - "PSMERA-008"
  - "PSMERA-023"
  - "PSMERA-024"
  - "AI-030"
  - "AI-039"
unblocks: []
acceptance_criteria:
  - "Provider-Stream Continuity Schema Gaps And Stale Routing Dispositions remains addressable as a fine-grained Provider Stream Mapping PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: provider_stream_schema_gap
reasoning_tier: standard
context_scope: provider_stream_deferred_reconciliation
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: blocked_schema_gap_disposition
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0042"
preserved_exact_tokens:
  - "P5 provider-stream continuity recovery requirements"
  - "attempt_id"
  - "reserved diagnostic category schemas"
  - "tier_boundary"
  - "from_tier"
  - "to_tier"
  - "provider_attempt_ref?"
  - "actor/role/account/switch/trust signals"
  - "versioning/migration notes"
  - "tier_id-style coordination keys"
  - "legacy/local labels"
  - "node-graph / work-package / feature-seam execution model"
  - "OpenCode"
  - "upstream accounts"
  - "capturable, opaque-but-accepted, or a hard gap"
  - "page-tab"
  - "panel-subview"
  - "destination-layer concepts"
  - "core identity concepts"
negative_constraints:
  - "Interview-phase tier_id-style coordination keys must remain legacy/local labels and must not become canonical ownership or routing keys."
  - "page-tab and panel-subview resolution must remain destination-layer concepts, not core identity concepts."
preserved_contractrefs: []
compatibility_only_notes:
  - "The reserved tier_boundary diagnostic category is compatibility-sensitive and cannot be reconciled by a terminology sweep."
  - "A future owner-doc/schema versioning pass is required for attempt_id, provider_attempt_ref?, actor/account/switch/trust metadata, and OpenCode account opacity."
stale_retired_dispositions:
  - "tier_boundary embeds stale Phase/Task/Subtask/Iteration tier semantics at the stream-schema layer."
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "Plans/orchestrator-subagent-integration.md"
  - "Plans/human-in-the-loop.md"
  - "Plans/Permissions_System.md"
  - "Plans/Multi-Account.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/UI_Command_Catalog.md"
split_recommendation_reason: "This span intentionally records multiple unresolved schema and routing gaps. It is atomized as a deferred reconciliation unit because owner placement is evidenced but final schema changes require a future owner-doc pass."
```

### PSMERA-001 - Provider Stream Mapping Retired Source-Preserving Bridge

```yaml
plan_unit_id: PSMERA-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Provider_Stream_Mapping_External_Reference_A2A.md
canonical_text: >-
  PSMERA-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 160.
  Provider_Stream_Mapping_External_Reference_A2A-S0001 through
  Provider_Stream_Mapping_External_Reference_A2A-S0042 are covered by PSMERA-002 through PSMERA-025 or
  explicit structural/reference/deferred dispositions, and
  Provider_Stream_Mapping_External_Reference_A2A-S0043 through
  Provider_Stream_Mapping_External_Reference_A2A-S0046 are generated structural/audit dispositions. PSMERA-001
  must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit
  compile mode.
gui_related: false
gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map."
split_recommended: false
depends_on:
  - "PSMERA-002"
  - "PSMERA-003"
  - "PSMERA-004"
  - "PSMERA-005"
  - "PSMERA-006"
  - "PSMERA-007"
  - "PSMERA-008"
  - "PSMERA-009"
  - "PSMERA-010"
  - "PSMERA-011"
  - "PSMERA-012"
  - "PSMERA-013"
  - "PSMERA-014"
  - "PSMERA-015"
  - "PSMERA-016"
  - "PSMERA-017"
  - "PSMERA-018"
  - "PSMERA-019"
  - "PSMERA-020"
  - "PSMERA-021"
  - "PSMERA-022"
  - "PSMERA-023"
  - "PSMERA-024"
  - "PSMERA-025"
unblocks: []
acceptance_criteria:
  - "Generated-tail structural and audit spans remain available for exact-text audit."
  - "Provider_Stream_Mapping_External_Reference_A2A-S0001 through Provider_Stream_Mapping_External_Reference_A2A-S0042 remain mapped to PSMERA-002 through PSMERA-025 or explicit structural/reference/deferred dispositions rather than PSMERA-001."
  - "Provider_Stream_Mapping_External_Reference_A2A-S0043 through Provider_Stream_Mapping_External_Reference_A2A-S0046 are structurally dispositioned as generated tail/audit material."
  - "PSMERA-001 no longer uses node_compile_hint.mode=source_preserving_planunit."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: provider_stream_mapping_retired_bridge
implementation_surfaces:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0043"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0044"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0045"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_Stream_Mapping_External_Reference_A2A-S0046"
preserved_exact_tokens:
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "PSMERA-001 - Provider Stream Mapping — External Reference (A2A Bridge) Source-Preserving PlanUnit"
  - "Provider Stream Mapping Residual Generated-Tail Bridge"
  - "Provider Stream Mapping Retired Source-Preserving Bridge"
  - "Migration Coverage"
  - "Provider_Stream_Mapping_External_Reference_A2A-S0043"
  - "Provider_Stream_Mapping_External_Reference_A2A-S0046"
negative_constraints:
  - "PSMERA-001 must not provide product implementation coverage for Provider_Stream_Mapping_External_Reference_A2A-S0001 through Provider_Stream_Mapping_External_Reference_A2A-S0042."
  - "PSMERA-001 must not override PSMERA-002 through PSMERA-025 or structural/reference/deferred dispositions."
  - "PSMERA-001 must not use source_preserving_planunit compile mode after Phase 2B batch 160."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, and stale/retired evidence remain preserved in span_map and coverage_map."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
```

## Migration Coverage

Original hash: `d824f9769c286194f15ee61389c27025673d29def80e04fdb99aab6ab73f6257`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Provider_Stream_Mapping_External_Reference_A2A-S0001` through `Provider_Stream_Mapping_External_Reference_A2A-S0042` are preserved in place and atomized into fine-grained PlanUnits `PSMERA-002` through `PSMERA-025` or explicit structural/reference/deferred dispositions. Generated tail spans `Provider_Stream_Mapping_External_Reference_A2A-S0043` through `Provider_Stream_Mapping_External_Reference_A2A-S0046` are structurally dispositioned, and `PSMERA-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode=retired_source_preserving_bridge`. No residual source-preserving product bridge remains for `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime provider-stream rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Keeps `sfk-bbe24dbaee588f11b4a55c4d` explicitly deferred: provider diagnostic category schemas need a versioned schema-owner slice before closure.
- Keeps `sfk-e98bc6a59c457b5cf85d8d99` explicitly deferred: raw P5 continuity/recovery audit prose must be converted into schema text in a provider-stream lane before closure.
- Repairs `sfk-f343634c482c449df4c8d04f`: `approval_scope_key` format is `approval:{project_id}:{policy_axis}:{target_hash}:{operation_class}`. `target_hash` is lowercase hex SHA-256 over the normalized target identity. Keys are recomputed when project, policy axis, target, or operation class changes.
