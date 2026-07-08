# Media Generation and Capabilities (Canonical SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- MEDIA GENERATION AND CAPABILITIES SSOT

Purpose:
- Single source of truth for the capability system, media generation contract,
  natural-language slot extraction grammar, and media UI/UX behavior.
- All other plan documents must reference this document rather than restating
  media or capability rules.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope and SSOT status

This document is the **single canonical source of truth** for:
- The Puppet Master **capability system** (internal tool `capabilities.get`).
- The **media generation contract** (internal tool `media.generate`).
- The **natural-language slot extraction grammar** (deterministic parsing of user prompts into structured media-generation parameters).
- The **UI/UX behavior** for the capability picker dropdown in the composer.

All other plan documents MUST reference this document by anchor (e.g., `Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM`) rather than restating capability or media-generation rules.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### SSOT references (DRY)

- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/auth): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Built-in tools, permissions: `Plans/Tools.md`
- Model system: `Plans/Models_System.md`
- GUI specification: `Plans/FinalGUISpec.md`
- Provider facade: `Plans/CLI_Bridged_Providers.md`
- Assistant chat design: `Plans/assistant-chat-design.md`
- Interview subagent integration: `Plans/interview-subagent-integration.md`
- Provider OpenCode: `Plans/Provider_OpenCode.md`
- Architecture invariants: `Plans/Architecture_Invariants.md`

---

<a id="1"></a>
<a id="CAPABILITY-SYSTEM"></a>
## 1. Capability system

### 1.1 Internal tool: `capabilities.get`

`capabilities.get` is an internal tool that returns the full set of capabilities currently available to the running Puppet Master instance. The response includes **all** capabilities — both media capabilities and provider/tool capabilities — each annotated with enablement status, a machine-readable disabled reason (when disabled), and setup hints.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md

### 1.2 Response shape

```json
{
  "capabilities": [
    {
      "id": "media.image",
      "category": "media",
      "enabled": true,
      "disabled_reason": null,
      "setup_hint": null
    },
    {
      "id": "media.video",
      "category": "media",
      "enabled": false,
      "disabled_reason": "NOT_CONFIGURED",
      "setup_hint": "Configure an eligible media provider route in Settings -> Providers."
    }
  ]
}
```

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical media capability requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### MGAC-094 - Provider Media Route Taxonomy

```yaml
plan_unit_id: MGAC-094
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  Provider media support is route-specific and must be modeled as separate `media_input`, `media_output`, and `generated_media_routes[]` capabilities under concrete provider/model rows. PM must preserve explicit per-media support-state labels for green, disabled, capability-gated, unverified, unsupported, separate-profile, and source-lineage-only states. The media/capability matrix includes every public `agy models` row under Antigravity with explicit modality truth, even when generated image, generated video, generated audio/TTS, music, or artifact output are false. Selectable generated-media engines are a narrower subset: OpenAI API-key `gpt-image-2`, Responses `image_generation`, mandatory OpenAI/Codex subscription-backed image generation, MiniMax global `image-01`, Gemini Direct generated-image routes where verified, and the separate capability-gated Antigravity OAuth/internal `gemini-3.1-flash-image` route where locally proven. Gemini CLI removal also removes Gemini-default setup copy; Gemini Direct API remains a media-capable direct provider route where verified.
gui_related: false
gui_classification_reason: Canonical media capability schema and support-state semantics rather than visual presentation.
depends_on: [MS-113, CV-094]
unblocks: [F3-401, RAP-032, POA-050]
acceptance_criteria:
  - Media input, media output, and generated-media routes are not collapsed into one generic supports-media flag.
  - Support-state labels distinguish unsupported, unverified, disabled, capability-gated, separate-profile, and source-lineage-only rows.
  - Gemini CLI is not used as the default media setup path; Gemini Direct API may remain active.
  - Provider-family grouping does not erase account, billing, region, or route differences.
  - Public `agy` text/coding rows remain present in media/capability metadata with generated-media flags false unless row-specific artifact proof exists.
  - GUI/Settings image-generation selectors consume only actual generated-media routes rather than every broader media/capability row.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: media_capability_drift
reasoning_tier: high
context_scope: provider_media_capability_taxonomy
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: provider_media_route_taxonomy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0026
  - pldg-20260624-001-provider-updates:atom-0027
  - pldg-20260624-001-provider-updates:atom-0046
  - pldg-20260624-001-provider-updates:atom-0130
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
  - pldg-20260624-001-provider-updates:atom-0144
source_atom_ids: [atom-0026, atom-0027, atom-0028, atom-0035, atom-0037, atom-0038, atom-0039, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0048, atom-0049, atom-0074, atom-0092, atom-0098, atom-0101, atom-0105, atom-0130, atom-0138, atom-0142, atom-0143, atom-0144]
preserved_exact_tokens: ["media_input", "media_output", "generated_media_routes[]", "Gemini Direct", "Gemini CLI", "disabled", "capability-gated", "unverified", "unsupported", "separate-profile", "source-lineage", "agy models", "text output", "image input", "PDF input", "generated image", "generated video", "generated audio/TTS", "music", "artifact output", "gpt-image-2", "image_generation", "OpenAI/Codex subscription-backed image generation", "gemini-3.1-flash-image", "image-01"]
negative_constraints:
  - Do not use Gemini CLI or Gemini-default copy as the active media setup path.
  - Do not mark image input as image generation.
  - Do not flatten route-specific media state into a single provider-level boolean.
  - Do not omit public `agy` models from media/capability metadata just because they are not generated-image models.
  - Do not add public text-only `agy` rows to the image-generation engine picker as if they generate images.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/FinalGUISpec.md, Plans/usage-feature.md]
```

### MGAC-095 - OpenAI/Codex Images 2 Route Families

```yaml
plan_unit_id: MGAC-095
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  OpenAI/Codex Images 2 support is mandatory and split into separate route families: official OpenAI API-key `gpt-image-2` generation/edit, Responses API hosted `image_generation`, and OpenAI/Codex subscription-backed image generation. The subscription-backed route must be modeled as required product support with explicit auth model, credential custody, support-state, terms-risk, artifact handling, rate-limit/plan disclosure, and local end-to-end verification before runtime green status. `opencode-gpt-imagegen` is source-lineage for UX, artifact, and subscription-route lessons only, not backend canon or auth storage canon.
gui_related: false
gui_classification_reason: Media route capability and backend/auth contract; GUI consumes controls and disclosures.
depends_on: [MGAC-094, MS-113, CV-292]
unblocks: [F3-401, RAP-032, POA-050, UF-074]
acceptance_criteria:
  - OpenAI API-key image routes and OpenAI/Codex subscription-backed image routes remain separate.
  - "`gpt-image-2` endpoint-specific parameters are preserved where supported: image refs, size/custom size, quality, output format, compression, input fidelity, partial/streaming images, background, moderation, and `n`."
  - Subscription-backed support is mandatory, not optional, but cannot be marked runtime-green without E2E verification.
  - C2PA/SynthID provenance is represented as a caveat, not a complete durable guarantee.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: openai_codex_image_route_drift
reasoning_tier: high
context_scope: openai_codex_image_generation
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: openai_codex_images2_route_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0029
  - pldg-20260624-001-provider-updates:atom-0030
  - pldg-20260624-001-provider-updates:atom-0031
  - pldg-20260624-001-provider-updates:atom-0137
source_atom_ids: [atom-0029, atom-0030, atom-0031, atom-0032, atom-0033, atom-0034, atom-0038, atom-0136, atom-0137]
preserved_exact_tokens: ["OpenAI", "ChatGPT", "Codex", "ChatGPT Images 2.0", "GPT Image 2", "gpt-image-2", "image_generation", "$imagegen", "C2PA", "SynthID", "opencode-gpt-imagegen", "mandatory", "not optional"]
negative_constraints:
  - Do not treat Codex built-in image generation, ChatGPT UI image generation, OpenAI API image generation, and MCP image generation as one interchangeable backend.
  - Do not import `opencode-gpt-imagegen` backend/auth behavior as canonical PM backend support.
  - Do not overpromise transparent background, partial images, streaming, batch, or provenance behavior across endpoints that do not support it.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
```

### MGAC-096 - MiniMax Image-01 Generated-Media Route

```yaml
plan_unit_id: MGAC-096
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  MiniMax global `Image-01` is an implementation-ready generated-media provider route under the MiniMax global account/profile, separate from MiniMax CN. PM must target `https://api.minimax.io` `POST /v1/image_generation` with `model: image-01`, prompt max 1500, `aspect_ratio` or width/height, `response_format: url|base64`, seed, `n` 1-9, `prompt_optimizer`, partial success/failure counts, trace id/base response status, and 24-hour URL expiry handling. `aspect_ratio` takes precedence over width/height; width and height are 512-2048 and divisible by 8 when both are used.
gui_related: false
gui_classification_reason: Provider generated-media route contract and artifact semantics rather than visual presentation.
depends_on: [MGAC-094, MS-114]
unblocks: [F3-401, RAP-032, POA-050]
acceptance_criteria:
  - MiniMax global Image-01 appears in the generated-media provider list.
  - MiniMax CN is kept as a separate unverified credential/profile route when only a global key is tested.
  - URL outputs carry 24-hour expiry warnings and artifact capture requirements.
  - Partial success and provider status metadata are not flattened into binary success/failure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: minimax_image_route_drift
reasoning_tier: high
context_scope: minimax_generated_media
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: minimax_image01_route_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0127
  - pldg-20260624-001-provider-updates:atom-0133
  - pldg-20260624-001-provider-updates:atom-0134
source_atom_ids: [atom-0127, atom-0130, atom-0133, atom-0134, atom-0138]
preserved_exact_tokens: ["MiniMax", "Image-01", "image-01", "https://api.minimax.io", "/v1/image_generation", "aspect_ratio", "1:1", "16:9", "4:3", "3:2", "2:3", "3:4", "9:16", "21:9", "response_format", "url", "base64", "seed", "n", "prompt_optimizer", "24h", "24-hour URL expiry"]
negative_constraints:
  - Do not merge MiniMax global and MiniMax CN credential/profile routes.
  - Do not drop partial-success metadata, trace id, or base response status.
  - Do not treat URL output as durable storage without PM artifact capture or expiry disclosure.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
```

### MGAC-097 - Tested Direct-Provider Media Support Matrix

```yaml
plan_unit_id: MGAC-097
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  Tested direct-provider media support must stay scoped to observed route behavior. Kimi For Coding supports tested text/thinking/image-input and not image creation. GitHub Copilot direct hosted API supports tested chat routes and image input on supported models such as `gpt-5-mini`, but `/images/generations` is 404 and no native image generation is green. Z.AI/Zhipu supports route-specific multimodal and image APIs in documentation, but tested image-generation states include balance/resource, plan, and overload gates and must be exposed as gated where not green. Cursor API-key/SDK and composer-api-style routes have image-input proof and compatibility caveats; product-native Cursor image generation is separate. OpenCode server catalogs are source-lineage metadata, not direct-provider closure evidence.
gui_related: false
gui_classification_reason: Capability and verification matrix; GUI consumes the statuses but does not own them.
depends_on: [MGAC-094, MS-114]
unblocks: [F3-401, UF-074]
acceptance_criteria:
  - Kimi and GitHub Copilot are not advertised as native image-generation providers.
  - Z.AI/Zhipu image/media rows expose plan, balance, overload, and resource-package gates.
  - Cursor image-input proof and Worker/proxy caveats remain route-specific.
  - Direct-provider closure evidence excludes OpenCode-server-routed provider results.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: media_support_overclaim
reasoning_tier: high
context_scope: tested_provider_media_matrix
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/usage-feature.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: tested_direct_provider_media_matrix, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0126
  - pldg-20260624-001-provider-updates:atom-0128
  - pldg-20260624-001-provider-updates:atom-0129
  - pldg-20260624-001-provider-updates:atom-0131
source_atom_ids: [atom-0037, atom-0041, atom-0042, atom-0044, atom-0074, atom-0092, atom-0098, atom-0101, atom-0105, atom-0126, atom-0128, atom-0129, atom-0130, atom-0131, atom-0132, atom-0135, atom-0138]
preserved_exact_tokens: ["Kimi", "image creation", "GitHub Copilot", "/images/generations", "404", "gpt-5-mini", "Z.AI", "Zhipu", "balance/resource", "glm-5v-turbo", "Cursor", "composer-api", "OpenCode server"]
negative_constraints:
  - Do not claim native image generation for Kimi or GitHub Copilot from image-input support.
  - Do not hide Z.AI plan, balance, overload, or resource-package gates behind generic provider failure.
  - Do not use OpenCode server or OpenCode-routed providers as direct-provider closure evidence.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/FinalGUISpec.md, Plans/usage-feature.md]
```

### MGAC-098 - Antigravity Public Catalog And OAuth/Internal Image Route Split

```yaml
plan_unit_id: MGAC-098
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  Antigravity media capability planning splits public `agy` CLI catalog rows from the separate Antigravity OAuth/internal generated-image route. Current public `agy models` rows are `Gemini 3.5 Flash (Medium)`, `Gemini 3.5 Flash (High)`, `Gemini 3.5 Flash (Low)`, `Gemini 3.1 Pro (Low)`, `Gemini 3.1 Pro (High)`, `Claude Sonnet 4.6 (Thinking)`, `Claude Opus 4.6 (Thinking)`, and `GPT-OSS 120B (Medium)`; these rows must appear in media/capability metadata with text output, image input, PDF input, generated image, generated video, generated audio/TTS, music, artifact output, thinking/effort label, route, support state, verification state, and source provenance fields, with generated-media flags false until the exact row has artifact proof. Antigravity generated-image support is a distinct capability-gated OAuth/internal route proven locally only for `gemini-3.1-flash-image` through `v1internal:generateContent` using `responseModalities: ["IMAGE"]`, `imageConfig`, and `candidateCount`, producing a `1024x1024` `image/jpeg` artifact with SHA-256 `a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d`. `jkalasas/opencode-antigravity-image`, `opencode-antigravity-image`, and `opencode-antigravity-auth` are source-lineage for this unofficial/private endpoint shape, not proof that public `agy` CLI media is green.
gui_related: false
gui_classification_reason: Defines provider/media route capability truth and proof states; GUI consumes these rows but does not own them.
depends_on: [MGAC-094, MS-113, MA-062, CV-292]
unblocks: [F3-401, RAP-032, POA-050, UF-074]
acceptance_criteria:
  - Every current public `agy models` row is represented under Antigravity media/capability metadata with explicit modality fields.
  - Public `agy` rows do not appear as selectable image-generation engines unless that exact public route later has generated-artifact proof.
  - The Antigravity OAuth/internal `gemini-3.1-flash-image` route is distinct from Gemini Direct and from public `agy` CLI catalog rows.
  - "`gemini-3-pro-image`, `gemini-2.5-flash-image`, Nano Banana, Nanobanana, Imagen, and Veo remain unverified for the tested Antigravity account/project unless fresh catalog and artifact proof supersede this state."
  - Private/internal endpoint support carries capability-gated support-state, terms/risk labeling, fallback/error handling, and secret-redaction requirements.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: antigravity_media_route_overclaim
reasoning_tier: high
context_scope: antigravity_public_catalog_and_internal_image_route
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
node_compile_hint: {mode: antigravity_public_catalog_internal_image_split, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
  - pldg-20260624-001-provider-updates:atom-0144
  - Plans/ledgers/v2/pldg-20260624-001-provider-updates/source_shards/antigravity_image_generation_probe_20260626.md
  - Plans/ledgers/v2/pldg-20260624-001-provider-updates/source_shards/antigravity_agy_media_capability_rows_20260626.md
  - Plans/ledgers/v2/pldg-20260624-001-provider-updates/source_shards/gui_settings_image_generation_model_rows_20260626.md
source_atom_ids: [atom-0142, atom-0143, atom-0144]
preserved_exact_tokens: ["jkalasas/opencode-antigravity-image", "opencode-antigravity-image", "opencode-antigravity-auth", "UNOFFICIAL TOOL", "v1internal:generateContent", "v1internal:fetchAvailableModels", "responseModalities: [\"IMAGE\"]", "imageConfig", "candidateCount", "gemini-3.1-flash-image", "gemini-3-pro-image", "gemini-2.5-flash-image", "Nano Banana", "Nanobanana", "Imagen", "Veo", "PLATFORM_UNSPECIFIED", "MACOS", "INVALID_ARGUMENT", "1024x1024", "image/jpeg", "a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d", "Gemini 3.5 Flash (Medium)", "Gemini 3.5 Flash (High)", "Gemini 3.5 Flash (Low)", "Gemini 3.1 Pro (Low)", "Gemini 3.1 Pro (High)", "Claude Sonnet 4.6 (Thinking)", "Claude Opus 4.6 (Thinking)", "GPT-OSS 120B (Medium)", "text output", "image input", "PDF input", "generated image", "generated video", "generated audio/TTS", "music", "artifact output", "verification state", "source provenance"]
negative_constraints:
  - Do not mark Antigravity CLI generated-media support green from `agy --model` prompt output or from a plugin repo alone.
  - Do not present `gemini-3-pro-image` as currently verified unless a fresh catalog/proof shows it works for the account/project.
  - Do not alias Nano Banana, Nanobanana, or `gemini-2.5-flash-image` to Antigravity support without catalog presence plus generated-artifact proof.
  - Do not store OAuth tokens, refresh tokens, account identifiers, local credential paths, full HTTP payload logs, or secrets in Plans, ledgers, logs, or artifacts.
  - Do not treat unofficial/private internal endpoint behavior as stable without explicit support-state, terms/risk labeling, and fallback/error handling.
  - Do not merge Antigravity OAuth/internal generated-media support into Gemini Direct API support; keep execution/auth/billing routes distinct.
  - Do not treat the current point-in-time `agy` catalog as static; refresh catalog-backed capability rows at setup/runtime and preserve snapshot provenance.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/usage-feature.md]
```

Each entry:
- `id` (string, required): stable capability identifier.
- `category` (string, required): `"media"` or `"provider_tool"`.
- `enabled` (bool, required): whether the capability is currently usable.
- `disabled_reason` (string | null, required): one of the canonical disabled-reason values (§1.3) when `enabled` is `false`; `null` when `enabled` is `true`.
- `setup_hint` (string | null, optional): human-readable guidance for resolving the disabled state.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Contracts_V0.md

### 1.3 Canonical disabled-reason values

| Value | Meaning |
|-------|---------|
| `NOT_CONFIGURED` | Required provider configuration is missing for the resolved provider media route (for example, no eligible provider account, profile, credential, or API key). |
| `MODEL_UNAVAILABLE` | The requested or configured model is not available with the current provider account, profile, auth mode, API key, or provider setup. |
| `ADMIN_DISABLED` | The feature is explicitly disabled in Settings (Media settings). |
| `BACKEND_UNSUPPORTED` | The current backend does not support this media kind (e.g., Cursor backend for video/tts/music). |
| `RATE_LIMITED` | The capability is temporarily unavailable due to rate limiting. |
| `QUOTA_EXCEEDED` | The API quota for this capability has been exhausted. |

These values are the canonical enum; implementations MUST use exactly these strings.

ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2

### 1.4 Disabled-reason evaluation precedence

When multiple disabled causes apply to the same capability at the same time, `capabilities.get` MUST return exactly one `disabled_reason` using this deterministic precedence (highest to lowest): `BACKEND_UNSUPPORTED` → `NOT_CONFIGURED` → `RATE_LIMITED` → `QUOTA_EXCEEDED` → `ADMIN_DISABLED` → `MODEL_UNAVAILABLE`.

ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2

### 1.5 Capability categories

**Media capabilities:**

| Capability ID | Description |
|---------------|-------------|
| `media.image` | Image generation (photos, logos, illustrations, etc.) |
| `media.video` | Video generation (clips, animations, b-roll, etc.) |
| `media.tts` | Text-to-speech synthesis |
| `media.music` | Music/audio generation (songs, instrumentals, beats, etc.) |

**Provider tool capabilities:**

The `provider_tool` capability category is the umbrella bucket for all non-media tool capabilities exposed by Puppet Master, including registered provider-exposed tools (e.g., OpenCode tools) and existing internal tools (e.g., read/grep/write/task). Each is reported with the same `enabled` / `disabled_reason` / `setup_hint` shape. Tool IDs follow existing tool-registry conventions (`Plans/Tools.md`).

ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md

### 1.6 Agent invocation rule

The **Assistant** and **Interviewer** personas MUST call `capabilities.get` when the user asks about available capabilities, features, or what Puppet Master can do. When Assistant is operating in the **PRD Builder** workflow, the same requirement applies. The response is used to give the user an accurate, real-time answer about what is enabled and what is not (with reasons and setup guidance).

ContractRef: ToolID:capabilities.get, ContractName:Plans/Personas.md, ContractName:Plans/chain-wizard-flexibility.md

### 1.7 Registry snapshot and refresh semantics

`capabilities.get` is computed from the **current runtime registry snapshot** at call time. That snapshot MUST merge:
- built-in internal tools from the canonical tool registry,
- currently enabled MCP-discovered tools whose server/provider bridge is healthy for the active provider,
- provider-exposed tools surfaced through the active backend,
- media capabilities evaluated through the rules in §§1.3–1.5 and §2.4.

Capability state is therefore **runtime-derived**, not a separately persisted capability database. A Settings save, provider switch, MCP adapter refresh, or Doctor/preflight remediation invalidates the previous snapshot; the next `capabilities.get` call MUST recompute from live state and MUST NOT rely on stale cached enablement.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### 1.8 Eventing and audit behavior

`capabilities.get` uses the standard tool event pipeline from `Plans/Contracts_V0.md` / `Plans/Tools.md`; it does **not** define a separate persistent capability-state event stream. Each invocation emits the canonical tool telemetry (`tool_name = "capabilities.get"`, latency, success/failure). If settings or provider state changes alter capability availability, the change becomes visible on the **next** invocation or UI refresh rather than through a dedicated durable "capability changed" event.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

---

<a id="2"></a>
<a id="MEDIA-GENERATE"></a>
## 2. Media generation contract

### 2.1 Internal tool: `media.generate`

`media.generate` is the uniform internal tool for all media generation. It accepts a structured request envelope and returns media output or an error.

ContractRef: ToolID:media.generate, ContractName:Plans/Tools.md

### 2.2 Request envelope


```json
{
  "kind": "image",
  "prompt": "A cyberpunk cat wearing a monocle",
  "model_override": null,
  "count": 2,
  "aspect_ratio": "16:9",
  "size": 1024,
  "resolution": null,
  "duration": null,
  "format": "png",
  "voice": null,
  "bpm": null,
  "seed": null,
  "negative_prompt": null,
  "quality": "standard"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kind` | `string` | **Required** | One of: `image`, `video`, `tts`, `music`. |
| `prompt` | `string` | **Required** | The creative/content prompt after slot extraction and cleaning. |
| `model_override` | `string \| null` | Optional | Per-request model override. Does **not** change Settings. Resolved via alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. See §3.4. |
| `count` | `integer \| null` | Optional | Number of variations (default 1; clamped to safe max, default 8). |
| `aspect_ratio` | `string \| null` | Optional | e.g., `"1:1"`, `"16:9"`, `"9:16"`. |
| `size` | `integer \| null` | Optional | Image pixel size (e.g., 512, 1024, 2048). |
| `resolution` | `string \| null` | Optional | Canonical resolution token when provided (e.g., `720p`, `1080p`, `1440p`, `2160p`, `4k`, `2k`, `8k`). |
| `duration` | `float \| null` | Optional | Duration in seconds (video/music only). |
| `format` | `string \| null` | Optional | Output format (e.g., `png`, `jpg`, `mp4`, `wav`, `mp3`). |
| `voice` | `string \| null` | Optional | Voice ID or style descriptor (TTS only). |
| `bpm` | `integer \| null` | Optional | Beats per minute (music only). |
| `seed` | `integer \| null` | Optional | Deterministic seed for reproducibility. |
| `negative_prompt` | `string \| null` | Optional | Content to avoid in generation. |
| `quality` | `string \| null` | Optional | One of: `draft`, `standard`, `high`. |

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

Deterministic `size` / `resolution` normalization for the request envelope:
- If `kind=image` and `size_px` is matched, set `size` to the parsed integer and set `resolution` to `null` unless an explicit symbolic resolution token is also provided.
- If `size_k` is matched, map `2k -> 2048`, `4k -> 4096`, `8k -> 8192` into `size`; also set `resolution` to the symbolic token (`2k`, `4k`, or `8k`).
- If `kind=video` and `vres` is matched, set `resolution` to the parsed token (`720p`, `1080p`, `1440p`, `2160p`, or `4k`) and keep `size` as `null`.
- Conflict rule: for `kind=image`, `size_k`/`size_px` controls are authoritative over `vres`; for `kind=video`, `vres` is authoritative for `resolution`. Within the same keyed family, last match wins.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

### 2.3 Per-request model override (`model_override`)

The `model_override` field allows a user to specify a model for a single generation request without changing the persistent model configured in Settings. This is ephemeral — it applies only to the current `media.generate` invocation.

Resolution order for `model_override`:
1. **Alias mapping** — check registered model aliases.
2. **Exact model ID** — match against known model IDs.
3. **Exact displayName** — match against model display names (case-insensitive).
4. **Else** — return `MODEL_UNAVAILABLE` disabled reason.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID

### 2.4 Backend routing
Media routing resolves through concrete provider/model rows and their `generated_media_routes[]`, `media_input`, and `media_output` capability fields.

ContractRef: ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§2

Cursor rules:
- Cursor API-key/SDK proof is media-input/tooling evidence only unless a later owner contract proves product-native Cursor image generation.
- When a Cursor route lacks a verified generated-media route for `kind=image`, image generation is disabled or capability-gated rather than routed to a fictional Cursor-native generator.
- when the active backend is Cursor and `kind` is `video`, `tts`, or `music`, disable the capability with `disabled_reason: BACKEND_UNSUPPORTED` unless a verified Cursor route later declares that generated-media kind.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/usage-feature.md

All backends, including Gemini Direct, OpenAI/Codex, MiniMax, Z.AI/Zhipu, Cursor, Kimi, GitHub Copilot, Antigravity, and future provider rows, follow the provider/media route taxonomy. Gemini Direct is one verified media-capable route where applicable; it is not the default non-Cursor media model. Gemini CLI (`gemini_cli`), Gemini CLI media routing, and Nanobanana helper paths are retired/source-lineage only. Public Antigravity `agy` currently verifies Gemini 3.5 Flash, Gemini 3.1 Pro, Claude Sonnet 4.6, Claude Opus 4.6, and GPT-OSS 120B text/coding model routes with generated-media flags false, while a separate capability-gated Antigravity OAuth/internal route verifies `gemini-3.1-flash-image` generated image output. Public `agy` still does not verify Nano Banana/Nanobanana, `gemini-2.5-flash-image`, `gemini-3-pro-image`, Imagen, Veo, TTS, music, video, or other generated-media routes because `agy models` does not list them and unrecognized `--model` labels fall back.

Quota/usage tools and account/plan UI are route-specific rather than Gemini-default. The capability picker imports account/plan and usage labels from `Plans/Multi-Account.md` and `Plans/usage-feature.md` instead of inventing a parallel bucket.

Required routing order:
1. resolve the requested provider/runtime surface for media
2. resolve the requested/effective auth family and eligible account or profile set
3. choose the concrete runtime surface that actually supports the requested media kind
4. record the resulting requested/effective runtime snapshot

Media generation consumes the product-wide shared runtime identity model instead of defining feature-local runtime-state fields. The requested/effective runtime snapshot remains that shared model's one canonical truth for requested/effective runtime state across the product, and media routing reads it to produce less schema drift, better audit/history/debugging (`/history/debugging`), more consistent UI across chat, tools, logs, subagents, and providers, safer routing/retry/account-switch (`/retry/account-switch`) behavior, and fewer feature-local special-case fields. Media-specific records may attach media request/output details, but they must not own or create shadow fields for account, provider, retry, switch, or audit identity.

Media routing rules:
- Gemini Direct media follows the direct Gemini provider path only and is key-only/API-key-backed where verified.
- OpenAI API-key image generation uses the official OpenAI `gpt-image-2` / Responses `image_generation` routes.
- OpenAI/Codex subscription-backed image generation is mandatory as a separate first-class route with explicit auth, support-state, terms-risk, artifact, and E2E verification requirements.
- MiniMax global image generation uses the separate `https://api.minimax.io/v1/image_generation` route with `model: image-01`; MiniMax chat/coding text models do not become image-output models.
- Public Antigravity `agy` generated-media support requires `agy models` or equivalent public CLI metadata to list the media model plus an E2E generated artifact proof. Current public `agy` proof does not mark Nano Banana, Nanobanana, Imagen, Veo, TTS, music, video, or other generated-media models green through Antigravity.
- Antigravity OAuth/internal generated-image support is a separate capability-gated route currently proven only for `gemini-3.1-flash-image`; it must not be collapsed into public `agy` CLI media support or Gemini Direct API support.
- Kimi and GitHub Copilot rows may support text, media input, or reasoning effort without native generated-image support; absence of `/images/generations` proof means no image-output route is advertised.
- Z.AI/Zhipu media output is gated by route/model/account/resource state and must surface overload, plan-not-included, balance/resource, or unverified states rather than becoming a Gemini fallback.
- Gemini CLI media, Nanobanana installation, `NANOBANANA_API_KEY`, extension version disclosure, and Gemini CLI family-pooling switches are retired/source-lineage only and must not be implemented as active media routes.
- Media profile overlay policy keeps auth `/session/account` state isolated per account. Settings `/plugins/MCP/extensions` may be isolated or PM-managed shared assets only when provider capability and risk review support sharing; the default is conservative isolation.
- Media-impact reconciliation follows the final three-bucket `CHANGE` register: this document owns media-capability changes while consuming account, runtime, usage, model, and GUI owner changes from the provider/account specs.
- Provider-side model routing for active media providers must be constrained or surfaced through requested/effective model disclosure; Gemini CLI `general.plan.modelRouting` wording is retired/source-lineage only.
- Media usage accounting consumes `Plans/usage-feature.md` / `/usage-feature.md`, `usage_event_ref`, and a single scope-precedence envelope rather than inventing media-local usage scope rules.
- Media audit links must not treat `.puppet-master/state/active-git-operations.json`, `/state/active-git-operations.json`, or `puppet-master/state/active-git-operations.json` as canonical audit; `storage-plan`, `puppet-master`, seglog, and `/receipts` remain the source-of-truth path for durable audit evidence.
- Media consumers of execution state follow event-sourced storage: `active-agents.json` and active-agents flat files are compatibility inputs only, while `/redb`, redb projections, and event-sourced stores own durable execution state.
- `resume_url` is a derived serialized field from the canonical route contract, not a stronger source of truth for media generation recovery or continuation.
- spot-checks against `Plans/storage-plan.md` / `/storage-plan.md` must preserve storage as the owner for receipt, usage, and runtime persistence fields consumed by media records.
- `Run_Graph_View`, `Run_Graph_View.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` consumers must not keep tier_id-centric media usage or identity pivots; `tier_id` is compatibility context, while `/runtime` and attempt/receipt-based `/receipt-based` truth own media usage joins.
- `orchestrator-subagent-integration` / `orchestrator-subagent-integration.md` selector and hook APIs consume canonical execution-unit refs for truth and smaller derived selection `/decomposition` objects for heuristics.
- Provider/account identity remains shared-runtime truth; media operational identity remains side-effect and `/target` truth. Media records may reference `/account`, but side-effect target identity must stay separate.
- Execution-core docs must retire tier-rooted structs and enum sets before downstream media, usage, and runtime consumers compensate locally instead of inheriting stable runtime truth.
- multi-project, lane-based orchestration means media records cannot assume one active `/worktree/thread` context; generated artifacts and usage joins must carry enough project, lane, worktree, thread, and request identity to disambiguate concurrent media work.
- The common envelope contract is not optional: media generation records must name request, runtime, usage, route, artifact, and recovery fields explicitly instead of relying on underspecified shared envelope prose.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md
### 2.5 Response shape

```json
{
  "success": true,
  "request_id": "req_20260301_a1b2c3d4",
  "kind": "image",
  "engine": {
    "provider_entry_id": "resolved_provider_entry_id",
    "media_route_id": "resolved_media_route_id",
    "generated_media_route_id": "resolved_generated_media_route_id"
  },
  "artifacts": [
    {
      "artifact_id": "art_0001",
      "kind": "image",
      "mime": "image/png",
      "uri": "artifact://media/req_20260301_a1b2c3d4/output_000.png",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb924...",
      "bytes": 204800,
      "meta": {
        "w": 1024,
        "h": 1024,
        "model_used": "gemini-3-pro-image-preview",
        "seed": 42,
        "generation_time_ms": 3200
      }
    }
  ],
  "usage": {
    "cost_microdollars": 3000,
    "cost_is_estimate": true,
    "input_tokens": 42,
    "output_tokens": 0,
    "media_units": 1
  },
  "error": null
}
```

Response fields:
- `request_id` (string, required): unique opaque ID for this generation request.
- `engine` (object, required): media route identity for the effective provider/model route. It includes `provider_entry_id`, `media_route_id`, and, on generated output, the matched `generated_media_route_id`; values are validated against the provider/model row's `generated_media_routes[]` and the shared requested/effective runtime snapshot rather than a fixed `gemini_api`/`cursor_native` enum.
- `artifacts[]` (array, required on success): each item contains:
  - `artifact_id` (string): unique artifact identifier.
  - `kind` (string): media kind that was generated.
  - `mime` (string): MIME type (e.g., `image/png`, `video/mp4`, `audio/wav`).
  - `uri` (string): `artifact://` path relative to `.puppet-master/artifacts/media/<request_id>/`.
  - `sha256` (string): hex-encoded SHA-256 of the artifact bytes.
  - `bytes` (integer): artifact file size in bytes.
  - `meta` (object): kind-specific metadata — `w`/`h` for images/video, `duration` for video/audio, `sample_rate` for audio, plus `model_used`, `seed`, `generation_time_ms`.
- `usage` (object, required):
  - `cost_microdollars` (`cost_microdollars: u64`): canonical persisted cost in microdollars (1 USD = 1,000,000 microdollars). This is the SSOT cost field per Architecture_Invariants.md INV-015.
  - `cost_is_estimate` (`cost_is_estimate: bool`): `true` when the cost is a provider-reported estimate rather than an authoritative actual. Media generation costs are typically estimates.
  - `input_tokens` (u64, optional): input token count if applicable.
  - `output_tokens` (u64, optional): output token count if applicable.
  - `media_units` (u64, optional): provider-specific media generation unit count.
- `error` (object | null): present on failure (see §2.6).

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md

**Deterministic artifact layout:** Generated artifacts are written to `.puppet-master/artifacts/media/<request_id>/output_000.<ext>` (zero-padded index). A `manifest.json` is co-located alongside artifacts in the same directory, containing the full `artifacts[]` array plus `request_id` and generation metadata, enabling offline re-verification. No inline `data_uri` is returned.

**Manifest contract and write ordering:** `manifest.json` MUST be a durable, self-sufficient index for the request directory and include at minimum: `schema_version`, `request_id`, `kind`, `engine`, `generated_at_utc`, `artifacts[]`, and `usage` (when available). Implementations MUST write artifact files first, compute hashes/bytes from the final bytes on disk, and only then write `manifest.json`. If the provider returns partial output and final artifact persistence fails, the call returns failure and MUST NOT leave a manifest claiming success for missing artifacts.

**Generation supersession record:** When remediation or graph generation supersedes a media attempt, the result carries old generation, new generation, invalidated path refs, new path refs, surviving `/rejoined` path refs, and resulting concern, `/promotion/recovery`, or recovery implications so overlays and blocked actions disclose the final state without diffing addenda.

ContractRef: ToolID:media.generate, SchemaID:pm.media.generate.result.v1, Primitive:ArtifactStore

**Concurrent requests:** Multiple `media.generate` calls may execute concurrently as long as each uses its own `request_id` directory. No request may append into another request's directory. Retry behavior MUST allocate a new `request_id` rather than mutating a previous manifest in place.

ContractRef: ToolID:media.generate, Primitive:ArtifactStore

**Route-specific backend behavior:** When the response `engine` identity resolves through the shared requested/effective runtime snapshot to a concrete `provider_entry_id` and `media_route_id`, PM checks that route's `generated_media_routes[]` for the requested `kind`. Cursor image generation is not assumed from image-input/API-key proof; it requires a verified generated-media route. For unsupported kinds, the backend returns `error.code = "BACKEND_UNSUPPORTED"` or the more specific provider status/error state.

On failure:
```json
{
  "success": false,
  "request_id": "req_20260301_a1b2c3d4",
  "kind": "image",
  "engine": {
    "provider_entry_id": "resolved_provider_entry_id",
    "media_route_id": "resolved_media_route_id",
    "generated_media_route_id": null
  },
  "artifacts": [],
  "usage": null,
  "error": {
    "code": "NOT_CONFIGURED",
    "message": "This feature requires an eligible media generation provider route. Configure a supported provider in Settings -> Providers, then try again."
  }
}
```

### 2.6 Stable error codes

The `error.code` field MUST be exactly one of the following canonical values:

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md

| Code | When |
|------|------|
| `NOT_CONFIGURED` | Required provider configuration is missing for the resolved provider media route (for example, no eligible provider account, profile, credential, or API key). |
| `MODEL_UNAVAILABLE` | Requested `model_override` could not be resolved or model is offline. |
| `RATE_LIMITED` | Provider returned a rate-limit / 429. |
| `QUOTA_EXCEEDED` | Provider quota exhausted. |
| `BACKEND_UNSUPPORTED` | Active backend does not support the requested `kind`. |
| `ADMIN_DISABLED` | Capability disabled in Settings > Media. |
| `INVALID_REQUEST` | Request envelope failed local validation (missing `kind`, bad `count`, etc.). |
| `PROVIDER_ERROR` | Provider accepted the request but generation failed (safety filter, timeout, upstream error). |
| `INTERNAL_ERROR` | Unexpected internal failure not attributable to provider or configuration. |

These nine codes are stable across versions. Implementations MUST NOT invent ad-hoc code strings.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

---

<a id="3"></a>
<a id="SLOT-EXTRACTION"></a>
## 3. Natural-language slot extraction grammar

This section defines the deterministic, regex-based mini grammar for extracting structured parameters from user natural-language prompts. The extraction pipeline runs before `media.generate` is called and produces the request envelope fields (§2.2).

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

### 3.1 Pre-processing

- Keep `raw` (original user text) and `s_lower` (normalized lowercased copy).
- If a trailing controls block exists (the prompt ends with `(...)` or `[...]` and the block contains at least one control token), split `body` + `controls` and parse controls first; remove the block from the prompt before creative-prompt cleaning.
- If the trailing block contains unmatched delimiters, control keys with empty values, or unsupported control names, ignore the malformed control token rather than failing the full request. The cleaned creative prompt still proceeds through deterministic extraction.

Controls-block regex:
```
(?is)^(?P<body>.*?)(?:\s*(?P<bracket>\(|\[)\s*(?P<controls>[^)\]]{1,400})\s*(?:\)|\])\s*)$
```

Control token gate (at least one must match inside the captured controls):
```
\b(model|aspect|ratio|size|resolution|duration|voice|format|bpm|seed|negative|quality)\b
```

### 3.2 Kind detection

- **Prefix form** (highest priority):
  ```
  (?is)^\s*(?P<prefix>image|video|tts|music)\s*:\s*
  ```
- **Keyword-based** (if no prefix match):
  - `image`: `\b(image|picture|photo|logo|poster|thumbnail|cover)\b`
  - `video`: `\b(video|clip|animation|broll|b-roll)\b`
  - `tts`: `\b(tts|text to speech|read aloud|say this|voiceover|voice-over)\b`
  - `music`: `\b(music|song|beat|instrumental|soundtrack)\b`
- **Verb fallback** — only if the above are unambiguous (single kind match).

### 3.3 Deterministic precedence

Controls-block key/values override everything. Then, in order:

1. `model_override`
2. `count`
3. `aspect_ratio`
4. `size` / `resolution`
5. `duration`
6. `format`
7. `voice` / `style`
8. `quality`
9. `seed`
10. `bpm`
11. `negative_prompt`

### 3.4 `model_override` extraction

Keyword form:
```
(?is)\b(?:using|with|via|use|model)\s*(?:[:=]\s*)?(?P<model>@?[a-z0-9][a-z0-9._/\-\s]{0,80}?)(?=(?:\s*(?:,|;|\)|\]|\.$|$))|\s+\b(?:for|aspect|ratio|size|resolution|format|voice|duration|negative|quality|seed|bpm|variations?|versions?|options?)\b)
```
(?i)(?<!\w)@(?P<model2>[a-z0-9][a-z0-9._/\-]{1,64})(?!\w)
```

**Normalize model key:** lowercase; collapse spaces, underscores, and hyphens.

**Resolution order:** alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`.

**Canonical media model aliases** (e.g., "Nano Banana", "Nano Banana Pro", "Veo fast", "TTS flash", "TTS pro") are defined in `Plans/Models_System.md` [§6.8](Plans/Models_System.md#MEDIA-ALIASES) (SSOT). Do not restate the alias table here.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID, ContractName:Plans/Models_System.md#MEDIA-ALIASES

### 3.5 `count` extraction

Digits form:
```
(?i)\b(?:(?:make|generate|create|give me|output|render)\s+)?(?P<count>\d{1,2})\s*(?:x\s*)?(?:variations?|versions?|options?|images?|pics?|pictures?|clips?|frames?)\b
```

Optional word forms (one through ten) follow the same pattern. Clamp to safe max (default 8). Last match wins.

### 3.6 `aspect_ratio` extraction

Numeric:
```
(?i)\b(?P<ar_w>\d{1,2})\s*:\s*(?P<ar_h>\d{1,2})\b
```

Named:
```
(?i)\b(?P<ar_named>square|portrait|landscape|vertical|horizontal|widescreen)\b
```

Mapping: `square` = `1:1`; `portrait` / `vertical` = `9:16`; `landscape` / `horizontal` / `widescreen` = `16:9`.

### 3.7 `size` / `resolution` extraction

Image keyworded:
```
(?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_px>512|768|1024|1152|1280|1536|2048|3072|4096)\s*(?:px|pixels)?\b
```

Image keyworded (k-form):
```
(?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_k>2k|4k|8k)\b
```

Video resolution:
```
(?i)\b(?P<vres>720p|1080p|1440p|2160p|4k)\b
```

Bare numbers are **not** treated as size unless they appear in a controls block or trailing comma controls.

Deterministic assignment to envelope fields:
- `size_px` populates `size`.
- `size_k` populates `size` using `2k -> 2048`, `4k -> 4096`, `8k -> 8192`, and also populates `resolution` with the symbolic token.
- `vres` populates `resolution` for `kind=video`; for `kind=image`, bare `vres` matches in creative prose are ignored unless provided in a keyed controls context.
- If both `size_k` and `vres` are present in an image request, `size_k` is authoritative and `resolution` remains the symbolic `size_k` token.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

### 3.8 `duration` extraction (video/music only)

Keyworded:
```
(?i)\b(?:for|duration|length)\s*(?P<secs>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b
```

Bare (only in controls block or trailing controls):
```
(?i)\b(?P<secs2>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs)\b
```

### 3.9 `format` extraction

```
(?i)\b(?:format|output|export|as)\s*[:=]?\s*(?P<fmt>png|jpg|jpeg|webp|gif|mp4|mov|wav|mp3|flac|pcm16)\b
```

### 3.10 `voice` extraction (TTS)

Voice ID:
```
(?i)\bvoice\s*[:=]\s*(?P<voice>[a-z0-9][a-z0-9 _\-]{0,32})\b
```

Voice style:
```
(?i)\bin\s+a[n]?\s+(?P<voice_style>[^,.;]{1,40})\s+voice\b
```

### 3.11 `quality` extraction

```
(?i)\b(?P<qual>draft|standard|high)\b
```

Optional phrase mapping (e.g., "quick draft" → `draft`, "high quality" → `high`).

Deterministic guard: bare lexical matches from the regex above are candidate tokens only. `quality` MUST be set only when the match is in a controls block or a quality-keyword phrase (`quality: high`, `quality=standard`, `high quality`, `draft quality`); plain descriptive adjectives in the creative prompt MUST NOT set `quality`.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

### 3.12 `seed` extraction

```
(?i)\bseed\s*[:=]?\s*(?P<seed>\d{1,10})\b
```

### 3.13 `bpm` extraction

```
(?i)\b(?P<bpm>\d{2,3})\s*bpm\b|\bbpm\s*[:=]\s*(?P<bpm2>\d{2,3})\b
```

### 3.14 `negative_prompt` extraction

Explicit:
```
(?is)\bnegative\s+prompt\s*[:=]\s*(?P<neg>"[^"]{1,200}"|'[^']{1,200}'|[^,;\n]{1,200})
```

Avoid-clauses (collect all):
```
(?is)\b(?:without|no|avoid)\s+(?P<avoid>[^,.;\n]{1,80})
```

Combine explicit + avoid list (dedupe, preserve order).

### 3.15 Prompt cleaning

- If a controls block is present: remove it from the creative prompt.
- Remove only matched spans introduced by control keywords (`using`, `model`, `size`, `aspect`, `ratio`, `resolution`, `format`, `voice`, `duration`, `negative`, `quality`, `seed`, `bpm`).
- Preserve remaining text as the creative prompt.

---

<a id="4"></a>
<a id="CAPABILITY-PICKER"></a>
## 4. UI/UX behavior: capability picker dropdown

### 4.1 Composer dropdown

The composer area includes a capability picker dropdown showing the four media capabilities:

| Item | Capability ID |
|------|---------------|
| Image | `media.image` |
| Video | `media.video` |
| TTS | `media.tts` |
| Music | `media.music` |

ContractRef: ToolID:capabilities.get, ContractName:Plans/FinalGUISpec.md

### 4.2 Disabled item presentation

Disabled capabilities are **visible** in the dropdown but rendered **greyed out**. A tooltip on hover shows the human-readable reason for the disabled state (using the copy strings from §5).

Disabled rows remain keyboard-focusable so the same reason text is available on hover **and** focus. The dropdown uses standard listbox semantics (`role=listbox` / `role=option` or framework equivalent), and the disabled reason must be exposed to assistive technologies via the tooltip/description channel rather than color alone.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

### 4.3 Banner/footnote
When visible media capabilities are disabled because no eligible media generation provider route is configured for the resolved request/policy, the dropdown footer displays this banner/footnote:

> **"Configure a media generation provider in Settings -> Providers."** Add a supported route such as OpenAI/Codex, OpenAI API key, MiniMax Image-01, Antigravity internal image generation where available, or Gemini Direct where available.

Provider-specific helper links may point to the relevant dashboard or API-key page, but the surrounding copy MUST NOT imply Gemini is the default or only valid media source.

ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/rewrite-tie-in-memo.md

When multiple visible capabilities are disabled for the same missing-configuration reason, show the footer banner once and keep it pinned at the bottom of the dropdown while the list scrolls. The banner is supplemental guidance; per-item disabled reasons remain visible on hover/focus.

ContractRef: ToolID:capabilities.get, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md
### 4.4 Cursor backend behavior
When the active backend is Cursor:
- image generation is enabled only if the Cursor route declares a verified generated-media route for image output
- image input/tooling evidence alone does not prove generated-image support
- video, TTS, and music remain disabled with `disabled_reason: BACKEND_UNSUPPORTED` unless Cursor later declares verified generated-media routes
- Cursor does not create a separate Gemini account model
- non-Cursor media follows the provider/model `generated_media_routes[]` taxonomy described in `### 2.4 Backend routing`

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md
### 4.5 Click behavior

Clicking an **enabled** capability item inserts a pre-authored assistant prompt into the chat composer. The prompt guides the user to describe their generation request with relevant parameters. See §5 for the exact prompt strings per capability.

### 4.6 Per-message model override example

A user may specify a per-message model override inline in their prompt. For example:

> "Generate an image of a sunset over mountains using Nano Banana Pro"

This triggers the `model_override` slot extraction (§3.4). The model `Nano Banana Pro` is resolved via alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. The override applies only to this single generation request and does not change the model configured in Settings.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID

### 4.7 Runtime refresh behavior

The capability picker refreshes after Settings or provider-state changes that affect capability evaluation (for example, adding an OpenAI/Codex subscription-backed route, saving an OpenAI API key, enabling MiniMax Image-01, enabling Antigravity OAuth/internal `gemini-3.1-flash-image`, saving a Gemini Direct API key, toggling a media capability off, switching providers, or recovering an MCP/provider bridge). Refresh MUST preserve composer text already typed by the user; only the picker contents and footer/banner state are recalculated.

ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md

---

<a id="5"></a>
<a id="UI-COPY"></a>
## 5. UI copy strings
The following strings are the canonical verbatim copy for media UI surfaces.

### 5.1 Capability click prompts

**Image click prompt:**
> "What image are we generating? Describe the subject, style, and optionally aspect ratio (1:1, 16:9), size (1024, 2048), and how many variations you want."

**Video click prompt:**
> "What video are we generating? Describe the scene, camera/style, duration, and aspect ratio/resolution if you have a preference."

**TTS click prompt:**
> "What text should I speak, and what voice/style should it use? You can also choose output format (WAV/MP3) if available."

**Music click prompt:**
> "What music are we generating? Share genre, mood, tempo (BPM), and duration. If you want, mention instruments or references."

ContractRef: ToolID:capabilities.get, Invariant:INV-003

### 5.2 Disabled-reason messages

**Not configured reason (`NOT_CONFIGURED`):**
> "This feature requires an eligible media generation provider route. Configure a supported provider account, profile, credential, or API key in Settings -> Providers, then try again."

ContractRef: ToolID:capabilities.get, ContractName:Plans/rewrite-tie-in-memo.md

**Model unavailable reason (`MODEL_UNAVAILABLE`):**
> "That model isn't available with the current provider account, profile, auth mode, API key, or media route (or it isn't enabled). Pick a different model in Settings, or ask 'What models are available?'"

ContractRef: ToolID:capabilities.get, ContractName:Plans/Models_System.md#MODEL-ID

**Admin disabled reason (`ADMIN_DISABLED`):**
> "This feature is disabled in Settings. Enable it under Media settings, then try again."

ContractRef: ToolID:capabilities.get, Invariant:INV-003

**Backend unsupported reason (`BACKEND_UNSUPPORTED`):**
> "The current backend supports Image Generation only. To use Video/TTS/Music, use a non-Cursor backend with an eligible Gemini account, auth mode, or API key for media generation."

ContractRef: ToolID:capabilities.get, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md

**Rate limited reason (`RATE_LIMITED`):**
> "This feature is temporarily rate-limited. Wait a moment and try again."

ContractRef: ToolID:capabilities.get, Invariant:INV-003

**Quota exceeded reason (`QUOTA_EXCEEDED`):**
> "API quota for this feature has been exhausted. Check your provider usage dashboard or wait for quota to reset."

ContractRef: ToolID:capabilities.get, Invariant:INV-003
## 6. Acceptance criteria
These criteria are testable assertions that MUST hold for any conforming implementation.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Progression_Gates.md

<a id="AC-MED01"></a>
**AC-MED01:** `capabilities.get` MUST return all media capabilities (`media.image`, `media.video`, `media.tts`, `media.music`) and all registered provider-tool capabilities, each with `enabled`, `disabled_reason`, and `setup_hint` fields.

ContractRef: ToolID:capabilities.get

<a id="AC-MED02"></a>
**AC-MED02:** `disabled_reason` values MUST be exactly one of the six canonical values defined in §1.3. No ad-hoc reason strings are permitted.

ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2

<a id="AC-MED03"></a>
**AC-MED03:** When the active backend is Cursor and no verified Cursor generated-media route is configured, `media.image`, `media.video`, `media.tts`, and `media.music` MUST be disabled with `BACKEND_UNSUPPORTED` or a route-specific unavailable state. Cursor image-input/API-key proof alone MUST NOT enable generated-image output.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md

<a id="AC-MED03A"></a>
**AC-MED03A:** When the active backend is Cursor and another provider such as Gemini Direct is configured, Cursor media capabilities still depend on Cursor's own verified generated-media route. Other providers do not turn Cursor into a generated-media backend; requested/effective routing must show any switch to the provider that actually generated media.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Multi-Account.md

<a id="AC-MED04"></a>
**AC-MED04:** When the active backend is non-Cursor and at least one eligible provider/model `generated_media_routes[]` entry exists for the resolved request/policy, only the media kinds declared by that route are eligible for enablement, **subject to**: (a) the per-capability Settings > Media toggle (if toggled OFF -> `ADMIN_DISABLED`), and (b) the underlying model/route being available for that kind (if unavailable -> `MODEL_UNAVAILABLE` or the provider-specific disabled state). An eligible account alone does NOT guarantee all media kinds are enabled.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Multi-Account.md

<a id="AC-MED05"></a>
**AC-MED05:** When the active backend is non-Cursor and no eligible provider/model generated-media route exists for the resolved request/policy, generated-media capabilities MUST be disabled with `NOT_CONFIGURED`, `UNSUPPORTED`, `CAPABILITY_GATED`, or the more specific route/account state.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

<a id="AC-MED06"></a>
**AC-MED06:** The `model_override` field in `media.generate` MUST resolve via alias -> exact model id -> exact displayName -> else `MODEL_UNAVAILABLE`. The override MUST NOT change the persistent model in Settings.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID

<a id="AC-MED07"></a>
**AC-MED07:** The capability picker dropdown MUST display disabled capabilities as greyed-out items with a tooltip showing the appropriate disabled-reason message from §5.2.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED08"></a>
**AC-MED08:** Clicking an enabled capability in the picker MUST insert the corresponding verbatim prompt from §5.1 into the chat composer.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED09"></a>
**AC-MED09:** The Assistant and Interviewer MUST call `capabilities.get` when the user asks about capabilities or features. When Assistant is operating in the PRD Builder workflow, the same requirement applies.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Personas.md, ContractName:Plans/chain-wizard-flexibility.md

<a id="AC-MED10"></a>
**AC-MED10:** All media-generation and capability references across plan documents MUST reference `Plans/Media_Generation_and_Capabilities.md` anchors rather than restating rules (DRY).

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

<a id="AC-MED11"></a>
**AC-MED11:** When a capability is otherwise available but its Settings > Media toggle is OFF, `capabilities.get` MUST return that capability as disabled with `ADMIN_DISABLED`.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED12"></a>
**AC-MED12:** When both an infrastructure-disabled condition (`BACKEND_UNSUPPORTED`, `NOT_CONFIGURED`, `RATE_LIMITED`, or `QUOTA_EXCEEDED`) and an admin-toggle disable are simultaneously true, `capabilities.get` MUST return the infrastructure-disabled reason based on the precedence in §1.4 (not `ADMIN_DISABLED`).

ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2

<a id="AC-MED13"></a>
**AC-MED13:** When the active backend is non-Cursor, `media.generate` MUST use standard requested/effective provider/account/route auth resolution. Explicit `oauth`, explicit `api_key`, and explicit provider-route requests MUST NOT silently cross-fallback to another auth surface or provider route.

**AC-MED13A:** Media availability, usage/quota disclosure, and account/plan UI are route-dependent. Gemini Direct is key-only/API-key-backed where verified; Gemini CLI OAuth, API-key, Google/Vertex rows, and Nanobanana are retired/source-lineage only. UI MUST NOT collapse provider/media routes into one stale-canon mixed-account bucket.

ContractRef: ToolID:media.generate, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

<a id="AC-MED14"></a>
**AC-MED14:** `media.generate` MUST write generated artifacts to `.puppet-master/artifacts/media/<request_id>/output_000.<ext>` and co-locate a `manifest.json` in the same directory. Each artifact entry MUST include `artifact_id`, `kind`, `mime`, `artifact://` URI, `sha256`, `bytes`, and `meta`. No inline `data_uri` field is permitted in the response.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

<a id="AC-MED15"></a>
**AC-MED15:** `error.code` values in `media.generate` failure responses MUST be exactly one of the nine canonical stable error codes defined in §2.6. No ad-hoc error code strings are permitted.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

<a id="AC-MED16"></a>
**AC-MED16:** `capabilities.get` MUST evaluate provider-tool capabilities from the current runtime registry snapshot at call time, including built-ins, enabled MCP-discovered tools, and provider-exposed tools for the active backend. Tools hidden because an MCP server/provider bridge is unhealthy MUST be omitted or marked disabled based on the current snapshot; stale cached enablement MUST NOT be returned after Settings/provider changes.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md

<a id="AC-MED17"></a>
**AC-MED17:** Successful `media.generate` calls MUST write artifact files before `manifest.json`, and `manifest.json` MUST include at least `schema_version`, `request_id`, `kind`, `engine`, `generated_at_utc`, `artifacts[]`, and `usage` (when available). A failed or partial request MUST NOT leave behind a manifest that claims artifacts that were not durably written.

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2

<a id="AC-MED18"></a>
**AC-MED18:** The capability picker MUST support keyboard navigation for disabled items, expose disabled-reason text to assistive technology, keep the missing-configuration footer pinned when applicable, and refresh after capability-affecting Settings/provider changes without clearing existing composer text.

ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md
## Appendix A. Slot extraction rules (regex-ish, deterministic)

1) Pre-processing:
- Keep raw (original) and s_lower (normalized lowercased).
- If trailing controls block exists (ends with (...) or [...] and contains control tokens), split body + controls and parse controls first; remove block from prompt.
Controls-block regex: (?is)^(?P<body>.*?)(?:\s*(?P<bracket>\(|\[)\s*(?P<controls>[^)\]]{1,400})\s*(?:\)|\])\s*)$
Control token gate: \b(model|aspect|ratio|size|resolution|duration|voice|format|bpm|seed|negative|quality)\b
2) kind detection:
- Prefix form: (?is)^\s*(?P<prefix>image|video|tts|music)\s*:\s*
- Else keyword-based:
image: \b(image|picture|photo|logo|poster|thumbnail|cover)\b
video: \b(video|clip|animation|broll|b-roll)\b
tts: \b(tts|text to speech|read aloud|say this|voiceover|voice-over)\b
music: \b(music|song|beat|instrumental|soundtrack)\b
- Else verb fallback only if unambiguous.
3) Precedence: controls block key/values override everything then: model_override, count, aspect_ratio, size/resolution, duration, format, voice/style, quality, seed, bpm, negative_prompt
4) model_override:
Keyword form: (?is)\b(?:using|with|via|use|model)\s*(?:[:=]\s*)?(?P<model>@?[a-z0-9][a-z0-9._/\-\s]{0,80}?)(?=(?:\s*(?:,|;|\)|\]|\.$|$))|\s+\b(?:for|aspect|ratio|size|resolution|format|voice|duration|negative|quality|seed|bpm|variations?|versions?|options?)\b)
@ shorthand: (?i)(?<!\w)@(?P<model2>[a-z0-9][a-z0-9._/\-]{1,64})(?!\w)
Normalize model key: lowercase; collapse spaces/underscores/hyphens.
Resolve: alias -> exact model id -> exact displayName -> else MODEL_UNAVAILABLE.
5) count:
digits: (?i)\b(?:(?:make|generate|create|give me|output|render)\s+)?(?P<count>\d{1,2})\s*(?:x\s*)?(?:variations?|versions?|options?|images?|pics?|pictures?|clips?|frames?)\b
optional words one-ten similar.
Clamp to safe max (default 8). Last match wins.
6) aspect_ratio:
numeric: (?i)\b(?P<ar_w>\d{1,2})\s*:\s*(?P<ar_h>\d{1,2})\b
named: (?i)\b(?P<ar_named>square|portrait|landscape|vertical|horizontal|widescreen)\b
Mapping: square=1:1; portrait/vertical=9:16; landscape/horizontal/widescreen=16:9.
7) size/resolution:
Image keyworded: (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_px>512|768|1024|1152|1280|1536|2048|3072|4096)\s*(?:px|pixels)?\b
Image keyworded k: (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_k>2k|4k|8k)\b
Video: (?i)\b(?P<vres>720p|1080p|1440p|2160p|4k)\b
Do not treat bare numbers as size unless they are in controls block or trailing comma controls.
Envelope mapping: size_px -> size; size_k -> size (2k=2048,4k=4096,8k=8192) plus resolution token; vres -> resolution for video and MUST NOT override size_k-derived resolution for image prompts.
ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2
8) duration (video/music only):
keyworded: (?i)\b(?:for|duration|length)\s*(?P<secs>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b
bare (only in controls block or trailing controls): (?i)\b(?P<secs2>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs)\b
9) format: (?i)\b(?:format|output|export|as)\s*[:=]?\s*(?P<fmt>png|jpg|jpeg|webp|gif|mp4|mov|wav|mp3|flac|pcm16)\b
10) voice (tts):
voice id: (?i)\bvoice\s*[:=]\s*(?P<voice>[a-z0-9][a-z0-9 _\-]{0,32})\b
voice style: (?i)\bin\s+a[n]?\s+(?P<voice_style>[^,.;]{1,40})\s+voice\b
11) quality: (?i)\b(?P<qual>draft|standard|high)\b optional phrase mapping. Guard: set only when in controls block or quality-keyword phrase; bare descriptive adjectives in creative prompt MUST NOT set quality.
ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2
12) seed: (?i)\bseed\s*[:=]?\s*(?P<seed>\d{1,10})\b
13) bpm: (?i)\b(?P<bpm>\d{2,3})\s*bpm\b|\bbpm\s*[:=]\s*(?P<bpm2>\d{2,3})\b
14) negative_prompt:
explicit: (?is)\bnegative\s+prompt\s*[:=]\s*(?P<neg>"[^"]{1,200}"|'[^']{1,200}'|[^,;\n]{1,200})
avoid-clauses (collect all): (?is)\b(?:without|no|avoid)\s+(?P<avoid>[^,.;\n]{1,80})
Combine explicit + avoid list (dedupe preserve order).
15) prompt cleaning:
- If controls block present: remove it.
- Remove only matched spans introduced by control keywords (using/model/size/aspect/etc).
- Preserve remaining text as the creative prompt.

---

## References

- `Plans/DRY_Rules.md` — DRY + ContractRef governance
- `Plans/Contracts_V0.md` — canonical contracts (events, tools, UICommand, auth)
- `Plans/Tools.md` — built-in tools, permissions
- `Plans/Models_System.md` — model selection and override
- `Plans/CLI_Bridged_Providers.md` — provider facade and backend routing
- `Plans/FinalGUISpec.md` — GUI specification
- `Plans/Personas.md` — persona system
- `Plans/assistant-chat-design.md` — assistant chat UX
- `Plans/Decision_Policy.md` — deterministic defaults
- `Plans/Architecture_Invariants.md` — architecture invariants
- `Plans/Progression_Gates.md` — verification gates

*Document created for planning only; no code changes.*

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Media_Generation_and_Capabilities.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### MGAC-002 - Media SSOT Purpose And Naming

```yaml
plan_unit_id: MGAC-002
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The media-generation and capabilities document is the canonical SSOT for capability behavior, media generation, natural-language slot extraction, and media UI/UX, with the platform name fixed as Puppet Master and older naming referred to only as legacy naming without quoting it.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-002 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_ssot_purpose_and_naming
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0001
preserved_exact_tokens:
- Media Generation and Capabilities (Canonical SSOT)
- PUPPET MASTER -- MEDIA GENERATION AND CAPABILITIES SSOT
- Purpose
- Single source of truth
- natural-language slot extraction grammar
- media UI/UX behavior
- ABSOLUTE NAMING RULE
- Puppet Master
- legacy naming
- do not quote it
negative_constraints:
- Older naming may be referred to only as legacy naming and must not be quoted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
```

### MGAC-003 - Media Owner Scope And DRY Anchoring

```yaml
plan_unit_id: MGAC-003
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: This document is the single canonical source for the Puppet Master capability system, media.generate contract, deterministic slot grammar, and capability picker UI/UX; other plan docs must reference anchors instead of restating rules.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-003 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_owner_scope_and_dry_anchoring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0002
preserved_exact_tokens:
- single canonical source of truth
- capability system
- capabilities.get
- media generation contract
- media.generate
- natural-language slot extraction grammar
- UI/UX behavior
- capability picker dropdown
- MUST reference this document by anchor
- Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM
negative_constraints:
- Other plan documents must reference this document by anchor rather than restating capability or media-generation rules.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### MGAC-004 - Capabilities Get Internal Tool

```yaml
plan_unit_id: MGAC-004
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: capabilities.get returns all currently available Puppet Master capabilities, including media and provider/tool capabilities, with enablement status, machine-readable disabled reasons, and setup hints.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-004 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capabilities_get_internal_tool
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0005
preserved_exact_tokens:
- capabilities.get
- internal tool
- full set of capabilities
- currently available
- all capabilities
- media capabilities
- provider/tool capabilities
- enablement status
- machine-readable disabled reason
- setup hints
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md'
```

### MGAC-005 - Capabilities Get Response Shape

```yaml
plan_unit_id: MGAC-005
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The capabilities.get response is a capabilities array whose entries carry id, category, enabled, disabled_reason, and setup_hint fields, including media.image/media.video examples and route-specific NOT_CONFIGURED setup guidance.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-005 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capabilities_get_response_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0006
preserved_exact_tokens:
- capabilities
- media.image
- media.video
- category
- media
- provider_tool
- enabled
- disabled_reason
- setup_hint
- NOT_CONFIGURED
- Configure Gemini access in Settings -> Authentication.
- id (string, required)
- enabled (bool, required)
- disabled_reason (string | null, required)
negative_constraints: []
compatibility_only_notes:
- The exact phrase "Configure Gemini access in Settings -> Authentication." is retained only as an old example token; active setup hints are route/provider specific.
stale_retired_dispositions:
- Gemini-default setup copy is retired by MGAC-094 through MGAC-097.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Contracts_V0.md'
```

### MGAC-006 - Capability Disabled Reason Enum

```yaml
plan_unit_id: MGAC-006
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Capability disabled_reason values are exactly NOT_CONFIGURED, MODEL_UNAVAILABLE, ADMIN_DISABLED, BACKEND_UNSUPPORTED, RATE_LIMITED, and QUOTA_EXCEEDED, and implementations must use exactly those strings.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-006 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_disabled_reason_enum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0007
preserved_exact_tokens:
- NOT_CONFIGURED
- MODEL_UNAVAILABLE
- ADMIN_DISABLED
- BACKEND_UNSUPPORTED
- RATE_LIMITED
- QUOTA_EXCEEDED
- canonical enum
- Implementations MUST use exactly these strings
negative_constraints:
- Implementations MUST use exactly the canonical disabled-reason strings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2'
```

### MGAC-007 - Disabled Reason Precedence

```yaml
plan_unit_id: MGAC-007
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: When multiple disabled causes apply, capabilities.get returns exactly one disabled_reason using the deterministic precedence BACKEND_UNSUPPORTED, NOT_CONFIGURED, RATE_LIMITED, QUOTA_EXCEEDED, ADMIN_DISABLED, then MODEL_UNAVAILABLE.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-007 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: disabled_reason_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0008
preserved_exact_tokens:
- Disabled-reason evaluation precedence
- exactly one `disabled_reason`
- highest to lowest
- BACKEND_UNSUPPORTED
- NOT_CONFIGURED
- RATE_LIMITED
- QUOTA_EXCEEDED
- ADMIN_DISABLED
- MODEL_UNAVAILABLE
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2'
```

### MGAC-008 - Media Capability IDs

```yaml
plan_unit_id: MGAC-008
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Media capabilities include media.image, media.video, media.tts, and media.music with descriptions for image generation, video generation, text-to-speech, and music/audio generation.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-008 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_capability_ids
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0009
preserved_exact_tokens:
- Media capabilities
- media.image
- Image generation
- media.video
- Video generation
- media.tts
- Text-to-speech synthesis
- media.music
- Music/audio generation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-009 - Provider Tool Capability Category

```yaml
plan_unit_id: MGAC-009
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The provider_tool category is the umbrella for all non-media Puppet Master tool capabilities, including registered provider-exposed tools and internal tools, reported with the same enabled, disabled_reason, and setup_hint shape using tool-registry conventions.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-009 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: provider_tool_capability_category
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0009
preserved_exact_tokens:
- Provider tool capabilities
- provider_tool
- umbrella bucket
- non-media tool capabilities
- registered provider-exposed tools
- OpenCode tools
- existing internal tools
- read/grep/write/task
- enabled
- disabled_reason
- setup_hint
- Tool IDs follow existing tool-registry conventions
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-010 - Persona Capability Inquiry Rule

```yaml
plan_unit_id: MGAC-010
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Assistant, Interviewer, and PRD Builder workflows must call capabilities.get when users ask about available capabilities, features, or what Puppet Master can do, so answers reflect real-time enabled state, reasons, and setup guidance.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-010 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: persona_capability_inquiry_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0010
preserved_exact_tokens:
- Assistant
- Interviewer
- MUST call `capabilities.get`
- available capabilities
- features
- what Puppet Master can do
- Requirements Doc Builder
- accurate, real-time answer
- what is enabled and what is not
- reasons and setup guidance
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Requirements Doc Builder is retained here only as a legacy source token for the former workflow; current product prose uses PRD Builder.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Personas.md, ContractName:Plans/chain-wizard-flexibility.md'
```

### MGAC-011 - Runtime Registry Snapshot Merge

```yaml
plan_unit_id: MGAC-011
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: capabilities.get is computed from the current runtime registry snapshot by merging built-in internal tools, enabled healthy MCP-discovered tools, provider-exposed active-backend tools, and media capabilities evaluated through the disabled-reason and media routing rules.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-011 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: runtime_registry_snapshot_merge
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0011
preserved_exact_tokens:
- current runtime registry snapshot
- built-in internal tools
- canonical tool registry
- currently enabled MCP-discovered tools
- server/provider bridge is healthy
- provider-exposed tools
- active backend
- media capabilities
- §§1.3–1.5
- §2.4
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-012 - Runtime Derived No Stale Capability Cache

```yaml
plan_unit_id: MGAC-012
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Capability state is runtime-derived rather than a separately persisted database; Settings saves, provider switches, MCP adapter refreshes, and Doctor or preflight remediation invalidate the previous snapshot and force recomputation on the next call.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-012 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: runtime_derived_no_stale_capability_cache
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0011
preserved_exact_tokens:
- runtime-derived
- not a separately persisted capability database
- Settings save
- provider switch
- MCP adapter refresh
- Doctor/preflight remediation
- invalidates the previous snapshot
- next `capabilities.get` call MUST recompute
- MUST NOT rely on stale cached enablement
negative_constraints:
- Capability state must not become a separately persisted capability database.
- The next capabilities.get call MUST recompute from live state and MUST NOT rely on stale cached enablement.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-013 - Capability Tool Telemetry

```yaml
plan_unit_id: MGAC-013
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: capabilities.get uses the standard tool event pipeline and emits canonical tool telemetry with tool_name capabilities.get, latency, and success/failure rather than defining a separate persistent capability-state event stream.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-013 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_tool_telemetry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0012
preserved_exact_tokens:
- standard tool event pipeline
- Plans/Contracts_V0.md
- Plans/Tools.md
- does **not** define a separate persistent capability-state event stream
- canonical tool telemetry
- tool_name = "capabilities.get"
- latency
- success/failure
negative_constraints:
- capabilities.get must not define a separate persistent capability-state event stream.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-014 - Capability Availability Refresh Visibility

```yaml
plan_unit_id: MGAC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Settings or provider state changes become visible on the next capabilities.get invocation or UI refresh instead of through a dedicated durable capability changed event.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-014 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_availability_refresh_visibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0012
preserved_exact_tokens:
- settings or provider state changes
- alter capability availability
- visible on the **next** invocation
- UI refresh
- rather than through a dedicated durable "capability changed" event
negative_constraints:
- Capability availability changes are not reported through a dedicated durable capability-changed event.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-015 - Media Generate Internal Tool

```yaml
plan_unit_id: MGAC-015
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: media.generate is the uniform internal tool for all media generation and accepts a structured request envelope that returns generated media output or an error.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-015 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_generate_internal_tool
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0014
preserved_exact_tokens:
- media.generate
- uniform internal tool
- all media generation
- structured request envelope
- returns media output or an error
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Tools.md'
```

### MGAC-016 - Media Generate Request Envelope

```yaml
plan_unit_id: MGAC-016
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The media.generate request envelope includes kind, prompt, model_override, count, aspect_ratio, size, resolution, duration, format, voice, bpm, seed, negative_prompt, and quality with required fields, media kind values, and safe defaults.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-016 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_generate_request_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0015
preserved_exact_tokens:
- kind
- prompt
- model_override
- count
- aspect_ratio
- size
- resolution
- duration
- format
- voice
- bpm
- seed
- negative_prompt
- quality
- image
- video
- tts
- music
- draft
- standard
- high
- default 1
- safe max, default 8
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-017 - Size Resolution Normalization

```yaml
plan_unit_id: MGAC-017
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Deterministic size and resolution normalization maps size_px, size_k, and vres by media kind, keeps image size_k/size_px authoritative over vres, keeps video vres authoritative for resolution, and uses last-match-wins within the same keyed family.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-017 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: size_resolution_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0015
preserved_exact_tokens:
- Deterministic `size` / `resolution` normalization
- kind=image
- size_px
- size
- resolution
- size_k
- 2k -> 2048
- 4k -> 4096
- 8k -> 8192
- kind=video
- vres
- 720p
- 1080p
- 1440p
- 2160p
- 4k
- Conflict rule
- last match wins
negative_constraints:
- For image prompts, size_k/size_px controls are authoritative over vres; for video prompts, vres is authoritative for resolution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-018 - Ephemeral Model Override Resolution

```yaml
plan_unit_id: MGAC-018
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: model_override applies only to the current media.generate invocation, does not change persistent Settings, and resolves by alias mapping, exact model ID, exact displayName case-insensitively, or MODEL_UNAVAILABLE.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-018 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ephemeral_model_override_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0016
preserved_exact_tokens:
- model_override
- single generation request
- without changing the persistent model configured in Settings
- ephemeral
- current `media.generate` invocation
- Alias mapping
- Exact model ID
- Exact displayName
- case-insensitive
- MODEL_UNAVAILABLE
negative_constraints:
- model_override MUST NOT change the persistent model in Settings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID'
```

### MGAC-019 - Cursor Backend Routing

```yaml
plan_unit_id: MGAC-019
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Cursor image generation is route-specific. Cursor image-input/API-key proof does not by itself prove product-native image generation; Cursor image output requires a verified generated-media route, while unsupported Cursor media kinds are disabled with BACKEND_UNSUPPORTED or route-specific unavailable state.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-019 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cursor_media_route_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: cursor_backend_route_specific_media
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
preserved_exact_tokens:
- Cursor
- special-case backend
- Cursor-native image generation
- kind=image
- video
- tts
- music
- 'disabled_reason: BACKEND_UNSUPPORTED'
- ToolID:capabilities.get
- ToolID:media.generate
negative_constraints: []
compatibility_only_notes:
- The exact phrase "Cursor-native image generation" is retained only as retired/source-lineage until a later owner contract proves product-native Cursor generation.
stale_retired_dispositions:
- Cursor image-input support must not be treated as generated-image output support.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/usage-feature.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-020 - Gemini Media Mode Cleanup

```yaml
plan_unit_id: MGAC-020
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Media routing follows concrete provider/model route capability fields, not a Gemini-default non-Cursor model. Legacy shorthand for key-backed Gemini, mixed-account Gemini, key-exception-only media, and non-Cursor Gemini-default routing is obsolete; each request evaluates concrete provider entry, auth family, billing/quota plane, account/profile, generated_media_routes[], and capability path.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-020 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_route_taxonomy_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_route_taxonomy_cleanup
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
- pldg-20260624-001-provider-updates:atom-0141
preserved_exact_tokens:
- Stale-canon cleanup
- key-backed
- mixed-account
- key-exception
- obsolete
- Gemini Direct (`gemini`)
- direct, key-only, API-key-backed provider entry
- Gemini CLI (`gemini_cli`)
- OAuth
- API-key
- Google/Vertex credential account rows
- requested/effective provider entry
- auth family
- billing/quota plane
- account/profile
- capability path
negative_constraints:
- Gemini media routing must not collapse into stale key-backed, mixed-account, or key-exception-only shorthand.
compatibility_only_notes:
- Legacy shorthand for non-Cursor Gemini media is obsolete; current routing is provider/model generated_media_routes[].
stale_retired_dispositions:
- Stale-canon cleanup retires key-backed, mixed-account, key-exception-only, and Gemini-default media wording.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-021 - Gemini Usage Account Plan Labels

```yaml
plan_unit_id: MGAC-021
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Gemini quota, usage, and account/plan UI labels are mode-dependent and imported from Multi-Account and usage-feature instead of inventing a parallel media bucket.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-021 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: gemini_usage_account_plan_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
preserved_exact_tokens:
- Quota/usage tools
- account/plan UI
- mode-dependent
- API-key-derived or estimated usage
- project attribution
- Gemini quota
- authoritative quota semantics
- CLI API-key
- Google/Vertex rows
- source-qualified labels
- capability picker
- Plans/Multi-Account.md
- Plans/usage-feature.md
negative_constraints:
- UI must not invent a parallel media-local account/plan or usage bucket.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-022 - Media Shared Runtime Routing Snapshot

```yaml
plan_unit_id: MGAC-022
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Media routing resolves provider/runtime, auth family, concrete media-capable runtime surface, and requested/effective runtime snapshot through the product-wide shared runtime identity model, not feature-local runtime-state fields.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-022 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_shared_runtime_routing_snapshot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
preserved_exact_tokens:
- Required routing order
- requested provider/runtime surface
- requested/effective auth family
- eligible account or profile set
- concrete runtime surface
- requested/effective runtime snapshot
- product-wide shared runtime identity model
- one canonical truth
- /history/debugging
- /retry/account-switch
negative_constraints:
- Media generation must not define feature-local shadow fields for account, provider, retry, switch, or audit identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-023 - Retired Gemini CLI Nanobanana Media Route Lineage

```yaml
plan_unit_id: MGAC-023
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Gemini CLI Nanobanana media route vocabulary is retired and retained only as source-lineage. Active media
  routing must use concrete provider/model generated_media_routes[] such as Gemini Direct where verified, OpenAI/Codex,
  OpenAI API-key routes, and MiniMax Image-01. PM must not install Nanobanana or create PM-managed Gemini CLI media roots.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-023 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_gemini_cli_nanobanana_resurrection
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: retired_gemini_cli_nanobanana_media_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
- pldg-20260624-001-provider-updates:atom-0141
preserved_exact_tokens:
- Gemini Direct media
- key-only/API-key-backed
- Gemini CLI media
- required helper path
- nanobanana
- PM-managed Gemini CLI account root
- image-preview models
- NANOBANANA_API_KEY
- OAuth- or Vertex-backed
- media_partial
- media_unavailable
- /version
- restart-required state
- /disclosure
- /capability
- family pooling
- requested/effective runtime disclosure
negative_constraints:
- Do not implement Gemini CLI media as an active generated-media route.
- Do not install or update Nanobanana as an active PM installable.
- Do not inject NANOBANANA_API_KEY for active media routing.
- Do not silently fall back from retired Gemini CLI media to Gemini Direct without requested/effective route disclosure.
compatibility_only_notes:
- OAuth-only or Vertex-backed Gemini CLI media states are retained only as retired source-lineage.
stale_retired_dispositions:
- Gemini CLI Nanobanana media route is retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-024 - Media Storage Usage Audit Boundaries

```yaml
plan_unit_id: MGAC-024
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Media records consume usage, storage, seglog, receipt, redb, event-sourced, route, runtime, attempt, and receipt-based owners without treating active-git-operations files, active-agents flat files, resume_url, or tier_id as stronger canonical truth.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-024 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_storage_usage_audit_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
preserved_exact_tokens:
- usage_event_ref
- single scope-precedence envelope
- .puppet-master/state/active-git-operations.json
- storage-plan
- seglog
- /receipts
- active-agents.json
- active-agents flat files
- /redb
- event-sourced stores
- resume_url
- Run_Graph_View.md
- Orchestrator_Page.md
- tier_id
- /runtime
- /receipt-based
negative_constraints:
- Media audit links must not treat active-git-operations files as canonical audit.
- Active-agents flat files are compatibility inputs only, not durable execution state truth.
- tier_id is compatibility context rather than media usage or identity truth.
compatibility_only_notes:
- active-agents flat files and tier_id are compatibility inputs/context only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-025 - Media Side Effect Target And Envelope

```yaml
plan_unit_id: MGAC-025
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Media operational identity remains side-effect and target truth, project/lane/worktree/thread/request identity must disambiguate concurrent media work, and media generation records explicitly name request, runtime, usage, route, artifact, and recovery fields rather than relying on underspecified shared envelope prose.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-025 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_side_effect_target_and_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0017
preserved_exact_tokens:
- orchestrator-subagent-integration
- canonical execution-unit refs
- /decomposition
- Provider/account identity
- shared-runtime truth
- side-effect and `/target` truth
- Execution-core docs
- multi-project
- lane-based orchestration
- /worktree/thread
- project, lane, worktree, thread, and request identity
- common envelope contract
- request, runtime, usage, route, artifact, and recovery fields
negative_constraints:
- Media records cannot assume one active worktree/thread context.
- The common envelope contract is not optional.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-026 - Media Generate Success Response

```yaml
plan_unit_id: MGAC-026
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Successful media.generate responses include success, request_id, kind, an engine route identity object with provider_entry_id, media_route_id, and generated_media_route_id when output is matched, artifacts, usage, and error fields with artifact metadata and canonical usage cost fields such as cost_microdollars and cost_is_estimate.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-026 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: media_generate_success_response
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0018
preserved_exact_tokens:
- success
- request_id
- req_20260301_a1b2c3d4
- kind
- engine
- provider_entry_id
- media_route_id
- generated_media_route_id
- artifacts
- artifact_id
- mime
- artifact://media
- sha256
- bytes
- meta
- model_used
- seed
- generation_time_ms
- usage
- cost_microdollars
- cost_is_estimate
- input_tokens
- output_tokens
- media_units
negative_constraints:
- Active response schemas MUST NOT constrain media route identity to a fixed `gemini_api`/`cursor_native` enum.
compatibility_only_notes:
- The older `engine.backend` field name is source-lineage vocabulary only; active generated-media responses use the engine route identity object.
stale_retired_dispositions:
- '`engine.backend`, `gemini_api`, and `cursor_native` are preserved only as stale/source-lineage terms from the older response schema and are not active route taxonomy.'
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-027 - Artifact Manifest Layout And Write Ordering

```yaml
plan_unit_id: MGAC-027
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Generated media artifacts are written to deterministic request directories with a durable manifest.json that includes schema_version, request_id, kind, engine, generated_at_utc, artifacts, and usage; implementations write artifact files first, hash final bytes, and only then write the manifest without inline data_uri returns.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-027 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: artifact_manifest_layout_and_write_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0018
preserved_exact_tokens:
- Deterministic artifact layout
- .puppet-master/artifacts/media/<request_id>/output_000.<ext>
- manifest.json
- schema_version
- generated_at_utc
- artifacts[]
- usage
- write artifact files first
- compute hashes/bytes from the final bytes on disk
- only then write `manifest.json`
- MUST NOT leave a manifest claiming success
- No inline `data_uri`
negative_constraints:
- Implementations MUST write artifact files before manifest.json.
- A failed or partial request MUST NOT leave a manifest claiming success for missing artifacts.
- No inline data_uri is returned.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, SchemaID:pm.media.generate.result.v1, Primitive:ArtifactStore'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-028 - Generation Supersession Record

```yaml
plan_unit_id: MGAC-028
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: When remediation or graph generation supersedes a media attempt, the result records old generation, new generation, invalidated paths, new paths, surviving rejoined paths, and concern, promotion/recovery, or recovery implications so final state is visible without diffing addenda.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-028 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: generation_supersession_record
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0018
preserved_exact_tokens:
- Generation supersession record
- old generation
- new generation
- invalidated path refs
- new path refs
- surviving `/rejoined` path refs
- resulting concern
- /promotion/recovery
- recovery implications
- without diffing addenda
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, SchemaID:pm.media.generate.result.v1, Primitive:ArtifactStore'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-029 - Concurrent Request Isolation

```yaml
plan_unit_id: MGAC-029
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Concurrent media.generate calls are allowed only when each uses its own request_id directory, no request appends into another request directory, and retry behavior allocates a new request_id rather than mutating a prior manifest.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-029 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: concurrent_request_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0018
preserved_exact_tokens:
- Concurrent requests
- Multiple `media.generate` calls
- own `request_id` directory
- No request may append into another request's directory
- Retry behavior MUST allocate a new `request_id`
- rather than mutating a previous manifest in place
negative_constraints:
- Retries must allocate a new request_id and must not mutate a previous manifest in place.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, Primitive:ArtifactStore'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-030 - Failure Response And Cursor Error

```yaml
plan_unit_id: MGAC-030
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Failure responses return success false with empty artifacts, null usage, and error code/message. Cursor generated-media output requires a verified generated-media route; Cursor image-input proof or other provider credentials do not make Cursor image generation available. Unsupported Cursor video, tts, and music return BACKEND_UNSUPPORTED or route-specific unavailable states.
gui_related: true
gui_classification_reason: The unit defines user-visible media, capability picker, GUI copy, artifact display, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-030 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: failure_response_and_route_specific_cursor_error
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0018
preserved_exact_tokens:
- On failure
- 'success: false'
- 'artifacts: []'
- 'usage: null'
- error
- code
- message
- eligible media generation provider route
- Settings -> Providers
- route-specific Cursor availability
- provider_entry_id
- media_route_id
- kind=image
- without requiring unrelated provider credentials
- video
- tts
- music
- error.code = "BACKEND_UNSUPPORTED"
negative_constraints:
- Cursor image generation MUST NOT be inferred from image-input proof, API-key proof, or unrelated provider credentials.
compatibility_only_notes:
- Older `engine.backend = "cursor_native"` wording is source-lineage vocabulary only; active failures identify the resolved provider/media route.
stale_retired_dispositions:
- '"This feature requires Gemini access" and `engine.backend = "cursor_native"` are stale examples from the prior Gemini/Cursor split and are not active user-facing copy.'
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, Primitive:ArtifactStore'
split_recommendation_reason: The source span contains multiple separable media/capability concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-031 - Stable Media Error Codes

```yaml
plan_unit_id: MGAC-031
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: media.generate error.code must be exactly one of the nine canonical stable codes and implementations must not invent ad-hoc code strings.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-031 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: stable_media_error_codes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0019
preserved_exact_tokens:
- Stable error codes
- error.code
- NOT_CONFIGURED
- MODEL_UNAVAILABLE
- RATE_LIMITED
- QUOTA_EXCEEDED
- BACKEND_UNSUPPORTED
- ADMIN_DISABLED
- INVALID_REQUEST
- PROVIDER_ERROR
- INTERNAL_ERROR
- nine codes
- stable across versions
- MUST NOT invent ad-hoc code strings
negative_constraints:
- Implementations MUST NOT invent ad-hoc error code strings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
```

### MGAC-032 - Slot Extraction Grammar Boundary

```yaml
plan_unit_id: MGAC-032
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The natural-language slot extraction grammar is a deterministic regex-based mini grammar that extracts structured parameters from user prompts before media.generate is called and produces the request envelope fields.
gui_related: false
gui_classification_reason: The unit defines media/capability runtime, tool, routing, storage, parsing, or contract behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-032 instead of broad MGAC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_generation_contract_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: slot_extraction_grammar_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0020
preserved_exact_tokens:
- Natural-language slot extraction grammar
- deterministic, regex-based mini grammar
- structured parameters
- user natural-language prompts
- extraction pipeline runs before `media.generate`
- request envelope fields
- §2.2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, slot extraction, and media UI behavior while referenced owner docs retain their SSOT boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
```

### MGAC-033 - Raw And Normalized Prompt Inputs

```yaml
plan_unit_id: MGAC-033
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Slot pre-processing keeps both raw original user text and s_lower normalized lowercased copy before extraction.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-033 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: raw_and_normalized_prompt_inputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0021
preserved_exact_tokens:
- raw
- original user text
- s_lower
- normalized lowercased copy
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-034 - Trailing Controls Block Split Order

```yaml
plan_unit_id: MGAC-034
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: When a trailing controls block ends the prompt with parentheses or brackets and contains at least one control token, extraction splits body and controls, parses controls first, and removes the block before creative-prompt cleaning.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-034 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: trailing_controls_block_split_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0021
preserved_exact_tokens:
- trailing controls block
- prompt ends with `(...)` or `[...]`
- at least one control token
- split `body` + `controls`
- parse controls first
- remove the block from the prompt
- creative-prompt cleaning
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-035 - Malformed Controls Tolerance

```yaml
plan_unit_id: MGAC-035
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Malformed trailing controls with unmatched delimiters, empty control values, or unsupported control names are ignored as malformed tokens rather than failing the full request, and the cleaned creative prompt still proceeds through deterministic extraction.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-035 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: malformed_controls_tolerance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0021
preserved_exact_tokens:
- unmatched delimiters
- control keys with empty values
- unsupported control names
- ignore the malformed control token
- rather than failing the full request
- cleaned creative prompt
- deterministic extraction
negative_constraints:
- Malformed controls must not fail the full request.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-036 - Controls Block Regex

```yaml
plan_unit_id: MGAC-036
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The controls-block regex is preserved exactly with named captures body, bracket, and controls and a 1-to-400 character controls capture limit.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-036 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: controls_block_regex
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0021
preserved_exact_tokens:
- Controls-block regex
- (?is)^(?P<body>.*?)(?:\s*(?P<bracket>\(|\[)\s*(?P<controls>[^)\]]{1,400})\s*(?:\)|\])\s*)$
- body
- bracket
- controls
- '{1,400}'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-037 - Control Token Gate Regex

```yaml
plan_unit_id: MGAC-037
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The control token gate requires at least one recognized control token inside captured controls, using the preserved token vocabulary model, aspect, ratio, size, resolution, duration, voice, format, bpm, seed, negative, and quality.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-037 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: control_token_gate_regex
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0021
preserved_exact_tokens:
- Control token gate
- at least one must match
- \b(model|aspect|ratio|size|resolution|duration|voice|format|bpm|seed|negative|quality)\b
- model
- aspect
- ratio
- size
- resolution
- duration
- voice
- format
- bpm
- seed
- negative
- quality
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-038 - Prefix Kind Detection Priority

```yaml
plan_unit_id: MGAC-038
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Kind detection first uses prefix form at highest priority, preserving the image, video, tts, and music prefix regex.
gui_related: true
gui_classification_reason: The unit defines user-visible media-kind detection from natural language prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-038 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: prefix_kind_detection_priority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0022
preserved_exact_tokens:
- Kind detection
- Prefix form
- highest priority
- (?is)^\s*(?P<prefix>image|video|tts|music)\s*:\s*
- image
- video
- tts
- music
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-039 - Keyword Kind Detection

```yaml
plan_unit_id: MGAC-039
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: If no prefix match exists, keyword-based kind detection uses the canonical image, video, tts, and music regex families.
gui_related: true
gui_classification_reason: The unit defines user-visible media-kind detection from natural language prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-039 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: keyword_kind_detection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0022
preserved_exact_tokens:
- Keyword-based
- if no prefix match
- 'image: \b(image|picture|photo|logo|poster|thumbnail|cover)\b'
- 'video: \b(video|clip|animation|broll|b-roll)\b'
- 'tts: \b(tts|text to speech|read aloud|say this|voiceover|voice-over)\b'
- 'music: \b(music|song|beat|instrumental|soundtrack)\b'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-040 - Verb Fallback Ambiguity Gate

```yaml
plan_unit_id: MGAC-040
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Verb fallback is allowed only when prefix and keyword detection are unambiguous with a single kind match.
gui_related: true
gui_classification_reason: The unit defines user-visible media-kind detection from natural language prompts.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-040 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: verb_fallback_ambiguity_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0022
preserved_exact_tokens:
- Verb fallback
- only if the above are unambiguous
- single kind match
negative_constraints:
- Verb fallback must not run when kind detection is ambiguous.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-041 - Controls Override Precedence

```yaml
plan_unit_id: MGAC-041
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Controls-block key/value pairs override every other extraction source before ordered slot extraction proceeds.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-041 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: controls_override_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0023
preserved_exact_tokens:
- Deterministic precedence
- Controls-block key/values override everything
negative_constraints:
- Controls-block key/values override everything.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-042 - Deterministic Slot Order

```yaml
plan_unit_id: MGAC-042
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Slot extraction proceeds in the exact deterministic order model_override, count, aspect_ratio, size/resolution, duration, format, voice/style, quality, seed, bpm, and negative_prompt.
gui_related: false
gui_classification_reason: The unit defines deterministic slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MGAC-042 instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: deterministic_slot_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0023
preserved_exact_tokens:
- model_override
- count
- aspect_ratio
- size / `resolution`
- duration
- format
- voice` / `style
- quality
- seed
- bpm
- negative_prompt
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns deterministic media slot extraction grammar.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable slot-extraction parsing concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MGAC-043 - Model Override Candidate Extraction

```yaml
plan_unit_id: MGAC-043
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Model override candidate extraction preserves the keyword-form matcher and @ shorthand matcher for media.generate model tokens before normalization and resolution.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: model_override_candidate_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?is)\b(?:using|with|via|use|model)\s*(?:[:=]\s*)?(?P<model>@?[a-z0-9][a-z0-9._/\-\s]{0,80}?)(?=(?:\s*(?:,|;|\)|\]|\.$|$))|\s+\b(?:for|aspect|ratio|size|resolution|format|voice|duration|negative|quality|seed|bpm|variations?|versions?|options?)\b)
- (?i)(?<!\w)@(?P<model2>[a-z0-9][a-z0-9._/\-]{1,64})(?!\w)
- model_override
- '@ shorthand'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-044 - Model Override Normalization And Resolution

```yaml
plan_unit_id: MGAC-044
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Model override resolution normalizes the model key by lowercasing and collapsing spaces, underscores, and hyphens, then resolves alias -> exact model id -> exact displayName -> else MODEL_UNAVAILABLE while leaving media model aliases owned by Models_System.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-043
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: model_override_normalization_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Normalize model key
- lowercase
- collapse spaces, underscores, and hyphens
- alias -> exact model id -> exact displayName -> else `MODEL_UNAVAILABLE`
- Nano Banana
- Nano Banana Pro
- Veo fast
- TTS flash
- TTS pro
- Plans/Models_System.md#MEDIA-ALIASES
negative_constraints:
- Do not restate the canonical media model alias table in this document.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID, ContractName:Plans/Models_System.md#MEDIA-ALIASES'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-045 - Count Extraction And Clamp

```yaml
plan_unit_id: MGAC-045
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Count extraction preserves the digits pattern, optional one-through-ten word forms, safe max clamp default 8, and last-match-wins behavior.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: count_extraction_and_clamp
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?:(?:make|generate|create|give me|output|render)\s+)?(?P<count>\d{1,2})\s*(?:x\s*)?(?:variations?|versions?|options?|images?|pics?|pictures?|clips?|frames?)\b
- one through ten
- Clamp to safe max (default 8)
- Last match wins
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-046 - Aspect Ratio Extraction And Mapping

```yaml
plan_unit_id: MGAC-046
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Aspect ratio extraction preserves numeric and named forms and maps square to 1:1, portrait/vertical to 9:16, and landscape/horizontal/widescreen to 16:9.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: aspect_ratio_extraction_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?P<ar_w>\d{1,2})\s*:\s*(?P<ar_h>\d{1,2})\b
- (?i)\b(?P<ar_named>square|portrait|landscape|vertical|horizontal|widescreen)\b
- square = `1:1`
- portrait / `vertical` = `9:16`
- landscape / `horizontal` / `widescreen` = `16:9`
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-047 - Size Resolution Candidate Extraction

```yaml
plan_unit_id: MGAC-047
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Size and resolution candidate extraction preserves image pixel sizes, image k-form sizes, and video resolution tokens before deterministic envelope assignment.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: size_resolution_candidate_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_px>512|768|1024|1152|1280|1536|2048|3072|4096)\s*(?:px|pixels)?\b
- (?i)\b(?:size|resolution|res)\s*[:=]?\s*(?P<size_k>2k|4k|8k)\b
- (?i)\b(?P<vres>720p|1080p|1440p|2160p|4k)\b
- size_px
- size_k
- vres
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-048 - Size Resolution Envelope Assignment Guards

```yaml
plan_unit_id: MGAC-048
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Size and resolution assignment does not treat bare numbers as size except in controls or trailing comma controls, maps size_px to size, maps size_k to numeric size plus symbolic resolution, maps vres to video resolution, and prevents image creative-prose vres or vres from overriding image size_k-derived resolution.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-047
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: size_resolution_envelope_assignment_guards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Bare numbers are **not** treated as size unless they appear in a controls block or trailing comma controls.
- '`size_px` populates `size`.'
- '`size_k` populates `size` using `2k -> 2048`, `4k -> 4096`, `8k -> 8192`, and also populates `resolution` with the symbolic token.'
- '`vres` populates `resolution` for `kind=video`'
- for `kind=image`, bare `vres` matches in creative prose are ignored unless provided in a keyed controls context
- '`size_k` is authoritative'
negative_constraints:
- Bare numbers must not be treated as size unless they appear in a controls block or trailing comma controls.
- For image requests, vres must not override size_k-derived resolution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-049 - Duration Extraction For Video Music

```yaml
plan_unit_id: MGAC-049
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Duration extraction applies only to video and music, preserving keyworded seconds matching and bare seconds matching only inside controls blocks or trailing controls.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: duration_extraction_video_music
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?:for|duration|length)\s*(?P<secs>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b
- (?i)\b(?P<secs2>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs)\b
- video/music only
- Bare (only in controls block or trailing controls)
negative_constraints:
- Bare duration values are valid only in controls block or trailing controls.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-050 - Format Extraction

```yaml
plan_unit_id: MGAC-050
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Format extraction preserves the exact keyworded matcher and canonical output token set for image, video, and audio media outputs.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: format_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?:format|output|export|as)\s*[:=]?\s*(?P<fmt>png|jpg|jpeg|webp|gif|mp4|mov|wav|mp3|flac|pcm16)\b
- png
- jpg
- jpeg
- webp
- gif
- mp4
- mov
- wav
- mp3
- flac
- pcm16
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-051 - TTS Voice Extraction

```yaml
plan_unit_id: MGAC-051
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: TTS voice extraction preserves the voice ID matcher and voice-style phrase matcher.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: tts_voice_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\bvoice\s*[:=]\s*(?P<voice>[a-z0-9][a-z0-9 _\-]{0,32})\b
- (?i)\bin\s+a[n]?\s+(?P<voice_style>[^,.;]{1,40})\s+voice\b
- Voice ID
- Voice style
- TTS
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-052 - Quality Candidate And Keyword Guard

```yaml
plan_unit_id: MGAC-052
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Quality extraction preserves draft/standard/high candidate matching and phrase mapping, but quality is set only from controls-block or quality-keyword phrases and never from plain descriptive adjectives in the creative prompt.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: quality_candidate_keyword_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?P<qual>draft|standard|high)\b
- quick draft -> `draft`
- high quality -> `high`
- 'quality: high'
- quality=standard
- draft quality
negative_constraints:
- Plain descriptive adjectives in the creative prompt MUST NOT set `quality`.
- Bare lexical matches are candidate tokens only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-053 - Seed Extraction

```yaml
plan_unit_id: MGAC-053
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Seed extraction preserves the keyworded integer matcher for one-to-ten digit seed values.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: seed_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\bseed\s*[:=]?\s*(?P<seed>\d{1,10})\b
- seed
- 1,10
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-054 - BPM Extraction

```yaml
plan_unit_id: MGAC-054
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: BPM extraction preserves both number-before-bpm and bpm-keyed forms with bpm and bpm2 capture groups.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: bpm_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?i)\b(?P<bpm>\d{2,3})\s*bpm\b|\bbpm\s*[:=]\s*(?P<bpm2>\d{2,3})\b
- bpm
- bpm2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-055 - Negative Prompt Extraction And Dedupe

```yaml
plan_unit_id: MGAC-055
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Negative prompt extraction preserves explicit negative prompt parsing, avoid-clause collection, and combined explicit-plus-avoid dedupe while preserving order.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-041
- MGAC-042
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: negative_prompt_extraction_dedupe
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- (?is)\bnegative\s+prompt\s*[:=]\s*(?P<neg>"[^"]{1,200}"|\'[^\']{1,200}\'|[^,;\n]{1,200})
- (?is)\b(?:without|no|avoid)\s+(?P<avoid>[^,.;\n]{1,80})
- Combine explicit + avoid list
- dedupe
- preserve order
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-056 - Prompt Cleaning After Slot Extraction

```yaml
plan_unit_id: MGAC-056
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Prompt cleaning removes a detected controls block and only matched spans introduced by control keywords while preserving all remaining creative prompt text.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-034
- MGAC-041
- MGAC-042
- MGAC-043
- MGAC-044
- MGAC-045
- MGAC-046
- MGAC-047
- MGAC-048
- MGAC-049
- MGAC-050
- MGAC-051
- MGAC-052
- MGAC-053
- MGAC-054
- MGAC-055
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: prompt_cleaning_after_slot_extraction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- 'If a controls block is present: remove it from the creative prompt.'
- Remove only matched spans introduced by control keywords
- using
- model
- size
- aspect
- ratio
- resolution
- format
- voice
- duration
- negative
- quality
- seed
- bpm
- Preserve remaining text as the creative prompt.
negative_constraints:
- Prompt cleaning must not remove unmatched creative prompt text.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-057 - Capability Picker Dropdown Items

```yaml
plan_unit_id: MGAC-057
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The composer capability picker dropdown exposes Image, Video, TTS, and Music rows mapped respectively to media.image, media.video, media.tts, and media.music.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-004
- MGAC-005
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_picker_dropdown_items
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- '4'
- CAPABILITY-PICKER
- Composer dropdown
- Image
- '`media.image`'
- Video
- '`media.video`'
- TTS
- '`media.tts`'
- Music
- '`media.music`'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-058 - Disabled Capability Presentation Accessibility

```yaml
plan_unit_id: MGAC-058
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Disabled capabilities remain visible, greyed out, keyboard-focusable, and expose the same disabled reason through hover, focus, and assistive-technology description channels using listbox/option semantics rather than color alone.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-057
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: disabled_capability_presentation_accessibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Disabled capabilities
- visible
- greyed out
- tooltip
- hover
- focus
- role=listbox
- role=option
- assistive technologies
- rather than color alone
negative_constraints:
- Disabled reason must be exposed through tooltip/description rather than color alone.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-059 - Missing Media Provider Footer Copy

```yaml
plan_unit_id: MGAC-059
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: When visible media capabilities are disabled because no eligible media generation provider route is configured, the dropdown footer shows route-specific setup copy and helper links without implying Gemini or AI Studio is the default media source. The old Gemini-access copy remains preserved only as source-lineage.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-057
- MGAC-058
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: missing_media_provider_footer_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Configure Gemini access in Settings → Authentication.
- Sign in with Gemini OAuth or add a Google/Gemini API key.
- '[Get API key]'
- Google AI Studio API-key page
- MUST NOT imply AI Studio is the only valid source of Gemini API keys
negative_constraints:
- The surrounding copy MUST NOT imply AI Studio is the only valid source of Gemini API keys.
- The active footer MUST NOT use Gemini as the generic missing-media setup path.
compatibility_only_notes:
- Old Gemini access copy and Get API key link are retained only as source-lineage examples.
stale_retired_dispositions:
- Gemini-default media setup footer is retired by MGAC-094 through MGAC-097.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/rewrite-tie-in-memo.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-060 - Shared Missing Configuration Footer Pinning

```yaml
plan_unit_id: MGAC-060
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: When multiple visible capabilities share the missing-configuration disabled reason, the dropdown shows the footer banner once, keeps it pinned at the bottom while the list scrolls, and still preserves per-item disabled reasons on hover/focus.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-057
- MGAC-058
- MGAC-059
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: shared_missing_configuration_footer_pinning
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- show the footer banner once
- pinned at the bottom of the dropdown
- while the list scrolls
- supplemental guidance
- per-item disabled reasons remain visible on hover/focus
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-061 - Cursor Backend Media Capability Behavior

```yaml
plan_unit_id: MGAC-061
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: For the Cursor backend, generated media is enabled only when Cursor declares a verified generated-media route; image-input proof alone is not generated-image support. Unsupported Cursor media kinds remain disabled with BACKEND_UNSUPPORTED, Cursor does not create a separate Gemini account model, and non-Cursor media follows provider/model generated_media_routes[] routing.
gui_related: false
gui_classification_reason: The unit defines backend capability routing behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-019
- MGAC-020
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_backend_routing_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: cursor_backend_media_capability_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Cursor
- image remains enabled through Cursor-native image generation
- video, TTS, and music
- 'disabled_reason: BACKEND_UNSUPPORTED'
- does not create a separate Gemini account model
- '### 2.4 Backend routing'
negative_constraints:
- Cursor image special casing must not create a separate Gemini account model.
- Cursor image-input/API-key proof must not enable generated-image output without a generated-media route.
compatibility_only_notes:
- The exact phrases "image remains enabled through Cursor-native image generation" and "canonical requested/effective Gemini routing" are retired source-lineage phrases.
stale_retired_dispositions:
- Cursor-native image generation as an always-on route is retired pending future proof.
- Gemini-default non-Cursor routing is retired.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-062 - Enabled Capability Click Prompt Insertion

```yaml
plan_unit_id: MGAC-062
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Clicking an enabled capability item inserts the corresponding pre-authored assistant prompt into the chat composer and points users to the exact prompt strings per capability.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-057
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: enabled_capability_click_prompt_insertion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Clicking an **enabled** capability item
- pre-authored assistant prompt
- chat composer
- §5
- exact prompt strings per capability
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-063 - Inline Model Override Example

```yaml
plan_unit_id: MGAC-063
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: A per-message model override may appear inline in the prompt, including the exact Nano Banana Pro image example, and applies only to one generation request without changing the model configured in Settings.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-043
- MGAC-044
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_slot_extraction_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: inline_model_override_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Generate an image of a sunset over mountains using Nano Banana Pro
- model_override
- Nano Banana Pro
- alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`
- single generation request
- does not change the model configured in Settings
negative_constraints:
- Per-message model overrides must not change the model configured in Settings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-064 - Capability Picker Runtime Refresh

```yaml
plan_unit_id: MGAC-064
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The capability picker refreshes after Settings or provider-state changes that affect capability evaluation and preserves already typed composer text while recalculating only picker contents and footer/banner state.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-014
- MGAC-057
- MGAC-058
- MGAC-060
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_capability_picker_gui_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_picker_runtime_refresh
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Settings or provider-state changes
- signing in with Gemini OAuth
- saving a Gemini API key
- toggling a media capability off
- switching providers
- recovering an MCP/provider bridge
- MUST preserve composer text
- picker contents and footer/banner state are recalculated
negative_constraints:
- Capability picker refresh must not clear composer text already typed by the user.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-065 - Capability Click Prompt Copy

```yaml
plan_unit_id: MGAC-065
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The four media capability click prompts are canonical verbatim UI copy for Image, Video, TTS, and Music surfaces.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-062
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_ui_copy_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: capability_click_prompt_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- UI-COPY
- What image are we generating? Describe the subject, style, and optionally aspect ratio (1:1, 16:9), size (1024, 2048), and how many variations you want.
- What video are we generating? Describe the scene, camera/style, duration, and aspect ratio/resolution if you have a preference.
- What text should I speak, and what voice/style should it use? You can also choose output format (WAV/MP3) if available.
- What music are we generating? Share genre, mood, tempo (BPM), and duration. If you want, mention instruments or references.
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-066 - Disabled Reason Message Copy

```yaml
plan_unit_id: MGAC-066
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The six disabled-reason messages are canonical verbatim UI copy for NOT_CONFIGURED, MODEL_UNAVAILABLE, ADMIN_DISABLED, BACKEND_UNSUPPORTED, RATE_LIMITED, and QUOTA_EXCEEDED.
gui_related: true
gui_classification_reason: The unit defines user-visible capability picker, disabled-state presentation, UI copy, or interactive media behavior.
split_recommended: true
depends_on:
- MGAC-006
- MGAC-058
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_ui_copy_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: disabled_reason_message_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- This feature requires an eligible media generation provider route. Configure a supported provider account, profile, credential, or API key in Settings -> Providers, then try again.
- That model isn't available with the current provider account, profile, auth mode, API key, or media route (or it isn't enabled). Pick a different model in Settings, or ask 'What models are available?'
- This feature is disabled in Settings. Enable it under Media settings, then try again.
- The current backend supports Image Generation only. To use Video/TTS/Music, use a provider route with verified generated-media support for that kind.
- This feature is temporarily rate-limited. Wait a moment and try again.
- API quota for this feature has been exhausted. Check your provider usage dashboard or wait for quota to reset.
- NOT_CONFIGURED
- MODEL_UNAVAILABLE
- ADMIN_DISABLED
- BACKEND_UNSUPPORTED
- RATE_LIMITED
- QUOTA_EXCEEDED
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/rewrite-tie-in-memo.md'
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Models_System.md#MODEL-ID'
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md'
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-067 - AC-MED01 Capability Return Shape

```yaml
plan_unit_id: MGAC-067
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED01 requires capabilities.get to return all media capabilities and registered provider-tool capabilities with enabled, disabled_reason, and setup_hint fields.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-004
- MGAC-005
- MGAC-008
- MGAC-009
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med01_capability_return_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED01
- capabilities.get
- media.image
- media.video
- media.tts
- media.music
- enabled
- disabled_reason
- setup_hint
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Progression_Gates.md'
- 'ContractRef: ToolID:capabilities.get'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-068 - AC-MED02 Disabled Reason Enum Integrity

```yaml
plan_unit_id: MGAC-068
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED02 requires disabled_reason values to be exactly the six canonical values from section 1.3 with no ad-hoc reason strings.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med02_disabled_reason_enum_integrity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED02
- disabled_reason
- six canonical values
- §1.3
- No ad-hoc reason strings
negative_constraints:
- No ad-hoc reason strings are permitted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-069 - AC-MED03 Cursor Without Gemini

```yaml
plan_unit_id: MGAC-069
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED03 requires Cursor without a verified Cursor generated-media route to keep generated-media output disabled or capability-gated; image-input proof alone must not enable media.image, and unsupported Cursor media kinds use BACKEND_UNSUPPORTED or a route-specific unavailable state.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-019
- MGAC-061
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med03_cursor_without_generated_media_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED03
- Cursor
- media.image
- Cursor-native generation
- media.video
- media.tts
- media.music
- BACKEND_UNSUPPORTED
negative_constraints: []
compatibility_only_notes:
- The old "Cursor without eligible Gemini configuration" criterion is retired source-lineage.
stale_retired_dispositions:
- Gemini configuration no longer governs Cursor generated-media availability.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-070 - AC-MED03A Cursor With Gemini Configured

```yaml
plan_unit_id: MGAC-070
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED03A requires Cursor generated-media availability to depend on Cursor's own verified generated-media route. Valid Gemini Direct or other provider credentials do not make Cursor a generated-media backend; requested/effective routing must disclose any switch to the actual media provider.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-019
- MGAC-061
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med03a_cursor_with_other_provider_configured
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED03A
- valid Gemini API key
- Gemini OAuth account
- image MUST remain enabled via Cursor-native generation
- video
- tts
- music
- BACKEND_UNSUPPORTED
negative_constraints: []
compatibility_only_notes:
- The old "Cursor with valid Gemini API key and/or OAuth account" criterion is retired source-lineage.
stale_retired_dispositions:
- Gemini credentials no longer enable Cursor-native image generation.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Multi-Account.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-071 - AC-MED04 Non Cursor Eligible Gemini

```yaml
plan_unit_id: MGAC-071
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED04 requires non-Cursor media capabilities to be eligible only for media kinds declared by the resolved provider/model generated_media_routes[] entry, subject to Settings > Media toggles, route/model availability, and provider-specific support states. An eligible account alone does not guarantee all media kinds are enabled.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-020
- MGAC-021
- MGAC-022
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med04_non_cursor_eligible_generated_media_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED04
- non-Cursor
- eligible Gemini account
- per-capability Settings > Media toggle
- ADMIN_DISABLED
- MODEL_UNAVAILABLE
- An eligible account alone does NOT guarantee all four are enabled.
negative_constraints:
- An eligible account alone does NOT guarantee all four are enabled.
compatibility_only_notes:
- The old "eligible Gemini account" criterion is retained only as source-lineage.
stale_retired_dispositions:
- Gemini-default non-Cursor media routing is retired.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Multi-Account.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-072 - AC-MED05 Non Cursor Missing Generated Media Route

```yaml
plan_unit_id: MGAC-072
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED05 requires generated-media capabilities to be disabled with NOT_CONFIGURED, UNSUPPORTED, CAPABILITY_GATED, or the more specific provider/account state when the active backend is non-Cursor and no eligible provider/model generated-media route exists for the resolved request/policy.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-020
- MGAC-022
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med05_non_cursor_missing_generated_media_route
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED05
- non-Cursor
- no eligible Gemini account
- resolved request/policy
- NOT_CONFIGURED
negative_constraints:
- No eligible provider/model generated-media route must not be reported as zero-cost success or generic Gemini setup.
compatibility_only_notes:
- The old "no eligible Gemini account" criterion is retained only as source-lineage.
stale_retired_dispositions:
- Gemini-default non-Cursor NOT_CONFIGURED behavior is retired.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-073 - AC-MED06 Model Override Acceptance

```yaml
plan_unit_id: MGAC-073
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED06 requires model_override to resolve by alias -> exact model id -> exact displayName -> else MODEL_UNAVAILABLE and not change persistent Settings.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-043
- MGAC-044
- MGAC-063
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med06_model_override_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED06
- model_override
- alias -> exact model id -> exact displayName -> else MODEL_UNAVAILABLE
- MUST NOT change the persistent model in Settings
negative_constraints:
- The override MUST NOT change the persistent model in Settings.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-074 - AC-MED07 Disabled Picker Display Acceptance

```yaml
plan_unit_id: MGAC-074
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED07 requires the capability picker to display disabled capabilities as greyed-out items with the appropriate section 5.2 disabled-reason tooltip.
gui_related: true
gui_classification_reason: The unit defines a testable GUI-facing capability picker, UI copy, accessibility, or account-plan presentation criterion.
split_recommended: true
depends_on:
- MGAC-058
- MGAC-066
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med07_disabled_picker_display_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED07
- capability picker dropdown
- disabled capabilities
- greyed-out items
- tooltip
- §5.2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-075 - AC-MED08 Capability Click Prompt Acceptance

```yaml
plan_unit_id: MGAC-075
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED08 requires clicking an enabled capability in the picker to insert the corresponding verbatim prompt from section 5.1 into the chat composer.
gui_related: true
gui_classification_reason: The unit defines a testable GUI-facing capability picker, UI copy, accessibility, or account-plan presentation criterion.
split_recommended: true
depends_on:
- MGAC-062
- MGAC-065
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med08_capability_click_prompt_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED08
- enabled capability
- picker
- verbatim prompt
- §5.1
- chat composer
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-076 - AC-MED09 Persona Capability Lookup Acceptance

```yaml
plan_unit_id: MGAC-076
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED09 requires the Assistant and Interviewer to call capabilities.get when users ask about capabilities or features, including the PRD Builder workflow.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-010
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med09_persona_capability_lookup_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED09
- Assistant
- Interviewer
- capabilities.get
- PRD Builder workflow
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Personas.md, ContractName:Plans/chain-wizard-flexibility.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-077 - AC-MED10 DRY Anchor Reference Acceptance

```yaml
plan_unit_id: MGAC-077
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED10 requires media-generation and capability references across plan documents to reference this document anchors rather than restating rules.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-003
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med10_dry_anchor_reference_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED10
- Plans/Media_Generation_and_Capabilities.md
- anchors
- DRY
- rather than restating rules
negative_constraints:
- Other docs must reference anchors rather than restating media-generation or capability rules.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-078 - AC-MED11 Admin Toggle Disablement Acceptance

```yaml
plan_unit_id: MGAC-078
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED11 requires an otherwise available capability with Settings > Media toggle OFF to return disabled with ADMIN_DISABLED.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-007
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med11_admin_toggle_disablement_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED11
- Settings > Media toggle
- 'OFF'
- ADMIN_DISABLED
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-079 - AC-MED12 Disable Reason Precedence Acceptance

```yaml
plan_unit_id: MGAC-079
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED12 requires infrastructure-disabled conditions to take precedence over admin-toggle disablement and not return ADMIN_DISABLED in those cases.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-007
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med12_disable_reason_precedence_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED12
- BACKEND_UNSUPPORTED
- NOT_CONFIGURED
- RATE_LIMITED
- QUOTA_EXCEEDED
- ADMIN_DISABLED
- precedence in §1.4
negative_constraints:
- Infrastructure-disabled reasons must take precedence over ADMIN_DISABLED.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-080 - AC-MED13 Non Cursor Route Auth Resolution

```yaml
plan_unit_id: MGAC-080
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED13 requires non-Cursor media.generate to use standard requested/effective provider/account/route auth resolution and forbids silent oauth/api_key or provider-route cross-fallback.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-020
- MGAC-022
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med13_non_cursor_route_auth_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED13
- non-Cursor
- media.generate
- requested/effective Gemini auth/account resolution
- oauth
- api_key
- MUST NOT silently cross-fallback
negative_constraints:
- Explicit oauth and explicit api_key requests MUST NOT silently cross-fallback to the other auth surface.
- Explicit provider/media-route requests MUST NOT silently cross-fallback to another provider.
compatibility_only_notes:
- The exact phrase "requested/effective Gemini auth/account resolution" is retained only as source-lineage.
stale_retired_dispositions:
- Gemini-default auth resolution for non-Cursor media is retired.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-081 - AC-MED13A Route Dependent Media Disclosure

```yaml
plan_unit_id: MGAC-081
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED13A requires media availability, usage/quota disclosure, and account/plan UI to stay route-dependent and not collapse provider/media routes into a stale mixed-account bucket. Gemini Direct remains a route-specific provider where verified; Gemini CLI, Gemini CLI OAuth, Google/Vertex Gemini CLI rows, and Nanobanana remain retired/source-lineage only.
gui_related: true
gui_classification_reason: The unit defines a testable GUI-facing capability picker, UI copy, accessibility, or account-plan presentation criterion.
split_recommended: true
depends_on:
- MGAC-020
- MGAC-021
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med13a_route_dependent_media_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED13A
- Gemini Direct
- key-only/API-key-backed
- Gemini CLI OAuth
- API-key
- Google/Vertex rows
- UI MUST NOT collapse
- stale-canon mixed-account bucket
negative_constraints:
- UI MUST NOT collapse route-dependent media rows into one stale-canon mixed-account bucket.
- UI MUST NOT surface retired Gemini CLI rows as active media setup.
compatibility_only_notes:
- Gemini CLI OAuth, Google/Vertex rows, and stale-canon mixed-account wording are retained only as source-lineage.
stale_retired_dispositions:
- Legacy shorthand that treats Gemini as one mixed-account provider is stale canon.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-082 - AC-MED14 Artifact Response Storage

```yaml
plan_unit_id: MGAC-082
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED14 requires media.generate artifacts to be written under .puppet-master/artifacts/media/<request_id>/output_000.<ext>, with co-located manifest.json artifact fields and no inline data_uri response field.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-025
- MGAC-026
- MGAC-027
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med14_artifact_response_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED14
- .puppet-master/artifacts/media/<request_id>/output_000.<ext>
- manifest.json
- artifact_id
- kind
- mime
- artifact://
- sha256
- bytes
- meta
- data_uri
negative_constraints:
- No inline data_uri field is permitted in the response.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-083 - AC-MED15 Stable Error Code Acceptance

```yaml
plan_unit_id: MGAC-083
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED15 requires media.generate failure error.code values to be exactly the nine canonical stable error codes from section 2.6 with no ad-hoc strings.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-031
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med15_stable_error_code_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED15
- error.code
- media.generate
- nine canonical stable error codes
- §2.6
- No ad-hoc error code strings
negative_constraints:
- No ad-hoc error code strings are permitted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-084 - AC-MED16 Runtime Registry Snapshot Acceptance

```yaml
plan_unit_id: MGAC-084
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED16 requires capabilities.get to evaluate provider-tool capabilities from the current runtime registry snapshot at call time, including built-ins, enabled MCP-discovered tools, and provider-exposed active-backend tools, without stale cached enablement.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-011
- MGAC-012
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med16_runtime_registry_snapshot_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED16
- current runtime registry snapshot
- built-ins
- enabled MCP-discovered tools
- provider-exposed tools
- active backend
- MUST NOT be returned after Settings/provider changes
negative_constraints:
- Stale cached enablement MUST NOT be returned after Settings/provider changes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, ContractName:Plans/Tools.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-085 - AC-MED17 Artifact Then Manifest Durability

```yaml
plan_unit_id: MGAC-085
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED17 requires successful media.generate calls to write artifact files before manifest.json, include required manifest fields, include usage when available, and avoid manifests that claim unwritten artifacts after failed or partial requests.
gui_related: false
gui_classification_reason: The unit defines a testable acceptance criterion or contract assertion rather than direct GUI presentation.
split_recommended: true
depends_on:
- MGAC-027
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med17_artifact_then_manifest_durability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED17
- artifact files before `manifest.json`
- schema_version
- request_id
- kind
- engine
- generated_at_utc
- artifacts[]
- usage
- failed or partial request
negative_constraints:
- A failed or partial request MUST NOT leave behind a manifest that claims artifacts that were not durably written.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-086 - AC-MED18 Picker Accessibility And Refresh Acceptance

```yaml
plan_unit_id: MGAC-086
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: AC-MED18 requires the capability picker to support keyboard navigation for disabled items, expose disabled-reason text to assistive technology, keep the missing-configuration footer pinned, and refresh after capability-affecting Settings/provider changes without clearing composer text.
gui_related: true
gui_classification_reason: The unit defines a testable GUI-facing capability picker, UI copy, accessibility, or account-plan presentation criterion.
split_recommended: true
depends_on:
- MGAC-058
- MGAC-060
- MGAC-064
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: media_acceptance_criteria_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: ac_med18_picker_accessibility_and_refresh_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- AC-MED18
- keyboard navigation
- disabled items
- assistive technology
- missing-configuration footer pinned
- refresh
- without clearing existing composer text
negative_constraints:
- Refresh must not clear existing composer text.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-087 - Appendix A Slot Rule Mirror Items One Through Seven

```yaml
plan_unit_id: MGAC-087
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Appendix A mirrors slot extraction rules 1 through 7 for pre-processing, kind detection, precedence, model_override, count, aspect_ratio, and size/resolution without creating a second behavioral owner beyond the preceding MGAC slot-extraction units.
gui_related: false
gui_classification_reason: The unit defines deterministic media slot-extraction parsing behavior rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-033
- MGAC-034
- MGAC-035
- MGAC-036
- MGAC-037
- MGAC-038
- MGAC-039
- MGAC-040
- MGAC-041
- MGAC-042
- MGAC-043
- MGAC-044
- MGAC-045
- MGAC-046
- MGAC-047
- MGAC-048
- MGAC-049
- MGAC-050
- MGAC-051
- MGAC-052
- MGAC-053
- MGAC-054
- MGAC-055
- MGAC-056
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Regexes, examples, exact tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_appendix_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: appendix_a_slot_rule_mirror_items_one_through_seven
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- Appendix A. Slot extraction rules (regex-ish, deterministic)
- 1) Pre-processing
- raw
- s_lower
- Controls-block regex
- Control token gate
- 2) kind detection
- 3) Precedence
- 4) model_override
- 5) count
- 6) aspect_ratio
- 7) size/resolution
- Do not treat bare numbers as size unless they are in controls block or trailing comma controls.
- 'Envelope mapping: size_px -> size; size_k -> size (2k=2048,4k=4096,8k=8192) plus resolution token; vres -> resolution for video and MUST NOT override size_k-derived resolution for image prompts.'
negative_constraints:
- Appendix A mirror text must not create a second behavioral owner for slot extraction rules.
- Bare numbers must not be treated as size unless they are in controls block or trailing comma controls.
- vres MUST NOT override size_k-derived resolution for image prompts.
compatibility_only_notes:
- Appendix A is a compact mirror of the preceding canonical slot extraction units; preceding PlanUnits remain the implementation-oriented ownership split.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media capability, generation, deterministic slot extraction, and media UI behavior while referenced owner docs retain their ContractRef boundaries.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable concern from the large Media_Generation_and_Capabilities-S0024 source span while the residual bridge preserves the unatomized remainder.
```

### MGAC-088 - Appendix A Duration Format And TTS Voice Mirror

```yaml
plan_unit_id: MGAC-088
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Appendix A mirrors duration, format, and TTS voice extraction rules without creating a second behavioral owner beyond MGAC-049, MGAC-050, and MGAC-051.
gui_related: false
gui_classification_reason: The unit preserves deterministic Appendix A slot-extraction mirror text rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-049
- MGAC-050
- MGAC-051
- MGAC-087
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Exact regexes, tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_appendix_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: appendix_a_duration_format_voice_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- '8) duration (video/music only):'
- 'keyworded: (?i)\b(?:for|duration|length)\s*(?P<secs>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b'
- 'bare (only in controls block or trailing controls): (?i)\b(?P<secs2>\d{1,3}(?:\.\d+)?)\s*(?:s|sec|secs)\b'
- '9) format: (?i)\b(?:format|output|export|as)\s*[:=]?\s*(?P<fmt>png|jpg|jpeg|webp|gif|mp4|mov|wav|mp3|flac|pcm16)\b'
- '10) voice (tts):'
- 'voice id: (?i)\bvoice\s*[:=]\s*(?P<voice>[a-z0-9][a-z0-9 _\-]{0,32})\b'
- 'voice style: (?i)\bin\s+a[n]?\s+(?P<voice_style>[^,.;]{1,40})\s+voice\b'
negative_constraints:
- Appendix A mirror text must not create a second behavioral owner for slot extraction rules.
compatibility_only_notes:
- Appendix A is a compact mirror of the preceding canonical slot extraction units; the referenced MGAC dependencies remain the implementation-oriented ownership split.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media slot extraction and media capability behavior; Appendix A mirror units must not create a second behavioral owner beyond the corresponding implementation-oriented MGAC PlanUnits.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable Appendix A mirror concern from the final Media_Generation_and_Capabilities-S0024 tail.
```

### MGAC-089 - Appendix A Quality Seed And BPM Mirror

```yaml
plan_unit_id: MGAC-089
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Appendix A mirrors quality, seed, and bpm extraction, including the guard that bare descriptive adjectives in the creative prompt must not set quality, while implementation ownership remains with MGAC-052, MGAC-053, and MGAC-054.
gui_related: false
gui_classification_reason: The unit preserves deterministic Appendix A slot-extraction mirror text rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-052
- MGAC-053
- MGAC-054
- MGAC-087
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Exact regexes, tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_appendix_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: appendix_a_quality_seed_bpm_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- '11) quality: (?i)\b(?P<qual>draft|standard|high)\b optional phrase mapping. Guard: set only when in controls block or quality-keyword phrase; bare descriptive adjectives in creative prompt MUST NOT set quality.'
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
- '12) seed: (?i)\bseed\s*[:=]?\s*(?P<seed>\d{1,10})\b'
- '13) bpm: (?i)\b(?P<bpm>\d{2,3})\s*bpm\b|\bbpm\s*[:=]\s*(?P<bpm2>\d{2,3})\b'
- bare descriptive adjectives in creative prompt MUST NOT set quality
negative_constraints:
- Appendix A mirror text must not create a second behavioral owner for slot extraction rules.
- Bare descriptive adjectives in the creative prompt MUST NOT set quality.
compatibility_only_notes:
- Appendix A is a compact mirror of the preceding canonical slot extraction units; the referenced MGAC dependencies remain the implementation-oriented ownership split.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media slot extraction and media capability behavior; Appendix A mirror units must not create a second behavioral owner beyond the corresponding implementation-oriented MGAC PlanUnits.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: This unit covers one separable Appendix A mirror concern from the final Media_Generation_and_Capabilities-S0024 tail.
```

### MGAC-090 - Appendix A Negative Prompt Mirror

```yaml
plan_unit_id: MGAC-090
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: Appendix A mirrors negative_prompt extraction, explicit negative prompt parsing, avoid-clause collection, and explicit-plus-avoid dedupe preserving order, while implementation ownership remains with MGAC-055.
gui_related: false
gui_classification_reason: The unit preserves deterministic Appendix A slot-extraction mirror text rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-055
- MGAC-087
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Exact regexes, tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_appendix_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: appendix_a_negative_prompt_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- '14) negative_prompt:'
- 'explicit: (?is)\bnegative\s+prompt\s*[:=]\s*(?P<neg>"[^"]{1,200}"|\''[^\'']{1,200}\''|[^,;\n]{1,200})'
- 'avoid-clauses (collect all): (?is)\b(?:without|no|avoid)\s+(?P<avoid>[^,.;\n]{1,80})'
- Combine explicit + avoid list (dedupe preserve order).
- negative_prompt
- dedupe preserve order
negative_constraints:
- Appendix A mirror text must not create a second behavioral owner for slot extraction rules.
compatibility_only_notes:
- Appendix A is a compact mirror of the preceding canonical slot extraction units; the referenced MGAC dependencies remain the implementation-oriented ownership split.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media slot extraction and media capability behavior; Appendix A mirror units must not create a second behavioral owner beyond the corresponding implementation-oriented MGAC PlanUnits.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable Appendix A mirror concern from the final Media_Generation_and_Capabilities-S0024 tail.
```

### MGAC-091 - Appendix A Prompt Cleaning Mirror

```yaml
plan_unit_id: MGAC-091
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: 'Appendix A mirrors prompt cleaning after slot extraction: remove controls blocks and only matched control-keyword spans while preserving the remaining creative prompt, with implementation ownership remaining with MGAC-056.'
gui_related: false
gui_classification_reason: The unit preserves deterministic Appendix A slot-extraction mirror text rather than GUI presentation.
split_recommended: true
depends_on:
- MGAC-056
- MGAC-087
- MGAC-090
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this MGAC PlanUnit instead of broad MGAC-001 source-preserving coverage.
- Exact regexes, tokens, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_appendix_drift
reasoning_tier: standard
context_scope: media_generation_capabilities_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: appendix_a_prompt_cleaning_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- '15) prompt cleaning:'
- 'If controls block present: remove it.'
- Remove only matched spans introduced by control keywords (using/model/size/aspect/etc).
- Preserve remaining text as the creative prompt.
- controls block
- creative prompt
negative_constraints:
- Appendix A mirror text must not create a second behavioral owner for slot extraction rules.
- Prompt cleaning must preserve remaining text as the creative prompt.
compatibility_only_notes:
- Appendix A is a compact mirror of the preceding canonical slot extraction units; the referenced MGAC dependencies remain the implementation-oriented ownership split.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md owns media slot extraction and media capability behavior; Appendix A mirror units must not create a second behavioral owner beyond the corresponding implementation-oriented MGAC PlanUnits.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers one separable Appendix A mirror concern from the final Media_Generation_and_Capabilities-S0024 tail.
```

### MGAC-001 - Media Generation Retired Source-Preserving Bridge

```yaml
plan_unit_id: MGAC-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: MGAC-001 is retained only as retired migration-lineage compatibility after Phase 2B batch 091 fully handled Media_Generation_and_Capabilities-S0024 with MGAC-043 through MGAC-091 plus structural/reference dispositions. It must not re-own product behavior or broad source-preserving implementation coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility, not GUI/product behavior; GUI-related source content is carried by the fine-grained MGAC PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- MGAC-043
- MGAC-044
- MGAC-045
- MGAC-046
- MGAC-047
- MGAC-048
- MGAC-049
- MGAC-050
- MGAC-051
- MGAC-052
- MGAC-053
- MGAC-054
- MGAC-055
- MGAC-056
- MGAC-057
- MGAC-058
- MGAC-059
- MGAC-060
- MGAC-061
- MGAC-062
- MGAC-063
- MGAC-064
- MGAC-065
- MGAC-066
- MGAC-067
- MGAC-068
- MGAC-069
- MGAC-070
- MGAC-071
- MGAC-072
- MGAC-073
- MGAC-074
- MGAC-075
- MGAC-076
- MGAC-077
- MGAC-078
- MGAC-079
- MGAC-080
- MGAC-081
- MGAC-082
- MGAC-083
- MGAC-084
- MGAC-085
- MGAC-086
- MGAC-087
- MGAC-088
- MGAC-089
- MGAC-090
- MGAC-091
unblocks: []
acceptance_criteria:
- MGAC-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 091.
- Media_Generation_and_Capabilities-S0024 product coverage is owned by MGAC-043 through MGAC-091 or explicit structural/reference dispositions.
- MGAC-001 remains only to preserve migration lineage for the former source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this retired bridge.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Media_Generation_and_Capabilities-S0024
preserved_exact_tokens:
- MGAC-001
- Media Generation Residual Source-Preserving Bridge
- References
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- source_preserving_bridge_retired
negative_constraints:
- MGAC-001 must not re-own Media_Generation_and_Capabilities-S0001 through S0024 after Phase 2B batch 091.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- MGAC-001 is compatibility-only migration lineage for the retired source-preserving bridge.
- The original source text remains auditably preserved by span_map, coverage_map, and the fine-grained MGAC PlanUnits.
stale_retired_dispositions:
- The former broad source-preserving bridge is retired; product behavior is carried by fine-grained MGAC PlanUnits.
owner_boundary_notes:
- Plans/Media_Generation_and_Capabilities.md remains owner for media/capability behavior while referenced owner docs keep their ContractRef boundaries; MGAC-001 no longer owns product behavior.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
preserved_contractrefs:
- 'ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2'
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: No split remains for the retired bridge; product coverage has been atomized or structurally dispositioned.
```
## Migration Coverage

Original hash: `14a92c4cc13c1644eeaf07ae7f8bbd5456dc3b74ff01372617552515b55e251f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 088 atomized `Media_Generation_and_Capabilities-S0001`, `Media_Generation_and_Capabilities-S0002`, `Media_Generation_and_Capabilities-S0005` through `Media_Generation_and_Capabilities-S0012`, and `Media_Generation_and_Capabilities-S0014` through `Media_Generation_and_Capabilities-S0020` into `MGAC-002` through `MGAC-032`, with `Media_Generation_and_Capabilities-S0003`, `S0004`, and `S0013` structurally or reference dispositioned. Phase 2B batch 089 atomized `Media_Generation_and_Capabilities-S0021` through `Media_Generation_and_Capabilities-S0023` into `MGAC-033` through `MGAC-042`. Phase 2B batch 090 partially atomized `Media_Generation_and_Capabilities-S0024` source lines 444-842 into `MGAC-043` through `MGAC-087`. Phase 2B batch 091 atomized the remaining S0024 Appendix A tail into `MGAC-088` through `MGAC-091`, structurally/reference dispositioned References, Owner / Consumer Map, PlanUnits, and Migration Coverage, and retired `MGAC-001` as compatibility-only migration lineage. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-002

### MGAC-092 - Capability Usability State Semantics

```yaml
plan_unit_id: MGAC-092
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  Capability responses must expose separate `enabled_on_instance` and `usable_now` fields plus
  `caller_scope`, `execution_role`, and identity disclosure level. A capability can be
  `enabled_on_instance` while not `usable_now` for the invoking runtime identity because of actor,
  account, lane, execution_role, mode, provider health, permission, quota, or degraded-state inputs.
  When a capability is visible but not currently usable, `capabilities.get` must return
  `blocked_reason`, `caller_scope`, `execution_role`, identity disclosure level, and evaluated
  caller/runtime identity rather than flattening availability to a global enabled flag.
gui_related: false
gui_classification_reason: Capability state and caller/runtime identity semantics are backend/runtime contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - Capability payloads distinguish `enabled_on_instance` from `usable_now`.
  - When visible but not currently usable, payloads include `blocked_reason`, `caller_scope`, `execution_role`, identity disclosure level, runtime identity, and requested/effective identity.
  - Provider, agent-rules, and Skills consumers cannot infer `usable_now` from `enabled_on_instance` or a global provider flag alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: capability_availability_drift
reasoning_tier: high
context_scope: capability_usability_semantics
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/agent-rules-context.md, Plans/Skills_System.md, Plans/Provider_OpenCode.md]
node_compile_hint: {mode: capability_usability_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0036
  - pldg-20260614-002-part-3-fable-cleanup:atom-0050
preserved_exact_tokens: ["enabled_on_instance", "usable_now", "blocked_reason", "caller_scope", "execution_role", "identity disclosure level", "visible but not currently usable", "capabilities.get"]
negative_constraints:
  - Do not infer `usable_now` from `enabled_on_instance`.
  - Do not expose a visible but not currently usable capability without `blocked_reason`, `caller_scope`, `execution_role`, and identity disclosure level.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/agent-rules-context.md, Plans/Skills_System.md]
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### MGAC-093 - Planning Visual Reference Artifact Consumers

```yaml
plan_unit_id: MGAC-093
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: 'Planning topics may accept uploaded reference images and generate wireframes, architecture diagrams, data-flow diagrams, state diagrams, or visual references through the existing image system, with artifact IDs, provenance, topic links, version, and status.'
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
- Plans/Media_Generation_and_Capabilities.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0065
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0065
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- uploaded reference image
- generated reference image
negative_constraints: []
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Project_Output_Artifacts.md
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### MGAC-099 - Vision Bridge Media Capability Eligibility

```yaml
plan_unit_id: MGAC-099
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The PM-native vision bridge uses current route-specific media capability truth. Models with reliable
  native image input do not need bridge fallback; models without image input may use the PM vision_bridge / see_image
  capability when policy, permissions, and provider availability allow. Media input, image input, generated-media
  output, and image generation remain separate capabilities. OpenCode defaults such as opencode-go, minimax-m3,
  mimo-v2.5-free, OpenCode auth.json, OpenCode DB, Bun, or OpenCode CLI behavior are source-lineage only and not
  PM defaults.
gui_related: true
gui_classification_reason: Image input/media capability truth affects user-visible image/screenshot handling and
  model route availability.
depends_on:
- MS-116
unblocks:
- PP-055
- ATS-013
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: media_capability_route_drift
reasoning_tier: high
context_scope: vision_bridge_media_capability
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- future provider/model capability matrix
node_compile_hint:
  mode: vision_media_capability_truth
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0072
- pldg-20260626-001-feature-name:atom-0074
- pldg-20260626-001-feature-name:atom-0087
- chat:opencode-see-image-request
- Plans/Provider_OpenCode.md
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- Plans/Media_Generation_and_Capabilities.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Models_System.md
source_atom_ids:
- atom-0069
- atom-0072
- atom-0074
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- opencode-see-image
- see_image
- models models without vision
- adopt it to PM
- image
- screenshot
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
- provider/model capability matrix
- project/account policy
- media_input
- image input
- support-state
- opencode-go
- mimo-v2.5-free
- 2. yes
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
- 'yes'
negative_constraints:
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not make OpenCode the owner of PM media tools.
- Do not use OpenCode provider capability reporting as a substitute for PM-native media capability records.
- Do not introduce a provider-specific dependency where a PM-native tool/capability can serve all provider routes.
- Do not hardcode OpenCode `opencode-go` or `mimo-v2.5-free` as PM's bridge defaults.
- Do not flatten route-specific media state into a single provider-level boolean.
- Do not clear a route as vision-capable without current provider/model capability evidence.
- Do not depend on OpenCode `auth.json`, OpenCode DB, Bun, or OpenCode CLI dependency for PM bridge routing.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### MGAC-100 - P0-MULTIMODAL-INPUT-SETTLEMENT

```yaml
plan_unit_id: MGAC-100
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: "P0-MULTIMODAL-INPUT-SETTLEMENT (P0) is compiled as canonical Puppet Master intent for Vision/multimodal input admission and fallback: Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images. The preserved PM gap/delta is: PM\u2019s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context. The observed external-repo signal remains source-lineage evidence: OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format\
  \ gaps. Codex IDE officially supports image generation/editing and model/context surfaces."
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Text-only model + image file yields denied_or_captioned, never hidden prompt bloat.
- Wrong MIME is blocked before provider request.
- Vision-capable custom provider must prove modality support or fall back.
- GUI can show original artifact and caption/fallback provenance.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Text-only model + image file yields denied_or_captioned, never hidden prompt bloat.
- Wrong MIME is blocked before provider request.
- Vision-capable custom provider must prove modality support or fall back.
- GUI can show original artifact and caption/fallback provenance.
risk_class: p0_multimodal_and_attachments_hardening
reasoning_tier: high
context_scope: multimodal_and_attachments
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p0_multimodal_input_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0063
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0063
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0059/P0-MULTIMODAL-INPUT-SETTLEMENT@line=59
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0059/P0-MULTIMODAL-INPUT-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0063
external_atom_id: extrepo-20260703-0059
source_row_id: P0-MULTIMODAL-INPUT-SETTLEMENT
priority: P0
finding_family: Vision/multimodal input admission and fallback
source_repos:
- OpenCode
- Cline
- Codex
- Pi
target_docs:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0059
- P0-MULTIMODAL-INPUT-SETTLEMENT
- P0
- Vision/multimodal input admission and fallback
- OpenCode
- Cline
- Codex
- Pi
negative_constraints: []
observed_signal: OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format gaps. Codex IDE officially supports image generation/editing and model/context surfaces.
pm_current_coverage: Media_Generation_and_Capabilities has media route taxonomy, capability telemetry, Vision Bridge eligibility, media tool contracts, and no-stale capability cache. Models_System also has Vision Bridge requested/effective route resolution.
pm_gap_or_delta: "PM\u2019s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context."
proposal_or_recommendation: 'Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images.'
compile_disposition: create_new_planunit
```

### MGAC-101 - P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY

```yaml
plan_unit_id: MGAC-101
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY (P1) is compiled as canonical Puppet Master intent for Fallback captioning/OCR/transcription as explicit route: Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure. The preserved PM gap/delta is: Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image. The observed external-repo signal remains source-lineage evidence: OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- "Non-vision model with image shows \u201Ccaption fallback used,\u201D with caption artifact and cost."
- User can disable fallback.
- Provider request receipt says selected model saw text caption only.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- "Non-vision model with image shows \u201Ccaption fallback used,\u201D with caption artifact and cost."
- User can disable fallback.
- Provider request receipt says selected model saw text caption only.
risk_class: p1_security_release_supply_chain_hardening
reasoning_tier: standard
context_scope: security_release_supply_chain
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
node_compile_hint:
  mode: p1_multimodal_fallback_transcription_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0074
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0074
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0070/P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY@line=70
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0070/P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:16
source_atom_ids:
- atom-0074
external_atom_id: extrepo-20260703-0070
source_row_id: P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
priority: P1
finding_family: Fallback captioning/OCR/transcription as explicit route
source_repos:
- OpenCode
- Cline
- Codex
target_docs:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/usage-feature.md
preserved_exact_tokens:
- extrepo-20260703-0070
- P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY
- P1
- Fallback captioning/OCR/transcription as explicit route
- OpenCode
- Cline
- Codex
negative_constraints: []
observed_signal: OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.
pm_current_coverage: Vision Bridge/media routes exist, but fallback captioning should be governed separately from native vision.
pm_gap_or_delta: Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image.
proposal_or_recommendation: 'Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure.'
compile_disposition: create_new_planunit
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 221` (repaired; source line 807; `sfk-0e2141b9b0c0a396ca9edbe4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L309-320,960,4955 vs L1338: canonical disabled_reason enum is locked to exactly 6 values, but AC-MED05/MGAC-072 use `UNSUPPORTED`/`CAPABILITY_GATED`, which are in neither the 6-value nor the 9-value error enum FIX: either add these to the canonical set or rewrite t
- `registry_line 222` (repaired; source line 808; `sfk-9096d5fb0ad91eab90349459`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [CRITICAL] L4348,L6348 ("verified generated-media route"): term used repeatedly (MGAC-061/069/070/071/072/080) to gate Cursor image generation, but the actual mechanism what API/field is checked, cache/refresh cadence is never defined anywhere in the audited range.
- `registry_line 223` (explicitly_deferred; source line 809; `sfk-16775ce1b7adcde8ad6dfc09`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [CRITICAL] L6400-6566 (MGAC-100/101): MultimodalInputSettlement and MediaFallbackCaptionPolicy introduce substantial new data models as bullet field-name lists only no types, no state machine, no wire format, no relationship to the existing media.generate envelope.
- `registry_line 224` (repaired; source line 810; `sfk-471e24039fccbc4a5c93be12`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L621-805,672,1047-1048: regex patterns for prompt-slot extraction use lookahead `(?<!\w)`/`(?=...)` Rust's `regex` crate does not support lookaround FIX: name the actual regex engine/crate or rewrite patterns.
- `registry_line 225` (explicitly_deferred; source line 811; `sfk-51d25f29a6483ed03b2d37ee`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L444-491: media routing through `generated_media_routes[]` has no data model given anywhere no schema for what a provider/model "row" is or how routes are structured, unlike other sections with JSON examples.
- `registry_line 226` (repaired; source line 812; `sfk-0e31f0bda37f67384914506e`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L536: tie-break rule for selecting among multiple eligible routing rows is unspecified (first-match vs. best-match).
- `registry_line 227` (repaired; source line 813; `sfk-a8643ebdc180e70129845574`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L557: no cleanup spec for partially-written artifact files when persistence fails after partial provider output.
- `registry_line 228` (repaired; source line 814; `sfk-0b546445c5d3ef1bb06fbb6b`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4348-4398,4642-4833 (MGAC-061/069/070): Cursor image-generation enabled-by-default status contradicts itself across units canonical_text says "enabled" while compatibility notes call the same phrase "retired," and the BACKEND_UNSUPPORTED canned copy assumes image is a
- `registry_line 229` (repaired; source line 815; `sfk-630846b9ddd63d7134647a05`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L4241-4287,4607-4668 (MGAC-059/066): footer copy for "no eligible media route" must not imply AI Studio/Gemini exclusivity, but no actual replacement copy string is supplied anywhere a UI-copy requirement with no literal string, i.e., a stub disguised as a spec.
- `registry_line 230` (repaired; source line 816; `sfk-4d2d4aeb7ece07e774b2d3b8`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1007,5483 (AC-MED14/MGAC-082): multi-artifact numbering scheme (`output_000`, `output_001`...) for count>1 requests is never confirmed is padding fixed at 3 digits or scaled?

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
