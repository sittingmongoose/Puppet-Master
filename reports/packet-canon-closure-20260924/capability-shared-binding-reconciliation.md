# Capability shared binding reconciliation — 2026-09-25

Status: corrects a missed static integration binding for the already-approved capability v2 successor. No new behavior, command, event, native handler, storage admission or governance refresh.

## Cause and repair

The production Wiring, Commands and UI Catalog already route `cmd.capability.ensure` through `Plans/capability_ensure_custody_contracts.schema.json`'s `capability_ensure_request_v2` and `capability_ensure_result_v2`. `Plans/shared_runtime_command_bindings.json` still named the predecessor v1 definitions. Its validator also rejected any companion schema reference outside the original shared-runtime schema.

Standalone reproduction returned exactly:

- `cmd.capability.ensure:request_schema_ref_mismatch`
- `cmd.capability.ensure:result_schema_ref_mismatch`

The repair updates only that binding row's two refs and lets the validator resolve only those two literal successor refs from the fixed local file. It still checks definition presence and schema shape. Other external refs, unrelated definitions, path traversal and network refs remain rejected. The historical v1 schema bodies and fixtures are untouched; the resolver is a reference check, not a substitute for v2 instance semantics or native execution.

## Verification

Two added regression tests failed before the repair (one stale-binding assertion and one unsupported-ref error) and pass afterward. The full capability public-binding and custody suites pass **28/28**, including historical-schema preservation and central v2 composition. The standalone shared-runtime validator now passes with **26 canonical bindings**, seven compatibility intents and no failures. The aggregate's exact affected subcheck, `validate-pm7-gui-fixtures`, now passes with no failures.

The subcheck report is `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/root-pm7-capability-binding-fixed.json`, SHA-256 `f6cc2559ea8e6e1d81f0f6f8817f4f19b1028b553cb9467b8fa7ce2814fb5003`. Independent GPT-6 Sol-high read-only review accepted the three-file scope, closed resolver and regression coverage; root performed the final checks.

Postimage hashes:

- `Plans/shared_runtime_command_bindings.json`: `f1e40e4593fe2738c09fecdbd6ec8fa5ef405043b6148c9f5300c146be232cd7`.
- `scripts/pm-shared-runtime-command-contracts.py`: `eed8885d4ef6bb3dff9f35d9756d27936d5e8089b57be988bf19da182deddc7b`.
- `tests/test_pm_capability_ensure_public_bindings.py`: `6c13606770c2a34e10b5ddcdf060149fa8a18defa91c6cd98199f0a0df500b9e`.

## Completed branch preflight before this repair

`python3 scripts/pm-plans-verify.py run-gates` completed against clean commit `38a7816d5bd2f2c3c3d0caea0cb1dcfae47f0aa1`: **25 of 36 checks pass, overall FAIL**. Root remained unchanged throughout. Report: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/root-run-gates-38a7816d5.json`, SHA-256 `7e0b1dd512dab67d05e0d9d25d56b8046c8b077c8aec33f35b7ac28a6f23036c`.

All failing totals equal the earlier clean branch run at `306f6c8e8`; that is a totals comparison only, not failure-key equivalence or a current-main comparison:

| Check | Earlier branch | This preflight |
| --- | ---: | ---: |
| JSON/raw evidence references | 16 | 16 |
| Spec Lock | 17 | 17 |
| Plan graph | 1599 | 1599 |
| Evidence | 1599 | 1599 |
| PRD runtime contracts | 1240 | 1240 |
| Implementation readiness | 68 | 68 |
| Migration | 88 | 88 |
| PM7 fixtures | 1 | 1 |
| Touch Closure | 1 | 1 |
| Audit closure | 201 | 201 |
| Audit status index | 1 | 1 |

The unchanged PM7 total concealed this actionable capability binding omission; it is not excused as pre-existing merely because its count was unchanged. The targeted rerun above proves that subcheck repaired, not a globally green aggregate. Touch still reports the separately recorded Settings disposition-registry hash drift. The audit-status index reports a worktree-relative path error resolving the authentic external audit symlink. No binding or evidence is fabricated to satisfy either.

The saved aggregate report itself caps failure rows, despite containing all subcheck totals. It is **not** the complete failure-key export required for landing and does not authorize use or expansion of the scoped staleness exception. A later landing still needs current-main reconciliation, complete per-validator exports/deltas and the landing lock. No main fetch, lock or push occurred in this step.
