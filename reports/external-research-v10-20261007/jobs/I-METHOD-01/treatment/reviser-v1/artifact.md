# I-METHOD-01 — revised plan for the rain and stream station reconciliation workbench

**Stage:** Complete proposed-change artifact for the frozen sandbox. This plan does not change repository canon, create a WorkNode, build an application, or claim product validation.

**Scope held fixed:** One watershed, one season, six rain gauges, four stream-level stations, and the ingestion-to-review-to-export workflow. The product is a single-user local workbench for preparing a community summary. It is not an emergency warning system, engineering flood forecast, agency approval system, or stage-to-flow tool.

## 1. Proposed decision

Retain the frozen product boundaries and the researcher draft’s central design: immutable reported files and values; explicit, versioned interpretation; provenance from source file and row through review and derived summaries; non-destructive human review; local/offline operation; and a self-describing review package.

Adopt SQLite and Rust csv 1.4.0 only as MVP component candidates. The captured release source supports strict field-count checking as a syntax-layer aid, but its position and line diagnostics are not yet a dependable product contract. The app must own stable source-record identity and byte offsets, and a release-specific regression check must determine what physical line information can safely be shown. Keep plot and time-zone/time-series libraries open until the representative-data spike.

Borrow selected metadata and provenance concepts from the cited standards and systems. Do not claim compliance, copy their full schemas, or import their network-specific thresholds or approvals.

## 2. Complete replacement sandbox plan

### P1 — Inputs and identity

The MVP imports timestamp/value CSV files for the ten stations in scope during the one-season window. The user assigns each file to a station and sensor in an import preview. The preview uses a saved, named, versioned profile for header presence and handling, delimiter, column mapping, timestamp format, time-zone convention, value and unit fields, missing-value tokens, and temporal support. Temporal support must identify an instantaneous value or the measure/statistic and interval it represents. The app requires explicit user resolution for ambiguous dates, decimal conventions, time zones, units, interval boundaries, and station identity; it does not silently infer them.

Retain each original file byte-for-byte in the project source area. Record its SHA-256 fingerprint, original filename, intake time, source label if supplied, import-batch ID, profile ID/version, and diagnostics. Every parsed source record links to an app-owned source-record ordinal and byte start/end offsets in the original bytes. Keep parser-reported position and physical line information separately, label their meaning, and do not rely on physical line alone for row identity. Preserve each row’s actual field count and unassigned cells.

The pinned csv 1.4.0 candidate checks equal field counts by default and its flexible option disables that check. The check compares against the first parsed record; whether that is a header depends on reader configuration. Strict mode may therefore report a syntax-width mismatch with expected/actual counts and a position, but it does not validate required semantic fields. A flexible profile is permitted only for a known, reviewed file shape and must add app-level required/extra-field checks without dropping cells. Profiles state whether a header exists; duplicate or empty headings, missing required columns, and extra/unmapped columns require an explicit mapping or visible review outcome.

Keep raw source bytes and original textual values. A repeated file/profile combination is shown as a duplicate candidate; applying a new profile to the same bytes creates a new interpretation linked to the same source file, never a silent replacement. Parse CSV syntax before explicit field mapping and conversion. Do not normalize source files in place. Non-UTF-8 text is rejected with a reviewable diagnostic, retained as bytes for explicit user handling, or decoded only under a declared choice; it is never silently coerced. XLSX, logger-specific formats, and remote ingestion are not MVP requirements without representative files.

### P2 — Data model and provenance

Keep source files, import batches, versioned import profiles, source rows, parsed observations, station metadata revisions, flags, annotations, review decisions, and derived summaries distinct. An observation records station and variable identity; reported value and text; parsed value; reported and interpreted units; source timestamp text; interpreted instant or interval; source-record ordinal and byte offsets; and links to the source row and import decision. Preserve the reported form even when an interpretation is added.

Station metadata holds stable identity, station type, location as supplied, sensor/method, effective and replacement dates, units, and, where relevant for stage, datum/reference information. Metadata changes create effective-dated revisions and do not silently reinterpret earlier records. Unknown datum, coordinate reference, interval semantics, sensor history, and location precision remain explicitly unknown.

Annotations and review/status changes are append-only. Record actor where known, time, scope, text/reason, and the value or range concerned. If human-entered alternate values are admitted, store each as a new interpretation with before/after values, reason, actor, and applicable interval. The reported observation remains visible and unchanged. Keep the relational schema lean: express source → import/interpretation activity → observation or derived result without implementing full PROV-O, ODM2, or RDF.

Because source files and the database are separate stores, a SQLite transaction does not make a file copy plus database registration atomic. Proposed import recovery sequence: write a new source file to a unique staging path in the project; compute and verify its fingerprint; move it into the managed immutable source area; then register the file and its import rows in one database transaction. On reopen, reconcile staging files, unreferenced managed files, and database references whose file is absent or whose hash differs. Report each mismatch and offer explicit recovery or cleanup choices; never silently delete a source file or present missing source bytes as available. File move atomicity depends on the project filesystem and same-filesystem staging, so the implementation must document and verify its chosen storage configuration. This is a proposed policy, not a tested recovery procedure.

### P3 — Review

Users select a storm window, inspect rain and stage series and missing intervals, and annotate suspicious samples or segments. Configurable rules create versioned review prompts containing rule/version, threshold and unit when applicable, time range, and visible evidence/context. Prompts never reject, delete, replace, or correct readings. Use statuses such as “flagged,” “reviewed,” and “selected for summary”; none means agency approval or scientific certification.

Possible initial prompts, all uncalibrated for these stations:

- Structural: malformed row; missing required field; duplicate timestamp or source record; repeated values; and a gap relative to a user-declared sampling interval.
- Precipitation: unusually high or isolated amount; repeated zero or non-zero sequence; possible date shift; possible multi-day accumulation entered as a daily amount; possible overflow-coded value; or a missing observation/comment needing follow-up.
- Stage: stale or missing readings and abrupt change against a user-configured station range, presented as a question.
- Cross-station comparison: candidate time or spatial disagreement only when time windows, temporal support/reporting periods, and units are compatible.

CoCoRaHS documents volunteer precipitation entry issues and follow-up flags, including overflow reports retained with a request for comment; its examples motivate prompts, not local thresholds. USGS stage and precipitation materials illustrate distinct review evidence and history, but their staff roles, approval language, procedures, and calibration limits do not transfer to this volunteer app. Keep prompts configurable, dismissible with a recorded disposition, and visibly separate from observation values.

### P4 — Comparisons and summaries

Users may compare nearby stations and a selected reference series over a storm window. Rain and stage may share a labeled time axis with separate labeled value axes, but the app only calls a comparison compatible after interpreting time zone, interval boundaries, measure/statistic, temporal support, and units. Show each series’ support and coverage, time-zone interpretation, source file, active interpretation, and gaps. Do not silently interpolate, shift, prorate, aggregate, or align records to make them appear comparable. Any later authorized transformation must be explicit, versioned, and visible in the summary provenance.

A summary is a derived record, never an edit to observations. Store source sample IDs/ranges, calculation name/version, window and boundary rule, time zone, units, interpretation choices, and creation time. A rainfall total is only a candidate when the source measure and temporal support are known to be interval accumulations suitable for summation; do not sum rates or double-count overlapping accumulations. Show the selected partial-coverage treatment and flag incomplete coverage. A stage maximum with its time remains a candidate summary and displays its interpretation and coverage. Stage-to-flow conversion, causal attribution, predictive thresholds, emergency warnings, and flood forecasts remain out of scope.

### P5 — Components and operation

Keep a single-user local desktop app, embedded project store, intermittent offline use, and no cloud-account requirement. SQLite is the preferred local-store candidate: its official guidance describes application-file/local-storage uses. Foreign-key enforcement is disabled by default, so enable and verify it on every connection. A transaction per import batch is a proposed database boundary whose atomicity depends on the selected SQLite configuration; it says nothing by itself about file copy/rename or hash creation.

Use Rust csv 1.4.0 as a parser candidate only. The audited immutable release commit is 4a3997e91d668ea1d8595bdef15625a77cf2308a. Strict field-count checking can help surface malformed widths; it does not establish column meaning, timestamps, units, datum, physical plausibility, encoding detection, or quality. Keep the plotting and time-zone/time-series libraries undecided until a small spike with representative records from all ten stations demonstrates zoom/pan, visible gaps and flags/annotations, separate rain/stage units, and product-defined responsiveness at the scale target. Keep HydroShare/cloud APIs out of the core workflow.

Treat approximately two million seasonal records on a normal laptop as a proposed measurable acceptance target, not a result. Before measurement, name a representative laptop and set observable limits for import, query, memory, and plot interaction with the product owner; the admitted evidence supplies no numeric limits. Stream import and database writes, index station/time access, and avoid loading every record into the plotting view. Keep the project and original-file storage on a supported local filesystem, not a shared network drive.

### P6 — Output and acceptance

Export a local review package for a selected storm window. Include the selected observation view; reported values and chosen interpretations when they differ; annotations; flags and their status/context; calculation definitions and inputs; provenance links; source-file fingerprints; temporal support, units, time-zone interpretation, and coverage; and a plain-language uncertainty note. State missing coverage, unresolved flags, unknown time/unit/datum choices, and the scope of human review. The package supports later community summary work; it does not publish, certify, or approve a summary automatically.

Original-file inclusion is an explicit user choice. Distinguish a package carrying source bytes from one carrying only fingerprints/references. If bytes are omitted, state that recipients cannot independently inspect the source from that package alone unless they also have the project/source files. Keep the hash/reference either way.

Acceptance remains proposed. Retain the frozen plan’s repeated imports, discontinuous records, changed station metadata, and round-trip exports, together with the validation proposals in section 8. No application, parser, recovery sequence, product test, benchmark, or fault injection has been run.

## 3. Findings and mechanisms retained

Open discovery supplied bounded analogies rather than local policy. HydroShare’s time-series documentation shows environmental observations at fixed sites and metadata for site, variable, method, processing level, units, time offsets, and aggregation statistic [S01–S02]. It is a sharing/repository precedent, not an offline-workbench dependency. USGS materials separate stage/elevation and precipitation review workflows and record field/source evidence, edits, corrections, estimates, and review state [S03–S07]. They do not justify “USGS approved” labeling or transferring agency policy. CoCoRaHS documents volunteer precipitation issues and retaining overflow observations for follow-up [S08], not transferable thresholds. W3C PROV-O supplies useful entity/activity/derivation concepts [S09]; CSVW supports metadata-guided tabular interpretation [S10]; and ODM2 shows actions, results, annotations, derivations, and quality relationships [S14]. Use a small relational subset, not full RDF, ODM2, or CSVW machinery.

At the pinned Rust csv release, ReaderBuilder documents strict equal-field-count checking by default and an explicit flexible mode that turns this check off [C01]. The captured reader path copies the core line count to the current position and adds the record [C02, C10]; ReaderState returns an UnequalLengths error with expected/actual count and the record position [C03]. Pinned tests show an unequal-width record’s position and that flexible mode accepts unequal widths [C04, C11]. These captures support a syntax-width mechanism and a position field in the error, not a product guarantee of stable row identity or correct physical line diagnostics.

The supplied open issue #395 reports a CRLF physical-line problem in Reader position and includes a reproducer; issue #422 reports a line-count problem after mismatched columns [C13–C14]. They are reports, not fixes or reproductions against the pinned release. Issue #422 postdates csv 1.4.0. The captured wrapper updates its line value from csv-core, making the reports relevant, but exact applicability to 1.4.0 remains unresolved. Do not promise line accuracy without the release-specific test suite. The application therefore owns source-record ordinals and byte offsets against original bytes and separately validates any physical line display.

The 2018 commit 9e644e66db0aa0b931758de1c2b7da555fb632b7 fixed a byte-buffer Serde path that incorrectly routed arbitrary bytes through UTF-8 validation and added a regression test [S17]. The researcher’s captured release ancestry/source records identify this fix in the audited 1.4.0 release [S16–S19]. It applies to byte-buffer deserialization; the proposed manual mapping path does not establish use of that path. This does not show encoding detection or safe normalization. Preserve it as a narrow history example, not as support for a general decoding policy. No issue was identified as a defect report for the selected strict-width behavior itself; the two position reports must not be described as fixes or as proof of a pinned-release defect.

SQLite’s official guidance supports its candidacy for a local application file [S11]. Its foreign-key documentation says enforcement is disabled by default and is enabled per connection [S12]. Its atomic-commit material says a database transaction has all-or-none database changes, and distinguishes rollback mode from WAL’s mechanism [S13]. Accordingly, use a configured transaction for database rows while treating file-plus-database recovery as a separate application protocol. Neither SQLite documentation nor the researcher’s approximate scale target proves this product’s performance.

**Captured-manifest correction:** Critique source-map C08 calls its capture a pinned csv-core 0.1.11 package manifest, but the exact bytes at C08 state package version 0.1.13. The pinned root manifest at C12 specifies a path dependency with version requirement 0.1.11; that is not an exact-version pin. The captured package manifest and root requirement are compatible, but the C08 map label does not establish that the resolved package version is exactly 0.1.11. This revision records the discrepancy and does not rely on the map label for an exact dependency-version claim. It does not change the parser candidate decision.

## 4. Frozen-plan comparison and exact dispositions

| Frozen decision | Disposition | Revised comparison |
|---|---|---|
| P1: timestamp/value CSV, station/sensor/profile preview, immutable originals and batch provenance | **Retain; specify. Already-covered elements remain covered.** | Preserve preview and source immutability. Add profile versions, actual station assignment during import, temporal support, raw values, source-record ordinal and byte offsets, actual row width, explicit header/extra-column behavior, and careful position claims. CSVW/HydroShare support explicit metadata fields [S02, S10]; the pinned parser contributes syntax checking only [C01–C04]. Other formats remain uncertain until examples are supplied. |
| P2: raw samples, import decisions, annotations, station catalog/replacements and overlap review | **Retain; make history explicit. Already-covered provenance remains covered.** | Preserve separate reported, parsed, interpreted, annotated, and derived information. Add effective-dated metadata, append-only review history, and separate file/database recovery. Standards are conceptual precedent, not schemas to adopt [S09, S14]; agency review sources support retaining history but not agency status [S04, S06]. |
| P3: aligned plots, gaps, suspect-segment annotations, configurable thresholds/manual review; no autonomous correction or level-to-flow | **Retain; qualify prompts. Already-covered manual review and prohibitions remain covered.** | Add contextual prompts for volunteer-entry issues while keeping rules uncalibrated and observations unchanged. CoCoRaHS and USGS examples motivate review context only [S04–S08]. Numeric policies do not transfer. |
| P4: nearby/reference series, raw/selected-interpretation visibility, range-linked summaries | **Retain; constrain comparison and calculations.** | Add temporal-support and unit compatibility, explicit boundary and coverage rules, no silent alignment, and calculation metadata. HydroShare supports carrying units/aggregation/time-offset context [S02]. Causal, discharge, and flood-risk claims remain rejected. |
| P5: local/offline app, embedded store, roughly 2M seasonal records; reader/plot undecided | **Retain constraints; candidates remain unvalidated.** | Prefer SQLite for the local-file model and csv 1.4.0 as a syntax parser candidate [S11, C01–C04]. Enable foreign keys per connection [S12]. A database transaction is not whole-import atomicity [S13]. Keep plotting/time libraries open; the scale figure requires a named-machine benchmark and product-defined limits. |
| P6: review package and uncertainty note; repeated/discontinuous imports, metadata changes and round-trip exports | **Retain; make package portable by disclosure.** | Include source fingerprints, interpretations, flags, calculations and coverage. Optional source bytes create a package recipients can inspect; hashes/references alone require access to the project/source files. Keep acceptance unexecuted and add diagnostic and recovery cases. |

## 5. Alternatives, options, and product choices

- **Local store:** Prefer an embedded SQLite project file for the single-user/offline model. A client/server database is not required by the frozen scope. The SQLite candidate still needs configuration and performance validation.
- **CSV parser:** Retain Rust csv 1.4.0 as a candidate because strict width checking can surface a syntax problem. Its flexible mode remains an explicit alternative only for a known shape plus app-level validation. Neither mode interprets domain fields. Do not infer encoding.
- **Other input formats:** Reject XLSX or remote ingestion as MVP requirements for now; defer logger-specific formats until representative files are available. Keep preservation format-neutral.
- **Data standards:** Retain compact concepts for site, variable, method, processing state, units, source entity, interpretation activity, and derivation. Defer full ODM2/RDF/PROV-O/CSVW adoption and optional ODM2-compatible or CSVW-sidecar export until the local model works.
- **Plots and time series:** Keep plotting/time-zone/time-series dependencies open. Choose only after the representative-data spike. The two-million-record benchmark is a proposed test target, not evidence of performance.
- **Alternate values:** Preserve raw observation and allow a separately recorded human interpretation if product scope includes it. Whether the MVP needs alternate values or annotations alone is unresolved.
- **Export:** Keep original-file inclusion optional and user-controlled. A package containing only hashes and references is not independently inspectable without source access; disclose this.
- **Rejected scope:** Required HydroShare/cloud service, cloud account, automatic cleaning or overwrite, guessed units/time zones, transferred CoCoRaHS/USGS thresholds, agency-approval wording, stage-to-flow conversion, causal attribution, prediction, alerts, and flood-forecast language are outside the frozen product.
- **Still open:** real file shapes; station names and assignment; coordinates and reference system; sensor history; stage datum; time zone and day boundary; temporal support and rainfall measures; missing-value tokens; plot library; validation target machine and limits; and whether byte-buffer Serde is used.

## 6. Disposition of every supplied criticism

| Criticism | Disposition | Application in this revision |
|---|---|---|
| C1 — Parser diagnostics and issue applicability | **Accept, with pinned-release applicability unresolved.** | Narrow strict-width claim to expected/actual field counts and a position field. State that flexible mode turns off the library width check. Add app-owned source-record ordinal and byte offsets; separate physical lines and validate them by release-specific regression cases. Add both open issue reports as risks, not fixes or proof of a 1.4.0 defect. Make invalid-text-byte handling explicit. |
| C2 — Time support for plots and totals | **Accept.** | Gate comparison on timezone, interval boundaries, measure/statistic, support, units and coverage. Prohibit silent interpolation, shifting, prorating, or aggregation. Sum only known suitable interval accumulations with a stated boundary and overlap/coverage policy; never sum rates. Preserve stage maximum with time as a candidate. |
| C3 — Unsupported “ten named stations” | **Accept.** | Correct to “ten stations in scope”; the user assigns identities during import. Keep names, files, coordinates, sensor history, datum, intervals, and conventions unknown until supplied. |
| C4 — Database versus file/database atomicity | **Accept with bounded wording.** | Limit SQLite atomicity to database changes in a transaction under the selected configuration. Add a staged source-file copy/hash/register sequence, reopen reconciliation, and explicit mismatch handling as a proposal. Recovery is not tested; filesystem assumptions must be verified. |
| C5 — Export portability and performance acceptance | **Accept.** | Distinguish packages with source bytes from hashes/references and disclose that omitted bytes require separate source access. Require a named laptop and product-defined observable limits before a pass/fail performance result; invent no numeric thresholds. |
| C08 manifest label conflict found during source check | **Correct the evidence metadata claim; retain parser decision.** | C08 bytes say 0.1.13 while its map label says 0.1.11. C12 is a 0.1.11 version requirement on a path dependency, not an exact package pin. Do not present C08 as exact-version proof. |

There is no substantive disagreement with C1–C5’s requested product corrections. The unresolved matters are evidence applicability and future product choices, not silent rejection of a criticism.

## 7. O1–O6 coverage

| Obligation | Disposition and coverage |
|---|---|
| O1 — Open discovery | **Preserve, bounded.** Keep HydroShare, USGS, CoCoRaHS, W3C, ODM2, and SQLite findings as analogies/mechanisms with network and scope limits. No new broad discovery was conducted. |
| O2 — Pinned code and governing context | **Preserve and narrow.** Identify csv 1.4.0 commit, strict/flexible behavior, caller/state path and tests. Add physical-line uncertainty, issue reports, and the C08/C12 version metadata correction. Do not claim a product parser result. |
| O3 — Issue/fix/regression/release | **Preserve with limits.** No relevant issue was established as a strict-width defect/fix. The 2018 byte-buffer fix and test are present in the researcher’s captured release history but depend on that Serde path. Issues #395/#422 are reports, not fixes; #422 postdates the release, and exact pinned-release applicability is unresolved. |
| O4 — Every frozen plan choice | **Covered.** Section 4 compares each P1–P6 choice with retain/specify/defer/reject/uncertain dispositions and evidence limits. |
| O5 — Candidate criticism | **Covered.** Section 6 records each criticism C1–C5 and the captured-manifest discrepancy; no criticism is omitted. |
| O6 — Complete proposed-change artifact | **Covered.** Sections 1–8 provide the full replacement plan, rationale, alternatives, uncertainty, comparison, criticism dispositions, and proposed validation. Tests and product work remain unexecuted. |

## 8. Proposed validation only; not executed

1. **Import identity/idempotence:** import identical bytes and profile twice; verify duplicate-candidate detection without overwrite or double count. Apply a new profile to the same bytes and verify the new interpretation links to the original source and preserves the prior batch.
2. **CSV structure and diagnostics:** fixtures with quoted commas/newlines, LF and CRLF, blank records, duplicate/empty headers, missing required headers, extra columns, malformed quotes, and short/long records followed by another record. Exercise strict and any explicitly supported flexible profile. Compare app-owned source ordinal and byte offsets with original bytes; test physical line numbers separately and label them. Verify flexible mode preserves actual width and unassigned cells while app-level required/extra-field checks run.
3. **Text bytes and decoding:** test invalid UTF-8 bytes. Verify the declared policy rejects with reviewable diagnostics, retains bytes, or decodes only under explicit user choice. Never silently coerce. Test byte-buffer Serde behavior only if the implementation actually uses that path.
4. **Timestamp, support, and units:** fixtures for ambiguous day/month dates, local and offset-bearing times, daylight-saving ambiguity, missing timezone, missing-value sentinels, changing units, interval totals, rates, overlapping intervals, and instantaneous stage. Require deliberate profile choices or a visible unresolved state; verify original text/value/unit remain available.
5. **Station history and review:** change a sensor or effective-dated metadata mid-season and verify earlier observations remain linked to the prior revision unless explicitly reinterpreted. Exercise duplicate, gap, repeated-value, configured-threshold, date-shift, and overflow prompts; verify prompt context and append-only disposition without mutating reported values.
6. **Comparison and summary:** use compatible and incompatible supports, units, windows, and gaps. Verify incomparable series are qualified; rainfall totals state boundary and partial-coverage treatment and do not sum rates or double-count overlapping accumulations; stage maximum includes its time. Confirm no output implies flow or flood risk.
7. **Export/reopen/offline:** export with and without source bytes, reopen offline, and compare hashes, values, interpretations, annotations, flags, summary definitions, and uncertainty note. Verify a hash/reference-only package discloses its source-access limitation and unresolved flags/gaps remain visible.
8. **File/database recovery and scale:** interrupt at source staging, hash completion, move/register, database commit, and reopen reconciliation boundaries. Verify incomplete imports are detected and recoverable without silent deletion or false source availability. Verify foreign keys on every connection. On a named normal-laptop profile, benchmark a synthetic two-million-record fixture using product-defined import, query, memory, and plot-interaction limits. All are proposals; no fault injection or benchmark has run.

## 9. Remaining product questions

1. Which actual volunteer export shapes, timestamps, time zones, reporting periods, units, and missing-value tokens must the first profile support?
2. How will station identity, coordinates/reference system, stage datum, sensor replacements, and unknown metadata be supplied and shown?
3. Which temporal-alignment and partial-window rules are acceptable for plots and rainfall summaries?
4. Should alternate human-entered values be in the MVP, or are annotations sufficient?
5. When does a review package count as portable, and what should the default source-file inclusion choice be?
6. Which machine and measured limits define the two-million-record target?
7. Does the implementation use byte-buffer Serde, and what exact invalid-text-byte policy applies?

## 10. Evidence index

Evidence identifiers resolve through the adjacent source-map.json to byte-for-byte copies under sources/, their original captured paths, SHA-256 hashes, URLs, and locators. Researcher sources S01–S19 support the retained discovery and component-history claims. Critic captures C01–C07 and C09–C14 support the bounded pinned-source, issue, and fix claims. C08 is retained as a captured byte file but its map label conflicts with its content as described in section 3. No new public source was fetched.
