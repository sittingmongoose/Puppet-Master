# C-P03 — Complete revised import plan

**Run:** C-R2-P01-control  
**Stage:** reviser  
**Scope:** The complete C-P03 brief and the exact provisional plan released in stages/investigator/revealed-plan.md. This is a research-backed design proposal, not a deployment. No parser, database, or winning library is selected.

## Decision

Build an offline import flow that separates file syntax from environmental meaning, stages and validates the entire file before accepted data can change, and presents a complete, reviewable change set before the volunteer applies it. Preserve the source and accepted history. Unknown identity, time, unit, and missing-value conventions stay unresolved until an owner or volunteer supplies a confirmed rule.

The import must not accept rows from a file whose later structural or semantic error makes the staged interpretation incomplete. It must not write to the source file, send observations to a service, silently coerce a value, infer logger identity from a filename, or discard an earlier accepted observation because a later file has the same name. Correcting a profile requires a complete rerun and a fresh preview.

The final accepted change set is atomic within the selected accepted-data store: one confirmed apply either records all selected observation changes plus their receipt and lineage, or none. “Atomic” does not itself promise that a successful commit survives every system or power failure. Before implementation, the owner must define the failure classes covered by the durability promise and choose and test the engine, journal/synchronous settings, filesystem and VFS assumptions. No engine is selected here.

## Findings and evidence

### File format, schema, and interpretation

CSV syntax varies among producers. RFC 4180 describes a common format and is informational rather than a universal standard [S01/R01]. W3C CSVW shows how dialect and table-schema choices such as delimiter, encoding, header, column names, primary key, and null rules can be declared [S02-S03/R02-R03]. Those declarations do not establish what a logger meant by a field, unit abbreviation, timestamp, or blank.

Keep syntax and domain interpretation in a versioned profile. The syntax layer records the source digest, original header and cell text, encoding, dialect, parser version, physical row and byte locator, and parse errors. The interpretation layer records confirmed column mappings, date grammar and timezone, unit aliases and conversions, missing tokens, device/channel identity fields, and the profile version/digest. A detector may suggest structural settings with evidence and uncertainty; it must not silently decide a logger identity, timezone, physical unit, conversion, or missing token. Preserve raw values when a mapping is unknown.

Candidate parsers differ materially:

- Rust csv 1.4.0 provides incremental Result-based row iteration and byte records for non-UTF-8 input. Unequal row lengths are rejected by default; flexible mode removes that check and therefore requires explicit application width/schema validation [S04-S05/R04-R05, R08].
- Apache Arrow CSV 59.3.0 reads rows into batches under an explicit Arrow schema. This is a columnar/batch alternative, not a workload benchmark or a definition of environmental semantics [S09/R09].
- DuckDB’s current CSV documentation describes sample-based dialect/type/header detection, explicit overrides, and a VARCHAR fallback. It is an integrated scanner alternative, but its inferences remain suggestions. The normal faulty-file path reports an error; enabling reject storage skips faulty rows, so it cannot count as a successful complete import [S10-S11/R10-R11].

The rust-csv issue reports are bounded support evidence, not proof of general defects: issue 427 concerns an extreme caller-supplied seek position near u64::MAX, not ordinary sequential reads; issue 422 reports a line-count mismatch after ragged rows without maintainer confirmation; discussion 402 explains that flexible mode disables unequal-width checking [S06-S08/R06-R08]. If the chosen path uses seeking or permissive width handling, test the corresponding boundary and diagnostics.

### Matching, duplicates, revisions, and lineage

The brief supplies no logger specification or real sample file, so it cannot establish stable keys, counter reset rules, channel identity, clock meaning, or logger-specific null conventions. Compare these approaches without treating any as universally valid:

1. **Declared source key:** a documented stable logger/device event or sample ID, scoped by device and channel when needed. Preserve reset/epoch scope. Repeated ID with changed content is a revision or conflict candidate, not automatic permission to overwrite.
2. **Confirmed composite key:** owner-confirmed device/station, channel, resolved timestamp, and sequence or another documented distinguishing field. It can separate repeated readings better than time alone, but missing, recycled, or ambiguous components make the match uncertain.
3. **Content fingerprint and multi-field candidate matching:** an exact canonical fingerprint can find equivalent content, but misses corrections and can collide for distinct events with equal values. For near matches, show match, non-match, or possible match with the compared fields and rationale. Record-linkage literature supports an indeterminate “possible link” outcome when evidence is insufficient; it supplies no logger conventions or automatic thresholds [S21/R21].

Do not use timestamp alone, row position alone, measurement similarity alone, or filename as identity. SQLite UPSERT applies a caller-declared UNIQUE/PRIMARY KEY conflict rule; it does not define domain identity or revision policy [S15/R15].

The preview must account for every row as new, unchanged, exact duplicate, possible overlap, proposed revision, conflict/held, or invalid. Show before and after values, units, timestamp interpretation, match evidence, source row, and the resulting action. State the plain-language outcome explicitly:

- **Supplement:** add a distinct observation while retaining the accepted observation.
- **Replace/current revision:** create a linked immutable revision and move the current pointer only under the confirmed identity and owner-approved revision policy; retain the prior accepted version.
- **Leave the prior value intact:** make no change to its accepted value. Say whether the incoming row is an exact duplicate or a recorded no-op.
- **Unresolved; do not apply:** hold the ambiguous row and explain what needs correction. Do not describe a held conflict as a no-op.

No incoming row may disappear silently. The owner must decide whether explicitly holding selected ambiguous rows can coexist with applying the rest as a user-selected batch. Structural or semantic file errors block the complete import until correction and full rerun. Whichever row-selection policy is chosen, the selected accepted batch remains atomic.

For each accepted observation/revision retain an immutable import ID and receipt; source digest and original filename/path as descriptive provenance; raw headers/cells; source row/byte locator; parser/runtime and profile versions; original timestamp and unit text; null and conversion rules; identity evidence and confirmed decision; resulting canonical value; and links to prior/superseded versions. A same-name file is only descriptive provenance.

### Time, units, and missing values

RFC 3339 distinguishes numeric-offset timestamps from unqualified local time; RFC 9557 explains that a local time near an offset transition can map to zero or multiple instants, and that named-zone rules can change [S17-S18/R17-R18]. Chrono 0.4.45 exposes Single, Ambiguous (earliest/latest), and None outcomes; its timezone data is not bundled by default [S19/R19]. Preserve the original token and timezone evidence. Require a confirmed logger/site rule where an offset or zone is absent. Show both fold candidates or a gap/error and require correction; never silently select earliest/latest. If a named zone is used, record the zone and the timezone-data version.

UCUM 2.2 gives machine-readable unit semantics, but arbitrary or procedure-defined units are not necessarily commensurable, and not every conversion is a scalar factor [S20/R20]. Map a logger label only through a confirmed profile. Preserve the source magnitude and label, show the target unit and conversion basis/precision, and convert only when meaning is known. A changed label is not itself evidence of convertibility. Keep blank, absent, malformed, zero, explicit sentinel, and unknown missing token distinct; do not impute.

### Preview, apply, cancellation, restart, and durability

Use this sequence:

1. Open the source read-only; record size, name/path as descriptive metadata, and content digest.
2. Detect candidate syntax settings and present evidence. Apply only a confirmed, versioned interpretation profile.
3. Parse and validate every row incrementally into isolated disk-backed staging. Keep parser buffers, batches, matching work, indexes, and preview pages bounded. Preserve row/byte diagnostics. Do not alter accepted observations during scan.
4. Compare the complete stage with accepted observations and show a paged preview of all row dispositions and summary counts. If the source digest, profile, or accepted-data snapshot changes after preview, recompute and show the new preview.
5. On explicit Apply, recheck conflicts and state within the write boundary. In one transaction, write the selected accepted observations/revisions, current pointers, receipt, and lineage. Confirm success only after commit succeeds and the batch receipt/state is verified.
6. On any late parse or semantic contradiction, disable Apply, retain the error location, and require profile correction plus a full rescan. Do not accept earlier yielded rows. A staging area is unaccepted work; if a separate stage file and database are used, do not imply they form a cross-file atomic transaction.
7. On scan cancellation, stop at a safe record/batch boundary and remove or mark the isolated stage for cleanup; accepted data stays unchanged. On apply cancellation or error before commit, explicitly roll back and verify transaction state. If cleanup fails, persist an unmistakable incomplete state for safe retry. Once commit has succeeded, report “complete,” not “cancelled.”
8. For an interrupted pre-commit stage, restart the scan from the beginning by default using the same source digest and profile. A checkpointed resume is optional only after parser-safe offsets and stage integrity are verifiable. If termination leaves commit acknowledgment uncertain, first query the immutable batch receipt/idempotency key and reconcile committed state before retrying; do not risk a duplicate batch.

Storage documentation supports conditional claims, not a deployment guarantee. SQLite documents a single writer, a DEFERRED default, SQLITE_BUSY at commit with a transaction that may remain active, and error cases that may roll back a statement or the transaction; handle state explicitly and issue rollback where required [S12/R12]. rusqlite 0.40.2 rolls back on drop by default unless configured otherwise, with explicit commit [S14/R14]. SQLite’s atomic-commit article describes rollback-journal behavior and expressly does not establish WAL behavior [S13/R13]. DuckDB documents ACID commit/rollback and snapshot isolation, but not this notebook’s packaging, memory, or workload performance [S16/R16].

The critic correctly identified a separate durability boundary. SQLite’s current PRAGMA documentation says transactions survive application crashes regardless of synchronous setting or journal mode; WAL with synchronous=NORMAL remains consistent but a committed transaction may roll back after system crash or power loss. WAL with FULL adds a sync after each commit. In rollback-journal mode, FULL may not ensure power-loss durability on every filesystem; EXTRA adds a directory sync and is recommended when such durability is required [R22-R23]. These statements depend on the actual SQLite build, VFS, filesystem and storage honoring sync operations. Therefore:

- Define whether the promise covers application/process termination, OS crash, power loss, or all three. Distinguish atomic recovery (all or none) from durability of an acknowledged commit.
- Pin engine and runtime, journal mode, synchronous setting, filesystem/VFS, and storage assumptions. Query/verify settings at runtime rather than assuming a default.
- If the product promises that an acknowledged import survives system crash or power loss, choose a supported configuration whose documented durability matches that promise, then test the actual packaged build and storage environment. SQLite WAL plus FULL is a candidate documented as ACID; rollback-journal mode needs a separate documented choice (EXTRA for the additional directory sync) and still requires filesystem/VFS validation. This is not a selection of SQLite or a universal guarantee.
- Test termination before, during, and after commit, and recovery after process crash, OS crash, and power-loss simulation for each supported configuration. Reopen and check both the accepted rows and their lineage/receipt. Record the tested failure class and result; do not generalize a process-crash test into a power-loss claim.

Disk-backed staging does not by itself bound parser record size, a single oversized field, sort/match workspace, database cache, transaction journal, or preview memory. Run work outside the UI thread, publish progress and bounded preview pages, measure peak memory and stage/journal disk use on a file larger than available RAM, and define file-size limits. Do not chunk accepted writes across multiple commits unless a separate versioned data set is activated atomically.

### Illustrative example and current validation status

Illustrative only, not executed: a previously accepted logger/channel/sequence row has a local timestamp and value 7.0 under unit label mS/cm. A later file repeats its identity with value 6.8 and a changed unit label, then ends in a truncated row. The preview preserves both raw values and unit labels, explains the match evidence and proposed revision, points to the malformed final row, and disables Apply. The volunteer must correct the profile and rerun the whole file. Whether the corrected row is a revision or conflict depends on confirmed identity, time, unit, and revision policy.

Documentation, format specifications, parser caller examples, and issue/discussion reports in the predecessor package were inspected but not executed. During this reviser stage I opened SQLite’s official transaction, rollback-journal atomic-commit, WAL, and PRAGMA synchronous documentation to check the critic’s durability finding. I did not run application code, a parser or database import, a synthetic import case, stress test, restart test, crash simulation, or corruption test. All checks below are proposals, not passes.

## Complete disposition of the released plan

Clause references P1–P5 identify paragraphs and sentence/phrase order in the exact released plan. All provisional decisions are retained only with the conditions stated here.

### P1 — Parsing, schema, preview, and inference

- **P1.1 “streaming records through a configurable parser into a temporary staging table” — retain with conditions.** Incremental parsing and isolated disk-backed staging suit files larger than memory and separate unaccepted rows from accepted observations. Decide whether “temporary” means connection-local storage, a persistent unaccepted table, or a disk spool; define visibility, cleanup, crash recovery, and resource costs. Preserve raw rows and source locations. Pin and compare the parser candidates above.
- **P1.2 “A small initial sample would infer delimiters, date formats, units, and missing values” — revise.** Let sampling suggest delimiter, quote, header, encoding, or candidate date grammar with evidence and uncertainty. It cannot authorize logger meaning, identity, timezone, unit conversion, or missing-token semantics. Require confirmation and version the profile.
- **P1.3 “the preview would show that inferred mapping for confirmation” — retain and strengthen.** Show what was inferred versus confirmed, sample scope, examples, ambiguities, profile version, affected rows, and before/after interpretations. Allow correction and full rerun; preview details must be paged/bounded.
- **P1.4 “The parser would then apply the same mapping to every row” — retain conditionally.** Freeze the confirmed profile for the complete scan and validate all rows against it. A late contradiction invalidates the stage and disables Apply. The csv tutorial demonstrates that records can be yielded before a later width error [S05/R05]; never write accepted data from partial output.
- **P1.5 “how much authority inference can safely receive and how later contradictions should affect the preview and acceptance boundary” — decide.** Structural suggestions may be offered for confirmation. Semantic interpretations that can change value or identity require explicit confirmation. A contradiction identifies its row/cell and blocks the complete import until correction and rescan. The owner must approve any narrow structural defaults that can be accepted automatically.

### P2 — Identity and revision

- **P2.1 “logger identifier plus timestamp” — revise; insufficient as a default key.** Repeated readings, ambiguous local time, clock changes, and timestamp precision can collapse distinct events. Prefer a documented stable event/sample ID scoped by confirmed device/channel; otherwise evaluate a confirmed composite key. The brief does not provide logger conventions.
- **P2.2 “A second import with that identity would be treated as a revision, retaining the earlier value in an audit table” — retain history, revise automatic behavior.** Classify matches as same, exact duplicate, possible revision, or conflict. Only a sufficiently confirmed identity and owner-approved policy may create a new immutable revision and change the current pointer. Preserve and expose the earlier value and lineage; never replace solely because a key collides or a source is newer.
- **P2.3 “Rows without a logger identifier would inherit one from the filename” — reject.** Filename is not identity. Keep it as provenance only. Ask the volunteer to map a known logger; otherwise hold identity unresolved or use a separately approved path that does not pretend the identity is known.
- **P2.4 “alternatives for repeated readings, renamed files, mixed clocks, and corrected metadata” — fulfill with three alternatives and manual review.** Compare declared stable source ID, confirmed composite identity, and exact/multi-field content candidates as described above. Each has failure cases. Keep a possible-match state and require review when keys are missing/reused, multiple candidates remain, clock interpretation is ambiguous, or corrected metadata changes the match set. Preserve the rule and per-row evidence.

### P3 — Transaction, cancellation, restart, and resources

- **P3.1 “one transaction after parsing completes” — retain the single atomic accepted-batch boundary and define visibility.** Staged rows are absent from accepted views. The accepted transaction includes observations/revisions, prior/current pointers, receipt, and lineage. Recheck preview state/conflicts at apply. Bound SQLITE_BUSY handling and explicitly inspect/rollback transaction state [S12-S14/R12-R14].
- **P3.2 “Cancellation would remove staging rows” — retain with phase effects.** Scan cancellation leaves accepted data untouched and cleans or marks the stage incomplete. Apply cancellation requests stop and explicitly rolls back. Failed cleanup remains visibly incomplete and retryable. After successful commit, report completion.
- **P3.3 “an interrupted import would restart from the beginning” — retain as the conservative pre-commit default.** Clean or mark incomplete stages without changing accepted data, then rescan with the same digest/profile. Resume only if source, profile, parser boundary, and stage integrity are verified. For an uncertain commit acknowledgment, reconcile by receipt/idempotency key before retrying.
- **P3.4 “staging on disk solves the memory problem” — reject as stated; revise.** Disk staging avoids retaining the full file in RAM but does not bound records, parser buffers, indexes, matching workspace, database cache, transaction journal, or GUI preview. Bound and measure each; run large-file and responsiveness tests.
- **P3.5 “one final transaction is enough for crash safety” — reject as an unconditional claim; retain atomic apply with explicit durability decision.** Atomicity, process-crash recovery, OS-crash recovery, and power-loss durability are distinct. Choose and pin the engine/configuration and define VFS/filesystem assumptions before promising a failure class. SQLite’s setting-specific boundaries are above [S12-S13/R12-R13, R22-R23]. Test the supported configuration and state precisely which failure classes passed.

### P4 — User behavior, comparison, and validation

- **P4.1 “retain or revise each material decision and describe what users see when an interpretation changes after an earlier import” — fulfill and clarify plain-language outcomes.** Retain raw tokens and immutable lineage. Show old/new time, unit, value, and identity interpretations and what rows/matches change. Distinguish “supplement,” “make a new current revision while retaining the prior value,” “leave the prior accepted value intact,” and “unresolved; do not apply.” The last is a hold, not a no-op. A changed profile triggers a new preview.
- **P4.2 “Compare identity and reconciliation strategies, and identify where manual confirmation is necessary” — fulfill.** Three approaches and limitations appear above. Require correction/review for unknown or reused IDs, multiple candidates, unresolved zone/fold/gap, unrecognized missing token, uncertain unit mapping/conversion, and metadata changes that alter matches.
- **P4.3 “Propose tests for late malformed rows, conflicting units, overlaps, daylight changes, cancellation, and interrupted commits” — fulfill as proposals and extend durability coverage.** See validation proposals below, including separate process/system/power-loss outcomes. None has been executed.
- **P4.4 “Distinguish executed synthetic checks from future application validation” — fulfill.** Executed synthetic import coverage: none. The example above is illustrative. Documentation/examples/issues were inspected, not run. No application, parser, database, stress, restart, crash, or corruption test ran.
- **P4.5 “preserving original-file lineage throughout” — retain and specify.** Preserve source digest, filename/path as descriptive provenance, immutable batch and row/byte locator, raw cells, parser/runtime and profile versions, original time/unit text, normalization and null rules, identity evidence, selected action, revision links, and the prior accepted value. Never rewrite or upload the file.

### P5 — Deadline clause

The maximum elapsed-time instruction and absolute stage deadline remain binding. This reviser completed within the stage deadline and did not wait to consume the allowance. The predecessor critic could not independently verify the investigator’s earlier native terminal response or timing from its permitted package; that evidence gap does not establish that the investigator’s statement was false. I retain uncertainty about that prior-stage process assertion rather than infer it from this stage’s native Goal.

## Critique disposition

- **C-01 — Accept and amend.** The draft’s transaction discussion correctly distinguished rollback-journal atomic commit from WAL, but it did not state the failure-class durability contract. SQLite’s official synchronous-setting documentation confirms the critic’s point. The revised plan distinguishes atomic recovery from durability and application crash from OS crash/power loss; requires an owner-selected, pinned configuration and filesystem/VFS assumptions; and adds configuration-specific tests. No storage engine is chosen.
- **C-02 — Accept.** “No-op” was ambiguous. The preview now says “leave the prior accepted value intact” for no change and separately says “unresolved; do not apply” for a held conflict.
- **C-03 — Retain uncertainty.** The allowed inputs contain no logger specification or sample file. Stable IDs, resets, clocks, channels, units, null sentinels, and file-size envelope remain owner inputs. No outside convention has been invented.
- **C-04 — Retain uncertainty about predecessor process evidence.** The critic’s input package did not include the investigator’s direct native terminal response or independent output-time record. I cannot prove or disprove that earlier lifecycle/timing statement from the allowed artifacts. It is not a scientific finding.

## Original brief coverage and owner decisions

This proposal covers incremental parsing; schema and interpretation; duplicate/revision handling; before/after preview; correction and rerun; local transactional application; format/library/storage documentation and bounded support history; automatic suggestions plus explicit configuration; three overlap methods; ambiguous time and changed units; larger-than-memory responsiveness; cancellation; source immutability and privacy; lineage; and a synthetic scenario with actual versus proposed coverage clearly separated.

Before implementation, owners must decide:

- Supported dialects, encodings, header forms, date grammars, and profile correction flow.
- Logger/device/event/channel identifiers, reset epochs, sequence reuse, and clock conventions.
- Site/logger timezone and daylight fold/gap policy; timezone-data source/version.
- Unit aliases, canonical units, precision/rounding, and handling of arbitrary units.
- Missing-value tokens and distinctions among blank, absent, malformed, zero, and explicit sentinel.
- Whether a confirmed correction changes the current revision automatically or needs separate approval; whether deletion is supported.
- Whether selected unresolved rows may be explicitly held while other rows are imported.
- Lineage/stage retention, cleanup, and recovery policy.
- Maximum input size, memory/disk/journal budgets, restart cost, and any checkpoint criteria.
- Parser, engine, wrapper and runtime versions; database placement and packaging constraints.
- Durability promise by failure class; journal/synchronous settings; actual filesystem/VFS/storage assumptions; and the recovery evidence required before acknowledging an import.

### Validation proposals — not run

- **Parser contract:** quoted delimiters/newlines/escaped quotes; CRLF and LF; missing/repeated headers; BOM and supported encodings; blank rows; each configured null token; decimal conventions; duplicate headers; bad UTF-8; unequal widths; oversized fields/records; malformed final row. Verify strict policy and exact row/byte diagnostics.
- **Interpretation/profile:** same file under two profiles; corrected-profile full rerun; unsupported date/unit labels; zero versus missing; unrecognized sentinel; timezone fold and gap; changed known/unknown units; preservation of original tokens.
- **Matching/revision:** exact replay; partial overlap; same timestamp/different device or channel; repeated reading; same stable ID with unchanged and corrected measurement; reset/reused ID; reordered rows; ambiguous candidates; renamed file; same filename/different bytes; identical content/different name. Verify labels, user choices, prior versions, receipt, and lineage.
- **Atomic apply/cancellation:** malformed late row after valid staged rows; cancel during scan; cancel during apply; injected constraint/write failure before commit; SQLITE_BUSY; SQLITE_INTERRUPT; disk full and I/O error; failure immediately before/during/after commit. Reopen and prove the selected accepted batch plus lineage is wholly present or absent; reconcile uncertain acknowledgment by receipt.
- **Crash and durability:** for every supported engine/journal/synchronous/build/VFS/filesystem configuration, test process termination, OS crash, and power-loss recovery separately. Check both atomic all-or-none state and whether a commit already acknowledged to the user survives. Record settings and limits; do not extrapolate a process-crash result.
- **Scale/responsiveness:** file larger than available RAM; bounded memory, buffers, stage/journal disk, and preview; responsive progress/cancel; first-preview and commit latency; busy reader/writer; recovery time and restart behavior.
- **Source/privacy:** hash source before and after every path; confirm no network/service request; confirm same-name reimport cannot discard accepted observations.

These are future validation proposals, not results. No code or database deployment is part of this plan.

