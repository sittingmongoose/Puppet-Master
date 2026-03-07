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
      "setup_hint": "Add a Google Gemini API key in Settings → Gemini Provider."
    }
  ]
}
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
| `NOT_CONFIGURED` | Required provider configuration is missing (e.g., no Google Gemini API key). |
| `MODEL_UNAVAILABLE` | The requested or configured model is not available with the current API key or provider setup. |
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

The **Assistant** and **Interviewer** personas MUST call `capabilities.get` when the user asks about available capabilities, features, or what Puppet Master can do. When Assistant is operating in the **Requirements Doc Builder** workflow, the same requirement applies. The response is used to give the user an accurate, real-time answer about what is enabled and what is not (with reasons and setup guidance).

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

**Cursor backend special case:**
- When the active backend is Cursor **and** `kind=image`: route via Cursor-native image generation. No Google API key is required.
- When the active backend is Cursor **and** `kind` is `video`, `tts`, or `music`: the capability is disabled with `disabled_reason: BACKEND_UNSUPPORTED`.

**All non-Cursor backends:**
- All media kinds (`image`, `video`, `tts`, `music`) use the **Gemini media APIs** with the configured Google Gemini API key.
- If no Google Gemini API key is configured, media capabilities are disabled with `disabled_reason: NOT_CONFIGURED`.

ContractRef: ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§2

### 2.5 Response shape

```json
{
  "success": true,
  "request_id": "req_20260301_a1b2c3d4",
  "kind": "image",
  "engine": {
    "backend": "gemini_api"
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
    "estimated_cost_usd": 0.003,
    "input_tokens": 42,
    "output_tokens": 0,
    "media_units": 1
  },
  "error": null
}
```

Response fields:
- `request_id` (string, required): unique opaque ID for this generation request.
- `engine.backend` (string, required): one of `gemini_api` | `cursor_native`.
- `artifacts[]` (array, required on success): each item contains:
  - `artifact_id` (string): unique artifact identifier.
  - `kind` (string): media kind that was generated.
  - `mime` (string): MIME type (e.g., `image/png`, `video/mp4`, `audio/wav`).
  - `uri` (string): `artifact://` path relative to `.puppet-master/artifacts/media/<request_id>/`.
  - `sha256` (string): hex-encoded SHA-256 of the artifact bytes.
  - `bytes` (integer): artifact file size in bytes.
  - `meta` (object): kind-specific metadata — `w`/`h` for images/video, `duration` for video/audio, `sample_rate` for audio, plus `model_used`, `seed`, `generation_time_ms`.
- `usage` (object, required): `estimated_cost_usd` (f64, explicitly an estimate), plus optional local counters (`input_tokens`, `output_tokens`, `media_units`).
- `error` (object | null): present on failure (see §2.6).

**Deterministic artifact layout:** Generated artifacts are written to `.puppet-master/artifacts/media/<request_id>/output_000.<ext>` (zero-padded index). A `manifest.json` is co-located alongside artifacts in the same directory, containing the full `artifacts[]` array plus `request_id` and generation metadata, enabling offline re-verification. No inline `data_uri` is returned.

**Manifest contract and write ordering:** `manifest.json` MUST be a durable, self-sufficient index for the request directory and include at minimum: `schema_version`, `request_id`, `kind`, `engine`, `generated_at_utc`, `artifacts[]`, and `usage` (when available). Implementations MUST write artifact files first, compute hashes/bytes from the final bytes on disk, and only then write `manifest.json`. If the provider returns partial output and final artifact persistence fails, the call returns failure and MUST NOT leave a manifest claiming success for missing artifacts.

ContractRef: ToolID:media.generate, SchemaID:pm.media.generate.result.v1, Primitive:ArtifactStore

**Concurrent requests:** Multiple `media.generate` calls may execute concurrently as long as each uses its own `request_id` directory. No request may append into another request's directory. Retry behavior MUST allocate a new `request_id` rather than mutating a previous manifest in place.

ContractRef: ToolID:media.generate, Primitive:ArtifactStore

**Cursor special-case:** When `engine.backend = "cursor_native"`, Cursor routes `kind=image` to Cursor-native image generation without requiring a Google API key. For `kind` ∈ {`video`, `tts`, `music`}, the Cursor backend returns `error.code = "BACKEND_UNSUPPORTED"`.

On failure:
```json
{
  "success": false,
  "request_id": "req_20260301_a1b2c3d4",
  "kind": "image",
  "engine": {
    "backend": "gemini_api"
  },
  "artifacts": [],
  "usage": null,
  "error": {
    "code": "NOT_CONFIGURED",
    "message": "This feature requires a free or paid Google API Key. Add one in Settings → Gemini Provider (Get API key), then try again."
  }
}
```

### 2.6 Stable error codes

The `error.code` field MUST be exactly one of the following canonical values:

ContractRef: ToolID:media.generate, PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md

| Code | When |
|------|------|
| `NOT_CONFIGURED` | Required provider configuration is missing (e.g., no Google Gemini API key). |
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

When any media capability requires a Google API key that is not configured, the dropdown footer displays a banner/footnote with exactly this text:

> **"Please provide a free or paid Google API Key."** [Get API key]

The "Get API key" text is a clickable link directing the user to the Google AI Studio API key page.

When multiple visible capabilities are disabled for the same missing-key reason, show the footer banner once and keep it pinned at the bottom of the dropdown while the list scrolls. The banner is supplemental guidance; per-item disabled reasons remain visible on hover/focus.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

### 4.4 Cursor backend behavior

When the active backend is Cursor:
- **Image** is **enabled** without requiring a Google API key (routes via Cursor-native generation per §2.4).
- **Video**, **TTS**, and **Music** are **disabled** with `disabled_reason: BACKEND_UNSUPPORTED`.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md

### 4.5 Click behavior

Clicking an **enabled** capability item inserts a pre-authored assistant prompt into the chat composer. The prompt guides the user to describe their generation request with relevant parameters. See §5 for the exact prompt strings per capability.

### 4.6 Per-message model override example

A user may specify a per-message model override inline in their prompt. For example:

> "Generate an image of a sunset over mountains using Nano Banana Pro"

This triggers the `model_override` slot extraction (§3.4). The model `Nano Banana Pro` is resolved via alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. The override applies only to this single generation request and does not change the model configured in Settings.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID

### 4.7 Runtime refresh behavior

The capability picker refreshes after Settings or provider-state changes that affect capability evaluation (for example, saving a Google API key, toggling a media capability off, switching providers, or recovering an MCP/provider bridge). Refresh MUST preserve composer text already typed by the user; only the picker contents and footer/banner state are recalculated.

ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md

---

<a id="5"></a>
<a id="UI-COPY"></a>
## 5. UI copy strings

The following strings are the canonical verbatim copy for media UI surfaces.

### 5.1 Capability click prompts

**Image click prompt:**
> “What image are we generating? Describe the subject, style, and optionally aspect ratio (1:1, 16:9), size (1024, 2048), and how many variations you want.”

**Video click prompt:**
> “What video are we generating? Describe the scene, camera/style, duration, and aspect ratio/resolution if you have a preference.”

**TTS click prompt:**
> “What text should I speak, and what voice/style should it use? You can also choose output format (WAV/MP3) if available.”

**Music click prompt:**
> “What music are we generating? Share genre, mood, tempo (BPM), and duration. If you want, mention instruments or references.”

ContractRef: ToolID:capabilities.get, Invariant:INV-003

### 5.2 Disabled-reason messages

**Not configured reason (`NOT_CONFIGURED`):**
> “This feature requires a free or paid Google API Key. Add one in Settings → Gemini Provider (Get API key), then try again.”

**Model unavailable reason (`MODEL_UNAVAILABLE`):**
> “That model isn’t available with the current API key (or it’s not enabled). Pick a different model in Settings, or ask ‘What models are available?’”

**Admin disabled reason (`ADMIN_DISABLED`):**
> “This feature is disabled in Settings. Enable it under Media settings, then try again.”

**Backend unsupported reason (`BACKEND_UNSUPPORTED`):**
> “The current backend supports Image Generation only. To use Video/TTS/Music, add a Google API Key and use a non-Cursor backend for media generation.”

**Rate limited reason (`RATE_LIMITED`):**
> “This feature is temporarily rate-limited. Wait a moment and try again.”

**Quota exceeded reason (`QUOTA_EXCEEDED`):**
> “API quota for this feature has been exhausted. Check your provider usage dashboard or wait for quota to reset.”

ContractRef: ToolID:capabilities.get, Invariant:INV-003

---

<a id="6"></a>
<a id="ACCEPTANCE"></a>
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
**AC-MED03:** When the active backend is Cursor and no Google API key is configured, `media.image` MUST be enabled (routed via Cursor-native generation) and `media.video`, `media.tts`, `media.music` MUST be disabled with `BACKEND_UNSUPPORTED`.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md

<a id="AC-MED03A"></a>
**AC-MED03A:** When the active backend is Cursor and a valid Google Gemini API key is configured, `media.image` MUST remain enabled via Cursor-native generation and `media.video`, `media.tts`, `media.music` MUST remain disabled with `BACKEND_UNSUPPORTED`.

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md

<a id="AC-MED04"></a>
**AC-MED04:** When the active backend is non-Cursor and a valid Google Gemini API key is configured, each media capability (`media.image`, `media.video`, `media.tts`, `media.music`) is eligible for enablement and routes through the Gemini media APIs, **subject to**: (a) the per-capability Settings > Media toggle (if toggled OFF → `ADMIN_DISABLED`), and (b) the underlying model being available for that kind (if unavailable → `MODEL_UNAVAILABLE`). A configured key alone does NOT guarantee all four are enabled.

ContractRef: ToolID:capabilities.get, ToolID:media.generate

<a id="AC-MED05"></a>
**AC-MED05:** When the active backend is non-Cursor and no Google Gemini API key is configured, all four media capabilities MUST be disabled with `NOT_CONFIGURED`.

ContractRef: ToolID:capabilities.get, ToolID:media.generate

<a id="AC-MED06"></a>
**AC-MED06:** The `model_override` field in `media.generate` MUST resolve via alias → exact model id → exact displayName → else `MODEL_UNAVAILABLE`. The override MUST NOT change the persistent model in Settings.

ContractRef: ToolID:media.generate, ContractName:Plans/Models_System.md#MODEL-ID

<a id="AC-MED07"></a>
**AC-MED07:** The capability picker dropdown MUST display disabled capabilities as greyed-out items with a tooltip showing the appropriate disabled-reason message from §5.2.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED08"></a>
**AC-MED08:** Clicking an enabled capability in the picker MUST insert the corresponding verbatim prompt from §5.1 into the chat composer.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED09"></a>
**AC-MED09:** The Assistant and Interviewer MUST call `capabilities.get` when the user asks about capabilities or features. When Assistant is operating in the Requirements Doc Builder workflow, the same requirement applies.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Personas.md, ContractName:Plans/chain-wizard-flexibility.md

<a id="AC-MED10"></a>
**AC-MED10:** All media-generation and capability references across plan documents MUST reference `Plans/Media_Generation_and_Capabilities.md` anchors rather than restating rules (DRY).

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

<a id="AC-MED11"></a>
**AC-MED11:** When a capability is otherwise available but its Settings > Media toggle is OFF, `capabilities.get` MUST return that capability as disabled with `ADMIN_DISABLED`.

ContractRef: ToolID:capabilities.get, Invariant:INV-003

<a id="AC-MED12"></a>
**AC-MED12:** When both an infrastructure-disabled condition (`BACKEND_UNSUPPORTED`, `NOT_CONFIGURED`, `RATE_LIMITED`, or `QUOTA_EXCEEDED`) and an admin toggle disable are simultaneously true, `capabilities.get` MUST return the infrastructure-disabled reason based on the precedence in §1.4 (not `ADMIN_DISABLED`).

ContractRef: ToolID:capabilities.get, PolicyRule:Decision_Policy.md§2

<a id="AC-MED13"></a>
**AC-MED13:** When the active backend is Cursor, `media.generate` for `kind=image` MUST route via Cursor-native image generation (no Google API key required) and MUST NOT fall through to the Gemini media API path. For `kind` ∈ {`video`, `tts`, `music`}, `media.generate` MUST return `error.code = "BACKEND_UNSUPPORTED"`.

ContractRef: ToolID:media.generate, ContractName:Plans/CLI_Bridged_Providers.md

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
**AC-MED18:** The capability picker MUST support keyboard navigation for disabled items, expose disabled-reason text to assistive technology, keep the missing-key footer pinned when applicable, and refresh after capability-affecting Settings/provider changes without clearing existing composer text.

ContractRef: ToolID:capabilities.get, Invariant:INV-003, ContractName:Plans/FinalGUISpec.md

---

<a id="APPENDIX-A"></a>
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
