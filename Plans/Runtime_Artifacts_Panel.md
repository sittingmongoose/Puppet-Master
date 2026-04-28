# Runtime Artifacts Panel — SSOT

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-017: Export taxonomy and manifest contract
- Coverage rows: cov-017
- Fidelity gap refs: cov-017
- Required fidelity items:
- Exact required item: Define record export, bundle export, and view export as distinct export classes
- Exact required item: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-017: Export taxonomy and manifest contract` exists in `Plans/Runtime_Artifacts_Panel.md`.
- Exact acceptance check: The `cov-017` repair states the exact requirement: Define record export, bundle export, and view export as distinct export classes
- Exact acceptance check: The `cov-017` repair states the exact requirement: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Exact acceptance check: The `cov-017` repair is in the owner section for `Plans/Runtime_Artifacts_Panel.md` and is not only a downstream consumer note.

### Fidelity recovery cov-183: Bridge-field precedence for attempt/provider/usage/receipt joins
- Coverage rows: cov-183
- Fidelity gap refs: cov-183
- Required fidelity items:
- Exact required item: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact required item: None of those bridge fields replace the primary local key
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-183: Bridge-field precedence for attempt/provider/usage/receipt joins` exists in `Plans/Runtime_Artifacts_Panel.md`.
- Exact acceptance check: The `cov-183` repair states the exact requirement: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact acceptance check: The `cov-183` repair states the exact requirement: None of those bridge fields replace the primary local key
- Exact acceptance check: The `cov-183` repair is in the owner section for `Plans/Runtime_Artifacts_Panel.md` and is not only a downstream consumer note.

### Fidelity recovery cov-191: Artifacts index exact indexed fields
- Coverage rows: cov-191
- Fidelity gap refs: cov-191
- Required fidelity items:
- Exact required item: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-191: Artifacts index exact indexed fields` exists in `Plans/Runtime_Artifacts_Panel.md`.
- Exact acceptance check: The `cov-191` repair states the exact requirement: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Exact acceptance check: The `cov-191` repair is in the owner section for `Plans/Runtime_Artifacts_Panel.md` and is not only a downstream consumer note.

### Fidelity recovery cov-202: Artifact envelope routing preference
- Coverage rows: cov-202
- Fidelity gap refs: cov-202
- Required fidelity items:
- Exact required item: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact required item: Require runtime artifacts summarizing external operations to carry receipt linkage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-202: Artifact envelope routing preference` exists in `Plans/Runtime_Artifacts_Panel.md`.
- Exact acceptance check: The `cov-202` repair states the exact requirement: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact acceptance check: The `cov-202` repair states the exact requirement: Require runtime artifacts summarizing external operations to carry receipt linkage
- Exact acceptance check: The `cov-202` repair is in the owner section for `Plans/Runtime_Artifacts_Panel.md` and is not only a downstream consumer note.

> **Compliance:** This document follows Plans/DRY_Rules.md. Naming: "Puppet Master" only. No open questions; deterministic defaults per Plans/Decision_Policy.md.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md

## 1. Purpose and scope

The **Artifacts panel** is the single place to see everything agents produced during a run or thread: file changes (diffs), plans, verification evidence, screenshots, reasoning summaries, browser recordings, tool/LLM traces, cost_usage attribution, and other types below. It does not run agents; it lists, previews, and links. All artifact types listed are **required** for MVP; there are no optional types.

| Family | Scope | SSOT | Persistence |
|--------|--------|------|-------------|
| **Project Plan Package** | User-project outputs | Plans/Project_Output_Artifacts.md | .puppet-master/project/** |
| **Runtime Artifacts** | Agent-run outputs in Artifacts panel | This document | seglog runtime_artifact.*, redb artifacts_index:v1:{project_id} |

ContractRef: Plans/Project_Output_Artifacts.md#Runtime Artifacts (GUI panel) — distinct from this document, Plans/storage-plan.md#Required redb keys

Required fields:
- artifact_id
- artifact_type
- run_id
- attempt_id
- projection_freshness
- projection_health

Canonical terms and values:
- seglog `runtime_artifact.*`
- artifacts_index.v1:{project_id}:{artifact_id}

Behavioral rules:
- Project Plan Package and Runtime Artifacts remain distinct families.
- Runtime artifact lookup/indexing remains a projection concern rather than canonical artifact truth.
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

### 4A Artifacts index families and projector checkpoints

#### Acceptance carry-through
- Register artifacts_index, artifacts_project_state, and runtime_artifacts projector checkpoint families
- Make the artifact index rebuildable from canonical runtime evidence
- Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing

### 4B Runtime-artifact envelope and attribution packet

#### Acceptance carry-through
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage
- Resolve artifact open flows by artifact_id and then by linked envelope refs
- Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- None of those bridge fields replace the primary local key
- Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Require runtime artifacts summarizing external operations to carry receipt linkage

## 5A. Debug investigation grouping, manifests, and exports

Runtime artifacts may participate in a shared Debug investigation without changing artifact-family ownership.

Required cross-artifact grouping fields are:
- `investigation_id?`
- `instrumentation_id?`
- `evidence_role?` (`baseline`, `repro`, `diagnosis`, `fix`, `verification`, `cleanup`)
- `verification_strength?` (`none`, `weak`, `strong`)

Grouping rules:
- any runtime artifact may be grouped under an investigation when `investigation_id` is present
- investigation grouping does not invent a new artifact family; it is an index and navigation layer over the canonical artifact records
- `context_snapshot`, `tool_llm_trace`, `failed_attempts`, `restore_point`, `before_after_snapshot`, and `subagent_lineage` are required participants for Debug Mode when emitted
- artifact open/focus actions must route to the owning target surface rather than to an artifact-local shell

Required bundle manifest fields are:
- `schema_id = pm.investigation_bundle.schema.v1`
- `bundle_id`
- `investigation_id`
- `target_summary`
- `phase_history`
- `context_items[]`
- `artifact_refs[]`
- `instrumentation_manifest[]`
- `verification_summary`
- `cleanup_state`
- `redaction_and_omission_summary`

Export and import rules:
- raw screenshots, traces, logs, recordings, and diffs remain stored and opened through the shared runtime-artifact system; the bundle manifest references them instead of duplicating bytes inline
- exporting an investigation writes `runtime_artifact.document` or equivalent manifest-linked metadata plus `debug.investigation.exported`
- importing a bundle creates an `imported_bundle` debug target and preserves provenance about the external source rather than pretending the bundle is a live local runtime target
- redacted, revoked, blocked, expired, and omitted items remain visible in the manifest summary so users can tell what was or was not carried forward

### 5B Export taxonomy and manifests

#### Acceptance carry-through
- Define record export, bundle export, and view export as distinct export classes
- Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure

## 6. reasoning_tokens and cost_usage
**reasoning_tokens:** Required in the usage/cost_usage schema (integer, minimum 0). In the UI, display the field only when value > 0.

**cost_usage artifact:** Attribution record only. It uses the same canonical usage identity and normalized fields as the app-wide Usage page, the thread-scoped Context Detail Pane, Ledger, Run Graph, and Orchestrator usage displays.

Required actions for `cost_usage` items:
- **Show in Ledger** — navigate to the canonical Ledger surface with the matching usage identity in scope
- **Show in Usage** — navigate to either app-wide Usage or the canonical thread Context Detail Pane depending on artifact scope, preserving the same run/thread filters

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Rules:
- cost_usage artifacts do not create an artifact-local usage model
- thread-scoped cost_usage artifacts land on the same Context Detail Pane used by the chat context indicator `More Details` action
- app-wide cost_usage artifacts land on the canonical Usage page
- when cost is derived from normalized token buckets rather than authoritative provider pricing, user-facing thread surfaces label it as `Estimated Cost`

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
## 7. JSON schemas (all required)

**Envelope:** Plans/runtime_artifact_envelope.schema.json (`$id`: pm.runtime_artifact.envelope.v1). Common payload fields for all runtime artifact events.

**Per-type:** One file per artifact type, e.g. Plans/runtime_artifact_code_diff.schema.json through Plans/runtime_artifact_artifact_version.schema.json, with `$id`: pm.runtime_artifact.<type>.v1. Each payload is validated against the envelope plus the corresponding type schema. The cost_usage schema MUST include required reasoning_tokens (integer, minimum 0). All 19 type schemas are required; no optional schema files.

Implementation MUST validate every runtime_artifact.* event payload against the envelope and the matching type schema before appending to seglog and before writing to the artifacts index.

## 8. Browser recordings
Browser recordings and adjacent browser evidence must preserve the canonical browser session distinction.

Rules:
- a recording created from `workspace_preview` or `detached_preview` retains the owning project/workspace/browser-session identity
- a recording created from `automation_session` or `auth_session` does not imply that the underlying browser session is a persistent shell browser tab
- screenshots, structured snapshots, traces, videos, and recordings emitted from browser sessions route through the shared runtime artifact pipeline rather than a browser-only store
- actions such as `Send to Chat`, `Open`, or `Focus Browser` must route back to the owning canonical browser session rather than inventing a separate artifact-owned browser shell

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md

Browser evidence artifacts MUST carry enough metadata to rejoin the owning browser session and project context.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

Minimum fields are:
- `artifact_id`
- `project_id`
- `browser_session_id`
- `session_class`
- `profile_scope`
- `workspace_tab_id?`
- `capture_scope?`
- `created_at_utc`
- any owning `run_id` / `thread_id` refs already required by the shared artifact envelope

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

`runtime_artifact.browser_recording` remains a required artifact type. Browser screenshots, traces, and videos emitted from browser sessions must align with the same ownership and open/focus semantics even when their concrete artifact type differs from `browser_recording`.

Completed browser evidence should survive crash and recovery when possible.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

## 9. All differentiators MVP

All artifact differentiators identified in the research are MVP and required; no optional differentiators. Triggers, cardinality, error handling, sanitization, and UI edge cases must be specified per type as needed for implementation.

## 10. References

- Plans/Contracts_V0.md (EventRecord envelope)
- Plans/storage-plan.md (event types, redb key, projector, cost_usage alignment)
- Plans/usage-feature.md (usage pipeline, Show in Ledger/Usage, Gap 3)
- Plans/Project_Output_Artifacts.md (distinction from Project Plan Package)
- Plans/FileManager.md (open by artifact identity)

## Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)
Receipt-like artifacts keep canonical runtime identity and bridge fields instead of inventing artifact-local lineage.

### bridge-field viewer
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `workflow_run_id`

Required actions:
- `Show in Ledger`
- `Show in Usage`

Rules:
- Bridge fields remain joins rather than replacement primary keys.
- Open and focus actions route through canonical receipt and usage identity.
