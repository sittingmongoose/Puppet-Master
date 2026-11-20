# The two August ledger rows: consumers cited, provisional lifted, citations refreshed

Application `EA-B1-DS-AUGUST-LEDGER-ROWS` (JSON beside this file). Lane DS, stream E batch 1. Applied on `plans/ea-b1-seal-blockers-20261104` at `66a93f80f3`, on 2026-11-04.

## What was written

| Row | Ledger line | Census line | provisional | Cells now not PASS |
|---|---:|---:|---|---|
| `workspace.layout_changed` | 295 | 39 | true → false | `producer` FAIL, `positive_negative_oracles` UNKNOWN |
| `terminal.workgroup_moved` | 279 | 38 | true → false | `positive_negative_oracles` FAIL |

For each row, the edit:
- **Consumer cell.** Sets `consumers_checkpoints` to PASS, citing the consumer, projector and checkpoint from the Plans.
- **Other cells.** Re-anchors every other cell's citation to exact one-line quotes at `66a93f80f3`.
- **provisional.** Sets it to false, appends the reason to `disposition_rationale` and `quality_notes`, and changes the census line's `individual_disposition_provisional` and `notes` to match.
- **Unchanged.**
  - the disposition (`KEEP_REGISTERED`), bucket and cohort pins;
  - the owner choices `AUG-CP-WLC-001` and `AUG-CP-TWM-001` (`VETO_KEEP_REGISTERED_PROVISIONAL`);
  - the registry and the validator.

`rows/ROW_<event>.json` equals the ledger line. The ledgers keep their mixed CRLF/LF line endings: exactly 2 lines change in each.

## Why provisional is lifted

**DL-039** (`Plans/Decision_Log.md:413-414`):

> "`AUG-CP-WLC-001` = `VETO_KEEP_REGISTERED_PROVISIONAL`. `workspace.layout_changed` stays registered; its consumers, projector and checkpoint remain unknown until cited from the Plans, and that depth work is authorized."
> "`AUG-CP-TWM-001` = `VETO_KEEP_REGISTERED_PROVISIONAL`. `terminal.workgroup_moved` stays registered on the same terms."

The provisional state lasts until the consumer, projector and checkpoint are cited from the Plans. They now are:

- **`workspace.layout_changed`.** The citations are in `Plans/storage-plan.md` SP-273:
  - reader/projector `home.workspace_layout_event_reader.v1@1.0.0`;
  - consumers `home.workspace_layout_home_view.v1`, `home.workspace_layout_editor_routing.v1` and `home.workspace_layout_terminal_presentation.v1`, all 1.0.0;
  - filtered checkpoint `home_layout_event_reader_checkpoint.v1:{storage_instance_id}:{project_id}:{workspace_tab_id}`, with prior-checkpoint CAS in one redb transaction and RP-PROJECTION-3GEN rebuild;
  - SP-278 with the nine-field token (DL-076).

  SP-273's 2026-10-09 amendment carries all of this over to v2 writes.
- **`terminal.workgroup_moved`.** The citations are in SP-319:
  - reader `storage.terminal_workgroup_move.inspect_current.v1@1.0.0`;
  - no projector;
  - family checkpoint `none_required`, with SP-278's generic projector/checkpoint mandatory;
  - no stored token.

  SP-319's canonical text now states that no consumer operates, because no operation was ever admitted (this branch, `f86b68e982`).

No identifier is invented.

### Premise check

- **Layout.** The family changed contract since September: payload 2.0.0 under DL-188, a Jared decision. It is still the same registered family. The cited reader and checkpoint are SP-273's and are carried over to v2 by SP-273's own amendment, so the answer's condition can be met.
- **Terminal.** The feature it assumed (terminal workgroups) was retired and the family withdrawn by DL-181 (2026-10-09). The operative terms still apply: the family stays registered (as historical-only), and its consumer, projector and checkpoint are now cited. The lead should know the premise moved from a live family to a withdrawn one.

## Where this differs from the lane brief, and why

The lane asked for the consumer citations, a refresh of layout's citations to its 2.0.0 row and CV-361, and `provisional: false`. D1b's counterfactual D assumed the other eleven cells stay PASS. Re-reading every cell at this revision, three PASS cells written against older text are not true today. Writing them as PASS again would let the seal check read complete depth that canon does not support. So they now say what the text says:

- **Layout `producer` → FAIL.** The writer is named, but:
  - SP-273's amendment says "the v2 writer's slot and receipt schema is an open item of SP-330" (`Plans/storage-plan.md:21825`);
  - SP-330 says "The successor slot and receipt schema for v2 writes is not written in this addendum … until it exists no native v2 writer is admitted through those families" (`:27503`);
  - the registry admits only 2.0.0 appends.
- **Layout `positive_negative_oracles` → UNKNOWN.**
  - In-repo oracles exist, and the PM7 checker validates the event fixtures against 2.0.0.
  - But SP-273's oracle set pins an external frozen suite (`Plans/home_layout_event_contract_fixtures.json:6`, v4 manifest `60f1c8ad…`). The 2026-09-24 Step 8 assessment found that suite stores `redb_snapshot_id` in the persisted token, contradicting DL-076.
  - The suite is not reachable from this grader, so the cell cannot be confirmed PASS.
- **Terminal `positive_negative_oracles` → FAIL.**
  - SP-319: "Paired static oracles and closed original/read-result companions remain required, distinct from native proof" (`Plans/storage-plan.md:27081`).
  - No fixture, checker or test names the reader (searched `Plans/*.json`, `scripts/`, `tests/`).

All three match D1b's 2026-11-04 grades (PARTIAL). All three can close without Jared: both families are in DL-045's 285 names, and the fix is newly authored technical text for already specified behavior.
- **Layout producer:** author the v2 slot and receipt schema in SP-330.
- **Layout oracles:** re-freeze and repin the external suites under the nine-field token.
- **Terminal oracles:** author the read-result companion and paired fixtures for the historical read.

## Effect on the frozen seal check (scratch copy, validator unchanged)

| | Before this commit | After |
|---|---|---|
| `individual_dispositions_provisional` | 2 rows | cleared |
| `registered_contract_depth_incomplete` | both rows: `consumers_checkpoints`, provisional | terminal: `positive_negative_oracles`; layout: `producer`, `positive_negative_oracles` |

`tests/test_event_authority_holding_bucket.py` has the same 2 failures as `main` `be4766513f`, and no new ones.
