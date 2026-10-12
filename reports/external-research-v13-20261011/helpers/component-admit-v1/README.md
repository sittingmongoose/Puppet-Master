# ER13 COMPONENT admission v1

Offline Python CLI for B01, B04, B05 and B08, two cases each, control and treatment. The root alone resolves provider identity, dispatches, records returned T3 task/child IDs, monitors deadlines, accounts for queue/native starts, freezes terminal output, evaluates and owns Git. This helper never launches a candidate, creates an actual Goal, reserves a start, delegates, schedules or performs case-specific research. The JavaScript it emits is executed later by the declared Luna candidate in supported Codex `functions.exec`.

Read the current repository AGENTS.md and `packet/ER13_T3/ER13_T3_EXECUTE_HANDOFF.md`, section 7. `helpers/component-fixtures-v1` supplies actual READY/MANIFEST and verification evidence. This helper consumes and validates them without editing that helper. No implementation, fixture, main-materializer or repository files outside `helpers/component-admit-v1` were edited by this implementation sub-agent.

## Root usage

Set T0 **once immediately before arm-specific preparation**, after backlog/slot allocation. Passing it through this CLI never starts a new clock. Both arms receive their own honest root T0 and the same definition. Cold fixture acquisition/preparation is separately recorded support cost; include it in a cold standalone denominator and disclose warm cache reuse.

```bash
python3 -B helpers/component-admit-v1/prepare.py prepare \
  --case B01-P01 --arm control --run-id B01-P01-C-L \
  --runtime-dir /absolute/local/unused/runtime \
  --t0 ORIGINAL_ROOT_T0_UTC \
  --provider-instance CURRENT_ROOT_RESOLVED_PROVIDER_ID
```

Optional `--campaign-root ABS` selects the local ER13 root; default is this helper's campaign parent. Optional `--selection-json ABS` freezes exact root selection/catalog evidence by content/hash in selection.json. The CLI requires a root-resolved provider instance and fixes model `gpt-6-luna`, effort `max`, service tier `default` (Luna Max Standard). The caller's provider ID is an instruction/routing selection, not an independently verified identity: root must check current supported account/catalog mapping and record returned requested versus observed identity/options. Do not publish private account routing evidence.

Success prints JSON with `stageDir`, `args`, `request_path`, `request_sha256`, `freeze_sha256`, and `dispatch_performed:false`. Only root may submit the **exact** saved request `args` to T3 `delegate_task`, using its frozen stable `clientRequestId`. Before dispatch, compare request/freeze hashes with the returned receipt and run:

```bash
python3 -B helpers/component-admit-v1/prepare.py verify --runtime-dir ABS
```

This verifies hashes and an unexpired T0+1500-second deadline and emits no delegate arguments. Never reconstruct or edit the task/request after preparation. Existing directories, missing/not-ready fixtures, changed input/native pins, future T0 and expired deadlines fail closed. A preparation that itself expires retains its partial/frozen directory, returns failure and emits no request; never retry that directory or reset T0. Keep failed starts in their original cells; root adjudicates any prospective successor.

`verify --allow-terminal` performs read-only hash checks after the deadline; it does not admit, emit a request or relax the candidate time contract. Mode 0444 and hashes provide observable immutability, not an enforced filesystem sandbox or protection against a malicious owner rewriting all pins. Root's original request/freeze hash receipt remains the external comparison anchor. Input access restrictions are explicit instructions; shared full-access contexts are not sandbox isolation.

## Frozen comparisons and output selection

Every request carries copied byte-identical brief/plan/draft/source-index base inputs, exact permitted criticism/cache, input-map, route/selection, tools, time contract, method delta and complete-output selection. Hidden rubrics, findings.json, metadata, fixture author scripts and other-arm/evaluator conclusions are excluded.

- B01: identical common source critique. Control authors a complete rewrite. Treatment authors targeted amendments and reproducibly assembles retained supported prose into a complete final; it saves amendments.json, assemble.py and actual assembly-results.json. Retained text still requires source review.
- B04: conventional full versus compact criticism from the same immutable findings and primary evidence. Both deliver the full final. No word cap or reduced finding/coverage obligations. This preparer's semantic-equivalence claim is not an independent scientific grade.
- B05: one fresh critic+finalizer context in either arm. Control performs ordinary independent lookup and receives no cache, navigation or preparer source pool. Treatment receives exact primary bodies/neighborhoods, navigation and the fixture's byte-identical source_reader.py. Its original relative path layout is retained so on-demand adjacent/full-body expansion works. Both may independently expand source lookup; neither inherits semantic conclusions.
- B08: ordinary verification versus binding domain/subject/units/version and independent governing oracle/result or discriminating counterexample. Identical permitted source evidence and execution tools. Supported claims and conditional derivations remain in the final; no universal proof from replaying the draft formula or a handful of examples.

Each arm owes COMPLETE self-contained final.md, criticism-dispositions.md and source-map.json; B05/B08 also generate critique.md. Any executed witness must retain actual code, command/runtime/version, stdout/stderr/results, interpretation and limits under witnesses/. Native activation and terminal raw JSON receipts are required. No patches-only result, scope truncation, invented execution or discovery-effectiveness claim is accepted. Output quality is assessed independently of latency. Unknown inference/billing is unknown.

## Native lifecycle

The copied `native/assert-active-goal.py` is byte-identical to the pinned `reference/recipes/materialize-v3` guard. The copied activation template is also byte-identical. Generated activation.js adds a read-only frozen-clock/hash preflight, substitutes the known stage and guard path parameters, and otherwise preserves the direct-capture template. It reads the machine-frozen objective, calls `tools.create_goal({objective})` once, saves `JSON.stringify` of the entire original response with exclusive create, then executes the guard. No extraction, objective transcription, `get_goal` substitution, fallback or replacement Goal. A second execution is rejected before a second create call by the saved activation receipt. Guard success proves exact response binding only; native provenance and freshness remain unknown beyond the checker.

The candidate reads scientific inputs only after successful activation. All output must be saved by the original maximum 25-minute deadline, including preparation, queue, tools, retries, handoffs and terminal delivery. The complete candidate then executes completion.js: one supported `tools.update_goal({status:"complete"})`, saving the full response in native-goal-terminal.json with exclusive creation. Incomplete work reports failure honestly and preserves partial artifacts. No undeclared children, reserve use, scheduler or account/model/tier switching.

## Offline validation

```bash
python3 -B helpers/component-admit-v1/tests.py
```

Six meaningful tests cover all 16 request cells, common input identity and B01/B04 method separation, B05 control-cache exclusion and exact reader expansion, T0+25 maximum inclusive of preparation/queue, preparation-expiry refusal, existing-runtime refusal, request/input/native mutations, exact native envelope acceptance/rejection and emitted JavaScript with mocked native tools. The mock runs real local shell receipt save and exact assertion; it makes **zero actual native candidate calls** and proves no route/lifecycle science result. Temporary test directories are deleted. CHECKS.json records the initial test-clock fixture mistake and corrected final pass rather than silently dropping it.
