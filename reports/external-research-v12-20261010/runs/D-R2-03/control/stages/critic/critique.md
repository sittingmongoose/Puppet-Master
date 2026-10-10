# Independent critique — ER12-D-R2-03-FRESH

**Run:** D-R2-03-control  
**Role:** independent critic  
**Reviewed:** the frozen brief, complete investigator discovery and draft, source map and index, revealed plan, and plan-reveal record. Primary-source checks are indexed under [sources/index.md](sources/index.md). No raw images, calibrations, target coordinates, code, logs, or measurements were supplied to this review.

## Assessment

The proposal preserves the central scientific distinction between a repeatable measured change, demonstrated photometric performance, and source-specific intrinsic variability. It treats rotation, reduction changes, comparison-star drift, atmosphere, background, timing, and astronomical variability as hypotheses with discriminating observations rather than findings. The archive-first gate is reasoned and provisional; it does not replace the instructor's unresolved priority decision. No material false correction or unsupported causal conclusion was found in the reviewed text.

One material brief obligation is not evidenced: the request to use the full 60-minute research window. The record documents a substantial plan and multiple sources, but not the elapsed research window. Two minor source/wording issues and the unresolved availability of actual case data are noted below. These findings do not authorize narrowing the brief or establish a cause.

## Findings

### CRIT-01 — Material incomplete: full research-window use is not demonstrated

**Locator:** `draft.md`, “Per-clause disposition of the original brief,” Request row beginning “Use the full 60-minute research window”; also “Validation status and evidence provenance.”

**Evidence:** The frozen brief and revealed plan both require use of the full 60-minute research window to prepare the proposal. The draft marks that clause addressed because the proposal covers all branches and says it does not claim a 60-minute image-analysis run. The request is for research time, not a 60-minute image-analysis experiment. The investigator source map records source-access times from 2026-10-10T06:59:56Z through 07:07:23Z, but neither it nor the draft records a start/end time, activity log, or other evidence that the full window was used. These records do not prove that the researcher stopped early; they leave fulfillment unverified.

**Assessment:** Materially incomplete as a fulfillment record for an explicit time-budget obligation. The stage record should state actual elapsed research time or preserve that it cannot be established. Do not substitute breadth of coverage for the time requirement.

### CRIT-02 — Minor wording: temporal-binning caveat is broader than the cited study

**Locator:** `draft.md`, “Mechanisms and discriminating observations,” atmosphere/comparison-field row; `draft.md`, “Comparison of useful routes,” optional comparison-star time-binning row; inherited source ID `DIFF-PHOTOMETRY-2023`.

**Evidence:** The paper's introduction describes temporal binning for good photometric conditions and systematics slower than cadence. It also says data affected by short high-frequency trends such as intermittent cirrus can be binned everywhere except those periods. The draft's phrase “do not apply it to fast cloud trends” reads as a blanket exclusion. Its later statement that binning “can wash out high-frequency trends” is appropriately cautious.

**Assessment:** Minor overstatement of a limitation, not a wrong central recommendation. Keep the method optional and clearly separate; a future revision could distinguish affected intervals from the rest of a suitable sequence.

### CRIT-03 — Minor locator: Lightkurve 2.5.0 link is a mutable release listing

**Locator:** investigator `source-map.json`, source ID `LIGHTKURVE-2.5.0`; source-map entry URL is the repository-wide `/releases` page, while the locator names v2.5.0.

**Evidence:** The official release page for v2.5.0 is available at the version-specific tag URL listed in this critic's source map. The version and locator in the investigator record do identify the intended release, so the substantive claim about version-specific reader/cadence/time fixes is not contradicted.

**Assessment:** Minor provenance/locator weakness only. Preserve `LIGHTKURVE-2.5.0`; an exact tag link would make later retrieval less dependent on the moving release list.

### CRIT-04 — Honestly unresolved external input: no case data or local history

**Locator:** `brief.md`, “Project situation” and “Still unresolved”; `draft.md`, “Uncertain” and “Validation status and evidence provenance.”

**Evidence:** The brief supplies no images, calibration frames, pipeline code, coordinates, confirmed catalog identity, exposure/timing history, weather record, or local instrument/reduction revision history. The proposal accordingly makes TESS coverage, archive replay, standards performance, and every empirical discriminator conditional or proposed. The source review confirms methodological precedent only; it cannot validate the synthetic case.

**Assessment:** Correctly unresolved, not a defect in the investigator's conclusions. Preserve this limitation in any later handoff.

## Obligation and plan review

| Brief or revealed-plan obligation | Critic assessment |
|---|---|
| Keep repeatable measurement, calibrated performance, and intrinsic variability separate. | Covered as three gates; none is claimed established. |
| Compare reduction/calibration, observing/comparison-field strategy, and independent/no-new-data routes. | Covered by archive replay, a conditional rotation crossover, and conditional MAST/TESS products. The external-data availability check is correctly proposed, not claimed run. |
| Explain orientation, detector position, exposure/timing, background, atmosphere, and comparison behavior without choosing a cause. | Covered with relevant variables and controls. The lit field remains a lead, not an explanation. |
| Investigate instrument/processing history and transferable operational detail. | Covered through versioned AIJ behavior, ccdproc defaults, the AAVSO guide, and instrument/pipeline examples. Their local applicability is explicitly limited; local history remains unknown. |
| Propose controls, provenance, independent comparisons, and a decision about further observation. | Covered by immutable-input manifests, historic replay, one-factor variants, check/standard stars, independent data, and a conditional pilot/decision rule. |
| Separate performed work from planned validation; preserve the no-discovery/no-operation/no-install/no-independent-replot boundaries. | Explicitly done. No photometry, period, significance, accuracy, telescope action, archive edit, installation, or validation is claimed. |
| Preserve the revealed plan's useful alternatives, multi-candidate/search-selection concerns, and non-empirical status. | Covered. The candidate-selection and correlated-noise discussion is more specific than the brief minimum and remains proposed. No predetermined winner is imposed. |
| Preserve the instructor's unresolved first objective. | Correctly left as an owner choice while presenting archive reliability as a provisional order, not a forced scope reduction. |
| Use the full 60-minute research window. | See CRIT-01: breadth is present, but elapsed use is not evidenced. |

## Scope of this critique

This is a critique, not an authority to choose the science objective, alter the plan, or rewrite the proposal. The two minor observations do not overturn the investigation design. The only material gap identified is the unverified full-window requirement. Proposed validations remain proposed, and unavailable case-specific facts remain unresolved. No final proposal was written or repaired in this stage.
