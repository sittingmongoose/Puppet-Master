# R1b preparation rev2 — response to CHANGES_REQUESTED on `d9664af3c`

This revision is offline only. It made no provider calls, native Goals or evaluator runs, and no production writes. **Block 1 is not launched and Block 2 stays unauthorized.** The rejected rev1 is preserved in the lab at `r1b/rev1-rejected-d9664af3c/` and in Git at `d9664af3c`; R1 is untouched.

- Frozen policy: `r1b/r1b-policy.json` rev2, sha256 `a13bb803f40d4062da3ec215439df6eacf4bae3e1aa0d40367bcaf096cb4eae0`.
- Pinned: 27 code/prompt/input/runtime files, plus the case-corpus manifest `01e8109f…` (unchanged since R1).
- Tests: `python3 -m unittest tools/r1b/test_r1b.py` gives **51 tests, OK**. Every native boundary, process and clock is stubbed.
  - Tests whose names contain `_real_` need the lab's frozen R1 packages or the case corpus. They cannot run from the GitHub bundle alone.
- Launcher checks against the real policy:
  - `preflight('block2')` is refused as not authorized.
  - `preflight('block1')` is refused because there is no approval record.
  - A dry-run preflight with a scratch approval for this exact policy passes all 27 hashes and the full case manifest. The scratch approval was then deleted; no slot was created.

## Required items and what changed

| Item | Fix | Regression tests |
|---|---|---|
| B1 replacement cut off | A replacement must sit between `<<<` and `>>>` lines and is captured byte for byte, headings and fences included. A one-line inline replacement is accepted only when nothing follows it in the entry. Anything else (more undelimited lines, or an unterminated `<<<`) makes the block `CARRIER_INCOMPLETE`. That is non-authoritative: its raw record is kept in section 5.2 and none of its text enters the asserted findings. | `test_a1_undelimited_heading_replacement_is_not_truncated_into_authority`, `test_delimited_replacement_keeps_headings_and_fences`, `test_unterminated_delimiter_is_incomplete`, `test_inline_single_line_replacement_accepted` |
| B2 conflicts become authority | Two records for one block, or a field repeated in one record, give `CARRIER_CONFLICT`. It is never last-one-wins, and all raw records are kept. Required fields are validated once in code: a valid decision and basis; qualify needs a replacement; reject needs a basis and a reason; an absence basis needs `searched`. Unknown IDs and text outside any entry are reported. The arm's `assembly.complete` is false if any carrier defect or undecided block exists. The declared rule: a malformed carrier is the arm's own result and does not stop the paired slot. | `test_a2_…`, `test_a3_…`, `test_absence_without_search_and_unknown_ids` |
| B3 context lost; the graded projection | Every heading at any level is its own decidable block. Fenced code never starts or splits a block. Only blank lines and table header/separator rows are context, and the tool asserts that no substantive line is left as context. Each block carries its parent heading path. The final is a projection: **section 1** holds only the active asserted version of each block (a confirmed block's text, or the verifier's replacement for a qualified or rejected block). **Section 2** is rejected draft text; **section 3** is unresolved, undecided or malformed-record proposals, and neither earns credit. **Section 4** is verifier additions, checked like any claim. **Section 5** is history: every draft line and the raw non-authoritative records. The evaluator prompt defines the same projection. | `test_a4_top_level_rule_is_a_block_and_delivered`, `test_fenced_code_is_not_structure`, `test_projection_credits_only_active_assertions`, `test_real_draft_assembly_has_every_draft_line_in_history` |
| B4 driver failure does not stop the schedule | `classify()` maps each receipt to one outcome. `goal_complete`, `cap_stop` and `incomplete_semantic` continue; `quota_stop` and `harness_failure` stop. A driver error, missing receipt, paused Goal or unrecognized stop is a harness failure. A zcode run whose every request failed, or a Muse usage window at or above the gate, is a quota stop. `run_one` writes a terminal `status.json` and receipt in `finally`, and a host exception is a harness failure. | `test_b4_harness_failure_stops_schedule`, `test_quota_stop_stops_schedule`, `test_cap_stop_continues`, `test_classify`, `test_real_run_one_with_mocked_native_failure_writes_terminal_stop` |
| B5 leftover directory skipped | A relaunch skips only slots whose terminal status is a continue-outcome. A directory with no status record, a non-terminal record or a stop-outcome record stops the schedule for manual disposition. | `test_b5_leftover_nonterminal_slot_stops_relaunch`, `test_prior_stopped_slot_is_not_skipped`, `test_terminal_done_slot_is_skipped` |
| B6 freeze and authorization not read | Before any inference, `preflight()` loads the policy. The schedule must be listed in `authorized_schedules` (only `block1`). `r1b/APPROVAL.json` must name the schedule and this policy's exact sha256. All 27 pinned hashes and the full case manifest must match. `APPROVAL.json` is written only on the user's explicit go, with an account-headroom snapshot. | `test_b6_unauthorized_schedule_refused`, `test_b6_missing_or_mismatched_approval_refused`, `test_b6_frozen_hash_drift_refused`, `test_b6_real_policy_refuses_block2_and_unapproved_block1` |
| B7 reviewer deadline tied to stdout | A reader thread feeds a queue. The main loop checks a monotonic clock every poll, whatever the output, so silence and non-JSON lines cannot bypass it. On the deadline or the response cap it terminates and reaps the process group. The receipt is written in `finally`. Assistant events without an ID are counted separately. A missing or invalid `grades.json` gives `FAILED_INCOMPLETE`. Requested effort (`xhigh`) and init-reported effort are recorded separately. | `test_b7_silence_hits_deadline`, `test_b7_non_json_lines_do_not_bypass_deadline`, `test_missing_grades_is_failed_incomplete`, `test_invalid_grades_json_is_failed_incomplete`, `test_valid_review_counts_ids_and_keeps_effort_distinction` |
| B8 arm name in the final | The designated final's title is always `# Delivered research result`; slot names stay in operational records. `build_review_workspaces_r1b.py` withholds treatment artifacts (bundles, decisions, receipts). It asserts both results in a pair have byte-identical upstream files. It refuses to build if an operational marker appears in a reviewer-visible path or delivered title. Mentions inside verifier-written text are substantive output: they are reported in `leak-scan.json`, never edited. | `test_b8_neutral_title`, `test_title_marker_refused_and_content_mentions_reported`, `test_path_marker_refused` |
| Q1 `'...'` crashes | Returns `empty_quote`. | `test_q1_ellipsis_only_does_not_crash` |
| Q2 `'alpha ...'` labelled exact | An elided quote is exact only if the literal ellipsis itself is found. Otherwise its fragments are a locator result with `scope: fragments`, never exact. | `test_q2_single_fragment_with_ellipsis_is_not_exact`, `test_q2_literal_ellipsis_can_be_exact` |
| Q3 window start reported as match line | `line` is now the actual line where the match starts (binary search over the window); `window_start` is a separate field. The bundle's long-line excerpt uses the actual line. A single-segment field match has `scope: segment` and class `quoted_segment_*`; it is never a match of the whole assertion. | `test_q3_reports_actual_match_line`, `test_long_line_has_omitted_locator_and_excerpt_at_match`, `test_single_segment_scope_is_segment` |

## Unchanged, as the review asked

- Applications and models.
- Native `/goal`.
- The first-package rule (M-control, Z-candidate) and counterbalanced order.
- Four verifier assignments and two xhigh reviews.
- Caps.
- The C07 split (still the preparer's source-grounded ruling).
- Isolation and never-promote rules.

Rev2 block counts on the frozen drafts: M-control 129, Z-candidate 107. Headings are now blocks; rev1 had 126 and 103.

## Still open before launch

- **Account headroom and authority.** These are checked once at go time: Claude `get_usage`, and the Muse usage window after each Muse slot via the runner gate. The result is recorded in `APPROVAL.json`.
- **Reviewer effort.** It stays unconfirmed. `--effort xhigh` is requested, and whatever the stream reports is recorded separately.
- **Muse child calls.** Reminder-child token usage is still unexposed. Counts are reported as a lower bound.
