# Models System (Canonical SSOT)

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-167: Coverage blocker provider/model precedence owner section
- Coverage rows: cov-167
- Fidelity gap refs: cov-167
- Required fidelity items:
- Exact required item: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact required item: Tie that section to parallel-node worktree assignment and ownership transitions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-167: Coverage blocker provider/model precedence owner section` exists in `Plans/Models_System.md`.
- Exact acceptance check: The `cov-167` repair states the exact requirement: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact acceptance check: The `cov-167` repair states the exact requirement: Tie that section to parallel-node worktree assignment and ownership transitions
- Exact acceptance check: The `cov-167` repair is in the owner section for `Plans/Models_System.md` and is not only a downstream consumer note.

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

## 1. Canonical model identifier
<a id="MODEL-ID"></a>

### 1.1 Format

A model is identified canonically by `provider_id/model_id`.

Rules:
- split on the first `/` only.
- `provider_id/model_id` remains the stored and runtime-canonical model identifier.
- label cleanup, grouping, family pooling, and runtime-platform grouping must never rewrite the canonical identifier.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md

### 1.2 Runtime-platform distinction

Model identity and runtime-platform identity are separate concerns.

Required fields:
- `requested_model` / `effective_model` keep the canonical model id
- `requested_runtime_platform_id` / `effective_runtime_platform_id` disclose the concrete runtime surface
- `requested_model_provider_id` / `effective_model_provider_id` disclose the model vendor namespace when that differs from the runtime surface label

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

### 1.3 Display-name policy

GUI labels may clean spacing or casing for readability, but they must preserve meaningful tokens such as version, `mini`, `pro`, `flash`, `thinking`, and coding-plan suffixes.

Duplicate runtime availability remains runtime-qualified. If the same canonical model appears through multiple runtime surfaces, the UI disambiguates with secondary runtime-platform context instead of minting a fake new canonical model id.

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

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

#### 3.3.2 `system_role_name` values

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

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

### 3.4 Provider transform layer

Per-provider normalization and options injection is handled by the provider transform layer (`Plans/CLI_Bridged_Providers.md`). This includes:
- Message normalization (e.g., Anthropic rejects empty content).
- Provider-specific headers and features (e.g., Anthropic beta headers).
- Schema transformation for tool definitions.
- Max output token enforcement.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

---

## 4. Model availability and error handling

### 4.1 Availability and runtime-surface checks

A model is available only when its provider/runtime surface is registered, authenticated, reachable, and compatible with the requested run posture.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

### 4.2 Pricing metadata and stale-pricing behavior

Pricing metadata is versioned. `pricing_version` identifies the pricing table used for cost calculation. User-supplied overrides are applied before warnings. Doctor integration warns when stored pricing metadata is stale relative to the current provider metadata snapshot.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

Cost attribution is keyed by `(model_id, provider_id, billing_entity_id)` when the provider's quota semantics depend on a billing entity; account-only providers omit the billing-entity dimension.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

### 4.3 Bedrock region prefix lookup

Region-prefix mapping MUST use an explicit lookup table rather than string slicing.

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

This section mirrors the linked owner contract and stays aligned with it.

Core rules:
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- DuckDuckGo capability rows must preserve native-ish search, PM-composed research/fetch/extract, and partial crawl behavior instead of flattening those cells to unsupported.
- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.

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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md

### 7.3 Variant and effort controls

Variant and effort controls remain runtime-qualified capability data.

Rules:
- effort support is never inferred solely from model-name similarity.
- unavailable, silent, or stale discovery should display `Unknown` instead of asserting `Unsupported`.
- the GUI must keep requested and effective reasoning/effort selections distinct when a runtime clamps or ignores them.

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
- `requested_variant`
- `effective_variant`
- `requested_auth_mode`
- `effective_auth_mode`
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

Supported surfaces for this change set:

| Surface | Class | Key notes |
|---|---|---|
| `codex` direct | direct-provider | Explicit API-family selection may be required. |
| `copilot` direct | direct-provider | Native subagent billing/routing behavior is special and not freely mixed from non-Copilot parents. |
| `opencode` server | server-bridged | PM child runs map to OpenCode session lineage additively. |
| `alibaba-coding-plan` direct | direct-provider | Effort and API-family behavior must be treated as provider-specific, not assumed OpenAI-equivalent. |
| `zai-coding-plan` direct | direct-provider | Same requested/effective runtime and effort rules apply. |
| `minimax-coding-plan` direct | direct-provider | Same requested/effective runtime and effort rules apply. |
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
- Both the runtime filtering stage and the Persona editor MUST call the same resolver to obtain this snapshot.
- A cached copy MAY be persisted for performance, but the cache is derivative; the canonical source is the shared capability resolver plus its provider/model metadata inputs.
- Every control disclosure shown to the user MUST be derivable from this snapshot without ad hoc UI-only logic.
- `source` MUST be one of `documented`, `empirical`, or `inferred` so future verification work can distinguish hard facts from provisional assumptions.

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
## Requested/Effective Model and Retry Ownership Reconciliation Addendum (2026-03-09)

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
- immediate normalization of the whole crew to Copilot when any member selects Copilot

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
- **Cost gating**: If a model exceeds the active Persona's cost budget, skip it and move to the next in the precedence chain.
- **Fallback**: If all preferred models exceed budget or are unavailable, emit a concern (not a silent failure) and suggest cheaper alternatives or escalation.

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
