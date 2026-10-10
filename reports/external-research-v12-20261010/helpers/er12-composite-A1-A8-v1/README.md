# er12-composite-A1-A8-v1 — version 1.0.0

Engineering preparation only. This helper is not a scientific qualification, selection, or admission of a second successor. Root alone owns dispatch and decides selection only after both original A1 and A8 blocks have independently been assessed.

`prepare.py` is a tiny pinned hook overlay on the existing `er12-screen-v1/prepare.py`; it is not a replacement runner or dispatcher. The original baseline file, reveal helper, bootstrap, and two exact A8 delta files are unchanged. Their actual SHA-256 values and byte counts are recorded in `COMPONENT_PINS.json` and hardcoded in the overlay. All five are checked before importing the baseline and again before preparation. Pin mismatch stops execution. There is only one recipe.

The baseline config remains literal `method_id: "A1"` and `stage_prompt_deltas: {}`. Its complete R0/A1 prompt is generated unchanged. Investigator receives exactly that prompt. Critic and reviser receive that entire prompt followed by one newline and their respective verbatim UTF-8 A8 SCW-6 delta bytes. The A8 text retains its original R0 wording. No investigator semantic delta, scope reduction, new stage, altered source access, or altered native Goal lifecycle is introduced.

The original three fresh Luna contexts with max reasoning and priority retain the 1800/720/1080-second budgets. Absolute stage deadlines are the original `min(whole_deadline, T0 + 1800/2520/3600 seconds)`, corresponding to T0+30/+42/+60 minutes. Queue, setup and retry time consume those deadlines. The original terminal predecessor, pending child, full-scope, source-map, exact one-shot reveal, partial preparation, frozen-input and late-cap guards remain in the baseline.

Each new stage calls original preparation exactly once, then records the exact recipe/components in `freeze.json.composite_guard`, records its delta component or null, and adds all five components to `frozen_inputs`. It replaces only the request key with `er12-composite-{run_id}-{stage}-A1-A8-v1`, in both request locations. Retries reuse saved bytes and deadlines; the original retry/dispatch guard is authoritative. Used stages from another recipe are rejected, including used predecessors. A matching saved dispatch returns `alreadyDispatched`; a conflicting returned task ID is rejected by the original guard.

`config.example.json` contains public placeholders. It is deliberately not runnable: root must provide caller-owned public paths, run ID, deadline and the original authorized provider route. The original baseline validates that route without substitution. Keep the config outside the dedicated runtime directory. Preserve the exact `composite_guard` object, `dispatch_owner: "root"`, `method_id: "A1"`, and empty `stage_prompt_deltas`.

The same original CLI is exposed through this pinned module:

```text
python3 ER12_RUNTIME/helpers/er12-composite-A1-A8-v1/prepare.py ACTION --config /absolute/public/config.json --stage STAGE
```

Actions remain `deps`, `prepare`, `record`, `record-status`, and `record-capabilities`; record actions retain the original `--json` argument. No dispatcher is included here. The pinned original bootstrap remains the orchestration reference; its caller-owned helper-directory setting must point at this overlay if root later authorizes use. Its reveal command still points at the exact original baseline reveal helper. Nothing in this preparation executes the bootstrap or calls T3.

Run the necessary offline synthetic checks with:

```text
PYTHONDONTWRITEBYTECODE=1 python3 ER12_RUNTIME/helpers/er12-composite-A1-A8-v1/test_prepare.py
```

Checks compare complete prompt bytes for every stage, exact delta/no investigator addition, untruncated synthetic scope bytes, actual absolute A1 deadlines and whole-deadline cap, original budgets/route/source roots/predecessor requirements, exact component hashes, pre-import pin rejection, stable retry keys and unchanged frozen files, duplicate-used rejection, pending predecessor blocking, frozen-input and late-expiry rejection, and original CLI routing. All status/output fixtures are fabricated synthetic data. No actual reveal, stage native Goal, model call, source research, or T3 operation is run. Synthetic scratch directories are removed after each check. `test-results.json` and `HELPER_MANIFEST.json` are the retained engineering records.
