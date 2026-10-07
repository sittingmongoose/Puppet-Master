# Independent candidate critique — Harbour water-level comparison notebook

**Stage:** I-FAST-02/control/critic-v1  
**Status:** complete independent critic artifact; fresh final reviser still required  
**Classification:** DIAGNOSTIC_UNQUALIFIED  
**Native Goal identity:** 01a1182b-ede1-70e1-9fdd-d0d91630dcb3  
**First useful finding:** 2026-10-07T21:04:53Z  
**Complete output:** 2026-10-07T21:10:59Z (clock time immediately before final file write)  
**Evidence:** [source-map.json](source-map.json), with independently captured public-source bytes in [sources/](sources/)

This is a criticism of the full researcher proposal, not a replacement plan or implementation. It is based on the frozen brief and plan, the complete research-v1 artifact and source map, the declared source captures, and independent public-source queries/captures. No application, volunteer data, numerical summary, performance measurement, or product validation was run.

## Overall assessment

The research-v1 proposal is unusually careful about the core scientific limits: NOAA predictions and observations remain distinct; a residual is not a gauge-accuracy score, forecast, weather attribution, or navigation signal; datum/time ambiguity suppresses residuals; raw values and source bytes remain reviewable; and the chosen station cannot establish equivalence to either volunteer site. Retain these decisions.

Carry pandas merge_asof only as an unqualified candidate. The pinned v1.1.1 source supports the documented nearest/tolerance mechanism and backward tie rule, but the cited regression concerns an error path and does not establish correctness of tide-series matching. The proposal already acknowledges that weakness; the final should preserve it prominently. More importantly, the proposed fixtures name duplicate reference timestamps without defining what a user should see. The inspected kernel selects a row by input order in that condition. Require a visible policy before calculating residuals from duplicate reference records.

Two further limits need to be explicit in the final: a one-minute NOAA prediction interval is a requested model output interval, not evidence of one-minute measurement accuracy or independent information; and a finite matching tolerance needs an owner-approved rationale tied to the volunteer time convention/cadence and comparison purpose. Neither source coverage nor the absent volunteer data can supply those choices.

## O1–O6

| Obligation | Critic disposition |
|---|---|
| O1 — brief-led public discovery | Substantially met. The draft starts from the distinction among volunteer observation, public prediction, and defensible comparison, and checks NOAA data, metadata, prediction products, station history, and the NOAA interface. The independent NOAA metadata check supports its station-resource claims. Discovery remains narrow to one provider and pandas; treat NOAA web UI as an analogue, not comparative evidence that it is the only suitable service. A broader service comparison is optional, not a blocker for this one-station sandbox. |
| O2 — pinned code and governing context | Met as historical mechanism evidence. The immutable pandas v1.1.1 commit includes the public wrapper, _AsOfMerge caller/validation path, Cython matcher, test, and release note. Preserve the commit and exact path/symbol references. Do not infer current support or current-version behavior from this old release. |
| O3 — issue/fix/regression/release | Partially met with a clearly disclosed limitation. Issue #35558, PR #35654, the v1.1.1 tag source, and release note support the error-path history. The patch changes the dtype expression used to build an incompatible-tolerance error; it does not alter the nearest matching kernel. The added test exercises successful matching, and a maintainer said it passes without the code change. This is weak regression-detector evidence and no evidence of tide-domain correctness. The draft’s proposed negative-path check is the right follow-up; distinguish it from executed validation. |
| O4 — full plan comparison | Met for P1–P6. Retain the row-by-row dispositions below. The unresolved items are product choices and explicit gaps, not a reason to silently replace the frozen scope. |
| O5 — fresh same-family criticism | This artifact supplies independent criticism and positive findings. A final reviser must record which criticism is adopted, rejected with reasons, or left unresolved; do not convert this critique into implied approval. |
| O6 — complete proposal | Research-v1 is a coherent proposed sandbox plan with rationale, alternatives, already-covered matters, rejection reasons, validation proposals, and uncertainty. It is not an implementation witness. Final revision should incorporate the decisions below and retain the proposed-versus-executed distinction. |

## Plan-by-plan dispositions

### P1 — Inputs: retain; tighten source identity

The draft correctly keeps raw volunteer files and public responses, request parameters, retrieval time, returned metadata and flags, and separate volunteer epochs. NOAA’s Metadata API v1.0 documents station-specific datum, sensor, details, benchmark, and prediction-offset resources. It also exposes prediction station type and, for subordinate stations, a reference-station identifier. The final should name the exact metadata fields/resources used to classify the selected station and snapshot them with each request; do not use present metadata to rewrite a past response. Keep NOAA prediction type/reference semantics distinct from the notebook’s one downloaded comparison station. Request/response hashes and exact byte-preserving capture are appropriate provenance.

Privacy constraint is sound. Tighten exports so source filenames, free-text comments, and station/location labels cannot inadvertently reveal a volunteer’s identity or exact location. This is a clarification to the existing local-only/privacy choice, not a new publishing feature.

### P2 — Comparability: retain; require evidence-backed interpretation

Retain the raw/interpreted split, UTC normalization only after a declared time parse, explicit unit/datum mapping, competing interpretations, and suppression of residuals when a needed interpretation is unknown or conflicting. NOAA’s station datum and epoch material cannot determine the reference plane of a volunteer device. A numeric offset chosen to minimize residuals remains circular and should stay rejected.

The final should distinguish a datum label from a documented transformation between references, and should retain who supplied the volunteer reference and what evidence supports it. No distance-to-station value should be presented as representativeness evidence.

### P3 — Analysis: retain; bound sample matching and summaries

The draft’s separate prediction/observation series, explicit residual sign, visible matched timestamp/time offset, finite tolerance, gap marking, per-location/per-epoch summaries, and no causal or operational annotation are supported.

Keep nearest matching optional. “Sufficiently fine” and “maximum allowed time distance” are not scientifically determined by this evidence; leave them as owner decisions and require the chosen policy to be stated in each view. A one-minute prediction request is not a one-minute accuracy guarantee and must not be treated as an increase in independent evidence. Exact joins, finite nearest matching, or explicitly labeled interpolation remain distinct alternatives.

Add a reference-duplicate policy. The inspected v1.1.1 kernel scans duplicates into a per-group hash table: backward matching retains the last eligible row at a timestamp, forward matching retains the first; nearest ties select the backward result. This makes original row ordering consequential. The plan lists duplicate-reference fixtures but not expected user-visible behavior. Preserve all source rows, flag duplicate candidate timestamps, and either suppress the affected residual pending review or adopt and disclose a deterministic, evidence-based deduplication rule. Do not silently accept the library’s row-order choice. Volunteer duplicates should remain separate observations as the draft says; they are not independent validation evidence merely because each maps to one NOAA sample.

### P4 — Review/provenance/export: retain; make privacy review concrete

Retain immutable inputs, reviewer comments, competing interpretations, request/metadata snapshots, and contextual exports. Add a fixture/check that a rebuilt export reproduces the same declared tabular result from the same byte-identical inputs and decisions, while a changed metadata snapshot creates a new review state. Validate labels, filenames, and comments for accidental location disclosure. The screenshot alone is correctly rejected as a reproducibility witness.

### P5 — Components/local operation: retain candidates; do not endorse a deployment version

NOAA CO-OPS is well-supported as the first public source candidate: it separates measured water_level from predictions, provides metadata, and documents time-zone/unit/datum parameters. Harmonic stations support interval predictions; subordinate stations provide high/low predictions, with NOAA’s interface describing their relation to a harmonic reference station. Quarterly changes justify request-time station/prediction metadata capture.

Pandas v1.1.1 is a pinned mechanism specimen, not a sensible implicit deployment pin. The final must require a currently supported dependency/version choice and rerun the proposed fixtures there, or select the small explicit matcher. This is a supportability correction, not a speed recommendation. No performance evidence exists, and the diagnostic label is required.

### P6 — Acceptance: retain; turn named edge fixtures into expected behavior

The listed timestamp, metadata, datum/unit, alignment, quality, export, and safety checks cover the plan. Add expected outcomes for duplicate reference timestamps and repeated civil times; the duplicate rule is currently unspecified. Include valid and invalid tolerance cases if pandas remains selected, and assert that the invalid-tolerance path produces the intended documented exception rather than an unbound-local error. These remain proposals until executed against a selected implementation and isolated synthetic fixtures.

## Source-specific verification and disagreement

- NOAA CO-OPS documentation distinguishes preliminary/verified six-minute water_level, predictions, required datum, time-zone modes, and request limits. Response Help describes observation quality/flag fields. These support the draft’s provenance and separation decisions; they do not prove comparability to volunteer instruments.
- NOAA Metadata API v1.0 documents station resources (including datums, superseded datums, sensors, details, benchmarks, and prediction offsets). The station record exposes tide-prediction type and subordinate reference_id. The draft’s metadata-snapshot recommendation is supported; metadata for NOAA does not establish volunteer epochs.
- NOAA Tide Predictions help says harmonic stations can produce interval predictions and subordinate stations only high/low predictions, with subordinate predictions based on a named harmonic reference station; quarterly updates may change station type, offsets, or reference station. Preserve the draft’s no-continuous-curve rule for subordinate high/low data. Do not read a NOAA internal prediction reference as a second comparison download.
- NOAA’s own product description says harmonic predictions are calculations from constituents; its FAQ distinguishes predicted astronomical tide from weather-driven observed level. This supports “descriptive difference only,” not a site-accuracy claim.
- At pandas commit f2ca0a2665b2d169c97de87b8e778dbed86aea07, merge_asof exposes ordered-key matching and direction/tolerance controls; _AsOfMerge validates inputs and dispatches to asof_join_nearest_on_X_by_Y. The Cython code compares backward/forward differences and resolves an equal distance backward. It does not interpolate.
- Issue #35558 reports a pandas 1.1.0/development regression for both index keys plus Timedelta tolerance. PR #35654 changes only the dtype expression in incompatible-tolerance error construction; v1.1.1 source and release notes include that change. The PR’s test asserts successful matching, and the public review says it passes without the code changes. Thus release applicability is evidenced, but the test does not demonstrate detection of the reported failure, and the fix says nothing about residual validity or matching accuracy. This reinforces the draft’s limitation; it is not a disagreement with the draft’s caveat.

## Required final-reviser carry-forward

1. Keep the entire P1–P6 proposal and all safety/privacy limits; do not substitute a component assumption for unresolved volunteer metadata.
2. Keep pandas unqualified and historical. Preserve issue #35558’s narrow error-path role and weak test coverage; do not call it proof of algorithm reliability.
3. Add a visible duplicate-reference policy, a rationale for tolerance/interval selection, and the warning that finer prediction output does not establish finer accuracy.
4. Preserve source-capture identity, time/version details, and exact disagreement/open decisions. Mark all validation as proposed unless actually executed.
5. Keep station/month/geography, volunteer datum/time/cadence, mapping evidence, summary metrics, interpolation choice, and privacy/retention choices open for the product owner.

## Accounting and execution status

Public research was independent of the prior discovery: two web-search calls with six queries, one web-open call with five primary pages, and 20 direct HTTP GET attempts. Fourteen source bodies were saved under this stage’s sources directory; six GitHub API GETs returned HTTP 403, so corresponding primary HTML pages were captured instead. These are primary public sources. No other case/arm, parent history, evaluation material, private data, external party, or code execution was used.

The original input hashes match the frozen map. No application test, product-data check, build, performance check, or usability check was executed. P6 entries are proposals. Stage-token and billing usage are unknown/null; no value is inferred from tool counts. Whole-arm ceiling, stage deadline, and reserve remain unchanged as supplied.
