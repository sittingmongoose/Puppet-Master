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
- run_id (required for every artifact type except `restore_point`; optional attribution bridge for `restore_point`)
- attempt_id (required for every artifact type except `restore_point`; optional attribution bridge for `restore_point`)
- projection_freshness
- projection_health

For `restore_point`, `type_payload.restore_point_id` is the primary identity. Optional `run_id` and `attempt_id` preserve runtime attribution only; they do not become restore-point authority.

Canonical terms and values:
- seglog `runtime_artifact.*`
- artifacts_index.v1:{project_id}:{artifact_id}

Behavioral rules:
- Project Plan Package and Runtime Artifacts remain distinct families.
- Runtime artifact lookup/indexing remains a projection concern rather than canonical artifact truth.
## 3. Mechanism: one event type per artifact type


**Option 2 only:** One seglog event type per artifact type. No single generic `runtime_artifact` event with a subtype field. Each persisted event uses the canonical EventRecord envelope in `Plans/Contracts_V0.md#EventRecord`; this document owns the runtime-artifact event taxonomy and payload schema requirements, not the EventRecord field set. The persisted EventRecord `event_type` value is exactly one of the 19 event type names below.

Legacy/source-lineage tuple notation such as `schema`, `ts`, `seq`, `type`, `run_id`, `thread_id`, and `payload` is compatibility shorthand for older notes only; it is not normative EventRecord field canon, and new persisted EventRecord values use `event_type`, not `type`.

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


<a id="rap-4a-acceptance-carry-through"></a>
#### Acceptance carry-through
- Register artifacts_index, artifacts_project_state, and runtime_artifacts projector checkpoint families
- Make the artifact index rebuildable from canonical runtime evidence
- Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing

### 4B Runtime-artifact envelope and attribution packet

<a id="rap-4b-acceptance-carry-through"></a>
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

<a id="rap-5b-export-acceptance-carry-through"></a>
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
**reasoning_tokens:** Required in the usage/cost_usage schema as the JSON wire realization of the UF-085 `reasoning/thoughts` bucket (integer, minimum 0). It is a compatibility/wire alias for normalized reasoning usage, not an independent UsageEvent accounting field, source authority, or extra total. In the UI, display the reasoning/thoughts value only when value > 0 and the UsageRecord `counting_semantics` proves how it relates to `output_total`.

**cost_usage artifact:** Attribution record only. It uses the same canonical usage identity and normalized fields as the app-wide Usage page, the thread-scoped Context Detail Pane, Ledger, Run Graph, and Orchestrator usage displays.

The artifact view must preserve segregated LLM usage buckets for input, output, cache_read, cache_write, cache_write_1h/TTL where exposed, output_visible, and reasoning/thoughts (schema wire alias `reasoning_tokens`). The display LESSON is that background ops and subagent LLM calls remain visible through the same usage identity; the panel may show parent totals, but it must also preserve the child/subagent event links that explain how costs aggregate to the parent and must not add reasoning/thoughts back onto provider-inclusive output totals.

Required actions for `cost_usage` items:
- **Show in Ledger** — navigate to the canonical Ledger surface with the matching usage identity in scope
- **Show in Usage** — navigate to either app-wide Usage or the canonical thread Context Detail Pane depending on artifact scope, using `route_target.object_kind = usage_event` when `usage_event_ref` is available and preserving run/thread as filters only

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

Rules:
- cost_usage artifacts do not create an artifact-local usage model
- thread-scoped cost_usage artifacts land on the same Context Detail Pane used by the chat context indicator `More Details` action
- app-wide cost_usage artifacts land on the canonical Usage page
- when cost is derived from normalized token buckets rather than authoritative provider pricing, user-facing thread surfaces label it as `Estimated Cost`
- `cost_usage` type_payload MUST carry normalized `provider`, `usage`, `cost`, `quota`, `authority`, `refs`, and `flags` objects so raw provider payload retention/redaction, source confidence, settlement status, token-bucket semantics, pricing snapshot, unknown cost/quota, BYOK, subscription-hidden cost display, and provider-attempt correlation are schema-visible.
- `cost_usage` artifacts MUST carry `usage_event_ref` whenever available (`usage_event_ref?` in older optional notation). When traceable, they also carry `attempt_id`, `node_id`, and `provider_attempt_ref` so Usage, Ledger, Run Graph, and the Artifacts panel can explain who produced the artifact and why it exists in the execution graph.
- `Show in Ledger` and `Show in Usage` prefer `usage_event_ref` plus receipt/attempt/node identity over timestamp heuristics, run-only filters, or tier-only filters. `tier_id` may remain derived display/grouping compatibility only; it is not the primary cross-surface key for usage correlation.
- `tool_llm_trace` type_payload MUST carry a stable `trace_ref`, trace lifecycle fields, provider_attempt_ref, usage_event_ref when available, stream start/partial/final/error/abort timestamps or refs, raw provider payload/redaction refs, settlement link, and retry/escalation relation. It cannot pass validation with an unrelated non-empty payload.
- `api_web_call` type_payload MUST carry redacted request/response refs plus web operation discriminators: `web_operation`, `tool_id`, canonical `operation_input`, invocation provenance, success/denial state, provider fallback state, adapter IDs, cache/read/citation refs, and browser/PageRepresentation refs when the operation used Site Reader. `web_input` and `blocked_reason_code` are compatibility aliases only and normalize before persistence.
- `browser_recording` type_payload MUST carry `browser_session_id`, session class, visible/collapsed/detached/background/runtime-unavailable state, PM-native browser runtime state, Open/Watch/fallback evidence, action results, artifact refs, and redaction profile. Browser screenshots, PDF captures, console logs, and network traces may be separate artifacts, but they must rejoin the owning browser session and page representation.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
## 7. JSON schemas (all required)

**Envelope:** Plans/runtime_artifact_envelope.schema.json (`$id`: pm.runtime_artifact.envelope.v1). Common payload fields for all runtime artifact events.

**Per-type:** One file per artifact type, e.g. Plans/runtime_artifact_code_diff.schema.json through Plans/runtime_artifact_artifact_version.schema.json, with `$id`: pm.runtime_artifact.<type>.v1. Each payload is validated against the envelope plus the corresponding type schema. The cost_usage schema MUST include required `usage_event_ref`, normalized provider/usage/cost/quota/authority/refs/flags objects, and required `reasoning_tokens` (integer, minimum 0) as the schema wire alias for UF-085 `reasoning/thoughts`, backed by `counting_semantics` and no-double-count rules. The tool_llm_trace schema MUST include required `trace_ref`, trace lifecycle, provider-attempt, usage-settlement, retry/escalation, and raw-payload/redaction refs. The api_web_call and browser_recording schemas MUST reject arbitrary non-empty payloads and enforce their web operation / browser session discriminators. All 19 type schemas are required; no optional schema files.

Implementation MUST validate every runtime_artifact.* event payload against the envelope and the matching type schema before appending to seglog and before writing to the artifacts index.

Schema-file materialization note: `Plans/runtime_artifact_envelope.schema.json` and the 19 per-type `Plans/runtime_artifact_<type>.schema.json` files are current live doc targets now that they exist. This section remains normative for semantics, and the schema files must enforce the required per-type payload fields directly rather than allowing arbitrary non-empty `type_payload` objects. `Plans/storage-plan.md` owns the registered storage key families `artifacts_index.v1:{project_id}:{artifact_id}`, `artifacts_project_state.v1:{project_id}`, and `projector.checkpoint.runtime_artifacts:{project_id}`.

### Runtime-artifact envelope ownership

The runtime-artifact payload/schema-owner split resolves here: this document is the `/schema-owner` for the runtime-artifact payload envelope until `Plans/runtime_artifact_envelope.schema.json` and the 19 per-type `Plans/runtime_artifact_<type>.schema.json` files materialize. `Plans/Contracts_V0.md` owns the EventRecord wrapper and shared event vocabulary; `Plans/storage-plan.md` owns key registration and projector storage; neither owner may redefine runtime-artifact payload fields locally.

The common envelope pins `artifact_id`, `artifact_type`, canonical IDs, `thread_id?`, `node_id?`, `provider_attempt_ref?`, `usage_event_ref?`, receipt refs, producer/actor refs, content refs, projection fields, and routing refs. It requires `run_id` and `attempt_id` for every artifact family except `restore_point`; for `restore_point` each is an optional attribution bridge and `type_payload.restore_point_id` remains primary identity. Per-type schemas may add required fields for a specific `runtime_artifact.*` family, but they must not drift from or override those envelope fields.

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
- a recording created from ordinary `automation_session` does not imply that the underlying browser session is a persistent shell browser tab; protected `AuthBrowserSession` cannot produce a recording, screenshot, trace, DOM/PageRepresentation, console, network, storage, profile, or adjacent runtime artifact
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
- Usage-linked artifacts consume frozen `effective_*` runtime snapshot fields and `source_confidence` fields. The legacy `usage-source-confidence` spelling remains preserved only as compatibility/source-lineage vocabulary; Agent-Config and Health may display live current values beside the artifact, but they must not rename or rewrite the frozen schema carried by the usage/runtime record.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Runtime_Artifacts_Panel.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### RAP-002 - Authority And Owner Preface

```yaml
{plan_unit_id: "RAP-002", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime_Artifacts_Panel.md is the Runtime Artifacts Panel SSOT and owner-section document; it preserves Puppet Master naming, deterministic defaults, required artifact envelope routing preference, and ContractRefs to Contracts, storage, usage, and Project Output Artifacts owners.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-002", "SP-001", "UF-001"], unblocks: [], acceptance_criteria: ["RAP-002 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "owner_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_authority", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifacts_authority_preface", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0001", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0002", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0006"], preserved_exact_tokens: ["Runtime Artifacts Panel — SSOT", "Canonical owner-section requirements", "Artifact envelope routing preference", "Puppet Master", "No open questions", "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], negative_constraints: [], preserved_contractrefs: ["ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Project_Output_Artifacts.md"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md"]}
```

## Known-37 recovery artifact projection - 2026-07-18

The Runtime Artifacts panel exposes, by stable non-secret ref, the `safe_point.recovery_unavailable` event, recovery anchor, snapshot set, reason, preserved-work state, typed command result, verification evidence or confirmation authority, and `recovery_unavailable_resolution_receipt`. It preserves the owner ordering of `allowed_action_ids[]`; it does not derive membership from the presence of artifacts or offer ordinary restore/retry while the anchor remains recovery unavailable.

Locate success shows the verified snapshot refs, lowercase manifest SHA-256, verification evidence ref, exact `resolved` release, and committed receipt identity. Abandonment shows the actor/confirmation ref, exact `abandoned_by_user` release, preserved snapshot/local-work custody, and committed receipt identity. Both show `cleanup_performed = false`. Nonsuccess, receipt `not_committed`, an unresolved ref, or replay uncertainty leaves the anchor visibly `recovery_unavailable` and must not be represented as partial recovery, cleanup, or success. The panel is a read-only receipt/evidence consumer and cannot create an authority ref or release an anchor.

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into Runtime Artifacts Panel requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### RAP-032 - Provider Native Artifact Envelope Projection

```yaml
plan_unit_id: RAP-032
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts must be able to project provider-native artifact envelopes for generated media, provider receipts, streamed logs/events, model catalogs, route/probe evidence, support-state transitions, adoption/drift/blocked states, and repair/retry records. Artifacts reference provider_entry_id, account_profile_ref, model_id, media_route_id, requested/effective identity, source_confidence, verification_state, redaction_profile, and permission_snapshot_id while excluding secret material. Antigravity projections must distinguish public `agy` model catalog artifacts from the separate OAuth/internal `gemini-3.1-flash-image` generated-media route proof.
gui_related: true
gui_classification_reason: Runtime Artifacts Panel browsing/projection is user-visible GUI behavior.
depends_on: [CV-294, MGAC-094, UF-074]
unblocks: [POA-050]
acceptance_criteria:
  - Provider-native artifacts are browsable by route, provider, account/profile, model, and artifact family.
  - Generated media and route/probe evidence preserve provider metadata by reference.
  - Runtime artifacts never store API keys, OAuth URLs, tokens, or local account secrets.
  - Blocked, gated, partial-success, and retry/adoption/drift states remain visible.
  - Antigravity public `agy` catalog rows and internal generated-image proof are browsable as separate route/proof artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_artifact_projection_drift
reasoning_tier: high
context_scope: provider_native_runtime_artifacts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, future runtime artifacts panel, future provider artifact store]
node_compile_hint: {mode: provider_native_artifact_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0121
  - pldg-20260624-001-provider-updates:atom-0130
  - pldg-20260624-001-provider-updates:atom-0137
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0117, atom-0120, atom-0121, atom-0122, atom-0130, atom-0131, atom-0133, atom-0136, atom-0137, atom-0138, atom-0142, atom-0143]
preserved_exact_tokens: ["provider-native artifact", "generated media", "provider receipts", "streamed logs/events", "model catalogs", "route/probe evidence", "adoption/drift/blocked/repair states", "redaction_profile", "permission_snapshot_id", "source_confidence", "agy models", "gemini-3.1-flash-image"]
negative_constraints:
  - Do not store secret material in runtime artifact payloads.
  - Do not make Runtime Artifacts Panel the owner of provider behavior or media schema truth.
  - Do not flatten partial-success or gated provider states into generic failure.
  - Do not collapse public `agy` CLI catalog rows and unofficial/private Antigravity OAuth/internal image-generation rows into one proof state.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/Media_Generation_and_Capabilities.md, Plans/Project_Output_Artifacts.md]
```

### RAP-033 - Generated Media Receipt And Expiry Projection

```yaml
plan_unit_id: RAP-033
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Generated media artifacts must project provider receipt metadata, generation parameters, provider/base response status, trace/request id where available, hashes, durable local artifact refs, original provider URL refs, expiry warnings, partial success/failure counts, and provenance caveats. MiniMax Image-01 URL outputs require 24-hour expiry disclosure; OpenAI/Codex Images 2 routes require account/route distinction and C2PA/SynthID caveats; subscription-backed routes require support-state and terms-risk refs. Antigravity OAuth/internal `gemini-3.1-flash-image` receipts require private/unofficial endpoint caveats, non-secret request/proof refs, image dimensions/hash, and support-state labels.
gui_related: true
gui_classification_reason: Generated media artifact browsing, expiry warnings, and provenance presentation are user-visible GUI behavior.
depends_on: [RAP-032, MGAC-095, MGAC-096]
unblocks: []
acceptance_criteria:
  - Generated media receipts include route/account/model identity and non-secret provider metadata.
  - URL expiry and durable artifact capture status are visible.
  - Partial successes are represented with counts and failed-item metadata where available.
  - Provenance markers are represented as caveated metadata, not complete trust guarantees.
  - Antigravity internal generated-image receipts preserve route/account/model identity without storing OAuth/session material.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: generated_media_artifact_drift
reasoning_tier: high
context_scope: generated_media_runtime_artifacts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, future generated media artifact browser, future project output packaging]
node_compile_hint: {mode: generated_media_receipt_projection, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0133
  - pldg-20260624-001-provider-updates:atom-0136
  - pldg-20260624-001-provider-updates:atom-0137
  - pldg-20260624-001-provider-updates:atom-0142
source_atom_ids: [atom-0031, atom-0033, atom-0034, atom-0130, atom-0133, atom-0134, atom-0136, atom-0137, atom-0142]
preserved_exact_tokens: ["24-hour URL expiry", "partial success", "failed counts", "trace id", "base response status", "C2PA", "SynthID", "terms-risk", "OpenAI/Codex subscription", "MiniMax Image-01", "gemini-3.1-flash-image", "v1internal:generateContent", "1024x1024", "image/jpeg", "a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d"]
negative_constraints:
  - Do not treat expiring provider URLs as durable storage.
  - Do not overpromise C2PA or SynthID as complete durable provenance under all transformations.
  - Do not store subscription-route secrets in artifacts.
  - Do not store Antigravity OAuth tokens, refresh tokens, account identifiers, local credential paths, full HTTP payload logs, or secrets in artifacts.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/Media_Generation_and_Capabilities.md]
```

### RAP-003 - Purpose Scope And Family Boundary

```yaml
{plan_unit_id: "RAP-003", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "The Artifacts panel lists, previews, and links agent-produced runtime outputs without running agents; every listed artifact type is MVP-required, and Runtime Artifacts remain distinct from Project Plan Package artifacts and are indexed as projections rather than canonical artifact truth.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UCC-001"], unblocks: [], acceptance_criteria: ["RAP-003 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "artifact_family_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_scope", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifacts_purpose_scope_family_boundary", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0007"], preserved_exact_tokens: ["Artifacts panel", "does not run agents", "all artifact types listed are required for MVP", "Project Plan Package", "Runtime Artifacts", "artifacts_index.v1:{project_id}:{artifact_id}", "projection_freshness", "projection_health"], negative_constraints: ["Runtime artifact lookup/indexing remains a projection concern rather than canonical artifact truth."], preserved_contractrefs: ["ContractRef: Plans/Project_Output_Artifacts.md#Runtime Artifacts (GUI panel) — distinct from this document, Plans/storage-plan.md#Required redb keys"], compatibility_only_notes: [], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Project_Output_Artifacts.md", "Plans/storage-plan.md"]}
```

### RAP-004 - Runtime Artifact Event Taxonomy

```yaml
{plan_unit_id: "RAP-004", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Runtime artifact events use Option 2 only: one exact runtime_artifact.* EventRecord event_type value per required artifact family, with no generic runtime_artifact subtype field and all 19 artifact event names required for MVP; Contracts_V0 owns the EventRecord envelope field set.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "CV-215", "SP-001"], unblocks: [], acceptance_criteria: ["RAP-004 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "event_taxonomy_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_events", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "runtime_artifact_event_taxonomy", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0008"], preserved_exact_tokens: ["Option 2 only", "runtime_artifact.code_diff", "runtime_artifact.implementation_plan", "runtime_artifact.reasoning_summary", "runtime_artifact.validation_test", "runtime_artifact.screenshot", "runtime_artifact.evidence", "runtime_artifact.document", "runtime_artifact.restore_point", "runtime_artifact.browser_recording", "runtime_artifact.tool_llm_trace", "runtime_artifact.context_snapshot", "runtime_artifact.cost_usage", "runtime_artifact.hitl_approval", "runtime_artifact.failed_attempts", "runtime_artifact.subagent_lineage", "runtime_artifact.before_after_snapshot", "runtime_artifact.suggested_next_steps", "runtime_artifact.api_web_call", "runtime_artifact.artifact_version"], negative_constraints: ["No single generic runtime_artifact event with a subtype field.", "Runtime_Artifacts_Panel.md must not locally redefine EventRecord envelope fields or persist type as the EventRecord event name field."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord"], compatibility_only_notes: ["Legacy schema/ts/seq/type/run_id/thread_id/payload tuple notation is source-lineage shorthand only and not normative EventRecord field canon."], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]}
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
{plan_unit_id: "RAP-016", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "reasoning_tokens is the required nonnegative JSON wire realization of the UF-085 reasoning/thoughts usage bucket for usage/cost_usage schemas, displayed only when nonzero and interpreted through counting_semantics; cost_usage artifacts are attribution-only records that reuse canonical usage identity and bucketed LLM usage links, preserve child/subagent cost links, and route Show in Ledger/Show in Usage through usage_event_ref plus receipt/attempt/node identity rather than timestamp, run-only, or tier-only filters.", gui_related: true, gui_classification_reason: "This unit preserves user-visible GUI, UI, surface, workflow, or visual presentation requirements.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "UF-001", "UCC-001", "SP-001", "ACD-008"], unblocks: [], acceptance_criteria: ["RAP-016 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "cost_usage_identity_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_usage_gui", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "reasoning_tokens_cost_usage", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0022"], preserved_exact_tokens: ["reasoning_tokens", "cost_usage", "Show in Ledger", "Show in Usage", "input", "output", "cache_read", "cache_write", "Estimated Cost", "usage_event_ref", "tier_id"], negative_constraints: ["cost_usage artifacts do not create an artifact-local usage model.", "tier_id may remain derived display/grouping compatibility only; it is not the primary cross-surface key for usage correlation.", "reasoning_tokens must not become an independent active UsageEvent accounting field or be added to output_total when provider output is already inclusive."], preserved_contractrefs: ["ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md", "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md"], compatibility_only_notes: ["usage_event_ref? older optional notation maps to canonical usage_event_ref when available.", "reasoning_tokens is retained as the Runtime Artifact JSON wire alias for the UF-085 reasoning/thoughts bucket and is interpreted only through counting_semantics."], stale_retired_dispositions: [], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/usage-feature.md", "Plans/UI_Command_Catalog.md", "Plans/storage-plan.md", "Plans/assistant-chat-design.md"]}
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
{plan_unit_id: "RAP-021", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Ordinary Browser Program recordings and adjacent evidence preserve source session class, project/workspace/browser-session identity, PM-native runtime lineage, agent-control provenance, visibility/watchability/degradation metadata, and open/focus routing to the owning ordinary session. Protected AuthBrowserSession is structurally excluded from every artifact producer and may expose only redacted lifecycle or denial metadata outside its human-only surface.", gui_related: true, gui_classification_reason: "This unit preserves user-visible ordinary browser evidence and the protected authentication exclusion.", split_recommended: false, depends_on: ["SMPFS-143", "F3-512"], unblocks: [], acceptance_criteria: ["Ordinary browser artifacts require session_security_class=ordinary and exact browser subject identity.", "Protected AuthBrowserSession produces no recording, screenshot, trace, DOM/PageRepresentation, console, network, storage, profile, or Chat artifact.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["protected AuthBrowser artifact negative fixtures", "python3 scripts/pm-plan-index.py validate"], risk_class: "protected_auth_browser_artifact_escape", reasoning_tier: "high", context_scope: "runtime_browser_artifact_boundary", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md", "Plans/protected_auth_browser_contracts.schema.json"], node_compile_hint: {mode: "browser_evidence_session_ownership", create_worknodes: false, create_nodeseeds: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0026"], preserved_exact_tokens: ["workspace_preview", "detached_preview", "automation_session", "auth_session", "runtime_artifact.browser_recording"], negative_constraints: ["The auth_session token is legacy lineage only and grants no protected AuthBrowserSession artifact capability."], preserved_contractrefs: ["ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md"], compatibility_only_notes: [], stale_retired_dispositions: ["Legacy auth_session recording and adjacent evidence are retired."], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/Section15_MVP_Promoted_Features_Spec.md"]}
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
{plan_unit_id: "RAP-024", unit_type: "requirement", status: "accepted", owner_doc: "Plans/Runtime_Artifacts_Panel.md", canonical_text: "Receipt-like artifacts preserve canonical runtime identity and bridge fields: operation_receipt_record is a derived projector/receipt-surface record, receipt/run/attempt/action fields are identity anchors, legacy tier_id is display/grouping compatibility only, bridge fields remain joins, open/focus routes through canonical receipt and usage identity, and frozen effective_* runtime snapshot and source_confidence fields must not be renamed by live Agent-Config or Health values. The legacy usage-source-confidence spelling is compatibility/source-lineage vocabulary only.", gui_related: false, gui_classification_reason: "This unit preserves backend, runtime, policy, storage, provider, or ownership requirements rather than visual presentation.", split_recommended: false, depends_on: ["PDS-003", "PDS-004", "PDS-005", "PNC-001", "SP-001", "UF-001", "UCC-001", "CV-215"], unblocks: [], acceptance_criteria: ["RAP-024 remains addressable as a fine-grained Runtime Artifacts Panel PlanUnit with source-span coverage.", "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.", "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."], validation_surfaces: ["python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits", "python3 scripts/pm-plan-index.py validate"], risk_class: "receipt_bridge_drift", reasoning_tier: "standard", context_scope: "runtime_artifact_receipts", implementation_surfaces: ["Plans/Runtime_Artifacts_Panel.md"], node_compile_hint: {mode: "receipt_linkage_bridge_viewer", create_worknodes: false}, source_lineage: ["Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0029", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0030", "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Runtime_Artifacts_Panel-S0031"], preserved_exact_tokens: ["operation_receipt_record", "receipt_id", "run_id", "attempt_id", "action_family", "action_name", "provider_attempt_ref", "usage_event_ref", "workflow_refs", "docker_refs", "kubernetes_refs", "workflow_run_id", "usage-source-confidence", "source_confidence", "effective_*"], negative_constraints: ["Bridge fields remain joins rather than replacement primary keys.", "Legacy tier_id is not a receipt key, approval correlation key, or usage join.", "Agent-Config and Health must not rename or rewrite frozen schema carried by the usage/runtime record.", "Do not treat usage-source-confidence as the active runtime artifact schema field name."], preserved_contractrefs: [], compatibility_only_notes: ["tier_id may appear only as derived display/grouping compatibility metadata.", "usage-source-confidence is preserved only as compatibility/source-lineage vocabulary; active provider artifact and usage records use source_confidence."], stale_retired_dispositions: ["usage-source-confidence spelling retired in favor of source_confidence"], owner_hints: ["Plans/Runtime_Artifacts_Panel.md", "Plans/storage-plan.md", "Plans/usage-feature.md", "Plans/UI_Command_Catalog.md"]}
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
  Runtime Artifacts distinguishes canonical evidence from source/process/governance/test/source-control evidence and can project browser/GUI/device sessions while attributing generic external-Project test-tool context to the owning Project process rather than treating it as receipt or PM Browser authority. It may display 100% automated completion claims, no human intervention assertions, all WorkNodes terminal status, and all automated tests passed evidence only as projections from owner receipts. Source-control projections include repo/worktree/branch/baseline/head/safe-point/changed-files/conflicts/rollback context only as owner-receipt fields.
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
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
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

## Ledger Compile Addendum - pldg-20260622-001-fff

### RAP-031 - Discovery Receipt Browsing, Redaction, And Retention Projection

```yaml
plan_unit_id: RAP-031
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts may browse persisted discovery receipts, fallback summaries, selected opaque ids, redacted candidate counts, freshness/fallback/policy state, remote/SSH identity, permission snapshot, host trust state, elapsed/budget fields, and exact-verification links when receipt persistence is promoted. Runtime Artifacts consumes the DiscoveryService receipt envelope but does not own DiscoveryService behavior. Assistant Chat visibility settings never delete or hide durable audit receipts; frecency/history reset stops future ranking use for the selected identity without deleting durable redacted discovery receipts by default unless a separate retention/export/delete owner action applies.
gui_related: true
gui_classification_reason: This is user-visible receipt browsing, redaction, and artifact projection.
depends_on: [CV-291, SP-217, F2-191, PS-118, ACD-422]
unblocks: [ATS-011]
acceptance_criteria:
  - Discovery receipts remain browseable in Runtime Artifacts/audit views when persisted even if Assistant Chat routine inline activity is hidden.
  - Receipt browsing respects redaction_profile, policy_context, and permission_snapshot_id.
  - Discovery receipts link to exact verification receipts and final relevant summaries when available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Runtime Artifacts receipt browsing tests.
  - Future Assistant Chat inline display off but durable receipt available test.
risk_class: receipt_redaction_retention_drift
reasoning_tier: standard
context_scope: discovery_receipts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, future runtime artifact receipt browser]
node_compile_hint: {mode: receipt_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0063
  - pldg-20260622-001-fff:atom-0067
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#runtime_artifacts_and_audit
source_atom_ids: [atom-0043, atom-0045, atom-0058, atom-0063, atom-0067, atom-0086, atom-0090, atom-0093]
preserved_exact_tokens: ["discovery.invoked", "discovery.candidates_returned", "discovery.selected", "discovery.fallback", "discovery.verified", "candidate_count", "selected_result_ids", "redaction_profile", "permission_snapshot_id", "host trust state", "verification_receipt_ref", "Assistant Chat visibility settings never delete or hide durable audit receipts"]
negative_constraints:
  - Do not make Runtime Artifacts Panel the DiscoveryService behavior owner.
  - Do not bypass redaction.
  - Do not make hiding Assistant Chat routine activity delete durable receipts.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/assistant-chat-design.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### RAP-034 - History Runtime Artifact And Evidence Projection

```yaml
plan_unit_id: RAP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: History rows preserve links to runtime artifacts, evidence, ledger/raw records, usage, package manifests,
  and receipts through stable source refs rather than path-only summaries. The Runtime Artifacts surface consumes
  the unified History projection for preview/inspect affordances while resolving immutable source records for opens,
  evidence profiles, exports, and authority-gated actions. Raw records and evidence are included in exports only
  through an explicit evidence/redaction profile.
gui_related: true
gui_classification_reason: Runtime artifact/evidence links are user-visible panels and inspector content.
depends_on:
- OP-026
- SP-219
- POA-051
unblocks:
- OP-027
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_artifact_link_loss
reasoning_tier: standard
context_scope: history_runtime_artifacts
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future History artifact/evidence inspector
node_compile_hint:
  mode: history_artifact_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0012
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0042
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0048
- pldg-20260626-001-feature-name:atom-0049
- pldg-20260626-001-feature-name:atom-0062
- chat:misc-history-scope
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- chat:history-defaults-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-source-index-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0009
- atom-0012
- atom-0017
- atom-0038
- atom-0041
- atom-0042
- atom-0047
- atom-0048
- atom-0049
- atom-0062
decision_refs:
- dec-0002
- dec-0003
- dec-0006
- dec-0007
- dec-0008
- dec-0011
- dec-0012
preserved_exact_tokens:
- historical orchestrator runs in PM
- historical orchestrator runs
- Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when
  they get there."
- artifact_id
- run_id
- thread_id
- attempt_id
- identity-based open
- History versus Ledger
- All of that.
- status/date/project search
- opening artifacts/evidence
- resuming/retrying
- cloning as a new run
- exporting
- viewing what happened
- all of thodse
- selected-row export
- multi-select bundle export
- whole filtered-view export
- manifest
- yes, and yes.
- zip+manifest
- JSON
- rendered Markdown/HTML/PDF
- raw records/evidence
- explicit evidence/redaction profile
- 'yes'
- project-scoped unified History index/projection
- source-of-truth shape
- immutable wizard, run, artifact, evidence, and lineage records
- History surface
- filters
- exports
- compare
- artifact
- evidence
- permissions/redaction profile details
negative_constraints:
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not use shell-state, current tab, filesystem path, or timestamp heuristics as the primary identity for historical
  documents or runs.
- Do not mint shadow IDs for manifest-backed bundles or receipt-like historical objects.
- Do not reduce historical runs to read-only summaries when the user needs action routes.
- Do not omit evidence/artifact/Ledger pivots from historical run rows.
- Do not limit MVP export to selected-row-only.
- Do not make whole filtered-view export omit the active filter context.
- Do not collapse export into only one opaque archive format.
- Do not omit the manifest from archive/zip exports.
- Do not silently include raw records or evidence in ordinary exports.
- Do not bypass permissions or redaction policy when exporting evidence/raw records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not duplicate mutable source-of-truth content into the projection as if it were authoritative.
- Do not lose canonical IDs or lineage refs when projecting History rows.
- Do not mutate historical records through projection updates.
- Do not let UI rows, exports, or compare flows drift into different identity models.
- Do not open or export stale copies without resolving preserved source refs and currentness/authority checks where
  required.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### RAP-035 - Vision Bridge Derived Description Artifacts

```yaml
plan_unit_id: RAP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Each generated vision description is persisted as an inspectable runtime artifact or tool/LLM trace
  entry with source image ref/hash, prompt or question, bridge provider/model/account, timestamp, usage/cost refs
  when available, freshness/staleness, cached/newly generated state, and permission/degraded state. Cache keys include
  source image content hash, source ref, bridge prompt/question, requested language/detail mode, bridge provider/model/version,
  redaction/sensitivity class, and relevant permission scope. Reruns create new versions rather than mutating old
  derived descriptions in place.
gui_related: true
gui_classification_reason: Vision-description artifacts, cache state, source chips, inspect, and rerun controls
  are user-visible.
depends_on:
- T-165
- CV-296
- PS-121
unblocks:
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_artifact_lineage_loss
reasoning_tier: standard
context_scope: vision_bridge_artifacts
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future derived vision-description artifact rows
node_compile_hint:
  mode: vision_description_artifact
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0076
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0084
- pldg-20260626-001-feature-name:atom-0153
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:opencode-see-image-request
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0076
- atom-0078
- atom-0084
- atom-0153
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
- dec-0024
preserved_exact_tokens:
- runtime artifact
- tool/LLM trace
- source image ref/hash
- prompt/question
- provider/model/account
- cost/usage
- cached
- newly generated
- 4. Yes
- GUI
- provider/model used
- derived description
- source image/artifact link
- freshness/cache state
- inspect
- rerun with a question
- copy description
- attach result
- always accept
- stops asking
- source image content hash
- source ref
- bridge prompt/question
- provider/model/version
- redaction/sensitivity class
- rerunnable
- stale
- superseded/deleted
- 'yes'
- Screenshot to Chat
- composer-chip
- activity-card
- Requested Model
- Effective Model
- inspect/rerun
- provider/model disclosure
negative_constraints:
- Do not make the derived description invisible or unauditable.
- Do not lose source lineage between the image and the generated text description.
- Do not reuse a cached description when the source image, question, or bridge model changed without marking freshness.
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not reuse a cached description after the source image, prompt/question, bridge model/version, redaction class,
  or permission scope changes without marking freshness.
- Do not hide cache reuse from the user.
- Do not mutate old derived descriptions in place when rerun creates a new version.
- Do not make vision bridge artifacts feel like detached plugin output.
- Do not hide requested/effective model or fallback state when the bridge uses a separate vision-capable route.
- Do not replace accepted PM-owned permission/disclosure behavior with PMConcept demo-only controls.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Tools.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
```

### RAP-036 - Teacher Activity Transparency Projection

```yaml
plan_unit_id: RAP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Teacher activity such as route opens, highlights, source lookups, permission waits, model fallback,
  missing coverage, memory save prompts, and handoffs is represented as compact Assistant Chat cards or rows with
  durable detail payloads. Important blocked or degraded activity remains visible in the thread and can be inspected
  later without forcing the user into raw traces.
gui_related: true
gui_classification_reason: Teacher activity rows/cards and durable detail payloads are user-visible runtime projections.
depends_on:
- ACD-426
- CV-297
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_activity_trace_gap
reasoning_tier: standard
context_scope: teacher_activity_projection
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future Teacher activity detail rows
node_compile_hint:
  mode: teacher_activity_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0099
- pldg-20260626-001-feature-name:atom-0107
- pldg-20260626-001-feature-name:atom-0145
- pldg-20260626-001-feature-name:atom-0147
- chat:teacher-feature-initial-framing
- memory:MEMORY.md:365
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- chat:teach-visual-specificity-challenge
- chat:work-through-teach-gaps
- Plans/Runtime_Artifacts_Panel.md#artifact-audit-visibility
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/Personas.md#11.8-teacher
source_atom_ids:
- atom-0099
- atom-0107
- atom-0145
- atom-0147
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
preserved_exact_tokens:
- assistant chat threads
- show what its doing
- blocked
- skipped
- requires confirmation
- handoff
- How it will show the user
- Opening Settings > Models
- Highlighting
- Waiting for confirmation
- Blocked
- Handing off
- Teacher activity
- source lookups
- permission waits
- model fallback
- missing coverage
- memory save prompts
- handoffs
- collapsible detail
- hand off
- implementation/build work
- high-reasoning architecture decisions
- audit/repair
- external research
- direct execution
- specialty tooling
- suggested destination Persona
- stronger model
negative_constraints:
- Do not let Teacher silently manipulate or navigate the GUI with no chat-visible activity trail.
- Do not hide blocked/skipped reasons or requested/effective Persona/model state when they affect the teaching flow.
- Do not let a low-end Teacher model continue silently when the task has become implementation/build work requiring
  handoff.
- Do not make GUI guidance silent or invisible in the chat thread.
- Do not show vague activity text when PM knows the route/control/action.
- Do not hide blocked, skipped, fallback, or handoff state.
- Do not make Teacher GUI actions silent.
- Do not hide blocked/degraded activity rows after the immediate step passes.
- Do not force users into raw traces for normal teaching transparency.
- Do not let Teacher quietly become a builder or auditor.
- Do not silently switch Persona/model/tool path without disclosure.
- Do not discard Teacher context during handoff.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Personas.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/Models_System.md
```

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Runtime Artifacts owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### RAP-037 - Inline Visualizer Artifact Projection And Export Routing

```yaml
plan_unit_id: RAP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Inline visualizer v2 artifacts appear in runtime artifact projections with source fragment identity, title/type/version,
  render config, approved bridge metadata, current fallback or error state, replay/re-render status, export availability,
  and snapshot fallback provenance when re-render is impractical. The projection does not expose raw iframe heap,
  same-origin storage, secrets, unredacted diagnostics, or parent DOM/localStorage access.
gui_related: true
gui_classification_reason: Runtime artifact rows/projections and export availability are visible UI.
depends_on: [ACD-427, CV-300, SP-221, PS-123]
unblocks: [ATS-015]
acceptance_criteria:
  - Visualizer artifacts can be inspected and exported without exposing private iframe or parent state.
  - Replay status distinguishes re-rendered source/config from snapshot fallback.
  - Degraded or failed visualizers keep visible fallback/error provenance.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer artifact projection fixtures
risk_class: inline_visualizer_artifact_projection_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_runtime_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future runtime artifact rows
node_compile_hint:
  mode: inline_visualizer_v2_artifact_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-persistence-reload-security
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0060, atom-0088]
preserved_exact_tokens:
  - "source fragment"
  - "title/type/version"
  - "render config"
  - "approved bridge metadata"
  - "snapshot fallback"
  - "raw parent localStorage"
negative_constraints:
  - Do not expose raw iframe heap or parent DOM/localStorage state in artifact projections.
  - Do not hide degraded or failed visualizer provenance inside opaque logs only.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
```

### RAP-038 - DRY Method Receipt And Disclosure Projection

```yaml
plan_unit_id: RAP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime artifacts and run detail projections expose DRY Method receipt state when it materially affects a turn,
  including `dry_method_effective_state`, `dry_method_reason`, `dry_method_source_refs`, `instruction_bundle_ref`,
  `rules_application_sha256`, and `rules_project_sha256`. Projection labels distinguish applied, not_material,
  degraded_rules_missing, degraded_rules_stale, disabled_by_user, blocked_owner_unresolved, and
  caveated_owner_unresolved without flooding routine turns.
gui_related: true
gui_classification_reason: Run detail projection labels and receipt inspection are user-visible UI.
depends_on: [ACD-429, CV-299, SP-223]
unblocks: [ATS-018]
acceptance_criteria:
  - DRY receipt fields are inspectable when DRY affects trust, mutation, or routing.
  - Routine not_material state can stay in detail/provenance rather than chat message text.
  - Missing/stale rules and unresolved owner/source route states are visibly distinct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY receipt projection fixtures
risk_class: dry_method_projection_gap
reasoning_tier: high
context_scope: dry_method_runtime_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future run detail projections
node_compile_hint:
  mode: dry_method_receipt_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-rules-provenance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0074, atom-0075, atom-0089]
preserved_exact_tokens:
  - "dry_method_effective_state"
  - "dry_method_reason"
  - "dry_method_source_refs"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
  - "degraded_rules_missing"
  - "degraded_rules_stale"
  - "disabled_by_user"
  - "blocked_owner_unresolved"
  - "caveated_owner_unresolved"
negative_constraints:
  - Do not hide trust-affecting missing/stale DRY state in logs only.
  - Do not flood routine turns when DRY has no material effect.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### RAP-039 - Notification Delivery Receipt Projection And Export Routing

```yaml
plan_unit_id: RAP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects NotificationDeliveryAttemptReceipt and notification/sound test-send/export evidence without
  becoming the delivery, storage, permission, or alert-state owner. Notification delivery receipt artifacts preserve
  delivery_attempt_id, source_event_ref, destination id, provider kind, event category, status class, HTTP status,
  provider request/message id when available, retry count, next retry time, redaction profile, request digest, response
  digest, idempotency key, and secret refs only. The projection exposes inspect, Show in Ledger, Show source event, and
  export routes through canonical receipt/source refs, marks mock versus live test-send evidence, and redacts raw
  secrets, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, and unredacted
  identities from rows, previews, exports, and screenshots.
gui_related: true
gui_classification_reason: Runtime artifact rows, receipt inspection, export availability, and test-send evidence projection are user-visible UI.
depends_on: [CV-298, SP-222, PS-124]
unblocks: [ATS-016]
acceptance_criteria:
  - Notification delivery receipts are inspectable and exportable through Runtime Artifacts without replacing contract, storage, or permission authority.
  - Test-send evidence distinguishes mock delivery, live delivery, provider error, retry, and permanent failure states.
  - Exported receipt bundles preserve canonical receipt/source refs and disclose redactions or omitted evidence.
  - Secret material, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, and unredacted identities never appear in rows, previews, exports, or screenshots.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification delivery receipt Runtime Artifacts projection fixtures
risk_class: notification_receipt_projection_gap
reasoning_tier: high
context_scope: notifications_sounds_receipt_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future Runtime Artifacts notification receipt rows
node_compile_hint:
  mode: notification_delivery_receipt_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-destination-record-schema
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-retry-rate-receipt-contract
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
source_atom_ids: [atom-0061, atom-0062, atom-0063, atom-0069, atom-0091]
preserved_exact_tokens:
  - "NotificationDeliveryAttemptReceipt"
  - "delivery_attempt_id"
  - "source_event_ref"
  - "HTTP status"
  - "provider request/message id"
  - "retry count"
  - "redaction profile"
  - "request digest"
  - "response digest"
  - "secret refs only"
  - "test-send"
  - "export"
negative_constraints:
  - Do not make Runtime Artifacts Panel the owner of notification delivery, storage, credential custody, or alert-state truth.
  - Do not expose raw secrets, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, or unredacted identities.
  - Do not represent mock delivery as live provider success.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models runtime artifact and diagnostic projections. It does not make Runtime Artifacts Panel the owner of routing, storage, permissions, or model precedence, and it does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### RAP-040 - Free Models Auto Apply Diagnostics And Runtime Evidence Projection

```yaml
plan_unit_id: RAP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts and Advanced/Support diagnostics project Free Models Auto Apply evidence including last successful source/ref/hash, last failed check time, error class, affected provider/model ids, route impact, import diff, activation receipt, quarantine/rollback refs, and redacted copy/export with redaction summary. Normal UI remains plain and passive for successful checks, routine automatic failures, and repeated background check failures unless routing availability is affected.
gui_related: true
gui_classification_reason: Runtime Artifacts Panel and Advanced/Support diagnostics are user-visible panels/projections.
depends_on: []
unblocks: []
acceptance_criteria:
  - Successful validated Auto Apply updates appear as passive timestamps in normal settings, while details remain in Advanced/Support.
  - Quarantined or failed updates expose route impact and redacted evidence without raw secrets/tokens.
  - Repeated automatic background check failures remain passive in normal UI and move to Advanced/Support diagnostics unless routing availability is affected.
  - Diagnostics copy/export includes a redaction summary.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models diagnostics projection fixtures
  - Redacted copy/export fixtures
risk_class: diagnostics_projection_drift
reasoning_tier: high
context_scope: free_models_auto_apply_diagnostics
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_auto_apply_diagnostics_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0077, atom-0081, atom-0083, atom-0087, atom-0093, atom-0097, atom-0116, atom-0121, atom-0125, atom-0129, atom-0133, atom-0137, atom-0177, atom-0178, atom-0179, atom-0180, atom-0181, atom-0182, atom-0183, atom-0184, atom-0186, atom-0187, atom-0190, atom-0191, atom-0225, atom-0229, atom-0233, atom-0237, atom-0241, atom-0245, atom-0249, atom-0252, atom-0253, atom-0256, atom-0260, atom-0264, atom-0287, atom-0288, atom-0291, atom-0292]
preserved_exact_tokens:
  - "Advanced/Support diagnostics"
  - "last successful source/ref/hash"
  - "last failed check time"
  - "error class"
  - "affected provider/model IDs"
  - "route impact"
  - "redacted copy/export"
  - "redaction summary"
  - "The user can’t fix this"
negative_constraints:
  - Do not expose secrets or tokens in Advanced/Support diagnostics.
  - Do not create normal UI noise for repeated automatic Free Models check failures unless routing availability is affected.
  - Do not export raw secrets or tokens in diagnostics copy/export.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### RAP-041 - Free Models Route Provenance And Usage Receipt Projection

```yaml
plan_unit_id: RAP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects Free Models route provenance by showing friendly `Free Models` model/provider names normally while preserving underlying provider/model/account/source identity, exact snapshot ids, source hashes, upstream refs, alias/rename/provider-move lineage, attempted models, skipped entries, final result, and plain switch reasons in expanded details or Advanced/Support. Raw provider payloads remain Advanced/Support-only and redacted according to policy.
gui_related: true
gui_classification_reason: Runtime Artifacts and expanded Usage provenance are user-visible diagnostic panels.
depends_on: []
unblocks: []
acceptance_criteria:
  - Request-time friendly names stay stable in normal Usage even after upstream rename/provider move.
  - Expanded details and Advanced/Support preserve exact snapshot ids, source hashes, upstream refs, and alias/rename/provider-move lineage.
  - Every attempted/skipped entry and final selected/stopped result remains traceable.
  - Raw provider error payloads stay out of normal expanded rows.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models route provenance projection fixtures
  - Usage receipt expanded detail fixtures
risk_class: route_provenance_projection_drift
reasoning_tier: high
context_scope: free_models_runtime_provenance
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_route_provenance_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0107, atom-0111, atom-0212, atom-0216, atom-0220, atom-0224, atom-0242, atom-0246, atom-0250, atom-0254, atom-0258, atom-0262, atom-0276, atom-0284, atom-0286]
preserved_exact_tokens:
  - "friendly model/provider names"
  - "exact snapshot IDs"
  - "source hashes"
  - "upstream refs"
  - "alias/rename/provider-move"
  - "Show in Usage"
  - "Show in Ledger"
  - "attempted model"
  - "skipped entries"
negative_constraints:
  - Do not show snapshot IDs, source hashes, or upstream refs as primary normal Usage receipt content.
  - Do not rewrite normal Usage receipt names after upstream rename/provider move.
  - Do not expose raw provider error payloads in normal expanded availability rows.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host evidence projection and receipt browsing boundaries. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### RAP-042 - Containerized Host Evidence Projection And Receipt Browsing Boundary

```yaml
plan_unit_id: RAP-042
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects containerized-host evidence for browsing, inspection, and export without becoming receipt
  truth. Docker/Hosts, Assistant, Orchestrator, Run Graph, Executor, and ATS may open Runtime Artifacts for logs,
  screenshots, browser recordings, traces, health checks, ports, access URLs, command output, stale/gap markers,
  TestRunReceipt, host_preflight_receipt, host_execution_receipt, cleanup_retention_receipt, evidence refs,
  visual_evidence_refs, blocker payloads, and export profiles. The owning receipt, test, storage, executor, and
  container records remain authoritative; stale or missing owner records degrade the view. `blocked != failed` is
  preserved for permission_denied, user_declined, headless_ask_denied, filesafe_blocked, external_side_effect_blocked,
  network_blocked_by_policy, host_unreachable, host_untrusted, test_gap_policy, capability_unavailable,
  projection_stale, needs_review, and indeterminate_remote_outcome. Containerized-host runtime artifact rows link
  `host_preflight_receipt`, `host_execution_receipt`, `cleanup_retention_receipt`, `port_access_record`,
  `permission_snapshot_id`, `filesafe_scope_ref`, `host_assignment_id`, `host_instance_id`, `runtime_context_ref`,
  `blocked_reason_code`, `allowed_action_ids[]`, and `projection_health` back to Docker/Hosts and owner records.
gui_related: true
gui_classification_reason: Runtime Artifacts evidence browsing, logs, screenshots, traces, access URLs, and degraded projection states are user-visible panel behavior.
depends_on: [CV-303, SP-226, ATS-019, EP-109]
unblocks: [ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Runtime Artifacts can show host/test/runtime evidence and receipt refs without replacing owner records as truth.
  - Stale, missing, blocked, and degraded owner records produce visible projection health rather than optimistic success.
  - Manual eyeballing, chat-only observation, and container-started claims cannot certify completion.
  - Blocked permission, FileSafe, policy, host, trust, test-gap, and projection outcomes remain blocked states, not failures.
  - Containerized-host receipt rows expose the receipt family, owning record ref, stale/degraded projection health, blocked reason code, and allowed actions without becoming the receipt authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts containerized-host projection fixtures
  - future blocked != failed projection fixtures
risk_class: runtime_artifact_receipt_authority_drift
reasoning_tier: high
context_scope: containerized_host_artifact_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future Runtime Artifacts containerized-host views
node_compile_hint:
  mode: containerized_host_evidence_projection_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0014
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0020
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0049
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-003-blocker-taxonomy-projection-boundary
source_atom_ids: [atom-0008, atom-0014, atom-0015, atom-0020, atom-0039, atom-0041, atom-0049, atom-0053, atom-0069, atom-0075, atom-0078, atom-0079]
decision_refs: [dec-0008, dec-0014, dec-0015, dec-0020]
preserved_exact_tokens:
  - "Runtime Artifacts as projection/evidence browsing rather than receipt truth"
  - "blocked != failed"
  - "TestRunReceipt"
  - "host_preflight_receipt"
  - "host_execution_receipt"
  - "cleanup_retention_receipt"
  - "logs"
  - "screenshots"
  - "browser recordings"
  - "traces"
  - "health checks"
  - "ports"
  - "access URLs"
  - "stale/gap markers"
  - "visual evidence refs"
  - "permission_denied"
  - "filesafe_blocked"
  - "projection_stale"
  - "indeterminate_remote_outcome"
negative_constraints:
  - Do not make Runtime Artifacts the receipt authority.
  - Do not rely on manual eyeballing or chat-only claims as completion evidence.
  - Do not let stale or missing owner records become final evidence.
  - Do not count blocked permission/FileSafe/policy outcomes as execution failures.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

## Usage Artifact Schema Strictness Addendum - 2026-07-09

This addendum tightens already-materialized runtime artifact schema expectations for usage-bearing artifacts. It creates no runtime artifacts, WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts.

### RAP-043 - Usage And Tool Trace Schema Strictness

```yaml
plan_unit_id: RAP-043
unit_type: schema_contract
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The materialized `cost_usage` and `tool_llm_trace` runtime artifact schemas must reject arbitrary non-empty `type_payload` values. `cost_usage` requires canonical usage identity through `usage_event_ref`, provider/route/account/model identity, normalized usage token buckets and counting semantics, nonnegative `reasoning_tokens` as the JSON wire alias for UF-085 reasoning/thoughts, normalized cost fields, quota/window evidence, authority/source/confidence/settlement fields, raw provider payload/redaction refs, and flags for estimated, provider-reported, CLI-reported, local-context-estimated, BYOK, subscription-hidden, and unknown states. `tool_llm_trace` requires `trace_ref`, trace_kind, tool_call_id, llm_call_id or stream_id, provider_attempt_ref, usage_event_ref when available, stream lifecycle timestamps or refs for start/partial/final/error/abort, provider payload/redaction refs, usage settlement link, retry/escalation relation, and quota/usage refs; provider_reported/cli_reported flags are signal flags only, not source authority, and Curated trace views must join UsageRecord authority through `usage_record_id` or `usage_artifact_ref`. Schema-only JSON validation must fail if these required payload fields are absent; repo-specific validators may add fixtures but must not be the only line of defense.
gui_related: true
gui_classification_reason: Cost usage and tool/LLM trace artifacts are user-visible drill-through surfaces, and schema strictness protects their displayed Usage/Ledger behavior.
depends_on: [RAP-016, RAP-017, RAP-018, UF-085, CBP-027]
unblocks: []
acceptance_criteria:
  - "`Plans/runtime_artifact_cost_usage.schema.json` rejects an artifact whose `type_payload` lacks provider, usage, cost, quota, authority, refs, or flags."
  - "`Plans/runtime_artifact_cost_usage.schema.json` requires `usage_event_ref`, `usage_record_id`, and nonnegative `reasoning_tokens` as the UF-085 reasoning/thoughts wire alias with counting_semantics."
  - "`Plans/runtime_artifact_tool_llm_trace.schema.json` rejects an artifact whose `type_payload` lacks `trace_ref`, `usage_record_id`, trace lifecycle, provider attempt linkage, usage settlement linkage, retry/escalation relation, or raw-payload/redaction refs."
  - Schema-only validation can distinguish missing, unknown, disabled, estimated, provider-reported, CLI-reported, BYOK, and subscription-hidden states without accepting arbitrary payloads.
  - Runtime Artifacts drill-through uses canonical `usage_event_ref`, `usage_record_id`, `provider_attempt_ref`, and `trace_ref` rather than timestamp heuristics or artifact-local cost models.
  - No WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, production build tasks, generated governance artifacts, final manifests, or PNC-019 receipts are created by this PlanUnit.
validation_surfaces:
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: runtime_artifact_schema_false_pass
reasoning_tier: high
context_scope: runtime_artifact_usage_schema
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_runtime_artifact_schema_strictness
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Runtime_Artifacts_Panel.md:262-292"
  - "Plans/runtime_artifact_cost_usage.schema.json:1"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:1"
  - "uploaded:Puppet-Master-main/Plans/runtime_artifact_cost_usage.schema.json:1"
  - "uploaded:Puppet-Master-main/Plans/runtime_artifact_tool_llm_trace.schema.json:1"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
  - "uploaded:pi-main/packages/ai/src/types.ts:352-375"
  - "uploaded:pi-main/packages/ai/src/api/anthropic-messages.ts:546-559"
  - "uploaded:antigravity-cli-main/CHANGELOG.md:122-136"
preserved_exact_tokens:
  - cost_usage
  - tool_llm_trace
  - type_payload
  - usage_event_ref
  - provider_attempt_ref
  - trace_ref
  - reasoning_tokens
  - provider_reported
  - provider_header
  - cli_reported
  - local_estimated
  - pricing_estimated
  - unknown
  - streaming_partial
  - settled
  - adjusted
  - failed
  - BYOK
  - subscription-hidden
negative_constraints:
  - Do not accept arbitrary non-empty `type_payload` as a valid cost_usage or tool_llm_trace artifact.
  - Do not rely only on custom repo validators when JSON Schema itself can express required payload fields.
  - Do not create an artifact-local usage model separate from canonical UsageRecord.
  - Do not use timestamp heuristics, run-only filters, or tier-only filters as the primary usage/cost join.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical Runtime Artifacts panel spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, executable queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Gap-Analysis Prose Fence And Schema Currentness

Repairs rows `sfk-b1d25fff07c3d23ad4bdf58f` and `sfk-69cf6e354bc8cdd2949fdd95`.

- First-person gap-analysis prose in this document is source-lineage commentary only and must not override canonical runtime-artifact envelope fields.
- The runtime artifact envelope pins `attempt_id` through the schema family and panel row contract.
- The 19+1 runtime artifact schema files are current live doc targets when present and validated; wording that says they are "not current live doc targets until those files exist" is stale and superseded by this addendum.
- Runtime Artifacts remains a GUI/inspection consumer. It does not certify runtime lifecycle and cannot close PNC-019.

### RAP-028 Numbering Disposition

Repairs row `sfk-f24fe6aacec9eba6b6f6fae4`.

`RAP-028` is intentionally retired as a skipped migration number. The sequence is `RAP-027`, retired alias `RAP-028`, then `RAP-029`. New references must not cite `RAP-028` as a live requirement. Compatibility readers may map `RAP-028` to `RAP-029` only when the source row explicitly names the retired alias.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 326` (explicitly_deferred; source line 1113; `sfk-69cf6e354bc8cdd2949fdd95`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L292,589-593: **ADJUDICATED the 19+1 `runtime_artifact_*.schema.json` files DO exist** (confirmed elsewhere in this audit); this doc's own "not current live doc targets until those files exist" framing is now stale and should be updated to reflect they've materialized.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Runtime Artifacts usage drill-through to UsageRecord identity and strict per-type validation. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RAP-044 - Usage Artifact Drill-Through And Raw Curated Contract

```yaml
plan_unit_id: RAP-044
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts usage drill-through is object-first. `Show in Usage` and `Show in Ledger` emit route_target.object_kind = usage_event and a stable object_id whenever usage_event_ref is present, plus secondary refs for usage_event_ref, usage_record_id, artifact_id, attempt_id, node_id, provider_attempt_ref, tool_call_id, trace_ref, receipt refs, raw_payload_ref, run_id, and thread_id. Run, thread, timestamp, and tier remain filters or display scope only. The Runtime Artifacts panel exposes Curated and Raw usage views: Curated shows normalized provider, usage, cost, quota, authority, settlement, counting_semantics, and correlation refs; Raw shows raw_payload_ref, redaction_status, provider_payload_hash, omitted counts, truncation/redaction reason, and permissioned-unavailable state. Append, indexing, and drill-through validation must validate the common envelope plus the matching per-type schema for cost_usage and tool_llm_trace; envelope-only validation or arbitrary non-empty type_payload cannot pass.
gui_related: true
gui_classification_reason: Runtime Artifacts drill-through, Curated/Raw views, and Usage/Ledger actions are visible inspection UI.
depends_on: [RAP-043, UF-087, UF-088, UCC-109, CV-316]
unblocks: []
acceptance_criteria:
  - "`Show in Usage` and `Show in Ledger` payloads include object_kind = usage_event and object_id derived from usage_event_ref when usage_event_ref exists."
  - Route fixtures fail timestamp-only, run-only, thread-only, tier-only, and artifact-only Usage pivots when usage_event_ref is available.
  - Curated view displays normalized token buckets, cost status, quota status, source_class, source_confidence, source_authority, settlement_status, counting_semantics, and correlation refs.
  - Raw view displays redacted raw_payload_ref, redaction_status, provider_payload_hash, omitted counts, and permissioned unavailable state without exposing raw secrets, account identifiers, credentials, or local paths.
  - cost_usage and tool_llm_trace artifacts validate against the envelope plus their matching per-type schema before append, index, display, export, or drill-through.
  - Negative fixtures reject envelope-only cost_usage/tool_llm_trace artifacts and arbitrary non-empty type_payload payloads.
validation_surfaces:
  - python3 -m json.tool Plans/runtime_artifact_cost_usage.schema.json
  - python3 -m json.tool Plans/runtime_artifact_tool_llm_trace.schema.json
  - python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check
  - future GUI-RAP-001 fixture suite
risk_class: runtime_artifact_usage_drillthrough_false_pass
reasoning_tier: high
context_scope: runtime_artifact_usage_drillthrough
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: runtime_artifact_usage_drillthrough_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Runtime_Artifacts_Panel.md:262-316"
  - "Plans/runtime_artifact_envelope.schema.json:1"
  - "Plans/runtime_artifact_cost_usage.schema.json:47-510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "Plans/Contracts_V0.md:5665-5676"
  - "Plans/storage-plan.md:109"
  - "uploaded:opencode-dev/packages/llm/src/schema/events.ts:7-69"
  - "uploaded:cline-main/sdk/packages/llms/fixtures/usage.json:1-56"
preserved_exact_tokens:
  - Show in Usage
  - Show in Ledger
  - route_target.object_kind = usage_event
  - usage_event_ref
  - provider_attempt_ref
  - trace_ref
  - raw_payload_ref
  - Curated
  - Raw
  - type_payload
  - cost_usage
  - tool_llm_trace
negative_constraints:
  - Do not route usage drill-through primarily by timestamp, run, thread, tier, or artifact-only filters when usage_event_ref is available.
  - Do not validate cost_usage or tool_llm_trace with envelope-only validation.
  - Do not display Raw payload contents without redaction refs, permission state, and secret stripping.
  - Do not create an artifact-local usage schema separate from UsageRecord.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
```

## Case L Durable-State Consumer Addendum - 2026-07-17

This addendum is the Runtime Artifacts consumer propagation for approved Case L findings `L-013`, `L-022`, and `L-027`. It consumes the owner contracts in `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/FileSafe.md`, and `Plans/assistant-chat-design.md`; it does not create a second EventRecord envelope, storage recovery algorithm, restore engine, restore-point lifecycle, retention policy, permission rule, or storage-access state machine. The approved source is `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, including Bundles B, C, D, E, and F. This documentation propagation creates no runtime implementation, WorkNodes, NodeSeeds, executable queues, generated governance artifacts, build tasks, or completeness evidence.

### Canonical-history continuity and projection truth

Every new `runtime_artifact.*` write uses the current EventRecord `2.0.0` envelope. Runtime-artifact events are project-scoped: `scope_kind = project` and `project_id` is the non-empty owning project ID. The panel never invents a default project. Application-scoped `storage.integrity_detected`, `storage.recovery_applied`, and `storage.boot_recovery` records instead carry `scope_kind = application` and `project_id = null`; the panel may show their proven affected project/run/event refs from payload evidence, but must not rewrite their envelope scope.

Read-only artifact/history inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; an unsupported reader refuses the live panel with `unsupported_schema_version` rather than presenting a partial or best-effort view. Event routing consumes the storage-owned key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` where application scope uses `app` and project scope uses the registered reversible project partition. The panel does not reconstruct this key from display project state, omit `event_id`, or treat the lookup index as event authority.

Runtime-artifact producers preserve globally unique `event_id`, the Contracts-owned `(scope_partition, event_type, idempotency_key)` lifetime identity, and the selected `replay_policy`. `dedupe_unavailable` means no persisted artifact append succeeded: the panel may retain explicitly ephemeral view state, but it must not show a durable artifact, receipt, or success row. A compatibility value normalized as `projector_replay_only` may update only the rebuildable artifact projection and its atomic checkpoint; it cannot emit another artifact, execute an open/apply action, dispatch work, create usage, or mutate canonical state.

Canonical-history continuity is separate from projector currentness. The panel consumes owner recovery evidence including `integrity_id`, `recovery_id`, `impact_precision`, proven affected byte/sequence/event ranges, last-good and next-good identities, survivor digest, checkpoint action, projection action, repair provenance, and user-disclosure requirement. The closed panel vocabulary is:

- `projection_freshness = current | refreshing | stale`;
- `projection_health = healthy | degraded | unavailable`.

A projection rebuilt to the current survivor checkpoint may be `projection_freshness = current` while remaining `projection_health = degraded` because canonical history has a proven or possible hole. Unknown, acknowledged, mutation-authorizing, or receipt-authority loss is never rendered `healthy`. `unavailable` applies when the owner cannot establish a trustworthy view. Gap rendering distinguishes unacknowledged tail, exact event, exact byte range, bounded sequence range, and unknown segment remainder, and links the storage recovery/disclosure record. Runtime Artifacts never infers lost identity from timestamps or from its rebuildable index.

### Restore-point projection and exact-restore outcome consumption

`runtime_artifact.restore_point` is a projection of the Assistant Chat-owned immutable conversation restore-point record, not the record itself and not a safe point. Its `type_payload` requires `restore_point_id` as primary identity plus `record_ref`, `record_sha256`, `status`, source `project_id`, `source_thread_id`, `source_branch_id`, `source_message_id`, context/provenance/attachment/citation refs, `retention_policy_ref`, and current hold/reference summaries. `safe_point_id` is optional lineage only and MUST NOT become restore-point identity or silently restore files.

Status is consumed exactly as `available | expired | deleted | corrupt`. An available record may expose the registered branch-from-restore route after permission, current-hash, and storage-writer preflight. Successful application creates a new `thread_id` and `branch_id`, leaves the source thread and source worktree unchanged, does not consume the record, and has no filesystem apply semantics. Expired, deleted, corrupt, stale-hash, permission-denied, viewer, and blocked states remain browsable with their exact unavailable reason and no enabled apply route. Cleanup may expire a regenerable artifact projection, but cannot delete the canonical `rp:{project_id}:{restore_point_id}` record or clear its descendant/application/legal-hold refs.

When Runtime Artifacts displays a FileSafe safe-point or Chat-revert receipt, it consumes the closed owner outcomes without relabeling them: `restored_clean` requires target equality; `restore_skipped` requires pre-existing target equality and no mutation; `restore_refused` is pre-mutation; `restore_failed` requires verified rollback equality; and `restore_recovery_required` retains the mutation fence, worktree/safe-point/transaction holds, and blocked recovery episode. `restored_with_conflicts` is not a valid exact-replace success. A `recovery_unavailable` episode stays blocked and anchored until explicit abandon, replan, or verified recovery.

### Storage root, viewer, and permission-affordance dependency

Artifact browsing consumes storage-owned `storage_instance_id`, `root_generation`, redacted `logical_root_fingerprint`, `storage_access_mode = writer | viewer | blocked`, `storage_mode_reason`, `lock_ownership`, and `snapshot_high_water_ref`. It never uses display path, current project selection, or an index row as root authority.

In compatible lock-conflict viewer mode, Runtime Artifacts is a frozen, manually refreshable read snapshot. It may inspect/copy/export only within FileSafe and permission policy; view-local changes are visibly ephemeral. Apply, restore, retry, delete, retention/hold mutation, settings/history persistence, dispatch, provider calls requiring receipts, and every other durable/runtime/external mutation remain discoverable where useful but disabled with `storage_read_only`. Permission approval cannot widen this storage gate. Promotion is never automatic and the panel only reflects the storage-owned full-revalidation result. A newer-format store exposes metadata-only compatibility diagnostics, not the Runtime Artifacts viewer. `root_mismatch`, `root_unavailable`, `fallback_diverged`, or inability to prove a coherent snapshot yields the owner viewer/blocked posture and never an apparently empty artifact list.

Runtime Artifacts diagnostics do not create a generic verify, repair, salvage, force-open, or `try_anyway` action. `Retry storage` is an owner admission probe only; it neither repairs bytes nor automatically resumes a blocked artifact action.

Permission-denied artifact actions consume the permission-owned blocked payload (`blocked_family`, `blocked_reason_code`, ordered `allowed_action_ids[]`, `permission_snapshot_id?`, `approval_scope_key?`, `executed: false`) and do not collapse denial, approval required, storage read-only, integrity block, or preflight drift into generic failure.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md#Case-L-durable-state-owner-canon, ContractName:Plans/FileSafe.md#Case-L-Exact-Restore-Repair-Addendum, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md

### RAP-045 - Case L Canonical History And Projection Trust Consumer

```yaml
plan_unit_id: RAP-045
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts consumes EventRecord 2.0 scope, identity, idempotency, replay,
  and storage recovery evidence while keeping projection_freshness current,
  refreshing, or stale separate from projection_health healthy, degraded, or
  unavailable. Canonical-history holes, affected ranges, survivor/rebuild state,
  and repair provenance remain visible even when a survivor projection is current;
  dedupe-unavailable or replay-only input never fabricates a durable artifact.
gui_related: true
gui_classification_reason: The unit defines visible artifact trust, continuity-gap, and recovery-provenance rendering.
depends_on: [RAP-020, RAP-026, CV-317, CV-318, SP-236]
unblocks: []
acceptance_criteria:
  - Runtime-artifact writes use project-scoped EventRecord 2.0 without fake project identity.
  - Application-scoped storage recovery records remain application scoped while proven affected refs remain inspectable.
  - A reader lacking EventRecord 2.0 validation refuses the panel, and artifact event routing consumes the full storage-owned v2 scope, sequence, and event lookup key.
  - A current survivor projection with a canonical-history hole remains degraded or unavailable, never healthy.
  - dedupe_unavailable creates no persisted artifact success and projector_replay_only creates no canonical or external side effect.
  - Gap fixtures render exact event, exact byte range, bounded sequence range, and unknown remainder distinctly with recovery provenance.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L Runtime Artifacts continuity and EventRecord fixture suite
risk_class: runtime_artifact_false_continuity
reasoning_tier: high
context_scope: case_l_runtime_artifact_continuity
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_envelope.schema.json
node_compile_hint:
  mode: case_l_runtime_artifact_continuity_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-013
  - Case-L:L-027
  - Case-L:EVT-01..EVT-07
  - Case-L:SEG-D-013..SEG-D-016
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
negative_constraints:
  - Do not collapse projection freshness and health.
  - Do not label rebuilt projections healthy when canonical continuity is missing.
  - Do not infer lost identities from timestamps or artifact-index rows.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-046 - Case L Restore Point And Exact Restore Projection

```yaml
plan_unit_id: RAP-046
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  runtime_artifact.restore_point projects the immutable Assistant Chat restore-point
  record by restore_point_id, record hash, source conversation boundary, provenance,
  retention, and available, expired, deleted, or corrupt status. An optional
  safe_point_id is lineage only. Branch-from-restore creates a new thread and branch
  without mutating the source thread/worktree, while FileSafe exact-replace receipts
  preserve their owner-defined equality, refusal, rollback, and recovery-required truth.
gui_related: true
gui_classification_reason: Restore-point browsing, disabled states, branching, and restore receipt truth are visible panel behavior.
depends_on: [RAP-004, CV-320, SP-242]
unblocks: []
acceptance_criteria:
  - Restore-point rows route by restore_point_id and never use safe_point_id as primary identity.
  - Available create-to-branch fixtures produce a new thread and branch while leaving source conversation and worktree unchanged.
  - Expired, deleted, corrupt, stale-hash, permission-denied, viewer, and blocked fixtures expose no enabled apply route.
  - restored_clean and restore_failed render only with target-equality and rollback-equality proof respectively.
  - restore_recovery_required and recovery_unavailable remain visibly fenced and held.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future RSP-RP-001 through RSP-RP-004 artifact projection fixtures
  - future RSP-ATOMIC-001 through RSP-ATOMIC-003 receipt rendering fixtures
risk_class: runtime_artifact_restore_identity_drift
reasoning_tier: high
context_scope: case_l_restore_point_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_restore_point.schema.json
node_compile_hint:
  mode: case_l_restore_point_projection_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-021
  - Case-L:L-022
  - Case-L:L-024
  - Case-L:PD-RSP-01..PD-RSP-09
negative_constraints:
  - Do not collapse restore points into safe points or runtime artifacts into lifecycle authority.
  - Do not claim original state preservation without owner equality proof.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-047 - Case L Storage Access And Blocked Action Affordances

```yaml
plan_unit_id: RAP-047
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts consumes storage root identity and writer, viewer, or blocked
  access state. Compatible viewer mode is a frozen manually refreshed snapshot;
  durable, runtime, and external mutations are disabled with storage_read_only,
  permission approval cannot widen the gate, newer stores expose diagnostics rather
  than a live panel, and root mismatch or fallback divergence never appears as an
  empty artifact list. Permission denial remains a typed non-executed blocked result.
gui_related: true
gui_classification_reason: Storage viewer banners, refresh, disabled actions, root mismatch, and denial states are user-visible affordances.
depends_on: [RAP-026, SP-239, SP-240]
unblocks: []
acceptance_criteria:
  - Viewer fixtures start no writer-capable component and classify every mutating panel action as storage_read_only.
  - Manual refresh recaptures one owner high-water snapshot without projector or checkpoint writes.
  - Permission approval cannot enable an action prohibited by viewer or blocked storage state.
  - Newer-store and root-continuity fixtures show diagnostics or blocked state rather than live or empty artifact content.
  - Diagnostics expose no generic repair, salvage, force-open, or try-anyway path, and Retry storage cannot auto-resume an artifact action.
  - Permission denial preserves blocked family, reason, ordered action IDs, snapshot ref when present, and executed false.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L storage lock, viewer, root continuity, and direct-handler fixtures
risk_class: runtime_artifact_viewer_mutation_leak
reasoning_tier: high
context_scope: case_l_runtime_artifact_storage_access
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: case_l_runtime_artifact_storage_access_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:L-012
  - Case-L:L-014
  - Case-L:L-018
  - Case-L:L011-C1..L018-C3
negative_constraints:
  - Do not make display path, current project selection, or the rebuildable index storage-root authority.
  - Do not auto-promote a viewer or expose Runtime Artifacts for an unsupported newer store.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes the Runtime Artifacts spec gaps exposed by the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source-lineage-only; no concept HTML, CSS, or class names are canon). It binds the panel's label-only actions to canonical `cmd.*` ids, pins the freshness x health visual mapping, adds positive empty states, records how artifact receipt rows consume the shared unified expander contract, and surfaces retention/pin/tombstone behavior. Ratified inputs are cited as user decision 2026-07-27: the rail width envelope (240px min / 480px max / 280px default; 220px is test-only adversarial), the `--cat-*` per-theme category indirection with `--accent-primary` reserved for selection, and the c2 concept files as the patched-in-place implementation base. The unified expander contract itself is owned by the GUI shell owner doc (`Plans/FinalGUISpec.md`, Cozy Shelves reconciliation layer); this panel consumes it and does not re-own it. `Plans/UI_Command_Catalog.md` retains sole `cmd.*` minting authority. Slint compatibility holds throughout: opaque precomputed surfaces, precomputed color math, no arbitrary-content backdrop blur, no SVG filters, and glass only as pre-blurred wallpaper. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks, and it never edits or supersedes existing PlanUnits except by explicit new-unit statement.

### RAP-048 - Cozy Shelves Action-To-Command Binding

```yaml
plan_unit_id: RAP-048
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Every mandated Runtime Artifacts panel action binds to a canonical UI_Command_Catalog id; label-only
  actions are retired as canon. Show in Ledger = cmd.artifacts.show_in_ledger and Show in Usage =
  cmd.artifacts.show_in_usage (existing rows); list sort = cmd.artifacts.sort (shell_view row); recording
  playback = cmd.artifacts.play_recording (record-only availability); live recording watch =
  cmd.artifacts.watch_recording (live-run availability); Sources = cmd.artifacts.show_sources
  (navigation wrapper replacing the prototype web.sources verb); panel entry = cmd.panel.switch with
  panel_id = artifacts (retiring prototype panels.show/panels.open_chat forms). Open and Watch on
  visible-session evidence dispatch the ATS-owned Open/Watch fallback route (ATS-009 semantics preserved
  by RAP-030) rather than artifact-local commands, and inspect / rerun-with-a-question on described-image
  and receipt rows route to the owning surface; the panel never executes reruns or mutations locally.
  This unit binds labels to ids only; Plans/UI_Command_Catalog.md mints and owns the rows.
gui_related: true
gui_classification_reason: Action bindings determine which visible panel controls dispatch which commands.
depends_on: [RAP-008, RAP-030, RAP-042, RAP-044, UCC-109]
unblocks: []
acceptance_criteria:
  - Each mandated panel action has exactly one canonical cmd.* binding and no label-only action remains unbound.
  - Prototype verbs web.sources, panels.show, and panels.open_chat do not survive as canonical ids.
  - play_recording is available on completed recordings only and watch_recording on live runs only, with reason-coded disabled states otherwise.
  - Open/Watch on visible-session evidence resolves through the ATS-owned route, and inspect/rerun actions resolve to owner surfaces, never panel-local execution.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Cozy Shelves control-reconciliation artifact check
risk_class: artifact_action_command_drift
reasoning_tier: standard
context_scope: cozy_shelves_artifact_command_binding
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: artifact_action_command_binding
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/UI_Command_Catalog.md Cozy Shelves reconciliation layer"
preserved_exact_tokens:
  - cmd.artifacts.show_in_ledger
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.sort
  - cmd.artifacts.play_recording
  - cmd.artifacts.watch_recording
  - cmd.artifacts.show_sources
  - cmd.panel.switch
negative_constraints:
  - Do not keep label-only actions as canonical panel canon.
  - Do not mint cmd.* rows in this doc; UI_Command_Catalog.md owns minting.
  - Do not execute rerun, inspect-mutation, or recording capture panel-locally.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/UI_Command_Catalog.md
  - Plans/Automated_Testing_System.md
```

### RAP-049 - Freshness x Health Visual Mapping

```yaml
plan_unit_id: RAP-049
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The projection_freshness x projection_health matrix (current | refreshing | stale x healthy | degraded |
  unavailable) renders through two redundant channels: projection_health drives the row/panel status dot
  color from theme status tokens, and projection_freshness renders as a text staleness chip (current shows
  no chip; refreshing and stale show labeled chips). All nine combinations remain distinguishable, state is
  never encoded by color alone, and degraded or unavailable health always carries its text label plus the
  recovery/disclosure provenance link required by the Case L consumer contract. The health dot never uses
  --accent-primary, which stays reserved for selection (user decision 2026-07-27); category shelf tinting
  is a separate --cat-* per-theme indirection concern and does not encode health or freshness.
gui_related: true
gui_classification_reason: Defines the visible badge/chip treatment for artifact projection trust states.
depends_on: [RAP-045]
unblocks: []
acceptance_criteria:
  - Fixtures render all nine freshness x health combinations distinguishably with dot color plus text chip, never color alone.
  - A current-but-degraded projection shows a healthy-position freshness (no chip) with a degraded dot and its text label, never a healthy rendering.
  - Stale and refreshing chips are text-labeled and readable in every shipped theme, including retro-dark and basic-light overrides.
  - Degraded and unavailable states link the owning recovery/disclosure record.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L Runtime Artifacts continuity and EventRecord fixture suite
risk_class: freshness_health_color_only_signal
reasoning_tier: standard
context_scope: artifact_freshness_health_rendering
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_freshness_health_visual_mapping
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:2037-2042"
preserved_exact_tokens:
  - projection_freshness
  - projection_health
compatibility_only_notes:
  - "Slint compatibility: freshness/health treatments are opaque precomputed surfaces with precomputed color math; no arbitrary-content backdrop blur and no SVG filters at runtime; glass appears only as pre-blurred wallpaper."
negative_constraints:
  - Do not encode any freshness or health state by color alone.
  - Do not collapse the two axes into one badge or reuse --accent-primary for health.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-050 - Positive Empty States

```yaml
plan_unit_id: RAP-050
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  A healthy-but-empty Runtime Artifacts panel renders a positive empty state, never a bare blank list.
  With a proven-coherent snapshot and no runs yet for the project, the panel shows a no-runs-yet state
  with a short explanation and a CTA that routes to the owning run surface; the panel itself never
  dispatches work. When active filters reduce a non-empty index to zero rows, the panel shows a
  filtered-to-zero state naming the active filter summary with a clear-filter chip that restores the
  unfiltered list. These positive states apply only when the storage owner proves a coherent healthy
  snapshot; root_mismatch, root_unavailable, fallback_diverged, viewer/blocked, and
  unprovable-snapshot conditions keep the RAP-047 owner posture and never render as an apparently
  empty artifact list.
gui_related: true
gui_classification_reason: Empty, filtered-empty, and blocked-empty renderings are user-visible panel states.
depends_on: [RAP-026, RAP-047]
unblocks: []
acceptance_criteria:
  - No-runs-yet fixtures show explanation plus a CTA routing to the owning run surface without panel-local dispatch.
  - Filtered-to-zero fixtures show the active filter summary and a clear-filter chip that restores the list.
  - Root-mismatch, root-unavailable, fallback-diverged, and viewer/blocked fixtures never render either positive empty state.
  - The two positive empty states are visually and textually distinct from each other and from blocked/diagnostic states.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts empty-state fixtures
risk_class: empty_state_ambiguity
reasoning_tier: standard
context_scope: artifact_panel_empty_states
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_panel_positive_empty_states
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:2056"
negative_constraints:
  - Do not render storage-access or continuity failures as an empty artifact list.
  - Do not let the empty-state CTA execute runs from the panel.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
```

### RAP-051 - Receipt-Row Unified Expander Consumption

```yaml
plan_unit_id: RAP-051
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts rows consume the shared unified expander contract owned by the GUI shell owner doc
  without re-owning it: rows are collapsed by default, the row header is a single accessible button with
  aria-expanded, and the body follows the slot order kv-facts, status-detail, blocked-reason-detail,
  actions, overflow with an approximately 200px body cap and internal scroll. The collapsed receipt row is
  two lines carrying the artifact family pill, label, status, and age; failed rows keep a one-line failure
  excerpt and live rows keep their progress line while collapsed. Blocked reasons stay visible outside the
  collapsible body, destructive actions route through the shared confirm surface, and blocked payloads
  carry blocked_reason_code plus ordered allowed_action_ids[]. The expanded body exposes the
  metadata-first demand-loaded preview, provenance/producer refs, the actions row including the retention
  line and pin action, a copyable canonical artifact id, and truncation_state for any excerpted content.
  Investigation-bundle groups collapse with same-kind grouping and per-kind count badges, remaining the
  RAP-013 index/navigation layer over canonical artifact records rather than a new family.
gui_related: true
gui_classification_reason: Row anatomy, expansion behavior, and grouped-bundle presentation are visible panel structure.
depends_on: [RAP-008, RAP-013, RAP-041, RAP-042]
unblocks: []
acceptance_criteria:
  - Rows default collapsed with a single aria-expanded header button and the mandated body slot order.
  - Collapsed rows keep family pill, label, status, and age; failed rows keep their one-line excerpt and live rows their progress line.
  - Blocked reasons render outside the collapsible body and blocked payloads preserve blocked_reason_code plus ordered allowed_action_ids[].
  - Expanded bodies expose demand-loaded preview, provenance refs, retention line, pin action, copyable id, and truncation_state within the ~200px internal-scroll cap.
  - Investigation groups collapse with same-kind grouping and count badges without minting a new artifact family.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future unified expander conformance fixtures
risk_class: expander_contract_fork
reasoning_tier: standard
context_scope: artifact_receipt_row_expander
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_receipt_row_expander_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:193-260"
preserved_exact_tokens:
  - blocked_reason_code
  - "allowed_action_ids[]"
  - truncation_state
compatibility_only_notes:
  - "Slint compatibility: expander bodies are opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters; motion and color math precomputed."
negative_constraints:
  - Do not re-own or fork the unified expander contract in this doc.
  - Do not hide blocked reasons inside the collapsible body.
  - Do not route destructive actions outside the shared confirm surface.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
```

## Runtime Artifact Event Authority Owner Contract - 2026-09-01

This section is the Runtime Artifacts semantic-owner disposition for the exact Option 2 taxonomy in RAP-004. It closes owner intent and payload-schema material depth only. It does not edit or supersede the EventRecord envelope, register any family, assign persistence behavior, authorize append or dispatch, advance a projector checkpoint, certify executable depth, or authorize PNC-019. Registry admission, storage binding, dedupe execution, replay/recovery fixtures, projector fixtures, and producer/consumer runtime evidence remain a separate Event Authority wave.

Every row below has project scope `project_id required; cross-project payload or routing references rejected`, and recommends retention class `RP-AUTHORITY-INDEFINITE` for later storage-owner adjudication. The recommendation is not a current retention assignment. The exact dedupe identity recommendation is the length-framed tuple `[event_type, project_id, artifact_id, schema_id]`; storage must bind that tuple before admission and must not dedupe by timestamp, summary, preview content, or artifact subtype.

| Exact event type | Semantic transition | Payload schema ID / ref / version | Producer -> consumers | Material-depth status |
| --- | --- | --- | --- | --- |
| `runtime_artifact.api_web_call` | A validated redacted web-operation artifact record becomes durable and addressable; success/failure remains payload evidence rather than event-name variation. | `pm.runtime_artifact.api_web_call.schema.v1` / `Plans/runtime_artifact_api_web_call.schema.json` / `v1` | WebOperation artifact writer -> Runtime Artifacts projector, web evidence viewer, audit consumers | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.artifact_version` | A distinct immutable version record for one source artifact becomes durable. | `pm.runtime_artifact.artifact_version.schema.v1` / `Plans/runtime_artifact_artifact_version.schema.json` / `v1` | Artifact versioning writer -> Runtime Artifacts projector and artifact history viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.before_after_snapshot` | A bounded before/after comparison record becomes durable with exact referenced sides and optional typed comparison results. | `pm.runtime_artifact.before_after_snapshot.schema.v1` / `Plans/runtime_artifact_before_after_snapshot.schema.json` / `v1` | Comparison/capture writer -> Runtime Artifacts projector and compare viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.browser_recording` | A browser recording record is sealed with session identity, security class, recording ref, actions, and redaction profile. | `pm.runtime_artifact.browser_recording.schema.v1` / `Plans/runtime_artifact_browser_recording.schema.json` / `v1` | Browser runtime recorder -> Runtime Artifacts projector, recording viewer, security audit | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.code_diff` | A code-difference record becomes durable with an exact changed-path census and optional typed diff/base/result detail. | `pm.runtime_artifact.code_diff.schema.v1` / `Plans/runtime_artifact_code_diff.schema.json` / `v1` | Mutation/diff recorder -> Runtime Artifacts projector, File Editor, compare viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.context_snapshot` | A redacted context snapshot becomes durable at one exact snapshot ref with optional typed scope, revision, and inclusion metadata. | `pm.runtime_artifact.context_snapshot.schema.v1` / `Plans/runtime_artifact_context_snapshot.schema.json` / `v1` | Context snapshot writer -> Runtime Artifacts projector and handoff/context viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.cost_usage` | A usage/cost artifact record becomes durable as a reference-bound projection of Usage authority, not a replacement usage event. | `pm.runtime_artifact.cost_usage.schema.v1` / `Plans/runtime_artifact_cost_usage.schema.json` / `v1` | Usage settlement artifact writer -> Runtime Artifacts projector, Usage, Ledger | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.document` | A document artifact record becomes durable at one exact document ref with optional typed MIME, kind, format, digest, and source metadata. | `pm.runtime_artifact.document.schema.v1` / `Plans/runtime_artifact_document.schema.json` / `v1` | Document artifact writer -> Runtime Artifacts projector and document viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.evidence` | An evidence artifact record of one exact evidence kind becomes durable with optional reference-bound claim, source, digest, and verification metadata. | `pm.runtime_artifact.evidence.schema.v1` / `Plans/runtime_artifact_evidence.schema.json` / `v1` | Verifier/evidence writer -> Runtime Artifacts projector, evidence viewer, certifier | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.failed_attempts` | A bounded failed-attempt aggregation becomes durable without overwriting any attempt record. | `pm.runtime_artifact.failed_attempts.schema.v1` / `Plans/runtime_artifact_failed_attempts.schema.json` / `v1` | Attempt evidence aggregator -> Runtime Artifacts projector and run diagnostics | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.hitl_approval` | An already-decided HITL approval receipt projection becomes durable; this event is never the approval command or unblock signal. | `pm.runtime_artifact.hitl_approval.schema.v1` / `Plans/runtime_artifact_hitl_approval.schema.json` / `v1` | Approval-owner receipt bridge -> Runtime Artifacts projector and approval audit viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.implementation_plan` | A non-canonical implementation-plan artifact becomes durable at one exact plan ref with optional typed revision, step, dependency, and validation metadata. | `pm.runtime_artifact.implementation_plan.schema.v1` / `Plans/runtime_artifact_implementation_plan.schema.json` / `v1` | Planning artifact writer -> Runtime Artifacts projector and plan artifact viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.reasoning_summary` | A summary-only reasoning artifact becomes durable; private chain-of-thought or raw hidden reasoning is not captured. | `pm.runtime_artifact.reasoning_summary.schema.v1` / `Plans/runtime_artifact_reasoning_summary.schema.json` / `v1` | Agent summary writer -> Runtime Artifacts projector and detail viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.restore_point` | A restore-point record becomes durable or changes its recorded availability/lifecycle state under the existing field-deep contract. | `pm.runtime_artifact.restore_point.schema.v1` / `Plans/runtime_artifact_restore_point.schema.json` / `v1` | Restore-point owner -> Runtime Artifacts projector, recovery and history viewers | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.screenshot` | A referenced screenshot artifact becomes durable at one exact media ref with optional typed digest, dimensions, surface, and redaction metadata. | `pm.runtime_artifact.screenshot.schema.v1` / `Plans/runtime_artifact_screenshot.schema.json` / `v1` | Screenshot/capture writer -> Runtime Artifacts projector and image viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.subagent_lineage` | A parent-child delegation lineage artifact becomes durable with exact parent/child attempt refs and optional typed agent, objective, lifecycle, and result metadata. | `pm.runtime_artifact.subagent_lineage.schema.v1` / `Plans/runtime_artifact_subagent_lineage.schema.json` / `v1` | Orchestrator lineage writer -> Runtime Artifacts projector and run/lineage viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.suggested_next_steps` | A bounded non-executing next-step list becomes durable with optional typed rationale, priority, dependency, and approval metadata. | `pm.runtime_artifact.suggested_next_steps.schema.v1` / `Plans/runtime_artifact_suggested_next_steps.schema.json` / `v1` | Agent suggestion writer -> Runtime Artifacts projector and suggestion viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.tool_llm_trace` | A redacted reference-based tool/LLM trace artifact becomes durable with lifecycle, settlement, retry, refs, and flags. | `pm.runtime_artifact.tool_llm_trace.schema.v1` / `Plans/runtime_artifact_tool_llm_trace.schema.json` / `v1` | Tool/provider trace writer -> Runtime Artifacts projector, trace viewer, Usage joins | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.validation_test` | A validation artifact becomes durable with an exact test-id census and optional typed command, suite, lifecycle, per-test result, duration, and evidence metadata. | `pm.runtime_artifact.validation_test.schema.v1` / `Plans/runtime_artifact_validation_test.schema.json` / `v1` | Test/validation writer -> Runtime Artifacts projector, test and evidence viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |

The producer boundary is fail closed: only the named domain owner may ask its runtime-artifact writer to materialize a record, and only after the content/reference is durable, the exact per-type schema validates, `project_id` matches the producer scope, and the storage-owned dedupe key is available. GUI surfaces, projectors, viewers, importers, and compatibility normalizers are consumers only and may not originate these events. A payload must be rejected if it contains an unhandled secret, inline preview bytes, raw screenshot/recording/document content, private chain-of-thought, a generic `subtype`/`artifact_subtype`, an unknown field, or a cross-project ref. Redacted/request/response/raw-payload fields in the five preserved field-deep schemas remain reference- and redaction-status-bound; they do not authorize embedded secret material.

The exact 19 per-type schemas are closed Draft 2020-12 objects. Their required fields are material; optional fields are only those named under each schema's closed `properties`. `summary`, `detail_ref`, `content_ref`, media refs, trace refs, and evidence refs are metadata/reference surfaces, never authority to inline a preview or raw secret. The generic candidate `runtime_artifact.created` is not part of RAP-004 Option 2, has no per-type schema in this set, and remains unadmitted and unauthorized.

### RAP-054 - Runtime Artifact Event Authority Owner And Payload Depth

```yaml
plan_unit_id: RAP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts owns exactly 19 Option 2 runtime_artifact.* semantic transitions and their
  closed per-type payload schemas. Every transition is project-scoped, recommends
  RP-AUTHORITY-INDEFINITE for later storage adjudication, uses the exact dedupe tuple
  [event_type, project_id, artifact_id, schema_id], rejects unhandled secrets, inline previews,
  private chain-of-thought, unknown fields, and generic subtype routing, and can be produced only
  by the named domain owner after durable artifact materialization. This owner/schema closure does
  not register a family or authorize EventRecord append, dispatch, projection, checkpoint advance,
  replay, retention execution, runtime implementation, buildability, or PNC-019.
gui_related: false
gui_classification_reason: This unit closes semantic ownership and machine payload depth without changing the visible Runtime Artifacts surface.
depends_on: [RAP-004, RAP-043]
unblocks: []
acceptance_criteria:
  - Exactly the 19 RAP-004 event types appear once in the owner table and map one-to-one to the 19 existing per-type schema files.
  - Every per-type schema is Draft 2020-12, version `v1`, closed against unknown fields, and has an exact non-generic `type_payload` contract.
  - The five already field-deep contracts remain preserved while the fourteen generic-nonempty payloads become field-deep.
  - Positive fixtures validate and missing-required-field, unknown-field, and unhandled-secret fixtures fail for all 19 schemas.
  - Project scope, RP-AUTHORITY-INDEFINITE recommendation, producer/consumer boundary, exact dedupe tuple, no-preview/no-secret/no-generic-subtype constraints, and material-depth status remain explicit.
  - "`runtime_artifact.created` remains outside the exact Option 2 taxonomy and is not admitted by this section."
  - Registry, storage, executable producer/append/dedupe/replay/recovery/projector fixtures, and event append/dispatch authorization remain open and fail closed.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, registry rows, or governance artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plan-index.py validate
  - scratchpad/pm-integration-20260831/event-authority-successor-20260901/runtime-artifact-depth-repair/manifest.json
risk_class: event_authority_payload_depth_drift
reasoning_tier: high
context_scope: runtime_artifact_event_authority
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_api_web_call.schema.json
  - Plans/runtime_artifact_artifact_version.schema.json
  - Plans/runtime_artifact_before_after_snapshot.schema.json
  - Plans/runtime_artifact_browser_recording.schema.json
  - Plans/runtime_artifact_code_diff.schema.json
  - Plans/runtime_artifact_context_snapshot.schema.json
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_document.schema.json
  - Plans/runtime_artifact_evidence.schema.json
  - Plans/runtime_artifact_failed_attempts.schema.json
  - Plans/runtime_artifact_hitl_approval.schema.json
  - Plans/runtime_artifact_implementation_plan.schema.json
  - Plans/runtime_artifact_reasoning_summary.schema.json
  - Plans/runtime_artifact_restore_point.schema.json
  - Plans/runtime_artifact_screenshot.schema.json
  - Plans/runtime_artifact_subagent_lineage.schema.json
  - Plans/runtime_artifact_suggested_next_steps.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/runtime_artifact_validation_test.schema.json
node_compile_hint:
  mode: runtime_artifact_event_authority_owner_schema_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Runtime_Artifacts_Panel.md:514-538
  - scratchpad/pm-integration-20260831/event-authority-successor-20260901/aggregate-adjudication/owner-adjudication/CANONICAL_REPAIR_PROPOSAL.jsonl:158-177
  - scripts/pm-plans-verify.py:2627-2647
  - tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json
preserved_exact_tokens:
  - Option 2 only
  - RP-AUTHORITY-INDEFINITE
  - owner_schema_ready_not_authorized
  - quarantine_without_checkpoint_advance
negative_constraints:
  - Do not append, dispatch, register, persist, replay, project, or advance a checkpoint for these event types from this owner/schema closure.
  - Do not use `runtime_artifact.created`, a generic subtype, preview bytes, raw content, raw secrets, private chain-of-thought, timestamp heuristics, or cross-project refs.
  - Do not treat a GUI action, projector row, artifact status, approval command, receipt, or usage record as the semantic transition itself.
  - Do not claim executable depth, buildability, governance seal, denominator closure, or PNC-019 authorization.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### RAP-052 - Retention, Pin, And Tombstone Surface

```yaml
plan_unit_id: RAP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Every artifact row surfaces its retention truth. Rows whose RAP-010 retention class bounds their
  lifetime show an expires-in line derived from the owner retention policy; a pin-to-keep action routes
  through the owning retention/hold surface and is disabled with storage_read_only in viewer mode, where
  permission approval cannot widen the gate. Expiry produces a tombstone row that preserves provenance
  metadata - canonical artifact id, family, run/thread/attempt refs, receipt refs, retention class, and
  redaction summary - after the content itself is gone. Tombstones and cleanup expire only regenerable
  projections; they never delete canonical records or clear descendant/application/legal-hold refs, and
  a tombstone renders visually distinct from failed, blocked, and empty states.
gui_related: true
gui_classification_reason: Expiry lines, pin actions, and tombstone rows are user-visible retention affordances.
depends_on: [RAP-010, RAP-046, RAP-047]
unblocks: []
acceptance_criteria:
  - Bounded-retention rows show an expires-in line sourced from owner retention policy, never a panel-local estimate.
  - Pin-to-keep routes to the owning retention/hold surface and classifies as storage_read_only in viewer mode.
  - Expired rows become tombstones preserving canonical id, family, lineage refs, receipt refs, retention class, and redaction summary.
  - Tombstone fixtures prove canonical records and legal-hold refs survive projection expiry.
  - Tombstone rendering is distinguishable from failed, blocked, and empty states.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts retention and tombstone fixtures
risk_class: retention_visibility_loss
reasoning_tier: standard
context_scope: artifact_retention_pin_tombstone
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_retention_pin_tombstone_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:166-190"
  - "Plans/Runtime_Artifacts_Panel.md:2048"
preserved_exact_tokens:
  - durable
  - session_bounded
  - ephemeral_view
  - storage_read_only
negative_constraints:
  - Do not let panel cleanup or expiry delete canonical records or clear legal-hold refs.
  - Do not render a tombstone as failed, blocked, or empty.
  - Do not enable pin-to-keep in viewer or blocked storage modes.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

## Run & Debug Revival Addendum - 2026-07-27

This addendum closes the cross-cutting "debug adapter model" deferral recorded in this document's consume-list by pointing contract ownership at `Plans/FinalGUISpec.md` Run & Debug Revival Addendum (F3-482..F3-496, referenced by unit id only, never restated). It introduces no artifact schema changes and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### RAP-053 - Debug Adapter Model Deferral Closure

```yaml
plan_unit_id: RAP-053
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The "debug adapter model" contract this document's consume-list previously deferred is now owned by
  Plans/FinalGUISpec.md F3-494 (debug adapter registry, capability gating, portability - consumed by
  reference); runtime artifacts that record debug sessions reference dap_session_id through the
  existing §5A investigation identity discipline (referenced, not restated); no artifact schema
  changes are introduced by this closure.
gui_related: false
gui_classification_reason: This unit records a contract ownership pointer with no visible surface.
depends_on: [RAP-052]
unblocks: []
acceptance_criteria:
  - The consume-list "debug adapter model" deferral resolves to Plans/FinalGUISpec.md F3-494 by reference; no adapter registry, capability, or portability prose is restated here.
  - Debug-session runtime artifacts reference dap_session_id only through the existing §5A investigation identity discipline.
  - No artifact schema change is introduced by this closure.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future debug-session artifact identity fixtures
risk_class: contract_ownership_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_adapter_model_deferral_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:191"
  - Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-494; referenced)
preserved_exact_tokens:
  - dap_session_id
  - debug adapter model
negative_constraints:
  - Do not restate the debug adapter registry, capability gating, or portability contract here; Plans/FinalGUISpec.md F3-494 owns it.
  - Do not mint a new artifact family or identity field for debug sessions; §5A investigation identity discipline is referenced, not restated.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
```

## Additive Correction v4 — Plan Revisions, Embeds, And Execution Reports (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (the artifact side of
`PDET-001..012`, `PPROG-015..016`, and `WONV-008`) to this owner.
`Plans/Assistant_Plan_Runtime.md` owns the Plan document and its lifecycle; this document owns
artifact identity, rendering, fallback, retention, and export.

### PDET-004, PDET-006 — One immutable revision per Plan version

Each Assistant Plan version is one immutable shared Runtime Artifact revision referenced by the
thread. Rich Text and Markdown resolve the same structured revision; two independently editable
bodies are never stored, and Plan metadata is not duplicated into Plan storage.

Deleting or hiding a thread card never purges a Plan artifact still referenced by a Planning
Wizard handoff, a Goal, a Crew or Review run, a Usage record, an export, or another artifact.
Retention follows the shared reachability and hold rules already owned here. Card visibility is
not deletion authority.

### PDET-008..010 — `PlanArtifactEmbed` and the shared renderer

```text
pm.assistant_plan.artifact_embed.v1
  block_id            stable Plan block this embed belongs to
  artifact_id
  artifact_version    frozen at approval
  renderer_kind       mermaid | graph | chart | image | diagram | table |
                      code | checklist | video | interactive | <registered>
  display             inline | expanded | thumbnail
  caption
  text_summary        always present, so the block is meaningful without the renderer
  static_fallback_ref used by PDF and by any renderer-unavailable path
  source_ref
```

Every supported kind renders through the shared artifact renderer. The Plan never carries a
private per-type renderer, and a future registered renderer kind is available to Plans without a
Plan-side change.

An embed resolves the frozen `artifact_version`. Changing that artifact later does not change an
approved Plan, and nothing resolves "latest" at render time.

Interactive content runs only in the shared sandbox, with renderer capability and origin checked
against `Plans/Permissions_System.md`. Markdown-embedded HTML is never treated as trusted
application UI, and arbitrary untrusted script is not executed.

### PDET-011..012 — PDF fallback and unavailable blocks

PDF export renders a video or interactive block through its `static_fallback_ref` with the caption
and a stable artifact reference. A supported block is never silently dropped, and the export never
implies that interactivity survived into the PDF.

A missing, stale, permission-denied, or unsupported embed renders an explicit unavailable block
naming which of those four it is. The user can open Details, repair, or re-export; content is
never omitted silently and one artifact version is never substituted for another. Export results
report the same truth as the on-screen block.

### PPROG-015..016 — The execution report is a separate artifact

Plan document export contains the approved document only, and exporting never alters `plan_hash`.

```text
pm.assistant_plan.execution_report.v1
  assistant_plan_id, plan_version, plan_hash, plan_run_id,
  progress_ref, todo_refs[], deviations[], evidence_refs[]
```

The report may include To-Dos, step states, deviations, evidence, attempts, and a completion
summary. It states its own currentness and its source Plan hash, and it is never presented as the
approved Plan. Both exports are produced by `cmd.chat.plan.export` under
`content_kind: plan_document | execution_report`; no peer export command exists.

### BSTALE-009 — Stale browser captures are inspectable, and carry no secrets

A stale browser capture keeps an artifact-side Details record exposing the original
page, session and generation, the capture time, the identity hints that failed to
match, and the typed reason. Protected authentication surfaces stay excluded, and no
credential, cookie or storage value is persisted into that record.
`Plans/Section15_MVP_Promoted_Features_Spec.md` owns the revalidation taxonomy; this
owner owns the durability and disclosure of what it writes down.

### WONV-008 — Research artifacts use Puppet Master identity

Wonderer research and synthesis output is a Puppet Master artifact with progressive disclosure:
a summary, an analysis, and deeper dossiers, each routeable through ordinary artifact identity.
An absolute external profile path is never the deliverable, and no Hermes profile-home handoff is
required to read a lead.

## Notebook Artifact Reference Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Notebook entries reference runtime artifacts identity-native (`artifact_id` + frozen `artifact_version`, never repo paths or export-local surrogates), consistent with RAP-008 and embed freezing. When a referenced artifact is later redacted, revoked, blocked, expired, or omitted, the note's claim is revalidated against current artifact state at reuse: transition/recovery rechecks active evidence, and an old note cannot reactivate revoked evidence or imply cleanup occurred. Raw logs and media stay artifacts; note text never duplicates their bytes.

```yaml
plan_unit_id: RAP-055
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Notebook artifact references are identity-native with frozen versions. On retrieval or resume, referenced artifact state (active/redacted/revoked/blocked/expired/omitted) is revalidated; old notes cannot reactivate revoked evidence or imply cleanup occurred, and raw logs/media remain artifacts rather than note bodies.
gui_related: false
gui_classification_reason: Artifact reference semantics are data behavior; panel rendering is unchanged.
depends_on: [RAP-054, WN-013]
unblocks: []
acceptance_criteria:
  - Revoked/expired references render with truthful unavailable state, never rehydrated content.
  - Identity-native references survive cleanup/archive moves.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: evidence_reactivation
reasoning_tier: standard
context_scope: runtime_artifacts
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: artifact_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A46
preserved_exact_tokens: ["artifact_id", "artifact_version", "revoked"]
negative_constraints:
  - Do not rehydrate revoked evidence through notes.
  - Do not imply cleanup occurred from stale note state.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Working_Notebook.md
