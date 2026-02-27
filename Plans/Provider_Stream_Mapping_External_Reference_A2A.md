# Provider Stream Mapping — External Reference (A2A Bridge)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## 1. Purpose

This document maps upstream external-framework native events and A2A bridge concepts to Puppet Master V0 normalized stream events defined in `Plans/CLI_Bridged_Providers.md`. It provides the canonical reference for adapter implementors building Provider bridges against the upstream external agent framework and its A2A interop layer.

## 2. Non-goals

- Redefining the V0 event envelope or event types table (SSOT: `Plans/CLI_Bridged_Providers.md`).
- Defining persistent storage semantics (SSOT: `Plans/storage-plan.md`).
- Defining tool schemas, permissions, or policy (SSOT: `Plans/Tools.md`, `Plans/FileSafe.md`).
- Defining UI/UX behavior or widget rendering.
- Specifying transport mechanics (stream-json, ACP); those are in `Plans/CLI_Bridged_Providers.md`.

---

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
| `artifact_update` | `run_id`, `source`, `artifact_id`, `artifact_name`, `append`, `last_chunk` | An artifact chunk was received. |
| `artifact_data_part` | `run_id`, `source`, `artifact_id`, `part_kind`, `part_index` | A data part within an artifact. `part_kind`: `"text"` or `"data"`. |
| `artifact_file_part` | `run_id`, `source`, `artifact_id`, `file_path`, `persisted` | A file-type part within an artifact has been persisted. |
| `raw_observation` | `run_id`, `source`, `event_type_name`, `truncated` | A raw upstream event was captured for debugging. Bounded ring buffer (see §8.5). |
| `overseer_audit_started` | `run_id`, `source`, `tier`, `audit_kind` | Overseer begins a subjective audit. `audit_kind`: `"start_of_tier"` or `"end_of_tier"`. |
| `overseer_reviewer_spawned` | `run_id`, `source`, `reviewer_id`, `tier` | Overseer spawned a reviewer subagent. |
| `overseer_reviewer_verdict` | `run_id`, `source`, `reviewer_id`, `verdict` | A reviewer returned a verdict. `verdict`: `"accept"` or `"remediate"`. |
| `overseer_audit_consensus` | `run_id`, `source`, `consensus_result` | Consensus computed from reviewer verdicts. `consensus_result`: `"accept"`, `"remediate"`, or `"escalate"`. |
| `overseer_audit_verdict` | `run_id`, `source`, `final_verdict`, `verifier_passed`, `forced_remediation` | Final audit verdict. May force remediation even if verifier passed. |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Glossary.md, ContractName:Plans/Executor_Protocol.md, Gate:GATE-009

### 5.2 Namespacing rule (normative)

Provider/source-specific diagnostics MUST be namespaced via `diagnostic.details.source`. The `category` field MUST use only the reserved values above. Adapters MUST NOT invent new categories; provider-specific context goes in `diagnostic.details` under keys prefixed with the source name if the reserved keys are insufficient.

ContractRef: ContractName:Plans/DRY_Rules.md#2, Gate:GATE-009

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
| `ToolResponseEvent` | `tool_result` (one per `tool_responses` entry) | For each `ToolResponse`: `payload.tool_use_id` ← `tool_call_id`, `payload.tool_name` ← inferred from correlation, `payload.ok` ← `true` (upstream does not carry error flag; adapter infers from content), `payload.result` ← `content`. | `ref:autogen/events/agent_events.py::ToolResponseEvent` |
| `FunctionCallEvent` | `tool_use` | `payload.tool_use_id` ← synthesized (see §8.1), `payload.tool_name` ← `function_call.name`, `payload.arguments` ← parsed `function_call.arguments`. Legacy path; same V0 output as `ToolCallEvent`. | `ref:autogen/events/agent_events.py::FunctionCallEvent` |
| `FunctionResponseEvent` | `tool_result` | `payload.tool_use_id` ← correlated from prior `tool_use`, `payload.tool_name` ← `name`, `payload.ok` ← `true`, `payload.result` ← `content`. | `ref:autogen/events/agent_events.py::FunctionResponseEvent` |
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
| `SelectSpeakerEvent` | `diagnostic` (category `step_started`) | `details.agent_name` ← selected speaker. Informational only. | `ref:autogen/events/agent_events.py::SelectSpeakerEvent` |
| `ExecuteCodeBlockEvent` | `diagnostic` (category `raw_observation`) | Captured as raw observation; not mapped to `tool_use` (code execution goes through Puppet Master tool policy). | `ref:autogen/events/agent_events.py::ExecuteCodeBlockEvent` |
| `ExecuteFunctionEvent` | `diagnostic` (category `raw_observation`) | Captured as raw observation for debugging. | `ref:autogen/events/agent_events.py::ExecuteFunctionEvent` |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## 7. Mapping table 2 — Upstream A2A bridge concepts → V0

Each row maps an A2A protocol concept to V0 event(s). All `ref:` citations point to local upstream clone paths.

| A2A concept | V0 event type(s) | Mapping rule | Citation |
|---|---|---|---|
| `TaskState.submitted` | `diagnostic` (category `run_started`) | Emitted when `AutogenAgentExecutor.execute` publishes the initial task. `details.source` ← `"a2a"`. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `TaskState.working` | `diagnostic` (category `step_started`) | `details.step_id` ← `task.id`, `details.agent_name` ← executor agent name. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `TaskState.input_required` | `diagnostic` (category `input_required`) | `details.prompt_text` ← extracted via `response_message_from_a2a_task` when `task.status.state is TaskState.input_required`. HITL pause semantics apply (§8.3). | `ref:autogen/a2a/utils.py::response_message_from_a2a_task` |
| `TaskState.completed` (via `updater.complete()`) | `diagnostic` (category `run_finished`) + `done` | `done.status` ← `"success"`. Emitted after final artifact chunk. | `ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute` |
| `Message` (A2A protocol) | `text_delta` or `diagnostic` | User messages: `diagnostic` (category `input_provided`). Agent messages: `text_delta` with `payload.text` ← extracted text from `TextPart`. | `ref:autogen/a2a/utils.py::request_message_to_a2a`, `ref:autogen/agentchat/remote/protocol.py::RequestMessage` |
| `Part` / `TextPart` | `text_delta` | `payload.text` ← `TextPart.text`. Metadata from `TextPart.metadata` preserved in diagnostic details if present. | `ref:autogen/a2a/utils.py::message_from_part` |
| `Part` / `DataPart` | `diagnostic` (category `artifact_data_part`) | `details.part_kind` ← `"data"`, `details.artifact_id` ← parent artifact ID. Content extracted via `root.data.get("content", "")`. | `ref:autogen/a2a/utils.py::update_artifact_to_streaming` |
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

When the adapter receives `InputRequestEvent` (native; ref:autogen/events/agent_events.py::InputRequestEvent) or `TaskState.input_required` (A2A; ref:autogen/a2a/utils.py::response_message_from_a2a_task, ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute):

1. Emit `diagnostic` with category `input_required` containing `details.prompt_text` and `details.context_id`.
2. The run enters a **paused** state. No `done` event is emitted.
3. The `seq` counter is preserved and continues from the pause point when input is provided.
4. When input arrives (via `InputResponseEvent` (native; ref:autogen/events/agent_events.py::InputResponseEvent) or an A2A user message (ref:autogen/a2a/client.py::A2aRemoteAgent)), emit `diagnostic` with category `input_provided` and resume normal event emission.

This is a non-terminal pause. The V0 stream contract requires exactly one `done` as the final event; pause does not satisfy that requirement.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/human-in-the-loop.md, Gate:GATE-009

### 8.4 Auth-required mapping

If the upstream framework signals an authentication barrier (e.g., connection refused / remote not found; ref:autogen/a2a/errors.py::A2aClientError, ref:autogen/a2a/errors.py::A2aAgentNotFoundError), the adapter MUST emit `auth_state` with `payload.state` set to the appropriate value from the auth state machine defined in `Plans/CLI_Bridged_Providers.md`. The adapter MUST NOT attempt re-authentication autonomously; auth recovery is owned by the Puppet Master auth subsystem.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, Gate:GATE-009

### 8.5 Artifact handling

- Binary content MUST NOT appear in the V0 normalized stream. Binary artifacts MUST be persisted to the artifact store and referenced by `artifact_id` in diagnostic details (ref:autogen/a2a/utils.py::update_artifact_to_streaming).
- Each artifact chunk emits a `diagnostic` (category `artifact_update`) with `details.artifact_id`, `details.append` (boolean indicating whether this appends to an existing artifact), `details.last_chunk` (boolean), and `details.part_kind` (`"text"` or `"data"`) (ref:autogen/a2a/agent_executor.py::AutogenAgentExecutor.execute, ref:autogen/a2a/utils.py::copy_artifact).
- File-type parts emit `diagnostic` (category `artifact_file_part`) with `details.file_path` and `details.persisted` = `true` after successful persistence.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Project_Output_Artifacts.md, Gate:GATE-009

### 8.6 Raw observation retention

The adapter MUST maintain a bounded ring buffer (capacity: 500 entries) of raw upstream events for post-mortem debugging. Each retained event is surfaced as a `diagnostic` (category `raw_observation`) with `details.event_type_name` set to the upstream wrapped type name (ref:autogen/events/base_event.py::wrap_event) and `details.truncated` set to `true` if the original payload exceeded 4 KiB and was truncated.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/newfeatures.md, Gate:GATE-009

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
