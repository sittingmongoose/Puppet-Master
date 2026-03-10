# Runtime Artifacts Panel — SSOT

> **Compliance:** This document follows Plans/DRY_Rules.md. Naming: "Puppet Master" only. No open questions; deterministic defaults per Plans/Decision_Policy.md.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md

## 1. Purpose and scope

The **Artifacts panel** is the single place to see everything agents produced during a run or thread: file changes (diffs), plans, verification evidence, screenshots, reasoning summaries, browser recordings, tool/LLM traces, cost_usage attribution, and other types below. It does not run agents; it lists, previews, and links. All artifact types listed are **required** for MVP; there are no optional types.

## 2. Two artifact families (no conflation)

| Family | Scope | SSOT | Persistence |
|--------|--------|------|-------------|
| **Project Plan Package** | User-project outputs | Plans/Project_Output_Artifacts.md | .puppet-master/project/** |
| **Runtime Artifacts** | Agent-run outputs in Artifacts panel | This document | seglog runtime_artifact.*, redb artifacts_index:v1:{project_id} |

## 3. Mechanism: one event type per artifact type

**Option 2 only:** One seglog event type per artifact type. No single generic `runtime_artifact` event with a subtype field. Each event uses the standard EventRecord envelope (schema, ts, seq, type, run_id, thread_id, payload). The `type` value is exactly one of the 19 event type names below.

**Canonical 19 artifact types and event type names:**
- code_diff → `runtime_artifact.code_diff`
- implementation_plan → `runtime_artifact.implementation_plan`
- reasoning_summary → `runtime_artifact.reasoning_summary`
- validation_test → `runtime_artifact.validation_test`
- screenshot → `runtime_artifact.screenshot`
- evidence → `runtime_artifact.evidence`
- document → `runtime_artifact.document`
- restore_point → `runtime_artifact.restore_point`
- browser_recording → `runtime_artifact.browser_recording` (required; not optional)
- tool_llm_trace → `runtime_artifact.tool_llm_trace`
- context_snapshot → `runtime_artifact.context_snapshot`
- cost_usage → `runtime_artifact.cost_usage`
- hitl_approval → `runtime_artifact.hitl_approval`
- failed_attempts → `runtime_artifact.failed_attempts`
- subagent_lineage → `runtime_artifact.subagent_lineage`
- before_after_snapshot → `runtime_artifact.before_after_snapshot`
- suggested_next_steps → `runtime_artifact.suggested_next_steps`
- api_web_call → `runtime_artifact.api_web_call`
- artifact_version → `runtime_artifact.artifact_version`

## 4. redb key and projector

**redb key:** `artifacts_index:v1:{project_id}`. Per-project only; not global; not per-run.

**Projector:** A projector (or equivalent) reads seglog events whose `type` starts with `runtime_artifact.` (or lists the 19 types explicitly) and writes/updates the per-project artifacts index. No payload.artifact_type discriminator; type is given by event `type`.

## 5. Canonical IDs and task_id rule

**Canonical ID set:** artifact_id, run_id, thread_id, task_id (per rule below), linked_artifact_id, logical_artifact_id. Format (e.g. UUID, prefixed) must be specified in implementation; see Plans/Contracts_V0.md for run_id/thread_id.

**task_id rule (deterministic):** Present in payload **when the run has task/subtask granularity**; **otherwise omit from payload.** No "optional" wording; not conditional on "if available."

## 6. reasoning_tokens and cost_usage

**reasoning_tokens:** Required in the usage/cost_usage schema (integer, minimum 0). In the UI, display the field **only when value > 0**; do not show when zero.

**cost_usage artifact:** Attribution record only. Same canonical usage pipeline and schema as usage.event (tokens_in, tokens_out, reasoning_tokens, cost, platform/provider, model). Ledger and Usage page consume the same data. Required actions in Artifacts panel for cost_usage items: **Show in Ledger**, **Show in Usage** (navigate to Ledger/Usage with filters so the canonical usage event is visible).

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

## 7. JSON schemas (all required)

**Envelope:** Plans/runtime_artifact_envelope.schema.json (`$id`: pm.runtime_artifact.envelope.v1). Common payload fields for all runtime artifact events.

**Per-type:** One file per artifact type, e.g. Plans/runtime_artifact_code_diff.schema.json through Plans/runtime_artifact_artifact_version.schema.json, with `$id`: pm.runtime_artifact.<type>.v1. Each payload is validated against the envelope plus the corresponding type schema. The cost_usage schema MUST include required reasoning_tokens (integer, minimum 0). All 19 type schemas are required; no optional schema files.

Implementation MUST validate every runtime_artifact.* event payload against the envelope and the matching type schema before appending to seglog and before writing to the artifacts index.

## 8. Browser recordings

Browser recordings are a **required** artifact type (runtime_artifact.browser_recording). Source: GUI automation runs (e.g. Playwright) from Orchestrator or Chat. Stored under canonical evidence path; list shows thumbnail, duration, run/session id, timestamp. Detail: in-panel video player or "Open in default app"; optional timeline with key events. Actions: Copy path, Export, Send to Chat as needed.

## 9. All differentiators MVP

All artifact differentiators identified in the research are MVP and required; no optional differentiators. Triggers, cardinality, error handling, sanitization, and UI edge cases must be specified per type as needed for implementation.

## 10. References

- Plans/Contracts_V0.md (EventRecord envelope)
- Plans/storage-plan.md (event types, redb key, projector, cost_usage alignment)
- Plans/usage-feature.md (usage pipeline, Show in Ledger/Usage, Gap 3)
- Plans/Project_Output_Artifacts.md (distinction from Project Plan Package)
- Plans/FileManager.md (open by artifact identity)
