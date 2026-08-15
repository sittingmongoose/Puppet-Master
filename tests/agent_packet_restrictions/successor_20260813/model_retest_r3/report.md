# Planning Wizard bounded-model retest — PW-R3-20260813.1

Terminal: `BOUNDED_FIXTURE_PASS_ONCE`

All three requested configuration controls completed and passed one fresh, counted run of the same frozen 11-stage, large-plan-derived semantic audit simulation:

| Requested configuration | L1-L5 | L6-F/A/S | L7-L9 | Counted result |
|---|---:|---:|---:|---|
| GPT-5.4 mini xhigh | 5/5 | 3/3 | 3/3 | 11/11 pass |
| GPT-5.4 mini medium | 5/5 | 3/3 | 3/3 | 11/11 pass |
| GPT-5.6 Luna medium | 5/5 | 3/3 | 3/3 | 11/11 pass |

The source used to derive the bounded capsules was the current 93,549-byte, 1,671-line `Plans/Planning_Wizard.md`, SHA-256 `2b9591954871986cc5af23764d026ce102ca67be66634c7d1e49dc6988833d00`. The subject tasks did not receive the whole document. They received stage-specific capsules of 964-2,471 bytes. This directly tests the reduced-prompt approach: durable source breadth was represented by bounded, role-specific turn context.

## Counted evidence

- 33 new projectless tasks: three requested configurations times 11 required stage types.
- 33 unique task IDs and exactly one counted attempt per configuration-stage cell.
- 33/33 exact single-envelope and admitted-capsule byte matches.
- 33/33 valid JSON outputs exactly equal to their frozen schemas, values, and array orders.
- 36/36 parent-to-child chronology checks passed: 12 DAG edges per configuration.
- All three L6 specialist branches were present before L7 for every configuration.
- Zero tool items were observed in the task transcripts.
- No retries and no best-output selection occurred.
- A second controller reopening independently rescored all 33 task transcripts.
- A Sol-medium preparation reviewer found the count, uniqueness, fan-out/fan-in, and DAG arithmetic internally consistent.
- A Sol-xhigh preparation reviewer found no blocking defect in the narrow conclusion below.

## Exact supported conclusion

Each of the three requested configuration control settings completed and passed, once, all 11 stages of this exact frozen, large-plan-derived semantic-fixture audit simulation under the predeclared exact-match criteria.

This is evidence that the current reduced capsules are small and explicit enough for these three requested configurations on this case. It is not yet proof that the entire Planning Wizard audit process works end to end.

## Preserved failures and invalidation

The earlier malformed-edge, truncated-receipt, and false-positive authority results remain failures in their original protocols. The three initial R2 L1 preflight passes are non-counted because the wrapper/scorer mechanics were corrected after they ran. R3 restarted every configuration from L1, including a fresh Luna-medium L5, and adds new evidence without rewriting any earlier result.

Any future change to a prompt, schema, scorer behavior, embedded expectation, or admitted-input contract invalidates the changed stage for all three configurations and every transitive consumer. Previously passing models must be rerun under the new version.

## Limits

- One run per configuration gives no repeatability, variance, or general model-ranking evidence.
- The app accepted the requested model and reasoning controls, but immutable serving snapshots, service tier, sampling state, and the complete system/developer stack were not exposed for independent verification.
- New tasks provide session isolation, not blindness or statistical independence.
- The tasks used curated plan-derived fixtures, not the entire 93,549-byte source.
- Later stages were gated on predecessor passes but did not ingest the raw predecessor output; causal artifact handoff was not tested.
- Zero observed tool items is not proof that tools were technically unavailable.
- L8 simulated serialization only. No real canonical write, external audit, runtime gate enforcement, implementation correctness, buildability, release readiness, or safety certification was tested.

## Next meaningful test

Run a sandboxed causal fault-injection chain in which each downstream stage receives the actual immutable predecessor artifact, an upstream semantic defect is deliberately introduced, the controller must stop invalid downstream work, and a reversible test artifact is written and independently re-audited. That would test artifact causality and live gate enforcement instead of exact fixture conformance.

Protocol details and prompt hashes are in `protocol.json`. Task IDs and the complete counted matrix are in `result_manifest.json`.
