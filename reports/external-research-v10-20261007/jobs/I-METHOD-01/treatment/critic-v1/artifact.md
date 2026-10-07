# I-METHOD-01 — independent candidate critique

## Scope and overall judgment

This is an independent critique of the mapped brief, frozen plan, researcher draft, source map, and captured public sources. The draft is a coherent and unusually complete proposed sandbox revision. Preserve its core direction: immutable reported inputs, versioned interpretations, explainable prompts instead of automatic “cleaning,” local/offline operation, explicit uncertainty, and no stage-to-flow inference or warning/forecast claims.

The draft is not ready to pass unchanged. The main correction is that its parser-position evidence and validation do not yet establish the promised row-level diagnostics for CRLF and variable-width files. Also tighten the meaning of temporal comparisons and summaries, correct one unsupported station-identity statement, and distinguish SQLite database atomicity from the combined file-plus-database import operation. These are targeted corrections; they do not require replacing the component choice or expanding the MVP.

## Useful content to preserve

- Open discovery found relevant but bounded precedents: HydroShare’s observation metadata, USGS’s separate stage and precipitation review workflows, CoCoRaHS’s retention of overflow reports while requesting follow-up, PROV-O provenance concepts, CSVW user-supplied metadata, and ODM2 relationships. Keep them as design analogues, not evidence that this volunteer network should adopt their policies, thresholds, or full schemas.
- The CSV 1.4.0 release is pinned to commit 4a3997e91d668ea1d8595bdef15625a77cf2308a. At that commit the wrapper defaults to equal field counts, can report an UnequalLengths error with a position and expected/actual widths, and flexible(true) disables the width check. This is a useful syntax-layer mechanism when paired with app-level profile validation. It does not interpret timestamp, unit, datum, interval support, or quality.
- The 2018 byte-buffer fix is real and present in the audited release: commit 9e644e66db0aa0b931758de1c2b7da555fb632b7 changes byte-buffer deserialization to use raw field bytes and adds a partially-invalid-UTF-8 test; the release ancestry comparison identifies that commit as the merge base. Retain it only as a narrow component-history example. Its direct applicability depends on using the byte-buffer/Serde path; the draft’s proposed manual field mapping does not specify that path. Do not imply encoding detection or normalization.
- The proposed one-season / ten-station workflow, single-user local store, no cloud requirement, unknown-value handling, effective-dated station metadata, separate reported and interpreted values, manual review, explicit uncertainty, and unexecuted validation status all fit the brief. The plan comparison correctly marks many controls as already covered rather than claiming they are newly discovered requirements.

## Material objections and requested dispositions

### C1 — Parser diagnostics and issue applicability (high priority; accept)

The draft says malformed rows will be shown with useful positions and proposes both strict-width and explicitly flexible imports. Independent primary-source retrieval found two open upstream reports directly relevant to those diagnostics:

- Issue #395 reports that Position::line can remain on the previous line after a CRLF record when using the CRLF terminator, with a concrete test case. It was still open in the GitHub response read for this critique. The report concerns Reader position after a record; by itself it does not prove every ByteRecord/error position in every mode is wrong.
- Issue #422 reports miscounted lines after mismatched-width records in csv-core. It was open in the response read here. Because it was filed after csv 1.4.0, it does not by itself establish that the pinned release has that exact defect.

The exact pinned root manifest and csv-core manifest identify the release’s in-tree csv-core dependency as 0.1.11. In the pinned wrapper, the current position’s line is copied from csv-core, and the unequal-width error clones the record position. Those paths make the issue reports pertinent enough that the draft must not promise line-accurate diagnostics without a release-specific regression check. Treat their exact applicability to 1.4.0 as unresolved until checked; do not silently transfer current-upstream reports to the older pinned release.

Keep the claim that strict mode detects width mismatch, but narrow the position guarantee. Amend validation to include LF and CRLF, quoted multiline fields, blank records, a short row followed by another row, and a long row followed by another row, in both strict and any explicitly supported flexible mode. Assert the stable source record ordinal and byte offset against the original file; separately test and label physical line numbers. Do not infer a row identity from line count alone. In flexible mode, add app-level required/extra-field validation and retain each row’s actual width and unassigned cells; the library has turned off its width check in that mode.

Retain the draft’s equivalent 2018 byte-buffer fix history but add these two reports as unresolved diagnostic risks. The draft’s statement that no issue was found for the strict field-count behavior may remain narrowly true; its broader implication that the parser position contract is settled may not. The proposed non-UTF-8 fixture should specify whether invalid text bytes are rejected, retained for review, or decoded under an explicit user choice. Never silently coerce them.

### C2 — Time support must govern plots and totals (high priority; accept)

The draft improves P1 by recording instantaneous versus interval observations, but P4 still says to plot both series on a common time axis and flags compatibility by time window, reporting period, and units. Define compatibility before displaying a cross-series comparison: interpret the time zone and interval boundaries, distinguish instantaneous stage from rainfall amounts/rates/means over periods, and show each interval’s temporal support. Do not silently interpolate, shift, prorate, or aggregate records to make them appear aligned. Any such transformation must be explicit, versioned, and visible in the summary provenance.

Likewise, “rainfall total over the selected interval” is only valid for an identified measure and support. State whether the source is an interval accumulation, rate, or another statistic; define the window-boundary rule and partial-coverage treatment. Do not sum rates or double-count overlapping accumulation intervals. Keep stage maximum plus its time as a candidate summary, with the selected interpretation and coverage shown. This is an inference from the product’s unresolved formats and the draft’s own P1 temporal-support requirement, not a claim that a particular gauge uses one convention.

### C3 — Station identity (small factual correction; accept)

The draft’s replacement P1 says “ten named stations.” The brief and plan provide six gauges plus four stream-level stations, but provide no station names. Change this to “the ten stations in scope”; say that the user assigns identities during import. Preserve the draft’s uncertainty that station files, coordinates, sensor history, datum, sampling intervals, and local conventions have not been supplied.

### C4 — Database atomicity is not file/database atomicity (medium priority; accept with bounded wording)

SQLite’s local-store choice is plausible, and the draft correctly calls out per-connection foreign-key enforcement. The cited atomic-commit page explicitly describes rollback mode and points to a different mechanism for WAL. Keep one database transaction per import batch as a proposal, but state that this guarantees only the database transaction boundary under the selected SQLite configuration.

Raw source files live outside SQLite in the proposed design. A crash during file copy, hash creation, or database commit can therefore leave an orphaned file or a database row whose source file is absent even if the SQL transaction is atomic. Specify a simple staging and recovery policy (for example: write and hash to a temporary project path, then register/rename under a documented commit sequence; detect and report incomplete imports on reopen). Extend the proposed fault-recovery cases to interrupt at each file/database boundary and check recoverability. Do not claim this was tested.

### C5 — Export portability and performance acceptance (medium priority; accept as clarification)

P6 can include original files optionally while carrying their fingerprints and references. Distinguish a portable package containing source bytes from a review package that contains only hashes/references; when originals are omitted, say that recipients cannot independently inspect the source unless they also have the project/source files. Preserve the user’s choice and the draft’s proposal to disclose that limit.

The two-million-record target is correctly described as unmeasured. The planned benchmark should name a representative laptop and define observable acceptance thresholds for import, query, memory, and plot interaction before a result can be called pass/fail. The brief does not supply numeric latency limits, so leave those as a product decision rather than inventing thresholds.

## O1–O6 assessment

| Obligation | Assessment and disposition |
|---|---|
| O1 — open discovery | Substantially met. Preserve HydroShare, USGS, CoCoRaHS, W3C, and ODM2 findings with their stated limits. The captured research supports analogies and metadata needs, not network-specific thresholds or scientific conclusions. |
| O2 — pinned code and governing context | Substantially met. The pinned reader and deserializer code, wrapper call path, field-count definition, tests, and csv-core dependency are identified. Add C1’s error-position limits and release-specific uncertainty before repeating the “useful position” claim. |
| O3 — issue/fix/regression/release | Partly met, with an actionable gap. The 2018 fix/test/release chain is independently supported, but it is indirect for manual field mapping. The new issue reads #395 and #422 are relevant reports, not fixes; #422 postdates 1.4.0 and neither report establishes pinned-version behavior without a release-specific check. Preserve this distinction and do not claim an issue was fixed or shipped. |
| O4 — every frozen plan choice | Substantially met. Keep the P1–P6 comparison and already-covered dispositions. Apply C2–C5, correct “ten named stations,” and keep unresolved profile/format/datum/time-zone/plot choices explicit. |
| O5 — candidate criticism | This critique supplies the missing independent criticism. The final author should record each C1–C5 disposition and any disagreement explicitly. No supplied critique or evaluator material was used. |
| O6 — complete proposed-change artifact | The researcher draft itself contains replacement P1–P6 sections, alternatives, uncertainty, proposed tests, and evidence references. This stage does not rewrite it. Finalization should incorporate the accepted corrections above and keep proposed checks distinct from executed work. |

## P1–P6 disposition

| Plan | Disposition |
|---|---|
| P1 Inputs and identity | Retain immutable originals, preview, profile versioning, explicit time/unit/support interpretation, duplicate detection, and source linkage. Correct the unsupported “named” wording. Add stable record ordinal/byte-offset diagnostics, clarify header/duplicate-header/extra-column behavior, and keep decode choices explicit. |
| P2 Data model | Retain separate reported, parsed, interpreted, annotated, and derived records; effective-dated station metadata; overlap review; and provenance. Ensure review/status history does not erase prior interpretation and clarify recovery between source-file storage and database registration. |
| P3 Review | Retain manual review and non-destructive prompts. Keep the prompts configurable and explicitly uncalibrated for these stations; do not import CoCoRaHS or USGS rules as local thresholds. Preserve the no-autocorrection and no stage-to-flow boundaries. |
| P4 Comparisons | Retain nearby/reference comparison and raw/interpretation visibility. Add the C2 temporal-support and aggregation rules; no implied causal, discharge, or flood-risk result. |
| P5 Components and operation | Retain local/offline constraints; SQLite and csv 1.4.0 remain candidates rather than validated product choices. Keep plot and time libraries open. Clarify C1 position limits, C4 transaction boundary, and C5 benchmark thresholds. Foreign keys must be enabled and verified on each connection. |
| P6 Output and acceptance | Retain the review package and uncertainty note. Apply C5’s portability distinction and add import interruption/recovery and CRLF/mismatched-row diagnostics to the proposed suite. All validation remains proposed; no application build, product test, benchmark, or fault injection was run in this critique. |

## Remaining questions for finalization

1. Which real volunteer export shapes, timestamp conventions, time zones, reporting periods, units, and missing-value tokens must the first profile support?
2. What is the station stage datum/reference and how will unknown datum be shown?
3. Which time-alignment and partial-window rules are acceptable for storm plots and rainfall summaries?
4. Must a review package carry original files to be considered portable?
5. What machine and measured responsiveness limits define the two-million-record acceptance target?
6. Does the implementation use byte-buffer Serde, and what exact policy applies to invalidly encoded text?

## Evidence and limits

The critique’s new public captures are listed and SHA-256-identified in the adjacent source-map.json under C01–C14. They include pinned csv 1.4.0 source fragments and manifests, the wrapper’s position/error path, the two public GitHub issue records, and the byte-buffer fix commit. The researcher’s original source-map.json and captured sources remain the source IDs S01–S19 for HydroShare, USGS, CoCoRaHS, W3C, ODM2, SQLite, and the Rust csv history.

Primary-source verification was read-only. The upstream issue bodies are reports, not local reproductions; no code was executed. No application, parser, benchmark, file recovery sequence, or product acceptance test was run. The critique is not the final plan revision.

