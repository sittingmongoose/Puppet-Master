# Blind review: Step 8(a) depth assessment of the 42 families (branch `plans/ea-step08-depth42-20260924`)

**Verdict: fix_then_land.** 8 findings, 1 of them blocking.

- **Reviewed commit:** `05716b4005`, the report commit. Since then the branch has gained `1cb3b92cb3`, which changes only `step8-9-progress-20260924.md`.
- **Canon checked at:** `2d85b37488`. The only Plans files that differ between `f1ce058ccd` and `2d85b37488` are governance artifacts. No `Plans/*.md` owner document changed.
- **Mode:** read-only. Nothing in the repository was edited.

## What holds

- **Arithmetic (check 3): all correct.**
  - Totals: 336 PASS / 143 PARTIAL / 13 CONFLICT / 12 ABSENT, 504 cells.
  - The per-criterion counts, the per-family PASS counts, the complete flags and the disposition counts (27/7/8) are all correct.
  - The three complete families are right, and so are the eight families one criterion short.
  - Against the dated matrix (`step-08-depth-assessment.json`, SHA-256 `34e9295c…`), computed independently: 201/186/42/39 moves to 305/138/13/12.
  - 133 cells rose to PASS (92 from PARTIAL, 26 from CONFLICT, 15 from ABSENT). 29 fell from PASS to PARTIAL. 15 improved without reaching PASS. 291 are unchanged.
  - `change_against_prior` (343/129/32) reconciles with the dated-matrix view: 29, minus `restore_point.expired` oracles (carried against its supplement), plus the 4 cells downgraded only against later supplements, gives 32.
- **JSON and Markdown agree (check 5).** All 42 rows match in order, disposition, the 12 letters and the PASS count. The row order and family ids and revisions match the registry at `0be54418…`. The committed JSON matches the evidence `compiled_rows.json` field for field.
- **Quotes (check 2).**
  - All 2,626 quotes are exact substrings of their cited ranges at both `f1ce058ccd` and `2d85b37488`.
  - Every recorded `excerpt_sha256` matches.
  - The evidence directory passes `sha256sum -c`, and the `SHA256SUMS` hash matches the report.
- **Citations (check 4).** Every evidence path is canon: `Plans/**`, 3 `tests/**` files and 1 `scripts/**` file. No cell cites a `reports/` path as evidence. Two caveats:
  - Some oracle findings count suites that canon reaches only through a report (G-07).
  - One PASS is given on a facet that the report's own reasoning treats as open (G-01).
- **Rubric (check 1).**
  - The twelve criteria have the same names and order as the Browser pair assessment.
  - The rules that lower cells all exist in `rubric.md`.
  - The Markdown does not state most of them, and gives no canon basis for any (G-02). Its producer rule is also stricter than the Browser pair's (G-04).

## Sample: 47 cells, 29 families

Grades were re-derived from canon at `2d85b37488`. Every sampled cell's quote was exact. "Agree" means my grade matches the report's.

| # | Family | Criterion | Report | Mine | Governing passage |
|---|---|---|---|---|---|
| 1 | goal.created | producer | PASS | agree | storage-plan.md:23832, 23853, 23869-23873 (SP-294 ContractRef/depends_on SP-286; shared first-receipt roles); GRS-066 Goal_Runtime_System.md:6148 |
| 2 | goal.created | consumers_checkpoints | PASS | agree | storage-plan.md:24131 (SP-298 none_required, SP-278 admission mandatory); 24163 (no durable handle) |
| 3 | goal.created | positive_negative_oracles | PASS | agree | goal_start_command_contract_fixtures.json (18 valid, 12 invalid); Goal_Runtime_System.md:6192-6197 |
| 4 | goal.created | compatibility_withdrawal | PASS | agree | Contracts_V0.md:22372; storage-plan.md:23847 |
| 5 | run.started | producer | PASS | agree | Executor_Protocol.md:7285 ("explicitly adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2`") |
| 6 | run.started | consumers_checkpoints | PASS | agree | storage-plan.md:21119 (nine-field digest; snapshot id not persisted). The redb_snapshot_id in event_index_consumer_adoption.schema.json is on non-persisted adapter inputs ("not a persisted new canonical artifact") |
| 7 | run.started | positive_negative_oracles | PASS | agree | ATS RUN-P/N; fixture tokens only on adapter inputs |
| 8 | restore_point.deleted | producer | PASS | agree | storage-plan.md:22216 ("explicitly adopted SP-286 append-owner protocol") |
| 9 | restore_point.deleted | transitions | PASS | agree | storage-plan.md:22210-22216 |
| 10 | restore_point.deleted | consumers_checkpoints | PASS | agree | storage-plan.md:22244; the deleted checkpoint schema has no token |
| 11 | restore_point.deleted | positive_negative_oracles | PASS | agree | pinned suite v3 (sha `62bbf9a0…` verified). Its redb_snapshot_id occurrences are on adapter inputs only |
| 12 | browser.workspace.reset | producer | PARTIAL | agree (G-04, G-05) | S15:11626-11628; storage-plan.md:22035-22036 |
| 13 | browser.workspace.reset | consumers_checkpoints | PASS | agree | S15:11658-11660; storage-plan.md:21195 (DL-076 amendment) |
| 14 | platform.capability_evaluated | consumers_checkpoints | PARTIAL | agree on grade (G-08) | storage-plan.md:23442, 23492 |
| 15 | platform.capability_evaluated | retention | PASS | **PARTIAL, or the siblings PASS (G-01)** | storage-plan.md:17950; storage_value_registry.json:368; registry:923; storage-plan.md:23548 |
| 16 | storage.boot_recovery | retention | PARTIAL | agree | storage-plan.md:23548 (SP-291 names the seam) |
| 17 | storage.recovery_applied | retention | PARTIAL | inconsistent with #15 (G-01) | as #15 |
| 18 | storage.compaction_lifecycle_changed | retention | PARTIAL | inconsistent with #15 (G-01) | as #15 |
| 19 | goal.completed | closed_payload_schema | CONFLICT | agree | Goal_Runtime_System.md:1792, 425, 431, 148 |
| 20 | goal.completed | transitions | CONFLICT | agree | Goal_Runtime_System.md:3631, 95 |
| 21 | goal_run.stopped | transitions | PARTIAL | agree (Workflow status is live: GRS-065 6087, GRS-080 7500) | Goal_Runtime_System.md:3766, 7883-7884 |
| 22 | goal_run.blocked | closed_payload_schema | CONFLICT | agree | Goal_Runtime_System.md:7437, 7502 |
| 23 | goal.receipt_recorded | transitions | CONFLICT | agree | Goal_Runtime_System.md:3672, 95, 6087 |
| 24 | goal.evidence_captured | closed_payload_schema | CONFLICT | agree | Goal_Runtime_System.md:11, 56, 3654 |
| 25 | goal_run.replanned | closed_payload_schema | CONFLICT | agree | Goal_Runtime_System.md:7437, 7502 |
| 26 | context.compaction.completed | producer | PASS | agree (G-05) | storage-plan.md:19298-19300 |
| 27 | context.compaction.completed | consumers_checkpoints | PASS | agree via the equivalence route (G-06) | storage-plan.md:19304-19306 |
| 28 | context.compaction.completed | positive_negative_oracles | PARTIAL | agree | scripts/pm-validate-pm7-gui-fixtures.py:517-518; ATS-040 3701 |
| 29 | restore_point.applied | producer | PARTIAL | agree | canon has no SP-286 text for applied; grep over Plans/*.md |
| 30 | restore_point.applied | scope_identity | PARTIAL | agree | Decision_Log.md:312 (DP-K37-04 names the identity source, with no formula) |
| 31 | restore_point.expired | positive_negative_oracles | PARTIAL | agree | pinned v5 suite stores redb_snapshot_id at #/N/value/checkpoint/generic_read_token (88 rows); storage-plan.md:22525 |
| 32 | seglog.event_appended | owner_doc | PARTIAL | agree | storage-plan.md:468 disclaims producer semantics |
| 33 | seglog.event_appended | positive_negative_oracles | PARTIAL | agree (G-07) | storage-plan.md:21463, 21465 |
| 34 | goal_run.certified | owner_doc | PARTIAL | agree | Goal_Runtime_System.md:2653; storage-plan.md:15104-15107 |
| 35 | storage.retention_hold_changed | transitions | PARTIAL | agree | storage-plan.md:22924 ("is not supplied by this contract") |
| 36 | storage.retention_hold_changed | positive_negative_oracles | PASS | agree on in-repo fixtures (G-07) | storage-plan.md:22946 |
| 37 | storage.integrity_detected | positive_negative_oracles | PARTIAL | agree | storage-plan.md:23254, 23281 |
| 38 | restore_point.created | positive_negative_oracles | PARTIAL | agree | assistant-chat-design.md:25429 (ACD-465) |
| 39 | goal.updated | producer | PARTIAL | agree | Goal_Runtime_System.md:6306, 6313 |
| 40 | goal_run.started | producer | PASS | agree | storage-plan.md:25675 ("SP-286/CV-339 ... remain mandatory") |
| 41 | workspace.layout_changed | consumers_checkpoints | PASS | agree | storage-plan.md:21707, 21713 |
| 42 | workspace.layout_changed | positive_negative_oracles | PARTIAL | agree | home_layout_event_contract_fixtures.json:5-7; DL-076 |
| 43 | platform.capability_evaluated | positive_negative_oracles | PASS | agree on in-repo fixtures (G-07) | storage-plan.md:23471 |
| 44 | terminal.workgroup_moved | scope_identity | PARTIAL | agree | S15:11868-11870 |
| 45 | storage.deletion_lifecycle_changed | replay_idempotency | PARTIAL | agree on identity grounds | storage-plan.md:17353-17355 |
| 46 | safe_point.recovery_unavailable | scope_identity | PARTIAL | agree | Executor_Protocol.md:7223 |
| 47 | restore_point.corrupt | transitions | PARTIAL | agree | storage-plan.md:20233 |

Coverage:
- 16 of the 29 lowered cells.
- 6 of the 13 CONFLICT cells, plus one CONFLICT->PARTIAL comparison (#21).
- 11 cells from the three complete families, all agreed.
- 9 cells of the three post-August families that DL-077 relies on.

## Exact edits

**G-01 (blocking).** Apply the application-scope cardinality rule the same way to all four families under `RP-OPERATIONAL-2555D`.

Preferred option (A): regrade `platform.capability_evaluated` retention to PARTIAL.

1. **Finding:** "The event keeps RP-OPERATIONAL-2555D@1.0.0 (cardinality_scope project, storage_value_registry.json:368) while the family is application_or_project (registry:923). SP-291 records application-scope enforcement under that bucket as an unproved policy-owner adapter seam (storage-plan.md:23548)."
2. **Cell fields:** `change` downgraded, prior old_matrix PASS. Add these evidence items with quotes: `"cardinality_scope": "project",` at svr:368, and `"scope_policy": "application_or_project",` at registry:923.
3. **Rebuild counts with `build_report.py`.** The expected results:
   - Totals: PASS 335, PARTIAL 144.
   - Retention by criterion: PASS 38, PARTIAL 4.
   - Platform: 10 PASS, and it leaves "One criterion short" (8 families become 7).
   - The 39-family "now" row: 304/139/13/12.
   - Transitions: PASS->PASS 171 and PASS->PARTIAL 30 ("Lower: 30"; "Unchanged: 290, PASS 171").
   - `change_against_prior`: carried 342, downgraded 33.
4. **MD line 156:** name platform in the shared-policy product question.

Alternative (B): keep the rule for `storage.boot_recovery` only, where SP-291 states it, and restore compaction_lifecycle and recovery_applied retention to PASS. The expected results are 338/141, retention 41/1, lowered 27 and PASS->PASS 174. Both families return to 10 PASS, and line 156 then names Boot only.

**G-02 (MD lines 31-37).** Replace the four bullets with a table of the lowering rules actually used, each with its canon basis:

| Rule | Cells lowered |
|---|---:|
| SP-286 adoption (storage-plan.md:22035-22036) | 1 |
| Identity recipe (Contracts_V0.md:1008, 1016, 1028) | 8 |
| DL-076 on pinned suites (Decision_Log.md:5775; clarification 2) | 2 |
| Untestable boundary or prose-only oracles (criterion 12) | 10 |
| Owner-flagged open facet (storage-plan.md:23548, 22924; SP-292) | 5 |
| Stale or disclaiming anchor (clarification 1(a)/(b)) | 2 |
| Missing transition ordering barrier (criterion 9) | 1 |
| Total | 29 |

- Drop the withdrawal bullet: it lowered no cell, and `step-08-depth-report.md:73` already stated that rule.
- Change "rules the old matrix left implicit" to "rules the old matrix did not apply".
- In Method (line 47), state clarification 1 in full, including when an anchor grades PARTIAL.

**G-03.**
- Line 115: "the three restore families above" becomes "the two restore families above".
- Line 119: add "`browser.workspace.created`, whose registered v1 checkpoint lacks the SP-278 token (Step 8(c))" to the PARTIAL consumer list.

**G-04.**
- Line 3: after "the twelve criteria of the Browser pair assessment", add "with a stricter producer rule (SP-286 adoption by name, storage-plan.md:22035-22036) that the Browser pair assessment did not apply".
- Under "Lower", add one line: "Against later supplements, 4 more cells fell to PARTIAL: the producer cells of both Browser families (Browser pair assessment), `workspace.layout_changed` oracles (Home supplement) and `context.compaction.completed` oracles (Step 6)."

**G-05 / G-06 (line 58, Harmonization).**
- Add: "The SP-286 rule applies where publication or the returned result waits on the AppendReceipt (S15:11626-11628). It does not apply where visibility rests on a verified seglog marker and recovery never needs the receipt (storage-plan.md:19298-19300); this decides compaction PASS and Browser reset PARTIAL."
- Add: "`context.compaction.completed` passes consumers through the rubric's equivalent-complete-checkpoint route (storage-plan.md:19304-19306), without SP-278 by name."

**G-07.** In the platform, Hold, seglog, Boot, Integrity, recovery and compaction-lifecycle oracle findings, mark external suites that only a report pins (storage-plan.md:23471, 22946, 21463, 21794) as not counted under clarification 2. No grade changes.

**G-08.** Line 17 becomes: "`platform.capability_evaluated`: consumers; the reader's read-through output has no closed schema and aggregate use is unavailable (SP-278 is referenced only as a dependency)." If G-01 option (A) is taken, remove this line.

After the edits, regenerate the JSON with `build_report.py`, recompute its SHA-256 for the admission records, and re-run the quote check (`compile_depth42.py`), which passes today with 2,626 exact quotes.

Files: `/home/sittingmongoose/PM-Experiments/review-depth42-20260924/findings.jsonl` and `REVIEW.md`. Working scripts and extracted sources are in `work/` and `src/`.
