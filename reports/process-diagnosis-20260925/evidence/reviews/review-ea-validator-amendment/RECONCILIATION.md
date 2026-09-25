# Reconciliation: the author's report against the blind findings

**Report:** `reports/event-authority-20260911/step-10-post-august-amendment-20260924.md`, read at `59037bc032` and at the delta `5cd53e7bc2`.

**Order of work:**
- I read the report only after writing V-01 to V-10 to `findings.jsonl` (timestamp in `logs/findings-written-at.txt`, 23:26:18Z).
- V-11 was added afterwards and is marked as a reconciliation-step finding.
- I withdrew no blind finding and changed none of their texts after reading the report.

**Evidence directory:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-10-post-august-amendment-20260924/`.
- Its `SHA256SUMS` hashes to `2cbfed75...`, which is the value the tip's report cites.
- All 16 entries verify with `sha256sum -c`.
- The `validator.diff` it holds equals mine.
- Its three harness outputs match my runs, outcome for outcome.

| # | Report claim | Checked against the bytes | Result |
|---|---|---|---|
| 1 | DL-077 authorizes one more receipted change, the second after DL-039's holding bucket; the author/lander `claude-opus-5.5:dl039-steps-8-9-20260924` is barred from the seal. | DL-077 prose and PlanUnit on `main`. Receipt `author_task` = `lander_task` = `seal_applier_forbidden_task`, and the validator pins all three to that identity. | Confirmed. V-07 adds a consequence: because `lander_task` is pinned, only that task can land the branch truthfully. |
| 2 | "Now a later family counts only through a complete admission record, and everything else fails closed." | Probes in an all-PASS counterfactual tree. | **Not fully.** Three kinds of record are accepted that DL-077 says must fail closed:<br>- a record that cites a Decision Log entry that is not the family's (V-01, blocking)<br>- a depth row for another family id or revision (V-02, blocking)<br>- a PASS without evidence (V-03) |
| 3 | Validator `bd54afff...` to `f3289d49...`, with CRLF on every line. It adds five named functions; the live-set rule excludes only completely recorded families; `post_august_admission_incomplete` blocks depth and overall pass; the check's own receipt pins this receipt. | Hashes match. All 1,740 lines end in CRLF. The diff is limited to those functions, constants and four call sites in `main()`. Runs A and C: the five existing failures are byte-identical in detail, and the only additions are the new failure, two named checks and one input pin. | Confirmed. |
| 4 | "A completely recorded family's old quarantine ledger row no longer counts as blocking" (report and spec); "is judged by its record" (schema note). | `blocking_ledger` feeds only the owner-veto, evidence-gap, unresolved and quarantine checks. The provisional, evidence-shape, ADMIT_CANDIDATE, inference and denominator checks still read the row. | Overstated (V-05). |
| 5 | The receipt binds DL-077 (`b93a7d76...`), the Step 3 pin, the new bytes, the record contract and the barred task; the three flags are false; its SHA-256 is `10cde310...`. | I recomputed the DL-077 section hash on `main`, the branch and depth42 `3ce6eb882c`: all `b93a7d76...`. `validator_before` equals the Step 3 receipt's `validator_after`. The Step 3 receipt is unchanged (`d7800b98...`). `owner_response` matches `decision-responses.jsonl` line 19 and `ANSWERS_SEAL_CHECK.md` (`afdbdd4e...`). | Confirmed. V-08 (note): nothing pins this receipt's own hash, unlike Step 3's rows. |
| 6 | 24 tests covering missing, stale, forged and incomplete records, the registry growing by exactly one, misnamed files, an invalid receipt and changed DL-077 text. | All 24 pass on `59037bc032` and `5cd53e7bc2`. Mutation run (`logs/mutation.log`): 13 of 19 mutations survive, including every change to `main()`, the before/after SHA-256 difference check and the file-name check, which the uniqueness check masks. | Pass confirmed; coverage overstated (V-04). |
| 7 | A complete record names Jared's decision entry for the family; for Step 9 it is the DL-078 landing entry that names the family. | The code checks the entry's format and hash only. | Stated but not enforced (V-01). |
| 8 | The records pin the depth42 assessment, re-pinned from `ff7dbd59...` to `ba9b84f9...` after that branch's review cycle 2. | `ba9b84f9...` is the real hash at `3ce6eb882c`. The three families' rows are byte-identical between the two versions; only three other rows and the `method`/`evidence` blocks changed. | Confirmed. |
| 9 | Registry before and after: compaction `2026-08-27.1` (39, `b7e124a9`) to `2026-09-11.1` (40, `80d9caae`); created to `2026-09-11.2` (41, `e0a368e8`); reset to `2026-09-11.2` (42, `6522979e`). The same label, with different SHAs. | Recomputed from `git show` at the parents and the commits `b240dd93e2`, `69553720f1` and `4fe66204bd`. The live row hashes match. | Confirmed. |
| 10 | Failing criteria: compaction oracles; reset producer; created producer, consumers and oracles. No record claims a pass the assessment does not show. | Pinned assessment rows; `criteria_not_passing_at_recording`; my live runs C and F report the same lists. | Confirmed. |
| 11 | The Browser records' `admission_landing.record` is `null` (the report does not discuss this field). | `69553720f1` added the created root review, `f359b6aed3` its verification, and `4fe66204bd` the reset root review. `write_admission_records.py` hard-codes `None`. | V-06. |
| 12 | Results "on this branch": unmodified check 5 failures, amended check 6, counterfactual 3; tracked receipt unchanged. | Reproduced: run A 5, runs C and F 6, runs D and H 3. The tracked receipt is `9c75a197...` on `main` and on the branch. But on the branch alone (runs B and G), the three families fail `depth_assessment.sha256`, because the assessment lives on depth42; the author's harness supplied that file from outside. | Numbers confirmed; the environment is unstated (V-11). |
| 13 | "A harness that loads the check from its own path and redirects only its receipt output." | `run_validator_harness.py` also sets `v.REPO` to a scratch reports tree. | Imprecise (V-11). The claim that matters, that the tracked receipt is unchanged, holds. |
| 14 | `test_pm_pnc019_currentness`: 1 failure, the `Decision_Log.md` drift that `main` has had since DL-077/078. `test_pm_emit_only_event_boundaries` OK. | I symlinked the ignored currentness edition into both exports. The same single failure (`event_authority_currentness_source_drift`, `Plans/Decision_Log.md`) appears on `main` and on the branch, and the emit-only test gives 13 OK. The currentness CLI `validate` refused the symlinked edition ("escapes its custody root"), so I relied on the test and on the script's exclusion of `Plans/.audits/**` and `reports/**` from its corpus. | Confirmed. |
| 15 | "Scope. No Plans document, shard, index, registry row, ledger, ... changes." | No sharded Plans document, shard, index, registry or ledger changes. Two `Plans/.audits` documents and the validator do change. `validate-plan-graph`, `validate-audit-closure`, `validate-audit-status-index`, `validate-evidence` and `check-project-artifacts` give identical results on `main` and the branch. | Substance confirmed; wording imprecise (V-11). |
| 16 | Landing notes: lands after depth42; the seal is not applied here. | No path overlap with `3ce6eb882c`, and a clean merge. DL-040, DL-046 and DL-077 sections are unchanged there. Nothing touches the denominator, a seal artifact or Spec Lock. | Confirmed. V-07 adds the lander constraint and the pins to maintain after landing. |

## What the report did not anticipate

- **V-01 (blocking):** the decision entry is never checked to be the family's own.
- **V-02 (blocking):** the depth row is never checked against the registered family id and revision.
- **V-03:** a PASS needs no evidence, which is looser than the `cell_ok_pass` rule the same family faced before.
- **V-04:** no test runs `main()`.
- **V-06:** the Browser landing records exist.
- **V-07:** only the author can land it, and the pins it creates have to be maintained.
- **V-10:** "current" is not tied to the live registry. This is a question for the coordinator.

## Where the report and the findings agree

- **The design.** It is one receipted change in Step 3 style, chained from the Step 3 pin. It fails closed when a record is missing, stale, forged or incomplete, and it leaves every other check's behavior unchanged.
- **The records.** They carry the right registry history and the pinned failing criteria, and they claim no pass.
- **The numbers.** The runs reproduce: 5, 6 and 3 failures, 24 tests, and the tracked receipt unchanged.
- **The landing order.** The branch lands after depth42.

## Delta `5cd53e7bc2` (coordinator's request)

- It touches only the three admission records (the depth pin and `recorded_at_utc`) and two lines of the report: the assessment pin, and the evidence `SHA256SUMS` hash.
- `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd` is the real SHA-256 of `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` at `3ce6eb882c`.
- The failing criteria recorded in the three records still match that assessment, and the three rows are unchanged from `ff7dbd59`.
- At the delta tip, with that assessment present, I reproduced:
  - 6 failures live, with the same three `depth_incomplete` issues
  - 3 failures in the counterfactual
  - 24 tests OK
