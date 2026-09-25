# Review: plans/ea-validator-post-august-20260924 (tip 59037bc032, delta 5cd53e7bc2)

**Verdict: fix_then_land. Landing-ready: no.**

There are 11 findings:
- 2 blocking: V-01 and V-02
- 4 should-fix: V-03 to V-06
- 5 notes: V-07 to V-11

The findings are in `findings.jsonl`, and the comparison with the author's report is in `RECONCILIATION.md`. I followed the review form's order:
1. the bytes against the authority, which produced V-01 to V-10
2. then the author's report and evidence
3. then the reconciliation, which added V-11

**How the review was run.**
- I reviewed read-only, with `git archive` exports of `ac9c0ad2e4`, `59037bc032` and `5cd53e7bc2` under this directory, and scratch run trees under `runs/` and `mutation/`.
- Nothing in `/mnt/Cursor/PuppetMaster` was edited, no worktree was created and nothing was pushed.
- Git writes to the shared object store:
  - `git fetch origin`, which the coordinator allowed.
  - One `git merge-tree --write-tree 3ce6eb882c 5cd53e7bc2`, used to check that the branch merges with depth42. It may have left unreferenced tree objects in the shared object store; no ref, index or working-tree file changed.
- For the currentness test, I symlinked the ignored currentness edition into my exports, one directory, read-only. Nothing in it changed.

**Authority read first:**
- DL-039, DL-077 and DL-078 on `main` `ac9c0ad2e4`, both the prose and the PlanUnit sections
- `ANSWERS_SEAL_CHECK.md`, whose SHA-256 is `afdbdd4e...` as cited
- the card `step-10-validator-live-set-card-20260924.md`
- the Step 3 precedent: `1fded9a48e`, the Step 3 receipt `d7800b98...`, `step-03-validation.md`, and the spec and schema diffs
- the depth42 assessment: `ff7dbd59...` at `91bffc84e7`, and `ba9b84f9...` at `3ce6eb882c` for the delta

## What holds

The nine items in the dispatch, in order.

**1. The validator diff.** The bytes go from `bd54afff...` to `f3289d49...` and CRLF is kept: all 1,740 lines end in CRLF, and the CRLF-aware `git diff --check` is clean.
- The change is the DL-077 live-set rule plus its record and receipt machinery.
- With the same inputs, the unmodified check (run A) and the amended check (runs B and C) report the five existing failures byte-identically. The only additions are `post_august_admission_incomplete`, two named checks and one input pin.
- When no family is admitted, `blocking_ledger`, `registered_like` and `live_august` are exactly the old values.
- When families are admitted, only their rows move out of the owner-veto, evidence-gap, unresolved and quarantine blocking checks and out of registered depth. DL-077's "Why" names that representation limit as part of the problem to solve.
- It fails closed for a missing, stale, forged, misnamed, stray or incomplete record, and for an invalid receipt. In that case `unexpected_august_set` still fires for the family.
- The exceptions are V-01, V-02 and V-03, below.

**2. The receipt.**
- It chains from the Step 3 pin: `validator_before` equals Step 3's `validator_after`, and the Step 3 receipt is unchanged.
- It binds the DL-077 prose section `b93a7d76...`, which is identical on `main`, the branch and depth42 `3ce6eb882c`.
- It binds the current validator bytes, and the record contract whose `decision_ref` reads "Jared's decision entry for that family; for a Step 9 registration under DL-078, the Decision Log entry its landing adds, which names the family".
- It names the barred author and lander task, and `seal_authorized`, `admission_authorized` and `contract_depth_complete` are all false.
- Without a valid DL-077 receipt, the Step 3 holding check now fails on the changed bytes. The chain test in the test file shows this.

**3. One change, in Step 3 style.**
- It follows Step 3's pattern: a receipt, a spec section, a schema paragraph, tests in the same file, a report and an evidence directory.
- Nothing applies or prepares a seal. No denominator, closed flag, Spec Lock, registry, ledger, cohort pin, freeze digest or closure hash changes.
- The author stays barred, because the validator pins `seal_applier_forbidden_task` to the author.

**4. The tests.**
- They live in the tracked `tests/test_event_authority_holding_bucket.py`: 13 existing tests plus 11 new ones.
- All 24 pass on both tips, and they exercise fail-closed behavior, the record form and the chain at function level.
- Their integration coverage is thin (V-04).

**5. The three records.** I recomputed each value.
- **Decision entries:** the entries they cite are DL-040 and DL-046. Both name their families, and their section hashes match.
- **Registry before and after:** the revisions, SHA-256 values and family counts match `git show` at the parent and at each admission commit (`b240dd93e2`, `69553720f1`, `4fe66204bd`). The reset pair shares the label `2026-09-11.2`, and the SHAs `e0a368e8` and `6522979e` tell the two registries apart.
- **Live rows:** the registry row hashes match the live rows.
- **Failing criteria:** they equal the pinned assessment: compaction `positive_negative_oracles`; reset `producer`; created `producer`, `consumers_checkpoints` and `positive_negative_oracles`. Nothing is marked passing.
- **Assessment pin:** they pinned `ff7dbd59` at `59037bc032`, and `ba9b84f9` after the delta.
- **Landing record:** the Browser records misstate it (V-06).

**6. The results reproduce.**

| Run | Tree | Failures |
|---|---|---|
| A | `main`, unmodified check | 5 |
| C | branch with the `ff7dbd59` assessment | 6: `post_august_admission_incomplete` for the three families with exactly their failing criteria |
| F | delta tip with the `ba9b84f9` assessment | 6, same as C |
| D | counterfactual, three rows all PASS | 3: census denominator, provisional August rows, August families' depth |
| H | counterfactual at the delta tip | 3, same as D |

- In the counterfactuals, `unexpected_august_set` and the compaction evidence-gap block clear.
- The tracked validator receipt is `9c75a197...` on `main` and on both tips. The branch does not commit a rewritten one.

**7. The spec and schema.**
- They change in Step 3's style: the spec keeps CRLF on all 236 lines and the schema keeps LF.
- Two sentences say more than the code does (V-05, and V-01 for the spec).

**8. Scope.**
- Each of the five commits touches exactly the paths its message names.
- No sharded Plans document is edited. `Plans/.audits/**` is neither a sharding source nor in any evidence bundle, and the currentness corpus excludes `Plans/.audits/**` and `reports/**`.
- In my exports, `validate-plan-graph` (12 on both), `validate-audit-closure`, `validate-audit-status-index`, `validate-evidence` and `check-project-artifacts` are identical on `main` and the branch, apart from timestamps. The branch cannot raise the plan-graph check.

**9. Landing order.**
- The branch must land after `plans/ea-step08-depth42-20260924`, and only while its assessment still hashes to `ba9b84f9...`. On `main` plus this branch alone, the three families fail with `depth_assessment.sha256` (runs B and G).
- The two branches share no path and merge cleanly. Depth42 leaves the DL-040, DL-046 and DL-077 sections unchanged; it changes only DL-078.
- The validator requires `lander_task` to equal the author, so only `claude-opus-5.5:dl039-steps-8-9-20260924` can land it truthfully.
- Nothing else orders it. `origin/fix/packet-gap-closure-20260911-landing-dc5` also touches the registry, but it is a stale bulk-Browser branch from 2026-09-11.

## What must change before landing

DL-077 allows no validator edit after this one. So everything in the validator has to be right now; it cannot be patched later.

**V-01 (blocking): a record can cite any Decision Log entry.**
- The code checks only the `decision_ref` format and the section hash.
- In the all-PASS counterfactual, I re-cited `browser.workspace.created` to DL-041 (the Settings DRY-guard decision), to DL-040 and to DL-077. Each time it was admitted, with no issue reported.
- DL-077 requires "Jared's decision entry for that family", with a mismatched record failing closed. DL-078, the receipt's record contract and the new spec section all say the entry names the family.

**V-02 (blocking): the depth row is matched by event type only.**
- A row that graded another family id, or revision 9.9.9, was accepted.
- The check that closes this changes no current result: all 42 rows match the registry today.

**Should fix in the same pass:**
- **V-03:** a PASS without any evidence under `Plans/` is accepted. That is looser than the `cell_ok_pass` citation rule the family's own ledger row faced. All 335 PASS cells in the assessment carry Plans evidence today.
- **V-04:** no test runs `main()`. 13 of 19 mutations survive, including every change to `main()` and the before/after SHA-256 difference check.
- **V-05:** the schema and spec overstate how far the ledger row stops counting.
- **V-06:** the Browser records say `"record": null`, but both landings left root-review records.

## Exact edits to land

All the files below are in `proposed/`.

**`validator-repairs.patch` (V-01, V-02, V-03).** The full repaired file is `pm_event_authority_independent_validator.repaired.py`: 1,752 lines, all CRLF. The repair adds three checks in `admission_record_problems`:

```python
        named = re.search(rb"(?<![A-Za-z0-9_.])" + re.escape(str(event_type)).encode() + rb"(?![A-Za-z0-9_]|\.[A-Za-z0-9_])", section)
        if match.group(1) in ("DL-077", "DL-078") or not named:
            problems.append("decision_ref_not_for_family")
...
    if (rows[0].get("family_id") != family.get("family_id")
            or rows[0].get("family_revision") != family.get("family_revision")):
        problems.append("depth_assessment.family_revision")
        return problems
...
    uncited = [f for f in EVIDENCE_FIELDS if f not in failing and not any(
        isinstance(e, dict) and str(e.get("path", "")).startswith("Plans/")
        for e in (cells[f].get("evidence") if isinstance(cells[f].get("evidence"), list) else []))]
    if uncited:
        problems.append("depth_pass_without_plans_evidence:" + ",".join(uncited))
```

After applying it, rerun the author's `write_receipt.py` so that `validator_after_sha256` names the new bytes.

**`tests-repairs.patch` (V-04).**
- The fixture rows gain `family_id`, `family_revision` and an evidence item.
- Nine tests are added, for 33 in total. Three of them run `main()` with `RECEIPT_DIR` pointed at the temporary root.

**`docs-repairs.patch` (V-05, and the spec sentences for V-01 to V-03).** It keeps CRLF in the spec and LF in the schema.

**`records-repairs.patch` (V-06).**
- Created: `"record": "reports/packet-gap-closure-20260910/browser-workspace-created-root-review-20260911.json"`, plus a note naming the verification record.
- Reset: `"record": "reports/packet-gap-closure-20260910/browser-workspace-reset-root-review-20260911.json"`.

**The report (V-11).** The wording changes are listed in the finding.

**What the repairs do, verified in scratch trees** (`logs/run-R-*`, `logs/probe_gaps_repaired.log`, `logs/mutation-repaired.log`):
- Live: still 6 failures, with the same three `depth_incomplete` issues and no new issue for the current records.
- Counterfactual: still 3 failures, with all three families admitted.
- The probes that V-01, V-02 and V-03 describe now fail closed, with `decision_ref_not_for_family`, `depth_assessment.family_revision` and `depth_pass_without_plans_evidence`.
- The 33 tests pass on the repaired validator. On the current validator, exactly the three new V-01, V-02 and V-03 tests fail, 9 subtests in all.
- Mutation survivors drop from 13 to 3: the `depth_blocking` entry, the `..` path check and the redundant DL-077 token check.

## Landing procedure

1. **Apply the edits on the branch.**
   - Apply the four patches, regenerate the receipt, and amend the report.
   - Run `python3 -m unittest tests.test_event_authority_holding_bucket`; expect 33 OK.
   - Run the author's harness, live and `--all-pass`, against the depth42 assessment; expect 6 and 3 failures.
   - Commit per concern, as before.
2. **Wait for depth42.**
   - Land nothing until `plans/ea-step08-depth42-20260924` is on `main`.
   - Confirm that `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` on `main` still hashes to `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`. If it does not, re-pin the three records first.
3. **Land it as the author task.**
   - Rebase onto `main`, then land as `claude-opus-5.5:dl039-steps-8-9-20260924` under the landing lock: fast-forward, shard check, `pm-landing-check.py --base origin/main`, push.
   - If another agent has to land it, stop, because the receipt's `lander_task` cannot be changed without another validator edit.
   - This branch edits no sharded Plans document, so no reseal is expected from it.
4. **Maintain the pins after landing.**
   - The records pin the three registry rows, the DL-040 and DL-046 prose sections and the assessment bytes. Any later change to one of them must re-pin the records in the same landing.
   - The receipt pins the DL-077 prose section. An edit to it would make the check fail closed until the receipt is re-issued.
   - Every DL-078 registration landing must add its family's record in the same landing.

## Not verified

- `pm-landing-check.py` itself, and `run-gates` and `audit-governance` as a whole. I compared only the five subchecks named in item 8, on exports without `Concepts`.
- The currentness CLI `validate`. It refuses a symlinked edition, so I used `test_pm_pnc019_currentness` instead: the same single `Decision_Log.md` drift appears on `main` and on the branch.
- The correctness of the depth42 grades themselves. I checked only that the records transcribe them.
- Whether DL-040 and DL-046 are the best entries to cite, beyond naming their families. DL-077's own text attributes these admissions to DL-039/DL-040 and DL-046.

## What I ran (logs/)

- **Setup:** `fetch.log`, `revparse*.log`
- **Authority checks:** `answers_sha.log`, `depth42_sha*.log`, `section_hash.py` and `section_hashes.log`, `registry_state.py` and `registry_states.log`, `registry_row_sha.log`
- **Validator runs:** `mkrun.sh` and `runval.sh`; `run-{A,B,C,D,F,G,H,R-*}.out` and `.receipt.json`; `compare-A-vs-B-C.log`; `make_counterfactual.py`
- **Probes and mutation tests:** `probe_gaps.py`, `probe_gaps*.log`, `../mutation/mutate.py`, `mutation*.log`
- **Test runs:** `tests-{main,branch,delta}.log`, `test_pm_pnc019_currentness-{main,branch}.log`, `test_pm_emit_only_event_boundaries-branch.log`
- **Subcheck comparisons:** `chk-*-{main,branch}.json`, `chk-summary.log`, `currentness-validate-*.json`
- **Depth42 checks:** `depth42_three_families.txt`, `depth42_delta_three_families.txt`, `depth42_pass_evidence.txt`
- **Diffs:** `validator.diff`, `docs.diff` and `tests.diff`, at the top level

After the review I removed the large scratch trees (`export-main`, `export-branch`, `runs/`, `mutation/tree`) to free disk; `git archive` of the three commits recreates them. I kept `export-delta/`, `authority/`, `proposed/` and `logs/`, which hold every run's stdout and receipt. I unlinked the two edition symlinks before removal, and the shared edition is untouched.
