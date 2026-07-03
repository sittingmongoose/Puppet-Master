# Shard 004: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L83-L374

Source SHA256: `621a31bac4f76266240013ce9e5ae999ab244d42938bfb3439e5ae5afc84f08f`

---

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
