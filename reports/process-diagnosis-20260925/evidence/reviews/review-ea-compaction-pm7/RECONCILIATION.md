# Reconciliation: the author's report against the blind findings

**Report:** `reports/event-authority-20260911/step-08-compaction-pm7-validator-20260924.md`, read at `a3f68cbaf0` (SHA-256 `14a412c2839e...`, 39 lines, LF).

**Order of work:**
- I opened the report only after C-01 to C-08 were in `findings.jsonl` (`logs/findings-written-at.txt`, 00:06:27Z).
- C-09 comes from this step and is marked as such (`logs/reconciliation-appended-at.txt`, 00:08:22Z).
- No blind finding was changed or withdrawn after I read the report.

**Evidence the report cites:** it cites no evidence directory or hashes. Its checks are three commands, and I reran all three.

| # | Report claim | Checked against the bytes | Result |
|---|---|---|---|
| 1 | The depth assessment grades compaction at 11 of 12. The one PARTIAL cell is oracles, because ATS-040 (`Automated_Testing_System.md` 3701) requires the checker to pass and it cannot. | `ba9b84f9...` at `38b8c1301d`: 11 PASS, `positive_negative_oracles` PARTIAL with that finding. Line 3701 is the ATS-040 criterion ending "PM7 GUI fixture validator ... must also pass together." | Confirmed. The assessment exists only on main, not on the branch's tree (C-07). |
| 2 | The same three failures sit in main's subcheck, 3 of the baseline's 1,470, and they are named. | The baseline's `run-gates` and `audit-governance` each report 1,470, and each has exactly these three PM7 buckets. My run on the main export gives the same three. | Confirmed. |
| 3 | The checker was not updated at Step 6 (registry `2026-09-11.1`). The Step 6 fixtures replaced the two old names with the committed-completion positive and six negatives. | Step 6 diff `b240dd93e2`. The Step 6 report and check summary say the PM7 validator stayed byte-identical. | Confirmed. |
| 4 | "No Plans document names the old two." | `git grep` over `Plans/` at `38b8c1301d`, including shards, index, ledgers and `.audits`, finds none. Only the script and the depth42 JSON name them. | Confirmed. |
| 5 | `81a7c1caed` "accepts exactly `context.compaction.completed`, with its family ID ... and payload schema ...". | The code compares only `family_id` and `payload_schema_id`. Probes accept a changed revision, schema pointer, scope or retention, and a started alias. | **Overstated.** C-01 (blocking) and C-04 cover the code; C-09 covers the wording. |
| 6 | "A changed identity, a duplicate or a missing admitted family now fails, where it was previously accepted silently." | Main-script probes: a changed identity (R8, R9) and a duplicate or extra family (R10, R11) failed as `forbidden_context_compaction_event_family`. Only a missing family (R12) passed silently. | **Inaccurate for two of the three.** C-09. |
| 7 | `766de902ca` adds five tests: acceptance, another family forbidden, a changed identity, missing or duplicated, and current names. | The five tests are as described, and they pass. All of them call the helper or read the constants; none runs `validate()`. Mutations M1 to M4 survive. | The description is confirmed. The coverage gap is C-03, which the report does not mention. |
| 8 | Checks: validate fails with the three and then passes; the gate subcommand passes; 12 tests OK (7 before). "Worktree, base `main` `ac9c0ad2e4`." | Reproduced on the main, tip and rebased exports, including the module-form unittest. | Confirmed. `ac9c0ad2e4` is no longer main, so the checks should be restated after the rebase (C-07, C-09). |
| 9 | "Canon. No Plans document, registry, fixture or governance artifact changes." | The diff touches none. | Confirmed. |
| 10 | "Landing check. It should report the three failures as resolved in each aggregate, and add no Plans rows." | Full `run-gates` and `audit-governance` on main and on the rebased tree: only the PM7 subcheck changes, from 3 to 0, and every other total is identical. `pm-landing-check.py` reports resolved buckets as "Gone since the baseline". | Confirmed. I did not run the landing check itself, because the exports are not git repositories. |
| 11 | "The oracle cell's stated reason goes away. Its grade moves only at the next regrade, which would then show compaction at 12 of 12." | The first two sentences match C-06. The third predicts the regrade. The passing checker still asserts a committed Compact Now carries no event, which C-05 says a regrade must weigh. | **Overstated in its last clause.** C-09 (and C-05, which the report does not mention). |
| 12 | "DL-077. The family's admission record passes once it is re-pinned to that regraded assessment." | No admission record exists on main: `git ls-tree` shows no `admission-records` directory. The DL-077 amendment is on an unlanded branch, whose own review asked for fixes. The record passes only with a 12-of-12 regrade. | **Premature.** C-09. |
| 13 | "Scope. The validator's other rules (usage, shared fixtures, workspace events, status bar, command contracts) are unchanged." | True. One of the unchanged shared-fixture rules is the open-drawer Compact Now `event_types: []` expectation, which contradicts DL-040 as ATS-037 now reads. | Confirmed, but it omits C-05. |

## What the report did not anticipate

- **C-01 (blocking):** the identity check does not pin revision, schema pointer, scope or retention.
- **C-02 (blocking):** a competing fix, `96ab84f13c`, of the same lines is on two live branches of the packet-canon-closure thread.
- **C-03:** no test runs `validate()`.
- **C-04:** a started or failed alias on the admitted row passes.
- **C-05:** the open-drawer Compact Now no-event assumption survives in the checker and its tracked fixture.
- **C-07:** the branch needs a rebase. Its subject file exists only on main.
- **C-08:** the authority for editing this validator. The report does cite ATS-040's requirement, which partly answers this, but it does not address DL-039's and DL-040's "no validator changes" wording.

## Where the report and the findings agree

- **The defect.** It is exactly the three baseline failures, and they come from the blanket prefix prohibition and the two superseded names.
- **The fix.** The required names are exactly Step 6's, with nothing else in the script loosened.
- **The results.** Main fails with three and the branch passes. The gate subcommand passes. The tests give 12 OK.
- **The landing effect.** The three PM7 buckets go in both aggregates and nothing new appears.
- **The grade.** The branch does not change it. Only a regrade can.
