# Step 8(a) handover: 42-family depth assessment, stopped early, 2026-09-24

Step 8 and 9 move to an Opus agent under the coordinator's thread, at Jared's direction. The work described here is on branch `plans/ea-step08-depth42-20260924`, based on `main` `f1ce058ccd`. The branch contains only this note. Nothing was landed, and no Plans file was edited.

## Where I stopped

I had begun Step 8(a), the current depth assessment for the 42-family registry at checkpoint `2026-09-11.2`, and had finished only its first sub-step. That sub-step measures which cells of the dated 39-family matrix can carry forward. The matrix is `step-08-depth-assessment.json`, taken at source commit `4869b4cb`: 39 rows, 12 criteria, 468 cells, and 171 catalogued sources.

The method is excerpt-level currentness, because whole-file hashes have all changed since. For every catalogued source:
- **Cited line ranges:** the excerpt from the source commit must still appear verbatim in the current file, or after whitespace reflow.
- **Registry citations:** the family's own registry row is compared, not the whole registry.
- **Whole owner-document citations:** these are routing only, so the file only needs to still exist.

A cell carries forward only if every one of its evidence sources passes.

## Results

| Source state | Count |
|---|---:|
| owner routing file present | 39 |
| cited excerpt present verbatim | 36 |
| family registry row unchanged | 33 |
| whole file unchanged | 27 |
| **cited excerpt changed** | **26** |
| **family registry row changed** | **6** |
| **whole schema file changed** | **3** |
| registry container | 1 |

Cells: **136 carry forward and 332 need re-assessment.** All 39 families have at least one cell to re-assess.

The sources that drive most re-assessment:

| Source | Cells | What it is |
|---|---:|---|
| `goal_current` | 147 | Goal_Runtime_System.md, lines 235–279 at the old commit |
| `event_record` | 135 | Contracts_V0.md, lines 997–1034: the EventRecord envelope |
| `goal_matrix` | 84 | Goal_Runtime_System.md, lines 3412–3599 |
| `retention` | 78 | storage-plan.md, lines 17757–17810 |
| `goal_oracle_status` | 21 | the Goal oracle status table |
| `storage_contracts`, `storage_lifecycle` | 16 each | |
| `producer_catalog` | 11 | |
| six `family_N` rows | 9 each | the six `goal_run` families adopted to v3 |

Most of these passages moved or were amended rather than removed. The next step is to re-read each changed passage against its current text and re-grade the dependent cells.

## Remaining for Step 8(a)

1. Re-grade the 332 flagged cells against current text, starting with the four high-fan-out sources in the table above.
2. Fold in each later per-family supplement's twelve-facet results; each supersedes the cells it covers. These are the `step-08-*-depth.json` and `*-validation.md` reports for seglog, restore, run.started, hold, home, platform, integrity, goal, wire and compaction.
3. Add the three families missing from the old matrix:
   - `context.compaction.completed`, from the Step 6 facets plus `step-08-compaction-depth-currentness-20260923.md`;
   - `browser.workspace.created` and `browser.workspace.reset`, from `step-08-browser-pair-depth-assessment-20260923.md`, re-graded for the landed SP-278 v2 companion `22e516b456`.
4. Re-grade `terminal.workgroup_moved` for SMPFS-170 and SP-319, landed at `566576ea55`.

## Evidence

Script and outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-handover-20260924/`:

| File | SHA-256 |
|---|---|
| `depth_currentness.py` | `6a6b213a11b6be44f92056f0eea014f6de40b7c7df9edcbc22817745e4b6c7bc` |
| `depth_currentness.json` (first pass) | `50a794f9532c22bd945d8574b15afad18f9ee9086ad515f85e037b1339381b56` |
| `depth_currentness2.json` (refined, per-cell flags) | `4d19bc83b11638fd25960db9d40412b96d85940db1c5f79eb9671f85105a17f0` |

The refinement step that produced `depth_currentness2.json` was run inline and is not in the script. Its rules are the second and third bullets under "Where I stopped".

Cost: one session, read-only analysis; monetary attribution unavailable.
