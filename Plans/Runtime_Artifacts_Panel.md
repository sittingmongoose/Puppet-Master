# Runtime Artifacts Panel — SSOT


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Export taxonomy and manifest contract
### Bridge-field precedence for attempt/provider/usage/receipt joins
### Artifacts index exact indexed fields
### Artifact envelope routing preference


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

#### Route-state and shell-state boundary

Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when they get there." Artifact, receipt, usage, and export pivots resolve canonical IDs/refs and object identity first: `artifact_id`, `run_id`, `thread_id`, `node_id?`, `attempt_id`, `receipt_id?`, `provider_attempt_ref?`, and `usage_event_ref?`.

workspace-tab selection, panel docking, and per-project layout restore are `shell-state` concerns layered underneath canonical routing. Shell-state may choose the destination tab, dock zone, or restored layout after route resolution, but it must not replace object identity or make the route model swallow the whole shell.

Context-changing actions such as `Show in Usage`, `Open in Source Control`, `Resume Wizard`, and `View in Usage` from Orchestrator Ledger force a destination-context change. They normalize through route/open primitives first; historical/current `/current` usage navigation and `/open` actions use run/thread/attempt identity, `/node/attempt` identity, and `usage_event_ref` before any legacy `tier_id` view/filter compatibility. Superseded source labels such as `focus_thread_usage` remain lineage labels and must normalize to current route/open command IDs rather than remain live canonical IDs.

Receipt-like exports and manifest-backed bundles preserve canonical run/thread/attempt linkage and must not mint shadow IDs. Usage-linked artifacts continue to route through canonical usage identity rather than artifact-local usage models.

#### P5 runtime-artifact identity recovery requirements

- Source Control artifact rows and tabs stay `information-dense` but selective: the panel MUST NOT assume package, `/lane/run/worktree`, receipt, and artifact metadata can all be shown at full fidelity at once; it shows canonical anchors, trust state, and drill targets first.
- Runtime artifact `/import` and `/evidence` export language MUST NOT be UI-`view-centric`; import/export records preserve artifact identity, evidence class, source refs, route refs, and owner lineage before describing the current view filter.
- `path-based` open remains for repo and `/workspace` files, while `identity-based` open is the canonical entrypoint for runtime artifacts, generated drafts, attempt `/evidence/safe-point/remediation` reports, and preview `/document` hybrids.
- User-facing `/export` behavior is `identity-preserving`: output format, `/date-range`, filter state, and download location are export parameters, not export identity, and they never replace canonical artifact/run/thread/attempt refs.
- Attempt `/safe-point/remediation` artifact opens remain stable across cleanup, `/archive/remove`, retention, and bundle moves; runtime artifacts must not be forced through fake repo paths to survive those flows.
- `non-trivial` bundle exports require manifests that preserve canonical `IDs` and `/refs`; manifests MUST NOT mint `export-local` surrogate identities that hide the source artifact, evidence, usage, run, attempt, or receipt identity.
- UI / projection / command contracts are still structurally incomplete and under-owned: - `FinalGUISpec.md` still has no true Orchestrator page section, still leaves `Tiers` as a standalone run-group view, and still lacks any native concern-model, historical-run-mode, or Progress-only widget-boundary contract. - `FinalGUISpec.md` also sharpens the projection-state naming issue: generic “projection trust” language will collide with existing preview/browser `trust_tier`; the cleaner split remains `projection_freshness` vs `projection_health`. - `Runtime_Artifacts_Panel.md` now looks more fragile than earlier passes suggested: `attempt_id` is still absent from the canonical artifact ID set, producer identity is anonymous at the envelope boundary, `subagent_lineage` still has no minimum payload semantics, `cost_usage` drill-through still rests on optional `usage_event_ref`, and `/stale`, cross-surface, `UI_Command_Catalog.md`, UI_Command_Catalog, `cmd.*`, rewrite-era command families such as `cmd.account`, `cmd.account.*`, `cmd.concern`, `cmd.concern.*`, `cmd.promotion`, `cmd.promotion.*`, and `approve_continue` remain part of the artifact-panel gap surface.
- exact_items: - `Plans/interview-subagent-integration.md` does contain `### Runtime identity visibility`, but its required fields still stop at `requested_account_binding` / `operational_identity` and do not carry `requested_account_policy` or `tool_use_id`. - `Plans/assistant-chat-design.md` already carries `tool_use_id`, so gap-001's consumer deficiency is sharper than a blanket "missing everywhere" claim. - `Plans/usage-feature.md` still does not contain an exact `artifact drill-through section` heading. - `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/interview-subagent-integration.md` still do not contain the exact `validation artifact lineage`, `bridge-field viewer`, or `validation/report section` headings.
- Cross-surface usage/deep-link identity is now clearly under-typed: - `storage-plan.md` promotes `usage_event_ref?` into receipt and cross-surface bridge records but still never defines its concrete format or stability semantics - `Runtime_Artifacts_Panel.md` requires `Show in Ledger` / `Show in Usage` for `cost_usage`, but the promised runtime-artifact schemas are not present and no concrete usage identity payload is pinned - `Orchestrator_Page.md` and `Run_Graph_View.md` still route `View in Usage` by `run_id` or `tier_id`, not by receipt/attempt/usage-event identity
- Add the missing canonical record/projection families to `storage-plan.md` for worktree lifecycle and artifact index state before downstream docs keep inventing them implicitly.
- The clearest missing family is the runtime-artifact index side: - `Runtime_Artifacts_Panel.md` declares `artifacts_index:v1:{project_id}` - declares a projector from `runtime_artifact.*` events - declares envelope and per-type schema files - `storage-plan.md` still does not clearly register that artifacts index family alongside the other canonical keys, and the broader doc set still shows signs that the schema family itself may not yet exist
- `Plans/Contracts_V0.md` + `Plans/storage-plan.md` - likely owners for canonical correlation blocks, switch/pressure episodes, and blocked/approval identity linkage
- `Plans/usage-feature.md` is still one of the main correlation drifts: - `usage.jsonl` and canonical usage discussion still center `tier_id` - canonical `UsageRecord` still requires `tier_id` - Run Graph and Orchestrator are still said to aggregate by `tier_id` and `attempt_id?` - later navigation wording is closer to the rewrite: - `usage_event_ref` - canonical Usage surfaces - run/thread-based opens for `Show in Ledger` and `Show in Usage`
- `Plans/usage-feature.md` - now clearly needs switch-event linkage or equivalent durable explanation path
- `Plans/Runtime_Artifacts_Panel.md` is already stronger than these docs on the usage side: - `cost_usage` routes by canonical usage identity - not by tier-local filters
- `Plans/Contracts_V0.md` - `Plans/storage-plan.md` - `Plans/usage-feature.md` - `Plans/Orchestrator_Page.md`
- `Plans/Multi-Account.md` - `Plans/storage-plan.md` - `Plans/usage-feature.md` - `Plans/Contracts_V0.md`
- `Plans/Multi-Account.md` - `Plans/storage-plan.md` - `Plans/Contracts_V0.md` - `Plans/usage-feature.md`
- `Plans/Runtime_Artifacts_Panel.md` - still lacks attempt-level identity, producer attribution, trustworthy `cost_usage` linkage, and degraded/stale projector behavior.
- Storage-plan is now clearly missing several record/projection families that downstream docs already treat as if they exist (`runtime_artifact` payload schemas, worktree records/projections, artifact index registration).
- `Plans/FileManager.md` - still cannot open runtime artifacts by identity or preserve attempt/worktree lineage coherently.
- `provider_attempt_ref` now looks like a key bridge field, not a niche detail. - If this packet is not normalized, each surface will keep rebuilding partial joins between tools, artifacts, receipts, and usage.
- Cross-owner docs implicated by this seam: - `Plans/storage-plan.md` - `Plans/FileManager.md` - `Plans/Runtime_Artifacts_Panel.md` - `Plans/Contracts_V0.md`
- If `route_target` simply absorbs every current surface-local field (`artifact_id`, `usage_event_ref`, `wizard_step`, `message_id`, `workflow_run_id`, etc.), it will recreate the same drift problem in a new place.
- `usage_event_ref` still reads like a direct route field in some docs rather than a normalized object identity.
- `Plans/usage-feature.md` duplicates the entire `Cost_usage runtime artifact and Show in Ledger / Show in Usage` section back-to-back.
- `Ledger` can inspect exact record structure consistently across families without inventing a custom viewer for every new object.
- Define `usage_event_ref` explicitly and make all `Show in Usage` / `Show in Ledger` pivots prefer receipt + attempt + usage-event identity over run-only or tier-only filters.
- `Runtime_Artifacts_Panel.md` names `artifacts_index:v1:{project_id}` as canonical, but `storage-plan.md` does not appear to register/own that family at the same level as other redb families.
- cost-bearing receipt-like artifacts should always prefer `usage_event_ref` for Usage/Ledger routing, not timestamp heuristics
- `Runtime_Artifacts_Panel.md` currently treats the envelope mostly as an implementation hook: - one event type per artifact family - `EventRecord` wrapper - per-type schemas - artifact-local IDs
- `cost_usage` - must carry `usage_event_ref` whenever available - should also carry `attempt_id?` and `provider_attempt_ref?` when traceable
- `Plans/Runtime_Artifacts_Panel.md` - `Plans/storage-plan.md` - `Plans/FileManager.md`
- `Plans/FileManager.md` - `Plans/Runtime_Artifacts_Panel.md` - `Plans/storage-plan.md`
- `Plans/FileManager.md` - `Plans/storage-plan.md` - `Plans/Runtime_Artifacts_Panel.md`
- align `Show in Ledger`, `Show in Usage`, and artifact/report opens around the same target schema instead of per-feature payloads
- `Plans/storage-plan.md` - `Plans/FileManager.md` - `Plans/Runtime_Artifacts_Panel.md`
- `usage-feature.md` and `Runtime_Artifacts_Panel.md` both describe `Show in Ledger` / `Show in Usage` behavior using identifiers like: - `artifact_id` - `usage_event_ref?` - `run_id?` - `thread_id?` - time/filter context but they still frame those as view-specific navigation instructions, not as a canonical target model.
- `usage_event_ref` should normalize into a stable `usage_event` object identity rather than remain a top-level special-case field.
- `Plans/usage-feature.md` - `Plans/FileManager.md` - `Plans/Glossary.md` - `Plans/00-plans-index.md`
- `storage-plan.md` already hints at export for long-term ledger/history retention.
- Extend runtime-artifact envelopes and `cost_usage` linkage with canonical identity/trust/switch fields or refs.
- `artifacts_index:v1:{project_id}` is too underspecified to function as the sole canonical index contract; it needs row identity and projector ownership.
- `Plans/Project_Output_Artifacts.md` - `Plans/Glossary.md` - `Plans/FileManager.md`
- `Plans/Project_Output_Artifacts.md` - `Plans/Glossary.md` - `Plans/FileManager.md`
- `usage_event_ref` is the canonical bridge to cost/usage history for that attempt or artifact.
- `Runtime_Artifacts_Panel.md` insists receipt-like artifacts preserve canonical linkage, but it still does not spell out the precedence between `attempt_id`, `provider_attempt_ref`, and `usage_event_ref`.
- `usage_event_ref` should be the preferred route for cost-bearing pivots whenever present.
- `Plans/Runtime_Artifacts_Panel.md` - `Plans/FileManager.md` - `Plans/Project_Output_Artifacts.md`
- `Plans/FileManager.md` - `Plans/Runtime_Artifacts_Panel.md` - `Plans/usage-feature.md`
- `Plans/Project_Output_Artifacts.md` - `Plans/Glossary.md` - `Plans/FileManager.md`
- `Plans/Project_Output_Artifacts.md` - `Plans/Glossary.md` - `Plans/FileManager.md`
- `Plans/Project_Output_Artifacts.md` - `Plans/Glossary.md` - `Plans/FileManager.md`
- Thread/run/history exports risk flattening rich object identity unless they explicitly preserve canonical refs like `thread_id`, `run_id`, `artifact_id`, `usage_event_ref`, and route/open hints.


### 4C Runtime-artifact retention, stream-view, and audit boundaries

Runtime artifacts that bridge receipts, Usage, Ledger, Debug, and exported evidence use the shared attribution packet from §4B plus the following artifact-panel rules. Owner docs keep their primary schema authority: `Plans/Contracts_V0.md` owns shared event names and temporal primitives; `Plans/storage-plan.md` owns persisted state mechanics, retention storage, and projector behavior; this document owns the runtime-artifact panel contract and artifact-family envelope.

`usage_event_ref` is a locator-grade usage bridge on runtime artifacts. It is stable for the lifetime of the referenced Usage/Ledger record, scoped to the canonical project/run or account-backed usage record, and present whenever the artifact is cost-bearing or can pivot to Usage/Ledger history. Runtime artifacts MUST NOT use `usage_event_ref` as a replacement `artifact_id`, `attempt_id`, or route primary key.

Receipt-like runtime artifacts preserve `requested_action`, `effective_action`, `effective_outcome`, requested/effective target fields, and any degradation-reason fields needed to explain partial, blocked, retried, or externally indeterminate outcomes. When an artifact summarizes a side effect, receipt linkage is required even if the artifact body is only a report or export projection.

Runtime artifacts declare an explicit retention class:
- `durable` for canonical receipts, validation reports, exported bundles, and artifacts needed for History/Ledger replay.
- `session_bounded` for crash-recovery views, active stream snapshots, and diagnostic evidence that must survive a session boundary but can expire by policy.
- `ephemeral_view` for active UI frames, transient stream chunks, and non-canonical preview state that may be discarded after the owning view no longer needs it.

Sensitive and operational metadata minimization applies before export defaults are chosen. Secret material is redacted by policy, and non-secret operational metadata is still masked or omitted when it can expose account, host, path, provider, or workspace context outside the selected export profile.

Streaming and incremental runtime artifacts preserve `truncation_state`, flushed-sequence or equivalent committed-offset metadata, and explicit gap-rendering rules so viewers can distinguish complete evidence, intentionally omitted ranges, dropped stream chunks, and unknown continuity. Diff, review, and export artifacts MUST state the `raw-content-vs-metadata` boundary before storing or exporting changed-line bodies, comments, screenshots, traces, or logs.

Cross-system runtime artifacts carry stitched receipt fields for `receipt_id`, correlation identity, `source_system`, optional `source_occurred_at`, `observed_at`, `recorded_at`, and any time-skew disclosure supplied by the owner event. Runtime artifact ordering follows canonical receipt/event sequence when remote clocks disagree.

Persisted stream-view intent is explicit. Stream surfaces distinguish `follow`, `paused_snapshot`, and `historical_view`; after restart, `follow` may resume only after source revalidation, while `paused_snapshot` and `historical_view` reopen as bounded historical evidence with visible degradation when the live source cannot be recovered.

The artifact panel exposes artifact audit visibility as a dedicated searchable log/audit surface distinct from inline chat cards. Audit rows index artifact identity, attempt/run lineage, receipt refs, export/import refs, retention class, redaction profile, omitted evidence counts, and integrity failures without flattening those rows into conversational summaries.

Temporary instrumentation artifacts declare `instrumentation_id`, `collector_state` (`collector-state` in audit vocabulary), install/collect/remove lifecycle state, evidence sink, cleanup or rollback state, and owning Debug investigation refs. Debug instrumentation MUST NOT outlive its declared cleanup policy without an explicit failed-cleanup artifact or blocked recovery record.

Runtime artifacts consume these cross-cutting owner contracts without re-owning them: large-dataset scaling contracts, cross-surface filter persistence, canonical time-source precedence, Debug evidence budgets and redaction defaults, debug adapter model, stale/live data signaling, chat/file-tree deep-link panel context, and receipt identity-extension fields after the storage/receipt owners land their fuller contract.

## 5A. Debug investigation grouping, manifests, and exports


### Debug investigation bundle manifest contract

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
- Debug investigations reuse existing runtime-artifact families before inventing new debug-only silos: `runtime_artifact.evidence`, `context_snapshot`, `tool_llm_trace`, `browser_recording`, `failed_attempts`, `before_after_snapshot`, and `subagent_lineage` remain the SSOT artifact families, while `investigation_id` / bundle identity only groups them for diagnosis.
- Agent-session adapter investigations expose entry points for "why did the agent fail", "what did it do", and "troubleshoot this run"; they use `tool_llm_trace`, `context_snapshot`, `failed_attempts`, and `subagent_lineage` for bounded thread attach plus later export/import under the same investigation model.
- browser-backed investigations use `automation_session` for testing, verification, debugging, and other live automation as the `/session/evidence` collection surface and preserve `browser_session_id` plus `session_class`; when the runtime is healthy, readback evidence includes `navigate`, `snapshot`, `screenshot`, `console`, and network summaries, while `interaction` and `/trace/video` capture remain separately permissioned and stored as runtime artifacts; this browser/session/evidence contract grounds the web/app debug MVP.
- artifact open/focus actions must route to the owning target surface rather than to an artifact-local shell
- Debug evidence artifact open/focus routes resolve back to canonical browser/dev/debugger/session identities such as `browser_session_id`, `dev_session_id`, `terminal_session_id`, and DAP-style debug identity; the runtime-artifact record groups under `investigation_id` but does not replace those owner identities.

Required bundle manifest fields are:
- `schema_id = pm.investigation_bundle.schema.v1`
- `bundle_id`
- `schema_version`
- `investigation_id`
- `final_state`
- `stop_reason_code`
- `target_summary`
- `phase_history`
- `context_items[]`
- `artifact_refs[]`
- `instrumentation_manifest[]`
- `verification_summary`
- `cleanup_state`
- `redaction_and_omission_summary`
- `fix_summary` with `status`, optional `diff_artifact_id`, `summary_text`, and optional `file_refs[]`
- `import_lineage` with optional `source_bundle_id`, optional `source_origin`, and optional `imported_at_utc`
- `omitted_items_summary` with `omitted_evidence_count`, `omitted_raw_payload_count`, and `omission_reason_codes[]`

Export and import rules:
- raw screenshots, traces, logs, recordings, and diffs remain stored and opened through the shared runtime-artifact system; the bundle manifest references them instead of duplicating bytes inline
- exporting an investigation writes `runtime_artifact.document` or equivalent manifest-linked metadata plus `debug.investigation.exported`
- Investigation `/open/export` actions use the same artifact routing and manifest identity: open resolves artifact refs to their owning surfaces, and export writes a manifest-backed bundle instead of flattening evidence into an undifferentiated file dump.
- importing a bundle creates an `imported_bundle` debug target and preserves provenance about the external source rather than pretending the bundle is a live local runtime target
- redacted, revoked, blocked, expired, and omitted items remain visible in the manifest summary so users can tell what was or was not carried forward

### 5B Export taxonomy and manifests

#### Acceptance carry-through
- Define record export, bundle export, and view export as distinct export classes
- Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure

### 5C External provider-native artifacts

User-created unmanaged GitHub Copilot instruction files are external/provider-native artifacts unless adopted into PM control: repository-wide `.github/copilot-instructions.md` / `/copilot-instructions.md` / `github/copilot-instructions.md`; path-scoped and path-specific provider instruction files such as `.github/instructions/*.instructions.md` / `github/instructions/*.instructions.md`; and broader `.github/instructions/*`, `/instructions/`, and `instructions.md` path forms.

User-created unmanaged `.github/agents/*` files, including `.github/agents/*.md` and `.github/agents/*.agent.md`, are also shown as external/provider-native artifacts unless they are adopted into PM control.

Rules:
- external/provider-native artifacts remain inspectable and linkable, but PM must not present them as PM-owned instruction projections or generated runtime artifacts
- GitHub custom agents are separate Markdown profiles in `.github/agents/*.agent.md` with YAML frontmatter, prompt body, optional tools, optional `mcp-server` configuration, and optional model selection; they remain provider-native until adopted into PM control
- adopting an unmanaged `.github/instructions/*`, `.github/agents/*`, or `.github/copilot-instructions.md` file into PM control changes its ownership state through the Agent-Config adoption flow
- leaving a file unmanaged preserves provider-native ownership and keeps drift/repair actions separate from PM-controlled projections
- implementation-ready parity for GitHub Copilot-native instruction targets treats `/copilot-instructions.md`, `github/copilot-instructions.md`, `github/instructions/*`, `github/instructions/*.instructions.md`, `github/agents/*`, `github/agents/*.md`, `/instructions/`, `instructions.md`, and `/agents/` path forms as provider-native artifacts until PM control is explicit

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/assistant-chat-design.md

## 6. reasoning_tokens and cost_usage
**reasoning_tokens:** Required in the usage/cost_usage schema (integer, minimum 0). In the UI, display the field only when value > 0.

**cost_usage artifact:** Attribution record only. It uses the same canonical usage identity and normalized fields as the app-wide Usage page, the thread-scoped Context Detail Pane, Ledger, Run Graph, and Orchestrator usage displays.

The artifact view must preserve segregated LLM usage buckets for input, output, cache_read, cache_write, and reasoning tokens. The display LESSON is that background ops and subagent LLM calls remain visible through the same usage identity; the panel may show parent totals, but it must also preserve the child/subagent event links that explain how costs aggregate to the parent.

Required actions for `cost_usage` items:
- **Show in Ledger** — navigate to the canonical Ledger surface with the matching usage identity in scope
- **Show in Usage** — navigate to either app-wide Usage or the canonical thread Context Detail Pane depending on artifact scope, preserving the same run/thread filters

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Rules:
- cost_usage artifacts do not create an artifact-local usage model
- thread-scoped cost_usage artifacts land on the same Context Detail Pane used by the chat context indicator `More Details` action
- app-wide cost_usage artifacts land on the canonical Usage page
- when cost is derived from normalized token buckets rather than authoritative provider pricing, user-facing thread surfaces label it as `Estimated Cost`
- `cost_usage` artifacts MUST carry `usage_event_ref` whenever available (`usage_event_ref?` in older optional notation). When traceable, they also carry `attempt_id`, `node_id`, and `provider_attempt_ref` so Usage, Ledger, Run Graph, and the Artifacts panel can explain who produced the artifact and why it exists in the execution graph.
- `Show in Ledger` and `Show in Usage` prefer `usage_event_ref` plus receipt/attempt/node identity over timestamp heuristics, run-only filters, or tier-only filters. `tier_id` may remain derived display/grouping compatibility only; it is not the primary cross-surface key for usage correlation.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
## 7. JSON schemas (all required)

**Envelope:** Plans/runtime_artifact_envelope.schema.json (`$id`: pm.runtime_artifact.envelope.v1). Common payload fields for all runtime artifact events.

**Per-type:** One file per artifact type, e.g. Plans/runtime_artifact_code_diff.schema.json through Plans/runtime_artifact_artifact_version.schema.json, with `$id`: pm.runtime_artifact.<type>.v1. Each payload is validated against the envelope plus the corresponding type schema. The cost_usage schema MUST include required reasoning_tokens (integer, minimum 0). All 19 type schemas are required; no optional schema files.

Implementation MUST validate every runtime_artifact.* event payload against the envelope and the matching type schema before appending to seglog and before writing to the artifacts index.

Schema-file materialization note: `Plans/runtime_artifact_envelope.schema.json` and the 19 per-type `Plans/runtime_artifact_<type>.schema.json` files are required implementation artifacts, not current live doc targets until those files exist. Until materialized, this section is the normative schema requirement; `Plans/storage-plan.md` owns the registered storage key families `artifacts_index.v1:{project_id}:{artifact_id}`, `artifacts_project_state.v1:{project_id}`, and `projector.checkpoint.runtime_artifacts:{project_id}`.

### Runtime-artifact envelope ownership

The runtime-artifact payload/schema-owner split resolves here: this document is the `/schema-owner` for the runtime-artifact payload envelope until `Plans/runtime_artifact_envelope.schema.json` and the 19 per-type `Plans/runtime_artifact_<type>.schema.json` files materialize. `Plans/Contracts_V0.md` owns the EventRecord wrapper and shared event vocabulary; `Plans/storage-plan.md` owns key registration and projector storage; neither owner may redefine runtime-artifact payload fields locally.

The common envelope pins `artifact_id`, `artifact_type`, canonical IDs, `run_id`, `thread_id?`, `node_id?`, `attempt_id`, `provider_attempt_ref?`, `usage_event_ref?`, receipt refs, producer/actor refs, content refs, projection fields, and routing refs. Per-type schemas may add required fields for a specific `runtime_artifact.*` family, but they must not drift from or override those envelope fields.

Spec-integrity rows that also name command `/catalog` ghost IDs, HITL executor canon, `/crosswalk/TOC` cleanup, glossary links, duplicated command families, or missing advertised sections stay with those owner docs. This panel owns only the runtime-artifact payload/schema-owner envelope and the artifact-panel routing contract.

### Runtime-artifact identity, index, and preview rules

Runtime artifact opens are identity-native. `OpenFile` remains a workspace-file source realization for concrete paths; generated artifacts, draft documents, checkpoints, search hits, runtime artifacts, and other object-backed subjects resolve through artifact/open identity first and then realize as `OpenSubject`, `OpenArtifact`, `generated://<artifact_id>`, or an owner-surface route as appropriate.

Evidence and artifact lists use independent virtualization and `/paging`. Heavy artifacts remain `metadata-first` until opened, and artifact previews are demand-loaded rather than `pre-rendered` for long lists. This keeps Evidence exact without forcing every artifact body into memory or preview rows before the user asks for it.

The artifact index is a projection for lookup, `/filter/navigation`, and panel recovery, not canonical artifact truth. It must be rebuildable from seglog and the runtime-artifact envelope; missing or `/corrupt` index rows degrade to `record-backed` views rather than implying artifact loss. The storage owner registers the `/index` key family, lifecycle, failure states, and `/rebuild` behavior as a first-class projection family.

Generated `/transient` artifacts, attempt-scoped evidence, and stable runtime identities carry open-by-identity fields that FileManager.md consumes without turning `OpenFile` into a universal object-open contract. If no concrete attempt exists, the envelope still carries the strongest available anchor: `thread_id` for thread-only artifacts and wizard/report identity for upstream planning artifacts when they are surfaced here.

`artifact_id` identifies the artifact object, not the runtime attempt. Runtime-artifact and project-artifact families stay distinct, with parallel discipline about canonical versus derived identity so a project-artifact projection cannot masquerade as runtime attempt identity and a runtime-artifact receipt cannot replace project output ownership.

Usage pivots normalize through object routing: source notation such as `object_kind = usage_event` and `object_id = <usage_event_ref or stable usage id>` resolves into canonical `object_kind`, `object_id`, and `usage_event_ref` fields rather than keeping `usage_event_ref` as a top-level route special case. On graph `/history` surfaces, `usage_event_ref` plus `attempt_id` is safer than `tier_id` as a Usage pivot. The normalized envelope supports object-first search, History versus Ledger distinction, deep-link routing, export manifests, and cross-tab inspectors without each surface inventing local payloads.

Project-summary `/freshness` disclosure is separate from underlying owner state. A project-summary card may show projector trust, freshness, or degraded projection health, but it must not imply that the source artifact, receipt, or runtime event is stale unless the owner record says so.

The runtime-artifact payload-owner triangle resolves through this schema ownership section plus storage `/registration`: this document owns payload fields, `Plans/storage-plan.md` owns key registration and projector storage, and `Plans/Contracts_V0.md` owns the EventRecord wrapper and shared event vocabulary. If a required schema family is missing, the mandate is recorded here until the schema files materialize; it is not softened silently by consumer docs.

## 8. Browser recordings
Browser recordings and adjacent browser evidence must preserve the canonical browser session distinction.

Rules:
- a recording created from `workspace_preview` or `detached_preview` retains the owning project/workspace/browser-session identity
- a recording created from `automation_session` or `auth_session` does not imply that the underlying browser session is a persistent shell browser tab
- screenshots, structured snapshots, traces, videos, and recordings emitted from browser sessions route through the shared runtime artifact pipeline rather than a browser-only store
- actions such as `Send to Chat`, `Open`, or `Focus Browser` must route back to the owning canonical browser session rather than inventing a separate artifact-owned browser shell
- Browser evidence preserves browser-runtime lineage (`/browser-runtime`) and agent-control provenance (`agent-control`) as metadata on the artifact, including `/persistence` state, requested/effective capability disclosure, and whether the source session was user-visible, `/watchable`, hidden, or degraded.
- Browser evidence does not revive stale browser source anchors as owners; stale lineage such as `Plans/newfeatures.md §15.18` and `/stale` belongs only in cleanup/cross-reference evidence that points back to the current browser owner set.

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

The accepted `parity-plus` differentiators for Runtime Artifacts are MVP scope, not deferred `nice-to-haves`.

## 10. References

- Plans/Contracts_V0.md (EventRecord envelope)
- Plans/storage-plan.md (event types, redb key, projector, cost_usage alignment)
- Plans/usage-feature.md (usage pipeline, Show in Ledger/Usage, Gap 3)
- Plans/Project_Output_Artifacts.md (distinction from Project Plan Package)
- Plans/FileManager.md (open by artifact identity)

## Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)


Receipt-like artifacts keep canonical runtime identity and bridge fields instead of inventing artifact-local lineage.

### operation_receipt_record envelope

`operation_receipt_record` is a projector and receipt-surface record derived from canonical events, not a replacement for them. Its key joins `run_id`, optional `attempt_id`, `action_family`, and `receipt_id`; the envelope remains cross-surface `/receipt` lineage for Ledger, Usage, Orchestrator, and owner panels.

Minimum identity fields are `receipt_id`, `run_id`, optional `attempt_id`, `action_family`, and `action_name`. Legacy `tier_id` may appear only as derived display/grouping compatibility metadata; it is not a receipt key, approval correlation key, or usage join. Requested and `/effective` fields include `requested_action`, `effective_action`, `requested_target`, `effective_target`, and optional `reason_code`.

SCM lineage fields include optional `repo_id`, `worktree_id`, `branch_name`, `head_commit_oid`, `baseline_commit_oid`, `compare_target_ref`, and `pr_ref`. GitHub Actions lineage fields include optional `workflow_id`, `workflow_name`, `workflow_path`, `workflow_run_id`, `run_attempt`, `job_id`, `job_name`, `failed_step_name`, and `event_name`. Docker lineage fields include optional `context_name`, `container_id`, `image_ref`, and `registry_host`.

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
- Usage-linked artifacts consume frozen `effective_*` runtime snapshot fields and `usage-source-confidence` fields; Agent-Config and Health may display live current values beside the artifact, but they must not rename or rewrite the frozen schema carried by the usage/runtime record.
