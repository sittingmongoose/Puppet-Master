# Independent critic — supplier spreadsheet reconciliation

**Run/stage:** B07-P01-treatment / critic  
**Basis:** Complete assigned brief; complete investigator discovery and draft; complete exact released plan; both carried source maps and source index. The plan was read after its recorded single-use reveal. No hidden plan, other candidate, campaign history, or unlisted path was read.  
**Scope:** Research proposal review only. No final was written or repaired. No supplier file, stock database, target repository, caller/test set, application, or production account was accessed. No code or tests were run.  
**Evidence index:** [Critic source index](sources/index.md); complete record: [source-map.json](source-map.json).

## Overall assessment

The investigator package is broad and substantially faithful to the brief. It covers the required mechanism families before micro-corrections: delimited parsing and parser alternatives; header/profile drift; exact numeric interpretation; supplier-scoped identity and discontinued-code reuse; duplicates; preview/cancel; reimport idempotency; transactional versus chunked application; recovery/concurrency; local handling; 80,000-row scale; owner decisions; and a proposed staged validation matrix. It distinguishes proposed validation from executed work and does not claim integration compatibility or deployment.

No material false correction or materially wrong source claim was found in the bounded review. Two material gaps remain: file-level deduplication can strand rows that were not applied, and the local-only data boundary is unclear if the stock target is remote. The missing target-application evidence is honestly unresolved external input, not a reason to guess.

## Findings

### C-01 — Material incomplete: file-level deduplication can strand unresolved rows

**Draft locations:** lines 13, 30–31, 73–81, 133–137.  
**Plan clauses:** file hash prevents second commit; resaved files and interrupted retries need treatment.

The draft proposes one durable key for supplier identity plus exact file digest and a no-op for an already committed identical file. It also says invalid, rejected, and unselected rows remain outside the transaction while a selected valid subset and the file marker may commit together. That makes completion ambiguous: if staff commits a selected subset while another group remains unresolved or deferred, the marker may make reopening the same bytes a no-op and prevent applying the newly resolved row. The proposed repeat test covers a completed import, not this state transition.

Define whether the file is terminal only after every row is applied or explicitly rejected, or whether the ledger supports separately committed row/group subsets with stable identities and idempotency. Preserve the exact-file no-double-apply guarantee. Add a proposed case: subset committed, remaining row resolved, same bytes reopened. This is a proposal gap, not an observed implementation failure.

### C-02 — Material incomplete: local-only data boundary is not end-to-end

**Draft locations:** lines 45, 69, 73–83, 108–109, 127, 147.  
**Brief location:** paragraph 2, “Supplier data should stay local.”

The draft correctly says the file is not uploaded, raw supplier fields are not sent to telemetry, and staging is local. It does not resolve what happens if the stock app's database or service is remote. Sending supplier-derived codes, quantities, or descriptions through a remote write API still moves supplier data off-device. The actual database and offline/local path are listed as owner decisions, but local-only behavior is not an integration gate.

Specify the permitted network boundary for source bytes, parsed values, identifiers, quantities, logs, backups, and write requests. If the target is remote, either settle that “local” permits a defined remote write or keep importing disabled until a local path meets the brief. No target architecture was supplied, so applicability is unresolved; local parsing alone is not proof of compliance.

### C-03 — Minor locator/wording: separate stored parser index from staff-facing row number

**Draft locations:** lines 53 and 121; [SRC02](sources/index.md#src02). The API's byte offset and record index are zero-based; line is one-based. The draft uses “logical record number” for storage and “row” for display without stating whether displayed values are zero- or one-based, especially with a header or embedded newline. Preserve the raw index and define the display convention. The choice of byte and record anchors is sound.

### C-04 — Honestly unresolved external input: target code, callers, tests, and database are absent

**Draft locations:** lines 5, 83, 109, 143, 151; discovery scope/evidence limits.

The brief calls for product repository code, callers/tests, and consequential issue/fix or release history. The frozen input map supplies no stock-app repository path, schema, caller list, or local test paths. The investigator records this limitation and makes no compatibility claim. Database engine, identity model, write path, constraints, and existing tests therefore remain unknown; adapter and caller/test inspection are prerequisites to integration. Upstream source and issue/release evidence were checked independently in this stage.

### C-05 — Unsupported category: none found for consequential claims checked

The bounded source claims are version-scoped and conditional. csv 1.4.0 source confirms comma/header/fixed-width defaults and record-oriented reads; Position confirms zero-based byte/record and one-based line values. Issue #395 remains Open, and linked PR #433 remains Open; the draft correctly treats the fix as unreleased. Polars 0.55.2 documents 100-row inference and ParserError continuation. SQLite's transaction and atomic-commit pages are conditional and distinguish rollback mode from WAL. Decimal exact parsing addresses representability, not locale. OWASP supports inert import text and a separate export boundary. Calamine is correctly a future workbook alternative. See [SRC01–SRC13](sources/index.md).

Issue #377 is about Serde/deserializer ambiguity, not proof that every parser loses duplicate columns. Positional records and manual duplicate-header review are reasonable conservative recommendations.

## Discovery preservation and useful opportunities

The draft carries forward the discovery's actionable insights rather than only fixing plan wording: raw fields remain distinct from normalized values; profiles include dialect and positional header signatures; reused codes map through supplier-scoped aliases; fuzzy matches are suggestions; exact-byte dedupe is separated from optional normalized-content warning; inventory and ledger share a transaction; concurrency is checked against the preview snapshot; and chunking is treated as an explicit partial-success alternative. Disk-backed staging, filtering/virtualization, strict decoding, no formula evaluation, and local retention decisions are also preserved. No useful alternative was silently removed.

One non-blocking opportunity from discovery is to set explicit maximum field-size and preview-memory limits, not only the 80,000-row and file-byte limits. The draft includes worst-case-width performance fixtures and asks for a maximum file size, so this is a product threshold to make concrete rather than a missing core requirement.

## Full brief coverage

| Brief obligation | Draft coverage and critic assessment |
|---|---|
| Delimited input, inconsistent headers, decimal separators, product codes | Explicit profile/dialect and drift; raw text and exact locale grammar. Covered. |
| Preview distinguishes new product from update | New/update categories use chosen internal identity; new association requires staff choice. Covered. |
| Repeated rows and reused codes after discontinuation | Groups preserve all source locations; no sum/drop/last-wins; reuse requires staff resolution. Covered. |
| Recover when a batch stops halfway | Atomic selected-row transaction and same-transaction marker; unknown commit is checked. C-01 clarifies unresolved-row completion. |
| 80,000 rows | Streaming parse, disk staging, virtualized review, benchmark against owner limits. Proposal only; not measured. |
| Save mapping and detect drift | Versioned profile/signature; structural change pauses reuse. Covered. |
| Same file must not add quantities twice | Exact supplier+byte digest and atomic marker. C-01 requires subset/completion behavior. |
| Trace invalid rows to source | Raw values, digest, byte offset, record index and CRLF caveat. Covered; clarify display numbering (C-03). |
| No ambiguous coercion/global uniqueness/formula execution/unmapped-note overwrite | Explicit controls/gates; no executed behavior claimed. Covered. |
| Supplier data stays local | Local file/stage and no raw telemetry; database/network path incomplete (C-02). |
| Compare feasible approaches and unavoidable decisions | csv, Polars, Calamine, in-memory, direct-write, chunk, fuzzy/global-key alternatives and owner decisions are compared without claiming a winner. Covered. |
| Staged integration, validation, success and partial failure | Read-only through synthetic and gated stages; all-or-none and chunk semantics defined. Proposed, not run; add C-01 and C-02 gates. |
| Research docs, code, callers/tests, issue/fix history | Primary docs and upstream issue/PR/release history independently checked. Target app code/callers/tests absent (C-04). |
| Proposal only; no real import or production change | Scope and executed-work status match. Covered. |

## Released-plan disposition review

Each of the 19 clauses in [revealed-plan.md](../investigator/revealed-plan.md) is accounted for below. “Retain” is an assessment of the proposal's core, not endorsement of an untested implementation.

| Released-plan clause | Draft location | Critic assessment |
|---|---|---|
| Separate parsing, review, commit | 21, 49–81 | Retain; preview has no stock writes; explicit apply. |
| Profile identifies headers, supplier, number conventions | 22, 43–47 | Retain/expand; dialect, encoding, positional map, revision and drift covered. |
| Source line and original field text | 23, 53 | Correct to bytes/record first; CRLF caveat verified. Add display convention (C-03). |
| Preview inserts, updates, duplicates, errors | 24, 57–67 | Retain/expand; categories and source identity are comprehensive. |
| Notes never mapped by default | 25, 64 | Retain; unmapped fields cannot update notes. |
| Formula-like text is data | 26, 51, 127 | Retain; inert import and separate export risk. |
| Identity supplier ID plus code | 27, 55 | Correct to supplier-scoped alias and stable internal ID. |
| Discontinued code assumed same item | 28, 55 | Reject; reuse requires staff resolution. |
| Quantity assumed absolute; delta open | 29, 11, 62, 104 | Correct; no implicit default, owner chooses set/add semantics. |
| Hash blocks identical second commit | 30, 73–81, 134 | Retain with C-01; completion state is underspecified. |
| Resaved file and interrupted retry treatment | 31, 79, 134–137 | Clarify; warning-only normalized signature and marker check are sound. |
| Saved locale flags mismatches | 32, 51, 125 | Retain; profile cannot remove intrinsic ambiguity. |
| Ambiguous values and duplicate resolution | 33, 55, 67, 126 | Resolve principles; row groups and decisions explicit. |
| All-or-nothing selected rows; rejected export | 34, 81, 110 | Retain transaction; UI report safer than default raw CSV export. |
| 80k preview memory/transaction time | 35, 15, 89–92, 141 | Retain as proposed design/benchmark; no result asserted. |
| Validation includes reused IDs, drift, locale, duplicates, cancel, interruption | 36, 114–147 | Retain/expand; broad matrix labeled not run; add C-01 transition. |
| No supplier file processed | 37, 5, 116, 149–151 | Retain as accurate status. |
| Preserve originals; replacement/delta explicit | 38, 9–13, 51–55 | Retain and make operational. |
| No deployment requested | 39, 143–147 | Retain; no deployment or implementation claimed. |

## Alternatives, conditions, false-rejection control

- **Parsing:** csv 1.4.0 is a prototype candidate, not a proven winner. Defaults are not a supplier contract, app validation remains necessary, and the CRLF fix is only an open PR. [SRC01](sources/index.md#src01) [SRC04](sources/index.md#src04) [SRC13](sources/index.md#src13)
- **Dataframe:** Polars remains viable with explicit text schema and complete error accounting. Its inference and ignore-errors options are accurately characterized. [SRC08](sources/index.md#src08)
- **Workbook:** Calamine 0.36.0 adds XLSX cell/formula streaming and raises MSRV; a separate workbook decision fits the delimited-text brief. [SRC12](sources/index.md#src12)
- **Numbers/encoding:** Locale syntax precedes decimal parsing; malformed encoding is not silently replaced. [SRC06](sources/index.md#src06) [SRC07](sources/index.md#src07)
- **Identity/duplicates:** Scoped aliases and staff decisions avoid false automatic matches and silent drops. [SRC05](sources/index.md#src05)
- **Transactions:** SQLite is a conditional example only. Its deferred, busy and error-state behavior supports verifying rollback; stock and marker must share the real transaction. [SRC09](sources/index.md#src09) [SRC10](sources/index.md#src10)
- **Formula/export:** Treating source as inert text and validating any later CSV export separately is sound. [SRC11](sources/index.md#src11)
- **Owner choices:** Supplier formats, required fields, quantity operation/precision, code normalization/lifecycle, duplicate policy, retention, transaction capacity, performance limits and any partial-success contract correctly remain product decisions.

## Validation and execution status

Every check listed in the draft is proposed, not run. The investigator reports no importer, code, supplier data, database operation, local repository check, product test or benchmark. This critic independently reviewed public primary docs and upstream issue/PR/release pages; that does not validate the absent target application. Add C-01's unresolved-row transition to the validation proposal and use C-02's network boundary as an acceptance gate. No final rewrite or source correction was made.
