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

### MS-001 - Models System (Canonical SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: MS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Plans/Models_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Models_System-S0077
preserved_exact_tokens:
- Models System (Canonical SSOT)
- Canonical owner-section requirements
- Coverage blocker provider/model precedence owner section
- 0. Scope and SSOT status
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
- SSOT references (DRY)
- Provider/model precedence and settings resolution
- Scope and owner boundaries
- Three-axis settings model
- Deterministic precedence by scope
- Resolver inputs and emit shape
- 1. Canonical model identifier
- 1.1 Format
- 'ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md'
- 1.2 Runtime-platform distinction
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md'
- 1.3 Display-name policy
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md'
- 2. Model and runtime selection priority
- 'ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md'
- 3. Model options configuration
- 3.1 Per-provider options
- 3.2 Per-model options
negative_constraints:
- 'Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields'
- 'Owner-of-owners cleanup is implementation-relevant: 00-plans-index.md, plans-index, Decision_Log, Decision_Log.md, rewrite-tie-in-memo, rewrite-tie-in-memo.md, feature-list, feature-list.md, newfeatures.md, addendum-to-plan-map, SSOT rows, highest-value owner-of-owners routing, promoted-feature phas'
- Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider
- Execution object copies are execution-object-level records, not loose GUI hints. The GUI must not-forget node-worker and `/model` ownership when it renders or copies provider/model state for execution objects.
- Help and explanation copy must preserve copy-depth and concept-governance metadata. `Personas.md`, `Models_System`, `Models_System.md`, `FinalGUISpec.md`, `/help`, authored-copy, `Expert`, and `ELI5` outputs may simplify presentation, but they must not simplify the underlying provider/model contract
- Tab identity is scoped. `tab_id` must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.
- Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.
- Planning and `/output` surfaces consume the same subject-open model as artifact-opening flows. file-opening documentation may realize a chosen subject, but it must not replace the shared subject-open resolver or create provider/model-specific open rules.
- GUI `/disambiguation` uses secondary text such as `/runtime/auth-family/billing` context when a `cleaned-label` collision occurs. Cosmetic display labels, normalized internal keys, and collision-safe grouping must not mutate the stored `provider_id/model_id`.
- Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Gemini CLI keep distinct capability entries, and Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.
- Google Vertex Anthropic 1M-context support is runtime-path-specific. PM must not hardcode one universal 1M-context signal because implementation-reference issues disagree on whether the correct signal is a header or a body field depending on endpoint and /runtime path (`#14003`, `#17494`, `#14055`).
- OpenAI/Azure-family API-family selection and API path selection are per-model and `/per-provider` model/runtime compatibility facts. Azure loaders that switch between `responses()` and `chat()` based on `useCompletionUrls` must preserve that choice in provider capability and request metadata; non-Op
- '- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.'
- '- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.'
- '- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl; deployment mode, requested/effective adapter identity, and capability differences remain visible before fallback or recovery.'
- '- DuckDuckGo partial crawl behavior must not disappear'
- '**AC-MOD04:** If a Persona specifies an unavailable model, the system MUST log a warning and fall through to the next priority level. The run MUST NOT be blocked.'
- '- PM must keep adapter policy explicit and must not assume one generic direct-provider loop is sufficient for all model families; OpenAI-like providers therefore use per-surface API-family routing, including explicit `responses` vs `chat` vs `model-language` / plain language model primitive selectio'
- '- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix'
- '- providers/adapters must not hide model-local retry loops inside an already-running attempt'
- '- model fallback behavior MUST NOT rewrite blocked reason or retry classification semantics'
compatibility_only_notes:
- Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.
- 'Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over '
- 'Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields'
- Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider
- Legacy tier-scoped references from `Plans/feature-list.md`, `Plans/00-plans-index.md`, `/feature-list.md`, `/00-plans-index.md`, and feature-list material are compatibility inputs only and cannot override the current provider/model owner contract.
- Adjacent UI and persona compatibility references preserve both full paths and legacy aliases for `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/FinalGUISpec.md`, `/storage-plan.md`, `/Orchestrator_Page.md`, and `/Personas.md`.
- Multi-account and persona compatibility references preserve `Plans/Multi-Account.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/Multi-Account.md`, `/Orchestrator_Page.md`, and `/Personas.md` when provider/account context is displayed beside model selection.
- 'Lifecycle transitions require an event model: the event that causes each state transition must be represented with the execution-unit, provider/model snapshot, blocked-state, and receipt identity that made the transition valid.'
- The legacy four-tier hierarchy from newfeatures.md and the canonical chain-wizard-flexibility / chain-wizard-flexibility.md node-graph model are incompatible execution models; compatibility text must name four-tier and node-graph explicitly instead of blending them.
- Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.
- 'The owner-doc cleanup rule is strict: if anchor tables, `/body` prose, addenda, or compatibility examples leave old and new provider/model models both canonical in the same surface, this document must collapse the split-brain rule into one requested/effective resolver statement instead of treating a'
- Executor compatibility keeps `Executor_Protocol`, `Executor_Protocol.md`, `/seam`, `/execution`, execution-unit, and TierContext references mapped to the current execution-unit context and package/seam overseer governance model.
- Tier-native ingestion and active-agent tracking are legacy compatibility inputs. tier-native, active-agent, lane-aware scheduling, and worktree tracking must resolve through package/lane ownership rather than reviving tier-native execution semantics.
- '- Canonical model IDs align with persisted vocabulary in `Plans/Contracts_V0.md` (`/Contracts_V0.md` in legacy path references); contracts may cite the model provider namespace, but they do not redefine this identifier grammar.'
- '- `model_id_raw`, `effort`, `compact_threshold`, `auth_family`, `pool_scope`, `effective_runtime`, and `effective_runtime_snapshot` remain inspectable runtime/model fields when they affect selection, compatibility, or requested/effective disclosure.'
- Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Gemini CLI keep distinct capability entries, and Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.
- Compatibility evidence that labels a Google Vertex AI/Google AI cache-marker gap as `cachePoint` is treated as a `cache_control`/`cachedContent` capability issue; PM must emit the native cache marker for the selected route or repeated 5-15K-token prompt spans may be BILLED again instead of reusing c
- OpenAI/Azure-family API-family selection and API path selection are per-model and `/per-provider` model/runtime compatibility facts. Azure loaders that switch between `responses()` and `chat()` based on `useCompletionUrls` must preserve that choice in provider capability and request metadata; non-Op
- OpenCode reference evidence prefers the Responses API for OpenAI, while Chat-Completions-only proxies have known compatibility issues (`#15016`, `#7793`); PM records the selected OpenAI/Azure API family per model/runtime instead of assuming a universal route.
- Model catalog entries carry `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`. Deprecated models may continue for compatible existing work with a `deprecation_notice_ref?`; `/sunset` or `sunset` models require `sunset_at_utc?` and `replacement_model
- 'For Bedrock, region and `/model-id` rewrite rules are deterministic provider-runtime compatibility facts: PM may add the required regional prefix only through the table below and must honor no-rewrite exemptions for ARNs and provider-native ids that are already canonical.'
- '- Any legacy consumer wording in `Plans/assistant-chat-design.md` or `/assistant-chat-design.md` that treats Gemini effort or Cursor effort as universally unsupported is superseded by this runtime-qualified capability rule.'
stale_retired_dispositions:
- '- ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently inheriting stale effective state'
- Model catalog entries carry `model_lifecycle_state` with closed values `active | deprecated | sunset_pending | sunset | removed`. Deprecated models may continue for compatible existing work with a `deprecation_notice_ref?`; `/sunset` or `sunset` models require `sunset_at_utc?` and `replacement_model
- '### 4.2 Pricing metadata and stale-pricing behavior'
- Pricing metadata is versioned. `pricing_version` identifies the pricing table used for cost calculation. User-supplied overrides are applied before warnings. Doctor integration warns when stored pricing metadata is stale relative to the current provider metadata snapshot.
- AWS Bedrock pricing uses the same `pricing_version`, stale-pricing warning, and user-override path as other providers; AWS-specific region-prefix or price-drift evidence is handled by the Bedrock lookup below rather than hardcoded price branches.
- '- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale '
- '- availability or capability gaps without inferring unsupported when discovery is merely silent or stale'
- '- model discovery `/state`, including whether stale cached models remain visible while refresh runs, whether a single provider refresh failed, and whether progress is partial or complete.'
- '- unavailable, silent, or stale discovery should display `Unknown` instead of asserting `Unsupported`.'
- '- Provider/model catalog snapshots carry `boot_refresh_enabled`, `model_catalog_status`, `last_model_refresh_at`, and `selectable_unit_ids[]` / `selectable_unit_ids` so boot-time refresh, stale catalog state, and the selectable units tied to a catalog entry remain inspectable.'
- The generic signal axes remain `signal_source_kinds[]` and `signal_confidence` for signal sources/confidence. `quota_signal_sources[]` plus `quota_signal_confidence` are the quota/account-pressure specialization of those axes for account-pressure interpretation. The resolver treats these as provider
owner_boundary_notes:
- '# Models System (Canonical SSOT)'
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Coverage blocker provider/model precedence owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '## 0. Scope and SSOT status'
- This document is the **single canonical source of truth** for the Puppet Master model selection, configuration, and variant system — how models are identified, selected, overridden per Persona, and cycled via variants. All other plan documents MUST reference this document by anchor (e.g., `Plans/Mod
- '### SSOT references (DRY)'
- '- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '### Scope and owner boundaries'
- This section is the single owner section for provider/model precedence across run, seam, package, node, overseer, and delegated-subagent scope.
- '- Ownership transitions between overseer and delegated-subagent levels must stay in this owner section so later addenda elaborate the policy without replacing the canonical resolver contract.'
- 'The canonical precedence chain is:'
- 2. scoped owner policy for the active execution unit (`run`, `seam`, `package`, `node`, `overseer`, or delegated subagent)
- '- parallel-node worktree assignment participates in precedence when a worktree owner constrains the allowed provider/model surface for that node'
- '- scope owner policy (`run`, `seam`, `package`, `node`, `overseer`, delegated-subagent)'
- That emit shape is consumed by runtime snapshots, inspectors, and owner transitions; later sections in this document elaborate, but do not replace, this owner section.
- 'Provider/model concern surfaces share the concern lifecycle vocabulary used by runtime owners: `active`, `acknowledged`, `resolved`, and `dismissed` remain separate states; `resolution_kind` includes `accepted_risk`; and any concern-action confirmation matrix must disclose whether model/provider sel'
- Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.
- Node execution settings use requested-vs-effective disclosure across `/model/effort/persona`, `/model/effort`, `/settings`, `/type`, runtime-model policy, node-worker policy, and per-node execution. `feature seam`, `work package`, node, work-package overseers, and overseer-spawned subagents may each
- 'Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over '
- 'GitHub and project account context are separate selection inputs: `GitHub_Integration`, `GitHub_Integration.md`, `storage-plan`, and `storage-plan.md` consume current-repo, current-account, selected_repo_id, and project-scoped account policy state without moving the provider/model precedence owner o'
- Adjacent owner references repeatedly implicated in provider/model cleanup include `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Multi-Account.md`, `Plans/Widget_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Executor_Protocol.md`, `Plans/Orchestrator_Page.md`, `Plans/Provider_OpenCode.md`
owner_hints:
- Plans/Models_System.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `10fe6fe1c4a9e31b624537b011c0b93e66a40ad7e68a7ee45eed589ae1abe66b`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Models_System-S0001` through `Models_System-S0077` are preserved in place and mapped in `coverage_map.jsonl` to `MS-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
