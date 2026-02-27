# Models System (Canonical SSOT)

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

## 1. Canonical model identifier

<a id="MODEL-ID"></a>

### 1.1 Format

A model is identified by the compound string `provider_id/model_id`:

- **`provider_id`**: The provider slug (e.g., `anthropic`, `openai`, `google`, `copilot`, `bedrock`).
- **`model_id`**: The provider-specific model name (e.g., `claude-sonnet-4`, `gpt-5`, `gemini-3-pro`).

The canonical parse rule: split on the **first** `/` character. Everything before the first `/` is `provider_id`; everything after (including subsequent `/` characters) is `model_id`.

Example: `anthropic/claude-sonnet-4` → provider `anthropic`, model `claude-sonnet-4`.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/CLI_Bridged_Providers.md

### 1.2 Validation

- `provider_id` MUST be a non-empty string matching a registered provider in the provider registry.
- `model_id` MUST be a non-empty string.
- The combined `provider_id/model_id` MUST be unique within the set of available models.

---

## 2. Model selection priority

<a id="SELECTION-PRIORITY"></a>

When determining which model to use for a given Agent run, the following precedence applies (first match wins):

| Priority | Source | Description |
|----------|--------|-------------|
| 1 (highest) | **Explicit override** | Run envelope, CLI flag, or per-tier model setting from the Tiers config. |
| 2 | **Persona model override** | Per-Persona model preference (§5). |
| 3 | **Variant selection** | Currently-selected variant resolves to a specific model (§6). |
| 4 | **Config `model` field** | `config.model` in app config. |
| 5 | **Last used** | Reads `model.json` from state directory; checks each `{providerID, modelID}` against available providers. |
| 6 (lowest) | **Internal default** | Sorts available models by internal priority list, then by `"latest"` suffix, then alphabetically. First match wins. |

Rule: Given the same inputs (config, Persona, variant state, available providers), model selection MUST be deterministic.

ContractRef: PolicyRule:Decision_Policy.md§3, ContractName:Plans/Run_Modes.md

### 2.1 Internal priority list

The internal default priority list (lowest precedence, used when no other source specifies a model):

```
["gpt-5", "claude-sonnet-4", "big-pickle", "gemini-3-pro"]
```

This list is **configurable** via `config.model_priority` (ordered array of model ID substrings). Models matching an earlier entry are preferred. Among matches at the same priority, models with a `"latest"` suffix are preferred, then alphabetical order.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

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

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `max_output_tokens` | `u32` | `32000` | Maximum output tokens. |
| `temperature` | `f64` | Provider default | Sampling temperature. |
| `top_p` | `f64` | Provider default | Nucleus sampling parameter. |
| `reasoning_effort` | `string` | `"medium"` | Reasoning effort level (low/medium/high). Only for models that support it. |

### 3.4 Provider transform layer

Per-provider normalization and options injection is handled by the provider transform layer (`Plans/CLI_Bridged_Providers.md`). This includes:
- Message normalization (e.g., Anthropic rejects empty content).
- Provider-specific headers and features (e.g., Anthropic beta headers).
- Schema transformation for tool definitions.
- Max output token enforcement.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

---

## 4. Model availability and error handling

<a id="MODEL-ERRORS"></a>

### 4.1 Availability check

A model is **available** if its provider is registered, authenticated, and reachable. Model availability is checked:
- At app startup (provider discovery).
- On explicit user action ("Refresh models").
- Before each run (fast check: provider auth state).

### 4.2 Overflow detection

Context overflow errors are detected via provider-specific error message patterns. When an overflow is detected:
1. The run is paused.
2. If auto-compaction is enabled, compaction triggers and the run retries with reduced context.
3. If compaction is not available or fails, the error is surfaced to the user.

### 4.3 Retryable errors

Provider-specific retryable errors (rate limits, transient failures) trigger automatic retry with exponential backoff. The retry policy is configurable via `config.provider.<provider_id>.max_retries` (default 3) and `config.provider.<provider_id>.retry_delay_ms` (default 1000).

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md

---

## 5. Per-Persona model overrides

<a id="PERSONA-MODEL-OVERRIDES"></a>

A Persona MAY specify a preferred model via a `default_model` field in the PERSONA.md frontmatter (future extension to `Plans/Personas.md` §3.1):

```yaml
---
id: "rust-engineer"
name: "Rust Engineer"
description: "Expert Rust developer."
default_model: "anthropic/claude-sonnet-4"
---
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `default_model` | Optional | `string` or `null` | Model identifier in `provider_id/model_id` format. `null` or absent means inherit from selection priority (§2). |

Rule: The Persona's `default_model` is priority 2 in the selection chain (§2). It is overridden by explicit run-envelope or tier-config model settings (priority 1) but overrides variant selection, config defaults, last used, and internal defaults.

Rule: If the Persona specifies a `default_model` that is not available (provider not registered or model not found), the system logs a warning and falls through to the next priority level. The run is NOT blocked.

ContractRef: ContractName:Plans/Personas.md#PERSONA-SCHEMA, PolicyRule:Decision_Policy.md§2

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

Model selection and variant management surfaces exist in multiple locations.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md

### 7.1 Model picker (Chat panel)

The Chat panel (`Plans/FinalGUISpec.md` §7.16) MUST include a **model picker** dropdown:

1. **Current model display:** Show the active model as `provider/model` (truncated if needed) in the Chat input toolbar.
2. **Dropdown:** Lists all available models grouped by provider. Each entry: model name, provider badge, capability indicators (context window size, vision support).
3. **Variant quick-switch:** Below the model list, show enabled variants as labeled buttons or a sub-section. Clicking a variant sets the model to the variant's target.
4. **Search:** Filter models by name (substring, case-insensitive).
5. **Selection behavior:** Selecting a model sets it as the active model for the current session (priority 1 override). Selecting a variant sets the variant (priority 3).

### 7.2 Models tab (Settings)

A dedicated **Models** tab in Settings MUST provide:

1. **Provider list:** Collapsible cards per registered provider. Each card shows: provider name, auth status badge, model count, expand to show models.

2. **Per-model options:** Expanding a model row shows editable fields for `max_output_tokens`, `temperature`, `top_p`, `reasoning_effort` (where supported). "Reset to defaults" per field.

3. **Model priority list:** An ordered list editor for `config.model_priority` (drag to reorder, add/remove entries). Shows the effective resolution order.

4. **Default model:** Dropdown to set `config.model` (the priority-4 default). Shows current effective model with source label (e.g., "From config", "Last used", "Internal default").

### 7.3 Variant picker (Settings > Models)

Within the Models tab:

1. **Variant list:** Table of all variants (built-in + custom). Columns: Name, Model, Description, Status (enabled/disabled/unavailable).
2. **Enable/disable toggle:** Per-variant toggle. Disabled variants hidden from Chat picker.
3. **Add custom variant:** "Add variant" button with fields: name, model (dropdown from available models), description.
4. **Edit/Remove:** Edit and remove buttons for custom variants. Built-in variants can only be disabled.
5. **Default variant:** Dropdown to set `config.default_variant` (persisted across sessions).

### 7.4 Per-Persona model override editor (Settings > Advanced > Personas)

When editing a Persona in the Personas management card (`Plans/Personas.md` §4):

1. **`default_model` field:** Dropdown populated from available models. Shows `provider_id/model_id`. Option for "Inherit (no override)" which sets `null`.
2. **`default_variant` field:** Dropdown populated from enabled variants. Option for "Inherit (no override)".

These fields are stored in the PERSONA.md frontmatter and applied at priority 2 (model) or as variant pre-selection (§6.6).

### 7.5 ELI5/Expert copy

Model UI elements follow the app-level Interaction Mode (Expert/ELI5) toggle per `Plans/FinalGUISpec.md` §7.4.0. Tooltip keys: `tooltip.models.*` prefix.

- **ELI5:** Chat model picker shows only model names (no provider prefix). Settings Models tab shows only default model dropdown and variant enable/disable. Per-model options hidden.
- **Expert:** Full view with all sections visible.

---

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
