# Integrated rolling controller v1

This is prospective controller code only. The author launched no native Goal, created no actual case birth or account binding, and packed no actual case. Source qualification and an explicit new root `NATIVE_ACCEPTED` release are required. Current `CANARY_ONLY` releases fail before case preparation.

The operator runs:

```
python3 -I -B /absolute/ops/integrated-dispatch-v1/rolling.py \
  --root-release /absolute/new-root-native-accepted-release.json \
  --run-root /absolute/ops/dispatcher-v1/FRESH-INTEGRATED-RUN
```

The runtime root must be nonexistent, canonical, and inside `ops/dispatcher-v1`; the author owns no actual runtime paths. `rolling.py` schedules BIO-C and NB-C first, with two case-management slots including any active Z leases. Once a slot is free it starts P/B work without a wave, Git, or user review barrier. Unknown/overdue cleanup keeps accounting occupancy and prevents new starts. There are no automatic retries, case relabeling, native rescue, provider calls, account switches, helpers, or sibling actions.

## Root release records

Use `er8.dispatcher.root-release.v1` with `root_authority=true`, `accepted=true`, `mode=PRODUCTION`, `qualification_scope=NATIVE_ACCEPTED`, a distinct ledger route key, and its exact `pins`. Existing `config`, `route_snapshot`, and `execution_acceptance` records remain exact `{path,sha256}`. `route_acceptance` must independently allow `productive` on the current route snapshot and carry `native_review` equal to the exact new `canary_review` record. `canary_review` must be the new actual passed same-snapshot native review with the four frozen admission booleans. `pins.independent_acceptance` equals this **fresh native-route-acceptance hash**, which binds its actual canary proof. This is root's final prospective pre-freeze choice, replacing the earlier canary-proof-hash suggestion; no actual release or case was bound to that earlier suggestion. Separate records are required because the unchanged core requires route acceptance verdict `accepted` and canary review verdict `passed`. `controller_snapshot` binds this controller's `SOURCE_FREEZE.json`. `selected_positive_files` must cover the frozen route and controller closures and positively selected accounting/source/config/acceptance files. It may never select private runtime, native/model logs, credentials, candidate output, evaluation scope, evaluator answers, or job trees.

`planning_input_sha256` is a separate prospective absolute path/hash map. `PLANNING_INPUT_PINS.json` supplies only assigned brief, thin plan, method, case TASK/manifest, stage templates, methods, native objectives, source access and candidate reservations. Evaluation scope and evaluator reservations are excluded. `check_planning` rechecks the actual assigned files under each stage gate before packing. The inherited `accepted_method_sha256` remains the **lease hash alias**; actual `METHOD.md` bytes belong to `immutable_inputs`.

The frozen ledger must have the distinct `NATIVE_ACCEPTED` review and three native starts promised to each exact case, with one protected literal `<case>-final-correction`. The controller never adds or changes these root-owned records. Its only actual admission mutations occur after birth inside the original accepted gate. First admission uses `prepare-admission` with original epoch and monotonic birth. Later admissions use the frozen module's `admit(...,component_birth=stage_epoch)` inside its transaction, preserving pre-blocking stage birth rather than transaction time.

## Process and clock identities

1. The generic rolling manager captures original case epoch/monotonic birth before its first case-specific blocking call, then enters the already accepted static `deadline_gate` before case-supervisor Python imports. Its cutoff is `min(case_birth+3600,campaign_stop)`. The case supervisor is HOSTMANAGEMENT, not a stage candidate parent, and stays under this fixed gate across all three stages and gaps.
2. For each stage the supervisor captures stage birth before transfer/setup and starts a separate gated **stage actor**, with a distinct PGID held by an exact `Popen` handle. Research/critic/correction declare unchanged 1800/600/600 seconds and 160 responses. A stage whose full declared cap no longer fits the original case/campaign is held rather than clipped or reset. Native work reserves 30 seconds inside the stage cap for quiet/closure.
3. The actor admits the lease, uses `adapter.pack_stage`, binds the original authority and exact four-record ABI, then uses frozen `make_plan.construct`. The selected `launch.py --config --lease --case-binding --acceptance` runs only inside its accepted PID1/cgroup boundary. Each Goal has a fresh empty workspace/out, canonical disjoint native output, and the route's unchanged fresh HOME/XDG/session/instruction policy. The actor reads only public `activation.json` and `public-metrics.json`, promptly counts actual activation, freezes the adapter's public exports, and exits **without releasing its lease**.
4. After the held actor actually exits, the external stage finalizer probes that exact actor PGID for absence and uses frozen `observe.observe` on the exact enrolled inner cgroup and original stage/case cutoff. Positive native/MCP quiet, actor exit, and original clocks are all required before release. The supervisor staying alive is explicitly HOSTMANAGEMENT; it is never mislabeled as an exited stage actor.
5. After all stages, the supervisor exits without a whole-case completion claim. The generic global parent reaps it, verifies group absence through the gated case finalizer, then reaps that finalizer too. `parent_receipt.py` records the actual end observed from those held handles, charges the final tail, verifies the exact nonoverlapping outside sum and occupied sum, and only then writes the root case disposition. Subsequent generic metadata/publication management is separate root cost.

The stricter outside-native cap is 300 seconds across **all** case setup, supervisor/interstage work, exports, settlement, waits and final cleanup. Host intervals run from original birth through actual case finalizer exit, excluding only native wrapper-begin through first positive owned quiet. Each charged host interval has unique start/end metadata; the next stage charges the previous settlement's remaining tail. The global receipt independently recomputes the inclusive sum and refuses a gap, overlap or cap excess. Whole-case wall remains 3600 and occupied stage leases remain 5400; all failures and unresolved permits/leases remain in the shared ledger. Missing generated usage is UNKNOWN.

## Three-stage artifact chain

The research Goal must write nonempty `PROPOSAL.md`. The fresh critic receives only that frozen current proposal, optional same-case unresolved leads and same-case public capture store. The fresh correction adds the frozen `CRITIQUE.md` and must write nonempty **`FINAL_PROPOSAL.md`**. No reasoning history, evaluator input, another case's source/cache, or host administrative narrative is transferred. Captures and operation/range metadata are exported with the selected adapter's exact public methods. Mechanical delivery remains distinct from semantic acquisition, which is UNKNOWN pending the grader.

Three distinct actual Goal target IDs, fresh-session projections, response counts within160, positive per-stage closures and the actual final artifact are required for the operational chain. Goal completion, source interpretation and answer quality remain independent evaluation obligations; the controller never declares a semantic pass from a file or JSON status.

## Offline verification

`python3 -B -m unittest discover -s tests -v` tests original deadlines, CANARY_ONLY refusal, positive output scope, same-case artifact handoff, negative closure cases, path aliases, the accepted static gate stopping synthetic stalled preparation, and actual held synthetic parent exit/PGID absence. Fixtures are synthetic OS/metadata checks, not research credit. There are no native/SDK/provider/network/candidate calls.
