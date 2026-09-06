# Re-Audit 4 — Follow-up Recheck Repair Wave (work item `wnc-20260905`)

Scope: close RC3-01 and RC3-02 from the follow-up recheck of commit `a4111ec28b` (`review_3/RECHECK_REPORT.md`, `review_3/live_repo_followup.py`). Prior rounds: `AUDIT_REPORT.md` (AUD-F01..F04), `REAUDIT_1.md`, `REAUDIT_2.md` (R01..R07), `REAUDIT_3.md` (FU-01..FU-05).

## RC3-01 — Negative-case identity is pinned to a record, not its constraint — CLOSED

`EXPECTED_NEGATIVE_TARGETS` (record-level, first-two-token comparison) is replaced by `EXPECTED_NEGATIVE_CASES`: each of the 28 negative ids is bound to its exact declared rejection target AND its exact mutation path. `check_fixture_inventory` now fails when either diverges, so a same-record substitution — e.g. repointing `neg_body_over_limit` at `entry_envelopes[0].epistemic_kind`, which duplicated `neg_bad_epistemic_kind` while silently dropping the oversize-body case — can no longer pass. Regression `test_same_record_substitutions_fail` reproduces the reviewer's three substitutions (body→epistemic-kind, range-start→range-convention, supersede revision→operation) and asserts each fails corpus validation.

Related reference-resolution limit also closed: `_scenario_ref_problem` no longer accepts nonexistent anchors when the file exists. An owner/process reference with an `#anchor` resolves only if the anchor token appears in the target file (PlanUnit id, heading, or recorded anchor text); `test_unresolvable_owner_anchor_fails` pins this. Unresolvable references are reported as unresolved rather than presented as resolved evidence.

## RC3-02 — Supersede signature omitted request_id — CLOSED

The public `notebook_supersede` signature in `Plans/Tools.md` now reads `{ notebook_id, entry_id, expected_revision, request_id, operation: supersede | archive | tombstone, supersedes_entry_revision? }`, with `request_id` documented as the WN-007 mutation idempotency identity (retrying the same request returns the original result without a second write). The schema already required it; the positive fixture supplies it; the reviewer's boundary checks confirm a fully documented minimal supersede call validates while missing `expected_revision`, `operation`, or `request_id` each reject at the documented boundary.

## Verification

- Reviewer's `live_repo_followup.py --repo <checkout>`: **exit 0, 15/15 checks pass** (baseline control, the three same-record substitution rejections, the supersede signature naming `request_id`, the valid supersede control, missing-field rejections, and all six UTF-8 byte boundary checks across create/update/append).
- `python3 scripts/pm-working-notebook-contracts.py` (all documented forms): pass; 28/28 negatives rejected, attributed, and case-pinned; `fixture_inventory_integrity` pass.
- `python3 -m unittest tests.test_pm_working_notebook_contracts`: 32 tests OK.
- Reseal (serial supported scripts) and full `run-gates`: unchanged three pre-existing out-of-scope failures only (PNC-019 runtime certification receipt, parallel-stream touch-closure drift, closure-registry pinning); every WNC-related gate passes.

## Status after re-audit 4

**PASS_WITH_WARNINGS maintained** — zero outstanding `repair_required=true` findings across all four review waves; the three documented pre-existing gate failures remain out of scope; all runtime layers remain NOT_RUN and unclaimed.
