# Synthetic product brief: local calibrated 2D image/label viewer

Design a small desktop prototype for a scientist inspecting one local OME-NGFF 0.4 image dataset. The prototype is read-only. Input is a deliberately small two-dimensional multiscale image with exactly two resolutions and one optional categorical label image. Image and label arrays may have different shapes, level counts or metadata. The prototype must either justify the overlay alignment or withhold the overlay with an understandable reason. Calibration can include unequal axis scales and nonzero offsets; units or applicable calibration can be absent. These are synthetic product conditions, not assertions about what the format guarantees.

The requested deliverable is a research-backed revision of the accompanying thin plan, not implementation or a survey of the whole format. Investigate only behavior needed for this prototype. Do not extend to 3D, time series, cloud stores, authoring, segmentation, registration estimation or format conversion.

Three consequential research questions:

1. Which two existing viewer or analogous components provide useful precedents for this local read-only prototype, and what version-specific behaviors and constraints justify a minimal component choice?
2. What does the selected format/version actually require or permit for this input's axis/calibration interpretation, physical cursor coordinates, resolution switching and image/label association? Distinguish metadata declarations from an alignment guarantee.
3. What real implementation failure relevant to calibration, resolution switching or label alignment has a traceable issue → fix → test history, and what scoped engineering lesson and validation follow from that history?

Five product obligations, all required:

- B1: Specify the local input contract, version/support checks and read-only boundary, including behavior for absent optional labels and unsupported input.
- B2: Define physical cursor coordinates and a calibrated display/scale indication. Explain the version, conditions, metadata scope, units and fallback/withheld behavior on which the proposed interpretation depends.
- B3: Define resolution switching and optional categorical label overlay. Explicitly justify association, transform and sampling/alignment assumptions; give an actionable refusal state when those assumptions cannot be established.
- B4: Compare at least two independently discovered existing implementations/components, recommend one bounded approach with a concrete tradeoff, and investigate one real relevant issue → fix → test chain. Separate observed upstream behavior from inference and prototype choices.
- B5: Revise the thin plan into concrete steps covering B1–B4, with discriminating validation cases and visible limits. Identify unresolved consequential leads; do not assert that proposed tests were executed.

Discover and choose sources yourself from permitted public primary documentation and implementation repositories. No evaluator source list or supplied normative excerpt is part of this case. Cite exact versions/locators for consequential claims, acquire enough surrounding context to preserve conditions and exceptions, and label product choices explicitly. A missing obligation or unresolved consequential source dependency prevents a whole-case pass.
