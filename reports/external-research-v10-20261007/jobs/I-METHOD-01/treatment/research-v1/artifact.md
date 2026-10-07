# I-METHOD-01 researcher draft
## Rain and stream station reconciliation workbench

**Stage:** Researcher draft complete and ready for an independent critic and revision. This is a proposal for the frozen sandbox only; it does not change repository canon or create a WorkNode.

**Scope held fixed:** one watershed, one season, six rain gauges, four stream-level stations, and the ingestion-to-review-to-export workflow. The app is a local workbench for a community summary. It is not an emergency warning system or engineering flood forecast.

**Timing and evidence handling:** The first useful finding was saved at 2026-10-07 18:58:37 UTC. This complete draft was saved at 2026-10-07 19:10:32 UTC. The dispatch configuration records 2026-10-07T18:56:45.844115Z and a prospective stage deadline of 2026-10-07T19:16:45.844115Z; no earlier corrected requestedAt was present in the admitted file, so that recorded time was used as the conservative clock anchor. Public discovery began from the user need before opening the frozen plan. Source operations and captured byte paths are enumerated in source-map.json.

The researcher’s native Goal identity is 01a117ba-2598-7ed2-b2fe-9ec875c2ff26. Its activation receipt reported active status. At activation, the native Goal exposed tokensUsed=0 and timeUsedSeconds=0. Separate input, cached-input, generated-output, reasoning, and billing counters were not exposed and are recorded as null in source-map.json. The native lifecycle JSON responses are in native-receipts.jsonl.

## 1. Proposed decision

Keep the frozen product boundaries and workflow. Tighten the data contract so each plotted or exported value can be traced to (a) the exact volunteer file and source row, (b) the import profile and interpretation choices, and (c) any later flag, annotation, or derived calculation. Keep original bytes immutable. A flag is a prompt for review, not a correction or claim that a measurement is false.

For the MVP, prefer a small local relational model in an embedded SQLite project file, with original files retained alongside the project and fingerprints in its manifest. Use an explicit, versioned import profile for each file shape. For Rust implementations, the audited CSV parser candidate is csv 1.4.0 at release commit 4a3997e91d668ea1d8595bdef15625a77cf2308a. Its strict field-count behavior is useful at the syntax layer; it does not parse hydrologic meaning, timestamps, units, datum, or quality. Keep the plotting library and any broad time-series framework open pending a representative-data spike.

Borrow a compact subset of ODM2 and PROV concepts—site, observed variable, method, processing state, units, source entity, interpretation activity, and derivation links—without adopting their full schemas or RDF machinery in the first release. The point is durable provenance, not standards compliance.

## 2. Replacement sandbox plan

### P1 — Inputs and identity

The MVP imports timestamp/value CSV files for the ten named stations over one season. An import preview binds each file to a station and sensor, then requires a saved, named profile for its column mapping, header/delimiter, timestamp format and time-zone convention, value and unit fields, missing-value tokens, and temporal support. Temporal support must state whether each row is an instantaneous reading or an amount/statistic over a specified interval. The user confirms ambiguous dates, decimal conventions, time zones, units, and interval boundaries; the app does not silently guess.

Keep each original file byte-for-byte in the project’s source area. Record a SHA-256 fingerprint, original filename, intake time, volunteer/source label if supplied, import-batch ID, profile ID/version, and parser diagnostics. Each parsed record retains its source record ordinal and available parser position. A repeated file/profile combination is shown as a duplicate candidate. A new profile applied to the same bytes creates a new interpretation linked to the same source file, never a replacement of the earlier batch.

The Rust csv reader is only a candidate syntax layer. Use strict record-width checking by default; malformed records are shown with position and reason. A profile may explicitly tolerate a known variable-width format only if each affected row remains reviewable. Parse rows into byte/string records first, then perform explicit field mapping and conversion. Never discard the original textual value or normalize a file in place. Do not accept XLSX or remote ingestion as an MVP requirement absent representative volunteer files; they remain an option after the CSV path is demonstrated.

### P2 — Data model and provenance

Store source files, import batches, versioned import profiles, source rows, parsed observations, station metadata revisions, flags, annotations, and derived summaries as distinct records. Each observation records its station, variable, value as reported, parsed value, reported unit, interpreted unit, source timestamp text, interpreted time or interval, and links to its source row and import decision. Keep the original value and time text even when an interpretation is added.

Station metadata includes stable station identity, station type, location as supplied, sensor/method, replacement/effective dates, units, and—where relevant for stage—datum or reference information. A metadata update creates an effective-dated revision. It must not silently reinterpret old observations. Unspecified datum, interval semantics, coordinate reference, or sensor history remains explicitly unknown.

Annotations and review decisions are append-only. Record who made them when the app knows, when they were made, their scope, text/reason, and the source value or range they concern. A human-entered alternate value or correction, if included, is a new interpretation with before/after values, reason, actor, and applicable time range; the measured value stays visible and unchanged. Keep the MVP’s core relational model lean rather than implementing full PROV-O or ODM2. The relationships should still express source → import/interpretation activity → observation or derived value.

### P3 — Review

The user can select a storm window and align rain and stage series, inspect missing intervals, and annotate suspicious samples or segments. Keep the proposed configurable thresholds and manual review. Rules create versioned review prompts with the rule, threshold, unit, time range, and evidence/context recorded. They do not reject, delete, replace, or “correct” readings. The UI uses statuses such as “flagged,” “reviewed,” and “selected for summary,” not an implied agency approval.

Offer an initial, configurable prompt set:
- structural: malformed row, missing required field, duplicate timestamp/record, repeated values, and gaps relative to a user-declared sampling interval;
- precipitation: unusually high or isolated amount, repeated zero or repeated non-zero sequence, possible date shift, possible multi-day accumulation entered as a daily amount, possible overflow-coded value, or a missing observation/comment that needs follow-up;
- stage: stale or missing readings and abrupt change against a user-configured station range, displayed as a question for review;
- comparison: candidate time/spatial disagreement between stations only where their time windows, reporting periods, and units are compatible.

The CoCoRaHS guide documents volunteer precipitation issues such as misplaced decimals, false zeros, incorrect dates, multi-day accumulation entered as a daily value, snow entered in the precipitation field, and gauge overflow without a comment; its GHCN-D checks include duplicate, streak, bounds, temporal, and spatial consistency flags [S08]. These are prompts to consider, not thresholds to copy. That guide addresses a particular daily volunteer precipitation program and its downstream QC, not this network’s sensor sampling or stage records.

### P4 — Comparisons and summaries

Users compare nearby stations and a selected reference series over a chosen storm window. Display rain and stage on a common time axis but separate, labeled value axes. Show gaps, temporal support, the chosen time-zone interpretation, source file, and active interpretation. Do not imply that neighboring rainfall values should be equal or that stage has a fixed physical relationship to rain.

A summary is a derived record, not an edit to the observations. Each summary stores its source sample IDs/ranges, rule or calculation name/version, window boundaries, timezone, units, interpretation choices, and creation time. Suitable MVP summaries include rainfall total over the explicitly selected interval and stage maximum with time; label partial coverage and flagged inputs. Stage-to-flow conversion, causal attribution, predictive thresholds, and flood-forecast language are out of scope.

### P5 — Components and operation

Keep a single-user local desktop app, embedded store, intermittent offline use, and no cloud-account requirement. SQLite is the preferred store candidate because its own guidance identifies local desktop application files and local data containers as a fit [S11]. Treat about two million seasonal records on a normal laptop as a measurable acceptance target, not a result already established. Stream import and database writes; index by station/time; avoid loading every record into the plot view. An atomic transaction per import batch prevents a crash from leaving a partly committed batch [S13]. Enable and verify SQLite foreign keys on every connection because the default is off [S12]. Keep the project and original-file storage on a supported local filesystem rather than a shared network drive.

The component decision is deliberately narrow: use csv 1.4.0 as the parser candidate, SQLite as the local-store candidate, and choose the plotting and time-zone/time-series libraries after a small spike using representative records from all ten stations. The plot spike must demonstrate zoom/pan, gap display, flags/annotations, separate rain/stage units, and acceptable performance at the two-million-row target. Do not take a dependency on HydroShare or a cloud API for the core workflow.

### P6 — Output and acceptance

Export a local review package for the selected storm window containing the selected observation view, annotations, flags and their status, calculation inputs/definitions, provenance links, source-file fingerprints, and a plain-language uncertainty note. Include both the reported value and the selected interpretation where they differ. State missing coverage, unresolved flags, unknown time/unit/datum choices, and the scope of human review. The package supports a later community summary; it does not publish or certify one automatically. Offer optional inclusion of original files as a user-controlled package choice.

Acceptance remains proposed, with no product tests executed. In addition to the frozen plan’s repeated imports, discontinuous records, changed station metadata, and round-trip exports, accept only when the app demonstrates the validation cases in section 6 below. No tests have run and no app has been built.

## 3. Research findings and mechanisms

### Open discovery before plan comparison

Before opening the plan, HydroShare’s time-series documentation surfaced an environmental observation model for fixed monitoring points and an existing path for both ODM2 SQLite and CSV time series [S01]. Its metadata guidance names site, variable, method, processing level, units, temporal offsets, and aggregation statistic [S02]. That is a useful check against a bare timestamp/value schema. HydroShare is a repository and sharing system, not a fit for the requested offline local workbench; use it as an interoperability precedent, not an MVP dependency.

The USGS time-series program exposes distinct review material for stage/elevation and precipitation [S03–S07]. The stage workflow calls for field-data verification, source documentation for backup data, explicit discussion of edits and corrections, and approval review. The precipitation checklist treats calibration, edits, backups, corrections, estimates, and hyetographic comparison separately. These demonstrate why “reviewed” needs context and why the workbench must preserve the input record and later interpretation. USGS requirements are for agency records, qualified staff, and agency systems; this volunteer application must not label its workflow “USGS approved” or import USGS-specific calibration limits as volunteer thresholds.

The CoCoRaHS QA/QC document is a closer volunteer precipitation analogue [S08]. In particular, it preserves high overflow observations while asking for comments/follow-up and assigns quality flags after ordered checks. The useful mechanism is “flag and investigate while retaining the reported observation,” not its operational thresholds, station counts, climatology, or GHCN-D pipeline.

W3C PROV-O provides a compact conceptual vocabulary of entities, activities, agents, use, generation, derivation, and attribution [S09]. W3C’s tabular-data model separates tabular syntax from table/row/column/cell metadata and supports user-supplied metadata to guide processing [S10]. For this MVP, versioned import profiles and relational provenance rows are enough; full RDF and full CSVW processing are optional interoperability paths, not requirements.

### Consequential component: Rust csv

The official csv crate’s 1.4.0 release is published 2025-10-17 [S15]. Its immutable source release commit is 4a3997e91d668ea1d8595bdef15625a77cf2308a [S16]. In src/reader.rs, ReaderBuilder.flexible documents that equal field counts are required by default and that enabling flexibility turns off that check; ReaderState.add_record compares each parsed record with the first and returns UnequalLengths with position, expected length, and actual length when strict [S16]. Its tests read a one-field record followed by a two-field record, verify the error and exact position in read_record_unequal_fails, then show the explicit flexible(true) case and continued reading after an error [S16]. This is an appropriate low-level mechanism for an import preview that must surface broken rows instead of silently coercing them.

The same source has ByteRecord and byte-buffer deserialization support. The governing caller is Reader::read_byte_record feeding the record parser and field-count check; the field-count definition is ReaderState.add_record. The parser handles CSV syntax; it does not establish column meaning, safe timestamp conversion, units, physical plausibility, or source provenance. Byte records do not constitute general encoding detection. Preserve the original bytes and require the import layer to decide how textual fields are decoded.

### Defect-to-fix-to-release evolution and limits

I found no relevant GitHub issue record showing the exact strict-width behavior as a defect and do not claim one. A concrete, equivalent implementation evolution exists in the same component: commit 9e644e66db0aa0b931758de1c2b7da555fb632b7 is titled “serde: fix bug in handling of invalid UTF-8.” Its message identifies the bug—byte-valued fields were incorrectly routed through UTF-8 validation—changes deserialize_byte_buf to pass raw bytes, and adds a partially_invalid_utf8 regression test. The commit cites the report that prompted it. The official GitHub API comparison records that the 1.4.0 release commit is 102 commits ahead and has this fix commit as its merge base; the released source still uses next_field_bytes and carries a partially_invalid_utf8 test [S17–S19]. This establishes that the fix is in the audited release source; no tests were run for this research, and it does not prove the library’s tests were run here. The defect is relevant to preserving non-UTF-8 byte fields, but it is not evidence that csv detects file encoding or safely normalizes legacy volunteer exports.

SQLite provides the local application-file and atomic-transaction mechanisms [S11, S13]. One important integration condition is that foreign-key enforcement must be enabled per connection, so the app must verify it at startup/connection creation rather than assume schema declarations are enforced [S12]. Two million rows still requires a measured import/query/plot benchmark; the official documentation does not prove this product’s performance.

## 4. Frozen-plan comparison

| Plan decision | Disposition | Comparison and evidence |
|---|---|---|
| P1: timestamp/value CSV; station, sensor, timestamp convention, units preview; immutable originals and batch provenance | **Retain and specify.** Add saved profile versions, row positions, raw-file fingerprints, explicit temporal support, and no silent inference. | The original preview and immutability are already covered in P1. CSVW’s user-supplied metadata and dialect model supports explicit per-file profiles [S10]; HydroShare adds method, processing level, site, units, and UTC offset fields [S02]. Rust csv gives a strict-width mechanism and positions, but does not do domain mapping [S16]. Other formats remain uncertain until files are seen. |
| P2: raw samples, import decisions, annotations; station catalog; replacements; overlapping imports reviewed | **Retain and make append-only.** Add effective-dated metadata and separate parsed/derived values from reported values. | These provenance and overlap controls are already covered in P2; they directly satisfy the preservation need. ODM2’s Actions, Results, annotations, derivation-equation and quality tables are precedent, but adopting its entire schema is optional [S14]. USGS review artifacts support recording edit reason, timing, data source, and reviewer outcome [S04, S06]. |
| P3: aligned plots, gaps, suspect-segment annotations, configurable thresholds/manual review; no autonomous correction or level-to-flow | **Retain; add contextual review prompts only.** Do not silently convert prompts into invalidation. | Existing manual review and negative constraints are explicit in P3. Volunteer precipitation examples support possible prompts for date mistakes, multi-day amounts, overflow, false zero, and repeated/spatially inconsistent values [S08]. USGS stage and precipitation workflows show different evidence categories [S04–S07]. Their numeric policies are not transferred. |
| P4: nearby/reference series; show raw source and selected interpretations; derived summaries link to ranges | **Retain and qualify comparison.** Add compatible windows/units and explicit summary calculation metadata. | Source/interpretation visibility and range links are already covered in P4. HydroShare’s time-series metadata shows why unit, aggregation statistic, and UTC offset accompany values [S02]. No evidence supports inferring cause, discharge, or flood risk from the selected comparisons. |
| P5: single-user local app, embedded store, ~2M seasonal records, offline/no cloud; reader/plot undecided | **Retain constraints.** Prefer SQLite and evaluate csv 1.4.0 for parsing; keep plot/time library choices open to a performance spike. | Local-file SQLite use matches the stated operating model [S11]. Foreign keys require an explicit runtime setting [S12], and batch transactions offer an atomic import boundary [S13]. The pinned parser source supports strict field validation [S16]. Neither source validates two-million-row product performance; benchmark it. |
| P6: review package, uncertainty note; repeated/discontinuous imports, changed metadata, round-trip exports; no tests run | **Retain and make export self-describing.** Add flags/review state, source hashes, exact derived inputs, and unresolved unknowns. | The original export and uncertainty note are already covered in P6. Provenance/metadata standards support carrying source, method, processing state, units, and derivation links [S02, S09, S10]. The plan explicitly says no tests have run; that remains true here. |

## 5. Alternatives, opportunities, and unresolved product choices

- **Supported addition:** a table-driven review flag record that stores rule version, observed context, threshold/unit, status, and reviewer disposition. This keeps rules explainable and editable without changing observations.
- **Optional interoperability:** evaluate exporting an ODM2-compatible package or CSVW metadata sidecar after the local model works. Full ODM2 or full PROV-O/RDF may create disproportionate scope for ten stations and one season. Do not claim standard compliance from borrowed field names.
- **Optional input formats:** XLSX and logger-specific formats may matter, but the frozen plan specifies CSV and no example files are admitted. Decide after collecting representative volunteer exports through the later authorized product process; keep raw-file preservation format-neutral now.
- **Product choices still needed:** which profile fields are required at import; which rainfall time supports occur in the network; what timezone/day boundary the volunteers use; how a station’s stage datum is supplied; whether manual alternate values are needed in the MVP or annotations suffice; whether the optional export includes original files by default; and which plotting component satisfies the interaction/performance spike.
- **Uncertainty:** the plan supplies no real files, sample intervals, gauge models, station coordinates/datum, sensor replacement history, or volunteer workflow examples. No threshold or correlation rule can be scientifically calibrated from this research. It is unknown whether one generic profile can cover all ten stations or whether volunteers require distinct profiles.
- **Reject for this MVP:** cloud upload or HydroShare as a required service conflicts with offline/no-account operation; direct adoption of CoCoRaHS thresholds would confuse separate networks and time supports; USGS approval terminology and professional calibration rules are not applicable to this volunteer tool; automatic “cleaning,” overwriting, unit guessing, stage-to-flow conversion, causal claims, emergency alerts, and forecasts conflict with the brief and frozen P3/P4 scope.
- **Already covered, not a new requirement:** immutable originals/batch provenance (P1), separate raw samples and analyst annotations plus overlap review (P2), manual review and no autonomous correction/flow conversion (P3), source/interpretation visibility and range-linked summaries (P4), local/offline use and scale target (P5), and a review package with uncertainty and proposed acceptance only (P6). The citations above support why these controls apply; they do not imply that an implementation already exists.

## 6. Critic stage and disposition

The requested flash-family critic has not yet supplied findings to this researcher stage. O5 is reserved for that independent review; this draft does not fabricate criticism or claim agreement. The critic should independently verify the pinned source and release ancestry, test whether the chosen parser matters to P1/P5, check each P1–P6 disposition against the full brief, and identify any missing alternatives or uncertainty. The coordinator’s later artifact should preserve each criticism and explicitly mark accepted changes, rejected objections with reasons, and unresolved objections.

## 7. Concrete validation proposals (not executed)

1. **Import identity and idempotence:** import the same bytes/profile twice; verify the second is detected as a duplicate candidate and does not overwrite or double-count the first. Re-import the same bytes with a changed profile; verify a new interpretation links to the same file and the original batch remains available.
2. **CSV syntax and reviewability:** fixtures with quoted commas/newlines, CRLF and LF, empty cells, a short row, a long row, duplicate headers, non-UTF-8 bytes, and bad quotes. Verify strict width errors include a useful record position; confirm a profile’s explicit flexible mode never loses the actual row width or source link.
3. **Timestamp and units:** fixtures with ambiguous day/month dates, local time and offset-bearing time, daylight-saving ambiguity, missing timezone, unit changes, missing-value sentinels, and interval totals. Require a deliberate profile choice or a visible unresolved state; verify displayed values retain reported value/unit and chosen conversion.
4. **Station history:** replace a sensor or change station metadata effective mid-season. Verify historical readings keep the previous metadata version unless explicitly reinterpreted, and both interpretations remain traceable.
5. **Flags without data mutation:** exercise duplicate, gap, repeated-value, configured threshold, possible date-shift, and precipitation overflow prompts. Verify every prompt has rule context and can be dismissed/annotated while reported data remain unchanged.
6. **Storm comparison:** use matched and mismatched time supports, units, and gaps. Verify incomparable series are visibly qualified; rain totals use stated window boundaries; stage maximum includes its timestamp; no output suggests flow or flood risk.
7. **Export and reopen:** export a review package, close/reopen offline, and compare source hashes, sample values, annotations, flags, summaries, selected interpretations, and uncertainty note. Verify the export makes unresolved flags and gaps visible.
8. **Scale and transaction recovery:** generate an authorized synthetic fixture at two million records. Measure import time, query latency, memory, and plot responsiveness on a named normal-laptop profile. Interrupt a batch-write test at defined points and verify it is all-or-none. Verify SQLite foreign-key checks are on for every connection. These are proposed tests only; no benchmark or fault injection was performed.

## 8. Evidence index

Evidence IDs resolve to immutable captured bytes and exact locators in source-map.json. Principal public sources include [HydroShare time-series guidance](https://help.hydroshare.org/hydroshare-resources/content-types/time-series/), [USGS stage/elevation workflow](https://water.usgs.gov/osw/time-series-guidance/SW2_Stage_or_Elevation/AAA_stage_elevation.pdf), [USGS precipitation workflow](https://water.usgs.gov/osw/time-series-guidance/SW6_Precipitation/AAA_precip.pdf), [CoCoRaHS QA/QC guidance](https://media.cocorahs.org/docs/CoCoRaHS_QA_QC_April_2019.pdf), [W3C PROV-O](https://www.w3.org/TR/prov-o/), [SQLite appropriate uses](https://www.sqlite.org/whentouse.html), and the [Rust csv 1.4.0 release source](https://github.com/BurntSushi/rust-csv/tree/4a3997e91d668ea1d8595bdef15625a77cf2308a).

## 9. O1–O6 coverage

- **O1:** brief-led public primary-source discovery and negative findings are recorded in sections 3 and 5.
- **O2:** pinned csv source, governing definitions/caller, regression test, and release applicability are in section 3 and source-map.json.
- **O3:** no pertinent GitHub issue was found for the selected behavior; the concrete fix/test/release evolution and its limits are stated in section 3.
- **O4:** every frozen P1–P6 decision is compared in section 4.
- **O5:** intentionally pending the fresh critic; no critic output was available to this researcher.
- **O6:** replacement P1–P6 sections, rationale, alternatives, covered/rejected/uncertain dispositions, proposed validation, and evidence references are provided above.

No application build, application test, benchmark, or public infrastructure operation was performed.

