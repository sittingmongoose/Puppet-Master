# Re-Audit 3 — Recheck Repair Wave (work item `wnc-20260905`)

> **UPDATE (superseded status):** the follow-up recheck of commit `a4111ec28b` (`review_3/RECHECK_REPORT.md`) found two residual items — negative-case intent pinned only to the enclosing record (RC3-01) and the supersede `request_id` omission from the public signature (RC3-02). Both are repaired and verified in `REAUDIT_4.md` (reviewer follow-up script exit 0, 15/15 checks). This report is retained as history.
Scope: close FU-01..FU-05 from the recheck of commit `07382a95e9` (`review_2/RECHECK_REPORT.md`, `review_2/live_repo_recheck.py`). Prior rounds: `AUDIT_REPORT.md`, `REAUDIT_1.md`, `REAUDIT_2.md` (its "all closed" claim is superseded — see banner).

## FU-01 — Mutation-tool contracts vs live owner — CLOSED

`$defs/tool_request` write/supersede branches are realigned to the registered `Plans/Tools.md` T-184 signatures: `notebook_write` accepts the documented `epistemic_kind` (required), `provenance_refs?`, `validity_refs?`, keeps `operation: create | update | append` as the discriminator (now documented in the owner signature itself), drops the undocumented `actor`, and makes `notebook_id` optional per the owner. `notebook_supersede` requires the registered `operation: supersede | archive | tombstone` plus a non-null integer `expected_revision`, and admits optional `supersedes_entry_revision`; the invented `target_state` is gone. Fixtures follow the owner (write fixtures carry epistemic kind and provenance/validity refs; supersede uses operation + CAS revision). The reviewed counterexample — supersede with neither action nor revision — is now rejected; `neg_supersede_unknown_operation` and `neg_supersede_null_expected_revision` pin the cases.

## FU-02 — UTF-8 byte enforcement skipped create — CLOSED

The validator applies the 64 KiB UTF-8 byte limit to every `notebook_write` body before operation branching. Boundary regressions: a create body of 65,538 bytes (32,769 × `é`) fails the full validator; exactly 65,536 bytes passes. The schema character cap remains an additional structural constraint, not a byte substitute.

## FU-03 — Seven regressions rejected at the wrong schema level — CLOSED

The seven methods now validate against their actual `$defs` entries through the new `subschema_errors` helper (shared `$defs` reference environment), each with a positive control that must validate, plus two ablation tests proving that ablating the tool-request branches or the success-state conditional stops detection (the reviewer's ablation expectation). `live_repo_recheck.py` confirms all seven `detect_removed_contract`.

## FU-04 — Coverage pins without content — CLOSED

The scenario map is now content-checked: entries must be objects; `static_fixture` refs must resolve to `family[index]` records inside the positive fixtures; `owner_prose_only`/`process_evidence` refs must be existing `Plans/` paths; `preexisting_static_fixture` refs must be `external:<existing path>`; `runtime_only_future` requires a note; a new `process_evidence` disposition covers the current audit/governance obligations (A57–A61) that were wrongly labeled future-runtime. Negative identities are pinned: `EXPECTED_NEGATIVE_TARGETS` requires each id to declare its semantic target and mutate within it — repointing all mutations to one case or declaring invalid `rejects` targets fails the validator (regressions included).

## FU-05 — Stale coverage stamps — CLOSED

All evidence hashes in `requirement_coverage.jsonl` and `acceptance_coverage.jsonl` are restamped against the final content with a per-row `coverage_stamp` (wave label + basis); earlier values remain in git history and the published review bundles. WNC-A58 is recorded as `process_evidence` referencing the tracked validator results. The implementation manifest carries a `post_recheck_repair_wave` record with the rehashed files, and REAUDIT_2's premature closure claim is superseded by this report.

## Verification

- Reviewer's own `live_repo_recheck.py --repo <checkout>`: **exit 0, 29/29 observations as expected** (includes the full-validator baseline control, the documented-field acceptances, the supersede counterexamples, the 65,538-byte create rejection, all inventory/substitution mutations failing, and the seven ablation outcomes).
- `python3 scripts/pm-working-notebook-contracts.py` (all forms): pass; 28/28 negatives rejected and attributed; `fixture_inventory_integrity` pass.
- `python3 -m unittest tests.test_pm_working_notebook_contracts`: 30 tests OK (adds byte-boundary, ablation, substitution/loss, and subschema-isolation regressions).
- Reseal (serial supported scripts) and full `run-gates`: unchanged three pre-existing out-of-scope failures only; all WNC-related gates pass.

## Status after re-audit 3

**PASS_WITH_WARNINGS maintained** — zero outstanding `repair_required=true` findings across all three review waves; the three documented pre-existing gate failures remain out of scope; all runtime layers remain NOT_RUN and unclaimed.
