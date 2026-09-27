# R1b preparation rev3: closure evidence for R2-1 to R2-3 (CHANGES_REQUESTED on `67adf5d26`)

This revision is offline only: no provider calls, native Goals, evaluator runs, account probes or production writes.

- **Launch state:** Block 1 is not launched and Block 2 stays unauthorized. The design, caps, packages and order are unchanged.
- **Rejected rev2:** preserved in the lab at `r1b/rev2-rejected-67adf5d26/` and in Git at `67adf5d26`. Rev1 and R1 are untouched.
- **Frozen policy:** `r1b/r1b-policy.json` rev3, sha256 `b5a2e48ac41481a673d63a74bb786bf9585e63cfa6c6ac847b0aabd39a696dc6`. It pins 27 code, prompt, input and runtime files, plus the case manifest `01e8109f…`.
- **Tests:** `python3 -m unittest tools/r1b/test_r1b.py` runs **62 tests, all OK**: the 51 from rev2 plus 11 new negative regressions. All five `_real_` fixture tests ran here in the lab.
- **Real-tree launcher checks:**
  - `preflight('block2')` is refused as unauthorized.
  - `preflight('block1')` is refused because no approval record exists.
  - A dry-run preflight used a scratch approval naming this exact policy. It passed all 27 hashes and exact corpus membership. The scratch approval was then deleted.
  - No `r1b/APPROVAL.json` and no run directory exist.

## R2-1: required fields and payload-aware scanning (`tools/assemble_delivery.py`)

`parse_decisions()` is now a single-pass state machine. Between a `<<<` line and its matching `>>>` line, every byte is replacement payload. Text there that looks like an entry header or a field is inert and creates no record. A payload still open at end of file makes its entry `CARRIER_INCOMPLETE`, and it cannot create any further record.

Required fields by disposition, checked in code before a record becomes authoritative:

| Disposition | Required |
|---|---|
| confirm | `basis: supported` and nonempty `evidence` |
| qualify | `basis`, `reason`, `evidence` and a delimited or single-line `replacement` |
| reject | `reason`, plus either `basis: counterevidence` with `evidence` or `basis: absence` with `searched` |
| unresolved | `reason` |
| not_a_claim | nothing (bookkeeping exception kept) |

A missing field or an inconsistent basis makes the block `CARRIER_INCOMPLETE`, which is non-authoritative; its raw record is kept in section 5.2. Both verifier prompts now state these requirements in one identical sentence (control 3,360 B, candidate 3,881 B; the only difference is still the evidence-access paragraph).

New tests:
- `test_r21_cut_off_confirmation_is_not_authoritative` (P1)
- `test_r21_confirm_needs_supported_basis_and_evidence`
- `test_r21_bookkeeping_and_unresolved_requirements`
- `test_r21_payload_record_lookalike_is_inert` (P2: a fenced `### B-003` with a full record body inside a B-002 payload leaves B-003 unauthorized and keeps the payload bytes)
- `test_r21_open_payload_at_eof_generates_no_records`

## R2-2: failure signals dominate (`tools/run_r1b.py`, `tools/run_reviewer_v2.py`)

- **`classify()`:** a driver error, missing receipt, or any nonzero or signal exit now dominates a success-shaped receipt and yields `harness_failure`, which stops the schedule. Caps still exit 0 by design and continue. Each receipt now stores `process_exit` and `last_native_stop` side by side.
- **Reviewer:** an explicit native error result (`is_error` true, or a subtype other than `success`), or no result event at all, prevents `COMPLETED`. Partial files are kept and validated but not presented as finished.

New tests:
- `test_r22_nonzero_or_signal_exit_dominates_success_receipt`
- `test_r22_integration_success_shaped_receipt_with_bad_exit_stops_schedule` (the real `run_one` with a mocked native boundary returning exit 2 and `goal_complete`: one slot, then `stopped`)
- `test_r22_native_error_result_blocks_completed`
- `test_r22_missing_result_event_blocks_completed`

## R2-3: corpus membership (`tools/run_r1b.py`, `tools/build_review_workspaces_r1b.py`)

- **`preflight()`:** now refuses any candidate-readable file under `case_bundle/` that is not listed in its manifest; the only allowlisted extra is `MANIFEST.sha256.json`. It also refuses a changed manifest or a changed listed file.
- **`copy_listed_corpus()`:** builds every candidate and reviewer corpus only from manifest-listed files, refuses links, re-hashes each file, and verifies that the copied inventory equals the manifest.

New tests:
- `test_r23_membership_exact_passes_changed_or_unlisted_refused` (the model boundary is never reached on refusal)
- `test_r23_candidate_copy_contains_only_listed_files`

## Unchanged

- Applications, models, native `/goal`, the package rule, the counterbalanced four-assignment Block 1, two reviewers, and caps.
- The 483 KB bundle stays a measured cost; no truncation is reintroduced.
- `assembly.complete` is mechanical record coverage only.
- Requested and observed reviewer effort stay distinct.
- Muse child-token usage stays unknown.
- Account headroom and the user's go are checked at launch time; `APPROVAL.json` is written only then.
