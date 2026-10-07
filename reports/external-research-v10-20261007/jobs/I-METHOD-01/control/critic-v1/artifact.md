# Independent candidate critique — I-METHOD-01

**Stage:** critic-v1; critique only. This is not the final revised plan.  
**Inputs:** the frozen brief and plan and researcher artifact/source map named in input-map.json. Their observed SHA-256 values match that map: brief d47b145147b0b0e58ded1a585bd004014268471b5d7da66587028c5a242176f9; plan 3e41046c9f0ea6e7ff7223d6ba1d949190e42b36e72914c2720c152bc316c822; draft c02dc05f249ddfa9718b6b8aa9aa670354c35e9516b4979be3c4e61c09709a6b; researcher source map d7fa5eb1c3d4d6963ef07e18988ebb56731fa52c0cbeb1a12959e42cff03ab68.  
**Independence:** no predecessor-arm/evaluator/other-case material was used. Public primary-source checks and new captures are recorded in source-map.json.

## Overall assessment

The draft is a strong, safety-conscious operationalization of the frozen plan. Preserve its observation-versus-entry-time distinction, interval semantics, immutable original, reversible annotations, flags as review prompts, explicit no-forecast/no-stage-to-flow boundary, conditional performance claim, and proposed-versus-executed validation distinction.

The most consequential correction is to narrow RainfallQC from evidence of a fixed implementation defect to evidence about that version’s implementation and a limited regression. It does not establish that the test is statistically suitable for this watershed. The full-plan obligation is also not yet satisfied: open discovery lacks a direct workbench/product comparison and a plotting-component comparison; the final must disposition those gaps rather than leave O5 pending. Add an export privacy choice and define import atomicity across both the database and original-file storage.

## Findings and required dispositions for the final reviser

### O1 — Discovery from the user need: partial; material gap

**Preserve:** the draft went beyond the frozen plan. CoCoRaHS provides directly relevant observer-time, accumulated-rain, correction, follow-up, and valid-outlier examples. USGS provides a staged professional review/audit analogy; SensorThings and STAplus provide vocabulary; SQLite and csv provide implementation evidence; RainfallQC provides a focused QC library example.

**Correct/complete:** none is an end-user local workbench for this volunteer network. The draft names no comparable desktop product and gives no sourced comparison of plot alternatives, despite P5 leaving plotting undecided. It also does not show why SQLite wins among plausible local stores beyond transactions. This is an O1 discovery gap, not proof that alternatives do not exist. The final should either examine at least one directly comparable product and concrete plot/store candidates using primary sources, or state a bounded search and the reason no candidate applies. Keep the plot choice open until a small prototype compares interval totals, point stages, gaps, overlays, flags, accessibility, and two-million-record responsiveness.

### O2 — Pinned component behavior: mostly sound, one governing detail

The pinned RainfallQC identity is well supported: release v1.0.2 resolves to commit 150717eba097ccd771920181b13ce957950a8a59; that commit’s gauge_checks.py contains check_temporal_bias; the framework maps QC3/QC4 to it; and run_qc_framework is a caller. The release notes name the temporal-bias fix. The function groups by weekday or hour, computes the overall mean, skips groups with fewer than two values, runs a two-sided one-sample t-test for each remaining group against that overall mean, then returns 1 if any p-value is below 0.01. The newly captured all_qc_checks.py shows the decorator also rejects negative target values. Keep these exact conditions and the distinction between captured code inspection and execution.

The researcher capture did not include the decorator definition even though the function has behavior-bearing require_non_negative=True. The critic capture now supplies that exact pinned file. The final should cite it alongside the function, mapping, caller, and test. Do not characterize CSV parsing as semantic validation: csv 1.4.0 can expose records/positions and certain errors, but its own documentation describes a permissive parse-first approach. Define supported delimiters, encodings, quoting, decimal/date conventions, missing/trace values, and application-level row validation from actual volunteer files; none were provided in this bounded input slice.

### O3 — Issue/fix/regression/release: history verified; applicability is narrow

Issue #120 describes the aggregate-of-group-means false negative and proposes testing groups individually or another test. PR #123 changes the implementation to test each group and changes the existing daily GSDR fixture expectation from 0 to 1. The PR merged to dev on June 29, and v1.0.2 release/tag evidence plus the pinned code confirms the fix is present in that release. Preserve this positive lineage; do not call it an invented issue or merely planned fix.

Material limitation: the cited regression is the existing GSDR fixture expectation change, not a dedicated synthetic reproduction of the issue’s Monday-only example or a validation of this app’s data. The method tests up to seven weekday or 24 hour groups with the same unadjusted p-threshold and returns true if any is below threshold; each group is compared with an overall mean computed from the same observations. The captured sources do not establish calibration, power, false-positive rate, or suitability under sparse groups, zero-heavy/skewed rainfall, serial dependence, missingness, or one-season data. Keep the method as a cautionary optional reference, not a recommended MVP rule. If it is ever adopted, propose tests for a synthetic false-negative reproduction, null/no-bias behavior, group-size/missingness boundaries, repeated testing, effect sizes, and a justified decision rule/threshold. Do not say those tests ran.

### O4 — P1–P6 comparison: all frozen choices retained, but scope and product decisions need tightening

| Plan | Critic disposition |
|---|---|
| P1 Inputs/identity | Keep preview, mappings, immutable batches. Observation time versus entry/import time and interval totals are strongly supported by CoCoRaHS. Add explicit source timezone/zone and ambiguity/fold handling only when known; do not manufacture UTC. Distinguish parser record position from a stable source-row identity. Exact source-cell duplication is redundant with preserved file bytes unless a concrete retrieval need justifies its storage cost. |
| P2 Data model | Keep raw/interpretation separation, sensor-history dates, and overlap review. Do not imply an append-only event log is already required; specify which user decisions must be retained and how they are revised. Local provenance may retain volunteer/source identifiers, but public exports need a separate privacy/redaction choice. Filenames and file hashes can disclose or link a contributor’s file; the draft’s rule that source names and hashes always remain in the share manifest is not yet justified by the brief. |
| P3 Review | Retain manual review, non-correction, non-flow constraints, explanations, and “insufficient data” outcomes. Make the MVP priority narrower: ingestion integrity, visible gaps/semantics, annotation, and export first. Range/rate, stuck-value, neighbor, and temporal checks depend on actual instrument metadata, cadence, overlap, and chosen policy; the draft itself lists these as unknown. Defer or mark unavailable until those inputs and thresholds are chosen. |
| P4 Comparisons | Keep raw values visible and interval-aware alignment. Add an explicit distinction between rainfall accumulation windows and stage event times; document unit and stage datum/reference. Any binning needs a declared coverage rule and provenance. No interpolation or causal/risk inference is supported. OGC is vocabulary guidance, not a schema/API mandate. |
| P5 Components/operation | SQLite is plausible, not yet selected by workload evidence. Its documented atomic transaction guarantee concerns database transactions; it does not atomically cover original files kept separately in a project directory. Define a recoverable staged-file plus database commit protocol and test interruption, rollback, orphan cleanup, and recovery. Benchmark import/query/plot/export on a specified laptop and representative fixture before claiming capacity. Keep csv as a syntax-reader candidate pending real input formats. |
| P6 Output/acceptance | Preserve the review package and uncertainty. Separate internal provenance from shareable identity fields and make original-file inclusion/redaction explicit. Define round-trip: reopening a project can retain local IDs; importing a package elsewhere cannot promise the same local sample IDs unless the package defines stable source identities. Acceptance should verify package identity/linkage and privacy behavior. HTML/CSV/JSON versus PDF remains a user decision, not an evidence-backed choice. |

The source-backed points are not product mandates. CoCoRaHS’s snow and daily-report semantics may not match every watershed CSV; use it as a cautionary analogue and confirm each file’s meaning. USGS working/analyzed/approved and audits are a professional, second-hydrographer policy; the draft correctly rejects importing that assurance label into a single-user volunteer app. The QA/QC PDF describes both CoCoRaHS manual follow-up and separate NCEI/GHCN-D checks. When citing its sequenced checks/flags, identify the NCEI/GHCN-D section rather than imply those exact algorithms are CoCoRaHS’s own app or this project’s policy.

### O5 — Criticism and O6 — complete proposed-change artifact

This critique accepts the core safety boundary and most P1–P6 operational additions. It disagrees with treating the temporal-bias method as stronger evidence than its narrow regression supports, with always exporting source names/hashes, and with treating SQLite atomicity as the whole file-plus-database import boundary. The unresolved choices above should remain explicit.

The researcher draft is complete as a proposal but explicitly leaves O5 pending. It is therefore not yet a complete final artifact under the brief. The final reviser must retain these dispositions (accept, correct, defer, or leave unresolved with reason), complete the direct-product/plot discovery gap, and keep every test under Proposed validation unless actually run. No application or acceptance checks were run in this critique.

## Validation proposals to carry forward

1. For real sample files: map every column, time convention, unit/datum, missing/trace marker, encoding, and duplicate/overlap case; retain a byte-identical original and traceable parsed row.
2. Exercise ambiguous local times, daylight-saving transitions, interval rainfall with point-stage observations, no-data versus zero, and explicit user-chosen bin/coverage rules.
3. Test interrupted import at each boundary between source-file staging and SQLite commit; verify no half batch is visible and that recovery removes or reports orphaned files.
4. Test source-volunteer identity redaction, source-file inclusion, and export manifest contents before sharing; verify project reopen separately from cross-project package import.
5. Define one benchmark fixture and laptop; measure import, query, rendering, and export at two million records. Report measured values only after execution.
6. If adding statistical QC, validate false positives and false negatives on representative and synthetic data, document assumptions, and expose each result as a review flag with data/config/version lineage.

## Activity and counters

- Goal identity: native receipts in native-receipts.jsonl; fresh Goal was created and initial get verified active under the same thread identity.
- Useful finding time: 2026-10-07 19:19:39 UTC — pinned function/PR review established that shipped regression evidence is a fixture expectation change and the method has per-group unadjusted testing. Further primary-source checks refined the finding.
- Critique completion time: recorded in the terminal Goal receipt; artifact and source map were saved before marking the Goal complete.
- Observable operations: read the six exact mapped input/control files; read targeted researcher captures for RainfallQC function/mapping/caller/test/metadata and selected source-map captures; made one four-query web search, five web source-read/navigation calls, and eight successful fresh public HTTP captures (one attempted wrong decorator path returned 404; correct pinned path was then captured). No repository scan, downloaded-code execution, application build, test, or acceptance run.
- Distinct native counters: public web tool calls 6; web search queries 4; successful fresh HTTP source captures 8 (163002 bytes); failed HTTP capture attempts 1; exec_command attempts 32 including one rejected cleanup command; native Goal create calls 1, initial get calls 1, terminal update/get calls 1 each. These are tool-operation counts, not model token counts.
- Token accounting: aggregate Goal tokens/time are reported only by the native Goal counters in the initial and terminal receipts. input_tokens=null; cached_input_tokens=null; generated_tokens=null; reasoning_tokens=null; billing=null. No token budget was requested.
