# Step 8(c), first half: the Browser pair adopts SP-286/CV-339 first AppendReceipt recovery by name, 2026-09-24

**What changes.** One owner document, `Plans/Section15_MVP_Promoted_Features_Spec.md`, and its derived shards and index. No registry row, payload schema, fixture, test, Storage document or checkpoint changes. `Plans/event_family_registry.json` stays at revision `2026-09-11.2` (SHA-256 `0be544181eda...`), and `Plans/browser_event_admission.json` is unchanged.
- SMPFS-167 (`browser.workspace.created`) and SMPFS-168 (`browser.workspace.reset`) each gain a dated subsection, a newly authored technical owner definition under DL-046, in which `BrowserRuntimeService.workspace` explicitly adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2` for exactly its creation or reset barrier.
- Each unit gains a canonical sentence, a criterion (SMPFS-167-A006 and SMPFS-168-A005), `depends_on` SP-286 and CV-339, a ContractRef line and a named validation obligation.
- The owner never calls `storage.first_append_receipt.issue.v2` and makes no full-value claim, so it does not adopt `resolve_full_value.v1`.
- Nothing about SP-266 v2, SP-278 or the v1 reader changes: "Until that replacement the v1 checkpoint and reader remain the current route" is intact. Making the v2 checkpoint current is the second half of 8(c), on its own branch.

**Authority.** DL-046, per family, under the coordinator's Step 8 instruction of 2026-09-24, which relays Jared's authorization. The gap answered is depth42's producer finding for both families: SP-286/CV-339 "is not adopted by SMPFS-167 or SP-266" (created) and "is not adopted by SMPFS-168 or SP-282" (reset) (`reports/event-authority-20260911/step-08-depth42-assessment-20260924.md`, on `main` since `3ce6eb882c`).

**Review.** A blind review ran in `/home/sittingmongoose/PM-Experiments/review-ea-browser-sp286-20260924/`. Cycle 1 returned fix-then-land, with 0 blocking findings, 5 should-fix and 5 notes. Each repair is its own commit, in the reviewer's wording:
- **S-01** needed no text change. The depth42 assessment landed during the review, and the rebase makes the citation resolve.
- **S-02** adds the restore and in-place-restart half of SP-286/CV-339.
- **S-03** defines the resolve.v2 request by the original event ID, scoped idempotency key and authored event content.
- **S-04** gives a route for when no original event exists.
- **S-05, S-06 and S-07** apply the reviewer's wording for the owner result, the first-mint sentence and the final boundary recheck. After S-07, Section 15 is byte-identical to the reviewer's tested `proposed/Section15_MVP_Promoted_Features_Spec.md` (SHA-256 `2ad113a8...`, from `proposed-edits.patch`).
- **S-08** names the native obligation for A006 and A005 in both units' `validation_surfaces`.
- **S-09** is this report.
- **S-10** is the depth statement below.

**Checks.** They were run in the worktree at `2c71f90b61`, the S-08 commit rebased onto `main` `a6480b0f7c`, from 01:24Z to 01:32Z. The results are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-browser-pair-sp286-repair-20260925/rebased-a6480b0f7c-20260925T0127Z/`, whose `SHA256SUMS` has SHA-256 `9615042dee351035fef2c019e36a64c3054a45ce888dbc26261bed0b52070987`.
- **Shards.** The shard check passes: 99 documents, 2,722 shards.
- **Index.** `pm-plan-index.py validate` passes with 6,728 PlanUnits and 26,260 acceptance units, against `main`'s 26,258.
- **Units.** SMPFS-167 and SMPFS-168 are the only units whose content changes. The readiness report adds four `depends_on` edges and one Section 15 drift row.
- **Section 15.** It is the reviewer's proposed file plus the two S-08 entries and nothing else, SHA-256 `c3ff1624...`.
- **Tests.** Browser created 63 OK, reset 53 OK, admission 38 OK, and `pm-browser-event-admission.py` passes, all as on `main`.
- **An earlier run.** The same checks on the pre-rebase commit `a6252abe46` gave the same Section 15 deltas against `main` `3c4a64b2b5`. They are in the parent directory, whose `SHA256SUMS` has SHA-256 `6414216ac827848e663c73971e4e9c1f139cdd19f74f20fa1d8ca92d05342b02`; its `NOTE.txt` explains the base line in `context.txt`.

## Effect on the depth grade

The branch closes the depth42 producer gap by name for both Browser families: SP-286/CV-339 `resolve.v2` is adopted in SMPFS-167 and SMPFS-168. It changes no grade, because grades move only at a regrade. At the next Step 8 regrade:
- **`browser.workspace.created`.** It can reach at most 10 of 12. Its consumers and oracles cells are untouched here; the second half of 8(c) addresses them. SMPFS-167-A006 likewise has a named native obligation (S-08) but no executable oracle of its own.
- **`browser.workspace.reset`.** It reaches 12 of 12 only if both of these hold:
  - the restore half (review S-02, now applied) holds;
  - the oracle cell is not lowered for SMPFS-168-A005.

  A005 has a named native obligation (S-08) but no executable oracle of its own, so the reset oracle cell rests on the existing lost-acknowledgement and unknown-append model cases.

The DL-077 admission records of both families still fail closed until they are re-pinned to a regraded assessment with all twelve criteria passing.

## Expected at landing

Every landing-check row this branch adds is governance staleness on `Plans/Section15_MVP_Promoted_Features_Spec.md`. These figures were measured against `main` `a6480b0f7c`, after the anchors landing. In each aggregate, `run-gates` and `audit-governance`:
- **Evidence and plan graph.** 30 `artifact_hash_stale` rows in each, for Section 15 and the 29 files of its shard directory. Each goes from `main`'s 143 to 173.
- **Implementation readiness.** 1 `event_authority_currentness_source_drift` row for Section 15, 27 to 28.
- **Plan migration.** 3 `stale_batch_report_sha256_after` rows for run-002 batch report rows 168 to 170, 12 to 15.

Other effects:
- **`plan-migration-validate`.** It stays at 33,072. 12 of its rows change content: 7 name Section 15 (the live hash, bytes and line count in `inventory.json` and `original_hashes.json`, and the snapshot's batch report row), and 5 are repository-wide rows that change with any Plans edit (the plans manifest hash twice, the span count, the span set and the current-run pointer).
- **`test_pm_pnc019_currentness`.** It fails with one more drift row, for Section 15. The rows already there are `main`'s: `Plans/Decision_Log.md`, `Plans/Goal_Runtime_System.md` and `Plans/storage-plan.md`.
- **Spec Lock.** Section 15 has no entry in `Plans/Spec_Lock.json`, so there is no Spec Lock staleness.
- **Counts.** 6,728 PlanUnits and 26,258 to 26,260 acceptance units.

The review's figures were measured against `main` `38b8c1301d`: 26,257 to 26,259, evidence and plan graph 11 to 41, readiness 25 to 26, plan migration 4 to 7. The deltas are the same. The bases moved with the anchors landing, which added SP-214-A006 and 132 staleness rows.

**Order against the certified-anchors branch.** The review warned that the anchors branch adds 132 rows to evidence and plan graph, which would push both past `audit-governance`'s 100-row print cap, and that this branch's rise in a truncated subcheck would then stop its landing. That no longer applies, and the anchors have since landed (`9507c8d2e8`). Since the landing-check exports repair (`main` `d30bbc95e8`), a subcheck over its print cap is keyed from its complete export, so each row is matched to its own files; the anchors landing keyed all 143 of its evidence and plan-graph rows that way.

**Rebase and derived files.** Derived files are regenerated in the worktree with the ignored currentness edition symlinked, never hand-merged: `Plans/_shards` with `pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `Plans/.plan_index` with `pm-plan-index.py generate`. The branch was rebased three times: onto `3c4a64b2b5`, onto `8bc8986484` (the exports repair) and onto `a6480b0f7c` (the anchors). Each time the index files that conflicted with `main`'s regeneration were taken from `main`, and all six were regenerated at every stop.

## Reseal request

Appended to the wave's single reseal list:
- the live plan-sharding bundle rows for Section 15 and the 29 files of its shard directory;
- a currentness edition that includes Section 15;
- run-002 `refresh-batch-hashes` for rows 168 to 170;
- the implementation-readiness report;
- the nightly snapshot.
