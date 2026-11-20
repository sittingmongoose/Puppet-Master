# C12-DG6A closure — PNC-019 stream E

Implementation head: `6ead4f4885bc0039afb50f9b50ea3a08cbdbe94c`. Base: `104c6c82b5ea0b5bf154806712496777c48c675b` (`origin/main`). Branch: `plans/ea-pnc-c12-dg6a-20261114`.

All sixteen assigned families move **C12 PARTIAL → PASS** under the scope's permitted whole-definition Method B route. Other cells keep their status; only cited line spans that moved were refreshed. This is a static family-oracle assessment; registry admission (ABSENT) and native execution (`NOT_RUN`) stay separate. Independent reviews are `NOT_RUN`.

| Exact family | C12 before | C12 after | Reachable clauses | Exact clause kills / invalid | Registry-copy kills | Copy-join kills | Custody kills / store snapshots |
|---|---|---|---:|---:|---:|---:|---:|
| `alert.acknowledged` | PARTIAL | PASS | 568 | 924 / 7 | 313 | 2344 | 77 / 2144 |
| `alert.dismissed` | PARTIAL | PASS | 568 | 926 / 7 | 313 | 2393 | 77 / 2145 |
| `alert.rule_muted` | PARTIAL | PASS | 583 | 969 / 7 | 319 | 2442 | 77 / 2146 |
| `alert.snoozed` | PARTIAL | PASS | 578 | 972 / 7 | 317 | 2442 | 77 / 2146 |
| `panel.redocked` | PARTIAL | PASS | 474 | 729 / 1 | 255 | 2863 | 77 / 2152 |
| `panel.undocked` | PARTIAL | PASS | 472 | 727 / 1 | 255 | 2863 | 77 / 2152 |
| `concern.created` | PARTIAL | PASS | 807 | 2220 / 12 | 549 | 1890 | 42 / 2108 |
| `bundle.annotation_state_changed` | PARTIAL | PASS | 398 | 973 / 7 | 83 | 546 | 21 / 2083 |
| `bundle.note_created` | PARTIAL | PASS | 1380 | 3205 / 75 | 362 | 1520 | 42 / 2105 |
| `bundle.note_status_changed` | PARTIAL | PASS | 1353 | 3178 / 72 | 361 | 1560 | 42 / 2105 |
| `concern.assigned` | PARTIAL | PASS | 1455 | 3336 / 69 | 373 | 1460 | 42 / 2100 |
| `concern.evidence_linked` | PARTIAL | PASS | 1442 | 3313 / 69 | 373 | 1454 | 42 / 2100 |
| `concern.promoted` | PARTIAL | PASS | 1449 | 3321 / 69 | 373 | 1466 | 42 / 2100 |
| `concern.reopened` | PARTIAL | PASS | 1446 | 3321 / 69 | 373 | 1466 | 42 / 2100 |
| `concern.resolved` | PARTIAL | PASS | 1447 | 3324 / 69 | 373 | 1472 | 42 / 2100 |
| `concern.updated` | PARTIAL | PASS | 1447 | 3310 / 69 | 373 | 1454 | 42 / 2100 |

## What changed

- **Bounded tables.** Every DG6A guard table now holds at most eight rows, and every entailed row sits alone. This adopts s4o2's phase-group mechanism by file content and applies it to every DG6A phase (list below). The generator writes 122 generated tables with 478 rows, plus 10 hand-written tables. The checkers keep calling the phase name; `pm_dg6a_tables` dispatches it to its parts in declared order. The hand-written `current_context` (11 rows) becomes `current_context` (CC01–CC08) and `current_context__2` (CC09–CC11). `pm-dg6a-c12-split-equivalence.py` proves all 28 bounded phases equal to their unsplit `origin/main` tables: same row order, byte-identical predicates, codes and invariants, and the same `first`/`every` results on 19004 Boolean observations, with 0 mismatches. Right after the split, all 16 family checkers passed with unchanged case counts.
- **Registry copies refuse through real rows.** The alert, panel and concern.created checkers compared each registered Storage copy of a companion schema with a bare `assert`. They now refuse through the six `storage_schema` rows that Card 5 already uses (`registry_mirror_errors`). The shared alert state and rule-state copies, previously only metaschema-checked, are now included.
- **Closure adapter** (`scripts/pm_dg6a_c12_closure.py`). It runs each family's unchanged complete checker `main()` and observes every schema evaluation of the lane validator, together with the guard row that consumes it. A clause proposal is credited only when all of these hold: the complete definition reports exactly that clause at exactly that location; the consuming phase's actual row returns its code; the clause cut and the whole-definition row cut behave as recorded; restoration refuses again; and the control is still accepted. When the call came from a module-level checker function, the mutant is also replayed through that unchanged function and must refuse first at the same row. Generated branch controls cover the branches the fixtures leave unvisited: optional members, empty arrays, anyOf/oneOf alternatives, type lists and forced if/then conditions. These are schema-boundary controls only and earn no lifecycle credit.
- **Entailed rows** (`scripts/pm-dg6a-c12-entailed.py`). Each of the 20 rows that stay unproved has its owner premise checked against the exact owner bytes. Construction attempts through the unchanged checker functions then show an earlier row refusing every time, and the entailed row never refusing.
- No owner Markdown, schema, fixture, registry content, Spec Lock, evidence bundle, frozen guard tool or NUMRULE file changed. No new SP/CV/ATS/DL id was minted (block 3660–3679 unused).

## Finding fixed in this lane

| Where | Why it broke | Fix |
|---|---|---|
| `scripts/pm-card5-event-contracts-check.py` `operation_observation` (`operation_bytes`, `request_digest` facts) | It called `packed(operation)` and `request_digest(operation)` directly. CV-1100 sets no integer cap, so a schema-valid 4,400-digit revision raised `ValueError` out of `operation_refusals` instead of refusing. All eight Card 5 families with an operation were affected, at 6 slots each. Found by the adapter's `bigint` pass. | Use the alert checker's `encoded_size` and an encoder-refusal-safe request digest. The value now refuses at `G_operation_bytes` and `G_request_digest` (the SP-1100 route refusal). A standing witness (`big_integer_cases`) in every Card 5 operation family requires those two refusals first. The alert, panel and concern.created checkers already used `encoded_size`. |

## Gated proof and strict accounting

The unchanged gated tool `004bdedd63` ran over all 132 DG6A tables at `6ead4f4885`. Results: **112 PASS** and **20 NOT_RUN** (no negative). Every NOT_RUN table is an entailed singleton. **498/518 rows proved.** Failure kinds: none. Lane-matrix problems: 0. Observations refused by two rows are reported by the runner and never used as proof. Largest table: 8 rows.
The 20 unproved rows each sit alone in one of these tables: `alert_command_keys_entailed__1`, `alert_command_keys_entailed__2`, `alert_command_keys_entailed__3`, `c5_after_note_entailed__1`, `c5_after_note_entailed__2`, `c5_after_note_entailed__3`, `c5_after_note_entailed__4`, `c5_after_note_entailed__5`, `c5_history_mapping_after_entailed`, `checkpoint_encoding_entailed`, `concern_command_keys_entailed__1`, `concern_command_keys_entailed__2`, `panel_command_keys_entailed__1`, `panel_command_keys_entailed__2`, `panel_command_keys_entailed__3`, `retry_retained_alert_entailed__1`, `retry_retained_alert_entailed__2`, `retry_retained_panel_entailed__1`, `retry_retained_panel_entailed__2`, `sch_concern_operation_payload`. Every premise holds and all 214 construction attempts refuse at an earlier row. For the five `G_after_*` note rows, the first refusing row is the request digest (it commits to the after record) and the named `note_after_*` row refuses alongside; the entailed row never refuses.

Mutation accounting keeps the categories separate; only an exact expected refusal earns a kill:
- schema clauses: **34748 kills**, **610 INVALID** (non-targeting) proposals, uncredited;
- boundary replays: **12353** first-refused at the clause's row by the unchanged consuming function. 179 refused first at an earlier phase: these are the concern operation payload mutants, which `sch_concern_operation` refuses first, as the CONCERN_OPERATION_PAYLOAD_schema entailment states. They earn no boundary credit.
- registry copies: **5365 kills**, 0 invalid;
- copy joins: **29635 single-row kills**. 2499 multi-row results are uncredited (for example, a checkpoint token also fails publication equality). 0 were accepted and 0 invalid;
- retained custody: **861 kills** at the exact HC/RQ row of the broken fact, plus 123 accepted originals. 0 invalid;
- sealed owner-invalid history: **243 HG15 kills**. 19 refused earlier, at custody verification, because the identity recomputation needs the removed member; these are uncredited. 0 invalid.

## Coverage

For each family, the adapter writes an owner clause → actual schema row → control → expected refusal → clause cut → whole-definition row cut → restoration matrix. Across the 16 families: 15867 reachable clauses, 0 uncovered, 16248 evaluated occurrences and 20330 generated branch controls. Every occurrence maps to its exact owner bytes. The mapping covers composition through the lane validator (nested `$schema` removal, and the checkpoint `index_read_token` source-constraint profile). Applicators and `if` selectors earn no scalar credit. The phases covered are the current payload, operation, checkpoint and Card 5 field schemas (`sch_*`), the custody-selected frozen editions read by HG15 (current and retained panel v1 / concern legacy v1), and retained-retry RR04.

## Numbers and timestamps

- The shared number corpus runs through every DG6A route: 5184 route runs, 0 disagreements. `pm_event_numbers.py --self-test --scope numbers` passes (580: 276 positive, 304 negative). The adapter's `bigint` mode puts ±10^4399 (4,400 digits) at every evaluated integer slot: 473 slots and 946 checks, 352 of them replayed through the consuming function. Result: 0 exceptions.
- The shared CV-1101 corpus (680 strings: the battery plus the number corpus date-time cases) runs at every evaluated `format: date-time` clause. That is 130 nodes and 88400 checks, on the EventRecord profile, with 0 disagreements. At the authenticated retained boundary, `observed_at_utc` and `persisted_at_utc` take `storage_utc_z` and `acknowledged_at_utc` takes EventRecord (E5-2): 32640 reads agree with the shared predicate and 0 disagree. Every store snapshot is unchanged.

## Original-suite replay

- The 16 complete family checkers pass at `6ead4f4885`: 13722 cases. That is `origin/main`'s count plus three new 4,400-digit witnesses in each of the eight Card 5 families that have an operation; every other count is unchanged.
- `pm-dg6a-domain-check.py` passes for 7 families (71268 observations). `pm-dg6a-guard-check.py` passes. `pm-dg6a-p2b-trials.py` catches 18/18 standing trials. `pm-dg6a-table-generate.py --check` passes. These ran at the implementation head.
- `pm-dg6a-final-regression-check.py` covers the 7 families plus `--audit-grade-only`. It rewrites inputs in place, so it runs alone at the report commit; its result is in the evidence bundle. The grade audit now requires criterion 12 PASS to cite this report at an exact line. Its negative removes that citation and must be refused.
- The adapter self-test passes 10 adversarial checks.

## Shared-tool limit

The whole-Plans `pm_event_datetime_inventory.py` gate and the combined `pm_event_numbers.py --self-test` still fail here. The eight sparse audit inputs were materialized byte-for-byte from HEAD and removed afterwards. The remaining refusal is the listed TOOL-ISSUES row: the frozen exclusion citation names `Plans/.plan_migration/pds-20261114-002-current-planunit-snapshot/span_map.jsonl`, which is absent from `main`. The result is one scan refusal and 290 derivative missing nodes. This is a refusal and an infrastructure result, not an acceptance, and no broad shared date-time PASS is claimed. The frozen helpers are unchanged.

## s4o2 DG6A changes: adopted and replaced

| s4o2 change | Disposition |
|---|---|
| `53dbe7c023`: five Panel phases bounded to eight rows (generator, `pm_dg6a_phase_groups.py`, alias dispatch in `pm_dg6a_tables.py`) | **Adopted** by file content, then generalized to every generated DG6A phase; resulting Panel part files equal s4o2's |
| `8c7ae0481d`: Panel entailed rows split into singletons | **Adopted** and generalized to every `*_entailed` phase; Panel proofs **replaced** by `pm-dg6a-c12-entailed.py` (premises + construction attempts for all 20 rows) |
| `137aa1d794`: custody installs at composition; malformed sealed receipt refuses | **Adopted** in `pm_dg6a_custody.py` (the retained variants include an ambiguous two-receipt entry, refused at HC02/RQ02) |
| s4o2 oracle/self-test scripts (`pm_pnc019_s4o2_*`) and Panel evidence | Not adopted; **superseded** by this lane's closure, proof and gated runs |

## Evidence and verification

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dg6a`. Raw results stay external. The repository holds this report and `C12-DG6A.json`. `SHA256SUMS` binds the whole retained bundle. Run every command in a capped scope with at least 12 GiB available.

```sh
python3 -B scripts/pm_dg6a_c12_closure.py --mode schema --family <family> --out <dir>
python3 -B scripts/pm_dg6a_c12_closure.py --mode copies --family <family> --out <dir>
python3 -B scripts/pm_dg6a_c12_closure.py --mode bigint --family <family> --out <dir>
python3 -B scripts/pm_dg6a_c12_closure.py --mode selftest --out <dir>
python3 -B scripts/pm-dg6a-c12-entailed.py --out <dir>
python3 -B scripts/pm-dg6a-c12-split-equivalence.py --base 104c6c82b5 --out <dir>
python3 -B scripts/pm-dg6a-guard-tables.py --out <dir> --max-rss 2048
python3 -B scripts/pm-dg6a-table-generate.py scripts --check
python3 -B scripts/pm-dg6a-number-corpus.py --json <file>
python3 -B scripts/pm-dg6a-final-regression-check.py --family <family> --output <file>   # alone: it rewrites inputs and restores them
python3 -B scripts/pm-dg6a-final-regression-check.py --audit-grade-only
```

All locations are at the report commit. The implementation head `6ead4f4885bc0039afb50f9b50ea3a08cbdbe94c` holds the same bytes for every listed script except the grade audit in `scripts/pm-dg6a-final-regression-check.py`, which changes with the grade.

| Item | Source location | Verification |
|---|---|---|
| Clause coverage and ledger | `scripts/pm_dg6a_c12_closure.py:961` | --mode schema |
| Branch controls | `scripts/pm_dg6a_c12_closure.py:847` | --mode schema |
| Date-time corpus at clauses | `scripts/pm_dg6a_c12_closure.py:933` | --mode schema |
| Registry-copy mutations | `scripts/pm_dg6a_c12_closure.py:1239` | --mode copies |
| Copy joins | `scripts/pm_dg6a_c12_closure.py:1373` | --mode copies |
| Retained custody variants | `scripts/pm_dg6a_c12_closure.py:1445` | --mode copies |
| Retained instants | `scripts/pm_dg6a_c12_closure.py:1544` | --mode copies |
| 4,400-digit integers | `scripts/pm_dg6a_c12_closure.py:1624` | --mode bigint |
| Adapter self-test | `scripts/pm_dg6a_c12_closure.py:1675` | --mode selftest |
| Entailed rows | `scripts/pm-dg6a-c12-entailed.py:109` | entailed-summary.json |
| Split equivalence | `scripts/pm-dg6a-c12-split-equivalence.py:98` | split-equivalence.json |
| Bounded split rule | `scripts/pm-dg6a-table-generate.py:31` | --check |
| Alias dispatch | `scripts/pm_dg6a_tables.py:29` | family checkers |
| Registry-copy rows | `scripts/pm-alert-event-contracts-check.py:575` | family checkers |
| Card 5 encoder refusal | `scripts/pm-card5-event-contracts-check.py:66` | family checkers |
| Card 5 4,400-digit witness | `scripts/pm-card5-event-contracts-check.py:618` | family checkers |
| current_context part 2 | `scripts/pm_dg6a_table_current_context__2.py:13` | gated current_context__2 |
| Grade audit | `scripts/pm-dg6a-final-regression-check.py:21` | --audit-grade-only |

No subagent or browser was used. The lane worktree is kept for the lead's merge.
