# Re-Audit 2 — Independent Review Repair Wave (work item `wnc-20260905`)

Scope: repair and close the seven findings in the external independent review of commit `2826699f7e` (`review_2/REVIEW_REPORT.md`, findings WNC-R01..WNC-R07). Per-finding closure evidence: `review2_closure.jsonl`. Prior rounds: `AUDIT_REPORT.md` (findings AUD-F01..F04), `REAUDIT_1.md`.

## R01 — AMS §5.3 conflicting verification rules — CLOSED

`Plans/assistant-memory-subsystem.md` §5.3 is amended in place: the operative rule now requires ALL of per-claim support (AMS-044 `evidence_support`/`support_scope`/`currentness`), structural validity of each resolvable reference, semantic scope coverage of the claim, and non-stale validity context. The retired existence-only sufficient conditions (bare Commit / test+Diff / PlanRef rules) are retained verbatim inside an explicitly labeled "Superseded 2026-09-05" lineage block that states they establish at most the structural precondition and MUST NOT be implemented alone. Manual "Verify" re-runs the amended rule; a new rule requires legacy weakly-Verified gists to be reassessed at their next verification evaluation (injection selection, evidence event, or explicit revalidation) instead of an unspecified later time. The addendum intro no longer says "does not replace" — it says "amends §5.3 (amended in place)". AutoRunBoundary's "evaluate deterministic verification rules (§5.3)" now evaluates the coherent amended rule.

## R02 — Tool-request schema was an unchecked argument bag — CLOSED

`$defs/tool_request` now defines closed per-operation branches (`additionalProperties: false`, required inputs, typed/patterned identifiers) for all six registered tools, driven off `Plans/Tools.md` T-183/T-184 signatures: `notebook_search` (scope required, limit ≤ 10), `notebook_read` (notebook/entry ids, `include_provenance`), `chatread` (thread id AND message-or-item identity), `notebook_write` (create vs update/append precondition split: create mints the entry and carries a body; update/append require entry id + integer CAS expected revision), `notebook_supersede` (closed target-state enum), `fresh_context_request` (reason enum + `checkpoint_required`). A shared `$defs/read_range` enforces the single explicit convention enum with non-negative integer endpoints. The two demonstrated argument-name drifts are resolved in favor of the registered signatures (`checkpoint_required`, `include_provenance`). Schema validity still never implies permission: Tools.md/PS-140 read-time authorization language is unchanged and remains the authority.

## R03 — Success-state transition records — CLOSED

The `context_transition_record` success conditional now REQUIRES `admission_receipt_ref`, `checkpoint_ref`, and `new_context_window_id` (all non-null strings) and restricts `effective_controller` to `pm_managed | provider_native` for `activated`/`recovered_resumed`. The script's explicit invariants were synchronized to the same predicates (including absence-of-property, which `required` now covers at schema level). New negatives: `neg_success_without_new_window`, `neg_success_unavailable_controller`; unit tests cover null-window, unavailable-controller, and missing-receipt-property rejections. Crash-cut-point conditionals are unchanged.

## R04 — Fixture validation could lose coverage silently — CLOSED

The validator now pins the fixture corpus itself: `EXPECTED_NEGATIVE_IDS` (all 27, unknown ids rejected), per-family minimum counts, anchor records (all four crash/transition records, hostile-import entry, examples per family), per-tool positive coverage of all six registered tools, and an `acceptance_scenario_map` that must cover exactly the 62 packet scenarios (`WNC-A01..A62`) with disposition `static_fixture | owner_prose_only | runtime_only_future`. Every negative fixture must (a) be rejected and (b) have its rejection attributed to the mutated record — jsonschema `required`/`additionalProperties` parent-level errors count only within the mutated record when they name the mutated leaf. The root schema now sets `minItems` on every positive family. The validator fails closed when a mutation cannot be applied against a broken corpus. New regressions prove the fail-closed behavior: deleting all negatives, emptying a family, removing an anchor record, adding an unknown negative id, and punching a hole in the scenario map each fail `run_validation`. `apply_mutation` preserves the required envelope (retained from re-audit 1).

## R05 — Documented `validate` command was invalid — CLOSED

`scripts/pm-working-notebook-contracts.py` now accepts the documented positional form: bare, `validate`, `--json`, and `validate --json` all execute with exit 0 (regression `test_documented_command_forms_execute`), alongside the wrapper subcheck `pm-plans-verify.py validate-working-notebook-contracts` (regression `test_wrapper_subcheck_registered`). Every validation surface string in live PlanUnits is now executable as written.

## R06 — Cited test file was not committed — CLOSED

Root cause: `.gitignore`'s `/tests/*` allowlist predated the working-notebook test, so `tests/test_pm_working_notebook_contracts.py` was silently excluded from earlier commits despite existing locally and passing. Added the narrow exception `!/tests/test_pm_working_notebook_contracts.py`; the file (21 tests) is now tracked and executes from a fresh checkout.

## R07 — Audit/coverage evidence not fetchable — CLOSED

`.gitignore` now re-includes exactly `Plans/.audits/wnc-20260905/implementation/` and `Plans/.audits/wnc-20260905/audit/` (all other audit history stays local). Published: the implementation manifest with per-file subject hashes and repair-wave history, `doc_impact_matrix.json` (68 rows including Skills/Plugins), `design_decisions.json`, 85-row requirement coverage and 62-row acceptance coverage, repair matrices, validator/seal logs, baseline records, and this audit directory (original audit, REAUDIT_1, both re-audit closure files, specialist raw records, gate logs, and the review itself under `review_2/`). A second agent can reconstruct the checked bytes, the defects, the repairs, and what remains NOT_RUN.

## Verification

- `python3 scripts/pm-working-notebook-contracts.py` (all forms): pass; 27/27 negatives rejected AND attributed; `fixture_inventory_integrity` pass.
- Reviewer probe suite re-executed against the repaired schema: empty chatread/write args, negative offsets, reversed ranges (schema + invariant), unknown argument names, legacy drifted argument names, write preconditions, identity-less chatread, null/absent receipt, null window, unavailable controller, coverage-loss, and documented command forms — all behave as specified (see `review2_closure.jsonl` probe table).
- `python3 -m unittest tests.test_pm_working_notebook_contracts`: 21 tests OK.
- Full `pm-plans-verify.py run-gates` after reseal: unchanged pre-existing failures only (PNC-019 receipt, touch-closure drift of the parallel stream, closure-registry pinning); every WNC-related gate passes.

## Status after re-audit 2

**PASS_WITH_WARNINGS maintained** — zero outstanding `repair_required=true` findings across both review waves; the three documented pre-existing gate failures remain out of scope; all runtime layers remain NOT_RUN and unclaimed.
