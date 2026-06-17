# Models System (Canonical SSOT)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Coverage blocker provider/model precedence owner section
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for the Puppet Master model selection, configuration, and variant system — how models are identified, selected, overridden per Persona, and cycled via variants. All other plan documents MUST reference this document by anchor (e.g., `Plans/Models_System.md#MODEL-ID`) rather than restating model selection rules or variant definitions.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- CLI-bridged providers: `Plans/CLI_Bridged_Providers.md`
- Provider OpenCode: `Plans/Provider_OpenCode.md`
- Persona system: `Plans/Personas.md`
- Run modes: `Plans/Run_Modes.md`
- OpenCode baseline (models): `Plans/OpenCode_Deep_Extraction.md` §7H
- GUI specification: `Plans/FinalGUISpec.md`

---

## Provider/model precedence and settings resolution


### Scope and owner boundaries

This section is the single owner section for provider/model precedence across run, seam, package, node, overseer, and delegated-subagent scope.

- Parallel-node worktree assignment may narrow the allowed provider/model surface for a node, but it does not replace the requested-versus-effective resolver record.
- Ownership transitions between overseer and delegated-subagent levels must stay in this owner section so later addenda elaborate the policy without replacing the canonical resolver contract.

### Three-axis settings model

Settings resolution is always described on three axes:
- `source`: where a candidate value came from (`manual_override`, `persona_preference`, `surface_default`, `scope_policy`, `config_default`, `provider_default`).
- `request`: the value explicitly requested for this run or child run.
- `execution`: the value actually handed to the selected provider/runtime after capability checks, worktree assignment, and policy gating.

The display grammar MUST preserve the distinction between requested and effective values for provider, model, variant, effort, auth mode, and account identity.

### Deterministic precedence by scope

The canonical precedence chain is:
1. explicit run-envelope override
2. scoped owner policy for the active execution unit (`run`, `seam`, `package`, `node`, `overseer`, or delegated subagent)
3. Persona preference
4. surface or stage default
5. project or global config default
6. last-used state where the surface explicitly permits it
7. provider default

Rules:
- the same inputs and availability set MUST produce the same effective result
- scope-specific policy MAY narrow or pin provider/model choices, but it MUST still emit requested versus effective values
- parallel-node worktree assignment participates in precedence when a worktree owner constrains the allowed provider/model surface for that node
- ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently inheriting stale effective state

### Resolver inputs and emit shape

Resolver inputs MUST include:
- requested Persona and run-envelope overrides
- surface/stage defaults
- scope owner policy (`run`, `seam`, `package`, `node`, `overseer`, delegated-subagent)
- capability snapshot and model metadata
- account/profile availability
- worktree assignment and execution-role context
- permission ceiling and mutation policy

The resolver MUST emit one shared record containing at least:
- `requested_platform`, `effective_platform`
- `requested_model`, `effective_model`
- `requested_variant`, `effective_variant`
- `requested_auth_mode`, `effective_auth_mode`
- `requested_account_id?`, `effective_account_id?`
- `execution_role`
- `selection_reason`
- `resolver_matrix_entry`
- `worker_policy_display`
- `skipped_persona_controls[]`

That emit shape is consumed by runtime snapshots, inspectors, and owner transitions; later sections in this document elaborate, but do not replace, this owner section.

Provider/model concern surfaces share the concern lifecycle vocabulary used by runtime owners: `active`, `acknowledged`, `resolved`, and `dismissed` remain separate states; `resolution_kind` includes `accepted_risk`; and any concern-action confirmation matrix must disclose whether model/provider selection may proceed, block, retry, or require user confirmation. `Plans/GUI_Rebuild_Requirements_Checklist.md` consumes those first-class concern lifecycle and lineage requirements without becoming the provider/model owner.

Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.md`, `Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md` consume this policy, including `/persona/surface/default` compatibility wording, but do not replace it.

Node execution settings use requested-vs-effective disclosure across `/model/effort/persona`, `/model/effort`, `/settings`, `/type`, runtime-model policy, node-worker policy, and per-node execution. `feature seam`, `work package`, node, work-package overseers, and overseer-spawned subagents may each carry provider/model/effort defaults and overrideability; auto-selected defaults may use `/easiest` policy only when it is explicit in the resolver record. package-based worktrees require `/ordering` and lane rules for dependent-node execution, and safe-point-like state handoff must remain tied to the canonical safe-point contract.

Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over the canonical `/effective` provider/model record.

GitHub and project account context are separate selection inputs: `GitHub_Integration`, `GitHub_Integration.md`, `storage-plan`, and `storage-plan.md` consume current-repo, current-account, selected_repo_id, and project-scoped account policy state without moving the provider/model precedence owner out of this document.

Adjacent owner references repeatedly implicated in provider/model cleanup include `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Multi-Account.md`, `Plans/Widget_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Executor_Protocol.md`, `Plans/Orchestrator_Page.md`, `Plans/Provider_OpenCode.md`, `Plans/UI_Command_Catalog.md`, `Plans/Permissions_System.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/assistant-chat-design.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, `Plans/Tools.md`, `Plans/Glossary.md`, and `Plans/Personas.md`; they are consumers or adjacent owners, not substitutes for this provider/model precedence section.

Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields must not disappear from requested/effective disclosure.

Owner-of-owners cleanup is implementation-relevant: 00-plans-index.md, plans-index, Decision_Log, Decision_Log.md, rewrite-tie-in-memo, rewrite-tie-in-memo.md, feature-list, feature-list.md, newfeatures.md, addendum-to-plan-map, SSOT rows, highest-value owner-of-owners routing, promoted-feature phasing, `/packages/lanes/overseers`, `/tab`, tier-era execution, `/effective` identity, and rewrite-critical contracts must not amplify drift for provider/model selection.

Run Graph event-update vocabulary is historical input only. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` event-update rows such as `TierChanged`, `IterationStart`, `GateStart`, `GateComplete`, `UserInteractionRequired`, and `EvidenceStored` must be mapped to current execution-unit and requested/effective model events before they drive provider/model UI.

Provider account snapshots are runtime-wide. `storage-plan` and `storage-plan.md` must model durable provider account snapshots for runs and for other actor classes that use the same provider runtime, not only the run actor class.

Resolver selection reason text is concise but structured. Standard explanation snippets include `Package overseer default`, `Seam integration default`, `Node implementation match: Rust + backend`, `Review pass default`, `Recovery actor default`, and `Provider fallback from preferred persona model`.

Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider, model, execution role, or operational identity into one value.

Provider IDs and model IDs remain explicit in effective snapshots: `anthropic/` namespace prefixes, `provider_id: cursor`, `provider_id`, `model_id`, and `/effective` values are retained as data, not rewritten into display-only names.

Pre-run chain configuration keeps isolation explicit. `Plans/chain-wizard-flexibility.md` / `/chain-wizard-flexibility.md` consumers may expose `pre-run` setup, but `/isolation` remains part of the model/runtime selection record when it affects provider or execution behavior.

Storage-backed model selections are canonical-record entries. `Plans/storage-plan.md` / `/storage-plan.md` must preserve the durable selection record rather than treating model choice as transient UI text.

Model selection surfaces expose `Workers`, `Providers & Models`, `Execution Identity`, and `HITL` as first-class labels. `/model`, multi-account context, orchestrator-only recovery, `Recovery`, and `Governance` states may drive those surfaces, but the labels must stay tied to the shared model owner contract.

Node and package settings must preserve `node-effective` and `overseer-effective` snapshots when graph-patch-triggered work changes provider behavior. `/package/node`, provider-model, overseer-controlled, `/model`, `/config`, `/review`, and delegated-subagent records all resolve through the same requested/effective model contract.

Execution object copies are execution-object-level records, not loose GUI hints. The GUI must not-forget node-worker and `/model` ownership when it renders or copies provider/model state for execution objects.

Legacy tier-scoped references from `Plans/feature-list.md`, `Plans/00-plans-index.md`, `/feature-list.md`, `/00-plans-index.md`, and feature-list material are compatibility inputs only and cannot override the current provider/model owner contract.

Resolution receipts may preserve exact explanatory labels such as `Requested model: claude/sonnet`, `Effective model: claude/sonnet`, `Reasoning effort: requested high -> skipped`, `/sonnet`, `Inherited from Project policy`, `Overridden by Package override`, and `Reason: provider does not support effort on this model`; those labels describe the /source of a requested/effective decision rather than becoming a separate resolver schema.

Provider integration references across `Plans/Provider_OpenCode.md`, `Plans/Permissions_System.md`, `Plans/CLI_Bridged_Providers.md`, `/Provider_OpenCode.md`, `/Permissions_System.md`, and `/CLI_Bridged_Providers.md` remain adjacent implementation surfaces for model/provider execution.

Cross-system account rows marked already-canonical must keep `Models_System`, `Models_System.md`, `/account`, and cross-system provider/account behavior aligned with this owner contract.

Adjacent UI and persona compatibility references preserve both full paths and legacy aliases for `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/FinalGUISpec.md`, `/storage-plan.md`, `/Orchestrator_Page.md`, and `/Personas.md`.

Blocked model/runtime state records preserve `blocked_reason_code = waiting_approval` without losing `tier_id`, `tier_type`, `request_id`, `blocked_sequence`, `waiting_approval`, `human-in-the-loop`, `blocked_reason_code`, `human-in-the-loop.md`, or blocked-episode context.

Selection and execution receipts keep three trace axes distinct: execution/result axis, source axis, and request axis. For example, `/result`, `/attempt`, `/runtime`, and `/skipped/clamped` values describe the receipt location and skip/clamp outcome rather than redefining model identity.

Multi-account and persona compatibility references preserve `Plans/Multi-Account.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/Multi-Account.md`, `/Orchestrator_Page.md`, and `/Personas.md` when provider/account context is displayed beside model selection.

Runtime artifact panels may expose `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Show in Usage`, and `Show in Ledger`, but those labels are views over the provider/model snapshot and receipt state.

Help and explanation copy must preserve copy-depth and concept-governance metadata. `Personas.md`, `Models_System`, `Models_System.md`, `FinalGUISpec.md`, `/help`, authored-copy, `Expert`, and `ELI5` outputs may simplify presentation, but they must not simplify the underlying provider/model contract.

Executor integration requires execution-scoped provider/model context. `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `/runtime`, `/executor`, and execution-unit identity are the minimum anchors for dispatch, retry, blocked handling, and receipts.

Cost and receipt views must remain canonical. `/Ledger`, deep-link targets, `cost_usage`, and artifact-local UI state must resolve to shared Usage/Ledger identity instead of creating artifact-local cost or receipt models.

Repository-wide catalog references may cite `Plans/*.md`, top-level plan coverage, and the current `61` plan-file inventory, but those references do not move provider/model ownership out of this document.

Execution settings preserve distinct execution-settings defaults and overrides for run/global context, feature seams, work packages, nodes, work-package overseers, feature-seam overseers, and overseer-delegated node workers. `/model`, `/global`, and `/override` values all remain visible as requested/effective provider/model state.

Node worker policy is dynamic-by-default from node scope and `/type`. node-worker, `/package/node`, per-node, and `/model/effort` settings are configuration inputs, not ad hoc per-node manual model names.

Delegation policy remains explicit. delegation-policy settings decide whether overseers may use subagents for node work and, if allowed, which provider/model policy governs delegated node workers.

Lifecycle transitions require an event model: the event that causes each state transition must be represented with the execution-unit, provider/model snapshot, blocked-state, and receipt identity that made the transition valid.

The legacy four-tier hierarchy from newfeatures.md and the canonical chain-wizard-flexibility / chain-wizard-flexibility.md node-graph model are incompatible execution models; compatibility text must name four-tier and node-graph explicitly instead of blending them.

Simple help must simplify explanation, not rename the model: canonical names stay stable, ELI5 mode explains them more plainly, and friendly labels cannot create parallel object names that drift away from contracts.

Interview routing keys must reject duplicated phase words: interview-phase-phase and interview-phase-phase-* are routing-key bugs, not alternate model identifiers.

Route-target records must make resume_url concrete. A route-target may point back to a resume_url, but the resolver still records the target owner and route reason.

Tab identity is scoped. `tab_id` must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.

Runtime-control support receipts use explicit support chips or rows: `Temperature: 0.2 -> Honored`, `Top-p: 1.0 -> Clamped to 0.9`, and `Reasoning effort: High -> Skipped` are display labels over the requested/effective model capability check.

Artifact-opening surfaces consume the same subject-open resolver. Runtime_Artifacts_Panel, Runtime_Artifacts_Panel.md, subject-open, artifact-bearing, and artifact-opening state do not create bespoke provider/model opening rules.

Model selection can be lane-aware when lane policy requires it. lane-level, security-focused, lane-aware, package-level, and `/graph` constraints must be represented in the model binding if a lane enforces a provider/model.

Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.

Scope labels must distinguish app, project, surface, role, seam, package, node, manual, turn, session, run, task, and subagent sources. `/session/run/task/subagent` and `/package/node` are explicit override scopes.

Provider/model settings are never single-project by assumption: runtime-affecting overrides may be app, project, `/per-package`, seam, `/package/seam/node`, overseer, or delegated-subagent scoped, and the resolver must preserve the scope that selected or constrained the value.

The owner-doc cleanup rule is strict: if anchor tables, `/body` prose, addenda, or compatibility examples leave old and new provider/model models both canonical in the same surface, this document must collapse the split-brain rule into one requested/effective resolver statement instead of treating audit value-add wording as product canon.

Concern and `/corroboration` state for provider/model selection is operational, not surface-level decoration. Execution-core owners must record whether concern evidence changes selection, blocks execution, permits accepted risk, or only annotates the requested/effective receipt.

Routing, `/registry/governance`, and provider/model ownership contradictions stay with this owner-doc until resolved; adjacent docs may consume registry or routing outcomes, but they cannot define a second provider/model authority.

Planning and `/output` surfaces consume the same subject-open model as artifact-opening flows. file-opening documentation may realize a chosen subject, but it must not replace the shared subject-open resolver or create provider/model-specific open rules.

Transport-vs-upstream identity remains visible: vs-upstream provider/runtime examples must disclose whether `/runtime` identity belongs to the transport wrapper or the upstream provider.

Executor compatibility keeps `Executor_Protocol`, `Executor_Protocol.md`, `/seam`, `/execution`, execution-unit, and TierContext references mapped to the current execution-unit context and package/seam overseer governance model.

GUI/help labels keep expert and canonical terms stable. GUI, `/Expert`, `/help`, `/loaded`, and `/canonical` views may simplify loaded terms, but canonical names remain the source of truth.

Tier-native ingestion and active-agent tracking are legacy compatibility inputs. tier-native, active-agent, lane-aware scheduling, and worktree tracking must resolve through package/lane ownership rather than reviving tier-native execution semantics.

## 1. Canonical model identifier
<a id="MODEL-ID"></a>

### 1.1 Format

A model is identified canonically by `provider_id/model_id`.

Rules:
- split on the first `/` only.
- `provider_id/model_id` remains the stored and runtime-canonical model identifier.
- label cleanup, grouping, family pooling, and runtime-platform grouping must never rewrite the canonical identifier.
- GUI indexing and grouping may use a normalized internal key for `/collision-safe` behavior, but user-facing dropdowns/cards still display the cosmetic label and never rewrite the stored canonical model id.
- Canonical model IDs align with persisted vocabulary in `Plans/Contracts_V0.md` (`/Contracts_V0.md` in legacy path references); contracts may cite the model provider namespace, but they do not redefine this identifier grammar.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md

### 1.2 Runtime-platform distinction

Model identity and runtime-platform identity are separate concerns.

Required fields:
- `requested_model` / `effective_model` keep the canonical model id
- `requested_runtime_platform_id` / `effective_runtime_platform_id` disclose the concrete runtime surface
- `requested_model_provider_id` / `effective_model_provider_id` disclose the model vendor namespace when that differs from the runtime surface label
- `provider_usage_source_kind?` records the usage-evidence source family for the selected runtime surface
- when model/runtime selection is shown beside usage data, `provider_usage_source_kind?` maps to the Usage/Contracts `usage_source_kind` field and preserves whether the evidence is project-local, provider/API-backed (`/API-backed`), API-key-derived, OAuth-quota-derived, or estimated instead of flattening all model rows into one source label
- `provider_signal_confidence?` records confidence for provider-derived signals that affect model/runtime availability or usage disclosure
- `model_id_raw`, `effort`, `compact_threshold`, `auth_family`, `pool_scope`, `effective_runtime`, and `effective_runtime_snapshot` remain inspectable runtime/model fields when they affect selection, compatibility, or requested/effective disclosure.
- In `/OpenCode-era` multi-platform availability, platform-mapping is additive: raw IDs and `provider_id/model_id` stay exact, while runtime-platform fields distinguish surfaces such as `gemini_direct`, `gemini_cli`, OpenCode bridges, and Cursor CLI without renaming the canonical model ID.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

### 1.3 Display-name policy

GUI labels may clean spacing or casing for readability, but they must preserve meaningful tokens such as version, `mini`, `pro`, `flash`, `thinking`, and coding-plan suffixes.

Duplicate runtime availability remains runtime-qualified. If the same canonical model appears through multiple runtime surfaces, the UI disambiguates with secondary runtime-platform context instead of minting a fake new canonical model id.

GUI `/disambiguation` uses secondary text such as `/runtime/auth-family/billing` context when a `cleaned-label` collision occurs. Cosmetic display labels, normalized internal keys, and collision-safe grouping must not mutate the stored `provider_id/model_id`.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md
## 2. Model and runtime selection priority
<a id="SELECTION-PRIORITY"></a>

Model and runtime selection remains deterministic and follows the same requested/effective runtime pipeline used elsewhere.

| Priority | Source | Description |
|---|---|---|
| 1 | explicit override | run envelope, manual picker, tier override, or surface-level override |
| 2 | Persona runtime preferences | per-Persona defaults for provider entry, model, variant, and supported controls |
| 3 | surface defaults | Chat, Interview, Builder, Orchestrator, or profile defaults |
| 4 | project/global defaults | configuration defaults including preferred runtime family or model |
| 5 | last used | previous user choice when still valid |
| 6 | internal/provider fallback | provider/runtime default chosen after capability filtering |

ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Selection rules:
- the runtime first resolves the concrete provider entry/runtime surface, then the effective model within that surface.
- `provider_family_id` may influence pooling or fallback, but it does not replace the concrete provider entry selection.
- if the runtime internally reroutes to another effective model or model variant, that deviation is captured as runtime evidence; it does not rewrite the frozen requested selection.
- model availability and capability checks must consider the concrete runtime surface, not just the vendor model namespace.
- Gemini CLI deterministic selection precedence is explicit: `--model`, then `GEMINI_MODEL`, then `settings.json` `model.name`, then a local model router when enabled, then the provider default. PM-owned run setup uses that chain to force the requested model where possible, and any Gemini CLI `general.plan.modelRouting` value that remains `true` must be reflected as requested/effective routing evidence instead of silently changing the model. Even when PM passes `--model`, Gemini CLI plan/sub-agent routing can choose internal models, so PM must record requested/effective model evidence instead of equating `/model` or `--model` with every internal choice.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md
## 3. Model options configuration

<a id="MODEL-OPTIONS"></a>

### 3.1 Per-provider options


Provider-specific options are configured under `config.provider.<provider_id>.options`:

```toml
[provider.anthropic.options]
max_output_tokens = 64000

[provider.openai.options]
max_output_tokens = 32000
```

### 3.2 Per-model options

Model-specific options override provider defaults:

```toml
[provider.anthropic.models."claude-sonnet-4"]
max_output_tokens = 128000
temperature = 0.7
```

### 3.3 Standard option fields

#### 3.3.1 Runtime and pricing capability fields

The capability matrix includes transport-shaping and billing-shaping fields that are consumed by provider adapters, prompt assembly, and usage attribution.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

| Field | Type | Meaning |
|---|---|---|
| `system_role_name` | string | Role name used for system-level instructions (`system` or `developer`) |
| `streaming` | bool | Provider supports incremental stream delivery |
| `tool_use` | bool | Provider/runtime surface supports tool calls |
| `thinking_blocks` | bool | Provider can emit or replay reasoning/thinking blocks |
| `cache_control` | enum/string | Cache strategy family supported by the provider surface |
| `cache_with_oauth` | bool | Cache markers remain valid when this surface is authenticated with OAuth |
| `assistant_prefill` | bool | Assistant-prefill semantics are supported |
| `parallel_tool_calls` | bool | Provider supports true parallel tool-call issuance |
| `image_input` | bool | Image payloads accepted |
| `max_payload_bytes` | integer | Hard payload ceiling |
| `pricing_version` | string | Versioned pricing metadata key used for cost calculation |
| `billing_entity_mode` | enum | whether billing attribution is account-only or requires billing-entity keying |
| `billing_entity` | string? | Billable quota or tenant dimension used in `(model_id, provider_id, billing_entity)` cost keys when applicable |
| `billing_source` | string? | Display/evidence label for the pricing source, including free-tier, server-authoritative, user override, or estimate-only paths |

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Gemini CLI keep distinct capability entries, and Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.

Provider/catalog discovery remains dynamic and model-scoped. OpenCode `models.dev` and provider `/catalog` evidence may supply model-level capability metadata such as reasoning, `/tool/temperature` support, limits, modalities, and pricing; PM records this as capability data rather than hardcoding provider defaults. Selectable-unit snapshots preserve `requested_default` and `effective_capabilities` so UI defaults and runtime routing can explain which provider/model entry was requested and what capability block was actually discovered. `cursor-agent models` is live catalog evidence whose returned IDs may encode reasoning variants directly, so PM must discover those IDs instead of inferring variants from vendor name alone.

#### 3.3.2 `system_role_name` values

Role-mapping is data-driven through `system_role_name`. OpenAI reasoning surfaces use developer-role semantics by setting `system_role_name = "developer"`, and bridged-provider adapters must stay aligned with `Plans/CLI_Bridged_Providers.md` rather than inventing local role names.

| Provider family | `system_role_name` |
|---|---|
| Anthropic | `system` |
| OpenAI standard | `system` |
| OpenAI reasoning family | `developer` |
| Gemini Direct | `system` |
| Gemini CLI | `system` |
| Other providers | `system` by default |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md

#### 3.3.3 Compaction threshold defaults

Per-model defaults are part of the model metadata and MAY be overridden by model-specific config:
- `pressure_start_pct = 70`
- `pressure_aggressive_pct = 85`
- `large_block_threshold = 1200`
- per-model `compact-threshold` override when defined; unknown capability state must be shown explicitly rather than guessed.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

### 3.4 Provider transform layer

Per-provider normalization and options injection is handled by the provider transform layer (`Plans/CLI_Bridged_Providers.md`). This includes:
- Message normalization (e.g., Anthropic rejects empty content).
- Provider-specific headers and features (e.g., Anthropic beta headers).
- Schema transformation for tool definitions.
- Max output token enforcement.

Provider-side context caching, cache-key / cache-TTL support, and large-context / 1M beta handling are model/runtime capability facts, not PM web-content-cache behavior. When a provider SDK exposes `setCacheKey` or an equivalent cache-key hook, PM records the provider-side cache semantics in provider capability and request metadata so reuse, billing, and debugging remain tied to the effective runtime surface.

Provider cache-config remains internal `/automatic` behavior for MVP: PM may surface raw/debug evidence for reuse, billing, and troubleshooting, but it does not expose provider-cache controls as a general user-facing settings surface.

Provider cache marker names are provider/runtime-specific and must stay explicit in capability evidence. Anthropic and `/OpenRouter` surfaces may expose `cacheControl`, Bedrock may expose `cachePoint`, OpenAI-compatible surfaces may expose `cache_control`, and Copilot-style surfaces may expose provider-native variants such as `copilot_cache_control`; PM maps those names into the canonical `cache_control` capability/billing vocabulary without pretending the upstream wire fields are identical.

Compatibility evidence that labels a Google Vertex AI/Google AI cache-marker gap as `cachePoint` is treated as a `cache_control`/`cachedContent` capability issue; PM must emit the native cache marker for the selected route or repeated 5-15K-token prompt spans may be BILLED again instead of reusing cache.

Anthropic/Bedrock cache support must preserve message/cache marker placement and provider metadata support such as `metadata.user_id` where available; OpenCode issue evidence `#11083`, `#11276`, and `#8138` remains reference evidence for deployments where that support affects cache behavior.

Provider-specific request shaping remains capability evidence rather than generic runtime logic. OpenCode-discovered Alibaba entries such as `alibaba-cn` may require `enable_thinking=true` for reasoning models, so PM records `enable_thinking` as provider-specific request metadata for that runtime surface instead of treating it as a universal model option.

Google Vertex Anthropic 1M-context support is runtime-path-specific. PM must not hardcode one universal 1M-context signal because implementation-reference issues disagree on whether the correct signal is a header or a body field depending on endpoint and /runtime path (`#14003`, `#17494`, `#14055`). The capability snapshot must keep the endpoint/runtime-path evidence, effective context window, and any required model-id suffix, shadow variant, or model-id rewrite rules explicit.

Reasoning/effort controls must be resolved per runtime surface across direct providers, bridged CLIs, and subagents because OpenCode evidence shows provider-specific behavior across OpenAI, Copilot, Anthropic, Bedrock, Gemini, Groq, Azure, OpenRouter, Venice, Alibaba-compatible, and ZAI-compatible surfaces.

OpenAI/Azure-family API-family selection and API path selection are per-model and `/per-provider` model/runtime compatibility facts. Azure loaders that switch between `responses()` and `chat()` based on `useCompletionUrls` must preserve that choice in provider capability and request metadata; non-OpenAI Azure-hosted models must not be forced down the wrong OpenAI API path because upstream hangs have been observed when `useCompletionUrls` selects an incompatible route (`#12949`, `#17552`).

OpenCode reference evidence prefers the Responses API for OpenAI, while Chat-Completions-only proxies have known compatibility issues (`#15016`, `#7793`); PM records the selected OpenAI/Azure API family per model/runtime instead of assuming a universal route.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

---

## 4. Model availability and error handling

### 4.1 Availability and runtime-surface checks

A model is available only when its provider/runtime surface is registered, authenticated, reachable, and compatible with the requested run posture.

Model catalog entries carry `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`. Deprecated models may continue for compatible existing work with a `deprecation_notice_ref?`; `/sunset` or `sunset` models require `sunset_at_utc?` and `replacement_model_id?` when known and are not eligible for new dispatch unless an explicit compatibility policy permits them. Removed models are retained only for history, receipts, and migration lineage.

Provider stop reasons and finish-reason normalization rules are not sufficient tool-loop completion evidence. Gemini and OpenAI-compatible providers can emit tool calls while also reporting `finish_reason = stop`; PM's `/control-flow` logic must continue through tool execution, tool-result ingestion, and response continuation checks instead of treating `finish_reason` or `finish_reason = stop` as final by itself (`#14972`).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

### 4.2 Pricing metadata and stale-pricing behavior

Pricing metadata is versioned. `pricing_version` identifies the pricing table used for cost calculation. User-supplied overrides are applied before warnings. Doctor integration warns when stored pricing metadata is stale relative to the current provider metadata snapshot.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

Cost attribution is keyed by `(model_id, provider_id, billing_entity)` when the provider's quota semantics depend on a billing entity; persisted records may expose a stable `billing_entity_id` or alias, but `billing_entity` is the canonical dimension for model pricing. Free-tier rows show `$0` with a `billing_source` label so cost displays do not flatten provider/runtime billing provenance.

AWS Bedrock pricing uses the same `pricing_version`, stale-pricing warning, and user-override path as other providers; AWS-specific region-prefix or price-drift evidence is handled by the Bedrock lookup below rather than hardcoded price branches.

OpenCode product pricing is a reference formula, not an authoritative PM cost source. PM may cite `packages/opencode/src/session/index.ts:getUsage` and `/opencode/src/session/index.ts:getUsage` when explaining the baseline estimate: normalize `/input` and `/output/reasoning/cache` buckets, then apply `input_rate`, `output_rate`, `cache_read_rate`, and `cache_write_rate` to `cache_read`, `cache_write`, and output/reasoning token buckets, using `over-200k` tiers when pricing metadata provides them. Provider-sensitive cache heuristics and provider caveats such as OpenRouter cache/input reporting differences remain visible in raw/debug cost evidence.

The explanatory formula is per 1M token pricing units: `input * input_rate`, `output * output_rate`, `cache_read * cache_read_rate`, `cache_write * cache_write_rate`, and `reasoning * output_rate`; the estimate may still be inaccurate for some providers such as OpenRouter because of cache/input reporting differences.

Provider-sensitive token counting uses `token_counting_adapter_id` and `token_counting_basis` before cost or budget enforcement reads canonical token buckets. Provider raw counts may be preserved for audit, but the adapter result is what feeds `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, and `reasoning_tokens`.

Context-detail `Breakdown` views that consume model/runtime usage metadata show the context usage bar, token buckets, and grouped breakdowns by role, tools, and provider/model when available.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

### 4.3 Bedrock region prefix lookup

Region-prefix mapping MUST use an explicit lookup table rather than string slicing.

For Bedrock, region and `/model-id` rewrite rules are deterministic provider-runtime compatibility facts: PM may add the required regional prefix only through the table below and must honor no-rewrite exemptions for ARNs and provider-native ids that are already canonical.

| Region family | Prefix |
|---|---|
| `us-east-*`, `us-west-*` | `us` |
| `eu-*` | `eu` |
| `ap-*` | `ap` |
| `sa-*` | `sa` |
| unknown/new region | no implicit prefix; require explicit mapping update |

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md

### 4.4 Two Gemini providers


### 4.5 Web tool provider capability alignment

This consumer-capability section mirrors the linked owner contract and stays aligned with it.

Core rules:
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- Site Reader is the DEFAULT and PRIMARY webfetch routing path; Firecrawl, Tavily, Exa, and other provider routes remain fallback/alternative paths that require explicit configuration, Site Reader failure, or an operation-specific override.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- The two-class provider model, model-native vs backend/API, is a DESIGN PRINCIPLE for provider settings and routing disclosure, not just a display classification.
- DuckDuckGo capability rows must preserve native-ish search, PM-composed research/fetch/extract, and partial crawl behavior instead of flattening those cells to unsupported.
- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl; deployment mode, requested/effective adapter identity, and capability differences remain visible before fallback or recovery.
- Tavily heavy-mode settings are never defaults: `search_depth: "advanced"`, `include_raw_content: true`, and high `chunks_per_source` values are reserved for precision needs or fallback scenarios. Default runtime behavior uses lighter Tavily modes such as `search_depth: "basic"` or `"fast"` and lets PM's search-then-read heuristic handle depth through native Site Reader; heavier provider-side retrieval activates only after an insufficient lighter pass or an explicit user request.
- DuckDuckGo / DDG remains the enabled-by-default best-effort `/no-key` fallback. It has no official API, uses HTML scraping only, and is poor for JavaScript-heavy SPAs, so provider-capability disclosure must show the fallback/partial nature instead of presenting it as equivalent to API-backed providers.
- When Exa is primary but the user specifically wants keyword search, `adapter_hint: "firecrawl"` or `adapter_hint: "google"` may override the selected adapter for that operation. This hint is per-operation routing input, not a global provider-stack reorder.
- Models_System mirrors the web-operation input/capability surface without owning payload validation: `websearch` includes `sources` and `categories` for multi-source routing; `webfetch` exposes `pdf_mode: fast|auto|ocr` with default `auto`; `webextract` accepts JSON Schema draft-07 `schema` with a 50KB maximum and no external `$id` references; and webfetch/webcrawl change detection reports diff status on re-fetch.
- `webresearch` defaults `autonomous` to false and has three support tiers: PM-composed default, enhanced PM recipe, and provider-native agent. The research-session variant of `automation_session` follows the browser capability and three-tier permission model in `Plans/Section15_MVP_Promoted_Features_Spec.md` and `Plans/Tools.md`.

Fields:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- Firecrawl is disabled by default until explicitly enabled in Settings

Labels and values:
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- Firecrawl webfetch capability is not erased by Site Reader primacy
- Tavily webfetch capability is not erased by Site Reader primacy
- Exa webfetch capability is not erased by Site Reader primacy
- fallback-only
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`
- native (model)
- pm-composed
- DuckDuckGo `websearch` is `native-ish`
- DuckDuckGo `webresearch` is `pm-composed`
- DuckDuckGo `webfetch` / `webextract` remain PM-composed or partial rather than flattened to `unsupported`
- DuckDuckGo partial crawl behavior must not disappear
- display label `Google`
- Google is a pluggable adapter slot
- Google official search is not a strategic backend
- Google `webfetch` keeps the pm-composed support semantics from the ledger
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
## 5. Per-Persona runtime preferences

<a id="PERSONA-MODEL-OVERRIDES"></a>

A Persona MAY specify preferred runtime settings in the PERSONA.md frontmatter (defined in `Plans/Personas.md` §3.2):

```yaml
---
id: "rust-engineer"
name: "Rust Engineer"
description: "Expert Rust developer."
default_platform: "anthropic"
default_model: "anthropic/claude-sonnet-4"
default_variant: "powerful"
temperature: 0.2
top_p: null
reasoning_effort: "high"
---
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `default_platform` | Optional | `string` or `null` | Preferred provider/platform. `null` or absent means inherit from the selection chain (§2). |
| `default_model` | Optional | `string` or `null` | Model identifier in `provider_id/model_id` format. `null` or absent means inherit from selection priority (§2). |
| `default_variant` | Optional | `string` or `null` | Preferred variant preset. `null` or absent means inherit from the selection chain (§2). |
| `temperature` | Optional | `number` or `null` | Preferred sampling temperature when supported by the active provider transport. |
| `top_p` | Optional | `number` or `null` | Preferred nucleus sampling value when supported. |
| `reasoning_effort` | Optional | `string` or `null` | Preferred effort/reasoning level when the provider transport exposes it. |

Rule: Persona runtime preferences participate at priority 2 in the selection chain (§2). They are overridden by explicit run-envelope or surface-level overrides (priority 1) but override surface defaults, config defaults, last-used state, and internal defaults.

Rule: If a Persona specifies a preferred platform/model/variant that is not available, the system logs a warning and falls through to the next priority level. The run is NOT blocked.

Rule: If a Persona specifies runtime controls (`temperature`, `top_p`, `reasoning_effort`) that the active provider transport does not support, those controls MUST be recorded as skipped and excluded from the effective runtime state rather than silently ignored.

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING

---

## 6. Variants system


<a id="VARIANTS"></a>

### 6.1 Definition

A **Variant** is a named model preset that the user can quickly switch between. Variants provide a fast way to cycle through models without editing config.

### 6.2 Built-in variants

Puppet Master ships with a set of built-in variants based on available providers:

| Variant name | Target model | Description |
|-------------|-------------|-------------|
| `default` | Per selection priority (§2) | The system-selected model. Always available. |
| `fast` | Smallest/cheapest available model | Optimized for speed and cost. |
| `powerful` | Largest/most capable available model | Optimized for quality. |

Built-in variants are resolved dynamically based on available providers at runtime. If a variant's target model is unavailable, the variant falls back to the `default` variant.

### 6.3 Custom variants

Users can define custom variants in config:

```toml
[[variants]]
name = "my-variant"
model = "anthropic/claude-sonnet-4"
description = "My preferred model for code review."

[[variants]]
name = "cheap"
model = "openai/gpt-5-mini"
description = "Budget-friendly option."
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | **Required** | `string` | Unique variant name. Regex: `^[a-z][a-z0-9-]{0,30}[a-z0-9]$`. |
| `model` | **Required** | `string` | Model identifier in `provider_id/model_id` format. |
| `description` | Optional | `string` | Max 200 characters. |

### 6.4 Disabling variants

Built-in and custom variants can be disabled:

```toml
[variants_disabled]
"fast" = true
```

Disabled variants do not appear in the model picker or variant cycling UI.

### 6.5 Variant cycling

The user can cycle through enabled variants via:
- A keybind (configurable, default unbound).
- The model picker dropdown in the Chat panel.
- The command palette.

When a variant is selected, its `model` field is used as the active model for subsequent runs (priority 3 in §2). The active variant is persisted per session (not across restarts unless `config.default_variant` is set).

### 6.6 Per-Persona variant overrides


A Persona MAY specify a preferred variant via a `default_variant` field in PERSONA.md frontmatter:

```yaml
default_variant: "powerful"
```

When set, this variant is pre-selected when the Persona is active. The user can still cycle to another variant during the session.

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA

### 6.7 Model aliases (friendly names)


Model aliases are optional friendly names that resolve to canonical model identifiers (`provider_id/model_id`) during model override parsing (for example, natural-language `model_override` in media generation).

Deterministic alias resolution requirements:
- Alias keys MUST be normalized by lowercasing and collapsing spaces/underscores/hyphens.
- Resolution order for user-provided model text is: alias → exact model id → exact display name.
- If no match is found, the caller receives a model-unavailable result from the requesting subsystem.

Aliases and variants are distinct concepts: aliases are lookup keys for model resolution, while variants are named model presets selected by the user.

### 6.8 Canonical media model alias table


<a id="MEDIA-ALIASES"></a>

The following aliases are registered by default for media-generation models. They are resolved by `media.generate` `model_override` (§2.3 of `Plans/Media_Generation_and_Capabilities.md`) and by any other model-override surface that uses alias resolution.

| Alias (normalized key) | Canonical model ID | Kind(s) |
|------------------------|--------------------|---------|
| `nano banana` | `gemini-2.5-flash-image` | image |
| `nano banana pro` | `gemini-3-pro-image-preview` | image |
| `veo fast` | `veo-3.1-fast-generate-preview` | video |
| `tts flash` | `gemini-2.5-flash-preview-tts` | tts |
| `tts pro` | `gemini-2.5-pro-preview-tts` | tts |

Alias keys are normalized per §6.7 rules (lowercase, collapse spaces/underscores/hyphens). Implementations MUST ship these aliases in the default alias registry; users MAY add or override aliases in config.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2

---

## 7. GUI requirements
<a id="GUI-MODELS"></a>

Model selection surfaces must distinguish human-friendly labels from canonical stored ids.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md

### 7.1 Model picker (Chat panel)

The chat model picker shows:
- primary label: cleaned model name for readability
- secondary label: runtime platform when needed for disambiguation
- capability indicators where available

Rules:
- selecting a model creates a priority-1 requested override.
- if two runtime surfaces expose the same canonical model id, the picker must show the concrete runtime surface on the secondary line.
- the detailed inspector must always expose the exact raw canonical model id.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md

### 7.2 Settings > Models

Settings must show:
- provider/runtime grouping
- concrete runtime surface availability
- current defaults and their source
- availability or capability gaps without inferring unsupported when discovery is merely silent or stale
- model discovery `/state`, including whether stale cached models remain visible while refresh runs, whether a single provider refresh failed, and whether progress is partial or complete.
- explicit actions for `Refresh Models` and `Refresh Providers`; initial connect, reconnect, and app boot/profile activation may refresh automatically, but user-triggered refreshes stay visible and scoped.
- `Edit Threshold` opens the most-local applicable override and discloses whether that value overrides the provider default or model default.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md

### 7.3 Variant and effort controls

Variant and effort controls remain runtime-qualified capability data.

Rules:
- effort support is never inferred solely from model-name similarity.
- unavailable, silent, or stale discovery should display `Unknown` instead of asserting `Unsupported`.
- the GUI must keep requested and effective reasoning/effort selections distinct when a runtime clamps or ignores them.
- Provider/model `/features` metadata may expose thinking-related controls as provider-specific option names, including Gemini CLI `thinkingLevel` for Gemini 3-style model features and `thinkingBudget` for 2.5-style flows; PM records these as runtime-qualified capability data rather than hardcoding a universal effort enum.
- Any legacy consumer wording in `Plans/assistant-chat-design.md` or `/assistant-chat-design.md` that treats Gemini effort or Cursor effort as universally unsupported is superseded by this runtime-qualified capability rule.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md


### 7.4 Detailed inspectors

Detailed inspectors show the exact raw canonical model id, concrete runtime surface, and any effective reroute or clamp the provider performed.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md
## 8. OpenCode baseline and Puppet Master deltas

<a id="BASELINE-DELTAS"></a>

Per `Plans/OpenCode_Deep_Extraction.md` §7H and §9H:

### 8.1 Baseline

OpenCode uses `provider_id/model_id` format with `parseModel()` splitting on the first `/`. Default model selection: config `model` field → last used (`model.json`) → internal priority sort. Model options via `config.provider.<id>.options` and provider-specific loaders. Variants are built-in + custom, cycling via keybind. Per-agent model overrides via `agent.<name>.model`. Provider transform layer handles per-provider normalization. Overflow detection via regex patterns on error messages.

### 8.2 Puppet Master deltas

1. **Model identifier format:** Same as OpenCode (`provider_id/model_id`). No delta needed.
2. **Configurable priority list:** OpenCode hardcodes the priority list. Puppet Master makes it configurable via `config.model_priority`.
3. **Per-Persona overrides:** OpenCode uses `agent.<name>.model`. Puppet Master stores model overrides in the Persona file (`default_model` in PERSONA.md frontmatter) for file-based management and GUI editing.
4. **Variant persistence:** OpenCode persists the active variant per session. Puppet Master adds `config.default_variant` for cross-session persistence.
5. **Provider transform in Rust:** OpenCode's transform layer is TypeScript. Puppet Master implements equivalent normalization in the Rust provider facade.
6. **GUI model picker:** OpenCode's TUI has a basic model selector. Puppet Master provides a full model picker dropdown in Chat, a dedicated Models settings tab, and per-Persona override editing.
7. **Overflow detection:** OpenCode uses regex-based detection across 12+ providers. Puppet Master ports these patterns to Rust and integrates with auto-compaction.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 9. Acceptance criteria

<a id="ACCEPTANCE"></a>

These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md

<a id="AC-MOD01"></a>
**AC-MOD01:** Model identifiers MUST use the `provider_id/model_id` format. `parseModel()` MUST split on the first `/` only.

<a id="AC-MOD02"></a>
**AC-MOD02:** Model selection MUST follow the priority chain in §2 deterministically. Given identical inputs, the same model MUST be selected.

<a id="AC-MOD03"></a>
**AC-MOD03:** Per-Persona `default_model` (§5) MUST override config defaults, last-used, and internal defaults, but MUST be overridden by explicit run-envelope or tier-config model settings.

<a id="AC-MOD04"></a>
**AC-MOD04:** If a Persona specifies an unavailable model, the system MUST log a warning and fall through to the next priority level. The run MUST NOT be blocked.

<a id="AC-MOD05"></a>
**AC-MOD05:** Built-in variants MUST resolve dynamically based on available providers. An unavailable variant MUST fall back to `default`.

<a id="AC-MOD06"></a>
**AC-MOD06:** Custom variants MUST be validated: unique name, valid model identifier, model available at definition time or warning logged.

<a id="AC-MOD07"></a>
**AC-MOD07:** The Chat panel model picker MUST display all available models grouped by provider and support variant quick-switch.

<a id="AC-MOD08"></a>
**AC-MOD08:** The Settings Models tab MUST support per-model option editing and variant management (add/edit/disable/remove).

---

*Document created for planning only; no code changes.*
## 10. Persona Runtime Controls and Provider Capability Matrix (2026-03-06)


This addendum expands the Models system so Persona-driven runtime control is explicit, provider-aware, and visible to the user.

### 10.1 Persona-driven model/runtime control principle

A Persona may request:
- platform/provider,
- model,
- variant,
- temperature,
- top_p,
- reasoning_effort,
- and provider-specific runtime options.

These Persona preferences participate in effective run assembly but MUST pass through a provider capability matrix before being applied.

### 10.2 Effective selection fields (cross-system runtime contract)


Effective model/runtime selection is part of the shared requested/effective identity contract.

Required cross-system fields are:
- `requested_platform`
- `effective_platform`
- `requested_model`
- `effective_model`
- `model_id_raw`
- `requested_variant`
- `effective_variant`
- `effort`
- `requested_auth_mode`
- `effective_auth_mode`
- `auth_family`
- `compact_threshold`
- `pool_scope`
- `effective_runtime`
- `effective_runtime_snapshot`
- `requested_account_policy`
- `requested_account_id?`
- `requested_account_binding?`
- `effective_account_id?`
- `effective_provider_identity?`
- `account_switch_reason?`
- `execution_role`
- `selection_reason`

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md

Rules:
- model selection does not collapse provider/account identity, execution role, and operational identity into one field
- support and disclosure must show whether a requested control was honored, skipped, or clamped
- same-provider accounts are not interchangeable for selection or history purposes

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md
### 10.3 Selection precedence (expanded)

The effective model/runtime selection chain is:

1. **Explicit run-envelope override**
   Manual surface selection or structured run override for platform/model/variant/runtime controls.
2. **Persona preference**
   Persona `default_platform`, `default_model`, `default_variant`, `temperature`, `top_p`, `reasoning_effort`.
3. **Surface/tier/phase defaults**
   Chat/Interview/Builder/Orchestrator/Multi-Pass defaults.
4. **Global/project config defaults**
5. **Last-used state** where supported
6. **Internal/provider defaults**

Rule: Given the same inputs and provider availability set, effective selection MUST be deterministic.

### 10.3A Direct coding-plan provider surfaces

`Alibaba Coding Plan`, `MiniMax Coding Plan`, and `Z.AI Coding Plan` are direct-provider architectural surfaces in PM's provider/model selection model.

Rules:
- direct-provider architectural direction for `Alibaba Coding Plan`, `MiniMax Coding Plan`, and `Z.AI Coding Plan` is strong enough to model now by using OpenCode as the implementation reference while confirmatory post-build verification remains pending
- these are coding-plan-branded products, so PM must preserve the product label such as `Alibaba Coding Plan` as a selectable/runtime-facing surface instead of collapsing it into an unbranded vendor family
- if the same provider family offers both coding-plan and pay-as-you-go products, GUI recommendation and picker surfaces must keep both products visible as separate selectable/runtime-facing account or provider entries rather than smoothing them into one vendor label
- each surface still resolves through requested/effective runtime, model, effort, account, and capability disclosure rather than through a loose vendor-family `platform` label
- implementation-reference status does not make OpenCode session identity, provider discovery, or provider-specific request shaping the PM canonical runtime identity
- direct-provider implementation follow-up must collect official primary-source auth and `/usage/quota` docs for Alibaba direct, MiniMax direct, and Z.AI direct; this confirmatory follow-up refines provider detail but does not block the core direct-provider architecture.
- `Z.AI Coding Plan` readiness validates both API key state and provider reachability/model-discovery readiness (`/model-discovery`) before PM treats the surface as ready.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md

### 10.3.1 Interview GUI/UI/UX Gemini preference (surface default)

The Gemini preference for Interview is a **surface/stage default**, not a Persona-wide default.

Trigger conditions:
- active surface = `interview`
- current Interview phase is `product_ux` **or** the Interview state has `has_gui = true`
- active stage is one of `questioning`, `research`, `drafting`, or `review`
- no explicit run-envelope or stage override already selected a different platform/model

Behavior:
- if a Gemini transport is configured, available, and supports the required controls for the current stage, Gemini becomes the default platform/model source at precedence level 3 ("Surface/tier/phase defaults")
- validation stages do **not** auto-switch to Gemini unless the user or a stage override explicitly requests it
- if Gemini is unavailable or fails capability checks, selection falls back to the normal precedence chain with no special-case retry loop

Persistence / visibility:
- the resolved selection reason MUST mention the Interview GUI/UI/UX preference when it wins (for example: `Interview GUI stage default: Gemini`)
- when the preference is skipped, the reason MUST record why (for example: `Gemini unavailable` or `explicit user override`)

<a id="PERSONA-CAPABILITY-MATRIX"></a>
### 10.4 Provider Persona Capability Matrix (canonical support states)


Capability and effort evaluation must be performed per runtime surface, not by loose provider-family assumptions.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md

Day-one supported runtime/API-family surfaces for this change set:

| Surface | Class | Key notes |
|---|---|---|
| `codex` direct | direct-provider | Explicit API-family selection may be required. |
| `copilot` direct | direct-provider | Native subagent billing/routing behavior is special and not freely mixed from non-Copilot parents. |
| `opencode` server | server-bridged | PM child runs map to OpenCode session lineage additively. |
| `alibaba-coding-plan` direct | direct-provider | Effort and API-family behavior must be treated as provider-specific, not assumed OpenAI-equivalent. |
| `zai-coding-plan` direct | direct-provider | Same requested/effective runtime and effort rules apply; `zai-coding-plan` is the product label while `zai_coding_plan` is the family mapping token. |
| `minimax-coding-plan` direct | direct-provider | Same requested/effective runtime and effort rules apply; source docs include `https://platform.minimaxi.com/docs/coding-plan/intro`. |
| `gemini` direct | direct-provider | Distinct runtime surface from Gemini CLI. |
| `gemini-cli` | CLI-bridged | Distinct auth/control/cache/runtime surface from Gemini direct. |
| `claude-code-cli` | CLI-bridged | CLI-bridged capability set and runtime controls. |
| `cursor-cli` | CLI-bridged | CLI-bridged capability set and runtime controls. |

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Commands_System.md, ContractName:Plans/FinalGUISpec.md

Matrix rules:
- `gemini` direct and `gemini-cli` are separate surfaces even when grouped by a higher-level provider family.
- effort support is evaluated per surface.
- tool-schema normalization and loop-control behavior may vary by surface.
- provider-native agent or session files are not PM runtime canon.
- Copilot-native subagent routing remains a special policy path, not a general per-member crew mixing behavior.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/orchestrator-subagent-integration.md
### 10.4.1 Capability evaluation granularity

The matrix in §10.4 defines the **transport-level baseline** only. Effective Persona-control support for a specific run MUST be computed as the intersection of:

1. **transport support** from the Provider Persona Capability Matrix,
2. **model-level support** from discovered model metadata / provider capability metadata,
3. **runtime constraint support** from the selected variant or provider runtime path.

This is required because a control may be supported by a provider transport in general but unavailable for a specific model.

Provider-family transforms, provider-specific API-shape mismatch handling, and API routing follow the same granularity:
- PM must keep adapter policy explicit and must not assume one generic direct-provider loop is sufficient for all model families; OpenAI-like providers therefore use per-surface API-family routing, including explicit `responses` vs `chat` vs `model-language` / plain language model primitive selection, rather than one universal OpenAI-compatible surface.
- `Gemini/Vertex` surfaces need stricter `tool-schema` normalization and schema sanitization requirements than generic JSON Schema before PM treats tool calls as equivalent across transports; sanitizer evidence must preserve `anyOf`/combiners and numeric enums with issue refs `#14788`, `#12908`, `#12827`, and `#12911`.
- upstream provider identity remains explicit where relevant; examples include `google`, `anthropic`, and `openai-compatible`, and bridge/runtime adapters freeze that identity in effective disclosure instead of collapsing it into the PM runtime platform label.
- for Gemini CLI and other provider-side routers, PM should prefer explicit model selection, disable or constrain provider-side routing where feasible, tolerate/observe any remaining internal routing, and surface any `/observe` state rather than allowing silent provider-side model changes without requested/effective model disclosure.

Direct coding-plan provider identities:
- `Alibaba Coding Plan`, `MiniMax Coding Plan`, and `Z.AI Coding Plan` are user-visible provider names in the same direct-provider `/runtime` bucket as `GitHub Copilot`, `Codex`, and `Gemini`; they are not CLI-bridged surfaces merely because they use provider SDK adapters.
- `MiniMax` direct coding-plan entries `minimax-coding-plan` and `minimax-cn-coding-plan` use env `MINIMAX_API_KEY` and AI SDK (`ai-sdk`) npm/provider transport `@ai-sdk/anthropic` through the `/anthropic` adapter family.
- `Z.AI`/Zhipu direct coding-plan entry `zhipuai-coding-plan` uses env `ZHIPU_API_KEY` and AI SDK (`ai-sdk`) npm/provider transport `@ai-sdk/openai-compatible` through the `/openai-compatible` adapter family.
- The Z.AI base API is `https://api.z.ai/api/coding/paas/v4`; historical source spelling `//api.z.ai/api/coding/paas/v4` normalizes to that HTTPS URL. Z.AI Coding Plan also has a coding-plan-specific endpoint and plan-dependent quota/reset behavior, so `/reset` timing and quota displays must be treated as provider-plan facts rather than generic OpenAI-compatible defaults.
- Provider-family mappings include `zai_coding_plan` / `zai-coding-plan` -> `direct_api` family `zai`, `gemini_direct` -> family `gemini`, `alibaba_coding_plan` -> `direct_api` family `alibaba`, and `minimax_coding_plan` -> `direct_api` family `minimax`; MiniMax Coding Plan source docs include `https://platform.minimaxi.com/docs/coding-plan/intro`.

Examples:
- `reasoning_effort` may be supported by a provider transport but unavailable for the selected model.
- `temperature` may be supported for direct API calls but unavailable through a narrowed CLI transport path.
- a variant may force a model switch that changes effective support.

### 10.4.2 Derived control rule: `talkativeness`

`talkativeness` controls how verbose or concise the model's responses should be at the instruction layer.

Scale:
- `1` = terse, code-only, minimal explanation,
- `2` = concise with light explanation,
- `3` = balanced default,
- `4` = detailed and explanatory,
- `5` = verbose, teaching-oriented, high-context explanation.

Default:
- the system default is `3` (`balanced`).

Derivation rule:
1. user preference setting,
2. mode overlay,
3. explicit per-thread override.

Mode overlay defaults:
- plan mode → `4`
- ask mode → `3`
- agent mode → `2`

Rules:
- the effective `talkativeness` value is derived after applying the mode overlay and then any explicit per-thread override,
- `talkativeness` maps to system-prompt instructions that control response length, amount of explanation, and expected detail level,
- some model families follow terse instructions more reliably than others, so PM MAY adjust the instruction mapping per model family while preserving the same user-visible scale.

`talkativeness` is a Persona instruction-layer control rather than a transport sampling knob.

Canonical implications:
- `persona_talkativeness` does **not** require its own transport matrix row.
- it is always expressed through prompt construction and response-style instructions, not through provider-native temperature/top-p semantics.

### 10.4.3 Canonical capability snapshot source

The Provider Persona Capability Matrix is not prose-only. GUI disclosure and runtime filtering MUST resolve support state from one canonical machine-readable snapshot contract.

Canonical snapshot shape:
```json
{
  "provider_id": "cursor",
  "transport": "CliBridge",
  "model_id": "anthropic/claude-sonnet-4",
  "variant": null,
  "controls": {
    "persona_prompt_body": {
      "state": "supported",
      "reason": "provider accepts system/rules prompt injection",
      "source": "documented"
    },
    "persona_reasoning_effort": {
      "state": "unsupported",
      "reason": "transport does not expose an effort knob",
      "source": "documented"
    }
  }
}
```

Rules:
- The canonical effective support state for a run is the intersection of transport support, model metadata, and variant/runtime-path constraints.
- Provider/model catalog snapshots carry `boot_refresh_enabled`, `model_catalog_status`, `last_model_refresh_at`, and `selectable_unit_ids[]` / `selectable_unit_ids` so boot-time refresh, stale catalog state, and the selectable units tied to a catalog entry remain inspectable.
- Capability resolution records may include `resolved_capability_deltas[]`, `pool_scope`, and `provider_entry`; `pool_scope` can be `provider_entry` when capability differences must be pinned to the concrete runtime surface rather than a provider family.
- Both the runtime filtering stage and the Persona editor MUST call the same resolver to obtain this snapshot.
- A cached copy MAY be persisted for performance, but the cache is derivative; the canonical source is the shared capability resolver plus its provider/model metadata inputs.
- Every control disclosure shown to the user MUST be derivable from this snapshot without ad hoc UI-only logic.
- `source` MUST be one of `documented`, `empirical`, or `inferred` so future verification work can distinguish hard facts from provisional assumptions.

Account-routing capability fields are part of the same canonical snapshot when a provider participates in multi-account-related selection, account switching, or pressure routing. Provider capability modeling for those paths is explicitly required and MUST expose:
- `supports_multi_account`
- `account_identity_kind`
- `quota_signal_sources[]`
- `quota_signal_confidence`
- `supports_threshold_switch`
- `supports_hard_exhaustion_detection`
- `supports_rate_limit_detection`
- `supports_reset_countdown`
- `supports_manual_set_active`
- `supports_cooldown`
- `supports_retry_budget`
- `supports_role_scoped_account_pools`
- `switch_boundary`
- `provider_limit_notes?`

The generic signal axes remain `signal_source_kinds[]` and `signal_confidence` for signal sources/confidence. `quota_signal_sources[]` plus `quota_signal_confidence` are the quota/account-pressure specialization of those axes for account-pressure interpretation. The resolver treats these as provider capability metadata, not account state. `retry_budget?`, `cooldown_until?`, and `reset_at?` may appear on account-health records only when the capability snapshot says the provider path supports or can infer those facts. A provider path that lacks cooldown/retry-budget support or reset countdown support MUST disclose `unsupported`, `opaque`, `inferred`, or `stale` rather than pretending the provider account pool is safely switchable.

Bridge note:
- `talkativeness` remains governed by the derived-control rule in §10.4.2 and therefore only appears in the snapshot when a concrete prompt-construction policy records the effective value for disclosure/debugging.
- its effective support is derived from `persona_prompt_body`.
- if a provider path can apply Persona prompt-body instructions, it can apply `talkativeness`.
- if Persona prompt-body injection is bypassed or unavailable, `talkativeness` MUST be recorded as skipped with the same provider/model disclosure rules as other Persona controls.

GUI gating and runtime disclosure MUST use this derived rule rather than inventing a second inconsistent source.

### 10.5 Unsupported control disclosure rules

If a Persona requests a control the active provider cannot honor:
- do not silently ignore it,
- do not show it as applied,
- record it in `skipped_persona_controls[]`,
- record the reason and provider,
- and expose that status in UI.

Example skipped control records:
- `temperature`: `unsupported by Claude Code transport`
- `top_p`: `unsupported by Cursor CLI transport`
- `reasoning_effort`: `provider does not expose effort knob`

### 10.6 GUI disclosure requirements

Persona-related model/runtime controls shown in GUI MUST reflect provider support state:

- **supported:** editable normally
- **partially_supported:** editable with warning badge and explanatory tooltip
- **unsupported:** disabled with explanatory text

Example UI copy patterns:
- `Reasoning effort` -> disabled on Cursor CLI with note `Cursor CLI does not expose a documented effort control.`
- `Temperature` -> disabled on Claude Code with note `Not exposed in official Claude Code CLI settings.`

### 10.7 Runtime display requirements

All run surfaces must display effective runtime choices, not only raw configured values.

Minimum display requirements:
- Persona name
- selection reason
- effective platform
- effective model
- effective variant/effort when present
- indication of skipped controls when relevant

Example display:
- `Persona: Rust Engineer (Auto: Rust repo + code task)`
- `Model: Codex GPT-5.3 (Persona preferred)`
- `Platform: Codex (Available)`
- `Skipped controls: temperature unsupported by provider`

### 10.8 OpenCode baseline note

OpenCode demonstrates the integrated runtime shape Puppet Master is adopting:
- role object carries prompt, model, variant, temperature, topP, permission, and options,
- selected role is resolved by name,
- role prompt is injected into system prompt assembly,
- role model and runtime options are applied before model call.

Puppet Master follows that structure conceptually, but uses Persona as the canonical stored contract and adds provider capability disclosure instead of assuming all backends honor all knobs.

### 10.9 Acceptance criteria addendum

- Effective runtime state must distinguish requested vs effective vs skipped Persona controls.
- Runtime support outcomes must preserve the `requested_runtime` alongside whether the request was `substituted`, `clamped`, `blocked`, or `retried_on_fallback`.
- Unsupported controls must be visible in both editor UI and runtime UI.
- Provider capability matrix must be the shared source for editor gating and runtime disclosure.
- Chat/Interview/Builder/Orchestrator history/event views must show effective Persona/model/platform rather than only stored preferences.

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- unavailable Persona-preferred models continue to fall through the normal selection chain and do not create a blocked state by themselves
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
## Runtime Retry / Fallback Ownership Addendum (2026-03-09)

Model fallback and runtime retry are separate concerns.

### Ownership split
- model selection decides requested/effective provider/model before execution begins
- runtime policy decides whether an attempt is retried, remediated, blocked, or escalated after a classified outcome
- providers and adapters may not invent model-local retry loops that bypass runtime policy

### Required attempt snapshots


Each attempt MUST retain requested and effective model/provider identifiers so users can later explain why a blocked or failed attempt ran under a specific effective configuration.

### Fallback rule
Model fallback may change the effective model only through the shared model-selection contract, never as an implicit side effect of provider transient handling inside an already-running attempt.
## Requested/Effective Model and Retry Ownership Canonical Alignment (2026-03-09)

Requested/effective model resolution remains separate from runtime retry policy.

Rules:
- model/provider fallback may change the effective model only through the shared selection contract before execution begins
- runtime retries, remediation, and prerequisite-resumed work always occur as new attempts with new attempt snapshots
- providers/adapters must not hide model-local retry loops inside an already-running attempt
## Model Selection Versus Runtime Retry Ownership Consolidation Addendum (2026-03-09)


Model selection and retry ownership remain separate concerns.

Rules:
- attempt start persists stable requested/effective model snapshot identifiers
- retries and resumes do not silently change model identity unless the canonical runtime policy explicitly creates a new attempt with new snapshot IDs
- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics
- UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring them from provider names alone
## Requested / Effective Model Snapshot Alignment


Requested and effective model/runtime fields must stay visible for child runs, crew members, and surfaced planning/runtime decisions.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Child effort resolution order:
1. explicit child effort request
2. child Persona or task preference
3. weak parent hint
4. target-surface default

Rules:
- PM resolves canonical effort intent first, then translates it per target surface.
- remapped effort values remain visible as requested versus effective.
- explicit runtime surface requests do not silently fallback.
- implicit orchestrator-selected runtime surfaces may fallback, but the fallback reason must be visible.

Default Crew configuration belongs under the model/runtime settings surface.

Minimum Default Crew settings model:
- enable or disable Default Crew
- ordered list of crew members
- per-member model selector
- per-member provider/runtime surface selector
- immediate normalization of the whole crew to `Copilot` when any member selects Copilot, because Copilot is a crew-level provider selection constraint and is not a per-member freely mixed provider in the default crew editor

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/CLI_Bridged_Providers.md

## Provider/model selection policy and audit addendum

This addendum elaborates how the canonical provider/model precedence owner section is surfaced through user-facing policy, capability gating, and audit trail details.

### Persona, execution-unit, and scope policy inputs


1. **Persona axis**: Users select a Persona (e.g., "Code Analyzer", "Documentation Writer") which carries default preferences for model, provider, and mutation_policy.
2. **Execution Unit Type axis**: Different execution unit types (run, node, delegated_subagent) can have scoped policies (e.g., "use GPT-4 for run-level analysis, but Claude for node-level code generation").
3. **Scope axis**: Settings can be scoped to worktree, project, or global level; settings at a tighter scope override broader scopes.

### Precedence chain for provider/model selection

When a unit needs to select a provider and model, resolve in this order:

1. **Explicit run-envelope override**: If the run was launched with `--provider=X --model=Y`, use those.
2. **Scoped owner policy**: If the active execution_unit_type has a policy (e.g., "node-type uses Copilot"), apply it.
3. **Persona preference**: Use the active Persona's default model and provider.
4. **Surface or stage default**: If the UI surface or execution stage has a default (e.g., "code review prefers GPT-4"), use it.
5. **Project or global config default**: Fallback to project-wide or global settings.
6. **Last-used state**: If permitted by settings, use the model/provider from the previous run of the same type.
7. **Provider default**: Use the provider's canonical default model.

### Settings resolution and override semantics


- **Conservative policy**: Use only settings tier 1 (explicit override) or tier 3+ (canonical defaults); do not apply stage defaults or persona preferences.
- **Standard policy** (default): Use tiers 1-5 (explicit override through project defaults); respect all configuration.
- **Aggressive policy**: Use all tiers 1-7; auto-select the cheapest or fastest model if multiple are available and equally suitable.

### Provider capability and cost gating

- **Capability check**: Before selecting a provider, verify it supports the required model and inference parameters (context length, output length, reasoning mode, etc.).
- **Multi-account capability check**: Provider capability modeling MUST include multi-account-related behavior before any provider/account pool can be selected or switched. Required capability facts include `supports_multi_account`, signal sources/confidence, cooldown/retry-budget support, reset countdown support, and provider-specific limits that change account pressure interpretation or rotation safety.
- **Cost gating**: If a model exceeds the active Persona's cost budget, skip it and move to the next in the precedence chain.
- **Fallback**: If all preferred models exceed budget or are unavailable, emit a concern (not a silent failure) and suggest cheaper alternatives or escalation.

Clamp/substitution decisions use the `clamp/substitution` reason-code family when the requested provider, model, effort, capability, instruction projection, or skill projection cannot be applied exactly.

Required `clamp/substitution` reason codes:
- `model_unavailable`
- `model_routed_by_provider`
- `model_substituted`
- `effort_unsupported`
- `effort_clamped`
- `auth_family_capability_clamped`
- `capability_unknown`
- `instruction_projection_partial`
- `skill_projection_partial`

Rules:
- `model_unavailable` and `model_routed_by_provider` distinguish PM inability to select a requested model from provider-side rerouting after PM dispatch.
- `model_substituted`, `effort_clamped`, and `auth_family_capability_clamped` are explicit `/substitution` evidence for requested/effective differences caused by model fallback, narrowed effort, or auth-family capability limits.
- `effort_unsupported` and `effort_clamped` distinguish unsupported effort controls from accepted-but-narrowed effort controls.
- `capability_unknown`, `instruction_projection_partial`, and `skill_projection_partial` remain inspectable so the UI does not present a fully honored model/capability/instruction state when PM only has partial or unknown evidence.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md

### Selection reason and audit trail


When a provider and model are selected, emit a `selection_reason` object:
```typescript
selection_reason {
  selected_provider: string,           // e.g., 'openai', 'anthropic', 'github'
  selected_model: string,              // e.g., 'gpt-4', 'claude-3-opus'
  precedence_tier: number,             // 1-7 indicating which tier was applied
  fallback_reason?: string,            // If a fallback was triggered (capability, cost, unavailability)
  alternatives: Array,                 // Other models that were considered and why they were skipped
  selection_time_utc: string,          // When the decision was made
  execution_unit_id: string,           // Tied to the unit making the selection
}
```

This metadata is logged so inspectors and auditors can trace why a particular model was chosen and what constraints were active.

ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Models_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### MS-002 - Models SSOT And DRY Compliance Boundary

```yaml
plan_unit_id: MS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System.md is the SSOT for model selection, configuration, and variants. Consumers reference anchors
  such as Plans/Models_System.md#MODEL-ID instead of restating model selection rules or variant definitions.
gui_related: false
gui_classification_reason: The unit covers SSOT scope and governance references rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: models_ssot_dry_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: models_ssot_dry_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0004
preserved_exact_tokens:
- Models System (Canonical SSOT)
- Puppet Master
- Plans/Models_System.md#MODEL-ID
- single canonical source of truth
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md is the single canonical source for model selection, configuration, and variant rules.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-003 - Owner Section Requirements And Reference Inventory

```yaml
plan_unit_id: MS-003
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Canonical owner-section requirements preserve product, runtime, storage, UI, and governance details, while
  SSOT references remain exact inventory pointers and do not replace their owner docs.
gui_related: true
gui_classification_reason: The unit preserves UI/governance reference posture and references Plans/FinalGUISpec.md.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_section_reference_inventory
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: owner_section_reference_inventory
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0005
preserved_exact_tokens:
- Canonical owner-section requirements
- SSOT references (DRY)
- Plans/Spec_Lock.json
- Plans/auto_decisions.jsonl
- Plans/FinalGUISpec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This unit preserves reference inventory only; referenced owner docs keep their own contracts.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-004 - Provider Model Precedence Owner Boundary

```yaml
plan_unit_id: MS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System.md owns provider/model precedence across run, seam, package, node, overseer, delegated-subagent,
  and worktree-narrowed surfaces without replacing requested/effective resolver records.
gui_related: false
gui_classification_reason: The unit covers backend/runtime owner boundaries rather than GUI presentation.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_precedence_owner_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_precedence_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0007
preserved_exact_tokens:
- Provider/model precedence and settings resolution
- Scope and owner boundaries
- run
- seam
- package
- node
- overseer
- delegated-subagent
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Adjacent docs consume this owner section and must not replace its provider/model precedence policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-005 - Three Axis Settings And Deterministic Precedence

```yaml
plan_unit_id: MS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings resolve on source, request, and execution axes. Deterministic precedence is explicit override, scoped
  policy, Persona preference, surface or stage default, project or global default, last-used when permitted, and provider
  default.
gui_related: false
gui_classification_reason: The unit covers resolver policy and precedence rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-004
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: three_axis_settings_precedence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: three_axis_settings_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0009
preserved_exact_tokens:
- manual_override
- persona_preference
- scope_policy
- provider_default
- last-used
- requested/effective
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently
  inheriting stale effective state.
owner_boundary_notes:
- Policy remains in the Models owner section and produces requested/effective resolver state.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-006 - Resolver Input And Emit Shape

```yaml
plan_unit_id: MS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The resolver accepts overrides, defaults, policy, capability, account, worktree, and permission context, then
  emits requested and effective platform, model, variant, auth, account, execution_role, selection_reason, resolver_matrix_entry,
  worker_policy_display, and skipped_persona_controls.
gui_related: false
gui_classification_reason: The unit covers backend resolver input and output shape rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-005
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: resolver_input_emit_shape
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: resolver_input_emit_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- requested_platform
- effective_model
- skipped_persona_controls[]
- selection_reason
- resolver_matrix_entry
- worker_policy_display
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime snapshots, inspectors, and owner transitions consume the emit shape; later sections elaborate but do not replace
  it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-007 - Concern Lifecycle And Consumer Boundaries

```yaml
plan_unit_id: MS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model concerns use active, acknowledged, resolved, dismissed, resolution_kind, and accepted_risk.
  Consumers may disclose proceed, block, retry, and confirmation semantics but do not own selection policy.
gui_related: true
gui_classification_reason: The unit includes user confirmation and concern disclosure behavior that can surface in GUI flows.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: concern_lifecycle_consumer_boundaries
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: concern_lifecycle_consumer_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- active
- acknowledged
- resolved
- dismissed
- accepted_risk
- DispatchContext.provider_id
- Provider / Model
- worker_provider
negative_constraints:
- Consumers may disclose concern state but must not replace Models_System.md as provider/model selection owner.
compatibility_only_notes:
- DispatchContext and Run Graph provider/model labels are compatibility labels over the canonical requested/effective snapshot.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md, Executor, Worktree, Run Graph, and Crosswalk consume this policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-008 - Requested Effective Identity And Storage Account Continuity

```yaml
plan_unit_id: MS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective persona, provider, model, account, runtime, execution-role, and operational identities
  remain distinct, durable, and explicit across storage, contracts, project account context, and provider snapshots.
gui_related: false
gui_classification_reason: The unit covers storage/account/runtime identity fields rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_identity_account_continuity
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: requested_effective_identity_account_continuity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- requested_persona
- effective_persona
- _id
- 'provider_id: cursor'
- selected_repo_id
- requested_*
- effective_*
negative_constraints:
- Compatibility _id fields must not collapse requested, effective, account, provider, model, execution role, or operational
  identity into one value.
- Runtime/storage account fallback fields must not disappear from requested/effective disclosure.
compatibility_only_notes:
- _id variants and legacy path references are compatibility labels, not replacement canonical IDs.
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts, storage, GitHub, project-account, and orchestrator docs consume this identity model without re-owning it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-009 - Execution Unit Defaults Worker Policy And Delegation

```yaml
plan_unit_id: MS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Run, seam, package, node, overseer, and delegated-subagent settings resolve through requested/effective snapshots.
  Easiest, lane-aware, worktree, node-worker, and delegation policies are explicit resolver inputs.
gui_related: false
gui_classification_reason: The unit covers execution-unit settings and delegation policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: execution_unit_defaults_worker_delegation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: execution_unit_defaults_worker_delegation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- /model/effort/persona
- /package/node
- /easiest
- node-effective
- overseer-effective
- lane-aware
negative_constraints:
- Provider/model defaults must not become ad hoc per-node manual model names outside the resolver record.
compatibility_only_notes:
- Lifecycle events carry the execution-unit provider/model snapshot that made each transition valid.
stale_retired_dispositions: []
owner_boundary_notes:
- Execution settings remain model-owner inputs while package, lane, and worktree docs consume the resolved snapshot.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-010 - Compatibility Cleanup And Stale Tier Routing

```yaml
plan_unit_id: MS-010
unit_type: constraint
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Legacy tier, event, four-tier, TierContext, tier-native, and active-agent vocabulary maps to current execution-unit,
  package/lane, and requested/effective resolver semantics.
gui_related: false
gui_classification_reason: The unit covers compatibility vocabulary and cleanup constraints rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compatibility_cleanup_stale_tier_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: compatibility_cleanup_stale_tier_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- TierChanged
- GateStart
- four-tier
- node-graph
- TierContext
- tier-native
negative_constraints:
- Old and new provider/model models cannot remain peer canon in the same surface.
- Owner-of-owners cleanup must not amplify provider/model drift.
compatibility_only_notes:
- Legacy tier, executor, and active-agent terms are compatibility inputs only.
stale_retired_dispositions:
- Legacy tier semantics remain compatibility-only and do not revive tier-native execution semantics.
owner_boundary_notes:
- Models_System.md resolves provider/model wording contradictions into one requested/effective resolver statement.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-011 - GUI Help Labels Receipts And Subject Open Presentation

```yaml
plan_unit_id: MS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Visible labels, help text, receipts, and subject-open presentation may simplify display but remain views over
  canonical requested/effective model state and shared cost, ledger, and artifact-opening identity.
gui_related: true
gui_classification_reason: The unit covers GUI labels, help copy, receipts, tabs, and user-visible subject-open behavior.
split_recommended: false
depends_on:
- MS-006
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_help_receipts_subject_open_presentation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: gui_help_receipts_subject_open_presentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0010
preserved_exact_tokens:
- Workers
- Providers & Models
- Execution Identity
- HITL
- 'Temperature: 0.2 -> Honored'
- Show in Usage
- tab_id
negative_constraints:
- Execution copies are not loose GUI hints.
- tab_id must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.
- Planning and /output surfaces must not replace the shared subject-open resolver.
compatibility_only_notes:
- UI aliases and simplified labels are presentation compatibility only.
stale_retired_dispositions: []
owner_boundary_notes:
- GUI surfaces consume the model contract and do not create alternate object names.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-012 - Canonical Model ID Grammar And Persistence Boundary

```yaml
plan_unit_id: MS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Stored and runtime model IDs use provider_id/model_id, split only on the first slash, and cannot be rewritten
  by labels, grouping, pooling, or runtime-platform grouping.
gui_related: false
gui_classification_reason: The unit covers stored/runtime identifier grammar rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-002
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_model_id_grammar
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_model_id_grammar
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0012
preserved_exact_tokens:
- MODEL-ID
- provider_id/model_id
- /collision-safe
- split on the first /
negative_constraints:
- Canonical model identifiers must never be rewritten by labels, grouping, family pooling, or runtime-platform grouping.
compatibility_only_notes:
- Contracts may cite the model provider namespace but do not redefine this identifier grammar.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-013 - Collision Safe GUI Indexing And Display Name Policy

```yaml
plan_unit_id: MS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI may clean labels and use normalized collision-safe internal keys, but meaningful tokens and stored IDs
  remain intact. Duplicate runtime availability is disambiguated with runtime, auth, and billing context.
gui_related: true
gui_classification_reason: The unit covers model picker and display-name behavior.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: collision_safe_gui_display_names
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: collision_safe_gui_display_names
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0014
preserved_exact_tokens:
- mini
- pro
- flash
- thinking
- cleaned-label
- /runtime/auth-family/billing
negative_constraints:
- GUI disambiguation must not mutate the stored provider_id/model_id.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec consumes display policy while Models_System.md owns identifier meaning.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-014 - Runtime Platform Distinction And Usage Evidence Fields

```yaml
plan_unit_id: MS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model identity and runtime-platform identity are separate. Requested/effective runtime platform, model provider,
  usage source kind, signal confidence, raw model ID, effort, auth family, pool scope, and snapshots remain inspectable.
gui_related: false
gui_classification_reason: The unit covers runtime/platform identity and usage evidence fields rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_platform_usage_evidence_fields
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_platform_usage_evidence_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0013
preserved_exact_tokens:
- requested_runtime_platform_id
- provider_usage_source_kind?
- /API-backed
- gemini_direct
- gemini_cli
- model_id_raw
- effective_runtime_snapshot
negative_constraints: []
compatibility_only_notes:
- model_id_raw, effort, compact_threshold, auth_family, pool_scope, effective_runtime, and effective_runtime_snapshot remain
  inspectable when they affect selection or disclosure.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-015 - Selection Priority And Gemini CLI Evidence

```yaml
plan_unit_id: MS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selection follows the deterministic requested/effective pipeline and priority table. Concrete provider entries
  resolve before provider families, while Gemini CLI precedence and general.plan.modelRouting are recorded as evidence.
gui_related: false
gui_classification_reason: The unit covers resolver selection priority rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-005
- MS-014
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_priority_gemini_cli_evidence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_priority_gemini_cli_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0015
preserved_exact_tokens:
- SELECTION-PRIORITY
- --model
- GEMINI_MODEL
- settings.json
- general.plan.modelRouting
negative_constraints:
- Provider family cannot replace a concrete provider entry when the concrete provider is specified.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-016 - Provider And Model Option Scopes

```yaml
plan_unit_id: MS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider options live under config.provider.<provider_id>.options. Model options override provider defaults,
  and the standard option field section remains canonical for shared model option metadata.
gui_related: false
gui_classification_reason: The unit covers configuration schema rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_option_scopes
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_option_scopes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0019
preserved_exact_tokens:
- MODEL-OPTIONS
- '[provider.anthropic.options]'
- '[provider.anthropic.models."claude-sonnet-4"]'
- max_output_tokens
- temperature
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns provider and model option scope.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-017 - Capability Matrix Fields And Data Driven Checks

```yaml
plan_unit_id: MS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Capability metadata covers transport, tool, cache, payload, pricing, billing, and source fields. Checks are
  data-driven, Gemini Direct and Gemini CLI remain distinct, and disableCache maps through cache capability fields.
gui_related: false
gui_classification_reason: The unit covers capability metadata and runtime checks rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-016
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: capability_matrix_data_driven_checks
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: capability_matrix_data_driven_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0020
preserved_exact_tokens:
- system_role_name
- streaming
- tool_use
- cache_control
- billing_entity
- billing_source
- disableCache
negative_constraints:
- Capability checks must not devolve into scattered if-else branches.
compatibility_only_notes:
- Gemini disableCache compatibility evidence maps through cache_control or cache_with_oauth rather than a hidden provider
  flag.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-018 - Dynamic Catalog Discovery And Selectable Unit Snapshots

```yaml
plan_unit_id: MS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode models.dev, provider catalog, and cursor-agent models supply model-scoped capability metadata. Snapshots
  preserve requested_default and effective_capabilities for UI, default, and runtime explanation.
gui_related: true
gui_classification_reason: The unit includes selectable-unit snapshots that explain UI defaults and user-visible runtime choices.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dynamic_catalog_selectable_snapshots
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: dynamic_catalog_selectable_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0020
preserved_exact_tokens:
- models.dev
- /catalog
- requested_default
- effective_capabilities
- cursor-agent models
negative_constraints:
- Provider defaults and variants must not be hardcoded when returned IDs and catalog metadata are available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns catalog-derived capability interpretation.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-019 - System Role Name Mapping

```yaml
plan_unit_id: MS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: system_role_name role mapping is data-driven. OpenAI reasoning uses developer, other listed families use system,
  and bridged adapters align with CLI_Bridged_Providers.
gui_related: false
gui_classification_reason: The unit covers provider adapter role mapping rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: system_role_name_mapping
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: system_role_name_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0021
preserved_exact_tokens:
- system_role_name
- developer
- Anthropic
- OpenAI reasoning family
- Gemini CLI
negative_constraints:
- Adapters must not invent local role names outside model capability metadata.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-020 - Compaction Threshold Metadata

```yaml
plan_unit_id: MS-020
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Per-model metadata may set pressure_start_pct, pressure_aggressive_pct, large_block_threshold, and compact-threshold.
  Unknown capability state is represented explicitly instead of guessed.
gui_related: false
gui_classification_reason: The unit covers model metadata used by prompt/runtime systems rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compaction_threshold_metadata
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: compaction_threshold_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0022
preserved_exact_tokens:
- pressure_start_pct = 70
- pressure_aggressive_pct = 85
- large_block_threshold = 1200
- compact-threshold
negative_constraints:
- Unknown threshold or capability state must not be guessed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-021 - Provider Transform And Cache Capability Semantics

```yaml
plan_unit_id: MS-021
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider transform handles normalization and option injection. Provider-side cache and native cache marker
  semantics are capability and request metadata, not PM web-content-cache behavior or generic user settings.
gui_related: false
gui_classification_reason: The unit covers provider transform and cache capability semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_transform_cache_semantics
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_transform_cache_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0023
preserved_exact_tokens:
- cache-key
- cache-TTL
- setCacheKey
- /automatic
- cacheControl
- cachePoint
- cachedContent
- metadata.user_id
negative_constraints:
- Provider cache wire fields must not be treated as identical across runtimes.
- Provider-cache controls must not be exposed as general MVP user settings.
compatibility_only_notes:
- cachePoint gap evidence remains a cache_control or cachedContent capability issue.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-022 - Runtime Specific Request Shaping And API Family Evidence

```yaml
plan_unit_id: MS-022
unit_type: constraint
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider-specific request shaping, 1M-context support, reasoning or effort controls, and OpenAI/Azure API-family
  routing are per runtime surface and preserved in capability and request metadata.
gui_related: false
gui_classification_reason: The unit covers provider request shaping and route evidence rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-021
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_request_shaping_api_family_evidence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_request_shaping_api_family_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0023
preserved_exact_tokens:
- enable_thinking=true
- '#14003'
- '#17494'
- '#14055'
- useCompletionUrls
- responses()
- chat()
- '#15016'
- '#7793'
negative_constraints:
- PM must not hardcode a universal 1M-context signal.
- Non-OpenAI Azure-hosted models must not be forced down the wrong OpenAI API path.
- PM must not assume one universal OpenAI/Azure route.
compatibility_only_notes:
- OpenCode prefers Responses API for OpenAI while Chat-Completions-only proxies have known compatibility issues.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-023 - Availability Lifecycle And Finish Reason Handling

```yaml
plan_unit_id: MS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model availability requires registered, authenticated, reachable, and compatible runtime surface. Lifecycle
  state controls dispatch eligibility, and finish_reason stop is insufficient when tool calls require continuation.
gui_related: false
gui_classification_reason: The unit covers runtime dispatch eligibility and tool-loop control flow rather than direct GUI
  presentation.
split_recommended: false
depends_on:
- MS-015
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: availability_lifecycle_finish_reason_handling
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: availability_lifecycle_finish_reason_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0025
preserved_exact_tokens:
- active | deprecated | sunset_pending | sunset | removed
- deprecation_notice_ref?
- sunset_at_utc?
- finish_reason = stop
- /control-flow
- '#14972'
negative_constraints:
- finish_reason stop alone cannot be treated as final completion evidence when tool calls require continuation.
compatibility_only_notes:
- Deprecated, sunset, and removed lifecycle states retain only the allowed history and compatibility behavior.
stale_retired_dispositions:
- Model lifecycle state text remains stale/retired-sensitive for deprecated, sunset, and removed dispatch eligibility.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model selection owner while adjacent docs consume the referenced contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-024 - Pricing Metadata Versioning

```yaml
plan_unit_id: MS-024
unit_type: pricing_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Pricing metadata is versioned by pricing_version; user-supplied overrides apply before stale-pricing warnings,
  and Doctor warns when stored pricing metadata is stale relative to the current provider metadata snapshot.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pricing_metadata_versioning
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: pricing_metadata_versioning
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- pricing_version
- user-supplied overrides
- Doctor integration
- stale relative to the current provider metadata snapshot
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Pricing metadata and stale-pricing behavior remain explicit; stale warnings must use the provider metadata snapshot.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-025 - Billing Entity Cost Attribution

```yaml
plan_unit_id: MS-025
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Cost attribution is keyed by model_id, provider_id, and billing_entity when quota semantics depend on billing
  entity; billing_entity remains canonical even when persisted records expose billing_entity_id or aliases.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: billing_entity_cost_attribution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: billing_entity_cost_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- (model_id, provider_id, billing_entity)
- billing_entity_id
- billing_entity
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System.md owns the cost attribution dimension; usage and contracts consume the pricing identity.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-026 - Free Tier Billing Provenance Display

```yaml
plan_unit_id: MS-026
unit_type: display_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Free-tier rows display zero-cost pricing with a billing_source label so cost displays preserve provider/runtime
  billing provenance instead of flattening it.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: free_tier_billing_provenance_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: free_tier_billing_provenance_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- $0
- billing_source
- cost displays
- provider/runtime billing provenance
negative_constraints:
- Cost displays must not flatten provider/runtime billing provenance.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-027 - OpenCode Reference Pricing Formula

```yaml
plan_unit_id: MS-027
unit_type: reference_formula
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode product pricing is a reference formula only, not an authoritative PM cost source; baseline explanations
  may cite getUsage and the normalized token bucket formula while preserving provider caveats.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-024
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_reference_pricing_formula
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_reference_pricing_formula
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- OpenCode product pricing is a reference formula
- not an authoritative PM cost source
- packages/opencode/src/session/index.ts:getUsage
- /opencode/src/session/index.ts:getUsage
- /input
- /output/reasoning/cache
- input_rate
- output_rate
- cache_read_rate
- cache_write_rate
- over-200k
- OpenRouter
negative_constraints: []
compatibility_only_notes:
- OpenCode pricing references are explanatory baseline evidence, not PM cost authority.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-028 - Provider Sensitive Token Counting

```yaml
plan_unit_id: MS-028
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider-sensitive token counting uses token_counting_adapter_id and token_counting_basis before cost or budget
  enforcement reads canonical token buckets; raw provider counts may be retained for audit.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-025
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_sensitive_token_counting
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_sensitive_token_counting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- token_counting_adapter_id
- token_counting_basis
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider raw counts may be preserved for audit, but adapter results feed canonical cost and budget token buckets.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-029 - Context Breakdown Usage View

```yaml
plan_unit_id: MS-029
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Context-detail Breakdown views that consume model/runtime usage metadata show the context usage bar, token
  buckets, and grouped breakdowns by role, tools, and provider/model when available.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-028
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_breakdown_usage_view
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: context_breakdown_usage_view
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0026
preserved_exact_tokens:
- Context-detail
- Breakdown
- context usage bar
- token buckets
- role
- tools
- provider/model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-030 - Bedrock Region Prefix Lookup

```yaml
plan_unit_id: MS-030
unit_type: provider_compatibility
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Bedrock region-prefix mapping uses an explicit lookup table, not string slicing; PM may add required regional
  prefixes only through the table and must honor no-rewrite exemptions for ARNs and provider-native canonical IDs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bedrock_region_prefix_lookup
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: bedrock_region_prefix_lookup
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0027
preserved_exact_tokens:
- Region-prefix mapping MUST use an explicit lookup table
- rather than string slicing
- /model-id
- ARNs
- provider-native ids
- us
- eu
- ap
- sa
- unknown/new region
negative_constraints:
- Unknown or new Bedrock regions receive no implicit prefix and require an explicit mapping update.
compatibility_only_notes:
- Bedrock region and model-id rewrite rules are deterministic provider-runtime compatibility facts.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-031 - Two Gemini Providers Structural Anchor

```yaml
plan_unit_id: MS-031
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Two Gemini providers heading and alias remain preserved as a structural anchor; no product body text is
  introduced by this span.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: two_gemini_providers_structural_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: two_gemini_providers_structural_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0028
preserved_exact_tokens:
- 4.4 Two Gemini providers
- 4.4-two-gemini-providers
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This is a structural anchor disposition only.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-032 - Web Capability Mirror And Site Reader Routing

```yaml
plan_unit_id: MS-032
unit_type: consumer_alignment
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Models_System mirrors web provider capability routing while preserving Site Reader as the default and primary
  path and keeping Firecrawl, Tavily, Exa, and other providers as explicit fallback, alternative, or override routes.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_capability_mirror_site_reader_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: web_capability_mirror_site_reader_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- This consumer-capability section mirrors the linked owner contract
- Site Reader is the DEFAULT and PRIMARY webfetch routing path
- Firecrawl
- Tavily
- Exa
- fallback/alternative paths
negative_constraints:
- Firecrawl, Tavily, and Exa webfetch capability must not be flattened to fallback-only merely because Site Reader is preferred.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This section mirrors linked owner contracts and stays aligned without owning payload validation.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-033 - Model Native Websearch Classification

```yaml
plan_unit_id: MS-033
unit_type: provider_taxonomy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Web capability disclosure preserves the two-class provider model: Anthropic and OpenAI websearch are native/model-native,
  while backend/API and PM-composed routes remain distinct.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_native_websearch_classification
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_native_websearch_classification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- native (model)
- model-native
- pm-composed
- backend/API
- two-class provider model
negative_constraints:
- Anthropic and OpenAI websearch support must not be relabeled as pm-composed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-034 - DuckDuckGo And Google Adapter Semantics

```yaml
plan_unit_id: MS-034
unit_type: provider_compatibility
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: DuckDuckGo/DDG remains enabled-by-default best-effort no-key fallback with native-ish search and PM-composed
  or partial fetch/extract/crawl semantics; Google remains a pluggable adapter slot with display label Google.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duckduckgo_google_adapter_semantics
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: duckduckgo_google_adapter_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- DuckDuckGo
- DDG
- enabled-by-default
- /no-key
- native-ish
- partial crawl
- Google
- display label `Google`
- pluggable adapter slot
negative_constraints:
- DuckDuckGo partial crawl behavior must not disappear.
- Google ledger support semantics must not be collapsed away.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-035 - Firecrawl Identity And Config Registry

```yaml
plan_unit_id: MS-035
unit_type: provider_config
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Firecrawl provider identity preserves provider ID firecrawl, display name Firecrawl, priority below Exa and
  Tavily and above DDG, default-disabled state until API key or self-hosted URL, and base configuration fields.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_identity_config_registry
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: firecrawl_identity_config_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- firecrawl
- Firecrawl
- below Exa, Tavily; above DDG
- disabled (requires API key or self-hosted URL)
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Retire exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.
owner_boundary_notes:
- The Firecrawl owner section preserves base configuration fields and default-disabled state.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-036 - Firecrawl Deployment Disclosure Boundary

```yaml
plan_unit_id: MS-036
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: PM must disclose deployment mode, requested/effective adapter identity, and capability differences before
  fallback or recovery and must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-035
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_deployment_disclosure_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: firecrawl_deployment_disclosure_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- self-hosted Firecrawl
- hosted/cloud Firecrawl
- deployment mode
- requested/effective adapter identity
- fallback or recovery
negative_constraints:
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-037 - Tavily Heavy Mode Non Default Policy

```yaml
plan_unit_id: MS-037
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Tavily heavy-mode settings are reserved for precision needs, fallback scenarios, or explicit user requests;
  default runtime behavior uses lighter modes and PM search-then-read depth handling.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tavily_heavy_mode_non_default_policy
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: tavily_heavy_mode_non_default_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- 'search_depth: "advanced"'
- 'include_raw_content: true'
- chunks_per_source
- 'search_depth: "basic"'
- 'search_depth: "fast"'
- precision needs
- fallback scenarios
- explicit user request
negative_constraints:
- Tavily heavy-mode settings are never defaults.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-038 - Web Operation Input Surface Mirror

```yaml
plan_unit_id: MS-038
unit_type: schema_mirror
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Models_System mirrors web-operation inputs and capability surfaces without owning payload validation: websearch
  sources/categories, webfetch pdf_mode, webextract JSON Schema limits, and webfetch/webcrawl diff status remain explicit.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_operation_input_surface_mirror
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: web_operation_input_surface_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- websearch
- sources
- categories
- webfetch
- 'pdf_mode: fast|auto|ocr'
- webextract
- JSON Schema draft-07
- schema
- 50KB maximum
- no external `$id` references
- webcrawl
- diff status
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Models_System mirrors input/capability surface; payload validation remains with the linked tool/owner contracts.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-039 - Webresearch Tiering And Automation Session Boundary

```yaml
plan_unit_id: MS-039
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: webresearch defaults autonomous to false and exposes PM-composed default, enhanced PM recipe, and provider-native
  agent tiers; research automation_session follows browser capability and permission models.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-032
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: webresearch_tiering_automation_session_boundary
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: webresearch_tiering_automation_session_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0029
preserved_exact_tokens:
- webresearch
- autonomous
- 'false'
- PM-composed default
- enhanced PM recipe
- provider-native agent
- automation_session
- three-tier permission model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-040 - Persona Runtime Preference Schema

```yaml
plan_unit_id: MS-040
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona runtime preferences may define default_platform, default_model, default_variant, temperature, top_p,
  and reasoning_effort in PERSONA.md frontmatter using the canonical provider_id/model_id model format.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_preference_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_preference_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- PERSONA-MODEL-OVERRIDES
- rust-engineer
- anthropic/claude-sonnet-4
- powerful
- 'temperature: 0.2'
- 'top_p: null'
- 'reasoning_effort: "high"'
- default_platform
- default_model
- default_variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-041 - Persona Preference Priority And Fallback

```yaml
plan_unit_id: MS-041
unit_type: selection_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona runtime preferences participate at priority 2, are overridden by explicit run-envelope or surface-level
  overrides, override lower defaults, and log warnings plus fall through when preferred runtime choices are unavailable.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_preference_priority_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_preference_priority_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- priority 2
- priority 1
- logs a warning
- falls through to the next priority level
- run is NOT blocked
negative_constraints:
- Unavailable Persona preferred platform/model/variant must not block the run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-042 - Unsupported Runtime Controls Skipped State

```yaml
plan_unit_id: MS-042
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Unsupported Persona runtime controls such as temperature, top_p, or reasoning_effort are recorded as skipped
  and excluded from effective runtime state instead of silently ignored.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsupported_runtime_controls_skipped_state
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: unsupported_runtime_controls_skipped_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0030
preserved_exact_tokens:
- temperature
- top_p
- reasoning_effort
- recorded as skipped
- excluded from the effective runtime state
- silently ignored
negative_constraints:
- Unsupported runtime controls must not be silently ignored.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Prompt_Pipeline.md#PROVIDER-CAPABILITY-FILTERING'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-043 - Variants Section Anchor

```yaml
plan_unit_id: MS-043
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Variants section and VARIANTS anchor are preserved as the owner location for named model presets and related
  variant behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variants_section_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variants_section_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0031
preserved_exact_tokens:
- VARIANTS
- 6. Variants system
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This structural PlanUnit preserves the section anchor that subsequent variant units elaborate.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-044 - Variant Definition

```yaml
plan_unit_id: MS-044
unit_type: variant_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Variant is a named model preset that users can quickly switch between to cycle through models without editing
  config.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variant_definition
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variant_definition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0032
preserved_exact_tokens:
- Variant
- named model preset
- quickly switch
- cycle through models
- without editing config
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-045 - Built In Variant Resolution

```yaml
plan_unit_id: MS-045
unit_type: variant_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Built-in variants default, fast, and powerful resolve dynamically from available providers; unavailable target
  models fall back to default.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: built_in_variant_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: built_in_variant_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0033
preserved_exact_tokens:
- default
- fast
- powerful
- Smallest/cheapest available model
- Largest/most capable available model
- resolved dynamically
- falls back to the `default` variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-046 - Custom Variant Config Schema

```yaml
plan_unit_id: MS-046
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Custom variants are defined in config with unique validated names, canonical model IDs, and optional descriptions
  capped at 200 characters.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-044
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_variant_config_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: custom_variant_config_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0034
preserved_exact_tokens:
- '[[variants]]'
- my-variant
- cheap
- anthropic/claude-sonnet-4
- openai/gpt-5-mini
- ^[a-z][a-z0-9-]{0,30}[a-z0-9]$
- Max 200 characters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-047 - Disabled Variants Visibility

```yaml
plan_unit_id: MS-047
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Built-in and custom variants can be disabled through variants_disabled entries; disabled variants do not appear
  in the model picker or variant cycling UI.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: disabled_variants_visibility
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: disabled_variants_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0035
preserved_exact_tokens:
- '[variants_disabled]'
- '"fast" = true'
- Disabled variants
- model picker
- variant cycling UI
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-048 - Variant Cycling Surfaces

```yaml
plan_unit_id: MS-048
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Users can cycle enabled variants through a configurable keybind, the Chat panel model picker dropdown, and
  the command palette.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: variant_cycling_surfaces
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: variant_cycling_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0036
preserved_exact_tokens:
- keybind
- configurable
- default unbound
- model picker dropdown
- Chat panel
- command palette
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-049 - Active Variant Priority And Persistence

```yaml
plan_unit_id: MS-049
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: When a variant is selected, its model becomes the active model at priority 3 for subsequent runs and persists
  per session unless config.default_variant sets cross-session default behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-048
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: active_variant_priority_persistence
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: active_variant_priority_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0036
preserved_exact_tokens:
- priority 3
- subsequent runs
- persisted per session
- not across restarts
- config.default_variant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-050 - Persona Default Variant Schema

```yaml
plan_unit_id: MS-050
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Persona may specify a preferred variant with default_variant in PERSONA.md frontmatter.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
- MS-043
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_default_variant_schema
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_default_variant_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0037
preserved_exact_tokens:
- default_variant
- PERSONA.md frontmatter
- 'default_variant: "powerful"'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-051 - Persona Variant Preselection

```yaml
plan_unit_id: MS-051
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: When a Persona default_variant is set, that variant is pre-selected while the Persona is active, and the user
  can still cycle to another variant during the session.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-050
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_variant_preselection
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_variant_preselection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0037
preserved_exact_tokens:
- pre-selected
- Persona is active
- user can still cycle
- during the session
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-052 - Model Alias Resolution

```yaml
plan_unit_id: MS-052
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model aliases are optional friendly names that resolve to canonical provider_id/model_id identifiers for model
  override parsing; keys normalize lowercase and spaces/underscores/hyphens, and resolution order is alias, exact model id,
  exact display name.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_alias_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_alias_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0038
preserved_exact_tokens:
- provider_id/model_id
- model_override
- lowercasing
- spaces/underscores/hyphens
- alias → exact model id → exact display name
- model-unavailable
- aliases are lookup keys
- variants are named model presets
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-053 - Canonical Media Alias Registry

```yaml
plan_unit_id: MS-053
unit_type: alias_registry
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The default media alias registry includes canonical image, video, and TTS aliases that resolve per the alias
  normalization rules and may be extended or overridden by users.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-052
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_media_alias_registry
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_media_alias_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0039
preserved_exact_tokens:
- MEDIA-ALIASES
- nano banana
- nano banana pro
- veo fast
- tts flash
- tts pro
- gemini-2.5-flash-image
- gemini-3-pro-image-preview
- veo-3.1-fast-generate-preview
- gemini-2.5-flash-preview-tts
- gemini-2.5-pro-preview-tts
- default alias registry
- users MAY add or override aliases
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-054 - GUI Model Label ID Separation

```yaml
plan_unit_id: MS-054
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model selection surfaces distinguish human-friendly labels from canonical stored IDs and remain views over
  the model contract.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-012
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_model_label_id_separation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: gui_model_label_id_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0040
preserved_exact_tokens:
- GUI-MODELS
- human-friendly labels
- canonical stored ids
- Model selection surfaces
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-055 - Chat Model Picker Display Contract

```yaml
plan_unit_id: MS-055
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Chat panel model picker displays cleaned primary labels, runtime-platform secondary labels when needed,
  capability indicators, and the exact raw canonical model ID in the detailed inspector.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_model_picker_display_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: chat_model_picker_display_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0041
preserved_exact_tokens:
- primary label
- cleaned model name
- secondary label
- runtime platform
- capability indicators
- exact raw canonical model id
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-056 - Picker Selection Requested Override

```yaml
plan_unit_id: MS-056
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selecting a model in the picker creates a priority-1 requested override and duplicate runtime surfaces for
  the same canonical ID are disambiguated with concrete runtime surface state.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-055
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: picker_selection_requested_override
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: picker_selection_requested_override
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0041
preserved_exact_tokens:
- selecting a model
- priority-1 requested override
- two runtime surfaces
- same canonical model id
- concrete runtime surface
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-057 - Settings Models Availability Display

```yaml
plan_unit_id: MS-057
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings > Models shows provider/runtime grouping, concrete runtime surface availability, current defaults
  and sources, and stale/silent/partial discovery state without inferring unsupported when discovery is silent or stale.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: settings_models_availability_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: settings_models_availability_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0042
preserved_exact_tokens:
- Settings > Models
- provider/runtime grouping
- concrete runtime surface availability
- current defaults and their source
- availability or capability gaps
- silent or stale
- model discovery `/state`
- stale cached models
- partial or complete
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale cached model visibility and silent discovery must be displayed as state, not converted into unsupported claims.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-058 - Model Refresh And Threshold Actions

```yaml
plan_unit_id: MS-058
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings exposes scoped user-triggered Refresh Models and Refresh Providers actions, may refresh automatically
  on connect/reconnect/boot/profile activation, and opens Edit Threshold at the most-local applicable override with default-source
  disclosure.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: model_refresh_threshold_actions
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: model_refresh_threshold_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0042
preserved_exact_tokens:
- Refresh Models
- Refresh Providers
- initial connect
- reconnect
- app boot/profile activation
- Edit Threshold
- most-local applicable override
- provider default
- model default
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-059 - Runtime Qualified Effort Capability

```yaml
plan_unit_id: MS-059
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Variant and effort controls remain runtime-qualified capability data; effort support is not inferred from
  model-name similarity, and provider features may expose provider-specific thinking controls rather than a universal effort
  enum.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-017
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_qualified_effort_capability
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_qualified_effort_capability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- effort support
- model-name similarity
- /features
- thinkingLevel
- thinkingBudget
- Gemini CLI
- Gemini 3-style
- 2.5-style
- runtime-qualified capability data
- universal effort enum
negative_constraints:
- Effort support is never inferred solely from model-name similarity.
- PM must not hardcode a universal effort enum for provider-specific thinking controls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-060 - Effort GUI Requested Effective Disclosure

```yaml
plan_unit_id: MS-060
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The GUI displays unavailable, silent, or stale discovery as Unknown rather than Unsupported and keeps requested
  and effective reasoning/effort selections distinct when runtimes clamp or ignore values.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effort_gui_requested_effective_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effort_gui_requested_effective_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- Unknown
- Unsupported
- requested
- effective
- reasoning/effort
- runtime clamps or ignores
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Unavailable, silent, or stale discovery should display Unknown instead of asserting Unsupported.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-061 - Legacy Effort Wording Supersession

```yaml
plan_unit_id: MS-061
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Legacy consumer wording that treats Gemini or Cursor effort as universally unsupported is superseded by the
  runtime-qualified capability rule.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-059
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: legacy_effort_wording_supersession
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: legacy_effort_wording_supersession
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0043
preserved_exact_tokens:
- Plans/assistant-chat-design.md
- /assistant-chat-design.md
- Gemini effort
- Cursor effort
- universally unsupported
- superseded
negative_constraints: []
compatibility_only_notes:
- Legacy assistant-chat effort-support wording is compatibility-only and superseded by runtime-qualified capability data.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-062 - Detailed Inspector Runtime Identity

```yaml
plan_unit_id: MS-062
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Detailed inspectors show the exact raw canonical model ID, concrete runtime surface, and any effective reroute
  or clamp the provider performed.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-054
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: detailed_inspector_runtime_identity
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: detailed_inspector_runtime_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0044
preserved_exact_tokens:
- Detailed inspectors
- exact raw canonical model id
- concrete runtime surface
- effective reroute
- clamp
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-063 - OpenCode Baseline Deltas Anchor

```yaml
plan_unit_id: MS-063
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The OpenCode baseline and Puppet Master deltas section anchor is preserved as a reference baseline location.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_baseline_deltas_anchor
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_baseline_deltas_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0045
preserved_exact_tokens:
- BASELINE-DELTAS
- OpenCode baseline and Puppet Master deltas
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-064 - OpenCode Model Baseline

```yaml
plan_unit_id: MS-064
unit_type: baseline_reference
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode baseline behavior uses provider_id/model_id parsing, first-slash splitting, config model then model.json
  last-used then internal priority sort, provider options, per-agent overrides, provider transforms, and regex overflow detection.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-063
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_model_baseline
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_model_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0046
preserved_exact_tokens:
- provider_id/model_id
- parseModel()
- first `/`
- config `model` field
- last used (`model.json`)
- internal priority sort
- config.provider.<id>.options
- agent.<name>.model
- regex patterns
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-065 - Puppet Master Non GUI Model Deltas

```yaml
plan_unit_id: MS-065
unit_type: delta_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Puppet Master keeps OpenCode identifier format while adding configurable model priority, Persona file default_model
  overrides, config.default_variant, Rust provider facade normalization, and Rust auto-compaction integration.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-064
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_non_gui_model_deltas
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: puppet_master_non_gui_model_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0047
preserved_exact_tokens:
- config.model_priority
- default_model
- PERSONA.md frontmatter
- config.default_variant
- Rust provider facade
- auto-compaction
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-066 - Puppet Master GUI Model Deltas

```yaml
plan_unit_id: MS-066
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Puppet Master adds a full Chat model picker dropdown, dedicated Models settings tab, and per-Persona override
  editing beyond the OpenCode TUI baseline.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-064
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_gui_model_deltas
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: puppet_master_gui_model_deltas
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0047
preserved_exact_tokens:
- GUI model picker
- full model picker dropdown in Chat
- dedicated Models settings tab
- per-Persona override editing
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-067 - Acceptance Model Identity And Selection

```yaml
plan_unit_id: MS-067
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require provider_id/model_id identifiers, parseModel first-slash splitting, and deterministic
  model selection for identical inputs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-012
- MS-015
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_model_identity_selection
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_model_identity_selection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- ACCEPTANCE
- AC-MOD01
- AC-MOD02
- provider_id/model_id
- parseModel()
- split on the first `/` only
- deterministically
- same model MUST be selected
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-068 - Acceptance Persona Fallback

```yaml
plan_unit_id: MS-068
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require Persona default_model to override lower-priority defaults but yield to explicit
  run-envelope or tier-config settings, and unavailable Persona models must warn and fall through without blocking the run.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_persona_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_persona_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD03
- AC-MOD04
- Per-Persona `default_model`
- explicit run-envelope
- tier-config model settings
- log a warning
- fall through
- run MUST NOT be blocked
negative_constraints:
- If a Persona specifies an unavailable model, the run MUST NOT be blocked.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-069 - Acceptance Variant Resolution And Validation

```yaml
plan_unit_id: MS-069
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require built-in variants to resolve dynamically and fall back to default when unavailable,
  and custom variants to validate unique name and model availability or log warnings.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-045
- MS-046
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_variant_resolution_validation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_variant_resolution_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD05
- AC-MOD06
- Built-in variants
- resolve dynamically
- fall back to `default`
- Custom variants
- unique name
- valid model identifier
- warning logged
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-070 - Acceptance Model Picker And Settings UI

```yaml
plan_unit_id: MS-070
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require the Chat model picker to display available models grouped by provider with variant
  quick-switch and Settings Models to support per-model option editing and variant management.
gui_related: true
gui_classification_reason: The unit covers user-visible model selection, display, settings, inspector, or usage presentation
  behavior.
split_recommended: false
depends_on:
- MS-055
- MS-057
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_model_picker_settings_ui
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: acceptance_model_picker_settings_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0048
preserved_exact_tokens:
- AC-MOD07
- AC-MOD08
- Chat panel model picker
- grouped by provider
- variant quick-switch
- Settings Models tab
- per-model option editing
- variant management
- add/edit/disable/remove
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Progression_Gates.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-071 - Persona Runtime Controls Addendum Header

```yaml
plan_unit_id: MS-071
unit_type: structural_anchor
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Persona Runtime Controls and Provider Capability Matrix addendum heading is preserved as the owner location
  for expanded Persona-driven runtime control behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_controls_addendum_header
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_controls_addendum_header
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0049
preserved_exact_tokens:
- 10. Persona Runtime Controls and Provider Capability Matrix (2026-03-06)
- Persona-driven runtime control
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-072 - Persona Runtime Request Set

```yaml
plan_unit_id: MS-072
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: A Persona may request platform/provider, model, variant, temperature, top_p, reasoning_effort, and provider-specific
  runtime options.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-040
- MS-071
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_request_set
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_runtime_request_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0050
preserved_exact_tokens:
- platform/provider
- model
- variant
- temperature
- top_p
- reasoning_effort
- provider-specific runtime options
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-073 - Provider Capability Matrix Application Gate

```yaml
plan_unit_id: MS-073
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona preferences participate in effective run assembly only after passing through the provider capability
  matrix.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, storage, provider compatibility, schema, or backend contract
  behavior rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-072
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_capability_matrix_application_gate
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_capability_matrix_application_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0050
preserved_exact_tokens:
- effective run assembly
- MUST pass through a provider capability matrix
- before being applied
negative_constraints:
- Persona runtime controls must not be applied before provider capability matrix evaluation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-074 - Effective Selection Identity Fields

```yaml
plan_unit_id: MS-074
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective model/runtime selection is part of the shared requested/effective identity contract and preserves
  distinct requested/effective platform, model, variant, auth, account, runtime, execution role, and selection reason fields.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_selection_identity_fields
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_selection_identity_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0051
preserved_exact_tokens:
- requested_platform
- effective_platform
- requested_model
- effective_model
- model_id_raw
- requested_variant
- effective_variant
- effort
- requested_auth_mode
- effective_auth_mode
- auth_family
- compact_threshold
- pool_scope
- effective_runtime
- effective_runtime_snapshot
- requested_account_policy
- requested_account_id?
- requested_account_binding?
- effective_account_id?
- effective_provider_identity?
- account_switch_reason?
- execution_role
- selection_reason
negative_constraints:
- Model selection must not collapse provider/account identity, execution role, and operational identity into one field.
- Same-provider accounts are not interchangeable for selection or history purposes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Support and disclosure must show whether a requested control was honored, skipped, or clamped.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-075 - Effective Selection Precedence Chain

```yaml
plan_unit_id: MS-075
unit_type: selection_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective model/runtime selection resolves deterministically through explicit run-envelope override, Persona
  preference, surface/tier/phase defaults, global/project config defaults, supported last-used state, and internal/provider
  defaults.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_selection_precedence_chain
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_selection_precedence_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0052
preserved_exact_tokens:
- Explicit run-envelope override
- Persona preference
- Surface/tier/phase defaults
- Global/project config defaults
- Last-used state
- Internal/provider defaults
- effective selection MUST be deterministic
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-076 - Direct Coding Plan Runtime Surfaces

```yaml
plan_unit_id: MS-076
unit_type: provider_surface_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Alibaba Coding Plan, MiniMax Coding Plan, and Z.AI Coding Plan are direct-provider architectural surfaces
  that resolve through requested/effective runtime, model, effort, account, and capability disclosure while OpenCode remains
  implementation-reference evidence.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_coding_plan_runtime_surfaces
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: direct_coding_plan_runtime_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0053
preserved_exact_tokens:
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- OpenCode
- requested/effective runtime
- model
- effort
- account
- capability disclosure
- /usage/quota
- /model-discovery
negative_constraints: []
compatibility_only_notes:
- Implementation-reference status does not make OpenCode session identity, provider discovery, or provider-specific request
  shaping the PM canonical runtime identity.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-077 - Coding Plan Product Labels In Picker Recommendation Surfaces

```yaml
plan_unit_id: MS-077
unit_type: gui_surface_rule
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI recommendation and picker surfaces keep coding-plan branded products and pay-as-you-go products visible
  as separate selectable/runtime-facing account or provider entries.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coding_plan_product_labels_picker_recommendation
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: coding_plan_product_labels_picker_recommendation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0053
preserved_exact_tokens:
- coding-plan-branded products
- selectable/runtime-facing surface
- pay-as-you-go products
- GUI recommendation
- picker surfaces
- separate selectable/runtime-facing account or provider entries
negative_constraints:
- Coding-plan products must not be collapsed into an unbranded vendor family or smoothed into one vendor label.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-078 - Interview GUI UX Gemini Stage Default

```yaml
plan_unit_id: MS-078
unit_type: surface_default_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Interview GUI/UI/UX Gemini preference is a surface/stage default at precedence level 3 when trigger conditions
  match, no explicit override wins, Gemini is configured and capable, and validation stages do not auto-switch without user
  or stage override.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-075
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_gui_ux_gemini_stage_default
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: interview_gui_ux_gemini_stage_default
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0054
preserved_exact_tokens:
- Interview GUI/UI/UX Gemini preference
- surface/stage default
- active surface = `interview`
- product_ux
- has_gui = true
- questioning
- research
- drafting
- review
- validation stages
- 'Interview GUI stage default: Gemini'
- Gemini unavailable
- explicit user override
negative_constraints:
- Validation stages do not auto-switch to Gemini unless the user or a stage override explicitly requests it.
- Gemini unavailability falls back to the normal precedence chain with no special-case retry loop.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-079 - Provider Persona Capability Matrix Baseline

```yaml
plan_unit_id: MS-079
unit_type: capability_matrix
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The Provider Persona Capability Matrix evaluates capability and effort per runtime surface, preserves day-one
  direct, server-bridged, and CLI-bridged surfaces, and keeps provider-native agent/session files outside PM runtime canon.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_persona_capability_matrix_baseline
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_persona_capability_matrix_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0055
preserved_exact_tokens:
- PERSONA-CAPABILITY-MATRIX
- Provider Persona Capability Matrix
- codex
- copilot
- opencode
- alibaba-coding-plan
- zai-coding-plan
- zai_coding_plan
- minimax-coding-plan
- gemini
- gemini-cli
- claude-code-cli
- cursor-cli
- Copilot-native subagent routing
negative_constraints:
- Capability and effort evaluation must be performed per runtime surface, not by loose provider-family assumptions.
- Provider-native agent or session files are not PM runtime canon.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Run_Modes.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Commands_System.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/orchestrator-subagent-integration.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-080 - Capability Support Granularity And Adapter Routing

```yaml
plan_unit_id: MS-080
unit_type: adapter_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Effective Persona-control support is the intersection of transport, model metadata, and runtime-path constraints,
  and adapter policy remains explicit for API-family routing, schema normalization, upstream identity, and provider-side router
  observation.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: capability_support_granularity_adapter_routing
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: capability_support_granularity_adapter_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0056
preserved_exact_tokens:
- transport support
- model-level support
- runtime constraint support
- responses
- chat
- model-language
- plain language model primitive selection
- Gemini/Vertex
- tool-schema
- anyOf
- numeric enums
- '#14788'
- '#12908'
- '#12827'
- '#12911'
- /observe
negative_constraints:
- PM must keep adapter policy explicit and must not assume one generic direct-provider loop is sufficient for all model families.
- Silent provider-side model changes are not allowed without requested/effective model disclosure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-081 - Direct Coding Plan Adapter Identity Facts

```yaml
plan_unit_id: MS-081
unit_type: provider_adapter_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Direct coding-plan provider identities remain direct-provider runtime bucket entries with explicit SDK, env,
  API base, quota/reset, and family-mapping facts.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-076
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: direct_coding_plan_adapter_identity_facts
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: direct_coding_plan_adapter_identity_facts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0056
preserved_exact_tokens:
- MINIMAX_API_KEY
- ZHIPU_API_KEY
- '@ai-sdk/anthropic'
- '@ai-sdk/openai-compatible'
- https://api.z.ai/api/coding/paas/v4
- //api.z.ai/api/coding/paas/v4
- /reset
- zai_coding_plan
- zai-coding-plan
- direct_api
- alibaba_coding_plan
- minimax_coding_plan
- https://platform.minimaxi.com/docs/coding-plan/intro
negative_constraints:
- Alibaba Coding Plan, MiniMax Coding Plan, and Z.AI Coding Plan are not CLI-bridged surfaces merely because they use provider
  SDK adapters.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-082 - Talkativeness Derived Persona Control

```yaml
plan_unit_id: MS-082
unit_type: derived_control_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: talkativeness is a Persona instruction-layer control with a 1-5 user-visible scale, default balanced value
  3, mode overlays, and explicit per-thread override ordering; it does not require a transport matrix row.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: talkativeness_derived_persona_control
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: talkativeness_derived_persona_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0057
preserved_exact_tokens:
- talkativeness
- '1'
- '2'
- '3'
- '4'
- '5'
- balanced
- plan mode
- ask mode
- agent mode
- persona_talkativeness
- instruction layer
- not through provider-native temperature/top-p semantics
negative_constraints:
- talkativeness is not a transport sampling knob and does not require its own transport matrix row.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-083 - Canonical Capability Snapshot Resolver Contract

```yaml
plan_unit_id: MS-083
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: GUI disclosure and runtime filtering resolve support state from one canonical machine-readable capability
  snapshot produced by the shared capability resolver and provider/model metadata inputs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: canonical_capability_snapshot_resolver_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: canonical_capability_snapshot_resolver_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- canonical machine-readable snapshot contract
- provider_id
- transport
- model_id
- variant
- controls
- persona_prompt_body
- persona_reasoning_effort
- documented
- empirical
- inferred
- resolved_capability_deltas[]
- pool_scope
- provider_entry
- cache is derivative
- no ad hoc UI-only logic
negative_constraints:
- Every control disclosure shown to the user must be derivable from the snapshot without ad hoc UI-only logic.
compatibility_only_notes: []
stale_retired_dispositions:
- Provider/model catalog snapshots carry boot_refresh_enabled, model_catalog_status, last_model_refresh_at, and selectable_unit_ids
  so boot-time refresh and stale catalog state remain inspectable.
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-084 - Account Routing Capability Metadata Snapshot

```yaml
plan_unit_id: MS-084
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Account-routing capability fields are part of the canonical snapshot when provider paths participate in multi-account
  selection, switching, or pressure routing, and unsupported or opaque facts remain explicitly disclosed.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: account_routing_capability_metadata_snapshot
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: account_routing_capability_metadata_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- supports_multi_account
- account_identity_kind
- quota_signal_sources[]
- quota_signal_confidence
- supports_threshold_switch
- supports_hard_exhaustion_detection
- supports_rate_limit_detection
- supports_reset_countdown
- supports_manual_set_active
- supports_cooldown
- supports_retry_budget
- supports_role_scoped_account_pools
- switch_boundary
- provider_limit_notes?
- signal_source_kinds[]
- signal_confidence
- retry_budget?
- cooldown_until?
- reset_at?
- unsupported
- opaque
- inferred
- stale
negative_constraints:
- Providers lacking cooldown, retry-budget, or reset countdown support must not pretend the provider account pool is safely
  switchable.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-085 - Talkativeness Snapshot Bridge And GUI Gating Rule

```yaml
plan_unit_id: MS-085
unit_type: runtime_disclosure
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: talkativeness appears in the snapshot only when prompt-construction policy records the effective value, derives
  from persona_prompt_body support, and uses the same skipped disclosure and GUI/runtime gating source as other Persona controls.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-082
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: talkativeness_snapshot_bridge_gui_gating
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: talkativeness_snapshot_bridge_gui_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0058
preserved_exact_tokens:
- persona_prompt_body
- skipped
- GUI gating
- runtime disclosure
- second inconsistent source
negative_constraints:
- GUI gating and runtime disclosure must not invent a second inconsistent source for talkativeness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-086 - Unsupported Persona Control Skip Disclosure

```yaml
plan_unit_id: MS-086
unit_type: runtime_disclosure
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Unsupported requested Persona controls are not silently ignored or shown as applied; they are recorded in
  skipped_persona_controls with reason and provider and exposed in UI.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-083
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unsupported_persona_control_skip_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: unsupported_persona_control_skip_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0059
preserved_exact_tokens:
- do not silently ignore it
- do not show it as applied
- skipped_persona_controls[]
- reason and provider
- expose that status in UI
- temperature
- top_p
- reasoning_effort
- unsupported by Claude Code transport
- unsupported by Cursor CLI transport
- provider does not expose effort knob
negative_constraints:
- Unsupported Persona controls must not be silently ignored or shown as applied.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-087 - Persona Control GUI Support States

```yaml
plan_unit_id: MS-087
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Persona-related model/runtime controls in GUI reflect provider support states as supported, partially_supported
  with warning badge and tooltip, or unsupported with explanatory disabled text.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-086
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: persona_control_gui_support_states
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: persona_control_gui_support_states
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0060
preserved_exact_tokens:
- supported
- partially_supported
- unsupported
- warning badge
- explanatory tooltip
- disabled with explanatory text
- Reasoning effort
- Cursor CLI
- Temperature
- Claude Code
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-088 - Runtime Surface Effective Choice Display

```yaml
plan_unit_id: MS-088
unit_type: gui_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Run surfaces display effective runtime choices and skipped controls, including Persona name, selection reason,
  effective platform/model/variant/effort, and provider-support status examples.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_surface_effective_choice_display
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_surface_effective_choice_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0061
preserved_exact_tokens:
- Persona name
- selection reason
- effective platform
- effective model
- effective variant/effort
- skipped controls
- 'Persona: Rust Engineer (Auto: Rust repo + code task)'
- 'Model: Codex GPT-5.3 (Persona preferred)'
- 'Platform: Codex (Available)'
- 'Skipped controls: temperature unsupported by provider'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-089 - OpenCode Role Baseline And Persona Canonicalization

```yaml
plan_unit_id: MS-089
unit_type: implementation_reference
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: OpenCode role object runtime shape is implementation-reference evidence; Puppet Master uses Persona as the
  canonical stored contract and adds provider capability disclosure instead of assuming all backends honor all knobs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: opencode_role_baseline_persona_canonicalization
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: opencode_role_baseline_persona_canonicalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0062
preserved_exact_tokens:
- OpenCode
- role object
- prompt
- model
- variant
- temperature
- topP
- permission
- options
- Persona as the canonical stored contract
- provider capability disclosure
negative_constraints: []
compatibility_only_notes:
- OpenCode demonstrates integrated runtime shape conceptually but is not PM canonical storage.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-090 - Effective Runtime Acceptance Criteria

```yaml
plan_unit_id: MS-090
unit_type: acceptance_criteria
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Acceptance criteria require effective runtime state to distinguish requested, effective, and skipped Persona
  controls, preserve requested_runtime and runtime outcomes, expose unsupported controls in editor/runtime UI, and show effective
  Persona/model/platform in history/event views.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-074
- MS-086
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_runtime_acceptance_criteria
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: effective_runtime_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0063
preserved_exact_tokens:
- requested vs effective vs skipped Persona controls
- requested_runtime
- substituted
- clamped
- blocked
- retried_on_fallback
- editor UI
- runtime UI
- Provider capability matrix
- Chat/Interview/Builder/Orchestrator history/event views
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-091 - Provider Failure Class Versus Model Fallback

```yaml
plan_unit_id: MS-091
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Model/provider selection fallback remains separate from runtime retry classification; unavailable Persona-preferred
  models fall through selection, while provider execution failures map to runtime taxonomy such as provider_transient.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-041
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_failure_class_versus_model_fallback
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_failure_class_versus_model_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0064
preserved_exact_tokens:
- Provider Failure-Class Alignment Addendum
- provider_transient
- unavailable Persona-preferred models
- normal selection chain
- shared runtime taxonomy
- provider-level retry defaults
negative_constraints:
- Provider-level retry defaults must not silently override the shared runtime retry/backoff matrix.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-092 - Runtime Retry Fallback Ownership Split And Attempt Snapshots

```yaml
plan_unit_id: MS-092
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Model fallback and runtime retry are separate: selection decides requested/effective provider/model before
  execution, runtime policy decides retry/remediation/block/escalation after classified outcome, and each attempt retains
  requested/effective identifiers.'
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-091
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_retry_fallback_ownership_attempt_snapshots
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: runtime_retry_fallback_ownership_attempt_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0065
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0066
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0068
preserved_exact_tokens:
- Runtime Retry / Fallback Ownership Addendum
- Ownership split
- Required attempt snapshots
- Fallback rule
- retried
- remediated
- blocked
- escalated
- requested and effective model/provider identifiers
negative_constraints:
- Providers and adapters may not invent model-local retry loops that bypass runtime policy.
- Model fallback may change the effective model only through the shared model-selection contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-093 - Requested Effective Model Retry Canonical Alignment

```yaml
plan_unit_id: MS-093
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective model resolution stays separate from runtime retry policy; retries, remediation, and prerequisite-resumed
  work are new attempts with new attempt snapshots and no hidden model-local retry loops.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-092
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_model_retry_canonical_alignment
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: requested_effective_model_retry_canonical_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0069
preserved_exact_tokens:
- Requested/Effective Model and Retry Ownership Canonical Alignment
- new attempts
- new attempt snapshots
- prerequisite-resumed work
negative_constraints:
- Providers/adapters must not hide model-local retry loops inside an already-running attempt.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Requested/effective model resolution remains separate from runtime retry policy.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-094 - Attempt Snapshot Identity Stability Across Retries

```yaml
plan_unit_id: MS-094
unit_type: runtime_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Attempt start persists stable requested/effective model snapshot identifiers, and retries/resumes cannot silently
  change model identity unless canonical runtime policy creates a new attempt with new snapshot IDs.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-093
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attempt_snapshot_identity_stability_retries
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: attempt_snapshot_identity_stability_retries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0070
preserved_exact_tokens:
- attempt start
- stable requested/effective model snapshot identifiers
- retries and resumes
- new attempt
- new snapshot IDs
- blocked reason
- retry classification semantics
negative_constraints:
- Model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-095 - UI Artifact Snapshot ID Consumption

```yaml
plan_unit_id: MS-095
unit_type: gui_consumer_rule
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: UI and artifact surfaces read model snapshot IDs from attempt records rather than inferring model identity
  from provider names alone.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-094
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: ui_artifact_snapshot_id_consumption
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: ui_artifact_snapshot_id_consumption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0070
preserved_exact_tokens:
- UI and artifact surfaces
- model snapshot IDs
- attempt records
- provider names alone
negative_constraints:
- UI and artifact surfaces must not infer model identity from provider names alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-096 - Child Run Runtime Snapshot Visibility And Effort Resolution

```yaml
plan_unit_id: MS-096
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Child runs, crew members, and planning/runtime decisions keep requested/effective model/runtime fields visible,
  resolve effort intent before translating per target surface, and do not silently fallback explicit runtime requests.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: child_run_runtime_snapshot_visibility_effort_resolution
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: child_run_runtime_snapshot_visibility_effort_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0071
preserved_exact_tokens:
- child runs
- crew members
- requested and effective model/runtime fields
- explicit child effort request
- child Persona or task preference
- weak parent hint
- target-surface default
- remapped effort values
- explicit runtime surface requests do not silently fallback
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-097 - Default Crew Runtime Settings And Copilot Normalization

```yaml
plan_unit_id: MS-097
unit_type: settings_model
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Default Crew configuration belongs under model/runtime settings and includes enablement, ordered crew members,
  per-member model/runtime selectors, and immediate whole-crew Copilot normalization because Copilot is a crew-level provider
  constraint.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime display, editor gating, picker/recommendation, UI/artifact,
  or settings behavior.
split_recommended: false
depends_on:
- MS-096
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: default_crew_runtime_settings_copilot_normalization
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: default_crew_runtime_settings_copilot_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0071
preserved_exact_tokens:
- Default Crew
- enable or disable Default Crew
- ordered list of crew members
- per-member model selector
- per-member provider/runtime surface selector
- immediate normalization
- Copilot
- crew-level provider selection constraint
- not a per-member freely mixed provider
negative_constraints:
- Copilot is not a per-member freely mixed provider in the default crew editor.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-098 - Provider Model Policy Inputs And Audit Scope

```yaml
plan_unit_id: MS-098
unit_type: audit_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: The provider/model selection policy and audit addendum surfaces canonical provider/model precedence through
  user-facing policy, capability gating, audit trail details, Persona axis, execution-unit type axis, and worktree/project/global
  scope axis.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, provider compatibility, data contracts, or backend execution
  semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-075
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_policy_inputs_audit_scope
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_policy_inputs_audit_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0073
preserved_exact_tokens:
- Provider/model selection policy and audit addendum
- user-facing policy
- capability gating
- audit trail details
- Persona axis
- Code Analyzer
- Documentation Writer
- Execution Unit Type axis
- run
- node
- delegated_subagent
- Scope axis
- worktree
- project
- global
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This addendum elaborates the canonical provider/model precedence owner section rather than replacing it.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-099 - Provider Model Selection Precedence Chain

```yaml
plan_unit_id: MS-099
unit_type: selection_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model selection resolves through the ordered 1-7 precedence chain from explicit run-envelope override
  through provider default, preserving scoped owner policy, Persona, surface/stage, project/global, and last-used semantics.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime selection, UI surface defaults, or inspector/audit presentation
  behavior.
split_recommended: false
depends_on:
- MS-075
- MS-098
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_model_selection_precedence_chain
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_model_selection_precedence_chain
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0074
preserved_exact_tokens:
- --provider=X --model=Y
- Scoped owner policy
- execution_unit_type
- node-type uses Copilot
- Persona preference
- Surface or stage default
- code review prefers GPT-4
- Project or global config default
- Last-used state
- Provider default
- provider's canonical default model
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-100 - Settings Resolution Policy Modes

```yaml
plan_unit_id: MS-100
unit_type: settings_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Settings resolution supports Conservative, Standard, and Aggressive policies with explicit tier inclusion
  rules and default Standard behavior.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-099
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: settings_resolution_policy_modes
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: settings_resolution_policy_modes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0075
preserved_exact_tokens:
- Conservative policy
- Standard policy
- default
- Aggressive policy
- settings tier 1
- tier 3+
- tiers 1-5
- tiers 1-7
- cheapest or fastest model
negative_constraints:
- Conservative policy must not apply stage defaults or persona preferences.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs: []
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-101 - Provider Capability And Multi Account Selection Gate

```yaml
plan_unit_id: MS-101
unit_type: runtime_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider selection checks required model and inference capabilities plus multi-account capability facts before
  any provider/account pool can be selected or switched.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-079
- MS-084
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_capability_multi_account_selection_gate
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: provider_capability_multi_account_selection_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- Capability check
- Multi-account capability check
- supports_multi_account
- signal sources/confidence
- cooldown/retry-budget support
- reset countdown support
- provider-specific limits
- account pressure interpretation
- rotation safety
- context length
- output length
- reasoning mode
negative_constraints:
- Provider/account pools must not be selected or switched before required multi-account capability modeling is available.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-102 - Cost Budget Fallback Concern

```yaml
plan_unit_id: MS-102
unit_type: audit_policy
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Cost gating skips models that exceed the active Persona cost budget and falls through; if all preferred models
  exceed budget or are unavailable, PM emits a concern and suggests cheaper alternatives or escalation rather than failing
  silently.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-101
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cost_budget_fallback_concern
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: cost_budget_fallback_concern
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- Cost gating
- active Persona's cost budget
- skip it and move to the next in the precedence chain
- Fallback
- emit a concern (not a silent failure)
- cheaper alternatives
- escalation
negative_constraints:
- Fallback must emit a concern and must not be a silent failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-103 - Clamp Substitution Reason Code Taxonomy

```yaml
plan_unit_id: MS-103
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Requested/effective clamp and substitution decisions use the clamp/substitution reason-code family with exact
  reason codes for unavailable, routed, substituted, unsupported, clamped, unknown, and partial projection states.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-074
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: clamp_substitution_reason_code_taxonomy
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: clamp_substitution_reason_code_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- clamp/substitution
- model_unavailable
- model_routed_by_provider
- model_substituted
- effort_unsupported
- effort_clamped
- auth_family_capability_clamped
- capability_unknown
- instruction_projection_partial
- skill_projection_partial
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-104 - Clamp Substitution Semantics And Partial Evidence Disclosure

```yaml
plan_unit_id: MS-104
unit_type: audit_requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Clamp/substitution semantics distinguish PM inability from provider-side rerouting, unsupported effort from
  accepted-but-narrowed effort, and partial/unknown evidence from fully honored model, capability, or instruction state.
gui_related: true
gui_classification_reason: The unit covers user-visible model/runtime selection, UI surface defaults, or inspector/audit presentation
  behavior.
split_recommended: false
depends_on:
- MS-103
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: clamp_substitution_semantics_partial_evidence_disclosure
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: clamp_substitution_semantics_partial_evidence_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0076
preserved_exact_tokens:
- /substitution
- PM inability
- provider-side rerouting
- unsupported effort controls
- accepted-but-narrowed effort controls
- partial or unknown evidence
- fully honored model/capability/instruction state
negative_constraints:
- UI must not present a fully honored model, capability, or instruction state when PM has only partial or unknown evidence.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-105 - Selection Reason Payload Contract

```yaml
plan_unit_id: MS-105
unit_type: data_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Provider/model selection emits a selection_reason object carrying selected provider/model, precedence tier,
  optional fallback reason, alternatives considered, selection timestamp, and execution unit identity.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-099
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_reason_payload_contract
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_reason_payload_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- selection_reason
- selected_provider
- selected_model
- precedence_tier
- fallback_reason?
- 'alternatives: Array'
- selection_time_utc
- execution_unit_id
- '''openai'''
- '''anthropic'''
- '''github'''
- '''gpt-4'''
- '''claude-3-opus'''
- 1-7
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Models_System.md remains the provider/model owner while referenced docs consume the preserved contract.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```

### MS-106 - Selection Reason Audit Trail Traceability

```yaml
plan_unit_id: MS-106
unit_type: audit_requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Selection metadata is logged so inspectors and auditors can trace why a model was chosen and what constraints
  were active.
gui_related: false
gui_classification_reason: The unit covers model/runtime policy, data contracts, selection semantics, or backend audit behavior
  rather than direct GUI presentation.
split_recommended: false
depends_on:
- MS-105
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The behavior is addressable through fine-grained Models_System PlanUnits instead of broad MS-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: selection_reason_audit_trail_traceability
reasoning_tier: standard
context_scope: models_system_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: selection_reason_audit_trail_traceability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- inspectors
- auditors
- trace why a particular model was chosen
- constraints were active
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Selection reason metadata supports inspector and auditor traceability without creating WorkNodes.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
split_recommendation_reason: The covered span set is narrow enough for this PlanUnit; mixed GUI/backend surfaces were split
  where safe.
```
### MS-001 - Models System Retired Source-Preserving Bridge

```yaml
plan_unit_id: MS-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: MS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 099 because Models_System-S0001
  through Models_System-S0081 are covered by MS-002 through MS-106 or explicit structural, retired, and migration-coverage
  dispositions. MS-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained Models_System PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- MS-099
- MS-100
- MS-101
- MS-102
- MS-103
- MS-104
- MS-105
- MS-106
unblocks: []
acceptance_criteria:
- MS-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 099.
- Models_System-S0001 through Models_System-S0081 product coverage is owned by MS-002 through MS-106 or explicit structural,
  retired, and migration-coverage dispositions.
- MS-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Models_System-S0080
preserved_exact_tokens:
- MS-001
- Models System Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MS-001 must not re-own Models_System-S0001 through Models_System-S0081 after Phase 2B batch 099.
- MS-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- MS-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MS-001 residual source-preserving bridge is retired by Phase 2B batch 099.
owner_boundary_notes:
- MS-002 through MS-106 and explicit coverage dispositions own Models_System product coverage after bridge retirement.
- Models_System-S0080 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Models_System.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- 'ContractRef: Primitive:Persona, Primitive:ExecutionUnitContext, ContractName:Plans/Executor_Protocol.md'
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: No split remains for the retired bridge; product coverage has been atomized or structurally dispositioned.
```

## Migration Coverage

Original hash: `c21e126a333195a8bcdc1cd0e36aeb481c934defeb85a72b60479c5b519f134c`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch `phase2b-096-models-system-lines-1-400` atomized `Models_System-S0001` through `Models_System-S0025` into `MS-002` through `MS-023`. Phase 2B batch `phase2b-097-models-system-lines-393-792` atomized `Models_System-S0026` through `Models_System-S0050` into `MS-024` through `MS-073`. Phase 2B batch `phase2b-098-models-system-lines-781-1180` atomized `Models_System-S0051` through `Models_System-S0073` into `MS-074` through `MS-098`. Phase 2B batch `phase2b-099-models-system-lines-1171-1244` atomized `Models_System-S0074` through `Models_System-S0077` into `MS-099` through `MS-106` and dispositioned `Models_System-S0078` through `Models_System-S0081` as structural, retired bridge, or migration-coverage rows. `MS-001` is retired to `source_preserving_bridge_retired` migration-lineage compatibility. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### MS-107 - Provider Model Precedence Owner Pointer Compile Addendum

```yaml
plan_unit_id: MS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns provider/model precedence, model availability, and provider/model selection semantics. Executor, WorktreeGitImprovement,
  orchestrator-subagent-integration, and Crosswalk consume this owner section when they need dispatch-time carry-through; they must not define
  independent provider/model precedence rules in empty owner stubs.
gui_related: true
gui_classification_reason: Provider/model precedence affects visible model selectors and settings, even though the owner rule is shared runtime metadata.
depends_on: [MS-001]
unblocks: []
acceptance_criteria:
  - Provider/model precedence stubs in adjacent docs point to Models_System or consume its PlanUnits.
  - Dispatch-time carry-through preserves requested and effective provider/model identity without creating a second precedence owner.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual provider/model owner review
risk_class: provider_model_precedence_drift
reasoning_tier: standard
context_scope: provider_model_precedence_owner
implementation_surfaces: [Plans/Models_System.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: provider_model_owner_pointer, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0070
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0072
preserved_exact_tokens: ["Coverage blocker provider/model precedence owner section", "provider/model precedence", "dispatch-time carry-through", "requested_provider", "effective_provider", "requested_model", "effective_model"]
negative_constraints:
  - Do not make Executor or WorktreeGitImprovement replace Models_System provider/model precedence ownership.
owner_hints: [Plans/Models_System.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/orchestrator-subagent-integration.md]
```

## Ledger Compile Addendum - pldg-20260616-001

### MS-108 - Goal Runtime Model Role Resolution Consumer

```yaml
plan_unit_id: MS-108
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns concrete requested/effective model resolution for Goal Runtime worker, planner, evaluator, verifier, and adjudicator roles, plus model capability evidence needed by Goal_Runtime_System certification policy. Goal_Runtime_System owns block/degrade semantics, and provider-specific default tier mappings remain deferred.
gui_related: false
gui_classification_reason: Concrete model-role resolution and capability evidence are backend provider/model policy; F3-393 owns the visible Settings selectors.
depends_on:
  - MS-017
  - MS-073
  - MS-074
  - GRS-010
unblocks: []
acceptance_criteria:
  - Goal Runtime role policies can request model resolution for worker, planner, evaluator, verifier, and adjudicator roles.
  - Resolution exposes requested/effective model identity and capability evidence for each role where relevant.
  - Models_System does not override Goal Runtime certification-tier block/degrade semantics and does not hard-code provider defaults.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime model-role resolver review
risk_class: goal_runtime_model_resolution_drift
reasoning_tier: high
context_scope: goal_runtime_model_policy
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: goal_runtime_model_role_resolution
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0103
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
preserved_exact_tokens:
  - "worker_default"
  - "planner"
  - "evaluator"
  - "adjudicator"
  - "verifier"
  - "requested/effective model"
  - "capability evidence"
negative_constraints:
  - Do not hard-code provider defaults in Models_System for Goal Runtime certification correctness.
  - Do not collapse verifier/adjudicator and worker model roles into one effective selection.
owner_hints:
  - Plans/Models_System.md
  - Plans/Goal_Runtime_System.md
  - Plans/Multi-Account.md
```

## Ledger Compile Addendum - pldg-20260616-002

### MS-109 - Orchestrator Capability Lane Binding Policy

```yaml
plan_unit_id: MS-109
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns model and provider resolution for Orchestrator Goal Runtime capability_lane and agent_role bindings. Required lane roles include low_cost_executor, standard_reviewer, high_reasoning_orchestrator, verifier, adjudicator, and certifier. Resolution must use configured providers, accounts, model profiles, and provider-specific owner docs such as Plans/Provider_OpenCode.md, expose requested/effective identity and capability evidence, and return unconfigured-lane blockers when a required lane has no valid binding. Old tier-era wording may remain only as compatibility/search aliases where necessary; capability_lane and agent_role are Models-owned binding inputs, while write_mode and certification_tier are consumed references from Goal Runtime, Contracts, storage, Permissions, and Worktree owner surfaces rather than Models-owned enforcement or certification semantics.
gui_related: false
gui_classification_reason: Lane binding resolution is backend model/provider policy; FinalGUISpec owns visible Settings controls.
depends_on:
  - MS-108
unblocks: []
acceptance_criteria:
  - Model resolution accepts capability_lane and agent_role inputs for Orchestrator Goal Runtime.
  - Required lane roles resolve through configured providers, accounts, and model profiles.
  - requested/effective identity and capability evidence are exposed to runtime receipts and GUI projections.
  - Missing required bindings return unconfigured-lane blockers instead of selecting arbitrary defaults.
  - Legacy tier labels are treated only as compatibility/search aliases; capability_lane and agent_role remain Models-owned binding inputs, while write_mode and certification_tier are carried as owner-surface references rather than Models-owned enforcement or certification semantics.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future capability-lane resolver review
risk_class: capability_lane_resolution_drift
reasoning_tier: high
context_scope: orchestrator_goal_model_policy
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: orchestrator_capability_lane_binding
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0027
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0028
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0029
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0030
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0034
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0093
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:corr-0002
preserved_exact_tokens:
  - "capability_lane"
  - "agent_role"
  - "low_cost_executor"
  - "standard_reviewer"
  - "high_reasoning_orchestrator"
  - "verifier"
  - "adjudicator"
  - "certifier"
  - "requested/effective"
  - "unconfigured-lane"
  - "compatibility/search aliases"
  - "tier-era wording"
  - "write_mode"
  - "certification_tier"
negative_constraints:
  - Do not hardcode provider/model defaults.
  - Do not resolve low_cost_executor lanes as verifier, adjudicator, or certifier roles.
  - Do not preserve old tier-era wording as the canonical execution model.
  - Do not make Models_System own write_mode enforcement, worktree lease policy, or certification semantics.
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
```
