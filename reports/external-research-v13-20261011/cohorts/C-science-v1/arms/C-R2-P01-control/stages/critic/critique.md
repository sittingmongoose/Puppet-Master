# Independent critic review — C-P03 software planning brief

Run: C-R2-P01-control. Stage: critic. Review was limited to the frozen brief, revealed plan, investigator discovery/draft/source map/index, and plan-reveal record named in input-map.json. I did not inspect other candidates, campaign history, unlisted paths, application code, or real logger data. Source IDs R01–R22 in this stage are independent review records; each R record identifies the corresponding investigator S ID where applicable. See sources/index.md and source-map.json.

## Assessment

The investigator draft substantially covers the complete brief and every material clause of the revealed plan. It keeps parser, identity, units, timezone, storage engine, and validation choices conditional; does not nominate a winner; distinguishes proposals from checks actually run; and preserves the missing logger conventions as owner inputs. I found no material wrong claim and no material unsupported technical claim among the consequential claims independently checked. One material incompleteness remains in the crash/durability boundary.

## Findings

### C-01 — Material incomplete — P3.5, with validation consequence at P4.3

The draft correctly warns that the word transaction and an unspecified journal mode do not prove crash safety, says the rollback-journal atomic-commit article is scoped to that mode, and proposes reopening after injected failures. It stops short of defining the durability contract the exact plan asks it to inspect. SQLite distinguishes application-process failure from operating-system crash and power loss, and its result depends on journal mode and PRAGMA synchronous. SQLite's current documentation says that WAL with synchronous=NORMAL may lose a recently committed transaction after power loss or system crash; synchronous=FULL in WAL performs an additional sync at commit. In rollback-journal mode, FULL may still not provide power-loss durability on every filesystem, and EXTRA is recommended when that durability is required. [R12, R13, R22]

This is material because “reopen and see all or none” after an application/process crash does not establish the same guarantee after power loss, nor establish that a commit acknowledged to the volunteer survives it. Before implementation, the proposal should name the failure class promised (process termination, OS crash, power loss), the selected journal and synchronous settings, and the filesystem/VFS assumptions; validation should exercise the supported configuration and describe what is and is not guaranteed. The draft may remain engine-neutral until an owner selects a runtime. This finding does not require choosing SQLite or changing the all-or-nothing import scope.

### C-02 — Minor locator/wording — P4.1 user-visible reconciliation outcome

The draft covers the brief's “replaced, supplemented, or left intact” question with “supplement, no-op, or explicit revision,” and says an accepted observation remains retained absent an authorized revision. That is materially aligned. “No-op” could mean either the prior value stays current or the incoming row is held as a conflict, so the user-facing preview should state the resulting disposition in the brief's plain terms and distinguish “leave prior accepted value intact” from “unresolved; do not apply.” This is wording clarity, not a missing reconciliation design. [R12, R15]

### C-03 — Honestly unresolved external input — P2.4, P4.2, P4.5, and owner decisions

No actual logger specification or sample file is in the permitted input package. Stable event identifiers, counter resets, clock meaning, channel conventions, unit labels, null sentinels, and supported file-size envelope therefore cannot be verified here. The draft explicitly keeps these as owner decisions, offers more than two overlap approaches, and holds uncertain matches for review. This remains a necessary implementation input, not an investigator error. [R17–R20]

### C-04 — Honestly unresolved process evidence — P5

The draft says discovery and draft were saved before completion of the same native Goal and that work stopped within the stage deadline. The allowed predecessor package contains the plan-reveal record but not the investigator's direct native terminal response or a separate output-time record. I therefore cannot independently verify that lifecycle/timing statement from the inputs I was assigned. This is not evidence that it is false, and I did not inspect unlisted paths. The scientific assessment below does not depend on it.

## Exact revealed-plan review

| Plan clause | Critic assessment |
|---|---|
| P1.1 streaming parser and temporary staging | Retained conditionally; draft correctly distinguishes unaccepted disk staging from accepted visibility and asks what “temporary” means. |
| P1.2 sample inference of delimiter, dates, units, missing values | Revised soundly: structural detection may suggest, while semantic mappings and missing tokens need a confirmed profile. |
| P1.3 preview mapping for confirmation | Strengthened with evidence, uncertainty, before/after values, affected rows, and rerun. |
| P1.4 apply the same mapping to every row | Retained conditionally; frozen profile and whole-file validation block acceptance after a late contradiction. Rust csv's tutorial demonstrates an earlier yielded record before a later unequal-length error. [R04–R05] |
| P1.5 authority of inference and contradictions | Answered; low-risk parser suggestions are bounded, semantic inference is not accepted silently, and contradictions invalidate the stage. |
| P2.1 logger ID plus timestamp | Revised; neither timestamp nor row position is treated as sufficient identity. |
| P2.2 matching identity means revision | History goal retained, automatic overwrite rejected; same/duplicate/revision/conflict outcomes and prior lineage are described. SQLite UPSERT is correctly treated as enforcing a declared unique key rather than defining domain identity. [R15] |
| P2.3 filename-derived logger ID | Correctly rejected; filename remains provenance only. |
| P2.4 alternatives for repeated readings, renamed files, mixed clocks, corrected metadata | Fulfilled with declared event key, confirmed composite key, content/signature candidate, and unresolved manual review. Record-linkage evidence is used only for a possible-match state, not to claim logger conventions. [R21] |
| P3.1 one transaction and visibility | Retained with accepted-view visibility, final recheck, explicit transaction contents, and busy handling. |
| P3.2 cancellation removes staging | Expanded by phase; scan cancellation preserves accepted data, apply cancellation rolls back, post-commit reports completion. |
| P3.3 restart from beginning | Retained as a conservative default with digest/profile checks before any optional resume. |
| P3.4 disk staging solves memory | Correctly revised; parser, row, batch, match, cache, preview, and journal costs remain bounded/tested. |
| P3.5 one final transaction proves crash safety | Correctly rejects the assumption, but remains materially incomplete about synchronous/durability and the promised crash class (C-01). |
| P4.1 changed interpretation after prior import | Substantially fulfilled; only user-facing disposition wording needs clarification (C-02). |
| P4.2 compare reconciliation strategies/manual confirmation | Fulfilled; unresolved identity, candidates, times, units, and nulls have manual/hold paths. |
| P4.3 malformed rows, units, overlaps, daylight, cancellation, interrupted commit tests | Fulfilled as future tests; include rollback/reopen, busy/I/O/disk conditions, and large-file behavior. Extend crash tests per C-01. |
| P4.4 executed synthetic vs proposed validation | Fulfilled plainly: no synthetic import or application checks ran; all listed validations are proposed. |
| P4.5 original-file lineage | Fulfilled with digest, raw cells, location, profile/parser versions, transformations, match rationale, decision, and revision links. |
| P5 deadline clause | Scope retained. The retrospective timing/native-terminal assertion is unresolved from the frozen package (C-04), not adjudicated false. |

## Original brief coverage

| Brief obligation | Review |
|---|---|
| Incremental parsing, schema interpretation, duplicate/revision handling, preview, local transactional application | Covered as a complete flow; no accepted rows are written from a partially parsed file. |
| Correct an interpretation and rerun; make replace/supplement/retain effects understandable | Covered in substance; see the minor plain-language distinction in C-02. |
| Maintained parsing/storage mechanisms, format docs, caller/support history, without preselecting a winner | Multiple candidates and primary documentation/support reports are compared; no winner is selected. The two rust-csv issues remain labeled reports rather than confirmed general defects. [R04–R08] |
| Detection and explicit configuration; at least two overlap approaches | Both are present; three matching approaches are described with limitations. |
| Ambiguous timezone and changed units without inventing values | Preserves raw input and requires explicit interpretation; RFC 9557 and Chrono evidence supports zero/multiple local-time mappings, and UCUM does not make arbitrary units commensurable. [R17–R20] |
| Larger-than-memory responsiveness and cancellation effects | Bounded staging/buffers, background work, progress, cancellation phases, and scale tests are proposed. No unsupported benchmark is claimed. |
| Do not rewrite or upload source, silently coerce, or discard an accepted observation based on same name | Explicitly preserved; same-name files remain descriptive provenance. |
| Synthetic example and test status | Example is marked illustrative; the investigator reports zero executed synthetic coverage and separates future proposals. |
| Unknown logger conventions | Explicitly left for owner input rather than inferred from filename or common practice. |

## Validation and limits

The investigator's validation section is proposed coverage, not execution evidence. The primary documentation/examples/issues I checked support the conditional mechanisms cited above; they do not establish an application's memory ceiling, preview latency, transaction performance, durability on an unknown filesystem, or actual environmental meaning of a logger field. I ran no import, synthetic parser/database check, stress test, restart test, or corruption test for this critique. C-01 is the only material repair request; all remaining uncertainties should stay visible as owner input.
