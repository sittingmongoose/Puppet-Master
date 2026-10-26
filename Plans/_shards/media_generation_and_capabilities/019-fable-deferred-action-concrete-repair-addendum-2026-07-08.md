# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6618-L6700

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

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

### Disabled Reason Enum

Repairs row `sfk-0e2141b9b0c0a396ca9edbe4`.

Canonical `disabled_reason` values are `backend_unsupported`, `unsupported`, `capability_gated`, `missing_account`, `missing_credential`, `quota_exhausted`, `policy_disabled`, `provider_unavailable`, `route_unverified`, and `safety_blocked`. Legacy uppercase display strings may render in UI copy but must normalize to these lowercase wire values.

### Regex Engine Constraint For Prompt Slot Extraction

Repairs row `sfk-471e24039fccbc4a5c93be12`.

- Prompt-slot extraction uses Rust `regex` syntax only.
- Lookaround patterns such as `(?<!...)` or `(?=...)` are forbidden in canonical patterns.
- Word-boundary behavior must be expressed with explicit capture groups and boundary tokens, e.g. `(^|[^A-Za-z0-9_])\\{slot_name\\}([^A-Za-z0-9_]|$)`, with the slot captured separately from the boundary characters.
- Any future use of a different regex engine must name the crate and feature flag in this document before patterns may rely on lookaround.

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

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
