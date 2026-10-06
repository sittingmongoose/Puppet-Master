# Independent current C-02 research assessment, phase 1

Pair: C-02-CONFIRMATION-CLOCK-FRESH-R001. Evaluator: independent-confirmation-C02-current-research-1.

The exact selected **current research** outputs A and B both receive **FAIL_SCREEN**. Each contains a consequential, primary-source-grounded error. This is a matched screening result, not a complete all-claims review, an assertion of equal quality, a winner, or a final/pipeline outcome. Both designated-final fields are null. Later critic work, final delivery, pipeline quality and winner are **UNASSESSED**.

The released H2 card has **ten obligations, eight common dimensions and three critical duties**. Base A/B twelve-obligation, important-five and diagnostic-target-three counts do not apply. Each current research proposal and its source, witness and lead catalogs is structurally present. Four files do not establish scientific qualification, final delivery or native Goal completion.

## Source-grounded findings

### A-F01 — valid normalization no-op rejected (major; decisive)

A proposal §5.3, lines 321–325, treats an unchanged CRS object returned by normalization as failure. At the exact PR head it cites, PROJ tests axis directions and swaps only when needed; already correctly ordered CRSs retain their original object. The same conditional behavior remains at PROJ 9.8.1. An east/north projected CRS is a supported, legitimate no-op. The proposed guard therefore rejects correct data under A's own declared support boundary. Preserve the useful explicit axis checks and rejection of unsupported types; object identity is not their substitute.

Primary evidence: [PROJ cited PR-head implementation](https://raw.githubusercontent.com/OSGeo/PROJ/24f5d70f2bedbf94db9b4e05dbd66e4c952d6504/src/iso19111/crs.cpp), direction predicate around lines 845–891 and normalization lines 1105–1142; [PROJ 9.8.1 implementation](https://raw.githubusercontent.com/OSGeo/PROJ/9.8.1/src/iso19111/crs.cpp). Frozen captures E05/E16 and full hashes are in independent_source_pins.json. This is static interpretation; no product execution is claimed.

### A-F02 — issuing a checkpoint does not prove safe database exchange (major; decisive)

A §3.4, lines 190–196, infers that running TRUNCATE checkpoint before built-in share/close produces one self-contained database. SQLite conditions truncation on success and reports a busy result when checkpointing cannot finish. Uncheckpointed WAL frames can still contain committed edits. A does not specify checking the result or maintaining a stable snapshot through the copy. Its separate warning about raw copies while open does not establish built-in share correctness. Successful, quiescent checkpointing remains a legitimate mechanism; the unconditional inference fails.

Primary evidence: [SQLite checkpoint pragma](https://www.sqlite.org/pragma.html#pragma_wal_checkpoint), TRUNCATE conditions and returned result columns; [SQLite WAL](https://www.sqlite.org/wal.html), §4 persistent state and §2.2 reader restrictions. Frozen E01/E03. This is a protocol defect in the proposal, not evidence that an actual user's edits were lost.

### B-F01 — TEXT PRIMARY KEY does not exclude NULL (major; decisive)

B §3, line 33, claims its TEXT PRIMARY KEY makes a NULL identity schema-impossible. Ordinary SQLite rowid tables do not enforce that implication. NOT NULL, STRICT, WITHOUT ROWID or the INTEGER PRIMARY KEY exception is needed; B selects none. The session source B itself cites explicitly says NULL-key rows are ignored. Consequently its invariant is unsupported, and its optional native-session merge path can omit those rows. This does not claim generated UUIDs are routinely null or that B's selected app-layer oplog necessarily uses sessions.

Primary evidence: [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html#the_primary_key), §3.5; [SQLite Session](https://www.sqlite.org/sessionintro.html#limitations), §1.3. Frozen E02/E04.

### B-F02 — wrong expected target axes (moderate)

B §§5/13, lines 61/143, calls EPSG:2056 a latitude-first validation target. The PROJ 9.8.1 dataset defines CH1903+ / LV95 as Cartesian system 4400, with metre easting first and northing second. The #1377 example concerns the EPSG:4326 source input order. B's proposed corpus therefore misstates a reference expectation. No unexecuted test failure is invented.

Primary evidence: [projected CRS data](https://raw.githubusercontent.com/OSGeo/PROJ/9.8.1/data/sql/projected_crs.sql) line 115, [axis data](https://raw.githubusercontent.com/OSGeo/PROJ/9.8.1/data/sql/axis.sql) lines 59–60, [coordinate-system data](https://raw.githubusercontent.com/OSGeo/PROJ/9.8.1/data/sql/coordinate_system.sql) line 32, and [issue #1377](https://github.com/pyproj4/pyproj/issues/1377). Frozen E21/E22/E23/E20.

## Supported content and issue-chain limits

Both proposals provide substantial offline workflow, provenance, reversible edits, visible rejection/conflict states, bounded access and useful optional opportunities. The SQLite spatial/index-as-filter lesson is supported. A's authority-axis/GDAL mapping discussion is useful; B's session build/virtual-table limits and app-layer alternative are useful. Do not blanket-reject these claims because another inference fails.

A's PR #3477 has a real failure identified in its own description, a concrete DerivedProjected correction and regression tests. A correctly calls the EngineeringCRS #4876 case open and the older fix only the same class. That older PR is not an associated fix for the current EngineeringCRS issue; A also leaves first-release mapping unverified. This gives partial H2-08 coverage, not an invented completed modern chain. [PR #3477](https://github.com/OSGeo/PROJ/pull/3477), frozen E08/E05/E06; [issue #4876](https://github.com/OSGeo/PROJ/issues/4876), E07.

B's #1565 missing from_pipeline axis-normalization option is actually closed by #1566. Its diff adds the implementation and relevant tests, and the real 3.8.0 release includes the change; 3.8.0 wheels contain PROJ 9.8.1. Preserve that useful discovery. However, B's proposal never identifies #1565 or clearly explains that specific association outside its catalog, while naming #1377/#1368 elsewhere. Standalone chain coverage remains partial; this is a presentation/coverage gap, not a claim that #1566 is fabricated. [Issue #1565](https://github.com/pyproj4/pyproj/issues/1565), [PR #1566](https://github.com/pyproj4/pyproj/pull/1566), [3.8.0 release](https://github.com/pyproj4/pyproj/releases/tag/3.8.0), frozen E09/E10/E11/E18/E19.

A claims three isolated candidate witnesses and B two. Their limitations are generally honest. The supplied packet lacks original code/tool receipts, so actual execution is UNKNOWN independently; catalog IDs/hashes or B's stdout do not verify execution. No original arm/history files were read and no evaluator retest was run. The 250k target, crash suite and accessibility qualification remain proposed, as they should for these proposals.

## Coverage and remaining scope

| Released obligation | A | B |
|---|---|---|
| H2-01 offline workflow/originals | PARTIAL | PARTIAL |
| H2-02 coordinate/reference/geometry contract | PARTIAL | PARTIAL |
| H2-03 identity/revisions/conflicts | PARTIAL | PARTIAL |
| H2-04 interruption recovery | PARTIAL | PARTIAL |
| H2-05 bounded access/maps/media/licenses | PARTIAL | PARTIAL |
| H2-06 accessible editing/status/undo | COMPLETE | COMPLETE |
| H2-07 independent useful precedents | COMPLETE | COMPLETE |
| H2-08 issue/fix/regression/applicability | PARTIAL | PARTIAL |
| H2-09 architecture/dependencies/opportunities/alternatives | PARTIAL | PARTIAL |
| H2-10 standalone source-correct delivery/validation | PARTIAL | PARTIAL |

COMPLETE here describes current research coverage of that obligation, not implemented behavior or whole-case PASS. All eight common dimensions are inventoried as PARTIAL with reasons in phase1_judgment.json. The three critical duties are accounted for separately: actual final4 remains UNASSESSED because neither final is selected; both current research4 sets are present; useful-precedent minimum is COMPLETE; full standalone issue/fix/test duty is PARTIAL. No final absence penalty or final credit is inferred.

All remaining consequential current claims beyond the recorded screens are UNASSESSED. In particular, these source screens do not prove the full transform policy, grid/resource deployment, repeated merge ancestry, map-source redistribution, cancellation or interrupted multi-file recovery. Disclosed limits and credible bounded alternatives remain legitimate research material.

## Isolation, clocks and freeze

Only the exact current source packet and independently retrieved public primary sources were used. No old evaluator/development report, grades, model/cost key, roster, sibling summary or unlisted campaign/candidate path was read. Launched Task_B itself reveals named discovery/API-binding modifiers; that unavoidable hint is recorded and perfect blinding is not claimed. Physical evaluator model identity remains UNKNOWN.

Actual SOURCE_START was recorded before semantic allowlist/dispatch/task/body access: 2026-10-06T10:26:58.713251+00:00, monotonic_ns 112837570291294. The earlier reservation preparation is not source start. Source allowance is 1200 seconds and whole allowance 1800 seconds. The literal P2 freeze clock starts at the immutable P1 freeze, with 600 seconds inclusive of key wait, checks, report and mandatory handoffs; the whole clock continues without reset. Exact freeze timestamps, pins and deadlines are in phase1_freeze.json.
