# I-METHOD-01 — Revised sandbox plan and proposed change

**Stage:** reviser-v1, complete proposed plan.  
**Scope inherited from the researcher draft:** one watershed and one season; six rain gauges, four stream-level stations, downloaded volunteer files, and an import-to-review-to-export workflow.  
**Product boundary:** a local workbench for comparing observations and preparing a community review package. It is not an emergency-warning service, flood forecast, engineering tool, official approval system, or streamflow-conversion system.

## Decision summary

Retain the local-first, provenance-aware workflow and the distinction between supplied measurements and later interpretation. Make the time and interval meaning explicit, preserve original input bytes, and ensure automated checks prompt human review rather than rewrite readings. Keep SQLite, field-mapped CSV, and plotting as candidates subject to the conditions below; none is claimed as a validated final component.

The researcher draft is strong on safety and P1–P6 detail. The critique’s material changes are accepted: narrow the RainfallQC claim to one release’s implementation and regression; do not recommend that statistical method for this watershed; narrow initial review rules until real station metadata and policy exist; separate private project provenance from shareable identity; and define recovery across file storage and the database. The requested direct product and plotting comparisons remain unresolved because the exact supplied evidence contains no end-user local-workbench or plot-component comparison. This bounded reviser does not add discovery or treat absence in the supplied sources as proof that no alternatives exist.

No application, test, benchmark, import, or acceptance check was run. All validation below is proposed.

## O1 — Discovery from the user need and evidence boundary

The supplied evidence supports several useful design patterns:

- CoCoRaHS observer material distinguishes observation time from entry time, describes accumulation since the prior observation, correction/follow-up, and the possibility that an unusual local high value is valid [S01, S02]. These are analogies for questions to ask about each actual volunteer file, not assumptions that every watershed file follows CoCoRaHS conventions.
- The CoCoRaHS QA/QC document describes human follow-up and common reporting errors. Its sequenced automated checks and flags on pages describing NCEI/GHCN-D are specifically NCEI/GHCN-D procedures, not CoCoRaHS product behavior or a policy for this app [S02].
- USGS working/analyzed/approved and audit states are a professional agency workflow involving separate roles. They are a process analogy only; this one-user tool must not imply USGS approval or equivalent assurance [S03].
- SensorThings and STAplus supply observation, time, sensor, party, ownership, group, and relation vocabulary. Their standards do not require this app to implement an API, network service, authentication, or multi-user workflow [S04, S05].
- RainfallQC supplies a concrete rainfall-check implementation and issue/fix/release history, but does not establish that its statistical method suits this watershed [S06–S10].
- SQLite documents atomicity for a database transaction; the cited guarantee alone says nothing about a separately stored original file [S11]. The Rust csv 1.4.0 reader offers configurable syntax parsing and record/error information; it does not assign hydrologic meaning to columns, time, missing markers, or units [S12, C08].

**Critique disposition — accept the O1 gap and leave it open.** None of those supplied sources is a directly comparable end-user local workbench, and none compares concrete plotting components. The supplied source set also does not compare SQLite with other local stores by this workload. A market/product search or new plot/store research is outside this reviser’s exact-input boundary. Therefore the final plan does not claim that alternatives do not exist. The local workbench remains the product proposal; store and plotting choices remain candidates. A future product decision may authorize a bounded comparison or decide that a prototype is the next evidence needed.

## O2 — Pinned component behavior

The captured RainfallQC sources identify release v1.0.2 at commit 150717eba097ccd771920181b13ce957950a8a59 and show QC3/QC4 mapped to check_temporal_bias and called by the framework runner [S06, C01, C04–C06]. At that pinned code, the check groups readings by weekday or hour, computes the overall mean from the same input values, skips groups with fewer than two readings, applies a two-sided one-sample t-test to each remaining group against that overall mean, and returns a positive result if any group p-value is below the unadjusted default threshold 0.01. Its decorator has behavior-bearing require_non_negative=True; the captured decorator rejects a negative target column before the check runs [C01, C02]. The code documents that the check performs less well with less data [C01].

The PR and release history are real, not merely proposed: issue #120 describes the aggregate-of-group-means false negative; PR #123 replaces that calculation with per-group tests and changes the existing daily GSDR fixture expectation from 0 to 1; the PR was merged and v1.0.2 release evidence identifies the fix [C03–C06; S07–S09]. The regression evidence is that fixture change, not a dedicated synthetic reproduction of the issue’s Monday-only example and not a test on this app’s data [C05, C06]. The sources establish no calibration, power, false-positive rate, or suitability for sparse groups, zero-heavy or skewed rainfall, serial dependence, missingness, or a single season.

**Critique disposition — accept the lineage, correct its applicability, and defer adoption.** RainfallQC is an optional implementation reference, not an MVP dependency or recommended MVP rule. Do not silently import its thresholds or let it change samples. If a future product decision adopts statistical QC, first define an app-specific decision rule and propose false-positive/false-negative, group-size, missingness, repeated-testing, effect-size, and threshold validation. No such tests are claimed as run. GPLv3 and Python/Polars metadata make copying, linking, or redistributing its implementation a separate license and component decision [S06, S09].

**CSV critique disposition — accept.** Treat csv as a syntax-reader candidate only. Its permissive parse-first behavior means the application must define structural and semantic validation itself [C08, S12]. Actual volunteer files were not supplied in this bounded input slice, so delimiters, encodings, quoting, decimal/date conventions, missing/trace values, and supported layouts remain unknown and must be decided from real files.

## O3 — Issue, fix, regression, and release

Retain the verified upstream history with its limitation. Issue #120 describes how comparing aggregated group means could miss a weekday-only pattern. PR #123 changes the implementation to compare each group with the overall mean and changes the existing GSDR weekday fixture’s expected result from 0 to 1. Release v1.0.2 names the temporal-bias fix, and the pinned release code contains the per-group implementation [C03–C06, S06–S09]. This is positive evidence that the reported upstream fix shipped in that version. It does not show that the statistical assumptions, threshold, or output are correct for this watershed, or that the app’s data have been validated.

## O4 — Complete comparison with the frozen P1–P6 plan

| Plan | Existing choice retained or already covered | Revised disposition |
|---|---|---|
| **P1 — Inputs and identity** | Import preview, user mappings, station identity, units/time convention, immutable original files, and batch provenance remain. | Add observation versus entry/import time, instant versus interval meaning, interval boundaries where known, explicit unknown/ambiguous time handling, and source-row linkage. A parser record position is not by itself a durable source-row identity. Do not store duplicate cell text by default when the byte-identical source file already preserves it; add it only if a concrete retrieval need justifies the storage cost. |
| **P2 — Data model** | Keep raw samples distinct from import choices, annotations, station/sensor history, and overlap review. Keep original bytes separate from parsed samples. | Retain the decisions that matter, their author where known, time, reason, affected samples/ranges, and revision relationship. An append-only event log is not established as a requirement. Keep detailed volunteer/source identity in the local project, but make shareable identity a separate choice. |
| **P3 — Review** | Keep manual review, explanations, non-correction, insufficient-data outcomes, and the prohibition on stage-to-flow inference. | Prioritize ingestion integrity, visible time/gap semantics, annotation, and export. Defer range/rate, stuck-value, temporal-bias, and neighbor checks until instrument metadata, cadence, overlap, thresholds, and network policy are supplied. They must be explicitly unavailable when prerequisites are missing, never presented as a pass. |
| **P4 — Comparisons** | Keep nearby/reference series, visible original values, and summaries linked to selected records/ranges. | Distinguish rainfall accumulation windows from stage event times; show units and stage datum/reference. Any binning must name its rule, coverage requirement, and provenance. No silent resampling, interpolation, gap filling, correlation, causality, flow, or risk inference. OGC is vocabulary guidance, not a schema or API mandate. |
| **P5 — Components and operation** | Keep single-user, local-first, offline operation. Keep SQLite, mapped CSV, and plotting as candidates. | SQLite is plausible, not selected by workload evidence. Its transaction guarantee covers database changes; treating it as protection for external file bytes would be an unsupported inference. Define staged-file/database commit and recovery behavior, then test interruption, rollback, orphan reporting or cleanup, and recovery. Keep csv as a parser candidate until actual files define requirements. Compare plot candidates in a future authorized prototype; measure the stated two-million-record target on a specified laptop before making a capacity claim. |
| **P6 — Output and acceptance** | Keep a self-contained review package, uncertainty, selected window, provenance, annotations, and reproducible content. | Separate private project lineage from shareable contributor identity. Make original-file inclusion and source identity/hash disclosure an explicit export choice. Reopening the same project may retain its local sample IDs; another project cannot be promised those IDs unless a stable cross-project identity is defined. Keep HTML plus CSV/JSON as a proposed option, not a settled format; whether PDF is needed remains a user choice. |

## O5 — Criticism-by-criticism disposition

1. **Missing comparable product, plotting, and store evidence — leave unresolved with a bounded reason.** Accept that the research gap is material. The exact supplied sources give no such comparison; no broad search or new discovery is allowed here. Do not claim no alternative exists. Keep the local-workbench proposal, SQLite candidate, and plot choice open pending a product decision or authorized prototype.
2. **Missing RainfallQC decorator — accept and correct.** The critic’s exact pinned capture shows the non-negative-value guard requested by the decorator. Include it in O2 and the evidence map [C02].
3. **CSV parsing described too broadly — accept and narrow.** CSV parsing is syntax handling, not scientific or application validation. Supported file layouts and value conventions remain unknown without real files [C08, S12].
4. **Upstream regression treated too strongly — accept and narrow.** Preserve issue-to-PR-to-release history and the GSDR expectation change. State that this is one fixture regression, not a synthetic reproduction or app-specific statistical validation. Do not recommend the method for the MVP [C03–C06].
5. **P1 concerns — accept.** Only record timezone/zone and daylight-saving fold resolution when supplied or explicitly chosen; never invent UTC. Keep source file and row position, but define any stable row identity separately. Keep exact original bytes; omit extra cell copies unless a retrieval need is established.
6. **P2 event-log and privacy concerns — accept.** Preserve review decisions and their revision context without requiring a specific append-only event-log architecture. Keep internal provenance and shareable identity separate. A filename, volunteer identifier, or file hash may expose or link a contributor’s file, so the export must let the user choose disclosure and original-file inclusion.
7. **P3 scope — accept.** Start with ingest integrity, visible gaps/time meaning, annotations, and package export. All statistical and sensor-context checks depend on actual inputs and user-selected policy. Defer them or show unavailable until prerequisites are satisfied.
8. **P4 timing and standardization — accept.** Keep interval-aware comparisons, raw values, units, datum/reference, explicit bins and coverage. Do not interpolate or infer causation/risk. Use OGC only as vocabulary.
9. **P5 atomicity and performance — accept and correct.** A database transaction does not establish atomicity for separately stored files. Require a recoverable staged-file/database protocol and interruption/recovery validation before claiming reliable import. Benchmark only on an identified laptop and representative fixture. Keep storage, parser, and plotting decisions conditional.
10. **P6 privacy and package identity — accept.** Distinguish project reopen from importing elsewhere, and test them separately. Define what IDs can survive each operation. Make identity redaction and original-file inclusion explicit. Keep package formats unresolved pending community needs.
11. **Source qualifications — accept.** CoCoRaHS examples are analogies, not universal volunteer-file semantics; the cited QA/QC pages distinguish manual CoCoRaHS follow-up from NCEI/GHCN-D algorithms. USGS approval policy is not adopted.
12. **Validation status — accept.** Every check below is proposed. No application, source package, or benchmark has been run in this stage. O5 is complete as a disposition; unresolved choices remain explicit rather than silently filled.

## O6 — Complete proposed change

### P0 — Product and use boundary

Propose a single-user, local-first workbench for one watershed and one season. It helps compare rainfall and stage observations, identify records that merit attention, preserve review decisions, and prepare a community summary. Preserve what was measured separately from later interpretation. The product does not issue warnings or forecasts, estimate discharge from stage, act as engineering guidance, or claim official scientific approval. The watershed network remains responsible for publication and how uncertainty is described.

### P1 — Inputs, station identity, and time meaning

Import downloaded CSVs through a preview. Let the user map station, source, timestamp field and convention, measurement field, units, and required date or interval fields. Support the scoped six gauges and four stage stations. Preserve exact source-file bytes, filename, import time, hash, batch ID, selected mapping, and assumptions in the local project.

For each parsed record, retain batch linkage, parser record position, original field text when needed for audit/retrieval, parsed value, and normalized value/unit as separate concepts. Do not silently convert parse failures or missing intervals to zero. A repeat file becomes a duplicate candidate for comparison; it must not silently overwrite or deduplicate existing records.

Represent whether a value is an instant, interval total, or another declared summary. Store interval start/end when known. Distinguish observation/measurement time from file entry or receipt time. For rainfall, do not assume a reported date is the day on which rainfall occurred. Store the source timezone/offset or an explicit unknown/local state, and the convention used to resolve dates and daylight-saving transitions. Do not manufacture UTC or resolve an ambiguous fold without an explicit source convention or user choice.

Keep station identity separate from sensor/deployment identity. Record station location and user-entered metadata, with effective dates for sensor type/replacement, method, expected cadence, unit, and stage datum/reference when known. A sensor change starts a new effective interval; it does not relabel old samples. Hold unresolved station/time mappings in preview until the user makes an explicit choice.

### P2 — Local data and interpretation model

Use a local relational data model for stations, deployment intervals, import batches, samples, mapping decisions, annotations, rule runs, flags, and export selections. Keep original file bytes available independently of parsed rows.

A sample represents the value and time meaning in a particular input row. A unit conversion is a derived value linked to the sample and records source/target units and conversion rule/version. A correction, note, retain/exclude decision, or alternative interpretation is a separate record linked to the original sample or selected range. Never rewrite source rows to make a later interpretation appear original.

Retain station/sensor metadata versions. When imports overlap or a changed station definition affects earlier data, show the conflict and let the reviewer record which interpretation a comparison uses. Preserve both batches and prior decisions. For each decision, record author label if known, time, reason, affected records, and how a later revision relates to it. Do not require a multi-user identity service or prescribe an append-only event-log architecture in this MVP.

Keep contributor/source identity inside local provenance as needed for review. Before sharing, expose a separate choice for source names, volunteer identifiers, file hashes, and original files. Do not require a share manifest to expose identity merely because the local project retains it.

### P3 — Review and quality checks

Show rainfall and stage over a user-selected window with visible gaps, duplicate/out-of-order records, interval overlaps, units, source details, and annotations. Let the reviewer select a point or interval, enter a reason, and record a disposition. The proposed dispositions are unreviewed, flagged for review, reviewed and retained as supplied, reviewed with a separate interpretation, and excluded from this summary with a reason. A disposition never deletes the measurement.

Initial MVP review work prioritizes import integrity, explicit time/unit ambiguity, visible gaps, duplicate/conflict comparison, annotation, and clear export lineage. Any check that is available must show its name/version, parameters and units, affected source record/range, and reason. “Flagged” means worth human review, not wrong.

Defer configured instrument-range/rate checks, repeated/stuck-value checks, temporal-bias checks, extremes, and gauge-neighbor comparisons until their input metadata, cadence, overlap, thresholds, and network policy are known. Do not enable RainfallQC rules by default. If a check lacks its prerequisites, show “not enough comparable data” or “unavailable” with the missing prerequisite, not a pass. Display rainfall and stage together for timing review without inferring cause or flow. No automated correction is in scope.

### P4 — Station comparisons and derived summaries

Let the user overlay or compare selected nearby stations and a chosen reference series. Show relevant gauge and stage series for the chosen window. Keep original input values/units visible beside normalized or interpreted values. Show rain totals with their accumulation window and stage with its declared event-time basis and datum/reference.

If a common time bin is useful, require a user-selected bin and explicit coverage rule and include both in output provenance. Never silently resample, interpolate, fill gaps, or present a daily total and instantaneous stage as if they had the same time meaning.

Link each derived summary to selected sample IDs/source rows, station metadata version, time range, unit/time interpretation, and aggregation rule. A chart supports visual timing review only; cross-series correlation, causal claims, flood-risk output, and conversion from stage to flow are outside the MVP. SensorThings’ time and observation relationships may inform clear semantics but do not require implementing its API [S04].

### P5 — Components, storage, and operation

Keep local-first/offline use without a cloud account. SQLite is the preferred embedded-store candidate, not a final selection: its all-or-nothing guarantee applies to one database transaction [S11, C07]. Because original bytes are separate files, propose a staged-file/database commit and recovery design that can detect interrupted imports, avoid exposing half a batch, and report or clean orphaned staged files. The exact ordering and recovery behavior remain a design decision until tested. Do not claim that SQLite alone makes file-plus-database import atomic.

A Rust csv 1.4.0 reader is a candidate syntax parser for heterogeneous CSV, configured from actual files. It may expose records, positions, and parsing errors; the app owns field mapping, timestamp and unit interpretation, missing/trace handling, and row validation [S12, C08]. Do not add a specialized time-series reader unless real supported input formats require it.

Keep plotting as an open component decision. A future prototype should compare concrete candidates against interval rainfall, point stage, gaps, overlays, flags, annotation visibility, accessibility, and two-million-record responsiveness. Do not claim a component or performance result before that prototype. Define the “normal laptop” and representative fixture before measuring import, query, render, and export.

RainfallQC v1.0.2 remains an optional method-shape and regression-discipline reference, not an MVP runtime dependency. Any copied, linked, or redistributed implementation requires a separate license decision. Independently specified Rust checks still need their own provenance, credit, and validation. SensorThings/STAplus remain optional future exchange vocabulary; network API, HTTP/MQTT, authentication, and multi-user deployment are outside this local MVP.

### P6 — Review package and acceptance

Propose a self-contained package for a selected storm/window. HTML summary plus CSV samples and a JSON provenance/decision manifest are candidate formats, not settled choices; PDF need is unresolved. The summary should state stations, window, time interpretation, units, conversions/aggregation, gaps, flags and dispositions, uncertainty, and observation limitations.

Link displayed/exported results to source batch and row/range. Keep the full source relationship in the local project. Before export, require a user choice about including original files and disclosing filenames, contributor identifiers, and hashes; the choice and redactions should be visible in the package. Do not assume names/hashes are safe to share.

Preserve raw measurements separately from interpretations. Avoid approved, forecast, alert, or flow language. Proposed acceptance distinguishes reopening the original project, which may retain local IDs, from importing a package into another project. Do not promise matching local IDs across projects unless a stable shareable identity is deliberately defined. Verify package identity/linkage, uncertainty, and privacy behavior before treating an export as ready to share.

## Alternatives, opportunities, and explicit non-decisions

- **SQLite:** preferred local relational-store candidate for linked records and transaction boundaries; not chosen by benchmark, recovery test, or store comparison. Validate workload and recovery first [S11, C07].
- **Field-mapped CSV:** preferred parser approach for the scoped volunteer-file workflow; actual file layouts and semantic conventions are unknown. A specialist reader remains an option if real inputs prove a standard format [S12, C08].
- **RainfallQC:** optional reference for check shapes and upstream regression history; not an MVP runtime or default rule. Statistical suitability and GPLv3 compatibility are unresolved [S06–S10].
- **SensorThings/STAplus:** optional future vocabulary for observation, sensor, ownership, licensing, grouping, and relationships; API and multi-user service are rejected for this offline scope [S04, S05].
- **USGS workflow states:** process analogy for staged review only; a second-hydrographer approval model and “USGS approved” label are rejected [S03].
- **Plotting component:** open; no candidate comparison is present in the admitted sources. Prototype before selection or performance promise.
- **Direct product comparison:** open; no comparable local workbench was identified in the admitted sources. This is not a claim that none exists.
- **Rejected product behaviors:** silent overwrite/deduplication; autonomous correction; interpreting missing as zero; treating an outlier as proof of error; stage-to-flow conversion; forecasts/warning thresholds; mandatory network/cloud service; and climatological claims from a single season.

## Product decisions still needed

1. Which CSV layouts, timestamp granularities, missing/trace markers, decimal conventions, and encodings occur in the actual season files?
2. What timezone/offset and daylight-saving convention applies to each station? Which sources are interval totals and which are instants?
3. What station coordinates, sensor validity dates, rainfall resolution, stage units/datum, ranges, and expected cadence are available?
4. Which checks and thresholds should be enabled, and what overlap/sample prerequisites permit a comparison flag?
5. Which local provenance fields may be shared? Should source filenames, volunteer identifiers, hashes, and original files be included for each export?
6. Is HTML plus CSV/JSON adequate, or does the community need PDF?
7. What laptop and response-time target define “normal” for a two-million-record benchmark?
8. Does the community want a second-person review workflow in a later product? It is not assumed here.
9. Does the team want a bounded product/store search or an authorized plotting prototype to close O1?

## Proposed validation — not executed

1. With real sample files, map every column, time convention, unit/datum, missing/trace marker, encoding, duplicate, and overlap. Retain byte-identical originals and traceable parsed rows.
2. Exercise ambiguous local times, daylight-saving transitions, interval rainfall with point-stage observations, no-data versus zero, and user-selected bin/coverage rules.
3. Repeat an import and import overlapping exports from different volunteers. Confirm comparison, no silent replacement, and retained decisions.
4. Interrupt import at each boundary between staged source-file storage and SQLite commit. Verify no half batch is visible and recovery removes or reports orphaned files.
5. Test source identity redaction, original-file inclusion, and manifest contents before sharing. Verify project reopen separately from cross-project package import and check which IDs remain stable.
6. Define a representative fixture and named laptop. Measure import, query, rendering, and export at two million records; report measured values only after execution.
7. Review the app and report for false scientific assurance: no unqualified approval, forecast, alert, engineering, flow, or unsupported risk language.
8. If statistical QC is proposed later, test synthetic false-negative reproduction, no-bias behavior, group-size and missingness boundaries, repeated testing, effect sizes, and the justification for the decision rule/threshold. Also validate on representative data. Expose each result only as a review flag with data/config/version lineage. None of these tests has been run.

## Activity, source operations, and accounting

- First useful saved finding: 2026-10-07 19:31:15 UTC — the mapped evidence supports a bounded plan revision but does not contain a direct local-workbench or plotting-component comparison; this is an unresolved O1 choice, not evidence that alternatives do not exist.
- Complete artifact saved: recorded in the reviser source map alongside the output hash.
- Source operations: read only the exact input map, the four mapped predecessor files, and the captured source bytes named in the two predecessor source maps. Copied those captured bytes byte-for-byte into this stage’s sources directory and computed host SHA-256/byte counts. Inspected targeted RainfallQC code, decorator, framework mapping, runner, regression test and issue/PR/release captures; relevant SQLite, csv, CoCoRaHS, and QA/QC captures. No new web search or source fetch, repository scan, downloaded-code execution, application build, import, benchmark, test, or acceptance run.
- Distinct model token counters and billing are unknown/null. Aggregate native Goal tokens/time are separate and are reported by the actual native Goal responses in native-receipts.jsonl. No billing estimate is made.

