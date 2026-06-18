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
| **Runtime Artifacts** | Agent-run outputs in Artifacts panel | This document | seglog runtime_artifact.*, redb artifacts_index.v1:{project_id}:{artifact_id} |

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
- UI / projection / command contracts carried historical owner-gap evidence: earlier FinalGUISpec passes left `Tiers` as a standalone run-group view and lacked native concern-model, historical-run-mode, or Progress-only widget-boundary contracts. Current Orchestrator shell ownership lives in `Plans/Orchestrator_Page.md` and uses `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`; `Tiers` remains stale-disposition evidence only. `FinalGUISpec.md` also sharpens the projection-state naming issue: generic “projection trust” language will collide with existing preview/browser `trust_tier`; the cleaner split remains `projection_freshness` vs `projection_health`. `Runtime_Artifacts_Panel.md` now looks more fragile than earlier passes suggested: `attempt_id` is still absent from the canonical artifact ID set, producer identity is anonymous at the envelope boundary, `subagent_lineage` still has no minimum payload semantics, `cost_usage` drill-through still rests on optional `usage_event_ref`, and `/stale`, cross-surface, `UI_Command_Catalog.md`, UI_Command_Catalog, `cmd.*`, rewrite-era command families such as `cmd.account`, `cmd.account.*`, `cmd.concern`, `cmd.concern.*`, `cmd.promotion`, `cmd.promotion.*`, and `approve_continue` remain part of the artifact-panel gap surface.
- exact_items: - `Plans/interview-subagent-integration.md` does contain `### Runtime identity visibility`, but its required fields still stop at `requested_account_binding` / `operational_identity` and do not carry `requested_account_policy` or `tool_use_id`. - `Plans/assistant-chat-design.md` already carries `tool_use_id`, so gap-001's consumer deficiency is sharper than a blanket "missing everywhere" claim. - `Plans/usage-feature.md` still does not contain an exact `artifact drill-through section` heading. - `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/interview-subagent-integration.md` still do not contain the exact `validation artifact lineage`, `bridge-field viewer`, or `validation/report section` headings.
- Cross-surface usage/deep-link identity is now clearly under-typed: - `storage-plan.md` promotes `usage_event_ref?` into receipt and cross-surface bridge records but still never defines its concrete format or stability semantics - `Runtime_Artifacts_Panel.md` requires `Show in Ledger` / `Show in Usage` for `cost_usage`, but the promised runtime-artifact schemas are not present and no concrete usage identity payload is pinned - `Orchestrator_Page.md` and `Run_Graph_View.md` still route `View in Usage` by `run_id` or `tier_id`, not by receipt/attempt/usage-event identity
- Add the missing canonical record/projection families to `storage-plan.md` for worktree lifecycle and artifact index state before downstream docs keep inventing them implicitly.
- The earlier missing-family note that named `artifacts_index:v1:{project_id}` is retained as stale source-lineage evidence only; RAP-026 and the storage owner now use `artifacts_index.v1:{project_id}:{artifact_id}` for row identity, with the projector rebuilt from `runtime_artifact.*` events and the envelope/per-type schema family remaining the payload requirement until schema files materialize.
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
- The stale source-lineage claim that `Runtime_Artifacts_Panel.md` named `artifacts_index:v1:{project_id}` as canonical is resolved by the storage-owned `artifacts_index.v1:{project_id}:{artifact_id}` key family; this panel owns payload/open semantics and does not re-own storage key registration.
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
- The old `artifacts_index:v1:{project_id}` shorthand is too underspecified to function as row identity; the live contract uses `artifacts_index.v1:{project_id}:{artifact_id}` with row identity and projector ownership, while the shorthand is source-lineage evidence only.
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

SCM lineage fields include optional `repo_id`, `worktree_id`, `worktree_path`, `branch_name`, `branch_ref`, `branch_head_state`, `baseline_commit_oid`, `head_commit_oid`, `safe_point_id`, `changed_files`, `changed_paths`, `conflict_state`, `conflict_refs`, `rollback_available`, `rollback_ref`, `restore_command_or_action`, `compare_target_ref`, and `pr_ref`. GitHub Actions lineage fields include optional `workflow_id`, `workflow_name`, `workflow_path`, `workflow_run_id`, `run_attempt`, `job_id`, `job_name`, `failed_step_name`, and `event_name`. Docker lineage fields include optional `context_name`, `container_id`, `image_ref`, and `registry_host`.

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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Runtime_Artifacts_Panel.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### RAP-002 - Authority And Owner Preface

```yaml
{plan_unit_id: "RAP-002", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime_Artifacts_Panel.md is the Runtime Artifacts Panel SSOT and owner-section document; it preserves Puppet Master naming, deterministic defaults, required artifact envelope routing preference, and ContractRefs to Contracts, storage, usage, and Project Output Artifacts owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-002", "SP-001", "UF-001"], unblocks: [], acceptance_criteria: ["RAP-002 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "owner_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_authority", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifacts_authority_preface", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0001", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0002", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0006"], preserved_exact_tokens: ["Runtime Artifacts Panel — SSOT", "Canonical owner-section requirements", "Artifact envelope routing preference", "Puppet Master", "No open questions", "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md"]}
```

### RAP-003 - Purpose Scope And Family Boundary

```yaml
{plan_unit_id: "RAP-003", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "The Artifacts panel lists, previews, and links agent-produced runtime outputs without running agents; every listed artifact type is MVP-required, and Runtime Artifacts remain distinct from Project Plan Package artifacts and are indexed as projections rather than canonical artifact truth.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UCC-001"], unblocks: [], acceptance_criteria: ["RAP-003 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "artifact_family_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_scope", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifacts_purpose_scope_family_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0007"], preserved_exact_tokens: ["Artifacts panel", "does not run agents", "all artifact types listed are required for MVP", "Project Plan Package", "Runtime Artifacts", "artifacts_index.v1:{project_id}:{artifact_id}", "projection_freshness", "projection_health"], negative_constraints: ["Runtime artifact lookup/indexing remains a projection concern rather than canonical artifact truth."], preserved_contractrefs: ["ContractRef: Plans/Project_Output_Artifacts.md#Runtime Artifacts (GUI panel) — distinct from this document, Plans/storage-plan.md#Required redb keys"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Project_Output_Artifacts.md", "Plans/storage-plan.md"]}
```

### RAP-004 - Runtime Artifact Event Taxonomy

```yaml
{plan_unit_id: "RAP-004", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact events use Option 2 only: one exact runtime_artifact.* EventRecord type per required artifact family, with no generic runtime_artifact subtype field and all 19 artifact event names required for MVP.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-004 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "event_taxonomy_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_events", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifact_event_taxonomy", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0008"], preserved_exact_tokens: ["Option 2 only", "runtime_artifact.code_diff", "runtime_artifact.implementation_plan", "runtime_artifact.reasoning_summary", "runtime_artifact.validation_test", "runtime_artifact.screenshot", "runtime_artifact.evidence", "runtime_artifact.document", "runtime_artifact.restore_point", "runtime_artifact.browser_recording", "runtime_artifact.tool_llm_trace", "runtime_artifact.context_snapshot", "runtime_artifact.cost_usage", "runtime_artifact.hitl_approval", "runtime_artifact.failed_attempts", "runtime_artifact.subagent_lineage", "runtime_artifact.before_after_snapshot", "runtime_artifact.suggested_next_steps", "runtime_artifact.api_web_call", "runtime_artifact.artifact_version"], negative_constraints: ["No single generic runtime_artifact event with a subtype field."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]}
```

### RAP-005 - Artifact Index And Projector Families

```yaml
{plan_unit_id: "RAP-005", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact indexing uses exact indexed fields and registered families for artifacts_index, artifacts_project_state, and runtime_artifacts projector checkpoints; the index is rebuildable from canonical runtime evidence and preserves attempt_id and thread_id for attempt-native routing.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-005 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "artifact_index_registration_gap", reasoning_tier: "standard", context_scope: "runtime_artifact_index", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "artifact_index_projector_families", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0005", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0009", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0010", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0011"], preserved_exact_tokens: ["Artifacts index exact indexed fields", "redb key and projector", "artifacts_index", "artifacts_project_state", "runtime_artifacts projector checkpoint", "attempt_id", "thread_id"], negative_constraints: [], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/Contracts_V0.md"]}
```

### RAP-006 - Attribution Envelope Bridges

```yaml
{plan_unit_id: "RAP-006", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact attribution shares one bridge family across tool events, artifacts, receipts, and usage records, carrying run/attempt/thread/node/artifact/provider/usage anchors while keeping attempt_id, provider_attempt_ref, usage_event_ref, and receipt refs as bridges that do not replace the primary local artifact key.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001", "UF-001", "T-001"], unblocks: [], acceptance_criteria: ["RAP-006 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "attribution_bridge_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_attribution", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "attribution_envelope_bridges", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0004", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0012", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0013"], preserved_exact_tokens: ["attempt/provider/usage/receipt joins", "provider_attempt_ref", "usage_event_ref", "receipt refs", "attempt_id as local anchor"], negative_constraints: ["Bridge fields do not replace the primary local key.", "Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md", "Plans/usage-feature.md"]}
```

### RAP-007 - Route-State Versus Shell-State

```yaml
{plan_unit_id: "RAP-007", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact route-state resolves canonical IDs and object identity first; workspace-tab selection, docking, and layout restore are shell-state concerns layered underneath and must not replace artifact, receipt, usage, export, or route identity.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UCC-001", "ACD-008"], unblocks: [], acceptance_criteria: ["RAP-007 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "route_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_routing_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "route_state_shell_state_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0014"], preserved_exact_tokens: ["Route-state and shell-state boundary", "artifact_id", "run_id", "thread_id", "node_id?", "attempt_id", "receipt_id?", "provider_attempt_ref?", "usage_event_ref?", "Show in Usage", "Open in Source Control", "Resume Wizard", "View in Usage", "focus_thread_usage"], negative_constraints: ["Shell-state must not replace object identity or make the route model swallow the whole shell.", "Receipt-like exports and manifest-backed bundles must not mint shadow IDs."], preserved_contractrefs: [], compatibility_only_notes: ["focus_thread_usage and historical/current /current usage navigation labels remain lineage/compatibility only and normalize to current route/open command IDs."], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/UI_Command_Catalog.md", "Plans/assistant-chat-design.md"]}
```

### RAP-008 - Identity-Native Opens And Exports

```yaml
{plan_unit_id: "RAP-008", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact opens and exports are identity-native: artifact rows stay information-dense but selective, path-based opens remain for repo/workspace files, identity-based opens are canonical for runtime artifacts and generated evidence, export parameters never replace canonical refs, non-trivial bundles preserve IDs and refs, and usage_event_ref is the preferred cost-bearing bridge.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UCC-001", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-008 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "identity_open_export_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_identity_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "identity_native_opens_exports", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0015"], preserved_exact_tokens: ["information-dense", "path-based", "identity-based", "identity-preserving", "export-local", "usage_event_ref", "attempt_id", "provider_attempt_ref", "artifact_id", "safe-point/remediation"], negative_constraints: ["Runtime artifacts must not be forced through fake repo paths to survive cleanup, archive/remove, retention, or bundle moves.", "Non-trivial bundle exports MUST NOT mint export-local surrogate identities that hide source identity."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: ["FinalGUISpec Orchestrator page gaps, Tiers standalone run-group view, command-family gaps, and missing heading notes remain owner-gap evidence, not live command canon."], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/FileManager.md", "Plans/storage-plan.md", "Plans/usage-feature.md"]}
```

### RAP-009 - P5 Gap And Stale-Disposition Evidence

```yaml
{plan_unit_id: "RAP-009", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "P5 runtime-artifact identity recovery notes preserve owner-gap and stale-disposition evidence for projection state naming, attempt identity, producer attribution, subagent_lineage payload semantics, cost_usage drill-through, stale/cmd family gaps, artifact-index storage registration, and usage correlation drift; those notes are adjudication evidence and must not become new live command canon.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001"], unblocks: [], acceptance_criteria: ["RAP-009 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "stale_gap_promotion_risk", reasoning_tier: "standard", context_scope: "runtime_artifact_gap_evidence", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "p5_gap_stale_disposition_evidence", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0015"], preserved_exact_tokens: ["projection_freshness", "projection_health", "subagent_lineage", "cost_usage", "cmd.account.*", "cmd.concern.*", "cmd.promotion.*", "approve_continue", "Tiers", "artifacts_index:v1:{project_id}", "usage_event_ref"], negative_constraints: ["Owner-gap and stale-disposition notes must not be promoted into live command canon by this PlanUnit."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: ["Runtime_Artifacts_Panel.md still lacks attempt-level identity, producer attribution, trustworthy cost_usage linkage, and degraded/stale projector behavior.", "UI / projection / command contracts are structurally incomplete and under-owned."], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/FinalGUISpec.md", "Plans/UI_Command_Catalog.md", "Plans/usage-feature.md"]}
```

### RAP-010 - Retention Classes And Usage Bridge

```yaml
{plan_unit_id: "RAP-010", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifacts declare retention class durable, session_bounded, or ephemeral_view; cost-bearing and Usage/Ledger-pivotable artifacts carry stable usage_event_ref without replacing artifact_id or attempt_id, receipt-like artifacts preserve requested/effective/degradation fields, export defaults minimize sensitive/operational metadata, and ordering follows canonical receipt/event sequence.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UF-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-010 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "retention_usage_bridge_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_retention", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "retention_classes_usage_bridge", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0016"], preserved_exact_tokens: ["durable", "session_bounded", "ephemeral_view", "usage_event_ref", "requested_action", "effective_action", "effective_outcome", "source_occurred_at", "observed_at", "recorded_at"], negative_constraints: ["Runtime artifacts MUST NOT use usage_event_ref as a replacement artifact_id, attempt_id, or route primary key."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/usage-feature.md", "Plans/Contracts_V0.md"]}
```

### RAP-011 - Stream Audit And Instrumentation Boundaries

```yaml
{plan_unit_id: "RAP-011", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Streaming runtime artifacts preserve truncation and committed-offset/gap-rendering metadata; artifact audit visibility is a dedicated searchable log/audit surface; temporary instrumentation artifacts declare instrumentation_id, collector_state, lifecycle, evidence sink, cleanup/rollback, and Debug investigation refs, and runtime artifacts consume cross-cutting owner contracts without re-owning them.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UCC-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-011 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "stream_audit_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_audit_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "stream_audit_instrumentation_boundaries", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0016"], preserved_exact_tokens: ["truncation_state", "collector_state", "instrumentation_id", "artifact audit visibility", "follow", "paused_snapshot", "historical_view", "raw-content-vs-metadata"], negative_constraints: ["Debug instrumentation MUST NOT outlive its declared cleanup policy without an explicit failed-cleanup artifact or blocked recovery record."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: ["stale/live data signaling is consumed from owner docs rather than re-owned here."], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/UI_Command_Catalog.md"]}
```

### RAP-012 - Debug Investigation Grouping

```yaml
{plan_unit_id: "RAP-012", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Debug investigations group existing runtime artifacts by investigation_id, instrumentation_id, evidence_role, and verification_strength without inventing debug-only silos; context_snapshot, tool_llm_trace, failed_attempts, restore_point, before_after_snapshot, subagent_lineage, browser/session evidence, and open/focus routes remain owned by their canonical artifact/session surfaces.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-008", "SMPFS-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-012 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "debug_artifact_grouping_drift", reasoning_tier: "standard", context_scope: "debug_runtime_artifacts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "debug_investigation_grouping", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0017", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0018"], preserved_exact_tokens: ["investigation_id?", "instrumentation_id?", "evidence_role?", "verification_strength?", "tool_llm_trace", "context_snapshot", "failed_attempts", "restore_point", "before_after_snapshot", "browser_session_id", "terminal_session_id"], negative_constraints: ["Investigation grouping does not invent a new artifact family.", "Debug evidence artifact open/focus routes resolve back to canonical owner identities."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/assistant-chat-design.md", "Plans/Section15_MVP_Promoted_Features_Spec.md"]}
```

### RAP-013 - Investigation Bundle Manifest

```yaml
{plan_unit_id: "RAP-013", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Debug investigation bundle manifests preserve pm.investigation_bundle.schema.v1, bundle identity, final state, stop reason, target summary, phase history, context/artifact/instrumentation refs, verification and cleanup summaries, redaction/omission summaries, fix/import lineage, and visible omitted/redacted/revoked/blocked/expired item summaries without duplicating raw bytes inline.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-013 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "debug_manifest_drift", reasoning_tier: "standard", context_scope: "debug_runtime_artifacts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "investigation_bundle_manifest", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0018"], preserved_exact_tokens: ["pm.investigation_bundle.schema.v1", "bundle_id", "investigation_id", "final_state", "stop_reason_code", "artifact_refs[]", "instrumentation_manifest[]", "redaction_and_omission_summary", "omission_reason_codes[]", "debug.investigation.exported"], negative_constraints: ["Bundle exports reference shared runtime artifacts instead of duplicating bytes inline."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md"]}
```

### RAP-014 - Export Taxonomy And Manifests

```yaml
{plan_unit_id: "RAP-014", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact export taxonomy distinguishes record export, bundle export, and view export, and requires export manifests with export_id, export_kind, project scope, included IDs, and trust-state disclosure.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-014 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "export_manifest_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_export", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "export_taxonomy_manifests", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0003", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0019", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0020"], preserved_exact_tokens: ["Export taxonomy and manifest contract", "record export", "bundle export", "view export", "export_id", "export_kind", "trust-state disclosure"], negative_constraints: [], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md"]}
```

### RAP-015 - External Provider-Native Artifacts

```yaml
{plan_unit_id: "RAP-015", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Unmanaged GitHub Copilot instruction files, GitHub instruction path forms, and .github/agents files remain inspectable external/provider-native artifacts until adopted into PM control through Agent-Config; unmanaged ownership keeps drift/repair actions separate from PM-controlled projections.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "ACD-006"], unblocks: [], acceptance_criteria: ["RAP-015 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "provider_native_ownership_drift", reasoning_tier: "standard", context_scope: "external_provider_artifacts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "external_provider_native_artifacts", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0021"], preserved_exact_tokens: [".github/copilot-instructions.md", "/copilot-instructions.md", "github/instructions/*.instructions.md", ".github/agents/*.agent.md", "provider-native", "Agent-Config adoption flow"], negative_constraints: ["PM must not present unmanaged provider-native artifacts as PM-owned instruction projections or generated runtime artifacts."], preserved_contractrefs: ["ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/assistant-chat-design.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/FinalGUISpec.md", "Plans/Multi-Account.md", "Plans/assistant-chat-design.md"]}
```

### RAP-016 - Reasoning Tokens And Cost Usage

```yaml
{plan_unit_id: "RAP-016", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "reasoning_tokens is a required nonnegative usage/cost_usage field displayed only when nonzero; cost_usage artifacts are attribution-only records that reuse canonical usage identity and bucketed LLM usage links, preserve child/subagent cost links, and route Show in Ledger/Show in Usage through usage_event_ref plus receipt/attempt/node identity rather than timestamp, run-only, or tier-only filters.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UF-001", "UCC-001", "SP-001", "ACD-008"], unblocks: [], acceptance_criteria: ["RAP-016 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "cost_usage_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_usage_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "reasoning_tokens_cost_usage", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0022"], preserved_exact_tokens: ["reasoning_tokens", "cost_usage", "Show in Ledger", "Show in Usage", "input", "output", "cache_read", "cache_write", "Estimated Cost", "usage_event_ref", "tier_id"], negative_constraints: ["cost_usage artifacts do not create an artifact-local usage model.", "tier_id may remain derived display/grouping compatibility only; it is not the primary cross-surface key for usage correlation."], preserved_contractrefs: ["ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md"], compatibility_only_notes: ["usage_event_ref? older optional notation maps to canonical usage_event_ref when available."], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/usage-feature.md", "Plans/UI_Command_Catalog.md", "Plans/storage-plan.md", "Plans/assistant-chat-design.md"]}
```

### RAP-017 - JSON Schema Materialization

```yaml
{plan_unit_id: "RAP-017", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "The runtime-artifact envelope schema and all 19 per-type schemas are required implementation artifacts with stable $id values, and every runtime_artifact.* payload must validate against the envelope plus matching type schema before seglog append and artifacts-index writes; until files materialize, this section is normative and storage owns key-family registration.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-017 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "schema_materialization_gap", reasoning_tier: "standard", context_scope: "runtime_artifact_schema", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "json_schema_materialization", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0023"], preserved_exact_tokens: ["Plans/runtime_artifact_envelope.schema.json", "pm.runtime_artifact.envelope.v1", "Plans/runtime_artifact_<type>.schema.json", "pm.runtime_artifact.<type>.v1", "all 19 type schemas", "artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_project_state.v1:{project_id}", "projector.checkpoint.runtime_artifacts:{project_id}"], negative_constraints: ["All 19 type schemas are required; no optional schema files."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/Contracts_V0.md"]}
```

### RAP-018 - Payload Schema Owner Split

```yaml
{plan_unit_id: "RAP-018", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime_Artifacts_Panel.md owns the runtime-artifact payload envelope until schema files exist; Contracts_V0 owns the EventRecord wrapper and shared event vocabulary; storage-plan owns key registration and projector storage; no owner may locally redefine runtime-artifact payload fields, and spec-integrity rows for command/HITL/crosswalk/glossary gaps stay with their owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-018 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "schema_owner_boundary_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_schema_owner", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "payload_schema_owner_split", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0024"], preserved_exact_tokens: ["schema-owner", "artifact_id", "artifact_type", "run_id", "thread_id?", "node_id?", "attempt_id", "provider_attempt_ref?", "usage_event_ref?", "producer/actor refs", "projection fields", "routing refs"], negative_constraints: ["Contracts and storage owners may not redefine runtime-artifact payload fields locally."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]}
```

### RAP-019 - Identity-Native Open And Preview

```yaml
{plan_unit_id: "RAP-019", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact opens resolve by identity first: OpenFile remains a workspace-file realization, generated/object-backed subjects use OpenSubject, OpenArtifact, generated://artifact_id, or owner-surface routes, long lists use metadata-first demand-loaded previews and independent paging, and project-summary freshness disclosures must not imply source artifact, receipt, or runtime event staleness unless the owner record says so.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UCC-001", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-019 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "preview_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_preview_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "identity_native_open_preview", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0025"], preserved_exact_tokens: ["OpenFile", "OpenSubject", "OpenArtifact", "generated://<artifact_id>", "metadata-first", "pre-rendered", "record-backed", "project-summary /freshness"], negative_constraints: ["Project-summary freshness must not imply the source artifact, receipt, or runtime event is stale unless the owner record says so."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/FileManager.md", "Plans/UI_Command_Catalog.md"]}
```

### RAP-020 - Index Projection And Owner Triangle

```yaml
{plan_unit_id: "RAP-020", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "The artifact index is a rebuildable projection for lookup, filter/navigation, and panel recovery rather than canonical artifact truth; missing or corrupt index rows degrade to record-backed views, generated/transient artifacts carry strongest available open-by-identity anchors, runtime and project artifact families remain distinct, usage pivots normalize object_kind/object_id/usage_event_ref, and payload/storage/contracts owner boundaries stay fixed.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: true, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "CV-215", "UF-001"], unblocks: [], acceptance_criteria: ["RAP-020 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "artifact_index_projection_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_index", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "index_projection_owner_triangle", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0025"], preserved_exact_tokens: ["record-backed", "artifact_id", "attempt_id", "thread_id", "object_kind = usage_event", "object_id", "usage_event_ref", "History versus Ledger", "payload-owner triangle"], negative_constraints: ["A project-artifact projection cannot masquerade as runtime attempt identity and a runtime-artifact receipt cannot replace project output ownership."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/Contracts_V0.md", "Plans/usage-feature.md"]}
```

### RAP-021 - Browser Evidence Session Ownership

```yaml
{plan_unit_id: "RAP-021", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Browser recordings and adjacent browser evidence preserve canonical browser session distinction, source session class, project/workspace/browser-session identity, browser-runtime lineage, agent-control provenance, visibility/watchability/degradation metadata, and open/focus routing back to the owning browser session rather than an artifact-owned browser shell.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SMPFS-001", "SP-001", "UCC-001", "ACD-008", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-021 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "browser_artifact_identity_drift", reasoning_tier: "standard", context_scope: "browser_runtime_artifacts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "browser_evidence_session_ownership", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0026"], preserved_exact_tokens: ["workspace_preview", "detached_preview", "automation_session", "auth_session", "browser_session_id", "session_class", "profile_scope", "workspace_tab_id?", "capture_scope?", "runtime_artifact.browser_recording", "Plans/newfeatures.md §15.18", "/stale"], negative_constraints: ["Browser evidence does not revive stale browser source anchors as owners."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md", "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md", "ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md"], compatibility_only_notes: [], stale_retired_dispositions: ["Plans/newfeatures.md §15.18 and /stale belong only in cleanup/cross-reference evidence."], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Section15_MVP_Promoted_Features_Spec.md", "Plans/storage-plan.md", "Plans/UI_Command_Catalog.md", "Plans/assistant-chat-design.md", "Plans/Contracts_V0.md"]}
```

### RAP-022 - MVP Differentiators

```yaml
{plan_unit_id: "RAP-022", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "All runtime artifact differentiators identified in research are MVP scope and required, not optional or deferred nice-to-haves, with triggers, cardinality, error handling, sanitization, and UI edge cases specified per type as needed.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001"], unblocks: [], acceptance_criteria: ["RAP-022 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "mvp_scope_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_mvp", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "mvp_differentiators", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0027"], preserved_exact_tokens: ["All differentiators MVP", "MVP", "no optional differentiators", "parity-plus"], negative_constraints: ["Runtime artifact differentiators are not deferred nice-to-haves."], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md"]}
```

### RAP-023 - Reference Anchors

```yaml
{plan_unit_id: "RAP-023", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "The Runtime Artifacts references section preserves consumer routing to Contracts, storage, usage, Project Output Artifacts, and FileManager owner docs as source lineage and cross-owner routing, not new standalone behavior.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001", "UF-001"], unblocks: [], acceptance_criteria: ["RAP-023 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "reference_owner_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_references", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "reference_anchors", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0028"], preserved_exact_tokens: ["Plans/Contracts_V0.md", "Plans/storage-plan.md", "Plans/usage-feature.md", "Plans/Project_Output_Artifacts.md", "Plans/FileManager.md"], negative_constraints: [], preserved_contractrefs: [], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md", "Plans/usage-feature.md", "Plans/Project_Output_Artifacts.md", "Plans/FileManager.md"]}
```

### RAP-024 - Receipt Linkage And Bridge Viewer

```yaml
{plan_unit_id: "RAP-024", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Receipt-like artifacts preserve canonical runtime identity and bridge fields: operation_receipt_record is a derived projector/receipt-surface record, receipt/run/attempt/action fields are identity anchors, legacy tier_id is display/grouping compatibility only, bridge fields remain joins, open/focus routes through canonical receipt and usage identity, and frozen effective_* runtime snapshot and usage-source-confidence fields must not be renamed by live Agent-Config or Health values.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UF-001", "UCC-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-024 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "receipt_bridge_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_receipts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "receipt_linkage_bridge_viewer", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0029", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0030", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0031"], preserved_exact_tokens: ["operation_receipt_record", "receipt_id", "run_id", "attempt_id", "action_family", "action_name", "provider_attempt_ref", "usage_event_ref", "workflow_refs", "docker_refs", "kubernetes_refs", "workflow_run_id", "usage-source-confidence", "effective_*"], negative_constraints: ["Bridge fields remain joins rather than replacement primary keys.", "Legacy tier_id is not a receipt key, approval correlation key, or usage join.", "Agent-Config and Health must not rename or rewrite frozen schema carried by the usage/runtime record."], preserved_contractrefs: [], compatibility_only_notes: ["tier_id may appear only as derived display/grouping compatibility metadata."], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/usage-feature.md", "Plans/UI_Command_Catalog.md"]}
```

### RAP-001 - Runtime Artifacts Panel Retired Source-Preserving Bridge

```yaml
{plan_unit_id: "RAP-001", unit_type: "compatibility_disposition", status: "retired", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "RAP-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 167. Runtime_Artifacts_Panel-S0001 through Runtime_Artifacts_Panel-S0031 are covered by fine-grained PlanUnits RAP-002 through RAP-024 or explicit split coverage, while Runtime_Artifacts_Panel-S0032, S0033, and S0035 are generated structural/audit dispositions and Runtime_Artifacts_Panel-S0034 is retired bridge lineage. RAP-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.", gui_related: false, gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.", split_recommended: false, depends_on: ["RAP-002", "RAP-003", "RAP-004", "RAP-005", "RAP-006", "RAP-007", "RAP-008", "RAP-009", "RAP-010", "RAP-011", "RAP-012", "RAP-013", "RAP-014", "RAP-015", "RAP-016", "RAP-017", "RAP-018", "RAP-019", "RAP-020", "RAP-021", "RAP-022", "RAP-023", "RAP-024"], unblocks: [], acceptance_criteria: ["Runtime_Artifacts_Panel-S0001 through Runtime_Artifacts_Panel-S0031 remain mapped to fine-grained PlanUnits RAP-002 through RAP-024 or explicit split coverage rather than RAP-001.", "Runtime_Artifacts_Panel-S0032, S0033, and S0035 are structurally dispositioned as generated metadata.", "Runtime_Artifacts_Panel-S0034 is explicitly dispositioned as retired generated bridge lineage.", "RAP-001 no longer uses node_compile_hint.mode=source_preserving_planunit.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "residual_bridge_overreach", reasoning_tier: "standard", context_scope: "runtime_artifacts_retired_bridge", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "retired_source_preserving_bridge", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0032", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0033", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0034", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0035"], preserved_exact_tokens: ["Owner / Consumer Map", "PlanUnits", "Migration Coverage", "RAP-001", "Runtime Artifacts Panel — SSOT", "source_preserving_planunit", "retired_source_preserving_bridge", "source_preserving_bridge_retired", "Runtime_Artifacts_Panel-S0032", "Runtime_Artifacts_Panel-S0035", "tier_id", "usage_event_ref", "effective_*", "usage-source-confidence"], negative_constraints: ["RAP-001 must not provide product implementation coverage for Runtime_Artifacts_Panel-S0001 through Runtime_Artifacts_Panel-S0031.", "RAP-001 must not override RAP-002 through RAP-024 or structural dispositions.", "RAP-001 must not use source_preserving_planunit compile mode after Phase 2B batch 167."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md", "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md'", "ContractRef: Plans/Project_Output_Artifacts.md#Runtime Artifacts (GUI panel) — distinct from this document, Plans/storage-plan.md#Required redb keys'", "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/assistant-chat-design.md'", "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'"], compatibility_only_notes: ["The retired bridge remains only as migration-lineage compatibility metadata; historical ContractRefs, negative constraints, compatibility notes, stale/retired evidence, GUI-related bridge markers, tier_id compatibility, usage_event_ref, effective_* fields, and usage-source-confidence markers remain preserved in span_map and coverage_map."], stale_retired_dispositions: ["source_preserving_bridge_retired"], owner_hints: ["Plans/Runtime_Artifacts_Panel.md"]}
```

## Migration Coverage

Original hash: `b3e07aeee00362056ec43b4d5a7fefc895678e6e419f5f40d61ba937820a1bb1`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 166 atomized `Runtime_Artifacts_Panel-S0001` through `Runtime_Artifacts_Panel-S0031` into fine-grained PlanUnits `RAP-002` through `RAP-024`. Phase 2B batch 167 structurally dispositioned generated tail spans `Runtime_Artifacts_Panel-S0032`, `Runtime_Artifacts_Panel-S0033`, and `Runtime_Artifacts_Panel-S0035`, and retired `Runtime_Artifacts_Panel-S0034` as the `RAP-001` bridge lineage. `RAP-001` is migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-001

### RAP-025 - Structural Parent Section Recovery Compile Addendum

```yaml
plan_unit_id: RAP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime_Artifacts_Panel missing Section 2 and Section 5 parent headings are structural defects. Recovery is heading and anchor repair only:
  parent sections should point to existing artifact event, projector, schema, browser recording, differentiator, storage, and contract PlanUnits
  without creating new runtime artifact behavior.
gui_related: true
gui_classification_reason: Runtime Artifacts Panel is a user-visible panel, and missing section anchors affect visual/navigation documentation.
depends_on: [RAP-002, RAP-003]
unblocks: []
acceptance_criteria:
  - Section 2 and Section 5 anchors are restored or explicitly aliased without changing runtime artifact semantics.
  - Artifact envelope routing remains owned by Contracts and storage where applicable.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: structural_anchor_loss
reasoning_tier: low
context_scope: runtime_artifacts_doc_structure
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0035
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0036
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0037
preserved_exact_tokens: ["Runtime_Artifacts_Panel missing §2 and §5", "artifact envelope routing", "Browser recordings"]
negative_constraints:
  - Do not add new artifact kinds as part of heading recovery.
owner_hints: [Plans/Runtime_Artifacts_Panel.md]
```

## Ledger Compile Addendum - pldg-20260614-002

### RAP-026 - Artifacts Index Identity And Open Resolution

```yaml
plan_unit_id: RAP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The storage-owned row key family is `artifacts_index.v1:{project_id}:{artifact_id}`; the older
  `artifacts_index:v1:{project_id}` shorthand names only the project-level contract, not row identity.
  The index is a versioned rebuildable identity contract, not a vague lookup cache. Each row is keyed by
  `artifact_id` and must carry artifact_id, artifact_kind, artifact_identity_ref, project_id, run_id,
  package/seam/lane/worktree/account identity, producer/runtime refs, attempt_id, node_id,
  provider_attempt_ref when available, output owner, storage URI/path, provenance/evidence refs,
  lifecycle status, integrity/version data, trust state, open target, display/open handlers,
  preview capability, permissions/visibility boundary, permission/degraded state, and
  tombstone/rebuild metadata. Open-by-artifact-identity resolves through this index and then dispatches
  to FileManager, owner-surface routes, or generated/object-backed previews without replacing project
  output ownership.
gui_related: true
gui_classification_reason: Runtime artifact panel open actions, previews, degraded state, and permissions are user-visible panel behavior.
depends_on: [RAP-019, RAP-020, CV-281]
unblocks: []
acceptance_criteria:
  - The live storage key family is `artifacts_index.v1:{project_id}:{artifact_id}` and preserves `artifact_id` as row identity.
  - The artifacts index has a versioned row contract with project/run/package/seam/lane/worktree/account identity, runtime, owner, storage, provenance, lifecycle, integrity/version, permissions, open, preview, and rebuild fields.
  - Open-by-artifact-identity resolves through the index before dispatching to FileManager or owner-surface routes.
  - Missing or stale index rows degrade to record-backed views rather than becoming canonical artifact truth.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: artifact_identity_index_drift
reasoning_tier: high
context_scope: runtime_artifacts_index_open_by_identity
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md, Plans/storage-plan.md]
node_compile_hint: {mode: artifacts_index_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0040
  - pldg-20260614-002-part-3-fable-cleanup:atom-0051
  - pldg-20260614-002-part-3-fable-cleanup:atom-0097
  - pldg-20260614-002-part-3-fable-cleanup:atom-0098
preserved_exact_tokens: ["artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_index:v1:{project_id}", "artifact_id", "project/run/package/seam/lane/worktree/account identity", "artifact kind", "storage URI/path", "producer/runtime_identity", "provenance/evidence refs", "lifecycle status", "integrity/version data", "permissions/visibility boundary", "display/open handlers", "open-by-artifact-identity", "artifact_identity_ref", "FileManager", "FileManager open-by-artifact-identity resolution semantics", "sole canonical index contract"]
compatibility_only_notes:
  - "`artifacts_index:v1:{project_id}` is retained as source-lineage shorthand for the project-level index contract; storage owns the canonical row key family `artifacts_index.v1:{project_id}:{artifact_id}`."
negative_constraints:
  - Do not make the rebuildable artifacts index the sole source of artifact truth.
  - Do not let FileManager open project/runtime artifacts without artifact identity resolution.
  - Do not drop `artifact_id` row identity or replace the storage-owned dot/colon key family with a project-only shorthand.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md]
```

## Ledger Compile Addendum - pldg-20260616-002

### RAP-027 - Goal Runtime Receipt And Verification Evidence Projection

```yaml
plan_unit_id: RAP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects Goal Runtime receipt and verification evidence without becoming the receipt owner. It must expose WorkNodeReceipt, GoalCompletionReceipt, VerificationReceipt, validator evidence, adjudication records, repair cycles, restart records, model-switch evidence, skipped validator reasons, unresolved risks, certification status, and evidence taxonomy across acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence through artifact identity and open-by-artifact routing, with degraded views when underlying storage or contract records are stale.
gui_related: true
gui_classification_reason: Runtime Artifacts receipt, evidence, restart, and model-switch projection is a user-visible panel behavior.
depends_on:
  - RAP-024
  - RAP-026
  - CV-288
  - SP-215
  - GRS-027
unblocks: []
acceptance_criteria:
  - Runtime Artifacts can show WorkNodeReceipt and GoalCompletionReceipt references.
  - Runtime Artifacts can show VerificationReceipt references, skipped validator reasons, unresolved risks, and certification status.
  - Validator evidence, adjudication records, repair cycles, restart records, and model-switch evidence are visible through artifact identity.
  - Evidence projection distinguishes acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence.
  - Stale or missing owner records degrade the view rather than becoming artifact truth.
  - Runtime Artifacts does not replace Contracts_V0 or storage-plan receipt authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts receipt projection review
risk_class: receipt_projection_authority_drift
reasoning_tier: high
context_scope: goal_runtime_artifacts
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_runtime_receipt_artifact_projection
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0060
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0062
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
preserved_exact_tokens:
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "VerificationReceipt"
  - "validator evidence"
  - "adjudication records"
  - "repair cycles"
  - "skipped validator reasons"
  - "unresolved risks"
  - "certification status"
  - "acceptance criteria"
  - "live evidence"
  - "tests"
  - "diffs"
  - "validator outputs"
  - "canonical evidence"
  - "source evidence"
  - "process evidence"
  - "governance evidence"
  - "Runtime Artifacts"
  - "restart"
  - "model switch"
negative_constraints:
  - Do not let Runtime Artifacts replace receipt authority.
  - Do not hide stale owner records behind apparently final evidence.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### RAP-029 - Plans-To-Code Receipt And Test Evidence Projection

```yaml
plan_unit_id: RAP-029
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects plans-to-code receipts and automated-test evidence without becoming their owner. It displays PlanCompile receipts, ExecutorIntakeReport, source-control receipts, safe-point receipts, WorkNode change receipts, test run receipts, visual evidence, model resolution receipts, Auditor verification receipts, repair attempt receipts, merge/promotion receipts, WorkNode completion receipts, and GoalCompletionReceipt. Evidence projection distinguishes source evidence, canonical Plan evidence, process evidence, governance evidence, test evidence, source-control evidence, browser/device screenshots/logs, validator outputs, unresolved risks, skipped validator reasons, and final certification status, with degraded views when owner records are stale or missing.
  Runtime Artifacts distinguishes canonical evidence from source/process/governance/test/source-control evidence and can project browser/GUI/device sessions while keeping Playwright optional as test-tool context rather than receipt authority. It may display 100% automated completion claims, no human intervention assertions, all WorkNodes terminal status, and all automated tests passed evidence only as projections from owner receipts. Source-control projections include repo/worktree/branch/baseline/head/safe-point/changed-files/conflicts/rollback context only as owner-receipt fields.
gui_related: true
gui_classification_reason: Runtime Artifacts receipt, screenshot, visual evidence, skipped validator, and certification projections are user-visible panel behavior.
depends_on: [RAP-027, POA-047, POA-048, ATS-004, EP-103, GRS-030]
unblocks: [OP-024, F3-397]
acceptance_criteria:
  - Runtime Artifacts can project source-control, test, model, Auditor, repair, promotion, WorkNode, and completion receipts.
  - Browser/device screenshots, logs, visual evidence, validator outputs, unresolved risks, skipped validators, and final certification are visible through artifact identity.
  - Stale or missing owner records degrade the view instead of becoming final evidence.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Runtime Artifacts plans-to-code receipt projection review
risk_class: receipt_projection_authority_drift
reasoning_tier: high
context_scope: plans_to_code_runtime_artifacts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/Automated_Testing_System.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: plans_to_code_receipt_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0029
  - pldg-20260617-001-plans-to-code-handoff:atom-0031
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:atom-0040
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
preserved_exact_tokens:
  - "test_run_receipt"
  - "source-control receipt"
  - "changed-files"
  - "conflicts"
  - "rollback"
  - "model resolution receipt"
  - "GoalCompletionReceipt"
  - "visual evidence"
  - "browser/GUI/device sessions"
  - "screenshots"
  - "canonical evidence"
  - "process evidence"
  - "governance evidence"
  - "test evidence"
  - "100% automated"
  - "no human intervention"
  - "all WorkNodes terminal"
  - "all automated tests passed"
negative_constraints:
  - Do not let Runtime Artifacts replace receipt authority.
  - Do not hide stale owner records behind apparently final evidence.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Contracts_V0.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### RAP-030 - Visible Testing And Compile Evidence Projection

```yaml
plan_unit_id: RAP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: 'When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links. Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0096
- pldg-20260618-001-prd-planning-wizard:atom-0097
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0096
- atom-0097
decision_refs:
- dec-0019
correction_refs: []
preserved_exact_tokens:
- Open
- Watch
- interaction timeline
- redaction
negative_constraints:
- Do not expose credentials, tokens, personal data, or protected project content through visible testing.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```
