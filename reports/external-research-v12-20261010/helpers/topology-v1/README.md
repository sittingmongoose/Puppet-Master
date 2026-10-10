# ER12 topology-v1 — root-owned prospective A2/A7 adapters

These helpers import the SHA-pinned `../er11/prepare.py`; they do not allocate capacity, dispatch children, create native Goals, or run an experiment. `bootstrap.js` is a root-only adaptation of the pinned ER11 bootstrap. The pinned `../er11/reveal.py` is invoked directly and is unchanged. No `er12-v1` or `er12-screen-v1` file is edited. All candidate research/discovery, exact-plan release, source identity, scope preservation, independent checking, and complete-final requirements remain in the prompts.

Root must reserve capacity atomically in its existing owned queue before each actual dispatch, preserve exact returned IDs, and reconcile/settle actual descendants at intake and closeout. There is no new queue here. Root ownership and leaf no-delegation restrictions are advisory instructions, not a claimed tool-permission sandbox. The implementation worker ran no case inference or delegated work.

| Topology | Fresh dispatched contexts | Maximum allowances |
| --- | --- | --- |
| A2 | investigator, critic; original investigator authors final in the same actual Goal | investigation 30m; second phase 30m contains critic 12m and retained final 18m |
| A7 | investigator, critic-finalizer | investigation 30m; independent criticism and complete final 30m |

Both use a fixed whole deadline of at most 60 minutes. The second phase starts at the full investigator handoff freeze and cannot extend the original whole deadline. Setup, handoff, tool calls, waiting and delivery consume their envelopes. Early finishing never transfers the investigator research allowance. A2's investigator Goal may remain open during critic work, but investigation stops at its original stage deadline. `retained-final` is a budget key only: dispatching it is mechanically rejected.

## Exact root configuration and invocation

Use `config.A2.example.json` or `config.A7.example.json`. Paths name supplied briefs/plans without reading them. The root creates a unique caller-owned configuration outside runtime_root immediately before preparation, setting its deadline once:

```bash
python3 - ER12_RUNTIME/helpers/topology-v1/config.A2.example.json ER12_RUNTIME/config.A2.runtime.json <<'PY'
import datetime as dt, json, sys
c=json.load(open(sys.argv[1]))
c['whole_deadline_utc']=(dt.datetime.now(dt.timezone.utc)+dt.timedelta(seconds=3600)).isoformat()
with open(sys.argv[2], 'x') as f: json.dump(c,f,indent=2); f.write('\n')
PY
```

For A7 change both filenames to A7. For a different case/run, change run_id, runtime_root and the brief/plan paths in a new configuration before first preparation. Never reuse a completed/partial runtime or reset a deadline. Root then pastes `bootstrap.js` into functions code mode, setting CONFIG to the exact new config path and STAGE to `investigator`. Each subsequent root invocation is explicit: A2 uses `critic` then `notify`; A7 uses `critic-finalizer`. Reserve capacity before investigator/critic/finalizer dispatch, not before `notify`. No worker invokes the bootstrap or dispatch tools.

Pure preparation for review (does not dispatch):

```bash
python3 -B ER12_RUNTIME/helpers/topology-v1/prepare.py prepare --config ER12_RUNTIME/config.A2.runtime.json --stage investigator
```

The prepared request has a stable `er12-A2|A7-<run>-<stage>-topology-v1` clientRequestId. A retry verifies all frozen input hashes and preserves the deadline/key. The root bootstrap verifies the live `AUTHORIZED_PROVIDER_INSTANCE / gpt-6-luna / max / priority` route and the machine's 6 GiB availability gate before any dispatch. Requested settings are not asserted as effective settings.

## A2 precise lifecycle

1. Leaf creates exactly one actual native Goal with its immutable `freeze.json.native_goal_objective`. It discovers from the original brief before the unchanged one-shot reveal; then saves the complete discovery, draft, source map, exact released plan/receipt and full navigable sources tree.
2. `freeze-investigator` takes an exact direct active native `get_goal` response and snapshots every complete handoff member. A second direct `get_goal` response goes to `confirm-frozen-active`, bracketing the copy with active observations. No native terminal/freeze receipt is fabricated. The original investigator remains in its Goal and original task/run while root independently queries its exact active IDs and prepares a fresh critic. Root cannot directly query another context's native Goal using these tools; worker observations and host task liveness have separate provenance.
3. The critic checks complete immutable handoff input and saves full `critique.md`, `source-map.json`, a criticism-ID array `critique-dispositions.json`, and full source evidence before native completion. Root records its actual terminal/quiet status and the original investigator's actual active status. `bind-critic` snapshots all critic bytes, hashes the manifest, publishes a precise immutable notification, and starts no new Goal/task. File/member mutation and incomplete artifacts stop binding.
4. Root `notify` sends the exact saved message using `t3_thread_send(mode='steer')` to the original active investigator. Its actual raw result must say `steered` with the original run/thread IDs; the bootstrap saves it atomically as `control/notification-delivery.json`. Uncertain retries keep the same notification key. No queue/restart/idle-thread reopening substitutes for steering.
5. Bounded `wait --timeout-s 60` uses Linux inotify plus blocking select, draining unrelated events before blocking again. It waits for the complete root bind AND saved actual steer delivery. It returns the precise frozen root notification/hash. Repeat bounded waits only while the original Goal is active and the fixed phase deadline remains; no status-loop research or model busy-polling. If root steer arrives before the saved delivery record, remain active and wait for that record.
6. Before any critic-byte read, `author-intake` requires a fresh exact active native response with the original identity and the exact root-notified SHA-256. It verifies all handoff/critic bytes and actual original-run steer delivery. Write the full final/source map/sources and exactly one evidence-based disposition per critic ID under `stages/investigator/final`. `seal-final` verifies the same active Goal and bindings, freezes the full final package, then the leaf completes that same native Goal. Root separately captures actual native terminal evidence/host delivery. A helper snapshot is never itself a native completion receipt.

Pass actual tool observations without hand-authoring them, for example in leaf functions code mode:

```javascript
const raw = await tools.get_goal({});
const q = s => "'" + String(s).replaceAll("'", "'\\''") + "'";
const r = await tools.exec_command({cmd: `python3 -B ER12_RUNTIME/helpers/topology-v1/prepare.py freeze-investigator --config ${q(CONFIG)} --json ${q(JSON.stringify(raw))}`, max_output_tokens: 3000});
if (r.exit_code !== 0) throw new Error(r.output);
text(r.output);
```

Use a new direct observation for `confirm-frozen-active`, `author-intake` (also supply `--notification-sha256` from the exact root message), and `seal-final`. The current native schema exposes `threadId`, `createdAt`, `objective`, and status; their identity tuple is preserved exactly. No separate goalId is invented.

## A7 complete input, independent checks, full final

The investigator freezes its full handoff while active, saves a post-freeze active observation, then completes its own Goal normally. Root requires terminal/quiet task status before a fresh critic-finalizer dispatch. That context creates its own one actual Goal, runs `check-input --stage critic-finalizer`, reads the full handed documents and sources, and independently checks consequential claims.

Before full final writing it saves complete `critique.md`, `checks.json` with nonempty executed operations (source_id, locator, observed_operation, accessed_at_utc, result), and `critique-index.json` containing every criticism ID. `freeze-review --stage critic-finalizer` requires no final.md yet and binds those exact independent-check/critique bytes and IDs. The full final then includes an explicit accept/amend/reject/retain_uncertainty disposition, evidence/rationale and final locator for every ID. A zero-criticism review uses [] and explicit no-criticism prose. `seal-final --stage critic-finalizer --json <exact fresh active native observation>` requires the intake/review binding, full final.md, source-map.json, navigable sources, and critique-dispositions.json before native completion.

Hash/member/read gates establish complete bytes, ordering and identity. They do not prove comprehension, source truth, a substantive-quality pass, or full scientific scope fidelity. Those claims require actual independent assessment. Saved check operations remain worker observations, not helper-executed source verification.

## Supported and unsupported routes

The implementation catalog exposes native create/get/update Goal but **no native Goal wait**. `t3_thread_wait` waits for a terminal run and cannot suspend a retained author to receive criticism; `functions.wait` only resumes an existing exec cell. The available prospective alternative is the bounded same-host Linux inotify wait plus root's precise in-flight steer. A synthetic kernel-wake test passed; **live A2 task/Goal/steer transport remains unverified**.

A2 is unsupported if the worker cannot keep its original Goal/run active, exposes no stable native identity/active observation, stops at the original investigation deadline rather than retaining residency, cannot use the same filesystem/inotify wait, cannot receive original-run steering, or cannot preserve the original fixed time envelope. Missing native timestamps/usage remain unknown; they do not justify a second Goal or handwritten proof. Save the exact unsupported error and partial artifacts. Root retains dispatch ownership; no substitute investigator is launched.

Feasible prospective diagnostic: root reserves two slots in the existing queue for one clearly labeled non-scientific sentinel. Original investigator creates one real Goal, saves synthetic-only full discovery/draft/source handoff and unchanged one-shot reveal, freezes and confirms active, then blocks. Fresh critic saves sentinel critique/sources and completes. Root binds/steers exact bytes to the still-active original run. Investigator captures original active identity before read and full final save, completes the same Goal, and root captures original-run terminal/quiet status. Compare directly observed native identity and raw host steering, no invented receipt or performance/science credit. This engineering worker did not dispatch that diagnostic.

`control/residency.jsonl` records bounded blocking wait intervals as open residency/tool wait; provider usage/billing are null. Preserve native cumulative counters, supported account deltas, root orchestration usage and billing separately. Do not sum overlapping meters, subtract unknown wait as compute savings, or infer charges from open Goal seconds. Bind/freezer UTC values are helper capture times, not native lifecycle timestamps.

## Verification and frozen version

`python3 -B .../topology-v1/test_mechanics.py` runs synthetic-only full handoff, exact reveal, original-active/fresh-Goal rejection, source mutation, immutable notification/hash, independent A7 review ordering, stable retry/deadline and real kernel blocking/wake checks. It never calls a provider/native lifecycle API. See evidence/mechanical-verification.json, evidence/runtime-capabilities.json, version.diff and VERSION.json. Temporary synthetic directories/processes are cleaned. There is no actual A2/A7 case answer or live route success claimed by these tests.
