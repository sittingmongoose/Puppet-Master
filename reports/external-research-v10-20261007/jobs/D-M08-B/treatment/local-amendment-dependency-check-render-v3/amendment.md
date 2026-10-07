# Local amendments and critique dispositions

This is the treatment's local amendment record, completed before the separate dependency check. The supplied critique is treated as a candidate review, not as evaluator truth. No class schema, target grid, mask provenance, or raster data was supplied, so the recommendation does not invent those values.

1. **AMEND — categorical resampling.** Retain nearest-neighbor only as a proposed baseline when the product owner wants each output cell to sample a source class. The owner must select the policy per categorical band. Do not state it is universally correct or library-guaranteed. If the product means dominant class by output footprint, specify that aggregation and its tie rule separately.

2. **AMEND; INPUTS UNRESOLVED — classes and nodata.** Require the authoritative code-to-label mapping and explicit valid-code set; keep validity distinct from class identity. Treat a collision between a nodata sentinel and a legitimate class as unresolved until authoritative metadata or a mask resolves it. Do not claim the library guarantees the sentinel cannot appear in output; make output-domain and validity checks part of the proposed validation.

3. **ACCEPT — input masks, with condition retained.** Preserve the distinction between GDAL-style valid-data masks (nonzero means valid) and NumPy masked-array masks (True means invalid). Preserve the documented precedence of an existing .msk, dataset-wide alpha, or internal mask, and the conditional OR of band masks used by dataset_mask() when nodata drives it. State that dataset_mask() is dataset-wide, not an all-bands-valid rule; use it only when that product meaning is intended. Select per-band masks when the validity decision is per band.

4. **AMEND; POLICY AND OPERATION BEHAVIOR UNRESOLVED.** Keep sampling validity at the same source location as nearest-neighbor class sampling as one proposed policy, not asserted library behavior. Keep any-valid-contributor and all-valid-contributors as distinct alternatives. Require the product owner to choose. Validate the selected Rasterio operation's actual nodata/mask behavior on representative edge, external-mask, per-band-disagreement, and partially/wholly invalid-neighborhood cases before claiming such behavior.

5. **ACCEPT WITH CONDITION — output grid.** Retain the output-shape scaling factors for a same-CRS resize as a way to scale the existing grid to its existing footprint. State that dimensions and transform must be derived together. If desired bounds/alignment differ, define destination transform and shape together; if CRS changes, use a destination-grid reprojection workflow. Validate pixel corners and footprint.

6. **ACCEPT, OPTIONAL AND SEPARATE — continuous bands.** Preserve bilinear/cubic as possible choices for genuinely continuous bands, and average only when it serves the intended numerical goal. Choose per band; do not conflate this with categorical resampling.

7. **AMEND — disposition and test record.** Explicitly report each critique disposition, retain missing product inputs as conditions, and label all checks proposed unless they were actually executed. No data processing or tests were run in this treatment.

The final recommendation will carry these dispositions and conditions. The separate dependency-check record will verify every consequential amended claim and its affected dependency against the supplied primary captures before final rendering.
