# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6661-L6830

Source SHA256: `d3743eb6a14a9662454b145d2d4544a8c8c2233e227fa289c1662a58dd6aacf3`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical media/provider spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Generated Media Route Row Schema

Repairs rows `sfk-51d25f29a6483ed03b2d37ee`, `sfk-9096d5fb0ad91eab90349459`, and `sfk-0e31f0bda37f67384914506e`.

`generated_media_route` fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `route_id` | string | yes | Stable provider/account/model/output-mode route id. |
| `provider_id` | string | yes | Provider owner id. |
| `account_id` | string | conditional | Required for account-bound providers. |
| `model_id` | string | yes | Requested model id. |
| `media_input_modes` | array<string> | yes | `text`, `image`, `mask`, `reference_image`, `audio`, or `video`. |
| `media_output_modes` | array<string> | yes | `image`, `video`, `audio`, `text_caption`, or `artifact_bundle`. Exactly one value per row (2026-11-26): a provider/account/model that produces several output modes has one row per mode, so `support_state`, `disabled_reason`, `verification_probe_ref`, `verified_at_utc` and `cache_expires_at_utc` always describe that one mode. |
| `support_state` | string | yes | `verified`, `unverified`, `capability_gated`, `disabled`, or `unsupported`. |
| `disabled_reason` | string | conditional | Required when support_state is disabled or unsupported. |
| `verification_probe_ref` | string | conditional | Required for verified routes. |
| `verified_at_utc` | string | conditional | Required for verified routes. |
| `cache_expires_at_utc` | string | conditional | Required when route verification is cached. |

Tie-break order when multiple eligible rows remain is: highest `support_state` rank (`verified`, `capability_gated`, `unverified`), then explicit user default, then lowest estimated cost, then lowest expected latency, then lexical `route_id`. First-match ordering is forbidden.

**Route verification probe (2026-11-25).** A route row becomes `support_state = verified` for one output mode only through a passed `generated_media_route_probe` for that exact row and mode; because each row has exactly one output mode, the row's state is that mode's state. This is the "E2E generated artifact proof" the provider rows require, and it fills the CV-292 provider route support evidence envelope (`proof_kind = generated_artifact_roundtrip`, `proof_timestamp = completed_at_utc`, `verification_state = verified`). Catalog presence, an HTTP 200 model listing, image-input or API-key proof, and output routed through another provider never pass a probe.

Probe admission (2026-11-26). The probe is a `media.generate` request whose envelope (§2.2) carries the optional field `route_verification_probe`, an object `{ probe_id: string, route_id: string, media_output_mode: string }`, default `null`. Only PM's Settings -> Providers verify action builds such a request; the agent-facing tool schema does not expose the field, and a request from any other caller that sets it fails with `INVALID_REQUEST`. A probe request is admitted to exactly the row named by `route_id` when that row's `support_state` is `unverified` or `verified` (a re-verify) and `media_output_mode` equals its output mode; for a `disabled`, `unsupported` or `capability_gated` row it fails with the row's mapped error from the disabled-reason table below and records no probe. Admission skips only the verified-route requirement: account, credential, quota, Permissions and policy checks still apply, `model_override` must be `null`, route selection, tie-break, fallback and any other route are never used, and an error from the row is the probe's result. Admission enables nothing for ordinary requests, which keep the row disabled until the probe passes.

The probe sends one `media.generate` request through the row's own `provider_id`, `account_id` and `model_id`, with `count = 1`, the smallest size the route accepts, and a §2.2 `kind` (only `image`, `video`, `tts` or `music`) chosen from the output mode by this total table:

| Probed `media_output_mode` | §2.2 `kind` sent | Fixed prompt |
| --- | --- | --- |
| `image` | `image` | `A plain red circle centered on a white background` |
| `video` | `video` | `A plain red circle moving left to right on a white background`, with the shortest `duration` the route accepts |
| `audio` | `tts` for a route that serves the §1.5 `media.tts` capability, `music` for one that serves `media.music`; a route that serves both is probed once per kind and `audio` is verified only when both pass | `Puppet Master route check.` for `tts`; `A short calm piano phrase` with the shortest `duration` the route accepts for `music` |
| `text_caption` | none | No `media.generate` probe exists, because §2.2 has no caption kind. |
| `artifact_bundle` | none | No `media.generate` probe exists, because §2.2 has no bundle kind. |

A row cannot become `verified` for `text_caption` or `artifact_bundle`; for those modes it stays `unverified` with `disabled_reason = route_unverified` (or `capability_gated` when its gate applies), and a `MediaFallbackCaptionPolicy` that names such a route still runs under its own permission, confidence and budget rules below. It passes only when the response has `success = true`, `engine.generated_media_route_id` equal to the probed `route_id`, and at least one artifact whose bytes are durable, whose `sha256` matches, whose `mime` is in the row's output mode (for `image`: `image/png`, `image/jpeg` or `image/webp`), and whose decoded `meta.w` and `meta.h` (or `meta.duration` for `tts`, `music` and `video`) are greater than zero. The probe's output is stored like every `media.generate` output, by the §2.5 deterministic artifact layout and manifest contract, and its media result record carries the same `route_verification_probe` object; the probe record points to that result by `request_id`. The result is shown only in the route's verification history in Settings -> Providers and is never attached to a chat, session or project output.

`verification_probe_ref` points to a record with these fields: `probe_id` (string), `request_id` (string, the probe's `media.generate` request), `route_id` (string), `provider_id` (string), `account_id` (string or null), `model_id` (string), `effective_model_id` (string), `media_output_mode` (string), `proof_kind` (`generated_artifact_roundtrip`), `result` (`passed`, `failed` or `inconclusive`), `failure_code` (a §2.6 `error.code`, or `artifact_invalid` when the provider succeeded but the artifact check failed; null when passed), `artifact_mime` (string or null), `artifact_sha256` (string or null), `artifact_w` and `artifact_h` (integer or null), `artifact_duration_s` (number or null), `capability_snapshot_ref` (string), `credential_route_epoch_id` (string), `started_at_utc` and `completed_at_utc` (RFC 3339 strings). `failed` sets the row to `support_state = unverified` with `disabled_reason = route_unverified`; `inconclusive` (timeout, `RATE_LIMITED` or `QUOTA_EXCEEDED`) leaves the previous state unchanged. A probe is never retried automatically.

Cache and refresh rule: a passed probe sets `verified_at_utc = completed_at_utc` and `cache_expires_at_utc = verified_at_utc + 7 days`. Only a passed probe sets or renews these timestamps and `verification_probe_ref` (DL-2602: a checked route stays trusted for 7 days and is re-checked only when the person asks); a real `media.generate` result through the row never renews them, however often the route is used. Verification ends at once, and the row returns to `unverified` with `disabled_reason = route_unverified`, when `cache_expires_at_utc` passes, when the row's `credential_route_epoch_id` or ProviderCapabilityEpoch changes, when a catalog refresh changes the row's `model_id` or moves its model out of a dispatchable `model_lifecycle_state`, or when a real request through the row returns `BACKEND_UNSUPPORTED` or `MODEL_UNAVAILABLE`. Because a probe spends provider quota, PM runs a new probe only when the person chooses the route's verify action in Settings -> Providers; capability refresh (§4.7) re-reads the cached state and never probes by itself.

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
| `requested_route_id` | string or null | The `generated_media_route.route_id` the request asked for before any fallback: the route resolved from `model_override` (§2.3), else the Settings default route for the kind. `null` only in a pre-route failure in which nothing resolved. |
| `selected_route_id` | string or null | The `generated_media_route.route_id` the request resolved to (the effective route, after any fallback); `null` only when the request failed before a route was selected (pre-route failure, below). |
| `input_artifact_refs[]` | array of string (`artifact://` refs) | Every input the request carried, in request order. |
| `accepted_input_modes[]` | array of string, each one of the route row's `media_input_modes` values | Modes the route took natively. |
| `rejected_input_refs[]` | array of string | Inputs that got a rejection code: the route could not take them natively, admission refused them, or their caption was refused or failed. |
| `rejection_reason_codes[]` | array of string, same length and order as `rejected_input_refs[]`, closed: `input_mode_unsupported`, `mime_unsupported`, `input_too_large`, `artifact_missing`, `redaction_blocked`, `caption_permission_denied`, `caption_low_confidence`, `caption_failed` | Why each rejected input was rejected. |
| `fallback_caption_policy_id?` | string or null | The `MediaFallbackCaptionPolicy` used; null when none applied. |
| `fallback_caption_route` | object `{ provider_id: string, model_id: string }` or null | The policy's `fallback_provider_id` and `fallback_model_id` copied when the settlement entered `awaiting_caption_permission` or `captioning`; `null` when no caption route was chosen. |
| `original_retained` | boolean | `false` only when a policy with `retain_original_artifact = false` applied; otherwise `true`, and every `input_artifact_refs[]` entry stays resolvable. |
| `provider_payload_shape` | string, closed: `none`, `native_media`, `caption_text`, `mixed` | What the generation request sent for the inputs: `none` when `provider_payload_ref` is `null`; `native_media` when every disposition is `native`; `caption_text` when every disposition is `caption`; `mixed` when both occur. |
| `settlement_state` | string, closed: `pending`, `awaiting_caption_permission`, `captioning`, `settled_native`, `settled_with_captions`, `failed` | See the state table below. |
| `input_dispositions[]` | array of objects, one per `input_artifact_refs[]` entry, same order; fields below the table | How each input ended. In `settled_native` and `settled_with_captions`, what the selected model actually received: `native` (the original, redacted when `redaction_state = redacted`) or `caption` (only the caption text). In a `failed` settlement after route selection, `rejected` for each input in `rejected_input_refs[]` and `not_sent` for every other input: it passed admission (or was captioned) but nothing was sent to the generation model. `not_evaluated` only in a pre-route failure. |
| `provider_payload_ref` | string or null | Ref to the redacted provider payload record; `null` when the settlement ended before any provider payload was built (a pre-route failure, or a `failed` settlement reached before the generation request). |
| `created_at_utc` | string (RFC 3339) | When the settlement was created. |
| `schema_version` | integer | 1 for this shape. |

Each `input_dispositions[]` object is closed: `input_ref` (string, the `input_artifact_refs[]` entry); `disposition` (`native`, `caption`, `rejected`, `not_sent` or `not_evaluated`); `source_surface` (the request's `input_source_surfaces[]` entry for this input); `media_type` (string or null: the input's mode from the `media_input_modes` vocabulary other than `text`, that is `image`, `mask`, `reference_image`, `audio` or `video`, or `other` for an input outside it, such as a PDF, which no route takes natively); `mime` (string or null, the MIME read from the stored bytes, which the MIME check uses); `byte_size` (integer of at least 0, or null); `redaction_state` (`not_required`, `redacted` or `withheld`, or null) and `redacted_input_ref` (string or null): the scrub PM applies to the input before it can enter any provider payload, including a caption call, under the redaction profile of the request's permission snapshot (Permissions_System PS-106 and PS-119; a caption call also applies the policy's `redaction_profile_id` to the copy it sends). `not_required` means the profile changes nothing; `redacted` means the provider receives only the scrubbed copy named by `redacted_input_ref`, the only case where that field is set; `withheld` means the profile forbids sending the input, which is rejected with `redaction_blocked`. `model_modality_support` (`supported` when the selected route row's `media_input_modes` lists `media_type`, else `unsupported`, or null); `reason_code` (the input's `rejection_reason_codes[]` value when it is in `rejected_input_refs[]`, else null); `caption_artifact_ref` (string or null) and `caption_confidence` (number 0.0-1.0 or null), set only for `caption` and for a `not_sent` input whose caption had already been made. Admission runs its checks on each input in the code order given in the state table and stops at the input's first failure, so a value that a check which never ran would supply is null: for `not_evaluated` every field except `input_ref`, `disposition` and `source_surface` is null; for `artifact_missing`, `media_type`, `mime`, `byte_size`, `model_modality_support` and both redaction fields are null; for `mime_unsupported`, both redaction fields are null. Every other input has `media_type`, `mime`, `byte_size`, `model_modality_support` and `redaction_state` set, and `redacted_input_ref` only when `redaction_state = redacted`.

How MGAC-100's settlement facts are carried: `source_surface`, `media_type`, `MIME`, `byte_size`, `redaction_state`, `model_modality_support` and `denied_reason` are the like-named `input_dispositions[]` fields (`MIME` is `mime`, `denied_reason` is `reason_code`); `artifact_ref` is `input_dispositions[].input_ref`; `requested_route` and `effective_route` are `requested_route_id` and `selected_route_id`, copied from the shared requested/effective runtime snapshot (§2.4), never a second source of truth; `fallback_caption_route` is `fallback_caption_route`; `original_retention` is `original_retained`; `provider_payload_shape` is `provider_payload_shape`, and the payload itself is `provider_payload_ref`. The per-input admission fields (`source_surface`, `media_type`, `mime`, `byte_size`, both redaction fields and `model_modality_support`) and both route ids are captured at admission and never change afterwards, on success or failure, so the settlement in the media result record is the receipt for success and failure alike.

`MediaFallbackCaptionPolicy` field types: `policy_id` string; `enabled` boolean; `fallback_provider_id` string; `fallback_model_id` string; `requires_user_permission` boolean, default `true`; `retain_original_artifact` boolean, default `true`; `caption_confidence_min` number from 0.0 to 1.0; `redaction_profile_id` string; `cost_budget_ref?` string or null; `latency_budget_ms?` integer greater than 0, or null; `gui_disclosure_copy` string.

Settlement states. `settled_native`, `settled_with_captions` and `failed` are terminal; generation runs only from `settled_native` or `settled_with_captions`.

| From | To | When |
| --- | --- | --- |
| `pending` | `failed` | At least one input is rejected with `mime_unsupported`, `artifact_missing` or `redaction_blocked`. Admission checks every input against the selected route in one pass before any provider request, including a caption call (MGAC-100: wrong MIME is blocked before the provider request); each input that fails gets the first code that applies in the order `artifact_missing`, `mime_unsupported`, `redaction_blocked`, `input_mode_unsupported`, `input_too_large`. No caption policy applies, no caption is made, and every input without a code is `not_sent`. |
| `pending` | `failed` | Pre-route failure: the request fails before a route is selected, for example `NOT_CONFIGURED` (no eligible route), `MODEL_UNAVAILABLE` or a §2.2 field other than `input_artifact_refs` and `input_source_surfaces` failing validation. No input is checked: `selected_route_id = null`, `requested_route_id` is the requested route when one resolved and otherwise `null`, `provider_payload_ref = null`, `provider_payload_shape = none`, `fallback_caption_route = null`, `original_retained = true`, `accepted_input_modes[]`, `rejected_input_refs[]` and `rejection_reason_codes[]` are empty, every `input_dispositions[]` entry is `not_evaluated`, and `error.code` is the pre-route error itself, not the settlement codes below. |
| `pending` | `settled_native` | Every input is accepted natively by the selected route. |
| `pending` | `awaiting_caption_permission` | At least one input is rejected, every rejected input's code is `input_mode_unsupported` or `input_too_large` (the only captionable codes), the policy is `enabled`, and `requires_user_permission = true`. |
| `pending` | `captioning` | At least one input is rejected, every rejected input's code is `input_mode_unsupported` or `input_too_large`, the policy is `enabled`, and `requires_user_permission = false`. |
| `pending` | `failed` | At least one input is rejected with a captionable code and no enabled policy applies. Inputs are never dropped silently; every input without a code is `not_sent`. |
| `awaiting_caption_permission` | `captioning` | The person allows the caption for this request. |
| `awaiting_caption_permission` | `failed` | The person declines or cancels; each pending input gets `caption_permission_denied`, and every input without a code is `not_sent`. |
| `captioning` | `settled_with_captions` | Every rejected input has a caption artifact with `caption_confidence >= caption_confidence_min`. |
| `captioning` | `failed` | A caption call fails (`caption_failed`) or a caption is below `caption_confidence_min` (`caption_low_confidence`), or `latency_budget_ms` or the cost budget is exceeded (`caption_failed`). The affected inputs keep `rejected` with that code; every other input, including one whose caption had already passed, is `not_sent`. |

A caption call is not retried automatically; a retry is a new `media.generate` request with a new `request_id` (§2.5). A `failed` settlement ends the request with `success = false`, empty `artifacts`, and `error.code = INVALID_REQUEST` for `input_mode_unsupported`, `mime_unsupported`, `input_too_large`, `artifact_missing`, `redaction_blocked` or `caption_permission_denied`, or `error.code = PROVIDER_ERROR` for `caption_failed` or `caption_low_confidence`.

Wire binding to `media.generate`. The request envelope (§2.2) gains three optional fields: `input_artifact_refs` (array of `artifact://` string refs, default empty), `input_source_surfaces` (array of string, same length and order as `input_artifact_refs`, each closed `file_attachment`, `clipboard_paste`, `screenshot_capture` or `existing_artifact`, set by the PM surface that added the input; when absent every entry is `existing_artifact`) and `fallback_caption_policy_id` (string or null, default null). The response (§2.5) gains `input_settlement`: the full `MultimodalInputSettlement` object when `input_artifact_refs` is non-empty, otherwise `null`. A pre-route failure still returns the full object in the shape the pre-route row above gives. The one exception is a request whose `input_artifact_refs` value itself is not a valid array of `artifact://` strings, or whose `input_source_surfaces` is present with a different length or a value outside its set: it fails with `INVALID_REQUEST` and `input_settlement = null`, because there are no input refs to settle. Both on success and on failure, the media result record in the seglog carries the same `input_settlement`. Each caption is its own artifact in the payload store and is listed only through `input_dispositions[].caption_artifact_ref`, never in `artifacts[]`. When `retain_original_artifact = true` the original input refs stay resolvable beside the captions. The receipt states that the model saw the original media (its redacted form when `redaction_state = redacted`) for a `native` disposition, only the caption text for a `caption` disposition, and nothing for a `not_sent`, `rejected` or `not_evaluated` disposition.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
