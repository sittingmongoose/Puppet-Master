# Environment-connection profile references

Status: static reference repair; partial/native obligations remain open.

TCP-PERF now selects the existing environment connection request, result and
error definitions in `shared_runtime_command_contracts.schema.json`, rather
than unresolvable prose type names. Persistence references select the actual
`environment_connection_state` family and existing state definition; migration
points to SIR-015. Its existing command fixture is added alongside the retained
Full Thread fixture. The central CommandOutcomeRecord, ObservableWorkRecord,
reverse consumers, availability and permission rules remain unchanged.

This changes no Full Thread behavior, schema, owner Markdown, command identity,
storage family or policy. It does not conflate environment connection with the
separate integration-connection family or claim native implementation.

## Provenance and verification

Evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/tcp-perf-profile-01/`.

- `INTEGRATION-PACKAGE-SOL-V3.patch`: SHA-256 `5652af42617b62f8dd094aa49bb525aff9008ce3314fbb55e67959331a24a6b1`.
- Installed test: SHA-256 `0138c4b9536af281472038dd467ed3c97a23d64e9bb4811f7be419454022e6f3`.
- `REVIEW-DIFFERENT-SOL-V3.md`, independent static acceptance: SHA-256 `ba400278ec0341a6da35591eb10df2b1c47abf7626e880716de34ad8e875f452`.

The original native Zcode author wrapper timed out; no author report or Goal
completion is inferred. Sol packaged the delivered profile/test and separately
corrected an invalid registry pointer, fixture routing, actual validator
requirement and skipped-test accounting. Earlier candidate bytes remain frozen.
The final test dereferences registry index 56 and checks its family identity;
it does not assume a named key exists inside the registry array.

Root ran the direct test with `PM_TCP_PERF_BASELINE` supplied from
`git show HEAD:Plans/touch_closure.json` at `ce501fe9a`: **9 passed, 0 skipped,
0 failed**, using jsonschema. This verifies all unrelated Touch rows/profiles
are unchanged. Without the optional baseline, it correctly reports **8 passed,
1 skipped, 0 failed**, not a full nine-test pass. The previously integrated
repository-local direct regression still passes. `git diff --check` passed.
The combined app-binding and Touch source unittest suite passed all 62 tests.

No whole companion gate rerun, governance reseal, main landing or complete
packet closure is claimed. All three environment-command Touch rows retain
their partial disposition and native implementation obligations.
