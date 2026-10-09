# Independent assessment — A-M04-B / S10

N1 (treatment): **FAIL**. N2 (control): **FAIL**. Both authored finals are present and scientifically available according to the exact input-map. These are independent scientific failures with different evidence, not a finding of equivalent quality or a faster-FAIL win. Comparative full-quality eligibility is false. No candidate was repaired.

The treatment makes practical discoveries and preserves a coherent strings-first import design, but its proposed P6/V6 aggregate-and-input-hash oracle cannot detect its own dropped-row/duplicate trap. The control explores a broader set of products, detectors and evolution chains, but carries incorrect DuckDB memory, sampling-source, Power Query portability, Excel offset-direction and schema-version conclusions. Positive discovery and honest non-execution do not cancel consequential factual or validation errors.

## Inputs, authority and scope

Assignment: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M04-B/assignment.md`. Exact input-map: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M04-B/input-map.json`. Original brief: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S10/brief.md`. Frozen plan: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S10/plan-root-only.md`. Rubric: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/RUBRIC.md`. All 30 enumerated stage artifacts matched their supplied hashes and byte lengths. Source notes and indexes were also read, and their observed hashes are recorded in assessment.json. Hash checks establish frozen identity, not scientific quality.

Candidate path prefixes used below: N1 = `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment`; N2 = `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control`. A locator such as N1 `reviser/final.md:523–527` means that exact frozen file and one-based lines. Complete discovery, draft, critique, final, stage assignments/maps and declared source notes/indexes were examined. No other evaluation/case/campaign/private provider material was used.

Original obligations were kept distinct: O1 unfamiliar discovery beyond the thin plan; O2 primary defaults, units, types, exceptions and domain applicability; O3 at least one real evolution/issue/fix/regression chain; O4 every plan clause; O5 self-contained preservation of findings, alternatives, conditions, options, disagreement and uncertainty; O6 meaningful discriminating validation with executed/proposed separation. Explicit product constraints are nonprofit analysts, large CSV plus occasional Excel, inconsistent IDs/dates, preview inference, original strings, explained rejects, monthly reuse and modest RAM. Neither implementation completion nor an unlimited accuracy/performance guarantee was demanded.

## Material findings

### N1-01 — VALIDATION_OVERCLAIM / high

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/reviser/final.md:523–527`. Passage: “trap caught by bucket accounting + per-column rates; rerun-report verified by the SHA-256 idempotence/audit hash over the stated normalized form”. Obligations: O2, O6, P6, monthly repeatability and preservation.

The specified aggregate accounting and per-column rates cannot distinguish accepted rows A,B from A,A when both are valid; input=accepted=2 and rejected/skipped=0 in both. The input-original hash remains identical regardless of wrong output. The executed reviewer witness falsifies the exact proposed oracle. This is not a claim that a candidate engine corrupted a file, nor that the proposed test ran: final explicitly says no code/witness executed. Specifying hash normalization fixes comparability, not its failure to bind decisions/output. Critic M6 falsely demanded this split; final accepts the false oracle.

Primary evidence: [R44](https://docs.python.org/3/library/hashlib.html) — Python 3.15.0 docs; SHA256 interface, Hash algorithms; update/digest; file_digest; [R24](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files) — current, mutable, Storing Faulty CSV Lines; reject_errors/reject_scans schemas; projection pushdown.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/reviser/final.md:163–177`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/critic/critique.md:153–173`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/research/draft.md:118–125`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/research/draft.md:267–270`.

Executed reviewer evidence: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/evaluations/A-M04-B/validation-counterexample.json`; SHA-256 `921b30e0c735d1bc6268df11bf754fbe181217d520308bc37a2dcafa74bc7b68`. Identity-transform input rows (A,10),(B,10); corrupted accepted output (A,10),(A,10). Both have input2 = accepted2 + rejected0 + skipped0 and identical all-valid per-column rates; the independently specified identity row-multiset oracle reports inequality. Hashing unchanged input gives the same digest for either output. This falsifies the claimed sufficiency without executing or modifying a candidate engine. An output comparison against a trusted result would be a different check, absent from the stated V6(a). “This half runs now” is treated as proposed availability, not evidence of executed validation, because final explicitly says no code/witness ran.

### N2-01 — MATERIALLY_WRONG / high

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:85–90`. Passage: “an in-memory-only database cannot spill and will exhaust memory on GB-scale work”. Obligations: O2, O6, modest-RAM desktop constraint.

DuckDB documents a .tmp spill directory for in-memory mode as well as <db>.tmp for persistent databases. Persistence is neither necessary for spill nor sufficient to avoid all operator/intermediate OOM conditions. The incorrect distinction governs engine/path restrictions and V7 expected failure; softening prohibition to default+override does not fix it. File-backed storage may be a legitimate product preference.

Primary evidence: [R01](https://duckdb.org/docs/current/guides/performance/how_to_tune_workloads) — current, mutable; no installed-engine pin, Spilling to Disk; Blocking Operators; Limitations, lines 541–565.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:216–221`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:687–696`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:855–862`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/critic/critique.md:248–266`.

### N2-02 — FALSE_CORRECTION_OR_REJECTION / high

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:202–210`. Passage: “Only the third-party tallyman notes assert multi-offset jumps on seekable files; This final asserts NO multi-offset behavior and promises NO offset coverage in preview”. Obligations: O2, O4, O5, P1 inference preview.

The current primary Auto Detection page, already a candidate research source, explicitly distinguishes random different-location sampling on ordinary seekable files from head-only gzip/stdin sampling. The critic contrasts secondary notes with an older 2023 sequential description and ignores that governing primary exception. Final removes source-supported conditional geometry and marks it third-party-only. An installed-version pin/runtime remains unresolved, but lack of primary support is false. This is also supported-content preservation loss, not a demand to guarantee every outlier is sampled.

Primary evidence: [R02](https://duckdb.org/docs/current/data/csv/auto_detection) — current, mutable, Sample Size, lines 523–529; Type Detection; [R32](https://github.com/duckdb/duckdb/issues/17599) — issue 17599; reported 1.3.0, Late quote reproduction; maintainer explanation; full sample escape; [R43](https://duckdb.org/2023/10/27/csv-sniffer) — official blog, 2023-10-27, Five phases; sequential sample; date candidate formats; refinement.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/research/discovery.md:182–188`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/research/draft.md:37–55`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/critic/critique.md:83–117`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:775–777`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:887–893`.

### N2-03 — MATERIALLY_WRONG / medium

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:142–149`. Passage: “Without explicit culture, conversion follows the author's locale — the same query yields different dates on another machine”. Obligations: O2, O4, P2, portable monthly replay competitor comparison.

Power Query seeds default culture at authoring and retains that original location culture when the query moves. Independently authoring identical query text in different cultures can differ, but moving the same authored query is the candidate counterexample and is contradicted by the governing persistence exception. Explicit culture remains a valid import-product requirement; the competing-product portability rationale is wrong.

Primary evidence: [R05](https://learn.microsoft.com/en-us/power-query/data-types) — current Microsoft Learn, Automatic type detection; locale; Using Locale example; [R06](https://learn.microsoft.com/en-us/powerquery-m/how-culture-affects-text-formatting) — last updated 2024-10-09, Default culture, lines 32–35; Invariant culture; [R08](https://learn.microsoft.com/en-us/powerquery-m/table-transformcolumntypes) — last updated 2026-04-30, Syntax and Example 4.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:304–311`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:509–515`.

### N2-04 — MATERIALLY_WRONG / medium

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:269–273`. Passage: “1904 system ... every date is 1462 days ... later in serial terms than the same calendar date in the 1900 system”. Obligations: O2, P2, Excel unit/epoch conversion.

The direction is reversed: Microsoft gives the same July5,2011 date as serial40729 (1900) and39267 (1904). The 1900 serial is greater by1462. Candidate elsewhere correctly describes a -1462 interpretation symptom; that does not resolve this contradictory conversion rule. Critic m11 checks magnitude/calendar wording and fails to check direction.

Primary evidence: [R14](https://support.microsoft.com/en-us/excel/date-systems-in-excel) — Microsoft Support, current, Difference Between the Date Systems; serial example, lines 139–148; [R18](https://openpyxl.readthedocs.io/en/stable/_modules/openpyxl/utils/datetime.html) — openpyxl 3.1.3 source documentation, CALENDAR_WINDOWS_1900; CALENDAR_MAC_1904; from_excel; to_excel.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/critic/critique.md:404–405`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:834–842`.

### N2-05 — MATERIALLY_WRONG / medium

Candidate: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:355–360`. Passage: “default for non-string fields is empty string; field-level missingValues overwrite schema-level”. Obligations: O2, O4, P3, P5, portable declared schema semantics.

Final establishes Table Schema v1 as its declared contract at lines61–65, then attributes field-level replacement to Table Schema without declaring a v2 profile/implementation extension. v1 primary defines schema-level pre-cast tokens; later v2 explicitly standardizes field overrides. The empty-string schema default is not restricted to non-string fields. Per-column product extensions or a declared v2 contract are viable; assuming v1 consumers implement these semantics can silently null identifiers on replay.

Primary evidence: [R16](https://specs.frictionlessdata.io/table-schema/) — Table Schema v1, Missing Values, lines 412–420; field descriptors; bareNumber; [R17](https://datapackage.org/standard/table-schema/) — profile /profiles/2.0/tableschema.json, Profile line 170; $schema lines 234–238; field missingValues lines 633–665.

Lineage/repeated impact: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:61–65`; `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:551–560`.

## Six-axis assessment and original obligations

### N1

1. **complete** — All O1–O6 and explicit original constraints assessed. Useful imports/replay/reject/raw-string/modest-RAM design; O6 materially defective at V6, no other required omission established.
2. **complete_at_original_research_scope** — Governing defaults/types/unit/locale/epoch/reader/spec domains independently checked. N1-01 wrong input-hash/output relationship; minor native NULL scope and US/ISO overgeneralization. Specific unexecuted bindings/integration honestly open.
3. **complete** — Useful unfamiliar Sniffer/indexed-reservoir/qsv/stringsfirst/TableSchema/OpenRefine/PowerQuery/openpyxl choices, optional clustering and tradeoffs retained. No score from citation count; maintained fork is a practical improvement.
4. **complete_6_of_6** — Every exact plan clause and final disposition checked. Main directions appropriate; P6 sufficiency incorrect. Architecture/preference enhancements not uniquely mandated by primary evidence.
5. **complete** — Complete discovery/draft/critic/final and source maps compared. Supported material, alternatives, constraints, options and uncertainty retained or strengthened. False M6 accepted; M5 necessity overstated. Full prose is self-contained.
6. **complete** — No candidate runtime/witness executed; reads separated from V1–V8 proposed. All proposed tests individually evaluated; V6 fails independent discrimination. Reviewer executed bounded logical counterexample with independent row-multiset oracle.

O1 is met by concrete indexed/reservoir strings-first, schema, read-only workbook, maintained qsv and competitor leads. O2 is materially failed at the input-hash/output-certification claim and otherwise mostly grounded with minor scope errors. O3 is met by the dated DuckDB sniffer evolution and Microsoft historical compatibility chain; the deferred optional pandas chain is not a missing minimum requirement. O4 covers six exact clauses. O5 has substantive self-contained final prose and carries alternatives/conditions/options; accepting a fallible critic is the relevant defect, not mere lack of disagreement. O6 honestly separates research from proposed engine tests but V6 is nondiscriminating. Preview/raw strings/ID policies/reject reasons/monthly reuse/RAM constraints all have concrete final treatment; none was silently dropped.

### N2

1. **complete** — O1–O6 and every original constraint assessed. Broad self-contained desktop import plan with raw/reject/replay/RAM coverage; O2/O5/O6 material defects identified, no unlimited-production requirement imposed.
2. **complete_at_original_research_scope** — Independently checked governing exceptions/defaults/types/units/domains and actual issue/fix/test chain; five material factual/applicability errors. Optional unpinnedrelease/secondary estimates openly constrained rather than fabricated proofs.
3. **complete** — Strong breadth: scored dialectresearch/successor, qsv/SQL/lazyframes, two commercial flows, schema/pipeline, Excelreaders and optional styledwrite/nondived tools. Viable leads and costs retained; wrong memory/locale facts distort some tradeoffs.
4. **complete_6_of_6** — Every plan quote/disposition checked; broad correction directions justified. P1 source-supportedgeometry removal false, P2 examples wrong and P3 standardscope wrong; CSV/settings/countintent retained.
5. **complete** — Full discovery/draft/critic/final preservation audit, every M/minor/omission/refusal adjudicated. Source-supported seekablegeometry lost after false M1/m14. Other supported discoveries and uncertainty broadly retained; accepting critic M8/m11 did not fix facts.
6. **complete** — All V1a/V1b–V10 individually assessed; documentation/searchsnippets distinguished from engine/witness execution. Good source-grounded regressions and logical equality proposals, V7 wrong expectedfailure; runtime/profiling not executed.

O1 has substantial useful unfamiliar products/mechanisms and optional leads. O2 materially fails at the five specified governing-fact/applicability conclusions. O3 is met by the calamine0.36.1 x15 report → PR708 → commit71af96a5 → date_xlsx_1904_extlst fixture/test; exact downstream release is honestly unconfirmed. Additional DuckDB/Polars/webbed leads remain qualified and domain-scoped. O4 covers all six clauses but false sampling correction and erroneous P2/P3 rationale matter. O5 loses source-supported conditional sampling geometry, while most other discoveries/options/uncertainty are retained. O6 maintains honest no-runtime status and contains strong proposed regressions/roundtrip equality, but incorrect memory expected-failure premise persists. All explicit desktop/user workflow constraints are substantively discussed.

## Every plan disposition



- **P1**: “Infer column types from the first 1,000 rows.”
- **P2**: “Parse date strings using the machine locale.”
- **P3**: “Convert missing values to null.”
- **P4**: “Keep failed rows in an error CSV.”
- **P5**: “Save transformation settings.”
- **P6**: “Compare output row counts with inputs.”

The exact frozen plan remains the authoritative source for its six clauses. No inferred benchmark window or engine choice was treated as part of that plan. Corrections may enrich underspecified intent; additional architecture preferences are not unique scientific necessities.

### N1

| Clause | Final disposition / locator | Independent adjudication |
|---|---|---|
| P1 | CORRECTION + user decision; reviser/final.md:36–60 | Valid: inference remains a disclosed hypothesis; bounded head/systematic/tail choice and optional reservoir, identifiers strings, schema pinned. 1000 is not inherently forbidden. Sampling numbers are proposed. |
| P2 | CORRECTION + user decision; reviser/final.md:62–91 | Valid portability direction, explicit locale/order/zone/pivot and Excel epoch handling. Minor engine-default generalization retained. openpyxl code supports epoch/serial60, not raw-reader integration execution. |
| P3 | CORRECTION + user decision; reviser/final.md:93–120 | Valid collision-safe per-column missing policy, quoted-empty distinctions and raw preservation. Native DuckDB parameter scoping requires adapter clarification; not an engine-native per-column map. |
| P4 | ALREADY COVERED intent + correction of form; reviser/final.md:122–139 | Reject explanation, original rows and CSV export retained. Queryable table is a chosen architecture, not the only possible way to satisfy original error-CSV clause. Real per-error engine schema added. |
| P5 | ALREADY COVERED intent + correction of form; reviser/final.md:141–161 | Saved settings retained and made versioned/replayable. OpenRefine partial false rejection reversed with Extract/Apply support; locale/casts/pins clearly product extensions. |
| P6 | CORRECTION expanding counts; reviser/final.md:163–178 | Expansion is justified, count minimum retained. Specific aggregate/hash oracle is false (N1-01); this is not a reason to reject reconciliation intent. |

### N2

| Clause | Final disposition / locator | Independent adjudication |
|---|---|---|
| P1 | CORRECTION + user decision; reviser/final.md:469–503 | Prefix-only blind inference needs disclosure/escape/pinning, no universal window guarantee. Window selection honestly open. Removal of supported seekable sampling evidence is false correction N2-02. |
| P2 | CORRECTION + user decision; reviser/final.md:505–542 | Explicit culture/epoch/raw preservation justified, XLSX15digit loss newly added. PowerQuery portability example and epoch serial direction wrong N2-03/04; core product requirement still viable. |
| P3 | CORRECTION + user decision; reviser/final.md:543–571 | Per-column missing tokens/empty-string choice appropriate. Governing v1/v2 schema scope and non-string-only default wrong N2-05. |
| P4 | ALREADY COVERED intent + CORRECTION substance; reviser/final.md:572–599 | Error CSV retained, explanation/accounting enriched. CSV-first phasing optional E4. No invalid rejection of CSV scope required. |
| P5 | CORRECTION of persistence contract; reviser/final.md:600–620 | Versioned portable recipe, manifest and drift retained. Adds needed replay semantics; engine/host floors honestly not all pinned. |
| P6 | ALREADY COVERED intent + CORRECTION substance; reviser/final.md:621–639 | Count minimum retained plus per-cell/rule/manifest accounting and logical equality checks. Row-preserving locale/epoch/dialect corruption correctly motivates expansion; no sufficiency claimed from counts alone. |

## Independent primary coverage

The following groups cover consequential claim families, including native defaults and exceptions, spec and release applicability, and honest unsupported/externally unresolved leads. “Checked” means independently adjudicated, not automatically confirmed. Current/stable public documents are not installed-runtime release pins. Exact URLs, versions, sections and retrieval failures are in source-map.json; source IDs here are reviewer IDs, independent of candidate source IDs.

### N1

| Claim family | Primaries | Result / limits |
|---|---|---|
| CSV inference/dialect/defaults | R02,R03,R04,R25,R26,R43 | Checked native defaults/heuristic scope; strings-first and stratification product choices, minor all-US/ISO generalization. |
| Missing-value/default/type/parameter scope | R03,R04,R16,R22 | Checked matrices/quotedempty/global native params; per-column adapter wording ambiguity. |
| Excelepoch/1900history/lazyread/dimensions | R14,R15,R18,R19,R20,R21 | Checked code constants/parser flag and documented limits; rawserial integration and chosenreader runtime open. |
| Rejectedrows/parsererror records | R03,R24 | Checked real schema/multiplicity; analyst wording/policy product-defined. |
| Savedrecipe/competitor replay/spec domains | R09,R16,R23 | ExtractApply genuine, limitations and extension separation checked; no forwardcompatibility inferred. |
| Streaming/indexed engine alternatives/maintenance | R04,R20,R22,R27,R28,R29 | Architecture options checked; no fastest/native RAM benchmark claimed. |
| Evolution chain(s) | R15,R31,R43 | At least one genuine historical primary chain; pandas third chain honestly mature-state optional followup. |
| Counts/hash/idempotence/validation | R24,R44,validation-counterexample.json | Specified oracle contradicted by executed independent logical witness; other runtime validations remain proposals. |

### N2

| Claim family | Primaries | Result / limits |
|---|---|---|
| DuckDBmemory/operator applicability | R01 | Wrong in-memory/persistent premise N2-01; currentdocs not runtime guarantees. |
| Sampling/type/header/dialect behavior and issue scope | R02,R03,R32,R33,R34,R35,R43 | Wrong primarysupport/geometry conclusion N2-02; genuine quotingissue escapes checked, not generic typeflip proof. |
| PolarsNA/date/inference/eagerlazy/history | R04,R31 | Current defaults/options checked; v2introduction date unresolved separately, not assumed historical pin. |
| Excelepoch/dateunit/serial60/limits/precision | R10,R11,R12,R13,R14,R15,R18,R21,R42 | Wrong serialdirection N2-04; genuine x15fix/test chain, releasevehicle/qsvmetadata/serial60 outputs qualified. |
| PowerQueryculture/portablequery/recordform | R05,R06,R08,R09 | Wrong moved-queryculture assertion N2-03; currentrecordform real, introduction unknown. |
| Declaredmissingvalues/Frictionlesspipeline/replay | R16,R17,R41 | v1/v2semantics and string default conflated N2-05; pipeline capability historical primary supported. |
| Discoverycompetitors and memory models | R20,R22,R23,R27,R28,R29,R30,R40 | Viable choices beyond plan retained; OpenRefine everyoperation blanket minor; multipleengine necessity not proven. |
| Dialectresearch/performance evolution | R36,R37,R38,R39 | Reporteddataset metrics/oldslowdown, domainXMLHTML extension checked; not ranking targetperformance; 2.2secondary estimate explicitly not primaryconfirmed. |
| Validationoracle/status distinctions | R01,R02,R10,R12,R14,R24,R44 | No parser runtime/witness claimed. Logical equalitytest useful; V7 memorycontrol wrong. Candidate retrieval claims are reported, not host-audited execution. |

## Complete preservation and critic audit

A critic verdict was never used as an oracle. The tables cover every material criticism, minor, omission and explicitly refused demand. A justified direction does not make its proposed mechanism correct; a useful optional enhancement is distinguished from a mandated correction. Predecessor scientific assertions were carried forward only with their actual qualifications, not upgraded by final-stage acceptance.

### N1 preservation

- discovery/draft CSV default/strings-first/locale/NA model → final36–120,180–211: retained; source scopes strengthened.
- indexed/reservoir streaming alternative + eager/lazy/declarative/OpenRefine alternatives → final268–312,544–584: retained; qsv maintenance and ExtractApply correction added; optional reservoir remains.
- Excel epoch/serial boundaries/read-only dimensions/explicit close → final62–91,213–266,493–515: retained and code-grounded; raw-reader runtime unverified.
- constraints/decisions/optional clustering/U1–U7 → final213–338,446–464: retained; D7/D8/C6/C7/U8 added; pandas optional chain uncertainty carried.
- P6 draft insufficient hash/accounting → final163–178,523–527: false critic M6 accepted, not a loss of a previously proved validation; N1-01 persists.

### N1 every criticism

| Criticism | Critic lines | Reviewer decision | Final evidence / reason |
|---|---|---|---|
| M1 | critic/critique.md:35–59 | accept justified | Final336–341/P5/A4 restores real OpenRefine Extract/Apply and narrows deficiencies to explicit contracts; R23 supports exceptions, stability still U8. |
| M2 | critic/critique.md:60–81 | accept justified | Final342–348/P4 sources real rejects schema; R24 supports one-error-per-row multiplicity and fields. Product-language mapping remains proposed. |
| M3 | critic/critique.md:82–103 | accept partly | Final349–355/P3 correctly repairs source/default and quoted-empty interaction R03. Global/per-column parameter scope ambiguous N1-m2. |
| M4 | critic/critique.md:104–130 | accept justified, integration limit | Final356–365 resolves epochs/serial60 with code; reviewer additionally checks real parser R19. No raw-reader or runtime execution proven. |
| M5 | critic/critique.md:131–152 | accept useful enhancement, reject necessity | Final366–370 adds disclosed stratification. Predecessor already had head+reservoir, and positions can be retained; critic reservoir-only premise overstated. Optional reservoir retained, no material supported loss. |
| M6 | critic/critique.md:153–173 | reject central oracle, accept normalization clarification | Final371–375/P6/V6 accepts mathematically false bucket/hash sufficiency. N1-01 and reviewer counterexample; algorithm/normalization scope is useful but does not bind output. |
| M7 | critic/critique.md:175–190 | accept label clarification only | Final376–378/P4 relabels scope. Rich error CSV could meet obligation; mandatory queryable-table preference is not independently established. |
| M8 | critic/critique.md:191–223 | accept scoped enhancement | Final379–386 adds PowerQuery R09, explicit declare-dont-detect encoding choice, maintained qsv lineage R27–29. No requirement to benchmark every detector. |
| M9 | critic/critique.md:224–240 | accept justified | Final387–389 removes unsupported fastest superlative and xsv maintenance contradiction. No throughput assertion now graded as executed. |
| M10 | critic/critique.md:241–258 | accept justified | Final390–393 labels locale/casts/pins product-defined, not TableSchema v1. R16 supports distinction. |
| O-a | critic/critique.md:296–316 | accept | Final405–406/D8 retains timezone/DST/pivot decisions; no guessed conversion. |
| O-b | critic/critique.md:296–316 | accept | Final407–408/C6 ID whitespace/case/maxlen safety and optional preview/undo retained. |
| O-c | critic/critique.md:296–316 | accept | Final409/D7 sheet/table/hidden-sheet choices made explicit. |
| O-d | critic/critique.md:296–316 | accept as proposal | Final410–411/C7 threshold/severity policy; 5%/first100 are proposed, no empirical safety result. |
| O-e | critic/critique.md:296–316 | accept scoped uncertainty | Final412–414/U7 installer/autoupdate/offline investigation later, not claimed completed. |
| m1 | critic/critique.md:374–402 | accept | Spacing and decision-identical wording corrected. |
| m2 | critic/critique.md:374–402 | accept | C2 mutable-doc drift labeled risk rather than observed change. |
| m3 | critic/critique.md:374–402 | accept | bareNumber strict default explicit; R16 supports. |
| m4 | critic/critique.md:374–402 | retain uncertainty justified | Pandas mature-state synthesis has no versioned chain. Optional third chain need not displace the independently supported minimum O3 chain. |
| m5 | critic/critique.md:374–402 | accept | Clustering preview/undo/neverauto-on-replay retained as safety preference. |
| m6 | critic/critique.md:374–402 | accept | V4 per-fixture encoding/severity expectations specified. |
| m7 | critic/critique.md:374–402 | accept | V7 8GB/512MB proposed scope and V8 compare target/policy added; bound still build-selected. |
| m8 | critic/critique.md:374–402 | retain build qualification justified | Interpreter/NA-list/binding pin checks are specific follow-ups, not proof of runtime defaults. |

### N2 preservation

- discovery182–188/draft37–55 seekable different-offset sampling → final202–210,775–777,887–893: unjustified downgrade/removal of primary-supported condition N2-02.
- CleverCSV/Garcia alternative/qsv/DuckDB/Polars/schema commercial analogues → final39–181,713–780: retained; benchmarking qualified rather than universal.
- calamine1904 x15 issue/fix/test + epoch/culture/id risks → final260–314,381–457,834–852: retained; fixvehicle/serial60/qsvgap honest; serial direction and queryportability facts wrong.
- E1–E6 D1–D8 U1–U6 + honest notdeepdived/styledwrite → final713–780,879–997: retained; D9/D10/U7–U10 and encoding/precision options added.
- P4 errorCSV and P5/P6 replay/reconciliation minimum → final577–639,643–709,784–875: retained with provenance/CSVfirst and logicalequality validation enhancements.

### N2 every criticism

| Criticism | Critic lines | Reviewer decision | Final evidence / reason |
|---|---|---|---|
| M1 | critic/critique.md:83–117 | reject evidential premise | Final887–893 accepts downgrade and removes geometry; R02 directly supports seekable multi-location sampling. N2-02 preservation loss. |
| M2 | critic/critique.md:119–136 | accept | 10k demoted to illustrative; window open U2, V1b/V2 selection. No evidence-based universal optimum claimed. |
| M3 | critic/critique.md:137–157 | accept scoped distinction | DuckDB-only2.2estimate not generalized to Polars/scored search; underlying numeric estimate remains secondary and unmeasured. |
| M4 | critic/critique.md:158–181 | accept uncertainty | Rawserial60 oracle separates conversion output; calamine exact output honestly unobserved; R18 supports openpyxl only. |
| M5 | critic/critique.md:182–201 | accept | Current record syntax R08 checked; May2025/minimumhost not established, valid explicit uncertainty/fallback. |
| M6 | critic/critique.md:202–225 | accept label clarification | P4 intent retained/substance enrichment classified; CSV-first remains optional, no requirement queryabletable uniquely necessary. |
| M7 | critic/critique.md:226–247 | accept | New P6 blocking suite provenance stated, not invented as already in original plan. |
| M8 | critic/critique.md:248–267 | accept motive, reject claimed resolution | Default+override wording softens absolutes but preserves false in-memory-no-spill premise N2-01. R01 governs. |
| M9 | critic/critique.md:268–290 | accept bounded discovery | Detector candidate list/open pick rather than assumed64KiB replace path; V6 remains proposed, no performance ranking accepted. |
| M10 | critic/critique.md:291–313 | accept | Excel15digit limit R42 genuine; cannot reconstruct already lost original digits. Warning/rawdata limits correctly important. |
| M11 | critic/critique.md:314–335 | accept | Separate recovery V1a and sizing V1b/V2 ladders improve discriminatory question; no universal bestwindow result yet. |
| M12 | critic/critique.md:336–355 | accept honesty | Snippet-only chains downgraded; calamine independently traced fix/test R10–12 satisfies O3. Reviewer bodychecks do not retroactively become candidate execution. |
| m1 | critic/critique.md:356–418 | accept | Type-flip vs quote/dialect issues separated; R32–33 support dialect only. |
| m2 | critic/critique.md:356–418 | accept | try_parse_dates correctly attributed to Polars. |
| m3 | critic/critique.md:356–418 | accept pin caution, current support available | R04 now confirms dictnull_values and empty_string_is_null; hedge honest, not falseclaim parameter absent. |
| m4 | critic/critique.md:356–418 | accept benchmark scope, minor numeric wording | Reported benchmark qualifiers retained; percent vs percentagepoints N2-m2. |
| m5 | critic/critique.md:356–418 | accept uncertainty | qsv commit/API body not fetched by candidates; no release correctness manufactured. |
| m6 | critic/critique.md:356–418 | accept | V3 construction aligns actual x15 regression fixture R12. |
| m7 | critic/critique.md:356–418 | accept CI caution, reject failure premise | Removing uncontrolled OOM sensible, but expecting memory-only fail remains wrong R01/N2-01. |
| m8 | critic/critique.md:356–418 | accept | Logical rowmultiset/cell/rule/manifest equality replaces byteidentity; output comparison is a meaningful discriminating oracle. |
| m9 | critic/critique.md:356–418 | accept as proposed pilot | V10 n≥3/5seeded reasons/no prompting makes small protocol reproducible; no population efficacy proven. |
| m10 | critic/critique.md:356–418 | accept | Date representation fixtures text/serial/ISO specified; boundary oracle still needs pinned reader. |
| m11 | critic/critique.md:356–418 | accept magnitude only, reject full sentence preservation | 1462 magnitude true R14; wrong serial-direction sentence retained N2-04. |
| m12 | critic/critique.md:356–418 | accept honesty | Non-dived products/styledwrite remain optional leads, not fabricated investigations. |
| m13 | critic/critique.md:356–418 | accept | Freshprofile/no cache/priorrecipe plus enginepin makes replay test scoped. |
| m14 | critic/critique.md:356–418 | reject required deletion | Geometry display erased after false M1; version qualification warranted, removal of source-supported seekable condition not. |
| O-a | critic/critique.md:443–480 | accept scoped enhancement | Pandas one-sentence NA/low_memory comparison retained; R22 supports. |
| O-b | critic/critique.md:443–480 | accept as open lead | Date-format guesser class named, unevaluated; no required deep dive evaded. |
| O-c | critic/critique.md:443–480 | accept inapplicability | Commercial internals, nonexistent S10priorreleases and styledwrite readpath not invented. |
| refusal1 runtime | critic/critique.md:534–556 | agree | No candidate engine run required in absent qualified sandbox; proposals and documentation may meet O6 if discriminatory. |
| refusal2 commercial deep dives | critic/critique.md:534–556 | agree | Brief calls useful competitor discovery, not proprietary implementation access. |
| refusal3 universal token/single engine | critic/critique.md:534–556 | partial | Universalnull vocabulary simplification unsafe. Requiring multipleengines is a product choice, not scientific proof no singleengine can satisfy scope. |
| refusal4 drop1904/x15 | critic/critique.md:534–556 | agree | Core occasionalExcel scope and R10–12 justify retaining regression. |
| refusal5 CSVfirst | critic/critique.md:534–556 | agree | Phased errorCSV/UI solution can meet brief; no mandatory UIrewrite. |

## Proposed and executed validation audit

Neither candidate final claims a parser, engine, benchmark or runtime witness executed. N1 reports fresh source fetches and adjudication; N2 distinguishes source bodies from snippets and negative searches. The reviewer independently retrieved primary text/code and ran the bounded mathematical counterexample only. Candidate tool-status/fetch-count claims are reported lineage, not independent lifecycle receipts or proof of functional behavior. No zero-exit, saved-file, citation-count or critic-agreement signal was used as a scientific grade.

### N1

| Validation | Discriminating question | Independent applicability/oracle judgment |
|---|---|---|
| V1 | late flip/strata | meaningful proposed comparison; a finite sampling layout cannot guarantee every change; deterministic seeded fixtures must place changes in observable strata. |
| V2 | NA collision/quotedempty | meaningful proposed value oracle; native vs product per-column scope requires clarification N1-m2. |
| V3 | locale/Excel epoch/serial60 | meaningful proposal with source/code oracles; raw serial access and selected reader pin are integration preconditions, not executed. |
| V4 | rejection/large-line/encoding/dimensions | meaningful proposal with fixture-specific policy; malformed physical lines versus logical rows and multiple error records must be accounted correctly. |
| V5 | month2 contract drift | meaningful proposal, decision identity on unchanged portions not raw output byte identity. |
| V6 | drop/dupe and hash | INVALID discrimination as specified; identical aggregates/input hash despite wrong output, independently counterexample-executed N1-01. |
| V7 | memory floor/close | meaningful proposed8GB/512MB preview scope, build-selected fullpass bounds; no RAM run or performance guarantee. |
| V8 | engine bump replay | meaningful proposed decisionlog/cell comparison; version warning and divergence fail distinct from byte serialization differences. |

### N2

| Validation | Discriminating question | Independent applicability/oracle judgment |
|---|---|---|
| V1a | tailtype recovery | meaningful planned late-value/quarantine oracle; token1e5 alone is numeric, so text component necessary. |
| V1b | window sizing ladder | meaningful comparison of boundary fixtures/windows; conditional sample geometry must be understood, not solely prefix model. |
| V2 | dialect ladder | meaningful structural/cellcorrectness oracle, rankings require targetfixtures not paperbenchmark. |
| V3 | 1904+x15 | strong source-grounded proposed regression fixture R10–12; no run, fixrelease still unpinned. |
| V4 | serial60/pre1900/overflow | meaningful rawvalue/representation oracle, selectedreader behavior honest unresolved. |
| V5 | culture/longXLSX ID | meaningful prescribed culture/date and precision-loss warnings; cannot recover digits destroyed before import. |
| V6 | encodingdetectors | meaningful knownencoding/BOM fixtures, only boundedselection not universalcharset guarantee. |
| V7 | memory/spill | partly meaningful cap/completion/streamRSS checks; memory-only expectedfailure invalid N2-01 and floor/tolerance underspecified. |
| V8 | month2schema drift | meaningful explicit added/renamed column contract and no silent re-inference. |
| V9 | roundtrip recipe | strong logical rowmultiset/cell/rule/manifest oracle, freshprofile defined; not executed. |
| V10 | analyst reasons | small proposed pilot comprehension protocol, not statistical usability proof. |

## Minor findings and unresolved scope

### N1 minor findings

- N1-m1: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/reviser/final.md:69–71` — Blanket all-selected-engines default US/ISO is too broad: DuckDB sniffer includes both DMY/MDY formats. Machine locale still is not a portable product contract. Evidence: R03, R43.
- N1-m2: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/reviser/final.md:100–115` — Strict per-column NULL profile wording conflates product policy with DuckDB reader parameters: nullstr is a global scalar/list and allow_quoted_nulls a reader Boolean; force_not_null is column-selective. A strings-first adapter can implement per-column rules, so this is an ambiguity rather than a demonstrated impossible final architecture. Evidence: R03.
- N1-m3: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/treatment/reviser/final.md:36–60` — Stratification is a useful choice, but critic M5 overstates loss from the predecessor head+reservoir proposal. Reservoir selection does not inherently remove row positions; no mathematical requirement for the revised exact sampling design is established. Evidence: R28.

### N1 assessed unresolved items

- Selected engine/binding and strict per-column adapter behavior; code read is not runtime verification.
- Raw XLSX serial preservation/reader path and serial60/fractional boundaries before conversion; epoch code verified, exact read-only integration not executed.
- Pinned interpreter field limit/exception behavior and exact pandas NA-token list; docs supply mechanisms but installation untested.
- OpenRefine JSON cross-version stability, installer/offline/update scope and pandas optional third evolution chain.
- Proposed sampling strata, 5%reject threshold/first100 policy and full-pass memory bounds are choices, not empirical defaults.

### N2 minor findings

- N2-m1: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:48–53` — Every-operation JSON replay blanket overstates OpenRefine: single-cell edits and undone operations are exceptions. Main reusable bulk-operation lead is valid. Evidence: R23.
- N2-m2: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:106–125` — CleverCSV author reports a 21% messy-file improvement; percentage points are not established. Paper benchmark is dataset-specific, as candidate mostly acknowledges. Evidence: R37, R38.
- N2-m3: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/A-M04-B/control/reviser/final.md:855–862` — Memory proposal uses unspecified laptop floor/RSS flatness tolerances. Meaningful planned boundary remains, but quantitative target not operationalized; no executed guarantee accepted. Evidence: R01, R30.

### N2 assessed unresolved items

- Calamine fix exists at71af96a5; exact downstream packaged release and qsv epoch metadata commit/API availability remain unpinned.
- Exact calamine serial60 output and overflow/format edge behavior; N2 honestly conditions these on fixture verification.
- PowerQueryrecord-culture minimum host/introduction date and Polarsv2 historical infer_schema_files introduction not independently established; current mechanisms verified.
- Encoding detector/date-guesser choice and proposed samplewindow optimum require bounded fixtures; no benchmark or runtime conducted.
- DuckDB2.2×/100MB is explicitly secondary estimate, not independently primary substantiated or target-machine measured; slow/full-scan warning is independently supported.
- Undived optional Trifacta/EasyMorph/KNIME/Talend/styledwrite/commercialinternals remain leads, not completed investigations.

These specific integration/pinning/optional leads do not become proven facts. They are assessed limitations rather than unperformed required axes. The failing grades rest on already demonstrated material errors, not on demanding implementation or every possible tool investigation. No full-quality pass is awarded. The complete_at_original_research_scope label does not certify every incidental secondary number; it means all consequential families and their uncertainty/applicability status were adjudicated against the brief.

## Delivery, lifecycle, timing and cost

Both final_delivery=true and scientific_artifact_available=true are preserved exactly from the input-map. Candidate native completion, usage, billing and comparable runtime are unobserved (null). The reviewer created and observed an actual active native Goal at 2026-10-09T20:00:41+00:00; startup reading preceded activation with no retained exact first-read timestamp. Deadline is 2026-10-09T20:22:35.725426+00:00. All full deliverables are saved before reviewer native completion; terminal state is recorded by the host tool, not handwritten here. No science or candidate feedback follows Goal completion. Both FAIL grades make comparative_quality_eligible=false; no speed or cost win is inferred.

## Evidence and limits

- Grades concern the complete frozen research/planning artifacts against the original small desktop-import brief, not an implemented product or universal correctness/performance.
- All six axes, six plan clauses, complete stage preservation and each critic disposition reviewed. Public primaries independently checked at governing sections; no inference from citation count or critic agreement.
- No candidate engine/parser/Excel application, performance benchmark, installer, binary or fixture was run. Reviewer counterexample is mathematical stdlib work and does not establish candidate runtime corruption.
- Mutable current/stable docs independently observed today do not certify installed-version behavior. Specific package/release/binding/API/host minimums remain build-time qualifications and are listed per arm.
- Candidate source fetch/count/HTTP status assertions are reported stage claims, not independently verified native/provider lifecycle or billing. Mapped final_delivery/scientific availability retained exactly.
- Partial blinding only: file paths, M04 amendment-preservation text and stage mechanics reveal control/treatment; findings adjudicated per arm without a premium reference or candidate feedback.

Independent primary locator catalogue (paraphrases, not copied pages):

- [R01](https://duckdb.org/docs/current/guides/performance/how_to_tune_workloads): current, mutable; no installed-engine pin; Spilling to Disk; Blocking Operators; Limitations, lines 541–565. Persistent and in-memory databases both have default spill directories; operator/intermediate exceptions remain. Refutes N2-01.
- [R02](https://duckdb.org/docs/current/data/csv/auto_detection): current, mutable; Sample Size, lines 523–529; Type Detection. 20480 sampled rows; -1 full sample; regular seekable files sampled at different locations; gzip/stdin sampled at head. Refutes N2-02.
- [R03](https://duckdb.org/docs/current/data/csv/overview): current, mutable; Parameter table, lines 573–626. all_varchar false, auto_detect true, sample_size 20480, strict_mode true, store_rejects false, allow_quoted_nulls true, nullstr scalar/list, force_not_null column list, encodings and 2000000-byte max_line_size; header default subject to detection.
- [R04](https://docs.pola.rs/api/python/stable/reference/api/polars.read_csv.html): stable docs, mutable; candidate py-2.0.0 source pin not separately compiled; Signature, infer_schema_length, infer_schema, null_values, empty_string_is_null, try_parse_dates, use_pyarrow, Notes. 100-row default, full inference cost, strings/schema escapes, false date guessing, dict per-column null_values, empty-string control, infer_schema_files 10 and eager/lazy distinction confirmed; historical change introduction not established.
- [R05](https://learn.microsoft.com/en-us/power-query/data-types): current Microsoft Learn; Automatic type detection; locale; Using Locale example. Author OS seeds file locale; explicit culture/column conversion solves ambiguous interpretation. Must read with R06 portability exception.
- [R06](https://learn.microsoft.com/en-us/powerquery-m/how-culture-affects-text-formatting): last updated 2024-10-09; Default culture, lines 32–35; Invariant culture. A query retains author-location default culture when moved to another location. Refutes N2-03; no literal query execution claimed.
- [R07](https://learn.microsoft.com/en-us/powerquery-m/culture-current): current Microsoft Learn; Culture.Current; related how-culture link. Followed governing default-culture documentation rather than infer portability from current-culture wording alone.
- [R08](https://learn.microsoft.com/en-us/powerquery-m/table-transformcolumntypes): last updated 2026-04-30; Syntax and Example 4. Both positional culture and record Culture/MissingField form exist; a May-2025 introduction/minimum host version is not established.
- [R09](https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query): current Microsoft Learn; Transformation/query/refresh product model. Repeatable M transformations and host integrations corroborate N1 second-competitor discovery; no licensing or installer benchmark asserted.
- [R10](https://github.com/tafia/calamine/issues/706): issue 706; reported calamine 0.36.1, 2026-08-09; Reproduction and x15 workbookPr diagnosis. Modern 1904 xlsx attribute reset causes -1462-day wrong dates; report distinguishes XLS/XLSB scope.
- [R11](https://github.com/tafia/calamine/pull/708): PR 708, merged 2026-08-26; Fix discussion and merge. Fix exists; does not establish chosen downstream package release vehicle.
- [R12](https://github.com/tafia/calamine/commit/71af96a5): commit 71af96a5; src/xlsx/mod.rs; tests/test.rs date_xlsx_1904_extlst; tests/date_1904_extlst.xlsx. Assign date1904 only when attribute present; regression test/fixture added. Read source, did not execute test.
- [R13](https://github.com/tafia/calamine/pull/630): PR 630; Epoch exposure API proposal/merge page. Epoch-exposure lead checked; exact downstream qsv commit b5d4479 and installed API availability remain candidate-qualified leads.
- [R14](https://support.microsoft.com/en-us/excel/date-systems-in-excel): Microsoft Support, current; Difference Between the Date Systems; serial example, lines 139–148. For the same calendar date, the 1900-system serial exceeds the 1904-system serial by 1462. Refutes N2-04.
- [R15](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/wrongly-assumes-1900-is-leap-year): Microsoft Support historical compatibility article; candidate git pin not fetched separately; Cause; More Information. Intentional Lotus/Excel compatibility explains fictitious 1900 leap day; historical evolution is applicable, not a new import-app release chain.
- [R16](https://specs.frictionlessdata.io/table-schema/): Table Schema v1; Missing Values, lines 412–420; field descriptors; bareNumber. Schema-level pre-cast missingValues default is [empty string]; v1 text does not define field-level replacement semantics. Distinguish extension from later v2 standard.
- [R17](https://datapackage.org/standard/table-schema/): profile /profiles/2.0/tableschema.json; Profile line 170; $schema lines 234–238; field missingValues lines 633–665. v2 explicitly defines field override/replacement; default profile compatibility makes version declaration consequential. Refutes unqualified v1 attribution in N2-05.
- [R18](https://openpyxl.readthedocs.io/en/stable/_modules/openpyxl/utils/datetime.html): openpyxl 3.1.3 source documentation; CALENDAR_WINDOWS_1900; CALENDAR_MAC_1904; from_excel; to_excel. Epoch constants, serial-60 collapse and fractional-day conversion verified from code; not executed under an installed package.
- [R19](https://openpyxl.readthedocs.io/en/stable/_modules/openpyxl/reader/workbook.html): openpyxl 3.1.3 source documentation; WorkbookParser.parse, lines 52–57. Actual parser propagates package.properties.date1904 to wb.epoch, corroborating N1 beyond descriptor/property declarations.
- [R20](https://openpyxl.readthedocs.io/en/stable/optimized.html): openpyxl 3.1.3 docs; Read-only mode; Worksheet dimensions; Write-only mode. Lazy read-only iteration, explicit close, wrong dimension/reset behavior and limited append-only writer supported. No large-file run performed.
- [R21](https://openpyxl.readthedocs.io/en/stable/datetime.html): openpyxl 3.1.3 docs; The 1900 and 1904 date systems. Epoch and fake Feb29 limitations verified; retaining underlying XLSX serial before conversion remains a build integration obligation.
- [R22](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html): current docs, candidate 3.0.6 pin; not installed; dtype; keep_default_na/na_filter matrix; low_memory; chunksize; date_format. String dtype alone does not disable NA recognition; low_memory still returns a whole frame; chunking needed for bounded processing; mixed dates have documented caveats.
- [R23](https://openrefine.org/docs/manual/running/): current manual; History; Reusing operations, lines 395–401. Extract/Apply operation JSON exists; undo history and single-cell edits are exceptions; stable cross-version JSON semantics not guaranteed here.
- [R24](https://duckdb.org/docs/current/data/csv/reading_faulty_csv_files): current, mutable; Storing Faulty CSV Lines; reject_errors/reject_scans schemas; projection pushdown. Two temporary tables, one row per error rather than necessarily per input row, raw line/column/positions/error fields; projected-away columns can hide conversion errors.
- [R25](https://docs.python.org/3/library/csv.html): Python 3.15.0 docs; csv.reader; Dialects; field_size_limit; Sniffer. String cells, newline behavior, field size limit and heuristic header/dialect detection supported; no interpreter run used as parser witness.
- [R26](https://raw.githubusercontent.com/python/cpython/v3.15.0/Lib/csv.py): CPython v3.15.0 source; Sniffer.preferred; sniff; has_header. Preferred delimiters resolve candidate ties, not every possible delimiter choice; header heuristic samples limited rows.
- [R27](https://github.com/BurntSushi/xsv/releases): archived 2025-04-24; latest listed 0.13.0; Repository archive notice; releases. N1 maintenance concern and retention of command patterns are reasonable; no benchmark transferred to target laptop.
- [R28](https://github.com/BurntSushi/xsv): current archived README; Commands: index, sample, slice; unmaintained notice. Reservoir sampling uses sample-proportional memory; indexed slices are supported; README now recommends qsv/xan. Reservoir does not inherently erase record positions in a product adapter.
- [R29](https://github.com/dathere/qsv): current README, mutable; Origins; command reference. Maintained fork lineage and command patterns supported; exact workbook metadata change/release not independently pinned.
- [R30](https://docs.rs/crate/qsv/1.0.0): qsv 1.0.0 crate documentation; Streaming/full-load command markers; memory management. Command-dependent memory categories supported; blanket constant-memory promise is not justified and final N2 preserves the distinction.
- [R31](https://github.com/pola-rs/polars/pull/1674): historical PR 1674; CSV inference None feature. Historical full-inference option evolution observed; later infer_schema_files release introduction not body-verified.
- [R32](https://github.com/duckdb/duckdb/issues/17599): issue 17599; reported 1.3.0; Late quote reproduction; maintainer explanation; full sample escape. Quote detection can miss late syntax; reproduction sensitivity and random sampling noted. Not a generic type-flip issue or universal current failure.
- [R33](https://github.com/duckdb/duckdb/issues/21000): issue 21000; reported 1.4.4; Late quoted delimiter; sample/explicit quote workaround; later status. Reported/reproduced quoting problem and escapes verified; proposed follow-up does not establish merged/released fix.
- [R34](https://github.com/duckdb/duckdb/issues/6011): historical issue 6011; Header/type sampling recovery report. Issue lead checked; not treated as proof every all_varchar recovery preserves semantics.
- [R35](https://github.com/duckdb/duckdb/pull/14097): historical PR 14097; CSV error presentation. Error-format evolution lead is applicable; no claim of target runtime test.
- [R36](https://github.com/alan-turing-institute/CleverCSV/issues/15): issue 15 opened 2020-05-19; Large FEC-file slowdown report. Historical performance warning exists; neither measured current performance nor a target-workload ranking.
- [R37](https://pypi.org/project/clevercsv/0.5.6/): CleverCSV 0.5.6 release page; Dialect detector algorithm/author benchmark; read/stream helpers. 97% and 21% messy-file improvement are author-reported benchmark statements; not universal accuracy or automatically 21 percentage points.
- [R38](https://journals.sagepub.com/doi/10.3233/DS-240062): Garcia et al. 2024 DOI DS-240062; Table 1 simple Pollock Actual(50R) comparison. Dataset-conditioned comparison 100% vs 94.59% supports retained alternative research lead, not target-data superiority.
- [R39](https://duckdb-webbed.readthedocs.io/en/latest/changelog.html): webbed extension 2.3.0 changelog; Sampling/type-inference improvements. Previously ignored sample_size corrected; default sample enlarged 20→50; extension XML/HTML domain, not a DuckDB CSV core release. Runtime widening not automatically a 2.3.0 CSV guarantee.
- [R40](https://www.tableau.com/blog/tableau-prep-conductor-and-data-management-add-on-101614): Tableau 2019.1 announcement, 2019-02-13; Scheduling/sharing flows; server environment. Historical commercial replay/scheduling analogue verified; current pricing/licensing/desktop RAM claims not inferred.
- [R41](https://pypi.org/project/frictionless/3.27.0/): frictionless 3.27.0, 2020-11-09; Purpose; Transform your data; API instability notice. Describe/extract/validate/transform and pipeline capability supported; historical package not a current API compatibility guarantee.
- [R42](https://support.microsoft.com/en-us/excel/change-formula-recalculation-iteration-or-precision-in-excel): Microsoft Support current; Excel365/2024/2021; Precision, line 136. 15-significant-digit storage/calculation precision supports N2 newly retained XLSX identifier-loss warning; original digits may already be irrecoverable.
- [R43](https://duckdb.org/2023/10/27/csv-sniffer): official blog, 2023-10-27; Five phases; sequential sample; date candidate formats; refinement. Genuine historical sniffer evolution; includes DMY and MDY, refuting N1 blanket all-US/ISO characterization. Older post does not nullify current primary sampling docs.
- [R44](https://docs.python.org/3/library/hashlib.html): Python 3.15.0 docs; SHA256 interface; Hash algorithms; update/digest; file_digest. Digest represents supplied input bytes; input digest alone does not certify output decisions. With executed logical counterexample supports N1-01.

Unavailable/redirected primary operations are retained in source-map.json with their actual result. In particular inaccessible worksheet-reader internals, historical Polarsv2 introduction, and current Tableau scheduling page were not silently described as observed. Alternative retrieved primaries establish only the scoped facts stated above.

Assessment authored/saved at 2026-10-09T20:17:26.642732+00:00.786351+00:00.
