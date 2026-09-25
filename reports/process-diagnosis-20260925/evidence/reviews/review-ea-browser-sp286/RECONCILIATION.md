# Reconciliation: the author's report against the blind findings

**The report.** The branch carries no report file. The author's report is two things:
- the commit message of `2df56dd8a9`;
- the claims the coordinator relayed in the dispatch.

**Order.** S-01 to S-08 were written against the authority and the bytes before I turned to the report. The commit message had been on screen once, with the first diffstat, but I did not use it for those findings. S-09 and S-10 were added in this step.

**Changes after reading the report.** Three findings changed, and none was withdrawn:
- S-01 was downgraded from blocking to a note. The depth42 branch landed while I was reviewing: `main` moved `ac9c0ad2e4` -> `3ce6eb882c`, with the record at `38b8c1301d`.
- The repair texts of S-02, S-04 and S-07 were made identical to `proposed-edits.patch` after the patch was tested.

| # | Report claim | Checked against the bytes | Result |
|---|---|---|---|
| 1 | Edits Section 15 only; "one dated subsection per family"; newly authored definitions under DL-046. | The diff is Section 15, its 29 shards and 6 index files. The registry `0be544181eda...` (revision `2026-09-11.2`) and every other document are unchanged. Both subsections are dated 2026-09-24 and labelled "newly authored technical owner definition under DL-046". | Confirmed. |
| 2 | `BrowserRuntimeService.workspace` resolves the original creation or reset append after lost acknowledgement or uncertain append "only through" `resolve.v2`. | The text says so, in each subsection, canonical sentence and new criterion. | The description is accurate. S-04: "only through" plus "Missing or conflicting custody keeps the path unavailable" leaves no route when no original event exists. The retained reset text ("Reconcile or retry only the original append identity") and the reset oracle both keep a retry route. |
| 3 | The request is the "original admitted identity/semantic request"; the eleven-field receipt and four-field result join the original event and the synced barrier class. | The join sentences match the Executor's word for word. | S-03: the request is spelled out as `command_instance_id`, key, workspace, generation and (reset) checked owner revision. The revision is not an EventRecord or reset-payload field, and the original event ID is missing. |
| 4 | The owner never requests a first mint and makes no full-value claim without `resolve_full_value.v1`. | Both are stated, in prose and in A006/A005. The Browser owners' retries and replays are semantic-digest checks; nothing claims full-value equality. | Confirmed. This is consistent with SP-286 ("Each full-value-dependent caller must explicitly adopt that separate interface") and with depth42's gap wording. S-06 (note): the first-mint sentence drops "current" and the precedent's barrier/check clause. |
| 5 | The wording follows the Executor's run.started adoption. | Paragraph 1 follows it closely. The new-run formula and the full-value adoption are omitted, which is right for Browser. | Partly. These omissions are not Browser differences: the restore/in-place-restart half (S-02), "Preserve ... actual original event ID" (S-03), "manufacture missing owner records" (S-05), "current" in the first-mint clause (S-06) and the final held-boundary recheck (S-07). |
| 6 | Each unit gains a canonical sentence and a criterion, with SP-286 and CV-339 in `depends_on` and ContractRef. | Index diff: SMPFS-167 and SMPFS-168 are the only units whose content changes (canonical_text, depends_on, acceptance_criteria). Four new edges, and both targets are accepted units. The ContractRef lines resolve (`lint-contractrefs` failures are identical on both exports). PyYAML parses the blocks to exactly the index values. | Confirmed. |
| 7 | Acceptance units go from 26,241 to 26,243. | True at the branch's base `ac9c0ad2e4`: SMPFS-167-A006 and SMPFS-168-A005 are added. | Confirmed for that base. `main` has since moved to 26,257, so after the rebase it will be 26,257 -> 26,259 with 6,728 PlanUnits. I reproduced this in the rebased simulation (S-09). |
| 8 | Shards and index regenerated with the currentness edition present; validate passes; no cycles. | Regeneration with the edition symlinked is byte-identical apart from four timestamps. The shard check passes (99 documents, 2,722 shards). Validate's only failure is the git-dependent retention baseline, and my manual check shows no unit removed. There are no cycle blockers. The readiness report adds exactly one `event_authority_currentness_source_drift` row for Section 15, which is what the edition produces. | Confirmed. |
| 9 | Browser created, reset and admission tests pass. | 63, 53 and 38 OK on the branch and on `main`; the same counts as depth42's static runs. | Confirmed. S-08: none of these tests reads the new text, and no oracle covers A006 or A005. |
| 10 | About 30 plan-sharding rows per subcheck, under the landing check's print cap. | Exactly 30 in each of evidence and plan graph, in both aggregates: 11 -> 41 against `main`, under 50 and 100. | Confirmed, with omissions (S-09). The edit also adds 1 readiness drift row and 3 run-002 plan-migration rows per aggregate, and moves 12 current-snapshot rows in content. It stays under the caps only if it lands before the certified-anchors branch (+132 rows) or after the wave reseal. |
| 11 | Closes the producer gap for both Browser families, making `browser.workspace.reset` 12 of 12. | The depth42 gap text for both producers is "SP-286/CV-339 ... is not adopted by SMPFS-167/168", and that is now answered by name. Created's consumers and oracles are untouched, so it stays PARTIAL there. | Partly (S-10). The producer gap is closed by name. Created reaches at most 10 of 12. Reset's 12 of 12 is a forecast for the next regrade, conditional on S-02. Its oracle cell rests on the existing model cases because A005 has no oracle (S-08). |
| 12 | (Implied) the gap record `reports/event-authority-20260911/step-08-depth42-assessment-20260924.md` backs the DL-046 per-family search. | It was not on the tip or its base, only on the depth42 branch. That branch landed during this review. | Resolved by landing order (S-01, note). The branch still has to be rebased; its index files conflict and must be regenerated. |

## What the report did not anticipate

- **S-02.** SP-286's restore and fresh-operation half is missing.
- **S-03.** The request is defined by fields that are not in the EventRecord.
- **S-04.** No route exists when no original event exists.
- **S-09.** The readiness and plan-migration rows, the currentness test failure, the ordering against the certified-anchors branch, and the index conflict and new counts after the depth42 landing.

## Where the report and the findings agree

- The approach is right:
  - an owner adoption in Section 15;
  - no registry, schema, fixture or Storage change;
  - the v1 reader route and the conditional v2 checkpoint untouched.
- The adoption is by name, the owner never calls `issue.v2`, and full-value is correctly left unadopted.
- The derived files, the counts at the old base, the tests and the 30-row evidence count are all as claimed.
