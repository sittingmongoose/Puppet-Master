# Recheck, cycle 2: plans/ea-certified-anchors-20260924 at 57b54b5623

**Landing-ready: yes.** All blocking and should-fix findings from cycle 1 are repaired in the bytes. A-08 stays deferred to landing by design, and a simulation on current `main` shows the result the lander should get. A-10 was a note and is recorded as an open question.

## How this was checked

- I fetched `origin/plans/ea-certified-anchors-20260924` (tip `57b54b5623`) and exported `Plans`, `scripts`, `tests` and the report with `git archive` into my own scratch directory. The author's worktree was not read, and nothing in the repository was edited.
- The eight new commits each touch only what their messages say. Five change one owner document each and regenerate its derived files; three change only the report.
- Both edited documents are byte-identical to `proposed/Goal_Runtime_System.md` and `proposed/storage-plan.md` from cycle 1. The registry still hashes to `0be544181eda...c842`, so checkpoint `2026-09-11.2` is untouched.
- Plan index at the tip:
  - SP-214 is still the only PlanUnit whose content differs from base `f1ce058ccd`, and the unit count is still 6,721.
  - SP-214-A006 is the one added acceptance unit, and its criterion equals the parsed YAML.
- Checks on my export of the tip:
  - Shard check: pass (99 documents, 2,722 shards).
  - `pm-plan-index.py validate`: pass with the ignored currentness edition symlinked (not copied). The only remaining failure is the retention baseline, which needs git and the export has none.
  - Without the edition, validate reports `node_readiness_report.json` as stale. That is the environment dependence behind A-08, not a defect.
  - Regenerating shards and index reproduces all 2,926 committed derived files, apart from four timestamps.
  - `validate-goal-runtime-event-fixtures`: pass, 0 failures.

## Dispositions

| Finding | Disposition | What I verified |
|---|---|---|
| A-01 (blocking) | Repaired | The SP-214 paragraph now reads "GRS-085 governs the mandatory started/cancelled/certified per-Workflow-run prefix projection that carries the durable GoalRun projection role of this unit (with D-R20) for that family". A006 reads "this unit stays the payload_owner_doc route of the registry row for that family, its mandatory durable per-Workflow-run GoalRun projection role is carried by GRS-085 in the two SP-317 families rather than by goal_run_projection.v1". The word "only" is gone and there are no apostrophes. The index text equals the source text, so both YAML scalars read literally. D-R20 is named in the paragraph; A006 says "its" role without repeating D-R20, as the cycle-1 repair text did. |
| A-02 | Repaired | The certified row now says "SP-316 its compact original authority families and v7 wrapper routes, and SP-317 its projection/checkpoint families". "Storage custody" no longer occurs in the file. |
| A-03 | Repaired | The routing note adds that the listed event-specific fields are unchanged inside the v3 payloads and that v3 changes the envelope. |
| A-04 | Repaired | The native-v7/producer-v2 scope is stated in the table row, in the SP-214 paragraph (with "earlier native-v6 and producer-v1 source editions keep their original closed scope, no existing birth is enrolled or cast"), and in A006 ("within their native-v7 and producer-v2 scope"). |
| A-05 | Repaired | The certified row reads "(schema roots bound by CV-352)". |
| A-06 | Repaired | The SP-214 paragraph closes "goal_run.started and goal_run.cancelled v3 keep their registry owners GRS-079 with SP-311 and GRS-080 with SP-312." |
| A-07 | Repaired | The report has a new section, "Certified-family pins (review A-07)". It lists the composition-manifest Goal_Runtime_System.md member (`ccedade9...`) and source-citations C01 to C05, whose lines move by two, says the passages are unchanged, notes the storage-plan member was already stale, and assigns the pins to the certified-family owner at the next reseal. |
| A-08 | Superseded (deferred to landing) | See "Landing simulation" below. |
| A-09 | Superseded | The A-11 text in the report now carries it. |
| A-10 | Still open (note, open question) | The fixture validator still reads neither edited document. This is not a landing condition. |
| A-11 | Repaired | "Expected at landing" now names: Spec Lock `stale_hash` for Goal_Runtime_System.md as well as storage-plan.md; the readiness regeneration after the rebase with the edition present, never hand-merged; the certified pins; and the exit-2 mechanics. The exit-2 statement still holds under the landing rules as amended on `main` (`f0e194b6b4`): a 132-row rise is larger than the 100-row audit-governance print cap, so the complete-copy exception cannot apply. One cosmetic slip: "the certified-family pins above (A-07)" points up, but that section comes below. |

## Landing simulation (A-08)

The tip's `node_readiness_report.json` is an interim artifact. It was regenerated with the edition present, but on the pre-reseal base, so it has 23 rows, including drift rows for `Plans/Spec_Lock.json` and the plan-sharding evidence bundle.

To check what landing will produce, I took current `main` `b3169c48d9` (which has not touched either document, the registry or the certified pins since `f1ce058ccd`), put the tip's two documents on it, symlinked the edition, and regenerated. Shard check and index validate pass. The readiness report goes from main's 19 rows to 21, and those are the only changes:
- row 8's expected hash becomes `f233eb9c...`, the new Goal_Runtime_System.md hash
- one `event_authority_currentness_source_drift` row for Goal_Runtime_System.md
- one for storage-plan.md

The Spec_Lock and evidence drift rows disappear. The lander should see exactly this; anything else means stop.

## Open questions carried forward

- A-10: nothing executable checks A006 or the rewritten table rows.
