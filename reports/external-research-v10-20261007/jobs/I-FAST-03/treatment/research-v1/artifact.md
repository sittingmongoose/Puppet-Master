# I-FAST-03 — Community building energy interval dashboard
## Proposed revised sandbox plan (research-v1)

**Status:** complete researcher draft; independent flash-family criticism (O5) is pending. This is a proposal only. No application was built, no application checks were executed, and no critic feedback is represented.

## Stage record

- First useful saved finding: 2026-10-07 21:28:51 UTC.
- Complete researcher package saved: 2026-10-07 21:34:21 UTC (clock sample immediately before final source-map/hash reconciliation).
- Research stage deadline: 2026-10-07T21:35:44.125819Z. This draft was completed within that envelope; the remaining arm allowance is for the critic-finalizer.
- Source operations: 7 web-search batches; 3 web open/find/click batches; 28 direct public HTTP capture attempts (24 successful bytes, 4 HTTP 404s); 3 GitHub REST metadata requests failed with HTTP 403. Four failed fetches were guessed pandas v0.19 test/release-note raw paths and were not retained. The release notes were captured from pandas’ published documentation instead.
- Input/cache/generated/reasoning/billing counters: null (not exposed). Host-projected distinct counters: unavailable in this researcher context, so null. Aggregate Goal tool counters are reported separately in actual Goal tool outputs: activation sample was 0 tokens and 0 seconds; this is not a source-specific usage measure.
- Evidence bytes and SHA-256 values are listed in [source-map.json](source-map.json). Only the admitted brief/plan and self-discovered public sources were used.

## Findings and recommendation

The brief’s “trustworthy period comparisons” implies that importing a file must preserve evidence before the application interprets it. OpenEnergyMonitor’s Emoncms graph is a useful domain analogue: it supports multi-feed comparisons, statistics and aligned CSV output, and it represents absent fixed-interval values as nulls/gaps unless a user elects a fill behavior [S1, S2]. That pattern supports visible missingness and period coverage in the proposed dashboard. Emoncms is built around feeds and configured devices, however; it does not establish that its server/module architecture suits a local batch-file workflow.

The most consequential inspected candidate is pandas’ CSV parser. A real issue reported that passing duplicate output names to `read_csv` could make one column repeat another column’s values, losing the original first column. The pandas 0.19.0 parser contains `TextFileReader._maybe_dedup_names`, with an explicit comment naming GH-7160 and a loop adding numeric suffixes [S6]. The 0.19.0 release note connects GH-7160 to the fix and shows the before/after data: prior output duplicated the second “a” column; revised output retains the first values and makes the last label “a.1” [S4, S7]. Current pandas v3.0.6 keeps inferred header names distinct but rejects duplicate caller-supplied `names` in `_validate_names`, called by `_read` before constructing `TextFileReader` [S8, S10]. The current parser test suite checks repeated multi-row header labels across parser backends [S9]. The release-note reproducer is exact evidence of the original regression and correction; the captured current test is related header-mangling coverage, not a separately verified test for GH-7160 itself. A dedicated GH-7160 regression-test source was not located in this bounded research stage.

This history changes the import recommendation: preserve the original header cells and their positions, then require a reviewed positional mapping. Do not rely on a parser’s generated suffix as the persistent identity of a meter field. If a Python runtime is selected, pandas v3.0.6 is a viable parsing/analysis candidate behind an adapter, with all input columns initially read as strings and explicit conversion after review. The frozen scope is small enough that a standard-library CSV parser is also viable; it avoids adding a dataframe dependency but still needs the same strict preview, type checks and adversarial fixtures. The parser/library and app runtime remain a product choice until the project validates normal-laptop packaging and startup. No data-size benchmark was run.

Timestamp handling needs its own interpretation step. Python’s `zoneinfo` documentation describes IANA time zones, distinguishes the two occurrences of an ambiguous wall time with `fold`, and warns that Windows deployments may need the `tzdata` dependency [S12]. The application should retain the raw timestamp string and show the selected time zone/offset convention. It must flag ambiguous or nonexistent local wall times for review instead of silently selecting an occurrence or shifting a time. An offset-bearing timestamp may be normalized to UTC for storage, while the chosen building-local zone remains available for daily and time-of-day views. No source supplied with the case identifies the building’s jurisdiction or meter export convention, so those remain unresolved choices.

Two discovered failure leads are kept as cautions, not treated as shipped fixes. Emoncms issue #142 describes missing days when deriving daily use from a sparse cumulative feed; the retrieved page is closed but shows no activity or linked fix, so it supports a test scenario rather than a claim about corrected code [S3]. Pandas issue #66259 describes parallel `read_csv` divergence on large files and has a 3.1 milestone but no linked PR on the retrieved issue page; it does not establish a fix in the v3.0.6 release, so no shipped status is inferred and the proposal avoids parallel inference [S5]. These leads favor explicit type/missingness policy and deterministic recomputation.

## Replacement sandbox plan

### P1 — File intake and preview

Support CSV interval-export files for three meters and up to one year per meter. A file remains immutable after selection. Before import, show a preview and require or confirm: delimiter/quote convention and encoding; header row and columns by source position; meter identity; timestamp column/format; whether timestamps denote interval start, interval end, or a register-reading instant; time-zone/offset convention; interval length or explicit per-row duration; units and decimal convention; and whether the value is interval energy, average/instantaneous power, or cumulative register.

Keep the exact raw field strings, original file identity (local path label plus content hash), source row number, import run, chosen mapping and chosen interpretation. A repeated identical file can be recognized by hash, but remains traceable to its import. Parsing errors, empty fields, nonnumeric readings and inconsistent row widths are previewed by row and column. Never silently skip a malformed row or coerce an unknown token to zero/NaN for later totals. When pandas is used, parse raw columns as strings and avoid automatic datetime, numeric and NA inference until the reviewed mapping is applied [S8, S10].

### P2 — Local storage and review

Use a local-only store with separate records for source files, raw rows, mapping/interpretation revisions, normalized intervals, review flags, operator events and export runs. Storage technology is still a product choice: a local relational database is the preferred candidate for transactional import/review and repeatable queries; a file-based store is an alternative if packaging simplicity outweighs query needs. In either case, preserve the immutable raw rows and make every normalized record traceable to the source file, row and interpretation revision.

For repeated or overlapping imports, classify exact duplicate rows, identical intervals with conflicting values, partial overlaps, and duplicate timestamps separately. Offer a review view with both originals and provenance. Do not overwrite earlier readings or automatically choose the newest file. A reviewer may exclude a reading in a scenario; exclusion is a separate decision record and leaves the raw row intact.

### P3 — Dashboard and period comparison

Provide daily and monthly totals, time-of-day profiles, and user-selected period comparisons. Each view names the selected meter(s), date range, local time zone, interpretation revision, and applicable value/unit semantics. Show expected versus observed interval count, coverage percentage, missing count and excluded/suspect count next to totals; display missing intervals as gaps and never silently fill them. Any optional estimated or filled view must be explicitly labeled, kept separate from the observed total, and excluded from the default comparison.

Aggregation rules depend on the reviewed value type:

- Interval-energy readings are summed only for valid, non-overlapping intervals in the selected range. A partial boundary interval is excluded or handled under a displayed, user-approved allocation rule; it is never prorated silently.
- Power readings become energy only when the file semantics support a duration-weighted integration rule. The duration and assumed interval-hold/average semantics must be shown; point samples without a justified duration do not become energy totals.
- Cumulative registers are differenced only across valid adjacent readings. Negative jumps are flagged for review as possible reset, rollover, correction or data error. Rollover handling requires explicit meter range/behavior; do not infer it from the magnitude alone.

Period profiles use the same building-local clock basis, but retain repeated DST hours as distinct instants and annotate 23/25-hour days. Comparisons must show coverage for each period. Do not extrapolate a partially covered period to a full-period estimate unless a separately labeled exploratory option is later approved. Descriptive differences are not verified savings or causal estimates.

### P4 — Interpretations, events and product boundaries

Allow competing file interpretations to be saved and compared side by side. Preserve operator event labels such as a closure with time range, authoring date and optional note; events are contextual annotations only and do not alter readings or prove cause. Scenario summaries report the interpretation and exclusions used.

Keep the brief’s limits: one building and three meters; no bill certification, tariff conclusions, automated control, equipment purchasing advice, or verified-savings claims. Avoid product language that presents a period difference as a causal effect.

### P5 — Components, privacy and local operation

Treat pandas v3.0.6 as the preferred Python data-frame candidate only if the team chooses a Python app runtime. Put it behind a small ingestion adapter so raw strings, original header positions, explicit conversion and import diagnostics remain product-owned. The standard-library `csv` module is a lighter alternative; compare packaging, startup, parsing behavior and implementation effort before committing. Regardless of parser, reject silently discarded rows, duplicate mapped field identities, unmapped required columns and inconsistent interval semantics. Do not use parser-generated header suffixes as stable field IDs [S4, S6, S8-S10].

Keep interval aggregation in a deterministic domain layer separate from chart code. Select a chart component only after verifying null-gap rendering, multiple units/meters, period overlays, local-time ticks around DST, accessible data tables, offline/local operation, export support and packaging cost. Emoncms provides comparison and gap-display patterns but is not a candidate architecture for this local import MVP [S1-S3]. Decide the storage engine only after confirming whether the MVP is single-user and whether users need portable project files or just a local app database.

All processing is local by default. The default export omits account identifiers and raw file paths; the review package can explicitly include source hashes, meter aliases, row references, interpretation choices, coverage, exclusions, units and uncertainty. The user must choose whether meter aliases and source filename are included in that package. No cloud account or third-party service is required.

### P6 — Export and validation proposals

Export a period-comparison table with meter alias, period start/end and time zone, units/value semantics, observed total, coverage, included/excluded counts and interpretation revision. Include a compact manifest identifying source hashes and import choices; provide source row references for reviewed exceptions. Export must not imply billing certification or verified savings.

Proposed validation work for the later authorized sandbox:

1. **CSV intake:** quoted delimiters/newlines, BOM and selected encodings, alternate delimiters/decimal separators, duplicate and blank headers, missing/extra fields, empty files, malformed rows, duplicate timestamps, repeated files, and one large file. Assert raw strings and row identities survive preview; parser/library paths must produce the same reviewed records or a clear error.
2. **Timestamp/DST:** offset-bearing and UTC inputs; local-time repeated hour with both offsets; nonexistent spring-forward wall time; leap day; interval start/end convention; date-range boundaries; 23/25-hour daily totals and profiles. Ambiguous/nonexistent cases must stay reviewable, never disappear or collapse [S12].
3. **Units and value type:** interval energy in common multiples, average power with known durations, cumulative registers with monotone readings, missing rows, negative jumps, reset/rollover candidates and precision/rounding. Confirm conversion and aggregate rules by hand-calculated fixtures.
4. **Overlap/review:** exact duplicate, conflicting same interval, partial overlap, user exclusion, alternate interpretations and event annotation. Confirm original records never mutate and each scenario/export reports which rows it used.
5. **Aggregation and comparison:** missing interval leaves a visible gap and reduces coverage; totals are reproducible from included raw rows; period comparisons with unequal coverage expose that difference; DST profile bins distinguish repeated instants; no default imputation or extrapolation.
6. **Export/privacy:** exported totals and metadata match the selected scenario; default excludes account identifiers and local file paths; optional review package includes selected provenance; output can be recomputed from the manifest and source identity.

These are proposals, not executed checks. This stage inspected published source/documentation and captured it; it did not run pandas tests, import sample meter data, build a dashboard, or establish performance on a normal laptop.

## Decision-by-decision comparison against the frozen plan

| Plan item | Disposition | Evidence and applicability |
|---|---|---|
| P1 ingestion | Retain CSV and preview; strengthen to raw-field preservation, explicit value semantics, timestamp convention and source-position mapping. | The duplicate-name loss report and release fix are directly applicable when headers or mappings collide [S4, S6, S7]. |
| P2 storage | Retain local provenance and review; add immutable raw rows, interpretation revisions and explicit overlap classes. | Emoncms distinguishes fixed/variable intervals and null gaps, but its feed schema does not decide the local import store [S2]. |
| P3 dashboard | Retain requested views and visible missingness; add coverage, type-specific aggregation and DST-aware profile rules. | Emoncms documents multi-feed null alignment and statistics [S1]; sparse cumulative-feed daily gaps are a useful failure fixture, not evidence of a particular fix [S3]. |
| P4 alternatives | Retain competing interpretations, events and descriptive-only language; clarify events never change meter values. | This is a user constraint and needs no component-driven change. |
| P5 components/privacy | Change “undecided” to a conditional pandas v3.0.6 candidate behind an adapter if Python is selected; retain CSV standard library as a lean alternative; keep chart and store selection open behind explicit acceptance criteria. Retain local processing and default identifier omission. | Pinned code and release history show why raw labels and explicit mappings matter [S4, S6-S10]. No chart/storage code comparison was performed, so those choices remain open. |
| P6 export/checks | Retain provenance and listed check themes; expand them to cover parser/header failures, ambiguous/nonexistent local times, coverage, overlaps, review scenarios and export privacy. | These checks are proposed from the brief, the observed parser history and zoneinfo’s documented fold/time-zone-data behavior [S4-S12]. |

## Obligation disposition

- **O1:** Open discovery produced Emoncms comparison/gap mechanisms, an energy-specific missing-day report, and a pandas parser defect relevant to inconsistent exports; useful, optional and negative findings are retained above.
- **O2:** Actual pandas code is pinned to release tags v0.19.0 and v3.0.6 with implementation symbols, caller and regression-test context mapped in [source-map.json](source-map.json).
- **O3:** GH-7160 is tied to the v0.19.0 fix by its code comment and release note with a before/after reproducer. Current test coverage is related but not verified as the exact original test. No merged-but-unreleased claim is made. GH-66259 is retained as a release-applicability caution.
- **O4:** P1-P6 are each compared in the decision table and specified in the replacement plan.
- **O5:** **Pending.** No flash-family critic has reported. Preserve their eventual substantive criticism, response, disagreement and unresolved objections in the finalizer’s artifact; none is invented here.
- **O6:** This file is the complete proposed replacement plan, with rationale, supported alternatives, unresolved choices, already-covered/rejected dispositions, proposed checks and uncertainty.

## Remaining uncertainty and choices

The brief does not specify the building’s country/time zone, export vendors or formats, exact meters/units, whether intervals are labeled by start or end, or which meters provide power versus energy/register readings. It also does not specify app language, portability expectations, user count, target laptop, export format requirements or acceptable dependency size. Those choices determine parser/runtime, timezone data packaging, store and chart library. They must be resolved with representative public/sample fixtures in the later sandbox; none can be inferred from the plan. No actual interval exports were supplied or inspected.
