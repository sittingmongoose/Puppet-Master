# Cycle 2 recheck: DL-077 and DL-078 (plans/ea-seal-check-decisions-20260924)

**Tip:** `49a7f91657`. `git ls-remote origin` returned `49a7f91657a7c19deb11d11e6087ba9608ad6769` for the branch. I fetched origin into my own scratch bare repository (`cycle2/repo.git`), which reads the shared object store through alternates, and exported the tip from it. I did not read the author's worktree and wrote nothing under `/mnt/Cursor/PuppetMaster` in this cycle.

**Landing-ready: yes.** No finding is blocking. One should_fix remains open (D-05, narrowed), and it is recorded as an open question below, as the cycle cap requires.

## Checks on my export of the tip

- **Shard check passes:** `pm-shard-plans.py --check --config Plans/sharding_config.json` reports status pass, 99 documents and 2,722 shards.
- **Index validation passes:** `pm-plan-index.py validate` reports status pass with 0 failures, 6,723 PlanUnits and 26,241 acceptance units. For this run, `origin/main` in the scratch repository held `b3169c48d9`'s `plan_units.jsonl` (6,721 units). This confirms the author's counts.
  - No cycles: `true_cycle_component_count 0`, `cycle_blocker_count 0`.
  - `unresolved_reference_count 0`.
  - `depends_on_edge_count 15672`.
- **Regeneration is deterministic:** regenerating the shards and the index reproduces the committed files exactly, except for `generated_at_utc`.
- **Index changes are confined:** the changes in `plan_units.jsonl` and `acceptance_units.jsonl` against `origin/main` are all in `Plans/Decision_Log.md` units: 75 changed, of which 2 are new (DL-077 and DL-078) and 0 were removed.
- **Paths:** the diff from the merge base (`origin/main...tip`) names exactly the 20 claimed paths:
  - `Plans/Decision_Log.md`
  - 10 files under `Plans/_shards/decision_log/`
  - 6 files under `Plans/.plan_index/`
  - `reports/event-authority-20260911/` `decision-responses.jsonl`, `step-09-procedure-20260924.md` and `step-10-validator-live-set-card-20260924.md`
- **Rebase:** the branch is still based on `792d2fb8b1`. `origin/main` has moved to `b3169c48d9`, but the 10 files it changed are outside this branch's paths, and `git merge-tree --write-tree` exits 0, so the routine rebase at landing is clean.
- **SourceRef:** `ANSWERS_SEAL_CHECK.md` still hashes to `afdbdd4e...cdb`.

## Dispositions

| Finding | Disposition | What I verified |
|---|---|---|
| D-01 | repaired | The Why (line 1523) now says compaction was admitted in Step 6 under DL-039 and DL-040, and the Browser pair "in their own Storage admission landings under DL-046". Neither entry still says DL-046 admitted them. The card keeps its original wording, as D-09 allows. |
| D-02 | repaired | DL-077 prose (line 1525) and canonical_text (line 5887) read "Jared's decision entry for that family", which matches the answers file and the card. DL-078 (prose, canonical_text) and procedure step 2 now name which entry that is for a Step 9 registration. The label left in step 1 is recorded as OQ-2. |
| D-03 | repaired | AC3 (line 5901) and line 1541 were replaced with the fail-closed wording. "state which criteria still fail" appears nowhere. |
| D-04 | repaired | `reports/event-authority-20260911/decision-responses.jsonl` is the first validation surface of both units, in the YAML and in `plan_units.jsonl`. |
| D-05 | **still open** | Blocking findings must now be repaired and re-reviewed, and "A batch with an unrepaired blocking finding does not land." Two gaps remain: the step still reads "a re-review limited to the rows the repair touched", and it does not require the deterministic checks to pass before the review and again after the repair (OQ-1). |
| D-06 | repaired | canonical_text (lines 5883-5884) now reads "which fails every family registered after August with unexpected_august_set". |
| D-07 | accepted as note | The readiness regeneration and the SHA-256 are now labelled as procedure. The prose says "these are procedure, not part of the answer", canonical_text says "following the Step 4 and Step 8 precedent", and procedure step 2 says "procedure, not part of Jared's answer". The CLAUDE.md question is recorded as OQ-4. |
| D-08 | accepted as note | Line 1539 was repaired as suggested, and the twelve criteria are now named as the Step 8 depth matrix's. canonical_text keeps "seal condition now reads" (OQ-3). |
| D-09 | accepted as note | Acceptable, and not required before landing; the reasons follow this table. |
| D-10 | repaired | Line 40 now names the batch-1 branch "until batch 1 lands". Row 55 already said "counted here once it lands". |
| D-11 | repaired | Both units have `[DL-039, DL-045, DL-046]`. Every id resolves and there are no cycles. |
| D-12 | repaired | The Question (line 1521) now reads "a family Jared admitted later". The same second person survives in the Name line (OQ-5). |

**Why D-09 can stay a note.**
- **The answer is recorded in canon.** DL-077 and DL-078 hold it, and two `decision-responses.jsonl` rows carry `card_status: approved_recorded`. The procedure record also says decisions from DL-039 onward are not re-asked.
- **Precedent.** The DL-068 to DL-075 cards on main still show blank Answer lines.
- **No conflict in either landing order.** The card blob `ba9ea086805b` is identical on this branch and on `plans/ea-step08-depth42-20260924` (`fd980eb2d4`). Editing it here would create an add/add conflict with that branch.

A status line can be added once both branches have landed.

## Open questions (cycle cap reached; recorded, not argued further)

**OQ-1 (D-05, should_fix, not blocking).** Procedure step 5 (line 21) says "a re-review limited to the rows the repair touched finds no blocking finding". DL-066 (line 1141) defines the scope differently: "Affected rows means the rows the repair changed and the rows it was supposed to change. This step exists to catch a repair that did not repair". Under the step's wording, a row the repair should have changed but did not is never re-reviewed. Step 5 also leaves out DL-066's requirement that the deterministic checks pass before the review and again after the repair. That wording is from my own cycle-1 suggestion, which the author applied verbatim. The fix is a text edit to step 5:
- Replace "a re-review limited to the rows the repair touched finds no blocking finding" with "a re-review limited to the affected rows (the rows the repair changed and the rows it was supposed to change) finds no blocking finding".
- Add "The deterministic checks pass before the review and again after the repair."

**OQ-2 (D-02, note).** Procedure step 1 (line 28) still calls the first element "the Decision Log entry that admits it", while DL-077 says "Jared's decision entry for that family". Step 2's added sentence makes them the same entry, so the meaning is settled and only the label differs.

The same sentence in DL-078 and step 2, "is the decision entry its DL-077 admission record cites", is the coordinator's reading of item 2. It was the first option in cycle 1. Unlike the D-07 sentence, it is not labelled as a reading. If Jared should see that reading, show it to him.

**OQ-3 (D-08, note).** DL-077's canonical_text (lines 5890-5892) still says "DL-039's seal condition now reads as passing with the holding-bucket change and this amendment and no other modification". The prose at line 1539 now says it "is read as" passing, so the canonical_text should be aligned with it.

**OQ-4 (D-07, note).** `.claude/CLAUDE.md` still reserves readiness artifacts to the designated Plans agent. DL-078 (AC1, and procedure step 2) has every registration landing regenerate the readiness projections, as the Step 4 (`c423c3890d`) and Step 8 (`3d391fd297`) checkpoint landings did. The coordinator should confirm that this is allowed.

**OQ-5 (D-12, trivial).** The DL-077 Name line (1519) still reads "families you approved after August".
