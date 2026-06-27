# Shard 008: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Models_System.md`

Source lines: L283-L520

Source SHA256: `5cfd469a6ae1233eb1feb0d342999fea028a1a48a1a00f4d609348dc3af40825`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical model/provider registry requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### MS-113 - Provider-Owned Model Catalog And Evidence States

```yaml
plan_unit_id: MS-113
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  The model registry is provider-owned: PM stores concrete Provider -> models rows by runtime/account/billing/transport route, then optionally groups rows by provider family for display. The same upstream model may appear under multiple providers, and each row must carry support_state, verification_state, media_input, media_output, generated_media_routes, account_profile requirements, requested/effective provider/model/effort fields, and source_lineage. Public Antigravity `agy` rows must be stored as explicit model rows for `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (High)`, `Gemini 3.5 Flash (Low)`, `Gemini 3.1 Pro (Low)`, `Gemini 3.1 Pro (High)`, `Claude Sonnet 4.6 (Thinking)`, `Claude Opus 4.6 (Thinking)`, and `GPT-OSS 120B (Medium)` with text output, image input, PDF input, generated image, generated video, generated audio/TTS, music, artifact output, effort label, verification state, and source provenance fields; generated-media flags stay false unless row-specific artifact proof exists. Antigravity OAuth/internal `gemini-3.1-flash-image` is a separate capability-gated generated-image route, not a public `agy` CLI model row and not Gemini Direct. Catalog presence, OpenCode server routing, Models.dev visibility, or OpenCode Go availability is not end-to-end proof for PM-baked direct providers.
gui_related: false
gui_classification_reason: Backend provider/model registry and evidence semantics rather than visual presentation.
depends_on: [CV-094]
unblocks: [MA-062, F3-400, MGAC-094, UF-074]
acceptance_criteria:
  - Provider rows are keyed by concrete runtime/account/billing/transport route, not only vendor family.
  - Provider family grouping remains display/policy metadata and does not collapse distinct providers that offer overlapping models.
  - Every row can expose support_state, verification_state, media capability fields, account-profile requirements, requested/effective identity, and source refs.
  - Catalog presence alone cannot mark a row green or implementation-ready.
  - Public `agy` text/coding rows appear in Settings/model capability data with generated-media flags false unless exact generated-artifact proof exists.
  - Settings image-generation support rows expose OpenAI API-key `gpt-image-2`, Responses `image_generation`, mandatory OpenAI/Codex subscription-backed image generation, MiniMax `image-01`, Gemini Direct where verified, Antigravity OAuth/internal `gemini-3.1-flash-image`, and gated/disabled/unverified providers as route-specific entries rather than a Gemini-primary list.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_catalog_drift
reasoning_tier: high
context_scope: provider_model_registry
implementation_surfaces: [Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Media_Generation_and_Capabilities.md]
node_compile_hint: {mode: provider_owned_model_catalog, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0009
  - pldg-20260624-001-provider-updates:atom-0016
  - pldg-20260624-001-provider-updates:atom-0027
  - pldg-20260624-001-provider-updates:atom-0048
  - pldg-20260624-001-provider-updates:atom-0049
  - pldg-20260624-001-provider-updates:atom-0107
  - pldg-20260624-001-provider-updates:atom-0112
  - pldg-20260624-001-provider-updates:atom-0140
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
  - pldg-20260624-001-provider-updates:atom-0144
source_atom_ids: [atom-0009, atom-0016, atom-0027, atom-0035, atom-0046, atom-0048, atom-0049, atom-0050, atom-0051, atom-0059, atom-0060, atom-0071, atom-0074, atom-0091, atom-0092, atom-0098, atom-0100, atom-0101, atom-0102, atom-0103, atom-0104, atom-0105, atom-0107, atom-0109, atom-0112, atom-0117, atom-0118, atom-0119, atom-0125, atom-0126, atom-0127, atom-0128, atom-0129, atom-0130, atom-0131, atom-0132, atom-0135, atom-0138, atom-0140, atom-0142, atom-0143, atom-0144]
preserved_exact_tokens: ["Provider -> models", "Provider -> models, Provider -> models", "OpenCode", "Models.dev", "support_state", "verification_state", "media_input", "media_output", "generated_media_routes", "requested_model_profile", "effective_model_profile", "fallback_used", "capability_checks", "agy models", "Gemini 3.5 Flash (Medium)", "Gemini 3.5 Flash (High)", "Gemini 3.5 Flash (Low)", "Gemini 3.1 Pro (Low)", "Gemini 3.1 Pro (High)", "Claude Sonnet 4.6 (Thinking)", "Claude Opus 4.6 (Thinking)", "GPT-OSS 120B (Medium)", "text output", "image input", "PDF input", "generated image", "generated video", "generated audio/TTS", "music", "artifact output", "verification state", "source provenance", "gemini-3.1-flash-image", "gpt-image-2", "image_generation", "OpenAI/Codex subscription-backed image generation", "image-01"]
negative_constraints:
  - Do not collapse providers that offer the same model into one vendor-family account row.
  - Do not treat Models.dev catalog presence or OpenCode server routing as PM direct-provider E2E proof.
  - Do not keep Gemini CLI as an active provider row; preserve `gemini_cli` only as retired/source-lineage vocabulary.
  - Do not add public text-only `agy` rows to the image-generation engine picker as if they generate images.
  - Do not collapse Antigravity public `agy` CLI text/coding rows with the separate OAuth/internal `gemini-3.1-flash-image` generated-image route.
owner_hints: [Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Media_Generation_and_Capabilities.md]
```

### MS-114 - Direct Coding-Plan Provider Route Matrix

```yaml
plan_unit_id: MS-114
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Direct coding-plan providers are first-class Provider -> models routes in PM. Kimi For Coding, MiniMax Coding Plan global, Z.AI/Zhipu coding-plan routes, GitHub Copilot direct hosted API, Alibaba/Qwen Coding Plan global and CN rows, and other OpenCode/Models.dev coding-plan families must be represented as separate provider entries with route-specific base URLs, credential/profile requirements, model ids, media support, support-state, and verification-state. Rows without local end-to-end prompt proof remain disabled, capability-gated, unverified, or separate-profile rather than purchase blockers.
gui_related: false
gui_classification_reason: Backend model/provider catalog and provider-route metadata rather than visual presentation.
depends_on: [MS-113]
unblocks: [MA-062, MGAC-097, UF-075]
acceptance_criteria:
  - Kimi For Coding is green only for tested text, thinking, and image-input routes and is not marked as image generation.
  - MiniMax global coding plan is green for tested text, thinking, image input, and separate `image-01` generation; MiniMax CN remains separate/unverified with a global key.
  - Z.AI/Zhipu rows preserve standard, coding-plan, Anthropic, and Zhipu base-route distinctions and mark overload, plan-not-included, balance, and resource-package states accurately.
  - GitHub Copilot direct hosted API uses `https://api.githubcopilot.com` with `/models` and `/chat/completions`, no `/v1`, and no native image-generation route.
  - Unpurchased or unverified coding-plan families do not block compile and are not marked green.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: coding_plan_route_drift
reasoning_tier: high
context_scope: direct_coding_plan_providers
implementation_surfaces: [Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/usage-feature.md]
node_compile_hint: {mode: direct_coding_plan_provider_matrix, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0107
  - pldg-20260624-001-provider-updates:atom-0126
  - pldg-20260624-001-provider-updates:atom-0127
  - pldg-20260624-001-provider-updates:atom-0128
  - pldg-20260624-001-provider-updates:atom-0129
  - pldg-20260624-001-provider-updates:atom-0140
source_atom_ids: [atom-0107, atom-0108, atom-0109, atom-0110, atom-0111, atom-0112, atom-0124, atom-0125, atom-0126, atom-0127, atom-0128, atom-0129, atom-0131, atom-0132, atom-0135, atom-0138, atom-0140]
preserved_exact_tokens: ["Kimi For Coding", "MiniMax Coding Plan", "MiniMax CN", "Z.AI", "Zhipu", "GitHub Copilot", "Alibaba Coding Plan", "Qwen", "alibaba-coding-plan", "alibaba-coding-plan-cn", "kuae-cloud-coding-plan", "minimax-coding-plan", "minimax-cn-coding-plan", "tencent-coding-plan", "umans-ai-coding-plan", "zai-coding-plan", "zhipuai-coding-plan", "https://api.githubcopilot.com", "/models", "/chat/completions", "/v1"]
negative_constraints:
  - Do not require Jared to buy additional subscription plans to finish provider planning.
  - Do not mark untested or inaccessible coding-plan rows green from catalog presence alone.
  - Do not prepend `/v1` to GitHub Copilot direct hosted routes.
  - Do not collapse global and CN/regioned provider IDs into one credential/profile row.
owner_hints: [Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/usage-feature.md, Plans/FinalGUISpec.md]
```

### MS-115 - Provider-Specific Thinking Effort And Transform Defaults

```yaml
plan_unit_id: MS-115
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Thinking effort is a global user-selectable intent that resolves through provider/model-specific support. PM must store requested effort separately from supported variants and effective wire mapping, then disclose honored, skipped, clamped, unsupported, and partially supported outcomes. Current transforms include Claude Code print-mode thinking models, Antigravity model-specific choices, Codex/OpenAI `model_reasoning_effort`, Cursor model/route caveats, GitHub Copilot `reasoning_effort` only where the hosted model supports it, Kimi `thinking` and `reasoning_effort` with `xhigh|max -> high`, Z.AI/Zhipu preserved thinking plus GLM-5.2 `high|max`, MiniMax M3 `none|thinking`, MiniMax M2 defaults, and Alibaba/Qwen `enable_thinking` as an explicit PM-owned verification gap.
gui_related: false
gui_classification_reason: Provider/model transform and effective-wire behavior; GUI consumes the state but does not own it.
depends_on: [MS-113]
unblocks: [F3-400, ACD-424, CV-293]
acceptance_criteria:
  - Requested effort and effective provider wire value are both recorded for every provider attempt.
  - Unsupported or clamped effort requests do not silently become successful support claims.
  - OpenCode/Models.dev defaults are treated as source-lineage for PM-owned transforms, not copied adapter code.
  - Qwen/Alibaba `enable_thinking` is not assumed for coding-plan rows until PM verifies or maps it explicitly.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: effort_transform_drift
reasoning_tier: high
context_scope: provider_effort_mapping
implementation_surfaces: [Plans/Models_System.md, Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: provider_specific_effort_mapping, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0017
  - pldg-20260624-001-provider-updates:atom-0052
  - pldg-20260624-001-provider-updates:atom-0113
  - pldg-20260624-001-provider-updates:atom-0114
  - pldg-20260624-001-provider-updates:atom-0139
source_atom_ids: [atom-0017, atom-0018, atom-0052, atom-0069, atom-0086, atom-0088, atom-0089, atom-0090, atom-0106, atom-0113, atom-0114, atom-0126, atom-0127, atom-0128, atom-0129, atom-0131, atom-0139, atom-0140]
preserved_exact_tokens: ["thinking effort", "reasoning_effort", "model_reasoning_effort", "thinking", "reasoningEffort", "xhigh|max -> high", "high", "max", "none", "thinking", "enable_thinking", "clear_thinking", "reasoning_content", "temperature", "topP", "topK", "toolStreaming=false"]
negative_constraints:
  - Do not expose generic low/medium/high effort variants for provider/model rows where current evidence excludes them.
  - Do not clear Z.AI/Zhipu thinking content when preserved-thinking semantics are required.
  - Do not assume Alibaba coding-plan rows receive `enable_thinking` just because OpenCode applies it to `alibaba-cn`.
owner_hints: [Plans/Models_System.md, Plans/Contracts_V0.md, Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Plans/FinalGUISpec.md]
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

Capability checks are data-driven and must not devolve into scattered `if-else` branches. Gemini Direct and Antigravity CLI keep distinct active capability entries; retired Gemini CLI capability tokens remain compatibility/source-lineage only. Gemini `disableCache` compatibility evidence maps through `cache_control` / `cache_with_oauth` rather than a hidden provider flag.

Provider/catalog discovery remains dynamic and model-scoped. OpenCode `models.dev` and provider `/catalog` evidence may supply model-level capability metadata such as reasoning, `/tool/temperature` support, limits, modalities, and pricing; PM records this as capability data rather than hardcoding provider defaults. Selectable-unit snapshots preserve `requested_default` and `effective_capabilities` so UI defaults and runtime routing can explain which provider/model entry was requested and what capability block was actually discovered. `cursor-agent models` is live catalog evidence whose returned IDs may encode reasoning variants directly, so PM must discover those IDs instead of inferring variants from vendor name alone.

#### 3.3.2 `system_role_name` values

Role-mapping is data-driven through `system_role_name`. OpenAI reasoning surfaces use developer-role semantics by setting `system_role_name = "developer"`, and bridged-provider adapters must stay aligned with `Plans/CLI_Bridged_Providers.md` rather than inventing local role names.

| Provider family | `system_role_name` |
|---|---|
| Anthropic | `system` |
| OpenAI standard | `system` |
| OpenAI reasoning family | `developer` |
| Gemini Direct | `system` |
| Antigravity CLI | `system` |
| Gemini CLI (retired/source-lineage only) | `system` |
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
