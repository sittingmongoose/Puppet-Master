# Recheck, cycle 2: plans/ea-validator-post-august-20260924 at c3d5193d98

**Landing-ready: yes.**
- Both blocking findings (V-01, V-02) and all four should-fix findings (V-03 to V-06) are repaired in the bytes.
- The notes V-07, V-08 and V-11 are repaired as well. V-09 and V-10 are accepted: V-09 stays an open item, and V-10 is settled by the coordinator's ruling.
- Nothing is still open. Per-finding evidence is in `rechecks.jsonl`, with a copy in `cycle2/`.

## How this was checked

**Setup.**
- I fetched origin. `c3d5193d98` sits on `origin/main` `38b8c1301d`, which contains the depth42 landing: `3ce6eb882c` is an ancestor. The depth42 branch ref has been deleted.
- I exported the validator inputs and the test file from the tip and from `38b8c1301d` with `git archive` into `cycle2/`. I did not read the author's worktree.
- I edited nothing in the repository and did not run `git merge-tree`.

**Scope.**
- `git diff --name-status 38b8c1301d c3d5193d98` names the same nine paths as cycle 1: the validator, the spec, the schema, the receipt, the three records, the report and the test file.
- Each of the 16 commits touches only the paths its message describes.
- `.gitignore`, the registry (still `0be54418...`), the ledgers, the census denominator, the Decision Log, Spec Lock and the tracked validator receipt (still `9c75a197...`) are untouched. Nothing applies or prepares a seal: the receipt's three flags are false, and every record says `incomplete_depth`.
- The CRLF-aware `git diff --check` is clean.

**Bytes.**
- Validator: `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`, with CRLF on all 1,754 lines. It equals my cycle-1 proposed repair plus the two V-08 lines.
- Spec: CRLF on all 236 lines. Schema: LF on all 115 lines, and byte-identical to my proposed text.

**Receipt.**
- `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`. Its `validator_after_sha256` equals the tip validator, and `validator_before_sha256` equals the Step 3 pin `bd54afff...`.
- The Step 3 receipt is unchanged (`d7800b98...`).
- `authority_section_sha256` `b93a7d76...` equals the DL-077 section on the tip. The DL-040 and DL-046 sections are unchanged after depth42 landed.

**Records.**
- Each pins `implementation_receipt_sha256` = `dceb7f21...`, the receipt file's hash, and the assessment `ba9b84f9...`, the file's hash on `main` and on the tip.
- Their failing criteria still match the assessment.

## Results reproduced (`cycle2/logs/run-*`)

| Run | Tree | Failures |
|---|---|---|
| A2 | unmodified check on `38b8c1301d` | 5: `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete` |
| C2 | tip, live | 6: the same five, byte-identical in detail, plus `post_august_admission_incomplete`<br>created: `producer`, `consumers_checkpoints`, `positive_negative_oracles`<br>reset: `producer`<br>compaction: `positive_negative_oracles` |
| D2 | tip, counterfactual with the three rows at twelve PASS | 3: census denominator, provisional August rows, August families' depth; all three families admitted |

In the counterfactual, `unexpected_august_set` and the compaction evidence-gap block clear. The author's cycle-2 harness outputs match mine.

## Probe set: every probe fails closed (`cycle2/logs/probes_cycle2.log`, 15 of 15)

- **V-01, `decision_ref_not_for_family`:**
  - `browser.workspace.created` citing DL-041, DL-040, DL-077 or DL-078
  - `context.compaction.completed` citing DL-077 or DL-078
  - DL-077 names both families, so those two cases are rejected only by the explicit exclusion.
  - A full `main()` run with created citing DL-041 leaves created unadmitted, lists it in `unexpected_august_set` and reports `post_august_admission_incomplete`.
- **V-02, `depth_assessment.family_revision`:** a depth row with a foreign `family_id`, and one at revision `9.9.9`.
- **V-03, `depth_pass_without_plans_evidence:retention`:** a PASS with the evidence key removed, with an empty list, with only a `reports/` path, and with a string instead of a list.
- **V-08, `implementation_receipt_sha256`:** a differing hash, a missing field, and the receipt edited after the records. In the last case all three records fail and nothing is admitted.

As the V-10 ruling intends, an assessment whose registry block names the old 39-family registry, with unchanged rows, is still admitted.

## Tests and mutation set (`cycle2/logs/tests-tip.log`, `cycle2/logs/mutation-cycle2.log`)

- `tests.test_event_authority_holding_bucket`: 34 tests, OK.
- Cycle-1 mutation set M1 to M19 against the 34 tests: three survivors.
  - M9: `post_august_admission_incomplete` removed from `depth_blocking`.
  - M16: the `..` path check.
  - M17: the redundant DL-077 required-token check, which the section hash already covers.
  - These are the three residuals the cycle-1 repair text named. They are recorded as an open question, not argued further.
- New-check mutations N1 to N6 are all killed:
  - N1 and N2: the V-01 check, and its DL-077/078 exclusion.
  - N3 and N4: the V-02 check, and its revision half.
  - N5: the V-03 check.
  - N6: the V-08 check.

## Dispositions

| Finding | Disposition | Verified |
|---|---|---|
| V-01 (blocking) | Repaired | Code, spec sentence and test; six probes and a full `main()` run fail closed; N1 and N2 killed |
| V-02 (blocking) | Repaired | Code and spec; two probes fail closed; N3 and N4 killed |
| V-03 | Repaired | Code and spec; four probes fail closed; N5 killed |
| V-04 | Repaired | 34 tests, including three `main()` tests; survivors down from 13 to 3 (M9, M16, M17) |
| V-05 | Repaired | Schema byte-identical to the proposal; spec carries the proposed sentence; line endings kept |
| V-06 | Repaired | The Browser records cite both root reviews, plus the created verification record in a note |
| V-07 (note) | Repaired | Depth42 is on `main` with `ba9b84f9...`; the landing notes state the order, the lander rule, the re-pin rule and the Step 9 rule. The lander rule still has to be honored at landing. |
| V-08 (note) | Repaired | Validator requirement, record contract, records pinning `dceb7f21...`, and a test; three probes fail closed; N6 killed |
| V-09 (note) | Accepted | Recorded as an open item; `.gitignore` untouched. The line waits for Jared. |
| V-10 (note) | Accepted | The coordinator's per-family currentness ruling is stated in the spec and the report, and the V-02 check enforces it |
| V-11 (note) | Repaired | The report's wording is corrected. The evidence subdirectory is cited correctly as `cycle2-20260924T2343Z/`: `SHA256SUMS` `41adfb43...`, 25 files, all verify. The top level is not rewritten (`2cbfed75...`, 16 files verify, nothing newer than 23:15). |

## Open questions recorded (cycle cap reached)

- **The `.gitignore` line** `!/tests/test_event_authority_holding_bucket.py` (V-09). It predates this branch and waits for Jared.
- **The three residual mutation survivors** M9, M16 and M17 (V-04). They are low value, and none of them can let an incomplete record through.

## For the landing

- **Lander.** The author task `claude-opus-5.5:dl039-steps-8-9-20260924` lands it under the landing lock. If anyone else has to land it, stop, because `lander_task` is pinned.
- **Before pushing.** Confirm that `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` on `main` still hashes to `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`, and that the receipt still hashes to `dceb7f21...`.
- **Not verified here.** I did not run `pm-landing-check.py`, and I did not re-run `run-gates` or `audit-governance`. The changed paths are the same as in cycle 1, where the plan-graph, audit-closure, audit-status-index, evidence and project-artifact subchecks matched `main`.
