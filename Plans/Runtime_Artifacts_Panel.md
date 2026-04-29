# Runtime Artifacts Panel — SSOT

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0486
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - evidence vs artifacts
  - `Evidence` and `Artifacts` panes should remain distinct even when both link back to the same underlying record.
  - Evidence
  - Artifacts
  - parent-summary artifacts and UI evidence summaries are not interchangeable and should not be collapsed.
  - evidence records and artifacts need independent virtualization/paging
  - heavy artifacts should stay metadata-first until opened
  - Keep artifacts and rendered summaries linked but separate from canonical records.
  - `Plans/Runtime_Artifacts_Panel.md`
  - Plans/Runtime_Artifacts_Panel.md
  - artifacts stay on canonical runtime identity
  - artifacts should preserve canonical run/thread/attempt linkage
  - usage-linked artifacts should continue to route through canonical usage identity
  - `cmd.artifacts.open_panel`
  - cmd.artifacts.open_panel
  - runtime recovery already uses `blocked_sequence` and canonical `cmd.runtime.*` actions
  - blocked_sequence
  - cmd.runtime.*
  - Research Progress - 2026-03-16 - Sonnet Expanded Identity / Runtime SSOT Batch
  - `Plans/Run_Graph_View.md` + `Plans/Runtime_Artifacts_Panel.md`
  - Plans/Run_Graph_View.md
  - `Plans/UI_Command_Catalog.md` + `Plans/Runtime_Artifacts_Panel.md`
  - Plans/UI_Command_Catalog.md
  - the SSOT requires requested/effective capability truth
  - receipt-like artifacts are explicitly told to stay on canonical runtime identity, which is stronger than the current artifact id guidance
  - `Runtime_Artifacts_Panel.md` says receipt-like artifacts must preserve canonical run/attempt identity, but its own canonical ID set still omits `attempt_id`.
  - Runtime_Artifacts_Panel.md
  - attempt_id
  - Resolve the payload-owner triangle for runtime artifacts and either add the missing schema family/registration or soften the mandate explicitly.
  - Validation-pass reports are already treated as canonical first-class artifacts:
  - That contract is structurally better than many adjacent artifacts, but it still stops too early on identity:
  - These reports are upstream artifacts, not execution attempts, so they should not pretend to be run/node/attempt records. But they now need a stronger bridge so runtime/history/ledger/search can answer:
  - Keep validation-pass reports distinct from runtime attempts, but stop leaving them as isolated artifacts with only local workflow identity.
  - validation-pass reports are one of the few upstream artifacts already treated as hard-gating canon, so weak identity here will propagate confusion downstream
  - payload/schema-owner triangle for runtime artifacts
  - still cannot open runtime artifacts by identity or preserve attempt/worktree lineage coherently.
  - Define `operational_identity` as a separate optional field family for receipts, artifacts, and side-effect-bearing attempt/tool records.
  - operational_identity
  - Tool events, runtime artifacts, receipts, and usage now want one shared attribution packet, but the docs still describe them as separate identity worlds.
  - runtime artifacts that are derived from or emitted during an attempt should carry:
  - `Runtime_Artifacts_Panel.md` insists receipt-like artifacts preserve canonical linkage, but it still does not spell out the precedence between `attempt_id`, `provider_attempt_ref`, and `usage_event_ref`.
  - provider_attempt_ref
  - usage_event_ref
  - wizard/report identity for upstream planning artifacts if those are ever surfaced here
  - spot-checks against `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/usage-feature.md`
  - Plans/storage-plan.md
  - Plans/usage-feature.md
  - `cmd.artifacts.show_in_ledger`
  - cmd.artifacts.show_in_ledger
  - `cmd.artifacts.show_in_usage`
  - cmd.artifacts.show_in_usage
  - `cmd.artifacts.show_in_ledger` and `cmd.artifacts.show_in_usage` are useful, but they still encode feature-local semantics that should likely route through the same canonical usage/route target model.
  - dispatcher still lacks an explicit runtime rule that `cmd.runtime.*` recovery actions must be admitted only when the current blocked episode exposes the corresponding ordered `allowed_action_ids[]`.
  - allowed_action_ids[]
  - `CustomHeadlessTool` still lacks stable config/identity/permission ownership and still conflicts with state/config SSOT.
  - CustomHeadlessTool
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - surface-specific commands like `cmd.artifacts.show_in_usage` or `cmd.orchestrator.open_in_source_control` may remain user-facing wrappers
  - cmd.orchestrator.open_in_source_control
  - `Document_Packaging_Policy.md` still has no place for glossary artifacts, requirements-staging seglog artifacts, or package-generation lineage states.
  - Document_Packaging_Policy.md
  - `cmd.runtime.open_queue_analysis`, `cmd.runtime.open_remediation_lineage`, and `cmd.runtime.open_safe_point_history` already imply these route identities, but the general route contract still does not own the examples.
  - cmd.runtime.open_queue_analysis
  - cmd.runtime.open_remediation_lineage
  - cmd.runtime.open_safe_point_history
  - `cost_usage` artifacts already require `Show in Ledger` and `Show in Usage`
  - cost_usage
  - Show in Ledger
  - Show in Usage
  - `OpenFile` is still overclaimed as a universal open contract even though generated artifacts, draft documents, checkpoints, search hits, and runtime artifacts already require identity-native resolution.
  - OpenFile
  - `Plans/Runtime_Artifacts_Panel.md` is partly aligned:
  - Runtime artifacts already require canonical cross-surface routing, but the shared contract is still missing from the owner docs.
  - `task_id` language in the artifacts doc is lagging the broader node/package/seam/lane rewrite and will keep dragging artifact identity toward older decomposition terms unless reconciled.
  - task_id
  - `report_ref` points to canonical quality/governance report artifacts
  - report_ref
  - `Plans/Runtime_Artifacts_Panel.md` is already stronger than these docs on the usage side:
  - canonical enough for Ledger and cost artifacts
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/interview-subagent-integration.md` still do not contain the exact `validation artifact lineage`, `bridge-field viewer`, or `validation/report section` headings.
  - Plans/Project_Output_Artifacts.md
  - Plans/interview-subagent-integration.md
  - validation artifact lineage
  - bridge-field viewer
  - validation/report section
  - `Plans/Runtime_Artifacts_Panel.md:63-93`
  - Plans/Runtime_Artifacts_Panel.md:63-93
  - Wave 2 targeted the storage/receipt/blocked subset around `gap-003`, `gap-004`, and `gap-005` (`Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `Plans/Tools.md`, `Plans/assistant-chat-design.md`) and only reconfirmed the already-recorded missing anchors/fields plus the already-known owner-vs-consumer split for blocked-packet fields.
  - gap-003
  - gap-004
  - gap-005
  - `Plans/Runtime_Artifacts_Panel.md:61-93`
  - Plans/Runtime_Artifacts_Panel.md:61-93
  - `gap-004` sharpened: `Plans/Runtime_Artifacts_Panel.md` still points directly at the missing `Plans/storage-plan.md#Cross-surface receipt record` anchor, so the receipt blocker now includes a live broken consumer reference rather than only missing owner/consumer headings.
  - Plans/storage-plan.md#Cross-surface receipt record
  - `Plans/Runtime_Artifacts_Panel.md:57-65`
  - Plans/Runtime_Artifacts_Panel.md:57-65
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0494
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `attempt_id` is increasingly looking like a cross-surface anchor, not an optional artifact detail
  - attempt_id
  - `orchestrator-subagent-integration.md` constructs `TierContext` without clear run/node/attempt/lane identity, which means downstream hook, artifact, and retry logic can inherit a context object that is not a trustworthy canonical anchor.
  - orchestrator-subagent-integration.md
  - TierContext
  - `FileManager.md` needs stable identity and open-by-identity semantics, but the artifact docs still do not define enough envelope routing data to support that cleanly.
  - FileManager.md
  - Search results, artifact pivots, and usage pivots all carry enough identity to benefit from a shared routing model, but they are still encoded as local behavior text or per-command payloads.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0487
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Evidence and artifact exports should not collapse into one undifferentiated zip of files
  - stable live identity now centers on `attempt_id`, receipt refs, `scheduler_lane`, `worktree_id`, and requested/effective identity per attempt
  - attempt_id
  - scheduler_lane
  - worktree_id
  - A bare `requested_account_id` alone is still slightly insufficient, because it leaves one ambiguity unresolved:
  - requested_account_id
  - collapse duplicate runtime/gate addenda into one numbered canonical section per owner.
  - `OpenSubject(subject_id = artifact:...)` resolves to real document source if one exists
  - OpenSubject(subject_id = artifact:...)
  - `FinalGUISpec.md` aligns with only one of those outcomes.
  - FinalGUISpec.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0491
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - artifacts index and worktree lifecycle look like the clearest missing families right now
  - The v2 `open_gaps.json` keeps only unresolved blocker families and their exact missing items.
  - open_gaps.json
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0488
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what old assumption is present: `TierTree`, `tier_type`, `View in Tiers`, phase/task/subtask grouping.
  - TierTree
  - tier_type
  - View in Tiers
  - Keep CSV/table exports as convenience view exports, not as canonical archival exports.
  - Require manifests for non-trivial bundle exports, and make those manifests preserve canonical IDs/refs rather than export-local surrogate identities.
  - Bundle manifests and route/subject normalization fit together naturally; exports should preserve the same object vocabulary the UI uses.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0490
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Normalize cross-surface receipt records so `project_id`, actor refs, `created_at_utc`, and `usage_event_ref` are required whenever a surface may pivot historically or across projects.
  - project_id
  - created_at_utc
  - usage_event_ref
  - stable `cmd.*` IDs exist for many cross-surface pivots
  - cmd.*
  - Keep cross-surface receipt refs, but treat them as linkage, not as the sole operational-identity disclosure model.
  - `UsageRecord` still keeps `tier_id` as a required cross-surface field
  - UsageRecord
  - tier_id
  - cross-surface receipt linkage already says runtime artifacts must stay on canonical runtime identity
  - lane/worktree, receipt, and cross-surface lineage concepts are present
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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
