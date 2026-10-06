The additive acceptance reader observes one trusted fresh Luna attempt without waiting for Goal completion. It makes no native call and changes no runtime, account, provider, dispatch, backoff, grade or live file. Ops owns admission policy.

```
python3 dev/luna-route/service_acceptance_projection.py \
  --native-out ABS_NATIVE_OUT \
  --expected-birth-monotonic-ns ORIGINAL_BIRTH_NS \
  --expected-thread-id EXACT_FRESH_UUID \
  --out FRESH_OBSERVATION_JSON
```

The import API is `extract(native_out, expected_birth_ns, expected_thread_id=None)`. The CLI requires the original birth and has no clock override. It exclusively creates its output. Exit0 means the structural observation is available, including a negative observation; exit1 means UNAVAILABLE. Ops must inspect `active_attempt_acceptance_observed is true`, not infer acceptance from exit0. If the live atomic result changes during the observation, the reader returns UNAVAILABLE; a later bounded metadata observation may retry without relaunching a model.

A positive receipt requires exact requested and acknowledged Luna/max/fallbackfalse, a fresh empty-history thread, exactly the caller's original birth and native thread, source-pinned telemetry, native activation after that birth, the original Goal lifecycle, positive usage notifications and positive observed outputTokens, and at least one completed successful registered confined tool call. The snapshot must still show the Goal active before the original native stop and contain no new terminal error/HOLD. It rejects unknown registered capabilities, wrong history/model/birth/thread/projection, ambiguous native session metadata, expired or terminal attempts, input-only usage, mere attempted/failed tools and any exact native terminal error.

The after-birth attribution follows the pinned runtime: State counters initialize empty before fresh thread creation; bind_thread verifies turns=[], no fork and the requested model/effort; the thread-scoped projector accepts subsequent usage/item events only for that fresh thread. Activation has a host monotonic receipt after the original birth. Completed tool counts increase only for configured registered dynamic tools on native item/completed with completed status and success=true. Frozen live projection has no individual usage/tool event timestamps, so the reader records that limit explicitly instead of inventing timestamps.

Output contains only identities, lifecycle booleans, known token/tool counts, evidence hashes and terminal error classes. Prompts, candidate bodies, history, unknown native error messages, account credit fields and provider secrets are excluded. The reader uses the existing pinned additive native-error extractor to reject current terminal errors; its full private input is never selected for publication. Parent-response and HTTP-attempt counts remain UNKNOWN: usage notifications do not measure either.

A positive receipt proves this new active useful attempt received generated model usage and successful model-to-confined-tool traffic at the saved snapshot. It does not prove full-stage completion, source quality, future service availability or release of any resource reservation. Later errors/failures/costs remain chargeable and unchanged. All original resource-growth, placement, reserve and deadline checks remain independently required by ops.

Eight synthetic zero-inference tests cover positive active traffic without completion, omission of private sentinel fields, input-only usage, failed/attempted tools, birth/history/model/thread/projection/activation mismatches, unregistered tools, capacity/unknown terminal errors, original-stop/terminal-status rejection and missing session/HOLD. No native Goal or model process was started for this reader.
