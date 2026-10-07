# I-METHOD-01 — Proposed revised sandbox plan
## Researcher draft for independent criticism

**Status:** Complete researcher draft; O5 is pending the fresh critic.  
**Scope:** P1–P6 for one watershed and one season: six rain gauges, four stream-level stations, downloaded volunteer files, and the ingestion-to-review-to-export workflow.  
**Product boundary:** A local workbench for comparing storm observations and preparing a community review package. It is not an emergency-warning service, flood forecast, engineering tool, or streamflow-conversion system.

## Recommendation

Keep the plan’s local, provenance-aware workflow and its distinction between measurements and later interpretation. Make the time meaning of each observation explicit, preserve original file bytes and row-level lineage, and make automated checks produce review flags only. A volunteer’s daily rain total may cover the interval since the previous observation, and the observation time may differ from when a file was entered or downloaded. A sharp local rainfall value may be correct. These facts make time alignment and reversible review decisions central to this MVP [S01, S02].

Use SQLite as the preferred embedded-store candidate and a field-mapped CSV parser rather than assuming one scientific reader will understand every volunteer file. Prototype the plot choice and measure the two-million-record target before promising performance. Use RainfallQC’s rainfall checks as an evidence source for rule design, not as a hidden authority that changes readings. A real defect in its time-bias check was caught, fixed, regression-tested, and included in v1.0.2; the fix also documents a small-sample limitation [S06–S10].

## Revised plan

### P0 — Product and use boundary

The app is a single-user, local-first workbench for one watershed and one season. It helps compare rainfall and stream-level observations, find records that deserve human attention, preserve review decisions, and prepare a community summary. It must preserve what was measured separately from what was interpreted later.

The app will not issue emergency warnings, forecast flooding, estimate discharge from stage, or label output as an official scientific approval. A review package may be used by the watershed network to prepare a summary; the network decides what it publishes and how it describes uncertainty.

### P1 — Inputs, station identity, and time meaning

Import downloaded CSV files through a preview that lets the user assign a station, source volunteer/file, timestamp field and convention, measurement field, units, and any required date or interval fields. Support the stated six rain gauges and four stream-level stations. Keep the exact source file bytes, file name, import time, content hash, and a batch identifier in the local project. Record the selected mapping and any user assumptions with that batch.

For every parsed record, keep its source batch and CSV record position, original cell text, parsed value, and any normalized value/unit as separate fields. Never let a parse failure silently become zero or a missing interval silently become a zero reading. Re-importing the same file should present a duplicate candidate for the user to compare or retain as a separate batch; it should not silently replace or deduplicate existing rows.

Make the temporal meaning explicit. Store whether a value is an instant, an interval total, or another declared summary; store interval start/end when known. Distinguish measurement/observation time from file receipt or entry time. For rainfall totals, do not assume the report date is the calendar day on which the rain fell: CoCoRaHS describes daily totals as the amount accumulated since the previous observation and asks observers to enter their actual observation time [S01]. Record timezone/offset or explicitly mark it unknown/local; do not invent a UTC interpretation for an ambiguous timestamp. Keep the source convention used to resolve dates and daylight-saving transitions.

Station identity is independent of sensor identity. Keep station location and user-entered metadata plus effective dates for sensor type/replacement, measurement method, expected sampling interval, and relevant unit/datum. A sensor change creates a new deployment interval; it does not retroactively relabel earlier samples. If a file does not contain enough information to resolve a station or time interpretation, hold the records in preview until the user chooses an explicit assumption.

### P2 — Local data and interpretation model

Use a local relational store for station records, deployments, import batches, row-level samples, mapping decisions, annotations, rule runs, flags, and export selections. Keep source file bytes separate from parsed records so the exact input can be retrieved even after later interpretation changes.

Represent each imported sample as the value and time meaning found in a particular source row. Represent unit conversions as derived values with the source unit, target unit, conversion rule/version, and link to the input sample. Represent a correction, reviewer note, or inclusion/exclusion decision as a new annotation or interpretation linked to the original sample or selected time range; never edit the source row to make it look as though the later interpretation was the original measurement.

A station catalogue must retain sensor replacement dates and user-entered metadata. When imports overlap or a changed station definition affects old samples, show the conflict and let the user record the interpretation to use for a comparison; keep both source batches and the prior decision. Each decision should carry its author label (where known), timestamp, reason, and the records it concerns. Do not require a multi-user identity service for this one-user offline scope.

This operationalizes matters already present in P1–P2: immutable originals and provenance (P1); raw samples separated from import decisions and analyst annotations, station/sensor history, and overlap review (P2). CoCoRaHS’ editable reports and follow-up process show the need to let humans correct or explain reports [S01, S02]; OGC Observation and STAplus models offer useful vocabulary for observations, event time, sensors, contributors, and relations [S04, S05]. Neither source requires this local app to overwrite prior inputs or run a network service.

### P3 — Review and quality checks

Show aligned rainfall and stage views over a user-selected storm window, with visible gaps, duplicate/out-of-order records, interval overlaps, source and unit details, and annotations. Let a reviewer select a suspicious point or interval, enter a reason, and record a disposition. Suggested dispositions are “unreviewed,” “flagged for review,” “reviewed—retain as supplied,” “reviewed with a separate interpretation,” and “excluded from this summary with reason.” A disposition never deletes the measurement.

Initial checks should be small, configurable, and explanatory:

- Import integrity: malformed rows, ambiguous timestamps/units, duplicate timestamps, conflicting rows, and gaps relative to a declared expected interval.
- Sensor-context checks: values outside user-entered instrument range or sensor-deployment dates, and stage changes that exceed an explicitly configured rate/range for that deployment.
- Rainfall review checks: repeated/stuck values, configured extremes, and comparison with nearby gauges only when time windows, units, and overlap make the comparison meaningful.
- Cross-series display: show rainfall and stage together for visual timing review, without inferring causal relation or flow.

Each flag must show the check name/version, parameters and units, source record/range, and reason. “Flagged” means “worth review,” not “wrong.” CoCoRaHS describes common reporting errors (decimal/typo, wrong observation date, multi-day accumulation, or snowfall in the precipitation field) and notes that a spatially unusual high rainfall value can still be a real isolated storm [S01, S02]. Its documented QA examples sequence checks and attach flags; adopt the review-friendly pattern, not an automatic correction policy.

RainfallQC is a relevant optional source of rainfall-check ideas: it exposes modular, configurable single-gauge and neighborhood checks and requires location, measurement resolution, or overlap metadata for some methods [S06, S09]. Do not turn all of its checks on by default. The project has only one season and six gauges; if overlap or sample count is insufficient, show “not enough comparable data” rather than a pass. Any rule-derived flag remains separate from the sample. Thresholds must be selected by the network for its instruments and units, not imported as universal hydrologic truths.

P3 already proposes configurable thresholds and manual review, and expressly rules out autonomous correction and conversion from stage to flow. Retain those constraints. Clarify flags as prompts rather than truth, include reasons/parameters/lineage, and mark checks unavailable when data are insufficient. USGS working/analyzed/approved states and second-person approval are useful workflow evidence for separating analysis from sign-off [S03], but they are professional agency policy. This single-user volunteer tool should not use “USGS approved” or imply the same assurance.

### P4 — Station comparisons and derived summaries

Let the user overlay or compare selected nearby stations and a chosen reference series. Show six rain-gauge series and four stage series as appropriate to the selected window. Keep original input units/values visible beside any normalized or interpreted values. Rain totals should appear with their accumulation window; stage readings should appear with their declared time basis. When a common time bin is useful, let the user select the bin and coverage rule and show them in the output; do not silently resample, interpolate, fill gaps, or pair daily totals with instant stage readings as though both were instantaneous.

Every derived summary must link to the exact selected sample IDs/source rows, chosen station metadata version, time range, unit/time interpretation, and any aggregation rule. A chart may support visual timing review, but no cross-series correlation, causal claim, or flood-risk output is required for the MVP. OGC’s Observation model distinguishes phenomenon time and result time and relates an observation to observed property, sensor/procedure, and feature of interest [S04]; use that as a design check for clear semantics, not as a requirement to implement an API.

P4 already requires nearby stations, a user-selected reference series, visible raw source/interpretations, and summaries linked to sample ranges. Keep it and add explicit interval/coverage treatment so the comparison does not imply more temporal precision than the input supports.

### P5 — Components, storage, and operation

Keep the app local-first and usable offline without a cloud account. Prefer an embedded SQLite project store for its transactional batch boundary: parse into preview/staging, then commit one confirmed import as a transaction so an interrupted write does not leave half a batch. Keep the original files in the local project. SQLite documents all-or-nothing transaction behavior under process/OS failure [S11]; that supports the design but does not prove application-level durability or correct backup behavior.

A Rust CSV parser is a candidate for heterogeneous CSV imports. The pinned csv 1.4.0 documentation describes ReaderBuilder configuration, records, byte records, parse errors, and record positions [S12]. Treat it as a syntax reader, not a hydrologic/time interpretation engine: user-selected mappings and the data model above own that meaning. Do not add a specialized time-series reader until real supported file formats require one.

Keep plotting as a component decision gated by a prototype: it must display interval rainfall and point stage data with gaps, flags, annotations, and selected windows without making the user infer meaning from a smoothed line. Measure memory and responsiveness with a representative two-million-record fixture on the agreed “normal laptop.” No performance result is claimed here.

RainfallQC v1.0.2 is implemented in Python on Polars and declares GPLv3 [S06, S09]. Do not make it a runtime dependency in this MVP. Use it as a reference for review-rule shapes and regression discipline; decide license compatibility before copying, linking, or redistributing its code. A Rust implementation may use independently specified simple checks, but provenance and credit for adopted methods remain a product/legal review item. STAplus 1.0 is an optional future exchange model for multi-owner citizen science data, grouping and relations [S05]. Its HTTP/MQTT, authentication, and multi-user deployment are outside this local MVP.

### P6 — Review package and acceptance

Export a self-contained review package for the selected storm/window. Recommended contents are a plain-language HTML summary, selected samples in CSV, a provenance/decision manifest in JSON, and a record of the uncertainty note and export time. The summary must state the chosen stations, time window and time interpretation, units and any conversion/aggregation, known data gaps, flags and their review dispositions, and the limitations of the observations. Link each displayed or exported result to source batch/file/hash and row/range. The user should choose whether original imported files are included in the shareable package; hashes and source names remain in the manifest either way.

Keep the distinction between raw measurements and later interpretations visible in the report. Avoid “approved,” “forecast,” “alert,” or “flow” language unless a future product decision explicitly authorizes a carefully defined use. The output is prepared for a community summary; the user/network remains responsible for any publication decision.

Keep P6’s review-package/provenance/annotation/uncertainty requirements. Expand acceptance so export content is reproducible and the package can be checked against the saved project. No application has been built and no acceptance test has run.

## P1–P6 disposition register

| Frozen plan | Disposition | Exact comparison and evidence |
|---|---|---|
| P1 Inputs and identity | Keep, make time semantics explicit | P1 already has import preview, station identity, timestamp convention/units, immutable originals, and batch provenance. Add observation-vs-entry time, interval/accumulation meaning, exact row references, and explicit unknown-time handling. CoCoRaHS demonstrates why report time and interval end cannot be assumed to be file-entry time or calendar-day rainfall [S01, S02]. |
| P2 Data model | Keep, operationalize lineage | P2 already separates raw samples, import decisions, and annotations and includes station/sensor dates and overlap review. Add source-row IDs, append-only interpretations, explicit decision links, and effective deployment ranges so changed sensor metadata cannot rewrite the past. SensorThings/STAplus supply useful model concepts but do not prove this schema is required [S04, S05]. |
| P3 Review | Keep the explicit safety/product constraints; strengthen review UX | P3 already says threshold rules plus manual review and no autonomous corrections or stage-to-flow conversion. Retain. Clarify flags as prompts rather than truth, include reasons/parameters/lineage, and mark checks unavailable when data are insufficient. CoCoRaHS shows both reporting errors and valid outliers; RainfallQC’s fixed bug shows even a named statistical check can miss a pattern [S01, S02, S06–S09]. |
| P4 Comparisons | Keep; add interval-aware alignment | P4 already asks for nearby/reference series and visible raw/selected interpretations, with summaries linked to ranges. Add explicit accumulation windows, units, overlap, coverage and user-controlled resampling. OGC’s observation-time model supports treating event time as part of the observation rather than an incidental plot setting [S04]. |
| P5 Components and operation | Recommend SQLite and explicit CSV mapping; keep plot selection conditional | P5 already fixes one-user/local/offline/no-cloud operation and names the two-million seasonal-record target; storage/reader/plot are undecided. SQLite transactions are a plausible import boundary [S11]. The csv crate can parse records and expose errors/positions, but it cannot decide observation semantics [S12]. No benchmark establishes the target or a plotting component yet. |
| P6 Output and acceptance | Keep; make package reproducible | P6 already names selected window, provenance, annotations, plain-language uncertainty, repeat imports, discontinuities, metadata changes, and round-trip exports. Preserve all. Add manifest fields for mappings, time/unit assumptions, QC run/version, decisions, and export time. The source evidence supports recording provenance and interpretation, not any particular file format [S01–S05]. |

No in-scope frozen decision is removed. The main changes are operational details that make the existing safeguards testable.

## Alternatives, opportunities, and rejected leads

- **SQLite project store — preferred candidate.** Relational links fit station history, imports, samples, annotations, rule runs, and export selections; transaction boundaries fit confirmed batch ingestion [S11]. Validate the two-million-record workload before finalizing.
- **Mapped CSV reader — preferred candidate for the known input scope.** User-specific mapping handles volunteer column differences. A specialist reader is an option only if the actual source files prove a standard vendor/export format.
- **RainfallQC — reference/optional future rule pack, not the MVP runtime.** The package has configurable rainfall checks and neighbor comparisons, but its checks can depend on resolution, location, overlap, and sample count [S06, S09]. Its Python/Polars and GPLv3 constraints also make direct embedding a distinct product decision [S06].
- **SensorThings/STAplus — optional future exchange vocabulary.** The standards model observations and sensor metadata; STAplus adds ownership, licensing, groups, and relations for citizen-science contributions [S04, S05]. Implementing its network service, authentication, or MQTT is rejected for this offline one-user scope.
- **USGS workflow states — process reference only.** Distinguishing working, analyzed, approved, and audited records helps explain staged review, but a two-person USGS approval model is not adopted for a single-user volunteer tool [S03].
- **Rejected for this MVP:** silent overwrite or deduplication; auto-correction; interpreting a missing reading as zero; using a rainfall outlier as proof of error; stage-to-flow conversion; forecasts or warning thresholds; mandatory network/cloud service; climatological claims from a single season. These exceed the user boundary or erase uncertainty.

## Product choices still needed

1. Which volunteer CSV layouts and timestamp granularities are in the season’s files?
2. What timezone/offset and daylight-saving convention applies to each station? Which sources represent daily interval totals versus instantaneous samples?
3. What station coordinates, sensor validity dates, rain-gauge resolutions, stage units/datum, ranges, and expected sampling intervals are available?
4. Which review rules and thresholds should be enabled by default, and what minimum temporal overlap/station count should permit a neighbor flag?
5. Should the export include original files by default, and what attribution/permission note is required for sharing volunteer records?
6. Is HTML plus CSV/JSON sufficient, or is a PDF report required by the community?
7. What laptop/memory and response-time targets define “normal” for the two-million-record benchmark?
8. Should any future review workflow support a second person? This is intentionally not assumed by the single-user MVP.

## Proposed validation (not executed)

These are proposed acceptance checks only. None were run in this research stage.

1. Import one season containing six gauges and four stage stations with different column names, timestamp formats, units, and missing periods. Confirm each batch retains original file bytes/hash, row positions, mappings, and an explicit temporal interpretation.
2. Import the same file twice and two overlapping exports from different volunteers. Confirm the app warns and shows side-by-side records; no batch or reading disappears without a recorded user action.
3. Include a malformed row, ambiguous local timestamp, daylight-saving boundary, duplicate timestamp, out-of-order row, and empty value. Confirm preview explains each; no ambiguity is silently coerced to UTC, zero, or a valid sample.
4. Include daily rain accumulation ending at the reported observation time plus sub-hourly stage. Confirm the chart shows the rain interval and stage event times and does not treat the daily total as an instantaneous value.
5. Change a sensor deployment date/unit/range after importing the season. Confirm old rows remain linked to the original metadata version and a new interpretation is auditable.
6. Include a valid isolated storm spike and a confirmed typo. Confirm both can be flagged; one can be retained and the other annotated with a separate corrected interpretation, while neither raw input changes.
7. Run the same check/version/parameters twice over unchanged samples. Confirm the flags and explanation are reproducible and linked to the exact data/config; change a parameter and confirm the new run is separate.
8. Include insufficient neighbor overlap and sparse time groups. Confirm the result is “not enough comparable data,” never an unqualified pass. If temporal-bias logic is added, include a synthetic bias fixture and tests for its false-negative failure mode. RainfallQC v1.0.2’s existing regression test establishes only its own GSDR fixture behavior; it does not validate this app’s statistics or one-season data [S06–S09].
9. Export a storm window with notes and flags. Confirm the package contains selected source rows, station/sensor versions, import mappings, annotations, rule configuration, uncertainty text, and reproducible IDs. Reopen/reimport the package and verify linkage to the same local samples.
10. Benchmark import, query, plot, and export at two million representative records on the agreed laptop; record wall time and peak memory before claiming capacity. Confirm operation succeeds offline without account sign-in or external service.
11. Review the UI and generated report for prohibited implications: no alert/forecast/engineering language and no stage-to-flow inference.

## Critic handoff and limits

O5 is intentionally **pending**. No criticism has been supplied or fabricated. The fresh critic should independently inspect the pinned code and release applicability, challenge the P1–P6 mapping against the complete user brief, and identify unsupported assumptions or unresolved objections. The final artifact must retain the critic’s actual findings and their dispositions.

Research was limited to the supplied brief, plan, input map and this case’s admitted INPUTS document, plus the public sources listed in the source map. The case slice does not establish broader product or repository coverage; no whole-project conclusion is inferred. The component source and its history were inspected but not executed. No code, application, data-import, performance, or acceptance validation was run. The complete code-to-issue trail is RainfallQC v1.0.2 at commit 150717eba097ccd771920181b13ce957950a8a59; its fixed logic compares individual time groups to the overall mean and skips groups with fewer than two values. The upstream function itself warns that it performs less well with less data, and this research does not establish whether its statistical assumptions suit volunteer or stream-stage records [S06–S10].

