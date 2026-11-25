# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6655-L6813

Source SHA256: `d630c1801fa74fb728019219efade341351e27261dbbcb3c24d3132a1529ba45`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical media/provider spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Generated Media Route Row Schema

Repairs rows `sfk-51d25f29a6483ed03b2d37ee`, `sfk-9096d5fb0ad91eab90349459`, and `sfk-0e31f0bda37f67384914506e`.

`generated_media_route` fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `route_id` | string | yes | Stable provider/account/model route id. |
| `provider_id` | string | yes | Provider owner id. |
| `account_id` | string | conditional | Required for account-bound providers. |
| `model_id` | string | yes | Requested model id. |
| `media_input_modes` | array<string> | yes | `text`, `image`, `mask`, `reference_image`, `audio`, or `video`. |
| `media_output_modes` | array<string> | yes | `image`, `video`, `audio`, `text_caption`, or `artifact_bundle`. |
| `support_state` | string | yes | `verified`, `unverified`, `capability_gated`, `disabled`, or `unsupported`. |
| `disabled_reason` | string | conditional | Required when support_state is disabled or unsupported. |
| `verification_probe_ref` | string | conditional | Required for verified routes. |
| `verified_at_utc` | string | conditional | Required for verified routes. |
| `cache_expires_at_utc` | string | conditional | Required when route verification is cached. |

Tie-break order when multiple eligible rows remain is: highest `support_state` rank (`verified`, `capability_gated`, `unverified`), then explicit user default, then lowest estimated cost, then lowest expected latency, then lexical `route_id`. First-match ordering is forbidden.

**Route verification probe (2026-11-25).** A route row becomes `support_state = verified` for one output mode only through a passed `generated_media_route_probe` for that exact row and mode. This is the "E2E generated artifact proof" the provider rows require, and it fills the CV-292 provider route support evidence envelope (`proof_kind = generated_artifact_roundtrip`, `proof_timestamp = completed_at_utc`, `verification_state = verified`). Catalog presence, an HTTP 200 model listing, image-input or API-key proof, and output routed through another provider never pass a probe.

The probe sends one `media.generate` request through the row's own `provider_id`, `account_id` and `model_id`, with `count = 1`, the smallest size the route accepts, and a §2.2 `kind` (only `image`, `video`, `tts` or `music`) chosen from the output mode by this total table:

| Probed `media_output_mode` | §2.2 `kind` sent | Fixed prompt |
| --- | --- | --- |
| `image` | `image` | `A plain red circle centered on a white background` |
| `video` | `video` | `A plain red circle moving left to right on a white background`, with the shortest `duration` the route accepts |
| `audio` | `tts` for a route that serves the §1.5 `media.tts` capability, `music` for one that serves `media.music`; a route that serves both is probed once per kind and `audio` is verified only when both pass | `Puppet Master route check.` for `tts`; `A short calm piano phrase` with the shortest `duration` the route accepts for `music` |
| `text_caption` | none | No `media.generate` probe exists, because §2.2 has no caption kind. |
| `artifact_bundle` | none | No `media.generate` probe exists, because §2.2 has no bundle kind. |

A row cannot become `verified` for `text_caption` or `artifact_bundle`; for those modes it stays `unverified` with `disabled_reason = route_unverified` (or `capability_gated` when its gate applies), and a `MediaFallbackCaptionPolicy` that names such a route still runs under its own permission, confidence and budget rules below. It passes only when the response has `success = true`, `engine.generated_media_route_id` equal to the probed `route_id`, and at least one artifact whose bytes are durable, whose `sha256` matches, whose `mime` is in the row's output mode (for `image`: `image/png`, `image/jpeg` or `image/webp`), and whose decoded `meta.w` and `meta.h` (or `meta.duration` for `tts`, `music` and `video`) are greater than zero. The probe artifact is kept only as its hash and metadata; its bytes are dropped after the check.

`verification_probe_ref` points to a record with these fields: `probe_id` (string), `route_id` (string), `provider_id` (string), `account_id` (string or null), `model_id` (string), `effective_model_id` (string), `media_output_mode` (string), `proof_kind` (`generated_artifact_roundtrip`), `result` (`passed`, `failed` or `inconclusive`), `failure_code` (a §2.6 `error.code`, or `artifact_invalid` when the provider succeeded but the artifact check failed; null when passed), `artifact_mime` (string or null), `artifact_sha256` (string or null), `artifact_w` and `artifact_h` (integer or null), `artifact_duration_s` (number or null), `capability_snapshot_ref` (string), `credential_route_epoch_id` (string), `started_at_utc` and `completed_at_utc` (RFC 3339 strings). `failed` sets the row to `support_state = unverified` with `disabled_reason = route_unverified`; `inconclusive` (timeout, `RATE_LIMITED` or `QUOTA_EXCEEDED`) leaves the previous state unchanged. A probe is never retried automatically.

Cache and refresh rule: a passed probe sets `verified_at_utc = completed_at_utc` and `cache_expires_at_utc = verified_at_utc + 7 days`. A successful real `media.generate` result through the same row and mode that meets the same artifact checks renews both timestamps. Verification ends at once, and the row returns to `unverified` with `disabled_reason = route_unverified`, when `cache_expires_at_utc` passes, when the row's `credential_route_epoch_id` or ProviderCapabilityEpoch changes, when a catalog refresh changes the row's `model_id` or moves its model out of a dispatchable `model_lifecycle_state`, or when a real request through the row returns `BACKEND_UNSUPPORTED` or `MODEL_UNAVAILABLE`. Because a probe spends provider quota, PM runs a new probe only when the person chooses the route's verify action in Settings -> Providers; capability refresh (§4.7) re-reads the cached state and never probes by itself.

### Disabled Reason Enum

Repairs row `sfk-0e2141b9b0c0a396ca9edbe4`.

Canonical `disabled_reason` values are `backend_unsupported`, `unsupported`, `capability_gated`, `missing_account`, `missing_credential`, `quota_exhausted`, `policy_disabled`, `provider_unavailable`, `route_unverified`, and `safety_blocked`. Legacy uppercase display strings may render in UI copy but must normalize to these lowercase wire values.

Scope and adapter (2026-11-25): these ten lowercase values are the closed vocabulary of the `generated_media_route.disabled_reason` column above. The sentence about normalizing uppercase strings to them is retired: the six uppercase values in §1.3 stay the only `disabled_reason` values of `capabilities.get` and the matching `media.generate` `error.code` values (§2.6, AC-MED02). Before a `capabilities.get` entry or a `media.generate` failure is built from a route row, PM maps the row's value with this total table:

| Route row `disabled_reason` | `capabilities.get` `disabled_reason` / `media.generate` `error.code` |
| --- | --- |
| `backend_unsupported` | `BACKEND_UNSUPPORTED` |
| `unsupported` | `BACKEND_UNSUPPORTED` |
| `route_unverified` | `BACKEND_UNSUPPORTED` when the unverified route belongs to the active backend (the Cursor rule and AC-MED03); `NOT_CONFIGURED` otherwise (AC-MED05) |
| `capability_gated` | `NOT_CONFIGURED`, with `setup_hint` naming the route's recovery action |
| `missing_account` | `NOT_CONFIGURED` |
| `missing_credential` | `NOT_CONFIGURED` |
| `quota_exhausted` | `QUOTA_EXCEEDED` |
| `policy_disabled` | `ADMIN_DISABLED` |
| `provider_unavailable` | `MODEL_UNAVAILABLE` |
| `safety_blocked` | `MODEL_UNAVAILABLE`, with `setup_hint` naming the blocking policy |

`RATE_LIMITED` has no route row value: it comes from live provider rate-limit state, never from a stored route row. When several route rows apply, the mapped values are reduced to one by the §1.4 precedence.

### Regex Engine Constraint For Prompt Slot Extraction

Repairs row `sfk-471e24039fccbc4a5c93be12`.

- Prompt-slot extraction uses Rust `regex` syntax only.
- Lookaround patterns such as `(?<!...)` or `(?=...)` are forbidden in canonical patterns.
- Word-boundary behavior must be expressed with explicit capture groups and boundary tokens, e.g. `(^|[^A-Za-z0-9_])\\{slot_name\\}([^A-Za-z0-9_]|$)`, with the slot captured separately from the boundary characters.
- Any future use of a different regex engine must name the crate and feature flag in this document before patterns may rely on lookaround.
- The only lookaround patterns left in this document are the two `model_override` matchers kept as source lineage in §3.4, Appendix A and MGAC-043; §3.4 gives their canonical lookaround-free replacements, and no other slot pattern uses lookaround (2026-11-25).

### Partial Artifact Cleanup

Repairs row `sfk-a8643ebdc180e70129845574`.

- Generated media persistence writes to `artifact.tmp:{artifact_id}` first and promotes to the final artifact path only after provider output, metadata, and receipt are all durable.
- On persistence failure after partial provider output, PM emits `media.artifact_cleanup_required` with `artifact_id`, `route_id`, `partial_path`, `cleanup_reason_code`, and `created_at_utc`.
- Cleanup reason codes are `provider_stream_interrupted`, `metadata_write_failed`, `receipt_write_failed`, `quota_write_failed`, and `user_cancelled_after_partial`.
- The UI must show "Cleanup required" only until the temp artifact is deleted, quarantined, or promoted with an explicit operator action.

### Cursor Image Generation Support-State Rule

Repairs row `sfk-0b546445c5d3ef1bb06fbb6b`.

Cursor image generation is not enabled by default unless a `generated_media_route` row for Cursor is `support_state = verified` or `capability_gated` with a visible recovery action. Legacy text that calls Cursor image generation "enabled" without a verified generated-media route is source-lineage only. The default visible state is `disabled_reason = route_unverified` with recovery copy pointing to provider capability verification.

### No Eligible Media Route Footer Copy

Repairs row `sfk-630846b9ddd63d7134647a05`.

Literal footer copy for no eligible route is:

`No eligible media route is available for this request. Check provider capability, account, quota, and policy settings, or choose a different model.`

This copy must not imply AI Studio, Gemini, Cursor, or any single provider is the exclusive route.

### Multi-Artifact Numbering

Repairs row `sfk-4d2d4aeb7ece07e774b2d3b8`.

For count greater than one, output artifact names use zero-padded ordinals with width `max(3, digits(count - 1))`, starting at `output_000`. Example: a count of 12 uses `output_000` through `output_011`; a count of 1200 uses four digits, `output_0000` through `output_1199`.

### Multimodal Input Settlement And Fallback Caption Policy

Repairs row `sfk-16775ce1b7adcde8ad6dfc09`.

`MultimodalInputSettlement` fields are `settlement_id`, `request_id`, `selected_route_id`, `input_artifact_refs[]`, `accepted_input_modes[]`, `rejected_input_refs[]`, `rejection_reason_codes[]`, `fallback_caption_policy_id?`, `provider_payload_ref`, `created_at_utc`, and `schema_version`.

`MediaFallbackCaptionPolicy` fields are `policy_id`, `enabled`, `fallback_provider_id`, `fallback_model_id`, `requires_user_permission`, `retain_original_artifact`, `caption_confidence_min`, `redaction_profile_id`, `cost_budget_ref?`, `latency_budget_ms?`, and `gui_disclosure_copy`.

Fallback captions are separate artifacts. The selected model receipt must state whether the model saw the original media or only the fallback text caption.

**Types, states and `media.generate` binding (2026-11-25).**

`MultimodalInputSettlement` field types:

| Field | Type | Rule |
| --- | --- | --- |
| `settlement_id` | string | Unique per settlement. |
| `request_id` | string | Equals the `media.generate` `request_id` it settles. |
| `selected_route_id` | string | The `generated_media_route.route_id` the request resolved to. |
| `input_artifact_refs[]` | array of string (`artifact://` refs) | Every input the request carried, in request order. |
| `accepted_input_modes[]` | array of string, each one of the route row's `media_input_modes` values | Modes the route took natively. |
| `rejected_input_refs[]` | array of string | Inputs the route could not take natively. |
| `rejection_reason_codes[]` | array of string, same length and order as `rejected_input_refs[]`, closed: `input_mode_unsupported`, `mime_unsupported`, `input_too_large`, `artifact_missing`, `caption_permission_denied`, `caption_low_confidence`, `caption_failed` | Why each rejected input was rejected. |
| `fallback_caption_policy_id?` | string or null | The `MediaFallbackCaptionPolicy` used; null when none applied. |
| `settlement_state` | string, closed: `pending`, `awaiting_caption_permission`, `captioning`, `settled_native`, `settled_with_captions`, `failed` | See the state table below. |
| `input_dispositions[]` | array of objects `{ input_ref: string, disposition: "native" or "caption" or "rejected", caption_artifact_ref: string or null, caption_confidence: number 0.0-1.0 or null }`, one per `input_artifact_refs[]` entry, same order | What the selected model actually received for each input. |
| `provider_payload_ref` | string | Ref to the redacted provider payload record. |
| `created_at_utc` | string (RFC 3339) | When the settlement was created. |
| `schema_version` | integer | 1 for this shape. |

`MediaFallbackCaptionPolicy` field types: `policy_id` string; `enabled` boolean; `fallback_provider_id` string; `fallback_model_id` string; `requires_user_permission` boolean, default `true`; `retain_original_artifact` boolean, default `true`; `caption_confidence_min` number from 0.0 to 1.0; `redaction_profile_id` string; `cost_budget_ref?` string or null; `latency_budget_ms?` integer greater than 0, or null; `gui_disclosure_copy` string.

Settlement states. `settled_native`, `settled_with_captions` and `failed` are terminal; generation runs only from `settled_native` or `settled_with_captions`.

| From | To | When |
| --- | --- | --- |
| `pending` | `failed` | At least one input is rejected with `mime_unsupported` or `artifact_missing`. This is checked first, before any provider request, including a caption call (MGAC-100: wrong MIME is blocked before the provider request), and no caption policy applies to these inputs. |
| `pending` | `settled_native` | Every input is accepted natively by the selected route. |
| `pending` | `awaiting_caption_permission` | At least one input is rejected, every rejected input's code is `input_mode_unsupported` or `input_too_large` (the only captionable codes), the policy is `enabled`, and `requires_user_permission = true`. |
| `pending` | `captioning` | At least one input is rejected, every rejected input's code is `input_mode_unsupported` or `input_too_large`, the policy is `enabled`, and `requires_user_permission = false`. |
| `pending` | `failed` | At least one input is rejected with a captionable code and no enabled policy applies. Inputs are never dropped silently. |
| `awaiting_caption_permission` | `captioning` | The person allows the caption for this request. |
| `awaiting_caption_permission` | `failed` | The person declines or cancels; each pending input gets `caption_permission_denied`. |
| `captioning` | `settled_with_captions` | Every rejected input has a caption artifact with `caption_confidence >= caption_confidence_min`. |
| `captioning` | `failed` | A caption call fails (`caption_failed`) or a caption is below `caption_confidence_min` (`caption_low_confidence`), or `latency_budget_ms` or the cost budget is exceeded (`caption_failed`). |

A caption call is not retried automatically; a retry is a new `media.generate` request with a new `request_id` (§2.5). A `failed` settlement ends the request with `success = false`, empty `artifacts`, and `error.code = INVALID_REQUEST` for `input_mode_unsupported`, `mime_unsupported`, `input_too_large`, `artifact_missing` or `caption_permission_denied`, or `error.code = PROVIDER_ERROR` for `caption_failed` or `caption_low_confidence`.

Wire binding to `media.generate`. The request envelope (§2.2) gains two optional fields: `input_artifact_refs` (array of `artifact://` string refs, default empty) and `fallback_caption_policy_id` (string or null, default null). The response (§2.5) gains `input_settlement`: the full `MultimodalInputSettlement` object when `input_artifact_refs` is non-empty, otherwise `null`. Both on success and on failure, the media result record in the seglog carries the same `input_settlement`. Each caption is its own artifact in the payload store and is listed only through `input_dispositions[].caption_artifact_ref`, never in `artifacts[]`. When `retain_original_artifact = true` the original input refs stay resolvable beside the captions. The receipt states that the model saw the original media for a `native` disposition and only the caption text for a `caption` disposition.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
