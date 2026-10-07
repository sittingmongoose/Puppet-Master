# Revised sandbox plan — Harbour water-level comparison notebook

**Stage:** I-FAST-02/control/reviser-v1  
**Status:** complete final revision; **classification:** DIAGNOSTIC_UNQUALIFIED  
**Native Goal identity:** 01a11835-4b0c-7380-9962-5afc355463c2  
**Input boundary:** exact frozen input map, predecessor research draft/source map, predecessor critic/source map, and the captured source bytes declared by those maps. No new public discovery or capture was performed.  
**Evidence index:** [source-map.json](source-map.json); linked captures are under [sources/](sources/).

This is a complete proposed sandbox plan, not implementation, a numerical study, or product validation. It keeps the inherited brief and plan scope, incorporates the critic’s supported changes, records unresolved decisions, and distinguishes captured facts from proposals and inferences.

## Decision summary

Retain the two-volunteer-location, one-public-reference-station, one-month, local/read-only comparison. Keep NOAA CO-OPS and pandas merge_asof as candidates, with pandas 1.1.1 used only as an immutable historical behavior specimen. Preserve raw inputs and competing interpretations. Suppress residuals when interpretation is unresolved or a duplicate public timestamp makes the chosen reference row ambiguous. Do not choose a default matching interval or tolerance until an owner provides a rationale tied to the volunteer time convention, cadence, and comparison purpose. A finer prediction interval does not establish finer accuracy or create independent observations.

No station, month, geography, volunteer datum, time convention, cadence, mapping, summary metric, or privacy/retention policy is inferred here. No application test, product-data check, build, performance measure, or usability check was run.

## Brief-led discovery and evidence

The supplied research artifact separates three questions: what volunteers recorded, what a public tide product represents, and whether a comparison is defensible. The captured CO-OPS documentation distinguishes measured water_level from predictions, documents preliminary/verified water-level fields and flags, requires a datum for water-level products, and offers distinct GMT, fixed local standard time, and daylight-adjusted local time modes. These are reference-product semantics; they do not establish comparability to a volunteer instrument. [S1–S2]

The captured Metadata API documentation lists station resources for datums, superseded datums, sensors, station details, benchmarks, and tide-prediction offsets. The NOAA prediction help distinguishes harmonic stations, which can return interval predictions, from subordinate stations, which return high/low predictions based on adjustments to a harmonic reference station. NOAA applies quarterly prediction updates that may affect station type, offsets, or reference station. A subordinate product’s internal reference station is not a second comparison download in this notebook. Capture the metadata returned with each request; later metadata must not rewrite an earlier response. [S3–S6, S9]

NOAA describes predictions as harmonic calculations and states that accuracy varies by location; short-term weather and other effects alter observed levels but are not represented by astronomical tide predictions. The residual therefore describes a difference from the named downloaded reference product only. It is not a volunteer-instrument accuracy score, weather attribution, surge estimate, calibration target, or navigation signal. [S7–S8]

For alignment evidence, pandas v1.1.1 is pinned to commit f2ca0a2665b2d169c97de87b8e778dbed86aea07. The public wrapper and _AsOfMerge path expose direction, tolerance, exact-match control, sorted-key requirements, and the dispatch into the matching kernel. The Cython nearest kernel selects the backward candidate when backward and forward distances tie. With duplicate right timestamps, the inspected kernel’s result depends on sorted row order: backward matching reaches the last eligible duplicate, forward matching reaches the first; nearest uses the backward result on an equal-distance tie. This is implementation behavior, not an acceptable implicit product policy. [S14–S16]

Issue #35558 reports an UnboundLocalError in the incompatible-tolerance error path when both index keys and tolerance are used. PR #35654 changes the dtype expression used to form that error message from lk.dtype to lt.dtype, and the fix appears in the v1.1.1 source and release note. The added test covers successful compatible matching. A captured maintainer review says it passes without the code change. This is evidence of release applicability and a weak regression detector, not evidence of tide-domain correctness or matching accuracy. [S10–S19]

## Complete proposed replacement sandbox plan

### Scope and non-goals

Keep the frozen scope: two volunteer locations, one public reference station, one month, and local/read-only review. The notebook does not provide navigation guidance, surge prediction, weather attribution, causal event labels, autonomous recalibration, model fitting, data publication, or third-party account synchronization.

NOAA CO-OPS is the research-supported first public-source candidate. Another explicitly authorized public service may be considered only after its station, datum, time, interval, and quality semantics are documented. This revision does not select a station, geography, month, volunteer convention, or service deployment. Exact volunteer coordinates remain local; exports use privacy-safe labels.

### P1 — Inputs and provenance

1. Import the two volunteer CSVs and one authorized public reference download as read-only inputs. Preserve every as-received file and public response byte-for-byte. Record a stable source identifier, local filename, retrieval/import time in UTC, requested dates and exact request parameters, returned station ID and metadata, product, prediction type, unit, datum, time-zone mode, response format, quality state and flags where present, and a cryptographic hash of the captured bytes.
2. For a candidate NOAA reference, retrieve and snapshot the station metadata used for that request, including the returned station details and prediction classification, applicable datums and superseded datums, sensors/status, benchmarks, prediction offsets, and subordinate reference identifier where present. Store the response and request-time capture together. Do not use current metadata to revise the meaning of an older saved response. NOAA prediction definitions may change quarterly. [S1–S6, S9]
3. For a continuous prediction series, verify the selected station’s type and interval-product availability in the returned metadata at retrieval time. If it is subordinate, preserve its high/low predictions and show event-level comparisons only. Do not interpolate subordinate high/low values into a continuous curve. An internal NOAA reference station remains part of NOAA’s prediction method, not another downloaded comparison station. [S3, S6]
4. Preserve original volunteer height values and timestamp strings. Add separately interpreted columns only after a reviewer records the chosen units, time convention/time zone, measurement reference, and any evidence-backed vertical mapping. Use timezone-aware UTC instants for resolved matching while retaining the input string, parse rule, and applied offset. Leave ambiguous, nonexistent, malformed, or otherwise unresolved civil times unresolved; do not guess a daylight-saving fold or offset.
5. Represent each volunteer location as one or more explicit observation epochs. Record effective start/end or unknown boundaries; a privacy-safe location label; known installation, configuration, sensor, reset, staff, or logging changes; height reference and units; timestamp convention; expected cadence if known; and source notes. A known change starts a new epoch. An unknown history is recorded as uncertainty rather than filled from NOAA metadata.
6. Keep private location identifiers, exact coordinates, original filenames, and free-text comments out of exports unless a later product decision explicitly allows disclosure. Use stable internal source IDs and export-safe labels by default. Do not upload, contact a third party, or mutate the public service.
7. For a one-month example, honor the CO-OPS request length for the selected product and preserve each request/response chunk if splitting is required. The captured API documents a one-month limit for 6-minute water_level retrieval and a shorter limit for one-minute observed water levels; these observed products are not a substitute for prediction intervals. [S1]

### P2 — Comparability and unresolved cases

1. Show a review card for each volunteer epoch and the selected reference series: source and station/product, unit, datum or measurement reference, timestamp convention and zone/DST rule, cadence, quality state, and effective dates. A reviewer declares the interpretation used for each view.
2. Require a declared common unit and a compatible vertical reference before calculating residuals. Preserve raw heights and each transformation separately with input/output units, datum labels, conversion or mapping evidence, responsible reviewer, and time of choice. A datum label alone does not establish a transformation. NOAA’s station datum is station-specific and does not establish the volunteer instrument’s reference plane. A numeric offset chosen only to reduce residuals remains rejected as circular.
3. If a required reference, time interpretation, unit, or mapping is unknown or conflicting, permit a raw-series plot and preserve competing interpretations, but suppress residuals and combined summaries until resolved. Never imply that NOAA metadata fills a volunteer record.
4. Normalize only resolved timestamps to UTC. Display the original time string, parse rule, and offset beside the interpreted instant. Require a declared volunteer convention for daylight transitions.
5. Keep comparisons separate by volunteer location and epoch. A single NOAA station does not establish that either volunteer location shares its phase, amplitude, or vertical reference. Do not present station distance as evidence of representativeness. Any privacy-safe distance display would require a separate owner choice and would remain descriptive.
6. Record a per-view comparison declaration: volunteer location/epoch, reference station and product, datum/unit rule and evidence, time parse rule, matching method, selected interval if applicable, finite tolerance and its rationale, duplicate policy, quality/flag inclusion choice, residual sign, and reviewer/date. Preserve competing interpretations without overwriting them.

### P3 — Analysis and display

1. Provide a month view with raw volunteer points, interpreted volunteer series, selected public prediction series, and an optional separately labeled public observed-water-level series from the same reference station if authorized and available. Keep predictions and observations distinct. Define residual sign as volunteer interpreted height minus selected reference-series height and show that wording in charts, tables, and exports.
2. Leave the default alignment method unresolved until the product owner chooses among these distinct options:
   - **Exact timestamp join:** simple and auditable; may leave more volunteer rows unmatched.
   - **Nearest reference sample with finite tolerance:** candidate for irregular volunteer timestamps. The owner must state a tolerance rationale tied to the recorded volunteer time convention/cadence and the comparison purpose. “Sufficiently fine” is not a scientific value supplied by these sources. Show the matched reference timestamp, offset, source interval, tolerance, and unmatched reason for every volunteer row. Do not use unbounded as-of carry-forward or bridge a data gap.
   - **Linear interpolation:** optional derived value only when the owner accepts it, both bracketing samples are present, and the result is separately labeled as interpolated. Do not apply it to subordinate high/low predictions.
   
   NOAA documents several prediction intervals for harmonic stations. A one-minute interval, when the selected station and service support it, is a requested model-output spacing, not evidence of one-minute measurement or prediction accuracy and not an increase in independent information. Interval selection remains an owner decision. [S1, S6]
3. Preserve every reference row. Flag duplicate reference timestamps before matching. Default behavior is to suppress residuals for an affected timestamp until a reviewer resolves it. A product owner may later approve a deterministic, evidence-backed deduplication policy; that policy must retain all original rows, identify the selected/rejected rows and rationale, and appear in the view declaration. Never silently inherit a library’s input-order choice.
4. Keep duplicate volunteer rows as separate source observations and flag them. Do not count repeated observations that map to one reference sample as independent validation evidence. Do not silently deduplicate either input.
5. Mark missing observations and reference gaps. Calculate expected-coverage percentages only when the volunteer epoch has a declared expected cadence; otherwise report row counts, observed timestamp spacings, and gaps without inventing a denominator. Retain excluded rows and report how many were excluded and why.
6. Keep summaries small and descriptive: matched/unmatched counts, coverage only where justified, and optional per-location/per-epoch residual summaries for the declared matched subset. Mean, median, and spread are candidate metrics requiring product-owner selection. Never combine epochs without a visible choice, infer independence from dense samples, report statistical significance, or claim that sample count validates site accuracy.
7. Let reviewers add notes tied to time ranges. Automated astronomical high/low markers may be shown only when sourced from the selected prediction product and labeled as predictions. Do not add causes such as storm, surge, sensor failure, or unsafe water level without separate evidence and product approval.

### P4 — Review, provenance, and export

1. Record source IDs/ranges, exact retrieval request and time, request/response hashes, station metadata snapshot, volunteer epoch history, interpretation and matching declarations, reviewer identity/label chosen by the user, comments, and superseded competing interpretations. Edits are review annotations; imported source bytes are never rewritten.
2. Allow two or more interpretations to remain available until a reviewer chooses one for a view. Record who chose which view and when. A changed choice creates a new review state; it does not silently revise an older export.
3. Exported figures and tables identify the source station/product, month, retrieval time, prediction type, units/datum and evidence-backed mapping, time-zone rule, volunteer epoch, residual sign, matching method/interval/tolerance and rationale, duplicate treatment, coverage basis, quality/flag treatment, unresolved warnings, and privacy-safe labels. Redact or replace filenames, comments, and labels that could reveal volunteer identity or exact location.
4. Include this adjacent interpretation limit wherever residuals appear: the comparison is descriptive and does not establish navigation guidance, surge/forecast output, calibration, or physical equivalence between a volunteer site and the selected reference station.
5. A screenshot alone is not a reproducibility witness. Rebuild the declared tabular output from byte-identical inputs and the same saved decisions.

### P5 — Components and local operation

1. Keep the notebook local after authorized downloads. NOAA CO-OPS is the first public-client candidate because the captured documentation separates observations and predictions and documents datum, unit, time-zone, and metadata choices. The NOAA web interface is a manual inspection analogue, not evidence that NOAA is the only suitable provider. Capture exact requests and returned bytes; later requests do not replace the original inputs. [S1–S6]
2. pandas merge_asof is an unqualified alignment candidate, not a selected deployment dependency. The inspected v1.1.1 tag resolves to commit f2ca0a2665b2d169c97de87b8e778dbed86aea07. Its wrapper/_AsOfMerge path requires ordered keys and exposes direction, tolerance, and exact-match controls. The historical nearest kernel selects backward on an equal-distance tie; for duplicate reference timestamps its result depends on sorted input order. It matches records and does not interpolate. These facts support only a transparent bounded-match mechanism after the product policy is settled. They do not establish suitable matching policy, current support, accuracy, or speed. [S14–S19]
3. If pandas is selected during build planning, choose and pin a currently supported version, sort timezone-aware UTC keys, pass an explicit direction and finite owner-approved tolerance, and retain the chosen reference timestamp and offset. Run the proposed fixtures against that selected version. If the dependency changes, rerun them. Never rely on a library default for matching, duplicate handling, or tie behavior.
4. Keep the issue/fix/release history narrow. Issue #35558 concerns the incompatible-tolerance error path with both index keys and tolerance. PR #35654 changes the dtype used to form the error message; the v1.1.1 tag contains that change and the release note. Its added test exercises successful compatible matching, and a captured review says the test passes without the code changes. This is weak regression-detector evidence. Proposed validation must include a valid compatible case and an invalid-tolerance case that checks for the intended exception and absence of UnboundLocalError. This historical issue does not validate tide-series matching. [S10–S19]
5. A small deterministic standard-library binary-search matcher remains a viable alternative for two locations and one month. It can make tie and duplicate policy explicit but adds code and review burden. No performance test was run, and the bounded size provides no evidence-based speed reason to choose either implementation. Plotting library, notebook environment, and packaging remain open implementation choices; local static export is the baseline capability.
6. Coverage, quality flags, version metadata, privacy safeguards, and duplicate review belong in the visible local review experience. Cloud publishing and account synchronization are outside this slice.

### P6 — Acceptance and validation proposals

These are proposed checks only. None was executed against an application, real volunteer data, or a selected implementation.

1. **Timestamps:** fixtures for UTC, explicit offsets, fixed local standard time versus local time adjusted for DST, skipped/repeated daylight-saving wall times, malformed/mixed conventions, duplicate volunteer times, and precision loss. Expected outcome: preserve raw strings; resolve only declared interpretations; leave ambiguous or nonexistent civil times unresolved and visible.
2. **Station and reference history:** snapshot distinct station metadata and prediction station types. A quarterly metadata change creates a new provenance/review state and never rewrites a prior export. Subordinate high/low data cannot enter continuous-interval residual mode.
3. **Vertical reference and units:** fixtures for identical datum/unit, documented conversion, unknown mapping, conflicting mapping, and unit labels without numeric values. Expected outcome: suppress residuals for unresolved/incompatible references while retaining raw plots and competing interpretations.
4. **Alignment:** deterministic cases for exact, within-tolerance, outside-tolerance, equal-distance tie, duplicate volunteer times, duplicate reference times, gaps, one-sided coverage, unsorted/null keys, and separate epochs. Assert the chosen reference row, timestamp and offset. For duplicate reference timestamps, default expected behavior is visible flag plus suppressed affected residual until review; test any later owner-approved rule separately. Confirm no forward fill or interpolation unless explicitly selected and labeled. If pandas remains selected, assert sort/null behavior and both valid-tolerance matching and invalid-tolerance exception behavior; the invalid case must not produce UnboundLocalError.
5. **Prediction interval:** verify the selected station supports the requested interval; label the interval as prediction spacing. Confirm no text treats finer spacing as finer accuracy or independent measurement evidence.
6. **Quality and coverage:** preliminary/verified observations, inferred and QA flags, reviewer exclusions, and unknown volunteer cadence. Retain flag/exclusion counts. Do not calculate cadence-based percentage without a declared expected interval.
7. **Provenance, export, and privacy:** rebuild the same table from identical saved bytes and decisions and compare its rows. A changed metadata snapshot creates a new review state. Check that filenames, comments, labels, and coordinates do not reveal volunteer identity or exact location. Verify exported context includes all declarations, duplicate treatment, unresolved warnings, and privacy-safe labels.
8. **Safety boundary:** check that displayed and exported text remains descriptive and not navigation or surge guidance; no metric is labeled calibration or operational prediction.

## Disposition against all inherited obligations O1–O6

| Obligation | Final disposition |
|---|---|
| O1 — Brief-led discovery | Met by the supplied researcher stage and retained. NOAA remains the first source candidate based on the captured products, metadata, datum, prediction type, station-history, and accuracy material. The critic’s point that this is one-provider discovery is accepted: the NOAA interface is only an analogue, and a broader provider comparison is optional rather than a blocker for this one-station sandbox. No new discovery was added here. |
| O2 — Pinned code and governing context | Met as historical mechanism evidence. Retain the immutable pandas v1.1.1 commit, public wrapper, _AsOfMerge caller/validation path, Cython kernel, test, release note, issue, PR, and tag lineage. Do not infer current support or current behavior from that old release. |
| O3 — Issue/fix/regression/release | Partially met and explicitly limited. The issue, narrow dtype-expression fix, tagged release applicability, and release note are supported. The added successful-match test is weak evidence for the original incompatible-tolerance failure because the captured reviewer says it passes without the fix. Retain the proposed negative-path check as unexecuted validation. |
| O4 — Full plan comparison | Met for every inherited P1–P6 section; see the disposition table below. Corrections add provenance/privacy details and define a safe duplicate default without changing scope. Product choices remain open rather than being silently resolved. |
| O5 — Fresh same-family critique | Met by the supplied independent critic. This revision adopts its supported cautions and changes, records disagreement with the proposed default nearest matcher, and leaves product questions explicit. Criticism is not treated as approval. |
| O6 — Complete proposal | Met by this full P1–P6 replacement plan, including rationale, mechanisms, alternatives, already-covered matters, rejection reasons, validation proposals, uncertainty, and proposed-versus-executed distinction. It is not an implementation witness. |

## Disposition against every inherited plan section P1–P6

| Plan section | Disposition |
|---|---|
| P1 — Inputs and provenance | Retain immutable volunteer/public inputs, request and metadata provenance, raw/parsed separation, quality flags, volunteer epochs, and read-only operation. Adopt exact metadata-resource snapshots and export checks for filenames/comments/labels. NOAA metadata describes NOAA’s station only; volunteer history stays user-supplied. |
| P2 — Comparability | Retain reviewer-selected unit/time/reference interpretation, UTC matching only after resolution, competing interpretations, and residual suppression for unknown/conflicting mappings. Adopt evidence and reviewer attribution for transformations; reject numeric offsets chosen to force agreement and distance as proof of representativeness. |
| P3 — Analysis | Retain separate observed and predicted series, descriptive residual, gaps, per-location/per-epoch summaries, optional reviewer annotations, and no recalibration/forecast/causal claims. Preserve exact/nearest/interpolation as distinct choices. Reject an unqualified nearest default; leave interval/tolerance unresolved pending owner rationale. Adopt duplicate-reference flagging/suppression and the one-minute-spacing caveat. |
| P4 — Review and export | Retain immutable inputs, comments, review declarations, competing interpretations, and contextual exports. Adopt stable request/metadata snapshots, new review state after changes, reproducibility check, and concrete filename/comment/label privacy checks. |
| P5 — Components and operation | Retain NOAA CO-OPS, pandas merge_asof, the historical pandas specimen, and a custom matcher as candidates. Clarify that neither pandas v1.1.1 nor any implementation is endorsed for deployment; select a currently supported version or custom matcher during build planning and rerun proposed fixtures. No speed choice is justified. |
| P6 — Acceptance | Retain timestamp, metadata, datum/unit, alignment, quality/coverage, export, and safety fixtures. Add expected duplicate-reference behavior, repeated civil-time outcomes, valid/invalid tolerance paths, prediction-spacing caveat, and privacy disclosure checks. All remain proposals. |

## Criticism-by-criticism resolution

| Critic finding | Resolution |
|---|---|
| Core scientific limits and raw/interpreted separation are sound | Retained in scope, P1–P4 and the descriptive-residual statement. |
| NOAA should be treated as a candidate, not shown to be the only provider | Adopted. Broad service comparison remains optional; NOAA interface is only a product analogue. |
| Historical pandas source supports mechanism but not current support | Adopted. The pinned commit is evidence only; deployment version remains open and must be currently supported. |
| Issue #35558 fix is narrow and its added test is weak | Adopted. State the error-path scope, review comment, and separate proposed negative-path fixture. |
| Metadata snapshot should name exact returned resources/fields and not rewrite past inputs | Adopted in P1/P4 with returned station classification/details, datums, sensors, benchmarks, offsets, and subordinate reference identifier where present. |
| Filenames, labels, and comments can expose a volunteer | Adopted. Export aliases/default privacy-safe labels and an explicit disclosure check; no new publishing feature is added. |
| Datum label is not a documented transformation; record who supplied evidence | Adopted in P2 and P6. Unknown or conflicting mappings suppress residuals. |
| Station distance cannot establish representativeness | Adopted in P2. Distance is not representativeness evidence. |
| Nearest, “sufficiently fine,” tolerance, and interval lack source-determined values | Adopted. The research draft’s proposed nearest default is rejected; matching method, interval, and finite tolerance remain owner decisions with a rationale tied to time convention/cadence and purpose. |
| One-minute interval is not one-minute accuracy or independent evidence | Adopted in P3/P6. A finer interval only changes requested prediction spacing if supported. |
| Duplicate reference timestamps expose order-dependent kernel choices | Adopted. Preserve all rows, flag duplicate timestamps, and suppress affected residuals until reviewed; any later deterministic rule must be approved, evidenced, and disclosed. |
| Duplicate volunteer rows are not independent evidence merely because they match the same sample | Adopted. Preserve and flag them; do not count them as independent validation. |
| Rebuild export and check metadata-state changes; screenshot alone is insufficient | Adopted in P4/P6. |
| Repeated civil times need expected behavior | Adopted. Preserve raw input and leave unresolved times unresolved unless interpretation is declared. |
| Keep the full P1–P6 proposal and all safety limits | Adopted; full sections above retain scope and non-goals. |
| Product choices remain open: station, geography, month, volunteer interpretation, mapping, summaries, interpolation, privacy/retention | Adopted as unresolved choices; none is inferred. |

### Supported disagreement and unresolved objections

The only adjudicated disagreement with the research draft is its suggested default of nearest matching for irregular volunteer timestamps. The critic correctly observes that the captured evidence does not set a scientifically justified tolerance or prediction interval. The revised plan therefore retains nearest matching as an option but does not set it as the default.

There is no source-supported basis in these materials for selecting an exact station, geography, month, volunteer timestamp convention, expected cadence, volunteer reference plane, vertical mapping, matching tolerance, duplicate-deduplication rule, summary metric, event workflow, plotting library, local retention period, or further location disclosure. These remain product-owner decisions. Until required interpretations are resolved, affected residuals stay suppressed. No source supports a performance claim or a numerical residual.

## Rejection and already-covered dispositions

- **Already covered in the inherited plan:** immutable/raw versus interpreted values, user-selected interpretations, comments, gaps, contextual exports, and no autonomous recalibration/forecast are retained and made more explicit.
- **Retained optional additions:** a separately labeled same-station observed-water-level series, station-history snapshot, reviewer-authored event notes, a finer harmonic-station prediction interval, and per-epoch descriptive summaries; each requires authorization, station/product support, and/or an owner choice.
- **Rejected in this slice:** one-minute observed water-level retrieval for a full month where the documented product limit is shorter; continuous interpolation of subordinate high/low values; automatic datum offsets chosen to minimize residuals; unbounded carry-forward or silent gap filling; hidden duplicate handling; weather/surge attribution; navigation thresholds; cloud publishing; and claims of calibration or station accuracy.
- **Open options:** exact join, finite nearest join, or explicitly labeled interpolation; pandas or an explicit standard-library matcher; predictions alone or an optional observed series; mean/median/spread summaries; and figure/export formats. No option is silently selected.

## Provenance, operations, timing, and validation status

The research and critic source maps supply source URLs, capture paths, hashes, access/version notes, and operation counts. This reviser used only those local captures and exact predecessor files; it made no web searches, external requests, recaptures, application calls, or product-data checks. NOAA captures are live-documentation snapshots from 2026-10-07; the Metadata API page identifies v1.0. pandas source is v1.1.1 at immutable commit f2ca0a2665b2d169c97de87b8e778dbed86aea07. Public issue/PR records are captured snapshots from the dates and versions recorded in the maps.

The critic reports two web-search calls/six queries, one web-open call/five primary pages, 20 direct HTTPS attempts, 14 saved bodies, and six GitHub API 403 responses; four public GitHub HTML pages were saved instead. The research source map reports 11 search queries, 20 page opens, two clicks, 13 in-page finds, 23 direct GETs, 21 captured files, and two repeated GETs that overwrote earlier captures. These are predecessor-stage operations, not reviser operations. Full source indexes and byte hashes are linked through this stage’s sources directory.

First useful finding was recognized during review of the exact critic artifact; the precise instant was not separately clock-sampled. The first clock-confirmed checkpoint by which the finding was present was 2026-10-07T21:13:11Z. The complete-output time is recorded in source-map.json after the final artifact write.

The supplied stage deadline is 2026-10-07T21:26:47.401356+00:00; the unchanged whole-arm deadline is 2026-10-07T21:28:26.855867+00:00; reserve is 0 seconds within the original 2700-second aggregate occupied ceiling. No clock reset or extension was used.

All P6 checks remain proposals. No application, real volunteer data, build, performance measurement, or usability validation was executed. Reviser token counts and billing are unknown/null; no billing is inferred from file reads or tool calls. Native Goal counters are separate and are exposed from the actual terminal Goal response.
