# Independent critic review — supplier spreadsheet reconciliation

**Run/stage:** B07-P01-control / critic  
**Reviewed:** original brief, frozen discovery, investigator draft, investigator source map/index, released plan, and plan reveal record.  
**Plan identity:** SHA-256 0bc254bf2a6a44977ac7037923782331552ecee5afdcc79df4264e6452b2c7fa (the reveal record reports 2,391 bytes).  
**Independent source review:** primary references S01–S13 were navigated from the carried source index and checked again; see this stage's source-map.json. All source records use the post-navigation critic capture time, 2026-10-12T01:15:18Z.

## Assessment

The investigator package is a careful, appropriately provisional proposal. It follows the released plan at clause level, addresses the brief's safety and recovery requirements, compares parsing and persistence choices without committing to a library, and distinguishes proposed validation from executed work. It does not claim supplier data, application code, a build, or a benchmark was used.

One technical statement is materially inaccurate: DuckDB's documented 20,480 auto-detection sample is measured in lines, not rows. The package repeats the wrong unit in discovery and draft. Its broader warning that a sample cannot prove whole-file structure is still sound, but the numeric comparison to the 80,000-row ceiling is not supported as written.

The target application's repository, callers, tests, and backend remain unavailable. The draft discloses this and defers app-specific choice; it is an honestly unresolved external input, not a concealed execution claim. The brief's app-research obligation therefore remains outstanding before an app-specific recommendation can be finalized.

## Findings

### F1 — Material wrong: DuckDB sample unit

**Locators:** discovery.md, “Local query-engine staging”; draft.md, P13 and “Recommended scoped approach”; investigator source-map.json and source index S08.

The package says DuckDB's default sample is 20,480 rows and compares that count with the brief's 80,000 rows. The preview documentation defines sample_size as the number of sample **lines** used for automatic detection and gives 20,480 as its default. A physical line is not a logical CSV record when quoted fields contain line breaks, a condition the package itself correctly discusses under S01/S06. Keep the caution about sample-based inference, but state the documented unit and avoid equating line count with logical records. The primary reference was opened and its parameter table checked independently (DuckDB CSV Import preview documentation, S08).

### F2 — Material incomplete: consequential DuckDB issue record omits reported build matrix

**Locators:** discovery.md, S09 discussion; draft.md, P12, P17 and “Evidence, assumptions and execution status”; investigator source-map.json S09.

The package accurately labels issue #25827 as an unverified upstream report, not proof of all-release behavior. Independent review confirms it remains Open with the needs-triage label. The issue body also reports reproductions on a development build at commit 2bbfe6f236 and versions 1.6.0.dev214, 1.5.5, 1.4.2 and 1.1.3; it says sample_size=-1 retained the loss in the reported case, while null_padding=true retained 30,000 rows with a changed inferred schema. These are author-reported results, not results reproduced by this critic. Since silent row loss is consequential to this proposal, the source record should preserve the reported build/version matrix and the exact limitation. This does not warrant upgrading the issue to verified library behavior.

### F3 — Honestly unresolved external input: application code and integration evidence

**Locators:** brief.md, paragraph beginning “Produce a research-backed software proposal”; discovery.md, “Unavoidable owner decisions” and “Executed versus proposed”; draft.md, “Evidence, assumptions and execution status.”

The original brief asks for relevant repository code, callers/tests, and issue-to-fix or release history where consequential. The permitted stage inputs contain no application repository path, backend, callers, or tests. The investigator explicitly says these were not supplied and proposes repository/domain inventory as Stage 0; no application code was inspected. That disclosure is accurate. App-specific compatibility, product identity rules, stock write paths, transaction limits, tests, and the relevant chosen dependency history remain unresolved until the repository and its integration context are provided. The DuckDB upstream issue history was inspected; no fix or linked release was present on the issue when checked.

### F4 — Minor locator/wording: local rejected-row report versus separate-file export

**Locators:** revealed-plan.md, sentence on all-or-nothing commit and rejected rows; draft.md, P12.

The released plan says rejected rows are exported in a local review report. The draft guarantees an on-device review report but makes a separate file export optional. These may refer to the same in-app report or to distinct outputs. If the plan intended a file artifact, the draft softens that provision; clarify the report form while keeping the data local and retention explicit. Do not infer that “export” permits sending supplier data off-device.

### Other classifications

No other material wrong or unsupported claim was found in the reviewed scope. F4 is a minor plan-wording ambiguity. The draft's parser defaults, source-locator distinctions, conditional SQLite/PostgreSQL behavior, and open business questions are appropriately bounded by the cited sources. Proposed checks, benchmarks, and rollout steps are labeled as proposals rather than executed validations.

The draft's use of “all-or-nothing” as a provisional preference is qualified by backend feasibility and accompanied by a resumable-partial alternative with explicit costs. It does not erase the product decision. Its optional export language is consistent with local-only handling, although the output format and retention policy remain product choices as the draft says.

## Released-plan coverage

The plan is six prose paragraphs; the draft's P01–P18 labels split those statements into clause-level dispositions. The following checks those dispositions against the exact released text.

| Draft disposition | Critic assessment |
|---|---|
| P01 parsing/review/commit boundary | Retain. Separates local parse/stage, read-only preview, explicit Apply, receipt and recovery. |
| P02 profile identity and conventions | Retain. Adds version, parser, structure and drift checks without claiming the profile proves meaning. |
| P03 row location/raw text | Retain. Correctly distinguishes logical record, byte offset and physical line; physical line is only displayed after validation. |
| P04 preview categories | Retain. Covers new/update/unchanged, duplicate/conflict, ambiguity, invalid data and protected fields, with pagination for 80,000 rows. |
| P05 notes/formulas | Retain as a hard constraint. Keeps text inert and notes/unmapped columns outside the write allowlist. |
| P06 supplier-code identity | Retain/correct. Supplier-scoped alias is not the internal product key. |
| P07 discontinued-code reuse | Retain/correct. Historical match is evidence, not authority to update. |
| P08 absolute versus delta quantities | Retain as unresolved. Requires operation mode before Apply. |
| P09 same-file replay | Retain and strengthen. Receipt, exact-file recognition, atomic receipt/write, and explicit correction path are covered; semantic equivalence stays open. |
| P10 locale parsing | Retain and expand. Invalid and ambiguous are separate; raw and proposed normalized values remain visible. |
| P11 repeated rows | Retain and expand. Preserves source rows and assigns duplicate policy to the owner. |
| P12 commit and rejected rows | Retain conditionally. All-or-nothing is provisional and backend-dependent; partial resume remains explicit. The on-device report is retained; clarify whether the plan's export means an in-app report or a separate local file (F4). |
| P13 80,000-row performance | Retain. Streaming/bounded staging, virtualized review, and measurable synthetic-fixture benchmarks are proposed, not claimed as run. Correct F1's sample unit. |
| P14 validation | Retain and expand. Covers additional malformed inputs, replay and failure boundaries; clearly proposed only. |
| P15 no supplier file processed | Retain as an accurate executed-work fact. |
| P16 preserve values and surface replacement/delta | Retain. Separates parsing from inventory semantics. |
| P17 provisional after reveal | Retain. It uses the released plan and keeps unanswerable supplier/product decisions open. |
| P18 no deployment | Retain. The proposal does not request production import, database change, or rollout. |

## Brief-wide obligations

- Parsing/profile design, inconsistent headers/dialects, decimal ambiguity, code normalization/reuse, duplicates, traceable invalid rows, replay, transaction/recovery, staff-note protection, formula inertness, local residency, and the review workflow are all addressed.
- Feasible approaches include a Rust CSV parser, Python's standard-library parser, DuckDB staging/profiling, and conditional PostgreSQL COPY/SQLite transaction paths. The draft does not select a product without knowing the application stack.
- Unavoidable owner decisions are stated, including quantity semantics, duplicate handling, alias lifecycle, locale/precision, update allowlist, commit policy, retention/export, and repository/backend constraints.
- Success and partial failure are defined separately for atomic and resumable modes.
- Proposed versus executed work is explicit. No tests or benchmarks are represented as run.
- The package remains a proposal. This critique does not write or repair a final recommendation.

## Primary evidence notes

The independently checked references support the key bounded claims: RFC 4180 is informational and notes CSV variation and quoted line breaks; CSVW is a metadata vocabulary with dialect and column-schema concepts; rust-csv 1.4.0 defaults to width checking and its Position API exposes byte/line/record positions; Python documents sample-based Sniffer behavior and line_num as physical lines read; DuckDB preview docs specify sample_size in lines; SQLite documents BEGIN IMMEDIATE/SQLITE_BUSY and UPSERT conflict behavior; PostgreSQL 18 documents COPY error behavior and conditional verbose line/column notices. The DuckDB issue remains an issue report, not a release guarantee. Detailed locators, access observations, conditions and applicability are in source-map.json.
